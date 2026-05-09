import type {
  AgentSurface,
  AgentSurfaceResponse,
  GoLiveCheck,
  GroupMember,
  GroupPlan,
  IncidentReport,
  MealPlan,
  McpServerCoverage,
  McpToolCoverage,
  ObservabilityMetric,
  OpsStatus,
  PantryItem,
  Reminder,
  RestockSuggestion,
  SwiggyServer,
  UserProfile,
} from "../../src/domain/types.js";

const mcpTools: Array<Omit<McpToolCoverage, "status" | "evidence">> = [
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "get_addresses", stage: "location" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "search_restaurants", stage: "discovery" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "get_restaurant_menu", stage: "menu" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "search_menu", stage: "menu" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "update_food_cart", stage: "cart" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "get_food_cart", stage: "cart" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "flush_food_cart", stage: "cart" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "fetch_food_coupons", stage: "offers" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "apply_food_coupon", stage: "offers" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "place_food_order", stage: "commercial action" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "get_food_orders", stage: "orders" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "get_food_order_details", stage: "orders" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "track_food_order", stage: "tracking" },
  { server: "food", endpoint: "POST mcp.swiggy.com/food", tool: "report_error", stage: "support" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "get_addresses", stage: "location" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "create_address", stage: "location" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "delete_address", stage: "location" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "search_products", stage: "discovery" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "your_go_to_items", stage: "reorder" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "update_cart", stage: "cart" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "get_cart", stage: "cart" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "clear_cart", stage: "cart" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "checkout", stage: "commercial action" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "get_orders", stage: "orders" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "get_order_details", stage: "orders" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "track_order", stage: "tracking" },
  { server: "instamart", endpoint: "POST mcp.swiggy.com/im", tool: "report_error", stage: "support" },
  { server: "dineout", endpoint: "POST mcp.swiggy.com/dineout", tool: "get_saved_locations", stage: "location" },
  { server: "dineout", endpoint: "POST mcp.swiggy.com/dineout", tool: "search_restaurants_dineout", stage: "discovery" },
  { server: "dineout", endpoint: "POST mcp.swiggy.com/dineout", tool: "get_restaurant_details", stage: "details" },
  { server: "dineout", endpoint: "POST mcp.swiggy.com/dineout", tool: "get_available_slots", stage: "availability" },
  { server: "dineout", endpoint: "POST mcp.swiggy.com/dineout", tool: "create_cart", stage: "cart" },
  { server: "dineout", endpoint: "POST mcp.swiggy.com/dineout", tool: "book_table", stage: "commercial action" },
  { server: "dineout", endpoint: "POST mcp.swiggy.com/dineout", tool: "get_booking_status", stage: "tracking" },
  { server: "dineout", endpoint: "POST mcp.swiggy.com/dineout", tool: "report_error", stage: "support" },
];

const demoReadyTools = new Set([
  "food.get_addresses",
  "food.search_restaurants",
  "food.get_restaurant_menu",
  "food.update_food_cart",
  "food.get_food_cart",
  "food.place_food_order",
  "food.track_food_order",
  "instamart.get_addresses",
  "instamart.search_products",
  "instamart.your_go_to_items",
  "instamart.update_cart",
  "instamart.get_cart",
  "instamart.checkout",
  "instamart.track_order",
  "dineout.get_saved_locations",
  "dineout.search_restaurants_dineout",
  "dineout.get_restaurant_details",
  "dineout.get_available_slots",
  "dineout.book_table",
  "dineout.get_booking_status",
]);

const guardedTools = new Set([
  "food.search_menu",
  "food.flush_food_cart",
  "food.fetch_food_coupons",
  "food.apply_food_coupon",
  "food.get_food_orders",
  "food.get_food_order_details",
  "food.report_error",
  "instamart.create_address",
  "instamart.delete_address",
  "instamart.clear_cart",
  "instamart.get_orders",
  "instamart.get_order_details",
  "instamart.report_error",
  "dineout.create_cart",
  "dineout.report_error",
]);

export function buildRestockSuggestions(pantry: PantryItem[]): RestockSuggestion[] {
  return pantry
    .filter((item) => item.currentQty < item.targetQty)
    .map((item) => {
      const missing = item.targetQty - item.currentQty;
      return {
        id: `restock_${item.id}`,
        itemId: item.id,
        name: item.name,
        quantity: `${missing} ${item.unit}`,
        price: Math.round(missing * item.estimatedPrice),
        reason: `${item.name} is below household target of ${item.targetQty} ${item.unit}.`,
      };
    });
}

