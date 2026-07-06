import type { ServerConfig } from "../config.js";
import type {
  SwiggyCustomizationGuardrail,
  SwiggyCustomizationLane,
  SwiggyCustomizationRisk,
  SwiggyCustomizationSample,
  SwiggyCustomizationStatus,
  SwiggyCustomizationStudio,
  SwiggyCustomizationValidation,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_restaurant_menu/",
  "https://mcp.swiggy.com/builders/docs/reference/food/search_menu/",
  "https://mcp.swiggy.com/builders/docs/reference/food/update_food_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/search_products/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/your_go_to_items/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/update_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_cart/",
];

function statusWeight(status: SwiggyCustomizationStatus) {
  if (status === "ready") return 1;
  if (status === "confirmation_gate") return 0.88;
  if (status === "watch") return 0.78;
  return 0.68;
}

function lane(input: SwiggyCustomizationLane): SwiggyCustomizationLane {
  return input;
}

function guardrail(input: SwiggyCustomizationGuardrail): SwiggyCustomizationGuardrail {
  return input;
}

function sample(input: SwiggyCustomizationSample): SwiggyCustomizationSample {
  return input;
}

function buildLanes(): SwiggyCustomizationLane[] {
  return [
    lane({
      id: "food_addon_variant_truth",
      label: "Food add-on and variant truth",
      server: "food",
      status: "confirmation_gate",
      swiggyTools: ["get_restaurant_menu", "search_menu", "update_food_cart", "get_food_cart"],
      customizationSignals: ["food_addons", "food_variants", "allergy_note", "cart_readback"],
      decisionSurface: "Show add-ons, quantity, variants, and dietary notes as a review sheet before cart mutation.",
      sourceTruth: "Use search_menu for cart-ready item customization shape even when get_restaurant_menu was used for browsing.",
      mutationBoundary: "update_food_cart stays staged until the user confirms exact item, add-ons, variants, and quantity.",
      confirmationCopy: "I will add this exact item with these choices, then read the Food cart back before any order action.",
      evidenceLinks: [officialSources[3], officialSources[4], officialSources[5], officialSources[6]],
    }),
    lane({
      id: "food_allergy_substitution_gate",
      label: "Food allergy substitution gate",
      server: "food",
      status: "watch",
      swiggyTools: ["search_menu", "get_restaurant_menu", "update_food_cart", "get_food_cart"],
      customizationSignals: ["food_addons", "food_variants", "allergy_note"],
      decisionSurface: "Flag allergy-sensitive substitutions as review-required, not automatic replacements.",
      sourceTruth: "MealPilot can surface menu labels and user preferences, but cannot certify allergen absence without merchant truth.",
      mutationBoundary: "Cart mutation is blocked until the user accepts the substitution risk and exact item choices.",
      confirmationCopy: "This looks safer for your preference, but I cannot guarantee allergen absence; should I stage it?",
      evidenceLinks: ["/api/nutrition-budget-intelligence", "/api/data-governance-center"],
    }),
    lane({
      id: "instamart_pack_size_truth",
      label: "Instamart pack-size truth",
      server: "instamart",
      status: "ready",
      swiggyTools: ["search_products", "your_go_to_items", "update_cart", "get_cart"],
      customizationSignals: ["instamart_pack_size", "instamart_stock", "cart_readback"],
      decisionSurface: "Show pack size, stock, variant, quantity, and pantry reason before full-cart replacement.",
      sourceTruth: "Use fresh search_products or your_go_to_items results for the SKU/variant that update_cart will send.",
      mutationBoundary: "update_cart sends the complete intended basket for the selected address and then requires get_cart.",
      confirmationCopy: "I will use this exact pack size and quantity, then review the Instamart bill before checkout.",
      evidenceLinks: [officialSources[7], officialSources[8], officialSources[9], officialSources[10]],
    }),
    lane({
      id: "voice_safe_customization",
      label: "Voice-safe customization",
      server: "combined",
      status: "ready",
      swiggyTools: ["search_menu", "your_go_to_items", "get_food_cart", "get_cart"],
      customizationSignals: ["food_variants", "instamart_pack_size", "cart_readback"],
      decisionSurface: "Speak at most three choices and move variants, add-ons, and bill details into the card fallback.",
      sourceTruth: "Voice output uses derived labels only; raw restaurant, item, spin, cart, and address ids stay hidden.",
      mutationBoundary: "Voice cannot imply a cart write succeeded until the visual card confirms readback truth.",
      confirmationCopy: "I found a few choices; please review the exact variant in the card before I change the cart.",
      evidenceLinks: ["/api/swiggy-voice-commerce-center", "/api/mcp/widget-runtime"],
    }),
    lane({
      id: "combined_recipe_customization",
      label: "Combined recipe customization",
      server: "combined",
      status: "confirmation_gate",
      swiggyTools: ["search_menu", "search_products", "update_food_cart", "update_cart", "get_food_cart", "get_cart"],
      customizationSignals: ["food_addons", "instamart_pack_size", "cart_readback"],
      decisionSurface: "Compare order-now Food customization with cook-at-home Instamart variants without mixing carts.",
      sourceTruth: "Food item customization and grocery SKU variants remain separate source-of-truth payloads.",
      mutationBoundary: "Food and Instamart cart mutations require separate review and separate post-mutation readbacks.",
      confirmationCopy: "These are two different carts; I will stage only the option you choose and read that cart back.",
      evidenceLinks: ["/api/swiggy-meal-window-intelligence", "/api/swiggy-cart-mutation-workbench"],
    }),
  ];
}

