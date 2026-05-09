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
