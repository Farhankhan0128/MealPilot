import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { createMealPlan } from "../src/domain/planner.js";
import { defaultUserProfile } from "../src/domain/profile.js";
import type { SwiggyServer, UserPlanningRequest } from "../src/domain/types.js";
import { readConfig, type ServerConfig } from "./config.js";
import { handleMockJsonRpc } from "./mock/swiggyToolRouter.js";
import { executeAllPreparedRecommendations, executeConfirmedRecommendation } from "./services/confirmationService.js";
import {
  buildReadinessChecklist,
  buildTrackingEvents,
  removeRecommendationItem,
  substitutePlanItem,
} from "./services/planOperations.js";
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

const mcpServerSchema = z.enum(["food", "instamart", "dineout"]);

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

export function createMealPilotServer(options: MealPilotServerOptions = {}) {
  const config = options.config ?? readConfig();
  const store = options.store ?? createMemorySessionStore();
  const app = express();

  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      appName: config.appName,
      mode: config.swiggyMode,
      hasClientId: config.swiggyClientId !== "replace_after_builder_access",
      time: new Date().toISOString(),
    });
  });

  app.get("/api/config", (_req, res) => {
    res.json({
      appName: config.appName,
      mode: config.swiggyMode,
      redirectUri: config.swiggyRedirectUri,
      scope: config.swiggyScope,
      requestedServers: ["food", "instamart", "dineout"],
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
    res.json({
      readiness: buildReadinessChecklist(store.getProfile()),
      application: {
        integrationName: "MealPilot India",
        requestedServers: ["food", "instamart", "dineout"],
        expectedVolume: "100 pilot users, below 1 QPS peak, about 1,600-3,000 MCP tool calls per week.",
        useCase:
          "A privacy-first AI commerce assistant that composes Food, Instamart, and Dineout for Indian household meal planning with explicit confirmation gates.",
      },
    });
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
