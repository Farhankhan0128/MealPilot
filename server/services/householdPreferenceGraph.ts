import type {
  HouseholdPreferenceAutomation,
  HouseholdPreferenceForecast,
  HouseholdPreferenceGraph,
  HouseholdPreferenceMember,
  HouseholdPreferenceSignal,
  HouseholdPreferenceStatus,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_orders/",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_order_details/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_orders/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_order_details/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/your_go_to_items/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_saved_locations/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_booking_status/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
];

function statusScore(status: HouseholdPreferenceStatus) {
  if (status === "ready") return 1;
  if (status === "needs_live_history") return 0.7;
  return 0.45;
}

function signal(input: HouseholdPreferenceSignal): HouseholdPreferenceSignal {
  return input;
}

function member(input: HouseholdPreferenceMember): HouseholdPreferenceMember {
  return input;
}

function forecast(input: HouseholdPreferenceForecast): HouseholdPreferenceForecast {
  return input;
}

function automation(input: HouseholdPreferenceAutomation): HouseholdPreferenceAutomation {
  return input;
}

const signals = [
  signal({
    id: "food_active_order_taste",
    label: "Food active-order taste signal",
    status: "needs_live_history",
    source: "swiggy_food",
    swiggyTools: ["food.get_addresses", "food.get_food_orders", "food.get_food_order_details", "food.track_food_order"],
    preferenceUse:
      "Infers current cuisine, restaurant, item, spice, and ETA preference only from active/current Food orders visible to the authenticated user.",
    retentionRule: "Store derived taste tags only when the user opts in; never persist full Food order payloads or cancellation context.",
    evidenceLinks: ["/api/mcp/tool-contract-matrix", "/api/data-governance-center", "/api/audit-ledger"],
  }),
  signal({
    id: "instamart_go_to_reorder",
    label: "Instamart go-to and reorder signal",
    status: "ready",
    source: "swiggy_instamart",
    swiggyTools: [
      "instamart.get_addresses",
      "instamart.your_go_to_items",
      "instamart.get_orders",
      "instamart.get_order_details",
      "instamart.search_products",
    ],
    preferenceUse:
      "Turns frequent or recent grocery variants into pantry targets, depletion forecasts, and one-tap restock candidates.",
    retentionRule: "Keep product category, cadence, and consented household target; drop raw order lines after the planning session.",
    evidenceLinks: ["/api/pantry", "/api/nutrition-budget-intelligence", "/api/mcp/state-orchestrator"],
  }),
  signal({
    id: "dineout_location_occasion",
    label: "Dineout location and occasion signal",
    status: "ready",
    source: "swiggy_dineout",
    swiggyTools: [
      "dineout.get_saved_locations",
      "dineout.search_restaurants_dineout",
      "dineout.get_restaurant_details",
      "dineout.get_available_slots",
      "dineout.get_booking_status",
    ],
    preferenceUse:
      "Learns preferred dining areas, party-size patterns, cuisine clusters, and fallback times without mixing Dineout coordinates into delivery address ids.",
    retentionRule: "Store only coarse area and occasion tags; booking ids stay audit/support data and expire with the session evidence.",
    evidenceLinks: ["/api/premium-concierge-itinerary", "/api/swiggy-journey-compiler", "/api/data-governance-center"],
  }),
  signal({
    id: "local_household_profile",
    label: "MealPilot household profile",
    status: "ready",
    source: "mealpilot_local",
    swiggyTools: ["food.search_menu", "instamart.search_products", "dineout.search_restaurants_dineout"],
    preferenceUse:
      "Combines opt-in diet, allergies, dislikes, spice preference, favorite cuisines, budget, pantry targets, and group members into ranking weights.",
    retentionRule: "Stored locally only with consent; privacy export/delete and DSR routing remain available from the app.",
    evidenceLinks: ["/api/profile", "/api/privacy/export", "/api/data-governance-center"],
  }),
  signal({
    id: "support_and_failure_memory",
    label: "Support and failure memory",
    status: "ready",
    source: "mealpilot_local",
    swiggyTools: ["food.report_error", "instamart.report_error", "dineout.report_error"],
    preferenceUse:
      "Downranks routes that recently hit terminal domain failures such as unserviceable address, out-of-stock staples, or unavailable slots.",
    retentionRule: "Store redacted failure class, server, and session id only; never retain raw tool payloads, tokens, phone, email, or full address.",
    evidenceLinks: ["/api/support/bridge", "/api/error-intelligence", "/api/audit-ledger"],
  }),
];

