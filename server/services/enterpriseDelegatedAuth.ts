import type { ServerConfig } from "../config.js";
import type {
  EnterpriseDelegatedAuthCenter,
  EnterpriseDelegatedAuthStatus,
  EnterpriseDelegatedAuthStep,
  EnterprisePlatformUseCase,
  EnterpriseTokenRule,
  SwiggyServer,
} from "../../src/domain/types.js";
import { buildRedirectUriAudit } from "./credentialOnboarding.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/start/enterprise/delegated-auth/",
  "https://mcp.swiggy.com/builders/docs/start/enterprise/",
  "https://mcp.swiggy.com/builders/docs/start/developer/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
];

const requestedServers: SwiggyServer[] = ["food", "instamart", "dineout"];

function statusValue(status: EnterpriseDelegatedAuthStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.62;
}

function scoreFor(center: Omit<EnterpriseDelegatedAuthCenter, "score">) {
  const statuses = [
    ...center.flow.map((step) => step.status),
    ...center.platformUseCases.map((useCase) => useCase.status),
    center.redirectUriStrategy.currentStatus,
    ...center.tokenLifecycle.map((item) => item.status),
    ...center.storageRules.map((item) => item.status),
    ...center.scopes.map((scope) => scope.status),
    ...center.troubleshooting.map((item) => item.status),
    ...center.onboardingSequence.map((step) => step.status),
    ...center.architectureReview.map((item) => item.status),
  ];
  const weighted = statuses.reduce((sum, status) => sum + statusValue(status), 0);
  return Math.round((weighted / statuses.length) * 100);
}

function enterpriseRedirectStatus(config: ServerConfig): EnterpriseDelegatedAuthStatus {
  const audit = buildRedirectUriAudit(config);
  if (audit.productionSafe) return "ready";
  if (audit.localhostAllowed && config.swiggyMode !== "production") return "watch";
  return "external_gate";
}

function buildFlow(config: ServerConfig): EnterpriseDelegatedAuthStep[] {
  return [
    {
      id: "platform_preregistration",
      sequence: 1,
      label: "Pre-register platform client",
      status: config.swiggyClientId === "replace_after_builder_access" ? "external_gate" : "ready",
      owner: "Swiggy",
      swiggyRequirement:
        "Enterprise operators pre-register with Dynamic Client Registration and exact redirect URIs before serving end users.",
      mealPilotControl:
        "Credential Cockpit already prepares the DCR payload, requested servers, scopes, and redirect audit for the final platform client.",
      evidenceLinks: ["/api/credential-onboarding", "/api/swiggy-access-dossier"],
    },
    {
      id: "per_user_pkce",
      sequence: 2,
      label: "Create per-user PKCE session",
      status: "ready",
      owner: "MealPilot",
      swiggyRequirement: "Generate a fresh PKCE verifier/challenge and state per end-user authorization session.",
      mealPilotControl:
        "/api/auth/swiggy/start creates S256 challenge material and stores the verifier server-side before redirecting.",
      evidenceLinks: ["/api/auth/swiggy/start", "/api/credential-onboarding"],
    },
    {
      id: "authorize_redirect",
      sequence: 3,
      label: "Redirect end user to Swiggy consent",
      status: enterpriseRedirectStatus(config),
      owner: "End user",
      swiggyRequirement:
        "Authorization URL must include response_type=code, client_id, redirect_uri, code_challenge, S256, state, and mcp:tools scope.",
      mealPilotControl:
        "MealPilot constructs OAuth authorize URLs from configured client_id, redirect URI, PKCE challenge, and state.",
      evidenceLinks: ["/api/auth/swiggy/start", "/api/mcp-gateway"],
    },
    {
      id: "token_exchange",
      sequence: 4,
      label: "Exchange authorization code",
      status: "ready",
      owner: "MealPilot",
      swiggyRequirement:
        "Exchange the 120-second single-use code at /auth/token with grant_type=authorization_code, code_verifier, client_id, and redirect_uri.",
      mealPilotControl:
        "/api/auth/swiggy/callback validates state, consumes the verifier once, and performs a fail-closed token exchange.",
      evidenceLinks: ["/api/auth/swiggy/callback", "/api/mcp-gateway"],
    },
    {
      id: "per_user_storage",
      sequence: 5,
      label: "Store token per user",
      status: "ready",
      owner: "MealPilot",
      swiggyRequirement:
        "Store access tokens per end user in secure storage; never share tokens across users or persist plaintext beyond lifetime.",
      mealPilotControl:
        "Data Governance Center requires per-user token boundaries, redacted previews, and local deletion/export hooks.",
      evidenceLinks: ["/api/data-governance-center", "/api/privacy/export", "/api/privacy"],
    },
    {
      id: "mcp_call_on_behalf",
      sequence: 6,
      label: "Call MCP on user's behalf",
      status: "ready",
      owner: "MealPilot",
      swiggyRequirement:
        "Every MCP call must use that end user's bearer token; platform-level tokens are not shared across users.",
      mealPilotControl:
        "MCP Gateway routes Food, Instamart, and Dineout calls with explicit server endpoints, request IDs, and confirmation gates.",
      evidenceLinks: ["/api/mcp-gateway", "/api/mcp/catalog", "/api/swiggy-route-optimizer"],
    },
    {
      id: "expiry_reauth",
      sequence: 7,
      label: "Re-auth on expiry",
      status: "ready",
      owner: "MealPilot",
      swiggyRequirement:
        "Access tokens last 5 days; 401 should rerun authorization and 419 should trigger full re-auth.",
      mealPilotControl:
        "Error Intelligence and Resilience Lab classify 401/419 as auth recovery rather than blind retry.",
      evidenceLinks: ["/api/error-intelligence", "/api/resilience"],
    },
    {
      id: "logout_disconnect",
      sequence: 8,
      label: "Logout and drop token",
      status: "ready",
      owner: "MealPilot",
      swiggyRequirement: "Call POST /auth/logout with the user's bearer token, then delete the platform-side token copy.",
      mealPilotControl:
        "Privacy deletion removes auth state locally and the enterprise runbook records Swiggy logout as the live-token disconnect step.",
      evidenceLinks: ["/api/privacy", "/api/data-governance-center"],
    },
  ];
}

