import type {
  DineoutSlot,
  FoodRestaurant,
  Recommendation,
  SavedLocation,
  SwiggyPlanningClient,
  UserPlanningRequest,
} from "../../domain/types.js";

const locations: SavedLocation[] = [
  {
    id: "addr_home_001",
    label: "Home",
    displayText: "Home, saved Swiggy address",
  },
  {
    id: "addr_office_001",
    label: "Office",
    displayText: "Office, saved Swiggy address",
  },
];

const restaurants: FoodRestaurant[] = [
  {
    id: "rest_green_bowl",
    name: "Green Bowl Co.",
    cuisine: "Healthy bowls",
    rating: 4.6,
    distanceKm: 1.8,
    availabilityStatus: "OPEN",
  },
  {
    id: "rest_homely_bowls",
    name: "Homely Bowls",
    cuisine: "North Indian",
    rating: 4.4,
    distanceKm: 2.4,
    availabilityStatus: "OPEN",
  },
  {
    id: "rest_late_night",
    name: "Late Night Grills",
    cuisine: "Grill",
    rating: 4.1,
    distanceKm: 4.9,
    availabilityStatus: "CLOSED",
  },
];

function isLeanBudget(request: UserPlanningRequest) {
  return request.budget < 1800;
}

function planArea(city: UserPlanningRequest["city"]) {
  if (city === "Delhi NCR") return "Gurugram";
  if (city === "Mumbai") return "Bandra";
  return "Indiranagar";
}

function dineoutSlot(request: UserPlanningRequest): DineoutSlot {
  return {
    restaurantName: isLeanBudget(request) ? "Cafe Verona" : "La Piazza Social",
    area: planArea(request.city),
    cuisine: "Italian",
    rating: isLeanBudget(request) ? 4.2 : 4.5,
    time: request.day === "today" ? "8:00 PM" : "7:45 PM",
    guests: request.guests,
    estimatedSpendPerPerson: isLeanBudget(request) ? 475 : 650,
  };
}

export function createMockSwiggyClient(): SwiggyPlanningClient {
  return {
    async getSavedLocations() {
      return locations;
    },

    async searchFoodRestaurants() {
      return restaurants;
    },

    async buildFoodCart(request, restaurant): Promise<Recommendation> {
      const lean = isLeanBudget(request);
      const items = lean
        ? [
            { name: "Rajma brown rice bowl", quantity: "1", price: 260, nutrition: "22g protein" },
            { name: "Curd side", quantity: "1", price: 55, nutrition: "probiotic" },
            { name: "Platform estimate", quantity: "1", price: 25 },
          ]
        : [
            { name: "Paneer millet protein bowl", quantity: "1", price: 320, nutrition: "31g protein" },
            { name: "Greek yogurt side", quantity: "1", price: 70, nutrition: "11g protein" },
            { name: "Platform estimate", quantity: "1", price: 30 },
          ];

      return {
        id: "rec_food",
        server: "food",
        title: lean ? "Rajma protein thali" : "Paneer protein bowl",
        provider: lean ? "Homely Bowls" : restaurant.name,
        locationLabel: "Home",
        eta: "28-34 min",
        total: items.reduce((sum, item) => sum + item.price, 0),
        confidence: lean ? 88 : 94,
        reason: "High protein, open restaurant, near saved home address, and below Builders Club food cart cap.",
        items,
        toolChain: [
          "get_addresses",
          "search_restaurants",
          "get_restaurant_menu",
          "update_food_cart",
          "get_food_cart",
        ],
        confirmationAction: "place_food_order",
        status: "prepared",
        guardrails: ["COD-only ready", "Below Rs 1,000 food cap", "No blind retry on placement"],
      };
    },

    async buildInstamartBasket(request): Promise<Recommendation> {
      const lean = isLeanBudget(request);
      const items = lean
        ? [
            { name: "Soya chunks", quantity: "500g", price: 130, nutrition: "52g protein/100g" },
            { name: "Moong dal", quantity: "1kg", price: 180, nutrition: "plant protein" },
            { name: "Curd", quantity: "500g", price: 80, nutrition: "calcium" },
            { name: "Spinach and vegetables", quantity: "1 basket", price: 300, nutrition: "fiber" },
          ]
        : [
            { name: "Tofu", quantity: "200g", price: 160, nutrition: "24g protein" },
            { name: "Moong dal", quantity: "1kg", price: 180, nutrition: "plant protein" },
            { name: "Greek yogurt", quantity: "400g", price: 210, nutrition: "22g protein" },
            { name: "Spinach and vegetables", quantity: "1 basket", price: 240, nutrition: "fiber" },
          ];

      return {
        id: "rec_instamart",
        server: "instamart",
        title: lean ? "Lean dinner basket" : "Dinner grocery basket",
        provider: "Instamart",
        locationLabel: "Home",
        eta: "10-14 min",
        total: items.reduce((sum, item) => sum + item.price, 0),
        confidence: lean ? 89 : 93,
        reason: "Basket covers dinner ingredients and leaves enough budget for Food and Dineout planning.",
        items,
        toolChain: ["search_items", "get_item_details", "update_cart", "get_cart"],
        confirmationAction: "checkout",
        status: "prepared",
        guardrails: ["Substitutions visible", "Checkout locked", "No payment data stored"],
      };
    },

    async findDineoutSlot(request): Promise<Recommendation> {
      const slot = dineoutSlot(request);
      const items = [
        { name: slot.restaurantName, quantity: `${slot.rating} rating`, price: 0 },
        { name: `${slot.area} table`, quantity: `${slot.guests} guests`, price: 0 },
        { name: `${slot.cuisine} vegetarian mains`, quantity: slot.time, price: slot.estimatedSpendPerPerson },
      ];

      return {
        id: "rec_dineout",
        server: "dineout",
        title: `${slot.cuisine} table for ${request.day}`,
        provider: slot.restaurantName,
        locationLabel: slot.area,
        eta: `${request.day}, ${slot.time}`,
        total: slot.estimatedSpendPerPerson,
        confidence: 87,
        reason: "Matches weekend timing, cuisine preference, guest count, and budget comfort.",
        items,
        toolChain: ["search_restaurants_dineout", "get_restaurant_details", "get_available_slots"],
        confirmationAction: "book_table",
        status: "prepared",
        guardrails: ["Separate booking confirmation", "Uses lat/lng search, not Food addressId", "No surprise reservation"],
      };
    },
  };
}
