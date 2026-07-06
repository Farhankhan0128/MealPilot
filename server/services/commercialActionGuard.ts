import type {
  CommercialActionGuardReport,
  CommercialActionGuardrail,
  CommercialActionLane,
  CommercialActionRetryDrill,
  CommercialActionTelemetryContract,
  MealPlan,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
];

function lane(input: CommercialActionLane): CommercialActionLane {
  return input;
}

function buildLanes(): CommercialActionLane[] {
  return [
    lane({
      id: "food_order",
      label: "Food order placement",
      server: "food",
      actionTool: "place_food_order",
      freshReadTool: "get_food_cart",
      verificationTool: "get_food_orders",
      status: "ready",
      confirmationRequired: true,
      nonIdempotent: true,
      paymentPolicy: "COD-only in v1; online payment and saved payment instruments stay external-gated.",
      routeClass: "commercial_action",
      confirmationCopy: {
        chat: "Confirm Food order? Reply yes to place the current cart after seeing items, total, ETA, and payment mode.",
        voice:
          "I will place the current Food cart for cash on delivery after confirming the items, total, and delivery time. Say confirm to place.",
      },
      preflightChecks: [
        "Refresh get_food_cart at the turn boundary.",
        "Verify cart total stays under the Food Rs 1000 cap.",
        "Warn before restaurant switches that flush the cart.",
        "Require explicit user-visible confirmation before place_food_order.",
      ],
      retryPolicy:
        "On 5xx or network failure, wait 2-5 seconds, call get_food_orders, treat found order as success, otherwise retry once through the guarded path.",
      telemetryFields: ["session_id", "request_id", "tool", "route_class", "status", "duration_ms", "confirmation_id"],
      supportPacketFields: ["session_id", "request_id", "tool", "user_visible_summary", "redacted_cart_total"],
      evidenceLinks: [officialSources[0], officialSources[1], officialSources[2], "/api/sessions/:sessionId/preflight"],
    }),
    lane({
      id: "instamart_checkout",
      label: "Instamart checkout",
      server: "instamart",
      actionTool: "checkout",
      freshReadTool: "get_cart",
      verificationTool: "get_orders",
      status: "ready",
      confirmationRequired: true,
      nonIdempotent: true,
      paymentPolicy: "COD-only in v1; address serviceability, minimum order, stock, and substitutions are checked before checkout.",
      routeClass: "commercial_action",
      confirmationCopy: {
        chat: "Confirm Instamart checkout? Reply yes after reviewing basket, substitutions, total, serviceability, and COD payment.",
        voice:
          "I will check out the current Instamart basket for cash on delivery after confirming the total and delivery window. Say confirm to place.",
      },
      preflightChecks: [
        "Refresh get_cart after product updates.",
        "Reject address switches unless clear_cart is run first.",
        "Check serviceability, stock, and the Rs 99 minimum.",
        "Require explicit user-visible confirmation before checkout.",
      ],
      retryPolicy:
        "On checkout uncertainty, call get_orders before retrying so a successful grocery order is not duplicated.",
      telemetryFields: ["session_id", "request_id", "tool", "address_scope_hash", "status", "duration_ms", "confirmation_id"],
      supportPacketFields: ["session_id", "request_id", "tool", "stock_or_serviceability_summary", "redacted_basket_total"],
      evidenceLinks: [officialSources[0], officialSources[1], officialSources[3], "/api/mcp/state-orchestrator"],
    }),
    lane({
      id: "dineout_booking",
      label: "Dineout table booking",
      server: "dineout",
      actionTool: "book_table",
      freshReadTool: "get_available_slots",
      verificationTool: "get_booking_status",
      status: "ready",
      confirmationRequired: true,
      nonIdempotent: true,
      paymentPolicy: "Reservation only; payment handling and venue-specific deposits remain outside local mock evidence.",
      routeClass: "commercial_action",
      confirmationCopy: {
        chat: "Confirm table booking? Reply yes after reviewing restaurant, slot, date, time, party size, offer, and address.",
        voice:
          "I will book this Dineout table after confirming restaurant, time, and party size. Say confirm to reserve.",
      },
      preflightChecks: [
        "Resolve saved location or explicit lat/lng.",
        "Filter Dineout search results to available restaurants.",
        "Refresh get_available_slots immediately before book_table.",
        "Require explicit user-visible confirmation of slot date, time, and party size.",
      ],
      retryPolicy:
        "On 5xx or network failure, call get_booking_status with restaurant and slot context before retrying book_table.",
      telemetryFields: ["session_id", "request_id", "tool", "slot_id_hash", "party_size", "status", "duration_ms"],
      supportPacketFields: ["session_id", "request_id", "tool", "restaurant_summary", "slot_summary"],
      evidenceLinks: [officialSources[0], officialSources[4], "/api/mcp/scenario-runner", "/api/mcp/widget-runtime"],
    }),
    lane({
      id: "combined_evening",
      label: "Combined evening split confirmation",
      server: "combined",
      actionTool: "place_food_order + book_table",
      freshReadTool: "get_available_slots + get_food_cart",
      verificationTool: "get_booking_status + get_food_orders",
      status: "ready",
      confirmationRequired: true,
      nonIdempotent: true,
      paymentPolicy:
        "Reservation and Food delivery are confirmed separately; future scheduled Food delivery remains an external reminder flow.",
      routeClass: "commercial_action",
      confirmationCopy: {
        chat: "Confirm Dineout booking first, then confirm Food delivery separately. MealPilot will not combine both into one silent action.",
        voice:
          "I will confirm the table first and the delivery separately, so nothing is placed without a clear yes for each step.",
      },
      preflightChecks: [
        "Run Dineout slot confirmation before Food cart placement.",
        "Keep addressId and lat/lng scopes separate.",
        "Warn that Food v1 places immediate orders, not scheduled deliveries.",
        "Use shared OAuth but re-auth both servers after any 401.",
      ],
      retryPolicy:
        "Run check-then-retry independently per server; never retry both commercial actions as a bundled blind replay.",
      telemetryFields: ["session_id", "request_id", "server", "tool", "step_sequence", "status", "confirmation_id"],
      supportPacketFields: ["session_id", "request_id", "server", "tool", "step_sequence", "user_visible_summary"],
      evidenceLinks: [officialSources[0], officialSources[5], "/api/premium-concierge-itinerary", "/api/mcp/scenario-runner"],
    }),
  ];
}

