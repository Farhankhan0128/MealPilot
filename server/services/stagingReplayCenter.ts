import crypto from "node:crypto";
import type { ServerConfig } from "../config.js";
import type { JsonRpcRequest } from "../mock/swiggyToolRouter.js";
import type {
  StagingCertificationMatrix,
  StagingCertificationTool,
  SwiggyServer,
  SwiggyStagingReplayCenter,
  SwiggyStagingReplayDecision,
  SwiggyStagingReplayExecution,
  SwiggyStagingReplayProbe,
  SwiggyStagingReplayStatus,
} from "../../src/domain/types.js";
import { buildMcpGatewayStatus, type RuntimeCredentialState } from "./mcpGateway.js";
import { buildStagingCertificationMatrix } from "./stagingCertification.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/docs/start/developer/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

const safeReplayKeys = new Set([
  "food.get_addresses",
  "food.search_restaurants",
  "food.search_menu",
  "food.get_food_cart",
  "food.get_food_orders",
  "food.get_food_order_details",
  "food.track_food_order",
  "food.report_error",
  "instamart.get_addresses",
  "instamart.search_products",
  "instamart.get_cart",
  "instamart.get_orders",
  "instamart.get_order_details",
  "instamart.track_order",
  "instamart.report_error",
  "dineout.get_saved_locations",
  "dineout.search_restaurants_dineout",
  "dineout.get_booking_status",
  "dineout.report_error",
]);

function endpointPath(server: SwiggyServer) {
  return server === "instamart" ? "im" : server;
}

function toolKey(tool: Pick<StagingCertificationTool, "server" | "tool">) {
  return `${tool.server}.${tool.tool}`;
}

function responseHash(response: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(response)).digest("hex").slice(0, 16);
}

function isSafeReplayTool(tool: StagingCertificationTool) {
  return safeReplayKeys.has(toolKey(tool));
}

function statusForTool(config: ServerConfig, hasToken: boolean, tool: StagingCertificationTool): SwiggyStagingReplayStatus {
  if (!isSafeReplayTool(tool)) return tool.routeClass === "commercial_action" ? "swiggy_gate" : "blocked";
  if (config.swiggyMode === "mock") return "dry_run";
  return hasToken ? "ready" : "blocked";
}

function nextActionForStatus(status: SwiggyStagingReplayStatus) {
  if (status === "ready") return "Run the safe JSON-RPC probe against Swiggy staging and attach request id, latency, and schema proof.";
  if (status === "dry_run") return "Use the local mock replay as reviewer proof, then repeat against staging after OAuth credentials arrive.";
  if (status === "swiggy_gate") return "Wait for seeded staging data, explicit confirmation evidence, and Swiggy approval before execution.";
  return "Complete OAuth and staging token setup before this replay can route to Swiggy.";
}

function buildReplayRequest(tool: StagingCertificationTool, args: Record<string, unknown> = {}) {
  return {
    jsonrpc: "2.0" as const,
    method: "tools/call" as const,
    params: {
      name: tool.tool,
      arguments: args,
    },
  };
}

function score(statuses: SwiggyStagingReplayStatus[]) {
  const raw = statuses.reduce((sum, status) => {
    if (status === "ready") return sum + 1;
    if (status === "dry_run") return sum + 0.86;
    if (status === "swiggy_gate") return sum + 0.58;
    return sum + 0.25;
  }, 0);
  return Math.round((raw / statuses.length) * 100);
}

