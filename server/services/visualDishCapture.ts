import type { ServerConfig } from "../config.js";
import type {
  SwiggyVisualDishCaptureAnalysis,
  SwiggyVisualDishCaptureCenter,
  SwiggyVisualDishCaptureIntent,
  SwiggyVisualDishCaptureStatus,
  SwiggyVisualDishGuardrail,
  SwiggyVisualDishRoute,
  SwiggyVisualDishSampleCapture,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-cart-state/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
];

function statusWeight(status: SwiggyVisualDishCaptureStatus) {
  if (status === "ready") return 1;
  if (status === "needs_confirmation") return 0.84;
  if (status === "staging_gate") return 0.68;
  return 0.62;
}

function route(input: SwiggyVisualDishRoute): SwiggyVisualDishRoute {
  return input;
}

function guardrail(input: SwiggyVisualDishGuardrail): SwiggyVisualDishGuardrail {
  return input;
}

function sample(input: SwiggyVisualDishSampleCapture): SwiggyVisualDishSampleCapture {
  return input;
}

function buildRoutes(): SwiggyVisualDishRoute[] {
  return [
    route({
      id: "food_menu_match",
      label: "Food menu match",
      server: "food",
      status: "needs_confirmation",
      swiggyTools: ["search_menu", "search_restaurants", "get_restaurant_menu", "update_food_cart", "get_food_cart"],
      userConfirmation: "User confirms the detected dish label before any Food search or cart mutation.",
      output: "Ranked menu matches with restaurant context, confidence, ETA, price bucket, and a cart preview only after confirmation.",
      fallback: "If confidence is below 0.7, ask the user to choose between three labels before calling Swiggy.",
      evidenceLinks: ["/api/channel-multimodal-studio", "/api/mcp/tool-lab", "/api/mcp/state-orchestrator"],
    }),
    route({
      id: "instamart_ingredient_rescue",
      label: "Instamart ingredient rescue",
      server: "instamart",
      status: "needs_confirmation",
      swiggyTools: ["search_products", "get_product_variants", "update_cart", "get_cart"],
      userConfirmation: "User confirms whether they want cooked food, ingredients, or both.",
      output: "Ingredient basket suggestions for recreating the detected dish at home, with variants and cart readback.",
      fallback: "If product variants drift, show pantry-friendly substitutions and require confirmation before cart update.",
      evidenceLinks: ["/api/nutrition-budget-intelligence", "/api/swiggy-cart-mutation-workbench"],
    }),
    route({
      id: "dineout_place_discovery",
      label: "Dineout place discovery",
      server: "dineout",
      status: "ready",
      swiggyTools: ["search_restaurants_dineout", "get_restaurant_details", "get_available_slots"],
      userConfirmation: "User confirms that the photo implies a dining-out occasion, not delivery or groceries.",
      output: "Restaurant and slot shortlist for venues likely to serve the detected cuisine or dish family.",
      fallback: "If no close match exists, route back to Food menu search and explain the Dineout miss.",
      evidenceLinks: ["/api/swiggy-dineout-precision-center", "/api/premium-concierge-itinerary"],
    }),
    route({
      id: "combined_craving_to_evening",
      label: "Craving to evening plan",
      server: "combined",
      status: "needs_confirmation",
      swiggyTools: [
        "search_menu",
        "search_products",
        "search_restaurants_dineout",
        "get_available_slots",
        "get_food_cart",
        "get_cart",
      ],
      userConfirmation: "User chooses delivery, cook-at-home, or reservation before any mutation tool is used.",
      output: "A premium comparison board: order it now, cook it tonight, or book a table for it.",
      fallback: "If any server returns stale or ambiguous data, degrade to read-only recommendations and keep commerce locked.",
      evidenceLinks: ["/api/luxury-experience-workspace", "/api/swiggy-live-signal-calibration"],
    }),
  ];
}

