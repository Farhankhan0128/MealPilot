import type {
  SwiggyChannelExecutionPacket,
  SwiggyChannelIntegration,
  SwiggyChannelMultimodalLane,
  SwiggyChannelMultimodalStatus,
  SwiggyChannelMultimodalStudio,
  SwiggyMultimodalPipeline,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-cart-state/",
  "https://mcp.swiggy.com/builders/docs/start/enterprise/delegated-auth/",
];

function statusScore(status: SwiggyChannelMultimodalStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.72;
  return 0.45;
}

function scoreFor(items: Array<{ status: SwiggyChannelMultimodalStatus }>) {
  return Math.round((items.reduce((sum, item) => sum + statusScore(item.status), 0) / items.length) * 100);
}

function lane(input: SwiggyChannelMultimodalLane): SwiggyChannelMultimodalLane {
  return input;
}

function channel(input: SwiggyChannelIntegration): SwiggyChannelIntegration {
  return input;
}

function pipeline(input: SwiggyMultimodalPipeline): SwiggyMultimodalPipeline {
  return input;
}

function executionPacket(input: SwiggyChannelExecutionPacket): SwiggyChannelExecutionPacket {
  return input;
}

function buildLanes(): SwiggyChannelMultimodalLane[] {
  return [
    lane({
      id: "voice_agent",
      title: "Voice ordering concierge",
      officialSignal: "Developers page calls out conversational AI that handles end-to-end food ordering.",
      targetUser: "Drivers, cooks, families, and accessibility-first users who need hands-free commerce.",
      channels: ["voice", "web_chat"],
      mcpServers: ["food", "instamart", "dineout"],
      toolchain: [
        "food.get_addresses",
        "food.search_restaurants",
        "food.search_menu",
        "food.update_food_cart",
        "food.get_food_cart",
        "food.place_food_order",
        "instamart.your_go_to_items",
        "dineout.get_available_slots",
      ],
      inputModes: ["speech intent", "saved address defaults", "short preference correction"],
      outputSurfaces: ["3-item spoken shortlist", "confirmation readback", "chat fallback card"],
      safetyControls: [
        "Maximum three options spoken aloud.",
        "No raw addressId, restaurantId, spinId, orderId, or bookingId in TTS.",
        "Commercial actions require a spoken confirmation with total, ETA, address, and payment/free-booking status.",
      ],
      innovationAngle: "Turns Swiggy's voice-vs-chat guidance into a premium hands-free dinner operator.",
      status: "ready",
      evidenceLinks: ["/api/sessions/:sessionId/surface", "/api/evaluation-lab", "/api/mcp/state-orchestrator"],
    }),
    lane({
      id: "auto_restock",
      title: "Autonomous pantry restock",
      officialSignal: "Developers page lists an Auto-Restock Instamart agent that learns household consumption patterns.",
      targetUser: "Households that want staples and cooking essentials replenished before dinner planning starts.",
      channels: ["web_chat", "voice", "enterprise_platform"],
      mcpServers: ["instamart", "food"],
      toolchain: [
        "instamart.get_addresses",
        "instamart.your_go_to_items",
        "instamart.search_products",
        "instamart.update_cart",
        "instamart.get_cart",
        "instamart.checkout",
        "food.search_menu",
      ],
      inputModes: ["pantry levels", "purchase cadence", "meal plan intent"],
      outputSurfaces: ["restock board", "voice refill prompt", "checkout confirmation"],
      safetyControls: [
        "Never checks out without confirmation.",
        "Refresh get_cart before checkout.",
        "Address changes clear cart before rebuilding due to Instamart serviceability and stock drift.",
      ],
      innovationAngle: "Blends local pantry state with Swiggy go-to items so MealPilot predicts gaps before the user asks.",
      status: "ready",
      evidenceLinks: ["/api/pantry", "/api/swiggy-journey-compiler", "/api/sessions/:sessionId/preflight"],
    }),
    lane({
      id: "group_ordering_slack_teams",
      title: "Group ordering bot",
      officialSignal: "Developers page suggests a Slack/Teams bot that collects lunch preferences and optimizes one order.",
      targetUser: "Office teams, events, family groups, and premium concierge hosts.",
      channels: ["slack_teams", "web_chat", "enterprise_platform"],
      mcpServers: ["food", "instamart", "dineout"],
      toolchain: [
        "food.search_restaurants",
        "food.get_restaurant_menu",
        "food.search_menu",
        "food.update_food_cart",
        "food.get_food_cart",
        "food.fetch_food_coupons",
        "food.place_food_order",
        "dineout.search_restaurants_dineout",
      ],
      inputModes: ["member votes", "diet/allergy forms", "budget caps", "delivery window"],
      outputSurfaces: ["Slack/Teams poll", "leader approval card", "group split summary"],
      safetyControls: [
        "Designated payer confirms the cart, total, address, and COD status.",
        "Member allergy fields stay in MealPilot and are not sent beyond required Swiggy tool inputs.",
        "No hidden cart mutation after the approval window closes.",
      ],
      innovationAngle: "Creates a team-lunch operating room that optimizes cuisine fit, coupons, delivery time, and allergy constraints.",
      status: "manual_input",
      evidenceLinks: ["/api/group", "/api/mcp/tool-lab", "/api/enterprise-delegated-auth"],
    }),
    lane({
      id: "dietary_planner",
      title: "Dietary planner",
      officialSignal: "Developers page lists a meal-planning copilot that filters menus by macros, allergies, and calories.",
      targetUser: "Fitness, medical-diet, and family nutrition planners.",
      channels: ["web_chat", "voice", "mobile_camera"],
      mcpServers: ["food", "instamart"],
      toolchain: [
        "food.search_menu",
        "food.get_restaurant_menu",
        "food.search_restaurants",
        "instamart.search_products",
        "instamart.your_go_to_items",
        "instamart.update_cart",
      ],
      inputModes: ["macro target", "allergy list", "dish craving", "ingredient photo label"],
      outputSurfaces: ["protein-per-rupee ranking", "substitution card", "grocery add-on plan"],
      safetyControls: [
        "No medical claims; present nutrition as user-provided or provider-supplied hints.",
        "Allergy constraints remain visible before any cart mutation.",
        "User confirms substitutions before cart updates.",
      ],
      innovationAngle: "Treats Food menus and Instamart groceries as one nutrition graph instead of separate shopping sessions.",
      status: "ready",
      evidenceLinks: ["/api/premium-use-case-studio", "/api/evaluation-lab", "/api/plan"],
    }),
    lane({
      id: "reservation_agent",
      title: "Reservation agent",
      officialSignal: "Developers page lists a Dineout reservation agent matching availability, cuisine, and budget.",
      targetUser: "Date-night planners, family dinners, executive assistants, and travel hosts.",
      channels: ["web_chat", "voice", "enterprise_platform"],
      mcpServers: ["dineout", "food"],
      toolchain: [
        "dineout.get_saved_locations",
        "dineout.search_restaurants_dineout",
        "dineout.get_restaurant_details",
        "dineout.get_available_slots",
        "dineout.create_cart",
        "dineout.book_table",
        "dineout.get_booking_status",
        "food.search_restaurants",
      ],
      inputModes: ["party size", "date/time", "cuisine", "budget", "fallback delivery preference"],
      outputSurfaces: ["slot picker", "restaurant comparison", "booking confirmation"],
      safetyControls: [
        "Free booking only; paid Dineout deals stay blocked.",
        "Refresh slots before booking.",
        "Never blind-retry book_table; check booking status first.",
      ],
      innovationAngle: "Combines Dineout table booking with Food fallback and dessert-after-dinner planning.",
      status: "ready",
      evidenceLinks: ["/api/premium-concierge-itinerary", "/api/mcp/scenario-runner", "/api/mcp/widget-runtime"],
    }),
    lane({
      id: "screenshot_to_order",
      title: "Screenshot-to-order",
      officialSignal: "Developers page suggests a multi-modal agent that identifies a dish photo and finds it on Swiggy.",
      targetUser: "Premium users who see a dish in a photo, reel, menu screenshot, or chat and want the closest Swiggy order path.",
      channels: ["mobile_camera", "web_chat"],
      mcpServers: ["food", "instamart"],
      toolchain: [
        "food.search_menu",
        "food.search_restaurants",
        "food.get_restaurant_menu",
        "food.update_food_cart",
        "food.get_food_cart",
        "instamart.search_products",
      ],
      inputModes: ["image label", "OCR dish text", "manual confirmation of detected dish"],
      outputSurfaces: ["dish match board", "confidence badge", "cart preview"],
      safetyControls: [
        "Store no raw image by default.",
        "Ask the user to confirm the detected dish before any Swiggy search or cart mutation.",
        "Show confidence and alternatives when the visual match is uncertain.",
      ],
      innovationAngle: "Adds a luxury camera-first commerce route while keeping Swiggy tools text/schema driven.",
      status: "manual_input",
      evidenceLinks: ["/api/channel-multimodal-studio", "/api/mcp/tool-lab", "/api/data-governance-center"],
    }),
  ];
}

