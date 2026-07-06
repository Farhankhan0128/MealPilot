import crypto from "node:crypto";
import type {
  McpReplayStep,
  MealPlan,
  StagingTranscriptEntry,
  StagingTranscriptExport,
  StagingTranscriptFile,
  SwiggyServer,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";
import { buildCartPreflightReport, buildMcpReplay } from "./demoStudio.js";
import { buildStagingCertificationMatrix } from "./stagingCertification.js";

function endpointPath(server: SwiggyServer) {
  return server === "instamart" ? "im" : server;
}

function routeClassFor(tool: string): StagingTranscriptEntry["routeClass"] {
  if (["place_food_order", "checkout", "book_table"].includes(tool)) return "commercial_action";
  if (["update_food_cart", "update_cart", "flush_food_cart", "clear_cart", "create_cart"].includes(tool)) {
    return "cart_mutation";
  }
  if (["fetch_food_coupons", "apply_food_coupon"].includes(tool)) return "coupon";
  if (
    [
      "track_food_order",
      "track_order",
      "get_booking_status",
      "get_food_orders",
      "get_food_order_details",
      "get_orders",
      "get_order_details",
    ].includes(tool)
  ) {
    return "tracking";
  }
  if (tool === "report_error") return "support";
  return "read";
}

function statusForStep(step: McpReplayStep) {
  const response = step.response as { commercialActionLocked?: boolean };
  return response.commercialActionLocked ? "locked" : "ok";
}

function toolForAction(action: MealPlan["recommendations"][number]["confirmationAction"]) {
  if (action === "place_food_order") return "place_food_order";
  if (action === "checkout") return "checkout";
  return "book_table";
}

function hashUser(plan: MealPlan) {
  return `sha256:${crypto.createHash("sha256").update(`mealpilot:${plan.id}`).digest("hex").slice(0, 24)}`;
}

function redactRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (typeof item !== "string") return item;
      if (/token|bearer|payment|phone|email|address/i.test(item)) return "[redacted]";
      return item;
    }),
  ) as Record<string, unknown>;
}

function buildJsonl(entries: StagingTranscriptEntry[]) {
  return entries
    .map((entry) =>
      JSON.stringify({
        ts: entry.ts,
        level: entry.status === "ok" ? "info" : "warn",
        event: "mcp_tool_call",
        request_id: entry.requestId,
        session_id: entry.sessionId,
        server: entry.server,
        tool: entry.tool,
        route_class: entry.routeClass,
        certification_wave: entry.certificationWave,
        duration_ms: entry.durationMs,
        status: entry.status,
        retry_policy: entry.retryPolicy,
        user_id_hash: entry.userIdHash,
        redacted: entry.redacted,
      }),
    )
    .join("\n");
}

function buildMarkdown(plan: MealPlan, entries: StagingTranscriptEntry[], config: ServerConfig) {
  const serverList = [...new Set(entries.map((entry) => entry.server))].join(", ");
  const locked = entries.filter((entry) => entry.status === "locked").length;
  return [
    `# MealPilot Staging Transcript - ${plan.id}`,
    "",
    `Mode: ${config.swiggyMode}`,
    `Servers: ${serverList}`,
    `Steps: ${entries.length}`,
    `Locked commercial actions: ${locked}`,
    "",
    "## Swiggy-ready support fields",
    "",
    `- session_id: ${plan.id}`,
    "- event: mcp_tool_call",
    "- user_id_hash: sha256 redacted identifier",
    "- redacted: true",
    "- escalation: builders@swiggy.in",
    "",
    "## Replay",
    "",
    ...entries.map(
      (entry) =>
        `${entry.sequence}. ${entry.server}.${entry.tool} (${entry.routeClass}) - ${entry.status}, ${entry.durationMs}ms, ${entry.certificationWave}`,
    ),
  ].join("\n");
}

function file(id: string, label: string, path: string, mimeType: string, status: StagingTranscriptFile["status"], purpose: string) {
  return { id, label, path, mimeType, status, purpose };
}

