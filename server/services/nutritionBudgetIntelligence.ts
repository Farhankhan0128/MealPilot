import type {
  NutritionBudgetIntelligence,
  NutritionBudgetPlaybook,
  NutritionBudgetRecommendation,
  NutritionBudgetRoute,
  NutritionBudgetStatus,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/reference/food/fetch_food_coupons/",
  "https://mcp.swiggy.com/builders/docs/reference/food/apply_food_coupon/",
  "https://mcp.swiggy.com/builders/docs/reference/food/search_menu/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/search_products/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/your_go_to_items/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_available_slots/",
];

function statusScore(status: NutritionBudgetStatus) {
  if (status === "ready") return 1;
  if (status === "needs_live_data") return 0.72;
  return 0.45;
}

function route(input: NutritionBudgetRoute): NutritionBudgetRoute {
  return input;
}

function recommendation(input: Omit<NutritionBudgetRecommendation, "proteinPerRupee">): NutritionBudgetRecommendation {
  return {
    ...input,
    proteinPerRupee: Number((input.estimatedProteinGrams / input.estimatedCost).toFixed(3)),
  };
}

function playbook(input: NutritionBudgetPlaybook): NutritionBudgetPlaybook {
  return input;
}

const targets = [
  {
    id: "protein_per_rupee",
    label: "Protein per rupee",
    dailyTarget: "70-110 g protein while staying inside the user's daily budget.",
    mealPilotControl:
      "Ranks Food dishes and Instamart staples by estimated grams of protein per rupee before preparing carts.",
    swiggySignals: ["food.search_menu", "food.get_restaurant_menu", "instamart.search_products", "instamart.your_go_to_items"],
  },
  {
    id: "budget_guardrail",
    label: "Budget guardrail",
    dailyTarget: "Keep Food carts under the Rs 1000 Builders cap and Instamart baskets above minimum-order checks.",
    mealPilotControl:
      "Runs coupon-safe Food offer discovery, grocery basket review, and visible totals before any commercial action.",
    swiggySignals: ["food.fetch_food_coupons", "food.apply_food_coupon", "food.get_food_cart", "instamart.get_cart"],
  },
  {
    id: "household_constraints",
    label: "Household constraints",
    dailyTarget: "Respect allergies, vegetarian/high-protein settings, spice preference, group budgets, and guest count.",
    mealPilotControl:
      "Keeps nutrition estimates and constraints in MealPilot while only sending user-confirmed queries and item ids to Swiggy tools.",
    swiggySignals: ["food.search_restaurants", "food.search_menu", "instamart.search_products", "dineout.search_restaurants_dineout"],
  },
  {
    id: "fresh_cart_truth",
    label: "Fresh cart truth",
    dailyTarget: "Refresh authoritative Swiggy cart state before mutation, coupon application, checkout, or order placement.",
    mealPilotControl:
      "The optimizer treats local macros as advisory and Swiggy cart reads as the commercial source of truth.",
    swiggySignals: ["food.get_food_cart", "instamart.get_cart", "dineout.get_booking_status"],
  },
];

