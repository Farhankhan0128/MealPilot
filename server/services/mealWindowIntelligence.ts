import type { ServerConfig } from "../config.js";
import type {
  SwiggyMealWindow,
  SwiggyMealWindowCenter,
  SwiggyMealWindowForecast,
  SwiggyMealWindowGuardrail,
  SwiggyMealWindowLane,
  SwiggyMealWindowSample,
  SwiggyMealWindowStatus,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/reference/food/search_restaurants/",
  "https://mcp.swiggy.com/builders/docs/reference/food/search_menu/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/search_products/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_available_slots/",
  "https://mcp.swiggy.com/builders/docs/reference/food/track_food_order/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/track_order/",
];

function statusWeight(status: SwiggyMealWindowStatus) {
  if (status === "ready") return 1;
  if (status === "confirmation_gate") return 0.88;
  if (status === "watch") return 0.78;
  return 0.68;
}

function lane(input: SwiggyMealWindowLane): SwiggyMealWindowLane {
  return input;
}

function guardrail(input: SwiggyMealWindowGuardrail): SwiggyMealWindowGuardrail {
  return input;
}

function sample(input: SwiggyMealWindowSample): SwiggyMealWindowSample {
  return input;
}

function buildLanes(): SwiggyMealWindowLane[] {
  return [
    lane({
      id: "weekday_lunch_eta_guard",
      label: "Weekday lunch ETA guard",
      window: "lunch",
      server: "food",
      status: "confirmation_gate",
      swiggyTools: ["get_addresses", "search_restaurants", "search_menu", "get_food_cart", "track_food_order"],
      timingSignals: ["restaurant_eta", "menu_availability", "tracking_cadence"],
      userPromise: "Choose a lunch route that can still arrive inside the user's meal break.",
      optimizationRule: "Prefer restaurants and menu items only after fresh search and cart reads prove ETA and availability.",
      confirmationBoundary: "Future lunch delivery is a reminder; place_food_order needs same-turn cart readback and explicit confirmation.",
      evidenceLinks: ["/api/swiggy-discovery-freshness", "/api/swiggy-payment-truth-center", "/api/swiggy-order-lifecycle"],
    }),
    lane({
      id: "dinner_pantry_vs_delivery",
      label: "Dinner pantry vs delivery",
      window: "dinner",
      server: "combined",
      status: "ready",
      swiggyTools: ["search_menu", "search_products", "your_go_to_items", "get_food_cart", "get_cart"],
      timingSignals: ["restaurant_eta", "product_availability", "menu_availability"],
      userPromise: "Decide whether ordering or cooking gives the household a better dinner path tonight.",
      optimizationRule: "Compare Food ETA with Instamart availability and pantry staples before preparing separate carts.",
      confirmationBoundary: "Food and Instamart remain separate confirmations with fresh cart and bill readbacks.",
      evidenceLinks: ["/api/nutrition-budget-intelligence", "/api/swiggy-ritual-autopilot-center", "/api/swiggy-route-optimizer"],
    }),
    lane({
      id: "dineout_slot_window",
      label: "Dineout slot window",
      window: "weekend",
      server: "dineout",
      status: "confirmation_gate",
      swiggyTools: ["get_saved_locations", "search_restaurants_dineout", "get_restaurant_details", "get_available_slots", "book_table"],
      timingSignals: ["dineout_slots", "reminder_time"],
      userPromise: "Pick the right reservation window before a table disappears.",
      optimizationRule: "Refresh Dineout slots for the same location, guest count, restaurant, and date before booking.",
      confirmationBoundary: "book_table is free-slot only and must preserve fresh slot, party size, itemId, and time readback.",
      evidenceLinks: ["/api/swiggy-dineout-precision-center", "/api/guest-collaboration-calendar", "/api/premium-concierge-itinerary"],
    }),
    lane({
      id: "post_confirmation_tracking_window",
      label: "Post-confirmation tracking window",
      window: "late_night",
      server: "combined",
      status: "ready",
      swiggyTools: ["track_food_order", "track_order", "get_booking_status", "report_error"],
      timingSignals: ["tracking_cadence"],
      userPromise: "Refresh status at a humane cadence and avoid blind retries when a meal is delayed.",
      optimizationRule: "Track Food and Instamart no faster than the configured cadence, and use booking status before Dineout recovery.",
      confirmationBoundary: "Delay or failure decisions prepare support context; they do not retry paid actions blindly.",
      evidenceLinks: ["/api/swiggy-order-lifecycle", "/api/support/bridge", "/api/slo-incident-command"],
    }),
    lane({
      id: "weekend_combined_window",
      label: "Weekend combined window",
      window: "weekend",
      server: "combined",
      status: "watch",
      swiggyTools: ["search_restaurants", "search_products", "search_restaurants_dineout", "get_available_slots", "get_food_cart", "get_cart"],
      timingSignals: ["restaurant_eta", "product_availability", "dineout_slots", "reminder_time"],
      userPromise: "Show order, cook, and reserve paths as timing-aware choices for a premium weekend plan.",
      optimizationRule: "Run discovery in safe parallel batches, then split into separate cart, checkout, and booking confirmations.",
      confirmationBoundary: "Combined planning cannot collapse Food, Instamart, and Dineout into one commercial action.",
      evidenceLinks: ["/api/luxury-experience-workspace", "/api/mcp/state-orchestrator", "/api/mcp/backpressure-governor"],
    }),
  ];
}

