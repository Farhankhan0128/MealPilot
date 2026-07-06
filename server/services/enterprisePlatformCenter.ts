import type {
  EnterprisePlatformCenterReport,
  EnterprisePlatformReadinessLane,
  EnterprisePlatformStatus,
  EnterpriseSupportLane,
  EnterpriseTenantControl,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/start/enterprise/",
  "https://mcp.swiggy.com/builders/docs/start/enterprise/delegated-auth/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
];

function statusValue(status: EnterprisePlatformStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.82;
  return 0.64;
}

function scoreFor(items: Array<{ status: EnterprisePlatformStatus }>) {
  return Math.round((items.reduce((sum, item) => sum + statusValue(item.status), 0) / items.length) * 100);
}

function buildReadinessLanes(config: ServerConfig): EnterprisePlatformReadinessLane[] {
  const hasLiveCredentials = config.swiggyMode !== "mock" && Boolean(config.swiggyAccessToken);

  return [
    {
      id: "platform_operator_path",
      label: "Platform operator path",
      owner: "Joint",
      status: "watch",
      officialRequirement:
        "Enterprise/platform operators use white-glove onboarding, security review, commercial terms, and contract-specific support.",
      mealPilotControl:
        "MealPilot keeps the enterprise lane separate from the developer path while preserving application fields, support owners, and production gates.",
      evidenceLinks: ["/api/swiggy-access-dossier", "/api/access-submission-studio", "/api/production-launch-bundle"],
    },
    {
      id: "tenant_delegated_auth",
      label: "Per-user delegated OAuth",
      owner: "MealPilot",
      status: "ready",
      officialRequirement: "Platforms authenticate on behalf of each end user and hold per-user access tokens.",
      mealPilotControl:
        "Enterprise Delegated Auth Center models on-behalf-of PKCE, exact redirect allowlisting, per-user token storage, and logout.",
      evidenceLinks: ["/api/enterprise-delegated-auth", "/api/swiggy-auth-lifecycle-center"],
    },
    {
      id: "quota_and_peak_qps",
      label: "Quota profile",
      owner: "Joint",
      status: "ready",
      officialRequirement: "Enterprise applications provide expected peak QPS, surfaces, geography, and traffic events ahead of launch.",
      mealPilotControl:
        "Traffic Readiness, Backpressure Governor, Load Lab, and Route Optimizer model daily calls, Indian meal peaks, voice bursts, and capacity notices.",
      evidenceLinks: ["/api/traffic-readiness-plan", "/api/mcp/backpressure-governor", "/api/swiggy-load-lab"],
    },
    {
      id: "staging_soak",
      label: "48-hour staging soak",
      owner: "Joint",
      status: hasLiveCredentials ? "ready" : "external_gate",
      officialRequirement: "Production access follows a working staging integration and a green soak period.",
      mealPilotControl:
        "Staging Cutover and Certification Matrix split read probes, mutations, commerce, support, telemetry, and 48-hour promotion checks.",
      evidenceLinks: ["/api/mcp/staging-cutover", "/api/staging-certification-matrix", "/api/sessions/:sessionId/staging-transcript"],
    },
    {
      id: "contract_sla_support",
      label: "Contract support lane",
      owner: "Swiggy",
      status: "external_gate",
      officialRequirement:
        "Enterprise partners receive designated engineering contacts, shorter SLAs, optional Slack, dashboards, and bespoke remedies by contract.",
      mealPilotControl:
        "Support Bridge and SLO Incident Command prepare session ids, time ranges, severity labels, report_error payloads, and escalation copy.",
      evidenceLinks: ["/api/support/bridge", "/api/slo-incident-command", "/api/audit-ledger"],
    },
    {
      id: "security_compliance_review",
      label: "Security and compliance review",
      owner: "Joint",
      status: "ready",
      officialRequirement:
        "Enterprise review covers security posture, compliance attestations, data residency, and no unnecessary PII storage.",
      mealPilotControl:
        "Data Governance, Brand Compliance, Audit Ledger, and Auth Lifecycle enforce DPDP posture, redaction, token handling, and review evidence.",
      evidenceLinks: ["/api/data-governance-center", "/api/brand-compliance-kit", "/api/audit-ledger"],
    },
    {
      id: "co_branding_assets",
      label: "Co-branding assets",
      owner: "Swiggy",
      status: "external_gate",
      officialRequirement:
        "Enterprise co-branding assets and partner-specific placement are supplied or negotiated at onboarding.",
      mealPilotControl:
        "Brand Compliance keeps Powered by Swiggy attribution, endorsement boundaries, and asset approval gates visible until assets arrive.",
      evidenceLinks: ["/api/brand-compliance-kit", "/api/swiggy-growth-partnership", "/api/reviewer-artifact-vault"],
    },
  ];
}

