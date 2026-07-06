import type {
  SwiggyAuthLifecycleCenterReport,
  SwiggyAuthLifecycleLane,
  SwiggyAuthLifecycleStatus,
  SwiggyAuthRecoveryScenario,
  SwiggyAuthStatusReport,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/start/enterprise/delegated-auth/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/operate/versioning/",
];

function statusWeight(status: SwiggyAuthLifecycleStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.55;
}

export function buildSwiggyAuthLifecycleCenter(authStatus: SwiggyAuthStatusReport): SwiggyAuthLifecycleCenterReport {
  const clientStatus: SwiggyAuthLifecycleStatus = authStatus.clientIdConfigured ? "ready" : "external_gate";
  const redirectStatus: SwiggyAuthLifecycleStatus =
    authStatus.redirectUri.startsWith("https://") || authStatus.redirectUri.startsWith("http://localhost")
      ? "ready"
      : "watch";

  const lanes: SwiggyAuthLifecycleLane[] = [
    {
      id: "pkce_s256_authorize",
      label: "PKCE S256 Authorize",
      officialContract:
        "Start at /auth/authorize with response_type=code, client_id, redirect_uri, code_challenge, S256, state, and mcp scopes.",
      mealPilotControl:
        "Auth start generates a server-side verifier, sends only the S256 challenge, stores CSRF state, and exposes a redacted authorize URL.",
      status: "ready",
      evidenceLinks: [officialSources[2], "/api/auth/swiggy/start", "/api/auth/swiggy/status"],
    },
    {
      id: "single_use_code_exchange",
      label: "Single-use Code Exchange",
      officialContract:
        "Authorization codes are single-use and last 120 seconds; /auth/token exchanges code plus verifier for a bearer token.",
      mealPilotControl:
        "Callback consumes the verifier once, records callback status, and never logs the authorization code or verifier.",
      status: "ready",
      evidenceLinks: [officialSources[2], "/api/auth/swiggy/callback", "/api/audit-ledger"],
    },
    {
      id: "five_day_access_token",
      label: "Five-day Access Token",
      officialContract:
        "Access tokens last 5 days; store expires_at and treat expired or revoked tokens as authorization-required.",
      mealPilotControl:
        "Gateway status exposes token source and expiry only, while the Auth Lifecycle Center keeps re-auth rules visible.",
      status: "ready",
      evidenceLinks: [officialSources[2], "/api/mcp-gateway", "/api/auth/swiggy/status"],
    },
    {
      id: "no_refresh_token_v1",
      label: "No Refresh-token Assumption",
      officialContract:
        "Although metadata may advertise refresh_token, refresh-token issuance is not wired in v1.0; re-run authorization instead.",
      mealPilotControl:
        "MealPilot blocks silent refresh assumptions and classifies refresh attempts as a re-auth prompt.",
      status: "ready",
      evidenceLinks: [officialSources[2], "/api/error-intelligence", "/api/resilience"],
    },
    {
      id: "reauth_on_401_419",
      label: "401/419 Re-auth",
      officialContract: "401 means no, invalid, expired, or revoked credentials; 419 means full session re-auth.",
      mealPilotControl:
        "Error Intelligence and Resilience Lab route 401 to authorization rerun and 419 to phone-and-OTP login, not tool retry.",
      status: "ready",
      evidenceLinks: [officialSources[2], "/api/error-intelligence", "/api/resilience"],
    },
    {
      id: "exact_redirect_allowlist",
      label: "Exact Redirect Allowlist",
      officialContract:
        "HTTPS is required outside localhost, redirect URIs are exact-match, no wildcards, and no open redirects.",
      mealPilotControl:
        "Credential Cockpit audits localhost and production redirect URIs before staging or production cutover.",
      status: redirectStatus,
      evidenceLinks: [officialSources[2], "/api/credential-onboarding", "/api/sandbox-credential-workbench"],
    },
    {
      id: "delegated_per_user_tokens",
      label: "Delegated Per-user Tokens",
      officialContract:
        "Platform operators authenticate on behalf of each end user; each user gets their own bearer token and consent.",
      mealPilotControl:
        "Enterprise Delegated Auth keeps per-user token boundaries, DPDP role split, and platform review gates explicit.",
      status: "ready",
      evidenceLinks: [officialSources[3], "/api/enterprise-delegated-auth", "/api/data-governance-center"],
    },
    {
      id: "staging_client_identity",
      label: "Staging Client Identity",
      officialContract:
        "Swiggy credentials, exact redirect allowlisting, and production access approval are required before live traffic.",
      mealPilotControl:
        "Local proof stays review-ready while staging client id, seeded accounts, and production approval remain explicit gates.",
      status: clientStatus,
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix", "/api/production-launch-bundle"],
    },
  ];

  const recoveryScenarios: SwiggyAuthRecoveryScenario[] = [
    {
      id: "unauthorized_tool_call",
      trigger: "401",
      expectedDecision: "Stop the tool route, clear success assumptions, and re-run OAuth authorization.",
      userVisibleAction: "Ask the user to reconnect Swiggy before continuing.",
      status: "ready",
    },
    {
      id: "session_revoked",
      trigger: "419",
      expectedDecision: "Treat the Swiggy session as revoked or idle-expired and require full sign-in.",
      userVisibleAction: "Open Swiggy sign-in with phone and OTP in the browser.",
      status: "ready",
    },
    {
      id: "scope_too_narrow",
      trigger: "403",
      expectedDecision: "Do not retry the tool; rerun authorization with the requested MCP scopes after user consent.",
      userVisibleAction: "Explain that broader Swiggy permission is required.",
      status: "ready",
    },
    {
      id: "expired_auth_code",
      trigger: "code_expired",
      expectedDecision: "Discard the old verifier and create a fresh PKCE state because auth codes last only 120 seconds.",
      userVisibleAction: "Restart the Swiggy connection flow.",
      status: "ready",
    },
    {
      id: "refresh_requested",
      trigger: "refresh_requested",
      expectedDecision: "Do not call a refresh grant in v1.0; re-run authorization because refresh token issuance is not wired.",
      userVisibleAction: "Reconnect Swiggy instead of silently refreshing.",
      status: "ready",
    },
    {
      id: "logout_disconnect",
      trigger: "logout",
      expectedDecision: "Call /auth/logout with the bearer token when live, then delete local session state.",
      userVisibleAction: "Show Swiggy disconnected and require reconnect for future tool calls.",
      status: "ready",
    },
  ];

  const storageRules = [
    {
      id: "memory_or_secure_storage",
      rule: "Store access_token only in memory, OS keychain, vault, or managed secret storage.",
      status: "ready" as const,
      evidence: "Local mock uses process memory and docs preserve secure storage as the production requirement.",
    },
    {
      id: "expires_at_tracked",
      rule: "Store expires_at = now + expires_in and proactively re-authenticate when 60 seconds or less remain.",
      status: "ready" as const,
      evidence: "Auth status exposes expiry metadata but never bearer token values.",
    },
    {
      id: "no_plaintext_logs",
      rule: "Never log access tokens, Authorization headers, OTPs, phone numbers, or payment credentials.",
      status: "ready" as const,
      evidence: "Runtime telemetry records request ids, paths, status, duration, and token source only.",
    },
    {
      id: "logout_before_drop",
      rule: "Use POST /auth/logout before dropping a live Swiggy bearer token where possible.",
      status: "ready" as const,
      evidence: "OAuth Status lists the logout endpoint and privacy deletion removes local auth state.",
    },
  ];

  const troubleshooting = [
    { symptom: "401 on every call", likelyCause: "No or invalid credentials", recovery: "Rerun authorization", status: "ready" as const },
    { symptom: "401 after some time", likelyCause: "Token expired or revoked", recovery: "Rerun authorization", status: "ready" as const },
    { symptom: "419 session revoked", likelyCause: "Swiggy session idle-expired or revoked", recovery: "Full phone and OTP re-auth", status: "ready" as const },
    { symptom: "403 scope too narrow", likelyCause: "Missing MCP scope", recovery: "Re-auth with broader scope", status: "ready" as const },
    { symptom: "Stuck on authorize", likelyCause: "Bad redirect_uri", recovery: "Use exact-match allowlisted redirect URI", status: redirectStatus },
    { symptom: "Refresh grant attempted", likelyCause: "Assumed v1 refresh-token support", recovery: "Rerun authorization; wait for roadmap refresh-token support", status: "ready" as const },
  ];

  const externalGates = [
    "Swiggy staging client id and exact production redirect allowlisting are required before live OAuth proof.",
    "Refresh-token issuance remains a roadmap item, so MealPilot must re-run authorization in v1.0.",
    "Live /auth/logout verification requires a real bearer token issued through Swiggy staging or production.",
  ];

  const scoreInputs = [
    ...lanes.map((lane) => lane.status),
    ...recoveryScenarios.map((scenario) => scenario.status),
    ...storageRules.map((rule) => rule.status),
    ...troubleshooting.map((item) => item.status),
  ];
  const score = Math.round((scoreInputs.reduce((sum, status) => sum + statusWeight(status), 0) / scoreInputs.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    mode: authStatus.mode,
    officialSources,
    tokenLifetimes: {
      authorizationCodeSeconds: 120,
      accessTokenDays: 5,
      idleSessionDays: 30,
      proactiveReauthWindowSeconds: 60,
      refreshTokenAvailableInV1: false,
    },
    currentState: {
      tokenSource: authStatus.gatewayAuth.tokenSource,
      latestEvent: authStatus.latestEvent,
      pendingVerifierCount: authStatus.pendingVerifierCount,
      clientIdConfigured: authStatus.clientIdConfigured,
      redirectUri: authStatus.redirectUri,
      scope: authStatus.scope,
    },
    totals: {
      lanes: lanes.length,
      recoveryScenarios: recoveryScenarios.length,
      readyStorageRules: storageRules.filter((rule) => rule.status === "ready").length,
      troubleshootingCases: troubleshooting.length,
      externalGates: lanes.filter((lane) => lane.status === "external_gate").length + externalGates.length,
    },
    lanes,
    recoveryScenarios,
    storageRules,
    troubleshooting,
    operatorActions: [
      {
        id: "record_reauth_demo",
        label: "Record Re-auth Demo",
        owner: "Operator",
        status: "watch",
        evidence: "Demo should show expired-token handling by restarting OAuth instead of refreshing silently.",
      },
      {
        id: "issue_staging_credentials",
        label: "Issue Staging Credentials",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Needed to prove live authorize, token, logout, 401, and 419 flows.",
      },
      {
        id: "wire_secret_store",
        label: "Wire Secret Store",
        owner: "MealPilot",
        status: "ready",
        evidence: "Production config supports environment/secret runtime token injection without logging bearer values.",
      },
    ],
    assertions: [
      "MealPilot treats 401 and 419 as authorization recovery, never as blind MCP tool retries.",
      "MealPilot does not assume refresh-token issuance in Swiggy MCP v1.0.",
      "Authorization codes are single-use, expire after 120 seconds, and consume server-side PKCE state.",
      "Access tokens are represented by source, scope, and expiry only; bearer values are never returned in API responses.",
    ],
    externalGates,
  };
}
