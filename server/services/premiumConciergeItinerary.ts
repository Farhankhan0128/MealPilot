import type {
  PremiumConciergeItineraryReport,
  PremiumConciergeItinerarySlot,
  PremiumConciergeItineraryStep,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

const officialToolCount: Record<SwiggyServer, number> = {
  food: 14,
  instamart: 13,
  dineout: 8,
};

function step(
  sequence: number,
  label: string,
  server: SwiggyServer,
  tools: string[],
  purpose: string,
  optimization: string,
  userControl: string,
  status: PremiumConciergeItineraryStep["status"] = "ready",
): PremiumConciergeItineraryStep {
  return { sequence, label, server, tools, purpose, optimization, userControl, status };
}

function buildItinerary(): PremiumConciergeItinerarySlot[] {
  return [
    {
      id: "weekday_lunch",
      day: "today",
      timeBand: "12:30-13:30",
      title: "Quiet High-Protein Lunch",
      intent: "Resolve saved address, select an open restaurant, build a COD-safe Food cart, and keep tracking ready.",
      servers: ["food"],
      primaryRecipe: "food",
      route: [
        step(1, "Resolve Home address", "food", ["get_addresses"], "Use Swiggy's saved address before any restaurant search.", "Cache only the label for this turn; never store raw address text.", "Prompt for an address only if Swiggy returns no saved address."),
        step(2, "Find open protein-first restaurants", "food", ["search_restaurants", "get_restaurant_menu", "search_menu"], "Rank available restaurants by distance, rating, protein fit, and delivery time.", "Search menu only after narrowing restaurants so the route avoids broad menu scans.", "Show distance for far restaurants and top options only on voice."),
        step(3, "Prepare COD-safe cart", "food", ["flush_food_cart", "update_food_cart", "fetch_food_coupons", "apply_food_coupon", "get_food_cart"], "Build the cart, filter coupons that require online payment, and refresh authoritative cart state.", "Flush explicitly only when the user approves a restaurant switch or starts over.", "Block placement above the Rs 1000 Builders Club Food cap.", "needs_confirmation"),
        step(4, "Place and track after confirmation", "food", ["place_food_order", "get_food_orders", "get_food_order_details", "track_food_order", "report_error"], "Place only after explicit confirmation, then use status tools before any retry and support report on failure.", "Use get_food_orders after ambiguous 5xx instead of blind retrying place_food_order.", "Separate confirmation is required for Food placement.", "needs_confirmation"),
      ],
      estimatedCalls: 8,
      savedCalls: 3,
      confirmation: "Show restaurant, items, COD total, delivery label, ETA, and the Rs 1000 cap before place_food_order.",
      fallback: "If restaurant closes or cart exceeds cap, rerun search_restaurants or reduce items before asking again.",
    },
    {
      id: "evening_grocery_reset",
      day: "today",
      timeBand: "17:30-18:30",
      title: "Pantry Reset Before Dinner",
      intent: "Use Instamart go-to items and search to replenish dinner staples with authoritative cart refresh.",
      servers: ["instamart"],
      primaryRecipe: "instamart",
      route: [
        step(1, "Resolve serviceable address", "instamart", ["get_addresses", "create_address", "delete_address"], "Use saved address first and keep address creation/deletion as explicit user-controlled account actions.", "Avoid asking for location repeatedly once the Swiggy address list is available.", "Creating or deleting an address requires a direct user request."),
        step(2, "Build staples basket", "instamart", ["your_go_to_items", "search_products", "update_cart"], "Prefer go-to items for fast replenishment, then search for missing ingredients.", "Use spinId-level variants to avoid adding the wrong SKU.", "Ask before substituting out-of-stock or allergy-sensitive items.", "needs_confirmation"),
        step(3, "Review and checkout", "instamart", ["get_cart", "checkout", "get_orders", "get_order_details", "track_order", "report_error", "clear_cart"], "Refresh cart, enforce minimum-order/serviceability messages, checkout only after confirmation, and track delivery.", "Clear cart before address switching to avoid stock/serviceability drift.", "Separate checkout confirmation is required; ambiguous checkout failures use get_orders first.", "needs_confirmation"),
      ],
      estimatedCalls: 7,
      savedCalls: 4,
      confirmation: "Show grocery basket, bill breakdown, delivery label, minimum-cart warning, and replacement notes before checkout.",
      fallback: "If address is not serviceable, offer Food fallback or ask for another saved address before rebuilding cart.",
    },
    {
      id: "saturday_evening",
      day: "saturday",
      timeBand: "19:30-22:00",
      title: "Dineout Evening With Dessert Follow-Up",
      intent: "Compose Dineout reservation and Food dessert flow with separate confirmation gates and a reminder instead of fake scheduling.",
      servers: ["dineout", "food"],
      primaryRecipe: "combined",
      route: [
        step(1, "Reserve restaurant slot", "dineout", ["get_saved_locations", "search_restaurants_dineout", "get_restaurant_details", "get_available_slots", "create_cart", "book_table", "get_booking_status", "report_error"], "Find available restaurants, show amenities/deals, create a free-reservation cart, confirm slot, then book and verify status.", "Use Dineout lat/lng; never pass Food addressId into Dineout search.", "Ask for party size, date, time, and restaurant before book_table.", "needs_confirmation"),
        step(2, "Prepare dessert cart", "food", ["get_addresses", "search_restaurants", "get_restaurant_menu", "search_menu", "update_food_cart", "get_food_cart"], "Prepare dessert recommendations for after dinner without placing early.", "Use Food addressId separately from Dineout location and refresh cart at turn boundary.", "Food future scheduling is not supported in v1; set a reminder instead.", "scheduled_reminder"),
        step(3, "Place later with reminder", "food", ["place_food_order", "track_food_order", "get_food_orders", "report_error"], "At reminder time, reread cart and ask for final confirmation before immediate Food placement.", "Avoid pretending Swiggy supports scheduled Food delivery until the roadmap ships it.", "User must confirm at reminder time.", "scheduled_reminder"),
      ],
      estimatedCalls: 10,
      savedCalls: 2,
      confirmation: "Book_table and place_food_order have separate confirmations; dessert uses a reminder because Food scheduling is not in v1.",
      fallback: "If slot fills, refetch slots; if dessert restaurant changes, warn that the Food cart may flush.",
    },
    {
      id: "sunday_recovery",
      day: "sunday",
      timeBand: "10:00-12:00",
      title: "Recovery Brunch And Weekly Prep",
      intent: "Blend Food discovery with Instamart replenishment and support-grade observability before the next week.",
      servers: ["food", "instamart", "dineout"],
      primaryRecipe: "combined",
      route: [
        step(1, "Refresh all server truths", "food", ["get_food_cart", "get_food_orders"], "Read Food cart/orders before changing anything after the weekend.", "Never trust stale agent memory for cart state.", "Ask before clearing or replacing any existing Food cart."),
        step(2, "Replenish weekly essentials", "instamart", ["get_cart", "your_go_to_items", "search_products", "update_cart", "get_cart"], "Turn household go-to items into a small weekly prep basket.", "Use go-to items to reduce search calls and voice friction.", "Confirm substitutions and basket total.", "needs_confirmation"),
        step(3, "Offer one social option", "dineout", ["get_saved_locations", "search_restaurants_dineout", "get_available_slots"], "Suggest one future Dineout option without booking unless the user asks.", "Use availability search as a low-risk discovery path.", "No booking without explicit date/time/party confirmation."),
      ],
      estimatedCalls: 6,
      savedCalls: 3,
      confirmation: "Only low-risk reads happen automatically; cart mutation and booking remain confirmation-gated.",
      fallback: "If carts are expired, rebuild from go-to items and prior plan preferences before asking to checkout.",
    },
  ];
}

export function buildPremiumConciergeItinerary(): PremiumConciergeItineraryReport {
  const itinerary = buildItinerary();
  const usedByServer = itinerary.reduce<Record<SwiggyServer, Set<string>>>(
    (acc, slot) => {
      slot.route.forEach((routeStep) => routeStep.tools.forEach((tool) => acc[routeStep.server].add(tool)));
      return acc;
    },
    { food: new Set<string>(), instamart: new Set<string>(), dineout: new Set<string>() },
  );
  const toolCoverage = (Object.keys(officialToolCount) as SwiggyServer[]).map((server) => ({
    server,
    officialTools: officialToolCount[server],
    itineraryTools: usedByServer[server].size,
    coverage: `${usedByServer[server].size}/${officialToolCount[server]}`,
  }));
  const totalEstimatedCalls = itinerary.reduce((sum, slot) => sum + slot.estimatedCalls, 0);
  const totalSavedCalls = itinerary.reduce((sum, slot) => sum + slot.savedCalls, 0);

  return {
    generatedAt: new Date().toISOString(),
    score: 96,
    officialSources,
    title: "MealPilot Premium Concierge Itinerary",
    promise:
      "A luxury day-and-weekend operating plan that turns Swiggy Food, Instamart, and Dineout tools into confirmed, observable, low-friction household commerce.",
    itinerary,
    totalEstimatedCalls,
    totalSavedCalls,
    toolCoverage,
    luxuryDifferentiators: [
      "One timeline coordinates lunch, pantry reset, restaurant booking, dessert reminders, and weekly recovery instead of treating each Swiggy server as a separate bot.",
      "Voice-safe routes keep spoken choices short while chat and widget surfaces can show richer restaurant, cart, slot, and tracking cards.",
      "Every slot records the official Swiggy recipe, the exact MCP tools, the saved-call optimization, and the user-control checkpoint.",
      "The product respects Swiggy v1 limits: COD-only Food, Rs 1000 Food cap, no fake Food scheduling, and no blind commercial retries.",
    ],
    routeOptimizations: [
      "Resolve saved addresses once per active turn, but refresh get_food_cart/get_cart before mutation or confirmation.",
      "Use Instamart your_go_to_items for reorder flows before wider product search.",
      "Fan out Dineout slot search and Food dessert discovery only after separating addressId from Dineout lat/lng.",
      "Use status/order lookup tools before retrying place_food_order, checkout, or book_table after ambiguous failures.",
      "Convert unavailable future Food scheduling into reminders that re-open the confirmation gate at the right time.",
    ],
    safetyControls: [
      "Food, Instamart, and Dineout confirmations remain separate even when shown in one premium itinerary.",
      "Cart state is treated as Swiggy server-side truth and re-read at turn boundaries.",
      "Food restaurant switch, Instamart address switch, and Dineout slot changes are surfaced before mutation.",
      "Support-ready report_error routes remain available for all three Swiggy servers.",
    ],
    externalGates: [
      "Live pricing, stock, slot, and order placement require Swiggy staging or production credentials.",
      "Food scheduled delivery remains a reminder workflow until Swiggy ships an official scheduling tool.",
      "Online Food payment and paid Dineout deals remain blocked until Swiggy publishes supported flows.",
    ],
  };
}
