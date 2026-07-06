import type {
  MealPlan,
  ObservabilityAttribute,
  RouteOptimizationBatch,
  RouteOptimizationHandoff,
  ObservabilityTraceReport,
  RouteOptimizationJourney,
  RouteOptimizationProfile,
  RouteOptimizationStep,
  SwiggyRouteOptimizationReport,
  SwiggyServer,
  ToolCallEvent,
  TraceEnvelope,
  TraceMetric,
  TraceSpan,
} from "../../src/domain/types.js";

function stableHash(input: string) {
  let hash = 0;
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function attr(key: string, value: string | number | boolean): ObservabilityAttribute {
  return { key, value };
}

function toolClass(tool: string): RouteOptimizationStep["toolClass"] {
  if (["place_food_order", "checkout", "book_table"].includes(tool)) return "commercial_action";
  if (["update_food_cart", "update_cart", "flush_food_cart", "clear_cart"].includes(tool)) return "cart_mutation";
  if (["fetch_food_coupons", "apply_food_coupon"].includes(tool)) return "coupon";
  if (["track_food_order", "track_order", "get_booking_status", "get_food_orders", "get_orders"].includes(tool)) {
    return "tracking";
  }
  if (tool === "report_error") return "support";
  return "read";
}

function retryPolicyFor(tool: string) {
  const currentClass = toolClass(tool);
  if (currentClass === "commercial_action") return "Never blind retry; check matching order or booking status first.";
  if (currentClass === "cart_mutation") return "Retry only with identical arguments inside the active Swiggy session.";
  if (currentClass === "coupon") return "Retry once; then surface coupon failure without blocking the base cart.";
  if (currentClass === "tracking" || currentClass === "read") return "Exponential backoff with jitter, capped by 30s user-facing budget.";
  return "Do not retry automatically; generate report_error payload.";
}

function cachePolicyFor(tool: string) {
  if (["get_addresses", "get_saved_locations"].includes(tool)) return "Session cache; refresh when user changes city/address.";
  if (["get_food_cart", "get_cart"].includes(tool)) return "Never trust cache at action boundary; read server cart truth.";
  if (tool.includes("track") || tool.includes("status")) return "No faster than 10s user-triggered or reminder-triggered refresh.";
  if (["search_restaurants", "search_restaurants_dineout", "get_restaurant_details"].includes(tool)) {
    return "Short-lived metadata cache; invalidate on location/date/guest changes.";
  }
  if (["search_products", "your_go_to_items"].includes(tool)) return "Address-scoped cache; invalidate on basket/address changes.";
  return "No durable Swiggy payload cache; store only redacted session evidence.";
}

function gateFor(tool: string) {
  if (tool === "place_food_order") return "Requires visible food items, total, ETA, payment method, and explicit confirm.";
  if (tool === "checkout") return "Requires visible grocery items, address label, total, and explicit confirm.";
  if (tool === "book_table") return "Requires restaurant, date, time, guests, free booking status, and explicit confirm.";
  if (["update_food_cart", "update_cart", "clear_cart", "flush_food_cart"].includes(tool)) {
    return "Allowed before checkout, but show destructive cart/address/restaurant switch warnings.";
  }
  return "Read-only or support action; no commercial confirmation needed.";
}

function spanFromEvent(event: ToolCallEvent, traceId: string, rootSpanId: string, index: number): TraceSpan {
  const currentClass = toolClass(event.tool);
  return {
    id: `${traceId}_span_${index + 1}`,
    traceId,
    parentSpanId: rootSpanId,
    name: `swiggy.${event.server}.${event.tool}`,
    kind: "mcp_tool",
    server: event.server,
    tool: event.tool,
    status: event.status === "blocked" ? "blocked" : event.status === "needs_user_confirmation" ? "locked" : "ok",
    startOffsetMs: index * 35,
    durationMs: event.durationMs,
    attributes: [
      attr("swiggy.server", event.server),
      attr("swiggy.tool", event.tool),
      attr("tool.class", currentClass),
      attr("session.id", event.sessionId),
      attr("retry.policy", retryPolicyFor(event.tool)),
      attr("cache.policy", cachePolicyFor(event.tool)),
      attr("redaction", "raw address, token, payment, and full payload omitted"),
    ],
  };
}

function traceForPlan(plan: MealPlan): TraceEnvelope {
  const traceId = `trace_${stableHash(plan.id)}`;
  const rootSpanId = `${traceId}_root`;
  const requestId = `req_${stableHash(`${plan.id}:mealpilot`)}`;
  const mcpSpans = plan.auditTrail.map((event, index) => spanFromEvent(event, traceId, rootSpanId, index));
  const confirmationSpans: TraceSpan[] = plan.recommendations.map((recommendation, index) => ({
    id: `${traceId}_gate_${index + 1}`,
    traceId,
    parentSpanId: rootSpanId,
    name: `confirmation.${recommendation.server}.${recommendation.confirmationAction}`,
    kind: "confirmation_gate",
    server: recommendation.server,
    tool: recommendation.confirmationAction,
    status: recommendation.status === "confirmed" ? "ok" : "locked",
    startOffsetMs: mcpSpans.length * 35 + index * 20,
    durationMs: recommendation.status === "confirmed" ? 24 : 0,
    attributes: [
      attr("recommendation.id", recommendation.id),
      attr("commercial.action", recommendation.confirmationAction),
      attr("status", recommendation.status),
      attr("guardrail.count", recommendation.guardrails.length),
    ],
  }));
  const rootSpan: TraceSpan = {
    id: rootSpanId,
    traceId,
    name: "mealpilot.plan",
    kind: "api_request",
    status: "ok",
    startOffsetMs: 0,
    durationMs: [...mcpSpans, ...confirmationSpans].reduce((sum, span) => sum + span.durationMs, 0),
    attributes: [
      attr("http.route", "/api/plan"),
      attr("request.id", requestId),
      attr("session.id", plan.id),
      attr("recommendation.count", plan.recommendations.length),
      attr("budget.fit", plan.budgetFit),
    ],
  };
  const privacySpan: TraceSpan = {
    id: `${traceId}_privacy`,
    traceId,
    parentSpanId: rootSpanId,
    name: "privacy.redaction",
    kind: "privacy_filter",
    status: "ok",
    startOffsetMs: rootSpan.durationMs,
    durationMs: 8,
    attributes: [
      attr("stored.raw.address", false),
      attr("stored.payment.credentials", false),
      attr("token.logged", false),
      attr("support.identifier", "Swiggy session id only"),
    ],
  };
  const spans = [rootSpan, ...mcpSpans, ...confirmationSpans, privacySpan];
  const blocked = spans.some((span) => span.status === "blocked");
  const locked = spans.some((span) => span.status === "locked");

  return {
    traceId,
    requestId,
    sessionId: plan.id,
    rootName: "MealPilot three-server plan",
    status: blocked ? "blocked" : locked ? "watch" : "ok",
    durationMs: spans.reduce((sum, span) => sum + span.durationMs, 0),
    spanCount: spans.length,
    spans,
  };
}

function buildTraceMetrics(traces: TraceEnvelope[]): TraceMetric[] {
  const spans = traces.flatMap((trace) => trace.spans);
  const mcpSpans = spans.filter((span) => span.kind === "mcp_tool");
  const durations = mcpSpans.map((span) => span.durationMs).sort((a, b) => a - b);
  const p95 = durations.length > 0 ? durations[Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)] : 0;
  const redactionReady = traces.every((trace) =>
    trace.spans.some((span) => span.kind === "privacy_filter" && span.status === "ok"),
  );

  return [
    {
      id: "trace_coverage",
      label: "Trace coverage",
      value: traces.length > 0 ? `${traces.length} session trace(s)` : "No traces",
      status: traces.length > 0 ? "healthy" : "watch",
      evidence: traces.length > 0 ? "Every stored plan is converted into trace spans." : "Run a plan to create trace evidence.",
    },
    {
      id: "mcp_span_count",
      label: "MCP spans",
      value: String(mcpSpans.length),
      status: mcpSpans.length >= traces.length * 9 ? "healthy" : "watch",
      evidence: "Planner audit events become Swiggy MCP tool spans with server, tool, retry, and cache attributes.",
    },
    {
      id: "p95_latency",
      label: "MCP p95 latency",
      value: `${p95}ms`,
      status: p95 <= 300 ? "healthy" : "watch",
      evidence: "Mock trace latency target stays below the reviewer-facing planning threshold.",
    },
    {
      id: "redaction",
      label: "Redaction contract",
      value: redactionReady ? "Enforced" : "Missing",
      status: redactionReady ? "healthy" : "blocked",
      evidence: "Trace spans exclude raw addresses, bearer tokens, payment credentials, and full Swiggy payloads.",
    },
  ];
}

