import crypto from "node:crypto";
import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyDiscoveryResolution,
  SwiggyDiscoveryFreshnessControl,
  SwiggyDiscoveryFreshnessLane,
  SwiggyDiscoveryFreshnessReport,
  SwiggyDiscoveryFreshnessScenario,
  SwiggyDiscoveryFreshnessStatus,
  SwiggyDiscoveryFreshnessTelemetry,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/reference/food/search_restaurants/",
  "https://mcp.swiggy.com/builders/docs/reference/food/search_menu/",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_restaurant_menu/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/search_products/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/your_go_to_items/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/search_restaurants_dineout/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_restaurant_details/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_available_slots/",
];

function statusWeight(status: SwiggyDiscoveryFreshnessStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.48;
}

function laneForTool(tool: SwiggyDiscoveryResolution["input"]["discoveryTool"]) {
  if (tool === "search_restaurants") return "food_restaurant_search";
  if (tool === "get_restaurant_menu" || tool === "search_menu") return "food_menu_detail";
  if (tool === "search_products" || tool === "your_go_to_items") return "instamart_product_search";
  if (tool === "search_restaurants_dineout" || tool === "get_restaurant_details") return "dineout_search_and_details";
  return "dineout_slot_freshness";
}

function nextToolFor(input: {
  server: SwiggyServer;
  tool: SwiggyDiscoveryResolution["input"]["discoveryTool"];
  downstreamIntent: SwiggyDiscoveryResolution["input"]["downstreamIntent"];
}) {
  if (input.downstreamIntent === "cart_mutation") {
    if (input.server === "food") return "search_menu then /api/swiggy-cart-mutation-workbench/mutate";
    if (input.server === "instamart") return "select variant spinId then /api/swiggy-cart-mutation-workbench/mutate";
    return "get_available_slots before Dineout create_cart gate";
  }
  if (input.downstreamIntent === "booking") return "get_available_slots then confirmation command center";
  if (input.downstreamIntent === "combined_plan") return "refresh affected server discovery lanes";
  if (input.tool === "search_restaurants") return "get_restaurant_menu or search_menu";
  if (input.tool === "search_restaurants_dineout") return "get_restaurant_details";
  if (input.tool === "get_restaurant_details") return "get_available_slots";
  return "ask user to choose a result";
}

function responseData(response: unknown): unknown {
  if (!response || typeof response !== "object") return undefined;
  const result = (response as { result?: unknown }).result;
  if (result && typeof result === "object" && "data" in result) return (result as { data?: unknown }).data;
  return undefined;
}

function firstLabel(item: unknown): string {
  if (!item || typeof item !== "object") return "available_result";
  const row = item as Record<string, unknown>;
  for (const key of ["name", "title", "time", "id", "spinId"]) {
    if (typeof row[key] === "string") return row[key] as string;
  }
  return "available_result";
}

function summarizeDiscoveryResponse(response: unknown): SwiggyDiscoveryResolution["resultSummary"] {
  const data = responseData(response);
  if (Array.isArray(data)) {
    return {
      available: data.length > 0,
      resultCount: data.length,
      primaryLabel: data.length ? firstLabel(data[0]) : "none",
      freshnessTag: "live_readback",
    };
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const nested = Array.isArray(record.restaurants) ? record.restaurants : Array.isArray(record.items) ? record.items : undefined;
    if (nested) {
      return {
        available: nested.length > 0,
        resultCount: nested.length,
        primaryLabel: nested.length ? firstLabel(nested[0]) : "none",
        freshnessTag: "live_readback",
      };
    }
    return {
      available: true,
      resultCount: 1,
      primaryLabel: firstLabel(record),
      freshnessTag: "live_readback",
    };
  }
  return { available: false, resultCount: 0, primaryLabel: "none", freshnessTag: "empty_readback" };
}

function hashArguments(args: Record<string, unknown>) {
  return crypto.createHash("sha256").update(JSON.stringify(args)).digest("hex").slice(0, 16);
}

