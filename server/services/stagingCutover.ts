import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyServer,
  SwiggyStagingCutoverCheck,
  SwiggyStagingCutoverProbe,
  SwiggyStagingCutoverRehearsal,
} from "../../src/domain/types.js";
import { swiggyEndpoints } from "../../src/integrations/swiggy/client.js";
import { buildMcpGatewayStatus, type RuntimeCredentialState } from "./mcpGateway.js";

const servers: SwiggyServer[] = ["food", "instamart", "dineout"];

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/start/developer/",
  "https://mcp.swiggy.com/builders/docs/start/developer/build-an-agent/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function serverEndpoint(config: ServerConfig, server: SwiggyServer) {
  if (config.swiggyMode === "mock") return `/api/mcp/${server}`;
  return swiggyEndpoints[config.swiggyMode][server];
}

function firstTool(server: SwiggyServer) {
  if (server === "dineout") return "get_saved_locations";
  return "get_addresses";
}

function firstArguments() {
  return {};
}

function statusFromBoolean(value: boolean, gate = false): SwiggyStagingCutoverCheck["status"] {
  if (value) return "ready";
  return gate ? "external_gate" : "watch";
}

function check(input: SwiggyStagingCutoverCheck): SwiggyStagingCutoverCheck {
  return input;
}

function buildProbes(config: ServerConfig, hasToken: boolean, latestPlan?: MealPlan): SwiggyStagingCutoverProbe[] {
  const isMock = config.swiggyMode === "mock";
  const transport = isMock ? "local_mock" : "swiggy_streamable_http";

  return servers.map((server) => {
    const tool = firstTool(server);
    return {
      id: `${server}_first_call`,
      server,
      endpoint: serverEndpoint(config, server),
      firstTool: tool,
      transport,
      status: isMock ? "ready" : hasToken ? "ready" : "blocked",
      dryRunRequest: {
        jsonrpc: "2.0",
        id: `staging-cutover-${server}`,
        method: "tools/call",
        params: {
          name: tool,
          arguments: firstArguments(),
        },
      },
      expectedSuccessShape:
        server === "dineout"
          ? "{ success: true, data: SavedLocation[] } before search_restaurants_dineout"
          : "{ success: true, data: SavedAddress[] } before discovery, cart, or checkout",
      promotionEvidence: [
        latestPlan ? `Latest local plan ${latestPlan.id} already exercises ${server}.` : "Run /api/plan before final video.",
        "Capture request id, session id, latency, status, and redacted tool name in telemetry.",
        "Run one read, one cart read where available, and one support report before any commercial action.",
      ],
      failureBranches: [
        { status: "401", action: "Stop, re-run OAuth, and never retry with the same bearer token." },
        { status: "429", action: "Honor Retry-After once Swiggy ships MCP-layer rate limits." },
        { status: "5xx", action: "Use exponential backoff only for safe reads or cart mutations." },
        { status: "network", action: "For commercial actions, check order or booking status before retrying." },
        { status: "jsonrpc_error", action: "Classify message/error code, emit support packet, and keep user-visible state unchanged." },
      ],
    };
  });
}

function buildOauthChecks(config: ServerConfig, credentials: RuntimeCredentialState): SwiggyStagingCutoverCheck[] {
  const hasClientId = config.swiggyClientId !== "replace_after_builder_access";
  const hasToken = Boolean(credentials.accessToken ?? config.swiggyAccessToken);
  const httpsOrLocalhost =
    config.swiggyRedirectUri.startsWith("https://") || config.swiggyRedirectUri.startsWith("http://localhost");

  return [
    check({
      id: "dcr_or_client",
      label: "Client identity",
      status: statusFromBoolean(hasClientId || config.swiggyMode === "mock", config.swiggyMode !== "mock"),
      requirement: "Use Dynamic Client Registration or Swiggy-issued client_id before staging calls.",
      evidence: hasClientId ? "SWIGGY_CLIENT_ID is configured." : "Mock client id remains in local review mode.",
      nextAction: hasClientId ? "Keep client id secret and proceed to PKCE." : "Complete DCR or wait for Swiggy staging access.",
    }),
    check({
      id: "redirect_uri",
      label: "Redirect URI",
      status: statusFromBoolean(httpsOrLocalhost),
      requirement: "Redirect URI must exact-match and be HTTPS outside localhost.",
      evidence: config.swiggyRedirectUri,
      nextAction: config.swiggyRedirectUri.startsWith("https://")
        ? "Submit this redirect URI for allowlisting."
        : "Replace localhost with the final HTTPS redirect before production approval.",
    }),
    check({
      id: "pkce",
      label: "PKCE S256",
      status: "ready",
      requirement: "Authorization code flow must use verifier, S256 challenge, state, and 120-second single-use code.",
      evidence: "/api/auth/swiggy/start creates state, verifier, challenge and /api/auth/swiggy/callback exchanges once.",
      nextAction: "Run OAuth in staging once credentials are issued.",
    }),
    check({
      id: "scope",
      label: "MCP scopes",
      status: config.swiggyScope.includes("mcp:tools") ? "ready" : "blocked",
      requirement: "Request mcp:tools, and mcp:resources/mcp:prompts when widgets/resources/prompts are used.",
      evidence: config.swiggyScope,
      nextAction: "Keep all v1 scopes requested uniformly for Food, Instamart, and Dineout.",
    }),
    check({
      id: "token",
      label: "Bearer token",
      status: hasToken ? "ready" : config.swiggyMode === "mock" ? "watch" : "blocked",
      requirement: "Staging and production MCP calls require Authorization: Bearer <token>.",
      evidence: hasToken ? "Runtime has a redacted bearer-token source." : "No live bearer token is present.",
      nextAction: hasToken ? "Proceed to first read-only smoke calls." : "Complete OAuth before staging smoke.",
    }),
  ];
}

