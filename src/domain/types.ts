export type SwiggyServer = "food" | "instamart" | "dineout";

export type CommerceAction = "place_food_order" | "checkout" | "book_table";

export type RecommendationStatus = "prepared" | "confirmed" | "blocked";

export interface UserPlanningRequest {
  prompt: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  budget: number;
  diet: "vegetarian" | "high-protein vegetarian" | "balanced";
  guests: number;
  day: "today" | "friday" | "saturday" | "sunday";
}

export interface ToolCallEvent {
  id: string;
  server: SwiggyServer;
  tool: string;
  status: "ok" | "needs_user_confirmation" | "simulated" | "blocked";
  durationMs: number;
  detail: string;
  sessionId: string;
}

export interface PlanItem {
  name: string;
  quantity: string;
  price: number;
  nutrition?: string;
}

export interface Recommendation {
  id: string;
  server: SwiggyServer;
  title: string;
  provider: string;
  locationLabel: string;
  eta: string;
  total: number;
  confidence: number;
  reason: string;
  items: PlanItem[];
  toolChain: string[];
  confirmationAction: CommerceAction;
  status: RecommendationStatus;
  guardrails: string[];
}

export interface MealPlan {
  id: string;
  summary: string;
  total: number;
  budgetFit: "under_budget" | "at_risk" | "over_budget";
  callCount: number;
  healthScore: number;
  recommendations: Recommendation[];
  auditTrail: ToolCallEvent[];
  insights: string[];
}

export interface SavedLocation {
  id: string;
  label: "Home" | "Office";
  displayText: string;
}

export interface FoodRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distanceKm: number;
  availabilityStatus: "OPEN" | "CLOSED";
}

export interface GroceryBasket {
  title: string;
  merchant: string;
  items: PlanItem[];
}

export interface DineoutSlot {
  restaurantName: string;
  area: string;
  cuisine: string;
  rating: number;
  time: string;
  guests: number;
  estimatedSpendPerPerson: number;
}

export interface SwiggyPlanningClient {
  getSavedLocations(): Promise<SavedLocation[]>;
  searchFoodRestaurants(request: UserPlanningRequest, addressId: string): Promise<FoodRestaurant[]>;
  buildFoodCart(request: UserPlanningRequest, restaurant: FoodRestaurant): Promise<Recommendation>;
  buildInstamartBasket(request: UserPlanningRequest): Promise<Recommendation>;
  findDineoutSlot(request: UserPlanningRequest): Promise<Recommendation>;
}