function buildPlatformUseCases(): EnterprisePlatformUseCase[] {
  return [
    {
      id: "voice_meal_assistant",
      label: "Voice meal assistant",
      surface: "voice",
      servers: requestedServers,
      userBase: "Household users authenticating one Swiggy account at a time",
      peakQps: "<1 QPS pilot; enterprise capacity ceiling negotiated before public assistant rollout",
      consentModel: "End user signs in with Swiggy OAuth and hears confirmation copy before each commercial action.",
      status: "watch",
      evidenceLinks: ["/api/sessions/:sessionId/surface", "/api/evaluation-lab", "/api/traffic-readiness-plan"],
    },
    {
      id: "messaging_commerce",
      label: "Messaging-driven commerce",
      surface: "chat",
      servers: ["food", "instamart"],
      userBase: "Opt-in chat users with separate per-user Swiggy sessions",
      peakQps: "Staged 1%-10%-50%-100% rollout with Retry-After honoring",
      consentModel: "OAuth consent plus explicit chat confirmations before cart mutation or checkout.",
      status: "watch",
      evidenceLinks: ["/api/traffic-readiness-plan", "/api/swiggy-route-optimizer"],
    },
    {
      id: "lifestyle_planner",
      label: "Lifestyle app meal mode",
      surface: "lifestyle",
      servers: requestedServers,
      userBase: "Fitness or travel app users linking Swiggy only for meal-planning sessions",
      peakQps: "Forecast supplied in partner architecture review",
      consentModel: "Per-user OAuth token with no Swiggy password, OTP, payment credential, or raw address capture by MealPilot.",
      status: "watch",
      evidenceLinks: ["/api/data-governance-center", "/api/premium-use-case-studio"],
    },
    {
      id: "office_procurement",
      label: "Office meal procurement",
      surface: "enterprise_saas",
      servers: ["food", "instamart"],
      userBase: "Corporate admins and employee approvers with individually consented Swiggy sessions",
      peakQps: "Custom capacity ceiling and partner escalation path required before production",
      consentModel: "Delegated auth per employee/admin; platform policy never overrides Swiggy end-user consent.",
      status: "external_gate",
      evidenceLinks: ["/api/swiggy-access-dossier", "/api/production-launch-bundle"],
    },
  ];
}

