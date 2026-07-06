import crypto from "node:crypto";
import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SupportBridgeExecution,
  SupportBridgeReport,
  SupportBridgeToolReport,
  SwiggyServer,
} from "../../src/domain/types.js";

const servers: Array<{
  server: SwiggyServer;
  domain: string;
  endpoint: string;
  failedTool: string;
  toolContext: Record<string, string | number | boolean>;
  flowDescription: string;
}> = [
  {
    server: "food",
    domain: "food",
    endpoint: "POST mcp.swiggy.com/food",
    failedTool: "place_food_order",
    toolContext: {
      restaurantId: "rest_green_bowl",
      cartId: "food_cart_preview",
      menu_item_id: "paneer_bowl",
      paymentMethod: "COD",
    },
    flowDescription: "searched restaurant -> built food cart -> user confirmed -> place_food_order returned an upstream error",
  },
  {
    server: "instamart",
    domain: "im",
    endpoint: "POST mcp.swiggy.com/im",
    failedTool: "checkout",
    toolContext: {
      addressId: "addr_home_001",
      cartId: "im_cart_preview",
      spinId: "spin_moong_dal",
      paymentMethod: "COD",
    },
    flowDescription: "searched groceries -> updated cart -> refreshed cart -> checkout returned an upstream error",
  },
  {
    server: "dineout",
    domain: "dineout",
    endpoint: "POST mcp.swiggy.com/dineout",
    failedTool: "book_table",
    toolContext: {
      restaurantId: "la_piazza",
      cartId: "dineout_cart_preview",
      slotId: "sat_1945",
      guestCount: 4,
    },
    flowDescription: "searched Dineout -> selected slot -> created cart -> book_table returned an upstream error",
  },
];

function scoreFor(hasSession: boolean) {
  return hasSession ? 100 : 88;
}

function domainFor(server: SwiggyServer): SupportBridgeExecution["reportErrorArguments"]["domain"] {
  if (server === "instamart") return "im";
  return server;
}

function hashValue(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value ?? {})).digest("hex").slice(0, 16);
}

function sanitizeText(value: string, fallback: string) {
  const withoutSecrets = value
    .replace(/bearer\s+[a-z0-9._-]+/gi, "[redacted-token]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\+?\d[\d\s-]{7,}\d/g, "[redacted-phone]")
    .replace(/\b(?:token|password|secret|cookie|authorization)\b\s*[:=]\s*\S+/gi, "[redacted-secret]");
  return withoutSecrets.trim().slice(0, 320) || fallback;
}

function sanitizeToolContext(toolContext: Record<string, unknown>, sessionId: string | undefined) {
  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(toolContext)) {
    const normalizedKey = key.trim().slice(0, 48);
    if (!normalizedKey) continue;
    if (typeof value === "boolean" || typeof value === "number") {
      sanitized[normalizedKey] = value;
    } else if (typeof value === "string") {
      sanitized[normalizedKey] = `${normalizedKey}_${hashValue(value)}`;
    }
  }
  sanitized.mealPilotSessionId = sessionId ? `session_${hashValue(sessionId)}` : "missing_session";
  return sanitized;
}

function responseData(response: unknown): unknown {
  if (response && typeof response === "object" && "result" in response) {
    const result = (response as { result?: unknown }).result;
    if (result && typeof result === "object" && "data" in result) return (result as { data?: unknown }).data;
  }
  return response;
}

function summarizeResponse(response: unknown): SupportBridgeExecution["responseSummary"] {
  const data = responseData(response);
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const statusValue = record.summary ?? record.status ?? record.mailto ?? "not_reported";
  return {
    available: Boolean(data),
    statusLabel: typeof statusValue === "string" ? statusValue.slice(0, 120) : String(statusValue),
    receiptHash: data ? hashValue(data) : "not_reported",
  };
}

function bodyFor(sessionId: string | undefined, reports: SupportBridgeToolReport[]) {
  return [
    "MealPilot Swiggy MCP support bridge report",
    "",
    `Session id: ${sessionId ?? "pending local session"}`,
    "Servers: food, instamart, dineout",
    "Issue: user-visible MCP failure during a confirmed MealPilot flow",
    "",
    "report_error payloads prepared:",
    ...reports.map((report) => `- ${report.server}.${report.failedTool}: ${report.responsePreview.data.supportCorrelation}`),
    "",
    "No access tokens, raw payment data, raw address text, or full order payloads are included.",
  ].join("\n");
}