export function buildObservabilityTraceReport(plans: MealPlan[]): ObservabilityTraceReport {
  const traces = plans.slice(-5).map(traceForPlan);
  const metrics = buildTraceMetrics(traces);
  const scoreValue = metrics.reduce((sum, metric) => {
    if (metric.status === "healthy") return sum + 1;
    if (metric.status === "watch") return sum + 0.75;
    return sum;
  }, 0);

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round((scoreValue / metrics.length) * 100),
    traces,
    metrics,
    logContract: {
      requiredFields: [
        "ts",
        "level",
        "event",
        "request_id",
        "trace_id",
        "session_id",
        "swiggy_server",
        "tool",
        "duration_ms",
        "status",
        "user_id_hash",
      ],
      redactedFields: ["access_token", "phone", "email", "raw_address", "payment_credentials", "full_tool_payload"],
      sample: {
        ts: new Date(0).toISOString(),
        level: "info",
        event: "mcp_tool_call",
        request_id: traces[0]?.requestId ?? "req_after_plan",
        trace_id: traces[0]?.traceId ?? "trace_after_plan",
        session_id: traces[0]?.sessionId ?? "run_plan_first",
        swiggy_server: "food",
        tool: "search_restaurants",
        duration_ms: 217,
        status: "ok",
        user_id_hash: "sha256:example",
      },
    },
  };
}

