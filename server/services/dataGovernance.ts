import type { ServerConfig } from "../config.js";
import type {
  DataFlowInventoryItem,
  DataGovernanceCenter,
  DataGovernanceControl,
  DataGovernanceStatus,
  DataSubjectRequestStep,
  UserProfile,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/changelog/",
];

function statusValue(status: DataGovernanceStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.8;
  if (status === "manual_input") return 0.65;
  return 0.4;
}

function scoreFor(statuses: DataGovernanceStatus[]) {
  return Math.round((statuses.reduce((sum, status) => sum + statusValue(status), 0) / statuses.length) * 100);
}

function buildDataFlows(config: ServerConfig, profile: UserProfile): DataFlowInventoryItem[] {
  return [
    {
      id: "preference_profile",
      category: "preference",
      source: "user",
      fields: ["diet", "budget", "household size", "cuisines", "allergies", "dislikes", "high-level address label"],
      storage: "local_profile",
      retention: profile.consentToStorePreferences
        ? `Until user deletion or ${config.planRetentionDays} day plan compaction window for derived plans.`
        : "Profile preferences stay default-only until the user grants storage consent.",
      lawfulBasis: "User-controlled preference storage consent in MealPilot.",
      controls: ["consent", "local_export", "local_delete", "preference_only"],
      status: profile.consentToStorePreferences ? "ready" : "watch",
    },
    {
      id: "swiggy_location_context",
      category: "location",
      source: "swiggy_mcp",
      fields: ["opaque address id", "serviceability area", "Home/Office label"],
      storage: "session_only",
      retention: "Used for the active planning turn and excluded from durable local profile storage.",
      lawfulBasis: "Immediate task execution within Swiggy's existing user consent scope.",
      controls: ["purpose_limitation", "no_full_address_log", "session_scope"],
      status: "ready",
    },
    {
      id: "cart_and_order_context",
      category: "commerce",
      source: "swiggy_mcp",
      fields: ["cart id", "order or booking id", "coupon code", "item ids", "status summaries"],
      storage: "session_only",
      retention: "Stored only in session evidence and redacted support payloads until local deletion or compaction.",
      lawfulBasis: "Immediate task execution and user-confirmed commercial action.",
      controls: ["explicit_confirmation", "non_blind_retry", "redacted_support"],
      status: "ready",
    },
    {
      id: "telemetry_trace_context",
      category: "telemetry",
      source: "mealpilot",
      fields: ["request id", "session id", "tool name", "duration", "status", "hashed user context"],
      storage: "redacted_log",
      retention: "Local runtime ledger only; Swiggy-side MCP audit logs are retained 90 days keyed by session id.",
      lawfulBasis: "Debugging, security, and support correlation with minimised fields.",
      controls: ["session_id_only", "hash_user_ids", "no_body_logging"],
      status: "ready",
    },
    {
      id: "oauth_token",
      category: "token",
      source: "swiggy_mcp",
      fields: ["access token", "expiry", "token source"],
      storage: "runtime_memory",
      retention: "Kept in process memory or secure runtime storage; never written to local snapshots or logs in plaintext.",
      lawfulBasis: "Authenticated user session for Swiggy MCP calls.",
      controls: ["pkce", "token_redaction", "https_only", "reauth_on_401"],
      status: "ready",
    },
    {
      id: "support_payload",
      category: "support",
      source: "mealpilot",
      fields: ["session id", "request id", "server", "tool", "error class", "redacted context"],
      storage: "redacted_log",
      retention: "Generated on demand for builders@swiggy.in or report_error; excludes tokens, payment data, full addresses, phone, and email.",
      lawfulBasis: "User support and security incident coordination.",
      controls: ["report_error", "redaction_manifest", "security_contact"],
      status: "ready",
    },
  ];
}