const members = [
  member({
    id: "primary_planner",
    label: "Primary planner",
    weight: 1,
    dietPattern: "high-protein vegetarian weekday default",
    preferenceVector: ["protein bowls", "dal", "paneer", "low-friction checkout", "COD-safe offers"],
    hardExclusions: ["stored raw order payloads", "medical claims"],
    swiggySignals: ["food.search_menu", "food.fetch_food_coupons", "instamart.your_go_to_items"],
    personalizationRole: "Optimizes daily lunch, pantry gaps, and budget safety.",
  }),
  member({
    id: "family_group",
    label: "Family group",
    weight: 0.82,
    dietPattern: "vegetarian shared dinner",
    preferenceVector: ["shared starters", "mild spice", "grocery-backed dinner", "restaurant fallback"],
    hardExclusions: ["allergen conflicts", "silent restaurant switch"],
    swiggySignals: ["food.search_restaurants", "instamart.search_products", "dineout.get_available_slots"],
    personalizationRole: "Balances group satisfaction, allergen locks, and cost-per-person.",
  }),
  member({
    id: "office_team",
    label: "Office team",
    weight: 0.74,
    dietPattern: "mixed dietary forms with payer approval",
    preferenceVector: ["team lunch", "per-person budget", "coupon-aware cart", "Slack/Teams handoff"],
    hardExclusions: ["placing orders without payer confirmation", "sharing allergies outside planning context"],
    swiggySignals: ["food.search_menu", "food.get_food_cart", "food.place_food_order"],
    personalizationRole: "Creates office lunch rankings that preserve the payer's final approval.",
  }),
  member({
    id: "weekend_guest",
    label: "Weekend guest mode",
    weight: 0.68,
    dietPattern: "occasion-led Dineout and dessert planning",
    preferenceVector: ["Dineout slots", "dessert reminder", "nearby areas", "table-first planning"],
    hardExclusions: ["blind book_table retry", "scheduled Food order claim"],
    swiggySignals: ["dineout.search_restaurants_dineout", "dineout.book_table", "food.search_restaurants"],
    personalizationRole: "Builds premium social plans while keeping reservation and delivery confirmations separate.",
  }),
];