function buildGuardrails(): SwiggyMealWindowGuardrail[] {
  return [
    guardrail({
      id: "no_scheduled_food_order",
      label: "No scheduled Food order",
      status: "ready",
      policy: "Food v1 has no scheduled-delivery tool in MealPilot; future meal windows become reminders and same-turn confirmations only.",
      evidenceLinks: ["/api/schedule", "/api/swiggy-confirmation-command-center"],
    }),
    guardrail({
      id: "fresh_availability_before_window",
      label: "Fresh availability before window",
      status: "ready",
      policy: "Restaurant, menu, product, cart, and slot evidence expires when address, query, date, party size, or route changes.",
      evidenceLinks: ["/api/swiggy-discovery-freshness", "/api/mcp/state-orchestrator"],
    }),
    guardrail({
      id: "tracking_cadence_cap",
      label: "Tracking cadence cap",
      status: "ready",
      policy: "Tracking refreshes stay at 10 seconds or slower and are not used to spam Swiggy status tools.",
      evidenceLinks: ["/api/swiggy-order-lifecycle", "/api/mcp/backpressure-governor"],
    }),
    guardrail({
      id: "meal_window_is_advice",
      label: "Meal window is advice",
      status: "ready",
      policy: "Timing forecasts are advisory local planning signals, not guaranteed ETA, stock, slot, or delivery promises.",
      evidenceLinks: ["/api/data-governance-center", "/api/swiggy-payment-truth-center"],
    }),
    guardrail({
      id: "live_eta_staging_gate",
      label: "Live ETA staging gate",
      status: "staging_gate",
      policy: "Live ETA, stock, and slot calibration requires seeded Swiggy staging accounts and redacted transcripts.",
      evidenceLinks: ["/api/swiggy-live-signal-calibration", "/api/staging-certification-matrix"],
    }),
  ];
}

function buildSamples(): SwiggyMealWindowSample[] {
  return [
    sample({
      id: "lunch_break_now",
      prompt: "I have 35 minutes for lunch, what should I do now?",
      selectedLane: "weekday_lunch_eta_guard",
      window: "lunch",
      status: "confirmation_gate",
    }),
    sample({
      id: "dinner_cook_or_order",
      prompt: "Should we cook with Instamart groceries or order dinner tonight?",
      selectedLane: "dinner_pantry_vs_delivery",
      window: "dinner",
      status: "ready",
    }),
    sample({
      id: "saturday_table_slot",
      prompt: "Find a Saturday dinner table before the good slots disappear.",
      selectedLane: "dineout_slot_window",
      window: "weekend",
      status: "confirmation_gate",
    }),
    sample({
      id: "late_order_delay",
      prompt: "My order is delayed, when should we check or escalate?",
      selectedLane: "post_confirmation_tracking_window",
      window: "late_night",
      status: "ready",
    }),
  ];
}

function laneForWindow(window: SwiggyMealWindow, includeDineout: boolean) {
  const lanes = buildLanes();
  if (includeDineout && (window === "weekend" || window === "dinner")) {
    return lanes.find((item) => item.id === "dineout_slot_window") ?? lanes[2];
  }
  if (window === "lunch") return lanes.find((item) => item.id === "weekday_lunch_eta_guard") ?? lanes[0];
  if (window === "dinner") return lanes.find((item) => item.id === "dinner_pantry_vs_delivery") ?? lanes[1];
  if (window === "late_night") return lanes.find((item) => item.id === "post_confirmation_tracking_window") ?? lanes[3];
  return lanes.find((item) => item.id === "weekend_combined_window") ?? lanes[4];
}

function timingPlan(route: SwiggyMealWindowLane): SwiggyMealWindowForecast["timingPlan"] {
  if (route.id === "weekday_lunch_eta_guard") {
    return [
      { sequence: 1, label: "Resolve address and open restaurants", server: "food", tool: "search_restaurants", guardrail: "Use fresh ETA and open-state evidence." },
      { sequence: 2, label: "Find orderable menu item", server: "food", tool: "search_menu", guardrail: "Use menu search for cart-ready item details." },
      { sequence: 3, label: "Read cart before confirmation", server: "food", tool: "get_food_cart", guardrail: "Do not promise delivery or payment truth from memory." },
    ];
  }
  if (route.id === "dineout_slot_window") {
    return [
      { sequence: 1, label: "Search venues near saved location", server: "dineout", tool: "search_restaurants_dineout", guardrail: "Keep location context consistent." },
      { sequence: 2, label: "Refresh available slots", server: "dineout", tool: "get_available_slots", guardrail: "Preserve party size, itemId, slotId, and free-booking truth." },
      { sequence: 3, label: "Confirm before booking", server: "dineout", tool: "book_table", guardrail: "Free slot only; no blind booking retry." },
    ];
  }
  return [
    { sequence: 1, label: "Compare Food and Instamart availability", server: "combined", tool: "search_menu", guardrail: "Discovery reads can run before cart writes." },
    { sequence: 2, label: "Review grocery backup", server: "instamart", tool: "search_products", guardrail: "Stock is address-scoped and variant-specific." },
    { sequence: 3, label: "Split confirmations", server: "combined", tool: "get_food_cart", guardrail: "Final Food, Instamart, and Dineout actions stay separate." },
  ];
}

