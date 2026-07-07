import type {
  RateLimitPlan,
  SloIncidentCommandCenter,
  SupportBridgeReport,
  SwiggyOperatingContractCenterReport,
  SwiggyOperatingContractPillar,
  SwiggyOperatingContractReadinessGate,
  SwiggyOperatingContractRehearsal,
  SwiggyOperatingContractRehearsalMode,
  SwiggyOperatingContractRunbook,
  TrafficReadinessPlan,
  VersionMonitor,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/versioning/",
  "https://mcp.swiggy.com/builders/docs/operate/changelog/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

function statusScore(status: "ready" | "watch" | "external_gate") {
  if (status === "ready") return 1;
  if (status === "watch") return 0.72;
  return 0.48;
}

function average(items: Array<{ status: "ready" | "watch" | "external_gate" }>) {
  if (items.length === 0) return 0;
  return items.reduce((sum, item) => sum + statusScore(item.status), 0) / items.length;
}

function buildPillars(options: {
  config: ServerConfig;
  rateLimit: RateLimitPlan;
  trafficReadiness: TrafficReadinessPlan;
  sloIncident: SloIncidentCommandCenter;
  supportBridge: SupportBridgeReport;
  version: VersionMonitor;
}): SwiggyOperatingContractPillar[] {
  const underLimitBudgets = options.rateLimit.budgets.filter((budget) => budget.status === "under_limit").length;
  const readyTrafficLanes = options.trafficReadiness.lanes.filter((lane) => lane.status === "ready").length;
  const readySloChecks = options.sloIncident.liveReadiness.filter((item) => item.status === "ready").length;
  const readyVersionAlerts = options.version.alerts.filter((alert) => alert.status === "ready").length;
  const supportReady = options.supportBridge.reportErrorTools.filter((tool) => tool.status === "ready").length;

  return [
    {
      id: "uptime_and_latency",
      label: "Uptime and Latency Contract",
      status: readySloChecks >= 4 ? "ready" : "watch",
      officialSignal:
        "Swiggy operating docs define production uptime, latency classes, maintenance handling, and status-page expectations.",
      mealPilotControl: `${options.sloIncident.uptimeTargets.length} uptime targets, ${options.sloIncident.latencyTargets.length} latency classes, status fallback, and S0-S3 comms are executable in SLO Incident Command.`,
      evidenceLinks: [officialSources[0], "/api/slo-incident-command", "/api/telemetry/runtime"],
    },
    {
      id: "rate_limit_and_backpressure",
      label: "Rate Limit and Backpressure Contract",
      status: underLimitBudgets >= options.rateLimit.budgets.length - 1 ? "ready" : "watch",
      officialSignal:
        "Swiggy rate-limit docs separate current upstream shedding from future 429, Retry-After, and X-RateLimit headers.",
      mealPilotControl: `${underLimitBudgets}/${options.rateLimit.budgets.length} rate budgets are under planned ceilings, with Retry-After fields reserved and commercial writes single-flight.`,
      evidenceLinks: [officialSources[1], "/api/rate-limit-plan", "/api/mcp/backpressure-governor"],
    },
    {
      id: "traffic_rollout",
      label: "Traffic Rollout Contract",
      status: readyTrafficLanes >= 5 ? "ready" : "watch",
      officialSignal:
        "Ship-to-production and rate-limit guidance require expected volume, staged rollout, major-event notice, and capacity-upgrade communication.",
      mealPilotControl: `${readyTrafficLanes}/${options.trafficReadiness.lanes.length} traffic lanes are launch-ready at ${options.trafficReadiness.peakQps.toFixed(2)} peak QPS with 1%-to-100% rollout stages.`,
      evidenceLinks: [officialSources[5], "/api/traffic-readiness-plan", "/api/swiggy-load-lab"],
    },
    {
      id: "support_and_reporting",
      label: "Support and Reporting Contract",
      status: supportReady === options.supportBridge.reportErrorTools.length ? "ready" : "watch",
      officialSignal:
        "Swiggy support docs route developer questions, production issues, responsible disclosure, and in-session report_error payloads through explicit channels.",
      mealPilotControl: `${supportReady}/${options.supportBridge.reportErrorTools.length} report_error payloads are prepared with redaction rules, builders@swiggy.in escalation copy, and support correlation ids.`,
      evidenceLinks: [officialSources[2], "/api/support/bridge", "/api/error-intelligence"],
    },
    {
      id: "version_and_deprecation",
      label: "Version and Deprecation Contract",
      status: readyVersionAlerts >= 2 ? "ready" : "watch",
      officialSignal:
        "Swiggy versioning and changelog docs require route pinning, implementation.version capture, deprecation metadata watch, and roadmap-aware migration.",
      mealPilotControl: `Routes are pinned to ${options.version.currentMajor}, ${readyVersionAlerts}/${options.version.alerts.length} version alerts are ready, and the ${options.version.deprecationWindowDays}-day deprecation window is launch-bundle visible.`,
      evidenceLinks: [officialSources[3], officialSources[4], "/api/version-monitor", "/api/swiggy-upstream-watch"],
    },
    {
      id: "credential_and_mode_boundary",
      label: "Credential and Mode Boundary",
      status: options.config.swiggyClientId === "replace_after_builder_access" ? "external_gate" : "ready",
      officialSignal:
        "Production access, staging credentials, exact redirect allowlisting, and approved traffic are Swiggy-controlled gates.",
      mealPilotControl:
        options.config.swiggyClientId === "replace_after_builder_access"
          ? "Local mock proof is complete; staging credentials, production client id, redirect URI, and 48-hour soak remain external gates."
          : "Swiggy client id is configured; OAuth and gateway surfaces can move from mock proof into staging validation.",
      evidenceLinks: [officialSources[5], "/api/sandbox-credential-workbench", "/api/mcp-gateway"],
    },
  ];
}

function buildRunbooks(): SwiggyOperatingContractRunbook[] {
  return [
    {
      id: "s0_outage",
      label: "S0 production outage",
      owner: "Joint",
      status: "ready",
      trigger: "MealPilot production users cannot complete Swiggy Food, Instamart, or Dineout flows.",
      action:
        "Freeze commercial retries, capture request ids and affected tool names, open SLO Incident Command, prepare Support Bridge report, and email builders@swiggy.in.",
      evidenceLinks: ["/api/slo-incident-command", "/api/support/bridge", "/api/error-intelligence"],
    },
    {
      id: "rate_limit_spike",
      label: "Rate-limit or upstream-shedder spike",
      owner: "MealPilot",
      status: "ready",
      trigger: "UPSTREAM_ERROR spike today, or future 429/Retry-After/X-RateLimit headers appear in telemetry.",
      action:
        "Activate Backpressure Governor, honor Retry-After directly, coalesce reads, serialize writes, and send capacity-upgrade email if projected launch traffic exceeds planned ceilings.",
      evidenceLinks: ["/api/mcp/backpressure-governor", "/api/traffic-readiness-plan", "/api/swiggy-load-lab"],
    },
    {
      id: "support_payload",
      label: "In-session support report",
      owner: "MealPilot",
      status: "ready",
      trigger: "User reports a failed confirmed action or repeated degraded result quality.",
      action:
        "Call report_error on the affected server with redacted toolContext, session id, flow description, expected versus actual behavior, and user-safe notes.",
      evidenceLinks: ["/api/support/bridge", "/api/swiggy-cancellation-care-center"],
    },
    {
      id: "version_migration",
      label: "Version or deprecation migration",
      owner: "MealPilot",
      status: "watch",
      trigger: "Changelog, implementation.version, signed manifest, or _meta.swiggy.deprecation indicates a new route or retiring field.",
      action:
        "Pin current v1 routes, open Upstream Watch action queue, update Tool Contract Matrix fixtures, run production verifier, and add launch-bundle migration evidence.",
      evidenceLinks: ["/api/version-monitor", "/api/swiggy-upstream-watch", "/api/mcp/tool-contract-matrix"],
    },
  ];
}

function buildReadinessGates(options: {
  config: ServerConfig;
  trafficReadiness: TrafficReadinessPlan;
  sloIncident: SloIncidentCommandCenter;
}): SwiggyOperatingContractReadinessGate[] {
  return [
    {
      id: "local_contract_pack",
      label: "Local operating contract pack",
      status: "ready",
      proof: "OpenAPI, production verifier, SLO Command, Support Bridge, Traffic Readiness, Rate-limit Plan, Backpressure Governor, Version Monitor, and Launch Bundle are runnable locally.",
      nextAction: "Attach the operating contract endpoint and latest verifier output to the Swiggy Builders access packet.",
    },
    {
      id: "staging_credentials",
      label: "Staging credential validation",
      status: options.config.swiggyClientId === "replace_after_builder_access" ? "external_gate" : "ready",
      proof: "OAuth client id, redirect URI allowlist, seeded data, and bearer-token routing are required before real Swiggy probes.",
      nextAction: "Move MCP Gateway from mock to staging, then run read-only probes and 48-hour soak evidence.",
    },
    {
      id: "capacity_notice",
      label: "Capacity and event notice",
      status: options.trafficReadiness.notifications.every((notification) => notification.status === "ready") ? "ready" : "watch",
      proof: `${options.trafficReadiness.notifications.length} notification rows describe lead time, channel, and evidence for launch or spike traffic.`,
      nextAction: "Send the capacity-upgrade email before campaign traffic or bespoke background workloads.",
    },
    {
      id: "status_page_readiness",
      label: "Status-page fallback",
      status: options.sloIncident.statusPage.status === "ready" ? "ready" : "watch",
      proof: options.sloIncident.statusPage.mealPilotFallback,
      nextAction: "Switch to official Swiggy status-page polling once the v1.1 status surface is live.",
    },
    {
      id: "production_approval",
      label: "Production approval",
      status: "external_gate",
      proof: "Swiggy must approve production credentials, capacity, co-branding, and any enterprise support lanes.",
      nextAction: "Submit the Builder packet and keep all live commerce execution gated until approval arrives.",
    },
  ];
}

function buildLaunchEmail(options: { trafficReadiness: TrafficReadinessPlan; sloIncident: SloIncidentCommandCenter }) {
  return {
    to: "builders@swiggy.in",
    subject: "MealPilot Swiggy operating contract evidence",
    body: [
      "Hello Swiggy Builders team,",
      "",
      "MealPilot has prepared an operating contract packet for production-access review.",
      "",
      `- Target uptime: ${options.sloIncident.uptimeTargets.map((target) => `${target.scope} ${target.target}`).join("; ")}`,
      `- Traffic plan: ${options.trafficReadiness.projectedDailySessions} daily sessions, ${options.trafficReadiness.projectedDailyToolCalls} daily tool calls, ${options.trafficReadiness.peakQps.toFixed(2)} peak QPS`,
      "- Evidence: /api/swiggy-operating-contract-center, /api/slo-incident-command, /api/traffic-readiness-plan, /api/mcp/backpressure-governor, /api/support/bridge, /api/version-monitor",
      "",
      "Please review the attached operating contract, staging credential gates, and capacity notification plan.",
    ].join("\n"),
  };
}

export function buildSwiggyOperatingContractCenter(options: {
  config: ServerConfig;
  rateLimit: RateLimitPlan;
  trafficReadiness: TrafficReadinessPlan;
  sloIncident: SloIncidentCommandCenter;
  supportBridge: SupportBridgeReport;
  version: VersionMonitor;
}): SwiggyOperatingContractCenterReport {
  const pillars = buildPillars(options);
  const runbooks = buildRunbooks();
  const readinessGates = buildReadinessGates(options);
  const score = Math.round((average(pillars) * 0.5 + average(runbooks) * 0.25 + average(readinessGates) * 0.25) * 100);
  const readyPillars = pillars.filter((pillar) => pillar.status === "ready").length;
  const externalGates = [...pillars, ...runbooks, ...readinessGates].filter((item) => item.status === "external_gate").length;

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    contractSignal: {
      currentMode: options.config.swiggyMode,
      operatingVersion: "v1.0",
      targetUptime: "99.9%",
      deprecationWindowDays: options.version.deprecationWindowDays,
      summary:
        "Swiggy operate docs are consolidated into one reviewer contract for uptime, rate limits, support, versioning, launch traffic, and external credential gates.",
    },
    totals: {
      pillars: pillars.length,
      runbooks: runbooks.length,
      readinessGates: readinessGates.length,
      readyPillars,
      externalGates,
    },
    pillars,
    runbooks,
    readinessGates,
    launchEmail: buildLaunchEmail(options),
    assertions: [
      "Every operating contract pillar links to an official Swiggy operate or ship-to-production source.",
      "Current v1.0 upstream-shedder behavior is kept separate from future 429 and X-RateLimit headers.",
      "Support reports carry redacted context and never include OAuth tokens, raw payment data, full addresses, or full order payloads.",
      "Production traffic, staging credentials, status-page polling, capacity upgrades, and enterprise support lanes remain Swiggy external gates.",
    ],
    externalGates: [
      "Swiggy staging credentials and seeded accounts are required for live operating-contract proof.",
      "Production client id, exact redirect URI, capacity approval, and 48-hour soak are Swiggy approval gates.",
      "Official status-page polling and partner escalation lanes depend on Swiggy v1.1 or enterprise agreement availability.",
    ],
  };
}

