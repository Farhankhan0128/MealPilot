export type SwiggyServer = "food" | "instamart" | "dineout";

export type CommerceAction = "place_food_order" | "checkout" | "book_table";

export type RecommendationStatus = "prepared" | "confirmed" | "blocked";

export type SpicePreference = "mild" | "medium" | "hot";

export type AgentSurface = "chat" | "voice";

export interface UserProfile {
  id: string;
  name: string;
  householdSize: number;
  defaultCity: UserPlanningRequest["city"];
  defaultBudget: number;
  diet: UserPlanningRequest["diet"];
  allergies: string[];
  dislikes: string[];
  favoriteCuisines: string[];
  spicePreference: SpicePreference;
  addressLabel: SavedLocation["label"];
  consentToStorePreferences: boolean;
}

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
  id?: string;
  name: string;
  quantity: string;
  price: number;
  nutrition?: string;
}

export interface ItemAlternative {
  id: string;
  replaces: string;
  name: string;
  quantity: string;
  price: number;
  reason: string;
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
  alternatives: ItemAlternative[];
}

export interface PlanVariant {
  id: "balanced" | "budget" | "protein" | "social";
  label: string;
  total: number;
  description: string;
  tradeoff: string;
}

export interface TrackingEvent {
  id: string;
  recommendationId: string;
  server: SwiggyServer;
  label: string;
  status: "queued" | "accepted" | "preparing" | "on_the_way" | "ready" | "completed";
  timestamp: string;
}

export interface BuilderReadinessItem {
  id: string;
  label: string;
  status: "ready" | "needs_credentials" | "manual_review";
  evidence: string;
}

export interface PantryItem {
  id: string;
  name: string;
  category: "protein" | "staple" | "dairy" | "produce" | "snack";
  currentQty: number;
  targetQty: number;
  unit: string;
  estimatedPrice: number;
}

export interface RestockSuggestion {
  id: string;
  itemId: string;
  name: string;
  quantity: string;
  price: number;
  reason: string;
}

export interface GroupMember {
  id: string;
  name: string;
  diet: UserPlanningRequest["diet"];
  allergies: string[];
  budget: number;
}

export interface GroupPlan {
  members: GroupMember[];
  combinedBudget: number;
  constraints: string[];
  recommendation: string;
}

export interface Reminder {
  id: string;
  sessionId: string;
  label: string;
  channel: "in_app" | "email_draft";
  scheduledFor: string;
  status: "scheduled" | "sent" | "cancelled";
}

export interface OpsStatus {
  id: string;
  label: string;
  status: "healthy" | "warning" | "blocked";
  detail: string;
}

export interface McpToolCoverage {
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  stage: string;
  status: "demo_ready" | "guarded" | "planned";
  evidence: string;
}

export interface McpServerCoverage {
  server: SwiggyServer;
  endpoint: string;
  totalTools: number;
  demoReady: number;
  guarded: number;
  planned: number;
  tools: McpToolCoverage[];
}

export interface AgentSurfaceResponse {
  surface: AgentSurface;
  headline: string;
  shortSummary: string;
  recommendationIds: string[];
  cards: Array<{
    title: string;
    provider: string;
    total: number;
    eta: string;
  }>;
  confirmationPrompt: string;
  constraints: string[];
}

export interface GoLiveCheck {
  id: string;
  label: string;
  status: "ready" | "needs_credentials" | "manual_review";
  evidence: string;
}

export interface ObservabilityMetric {
  id: string;
  label: string;
  value: string;
  status: "healthy" | "watch" | "blocked";
  detail: string;
}

export interface IncidentReport {
  id: string;
  severity: "S0" | "S1" | "S2" | "S3";
  subject: string;
  summary: string;
  mailto: string;
  sessionIds: string[];
  nextSteps: string[];
}

export interface MealPlan {
  id: string;
  summary: string;
  total: number;
  budgetLimit: number;
  budgetFit: "under_budget" | "at_risk" | "over_budget";
  callCount: number;
  healthScore: number;
  recommendations: Recommendation[];
  auditTrail: ToolCallEvent[];
  insights: string[];
  variants: PlanVariant[];
  tracking: TrackingEvent[];
  profileSnapshot?: UserProfile;
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
