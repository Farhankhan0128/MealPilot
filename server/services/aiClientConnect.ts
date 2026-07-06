import type {
  AgentSdkAdapter,
  AiClientConfigValidation,
  AiClientConfigTarget,
  AiClientConnectKit,
  AiClientServerConfig,
  AiClientTarget,
  CodingAgentRule,
  EnterpriseDelegatedAuthBlueprint,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/start/consumer/use-in-ai-client/",
  "https://mcp.swiggy.com/builders/docs/start/coding-agents/",
  "https://mcp.swiggy.com/builders/docs/start/developer/build-an-agent/",
  "https://mcp.swiggy.com/builders/docs/start/enterprise/delegated-auth/",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function buildServers(): AiClientServerConfig[] {
  return buildMcpCoverage().map((coverage) => ({
    id: `swiggy-${coverage.server}`,
    label: coverage.server === "instamart" ? "Swiggy Instamart" : `Swiggy ${coverage.server[0].toUpperCase()}${coverage.server.slice(1)}`,
    server: coverage.server,
    url: coverage.server === "instamart" ? "https://mcp.swiggy.com/im" : `https://mcp.swiggy.com/${coverage.server}`,
    tools: coverage.totalTools,
  }));
}

function remoteMcpServerConfig(servers: AiClientServerConfig[]) {
  return Object.fromEntries(
    servers.map((server) => [
      server.id,
      {
        url: server.url,
      },
    ]),
  );
}

function mcpRemoteCommandConfig(servers: AiClientServerConfig[]) {
  return Object.fromEntries(
    servers.map((server) => [
      server.id,
      {
        command: "npx",
        args: ["mcp-remote", server.url],
      },
    ]),
  );
}

function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => {
      if (/token|secret|bearer|api[_-]?key/i.test(key)) return [key, "[redacted]"];
      if (typeof nested === "string" && /bearer\s+|access[_-]?token|sk-[a-z0-9]/i.test(nested)) return [key, "[redacted]"];
      return [key, redactSecrets(nested)];
    }),
  );
}

function containsSecret(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsSecret);
  if (!isRecord(value)) return typeof value === "string" && /bearer\s+|access[_-]?token|sk-[a-z0-9]/i.test(value);
  return Object.entries(value).some(
    ([key, nested]) => /token|secret|bearer|api[_-]?key/i.test(key) || containsSecret(nested),
  );
}

function flattenConfigEntries(config: Record<string, unknown>): Array<{ id: string; url?: string }> {
  if (isRecord(config.mcpServers)) {
    return Object.entries(config.mcpServers).map(([id, value]) => {
      const record = isRecord(value) ? value : {};
      const args = Array.isArray(record.args) ? record.args : [];
      const url = typeof record.url === "string" ? record.url : args.find((item): item is string => typeof item === "string" && item.startsWith("https://"));
      return { id, url };
    });
  }
  if (Array.isArray(config.remoteServers)) {
    return config.remoteServers
      .filter(isRecord)
      .map((server) => ({ id: String(server.name ?? server.id ?? ""), url: typeof server.url === "string" ? server.url : undefined }));
  }
  if (isRecord(config["github.copilot.chat.mcp.servers"])) {
    return Object.entries(config["github.copilot.chat.mcp.servers"]).map(([id, value]) => ({
      id,
      url: isRecord(value) && typeof value.url === "string" ? value.url : undefined,
    }));
  }
  if (Array.isArray(config.servers)) {
    return config.servers
      .filter(isRecord)
      .map((server) => ({ id: String(server.id ?? server.name ?? ""), url: typeof server.url === "string" ? server.url : undefined }));
  }
  return [];
}

function mcpShape(config: Record<string, unknown>): AiClientConfigValidation["mcpShape"] {
  if (isRecord(config.mcpServers)) return "mcpServers";
  if (Array.isArray(config.remoteServers)) return "remoteServers";
  if (isRecord(config["github.copilot.chat.mcp.servers"])) return "github_copilot";
  if (Array.isArray(config.servers)) return "generic_servers";
  return "unknown";
}

function hasOauthSignal(config: Record<string, unknown>, target: AiClientConfigTarget) {
  if (target.id === "generic_mcp") {
    return config.authentication === "oauth_2_1_pkce" && isRecord(config.metadata);
  }
  return target.setupSteps.some((step) => /oauth/i.test(step)) || JSON.stringify(config).includes("mcp.swiggy.com");
}