export function buildSwiggyStagingReplayCenter(options: {
  config: ServerConfig;
  credentials?: RuntimeCredentialState;
  certification?: StagingCertificationMatrix;
}): SwiggyStagingReplayCenter {
  const credentials = options.credentials ?? {};
  const certification = options.certification ?? buildStagingCertificationMatrix(options.config);
  const gateway = buildMcpGatewayStatus(options.config, credentials);
  const accessToken = credentials.accessToken ?? options.config.swiggyAccessToken;
  const hasToken = Boolean(accessToken);
  const tools = certification.waves.flatMap((wave) => wave.tools);
  const safeTools = tools.filter(isSafeReplayTool);
  const commercialTools = tools.filter((tool) => tool.routeClass === "commercial_action");
  const supportTools = tools.filter((tool) => tool.routeClass === "support");
  const probes: SwiggyStagingReplayProbe[] = safeTools.map((tool) => ({
    id: `${tool.server}_${tool.tool}_replay`,
    server: tool.server,
    tool: tool.tool,
    waveId: tool.waveId,
    routeClass: tool.routeClass,
    status: statusForTool(options.config, hasToken, tool),
    dryRunRequest: buildReplayRequest(tool),
    expectedEvidence: tool.expectedEvidence,
    proofLinks: ["/api/staging-certification-matrix", "/api/mcp/staging-cutover", "/api/telemetry/runtime"],
  }));
  const probeStatuses = probes.map((probe) => probe.status);

  return {
    generatedAt: new Date().toISOString(),
    score: score([...probeStatuses, ...(commercialTools.length ? ["swiggy_gate" as const] : [])]),
    officialSources,
    mode: gateway.mode,
    activeTransport: gateway.activeTransport,
    totals: {
      waves: certification.waves.length,
      totalTools: certification.totalTools,
      dryRunTools: options.config.swiggyMode === "mock" ? safeTools.length : 0,
      credentialedTools: options.config.swiggyMode !== "mock" && hasToken ? safeTools.length : 0,
      blockedLiveTools: options.config.swiggyMode === "mock" || hasToken ? commercialTools.length : tools.length,
      safeReplayTools: safeTools.length,
      commercialTools: commercialTools.length,
      supportTools: supportTools.length,
      servers: gateway.requestedServers.length,
      routableServers: gateway.requestedServers.filter((server) => server.status !== "blocked").length,
    },
    waveReadiness: certification.waves.map((wave) => {
      const waveSafeTools = wave.tools.filter(isSafeReplayTool);
      const statuses = waveSafeTools.map((tool) => statusForTool(options.config, hasToken, tool));
      const executableNow = statuses.filter((status) => status === "ready" || status === "dry_run").length;
      const status: SwiggyStagingReplayStatus =
        wave.tools.some((tool) => tool.routeClass === "commercial_action")
          ? "swiggy_gate"
          : executableNow > 0
            ? options.config.swiggyMode === "mock"
              ? "dry_run"
              : "ready"
            : wave.tools.length === 0
              ? wave.status === "production_gate"
                ? "swiggy_gate"
                : "dry_run"
              : "blocked";
      return {
        id: wave.id,
        label: wave.title,
        status,
        tools: wave.tools.length,
        executableNow,
        nextAction: nextActionForStatus(status),
      };
    }),
    serverReadiness: gateway.requestedServers.map((serverStatus) => {
      const serverTools = tools.filter((tool) => tool.server === serverStatus.server);
      const firstSafeTool = safeTools.find((tool) => tool.server === serverStatus.server)?.tool ?? "report_error";
      const status: SwiggyStagingReplayStatus =
        options.config.swiggyMode === "mock" ? "dry_run" : serverStatus.status === "routable" ? "ready" : "blocked";
      return {
        server: serverStatus.server,
        endpoint: serverStatus.endpoint,
        status,
        tools: serverTools.length,
        firstSafeTool,
        nextAction: nextActionForStatus(status),
      };
    }),
    replayProbes: probes,
    replayCommands: [
      {
        id: "inspect",
        command: "curl http://localhost:8787/api/swiggy-staging-replay",
        proves: "Shows safe replay probes, commercial gates, credential state, and Swiggy handoff packet.",
      },
      {
        id: "safe_mock_replay",
        command:
          "curl -X POST http://localhost:8787/api/swiggy-staging-replay/run -H 'Content-Type: application/json' -d '{\"server\":\"food\",\"tool\":\"get_addresses\"}'",
        proves: "Executes the first Food read-only probe in mock mode or credentialed staging mode.",
      },
      {
        id: "commercial_block",
        command:
          "curl -X POST http://localhost:8787/api/swiggy-staging-replay/run -H 'Content-Type: application/json' -d '{\"server\":\"food\",\"tool\":\"place_food_order\"}'",
        proves: "Commercial actions are blocked by the replay center until seeded staging and explicit confirmation gates pass.",
      },
    ],
    handoffPacket: {
      to: "builders@swiggy.in",
      subject: "MealPilot credentialed staging replay evidence",
      body:
        "MealPilot now exposes /api/swiggy-staging-replay and /api/swiggy-staging-replay/run for safe, token-aware replay proof. Local mock runs are marked as dry-run; staging/production routes require OAuth bearer state and commercial actions remain blocked until Swiggy staging gates pass.",
      proofLinks: [
        "/api/swiggy-staging-replay",
        "/api/staging-certification-matrix",
        "/api/mcp/staging-cutover",
        "/api/swiggy-staging-credential-drill",
        "/api/telemetry/runtime",
      ],
    },
    assertions: [
      "Only read, tracking, cart-read, and report_error tools are executable through the staging replay endpoint.",
      "Mock replay is explicitly labelled dry_run and never presented as live Swiggy staging evidence.",
      "Non-mock replay fails closed without a runtime or environment bearer token.",
      "Commercial actions remain blocked from replay until seeded staging data, visible confirmation, and Swiggy approval are present.",
      "Every replay response emits redaction telemetry and a response hash instead of raw credential material.",
    ],
    externalGates: [
      "Swiggy must issue staging OAuth credentials before live replay probes can route to MCP staging.",
      "Seeded staging accounts must exist for Food, Instamart, and Dineout before readback evidence is treated as credentialed.",
      "place_food_order, checkout, and book_table require explicit user confirmation, seeded staging inventory, and check-then-retry proof before execution.",
      "Production replay remains gated on Swiggy approval after the 48-hour staging soak.",
    ],
  };
}

