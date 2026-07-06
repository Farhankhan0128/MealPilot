import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  Recommendation,
  SwiggyOrderLifecycleLane,
  SwiggyOrderLifecycleRecovery,
  SwiggyOrderLifecycleReport,
  SwiggyOrderLifecycleStatus,
  SwiggyOrderLifecycleTelemetry,
  SwiggyOrderLifecycleTimeline,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_orders/",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_order_details/",
  "https://mcp.swiggy.com/builders/docs/reference/food/track_food_order/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_orders/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_order_details/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/track_order/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_booking_status/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

const fallbackRecommendations: Recommendation[] = [
  {
    id: "rec_food",
    server: "food",
    title: "Protein Bowl Lunch",
    provider: "Green Bowl Kitchen",
    locationLabel: "Home",
    eta: "28 min",
    total: 420,
    confidence: 0.92,
    reason: "Fallback lifecycle fixture for Food status tooling.",
    items: [],
    status: "confirmed",
    toolChain: ["get_food_orders", "get_food_order_details", "track_food_order"],
    confirmationAction: "place_food_order",
    guardrails: ["Probe order status before retrying order placement."],
    alternatives: [],
  },
  {
    id: "rec_instamart",
    server: "instamart",
    title: "Dinner Grocery Basket",
    provider: "Swiggy Instamart",
    locationLabel: "Home",
    eta: "18 min",
    total: 760,
    confidence: 0.9,
    reason: "Fallback lifecycle fixture for Instamart status tooling.",
    items: [],
    status: "confirmed",
    toolChain: ["get_orders", "get_order_details", "track_order"],
    confirmationAction: "checkout",
    guardrails: ["Probe grocery order status before retrying checkout."],
    alternatives: [],
  },
  {
    id: "rec_dineout",
    server: "dineout",
    title: "Saturday Table",
    provider: "Burma Burma",
    locationLabel: "Indiranagar",
    eta: "Saturday 7:30 PM",
    total: 0,
    confidence: 0.88,
    reason: "Fallback lifecycle fixture for Dineout booking status tooling.",
    items: [],
    status: "prepared",
    toolChain: ["get_booking_status"],
    confirmationAction: "book_table",
    guardrails: ["Probe booking status before retrying table booking."],
    alternatives: [],
  },
];

function statusWeight(status: SwiggyOrderLifecycleStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.48;
}

function timelineForRecommendation(recommendation: Recommendation): SwiggyOrderLifecycleTimeline {
  const confirmed = recommendation.status === "confirmed";
  const config: Record<SwiggyServer, { state: string; eta: number | null; supportTrigger: string; copy: string; link: string }> = {
    food: {
      state: confirmed ? "preparing" : "awaiting_confirmation",
      eta: confirmed ? 28 : null,
      supportTrigger: "No restaurant acceptance or rider movement after the expected preparation window.",
      copy: confirmed
        ? `${recommendation.provider} is preparing ${recommendation.title}; next refresh uses track_food_order.`
        : `${recommendation.title} is still locked until food order confirmation.`,
      link: officialSources[4],
    },
    instamart: {
      state: confirmed ? "picking" : "awaiting_checkout",
      eta: confirmed ? 18 : null,
      supportTrigger: "Picker status stalls or item substitutions appear after checkout.",
      copy: confirmed
        ? `${recommendation.title} is being picked; next refresh uses track_order.`
        : `${recommendation.title} is still locked until Instamart checkout confirmation.`,
      link: officialSources[7],
    },
    dineout: {
      state: confirmed ? "reservation_confirmed" : "awaiting_booking",
      eta: null,
      supportTrigger: "Booking status is missing or restaurant slot confirmation is inconsistent.",
      copy: confirmed
        ? `${recommendation.provider} reservation is being verified through get_booking_status.`
        : `${recommendation.title} remains a prepared reservation option until booking confirmation.`,
      link: officialSources[8],
    },
  };
  const selected = config[recommendation.server];

  return {
    id: `timeline_${recommendation.id}`,
    server: recommendation.server,
    label: recommendation.title,
    state: selected.state,
    etaMinutes: selected.eta,
    visibleCopy: selected.copy,
    supportTrigger: selected.supportTrigger,
    status: confirmed ? "ready" : "watch",
    evidenceLinks: [selected.link, "/api/tracking/:sessionId", "/api/support/bridge"],
  };
}

