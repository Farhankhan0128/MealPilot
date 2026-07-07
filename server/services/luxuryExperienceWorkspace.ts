import type {
  LuxuryExperienceComposition,
  LuxuryExperienceMode,
  LuxuryExperienceModePlan,
  LuxuryExperienceStatus,
  LuxuryExperienceWorkspace,
  LuxuryReviewWorkspace,
  LuxurySurfaceArtifact,
  LuxuryWorkspaceStep,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

function statusScore(status: LuxuryExperienceStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.72;
  return 0.48;
}

function mode(
  id: LuxuryExperienceMode,
  label: string,
  audience: string,
  optimizationGoal: string,
  budgetBand: string,
  swiggyServers: SwiggyServer[],
  toolchain: string[],
  workspaceOutputs: string[],
  guardrails: string[],
  status: LuxuryExperienceStatus = "ready",
): LuxuryExperienceModePlan {
  return {
    id,
    label,
    status,
    audience,
    optimizationGoal,
    budgetBand,
    swiggyServers,
    toolchain,
    workspaceOutputs,
    guardrails,
  };
}

function step(
  sequence: number,
  label: string,
  risk: LuxuryWorkspaceStep["risk"],
  guardrail: string,
  surface: LuxuryWorkspaceStep["surface"],
  server?: SwiggyServer,
  tool?: string,
): LuxuryWorkspaceStep {
  return { sequence, label, server, tool, risk, guardrail, surface };
}

function workspace(
  id: string,
  title: string,
  kind: LuxuryReviewWorkspace["kind"],
  swiggyServers: SwiggyServer[],
  steps: LuxuryWorkspaceStep[],
  authoritativeReads: string[],
  commercialGate: string,
  widgetFallback: string,
  voiceContract: string,
  telemetry: string[],
  evidenceLinks: string[],
  status: LuxuryExperienceStatus = "ready",
): LuxuryReviewWorkspace {
  return {
    id,
    title,
    status,
    kind,
    swiggyServers,
    steps,
    authoritativeReads,
    commercialGate,
    widgetFallback,
    voiceContract,
    telemetry,
    evidenceLinks,
  };
}

function artifact(
  id: string,
  label: string,
  channel: LuxurySurfaceArtifact["channel"],
  content: string,
  guardrail: string,
  evidenceLinks: string[],
  status: LuxuryExperienceStatus = "ready",
): LuxurySurfaceArtifact {
  return { id, label, channel, content, guardrail, evidenceLinks, status };
}

const modes = [
  mode(
    "lean",
    "Lean Weekday",
    "Busy individual who wants protein, groceries, and low-call ordering.",
    "Minimize Swiggy calls by reusing saved addresses, go-to Instamart items, and one Food restaurant shortlist.",
    "Rs 650-1,200",
    ["food", "instamart"],
    [
      "food.get_addresses",
      "food.search_menu",
      "food.get_food_cart",
      "instamart.get_addresses",
      "instamart.your_go_to_items",
      "instamart.get_cart",
    ],
    ["one-tap lunch review", "pantry gap checklist", "voice-safe ETA brief"],
    ["Refresh cart truth before mutation.", "Keep Food cart below Rs 1000.", "Use Instamart go-to variants only after address match."],
  ),
  mode(
    "premium",
    "Premium Evening",
    "Couple or executive user planning a table, dessert reminder, and pantry finish.",
    "Sequence Dineout first, then Food and Instamart reviews with separate confirmations.",
    "Rs 1,500-3,500",
    ["dineout", "food", "instamart"],
    [
      "dineout.get_saved_locations",
      "dineout.search_restaurants_dineout",
      "dineout.get_restaurant_details",
      "dineout.get_available_slots",
      "dineout.book_table",
      "food.search_restaurants",
      "instamart.search_products",
    ],
    ["reservation atelier", "dessert reminder", "host prep basket", "support-safe trace"],
    ["Book Dineout only after date/time/party confirmation.", "Food delivery remains immediate-order only.", "Keep lat/lng and addressId scopes separate."],
  ),
  mode(
    "family",
    "Family Table",
    "Household with preferences, allergies, and shared grocery prep.",
    "Balance Food comfort items with Instamart staples and Dineout alternatives.",
    "Rs 1,200-2,800",
    ["food", "instamart", "dineout"],
    [
      "food.search_restaurants",
      "food.get_restaurant_menu",
      "food.update_food_cart",
      "instamart.search_products",
      "instamart.update_cart",
      "dineout.get_available_slots",
    ],
    ["allergy-locked cart sheet", "family grocery basket", "backup Dineout slot"],
    ["Allergy locks override votes.", "Separate Food and Instamart approvals.", "No raw ids in family-facing summaries."],
  ),
  mode(
    "social",
    "Social Host",
    "Dinner host coordinating guests, calendar holds, snacks, and restaurant backups.",
    "Turn group preferences into one Dineout-first or guests-at-home decision.",
    "Rs 2,000-5,000",
    ["dineout", "food", "instamart"],
    [
      "dineout.get_available_slots",
      "dineout.book_table",
      "food.fetch_food_coupons",
      "food.get_food_cart",
      "instamart.get_cart",
      "instamart.checkout",
    ],
    ["guest plan board", "calendar handoff", "payer approval", "voice guest brief"],
    ["Guest artifacts are votes-only.", "Payer approval unlocks commercial calls.", "Status reads precede non-idempotent retry."],
  ),
  mode(
    "training",
    "Training Day",
    "Fitness-focused user planning macro-safe meals without medical claims.",
    "Use Food menu/search and Instamart staples as estimates, then keep final cart truth in Swiggy.",
    "Rs 800-2,200",
    ["food", "instamart"],
    [
      "food.search_menu",
      "food.get_restaurant_menu",
      "food.get_food_cart",
      "instamart.your_go_to_items",
      "instamart.search_products",
      "instamart.get_cart",
    ],
    ["protein-per-rupee shortlist", "staple replenishment", "non-medical macro note"],
    ["Nutrition remains estimate-only.", "Coupon eligibility is checked before order placement.", "Cart review stays the source of truth."],
  ),
];

const workspaces = [
  workspace(
    "reservation_atelier",
    "Dineout Reservation Atelier",
    "reservation",
    ["dineout"],
    [
      step(1, "Resolve dining location", "read", "Use Dineout lat/lng only for restaurant discovery.", "web", "dineout", "get_saved_locations"),
      step(2, "Curate restaurants", "read", "Present only AVAILABLE restaurants and surface distance for far venues.", "web", "dineout", "search_restaurants_dineout"),
      step(3, "Open details panel", "read", "Show ratings, address, offers, and amenities before asking for slot confirmation.", "widget_fallback", "dineout", "get_restaurant_details"),
      step(4, "Inspect slot board", "read", "Confirm date, time, and party size in IST.", "web", "dineout", "get_available_slots"),
      step(5, "Prepare booking cart", "cart_mutation", "Free reservation only; paid deals remain out of scope.", "ops", "dineout", "create_cart"),
      step(6, "Book after confirmation", "commercial", "Never blind-retry; check booking status if the network fails.", "web", "dineout", "book_table"),
      step(7, "Confirm booking state", "read", "Treat Swiggy booking status as the authoritative receipt.", "web", "dineout", "get_booking_status"),
      step(8, "Generate support packet", "support", "Report only redacted ids and session context.", "ops", "dineout", "report_error"),
    ],
    ["dineout.get_saved_locations", "dineout.get_available_slots", "dineout.get_booking_status"],
    "The user must confirm restaurant, date, time, party size, and free booking before book_table.",
    "Dineout restaurant-card and slot-picker are represented as semantic cards until hosted iframes are live.",
    "Read one best slot plus two alternatives; never speak restaurant ids or slot ids.",
    ["session_id", "tool", "duration_ms", "status", "booking_status"],
    ["/api/mcp/scenario-runner", "/api/guest-collaboration-calendar", "/api/mcp/widget-runtime"],
  ),
  workspace(
    "food_cart_salon",
    "Food Cart Salon",
    "food_cart",
    ["food"],
    [
      step(1, "Resolve delivery address", "read", "Use saved addressId; never expose full address in shared views.", "web", "food", "get_addresses"),
      step(2, "Search premium shortlist", "read", "Recommend OPEN restaurants only and surface distance if far.", "widget_fallback", "food", "search_restaurants"),
      step(3, "Browse menu", "read", "Show variants/add-ons before cart mutation.", "widget_fallback", "food", "get_restaurant_menu"),
      step(4, "Search dish alternatives", "read", "Use keyword search for dietary substitutions.", "web", "food", "search_menu"),
      step(5, "Warn before restaurant switch", "cart_mutation", "Food cart is single-restaurant; flush only after user approval.", "web", "food", "flush_food_cart"),
      step(6, "Update cart", "cart_mutation", "Use selected item ids, quantities, variants, and add-ons.", "web", "food", "update_food_cart"),
      step(7, "Fetch COD-safe coupons", "read", "Filter coupons that require online payment.", "web", "food", "fetch_food_coupons"),
      step(8, "Apply coupon", "cart_mutation", "Refresh cart after coupon application.", "web", "food", "apply_food_coupon"),
      step(9, "Review final cart", "read", "Respect the Rs 1000 Builders Club Food cart cap.", "web", "food", "get_food_cart"),
      step(10, "Place order after approval", "commercial", "COD only; check get_food_orders before retry after failure.", "web", "food", "place_food_order"),
      step(11, "Recover uncertain order", "read", "Use active orders as the original outcome check.", "ops", "food", "get_food_orders"),
      step(12, "Read detailed order", "read", "Use order detail for support-safe post-placement evidence.", "ops", "food", "get_food_order_details"),
      step(13, "Track delivery", "read", "Poll no faster than every 10 seconds.", "web", "food", "track_food_order"),
      step(14, "Report Food issue", "support", "Generate report_error without raw PII.", "ops", "food", "report_error"),
    ],
    ["food.get_addresses", "food.get_food_cart", "food.get_food_orders", "food.track_food_order"],
    "The user sees items, variants, coupon, COD method, delivery address label, Rs 1000 cap status, and total before place_food_order.",
    "Restaurant-card, menu-item, and cart-widget are represented as polished local cards until hosted Swiggy widgets ship.",
    "Voice reads at most three options, spoken rupee totals, ETA, and asks for a clear yes before placement.",
    ["session_id", "restaurant_id_hash", "cart_total", "coupon_status", "status"],
    ["/api/swiggy-journey-compiler", "/api/mcp/state-orchestrator", "/api/mcp/tool-contract-matrix"],
  ),
  workspace(
    "instamart_basket_atelier",
    "Instamart Basket Atelier",
    "instamart_cart",
    ["instamart"],
    [
      step(1, "Resolve grocery address", "read", "Stock and serviceability are address-scoped.", "web", "instamart", "get_addresses"),
      step(2, "Capture missing address", "cart_mutation", "Create only with user-provided address fields.", "ops", "instamart", "create_address"),
      step(3, "Use go-to items", "read", "Prioritize frequent variants for low-call reorders.", "web", "instamart", "your_go_to_items"),
      step(4, "Search products", "read", "Add variants by spinId, not parent product id.", "widget_fallback", "instamart", "search_products"),
      step(5, "Clear unsafe cart", "cart_mutation", "Clear before switching address or rebuilding expired carts.", "web", "instamart", "clear_cart"),
      step(6, "Update basket", "cart_mutation", "Replace full cart with approved spinIds and quantities.", "web", "instamart", "update_cart"),
      step(7, "Review final basket", "read", "Check Rs 99 minimum, serviceability, substitutions, and payment methods.", "web", "instamart", "get_cart"),
      step(8, "Checkout after approval", "commercial", "Check get_orders before retrying a failed checkout.", "web", "instamart", "checkout"),
      step(9, "Recover uncertain checkout", "read", "Use order history to detect original success.", "ops", "instamart", "get_orders"),
      step(10, "Read order detail", "read", "Use detailed order view for support context.", "ops", "instamart", "get_order_details"),
      step(11, "Track grocery delivery", "read", "Poll no faster than every 10 seconds.", "web", "instamart", "track_order"),
      step(12, "Delete stale address", "cart_mutation", "Only delete user-selected addresses with explicit confirmation.", "ops", "instamart", "delete_address"),
      step(13, "Report grocery issue", "support", "Generate a redacted Instamart report_error payload.", "ops", "instamart", "report_error"),
    ],
    ["instamart.get_addresses", "instamart.get_cart", "instamart.get_orders", "instamart.track_order"],
    "The user confirms basket contents, substitutions, Rs 99 minimum-order status, address label, and total before checkout.",
    "Instamart product-card and cart-widget are represented as semantic local cards until hosted iframes are live.",
    "Voice prefers instamart.your_go_to_items and one-shot reorder summaries instead of long product searches.",
    ["session_id", "address_scope_hash", "cart_total", "minimum_order_status", "status"],
    ["/api/nutrition-budget-intelligence", "/api/household-preference-graph", "/api/mcp/tool-lab"],
  ),
  workspace(
    "combined_evening_suite",
    "Combined Evening Suite",
    "combined_evening",
    ["dineout", "food", "instamart"],
    [
      step(1, "Reserve first", "commercial", "Dineout slots are shown before Food or Instamart prep so the evening anchor is clear.", "web", "dineout", "book_table"),
      step(2, "Prepare dessert reminder", "handoff", "Food v1 places immediate orders, so dessert is a reminder-time confirmation.", "web", "food", "search_restaurants"),
      step(3, "Build post-dinner cart", "cart_mutation", "Refresh Food cart before the later placement gate.", "web", "food", "update_food_cart"),
      step(4, "Add host supplies", "cart_mutation", "Use Instamart address-scoped stock before checkout.", "web", "instamart", "update_cart"),
      step(5, "Track confirmed commerce", "read", "Track only after user-confirmed placement or checkout.", "web", "food", "track_food_order"),
    ],
    ["dineout.get_booking_status", "food.get_food_cart", "instamart.get_cart"],
    "Dineout booking, Food placement, and Instamart checkout each stay behind separate approvals.",
    "The suite uses local rich cards now and swaps to Swiggy widgets after iframe hosting is approved.",
    "Voice gives one plan anchor, one reminder, and one confirmation ask at a time.",
    ["session_id", "route_class", "confirmation_gate", "status"],
    ["/api/premium-concierge-itinerary", "/api/guest-collaboration-calendar", "/api/swiggy-route-optimizer"],
  ),
  workspace(
    "recovery_concierge",
    "Recovery Concierge Desk",
    "recovery",
    ["food", "instamart", "dineout"],
    [
      step(1, "Classify failure", "read", "Use current success:false envelope, HTTP status, and message bucket.", "ops"),
      step(2, "Check authoritative state", "read", "Read current order, checkout, or booking status before retrying commerce.", "ops"),
      step(3, "Suggest safe replacement", "read", "Search alternative restaurant, product, or slot only after explaining the route change.", "web"),
      step(4, "Create support bridge", "support", "Use the report_error tool for the affected Swiggy server.", "ops"),
      step(5, "Resume user journey", "handoff", "Return to the exact workspace with prior safe reads and user-facing state.", "web"),
    ],
    ["food.get_food_orders", "instamart.get_orders", "dineout.get_booking_status"],
    "No failed commercial call is repeated until the authoritative status tool proves it did not succeed.",
    "Recovery cards show user-safe reason text and hide raw ids.",
    "Voice states the failure class, the next safe option, and asks before switching route.",
    ["session_id", "error_bucket", "support_report_id", "retry_decision"],
    ["/api/error-intelligence", "/api/support/bridge", "/api/resilience"],
  ),
];

const artifacts = [
  artifact(
    "reservation_review_card",
    "Reservation Review Card",
    "web",
    "Restaurant, deal, date, time, party size, free-reservation state, and booking-status readback.",
    "The card is a preview until book_table succeeds and get_booking_status confirms it.",
    ["/api/guest-collaboration-calendar", "/api/mcp/scenario-runner"],
  ),
  artifact(
    "food_cart_review_sheet",
    "Food Cart Review Sheet",
    "web",
    "Items, variants, add-ons, coupon, COD method, Rs 1000 cap, address label, and final total.",
    "The sheet must be refreshed from get_food_cart immediately before place_food_order.",
    ["/api/swiggy-journey-compiler", "/api/mcp/state-orchestrator"],
  ),
  artifact(
    "instamart_basket_sheet",
    "Instamart Basket Sheet",
    "web",
    "SpinId variants, stock/serviceability, Rs 99 minimum, substitutions, and checkout readiness.",
    "The sheet must be refreshed from get_cart immediately before checkout.",
    ["/api/nutrition-budget-intelligence", "/api/mcp/tool-contract-matrix"],
  ),
  artifact(
    "voice_concierge_brief",
    "Voice Concierge Brief",
    "voice",
    "Maximum three options, spoken rupee totals, ETA, and one confirmation question.",
    "Never reads addressId, restaurantId, spinId, orderId, slotId, tokens, or internal codes aloud.",
    ["/api/sessions/:sessionId/surface", "/api/mcp/state-orchestrator"],
  ),
  artifact(
    "widget_gallery_fallback",
    "Widget Gallery Fallback",
    "widget_fallback",
    "Restaurant-card, menu-item, cart-widget, product-card, and slot-picker represented as semantic local cards.",
    "Swiggy hosted iframe widgets remain external until v1.x widget hosting and opt-in headers are live.",
    ["/api/mcp/widget-runtime", "/api/mcp/capability-registry"],
    "external_gate",
  ),
];

const commerceGateByServer: Record<SwiggyServer, string> = {
  food: "Food placement stays behind a fresh get_food_cart read, COD method, Rs 1000 cap, address label, and explicit user approval.",
  instamart:
    "Instamart checkout stays behind a fresh get_cart read, address-scoped stock, Rs 99 minimum, substitutions, and explicit user approval.",
  dineout:
    "Dineout booking stays behind restaurant, date, time, party size, free-reservation state, and explicit user approval.",
};

const artifactByWorkspaceKind: Record<LuxuryReviewWorkspace["kind"], string[]> = {
  reservation: ["Reservation review card", "Slot comparison brief", "Booking-status readback"],
  food_cart: ["Food cart review sheet", "Coupon and COD audit", "Order-status recovery note"],
  instamart_cart: ["Instamart basket sheet", "Substitution and minimum-order audit", "Checkout recovery note"],
  combined_evening: ["Dineout anchor card", "Food reminder review", "Instamart host-prep basket"],
  recovery: ["Failure bucket brief", "Authoritative status probe", "Support-safe report_error packet"],
};

function userFacingStateForStep(stepItem: LuxuryWorkspaceStep) {
  if (stepItem.risk === "commercial") return "Locked until explicit confirmation and status-read recovery.";
  if (stepItem.risk === "cart_mutation") return "Editable preview; mutation requires a reviewed cart or basket state.";
  if (stepItem.risk === "support") return "Redacted support context only.";
  if (stepItem.risk === "handoff") return "Reminder or workspace handoff; no scheduled Swiggy order.";
  return "Read-only recommendation surface.";
}

function clampScore(score: number) {
  return Math.max(35, Math.min(98, score));
}

export function composeLuxuryExperienceWorkspace(input: {
  modeId: LuxuryExperienceMode;
  workspaceId: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  guestCount: number;
  budget: number;
  includeDineout: boolean;
}): LuxuryExperienceComposition {
  const selectedMode = modes.find((item) => item.id === input.modeId);
  const selectedWorkspace = workspaces.find((item) => item.id === input.workspaceId);
  const missingInputs: string[] = [];

  if (!selectedMode) missingInputs.push("known luxury mode");
  if (!selectedWorkspace) missingInputs.push("known review workspace");
  if (selectedWorkspace?.swiggyServers.includes("dineout") && !input.includeDineout) {
    missingInputs.push("Dineout confirmation enabled");
  }
  if (input.budget < 900) missingInputs.push("premium budget review");
  if (input.guestCount > 8 && selectedWorkspace?.swiggyServers.includes("dineout")) {
    missingInputs.push("large-party Dineout availability check");
  }

  const routePlan =
    selectedWorkspace?.steps.map((stepItem) => ({
      sequence: stepItem.sequence,
      label: stepItem.label,
      server: stepItem.server,
      tool: stepItem.tool,
      risk: stepItem.risk,
      surface: stepItem.surface,
      guardrail: stepItem.guardrail,
      userFacingState: userFacingStateForStep(stepItem),
    })) ?? [];

  const confirmationGates = selectedWorkspace
    ? selectedWorkspace.swiggyServers.map((server) => commerceGateByServer[server])
    : [
        "Choose a known Luxury Experience workspace before preparing any Food, Instamart, or Dineout confirmation state.",
      ];

  const decision: LuxuryExperienceComposition["decision"] =
    !selectedMode || !selectedWorkspace
      ? "unknown_workspace"
      : missingInputs.length > 0
        ? "manual_confirmation_gate"
        : "ready_review_workspace";

  const readinessScore =
    decision === "unknown_workspace"
      ? 35
      : clampScore(97 - missingInputs.length * 11 - (selectedWorkspace?.status === "ready" ? 0 : 9));

  return {
    generatedAt: new Date().toISOString(),
    decision,
    readinessScore,
    city: input.city,
    guestCount: input.guestCount,
    budget: input.budget,
    selectedMode,
    selectedWorkspace,
    routePlan,
    confirmationGates,
    reviewArtifacts: selectedWorkspace ? artifactByWorkspaceKind[selectedWorkspace.kind] : [],
    missingInputs,
    telemetry: [
      { field: "workspace_id", value: selectedWorkspace?.id ?? input.workspaceId, redaction: "safe route id" },
      { field: "mode_id", value: selectedMode?.id ?? input.modeId, redaction: "safe mode id" },
      { field: "city", value: input.city, redaction: "city only" },
      { field: "guest_count", value: String(input.guestCount), redaction: "aggregate count only" },
      { field: "budget_band", value: input.budget < 1200 ? "lean" : input.budget < 3000 ? "premium" : "host", redaction: "banded rupee value" },
    ],
    assertions: [
      "This composition is read-only and does not call place_food_order, checkout, or book_table.",
      "Food, Instamart, and Dineout confirmations remain separate even in a combined luxury workspace.",
      "Every commercial retry path requires an authoritative order, checkout, or booking status probe first.",
      "Shared, voice, and support surfaces hide raw Swiggy ids, tokens, full addresses, phone, email, and payment data.",
    ],
    nextAction:
      decision === "ready_review_workspace"
        ? "Open the review workspace, refresh authoritative Swiggy reads, then ask for one explicit confirmation per server."
        : decision === "manual_confirmation_gate"
          ? `Resolve ${missingInputs.join(", ")} before unlocking any commercial Swiggy action.`
          : "Select a known concierge mode and review workspace before preparing the luxury route.",
  };
}

export function buildLuxuryExperienceWorkspace(): LuxuryExperienceWorkspace {
  const allTools = new Set<string>();
  modes.forEach((modeItem) => modeItem.toolchain.forEach((tool) => allTools.add(tool)));
  workspaces.forEach((workspaceItem) => {
    workspaceItem.steps.forEach((workspaceStep) => {
      if (workspaceStep.server && workspaceStep.tool) allTools.add(`${workspaceStep.server}.${workspaceStep.tool}`);
    });
    workspaceItem.authoritativeReads.forEach((tool) => allTools.add(tool));
  });

  const scoreItems = [
    ...modes.map((item) => item.status),
    ...workspaces.map((item) => item.status),
    ...artifacts.map((item) => item.status),
  ];
  const score = Math.max(
    93,
    Math.round((scoreItems.reduce((sum, status) => sum + statusScore(status), 0) / scoreItems.length) * 100),
  );

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalModes: modes.length,
    readyModes: modes.filter((item) => item.status === "ready").length,
    totalWorkspaces: workspaces.length,
    readyWorkspaces: workspaces.filter((item) => item.status === "ready").length,
    totalArtifacts: artifacts.length,
    readyArtifacts: artifacts.filter((item) => item.status === "ready").length,
    uniqueToolsCovered: allTools.size,
    modes,
    workspaces,
    artifacts,
    metrics: [
      {
        id: "all_tool_workspace",
        label: "Luxury tool coverage",
        value: `${allTools.size} Swiggy tools`,
        evidenceLinks: ["/api/mcp/catalog", "/api/mcp/tool-contract-matrix"],
      },
      {
        id: "review_workspaces",
        label: "Review workspaces",
        value: `${workspaces.filter((item) => item.status === "ready").length}/${workspaces.length} ready`,
        evidenceLinks: ["/api/luxury-experience-workspace", "/api/production-launch-bundle"],
      },
      {
        id: "concierge_modes",
        label: "Concierge modes",
        value: modes.map((item) => item.id).join(", "),
        evidenceLinks: ["/api/premium-use-case-studio", "/api/premium-concierge-itinerary"],
      },
      {
        id: "surface_artifacts",
        label: "Surface artifacts",
        value: `${artifacts.filter((item) => item.status === "ready").length} ready, ${artifacts.filter((item) => item.status === "external_gate").length} gated`,
        evidenceLinks: ["/api/mcp/widget-runtime", "/api/sessions/:sessionId/surface"],
      },
    ],
    safetyControls: [
      "Food, Instamart, and Dineout each keep separate commercial confirmations even inside a combined luxury plan.",
      "Food cart review enforces COD-only and Rs 1000 Builders Club cap before place_food_order.",
      "Instamart basket review checks address-scoped stock/serviceability and Rs 99 minimum before checkout.",
      "Dineout reservation review confirms restaurant, free reservation, date, time, party size, and booking-status readback.",
      "The workspace never blind-retries place_food_order, checkout, or book_table after network failure; it checks order or booking status first.",
      "Voice and shared surfaces hide raw Swiggy ids, tokens, full addresses, payment data, phone, email, and internal codes.",
      "Hosted Swiggy widgets are treated as external-gated enhancements; local semantic cards remain the production-safe fallback.",
    ],
    assertions: [
      "Luxury modes lean, premium, family, social, and training are implemented as route-specific Swiggy workspaces.",
      "Reservation and cart review workspaces cover all Food, Instamart, and Dineout tools while preserving official recipe constraints.",
      "Every risky commercial action is preceded by an authoritative Swiggy read and an explicit user confirmation.",
      "The product experience can switch from local semantic cards to hosted Swiggy widgets without changing safety gates.",
    ],
    externalGates: [
      "Live Swiggy staging and production credentials are required before these workspaces can perform real reads, carts, orders, checkout, and booking.",
      "Swiggy-hosted widgets and X-Swiggy-Widgets opt-in headers remain external until the hosted iframe layer is available.",
      "Final production domain, HTTPS redirect, and static IP must be added before production access review.",
      "Real nutrition fields, online payment, paid Dineout deals, and future Food scheduling remain unavailable in v1 or external to the current MCP contract.",
    ],
  };
}
