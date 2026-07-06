import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyLoadLabCohort,
  SwiggyLoadLabDrill,
  SwiggyLoadLabLane,
  SwiggyLoadLabReport,
  SwiggyLoadLabScenario,
  SwiggyLoadLabStatus,
  TrafficLaneBudget,
} from "../../src/domain/types.js";
import { buildMcpBackpressureGovernor } from "./backpressureGovernor.js";
import { buildSwiggyRouteOptimizationReport } from "./observability.js";
import { buildTrafficReadinessPlan } from "./trafficReadiness.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function statusWeight(status: SwiggyLoadLabStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.52;
}

function scenario(input: Omit<SwiggyLoadLabScenario, "toolCallsPerHour" | "peakQps" | "writeQps" | "status"> & {
  callsPerSession: number;
  commercialShare: number;
}): SwiggyLoadLabScenario {
  const { callsPerSession, commercialShare, ...scenarioBase } = input;
  const toolCallsPerHour = input.sessionsPerHour * callsPerSession;
  const peakQps = Number((toolCallsPerHour / 3600).toFixed(3));
  const writeQps = Number((peakQps * commercialShare).toFixed(3));
  const status: SwiggyLoadLabStatus =
    peakQps < 0.9 && input.projected429sPerHour === 0
      ? "ready"
      : peakQps < 1.4 && input.retryAfterSeconds <= 30
        ? "watch"
        : "external_gate";

  return {
    ...scenarioBase,
    toolCallsPerHour,
    peakQps,
    writeQps,
    status,
  };
}

function laneFromTrafficLane(lane: TrafficLaneBudget): SwiggyLoadLabLane {
  const status: SwiggyLoadLabStatus =
    lane.status === "external_gate" ? "external_gate" : lane.peakQps < 0.25 ? "ready" : "watch";
  return {
    id: lane.id,
    server: lane.server,
    lane: lane.lane,
    expectedQps: lane.peakQps,
    plannedCeiling: lane.plannedLimit,
    governor: lane.retryAfterPolicy,
    status,
    evidenceLinks: lane.evidenceLinks,
  };
}