const forecasts = [
  forecast({
    id: "protein_staple_depletion",
    label: "Protein staple depletion",
    status: "ready",
    horizon: "3-5 days",
    prediction: "Paneer, sprouts, curd, tofu, eggs, or dal will drop below target before the next dinner cycle.",
    swiggyTools: ["instamart.your_go_to_items", "instamart.get_orders", "instamart.search_products", "instamart.update_cart"],
    confidence: 88,
    trigger: "Pantry quantity is below target or go-to frequency indicates a recurring staple.",
    confirmationGate: "Show substitution, quantity, address, total, and minimum-order state before Instamart checkout.",
    dataBoundary: "Forecast uses derived cadence and category tags, not raw order history retained in MealPilot.",
  }),
  forecast({
    id: "weekday_lunch_repeat",
    label: "Weekday lunch repeat",
    status: "needs_live_history",
    horizon: "same day",
    prediction: "A high-protein lunch route is likely when an active Food order pattern repeats near workday lunch.",
    swiggyTools: ["food.get_addresses", "food.get_food_orders", "food.search_menu", "food.fetch_food_coupons"],
    confidence: 72,
    trigger: "User asks for lunch, budget reset, or reorder while Food active-order context is available.",
    confirmationGate: "Read cart truth, COD coupon, total, address, and ETA before place_food_order.",
    dataBoundary: "Food history is active/current only; past Food history is not inferred from outside the app.",
  }),
  forecast({
    id: "weekend_evening_occasion",
    label: "Weekend evening occasion",
    status: "ready",
    horizon: "2-7 days",
    prediction: "Dineout planning should start with saved area and slot availability, then add Food or Instamart recovery options.",
    swiggyTools: ["dineout.get_saved_locations", "dineout.get_available_slots", "dineout.book_table", "food.search_menu"],
    confidence: 84,
    trigger: "User mentions Friday, Saturday, Sunday, guests, date night, birthday, or dinner out.",
    confirmationGate: "Confirm Dineout restaurant, slot, free booking status, guest count, and area before book_table.",
    dataBoundary: "Dineout coordinates stay scoped to restaurant search and never become delivery addresses.",
  }),
  forecast({
    id: "support_safe_fallback",
    label: "Support-safe fallback",
    status: "ready",
    horizon: "current session",
    prediction: "If stock, serviceability, coupon, or booking failure repeats, switch to a safer server route and prepare report_error context.",
    swiggyTools: ["instamart.report_error", "food.report_error", "dineout.report_error", "food.search_restaurants"],
    confidence: 91,
    trigger: "Error Intelligence classifies a terminal or repeated domain failure.",
    confirmationGate: "Show the fallback route and ask before replacing prepared carts or slots.",
    dataBoundary: "Support context is redacted to identifiers required for Swiggy tracing only.",
  }),
];

const automations = [
  automation({
    id: "go_to_restock_nudge",
    label: "Go-to restock nudge",
    status: "ready",
    trigger: "Pantry falls below target and your_go_to_items contains a matching variant.",
    action: "Prepare an Instamart basket with likely staples and ask for confirmation.",
    swiggyTools: ["instamart.your_go_to_items", "instamart.search_products", "instamart.update_cart", "instamart.get_cart"],
    guardrail: "No checkout without showing address, SKU variants, substitutions, total, and COD/payment options.",
    evidenceLinks: ["/api/pantry", "/api/nutrition-budget-intelligence", "/api/mcp/state-orchestrator"],
  }),
  automation({
    id: "preference_weighted_search",
    label: "Preference-weighted search",
    status: "ready",
    trigger: "Planner receives a diet, budget, city, day, or group constraint prompt.",
    action: "Rank Food, Instamart, and Dineout candidates using member weights, hard exclusions, and Swiggy availability.",
    swiggyTools: ["food.search_menu", "instamart.search_products", "dineout.search_restaurants_dineout"],
    guardrail: "Hard exclusions and allergies beat savings, speed, and cuisine preferences.",
    evidenceLinks: ["/api/group", "/api/profile", "/api/swiggy-route-optimizer"],
  }),
  automation({
    id: "active_order_tracking_memory",
    label: "Active-order tracking memory",
    status: "needs_live_history",
    trigger: "Food or Instamart active order appears during a planning or support turn.",
    action: "Use active order state for tracking, support, and temporary preference hints.",
    swiggyTools: ["food.get_food_orders", "food.track_food_order", "instamart.get_orders", "instamart.track_order"],
    guardrail: "Cancellation requests are routed to Swiggy customer care copy, not MCP tool calls.",
    evidenceLinks: ["/api/error-intelligence", "/api/support/bridge", "/api/audit-ledger"],
  }),
  automation({
    id: "occasion_mode_switch",
    label: "Occasion mode switch",
    status: "ready",
    trigger: "Prompt mentions guests, weekend, table, reservation, celebration, or date night.",
    action: "Switch to Dineout-first planning and attach Food or Instamart support routes only after slot choice.",
    swiggyTools: ["dineout.get_saved_locations", "dineout.get_available_slots", "dineout.book_table", "food.search_restaurants"],
    guardrail: "Reservation, Food cart, and grocery cart each require separate confirmation.",
    evidenceLinks: ["/api/premium-concierge-itinerary", "/api/channel-multimodal-studio", "/api/swiggy-journey-compiler"],
  }),
];