function buildGuardrails(): SwiggyVisualDishGuardrail[] {
  return [
    guardrail({
      id: "no_raw_image_retention",
      label: "No raw image retention",
      status: "ready",
      policy: "MealPilot stores only the user-confirmed text label, selected route, and redacted telemetry; raw image bytes stay outside durable storage.",
      evidenceLinks: ["/api/data-governance-center", "/api/audit-ledger"],
    }),
    guardrail({
      id: "label_confirmation_first",
      label: "Label confirmation before Swiggy calls",
      status: "ready",
      policy: "Every detected dish label requires user confirmation before Swiggy search, cart, checkout, or booking tools are called.",
      evidenceLinks: ["/api/mcp/commercial-action-guard", "/api/mcp/state-orchestrator"],
    }),
    guardrail({
      id: "no_medical_claims",
      label: "Nutrition claim boundary",
      status: "ready",
      policy: "Image-derived nutrition hints are treated as planning estimates, not medical advice, and must show source confidence.",
      evidenceLinks: ["/api/nutrition-budget-intelligence", "/api/brand-compliance-kit"],
    }),
    guardrail({
      id: "vision_model_gate",
      label: "Approved vision layer gate",
      status: "vision_gate",
      policy: "Production camera capture needs an approved vision/OCR layer and device permission review before raw images enter the workflow.",
      evidenceLinks: ["/api/channel-multimodal-studio", "/api/swiggy-access-evidence-matrix"],
    }),
    guardrail({
      id: "staging_readback_gate",
      label: "Staging readback gate",
      status: "staging_gate",
      policy: "Live Food, Instamart, and Dineout matches require Swiggy staging credentials, seeded data, and redacted readback transcripts.",
      evidenceLinks: ["/api/swiggy-staging-credential-drill", "/api/staging-certification-matrix"],
    }),
  ];
}

function buildSamples(): SwiggyVisualDishSampleCapture[] {
  return [
    sample({
      id: "paneer_tikka_reel",
      intent: "dish_photo",
      inputHint: "Photo caption says smoky paneer tikka with chutney.",
      detectedLabel: "paneer tikka",
      confidence: 0.88,
      selectedRoute: "food_menu_match",
      status: "needs_confirmation",
    }),
    sample({
      id: "biryani_menu_screenshot",
      intent: "menu_screenshot",
      inputHint: "Menu screenshot contains veg biryani and raita.",
      detectedLabel: "veg biryani",
      confidence: 0.92,
      selectedRoute: "combined_craving_to_evening",
      status: "needs_confirmation",
    }),
    sample({
      id: "protein_pantry_photo",
      intent: "pantry_photo",
      inputHint: "Pantry photo suggests chickpeas, curd, and wraps.",
      detectedLabel: "chickpea wrap",
      confidence: 0.81,
      selectedRoute: "instamart_ingredient_rescue",
      status: "needs_confirmation",
    }),
  ];
}