export function buildSwiggyLoadLab(options: { config: ServerConfig; plans: MealPlan[] }): SwiggyLoadLabReport {
  const traffic = buildTrafficReadinessPlan({ config: options.config, plans: options.plans });
  const backpressure = buildMcpBackpressureGovernor(options.plans.at(-1));
  const routeOptimizer = buildSwiggyRouteOptimizationReport();
  const callsPerSession = Math.max(traffic.estimatedToolCallsPerSession, routeOptimizer.totals.optimizedCalls);
  const optimizedCallsPerSession = routeOptimizer.totals.optimizedCalls;

  const scenarios = [
    scenario({
      id: "weekday_lunch_pilot",
      label: "Weekday Lunch Pilot",
      description: "Private canary lunch planning with Food reads, Instamart go-to items, and optional Dineout suggestions.",
      pilotUsers: 50,
      sessionsPerHour: 32,
      callsPerSession: optimizedCallsPerSession,
      commercialShare: 0.09,
      retryAfterSeconds: 0,
      projected429sPerHour: 0,
      p95LatencyMs: 720,
      bottleneck: "Food restaurant/menu reads during lunch discovery.",
      decision: "Allow launch; parallelize only reads and keep commercial actions serialized.",
      evidenceLinks: ["/api/swiggy-route-optimizer", "/api/traffic-readiness-plan"],
    }),
    scenario({
      id: "evening_three_server_peak",
      label: "Evening Three-Server Peak",
      description: "Dinner planning with Food delivery, Instamart basket prep, and Dineout reservation slot checks.",
      pilotUsers: 200,
      sessionsPerHour: 116,
      callsPerSession,
      commercialShare: 0.12,
      retryAfterSeconds: 0,
      projected429sPerHour: 0,
      p95LatencyMs: 940,
      bottleneck: "Dineout slot freshness and Instamart cart truth before confirmation.",
      decision: "Proceed at 50% cohort only after staging soak and capacity email acknowledgement.",
      evidenceLinks: ["/api/mcp/backpressure-governor", "/api/slo-incident-command"],
    }),
    scenario({
      id: "voice_reorder_burst",
      label: "Voice Reorder Burst",
      description: "Short voice session using saved address and go-to grocery items during meal-window load.",
      pilotUsers: 100,
      sessionsPerHour: 80,
      callsPerSession: 4,
      commercialShare: 0.08,
      retryAfterSeconds: 0,
      projected429sPerHour: 0,
      p95LatencyMs: 610,
      bottleneck: "Voice response length and repeated go-to item reads.",
      decision: "Use voice minimal reorder profile and suppress raw identifiers.",
      evidenceLinks: ["/api/channel-multimodal-studio", "/api/swiggy-route-optimizer"],
    }),
    scenario({
      id: "campaign_launch_spike",
      label: "Campaign Launch Spike",
      description: "Marketing-backed public launch spike that materially exceeds the access-form pilot profile.",
      pilotUsers: 1200,
      sessionsPerHour: 900,
      callsPerSession,
      commercialShare: 0.14,
      retryAfterSeconds: 23,
      projected429sPerHour: 36,
      p95LatencyMs: 1850,
      bottleneck: "Rate-limit headers and bespoke Swiggy capacity approval.",
      decision: "Do not launch without seven-day notice, capacity confirmation, and live Retry-After telemetry.",
      evidenceLinks: ["/api/traffic-readiness-plan", "/api/production-launch-bundle"],
    }),
  ];

  const lanes: SwiggyLoadLabLane[] = [
    ...traffic.lanes.map(laneFromTrafficLane),
    {
      id: "background_jobs_disabled",
      server: "all",
      lane: "background",
      expectedQps: 0,
      plannedCeiling: "External gate until Swiggy approves bespoke background capacity.",
      governor: "Drop hidden catalogue crawls and analytics jobs in local/staging mode.",
      status: "external_gate",
      evidenceLinks: ["/api/mcp/backpressure-governor", "/api/swiggy-growth-partnership"],
    },
  ];

  const cohortRamp: SwiggyLoadLabCohort[] = traffic.rollout.map((stage) => ({
    id: stage.id,
    label: stage.label,
    trafficPercent: stage.trafficPercent,
    users: stage.pilotUsers,
    entryGate: stage.entryCriteria[0] ?? "Entry gate pending.",
    rollbackSignal: stage.rollbackTrigger[0] ?? "Rollback signal pending.",
    status: stage.status === "manual_input" ? "watch" : stage.status,
  }));

  const drills: SwiggyLoadLabDrill[] = [
    {
      id: "retry_after_23s",
      label: "Retry-After 23s",
      trigger: "Future Swiggy MCP 429 includes Retry-After: 23.",
      expectedDecision: "Wait exactly 23 seconds, do not stack exponential backoff, and retry only if still inside 30s user budget.",
      proof: "Backpressure simulation planned_429_retry_after and Traffic Readiness retryAfterContract.",
      status: "ready",
    },
    {
      id: "commercial_single_flight",
      label: "Commercial Single Flight",
      trigger: "Two confirmations arrive for Food order and Instamart checkout in the same user turn.",
      expectedDecision: "Serialize place_food_order and checkout; status-check before retrying either one.",
      proof: "Route Optimizer separate_confirmation_locks plus Commercial Action Guard.",
      status: "ready",
    },
    {
      id: "tracking_loop_shed",
      label: "Tracking Loop Shed",
      trigger: "A UI refresh loop attempts tracking reads every two seconds.",
      expectedDecision: "Allow first read, defer remaining reads to the 10-second floor, and show last known ETA.",
      proof: "Backpressure tracking_bucket and tracking_poll_loop simulation.",
      status: "ready",
    },
    {
      id: "campaign_capacity_gate",
      label: "Campaign Capacity Gate",
      trigger: "Projected campaign traffic exceeds pilot forecast.",
      expectedDecision: "Block public launch until operator sends seven-day notice and Swiggy confirms capacity.",
      proof: "Traffic Readiness major_traffic_event notification and capacityUpgradeEmail.",
      status: "external_gate",
    },
  ];

  const externalGates = [
    "Swiggy must issue staging credentials before real load tests can hit MCP servers.",
    "MCP-layer 429, Retry-After, and X-RateLimit-* headers remain planned until Swiggy ships them live.",
    "Campaign-scale public launch requires seven-day notice and capacity confirmation from builders@swiggy.in.",
  ];
  const plannedHeaders = backpressure.plannedHeaders.map((header) => header.toLowerCase());

  const readyScore =
    scenarios.reduce((sum, item) => sum + statusWeight(item.status), 0) / scenarios.length * 35 +
    lanes.reduce((sum, item) => sum + statusWeight(item.status), 0) / lanes.length * 25 +
    cohortRamp.reduce((sum, item) => sum + statusWeight(item.status), 0) / cohortRamp.length * 20 +
    drills.reduce((sum, item) => sum + statusWeight(item.status), 0) / drills.length * 20;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round(readyScore),
    officialSources,
    mode: options.config.swiggyMode,
    totals: {
      scenarios: scenarios.length,
      maxPeakQps: Math.max(...scenarios.map((item) => item.peakQps)),
      maxToolCallsPerHour: Math.max(...scenarios.map((item) => item.toolCallsPerHour)),
      recommendedPilotUsers: traffic.projectedDailySessions,
      retryAfterReady: traffic.retryAfterContract.ready && plannedHeaders.includes("retry-after"),
      externalGates: externalGates.length,
    },
    scenarios,
    lanes,
    cohortRamp,
    drills,
    operatorActions: [
      {
        id: "record_staging_load",
        label: "Record staging load replay",
        owner: "Operator",
        status: "external_gate",
        evidence: "Requires Swiggy-issued staging credentials and seeded data.",
      },
      {
        id: "send_capacity_notice",
        label: "Send capacity notice",
        owner: "Operator",
        status: "watch",
        evidence: traffic.capacityUpgradeEmail.subject,
      },
      {
        id: "monitor_retry_headers",
        label: "Monitor Retry-After headers",
        owner: "MealPilot",
        status: "ready",
        evidence: backpressure.plannedHeaders.join(", "),
      },
      {
        id: "confirm_campaign_capacity",
        label: "Confirm campaign capacity",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Required before campaign_launch_spike can move beyond blocked state.",
      },
    ],
    assertions: [
      "Load Lab scenarios are derived from Traffic Readiness, Backpressure Governor, and Route Optimizer evidence.",
      "Commercial actions stay serialized under load; reads may be parallelized only when route optimizer marks them safe.",
      "Campaign-scale launch remains blocked until Swiggy confirms capacity and Retry-After telemetry is live.",
      "Tracking loops are shed to a 10-second floor and background jobs are dropped in developer-tier mode.",
    ],
    externalGates,
  };
}
