import crypto from "node:crypto";
import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyCartMutationExecution,
  SwiggyCartMutationGuardrail,
  SwiggyCartMutationLane,
  SwiggyCartMutationReport,
  SwiggyCartMutationScenario,
  SwiggyCartMutationStatus,
  SwiggyCartMutationTelemetry,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_food_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/food/update_food_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/food/flush_food_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/food/apply_food_coupon/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/update_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/clear_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/checkout/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/create_cart/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/book_table/",
];

function statusWeight(status: SwiggyCartMutationStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.48;
}

function requiredReadbackTool(server: SwiggyServer): SwiggyCartMutationExecution["requiredReadbackTool"] {
  if (server === "food") return "get_food_cart";
  if (server === "instamart") return "get_cart";
  return "get_available_slots";
}

function isToolServerMatch(server: SwiggyServer, tool: SwiggyCartMutationExecution["input"]["mutationTool"]) {
  if (server === "food") return tool === "update_food_cart" || tool === "flush_food_cart";
  if (server === "instamart") return tool === "update_cart" || tool === "clear_cart";
  return tool === "create_cart";
}

function hashArguments(args: Record<string, unknown>) {
  return crypto.createHash("sha256").update(JSON.stringify(args)).digest("hex").slice(0, 16);
}

function dataFromToolResponse(response: unknown): Record<string, unknown> {
  if (!response || typeof response !== "object") return {};
  const result = (response as { result?: unknown }).result;
  if (result && typeof result === "object") {
    const data = (result as { data?: unknown }).data;
    if (data && typeof data === "object" && !Array.isArray(data)) return data as Record<string, unknown>;
  }
  return {};
}

function totalBucket(total: unknown) {
  if (typeof total !== "number") return "unknown";
  if (total === 0) return "zero";
  if (total <= 500) return "under_500";
  if (total <= 1000) return "under_1000";
  return "over_1000";
}

function readbackSummary(response: unknown): SwiggyCartMutationExecution["readback"] {
  const data = dataFromToolResponse(response);
  return {
    available: Object.keys(data).length > 0,
    status: typeof data.status === "string" ? data.status : "unknown",
    totalBucket: totalBucket(data.total),
    paymentMethodLabel: typeof data.paymentMethod === "string" ? data.paymentMethod : "not_returned",
  };
}

