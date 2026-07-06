import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyCancellationCareCenterReport,
  SwiggyCancellationCareControl,
  SwiggyCancellationCareLane,
  SwiggyCancellationCareScenario,
  SwiggyCancellationCareStatus,
  SwiggyCancellationCareTelemetry,
} from "../../src/domain/types.js";

const customerCarePhone = "080-67466729";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_orders/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_orders/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_booking_status/",
  "https://mcp.swiggy.com/builders/docs/reference/food/report_error/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/report_error/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/report_error/",
  "https://mcp.swiggy.com/builders/docs/reference/errors/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function statusWeight(status: SwiggyCancellationCareStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.48;
}

export function buildSwiggyCancellationCareCenter(options: {
  config: ServerConfig;
  plans: MealPlan[];
}): SwiggyCancellationCareCenterReport {
  const latestPlan = options.plans.at(-1);
  const recommendationCount = latestPlan?.recommendations.length ?? 3;
  const cancellationCopy = `To cancel your order, please call Swiggy customer care at ${customerCarePhone}.`;

  const lanes: SwiggyCancellationCareLane[] = [
    {
      id: "food_cancel_request",
      server: "food",
      label: "Food Cancellation Request",
      officialTools: ["get_food_orders", "track_food_order", "report_error"],
      userIntent: "User asks to cancel, stop, or reverse an active Food delivery order.",
      allowedAction:
        "Read active status when useful, show official customer-care copy, and offer a support packet if a tool or flow error occurred.",
      blockedAction: "Do not call any MCP cancellation tool; no such Food cancellation action is exposed.",
      supportCopy: cancellationCopy,
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[5], "/api/swiggy-order-lifecycle"],
    },
    {
      id: "instamart_cancel_request",
      server: "instamart",
      label: "Instamart Cancellation Request",
      officialTools: ["get_orders", "track_order", "report_error"],
      userIntent: "User asks to cancel, stop, or reverse an active Instamart order.",
      allowedAction:
        "Use active order context only for status, repeat the official customer-care path, and generate report_error only for an actual in-session issue.",
      blockedAction: "Do not call any MCP cancellation tool; no Instamart cancellation action is exposed.",
      supportCopy: cancellationCopy,
      status: "ready",
      evidenceLinks: [officialSources[3], officialSources[6], "/api/swiggy-order-lifecycle"],
    },
    {
      id: "dineout_booking_management",
      server: "dineout",
      label: "Dineout Booking Management",
      officialTools: ["get_booking_status", "report_error"],
      userIntent: "User asks about a Dineout booking problem, status, or reservation recovery.",
      allowedAction:
        "Use get_booking_status for booking truth and report_error for in-session booking errors with orderId context.",
      blockedAction: "Do not invent a Dineout cancellation mutation; route unsupported management to status plus support.",
      supportCopy: "Use booking status first, then prepare a redacted Dineout support report if the booking flow failed.",
      status: "ready",
      evidenceLinks: [officialSources[4], officialSources[7], "/api/support/bridge"],
    },
    {
      id: "in_session_report_error",
      server: "combined",
      label: "In-session Report Error",
      officialTools: ["report_error"],
      userIntent: "User hits a failed search, cart, checkout, order, tracking, or booking flow inside the conversation.",
      allowedAction:
        "Call the matching server's report_error with tool, errorMessage, flowDescription, user notes, and redacted toolContext identifiers.",
      blockedAction: "Do not use report_error for silent developer debugging or generic cancellation requests.",
      supportCopy: "We can prepare a report for Swiggy support with the failed tool and redacted context.",
      status: "ready",
      evidenceLinks: [officialSources[5], officialSources[6], officialSources[7], officialSources[9]],
    },
    {
      id: "developer_incident_email",
      server: "combined",
      label: "Developer Incident Email",
      officialTools: ["report_error"],
      userIntent: "Operator observes 4xx, 5xx, timeout, rate-limit, or staging failure across sessions.",
      allowedAction:
        "Collect session ids, time range, expected vs actual behavior, severity, and mail builders@swiggy.in or the enterprise contact.",
      blockedAction: "Do not expose raw tokens, full payloads, payment data, or full addresses in incident email.",
      supportCopy: "Prepare `[SEV-n]` subject, request ids, timestamps, redacted support packet, and affected server lane.",
      status: "ready",
      evidenceLinks: [officialSources[8], officialSources[9], "/api/slo-incident-command"],
    },
    {
      id: "live_care_calibration",
      server: "combined",
      label: "Live Care Calibration",
      officialTools: ["get_food_orders", "get_orders", "get_booking_status", "report_error"],
      userIntent: "Staging or production support flows need validation with real Swiggy sessions.",
      allowedAction:
        "Replay care scripts with seeded accounts and confirm support contacts, phone copy, report ids, and enterprise escalation contacts.",
      blockedAction: "Do not claim live cancellation resolution or report delivery until Swiggy credentials and contacts are approved.",
      supportCopy: "Live care remains gated until Swiggy confirms staging credentials and production support routing.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix"],
    },
  ];

  const controls: SwiggyCancellationCareControl[] = [
    {
      id: "no_tool_cancellation",
      label: "No-tool Cancellation Guard",
      policy: "Food and Instamart cancellation intents never call a nonexistent MCP cancellation tool.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[3]],
    },
    {
      id: "customer_care_copy",
      label: "Customer-care Copy",
      policy: `Food and Instamart cancellation requests show the official customer-care phone copy: ${cancellationCopy}`,
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[3]],
    },
    {
      id: "report_error_context",
      label: "Report-error Context",
      policy: "report_error payloads include the failed tool, error message, flow description, notes, and only redacted toolContext ids.",
      status: "ready",
      evidenceLinks: [officialSources[5], officialSources[6], officialSources[7]],
    },
    {
      id: "incident_email_boundary",
      label: "Incident Email Boundary",
      policy: "Silent integration failures go through builders@swiggy.in with session ids, time range, expected vs actual behavior, and severity.",
      status: "ready",
      evidenceLinks: [officialSources[9], "/api/slo-incident-command"],
    },
    {
      id: "planned_error_codes",
      label: "Planned Error Codes",
      policy: "Until stable error.code ships, MealPilot branches on HTTP/message buckets and keeps symbolic-code routing as a roadmap gate.",
      status: "ready",
      evidenceLinks: [officialSources[8], "/api/error-intelligence"],
    },
  ];

  const scenarios: SwiggyCancellationCareScenario[] = [
    {
      id: "food_cancel_after_order",
      label: "Food Cancel After Order",
      trigger: "User says cancel my lunch order after place_food_order.",
      expectedDecision: `Show '${cancellationCopy}' and optionally check get_food_orders for status; do not call a cancellation tool.`,
      status: "ready",
    },
    {
      id: "instamart_cancel_after_checkout",
      label: "Instamart Cancel After Checkout",
      trigger: "User asks to cancel groceries after checkout.",
      expectedDecision: `Show '${cancellationCopy}', use get_orders for active context if needed, and avoid fake cancellation mutations.`,
      status: "ready",
    },
    {
      id: "dineout_booking_issue",
      label: "Dineout Booking Issue",
      trigger: "User says the restaurant cannot find the booking.",
      expectedDecision: "Call get_booking_status, then prepare Dineout report_error with orderId if the booking flow failed.",
      status: "ready",
    },
    {
      id: "search_or_checkout_error",
      label: "Search Or Checkout Error",
      trigger: "A Swiggy tool returns a user-visible validation, upstream, or timeout failure.",
      expectedDecision: "Classify the error bucket, offer report_error with toolContext, and keep raw payloads out of support copy.",
      status: "ready",
    },
    {
      id: "multi_session_incident",
      label: "Multi-session Incident",
      trigger: `${recommendationCount} recent plans hit the same upstream failure class.`,
      expectedDecision: "Promote to incident email with session ids, time range, expected vs actual behavior, and redacted evidence.",
      status: "watch",
    },
  ];

  const telemetry: SwiggyCancellationCareTelemetry[] = [
    { field: "care_intent", source: "intent router", redaction: "intent enum only", status: "ready" },
    { field: "support_tool", source: "tool router", redaction: "tool name only", status: "ready" },
    { field: "tool_context_hash", source: "failed tool call", redaction: "hash order, cart, item, slot, coupon, address, and query ids", status: "ready" },
    { field: "customer_care_copy_shown", source: "UI event", redaction: "boolean only", status: "ready" },
    { field: "incident_time_range", source: "runtime telemetry", redaction: "rounded time window", status: "ready" },
    { field: "live_report_receipt", source: "Swiggy staging or production", redaction: "receipt id hash only", status: "external_gate" },
  ];

  const externalGates = [
    "Swiggy staging credentials are required to verify live report_error receipts and enterprise support contacts.",
    "Customer-care phone copy must be rechecked during production access review before launch copy freeze.",
    "Stable symbolic error.code routing remains gated until Swiggy ships the planned registry.",
  ];

  const score =
    (lanes.reduce((sum, lane) => sum + statusWeight(lane.status), 0) / lanes.length) * 30 +
    (controls.reduce((sum, control) => sum + statusWeight(control.status), 0) / controls.length) * 28 +
    (scenarios.reduce((sum, scenario) => sum + statusWeight(scenario.status), 0) / scenarios.length) * 22 +
    (telemetry.reduce((sum, field) => sum + statusWeight(field.status), 0) / telemetry.length) * 20;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round(score),
    mode: options.config.swiggyMode,
    officialSources,
    customerCarePhone,
    totals: {
      lanes: lanes.length,
      reportErrorTools: 3,
      readyControls: controls.filter((control) => control.status === "ready").length,
      scenarios: scenarios.length,
      noToolCancellationGuards: lanes.filter((lane) => lane.blockedAction.toLowerCase().includes("do not call")).length,
      externalGates: externalGates.length,
    },
    lanes,
    controls,
    scenarios,
    telemetry,
    operatorActions: [
      {
        id: "validate_customer_care_copy",
        label: "Validate customer-care copy",
        owner: "Operator",
        status: "ready",
        evidence: `Food and Instamart cancellation intents show ${customerCarePhone} and no fake cancellation tool.`,
      },
      {
        id: "rehearse_report_error_receipts",
        label: "Rehearse report_error receipts",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Requires live staging accounts to verify support report ids and enterprise support contact routing.",
      },
      {
        id: "incident_alias_setup",
        label: "Incident alias setup",
        owner: "Operator",
        status: "ready",
        evidence: "builders@swiggy.in email templates include severity, session ids, time range, and expected vs actual behavior.",
      },
    ],
    assertions: [
      "Food and Instamart cancellation requests never call an MCP cancellation tool.",
      `Cancellation copy uses Swiggy customer care ${customerCarePhone}.`,
      "report_error is reserved for in-session user-reported errors with redacted toolContext.",
      "Silent developer 4xx/5xx debugging routes to builders@swiggy.in incident email.",
      "Planned symbolic error codes remain gated until Swiggy emits error.code.",
    ],
    externalGates,
  };
}