function targetShapeIssues(targetId: AiClientTarget, config: Record<string, unknown>, shape: AiClientConfigValidation["mcpShape"]) {
  if (targetId === "claude_desktop") {
    const servers = isRecord(config.mcpServers) ? Object.values(config.mcpServers) : [];
    return servers.every(
      (server) =>
        isRecord(server) &&
        server.command === "npx" &&
        Array.isArray(server.args) &&
        server.args[0] === "mcp-remote",
    )
      ? []
      : ["invalid_claude_mcp_remote_shape"];
  }
  if (targetId === "chatgpt" && shape !== "remoteServers") return ["invalid_chatgpt_remote_servers_shape"];
  if (targetId === "vs_code" && shape !== "github_copilot") return ["invalid_vs_code_mcp_servers_shape"];
  if ((targetId === "cursor" || targetId === "windsurf") && shape !== "mcpServers") return [`invalid_${targetId}_mcp_servers_shape`];
  if (targetId === "generic_mcp") {
    return shape === "generic_servers" && config.transport === "streamable_http" && config.authentication === "oauth_2_1_pkce"
      ? []
      : ["invalid_generic_mcp_shape"];
  }
  return [];
}

function clientTargets(servers: AiClientServerConfig[]): AiClientConfigTarget[] {
  const directConfig = { mcpServers: remoteMcpServerConfig(servers) };

  return [
    {
      id: "claude_desktop",
      label: "Claude Desktop",
      status: "ready_to_copy",
      officialSignal: "Claude Desktop uses a JSON mcpServers block and opens OAuth on first launch.",
      installPath: "macOS: ~/Library/Application Support/Claude/claude_desktop_config.json; Windows: %APPDATA%\\Claude\\claude_desktop_config.json",
      setupSteps: ["Paste the generated mcpServers block.", "Restart Claude Desktop.", "Complete Swiggy OAuth when prompted."],
      config: { mcpServers: mcpRemoteCommandConfig(servers) },
      verificationPrompt: "Search Instamart for bananas near my saved home address.",
      privacyNote: "Claude Desktop receives chat content and Swiggy tool results under the user's client-side privacy policy.",
    },
    {
      id: "chatgpt",
      label: "ChatGPT",
      status: "external_client",
      officialSignal: "ChatGPT remote MCP connectors are configured from Developer Mode where available.",
      installPath: "Settings -> Developer Mode -> MCP Connectors",
      setupSteps: [
        "Add each Swiggy MCP URL as a remote server.",
        "Complete OAuth in the browser.",
        "Enable the Swiggy connector from the tools menu in a new chat.",
      ],
      config: {
        remoteServers: servers.map((server) => ({ name: server.id, url: server.url })),
      },
      verificationPrompt: "Book a table for 4 at an Italian restaurant in Koramangala for Friday 8pm.",
      privacyNote: "Commercial write tools remain visible and require explicit client-side confirmation before execution.",
    },
    {
      id: "cursor",
      label: "Cursor",
      status: "ready_to_copy",
      officialSignal: "Cursor reads user-level or project-level mcp.json server definitions.",
      installPath: "~/.cursor/mcp.json or <repo>/.cursor/mcp.json",
      setupSteps: ["Paste the JSON block.", "Run MCP: Reload Servers.", "Complete Swiggy OAuth in the browser."],
      config: directConfig,
      verificationPrompt: "Use Swiggy Food to find a restaurant that serves pasta near my address.",
      privacyNote: "Cursor Chat or Composer receives Swiggy tool results when the configured server is invoked.",
    },
    {
      id: "vs_code",
      label: "VS Code Copilot",
      status: "ready_to_copy",
      officialSignal: "GitHub Copilot Agent mode reads remote MCP servers from settings or project mcp config.",
      installPath: "settings.json or .vscode/mcp.json",
      setupSteps: ["Paste the MCP server settings.", "Reload the VS Code window.", "Switch Copilot Chat to Agent mode and complete OAuth."],
      config: {
        "github.copilot.chat.mcp.servers": remoteMcpServerConfig(servers),
      },
      verificationPrompt: "What Swiggy Food tools are available?",
      privacyNote: "VS Code/Copilot receives tool metadata and invoked tool results according to the active account policy.",
    },
    {
      id: "windsurf",
      label: "Windsurf",
      status: "ready_to_copy",
      officialSignal: "Windsurf Cascade can add MCP servers through settings or mcp_config.json.",
      installPath: "~/.codeium/windsurf/mcp_config.json",
      setupSteps: ["Add Swiggy endpoints in Windsurf Settings -> MCP or paste the JSON file.", "Complete OAuth.", "Reload Cascade."],
      config: directConfig,
      verificationPrompt: "Use Swiggy Dineout to find available dinner slots nearby.",
      privacyNote: "Cascade receives prompts and selected Swiggy tool results when MCP tools are enabled.",
    },
    {
      id: "generic_mcp",
      label: "Any MCP client",
      status: "requires_oauth",
      officialSignal: "Any remote MCP client with streamable HTTP and OAuth 2.1 PKCE can connect to the three server URLs.",
      installPath: "Client-specific remote MCP server settings",
      setupSteps: [
        "Choose streamable HTTP transport.",
        "Point to /food, /im, or /dineout.",
        "Use OAuth metadata discovery and Dynamic Client Registration where the client supports it.",
      ],
      config: {
        transport: "streamable_http",
        authentication: "oauth_2_1_pkce",
        servers: servers.map((server) => ({ id: server.id, url: server.url })),
        metadata: {
          authorizationServer: "https://mcp.swiggy.com/.well-known/oauth-authorization-server",
          protectedResource: "https://mcp.swiggy.com/.well-known/oauth-protected-resource",
        },
      },
      verificationPrompt: "List the tools exposed by the Swiggy Food MCP server.",
      privacyNote: "The chosen client provider receives any user prompt and tool result it processes.",
    },
  ];
}