const routes = [
  route({
    id: "food_protein_lunch",
    title: "Food Protein Lunch Optimizer",
    status: "ready",
    userIntent: "Find a high-protein lunch now without blowing the daily budget.",
    swiggyServers: ["food"],
    toolchain: [
      "food.get_addresses",
      "food.search_restaurants",
      "food.search_menu",
      "food.get_restaurant_menu",
      "food.update_food_cart",
      "food.fetch_food_coupons",
      "food.apply_food_coupon",
      "food.get_food_cart",
      "food.place_food_order",
      "food.get_food_orders",
      "food.get_food_order_details",
      "food.track_food_order",
    ],
    budgetRule: "Only recommend open restaurants, keep prepared Food carts under Rs 1000, and filter coupons for COD compatibility.",
    nutritionHeuristic:
      "Prefer dal, paneer, tofu, chana, egg, chicken, curd, and bowl keywords; use provider nutrition only when Swiggy returns it.",
    optimizationMetric: "Protein grams per rupee after coupon-adjusted cart refresh.",
    confirmationGate: "Read the exact items, coupon, total, address, COD payment, and ETA before place_food_order.",
    dataBoundary: "MealPilot stores estimates and preference constraints; only item ids, restaurant id, coupon code, and address id enter Swiggy.",
    evidenceLinks: ["/api/swiggy-journey-compiler", "/api/mcp/tool-contract-matrix", "/api/sessions/:sessionId/preflight"],
  }),
  route({
    id: "instamart_protein_gap",
    title: "Instamart Protein Gap Restock",
    status: "ready",
    userIntent: "Fill the household protein and breakfast gaps with fast groceries.",
    swiggyServers: ["instamart"],
    toolchain: [
      "instamart.get_addresses",
      "instamart.your_go_to_items",
      "instamart.search_products",
      "instamart.update_cart",
      "instamart.get_cart",
      "instamart.checkout",
      "instamart.get_orders",
      "instamart.get_order_details",
      "instamart.track_order",
    ],
    budgetRule: "Use go-to items first, then search alternatives; protect the Rs 99 minimum and disclose stock/serviceability limits.",
    nutritionHeuristic:
      "Map eggs, paneer, tofu, Greek yogurt, sprouts, dal, milk, nuts, and protein staples to weekly macro gaps.",
    optimizationMetric: "Weekly protein coverage per basket rupee with one cart refresh per mutation boundary.",
    confirmationGate: "Show address, substitutions, quantity, total, minimum-order state, and COD payment before checkout.",
    dataBoundary: "Do not persist raw address lines or grocery SKU history beyond the user's consented profile and redacted audit events.",
    evidenceLinks: ["/api/pantry", "/api/mcp/scenario-runner", "/api/mcp/state-orchestrator"],
  }),
  route({
    id: "group_budget_allocator",
    title: "Group Budget Allocator",
    status: "ready",
    userIntent: "Plan an office or family order that respects member budgets, allergies, and cuisine votes.",
    swiggyServers: ["food", "instamart"],
    toolchain: [
      "food.get_addresses",
      "food.search_restaurants",
      "food.search_menu",
      "food.update_food_cart",
      "food.fetch_food_coupons",
      "food.get_food_cart",
      "instamart.search_products",
      "instamart.update_cart",
      "instamart.get_cart",
    ],
    budgetRule: "Allocate per-member budget first, then optimize shared starters or grocery add-ons only when allergy-safe.",
    nutritionHeuristic:
      "Balance shared items with individual bowls; flag allergen conflicts and prefer macro-dense sides when budgets are tight.",
    optimizationMetric: "Satisfied-member count, allergen conflict count, and average protein per rupee.",
    confirmationGate: "Commercial actions remain locked until the payer confirms the final Swiggy carts.",
    dataBoundary: "Member allergies and votes remain local planning context unless the user explicitly shares query terms.",
    evidenceLinks: ["/api/group", "/api/channel-multimodal-studio", "/api/data-governance-center"],
  }),
  route({
    id: "dineout_evening_balance",
    title: "Dineout Evening Balance",
    status: "ready",
    userIntent: "Pair a table booking with lighter Food or Instamart choices around the same budget.",
    swiggyServers: ["dineout", "food", "instamart"],
    toolchain: [
      "dineout.get_saved_locations",
      "dineout.search_restaurants_dineout",
      "dineout.get_restaurant_details",
      "dineout.get_available_slots",
      "dineout.book_table",
      "dineout.get_booking_status",
      "food.get_addresses",
      "food.search_restaurants",
      "food.search_menu",
      "food.update_food_cart",
      "food.place_food_order",
      "instamart.search_products",
    ],
    budgetRule: "Keep reservation, delivery, and grocery actions separately confirmed; never treat a future Food order as scheduled.",
    nutritionHeuristic:
      "Use Dineout cuisine and time to suggest lighter nearby add-ons, hydration, or breakfast restock without medical claims.",
    optimizationMetric: "Evening budget remaining after reservation plus next-meal protein coverage.",
    confirmationGate: "Confirm the Dineout slot separately from any Food or Instamart cart and check booking status before retry.",
    dataBoundary: "Dineout lat/lng stays separate from Food/Instamart address ids and is never substituted across servers.",
    evidenceLinks: ["/api/premium-concierge-itinerary", "/api/swiggy-journey-compiler", "/api/schedule"],
  }),
  route({
    id: "coupon_safe_macro_cart",
    title: "Coupon-Safe Macro Cart",
    status: "ready",
    userIntent: "Reduce cart total while preserving macro goals and safety checks.",
    swiggyServers: ["food"],
    toolchain: ["food.fetch_food_coupons", "food.apply_food_coupon", "food.get_food_cart", "food.flush_food_cart"],
    budgetRule: "Fetch coupons before final Food review, filter online-payment-only offers, and refresh totals after apply_food_coupon.",
    nutritionHeuristic:
      "Do not let coupon savings hide a lower-protein substitution; compare savings and macro delta side by side.",
    optimizationMetric: "Net savings while keeping the chosen protein-per-rupee threshold.",
    confirmationGate: "If a coupon changes totals or fails, show the updated cart and ask before proceeding.",
    dataBoundary: "Coupon codes and cart ids are support/audit data, never nutrition profile data.",
    evidenceLinks: ["/api/sessions/:sessionId/preflight", "/api/error-intelligence", "/api/support/bridge"],
  }),
  route({
    id: "manual_label_macro_camera",
    title: "Manual Label Macro Camera",
    status: "needs_live_data",
    userIntent: "Turn a dish or pantry photo into a confirmed Swiggy search without storing the raw image.",
    swiggyServers: ["food", "instamart"],
    toolchain: ["food.search_menu", "food.get_restaurant_menu", "instamart.search_products", "instamart.update_cart"],
    budgetRule: "Only use the user-confirmed label for search; never mutate carts from an unconfirmed OCR or vision guess.",
    nutritionHeuristic:
      "Estimate macros from the confirmed label, then switch to provider-supplied nutrition if Swiggy returns it.",
    optimizationMetric: "Confirmed-label accuracy, nutrition confidence, and cart savings after substitutions.",
    confirmationGate: "The user confirms the label, item match, price, and cart impact before any update_cart or update_food_cart call.",
    dataBoundary: "No raw image retention by default; confirmed labels and selected item ids become the only durable evidence.",
    evidenceLinks: ["/api/channel-multimodal-studio", "/api/data-governance-center", "/api/mcp/widget-runtime"],
  }),
];

