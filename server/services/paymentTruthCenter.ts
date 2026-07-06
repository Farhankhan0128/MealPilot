import type { ServerConfig } from "../config.js";
import type {
  SwiggyPaymentTruthCenter,
  SwiggyPaymentTruthGuardrail,
  SwiggyPaymentTruthLane,
  SwiggyPaymentTruthReconciliation,
  SwiggyPaymentTruthSample,
  SwiggyPaymentTruthStatus,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/food/apply_food_coupon/",
  "https://mcp.swiggy.com/builders/docs/reference/food/place_food_order/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/checkout/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/create_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/book_table/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_booking_status/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function statusWeight(status: SwiggyPaymentTruthStatus) {
  if (status === "ready") return 1;
  if (status === "confirmation_gate") return 0.88;
  if (status === "support_gate") return 0.8;
  return 0.68;
}

function lane(input: SwiggyPaymentTruthLane): SwiggyPaymentTruthLane {
  return input;
}

function guardrail(input: SwiggyPaymentTruthGuardrail): SwiggyPaymentTruthGuardrail {
  return input;
}

function sample(input: SwiggyPaymentTruthSample): SwiggyPaymentTruthSample {
  return input;
}

function buildLanes(): SwiggyPaymentTruthLane[] {
  return [
    lane({
      id: "food_cart_payment_truth",
      label: "Food cart payment truth",
      server: "food",
      status: "confirmation_gate",
      swiggyTools: ["get_food_cart", "apply_food_coupon", "place_food_order", "get_food_orders"],
      trustedSignals: ["cart_total", "coupon_discount", "payment_methods", "cod_eligibility"],
      truthSource: "get_food_cart after every coupon or item mutation.",
      userPromise: "Show Food total, coupon savings, COD support, and payment labels only from the latest cart readback.",
      paymentBoundary: "place_food_order is locked until the cart total, address, payment mode, and coupon state are read back to the user.",
      evidenceLinks: ["/api/swiggy-cart-mutation-workbench", "/api/swiggy-offer-intelligence", "/api/mcp/commercial-action-guard"],
    }),
    lane({
      id: "instamart_bill_checkout_truth",
      label: "Instamart bill and checkout truth",
      server: "instamart",
      status: "confirmation_gate",
      swiggyTools: ["get_cart", "update_cart", "checkout", "get_orders"],
      trustedSignals: ["cart_total", "payment_methods", "cod_eligibility"],
      truthSource: "get_cart after update_cart and before checkout.",
      userPromise: "Use Instamart bill breakdown, stock, minimum order, serviceability, and payment methods from the current cart only.",
      paymentBoundary: "checkout stays locked until full basket, address, delivery promise, bill total, and payment choice are visible.",
      evidenceLinks: ["/api/swiggy-cart-mutation-workbench", "/api/nutrition-budget-intelligence", "/api/swiggy-order-lifecycle"],
    }),
    lane({
      id: "dineout_free_booking_truth",
      label: "Dineout free booking truth",
      server: "dineout",
      status: "confirmation_gate",
      swiggyTools: ["get_available_slots", "book_table", "get_booking_status"],
      trustedSignals: ["free_booking"],
      truthSource: "get_available_slots and get_booking_status around book_table.",
      userPromise: "Distinguish free Dineout table booking from bill-payment carts before the user confirms.",
      paymentBoundary: "book_table can proceed only for free slots with fresh slot, party size, time, and booking status recovery proof.",
      evidenceLinks: ["/api/swiggy-dineout-precision-center", "/api/premium-concierge-itinerary", "/api/swiggy-confirmation-command-center"],
    }),
    lane({
      id: "dineout_bill_payment_cart_truth",
      label: "Dineout bill-payment cart truth",
      server: "dineout",
      status: "staging_gate",
      swiggyTools: ["create_cart", "get_booking_status", "report_error"],
      trustedSignals: ["bill_payment"],
      truthSource: "create_cart only after Swiggy confirms paid Dineout cart policy and staging fixtures.",
      userPromise: "Keep Dineout bill-payment claims disabled until paid-cart behavior is approved and verified.",
      paymentBoundary: "MealPilot does not initiate Dineout paid bill settlement in mock proof; it documents the gate and support route.",
      evidenceLinks: ["/api/swiggy-dineout-precision-center", "/api/staging-certification-matrix", "/api/support/bridge"],
    }),
    lane({
      id: "combined_settlement_readback",
      label: "Combined settlement readback",
      server: "combined",
      status: "ready",
      swiggyTools: ["get_food_cart", "get_cart", "get_available_slots", "get_booking_status"],
      trustedSignals: ["cart_total", "coupon_discount", "payment_methods", "free_booking"],
      truthSource: "Separate Food, Instamart, and Dineout readbacks before any combined recommendation copy.",
      userPromise: "Compare order, grocery, and table paths without merging payment states or hiding separate confirmations.",
      paymentBoundary: "One combined plan still creates separate Food order, Instamart checkout, and Dineout booking confirmations.",
      evidenceLinks: ["/api/luxury-experience-workspace", "/api/swiggy-route-optimizer", "/api/swiggy-ritual-autopilot-center"],
    }),
  ];
}