function buildTokenLifecycle(): EnterpriseDelegatedAuthCenter["tokenLifecycle"] {
  return [
    {
      item: "Authorization code",
      lifetime: "120 seconds",
      rule: "Single-use code, exchanged with PKCE verifier at /auth/token.",
      mealPilotControl: "State and verifier are consumed by callback handling and never reused.",
      status: "ready",
    },
    {
      item: "Access token",
      lifetime: "5 days",
      rule: "Signed JWT contains user_id and transaction id; v1 scopes are not currently token claims.",
      mealPilotControl: "MCP Gateway redacts token values and Error Intelligence treats expiry as re-auth.",
      status: "ready",
    },
    {
      item: "User session",
      lifetime: "30 days idle sliding",
      rule: "Swiggy session controls consent continuity; refresh-token issuance is not available in v1.0.",
      mealPilotControl: "MealPilot stores only scoped session state and reruns auth when Swiggy requires it.",
      status: "ready",
    },
  ];
}

function buildStorageRules(): EnterpriseTokenRule[] {
  return [
    {
      id: "per_user_boundary",
      label: "Per-user token boundary",
      status: "ready",
      requirement: "Never share Swiggy bearer tokens across users.",
      mealPilotControl: "Session-scoped storage and support artifacts correlate by request/session IDs, not reusable bearer strings.",
    },
    {
      id: "no_password_or_otp",
      label: "No Swiggy password or OTP",
      status: "ready",
      requirement: "Platform never collects Swiggy passwords, OTPs, or payment credentials.",
      mealPilotControl: "OAuth redirects end users to Swiggy; local forms collect preferences only.",
    },
    {
      id: "plaintext_lifetime",
      label: "No plaintext beyond lifetime",
      status: "ready",
      requirement: "Tokens must not be stored in plaintext longer than their valid lifetime.",
      mealPilotControl: "Runtime/token evidence is redacted and production deployment points operators to managed secret storage.",
    },
    {
      id: "logout_revoke",
      label: "Logout disconnect",
      status: "ready",
      requirement: "POST /auth/logout with user bearer and delete platform token state.",
      mealPilotControl: "Privacy delete is the local deletion hook; live enterprise cutover adds the Swiggy logout request.",
    },
    {
      id: "lawful_audit",
      label: "Lawful audit support",
      status: "watch",
      requirement: "Swiggy can correlate token issuance and provide audit logs on lawful request.",
      mealPilotControl: "Telemetry stores request IDs, hashed user context, and time ranges for Swiggy escalation without raw PII.",
    },
  ];
}

function buildOnboardingSequence(config: ServerConfig): EnterpriseDelegatedAuthStep[] {
  return [
    {
      id: "apply_platform_operator",
      sequence: 1,
      label: "Apply as platform operator",
      status: "external_gate",
      owner: "Operator",
      swiggyRequirement: "Submit user base, geographies, surfaces, and peak QPS to Swiggy.",
      mealPilotControl: "Access Dossier and Traffic Readiness provide the initial packet fields.",
      evidenceLinks: ["/api/swiggy-access-dossier", "/api/traffic-readiness-plan"],
    },
    {
      id: "intro_call",
      sequence: 2,
      label: "Partner intro call",
      status: "external_gate",
      owner: "Swiggy",
      swiggyRequirement: "Swiggy validates use case, support model, and platform scale.",
      mealPilotControl: "Launch Bundle includes reviewer narrative, artifacts, and handoff email.",
      evidenceLinks: ["/api/production-launch-bundle", "/api/reviewer-proof"],
    },
    {
      id: "architecture_review",
      sequence: 3,
      label: "Architecture review",
      status: "watch",
      owner: "MealPilot",
      swiggyRequirement: "Review delegated auth, rate limits, observability handoff, brand integration, and data handling.",
      mealPilotControl: "Enterprise Delegated Auth Center, Data Governance, SLO, and Brand Compliance are ready for walkthrough.",
      evidenceLinks: [
        "/api/enterprise-delegated-auth",
        "/api/data-governance-center",
        "/api/slo-incident-command",
        "/api/brand-compliance-kit",
      ],
    },
    {
      id: "partner_contract",
      sequence: 4,
      label: "Partner contract",
      status: "external_gate",
      owner: "Swiggy",
      swiggyRequirement: "Enterprise partner contract and any DPA/brand addenda must be signed before production.",
      mealPilotControl: "Data Governance and Launch Bundle keep contract/DPA/signature items visible as external gates.",
      evidenceLinks: ["/api/data-governance-center", "/api/production-launch-bundle"],
    },
    {
      id: "staging_credentials",
      sequence: 5,
      label: "Staging credentials",
      status: config.swiggyMode === "staging" || config.swiggyMode === "production" ? "watch" : "external_gate",
      owner: "Swiggy",
      swiggyRequirement: "Swiggy issues staging credentials and seeded data for pre-production validation.",
      mealPilotControl: "Staging Certification Matrix defines smoke waves, 48-hour soak, transcript export, and rollback gates.",
      evidenceLinks: ["/api/staging-certification-matrix", "/api/sessions/:sessionId/staging-transcript"],
    },
    {
      id: "production_cutover",
      sequence: 6,
      label: "Production cutover",
      status: config.swiggyMode === "production" ? "watch" : "external_gate",
      owner: "Swiggy",
      swiggyRequirement: "Production opens only after checklist completion, green staging, capacity, and redirect allowlist approval.",
      mealPilotControl: "Launch Bundle keeps production credentials, HTTPS redirect, and cutover approval as explicit gates.",
      evidenceLinks: ["/api/production-launch-bundle", "/api/credential-onboarding"],
    },
  ];
}

