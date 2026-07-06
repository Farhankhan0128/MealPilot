import type {
  MealPlan,
  SwiggyServer,
  SwiggyServerStateModel,
  SwiggyStateOrchestratorReport,
  SwiggyStateScenario,
  SwiggySurfaceContract,
  SwiggyTurnBoundaryGuard,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
];

function guard(
  sequence: number,
  server: SwiggyServer,
  turn: string,
  userIntent: string,
  requiredRefreshTool: string,
  nextTool: string,
  guardrail: string,
  evidenceLinks: string[],
  status: SwiggyTurnBoundaryGuard["status"] = "ready",
): SwiggyTurnBoundaryGuard {
  return {
    sequence,
    server,
    turn,
    userIntent,
    requiredRefreshTool,
    nextTool,
    guardrail,
    status,
    evidenceLinks,
  };
}

function buildServerModels(): SwiggyServerStateModel[] {
  return [
    {
      server: "food",
      authoritativeReads: ["get_food_cart", "get_food_orders", "get_food_order_details", "track_food_order"],
      mutations: ["flush_food_cart", "update_food_cart", "fetch_food_coupons", "apply_food_coupon"],
      commercialAction: "place_food_order",
      switchGuard: "Food cart binds to one restaurant; warn the user before a restaurant switch flushes the current cart.",
      staleStateRecovery:
        "If cart state is stale or a 5xx follows placement, call get_food_orders/get_food_order_details before any repeat place_food_order attempt.",
      userVisiblePromise: "MealPilot reads the Swiggy cart truth before every add, coupon, total review, and COD placement.",
    },
    {
      server: "instamart",
      authoritativeReads: ["get_cart", "get_orders", "get_order_details", "track_order", "your_go_to_items"],
      mutations: ["create_address", "delete_address", "clear_cart", "update_cart"],
      commercialAction: "checkout",
      switchGuard: "Instamart cart is address-scoped; clear the cart before changing address to avoid stock and serviceability drift.",
      staleStateRecovery:
        "If checkout is uncertain, call get_orders/get_order_details before retrying and rebuild the cart from spinId-level product truth.",
      userVisiblePromise: "MealPilot re-reads cart, minimum order, address, and product variants before grocery checkout.",
    },
    {
      server: "dineout",
      authoritativeReads: ["get_saved_locations", "get_restaurant_details", "get_available_slots", "get_booking_status"],
      mutations: ["create_cart"],
      commercialAction: "book_table",
      switchGuard: "Dineout uses lat/lng and slot freshness, not Food addressId; re-check slots before booking.",
      staleStateRecovery:
        "If booking result is uncertain, call get_booking_status before asking for another booking confirmation.",
      userVisiblePromise: "MealPilot confirms restaurant, date, time, and party size from fresh slot data before book_table.",
    },
  ];
}