function buildGuardrails(): SwiggyPaymentTruthGuardrail[] {
  return [
    guardrail({
      id: "cart_response_is_truth",
      label: "Cart response is truth",
      status: "ready",
      policy: "Prices, discounts, taxes, payment methods, and COD availability are copied only from Swiggy cart or status responses.",
      evidenceLinks: ["/api/swiggy-cart-mutation-workbench", "/api/audit-ledger"],
    }),
    guardrail({
      id: "no_payment_instrument_storage",
      label: "No payment instrument storage",
      status: "ready",
      policy: "MealPilot stores payment labels, eligibility, and coarse status only; it never stores card, UPI, wallet, or payment-instrument details.",
      evidenceLinks: ["/api/data-governance-center", "/api/telemetry/runtime"],
    }),
    guardrail({
      id: "coupon_truth_after_apply",
      label: "Coupon truth after apply",
      status: "ready",
      policy: "Coupon savings are shown only after apply_food_coupon and a fresh get_food_cart readback prove a positive discount.",
      evidenceLinks: ["/api/swiggy-offer-intelligence", officialSources[1]],
    }),
    guardrail({
      id: "separate_payment_confirmations",
      label: "Separate payment confirmations",
      status: "ready",
      policy: "Food order, Instamart checkout, and Dineout booking or bill-payment paths require separate confirmation copy and separate audit events.",
      evidenceLinks: ["/api/mcp/commercial-action-guard", "/api/swiggy-confirmation-command-center"],
    }),
    guardrail({
      id: "dineout_paid_cart_gate",
      label: "Dineout paid cart gate",
      status: "staging_gate",
      policy: "Dineout create_cart for bill payment remains disabled until Swiggy staging credentials, policy review, and paid-cart transcript proof exist.",
      evidenceLinks: ["/api/swiggy-dineout-precision-center", "/api/staging-certification-matrix"],
    }),
    guardrail({
      id: "settlement_support_route",
      label: "Settlement support route",
      status: "support_gate",
      policy: "Uncertain payment, checkout, or booking outcomes use status probes and report_error context rather than blind retry.",
      evidenceLinks: ["/api/swiggy-order-lifecycle", "/api/support/bridge"],
    }),
  ];
}

function buildSamples(): SwiggyPaymentTruthSample[] {
  return [
    sample({
      id: "food_cod_coupon",
      server: "food",
      prompt: "Check if this Food cart supports COD after applying the best coupon.",
      selectedLane: "food_cart_payment_truth",
      status: "confirmation_gate",
    }),
    sample({
      id: "instamart_bill_review",
      server: "instamart",
      prompt: "Review the Instamart bill and payment options before checkout.",
      selectedLane: "instamart_bill_checkout_truth",
      status: "confirmation_gate",
    }),
    sample({
      id: "dineout_free_table",
      server: "dineout",
      prompt: "Make sure this Dineout booking is free before reserving.",
      selectedLane: "dineout_free_booking_truth",
      status: "confirmation_gate",
    }),
    sample({
      id: "combined_budget_compare",
      server: "combined",
      prompt: "Compare delivery, groceries, and table options without mixing payment states.",
      selectedLane: "combined_settlement_readback",
      status: "ready",
    }),
  ];
}

function laneForServer(server: SwiggyServer | "combined", paymentPreference: "cod" | "online" | "free_booking" | "unknown") {
  const lanes = buildLanes();
  if (paymentPreference === "free_booking") return lanes.find((item) => item.id === "dineout_free_booking_truth") ?? lanes[2];
  if (server === "food") return lanes.find((item) => item.id === "food_cart_payment_truth") ?? lanes[0];
  if (server === "instamart") return lanes.find((item) => item.id === "instamart_bill_checkout_truth") ?? lanes[1];
  if (server === "dineout") return lanes.find((item) => item.id === "dineout_free_booking_truth") ?? lanes[2];
  return lanes.find((item) => item.id === "combined_settlement_readback") ?? lanes[4];
}

function riskFlags(input: { expectedDiscount: number; paymentPreference: string; cartTotal: number }) {
  return [
    input.expectedDiscount > 0 ? "coupon_requires_fresh_cart_readback" : "",
    input.paymentPreference === "cod" ? "cod_must_come_from_cart_payment_methods" : "",
    input.paymentPreference === "free_booking" ? "booking_price_must_be_zero" : "",
    input.cartTotal <= 0 ? "cart_total_needs_readback" : "",
  ].filter(Boolean);
}

