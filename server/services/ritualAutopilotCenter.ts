import type { ServerConfig } from "../config.js";
import type {
  SwiggyRitualAutopilotCadence,
  SwiggyRitualAutopilotCenter,
  SwiggyRitualAutopilotGuardrail,
  SwiggyRitualAutopilotLane,
  SwiggyRitualAutopilotPlan,
  SwiggyRitualAutopilotSample,
  SwiggyRitualAutopilotStatus,
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

function statusWeight(status: SwiggyRitualAutopilotStatus) {
  if (status === "ready") return 1;
  if (status === "needs_consent") return 0.9;
  if (status === "confirmation_gate") return 0.84;
  return 0.7;
}

function lane(input: SwiggyRitualAutopilotLane): SwiggyRitualAutopilotLane {
  return input;
}

function guardrail(input: SwiggyRitualAutopilotGuardrail): SwiggyRitualAutopilotGuardrail {
  return input;
}

function sample(input: SwiggyRitualAutopilotSample): SwiggyRitualAutopilotSample {
  return input;
}

function buildLanes(): SwiggyRitualAutopilotLane[] {
  return [
    lane({
      id: "weekday_lunch_repeat",
      label: "Weekday lunch repeat",
      cadence: "weekday",
      server: "food",
      status: "needs_consent",
      swiggyTools: ["get_food_orders", "get_food_order_details", "search_restaurants", "search_menu", "fetch_food_coupons"],
      consentedSignals: ["food_history", "quality_feedback", "calendar"],
      userPromise: "Make reliable workday lunches feel one tap away without repeating bad restaurants.",
      planningAction: "Derive cuisine, spice, ETA, coupon, and repeat/avoid tags from consented Food history.",
      confirmationBoundary: "Each lunch can be prepared as a draft cart, but place_food_order needs a fresh cart read and explicit confirmation.",
      evidenceLinks: ["/api/swiggy-quality-loop-center", "/api/swiggy-order-lifecycle", "/api/mcp/commercial-action-guard"],
    }),
    lane({
      id: "pantry_reset",
      label: "Pantry reset",
      cadence: "weekly",
      server: "instamart",
      status: "needs_consent",
      swiggyTools: ["get_instamart_order_history", "your_go_to_items", "search_products", "get_product_variants", "update_cart"],
      consentedSignals: ["go_to_items", "quality_feedback", "calendar"],
      userPromise: "Turn weekly staples into a reviewed restock ritual, not a surprise checkout.",
      planningAction: "Blend go-to items, freshness feedback, budget caps, and pantry gaps into a reviewed Instamart basket.",
      confirmationBoundary: "Instamart checkout stays locked until availability, variants, bill, address, and delivery promise are read back.",
      evidenceLinks: ["/api/pantry", "/api/swiggy-cart-mutation-workbench", "/api/nutrition-budget-intelligence"],
    }),
    lane({
      id: "date_night_slotwatch",
      label: "Date night slotwatch",
      cadence: "occasion",
      server: "dineout",
      status: "confirmation_gate",
      swiggyTools: ["get_saved_locations", "search_restaurants_dineout", "get_restaurant_details", "get_available_slots", "book_table"],
      consentedSignals: ["booking_slots", "quality_feedback", "calendar"],
      userPromise: "Hold a short list of trusted venues and slots for a special evening.",
      planningAction: "Rank venues by area, occasion, free booking proof, slot freshness, and prior experience fit.",
      confirmationBoundary: "book_table remains separate, free-only, and requires fresh slot evidence plus party-size confirmation.",
      evidenceLinks: ["/api/swiggy-dineout-precision-center", "/api/premium-concierge-itinerary", "/api/guest-collaboration-calendar"],
    }),
    lane({
      id: "family_weekend_route",
      label: "Family weekend route",
      cadence: "weekend",
      server: "combined",
      status: "ready",
      swiggyTools: ["search_menu", "search_products", "search_restaurants_dineout", "get_available_slots", "get_food_cart", "get_cart"],
      consentedSignals: ["food_history", "go_to_items", "booking_slots", "quality_feedback", "voice_or_visual"],
      userPromise: "Choose the best weekend path across order, cook, reserve, or a careful mix.",
      planningAction: "Compare Food, Instamart, and Dineout with budget, household size, quality memory, and freshness gates.",
      confirmationBoundary: "Combined rituals split into separate Food order, Instamart checkout, and Dineout booking confirmations.",
      evidenceLinks: ["/api/luxury-experience-workspace", "/api/swiggy-route-optimizer", "/api/channel-multimodal-studio"],
    }),
  ];
}

function buildGuardrails(): SwiggyRitualAutopilotGuardrail[] {
  return [
    guardrail({
      id: "no_auto_commercial_action",
      label: "No auto commercial action",
      status: "ready",
      policy: "Ritual Autopilot can draft plans, reminders, carts, and shortlists, but never places Food orders, checks out Instamart, or books Dineout tables automatically.",
      evidenceLinks: ["/api/mcp/commercial-action-guard", "/api/swiggy-confirmation-command-center"],
    }),
    guardrail({
      id: "consent_to_history",
      label: "Consent to history",
      status: "needs_consent",
      policy: "Food history, Instamart go-to items, booking status, and quality memory are used only when the user explicitly consents for the active ritual.",
      evidenceLinks: ["/api/profile", "/api/data-governance-center", "/api/household-preference-graph"],
    }),
    guardrail({
      id: "fresh_read_before_draft",
      label: "Fresh read before draft",
      status: "ready",
      policy: "Draft carts and slot shortlists require fresh availability, price, coupon, address, and slot reads before user confirmation.",
      evidenceLinks: ["/api/mcp/state-orchestrator", "/api/swiggy-live-signal-calibration"],
    }),
    guardrail({
      id: "calendar_is_reminder_only",
      label: "Calendar is reminder only",
      status: "ready",
      policy: "Calendar and reminder signals can schedule prompts, but they cannot trigger paid or reserved Swiggy actions by themselves.",
      evidenceLinks: ["/api/schedule", "/api/audit-ledger"],
    }),
    guardrail({
      id: "server_boundary_preserved",
      label: "Server boundary preserved",
      status: "ready",
      policy: "Food, Instamart, and Dineout state remains server-scoped; combined rituals carry route weights and never merge raw identifiers.",
      evidenceLinks: ["/api/mcp/state-orchestrator", "/api/data-governance-center"],
    }),
    guardrail({
      id: "live_ritual_soak",
      label: "Live ritual soak",
      status: "staging_gate",
      policy: "Production ritual activation needs seeded Swiggy accounts, redacted history transcripts, and 48-hour green staging soak.",
      evidenceLinks: ["/api/swiggy-staging-credential-drill", "/api/staging-certification-matrix"],
    }),
  ];
}

function buildSamples(): SwiggyRitualAutopilotSample[] {
  return [
    sample({
      id: "office_lunch_repeat",
      request: "Plan my weekday office lunches from restaurants I liked, under 450 rupees each.",
      selectedLane: "weekday_lunch_repeat",
      cadence: "weekday",
      status: "needs_consent",
    }),
    sample({
      id: "sunday_pantry_reset",
      request: "Every Sunday, remind me to restock breakfast staples and high-protein snacks.",
      selectedLane: "pantry_reset",
      cadence: "weekly",
      status: "needs_consent",
    }),
    sample({
      id: "monthly_date_night",
      request: "Hold a Dineout shortlist for date night around Indiranagar this Friday.",
      selectedLane: "date_night_slotwatch",
      cadence: "occasion",
      status: "confirmation_gate",
    }),
    sample({
      id: "family_weekend",
      request: "Plan Saturday dinner for family with a delivery, grocery, and table option.",
      selectedLane: "family_weekend_route",
      cadence: "weekend",
      status: "ready",
    }),
  ];
}

function scoreCenter(lanes: SwiggyRitualAutopilotLane[], guardrails: SwiggyRitualAutopilotGuardrail[]) {
  const statuses = [...lanes.map((item) => item.status), ...guardrails.map((item) => item.status)];
  return Math.round((statuses.reduce((sum, status) => sum + statusWeight(status), 0) / statuses.length) * 100);
}

function laneForCadence(cadence: SwiggyRitualAutopilotCadence, householdMode: "solo" | "couple" | "family" | "team") {
  const lanes = buildLanes();
  if (cadence === "weekday") return lanes.find((item) => item.id === "weekday_lunch_repeat") ?? lanes[0];
  if (cadence === "weekly") return lanes.find((item) => item.id === "pantry_reset") ?? lanes[1];
  if (cadence === "occasion" || householdMode === "couple") {
    return lanes.find((item) => item.id === "date_night_slotwatch") ?? lanes[2];
  }
  return lanes.find((item) => item.id === "family_weekend_route") ?? lanes[3];
}

function buildSlots(
  laneItem: SwiggyRitualAutopilotLane,
  householdMode: "solo" | "couple" | "family" | "team",
): SwiggyRitualAutopilotPlan["routineSlots"] {
  if (laneItem.id === "weekday_lunch_repeat") {
    return ["Monday", "Wednesday", "Friday"].map((day) => ({
      day,
      action: householdMode === "team" ? "Prepare shared lunch shortlist near office" : "Prepare repeat-safe Food lunch draft",
      swiggyPath: "food" as const,
      requiresConfirmation: true,
    }));
  }
  if (laneItem.id === "pantry_reset") {
    return [
      { day: "Sunday", action: "Review Instamart staples, freshness notes, and variants", swiggyPath: "instamart" as const, requiresConfirmation: true },
      { day: "Monday", action: "Remind household before breakfast gaps hit", swiggyPath: "instamart" as const, requiresConfirmation: false },
    ];
  }
  if (laneItem.id === "date_night_slotwatch") {
    return [
      { day: "Friday", action: "Refresh Dineout venue details and free slots", swiggyPath: "dineout" as const, requiresConfirmation: false },
      { day: "Friday", action: "Ask before booking a table with party size and slot readback", swiggyPath: "dineout" as const, requiresConfirmation: true },
    ];
  }
  return [
    { day: "Saturday", action: "Compare Food delivery, Instamart cook-at-home, and Dineout table paths", swiggyPath: "combined" as const, requiresConfirmation: false },
    { day: "Saturday", action: "Prepare one selected path with separate commercial confirmation", swiggyPath: "combined" as const, requiresConfirmation: true },
  ];
}

export function buildSwiggyRitualAutopilotCenter(config: ServerConfig): SwiggyRitualAutopilotCenter {
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
      readyLanes: lanes.filter((item) => item.status === "ready" || item.status === "needs_consent" || item.status === "confirmation_gate").length,
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
        label: "Inspect ritual autopilot",
        command: `curl -s ${base}/api/swiggy-ritual-autopilot-center`,
        proves: "Food, Instamart, Dineout, and combined household rituals are reviewable with consent and confirmation gates.",
      },
      {
        sequence: 2,
        label: "Plan a ritual",
        command:
          `curl -s -X POST ${base}/api/swiggy-ritual-autopilot-center/plan -H 'Content-Type: application/json' ` +
          `-d '{"cadence":"weekly","householdMode":"family","city":"Bengaluru","budget":2500,"consentToUseHistory":true}'`,
        proves: "MealPilot generates a recurring routine plan without hidden auto-checkout, subscription, or booking behavior.",
      },
      {
        sequence: 3,
        label: "Capture ritual UI proof",
        command: `MEALPILOT_URL=${base} npm run verify:visual`,
        proves: "The Ritual Autopilot card is included in Launch Center screenshot evidence.",
      },
    ],
    assertions: [
      "Ritual Autopilot prepares routines and reminders, not automatic Swiggy commercial actions.",
      "Order, grocery, booking, and quality history signals are used only with explicit user consent.",
      "Every cart, checkout, and booking path requires fresh reads and separate confirmation.",
      "Calendar cadence can remind and stage options, but cannot trigger paid or reserved actions.",
    ],
    externalGates: [
      "Swiggy staging credentials and seeded order, go-to item, and booking history are required before live ritual activation.",
      "Live routine readbacks need redacted transcripts across Food, Instamart, and Dineout for Swiggy review.",
      "Production reminders require data-governance approval for retention windows and user deletion flows.",
    ],
  };
}