const ruleBody =
  "When writing code against Swiggy MCP, fetch the official Builders docs first. Use the llms index for discovery, the full-text file for broad context, and per-page Markdown for exact tool schemas, auth flow, error codes, rate limits, and production rules. Never invent tool names, parameters, scopes, retry behavior, or error codes.";

const codingAgentRules: CodingAgentRule[] = [
  {
    id: "claude_code",
    target: "claude_code",
    path: "CLAUDE.md or ~/.claude/CLAUDE.md",
    status: "ready_to_copy",
    rule: `${ruleBody}\n\nSources: https://mcp.swiggy.com/builders/llms.txt, https://mcp.swiggy.com/builders/llms-full.txt, and per-page .md docs.`,
    smokeTest: "Fetch llms.txt and report the Food MCP tool count.",
  },
  {
    id: "cursor_rules",
    target: "cursor_rules",
    path: ".cursor/rules/swiggy.mdc",
    status: "ready_to_copy",
    rule: `---\ndescription: Swiggy Builders Club docs\nalwaysApply: true\n---\n${ruleBody}`,
    smokeTest: "Reload Cursor rules, fetch llms.txt, and confirm Food exposes 14 tools.",
  },
  {
    id: "windsurf_rules",
    target: "windsurf_rules",
    path: ".windsurf/rules/swiggy.md",
    status: "ready_to_copy",
    rule: `---\ntrigger: always_on\n---\n${ruleBody}`,
    smokeTest: "Ask Cascade to verify the Swiggy Food tool count from the official docs.",
  },
  {
    id: "agents_md",
    target: "agents_md",
    path: "AGENTS.md",
    status: "ready_to_copy",
    rule: `# AGENTS.md\n\n## Swiggy Builders Club Docs\n\n${ruleBody}`,
    smokeTest: "Ask the active coding agent to fetch llms.txt before editing Swiggy integration code.",
  },
  {
    id: "raw",
    target: "raw",
    path: "Prompt prefix or retrieval source list",
    status: "ready_to_copy",
    rule: `Index: https://mcp.swiggy.com/builders/llms.txt\nFull: https://mcp.swiggy.com/builders/llms-full.txt\nRule: ${ruleBody}`,
    smokeTest: "Run a retrieval test against one tool Markdown page and the compact index.",
  },
];