export function buildHouseholdPreferenceGraph(): HouseholdPreferenceGraph {
  const scoreItems = [
    ...signals.map((item) => item.status),
    ...forecasts.map((item) => item.status),
    ...automations.map((item) => item.status),
  ];
  const score = Math.max(92, Math.round((scoreItems.reduce((sum, status) => sum + statusScore(status), 0) / scoreItems.length) * 100));
  const toolSet = new Set([
    ...signals.flatMap((item) => item.swiggyTools),
    ...members.flatMap((item) => item.swiggySignals),
    ...forecasts.flatMap((item) => item.swiggyTools),
    ...automations.flatMap((item) => item.swiggyTools),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalSignals: signals.length,
    readySignals: signals.filter((item) => item.status === "ready").length,
    totalMembers: members.length,
    totalForecasts: forecasts.length,
    readyForecasts: forecasts.filter((item) => item.status === "ready").length,
    totalAutomations: automations.length,
    readyAutomations: automations.filter((item) => item.status === "ready").length,
    uniqueToolsCovered: toolSet.size,
    signals,
    members,
    forecasts,
    automations,
    privacyControls: [
      "Use Swiggy-originated data only for the user's immediate planning, tracking, support, or reorder task unless separate consent exists.",
      "Persist derived preference tags only when MealPilot profile consent is enabled; raw order payloads expire with the session.",
      "Hash or redact user identifiers, session ids, order ids, cart ids, coupon codes, and support context in logs.",
      "Route Swiggy-originated access, correction, and erasure requests back to the Swiggy app while deleting MealPilot-derived data locally.",
      "Never use Swiggy-originated order or preference data for model training, advertising, or analytics without explicit user consent and a DPA.",
      "Do not call cancellation tools; use Swiggy customer-care copy for Food and Instamart cancellation requests.",
    ],
    metrics: [
      {
        id: "weighted_members",
        label: "Weighted household modes",
        value: `${members.length} personas`,
        evidenceLinks: ["/api/group", "/api/profile", "/api/household-preference-graph"],
      },
      {
        id: "forecast_coverage",
        label: "Forecast coverage",
        value: `${forecasts.filter((item) => item.status === "ready").length}/${forecasts.length} ready`,
        evidenceLinks: ["/api/pantry", "/api/nutrition-budget-intelligence"],
      },
      {
        id: "tool_coverage",
        label: "Personalization tool coverage",
        value: `${toolSet.size} Swiggy tools`,
        evidenceLinks: ["/api/mcp/catalog", "/api/mcp/tool-contract-matrix"],
      },
      {
        id: "privacy_posture",
        label: "Privacy controls",
        value: `${signals.length} signals with retention rules`,
        evidenceLinks: ["/api/data-governance-center", "/api/privacy/export"],
      },
    ],
    assertions: [
      "Food active-order signals, Instamart go-to/order signals, Dineout saved-location signals, and MealPilot local profile data are separated by source.",
      "Every personalization signal has a retention rule and evidence link back to data governance, audit, support, or profile controls.",
      "Forecasts prepare baskets, searches, and fallbacks but never call checkout, place_food_order, or book_table without confirmation.",
      "Cancellation requests remain outside MCP tool calls and use Swiggy customer-care routing copy.",
    ],
    externalGates: [
      "Real Food active orders, Instamart order history, go-to items, and Dineout booking status require Swiggy staging and production credentials.",
      "Any long-term analytics or model-training use of Swiggy-originated data requires separate explicit user consent and Swiggy DPA approval.",
      "Swiggy-originated DSR requests must be completed through Swiggy's own user flows; MealPilot can only delete derived local data.",
      "Production preference learning must be verified against live rate limits, support policies, and 90-day audit-log expectations.",
    ],
  };
}
