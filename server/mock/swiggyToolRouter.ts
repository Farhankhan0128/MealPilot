import type { SwiggyServer, UserPlanningRequest } from "../../src/domain/types.js";
import { createMockSwiggyClient } from "../../src/integrations/swiggy/mockClient.js";

export type JsonRpcRequest =
  | {
      jsonrpc: "2.0";
      id: string | number;
      method: "tools/call";
      params: {
        name: string;
        arguments?: Record<string, unknown>;
      };
    }
  | {
      jsonrpc: "2.0";
      id: string | number;
      method: "resources/list";
      params?: Record<string, never>;
    }
  | {
      jsonrpc: "2.0";
      id: string | number;
      method: "resources/read";
      params: {
        uri: string;
      };
    }
  | {
      jsonrpc: "2.0";
      id: string | number;
      method: "prompts/list";
      params?: Record<string, never>;
    }
  | {
      jsonrpc: "2.0";
      id: string | number;
      method: "prompts/get";
      params: {
        name: string;
        arguments?: Record<string, string | number | boolean>;
      };
    };

interface MockResource {
  uri: string;
  name: string;
  description: string;
  mimeType: "application/json" | "text/markdown";
}

interface MockPrompt {
  name: string;
  title: string;
  description: string;
  arguments: Array<{ name: string; description: string; required: boolean }>;
}

const serverLabels: Record<SwiggyServer, string> = {
  food: "Food",
  instamart: "Instamart",
  dineout: "Dineout",
};

const resourcesByServer: Record<SwiggyServer, MockResource[]> = {
  food: [
    {
      uri: "swiggy://food/widgets",
      name: "Food widget registry",
      description: "Restaurant card, cart widget, offer, and tracking widget metadata for Food journeys.",
      mimeType: "application/json",
    },
    {
      uri: "swiggy://food/static-metadata",
      name: "Food static metadata",
      description: "Food server endpoint, route classes, confirmation rules, retry posture, and support identifiers.",
      mimeType: "application/json",
    },
  ],
  instamart: [
    {
      uri: "swiggy://instamart/widgets",
      name: "Instamart widget registry",
      description: "Product card, cart widget, go-to item, and delivery tracking widget metadata.",
      mimeType: "application/json",
    },
    {
      uri: "swiggy://instamart/static-metadata",
      name: "Instamart static metadata",
      description: "Instamart endpoint, address-scoped cache rules, checkout safety, and support identifiers.",
      mimeType: "application/json",
    },
  ],
  dineout: [
    {
      uri: "swiggy://dineout/widgets",
      name: "Dineout widget registry",
      description: "Restaurant details, slot picker, free-booking cart, and booking status widget metadata.",
      mimeType: "application/json",
    },
    {
      uri: "swiggy://dineout/static-metadata",
      name: "Dineout static metadata",
      description: "Dineout endpoint, slot/cart safety, free booking confirmation, and support identifiers.",
      mimeType: "application/json",
    },
  ],
};

const promptsByServer: Record<SwiggyServer, MockPrompt[]> = {
  food: [
    {
      name: "food_lunch_concierge",
      title: "Food lunch concierge",
      description: "Plan a budget-aware lunch order using Food discovery, menu, cart, coupons, and confirmation gates.",
      arguments: [
        { name: "city", description: "User city or serviceable area.", required: true },
        { name: "diet", description: "Dietary preference and exclusions.", required: true },
      ],
    },
    {
      name: "food_recovery_status_check",
      title: "Food non-blind retry recovery",
      description: "Recover from a place_food_order timeout by checking orders before retrying.",
      arguments: [{ name: "sessionId", description: "MealPilot session id for support correlation.", required: true }],
    },
  ],
  instamart: [
    {
      name: "instamart_pantry_restock",
      title: "Instamart pantry restock",
      description: "Use go-to items and search_products to replenish missing pantry ingredients.",
      arguments: [
        { name: "addressId", description: "Serviceability address id.", required: true },
        { name: "budget", description: "Maximum grocery basket budget.", required: true },
      ],
    },
    {
      name: "instamart_checkout_safety",
      title: "Instamart checkout safety",
      description: "Refresh cart truth and confirm payment/address before checkout.",
      arguments: [{ name: "cartId", description: "Prepared Instamart cart id.", required: true }],
    },
  ],
  dineout: [
    {
      name: "dineout_evening_planner",
      title: "Dineout evening planner",
      description: "Find a restaurant, inspect details, choose slots, create cart, and book after explicit confirmation.",
      arguments: [
        { name: "guests", description: "Party size.", required: true },
        { name: "date", description: "Requested reservation date.", required: true },
      ],
    },
    {
      name: "dineout_booking_recovery",
      title: "Dineout booking recovery",
      description: "Recover from a book_table timeout by checking booking status before retrying.",
      arguments: [{ name: "bookingId", description: "Known or suspected booking id.", required: false }],
    },
  ],
};