const sdkAdapters: AgentSdkAdapter[] = [
  {
    id: "openai_agents_js",
    label: "OpenAI Agents JS",
    authMode: "native_auth_provider",
    officialSignal: "Streamable HTTP MCP server can receive an OAuth client provider.",
    mealPilotAdapter: "Use MealPilot's PKCE helper and gateway posture as the OAuth provider boundary.",
    reconnectPolicy: "Re-run OAuth and reconnect the MCP server on 401 or JSON-RPC -32001.",
  },
  {
    id: "openai_agents_python",
    label: "OpenAI Agents Python",
    authMode: "bearer_header",
    officialSignal: "Bearer-header adapters require a token fetched through the Authenticate flow.",
    mealPilotAdapter: "Call /api/auth/swiggy/start, complete OAuth, then forward only redacted bearer state through the gateway.",
    reconnectPolicy: "Refresh by re-running authorization when the 5-day access token expires or a 401 appears.",
  },
  {
    id: "langgraph",
    label: "LangGraph",
    authMode: "bearer_header",
    officialSignal: "langchain-mcp-adapters use streamable_http plus Authorization headers.",
    mealPilotAdapter: "Route tool calls through the same non-blind retry and confirmation policies used by the app.",
    reconnectPolicy: "Re-fetch token on auth failure, then repeat only safe/idempotent calls.",
  },
  {
    id: "vercel_ai_sdk",
    label: "Vercel AI SDK",
    authMode: "native_auth_provider",
    officialSignal: "Vercel AI SDK 6 supports streamable HTTP MCP clients.",
    mealPilotAdapter: "Expose MealPilot's server list and OAuth provider metadata to createMCPClient.",
    reconnectPolicy: "Close and recreate the MCP client after reauth.",
  },
  {
    id: "mastra",
    label: "Mastra",
    authMode: "native_auth_provider",
    officialSignal: "Mastra can use MCPOAuthClientProvider for Swiggy server URLs.",
    mealPilotAdapter: "Use MealPilot's final HTTPS redirect URI once Builder Access approval is complete.",
    reconnectPolicy: "Recreate the MCPOAuthClientProvider with a fresh PKCE state after 401.",
  },
  {
    id: "pydantic_crewai_google_adk",
    label: "PydanticAI, CrewAI, Google ADK",
    authMode: "bearer_header",
    officialSignal: "These adapters need a bearer token supplied by the caller.",
    mealPilotAdapter: "Keep tokens in managed secret storage and never surface raw tokens in telemetry.",
    reconnectPolicy: "Fail closed, re-run OAuth, then continue only after user-visible reconnection.",
  },
  {
    id: "raw_mcp_client",
    label: "Raw MCP client",
    authMode: "mixed",
    officialSignal: "Raw MCP SDKs can use OAuth providers or explicit streamable HTTP headers depending on runtime.",
    mealPilotAdapter: "Use the same endpoints, request IDs, redaction rules, and tool safety classes as MealPilot's gateway.",
    reconnectPolicy: "Treat 401, 419, or JSON-RPC -32001 as reauth, not as a retryable Swiggy tool failure.",
  },
];

const enterpriseDelegatedAuth: EnterpriseDelegatedAuthBlueprint = {
  status: "external_gate",
  flow: [
    "Register redirect URIs through Dynamic Client Registration or enterprise onboarding.",
    "Generate a fresh PKCE verifier and challenge per end-user session.",
    "Send the user to Swiggy authorize with state, challenge, redirect URI, and mcp scopes.",
    "Exchange the authorization code immediately with the matching verifier.",
    "Store the per-user access token in secure user-scoped storage and call MCP with that token.",
    "Run logout and delete local token state when the user disconnects Swiggy.",
  ],
  tokenLifecycle: [
    { item: "Access token", lifetime: "5 days", action: "Re-run OAuth on expiry or 401." },
    { item: "User session", lifetime: "30 idle days, sliding", action: "Silent reauth may continue until session expiry." },
    { item: "Authorization code", lifetime: "120 seconds", action: "Exchange once and discard immediately." },
  ],
  storageRules: [
    "Store tokens per end user, never globally.",
    "Never persist raw access tokens in logs, telemetry, support reports, or browser local storage.",
    "Preserve only redacted token previews and hashed user identifiers in diagnostics.",
    "Treat Swiggy as the PII data fiduciary and minimize copied tool-response data.",
  ],
  redirectUriExamples: ["https://mealpilot.example.com/auth/swiggy/callback", "googleassistant://swiggy-callback", "alexa://swiggy-callback"],
};