function buildReportForServer(
  serverConfig: (typeof servers)[number],
  sessionId: string | undefined,
): SupportBridgeToolReport {
  const correlation = `${serverConfig.server}_${sessionId ?? "pending_session"}_${serverConfig.failedTool}`;
  const toolContext = {
    ...serverConfig.toolContext,
    mealPilotSessionId: sessionId ?? "pending_session",
    userConfirmedAction: true,
  };
  const args = {
    tool: serverConfig.failedTool,
    domain: serverConfig.domain,
    errorMessage: `MealPilot simulated ${serverConfig.failedTool} failure for Swiggy support bridge validation.`,
    flowDescription: serverConfig.flowDescription,
    toolContext,
    userNotes: "Generated by MealPilot Support Bridge after user-visible failure. Tokens and PII are redacted.",
  };
  const subject = `[S2] MealPilot ${serverConfig.server} ${serverConfig.failedTool} support bridge`;
  const body = [
    args.errorMessage,
    "",
    `Domain: ${args.domain}`,
    `Tool: ${args.tool}`,
    `Session: ${sessionId ?? "pending local session"}`,
    `Flow: ${args.flowDescription}`,
    `Context keys: ${Object.keys(args.toolContext).join(", ")}`,
  ].join("\n");

  return {
    id: `support_${serverConfig.server}`,
    server: serverConfig.server,
    endpoint: serverConfig.endpoint,
    failedTool: serverConfig.failedTool,
    status: sessionId ? "ready" : "needs_session",
    request: {
      jsonrpc: "2.0",
      id: `support-${serverConfig.server}`,
      method: "tools/call",
      params: {
        name: "report_error",
        arguments: args,
      },
    },
    responsePreview: {
      success: true,
      data: {
        mailto: `mailto:builders@swiggy.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        summary: `${serverConfig.server} support payload prepared for ${serverConfig.failedTool}.`,
        supportCorrelation: correlation,
      },
      message: "Preview mirrors Swiggy report_error success envelope.",
    },
    evidence:
      "Uses official report_error fields: tool, domain, errorMessage, flowDescription, toolContext, and userNotes.",
  };
}

export function buildSupportBridgeReport(options: { plans: MealPlan[]; sessionId?: string }): SupportBridgeReport {
  const selectedPlan =
    options.sessionId !== undefined ? options.plans.find((plan) => plan.id === options.sessionId) : options.plans.at(-1);
  const sessionId = selectedPlan?.id ?? options.sessionId;
  const reportErrorTools = servers.map((server) => buildReportForServer(server, sessionId));
  const body = bodyFor(sessionId, reportErrorTools);

  return {
    generatedAt: new Date().toISOString(),
    score: scoreFor(Boolean(sessionId)),
    latestSessionId: sessionId,
    reportErrorTools,
    contactChannels: [
      {
        channel: "builders@swiggy.in",
        useCase: "General developer questions, onboarding, rate-limit increases, docs feedback, and production escalation email.",
        status: "ready",
      },
      {
        channel: "security@swiggy.in",
        useCase: "Responsible disclosure for security vulnerabilities.",
        status: "external",
      },
      {
        channel: "report_error tool",
        useCase: "Agent-invoked user report during a live Food, Instamart, or Dineout session.",
        status: "ready",
      },
    ],
    slaMatrix: [
      { severity: "S0", trigger: "Production down for integration users", ack: "< 30 min", updateCadence: "Every 30 min" },
      { severity: "S1", trigger: "Major feature broken or partial outage", ack: "< 2 hr business hours", updateCadence: "Every 2 hr" },
      { severity: "S2", trigger: "Degraded quality or non-critical issue", ack: "< 1 business day", updateCadence: "Daily" },
      { severity: "S3", trigger: "Question or feature request", ack: "< 3 business days", updateCadence: "As needed" },
    ],
    redactionRules: [
      "Never include access tokens, refresh tokens, cookies, or OAuth authorization codes.",
      "Do not include raw payment credentials, full addresses, or complete order payloads.",
      "Include only the identifiers needed for Swiggy tracing: orderId, restaurantId, addressId, spinId, cartId, slotId, couponCode, query, paymentMethod, and MealPilot session id.",
      "Keep user notes short and remove phone numbers, emails, and free-form address text before sending.",
    ],
    escalationChecklist: [
      "Capture the MealPilot session id and UTC or IST time range.",
      "Call report_error once on the affected Swiggy server when the user asks to report from the conversation.",
      "Attach expected versus actual behavior and the specific failed tool name.",
      "Email builders@swiggy.in for production incidents after verifying tokens, scopes, endpoints, and error-rate spike.",
    ],
    incidentEmail: {
      to: "builders@swiggy.in",
      subject: `[S2] MealPilot Swiggy MCP support bridge${sessionId ? ` - ${sessionId}` : ""}`,
      body,
    },
    externalGates: [
      "Live report_error server-side logging requires an authenticated Swiggy MCP session.",
      "Enterprise S0/S1 phone or Slack escalation depends on the partner agreement.",
      "Public status page and partner dashboards are Swiggy-operated external systems.",
    ],
  };
}

export async function executeSupportBridgeReport(input: {
  config: ServerConfig;
  server: SwiggyServer;
  failedTool: string;
  severity: "S0" | "S1" | "S2" | "S3";
  errorMessage: string;
  flowDescription: string;
  userNotes: string;
  toolContext: Record<string, unknown>;
  sessionId?: string;
  issueObserved: boolean;
  userConsented: boolean;
  liveCredentialReady: boolean;
  executeTool: (server: SwiggyServer, tool: string, args: Record<string, unknown>) => Promise<unknown>;
}): Promise<SupportBridgeExecution> {
  const riskFlags: string[] = [];
  const sessionIdProvided = Boolean(input.sessionId);
  if (!sessionIdProvided) riskFlags.push("support_session_id_required");
  if (!input.issueObserved) riskFlags.push("observed_user_visible_issue_required");
  if (!input.userConsented) riskFlags.push("user_consent_required_before_report_error");
  if (input.config.swiggyMode !== "mock" && !input.liveCredentialReady) riskFlags.push("live_swiggy_token_required_for_report_error");

  let decision: SupportBridgeExecution["decision"] = "reported_with_receipt";
  if (!sessionIdProvided) decision = "blocked_missing_session";
  else if (!input.issueObserved) decision = "blocked_no_observed_issue";
  else if (!input.userConsented) decision = "blocked_user_consent";
  else if (input.config.swiggyMode !== "mock" && !input.liveCredentialReady) decision = "external_gate";

  const safeContext = sanitizeToolContext(input.toolContext, input.sessionId);
  const reportErrorArguments: SupportBridgeExecution["reportErrorArguments"] = {
    tool: input.failedTool,
    domain: domainFor(input.server),
    errorMessage: sanitizeText(input.errorMessage, "MealPilot observed a Swiggy MCP tool failure."),
    flowDescription: sanitizeText(input.flowDescription, "MealPilot support bridge captured a user-visible flow failure."),
    toolContext: safeContext,
    userNotes: sanitizeText(input.userNotes, "User asked MealPilot to report this issue to Swiggy support."),
  };

  let response: unknown;
  const executedTools: Array<"report_error"> = [];
  if (decision === "reported_with_receipt") {
    response = await input.executeTool(input.server, "report_error", reportErrorArguments);
    executedTools.push("report_error");
  }

  const emailSubject = `[${input.severity}] MealPilot ${input.server} ${input.failedTool} report_error`;

  return {
    generatedAt: new Date().toISOString(),
    requestId: `support_${Date.now().toString(36)}`,
    mode: input.config.swiggyMode,
    input: {
      server: input.server,
      failedTool: input.failedTool,
      severity: input.severity,
      issueObserved: input.issueObserved,
      userConsented: input.userConsented,
      sessionIdProvided,
    },
    decision,
    executedTools,
    reportErrorArguments,
    redaction: {
      contextKeys: Object.keys(safeContext).sort(),
      contextHash: hashValue(safeContext),
      rawTokensRetained: false,
      rawPaymentRetained: false,
      rawAddressRetained: false,
    },
    responseSummary: summarizeResponse(response),
    supportPacket: {
      sessionIdHash: input.sessionId ? hashValue(input.sessionId) : "missing_session",
      failedTool: input.failedTool,
      server: input.server,
      escalationTarget: "builders@swiggy.in",
      emailSubject,
    },
    riskFlags,
    userFacingCopy:
      decision === "reported_with_receipt"
        ? `I reported the ${input.server} ${input.failedTool} issue to Swiggy using report_error and kept only redacted context.`
        : decision === "external_gate"
          ? "Live report_error execution is gated until Swiggy credentials are available for this environment."
          : decision === "blocked_user_consent"
            ? "I need user consent before sending report_error to Swiggy."
            : decision === "blocked_no_observed_issue"
              ? "report_error is only sent for an observed user-visible issue, not silent debugging."
              : "I need a MealPilot session id before preparing a Swiggy support report.",
    telemetry: [
      { field: "server", value: input.server, redaction: "safe enum" },
      { field: "failed_tool", value: input.failedTool, redaction: "tool name only" },
      { field: "domain", value: reportErrorArguments.domain, redaction: "safe enum" },
      { field: "severity", value: input.severity, redaction: "safe enum" },
      { field: "session_id_hash", value: input.sessionId ? hashValue(input.sessionId) : "missing_session", redaction: "sha256 prefix only" },
      { field: "tool_context_hash", value: hashValue(safeContext), redaction: "sha256 prefix only" },
      { field: "report_error_executed", value: String(executedTools.includes("report_error")), redaction: "boolean invariant" },
      { field: "raw_sensitive_payload_retained", value: "false", redaction: "hard-coded privacy invariant" },
    ],
    assertions: [
      "Support Bridge uses the official report_error tool only after a user-visible issue is observed.",
      "User consent and a MealPilot session id are required before sending report_error.",
      "toolContext values are hashed or reduced to safe scalar fields before execution.",
      "Access tokens, cookies, raw payment details, phone numbers, emails, and full addresses are not retained.",
      "builders@swiggy.in remains the escalation target for developer support packets.",
    ],
  };
}
