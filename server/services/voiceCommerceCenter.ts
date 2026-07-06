import type { ServerConfig } from "../config.js";
import type {
  SwiggyVoiceCommerceCenter,
  SwiggyVoiceCommerceGuardrail,
  SwiggyVoiceCommerceIntent,
  SwiggyVoiceCommerceRehearsal,
  SwiggyVoiceCommerceScenario,
  SwiggyVoiceCommerceSample,
  SwiggyVoiceCommerceStatus,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-cart-state/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
];

function statusWeight(status: SwiggyVoiceCommerceStatus) {
  if (status === "ready") return 1;
  if (status === "needs_confirmation") return 0.88;
  if (status === "staging_gate") return 0.7;
  return 0.64;
}

function scenario(input: SwiggyVoiceCommerceScenario): SwiggyVoiceCommerceScenario {
  return input;
}

function guardrail(input: SwiggyVoiceCommerceGuardrail): SwiggyVoiceCommerceGuardrail {
  return input;
}

function sample(input: SwiggyVoiceCommerceSample): SwiggyVoiceCommerceSample {
  return input;
}

function buildScenarios(): SwiggyVoiceCommerceScenario[] {
  return [
    scenario({
      id: "voice_food_quick_order",
      label: "Food quick order",
      intent: "quick_order",
      server: "food",
      status: "needs_confirmation",
      swiggyTools: ["get_addresses", "search_restaurants", "search_menu", "update_food_cart", "get_food_cart", "place_food_order"],
      spokenContract: "Speak at most three menu choices, then read back item, restaurant, total, ETA, address label, and COD status before order placement.",
      cardFallback: "Show a richer Food comparison card with menu match, ETA, price, restaurant, cart preview, and retry-safe status.",
      confirmationPrompt: "Should I place this Food order with cash on delivery to your saved address?",
      safetyRule: "Never speak raw restaurant, item, cart, address, or order ids; refresh get_food_cart before place_food_order.",
      evidenceLinks: ["/api/mcp/state-orchestrator", "/api/swiggy-confirmation-command-center", "/api/sessions/:sessionId/surface?surface=voice"],
    }),
    scenario({
      id: "voice_instamart_restock",
      label: "Instamart restock",
      intent: "pantry_restock",
      server: "instamart",
      status: "needs_confirmation",
      swiggyTools: ["get_addresses", "your_go_to_items", "search_products", "get_product_variants", "update_cart", "get_cart", "checkout"],
      spokenContract: "Summarize up to three staple gaps and ask whether the user wants to review variants in the card fallback.",
      cardFallback: "Show variant choices, pantry reason, serviceability, bill readback, and checkout lock.",
      confirmationPrompt: "Should I add these groceries and wait on the final checkout confirmation?",
      safetyRule: "Address changes clear cart truth; checkout stays locked until get_cart confirms availability, bill total, and delivery address.",
      evidenceLinks: ["/api/swiggy-cart-mutation-workbench", "/api/household-preference-graph", "/api/mcp/commercial-action-guard"],
    }),
    scenario({
      id: "voice_dineout_booking",
      label: "Dineout booking",
      intent: "book_table",
      server: "dineout",
      status: "needs_confirmation",
      swiggyTools: ["get_saved_locations", "search_restaurants_dineout", "get_restaurant_details", "get_available_slots", "book_table", "get_booking_status"],
      spokenContract: "Speak two slot options maximum and confirm party size, area, free-booking status, and time before booking.",
      cardFallback: "Show restaurant details, slot picker, free-booking proof, map area, and booking-status recovery path.",
      confirmationPrompt: "Should I book this free Dineout table for your party?",
      safetyRule: "Only free slots with fresh slot evidence can reach book_table; uncertain booking attempts use get_booking_status before retry.",
      evidenceLinks: ["/api/swiggy-dineout-precision-center", "/api/premium-concierge-itinerary", "/api/swiggy-confirmation-command-center"],
    }),
    scenario({
      id: "voice_combined_evening",
      label: "Combined evening concierge",
      intent: "combined_evening",
      server: "combined",
      status: "needs_confirmation",
      swiggyTools: ["search_menu", "search_products", "search_restaurants_dineout", "get_available_slots", "get_food_cart", "get_cart"],
      spokenContract: "Offer one short recommendation per path: order now, cook at home, or book a table; push details to the card fallback.",
      cardFallback: "Show Food, Instamart, and Dineout options side by side with separate confirmation buttons and stale-state warnings.",
      confirmationPrompt: "Which path should I prepare first: order, cook, or reserve?",
      safetyRule: "Combined journeys split into separate confirmations for Food order, Instamart checkout, and Dineout booking.",
      evidenceLinks: ["/api/luxury-experience-workspace", "/api/swiggy-route-optimizer", "/api/swiggy-live-signal-calibration"],
    }),
  ];
}

