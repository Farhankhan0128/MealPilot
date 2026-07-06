import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { createMealPlan } from "../src/domain/planner.js";
import { defaultUserProfile } from "../src/domain/profile.js";
import type { GroupMember, PantryItem, SwiggyServer, UserPlanningRequest } from "../src/domain/types.js";
import { readConfig, type ServerConfig } from "./config.js";
import { handleMockJsonRpc } from "./mock/swiggyToolRouter.js";
import { executeAllPreparedRecommendations, executeConfirmedRecommendation } from "./services/confirmationService.js";
import {
  buildAgentSurfaceResponse,
  buildApplicationMarkdown,
  buildGoLiveChecks,
  buildGroupPlan,
  buildIncidentReport,
  buildMcpCoverage,
  buildObservabilityMetrics,
  buildOpsStatus,
  buildPlanReminders,
  buildRestockSuggestions,
} from "./services/advancedWorkflows.js";
import { buildAiClientConnectKit } from "./services/aiClientConnect.js";
import { buildAccessSubmissionStudio } from "./services/accessSubmissionStudio.js";
import { buildAuditLedgerCenter } from "./services/auditLedger.js";
import { buildBrandComplianceKit } from "./services/brandCompliance.js";
import { buildBuilderPacketExport, buildBuilderPacketMarkdown } from "./services/builderPacketExport.js";
import { buildMcpBackpressureGovernor } from "./services/backpressureGovernor.js";
import { buildSwiggyBuilderIntakeCommandCenter } from "./services/builderIntake.js";
import { buildSwiggyCartMutationWorkbench } from "./services/cartMutationWorkbench.js";
import { buildSwiggyChannelMultimodalStudio } from "./services/channelMultimodalStudio.js";
import { buildCodingAgentGovernance } from "./services/codingAgentGovernance.js";
import { buildCommercialActionGuard } from "./services/commercialActionGuard.js";
import { buildSwiggyCancellationCareCenter } from "./services/cancellationCareCenter.js";
import { buildSwiggyConfirmationCommandCenter } from "./services/confirmationCommandCenter.js";
import { buildSwiggyCtaExecutionCenter } from "./services/ctaExecutionCenter.js";
import { buildSwiggyAccessEvidenceMatrix } from "./services/accessEvidenceMatrix.js";
import { buildSwiggyAccessDossier } from "./services/swiggyAccessDossier.js";
import {
  buildReadinessChecklist,
  buildTrackingEvents,
  removeRecommendationItem,
  substitutePlanItem,
} from "./services/planOperations.js";
import {
  buildCartPreflightReport,
  buildDemoStudio,
  buildMcpReplay,
  buildSubmissionPackage,
} from "./services/demoStudio.js";
import { buildMcpCapabilityRegistry } from "./services/capabilityRegistry.js";
import { buildEvaluationLab } from "./services/evaluationLab.js";
import { buildErrorIntelligenceReport } from "./services/errorIntelligence.js";
import { buildSwiggyFaqPolicyCenter } from "./services/faqPolicyCenter.js";
import { buildGuestCollaborationCenter } from "./services/guestCollaborationCenter.js";
import { buildSwiggyGrowthPartnershipCenter } from "./services/growthPartnership.js";
import { buildHouseholdPreferenceGraph } from "./services/householdPreferenceGraph.js";
import { buildSwiggyInnovationRadar } from "./services/innovationRadar.js";
import { buildSwiggyJourneyCompiler } from "./services/journeyCompiler.js";
import { buildLaunchBundle } from "./services/launchBundle.js";
import { buildSwiggyLoadLab } from "./services/loadLab.js";
import { buildSwiggyLocationTrust } from "./services/locationTrust.js";
import { buildLuxuryExperienceWorkspace } from "./services/luxuryExperienceWorkspace.js";
import {
  buildMcpGatewayStatus,
  callConfiguredSwiggyTool,
  exchangeSwiggyAuthorizationCode,
} from "./services/mcpGateway.js";
import { buildCredentialOnboardingReport } from "./services/credentialOnboarding.js";
import { buildDataGovernanceCenter } from "./services/dataGovernance.js";
import { buildSwiggyDeepSiteMap } from "./services/deepSiteMap.js";
import { buildDeveloperQuickstartWorkbench } from "./services/developerQuickstartWorkbench.js";
import { buildSwiggyDiscoveryFreshness } from "./services/discoveryFreshness.js";
import { buildSwiggyDineoutPrecisionCenter } from "./services/dineoutPrecisionCenter.js";
import { buildSwiggyDocsCoverage } from "./services/docsCoverage.js";
import { buildSwiggyDocsTwinExplorer } from "./services/docsTwinExplorer.js";
import { buildEnterpriseDelegatedAuthCenter } from "./services/enterpriseDelegatedAuth.js";
import {
  buildComplianceEvidence,
  buildRateLimitPlan,
  buildReviewerProof,
  buildVersionMonitor,
  buildWidgets,
} from "./services/productionEvidence.js";
import { buildResilienceDrills, buildResilienceRunbook } from "./services/resilienceDrills.js";
import { buildOpenApiDocument } from "./services/openApi.js";
import { buildSandboxCredentialWorkbench } from "./services/sandboxCredentialWorkbench.js";
import { buildNutritionBudgetIntelligence } from "./services/nutritionBudgetIntelligence.js";
import { buildObservabilityTraceReport, buildSwiggyRouteOptimizationReport } from "./services/observability.js";
import { buildSwiggyOfferIntelligence } from "./services/offerIntelligence.js";
import { buildSwiggyOrderLifecycle } from "./services/orderLifecycle.js";
import { buildPremiumConciergeItinerary } from "./services/premiumConciergeItinerary.js";
import { buildPremiumUseCaseStudio } from "./services/premiumUseCaseStudio.js";
import { buildReviewerArtifactVault } from "./services/reviewerArtifactVault.js";
import { createPkcePair, createState } from "./services/pkce.js";
import { buildMcpResourcePromptStudio } from "./services/resourcePromptStudio.js";
import { buildSwiggyStagingCutoverRehearsal } from "./services/stagingCutover.js";
import { buildStagingCertificationMatrix } from "./services/stagingCertification.js";
import { buildStagingTranscriptExport } from "./services/stagingTranscript.js";
import { buildSubmissionConsole } from "./services/submissionConsole.js";
import { buildSwiggyStateOrchestrator } from "./services/stateOrchestrator.js";
import { buildSwiggyWidgetRuntime } from "./services/widgetRuntime.js";
import { buildSwiggyBuildersMap } from "./services/swiggyBuildersMap.js";
import { buildSwiggyAuthStatusReport, type AuthLifecycleEvent } from "./services/swiggyAuthStatus.js";
import { buildSupportBridgeReport } from "./services/supportBridge.js";
import { buildSwiggyScenarioRunner } from "./services/scenarioRunner.js";
import { buildSwiggyToolContractMatrix } from "./services/toolContractMatrix.js";
import { buildMcpToolLabReport } from "./services/toolLab.js";
import { buildTrafficReadinessPlan } from "./services/trafficReadiness.js";
import { buildSloIncidentCommandCenter } from "./services/sloIncidentCommand.js";
import { buildSwiggySourceIntelligence } from "./services/sourceIntelligence.js";
import { buildSwiggyUpstreamWatch } from "./services/upstreamWatch.js";
import { buildVisualQaCenter } from "./services/visualQaCenter.js";
import { buildSwiggyWebsiteAtlas } from "./services/websiteAtlas.js";
import { createRuntimeTelemetry, type RuntimeTelemetryRecorder } from "./services/runtimeTelemetry.js";
import { createMemorySessionStore, type SessionStore } from "./store/sessionStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const planningRequestSchema = z.object({
  prompt: z.string().min(8),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  budget: z.number().int().min(500).max(10000),
  diet: z.enum(["vegetarian", "high-protein vegetarian", "balanced"]),
  guests: z.number().int().min(1).max(12),
  day: z.enum(["today", "friday", "saturday", "sunday"]),
});