function buildControls(config: ServerConfig): DataGovernanceControl[] {
  const productionRegionFinalized = config.swiggyMode === "production" && config.swiggyRedirectUri.startsWith("https://");

  return [
    {
      id: "processor_boundary",
      label: "Fiduciary / processor boundary",
      status: "ready",
      swiggyRequirement: "Swiggy is Data Fiduciary for data accessed through MCP; integrations act as Data Processors.",
      mealPilotControl: "All Swiggy-originated data is treated as processor-scoped evidence for user-requested meal tasks.",
      evidenceLinks: ["/api/compliance-evidence", "/api/swiggy-access-dossier", "/api/builder-package.md"],
    },
    {
      id: "purpose_limitation",
      label: "Immediate-task purpose limitation",
      status: "ready",
      swiggyRequirement: "Use Swiggy-originated data only to serve the user's immediate task unless separate consent and DPA exist.",
      mealPilotControl: "Planner routes only use tool responses for ordering, cart, booking, tracking, and support flows in the active session.",
      evidenceLinks: ["/api/swiggy-journey-compiler", "/api/mcp/tool-lab", "/api/sessions/:sessionId/replay"],
    },
    {
      id: "no_training_without_consent",
      label: "No training or ads without consent",
      status: "ready",
      swiggyRequirement: "Analytics, advertising, and training use of Swiggy-originated data require explicit consent and DPA.",
      mealPilotControl: "Builder packet and local evidence exclude Swiggy-originated payloads from training, advertising, and resale.",
      evidenceLinks: ["/api/builder-package.md", "/api/compliance-evidence", "/api/swiggy-access-dossier"],
    },
    {
      id: "pii_minimization",
      label: "PII minimization",
      status: "ready",
      swiggyRequirement: "Treat tool arguments and responses as PII and minimise fields crossing app boundaries.",
      mealPilotControl: "MealPilot stores preference summaries, ids, status classes, and labels instead of full addresses or raw order bodies.",
      evidenceLinks: ["/api/privacy/export", "/api/storage/export", "/api/sessions/:sessionId/staging-transcript"],
    },
    {
      id: "local_delete_export",
      label: "Local export and deletion",
      status: "ready",
      swiggyRequirement: "Honour deletion requests for data stored or derived by the integration.",
      mealPilotControl: "/api/privacy/export and DELETE /api/privacy cover profile, pantry, group, plans, reminders, and local auth state.",
      evidenceLinks: ["/api/privacy/export", "/api/privacy", "/api/storage/compact"],
    },
    {
      id: "log_minimization",
      label: "Log minimization",
      status: "ready",
      swiggyRequirement: "Log session id for correlation, not full request/response bodies in plaintext.",
      mealPilotControl: "Runtime telemetry records method, path, duration, status, request id, session id, and redaction attributes.",
      evidenceLinks: ["/api/telemetry/runtime", "/api/observability/traces"],
    },
    {
      id: "hash_user_identifiers",
      label: "Hash user identifiers",
      status: "ready",
      swiggyRequirement: "Hash user identifiers at rest unless a specific lawful basis requires plaintext.",
      mealPilotControl: "Plan creation and transcript exports expose hashed user context and avoid raw phone, email, or name in logs.",
      evidenceLinks: ["/api/plan", "/api/sessions/:sessionId/staging-transcript", "/api/telemetry/runtime"],
    },
    {
      id: "token_redaction",
      label: "Token redaction",
      status: "ready",
      swiggyRequirement: "Store access tokens in memory, keychain, or vault; never log tokens in plaintext or send over non-HTTPS.",
      mealPilotControl: "OAuth callback keeps tokens in process memory and diagnostics expose only redacted token posture.",
      evidenceLinks: ["/api/credential-onboarding", "/api/mcp-gateway", "/api/auth/swiggy/start"],
    },
    {
      id: "encryption_and_region_finalization",
      label: "Encryption and deployment region",
      status: productionRegionFinalized ? "ready" : "manual_input",
      swiggyRequirement: "TLS 1.2+ in transit, AES-256 at rest, India primary compute, and Singapore failover boundary.",
      mealPilotControl: productionRegionFinalized
        ? "Production redirect is HTTPS; final deployment must use India-primary managed storage with AES-256 at rest."
        : "Local evidence is ready; final HTTPS redirect, India-primary deployment, and managed AES-256 store must be filled before production.",
      evidenceLinks: ["/api/credential-onboarding", "/api/production-launch-bundle", "/api/storage/status"],
    },
    {
      id: "dsr_routing",
      label: "Data subject request routing",
      status: "ready",
      swiggyRequirement: "Swiggy-originated DSRs are handled through the Swiggy app; complex cases coordinate with builders@swiggy.in.",
      mealPilotControl: "Local DSRs use export/delete endpoints; Swiggy-originated DSRs are routed to the Swiggy app and partner contact.",
      evidenceLinks: ["/api/privacy/export", "/api/privacy", "/api/support/bridge"],
    },
    {
      id: "support_security_contact",
      label: "Security contact routing",
      status: "ready",
      swiggyRequirement: "Security issues go to security@swiggy.in; builder support goes to builders@swiggy.in.",
      mealPilotControl: "Support Bridge separates operational report_error payloads from security disclosure routing.",
      evidenceLinks: ["/api/support/bridge", "/api/error-intelligence", "/api/slo-incident-command"],
    },
    {
      id: "cross_border_dpa_gate",
      label: "Cross-border DPA gate",
      status: "external_gate",
      swiggyRequirement: "Non-India MCP response processing requires signed DPA and transfer mechanism before production.",
      mealPilotControl: "Launch Bundle keeps DPA, non-India inference, and analytics/training expansion as external legal gates.",
      evidenceLinks: ["/api/production-launch-bundle", "/api/swiggy-access-dossier"],
    },
    {
      id: "signed_manifest_watch",
      label: "Signed manifest watch",
      status: "watch",
      swiggyRequirement: "Signed manifests are planned once the MCP ecosystem spec stabilises, targeting v1.2.",
      mealPilotControl: "Schema mismatches are treated as security-relevant events until signed manifests are available.",
      evidenceLinks: ["/api/version-monitor", "/api/error-intelligence", "/api/slo-incident-command"],
    },
  ];
}

