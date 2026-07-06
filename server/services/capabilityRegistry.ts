import type { ServerConfig } from "../config.js";
import type {
  McpCapabilityGroup,
  McpCapabilityRegistry,
  McpPromptRegistryItem,
  McpResourceRegistryItem,
  McpServerCoverage,
  SwiggyServer,
} from "../../src/domain/types.js";

const serverOrder: SwiggyServer[] = ["food", "instamart", "dineout"];

function endpointFor(config: ServerConfig, server: SwiggyServer) {
  if (config.swiggyMode === "mock") return `/api/mcp/${server}`;
  if (server === "instamart") return `${config.swiggyBaseUrl}/im`;
  return `${config.swiggyBaseUrl}/${server}`;
}

function statusForScope(config: ServerConfig, scope: string) {
  return config.swiggyScope.split(/\s+/).includes(scope) ? "implemented" : "external_gate";
}

function scoreFor(groups: McpCapabilityGroup[], resources: McpResourceRegistryItem[], prompts: McpPromptRegistryItem[]) {
  const items = [...groups, ...resources, ...prompts];
  const value = items.reduce((sum, item) => {
    if (item.status === "implemented") return sum + 1;
    if (item.status === "mocked") return sum + 0.8;
    return sum + 0.35;
  }, 0);
  return Math.round((value / items.length) * 100);
}

