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
import {
  buildComplianceEvidence,
  buildRateLimitPlan,
  buildReviewerProof,
  buildVersionMonitor,
  buildWidgets,
} from "./services/productionEvidence.js";
import { buildResilienceDrills, buildResilienceRunbook } from "./services/resilienceDrills.js";
import { buildOpenApiDocument } from "./services/openApi.js";
import { createPkcePair, createState } from "./services/pkce.js";
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

function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  res.setHeader("X-MealPilot-Request-Id", requestId);
  const startedAt = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      console.info(
        JSON.stringify({
          event: "mealpilot_request",
          requestId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - startedAt,
        }),
      );
    }
  });
  next();
}

export function createMealPilotServer(options: MealPilotServerOptions = {}) {
  const config = options.config ?? readConfig();
  const store = options.store ?? createMemorySessionStore();
  const app = express();

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(requestContext);
  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json({ limit: "1mb" }));

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

  app.get("/api/config", (_req, res) => {
    res.json({
      appName: config.appName,
      mode: config.swiggyMode,
      redirectUri: config.swiggyRedirectUri,
      scope: config.swiggyScope,
      requestedServers: ["food", "instamart", "dineout"],
      storage: store.getDiagnostics(),
    });
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

  app.get("/api/sessions/:sessionId", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ plan });
  });

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

  app.get("/api/rate-limit-plan", (_req, res) => {
    res.json({ rateLimit: buildRateLimitPlan(store.getAllPlans()) });
  });

  app.get("/api/version-monitor", (_req, res) => {
    res.json({ version: buildVersionMonitor() });
  });

  app.get("/api/compliance-evidence", (_req, res) => {
    res.json({ compliance: buildComplianceEvidence(store.getProfile()) });
  });

  app.get("/api/reviewer-proof", (_req, res) => {
    const plans = store.getAllPlans();
    const latestPlan = plans.at(-1);
    const widgets = latestPlan ? buildWidgets(latestPlan) : [];
    const rateLimit = buildRateLimitPlan(plans);
    const compliance = buildComplianceEvidence(store.getProfile());
    const version = buildVersionMonitor();

    res.json({
      proof: buildReviewerProof({
        plans,
        widgets,
        rateLimit,
        compliance,
        version,
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
      res.json(await handleMockJsonRpc(server, req.body));
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

    res.json({
      authorizationUrl: `${config.swiggyBaseUrl}/auth/authorize?${params.toString()}`,
      mode: config.swiggyMode,
      state,
      verifierStoredServerSide: true,
    });
  });

  app.get("/api/auth/swiggy/callback", (req, res) => {
    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");
    const session = store.consumeAuthSession(state);

    if (!code || !state || !session) {
      res.status(400).json({ error: { message: "Invalid OAuth callback." } });
      return;
    }

    res.json({
      ok: true,
      mode: config.swiggyMode,
      tokenExchange: config.swiggyMode === "mock" ? "mocked" : "ready_for_staging_exchange",
      state,
    });
  });

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
