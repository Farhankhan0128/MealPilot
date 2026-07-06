import type {
  McpBackpressureBucket,
  McpBackpressureGovernorReport,
  McpBackpressureRule,
  McpBackpressureSimulation,
  McpBackpressureTelemetryField,
  MealPlan,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
];

function bucket(input: McpBackpressureBucket): McpBackpressureBucket {
  return input;
}

function buildBuckets(): McpBackpressureBucket[] {
  return [
    bucket({
      id: "food_read_user_bucket",
      server: "food",
      toolClass: "read",
      plannedLimitPerMinute: 120,
      burstWindowSeconds: 10,
      burstMultiplier: 2,
      queueDiscipline: "Token bucket per authenticated user; coalesce get_addresses and menu metadata reads per session.",
      retryAfterBehavior: "Honor Retry-After when 429 ships; today back off on UPSTREAM_ERROR with jitter.",
      shedAction: "Degrade to cached restaurant/menu summaries and ask user to retry rather than firing another search.",
      status: "ready",
      evidenceLinks: [officialSources[0], "/api/swiggy-route-optimizer", "/api/mcp/tool-contract-matrix"],
    }),
    bucket({
      id: "instamart_read_user_bucket",
      server: "instamart",
      toolClass: "read",
      plannedLimitPerMinute: 120,
      burstWindowSeconds: 10,
      burstMultiplier: 2,
      queueDiscipline: "Address-scoped cache for search_products, product details, and your_go_to_items within a planning turn.",
      retryAfterBehavior: "Retry safe reads with exponential backoff, max five attempts, and 30 second user-visible budget.",
      shedAction: "Prefer your_go_to_items or pantry suggestions over repeated catalogue search.",
      status: "ready",
      evidenceLinks: [officialSources[0], "/api/pantry", "/api/nutrition-budget-intelligence"],
    }),
    bucket({
      id: "dineout_read_user_bucket",
      server: "dineout",
      toolClass: "read",
      plannedLimitPerMinute: 120,
      burstWindowSeconds: 10,
      burstMultiplier: 2,
      queueDiscipline: "Batch search, details, and slot reads by saved location, date, and guest count.",
      retryAfterBehavior: "Availability reads can retry with jitter; stale slots trigger a fresh visible choice.",
      shedAction: "Show the last safe restaurant shortlist and pause slot refreshes until the backoff window clears.",
      status: "ready",
      evidenceLinks: [officialSources[0], "/api/premium-concierge-itinerary", "/api/mcp/scenario-runner"],
    }),
    bucket({
      id: "write_tool_bucket",
      server: "all",
      toolClass: "write",
      plannedLimitPerMinute: 30,
      burstWindowSeconds: 10,
      burstMultiplier: 2,
      queueDiscipline: "Serialize update_food_cart, update_cart, apply/remove coupon, clear_cart, and flush_food_cart by session.",
      retryAfterBehavior: "Do not layer exponential backoff on top of Retry-After; respect the server delay directly.",
      shedAction: "Queue one pending write per recommendation and collapse superseded quantity changes.",
      status: "ready",
      evidenceLinks: [officialSources[0], "/api/mcp/state-orchestrator", "/api/sessions/:sessionId/preflight"],
    }),
    bucket({
      id: "commercial_action_bucket",
      server: "all",
      toolClass: "commercial",
      plannedLimitPerMinute: 30,
      burstWindowSeconds: 10,
      burstMultiplier: 1,
      queueDiscipline: "Single-flight lock for place_food_order, checkout, and book_table after explicit confirmation.",
      retryAfterBehavior: "Check order or booking status before retrying; never blind replay commercial actions.",
      shedAction: "Hold confirmation lock, show recovery copy, and route ambiguous failures to Support Bridge.",
      status: "ready",
      evidenceLinks: [officialSources[1], "/api/mcp/commercial-action-guard", "/api/support/bridge"],
    }),
    bucket({
      id: "tracking_bucket",
      server: "all",
      toolClass: "tracking",
      plannedLimitPerMinute: 6,
      burstWindowSeconds: 10,
      burstMultiplier: 1,
      queueDiscipline: "Minimum 10 second interval for track_food_order, track_order, and get_booking_status refreshes.",
      retryAfterBehavior: "Tracking reads can retry safely but never tighten below the visible refresh interval.",
      shedAction: "Suppress background polling and show last known ETA until manual refresh is allowed.",
      status: "ready",
      evidenceLinks: [officialSources[0], "/api/tracking/:sessionId", "/api/traffic-readiness-plan"],
    }),
    bucket({
      id: "auth_bucket",
      server: "all",
      toolClass: "auth",
      plannedLimitPerMinute: "not_enforced_v1",
      burstWindowSeconds: 60,
      burstMultiplier: 1,
      queueDiscipline: "One OAuth recovery flow per user session; reject stale-token retries with the same bearer.",
      retryAfterBehavior: "401 and JSON-RPC -32001 restart PKCE instead of retrying the failed MCP call.",
      shedAction: "Fail closed and return the user to Swiggy authorization.",
      status: "ready",
      evidenceLinks: [officialSources[1], "/api/auth/swiggy/status", "/api/credential-onboarding"],
    }),
    bucket({
      id: "background_jobs_bucket",
      server: "all",
      toolClass: "background",
      plannedLimitPerMinute: "not_enforced_v1",
      burstWindowSeconds: 60,
      burstMultiplier: 1,
      queueDiscipline: "No hidden analytics or catalogue export jobs run on interactive developer-tier budget.",
      retryAfterBehavior: "Background traffic is disabled locally until Swiggy approves a bespoke ceiling.",
      shedAction: "Drop non-user-initiated work and preserve a partner-capacity ask.",
      status: "external_gate",
      evidenceLinks: [officialSources[0], "/api/swiggy-growth-partnership", "/api/production-launch-bundle"],
    }),
  ];
}