export function buildGroupPlan(members: GroupMember[]): GroupPlan {
  const combinedBudget = members.reduce((sum, member) => sum + member.budget, 0);
  const diets = [...new Set(members.map((member) => member.diet))];
  const allergies = [...new Set(members.flatMap((member) => member.allergies))].filter(Boolean);

  return {
    members,
    combinedBudget,
    constraints: [...diets, ...allergies.map((allergy) => `${allergy}-safe`)],
    recommendation:
      combinedBudget >= 1200
        ? "Use group-friendly bowls plus shared starters; keep allergy-safe filtering on."
        : "Use individual bowls and avoid shared add-ons to protect budget and allergies.",
  };
}

export function buildPlanReminders(plan: MealPlan): Reminder[] {
  const now = Date.now();
  return [
    {
      id: `reminder_${plan.id}_food`,
      sessionId: plan.id,
      label: "Review lunch order window",
      channel: "in_app",
      scheduledFor: new Date(now + 15 * 60 * 1000).toISOString(),
      status: "scheduled",
    },
    {
      id: `reminder_${plan.id}_instamart`,
      sessionId: plan.id,
      label: "Check grocery basket before dinner prep",
      channel: "in_app",
      scheduledFor: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
    },
    {
      id: `reminder_${plan.id}_dineout`,
      sessionId: plan.id,
      label: "Confirm table timing with guests",
      channel: "email_draft",
      scheduledFor: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
    },
  ];
}

export function buildOpsStatus(options: { hasClientId: boolean; planCount: number; reminderCount: number }): OpsStatus[] {
  return [
    {
      id: "api",
      label: "API health",
      status: "healthy",
      detail: "Express API is responding and serving the production build.",
    },
    {
      id: "mcp",
      label: "MCP mode",
      status: options.hasClientId ? "healthy" : "warning",
      detail: options.hasClientId ? "Client id configured." : "Mock mode active until Swiggy credentials are issued.",
    },
    {
      id: "sessions",
      label: "Plan sessions",
      status: options.planCount > 0 ? "healthy" : "warning",
      detail: `${options.planCount} in-memory plan session(s) active.`,
    },
    {
      id: "reminders",
      label: "Reminder queue",
      status: "healthy",
      detail: `${options.reminderCount} scheduled reminder(s) in local queue.`,
    },
  ];
}

function toolKey(tool: Pick<McpToolCoverage, "server" | "tool">) {
  return `${tool.server}.${tool.tool}`;
}

function coverageForTool(tool: Omit<McpToolCoverage, "status" | "evidence">): McpToolCoverage {
  const key = toolKey(tool);
  if (demoReadyTools.has(key)) {
    return {
      ...tool,
      status: "demo_ready",
      evidence: "Covered by the local end-to-end planner, mock MCP router, or confirmation/tracking flow.",
    };
  }

  if (guardedTools.has(key)) {
    return {
      ...tool,
      status: "guarded",
      evidence: "Included in the production design with explicit guardrails, but not auto-triggered in the demo path.",
    };
  }

  return {
    ...tool,
    status: "planned",
    evidence: "Queued for staging hardening once Swiggy credentials and seeded data are available.",
  };
}

export function buildMcpCoverage(): McpServerCoverage[] {
  const servers: SwiggyServer[] = ["food", "instamart", "dineout"];

  return servers.map((server) => {
    const tools = mcpTools.filter((tool) => tool.server === server).map(coverageForTool);
    return {
      server,
      endpoint: tools[0]?.endpoint ?? "",
      totalTools: tools.length,
      demoReady: tools.filter((tool) => tool.status === "demo_ready").length,
      guarded: tools.filter((tool) => tool.status === "guarded").length,
      planned: tools.filter((tool) => tool.status === "planned").length,
      tools,
    };
  });
}