function scoreCenter(lanes: SwiggyPaymentTruthLane[], guardrails: SwiggyPaymentTruthGuardrail[]) {
  const statuses = [...lanes.map((item) => item.status), ...guardrails.map((item) => item.status)];
  return Math.round((statuses.reduce((sum, status) => sum + statusWeight(status), 0) / statuses.length) * 100);
}

export function buildSwiggyPaymentTruthCenter(config: ServerConfig): SwiggyPaymentTruthCenter {
  const lanes = buildLanes();
  const guardrails = buildGuardrails();
  const samples = buildSamples();
  const base = `http://localhost:${config.port}`;

  return {
    generatedAt: new Date().toISOString(),
    score: scoreCenter(lanes, guardrails),
    mode: config.swiggyMode,
    officialSources,
    totals: {
      lanes: lanes.length,
      readyLanes: lanes.filter((item) => item.status === "ready" || item.status === "confirmation_gate").length,
      guardrails: guardrails.length,
      readyGuardrails: guardrails.filter((item) => item.status === "ready").length,
      samples: samples.length,
      externalGates: 3,
    },
    lanes,
    guardrails,
    samples,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Inspect payment truth",
        command: `curl -s ${base}/api/swiggy-payment-truth-center`,
        proves: "Food, Instamart, Dineout, and combined payment truth lanes are visible with source-of-truth policies.",
      },
      {
        sequence: 2,
        label: "Reconcile a cart",
        command:
          `curl -s -X POST ${base}/api/swiggy-payment-truth-center/reconcile -H 'Content-Type: application/json' ` +
          `-d '{"server":"food","cartTotal":720,"expectedDiscount":120,"paymentPreference":"cod","city":"Bengaluru"}'`,
        proves: "MealPilot returns settlement copy, risk flags, and redacted telemetry without inventing payment availability.",
      },
      {
        sequence: 3,
        label: "Capture payment UI proof",
        command: `MEALPILOT_URL=${base} npm run verify:visual`,
        proves: "The Payment Truth card is included in Launch Center screenshot evidence.",
      },
    ],
    assertions: [
      "Payment methods, COD support, discounts, and bill totals come only from Swiggy cart or booking responses.",
      "Food, Instamart, and Dineout payment paths keep separate confirmation copy and separate audit events.",
      "Dineout free bookings and paid bill-payment carts are not treated as the same action.",
      "Payment instrument details are never stored or logged by MealPilot.",
    ],
    externalGates: [
      "Swiggy staging credentials and seeded carts are required before live payment-method readback.",
      "Dineout bill-payment cart behavior requires Swiggy policy approval before production use.",
      "Payment support packet calibration must be approved against Swiggy report_error expectations.",
    ],
  };
}

export function reconcileSwiggyPaymentTruth(input: {
  config: ServerConfig;
  server: SwiggyServer | "combined";
  cartTotal: number;
  expectedDiscount: number;
  paymentPreference: "cod" | "online" | "free_booking" | "unknown";
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
}): SwiggyPaymentTruthReconciliation {
  const selectedLane = laneForServer(input.server, input.paymentPreference);
  const flags = riskFlags(input);
  const supportReview = input.cartTotal <= 0 || (input.server === "dineout" && input.paymentPreference !== "free_booking");

  return {
    generatedAt: new Date().toISOString(),
    requestId: `ptc_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      server: input.server,
      cartTotal: input.cartTotal,
      expectedDiscount: input.expectedDiscount,
      paymentPreference: input.paymentPreference,
      city: input.city,
    },
    selectedLaneId: selectedLane.id,
    settlementStatus: supportReview ? "support_review" : flags.length > 0 ? "needs_cart_readback" : "ready_for_confirmation",
    userFacingCopy: supportReview
      ? "I need fresh Swiggy status or support evidence before making any payment or booking claim."
      : "I can show this as a review step, but final payment or booking still needs fresh Swiggy readback and your confirmation.",
    riskFlags: flags,
    swiggyRoute: selectedLane,
    telemetry: [
      { field: "payment_server", value: input.server, redaction: "safe enum" },
      { field: "cart_total_bucket", value: input.cartTotal > 0 ? "positive" : "missing", redaction: "bucket only" },
      { field: "payment_preference", value: input.paymentPreference, redaction: "safe enum" },
      { field: "raw_payment_instrument_retained", value: "false", redaction: "hard-coded privacy invariant" },
      { field: "payment_truth_source", value: selectedLane.truthSource, redaction: "policy text only" },
    ],
    assertions: [
      "Reconciliation never stores raw payment instruments.",
      "Coupon, COD, and bill claims require fresh Swiggy readback.",
      "Commercial action remains locked behind explicit confirmation.",
    ],
  };
}