function buildRules(): McpBackpressureRule[] {
  return [
    {
      id: "v1_upstream_shedder",
      label: "v1 upstream shedder mode",
      status: "ready",
      swiggySignal: "MCP-layer 429 and X-RateLimit headers are not enforced in v1.0.",
      mealPilotControl: "Classify upstream shedding as retryable UPSTREAM_ERROR with jitter and bounded retry budget.",
      proof: "Error Intelligence and Resilience Lab keep RATE_LIMITED future support separate from current upstream errors.",
      evidenceLinks: [officialSources[0], "/api/error-intelligence", "/api/resilience"],
    },
    {
      id: "planned_headers_parser",
      label: "Planned rate-limit headers",
      status: "ready",
      swiggySignal: "Future successful responses will carry X-RateLimit-Limit, Remaining, and Reset headers.",
      mealPilotControl: "Telemetry contract reserves those header names and maps remaining budget into throttling decisions.",
      proof: "Backpressure telemetry exposes x_ratelimit_limit, x_ratelimit_remaining, and x_ratelimit_reset fields.",
      evidenceLinks: [officialSources[0], "/api/telemetry/runtime"],
    },
    {
      id: "retry_after_direct",
      label: "Retry-After direct wait",
      status: "ready",
      swiggySignal: "429 responses will include Retry-After.",
      mealPilotControl: "Do not stack exponential backoff on top of Retry-After; wait the server-provided duration.",
      proof: "All buckets declare Retry-After handling and simulations include a 23 second planned 429 response.",
      evidenceLinks: [officialSources[0], "/api/traffic-readiness-plan"],
    },
    {
      id: "tracking_cadence",
      label: "Tracking cadence",
      status: "ready",
      swiggySignal: "track_* calls should not poll faster than 10 seconds.",
      mealPilotControl: "Tracking bucket enforces a 10 second floor and drops hidden background refreshes.",
      proof: "Tracking simulation defers repeated refreshes and preserves last known ETA.",
      evidenceLinks: [officialSources[0], "/api/tracking/:sessionId"],
    },
    {
      id: "voice_burst_shape",
      label: "Voice burst shaping",
      status: "ready",
      swiggySignal: "Voice and ambient surfaces have lower QPS but burstier 4-6 call planning turns.",
      mealPilotControl: "Voice flows prefer your_go_to_items, cap presented options, and avoid repeated discovery reads.",
      proof: "Voice simulation compresses a six-call turn into cached reads and one reorder path.",
      evidenceLinks: [officialSources[0], "/api/channel-multimodal-studio", "/api/mcp/state-orchestrator"],
    },
    {
      id: "background_traffic_partition",
      label: "Background traffic partition",
      status: "external_gate",
      swiggySignal: "Nightly analytics or batch jobs need onboarding discussion and bespoke ceilings.",
      mealPilotControl: "MealPilot disables background Swiggy MCP jobs until Swiggy approves a separate capacity profile.",
      proof: "Growth Partnership and Launch Bundle keep partner dashboard and higher rate limits external-gated.",
      evidenceLinks: [officialSources[0], "/api/swiggy-growth-partnership", "/api/traffic-readiness-plan"],
    },
  ];
}

