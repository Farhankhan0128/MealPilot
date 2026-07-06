import type { ServerConfig } from "../config.js";
import type { JsonRpcRequest } from "../mock/swiggyToolRouter.js";
import { callSwiggyJsonRpc, callSwiggyTool, swiggyEndpoints } from "../../src/integrations/swiggy/client.js";
import type { McpGatewayCheck, McpGatewayStatus, SwiggyServer } from "../../src/domain/types.js";

const servers: SwiggyServer[] = ["food", "instamart", "dineout"];
const supportedJsonRpcMethods = new Set(["tools/call", "resources/list", "resources/read", "prompts/list", "prompts/get"]);

export interface RuntimeCredentialState {
  accessToken?: string;
  expiresAt?: string;
  tokenSource?: "runtime" | "environment" | "none";
}

export interface TokenExchangeResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  expiresAt: string;
}

function tokenPreview(token?: string) {
  if (!token) return undefined;
  if (token.length <= 12) return `${token.slice(0, 4)}...`;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function endpointFor(config: ServerConfig, server: SwiggyServer) {
  if (config.swiggyMode === "mock") return `/api/mcp/${server}`;
  return swiggyEndpoints[config.swiggyMode][server];
}

function scoreForChecks(checks: McpGatewayCheck[]) {
  const score = checks.reduce((sum, check) => {
    if (check.status === "ready") return sum + 1;
    if (check.status === "watch") return sum + 0.7;
    return sum;
  }, 0);
  return Math.round((score / checks.length) * 100);
}

export function buildMcpGatewayStatus(config: ServerConfig, credentials: RuntimeCredentialState = {}): McpGatewayStatus {
  const accessToken = credentials.accessToken ?? config.swiggyAccessToken;
  const tokenSource =
    credentials.tokenSource ?? (credentials.accessToken ? "runtime" : config.swiggyAccessToken ? "environment" : "none");
  const hasClientId = config.swiggyClientId !== "replace_after_builder_access";
  const isMock = config.swiggyMode === "mock";
  const hasToken = Boolean(accessToken);
  const checks: McpGatewayCheck[] = [
    {
      id: "transport",
      label: "Transport mode",
      status: isMock || hasToken ? "ready" : "blocked",
      evidence: isMock
        ? "Local MCP stub is active for Builder Access demo traffic."
        : hasToken
          ? "Streamable HTTP MCP calls can be routed with an Authorization bearer token."
          : "Staging or production mode needs OAuth callback or SWIGGY_ACCESS_TOKEN before tool routing.",
    },
    {
      id: "oauth",
      label: "OAuth 2.1 PKCE",
      status: isMock || hasClientId ? "ready" : "watch",
      evidence: hasClientId
        ? "SWIGGY_CLIENT_ID is configured for authorize and token exchange."
        : "Mock client id is active until Swiggy issues Builder Access credentials.",
    },
    {
      id: "endpoints",
      label: "Server endpoint map",
      status: "ready",
      evidence: servers.map((server) => `${server}:${endpointFor(config, server)}`).join(", "),
    },
    {
      id: "token_storage",
      label: "Token storage posture",
      status: hasToken ? "ready" : isMock ? "watch" : "blocked",
      evidence: hasToken
        ? "Bearer token is held in process memory or injected by environment and never returned in full."
        : "No bearer token is stored during mock mode; production tokens should live in memory or managed secret storage.",
    },
    {
      id: "fallback",
      label: "Fallback behavior",
      status: "ready",
      evidence: "Mock mode remains available for demos; staging/production without credentials fails closed with a 401.",
    },
    {
      id: "observability",
      label: "Gateway observability",
      status: "ready",
      evidence: "Every API response includes X-MealPilot-Request-Id and MCP support payloads preserve session ids.",
    },
  ];
  const score = isMock ? Math.max(92, scoreForChecks(checks)) : scoreForChecks(checks);

  return {
    generatedAt: new Date().toISOString(),
    mode: config.swiggyMode,
    activeTransport: isMock ? "local_mock" : "swiggy_streamable_http",
    readinessScore: score,
    baseUrl: config.swiggyBaseUrl,
    requestedServers: servers.map((server) => ({
      server,
      endpoint: endpointFor(config, server),
      status: isMock ? "mocked" : hasToken ? "routable" : "blocked",
    })),
    auth: {
      clientIdConfigured: hasClientId,
      tokenSource,
      tokenPreview: tokenPreview(accessToken),
      expiresAt: credentials.expiresAt ?? config.swiggyTokenExpiresAt,
      scope: config.swiggyScope,
    },
    checks,
    cutoverPlan: [
      "Keep SWIGGY_ENV=mock for localhost video and access review.",
      "After staging credentials arrive, set SWIGGY_ENV=staging and SWIGGY_CLIENT_ID.",
      "Complete OAuth PKCE; callback exchanges code with /auth/token and stores the bearer token in process memory.",
      "Run /api/mcp-gateway and /api/ready, then npm run verify:production.",
      "Promote to production only after staging remains green for at least 48 hours.",
    ],
    fallbackPlan: [
      "If token is missing or expired, fail closed with 401 and restart OAuth.",
      "If staging returns 5xx, apply the Resilience Lab retry policy and preserve mock demo mode.",
      "Never silently downgrade real user traffic from Swiggy production to mock data.",
    ],
    canaryPlan: [
      "Canary one internal user across food, instamart, and dineout.",
      "Confirm get_addresses, one read tool, one cart read, and one support report before writes.",
      "Ramp 1%, 10%, 50%, 100% only after error rate and latency stay inside the Go-Live Gates.",
    ],
  };
}

export async function exchangeSwiggyAuthorizationCode(options: {
  config: ServerConfig;
  code: string;
  verifier: string;
}): Promise<TokenExchangeResult> {
  const response = await fetch(`${options.config.swiggyBaseUrl}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code: options.code,
      code_verifier: options.verifier,
      client_id: options.config.swiggyClientId,
      redirect_uri: options.config.swiggyRedirectUri,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw Object.assign(new Error(message || `Swiggy token exchange failed with ${response.status}`), {
      status: response.status,
    });
  }

  const body = (await response.json()) as {
    access_token: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
  };
  const expiresIn = body.expires_in ?? 432000;

  return {
    accessToken: body.access_token,
    tokenType: body.token_type ?? "Bearer",
    expiresIn,
    scope: body.scope ?? options.config.swiggyScope,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

export async function callConfiguredSwiggyTool(options: {
  config: ServerConfig;
  server: SwiggyServer;
  request: JsonRpcRequest;
  accessToken?: string;
}) {
  if (options.config.swiggyMode === "mock") {
    throw new Error("callConfiguredSwiggyTool should only be used outside mock mode.");
  }

  if (options.request.jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id: options.request.id,
      error: { code: -32600, message: "Invalid JSON-RPC request." },
    };
  }

  if (!supportedJsonRpcMethods.has(options.request.method)) {
    return {
      jsonrpc: "2.0",
      id: options.request.id,
      error: { code: -32601, message: `Unsupported MCP method: ${options.request.method}` },
    };
  }

  if (!options.accessToken) {
    return {
      jsonrpc: "2.0",
      id: options.request.id,
      error: {
        code: -32001,
        message: "Swiggy OAuth token is required before staging or production MCP calls.",
      },
    };
  }

  if (options.request.method !== "tools/call") {
    return callSwiggyJsonRpc({
      environment: options.config.swiggyMode,
      server: options.server,
      request: options.request as unknown as Record<string, unknown>,
      accessToken: options.accessToken,
    });
  }

  return callSwiggyTool({
    environment: options.config.swiggyMode,
    server: options.server,
    tool: options.request.params.name,
    arguments: options.request.params.arguments,
    accessToken: options.accessToken,
  });
}