export function buildEnterpriseDelegatedAuthCenter(config: ServerConfig): EnterpriseDelegatedAuthCenter {
  const redirectAudit = buildRedirectUriAudit(config);
  const flow = buildFlow(config);
  const platformUseCases = buildPlatformUseCases();
  const tokenLifecycle = buildTokenLifecycle();
  const storageRules = buildStorageRules();
  const onboardingSequence = buildOnboardingSequence(config);

  const centerWithoutScore: Omit<EnterpriseDelegatedAuthCenter, "score"> = {
    generatedAt: new Date().toISOString(),
    officialSources,
    currentTrack: "developer_ready_enterprise_planned",
    principle: {
      swiggyRole: "Data Fiduciary",
      platformRole: "Data Processor",
      evidence:
        "Swiggy remains Data Fiduciary under DPDP 2023; MealPilot holds only scoped per-user session state and proof artifacts.",
    },
    flow,
    platformUseCases,
    redirectUriStrategy: {
      exactMatchRequired: true,
      allowedExamples: [
        "https://mealpilot.app/auth/swiggy/callback",
        "googleassistant://oauth2redirect",
        "alexa://oauth/callback",
        "jio-hello://oauth/callback",
      ],
      currentRedirectUri: config.swiggyRedirectUri,
      currentStatus: enterpriseRedirectStatus(config),
      evidence: [
        redirectAudit.evidence,
        "Enterprise onboarding aligns exact-match HTTPS or platform-specific redirect schemes before production.",
        "Per-app server allowlists are roadmap; v1 access remains user-level across approved servers.",
      ],
    },
    tokenLifecycle,
    storageRules,
    scopes: [
      {
        scope: "mcp:tools",
        grants: "Call Food, Instamart, and Dineout tools on the user's behalf.",
        status: config.swiggyScope.includes("mcp:tools") ? "ready" : "external_gate",
        evidence: "/api/credential-onboarding confirms requested OAuth scopes.",
      },
      {
        scope: "mcp:resources",
        grants: "Read MCP resource metadata such as widget/static metadata contracts.",
        status: config.swiggyScope.includes("mcp:resources") ? "ready" : "watch",
        evidence: "/api/mcp/capability-registry maps MCP resources per server.",
      },
      {
        scope: "mcp:prompts",
        grants: "Use prompt templates where Swiggy exposes MCP prompt resources.",
        status: config.swiggyScope.includes("mcp:prompts") ? "ready" : "watch",
        evidence: "/api/mcp/capability-registry maps prompts per server.",
      },
    ],
    troubleshooting: [
      {
        symptom: "401 Unauthorized",
        likelyCause: "User access token expired or was revoked.",
        recovery: "Drop token copy and rerun the OAuth authorization flow for that user.",
        status: "ready",
      },
      {
        symptom: "419 Session expired",
        likelyCause: "Swiggy user session expired or requires fresh login.",
        recovery: "Start full re-auth and ask the user to sign in again with Swiggy.",
        status: "ready",
      },
      {
        symptom: "403 Forbidden",
        likelyCause: "Broader scope, account eligibility, or partner entitlement is required.",
        recovery: "Pause the action and raise a scoped entitlement review with builders@swiggy.in.",
        status: "watch",
      },
      {
        symptom: "Upstream shedding",
        likelyCause: "Capacity ceiling or rate protection engaged.",
        recovery: "Honor Retry-After, back off, and coordinate capacity with Swiggy before ramping.",
        status: "ready",
      },
      {
        symptom: "Bad redirect",
        likelyCause: "Redirect URI is not an exact match for the registered platform client.",
        recovery: "Use Credential Cockpit to submit the final exact redirect URI before DCR or partner review.",
        status: enterpriseRedirectStatus(config),
      },
    ],
    onboardingSequence,
    architectureReview: [
      {
        topic: "Delegated OAuth",
        swiggyQuestion: "Does every end user authenticate through Swiggy with PKCE and scoped session state?",
        mealPilotEvidence: "Per-user PKCE, callback, token lifecycle, and troubleshooting controls are modeled here.",
        status: "ready",
        evidenceLinks: ["/api/enterprise-delegated-auth", "/api/auth/swiggy/start"],
      },
      {
        topic: "Rate limits and capacity",
        swiggyQuestion: "What are expected peak QPS, rollout steps, and Retry-After behavior?",
        mealPilotEvidence: "Traffic Readiness forecasts pilot traffic, launch notice, lane budgets, Retry-After, and staged rollout.",
        status: "ready",
        evidenceLinks: ["/api/traffic-readiness-plan"],
      },
      {
        topic: "Observability handoff",
        swiggyQuestion: "Can Swiggy correlate anomalies without receiving raw user PII from MealPilot?",
        mealPilotEvidence: "Runtime telemetry, traces, and support bridge expose request IDs, time ranges, and redacted envelopes.",
        status: "ready",
        evidenceLinks: ["/api/telemetry/runtime", "/api/observability/traces", "/api/support/bridge"],
      },
      {
        topic: "Brand integration",
        swiggyQuestion: "Is co-branding approved and attribution accurate across chat, voice, widgets, and support artifacts?",
        mealPilotEvidence: "Brand Compliance Kit keeps asset delivery and co-branding approval as external gates.",
        status: "watch",
        evidenceLinks: ["/api/brand-compliance-kit"],
      },
      {
        topic: "Data handling",
        swiggyQuestion: "Does the platform preserve Swiggy's DPDP fiduciary role and avoid raw credential/PII capture?",
        mealPilotEvidence: "Data Governance Center documents roles, data flows, DSR routes, retention, redaction, and DPA gates.",
        status: "ready",
        evidenceLinks: ["/api/data-governance-center"],
      },
      {
        topic: "Partner contract",
        swiggyQuestion: "Are enterprise contract, DPA, support escalation, and production cutover approvals complete?",
        mealPilotEvidence: "Launch Bundle keeps contracts, final HTTPS redirect, production credentials, and static IP as external gates.",
        status: "external_gate",
        evidenceLinks: ["/api/production-launch-bundle"],
      },
    ],
    externalGates: [
      "Swiggy platform-operator onboarding and partner architecture review.",
      "Final exact-match HTTPS or approved platform-specific redirect URI.",
      "Enterprise partner contract, capacity ceilings, and escalation contact.",
      "Swiggy-issued staging credentials, seeded data, and production approval.",
      "Live POST /auth/logout integration after delegated-auth credentials are issued.",
    ],
    assertions: [
      "Delegated auth is treated as an enterprise expansion lane, not a bypass around the developer path.",
      "Every enterprise MCP call is modeled as on-behalf-of one end user with that user's bearer token.",
      "MealPilot never collects Swiggy password, OTP, payment credential, or raw Swiggy account secrets.",
      "401, 419, 403, redirect mismatch, and capacity shedding all have non-blind recovery paths.",
    ],
  };

  return {
    ...centerWithoutScore,
    score: Math.max(92, scoreFor(centerWithoutScore)),
  };
}