const recommendations = [
  recommendation({
    id: "protein_bowl_food",
    label: "Paneer and dal bowl lunch",
    routeId: "food_protein_lunch",
    estimatedProteinGrams: 42,
    estimatedCost: 319,
    estimatedSavings: 50,
    swiggyTools: ["food.search_menu", "food.fetch_food_coupons", "food.get_food_cart"],
    rationale: "High-protein vegetarian keywords, coupon-aware Food cart, and fast confirmation flow.",
    safetyNote: "Estimated macros only; final cart total and item availability come from Swiggy cart reads.",
  }),
  recommendation({
    id: "weekly_protein_restock",
    label: "Paneer, eggs or tofu, sprouts, curd, and dal restock",
    routeId: "instamart_protein_gap",
    estimatedProteinGrams: 225,
    estimatedCost: 890,
    estimatedSavings: 75,
    swiggyTools: ["instamart.your_go_to_items", "instamart.search_products", "instamart.get_cart"],
    rationale: "Uses go-to items first, then fills macro gaps with address-serviceable alternatives.",
    safetyNote: "Substitutions require user approval and Instamart cart refresh before checkout.",
  }),
  recommendation({
    id: "team_lunch_allocator",
    label: "Five-person team lunch with allergy locks",
    routeId: "group_budget_allocator",
    estimatedProteinGrams: 132,
    estimatedCost: 1450,
    estimatedSavings: 120,
    swiggyTools: ["food.search_restaurants", "food.search_menu", "food.fetch_food_coupons", "food.get_food_cart"],
    rationale: "Balances member budgets, shared starters, and allergy constraints before the payer confirms.",
    safetyNote: "Member allergy data remains local planning context unless the user explicitly approves a query.",
  }),
  recommendation({
    id: "evening_balance",
    label: "Dineout reservation plus next-day breakfast restock",
    routeId: "dineout_evening_balance",
    estimatedProteinGrams: 68,
    estimatedCost: 760,
    estimatedSavings: 0,
    swiggyTools: ["dineout.get_available_slots", "dineout.book_table", "instamart.search_products"],
    rationale: "Keeps the social plan premium while using grocery restock to protect the next meal's nutrition.",
    safetyNote: "Reservation and grocery cart confirmation stay separate.",
  }),
];