function etaRisk(input: { window: SwiggyMealWindow; urgency: "now" | "today" | "this_week"; partySize: number }) {
  if (input.urgency === "now" && (input.window === "lunch" || input.window === "late_night")) return "high";
  if (input.partySize >= 6 || input.window === "weekend") return "medium";
  return "low";
}

function scoreCenter(lanes: SwiggyMealWindowLane[], guardrails: SwiggyMealWindowGuardrail[]) {
  const statuses = [...lanes.map((item) => item.status), ...guardrails.map((item) => item.status)];
  return Math.round((statuses.reduce((sum, status) => sum + statusWeight(status), 0) / statuses.length) * 100);
}

export function buildSwiggyMealWindowCenter(config: ServerConfig): SwiggyMealWindowCenter {
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
        label: "Inspect meal windows",
        command: `curl -s ${base}/api/swiggy-meal-window-intelligence`,
        proves: "Food, Instamart, Dineout, tracking, and combined timing lanes are visible with freshness gates.",
      },
      {
        sequence: 2,
        label: "Forecast a lunch window",
        command:
          `curl -s -X POST ${base}/api/swiggy-meal-window-intelligence/forecast -H 'Content-Type: application/json' ` +
          `-d '{"city":"Bengaluru","window":"lunch","partySize":2,"urgency":"now","includeDineout":false}'`,
        proves: "MealPilot returns ETA risk, timing plan, and no-scheduled-order assertions.",
      },
      {
        sequence: 3,
        label: "Capture meal window UI proof",
        command: `MEALPILOT_URL=${base} npm run verify:visual`,
        proves: "The Meal Window card is included in Launch Center screenshot evidence.",
      },
    ],
    assertions: [
      "Future Food delivery is reminder-only; ordering still needs same-turn cart readback and explicit confirmation.",
      "Timing forecasts are advisory and never replace Swiggy restaurant, menu, product, cart, slot, or tracking truth.",
      "Tracking cadence is capped and does not spam Swiggy order status tools.",
      "Combined meal windows split Food, Instamart, and Dineout into separate confirmation paths.",
    ],
    externalGates: [
      "Live ETA and stock calibration requires Swiggy staging credentials and seeded accounts.",
      "Dineout slot-window behavior must be replayed with live saved-location fixtures before production.",
      "Major-event or high-traffic meal windows require traffic readiness and capacity review.",
    ],
  };
}

export function forecastSwiggyMealWindow(input: {
  config: ServerConfig;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  window: SwiggyMealWindow;
  partySize: number;
  urgency: "now" | "today" | "this_week";
  includeDineout: boolean;
}): SwiggyMealWindowForecast {
  const selectedLane = laneForWindow(input.window, input.includeDineout);
  const risk = etaRisk(input);

  return {
    generatedAt: new Date().toISOString(),
    requestId: `mwi_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      city: input.city,
      window: input.window,
      partySize: input.partySize,
      urgency: input.urgency,
      includeDineout: input.includeDineout,
    },
    selectedLaneId: selectedLane.id,
    etaRisk: risk,
    recommendedRoute: selectedLane.server,
    recommendedAction:
      risk === "high"
        ? "Use the fastest fresh-read path now and keep fallback groceries or support tracking visible."
        : input.urgency === "this_week"
          ? "Create a reminder and refresh Swiggy availability in the meal window before any commercial action."
          : "Prepare options now, then ask for confirmation after fresh cart or slot readback.",
    timingPlan: timingPlan(selectedLane),
    swiggyRoute: selectedLane,
    telemetry: [
      { field: "meal_window", value: input.window, redaction: "safe enum" },
      { field: "urgency", value: input.urgency, redaction: "safe enum" },
      { field: "eta_risk", value: risk, redaction: "derived bucket only" },
      { field: "scheduled_food_order", value: "false", redaction: "hard-coded safety invariant" },
      { field: "raw_eta_or_slot_payload_retained", value: "false", redaction: "hard-coded privacy invariant" },
    ],
    assertions: [
      "Forecasts do not schedule Food orders.",
      "Fresh Swiggy reads are required before order, checkout, or booking confirmation.",
      "Timing telemetry stores buckets and route ids, not raw ETA, slot, cart, or tracking payloads.",
    ],
  };
}