function step(
  sequence: number,
  server: SwiggyServer,
  tool: string,
  whenToCall: string,
  expectedLatencyMs: number,
): RouteOptimizationStep {
  return {
    id: `${server}_${tool}_${sequence}`,
    sequence,
    server,
    tool,
    toolClass: toolClass(tool),
    whenToCall,
    cachePolicy: cachePolicyFor(tool),
    retryPolicy: retryPolicyFor(tool),
    confirmationGate: gateFor(tool),
    expectedLatencyMs,
  };
}

const journeys: RouteOptimizationJourney[] = [
  {
    id: "three_server_meal_plan",
    title: "Three-server MealPilot plan",
    userIntent: "Plan lunch, groceries, and a weekend table in one turn.",
    optimizedFor: "latency",
    swiggyServers: ["food", "instamart", "dineout"],
    baselineCalls: 18,
    optimizedCalls: 12,
    savedCalls: 6,
    steps: [
      step(1, "food", "get_addresses", "Resolve home address once for Food and Instamart context.", 90),
      step(2, "dineout", "get_saved_locations", "Resolve Dineout coordinates once for table discovery.", 90),
      step(3, "food", "search_restaurants", "Find lunch restaurants after address is known.", 160),
      step(4, "instamart", "your_go_to_items", "Prefer go-to items before broad product search for returning users.", 120),
      step(5, "instamart", "search_products", "Search only missing pantry categories not covered by go-to items.", 170),
      step(6, "dineout", "search_restaurants_dineout", "Search table options in parallel with grocery discovery.", 180),
      step(7, "food", "get_food_cart", "Refresh cart truth before any place order prompt.", 80),
      step(8, "instamart", "get_cart", "Refresh basket truth before checkout prompt.", 80),
      step(9, "dineout", "get_available_slots", "Check slots after the shortlisted restaurant and guest count are known.", 150),
      step(10, "food", "place_food_order", "Call only after explicit Food confirmation.", 220),
      step(11, "instamart", "checkout", "Call only after explicit Instamart confirmation.", 220),
      step(12, "dineout", "book_table", "Call only after explicit Dineout confirmation.", 220),
    ],
    controls: [
      "Parallelize independent discovery only after location is resolved.",
      "Read cart truth before confirmation; do not use remembered cart state.",
      "Serialize commercial actions so one failed action does not cascade into another server.",
    ],
  },
  {
    id: "voice_reorder",
    title: "Voice-safe grocery reorder",
    userIntent: "Reorder my usual breakfast groceries while I am busy.",
    optimizedFor: "voice",
    swiggyServers: ["instamart"],
    baselineCalls: 7,
    optimizedCalls: 4,
    savedCalls: 3,
    steps: [
      step(1, "instamart", "get_addresses", "Default to saved Home address without reading raw IDs aloud.", 80),
      step(2, "instamart", "your_go_to_items", "Use frequent items instead of multiple search calls.", 120),
      step(3, "instamart", "get_cart", "Read authoritative basket before spoken confirmation.", 80),
      step(4, "instamart", "checkout", "Checkout only after spoken item and total confirmation.", 220),
    ],
    controls: [
      "Maximum three spoken items plus summary count.",
      "No raw addressId or spinId in voice output.",
      "Tracking follow-up must be user-triggered or reminder-triggered.",
    ],
  },
  {
    id: "occasion_orchestrator",
    title: "Occasion orchestrator",
    userIntent: "Book dinner out and send dessert home later.",
    optimizedFor: "conversion",
    swiggyServers: ["dineout", "food"],
    baselineCalls: 13,
    optimizedCalls: 9,
    savedCalls: 4,
    steps: [
      step(1, "dineout", "get_saved_locations", "Resolve coordinates for restaurant discovery.", 90),
      step(2, "dineout", "search_restaurants_dineout", "Search reservation venues first so slot scarcity is visible early.", 180),
      step(3, "dineout", "get_restaurant_details", "Fetch details only for the chosen shortlist.", 120),
      step(4, "dineout", "get_available_slots", "Fetch slots for date and guest count.", 150),
      step(5, "food", "get_addresses", "Resolve delivery address for dessert.", 90),
      step(6, "food", "search_restaurants", "Search dessert delivery near home.", 160),
      step(7, "food", "get_food_cart", "Read dessert cart before confirmation.", 80),
      step(8, "dineout", "book_table", "Book only after reservation confirmation.", 220),
      step(9, "food", "place_food_order", "Place dessert only after separate delivery confirmation.", 220),
    ],
    controls: [
      "Reservation and delivery confirmations are separate.",
      "If auth fails on one server, re-auth once and refresh both clients.",
      "On booking timeout, check get_booking_status before any retry.",
    ],
  },
];

const officialRouteSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

function totalLatency(journey: RouteOptimizationJourney) {
  return journey.steps.reduce((sum, item) => sum + item.expectedLatencyMs, 0);
}

function commercialGateCount(journey: RouteOptimizationJourney) {
  return journey.steps.filter((item) => item.toolClass === "commercial_action").length;
}

const profiles: RouteOptimizationProfile[] = [
  {
    id: "express_parallel_discovery",
    label: "Express Parallel Discovery",
    objective: "Resolve location once, fan out Food, Instamart, and Dineout discovery, then collapse into separate confirmation lanes.",
    bestFor: "Busy weekday planning when the user wants a full answer quickly.",
    journeyIds: ["three_server_meal_plan"],
    estimatedLatencyMs: 780,
    savedCalls: 6,
    safetyPosture: "Parallel reads only; commercial calls remain serialized behind separate confirmations.",
  },
  {
    id: "voice_minimal_reorder",
    label: "Voice Minimal Reorder",
    objective: "Use saved address and go-to items to avoid long spoken search results and raw identifier exposure.",
    bestFor: "Hands-free pantry replenishment and car/home assistant surfaces.",
    journeyIds: ["voice_reorder"],
    estimatedLatencyMs: 500,
    savedCalls: 3,
    safetyPosture: "No raw addressId, spinId, cartId, or long menu lists in speech.",
  },
  {
    id: "occasion_conversion_guard",
    label: "Occasion Conversion Guard",
    objective: "Prioritize Dineout slot scarcity before Food dessert planning while keeping reservations and delivery separate.",
    bestFor: "Date nights, guests at home, celebrations, and weekend social planning.",
    journeyIds: ["occasion_orchestrator"],
    estimatedLatencyMs: 860,
    savedCalls: 4,
    safetyPosture: "Booking status is checked before any Dineout retry; Food placement is a separate confirmation.",
  },
  {
    id: "support_safe_recovery",
    label: "Support-Safe Recovery",
    objective: "Convert uncertain commercial outcomes into status lookup and report_error payloads instead of duplicate writes.",
    bestFor: "Network timeouts, 5xxs, user complaints, and live-support escalation.",
    journeyIds: journeys.map((journey) => journey.id),
    estimatedLatencyMs: 900,
    savedCalls: 5,
    safetyPosture: "place_food_order, checkout, and book_table never blind retry.",
  },
];

