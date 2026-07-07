import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  RuntimeTelemetryReport,
  SwiggyBuildersEnterpriseWitness,
  SwiggyBuildersEnterpriseWitnessGroup,
  SwiggyBuildersEnterpriseWitnessRow,
  SwiggyBuildersEnterpriseWitnessStatus,
} from "../../src/domain/types.js";
import { buildBrandComplianceKit } from "./brandCompliance.js";
import { buildEnterpriseDelegatedAuthCenter } from "./enterpriseDelegatedAuth.js";
import { buildEnterprisePlatformCenter } from "./enterprisePlatformCenter.js";
import { buildSwiggyGrowthPartnershipCenter } from "./growthPartnership.js";
import { buildSwiggyQuotaNegotiationCenter } from "./quotaNegotiationCenter.js";
import { buildRateLimitPlan, buildVersionMonitor } from "./productionEvidence.js";
import { buildSloIncidentCommandCenter } from "./sloIncidentCommand.js";
import { buildSupportBridgeReport } from "./supportBridge.js";
import { buildTrafficReadinessPlan } from "./trafficReadiness.js";
import { buildSwiggyOperatingContractCenter } from "./operatingContractCenter.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function weightFor(status: SwiggyBuildersEnterpriseWitnessStatus) {
  if (status === "proven") return 1;
  if (status === "ready") return 0.94;
  if (status === "watch") return 0.78;
  if (status === "operator_gate") return 0.72;
  return 0.64;
}

function groupFor(row: SwiggyBuildersEnterpriseWitnessRow) {
  if (row.kind === "platform_operator" || row.kind === "delegated_auth" || row.kind === "tenant_control") {
    return "platform_auth";
  }
  if (row.kind === "quota_capacity" || row.kind === "support_sla") return "operations_support";
  if (row.kind === "contract_compliance" || row.kind === "brand_growth") return "governance_commercial";
  return "audit_launch";
}

function row(input: SwiggyBuildersEnterpriseWitnessRow): SwiggyBuildersEnterpriseWitnessRow {
  return input;
}