function buildSimulations(latestPlan?: MealPlan): McpBackpressureSimulation[] {
  const latestCalls = latestPlan?.callCount ?? 12;

  return [
    {
      id: "chat_planning_burst",
      label: "Chat planning burst",
      surface: "chat",
      scenario: `A visible chat planning turn attempts ${latestCalls} Food, Instamart, and Dineout calls.`,
      detectedSignal: "Below 120/min read ceiling but close enough to coalesce repeated saved-address and cart reads.",
      governorDecision: "Allow reads, collapse duplicate address/location calls, and keep writes serialized behind confirmation.",
      delayMs: 0,
      allowedCalls: Math.min(latestCalls, 10),
      deferredCalls: Math.max(0, latestCalls - 10),
      droppedCalls: 0,
      toolSequence: ["get_addresses", "search_restaurants", "search_products", "get_saved_locations", "get_available_slots"],
      status: "ready",
      evidenceLinks: ["/api/mcp/scenario-runner", "/api/swiggy-route-optimizer"],
    },
    {
      id: "planned_429_retry_after",
      label: "Future 429 with Retry-After",
      surface: "chat",
      scenario: "Swiggy v1.x returns HTTP 429 with Retry-After: 23 on a read-heavy menu search.",
      detectedSignal: "Retry-After header present; RATE_LIMITED symbolic code may arrive once registry ships.",
      governorDecision: "Wait exactly 23 seconds, do not add exponential backoff, then retry once if still within 30 second budget.",
      delayMs: 23000,
      allowedCalls: 1,
      deferredCalls: 1,
      droppedCalls: 0,
      toolSequence: ["search_menu", "get_restaurant_menu"],
      status: "ready",
      evidenceLinks: [officialSources[0], "/api/error-intelligence", "/api/resilience"],
    },
    {
      id: "voice_reorder_burst",
      label: "Voice reorder burst",
      surface: "voice",
      scenario: "A voice user says reorder my usual snacks during the evening meal peak.",
      detectedSignal: "Voice surface, 4-6 calls expected in three seconds, peak-hour amplification risk.",
      governorDecision: "Prefer your_go_to_items, skip broad product search, and keep spoken list to three options.",
      delayMs: 0,
      allowedCalls: 3,
      deferredCalls: 2,
      droppedCalls: 1,
      toolSequence: ["get_addresses", "your_go_to_items", "get_cart"],
      status: "ready",
      evidenceLinks: [officialSources[0], "/api/channel-multimodal-studio"],
    },
    {
      id: "tracking_poll_loop",
      label: "Tracking poll loop",
      surface: "chat",
      scenario: "A UI refresh loop tries to call track_food_order every two seconds.",
      detectedSignal: "Tracking cadence below Swiggy 10 second guidance.",
      governorDecision: "Allow the first tracking read, defer the next four refreshes, and show the last known ETA.",
      delayMs: 10000,
      allowedCalls: 1,
      deferredCalls: 4,
      droppedCalls: 0,
      toolSequence: ["track_food_order"],
      status: "ready",
      evidenceLinks: [officialSources[0], "/api/tracking/:sessionId"],
    },
    {
      id: "background_batch_block",
      label: "Background batch block",
      surface: "background",
      scenario: "A nightly analytics job wants to crawl menus and product catalogues.",
      detectedSignal: "Non-user-initiated batch traffic on an interactive developer-tier budget.",
      governorDecision: "Drop the job locally and preserve a builders@swiggy.in capacity ask for bespoke ceilings.",
      delayMs: 0,
      allowedCalls: 0,
      deferredCalls: 0,
      droppedCalls: 50,
      toolSequence: ["search_restaurants", "get_restaurant_menu", "search_products"],
      status: "external_gate",
      evidenceLinks: [officialSources[0], "/api/swiggy-growth-partnership"],
    },
  ];
}

