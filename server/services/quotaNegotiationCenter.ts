import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyLoadLabScenario,
  SwiggyQuotaNegotiationAsk,
  SwiggyQuotaNegotiationCenter,
  SwiggyQuotaNegotiationRunbookStep,
  SwiggyQuotaNegotiationScenario,
  SwiggyQuotaNegotiationStatus,
} from "../../src/domain/types.js";
import { buildMcpBackpressureGovernor } from "./backpressureGovernor.js";
import { buildSwiggyLoadLab } from "./loadLab.js";
import { buildSwiggyRouteOptimizationReport } from "./observability.js";
import { buildRateLimitPlan } from "./productionEvidence.js";
import { buildTrafficReadinessPlan } from "./trafficReadiness.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/access/",
];

function statusWeight(status: SwiggyQuotaNegotiationStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.82;
  if (status === "operator_input") return 0.68;
  return 0.54;
}

function ask(input: SwiggyQuotaNegotiationAsk): SwiggyQuotaNegotiationAsk {
  return input;
}

function runbookStep(input: SwiggyQuotaNegotiationRunbookStep): SwiggyQuotaNegotiationRunbookStep {
  return input;
}

function scenarioDecision(scenario: SwiggyLoadLabScenario): SwiggyQuotaNegotiationScenario["quotaDecision"] {
  if (scenario.projected429sPerHour > 0 || scenario.peakQps >= 1.4) return "needs_upgrade";
  if (scenario.peakQps >= 0.8) return "needs_notice";
  return "within_pilot";
}

function scenarioStatus(decision: SwiggyQuotaNegotiationScenario["quotaDecision"]): SwiggyQuotaNegotiationStatus {
  if (decision === "within_pilot") return "ready";
  if (decision === "needs_notice") return "operator_input";
  return "swiggy_gate";
}

function buildCapacityPacket(options: {
  config: ServerConfig;
  projectedDailyToolCalls: number;
  peakQps: number;
  maxPeakQps: number;
  maxToolCallsPerHour: number;
  optimizedCallsPerSession: number;
  upgradeScenarios: number;
}): SwiggyQuotaNegotiationCenter["capacityPacket"] {
  return {
    to: "builders@swiggy.in",
    subject: "MealPilot MCP quota profile and launch capacity confirmation",
    safeFields: [
      "runtime mode",
      "servers used",
      "projected daily tool calls",
      "peak QPS",
      "max calls per hour",
      "optimized calls per session",
      "rollout stages",
      "Retry-After posture",
    ],
    body: [
      "Hi Swiggy Builders team,",
      "",
      "Sharing MealPilot's MCP quota profile for capacity confirmation before production launch.",
      "",
      `Runtime mode today: ${options.config.swiggyMode}`,
      "Servers: Food, Instamart, Dineout",
      `Projected daily tool calls: ${options.projectedDailyToolCalls.toLocaleString("en-IN")}`,
      `Pilot peak QPS: ${options.peakQps.toFixed(2)}`,
      `Synthetic max peak QPS: ${options.maxPeakQps.toFixed(2)}`,
      `Max calls/hour in Load Lab: ${options.maxToolCallsPerHour.toLocaleString("en-IN")}`,
      `Optimized calls/session after route optimization: ${options.optimizedCallsPerSession}`,
      `Scenarios needing bespoke capacity: ${options.upgradeScenarios}`,
      "",
      "MealPilot will honor Retry-After when MCP-layer 429 ships, preserve a 30s user-facing retry budget, serialize commercial actions, hold tracking refreshes to 10 seconds or slower, and keep background catalogue jobs disabled until Swiggy approves a bespoke ceiling.",
      "",
      "Please confirm whether this should stay on developer-tier ceilings for private pilot or move to a partner quota profile before campaign traffic.",
    ].join("\n"),
  };
}