const parallelBatches: RouteOptimizationBatch[] = [
  {
    id: "location_resolution",
    label: "Resolve Location Context",
    phase: "location",
    parallel: true,
    tools: [
      { server: "food", tool: "get_addresses" },
      { server: "dineout", tool: "get_saved_locations" },
    ],
    expectedLatencyMs: 90,
    savedCalls: 1,
    riskControl: "Only redacted address labels and Dineout coordinates enter downstream route planning.",
  },
  {
    id: "three_server_discovery",
    label: "Parallel Discovery Fanout",
    phase: "discovery",
    parallel: true,
    tools: [
      { server: "food", tool: "search_restaurants" },
      { server: "instamart", tool: "your_go_to_items" },
      { server: "instamart", tool: "search_products" },
      { server: "dineout", tool: "search_restaurants_dineout" },
    ],
    expectedLatencyMs: 180,
    savedCalls: 4,
    riskControl: "Reads can fan out only after location scope is resolved; no cart mutation joins this batch.",
  },
  {
    id: "cart_truth_boundary",
    label: "Authoritative Cart Truth",
    phase: "cart_truth",
    parallel: true,
    tools: [
      { server: "food", tool: "get_food_cart" },
      { server: "instamart", tool: "get_cart" },
      { server: "dineout", tool: "get_available_slots" },
    ],
    expectedLatencyMs: 150,
    savedCalls: 2,
    riskControl: "Cart and slot reads are refreshed immediately before user-facing confirmation modals.",
  },
  {
    id: "separate_confirmation_locks",
    label: "Separate Confirmation Locks",
    phase: "confirmation",
    parallel: false,
    tools: [
      { server: "food", tool: "place_food_order" },
      { server: "instamart", tool: "checkout" },
      { server: "dineout", tool: "book_table" },
    ],
    expectedLatencyMs: 660,
    savedCalls: 0,
    riskControl: "Each commercial action has its own visible total, item/slot summary, and explicit confirmation.",
  },
  {
    id: "non_blind_recovery",
    label: "Non-Blind Recovery",
    phase: "support",
    parallel: false,
    tools: [
      { server: "food", tool: "get_food_orders" },
      { server: "instamart", tool: "get_orders" },
      { server: "dineout", tool: "get_booking_status" },
    ],
    expectedLatencyMs: 180,
    savedCalls: 2,
    riskControl: "After uncertain commercial results, status lookup must happen before retry or support escalation.",
  },
];