function resourcePayload(server: SwiggyServer, resource: MockResource) {
  const label = serverLabels[server];
  const isWidget = resource.uri.endsWith("/widgets");
  return {
    server,
    label,
    source: resource.uri,
    scope: "mcp:resources",
    generatedBy: "MealPilot local MCP mock",
    registryKind: isWidget ? "widget_registry" : "static_metadata",
    endpoint: server === "instamart" ? "POST mcp.swiggy.com/im" : `POST mcp.swiggy.com/${server}`,
    capabilities: isWidget
      ? ["semantic fallback", "iframe sandbox policy", "origin verification", "postMessage events"]
      : ["route class metadata", "retry guidance", "confirmation gates", "support identifiers"],
  };
}

function listResources(server: SwiggyServer) {
  return { resources: resourcesByServer[server] };
}

function readResource(server: SwiggyServer, uri: string) {
  const resource = resourcesByServer[server].find((item) => item.uri === uri);
  if (!resource) {
    return {
      error: {
        code: -32004,
        message: `Resource ${uri} is not available for ${server}.`,
      },
    };
  }

  return {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: JSON.stringify(resourcePayload(server, resource), null, 2),
      },
    ],
  };
}

function listPrompts(server: SwiggyServer) {
  return { prompts: promptsByServer[server] };
}