const confirmSchema = z.object({
  sessionId: z.string().min(4),
  recommendationId: z.string().min(4),
});

const substitutionSchema = z.object({
  sessionId: z.string().min(4),
  recommendationId: z.string().min(4),
  alternativeId: z.string().min(4),
});

const removeItemSchema = z.object({
  sessionId: z.string().min(4),
  recommendationId: z.string().min(4),
  itemId: z.string().min(2),
});

const profileSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(1),
  householdSize: z.number().int().min(1).max(12),
  defaultCity: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  defaultBudget: z.number().int().min(500).max(10000),
  diet: z.enum(["vegetarian", "high-protein vegetarian", "balanced"]),
  allergies: z.array(z.string().min(1)).max(12),
  dislikes: z.array(z.string().min(1)).max(12),
  favoriteCuisines: z.array(z.string().min(1)).max(12),
  spicePreference: z.enum(["mild", "medium", "hot"]),
  addressLabel: z.enum(["Home", "Office"]),
  consentToStorePreferences: z.boolean(),
});

const pantryItemSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(1),
  category: z.enum(["protein", "staple", "dairy", "produce", "snack"]),
  currentQty: z.number().min(0),
  targetQty: z.number().min(0),
  unit: z.string().min(1),
  estimatedPrice: z.number().min(0),
});

const groupMemberSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(1),
  diet: z.enum(["vegetarian", "high-protein vegetarian", "balanced"]),
  allergies: z.array(z.string()).max(12),
  budget: z.number().int().min(100).max(5000),
});

const accessSubmissionStateSchema = z.object({
  demoVideoUrl: z.string().trim().optional(),
  technicalContactEmail: z.string().trim().optional(),
  productionRedirectUri: z.string().trim().optional(),
  staticEgressIp: z.string().trim().optional(),
  environmentSummary: z.string().trim().optional(),
  termsAcknowledged: z.boolean().optional(),
  formSubmittedAt: z.string().trim().optional(),
  handoffEmailSentAt: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const mcpServerSchema = z.enum(["food", "instamart", "dineout"]);
const agentSurfaceSchema = z.enum(["chat", "voice"]);

export interface MealPilotServerOptions {
  config?: ServerConfig;
  store?: SessionStore;
  serveStatic?: boolean;
}

function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

function hashForLog(input: string) {
  return `sha256:${crypto.createHash("sha256").update(input).digest("hex").slice(0, 16)}`;
}

function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
}

function requestContext(telemetry: RuntimeTelemetryRecorder) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = crypto.randomUUID();
    res.setHeader("X-MealPilot-Request-Id", requestId);
    const startedAt = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        const durationMs = Date.now() - startedAt;
        const isMcpToolCall = req.method === "POST" && /^\/api\/mcp\/(food|instamart|dineout)$/.test(req.path);
        const event = isMcpToolCall ? "mcp_tool_call" : "mealpilot_request";
        telemetry.recordRequest({
          req,
          ts: new Date().toISOString(),
          level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
          requestId,
          event,
          method: req.method,
          durationMs,
          status: res.statusCode,
        });
        console.info(
          JSON.stringify({
            event,
            requestId,
            method: req.method,
            path: req.path,
            status: res.statusCode,
            durationMs,
          }),
        );
      }
    });
    next();
  };
}