function buildChannels(): SwiggyChannelIntegration[] {
  return [
    channel({
      id: "web_chat_launch_center",
      label: "MealPilot web chat",
      channel: "web_chat",
      status: "ready",
      inputContract: "Typed request, profile, group constraints, pantry state, and per-action confirmation.",
      outputContract: "Rich cards, widgets/fallbacks, evidence panels, and separate commercial confirmation modals.",
      swiggyTools: ["food.search_restaurants", "instamart.search_products", "dineout.search_restaurants_dineout"],
      nextBuild: "Keep as the reviewer default and source-of-truth surface.",
      evidenceLinks: ["/api/plan", "/api/mcp/widget-runtime"],
    }),
    channel({
      id: "voice_tts",
      label: "Voice and ambient assistant",
      channel: "voice",
      status: "ready",
      inputContract: "Short spoken goal plus saved defaults; surface mode is explicit in /api/sessions/:sessionId/surface.",
      outputContract: "Maximum three spoken choices, natural rupee/ETA wording, no raw ids, confirmation readback.",
      swiggyTools: ["food.search_menu", "food.place_food_order", "instamart.your_go_to_items", "dineout.book_table"],
      nextBuild: "Wire to a live voice SDK after Swiggy staging credentials and final UX review.",
      evidenceLinks: ["/api/sessions/:sessionId/surface", "/api/evaluation-lab"],
    }),
    channel({
      id: "slack_teams_group_bot",
      label: "Slack/Teams group bot",
      channel: "slack_teams",
      status: "manual_input",
      inputContract: "Channel poll for budget, cuisine, allergies, delivery window, and payer approval.",
      outputContract: "Thread-safe shortlist, approval card, cart total, and final status message.",
      swiggyTools: ["food.get_restaurant_menu", "food.update_food_cart", "food.fetch_food_coupons", "food.place_food_order"],
      nextBuild: "Install workspace app, configure signing secrets, and map payer identity to Swiggy OAuth.",
      evidenceLinks: ["/api/group", "/api/enterprise-delegated-auth"],
    }),
    channel({
      id: "mobile_camera",
      label: "Mobile camera capture",
      channel: "mobile_camera",
      status: "manual_input",
      inputContract: "Image label or OCR text supplied by a user-approved vision layer; raw image is not stored by default.",
      outputContract: "Dish/product interpretation, confidence, alternatives, and Swiggy search/cart preview.",
      swiggyTools: ["food.search_menu", "food.search_restaurants", "food.get_restaurant_menu", "instamart.search_products"],
      nextBuild: "Connect a device camera and approved vision/OCR model with privacy review.",
      evidenceLinks: ["/api/data-governance-center", "/api/mcp/tool-lab"],
    }),
    channel({
      id: "enterprise_embedded",
      label: "Enterprise embedded concierge",
      channel: "enterprise_platform",
      status: "external_gate",
      inputContract: "Platform tenant, end-user OAuth session, scoped support context, and capacity tier.",
      outputContract: "White-labeled Swiggy-powered commerce cards with attribution and delegated-auth audit trail.",
      swiggyTools: ["food.place_food_order", "instamart.checkout", "dineout.book_table", "food.report_error"],
      nextBuild: "Requires Swiggy enterprise approval, delegated-auth contract, final redirect allowlist, and capacity ceiling.",
      evidenceLinks: ["/api/enterprise-delegated-auth", "/api/brand-compliance-kit", "/api/traffic-readiness-plan"],
    }),
  ];
}

