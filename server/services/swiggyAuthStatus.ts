import type { ServerConfig } from "../config.js";
import type { McpGatewayStatus, SwiggyAuthLatestEvent, SwiggyAuthStatusReport } from "../../src/domain/types.js";

export type AuthLifecycleEvent = Omit<SwiggyAuthLatestEvent, "tokenSource"> & {
  tokenSource?: "runtime" | "environment" | "none";
};

function previewState(state?: string) {
  if (!state) return undefined;
  if (state.length <= 10) return `${state.slice(0, 4)}...`;
  return `${state.slice(0, 6)}...${state.slice(-4)}`;
}

function defaultEvent(gatewayAuth: McpGatewayStatus["auth"]): SwiggyAuthLatestEvent {
  return {
    status: gatewayAuth.tokenSource === "none" ? "not_started" : "callback_exchanged",
    label: gatewayAuth.tokenSource === "none" ? "No OAuth callback completed" : "Token available",
    tokenSource: gatewayAuth.tokenSource,
    expiresAt: gatewayAuth.expiresAt,
    scope: gatewayAuth.scope,
  };
}

export function buildSwiggyAuthStatusReport(options: {
  config: ServerConfig;
  gatewayAuth: McpGatewayStatus["auth"];
  pendingVerifierCount: number;
  latestEvent?: AuthLifecycleEvent;
}): SwiggyAuthStatusReport {
  const latestEvent = options.latestEvent
    ? {
        ...options.latestEvent,
        statePreview: previewState(options.latestEvent.statePreview),
        tokenSource: options.latestEvent.tokenSource ?? options.gatewayAuth.tokenSource,
        expiresAt: options.latestEvent.expiresAt ?? options.gatewayAuth.expiresAt,
        scope: options.latestEvent.scope ?? options.gatewayAuth.scope,
      }
    : defaultEvent(options.gatewayAuth);

  return {
    generatedAt: new Date().toISOString(),
    mode: options.config.swiggyMode,
    endpoints: {
      authorize: `${options.config.swiggyBaseUrl}/auth/authorize`,
      token: `${options.config.swiggyBaseUrl}/auth/token`,
      logout: `${options.config.swiggyBaseUrl}/auth/logout`,
      authorizationServerMetadata: `${options.config.swiggyBaseUrl}/.well-known/oauth-authorization-server`,
      protectedResourceMetadata: `${options.config.swiggyBaseUrl}/.well-known/oauth-protected-resource`,
    },
    redirectUri: options.config.swiggyRedirectUri,
    scope: options.config.swiggyScope,
    clientIdConfigured: options.config.swiggyClientId !== "replace_after_builder_access",
    pendingVerifierCount: options.pendingVerifierCount,
    latestEvent,
    gatewayAuth: options.gatewayAuth,
    callbackChecklist: [
      {
        id: "pkce_s256",
        label: "PKCE S256 verifier",
        status: "ready",
        evidence: "Verifier stays server-side; only the S256 challenge is sent to Swiggy authorize.",
      },
      {
        id: "state_csrf",
        label: "State validation",
        status: options.pendingVerifierCount > 0 || latestEvent.status !== "not_started" ? "ready" : "watch",
        evidence: "Callback consumes one stored state/verifier pair before exchanging or mocking the token.",
      },
      {
        id: "auth_code_lifetime",
        label: "Authorization code lifetime",
        status: "ready",
        evidence: "Swiggy documents 120-second single-use authorization codes; MealPilot consumes state once.",
      },
      {
        id: "token_lifetime",
        label: "Access token lifetime",
        status: "ready",
        evidence: "Swiggy access tokens last 5 days and are reissued by rerunning OAuth when expired or revoked.",
      },
      {
        id: "redirect_exact_match",
        label: "Redirect URI exact match",
        status: options.config.swiggyRedirectUri.startsWith("https://") ? "ready" : "watch",
        evidence: "Localhost is valid for local development; production requires HTTPS exact-match allowlisting.",
      },
      {
        id: "no_token_logging",
        label: "No token logging",
        status: "ready",
        evidence: "Status responses expose token source, scope, and expiry only; bearer values are never returned.",
      },
    ],
    storagePolicy: [
      "Store access_token in memory or managed secret storage.",
      "Store expires_at = now + expires_in and re-authenticate when near expiry.",
      "Never log access tokens, authorization headers, OTPs, phone numbers, or payment credentials.",
      "Use POST /auth/logout with the user's bearer token before dropping live Swiggy session state.",
    ],
    nextActions:
      options.config.swiggyMode === "mock"
        ? [
            "Use mock callback evidence for localhost review.",
            "Replace placeholder client_id after DCR or Swiggy staging access.",
            "Rerun this flow against staging once credentials are issued.",
          ]
        : [
            "Complete OAuth in the browser and verify token source becomes runtime.",
            "Run /api/mcp-gateway before any staging or production MCP tool call.",
            "Treat 401 as reauthorization and 419 as full login with OTP.",
          ],
  };
}