function buildGuardrails(): SwiggyCustomizationGuardrail[] {
  return [
    guardrail({
      id: "search_menu_before_food_write",
      label: "Search menu before Food write",
      status: "ready",
      policy: "Cart-ready Food choices use search_menu customization shape before update_food_cart.",
      evidenceLinks: [officialSources[4], officialSources[5]],
    }),
    guardrail({
      id: "variant_never_invented",
      label: "Variant never invented",
      status: "ready",
      policy: "Add-ons, variants, pack sizes, and spin-level choices are copied from fresh Swiggy responses, never synthesized.",
      evidenceLinks: ["/api/swiggy-discovery-freshness", "/api/mcp/tool-contract-matrix"],
    }),
    guardrail({
      id: "post_mutation_cart_readback",
      label: "Post-mutation cart readback",
      status: "ready",
      policy: "Food and Instamart cart mutations are followed by get_food_cart or get_cart before success copy or checkout.",
      evidenceLinks: [officialSources[6], officialSources[10]],
    }),
    guardrail({
      id: "allergy_copy_is_not_medical",
      label: "Allergy copy is not medical",
      status: "watch",
      policy: "Preference and allergy copy is a user-facing caution, not a guarantee from MealPilot or a substitute for merchant confirmation.",
      evidenceLinks: ["/api/nutrition-budget-intelligence", "/api/safety-and-compliance"],
    }),
    guardrail({
      id: "raw_ids_hidden_from_user",
      label: "Raw ids hidden from user",
      status: "ready",
      policy: "Restaurant ids, item ids, cart ids, spin ids, address ids, and add-on ids stay out of speech, screenshots, and support copy.",
      evidenceLinks: ["/api/swiggy-voice-commerce-center", "/api/visual-qa-center"],
    }),
  ];
}

function buildSamples(): SwiggyCustomizationSample[] {
  return [
    sample({
      id: "paneer_no_onion",
      prompt: "Add paneer tikka but no onion and less spice.",
      selectedLane: "food_addon_variant_truth",
      server: "food",
      status: "confirmation_gate",
    }),
    sample({
      id: "peanut_allergy_substitute",
      prompt: "Find a high-protein bowl, but I have a peanut allergy.",
      selectedLane: "food_allergy_substitution_gate",
      server: "food",
      status: "watch",
    }),
    sample({
      id: "family_milk_pack",
      prompt: "Add the larger milk pack we usually buy.",
      selectedLane: "instamart_pack_size_truth",
      server: "instamart",
      status: "ready",
    }),
    sample({
      id: "voice_quick_reorder",
      prompt: "Reorder my usual staples by voice.",
      selectedLane: "voice_safe_customization",
      server: "combined",
      status: "ready",
    }),
  ];
}

