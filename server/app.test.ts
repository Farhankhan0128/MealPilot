import request from "supertest";
import { describe, expect, it } from "vitest";
import { createMealPilotServer } from "./app.js";

const planningRequest = {
  prompt:
    "Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, groceries, and Dineout.",
  city: "Bengaluru",
  budget: 2000,
  diet: "high-protein vegetarian",
  guests: 4,
  day: "saturday",
};

describe("MealPilot API", () => {
  it("serves health and config", async () => {
    const { app } = createMealPilotServer();
    const health = await request(app).get("/api/health").expect(200);
    const config = await request(app).get("/api/config").expect(200);

    expect(health.body.ok).toBe(true);
    expect(config.body.requestedServers).toEqual(["food", "instamart", "dineout"]);
  });

  it("creates a server-side plan session", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).post("/api/plan").send(planningRequest).expect(201);

    expect(response.body.plan.id).toMatch(/^mp_/);
    expect(response.body.plan.recommendations).toHaveLength(3);
    expect(response.body.meta.storedServerSide).toBe(true);
  });

  it("executes confirmation through the API and only updates one recommendation", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const sessionId = created.body.plan.id as string;

    const confirmed = await request(app)
      .post("/api/confirm")
      .send({ sessionId, recommendationId: "rec_food" })
      .expect(200);

    const food = confirmed.body.plan.recommendations.find((item: { id: string }) => item.id === "rec_food");
    const groceries = confirmed.body.plan.recommendations.find((item: { id: string }) => item.id === "rec_instamart");

    expect(food.status).toBe("confirmed");
    expect(groceries.status).toBe("prepared");
    expect(confirmed.body.plan.auditTrail[0].status).toBe("simulated");
  });

  it("exposes a local MCP-shaped JSON-RPC endpoint", async () => {
    const { app } = createMealPilotServer();

    const response = await request(app)
      .post("/api/mcp/food")
      .send({
        jsonrpc: "2.0",
        id: "1",
        method: "tools/call",
        params: { name: "get_addresses", arguments: {} },
      })
      .expect(200);

    expect(response.body.result.success).toBe(true);
    expect(response.body.result.data[0].label).toBe("Home");
  });

  it("updates profile, substitutes items, confirms all, and returns tracking", async () => {
    const { app } = createMealPilotServer();

    await request(app)
      .put("/api/profile")
      .send({
        id: "profile_demo",
        name: "Farhan",
        householdSize: 3,
        defaultCity: "Delhi NCR",
        defaultBudget: 2200,
        diet: "vegetarian",
        allergies: ["peanut"],
        dislikes: ["mushroom"],
        favoriteCuisines: ["Italian"],
        spicePreference: "medium",
        addressLabel: "Home",
        consentToStorePreferences: true,
      })
      .expect(200);

    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const sessionId = created.body.plan.id as string;

    const substituted = await request(app)
      .post("/api/substitute")
      .send({ sessionId, recommendationId: "rec_food", alternativeId: "alt_food_1" })
      .expect(200);

    expect(substituted.body.plan.recommendations[0].items[0].name).toContain("Tofu");

    const confirmed = await request(app).post("/api/confirm-all").send({ sessionId }).expect(200);
    expect(confirmed.body.plan.recommendations.every((item: { status: string }) => item.status === "confirmed")).toBe(true);

    const tracking = await request(app).get(`/api/tracking/${sessionId}`).expect(200);
    expect(tracking.body.tracking.length).toBeGreaterThan(0);
  });

  it("returns a builder access package", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/builder-package").expect(200);

    expect(response.body.application.requestedServers).toEqual(["food", "instamart", "dineout"]);
    expect(response.body.readiness.some((item: { id: string }) => item.id === "oauth")).toBe(true);
  });

  it("supports pantry, group planning, scheduling, ops, and privacy workflows", async () => {
    const { app } = createMealPilotServer();
    const pantry = await request(app).get("/api/pantry").expect(200);
    expect(pantry.body.suggestions.length).toBeGreaterThan(0);

    const group = await request(app)
      .post("/api/group/members")
      .send({
        id: "member_asha",
        name: "Asha",
        diet: "vegetarian",
        allergies: ["none"],
        budget: 550,
      })
      .expect(201);
    expect(group.body.groupPlan.members.some((member: { id: string }) => member.id === "member_asha")).toBe(true);

    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const schedule = await request(app).post("/api/schedule").send({ sessionId: created.body.plan.id }).expect(201);
    expect(schedule.body.reminders).toHaveLength(3);

    const ops = await request(app).get("/api/ops").expect(200);
    expect(ops.body.status.some((item: { id: string }) => item.id === "api")).toBe(true);

    const goLive = await request(app).get("/api/go-live").expect(200);
    expect(goLive.body.metrics.some((item: { id: string }) => item.id === "tool_latency")).toBe(true);

    const privacy = await request(app).get("/api/privacy/export").expect(200);
    expect(privacy.body.profile.id).toBe("profile_demo");

    await request(app).delete("/api/privacy").expect(200);
    const afterDelete = await request(app).get("/api/privacy/export").expect(200);
    expect(afterDelete.body.plans).toHaveLength(0);
  });

  it("exports a markdown builder package and completes mock OAuth callback", async () => {
    const { app } = createMealPilotServer();
    const start = await request(app).post("/api/auth/swiggy/start").expect(200);

    const callback = await request(app)
      .get("/api/auth/swiggy/callback")
      .query({ code: "mock_code", state: start.body.state })
      .expect(200);
    expect(callback.body.tokenExchange).toBe("mocked");

    const markdown = await request(app).get("/api/builder-package.md").expect(200);
    expect(markdown.text).toContain("MealPilot India - Swiggy Builder Access Packet");
    expect(markdown.text).toContain("MCP Tool Coverage");
  });

  it("shows full MCP coverage, surface responses, and support reports", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const sessionId = created.body.plan.id as string;

    const catalog = await request(app).get("/api/mcp/catalog").expect(200);
    expect(catalog.body.totalTools).toBe(35);
    expect(catalog.body.servers).toHaveLength(3);

    const voice = await request(app).get(`/api/sessions/${sessionId}/surface`).query({ surface: "voice" }).expect(200);
    expect(voice.body.response.surface).toBe("voice");
    expect(voice.body.response.constraints).toContain("Maximum three options spoken");

    const report = await request(app).post("/api/support/report").send({ sessionId }).expect(201);
    expect(report.body.report.mailto).toContain("builders@swiggy.in");
    expect(report.body.report.sessionIds).toEqual([sessionId]);
  });

  it("returns cart preflight, replay, demo studio, and submission package evidence", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const sessionId = created.body.plan.id as string;

    const preflight = await request(app).get(`/api/sessions/${sessionId}/preflight`).expect(200);
    expect(preflight.body.preflight.checks.some((check: { id: string }) => check.id === "payment")).toBe(true);
    expect(preflight.body.preflight.offers.length).toBe(3);

    const replay = await request(app).get(`/api/sessions/${sessionId}/replay`).expect(200);
    expect(replay.body.replay.length).toBeGreaterThanOrEqual(10);
    expect(replay.body.replay[0].request.method).toBe("tools/call");

    const demoStudio = await request(app).get("/api/demo-studio").expect(200);
    expect(demoStudio.body.steps.some((step: { id: string }) => step.id === "coverage")).toBe(true);

    const submission = await request(app).get("/api/submission-package").expect(200);
    expect(submission.body.package.fields.some((field: { id: string }) => field.id === "tool_coverage")).toBe(true);
    expect(submission.body.package.links.some((link: { label: string }) => link.label === "GitHub")).toBe(true);
  });

  it("returns widget, rate-limit, version, compliance, and reviewer proof evidence", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const sessionId = created.body.plan.id as string;

    const widgets = await request(app).get(`/api/sessions/${sessionId}/widgets`).expect(200);
    expect(widgets.body.widgets.length).toBeGreaterThanOrEqual(5);
    expect(widgets.body.bridge.verifyOrigin).toBe(true);

    const rateLimit = await request(app).get("/api/rate-limit-plan").expect(200);
    expect(rateLimit.body.rateLimit.budgets.some((budget: { scope: string }) => budget.scope.includes("client_id"))).toBe(true);

    const version = await request(app).get("/api/version-monitor").expect(200);
    expect(version.body.version.deprecationWindowDays).toBe(180);
    expect(version.body.version.pinnedRoutes.food).toContain("/v1/food");

    const compliance = await request(app).get("/api/compliance-evidence").expect(200);
    expect(compliance.body.compliance.controls.some((control: { id: string }) => control.id === "deletion")).toBe(true);

    const proof = await request(app).get("/api/reviewer-proof").expect(200);
    expect(proof.body.proof.score).toBeGreaterThanOrEqual(80);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Widget contracts")).toBe(true);
  });
});