function buildGuardrails(): CommercialActionGuardrail[] {
  return [
    {
      id: "no_blind_retry",
      label: "No blind commercial retry",
      status: "ready",
      requirement: "Never blindly retry place_food_order, checkout, or book_table after an ambiguous failure.",
      mealPilotControl: "Every lane has a verification tool and check-then-retry policy.",
      evidenceLinks: [officialSources[0], "/api/resilience", "/api/error-intelligence"],
    },
    {
      id: "fresh_authoritative_read",
      label: "Fresh authoritative read",
      status: "ready",
      requirement: "Read cart or slot truth at the turn boundary before mutation or placement.",
      mealPilotControl: "Each lane declares a freshReadTool and the State Orchestrator verifies refresh-before-mutation.",
      evidenceLinks: [officialSources[1], "/api/mcp/state-orchestrator"],
    },
    {
      id: "explicit_confirmation",
      label: "Explicit confirmation",
      status: "ready",
      requirement: "No order, checkout, or table booking can happen without user-visible confirmation.",
      mealPilotControl: "Every lane includes chat and voice confirmation copy with total, ETA, slot, or party-size context.",
      evidenceLinks: [officialSources[0], "/api/sessions/:sessionId/preflight"],
    },
    {
      id: "per_server_boundaries",
      label: "Per-server boundaries",
      status: "ready",
      requirement: "Food, Instamart, and Dineout state is not merged even though OAuth is shared.",
      mealPilotControl: "Combined lanes keep Food addressId, Dineout lat/lng, and Instamart address scope separate.",
      evidenceLinks: [officialSources[1], officialSources[5], "/api/mcp/scenario-runner"],
    },
    {
      id: "cod_and_payment_gate",
      label: "COD and payment gate",
      status: "ready",
      requirement: "Use COD-only v1 posture and avoid storing or collecting payment instruments.",
      mealPilotControl: "Payment policy is declared per lane; online payments remain external-gated in launch docs.",
      evidenceLinks: [officialSources[2], officialSources[3], "/api/data-governance-center"],
    },
    {
      id: "retry_budget",
      label: "Retry budget",
      status: "ready",
      requirement: "Cap user-facing retries and fail loudly after the retry budget is exhausted.",
      mealPilotControl: "Retry drills use a 2-5 second check window and route failures to Support Bridge with session IDs.",
      evidenceLinks: [officialSources[0], "/api/support/bridge", "/api/slo-incident-command"],
    },
    {
      id: "telemetry_redaction",
      label: "Telemetry redaction",
      status: "ready",
      requirement: "Log session IDs, request IDs, route class, and status without raw PII, tokens, or payment data.",
      mealPilotControl: "Telemetry contracts hash address, cart, slot, and user context fields.",
      evidenceLinks: [officialSources[0], "/api/telemetry/runtime", "/api/audit-ledger"],
    },
    {
      id: "staging_soak_gate",
      label: "Staging soak gate",
      status: "external_gate",
      requirement: "Validate commercial actions in staging for at least 48 hours before production.",
      mealPilotControl: "Staging Certification and Launch Bundle preserve the credential and soak gates.",
      evidenceLinks: [officialSources[0], "/api/staging-certification-matrix", "/api/production-launch-bundle"],
    },
  ];
}