function buildGuardrails(): SwiggyVoiceCommerceGuardrail[] {
  return [
    guardrail({
      id: "three_option_spoken_limit",
      label: "Three-option spoken limit",
      status: "ready",
      policy: "Voice responses stay short: no more than three spoken choices before asking the user to continue in a visual card.",
      evidenceLinks: ["/api/sessions/:sessionId/surface?surface=voice", "/api/evaluation-lab"],
    }),
    guardrail({
      id: "no_raw_ids_in_tts",
      label: "No raw IDs in TTS",
      status: "ready",
      policy: "Restaurant, item, cart, order, booking, slot, address, and payment identifiers are never spoken aloud.",
      evidenceLinks: ["/api/mcp/state-orchestrator", "/api/data-governance-center"],
    }),
    guardrail({
      id: "no_raw_audio_retention",
      label: "No raw audio retention",
      status: "ready",
      policy: "Local proof stores only transcribed intent, route selection, confirmation status, and redacted telemetry, never raw audio.",
      evidenceLinks: ["/api/audit-ledger", "/api/data-governance-center"],
    }),
    guardrail({
      id: "commercial_readback",
      label: "Commercial readback",
      status: "ready",
      policy: "Every voice commercial action must read back total, address or area, ETA/time, payment/free-booking truth, and action type before confirmation.",
      evidenceLinks: ["/api/mcp/commercial-action-guard", "/api/swiggy-confirmation-command-center"],
    }),
    guardrail({
      id: "voice_sdk_review",
      label: "Voice SDK review",
      status: "voice_sdk_gate",
      policy: "Production microphone, wake-word, ASR/TTS, and accessibility behavior need device and privacy review before live use.",
      evidenceLinks: ["/api/channel-multimodal-studio", "/api/swiggy-access-evidence-matrix"],
    }),
    guardrail({
      id: "staging_voice_replay",
      label: "Staging voice replay",
      status: "staging_gate",
      policy: "Credentialed voice runs need seeded Swiggy accounts, redacted transcripts, and 48-hour soak before production launch.",
      evidenceLinks: ["/api/swiggy-staging-credential-drill", "/api/staging-certification-matrix"],
    }),
  ];
}

function buildSamples(): SwiggyVoiceCommerceSample[] {
  return [
    sample({
      id: "quick_paneer_order",
      utterance: "Order paneer tikka near home under 600 rupees",
      detectedIntent: "quick_order",
      selectedScenario: "voice_food_quick_order",
      status: "needs_confirmation",
    }),
    sample({
      id: "restock_breakfast",
      utterance: "Refill milk curd eggs and oats for tomorrow",
      detectedIntent: "pantry_restock",
      selectedScenario: "voice_instamart_restock",
      status: "needs_confirmation",
    }),
    sample({
      id: "date_night_table",
      utterance: "Book a table for two tonight in Indiranagar",
      detectedIntent: "book_table",
      selectedScenario: "voice_dineout_booking",
      status: "needs_confirmation",
    }),
    sample({
      id: "combined_evening",
      utterance: "Plan dinner with groceries backup and a table option",
      detectedIntent: "combined_evening",
      selectedScenario: "voice_combined_evening",
      status: "needs_confirmation",
    }),
  ];
}