function promptMessages(server: SwiggyServer, prompt: MockPrompt, args: Record<string, string | number | boolean> = {}) {
  const label = serverLabels[server];
  return {
    description: prompt.description,
    messages: [
      {
        role: "system",
        content: {
          type: "text",
          text: `You are MealPilot's ${label} specialist. Use Swiggy MCP ${server} tools only for this server and keep commercial actions confirmation-gated.`,
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Apply ${prompt.title} with arguments ${JSON.stringify(args)}. Include totals, status identifiers, and any support-safe context.`,
        },
      },
    ],
  };
}

function getPrompt(server: SwiggyServer, name: string, args: Record<string, string | number | boolean> = {}) {
  const prompt = promptsByServer[server].find((item) => item.name === name);
  if (!prompt) {
    return {
      error: {
        code: -32005,
        message: `Prompt ${name} is not available for ${server}.`,
      },
    };
  }

  return promptMessages(server, prompt, args);
}

const client = createMockSwiggyClient();

const defaultRequest: UserPlanningRequest = {
  prompt: "Plan a high-protein vegetarian day.",
  city: "Bengaluru",
  budget: 2000,
  diet: "high-protein vegetarian",
  guests: 4,
  day: "saturday",
};

export async function callMockSwiggyTool(server: SwiggyServer, tool: string, args: Record<string, unknown> = {}) {
  if (server === "food") {
    if (tool === "get_addresses") return { success: true, data: await client.getSavedLocations() };
    if (tool === "search_restaurants") {
      return { success: true, data: { restaurants: await client.searchFoodRestaurants(defaultRequest, "addr_home_001") } };
    }
    if (tool === "get_restaurant_menu") {
      return {
        success: true,
        data: {
          restaurantId: args.restaurantId ?? "rest_green_bowl",
          categories: ["Protein bowls", "Sides"],
          items: [
            { id: "paneer_bowl", name: "Paneer millet protein bowl", price: 320 },
            { id: "curd_side", name: "Greek yogurt side", price: 70 },
          ],
        },
      };
    }
    if (tool === "search_menu") {
      return {
        success: true,
        data: [
          { id: "paneer_bowl", restaurantId: "rest_green_bowl", name: "Paneer millet protein bowl", price: 320 },
          { id: "tofu_soba", restaurantId: "rest_green_bowl", name: "Tofu soba protein bowl", price: 300 },
        ],
      };
    }
    if (tool === "update_food_cart" || tool === "get_food_cart") {
      return {
        success: true,
        data: {
          restaurantId: args.restaurantId ?? "rest_green_bowl",
          total: 420,
          paymentMethod: "COD",
          status: "prepared",
        },
      };
    }
    if (tool === "flush_food_cart") {
      return { success: true, data: { cleared: true, reason: "restaurant_switch_or_user_request" } };
    }
    if (tool === "fetch_food_coupons") {
      return {
        success: true,
        data: [{ code: "MEALPILOT50", description: "Rs 50 off on eligible food carts", applied: false }],
      };
    }
    if (tool === "apply_food_coupon") {
      return { success: true, data: { code: args.code ?? "MEALPILOT50", discount: 50, status: "applied" } };
    }
    if (tool === "place_food_order") {
      return { success: true, data: { orderId: `mock_food_${Date.now()}`, paymentMethod: "COD" } };
    }
    if (tool === "get_food_orders") {
      return { success: true, data: [{ orderId: "mock_food_recent", status: "on_the_way", eta: "18 min" }] };
    }
    if (tool === "get_food_order_details") {
      return {
        success: true,
        data: { orderId: args.orderId ?? "mock_food_recent", items: ["Paneer millet protein bowl"], total: 420 },
      };
    }
    if (tool === "track_food_order") {
      return { success: true, data: { orderId: args.orderId ?? "mock_food_recent", status: "on_the_way", eta: "18 min" } };
    }
    if (tool === "report_error") {
      return { success: true, data: { mailto: "mailto:builders@swiggy.in", summary: "Food mock error report" } };
    }
  }

  if (server === "instamart") {
    if (tool === "get_addresses") {
      return { success: true, data: await client.getSavedLocations() };
    }
    if (tool === "create_address") {
      return { success: true, data: { addressId: `addr_mock_${Date.now()}`, status: "created" } };
    }
    if (tool === "delete_address") {
      return { success: true, data: { addressId: args.addressId ?? "addr_mock", status: "deleted" } };
    }
    if (tool === "search_items" || tool === "search_products") {
      return {
        success: true,
        data: [
          { id: "tofu", name: "Tofu 200g", price: 160 },
          { id: "moong_dal", name: "Moong dal 1kg", price: 180 },
          { id: "greek_yogurt", name: "Greek yogurt 400g", price: 210 },
        ],
      };
    }
    if (tool === "your_go_to_items") {
      return {
        success: true,
        data: [
          { spinId: "spin_moong_dal", name: "Moong dal 1kg", price: 180 },
          { spinId: "spin_curd", name: "Low-fat curd", price: 145 },
        ],
      };
    }
    if (tool === "update_cart" || tool === "get_cart") {
      return { success: true, data: { total: 790, status: "prepared" } };
    }
    if (tool === "clear_cart") {
      return { success: true, data: { cleared: true } };
    }
    if (tool === "checkout") {
      return { success: true, data: { orderId: `mock_im_${Date.now()}`, status: "simulated_checkout" } };
    }
    if (tool === "get_orders") {
      return { success: true, data: [{ orderId: "mock_im_recent", status: "delivered" }] };
    }
    if (tool === "get_order_details") {
      return { success: true, data: { orderId: args.orderId ?? "mock_im_recent", items: ["Tofu", "Moong dal"], total: 790 } };
    }
    if (tool === "track_order") {
      return { success: true, data: { orderId: args.orderId ?? "mock_im_recent", status: "arriving", eta: "7 min" } };
    }
    if (tool === "report_error") {
      return { success: true, data: { mailto: "mailto:builders@swiggy.in", summary: "Instamart mock error report" } };
    }
  }

  if (server === "dineout") {
    if (tool === "get_saved_locations") {
      return {
        success: true,
        data: [
          { id: "dineout_home", label: "Home", lat: 12.9716, lng: 77.5946 },
          { id: "dineout_office", label: "Office", lat: 12.9352, lng: 77.6245 },
        ],
      };
    }
    if (tool === "search_restaurants_dineout") {
      return {
        success: true,
        data: [{ id: "la_piazza", name: "La Piazza Social", area: "Indiranagar", rating: 4.5 }],
      };
    }
    if (tool === "get_restaurant_details") {
      return {
        success: true,
        data: { id: args.restaurantId ?? "la_piazza", name: "La Piazza Social", amenities: ["family seating"], rating: 4.5 },
      };
    }
    if (tool === "get_available_slots") {
      return { success: true, data: [{ time: "7:45 PM", guests: defaultRequest.guests, status: "available" }] };
    }
    if (tool === "create_cart") {
      return { success: true, data: { cartId: `mock_dineout_cart_${Date.now()}`, billToPay: 0, skipPayment: true } };
    }
    if (tool === "book_table") {
      return { success: true, data: { bookingId: `mock_table_${Date.now()}`, status: "simulated_booking" } };
    }
    if (tool === "get_booking_status") {
      return { success: true, data: { bookingId: args.orderId ?? "mock_table_recent", status: "confirmed" } };
    }
    if (tool === "report_error") {
      return { success: true, data: { mailto: "mailto:builders@swiggy.in", summary: "Dineout mock error report" } };
    }
  }

  return {
    success: false,
    error: {
      code: "TOOL_NOT_FOUND",
      message: `Mock tool ${server}.${tool} is not implemented.`,
    },
  };
}

export async function handleMockJsonRpc(server: SwiggyServer, request: JsonRpcRequest) {
  if (request.jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: { code: -32600, message: "Only JSON-RPC 2.0 requests are supported in the local mock." },
    };
  }

  const method = (request as { method?: string }).method;

  if (method === "resources/list") {
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: listResources(server),
    };
  }

  if (method === "resources/read") {
    const resourceRequest = request as Extract<JsonRpcRequest, { method: "resources/read" }>;
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: readResource(server, resourceRequest.params.uri),
    };
  }

  if (method === "prompts/list") {
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: listPrompts(server),
    };
  }

  if (method === "prompts/get") {
    const promptRequest = request as Extract<JsonRpcRequest, { method: "prompts/get" }>;
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: getPrompt(server, promptRequest.params.name, promptRequest.params.arguments),
    };
  }

  if (method !== "tools/call") {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: { code: -32601, message: `MCP method ${method ?? "unknown"} is not supported in the local mock.` },
    };
  }

  const toolRequest = request as Extract<JsonRpcRequest, { method: "tools/call" }>;
  return {
    jsonrpc: "2.0",
    id: request.id,
    result: await callMockSwiggyTool(server, toolRequest.params.name, toolRequest.params.arguments),
  };
}
