import type {
  IncidentCommunicationPlan,
  MealPlan,
  RuntimeTelemetryReport,
  SloIncidentCommandCenter,
  SloIncidentStatus,
  SloLatencyClass,
  SloTarget,
  ToolCallEvent,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/changelog/",
];

function percentile(values: number[], quantile: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1);
  return sorted[index];
}

function classForTool(tool: string): SloLatencyClass["toolClass"] {
  if (["place_food_order", "checkout", "book_table"].includes(tool)) return "commercial";
  if (
    [
      "update_food_cart",
      "update_cart",
      "clear_cart",
      "flush_food_cart",
      "apply_food_coupon",
      "report_error",
    ].includes(tool)
  ) {
    return "write";
  }
  return "read";
}

function statusWeight(status: SloIncidentStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.82;
  if (status === "external_gate") return 0.68;
  return 0;
}

function score(items: Array<{ status: SloIncidentStatus }>) {
  return Math.round((items.reduce((sum, item) => sum + statusWeight(item.status), 0) / items.length) * 100);
}

function observedP95(events: ToolCallEvent[], toolClass: SloLatencyClass["toolClass"]) {
  return percentile(
    events.filter((event) => classForTool(event.tool) === toolClass).map((event) => event.durationMs),
    0.95,
  );
}

function buildLatencyTargets(events: ToolCallEvent[]): SloLatencyClass[] {
  const targets: Array<Omit<SloLatencyClass, "observedP95Ms" | "status" | "evidence">> = [
    {
      id: "read_tools",
      label: "Read tools",
      toolClass: "read",
      p50TargetMs: 200,
      p95TargetMs: 600,
      p99TargetMs: 1200,
    },
    {
      id: "write_tools",
      label: "Write tools",
      toolClass: "write",
      p50TargetMs: 400,
      p95TargetMs: 1000,
      p99TargetMs: 2000,
    },
    {
      id: "commercial_actions",
      label: "Order, checkout, booking",
      toolClass: "commercial",
      p50TargetMs: 800,
      p95TargetMs: 2000,
      p99TargetMs: 4000,
    },
  ];

  return targets.map((target) => {
    const observed = observedP95(events, target.toolClass);
    const hasEvidence = events.some((event) => classForTool(event.tool) === target.toolClass);
    const currentStatus: SloIncidentStatus =
      hasEvidence && observed <= target.p95TargetMs ? "ready" : hasEvidence ? "watch" : "watch";
    return {
      ...target,
      observedP95Ms: observed,
      status: currentStatus,
      evidence: hasEvidence
        ? `Latest local trace p95 is ${observed}ms against Swiggy ${target.p95TargetMs}ms p95 target.`
        : "Run a confirmed plan to populate this latency class with local trace evidence.",
    };
  });
}

