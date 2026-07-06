import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  McpServerCoverage,
  RuntimeTelemetryReport,
  SwiggyBenefitsActivationCenter,
  SwiggyBenefitsActivationCta,
  SwiggyBenefitsActivationLane,
  SwiggyBenefitsActivationStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildBrandComplianceKit } from "./brandCompliance.js";
import { buildEnterprisePlatformCenter } from "./enterprisePlatformCenter.js";
import { buildSwiggyGrowthPartnershipCenter } from "./growthPartnership.js";
import { buildSwiggyPartnerSuccessDesk } from "./partnerSuccessDesk.js";
import { buildSwiggyPartnerSupportRoom } from "./partnerSupportRoom.js";
import { buildSwiggyQuotaNegotiationCenter } from "./quotaNegotiationCenter.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function statusWeight(status: SwiggyBenefitsActivationStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.82;
  return 0.68;
}

function lane(input: SwiggyBenefitsActivationLane): SwiggyBenefitsActivationLane {
  return input;
}

function cta(input: SwiggyBenefitsActivationCta): SwiggyBenefitsActivationCta {
  return input;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function buildSwiggyBenefitsActivationCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
}): SwiggyBenefitsActivationCenter {
  const growth = buildSwiggyGrowthPartnershipCenter();
  const quota = buildSwiggyQuotaNegotiationCenter({ config: options.config, plans: options.plans });
  const brand = buildBrandComplianceKit();
  const partnerSuccess = buildSwiggyPartnerSuccessDesk(options);
  const partnerSupport = buildSwiggyPartnerSupportRoom(options);
  const enterprise = buildEnterprisePlatformCenter(options.config);

  const lanes = [
    lane({
      id: "live_api_access",
      label: "Live Food, Instamart, and Dineout APIs",
      officialBenefit: "Builders get access to real Swiggy MCP APIs after review and production approval.",
      owner: "Joint",
      status: "operator_input",
      mealPilotActivation: `${options.coverage.reduce((sum, server) => sum + server.totalTools, 0)}/35 local tool contracts are mapped with staging and production gates.`,
      proofLinks: ["/api/mcp/catalog", "/api/mcp/tool-contract-matrix", "/api/staging-certification-matrix"],
      nextAction: "Complete access review, staging credentials, 48-hour soak, and production credential handoff.",
    }),
    lane({
      id: "quota_expansion",
      label: "Rate-limit and capacity expansion",
      officialBenefit: "Swiggy says builders can request higher limits when the product needs more capacity.",
      owner: "Joint",
      status: quota.totals.swiggyGates > 0 ? "swiggy_gate" : "ready",
      mealPilotActivation: `${quota.totals.readyAsks}/${quota.totals.asks} quota asks are ready with ${quota.forecast.peakQps.toFixed(2)} peak QPS forecast.`,
      proofLinks: ["/api/swiggy-quota-negotiation-center", "/api/traffic-readiness-plan", "/api/mcp/backpressure-governor"],
      nextAction: "Send the capacity packet before campaign traffic and retain Swiggy acknowledgement.",
    }),
    lane({
      id: "technical_support",
      label: "Technical support and integration help",
      officialBenefit: "Builders can reach support and integration help through builders@swiggy.in and approved partner channels.",
      owner: "MealPilot",
      status: "ready",
      mealPilotActivation: `${partnerSupport.totals.channels} support channels and ${partnerSupport.totals.incidentLanes} incident lanes are prepared.`,
      proofLinks: ["/api/swiggy-partner-support-room", "/api/support/bridge", "/api/slo-incident-command"],
      nextAction: "Use report_error only after an observed issue and attach redacted runtime/audit evidence.",
    }),
    lane({
      id: "co_branding",
      label: "Powered by Swiggy and co-branding",
      officialBenefit: "Approved builders can use appropriate Powered by Swiggy attribution and may negotiate co-branding.",
      owner: "Swiggy",
      status: "swiggy_gate",
      mealPilotActivation: `${brand.rules.filter((ruleItem) => ruleItem.status === "ready").length}/${brand.rules.length} brand rules are ready; official assets remain external.`,
      proofLinks: ["/api/brand-compliance-kit", "/api/production-launch-bundle"],
      nextAction: "Request official brand assets and written co-branding approval after onboarding.",
    }),
    lane({
      id: "growth_partnership",
      label: "Growth partnership",
      officialBenefit: "Strong builders can work with Swiggy on launch experiments, metrics, co-marketing, and strategic support.",
      owner: "Joint",
      status: "operator_input",
      mealPilotActivation: `${growth.readyExperiments}/${growth.totalExperiments} growth experiments and ${growth.assets.length} proof assets are packaged.`,
      proofLinks: ["/api/swiggy-growth-partnership", "/api/swiggy-showcase-submission-center", "/api/production-launch-bundle"],
      nextAction: "Send the demo, proof assets, and metric pack after access approval without claiming endorsement.",
    }),
    lane({
      id: "showcase_visibility",
      label: "Get noticed and featured",
      officialBenefit: "Swiggy highlights standout projects and invites builders to share demos.",
      owner: "Operator",
      status: "operator_input",
      mealPilotActivation: "Demo Evidence Director, Submission Console, and Reviewer Artifact Vault provide the showcase packet.",
      proofLinks: ["/api/swiggy-demo-evidence-director", "/api/submission-console", "/api/reviewer-artifact-vault"],
      nextAction: "Record the final short demo and send the access/showcase handoff manually.",
    }),
    lane({
      id: "hiring_visibility",
      label: "Developer and hiring visibility",
      officialBenefit: "Swiggy positions impressive developer builds as visibility signals for builders and possible hiring conversations.",
      owner: "Operator",
      status: "operator_input",
      mealPilotActivation: "The launch story, coding-agent governance, and artifact vault package the engineering narrative and proof.",
      proofLinks: ["/api/swiggy-builders-launch-story", "/api/coding-agent-governance", "/api/reviewer-artifact-vault"],
      nextAction: "Attach a concise technical narrative only after the demo proof is current.",
    }),
    lane({
      id: "enterprise_support",
      label: "Enterprise support and partner manager",
      officialBenefit: "Enterprise builders may receive priority Slack, partner manager, dashboards, and dedicated engineering support.",
      owner: "Swiggy",
      status: "swiggy_gate",
      mealPilotActivation: `${enterprise.score}/100 enterprise platform proof covers tenant, delegated-auth, quota, support, audit, and contract gates.`,
      proofLinks: ["/api/enterprise-platform-center", "/api/enterprise-delegated-auth", "/api/swiggy-partner-success-desk"],
      nextAction: "Request enterprise support channels only after Swiggy approves the enterprise or partner track.",
    }),
  ];

  const activationCtas = [
    cta({
      id: "request_access",
      label: "Request access",
      cta: "Open the official access form with demo, redirect URI, requested servers, and expected volume ready.",
      owner: "Operator",
      status: "operator_input",
      evidenceLinks: ["/api/access-submission-studio", "/api/swiggy-access-evidence-matrix"],
    }),
    cta({
      id: "send_demo",
      label: "Send demo",
      cta: "Email builders@swiggy.in with the local demo video, builder packet, proof routes, and credential gates.",
      owner: "Operator",
      status: "operator_input",
      evidenceLinks: ["/api/swiggy-demo-evidence-director", "/api/builder-packet-export"],
    }),
    cta({
      id: "ask_quota",
      label: "Ask for capacity",
      cta: "Send the quota capacity packet before public launch, event traffic, or background jobs.",
      owner: "Joint",
      status: quota.totals.swiggyGates > 0 ? "swiggy_gate" : "ready",
      evidenceLinks: ["/api/swiggy-quota-negotiation-center"],
    }),
    cta({
      id: "ask_support",
      label: "Ask support",
      cta: "Attach support-safe telemetry, request ids, session ids, and report_error context.",
      owner: "MealPilot",
      status: "ready",
      evidenceLinks: ["/api/swiggy-partner-support-room", "/api/support/bridge"],
    }),
    cta({
      id: "ask_growth",
      label: "Ask growth partnership",
      cta: "Submit the launch story, metric pack, screenshots, and co-marketing asks after access approval.",
      owner: "Joint",
      status: "operator_input",
      evidenceLinks: ["/api/swiggy-growth-partnership", "/api/swiggy-showcase-submission-center"],
    }),
    cta({
      id: "ask_cobranding",
      label: "Ask co-branding approval",
      cta: "Request official brand assets, Powered by Swiggy placement approval, and partner review.",
      owner: "Swiggy",
      status: "swiggy_gate",
      evidenceLinks: ["/api/brand-compliance-kit"],
    }),
  ];

  const proofLinks = unique([...lanes.flatMap((item) => item.proofLinks), ...activationCtas.flatMap((item) => item.evidenceLinks)]);
  const scoreItems = [...lanes.map((item) => item.status), ...activationCtas.map((item) => item.status)];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      benefits: lanes.length,
      ready: lanes.filter((item) => item.status === "ready").length,
      operatorInputs: lanes.filter((item) => item.status === "operator_input").length,
      swiggyGates: lanes.filter((item) => item.status === "swiggy_gate").length,
      activationCtas: activationCtas.length,
      proofLinks: proofLinks.length,
    },
    lanes,
    activationCtas,
    launchReadiness: {
      growthExperimentsReady: `${growth.readyExperiments}/${growth.totalExperiments}`,
      quotaAsksReady: `${quota.totals.readyAsks}/${quota.totals.asks}`,
      brandRulesReady: `${brand.rules.filter((ruleItem) => ruleItem.status === "ready").length}/${brand.rules.length}`,
      supportChannelsReady: `${partnerSupport.totals.readyChannels}/${partnerSupport.totals.channels}`,
      partnerSuccessReady: `${partnerSuccess.totals.ready}/${partnerSuccess.totals.lanes}`,
    },
    partnerEmail: {
      to: "builders@swiggy.in",
      subject: "MealPilot Swiggy Builders benefits activation packet",
      bodyPreview:
        "MealPilot is ready to activate Swiggy Builders benefits with proof for live API access, quota profile, technical support, Powered by Swiggy attribution, showcase visibility, growth experiments, and enterprise support gates. External asks: access approval, staging/production credentials, official brand assets, capacity acknowledgement, co-marketing approval, and enterprise support channels.",
    },
    assertions: [
      "Every Builders benefit maps to a concrete MealPilot proof route, owner, next action, and Swiggy/operator gate.",
      "Rate-limit, support, co-branding, growth, hiring visibility, and enterprise support are not treated as automatic entitlements.",
      "Activation CTAs are local evidence or mailto/form handoffs; no external Swiggy form, email, Slack, or support action is submitted automatically.",
      "The center composes existing verified proof surfaces so reviewers can drill into each benefit before approval.",
    ],
    externalGates: [
      "Swiggy must approve Builder Access, staging credentials, production credentials, and any rate-limit increase.",
      "Swiggy must issue official brand assets, co-branding approval, showcase placement, partner manager, Slack, dashboards, or enterprise terms.",
      "Operator must record the demo, submit official forms, send emails, and retain Swiggy acknowledgements before public claims.",
    ],
  };
}
