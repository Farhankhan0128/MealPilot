import type {
  McpToolCoverage,
  McpToolLabReport,
  McpToolProbe,
  SwiggyServer,
} from "../../src/domain/types.js";
import { callMockSwiggyTool } from "../mock/swiggyToolRouter.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";

const servers: SwiggyServer[] = ["food", "instamart", "dineout"];

function routeClassFor(tool: string): McpToolProbe["routeClass"] {
  if (["place_food_order", "checkout", "book_table"].includes(tool)) return "commercial_action";
  if (["update_food_cart", "update_cart", "flush_food_cart", "clear_cart", "create_cart"].includes(tool)) {
    return "cart_mutation";
  }
  if (["fetch_food_coupons", "apply_food_coupon"].includes(tool)) return "coupon";
  if (
    [
      "track_food_order",
      "track_order",
      "get_booking_status",
      "get_food_orders",
      "get_food_order_details",
      "get_orders",
      "get_order_details",
    ].includes(tool)
  ) {
    return "tracking";
  }
  if (tool === "report_error") return "support";
  return "read";
}

function retryPolicyFor(routeClass: McpToolProbe["routeClass"]) {
  if (routeClass === "commercial_action") {
    return "Never blind-retry. On network or 5xx failure, check order or booking status first, then retry only when no action exists.";
  }
  if (routeClass === "cart_mutation") {
    return "Retry with exponential backoff when arguments and cart/session identity are unchanged.";
  }
  if (routeClass === "coupon") return "Retry on 5xx and planned 429 Retry-After; preserve the same cart id.";
  if (routeClass === "tracking" || routeClass === "read") return "Safe to retry on 5xx, network timeout, and planned 429 Retry-After.";
  return "Do not retry automatically; generate the support payload once and let the operator send it.";
}

function safetyGateFor(routeClass: McpToolProbe["routeClass"], tool: string) {
  if (routeClass === "commercial_action") {
    return "Requires explicit user confirmation with total, restaurant/store/table, address or slot, and payment/free-booking status.";
  }
  if (tool === "create_address" || tool === "delete_address") return "Requires address-change confirmation and privacy review.";
  if (routeClass === "cart_mutation") return "Requires authoritative cart refresh before checkout or booking.";
  if (routeClass === "coupon") return "Requires cart total refresh after application.";
  if (routeClass === "tracking") return "Requires order or booking id from the authenticated user's own history.";
  if (routeClass === "support") return "Requires redaction of raw tokens, payment data, and address PII.";
  return "Read-only; safe for planning when scoped to the authenticated user's own Swiggy account.";
}

function productUseCaseFor(tool: McpToolCoverage) {
  const key = `${tool.server}.${tool.tool}`;
  const useCases: Record<string, string> = {
    "food.get_addresses": "Pick delivery address before restaurant discovery.",
    "food.search_restaurants": "Rank restaurants by diet, budget, ETA, and occasion.",
    "food.get_restaurant_menu": "Inspect menu pages for proteins, sides, variants, and add-ons.",
    "food.search_menu": "Find a specific dish across available restaurants.",
    "food.update_food_cart": "Prepare the lunch cart after user chooses items.",
    "food.get_food_cart": "Refresh authoritative cart truth before confirmation.",
    "food.flush_food_cart": "Clear stale cart after restaurant switch.",
    "food.fetch_food_coupons": "Surface eligible savings before checkout.",
    "food.apply_food_coupon": "Apply selected discount and refresh total.",
    "food.place_food_order": "Place order only after explicit confirmation.",
    "food.get_food_orders": "Detect whether a post-timeout food order already exists.",
    "food.get_food_order_details": "Show itemized food order details after placement.",
    "food.track_food_order": "Track delivery progress and reminders.",
    "food.report_error": "Escalate a food integration issue with session context.",
    "instamart.get_addresses": "Pick grocery serviceability address.",
    "instamart.create_address": "Create a delivery address when the user chooses a new household location.",
    "instamart.delete_address": "Delete an obsolete saved address after confirmation.",
    "instamart.search_products": "Find missing ingredients and household staples.",
    "instamart.your_go_to_items": "Seed replenishment from frequently purchased products.",
    "instamart.update_cart": "Prepare grocery basket with chosen variants.",
    "instamart.get_cart": "Refresh authoritative grocery basket and bill breakdown.",
    "instamart.clear_cart": "Clear cart before address or meal-plan switch.",
    "instamart.checkout": "Place grocery order only after explicit confirmation.",
    "instamart.get_orders": "Detect whether a post-timeout grocery order already exists.",
    "instamart.get_order_details": "Show itemized grocery order details.",
    "instamart.track_order": "Track grocery delivery status.",
    "instamart.report_error": "Escalate an Instamart issue with session context.",
    "dineout.get_saved_locations": "Pick nearby dining areas from saved locations.",
    "dineout.search_restaurants_dineout": "Find restaurants for a table-booking intent.",
    "dineout.get_restaurant_details": "Inspect cuisine, rating, deals, timings, and address.",
    "dineout.get_available_slots": "Find free reservation slots for the requested day and party size.",
    "dineout.create_cart": "Create a free booking cart after slot selection.",
    "dineout.book_table": "Book a free table only after explicit confirmation.",
    "dineout.get_booking_status": "Track reservation status and support non-blind retry.",
    "dineout.report_error": "Escalate a Dineout issue with booking/session context.",
  };

  return useCases[key] ?? "Covered by the Swiggy MCP capability matrix.";
}

