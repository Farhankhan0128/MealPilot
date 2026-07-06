import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  OfferOpportunity,
  SwiggyOfferDecision,
  SwiggyOfferDrill,
  SwiggyOfferGuardrail,
  SwiggyOfferIntelligenceReport,
  SwiggyOfferLane,
  SwiggyOfferOpportunity,
  SwiggyOfferStatus,
} from "../../src/domain/types.js";
import { buildCartPreflightReport } from "./demoStudio.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/reference/food/fetch_food_coupons/",
  "https://mcp.swiggy.com/builders/docs/reference/food/apply_food_coupon/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/search_restaurants_dineout/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_restaurant_details/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/search_products/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_cart/",
];

function statusWeight(status: SwiggyOfferStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.48;
}

function laneReadyCount(lanes: SwiggyOfferLane[]) {
  return lanes.filter((lane) => lane.status === "ready").length;
}

function fromPreflightOffer(offer: OfferOpportunity): SwiggyOfferOpportunity {
  const isFood = offer.server === "food";
  const isDineout = offer.server === "dineout";
  return {
    id: `preflight_${offer.id}`,
    server: offer.server,
    label: offer.label,
    source: "cart_preflight",
    estimatedSavings: offer.estimatedSavings,
    applyMode: isFood ? "confirm_then_apply" : "surface_only",
    userCopy: isFood
      ? `Coupon ${offer.code} can be tested after the Food cart is refreshed.`
      : isDineout
        ? "Surface the restaurant deal before booking; do not imply a paid deal is reserved."
        : "Treat grocery savings as a value hint and re-read the Instamart cart before checkout.",
    proof: `${offer.status.replace("_", " ")} for ${offer.appliesTo}.`,
    status: offer.status === "available" ? "ready" : "watch",
    evidenceLinks: ["/api/sessions/:sessionId/preflight", "/api/swiggy-offer-intelligence"],
  };
}