function buildRetryDrills(): CommercialActionRetryDrill[] {
  return [
    {
      id: "food_5xx_after_place",
      laneId: "food_order",
      label: "Food placement 5xx recovery",
      simulatedFailure: "place_food_order times out after the user confirmed.",
      firstResponse: "Pause 2-5 seconds and suppress duplicate order prompts.",
      verificationTool: "get_food_orders",
      retryDecision: "If latest order matches cart total and restaurant, mark success; otherwise retry once through confirmation lock.",
      supportContext: ["session_id", "request_id", "cart_total", "restaurant_summary"],
      status: "ready",
    },
    {
      id: "instamart_uncertain_checkout",
      laneId: "instamart_checkout",
      label: "Instamart checkout uncertainty",
      simulatedFailure: "checkout returns network error after payment mode selection.",
      firstResponse: "Keep basket locked and explain that MealPilot is checking order status.",
      verificationTool: "get_orders",
      retryDecision: "Treat matching order as success; otherwise refresh get_cart and ask before retrying.",
      supportContext: ["session_id", "request_id", "address_scope_hash", "redacted_basket_total"],
      status: "ready",
    },
    {
      id: "dineout_booking_window",
      laneId: "dineout_booking",
      label: "Dineout booking ambiguity",
      simulatedFailure: "book_table 5xxs or slot closes during confirmation.",
      firstResponse: "Run get_booking_status or refresh slots before any retry.",
      verificationTool: "get_booking_status",
      retryDecision: "If no booking exists, refetch get_available_slots and ask for the replacement slot.",
      supportContext: ["session_id", "request_id", "restaurant_summary", "slot_summary"],
      status: "ready",
    },
    {
      id: "combined_partial_success",
      laneId: "combined_evening",
      label: "Combined partial success",
      simulatedFailure: "Dineout booking succeeds but the later Food order path fails.",
      firstResponse: "Keep the Dineout confirmation visible and recover only the Food lane.",
      verificationTool: "get_booking_status + get_food_orders",
      retryDecision: "Never roll back the confirmed booking silently; ask before rebuilding or placing the Food cart.",
      supportContext: ["session_id", "dineout_request_id", "food_request_id", "step_sequence"],
      status: "ready",
    },
  ];
}

