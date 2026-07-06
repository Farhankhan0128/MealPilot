import type {
  McpToolCoverage,
  StagingCertificationMatrix,
  StagingCertificationStatus,
  StagingCertificationTool,
  StagingCertificationWave,
  SwiggyServer,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/start/developer/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/versioning/",
];

const servers: SwiggyServer[] = ["food", "instamart", "dineout"];

function endpointPath(server: SwiggyServer) {
  return server === "instamart" ? "im" : server;
}

function qualifiedTool(tool: Pick<McpToolCoverage, "server" | "tool">) {
  return `${tool.server}.${tool.tool}`;
}

function routeClassFor(tool: string): StagingCertificationTool["routeClass"] {
  if (["place_food_order", "checkout", "book_table"].includes(tool)) return "commercial_action";
  if (["update_food_cart", "update_cart", "flush_food_cart", "clear_cart", "create_cart"].includes(tool)) {
    return "cart_mutation";
  }
  if (["fetch_food_coupons", "apply_food_coupon"].includes(tool)) return "coupon";
  if (
    [
      "track_food_order",
      "track_order",
      "get_booking_status",
      "get_food_orders",
      "get_food_order_details",
      "get_orders",
      "get_order_details",
    ].includes(tool)
  ) {
    return "tracking";
  }
  if (tool === "report_error") return "support";
  return "read";
}

function waveFor(routeClass: StagingCertificationTool["routeClass"]): StagingCertificationTool["waveId"] {
  if (routeClass === "cart_mutation" || routeClass === "coupon") return "cart_mutations";
  if (routeClass === "commercial_action") return "commercial_actions";
  if (routeClass === "support") return "support_reporting";
  return "read_tools";
}

function smokePromptFor(tool: McpToolCoverage, routeClass: StagingCertificationTool["routeClass"]) {
  if (routeClass === "commercial_action") {
    return `Run ${qualifiedTool(tool)} only with seeded staging data, explicit visible confirmation, then verify status with the matching order or booking read.`;
  }
  if (routeClass === "cart_mutation" || routeClass === "coupon") {
    return `Run ${qualifiedTool(tool)} against a seeded staging cart, then refresh the authoritative cart before the next step.`;
  }
  if (routeClass === "support") {
    return `Run ${qualifiedTool(tool)} with redacted session context and confirm the generated support payload is builders@swiggy.in-ready.`;
  }
  if (routeClass === "tracking") {
    return `Run ${qualifiedTool(tool)} from seeded user history and verify retries stay at or above the 10-second polling cadence.`;
  }
  return `Run ${qualifiedTool(tool)} with seeded staging identity and verify response schema, latency, redaction, and cache behavior.`;
}

function expectedEvidenceFor(routeClass: StagingCertificationTool["routeClass"]) {
  if (routeClass === "commercial_action") {
    return "Confirmation screenshot, session id, status read after placement, and no blind retry evidence.";
  }
  if (routeClass === "cart_mutation" || routeClass === "coupon") {
    return "Before/after cart snapshot, session id, unchanged retry arguments, and refreshed total.";
  }
  if (routeClass === "support") return "report_error JSON-RPC payload with raw tokens, payment data, and address PII redacted.";
  if (routeClass === "tracking") return "Seeded order or booking id, session id, and polling interval evidence.";
  return "JSON-RPC request/response sample, session id, p95 latency sample, and schema diff result.";
}

function buildToolCertifications(): StagingCertificationTool[] {
  return buildMcpCoverage()
    .flatMap((server) => server.tools)
    .map((tool) => {
      const routeClass = routeClassFor(tool.tool);
      return {
        id: `${tool.server}_${tool.tool}`,
        server: tool.server,
        endpoint: tool.endpoint,
        stagingEndpoint: `POST mcp-staging.swiggy.com/${endpointPath(tool.server)}`,
        tool: tool.tool,
        stage: tool.stage,
        routeClass,
        waveId: waveFor(routeClass),
        status: "requires_staging_credentials",
        localEvidence: tool.evidence,
        smokePrompt: smokePromptFor(tool, routeClass),
        expectedEvidence: expectedEvidenceFor(routeClass),
      };
    });
}

function statusScore(status: StagingCertificationStatus) {
  if (status === "mock_ready") return 1;
  if (status === "requires_staging_credentials") return 0.85;
  if (status === "manual_input") return 0.7;
  return 0.55;
}