function isToolServerMatch(server: SwiggyServer, tool: SwiggyDiscoveryResolution["input"]["discoveryTool"]) {
  if (server === "food") return ["search_restaurants", "get_restaurant_menu", "search_menu"].includes(tool);
  if (server === "instamart") return ["search_products", "your_go_to_items"].includes(tool);
  return ["search_restaurants_dineout", "get_restaurant_details", "get_available_slots"].includes(tool);
}

export function buildSwiggyDiscoveryFreshness(options: {
  config: ServerConfig;
  plans: MealPlan[];
}): SwiggyDiscoveryFreshnessReport {
  const latestPlan = options.plans.at(-1);
  const recommendationCount = latestPlan?.recommendations.length ?? 3;

  const lanes: SwiggyDiscoveryFreshnessLane[] = [
    {
      id: "food_restaurant_search",
      server: "food",
      label: "Food Restaurant Search",
      officialTools: ["search_restaurants"],
      freshnessRule: "Use addressId from get_addresses and nextOffset pagination; do not reuse restaurant lists after address switches.",
      selectionRule: "Restaurant and cuisine searches stay Food-only and never satisfy Dineout reservation intent.",
      mutationBoundary: "Restaurant results feed get_restaurant_menu, search_menu, and cart mutation only after the user chooses a provider.",
      status: "ready",
      evidenceLinks: [officialSources[2], "/api/swiggy-location-trust"],
    },
    {
      id: "food_menu_detail",
      server: "food",
      label: "Food Menu Detail",
      officialTools: ["get_restaurant_menu", "search_menu"],
      freshnessRule: "Use paginated get_restaurant_menu for browsing and search_menu for orderable item customization details.",
      selectionRule: "Variants, variations, variantsV2, and add-ons must match the exact format returned by search_menu.",
      mutationBoundary: "Cart writes wait until valid_addons are confirmed by the cart response.",
      status: "ready",
      evidenceLinks: [officialSources[3], officialSources[4], "/api/swiggy-cart-mutation-workbench"],
    },
    {
      id: "instamart_product_search",
      server: "instamart",
      label: "Instamart Product Search",
      officialTools: ["search_products", "your_go_to_items"],
      freshnessRule: "Use the selected addressId for product availability and frequently ordered items.",
      selectionRule: "Always ask the user to choose the exact variant or spinId before adding to an Instamart cart.",
      mutationBoundary: "update_cart receives only variants that came from a fresh search_products or your_go_to_items response.",
      status: "ready",
      evidenceLinks: [officialSources[5], officialSources[6], "/api/swiggy-cart-mutation-workbench"],
    },
    {
      id: "dineout_search_and_details",
      server: "dineout",
      label: "Dineout Search and Details",
      officialTools: ["search_restaurants_dineout", "get_restaurant_details"],
      freshnessRule: "Use Dineout search only for going-out intent; query should not include city when coordinates or saved location are supplied.",
      selectionRule: "Restaurant details use the restaurantId from search results and the same coordinates used in search.",
      mutationBoundary: "Reservation and cart flows wait for details and user-selected restaurant context.",
      status: "ready",
      evidenceLinks: [officialSources[7], officialSources[8], "/api/swiggy-location-trust"],
    },
    {
      id: "dineout_slot_freshness",
      server: "dineout",
      label: "Dineout Slot Freshness",
      officialTools: ["get_available_slots"],
      freshnessRule: "Slot search returns up to 7 days from the requested date and carries slotId, itemId, reservationTime, and deal data.",
      selectionRule: "User selection must preserve slot group, guest count, itemId, and free booking constraints before book_table.",
      mutationBoundary: "book_table and create_cart are blocked until the selected slot is still present in the latest slot response.",
      status: "ready",
      evidenceLinks: [officialSources[9], "/api/swiggy-order-lifecycle"],
    },
    {
      id: "cross_server_discovery_coordinator",
      server: "combined",
      label: "Cross-server Discovery Coordinator",
      officialTools: [
        "search_restaurants",
        "search_menu",
        "search_products",
        "search_restaurants_dineout",
        "get_available_slots",
      ],
      freshnessRule: `Coordinate ${recommendationCount} recommendations without mixing Food delivery, grocery, and reservation semantics.`,
      selectionRule: "Preserve source server, address/saved-location context, and result identifiers through every recommendation card.",
      mutationBoundary: "Any address, query, date, guest-count, or provider switch invalidates downstream cart, slot, coupon, and confirmation state.",
      status: "watch",
      evidenceLinks: ["/api/mcp/scenario-runner", "/api/swiggy-route-optimizer", "/api/mcp/state-orchestrator"],
    },
    {
      id: "live_discovery_calibration",
      server: "combined",
      label: "Live Discovery Calibration",
      officialTools: ["search_restaurants", "search_products", "search_restaurants_dineout", "get_available_slots"],
      freshnessRule: "Replay top discovery routes against Swiggy staging accounts before production credentials enable live search traffic.",
      selectionRule: "Compare mock relevance, live result shape, pagination, availability, and slot windows.",
      mutationBoundary: "Live discovery remains read-only until staging transcripts prove downstream cart and booking guards.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix"],
    },
  ];

  const controls: SwiggyDiscoveryFreshnessControl[] = [
    {
      id: "intent_routing",
      label: "Intent Routing",
      policy: "Food delivery, Instamart grocery, and Dineout reservation intent are routed to separate search tools and never collapsed by keyword alone.",
      status: "ready",
      evidenceLinks: ["/api/swiggy-journey-compiler", "/api/mcp/tool-contract-matrix"],
    },
    {
      id: "pagination_truth",
      label: "Pagination Truth",
      policy: "Search offsets and menu page/pageSize are preserved so show more requests fetch fresh data instead of inventing unseen items.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[4]],
    },
    {
      id: "variant_truth",
      label: "Variant Truth",
      policy: "Food and Instamart variants are chosen from fresh tool responses; add-ons and spinIds are never synthesized.",
      status: "ready",
      evidenceLinks: [officialSources[3], officialSources[5], officialSources[6]],
    },
    {
      id: "coordinate_consistency",
      label: "Coordinate Consistency",
      policy: "Dineout details and slots use the same coordinates or saved address context used during restaurant search.",
      status: "ready",
      evidenceLinks: [officialSources[7], officialSources[8], officialSources[9]],
    },
    {
      id: "freshness_invalidation",
      label: "Freshness Invalidation",
      policy: "Address, restaurant, date, guest-count, or query switches invalidate downstream cart, coupon, slot, and confirmation state.",
      status: "ready",
      evidenceLinks: ["/api/mcp/state-orchestrator", "/api/swiggy-cart-mutation-workbench"],
    },
  ];

  const scenarios: SwiggyDiscoveryFreshnessScenario[] = [
    {
      id: "food_more_menu_options",
      label: "Food More Menu Options",
      trigger: "User wants more dishes from a selected restaurant.",
      expectedDecision: "Use get_restaurant_menu pagination for browsing, then search_menu for the exact item before cart mutation.",
      tools: ["get_restaurant_menu", "search_menu"],
      status: "ready",
    },
    {
      id: "instamart_variant_choice",
      label: "Instamart Variant Choice",
      trigger: "User asks to add milk or fruit from groceries.",
      expectedDecision: "Search products at selected address, present variants, ask for the exact pack, then pass spinId to cart update.",
      tools: ["search_products", "update_cart"],
      status: "ready",
    },
    {
      id: "go_to_items_restock",
      label: "Go-to Items Restock",
      trigger: "User asks to restock usual weekly staples.",
      expectedDecision: "Use your_go_to_items with addressId, show products and variants, and avoid adding without variant confirmation.",
      tools: ["your_go_to_items", "update_cart"],
      status: "ready",
    },
    {
      id: "dineout_slot_selection",
      label: "Dineout Slot Selection",
      trigger: "User wants a rooftop table this weekend.",
      expectedDecision: "Search Dineout with correct locality semantics, get details with same coordinates, fetch slots, and preserve slotId/itemId.",
      tools: ["search_restaurants_dineout", "get_restaurant_details", "get_available_slots"],
      status: "ready",
    },
  ];

  const telemetry: SwiggyDiscoveryFreshnessTelemetry[] = [
    { field: "discovery_query_hash", source: "search tools", redaction: "hash query and preserve intent class", status: "ready" },
    { field: "source_tool", source: "tool router", redaction: "tool name only", status: "ready" },
    { field: "result_id_hash", source: "search/detail response", redaction: "hash restaurant, item, spin, slot, and deal ids", status: "ready" },
    { field: "freshness_invalidated_by", source: "state orchestrator", redaction: "reason enum only", status: "ready" },
    { field: "live_relevance_delta", source: "staging calibration", redaction: "aggregate score only", status: "external_gate" },
  ];

  const externalGates = [
    "Staging credentials are required to compare live search relevance, pagination, and availability.",
    "Live slot windows and deal availability must be replayed with seeded Dineout accounts before production launch.",
    "Raw queries, restaurant ids, item ids, spin ids, slot ids, coordinates, and address ids are never logged raw.",
  ];

  const score =
    (lanes.reduce((sum, lane) => sum + statusWeight(lane.status), 0) / lanes.length) * 30 +
    (controls.reduce((sum, control) => sum + statusWeight(control.status), 0) / controls.length) * 25 +
    (scenarios.reduce((sum, scenario) => sum + statusWeight(scenario.status), 0) / scenarios.length) * 25 +
    (telemetry.reduce((sum, field) => sum + statusWeight(field.status), 0) / telemetry.length) * 20;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round(score),
    mode: options.config.swiggyMode,
    officialSources,
    totals: {
      lanes: lanes.length,
      toolsCovered: new Set(lanes.flatMap((lane) => lane.officialTools)).size,
      readyControls: controls.filter((control) => control.status === "ready").length,
      scenarios: scenarios.length,
      freshnessChecks: controls.length + scenarios.length,
      externalGates: externalGates.length,
    },
    lanes,
    controls,
    scenarios,
    telemetry,
    operatorActions: [
      {
        id: "seed_discovery_accounts",
        label: "Seed discovery accounts",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Needed to validate live Food, Instamart, and Dineout discovery payloads and pagination.",
      },
      {
        id: "enforce_discovery_invalidation",
        label: "Enforce discovery invalidation",
        owner: "MealPilot",
        status: "ready",
        evidence: "State Orchestrator clears downstream state after address, provider, query, date, or guest-count changes.",
      },
      {
        id: "review_live_relevance",
        label: "Review live relevance",
        owner: "Operator",
        status: "watch",
        evidence: "Compare staging search relevance and availability against premium concierge journeys before go-live.",
      },
    ],
    assertions: [
      "Food search_restaurants is used for delivery intent and never for Dineout reservations.",
      "Food ordering details come from search_menu before update_food_cart, even when get_restaurant_menu was used for browsing.",
      "Instamart products and go-to items require variant or spinId selection before update_cart.",
      "Dineout details and slots preserve the same coordinate or saved-location context used in search.",
      "Discovery changes invalidate cart, coupon, slot, and confirmation state before any commercial action.",
    ],
    externalGates,
  };
}