function buildTransportChecks(config: ServerConfig, credentials: RuntimeCredentialState): SwiggyStagingCutoverCheck[] {
  const gateway = buildMcpGatewayStatus(config, credentials);
  const hasToken = Boolean(credentials.accessToken ?? config.swiggyAccessToken);

  return [
    check({
      id: "server_endpoints",
      label: "Three server endpoints",
      status: "ready",
      requirement: "Food, Instamart, and Dineout must stay independent per URL.",
      evidence: gateway.requestedServers.map((server) => `${server.server}:${server.endpoint}`).join(", "),
      nextAction: "Keep server state separate and never cross-use carts or bookings.",
    }),
    check({
      id: "streamable_http",
      label: "Streamable HTTP",
      status: config.swiggyMode === "mock" || hasToken ? "ready" : "blocked",
      requirement: "Use standard JSON-RPC tools/call over Swiggy Streamable HTTP with bearer auth.",
      evidence: `/api/mcp/:server routes to ${gateway.activeTransport}.`,
      nextAction: "Set SWIGGY_ENV=staging and complete OAuth for live traffic.",
    }),
    check({
      id: "fail_closed",
      label: "Fail closed",
      status: "ready",
      requirement: "Never silently downgrade real user traffic from Swiggy production to mock data.",
      evidence: "Non-mock /api/mcp/:server returns 401 when no runtime token exists.",
      nextAction: "Keep mock mode only for local review and demo videos.",
    }),
    check({
      id: "first_reads",
      label: "First read smoke",
      status: "ready",
      requirement: "Begin staging smoke with saved-address/location reads before discovery or cart writes.",
      evidence: "Cutover probes start with get_addresses for Food/Instamart and get_saved_locations for Dineout.",
      nextAction: "Run these probes against seeded staging accounts once issued.",
    }),
    check({
      id: "telemetry",
      label: "Telemetry capture",
      status: "ready",
      requirement: "Log request id, session id, tool, duration, status, and hashed user context without raw PII.",
      evidence: "/api/telemetry/runtime and /api/observability/traces expose redacted request and span data.",
      nextAction: "Attach telemetry excerpt to Swiggy support packet if a smoke call fails.",
    }),
  ];
}

function buildPromotionChecks(config: ServerConfig, latestPlan?: MealPlan): SwiggyStagingCutoverCheck[] {
  const hasPlan = Boolean(latestPlan);
  return [
    check({
      id: "local_video",
      label: "Local demo video",
      status: "ready",
      requirement: "Record a short localhost end-to-end agent flow before access review.",
      evidence: "Demo script, Launch Bundle, Scenario Runner, and Staging Transcript Export are ready for recording.",
      nextAction: "Add Loom, Drive, or unlisted YouTube URL to the final access submission.",
    }),
    check({
      id: "seeded_staging",
      label: "Seeded staging data",
      status: "external_gate",
      requirement: "Validate real seeded Food, Instamart, and Dineout accounts after Swiggy issues staging credentials.",
      evidence: "Local smoke cannot prove live seeded Swiggy data without credentials.",
      nextAction: "Run npm run verify:production with SWIGGY_ENV=staging after OAuth completes.",
    }),
    check({
      id: "green_48h",
      label: "48-hour green window",
      status: "external_gate",
      requirement: "Staging must stay green for at least 48 hours before production promotion.",
      evidence: "/api/staging-certification-matrix defines the soak waves and telemetry windows.",
      nextAction: "Collect two days of telemetry after staging credentials are issued.",
    }),
    check({
      id: "plan_evidence",
      label: "Session evidence",
      status: hasPlan ? "ready" : "watch",
      requirement: "Final reviewer packet should include one current three-server session.",
      evidence: latestPlan ? `${latestPlan.id} covers Food, Instamart, and Dineout.` : "No current plan was available when this report was generated.",
      nextAction: hasPlan ? "Export staging transcript for this session." : "Create a plan before recording the final video.",
    }),
    check({
      id: "production_credentials",
      label: "Production credentials",
      status: "external_gate",
      requirement: "Production access is issued after Swiggy review and green staging.",
      evidence: "Production client id, redirect allowlist, and credentials are not locally self-service.",
      nextAction: "Submit access form and await Swiggy approval.",
    }),
  ];
}