function buildTelemetryContract(): CommercialActionTelemetryContract[] {
  return [
    { id: "session", field: "session_id", required: true, redaction: "opaque Swiggy/MealPilot session reference", example: "mp_..." },
    { id: "request", field: "request_id", required: true, redaction: "UUID only", example: "9f64e80b..." },
    { id: "tool", field: "tool", required: true, redaction: "tool name only", example: "place_food_order" },
    { id: "route", field: "route_class", required: true, redaction: "enum", example: "commercial_action" },
    { id: "status", field: "status", required: true, redaction: "ok/error class only", example: "pending_verification" },
    { id: "duration", field: "duration_ms", required: true, redaction: "numeric duration only", example: "217" },
    { id: "confirmation", field: "confirmation_id", required: true, redaction: "local opaque confirmation reference", example: "confirm_food_001" },
    { id: "user", field: "user_id_hash", required: true, redaction: "sha256 hash", example: "sha256:..." },
  ];
}

function calculateScore(options: {
  lanes: CommercialActionLane[];
  guardrails: CommercialActionGuardrail[];
  retryDrills: CommercialActionRetryDrill[];
  telemetryContract: CommercialActionTelemetryContract[];
}) {
  const readyLanes = options.lanes.filter((item) => item.status === "ready").length / options.lanes.length;
  const readyGuardrails = options.guardrails.filter((item) => item.status === "ready").length / options.guardrails.length;
  const readyDrills = options.retryDrills.filter((item) => item.status === "ready").length / options.retryDrills.length;
  const requiredTelemetry =
    options.telemetryContract.filter((item) => item.required).length / options.telemetryContract.length;

  return Math.round(readyLanes * 35 + readyGuardrails * 30 + readyDrills * 20 + requiredTelemetry * 15);
}

export function buildCommercialActionGuard(latestPlan?: MealPlan): CommercialActionGuardReport {
  const lanes = buildLanes();
  const guardrails = buildGuardrails();
  const retryDrills = buildRetryDrills();
  const telemetryContract = buildTelemetryContract();
  const readyLanes = lanes.filter((item) => item.status === "ready").length;
  const readyGuardrails = guardrails.filter((item) => item.status === "ready").length;

  return {
    generatedAt: new Date().toISOString(),
    score: calculateScore({ lanes, guardrails, retryDrills, telemetryContract }),
    officialSources,
    totalLanes: lanes.length,
    readyLanes,
    totalGuardrails: guardrails.length,
    readyGuardrails,
    retryDrills,
    lanes,
    guardrails,
    telemetryContract,
    confirmationMatrix: lanes.map((item) => ({
      laneId: item.id,
      chat: item.confirmationCopy.chat,
      voice: item.confirmationCopy.voice,
    })),
    latestPlanProof: latestPlan
      ? {
          sessionId: latestPlan.id,
          recommendations: latestPlan.recommendations.length,
          commercialRecommendations: latestPlan.recommendations.filter((item) =>
            ["food", "instamart", "dineout"].includes(item.server),
          ).length,
        }
      : undefined,
    assertions: [
      "Commercial actions are non-idempotent by default and always use check-then-retry after ambiguous failures.",
      "Food, Instamart, and Dineout all require a fresh authoritative read before placement, checkout, or booking.",
      "Chat and voice confirmations are separate but mandatory before any commercial action.",
      "Combined journeys split Dineout booking and Food delivery confirmations instead of bundling them into one silent action.",
      "Telemetry and support packets include session/request context while excluding bearer tokens, raw addresses, payment data, and full payload bodies.",
    ],
    externalGates: [
      "Real staging credentials are required before live commercial action drills can touch Swiggy.",
      "Production access approval and 48-hour staging soak are required before real-user commercial traffic.",
      "Online payment support, future scheduled Food delivery, and future Idempotency-Key headers remain Swiggy roadmap or partner gates.",
    ],
  };
}