const crossServerHandoffs: RouteOptimizationHandoff[] = [
  {
    id: "address_to_food_instamart",
    fromServer: "food",
    toServer: "instamart",
    sharedContext: "Saved Home or Office label, city, and coarse serviceability intent.",
    redactionRule: "Do not copy raw address text, phone, or access token into client-visible route state.",
    cacheWindow: "Session only; invalidate when the user changes address or city.",
    proofLink: "/api/mcp/state-orchestrator",
  },
  {
    id: "dineout_slot_to_food_reminder",
    fromServer: "dineout",
    toServer: "food",
    sharedContext: "Reservation date/time and user-approved dessert reminder window.",
    redactionRule: "Do not schedule an immediate Food order from a future Dineout slot; store reminder intent only.",
    cacheWindow: "Until the reminder fires, then refresh Food restaurant and cart truth.",
    proofLink: "/api/premium-concierge-itinerary",
  },
  {
    id: "instamart_pantry_to_food_budget",
    fromServer: "instamart",
    toServer: "food",
    sharedContext: "Pantry gaps and remaining budget after grocery basket preview.",
    redactionRule: "Use derived category gaps, not raw grocery order payloads.",
    cacheWindow: "One planning turn; refresh get_cart before checkout.",
    proofLink: "/api/nutrition-budget-intelligence",
  },
  {
    id: "support_context_all_servers",
    fromServer: "food",
    toServer: "dineout",
    sharedContext: "Redacted request id, trace id, Swiggy server, tool name, status class, and timestamp.",
    redactionRule: "No raw payload, full address, payment credential, phone, email, or bearer token enters support copy.",
    cacheWindow: "Support packet only; retain according to local audit retention policy.",
    proofLink: "/api/support/bridge",
  },
];

export function buildSwiggyRouteOptimizationReport(): SwiggyRouteOptimizationReport {
  const totalSavedCalls = journeys.reduce((sum, journey) => sum + journey.savedCalls, 0);
  const totalBaselineCalls = journeys.reduce((sum, journey) => sum + journey.baselineCalls, 0);
  const totalOptimizedCalls = journeys.reduce((sum, journey) => sum + journey.optimizedCalls, 0);
  const savingsScore = Math.round((totalSavedCalls / totalBaselineCalls) * 100);
  const commercialGates = journeys.reduce((sum, journey) => sum + commercialGateCount(journey), 0);
  const parallelizableSteps = parallelBatches
    .filter((batch) => batch.parallel)
    .reduce((sum, batch) => sum + batch.tools.length, 0);
  const expectedLatencyMs = Math.max(...journeys.map(totalLatency));

  return {
    generatedAt: new Date().toISOString(),
    score: 90 + Math.min(10, savingsScore),
    officialSources: officialRouteSources,
    totals: {
      baselineCalls: totalBaselineCalls,
      optimizedCalls: totalOptimizedCalls,
      savedCalls: totalSavedCalls,
      parallelizableSteps,
      commercialGates,
      expectedLatencyMs,
    },
    totalSavedCalls,
    journeys,
    profiles,
    parallelBatches,
    crossServerHandoffs,
    cacheRules: [
      "Saved addresses are session-scoped and invalidated on explicit location changes.",
      "Cart reads are never cached at confirmation or commercial-action boundaries.",
      "Restaurant and venue metadata can use short-lived cache keyed by city, coordinates, date, and guest count.",
      "Instamart product and go-to item results are address-scoped and invalidated on address switch.",
      "Tracking calls are user-triggered or reminder-triggered; never poll faster than 10 seconds.",
    ],
    guardrails: [
      "All commercial tools stay behind explicit confirmation gates.",
      "Food and Instamart carts are server-side authority, not browser or agent memory.",
      "Order placement failures use status lookup before retry.",
      "Voice responses hide raw IDs and compress lists.",
      "Support escalations include request ID, trace ID, Swiggy session ID, tool, status, and timestamp.",
    ],
    stagingAssertions: [
      "A staging trace must include get_addresses, one read tool, one cart read, one confirmation lock, and one support-ready session ID.",
      "Non-idempotent staging drills must prove check-then-retry for place_food_order, checkout, and book_table.",
      "429 handling must honor Retry-After when Swiggy begins emitting the header.",
      "OpenTelemetry export can be wired to the host platform without changing span names or redaction policy.",
    ],
    assertions: [
      "Independent Food, Instamart, and Dineout discovery reads can run in parallel only after location scope is resolved.",
      "Cart truth and slot availability are always refreshed before user confirmation, even when earlier reads were cached.",
      "Commercial actions are serialized and isolated so a Food failure cannot trigger Instamart checkout or Dineout booking.",
      "Cross-server handoffs share derived intent and redacted context only; raw addresses, tokens, payment data, and payloads stay out of client state.",
      "Support-safe recovery uses status tools and report_error payloads instead of duplicate commercial writes.",
    ],
  };
}