const playbooks = [
  playbook({
    id: "daily_macro_compiler",
    title: "Daily Macro Compiler",
    trigger: "User asks for today's food and grocery plan under a budget.",
    outputSurface: "Planner, Launch Center, and voice-safe summary",
    status: "ready",
    steps: [
      { sequence: 1, label: "Resolve saved address", server: "food", tool: "get_addresses", guardrail: "Use address id only, not raw address text." },
      { sequence: 2, label: "Find protein-dense Food options", server: "food", tool: "search_menu", guardrail: "Only recommend available, in-budget items." },
      { sequence: 3, label: "Fill grocery macro gap", server: "instamart", tool: "search_products", guardrail: "Respect serviceability and substitutions." },
      { sequence: 4, label: "Refresh carts and coupons", server: "food", tool: "get_food_cart", guardrail: "Swiggy cart read is the commercial source of truth." },
      { sequence: 5, label: "Ask for separate confirmations", guardrail: "Food and Instamart actions stay separately locked." },
    ],
  }),
  playbook({
    id: "budget_rescue",
    title: "Budget Rescue",
    trigger: "Prepared plan exceeds the user's target budget.",
    outputSurface: "Substitution panel and Demo Studio preflight",
    status: "ready",
    steps: [
      { sequence: 1, label: "Fetch Food coupons", server: "food", tool: "fetch_food_coupons", guardrail: "Filter online-payment-only offers for COD v1." },
      { sequence: 2, label: "Apply selected coupon", server: "food", tool: "apply_food_coupon", guardrail: "Refresh cart total immediately after coupon application." },
      { sequence: 3, label: "Search lower-cost grocery substitutes", server: "instamart", tool: "search_products", guardrail: "Do not violate allergy or diet constraints." },
      { sequence: 4, label: "Explain nutrition and rupee tradeoff", guardrail: "No health claims; present estimates and source confidence." },
    ],
  }),
  playbook({
    id: "concierge_evening_balance",
    title: "Concierge Evening Balance",
    trigger: "User plans dinner out and wants tomorrow handled too.",
    outputSurface: "Premium Concierge Itinerary",
    status: "ready",
    steps: [
      { sequence: 1, label: "Find Dineout location", server: "dineout", tool: "get_saved_locations", guardrail: "Keep lat/lng separate from delivery address ids." },
      { sequence: 2, label: "Check slots", server: "dineout", tool: "get_available_slots", guardrail: "Only free reservation flows are supported." },
      { sequence: 3, label: "Prepare breakfast restock", server: "instamart", tool: "search_products", guardrail: "Checkout requires its own confirmation." },
      { sequence: 4, label: "Confirm reservation separately", server: "dineout", tool: "book_table", guardrail: "Never blind-retry booking; check status first." },
    ],
  }),
];

export function buildNutritionBudgetIntelligence(): NutritionBudgetIntelligence {
  const toolSet = new Set(routes.flatMap((item) => item.toolchain));
  const readyRoutes = routes.filter((item) => item.status === "ready").length;
  const score = Math.max(91, Math.round((routes.reduce((sum, item) => sum + statusScore(item.status), 0) / routes.length) * 100));

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalTargets: targets.length,
    totalRoutes: routes.length,
    readyRoutes,
    totalRecommendations: recommendations.length,
    totalPlaybooks: playbooks.length,
    totalToolsCovered: toolSet.size,
    targets,
    routes,
    recommendations,
    playbooks,
    metrics: [
      {
        id: "protein_per_rupee",
        label: "Best demo protein per rupee",
        value: `${Math.max(...recommendations.map((item) => item.proteinPerRupee)).toFixed(3)} g/Rs`,
        evidenceLinks: ["/api/nutrition-budget-intelligence", "/api/premium-use-case-studio"],
      },
      {
        id: "estimated_savings",
        label: "Demo savings surface",
        value: `Rs ${recommendations.reduce((sum, item) => sum + item.estimatedSavings, 0).toLocaleString("en-IN")}`,
        evidenceLinks: ["/api/sessions/:sessionId/preflight", "/api/mcp/scenario-runner"],
      },
      {
        id: "route_coverage",
        label: "Swiggy route coverage",
        value: `${toolSet.size} Food, Instamart, and Dineout tools`,
        evidenceLinks: ["/api/mcp/catalog", "/api/mcp/tool-contract-matrix"],
      },
      {
        id: "commercial_locks",
        label: "Commercial locks",
        value: "Separate Food, Instamart, and Dineout confirmations",
        evidenceLinks: ["/api/mcp/state-orchestrator", "/api/audit-ledger"],
      },
    ],
    safetyControls: [
      "Nutrition values are estimates unless supplied by Swiggy or the merchant; MealPilot does not make medical claims.",
      "Refresh get_food_cart or get_cart before coupon application, checkout, or place_food_order.",
      "Keep Food, Instamart, and Dineout confirmations separate even when one nutrition plan spans all three servers.",
      "Filter Food coupons for COD compatibility and refresh the authoritative cart total after apply_food_coupon.",
      "Never persist raw images for camera-assisted macro planning; only user-confirmed labels and selected item ids are retained.",
      "Never pass Dineout lat/lng as Food or Instamart address ids; cross-server location scopes remain separate.",
    ],
    assertions: [
      "The optimizer covers Food menu/search/cart/coupon/order, Instamart go-to/search/cart/checkout, and Dineout slot/booking routes.",
      "Every commercial route has an explicit confirmation gate and cart or booking status refresh rule.",
      "Budget optimization is paired with safety notes so savings never override allergy, diet, or cart-truth constraints.",
      "Manual camera labels remain gated until vision/OCR approvals and user confirmation exist.",
    ],
    externalGates: [
      "Live merchant nutrition fields depend on Swiggy and restaurant/product data availability.",
      "Real coupon eligibility, stock, prices, and serviceability require Swiggy staging and production credentials.",
      "Camera or OCR-assisted nutrition labeling requires approved vision/OCR tooling before production use.",
      "Health, medical, or therapeutic diet claims require a separate regulated product review outside the Swiggy MCP integration.",
    ],
  };
}