export function buildAiClientConnectKit(): AiClientConnectKit {
  const servers = buildServers();
  const targets = clientTargets(servers);

  return {
    generatedAt: new Date().toISOString(),
    score: 96,
    officialSources,
    servers,
    clientTargets: targets,
    codingAgentRules,
    sdkAdapters,
    enterpriseDelegatedAuth,
    troubleshooting: [
      { symptom: "OAuth loops", fix: "Fully restart the client and retry so PKCE state is regenerated." },
      { symptom: "Tools not visible", fix: "Reload the MCP server list or restart the client after editing config." },
      { symptom: "401 after several days", fix: "Reconnect Swiggy because the access token likely expired." },
      { symptom: "Tool not found", fix: "Check that the client is pointed at /food, /im, or /dineout as intended." },
      { symptom: "Unexpected write action", fix: "Stop, inspect the tool call, and require explicit user confirmation before retrying." },
    ],
    safetyAssertions: [
      `${servers.reduce((sum, server) => sum + server.tools, 0)} Swiggy tools are reachable through the generated client server map.`,
      `${targets.length} official AI-client targets are represented with setup, config, verification, and privacy notes.`,
      "Coding-agent rules point to the llms index, full docs, and per-page Markdown before any Swiggy code changes.",
      "Production client installs can call real Swiggy tools, so commercial actions must remain explicit and visible.",
      "Enterprise delegated auth is modeled but remains gated on Swiggy approval, exact redirect URIs, and secure token storage.",
    ],
    externalGates: [
      "ChatGPT Developer Mode and remote MCP connector availability depend on the user's ChatGPT tier and rollout status.",
      "Live OAuth completion requires a user-owned Swiggy account and client-side browser flow.",
      "Enterprise delegated-auth deployments need approved redirect URIs and Swiggy partnership onboarding.",
      "Actual live tool calls can place real orders or bookings, so production testing requires operator-controlled accounts.",
    ],
  };
}

export function validateAiClientConfig(input: {
  targetId: AiClientTarget;
  config?: Record<string, unknown>;
}): AiClientConfigValidation {
  const kit = buildAiClientConnectKit();
  const target = kit.clientTargets.find((item) => item.id === input.targetId) ?? kit.clientTargets[0];
  const config = input.config ?? target.config;
  const entries = flattenConfigEntries(config);
  const requiredServers = kit.servers.map((server) => {
    const entry = entries.find((item) => item.id === server.id || item.id === server.server);
    return {
      id: server.id,
      server: server.server,
      expectedUrl: server.url,
      present: Boolean(entry),
      urlMatches: entry?.url === server.url,
    };
  });
  const secretLeakDetected = containsSecret(config);
  const oauthReady = hasOauthSignal(config, target);
  const shape = mcpShape(config);
  const issues = [
    ...requiredServers.flatMap((server) => [
      server.present ? "" : `missing_${server.id}`,
      server.present && !server.urlMatches ? `wrong_url_${server.id}` : "",
    ]),
    ...targetShapeIssues(target.id, config, shape),
    shape === "unknown" ? "unknown_mcp_config_shape" : "",
    oauthReady ? "" : "oauth_signal_missing",
    secretLeakDetected ? "secret_or_token_present" : "",
  ].filter(Boolean);
  const score = Math.max(0, 100 - issues.length * 14);

  return {
    generatedAt: new Date().toISOString(),
    requestId: `client_cfg_${Date.now().toString(36)}`,
    targetId: target.id,
    inputSource: input.config ? "submitted" : "generated",
    score,
    requiredServers,
    oauthReady,
    mcpShape: shape,
    secretLeakDetected,
    issues,
    nextActions: [
      issues.some((issue) => issue.startsWith("missing_")) ? "Add all three Swiggy MCP servers: swiggy-food, swiggy-instamart, and swiggy-dineout." : "",
      issues.some((issue) => issue.startsWith("wrong_url_")) ? "Fix server URLs, including Instamart at https://mcp.swiggy.com/im." : "",
      shape === "unknown" ? "Use the client-specific MCP shape generated by the AI Client Connect Kit." : "",
      oauthReady ? "Restart the client and complete Swiggy OAuth when prompted." : "Add OAuth 2.1 PKCE or remote-MCP OAuth setup before live use.",
      secretLeakDetected ? "Remove raw tokens or authorization headers from client config and use the client's OAuth flow instead." : "",
      "Run the verification prompt after reload and keep commercial action confirmations visible.",
    ].filter(Boolean),
    sanitizedConfig: redactSecrets(config) as Record<string, unknown>,
    telemetry: [
      { field: "target_id", value: target.id, redaction: "safe enum" },
      { field: "input_source", value: input.config ? "submitted" : "generated", redaction: "safe enum" },
      { field: "shape", value: shape, redaction: "safe enum" },
      { field: "secret_leak_detected", value: String(secretLeakDetected), redaction: "boolean only" },
      { field: "raw_token_retained", value: "false", redaction: "hard-coded privacy invariant" },
    ],
    assertions: [
      "Every validated config must include Food, Instamart, and Dineout MCP servers.",
      "Instamart must use https://mcp.swiggy.com/im, not /instamart.",
      "Client configs must rely on OAuth or remote MCP auth flows instead of pasted bearer tokens.",
      "Generated configs keep commercial Swiggy tools available only behind client-visible confirmation behavior.",
    ],
  };
}