export function buildSwiggyOrderLifecycle(options: { config: ServerConfig; plans: MealPlan[] }): SwiggyOrderLifecycleReport {
  const latestPlan = options.plans.at(-1);
  const recommendations = latestPlan?.recommendations.length ? latestPlan.recommendations : fallbackRecommendations;

  const lanes: SwiggyOrderLifecycleLane[] = [
    {
      id: "food_order_lifecycle",
      server: "food",
      label: "Food Order Lifecycle",
      officialTools: ["get_food_orders", "get_food_order_details", "track_food_order"],
      cadenceSeconds: 10,
      retryPolicy: "After uncertain place_food_order, probe get_food_orders and get_food_order_details before any retry.",
      supportEscalation: "Attach track_food_order state, order id, restaurant, redacted session id, and last request id.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[3], officialSources[4]],
    },
    {
      id: "instamart_order_lifecycle",
      server: "instamart",
      label: "Instamart Order Lifecycle",
      officialTools: ["get_orders", "get_order_details", "track_order"],
      cadenceSeconds: 10,
      retryPolicy: "After uncertain checkout, probe get_orders and get_order_details before any retry.",
      supportEscalation: "Attach track_order state, grocery order id, item substitutions, redacted session id, and last request id.",
      status: "ready",
      evidenceLinks: [officialSources[5], officialSources[6], officialSources[7]],
    },
    {
      id: "dineout_booking_lifecycle",
      server: "dineout",
      label: "Dineout Booking Lifecycle",
      officialTools: ["get_booking_status"],
      cadenceSeconds: 30,
      retryPolicy: "After uncertain book_table, probe get_booking_status before any retry or second booking attempt.",
      supportEscalation: "Attach booking status, restaurant id, slot, guest count, redacted session id, and last request id.",
      status: "ready",
      evidenceLinks: [officialSources[8], "/api/mcp/commercial-action-guard"],
    },
    {
      id: "combined_recovery_desk",
      server: "combined",
      label: "Combined Recovery Desk",
      officialTools: ["get_food_orders", "get_orders", "get_booking_status", "report_error"],
      cadenceSeconds: 10,
      retryPolicy: "Resolve each server independently; never let one uncertain commercial action trigger another server retry.",
      supportEscalation: "Bundle only redacted timeline, tool name, request id, and user-visible state per affected server.",
      status: "ready",
      evidenceLinks: ["/api/support/bridge", "/api/error-intelligence", "/api/audit-ledger"],
    },
    {
      id: "live_status_calibration",
      server: "combined",
      label: "Live Status Calibration",
      officialTools: ["track_food_order", "track_order", "get_booking_status"],
      cadenceSeconds: 10,
      retryPolicy: "Compare mock timeline states to staging responses after Swiggy issues seeded accounts.",
      supportEscalation: "Attach staging transcript wave and Swiggy support envelope.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix"],
    },
  ];

  const timelines = recommendations.map(timelineForRecommendation);

  const recoveries: SwiggyOrderLifecycleRecovery[] = [
    {
      id: "food_timeout_after_place",
      trigger: "place_food_order times out after user confirmation.",
      statusProbe: "Call get_food_orders, then get_food_order_details for any matching active order.",
      decision: "If an order exists, show the timeline; if no order exists, ask before retrying place_food_order.",
      blockedRetry: "Blind place_food_order retry is blocked.",
      supportPacket: "Food order id, restaurant, request id, redacted session id, and track_food_order state.",
      status: "ready",
    },
    {
      id: "instamart_checkout_uncertain",
      trigger: "Instamart checkout returns network uncertainty.",
      statusProbe: "Call get_orders, then get_order_details for the newest grocery order.",
      decision: "If checkout succeeded, show tracking; if no order exists, refresh cart before asking for another checkout.",
      blockedRetry: "Blind checkout retry is blocked.",
      supportPacket: "Instamart order id, item list hash, request id, redacted session id, and track_order state.",
      status: "ready",
    },
    {
      id: "dineout_booking_uncertain",
      trigger: "book_table response is ambiguous.",
      statusProbe: "Call get_booking_status with the booking/order id before any second booking.",
      decision: "If booking exists, show restaurant/date/time/guests; otherwise ask before rebooking the same slot.",
      blockedRetry: "Blind book_table retry is blocked.",
      supportPacket: "Restaurant id, slot, guest count, request id, redacted session id, and booking status.",
      status: "ready",
    },
    {
      id: "tracking_loop_backpressure",
      trigger: "User or UI refreshes tracking faster than policy.",
      statusProbe: "Use last known timeline state until the 10-second floor expires.",
      decision: "Defer duplicate tracking reads and show last refreshed timestamp.",
      blockedRetry: "Sub-10-second track_food_order or track_order loop is blocked.",
      supportPacket: "Request ids, deferred call count, last visible state, and governor decision.",
      status: "ready",
    },
  ];

  const telemetry: SwiggyOrderLifecycleTelemetry[] = [
    { field: "order_id_hash", source: "status tools", redaction: "hash only; no raw order id in logs", status: "ready" },
    { field: "booking_id_hash", source: "get_booking_status", redaction: "hash only; no raw booking id in logs", status: "ready" },
    { field: "last_request_id", source: "runtime telemetry", redaction: "opaque UUID", status: "ready" },
    { field: "timeline_state", source: "tracking tools", redaction: "user-visible state only", status: "ready" },
    { field: "live_status_delta", source: "staging calibration", redaction: "no raw Swiggy payload", status: "external_gate" },
  ];

  const externalGates = [
    "Live tracking and booking status require Swiggy-issued staging credentials and seeded orders.",
    "Exact order and booking identifiers are never logged raw; live support packets need Swiggy-approved redaction review.",
    "Status-page and incident escalation channels remain external until Swiggy production access is approved.",
  ];

  const score =
    (lanes.reduce((sum, lane) => sum + statusWeight(lane.status), 0) / lanes.length) * 30 +
    (timelines.reduce((sum, timeline) => sum + statusWeight(timeline.status), 0) / timelines.length) * 25 +
    (recoveries.reduce((sum, recovery) => sum + statusWeight(recovery.status), 0) / recoveries.length) * 25 +
    (telemetry.reduce((sum, field) => sum + statusWeight(field.status), 0) / telemetry.length) * 20;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round(score),
    mode: options.config.swiggyMode,
    officialSources,
    totals: {
      lanes: lanes.length,
      toolsCovered: new Set(lanes.flatMap((lane) => lane.officialTools).filter((tool) => tool !== "report_error")).size,
      activeTimelines: timelines.length,
      recoveryDrills: recoveries.length,
      trackingCadenceSeconds: 10,
      externalGates: externalGates.length,
    },
    lanes,
    timelines,
    recoveries,
    telemetry,
    operatorActions: [
      {
        id: "seed_status_orders",
        label: "Seed staging orders and bookings",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Needed for live Food, Instamart, and Dineout status calibration.",
      },
      {
        id: "enforce_tracking_floor",
        label: "Enforce tracking floor",
        owner: "MealPilot",
        status: "ready",
        evidence: "Backpressure Governor and Order Lifecycle both hold tracking reads to 10 seconds or slower.",
      },
      {
        id: "attach_support_timeline",
        label: "Attach support timeline",
        owner: "MealPilot",
        status: "ready",
        evidence: "Support Bridge receives redacted lifecycle state and request ids.",
      },
    ],
    assertions: [
      "Food, Instamart, and Dineout commercial actions are never blindly retried after uncertainty.",
      "Each status lane uses the official order, detail, tracking, or booking-status tool listed by Swiggy.",
      "Tracking refreshes stay user-visible and are throttled to 10 seconds or slower.",
      "Support packets contain redacted lifecycle evidence, not raw Swiggy payloads or bearer tokens.",
    ],
    externalGates,
  };
}
