import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  McpServerCoverage,
  RuntimeTelemetryReport,
  SwiggyPartnerSupportAttachment,
  SwiggyPartnerSupportChannel,
  SwiggyPartnerSupportIncidentLane,
  SwiggyPartnerSupportPacket,
  SwiggyPartnerSupportPacketDecision,
  SwiggyPartnerSupportRoom,
  SwiggyPartnerSupportRoomOwner,
  SwiggyPartnerSupportRoomStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildAuditLedgerCenter } from "./auditLedger.js";
import { buildSwiggyPartnerSuccessDesk } from "./partnerSuccessDesk.js";
import { buildSloIncidentCommandCenter } from "./sloIncidentCommand.js";
import { buildSupportBridgeReport } from "./supportBridge.js";
import { buildTrafficReadinessPlan } from "./trafficReadiness.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/enterprises/",
];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function hasEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function statusWeight(status: SwiggyPartnerSupportRoomStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.78;
  return 0.58;
}

function channel(input: SwiggyPartnerSupportChannel): SwiggyPartnerSupportChannel {
  return input;
}

function incident(input: SwiggyPartnerSupportIncidentLane): SwiggyPartnerSupportIncidentLane {
  return input;
}

function attachment(
  id: string,
  label: string,
  source: string,
  status: SwiggyPartnerSupportRoomStatus,
  proves: string,
  redaction: string,
): SwiggyPartnerSupportAttachment {
  return { id, label, source, status, proves, redaction };
}

function runbookStep(
  sequence: number,
  id: string,
  label: string,
  owner: SwiggyPartnerSupportRoomOwner,
  status: SwiggyPartnerSupportRoomStatus,
  action: string,
  evidenceLinks: string[],
) {
  return { sequence, id, label, owner, status, action, evidenceLinks };
}

function packetDecision(
  channel: SwiggyPartnerSupportChannel | undefined,
  incidentLane: SwiggyPartnerSupportIncidentLane | undefined,
  missingInputs: string[],
): SwiggyPartnerSupportPacketDecision {
  if (!channel || !incidentLane) return "unknown_support_lane";
  if (channel.status === "external_gate" || incidentLane.status === "external_gate") return "swiggy_gate";
  if (missingInputs.length > 0) return "needs_operator_input";
  return "ready_local_handoff";
}

function packetScore(
  decision: SwiggyPartnerSupportPacketDecision,
  channel: SwiggyPartnerSupportChannel | undefined,
  incidentLane: SwiggyPartnerSupportIncidentLane | undefined,
  missingInputs: string[],
) {
  if (decision === "unknown_support_lane") return 30;
  if (decision === "swiggy_gate") return 56;
  if (missingInputs.length > 0) return 68;

  const readiness = [channel?.status, incidentLane?.status].reduce((sum, status) => {
    if (status === "ready") return sum + 1;
    if (status === "manual_input") return sum + 0.82;
    return sum + 0.58;
  }, 0);

  return Math.round((readiness / 2) * 100);
}