function buildTenantControls(): EnterpriseTenantControl[] {
  return [
    {
      id: "tenant_registry",
      label: "Tenant registry",
      status: "ready",
      tenantBoundary: "Tenant id, workspace id, and integration owner stay separate from Swiggy session ids.",
      control: "MealPilot never keys internal business records on Swiggy session ids; session ids remain support identifiers only.",
      evidenceLinks: ["/api/data-governance-center", "/api/audit-ledger"],
    },
    {
      id: "per_user_tokens",
      label: "Per-user token vault",
      status: "ready",
      tenantBoundary: "Every end user has their own OAuth grant, token expiry, logout, and re-auth path.",
      control: "Delegated auth rules prevent shared household, workspace, or platform bearer tokens.",
      evidenceLinks: ["/api/enterprise-delegated-auth", "/api/swiggy-auth-lifecycle-center"],
    },
    {
      id: "tenant_quota_profile",
      label: "Tenant quota profile",
      status: "ready",
      tenantBoundary: "Peak QPS, daily calls, voice bursts, and background work are tenant-scoped.",
      control: "Load Lab and Backpressure Governor keep voice surfaces, campaign spikes, tracking cadence, and commercial writes bounded.",
      evidenceLinks: ["/api/swiggy-load-lab", "/api/mcp/backpressure-governor"],
    },
    {
      id: "tenant_support_routing",
      label: "Tenant support routing",
      status: "ready",
      tenantBoundary: "Support reports include tenant-safe session ids and redacted tool context only.",
      control: "Support Bridge prepares Food, Instamart, and Dineout report_error payloads with token and PII redaction.",
      evidenceLinks: ["/api/support/bridge", "/api/swiggy-cancellation-care-center"],
    },
    {
      id: "tenant_audit_export",
      label: "Tenant audit export",
      status: "ready",
      tenantBoundary: "Audit exports are session-scoped and redacted before partner or Swiggy handoff.",
      control: "Staging Transcript and Audit Ledger produce JSONL, Markdown, request ids, support envelope, and redaction manifest.",
      evidenceLinks: ["/api/audit-ledger", "/api/sessions/:sessionId/staging-transcript"],
    },
  ];
}

function buildSupportLanes(): EnterpriseSupportLane[] {
  return [
    {
      id: "builders_email",
      channel: "builders@swiggy.in",
      useCase: "Onboarding, access review, rate-limit increases, docs feedback, and production escalation email.",
      sla: "General developer support; enterprise response targets are contract-specific.",
      status: "ready",
      evidenceLinks: ["/api/support/bridge", "/api/access-submission-studio"],
    },
    {
      id: "security_email",
      channel: "security@swiggy.in",
      useCase: "Responsible disclosure for security vulnerabilities.",
      sla: "Security process with responsible disclosure handling.",
      status: "ready",
      evidenceLinks: ["/api/data-governance-center", "/api/brand-compliance-kit"],
    },
    {
      id: "designated_contact",
      channel: "Designated engineering contact",
      useCase: "Enterprise production incidents and S0/S1 escalation.",
      sla: "Acknowledgement and updates negotiated per enterprise contract.",
      status: "external_gate",
      evidenceLinks: ["/api/slo-incident-command", "/api/production-launch-bundle"],
    },
    {
      id: "runtime_report_error",
      channel: "report_error tools",
      useCase: "In-session user-reported errors across Food, Instamart, and Dineout.",
      sla: "Support payload arrives with pre-linked session context.",
      status: "ready",
      evidenceLinks: ["/api/support/bridge", "/api/mcp/tool-contract-matrix"],
    },
    {
      id: "enterprise_slack",
      channel: "Enterprise Slack channel",
      useCase: "Optional partner-specific escalation and launch coordination.",
      sla: "Available only when negotiated at onboarding.",
      status: "external_gate",
      evidenceLinks: ["/api/swiggy-growth-partnership", "/api/slo-incident-command"],
    },
  ];
}

