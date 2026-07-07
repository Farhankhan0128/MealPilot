import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  McpServerCoverage,
  RuntimeTelemetryReport,
  SwiggyPartnerSuccessDesk,
  SwiggyPartnerSuccessHandoffDecision,
  SwiggyPartnerSuccessHandoffPacket,
  SwiggyPartnerSuccessLane,
  SwiggyPartnerSuccessStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildMcpBackpressureGovernor } from "./backpressureGovernor.js";
import { buildSwiggyGrowthPartnershipCenter } from "./growthPartnership.js";
import { buildSloIncidentCommandCenter } from "./sloIncidentCommand.js";
import { buildSupportBridgeReport } from "./supportBridge.js";
import { buildTrafficReadinessPlan } from "./trafficReadiness.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function lane(input: SwiggyPartnerSuccessLane): SwiggyPartnerSuccessLane {
  return input;
}

function statusWeight(status: SwiggyPartnerSuccessStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.78;
  return 0.58;
}

function hasEmail(value?: string) {
  return Boolean(value?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
}

function emailIdForLane(laneId: string) {
  if (laneId === "traffic_capacity" || laneId === "backpressure") return "capacity";
  if (laneId === "demo_handoff") return "access";
  return "support";
}

function handoffDecision(
  laneItem: SwiggyPartnerSuccessLane | null,
  missingInputs: string[],
): SwiggyPartnerSuccessHandoffDecision {
  if (!laneItem) return "unknown_success_lane";
  if (laneItem.status === "external_gate") return "swiggy_gate";
  if (missingInputs.length > 0) return "needs_operator_input";
  return "ready_local_handoff";
}

function readinessFor(decision: SwiggyPartnerSuccessHandoffDecision) {
  if (decision === "ready_local_handoff") return 100;
  if (decision === "needs_operator_input") return 68;
  if (decision === "swiggy_gate") return 56;
  return 0;
}

export function buildSwiggyPartnerSuccessDesk(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
}): SwiggyPartnerSuccessDesk {
  const supportBridge = buildSupportBridgeReport({ plans: options.plans });
  const trafficReadiness = buildTrafficReadinessPlan({ plans: options.plans, config: options.config });
  const backpressureGovernor = buildMcpBackpressureGovernor(options.plans.at(-1));
  const growthPartnership = buildSwiggyGrowthPartnershipCenter();
  const accessSubmission = buildAccessSubmissionStudio({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.plans.at(-1),
  });
  const sloIncident = buildSloIncidentCommandCenter({
    plans: options.plans,
    telemetry: options.telemetry,
    config: options.config,
  });

  const lanes = [
    lane({
      id: "demo_handoff",
      label: "Demo and access handoff",
      officialSignal: "Swiggy asks builders to send a working demo and apply for production access.",
      mealPilotControl: `${accessSubmission.totals.readyRequiredAttachments}/${accessSubmission.totals.totalRequiredAttachments} required attachments are packaged with copy-ready access fields.`,
      owner: "Operator",
      status: accessSubmission.canSubmitNow ? "manual_input" : "ready",
      evidenceLinks: ["/api/access-submission-studio", "/api/builder-packet-export", "/api/demo-studio"],
      nextAction: "Record the demo URL, paste the prepared fields into the official access form, and send the handoff email manually.",
    }),
    lane({
      id: "developer_support",
      label: "Developer support bridge",
      officialSignal: "Swiggy lists builders@swiggy.in, integration help, and report_error-style support workflows.",
      mealPilotControl: `${supportBridge.reportErrorTools.length} report_error payloads cover Food, Instamart, and Dineout with redaction rules.`,
      owner: "MealPilot",
      status: "ready",
      evidenceLinks: ["/api/support/bridge", "/api/error-intelligence", "/api/audit-ledger"],
      nextAction: "Use report_error after an observed user-visible issue, then email builders@swiggy.in with the redacted support packet.",
    }),
    lane({
      id: "slo_incident",
      label: "SLO and incident operations",
      officialSignal: "Enterprise and operate docs emphasize SLA, status, support cadence, and maintenance notice discipline.",
      mealPilotControl: `${sloIncident.uptimeTargets.length} uptime targets and ${sloIncident.incidentComms.length} incident severities are ready.`,
      owner: "Joint",
      status: "ready",
      evidenceLinks: ["/api/slo-incident-command", "/api/observability/traces", "/api/telemetry/runtime"],
      nextAction: "Attach session ids, runtime telemetry, incident severity, and remediation status to any Swiggy escalation.",
    }),
    lane({
      id: "traffic_capacity",
      label: "Traffic and capacity review",
      officialSignal: "Swiggy says builders start with default rate limits and can ask for higher ceilings when needed.",
      mealPilotControl: `${trafficReadiness.projectedDailyToolCalls.toLocaleString("en-IN")} projected daily calls, ${trafficReadiness.peakQps.toFixed(2)} peak QPS, and a capacity email are ready.`,
      owner: "Joint",
      status: "ready",
      evidenceLinks: ["/api/traffic-readiness-plan", "/api/mcp/backpressure-governor", "/api/swiggy-load-lab"],
      nextAction: "Send capacity profile before public launch or any major traffic event, then honor Swiggy Retry-After guidance.",
    }),
    lane({
      id: "backpressure",
      label: "Backpressure and Retry-After posture",
      officialSignal: "Swiggy's rate-limit docs call out future 429, Retry-After, and X-RateLimit headers.",
      mealPilotControl: `${backpressureGovernor.readyBuckets}/${backpressureGovernor.totalBuckets} throttling buckets are configured with ${backpressureGovernor.maxRetries} max retries.`,
      owner: "MealPilot",
      status: backpressureGovernor.readyBuckets >= 7 ? "ready" : "manual_input",
      evidenceLinks: ["/api/mcp/backpressure-governor", "/api/traffic-readiness-plan", "/api/resilience"],
      nextAction: "Keep commercial actions serialized and never stack exponential backoff on top of Retry-After.",
    }),
    lane({
      id: "growth_showcase",
      label: "Featured builder and growth asks",
      officialSignal: "Swiggy says standout projects can be featured and strong builders may receive growth partnership support.",
      mealPilotControl: `${growthPartnership.readyExperiments}/${growthPartnership.totalExperiments} growth experiments and ${growthPartnership.assets.length} assets are packaged.`,
      owner: "Joint",
      status: "manual_input",
      evidenceLinks: ["/api/swiggy-growth-partnership", "/api/production-launch-bundle", "/api/reviewer-artifact-vault"],
      nextAction: "Send the demo, metrics pack, and launch narrative after access approval; do not claim Swiggy endorsement before approval.",
    }),
    lane({
      id: "enterprise_slack_partner",
      label: "Enterprise Slack and partner manager",
      officialSignal: "Enterprise page references named partner manager, priority Slack, and direct engineering support.",
      mealPilotControl: "Enterprise Platform Center prepares tenant, quota, support, audit, and contract proof; Slack and manager assignment stay external.",
      owner: "Swiggy",
      status: "external_gate",
      evidenceLinks: ["/api/enterprise-platform-center", "/api/enterprise-delegated-auth", "/api/swiggy-growth-partnership"],
      nextAction: "Request Slack, partner manager, dashboard, and co-marketing terms only after Swiggy approves enterprise or production access.",
    }),
  ];

  const proofLinks = unique(lanes.flatMap((item) => item.evidenceLinks));
  const score = Math.round((lanes.reduce((sum, item) => sum + statusWeight(item.status), 0) / lanes.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      lanes: lanes.length,
      ready: lanes.filter((item) => item.status === "ready").length,
      manualInputs: lanes.filter((item) => item.status === "manual_input").length,
      externalGates: lanes.filter((item) => item.status === "external_gate").length,
      proofLinks: proofLinks.length,
    },
    lanes,
    escalationEmails: [
      {
        id: "support",
        label: "Support escalation",
        to: supportBridge.incidentEmail.to,
        subject: supportBridge.incidentEmail.subject,
        source: "/api/support/bridge",
      },
      {
        id: "capacity",
        label: "Capacity upgrade",
        to: trafficReadiness.capacityUpgradeEmail.to,
        subject: trafficReadiness.capacityUpgradeEmail.subject,
        source: "/api/traffic-readiness-plan",
      },
      {
        id: "access",
        label: "Access handoff",
        to: accessSubmission.mailto.to,
        subject: accessSubmission.mailto.subject,
        source: "/api/access-submission-studio",
      },
    ],
    reviewerRunbook: [
      {
        sequence: 1,
        label: "Open access packet and demo handoff",
        evidenceLinks: ["/api/access-submission-studio", "/api/builder-packet-export"],
        status: "manual_input",
      },
      {
        sequence: 2,
        label: "Review support and SLO incident readiness",
        evidenceLinks: ["/api/support/bridge", "/api/slo-incident-command"],
        status: "ready",
      },
      {
        sequence: 3,
        label: "Review traffic, backpressure, and capacity email",
        evidenceLinks: ["/api/traffic-readiness-plan", "/api/mcp/backpressure-governor"],
        status: "ready",
      },
      {
        sequence: 4,
        label: "Submit growth and enterprise asks only after Swiggy approval",
        evidenceLinks: ["/api/swiggy-growth-partnership", "/api/enterprise-platform-center"],
        status: "external_gate",
      },
    ],
    assertions: [
      "Partner Success Desk composes existing verified support, SLO, traffic, backpressure, growth, and access surfaces instead of inventing new Swiggy promises.",
      "No email, Google Form, Slack request, support escalation, or co-marketing claim is sent automatically from local tests.",
      "Production credentials, enterprise Slack, partner manager assignment, higher limits, and co-marketing approval remain explicit Swiggy/operator gates.",
      "Every lane links back to executable MealPilot proof routes for reviewer inspection.",
    ],
    externalGates: [
      "Official access form submission and demo email are operator actions.",
      "Slack, partner manager, dashboard access, bespoke rate limits, and co-marketing approval are Swiggy-owned gates.",
      "Real support reports and production traffic require authenticated Swiggy MCP credentials.",
    ],
  };
}