export async function buildSwiggyStagingReplayExecution(options: {
  config: ServerConfig;
  credentials?: RuntimeCredentialState;
  server: SwiggyServer;
  tool: string;
  toolArguments?: Record<string, unknown>;
  executeTool: (server: SwiggyServer, request: JsonRpcRequest) => Promise<unknown>;
}): Promise<SwiggyStagingReplayExecution> {
  const certification = buildStagingCertificationMatrix(options.config);
  const tool = certification.waves
    .flatMap((wave) => wave.tools)
    .find((candidate) => candidate.server === options.server && candidate.tool === options.tool);
  const request = {
    ...buildReplayRequest(
      tool ?? {
        id: `${options.server}_${options.tool}`,
        server: options.server,
        endpoint: `/api/mcp/${options.server}`,
        stagingEndpoint: `POST mcp-staging.swiggy.com/${endpointPath(options.server)}`,
        tool: options.tool,
        stage: "unknown",
        routeClass: "commercial_action",
        waveId: "commercial_actions",
        status: "requires_staging_credentials",
        localEvidence: "Unknown tool.",
        smokePrompt: "Unknown tool.",
        expectedEvidence: "Unknown tool.",
      },
      options.toolArguments ?? {},
    ),
    id: `staging-replay-${Date.now().toString(36)}`,
  } as JsonRpcRequest;
  const hasToken = Boolean(options.credentials?.accessToken ?? options.config.swiggyAccessToken);
  let decision: SwiggyStagingReplayDecision;

  if (!tool || !isSafeReplayTool(tool)) {
    decision = "blocked_unsafe_tool";
  } else if (options.config.swiggyMode !== "mock" && !hasToken) {
    decision = "blocked_missing_token";
  } else {
    decision = options.config.swiggyMode === "mock" ? "executed_mock" : "executed_staging";
  }

  const startedAt = Date.now();
  const response = decision === "executed_mock" || decision === "executed_staging" ? await options.executeTool(options.server, request) : undefined;
  const latencyMs = Date.now() - startedAt;

  return {
    generatedAt: new Date().toISOString(),
    decision,
    server: options.server,
    tool: options.tool,
    waveId: tool?.waveId,
    routeClass: tool?.routeClass,
    request: {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: options.tool,
        arguments: options.toolArguments ?? {},
      },
    },
    responseHash: response ? responseHash(response) : undefined,
    responseAvailable: Boolean(response) && !(typeof response === "object" && response !== null && "error" in response),
    latencyMs,
    telemetry: [
      { field: "server", value: options.server, redaction: "plain enum" },
      { field: "tool", value: options.tool, redaction: "plain tool id" },
      { field: "raw_token_logged", value: "false", redaction: "tokens are never returned" },
      { field: "request_arguments_logged", value: "shape_only", redaction: "payload body is summarized by hash and schema" },
      { field: "mode", value: options.config.swiggyMode, redaction: "plain enum" },
    ],
    nextAction:
      decision === "blocked_unsafe_tool"
        ? "Use Staging Certification Matrix commercial-action waves and explicit confirmation proof before attempting this tool."
        : decision === "blocked_missing_token"
          ? "Complete OAuth and rerun replay with a runtime bearer token."
          : "Attach the response hash, request id, latency, and schema evidence to the Swiggy staging replay packet.",
    assertions: [
      decision === "blocked_unsafe_tool"
        ? "Commercial or unknown tools are blocked by the replay endpoint."
        : "Replay execution stayed inside the approved safe tool allowlist.",
      "Replay output excludes raw bearer tokens, PKCE verifier, payment data, phone, email, and full address values.",
      "Commercial actions cannot be triggered through the replay endpoint without a separate confirmation-gated flow.",
    ],
  };
}