export function buildSwiggyPartnerSupportRoom(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
}): SwiggyPartnerSupportRoom {
  const supportBridge = buildSupportBridgeReport({ plans: options.plans });
  const sloIncident = buildSloIncidentCommandCenter({
    plans: options.plans,
    telemetry: options.telemetry,
    config: options.config,
  });
  const partnerSuccess = buildSwiggyPartnerSuccessDesk(options);
  const trafficReadiness = buildTrafficReadinessPlan({ plans: options.plans, config: options.config });
  const auditLedger = buildAuditLedgerCenter({ plans: options.plans, config: options.config });
  const accessSubmission = buildAccessSubmissionStudio({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.plans.at(-1),
  });

  const channels = [
    channel({
      id: "builders_email",
      label: "builders@swiggy.in",
      owner: "Operator",
      status: "manual_input",
      useCase: "Access handoff, demo URL, capacity profile, incident escalation, and docs or feature questions.",
      entrypoint: `mailto:${supportBridge.incidentEmail.to}`,
      evidenceLinks: ["/api/support/bridge", "/api/access-submission-studio", "/api/swiggy-demo-evidence-director"],
    }),
    channel({
      id: "report_error",
      label: "report_error support tool",
      owner: "MealPilot",
      status: "ready",
      useCase: "User-consented Food, Instamart, or Dineout issue reports after an observed MCP failure.",
      entrypoint: "/api/support/bridge/report",
      evidenceLinks: ["/api/support/bridge", "/api/swiggy-cancellation-care-center", "/api/error-intelligence"],
    }),
    channel({
      id: "slo_incident",
      label: "SLO incident command",
      owner: "Joint",
      status: "ready",
      useCase: "S0-S3 severity classification, status cadence, time range, request ids, remediation, and fallback routing.",
      entrypoint: "/api/slo-incident-command",
      evidenceLinks: ["/api/slo-incident-command", "/api/observability/traces", "/api/telemetry/runtime"],
    }),
    channel({
      id: "capacity_review",
      label: "Capacity and quota review",
      owner: "Joint",
      status: "manual_input",
      useCase: "Default rate-limit launch notice, quota increase packet, Retry-After posture, and traffic forecast.",
      entrypoint: "/api/swiggy-quota-negotiation-center",
      evidenceLinks: ["/api/traffic-readiness-plan", "/api/swiggy-quota-negotiation-center", "/api/mcp/backpressure-governor"],
    }),
    channel({
      id: "enterprise_slack",
      label: "Enterprise Slack or partner manager",
      owner: "Swiggy",
      status: "external_gate",
      useCase: "Priority Slack, named partner manager, dashboards, enterprise SLA, and co-marketing support after approval.",
      entrypoint: "external:Swiggy enterprise partnership",
      evidenceLinks: ["/api/enterprise-platform-center", "/api/swiggy-growth-partnership", "/api/swiggy-partner-success-desk"],
    }),
  ];

  const incidentLanes = sloIncident.incidentComms.map((item) =>
    incident({
      id: item.severity.toLowerCase(),
      severity: item.severity,
      label: `${item.severity} support lane`,
      owner: item.owner,
      status: item.status === "ready" ? "ready" : item.status === "external_gate" ? "external_gate" : "manual_input",
      trigger: item.trigger,
      responseCadence: item.updateCadence,
      proofLinks: ["/api/slo-incident-command", "/api/support/bridge", "/api/telemetry/runtime"],
    }),
  );

  const evidenceAttachments = [
    attachment(
      "support_bridge",
      "Support Bridge report_error packet",
      "/api/support/bridge",
      "ready",
      `${supportBridge.reportErrorTools.length} report_error payloads cover Food, Instamart, and Dineout.`,
      "Hashes toolContext identifiers and removes tokens, raw address text, phone, email, and payment data.",
    ),
    attachment(
      "slo_command",
      "SLO Incident Command",
      "/api/slo-incident-command",
      "ready",
      `${sloIncident.incidentComms.length} severity plans and ${sloIncident.uptimeTargets.length} uptime targets are ready.`,
      "Uses session id, request id, and time range instead of raw payload dumps.",
    ),
    attachment(
      "runtime_telemetry",
      "Runtime Telemetry ledger",
      "/api/telemetry/runtime",
      "ready",
      `${options.telemetry.events.length} runtime events are available for support correlation.`,
      "Telemetry keeps hashed user context and no raw Swiggy payload bodies.",
    ),
    attachment(
      "audit_ledger",
      "Audit Ledger Center",
      "/api/audit-ledger",
      "ready",
      `${auditLedger.totalEvents} audit events, ${auditLedger.controls.length} controls, and ${auditLedger.redaction.redactedFields.length} redacted field classes are available.`,
      "Audit exports exclude bearer tokens, payment data, full addresses, phone, and email.",
    ),
    attachment(
      "traffic_profile",
      "Traffic Readiness Plan",
      "/api/traffic-readiness-plan",
      "ready",
      `${trafficReadiness.projectedDailyToolCalls.toLocaleString("en-IN")} projected daily tool calls and ${trafficReadiness.peakQps.toFixed(2)} peak QPS.`,
      "Uses aggregate forecasts instead of user-level route history.",
    ),
    attachment(
      "partner_success",
      "Partner Success Desk",
      "/api/swiggy-partner-success-desk",
      "ready",
      `${partnerSuccess.totals.ready}/${partnerSuccess.totals.lanes} partner-success lanes are ready.`,
      "Keeps Slack, partner manager, dashboard, and co-marketing as external gates.",
    ),
    attachment(
      "access_handoff",
      "Access Submission Studio",
      "/api/access-submission-studio",
      accessSubmission.canSubmitNow ? "manual_input" : "ready",
      `${accessSubmission.totals.readyRequiredAttachments}/${accessSubmission.totals.totalRequiredAttachments} required attachments are ready.`,
      "Demo URL, final contact, redirect URI, egress, and form submission stay operator-owned.",
    ),
    attachment(
      "demo_evidence",
      "Demo Evidence Director",
      "/api/swiggy-demo-evidence-director",
      "ready",
      "Recording scenes, redaction gates, visual QA, and handoff copy are prepared for Swiggy review.",
      "No video URL or Swiggy approval is fabricated locally.",
    ),
  ];

  const escalationRunbook = [
    runbookStep(
      1,
      "triage_local_evidence",
      "Triage with local trace, telemetry, and audit evidence",
      "MealPilot",
      "ready",
      "Collect request ids, session id, UTC/IST time range, affected Swiggy server, expected behavior, and actual behavior.",
      ["/api/observability/traces", "/api/telemetry/runtime", "/api/audit-ledger"],
    ),
    runbookStep(
      2,
      "report_error_once",
      "Call report_error once after consent",
      "MealPilot",
      "ready",
      "Use the affected Food, Instamart, or Dineout report_error payload only after a user-visible issue is observed and the user consents.",
      ["/api/support/bridge/report", "/api/support/bridge"],
    ),
    runbookStep(
      3,
      "send_builders_email",
      "Send builders@swiggy.in support email",
      "Operator",
      "manual_input",
      "Attach the redacted support packet, severity, time range, report_error receipt, and remediation status.",
      ["/api/support/bridge", "/api/slo-incident-command"],
    ),
    runbookStep(
      4,
      "capacity_escalation",
      "Send capacity or quota escalation",
      "Operator",
      "manual_input",
      "Send the quota packet before a campaign or public launch and include traffic forecast, Retry-After policy, and backpressure evidence.",
      ["/api/swiggy-quota-negotiation-center", "/api/traffic-readiness-plan", "/api/mcp/backpressure-governor"],
    ),
    runbookStep(
      5,
      "enterprise_support_gate",
      "Request enterprise support channel only after approval",
      "Swiggy",
      "external_gate",
      "Slack, named partner manager, dashboards, bespoke SLAs, and co-marketing remain Swiggy-approved external systems.",
      ["/api/enterprise-platform-center", "/api/swiggy-growth-partnership"],
    ),
  ];

  const proofLinks = unique([
    ...channels.flatMap((item) => item.evidenceLinks),
    ...incidentLanes.flatMap((item) => item.proofLinks),
    ...evidenceAttachments.map((item) => item.source),
    ...escalationRunbook.flatMap((item) => item.evidenceLinks),
  ]);
  const statusItems = [...channels, ...incidentLanes, ...evidenceAttachments, ...escalationRunbook];
  const score = Math.round((statusItems.reduce((sum, item) => sum + statusWeight(item.status), 0) / statusItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    supportPosture: "support-ready, operator-sent, Swiggy-approved for enterprise channels",
    totals: {
      channels: channels.length,
      readyChannels: channels.filter((item) => item.status === "ready").length,
      incidentLanes: incidentLanes.length,
      readyIncidentLanes: incidentLanes.filter((item) => item.status === "ready").length,
      evidenceAttachments: evidenceAttachments.length,
      readyEvidenceAttachments: evidenceAttachments.filter((item) => item.status === "ready").length,
      escalationSteps: escalationRunbook.length,
      operatorInputs: statusItems.filter((item) => item.status === "manual_input").length,
      swiggyGates: statusItems.filter((item) => item.status === "external_gate").length,
      proofLinks: proofLinks.length,
    },
    channels,
    incidentLanes,
    evidenceAttachments,
    escalationRunbook,
    emailDrafts: [
      {
        id: "support_incident",
        to: supportBridge.incidentEmail.to,
        subject: supportBridge.incidentEmail.subject,
        bodyPreview:
          "Attach severity, time range, request ids, report_error receipt, redacted support packet, current mitigation, and user-visible impact.",
        source: "/api/support/bridge",
      },
      {
        id: "quota_capacity",
        to: trafficReadiness.capacityUpgradeEmail.to,
        subject: trafficReadiness.capacityUpgradeEmail.subject,
        bodyPreview:
          "Attach launch window, projected daily tool calls, peak QPS, Retry-After handling, backpressure policy, and campaign context.",
        source: "/api/traffic-readiness-plan",
      },
      {
        id: "access_handoff",
        to: accessSubmission.mailto.to,
        subject: accessSubmission.mailto.subject,
        bodyPreview:
          "Attach demo URL, builder packet, visual QA report, support room, and access evidence after final operator review.",
        source: "/api/access-submission-studio",
      },
    ],
    assertions: [
      "Partner Support Room composes verified MealPilot support, SLO, telemetry, audit, access, traffic, and partner-success evidence.",
      "No support email, capacity request, Slack request, report_error execution, or access handoff is sent without the correct operator or user gate.",
      "Support packets carry session/request/time-range evidence while excluding tokens, raw addresses, payment data, phone, email, and full Swiggy payloads.",
      "Enterprise Slack, partner manager, dashboards, bespoke SLA, and co-marketing remain Swiggy-owned approval gates.",
    ],
    externalGates: [
      "Operator must send builders@swiggy.in emails and official form updates manually.",
      "Live report_error execution requires user consent and authenticated Swiggy MCP credentials outside local tests.",
      "Enterprise Slack, named partner manager, dashboards, bespoke SLAs, co-marketing, and higher limits require Swiggy approval.",
    ],
  };
}

export function composeSwiggyPartnerSupportPacket(
  options: Parameters<typeof buildSwiggyPartnerSupportRoom>[0] & {
    channelId: string;
    incidentLaneId: string;
    operatorEmail?: string;
    sessionId?: string;
    summary?: string;
  },
): SwiggyPartnerSupportPacket {
  const room = buildSwiggyPartnerSupportRoom(options);
  const channel = room.channels.find((item) => item.id === options.channelId);
  const incidentLane = room.incidentLanes.find((item) => item.id === options.incidentLaneId);
  const operatorEmail = options.operatorEmail?.trim() ?? "";
  const sessionId = options.sessionId?.trim() ?? "";
  const summary = options.summary?.trim() ?? "";
  const missingInputs = [
    !hasEmail(operatorEmail) ? "operator_email" : "",
    sessionId.length < 6 ? "session_id" : "",
    summary.length < 16 ? "support_summary" : "",
  ].filter(Boolean);
  const decision = packetDecision(channel, incidentLane, missingInputs);
  const readinessScore = packetScore(decision, channel, incidentLane, missingInputs);
  const evidenceAttachments = room.evidenceAttachments.filter((attachment) =>
    ["support_bridge", "slo_command", "runtime_telemetry", "audit_ledger", "traffic_profile", "demo_evidence"].includes(attachment.id),
  );
  const proofLinks = unique([
    "/api/swiggy-partner-support-room",
    channel?.entrypoint.startsWith("/") ? channel.entrypoint : "",
    ...(channel?.evidenceLinks ?? []),
    ...(incidentLane?.proofLinks ?? []),
    ...evidenceAttachments.map((attachment) => attachment.source),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    channelId: options.channelId,
    incidentLaneId: options.incidentLaneId,
    decision,
    readinessScore,
    channel: channel ?? null,
    incidentLane: incidentLane ?? null,
    evidenceAttachments,
    emailDraft: {
      to: "builders@swiggy.in",
      subject: incidentLane
        ? `MealPilot ${incidentLane.severity} support packet: ${channel?.label ?? options.channelId}`
        : `MealPilot support packet: ${options.channelId}`,
      bodyPreview: [
        `Operator: ${operatorEmail || "missing operator email"}`,
        `Session: ${sessionId || "missing session id"}`,
        `Summary: ${summary || "missing support summary"}`,
        `Decision: ${decision}`,
        `Evidence: ${proofLinks.join(", ")}`,
      ].join(" | "),
    },
    proofLinks,
    missingInputs,
    checklist: [
      {
        id: "operator_identity",
        label: "Named operator email is present for builders@swiggy.in handoff",
        status: hasEmail(operatorEmail) ? "ready" : "manual_input",
        owner: "Operator",
      },
      {
        id: "session_scope",
        label: "Session id and support summary identify the incident without raw payloads",
        status: sessionId.length >= 6 && summary.length >= 16 ? "ready" : "manual_input",
        owner: "MealPilot",
      },
      {
        id: "channel_selected",
        label: channel ? `${channel.label} channel selected` : "Known support channel selected",
        status: channel?.status ?? "manual_input",
        owner: channel?.owner ?? "Operator",
      },
      {
        id: "incident_lane_selected",
        label: incidentLane ? `${incidentLane.label} selected` : "Known S0-S3 incident lane selected",
        status: incidentLane?.status ?? "manual_input",
        owner: incidentLane?.owner ?? "Operator",
      },
      {
        id: "swiggy_gate_preserved",
        label: "Swiggy Slack, partner manager, credential, and enterprise approvals stay external",
        status: decision === "swiggy_gate" ? "external_gate" : "ready",
        owner: "Swiggy",
      },
    ],
    assertions: [
      "Partner Support packet is generated locally and never sends email, Slack messages, report_error payloads, or Swiggy requests.",
      "The packet uses redacted session, incident, telemetry, audit, support, traffic, and demo evidence links instead of raw Swiggy payload bodies.",
      "report_error execution still requires user consent and authenticated Swiggy MCP credentials outside local verification.",
      "Enterprise Slack, partner manager, dashboard, and bespoke SLA requests remain Swiggy-approved external gates.",
    ],
    externalGates: [
      "Operator must review and send builders@swiggy.in email manually.",
      "Live report_error execution requires user consent plus authenticated Swiggy MCP credentials.",
      "Enterprise Slack, partner manager, dashboards, bespoke SLAs, and priority support require Swiggy approval.",
    ],
  };
}