export function buildSwiggyOfferIntelligence(options: {
  config: ServerConfig;
  plans: MealPlan[];
}): SwiggyOfferIntelligenceReport {
  const latestPlan = options.plans.at(-1);
  const preflightOffers = latestPlan ? buildCartPreflightReport(latestPlan).offers : [];

  const lanes: SwiggyOfferLane[] = [
    {
      id: "food_coupon_discovery",
      server: "food",
      label: "Food Coupon Discovery",
      officialTools: ["fetch_food_coupons", "get_food_cart"],
      route: "Refresh Food cart, fetch eligible coupons, rank by net payable and delivery constraints.",
      guardrail: "Never promise coupon savings until the refreshed cart proves eligibility.",
      status: "ready",
      evidenceLinks: [officialSources[2], "/api/sessions/:sessionId/preflight"],
    },
    {
      id: "food_coupon_application",
      server: "food",
      label: "Food Coupon Application",
      officialTools: ["apply_food_coupon", "get_food_cart"],
      route: "Apply coupon only after user accepts the discount and then re-read cart totals.",
      guardrail: "Coupon application is a cart mutation, not a commercial order; final ordering still needs separate confirmation.",
      status: "ready",
      evidenceLinks: [officialSources[3], "/api/mcp/commercial-action-guard"],
    },
    {
      id: "dineout_offer_discovery",
      server: "dineout",
      label: "Dineout Deal Discovery",
      officialTools: ["search_restaurants_dineout", "get_restaurant_details", "get_available_slots"],
      route: "Rank Dineout options by availability, deal visibility, cuisine fit, and travel context.",
      guardrail: "Only book free reservations; paid deals remain rejected and visible as an external product constraint.",
      status: "ready",
      evidenceLinks: [officialSources[4], officialSources[5], "/api/mcp/commercial-action-guard"],
    },
    {
      id: "instamart_value_substitution",
      server: "instamart",
      label: "Instamart Value Substitution",
      officialTools: ["your_go_to_items", "search_products", "get_cart", "update_cart"],
      route: "Compare go-to items, product variants, and cart bill breakdown before checkout.",
      guardrail: "Use product substitution and bill-breakdown savings, not undocumented coupon application.",
      status: "ready",
      evidenceLinks: [officialSources[6], officialSources[7], "/api/nutrition-budget-intelligence"],
    },
    {
      id: "combined_savings_guard",
      server: "combined",
      label: "Combined Savings Guard",
      officialTools: ["fetch_food_coupons", "search_restaurants_dineout", "search_products"],
      route: "Select whether Food coupon, Instamart substitution, or Dineout deal produces the best whole-day value.",
      guardrail: "Savings are recommendations only; every commercial action remains separately confirmed.",
      status: "ready",
      evidenceLinks: ["/api/swiggy-route-optimizer", "/api/production-launch-bundle"],
    },
    {
      id: "live_offer_calibration",
      server: "combined",
      label: "Live Offer Calibration",
      officialTools: ["fetch_food_coupons", "get_restaurant_details", "get_cart"],
      route: "Compare mock savings to live staging/production responses once Swiggy credentials are issued.",
      guardrail: "Do not submit live offer screenshots or claim live discount inventory before credentials exist.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/swiggy-load-lab"],
    },
  ];

  const fallbackOpportunities: SwiggyOfferOpportunity[] = [
    {
      id: "food_best_coupon_after_cart",
      server: "food",
      label: "Best Food coupon after cart refresh",
      source: "official_tool",
      estimatedSavings: 50,
      applyMode: "confirm_then_apply",
      userCopy: "I found a Food coupon candidate. I will refresh the cart, test eligibility, and ask before applying it.",
      proof: "Uses fetch_food_coupons before apply_food_coupon and does not place the order.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[3]],
    },
    {
      id: "dineout_deal_visibility",
      server: "dineout",
      label: "Dineout deal visibility",
      source: "official_tool",
      estimatedSavings: 100,
      applyMode: "surface_only",
      userCopy: "This restaurant advertises a visible Dineout deal; the reservation stays free and separately confirmed.",
      proof: "Dineout search/details surfaces deal context before get_available_slots and book_table.",
      status: "ready",
      evidenceLinks: [officialSources[4], officialSources[5]],
    },
    {
      id: "instamart_variant_swap",
      server: "instamart",
      label: "Instamart value variant swap",
      source: "derived_value",
      estimatedSavings: 75,
      applyMode: "surface_only",
      userCopy: "A lower-cost pack size can keep the grocery basket inside the weekly budget.",
      proof: "Uses search_products and get_cart bill breakdown; no undocumented coupon API is assumed.",
      status: "ready",
      evidenceLinks: [officialSources[6], officialSources[7]],
    },
  ];

  const opportunities = preflightOffers.length > 0 ? preflightOffers.map(fromPreflightOffer) : fallbackOpportunities;

  const guardrails: SwiggyOfferGuardrail[] = [
    {
      id: "refresh_before_coupon",
      label: "Refresh before coupon",
      policy: "Read the authoritative Food cart before fetching or applying coupons.",
      status: "ready",
      evidenceLinks: [officialSources[2], "/api/mcp/state-orchestrator"],
    },
    {
      id: "coupon_not_order",
      label: "Coupon is not order confirmation",
      policy: "Applying a Food coupon must never imply place_food_order has been confirmed.",
      status: "ready",
      evidenceLinks: [officialSources[3], "/api/mcp/commercial-action-guard"],
    },
    {
      id: "dineout_free_reservation",
      label: "Free Dineout reservation only",
      policy: "Book-table flows remain free reservations; paid deals are not accepted by the current Dineout booking contract.",
      status: "ready",
      evidenceLinks: ["/api/mcp/commercial-action-guard", officialSources[5]],
    },
    {
      id: "no_live_inventory_claim",
      label: "No live offer inventory claim",
      policy: "Mock and staging-ready savings are labelled estimates until Swiggy credentials return live offer inventory.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/credential-onboarding"],
    },
  ];

  const drills: SwiggyOfferDrill[] = [
    {
      id: "expired_food_coupon",
      label: "Expired Food coupon",
      trigger: "apply_food_coupon returns not applicable after the coupon was shown.",
      expectedDecision: "Re-read cart, remove the coupon candidate, show the next best option, and keep ordering locked.",
      status: "ready",
    },
    {
      id: "coupon_changes_cart_total",
      label: "Coupon changes cart total",
      trigger: "Food coupon changes taxes or item eligibility after application.",
      expectedDecision: "Show the refreshed total and ask again before place_food_order.",
      status: "ready",
    },
    {
      id: "dineout_deal_disappears",
      label: "Dineout deal disappears",
      trigger: "Restaurant details no longer include the deal shown in search results.",
      expectedDecision: "Surface the updated restaurant details and let the user pick another slot or restaurant.",
      status: "ready",
    },
    {
      id: "live_offer_drift",
      label: "Live offer drift",
      trigger: "Staging savings differ from mock savings by more than 20%.",
      expectedDecision: "Flag the delta for reviewer evidence and block marketing copy that promises exact savings.",
      status: "external_gate",
    },
  ];

  const externalGates = [
    "Live Food coupon inventory requires Swiggy credentials before exact savings can be claimed.",
    "Dineout deal availability must be re-read from restaurant details before any booking flow.",
    "Instamart savings remain product-variant and bill-breakdown estimates unless Swiggy publishes a coupon tool.",
  ];

  const readyScore =
    (laneReadyCount(lanes) / lanes.length) * 30 +
    (opportunities.reduce((sum, item) => sum + statusWeight(item.status), 0) / opportunities.length) * 25 +
    (guardrails.reduce((sum, item) => sum + statusWeight(item.status), 0) / guardrails.length) * 25 +
    (drills.reduce((sum, item) => sum + statusWeight(item.status), 0) / drills.length) * 20;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round(readyScore),
    mode: options.config.swiggyMode,
    officialSources,
    totals: {
      opportunities: opportunities.length,
      estimatedSavings: opportunities.reduce((sum, item) => sum + item.estimatedSavings, 0),
      readyLanes: laneReadyCount(lanes),
      guardedApplications: opportunities.filter((item) => item.applyMode !== "auto_blocked").length,
      officialCouponTools: 2,
      externalGates: externalGates.length,
    },
    lanes,
    opportunities,
    guardrails,
    drills,
    operatorActions: [
      {
        id: "record_live_coupon_delta",
        label: "Record live coupon delta",
        owner: "Operator",
        status: "external_gate",
        evidence: "Requires staging credentials and live Food coupon inventory.",
      },
      {
        id: "refresh_dineout_deal_copy",
        label: "Refresh Dineout deal copy",
        owner: "MealPilot",
        status: "ready",
        evidence: "Restaurant details are re-read before any booking confirmation.",
      },
      {
        id: "publish_offer_disclaimer",
        label: "Publish offer disclaimer",
        owner: "MealPilot",
        status: "ready",
        evidence: "Savings are estimates until official tool responses confirm eligibility.",
      },
    ],
    assertions: [
      "Food savings use fetch_food_coupons before apply_food_coupon and never skip the final order confirmation.",
      "Dineout deals are surfaced as discovery context; book_table remains a free reservation confirmation path.",
      "Instamart savings are derived from product variants and bill breakdowns, not undocumented coupon tools.",
      "Offer copy is blocked from exact live-savings claims until Swiggy credentials return live offer inventory.",
    ],
    externalGates,
  };
}