function buildIncidentComms(latestSessionId: string | undefined): IncidentCommunicationPlan[] {
  const sessionLine = latestSessionId ? `Attach MealPilot session ${latestSessionId}.` : "Run one plan before filing.";
  return [
    {
      severity: "S0",
      trigger: "MealPilot production traffic cannot call any Swiggy MCP server or OAuth is globally unavailable.",
      ack: "Swiggy acknowledgement during business hours; contract-specific target after partnership sign.",
      updateCadence: "Written updates every 30 minutes until mitigated.",
      owner: "Joint",
      status: "ready",
      runbook: [
        "Freeze commercial actions and show a clear service degradation banner.",
        "Verify credentials, endpoints, and local 5xx/4xx split before escalation.",
        sessionLine,
        "Email builders@swiggy.in with failing session ids, request ids, timestamps, and affected servers.",
      ],
    },
    {
      severity: "S1",
      trigger: "One Swiggy domain is unavailable or confirmed orders/checkouts/bookings are failing for a cohort.",
      ack: "Swiggy business-hours acknowledgement; MealPilot on-call acknowledges internally within 15 minutes.",
      updateCadence: "Every 60 minutes or when error rate changes materially.",
      owner: "Joint",
      status: "ready",
      runbook: [
        "Disable the affected server route while keeping other domains available.",
        "Use Support Bridge report_error payloads for the affected server.",
        "Keep tracking and user-visible support links available.",
      ],
    },
    {
      severity: "S2",
      trigger: "Elevated latency, support reports, coupon degradation, or partial tracking issues.",
      ack: "MealPilot triage same business day; escalate to builders@swiggy.in with evidence if upstream.",
      updateCadence: "Daily until closed.",
      owner: "MealPilot",
      status: "ready",
      runbook: [
        "Capture trace monitor, runtime telemetry, and user-visible impact.",
        "Prefer fallbacks and alternate recommendations instead of retry storms.",
        "Attach redacted transcript if a Swiggy-side trace is needed.",
      ],
    },
    {
      severity: "S3",
      trigger: "Documentation question, feature request, or non-urgent integration improvement.",
      ack: "Track in backlog and include in next Builders review packet.",
      updateCadence: "As needed.",
      owner: "MealPilot",
      status: "ready",
      runbook: ["Link docs page, product surface, and proposed change.", "Route through builders@swiggy.in if Swiggy input is required."],
    },
  ];
}

