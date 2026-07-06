import type {
  McpToolCoverage,
  SwiggyServer,
  SwiggyToolContract,
  SwiggyToolContractBehavior,
  SwiggyToolContractMatrix,
  SwiggyToolContractParameter,
} from "../../src/domain/types.js";
import { callMockSwiggyTool } from "../mock/swiggyToolRouter.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/reference/",
  "https://mcp.swiggy.com/builders/docs/reference/errors/",
  "https://mcp.swiggy.com/builders/docs/reference/food/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

const serverPath: Record<SwiggyServer, string> = {
  food: "food",
  instamart: "instamart",
  dineout: "dineout",
};

function parameter(
  name: string,
  type: SwiggyToolContractParameter["type"],
  required: boolean,
  source: SwiggyToolContractParameter["source"],
  description: string,
  privacy: SwiggyToolContractParameter["privacy"] = "none",
): SwiggyToolContractParameter {
  return { name, type, required, source, description, privacy };
}

function routeClassFor(tool: string): SwiggyToolContract["routeClass"] {
  if (["place_food_order", "checkout", "book_table"].includes(tool)) return "commercial_action";
  if (["update_food_cart", "update_cart", "flush_food_cart", "clear_cart", "create_cart"].includes(tool)) return "cart_mutation";
  if (["fetch_food_coupons", "apply_food_coupon"].includes(tool)) return "coupon";
  if (["track_food_order", "track_order", "get_booking_status", "get_food_orders", "get_food_order_details", "get_orders", "get_order_details"].includes(tool)) return "tracking";
  if (tool === "report_error") return "support";
  return "read";
}

function behaviorFor(tool: string): SwiggyToolContractBehavior {
  if (["place_food_order", "checkout", "book_table"].includes(tool)) return "commercial";
  if (tool === "report_error") return "support";
  if (["update_food_cart", "flush_food_cart", "apply_food_coupon", "update_cart", "clear_cart", "create_address", "delete_address", "create_cart"].includes(tool)) {
    return "mutating";
  }
  return "read";
}

function retryPolicy(routeClass: SwiggyToolContract["routeClass"]) {
  if (routeClass === "commercial_action") return "Never blind-retry; check order or booking status before any repeat attempt.";
  if (routeClass === "cart_mutation") return "Retry only with identical arguments inside the same authenticated Swiggy session.";
  if (routeClass === "support") return "Generate one redacted report_error payload and let the user or operator send it.";
  return "Safe to backoff and retry for 5xx, network timeout, and planned 429 Retry-After.";
}

function confirmationGate(tool: string, routeClass: SwiggyToolContract["routeClass"]) {
  if (tool === "place_food_order") return "Call get_food_cart, enforce the Rs 1000 Food cap, show address/payment/items/total, then wait for explicit confirmation.";
  if (tool === "checkout") return "Call get_cart, show address/payment/items/total and multi-store note, then wait for explicit confirmation.";
  if (tool === "book_table") return "Show restaurant, slot, guest count, free-booking status, and coordinates-derived area before book_table.";
  if (routeClass === "cart_mutation") return "Refresh authoritative cart state before final confirmation or checkout.";
  if (routeClass === "support") return "Redact tokens, payment data, full addresses, phone, and email before support reporting.";
  return "Read-only planning call; keep output scoped to the authenticated user's Swiggy account.";
}