export async function resolveSwiggyDiscoveryFreshness(input: {
  config: ServerConfig;
  server: SwiggyServer;
  discoveryTool: SwiggyDiscoveryResolution["input"]["discoveryTool"];
  toolArguments: Record<string, unknown>;
  contextFresh: boolean;
  userSelectedResult: boolean;
  downstreamIntent: SwiggyDiscoveryResolution["input"]["downstreamIntent"];
  liveCredentialReady: boolean;
  executeTool: (server: SwiggyServer, tool: string, args: Record<string, unknown>) => Promise<unknown>;
}): Promise<SwiggyDiscoveryResolution> {
  const riskFlags: string[] = [];
  const invalidatedSurfaces = new Set<string>();
  const selectedLaneId = laneForTool(input.discoveryTool);
  const toolServerMatch = isToolServerMatch(input.server, input.discoveryTool);

  if (!toolServerMatch) riskFlags.push("discovery_tool_server_mismatch");
  if (!input.contextFresh) {
    riskFlags.push("fresh_location_or_selection_context_required");
    ["cart", "coupon", "slot", "confirmation"].forEach((surface) => invalidatedSurfaces.add(surface));
  }
  if (!input.userSelectedResult) riskFlags.push("user_selection_required_before_downstream_action");
  if (input.config.swiggyMode !== "mock" && !input.liveCredentialReady) riskFlags.push("live_swiggy_token_required_for_discovery");

  let response: unknown;
  let decision: SwiggyDiscoveryResolution["decision"];
  if (!toolServerMatch || !input.contextFresh) {
    decision = "blocked_until_refresh";
  } else if (input.config.swiggyMode !== "mock" && !input.liveCredentialReady) {
    decision = "external_gate";
  } else {
    response = await input.executeTool(input.server, input.discoveryTool, input.toolArguments);
    decision = input.userSelectedResult ? "resolved_for_selection" : "pause_for_selection";
  }

  const resultSummary = summarizeDiscoveryResponse(response);
  const nextRequiredTool = nextToolFor({
    server: input.server,
    tool: input.discoveryTool,
    downstreamIntent: input.downstreamIntent,
  });

  return {
    generatedAt: new Date().toISOString(),
    requestId: `discovery_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      server: input.server,
      discoveryTool: input.discoveryTool,
      contextFresh: input.contextFresh,
      userSelectedResult: input.userSelectedResult,
      downstreamIntent: input.downstreamIntent,
    },
    decision,
    selectedLaneId,
    resultSummary,
    invalidatedSurfaces: Array.from(invalidatedSurfaces),
    nextRequiredTool,
    userFacingCopy:
      decision === "resolved_for_selection"
        ? `I refreshed ${input.discoveryTool} and can continue with ${nextRequiredTool}.`
        : decision === "pause_for_selection"
          ? "I found fresh Swiggy results. Please choose one before I touch cart, slot, or confirmation state."
          : decision === "external_gate"
            ? "Live discovery is gated until Swiggy credentials are available for this environment."
            : "I need fresh address, query, restaurant, date, or guest-count context before this discovery step.",
    riskFlags,
    telemetry: [
      { field: "server", value: input.server, redaction: "safe enum" },
      { field: "discovery_tool", value: input.discoveryTool, redaction: "tool name only" },
      { field: "tool_argument_hash", value: hashArguments(input.toolArguments), redaction: "sha256 prefix only" },
      { field: "result_count_bucket", value: resultSummary.resultCount > 0 ? "non_empty" : "empty", redaction: "bucket only" },
      { field: "raw_discovery_payload_retained", value: "false", redaction: "hard-coded privacy invariant" },
      { field: "cart_mutation_executed", value: "false", redaction: "hard-coded safety invariant" },
    ],
    assertions: [
      "Discovery resolution executes only read-only search, menu, product, detail, or slot tools.",
      "Cart mutation and commercial actions remain outside the Discovery Freshness route.",
      "Raw discovery payloads, queries, coordinates, restaurant ids, item ids, spin ids, and slot ids are not retained.",
      "Fresh discovery changes invalidate downstream cart, coupon, slot, and confirmation state before commercial action.",
    ],
  };
}