function score(checks: SwiggyStagingCutoverCheck[], probes: SwiggyStagingCutoverProbe[]) {
  const checkScore = checks.reduce((sum, item) => {
    if (item.status === "ready") return sum + 1;
    if (item.status === "watch") return sum + 0.72;
    if (item.status === "external_gate") return sum + 0.55;
    return sum;
  }, 0);
  const probeScore = probes.reduce((sum, item) => {
    if (item.status === "ready") return sum + 1;
    if (item.status === "external_gate") return sum + 0.55;
    return sum + 0.25;
  }, 0);
  return Math.round(((checkScore + probeScore) / (checks.length + probes.length)) * 100);
}

export function buildSwiggyStagingCutoverRehearsal(options: {
  config: ServerConfig;
  credentials?: RuntimeCredentialState;
  latestPlan?: MealPlan;
}): SwiggyStagingCutoverRehearsal {
  const credentials = options.credentials ?? {};
  const gateway = buildMcpGatewayStatus(options.config, credentials);
  const hasToken = Boolean(credentials.accessToken ?? options.config.swiggyAccessToken);
  const probes = buildProbes(options.config, hasToken, options.latestPlan);
  const oauthChecks = buildOauthChecks(options.config, credentials);
  const transportChecks = buildTransportChecks(options.config, credentials);
  const promotionChecks = buildPromotionChecks(options.config, options.latestPlan);
  const checks = [...oauthChecks, ...transportChecks, ...promotionChecks];
  const routableServers = gateway.requestedServers.filter((server) => server.status !== "blocked").length;
  const blockedServers = gateway.requestedServers.filter((server) => server.status === "blocked").length;

  return {
    generatedAt: new Date().toISOString(),
    score: score(checks, probes),
    officialSources,
    mode: options.config.swiggyMode,
    activeTransport: gateway.activeTransport,
    credentialState: {
      clientIdConfigured: gateway.auth.clientIdConfigured,
      tokenSource: gateway.auth.tokenSource,
      tokenExpiresAt: gateway.auth.expiresAt,
      scope: gateway.auth.scope,
      redirectUri: options.config.swiggyRedirectUri,
    },
    totalServers: servers.length,
    routableServers,
    blockedServers,
    dryRunCalls: probes.length,
    probes,
    oauthChecks,
    transportChecks,
    promotionChecks,
    supportPacket: {
      to: "builders@swiggy.in",
      subject: "MealPilot staging cutover support packet",
      requiredFields: ["environment", "server", "tool", "request_id", "session_id", "timestamp", "status", "redacted_error"],
      bodyPreview:
        "Environment: staging\nServer: food|instamart|dineout\nTool: <tool>\nRequest ID: <X-MealPilot-Request-Id>\nSession ID: <Swiggy/MealPilot session>\nObserved failure: <redacted>\nEvidence: /api/telemetry/runtime and /api/observability/traces",
    },
    commands: [
      { id: "local", command: "npm test -- --run && npm run lint && npm run build", proves: "Local contracts and UI compile before staging." },
      {
        id: "mock_smoke",
        command: "npm start && npm run verify:production",
        proves: "Production-style local server exposes all reviewer endpoints and mock MCP routes.",
      },
      {
        id: "staging_env",
        command: "SWIGGY_ENV=staging SWIGGY_CLIENT_ID=<issued> SWIGGY_REDIRECT_URI=<https-callback> npm start",
        proves: "Gateway points at Swiggy staging endpoints and requires OAuth.",
      },
      {
        id: "first_call",
        command:
          "curl -X POST http://localhost:8787/api/mcp/food -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"id\":\"smoke\",\"method\":\"tools/call\",\"params\":{\"name\":\"get_addresses\",\"arguments\":{}}}'",
        proves: "Food staging can execute the first read-only tool through MealPilot's gateway after OAuth.",
      },
      {
        id: "support",
        command: "curl http://localhost:8787/api/mcp/staging-cutover",
        proves: "Cutover rehearsal and support packet are current.",
      },
    ],
    assertions: [
      "All three Swiggy servers have a first read-only staging probe before any cart mutation or commercial action.",
      "Non-mock MCP traffic fails closed without a bearer token and never silently falls back to mock data.",
      "401 requires OAuth re-auth; 429 honors Retry-After once Swiggy ships MCP-layer rate limits.",
      "Commercial actions use check-then-retry with get_food_orders, get_orders, or get_booking_status after ambiguous failures.",
      "Production promotion remains gated on Swiggy staging credentials, 48-hour green telemetry, and production approval.",
    ],
    externalGates: [
      "Swiggy must issue staging credentials or DCR/client approval before live endpoint verification.",
      "Seeded staging data and a 48-hour green soak are required before production promotion.",
      "Production client identity, exact-match HTTPS redirect allowlist, and final access approval remain Swiggy-controlled.",
      "Final demo video URL and primary technical contact must be supplied by the operator before form submission.",
    ],
  };
}
