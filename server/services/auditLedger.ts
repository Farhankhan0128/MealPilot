import type { ServerConfig } from "../config.js";
import type {
  AuditLedgerCenter,
  AuditLedgerControl,
  AuditLedgerEvent,
  MealPlan,
  SwiggyServer,
  ToolCallEvent,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/versioning/",
];

function routeClass(tool: string): AuditLedgerEvent["routeClass"] {
  if (["place_food_order", "checkout", "book_table"].includes(tool)) return "commercial_action";
  if (["update_food_cart", "update_cart", "flush_food_cart", "clear_cart"].includes(tool)) return "cart_mutation";
  if (tool.includes("coupon")) return "coupon";
  if (["track_food_order", "track_order", "get_booking_status", "get_food_orders", "get_orders"].includes(tool)) {
    return "tracking";
  }
  if (tool === "report_error") return "support";
  return "read";
}

function ledgerEvent(event: ToolCallEvent, index: number): AuditLedgerEvent {
  const currentRouteClass = routeClass(event.tool);
  return {
    id: `audit_${event.sessionId}_${index + 1}`,
    sessionId: event.sessionId,
    server: event.server,
    tool: event.tool,
    status: event.status,
    durationMs: event.durationMs,
    routeClass: currentRouteClass,
    redaction: "redacted",
    supportCorrelation: `${event.sessionId}:${event.server}:${event.tool}`,
    evidence:
      currentRouteClass === "commercial_action"
        ? "Commercial action is represented by support-safe session/tool metadata only; full payload is omitted."
        : "Tool call stores server, tool, status, duration, and session id without raw PII or bearer tokens.",
  };
}

function buildEvents(plans: MealPlan[]) {
  return plans
    .slice(-10)
    .flatMap((plan) => plan.auditTrail.map((event, index) => ledgerEvent(event, index)));
}

function statusForReady(value: boolean): AuditLedgerControl["status"] {
  return value ? "ready" : "watch";
}

function buildControls(options: {
  events: AuditLedgerEvent[];
  plans: MealPlan[];
  config: ServerConfig;
}): AuditLedgerControl[] {
  const hasEvents = options.events.length > 0;
  const allRedacted = options.events.every((event) => event.redaction === "redacted");
  const hasSupportCorrelation = options.events.every((event) => event.supportCorrelation.includes(event.sessionId));
  const hasCommercialActions = options.events.some((event) => event.routeClass === "commercial_action");
  const retentionReady = options.config.planRetentionDays <= 90;
  const serverSet = new Set(options.events.map((event) => event.server));

  return [
    {
      id: "event_capture",
      label: "Audit capture",
      status: statusForReady(hasEvents),
      requirement: "Every tool-shaped call should produce audit metadata for support and review.",
      evidence: hasEvents ? `${options.events.length} audit events generated from stored plan trails.` : "Run a plan to populate audit evidence.",
    },
    {
      id: "server_coverage",
      label: "Server coverage",
      status: statusForReady(["food", "instamart", "dineout"].every((server) => serverSet.has(server as SwiggyServer))),
      requirement: "Food, Instamart, and Dineout audit events must remain independently attributable.",
      evidence: [...serverSet].join(", ") || "No Swiggy server events yet.",
    },
    {
      id: "redaction",
      label: "Redaction",
      status: allRedacted ? "ready" : "blocked",
      requirement: "Log only what is needed for debugging: session id, route/tool, status, duration, and hashed identifiers.",
      evidence: allRedacted
        ? "Ledger excludes raw request bodies, addresses, bearer tokens, payment credentials, phone, and email."
        : "At least one event was not marked redacted.",
    },
    {
      id: "support_correlation",
      label: "Support correlation",
      status: statusForReady(hasSupportCorrelation && hasEvents),
      requirement: "Support packets should include session ids and timestamps, not full Swiggy payloads.",
      evidence: hasSupportCorrelation
        ? "Each ledger event carries a session-scoped support correlation key."
        : "Support correlation needs at least one plan event.",
    },
    {
      id: "commercial_actions",
      label: "Commercial action trace",
      status: statusForReady(hasCommercialActions),
      requirement: "Order, checkout, and booking paths must be auditable without blind retries.",
      evidence: hasCommercialActions
        ? "Commercial action class appears in the ledger."
        : "Confirm a prepared recommendation to capture a commercial action audit trail.",
    },
    {
      id: "retention",
      label: "Retention",
      status: retentionReady ? "ready" : "watch",
      requirement: "Local retention should stay bounded; Swiggy-side audit logs are retained 90 days.",
      evidence: `MEALPILOT_PLAN_RETENTION_DAYS=${options.config.planRetentionDays}; storage compaction endpoint is /api/storage/compact.`,
    },
    {
      id: "dsr",
      label: "DSR routing",
      status: "ready",
      requirement: "MealPilot-owned data uses local export/delete; Swiggy-originated DSRs route to the Swiggy app.",
      evidence: "/api/privacy/export, /api/privacy, and /api/data-governance-center define the split.",
    },
  ];
}

