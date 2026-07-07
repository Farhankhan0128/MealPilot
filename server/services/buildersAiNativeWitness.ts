import type {
  MealPlan,
  SwiggyBuildersAiNativeWitness,
  SwiggyBuildersAiNativeWitnessGroup,
  SwiggyBuildersAiNativeWitnessRow,
  SwiggyBuildersAiNativeWitnessStatus,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";
import { buildSwiggyAgentExperienceBenchmark } from "./agentExperienceBenchmark.js";
import { buildAiClientConnectKit } from "./aiClientConnect.js";
import { buildCodingAgentGovernance } from "./codingAgentGovernance.js";
import { buildSwiggyInnovationRadar } from "./innovationRadar.js";
import { buildMcpResourcePromptStudio } from "./resourcePromptStudio.js";
import { buildSwiggyStateOrchestrator } from "./stateOrchestrator.js";
import { buildSwiggyHostedWidgetActivationCenter } from "./hostedWidgetActivation.js";
import { buildSwiggyWidgetExperienceComposer } from "./widgetExperienceComposer.js";
import { buildSwiggyWidgetRuntime } from "./widgetRuntime.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function weightFor(status: SwiggyBuildersAiNativeWitnessStatus) {
  if (status === "proven") return 1;
  if (status === "ready") return 0.94;
  if (status === "semantic_fallback") return 0.86;
  if (status === "operator_gate") return 0.82;
  if (status === "swiggy_gate") return 0.76;
  return 0.68;
}

function groupFor(row: SwiggyBuildersAiNativeWitnessRow) {
  if (row.kind === "agent_experience" || row.kind === "commercial_safety" || row.kind === "state_orchestration") {
    return "agent_runtime";
  }
  if (row.kind === "client_connect" || row.kind === "coding_agent" || row.kind === "resource_prompt") {
    return "client_connect";
  }
  if (row.kind === "widget_runtime") return "experience_surfaces";
  return "innovation_governance";
}

function row(input: SwiggyBuildersAiNativeWitnessRow): SwiggyBuildersAiNativeWitnessRow {
  return input;
}

