import type {
  McpPromptStudioItem,
  McpResourcePromptServerSummary,
  McpResourcePromptSmokeRequest,
  McpResourcePromptStudio,
  McpResourceStudioItem,
  SwiggyServer,
} from "../../src/domain/types.js";

const serverOrder: SwiggyServer[] = ["food", "instamart", "dineout"];

const serverLabels: Record<SwiggyServer, string> = {
  food: "Food",
  instamart: "Instamart",
  dineout: "Dineout",
};

function endpointFor(server: SwiggyServer) {
  return server === "instamart" ? "POST mcp.swiggy.com/im" : `POST mcp.swiggy.com/${server}`;
}

function resourcePayload(server: SwiggyServer, uri: string, resourceType: McpResourceStudioItem["resourceType"]) {
  return {
    server,
    label: serverLabels[server],
    source: uri,
    scope: "mcp:resources",
    generatedBy: "MealPilot local MCP mock",
    registryKind: resourceType,
    endpoint: endpointFor(server),
    capabilities:
      resourceType === "widget_registry"
        ? ["semantic fallback", "iframe sandbox policy", "origin verification", "postMessage events"]
        : ["route class metadata", "retry guidance", "confirmation gates", "support identifiers"],
  };
}

function resource(options: {
  server: SwiggyServer;
  uri: string;
  name: string;
  resourceType: McpResourceStudioItem["resourceType"];
  returnedByTools: string[];
  mealPilotUse: string;
}): McpResourceStudioItem {
  return {
    id: `${options.server}_${options.resourceType}`,
    server: options.server,
    uri: options.uri,
    name: options.name,
    resourceType: options.resourceType,
    mimeType: "application/json",
    sampleRead: resourcePayload(options.server, options.uri, options.resourceType),
    returnedByTools: options.returnedByTools,
    mealPilotUse: options.mealPilotUse,
    status: "ready",
    evidenceLinks: ["/api/mcp/capability-registry", "/api/mcp/widget-runtime", `/api/mcp/${options.server}`],
  };
}

function promptMessages(server: SwiggyServer, title: string, args: Record<string, string | number | boolean>) {
  return [
    {
      role: "system" as const,
      text: `You are MealPilot's ${serverLabels[server]} specialist. Use Swiggy MCP ${server} tools only for this server and keep commercial actions confirmation-gated.`,
    },
    {
      role: "user" as const,
      text: `Apply ${title} with arguments ${JSON.stringify(args)}. Include totals, status identifiers, and any support-safe context.`,
    },
  ];
}

function prompt(options: {
  server: SwiggyServer;
  name: string;
  title: string;
  promptType: McpPromptStudioItem["promptType"];
  args: McpPromptStudioItem["arguments"];
  sampleArgs: Record<string, string | number | boolean>;
  mealPilotUse: string;
}): McpPromptStudioItem {
  return {
    id: `${options.server}_${options.name}`,
    server: options.server,
    name: options.name,
    title: options.title,
    promptType: options.promptType,
    arguments: options.args,
    sampleMessages: promptMessages(options.server, options.title, options.sampleArgs),
    mealPilotUse: options.mealPilotUse,
    status: "ready",
    evidenceLinks: ["/api/mcp/capability-registry", "/api/evaluation-lab", `/api/mcp/${options.server}`],
  };
}

function buildResources(): McpResourceStudioItem[] {
  return [
    resource({
      server: "food",
      uri: "swiggy://food/widgets",
      name: "Food widget registry",
      resourceType: "widget_registry",
      returnedByTools: ["search_restaurants", "get_restaurant_menu", "get_food_cart", "place_food_order"],
      mealPilotUse: "Restaurant, menu, cart, coupon, and tracking cards with semantic fallbacks.",
    }),
    resource({
      server: "food",
      uri: "swiggy://food/static-metadata",
      name: "Food static metadata",
      resourceType: "static_metadata",
      returnedByTools: ["get_addresses", "get_order_status", "report_error"],
      mealPilotUse: "Route classes, non-blind retry policy, confirmation copy, and support-safe identifiers.",
    }),
    resource({
      server: "instamart",
      uri: "swiggy://instamart/widgets",
      name: "Instamart widget registry",
      resourceType: "widget_registry",
      returnedByTools: ["search_products", "get_product_details", "get_instamart_cart", "checkout"],
      mealPilotUse: "Product, pantry, cart, and tracking cards with address-scoped fallbacks.",
    }),
    resource({
      server: "instamart",
      uri: "swiggy://instamart/static-metadata",
      name: "Instamart static metadata",
      resourceType: "static_metadata",
      returnedByTools: ["get_addresses", "your_go_to_items", "get_instamart_order_status", "report_error"],
      mealPilotUse: "Address refresh, checkout safety, grocery retry posture, and support correlation.",
    }),
    resource({
      server: "dineout",
      uri: "swiggy://dineout/widgets",
      name: "Dineout widget registry",
      resourceType: "widget_registry",
      returnedByTools: ["get_restaurant_details", "check_availability", "create_booking_cart", "book_table"],
      mealPilotUse: "Restaurant details, slot picker, free-booking cart, and booking status cards.",
    }),
    resource({
      server: "dineout",
      uri: "swiggy://dineout/static-metadata",
      name: "Dineout static metadata",
      resourceType: "static_metadata",
      returnedByTools: ["get_saved_locations", "get_booking_status", "report_error"],
      mealPilotUse: "Slot refresh, free-booking confirmation, non-blind recovery, and support identifiers.",
    }),
  ];
}