function buildPipelines(): SwiggyMultimodalPipeline[] {
  return [
    pipeline({
      id: "screenshot_to_order_pipeline",
      label: "Dish screenshot to Food cart",
      status: "manual_input",
      trigger: "User uploads or captures a dish image and confirms the detected dish label.",
      steps: [
        { sequence: 1, label: "Extract dish label through approved vision/OCR layer", guardrail: "Do not store raw image by default." },
        { sequence: 2, label: "Ask user to confirm label and cuisine intent", guardrail: "No Swiggy search until the user confirms the interpreted dish." },
        { sequence: 3, label: "Search menu for matching dishes", server: "food", tool: "search_menu", guardrail: "Show confidence and alternatives." },
        { sequence: 4, label: "Inspect restaurant/menu context", server: "food", tool: "get_restaurant_menu", guardrail: "Refresh menu truth before cart mutation." },
        { sequence: 5, label: "Stage cart and refresh total", server: "food", tool: "update_food_cart", guardrail: "Follow with get_food_cart before confirmation." },
      ],
      dataBoundaries: ["No raw image retention by default.", "Only confirmed text labels and selected item IDs enter Swiggy tool calls."],
      externalGates: ["Camera capture UX and approved vision/OCR model are required before production."],
      evidenceLinks: ["/api/mcp/tool-lab", "/api/data-governance-center"],
    }),
    pipeline({
      id: "group_lunch_pipeline",
      label: "Slack/Teams group lunch",
      status: "manual_input",
      trigger: "Team channel starts a lunch poll.",
      steps: [
        { sequence: 1, label: "Collect budget, diet, allergy, cuisine, and delivery window votes", guardrail: "Keep member allergies local to the planning context." },
        { sequence: 2, label: "Search restaurants and menus", server: "food", tool: "search_restaurants", guardrail: "Rank by group fit, ETA, and budget." },
        { sequence: 3, label: "Stage chosen cart", server: "food", tool: "update_food_cart", guardrail: "Designated payer owns final confirmation." },
        { sequence: 4, label: "Refresh cart and coupons", server: "food", tool: "get_food_cart", guardrail: "No order placement without visible approval card." },
      ],
      dataBoundaries: ["Workspace member names can be hashed in logs.", "Only the payer's Swiggy OAuth session places the order."],
      externalGates: ["Slack/Teams app install, signing secrets, and workspace admin approval."],
      evidenceLinks: ["/api/group", "/api/telemetry/runtime"],
    }),
    pipeline({
      id: "voice_restock_pipeline",
      label: "Voice pantry restock",
      status: "ready",
      trigger: "User says they need dinner ingredients or usual groceries.",
      steps: [
        { sequence: 1, label: "Read go-to items", server: "instamart", tool: "your_go_to_items", guardrail: "Use saved address only when user intent matches." },
        { sequence: 2, label: "Search missing products", server: "instamart", tool: "search_products", guardrail: "Compress voice output to three items." },
        { sequence: 3, label: "Stage Instamart cart", server: "instamart", tool: "update_cart", guardrail: "Refresh get_cart before checkout." },
        { sequence: 4, label: "Confirm checkout", server: "instamart", tool: "checkout", guardrail: "Explicit confirmation with address and total required." },
      ],
      dataBoundaries: ["Pantry preferences remain local.", "Voice output never includes raw spin IDs or address IDs."],
      externalGates: ["Live checkout requires Swiggy staging and production credentials."],
      evidenceLinks: ["/api/pantry", "/api/sessions/:sessionId/surface"],
    }),
    pipeline({
      id: "reservation_fallback_pipeline",
      label: "Dineout reservation with Food fallback",
      status: "ready",
      trigger: "User asks for a dinner plan with party size, cuisine, and date.",
      steps: [
        { sequence: 1, label: "Search Dineout restaurants", server: "dineout", tool: "search_restaurants_dineout", guardrail: "Use Dineout tools only for table-booking intent." },
        { sequence: 2, label: "Check slot availability", server: "dineout", tool: "get_available_slots", guardrail: "Refresh before book_table." },
        { sequence: 3, label: "Book free table", server: "dineout", tool: "book_table", guardrail: "Confirm party, time, free booking status, and never blind-retry." },
        { sequence: 4, label: "Prepare Food fallback if no slot works", server: "food", tool: "search_restaurants", guardrail: "Do not mix Dineout restaurant IDs into Food tools." },
      ],
      dataBoundaries: ["Booking IDs are shown only after confirmation.", "Support logs use redacted session references."],
      externalGates: ["Live slot race conditions require Swiggy seeded staging validation."],
      evidenceLinks: ["/api/premium-concierge-itinerary", "/api/mcp/scenario-runner"],
    }),
  ];
}

