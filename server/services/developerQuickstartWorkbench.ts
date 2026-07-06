import type {
  DeveloperFirstCallDrill,
  DeveloperFrameworkAdapter,
  DeveloperQuickstartAuthGate,
  DeveloperQuickstartSource,
  DeveloperQuickstartStatus,
  DeveloperQuickstartStep,
  DeveloperQuickstartWorkbench,
  DeveloperRecipeHandoff,
  SwiggyServer,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";

const officialSources: DeveloperQuickstartSource[] = [
  {
    id: "developer_quickstart",
    label: "Developer quickstart",
    url: "https://mcp.swiggy.com/builders/docs/start/developer/",
    signal: "Zero to first successful Swiggy tool call through account access, framework install, OAuth, and get_addresses.",
  },
  {
    id: "build_an_agent",
    label: "Build an agent",
    url: "https://mcp.swiggy.com/builders/docs/start/developer/build-an-agent/",
    signal: "Framework recipes for streamable HTTP MCP clients, OAuth provider support, bearer-header adapters, and 35-tool multi-server wiring.",
  },
  {
    id: "authenticate",
    label: "Authenticate",
    url: "https://mcp.swiggy.com/builders/docs/start/authenticate/",
    signal: "OAuth 2.1 PKCE, Dynamic Client Registration, metadata endpoints, token lifetime, exact redirect URIs, and 401 reauth behavior.",
  },
  {
    id: "llms_index",
    label: "llms.txt",
    url: "https://mcp.swiggy.com/builders/llms.txt",
    signal: "Current source index for Start, Build, Operate, Reference, Blog, and all per-page Markdown twins.",
  },
];

function statusScore(status: DeveloperQuickstartStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.8;
  if (status === "operator_input") return 0.62;
  return 0.44;
}

function serverUrl(server: SwiggyServer) {
  return server === "instamart" ? "https://mcp.swiggy.com/im" : `https://mcp.swiggy.com/${server}`;
}

function endpointPath(server: SwiggyServer) {
  return server === "instamart" ? "/im" : `/${server}`;
}

const readinessSteps: DeveloperQuickstartStep[] = [
  {
    id: "understand_loop",
    sequence: 1,
    label: "Understand the MCP loop",
    officialSignal: "Agent chooses a tool, sends JSON-RPC to one Swiggy server URL, reads { success, data }, and decides the next call.",
    mealPilotEvidence: "MCP Tool Lab, Scenario Runner, and this workbench expose local tools/call samples before live credentials.",
    endpoint: "/api/mcp/tool-lab",
    status: "ready",
  },
  {
    id: "apply_when_ready",
    sequence: 2,
    label: "Apply only when production-ready",
    officialSignal: "Localhost prototyping does not need approval; production access needs integration details, redirect URIs, servers, volume, use case, and demo video.",
    mealPilotEvidence: "Access Submission Studio, Production Launch Bundle, and Builder Packet Export keep manual form/email gates explicit.",
    endpoint: "/api/access-submission-studio",
    status: "operator_input",
  },
  {
    id: "pick_framework",
    sequence: 3,
    label: "Pick an MCP framework",
    officialSignal: "OpenAI Agents SDK, Anthropic, LangGraph, Vercel AI SDK, Mastra, PydanticAI, CrewAI, Google ADK, and raw MCP clients can connect.",
    mealPilotEvidence: "Framework adapters below name auth mode, server URLs, first prompt, and reconnect policy per SDK family.",
    endpoint: "/api/swiggy-developer-quickstart",
    status: "ready",
  },
  {
    id: "complete_oauth",
    sequence: 4,
    label: "Complete OAuth 2.1 PKCE",
    officialSignal: "Use authorization-server and protected-resource metadata, DCR, PKCE S256, 5-day access tokens, exact redirect URIs, and reauth on 401.",
    mealPilotEvidence: "OAuth Status, Credential Cockpit, Sandbox Credential Workbench, and Staging Cutover keep the flow reviewable.",
    endpoint: "/api/auth/swiggy/status",
    status: "ready",
  },
  {
    id: "first_call",
    sequence: 5,
    label: "Make get_addresses first",
    officialSignal: "The minimal first call is get_addresses; seeing saved addresses proves the client is wired.",
    mealPilotEvidence: "First-call drills below exercise get_addresses on local JSON-RPC, then branch into Food, Instamart, and Dineout discovery calls.",
    endpoint: "/api/mcp/food",
    status: "ready",
  },
  {
    id: "build_real_route",
    sequence: 6,
    label: "Graduate into a real route",
    officialSignal: "Official recipes cover order food, order groceries, book a table, and combined evening planning.",
    mealPilotEvidence: "Journey Compiler, Scenario Runner, Premium Concierge, and Route Optimizer convert those recipes into MealPilot product routes.",
    endpoint: "/api/swiggy-journey-compiler",
    status: "ready",
  },
];

const allServerUrls = (["food", "instamart", "dineout"] as SwiggyServer[]).map(serverUrl);

const frameworkAdapters: DeveloperFrameworkAdapter[] = [
  {
    id: "openai_agents_js",
    label: "OpenAI Agents SDK JS",
    language: "typescript",
    authMode: "native_auth_provider",
    mcpClient: "MCPServerStreamableHttp",
    serverUrls: allServerUrls,
    setupSteps: ["Create one MCPServerStreamableHttp per Swiggy server.", "Pass MealPilot's PKCE OAuth provider.", "Connect and run the agent with get_addresses first."],
    firstCallPrompt: "Find my saved Swiggy address, then search vegetarian restaurants near it.",
    reconnectPolicy: "Reconnect the MCP server and re-run OAuth on 401 or JSON-RPC -32001.",
    status: "ready",
  },
  {
    id: "openai_agents_python",
    label: "OpenAI Agents SDK Python",
    language: "python",
    authMode: "bearer_header",
    mcpClient: "MCPServerStreamableHttp",
    serverUrls: allServerUrls,
    setupSteps: ["Complete OAuth through MealPilot's auth status flow.", "Pass Authorization: Bearer <token> headers.", "Keep commercial calls behind explicit confirmation."],
    firstCallPrompt: "Show my saved delivery addresses and recommend the first safe read-only call.",
    reconnectPolicy: "Fetch a fresh token on 401; retry only read/idempotent calls automatically.",
    status: "ready",
  },
  {
    id: "vercel_ai_sdk",
    label: "Vercel AI SDK 6",
    language: "typescript",
    authMode: "native_auth_provider",
    mcpClient: "experimental_createMCPClient",
    serverUrls: allServerUrls,
    setupSteps: ["Create streamable HTTP clients for /food, /im, and /dineout.", "Wire OAuth metadata discovery.", "Route final order/checkout/book-table tools through MealPilot confirmation UI."],
    firstCallPrompt: "Use Swiggy Food get_addresses, then search_menu for a high-protein vegetarian dish.",
    reconnectPolicy: "Use provider-level reauth hooks and fail closed if token refresh is unavailable.",
    status: "ready",
  },
  {
    id: "langgraph",
    label: "LangGraph / LangChain MCP adapters",
    language: "python",
    authMode: "bearer_header",
    mcpClient: "langchain-mcp-adapters",
    serverUrls: allServerUrls,
    setupSteps: ["Obtain a Swiggy access token via PKCE.", "Attach streamable_http transport and Authorization headers.", "Persist only redacted session state between graph nodes."],
    firstCallPrompt: "Fetch addresses, then branch into Instamart product search for missing pantry staples.",
    reconnectPolicy: "Re-run auth on 401 and replay from the last authoritative read, not from a stale graph memory.",
    status: "ready",
  },
  {
    id: "raw_mcp",
    label: "Raw MCP client",
    language: "multi",
    authMode: "native_auth_provider",
    mcpClient: "@modelcontextprotocol/sdk or mcp Python package",
    serverUrls: allServerUrls,
    setupSteps: ["Discover OAuth metadata.", "Register dynamically where supported.", "Call tools/list and tools/call with JSON-RPC 2.0."],
    firstCallPrompt: "Call get_addresses with empty arguments and inspect the address IDs.",
    reconnectPolicy: "Wrap tool calls in call-with-reauth and never blindly retry non-idempotent commercial actions.",
    status: "ready",
  },
];

const firstCallDrills: DeveloperFirstCallDrill[] = [
  {
    id: "food_get_addresses",
    server: "food",
    endpoint: endpointPath("food"),
    tool: "get_addresses",
    jsonRpc: { jsonrpc: "2.0", id: "dev-first-food-addresses", method: "tools/call", params: { name: "get_addresses", arguments: {} } },
    expectedSignal: "Saved delivery address list returns address IDs that can feed restaurant and menu calls.",
    prerequisites: ["OAuth token with mcp:tools", "User has at least one saved Swiggy address", "No write/commercial action requested"],
    retryPolicy: "Safe to retry once after 401 reauth; no cart or order state is mutated.",
    safetyGate: "Read-only; logs hash user context and omit full address text.",
    status: "ready",
  },
  {
    id: "food_search_restaurants",
    server: "food",
    endpoint: endpointPath("food"),
    tool: "search_restaurants",
    jsonRpc: {
      jsonrpc: "2.0",
      id: "dev-first-food-search",
      method: "tools/call",
      params: { name: "search_restaurants", arguments: { addressId: "from_get_addresses", query: "high protein vegetarian" } },
    },
    expectedSignal: "Restaurant candidates unlock menu browsing without placing an order.",
    prerequisites: ["addressId from get_addresses", "User intent is Food delivery"],
    retryPolicy: "Retry safe read after transient 5xx; do not mutate cart from this drill.",
    safetyGate: "Discovery-only; order placement stays behind place_food_order confirmation.",
    status: "ready",
  },
  {
    id: "instamart_search_products",
    server: "instamart",
    endpoint: endpointPath("instamart"),
    tool: "search_products",
    jsonRpc: {
      jsonrpc: "2.0",
      id: "dev-first-im-search",
      method: "tools/call",
      params: { name: "search_products", arguments: { addressId: "from_get_addresses", query: "paneer" } },
    },
    expectedSignal: "Product variants and spin IDs can feed an Instamart basket preview.",
    prerequisites: ["addressId from get_addresses", "User intent is grocery/essentials"],
    retryPolicy: "Retry read calls; update_cart and checkout require separate guarded steps.",
    safetyGate: "Checkout remains locked until explicit user confirmation.",
    status: "ready",
  },
  {
    id: "dineout_search_restaurants",
    server: "dineout",
    endpoint: endpointPath("dineout"),
    tool: "search_restaurants_dineout",
    jsonRpc: {
      jsonrpc: "2.0",
      id: "dev-first-dineout-search",
      method: "tools/call",
      params: { name: "search_restaurants_dineout", arguments: { lat: "from_saved_location", lng: "from_saved_location", query: "Italian" } },
    },
    expectedSignal: "Dineout restaurant IDs unlock slot checks before booking.",
    prerequisites: ["Saved location coordinates", "User intent is going out, not food delivery"],
    retryPolicy: "Retry search/slot reads; book_table is never retried blindly.",
    safetyGate: "Booking remains behind book_table confirmation and free-reservation constraints.",
    status: "ready",
  },
];

const recipeHandoffs: DeveloperRecipeHandoff[] = [
  {
    id: "order_food",
    label: "Order food end to end",
    officialDoc: "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
    servers: ["food"],
    tools: ["get_addresses", "search_restaurants", "get_restaurant_menu", "search_menu", "update_food_cart", "get_food_cart", "place_food_order"],
    routeOptimization: "Cache address and restaurant reads, refresh cart before order, and require explicit place_food_order confirmation.",
    confirmationGates: ["place_food_order"],
    evidenceLinks: ["/api/swiggy-journey-compiler", "/api/mcp/scenario-runner", "/api/mcp/commercial-action-guard"],
    status: "ready",
  },
  {
    id: "order_groceries",
    label: "Order groceries end to end",
    officialDoc: "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
    servers: ["instamart"],
    tools: ["get_addresses", "your_go_to_items", "search_products", "update_cart", "get_cart", "checkout", "track_order"],
    routeOptimization: "Prefer go-to items for reorders, search only pantry gaps, and refresh cart before checkout.",
    confirmationGates: ["checkout"],
    evidenceLinks: ["/api/premium-concierge-itinerary", "/api/mcp/scenario-runner", "/api/swiggy-route-optimizer"],
    status: "ready",
  },
  {
    id: "book_table",
    label: "Book a table",
    officialDoc: "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
    servers: ["dineout"],
    tools: ["get_saved_locations", "search_restaurants_dineout", "get_restaurant_details", "get_available_slots", "create_cart", "book_table", "get_booking_status"],
    routeOptimization: "Check slots before Food/Instamart side quests when the evening depends on table availability.",
    confirmationGates: ["book_table"],
    evidenceLinks: ["/api/swiggy-journey-compiler", "/api/luxury-experience-workspace", "/api/mcp/commercial-action-guard"],
    status: "ready",
  },
  {
    id: "combined_evening",
    label: "Plan my evening",
    officialDoc: "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
    servers: ["food", "dineout"],
    tools: ["get_saved_locations", "search_restaurants_dineout", "get_available_slots", "get_addresses", "search_restaurants", "search_menu", "update_food_cart"],
    routeOptimization: "Resolve Dineout availability first, then prepare Food cart as a separate optional action.",
    confirmationGates: ["book_table", "place_food_order"],
    evidenceLinks: ["/api/premium-concierge-itinerary", "/api/swiggy-route-optimizer", "/api/mcp/state-orchestrator"],
    status: "ready",
  },
];

const authGates: DeveloperQuickstartAuthGate[] = [
  {
    id: "metadata",
    label: "OAuth metadata discovery",
    officialRequirement: "Read /.well-known/oauth-authorization-server and /.well-known/oauth-protected-resource.",
    mealPilotControl: "Credential Cockpit and AI Client Connect Kit expose metadata URLs and client setup modes.",
    evidenceLinks: ["/api/credential-onboarding", "/api/ai-client-connect-kit"],
    status: "ready",
  },
  {
    id: "dcr",
    label: "Dynamic Client Registration",
    officialRequirement: "MCP-compatible clients register dynamically at /auth/register; no static API key is used.",
    mealPilotControl: "Credential Onboarding previews DCR payloads and keeps live registration external-gated.",
    evidenceLinks: ["/api/credential-onboarding", "/api/sandbox-credential-workbench"],
    status: "ready",
  },
  {
    id: "redirect",
    label: "Exact redirect URI",
    officialRequirement: "HTTPS is required except localhost; redirect URIs must exact-match and never be open redirects.",
    mealPilotControl: "OAuth Status and Access Submission Studio audit localhost and production redirect values.",
    evidenceLinks: ["/api/auth/swiggy/status", "/api/access-submission-studio"],
    status: "operator_input",
  },
  {
    id: "token_lifecycle",
    label: "Token lifecycle and storage",
    officialRequirement: "Access token lasts 5 days; authorization code lasts 120 seconds; re-run authorization on 401.",
    mealPilotControl: "MCP Gateway fails closed without tokens and never logs bearer values.",
    evidenceLinks: ["/api/mcp-gateway", "/api/data-governance-center"],
    status: "ready",
  },
  {
    id: "staging",
    label: "Staging credentials",
    officialRequirement: "Production follows once staging integration is green after Swiggy access approval.",
    mealPilotControl: "Staging Certification and Staging Cutover preserve this as a Swiggy-owned external gate.",
    evidenceLinks: ["/api/staging-certification-matrix", "/api/mcp/staging-cutover"],
    status: "external_gate",
  },
];

function countReady() {
  return [...readinessSteps, ...frameworkAdapters, ...firstCallDrills, ...recipeHandoffs, ...authGates].filter(
    (item) => item.status === "ready",
  ).length;
}

export function buildDeveloperQuickstartWorkbench(): DeveloperQuickstartWorkbench {
  const coverage = buildMcpCoverage();
  const totalTools = coverage.reduce((sum, server) => sum + server.totalTools, 0);
  const scoredItems = [...readinessSteps, ...frameworkAdapters, ...firstCallDrills, ...recipeHandoffs, ...authGates];
  const score = Math.round((scoredItems.reduce((sum, item) => sum + statusScore(item.status), 0) / scoredItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      steps: readinessSteps.length,
      frameworks: frameworkAdapters.length,
      firstCallDrills: firstCallDrills.length,
      recipeHandoffs: recipeHandoffs.length,
      authGates: authGates.length,
      readyItems: countReady(),
    },
    readinessSteps,
    frameworkAdapters,
    firstCallDrills,
    recipeHandoffs,
    authGates,
    commands: [
      {
        id: "quickstart_readback",
        command: "curl -s http://localhost:8787/api/swiggy-developer-quickstart",
        proves: "Developer quickstart workbench is reviewer-readable.",
        expectedSignal: "JSON includes readinessSteps, frameworkAdapters, firstCallDrills, and authGates.",
      },
      {
        id: "first_call_mock",
        command: "curl -s -X POST http://localhost:8787/api/mcp/food -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"id\":\"dev-first\",\"method\":\"tools/call\",\"params\":{\"name\":\"get_addresses\",\"arguments\":{}}}'",
        proves: "Local JSON-RPC mock can exercise the official first Swiggy tool call before credentials.",
        expectedSignal: "Result includes success/data for get_addresses and no live token is required in mock mode.",
      },
      {
        id: "production_verifier",
        command: "npm run verify:production",
        proves: "Production smoke validates quickstart totals, first-call drills, and launch/reviewer evidence.",
        expectedSignal: "developerQuickstartScore and developerQuickstartFirstCalls appear in JSON output.",
      },
    ],
    assertions: [
      `Workbench maps the official self-serve quickstart into ${readinessSteps.length} concrete readiness steps.`,
      `Framework adapters cover native OAuth-provider and bearer-header SDK modes while preserving all ${totalTools} Swiggy tools.`,
      "The first-call drill starts with get_addresses, then branches into Food, Instamart, and Dineout read-only discovery.",
      "OAuth, Dynamic Client Registration, exact redirect, token lifecycle, and staging credentials stay explicit gates.",
      "Official recipes hand off into Journey Compiler, Scenario Runner, Route Optimizer, and Commercial Action Guard instead of isolated samples.",
    ],
    externalGates: [
      "Live phone + OTP consent, staging credentials, and production approval remain Swiggy-controlled.",
      "Final production redirect URI, demo video, static egress details, and engineering contact must be filled by the operator.",
      "Bearer-token SDK examples require secure runtime token storage before staging or production calls.",
    ],
  };
}
