import type {
  MealPlan,
  TrafficLaneBudget,
  TrafficNotification,
  TrafficReadinessPlan,
  TrafficReadinessStatus,
  TrafficRolloutStage,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
];

function statusWeight(status: TrafficReadinessStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.85;
  if (status === "manual_input") return 0.7;
  return 0.55;
}

function averageStatusScore(items: Array<{ status: TrafficReadinessStatus }>) {
  if (items.length === 0) return 0;
  return items.reduce((sum, item) => sum + statusWeight(item.status), 0) / items.length;
}

function buildCapacityUpgradeEmail(options: {
  config: ServerConfig;
  projectedDailyToolCalls: number;
  peakQps: number;
  estimatedToolCallsPerSession: number;
}): TrafficReadinessPlan["capacityUpgradeEmail"] {
  return {
    to: "builders@swiggy.in",
    subject: "MealPilot India traffic profile and capacity confirmation",
    body: [
      "Hi Swiggy Builders team,",
      "",
      "Sharing MealPilot India's Swiggy MCP launch traffic profile for capacity confirmation.",
      "",
      `Integration: MealPilot India`,
      `Runtime mode today: ${options.config.swiggyMode}`,
      "Servers: food, instamart, dineout",
      `Expected traffic: ${options.projectedDailyToolCalls.toLocaleString("en-IN")} tool calls/day at pilot scale`,
      `Expected QPS: sustained <0.25, peak ${options.peakQps.toFixed(2)} during meal windows`,
      `Tool-call shape: ${options.estimatedToolCallsPerSession} calls/session, read-heavy with serialized writes`,
      "Surfaces: chat first, voice-ready; no scraping, catalogue export, or hidden background polling",
      "Retry contract: honor Retry-After when 429 ships, 30s max user-facing wall-clock, check-then-retry for commercial actions",
      "Rollout: 1% -> 10% -> 50% -> 100% over at least 24 hours after 48h green staging",
      "",
      "Please confirm whether this stays within the current developer-tier ceiling or if you want a bespoke cap before launch.",
    ].join("\n"),
  };
}