export function buildSwiggyCartMutationWorkbench(options: {
  config: ServerConfig;
  plans: MealPlan[];
}): SwiggyCartMutationReport {
  const latestPlan = options.plans.at(-1);
  const recommendedCarts = latestPlan?.recommendations.length ?? 3;

  const lanes: SwiggyCartMutationLane[] = [
    {
      id: "food_cart_readback",
      server: "food",
      label: "Food Cart Readback",
      officialTools: ["get_food_cart", "update_food_cart", "flush_food_cart"],
      mutationRule: "Food cart mutations use the selected restaurantId, addressId, and item customization shape from search results.",
      readbackRule: "Every update_food_cart or flush_food_cart branch immediately calls get_food_cart before claiming the cart is visible.",
      userGate: "Customized item quantity changes ask whether add-ons and variants should repeat before updating quantity.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[3], officialSources[4]],
    },
    {
      id: "food_payment_truth",
      server: "food",
      label: "Food Payment Truth",
      officialTools: ["get_food_cart", "apply_food_coupon"],
      mutationRule: "Coupon application and cart totals are treated as separate state changes.",
      readbackRule: "Payment methods and coupon savings are displayed only from get_food_cart response fields.",
      userGate: "Coupon copy is blocked unless coupon_discount is greater than zero.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[5], "/api/swiggy-offer-intelligence"],
    },
    {
      id: "instamart_replace_cart",
      server: "instamart",
      label: "Instamart Replace Cart",
      officialTools: ["get_cart", "update_cart", "clear_cart"],
      mutationRule: "Instamart update_cart replaces the full cart, so MealPilot sends the complete intended basket for selectedAddressId.",
      readbackRule: "After update_cart or clear_cart, get_cart reads bill breakdown and available payment methods before checkout.",
      userGate: "Address switches force a fresh product search and full basket review before another update_cart.",
      status: "ready",
      evidenceLinks: [officialSources[6], officialSources[7], officialSources[8], "/api/swiggy-location-trust"],
    },
    {
      id: "dineout_cart_gate",
      server: "dineout",
      label: "Dineout Cart Gate",
      officialTools: ["create_cart", "book_table", "get_available_slots"],
      mutationRule: "Dineout create_cart is reserved for standalone booking or bill-payment cart operations.",
      readbackRule: "For reservations, get_available_slots rechecks slot, itemId, guest count, and free booking constraints before book_table.",
      userGate: "Bill-payment cart behavior stays disabled until Swiggy credentials and paid-deal policy are reviewed.",
      status: "watch",
      evidenceLinks: [officialSources[10], officialSources[11], "/api/mcp/commercial-action-guard"],
    },
    {
      id: "cross_server_cart_preflight",
      server: "combined",
      label: "Cross-server Cart Preflight",
      officialTools: ["get_food_cart", "get_cart", "create_cart"],
      mutationRule: `Coordinate ${recommendedCarts} recommendation cart candidates without mixing Food, Instamart, and Dineout mutation scopes.`,
      readbackRule: "Each server owns its own cart readback, payment-method display, and confirmation lock.",
      userGate: "Commercial actions stay separated; one cart uncertainty never retries another server's checkout or booking.",
      status: "ready",
      evidenceLinks: ["/api/sessions/:sessionId/preflight", "/api/mcp/state-orchestrator", "/api/swiggy-order-lifecycle"],
    },
    {
      id: "live_cart_calibration",
      server: "combined",
      label: "Live Cart Calibration",
      officialTools: ["get_food_cart", "update_food_cart", "get_cart", "update_cart", "create_cart"],
      mutationRule: "Replay cart fixtures against seeded Swiggy accounts before production credentials enable live writes.",
      readbackRule: "Compare mock and staging totals, payment methods, add-on validity, and bill breakdowns.",
      userGate: "Live write traffic remains blocked until staging transcript proof is reviewed.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix"],
    },
  ];

  const guardrails: SwiggyCartMutationGuardrail[] = [
    {
      id: "read_before_write",
      label: "Read Before Write",
      policy: "Every cart mutation path starts from current address, restaurant/product/slot, and known cart state.",
      status: "ready",
      evidenceLinks: ["/api/mcp/state-orchestrator", "/api/sessions/:sessionId/replay"],
    },
    {
      id: "post_mutation_readback",
      label: "Post-mutation Readback",
      policy: "Food and Instamart cart writes are followed by get_food_cart or get_cart before UI copy claims success.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[6]],
    },
    {
      id: "payment_method_truth",
      label: "Payment Method Truth",
      policy: "Payment methods are displayed only when returned by cart responses; MealPilot never invents payment options.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[6]],
    },
    {
      id: "customization_confirmation",
      label: "Customization Confirmation",
      policy: "Food add-ons, variants, and variantV2 choices use the same format as menu search and ask before repeating customizations.",
      status: "ready",
      evidenceLinks: [officialSources[3], "/api/mcp/tool-contract-matrix"],
    },
    {
      id: "commercial_single_flight",
      label: "Commercial Single Flight",
      policy: "Cart uncertainty blocks checkout/place/book retries until status, cart, or booking probes settle the outcome.",
      status: "ready",
      evidenceLinks: ["/api/mcp/commercial-action-guard", "/api/swiggy-order-lifecycle"],
    },
  ];

  const scenarios: SwiggyCartMutationScenario[] = [
    {
      id: "food_customized_quantity",
      label: "Food Customized Quantity",
      trigger: "User asks for one more biryani with different add-ons.",
      expectedDecision: "Ask customization intent, call update_food_cart with one format, then get_food_cart to show the result.",
      tools: ["update_food_cart", "get_food_cart"],
      status: "ready",
    },
    {
      id: "instamart_address_switch",
      label: "Instamart Address Switch",
      trigger: "User changes grocery delivery from Home to Office.",
      expectedDecision: "Clear stale availability, re-search products, send full update_cart for selectedAddressId, then get_cart.",
      tools: ["search_products", "update_cart", "get_cart"],
      status: "ready",
    },
    {
      id: "dineout_standalone_cart",
      label: "Dineout Standalone Cart",
      trigger: "Operator tests create_cart before a free table booking.",
      expectedDecision: "Validate slot, itemId, guest count, free booking constraints, and keep bill-payment cart gated.",
      tools: ["get_available_slots", "create_cart", "book_table"],
      status: "watch",
    },
    {
      id: "cart_uncertain_write",
      label: "Uncertain Cart Write",
      trigger: "Network failure after a cart mutation request.",
      expectedDecision: "Read the server cart, show last known state, and never escalate to commercial action until cart truth is visible.",
      tools: ["get_food_cart", "get_cart", "report_error"],
      status: "ready",
    },
  ];

  const telemetry: SwiggyCartMutationTelemetry[] = [
    { field: "cart_id_hash", source: "cart readback", redaction: "hash only; no raw cart id", status: "ready" },
    { field: "mutation_request_id", source: "runtime telemetry", redaction: "opaque UUID", status: "ready" },
    { field: "payment_method_labels", source: "cart response", redaction: "label only; no payment instrument data", status: "ready" },
    { field: "item_list_hash", source: "cart mutation payload", redaction: "hash item ids and quantities", status: "ready" },
    { field: "dineout_bill_cart_gate", source: "create_cart policy", redaction: "boolean gate only", status: "watch" },
  ];

  const externalGates = [
    "Staging credentials and seeded carts are required before live cart write replay.",
    "Paid Dineout bill-payment cart behavior remains disabled until Swiggy confirms production policy.",
    "Exact cart IDs, payment instrument data, raw address IDs, and full payloads are never logged.",
  ];

  const score =
    (lanes.reduce((sum, lane) => sum + statusWeight(lane.status), 0) / lanes.length) * 30 +
    (guardrails.reduce((sum, guardrail) => sum + statusWeight(guardrail.status), 0) / guardrails.length) * 25 +
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
      readyGuardrails: guardrails.filter((guardrail) => guardrail.status === "ready").length,
      scenarios: scenarios.length,
      readbackLanes: lanes.filter((lane) => lane.readbackRule.toLowerCase().includes("get_")).length,
      externalGates: externalGates.length,
    },
    lanes,
    guardrails,
    scenarios,
    telemetry,
    operatorActions: [
      {
        id: "seed_staging_carts",
        label: "Seed staging carts",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Needed to replay Food, Instamart, and Dineout cart branches with real cart responses.",
      },
      {
        id: "enforce_cart_readback",
        label: "Enforce cart readback",
        owner: "MealPilot",
        status: "ready",
        evidence: "State Orchestrator and Cart Mutation Workbench require cart readback after writes.",
      },
      {
        id: "gate_dineout_bill_cart",
        label: "Gate Dineout bill carts",
        owner: "Operator",
        status: "watch",
        evidence: "Standalone Dineout bill-payment cart remains disabled until Swiggy policy review.",
      },
    ],
    assertions: [
      "update_food_cart is followed by get_food_cart before the user sees a cart success claim.",
      "Instamart update_cart replaces the full basket and is followed by get_cart before checkout.",
      "Payment methods and coupon savings are shown only when cart responses return them.",
      "Customized Food quantities ask before repeating variants, variantsV2, or add-ons.",
      "Dineout create_cart stays gated to valid standalone booking or bill-payment contexts.",
    ],
    externalGates,
  };
}