function buildScenarios(latestPlan?: MealPlan): SwiggyStateScenario[] {
  const sessionEvidence = latestPlan ? `/api/sessions/${latestPlan.id}/replay` : "/api/sessions/:sessionId/replay";
  return [
    {
      id: "food_quantity_followup",
      title: "Food Quantity Follow-Up",
      officialPattern: "Refresh get_food_cart at the start of every cart-touching turn and before place_food_order.",
      servers: ["food"],
      userStory: "User adds one dish, later says make it two, then asks to place the order.",
      turnBoundaries: [
        guard(1, "food", "Turn 1", "Add paneer bowl", "get_food_cart", "update_food_cart", "Read current Food cart before setting item quantity.", ["/api/mcp/scenario-runner", sessionEvidence]),
        guard(2, "food", "Turn 2", "Make it two", "get_food_cart", "update_food_cart", "Do not trust remembered quantity; set quantity from server cart truth.", ["/api/mcp/tool-contract-matrix", sessionEvidence]),
        guard(3, "food", "Turn 3", "Place the order", "get_food_cart", "place_food_order", "Confirm current cart total, COD, ETA, and Rs 1000 cap before placement.", ["/api/sessions/:sessionId/preflight", "/api/resilience"], "needs_confirmation"),
      ],
      unsafeMemoryRejected: true,
      confirmationCopy: {
        chat: "Confirm Food order? Paneer bowl x2, refreshed total shown, cash on delivery. Reply yes to place.",
        voice: "Two paneer bowls, refreshed total, cash on delivery. Say confirm to place.",
      },
      recoveryPolicy: "After ambiguous placement, read get_food_orders and get_food_order_details before retrying.",
    },
    {
      id: "food_restaurant_switch",
      title: "Food Restaurant Switch Guard",
      officialPattern: "Warn before a Food restaurant switch clears the current restaurant-bound cart.",
      servers: ["food"],
      userStory: "User has Biryani House items and asks to add dessert from a different restaurant.",
      turnBoundaries: [
        guard(1, "food", "Switch check", "Add dessert from another restaurant", "get_food_cart", "flush_food_cart", "Surface the existing cart and ask before flushing it.", ["/api/mcp/scenario-runner", "/api/swiggy-journey-compiler"], "needs_confirmation"),
        guard(2, "food", "Rebuild", "User approves switch", "get_restaurant_menu", "update_food_cart", "Rebuild from the new restaurant menu after explicit approval.", ["/api/mcp/tool-lab"]),
      ],
      unsafeMemoryRejected: true,
      confirmationCopy: {
        chat: "This clears your current Food cart. Continue with the new restaurant?",
        voice: "That will clear your current Food cart. Should I continue?",
      },
      recoveryPolicy: "If the user declines, keep the current cart untouched and offer same-restaurant alternatives.",
    },
    {
      id: "instamart_address_switch",
      title: "Instamart Address Switch Guard",
      officialPattern: "Clear Instamart cart before address switches because stock and serviceability are address-scoped.",
      servers: ["instamart"],
      userStory: "User builds groceries for Home, then asks to deliver them to Office.",
      turnBoundaries: [
        guard(1, "instamart", "Address check", "Switch grocery address", "get_cart", "clear_cart", "Show current cart and warn that address switch may affect stock.", ["/api/mcp/scenario-runner"], "needs_confirmation"),
        guard(2, "instamart", "Re-search", "User approves address switch", "search_products", "update_cart", "Search products again at the new address and use spinId from fresh results.", ["/api/mcp/tool-contract-matrix"]),
        guard(3, "instamart", "Checkout", "Checkout groceries", "get_cart", "checkout", "Review minimum order, cart total, and serviceability before checkout.", ["/api/sessions/:sessionId/preflight"], "needs_confirmation"),
      ],
      unsafeMemoryRejected: true,
      confirmationCopy: {
        chat: "Switching address may clear the Instamart cart. Rebuild for Office and checkout after review?",
        voice: "Switching to Office can change stock. Should I clear and rebuild the cart?",
      },
      recoveryPolicy: "After uncertain checkout, call get_orders/get_order_details before retrying checkout.",
    },
    {
      id: "dineout_slot_refresh",
      title: "Dineout Slot Refresh",
      officialPattern: "Dineout reservations depend on fresh lat/lng and available slots, not stale addressId or remembered slot labels.",
      servers: ["dineout"],
      userStory: "User returns later to book a table from a previously suggested slot.",
      turnBoundaries: [
        guard(1, "dineout", "Location refresh", "Book earlier Dineout suggestion", "get_saved_locations", "search_restaurants_dineout", "Use saved lat/lng instead of Food addressId.", ["/api/mcp/scenario-runner"]),
        guard(2, "dineout", "Slot refresh", "Pick 7:45 PM", "get_available_slots", "create_cart", "Refresh slots before creating a free booking cart.", ["/api/swiggy-journey-compiler"]),
        guard(3, "dineout", "Booking", "Confirm table", "get_available_slots", "book_table", "Read back restaurant, date, time, guests, and free booking status.", ["/api/sessions/:sessionId/preflight"], "needs_confirmation"),
      ],
      unsafeMemoryRejected: true,
      confirmationCopy: {
        chat: "Confirm table for 4 at La Piazza at 7:45 PM? Free reservation, no payment.",
        voice: "Table for four at La Piazza, seven forty-five tonight, free reservation. Confirm?",
      },
      recoveryPolicy: "If booking is ambiguous, call get_booking_status before any second book_table attempt.",
    },
    {
      id: "combined_server_boundaries",
      title: "Combined Food + Dineout Boundaries",
      officialPattern: "Carts and orders are per-server; one OAuth session can cover all three, but tool state is not shared.",
      servers: ["dineout", "food"],
      userStory: "User plans dinner out and dessert delivery in one combined evening flow.",
      turnBoundaries: [
        guard(1, "dineout", "Reservation branch", "Reserve dinner", "get_available_slots", "book_table", "Keep reservation confirmation separate from Food dessert placement.", ["/api/mcp/scenario-runner"], "needs_confirmation"),
        guard(2, "food", "Dessert branch", "Prepare dessert delivery", "get_food_cart", "update_food_cart", "Use Food addressId and Food cart truth; do not pass Dineout lat/lng into Food tools.", ["/api/mcp/scenario-runner"]),
        guard(3, "food", "Future delivery", "Deliver dessert after dinner", "get_food_cart", "place_food_order", "Food v1 has no scheduling; create a reminder-time confirmation gate.", ["/api/premium-concierge-itinerary"], "external_gate"),
      ],
      unsafeMemoryRejected: true,
      confirmationCopy: {
        chat: "Dinner booking and dessert delivery need separate confirmations; dessert can be reminded later because Food v1 is immediate.",
        voice: "I'll confirm the table now and remind you later before placing dessert.",
      },
      recoveryPolicy: "Use Dineout booking status for reservations and Food order status for dessert; never cross-read orders between servers.",
    },
    {
      id: "abandoned_cart_recovery",
      title: "Abandoned Cart Recovery",
      officialPattern: "Carts have TTL; stale or expired carts should be re-fetched and rebuilt only after user review.",
      servers: ["food", "instamart"],
      userStory: "User returns after a long pause and asks to continue a previous cart.",
      turnBoundaries: [
        guard(1, "food", "Return after pause", "Continue previous Food cart", "get_food_cart", "search_menu", "If CART_EXPIRED or item drift appears, rebuild from fresh menu truth.", ["/api/error-intelligence", "/api/resilience"], "needs_confirmation"),
        guard(2, "instamart", "Return after pause", "Continue previous grocery cart", "get_cart", "search_products", "If stock changed, re-search products and ask before replacing variants.", ["/api/error-intelligence", "/api/resilience"], "needs_confirmation"),
      ],
      unsafeMemoryRejected: true,
      confirmationCopy: {
        chat: "Your cart may have changed while you were away. I refreshed it and need approval before rebuilding unavailable items.",
        voice: "I refreshed your cart because it may have changed. Want me to rebuild it?",
      },
      recoveryPolicy: "Never restore from agent memory alone; rebuild from current Swiggy menu/product responses.",
    },
  ];
}