export function buildTrafficReadinessPlan(options: { plans: MealPlan[]; config: ServerConfig }): TrafficReadinessPlan {
  const latest = options.plans.at(-1);
  const estimatedToolCallsPerSession = latest?.callCount ?? 12;
  const projectedDailySessions = 200;
  const projectedDailyToolCalls = estimatedToolCallsPerSession * projectedDailySessions;
  const peakQps = 0.8;

  const lanes: TrafficLaneBudget[] = [
    {
      id: "auth_refresh",
      server: "all",
      lane: "auth",
      plannedLimit: "OAuth endpoints target 99.9% production SLO; re-auth on 401 instead of retrying stale tokens.",
      mealPilotEstimate: "Initial OAuth plus occasional refresh; no per-turn auth traffic in steady state.",
      peakQps: 0.03,
      dailyCalls: 40,
      retryAfterPolicy: "401 triggers a fresh OAuth flow; 429 Retry-After will be honored once MCP-layer throttling ships.",
      status: "ready",
      evidenceLinks: ["/api/credential-onboarding", "/api/mcp-gateway", "/api/error-intelligence"],
    },
    {
      id: "food_discovery",
      server: "food",
      lane: "discovery",
      plannedLimit: "120 requests/minute per authenticated user per server.",
      mealPilotEstimate: "One address read, one restaurant search, one menu/details read, and cached go-to-item reuse per planning turn.",
      peakQps: 0.22,
      dailyCalls: Math.round(projectedDailyToolCalls * 0.28),
      retryAfterPolicy: "Read calls use exponential backoff with jitter and do not exceed a 30s user-facing retry budget.",
      status: "ready",
      evidenceLinks: ["/api/swiggy-route-optimizer", "/api/resilience", "/api/observability/traces"],
    },
    {
      id: "instamart_discovery_cart",
      server: "instamart",
      lane: "cart",
      plannedLimit: "120 requests/minute read ceiling; 30 requests/minute write-tool ceiling.",
      mealPilotEstimate: "Go-to-items and product search are batched; cart updates happen only after an explicit user-visible choice.",
      peakQps: 0.18,
      dailyCalls: Math.round(projectedDailyToolCalls * 0.2),
      retryAfterPolicy: "Cart mutations retry only when server-side cart state can be refreshed without duplicating items.",
      status: "ready",
      evidenceLinks: ["/api/sessions/:sessionId/preflight", "/api/swiggy-journey-compiler"],
    },
    {
      id: "dineout_discovery",
      server: "dineout",
      lane: "discovery",
      plannedLimit: "120 requests/minute per authenticated user per server.",
      mealPilotEstimate: "Restaurant search, details, availability, and slot reads are coalesced into one planned evening path.",
      peakQps: 0.12,
      dailyCalls: Math.round(projectedDailyToolCalls * 0.14),
      retryAfterPolicy: "Availability reads are safe to retry with backoff; booking remains locked behind confirmation.",
      status: "ready",
      evidenceLinks: ["/api/swiggy-journey-compiler", "/api/mcp/tool-lab"],
    },
    {
      id: "commercial_writes",
      server: "all",
      lane: "commercial",
      plannedLimit: "30 requests/minute per authenticated user for write tools.",
      mealPilotEstimate: "One serialized order, checkout, or booking action after explicit confirmation; no hidden commercial writes.",
      peakQps: 0.08,
      dailyCalls: Math.round(projectedDailyToolCalls * 0.09),
      retryAfterPolicy: "place_food_order, checkout, and book_table use check-then-retry, never blind network retries.",
      status: "ready",
      evidenceLinks: ["/api/sessions/:sessionId/staging-transcript", "/api/resilience", "/api/error-intelligence"],
    },
    {
      id: "tracking_refresh",
      server: "all",
      lane: "tracking",
      plannedLimit: "Do not poll track_* faster than 10 seconds.",
      mealPilotEstimate: "Manual refresh plus reminder-based follow-up, capped at one tracking read per visible refresh.",
      peakQps: 0.1,
      dailyCalls: Math.round(projectedDailyToolCalls * 0.12),
      retryAfterPolicy: "Tracking reads are safe to retry, but backoff and UI refresh cadence prevent tight polling loops.",
      status: "ready",
      evidenceLinks: ["/api/tracking/:sessionId", "/api/swiggy-route-optimizer", "/api/observability/traces"],
    },
    {
      id: "support_reporting",
      server: "all",
      lane: "support",
      plannedLimit: "Support escalation uses session ids and report_error payloads, not background polling.",
      mealPilotEstimate: "Rare user-triggered support packet with one report_error-shaped payload per affected session.",
      peakQps: 0.02,
      dailyCalls: 20,
      retryAfterPolicy: "Support packets are operator-triggered and include timestamps/session ids rather than repeated probes.",
      status: "ready",
      evidenceLinks: ["/api/support/bridge", "/api/support/report", "/api/telemetry/runtime"],
    },
  ];

  const rollout: TrafficRolloutStage[] = [
    {
      id: "private_canary",
      label: "Private canary",
      trafficPercent: 1,
      pilotUsers: 20,
      duration: "6 hours",
      entryCriteria: ["Production credentials installed", "48h staging soak is green", "p95 tool latency and 5xx rate alerts enabled"],
      rollbackTrigger: [">2% tool failure rate for 15 minutes", "Any duplicated commercial action", "OAuth refresh loop detected"],
      status: "ready",
    },
    {
      id: "friend_family",
      label: "Friend and family",
      trafficPercent: 10,
      pilotUsers: 50,
      duration: "6 hours",
      entryCriteria: ["Private canary has zero commercial-action incidents", "Support packet template verified"],
      rollbackTrigger: [">1% 5xx or upstream error rate", "Tracking cadence drops below 10 seconds", "Unhandled RATE_LIMITED branch"],
      status: "ready",
    },
    {
      id: "city_ramp",
      label: "City cohort ramp",
      trafficPercent: 50,
      pilotUsers: 100,
      duration: "12 hours",
      entryCriteria: ["Peak meal-window telemetry reviewed", "builders@swiggy.in capacity confirmation retained"],
      rollbackTrigger: ["Sustained peak above 0.8 QPS", "p95 write latency above 2 seconds for 10 minutes"],
      status: "watch",
    },
    {
      id: "public_launch",
      label: "Public launch",
      trafficPercent: 100,
      pilotUsers: 200,
      duration: "After at least 24 hours of staged traffic",
      entryCriteria: ["No S0/S1 incidents", "Major traffic event notice sent seven days ahead if launch is campaign-backed"],
      rollbackTrigger: ["Swiggy capacity warning", "Credential revocation signal", "Unexpected background job traffic"],
      status: "manual_input",
    },
  ];

  const notifications: TrafficNotification[] = [
    {
      id: "expected_volume",
      label: "Access-form expected volume",
      leadTimeDays: 0,
      channel: "/api/production-launch-bundle and /api/builder-package.md",
      status: "ready",
      evidence: `${projectedDailyToolCalls.toLocaleString("en-IN")} tool calls/day, peak ${peakQps.toFixed(2)} QPS, three Swiggy servers.`,
    },
    {
      id: "major_traffic_event",
      label: "Major traffic event notice",
      leadTimeDays: 7,
      channel: "builders@swiggy.in",
      status: "manual_input",
      evidence: "Send before launch, campaign, or any traffic event that materially changes the pilot forecast.",
    },
    {
      id: "capacity_upgrade",
      label: "Higher capacity request",
      leadTimeDays: 1,
      channel: "builders@swiggy.in",
      status: projectedDailyToolCalls < 50000 && peakQps < 1 ? "ready" : "external_gate",
      evidence: "Current pilot forecast stays below the documented per-user ceilings; upgrade email is prepared if Swiggy asks for bespoke caps.",
    },
    {
      id: "incident_contact",
      label: "Incident contact confirmation",
      leadTimeDays: 0,
      channel: "Builder Access application",
      status: "manual_input",
      evidence: "Final on-call email and optional Slack channel must be filled before production promotion.",
    },
  ];

  const retryAfterContract = {
    ready: true,
    maxWallClockMs: 30000,
    evidence: [
      "429 handler honors Retry-After directly once Swiggy MCP-layer throttling ships.",
      "Retry budget is capped at 30 seconds for user-facing flows.",
      "Generic upstream failures use exponential backoff with jitter and no more than five attempts.",
      "Commercial actions use status-check recovery before retrying place_food_order, checkout, or book_table.",
    ],
  };

  const laneScore = averageStatusScore(lanes) * 40;
  const rolloutScore = averageStatusScore(rollout) * 25;
  const notificationScore = averageStatusScore(notifications) * 20;
  const retryScore = retryAfterContract.ready ? 10 : 0;
  const emailScore = 5;
  const score = Math.round(laneScore + rolloutScore + notificationScore + retryScore + emailScore);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    projectedDailySessions,
    estimatedToolCallsPerSession,
    projectedDailyToolCalls,
    peakQps,
    lanes,
    rollout,
    notifications,
    retryAfterContract,
    capacityUpgradeEmail: buildCapacityUpgradeEmail({
      config: options.config,
      projectedDailyToolCalls,
      peakQps,
      estimatedToolCallsPerSession,
    }),
    guardrails: [
      "Cache saved addresses, restaurant metadata, menus, and low-churn go-to items instead of re-fetching every turn.",
      "Keep tracking refreshes user-visible and never poll track_* tools faster than every 10 seconds.",
      "Serialize write tools and block every commercial action until the user sees items, total, address or slot, and provider.",
      "Separate interactive user traffic from any future batch analytics or background jobs.",
      "Back off on upstream errors with jitter, stop after the user-facing retry budget, and expose a support path.",
      "Notify builders@swiggy.in seven days ahead of launches or campaigns that can shift traffic above the pilot profile.",
    ],
    assertions: [
      "Pilot traffic stays under one peak QPS across Food, Instamart, and Dineout.",
      "Every lane is mapped to an evidence endpoint and a retry or throttling policy.",
      "The rollout follows Swiggy's 1% -> 10% -> 50% -> 100% ramp over at least 24 hours.",
      "Retry-After handling is wired before MCP-layer 429 enforcement ships.",
      "Capacity upgrade and major-event notification templates are prepared but external Swiggy confirmation remains gated.",
    ],
    externalGates: [
      "Swiggy-issued staging credentials are required before live seeded-data traffic.",
      "Production promotion requires at least 48 hours of green staging and builders@swiggy.in approval.",
      "Final incident contact email and Slack/SEV channel must be confirmed with Swiggy.",
      "Bespoke capacity ceilings require Swiggy confirmation if the forecast exceeds the documented developer-tier profile.",
      "Any campaign or major launch requires seven-day advance notice to Swiggy.",
    ],
  };
}