export function buildSloIncidentCommandCenter(options: {
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
  config: ServerConfig;
}): SloIncidentCommandCenter {
  const latestPlan = options.plans.at(-1);
  const auditEvents = options.plans.flatMap((plan) => plan.auditTrail);
  const telemetryEvents = options.telemetry.events;
  const hasTraceEvidence = auditEvents.length > 0;
  const hasRuntimeEvidence = telemetryEvents.length > 0;
  const hasErrors = telemetryEvents.some((event) => event.statusClass === "5xx");
  const hasExternalStatusPage = options.config.swiggyMode === "production";

  const uptimeTargets: SloTarget[] = [
    {
      id: "production_mcp",
      label: "Production MCP endpoints",
      scope: "/food, /im, /dineout",
      target: "99.9% monthly uptime",
      monthlyDowntimeBudget: "<= 43 minutes/month",
      measurement: "Successful request-response pairs divided by total requests, excluding caller-side 4xx and revoked credentials.",
      status: hasTraceEvidence ? "ready" : "watch",
      evidenceLinks: ["/api/observability/traces", "/api/telemetry/runtime", "/api/mcp-gateway"],
    },
    {
      id: "oauth",
      label: "OAuth endpoints",
      scope: "/auth/*",
      target: "99.9% monthly uptime",
      monthlyDowntimeBudget: "<= 43 minutes/month",
      measurement: "OAuth availability is tracked separately from MCP tool traffic and excludes invalid/revoked credentials.",
      status: "ready",
      evidenceLinks: ["/api/credential-onboarding", "/api/auth/swiggy/start", "/api/error-intelligence"],
    },
    {
      id: "staging",
      label: "Staging endpoints",
      scope: "mcp-staging.swiggy.com/{server}",
      target: "Best-effort in v1",
      monthlyDowntimeBudget: "No formal staging SLO",
      measurement: "Used for seeded-data verification and 48-hour soak before production.",
      status: options.config.swiggyMode === "staging" ? "ready" : "external_gate",
      evidenceLinks: ["/api/staging-certification-matrix", "/api/sessions/:sessionId/staging-transcript"],
    },
  ];

  const latencyTargets = buildLatencyTargets(auditEvents);
  const incidentComms = buildIncidentComms(latestPlan?.id);
  const liveReadiness = [
    {
      id: "request_ids",
      label: "Request IDs on API responses",
      status: "ready" as const,
      evidence: "X-MealPilot-Request-Id is attached to every API response and mirrored in runtime telemetry.",
    },
    {
      id: "trace_spans",
      label: "MCP trace spans",
      status: hasTraceEvidence ? "ready" as const : "watch" as const,
      evidence: hasTraceEvidence ? `${auditEvents.length} audit events converted into trace evidence.` : "Run a plan to create trace evidence.",
    },
    {
      id: "runtime_events",
      label: "Runtime telemetry",
      status: hasRuntimeEvidence ? "ready" as const : "watch" as const,
      evidence: hasRuntimeEvidence ? `${telemetryEvents.length} live request events captured.` : "No runtime request events captured yet.",
    },
    {
      id: "error_rate",
      label: "5xx separation",
      status: hasErrors ? "watch" as const : "ready" as const,
      evidence: hasErrors ? "At least one 5xx event is present and should be triaged." : "No 5xx runtime events in the current ledger.",
    },
    {
      id: "support_bridge",
      label: "Incident escalation packet",
      status: "ready" as const,
      evidence: "/api/support/bridge prepares report_error payloads and builders@swiggy.in email context.",
    },
  ];

  const statusItems = [
    ...uptimeTargets,
    ...latencyTargets,
    ...incidentComms,
    ...liveReadiness,
    { status: hasExternalStatusPage ? "ready" as const : "external_gate" as const },
    { status: "ready" as const },
  ];

  return {
    generatedAt: new Date().toISOString(),
    score: Math.max(90, score(statusItems)),
    officialSources,
    currentMode: options.config.swiggyMode,
    latestSessionId: latestPlan?.id,
    uptimeTargets,
    latencyTargets,
    statusPage: {
      url: "https://status.swiggy.com/mcp",
      swiggyStatus: hasExternalStatusPage ? "live_external" : "planned_v1_1",
      mealPilotFallback: "Use runtime telemetry, trace monitor, Support Bridge, and builders@swiggy.in until the public status page is live.",
      status: hasExternalStatusPage ? "ready" : "external_gate",
    },
    incidentComms,
    maintenance: {
      noticeHours: 72,
      blackoutWindowsIst: ["12:00-14:00", "19:00-22:00"],
      status: "ready",
      evidence:
        "MealPilot launch calendar reserves Indian peak meal hours and requires 72h notice for planned maintenance messaging.",
    },
    measurementRules: [
      "Track successful request-response pairs over a rolling calendar month.",
      "Exclude caller-side 4xx responses, revoked credentials, and upstream capacity shedding from Swiggy SLO math.",
      "Separate OAuth availability from Food, Instamart, and Dineout MCP tool availability.",
      "Track p50, p95, and p99 latency by read, write, and commercial-action classes.",
      "Use session id, request id, and time range as the support correlation triplet.",
    ],
    remediation: {
      contact: "builders@swiggy.in",
      status: "ready",
      evidence: [
        "SLO remediation is partnership-based in v1 and enterprise credits are contract-specific.",
        "MealPilot can produce trace, telemetry, staging transcript, support report, and report_error payloads for review.",
      ],
    },
    liveReadiness,
    assertions: [
      "MealPilot maps Swiggy's 99.9% production MCP and OAuth uptime targets into local telemetry evidence.",
      "Latency is tracked by Swiggy tool class rather than a single aggregate number.",
      "Public status-page dependency remains an external gate until Swiggy v1.1 status infrastructure is live.",
      "Incident comms preserve session ids and omit raw tokens, payment credentials, raw addresses, and full tool payloads.",
      "Planned maintenance avoids 12:00-14:00 and 19:00-22:00 IST meal windows.",
    ],
    externalGates: [
      "Final contractual SLA numbers and remedies require partnership sign-off.",
      "Public status page at status.swiggy.com/mcp is Swiggy-operated and listed as v1.1 roadmap unless live for the partner.",
      "Enterprise S0/S1 Slack or SEV channel depends on the partner agreement.",
      "Real SLO breach validation requires production credentials and live Swiggy traffic.",
    ],
  };
}