export function buildSwiggyQuotaNegotiationCenter(options: {
  config: ServerConfig;
  plans: MealPlan[];
}): SwiggyQuotaNegotiationCenter {
  const latestPlan = options.plans.at(-1);
  const rateLimit = buildRateLimitPlan(options.plans);
  const traffic = buildTrafficReadinessPlan({ config: options.config, plans: options.plans });
  const backpressure = buildMcpBackpressureGovernor(latestPlan);
  const loadLab = buildSwiggyLoadLab({ config: options.config, plans: options.plans });
  const routeOptimizer = buildSwiggyRouteOptimizationReport();

  const scenarios: SwiggyQuotaNegotiationScenario[] = loadLab.scenarios.map((item) => {
    const quotaDecision = scenarioDecision(item);
    return {
      id: item.id,
      label: item.label,
      projectedQps: item.peakQps,
      projectedCallsPerHour: item.toolCallsPerHour,
      quotaDecision,
      mitigation: item.decision,
      status: scenarioStatus(quotaDecision),
    };
  });
  const upgradeScenarios = scenarios.filter((item) => item.quotaDecision === "needs_upgrade").length;

  const asks = [
    ask({
      id: "developer_tier_confirmation",
      label: "Developer-tier pilot confirmation",
      currentSignal: `${traffic.projectedDailyToolCalls.toLocaleString("en-IN")} projected daily calls at ${traffic.peakQps.toFixed(2)} peak QPS.`,
      requestedPosture: "Confirm private pilot can stay inside current developer-tier ceilings.",
      evidence: rateLimit.budgets.find((budget) => budget.scope.includes("client_id"))?.mealPilotEstimate ?? "Client-day budget prepared.",
      owner: "Joint",
      status: traffic.peakQps < 1 && rateLimit.projectedDailyToolCalls < 50000 ? "ready" : "swiggy_gate",
      evidenceLinks: ["/api/rate-limit-plan", "/api/traffic-readiness-plan"],
    }),
    ask({
      id: "campaign_capacity_gate",
      label: "Campaign capacity gate",
      currentSignal: `${upgradeScenarios} Load Lab scenario(s) need bespoke capacity before launch.`,
      requestedPosture: "Hold public campaign traffic until seven-day notice and Swiggy quota confirmation are complete.",
      evidence: loadLab.scenarios.find((item) => item.id === "campaign_launch_spike")?.decision ?? "Campaign scenario remains gated.",
      owner: "Swiggy",
      status: upgradeScenarios > 0 ? "swiggy_gate" : "ready",
      evidenceLinks: ["/api/swiggy-load-lab", "/api/production-launch-bundle"],
    }),
    ask({
      id: "retry_after_header_watch",
      label: "Retry-After and X-RateLimit header watch",
      currentSignal: backpressure.mode === "v1_upstream_shedder" ? "Current v1 mode uses upstream shedding, not MCP-layer 429." : "Rate-limit headers active.",
      requestedPosture: "Keep telemetry fields ready and switch governor behavior when Swiggy ships live MCP 429 headers.",
      evidence: backpressure.plannedHeaders.join(", "),
      owner: "MealPilot",
      status: backpressure.plannedHeaders.includes("Retry-After") ? "ready" : "watch",
      evidenceLinks: ["/api/mcp/backpressure-governor", "/api/telemetry/runtime"],
    }),
    ask({
      id: "commercial_single_flight",
      label: "Commercial action single-flight proof",
      currentSignal: "Food place_order, Instamart checkout, and Dineout booking are serialized behind explicit confirmation.",
      requestedPosture: "Keep write and commercial quota separate from read-heavy planning traffic.",
      evidence: "Commercial Action Guard, Confirmation Command Center, and Load Lab all preserve check-then-retry behavior.",
      owner: "MealPilot",
      status: "ready",
      evidenceLinks: ["/api/mcp/commercial-action-guard", "/api/swiggy-confirmation-command-center"],
    }),
    ask({
      id: "background_jobs_disabled",
      label: "Background jobs disabled",
      currentSignal: "No hidden catalogue, menu, analytics, or batch export jobs run on developer-tier budget.",
      requestedPosture: "Negotiate a separate partner ceiling only if Swiggy approves background jobs.",
      evidence: "Backpressure background bucket and Load Lab background lane stay external-gated.",
      owner: "Joint",
      status: "swiggy_gate",
      evidenceLinks: ["/api/mcp/backpressure-governor", "/api/swiggy-growth-partnership"],
    }),
  ];

  const runbook = [
    runbookStep({
      id: "open_quota_center",
      label: "Open quota center",
      command: "curl -s http://localhost:8787/api/swiggy-quota-negotiation-center",
      proves: "Single Swiggy-ready quota packet with traffic, backpressure, load, and route optimization evidence.",
      owner: "MealPilot",
      status: "ready",
    }),
    runbookStep({
      id: "send_capacity_packet",
      label: "Send capacity packet",
      command: "Open capacityPacket and email builders@swiggy.in before campaign traffic.",
      proves: "Operator has a safe, no-token quota request with QPS and calls/hour.",
      owner: "Operator",
      status: "operator_input",
    }),
    runbookStep({
      id: "verify_headers",
      label: "Verify live header behavior",
      command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
      proves: "Production verifier asserts Retry-After, X-RateLimit readiness, and current upstream-shedder separation.",
      owner: "MealPilot",
      status: "ready",
    }),
    runbookStep({
      id: "approve_bespoke_quota",
      label: "Approve bespoke quota",
      command: "Swiggy confirms campaign or enterprise ceiling after reviewing the packet.",
      proves: "Campaign-scale traffic can move beyond external gate.",
      owner: "Swiggy",
      status: upgradeScenarios > 0 ? "swiggy_gate" : "watch",
    }),
  ];

  const allStatuses = [...asks.map((item) => item.status), ...scenarios.map((item) => item.status), ...runbook.map((item) => item.status)];
  const score = Math.round((allStatuses.reduce((sum, status) => sum + statusWeight(status), 0) / allStatuses.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    mode: options.config.swiggyMode,
    score,
    officialSources,
    totals: {
      asks: asks.length,
      readyAsks: asks.filter((item) => item.status === "ready").length,
      scenarios: scenarios.length,
      upgradeScenarios,
      runbookSteps: runbook.length,
      swiggyGates: [...asks, ...scenarios, ...runbook].filter((item) => item.status === "swiggy_gate").length,
    },
    forecast: {
      projectedDailyToolCalls: traffic.projectedDailyToolCalls,
      peakQps: traffic.peakQps,
      maxPeakQps: loadLab.totals.maxPeakQps,
      maxToolCallsPerHour: loadLab.totals.maxToolCallsPerHour,
      optimizedCallsPerSession: routeOptimizer.totals.optimizedCalls,
      retryAfterReady: traffic.retryAfterContract.ready && loadLab.totals.retryAfterReady,
      plannedHeaders: backpressure.plannedHeaders,
    },
    asks,
    scenarios,
    runbook,
    capacityPacket: buildCapacityPacket({
      config: options.config,
      projectedDailyToolCalls: traffic.projectedDailyToolCalls,
      peakQps: traffic.peakQps,
      maxPeakQps: loadLab.totals.maxPeakQps,
      maxToolCallsPerHour: loadLab.totals.maxToolCallsPerHour,
      optimizedCallsPerSession: routeOptimizer.totals.optimizedCalls,
      upgradeScenarios,
    }),
    assertions: [
      "Quota negotiation composes Rate Plan, Traffic Readiness, Backpressure Governor, Load Lab, and Route Optimizer evidence.",
      "Developer-tier pilot traffic remains distinct from campaign, enterprise, or background-job capacity asks.",
      "Current upstream-shedder behavior remains separate from future MCP-layer 429, Retry-After, and X-RateLimit headers.",
      "Commercial actions remain single-flight under load and never consume quota through hidden retries.",
    ],
    externalGates: [
      "Swiggy must confirm bespoke campaign or enterprise quotas before high-volume launch traffic.",
      "Swiggy must ship or document live MCP-layer Retry-After and X-RateLimit header behavior before header-driven throttling is production-claimed.",
      "Operator must send the capacity packet and retain Swiggy acknowledgement before campaign launch.",
    ],
  };
}