function normalizeText(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function inferDish(caption: string, imageName?: string) {
  const source = normalizeText(`${caption} ${imageName ?? ""}`);
  const candidates = [
    { match: ["paneer", "tikka"], label: "paneer tikka", cuisine: "North Indian", alternatives: ["paneer roll", "tandoori paneer"], confidence: 0.88 },
    { match: ["biryani"], label: "veg biryani", cuisine: "Hyderabadi", alternatives: ["paneer biryani", "veg pulao"], confidence: 0.86 },
    { match: ["dosa"], label: "masala dosa", cuisine: "South Indian", alternatives: ["plain dosa", "uttapam"], confidence: 0.84 },
    { match: ["wrap", "roll"], label: "paneer wrap", cuisine: "Cafe", alternatives: ["chickpea wrap", "kathi roll"], confidence: 0.8 },
    { match: ["pizza"], label: "margherita pizza", cuisine: "Italian", alternatives: ["farmhouse pizza", "cheese burst pizza"], confidence: 0.78 },
    { match: ["salad"], label: "protein salad", cuisine: "Healthy", alternatives: ["sprout salad", "paneer salad"], confidence: 0.76 },
  ];
  const matched = candidates.find((candidate) => candidate.match.some((term) => source.includes(term)));

  return matched ?? {
    label: "high-protein vegetarian bowl",
    cuisine: "Modern Indian",
    alternatives: ["paneer bowl", "dal rice bowl", "chickpea salad"],
    confidence: 0.68,
  };
}

function selectedRouteFor(intent: SwiggyVisualDishCaptureIntent, confidence: number) {
  if (intent === "pantry_photo") return "instamart_ingredient_rescue";
  if (intent === "menu_screenshot" && confidence >= 0.8) return "combined_craving_to_evening";
  if (intent === "chat_image") return "combined_craving_to_evening";
  return "food_menu_match";
}

function scoreCenter(routes: SwiggyVisualDishRoute[], guardrails: SwiggyVisualDishGuardrail[]) {
  const statuses = [...routes.map((item) => item.status), ...guardrails.map((item) => item.status)];
  return Math.round((statuses.reduce((sum, status) => sum + statusWeight(status), 0) / statuses.length) * 100);
}

export function buildSwiggyVisualDishCaptureCenter(config: ServerConfig): SwiggyVisualDishCaptureCenter {
  const routes = buildRoutes();
  const guardrails = buildGuardrails();
  const sampleCaptures = buildSamples();
  const base = `http://localhost:${config.port}`;

  return {
    generatedAt: new Date().toISOString(),
    score: scoreCenter(routes, guardrails),
    mode: config.swiggyMode,
    officialSources,
    totals: {
      routes: routes.length,
      readyRoutes: routes.filter((item) => item.status === "ready" || item.status === "needs_confirmation").length,
      guardrails: guardrails.length,
      readyGuardrails: guardrails.filter((item) => item.status === "ready").length,
      sampleCaptures: sampleCaptures.length,
      externalGates: 3,
    },
    routes,
    guardrails,
    sampleCaptures,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Inspect capture routes",
        command: `curl -s ${base}/api/swiggy-visual-dish-capture`,
        proves: "Food, Instamart, Dineout, and combined visual route plans are visible before camera launch.",
      },
      {
        sequence: 2,
        label: "Analyze a sample caption",
        command:
          `curl -s -X POST ${base}/api/swiggy-visual-dish-capture/analyze -H 'Content-Type: application/json' ` +
          `-d '{"intent":"dish_photo","caption":"smoky paneer tikka with chutney","city":"Bengaluru","imageName":"paneer-tikka.jpg"}'`,
        proves: "MealPilot produces a confirmed label, alternatives, route plan, telemetry, and no raw-image retention.",
      },
      {
        sequence: 3,
        label: "Run visual proof",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Visual Dish Capture card is screenshot-tested with the rest of the premium Launch Center.",
      },
    ],
    assertions: [
      "Visual dish capture is a confirmation-first route planner, not an automatic order placer.",
      "Raw images are not retained by default; only confirmed labels and selected route metadata are durable evidence.",
      "Food, Instamart, and Dineout are all used for differentiated outcomes: order it, cook it, or book it.",
      "Production camera and OCR remain external gates until privacy review, staging credentials, and Swiggy approval clear.",
    ],
    externalGates: [
      "Approved vision/OCR provider and device camera UX require operator and privacy review.",
      "Swiggy staging credentials and seeded data are required before live menu, product, slot, cart, or booking readbacks.",
      "Production use requires Swiggy approval for real traffic, hosted widgets, and any co-branded camera workflow.",
    ],
  };
}

export function analyzeSwiggyVisualDishCapture(input: {
  config: ServerConfig;
  intent: SwiggyVisualDishCaptureIntent;
  caption: string;
  city: string;
  imageName?: string;
}): SwiggyVisualDishCaptureAnalysis {
  const detected = inferDish(input.caption, input.imageName);
  const selectedRouteId = selectedRouteFor(input.intent, detected.confidence);
  const routes = buildRoutes();

  return {
    generatedAt: new Date().toISOString(),
    requestId: `vdc_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      intent: input.intent,
      imageName: input.imageName,
      caption: input.caption,
      city: input.city,
      rawImageRetained: false,
    },
    detected: {
      ...detected,
      requiresUserConfirmation: true,
    },
    swiggyRoutes: routes,
    selectedRouteId,
    nextActions: [
      `Ask the user to confirm "${detected.label}" before calling Swiggy search tools.`,
      selectedRouteId === "instamart_ingredient_rescue"
        ? "Search Instamart products and variants for cook-at-home ingredients."
        : "Search Food menus and restaurants for the confirmed dish label.",
      "Keep cart, checkout, order, and booking actions locked behind explicit confirmation.",
    ],
    telemetry: [
      { field: "visual_intent", value: input.intent, redaction: "safe enum" },
      { field: "detected_label", value: detected.label, redaction: "user-confirmed text only" },
      { field: "image_name", value: input.imageName ? "present" : "not provided", redaction: "do not log raw filename in production" },
      { field: "raw_image_retained", value: "false", redaction: "hard-coded privacy invariant" },
    ],
    assertions: [
      "No raw image bytes are accepted or retained by this API.",
      "The detected dish remains a suggestion until the user confirms it.",
      "The selected Swiggy route is read-first and commerce-locked.",
    ],
  };
}