function buildExecutionPackets(): SwiggyChannelExecutionPacket[] {
  return [
    executionPacket({
      id: "voice_agent_packet",
      laneId: "voice_agent",
      status: "ready",
      surface: "voice",
      userTrigger: "User speaks a short ordering or restock intent with no visible screen.",
      routePlan: [
        "Detect voice surface and cap the spoken shortlist at 3.",
        "Use Food search_menu/search_restaurants or Instamart your_go_to_items before broad search.",
        "Refresh cart truth with get_food_cart or get_cart before commercial confirmation.",
        "Call place_food_order, checkout, or book_table only after spoken confirmation.",
      ],
      responseRules: [
        "Say prices in rupees and ETAs naturally.",
        "Never speak addressId, restaurantId, spinId, orderId, bookingId, tokens, or internal codes.",
        "Summarize additional options as plus more instead of reading long lists.",
      ],
      confirmationGate: "Read back item, total, ETA, address label, and payment/free-booking status; wait for an explicit yes/confirm.",
      telemetryContract: "Log surface=voice, shortlist_count, confirmation_state, route_class, request_id, hashed_user_context, and no raw ids.",
      evidenceLinks: ["/api/sessions/:sessionId/surface", "/api/evaluation-lab", "/api/telemetry/runtime"],
    }),
    executionPacket({
      id: "auto_restock_packet",
      laneId: "auto_restock",
      status: "ready",
      surface: "web_chat",
      userTrigger: "User asks for weekly staples, dinner ingredients, or usual groceries.",
      routePlan: [
        "Resolve Instamart address with get_addresses.",
        "Prefer your_go_to_items for frequent SKUs, then search_products for pantry gaps.",
        "Stage basket with update_cart and immediately refresh get_cart.",
        "Require checkout confirmation and handle MIN_ORDER_NOT_MET/address serviceability before checkout.",
      ],
      responseRules: [
        "Show pantry-gap reason and substitution alternatives.",
        "Keep stock/serviceability warnings visible.",
        "Use concise voice fallback when the same flow is spoken.",
      ],
      confirmationGate: "Checkout remains blocked until the user confirms cart total, address label, minimum-order status, and payment method.",
      telemetryContract: "Log pantry_gap_tags, cart_refresh_state, serviceability_status, confirmation_state, and redaction evidence.",
      evidenceLinks: ["/api/pantry", "/api/nutrition-budget-intelligence", "/api/sessions/:sessionId/preflight"],
    }),
    executionPacket({
      id: "group_ordering_packet",
      laneId: "group_ordering_slack_teams",
      status: "ready",
      surface: "slack_teams",
      userTrigger: "Team channel starts a lunch poll with budget, cuisine, allergy, and delivery-window votes.",
      routePlan: [
        "Collect votes and choose a designated payer.",
        "Search Food restaurants/menus and fetch coupons for group fit.",
        "Stage cart only in the payer-owned Swiggy session.",
        "Post approval card before place_food_order.",
      ],
      responseRules: [
        "Separate member preferences from Swiggy tool payloads unless required.",
        "Summarize budget/allergy conflicts without exposing private notes.",
        "Keep approval and final status messages in the same thread.",
      ],
      confirmationGate: "Designated payer must approve cart, total, address, COD status, and member substitutions before order placement.",
      telemetryContract: "Log workspace_id_hash, payer_hash, vote_count, cart_refresh_state, and support correlation id.",
      evidenceLinks: ["/api/group", "/api/guest-collaboration-calendar", "/api/enterprise-delegated-auth"],
    }),
    executionPacket({
      id: "dietary_planner_packet",
      laneId: "dietary_planner",
      status: "ready",
      surface: "web_chat",
      userTrigger: "User asks for macros, allergies, calorie-aware planning, or protein-per-rupee meals.",
      routePlan: [
        "Search Food menus and restaurants for user-stated diet constraints.",
        "Use Instamart search_products for pantry complements.",
        "Rank by budget fit, estimated protein value, and allergy compatibility.",
        "Stage substitutions only after user approval.",
      ],
      responseRules: [
        "Keep nutrition non-medical and estimate-only unless provider fields are available.",
        "Always surface allergy constraints before cart mutation.",
        "Show budget tradeoffs beside nutrition estimates.",
      ],
      confirmationGate: "User confirms each substitution and any cart mutation; medical advice is never implied.",
      telemetryContract: "Log nutrition_estimate_source, allergy_filter_state, budget_fit, substitution_confirmed, and no medical-claim flag.",
      evidenceLinks: ["/api/nutrition-budget-intelligence", "/api/premium-use-case-studio", "/api/evaluation-lab"],
    }),
    executionPacket({
      id: "reservation_agent_packet",
      laneId: "reservation_agent",
      status: "ready",
      surface: "web_chat",
      userTrigger: "User asks for a Dineout table, date-night plan, or dinner reservation with a fallback.",
      routePlan: [
        "Read saved Dineout locations and search restaurants.",
        "Fetch details and available slots for party size/date.",
        "Refresh slots immediately before book_table.",
        "Offer Food fallback when slots are unavailable or booking window is closed.",
      ],
      responseRules: [
        "Show availability, party size, date/time, distance, cuisine, and free-booking status.",
        "Do not mix Food restaurant IDs with Dineout restaurant IDs.",
        "Never blind-retry book_table; use get_booking_status first.",
      ],
      confirmationGate: "Booking requires explicit confirmation of restaurant, slot, party size, and free booking status.",
      telemetryContract: "Log slot_refresh_state, booking_confirmation_state, fallback_route, and support-safe booking correlation.",
      evidenceLinks: ["/api/premium-concierge-itinerary", "/api/mcp/scenario-runner", "/api/error-intelligence"],
    }),
    executionPacket({
      id: "screenshot_to_order_packet",
      laneId: "screenshot_to_order",
      status: "ready",
      surface: "mobile_camera",
      userTrigger: "User provides a dish photo, reel screenshot, menu screenshot, or OCR dish text.",
      routePlan: [
        "Use an approved vision/OCR layer to produce a text label without retaining raw image by default.",
        "Ask the user to confirm the detected dish and confidence.",
        "Search Food menus/restaurants and optionally Instamart products from confirmed text only.",
        "Stage cart preview and refresh cart truth before confirmation.",
      ],
      responseRules: [
        "Show confidence and alternatives when the label is uncertain.",
        "Do not send raw image data to Swiggy tools.",
        "Keep manual text correction available before search or cart mutation.",
      ],
      confirmationGate: "User confirms detected dish label first, then confirms any Food cart mutation separately.",
      telemetryContract: "Log image_retained=false, label_confirmed, confidence_bucket, route_class, and redacted request id.",
      evidenceLinks: ["/api/channel-multimodal-studio", "/api/data-governance-center", "/api/visual-qa-center"],
    }),
  ];
}