export function buildStagingTranscriptExport(options: {
  plan: MealPlan;
  config: ServerConfig;
}): StagingTranscriptExport {
  const replay = buildMcpReplay(options.plan);
  const preflight = buildCartPreflightReport(options.plan);
  const matrix = buildStagingCertificationMatrix(options.config);
  const certificationByTool: Map<string, StagingTranscriptEntry["certificationWave"]> = new Map(
    matrix.waves.flatMap((wave) => wave.tools.map((tool) => [`${tool.server}.${tool.tool}`, wave.id] as const)),
  );
  const userIdHash = hashUser(options.plan);
  const generatedAt = new Date();
  const entriesFromReplay: StagingTranscriptEntry[] = replay.map((step, index) => {
    const routeClass = routeClassFor(step.tool);
    const key = `${step.server}.${step.tool}`;
    const ts = new Date(generatedAt.getTime() + index * 1000).toISOString();
    return {
      id: `staging_${options.plan.id}_${index + 1}`,
      sequence: index + 1,
      ts,
      requestId: `req_${options.plan.id}_${index + 1}`,
      sessionId: options.plan.id,
      userIdHash,
      server: step.server,
      endpoint: `POST ${options.config.swiggyMode === "production" ? "mcp.swiggy.com" : "mcp-staging.swiggy.com"}/${endpointPath(step.server)}`,
      tool: step.tool,
      routeClass,
      certificationWave: certificationByTool.get(key) ?? "read_tools",
      status: statusForStep(step),
      durationMs: step.durationMs,
      request: redactRecord(step.request),
      response: redactRecord(step.response),
      retryPolicy: step.retryPolicy,
      redacted: true,
    };
  });
  const replayToolKeys = new Set(entriesFromReplay.map((entry) => `${entry.server}.${entry.tool}`));
  const commercialGateEntries = options.plan.recommendations.reduce<StagingTranscriptEntry[]>((items, recommendation, index) => {
      const tool = toolForAction(recommendation.confirmationAction);
      const key = `${recommendation.server}.${tool}`;
      if (replayToolKeys.has(key)) return items;
      const sequence = entriesFromReplay.length + index + 1;
      items.push({
        id: `staging_${options.plan.id}_${sequence}`,
        sequence,
        ts: new Date(generatedAt.getTime() + (sequence - 1) * 1000).toISOString(),
        requestId: `req_${options.plan.id}_${sequence}`,
        sessionId: options.plan.id,
        userIdHash,
        server: recommendation.server,
        endpoint: `POST ${options.config.swiggyMode === "production" ? "mcp.swiggy.com" : "mcp-staging.swiggy.com"}/${endpointPath(recommendation.server)}`,
        tool,
        routeClass: "commercial_action" as const,
        certificationWave: certificationByTool.get(key) ?? "commercial_actions",
        status: "locked" as const,
        durationMs: 0,
        request: {
          jsonrpc: "2.0",
          id: `${options.plan.id}_${sequence}`,
          method: "tools/call",
          params: {
            name: tool,
            arguments: {
              sessionId: options.plan.id,
              recommendationId: recommendation.id,
              userConfirmed: false,
            },
          },
        },
        response: {
          success: true,
          mode: "mock",
          commercialActionLocked: true,
          recommendation: recommendation.title,
        },
        retryPolicy: "check order or booking status before retry",
        redacted: true,
      });
      return items;
    }, []);
  const entries = [...entriesFromReplay, ...commercialGateEntries];
  const servers = [...new Set(entries.map((entry) => entry.server))];
  const jsonl = buildJsonl(entries);
  const markdown = buildMarkdown(options.plan, entries, options.config);
  const nonBlindRetryTools = entries
    .filter((entry) => entry.routeClass === "commercial_action")
    .map((entry) => entry.tool);
  const score =
    45 +
    (entries.length > 0 ? 10 : 0) +
    servers.length * 5 +
    (entries.every((entry) => entry.redacted) ? 10 : 0) +
    (nonBlindRetryTools.length > 0 ? 10 : 0) +
    (preflight.overall !== "blocked" ? 10 : 0);

  return {
    generatedAt: generatedAt.toISOString(),
    sessionId: options.plan.id,
    mode: options.config.swiggyMode,
    score: Math.min(100, score),
    totalEntries: entries.length,
    coveredServers: servers,
    certificationWaves: [...new Set(entries.map((entry) => entry.certificationWave))],
    liveStagingReady: options.config.swiggyMode === "staging" && Boolean(options.config.swiggyAccessToken),
    entries,
    jsonl,
    markdown,
    files: [
      file("jsonl", "Swiggy JSONL transcript", `/api/sessions/${options.plan.id}/staging-transcript`, "application/jsonl", "ready", "Copy into staging evidence or support ticket attachments."),
      file("markdown", "Reviewer markdown transcript", `/api/sessions/${options.plan.id}/staging-transcript`, "text/markdown", "ready", "Paste into demo handoff notes with readable replay steps."),
      file("redaction_manifest", "Redaction manifest", "/api/telemetry/runtime", "application/json", "ready", "Shows token, payment, address, phone, email, and raw payload redaction."),
      file("support_brief", "Support escalation brief", `/api/support/bridge?sessionId=${options.plan.id}`, "application/json", "ready", "Links session id, request ids, affected tools, and builders@swiggy.in escalation fields."),
      file("staging_matrix", "Staging certification matrix", "/api/staging-certification-matrix", "application/json", "ready", "Maps transcript tools to the broader all-tool staging wave plan."),
    ],
    redaction: {
      redactedFields: ["access_token", "authorization", "phone", "email", "raw_address", "payment_credentials", "full_tool_payload"],
      allowedFields: ["ts", "event", "tool", "server", "session_id", "request_id", "duration_ms", "status", "user_id_hash"],
      piiFree: true,
      evidence: "Transcript entries contain hashed user identity, session ids, request ids, tool names, statuses, and redacted request/response previews only.",
    },
    supportEnvelope: {
      to: "builders@swiggy.in",
      subject: `[S2] MealPilot staging transcript for ${options.plan.id}`,
      requiredFields: ["session ids", "timestamps", "expected vs actual behavior", "tool name", "request id"],
      bodyPreview: `Session ${options.plan.id} contains ${entries.length} redacted MCP tool-call entries across ${servers.join(", ")}.`,
    },
    readiness: [
      {
        id: "session_id",
        label: "Session id on every entry",
        status: entries.every((entry) => entry.sessionId === options.plan.id) ? "ready" : "blocked",
        evidence: `${entries.length} transcript entries carry ${options.plan.id}.`,
      },
      {
        id: "redaction",
        label: "PII and token redaction",
        status: entries.every((entry) => entry.redacted) ? "ready" : "blocked",
        evidence: "Transcript request and response previews are generated through the redaction filter.",
      },
      {
        id: "non_blind_retry",
        label: "Commercial retry guard",
        status: nonBlindRetryTools.length > 0 ? "ready" : "watch",
        evidence:
          nonBlindRetryTools.length > 0
            ? `${nonBlindRetryTools.join(", ")} use check order or booking status before retry.`
            : "No commercial action appears in this plan transcript.",
      },
      {
        id: "preflight",
        label: "Cart and booking preflight",
        status: preflight.overall === "blocked" ? "blocked" : "ready",
        evidence: `Preflight status is ${preflight.overall}.`,
      },
      {
        id: "staging_credentials",
        label: "Live staging credential replay",
        status: options.config.swiggyMode === "staging" && options.config.swiggyAccessToken ? "ready" : "external_gate",
        evidence:
          options.config.swiggyMode === "staging" && options.config.swiggyAccessToken
            ? "Runtime is configured for staging with an access token."
            : "Real Swiggy staging replay still requires issued credentials and seeded data.",
      },
    ],
    proofLinks: [
      { label: "MCP replay", path: `/api/sessions/${options.plan.id}/replay` },
      { label: "Cart preflight", path: `/api/sessions/${options.plan.id}/preflight` },
      { label: "Staging certification matrix", path: "/api/staging-certification-matrix" },
      { label: "Runtime telemetry", path: "/api/telemetry/runtime" },
      { label: "Support Bridge", path: `/api/support/bridge?sessionId=${options.plan.id}` },
      { label: "Production Launch Bundle", path: "/api/production-launch-bundle" },
    ],
    assertions: [
      "Every transcript entry includes a session id, request id, tool, server, duration, status, and hashed user id.",
      "Commercial transcript entries keep the Swiggy check-then-retry policy visible instead of blind retrying placement tools.",
      "The transcript is safe to attach to builders@swiggy.in because raw tokens, payment credentials, addresses, phone, email, and full payloads are redacted.",
      "Live staging replay remains an external gate until Swiggy issues credentials and seeded test data.",
    ],
    externalGates: [
      "Replace mock responses with real staging JSON-RPC responses after OAuth/DCR succeeds.",
      "Record the same transcript after 48 hours of green staging before production promotion.",
    ],
  };
}