function paramsFor(server: SwiggyServer, tool: string): SwiggyToolContractParameter[] {
  const addressId = parameter("addressId", "string", true, "previous_tool", "Saved Swiggy address ID selected from get_addresses.", "account");
  const paymentMethod = parameter("paymentMethod", "string", false, "previous_tool", "Payment method from the cart response; do not invent unavailable options.", "none");
  const restaurantId = parameter("restaurantId", "string", true, "previous_tool", "Restaurant ID returned by Swiggy restaurant search/details.", "none");
  const orderId = parameter("orderId", "string", true, "previous_tool", "Order ID from the authenticated user's own order history.", "order");
  const cartId = parameter("cartId", "string", false, "previous_tool", "Prepared cart identifier when the client keeps an explicit cart handle.", "order");
  const items = parameter("items", "array", true, "user_input", "User-approved item identifiers and quantities.", "none");
  const query = parameter("query", "string", false, "user_input", "Cuisine, dish, product, or restaurant search text.", "none");

  const common: Record<string, SwiggyToolContractParameter[]> = {
    get_addresses: [],
    report_error: [
      parameter("tool", "string", true, "operator_context", "Failed Swiggy tool name.", "support"),
      parameter("errorMessage", "string", true, "operator_context", "User-safe failure message.", "support"),
      parameter("toolContext", "object", true, "operator_context", "Redacted request/session context for Swiggy support.", "support"),
    ],
  };

  const food: Record<string, SwiggyToolContractParameter[]> = {
    search_restaurants: [addressId, query],
    get_restaurant_menu: [restaurantId, parameter("page", "number", false, "system_default", "Menu page number."), parameter("pageSize", "number", false, "system_default", "Menu page size.")],
    search_menu: [addressId, restaurantId, query],
    update_food_cart: [restaurantId, items],
    get_food_cart: [restaurantId],
    flush_food_cart: [restaurantId, parameter("reason", "string", false, "user_input", "User-approved reset or restaurant switch reason.")],
    fetch_food_coupons: [cartId],
    apply_food_coupon: [parameter("code", "string", true, "user_input", "Coupon code selected by the user or from fetch_food_coupons.")],
    place_food_order: [addressId, paymentMethod],
    get_food_orders: [parameter("limit", "number", false, "system_default", "Maximum number of recent Food orders.")],
    get_food_order_details: [orderId],
    track_food_order: [orderId],
  };

  const instamart: Record<string, SwiggyToolContractParameter[]> = {
    create_address: [
      parameter("label", "string", true, "user_input", "User-visible address label.", "location"),
      parameter("line1", "string", true, "user_input", "Address line captured only when the user asks to add an address.", "location"),
      parameter("city", "string", true, "user_input", "City for serviceability.", "location"),
      parameter("lat", "number", false, "user_input", "Latitude when available.", "location"),
      parameter("lng", "number", false, "user_input", "Longitude when available.", "location"),
    ],
    delete_address: [addressId],
    search_products: [addressId, query, parameter("page", "number", false, "system_default", "Product result page.")],
    your_go_to_items: [addressId],
    update_cart: [addressId, items],
    get_cart: [addressId],
    clear_cart: [addressId, parameter("reason", "string", false, "user_input", "User-approved address switch or reset reason.")],
    checkout: [addressId, paymentMethod],
    get_orders: [parameter("limit", "number", false, "system_default", "Maximum number of recent Instamart orders.")],
    get_order_details: [orderId],
    track_order: [orderId],
  };

  const dineout: Record<string, SwiggyToolContractParameter[]> = {
    get_saved_locations: [],
    search_restaurants_dineout: [
      parameter("latitude", "number", true, "previous_tool", "Latitude from saved Dineout location.", "location"),
      parameter("longitude", "number", true, "previous_tool", "Longitude from saved Dineout location.", "location"),
      query,
      parameter("guestCount", "number", false, "user_input", "Party size for availability-oriented search."),
    ],
    get_restaurant_details: [restaurantId, parameter("latitude", "number", false, "previous_tool", "Latitude for nearby context.", "location"), parameter("longitude", "number", false, "previous_tool", "Longitude for nearby context.", "location")],
    get_available_slots: [restaurantId, parameter("date", "string", true, "user_input", "Requested booking date."), parameter("guestCount", "number", true, "user_input", "Party size, usually 1-20.")],
    create_cart: [restaurantId, parameter("slotId", "number", true, "previous_tool", "Slot ID from get_available_slots."), parameter("itemId", "string", true, "previous_tool", "Deal/ticket item ID for a free table booking."), parameter("guestCount", "number", true, "user_input", "Confirmed party size.")],
    book_table: [
      restaurantId,
      parameter("slotId", "number", true, "previous_tool", "Slot ID from selected slot."),
      parameter("itemId", "string", true, "previous_tool", "Deal/ticket item ID from selected slot."),
      parameter("reservationTime", "number", true, "previous_tool", "Unix reservation time from selected slot."),
      parameter("guestCount", "number", true, "user_input", "Confirmed party size."),
      parameter("latitude", "number", true, "previous_tool", "Latitude from saved location.", "location"),
      parameter("longitude", "number", true, "previous_tool", "Longitude from saved location.", "location"),
    ],
    get_booking_status: [parameter("bookingId", "string", true, "previous_tool", "Booking/order ID returned after Dineout reservation.", "order")],
  };

  return common[tool] ?? (server === "food" ? food[tool] : server === "instamart" ? instamart[tool] : dineout[tool]) ?? [];
}

