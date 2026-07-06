import type { ServerConfig } from "../config.js";
import type {
  SwiggyHandshakeDoctor,
  SwiggyHandshakeProbe,
  SwiggyHandshakeProbeStatus,
  SwiggyServer,
} from "../../src/domain/types.js";
import { swiggyEndpoints } from "../../src/integrations/swiggy/client.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/start/developer/",
  "https://mcp.swiggy.com/builders/docs/reference/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
];

type ProbeMethod = "GET" | "OPTIONS";

export interface RawHandshakeProbe {
  statusCode?: number;
  contentType?: string;
  durationMs: number;
  ok: boolean;
  error?: string;
  bodyPreview?: unknown;
}

export type SwiggyHandshakeProbeFn = (url: string, method: ProbeMethod) => Promise<RawHandshakeProbe>;

const endpointPath: Record<SwiggyServer, "/food" | "/im" | "/dineout"> = {
  food: "/food",
  instamart: "/im",
  dineout: "/dineout",
};

function endpointFor(config: ServerConfig, server: SwiggyServer) {
  if (config.swiggyMode === "mock") return `https://mcp.swiggy.com${endpointPath[server]}`;
  return swiggyEndpoints[config.swiggyMode][server];
}

function statusForProbe(raw: RawHandshakeProbe, successCodes: number[] = [200, 204]): SwiggyHandshakeProbeStatus {
  if (!raw.statusCode) return "blocked";
  if (successCodes.includes(raw.statusCode)) return "ready";
  if ([401, 403, 404, 405].includes(raw.statusCode)) return "watch";
  return raw.ok ? "watch" : "blocked";
}

function scoreFor(probes: SwiggyHandshakeProbe[]) {
  const weighted = probes.reduce((sum, probe) => {
    if (probe.status === "ready") return sum + 1;
    if (probe.status === "watch") return sum + 0.65;
    return sum;
  }, 0);
  return Math.round((weighted / probes.length) * 100);
}

function bodyHasOAuthPkceSignals(body: unknown) {
  if (!body || typeof body !== "object") return false;
  const metadata = body as Record<string, unknown>;
  return (
    typeof metadata.authorization_endpoint === "string" &&
    typeof metadata.token_endpoint === "string" &&
    Array.isArray(metadata.scopes_supported) &&
    metadata.scopes_supported.includes("mcp:tools") &&
    Array.isArray(metadata.code_challenge_methods_supported) &&
    metadata.code_challenge_methods_supported.includes("S256")
  );
}

function summarizeBody(body: unknown) {
  if (!body || typeof body !== "object") return "No JSON metadata returned.";
  const metadata = body as Record<string, unknown>;
  const keys = Object.keys(metadata).slice(0, 6);
  return keys.length ? `JSON metadata keys: ${keys.join(", ")}.` : "JSON metadata object returned.";
}