function sampleArguments(tool: McpToolCoverage): Record<string, unknown> {
  const commonLocation = { lat: 12.9716, lng: 77.5946 };
  const args: Record<string, Record<string, unknown>> = {
    get_addresses: {},
    search_restaurants: { addressId: "addr_home_001", query: "high protein vegetarian", ...commonLocation },
    get_restaurant_menu: { restaurantId: "rest_green_bowl", page: 1, pageSize: 20 },
    search_menu: { addressId: "addr_home_001", query: "paneer protein bowl", ...commonLocation },
    update_food_cart: { restaurantId: "rest_green_bowl", items: [{ itemId: "paneer_bowl", quantity: 1 }] },
    get_food_cart: { restaurantId: "rest_green_bowl" },
    flush_food_cart: { restaurantId: "rest_green_bowl", reason: "restaurant_switch" },
    fetch_food_coupons: { cartId: "food_cart_demo" },
    apply_food_coupon: { cartId: "food_cart_demo", code: "MEALPILOT50" },
    place_food_order: { cartId: "food_cart_demo", paymentMethod: "COD", userConfirmed: true },
    get_food_orders: { limit: 5 },
    get_food_order_details: { orderId: "mock_food_recent" },
    track_food_order: { orderId: "mock_food_recent" },
    report_error: { sessionId: "mp_demo", message: "Mock support payload" },
    create_address: { label: "Home", line1: "Demo address", city: "Bengaluru", ...commonLocation },
    delete_address: { addressId: "addr_mock" },
    search_products: { addressId: "addr_home_001", query: "tofu", page: 1 },
    your_go_to_items: { addressId: "addr_home_001" },
    update_cart: { addressId: "addr_home_001", items: [{ spinId: "spin_moong_dal", quantity: 1 }] },
    get_cart: { addressId: "addr_home_001" },
    clear_cart: { addressId: "addr_home_001", reason: "address_switch" },
    checkout: { cartId: "im_cart_demo", paymentMethod: "COD", userConfirmed: true },
    get_orders: { limit: 5 },
    get_order_details: { orderId: "mock_im_recent" },
    track_order: { orderId: "mock_im_recent" },
    get_saved_locations: {},
    search_restaurants_dineout: { locationId: "dineout_home", query: "Italian dinner", guests: 4 },
    get_restaurant_details: { restaurantId: "la_piazza", ...commonLocation },
    get_available_slots: { restaurantId: "la_piazza", date: "2026-07-11", guests: 4 },
    create_cart: { restaurantId: "la_piazza", slot: "7:45 PM", guests: 4, billToPay: 0, skipPayment: true },
    book_table: { cartId: "mock_dineout_cart", isFree: true, bookingPrice: 0, userConfirmed: true },
    get_booking_status: { orderId: "mock_table_recent" },
  };

  return args[tool.tool] ?? {};
}

function previewResponse(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return { value: String(value) };
  const result = value as { success?: boolean; data?: unknown; error?: unknown };
  const data = result.data;
  if (Array.isArray(data)) return { success: Boolean(result.success), itemCount: data.length, sample: data[0] ?? null };
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    return {
      success: Boolean(result.success),
      keys: Object.keys(record).slice(0, 6),
      sample: Object.fromEntries(Object.entries(record).slice(0, 4)),
    };
  }
  return { success: Boolean(result.success), error: result.error ?? null };
}