function buildTelemetry(): McpBackpressureTelemetryField[] {
  return [
    { field: "x_ratelimit_limit", source: "future response header", redaction: "numeric limit only", status: "ready" },
    { field: "x_ratelimit_remaining", source: "future response header", redaction: "numeric remaining budget only", status: "ready" },
    { field: "x_ratelimit_reset", source: "future response header", redaction: "epoch seconds only", status: "ready" },
    { field: "retry_after_seconds", source: "future 429 header", redaction: "numeric delay only", status: "ready" },
    { field: "bucket_id", source: "MealPilot governor", redaction: "local bucket label", status: "ready" },
    { field: "shed_reason", source: "MealPilot governor", redaction: "enum; no payload body", status: "ready" },
    { field: "surface", source: "client metadata", redaction: "chat, voice, background, or support", status: "ready" },
    { field: "user_id_hash", source: "MealPilot runtime", redaction: "sha256 hash", status: "ready" },
  ];
}

function statusScore(status: "ready" | "watch" | "external_gate") {
  if (status === "ready") return 1;
  if (status === "watch") return 0.82;
  return 0.58;
}

function calculateScore(options: {
  buckets: McpBackpressureBucket[];
  rules: McpBackpressureRule[];
  simulations: McpBackpressureSimulation[];
  telemetry: McpBackpressureTelemetryField[];
}) {
  const allStatuses = [
    ...options.buckets.map((item) => item.status),
    ...options.rules.map((item) => item.status),
    ...options.simulations.map((item) => item.status),
    ...options.telemetry.map((item) => item.status),
  ];

  return Math.round((allStatuses.reduce((sum, status) => sum + statusScore(status), 0) / allStatuses.length) * 100);
}

export function buildMcpBackpressureGovernor(latestPlan?: MealPlan): McpBackpressureGovernorReport {
  const buckets = buildBuckets();
  const rules = buildRules();
  const simulations = buildSimulations(latestPlan);
  const telemetry = buildTelemetry();

  return {
    generatedAt: new Date().toISOString(),
    score: calculateScore({ buckets, rules, simulations, telemetry }),
    officialSources,
    mode: "v1_upstream_shedder",
    totalBuckets: buckets.length,
    readyBuckets: buckets.filter((item) => item.status === "ready").length,
    trackingMinIntervalSeconds: 10,
    maxRetries: 5,
    maxUserWaitMs: 30000,
    plannedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"],
    buckets,
    rules,
    simulations,
    telemetry,
    capacityEmail: {
      to: "builders@swiggy.in",
      subject: "MealPilot MCP backpressure profile and future rate-limit readiness",
      body: [
        "Hi Swiggy Builders team,",
        "",
        "MealPilot's MCP backpressure governor is wired for today's v1.0 upstream-shedder behavior and the planned v1.x MCP rate-limit contract.",
        "",
        "Current posture:",
        "- 120/min per authenticated user per server read budget modeled.",
        "- 30/min write-tool budget modeled.",
        "- Tracking refreshes held to 10 seconds or slower.",
        "- Future Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset fields are reserved in telemetry.",
        "- Background jobs are disabled until Swiggy approves a bespoke ceiling.",
        "",
        "Please confirm whether the private pilot can stay on developer-tier ceilings or should use a bespoke partner profile.",
      ].join("\n"),
    },
    assertions: [
      "MealPilot treats current v1.0 upstream shedding as retryable upstream failure, not as a shipped MCP 429 contract.",
      "Future Retry-After responses are honored directly without stacking extra exponential backoff.",
      "Tracking reads cannot poll faster than ten seconds.",
      "Commercial writes are single-flight and routed through Commercial Action Guard before retry.",
      "Background batch jobs are disabled until Swiggy approves a separate capacity profile.",
    ],
    externalGates: [
      "MCP-layer 429, X-RateLimit-* headers, and RATE_LIMITED symbolic codes are planned for a future v1.x release.",
      "Enterprise or background-job ceilings require Swiggy onboarding approval.",
      "Real production traffic validation requires staging credentials, production approval, and 48 hours of green soak.",
    ],
  };
}