function normalizeText(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function inferIntent(utterance: string): { intent: SwiggyVoiceCommerceIntent; confidence: number; entities: string[] } {
  const normalized = normalizeText(utterance);
  const entityTerms = ["paneer", "biryani", "milk", "curd", "oats", "table", "reservation", "dinner", "groceries", "home"];
  const entities = entityTerms.filter((term) => normalized.includes(term));

  if (["table", "book", "reservation", "slot"].some((term) => normalized.includes(term))) {
    return { intent: "book_table", confidence: 0.9, entities };
  }
  if (["grocery", "groceries", "restock", "refill", "milk", "oats", "curd"].some((term) => normalized.includes(term))) {
    return { intent: "pantry_restock", confidence: 0.86, entities };
  }
  if (["plan", "backup", "evening", "date", "dinner"].some((term) => normalized.includes(term))) {
    return { intent: "combined_evening", confidence: 0.82, entities };
  }
  return { intent: "quick_order", confidence: 0.84, entities };
}

function scenarioForIntent(intent: SwiggyVoiceCommerceIntent) {
  return buildScenarios().find((item) => item.intent === intent) ?? buildScenarios()[0];
}

function scoreCenter(scenarios: SwiggyVoiceCommerceScenario[], guardrails: SwiggyVoiceCommerceGuardrail[]) {
  const statuses = [...scenarios.map((item) => item.status), ...guardrails.map((item) => item.status)];
  return Math.round((statuses.reduce((sum, status) => sum + statusWeight(status), 0) / statuses.length) * 100);
}

export function buildSwiggyVoiceCommerceCenter(config: ServerConfig): SwiggyVoiceCommerceCenter {
  const scenarios = buildScenarios();
  const guardrails = buildGuardrails();
  const samples = buildSamples();
  const base = `http://localhost:${config.port}`;

  return {
    generatedAt: new Date().toISOString(),
    score: scoreCenter(scenarios, guardrails),
    mode: config.swiggyMode,
    officialSources,
    totals: {
      scenarios: scenarios.length,
      readyScenarios: scenarios.filter((item) => item.status === "ready" || item.status === "needs_confirmation").length,
      guardrails: guardrails.length,
      readyGuardrails: guardrails.filter((item) => item.status === "ready").length,
      samples: samples.length,
      externalGates: 3,
    },
    scenarios,
    guardrails,
    samples,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Inspect voice routes",
        command: `curl -s ${base}/api/swiggy-voice-commerce-center`,
        proves: "Food, Instamart, Dineout, and combined voice-commerce scenarios are visible with safety contracts.",
      },
      {
        sequence: 2,
        label: "Rehearse a spoken order",
        command:
          `curl -s -X POST ${base}/api/swiggy-voice-commerce-center/rehearse -H 'Content-Type: application/json' ` +
          `-d '{"utterance":"Order paneer tikka near home under 600 rupees","city":"Bengaluru"}'`,
        proves: "MealPilot produces short TTS, card fallback, confirmation prompt, route tools, and no raw-audio retention.",
      },
      {
        sequence: 3,
        label: "Capture voice UI proof",
        command: `MEALPILOT_URL=${base} npm run verify:visual`,
        proves: "The Voice Commerce card is included in screenshot evidence across the premium Launch Center.",
      },
    ],
    assertions: [
      "Voice commerce is a rehearsal and confirmation layer, not an automatic order placer.",
      "Spoken output is intentionally shorter than chat output and never includes raw Swiggy ids.",
      "Food, Instamart, and Dineout routes preserve fresh-read and separate-confirmation rules.",
      "Raw audio is not retained in local proof artifacts.",
    ],
    externalGates: [
      "Production microphone, ASR, TTS, accessibility, and device-permission review require operator approval.",
      "Swiggy staging credentials and seeded accounts are required before live voice readbacks.",
      "Production voice commerce traffic requires Swiggy review, 48-hour soak, and launch approval.",
    ],
  };
}

export function rehearseSwiggyVoiceCommerce(input: {
  config: ServerConfig;
  utterance: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
}): SwiggyVoiceCommerceRehearsal {
  const detected = inferIntent(input.utterance);
  const selectedScenario = scenarioForIntent(detected.intent);

  return {
    generatedAt: new Date().toISOString(),
    requestId: `vcc_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      utterance: input.utterance,
      city: input.city,
      surface: "voice",
      rawAudioRetained: false,
    },
    detected: {
      ...detected,
      requiresUserConfirmation: true,
    },
    selectedScenarioId: selectedScenario.id,
    spokenScript: [
      "I found a safe Swiggy route for that.",
      selectedScenario.spokenContract,
      selectedScenario.confirmationPrompt,
    ],
    cardFallback: [
      selectedScenario.cardFallback,
      "Open the visual card for full restaurant, product, slot, cart, and support evidence.",
      "Commercial actions stay locked until the final confirmation readback is accepted.",
    ],
    confirmationPrompt: selectedScenario.confirmationPrompt,
    swiggyRoute: selectedScenario,
    telemetry: [
      { field: "surface", value: "voice", redaction: "safe enum" },
      { field: "voice_intent", value: detected.intent, redaction: "safe enum" },
      { field: "entity_count", value: String(detected.entities.length), redaction: "counts only" },
      { field: "raw_audio_retained", value: "false", redaction: "hard-coded privacy invariant" },
    ],
    assertions: [
      "No raw audio bytes are accepted or retained by this API.",
      "The spoken route remains a suggestion until the user confirms the commercial action.",
      "The selected Swiggy route is read-first and commerce-locked.",
    ],
  };
}