async function probeTool(tool: McpToolCoverage): Promise<McpToolProbe> {
  const routeClass = routeClassFor(tool.tool);
  const args = sampleArguments(tool);
  const result = await callMockSwiggyTool(tool.server, tool.tool, args);
  const status = result.success ? (tool.status === "guarded" ? "guarded" : "pass") : "blocked";

  return {
    id: `${tool.server}_${tool.tool}`,
    server: tool.server,
    endpoint: tool.endpoint,
    tool: tool.tool,
    stage: tool.stage,
    status,
    routeClass,
    safetyGate: safetyGateFor(routeClass, tool.tool),
    retryPolicy: retryPolicyFor(routeClass),
    productUseCase: productUseCaseFor(tool),
    request: {
      jsonrpc: "2.0",
      id: `${tool.server}.${tool.tool}.demo`,
      method: "tools/call",
      params: {
        name: tool.tool,
        arguments: args,
      },
    },
    responsePreview: previewResponse(result),
  };
}

export async function buildMcpToolLabReport(): Promise<McpToolLabReport> {
  const coverage = buildMcpCoverage();
  const tools = coverage.flatMap((server) => server.tools);
  const probes = await Promise.all(tools.map(probeTool));
  const callableTools = probes.filter((probe) => probe.status === "pass" || probe.status === "guarded").length;
  const guardedTools = probes.filter((probe) => probe.status === "guarded").length;
  const commercialTools = probes.filter((probe) => probe.routeClass === "commercial_action").length;
  const blockedTools = probes.length - callableTools;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.max(0, Math.round(((callableTools - blockedTools * 2) / probes.length) * 100)),
    totalTools: probes.length,
    callableTools,
    guardedTools,
    commercialTools,
    servers: servers.map((server) => {
      const serverProbes = probes.filter((probe) => probe.server === server);
      return {
        server,
        totalTools: serverProbes.length,
        callableTools: serverProbes.filter((probe) => probe.status === "pass" || probe.status === "guarded").length,
        guardedTools: serverProbes.filter((probe) => probe.status === "guarded").length,
        commercialTools: serverProbes.filter((probe) => probe.routeClass === "commercial_action").length,
      };
    }),
    probes,
    routeAssertions: [
      "Every official Food, Instamart, and Dineout tool has a JSON-RPC tools/call sample in the local Tool Lab.",
      "Commercial tools remain callable only as explicit confirmation examples, never hidden background actions.",
      "Cart mutations carry authoritative refresh guidance before checkout or booking.",
      "Tracking and status tools are marked safe for non-blind retry probes after uncertain commercial outcomes.",
      "Support tools return builders@swiggy.in-ready payloads while redacting secrets and raw payment data.",
    ],
    innovationUseCases: [
      {
        id: "adaptive_savings_lane",
        title: "Adaptive Savings Lane",
        servers: ["food", "instamart"],
        toolchain: ["fetch_food_coupons", "apply_food_coupon", "search_products", "update_cart"],
        productSurface: "Preflight offers and budget variants",
        nextBuild: "Use live coupon eligibility and grocery substitutions to optimize protein per rupee.",
      },
      {
        id: "timeout_recovery_radar",
        title: "Timeout Recovery Radar",
        servers: ["food", "instamart", "dineout"],
        toolchain: ["get_food_orders", "get_orders", "get_booking_status"],
        productSurface: "Resilience Lab and support reports",
        nextBuild: "Auto-classify uncertain network failures into success, pending, or safe-to-retry states.",
      },
      {
        id: "household_go_to_graph",
        title: "Household Go-To Graph",
        servers: ["instamart", "food"],
        toolchain: ["your_go_to_items", "search_menu", "search_restaurants"],
        productSurface: "Pantry Autopilot and plan variants",
        nextBuild: "Fuse frequently bought staples with meal preferences for repeatable household menus.",
      },
      {
        id: "occasion_lockstep",
        title: "Occasion Lockstep",
        servers: ["dineout", "food", "instamart"],
        toolchain: ["get_available_slots", "create_cart", "book_table", "search_menu", "search_products"],
        productSurface: "Weekend and guest-planning flows",
        nextBuild: "Coordinate table booking, dessert delivery, and next-morning groceries as one confirmed sequence.",
      },
    ],
  };
}
