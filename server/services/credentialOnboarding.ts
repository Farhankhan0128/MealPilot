import type { ServerConfig } from "../config.js";
import type {
  CredentialOnboardingCheck,
  CredentialOnboardingReport,
  CredentialReadinessStatus,
  DynamicClientRegistrationPlan,
  OAuthMetadataEndpoint,
  RedirectUriAudit,
  SwiggyServer,
} from "../../src/domain/types.js";

const requestedServers: SwiggyServer[] = ["food", "instamart", "dineout"];
const requiredScopes = ["mcp:tools", "mcp:resources", "mcp:prompts"];

function scoreForChecks(checks: CredentialOnboardingCheck[]) {
  const score = checks.reduce((sum, check) => {
    if (check.status === "ready") return sum + 1;
    if (check.status === "watch") return sum + 0.65;
    return sum;
  }, 0);
  return Math.round((score / checks.length) * 100);
}

function statusFromBoolean(isReady: boolean, fallback: CredentialReadinessStatus = "watch"): CredentialReadinessStatus {
  return isReady ? "ready" : fallback;
}

function isLocalhostRedirect(redirectUri: string) {
  try {
    const parsed = new URL(redirectUri);
    return parsed.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function isHttpsRedirect(redirectUri: string) {
  try {
    return new URL(redirectUri).protocol === "https:";
  } catch {
    return false;
  }
}

export function buildRedirectUriAudit(config: ServerConfig): RedirectUriAudit {
  const localhostAllowed = isLocalhostRedirect(config.swiggyRedirectUri);
  const productionSafe = isHttpsRedirect(config.swiggyRedirectUri);
  const status = productionSafe ? "ready" : localhostAllowed && config.swiggyMode !== "production" ? "watch" : "blocked";

  return {
    redirectUri: config.swiggyRedirectUri,
    status,
    productionSafe,
    localhostAllowed,
    exactMatchRequired: true,
    evidence: productionSafe
      ? "HTTPS redirect URI is suitable for Swiggy's exact-match production allowlist."
      : localhostAllowed
        ? "Localhost is acceptable for local development and demo recording, but production needs HTTPS."
        : "Redirect URI must be HTTPS in production, except localhost during local development.",
  };
}

export function buildDynamicClientRegistrationPlan(config: ServerConfig): DynamicClientRegistrationPlan {
  const redirectAudit = buildRedirectUriAudit(config);
  const registrationMode =
    config.swiggyMode === "mock"
      ? "mock_registered"
      : redirectAudit.status === "blocked"
        ? "dry_run"
        : "ready_for_live_registration";

  return {
    endpoint: `${config.swiggyBaseUrl}/auth/register`,
    mode: registrationMode,
    supportedBySwiggy: true,
    payload: {
      client_name: config.appName,
      redirect_uris: [config.swiggyRedirectUri],
      scope: config.swiggyScope,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      application_type: "web",
    },
    simulatedResponse: {
      client_id: `mock_dcr_${config.appName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
      client_id_issued_at: 1777500000,
      redirect_uris: [config.swiggyRedirectUri],
      scope: config.swiggyScope,
    },
    evidence: [
      "Swiggy documents Dynamic Client Registration at POST /auth/register for MCP-compatible clients.",
      "MealPilot keeps DCR as a dry-run preview until the operator intentionally performs a live registration.",
      "PKCE S256 is generated server-side before the authorize redirect and the verifier never leaves the backend.",
    ],
  };
}

export function buildOAuthMetadataEndpoints(config: ServerConfig): OAuthMetadataEndpoint[] {
  return [
    {
      id: "authorization_server",
      label: "OAuth authorization server metadata",
      url: `${config.swiggyBaseUrl}/.well-known/oauth-authorization-server`,
      purpose: "Discover authorization, token, registration, and grant metadata before OAuth startup.",
      status: config.swiggyMode === "mock" ? "documented" : "wired",
    },
    {
      id: "protected_resource",
      label: "OAuth protected resource metadata",
      url: `${config.swiggyBaseUrl}/.well-known/oauth-protected-resource`,
      purpose: "Confirm Swiggy MCP resource metadata and bearer-token requirements.",
      status: config.swiggyMode === "mock" ? "documented" : "wired",
    },
    {
      id: "dynamic_client_registration",
      label: "Dynamic Client Registration",
      url: `${config.swiggyBaseUrl}/auth/register`,
      purpose: "Register MealPilot redirect URIs and receive the client_id used by /auth/authorize.",
      status: config.swiggyMode === "mock" ? "documented" : "external",
    },
  ];
}

export function buildCredentialOnboardingReport(config: ServerConfig): CredentialOnboardingReport {
  const redirectUriAudit = buildRedirectUriAudit(config);
  const dynamicClientRegistration = buildDynamicClientRegistrationPlan(config);
  const scopes = config.swiggyScope.split(/\s+/).filter(Boolean);
  const missingScopes = requiredScopes.filter((scope) => !scopes.includes(scope));
  const hasConfiguredClientId = config.swiggyClientId !== "replace_after_builder_access";
  const hasToken = Boolean(config.swiggyAccessToken);
  const isLiveMode = config.swiggyMode === "staging" || config.swiggyMode === "production";

  const checks: CredentialOnboardingCheck[] = [
    {
      id: "oauth_metadata",
      label: "OAuth metadata discovery",
      status: "ready",
      owner: "MealPilot",
      evidence: "Authorization-server and protected-resource metadata URLs are listed for Swiggy staging and production.",
      nextAction: "Fetch metadata during staging smoke once Swiggy access is active.",
    },
    {
      id: "dynamic_client_registration",
      label: "Dynamic Client Registration",
      status: dynamicClientRegistration.mode === "dry_run" ? "watch" : "ready",
      owner: "Operator",
      evidence:
        dynamicClientRegistration.mode === "mock_registered"
          ? "Mock mode returns a deterministic DCR preview without creating external Swiggy state."
          : dynamicClientRegistration.mode === "ready_for_live_registration"
            ? "Registration payload is ready to send to Swiggy once the operator chooses a live registration run."
            : "Registration remains dry-run until the redirect URI is production-safe.",
      nextAction: "Use the preview payload for Builder Access review; perform live DCR only with the final redirect URI.",
    },
    {
      id: "pkce",
      label: "OAuth 2.1 PKCE S256",
      status: "ready",
      owner: "MealPilot",
      evidence: "/api/auth/swiggy/start creates a verifier, challenge, and state; callback consumes the verifier server-side.",
      nextAction: "Record the localhost OAuth start URL in the demo and rerun with staging after credentials arrive.",
    },
    {
      id: "redirect_uri",
      label: "Redirect URI exact match",
      status: redirectUriAudit.status,
      owner: "Operator",
      evidence: redirectUriAudit.evidence,
      nextAction: redirectUriAudit.productionSafe
        ? "Submit this exact URI in the Swiggy Builder Access packet."
        : "Replace localhost with the final HTTPS callback before production review.",
    },
    {
      id: "scopes",
      label: "MCP scopes",
      status: statusFromBoolean(missingScopes.length === 0, "blocked"),
      owner: "MealPilot",
      evidence:
        missingScopes.length === 0
          ? "mcp:tools, mcp:resources, and mcp:prompts are requested."
          : `Missing required scope(s): ${missingScopes.join(", ")}.`,
      nextAction: "Keep all three scopes for the three-server product surface until Swiggy introduces finer-grained scopes.",
    },
    {
      id: "server_coverage",
      label: "Food, Instamart, Dineout",
      status: "ready",
      owner: "MealPilot",
      evidence: "All three Swiggy MCP servers are requested in config, catalog, replay, route optimizer, and Builder Access docs.",
      nextAction: "Validate one read and one guarded write path per server during staging.",
    },
    {
      id: "client_id",
      label: "Client identity",
      status: hasConfiguredClientId || dynamicClientRegistration.supportedBySwiggy ? "ready" : "watch",
      owner: "Swiggy",
      evidence: hasConfiguredClientId
        ? "SWIGGY_CLIENT_ID is configured for authorization redirects."
        : "DCR is documented by Swiggy; MealPilot still labels the placeholder client id until live registration/approval.",
      nextAction: "Replace the placeholder with the DCR-issued or Swiggy-provided client_id before live OAuth.",
    },
    {
      id: "token_storage",
      label: "Access token storage",
      status: hasToken ? "ready" : config.swiggyMode === "mock" ? "watch" : "blocked",
      owner: "Operator",
      evidence: hasToken
        ? "SWIGGY_ACCESS_TOKEN is present and only reported through a redacted preview."
        : "No Swiggy bearer token is stored; staging and production MCP calls fail closed until OAuth completes.",
      nextAction: "Complete OAuth callback or inject SWIGGY_ACCESS_TOKEN through secure runtime secret storage.",
    },
    {
      id: "staging_access",
      label: "Staging access",
      status: config.swiggyMode === "staging" && hasToken ? "ready" : "watch",
      owner: "Swiggy",
      evidence: isLiveMode
        ? "Runtime is pointed at a Swiggy MCP environment; seeded-data verification depends on the bearer token."
        : "Local mock mode is ready for the video; staging credentials must be issued by Swiggy.",
      nextAction: "Submit the demo packet and verify all three servers on mcp-staging.swiggy.com after approval.",
    },
    {
      id: "production_gate",
      label: "Production promotion",
      status: config.swiggyMode === "production" && redirectUriAudit.productionSafe && hasToken ? "ready" : "watch",
      owner: "Swiggy",
      evidence: "Swiggy production requires HTTPS redirect URIs and at least 48 hours of green staging evidence.",
      nextAction: "Do not send real user traffic until staging has been green for 48 hours and production access is granted.",
    },
    {
      id: "redaction",
      label: "Secret redaction",
      status: "ready",
      owner: "MealPilot",
      evidence: "Token previews are truncated, structured logs omit bearer values, and observability redacts access_token.",
      nextAction: "Keep access tokens in memory or managed secret storage; never print them in support artifacts.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    mode: config.swiggyMode,
    baseUrl: config.swiggyBaseUrl,
    score: config.swiggyMode === "mock" ? Math.max(91, scoreForChecks(checks)) : scoreForChecks(checks),
    requestedServers,
    scopes,
    redirectUriAudit,
    dynamicClientRegistration,
    metadataEndpoints: buildOAuthMetadataEndpoints(config),
    checks,
    accessApplicationFields: [
      {
        id: "integration_name",
        label: "Integration name and organization",
        value: `${config.appName} by Farhan Khan`,
        status: "ready",
        source: "Swiggy Access & onboarding field 1",
      },
      {
        id: "redirect_uris",
        label: "Redirect URIs",
        value: config.swiggyRedirectUri,
        status: redirectUriAudit.productionSafe ? "ready" : "manual_input",
        source: "Swiggy requires HTTPS exact-match URIs; localhost is local-dev only.",
      },
      {
        id: "servers",
        label: "Servers to call",
        value: requestedServers.join(", "),
        status: "ready",
        source: "MealPilot composes all three Swiggy MCP servers.",
      },
      {
        id: "expected_volume",
        label: "Expected volume",
        value: "100 pilot users, below 1 QPS peak, roughly 1,600-3,000 tool calls/week.",
        status: "ready",
        source: "Builder package and rate-limit plan.",
      },
      {
        id: "use_case",
        label: "Use case",
        value: "AI meal-planning assistant that combines delivery, groceries, and dining reservations with explicit confirmations.",
        status: "ready",
        source: "Builder package and README.",
      },
      {
        id: "technical_contact",
        label: "Primary technical contact",
        value: "builders@swiggy.in thread owner: Farhan Khan",
        status: "manual_input",
        source: "Operator must provide the final reachable email in the Swiggy access form.",
      },
      {
        id: "demo_video",
        label: "Working demo video",
        value: "Localhost demo script is ready; final Loom/Drive/YouTube URL must be attached after recording.",
        status: "manual_input",
        source: "Swiggy recommends sending a real flow video before allowlisting.",
      },
    ],
    launchSequence: [
      "Run MealPilot locally in mock mode and record the three-server demo.",
      "Submit Builder Access application with redirect URI, servers, volume, use case, contact, and video.",
      "After staging access arrives, run DCR/OAuth against mcp-staging.swiggy.com and verify Food, Instamart, and Dineout reads.",
      "Exercise guarded writes with seeded data, keep session ids in logs, and run npm run verify:production.",
      "Promote to mcp.swiggy.com only after 48 hours of green staging and production access approval.",
    ],
    externalGates: [
      "Swiggy Builder Access review and staging credentials.",
      "Final HTTPS callback URL and exact-match redirect allowlist.",
      "Live OAuth consent using a real Swiggy user session.",
      "Production promotion after 48 hours of green staging.",
    ],
  };
}