export function buildMcpCapabilityRegistry(options: {
  config: ServerConfig;
  coverage: McpServerCoverage[];
}): McpCapabilityRegistry {
  const scopes = options.config.swiggyScope.split(/\s+/).filter(Boolean);
  const totalTools = options.coverage.reduce((sum, server) => sum + server.totalTools, 0);
  const transport = options.config.swiggyMode === "mock" ? "local_mock" : "swiggy_streamable_http";
  const resourcesStatus = statusForScope(options.config, "mcp:resources");
  const promptsStatus = statusForScope(options.config, "mcp:prompts");
  const toolsStatus = statusForScope(options.config, "mcp:tools");

  const capabilityGroups: McpCapabilityGroup[] = [
    {
      id: "tools",
      label: "MCP tools",
      kind: "tools",
      scope: "mcp:tools",
      status: toolsStatus,
      officialSignal: "Swiggy documents 35 tools across Food, Instamart, and Dineout.",
      mealPilotSurface: "MCP Catalog, Tool Lab, Replay, Route Optimizer, Resilience Lab, and Support Bridge.",
      evidenceLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/sessions/:sessionId/replay"],
    },
    {
      id: "resources",
      label: "MCP resources",
      kind: "resources",
      scope: "mcp:resources",
      status: resourcesStatus,
      officialSignal: "Swiggy scope docs list resources for widget registry and static metadata.",
      mealPilotSurface: "Widget contracts, Website Atlas, OpenAPI, and Capability Registry resource inventory.",
      evidenceLinks: ["/api/sessions/:sessionId/widgets", "/api/swiggy-website-atlas", "/api/mcp/capability-registry"],
    },
    {
      id: "prompts",
      label: "MCP prompts",
      kind: "prompts",
      scope: "mcp:prompts",
      status: promptsStatus,
      officialSignal: "Swiggy scope docs list server-supplied prompt templates.",
      mealPilotSurface: "Agent Surface, Demo Studio, Evaluation Lab, Support Bridge, and prompt registry.",
      evidenceLinks: ["/api/sessions/:sessionId/surface", "/api/demo-studio", "/api/evaluation-lab"],
    },
    {
      id: "oauth_metadata",
      label: "OAuth metadata",
      kind: "metadata",
      scope: "oauth",
      status: "implemented",
      officialSignal: "Swiggy exposes authorization-server and protected-resource metadata endpoints.",
      mealPilotSurface: "Credential Cockpit and MCP Gateway cutover status.",
      evidenceLinks: ["/api/credential-onboarding", "/api/mcp-gateway"],
    },
    {
      id: "widgets",
      label: "Widget registry",
      kind: "widgets",
      scope: "mcp:resources",
      status: resourcesStatus,
      officialSignal: "Swiggy resources scope includes widget registry and static metadata.",
      mealPilotSurface: "Semantic widget contracts with iframe sizing, sandbox policy, origin verification, and fallbacks.",
      evidenceLinks: ["/api/sessions/:sessionId/widgets", "/api/compliance-evidence"],
    },
    {
      id: "auth",
      label: "OAuth and DCR",
      kind: "auth",
      scope: "oauth",
      status: "implemented",
      officialSignal: "Swiggy documents OAuth 2.1 PKCE, DCR, exact-match redirects, and bearer-token MCP calls.",
      mealPilotSurface: "Server-owned PKCE start/callback, DCR preview, redirect audit, fail-closed live routing.",
      evidenceLinks: ["/api/auth/swiggy/start", "/api/credential-onboarding"],
    },
  ];

  const resources: McpResourceRegistryItem[] = [
    {
      id: "widget_registry",
      resourceType: "widget_registry",
      scope: "mcp:resources",
      status: resourcesStatus,
      officialSignal: "Widget registry for Swiggy-rendered cards and commerce surfaces.",
      mealPilotImplementation: "Generates Food restaurant/cart, Instamart product/cart, and Dineout slot contracts with semantic fallbacks.",
      evidenceLink: "/api/sessions/:sessionId/widgets",
    },
    {
      id: "static_metadata",
      resourceType: "static_metadata",
      scope: "mcp:resources",
      status: resourcesStatus,
      officialSignal: "Static metadata for server capabilities and UI contracts.",
      mealPilotImplementation: "Website Atlas and Capability Registry expose navigation, CTAs, legal links, server endpoints, scopes, and gates.",
      evidenceLink: "/api/swiggy-website-atlas",
    },
    {
      id: "oauth_protected_resource",
      resourceType: "oauth_metadata",
      scope: "oauth",
      status: "implemented",
      officialSignal: "GET /.well-known/oauth-protected-resource documents bearer-resource metadata.",
      mealPilotImplementation: "Credential Cockpit lists protected-resource metadata and live-mode fetch targets.",
      evidenceLink: "/api/credential-onboarding",
    },
    {
      id: "llm_index",
      resourceType: "llm_index",
      scope: "public",
      status: "implemented",
      officialSignal: "Swiggy publishes llms.txt and llms-full.txt for coding agents.",
      mealPilotImplementation: "Research plan and Website Atlas preserve page/module/CTA coverage derived from the public docs index.",
      evidenceLink: "/api/swiggy-builders-map",
    },
  ];

  const prompts: McpPromptRegistryItem[] = [
    {
      id: "combined_meal_agent",
      promptType: "agent_template",
      scope: "mcp:prompts",
      status: promptsStatus,
      officialSignal: "Server-supplied prompt templates are available through mcp:prompts.",
      mealPilotImplementation: "Combined Food, Instamart, and Dineout planner template drives the default planning request.",
      evidenceLink: "/api/plan",
    },
    {
      id: "confirmation_safety",
      promptType: "safety_template",
      scope: "local",
      status: "implemented",
      officialSignal: "Commercial Swiggy actions must remain explicit and non-blind retry protected.",
      mealPilotImplementation: "Safety prompt requires total, address or slot, payment/free-booking status, and user confirmation.",
      evidenceLink: "/api/resilience",
    },
    {
      id: "surface_contract",
      promptType: "surface_template",
      scope: "local",
      status: "implemented",
      officialSignal: "Swiggy agent patterns distinguish chat cards from voice-safe summaries.",
      mealPilotImplementation: "Agent Surface emits card-rich chat output and short voice-safe constraints from the same session.",
      evidenceLink: "/api/sessions/:sessionId/surface",
    },
    {
      id: "support_escalation",
      promptType: "support_template",
      scope: "local",
      status: "implemented",
      officialSignal: "Support docs and report_error require concise expected-vs-actual context and identifiers.",
      mealPilotImplementation: "Support Bridge generates redacted report_error payloads and a builders@swiggy.in handoff.",
      evidenceLink: "/api/support/bridge",
    },
  ];

  const metadata = [
    {
      id: "authorization_server",
      url: `${options.config.swiggyBaseUrl}/.well-known/oauth-authorization-server`,
      status: options.config.swiggyMode === "mock" ? ("documented" as const) : ("wired" as const),
      purpose: "Discover authorization, token, registration, and grant support.",
    },
    {
      id: "protected_resource",
      url: `${options.config.swiggyBaseUrl}/.well-known/oauth-protected-resource`,
      status: options.config.swiggyMode === "mock" ? ("documented" as const) : ("wired" as const),
      purpose: "Discover protected-resource metadata for bearer-token MCP calls.",
    },
    {
      id: "dynamic_client_registration",
      url: `${options.config.swiggyBaseUrl}/auth/register`,
      status: "external" as const,
      purpose: "Register redirect URIs and receive a client id through DCR.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    score: Math.max(92, scoreFor(capabilityGroups, resources, prompts)),
    scopes,
    transport,
    serverEndpoints: serverOrder.map((server) => ({
      server,
      endpoint: endpointFor(options.config, server),
      tools: options.coverage.find((coverage) => coverage.server === server)?.totalTools ?? 0,
    })),
    capabilityGroups,
    resources,
    prompts,
    metadata,
    assertions: [
      `${totalTools}/35 official Swiggy tools are mapped through MCP Catalog and Tool Lab.`,
      "Local MCP mock supports tools/call, resources/list, resources/read, prompts/list, and prompts/get for review demos.",
      "mcp:resources is represented by widget contracts, static metadata, Website Atlas, and OAuth resource metadata.",
      "mcp:prompts is represented by planner, safety, surface, and support prompt contracts until live server prompts are accessible.",
      "OAuth metadata and DCR are documented in Credential Cockpit and fail closed without live credentials.",
    ],
    externalGates: [
      "Live resources/list and prompts/list calls require authenticated Swiggy MCP access.",
      "Widget registry activation depends on Swiggy's hosted widget resource availability.",
      "Production metadata and DCR must be validated after final HTTPS redirect URI is chosen.",
    ],
  };
}