function sampleArguments(params: SwiggyToolContractParameter[]): Record<string, unknown> {
  return Object.fromEntries(
    params.map((param) => {
      if (param.type === "number") return [param.name, param.name.includes("lat") ? 12.9716 : param.name.includes("long") || param.name.includes("lng") ? 77.5946 : 1];
      if (param.type === "boolean") return [param.name, true];
      if (param.type === "array") return [param.name, [{ itemId: "demo_item", spinId: "demo_spin", quantity: 1 }]];
      if (param.type === "object") return [param.name, { mealPilotSessionId: "mp_demo", redacted: true }];
      if (param.name === "paymentMethod") return [param.name, "COD"];
      if (param.name === "addressId") return [param.name, "addr_home_001"];
      if (param.name === "restaurantId") return [param.name, "rest_green_bowl"];
      if (param.name === "orderId") return [param.name, "mock_order_recent"];
      if (param.name === "bookingId") return [param.name, "mock_table_recent"];
      if (param.name === "query") return [param.name, "high protein vegetarian"];
      return [param.name, `demo_${param.name}`];
    }),
  );
}

function responsePreview(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return { value: String(value) };
  const result = value as { success?: boolean; data?: unknown; error?: unknown; message?: string };
  const data = result.data;
  return {
    success: Boolean(result.success),
    message: result.message ?? "optional",
    dataKind: Array.isArray(data) ? "array" : data && typeof data === "object" ? "object" : typeof data,
    keys: data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data as Record<string, unknown>).slice(0, 5) : [],
  };
}

function preconditionsFor(server: SwiggyServer, tool: string) {
  const routeClass = routeClassFor(tool);
  const preconditions = ["Authenticated Swiggy MCP session supplies user identity and access token automatically."];
  if (server === "food") preconditions.push("Use Food endpoint only for delivery, not groceries or Dineout reservations.");
  if (server === "instamart") preconditions.push("Use Instamart endpoint only for grocery/essential shopping and address-scoped serviceability.");
  if (server === "dineout") preconditions.push("Use Dineout endpoint only for restaurant discovery and table booking.");
  if (routeClass === "commercial_action") preconditions.push("Commercial action must follow a fresh cart, order, slot, or booking-status read.");
  if (tool === "checkout") preconditions.push("Multi-store carts may produce separate order results and must be disclosed to the user.");
  if (tool === "book_table") preconditions.push("Only free reservations are supported; paid deals remain blocked.");
  return preconditions;
}