function buildDsrRunbook(): DataSubjectRequestStep[] {
  return [
    {
      id: "mealpilot_access",
      requestType: "access",
      owner: "MealPilot",
      status: "ready",
      action: "Export the local profile, pantry, group, plan, and reminder snapshot.",
      evidence: "GET /api/privacy/export",
    },
    {
      id: "mealpilot_correction",
      requestType: "correction",
      owner: "MealPilot",
      status: "ready",
      action: "Let the user update local profile preferences and regenerate plans from current Swiggy truth.",
      evidence: "PUT /api/profile plus a fresh /api/plan run.",
    },
    {
      id: "mealpilot_erasure",
      requestType: "erasure",
      owner: "MealPilot",
      status: "ready",
      action: "Clear local profile, pantry, group, plan, reminder, and auth data.",
      evidence: "DELETE /api/privacy and POST /api/storage/compact",
    },
    {
      id: "swiggy_originated_dsr",
      requestType: "swiggy_originated",
      owner: "Swiggy",
      status: "external_gate",
      action: "Direct the user to the Swiggy app for access, correction, or erasure of Swiggy-originated data; coordinate with builders@swiggy.in for complex cases.",
      evidence: "Swiggy app DSR flow and partner coordination.",
    },
  ];
}

export function buildDataGovernanceCenter(options: { profile: UserProfile; config: ServerConfig }): DataGovernanceCenter {
  const dataFlows = buildDataFlows(options.config, options.profile);
  const controls = buildControls(options.config);
  const dsrRunbook = buildDsrRunbook();
  const residencyStatus: DataGovernanceStatus =
    options.config.swiggyMode === "production" && options.config.swiggyRedirectUri.startsWith("https://")
      ? "ready"
      : "manual_input";
  const signedManifestStatus: DataGovernanceStatus = "watch";
  const statuses = [
    residencyStatus,
    signedManifestStatus,
    ...dataFlows.map((item) => item.status),
    ...controls.map((item) => item.status),
    ...dsrRunbook.map((item) => item.status),
  ];

  return {
    generatedAt: new Date().toISOString(),
    score: scoreFor(statuses),
    officialSources,
    dataRole: {
      swiggyRole: "Data Fiduciary",
      mealPilotRole: "Data Processor",
      evidence:
        "Swiggy remains Data Fiduciary for all MCP-accessed user data; MealPilot processes Swiggy-originated data only inside permitted task scope.",
    },
    residency: {
      primaryCompute: "AWS Mumbai / ap-south-1",
      primaryDataStores: "India",
      failover: "AWS Singapore / ap-southeast-1 active-passive",
      boundary: "India/Singapore region boundary; no Swiggy MCP routing through US or EU regions.",
      status: residencyStatus,
    },
    dataFlows,
    controls,
    dsrRunbook,
    retention: {
      localPlanRetentionDays: options.config.planRetentionDays,
      swiggyAuditLogDays: 90,
      compactionEndpoint: "/api/storage/compact",
      evidence: [
        "Local plans compact according to MEALPILOT_PLAN_RETENTION_DAYS.",
        "Swiggy MCP audit logs are retained 90 days keyed by session id.",
        "Privacy deletion clears local profile, pantry, group, plan, auth, and reminder state.",
      ],
    },
    securityContacts: [
      {
        label: "Builder operations",
        contact: "builders@swiggy.in",
        useCase: "Access review, DPA template, complex DSR coordination, staging and production support.",
        status: "ready",
      },
      {
        label: "Responsible disclosure",
        contact: "security@swiggy.in",
        useCase: "Security issues, schema mismatch events, token leakage, or vulnerability disclosure.",
        status: "ready",
      },
    ],
    signedManifestReadiness: {
      status: signedManifestStatus,
      targetVersion: "v1.2",
      evidence: [
        "Current tool schemas are validated through OpenAPI, Tool Lab, and capability registry evidence.",
        "Manifest signature validation is held as a watch item until the Swiggy/MCP spec stabilises.",
        "Schema mismatches route to security@swiggy.in as security-relevant events.",
      ],
    },
    assertions: [
      "MealPilot treats every Swiggy tool argument and response as DPDP-protected PII.",
      "Swiggy-originated data is limited to the immediate task, support correlation, and user-confirmed commercial actions.",
      "Local DSR endpoints cover MealPilot-owned data while Swiggy-originated DSRs remain routed through the Swiggy app.",
      "OAuth tokens are kept out of logs and snapshots; diagnostics expose only redacted runtime posture.",
    ],
    externalGates: [
      "Signed DPA and transfer mechanism if MCP responses are processed outside the India/Singapore boundary.",
      "Final production deployment proof for India-primary compute, HTTPS redirect, and AES-256 managed storage.",
      "Swiggy DSR coordination for complex Swiggy-originated access, correction, or erasure requests.",
      "Signed manifest verification once the v1.2 manifest pattern ships.",
    ],
  };
}