function laneFor(input: { server: SwiggyServer | "combined"; hasAllergy: boolean; userChangedVariant: boolean; includeDineout: boolean }) {
  const lanes = buildLanes();
  if (input.hasAllergy) return lanes.find((item) => item.id === "food_allergy_substitution_gate") ?? lanes[1];
  if (input.server === "instamart") return lanes.find((item) => item.id === "instamart_pack_size_truth") ?? lanes[2];
  if (input.server === "combined" || input.includeDineout) return lanes.find((item) => item.id === "combined_recipe_customization") ?? lanes[4];
  if (input.userChangedVariant) return lanes.find((item) => item.id === "food_addon_variant_truth") ?? lanes[0];
  return lanes.find((item) => item.id === "voice_safe_customization") ?? lanes[3];
}

function mutationRisk(input: { hasAllergy: boolean; userChangedVariant: boolean; quantity: number; server: SwiggyServer | "combined" }): SwiggyCustomizationRisk {
  if (input.hasAllergy || input.quantity > 6) return "high";
  if (input.userChangedVariant || input.server === "combined") return "medium";
  return "low";
}

function checklist(route: SwiggyCustomizationLane): SwiggyCustomizationValidation["checklist"] {
  if (route.id === "instamart_pack_size_truth") {
    return [
      { sequence: 1, label: "Find exact product variant", tool: "search_products", guardrail: "Use selected address and fresh stock truth." },
      { sequence: 2, label: "Stage complete basket", tool: "update_cart", guardrail: "Send full intended basket, not a partial delta." },
      { sequence: 3, label: "Read cart bill", tool: "get_cart", guardrail: "Show bill, availability, and checkout lock." },
    ];
  }
  if (route.id === "food_allergy_substitution_gate") {
    return [
      { sequence: 1, label: "Search menu label", tool: "search_menu", guardrail: "Prefer merchant-provided labels and user caution." },
      { sequence: 2, label: "Ask substitution consent", tool: "update_food_cart", guardrail: "Block write until user accepts exact item and caution." },
      { sequence: 3, label: "Read cart back", tool: "get_food_cart", guardrail: "Show exact cart item and remove if mismatch appears." },
    ];
  }
  return [
    { sequence: 1, label: "Resolve cart-ready item", tool: "search_menu", guardrail: "Use Food customization payload from fresh search." },
    { sequence: 2, label: "Stage exact choices", tool: "update_food_cart", guardrail: "Use selected variants, add-ons, and quantity only." },
    { sequence: 3, label: "Read cart back", tool: "get_food_cart", guardrail: "Show cart truth before coupon, payment, or order." },
  ];
}

function scoreStudio(lanes: SwiggyCustomizationLane[], guardrails: SwiggyCustomizationGuardrail[]) {
  const statuses = [...lanes.map((item) => item.status), ...guardrails.map((item) => item.status)];
  return Math.round((statuses.reduce((sum, status) => sum + statusWeight(status), 0) / statuses.length) * 100);
}

