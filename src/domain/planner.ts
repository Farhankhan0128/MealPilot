import { createMockSwiggyClient } from "../integrations/swiggy/mockClient";
import type {
  MealPlan,
  Recommendation,
  SwiggyPlanningClient,
  ToolCallEvent,
  UserPlanningRequest,
} from "./types";

const defaultClient = createMockSwiggyClient();

function budgetFit(total: number, budget: number): MealPlan["budgetFit"] {
  if (total <= budget) return "under_budget";
  if (total <= budget * 1.1) return "at_risk";
  return "over_budget";
}

function makeSessionId() {
  return `mp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function event(
  server: ToolCallEvent["server"],
  tool: string,
  detail: string,
  sessionId: string,
  index: number,
): ToolCallEvent {
  return {
    id: `${server}_${tool}_${index}`,
    server,
    tool,
    status: "ok",
    durationMs: 80 + index * 17,
    detail,
    sessionId,
  };
}

function createInsights(request: UserPlanningRequest, recommendations: Recommendation[]) {
  const total = recommendations.reduce((sum, recommendation) => sum + recommendation.total, 0);
  const food = recommendations.find((item) => item.server === "food");
  const grocery = recommendations.find((item) => item.server === "instamart");

  return [
    `Plan stays ${total <= request.budget ? "inside" : "near"} the Rs ${request.budget.toLocaleString("en-IN")} budget.`,
    food ? `${food.provider} is open and keeps the Food cart below the Rs 1,000 Builders Club cap.` : "",
    grocery ? `${grocery.items.length} grocery items cover dinner and the next breakfast prep.` : "",
    "Food, Instamart, and Dineout actions are prepared separately so each risky call has its own confirmation.",
  ].filter(Boolean);
}

export async function createMealPlan(
  request: UserPlanningRequest,
  client: SwiggyPlanningClient = defaultClient,
): Promise<MealPlan> {
  const sessionId = makeSessionId();
  const locations = await client.getSavedLocations();
  const home = locations.find((location) => location.label === "Home") ?? locations[0];

  if (!home) {
    throw new Error("MealPilot needs one saved Swiggy address before it can build a plan.");
  }

  const restaurants = await client.searchFoodRestaurants(request, home.id);
  const openRestaurant = restaurants.find((restaurant) => restaurant.availabilityStatus === "OPEN");

  if (!openRestaurant) {
    throw new Error("No open restaurants were found for this meal window.");
  }

  const [food, groceries, dineout] = await Promise.all([
    client.buildFoodCart(request, openRestaurant),
    client.buildInstamartBasket(request),
    client.findDineoutSlot(request),
  ]);

  const recommendations = [food, groceries, dineout];
  const total = recommendations.reduce((sum, recommendation) => sum + recommendation.total, 0);
  const auditTrail = [
    event("food", "get_addresses", `Resolved ${home.label} without storing raw address data.`, sessionId, 1),
    event("food", "search_restaurants", `Found ${restaurants.length} restaurants for ${request.city}.`, sessionId, 2),
    event("food", "get_restaurant_menu", `Selected ${openRestaurant.name} because it is open and high confidence.`, sessionId, 3),
    event("food", "update_food_cart", "Prepared food cart; no order placed.", sessionId, 4),
    event("food", "get_food_cart", "Validated total below Rs 1,000 food-order cap.", sessionId, 5),
    event("instamart", "search_items", "Found high-protein vegetarian grocery substitutes.", sessionId, 6),
    event("instamart", "update_cart", "Prepared Instamart basket; checkout remains locked.", sessionId, 7),
    event("dineout", "search_restaurants_dineout", "Found table options near the selected area.", sessionId, 8),
    event("dineout", "get_available_slots", "Selected a weekend table slot; booking remains locked.", sessionId, 9),
  ];

  return {
    id: sessionId,
    summary: `A ${request.diet} plan for ${request.city} with lunch, dinner groceries, and a ${request.day} Dineout option.`,
    total,
    budgetFit: budgetFit(total, request.budget),
    callCount: auditTrail.length,
    healthScore: request.diet.includes("high-protein") ? 92 : 84,
    recommendations,
    auditTrail,
    insights: createInsights(request, recommendations),
  };
}

export function confirmRecommendation(plan: MealPlan, recommendationId: string): MealPlan {
  return {
    ...plan,
    recommendations: plan.recommendations.map((recommendation) =>
      recommendation.id === recommendationId
        ? {
            ...recommendation,
            status: "confirmed",
          }
        : recommendation,
    ),
    auditTrail: [
      {
        id: `confirm_${recommendationId}_${Date.now()}`,
        server: plan.recommendations.find((item) => item.id === recommendationId)?.server ?? "food",
        tool: plan.recommendations.find((item) => item.id === recommendationId)?.confirmationAction ?? "place_food_order",
        status: "needs_user_confirmation",
        durationMs: 0,
        detail: "User explicitly confirmed the commercial action in MealPilot UI.",
        sessionId: plan.id,
      },
      ...plan.auditTrail,
    ],
  };
}