function buildSurfaceContracts(): SwiggySurfaceContract[] {
  return [
    {
      surface: "voice",
      maxPresentedItems: 3,
      responseShape: "Speak the top choices, rupee totals, natural ETAs, and one explicit confirmation prompt.",
      forbiddenContent: ["raw addressId", "restaurantId", "spinId", "OAuth token", "long tables", "more than three choices"],
      preferredTools: ["your_go_to_items", "search_menu", "fetch_food_coupons", "track_food_order"],
      confirmationRule: "Read back total, delivery or booking context, and wait for a spoken confirmation before commercial actions.",
      widgetPolicy: "Do not render widgets on voice/TTS surfaces; use shortDescription and spoken timing fields.",
    },
    {
      surface: "chat",
      maxPresentedItems: 8,
      responseShape: "Show concise lists, markdown tables, rich cards, cart summaries, and inline confirmation prompts.",
      forbiddenContent: ["OAuth token", "raw internal ids unless needed for debugging", "unconfirmed commercial calls"],
      preferredTools: ["search_restaurants", "get_restaurant_menu", "search_products", "search_restaurants_dineout"],
      confirmationRule: "Ask for text confirmation with refreshed cart or booking details before place_food_order, checkout, or book_table.",
      widgetPolicy: "Use semantic widget contracts where available and fall back to data envelope rendering until hosted widgets ship.",
    },
  ];
}

export function buildSwiggyStateOrchestrator(latestPlan?: MealPlan): SwiggyStateOrchestratorReport {
  const scenarios = buildScenarios(latestPlan);
  const turnBoundaries = scenarios.flatMap((scenario) => scenario.turnBoundaries);
  const confirmationGateCount = turnBoundaries.filter((turn) => turn.status === "needs_confirmation").length;
  const refreshBeforeMutationCount = turnBoundaries.filter((turn) => turn.requiredRefreshTool !== turn.nextTool).length;
  const readyScore = turnBoundaries.reduce((sum, turn) => {
    if (turn.status === "ready") return sum + 1;
    if (turn.status === "needs_confirmation") return sum + 0.9;
    return sum + 0.75;
  }, 0);
  const score = Math.round((readyScore / turnBoundaries.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalScenarios: scenarios.length,
    totalTurnBoundaries: turnBoundaries.length,
    refreshBeforeMutationCount,
    confirmationGateCount,
    serverModels: buildServerModels(),
    scenarios,
    surfaceContracts: buildSurfaceContracts(),
    assertions: [
      "Every cart-touching turn starts with an authoritative Swiggy read instead of agent memory.",
      "Food restaurant switches, Instamart address switches, and Dineout stale slots are user-visible confirmation moments.",
      "Combined Food, Instamart, and Dineout sessions keep carts and order histories per server while sharing OAuth posture.",
      "Voice and chat surfaces differ in presentation limits, widget use, and spoken ID redaction, but both preserve commercial confirmation gates.",
    ],
    externalGates: [
      "Live CART_EXPIRED, stock drift, price drift, and slot race conditions require Swiggy staging seeded data to validate against real responses.",
      "Hosted Swiggy widget iframe URLs and X-Swiggy-Widgets opt-in remain planned by Swiggy; MealPilot uses semantic fallbacks until then.",
      "Future Food scheduling is still reminder-time confirmation because v1 Food placement is immediate.",
    ],
  };
}