export function rehearseSwiggyOperatingContract(options: {
  config: ServerConfig;
  rateLimit: RateLimitPlan;
  trafficReadiness: TrafficReadinessPlan;
  sloIncident: SloIncidentCommandCenter;
  supportBridge: SupportBridgeReport;
  version: VersionMonitor;
  mode: SwiggyOperatingContractRehearsalMode;
  includeCapacityNotice: boolean;
  includeSupportPacket: boolean;
  includeVersionWatch: boolean;
  includeStatusPageFallback: boolean;
  includeStagingCredentials: boolean;
}): SwiggyOperatingContractRehearsal {
  const contract = buildSwiggyOperatingContractCenter(options);
  const missingInputs: string[] = [];
  const gateById = new Map(contract.readinessGates.map((gate) => [gate.id, gate]));
  const pillarById = new Map(contract.pillars.map((pillar) => [pillar.id, pillar]));

  if (options.mode !== "local_packet" && options.includeCapacityNotice && gateById.get("capacity_notice")?.status !== "ready") {
    missingInputs.push("capacity notice evidence");
  }
  if (options.mode !== "local_packet" && options.includeSupportPacket && pillarById.get("support_and_reporting")?.status !== "ready") {
    missingInputs.push("support packet evidence");
  }
  if (!options.includeVersionWatch && options.mode !== "local_packet") {
    missingInputs.push("version/deprecation watch");
  }
  if (options.mode !== "local_packet" && options.includeStatusPageFallback && gateById.get("status_page_readiness")?.status !== "ready") {
    missingInputs.push("status-page fallback readiness");
  }
  if (options.includeStagingCredentials && gateById.get("staging_credentials")?.status !== "ready") {
    missingInputs.push("Swiggy staging credentials");
  }
  if (options.mode === "production_launch" && gateById.get("production_approval")?.status !== "ready") {
    missingInputs.push("Swiggy production approval");
  }

  const selectedPillars =
    options.mode === "local_packet"
      ? contract.pillars
      : contract.pillars.filter((pillar) =>
          ["rate_limit_and_backpressure", "traffic_rollout", "support_and_reporting", "credential_and_mode_boundary"].includes(
            pillar.id,
          ),
        );
  const selectedGates =
    options.mode === "production_launch"
      ? contract.readinessGates
      : contract.readinessGates.filter((gate) => gate.id !== "production_approval");
  const selectedRunbooks =
    options.mode === "local_packet"
      ? contract.runbooks
      : contract.runbooks.filter((runbook) => runbook.id !== "version_migration" || options.includeVersionWatch);

  const decision: SwiggyOperatingContractRehearsal["decision"] =
    missingInputs.includes("Swiggy production approval") || missingInputs.includes("Swiggy staging credentials")
      ? "blocked_operating_gate"
      : missingInputs.length > 0
        ? "manual_launch_gate"
        : "ready_operating_packet";

  return {
    generatedAt: new Date().toISOString(),
    decision,
    readinessScore: contract.score,
    mode: options.mode,
    includeCapacityNotice: options.includeCapacityNotice,
    includeSupportPacket: options.includeSupportPacket,
    includeVersionWatch: options.includeVersionWatch,
    includeStatusPageFallback: options.includeStatusPageFallback,
    includeStagingCredentials: options.includeStagingCredentials,
    selectedPillars,
    selectedRunbooks,
    selectedGates,
    launchEmail: contract.launchEmail,
    commands: [
      {
        command: "curl -fsS http://localhost:8787/api/swiggy-operating-contract-center",
        proves: "SLA, rate-limit, support, versioning, and launch gates are consolidated.",
      },
      {
        command: "curl -fsS http://localhost:8787/api/slo-incident-command",
        proves: "S0-S3 support and 99.9% uptime evidence is ready.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Operating contract, capacity, support, and launch-bundle gates remain covered.",
      },
    ],
    missingInputs,
    telemetry: [
      { field: "mode", value: options.mode, redaction: "safe launch-readiness mode" },
      { field: "current_mode", value: contract.contractSignal.currentMode, redaction: "safe environment enum" },
      { field: "target_uptime", value: contract.contractSignal.targetUptime, redaction: "aggregate target only" },
      { field: "selected_pillars", value: String(selectedPillars.length), redaction: "aggregate count only" },
      { field: "external_gates", value: String(contract.totals.externalGates), redaction: "aggregate count only" },
    ],
    assertions: [
      "The rehearsal produces local operating evidence only; it never sends email, requests credentials, or claims Swiggy approval.",
      "Staging credentials and production launch remain explicit Swiggy gates until official access is issued.",
      "Support payloads are represented as redacted packet evidence and never include OAuth tokens, full addresses, or payment data.",
      "Rate-limit handling keeps current upstream shedding separate from future 429, Retry-After, and X-RateLimit headers.",
    ],
    nextAction:
      decision === "ready_operating_packet"
        ? "Attach the operating contract packet, latest production verifier output, and launch email draft to the access handoff."
        : decision === "manual_launch_gate"
          ? `Resolve ${missingInputs.join(", ")} before presenting the operating contract packet.`
          : `Keep launch blocked on ${missingInputs.join(", ")} and use the local packet as evidence only.`,
  };
}