function score(controls: AuditLedgerControl[]) {
  const value = controls.reduce((sum, control) => {
    if (control.status === "ready") return sum + 1;
    if (control.status === "watch" || control.status === "external_gate") return sum + 0.7;
    return sum;
  }, 0);
  return Math.round((value / controls.length) * 100);
}

export function buildAuditLedgerCenter(options: { plans: MealPlan[]; config: ServerConfig }): AuditLedgerCenter {
  const events = buildEvents(options.plans);
  const controls = buildControls({ events, plans: options.plans, config: options.config });
  const coveredServers = [...new Set(events.map((event) => event.server))];
  const sessionIds = [...new Set(events.map((event) => event.sessionId))];
  const latestSessionId = sessionIds.at(-1) ?? "run_plan_first";
  const commercialActions = events.filter((event) => event.routeClass === "commercial_action").length;

  return {
    generatedAt: new Date().toISOString(),
    score: score(controls),
    officialSources,
    totalEvents: events.length,
    coveredSessions: sessionIds.length,
    coveredServers,
    commercialActions,
    supportReadyEvents: events.filter((event) => event.supportCorrelation.length > 0).length,
    retention: {
      mealPilotPlanRetentionDays: options.config.planRetentionDays,
      swiggyAuditLogDays: 90,
      localCompactionEndpoint: "/api/storage/compact",
      evidence:
        "MealPilot keeps local plan evidence bounded by retention settings while Swiggy-side audit logs remain session-id keyed for 90 days.",
    },
    redaction: {
      redactedFields: ["authorization", "access_token", "refresh_token", "phone", "email", "raw_address", "payment_credentials", "full_tool_payload"],
      allowedFields: ["sessionId", "server", "tool", "status", "durationMs", "routeClass", "supportCorrelation"],
      piiFree: events.every((event) => event.redaction === "redacted"),
      evidence:
        "Audit ledger is generated from redacted plan audit trails and never stores raw tool arguments, raw responses, tokens, payment data, phone, or email.",
    },
    events: events.slice(-30).reverse(),
    controls,
    dsrRouting: [
      {
        id: "mealpilot_export",
        label: "MealPilot export",
        owner: "MealPilot",
        status: "ready",
        evidence: "/api/privacy/export returns local profile, plans, pantry, group, and reminders.",
      },
      {
        id: "mealpilot_delete",
        label: "MealPilot delete",
        owner: "MealPilot",
        status: "ready",
        evidence: "DELETE /api/privacy clears local user-controlled data.",
      },
      {
        id: "swiggy_originated",
        label: "Swiggy-originated DSR",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Swiggy-originated access/correction/erasure requests are directed to the Swiggy app or builders@swiggy.in for complex cases.",
      },
    ],
    supportPackage: {
      to: "builders@swiggy.in",
      requiredFields: ["session_id", "server", "tool", "timestamp", "status", "duration_ms", "redacted_error", "request_id"],
      bodyPreview: `Session: ${latestSessionId}\nIssue: <redacted summary>\nEvidence: /api/audit-ledger, /api/observability/traces, /api/telemetry/runtime\nNo raw token, phone, address, payment, or full payload attached.`,
    },
    assertions: [
      "Audit ledger uses Swiggy session ids as support identifiers, not business identifiers.",
      "Raw Swiggy request/response bodies, bearer tokens, payment credentials, phone, email, and raw addresses stay out of local audit output.",
      "Commercial actions are classed separately so non-blind retry and confirmation evidence can be reviewed.",
      "Local export/delete covers MealPilot-owned data; Swiggy-originated DSRs are routed back to Swiggy.",
      "Retention stays bounded locally while acknowledging Swiggy-side 90-day audit logs.",
    ],
    externalGates: [
      "Swiggy-side audit log readback requires lawful request, DPA process, or Swiggy support approval.",
      "Signed MCP manifests remain roadmap-gated until Swiggy and MCP upstream ship the format.",
      "Production incident evidence can only be completed after staging/production credentials issue real Swiggy session ids.",
    ],
  };
}
