import type { ServerConfig } from "../config.js";
import type {
  SwiggyCredentialVaultCenter,
  SwiggyCredentialVaultRotation,
  SwiggyCredentialVaultSecret,
  SwiggyCredentialVaultStatus,
} from "../../src/domain/types.js";
import { buildCredentialOnboardingReport } from "./credentialOnboarding.js";
import { buildMcpGatewayStatus } from "./mcpGateway.js";
import { buildSandboxCredentialWorkbench } from "./sandboxCredentialWorkbench.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

function statusWeight(status: SwiggyCredentialVaultStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.74;
  if (status === "swiggy_gate") return 0.62;
  return 0.12;
}

function secret(input: SwiggyCredentialVaultSecret): SwiggyCredentialVaultSecret {
  return input;
}

function rotation(input: SwiggyCredentialVaultRotation): SwiggyCredentialVaultRotation {
  return input;
}

function tokenPresent(config: ServerConfig) {
  return Boolean(config.swiggyAccessToken?.trim());
}

function tokenExpiryStatus(config: ServerConfig): SwiggyCredentialVaultStatus {
  if (!config.swiggyTokenExpiresAt) return config.swiggyMode === "mock" ? "operator_input" : "blocked";
  const expiresAt = Date.parse(config.swiggyTokenExpiresAt);
  if (Number.isNaN(expiresAt)) return "blocked";
  const secondsRemaining = Math.floor((expiresAt - Date.now()) / 1000);
  if (secondsRemaining <= 0) return "blocked";
  return secondsRemaining > 900 ? "ready" : "operator_input";
}

