import type { ServerConfig } from "../config.js";
import type {
  SwiggyQualityFeedbackAnalysis,
  SwiggyQualityLoopCenter,
  SwiggyQualityLoopGuardrail,
  SwiggyQualityLoopLane,
  SwiggyQualityLoopSample,
  SwiggyQualityLoopStatus,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-cart-state/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function statusWeight(status: SwiggyQualityLoopStatus) {
  if (status === "ready") return 1;
  if (status === "needs_consent") return 0.86;
  if (status === "support_gate") return 0.78;
  return 0.68;
}

function lane(input: SwiggyQualityLoopLane): SwiggyQualityLoopLane {
  return input;
}

function guardrail(input: SwiggyQualityLoopGuardrail): SwiggyQualityLoopGuardrail {
  return input;
}

function sample(input: SwiggyQualityLoopSample): SwiggyQualityLoopSample {
  return input;
}

function buildLanes(): SwiggyQualityLoopLane[] {
  return [
    lane({
      id: "food_taste_repeat_loop",
      label: "Food taste repeat loop",
      server: "food",
      status: "needs_consent",
      swiggyTools: ["get_food_orders", "get_food_order_details", "search_menu", "fetch_food_coupons", "report_error"],
      capturedSignals: ["taste", "delivery", "value", "support"],
      userQuestion: "Was this dish worth repeating, changing, or avoiding next time?",
      learningAction: "Store derived taste tags, spice notes, cuisine fit, and repeat/avoid preferences only with consent.",
      supportAction: "If rating is low or issue words appear, prepare report_error context with redacted order metadata.",
      nextOptimization: "Boost similar dishes, avoid poor-fit restaurants, and re-check coupons before a repeat order.",
      evidenceLinks: ["/api/household-preference-graph", "/api/swiggy-order-lifecycle", "/api/support/bridge"],
    }),
    lane({
      id: "instamart_freshness_loop",
      label: "Instamart freshness loop",
      server: "instamart",
      status: "needs_consent",
      swiggyTools: ["get_instamart_order_history", "get_instamart_order_details", "your_go_to_items", "search_products", "report_error"],
      capturedSignals: ["freshness", "value", "support"],
      userQuestion: "Were the groceries fresh, useful, and worth making a go-to item?",
      learningAction: "Convert only consented feedback into pantry cadence, freshness preference, and variant quality tags.",
      supportAction: "For damaged, stale, missing, or wrong items, prepare support-safe report_error context.",
      nextOptimization: "Prefer better variants, adjust quantity cadence, and rescue pantry gaps before the next plan.",
      evidenceLinks: ["/api/swiggy-live-signal-calibration", "/api/swiggy-cart-mutation-workbench", "/api/audit-ledger"],
    }),
    lane({
      id: "dineout_experience_loop",
      label: "Dineout experience loop",
      server: "dineout",
      status: "needs_consent",
      swiggyTools: ["get_booking_status", "search_restaurants_dineout", "get_restaurant_details", "get_available_slots", "report_error"],
      capturedSignals: ["booking", "taste", "value", "support"],
      userQuestion: "Should MealPilot remember this venue for future date nights, groups, or work meals?",
      learningAction: "Store derived venue fit, area preference, cuisine fit, and occasion tags only with consent.",
      supportAction: "If booking or table experience failed, use get_booking_status before preparing report_error.",
      nextOptimization: "Promote trusted venues by occasion and fall back to Food delivery when slots or ratings drift.",
      evidenceLinks: ["/api/swiggy-dineout-precision-center", "/api/premium-concierge-itinerary", "/api/guest-collaboration-calendar"],
    }),
    lane({
      id: "combined_household_learning_loop",
      label: "Combined household learning loop",
      server: "combined",
      status: "ready",
      swiggyTools: ["get_food_orders", "get_instamart_order_history", "get_booking_status", "search_menu", "search_products"],
      capturedSignals: ["taste", "delivery", "freshness", "booking", "value"],
      userQuestion: "Which path worked best for the household: order, cook, reserve, or mix?",
      learningAction: "Convert cross-server feedback into consented household route weights and recovery playbooks.",
      supportAction: "Separate Swiggy support context by server and never merge raw identifiers across lanes.",
      nextOptimization: "Choose lower-friction routes next time using freshness, ETA, venue trust, budget, and preference fit.",
      evidenceLinks: ["/api/luxury-experience-workspace", "/api/swiggy-route-optimizer", "/api/data-governance-center"],
    }),
  ];
}

function buildGuardrails(): SwiggyQualityLoopGuardrail[] {
  return [
    guardrail({
      id: "consent_before_learning",
      label: "Consent before learning",
      status: "ready",
      policy: "Ratings can be used for active-session recovery immediately, but durable preference learning requires user consent.",
      evidenceLinks: ["/api/profile", "/api/household-preference-graph"],
    }),
    guardrail({
      id: "no_raw_payload_storage",
      label: "No raw Swiggy payload storage",
      status: "ready",
      policy: "MealPilot stores derived tags and redacted support references, not full order, booking, address, payment, or catalogue payloads.",
      evidenceLinks: ["/api/data-governance-center", "/api/audit-ledger"],
    }),
    guardrail({
      id: "support_context_redaction",
      label: "Support context redaction",
      status: "ready",
      policy: "Low-rating support packets include server, tool, status class, time range, and issue category, not full user messages or raw ids.",
      evidenceLinks: ["/api/support/bridge", "/api/swiggy-cancellation-care-center"],
    }),
    guardrail({
      id: "separate_server_truth",
      label: "Separate server truth",
      status: "ready",
      policy: "Food, Instamart, and Dineout feedback never rewrites another server's state; combined learning stores route weights only.",
      evidenceLinks: ["/api/mcp/state-orchestrator", "/api/swiggy-route-optimizer"],
    }),
    guardrail({
      id: "swiggy_support_gate",
      label: "Swiggy support gate",
      status: "support_gate",
      policy: "Live user-reported issues use the official report_error flow only after staging credentials and Swiggy support expectations are verified.",
      evidenceLinks: ["/api/swiggy-staging-credential-drill", "/api/support/bridge"],
    }),
    guardrail({
      id: "live_history_gate",
      label: "Live history gate",
      status: "staging_gate",
      policy: "Real order, grocery, and booking history calibration requires seeded Swiggy accounts, redacted transcripts, and 48-hour green soak.",
      evidenceLinks: ["/api/swiggy-live-signal-calibration", "/api/staging-certification-matrix"],
    }),
  ];
}

function buildSamples(): SwiggyQualityLoopSample[] {
  return [
    sample({
      id: "repeat_paneer_tikka",
      server: "food",
      rating: 5,
      comment: "Loved the paneer tikka, repeat this restaurant for dinner.",
      selectedLane: "food_taste_repeat_loop",
      status: "needs_consent",
    }),
    sample({
      id: "stale_curd",
      server: "instamart",
      rating: 2,
      comment: "Curd was close to expiry and not fresh.",
      selectedLane: "instamart_freshness_loop",
      status: "support_gate",
    }),
    sample({
      id: "great_date_table",
      server: "dineout",
      rating: 5,
      comment: "Great table for date night, save this venue.",
      selectedLane: "dineout_experience_loop",
      status: "needs_consent",
    }),
    sample({
      id: "combined_evening_worked",
      server: "combined",
      rating: 4,
      comment: "Ordering dinner and restocking breakfast together worked well.",
      selectedLane: "combined_household_learning_loop",
      status: "ready",
    }),
  ];
}

function scoreCenter(lanes: SwiggyQualityLoopLane[], guardrails: SwiggyQualityLoopGuardrail[]) {
  const statuses = [...lanes.map((item) => item.status), ...guardrails.map((item) => item.status)];
  return Math.round((statuses.reduce((sum, status) => sum + statusWeight(status), 0) / statuses.length) * 100);
}

function laneForServer(server: SwiggyServer | "combined") {
  const lanes = buildLanes();
  if (server === "food") return lanes.find((item) => item.id === "food_taste_repeat_loop") ?? lanes[0];
  if (server === "instamart") return lanes.find((item) => item.id === "instamart_freshness_loop") ?? lanes[1];
  if (server === "dineout") return lanes.find((item) => item.id === "dineout_experience_loop") ?? lanes[2];
  return lanes.find((item) => item.id === "combined_household_learning_loop") ?? lanes[3];
}

function learningTags(comment: string, rating: number) {
  const source = comment.toLowerCase();
  const tags = [
    source.includes("repeat") || rating >= 5 ? "repeat_candidate" : "",
    source.includes("fresh") ? "freshness_signal" : "",
    source.includes("spice") || source.includes("tikka") ? "taste_signal" : "",
    source.includes("late") || source.includes("delivery") ? "delivery_signal" : "",
    source.includes("table") || source.includes("venue") ? "venue_signal" : "",
    rating <= 2 ? "support_review" : "",
  ].filter(Boolean);
  return tags.length > 0 ? tags : rating >= 4 ? ["positive_fit"] : ["needs_review"];
}

export function buildSwiggyQualityLoopCenter(config: ServerConfig): SwiggyQualityLoopCenter {
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
      readyLanes: lanes.filter((item) => item.status === "ready" || item.status === "needs_consent").length,
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
        label: "Inspect quality loops",
        command: `curl -s ${base}/api/swiggy-quality-loop-center`,
        proves: "Food, Instamart, Dineout, and combined post-experience learning loops are reviewable.",
      },
      {
        sequence: 2,
        label: "Analyze feedback",
        command:
          `curl -s -X POST ${base}/api/swiggy-quality-loop-center/feedback -H 'Content-Type: application/json' ` +
          `-d '{"server":"food","rating":5,"comment":"Loved the paneer tikka, repeat this restaurant","city":"Bengaluru","consentToLearn":true}'`,
        proves: "MealPilot converts feedback into consented learning tags, support decisions, and next-route optimization.",
      },
      {
        sequence: 3,
        label: "Capture quality UI proof",
        command: `MEALPILOT_URL=${base} npm run verify:visual`,
        proves: "The Quality Loop card is included in screenshot evidence across the Launch Center.",
      },
    ],
    assertions: [
      "Quality learning is consented and derived; raw Swiggy payloads are not persisted.",
      "Low ratings create support-ready context but do not invent cancellation or refund tools.",
      "Food, Instamart, and Dineout feedback stay server-scoped while combined learning stores route weights.",
      "Future recommendations improve through preference tags, not hidden commercial actions.",
    ],
    externalGates: [
      "Swiggy staging credentials and seeded history are required before live order, grocery, or booking history readback.",
      "Support packet calibration must be approved against Swiggy report_error expectations.",
      "Production learning from Swiggy-originated data requires data-governance approval and DSR routing confirmation.",
    ],
  };
}