export function createMealPilotServer(options: MealPilotServerOptions = {}) {
  const config = options.config ?? readConfig();
  const store = options.store ?? createMemorySessionStore();
  const telemetry = createRuntimeTelemetry();
  let runtimeAccessToken = config.swiggyAccessToken;
  let runtimeTokenExpiresAt = config.swiggyTokenExpiresAt;
  let runtimeTokenSource: "runtime" | "environment" | "none" = config.swiggyAccessToken ? "environment" : "none";
  let latestAuthEvent: AuthLifecycleEvent | undefined = runtimeAccessToken
    ? {
        status: "callback_exchanged",
        label: "Token loaded from environment",
        at: new Date().toISOString(),
        tokenExchange: "exchanged",
        tokenSource: "environment",
        expiresAt: runtimeTokenExpiresAt,
        scope: config.swiggyScope,
      }
    : undefined;
  const app = express();

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(requestContext(telemetry));
  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json({ limit: "1mb" }));

  function runtimeCredentials() {
    return {
      accessToken: runtimeAccessToken,
      expiresAt: runtimeTokenExpiresAt,
      tokenSource: runtimeTokenSource,
    };
  }

  function buildRuntimeGatewayStatus() {
    return buildMcpGatewayStatus(config, runtimeCredentials());
  }

  function buildAuthStatus() {
    return buildSwiggyAuthStatusReport({
      config,
      gatewayAuth: buildRuntimeGatewayStatus().auth,
      pendingVerifierCount: store.getDiagnostics().authSessionCount,
      latestEvent: latestAuthEvent,
    });
  }

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      appName: config.appName,
      mode: config.swiggyMode,
      hasClientId: config.swiggyClientId !== "replace_after_builder_access",
      storage: store.getDiagnostics(),
      time: new Date().toISOString(),
    });
  });

  app.get("/api/ready", (_req, res) => {
    const plans = store.getAllPlans();
    const coverage = buildMcpCoverage();
    const totalTools = coverage.reduce((sum, server) => sum + server.totalTools, 0);
    const mappedTools = coverage.reduce((sum, server) => sum + server.demoReady + server.guarded, 0);
    const ready = totalTools === mappedTools && config.swiggyScope.includes("mcp:tools");

    res.status(ready ? 200 : 503).json({
      ok: ready,
      mode: config.swiggyMode,
      checks: {
        api: "ready",
        staticServing: options.serveStatic ? "enabled" : "disabled",
        mcpCoverage: `${mappedTools}/${totalTools}`,
        scope: config.swiggyScope,
        sessions: plans.length,
        storage: store.getDiagnostics().durable ? "durable" : "memory",
      },
    });
  });

  app.get("/api/openapi.json", (_req, res) => {
    res.json(buildOpenApiDocument(config));
  });

  app.get("/api/telemetry/runtime", (_req, res) => {
    res.json({ telemetry: telemetry.buildReport() });
  });

  app.get("/api/audit-ledger", (_req, res) => {
    res.json({ auditLedger: buildAuditLedgerCenter({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/config", (_req, res) => {
    res.json({
      appName: config.appName,
      mode: config.swiggyMode,
      redirectUri: config.swiggyRedirectUri,
      scope: config.swiggyScope,
      requestedServers: ["food", "instamart", "dineout"],
      storage: store.getDiagnostics(),
      gateway: buildRuntimeGatewayStatus(),
    });
  });

  app.get("/api/mcp-gateway", (_req, res) => {
    res.json({ gateway: buildRuntimeGatewayStatus() });
  });

  app.get("/api/mcp/staging-cutover", (_req, res) => {
    res.json({
      stagingCutover: buildSwiggyStagingCutoverRehearsal({
        config,
        credentials: runtimeCredentials(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/credential-onboarding", (_req, res) => {
    res.json({
      onboarding: buildCredentialOnboardingReport({
        ...config,
        swiggyAccessToken: runtimeAccessToken,
        swiggyTokenExpiresAt: runtimeTokenExpiresAt,
      }),
    });
  });

  app.get("/api/sandbox-credential-workbench", (_req, res) => {
    res.json({
      sandboxWorkbench: buildSandboxCredentialWorkbench({
        ...config,
        swiggyAccessToken: runtimeAccessToken,
        swiggyTokenExpiresAt: runtimeTokenExpiresAt,
      }),
    });
  });

  app.get("/api/enterprise-delegated-auth", (_req, res) => {
    res.json({ enterpriseAuth: buildEnterpriseDelegatedAuthCenter(config) });
  });

  app.get("/api/profile", (_req, res) => {
    res.json({ profile: store.getProfile() });
  });

  app.put("/api/profile", (req, res) => {
    const profile = profileSchema.parse({
      ...defaultUserProfile,
      ...req.body,
    });
    res.json({ profile: store.updateProfile(profile) });
  });

  app.post(
    "/api/plan",
    asyncRoute(async (req, res) => {
      const request = planningRequestSchema.parse(req.body) satisfies UserPlanningRequest;
      const plan = await createMealPlan(request, undefined, store.getProfile());
      store.savePlan(plan);

      res.status(201).json({
        plan,
        meta: {
          userIdHash: hashForLog(`${request.city}:${request.diet}`),
          storedServerSide: true,
        },
      });
    }),
  );

  app.post(
    "/api/confirm",
    asyncRoute(async (req, res) => {
      const body = confirmSchema.parse(req.body);
      const plan = store.getPlan(body.sessionId);

      if (!plan) {
        res.status(404).json({ error: { message: "Session not found." } });
        return;
      }

      const updatedPlan = await executeConfirmedRecommendation(plan, body.recommendationId);
      const finalPlan = { ...updatedPlan, tracking: buildTrackingEvents(updatedPlan) };
      store.updatePlan(finalPlan);
      res.json({ plan: finalPlan });
    }),
  );

  app.post(
    "/api/confirm-all",
    asyncRoute(async (req, res) => {
      const body = z.object({ sessionId: z.string().min(4) }).parse(req.body);
      const plan = store.getPlan(body.sessionId);

      if (!plan) {
        res.status(404).json({ error: { message: "Session not found." } });
        return;
      }

      const updatedPlan = await executeAllPreparedRecommendations(plan);
      const finalPlan = { ...updatedPlan, tracking: buildTrackingEvents(updatedPlan) };
      store.updatePlan(finalPlan);
      res.json({ plan: finalPlan });
    }),
  );

  app.post(
    "/api/substitute",
    asyncRoute(async (req, res) => {
      const body = substitutionSchema.parse(req.body);
      const plan = store.getPlan(body.sessionId);

      if (!plan) {
        res.status(404).json({ error: { message: "Session not found." } });
        return;
      }

      const updatedPlan = substitutePlanItem(plan, body.recommendationId, body.alternativeId);
      store.updatePlan(updatedPlan);
      res.json({ plan: updatedPlan });
    }),
  );

  app.post(
    "/api/remove-item",
    asyncRoute(async (req, res) => {
      const body = removeItemSchema.parse(req.body);
      const plan = store.getPlan(body.sessionId);

      if (!plan) {
        res.status(404).json({ error: { message: "Session not found." } });
        return;
      }

      const updatedPlan = removeRecommendationItem(plan, body.recommendationId, body.itemId);
      store.updatePlan(updatedPlan);
      res.json({ plan: updatedPlan });
    }),
  );

  app.get("/api/tracking/:sessionId", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    const tracking = buildTrackingEvents(plan);
    const updatedPlan = { ...plan, tracking };
    store.updatePlan(updatedPlan);
    res.json({ tracking, plan: updatedPlan });
  });

  app.get("/api/builder-package", (_req, res) => {
    const readiness = buildReadinessChecklist(store.getProfile());
    res.json({
      readiness,
      application: {
        integrationName: "MealPilot India",
        requestedServers: ["food", "instamart", "dineout"],
        expectedVolume: "100 pilot users, below 1 QPS peak, about 1,600-3,000 MCP tool calls per week.",
        useCase:
          "A privacy-first AI commerce assistant that composes Food, Instamart, and Dineout for Indian household meal planning with explicit confirmation gates.",
      },
    });
  });

  app.get("/api/builder-package.md", (_req, res) => {
    const plans = store.getAllPlans();
    const latestPlan = plans.at(-1);
    const markdown = buildApplicationMarkdown({
      profile: store.getProfile(),
      readiness: buildReadinessChecklist(store.getProfile()),
      coverage: buildMcpCoverage(),
      goLive: buildGoLiveChecks({
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
        hasPlan: plans.length > 0,
        hasReminders: store.getReminders().length > 0,
        hasConfirmedAction:
          latestPlan?.recommendations.some((recommendation) => recommendation.status === "confirmed") ?? false,
      }),
    });
    res.type("text/markdown").send(markdown);
  });

  app.get("/api/mcp/catalog", (_req, res) => {
    const coverage = buildMcpCoverage();
    res.json({
      totalTools: coverage.reduce((sum, server) => sum + server.totalTools, 0),
      demoReady: coverage.reduce((sum, server) => sum + server.demoReady, 0),
      guarded: coverage.reduce((sum, server) => sum + server.guarded, 0),
      planned: coverage.reduce((sum, server) => sum + server.planned, 0),
      servers: coverage,
    });
  });

  app.get("/api/mcp/capability-registry", (_req, res) => {
    res.json({ registry: buildMcpCapabilityRegistry({ config, coverage: buildMcpCoverage() }) });
  });

  app.get("/api/mcp/resource-prompt-studio", (_req, res) => {
    res.json({ resourcePromptStudio: buildMcpResourcePromptStudio() });
  });

  app.get(
    "/api/mcp/tool-contract-matrix",
    asyncRoute(async (_req, res) => {
      res.json({ matrix: await buildSwiggyToolContractMatrix() });
    }),
  );

  app.get(
    "/api/mcp/scenario-runner",
    asyncRoute(async (_req, res) => {
      res.json({ scenarioRunner: await buildSwiggyScenarioRunner() });
    }),
  );

  app.get("/api/mcp/state-orchestrator", (_req, res) => {
    res.json({ stateOrchestrator: buildSwiggyStateOrchestrator(store.getAllPlans().at(-1)) });
  });

  app.get("/api/mcp/widget-runtime", (_req, res) => {
    res.json({ widgetRuntime: buildSwiggyWidgetRuntime(store.getAllPlans().at(-1)) });
  });

  app.get("/api/mcp/commercial-action-guard", (_req, res) => {
    res.json({ commercialActionGuard: buildCommercialActionGuard(store.getAllPlans().at(-1)) });
  });

  app.get("/api/mcp/backpressure-governor", (_req, res) => {
    res.json({ backpressureGovernor: buildMcpBackpressureGovernor(store.getAllPlans().at(-1)) });
  });

  app.get("/api/swiggy-builders-map", (_req, res) => {
    res.json({ map: buildSwiggyBuildersMap() });
  });

  app.get("/api/swiggy-website-atlas", (_req, res) => {
    res.json({ atlas: buildSwiggyWebsiteAtlas() });
  });

  app.get("/api/swiggy-builder-intake", (_req, res) => {
    res.json({
      intake: buildSwiggyBuilderIntakeCommandCenter({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/swiggy-faq-policy", (_req, res) => {
    res.json({ faqPolicy: buildSwiggyFaqPolicyCenter() });
  });

  app.get("/api/swiggy-growth-partnership", (_req, res) => {
    res.json({ growthPartnership: buildSwiggyGrowthPartnershipCenter() });
  });

  app.get("/api/channel-multimodal-studio", (_req, res) => {
    res.json({ channelMultimodalStudio: buildSwiggyChannelMultimodalStudio() });
  });

  app.get("/api/nutrition-budget-intelligence", (_req, res) => {
    res.json({ nutritionBudget: buildNutritionBudgetIntelligence() });
  });

  app.get("/api/household-preference-graph", (_req, res) => {
    res.json({ householdPreference: buildHouseholdPreferenceGraph() });
  });

  app.get("/api/guest-collaboration-calendar", (_req, res) => {
    res.json({ guestCollaboration: buildGuestCollaborationCenter() });
  });

  app.get("/api/luxury-experience-workspace", (_req, res) => {
    res.json({ luxuryExperience: buildLuxuryExperienceWorkspace() });
  });

  app.get("/api/reviewer-artifact-vault", (_req, res) => {
    res.json({ reviewerArtifactVault: buildReviewerArtifactVault() });
  });

  app.get("/api/visual-qa-center", (_req, res) => {
    res.json({ visualQa: buildVisualQaCenter() });
  });

  app.get("/api/swiggy-docs-coverage", (_req, res) => {
    res.json({ docsCoverage: buildSwiggyDocsCoverage() });
  });

  app.get("/api/swiggy-docs-twin-explorer", (_req, res) => {
    res.json({ docsTwinExplorer: buildSwiggyDocsTwinExplorer() });
  });

  app.get("/api/swiggy-upstream-watch", (_req, res) => {
    res.json({ upstreamWatch: buildSwiggyUpstreamWatch() });
  });

  app.get("/api/swiggy-source-intelligence", (_req, res) => {
    res.json({ sourceIntelligence: buildSwiggySourceIntelligence() });
  });

  app.get("/api/swiggy-deep-site-map", (_req, res) => {
    res.json({
      deepSiteMap: buildSwiggyDeepSiteMap({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/swiggy-developer-quickstart", (_req, res) => {
    res.json({ quickstartWorkbench: buildDeveloperQuickstartWorkbench() });
  });

  app.get("/api/swiggy-cta-execution-center", (_req, res) => {
    res.json({
      ctaExecution: buildSwiggyCtaExecutionCenter({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/swiggy-innovation-radar", (_req, res) => {
    res.json({ innovationRadar: buildSwiggyInnovationRadar() });
  });

  app.get("/api/ai-client-connect-kit", (_req, res) => {
    res.json({ connectKit: buildAiClientConnectKit() });
  });

  app.get("/api/coding-agent-governance", (_req, res) => {
    res.json({ codingAgentGovernance: buildCodingAgentGovernance() });
  });

  app.get("/api/brand-compliance-kit", (_req, res) => {
    res.json({ brandCompliance: buildBrandComplianceKit() });
  });

  app.get("/api/swiggy-journey-compiler", (_req, res) => {
    res.json({ journeyCompiler: buildSwiggyJourneyCompiler() });
  });

  app.get("/api/swiggy-access-dossier", (_req, res) => {
    res.json({ dossier: buildSwiggyAccessDossier(config) });
  });

  app.get("/api/swiggy-access-evidence-matrix", (_req, res) => {
    res.json({
      accessEvidenceMatrix: buildSwiggyAccessEvidenceMatrix({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.get("/api/premium-use-case-studio", (_req, res) => {
    res.json({ studio: buildPremiumUseCaseStudio() });
  });

  app.get("/api/premium-concierge-itinerary", (_req, res) => {
    res.json({ concierge: buildPremiumConciergeItinerary() });
  });

  app.get("/api/staging-certification-matrix", (_req, res) => {
    res.json({ matrix: buildStagingCertificationMatrix(config) });
  });

  app.get(
    "/api/mcp/tool-lab",
    asyncRoute(async (_req, res) => {
      res.json({ toolLab: await buildMcpToolLabReport() });
    }),
  );

  app.get("/api/sessions/:sessionId/surface", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    const surface = agentSurfaceSchema.parse(req.query.surface ?? "chat");
    res.json({ response: buildAgentSurfaceResponse(plan, surface) });
  });

  app.get("/api/sessions/:sessionId/preflight", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ preflight: buildCartPreflightReport(plan) });
  });

  app.get("/api/sessions/:sessionId/replay", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ replay: buildMcpReplay(plan) });
  });

  app.get("/api/sessions/:sessionId/staging-transcript", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ transcript: buildStagingTranscriptExport({ plan, config }) });
  });

  app.get("/api/sessions/:sessionId/widgets", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({
      widgets: buildWidgets(plan),
      bridge: {
        origin: "https://mcp.swiggy.com",
        sandbox: "allow-scripts allow-same-origin allow-popups",
        verifyOrigin: true,
      },
    });
  });

  app.get("/api/sessions/:sessionId", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ plan });
  });

  app.get("/api/pantry", (_req, res) => {
    const pantry = store.getPantry();
    res.json({ pantry, suggestions: buildRestockSuggestions(pantry) });
  });

  app.put("/api/pantry", (req, res) => {
    const pantry = z.array(pantryItemSchema).parse(req.body.pantry) satisfies PantryItem[];
    res.json({ pantry: store.updatePantry(pantry), suggestions: buildRestockSuggestions(pantry) });
  });

  app.get("/api/group", (_req, res) => {
    res.json({ groupPlan: store.getGroupPlan() });
  });

  app.post("/api/group/members", (req, res) => {
    const member = groupMemberSchema.parse(req.body) satisfies GroupMember;
    const current = store.getGroupPlan();
    const members = [...current.members.filter((item) => item.id !== member.id), member];
    const groupPlan = buildGroupPlan(members);
    res.status(201).json({ groupPlan: store.updateGroupPlan(groupPlan) });
  });

  app.post("/api/schedule", (req, res) => {
    const body = z.object({ sessionId: z.string().min(4) }).parse(req.body);
    const plan = store.getPlan(body.sessionId);

    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    const reminders = buildPlanReminders(plan);
    reminders.forEach(store.saveReminder);
    res.status(201).json({ reminders });
  });

  app.get("/api/schedule", (req, res) => {
    const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : undefined;
    res.json({ reminders: store.getReminders(sessionId) });
  });

  app.get("/api/ops", (_req, res) => {
    res.json({
      status: buildOpsStatus({
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
        planCount: store.getAllPlans().length,
        reminderCount: store.getReminders().length,
      }),
    });
  });

  app.get("/api/go-live", (_req, res) => {
    const plans = store.getAllPlans();
    const latestPlan = plans.at(-1);
    res.json({
      checks: buildGoLiveChecks({
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
        hasPlan: plans.length > 0,
        hasReminders: store.getReminders().length > 0,
        hasConfirmedAction:
          latestPlan?.recommendations.some((recommendation) => recommendation.status === "confirmed") ?? false,
      }),
      metrics: buildObservabilityMetrics({
        plans,
        reminderCount: store.getReminders().length,
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
      }),
      rollout: {
        pilotUsers: 100,
        ramp: ["1% private pilot", "10% friend-and-family", "50% staged city cohort", "100% after 48h green"],
        expectedPeakQps: "<1 QPS",
      },
    });
  });

  app.post("/api/support/report", (req, res) => {
    const body = z.object({ sessionId: z.string().optional() }).parse(req.body ?? {});
    res.status(201).json({ report: buildIncidentReport({ plans: store.getAllPlans(), sessionId: body.sessionId }) });
  });

  app.get("/api/support/bridge", (req, res) => {
    const query = z.object({ sessionId: z.string().optional() }).parse(req.query);
    res.json({ supportBridge: buildSupportBridgeReport({ plans: store.getAllPlans(), sessionId: query.sessionId }) });
  });

  app.get("/api/slo-incident-command", (_req, res) => {
    res.json({
      sloIncident: buildSloIncidentCommandCenter({
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
        config,
      }),
    });
  });

  app.get("/api/error-intelligence", (_req, res) => {
    res.json({ errorIntelligence: buildErrorIntelligenceReport() });
  });

  app.get("/api/demo-studio", (_req, res) => {
    res.json({
      steps: buildDemoStudio({
        plans: store.getAllPlans(),
        coverage: buildMcpCoverage(),
        reminders: store.getReminders(),
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
      }),
    });
  });

  app.get(
    "/api/evaluation-lab",
    asyncRoute(async (_req, res) => {
      res.json({ evaluation: await buildEvaluationLab(store.getProfile()) });
    }),
  );

  app.get("/api/submission-package", (_req, res) => {
    res.json({
      package: buildSubmissionPackage({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/submission-console", (_req, res) => {
    res.json({
      submissionConsole: buildSubmissionConsole({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/access-submission-studio", (_req, res) => {
    res.json({
      accessSubmissionStudio: buildAccessSubmissionStudio({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.patch("/api/access-submission-studio/state", (req, res) => {
    const body = accessSubmissionStateSchema.parse(req.body);
    const current = store.getAccessSubmissionState();
    const nextState = store.updateAccessSubmissionState({
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      accessSubmissionStudio: buildAccessSubmissionStudio({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: nextState,
      }),
    });
  });

  app.get("/api/builder-packet-export", (_req, res) => {
    res.json({
      packet: buildBuilderPacketExport({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/builder-packet-export.md", (_req, res) => {
    const packet = buildBuilderPacketExport({
      config,
      profile: store.getProfile(),
      coverage: buildMcpCoverage(),
      latestPlan: store.getAllPlans().at(-1),
    });
    res.type("text/markdown").send(buildBuilderPacketMarkdown(packet));
  });

  app.get("/api/rate-limit-plan", (_req, res) => {
    res.json({ rateLimit: buildRateLimitPlan(store.getAllPlans()) });
  });

  app.get("/api/traffic-readiness-plan", (_req, res) => {
    res.json({ trafficReadiness: buildTrafficReadinessPlan({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-load-lab", (_req, res) => {
    res.json({ loadLab: buildSwiggyLoadLab({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-offer-intelligence", (_req, res) => {
    res.json({ offerIntelligence: buildSwiggyOfferIntelligence({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-order-lifecycle", (_req, res) => {
    res.json({ orderLifecycle: buildSwiggyOrderLifecycle({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-location-trust", (_req, res) => {
    res.json({ locationTrust: buildSwiggyLocationTrust({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-cart-mutation-workbench", (_req, res) => {
    res.json({ cartMutation: buildSwiggyCartMutationWorkbench({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-discovery-freshness", (_req, res) => {
    res.json({ discoveryFreshness: buildSwiggyDiscoveryFreshness({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-confirmation-command-center", (_req, res) => {
    res.json({
      confirmationCommandCenter: buildSwiggyConfirmationCommandCenter({
        plans: store.getAllPlans(),
        config,
      }),
    });
  });

  app.get("/api/swiggy-cancellation-care-center", (_req, res) => {
    res.json({
      cancellationCareCenter: buildSwiggyCancellationCareCenter({
        plans: store.getAllPlans(),
        config,
      }),
    });
  });

  app.get("/api/swiggy-dineout-precision-center", (_req, res) => {
    res.json({
      dineoutPrecisionCenter: buildSwiggyDineoutPrecisionCenter({
        plans: store.getAllPlans(),
        config,
      }),
    });
  });

  app.get("/api/version-monitor", (_req, res) => {
    res.json({ version: buildVersionMonitor() });
  });

  app.get("/api/compliance-evidence", (_req, res) => {
    res.json({ compliance: buildComplianceEvidence(store.getProfile()) });
  });

  app.get("/api/data-governance-center", (_req, res) => {
    res.json({
      dataGovernance: buildDataGovernanceCenter({
        profile: store.getProfile(),
        config,
      }),
    });
  });

  app.get("/api/reviewer-proof", (_req, res) => {
    const plans = store.getAllPlans();
    const latestPlan = plans.at(-1);
    const widgets = latestPlan ? buildWidgets(latestPlan) : [];
    const rateLimit = buildRateLimitPlan(plans);
    const trafficReadiness = buildTrafficReadinessPlan({ plans, config });
    const sloIncident = buildSloIncidentCommandCenter({ plans, telemetry: telemetry.buildReport(), config });
    const compliance = buildComplianceEvidence(store.getProfile());
    const dataGovernance = buildDataGovernanceCenter({ profile: store.getProfile(), config });
    const enterpriseAuth = buildEnterpriseDelegatedAuthCenter(config);
    const version = buildVersionMonitor();

    res.json({
      proof: buildReviewerProof({
        plans,
        widgets,
        rateLimit,
        trafficReadiness,
        sloIncident,
        compliance,
        dataGovernance,
        enterpriseAuth,
        version,
      }),
    });
  });

  app.get("/api/production-launch-bundle", (_req, res) => {
    res.json({
      launchBundle: buildLaunchBundle({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/resilience", (_req, res) => {
    const plans = store.getAllPlans();
    const drills = buildResilienceDrills({
      plans,
      hasClientId: config.swiggyClientId !== "replace_after_builder_access",
    });

    res.json({
      drills,
      runbook: buildResilienceRunbook(drills, plans),
    });
  });

  app.get("/api/observability/traces", (_req, res) => {
    res.json({ observability: buildObservabilityTraceReport(store.getAllPlans()) });
  });

  app.get("/api/swiggy-route-optimizer", (_req, res) => {
    res.json({ routeOptimizer: buildSwiggyRouteOptimizationReport() });
  });

  app.get("/api/privacy/export", (_req, res) => {
    res.json({
      profile: store.getProfile(),
      pantry: store.getPantry(),
      groupPlan: store.getGroupPlan(),
      plans: store.getAllPlans(),
      reminders: store.getReminders(),
    });
  });

  app.get("/api/storage/status", (_req, res) => {
    res.json({ storage: store.getDiagnostics() });
  });

  app.get("/api/storage/export", (_req, res) => {
    res.json({ snapshot: store.getSnapshot() });
  });

  app.post("/api/storage/restore", (req, res) => {
    const body = z.object({ snapshot: z.object({ version: z.literal(1) }).passthrough() }).parse(req.body);
    res.json({ snapshot: store.replaceSnapshot(body.snapshot as unknown as ReturnType<typeof store.getSnapshot>) });
  });

  app.post("/api/storage/compact", (req, res) => {
    const body = z
      .object({
        planRetentionDays: z.number().int().min(1).max(365).optional(),
        authTtlMinutes: z.number().int().min(1).max(1440).optional(),
      })
      .parse(req.body ?? {});
    res.json({
      result: store.compact({
        planRetentionDays: body.planRetentionDays ?? config.planRetentionDays,
        authTtlMinutes: body.authTtlMinutes,
      }),
      storage: store.getDiagnostics(),
    });
  });

  app.delete("/api/privacy", (_req, res) => {
    store.clearUserData();
    res.json({ ok: true });
  });

  app.post(
    "/api/mcp/:server",
    asyncRoute(async (req, res) => {
      const server = mcpServerSchema.parse(req.params.server) as SwiggyServer;
      if (config.swiggyMode === "mock") {
        res.json(await handleMockJsonRpc(server, req.body));
        return;
      }

      if (!runtimeAccessToken) {
        res.status(401).json({
          error: {
            message: "Swiggy OAuth token is required before staging or production MCP calls.",
          },
          gateway: buildRuntimeGatewayStatus(),
        });
        return;
      }

      res.json(
        await callConfiguredSwiggyTool({
          config,
          server,
          request: req.body,
          accessToken: runtimeAccessToken,
        }),
      );
    }),
  );

  app.post("/api/auth/swiggy/start", (_req, res) => {
    const { verifier, challenge } = createPkcePair();
    const state = createState();
    store.saveAuthSession({
      state,
      verifier,
      challenge,
      createdAt: new Date().toISOString(),
    });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.swiggyClientId,
      redirect_uri: config.swiggyRedirectUri,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
      scope: config.swiggyScope,
    });

    latestAuthEvent = {
      status: "authorization_url_created",
      label: "Authorization URL created",
      at: new Date().toISOString(),
      statePreview: state,
      tokenSource: runtimeTokenSource,
      scope: config.swiggyScope,
      expiresAt: runtimeTokenExpiresAt,
    };

    res.json({
      authorizationUrl: `${config.swiggyBaseUrl}/auth/authorize?${params.toString()}`,
      mode: config.swiggyMode,
      state,
      verifierStoredServerSide: true,
      authStatus: buildAuthStatus(),
    });
  });

  app.get("/api/auth/swiggy/status", (_req, res) => {
    res.json({ authStatus: buildAuthStatus() });
  });

  app.get(
    "/api/auth/swiggy/callback",
    asyncRoute(async (req, res) => {
      const code = String(req.query.code ?? "");
      const state = String(req.query.state ?? "");
      const session = store.consumeAuthSession(state);

      if (!code || !state || !session) {
        latestAuthEvent = {
          status: "callback_failed",
          label: "Invalid OAuth callback",
          at: new Date().toISOString(),
          statePreview: state,
          tokenSource: runtimeTokenSource,
          scope: config.swiggyScope,
          expiresAt: runtimeTokenExpiresAt,
          error: "Missing code/state or state verifier was not found.",
        };
        res.status(400).json({ error: { message: "Invalid OAuth callback." }, authStatus: buildAuthStatus() });
        return;
      }

      if (config.swiggyMode !== "mock") {
        const exchanged = await exchangeSwiggyAuthorizationCode({
          config,
          code,
          verifier: session.verifier,
        });
        runtimeAccessToken = exchanged.accessToken;
        runtimeTokenExpiresAt = exchanged.expiresAt;
        runtimeTokenSource = "runtime";
        latestAuthEvent = {
          status: "callback_exchanged",
          label: "OAuth callback exchanged",
          at: new Date().toISOString(),
          statePreview: state,
          tokenExchange: "exchanged",
          tokenSource: "runtime",
          expiresAt: exchanged.expiresAt,
          scope: exchanged.scope,
        };

        res.json({
          ok: true,
          mode: config.swiggyMode,
          tokenExchange: "exchanged",
          tokenType: exchanged.tokenType,
          expiresAt: exchanged.expiresAt,
          scope: exchanged.scope,
          state,
          authStatus: buildAuthStatus(),
        });
        return;
      }

      latestAuthEvent = {
        status: "callback_mocked",
        label: "OAuth callback mocked",
        at: new Date().toISOString(),
        statePreview: state,
        tokenExchange: "mocked",
        tokenSource: runtimeTokenSource,
        scope: config.swiggyScope,
        expiresAt: runtimeTokenExpiresAt,
      };

      res.json({
        ok: true,
        mode: config.swiggyMode,
        tokenExchange: "mocked",
        state,
        authStatus: buildAuthStatus(),
      });
    }),
  );

  if (options.serveStatic) {
    const distPath = path.resolve(__dirname, "../../dist");
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next;

    if (error instanceof z.ZodError) {
      res.status(400).json({ error: { message: "Invalid request.", issues: error.issues } });
      return;
    }

    const typed = error as Error & { status?: number };
    res.status(typed.status ?? 500).json({
      error: {
        message: typed.message || "Unexpected server error.",
      },
    });
  });

  return { app, store, config };
}