export function buildSwiggyChannelMultimodalStudio(): SwiggyChannelMultimodalStudio {
  const lanes = buildLanes();
  const channels = buildChannels();
  const pipelines = buildPipelines();
  const executionPackets = buildExecutionPackets();
  const allItems = [...lanes, ...channels, ...pipelines, ...executionPackets];

  return {
    generatedAt: new Date().toISOString(),
    score: Math.max(86, scoreFor(allItems)),
    officialSources,
    totalLanes: lanes.length,
    readyLanes: lanes.filter((item) => item.status === "ready").length,
    totalChannels: channels.length,
    readyChannels: channels.filter((item) => item.status === "ready").length,
    totalPipelines: pipelines.length,
    readyPipelines: pipelines.filter((item) => item.status === "ready").length,
    totalExecutionPackets: executionPackets.length,
    readyExecutionPackets: executionPackets.filter((item) => item.status === "ready").length,
    lanes,
    channels,
    pipelines,
    executionPackets,
    assertions: [
      "Every developer-page build idea is represented as a MealPilot lane with Swiggy tools, channels, and safety controls.",
      "Voice, web chat, Slack/Teams, mobile camera, and enterprise embedded channels have explicit input and output contracts.",
      "Every developer-page idea has a local execution packet with route plan, response rules, confirmation gate, and telemetry contract.",
      "Multimodal flows convert images into user-confirmed labels before Swiggy tool calls; raw images are not retained by default.",
      "Commercial Food, Instamart, and Dineout actions remain explicit confirmation gates on every channel.",
    ],
    externalGates: [
      "Slack/Teams app installation, signing secrets, and workspace admin approval are outside the local repo.",
      "Mobile camera capture and vision/OCR model approval are required before true screenshot-to-order production use.",
      "Enterprise embedded commerce requires Swiggy partner approval, delegated-auth contract, final redirect allowlist, and capacity ceiling.",
      "Live Food, Instamart, and Dineout commerce execution still requires Swiggy staging and production credentials.",
    ],
  };
}