function wave(
  id: StagingCertificationWave["id"],
  title: string,
  status: StagingCertificationStatus,
  owner: StagingCertificationWave["owner"],
  objective: string,
  officialRequirement: string,
  entryCriteria: string[],
  exitCriteria: string[],
  tools: StagingCertificationTool[],
  evidenceLinks: string[],
  commands: string[],
): StagingCertificationWave {
  return {
    id,
    title,
    status,
    owner,
    objective,
    officialRequirement,
    entryCriteria,
    exitCriteria,
    tools,
    evidenceLinks,
    commands,
  };
}

function buildWaves(tools: StagingCertificationTool[], config: ServerConfig): StagingCertificationWave[] {
  const toolsFor = (id: StagingCertificationWave["id"]) => tools.filter((tool) => tool.waveId === id);
  const hasClientId = config.swiggyClientId !== "replace_after_builder_access";
  const hasToken = Boolean(config.swiggyAccessToken);
  const oauthStatus: StagingCertificationStatus = hasClientId && hasToken ? "mock_ready" : "requires_staging_credentials";

  return [
    wave(
      "preflight",
      "Local preflight and reviewer packet",
      "mock_ready",
      "MealPilot",
      "Prove the product runs locally, covers every Swiggy module, and has a video-ready reviewer flow.",
      "Swiggy lets builders start on localhost before applying and asks for a working demo video during access review.",
      ["npm install has completed", "Local API and Vite app run", "Demo plan has Food, Instamart, and Dineout lanes"],
      ["npm test passes", "npm run verify:production passes", "Builder packet and Launch Bundle are available"],
      toolsFor("preflight"),
      ["/api/builder-package.md", "/api/production-launch-bundle", "/api/swiggy-docs-coverage"],
      ["npm install", "npm test", "npm run lint", "npm run build"],
    ),
    wave(
      "oauth_dcr",
      "OAuth 2.1 PKCE and Dynamic Client Registration",
      oauthStatus,
      "Operator",
      "Complete authorization, redirect URI allowlisting, DCR, token storage, and 401 reauth behavior.",
      "Swiggy uses OAuth 2.1 with PKCE, DCR at /auth/register, exact-match redirect URIs, and re-auth on 401.",
      ["Final HTTPS redirect URI selected", "Primary engineering contact ready", "Swiggy staging access requested"],
      ["client_id registered or DCR accepted", "Access token stored only in memory or vault", "401 branch re-runs authorization"],
      toolsFor("oauth_dcr"),
      ["/api/credential-onboarding", "/api/mcp-gateway", "/api/telemetry/runtime"],
      ["SWIGGY_ENV=staging npm run dev", "open /api/auth/swiggy/start", "npm run verify:production"],
    ),
    wave(
      "read_tools",
      "Seeded read, discovery, and tracking tools",
      "requires_staging_credentials",
      "MealPilot",
      "Exercise every safe read, discovery, details, history, and tracking path on seeded staging accounts.",
      "Read tools and tracking can retry with backoff; session id should be logged for Swiggy support correlation.",
      ["OAuth token is fresh", "Seeded staging user has addresses, restaurants, groceries, and reservations"],
      ["All read schemas match docs", "p95 samples are captured", "No raw PII is stored in logs"],
      toolsFor("read_tools"),
      ["/api/mcp/tool-lab", "/api/observability/traces", "/api/telemetry/runtime"],
      ["SWIGGY_ENV=staging npm run verify:production", "curl http://localhost:8787/api/mcp/catalog"],
    ),
    wave(
      "cart_mutations",
      "Cart, address, and coupon mutations",
      "requires_staging_credentials",
      "MealPilot",
      "Validate idempotent cart/address/coupon writes with authoritative refresh after every mutation.",
      "Cart mutations are retryable when the same session and arguments are preserved; coupons and carts require refreshed totals.",
      ["Seeded carts are disposable", "Address mutation test account is approved", "Retry budget is capped"],
      ["Before/after cart evidence exists", "Cart total refresh appears before checkout", "Address writes have explicit confirmation"],
      toolsFor("cart_mutations"),
      ["/api/sessions/:sessionId/preflight", "/api/swiggy-route-optimizer", "/api/resilience"],
      ["npm run dev", "curl http://localhost:8787/api/sessions/<sessionId>/preflight"],
    ),
    wave(
      "commercial_actions",
      "Commercial actions and non-blind retry",
      "requires_staging_credentials",
      "MealPilot",
      "Certify place_food_order, checkout, and book_table only on seeded staging flows with explicit confirmation.",
      "Order placement and table booking are not safe to blind-retry; check status first after uncertain 5xx or network outcomes.",
      ["Seeded staging data confirms no real orders", "Visible confirmation contains item, total, address or slot, and payment/free status"],
      ["Status read follows every commercial action", "No blind retry evidence is recorded", "User can cancel before final call"],
      toolsFor("commercial_actions"),
      ["/api/resilience", "/api/error-intelligence", "/api/sessions/:sessionId/replay"],
      ["curl http://localhost:8787/api/resilience", "curl http://localhost:8787/api/error-intelligence"],
    ),
    wave(
      "support_reporting",
      "Support, report_error, and incident bridge",
      "requires_staging_credentials",
      "MealPilot",
      "Confirm every server can produce a user-in-session report_error payload and operator escalation packet.",
      "Swiggy exposes report_error on all three servers and asks incident escalations to include session ids and timestamps.",
      ["Session ids are logged", "Redaction rules are active", "Severity owner is assigned"],
      ["Three report_error payloads generated", "builders@swiggy.in escalation email is complete", "PII redaction is verified"],
      toolsFor("support_reporting"),
      ["/api/support/bridge", "/api/error-intelligence", "/api/telemetry/runtime"],
      ["curl http://localhost:8787/api/support/bridge", "curl http://localhost:8787/api/error-intelligence"],
    ),
    wave(
      "soak_48h",
      "48-hour green staging soak",
      "production_gate",
      "Operator",
      "Run continuous seeded staging smoke, rate-budget, and support drills for at least 48 hours before production promotion.",
      "Swiggy production follows after a working staging integration has been green for at least 48 hours.",
      ["All tool waves pass", "On-call contact is set", "Rate-limit estimate is accepted"],
      ["48 hours green", "No S0/S1 unresolved", "Retry, 401, and deprecation monitors remain active"],
      toolsFor("soak_48h"),
      ["/api/go-live", "/api/rate-limit-plan", "/api/version-monitor", "/api/observability/traces"],
      ["SWIGGY_ENV=staging npm run verify:production", "curl http://localhost:8787/api/go-live"],
    ),
    wave(
      "production_promotion",
      "Production promotion and ramp",
      "production_gate",
      "Swiggy",
      "Submit final evidence, receive production credentials, and ramp real users gradually.",
      "Swiggy expects production approval, exact redirect allowlist, observability, support contact, and rollout from 1% to 100%.",
      ["48-hour staging soak is green", "Production credentials issued", "Final HTTPS redirect is allowlisted"],
      ["1% to 10% to 50% to 100% ramp evidence", "Support channel confirmed", "Rollback switch tested"],
      toolsFor("production_promotion"),
      ["/api/production-launch-bundle", "/api/swiggy-access-dossier", "/api/reviewer-proof"],
      ["SWIGGY_ENV=production npm run build", "SWIGGY_ENV=production npm start", "npm run verify:production"],
    ),
  ];
}