export function buildSwiggyBuildersAiNativeWitness(latestPlan?: MealPlan): SwiggyBuildersAiNativeWitness {
  const atlas = buildSwiggyWebsiteAtlas();
  const agentBenchmark = buildSwiggyAgentExperienceBenchmark(latestPlan);
  const aiClient = buildAiClientConnectKit();
  const codingAgent = buildCodingAgentGovernance();
  const resourcePrompt = buildMcpResourcePromptStudio();
  const stateOrchestrator = buildSwiggyStateOrchestrator(latestPlan);
  const widgetRuntime = buildSwiggyWidgetRuntime(latestPlan);
  const widgetExperience = buildSwiggyWidgetExperienceComposer(latestPlan);
  const hostedWidget = buildSwiggyHostedWidgetActivationCenter(latestPlan);
  const innovationRadar = buildSwiggyInnovationRadar();
  const coverage = buildMcpCoverage();
  const officialTools = coverage.reduce((sum, server) => sum + server.totalTools, 0);

  const rows = [
    row({
      id: "ai_native_agent_experience",
      label: "AI-native agent experience",
      kind: "agent_experience",
      officialSignal: "Swiggy positions Builders as an AI-native platform for real Food, Instamart, and Dineout products.",
      sourceUrl: `${atlas.officialSource}docs/start/developer/build-an-agent/`,
      owner: "MealPilot",
      status: agentBenchmark.score >= 90 ? "proven" : "watch",
      mealPilotSurface: "Agent Experience Benchmark, Premium Use Case Studio, Journey Compiler, Route Optimizer",
      evidence: `${agentBenchmark.totals.journeys} benchmark journeys, ${agentBenchmark.totals.bestInClassJourneys} best-in-class journeys, and ${agentBenchmark.totals.toolsCovered} tools covered.`,
      routeOptimization: "Use the benchmark route plans to collapse multi-server journeys into fewer MCP calls without hiding confirmation gates.",
      riskBoundary: "Agent benchmark claims remain local proof until Swiggy grants staging credentials and production access.",
      nextAction: "Run the eight benchmark journeys in a private pilot after staging tokens are issued.",
      proofLinks: ["/api/swiggy-agent-experience-benchmark", "/api/premium-use-case-studio", "/api/swiggy-journey-compiler"],
      relatedApis: ["/api/swiggy-route-optimizer", "/api/mcp/commercial-action-guard"],
    }),
    row({
      id: "ai_client_connect",
      label: "AI client connection kit",
      kind: "client_connect",
      officialSignal: "Builders can wire Swiggy MCP servers into AI clients and agent SDKs through remote MCP configuration.",
      sourceUrl: `${atlas.officialSource}docs/start/consumer/use-in-ai-client/`,
      owner: "Joint",
      status: aiClient.score >= 90 ? "ready" : "watch",
      mealPilotSurface: "AI Client Connect Kit",
      evidence: `${aiClient.clientTargets.length} client targets, ${aiClient.sdkAdapters.length} SDK adapters, and ${aiClient.servers.length} Swiggy MCP server configs are copy-ready or gated.`,
      routeOptimization: "Keep Food, Instamart, and Dineout server configs separate so clients can request only the required server.",
      riskBoundary: "External AI clients complete OAuth outside MealPilot and must preserve visible commercial confirmation.",
      nextAction: "Use the generated redacted configs only after Swiggy OAuth is approved for the target client.",
      proofLinks: ["/api/ai-client-connect-kit", "/api/mcp/catalog", "/api/mcp/capability-registry"],
      relatedApis: ["/api/enterprise-delegated-auth", "/api/swiggy-auth-lifecycle-center"],
    }),
    row({
      id: "coding_agent_governance",
      label: "Coding-agent governance",
      kind: "coding_agent",
      officialSignal: "Swiggy documents coding-agent setup and source-first implementation behavior for builders.",
      sourceUrl: `${atlas.officialSource}docs/start/coding-agents/`,
      owner: "MealPilot",
      status: codingAgent.score >= 95 ? "proven" : "watch",
      mealPilotSurface: "Coding Agent Governance and AGENTS.md",
      evidence: `${codingAgent.ruleFile.matchedSignals}/${codingAgent.ruleFile.totalSignals} coding-agent source, tool-count, and safety signals are enforced.`,
      routeOptimization: "Route future agent edits through official docs, llms manifests, and reference pages before code changes.",
      riskBoundary: "No coding agent may invent Swiggy tools, parameters, auth behavior, or production limits from memory.",
      nextAction: "Keep AGENTS.md synchronized with Swiggy docs before every access submission.",
      proofLinks: ["/api/coding-agent-governance", "/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer"],
      relatedApis: ["/api/swiggy-llms-manifest-verifier", "/api/swiggy-tool-parity-auditor"],
    }),
    row({
      id: "resources_prompts_runtime",
      label: "Resources and prompts runtime",
      kind: "resource_prompt",
      officialSignal: "Swiggy MCP supports tools, resources, prompts, and metadata beyond one-off tool calls.",
      sourceUrl: `${atlas.officialSource}docs/start/`,
      owner: "MealPilot",
      status: resourcePrompt.score >= 95 ? "proven" : "ready",
      mealPilotSurface: "Resource & Prompt Studio and Capability Registry",
      evidence: `${resourcePrompt.readyResources}/${resourcePrompt.totalResources} resources and ${resourcePrompt.readyPrompts}/${resourcePrompt.totalPrompts} prompts are ready across Food, Instamart, and Dineout.`,
      routeOptimization: "Use resources for static metadata and widget registries; use prompts for server-specialist behavior instead of repeating large instructions.",
      riskBoundary: "Mock resource and prompt responses stay metadata-only until Swiggy provides live resource/prompt access.",
      nextAction: "Replay resources/list, resources/read, prompts/list, and prompts/get against staging once OAuth is live.",
      proofLinks: ["/api/mcp/resource-prompt-studio", "/api/mcp/capability-registry", "/api/mcp/tool-contract-matrix"],
      relatedApis: ["/api/mcp/food", "/api/mcp/instamart", "/api/mcp/dineout"],
    }),
    row({
      id: "multi_turn_state",
      label: "Multi-turn state orchestration",
      kind: "state_orchestration",
      officialSignal: "AI-native commerce agents must refresh state before mutations and preserve turn boundaries across chat, voice, and widgets.",
      sourceUrl: `${atlas.officialSource}docs/build/agent-patterns/multi-turn-state/`,
      owner: "MealPilot",
      status: stateOrchestrator.score >= 90 ? "proven" : "watch",
      mealPilotSurface: "State Orchestrator and Scenario Runner",
      evidence: `${stateOrchestrator.totalScenarios} scenarios, ${stateOrchestrator.totalTurnBoundaries} turn boundaries, ${stateOrchestrator.refreshBeforeMutationCount} refresh-before-mutation guards, and ${stateOrchestrator.confirmationGateCount} confirmation gates.`,
      routeOptimization: "Refresh authoritative server state at each cart, booking, support, or checkout turn instead of trusting agent memory.",
      riskBoundary: "Unsafe remembered state is rejected before commercial actions and before support escalation.",
      nextAction: "Run state rehearsals for every new multi-modal journey before exposing it in the Launch Center.",
      proofLinks: ["/api/mcp/state-orchestrator", "/api/mcp/scenario-runner", "/api/mcp/commercial-action-guard"],
      relatedApis: ["/api/sessions/:sessionId/replay", "/api/sessions/:sessionId/surface"],
    }),
    row({
      id: "widget_ai_surfaces",
      label: "Widget and multimodal surfaces",
      kind: "widget_runtime",
      officialSignal: "Swiggy Builders supports widget-style experiences and multi-surface agent patterns.",
      sourceUrl: `${atlas.officialSource}docs/build/widgets/`,
      owner: "Joint",
      status: hostedWidget.totals.externalGates > 0 ? "semantic_fallback" : "ready",
      mealPilotSurface: "Widget Runtime, Widget Experience Composer, Hosted Widget Activation Center",
      evidence: `${widgetRuntime.fallbackReady}/${widgetRuntime.totalSurfaces} widget fallbacks, ${widgetExperience.totals.placements} placements, and ${hostedWidget.totals.readyFallbackParity}/${hostedWidget.totals.fallbackParity} hosted-widget parity checks are ready.`,
      routeOptimization: "Render semantic fallbacks locally while preserving the same event contract expected by hosted Swiggy widgets.",
      riskBoundary: "Hosted iframe URLs, parent origins, and official widget enablement remain Swiggy-owned gates.",
      nextAction: "Promote semantic fallbacks to hosted widgets only after Swiggy approves widget origins and activation headers.",
      proofLinks: ["/api/mcp/widget-runtime", "/api/swiggy-widget-experience-composer", "/api/swiggy-hosted-widget-activation"],
      relatedApis: ["/api/visual-qa-center", "/api/sessions/:sessionId/widgets"],
    }),
    row({
      id: "innovation_loop",
      label: "Innovation radar and experiment loop",
      kind: "innovation_loop",
      officialSignal: "Swiggy encourages builders to experiment freely and ship standout AI-native use cases.",
      sourceUrl: `${atlas.officialSource}developers/`,
      owner: "Joint",
      status: innovationRadar.score >= 80 ? "ready" : "watch",
      mealPilotSurface: "Innovation Radar, Benefits Witness, Growth Partnership, Premium Use Case Studio",
      evidence: `${innovationRadar.opportunityCount} opportunity lanes, ${innovationRadar.routeOptimizations.length} route optimizations, and ${innovationRadar.buildPhases.length} build phases are tracked.`,
      routeOptimization: "Convert every new Builders idea into a lane with tools, surfaces, route savings, premium differentiator, and gate status.",
      riskBoundary: "Staging, hosted widgets, production users, co-marketing, and feature placement remain gated until Swiggy approval.",
      nextAction: "Lift the Innovation Radar score by moving screenshot-to-order and enterprise tenant lanes from staging/partner gates into rehearsed packets.",
      proofLinks: ["/api/swiggy-innovation-radar", "/api/swiggy-growth-partnership", "/api/swiggy-builders-benefits-witness"],
      relatedApis: ["/api/premium-use-case-studio", "/api/swiggy-showcase-submission-center"],
    }),
    row({
      id: "commercial_safety_boundary",
      label: "Commercial action boundary",
      kind: "commercial_safety",
      officialSignal: "AI-native commerce must keep order, checkout, and booking actions visible and confirmation-first.",
      sourceUrl: `${atlas.officialSource}docs/build/ship-to-production/`,
      owner: "MealPilot",
      status: "proven",
      mealPilotSurface: "Agent Experience Benchmark commercial safety dimension and Commercial Action Guard",
      evidence: `${agentBenchmark.dimensions.find((dimension) => dimension.id === "commercial_safety")?.score ?? 0}/100 commercial safety dimension with explicit cart, checkout, order, and Dineout booking boundaries.`,
      routeOptimization: "Parallelize read/discovery work, then serialize commercial writes behind fresh readbacks and explicit user consent.",
      riskBoundary: "MealPilot never hides place_food_order, checkout, or book_table inside an ambiguous continue action.",
      nextAction: "Keep commercial safety as a release-blocking assertion in production and visual QA verifiers.",
      proofLinks: ["/api/mcp/commercial-action-guard", "/api/swiggy-agent-experience-benchmark", "/api/swiggy-interaction-qa-center"],
      relatedApis: ["/api/swiggy-confirmation-command-center", "/api/swiggy-cart-mutation-workbench"],
    }),
  ];

  const proofLinks = unique(rows.flatMap((item) => item.proofLinks));
  const groupDefs = [
    { id: "agent_runtime", label: "Agent runtime and safety" },
    { id: "client_connect", label: "Clients, prompts, and coding agents" },
    { id: "experience_surfaces", label: "Widgets and multimodal surfaces" },
    { id: "innovation_governance", label: "Innovation and governance" },
  ];
  const groups: SwiggyBuildersAiNativeWitnessGroup[] = groupDefs.map((group) => {
    const groupRows = rows.filter((item) => groupFor(item) === group.id);
    return {
      id: group.id,
      label: group.label,
      rows: groupRows.length,
      proven: groupRows.filter((item) => item.status === "proven").length,
      ready: groupRows.filter((item) => item.status === "ready").length,
      semanticFallbacks: groupRows.filter((item) => item.status === "semantic_fallback").length,
      gates: groupRows.filter((item) => item.status === "operator_gate" || item.status === "swiggy_gate").length,
      watch: groupRows.filter((item) => item.status === "watch").length,
      proofLinks: unique(groupRows.flatMap((item) => item.proofLinks)),
    };
  });
  const watch = rows.filter((item) => item.status === "watch").length;
  const swiggyGates = rows.filter((item) => item.status === "swiggy_gate").length;
  const score = Math.round((rows.reduce((sum, item) => sum + weightFor(item.status), 0) / rows.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    decision: swiggyGates > 2 ? "ai_native_blocked" : watch > 0 || swiggyGates > 0 ? "ai_native_watch" : "ai_native_ready",
    officialSources: unique([
      atlas.officialSource,
      ...agentBenchmark.officialSources,
      ...aiClient.officialSources,
      ...stateOrchestrator.officialSources,
      ...widgetRuntime.officialSources,
      ...widgetExperience.officialSources,
      ...hostedWidget.officialSources,
    ]),
    totals: {
      rows: rows.length,
      proven: rows.filter((item) => item.status === "proven").length,
      ready: rows.filter((item) => item.status === "ready").length,
      semanticFallbacks: rows.filter((item) => item.status === "semantic_fallback").length,
      operatorGates: rows.filter((item) => item.status === "operator_gate").length,
      swiggyGates,
      watch,
      proofLinks: proofLinks.length,
      officialTools,
      benchmarkJourneys: agentBenchmark.totals.journeys,
      clientTargets: aiClient.clientTargets.length,
      resources: resourcePrompt.totalResources,
      prompts: resourcePrompt.totalPrompts,
      widgetSurfaces: widgetRuntime.totalSurfaces,
    },
    rows,
    groups,
    commands: [
      {
        id: "ai_native_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-ai-native-witness",
        proves: "Official AI-native Builders promises are mapped to agents, clients, prompts, state, widgets, innovation, and safety evidence.",
        expectedSignal: "totals.rows >= 8 && totals.officialTools === 35",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke keeps AI Native Witness aligned with agent benchmark, client connect, coding-agent, and widget evidence.",
        expectedSignal: "aiNativeWitnessScore >= 88",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The AI Native Witness card is captured with every reviewer-critical Launch Center surface.",
        expectedSignal: "77 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Every AI-native row points to a product surface, proof links, route optimization, risk boundary, and source URL.",
      "AI client, coding-agent, resource, prompt, state, widget, and commercial-safety capabilities are witnessed separately instead of hidden behind one benchmark score.",
      "Hosted widget activation, production credentials, external AI clients, and Swiggy approval remain explicit gates.",
      "The Innovation Radar watch state stays visible so the next product slices move weak lanes toward rehearsed evidence.",
    ],
    externalGates: [
      "Swiggy must approve production credentials, hosted widget origins, external client OAuth, and any public AI-native claims.",
      "Operators must run private-pilot benchmark journeys and record demo proof before claiming production user outcomes.",
      "Public Builders docs can drift; AI Native Witness should be refreshed with Docs Coverage and Source Intelligence before submission.",
    ],
  };
}
