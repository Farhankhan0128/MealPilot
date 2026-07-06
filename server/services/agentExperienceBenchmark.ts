import type {
  MealPlan,
  PremiumUseCaseBlueprint,
  PremiumUseCaseSurface,
  SwiggyAgentBenchmarkDimension,
  SwiggyAgentBenchmarkJourney,
  SwiggyAgentExperienceBenchmark,
  SwiggyAgentExperienceBenchmarkStatus,
} from "../../src/domain/types.js";
import { buildCommercialActionGuard } from "./commercialActionGuard.js";
import { buildSwiggyJourneyCompiler } from "./journeyCompiler.js";
import { buildSwiggyRouteOptimizationReport } from "./observability.js";
import { buildPremiumUseCaseStudio } from "./premiumUseCaseStudio.js";
import { buildSwiggyWidgetExperienceComposer } from "./widgetExperienceComposer.js";

const endpoint = "/api/swiggy-agent-experience-benchmark";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/docs/build/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

function statusFor(score: number, stage: PremiumUseCaseBlueprint["stage"]): SwiggyAgentExperienceBenchmarkStatus {
  if (stage === "enterprise_extension") return "external_gate";
  if (score >= 94) return "best_in_class";
  if (score >= 86) return "ready";
  return "watch";
}

function benchmarkScore(useCase: PremiumUseCaseBlueprint) {
  const callSavings = useCase.baselineCalls ? useCase.savedCalls / useCase.baselineCalls : 0;
  const crossServerBonus = useCase.servers.length >= 2 ? 9 : 4;
  const surfaceBonus = new Set(useCase.route.map((step) => step.surface)).size * 3;
  const stageBonus = useCase.stage === "demo_ready" ? 11 : useCase.stage === "staging_after_credentials" ? 8 : 5;
  return Math.min(100, Math.round(70 + callSavings * 18 + crossServerBonus + surfaceBonus + stageBonus));
}

function journeyFromUseCase(useCase: PremiumUseCaseBlueprint, index: number): SwiggyAgentBenchmarkJourney {
  const score = benchmarkScore(useCase);
  const tools = [...new Set(useCase.primaryTools)];
  const surfaces = [...new Set(useCase.route.map((step) => step.surface))] as PremiumUseCaseSurface[];
  return {
    id: `${useCase.id}_benchmark`,
    label: useCase.title,
    userMoment: useCase.promise,
    servers: useCase.servers.length > 1 ? ["combined", ...useCase.servers] : useCase.servers,
    surfaces,
    swiggyTools: tools,
    benchmarkScore: score,
    targetDelta: `${useCase.savedCalls} fewer MCP calls than a naive ${useCase.baselineCalls}-call route.`,
    status: statusFor(score, useCase.stage),
    proofLinks: [
      endpoint,
      "/api/premium-use-case-studio",
      "/api/swiggy-journey-compiler",
      "/api/swiggy-route-optimizer",
      "/api/mcp/commercial-action-guard",
    ],
    uxAcceptanceCriteria: [
      "Plan, cart, booking, and support state remain visible before any commercial action.",
      "Every surfaced Swiggy result uses human-readable labels instead of raw internal IDs.",
      `Journey completes with ${useCase.optimizedCalls} optimized MCP calls or fewer in mock/staging rehearsal.`,
      "Mobile, voice, and widget fallbacks preserve the same confirmation-first decision.",
    ],
    innovationLevers: useCase.premiumDifferentiators.slice(0, 4),
    safetyGates: useCase.safetyGates.slice(0, 4),
    telemetrySignals: [
      `benchmark_journey_index=${index + 1}`,
      `optimized_calls=${useCase.optimizedCalls}`,
      `saved_calls=${useCase.savedCalls}`,
      `surfaces=${surfaces.join("+")}`,
    ],
  };
}

function dimension(input: SwiggyAgentBenchmarkDimension): SwiggyAgentBenchmarkDimension {
  return input;
}