export function decideSwiggyOffer(input: {
  config: ServerConfig;
  server: "food" | "instamart" | "dineout" | "combined";
  offerType: "food_coupon" | "dineout_deal" | "instamart_value" | "combined_savings";
  cartFresh: boolean;
  paymentMode: "cod" | "online" | "free_booking" | "unknown";
  claimedSavings: number;
  userConfirmed: boolean;
}): SwiggyOfferDecision {
  const riskFlags: string[] = [];
  let selectedLaneId: string;
  let requiredTool: string;
  let decision: SwiggyOfferDecision["decision"];

  if (input.offerType === "food_coupon") {
    selectedLaneId = input.cartFresh ? "food_coupon_application" : "food_coupon_discovery";
    requiredTool = input.cartFresh ? "apply_food_coupon then get_food_cart" : "get_food_cart then fetch_food_coupons";
    if (!input.cartFresh) riskFlags.push("cart_requires_refresh_before_coupon");
    if (!input.userConfirmed) riskFlags.push("coupon_requires_user_confirmation");
    if (input.paymentMode === "online") riskFlags.push("online_payment_coupon_requires_live_payment_truth");
    decision = input.cartFresh && input.userConfirmed && input.paymentMode !== "online" ? "apply_after_confirmation" : "block";
  } else if (input.offerType === "dineout_deal") {
    selectedLaneId = "dineout_offer_discovery";
    requiredTool = "get_restaurant_details";
    decision = "surface_only";
    if (input.paymentMode !== "free_booking") riskFlags.push("paid_dineout_deal_not_book_table_path");
    if (!input.cartFresh) riskFlags.push("restaurant_details_require_refresh");
  } else if (input.offerType === "instamart_value") {
    selectedLaneId = "instamart_value_substitution";
    requiredTool = "search_products then get_cart";
    decision = "surface_only";
    if (!input.cartFresh) riskFlags.push("instamart_bill_requires_get_cart");
  } else {
    selectedLaneId = "combined_savings_guard";
    requiredTool = "refresh selected server cart or details";
    decision = input.userConfirmed && input.cartFresh ? "surface_only" : "block";
    if (!input.userConfirmed) riskFlags.push("combined_savings_requires_separate_confirmation");
    if (!input.cartFresh) riskFlags.push("combined_savings_requires_fresh_read");
  }

  if (input.claimedSavings > 0 && input.config.swiggyMode === "mock") {
    riskFlags.push("claimed_savings_are_mock_estimates");
  }

  return {
    generatedAt: new Date().toISOString(),
    requestId: `offer_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      server: input.server,
      offerType: input.offerType,
      cartFresh: input.cartFresh,
      paymentMode: input.paymentMode,
      claimedSavings: input.claimedSavings,
      userConfirmed: input.userConfirmed,
    },
    decision,
    selectedLaneId,
    requiredTool,
    userFacingCopy:
      decision === "apply_after_confirmation"
        ? "I can apply this Food coupon after your confirmation, then I will read the cart total back before any order."
        : decision === "surface_only"
          ? "I can show this saving as a planning hint, but it does not confirm a paid action or live discount."
          : "I need fresh Swiggy truth and explicit confirmation before using this offer.",
    riskFlags,
    telemetry: [
      { field: "offer_type", value: input.offerType, redaction: "safe enum" },
      { field: "offer_decision", value: decision, redaction: "safe enum" },
      { field: "claimed_savings_bucket", value: input.claimedSavings > 0 ? "positive" : "none", redaction: "bucket only" },
      { field: "raw_coupon_or_deal_payload_retained", value: "false", redaction: "hard-coded privacy invariant" },
      { field: "cart_mutation_executed", value: "false", redaction: "hard-coded safety invariant" },
    ],
    assertions: [
      "Offer decisions do not execute cart mutations.",
      "Food coupons require fresh cart truth before apply_food_coupon.",
      "Dineout deals are discovery context unless Swiggy proves a compatible free booking path.",
      "Instamart savings are value substitutions and cart-bill checks, not undocumented coupon application.",
    ],
  };
}
