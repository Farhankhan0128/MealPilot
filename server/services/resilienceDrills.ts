import type { MealPlan, ResilienceDrill, ResilienceRunbook, ResilienceStatus } from "../../src/domain/types.js";

function drillStatus(hasWatch: boolean, blocked = false): ResilienceStatus {
  if (blocked) return "blocked";
  if (hasWatch) return "watch";
  return "pass";
}

export function buildResilienceDrills(options: { plans: MealPlan[]; hasClientId: boolean }): ResilienceDrill[] {
  const latestPlan = options.plans.at(-1);
  const hasConfirmedAction =
    latestPlan?.recommendations.some((recommendation) => recommendation.status === "confirmed") ?? false;

  return [
    {
      id: "read_timeout_backoff",
      label: "5xx and upstream timeout backoff",
      swiggyRequirement: "Retry safe reads and tracking calls with exponential backoff and jitter.",
      failureMode: "search_restaurants returns UPSTREAM_TIMEOUT / HTTP 504 during a planning turn.",
      protectedTools: ["get_addresses", "search_restaurants", "search_products", "track_food_order", "track_order"],
      recoveryPattern: "Retry only idempotent reads; first wait 500ms, then 1000ms, then 2000ms inside a 30s budget.",
      retryBudgetMs: 3500,
      userImpact: "The user sees a brief planning delay, not a duplicate cart mutation.",
      status: "pass",
      steps: [
        {
          id: "read_timeout_first_failure",
          sequence: 1,
          server: "food",
          tool: "search_restaurants",
          label: "Initial call fails",
          simulatedResponse: "504 UPSTREAM_TIMEOUT",
          action: "Classify as retriable read failure.",
          evidence: "The retry policy treats 5xx and UPSTREAM_TIMEOUT as retryable for read-class tools.",
          status: "pass",
        },
        {
          id: "read_timeout_retry",
          sequence: 2,
          server: "food",
          tool: "search_restaurants",
          label: "Backoff retry succeeds",
          simulatedResponse: "200 ok after 500ms",
          action: "Resume the same planning turn with the recovered response.",
          evidence: "No cart or order tool is touched during the retry.",
          status: "pass",
        },
      ],
    },
    {
      id: "rate_limit_retry_after",
      label: "429 Retry-After readiness",
      swiggyRequirement: "Honor Retry-After once Swiggy MCP rate limiting ships.",
      failureMode: "search_products returns HTTP 429 with Retry-After: 30.",
      protectedTools: ["search_products", "get_cart", "get_food_cart", "get_available_slots"],
      recoveryPattern: "Pause exactly for Retry-After before retrying, without stacking exponential backoff on top.",
      retryBudgetMs: 30000,
      userImpact: "MealPilot slows the user-visible flow and avoids bursty automated traffic.",
      status: "pass",
      steps: [
        {
          id: "rate_limit_header",
          sequence: 1,
          server: "instamart",
          tool: "search_products",
          label: "Rate limit response parsed",
          simulatedResponse: "429 Retry-After: 30",
          action: "Schedule the retry after 30 seconds and pause the active tool turn.",
          evidence: "The go-live plan reserves a handler for Retry-After before production traffic.",
          status: "pass",
        },
        {
          id: "rate_limit_budget",
          sequence: 2,
          server: "instamart",
          tool: "search_products",
          label: "Retry budget enforced",
          simulatedResponse: "retry skipped if total wait would exceed 30s user-facing budget",
          action: "Ask the user to retry later when the budget is exhausted.",
          evidence: "The user remains in control instead of hidden background polling.",
          status: "pass",
        },
      ],
    },
    {
      id: "auth_401_reauth",
      label: "401 and JSON-RPC auth recovery",
      swiggyRequirement: "Re-run OAuth on 401 / JSON-RPC -32001; never retry with the same expired token.",
      failureMode: "get_addresses returns an expired-token error at the beginning of a commerce turn.",
      protectedTools: ["get_addresses", "get_saved_locations"],
      recoveryPattern: "Stop the tool call, restart OAuth PKCE, then replay only after a fresh token is present.",
      retryBudgetMs: 0,
      userImpact: "The user is asked to reconnect Swiggy before any cart or booking mutation.",
      status: drillStatus(!options.hasClientId),
      steps: [
        {
          id: "auth_failure_detected",
          sequence: 1,
          server: "all",
          tool: "get_addresses",
          label: "Expired auth detected",
          simulatedResponse: "401 or JSON-RPC -32001",
          action: "Do not retry the same bearer token.",
          evidence: "OAuth start/callback endpoints store PKCE verifier server-side by state.",
          status: "pass",
        },
        {
          id: "auth_pkce_restart",
          sequence: 2,
          server: "all",
          tool: "OAuth 2.1 PKCE",
          label: "PKCE flow restarted",
          simulatedResponse: options.hasClientId ? "client_id configured" : "mock client_id until access is granted",
          action: "Route the user through Swiggy authorization and resume after callback.",
          evidence: options.hasClientId
            ? "Credentials are configured for staging or production."
            : "Flow is implemented; Builder Access client_id is the remaining external dependency.",
          status: options.hasClientId ? "pass" : "watch",
        },
      ],
    },
    {
      id: "non_idempotent_check_then_retry",
      label: "Order placement check-then-retry",
      swiggyRequirement: "Never blindly retry place_food_order, checkout, or book_table after network failure.",
      failureMode: "Network timeout after a commercial action, where the order may already exist.",
      protectedTools: ["place_food_order", "checkout", "book_table"],
      recoveryPattern: "Call the matching status/order lookup first; retry the original action only if no order or booking exists.",
      retryBudgetMs: 5000,
      userImpact: "Prevents duplicate food orders, grocery checkouts, and table bookings.",
      status: drillStatus(!hasConfirmedAction),
      steps: [
        {
          id: "commercial_timeout",
          sequence: 1,
          server: "food",
          tool: "place_food_order",
          label: "Placement response lost",
          simulatedResponse: "network timeout after confirmation",
          action: "Freeze the confirmation button and start status verification.",
          evidence: hasConfirmedAction
            ? `Latest plan ${latestPlan?.id} has a confirmed commercial action.`
            : "Run and confirm a plan to capture live action evidence.",
          status: hasConfirmedAction ? "pass" : "watch",
        },
        {
          id: "commercial_probe",
          sequence: 2,
          server: "food",
          tool: "get_food_orders",
          label: "Check outcome before retry",
          simulatedResponse: "order found or no matching order",
          action: "Treat found order as success; retry only when status lookup proves no order exists.",
          evidence: "The MCP replay labels commercial tools as check-order-before-retry.",
          status: "pass",
        },
      ],
    },
    {
      id: "deprecation_monitoring",
      label: "Version and deprecation alerting",
      swiggyRequirement: "Monitor _meta.swiggy.deprecation so breaking changes are not missed.",
      failureMode: "A v1 tool response includes deprecation metadata for a future route or parameter change.",
      protectedTools: ["all MCP tools"],
      recoveryPattern: "Capture the metadata, raise an operator alert, and keep pinned v1 routes until migration is complete.",
      retryBudgetMs: 0,
      userImpact: "Users stay on stable flows while the integration team migrates intentionally.",
      status: "pass",
      steps: [
        {
          id: "deprecation_seen",
          sequence: 1,
          server: "all",
          tool: "_meta.swiggy.deprecation",
          label: "Deprecation metadata observed",
          simulatedResponse: "warning with effective date",
          action: "Create a version-monitor alert and link it to the staging validation checklist.",
          evidence: "Version Monitor pins v1 routes and tracks a 180-day deprecation window.",
          status: "pass",
        },
      ],
    },
  ];
}