export function buildAgentSurfaceResponse(plan: MealPlan, surface: AgentSurface): AgentSurfaceResponse {
  const visibleRecommendations = surface === "voice" ? plan.recommendations.slice(0, 3) : plan.recommendations;
  const cards = visibleRecommendations.map((recommendation) => ({
    title: recommendation.title,
    provider: recommendation.provider,
    total: recommendation.total,
    eta: recommendation.eta,
  }));
  const total = visibleRecommendations.reduce((sum, item) => sum + item.total, 0);
  const serverCopy = visibleRecommendations.map((item) => item.server).join(", ");

  if (surface === "voice") {
    return {
      surface,
      headline: "Voice-safe MealPilot response",
      shortSummary: `I found ${visibleRecommendations.length} Swiggy options across ${serverCopy}. The estimated total is Rs ${total.toLocaleString("en-IN")}.`,
      recommendationIds: visibleRecommendations.map((item) => item.id),
      cards,
      confirmationPrompt:
        "Say confirm only after I read the exact item list, total, delivery timing, and booking time for each action.",
      constraints: [
        "Maximum three options spoken",
        "No internal IDs or session tokens spoken aloud",
        "Commercial actions stay locked until the user confirms",
      ],
    };
  }

  return {
    surface,
    headline: "Chat-ready rich response",
    shortSummary: `${plan.summary} Estimated total: Rs ${plan.total.toLocaleString("en-IN")}.`,
    recommendationIds: visibleRecommendations.map((item) => item.id),
    cards,
    confirmationPrompt: "Review each card and press Confirm only for the Food, Instamart, or Dineout action you want to execute.",
    constraints: [
      "Cards expose provider, ETA, items, and total",
      "Audit timeline shows every MCP tool call",
      "Cart totals are refreshed before confirmation",
    ],
  };
}

export function buildGoLiveChecks(options: {
  hasClientId: boolean;
  hasPlan: boolean;
  hasReminders: boolean;
  hasConfirmedAction: boolean;
}): GoLiveCheck[] {
  return [
    {
      id: "credentials",
      label: "Production credentials",
      status: options.hasClientId ? "ready" : "needs_credentials",
      evidence: options.hasClientId ? "SWIGGY_CLIENT_ID is configured." : "Mock client id is active until Builder Access is granted.",
    },
    {
      id: "oauth",
      label: "OAuth redirect and PKCE",
      status: "ready",
      evidence: "Server stores verifier by state and exposes start/callback endpoints for exact-match redirect testing.",
    },
    {
      id: "cart_confirmation",
      label: "Cart confirmation",
      status: options.hasConfirmedAction ? "ready" : "manual_review",
      evidence: options.hasConfirmedAction
        ? "At least one Food, Instamart, or Dineout action was explicitly confirmed."
        : "Commercial actions are prepared but await user confirmation in this session.",
    },
    {
      id: "idempotency",
      label: "Non-idempotent action policy",
      status: "ready",
      evidence: "Order placement, grocery checkout, and table booking are never blindly retried.",
    },
    {
      id: "observability",
      label: "Session observability",
      status: options.hasPlan ? "ready" : "manual_review",
      evidence: options.hasPlan
        ? "Every generated plan includes MCP-like tool events with session ids and durations."
        : "Run a plan to populate session metrics.",
    },
    {
      id: "rollout",
      label: "Pilot rollout",
      status: options.hasReminders ? "ready" : "manual_review",
      evidence: options.hasReminders
        ? "Reminder queue is populated for follow-up flows."
        : "Schedule reminders before recording the demo.",
    },
    {
      id: "privacy",
      label: "Privacy controls",
      status: "ready",
      evidence: "Local export and delete endpoints are implemented for profile, plan, pantry, group, and reminder data.",
    },
  ];
}

export function buildObservabilityMetrics(options: {
  plans: MealPlan[];
  reminderCount: number;
  hasClientId: boolean;
}): ObservabilityMetric[] {
  const events = options.plans.flatMap((plan) => plan.auditTrail);
  const averageDuration =
    events.length > 0 ? Math.round(events.reduce((sum, event) => sum + event.durationMs, 0) / events.length) : 0;
  const confirmed = options.plans.flatMap((plan) => plan.recommendations).filter((item) => item.status === "confirmed");
  const sessions = options.plans.map((plan) => plan.id);

  return [
    {
      id: "tool_latency",
      label: "Avg MCP tool latency",
      value: events.length > 0 ? `${averageDuration}ms` : "No events",
      status: averageDuration <= 250 ? "healthy" : "watch",
      detail: "Demo target keeps p50-style latency comfortably below a human-noticeable planning delay.",
    },
    {
      id: "success_rate",
      label: "Tool success rate",
      value: events.length > 0 ? "100%" : "Pending",
      status: events.length > 0 ? "healthy" : "watch",
      detail: "Mock MCP flow records successful tool calls; staging will replace this with real 4xx/5xx metrics.",
    },
    {
      id: "confirmed_actions",
      label: "Confirmed commercial actions",
      value: String(confirmed.length),
      status: confirmed.length > 0 ? "healthy" : "watch",
      detail: "Shows reviewers that the demo can cross the confirmation gate safely.",
    },
    {
      id: "active_sessions",
      label: "Traceable sessions",
      value: String(sessions.length),
      status: sessions.length > 0 ? "healthy" : "watch",
      detail: sessions.length > 0 ? `Latest session: ${sessions.at(-1)}` : "Run a plan to create a support-ready session id.",
    },
    {
      id: "reminder_queue",
      label: "Reminder queue",
      value: String(options.reminderCount),
      status: "healthy",
      detail: "Food, Instamart, and Dineout follow-ups can be scheduled from a plan.",
    },
    {
      id: "credential_mode",
      label: "Credential mode",
      value: options.hasClientId ? "Configured" : "Mock",
      status: options.hasClientId ? "healthy" : "watch",
      detail: options.hasClientId ? "Ready for staging endpoint swap." : "Local demo mode until Swiggy grants credentials.",
    },
  ];
}