export function buildSwiggyBuildersEnterpriseWitness(options: {
  config: ServerConfig;
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
}): SwiggyBuildersEnterpriseWitness {
  const atlas = buildSwiggyWebsiteAtlas();
  const enterpriseAuth = buildEnterpriseDelegatedAuthCenter(options.config);
  const enterprisePlatform = buildEnterprisePlatformCenter(options.config);
  const rateLimit = buildRateLimitPlan(options.plans);
  const trafficReadiness = buildTrafficReadinessPlan({ plans: options.plans, config: options.config });
  const sloIncident = buildSloIncidentCommandCenter({
    plans: options.plans,
    telemetry: options.telemetry,
    config: options.config,
  });
  const supportBridge = buildSupportBridgeReport({ plans: options.plans });
  const version = buildVersionMonitor();
  const operatingContract = buildSwiggyOperatingContractCenter({
    config: options.config,
    rateLimit,
    trafficReadiness,
    sloIncident,
    supportBridge,
    version,
  });
  const quota = buildSwiggyQuotaNegotiationCenter({ plans: options.plans, config: options.config });
  const brand = buildBrandComplianceKit();
  const growth = buildSwiggyGrowthPartnershipCenter();

  const rows = [
    row({
      id: "platform_operator_track",
      label: "Platform operator track",
      kind: "platform_operator",
      officialSignal: "Swiggy separates developer builders from enterprise platform operators with custom onboarding and partner review.",
      sourceUrl: `${atlas.officialSource}docs/start/enterprise/`,
      owner: "Joint",
      status: enterprisePlatform.readinessLanes.some((lane) => lane.id === "platform_operator_path" && lane.status === "watch")
        ? "watch"
        : "ready",
      mealPilotSurface: "Enterprise Platform Center and Access Dossier",
      evidence: `${enterprisePlatform.totals.readinessLanes} enterprise readiness lanes and ${enterprisePlatform.platformProfile.surfaces.length} platform surfaces are modeled.`,
      routeOptimization: "Keep consumer MealPilot journeys and enterprise platform onboarding separate so delegated-auth, quota, and support checks do not leak into the developer path.",
      riskBoundary: "Enterprise onboarding, commercial terms, partner contacts, dashboards, and production access remain Swiggy-owned approvals.",
      nextAction: "Use the enterprise platform packet only after the developer-track proof and access handoff are ready.",
      proofLinks: ["/api/enterprise-platform-center", "/api/swiggy-access-dossier", "/api/access-submission-studio"],
      relatedApis: ["/api/swiggy-builders-journey-gates", "/api/production-launch-bundle"],
    }),
    row({
      id: "delegated_oauth_boundary",
      label: "Delegated OAuth boundary",
      kind: "delegated_auth",
      officialSignal: "Enterprise operators authenticate each end user with delegated OAuth and per-user tokens.",
      sourceUrl: `${atlas.officialSource}docs/start/enterprise/delegated-auth/`,
      owner: "MealPilot",
      status: enterpriseAuth.score >= 88 ? "proven" : "watch",
      mealPilotSurface: "Enterprise Delegated Auth Center and Auth Lifecycle Center",
      evidence: `${enterpriseAuth.flow.length} OBO flow steps, ${enterpriseAuth.tokenLifecycle.length} token lifecycle rules, and ${enterpriseAuth.storageRules.length} storage rules are defined.`,
      routeOptimization: "Broker per-user Food, Instamart, and Dineout calls through the MCP Gateway instead of sharing a platform token.",
      riskBoundary: "No Swiggy password, OTP, payment credential, bearer token, or platform-wide user token is collected or shared.",
      nextAction: "Replace mock client placeholders only after Swiggy approves the platform client and redirect allowlist.",
      proofLinks: ["/api/enterprise-delegated-auth", "/api/swiggy-auth-lifecycle-center", "/api/mcp-gateway"],
      relatedApis: ["/api/credential-onboarding", "/api/data-governance-center"],
    }),
    row({
      id: "tenant_control_model",
      label: "Tenant and end-user controls",
      kind: "tenant_control",
      officialSignal: "Enterprise integrations need tenant isolation, per-user consent, audit exports, and support-safe context.",
      sourceUrl: `${atlas.officialSource}docs/operate/data-and-compliance/`,
      owner: "MealPilot",
      status: enterprisePlatform.totals.readyTenantControls >= enterprisePlatform.tenantControls.length ? "proven" : "watch",
      mealPilotSurface: "Enterprise Platform Center, Data Governance, Audit Ledger",
      evidence: `${enterprisePlatform.totals.readyTenantControls}/${enterprisePlatform.tenantControls.length} tenant controls are ready with scoped token, quota, support, and audit boundaries.`,
      routeOptimization: "Scope route budgets, support context, and audit exports per tenant while still routing live commerce per Swiggy end user.",
      riskBoundary: "Tenant policy cannot override Swiggy end-user OAuth consent or commercial confirmation.",
      nextAction: "Attach tenant control rows to any future enterprise architecture-review packet.",
      proofLinks: ["/api/enterprise-platform-center", "/api/data-governance-center", "/api/audit-ledger"],
      relatedApis: ["/api/privacy/export", "/api/privacy"],
    }),
    row({
      id: "quota_capacity_review",
      label: "Quota and capacity review",
      kind: "quota_capacity",
      officialSignal: "Enterprise launches must disclose expected QPS, traffic events, capacity needs, and rate-limit posture.",
      sourceUrl: `${atlas.officialSource}docs/operate/rate-limits/`,
      owner: "Joint",
      status: quota.totals.swiggyGates > 0 ? "swiggy_gate" : "ready",
      mealPilotSurface: "Quota Negotiation Center, Traffic Readiness, Load Lab, Backpressure Governor",
      evidence: `${quota.totals.asks} quota asks, ${quota.totals.scenarios} load scenarios, and ${trafficReadiness.projectedDailyToolCalls.toLocaleString("en-IN")} projected daily tool calls are packet-ready.`,
      routeOptimization: "Use route optimization, request coalescing, and commercial single-flight rules before asking Swiggy for higher limits.",
      riskBoundary: "Higher quotas, background jobs, campaign spikes, and production traffic require Swiggy approval.",
      nextAction: "Send the capacity packet only when operator launch date, campaign traffic, and staging evidence are known.",
      proofLinks: ["/api/swiggy-quota-negotiation-center", "/api/traffic-readiness-plan", "/api/swiggy-load-lab"],
      relatedApis: ["/api/mcp/backpressure-governor", "/api/rate-limit-plan"],
    }),
    row({
      id: "support_sla_lane",
      label: "Support and SLA lane",
      kind: "support_sla",
      officialSignal: "Operate guidance calls for support channels, report_error payloads, uptime targets, and incident readiness.",
      sourceUrl: `${atlas.officialSource}docs/operate/support/`,
      owner: "Joint",
      status: operatingContract.totals.readyPillars >= 4 && supportBridge.reportErrorTools.length >= 3 ? "ready" : "watch",
      mealPilotSurface: "Operating Contract, Support Bridge, SLO Incident Command",
      evidence: `${operatingContract.totals.readyPillars}/${operatingContract.totals.pillars} operating pillars, ${supportBridge.reportErrorTools.length} report_error payloads, and ${sloIncident.latencyTargets.length} latency classes are ready.`,
      routeOptimization: "Attach request ids, session ids, route class, expected-versus-actual behavior, and redacted tool context before escalation.",
      riskBoundary: "Contractual response targets, Slack channels, dashboards, and named partner managers remain enterprise contract gates.",
      nextAction: "Keep S0/S1 support packets current while waiting for official staging or production escalation lanes.",
      proofLinks: ["/api/swiggy-operating-contract-center", "/api/support/bridge", "/api/slo-incident-command"],
      relatedApis: ["/api/swiggy-partner-support-room", "/api/error-intelligence"],
    }),
    row({
      id: "contract_compliance_pack",
      label: "Contract and compliance pack",
      kind: "contract_compliance",
      officialSignal: "Enterprise operation includes compliance, security posture, versioning, changelog, and signed commercial terms.",
      sourceUrl: `${atlas.officialSource}docs/operate/access/`,
      owner: "Joint",
      status: operatingContract.score >= 84 && brand.score >= 84 ? "ready" : "watch",
      mealPilotSurface: "Operating Contract, Brand Compliance, Version Monitor, Data Governance",
      evidence: `${operatingContract.totals.pillars} operating pillars, ${operatingContract.totals.readinessGates} launch gates, ${brand.launchChecklist.length} brand checklist items, and v${version.currentMajor} route pinning are visible.`,
      routeOptimization: "Centralize compliance, versioning, brand, and launch proof into one packet so reviewers do not chase scattered docs.",
      riskBoundary: "Legal terms, DPA, white-label rights, approved Swiggy marks, and production approval cannot be inferred locally.",
      nextAction: "Attach contract/compliance proof to the enterprise intro call only after operator legal and security owners review it.",
      proofLinks: ["/api/swiggy-operating-contract-center", "/api/brand-compliance-kit", "/api/version-monitor"],
      relatedApis: ["/api/data-governance-center", "/api/compliance-evidence"],
    }),
    row({
      id: "audit_export_launch",
      label: "Audit export and launch packet",
      kind: "audit_export",
      officialSignal: "Enterprise partners need replayable launch evidence, staging transcripts, support envelopes, and redacted audit exports.",
      sourceUrl: `${atlas.officialSource}docs/build/ship-to-production/`,
      owner: "MealPilot",
      status: enterprisePlatform.totals.auditExports >= 3 ? "proven" : "watch",
      mealPilotSurface: "Enterprise Platform Center, Reviewer Artifact Vault, Builder Packet Export",
      evidence: `${enterprisePlatform.totals.auditExports} audit exports and ${enterprisePlatform.auditExports.reduce((sum, item) => sum + item.contents.length, 0)} export contents are enumerated.`,
      routeOptimization: "Bundle transcript, audit, visual QA, support, and launch evidence so enterprise review can replay one packet.",
      riskBoundary: "Exports are redacted proof artifacts; they do not include bearer tokens, raw payment data, full addresses, or full upstream payloads.",
      nextAction: "Regenerate builder packet and visual QA after any enterprise proof row changes.",
      proofLinks: ["/api/enterprise-platform-center", "/api/reviewer-artifact-vault", "/api/builder-packet-export"],
      relatedApis: ["/api/visual-qa-center", "/api/sessions/:sessionId/staging-transcript"],
    }),
    row({
      id: "brand_growth_governance",
      label: "Brand, growth, and partner governance",
      kind: "brand_growth",
      officialSignal: "Enterprise and growth promises include co-branding review, partner channels, showcase placement, analytics, and higher limits.",
      sourceUrl: `${atlas.officialSource}builders/access/`,
      owner: "Swiggy",
      status: growth.partnershipAsks.length >= 6 ? "swiggy_gate" : "watch",
      mealPilotSurface: "Brand Compliance, Growth Partnership, Benefits Activation, Partner Success Desk",
      evidence: `${growth.partnershipAsks.length} partner asks, ${growth.totalExperiments} growth experiments, and ${brand.assetGates.length} brand asset gates are explicit.`,
      routeOptimization: "Promote only approved, source-linked growth assets while keeping public claims, dashboards, Slack, and co-marketing behind Swiggy gates.",
      riskBoundary: "No white-label, Powered by Swiggy, feature placement, analytics dashboard, or partnership claim is made without written approval.",
      nextAction: "Use Growth Partnership composer to prepare one ask at a time after demo and staging proof exist.",
      proofLinks: ["/api/brand-compliance-kit", "/api/swiggy-growth-partnership", "/api/swiggy-benefits-activation-center"],
      relatedApis: ["/api/swiggy-partner-success-desk", "/api/swiggy-builders-benefits-witness"],
    }),
  ];

  const proofLinks = unique(rows.flatMap((item) => item.proofLinks));
  const groupDefs = [
    { id: "platform_auth", label: "Platform auth and tenants" },
    { id: "operations_support", label: "Operations, quota, and support" },
    { id: "governance_commercial", label: "Governance and commercial terms" },
    { id: "audit_launch", label: "Audit and launch proof" },
  ];
  const groups: SwiggyBuildersEnterpriseWitnessGroup[] = groupDefs.map((group) => {
    const groupRows = rows.filter((item) => groupFor(item) === group.id);
    return {
      id: group.id,
      label: group.label,
      rows: groupRows.length,
      proven: groupRows.filter((item) => item.status === "proven").length,
      ready: groupRows.filter((item) => item.status === "ready").length,
      watch: groupRows.filter((item) => item.status === "watch").length,
      gates: groupRows.filter((item) => item.status === "operator_gate" || item.status === "swiggy_gate").length,
      proofLinks: unique(groupRows.flatMap((item) => item.proofLinks)),
    };
  });
  const operatorGates = rows.filter((item) => item.status === "operator_gate").length;
  const swiggyGates = rows.filter((item) => item.status === "swiggy_gate").length;
  const watch = rows.filter((item) => item.status === "watch").length;
  const score = Math.round((rows.reduce((sum, item) => sum + weightFor(item.status), 0) / rows.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    decision: swiggyGates > 2 ? "enterprise_blocked" : watch > 0 || swiggyGates > 0 ? "enterprise_watch" : "enterprise_ready",
    officialSources: unique([
      atlas.officialSource,
      ...enterpriseAuth.officialSources,
      ...enterprisePlatform.officialSources,
      ...operatingContract.officialSources,
      ...quota.officialSources,
      ...brand.officialSources,
      ...growth.officialSources,
    ]),
    currentTrack: "developer_ready_enterprise_planned",
    totals: {
      rows: rows.length,
      proven: rows.filter((item) => item.status === "proven").length,
      ready: rows.filter((item) => item.status === "ready").length,
      watch,
      operatorGates,
      swiggyGates,
      proofLinks: proofLinks.length,
      delegatedFlowSteps: enterpriseAuth.flow.length,
      onboardingSteps: enterpriseAuth.onboardingSequence.length,
      platformLanes: enterprisePlatform.totals.readinessLanes,
      tenantControls: enterprisePlatform.tenantControls.length,
      supportLanes: enterprisePlatform.totals.supportLanes,
      contractGates: enterprisePlatform.totals.contractGates,
      auditExports: enterprisePlatform.totals.auditExports,
      operatingPillars: operatingContract.totals.pillars,
      operatingRunbooks: operatingContract.totals.runbooks,
      partnershipAsks: growth.partnershipAsks.length,
    },
    rows,
    groups,
    commands: [
      {
        id: "enterprise_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-enterprise-witness",
        proves: "Enterprise delegated auth, tenant controls, quota, support, contracts, audit exports, brand, and growth gates are witnessed together.",
        expectedSignal: "totals.rows >= 8 && totals.delegatedFlowSteps >= 8",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke keeps enterprise witness aligned with platform, operating, quota, support, and brand evidence.",
        expectedSignal: "enterpriseWitnessScore >= 84",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Enterprise Witness card is captured with every reviewer-critical Launch Center surface.",
        expectedSignal: "78 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Enterprise access is represented as a separate platform-operator track, not a shortcut around developer access review.",
      "Delegated OAuth, per-user token storage, tenant support routing, quota, SLO, audit export, brand, and growth claims each have explicit proof links.",
      "Commercial terms, partner contracts, co-branding, Slack, dashboards, higher limits, staging credentials, and production approval remain Swiggy-owned gates.",
      "Enterprise witness rows reuse existing proof centers rather than creating a second source of truth.",
    ],
    externalGates: [
      "Swiggy must approve enterprise platform access, delegated-auth production cutover, partner contracts, and final redirect allowlists.",
      "Swiggy must issue staging credentials, seeded users, quota profiles, support lanes, dashboards, Slack, and production credentials.",
      "Operators must complete legal/security review and submit any enterprise application, capacity notice, or co-branding ask manually.",
    ],
  };
}