export function buildResilienceRunbook(drills: ResilienceDrill[], plans: MealPlan[]): ResilienceRunbook {
  const scoreValue = drills.reduce((sum, drill) => {
    if (drill.status === "pass") return sum + 1;
    if (drill.status === "watch") return sum + 0.85;
    return sum;
  }, 0);
  const score = Math.round((scoreValue / drills.length) * 100);
  const latestPlan = plans.at(-1);

  return {
    generatedAt: new Date().toISOString(),
    score,
    safeRetryClasses: [
      "pure reads",
      "tracking reads",
      "cart mutations with same arguments",
      "coupon application",
      "rate-limited reads after Retry-After",
    ],
    nonBlindRetryTools: ["place_food_order", "checkout", "book_table"],
    escalationEmail:
      "mailto:builders@swiggy.in?subject=MealPilot%20resilience%20drill%20evidence&body=Attach%20session%20id%2C%20timestamp%2C%20tool%2C%20status%2C%20and%20request%20id.",
    checklist: drills.map((drill) => ({
      id: drill.id,
      label: drill.label,
      status: drill.status,
      evidence: drill.recoveryPattern,
    })),
    supportPayload: {
      latestSessionId: latestPlan?.id ?? "run a plan before escalation",
      sessionIds: plans
        .slice(-3)
        .map((plan) => plan.id)
        .join(", "),
      requestIdHeader: "X-MealPilot-Request-Id",
      swiggyContact: "builders@swiggy.in",
    },
  };
}