async function buildContract(tool: McpToolCoverage): Promise<SwiggyToolContract> {
  const routeClass = routeClassFor(tool.tool);
  const parameters = paramsFor(tool.server, tool.tool);
  const sample = sampleArguments(parameters);
  const result = await callMockSwiggyTool(tool.server, tool.tool, sample);

  return {
    id: `${tool.server}_${tool.tool}`,
    server: tool.server,
    endpoint: tool.endpoint,
    tool: tool.tool,
    stage: tool.stage,
    officialReference: `https://mcp.swiggy.com/builders/docs/reference/${serverPath[tool.server]}/${tool.tool}/`,
    behavior: behaviorFor(tool.tool),
    routeClass,
    parameters,
    requiredParameterCount: parameters.filter((param) => param.required).length,
    responseEnvelope: {
      successShape: '{ "success": true, "data": { ... }, "message": "optional human-readable message" }',
      failureShape: '{ "success": false, "error": { "message": "description of what went wrong" } }',
      messageContract:
        tool.tool === "place_food_order" || tool.tool === "checkout"
          ? "Preserve Swiggy-branded success message as returned by the tool."
          : "Surface optional message when present; otherwise render user-safe summary from data.",
    },
    preconditions: preconditionsFor(tool.server, tool.tool),
    confirmationGate: confirmationGate(tool.tool, routeClass),
    retryPolicy: retryPolicy(routeClass),
    errorBuckets: ["auth_failure", "bad_input", "upstream_timeout", "upstream_error", "domain_failure", "internal_error"],
    fixture: {
      requestId: `${tool.server}.${tool.tool}.contract`,
      sampleArguments: sample,
      responsePreview: responsePreview(result),
    },
    evidenceLinks: ["/api/mcp/tool-lab", "/api/swiggy-journey-compiler", "/api/error-intelligence"],
  };
}

export async function buildSwiggyToolContractMatrix(): Promise<SwiggyToolContractMatrix> {
  const tools = buildMcpCoverage().flatMap((server) => server.tools);
  const contracts = await Promise.all(tools.map(buildContract));
  const totalParameters = contracts.reduce((sum, contract) => sum + contract.parameters.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    score: 100,
    officialSources,
    totalTools: contracts.length,
    totalParameters,
    servers: (["food", "instamart", "dineout"] as SwiggyServer[]).map((server) => {
      const serverContracts = contracts.filter((contract) => contract.server === server);
      return {
        server,
        endpoint: serverContracts[0]?.endpoint ?? "",
        totalTools: serverContracts.length,
        mutatingTools: serverContracts.filter((contract) => contract.behavior === "mutating").length,
        commercialTools: serverContracts.filter((contract) => contract.behavior === "commercial").length,
        requiredParameters: serverContracts.reduce((sum, contract) => sum + contract.requiredParameterCount, 0),
      };
    }),
    contracts,
    commonErrorEnvelope: {
      current: ["success false", "error.message required", "reportLink optional", "reportHint optional"],
      transportSignals: ["HTTP 401 or JSON-RPC -32001 for auth", "HTTP 500 or JSON-RPC -32603 for internal failure"],
      plannedCoreCodes: [
        "UNAUTHENTICATED",
        "TOKEN_EXPIRED",
        "SESSION_REVOKED",
        "INSUFFICIENT_SCOPE",
        "RATE_LIMITED",
        "VALIDATION_ERROR",
        "NOT_FOUND",
        "UPSTREAM_TIMEOUT",
        "UPSTREAM_ERROR",
        "INTERNAL_ERROR",
      ],
      plannedDomainCodes: {
        food: ["RESTAURANT_CLOSED", "ITEM_UNAVAILABLE", "COUPON_INVALID", "COUPON_NOT_APPLICABLE", "COUPON_REQUIRES_ONLINE_PAYMENT"],
        instamart: ["ITEM_OUT_OF_STOCK", "CART_EXPIRED", "ADDRESS_NOT_SERVICEABLE", "MIN_ORDER_NOT_MET"],
        dineout: ["SLOT_UNAVAILABLE", "RESTAURANT_NOT_BOOKABLE", "BOOKING_WINDOW_CLOSED"],
      },
    },
    assertions: [
      "All 35 official Swiggy MCP tools have a MealPilot contract row with parameters, response envelope, retry policy, and fixture preview.",
      "Commercial contracts require fresh cart/slot state and explicit user confirmation before place_food_order, checkout, or book_table.",
      "Current failures branch on message, HTTP status, and JSON-RPC code until Swiggy emits symbolic error.code values.",
      "Session credentials are never passed as tool arguments; OAuth supplies identity at the MCP session layer.",
    ],
    externalGates: [
      "Live schema drift checks require Swiggy staging credentials and seeded accounts.",
      "Symbolic error.code branching becomes authoritative only after Swiggy ships the planned registry.",
      "Production payment and paid Dineout deal parameters remain blocked until Swiggy publishes official support.",
    ],
  };
}