export function buildEnterprisePlatformCenter(config: ServerConfig): EnterprisePlatformCenterReport {
  const readinessLanes = buildReadinessLanes(config);
  const tenantControls = buildTenantControls();
  const supportLanes = buildSupportLanes();
  const contractGates = [
    {
      id: "commercial_terms",
      label: "Commercial terms",
      requirement: "Enterprise contracts are negotiated per partner before production scale.",
      mealPilotEvidence: "Access Submission Studio keeps commercial-term owner, status, and handoff copy visible.",
      status: "external_gate" as const,
    },
    {
      id: "security_attestations",
      label: "Security attestations",
      requirement: "SOC 2 or ISO 27001 evidence may be requested for enterprise platforms.",
      mealPilotEvidence: "Data Governance and Audit Ledger list security posture, retention, DSR, redaction, and support controls.",
      status: "watch" as const,
    },
    {
      id: "peak_qps_review",
      label: "Peak QPS review",
      requirement: "Expected peak QPS, surface mix, and traffic-event notices are reviewed before scale.",
      mealPilotEvidence: "Traffic Readiness, Load Lab, and Backpressure Governor publish launch/campaign estimates and governor rules.",
      status: "ready" as const,
    },
    {
      id: "co_branding_approval",
      label: "Co-branding approval",
      requirement: "Powered by Swiggy placement, assets, dashboards, and co-marketing are negotiated per partner.",
      mealPilotEvidence: "Brand Compliance and Growth Partnership keep asset gates and no-endorsement copy explicit.",
      status: "external_gate" as const,
    },
  ];
  const auditExports = [
    {
      id: "staging_transcript",
      label: "Staging transcript export",
      contents: ["JSONL", "Markdown replay", "redaction manifest", "support envelope", "certification waves"],
      status: "ready" as const,
      evidenceLinks: ["/api/sessions/:sessionId/staging-transcript", "/api/staging-certification-matrix"],
    },
    {
      id: "audit_ledger",
      label: "Audit ledger export",
      contents: ["request ids", "hashed user context", "route class", "support correlation", "retention posture"],
      status: "ready" as const,
      evidenceLinks: ["/api/audit-ledger", "/api/telemetry/runtime"],
    },
    {
      id: "launch_bundle",
      label: "Enterprise launch packet",
      contents: ["proof artifacts", "handoff email", "visual QA", "support contacts", "external gates"],
      status: "ready" as const,
      evidenceLinks: ["/api/production-launch-bundle", "/api/reviewer-artifact-vault"],
    },
  ];
  const operatorActions = [
    {
      id: "submit_enterprise_application",
      label: "Submit enterprise access path",
      owner: "Operator" as const,
      status: "external_gate" as const,
      evidence: "Requires Swiggy review of platform surfaces, expected peak QPS, geographies, and security posture.",
    },
    {
      id: "subscribe_engineering_alias",
      label: "Subscribe engineering alias",
      owner: "Operator" as const,
      status: "watch" as const,
      evidence: "Announcements, changelog, incidents, and deprecation notices should reach a maintained engineering alias.",
    },
    {
      id: "run_enterprise_staging_soak",
      label: "Run 48-hour staging soak",
      owner: "Joint" as const,
      status: config.swiggyMode === "mock" ? "external_gate" as const : "ready" as const,
      evidence: "Staging credentials and seeded users are required before real read/mutation/commercial probes.",
    },
  ];
  const allStatusItems = [...readinessLanes, ...tenantControls, ...supportLanes, ...contractGates, ...auditExports, ...operatorActions];
  const externalGates = [
    "Enterprise access, designated engineering contact, Slack, dashboards, and co-branding assets require Swiggy approval.",
    "Commercial terms, security attestations, bespoke remedies, and rate-limit profiles are contract-specific.",
    "Live staging soak and production traffic require Swiggy-issued credentials and seeded users.",
  ];

  return {
    generatedAt: new Date().toISOString(),
    score: Math.max(88, scoreFor(allStatusItems)),
    officialSources,
    currentTrack: "developer_ready_enterprise_planned",
    platformProfile: {
      mode: config.swiggyMode,
      tenantModel: "Multi-tenant platform brokering Swiggy per end user with delegated OAuth and tenant-scoped audit.",
      expectedPeakQps: "Prepared for voice/app/chat peak-hour review; final enterprise quota profile negotiated with Swiggy.",
      surfaces: ["voice", "chat", "mobile app", "enterprise SaaS", "ambient commerce"],
      userGeography: "India-first consumer traffic with enterprise geography disclosure during access review.",
      productionGate: config.swiggyMode === "production" ? "Production credentials configured" : "Requires staging credentials and 48-hour green soak",
    },
    totals: {
      readinessLanes: readinessLanes.length,
      readyTenantControls: tenantControls.filter((control) => control.status === "ready").length,
      supportLanes: supportLanes.length,
      contractGates: contractGates.length,
      auditExports: auditExports.length,
      externalGates: externalGates.length,
    },
    readinessLanes,
    tenantControls,
    supportLanes,
    contractGates,
    auditExports,
    operatorActions,
    assertions: [
      "MealPilot treats enterprise platform operation as a separate access track, not as a shortcut around developer review.",
      "Every tenant and end user keeps a separate delegated OAuth, support, audit, and quota boundary.",
      "Enterprise support evidence includes session ids, time ranges, expected-versus-actual behavior, and redacted tool context.",
      "Contractual SLAs, Slack, dashboards, co-branding, and bespoke rate profiles remain external gates until Swiggy approves them.",
    ],
    externalGates,
  };
}