export function analyzeSwiggyQualityFeedback(input: {
  config: ServerConfig;
  server: SwiggyServer | "combined";
  rating: number;
  comment: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  consentToLearn: boolean;
}): SwiggyQualityFeedbackAnalysis {
  const selectedLane = laneForServer(input.server);
  const sentiment = input.rating >= 4 ? "delighted" : input.rating >= 3 ? "mixed" : "issue";
  const tags = input.consentToLearn ? learningTags(input.comment, input.rating) : [];
  const supportPacketNeeded = input.rating <= 2 || /stale|wrong|missing|late|bad|refund|support/i.test(input.comment);

  return {
    generatedAt: new Date().toISOString(),
    requestId: `qlc_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      server: input.server,
      rating: input.rating,
      comment: input.comment,
      city: input.city,
      consentToLearn: input.consentToLearn,
    },
    sentiment,
    selectedLaneId: selectedLane.id,
    learningTags: tags,
    nextMealPilotAction: supportPacketNeeded
      ? "Prepare a redacted support packet and avoid using this signal for durable learning until the user confirms."
      : input.consentToLearn
        ? "Update derived preference weights and use them in the next MealPilot recommendation."
        : "Use the feedback for this active session only and ask for consent before durable learning.",
    supportPacketNeeded,
    swiggyRoute: selectedLane,
    telemetry: [
      { field: "quality_server", value: input.server, redaction: "safe enum" },
      { field: "rating_bucket", value: input.rating >= 4 ? "positive" : input.rating >= 3 ? "neutral" : "issue", redaction: "bucket only" },
      { field: "consent_to_learn", value: String(input.consentToLearn), redaction: "boolean" },
      { field: "raw_payload_retained", value: "false", redaction: "hard-coded privacy invariant" },
    ],
    assertions: [
      "Feedback analysis does not retain raw Swiggy payloads.",
      "Durable learning tags are empty unless consentToLearn is true.",
      "Support packet decisions are separate from preference learning.",
    ],
  };
}