async function defaultProbe(url: string, method: ProbeMethod): Promise<RawHandshakeProbe> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: method === "OPTIONS" ? { "Access-Control-Request-Method": "POST" } : undefined,
    });
    const contentType = response.headers.get("content-type") ?? undefined;
    const bodyPreview =
      method === "GET" && contentType?.includes("application/json")
        ? await response.json().catch(() => undefined)
        : undefined;

    return {
      statusCode: response.status,
      contentType,
      durationMs: Date.now() - startedAt,
      ok: response.ok,
      bodyPreview,
    };
  } catch (error) {
    return {
      durationMs: Date.now() - startedAt,
      ok: false,
      error: error instanceof Error ? error.message : "unknown fetch failure",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function makeProbe(args: {
  id: string;
  label: string;
  url: string;
  method: ProbeMethod;
  raw: RawHandshakeProbe;
  status: SwiggyHandshakeProbeStatus;
  expectedSignal: string;
  userSafeEvidence: string;
  nextAction: string;
  server?: SwiggyServer;
}): SwiggyHandshakeProbe {
  return {
    id: args.id,
    label: args.label,
    server: args.server,
    url: args.url,
    method: args.method,
    status: args.status,
    statusCode: args.raw.statusCode,
    durationMs: args.raw.durationMs,
    contentType: args.raw.contentType,
    expectedSignal: args.expectedSignal,
    userSafeEvidence: args.userSafeEvidence,
    nextAction: args.nextAction,
  };
}

export async function buildSwiggyHandshakeDoctor(
  config: ServerConfig,
  probe: SwiggyHandshakeProbeFn = defaultProbe,
): Promise<SwiggyHandshakeDoctor> {
  const baseUrl = config.swiggyMode === "mock" ? "https://mcp.swiggy.com" : config.swiggyBaseUrl;
  const authMetadataUrl = `${baseUrl}/.well-known/oauth-authorization-server`;
  const protectedResourceUrl = `${baseUrl}/.well-known/oauth-protected-resource`;
  const authMetadata = await probe(authMetadataUrl, "GET");
  const protectedResource = await probe(protectedResourceUrl, "GET");
  const endpointProbes = await Promise.all(
    (["food", "instamart", "dineout"] as SwiggyServer[]).map(async (server) => ({
      server,
      endpoint: endpointFor(config, server),
      raw: await probe(endpointFor(config, server), "OPTIONS"),
    })),
  );

  const authReady = authMetadata.ok && bodyHasOAuthPkceSignals(authMetadata.bodyPreview);
  const probes: SwiggyHandshakeProbe[] = [
    makeProbe({
      id: "oauth_authorization_metadata",
      label: "OAuth authorization metadata",
      url: authMetadataUrl,
      method: "GET",
      raw: authMetadata,
      status: authReady ? "ready" : statusForProbe(authMetadata),
      expectedSignal: "HTTP 200 JSON with authorization_endpoint, token_endpoint, mcp scopes, and S256 PKCE.",
      userSafeEvidence: authReady
        ? summarizeBody(authMetadata.bodyPreview)
        : authMetadata.error ?? `Returned ${authMetadata.statusCode ?? "no"} status.`,
      nextAction: authReady
        ? "Use this metadata in OAuth startup and AI-client config validation."
        : "Keep localhost in mock mode and retry this probe before staging OAuth.",
    }),
    makeProbe({
      id: "oauth_protected_resource_metadata",
      label: "OAuth protected resource metadata",
      url: protectedResourceUrl,
      method: "GET",
      raw: protectedResource,
      status: protectedResource.statusCode === 200 ? "ready" : "watch",
      expectedSignal: "Protected-resource metadata should eventually disclose bearer-resource requirements.",
      userSafeEvidence:
        protectedResource.statusCode === 200
          ? summarizeBody(protectedResource.bodyPreview)
          : `Current public probe returns ${protectedResource.statusCode ?? protectedResource.error ?? "no status"}; treat as Swiggy-side watch signal.`,
      nextAction:
        protectedResource.statusCode === 200
          ? "Record metadata in the credential packet."
          : "Ask Swiggy to confirm the protected-resource metadata URL during Builder Access review.",
    }),
    ...endpointProbes.map(({ server, endpoint, raw }) =>
      makeProbe({
        id: `${server}_streamable_http_endpoint`,
        label: `${server} streamable HTTP endpoint`,
        server,
        url: endpoint,
        method: "OPTIONS",
        raw,
        status: statusForProbe(raw, [200, 204, 401, 405]),
        expectedSignal: "Endpoint exists and rejects or accepts only safe transport probes without executing tools.",
        userSafeEvidence: raw.statusCode
          ? `Safe OPTIONS probe returned HTTP ${raw.statusCode}; no tool call or bearer token was sent.`
          : raw.error ?? "No response received.",
        nextAction:
          raw.statusCode && [200, 204, 401, 405].includes(raw.statusCode)
            ? "Proceed to credentialed staging with a read-only first tool call."
            : "Keep this route in mock mode until Swiggy endpoint reachability is confirmed.",
      }),
    ),
  ];
  const readyProbes = probes.filter((item) => item.status === "ready").length;
  const watchProbes = probes.filter((item) => item.status === "watch").length;
  const blockedProbes = probes.filter((item) => item.status === "blocked").length;

  return {
    generatedAt: new Date().toISOString(),
    mode: config.swiggyMode,
    score: scoreFor(probes),
    officialSources,
    baseUrl,
    totals: {
      probes: probes.length,
      ready: readyProbes,
      watch: watchProbes,
      blocked: blockedProbes,
      liveHttpCalls: probes.length,
    },
    authMetadata: {
      url: authMetadataUrl,
      status: authReady ? "ready" : statusForProbe(authMetadata),
      issuer: typeof (authMetadata.bodyPreview as Record<string, unknown> | undefined)?.issuer === "string"
        ? ((authMetadata.bodyPreview as Record<string, unknown>).issuer as string)
        : undefined,
      scopes: Array.isArray((authMetadata.bodyPreview as Record<string, unknown> | undefined)?.scopes_supported)
        ? ((authMetadata.bodyPreview as Record<string, unknown>).scopes_supported as string[])
        : [],
      pkceS256: bodyHasOAuthPkceSignals(authMetadata.bodyPreview),
      dynamicClientRegistration:
        typeof (authMetadata.bodyPreview as Record<string, unknown> | undefined)?.registration_endpoint === "string",
    },
    serverEndpoints: endpointProbes.map(({ server, endpoint, raw }) => ({
      server,
      endpoint,
      expectedPath: endpointPath[server],
      status: statusForProbe(raw, [200, 204, 401, 405]),
      safeProbe: "OPTIONS",
    })),
    probes,
    credentialBoundaries: [
      "This doctor never sends bearer tokens and never invokes tools/call.",
      "HTTP 401 or 405 on an MCP endpoint can still prove the route exists; credentials are required for live tool execution.",
      "Commercial actions stay behind MealPilot confirmations after OAuth succeeds.",
      "Protected-resource metadata is tracked as a Swiggy-side watch signal until it returns structured JSON.",
    ],
    operatorRunbook: [
      {
        sequence: 1,
        label: "Run handshake doctor",
        command: "curl -fsS http://localhost:8787/api/swiggy-handshake-doctor",
        proves: "OAuth metadata, endpoint paths, and credential boundaries without touching user data.",
      },
      {
        sequence: 2,
        label: "Start OAuth only after access",
        command: "open http://localhost:8787/api/auth/swiggy/start",
        proves: "PKCE startup uses discovered metadata and configured redirect URI.",
      },
      {
        sequence: 3,
        label: "Run first read-only probes",
        command: "curl -fsS http://localhost:8787/api/swiggy-staging-credential-drill",
        proves: "Food, Instamart, and Dineout can each perform one credentialed read before writes.",
      },
    ],
    assertions: [
      "Food must map to /food, Instamart to /im, and Dineout to /dineout.",
      "Authorization metadata must include mcp:tools, mcp:resources, mcp:prompts, and S256 PKCE before OAuth launch.",
      "Handshake probes must never include Authorization headers, raw tokens, or tools/call payloads.",
      "Endpoint reachability is necessary but not sufficient for production; staging credentials and seeded data remain external gates.",
    ],
  };
}