export function composeSwiggyPartnerSuccessHandoff(
  options: Parameters<typeof buildSwiggyPartnerSuccessDesk>[0] & {
    laneId: string;
    operatorEmail?: string;
    launchWindow?: string;
    contextNote?: string;
  },
): SwiggyPartnerSuccessHandoffPacket {
  const desk = buildSwiggyPartnerSuccessDesk(options);
  const laneItem = desk.lanes.find((item) => item.id === options.laneId) ?? null;
  const escalationEmail =
    desk.escalationEmails.find((item) => item.id === emailIdForLane(options.laneId)) ?? desk.escalationEmails[0] ?? null;
  const missingInputs = [
    hasEmail(options.operatorEmail) ? "" : "operator_email",
    options.launchWindow?.trim() ? "" : "launch_window",
    options.contextNote?.trim() ? "" : "context_note",
  ].filter(Boolean);
  const decision = handoffDecision(laneItem, missingInputs);
  const proofLinks = unique([
    "/api/swiggy-partner-success-desk",
    ...(laneItem?.evidenceLinks ?? []),
    ...(escalationEmail ? [escalationEmail.source] : []),
    ...desk.reviewerRunbook.flatMap((item) => item.evidenceLinks),
  ]).slice(0, 12);
  const bodyPreview =
    laneItem && decision !== "unknown_success_lane"
      ? `${laneItem.label}: ${laneItem.mealPilotControl} Next action: ${laneItem.nextAction} Operator: ${options.operatorEmail?.trim() || "[operator email required]"} Launch window: ${options.launchWindow?.trim() || "[launch window required]"} Context: ${options.contextNote?.trim() || "[context required]"} Proof: ${proofLinks.join(", ")}`
      : "Unknown Partner Success lane. Choose a published lane before preparing an operator handoff.";

  return {
    generatedAt: new Date().toISOString(),
    laneId: options.laneId,
    decision,
    readinessScore: readinessFor(decision),
    lane: laneItem,
    escalationEmail,
    reviewerRunbook: desk.reviewerRunbook,
    proofLinks,
    missingInputs,
    handoffDraft: {
      to: escalationEmail?.to ?? "builders@swiggy.in",
      subject: laneItem
        ? `MealPilot Partner Success handoff: ${laneItem.label}`
        : "MealPilot Partner Success handoff",
      bodyPreview,
    },
    checklist: [
      {
        id: "success_lane_selected",
        label: laneItem ? `${laneItem.label} selected` : "Valid Partner Success lane selected",
        status: laneItem ? laneItem.status : "manual_input",
        owner: laneItem?.owner ?? "Operator",
      },
      {
        id: "operator_email_attached",
        label: "Operator contact email attached",
        status: hasEmail(options.operatorEmail) ? "ready" : "manual_input",
        owner: "Operator",
      },
      {
        id: "launch_window_attached",
        label: "Launch or incident window attached",
        status: options.launchWindow?.trim() ? "ready" : "manual_input",
        owner: "Operator",
      },
      {
        id: "context_note_attached",
        label: "Support, capacity, or growth context attached",
        status: options.contextNote?.trim() ? "ready" : "manual_input",
        owner: "Operator",
      },
      {
        id: "swiggy_partner_gate_preserved",
        label: "Slack, partner manager, dashboard, and co-marketing gate preserved",
        status: laneItem?.status === "external_gate" ? "external_gate" : "ready",
        owner: laneItem?.status === "external_gate" ? "Swiggy" : "MealPilot",
      },
    ],
    assertions: [
      "Partner Success handoff composition prepares a local packet only; it never sends email, opens Slack, requests a partner manager, requests dashboard access, changes limits, or claims Swiggy approval.",
      "Operator contact, launch window, and context remain explicit before any external outreach.",
      ...desk.assertions.slice(0, 2),
    ],
    externalGates: desk.externalGates,
  };
}