export function buildSwiggyCustomizationStudio(config: ServerConfig): SwiggyCustomizationStudio {
  const lanes = buildLanes();
  const guardrails = buildGuardrails();
  const samples = buildSamples();
  const base = `http://localhost:${config.port}`;

  return {
    generatedAt: new Date().toISOString(),
    score: scoreStudio(lanes, guardrails),
    mode: config.swiggyMode,
    officialSources,
    totals: {
      lanes: lanes.length,
      readyLanes: lanes.filter((item) => item.status === "ready" || item.status === "confirmation_gate").length,
      guardrails: guardrails.length,
      readyGuardrails: guardrails.filter((item) => item.status === "ready").length,
      samples: samples.length,
      toolsCovered: new Set(lanes.flatMap((item) => item.swiggyTools)).size,
      externalGates: 3,
    },
    lanes,
    guardrails,
    samples,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Inspect customization studio",
        command: `curl -s ${base}/api/swiggy-customization-studio`,
        proves: "Food add-ons, Instamart variants, allergy cautions, and readback gates are visible.",
      },
      {
        sequence: 2,
        label: "Validate allergy-sensitive cart staging",
        command:
          `curl -s -X POST ${base}/api/swiggy-customization-studio/validate -H 'Content-Type: application/json' ` +
          `-d '{"server":"food","intent":"paneer bowl no peanuts","hasAllergy":true,"userChangedVariant":true,"quantity":1,"includeDineout":false}'`,
        proves: "MealPilot returns high-risk customization handling with fresh search_menu and get_food_cart checks.",
      },
      {
        sequence: 3,
        label: "Capture customization UI proof",
        command: `MEALPILOT_URL=${base} npm run verify:visual`,
        proves: "The Customization Studio card is included in Launch Center screenshot evidence.",
      },
    ],
    assertions: [
      "Food add-ons and variants are copied from fresh search_menu or menu responses before update_food_cart.",
      "Instamart pack-size and stock choices are copied from fresh search_products or your_go_to_items results before update_cart.",
      "Cart mutation success copy waits for get_food_cart or get_cart readback.",
      "Allergy-sensitive suggestions are cautionary and require explicit user review before staging.",
      "Raw restaurant, item, spin, cart, add-on, and address ids stay out of user-facing copy.",
    ],
    externalGates: [
      "Live menu add-on and variant calibration requires seeded Swiggy staging accounts.",
      "Live Instamart stock and pack-size drift requires staging transcript replay before production.",
      "Merchant allergy and dietary truth remains an external data gate until Swiggy provides authoritative fields.",
    ],
  };
}

export function validateSwiggyCustomization(input: {
  config: ServerConfig;
  server: SwiggyServer | "combined";
  intent: string;
  hasAllergy: boolean;
  userChangedVariant: boolean;
  quantity: number;
  includeDineout: boolean;
}): SwiggyCustomizationValidation {
  const selectedLane = laneFor(input);
  const risk = mutationRisk(input);
  const freshRead = selectedLane.server === "instamart" ? "get_cart" : "get_food_cart";

  return {
    generatedAt: new Date().toISOString(),
    requestId: `custom_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      server: input.server,
      intent: input.intent,
      hasAllergy: input.hasAllergy,
      userChangedVariant: input.userChangedVariant,
      quantity: input.quantity,
      includeDineout: input.includeDineout,
    },
    selectedLaneId: selectedLane.id,
    mutationRisk: risk,
    requiredFreshRead: freshRead,
    recommendedAction:
      risk === "high"
        ? "Pause for explicit review, use fresh customization truth, and avoid any health or allergy guarantee."
        : risk === "medium"
          ? "Stage the exact variant only after user review and read the cart back immediately."
          : "Use the low-friction route, then read back cart truth before checkout or ordering.",
    swiggyRoute: selectedLane,
    checklist: checklist(selectedLane),
    telemetry: [
      { field: "customization_server", value: input.server, redaction: "safe enum" },
      { field: "mutation_risk", value: risk, redaction: "derived bucket only" },
      { field: "allergy_sensitive", value: String(input.hasAllergy), redaction: "boolean only" },
      { field: "raw_item_or_spin_id_retained", value: "false", redaction: "hard-coded privacy invariant" },
      { field: "cart_readback_required", value: freshRead, redaction: "tool name only" },
    ],
    assertions: [
      "Customization validation does not call a cart mutation.",
      "All item, add-on, variant, spin, and cart identifiers must come from fresh Swiggy reads.",
      "Cart success copy is blocked until the required cart readback runs.",
      "Allergy-sensitive copy is cautionary and not a medical or merchant guarantee.",
    ],
  };
}
