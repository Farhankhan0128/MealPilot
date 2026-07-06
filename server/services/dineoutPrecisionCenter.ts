import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyDineoutPrecisionCenterReport,
  SwiggyDineoutPrecisionGuard,
  SwiggyDineoutPrecisionLane,
  SwiggyDineoutPrecisionScenario,
  SwiggyDineoutPrecisionStatus,
  SwiggyDineoutPrecisionTelemetry,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_saved_locations/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/search_restaurants_dineout/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_restaurant_details/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_available_slots/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/create_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/book_table/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_booking_status/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/report_error/",
];

function statusWeight(status: SwiggyDineoutPrecisionStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.48;
}

export function buildSwiggyDineoutPrecisionCenter(options: {
  config: ServerConfig;
  plans: MealPlan[];
}): SwiggyDineoutPrecisionCenterReport {
  const latestPlan = options.plans.at(-1);
  const recommendationCount = latestPlan?.recommendations.length ?? 3;

  const lanes: SwiggyDineoutPrecisionLane[] = [
    {
      id: "free_reservation_direct_booking",
      label: "Free Reservation Direct Booking",
      intent: "free_table_booking",
      officialTools: [
        "get_saved_locations",
        "search_restaurants_dineout",
        "get_restaurant_details",
        "get_available_slots",
        "book_table",
        "get_booking_status",
      ],
      cartType: "DEAL_TICKET_PURCHASE",
      requiredFields: ["restaurantId", "slotId", "itemId", "reservationTime", "guestCount", "latitude", "longitude"],
      allowedAction:
        "Use book_table only after a current get_available_slots response proves the selected deal is free with isFree=true and bookingPrice=0.",
      blockedAction: "Block paid, Prime, or non-free slot deals because book_table rejects paid deals.",
      confirmationCopy:
        "Confirm the restaurant, IST slot time, party size, free booking price, itemId, and coordinates before reserving.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[6], officialSources[8], "/api/swiggy-confirmation-command-center"],
    },
    {
      id: "standalone_booking_cart",
      label: "Standalone Booking Cart",
      intent: "standalone_booking_cart",
      officialTools: ["get_available_slots", "create_cart", "book_table"],
      cartType: "DEAL_TICKET_PURCHASE",
      requiredFields: ["restaurantId", "slotId", "itemId", "reservationTime", "guestCount", "latitude", "longitude"],
      allowedAction:
        "Use create_cart for standalone Dineout cart operations when the booking cart needs to be inspected before the final book_table call.",
      blockedAction: "Do not call create_cart for normal book_table flows because book_table creates its own cart internally.",
      confirmationCopy:
        "Show why standalone cart creation is needed, then repeat the same free-deal and slot identifiers before continuing.",
      status: "ready",
      evidenceLinks: [officialSources[7], officialSources[8], "/api/swiggy-cart-mutation-workbench"],
    },
    {
      id: "bill_payment_cart",
      label: "Bill Payment Cart",
      intent: "bill_payment_cart",
      officialTools: ["create_cart", "report_error"],
      cartType: "DINEOUT",
      requiredFields: ["restaurantId", "cartType", "billAmount", "latitude", "longitude", "source"],
      allowedAction:
        "Model a DINEOUT bill-payment cart with an explicit bill amount and source while keeping live payment execution behind Swiggy credentials.",
      blockedAction:
        "Do not reuse free-reservation fields, do not call book_table for bill payment, and do not estimate payment status locally.",
      confirmationCopy:
        "Confirm restaurant, bill amount in rupees, source, and location before creating a Dineout bill-payment cart.",
      status: "ready",
      evidenceLinks: [officialSources[7], officialSources[10], "/api/mcp/commercial-action-guard"],
    },
    {
      id: "paid_deal_rejection",
      label: "Paid Deal Rejection",
      intent: "free_table_booking",
      officialTools: ["get_available_slots", "create_cart", "book_table"],
      cartType: "DEAL_TICKET_PURCHASE",
      requiredFields: ["isFree", "bookingPrice", "displayFee", "discountPercentage"],
      allowedAction:
        "Surface paid deals as discovery-only context and ask the user to choose a free slot if they want MealPilot to book.",
      blockedAction: "Never pass a paid deal to create_cart or book_table because paid deals will be rejected.",
      confirmationCopy:
        "This deal requires payment, so MealPilot can show it but cannot book it through the free-reservation path.",
      status: "ready",
      evidenceLinks: [officialSources[6], officialSources[7], officialSources[8], "/api/swiggy-offer-intelligence"],
    },
    {
      id: "post_booking_status",
      label: "Post-booking Status Probe",
      intent: "post_booking_status",
      officialTools: ["get_booking_status", "report_error"],
      cartType: "none",
      requiredFields: ["orderId"],
      allowedAction:
        "Use get_booking_status after booking and before any retry when book_table or create_cart returns an ambiguous response.",
      blockedAction: "Do not retry book_table or create_cart blindly after a timeout or 5xx.",
      confirmationCopy:
        "Checking booking status before retrying so we do not create duplicate Dineout reservations or cart actions.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[9], officialSources[10], "/api/swiggy-order-lifecycle"],
    },
    {
      id: "live_dineout_payment_calibration",
      label: "Live Dineout Payment Calibration",
      intent: "live_calibration",
      officialTools: ["create_cart", "book_table", "get_booking_status", "report_error"],
      cartType: "DINEOUT",
      requiredFields: ["stagingCredentials", "seedRestaurant", "seedBillAmount", "supportReceipt"],
      allowedAction:
        "Replay seeded Dineout booking and bill-payment carts only after Swiggy issues staging credentials and test restaurants.",
      blockedAction: "Do not claim live bill-payment settlement, payment completion, or partner acceptance from local mock evidence.",
      confirmationCopy:
        "Live Dineout payment behavior remains gated until staging credentials and seeded venue data are approved.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix", "/api/mcp/staging-cutover"],
    },
  ];

  const guards: SwiggyDineoutPrecisionGuard[] = [
    {
      id: "free_booking_only",
      label: "Free-booking Only Guard",
      policy: "book_table is allowed only for FREE reservations where the selected deal has isFree=true and bookingPrice=0.",
      status: "ready",
      evidenceLinks: [officialSources[6], officialSources[8]],
    },
    {
      id: "cart_type_split",
      label: "Cart-type Split",
      policy: "DEAL_TICKET_PURCHASE is used for table-booking carts; DINEOUT is used for bill-payment carts.",
      status: "ready",
      evidenceLinks: [officialSources[7]],
    },
    {
      id: "book_table_internal_cart",
      label: "Internal-cart Awareness",
      policy: "Normal free table reservations call book_table directly because it creates the cart internally.",
      status: "ready",
      evidenceLinks: [officialSources[7], officialSources[8]],
    },
    {
      id: "paid_deal_block",
      label: "Paid Deal Block",
      policy: "Paid, Prime, or deposit-bearing deals remain informational until Swiggy approves a live payment path.",
      status: "ready",
      evidenceLinks: [officialSources[6], officialSources[8]],
    },
    {
      id: "no_blind_booking_retry",
      label: "No-blind Retry",
      policy: "Ambiguous Dineout mutations must use get_booking_status or support routing before retry.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[9], "/api/error-intelligence"],
    },
  ];

  const scenarios: SwiggyDineoutPrecisionScenario[] = [
    {
      id: "free_slot_selected",
      label: "Free Slot Selected",
      trigger: "User picks a slot whose deal has isFree=true and bookingPrice=0.",
      expectedDecision: "Show final reservation confirmation, then allow book_table with slotId, itemId, reservationTime, guestCount, and coordinates.",
      protectedTool: "book_table",
      status: "ready",
    },
    {
      id: "paid_slot_selected",
      label: "Paid Slot Selected",
      trigger: "User picks a paid or Prime deal from get_available_slots.",
      expectedDecision: "Block book_table, explain paid deals are not supported by the free booking path, and offer free alternatives.",
      protectedTool: "book_table",
      status: "ready",
    },
    {
      id: "standalone_bill_amount",
      label: "Standalone Bill Amount",
      trigger: "User wants to create a Dineout bill-payment cart for a restaurant bill.",
      expectedDecision: "Use create_cart with cartType DINEOUT, billAmount, source, restaurantId, and coordinates; keep live payment outcome gated.",
      protectedTool: "create_cart",
      status: "ready",
    },
    {
      id: "booking_timeout",
      label: "Booking Timeout",
      trigger: "book_table returns a network timeout after user confirmation.",
      expectedDecision: "Call get_booking_status before retrying and prepare report_error if status cannot be resolved.",
      protectedTool: "get_booking_status",
      status: "ready",
    },
    {
      id: "multi_recommendation_evening",
      label: "Multi-recommendation Evening",
      trigger: `${recommendationCount} recommendations include a Dineout table plus Food or Instamart tasks.`,
      expectedDecision: "Keep Dineout booking and bill-payment confirmation separate from Food order placement and Instamart checkout.",
      protectedTool: "book_table",
      status: "ready",
    },
  ];

  const telemetry: SwiggyDineoutPrecisionTelemetry[] = [
    { field: "dineout_intent", source: "intent router", redaction: "intent enum only", status: "ready" },
    { field: "cart_type", source: "create_cart arguments", redaction: "cart type only", status: "ready" },
    { field: "free_deal_verified", source: "get_available_slots", redaction: "boolean and price bucket only", status: "ready" },
    { field: "slot_context_hash", source: "slot selection", redaction: "hash restaurant, slot, item, and reservation time", status: "ready" },
    { field: "bill_amount_bucket", source: "bill-payment cart", redaction: "rounded rupee bucket, no receipt image", status: "ready" },
    { field: "live_payment_outcome", source: "Swiggy staging or production", redaction: "aggregate status only", status: "external_gate" },
  ];

  const externalGates = [
    "Swiggy staging credentials and seeded Dineout venues are required before live bill-payment cart validation.",
    "Live payment completion, settlement, and venue acceptance cannot be claimed from local mock evidence.",
    "Paid Dineout deals remain blocked until Swiggy exposes or approves a supported paid booking path.",
  ];

  const score =
    (lanes.reduce((sum, lane) => sum + statusWeight(lane.status), 0) / lanes.length) * 30 +
    (guards.reduce((sum, guard) => sum + statusWeight(guard.status), 0) / guards.length) * 28 +
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
      freeBookingGuards: guards.filter((guard) => guard.policy.toLowerCase().includes("free")).length,
      billPaymentLanes: lanes.filter((lane) => lane.intent === "bill_payment_cart").length,
      readyGuards: guards.filter((guard) => guard.status === "ready").length,
      scenarios: scenarios.length,
      externalGates: lanes.filter((lane) => lane.status === "external_gate").length + externalGates.length,
    },
    lanes,
    guards,
    scenarios,
    telemetry,
    operatorActions: [
      {
        id: "record_free_slot_fixture",
        label: "Record Free-slot Fixture",
        owner: "MealPilot",
        status: "ready",
        evidence: "Local Dineout fixtures include free slot identifiers, free price fields, and booking status probes.",
      },
      {
        id: "seed_bill_payment_fixture",
        label: "Seed Bill-payment Fixture",
        owner: "Operator",
        status: "watch",
        evidence: "Add a staged restaurant bill amount once Swiggy issues Dineout test data.",
      },
      {
        id: "validate_live_dineout_payment",
        label: "Validate Live Dineout Payment",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Requires Swiggy staging credentials, a seeded venue, and support confirmation.",
      },
    ],
    assertions: [
      "MealPilot separates Dineout free reservation booking from Dineout bill-payment cart creation.",
      "book_table is only offered after a fresh free slot with isFree=true and bookingPrice=0 is selected.",
      "create_cart with cartType DINEOUT is modeled as a bill-payment cart and never as a table-booking shortcut.",
      "Ambiguous Dineout mutations use get_booking_status and report_error before any retry.",
    ],
    externalGates,
  };
}