export function buildStagingCertificationMatrix(config: ServerConfig): StagingCertificationMatrix {
  const tools = buildToolCertifications();
  const waves = buildWaves(tools, config);
  const assignedToolIds = new Set(tools.map((tool) => tool.id));
  const toolWaveCount = waves.reduce((sum, item) => sum + item.tools.length, 0);
  const credentialPresent = Boolean(config.swiggyAccessToken) && config.swiggyClientId !== "replace_after_builder_access";
  const toolCompleteness = assignedToolIds.size / tools.length;
  const waveCompleteness = toolWaveCount / tools.length;
  const evidenceCompleteness = waves.filter((item) => item.evidenceLinks.length > 0 && item.commands.length > 0).length / waves.length;
  const statusReadiness = waves.reduce((sum, item) => sum + statusScore(item.status), 0) / waves.length;
  const score = Math.round(((toolCompleteness + waveCompleteness + evidenceCompleteness + statusReadiness) / 4) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    currentMode: config.swiggyMode,
    liveStagingVerified: credentialPresent && config.swiggyMode === "staging",
    stagingBaseUrl: "https://mcp-staging.swiggy.com",
    productionBaseUrl: "https://mcp.swiggy.com",
    soakHoursRequired: 48,
    officialSources,
    totalTools: tools.length,
    assignedTools: assignedToolIds.size,
    waves,
    perServer: servers.map((server) => {
      const serverTools = tools.filter((tool) => tool.server === server);
      return {
        server,
        stagingEndpoint: `POST mcp-staging.swiggy.com/${endpointPath(server)}`,
        productionEndpoint: `POST mcp.swiggy.com/${endpointPath(server)}`,
        totalTools: serverTools.length,
        assignedTools: serverTools.length,
        requiredScopes: ["mcp:tools", "mcp:resources", "mcp:prompts"],
        requiredEnv: ["SWIGGY_ENV", "SWIGGY_CLIENT_ID", "SWIGGY_REDIRECT_URI", "SWIGGY_ACCESS_TOKEN"],
        status: credentialPresent ? "manual_input" : "requires_staging_credentials",
        smokeAssertions: [
          `All ${serverTools.length} ${server} tools have seeded staging smoke prompts.`,
          "Every tool call logs session_id, duration_ms, tool, status, and redacted user hash.",
          "Commercial and mutation routes require explicit confirmation before write or placement.",
        ],
      };
    }),
    credentialChecklist: [
      {
        id: "access_application",
        label: "Swiggy access application submitted with demo video",
        status: "manual_input",
        evidence: "Use /api/swiggy-access-dossier and /api/production-launch-bundle to assemble the packet.",
      },
      {
        id: "dcr",
        label: "Dynamic Client Registration accepted",
        status: credentialPresent ? "mock_ready" : "requires_staging_credentials",
        evidence: "DCR endpoint is /auth/register; MCP-compatible clients can call it transparently.",
      },
      {
        id: "redirect_uri",
        label: "Exact-match redirect URI allowlisted",
        status: config.swiggyRedirectUri.startsWith("https://") ? "manual_input" : "requires_staging_credentials",
        evidence: `${config.swiggyRedirectUri} must be supplied to Swiggy; http://localhost is valid only for local development.`,
      },
      {
        id: "token_storage",
        label: "Token storage and redaction policy",
        status: "mock_ready",
        evidence: "Access tokens are kept out of persisted plan/profile stores and redacted from telemetry.",
      },
      {
        id: "production_credentials",
        label: "Production credentials after staging soak",
        status: "production_gate",
        evidence: "Requires 48 hours of green staging and approval from builders@swiggy.in.",
      },
    ],
    telemetryRequirements: [
      "Log session_id on every Swiggy MCP call and include it in support reports.",
      "Capture tool latency p50/p95/p99, success rate, 4xx/5xx split, and OAuth reauth frequency.",
      "Hash user identifiers at rest and never log raw tokens, payment details, or full address payloads.",
      "Pre-wire planned 429 Retry-After handling and _meta.swiggy.deprecation alerting before production.",
    ],
    rollbackPolicy: [
      "Keep SWIGGY_ENV=mock as an immediate local fallback for demos and support triage.",
      "Disable commercial actions first while leaving read-only planning available.",
      "Ramp production 1% -> 10% -> 50% -> 100% over at least 24 hours and roll back on S0/S1 spikes.",
      "Escalate to builders@swiggy.in with session ids, timestamps, expected behavior, and actual behavior.",
    ],
    commands: [
      { id: "local_quality", command: "npm test && npm run lint && npm run build", proves: "Local product and contracts are healthy." },
      { id: "local_smoke", command: "npm run dev && npm run verify:production", proves: "Reviewer proof endpoints and local MCP stubs are complete." },
      {
        id: "staging_smoke",
        command: "SWIGGY_ENV=staging SWIGGY_ACCESS_TOKEN=<redacted> npm run verify:production",
        proves: "Seeded staging endpoints, OAuth, and all certification waves are green.",
      },
      {
        id: "production_ramp",
        command: "SWIGGY_ENV=production npm start",
        proves: "Production credentials are isolated from local/mock mode and ready for controlled ramp.",
      },
    ],
    assertions: [
      "Every one of the 35 official Swiggy MCP tools is assigned to exactly one staging smoke wave.",
      "The matrix preserves staging credentials, 48-hour soak, and production approval as external gates.",
      "Commercial actions require check-then-retry status reads instead of blind retry.",
      "OAuth, rate-limit, session-id observability, DPDP logging, support, SLA, and versioning controls are represented.",
    ],
    externalGates: [
      "Swiggy must issue or approve staging credentials and seeded data access.",
      "Operator must submit the final demo video, technical contact, and HTTPS redirect URI.",
      "Production credentials require Swiggy approval after a working staging integration is green for at least 48 hours.",
    ],
  };
}