export function planSwiggyRitualAutopilot(input: {
  config: ServerConfig;
  cadence: SwiggyRitualAutopilotCadence;
  householdMode: "solo" | "couple" | "family" | "team";
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  budget: number;
  consentToUseHistory: boolean;
}): SwiggyRitualAutopilotPlan {
  const selectedLane = laneForCadence(input.cadence, input.householdMode);
  const routineSlots = buildSlots(selectedLane, input.householdMode);
  const confidence = input.consentToUseHistory ? 0.88 : 0.72;
  const primaryServer = selectedLane.server === "combined" ? "combined" : (selectedLane.server satisfies SwiggyServer);

  return {
    generatedAt: new Date().toISOString(),
    requestId: `rap_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      cadence: input.cadence,
      householdMode: input.householdMode,
      city: input.city,
      budget: input.budget,
      consentToUseHistory: input.consentToUseHistory,
    },
    selectedLaneId: selectedLane.id,
    confidence,
    weeklyTheme:
      selectedLane.id === "pantry_reset"
        ? "Fresh pantry reset with reviewed staples"
        : selectedLane.id === "date_night_slotwatch"
          ? "Low-friction Dineout shortlist with free-slot readback"
          : selectedLane.id === "weekday_lunch_repeat"
            ? "Repeat-safe workday lunch rhythm"
            : "Weekend route choice across order, cook, or reserve",
    routineSlots,
    recommendedNextAction: input.consentToUseHistory
      ? "Ask the user to review the routine, then prepare the first draft with fresh Swiggy reads."
      : "Ask for consent before using Swiggy history; use only stated preferences until consent is granted.",
    swiggyRoute: selectedLane,
    telemetry: [
      { field: "ritual_cadence", value: input.cadence, redaction: "safe enum" },
      { field: "household_mode", value: input.householdMode, redaction: "safe enum" },
      { field: "primary_server", value: primaryServer, redaction: "safe enum" },
      { field: "consent_to_use_history", value: String(input.consentToUseHistory), redaction: "boolean" },
      { field: "auto_commercial_action", value: "false", redaction: "hard-coded safety invariant" },
    ],
    assertions: [
      "The generated ritual is a draft routine, not a subscription or automatic checkout.",
      "Any Swiggy cart, checkout, order, or booking action still requires fresh readback and explicit confirmation.",
      "History-driven personalization is degraded when consentToUseHistory is false.",
    ],
  };
}