export async function mutateSwiggyCartWithReadback(input: {
  config: ServerConfig;
  server: SwiggyServer;
  mutationTool: SwiggyCartMutationExecution["input"]["mutationTool"];
  toolArguments: Record<string, unknown>;
  contextFresh: boolean;
  userConfirmed: boolean;
  commercialActionRequested: boolean;
  liveCredentialReady: boolean;
  executeTool: (server: SwiggyServer, tool: string, args: Record<string, unknown>) => Promise<unknown>;
}): Promise<SwiggyCartMutationExecution> {
  const riskFlags: string[] = [];
  const requiredTool = requiredReadbackTool(input.server);
  const toolServerMatch = isToolServerMatch(input.server, input.mutationTool);
  const executedTools: string[] = [];

  if (!toolServerMatch) riskFlags.push("mutation_tool_server_mismatch");
  if (!input.contextFresh) riskFlags.push("fresh_cart_or_selection_required_before_write");
  if (!input.userConfirmed) riskFlags.push("cart_mutation_requires_user_confirmation");
  if (input.commercialActionRequested) riskFlags.push("commercial_action_must_use_confirmation_command_center");
  if (input.server === "dineout") riskFlags.push("dineout_create_cart_requires_policy_and_slot_readback_review");
  if (input.config.swiggyMode !== "mock" && !input.liveCredentialReady) riskFlags.push("live_swiggy_token_required_for_cart_write");

  let decision: SwiggyCartMutationExecution["decision"];
  let mutationResponse: unknown;
  let readbackResponse: unknown;

  if (input.commercialActionRequested) {
    decision = "blocked_commercial_action";
  } else if (!toolServerMatch || !input.contextFresh) {
    decision = "blocked_until_refresh";
  } else if (!input.userConfirmed) {
    decision = "blocked_for_confirmation";
  } else if (input.server === "dineout" || (input.config.swiggyMode !== "mock" && !input.liveCredentialReady)) {
    decision = "external_gate";
  } else {
    mutationResponse = await input.executeTool(input.server, input.mutationTool, input.toolArguments);
    executedTools.push(input.mutationTool);
    readbackResponse = await input.executeTool(input.server, requiredTool, input.server === "food" ? input.toolArguments : {});
    executedTools.push(requiredTool);
    decision = "mutated_with_readback";
  }

  const readback = readbackSummary(readbackResponse ?? mutationResponse);

  return {
    generatedAt: new Date().toISOString(),
    requestId: `cart_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      server: input.server,
      mutationTool: input.mutationTool,
      contextFresh: input.contextFresh,
      userConfirmed: input.userConfirmed,
      commercialActionRequested: input.commercialActionRequested,
    },
    decision,
    requiredReadbackTool: requiredTool,
    executedTools,
    readback,
    userFacingCopy:
      decision === "mutated_with_readback"
        ? "I updated the cart and immediately refreshed the official cart readback before showing the result."
        : decision === "blocked_for_confirmation"
          ? "I need explicit confirmation before changing your Swiggy cart."
          : decision === "blocked_commercial_action"
            ? "Cart mutation cannot include order placement, checkout, or table booking. Use the final confirmation command center."
            : decision === "external_gate"
              ? "This cart write is gated until Swiggy staging credentials or Dineout policy review are available."
              : "I need fresh cart, address, restaurant, product, or slot truth before writing to this cart.",
    riskFlags,
    telemetry: [
      { field: "server", value: input.server, redaction: "safe enum" },
      { field: "mutation_tool", value: input.mutationTool, redaction: "tool name only" },
      { field: "required_readback_tool", value: requiredTool, redaction: "tool name only" },
      { field: "tool_argument_hash", value: hashArguments(input.toolArguments), redaction: "sha256 prefix only" },
      { field: "raw_cart_payload_retained", value: "false", redaction: "hard-coded privacy invariant" },
      { field: "commercial_action_executed", value: "false", redaction: "hard-coded safety invariant" },
    ],
    assertions: [
      "Cart mutation execution never calls place_food_order, checkout, or book_table.",
      "Food cart writes are followed by get_food_cart before success copy.",
      "Instamart cart writes are followed by get_cart before checkout copy.",
      "Raw cart payloads, payment instruments, address ids, and full item identifiers are not retained in telemetry.",
    ],
  };
}