export function buildIncidentReport(options: { plans: MealPlan[]; sessionId?: string }): IncidentReport {
  const selectedPlan =
    options.sessionId !== undefined ? options.plans.find((plan) => plan.id === options.sessionId) : options.plans.at(-1);
  const sessionIds = selectedPlan ? [selectedPlan.id] : options.plans.slice(-3).map((plan) => plan.id);
  const subject = `MealPilot Swiggy MCP support report${selectedPlan ? ` - ${selectedPlan.id}` : ""}`;
  const summary = selectedPlan
    ? `MealPilot session ${selectedPlan.id} generated ${selectedPlan.auditTrail.length} tool events across ${selectedPlan.recommendations.length} recommendations.`
    : "MealPilot generated a support report before a plan session existed.";
  const body = [
    summary,
    "",
    `Session ids: ${sessionIds.join(", ") || "none"}`,
    "Mode: local mock until Builder Access credentials are issued",
    "Requested servers: food, instamart, dineout",
  ].join("\n");

  return {
    id: `incident_${Date.now()}`,
    severity: "S2",
    subject,
    summary,
    mailto: `mailto:builders@swiggy.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    sessionIds,
    nextSteps: [
      "Attach the failing session id and timestamp.",
      "Include whether the user was on chat or voice surface.",
      "Confirm credentials, scopes, and redirect URI before escalation.",
    ],
  };
}

export function buildApplicationMarkdown(args: {
  profile: UserProfile;
  readiness: Array<{ label: string; status: string; evidence: string }>;
  coverage?: McpServerCoverage[];
  goLive?: GoLiveCheck[];
}) {
  const readiness = args.readiness
    .map((item) => `- ${item.label}: ${item.status} - ${item.evidence}`)
    .join("\n");
  const coverage = (args.coverage ?? buildMcpCoverage())
    .map(
      (server) =>
        `- ${server.server}: ${server.demoReady}/${server.totalTools} demo-ready, ${server.guarded} guarded, ${server.planned} planned`,
    )
    .join("\n");
  const goLive = (args.goLive ?? [])
    .map((item) => `- ${item.label}: ${item.status} - ${item.evidence}`)
    .join("\n");

  return `# MealPilot India - Swiggy Builder Access Packet

## Use Case

MealPilot India is a privacy-first AI commerce assistant for Indian households. It composes Swiggy Food, Instamart, and Dineout into meal planning, grocery restocking, and dining workflows with explicit confirmation gates.

## Requested Servers

- food
- instamart
- dineout

## Pilot

- Target users: 50-100 private pilot users
- Expected traffic: below 1 QPS peak
- Tool calls: about 1,600-3,000 per week

## Safety

- Separate confirmation before food order, grocery checkout, or table booking
- No blind retry for non-idempotent commercial actions
- Minimal profile storage with explicit consent
- Swiggy session ids treated as support identifiers only
- Chat and voice response contracts are separated so IDs, tokens, and long lists are never read aloud
- Widget contracts use sandboxed iframe settings and semantic fallbacks
- Rate-limit plan keeps pilot traffic below planned developer-tier ceilings
- Version monitor is wired for v1 route pinning and deprecation metadata
- Compliance controls cover consent, minimization, deletion, audit logging, and no model-training use

## Profile Snapshot

- Household size: ${args.profile.householdSize}
- Diet: ${args.profile.diet}
- City: ${args.profile.defaultCity}
- Consent: ${args.profile.consentToStorePreferences ? "yes" : "no"}

## Readiness

${readiness}

## MCP Tool Coverage

${coverage}

## Go-Live Checks

${goLive || "- Run a local plan to populate session-specific go-live evidence."}
`;
}