function buildPrompts(): McpPromptStudioItem[] {
  return [
    prompt({
      server: "food",
      name: "food_lunch_concierge",
      title: "Food lunch concierge",
      promptType: "planner",
      args: [
        { name: "city", required: true, example: "Bengaluru" },
        { name: "diet", required: true, example: "high-protein vegetarian" },
      ],
      sampleArgs: { city: "Bengaluru", diet: "high-protein vegetarian" },
      mealPilotUse: "Turns a lunch request into discovery, menu, cart, coupon, and confirmation steps.",
    }),
    prompt({
      server: "food",
      name: "food_recovery_status_check",
      title: "Food non-blind retry recovery",
      promptType: "recovery",
      args: [{ name: "sessionId", required: true, example: "mp_demo_food" }],
      sampleArgs: { sessionId: "mp_demo_food" },
      mealPilotUse: "Forces get_order_status before any retry after a place_food_order timeout.",
    }),
    prompt({
      server: "instamart",
      name: "instamart_pantry_restock",
      title: "Instamart pantry restock",
      promptType: "planner",
      args: [
        { name: "addressId", required: true, example: "addr_home" },
        { name: "budget", required: true, example: "900" },
      ],
      sampleArgs: { addressId: "addr_home", budget: 900 },
      mealPilotUse: "Composes go-to items, product search, cart staging, and checkout confirmation.",
    }),
    prompt({
      server: "instamart",
      name: "instamart_checkout_safety",
      title: "Instamart checkout safety",
      promptType: "safety",
      args: [{ name: "cartId", required: true, example: "im_cart_123" }],
      sampleArgs: { cartId: "im_cart_123" },
      mealPilotUse: "Refreshes cart truth and payment/address details before checkout.",
    }),
    prompt({
      server: "dineout",
      name: "dineout_evening_planner",
      title: "Dineout evening planner",
      promptType: "planner",
      args: [
        { name: "guests", required: true, example: "4" },
        { name: "date", required: true, example: "saturday" },
      ],
      sampleArgs: { guests: 4, date: "saturday" },
      mealPilotUse: "Finds restaurants, checks details, selects slots, creates cart, and books after confirmation.",
    }),
    prompt({
      server: "dineout",
      name: "dineout_booking_recovery",
      title: "Dineout booking recovery",
      promptType: "recovery",
      args: [{ name: "bookingId", required: false, example: "booking_789" }],
      sampleArgs: { bookingId: "booking_789" },
      mealPilotUse: "Checks booking status before retrying book_table after a timeout or unclear response.",
    }),
  ];
}

function buildSmokeRequests(
  resources: McpResourceStudioItem[],
  prompts: McpPromptStudioItem[],
): McpResourcePromptSmokeRequest[] {
  return serverOrder.flatMap((server) => {
    const serverResources = resources.filter((item) => item.server === server);
    const serverPrompts = prompts.filter((item) => item.server === server);
    const primaryPrompt = serverPrompts[0];

    return [
      {
        id: `${server}_resources_list`,
        server,
        method: "resources/list",
        params: {},
        evidenceLinks: [`/api/mcp/${server}`],
      },
      {
        id: `${server}_resources_read_widgets`,
        server,
        method: "resources/read",
        params: { uri: serverResources[0]?.uri },
        evidenceLinks: [`/api/mcp/${server}`, "/api/mcp/widget-runtime"],
      },
      {
        id: `${server}_prompts_list`,
        server,
        method: "prompts/list",
        params: {},
        evidenceLinks: [`/api/mcp/${server}`],
      },
      {
        id: `${server}_prompts_get_primary`,
        server,
        method: "prompts/get",
        params: {
          name: primaryPrompt?.name,
          arguments: Object.fromEntries(primaryPrompt?.arguments.map((arg) => [arg.name, arg.example]) ?? []),
        },
        evidenceLinks: [`/api/mcp/${server}`, "/api/evaluation-lab"],
      },
    ];
  });
}

function buildServerSummaries(
  resources: McpResourceStudioItem[],
  prompts: McpPromptStudioItem[],
): McpResourcePromptServerSummary[] {
  return serverOrder.map((server) => ({
    server,
    endpoint: endpointFor(server),
    resources: resources.filter((item) => item.server === server).length,
    prompts: prompts.filter((item) => item.server === server).length,
    status: "ready",
  }));
}

export function buildMcpResourcePromptStudio(): McpResourcePromptStudio {
  const resources = buildResources();
  const prompts = buildPrompts();
  const readyResources = resources.filter((item) => item.status === "ready").length;
  const readyPrompts = prompts.filter((item) => item.status === "ready").length;
  const total = resources.length + prompts.length;
  const ready = readyResources + readyPrompts;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round((ready / total) * 100),
    totalResources: resources.length,
    totalPrompts: prompts.length,
    readyResources,
    readyPrompts,
    serverSummaries: buildServerSummaries(resources, prompts),
    resources,
    prompts,
    smokeRequests: buildSmokeRequests(resources, prompts),
    assertions: [
      "Food, Instamart, and Dineout each expose widget registry and static metadata resources in the local MCP mock.",
      "Food, Instamart, and Dineout each expose planner and recovery or safety prompts through prompts/list and prompts/get.",
      "Every sample prompt keeps commercial actions confirmation-gated and server-scoped.",
      "Every resource read returns JSON metadata that can back semantic widget fallbacks and support-safe operations.",
    ],
    externalGates: [
      "Live resources/list and resources/read must be re-run against Swiggy staging after Builder Access credentials are issued.",
      "Live prompts/list and prompts/get must be compared against the local prompt contracts before production promotion.",
      "Hosted Swiggy widget iframe URLs, prompt-template ownership, and static metadata freshness remain Swiggy-controlled.",
    ],
  };
}
