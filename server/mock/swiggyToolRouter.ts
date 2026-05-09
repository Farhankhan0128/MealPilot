import type { SwiggyServer, UserPlanningRequest } from "../../src/domain/types.js";
import { createMockSwiggyClient } from "../../src/integrations/swiggy/mockClient.js";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: "tools/call";
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
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
    if (tool === "place_food_order") {
      return { success: true, data: { orderId: `mock_food_${Date.now()}`, paymentMethod: "COD" } };
    }
  }

  if (server === "instamart") {
    if (tool === "search_items") {
      return {
        success: true,
        data: [
          { id: "tofu", name: "Tofu 200g", price: 160 },
          { id: "moong_dal", name: "Moong dal 1kg", price: 180 },
          { id: "greek_yogurt", name: "Greek yogurt 400g", price: 210 },
        ],
      };
    }
    if (tool === "update_cart" || tool === "get_cart") {
      return { success: true, data: { total: 790, status: "prepared" } };
    }
    if (tool === "checkout") {
      return { success: true, data: { orderId: `mock_im_${Date.now()}`, status: "simulated_checkout" } };
    }
  }

  if (server === "dineout") {
    if (tool === "search_restaurants_dineout") {
      return {
        success: true,
        data: [{ id: "la_piazza", name: "La Piazza Social", area: "Indiranagar", rating: 4.5 }],
      };
    }
    if (tool === "get_available_slots") {
      return { success: true, data: [{ time: "7:45 PM", guests: defaultRequest.guests, status: "available" }] };
    }
    if (tool === "book_table") {
      return { success: true, data: { bookingId: `mock_table_${Date.now()}`, status: "simulated_booking" } };
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
  if (request.jsonrpc !== "2.0" || request.method !== "tools/call") {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: { code: -32600, message: "Only MCP tools/call is supported in the local mock." },
    };
  }

  return {
    jsonrpc: "2.0",
    id: request.id,
    result: await callMockSwiggyTool(server, request.params.name, request.params.arguments),
  };
}
