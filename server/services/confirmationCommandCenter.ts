import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyConfirmationChecklistItem,
  SwiggyConfirmationCommandCenterReport,
  SwiggyConfirmationCommandStatus,
  SwiggyConfirmationLane,
  SwiggyConfirmationScenario,
  SwiggyConfirmationTelemetry,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/food/place_food_order/",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_orders/",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_order_details/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/checkout/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_orders/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_order_details/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_available_slots/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/book_table/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_booking_status/",
];

function statusWeight(status: SwiggyConfirmationCommandStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.48;
}

export function buildSwiggyConfirmationCommandCenter(options: {
  config: ServerConfig;
  plans: MealPlan[];
}): SwiggyConfirmationCommandCenterReport {
  const latestPlan = options.plans.at(-1);
  const recommendationCount = latestPlan?.recommendations.length ?? 3;

  const lanes: SwiggyConfirmationLane[] = [
    {
      id: "food_order_confirmation",
      server: "food",
      label: "Food Order Confirmation",
      officialTools: ["get_food_cart", "place_food_order", "get_food_orders", "get_food_order_details"],
      protectedAction: "place_food_order",
      confirmationCopy:
        "Repeat restaurant, items, total, address label, and the selected payment method from get_food_cart before the final Food CTA.",
      preflightReads: ["get_food_cart"],
      postActionProbe: "Use get_food_orders or get_food_order_details before any retry if place_food_order times out.",
      retryPolicy: "Never blind-retry place_food_order; check active order state first and surface support context if uncertain.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[3], officialSources[4], "/api/mcp/commercial-action-guard"],
    },
    {
      id: "instamart_checkout_confirmation",
      server: "instamart",
      label: "Instamart Checkout Confirmation",
      officialTools: ["get_cart", "checkout", "get_orders", "get_order_details"],
      protectedAction: "checkout",
      confirmationCopy:
        "Repeat cart items, bill breakdown, serviceability, address, and available payment method from get_cart before checkout.",
      preflightReads: ["get_cart"],
      postActionProbe: "Use get_orders or get_order_details before any retry if checkout returns an ambiguous error.",
      retryPolicy: "Treat checkout as order creation plus payment confirmation; do not auto-retry without an order-status read.",
      status: "ready",
      evidenceLinks: [officialSources[6], officialSources[7], officialSources[8], "/api/swiggy-order-lifecycle"],
    },
    {
      id: "dineout_booking_confirmation",
      server: "dineout",
      label: "Dineout Booking Confirmation",
      officialTools: ["get_available_slots", "create_cart", "book_table", "get_booking_status"],
      protectedAction: "book_table",
      confirmationCopy:
        "Repeat restaurant, date, display time, guest count, slotId, itemId, reservationTime, and free-booking truth before booking.",
      preflightReads: ["get_available_slots"],
      postActionProbe: "Use get_booking_status with the returned order ID before any retry if book_table is uncertain.",
      retryPolicy: "Only free Dineout reservations are eligible; paid deal attempts remain blocked and reported to the user.",
      status: "ready",
      evidenceLinks: [officialSources[10], officialSources[11], officialSources[12], "/api/swiggy-discovery-freshness"],
    },
    {
      id: "combined_action_sequencer",
      server: "combined",
      label: "Combined Action Sequencer",
      officialTools: ["place_food_order", "checkout", "book_table"],
      protectedAction: "separate_confirmations",
      confirmationCopy:
        `Split ${recommendationCount} recommendations into one final approval per protected action, with no generic continue button.`,
      preflightReads: ["get_food_cart", "get_cart", "get_available_slots"],
      postActionProbe: "Probe each server's order or booking status independently after its own final action.",
      retryPolicy: "Food, Instamart, and Dineout approvals run as separate state machines even when a single plan produced them.",
      status: "ready",
      evidenceLinks: ["/api/swiggy-journey-compiler", "/api/mcp/state-orchestrator", "/api/mcp/scenario-runner"],
    },
    {
      id: "live_confirmation_calibration",
      server: "combined",
      label: "Live Confirmation Calibration",
      officialTools: ["place_food_order", "checkout", "book_table"],
      protectedAction: "production_credentials",
      confirmationCopy:
        "Replay seeded staging confirmations with Swiggy-issued test accounts before enabling any production commercial action.",
      preflightReads: ["get_food_cart", "get_cart", "get_available_slots"],
      postActionProbe: "Compare staging order and booking status probes against support packet evidence before launch.",
      retryPolicy: "Live commercial actions stay disabled until Swiggy approves credentials, redirect URIs, and seeded test data.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix"],
    },
  ];

  const checklist: SwiggyConfirmationChecklistItem[] = [
    {
      id: "fresh_read_required",
      label: "Fresh Read Required",
      policy: "Every final commerce action starts from a fresh cart, slot, or booking-intent read tied to the selected address or coordinates.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[6], officialSources[10]],
    },
    {
      id: "explicit_final_cta",
      label: "Explicit Final CTA",
      policy: "The final button names the protected action and repeats the authoritative total, restaurant/store/table context, and payment or free-booking truth.",
      status: "ready",
      evidenceLinks: [officialSources[3], officialSources[7], officialSources[11]],
    },
    {
      id: "separate_confirmations",
      label: "Separate Confirmations",
      policy: "Combined Food, Instamart, and Dineout journeys never collapse place_food_order, checkout, and book_table behind one generic approval.",
      status: "ready",
      evidenceLinks: ["/api/swiggy-journey-compiler", "/api/mcp/commercial-action-guard"],
    },
    {
      id: "post_action_status_probe",
      label: "Post-action Status Probe",
      policy: "Ambiguous network or 5xx outcomes trigger order or booking status reads before any retry path is offered.",
      status: "ready",
      evidenceLinks: [officialSources[4], officialSources[8], officialSources[12], "/api/swiggy-order-lifecycle"],
    },
    {
      id: "support_packet_ready",
      label: "Support Packet Ready",
      policy: "Each protected action keeps redacted tool name, confirmation id, preflight hash, and status probe references for Swiggy support handoff.",
      status: "ready",
      evidenceLinks: ["/api/support/bridge", "/api/audit-ledger"],
    },
    {
      id: "payment_truth_only",
      label: "Payment Truth Only",
      policy: "Payment methods, bill totals, cart charges, and free-booking status are copied from Swiggy tool responses, never estimated.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[6], officialSources[10], officialSources[11]],
    },
  ];

  const scenarios: SwiggyConfirmationScenario[] = [
    {
      id: "food_timeout_after_confirm",
      label: "Food Timeout After Confirm",
      trigger: "place_food_order times out after the user confirms.",
      expectedDecision: "Call get_food_orders or get_food_order_details, then show either the placed order or a support-safe unresolved state.",
      protectedAction: "place_food_order",
      status: "ready",
    },
    {
      id: "instamart_serviceability_change",
      label: "Instamart Serviceability Change",
      trigger: "get_cart shows minimum-cart, unavailable SKU, or address serviceability changes before checkout.",
      expectedDecision: "Block checkout, show the cart truth from Swiggy, and ask the user to adjust before any final CTA.",
      protectedAction: "checkout",
      status: "ready",
    },
    {
      id: "dineout_slot_disappears",
      label: "Dineout Slot Disappears",
      trigger: "The selected slot is absent or no longer free in the latest get_available_slots response.",
      expectedDecision: "Block book_table and ask the user to pick a current free slot with slotId, itemId, and reservationTime.",
      protectedAction: "book_table",
      status: "ready",
    },
    {
      id: "combined_evening_separate_approvals",
      label: "Combined Evening Separate Approvals",
      trigger: "A plan contains lunch delivery, dinner groceries, and a Dineout table.",
      expectedDecision: "Render separate final confirmations for place_food_order, checkout, and book_table with independent status probes.",
      protectedAction: "separate_confirmations",
      status: "ready",
    },
  ];

  const telemetry: SwiggyConfirmationTelemetry[] = [
    { field: "confirmation_id_hash", source: "confirmation surface", redaction: "hash identifier only", status: "ready" },
    { field: "protected_action", source: "tool router", redaction: "tool name only", status: "ready" },
    { field: "preflight_snapshot_hash", source: "cart or slot response", redaction: "hash totals and identifiers", status: "ready" },
    { field: "post_action_probe", source: "order or booking status read", redaction: "tool name and status enum", status: "ready" },
    { field: "user_confirmation_surface", source: "web, mobile, voice, or widget shell", redaction: "surface enum only", status: "ready" },
    { field: "live_action_result", source: "staging or production MCP session", redaction: "aggregate result and support ticket reference", status: "external_gate" },
  ];

  const externalGates = [
    "Swiggy staging credentials and seeded accounts are required before live place_food_order, checkout, or book_table drills.",
    "Production commercial actions stay disabled until Swiggy approves Builder Access, redirect URIs, and credential scope.",
    "Raw address IDs, order IDs, booking IDs, cart identifiers, payment details, and coordinates are never logged raw.",
  ];

  const score =
    (lanes.reduce((sum, lane) => sum + statusWeight(lane.status), 0) / lanes.length) * 30 +
    (checklist.reduce((sum, item) => sum + statusWeight(item.status), 0) / checklist.length) * 28 +
    (scenarios.reduce((sum, scenario) => sum + statusWeight(scenario.status), 0) / scenarios.length) * 22 +
    (telemetry.reduce((sum, field) => sum + statusWeight(field.status), 0) / telemetry.length) * 20;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round(score),
    mode: options.config.swiggyMode,
    officialSources,
    totals: {
      lanes: lanes.length,
      toolsCovered: new Set(lanes.flatMap((lane) => lane.officialTools)).size,
      readyChecklistItems: checklist.filter((item) => item.status === "ready").length,
      scenarios: scenarios.length,
      protectedActions: new Set(lanes.map((lane) => lane.protectedAction)).size,
      postActionProbes: lanes.filter((lane) => lane.postActionProbe.length > 0).length,
      externalGates: externalGates.length,
    },
    lanes,
    checklist,
    scenarios,
    telemetry,
    operatorActions: [
      {
        id: "rehearse_staging_confirmations",
        label: "Rehearse staging confirmations",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Requires Swiggy test accounts to verify live order and booking status probes.",
      },
      {
        id: "wire_final_cta_copy",
        label: "Wire final CTA copy",
        owner: "MealPilot",
        status: "ready",
        evidence: "Every protected action receives purpose-built copy and a fresh-read snapshot before submission.",
      },
      {
        id: "support_playbook_review",
        label: "Support playbook review",
        owner: "Operator",
        status: "ready",
        evidence: "Ambiguous commercial outcomes include redacted support packet context and status-probe requirements.",
      },
    ],
    assertions: [
      "place_food_order, checkout, and book_table are never hidden behind one generic continue button.",
      "Every final action has a fresh read, explicit confirmation, and status probe before retry.",
      "Payment methods, bill totals, and free booking status come only from Swiggy tool responses.",
      "Combined plans require separate confirmations for Food, Instamart, and Dineout.",
    ],
    externalGates,
  };
}