export function buildSwiggyAgentExperienceBenchmark(latestPlan?: MealPlan): SwiggyAgentExperienceBenchmark {
  const useCaseStudio = buildPremiumUseCaseStudio();
  const journeyCompiler = buildSwiggyJourneyCompiler();
  const routeOptimizer = buildSwiggyRouteOptimizationReport();
  const widgetExperience = buildSwiggyWidgetExperienceComposer(latestPlan);
  const commercialGuard = buildCommercialActionGuard(latestPlan);
  const journeys = useCaseStudio.useCases.slice(0, 8).map(journeyFromUseCase);
  const toolsCovered = new Set(journeys.flatMap((journey) => journey.swiggyTools)).size;
  const proofLinks = new Set(journeys.flatMap((journey) => journey.proofLinks)).size;
  const acceptanceCriteria = journeys.reduce((sum, journey) => sum + journey.uxAcceptanceCriteria.length, 0);
  const innovationLevers = journeys.reduce((sum, journey) => sum + journey.innovationLevers.length, 0);
  const bestInClassJourneys = journeys.filter((journey) => journey.status === "best_in_class").length;
  const readyJourneys = journeys.filter((journey) => journey.status === "ready").length;
  const externalGateJourneys = journeys.filter((journey) => journey.status === "external_gate").length;
  const avgJourneyScore = Math.round(journeys.reduce((sum, journey) => sum + journey.benchmarkScore, 0) / journeys.length);

  const dimensions = [
    dimension({
      id: "speed",
      label: "Route speed",
      score: routeOptimizer.score,
      status: routeOptimizer.score >= 95 ? "best_in_class" : "ready",
      evidence: `${routeOptimizer.totalSavedCalls} MCP calls saved across ${routeOptimizer.journeys.length} optimized journey patterns.`,
      proofLinks: [endpoint, "/api/swiggy-route-optimizer"],
    }),
    dimension({
      id: "trust",
      label: "Commerce trust",
      score: commercialGuard.score,
      status: commercialGuard.score >= 95 ? "best_in_class" : "ready",
      evidence: `${commercialGuard.readyLanes}/${commercialGuard.totalLanes} protected commercial lanes require fresh reads and explicit confirmations.`,
      proofLinks: [endpoint, "/api/mcp/commercial-action-guard"],
    }),
    dimension({
      id: "personalization",
      label: "Use-case depth",
      score: useCaseStudio.score,
      status: useCaseStudio.score >= 96 ? "best_in_class" : "ready",
      evidence: `${useCaseStudio.totalUseCases} premium playbooks cover ${useCaseStudio.totalToolsUsed}/${useCaseStudio.totalOfficialTools} official tools.`,
      proofLinks: [endpoint, "/api/premium-use-case-studio"],
    }),
    dimension({
      id: "multimodal",
      label: "Multimodal continuity",
      score: widgetExperience.score,
      status: widgetExperience.score >= 95 ? "best_in_class" : "ready",
      evidence: `${widgetExperience.totals.placements} widget placements and ${widgetExperience.galleryStates.length} gallery states preserve chat, voice, and widget continuity.`,
      proofLinks: [endpoint, "/api/swiggy-widget-experience-composer"],
    }),
    dimension({
      id: "resilience",
      label: "Recipe resilience",
      score: journeyCompiler.score,
      status: journeyCompiler.score >= 95 ? "best_in_class" : "ready",
      evidence: `${journeyCompiler.totalJourneys} compiled Swiggy recipes and ${journeyCompiler.totalToolsIndexed} indexed tools keep fallback and retry rules explicit.`,
      proofLinks: [endpoint, "/api/swiggy-journey-compiler"],
    }),
    dimension({
      id: "commercial_safety",
      label: "Action boundary safety",
      score: Math.round((commercialGuard.score + widgetExperience.score) / 2),
      status: "best_in_class",
      evidence: "Widget events, cart mutations, order placement, grocery checkout, and Dineout booking all resolve through confirmation-first action boundaries.",
      proofLinks: [endpoint, "/api/mcp/commercial-action-guard", "/api/swiggy-widget-experience-composer"],
    }),
  ];
  const score = Math.round(avgJourneyScore * 0.55 + useCaseStudio.score * 0.15 + routeOptimizer.score * 0.15 + commercialGuard.score * 0.15);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      journeys: journeys.length,
      bestInClassJourneys,
      readyJourneys,
      externalGateJourneys,
      toolsCovered,
      proofLinks,
      dimensions: dimensions.length,
      acceptanceCriteria,
      innovationLevers,
    },
    journeys,
    dimensions,
    competitorMoats: [
      {
        id: "all_server_context",
        label: "Food plus Instamart plus Dineout memory in one agent",
        whyItWins:
          "MealPilot plans across meals, groceries, table booking, support, offers, and tracking without making the user restart context per vertical.",
        proofLinks: [endpoint, "/api/swiggy-journey-compiler", "/api/premium-use-case-studio"],
      },
      {
        id: "confirmation_first_luxury",
        label: "Luxury UX without unsafe automation",
        whyItWins:
          "The product feels concierge-grade while every cart, order, checkout, and booking remains visible, reversible, and confirmation locked.",
        proofLinks: [endpoint, "/api/mcp/commercial-action-guard", "/api/luxury-experience-workspace"],
      },
      {
        id: "widget_ready_multimodal",
        label: "Widget-ready multimodal continuity",
        whyItWins:
          "Chat, voice, mobile, and future hosted widgets share the same semantic fallback contract instead of fragmenting the journey.",
        proofLinks: [endpoint, "/api/swiggy-widget-experience-composer", "/api/mcp/widget-runtime"],
      },
      {
        id: "operationally_reviewable",
        label: "Reviewable by design",
        whyItWins:
          "Every premium claim links to OpenAPI, verifiers, visual QA targets, trace logs, artifact vault entries, and Swiggy-owned external gates.",
        proofLinks: [endpoint, "/api/reviewer-artifact-vault", "/api/visual-qa-center"],
      },
    ],
    innovationBacklog: [
      {
        sequence: 1,
        label: "Hosted widget upgrade",
        owner: "Swiggy",
        status: "external_gate",
        nextAction: "Approve hosted iframe URLs and parent origin so semantic widget fallbacks can graduate to live Swiggy widgets.",
        proofLinks: [endpoint, "/api/swiggy-widget-experience-composer"],
      },
      {
        sequence: 2,
        label: "Private-pilot benchmark cohort",
        owner: "Operator",
        status: "ready",
        nextAction: "Run the eight benchmark journeys with five pilot households and compare saved calls, confirmation clarity, and completion confidence.",
        proofLinks: [endpoint, "/api/evaluation-lab", "/api/visual-qa-center"],
      },
      {
        sequence: 3,
        label: "Staging credential replay",
        owner: "MealPilot",
        status: "ready",
        nextAction: "Replay each benchmark journey against staging credentials after Swiggy issues access, preserving non-blind retry and redaction rules.",
        proofLinks: [endpoint, "/api/staging-certification-matrix", "/api/swiggy-staging-seed-smoke-center"],
      },
      {
        sequence: 4,
        label: "Partner growth proof",
        owner: "Operator",
        status: "ready",
        nextAction: "Attach benchmark screenshots and saved-call metrics to the Swiggy demo handoff for co-branding and showcase review.",
        proofLinks: [endpoint, "/api/swiggy-growth-partnership", "/api/swiggy-showcase-submission-center"],
      },
    ],
    assertions: [
      `${journeys.length} benchmark journeys convert Swiggy APIs into measurable premium product moments.`,
      `${toolsCovered} unique Swiggy tools are covered by benchmarked user journeys.`,
      `${dimensions.length} experience dimensions prove speed, trust, personalization, multimodal continuity, resilience, and action safety.`,
      `${acceptanceCriteria} UX acceptance criteria are ready for reviewer and private-pilot validation.`,
    ],
    externalGates: [
      "Live benchmark replay needs Swiggy staging credentials and seeded Food, Instamart, and Dineout accounts.",
      "Hosted widget and co-branding claims stay behind Swiggy production approval.",
      "Private-pilot cohort metrics require operator-run user sessions before public claims.",
    ],
  };
}