export function buildSwiggyCredentialVaultCenter(config: ServerConfig): SwiggyCredentialVaultCenter {
  const onboarding = buildCredentialOnboardingReport(config);
  const gateway = buildMcpGatewayStatus(config);
  const sandbox = buildSandboxCredentialWorkbench(config);
  const hasClientId = config.swiggyClientId !== "replace_after_builder_access";
  const hasAccessToken = tokenPresent(config);
  const redirectReady = onboarding.redirectUriAudit.status === "ready";
  const scopesReady = ["mcp:tools", "mcp:resources", "mcp:prompts"].every((scope) => onboarding.scopes.includes(scope));
  const expiryStatus = tokenExpiryStatus(config);

  const secrets = [
    secret({
      id: "swiggy_env",
      label: "Swiggy environment",
      envVar: "SWIGGY_ENV",
      requiredFor: "staging",
      owner: "Operator",
      status: config.swiggyMode === "mock" ? "operator_input" : "ready",
      configured: config.swiggyMode !== "mock",
      redaction: "Environment name is safe to display.",
      evidence: `Runtime is currently ${config.swiggyMode}.`,
      nextAction:
        config.swiggyMode === "mock" ? "Set SWIGGY_ENV=staging only after Swiggy issues staging credentials." : "Keep mode aligned with issued credentials.",
    }),
    secret({
      id: "client_id",
      label: "OAuth client id",
      envVar: "SWIGGY_CLIENT_ID",
      requiredFor: "staging",
      owner: "Joint",
      status: hasClientId ? "ready" : "swiggy_gate",
      configured: hasClientId,
      redaction: "Client id may be shown only as configured/unconfigured, never pasted into public docs.",
      evidence: hasClientId ? "Client id is configured for authorize redirects." : "Placeholder client id remains until DCR or Swiggy access approval.",
      nextAction: hasClientId ? "Verify exact redirect URI and run OAuth start." : "Wait for DCR approval or Swiggy-issued client identity.",
    }),
    secret({
      id: "redirect_uri",
      label: "Exact redirect URI",
      envVar: "SWIGGY_REDIRECT_URI",
      requiredFor: "production",
      owner: "Operator",
      status: redirectReady ? "ready" : "operator_input",
      configured: Boolean(config.swiggyRedirectUri),
      redaction: "Redirect URI is safe to display in access packets.",
      evidence: onboarding.redirectUriAudit.evidence,
      nextAction: redirectReady ? "Submit this exact URI to Swiggy." : "Replace localhost with the final HTTPS callback before production review.",
    }),
    secret({
      id: "scope",
      label: "MCP OAuth scope",
      envVar: "SWIGGY_SCOPE",
      requiredFor: "staging",
      owner: "MealPilot",
      status: scopesReady ? "ready" : "blocked",
      configured: scopesReady,
      redaction: "Scope string is safe to display.",
      evidence: scopesReady ? "mcp:tools, mcp:resources, and mcp:prompts are requested." : "One or more MCP scopes are missing.",
      nextAction: "Keep all three scopes until Swiggy introduces narrower scope grants.",
    }),
    secret({
      id: "access_token",
      label: "Bearer access token",
      envVar: "SWIGGY_ACCESS_TOKEN",
      requiredFor: "staging",
      owner: "Operator",
      status: hasAccessToken ? "ready" : config.swiggyMode === "mock" ? "operator_input" : "blocked",
      configured: hasAccessToken,
      redaction: "Only token source and short preview may be shown; full token is forbidden in logs, screenshots, and packets.",
      evidence: hasAccessToken ? "Token source is available to the gateway." : "No bearer token is present; live MCP calls fail closed.",
      nextAction: hasAccessToken ? "Run staging smoke and monitor expiry." : "Complete OAuth callback or inject the token through managed secret storage.",
    }),
    secret({
      id: "token_expiry",
      label: "Token expiry timestamp",
      envVar: "SWIGGY_TOKEN_EXPIRES_AT",
      requiredFor: "staging",
      owner: "Operator",
      status: expiryStatus,
      configured: Boolean(config.swiggyTokenExpiresAt),
      redaction: "Expiry timestamp is safe to display.",
      evidence: config.swiggyTokenExpiresAt ? `Configured expiry: ${config.swiggyTokenExpiresAt}.` : "Expiry is absent in mock mode or before OAuth completion.",
      nextAction: expiryStatus === "ready" ? "Schedule proactive reauth before the final 15 minutes." : "Store token expiry after OAuth and reauth before staging smoke.",
    }),
    secret({
      id: "data_file",
      label: "Durable state file",
      envVar: "MEALPILOT_DATA_FILE",
      requiredFor: "optional_persistence",
      owner: "Operator",
      status: config.dataFile ? "ready" : "operator_input",
      configured: Boolean(config.dataFile),
      redaction: "Filesystem path may be shown; snapshot contents must stay local.",
      evidence: config.dataFile ? "File-backed storage is configured." : "Current run uses memory storage for demo simplicity.",
      nextAction: config.dataFile ? "Back up and compact snapshots after credential events." : "Set MEALPILOT_DATA_FILE for staging soak persistence.",
    }),
  ];

  const rotationRunbook = [
    rotation({
      id: "oauth_reauth",
      label: "OAuth token reauth",
      cadence: "Before 5-day access token expiry, and immediately on 401/419.",
      owner: "MealPilot",
      status: "ready",
      trigger: "Token expires, token is revoked, or gateway returns 401/419.",
      evidenceLinks: ["/api/swiggy-auth-lifecycle-center", "/api/auth/swiggy/status"],
    }),
    rotation({
      id: "dcr_client_rotation",
      label: "Client id replacement",
      cadence: "Only when Swiggy issues or rotates the registered client id.",
      owner: "Joint",
      status: hasClientId ? "ready" : "swiggy_gate",
      trigger: "DCR approval, app redirect change, or Swiggy credential rotation request.",
      evidenceLinks: ["/api/credential-onboarding", "/api/swiggy-submission-timeline-center"],
    }),
    rotation({
      id: "environment_cutover",
      label: "Staging to production cutover",
      cadence: "After 48-hour staging soak and Swiggy production approval.",
      owner: "Swiggy",
      status: config.swiggyMode === "production" ? "ready" : "swiggy_gate",
      trigger: "Production access is granted and production credentials are issued.",
      evidenceLinks: ["/api/staging-certification-matrix", "/api/production-launch-bundle"],
    }),
    rotation({
      id: "support_redaction_review",
      label: "Support packet redaction review",
      cadence: "Every incident, staging transcript export, and builder-packet export.",
      owner: "MealPilot",
      status: "ready",
      trigger: "Any support report, export, transcript, or reviewer artifact generation.",
      evidenceLinks: ["/api/support/bridge", "/api/reviewer-artifact-vault", "/api/audit-ledger"],
    }),
  ];

  const cutoverChecks = [
    {
      id: "gateway_status",
      label: "Gateway credential posture",
      status: gateway.checks.every((check) => check.status !== "blocked") ? "ready" as const : "operator_input" as const,
      command: "curl -s http://localhost:8787/api/mcp-gateway",
      evidence: `Gateway transport is ${gateway.activeTransport}; token source is ${gateway.auth.tokenSource}.`,
    },
    {
      id: "onboarding_status",
      label: "Onboarding contract",
      status: onboarding.score >= 85 ? "ready" as const : "operator_input" as const,
      command: "curl -s http://localhost:8787/api/credential-onboarding",
      evidence: `Credential onboarding score is ${onboarding.score}.`,
    },
    {
      id: "sandbox_workbench",
      label: "Sandbox and seeded data posture",
      status: sandbox.score >= 80 ? "ready" as const : "swiggy_gate" as const,
      command: "curl -s http://localhost:8787/api/sandbox-credential-workbench",
      evidence: `Sandbox credential workbench score is ${sandbox.score}.`,
    },
    {
      id: "production_verifier",
      label: "Production verifier",
      status: "ready" as const,
      command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
      evidence: "Production verifier asserts credential, gateway, staging, redaction, and support gates.",
    },
  ];

  const redactionRules = [
    {
      id: "no_full_token",
      rule: "Never return, log, screenshot, export, or email a full bearer token.",
      evidenceLinks: ["/api/mcp-gateway", "/api/reviewer-artifact-vault"],
    },
    {
      id: "preview_only",
      rule: "Token evidence may show only source, expiry, and a short preview.",
      evidenceLinks: ["/api/auth/swiggy/status", "/api/swiggy-auth-lifecycle-center"],
    },
    {
      id: "no_public_client_dump",
      rule: "Client identifiers and runtime env values stay out of README, packet markdown, and screenshots unless Swiggy approves.",
      evidenceLinks: ["/api/builder-packet-export", "/api/brand-compliance-kit"],
    },
    {
      id: "support_safe_context",
      rule: "Support packets include hashed session and tool context, not raw PII or tokens.",
      evidenceLinks: ["/api/support/bridge", "/api/audit-ledger"],
    },
  ];

  const scoreItems = [...secrets.map((item) => item.status), ...rotationRunbook.map((item) => item.status), ...cutoverChecks.map((item) => item.status)];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    mode: config.swiggyMode,
    score,
    officialSources,
    activeTransport: gateway.activeTransport,
    totals: {
      secrets: secrets.length,
      configured: secrets.filter((item) => item.configured).length,
      ready: secrets.filter((item) => item.status === "ready").length,
      operatorInputs: secrets.filter((item) => item.status === "operator_input").length,
      swiggyGates: secrets.filter((item) => item.status === "swiggy_gate").length,
      blocked: secrets.filter((item) => item.status === "blocked").length,
      rotations: rotationRunbook.length,
      redactionRules: redactionRules.length,
    },
    secrets,
    rotationRunbook,
    cutoverChecks,
    redactionRules,
    supportPacket: {
      to: "builders@swiggy.in",
      subject: "MealPilot credential posture and redaction proof",
      safeFields: ["mode", "baseUrl", "clientIdConfigured", "tokenSource", "tokenExpiresAt", "scope", "redirectUri"],
      forbiddenFields: ["access_token", "refresh_token", "authorization code", "PKCE verifier", "raw user PII", "raw Swiggy payload"],
    },
    assertions: [
      "MealPilot distinguishes configured, missing, operator-owned, and Swiggy-owned credentials before any live MCP call.",
      "Full bearer tokens, authorization codes, refresh tokens, and PKCE verifiers are forbidden in logs, screenshots, exports, and support packets.",
      "Mock mode remains demo-safe; staging and production stay fail-closed without a bearer token.",
      "Production cutover remains blocked until Swiggy approval, exact HTTPS redirect URI, staging soak, and credential issuance are complete.",
    ],
    externalGates: [
      "Swiggy must approve DCR or issue client identity before live OAuth.",
      "Operator must configure final HTTPS redirect URI, token expiry, and managed runtime secrets.",
      "Swiggy must issue staging credentials, production credentials, seeded users, and any support-channel approvals.",
    ],
  };
}
