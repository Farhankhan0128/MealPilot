import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createMealPilotServer } from "./app.js";
import { buildSwiggyBuildersPageMeshAuditor } from "./services/buildersPageMeshAuditor.js";
import { buildSwiggyBuildersSiteParityAuditor } from "./services/buildersSiteParityAuditor.js";
import { buildSwiggyCtaLiveAuditor } from "./services/ctaLiveAuditor.js";
import { buildSwiggyLlmsManifestVerifier } from "./services/llmsManifestVerifier.js";
import { buildSwiggyToolParityAuditor } from "./services/toolParityAuditor.js";
import { buildSwiggyHandshakeDoctor } from "./services/swiggyHandshakeDoctor.js";
import { createFileSessionStore } from "./store/sessionStore.js";

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
    const ready = await request(app).get("/api/ready").expect(200);
    const config = await request(app).get("/api/config").expect(200);

    expect(health.body.ok).toBe(true);
    expect(ready.body.checks.mcpCoverage).toBe("35/35");
    expect(config.body.requestedServers).toEqual(["food", "instamart", "dineout"]);
  });

  it("serves security headers and OpenAPI contract", async () => {
    const { app } = createMealPilotServer();
    const health = await request(app).get("/api/health").expect(200);
    const openApi = await request(app).get("/api/openapi.json").expect(200);

    expect(health.headers["x-content-type-options"]).toBe("nosniff");
    expect(health.headers["x-mealpilot-request-id"]).toBeTruthy();
    expect(openApi.body.openapi).toBe("3.1.0");
    expect(openApi.body.paths["/api/plan"].post.summary).toContain("MealPilot plan");
    expect(openApi.body.paths["/api/storage/status"].get.summary).toContain("Storage");
    expect(openApi.body.paths["/api/resilience"].get.summary).toContain("resilience");
    expect(openApi.body.paths["/api/evaluation-lab"].get.summary).toContain("evaluation");
    expect(openApi.body.paths["/api/submission-console"].get.summary).toContain("submission console");
    expect(openApi.body.paths["/api/builder-packet-export"].get.summary).toContain("packet export");
    expect(openApi.body.paths["/api/builder-packet-export.md"].get.summary).toContain("Markdown");
    expect(openApi.body.paths["/api/mcp-gateway"].get.summary).toContain("gateway");
    expect(openApi.body.paths["/api/swiggy-handshake-doctor"].get.summary).toContain("handshake doctor");
    expect(openApi.body.paths["/api/mcp/handshake-doctor"].get.responses["200"].description).toContain("Instamart /im");
    expect(openApi.body.paths["/api/swiggy-builders-map"].get.summary).toContain("Swiggy Builders");
    expect(openApi.body.paths["/api/swiggy-website-atlas"].get.summary).toContain("website header");
    expect(openApi.body.paths["/api/swiggy-builders-site-parity"].get.summary).toContain("homepage parity");
    expect(openApi.body.paths["/api/swiggy-builders-page-mesh"].get.summary).toContain("public page mesh");
    expect(openApi.body.paths["/api/swiggy-builders-launch-story"].get.summary).toContain("Launch Story");
    expect(openApi.body.paths["/api/swiggy-builders-launch-story"].get.responses["200"].description).toContain("35-tool");
    expect(openApi.body.paths["/api/swiggy-builders-module-intelligence"].get.summary).toContain("Module Intelligence");
    expect(openApi.body.paths["/api/swiggy-builders-module-intelligence"].get.responses["200"].description).toContain("route optimization");
    expect(openApi.body.paths["/api/swiggy-builders-journey-gates"].get.summary).toContain("Journey Gate");
    expect(openApi.body.paths["/api/swiggy-builders-journey-gates"].get.responses["200"].description).toContain("Quick Review");
    expect(openApi.body.paths["/api/swiggy-builders-homepage-experience"].get.summary).toContain("Homepage Experience");
    expect(openApi.body.paths["/api/swiggy-builders-homepage-experience"].get.responses["200"].description).toContain("footer");
    expect(openApi.body.paths["/api/swiggy-builders-source-evolution"].get.summary).toContain("Source Evolution");
    expect(openApi.body.paths["/api/swiggy-builders-source-evolution"].get.responses["200"].description).toContain("35/35");
    expect(openApi.body.paths["/api/swiggy-builders-live-source-resilience"].get.summary).toContain("Live Source Resilience");
    expect(openApi.body.paths["/api/swiggy-builders-live-source-resilience"].get.responses["200"].description).toContain("fallback");
    expect(openApi.body.paths["/api/swiggy-builders-review-decision"].get.summary).toContain("Review Decision");
    expect(openApi.body.paths["/api/swiggy-builders-review-decision"].get.responses["200"].description).toContain("approval");
    expect(openApi.body.paths["/api/swiggy-operating-contract-center"].get.summary).toContain("Operating Contract");
    expect(openApi.body.paths["/api/swiggy-operating-contract-center"].get.responses["200"].description).toContain("99.9%");
    expect(openApi.body.paths["/api/swiggy-builder-intake"].get.summary).toContain("Builder Intake");
    expect(openApi.body.paths["/api/swiggy-faq-policy"].get.summary).toContain("FAQ");
    expect(openApi.body.paths["/api/swiggy-faq-resolution-center"].get.summary).toContain("FAQ Resolution");
    expect(openApi.body.paths["/api/swiggy-faq-resolution-center"].get.responses["200"].description).toContain(
      "Every public Builders FAQ question",
    );
    expect(openApi.body.paths["/api/swiggy-growth-partnership"].get.summary).toContain("Growth Partnership");
    expect(openApi.body.paths["/api/swiggy-talent-signal-center"].get.summary).toContain("Talent Signal");
    expect(openApi.body.paths["/api/swiggy-talent-signal-center"].get.responses["200"].description).toContain(
      "developer hiring signal",
    );
    expect(openApi.body.paths["/api/swiggy-conversion-center"].get.summary).toContain("Conversion Center");
    expect(openApi.body.paths["/api/swiggy-conversion-center"].get.responses["200"].description).toContain(
      "What Will You Cook",
    );
    expect(openApi.body.paths["/api/swiggy-benefits-activation-center"].get.summary).toContain("Benefits Activation");
    expect(openApi.body.paths["/api/swiggy-benefits-activation-center"].get.responses["200"].description).toContain("live API access");
    expect(openApi.body.paths["/api/swiggy-showcase-submission-center"].get.summary).toContain("Showcase Submission");
    expect(openApi.body.paths["/api/swiggy-demo-evidence-director"].get.summary).toContain("Demo Evidence Director");
    expect(openApi.body.paths["/api/swiggy-submission-timeline-center"].get.summary).toContain("Submission Timeline");
    expect(openApi.body.paths["/api/swiggy-partner-success-desk"].get.summary).toContain("Partner Success");
    expect(openApi.body.paths["/api/swiggy-partner-support-room"].get.summary).toContain("Partner Support Room");
    expect(openApi.body.paths["/api/swiggy-interaction-qa-center"].get.summary).toContain("Interaction QA");
    expect(openApi.body.paths["/api/swiggy-staging-seed-smoke-center"].get.summary).toContain("Seed and Smoke");
    expect(openApi.body.paths["/api/channel-multimodal-studio"].get.summary).toContain("Channel and Multimodal");
    expect(openApi.body.paths["/api/swiggy-visual-dish-capture"].get.summary).toContain("Visual Dish Capture");
    expect(openApi.body.paths["/api/swiggy-visual-dish-capture/analyze"].post.summary).toContain("visual dish");
    expect(openApi.body.paths["/api/swiggy-voice-commerce-center"].get.summary).toContain("Voice Commerce");
    expect(openApi.body.paths["/api/swiggy-voice-commerce-center/rehearse"].post.summary).toContain("spoken");
    expect(openApi.body.paths["/api/swiggy-quality-loop-center"].get.summary).toContain("Quality Loop");
    expect(openApi.body.paths["/api/swiggy-quality-loop-center/feedback"].post.summary).toContain("feedback");
    expect(openApi.body.paths["/api/swiggy-ritual-autopilot-center"].get.summary).toContain("Ritual Autopilot");
    expect(openApi.body.paths["/api/swiggy-ritual-autopilot-center/plan"].post.summary).toContain("ritual");
    expect(openApi.body.paths["/api/swiggy-payment-truth-center"].get.summary).toContain("Payment Truth");
    expect(openApi.body.paths["/api/swiggy-payment-truth-center/reconcile"].post.summary).toContain("payment");
    expect(openApi.body.paths["/api/swiggy-meal-window-intelligence"].get.summary).toContain("Meal Window");
    expect(openApi.body.paths["/api/swiggy-meal-window-intelligence/forecast"].post.summary).toContain("Forecast");
    expect(openApi.body.paths["/api/swiggy-customization-studio"].get.summary).toContain("Customization Studio");
    expect(openApi.body.paths["/api/swiggy-customization-studio/validate"].post.summary).toContain("customization");
    expect(openApi.body.paths["/api/nutrition-budget-intelligence"].get.summary).toContain("Nutrition and Budget");
    expect(openApi.body.paths["/api/household-preference-graph"].get.summary).toContain("Household Preference Graph");
    expect(openApi.body.paths["/api/guest-collaboration-calendar"].get.summary).toContain("Guest Collaboration");
    expect(openApi.body.paths["/api/luxury-experience-workspace"].get.summary).toContain("Luxury Experience Workspace");
    expect(openApi.body.paths["/api/reviewer-artifact-vault"].get.summary).toContain("Reviewer Artifact Vault");
    expect(openApi.body.paths["/api/visual-qa-center"].get.summary).toContain("Visual QA Center");
    expect(openApi.body.paths["/api/swiggy-docs-coverage"].get.summary).toContain("llms.txt");
    expect(openApi.body.paths["/api/swiggy-docs-twin-explorer"].get.summary).toContain("docs twin");
    expect(openApi.body.paths["/api/swiggy-llms-manifest-verifier"].get.summary).toContain("llms.txt manifest");
    expect(openApi.body.paths["/api/swiggy-llms-manifest-verifier"].get.responses["200"].description).toContain("Instamart 13");
    expect(openApi.body.paths["/api/swiggy-tool-parity-auditor"].get.summary).toContain("tool parity");
    expect(openApi.body.paths["/api/swiggy-tool-parity-auditor"].get.responses["200"].description).toContain("Food 14");
    expect(openApi.body.paths["/api/swiggy-upstream-watch"].get.summary).toContain("upstream docs");
    expect(openApi.body.paths["/api/swiggy-source-intelligence"].get.summary).toContain("source intelligence");
    expect(openApi.body.paths["/api/swiggy-deep-site-map"].get.summary).toContain("deep site map");
    expect(openApi.body.paths["/api/swiggy-developer-quickstart"].get.summary).toContain("developer quickstart");
    expect(openApi.body.paths["/api/swiggy-developer-quickstart/run-first-call"].post.summary).toContain("first-call");
    expect(openApi.body.paths["/api/swiggy-developer-quickstart/run-first-call"].post.responses["200"].description).toContain("raw address");
    expect(openApi.body.paths["/api/swiggy-cta-execution-center"].get.summary).toContain("CTA execution");
    expect(openApi.body.paths["/api/swiggy-cta-live-audit"].get.summary).toContain("Live Swiggy CTA auditor");
    expect(openApi.body.paths["/api/swiggy-innovation-radar"].get.summary).toContain("innovation radar");
    expect(openApi.body.paths["/api/ai-client-connect-kit"].get.summary).toContain("AI client");
    expect(openApi.body.paths["/api/ai-client-connect-kit/validate-config"].post.summary).toContain("Validate");
    expect(openApi.body.paths["/api/ai-client-connect-kit/validate-config"].post.responses["200"].description).toContain("Instamart /im");
    expect(openApi.body.paths["/api/coding-agent-governance"].get.summary).toContain("coding-agent governance");
    expect(openApi.body.paths["/api/brand-compliance-kit"].get.summary).toContain("brand");
    expect(openApi.body.paths["/api/swiggy-journey-compiler"].get.summary).toContain("journey compiler");
    expect(openApi.body.paths["/api/swiggy-access-dossier"].get.summary).toContain("access application dossier");
    expect(openApi.body.paths["/api/swiggy-access-evidence-matrix"].get.summary).toContain("access evidence matrix");
    expect(openApi.body.paths["/api/premium-use-case-studio"].get.summary).toContain("premium Swiggy use-case studio");
    expect(openApi.body.paths["/api/premium-concierge-itinerary"].get.summary).toContain("Premium concierge itinerary");
    expect(openApi.body.paths["/api/staging-certification-matrix"].get.summary).toContain("staging certification");
    expect(openApi.body.paths["/api/sessions/{sessionId}/staging-transcript"].get.summary).toContain("staging transcript");
    expect(openApi.body.paths["/api/mcp/tool-lab"].get.summary).toContain("Tool Lab");
    expect(openApi.body.paths["/api/mcp/tool-contract-matrix"].get.summary).toContain("tool contract matrix");
    expect(openApi.body.paths["/api/mcp/scenario-runner"].get.summary).toContain("scenario runner");
    expect(openApi.body.paths["/api/mcp/state-orchestrator"].get.summary).toContain("multi-turn cart state");
    expect(openApi.body.paths["/api/mcp/state-orchestrator/rehearse-surface"].post.summary).toContain("surface contracts");
    expect(openApi.body.paths["/api/mcp/state-orchestrator/rehearse-surface"].post.responses["200"].description).toContain("raw-ID");
    expect(openApi.body.paths["/api/mcp/widget-runtime"].get.summary).toContain("widget iframe");
    expect(openApi.body.paths["/api/swiggy-widget-experience-composer"].get.summary).toContain("Widget Experience Composer");
    expect(openApi.body.paths["/api/swiggy-hosted-widget-activation"].get.summary).toContain("Hosted Widget Activation");
    expect(openApi.body.paths["/api/swiggy-hosted-widget-activation"].get.responses["200"].description).toContain("postMessage");
    expect(openApi.body.paths["/api/swiggy-agent-experience-benchmark"].get.summary).toContain("Agent Experience Benchmark");
    expect(openApi.body.paths["/api/swiggy-private-pilot-control-room"].get.summary).toContain("Private Pilot Control Room");
    expect(openApi.body.paths["/api/swiggy-staging-replay"].get.summary).toContain("Staging Replay");
    expect(openApi.body.paths["/api/swiggy-staging-replay/run"].post.summary).toContain("safe Swiggy staging replay");
    expect(openApi.body.paths["/api/swiggy-staging-replay/run"].post.responses["200"].description).toContain("blocks commercial");
    expect(openApi.body.paths["/api/mcp/commercial-action-guard"].get.summary).toContain("commercial action");
    expect(openApi.body.paths["/api/mcp/backpressure-governor"].get.summary).toContain("backpressure");
    expect(openApi.body.paths["/api/mcp/staging-cutover"].get.summary).toContain("staging cutover");
    expect(openApi.body.paths["/api/swiggy-staging-credential-drill"].get.summary).toContain("Staging Credential Drill");
    expect(openApi.body.paths["/api/swiggy-staging-credential-drill"].get.responses["200"].description).toContain("first read-only probes");
    expect(openApi.body.paths["/api/swiggy-live-signal-calibration"].get.summary).toContain("Live Signal Calibration");
    expect(openApi.body.paths["/api/swiggy-live-signal-calibration"].get.responses["200"].description).toContain("privacy controls");
    expect(openApi.body.paths["/api/mcp/capability-registry"].get.summary).toContain("capability registry");
    expect(openApi.body.paths["/api/mcp/resource-prompt-studio"].get.summary).toContain("Resource and Prompt Studio");
    expect(openApi.body.paths["/api/mcp/resource-prompt-studio/execute"].post.summary).toContain("resource or prompt");
    expect(openApi.body.paths["/api/mcp/resource-prompt-studio/execute"].post.responses["200"].description).toContain("no raw payload");
    expect(openApi.body.paths["/api/credential-onboarding"].get.summary).toContain("Dynamic Client Registration");
    expect(openApi.body.paths["/api/swiggy-credential-vault-center"].get.summary).toContain("Credential Vault");
    expect(openApi.body.paths["/api/swiggy-credential-vault-center"].get.responses["200"].description).toContain("without full token exposure");
    expect(openApi.body.paths["/api/swiggy-credential-handoff-center"].get.summary).toContain("Credential Handoff");
    expect(openApi.body.paths["/api/swiggy-credential-handoff-center"].get.responses["200"].description).toContain("48-hour soak");
    expect(openApi.body.paths["/api/sandbox-credential-workbench"].get.summary).toContain("sandbox");
    expect(openApi.body.paths["/api/access-submission-studio"].get.summary).toContain("submission studio");
    expect(openApi.body.paths["/api/access-submission-studio/state"].patch.summary).toContain("handoff state");
    expect(openApi.body.paths["/api/auth/swiggy/status"].get.summary).toContain("OAuth callback");
    expect(openApi.body.paths["/api/swiggy-auth-lifecycle-center"].get.summary).toContain("Auth Lifecycle");
    expect(openApi.body.paths["/api/swiggy-auth-lifecycle-center"].get.responses["200"].description).toContain("401/419");
    expect(openApi.body.paths["/api/enterprise-delegated-auth"].get.summary).toContain("Enterprise Delegated Auth");
    expect(openApi.body.paths["/api/enterprise-platform-center"].get.summary).toContain("Enterprise Platform");
    expect(openApi.body.paths["/api/enterprise-platform-center"].get.responses["200"].description).toContain("tenant boundaries");
    expect(openApi.body.paths["/api/observability/traces"].get.summary).toContain("Trace spans");
    expect(openApi.body.paths["/api/telemetry/runtime"].get.summary).toContain("Runtime request telemetry");
    expect(openApi.body.paths["/api/audit-ledger"].get.summary).toContain("audit ledger");
    expect(openApi.body.paths["/api/swiggy-route-optimizer"].get.summary).toContain("route optimization");
    expect(openApi.body.paths["/api/swiggy-route-optimizer"].get.responses["200"].description).toContain("optimizer profiles");
    expect(openApi.body.paths["/api/swiggy-route-optimizer"].get.responses["200"].description).toContain("cross-server handoffs");
    expect(openApi.body.paths["/api/traffic-readiness-plan"].get.summary).toContain("Traffic readiness");
    expect(openApi.body.paths["/api/swiggy-load-lab"].get.summary).toContain("Load Lab");
    expect(openApi.body.paths["/api/swiggy-load-lab"].get.responses["200"].description).toContain("cohort ramps");
    expect(openApi.body.paths["/api/swiggy-quota-negotiation-center"].get.summary).toContain("Quota Negotiation");
    expect(openApi.body.paths["/api/swiggy-quota-negotiation-center"].get.responses["200"].description).toContain("capacity request packet");
    expect(openApi.body.paths["/api/swiggy-offer-intelligence"].get.summary).toContain("Offer Intelligence");
    expect(openApi.body.paths["/api/swiggy-offer-intelligence"].get.responses["200"].description).toContain("Food coupon");
    expect(openApi.body.paths["/api/swiggy-offer-intelligence/decide"].post.summary).toContain("offer");
    expect(openApi.body.paths["/api/swiggy-order-lifecycle"].get.summary).toContain("Order Lifecycle");
    expect(openApi.body.paths["/api/swiggy-order-lifecycle"].get.responses["200"].description).toContain("non-blind retry");
    expect(openApi.body.paths["/api/swiggy-order-lifecycle/probe"].post.summary).toContain("Probe");
    expect(openApi.body.paths["/api/swiggy-location-trust"].get.summary).toContain("Location Trust");
    expect(openApi.body.paths["/api/swiggy-location-trust"].get.responses["200"].description).toContain("address");
    expect(openApi.body.paths["/api/swiggy-location-trust/select"].post.summary).toContain("Select");
    expect(openApi.body.paths["/api/swiggy-cart-mutation-workbench"].get.summary).toContain("Cart Mutation");
    expect(openApi.body.paths["/api/swiggy-cart-mutation-workbench"].get.responses["200"].description).toContain("readback");
    expect(openApi.body.paths["/api/swiggy-cart-mutation-workbench/mutate"].post.summary).toContain("cart mutation");
    expect(openApi.body.paths["/api/swiggy-discovery-freshness"].get.summary).toContain("Discovery Freshness");
    expect(openApi.body.paths["/api/swiggy-discovery-freshness"].get.responses["200"].description).toContain("variant");
    expect(openApi.body.paths["/api/swiggy-discovery-freshness/resolve"].post.summary).toContain("Resolve");
    expect(openApi.body.paths["/api/swiggy-confirmation-command-center"].get.summary).toContain("Confirmation Command");
    expect(openApi.body.paths["/api/swiggy-confirmation-command-center"].get.responses["200"].description).toContain("separate confirmations");
    expect(openApi.body.paths["/api/swiggy-confirmation-command-center/execute"].post.summary).toContain("guarded");
    expect(openApi.body.paths["/api/swiggy-confirmation-command-center/execute"].post.responses["200"].description).toContain("no-blind-retry");
    expect(openApi.body.paths["/api/swiggy-cancellation-care-center"].get.summary).toContain("Cancellation");
    expect(openApi.body.paths["/api/swiggy-cancellation-care-center"].get.responses["200"].description).toContain("report_error");
    expect(openApi.body.paths["/api/swiggy-dineout-precision-center"].get.summary).toContain("Dineout Precision");
    expect(openApi.body.paths["/api/swiggy-dineout-precision-center"].get.responses["200"].description).toContain("bill-payment");
    expect(openApi.body.paths["/api/slo-incident-command"].get.summary).toContain("SLO Incident");
    expect(openApi.body.paths["/api/data-governance-center"].get.summary).toContain("Data Governance");
    expect(openApi.body.paths["/api/production-launch-bundle"].get.summary).toContain("Production Launch Bundle");
    expect(openApi.body.paths["/api/support/bridge"].get.summary).toContain("Support Bridge");
    expect(openApi.body.paths["/api/support/bridge/report"].post.summary).toContain("report_error");
    expect(openApi.body.paths["/api/support/bridge/report"].post.responses["200"].description).toContain("hashed toolContext");
    expect(openApi.body.paths["/api/error-intelligence"].get.summary).toContain("error envelope");
    expect(openApi.body.paths["/api/error-intelligence/classify"].post.summary).toContain("Classify");
    expect(openApi.body.paths["/api/error-intelligence/classify"].post.responses["200"].description).toContain("no-blind-retry");
  });

  it("creates a server-side plan session", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).post("/api/plan").send(planningRequest).expect(201);

    expect(response.body.plan.id).toMatch(/^mp_/);
    expect(response.body.plan.recommendations).toHaveLength(3);
    expect(response.body.meta.storedServerSide).toBe(true);
  });

  it("persists plans in a file-backed store and exposes storage operations", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mealpilot-store-"));
    const dataFile = path.join(tempDir, "store.json");
    const first = createMealPilotServer({ store: createFileSessionStore(dataFile) });
    const created = await request(first.app).post("/api/plan").send(planningRequest).expect(201);
    const sessionId = created.body.plan.id as string;

    const status = await request(first.app).get("/api/storage/status").expect(200);
    expect(status.body.storage.kind).toBe("file");
    expect(status.body.storage.durable).toBe(true);

    const second = createMealPilotServer({ store: createFileSessionStore(dataFile) });
    const restored = await request(second.app).get(`/api/sessions/${sessionId}`).expect(200);
    expect(restored.body.plan.id).toBe(sessionId);

    const exported = await request(second.app).get("/api/storage/export").expect(200);
    expect(exported.body.snapshot.version).toBe(1);

    const compacted = await request(second.app).post("/api/storage/compact").send({ planRetentionDays: 14 }).expect(200);
    expect(compacted.body.storage.kind).toBe("file");
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

  it("serves local MCP resources and prompts through the same JSON-RPC route", async () => {
    const { app } = createMealPilotServer();

    const resources = await request(app)
      .post("/api/mcp/food")
      .send({
        jsonrpc: "2.0",
        id: "resources",
        method: "resources/list",
      })
      .expect(200);

    expect(resources.body.result.resources.map((resource: { uri: string }) => resource.uri)).toEqual(
      expect.arrayContaining(["swiggy://food/widgets", "swiggy://food/static-metadata"]),
    );

    const resource = await request(app)
      .post("/api/mcp/food")
      .send({
        jsonrpc: "2.0",
        id: "resource-read",
        method: "resources/read",
        params: { uri: "swiggy://food/widgets" },
      })
      .expect(200);

    expect(resource.body.result.contents[0].mimeType).toBe("application/json");
    expect(resource.body.result.contents[0].text).toContain("widget_registry");

    const prompts = await request(app)
      .post("/api/mcp/dineout")
      .send({
        jsonrpc: "2.0",
        id: "prompts",
        method: "prompts/list",
      })
      .expect(200);

    expect(prompts.body.result.prompts.some((prompt: { name: string }) => prompt.name === "dineout_evening_planner")).toBe(
      true,
    );

    const prompt = await request(app)
      .post("/api/mcp/dineout")
      .send({
        jsonrpc: "2.0",
        id: "prompt-get",
        method: "prompts/get",
        params: { name: "dineout_evening_planner", arguments: { guests: 4, date: "2026-07-11" } },
      })
      .expect(200);

    expect(prompt.body.result.messages[0].content.text).toContain("Dineout specialist");
    expect(prompt.body.result.messages[1].content.text).toContain("guests");
  });

  it("reports MCP gateway cutover status and fails closed without staging token", async () => {
    const { app } = createMealPilotServer({
      config: {
        appName: "MealPilot India",
        port: 8787,
        swiggyMode: "staging",
        swiggyClientId: "client_staging",
        swiggyRedirectUri: "https://mealpilot.app/auth/swiggy/callback",
        swiggyScope: "mcp:tools mcp:resources mcp:prompts",
        swiggyBaseUrl: "https://mcp-staging.swiggy.com",
        planRetentionDays: 14,
      },
    });

    const gateway = await request(app).get("/api/mcp-gateway").expect(200);
    expect(gateway.body.gateway.activeTransport).toBe("swiggy_streamable_http");
    expect(gateway.body.gateway.requestedServers.every((server: { status: string }) => server.status === "blocked")).toBe(true);

    const blocked = await request(app)
      .post("/api/mcp/food")
      .send({
        jsonrpc: "2.0",
        id: "blocked",
        method: "tools/call",
        params: { name: "get_addresses", arguments: {} },
      })
      .expect(401);

    expect(blocked.body.error.message).toContain("OAuth token");

    const firstCallBlocked = await request(app)
      .post("/api/swiggy-developer-quickstart/run-first-call")
      .send({ drillId: "food_get_addresses" })
      .expect(200);

    expect(firstCallBlocked.body.firstCallExecution.decision).toBe("external_gate");
    expect(firstCallBlocked.body.firstCallExecution.executedTools).toEqual([]);
    expect(firstCallBlocked.body.firstCallExecution.riskFlags).toContain("live_swiggy_token_required_for_first_call");
  });

  it("forwards live MCP resources and prompts without rewriting JSON-RPC methods", async () => {
    const originalFetch = globalThis.fetch;
    const forwardedBodies: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      forwardedBodies.push(body);
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          result:
            body.method === "resources/list"
              ? { resources: [{ uri: "swiggy://food/session", name: "Food session" }] }
              : { messages: [{ role: "user", content: { type: "text", text: "Prompt forwarded" } }] },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const { app } = createMealPilotServer({
        config: {
          appName: "MealPilot India",
          port: 8787,
          swiggyMode: "staging",
          swiggyClientId: "client_staging",
          swiggyRedirectUri: "https://mealpilot.app/auth/swiggy/callback",
          swiggyScope: "mcp:tools mcp:resources mcp:prompts",
          swiggyBaseUrl: "https://mcp-staging.swiggy.com",
          swiggyAccessToken: "staging_token",
          planRetentionDays: 14,
        },
      });

      const resources = await request(app)
        .post("/api/mcp/food")
        .send({ jsonrpc: "2.0", id: "live-resources", method: "resources/list" })
        .expect(200);

      const prompt = await request(app)
        .post("/api/mcp/dineout")
        .send({
          jsonrpc: "2.0",
          id: "live-prompt",
          method: "prompts/get",
          params: { name: "dineout_evening_planner", arguments: { guests: 4 } },
        })
        .expect(200);

      expect(resources.body.result.resources[0].uri).toBe("swiggy://food/session");
      expect(prompt.body.result.messages[0].content.text).toBe("Prompt forwarded");
      expect(forwardedBodies.map((body) => body.method)).toEqual(["resources/list", "prompts/get"]);
      expect(forwardedBodies[1].params).toEqual({ name: "dineout_evening_planner", arguments: { guests: 4 } });
      expect(fetchMock.mock.calls[0][0]).toBe("https://mcp-staging.swiggy.com/food");
      expect(fetchMock.mock.calls[1][0]).toBe("https://mcp-staging.swiggy.com/dineout");
      expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization")).toBe("Bearer staging_token");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fails closed for live developer first-call errors and placeholder drills", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          error: { code: -32000, message: "Swiggy tool unavailable" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    globalThis.fetch = fetchMock as typeof fetch;

    try {
      const { app } = createMealPilotServer({
        config: {
          appName: "MealPilot India",
          port: 8787,
          swiggyMode: "staging",
          swiggyClientId: "client_staging",
          swiggyRedirectUri: "https://mealpilot.app/auth/swiggy/callback",
          swiggyScope: "mcp:tools mcp:resources mcp:prompts",
          swiggyBaseUrl: "https://mcp-staging.swiggy.com",
          swiggyAccessToken: "staging_token",
          planRetentionDays: 14,
        },
      });

      const errored = await request(app)
        .post("/api/swiggy-developer-quickstart/run-first-call")
        .send({ drillId: "food_get_addresses" })
        .expect(200);

      expect(errored.body.firstCallExecution.decision).toBe("tool_error");
      expect(errored.body.firstCallExecution.responseSummary.available).toBe(false);
      expect(errored.body.firstCallExecution.responseSummary.primaryLabel).toBe("tool_error");
      expect(errored.body.firstCallExecution.riskFlags).toContain("swiggy_first_call_tool_error");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const gated = await request(app)
        .post("/api/swiggy-developer-quickstart/run-first-call")
        .send({ drillId: "food_search_restaurants" })
        .expect(200);

      expect(gated.body.firstCallExecution.decision).toBe("external_gate");
      expect(gated.body.firstCallExecution.executedTools).toEqual([]);
      expect(gated.body.firstCallExecution.riskFlags).toContain("concrete_runtime_location_required_for_first_call");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("returns a Swiggy staging cutover rehearsal for real MCP transport", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/mcp/staging-cutover").expect(200);
    const cutover = response.body.stagingCutover;

    expect(cutover.score).toBeGreaterThanOrEqual(85);
    expect(cutover.totalServers).toBe(3);
    expect(cutover.routableServers).toBe(3);
    expect(cutover.blockedServers).toBe(0);
    expect(cutover.dryRunCalls).toBe(3);
    expect(cutover.activeTransport).toBe("local_mock");
    expect(cutover.credentialState.scope).toContain("mcp:tools");
    expect(cutover.probes.map((probe: { server: string; firstTool: string }) => [probe.server, probe.firstTool])).toEqual([
      ["food", "get_addresses"],
      ["instamart", "get_addresses"],
      ["dineout", "get_saved_locations"],
    ]);
    expect(
      cutover.probes.every(
        (probe: { dryRunRequest: { method: string }; failureBranches: Array<{ status: string }> }) =>
          probe.dryRunRequest.method === "tools/call" &&
          probe.failureBranches.some((branch) => branch.status === "401") &&
          probe.failureBranches.some((branch) => branch.status === "network"),
      ),
    ).toBe(true);
    expect(cutover.oauthChecks.some((check: { id: string; status: string }) => check.id === "pkce" && check.status === "ready")).toBe(true);
    expect(cutover.transportChecks.some((check: { id: string }) => check.id === "fail_closed")).toBe(true);
    expect(
      cutover.promotionChecks.some(
        (check: { id: string; status: string }) => check.id === "green_48h" && check.status === "external_gate",
      ),
    ).toBe(true);
    expect(cutover.supportPacket.to).toBe("builders@swiggy.in");
    expect(cutover.commands.some((command: { id: string; command: string }) => command.id === "staging_env" && command.command.includes("SWIGGY_ENV=staging"))).toBe(true);
    expect(cutover.assertions.some((assertion: string) => assertion.includes("fails closed"))).toBe(true);
  });

  it("returns credential onboarding and Dynamic Client Registration evidence", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/credential-onboarding").expect(200);

    expect(response.body.onboarding.score).toBeGreaterThanOrEqual(90);
    expect(response.body.onboarding.dynamicClientRegistration.endpoint).toContain("/auth/register");
    expect(response.body.onboarding.dynamicClientRegistration.payload.scope).toContain("mcp:tools");
    expect(response.body.onboarding.redirectUriAudit.localhostAllowed).toBe(true);
    expect(response.body.onboarding.metadataEndpoints.some((endpoint: { id: string }) => endpoint.id === "authorization_server")).toBe(true);
    expect(response.body.onboarding.checks.some((check: { id: string }) => check.id === "pkce")).toBe(true);
    expect(
      response.body.onboarding.accessApplicationFields.some((field: { id: string }) => field.id === "redirect_uris"),
    ).toBe(true);
  });

  it("returns a Swiggy Credential Vault Center for secret posture and rotation", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-credential-vault-center").expect(200);
    const vault = response.body.credentialVault;

    expect(vault.score).toBeGreaterThanOrEqual(60);
    expect(vault.totals.secrets).toBe(7);
    expect(vault.totals.rotations).toBe(4);
    expect(vault.totals.redactionRules).toBe(4);
    expect(vault.secrets.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["swiggy_env", "client_id", "redirect_uri", "scope", "access_token", "token_expiry", "data_file"]),
    );
    expect(vault.rotationRunbook.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["oauth_reauth", "dcr_client_rotation", "environment_cutover", "support_redaction_review"]),
    );
    expect(vault.cutoverChecks.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["gateway_status", "onboarding_status", "sandbox_workbench", "production_verifier"]),
    );
    expect(vault.redactionRules.some((rule: { id: string; rule: string }) => rule.id === "no_full_token" && rule.rule.includes("Never return"))).toBe(true);
    expect(vault.supportPacket.to).toBe("builders@swiggy.in");
    expect(vault.supportPacket.forbiddenFields).toEqual(expect.arrayContaining(["access_token", "PKCE verifier"]));
    expect(vault.assertions.some((assertion: string) => assertion.includes("Full bearer tokens"))).toBe(true);
    expect(vault.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns a Swiggy Credential Handoff Center for localhost-to-production sequencing", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-credential-handoff-center").expect(200);
    const handoff = response.body.credentialHandoff;

    expect(handoff.score).toBeGreaterThanOrEqual(80);
    expect(handoff.totals.phases).toBe(8);
    expect(handoff.totals.controls).toBe(5);
    expect(handoff.totals.packets).toBe(5);
    expect(handoff.phases.map((phaseItem: { id: string }) => phaseItem.id)).toEqual(
      expect.arrayContaining([
        "localhost_demo",
        "dcr_payload",
        "redirect_uri",
        "oauth_pkce",
        "secret_storage",
        "staging_credentials",
        "seeded_smoke",
        "production_promotion",
      ]),
    );
    expect(handoff.controls.map((controlItem: { id: string }) => controlItem.id)).toEqual(
      expect.arrayContaining(["no_full_token", "fail_closed_gateway", "read_first_staging", "all_tool_certification", "support_ready"]),
    );
    expect(
      handoff.credentialPackets.some(
        (packet: { id: string; command: string }) =>
          packet.id === "handoff_center" && packet.command.includes("/api/swiggy-credential-handoff-center"),
      ),
    ).toBe(true);
    expect(handoff.handoffEmail.to).toBe("builders@swiggy.in");
    expect(handoff.assertions.some((assertion: string) => assertion.includes("Every credential step has an owner"))).toBe(true);
    expect(handoff.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns a Swiggy staging credential drill for first credentialed access", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-staging-credential-drill").expect(200);
    const drill = response.body.stagingCredentialDrill;

    expect(drill.score).toBeGreaterThanOrEqual(70);
    expect(drill.credentialSignal.currentGate).toBe("swiggy_gate");
    expect(drill.totals.lanes).toBe(6);
    expect(drill.totals.firstCallDrills).toBe(3);
    expect(drill.totals.seededDataRequirements).toBe(3);
    expect(drill.totals.promotionGates).toBe(4);
    expect(drill.lanes.map((laneItem: { id: string }) => laneItem.id)).toEqual(
      expect.arrayContaining(["oauth_dcr", "seeded_data", "first_call_wave", "operating_contract"]),
    );
    expect(
      drill.firstCallDrills.map((item: { server: string; firstTool: string }) => [item.server, item.firstTool]),
    ).toEqual([
      ["food", "get_addresses"],
      ["instamart", "get_addresses"],
      ["dineout", "get_saved_locations"],
    ]);
    expect(
      drill.operatorRunbook.some(
        (step: { command: string; proves: string }) =>
          step.command.includes("SWIGGY_ENV=staging") && step.proves.includes("Swiggy staging"),
      ),
    ).toBe(true);
    expect(drill.handoffEmail.to).toBe("builders@swiggy.in");
    expect(drill.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns a Swiggy staging seed and smoke center for credentialed certification", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-staging-seed-smoke-center").expect(200);
    const center = response.body.stagingSeedSmoke;

    expect(center.score).toBeGreaterThanOrEqual(70);
    expect(center.totals.servers).toBe(3);
    expect(center.totals.seededFixtures).toBeGreaterThanOrEqual(15);
    expect(center.totals.smokeWaves).toBe(6);
    expect(center.totals.credentialGates).toBeGreaterThanOrEqual(8);
    expect(center.totals.stopRules).toBeGreaterThanOrEqual(6);
    expect(center.serverMatrix.map((server: { server: string; firstReadTool: string }) => `${server.server}:${server.firstReadTool}`)).toEqual(
      ["food:get_addresses", "instamart:get_addresses", "dineout:search_restaurants_dineout"],
    );
    expect(center.smokeWaves.map((wave: { id: string }) => wave.id)).toEqual(
      expect.arrayContaining([
        "credential_and_seed",
        "read_discovery",
        "mutation_refresh",
        "commercial_confirmation",
        "support_escalation",
        "promotion_soak",
      ]),
    );
    expect(
      center.smokeWaves.some(
        (wave: { id: string; stopRules: string[]; tools: string[] }) =>
          wave.id === "commercial_confirmation" &&
          wave.tools.includes("food.place_food_order") &&
          wave.stopRules.some((rule) => rule.includes("Never blind-retry")),
      ),
    ).toBe(true);
    expect(center.telemetryEvidence.some((item: { id: string }) => item.id === "runtime_event_contract")).toBe(true);
    expect(center.assertions.some((assertion: string) => assertion.includes("Seeded staging data"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns a Swiggy live signal calibration center for staging personalization proof", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-live-signal-calibration").expect(200);
    const calibration = response.body.liveSignalCalibration;

    expect(calibration.score).toBeGreaterThanOrEqual(74);
    expect(calibration.totals.lanes).toBe(6);
    expect(calibration.totals.probes).toBe(4);
    expect(calibration.totals.stagingWaves).toBe(5);
    expect(calibration.totals.privacyControls).toBe(4);
    expect(calibration.signalLanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "food_active_order_memory",
        "instamart_pantries_and_go_to",
        "dineout_location_booking_truth",
        "offer_cart_truth",
      ]),
    );
    expect(
      calibration.serverCalibration.map((server: { server: string; readOnlyTools: string[] }) => [
        server.server,
        server.readOnlyTools.length,
      ]),
    ).toEqual([
      ["food", 4],
      ["instamart", 5],
      ["dineout", 4],
    ]);
    expect(
      calibration.probes.some(
        (probe: { id: string; failureStopRule: string }) =>
          probe.id === "combined_offer_drift_probe" && probe.failureStopRule.includes("coupon rejection"),
      ),
    ).toBe(true);
    expect(
      calibration.operatorRunbook.some(
        (step: { command: string; proves: string }) =>
          step.command.includes("/api/swiggy-live-signal-calibration") && step.proves.includes("staging"),
      ),
    ).toBe(true);
    expect(calibration.externalGates.some((gate: string) => gate.includes("seeded Food"))).toBe(true);
  });

  it("returns a sandbox credential workbench for localhost-to-staging readiness", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/sandbox-credential-workbench").expect(200);
    const workbench = response.body.sandboxWorkbench;

    expect(workbench.score).toBeGreaterThanOrEqual(82);
    expect(workbench.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/docs/start/authenticate/",
        "https://mcp.swiggy.com/builders/docs/operate/access/",
      ]),
    );
    expect(workbench.localReadiness.scopesReady).toBe(true);
    expect(workbench.localReadiness.pkceReady).toBe(true);
    const sandboxScoreWeights: Record<string, number> = {
      ready: 1,
      operator_input: 0.84,
      swiggy_gate: 0.76,
      blocked: 0.2,
    };
    const calculatedScore = Math.round(
      (workbench.lanes.reduce(
        (sum: number, laneItem: { status: string }) => sum + sandboxScoreWeights[laneItem.status],
        0,
      ) /
        workbench.lanes.length) *
        100,
    );
    expect(workbench.score).toBe(calculatedScore);
    expect(workbench.lanes.map((laneItem: { id: string }) => laneItem.id)).toEqual(
      expect.arrayContaining([
        "local_video",
        "dcr_client_identity",
        "pkce_oauth",
        "redirect_allowlist",
        "staging_credentials",
        "production_promotion",
      ]),
    );
    expect(
      workbench.seededDataPlan.map((plan: { server: string; guardedWrite: string }) => [
        plan.server,
        plan.guardedWrite,
      ]),
    ).toEqual(
      expect.arrayContaining([
        ["food", "place_food_order"],
        ["instamart", "checkout"],
        ["dineout", "book_table"],
      ]),
    );
    expect(workbench.stagingPromotion.soakHoursRequired).toBe(48);
    expect(workbench.stagingPromotion.assignedTools).toBe(35);
    expect(
      workbench.commands.some(
        (command: { id: string; command: string }) =>
          command.id === "staging_cutover" && command.command.includes("/api/mcp/staging-cutover"),
      ),
    ).toBe(true);
    expect(workbench.assertions.some((assertion: string) => assertion.includes("locally without Swiggy credentials"))).toBe(
      true,
    );
    expect(workbench.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("models Swiggy enterprise delegated auth and on-behalf-of gates", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/enterprise-delegated-auth").expect(200);
    const center = response.body.enterpriseAuth;

    expect(center.score).toBeGreaterThanOrEqual(90);
    expect(center.principle.swiggyRole).toBe("Data Fiduciary");
    expect(center.principle.platformRole).toBe("Data Processor");
    expect(center.flow.map((step: { id: string }) => step.id)).toEqual(
      expect.arrayContaining([
        "platform_preregistration",
        "per_user_pkce",
        "authorize_redirect",
        "token_exchange",
        "per_user_storage",
        "mcp_call_on_behalf",
        "expiry_reauth",
        "logout_disconnect",
      ]),
    );
    expect(center.redirectUriStrategy.exactMatchRequired).toBe(true);
    expect(center.redirectUriStrategy.allowedExamples).toEqual(
      expect.arrayContaining(["googleassistant://oauth2redirect", "alexa://oauth/callback", "jio-hello://oauth/callback"]),
    );
    expect(center.tokenLifecycle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ item: "Authorization code", lifetime: "120 seconds" }),
        expect.objectContaining({ item: "Access token", lifetime: "5 days" }),
        expect.objectContaining({ item: "User session", lifetime: "30 days idle sliding" }),
      ]),
    );
    expect(center.storageRules.map((rule: { id: string }) => rule.id)).toEqual(
      expect.arrayContaining(["per_user_boundary", "no_password_or_otp", "plaintext_lifetime", "logout_revoke"]),
    );
    expect(center.scopes.map((scope: { scope: string }) => scope.scope)).toEqual(
      expect.arrayContaining(["mcp:tools", "mcp:resources", "mcp:prompts"]),
    );
    expect(center.troubleshooting.map((item: { symptom: string }) => item.symptom)).toEqual(
      expect.arrayContaining(["401 Unauthorized", "419 Session expired", "403 Forbidden", "Upstream shedding", "Bad redirect"]),
    );
    expect(center.platformUseCases.some((useCase: { surface: string }) => useCase.surface === "enterprise_saas")).toBe(true);
    expect(center.architectureReview.map((item: { topic: string }) => item.topic)).toEqual(
      expect.arrayContaining(["Delegated OAuth", "Rate limits and capacity", "Observability handoff", "Data handling"]),
    );
    expect(center.externalGates.some((gate: string) => gate.includes("platform-operator"))).toBe(true);
  });

  it("models Swiggy enterprise platform readiness for tenant, quota, support, and contract gates", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/enterprise-platform-center").expect(200);
    const center = response.body.enterprisePlatform;

    expect(center.score).toBeGreaterThanOrEqual(88);
    expect(center.currentTrack).toBe("developer_ready_enterprise_planned");
    expect(center.platformProfile.surfaces).toEqual(expect.arrayContaining(["voice", "chat", "enterprise SaaS"]));
    expect(center.readinessLanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "platform_operator_path",
        "tenant_delegated_auth",
        "quota_and_peak_qps",
        "staging_soak",
        "contract_sla_support",
      ]),
    );
    expect(center.tenantControls.map((control: { id: string }) => control.id)).toEqual(
      expect.arrayContaining(["tenant_registry", "per_user_tokens", "tenant_quota_profile", "tenant_support_routing", "tenant_audit_export"]),
    );
    expect(center.supportLanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining(["builders_email", "security_email", "designated_contact", "runtime_report_error", "enterprise_slack"]),
    );
    expect(center.contractGates.map((gate: { id: string }) => gate.id)).toEqual(
      expect.arrayContaining(["commercial_terms", "security_attestations", "peak_qps_review", "co_branding_approval"]),
    );
    expect(center.auditExports).toHaveLength(3);
    expect(center.totals.readyTenantControls).toBe(5);
    expect(center.externalGates.some((gate: string) => gate.includes("Enterprise access"))).toBe(true);
    expect(center.assertions.some((assertion: string) => assertion.includes("separate access track"))).toBe(true);
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
    const initialStatus = await request(app).get("/api/auth/swiggy/status").expect(200);
    expect(initialStatus.body.authStatus.latestEvent.status).toBe("not_started");
    expect(initialStatus.body.authStatus.endpoints.authorize).toContain("/auth/authorize");

    const start = await request(app).post("/api/auth/swiggy/start").expect(200);
    expect(start.body.authStatus.latestEvent.status).toBe("authorization_url_created");
    expect(start.body.authStatus.pendingVerifierCount).toBe(1);
    expect(start.body.authStatus.callbackChecklist.some((item: { id: string }) => item.id === "pkce_s256")).toBe(true);

    const callback = await request(app)
      .get("/api/auth/swiggy/callback")
      .query({ code: "mock_code", state: start.body.state })
      .expect(200);
    expect(callback.body.tokenExchange).toBe("mocked");
    expect(callback.body.authStatus.latestEvent.status).toBe("callback_mocked");
    expect(callback.body.authStatus.pendingVerifierCount).toBe(0);

    const afterStatus = await request(app).get("/api/auth/swiggy/status").expect(200);
    expect(afterStatus.body.authStatus.latestEvent.status).toBe("callback_mocked");
    expect(afterStatus.body.authStatus.storagePolicy.some((item: string) => item.includes("Never log access tokens"))).toBe(true);

    const lifecycle = await request(app).get("/api/swiggy-auth-lifecycle-center").expect(200);
    expect(lifecycle.body.authLifecycleCenter.score).toBeGreaterThanOrEqual(90);
    expect(lifecycle.body.authLifecycleCenter.tokenLifetimes).toMatchObject({
      authorizationCodeSeconds: 120,
      accessTokenDays: 5,
      idleSessionDays: 30,
      refreshTokenAvailableInV1: false,
    });
    expect(lifecycle.body.authLifecycleCenter.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining(["pkce_s256_authorize", "single_use_code_exchange", "five_day_access_token", "no_refresh_token_v1", "reauth_on_401_419"]),
    );
    expect(lifecycle.body.authLifecycleCenter.recoveryScenarios.map((scenario: { trigger: string }) => scenario.trigger)).toEqual(
      expect.arrayContaining(["401", "419", "403", "refresh_requested", "logout"]),
    );
    expect(lifecycle.body.authLifecycleCenter.assertions.some((assertion: string) => assertion.includes("does not assume refresh-token"))).toBe(true);

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

    const bridge = await request(app).get("/api/support/bridge").query({ sessionId }).expect(200);
    expect(bridge.body.supportBridge.score).toBe(100);
    expect(bridge.body.supportBridge.reportErrorTools).toHaveLength(3);
    expect(
      bridge.body.supportBridge.reportErrorTools.every(
        (item: { request: { method: string; params: { name: string } } }) =>
          item.request.method === "tools/call" && item.request.params.name === "report_error",
      ),
    ).toBe(true);
    expect(
      bridge.body.supportBridge.reportErrorTools.some(
        (item: { server: string; request: { params: { arguments: { domain: string; toolContext: Record<string, unknown> } } } }) =>
          item.server === "instamart" &&
          item.request.params.arguments.domain === "im" &&
          item.request.params.arguments.toolContext.mealPilotSessionId === sessionId,
      ),
    ).toBe(true);
    expect(bridge.body.supportBridge.slaMatrix.some((sla: { severity: string; ack: string }) => sla.severity === "S0" && sla.ack)).toBe(
      true,
    );
    expect(bridge.body.supportBridge.incidentEmail.to).toBe("builders@swiggy.in");

    const executedSupport = await request(app)
      .post("/api/support/bridge/report")
      .send({
        server: "instamart",
        failedTool: "checkout",
        severity: "S2",
        errorMessage: "Checkout returned a user-visible upstream error after confirmation.",
        flowDescription: "searched products -> updated cart -> refreshed cart -> checkout failed",
        userNotes: "Please report this without my phone +919999999999 or email user@example.com",
        toolContext: { addressId: "addr_home_001", cartId: "im_cart_preview", paymentMethod: "COD" },
        sessionId,
        issueObserved: true,
        userConsented: true,
      })
      .expect(200);
    const supportExecution = executedSupport.body.supportExecution;
    expect(supportExecution.decision).toBe("reported_with_receipt");
    expect(supportExecution.executedTools).toEqual(["report_error"]);
    expect(supportExecution.reportErrorArguments.domain).toBe("im");
    expect(supportExecution.reportErrorArguments.toolContext.addressId).not.toBe("addr_home_001");
    expect(supportExecution.reportErrorArguments.userNotes).not.toContain("user@example.com");
    expect(supportExecution.reportErrorArguments.userNotes).not.toContain("+919999999999");
    expect(supportExecution.redaction.rawTokensRetained).toBe(false);
    expect(supportExecution.responseSummary.available).toBe(true);
    expect(
      supportExecution.telemetry.some(
        (field: { field: string; value: string }) => field.field === "report_error_executed" && field.value === "true",
      ),
    ).toBe(true);

    const noConsent = await request(app)
      .post("/api/support/bridge/report")
      .send({
        server: "food",
        failedTool: "place_food_order",
        severity: "S2",
        errorMessage: "Order placement failed.",
        flowDescription: "cart read -> user confirmation -> placement error",
        userNotes: "Do not send yet.",
        toolContext: { restaurantId: "rest_green_bowl" },
        sessionId,
        issueObserved: true,
        userConsented: false,
      })
      .expect(200);
    expect(noConsent.body.supportExecution.decision).toBe("blocked_user_consent");
    expect(noConsent.body.supportExecution.executedTools).toEqual([]);

    const noSession = await request(app)
      .post("/api/support/bridge/report")
      .send({
        server: "dineout",
        failedTool: "book_table",
        severity: "S2",
        errorMessage: "Booking failed.",
        flowDescription: "slot selected -> booking failed",
        userNotes: "Report this.",
        toolContext: { restaurantId: "la_piazza" },
        issueObserved: true,
        userConsented: true,
      })
      .expect(200);
    expect(noSession.body.supportExecution.decision).toBe("blocked_missing_session");
    expect(noSession.body.supportExecution.executedTools).toEqual([]);
  });

  it("maps the researched Swiggy Builders website, CTAs, and opportunities", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-builders-map").expect(200);

    expect(response.body.map.officialSource).toBe("https://mcp.swiggy.com/builders/");
    expect(response.body.map.totalOfficialTools).toBe(35);
    expect(response.body.map.pages.length).toBeGreaterThanOrEqual(15);
    expect(response.body.map.ctas.some((cta: { label: string }) => cta.label === "Start Building")).toBe(true);
    expect(response.body.map.opportunities[0].impactScore).toBeGreaterThanOrEqual(90);
    expect(response.body.map.credentialGates.some((gate: string) => gate.includes("Staging credentials"))).toBe(true);
  });

  it("returns the Swiggy Builders website atlas with header, footer, module, and CTA coverage", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-website-atlas").expect(200);

    expect(response.body.atlas.score).toBeGreaterThanOrEqual(90);
    expect(response.body.atlas.globalHeader.map((link: { label: string }) => link.label)).toEqual(
      expect.arrayContaining(["Builders Club", "Developers", "Enterprises", "Docs", "Blog", "FAQ", "Start Building"]),
    );
    expect(response.body.atlas.docsHeader.map((link: { label: string }) => link.label)).toEqual(
      expect.arrayContaining(["Home", "Start", "Build", "Reference", "Operate"]),
    );
    expect(response.body.atlas.footerGroups.some((group: { title: string }) => group.title === "Legal")).toBe(true);
    expect(response.body.atlas.pages.some((page: { id: string }) => page.id === "developers")).toBe(true);
    expect(response.body.atlas.pages.some((page: { id: string }) => page.id === "access")).toBe(true);
    expect(response.body.atlas.pages.some((page: { id: string }) => page.id === "blog_launch")).toBe(true);
    expect(response.body.atlas.ctas.some((cta: { label: string }) => cta.label === "Send Us a Demo")).toBe(true);
    expect(response.body.atlas.ctas.map((cta: { label: string }) => cta.label)).toEqual(
      expect.arrayContaining(["Apply as Developer", "Apply as Enterprise", "Read the docs", "Apply now"]),
    );
    expect(response.body.atlas.modulesCovered).toBeGreaterThanOrEqual(38);
    expect(response.body.atlas.liveCrawlPages).toBeGreaterThanOrEqual(6);
    expect(response.body.atlas.liveCrawlSignals).toBeGreaterThanOrEqual(90);
    expect(response.body.atlas.crawlEvidence.map((item: { pageId: string }) => item.pageId)).toEqual(
      expect.arrayContaining(["home", "developers", "enterprises", "access", "docs_home", "blog_launch"]),
    );
    expect(
      response.body.atlas.crawlEvidence.some(
        (item: { pageId: string; renderedLineCount: number; ctaSignals: string[]; moduleSignals: string[]; mealPilotEvidence: string[] }) =>
          item.pageId === "access" &&
          item.renderedLineCount >= 200 &&
          item.ctaSignals.includes("Apply as Developer") &&
          item.moduleSignals.includes("The Ground Rules") &&
          item.mealPilotEvidence.includes("/api/submission-console"),
      ),
    ).toBe(true);
    expect(
      response.body.atlas.coverageAssertions.some((assertion: string) => assertion.includes("Rendered live-page crawl evidence")),
    ).toBe(true);
  });

  it("audits the live Swiggy Builders homepage against Website Atlas expectations", async () => {
    const fixture = [
      "<html><head>",
      "<title>Swiggy Builders Club | Cook on Swiggy’s MCP APIs</title>",
      '<meta name="description" content="Build AI agents, apps, and integrations on Swiggy’s Food, Instamart, and Dineout APIs."/>',
      '<link rel="canonical" href="https://mcp.swiggy.com/builders/"/>',
      '<link rel="alternate" type="text/plain" title="llms.txt" href="/builders/llms.txt"/>',
      '<link rel="alternate" type="text/plain" title="llms-full.txt" href="/builders/llms-full.txt"/>',
      "</head><body>",
      '<a href="/builders/">Builders Club</a><a href="/builders/developers/">Developers</a><a href="/builders/enterprises/">Enterprises</a><a href="/builders/docs/">Docs</a><a href="/builders/blog/">Blog</a><a href="#faq">FAQ</a><a href="/builders/docs/start/developer/">Start Building</a>',
      '<a href="#about">See What’s Possible</a><a href="mailto:builders@swiggy.in">Send Us a Demo</a><a href="/builders/access/">Request access</a><a href="/builders/llms.txt">llms.txt</a><a href="/builders/llms-full.txt">llms-full.txt</a>',
      '<a href="/builders/developers/">For Developers</a><a href="/builders/enterprises/">For Enterprises</a><a href="/builders/#how-it-works">How It Works</a><a href="/builders/#benefits">Benefits</a><a href="/builders/access/#guidelines">Guidelines</a><a href="/builders/#faq">FAQ</a><a href="/builders/access/">Apply</a><a href="https://www.swiggy.com/privacy-policy">Privacy Policy</a><a href="https://www.swiggy.com/terms-and-conditions">Terms and Conditions</a>',
      "Build on Swiggy What is Builders Club How It Works What You Get Frequently Asked Questions What Will You Cook",
      "</body></html>",
    ].join("");
    const auditor = await buildSwiggyBuildersSiteParityAuditor(async () => ({
      ok: true,
      statusCode: 200,
      durationMs: 5,
      text: fixture,
    }));

    expect(auditor.score).toBe(100);
    expect(auditor.status).toBe("covered");
    expect(auditor.fetch.statusCode).toBe(200);
    expect(auditor.metadata.alternateSources).toEqual(
      expect.arrayContaining(["https://mcp.swiggy.com/builders/llms.txt", "https://mcp.swiggy.com/builders/llms-full.txt"]),
    );
    expect(auditor.totals.unsafeLinks).toBe(0);
    expect(auditor.totals.missingExpectedItems).toBe(0);
    expect(auditor.totals.matchedModuleSignals).toBe(auditor.totals.moduleSignals);
    expect(auditor.anchors.some((anchor) => anchor.label === "Send Us a Demo" && anchor.kind === "email")).toBe(true);
    expect(auditor.expectedItems.some((item) => item.id === "cta_apply_prod_access" && item.status === "covered")).toBe(true);
    expect(auditor.assertions.some((assertion) => assertion.includes("user-supplied URLs are never accepted"))).toBe(true);
  });

  it("audits the public Swiggy Builders page mesh against Website Atlas pages", async () => {
    const responseFor = (url: string) => {
      const pageLabel = url.includes("/developers/")
        ? "For Developers"
        : url.includes("/enterprises/")
          ? "For Enterprises"
          : url.includes("/access/")
            ? "Ready to Go to Production"
            : url.includes("/docs/reference/")
              ? "Reference"
              : url.includes("/docs/")
                ? "Docs Home"
                : url.includes("/blog/")
                  ? "Builders Club Launch Blog"
                  : "Build on Swiggy";
      return [
        `<title>${pageLabel} | Swiggy Builders Club</title>`,
        '<a href="/builders/">Builders Club</a><a href="/builders/developers/">Developers</a><a href="/builders/enterprises/">Enterprises</a><a href="/builders/docs/">Docs</a><a href="/builders/blog/">Blog</a><a href="/builders/docs/start/developer/">Start Building</a>',
        '<a href="/builders/access/">Request access</a><a href="https://forms.gle/developer">Apply as Developer</a><a href="https://forms.gle/enterprise">Apply as Enterprise</a><a href="https://forms.gle/enterprise">Apply for Access</a><a href="mailto:builders@swiggy.in">Contact Us</a><a href="mailto:builders@swiggy.in">Send Us a Demo</a><a href="/builders/docs/">Read the docs</a><a href="https://www.swiggy.com/privacy-policy">Privacy Policy</a>',
        "Hero and proof stats What is Builders Club How It Works What You Get Frequently Asked Questions Developer hero Why Developers Love This What Could You Build Your Toolkit Developer FAQ Enterprise hero Why Enterprises Choose This Enterprise Access Includes Ready to Go to Production Application requirements Swiggy review checks Ground rules Operational expectations Legal framework Ready to Apply Launch announcement Builder journey Builder benefits Ecosystem stack Start building links Developer, Enterprise, Consumer tracks What you can build Explore docs Built on MCP standard Food reference Instamart reference Dineout reference Error codes",
      ].join("");
    };
    const auditor = await buildSwiggyBuildersPageMeshAuditor(async (url) => ({
      ok: true,
      statusCode: 200,
      durationMs: 6,
      text: responseFor(url),
    }));

    expect(auditor.score).toBeGreaterThanOrEqual(95);
    expect(auditor.totals.pages).toBe(7);
    expect(auditor.totals.fetchedPages).toBe(7);
    expect(auditor.totals.integrityVerifiedPages).toBe(7);
    expect(auditor.totals.atlasFallbackPages).toBe(0);
    expect(auditor.totals.blockedPages).toBe(0);
    expect(auditor.totals.unsafeLinks).toBe(0);
    expect(auditor.pages.map((page) => page.id)).toEqual(
      expect.arrayContaining(["home", "developers", "enterprises", "access", "blog_launch", "docs_home", "reference"]),
    );
    expect(auditor.pages.every((page) => page.status === "covered")).toBe(true);
    expect(auditor.pages.every((page) => page.contentIntegrity === "verified")).toBe(true);
    expect(auditor.assertions.some((assertion) => assertion.includes("user-supplied URLs are never accepted"))).toBe(true);
  });

  it("discloses Website Atlas fallback when Swiggy returns a generic temporary-glitch shell", async () => {
    const genericShell = [
      "<title>Order food online from India's best food delivery service</title>",
      "<div class=\"GenericError__title\">We'll be back shortly</div>",
      "<div class=\"GenericError__description\">We are fixing a temporary glitch. Sorry for the inconvenience.</div>",
      '<a href="javascript:exit()">Go Back</a>',
    ].join("");
    const auditor = await buildSwiggyBuildersPageMeshAuditor(async () => ({
      ok: true,
      statusCode: 200,
      durationMs: 6,
      text: genericShell,
    }));

    expect(auditor.totals.pages).toBe(7);
    expect(auditor.totals.fetchedPages).toBe(7);
    expect(auditor.totals.integrityVerifiedPages).toBe(0);
    expect(auditor.totals.atlasFallbackPages).toBe(7);
    expect(auditor.totals.blockedPages).toBe(0);
    expect(auditor.pages.every((page) => page.contentIntegrity === "atlas_fallback")).toBe(true);
    expect(auditor.pages.every((page) => page.integrityEvidence.includes("Website Atlas fallback"))).toBe(true);
    expect(auditor.driftSignals.some((signal) => signal.includes("Website Atlas fallback"))).toBe(true);
    expect(auditor.assertions.some((assertion) => assertion.includes("HTTP 200 is not enough"))).toBe(true);
  });

  it("uses Website Atlas fallback when official Builders pages return non-200 responses", async () => {
    const auditor = await buildSwiggyBuildersPageMeshAuditor(async () => ({
      ok: false,
      statusCode: 503,
      durationMs: 6,
      error: "temporary upstream outage",
    }));

    expect(auditor.totals.pages).toBe(7);
    expect(auditor.totals.fetchedPages).toBe(0);
    expect(auditor.totals.atlasFallbackPages).toBe(7);
    expect(auditor.totals.blockedPages).toBe(0);
    expect(auditor.pages.every((page) => page.contentIntegrity === "atlas_fallback")).toBe(true);
    expect(auditor.pages.every((page) => page.status !== "blocked")).toBe(true);
    expect(auditor.driftSignals.some((signal) => signal.includes("Website Atlas fallback"))).toBe(true);
  });

  it("turns the Swiggy Builders launch blog into a reviewer story center", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-builders-launch-story").expect(200);
    const story = response.body.launchStory;

    expect(story.score).toBeGreaterThanOrEqual(94);
    expect(story.launchSignal.blogToolSignal).toContain("18+");
    expect(story.launchSignal.currentDocsToolSnapshot).toContain("35 tools");
    expect(story.launchSignal.reconciliation).toContain("current Swiggy docs");
    expect(story.totals).toMatchObject({
      storyBeats: 5,
      journeySteps: 5,
      showcaseAssets: 4,
      ecosystemLanes: 4,
      ctaPaths: 3,
    });
    expect(story.storyBeats.map((beat: { id: string }) => beat.id)).toEqual(
      expect.arrayContaining(["ai_commerce_infrastructure", "india_first_real_users", "builder_ecosystem", "video_to_access"]),
    );
    expect(story.builderJourney.map((step: { id: string }) => step.id)).toEqual(
      expect.arrayContaining(["build_locally", "record_demo", "apply_for_access", "staging_review", "ship_and_showcase"]),
    );
    expect(story.showcaseAssets.map((asset: { id: string }) => asset.id)).toEqual(
      expect.arrayContaining(["demo_script", "visual_gallery", "builder_packet", "ecosystem_narrative"]),
    );
    expect(story.ctaPaths.map((cta: { id: string }) => cta.id)).toEqual(
      expect.arrayContaining(["read_docs", "apply_now", "contact_builders"]),
    );
    expect(story.launchGuardrails.some((guard: { id: string }) => guard.id === "tool_count_reconciliation")).toBe(true);
    expect(story.externalGates.some((gate: string) => gate.includes("Showcase placement"))).toBe(true);
    expect(story.assertions.some((assertion: string) => assertion.includes("executable reviewer story"))).toBe(true);
  });

  it("consolidates Swiggy operating docs into a reviewer operating contract", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-operating-contract-center").expect(200);
    const contract = response.body.operatingContract;

    expect(contract.score).toBeGreaterThanOrEqual(80);
    expect(contract.contractSignal).toMatchObject({
      currentMode: "mock",
      operatingVersion: "v1.0",
      targetUptime: "99.9%",
      deprecationWindowDays: 180,
    });
    expect(contract.totals).toMatchObject({
      pillars: 6,
      runbooks: 4,
      readinessGates: 5,
    });
    expect(contract.pillars.map((pillar: { id: string }) => pillar.id)).toEqual(
      expect.arrayContaining([
        "uptime_and_latency",
        "rate_limit_and_backpressure",
        "traffic_rollout",
        "support_and_reporting",
        "version_and_deprecation",
        "credential_and_mode_boundary",
      ]),
    );
    expect(contract.runbooks.map((runbook: { id: string }) => runbook.id)).toEqual(
      expect.arrayContaining(["s0_outage", "rate_limit_spike", "support_payload", "version_migration"]),
    );
    expect(contract.readinessGates.map((gate: { id: string }) => gate.id)).toEqual(
      expect.arrayContaining(["local_contract_pack", "staging_credentials", "capacity_notice", "status_page_readiness", "production_approval"]),
    );
    expect(contract.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/docs/operate/sla/",
        "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
        "https://mcp.swiggy.com/builders/docs/operate/support/",
        "https://mcp.swiggy.com/builders/docs/operate/versioning/",
      ]),
    );
    expect(contract.launchEmail.to).toBe("builders@swiggy.in");
    expect(contract.assertions.some((assertion: string) => assertion.includes("official Swiggy operate"))).toBe(true);
    expect(contract.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("turns every Swiggy signup and application CTA into an intake action center", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-builder-intake").expect(200);
    const intake = response.body.intake;

    expect(intake.score).toBeGreaterThanOrEqual(75);
    expect(intake.recommendedTrack).toBe("developer");
    expect(intake.totalCtas).toBe(11);
    expect(intake.readyCtas).toBe(11);
    expect(intake.preparedCtas).toBe(11);
    expect(intake.operatorCtaGates).toBeGreaterThanOrEqual(4);
    expect(intake.swiggyCtaGates).toBeGreaterThanOrEqual(2);
    expect(intake.totalFields).toBeGreaterThanOrEqual(10);
    expect(intake.readyFields).toBeGreaterThanOrEqual(5);
    expect(intake.actions.map((action: { id: string }) => action.id)).toEqual(
      expect.arrayContaining([
        "start_building",
        "see_whats_possible",
        "apply_prod_access",
        "apply_developer",
        "apply_enterprise",
        "enterprise_apply",
        "contact_us",
        "send_demo",
        "llms",
        "read_docs",
        "apply_now",
      ]),
    );
    expect(
      intake.actions.some(
        (action: { id: string; actionType: string; status: string; preparedLocally: boolean; completionGate: string; evidenceLinks: string[] }) =>
          action.id === "apply_developer" &&
          action.actionType === "form" &&
          action.status === "ready" &&
          action.preparedLocally &&
          action.completionGate === "operator_submit" &&
          action.evidenceLinks.includes("/api/swiggy-access-dossier"),
      ),
    ).toBe(true);
    expect(
      intake.submissionFields.map((field: { id: string }) => field.id),
    ).toEqual(expect.arrayContaining(["redirect_uris", "static_ip_ranges", "security_contact", "terms_acknowledgement"]));
    expect(intake.demoStoryboard).toHaveLength(5);
    expect(intake.demoStoryboard.some((step: { proofLink: string }) => step.proofLink === "/api/mcp/scenario-runner")).toBe(true);
    expect(intake.outboundDrafts.some((draft: { triggerCta: string; body: string }) => draft.triggerCta === "send_demo" && draft.body.includes("/api/swiggy-builder-intake"))).toBe(true);
    expect(
      intake.checklist.some(
        (item: { id: string; status: string; owner: string }) =>
          item.id === "live_credentials" && item.status === "external_gate" && item.owner === "Swiggy",
      ),
    ).toBe(true);
    expect(intake.assertions.some((assertion: string) => assertion.includes("Every Website Atlas CTA"))).toBe(true);
    expect(intake.assertions.some((assertion: string) => assertion.includes("locally prepared"))).toBe(true);
  });

  it("returns a track-aware Swiggy production access submission console", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/submission-console").expect(200);
    const submissionConsole = response.body.submissionConsole;

    expect(submissionConsole.score).toBeGreaterThanOrEqual(75);
    expect(submissionConsole.recommendedTrack).toBe("developer");
    expect(submissionConsole.formTargets.map((target: { id: string }) => target.id)).toEqual(
      expect.arrayContaining(["developer", "enterprise"]),
    );
    expect(
      submissionConsole.formTargets.some(
        (target: { id: string; status: string }) => target.id === "enterprise" && target.status === "external_gate",
      ),
    ).toBe(true);
    expect(submissionConsole.totalRequirements).toBe(12);
    expect(submissionConsole.readyRequirements).toBeGreaterThanOrEqual(6);
    expect(submissionConsole.operatorRequirements).toBeGreaterThanOrEqual(4);
    expect(submissionConsole.requirements.map((requirement: { id: string }) => requirement.id)).toEqual(
      expect.arrayContaining(["who_you_are", "redirect_uris", "static_ip_ranges", "security_contact", "terms_acknowledgement", "expected_traffic"]),
    );
    expect(
      submissionConsole.requirements.some(
        (requirement: { id: string; completionGate: string; nextAction: string }) =>
          requirement.id === "terms_acknowledgement" &&
          requirement.completionGate === "operator_input" &&
          requirement.nextAction.includes("tick"),
      ),
    ).toBe(true);
    expect(submissionConsole.totalFields).toBeGreaterThanOrEqual(10);
    expect(submissionConsole.readyFields).toBeGreaterThanOrEqual(5);
    expect(submissionConsole.fields.map((field: { id: string }) => field.id)).toEqual(
      expect.arrayContaining(["redirect_uris", "static_ip_ranges", "security_contact", "terms_acknowledgement"]),
    );
    expect(submissionConsole.totalAttachments).toBeGreaterThanOrEqual(10);
    expect(submissionConsole.attachments.map((attachment: { id: string }) => attachment.id)).toEqual(
      expect.arrayContaining([
        "builder_packet",
        "launch_bundle",
        "access_dossier",
        "demo_video",
        "sandbox_credential_workbench",
        "audit_ledger",
      ]),
    );
    expect(
      submissionConsole.attachments.some(
        (attachment: { id: string; status: string }) => attachment.id === "staging_transcript" && attachment.status === "ready",
      ),
    ).toBe(true);
    expect(submissionConsole.attachments.some((attachment: { path: string }) => attachment.path === `/api/sessions/${created.body.plan.id}/staging-transcript`)).toBe(true);
    expect(submissionConsole.packetOrder.length).toBeGreaterThanOrEqual(10);
    expect(submissionConsole.packetOrder.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["field_values", "submit_developer_form", "send_handoff_email", "await_staging_credentials"]),
    );
    expect(
      submissionConsole.packetOrder.some(
        (item: { id: string; path: string; status: string }) =>
          item.id === "submit_developer_form" &&
          item.path === "https://mcp.swiggy.com/builders/access/" &&
          item.status === "operator_input",
      ),
    ).toBe(true);
    expect(
      submissionConsole.runbook.some(
        (step: { id: string; owner: string; status: string }) =>
          step.id === "await_staging_credentials" && step.owner === "Swiggy" && step.status === "external_gate",
      ),
    ).toBe(true);
    expect(submissionConsole.outboundDrafts.some((draft: { to: string }) => draft.to === "builders@swiggy.in")).toBe(true);
    expect(submissionConsole.externalGates.some((gate: string) => gate.includes("Google Form"))).toBe(true);
    expect(submissionConsole.assertions.some((assertion: string) => assertion.includes("pre-submit dossier"))).toBe(true);
  });

  it("returns a final Swiggy access submission studio with official CTA handoff actions", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/access-submission-studio").expect(200);
    const studio = response.body.accessSubmissionStudio;

    expect(studio.score).toBeGreaterThanOrEqual(75);
    expect(studio.recommendedTrack).toBe("developer");
    expect(studio.canSubmitNow).toBe(false);
    expect(studio.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/access/",
      ]),
    );
    expect(studio.officialTargets.map((target: { id: string }) => target.id)).toEqual(
      expect.arrayContaining(["start_building", "request_access", "send_demo"]),
    );
    expect(
      studio.officialTargets.some(
        (target: { id: string; cta: string; url: string; status: string }) =>
          target.id === "request_access" &&
          target.cta === "Request access" &&
          target.url === "https://mcp.swiggy.com/builders/access/" &&
          target.status === "operator_input",
      ),
    ).toBe(true);
    expect(studio.copyBlocks.map((block: { id: string }) => block.id)).toEqual(
      expect.arrayContaining(["track", "redirect_uris", "security_contact", "handoff_email_subject"]),
    );
    expect(studio.attachmentChecklist.map((attachment: { id: string }) => attachment.id)).toEqual(
      expect.arrayContaining(["builder_packet", "sandbox_credential_workbench", "staging_transcript", "demo_video"]),
    );
    expect(studio.browserRunbook.map((step: { id: string }) => step.id)).toEqual(
      expect.arrayContaining(["run_verifiers", "record_demo", "submit_access_form", "send_handoff", "await_credentials"]),
    );
    expect(studio.mailto.to).toBe("builders@swiggy.in");
    expect(studio.mailto.href).toContain("mailto:");
    expect(studio.totals.readyRequiredAttachments).toBeGreaterThanOrEqual(8);
    expect(studio.totals.operatorBlocks).toBeGreaterThanOrEqual(1);
    expect(studio.externalGates.some((gate: string) => gate.includes("official Swiggy access form"))).toBe(true);
    expect(studio.assertions.some((assertion: string) => assertion.includes("never auto-submits"))).toBe(true);
  });

  it("persists operator Swiggy access handoff state and updates submission readiness", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mealpilot-access-handoff-"));
    const dataFile = path.join(tempDir, "store.json");
    const first = createMealPilotServer({ store: createFileSessionStore(dataFile) });
    await request(first.app).post("/api/plan").send(planningRequest).expect(201);

    const saved = await request(first.app)
      .patch("/api/access-submission-studio/state")
      .send({
        demoVideoUrl: "https://loom.com/share/mealpilot-demo",
        technicalContactEmail: "eng@example.com",
        productionRedirectUri: "https://mealpilot.example.com/auth/swiggy/callback",
        staticEgressIp: "203.0.113.10/32",
        environmentSummary: "Render web service, HTTPS redirect, secret env vars, production build.",
        termsAcknowledged: true,
      })
      .expect(200);

    const studio = saved.body.accessSubmissionStudio;
    expect(studio.canSubmitNow).toBe(true);
    expect(studio.handoffState.demoVideoUrl).toBe("https://loom.com/share/mealpilot-demo");
    expect(
      studio.copyBlocks.some(
        (block: { id: string; status: string; value: string }) =>
          block.id === "security_contact" && block.status === "ready" && block.value === "eng@example.com",
      ),
    ).toBe(true);
    expect(
      studio.copyBlocks.some(
        (block: { id: string; status: string; value: string }) =>
          block.id === "redirect_uris" &&
          block.status === "ready" &&
          block.value === "https://mealpilot.example.com/auth/swiggy/callback",
      ),
    ).toBe(true);
    expect(
      studio.attachmentChecklist.some(
        (attachment: { id: string; status: string; path: string }) =>
          attachment.id === "demo_video" &&
          attachment.status === "ready" &&
          attachment.path === "https://loom.com/share/mealpilot-demo",
      ),
    ).toBe(true);
    expect(
      studio.browserRunbook.some(
        (step: { id: string; status: string }) => step.id === "copy_form_values" && step.status === "ready",
      ),
    ).toBe(true);
    expect(studio.officialTargets.some((target: { id: string; status: string }) => target.id === "request_access" && target.status === "operator_input")).toBe(true);

    const completed = await request(first.app)
      .patch("/api/access-submission-studio/state")
      .send({
        formSubmittedAt: "2026-07-06T05:00:00.000Z",
        handoffEmailSentAt: "2026-07-06T05:05:00.000Z",
      })
      .expect(200);
    expect(completed.body.accessSubmissionStudio.canSubmitNow).toBe(false);
    expect(completed.body.accessSubmissionStudio.officialTargets.every((target: { status: string }) => target.status !== "operator_input")).toBe(true);

    const second = createMealPilotServer({ store: createFileSessionStore(dataFile) });
    const reloaded = await request(second.app).get("/api/access-submission-studio").expect(200);
    expect(reloaded.body.accessSubmissionStudio.handoffState.technicalContactEmail).toBe("eng@example.com");
    expect(reloaded.body.accessSubmissionStudio.handoffState.formSubmittedAt).toBe("2026-07-06T05:00:00.000Z");
    expect(reloaded.body.accessSubmissionStudio.officialTargets.every((target: { status: string }) => target.status !== "operator_input")).toBe(true);
  });

  it("returns an executable Swiggy builder packet export with Markdown output", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/builder-packet-export").expect(200);
    const packet = response.body.packet;

    expect(packet.score).toBeGreaterThanOrEqual(85);
    expect(packet.recommendedTrack).toBe("developer");
    expect(packet.outputDirectory).toBe("artifacts/builder-packet");
    expect(packet.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/access/",
        "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
        "https://mcp.swiggy.com/builders/llms.txt",
      ]),
    );
    expect(packet.totals.formFields).toBeGreaterThanOrEqual(10);
    expect(packet.totals.requiredAttachments).toBeGreaterThanOrEqual(10);
    expect(packet.totals.launchArtifacts).toBeGreaterThanOrEqual(50);
    expect(packet.totals.visualTargets).toBe(64);
    expect(packet.files.map((file: { id: string }) => file.id)).toEqual(
      expect.arrayContaining(["packet_json", "packet_markdown", "visual_report", "production_summary"]),
    );
    expect(
      packet.commands.some(
        (command: { id: string; command: string }) =>
          command.id === "packet_export" && command.command.includes("npm run export:builder-packet"),
      ),
    ).toBe(true);
    expect(
      packet.commands.some(
        (command: { id: string; proves: string }) => command.id === "visual_capture" && command.proves.includes("64"),
      ),
    ).toBe(true);
    expect(packet.copyBlocks.formFields).toContain("Redirect URI(s)");
    expect(packet.copyBlocks.attachments).toContain("Production Launch Bundle");
    expect(packet.copyBlocks.handoffEmail.to).toBe("builders@swiggy.in");
    expect(packet.readiness.some((item: { id: string; status: string }) => item.id === "demo_video" && item.status === "operator_input")).toBe(true);
    expect(packet.readiness.some((item: { id: string; status: string }) => item.id === "staging_credentials" && item.status === "external_gate")).toBe(true);
    expect(packet.externalGates.some((gate: string) => gate.includes("Google Form"))).toBe(true);
    expect(packet.assertions.some((assertion: string) => assertion.includes("outside git"))).toBe(true);

    const markdown = await request(app).get("/api/builder-packet-export.md").expect(200);
    expect(markdown.text).toContain("# MealPilot Swiggy Builders Access Packet");
    expect(markdown.text).toContain("## Verification Commands");
    expect(markdown.text).toContain("npm run export:builder-packet");
  });

  it("returns Swiggy FAQ and policy coverage mapped to MealPilot evidence", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-faq-policy").expect(200);
    const center = response.body.faqPolicy;

    expect(center.score).toBeGreaterThanOrEqual(90);
    expect(center.totalQuestions).toBeGreaterThanOrEqual(16);
    expect(center.readyQuestions).toBeGreaterThanOrEqual(15);
    expect(center.totalRules).toBeGreaterThanOrEqual(9);
    expect(center.readyRules).toBeGreaterThanOrEqual(8);
    expect(center.headerFooterCoverage.headerLinks).toEqual(
      expect.arrayContaining(["Developers", "Enterprises", "Docs", "Blog", "FAQ", "Start Building"]),
    );
    expect(center.headerFooterCoverage.footerResources).toEqual(
      expect.arrayContaining([
        "Guidelines",
        "FAQ",
        "Apply",
        "llms.txt",
        "Privacy Policy",
        "Terms and Conditions",
        "builders@swiggy.in",
      ]),
    );
    expect(center.faqItems.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["developer_auth", "developer_sandbox", "enterprise_white_label", "home_break_something"]),
    );
    expect(center.policyRules.map((rule: { category: string }) => rule.category)).toEqual(
      expect.arrayContaining(["allowed", "restricted", "prohibited", "operating_principle", "legal"]),
    );
    expect(
      center.policyRules.some(
        (rule: { id: string; evidenceLinks: string[] }) =>
          rule.id === "restricted_rate_limits" && rule.evidenceLinks.includes("/api/traffic-readiness-plan"),
      ),
    ).toBe(true);
    expect(center.supportContact.email).toBe("builders@swiggy.in");
    expect(center.externalGates.some((gate: string) => gate.includes("Enterprise contracts"))).toBe(true);
  });

  it("returns a Swiggy FAQ Resolution Center for reviewer-ready answers", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-faq-resolution-center").expect(200);
    const center = response.body.faqResolution;

    expect(center.score).toBeGreaterThanOrEqual(85);
    expect(center.totals.questions).toBeGreaterThanOrEqual(16);
    expect(center.totals.ready).toBeGreaterThanOrEqual(15);
    expect(center.totals.policyRules).toBeGreaterThanOrEqual(9);
    expect(center.totals.activationCtas).toBe(5);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(20);
    expect(center.questions.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["home_what_is_builders", "developer_auth", "developer_sandbox", "enterprise_white_label"]),
    );
    expect(center.activationCtas.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["answer_packet", "official_faq", "access_form", "proof_routes", "manual_gates"]),
    );
    expect(center.reviewerScript.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(center.supportContact.email).toBe("builders@swiggy.in");
    expect(center.assertions.some((assertion: string) => assertion.includes("Every public FAQ answer"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("staging or production credentials"))).toBe(true);
  });

  it("answers one Swiggy FAQ reviewer question with proof and manual gates", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app)
      .post("/api/swiggy-faq-resolution-center/answer")
      .send({ question: "What proof does Swiggy need before production access?" })
      .expect(200);
    const answer = response.body.faqAnswer;

    expect(answer.decision).toBe("answered");
    expect(answer.matchedQuestionId).toBeTruthy();
    expect(answer.matchScore).toBeGreaterThanOrEqual(25);
    expect(answer.proofLinks).toContain("/api/swiggy-faq-resolution-center");
    expect(answer.proofLinks.length).toBeGreaterThanOrEqual(3);
    expect(answer.activationCtas.map((item: { id: string }) => item.id)).toContain("answer_packet");
    expect(answer.supportContact.email).toBe("builders@swiggy.in");
    expect(answer.assertions.some((assertion: string) => assertion.includes("No external form"))).toBe(true);
    expect(answer.externalGates.some((gate: string) => gate.includes("credentials"))).toBe(true);
  });

  it("blocks blank Swiggy FAQ answer questions instead of guessing", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app)
      .post("/api/swiggy-faq-resolution-center/answer")
      .send({ question: "   " })
      .expect(200);
    const answer = response.body.faqAnswer;

    expect(answer.decision).toBe("blocked_empty");
    expect(answer.matchedQuestionId).toBeNull();
    expect(answer.matchScore).toBe(0);
    expect(answer.assertions.some((assertion: string) => assertion.includes("Blank reviewer questions are blocked"))).toBe(true);
  });

  it("returns Swiggy growth partnership experiments and partner asks", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-growth-partnership").expect(200);
    const center = response.body.growthPartnership;

    expect(center.score).toBeGreaterThanOrEqual(90);
    expect(center.totalSignals).toBeGreaterThanOrEqual(14);
    expect(center.readySignals).toBeGreaterThanOrEqual(12);
    expect(center.totalExperiments).toBeGreaterThanOrEqual(8);
    expect(center.readyExperiments).toBe(center.totalExperiments);
    expect(center.signals.map((signal: { id: string }) => signal.id)).toEqual(
      expect.arrayContaining(["growth_partnership", "get_noticed", "enterprise_growth_analytics", "developer_hiring_signal"]),
    );
    expect(center.experiments.map((experiment: { id: string }) => experiment.id)).toEqual(
      expect.arrayContaining([
        "luxury_weekend_concierge",
        "voice_fridge_to_dinner",
        "office_lunch_boardroom",
        "embedded_enterprise_concierge",
        "city_trendboard",
      ]),
    );
    expect(
      center.experiments.some(
        (experiment: { id: string; mcpServers: string[]; requiredTools: string[] }) =>
          experiment.id === "luxury_weekend_concierge" &&
          ["food", "instamart", "dineout"].every((server) => experiment.mcpServers.includes(server)) &&
          experiment.requiredTools.includes("dineout.book_table"),
      ),
    ).toBe(true);
    expect(center.assets.map((asset: { id: string }) => asset.id)).toEqual(
      expect.arrayContaining(["demo_storyboard", "co_branding_screenshots", "growth_metrics_pack", "launch_handoff_email"]),
    );
    expect(center.partnershipAsks.map((ask: { id: string; status: string }) => `${ask.id}:${ask.status}`)).toEqual(
      expect.arrayContaining(["co_marketing_review:external_gate", "priority_slack_channel:external_gate", "analytics_dashboard_access:external_gate"]),
    );
    expect(center.metrics.map((metric: { id: string }) => metric.id)).toEqual(
      expect.arrayContaining(["activation", "cross_server", "conversion_safety", "support"]),
    );
    expect(center.externalGates.some((gate: string) => gate.includes("co-marketing"))).toBe(true);
  });

  it("returns Swiggy Builder Talent Signal Center for portfolio and hiring-readiness proof", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-talent-signal-center").expect(200);
    const center = response.body.talentSignal;

    expect(center.score).toBeGreaterThanOrEqual(85);
    expect(center.totals.signals).toBeGreaterThanOrEqual(6);
    expect(center.totals.readySignals).toBeGreaterThanOrEqual(4);
    expect(center.totals.portfolioAssets).toBe(6);
    expect(center.totals.readyAssets).toBeGreaterThanOrEqual(3);
    expect(center.totals.talentPaths).toBe(4);
    expect(center.totals.swiggyGates).toBeGreaterThanOrEqual(2);
    expect(center.signals.map((signal: { id: string }) => signal.id)).toEqual(
      expect.arrayContaining(["standout_project", "hiring_visibility", "swiggy_recruiting_gate", "technical_depth"]),
    );
    expect(center.portfolioAssets.map((asset: { id: string }) => asset.id)).toEqual(
      expect.arrayContaining(["demo_video", "github_repo", "architecture_packet", "metrics_packet", "talent_outreach"]),
    );
    expect(center.talentPaths.map((path: { id: string }) => path.id)).toEqual(
      expect.arrayContaining(["builder_visibility", "engineering_depth", "operator_maturity", "enterprise_readiness"]),
    );
    expect(center.reviewerNarrative.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4]);
    expect(center.outreachDraft.to).toBe("builders@swiggy.in");
    expect(center.assertions.some((assertion: string) => assertion.includes("not a promise"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("hiring conversation"))).toBe(true);
  });

  it("returns Swiggy Builders Conversion Center for final CTA handoff", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-conversion-center").expect(200);
    const center = response.body.conversion;

    expect(center.score).toBeGreaterThanOrEqual(85);
    expect(center.totals.steps).toBe(8);
    expect(center.totals.ready).toBeGreaterThanOrEqual(4);
    expect(center.totals.operatorInputs).toBeGreaterThanOrEqual(3);
    expect(center.totals.swiggyGates).toBeGreaterThanOrEqual(1);
    expect(center.totals.proofBundles).toBe(5);
    expect(center.totals.officialDestinations).toBeGreaterThanOrEqual(6);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(20);
    expect(center.conversionSteps.map((step: { id: string }) => step.id)).toEqual(
      expect.arrayContaining(["start_building", "request_access", "send_demo", "builders_email", "llms_txt", "llms_full", "go_live_review"]),
    );
    expect(center.proofBundles.map((bundle: { id: string }) => bundle.id)).toEqual(
      expect.arrayContaining(["local_build", "submission_packet", "email_packet", "docs_packet", "production_packet"]),
    );
    expect(center.operatorRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(center.handoffDraft.to).toBe("builders@swiggy.in");
    expect(center.assertions.some((assertion: string) => assertion.includes("closing Builders CTA module"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("official access form"))).toBe(true);
  });

  it("returns a Swiggy Benefits Activation Center for Builders benefits and CTAs", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-benefits-activation-center").expect(200);
    const center = response.body.benefitsActivation;

    expect(center.score).toBeGreaterThanOrEqual(80);
    expect(center.totals.benefits).toBe(8);
    expect(center.totals.activationCtas).toBe(6);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(18);
    expect(center.lanes.map((laneItem: { id: string }) => laneItem.id)).toEqual(
      expect.arrayContaining([
        "live_api_access",
        "quota_expansion",
        "technical_support",
        "co_branding",
        "growth_partnership",
        "showcase_visibility",
        "hiring_visibility",
        "enterprise_support",
      ]),
    );
    expect(center.activationCtas.map((ctaItem: { id: string }) => ctaItem.id)).toEqual(
      expect.arrayContaining(["request_access", "send_demo", "ask_quota", "ask_support", "ask_growth", "ask_cobranding"]),
    );
    expect(
      center.lanes.some(
        (laneItem: { id: string; proofLinks: string[]; status: string }) =>
          laneItem.id === "quota_expansion" &&
          laneItem.proofLinks.includes("/api/swiggy-quota-negotiation-center") &&
          laneItem.status === "swiggy_gate",
      ),
    ).toBe(true);
    expect(center.launchReadiness.growthExperimentsReady).toMatch(/\d+\/\d+/);
    expect(center.partnerEmail.to).toBe("builders@swiggy.in");
    expect(center.assertions.some((assertion: string) => assertion.includes("Every Builders benefit maps"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("rate-limit increase"))).toBe(true);
  });

  it("returns a Swiggy Partner Success Desk for post-access support and growth operations", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-partner-success-desk").expect(200);
    const desk = response.body.partnerSuccess;

    expect(desk.score).toBeGreaterThanOrEqual(85);
    expect(desk.totals.lanes).toBeGreaterThanOrEqual(7);
    expect(desk.totals.ready).toBeGreaterThanOrEqual(4);
    expect(desk.totals.manualInputs).toBeGreaterThanOrEqual(1);
    expect(desk.totals.externalGates).toBeGreaterThanOrEqual(1);
    expect(desk.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "demo_handoff",
        "developer_support",
        "slo_incident",
        "traffic_capacity",
        "growth_showcase",
        "enterprise_slack_partner",
      ]),
    );
    expect(
      desk.lanes.some(
        (lane: { id: string; evidenceLinks: string[]; status: string }) =>
          lane.id === "traffic_capacity" &&
          lane.evidenceLinks.includes("/api/traffic-readiness-plan") &&
          lane.status === "ready",
      ),
    ).toBe(true);
    expect(desk.escalationEmails.map((email: { id: string; to: string }) => `${email.id}:${email.to}`)).toEqual(
      expect.arrayContaining(["support:builders@swiggy.in", "capacity:builders@swiggy.in", "access:builders@swiggy.in"]),
    );
    expect(desk.reviewerRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4]);
    expect(desk.assertions.some((assertion: string) => assertion.includes("existing verified support"))).toBe(true);
    expect(desk.externalGates.some((gate: string) => gate.includes("Slack"))).toBe(true);
  });

  it("returns a Swiggy Partner Support Room for report_error, incident, and capacity operations", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-partner-support-room").expect(200);
    const room = response.body.partnerSupport;

    expect(room.score).toBeGreaterThanOrEqual(88);
    expect(room.supportPosture).toContain("support-ready");
    expect(room.totals.channels).toBe(5);
    expect(room.totals.readyChannels).toBe(2);
    expect(room.totals.incidentLanes).toBe(4);
    expect(room.totals.readyIncidentLanes).toBe(4);
    expect(room.totals.evidenceAttachments).toBe(8);
    expect(room.totals.readyEvidenceAttachments).toBeGreaterThanOrEqual(7);
    expect(room.totals.escalationSteps).toBe(5);
    expect(room.totals.operatorInputs).toBe(4);
    expect(room.totals.swiggyGates).toBe(2);
    expect(room.channels.map((channel: { id: string; status: string }) => `${channel.id}:${channel.status}`)).toEqual(
      expect.arrayContaining(["report_error:ready", "builders_email:manual_input", "enterprise_slack:external_gate"]),
    );
    expect(room.incidentLanes.map((lane: { severity: string }) => lane.severity)).toEqual(["S0", "S1", "S2", "S3"]);
    expect(room.evidenceAttachments.map((attachment: { id: string }) => attachment.id)).toEqual(
      expect.arrayContaining(["support_bridge", "slo_command", "runtime_telemetry", "audit_ledger", "traffic_profile", "demo_evidence"]),
    );
    expect(room.escalationRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(room.emailDrafts.map((draft: { id: string; to: string }) => `${draft.id}:${draft.to}`)).toEqual(
      expect.arrayContaining(["support_incident:builders@swiggy.in", "quota_capacity:builders@swiggy.in", "access_handoff:builders@swiggy.in"]),
    );
    expect(room.assertions.some((assertion: string) => assertion.includes("No support email"))).toBe(true);
    expect(room.externalGates.some((gate: string) => gate.includes("Enterprise Slack"))).toBe(true);
  });

  it("returns a Swiggy Showcase Submission Center for demo and feature review", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-showcase-submission-center").expect(200);
    const center = response.body.showcaseSubmission;

    expect(center.score).toBeGreaterThanOrEqual(80);
    expect(center.totals.assets).toBe(6);
    expect(center.totals.readyAssets).toBeGreaterThanOrEqual(3);
    expect(center.totals.operatorInputs).toBe(2);
    expect(center.totals.swiggyGates).toBe(1);
    expect(center.totals.pitchBlocks).toBe(4);
    expect(center.pitchBlocks.map((block: { id: string }) => block.id)).toEqual(
      expect.arrayContaining(["one_liner", "why_swiggy", "differentiator", "safety"]),
    );
    expect(center.assets.map((asset: { id: string; status: string }) => `${asset.id}:${asset.status}`)).toEqual(
      expect.arrayContaining(["two_minute_demo:operator_input", "powered_by_swiggy:swiggy_gate"]),
    );
    expect(center.demoStoryboard.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(center.metricPack.map((metric: { id: string }) => metric.id)).toEqual(
      expect.arrayContaining(["tool_coverage", "visual_targets", "growth_experiments", "staging_smoke"]),
    );
    expect(center.outreachEmail.to).toBe("builders@swiggy.in");
    expect(center.assertions.some((assertion: string) => assertion.includes("no email"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("co-branding"))).toBe(true);
  });

  it("composes a Swiggy showcase submission packet from operator inputs", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app)
      .post("/api/swiggy-showcase-submission-center/compose")
      .send({
        demoUrl: "https://youtu.be/mealpilot-swiggy-demo",
        githubUrl: "https://github.com/Farhankhan0128/MealPilot",
        operatorEmail: "operator@example.com",
        note: "Ready for showcase review.",
      })
      .expect(200);
    const composition = response.body.showcaseComposition;

    expect(composition.decision).toBe("ready_to_send");
    expect(composition.readinessScore).toBe(100);
    expect(composition.to).toBe("builders@swiggy.in");
    expect(composition.missingInputs).toEqual([]);
    expect(composition.body).toContain("MealPilot");
    expect(composition.body).toContain("https://github.com/Farhankhan0128/MealPilot");
    expect(composition.checklist.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["demo_url", "github_url", "operator_email", "proof_packet", "swiggy_approval"]),
    );
    expect(composition.proofLinks).toContain("/api/swiggy-showcase-submission-center");
    expect(composition.assertions.some((assertion: string) => assertion.includes("not sent automatically"))).toBe(true);
    expect(composition.externalGates.some((gate: string) => gate.includes("co-branding"))).toBe(true);
  });

  it("keeps incomplete Swiggy showcase compositions as operator gates", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app)
      .post("/api/swiggy-showcase-submission-center/compose")
      .send({ demoUrl: "", githubUrl: "not-a-url", operatorEmail: "missing" })
      .expect(200);
    const composition = response.body.showcaseComposition;

    expect(composition.decision).toBe("blocked_empty");
    expect(composition.readinessScore).toBe(0);
    expect(composition.missingInputs).toEqual(["demoUrl", "githubUrl", "operatorEmail"]);
    expect(composition.checklist.some((item: { id: string; status: string }) => item.id === "demo_url" && item.status === "operator_input")).toBe(true);
    expect(composition.body).toContain("[operator to add unlisted demo URL]");
  });

  it("returns a Swiggy Demo Evidence Director for the 2-3 minute recording packet", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-demo-evidence-director").expect(200);
    const director = response.body.demoEvidence;

    expect(director.score).toBeGreaterThanOrEqual(85);
    expect(director.totals.scenes).toBe(6);
    expect(director.totals.readyScenes).toBe(5);
    expect(director.totals.proofAssets).toBe(8);
    expect(director.totals.readyProofAssets).toBe(6);
    expect(director.totals.recordingGates).toBe(6);
    expect(director.totals.operatorInputs).toBe(5);
    expect(director.totals.swiggyGates).toBe(2);
    expect(director.scenes.map((scene: { id: string }) => scene.id)).toEqual(
      expect.arrayContaining(["opening_context", "mcp_coverage", "commercial_guard", "reviewer_evidence", "handoff_close"]),
    );
    expect(director.proofAssets.map((asset: { id: string; status: string }) => `${asset.id}:${asset.status}`)).toEqual(
      expect.arrayContaining(["demo_video_url:operator_input", "swiggy_approval:swiggy_gate", "visual_report:ready"]),
    );
    expect(director.recordingGates.map((gate: { id: string; status: string }) => `${gate.id}:${gate.status}`)).toEqual(
      expect.arrayContaining(["redaction_review:operator_input", "swiggy_access_review:swiggy_gate"]),
    );
    expect(director.runbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(director.handoffEmail.to).toBe("builders@swiggy.in");
    expect(director.handoffEmail.evidenceLinks).toContain("/api/swiggy-demo-evidence-director");
    expect(director.assertions.some((assertion: string) => assertion.includes("does not record video"))).toBe(true);
    expect(director.externalGates.some((gate: string) => gate.includes("co-branding"))).toBe(true);
  });

  it("returns a Swiggy Submission Timeline Center for end-to-end access handoff", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-submission-timeline-center").expect(200);
    const center = response.body.submissionTimeline;

    expect(center.score).toBeGreaterThanOrEqual(60);
    expect(center.totals.phases).toBe(8);
    expect(center.totals.ready).toBeGreaterThanOrEqual(2);
    expect(center.totals.operatorInputs).toBeGreaterThanOrEqual(2);
    expect(center.totals.swiggyGates).toBeGreaterThanOrEqual(3);
    expect(center.totals.officialActions).toBe(8);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(20);
    expect(center.phases.map((phase: { id: string }) => phase.id)).toEqual(
      expect.arrayContaining([
        "start_building_review",
        "local_packet_freeze",
        "demo_video_capture",
        "request_access_form",
        "send_demo_handoff",
        "dynamic_client_registration",
        "staging_credentials_and_seed",
        "production_promotion",
      ]),
    );
    expect(center.dailyRunbook.map((day: { day: string }) => day.day)).toEqual(["Day 0", "Day 1", "Day 2"]);
    expect(center.handoffPacket.formTarget).toBe("https://mcp.swiggy.com/builders/access/");
    expect(center.handoffPacket.demoTarget).toBe("mailto:builders@swiggy.in");
    expect(center.handoffPacket.safetyNote).toContain("no automatic external submission");
    expect(center.assertions.some((assertion: string) => assertion.includes("Every phase"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("Dynamic Client Registration"))).toBe(true);
  });

  it("runs a Swiggy submission timeline checkpoint for the access handoff path", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app)
      .post("/api/swiggy-submission-timeline-center/checkpoint")
      .send({
        demoRecorded: true,
        accessFormSubmitted: true,
        handoffEmailSent: true,
        dcrApproved: false,
        stagingCredentialsIssued: false,
        stagingSoakComplete: false,
        productionApproved: false,
      })
      .expect(200);
    const checkpoint = response.body.submissionTimelineCheckpoint;

    expect(checkpoint.decision).toBe("await_swiggy_review");
    expect(checkpoint.currentPhaseId).toBe("dynamic_client_registration");
    expect(checkpoint.readinessScore).toBeGreaterThanOrEqual(60);
    expect(checkpoint.missingOperatorActions).toEqual([]);
    expect(checkpoint.swiggyGates.some((gate: string) => gate.includes("Dynamic Client Registration"))).toBe(true);
    expect(checkpoint.proofLinks).toContain("/api/credential-onboarding");
    expect(checkpoint.assertions.some((assertion: string) => assertion.includes("never submits"))).toBe(true);
  });

  it("keeps early Swiggy timeline checkpoints operator-owned until demo, form, and email are done", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app)
      .post("/api/swiggy-submission-timeline-center/checkpoint")
      .send({})
      .expect(200);
    const checkpoint = response.body.submissionTimelineCheckpoint;

    expect(checkpoint.decision).toBe("needs_operator_input");
    expect(checkpoint.currentPhaseId).toBe("demo_video_capture");
    expect(checkpoint.missingOperatorActions.length).toBeGreaterThanOrEqual(3);
    expect(checkpoint.checklist.some((item: { phaseId: string; status: string }) => item.phaseId === "request_access_form" && item.status === "operator_input")).toBe(true);
  });

  it("returns Swiggy Interaction QA Center coverage for clickable portal CTAs", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-interaction-qa-center").expect(200);
    const center = response.body.interactionQa;

    expect(center.score).toBeGreaterThanOrEqual(90);
    expect(center.totals.lanes).toBeGreaterThanOrEqual(10);
    expect(center.totals.working).toBeGreaterThanOrEqual(8);
    expect(center.totals.manualGates).toBeGreaterThanOrEqual(1);
    expect(center.totals.externalGates).toBeGreaterThanOrEqual(1);
    expect(center.totals.postActions).toBeGreaterThanOrEqual(5);
    expect(center.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "plan_submit",
        "single_confirmation",
        "bulk_confirmation",
        "support_report",
        "builder_packet_export",
        "developer_first_call",
        "access_submission",
        "enterprise_slack",
      ]),
    );
    expect(
      center.lanes.some(
        (lane: { id: string; status: string; endpoint: string; expectedFeedback: string }) =>
          lane.id === "support_report" &&
          lane.status === "working" &&
          lane.endpoint === "/api/support/report" &&
          lane.expectedFeedback.includes("builders@swiggy.in"),
      ),
    ).toBe(true);
    expect(center.clickAssertions.some((assertion: string) => assertion.includes("Every locally executable CTA"))).toBe(
      true,
    );
    expect(center.externalGates.some((gate: string) => gate.includes("Slack"))).toBe(true);
  });

  it("returns channel and multimodal studio coverage for developer build lanes", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/channel-multimodal-studio").expect(200);
    const studio = response.body.channelMultimodalStudio;

    expect(studio.score).toBeGreaterThanOrEqual(89);
    expect(studio.totalLanes).toBe(6);
    expect(studio.readyLanes).toBeGreaterThanOrEqual(4);
    expect(studio.totalChannels).toBe(5);
    expect(studio.totalPipelines).toBe(4);
    expect(studio.totalExecutionPackets).toBe(6);
    expect(studio.readyExecutionPackets).toBe(6);
    expect(studio.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "voice_agent",
        "auto_restock",
        "group_ordering_slack_teams",
        "dietary_planner",
        "reservation_agent",
        "screenshot_to_order",
      ]),
    );
    expect(
      studio.lanes.some(
        (lane: { id: string; channels: string[]; toolchain: string[]; safetyControls: string[] }) =>
          lane.id === "screenshot_to_order" &&
          lane.channels.includes("mobile_camera") &&
          lane.toolchain.includes("food.search_menu") &&
          lane.safetyControls.some((control) => control.includes("raw image")),
      ),
    ).toBe(true);
    expect(
      studio.channels.some(
        (channel: { channel: string; status: string; swiggyTools: string[] }) =>
          channel.channel === "slack_teams" &&
          channel.status === "manual_input" &&
          channel.swiggyTools.includes("food.place_food_order"),
      ),
    ).toBe(true);
    expect(
      studio.pipelines.some(
        (pipeline: { id: string; steps: Array<{ tool?: string }>; dataBoundaries: string[] }) =>
          pipeline.id === "screenshot_to_order_pipeline" &&
          pipeline.steps.some((step) => step.tool === "search_menu") &&
          pipeline.dataBoundaries.some((boundary) => boundary.includes("raw image")),
      ),
    ).toBe(true);
    expect(
      studio.executionPackets.some(
        (packet: { id: string; laneId: string; surface: string; routePlan: string[]; responseRules: string[]; confirmationGate: string; telemetryContract: string }) =>
          packet.id === "voice_agent_packet" &&
          packet.laneId === "voice_agent" &&
          packet.surface === "voice" &&
          packet.routePlan.some((step) => step.includes("3")) &&
          packet.responseRules.some((rule) => rule.includes("Never speak")) &&
          packet.confirmationGate.includes("ETA") &&
          packet.telemetryContract.includes("surface=voice"),
      ),
    ).toBe(true);
    expect(
      studio.executionPackets.some(
        (packet: { id: string; surface: string; routePlan: string[]; telemetryContract: string }) =>
          packet.id === "screenshot_to_order_packet" &&
          packet.surface === "mobile_camera" &&
          packet.routePlan.some((step) => step.includes("approved vision/OCR")) &&
          packet.telemetryContract.includes("image_retained=false"),
      ),
    ).toBe(true);
    expect(studio.assertions.some((assertion: string) => assertion.includes("local execution packet"))).toBe(true);
    expect(studio.externalGates.some((gate: string) => gate.includes("Slack/Teams"))).toBe(true);
    expect(studio.externalGates.some((gate: string) => gate.includes("vision/OCR"))).toBe(true);
  });

  it("returns a visual dish capture center and analyzes dish captions safely", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-visual-dish-capture").expect(200);
    const center = response.body.visualDishCapture;

    expect(center.score).toBeGreaterThanOrEqual(78);
    expect(center.totals.routes).toBe(4);
    expect(center.totals.readyRoutes).toBe(4);
    expect(center.totals.guardrails).toBe(5);
    expect(center.totals.readyGuardrails).toBe(3);
    expect(center.totals.sampleCaptures).toBe(3);
    expect(center.routes.map((route: { id: string }) => route.id)).toEqual(
      expect.arrayContaining([
        "food_menu_match",
        "instamart_ingredient_rescue",
        "dineout_place_discovery",
        "combined_craving_to_evening",
      ]),
    );
    expect(
      center.guardrails.some(
        (guard: { id: string; policy: string }) =>
          guard.id === "no_raw_image_retention" && guard.policy.includes("raw image bytes"),
      ),
    ).toBe(true);

    const analysisResponse = await request(app)
      .post("/api/swiggy-visual-dish-capture/analyze")
      .send({
        intent: "dish_photo",
        caption: "smoky paneer tikka with chutney",
        city: "Bengaluru",
        imageName: "paneer-tikka.jpg",
      })
      .expect(200);
    const analysis = analysisResponse.body.analysis;

    expect(analysis.input.rawImageRetained).toBe(false);
    expect(analysis.detected.label).toBe("paneer tikka");
    expect(analysis.detected.requiresUserConfirmation).toBe(true);
    expect(analysis.selectedRouteId).toBe("food_menu_match");
    expect(analysis.swiggyRoutes.some((route: { swiggyTools: string[] }) => route.swiggyTools.includes("search_menu"))).toBe(true);
    expect(
      analysis.telemetry.some(
        (item: { field: string; value: string }) => item.field === "raw_image_retained" && item.value === "false",
      ),
    ).toBe(true);
    expect(analysis.assertions.some((assertion: string) => assertion.includes("No raw image bytes"))).toBe(true);
  });

  it("returns a voice commerce center and rehearses spoken Swiggy routes safely", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-voice-commerce-center").expect(200);
    const center = response.body.voiceCommerce;

    expect(center.score).toBeGreaterThanOrEqual(80);
    expect(center.totals.scenarios).toBe(4);
    expect(center.totals.readyScenarios).toBe(4);
    expect(center.totals.guardrails).toBe(6);
    expect(center.totals.readyGuardrails).toBe(4);
    expect(center.totals.samples).toBe(4);
    expect(center.scenarios.map((scenario: { id: string }) => scenario.id)).toEqual(
      expect.arrayContaining([
        "voice_food_quick_order",
        "voice_instamart_restock",
        "voice_dineout_booking",
        "voice_combined_evening",
      ]),
    );
    expect(
      center.guardrails.some(
        (guard: { id: string; policy: string }) =>
          guard.id === "no_raw_audio_retention" && guard.policy.includes("never raw audio"),
      ),
    ).toBe(true);

    const rehearsalResponse = await request(app)
      .post("/api/swiggy-voice-commerce-center/rehearse")
      .send({
        utterance: "Order paneer tikka near home under 600 rupees",
        city: "Bengaluru",
      })
      .expect(200);
    const rehearsal = rehearsalResponse.body.rehearsal;

    expect(rehearsal.input.rawAudioRetained).toBe(false);
    expect(rehearsal.detected.intent).toBe("quick_order");
    expect(rehearsal.detected.requiresUserConfirmation).toBe(true);
    expect(rehearsal.selectedScenarioId).toBe("voice_food_quick_order");
    expect(rehearsal.spokenScript.length).toBeLessThanOrEqual(3);
    expect(rehearsal.swiggyRoute.swiggyTools).toContain("place_food_order");
    expect(
      rehearsal.telemetry.some(
        (item: { field: string; value: string }) => item.field === "raw_audio_retained" && item.value === "false",
      ),
    ).toBe(true);
    expect(rehearsal.assertions.some((assertion: string) => assertion.includes("No raw audio bytes"))).toBe(true);
  });

  it("returns a quality loop center and analyzes consented feedback safely", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-quality-loop-center").expect(200);
    const center = response.body.qualityLoop;

    expect(center.score).toBeGreaterThanOrEqual(84);
    expect(center.totals.lanes).toBe(4);
    expect(center.totals.readyLanes).toBe(4);
    expect(center.totals.guardrails).toBe(6);
    expect(center.totals.readyGuardrails).toBe(4);
    expect(center.totals.samples).toBe(4);
    expect(center.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "food_taste_repeat_loop",
        "instamart_freshness_loop",
        "dineout_experience_loop",
        "combined_household_learning_loop",
      ]),
    );
    expect(
      center.guardrails.some(
        (guard: { id: string; policy: string }) =>
          guard.id === "consent_before_learning" && guard.policy.includes("requires user consent"),
      ),
    ).toBe(true);

    const feedbackResponse = await request(app)
      .post("/api/swiggy-quality-loop-center/feedback")
      .send({
        server: "food",
        rating: 5,
        comment: "Loved the paneer tikka, repeat this restaurant",
        city: "Bengaluru",
        consentToLearn: true,
      })
      .expect(200);
    const feedback = feedbackResponse.body.analysis;

    expect(feedback.sentiment).toBe("delighted");
    expect(feedback.selectedLaneId).toBe("food_taste_repeat_loop");
    expect(feedback.learningTags).toContain("repeat_candidate");
    expect(feedback.supportPacketNeeded).toBe(false);
    expect(
      feedback.telemetry.some(
        (item: { field: string; value: string }) => item.field === "raw_payload_retained" && item.value === "false",
      ),
    ).toBe(true);

    const issueResponse = await request(app)
      .post("/api/swiggy-quality-loop-center/feedback")
      .send({
        server: "instamart",
        rating: 2,
        comment: "Curd was stale and close to expiry",
        city: "Bengaluru",
        consentToLearn: false,
      })
      .expect(200);
    const issue = issueResponse.body.analysis;

    expect(issue.supportPacketNeeded).toBe(true);
    expect(issue.learningTags).toHaveLength(0);
    expect(issue.selectedLaneId).toBe("instamart_freshness_loop");
  });

  it("returns a ritual autopilot center and plans consented routines safely", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-ritual-autopilot-center").expect(200);
    const center = response.body.ritualAutopilot;

    expect(center.score).toBeGreaterThanOrEqual(86);
    expect(center.totals.lanes).toBe(4);
    expect(center.totals.readyLanes).toBe(4);
    expect(center.totals.guardrails).toBe(6);
    expect(center.totals.readyGuardrails).toBe(4);
    expect(center.totals.samples).toBe(4);
    expect(center.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining(["weekday_lunch_repeat", "pantry_reset", "date_night_slotwatch", "family_weekend_route"]),
    );
    expect(
      center.guardrails.some(
        (guard: { id: string; policy: string }) =>
          guard.id === "no_auto_commercial_action" && guard.policy.includes("never places Food orders"),
      ),
    ).toBe(true);

    const planResponse = await request(app)
      .post("/api/swiggy-ritual-autopilot-center/plan")
      .send({
        cadence: "weekly",
        householdMode: "family",
        city: "Bengaluru",
        budget: 2500,
        consentToUseHistory: true,
      })
      .expect(200);
    const ritualPlan = planResponse.body.ritualPlan;

    expect(ritualPlan.selectedLaneId).toBe("pantry_reset");
    expect(ritualPlan.confidence).toBeGreaterThanOrEqual(0.8);
    expect(ritualPlan.routineSlots.some((slot: { requiresConfirmation: boolean }) => slot.requiresConfirmation)).toBe(true);
    expect(
      ritualPlan.telemetry.some(
        (item: { field: string; value: string }) => item.field === "auto_commercial_action" && item.value === "false",
      ),
    ).toBe(true);
    expect(ritualPlan.assertions.some((assertion: string) => assertion.includes("not a subscription"))).toBe(true);
  });

  it("returns a payment truth center and reconciles settlement claims safely", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-payment-truth-center").expect(200);
    const center = response.body.paymentTruth;

    expect(center.score).toBeGreaterThanOrEqual(86);
    expect(center.totals.lanes).toBe(5);
    expect(center.totals.readyLanes).toBe(4);
    expect(center.totals.guardrails).toBe(6);
    expect(center.totals.readyGuardrails).toBe(4);
    expect(center.totals.samples).toBe(4);
    expect(center.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "food_cart_payment_truth",
        "instamart_bill_checkout_truth",
        "dineout_free_booking_truth",
        "dineout_bill_payment_cart_truth",
        "combined_settlement_readback",
      ]),
    );
    expect(
      center.guardrails.some(
        (guard: { id: string; policy: string }) =>
          guard.id === "cart_response_is_truth" && guard.policy.includes("Swiggy cart or status responses"),
      ),
    ).toBe(true);

    const reconcileResponse = await request(app)
      .post("/api/swiggy-payment-truth-center/reconcile")
      .send({
        server: "food",
        cartTotal: 720,
        expectedDiscount: 120,
        paymentPreference: "cod",
        city: "Bengaluru",
      })
      .expect(200);
    const reconciliation = reconcileResponse.body.reconciliation;

    expect(reconciliation.selectedLaneId).toBe("food_cart_payment_truth");
    expect(reconciliation.settlementStatus).toBe("needs_cart_readback");
    expect(reconciliation.riskFlags).toEqual(
      expect.arrayContaining(["coupon_requires_fresh_cart_readback", "cod_must_come_from_cart_payment_methods"]),
    );
    expect(
      reconciliation.telemetry.some(
        (item: { field: string; value: string }) =>
          item.field === "raw_payment_instrument_retained" && item.value === "false",
      ),
    ).toBe(true);
    expect(reconciliation.assertions.some((assertion: string) => assertion.includes("never stores raw payment"))).toBe(true);
  });

  it("returns meal window intelligence and forecasts timing safely", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-meal-window-intelligence").expect(200);
    const center = response.body.mealWindow;

    expect(center.score).toBeGreaterThanOrEqual(88);
    expect(center.totals.lanes).toBe(5);
    expect(center.totals.readyLanes).toBe(4);
    expect(center.totals.guardrails).toBe(5);
    expect(center.totals.readyGuardrails).toBe(4);
    expect(center.totals.samples).toBe(4);
    expect(center.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "weekday_lunch_eta_guard",
        "dinner_pantry_vs_delivery",
        "dineout_slot_window",
        "post_confirmation_tracking_window",
        "weekend_combined_window",
      ]),
    );
    expect(
      center.guardrails.some(
        (guard: { id: string; policy: string }) =>
          guard.id === "no_scheduled_food_order" && guard.policy.includes("no scheduled-delivery tool"),
      ),
    ).toBe(true);

    const forecastResponse = await request(app)
      .post("/api/swiggy-meal-window-intelligence/forecast")
      .send({
        city: "Bengaluru",
        window: "lunch",
        partySize: 2,
        urgency: "now",
        includeDineout: false,
      })
      .expect(200);
    const forecast = forecastResponse.body.forecast;

    expect(forecast.selectedLaneId).toBe("weekday_lunch_eta_guard");
    expect(forecast.etaRisk).toBe("high");
    expect(
      forecast.telemetry.some(
        (item: { field: string; value: string }) => item.field === "scheduled_food_order" && item.value === "false",
      ),
    ).toBe(true);
    expect(forecast.assertions.some((assertion: string) => assertion.includes("do not schedule Food orders"))).toBe(
      true,
    );
  });

  it("returns customization studio and validates exact-choice cart safety", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-customization-studio").expect(200);
    const studio = response.body.customizationStudio;

    expect(studio.score).toBeGreaterThanOrEqual(90);
    expect(studio.totals.lanes).toBe(5);
    expect(studio.totals.readyLanes).toBe(4);
    expect(studio.totals.guardrails).toBe(5);
    expect(studio.totals.readyGuardrails).toBe(4);
    expect(studio.totals.samples).toBe(4);
    expect(studio.totals.toolsCovered).toBeGreaterThanOrEqual(8);
    expect(studio.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "food_addon_variant_truth",
        "food_allergy_substitution_gate",
        "instamart_pack_size_truth",
        "voice_safe_customization",
        "combined_recipe_customization",
      ]),
    );
    expect(
      studio.guardrails.some(
        (guard: { id: string; policy: string }) =>
          guard.id === "post_mutation_cart_readback" && guard.policy.includes("get_food_cart or get_cart"),
      ),
    ).toBe(true);

    const validationResponse = await request(app)
      .post("/api/swiggy-customization-studio/validate")
      .send({
        server: "food",
        intent: "paneer bowl no peanuts",
        hasAllergy: true,
        userChangedVariant: true,
        quantity: 1,
        includeDineout: false,
      })
      .expect(200);
    const validation = validationResponse.body.validation;

    expect(validation.selectedLaneId).toBe("food_allergy_substitution_gate");
    expect(validation.mutationRisk).toBe("high");
    expect(validation.requiredFreshRead).toBe("get_food_cart");
    expect(
      validation.telemetry.some(
        (item: { field: string; value: string }) =>
          item.field === "raw_item_or_spin_id_retained" && item.value === "false",
      ),
    ).toBe(true);
    expect(validation.assertions.some((assertion: string) => assertion.includes("does not call a cart mutation"))).toBe(
      true,
    );
  });

  it("returns nutrition and budget intelligence for protein, pantry, coupon, and Dineout routes", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/nutrition-budget-intelligence").expect(200);
    const intelligence = response.body.nutritionBudget;

    expect(intelligence.score).toBeGreaterThanOrEqual(91);
    expect(intelligence.totalTargets).toBe(4);
    expect(intelligence.totalRoutes).toBe(6);
    expect(intelligence.readyRoutes).toBeGreaterThanOrEqual(5);
    expect(intelligence.totalRecommendations).toBe(4);
    expect(intelligence.totalPlaybooks).toBe(3);
    expect(intelligence.totalToolsCovered).toBeGreaterThanOrEqual(25);
    expect(intelligence.targets.map((target: { id: string }) => target.id)).toEqual(
      expect.arrayContaining(["protein_per_rupee", "budget_guardrail", "household_constraints", "fresh_cart_truth"]),
    );
    expect(intelligence.routes.map((route: { id: string }) => route.id)).toEqual(
      expect.arrayContaining([
        "food_protein_lunch",
        "instamart_protein_gap",
        "group_budget_allocator",
        "dineout_evening_balance",
        "coupon_safe_macro_cart",
        "manual_label_macro_camera",
      ]),
    );
    expect(
      intelligence.routes.some(
        (route: { id: string; swiggyServers: string[]; toolchain: string[]; confirmationGate: string }) =>
          route.id === "food_protein_lunch" &&
          route.swiggyServers.includes("food") &&
          route.toolchain.includes("food.fetch_food_coupons") &&
          route.toolchain.includes("food.place_food_order") &&
          route.confirmationGate.includes("place_food_order"),
      ),
    ).toBe(true);
    expect(
      intelligence.routes.some(
        (route: { id: string; toolchain: string[]; budgetRule: string }) =>
          route.id === "instamart_protein_gap" &&
          route.toolchain.includes("instamart.your_go_to_items") &&
          route.toolchain.includes("instamart.checkout") &&
          route.budgetRule.includes("Rs 99"),
      ),
    ).toBe(true);
    expect(
      intelligence.routes.some(
        (route: { id: string; swiggyServers: string[]; toolchain: string[]; dataBoundary: string }) =>
          route.id === "dineout_evening_balance" &&
          ["dineout", "food", "instamart"].every((server) => route.swiggyServers.includes(server)) &&
          route.toolchain.includes("dineout.book_table") &&
          route.dataBoundary.includes("lat/lng"),
      ),
    ).toBe(true);
    expect(
      intelligence.recommendations.some(
        (item: { id: string; proteinPerRupee: number; swiggyTools: string[] }) =>
          item.id === "weekly_protein_restock" &&
          item.proteinPerRupee > 0.2 &&
          item.swiggyTools.includes("instamart.search_products"),
      ),
    ).toBe(true);
    expect(
      intelligence.playbooks.some(
        (playbook: { id: string; steps: Array<{ tool?: string; guardrail: string }> }) =>
          playbook.id === "budget_rescue" &&
          playbook.steps.some((step) => step.tool === "apply_food_coupon") &&
          playbook.steps.some((step) => step.guardrail.includes("COD")),
      ),
    ).toBe(true);
    expect(intelligence.safetyControls.some((control: string) => control.includes("does not make medical claims"))).toBe(true);
    expect(intelligence.externalGates.some((gate: string) => gate.includes("nutrition fields"))).toBe(true);
    expect(intelligence.externalGates.some((gate: string) => gate.includes("vision/OCR"))).toBe(true);
  });

  it("returns a consent-aware household preference graph for Swiggy history and go-to signals", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/household-preference-graph").expect(200);
    const graph = response.body.householdPreference;

    expect(graph.score).toBeGreaterThanOrEqual(92);
    expect(graph.totalSignals).toBe(5);
    expect(graph.readySignals).toBeGreaterThanOrEqual(4);
    expect(graph.totalMembers).toBe(4);
    expect(graph.totalForecasts).toBe(4);
    expect(graph.readyForecasts).toBeGreaterThanOrEqual(3);
    expect(graph.totalAutomations).toBe(4);
    expect(graph.readyAutomations).toBeGreaterThanOrEqual(3);
    expect(graph.uniqueToolsCovered).toBeGreaterThanOrEqual(22);
    expect(graph.signals.map((signal: { id: string }) => signal.id)).toEqual(
      expect.arrayContaining([
        "food_active_order_taste",
        "instamart_go_to_reorder",
        "dineout_location_occasion",
        "local_household_profile",
        "support_and_failure_memory",
      ]),
    );
    expect(
      graph.signals.some(
        (signal: { id: string; status: string; swiggyTools: string[]; retentionRule: string }) =>
          signal.id === "instamart_go_to_reorder" &&
          signal.status === "ready" &&
          signal.swiggyTools.includes("instamart.your_go_to_items") &&
          signal.swiggyTools.includes("instamart.get_orders") &&
          signal.retentionRule.includes("raw order lines"),
      ),
    ).toBe(true);
    expect(
      graph.signals.some(
        (signal: { id: string; swiggyTools: string[]; preferenceUse: string }) =>
          signal.id === "dineout_location_occasion" &&
          signal.swiggyTools.includes("dineout.get_saved_locations") &&
          signal.swiggyTools.includes("dineout.get_booking_status") &&
          signal.preferenceUse.includes("preferred dining areas"),
      ),
    ).toBe(true);
    expect(
      graph.forecasts.some(
        (forecast: { id: string; swiggyTools: string[]; dataBoundary: string }) =>
          forecast.id === "protein_staple_depletion" &&
          forecast.swiggyTools.includes("instamart.your_go_to_items") &&
          forecast.swiggyTools.includes("instamart.update_cart") &&
          forecast.dataBoundary.includes("raw order history"),
      ),
    ).toBe(true);
    expect(
      graph.automations.some(
        (automation: { id: string; swiggyTools: string[]; guardrail: string }) =>
          automation.id === "active_order_tracking_memory" &&
          automation.swiggyTools.includes("food.get_food_orders") &&
          automation.swiggyTools.includes("instamart.track_order") &&
          automation.guardrail.includes("Cancellation"),
      ),
    ).toBe(true);
    expect(graph.privacyControls.some((control: string) => control.includes("model training"))).toBe(true);
    expect(graph.externalGates.some((gate: string) => gate.includes("staging and production credentials"))).toBe(true);
    expect(graph.assertions.some((assertion: string) => assertion.includes("Cancellation requests"))).toBe(true);
  });

  it("returns guest collaboration and calendar handoff plans for Swiggy occasions", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/guest-collaboration-calendar").expect(200);
    const center = response.body.guestCollaboration;

    expect(center.score).toBeGreaterThanOrEqual(91);
    expect(center.totalParticipants).toBe(4);
    expect(center.totalVoteRounds).toBe(4);
    expect(center.readyVoteRounds).toBeGreaterThanOrEqual(3);
    expect(center.totalTemplates).toBe(5);
    expect(center.readyTemplates).toBeGreaterThanOrEqual(4);
    expect(center.totalCalendarArtifacts).toBe(5);
    expect(center.readyCalendarArtifacts).toBeGreaterThanOrEqual(4);
    expect(center.uniqueToolsCovered).toBeGreaterThanOrEqual(20);
    expect(center.templates.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["date_night", "guests_at_home", "office_lunch", "weekday_reset", "recovery_meal"]),
    );
    expect(
      center.templates.some(
        (item: { id: string; route: Array<{ tool?: string; guardrail: string }>; reminderRule: string }) =>
          item.id === "date_night" &&
          item.route.some((step) => step.tool === "book_table") &&
          item.route.some((step) => step.tool === "search_restaurants") &&
          item.reminderRule.includes("no scheduled delivery"),
      ),
    ).toBe(true);
    expect(
      center.voteRounds.some(
        (round: { id: string; channel: string; swiggyTools: string[]; decisionRule: string }) =>
          round.id === "slot_vote" &&
          round.channel === "calendar_ics" &&
          round.swiggyTools.includes("dineout.get_available_slots") &&
          round.decisionRule.includes("free reservation"),
      ),
    ).toBe(true);
    expect(
      center.calendarArtifacts.some(
        (artifact: { id: string; contentType: string; guardrail: string }) =>
          artifact.id === "dessert_reminder" &&
          artifact.contentType === "ics" &&
          artifact.guardrail.includes("scheduled delivery"),
      ),
    ).toBe(true);
    expect(center.safetyControls.some((control: string) => control.includes("separate user-visible confirmation"))).toBe(true);
    expect(center.safetyControls.some((control: string) => control.includes("Food delivery is immediate-only"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("Slack/Teams"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("staging and production credentials"))).toBe(true);
  });

  it("returns luxury reservation and cart review workspaces across all Swiggy servers", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/luxury-experience-workspace").expect(200);
    const workspace = response.body.luxuryExperience;

    expect(workspace.score).toBeGreaterThanOrEqual(93);
    expect(workspace.totalModes).toBe(5);
    expect(workspace.readyModes).toBe(5);
    expect(workspace.totalWorkspaces).toBe(5);
    expect(workspace.readyWorkspaces).toBe(5);
    expect(workspace.totalArtifacts).toBe(5);
    expect(workspace.readyArtifacts).toBeGreaterThanOrEqual(4);
    expect(workspace.uniqueToolsCovered).toBeGreaterThanOrEqual(35);
    expect(workspace.modes.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["lean", "premium", "family", "social", "training"]),
    );
    expect(
      workspace.workspaces.some(
        (item: { id: string; steps: Array<{ tool?: string }>; commercialGate: string; authoritativeReads: string[] }) =>
          item.id === "reservation_atelier" &&
          item.steps.some((step) => step.tool === "book_table") &&
          item.authoritativeReads.includes("dineout.get_booking_status") &&
          item.commercialGate.includes("party size"),
      ),
    ).toBe(true);
    expect(
      workspace.workspaces.some(
        (item: { id: string; steps: Array<{ tool?: string }>; commercialGate: string; widgetFallback: string }) =>
          item.id === "food_cart_salon" &&
          item.steps.some((step) => step.tool === "place_food_order") &&
          item.steps.some((step) => step.tool === "get_food_cart") &&
          item.commercialGate.includes("Rs 1000") &&
          item.widgetFallback.includes("cart-widget"),
      ),
    ).toBe(true);
    expect(
      workspace.workspaces.some(
        (item: { id: string; steps: Array<{ tool?: string }>; commercialGate: string; voiceContract: string }) =>
          item.id === "instamart_basket_atelier" &&
          item.steps.some((step) => step.tool === "checkout") &&
          item.steps.some((step) => step.tool === "your_go_to_items") &&
          item.commercialGate.includes("Rs 99") &&
          item.voiceContract.includes("your_go_to_items"),
      ),
    ).toBe(true);
    expect(
      workspace.artifacts.some(
        (artifact: { id: string; status: string; guardrail: string }) =>
          artifact.id === "widget_gallery_fallback" &&
          artifact.status === "external_gate" &&
          artifact.guardrail.includes("hosted iframe"),
      ),
    ).toBe(true);
    expect(workspace.safetyControls.some((control: string) => control.includes("blind-retries"))).toBe(true);
    expect(workspace.safetyControls.some((control: string) => control.includes("raw Swiggy ids"))).toBe(true);
    expect(workspace.externalGates.some((gate: string) => gate.includes("staging and production credentials"))).toBe(true);
    expect(workspace.externalGates.some((gate: string) => gate.includes("hosted iframe"))).toBe(true);
  });

  it("returns a reviewer artifact vault for Swiggy access submission", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/reviewer-artifact-vault").expect(200);
    const vault = response.body.reviewerArtifactVault;

    expect(vault.score).toBeGreaterThanOrEqual(90);
    expect(vault.totalArtifacts).toBeGreaterThanOrEqual(30);
    expect(vault.readyArtifacts).toBeGreaterThanOrEqual(30);
    expect(vault.totalScreenshotTargets).toBe(18);
    expect(vault.readyScreenshotTargets).toBeGreaterThanOrEqual(5);
    expect(vault.totalCommands).toBe(7);
    expect(vault.readyCommands).toBeGreaterThanOrEqual(6);
    expect(vault.totalRedactionRules).toBeGreaterThanOrEqual(6);
    expect(vault.artifactSections.map((section: { id: string }) => section.id)).toEqual(
      expect.arrayContaining(["submission_packet", "product_depth", "mcp_contracts", "operations_and_logs"]),
    );
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some((artifact) => artifact.id === "openapi_contract" && artifact.path === "/api/openapi.json"),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some((artifact) => artifact.id === "luxury_experience" && artifact.path === "/api/luxury-experience-workspace"),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "source_intelligence" &&
            artifact.label === "Swiggy Source Intelligence" &&
            artifact.path === "/api/swiggy-source-intelligence",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "access_evidence_matrix" &&
            artifact.label === "Swiggy Access Evidence Matrix" &&
            artifact.path === "/api/swiggy-access-evidence-matrix",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "deep_site_map" &&
            artifact.label === "Swiggy Deep Site Map" &&
            artifact.path === "/api/swiggy-deep-site-map",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "developer_quickstart" &&
            artifact.label === "Developer Quickstart Workbench" &&
            artifact.path === "/api/swiggy-developer-quickstart",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "cta_execution" &&
            artifact.label === "CTA Execution Center" &&
            artifact.path === "/api/swiggy-cta-execution-center",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "docs_twin_explorer" &&
            artifact.label === "Swiggy Docs Twin Explorer" &&
            artifact.path === "/api/swiggy-docs-twin-explorer",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "innovation_radar" &&
            artifact.label === "Swiggy Innovation Radar" &&
            artifact.path === "/api/swiggy-innovation-radar",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "benefits_activation" &&
            artifact.label === "Swiggy Benefits Activation Center" &&
            artifact.path === "/api/swiggy-benefits-activation-center",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "demo_evidence_director" &&
            artifact.label === "Demo Evidence Director" &&
            artifact.path === "/api/swiggy-demo-evidence-director",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "partner_support_room" &&
            artifact.label === "Swiggy Partner Support Room" &&
            artifact.path === "/api/swiggy-partner-support-room",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "credential_handoff_center" &&
            artifact.label === "Swiggy Credential Handoff Center" &&
            artifact.path === "/api/swiggy-credential-handoff-center",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "widget_experience_composer" &&
            artifact.label === "Swiggy Widget Experience Composer" &&
            artifact.path === "/api/swiggy-widget-experience-composer",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "hosted_widget_activation" &&
            artifact.label === "Swiggy Hosted Widget Activation Center" &&
            artifact.path === "/api/swiggy-hosted-widget-activation",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "agent_experience_benchmark" &&
            artifact.label === "Swiggy Agent Experience Benchmark" &&
            artifact.path === "/api/swiggy-agent-experience-benchmark",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "private_pilot_control_room" &&
            artifact.label === "Swiggy Private Pilot Control Room" &&
            artifact.path === "/api/swiggy-private-pilot-control-room",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; label: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "staging_replay_center" &&
            artifact.label === "Swiggy Staging Replay Center" &&
            artifact.path === "/api/swiggy-staging-replay",
        ),
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "luxury_workspace_card" &&
          target.selector === ".luxury-experience-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "developer_quickstart_card" &&
          target.selector === ".developer-quickstart-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "cta_execution_card" &&
          target.selector === ".cta-execution-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "docs_twin_card" &&
          target.selector === ".docs-twin-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "access_evidence_card" &&
          target.selector === ".access-evidence-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.commands.some(
        (command: { id: string; command: string; expectedSignal: string }) =>
          command.id === "verify_production" &&
          command.command.includes("npm run verify:production") &&
          command.expectedSignal.includes("35/35"),
      ),
    ).toBe(true);
    expect(vault.redactionRules.some((rule: string) => rule.includes("bearer tokens"))).toBe(true);
    expect(vault.handoffChecklist.some((item: { id: string; status: string }) => item.id === "record_video" && item.status === "manual_input")).toBe(true);
    expect(vault.reviewerEmail.to).toBe("builders@swiggy.in");
    expect(vault.reviewerEmail.body).toContain("/api/reviewer-artifact-vault");
    expect(vault.reviewerEmail.body).toContain("/api/swiggy-demo-evidence-director");
    expect(vault.reviewerEmail.body).toContain("/api/swiggy-partner-support-room");
    expect(vault.reviewerEmail.body).toContain("/api/swiggy-benefits-activation-center");
    expect(vault.reviewerEmail.body).toContain("/api/swiggy-faq-resolution-center");
    expect(vault.reviewerEmail.body).toContain("/api/swiggy-talent-signal-center");
    expect(vault.reviewerEmail.body).toContain("/api/swiggy-conversion-center");
    expect(vault.reviewerEmail.body).toContain("/api/swiggy-builders-module-intelligence");
    expect(vault.reviewerEmail.body).toContain("/api/swiggy-builders-review-decision");
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some((artifact) => artifact.id === "faq_resolution" && artifact.path === "/api/swiggy-faq-resolution-center"),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some((artifact) => artifact.id === "talent_signal" && artifact.path === "/api/swiggy-talent-signal-center"),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some((artifact) => artifact.id === "conversion_center" && artifact.path === "/api/swiggy-conversion-center"),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) => artifact.id === "module_intelligence" && artifact.path === "/api/swiggy-builders-module-intelligence",
        ),
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "widget_experience_composer" &&
          target.selector === ".widget-experience-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "hosted_widget_activation" &&
          target.selector === ".hosted-widget-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some((artifact) => artifact.id === "journey_gates" && artifact.path === "/api/swiggy-builders-journey-gates"),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) => artifact.id === "homepage_experience" && artifact.path === "/api/swiggy-builders-homepage-experience",
        ),
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "agent_experience_benchmark" &&
          target.selector === ".agent-benchmark-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) => artifact.id === "source_evolution" && artifact.path === "/api/swiggy-builders-source-evolution",
        ),
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "private_pilot_control_room" &&
          target.selector === ".private-pilot-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.screenshotTargets.some(
        (target: { id: string; selector: string; status: string }) =>
          target.id === "staging_replay_card" &&
          target.selector === ".staging-replay-card" &&
          target.status === "ready",
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) =>
            artifact.id === "live_source_resilience" && artifact.path === "/api/swiggy-builders-live-source-resilience",
        ),
      ),
    ).toBe(true);
    expect(
      vault.artifactSections.some((section: { artifacts: Array<{ id: string; path: string }> }) =>
        section.artifacts.some(
          (artifact) => artifact.id === "review_decision" && artifact.path === "/api/swiggy-builders-review-decision",
        ),
      ),
    ).toBe(true);
    expect(vault.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns visual QA evidence for reviewer screenshots and responsive layout", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/visual-qa-center").expect(200);
    const visualQa = response.body.visualQa;

    expect(visualQa.score).toBe(100);
    expect(visualQa.totalTargets).toBe(64);
    expect(visualQa.readyTargets).toBe(64);
    expect(visualQa.totalRules).toBe(7);
    expect(visualQa.readyRules).toBe(7);
    expect(visualQa.totalCommands).toBe(5);
    expect(visualQa.readyCommands).toBe(5);
    expect(visualQa.targetGroups.map((group: { id: string }) => group.id)).toEqual(
      expect.arrayContaining(["desktop_review", "premium_surfaces", "mobile_review", "swiggy_widget_fallbacks"]),
    );
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "visual_qa_card" &&
            target.selector === ".visual-qa-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "faq_resolution_card" &&
            target.selector === ".faq-resolution-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "talent_signal_card" &&
            target.selector === ".talent-signal-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "conversion_center_card" &&
            target.selector === ".conversion-center-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "module_intelligence_card" &&
            target.selector === ".module-intelligence-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "journey_gates_card" &&
            target.selector === ".journey-gates-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "homepage_experience_card" &&
            target.selector === ".homepage-experience-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "source_evolution_card" &&
            target.selector === ".source-evolution-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "live_source_resilience_card" &&
            target.selector === ".live-source-resilience-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "review_decision_card" &&
            target.selector === ".review-decision-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "widget_experience_composer" &&
            target.selector === ".widget-experience-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "hosted_widget_activation" &&
            target.selector === ".hosted-widget-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "agent_experience_benchmark" &&
            target.selector === ".agent-benchmark-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "private_pilot_control_room" &&
            target.selector === ".private-pilot-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "staging_replay_card" &&
            target.selector === ".staging-replay-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "demo_evidence_card" &&
            target.selector === ".demo-evidence-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; viewport: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "partner_support_card" &&
            target.selector === ".partner-support-card" &&
            target.viewport === "desktop",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; width: number; viewport: string }> }) =>
        group.targets.some((target) => target.id === "mobile_launch_center" && target.width === 390 && target.viewport === "mobile"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string; artifactPath: string }> }) =>
        group.targets.some(
          (target) =>
            target.id === "innovation_radar_card" &&
            target.selector === ".innovation-radar-card" &&
            target.artifactPath.includes("artifacts/visual-qa"),
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "source_intelligence_card" && target.selector === ".source-intelligence-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "deep_site_map_card" && target.selector === ".deep-site-map-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "builders_launch_story_card" && target.selector === ".builders-launch-story-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "operating_contract_card" && target.selector === ".operating-contract-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some(
          (target) => target.id === "staging_credential_drill_card" && target.selector === ".staging-credential-drill-card",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "credential_vault_card" && target.selector === ".credential-vault-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "credential_handoff_card" && target.selector === ".credential-handoff-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "quota_negotiation_card" && target.selector === ".quota-negotiation-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some(
          (target) => target.id === "live_signal_calibration_card" && target.selector === ".live-signal-calibration-card",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "staging_seed_smoke_card" && target.selector === ".staging-seed-smoke-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "visual_dish_capture_card" && target.selector === ".visual-dish-capture-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "voice_commerce_card" && target.selector === ".voice-commerce-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "quality_loop_card" && target.selector === ".quality-loop-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "ritual_autopilot_card" && target.selector === ".ritual-autopilot-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "payment_truth_card" && target.selector === ".payment-truth-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "meal_window_card" && target.selector === ".meal-window-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some(
          (target) => target.id === "customization_studio_card" && target.selector === ".customization-studio-card",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "developer_quickstart_card" && target.selector === ".developer-quickstart-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "cta_execution_card" && target.selector === ".cta-execution-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "cta_live_audit_card" && target.selector === ".cta-live-audit-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "partner_success_card" && target.selector === ".partner-success-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "benefits_activation_card" && target.selector === ".benefits-activation-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "showcase_submission_card" && target.selector === ".showcase-submission-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "submission_timeline_card" && target.selector === ".submission-timeline-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "interaction_qa_card" && target.selector === ".interaction-qa-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "docs_twin_card" && target.selector === ".docs-twin-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some(
          (target) => target.id === "builders_site_parity_card" && target.selector === ".builders-site-parity-card",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "builders_page_mesh_card" && target.selector === ".builders-page-mesh-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "tool_parity_card" && target.selector === ".tool-parity-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "access_evidence_card" && target.selector === ".access-evidence-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "coding_agent_card" && target.selector === ".coding-agent-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some(
          (target) => target.id === "confirmation_command_card" && target.selector === ".confirmation-command-card",
        ),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "cancellation_care_card" && target.selector === ".cancellation-care-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "dineout_precision_card" && target.selector === ".dineout-precision-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "auth_lifecycle_card" && target.selector === ".auth-lifecycle-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.targetGroups.some((group: { targets: Array<{ id: string; selector: string }> }) =>
        group.targets.some((target) => target.id === "enterprise_platform_card" && target.selector === ".enterprise-platform-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.rules.some(
        (rule: { id: string; check: string }) =>
          rule.id === "no_overlap" &&
          rule.check.includes("1440") &&
          rule.check.includes("390"),
      ),
    ).toBe(true);
    expect(
      visualQa.rules.some(
        (rule: { id: string; check: string }) =>
          rule.id === "swiggy_widget_security" &&
          rule.check.includes("iframe-sandboxed") &&
          rule.check.includes("origin-verified"),
      ),
    ).toBe(true);
    expect(
      visualQa.commands.some(
        (command: { id: string; command: string; expectedSignal: string }) =>
          command.id === "visual_target_manifest" &&
          command.command.includes("/api/visual-qa-center") &&
          command.expectedSignal.includes(".visual-qa-card"),
      ),
    ).toBe(true);
    expect(
      visualQa.commands.some(
        (command: { id: string; command: string; expectedSignal: string }) =>
          command.id === "visual_capture_harness" &&
          command.command === "npm run verify:visual" &&
          command.expectedSignal.includes("targetCount >= 35"),
      ),
    ).toBe(true);
    expect(visualQa.externalGates.some((gate: string) => gate.includes("Selected PNG screenshots"))).toBe(true);
    expect(visualQa.assertions.some((assertion: string) => assertion.includes("Desktop, tablet, and mobile"))).toBe(true);
  });

  it("returns page-by-page Swiggy llms.txt docs coverage", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-docs-coverage").expect(200);
    const report = response.body.docsCoverage;

    expect(report.score).toBeGreaterThanOrEqual(95);
    expect(report.totalPages).toBe(69);
    expect(report.sourceInventory).toEqual({ llmsLinkedPages: 69, headerLinks: 7, footerLinks: 8, ctas: 7 });
    expect(report.sections.map((section: { section: string; total: number }) => [section.section, section.total])).toEqual(
      expect.arrayContaining([
        ["start", 10],
        ["build", 10],
        ["operate", 8],
        ["reference", 40],
        ["blog", 1],
      ]),
    );
    expect(report.pages.some((page: { id: string }) => page.id === "consumer_ai_client")).toBe(true);
    expect(
      report.pages.some(
        (page: { id: string; status: string; evidenceLinks: string[] }) =>
          page.id === "delegated_auth" &&
          page.status === "implemented" &&
          page.evidenceLinks.includes("/api/enterprise-delegated-auth"),
      ),
    ).toBe(true);
    expect(
      report.pages.some(
        (page: { id: string; status: string; evidenceLinks: string[] }) =>
          page.id === "enterprise_index" &&
          page.status === "implemented" &&
          page.evidenceLinks.includes("/api/enterprise-platform-center"),
      ),
    ).toBe(true);
    expect(
      report.pages.some(
        (page: { id: string; status: string; evidenceLinks: string[] }) =>
          page.id === "launch_blog" &&
          page.status === "implemented" &&
          page.evidenceLinks.includes("/api/swiggy-builders-launch-story"),
      ),
    ).toBe(true);
    expect(report.pages.some((page: { id: string }) => page.id === "reference_food_place_food_order")).toBe(true);
    expect(report.assertions.some((assertion: string) => assertion.includes("llms.txt-linked"))).toBe(true);
  });

  it("returns a Swiggy docs twin explorer for markdown and rendered page retrieval", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-docs-twin-explorer").expect(200);
    const explorer = response.body.docsTwinExplorer;

    expect(explorer.score).toBeGreaterThanOrEqual(95);
    expect(explorer.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/llms-full.txt",
      ]),
    );
    expect(explorer.totals.pages).toBe(69);
    expect(explorer.totals.markdownTwins).toBe(69);
    expect(explorer.totals.renderedPages).toBe(69);
    expect(explorer.totals.referenceTools).toBe(35);
    expect(explorer.totals.sections).toBe(5);
    expect(explorer.groups.map((group: { id: string; total: number }) => [group.id, group.total])).toEqual(
      expect.arrayContaining([
        ["start", 10],
        ["build", 10],
        ["operate", 8],
        ["reference", 40],
        ["blog", 1],
      ]),
    );
    expect(
      explorer.rows.some(
        (row: { id: string; markdownUrl: string; renderedUrl: string; evidenceLinks: string[]; retrievalMode: string }) =>
          row.id === "developer_quickstart" &&
          row.markdownUrl.endsWith("/docs/start/developer/index.md") &&
          row.renderedUrl.endsWith("/docs/start/developer/") &&
          row.retrievalMode === "markdown_twin" &&
          row.evidenceLinks.includes("/api/swiggy-developer-quickstart"),
      ),
    ).toBe(true);
    expect(
      explorer.rows.some(
        (row: { id: string; section: string; markdownUrl: string }) =>
          row.id === "reference_food_place_food_order" &&
          row.section === "reference" &&
          row.markdownUrl.endsWith("/docs/reference/food/place_food_order.md"),
      ),
    ).toBe(true);
    expect(
      explorer.retrievalLanes.some(
        (lane: { id: string; command: string; expectedSignal: string }) =>
          lane.id === "proof_readback" &&
          lane.command.includes("/api/swiggy-docs-twin-explorer") &&
          lane.expectedSignal.includes("totals.pages === 69"),
      ),
    ).toBe(true);
    expect(explorer.assertions.some((assertion: string) => assertion.includes("markdown twin URL"))).toBe(true);
    expect(explorer.externalGates.some((gate: string) => gate.includes("re-browse llms.txt"))).toBe(true);
  });

  it("returns Swiggy upstream docs, changelog, and roadmap watch evidence", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-upstream-watch").expect(200);
    const report = response.body.upstreamWatch;

    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.docsContract.llmsIndex).toBe("https://mcp.swiggy.com/builders/llms.txt");
    expect(report.docsContract.llmsFull).toBe("https://mcp.swiggy.com/builders/llms-full.txt");
    expect(report.docsContract.markdownPattern.toLowerCase()).toContain("append .md");
    expect(report.docsContract.smokeTest).toContain("Food exposes 14 tools");
    expect(report.releaseTimeline.some((release: { id: string; shipped: string[] }) => release.id === "v1_0_launch" && release.shipped.some((item: string) => item.includes("Food MCP server")))).toBe(true);
    expect(
      report.releaseTimeline.some((release: { knownLimitations: string[] }) =>
        release.knownLimitations.some((item: string) => item.includes("No refresh-token issuance")),
      ),
    ).toBe(true);
    expect(report.roadmapItems.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([
        "refresh_tokens",
        "status_page",
        "rate_limit_headers",
        "symbolic_error_codes",
        "deprecation_meta",
        "hosted_food_widgets",
        "dcr",
        "instamart_dineout_widgets",
        "url_major_versioning",
        "food_online_payment",
      ]),
    );
    expect(report.signedManifestWatch.targetVersion).toContain("v");
    expect(report.actionQueue.some((action: { id: string }) => action.id === "weekly_llms_refresh")).toBe(true);
    expect(report.externalGates.some((gate: string) => gate.includes("Signed manifest"))).toBe(true);
  });

  it("returns Swiggy Builders Module Intelligence for every website module", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-builders-module-intelligence").expect(200);
    const center = response.body.moduleIntelligence;

    expect(center.score).toBeGreaterThanOrEqual(85);
    expect(center.totals.pages).toBeGreaterThanOrEqual(8);
    expect(center.totals.modules).toBeGreaterThanOrEqual(38);
    expect(center.totals.ready).toBeGreaterThanOrEqual(20);
    expect(center.totals.operatorGates).toBeGreaterThanOrEqual(2);
    expect(center.totals.swiggyGates).toBeGreaterThanOrEqual(2);
    expect(center.totals.ctaMappedModules).toBeGreaterThanOrEqual(30);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(20);
    expect(center.totals.journeys).toBe(4);
    expect(center.modules.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining(["home_hero", "home_final_cta", "developers_build_ideas", "access_legal_framework", "reference_food"]),
    );
    expect(
      center.modules.some(
        (item: { id: string; routeOptimization: string; riskBoundary: string; proofLinks: string[] }) =>
          item.id === "developers_toolkit" &&
          item.routeOptimization.includes("read-first") &&
          item.riskBoundary.includes("confirmation") &&
          item.proofLinks.includes("/api/mcp/tool-lab"),
      ),
    ).toBe(true);
    expect(center.pageGroups.some((group: { pageId: string; modules: number }) => group.pageId === "home" && group.modules >= 6)).toBe(true);
    expect(center.journeys.map((journey: { id: string }) => journey.id)).toEqual(
      expect.arrayContaining(["homepage_to_access", "developer_innovation", "operate_to_go_live", "agent_docs_loop"]),
    );
    expect(center.operatorRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3]);
    expect(center.assertions.some((assertion: string) => assertion.includes("Every Website Atlas module"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("Access forms"))).toBe(true);
  });

  it("returns Swiggy Builders Journey Gates for the official five-step path", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-builders-journey-gates").expect(200);
    const center = response.body.journeyGates;

    expect(center.score).toBeGreaterThanOrEqual(80);
    expect(center.currentGate).toBe("Apply for Prod Access");
    expect(center.totals.gates).toBe(5);
    expect(center.totals.ready).toBeGreaterThanOrEqual(1);
    expect(center.totals.operatorGates).toBe(2);
    expect(center.totals.swiggyGates).toBe(2);
    expect(center.totals.entryCriteria + center.totals.exitCriteria).toBeGreaterThanOrEqual(35);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(20);
    expect(center.totals.telemetryLinks).toBeGreaterThanOrEqual(10);
    expect(center.gates.map((gate: { id: string }) => gate.id)).toEqual(
      expect.arrayContaining(["start_building", "apply_prod_access", "quick_review", "go_live", "show_built"]),
    );
    expect(
      center.gates.some(
        (gate: { id: string; status: string; proofLinks: string[]; telemetryLinks: string[] }) =>
          gate.id === "go_live" &&
          gate.status === "swiggy_gate" &&
          gate.proofLinks.includes("/api/staging-certification-matrix") &&
          gate.telemetryLinks.includes("/api/mcp/backpressure-governor"),
      ),
    ).toBe(true);
    expect(center.operatorRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(center.assertions.some((assertion: string) => assertion.includes("official five-step Builders journey"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("credentials"))).toBe(true);
  });

  it("returns Swiggy Builders Homepage Experience for every primary homepage section", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-builders-homepage-experience").expect(200);
    const center = response.body.homepageExperience;

    expect(center.score).toBeGreaterThanOrEqual(85);
    expect(center.totals.sections).toBe(8);
    expect(center.totals.ready).toBeGreaterThanOrEqual(3);
    expect(center.totals.operatorGates).toBeGreaterThanOrEqual(3);
    expect(center.totals.headerLinks).toBeGreaterThanOrEqual(7);
    expect(center.totals.footerLinks).toBeGreaterThanOrEqual(8);
    expect(center.totals.ctas).toBeGreaterThanOrEqual(25);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(20);
    expect(center.sections.map((section: { id: string }) => section.id)).toEqual(
      expect.arrayContaining(["global_header", "hero", "how_it_works", "benefits", "guidelines", "faq", "final_cta", "footer"]),
    );
    expect(
      center.sections.some(
        (section: { id: string; proofLinks: string[]; mobileCheck: string; reviewerCheck: string }) =>
          section.id === "final_cta" &&
          section.proofLinks.includes("/api/swiggy-conversion-center") &&
          section.mobileCheck.includes("manual") &&
          section.reviewerCheck.includes("CTA steps"),
      ),
    ).toBe(true);
    expect(center.continuityMap.map((row: { from: string; to: string }) => `${row.from}->${row.to}`)).toEqual(
      expect.arrayContaining(["global_header->hero", "hero->how_it_works", "faq->final_cta", "final_cta->footer"]),
    );
    expect(center.reviewerRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3]);
    expect(center.assertions.some((assertion: string) => assertion.includes("homepage section"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("legal pages"))).toBe(true);
  });

  it("returns Swiggy Builders Source Evolution for live source drift and 35-tool reconciliation", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-builders-source-evolution").expect(200);
    const center = response.body.sourceEvolution;

    expect(center.score).toBeGreaterThanOrEqual(88);
    expect(center.toolCountBridge.homepageLaunchCopy).toBe("18+ API Tools");
    expect(center.toolCountBridge.currentCallableTools).toBe(35);
    expect(center.toolCountBridge.coveredCallableTools).toBe(35);
    expect(center.toolCountBridge.coverageLabel).toBe("35/35");
    expect(center.toolCountBridge.reconciliation).toContain("launch-era");
    expect(center.totals.lanes).toBe(6);
    expect(center.totals.current).toBeGreaterThanOrEqual(2);
    expect(center.totals.watch).toBeGreaterThanOrEqual(2);
    expect(center.totals.swiggyGates).toBeGreaterThanOrEqual(1);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(15);
    expect(center.totals.roadmapItems).toBeGreaterThanOrEqual(10);
    expect(center.totals.driftSignals).toBeGreaterThanOrEqual(5);
    expect(center.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "launch_copy_to_current_tools",
        "agent_docs_refresh_loop",
        "roadmap_version_bridge",
        "rate_limit_and_signed_manifest",
        "homepage_and_widget_drift",
        "review_packet_regression",
      ]),
    );
    expect(
      center.lanes.some(
        (lane: { id: string; proofLinks: string[]; regressionCommand: string }) =>
          lane.id === "launch_copy_to_current_tools" &&
          lane.proofLinks.includes("/api/swiggy-tool-parity-auditor") &&
          lane.regressionCommand.includes("verify:production"),
      ),
    ).toBe(true);
    expect(center.watchQueue.length).toBeGreaterThanOrEqual(6);
    expect(center.releaseRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4]);
    expect(center.assertions.some((assertion: string) => assertion.includes("18+ launch-era"))).toBe(true);
    expect(center.assertions.some((assertion: string) => assertion.includes("35/35 callable tools"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("signed client manifest"))).toBe(true);
  });

  it("returns Swiggy Builders Live Source Resilience for fallback-safe source proof", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-builders-live-source-resilience").expect(200);
    const center = response.body.liveSourceResilience;

    expect(center.score).toBeGreaterThanOrEqual(90);
    expect(["live", "atlas_fallback"]).toContain(center.currentFetch.homepageMode);
    expect(center.currentFetch.matchedExpectedItems).toBeGreaterThanOrEqual(20);
    expect(center.currentFetch.missingExpectedItems).toBe(0);
    expect(center.currentFetch.pageMeshPages).toBeGreaterThanOrEqual(7);
    expect(center.currentFetch.pageMeshFetchedPages + center.currentFetch.pageMeshAtlasFallbackPages).toBe(
      center.currentFetch.pageMeshPages,
    );
    expect(center.currentFetch.pageMeshIntegrityVerifiedPages + center.currentFetch.pageMeshAtlasFallbackPages).toBe(
      center.currentFetch.pageMeshPages,
    );
    expect(center.currentFetch.docsTwinPages).toBe(69);
    expect(center.currentFetch.markdownTwins).toBe(69);
    expect(center.currentFetch.sourceEvolutionCoverage).toBe("35/35");
    expect(center.totals.lanes).toBe(6);
    expect(center.totals.verified + center.totals.fallback).toBeGreaterThanOrEqual(3);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(12);
    expect(center.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "homepage_fetch_resilience",
        "page_mesh_resilience",
        "llms_markdown_twin_resilience",
        "header_footer_cta_resilience",
        "source_evolution_rebrowse_gate",
        "packet_regression_resilience",
      ]),
    );
    expect(
      center.lanes.some(
        (lane: { id: string; fallbackPolicy: string; proofLinks: string[] }) =>
          lane.id === "homepage_fetch_resilience" &&
          lane.fallbackPolicy.includes("Fallback") &&
          lane.proofLinks.includes("/api/swiggy-builders-site-parity"),
      ),
    ).toBe(true);
    expect(center.fallbackRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4]);
    expect(center.assertions.some((assertion: string) => assertion.includes("fallback is explicitly reported"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("automated requests"))).toBe(true);
  });

  it("returns Swiggy Builders Review Decision for approval readiness", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-builders-review-decision").expect(200);
    const center = response.body.reviewDecision;

    expect(center.score).toBeGreaterThanOrEqual(78);
    expect(["record_demo_and_submit", "submit_access_packet", "await_swiggy_credentials", "refresh_source_review"]).toContain(
      center.recommendation,
    );
    expect(
      center.recommendationLabel.includes("demo") || center.recommendationLabel.includes("source review"),
    ).toBe(true);
    expect(center.totals.gates).toBe(8);
    expect(center.totals.ready).toBeGreaterThanOrEqual(3);
    expect(center.totals.operatorInputs).toBeGreaterThanOrEqual(1);
    expect(center.totals.swiggyGates).toBeGreaterThanOrEqual(2);
    expect(center.totals.proofLinks).toBeGreaterThanOrEqual(20);
    expect(center.gates.map((gate: { id: string }) => gate.id)).toEqual(
      expect.arrayContaining([
        "builder_fit",
        "working_demo",
        "security_privacy",
        "api_tool_coverage",
        "source_review",
        "credential_redirect",
        "ops_support",
        "go_live_showcase",
      ]),
    );
    expect(
      center.gates.some(
        (gate: { id: string; officialReviewSignal: string; proofLinks: string[]; status: string }) =>
          gate.id === "working_demo" &&
          gate.status === "operator_input" &&
          gate.officialReviewSignal.includes("demo") &&
          gate.proofLinks.includes("/api/reviewer-artifact-vault"),
      ),
    ).toBe(true);
    expect(center.decisionRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4]);
    expect(center.reviewerQuestions.length).toBe(8);
    expect(center.assertions.some((assertion: string) => assertion.includes("local reviewer-readiness"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("Builder Access approval"))).toBe(true);
  });

  it("returns source intelligence that reconciles website, docs, API tools, and drift signals", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-source-intelligence").expect(200);
    const report = response.body.sourceIntelligence;

    expect(report.score).toBeGreaterThanOrEqual(92);
    expect(report.inventory.llmsLinkedPages).toBe(69);
    expect(report.inventory.toolReferenceTools).toBe(35);
    expect(report.inventory.ctas).toBeGreaterThanOrEqual(11);
    expect(report.serverInventory.map((server: { server: string; tools: number }) => [server.server, server.tools])).toEqual(
      expect.arrayContaining([
        ["food", 14],
        ["instamart", 13],
        ["dineout", 8],
      ]),
    );
    expect(report.clusters.map((cluster: { id: string }) => cluster.id)).toEqual(
      expect.arrayContaining([
        "marketing_site",
        "start_tracks",
        "build_recipes",
        "reference_tools",
        "operate_contract",
        "source_refresh_loop",
      ]),
    );
    expect(
      report.driftSignals.some(
        (signal: { id: string; severity: string; mealPilotInterpretation: string }) =>
          signal.id === "homepage_tool_count_language" &&
          signal.severity === "info" &&
          signal.mealPilotInterpretation.includes("35-tool contract"),
      ),
    ).toBe(true);
    expect(
      report.driftSignals.some(
        (signal: { id: string; severity: string }) => signal.id === "live_credential_gate" && signal.severity === "blocking",
      ),
    ).toBe(true);
    expect(
      report.buildQueue.some(
        (item: { id: string; status: string; evidenceLinks: string[] }) =>
          item.id === "staging_credential_replay" &&
          item.status === "external_gate" &&
          item.evidenceLinks.includes("/api/mcp/staging-cutover"),
      ),
    ).toBe(true);
    expect(report.assertions.some((assertion: string) => assertion.includes("source-intelligence"))).toBe(true);
  });

  it("returns a deep Swiggy site map with page, CTA, header, footer, and proof coverage", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-deep-site-map").expect(200);
    const map = response.body.deepSiteMap;

    expect(map.score).toBeGreaterThanOrEqual(90);
    expect(map.totals.pages).toBeGreaterThanOrEqual(8);
    expect(map.totals.modules).toBeGreaterThanOrEqual(38);
    expect(map.totals.ctas).toBeGreaterThanOrEqual(11);
    expect(map.totals.headerLinks).toBeGreaterThanOrEqual(12);
    expect(map.totals.footerLinks).toBeGreaterThanOrEqual(6);
    expect(map.totals.proofLinks).toBeGreaterThanOrEqual(20);
    expect(map.pages.map((page: { id: string }) => page.id)).toEqual(
      expect.arrayContaining(["home", "developers", "enterprises", "access", "docs_home", "blog_launch"]),
    );
    expect(
      map.pages.some(
        (page: { id: string; ctaSignals: string[]; moduleSignals: string[]; proofLinks: string[] }) =>
          page.id === "access" &&
          page.ctaSignals.includes("Apply as Developer") &&
          page.moduleSignals.includes("The Ground Rules") &&
          page.proofLinks.includes("/api/submission-console"),
      ),
    ).toBe(true);
    expect(
      map.ctas.some(
        (cta: { id: string; completionGate: string; status: string; evidenceLinks: string[] }) =>
          cta.id === "apply_developer" &&
          cta.completionGate === "operator_submit" &&
          cta.status === "documented" &&
          cta.evidenceLinks.includes("/api/swiggy-access-dossier"),
      ),
    ).toBe(true);
    expect(map.headerFooterMatrix.some((item: { label: string }) => item.label === "Start Building")).toBe(true);
    expect(map.headerFooterMatrix.some((item: { label: string }) => item.label === "Privacy Policy")).toBe(true);
    expect(map.sections.map((section: { id: string }) => section.id)).toEqual(
      expect.arrayContaining(["site_pages", "header_footer", "cta_paths", "source_reconciliation"]),
    );
    expect(map.assertions.some((assertion: string) => assertion.includes("Every public Builders page"))).toBe(true);
    expect(map.externalGates.some((gate: string) => gate.includes("Google Forms"))).toBe(true);
  });

  it("returns a developer quickstart workbench for first Swiggy tool-call readiness", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-developer-quickstart").expect(200);
    const workbench = response.body.quickstartWorkbench;

    expect(workbench.score).toBeGreaterThanOrEqual(85);
    expect(workbench.officialSources.map((source: { id: string }) => source.id)).toEqual(
      expect.arrayContaining(["developer_quickstart", "build_an_agent", "authenticate", "llms_index"]),
    );
    expect(workbench.totals.steps).toBe(6);
    expect(workbench.totals.frameworks).toBeGreaterThanOrEqual(5);
    expect(workbench.totals.firstCallDrills).toBe(4);
    expect(workbench.totals.recipeHandoffs).toBe(4);
    expect(workbench.totals.authGates).toBe(5);
    expect(
      workbench.firstCallDrills.some(
        (drill: { id: string; server: string; tool: string; jsonRpc: { method: string; params: { name?: string } } }) =>
          drill.id === "food_get_addresses" &&
          drill.server === "food" &&
          drill.tool === "get_addresses" &&
          drill.jsonRpc.method === "tools/call" &&
          drill.jsonRpc.params.name === "get_addresses",
      ),
    ).toBe(true);
    expect(
      workbench.frameworkAdapters.some(
        (adapter: { id: string; authMode: string; serverUrls: string[] }) =>
          adapter.id === "openai_agents_js" &&
          adapter.authMode === "native_auth_provider" &&
          adapter.serverUrls.includes("https://mcp.swiggy.com/im"),
      ),
    ).toBe(true);
    expect(
      workbench.recipeHandoffs.some(
        (handoff: { id: string; confirmationGates: string[]; evidenceLinks: string[] }) =>
          handoff.id === "combined_evening" &&
          handoff.confirmationGates.includes("book_table") &&
          handoff.evidenceLinks.includes("/api/swiggy-route-optimizer"),
      ),
    ).toBe(true);
    expect(workbench.authGates.some((gate: { id: string; status: string }) => gate.id === "staging" && gate.status === "external_gate")).toBe(true);
    expect(workbench.commands.some((command: { id: string; expectedSignal: string }) => command.id === "production_verifier" && command.expectedSignal.includes("developerQuickstartScore"))).toBe(true);
    expect(workbench.assertions.some((assertion: string) => assertion.includes("get_addresses"))).toBe(true);

    const addressExecution = await request(app)
      .post("/api/swiggy-developer-quickstart/run-first-call")
      .send({ drillId: "food_get_addresses" })
      .expect(200);
    expect(addressExecution.body.firstCallExecution.decision).toBe("executed");
    expect(addressExecution.body.firstCallExecution.executedTools).toEqual(["get_addresses"]);
    expect(addressExecution.body.firstCallExecution.responseSummary.resultKind).toBe("address_list");
    expect(addressExecution.body.firstCallExecution.responseSummary.available).toBe(true);
    expect(addressExecution.body.firstCallExecution.responseSummary.primaryLabel).toMatch(/^redacted_address_/);
    expect(addressExecution.body.firstCallExecution.responseSummary.primaryLabel).not.toContain("Home");
    expect(
      addressExecution.body.firstCallExecution.telemetry.some(
        (field: { field: string; value: string }) => field.field === "raw_address_payload_retained" && field.value === "false",
      ),
    ).toBe(true);

    const dineoutExecution = await request(app)
      .post("/api/swiggy-developer-quickstart/run-first-call")
      .send({ drillId: "dineout_search_restaurants" })
      .expect(200);
    expect(dineoutExecution.body.firstCallExecution.decision).toBe("executed");
    expect(dineoutExecution.body.firstCallExecution.executedTools).toEqual(["search_restaurants_dineout"]);
    expect(dineoutExecution.body.firstCallExecution.responseSummary.resultKind).toBe("dineout_list");
    expect(dineoutExecution.body.firstCallExecution.nextRecommendedStep).toContain("get_available_slots");
  });

  it("returns a Swiggy CTA execution center for every click path and manual gate", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-cta-execution-center").expect(200);
    const center = response.body.ctaExecution;

    expect(center.score).toBeGreaterThanOrEqual(85);
    expect(center.totals.targets).toBeGreaterThanOrEqual(28);
    expect(center.totals.ctas).toBe(11);
    expect(center.totals.headerLinks).toBeGreaterThanOrEqual(7);
    expect(center.totals.docsLinks).toBeGreaterThanOrEqual(5);
    expect(center.totals.footerLinks).toBeGreaterThanOrEqual(6);
    expect(center.totals.operatorActions).toBeGreaterThan(0);
    expect(center.totals.externalGates).toBeGreaterThan(0);
    expect(center.groups.map((group: { id: string }) => group.id)).toEqual(
      expect.arrayContaining(["cta_paths", "global_header", "docs_subnav", "footer_links"]),
    );
    expect(
      center.targets.some(
        (target: { id: string; label: string; kind: string; status: string; proofLinks: string[]; keyboardPath: string[] }) =>
          target.id === "cta_start_building" &&
          target.label === "Start Building" &&
          target.kind === "docs" &&
          target.status === "ready" &&
          target.proofLinks.includes("/api/mcp/tool-lab") &&
          target.keyboardPath.includes("Confirm Start Building loads"),
      ),
    ).toBe(true);
    expect(
      center.targets.some(
        (target: { id: string; kind: string; completionGate: string; status: string; browserAction: string }) =>
          target.id === "cta_apply_developer" &&
          target.kind === "form" &&
          target.completionGate === "operator_submit" &&
          target.status === "operator_action" &&
          target.browserAction.includes("official Swiggy access form"),
      ),
    ).toBe(true);
    expect(
      center.targets.some(
        (target: { id: string; kind: string; officialUrl: string; status: string }) =>
          target.id === "cta_contact_us" &&
          target.kind === "email" &&
          target.officialUrl === "mailto:builders@swiggy.in" &&
          target.status === "operator_action",
      ),
    ).toBe(true);
    expect(center.targets.some((target: { label: string; kind: string }) => target.label === "Privacy Policy" && target.kind === "legal")).toBe(true);
    expect(center.commands.some((command: { id: string; expectedSignal: string }) => command.id === "production_gate" && command.expectedSignal.includes("ctaExecutionScore"))).toBe(true);
    expect(center.assertions.some((assertion: string) => assertion.includes("Global header"))).toBe(true);
    expect(center.externalGates.some((gate: string) => gate.includes("Google Forms"))).toBe(true);
  });

  it("audits live Swiggy CTA targets with safe probes and manual gates", async () => {
    const { config } = createMealPilotServer();
    const fixture = await buildSwiggyCtaLiveAuditor({
      config,
      probeTarget: async (url) => ({
        ok: url.startsWith("https://mcp.swiggy.com/builders/"),
        statusCode: url.startsWith("https://mcp.swiggy.com/builders/") ? 200 : 404,
        durationMs: 7,
      }),
    });

    expect(fixture.score).toBeGreaterThanOrEqual(90);
    expect(fixture.totals.targets).toBeGreaterThanOrEqual(28);
    expect(fixture.totals.reachable).toBeGreaterThanOrEqual(10);
    expect(fixture.totals.manualGates).toBeGreaterThan(0);
    expect(fixture.totals.unsafe).toBe(0);
    expect(fixture.rows.some((row) => row.id === "cta_start_building" && row.status === "reachable")).toBe(true);
    expect(fixture.rows.some((row) => row.id === "cta_apply_developer" && row.status === "manual_gate")).toBe(true);
    expect(fixture.assertions.some((assertion) => assertion.includes("user-supplied URLs are never accepted"))).toBe(true);
    expect(fixture.externalGates.some((gate: string) => gate.includes("Google Forms"))).toBe(true);
  });

  it("keeps Swiggy CTA 403 responses as watch instead of blocked during source outages", async () => {
    const { config } = createMealPilotServer();
    const fixture = await buildSwiggyCtaLiveAuditor({
      config,
      probeTarget: async () => ({
        ok: false,
        statusCode: 403,
        durationMs: 7,
      }),
    });

    expect(fixture.score).toBeGreaterThanOrEqual(70);
    expect(fixture.totals.watch).toBeGreaterThanOrEqual(20);
    expect(fixture.totals.blocked).toBe(0);
    expect(fixture.totals.unsafe).toBe(0);
    expect(fixture.rows.some((row) => row.id === "cta_start_building" && row.status === "watch")).toBe(true);
    expect(fixture.rows.some((row) => row.id === "cta_apply_developer" && row.status === "manual_gate")).toBe(true);
  });

  it("returns innovation radar that turns Swiggy signals into premium product lanes", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-innovation-radar").expect(200);
    const radar = response.body.innovationRadar;

    expect(radar.score).toBeGreaterThanOrEqual(70);
    expect(radar.opportunityCount).toBe(8);
    expect(radar.officialInputs.map((input: { id: string }) => input.id)).toEqual(
      expect.arrayContaining([
        "developers_build_ideas",
        "enterprise_backend",
        "access_ground_rules",
        "support_contract",
        "reference_contract",
      ]),
    );
    expect(radar.opportunityLanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "voice_dinner_concierge",
        "pantry_autopilot",
        "group_office_lunch",
        "dineout_first_evening",
        "screenshot_to_order",
        "enterprise_tenant_lane",
      ]),
    );
    expect(
      radar.opportunityLanes.some(
        (lane: { id: string; swiggyServers: string[]; swiggyTools: string[]; status: string }) =>
          lane.id === "dineout_first_evening" &&
          ["dineout", "food", "instamart"].every((server) => lane.swiggyServers.includes(server)) &&
          lane.swiggyTools.includes("dineout.book_table") &&
          lane.status === "ready",
      ),
    ).toBe(true);
    expect(radar.routeOptimizations.some((item: string) => item.includes("cart"))).toBe(true);
    expect(radar.buildPhases.map((phase: { id: string }) => phase.id)).toEqual(
      expect.arrayContaining(["local_os", "access_submission", "credentialed_staging", "premium_launch", "growth_compounding"]),
    );
    expect(radar.buildPhases.some((phase: { id: string; status: string }) => phase.id === "credentialed_staging" && phase.status === "staging_gate")).toBe(true);
    expect(radar.externalGates.some((gate: string) => gate.includes("Enterprise tenant"))).toBe(true);
  });

  it("returns AI client and coding-agent connection kit", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/ai-client-connect-kit").expect(200);
    const kit = response.body.connectKit;

    expect(kit.score).toBeGreaterThanOrEqual(95);
    expect(kit.servers.map((server: { server: string; tools: number }) => [server.server, server.tools])).toEqual([
      ["food", 14],
      ["instamart", 13],
      ["dineout", 8],
    ]);
    expect(kit.clientTargets.map((target: { id: string }) => target.id)).toEqual(
      expect.arrayContaining(["claude_desktop", "chatgpt", "cursor", "vs_code", "windsurf", "generic_mcp"]),
    );
    expect(
      kit.clientTargets.some(
        (target: { id: string; config: { mcpServers?: Record<string, { args?: string[] }> } }) =>
          target.id === "claude_desktop" &&
          target.config.mcpServers?.["swiggy-instamart"]?.args?.includes("https://mcp.swiggy.com/im"),
      ),
    ).toBe(true);
    expect(kit.codingAgentRules.length).toBeGreaterThanOrEqual(5);
    expect(kit.sdkAdapters.some((adapter: { authMode: string }) => adapter.authMode === "native_auth_provider")).toBe(true);
    expect(kit.sdkAdapters.some((adapter: { authMode: string }) => adapter.authMode === "bearer_header")).toBe(true);
    expect(kit.enterpriseDelegatedAuth.tokenLifecycle.some((item: { item: string; lifetime: string }) => item.item === "Access token" && item.lifetime.includes("5 days"))).toBe(true);
    expect(kit.safetyAssertions.some((assertion: string) => assertion.includes("35 Swiggy tools"))).toBe(true);

    for (const targetId of ["claude_desktop", "chatgpt", "cursor", "vs_code", "windsurf", "generic_mcp"]) {
      const generatedValidation = await request(app)
        .post("/api/ai-client-connect-kit/validate-config")
        .send({ targetId })
        .expect(200);
      expect(generatedValidation.body.validation.score).toBe(100);
      expect(generatedValidation.body.validation.issues).toEqual([]);
      expect(generatedValidation.body.validation.requiredServers.every((server: { present: boolean; urlMatches: boolean }) => server.present && server.urlMatches)).toBe(true);
      expect(generatedValidation.body.validation.secretLeakDetected).toBe(false);
      expect(generatedValidation.body.validation.requiredServers.find((server: { id: string }) => server.id === "swiggy-instamart").expectedUrl).toBe("https://mcp.swiggy.com/im");
    }

    const genericValidation = await request(app)
      .post("/api/ai-client-connect-kit/validate-config")
      .send({ targetId: "generic_mcp" })
      .expect(200);
    expect(genericValidation.body.validation.sanitizedConfig.metadata.authorizationServer).toBe(
      "https://mcp.swiggy.com/.well-known/oauth-authorization-server",
    );

    const submittedValidation = await request(app)
      .post("/api/ai-client-connect-kit/validate-config")
      .send({
        targetId: "cursor",
        config: {
          mcpServers: {
            "swiggy-food": { url: "https://mcp.swiggy.com/food" },
            "swiggy-instamart": { url: "https://mcp.swiggy.com/instamart" },
          },
          accessToken: "Bearer live_secret",
        },
      })
      .expect(200);
    expect(submittedValidation.body.validation.score).toBeLessThan(100);
    expect(submittedValidation.body.validation.issues).toEqual(
      expect.arrayContaining(["missing_swiggy-dineout", "wrong_url_swiggy-instamart", "secret_or_token_present"]),
    );
    expect(submittedValidation.body.validation.sanitizedConfig.accessToken).toBe("[redacted]");
    expect(JSON.stringify(submittedValidation.body.validation)).not.toContain("live_secret");
    expect(
      submittedValidation.body.validation.telemetry.some(
        (field: { field: string; value: string }) => field.field === "raw_token_retained" && field.value === "false",
      ),
    ).toBe(true);

    const wrongShape = await request(app)
      .post("/api/ai-client-connect-kit/validate-config")
      .send({
        targetId: "claude_desktop",
        config: {
          mcpServers: {
            "swiggy-food": { url: "https://mcp.swiggy.com/food" },
            "swiggy-instamart": { url: "https://mcp.swiggy.com/im" },
            "swiggy-dineout": { url: "https://mcp.swiggy.com/dineout" },
          },
        },
      })
      .expect(200);
    expect(wrongShape.body.validation.issues).toContain("invalid_claude_mcp_remote_shape");
  });

  it("builds a safe Swiggy handshake doctor report without tool execution", async () => {
    const calls: Array<{ url: string; method: string }> = [];
    const doctor = await buildSwiggyHandshakeDoctor(
      {
        appName: "MealPilot India",
        port: 8787,
        swiggyMode: "mock",
        swiggyClientId: "replace_after_builder_access",
        swiggyRedirectUri: "http://localhost:5173/auth/swiggy/callback",
        swiggyScope: "mcp:tools mcp:resources mcp:prompts",
        swiggyBaseUrl: "https://mcp-staging.swiggy.com",
        planRetentionDays: 14,
      },
      async (url, method) => {
        calls.push({ url, method });
        if (url.endsWith("/.well-known/oauth-authorization-server")) {
          return {
            statusCode: 200,
            contentType: "application/json",
            durationMs: 12,
            ok: true,
            bodyPreview: {
              issuer: "https://mcp.swiggy.com/auth",
              authorization_endpoint: "https://mcp.swiggy.com/auth/authorize",
              token_endpoint: "https://mcp.swiggy.com/auth/token",
              registration_endpoint: "https://mcp.swiggy.com/auth/register",
              scopes_supported: ["mcp:tools", "mcp:resources", "mcp:prompts"],
              code_challenge_methods_supported: ["S256"],
            },
          };
        }
        if (url.endsWith("/.well-known/oauth-protected-resource")) {
          return { statusCode: 404, contentType: "text/html", durationMs: 8, ok: false };
        }
        return { statusCode: 401, contentType: "application/json", durationMs: 10, ok: false };
      },
    );

    expect(doctor.score).toBeGreaterThanOrEqual(90);
    expect(doctor.authMetadata.pkceS256).toBe(true);
    expect(doctor.authMetadata.scopes).toEqual(["mcp:tools", "mcp:resources", "mcp:prompts"]);
    expect(doctor.serverEndpoints.map((endpoint) => [endpoint.server, endpoint.expectedPath])).toEqual([
      ["food", "/food"],
      ["instamart", "/im"],
      ["dineout", "/dineout"],
    ]);
    expect(doctor.probes.every((probe) => probe.method === "GET" || probe.method === "OPTIONS")).toBe(true);
    expect(doctor.credentialBoundaries.some((boundary) => boundary.includes("never sends bearer tokens"))).toBe(true);
    expect(JSON.stringify(doctor)).not.toContain("Bearer live_secret");
    expect(JSON.stringify(doctor)).not.toContain("access_token");
    expect(calls.map((call) => call.method)).not.toContain("POST");
  });

  it("parses the Swiggy llms manifest and detects docs drift safely", async () => {
    const manifestLines = [
      "# Swiggy Builders Club",
      "## Docs",
      "- [Developer quickstart](https://mcp.swiggy.com/builders/docs/start/developer/index.md): Zero to first successful Swiggy tool call.",
      "- [Order food end-to-end](https://mcp.swiggy.com/builders/docs/build/recipes/order-food.md): The canonical Food journey.",
      "- [Rate limits](https://mcp.swiggy.com/builders/docs/operate/rate-limits.md): Current and planned quotas.",
      "- [place_food_order](https://mcp.swiggy.com/builders/docs/reference/food/place_food_order.md): Place food delivery order.",
      "- [checkout](https://mcp.swiggy.com/builders/docs/reference/instamart/checkout.md): Place grocery order.",
      "- [book_table](https://mcp.swiggy.com/builders/docs/reference/dineout/book_table.md): Book a free table.",
      "## Blog",
      "- [Swiggy Announces Builders Club](https://mcp.swiggy.com/builders/blog/2026-04-17-builders-club-launch.md): Launch story.",
    ].join("\n");
    const verifier = await buildSwiggyLlmsManifestVerifier(async () => ({
      ok: true,
      statusCode: 200,
      durationMs: 7,
      text: manifestLines,
    }));

    expect(verifier.fetch.ok).toBe(true);
    expect(verifier.status).toBe("watch");
    expect(verifier.totals.liveLinks).toBe(7);
    expect(verifier.totals.expectedCoveragePages).toBe(69);
    expect(verifier.totals.unsafeLinks).toBe(0);
    expect(verifier.sampleLinks.find((link) => link.title === "Developer quickstart")?.renderedUrl).toBe(
      "https://mcp.swiggy.com/builders/docs/start/developer/",
    );
    expect(verifier.serverToolCounts.map((server) => server.server)).toEqual(["food", "instamart", "dineout"]);
    expect(verifier.driftSignals.some((signal) => signal.includes("Live llms.txt has 7 links"))).toBe(true);
    expect(verifier.assertions.some((assertion) => assertion.includes("user-supplied URLs are never accepted"))).toBe(true);
  });

  it("falls back to Docs Coverage when the live Swiggy llms manifest is blocked", async () => {
    const verifier = await buildSwiggyLlmsManifestVerifier(async () => ({
      ok: false,
      statusCode: 403,
      durationMs: 7,
    }));

    expect(verifier.fetch.ok).toBe(false);
    expect(verifier.status).toBe("covered");
    expect(verifier.score).toBe(100);
    expect(verifier.totals.liveLinks).toBe(69);
    expect(verifier.totals.referenceTools).toBe(35);
    expect(verifier.serverToolCounts.map((server) => `${server.server}:${server.tools}/${server.expectedTools}`)).toEqual([
      "food:14/14",
      "instamart:13/13",
      "dineout:8/8",
    ]);
    expect(verifier.driftSignals.some((signal) => signal.includes("Docs Coverage fallback"))).toBe(true);
    expect(verifier.assertions.some((assertion) => assertion.includes("Docs Coverage fallback"))).toBe(true);
  });

  it("audits live Swiggy reference tools against local tool contracts safely", async () => {
    const manifestLines = [
      "# Swiggy Builders Club",
      "## Reference",
      "- [place_food_order](https://mcp.swiggy.com/builders/docs/reference/food/place_food_order.md): Place food delivery order.",
      "- [checkout](https://mcp.swiggy.com/builders/docs/reference/instamart/checkout.md): Place grocery order.",
      "- [book_table](https://mcp.swiggy.com/builders/docs/reference/dineout/book_table.md): Book a free table.",
    ].join("\n");
    const auditor = await buildSwiggyToolParityAuditor(async () => ({
      ok: true,
      statusCode: 200,
      durationMs: 8,
      text: manifestLines,
    }));

    expect(auditor.status).toBe("watch");
    expect(auditor.totals.liveReferenceTools).toBe(3);
    expect(auditor.totals.localContracts).toBe(35);
    expect(auditor.totals.matchedTools).toBe(3);
    expect(auditor.totals.missingContracts).toBe(0);
    expect(auditor.totals.extraContracts).toBe(32);
    expect(auditor.serverSummaries.map((server) => server.server)).toEqual(["food", "instamart", "dineout"]);

    const foodOrder = auditor.rows.find((row) => row.id === "food_place_food_order");
    expect(foodOrder?.routeClass).toBe("commercial_action");
    expect(foodOrder?.confirmationGate).toContain("get_food_cart");
    expect(foodOrder?.retryPolicy).toContain("Never blind-retry");
    expect(foodOrder?.fixtureReady).toBe(true);
    expect(foodOrder?.evidenceLinks).toEqual(expect.arrayContaining(["/api/mcp/tool-contract-matrix", "/api/mcp/tool-lab"]));
    expect(auditor.assertions.some((assertion) => assertion.includes("user-supplied URLs are never accepted"))).toBe(true);
    expect(auditor.driftSignals.some((signal) => signal.includes("Live reference manifest exposes 3 tools"))).toBe(true);
  });

  it("falls back to Docs Coverage for tool parity when live llms is blocked", async () => {
    const auditor = await buildSwiggyToolParityAuditor(async () => ({
      ok: false,
      statusCode: 403,
      durationMs: 7,
    }));

    expect(auditor.score).toBe(100);
    expect(auditor.status).toBe("covered");
    expect(auditor.totals.liveReferenceTools).toBe(35);
    expect(auditor.totals.localContracts).toBe(35);
    expect(auditor.totals.matchedTools).toBe(35);
    expect(auditor.totals.missingContracts).toBe(0);
    expect(auditor.serverSummaries.map((server) => `${server.server}:${server.covered}/${server.expectedTools}`)).toEqual([
      "food:14/14",
      "instamart:13/13",
      "dineout:8/8",
    ]);
    expect(auditor.driftSignals.some((signal) => signal.includes("Docs Coverage fallback"))).toBe(true);
    expect(auditor.assertions.some((assertion) => assertion.includes("Docs Coverage fallback"))).toBe(true);
  });

  it("returns coding-agent governance grounded in the root AGENTS.md file", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/coding-agent-governance").expect(200);
    const governance = response.body.codingAgentGovernance;

    expect(governance.score).toBeGreaterThanOrEqual(95);
    expect(governance.ruleFile.path).toBe("AGENTS.md");
    expect(governance.ruleFile.status).toBe("ready");
    expect(governance.ruleFile.matchedSignals).toBe(governance.ruleFile.totalSignals);
    expect(governance.officialSources.map((source: { url: string }) => source.url)).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/docs/start/coding-agents/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/llms-full.txt",
      ]),
    );
    expect(governance.requiredSignals.map((signal: { id: string }) => signal.id)).toEqual(
      expect.arrayContaining(["llms_index", "markdown_twins", "never_invent_tools", "food_tool_count_smoke"]),
    );
    expect(
      governance.smokeTests.some(
        (test: { id: string; command: string; expected: string }) =>
          test.id === "food_tool_count" &&
          test.command.includes("llms.txt") &&
          test.expected.includes("Food reference exposes 14 tools"),
      ),
    ).toBe(true);
    expect(governance.guardrails.some((guardrail: string) => guardrail.includes("Never log bearer tokens"))).toBe(true);
    expect(governance.commands.some((command: string) => command.includes("/api/coding-agent-governance"))).toBe(true);
  });

  it("returns Swiggy brand and co-branding compliance evidence", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/brand-compliance-kit").expect(200);
    const kit = response.body.brandCompliance;

    expect(kit.score).toBeGreaterThanOrEqual(85);
    expect(kit.attributionCopy).toContain("Powered by Swiggy MCP");
    expect(kit.rules.map((rule: { id: string }) => rule.id)).toEqual(
      expect.arrayContaining([
        "powered_by_swiggy",
        "no_false_endorsement",
        "brand_assets_after_onboarding",
        "orange_usage",
        "white_label_restriction",
        "no_misrepresentation",
      ]),
    );
    expect(kit.surfaces.map((surface: { id: string }) => surface.id)).toEqual(
      expect.arrayContaining(["recommendation_card", "widget_fallback", "voice_surface", "support_transcript", "docs_packet"]),
    );
    expect(
      kit.assetGates.some(
        (gate: { id: string; status: string }) => gate.id === "logo_pack" && gate.status === "external_gate",
      ),
    ).toBe(true);
    expect(kit.paletteAudit.swiggyOrange).toBe("#FF5200");
    expect(kit.paletteAudit.orangeUsage).toBe("reserved_for_swiggy_marks_only");
    expect(kit.externalGates.some((gate: string) => gate.includes("brand asset"))).toBe(true);
    expect(kit.assertions.some((assertion: string) => assertion.includes("does not claim official Swiggy endorsement"))).toBe(true);
  });

  it("compiles official Swiggy journeys and indexes every tool", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-journey-compiler").expect(200);
    const report = response.body.journeyCompiler;

    expect(report.score).toBeGreaterThanOrEqual(95);
    expect(report.totalJourneys).toBe(5);
    expect(report.totalToolsIndexed).toBe(35);
    expect(report.journeys.map((journey: { id: string }) => journey.id)).toEqual(
      expect.arrayContaining(["food_order", "instamart_order", "dineout_booking", "combined_evening", "household_reset"]),
    );
    expect(report.toolIndex.every((item: { journeyIds: string[] }) => item.journeyIds.length > 0)).toBe(true);
    expect(
      report.journeys.some(
        (journey: { id: string; servers: string[] }) =>
          journey.id === "household_reset" &&
          ["food", "instamart", "dineout"].every((server) => journey.servers.includes(server)),
      ),
    ).toBe(true);
    expect(
      report.journeys.some((journey: { id: string; steps: Array<{ tool: string; confirmationRequired: boolean }> }) =>
        journey.id === "food_order" &&
        journey.steps.some((step: { tool: string; confirmationRequired: boolean }) => step.tool === "place_food_order" && step.confirmationRequired),
      ),
    ).toBe(true);
    expect(
      report.toolIndex.some(
        (item: { server: string; tool: string; safetyClass: string; role: string }) =>
          item.server === "instamart" && item.tool === "checkout" && item.safetyClass === "commercial_action" && item.role === "core",
      ),
    ).toBe(true);
    expect(report.assertions.some((assertion: string) => assertion.includes("35 official Swiggy tools"))).toBe(true);
  });

  it("builds a Swiggy production access dossier from application rules", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-access-dossier").expect(200);
    const dossier = response.body.dossier;

    expect(dossier.score).toBeGreaterThanOrEqual(90);
    expect(dossier.recommendedTrack).toBe("developer");
    expect(dossier.applicationFields.map((field: { id: string }) => field.id)).toEqual(
      expect.arrayContaining([
        "who_you_are",
        "what_you_are_building",
        "how_it_works",
        "redirect_uris",
        "static_ip_ranges",
        "security_contact",
        "data_privacy",
        "environment_setup",
        "terms_acknowledgement",
        "expected_traffic",
      ]),
    );
    expect(
      dossier.reviewChecks.map((check: { id: string }) => check.id),
    ).toEqual(expect.arrayContaining(["security_check", "compliance_review", "use_case_fit", "gradual_rollout"]));
    expect(
      dossier.groundRules.map((rule: { officialStance: string }) => rule.officialStance),
    ).toEqual(expect.arrayContaining(["allowed", "restricted", "prohibited", "operating_principle"]));
    expect(dossier.tracks.some((track: { id: string; status: string }) => track.id === "developer" && track.status === "manual_input")).toBe(true);
    expect(
      dossier.legalReadiness.some(
        (item: { id: string; status: string }) => item.id === "data_protection_terms" && item.status === "ready",
      ),
    ).toBe(true);
    expect(dossier.externalGates.some((gate: string) => gate.includes("Google Form"))).toBe(true);
    expect(dossier.proofLinks.some((link: { path: string }) => link.path === "/api/production-launch-bundle")).toBe(true);
  });

  it("returns a Swiggy access evidence matrix across fields, proof, owners, and gates", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-access-evidence-matrix").expect(200);
    const matrix = response.body.accessEvidenceMatrix;

    expect(matrix.score).toBeGreaterThanOrEqual(80);
    expect(matrix.recommendedTrack).toBe("developer");
    expect(matrix.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/developers/",
        "https://mcp.swiggy.com/builders/enterprises/",
        "https://mcp.swiggy.com/builders/access/",
      ]),
    );
    expect(matrix.totals.sections).toBe(5);
    expect(matrix.totals.requiredApplicationFields).toBe(9);
    expect(matrix.totals.readyRequiredApplicationFields).toBeGreaterThanOrEqual(4);
    expect(matrix.totals.requiredAttachments).toBeGreaterThanOrEqual(10);
    expect(matrix.totals.readyRequiredAttachments).toBeGreaterThanOrEqual(8);
    expect(matrix.totals.rows).toBeGreaterThanOrEqual(40);
    expect(matrix.totals.readyRows).toBeGreaterThanOrEqual(25);
    expect(matrix.totals.operatorRows).toBeGreaterThanOrEqual(5);
    expect(matrix.totals.externalGateRows).toBeGreaterThanOrEqual(3);
    expect(matrix.sections.map((section: { id: string }) => section.id)).toEqual(
      expect.arrayContaining([
        "application_fields",
        "review_and_rules",
        "legal_and_tracks",
        "attachments_and_runbook",
        "reviewer_proof_commands",
      ]),
    );
    expect(
      matrix.sections.some((section: { id: string; rows: Array<{ id: string; owner: string; status: string }> }) =>
        section.id === "application_fields" &&
        section.rows.some(
          (row) =>
            row.id === "field_terms_acknowledgement" &&
            row.owner === "Operator" &&
            row.status === "operator_input",
        ),
      ),
    ).toBe(true);
    expect(
      matrix.sections.some((section: { rows: Array<{ id: string; owner: string; status: string; evidenceLinks: string[] }> }) =>
        section.rows.some(
          (row) =>
            row.id === "target_request_access" &&
            row.owner === "Operator" &&
            row.evidenceLinks.includes("https://mcp.swiggy.com/builders/access/"),
        ),
      ),
    ).toBe(true);
    expect(
      matrix.sections.some((section: { rows: Array<{ id: string; owner: string; status: string }> }) =>
        section.rows.some(
          (row) => row.id === "runbook_await_credentials" && row.owner === "Swiggy" && row.status === "external_gate",
        ),
      ),
    ).toBe(true);
    expect(matrix.commands.map((command: { id: string }) => command.id)).toEqual(
      expect.arrayContaining(["matrix_readback", "production_verifier", "submission_state"]),
    );
    expect(
      matrix.commands.some(
        (command: { id: string; expectedSignal: string }) =>
          command.id === "matrix_readback" && command.expectedSignal.includes("requiredApplicationFields === 9"),
      ),
    ).toBe(true);
    expect(matrix.submissionReadiness.some((item: string) => item.includes("required application fields"))).toBe(true);
    expect(matrix.assertions.some((assertion: string) => assertion.includes("Every official access-page"))).toBe(true);
    expect(matrix.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("builds premium MealPilot use cases across every Swiggy tool", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/premium-use-case-studio").expect(200);
    const studio = response.body.studio;

    expect(studio.score).toBeGreaterThanOrEqual(95);
    expect(studio.totalUseCases).toBeGreaterThanOrEqual(10);
    expect(studio.crossServerUseCases).toBeGreaterThanOrEqual(8);
    expect(studio.totalToolsUsed).toBe(35);
    expect(studio.totalOfficialTools).toBe(35);
    expect(studio.useCases.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([
        "household_week_reset",
        "voice_fridge_to_dinner",
        "date_night_orchestrator",
        "office_lunch_boardroom",
        "care_circle_meals",
        "pantry_autopilot_plus",
        "rainy_day_rescue",
        "guest_hosting_os",
        "traveler_hotel_mode",
        "celebration_split_plan",
      ]),
    );
    expect(
      studio.toolCoverage.every((server: { totalTools: number; usedTools: number }) => server.totalTools === server.usedTools),
    ).toBe(true);
    expect(
      studio.useCases.some(
        (item: { id: string; route: Array<{ tools: string[] }> }) =>
          item.id === "care_circle_meals" &&
          item.route.some((step: { tools: string[] }) => step.tools.includes("food.report_error")),
      ),
    ).toBe(true);
    expect(
      studio.useCases.some(
        (item: { id: string; route: Array<{ tools: string[] }> }) =>
          item.id === "traveler_hotel_mode" &&
          item.route.some((step: { tools: string[] }) => step.tools.includes("instamart.delete_address")),
      ),
    ).toBe(true);
    expect(studio.assertions.some((assertion: string) => assertion.includes("35/35 official Swiggy tools"))).toBe(true);
  });

  it("builds a premium concierge itinerary from Swiggy official recipes", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/premium-concierge-itinerary").expect(200);
    const concierge = response.body.concierge;

    expect(concierge.score).toBeGreaterThanOrEqual(95);
    expect(concierge.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
        "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
        "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
        "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
      ]),
    );
    expect(concierge.itinerary.map((slot: { id: string }) => slot.id)).toEqual(
      expect.arrayContaining(["weekday_lunch", "evening_grocery_reset", "saturday_evening", "sunday_recovery"]),
    );
    expect(concierge.toolCoverage.map((item: { coverage: string }) => item.coverage)).toEqual(["14/14", "13/13", "8/8"]);
    expect(concierge.totalSavedCalls).toBeGreaterThanOrEqual(10);
    expect(
      concierge.itinerary.some(
        (slot: { primaryRecipe: string; servers: string[] }) =>
          slot.primaryRecipe === "combined" && slot.servers.includes("dineout") && slot.servers.includes("food"),
      ),
    ).toBe(true);
    expect(
      concierge.safetyControls.some((control: string) => control.includes("confirmations remain separate")),
    ).toBe(true);
    expect(concierge.externalGates.some((gate: string) => gate.includes("scheduled delivery"))).toBe(true);
  });

  it("builds a Swiggy staging certification matrix for every tool and gate", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/staging-certification-matrix").expect(200);
    const matrix = response.body.matrix;
    const waveIds = matrix.waves.map((wave: { id: string }) => wave.id);
    const certifiedTools = matrix.waves.flatMap((wave: { tools: Array<{ id: string }> }) => wave.tools);
    const uniqueToolIds = new Set(certifiedTools.map((tool: { id: string }) => tool.id));

    expect(matrix.score).toBeGreaterThanOrEqual(90);
    expect(matrix.currentMode).toBe("mock");
    expect(matrix.liveStagingVerified).toBe(false);
    expect(matrix.stagingBaseUrl).toBe("https://mcp-staging.swiggy.com");
    expect(matrix.soakHoursRequired).toBe(48);
    expect(matrix.totalTools).toBe(35);
    expect(matrix.assignedTools).toBe(35);
    expect(certifiedTools).toHaveLength(35);
    expect(uniqueToolIds.size).toBe(35);
    expect(waveIds).toEqual(
      expect.arrayContaining([
        "preflight",
        "oauth_dcr",
        "read_tools",
        "cart_mutations",
        "commercial_actions",
        "support_reporting",
        "soak_48h",
        "production_promotion",
      ]),
    );
    expect(
      matrix.waves.some(
        (wave: { id: string; tools: Array<{ tool: string; routeClass: string; expectedEvidence: string }> }) =>
          wave.id === "commercial_actions" &&
          wave.tools.some(
            (tool: { tool: string; routeClass: string; expectedEvidence: string }) =>
              tool.tool === "checkout" &&
              tool.routeClass === "commercial_action" &&
              tool.expectedEvidence.includes("no blind retry"),
          ),
      ),
    ).toBe(true);
    expect(
      matrix.waves.some(
        (wave: { id: string; tools: Array<{ tool: string }> }) =>
          wave.id === "support_reporting" && wave.tools.filter((tool: { tool: string }) => tool.tool === "report_error").length === 3,
      ),
    ).toBe(true);
    expect(matrix.perServer.map((server: { server: string; assignedTools: number }) => [server.server, server.assignedTools])).toEqual([
      ["food", 14],
      ["instamart", 13],
      ["dineout", 8],
    ]);
    expect(
      matrix.credentialChecklist.some(
        (item: { id: string; status: string }) => item.id === "production_credentials" && item.status === "production_gate",
      ),
    ).toBe(true);
    expect(matrix.telemetryRequirements.some((item: string) => item.includes("session_id"))).toBe(true);
    expect(matrix.commands.some((command: { id: string }) => command.id === "staging_smoke")).toBe(true);
    expect(matrix.assertions.some((assertion: string) => assertion.includes("35 official Swiggy MCP tools"))).toBe(true);
    expect(matrix.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns a Swiggy MCP tool contract matrix for every official tool", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/mcp/tool-contract-matrix").expect(200);
    const matrix = response.body.matrix;

    expect(matrix.score).toBe(100);
    expect(matrix.totalTools).toBe(35);
    expect(matrix.totalParameters).toBeGreaterThan(50);
    expect(matrix.servers.map((server: { totalTools: number }) => server.totalTools)).toEqual([14, 13, 8]);
    expect(matrix.contracts).toHaveLength(35);
    expect(
      matrix.contracts.every((contract: { officialReference: string }) =>
        contract.officialReference.startsWith("https://mcp.swiggy.com/builders/docs/reference/"),
      ),
    ).toBe(true);

    const foodOrder = matrix.contracts.find((contract: { tool: string }) => contract.tool === "place_food_order");
    expect(foodOrder.parameters.map((param: { name: string }) => param.name)).toEqual(
      expect.arrayContaining(["addressId", "paymentMethod"]),
    );
    expect(foodOrder.confirmationGate).toContain("get_food_cart");
    expect(foodOrder.confirmationGate).toContain("Rs 1000");
    expect(foodOrder.retryPolicy).toContain("Never blind-retry");

    const checkout = matrix.contracts.find((contract: { tool: string }) => contract.tool === "checkout");
    expect(checkout.preconditions.some((item: string) => item.includes("Multi-store"))).toBe(true);
    expect(checkout.confirmationGate).toContain("get_cart");

    const bookTable = matrix.contracts.find((contract: { tool: string }) => contract.tool === "book_table");
    expect(bookTable.parameters.map((param: { name: string }) => param.name)).toEqual(
      expect.arrayContaining(["restaurantId", "slotId", "itemId", "reservationTime", "guestCount", "latitude", "longitude"]),
    );
    expect(bookTable.preconditions.some((item: string) => item.includes("free reservations"))).toBe(true);

    expect(matrix.commonErrorEnvelope.current).toEqual(expect.arrayContaining(["success false", "error.message required"]));
    expect(matrix.commonErrorEnvelope.plannedCoreCodes).toEqual(expect.arrayContaining(["RATE_LIMITED", "VALIDATION_ERROR"]));
    expect(matrix.commonErrorEnvelope.plannedDomainCodes.dineout).toEqual(expect.arrayContaining(["SLOT_UNAVAILABLE"]));
    expect(matrix.assertions.some((assertion: string) => assertion.includes("All 35 official Swiggy MCP tools"))).toBe(true);
  });

  it("probes every official Swiggy MCP tool in the Tool Lab", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/mcp/tool-lab").expect(200);

    expect(response.body.toolLab.totalTools).toBe(35);
    expect(response.body.toolLab.callableTools).toBe(35);
    expect(response.body.toolLab.score).toBe(100);
    expect(response.body.toolLab.servers.map((server: { server: string; callableTools: number }) => [
      server.server,
      server.callableTools,
    ])).toEqual([
      ["food", 14],
      ["instamart", 13],
      ["dineout", 8],
    ]);
    expect(response.body.toolLab.probes.every((probe: { request: { method: string } }) => probe.request.method === "tools/call")).toBe(true);
    expect(
      response.body.toolLab.probes.some(
        (probe: { tool: string; routeClass: string; safetyGate: string }) =>
          probe.tool === "checkout" &&
          probe.routeClass === "commercial_action" &&
          probe.safetyGate.includes("explicit user confirmation"),
      ),
    ).toBe(true);
    expect(response.body.toolLab.innovationUseCases.length).toBeGreaterThanOrEqual(4);
  });

  it("runs official Swiggy recipe scenarios across every MCP tool", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/mcp/scenario-runner").expect(200);
    const runner = response.body.scenarioRunner;

    expect(runner.score).toBe(100);
    expect(runner.totalScenarios).toBe(4);
    expect(runner.totalOfficialTools).toBe(35);
    expect(runner.uniqueToolsCovered).toBe(35);
    expect(runner.toolCoverage.map((item: { coverage: string }) => item.coverage)).toEqual(["14/14", "13/13", "8/8"]);
    expect(runner.scenarios.map((scenario: { id: string }) => scenario.id)).toEqual(
      expect.arrayContaining([
        "food_order_recipe",
        "instamart_order_recipe",
        "dineout_booking_recipe",
        "combined_evening_recipe",
      ]),
    );
    expect(
      runner.scenarios.every((scenario: { steps: Array<{ request: { method: string } }> }) =>
        scenario.steps.every((step) => step.request.method === "tools/call"),
      ),
    ).toBe(true);
    expect(
      runner.scenarios.some(
        (scenario: { id: string; routeAssertions: string[] }) =>
          scenario.id === "combined_evening_recipe" &&
          scenario.routeAssertions.some((assertion) => assertion.includes("reminder")),
      ),
    ).toBe(true);
    expect(
      runner.scenarios.some((scenario: { steps: Array<{ tool: string; confirmationRequired: boolean }> }) =>
        scenario.steps.some((step) => step.tool === "place_food_order" && step.confirmationRequired),
      ),
    ).toBe(true);
    expect(runner.assertions.some((assertion: string) => assertion.includes("all 35 Swiggy MCP tools"))).toBe(true);
  });

  it("orchestrates Swiggy multi-turn cart state and voice/chat contracts", async () => {
    const { app } = createMealPilotServer();
    const planResponse = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/mcp/state-orchestrator").expect(200);
    const report = response.body.stateOrchestrator;

    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.totalScenarios).toBeGreaterThanOrEqual(6);
    expect(report.totalTurnBoundaries).toBeGreaterThanOrEqual(15);
    expect(report.refreshBeforeMutationCount).toBe(report.totalTurnBoundaries);
    expect(report.confirmationGateCount).toBeGreaterThanOrEqual(7);
    expect(report.serverModels.map((model: { server: string }) => model.server)).toEqual(["food", "instamart", "dineout"]);
    expect(
      report.serverModels.some(
        (model: { server: string; switchGuard: string; authoritativeReads: string[] }) =>
          model.server === "food" &&
          model.switchGuard.includes("restaurant") &&
          model.authoritativeReads.includes("get_food_cart"),
      ),
    ).toBe(true);
    expect(
      report.scenarios.map((scenario: { id: string }) => scenario.id),
    ).toEqual(expect.arrayContaining(["food_restaurant_switch", "instamart_address_switch", "dineout_slot_refresh", "combined_server_boundaries", "abandoned_cart_recovery"]));
    expect(report.scenarios.every((scenario: { unsafeMemoryRejected: boolean }) => scenario.unsafeMemoryRejected)).toBe(true);
    expect(
      report.scenarios.some((scenario: { id: string; turnBoundaries: Array<{ requiredRefreshTool: string; nextTool: string }> }) =>
        scenario.id === "combined_server_boundaries" &&
        scenario.turnBoundaries.some((turn) => turn.requiredRefreshTool === "get_food_cart" && turn.nextTool === "place_food_order"),
      ),
    ).toBe(true);
    const voice = report.surfaceContracts.find((contract: { surface: string }) => contract.surface === "voice");
    const chat = report.surfaceContracts.find((contract: { surface: string }) => contract.surface === "chat");
    expect(voice.maxPresentedItems).toBe(3);
    expect(voice.forbiddenContent).toEqual(expect.arrayContaining(["raw addressId", "restaurantId", "spinId"]));
    expect(chat.maxPresentedItems).toBe(8);
    expect(chat.widgetPolicy).toContain("semantic widget contracts");
    expect(report.assertions.some((assertion: string) => assertion.includes("authoritative Swiggy read"))).toBe(true);

    const rehearsalResponse = await request(app)
      .post("/api/mcp/state-orchestrator/rehearse-surface")
      .send({
        sessionId: planResponse.body.plan.id,
        scenarioId: "combined_server_boundaries",
        preferredSurface: "voice",
      })
      .expect(200);
    const rehearsal = rehearsalResponse.body.surfaceRehearsal;
    const voiceVariant = rehearsal.variants.find((variant: { surface: string }) => variant.surface === "voice");
    const chatVariant = rehearsal.variants.find((variant: { surface: string }) => variant.surface === "chat");
    const widgetVariant = rehearsal.variants.find((variant: { surface: string }) => variant.surface === "widget");

    expect(rehearsal.selectedScenarioId).toBe("combined_server_boundaries");
    expect(rehearsal.variants.map((variant: { surface: string }) => variant.surface)).toEqual(["chat", "voice", "widget"]);
    expect(voiceVariant.maxPresentedItems).toBe(3);
    expect(voiceVariant.presentedItems.length).toBeLessThanOrEqual(3);
    expect(chatVariant.presentedItems.length).toBeGreaterThanOrEqual(voiceVariant.presentedItems.length);
    expect(widgetVariant.widgetContract).toContain("fallback");
    expect(rehearsal.variants.every((variant: { commercialActionLocked: boolean }) => variant.commercialActionLocked)).toBe(true);
    expect(rehearsal.variants.every((variant: { internalIdsExposed: boolean }) => !variant.internalIdsExposed)).toBe(true);
    expect(
      rehearsal.telemetry.some(
        (field: { field: string; value: string }) => field.field === "commercial_action_executed" && field.value === "false",
      ),
    ).toBe(true);
  });

  it("returns Swiggy widget runtime contracts with secure fallbacks", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/mcp/widget-runtime").expect(200);
    const runtime = response.body.widgetRuntime;

    expect(runtime.score).toBeGreaterThanOrEqual(90);
    expect(runtime.totalSurfaces).toBeGreaterThanOrEqual(7);
    expect(runtime.fallbackReady).toBe(runtime.totalSurfaces);
    expect(runtime.hostedReady).toBe(0);
    expect(runtime.eventsHandled).toBeGreaterThanOrEqual(14);
    expect(runtime.totalActivationChecks).toBeGreaterThanOrEqual(16);
    expect(runtime.readyActivationChecks).toBeGreaterThanOrEqual(12);
    expect(runtime.externalActivationGates).toBeGreaterThanOrEqual(4);
    expect(runtime.optInHeader.status).toBe("external_gate");
    expect(runtime.surfaces.map((surface: { type: string }) => surface.type)).toEqual(
      expect.arrayContaining(["restaurant-card", "menu-item", "cart-widget", "product-card", "slot-picker"]),
    );
    expect(
      runtime.surfaces.some(
        (surface: { server: string; type: string; returnedByTools: string[] }) =>
          surface.server === "dineout" &&
          surface.type === "restaurant-card" &&
          surface.returnedByTools.includes("get_available_slots"),
      ),
    ).toBe(true);
    expect(
      runtime.surfaces.some(
        (surface: { server: string; returnedByTools: string[] }) =>
          surface.server === "food" && surface.returnedByTools.includes("search_restaurants"),
      ),
    ).toBe(true);
    expect(
      runtime.surfaces.some(
        (surface: { server: string; iframe: { allowTopNavigation: boolean; origin: string } }) =>
          surface.server === "instamart" &&
          surface.iframe.allowTopNavigation === false &&
          surface.iframe.origin === "https://mcp.swiggy.com",
      ),
    ).toBe(true);
    expect(
      runtime.bridgeRules.some((rule: { id: string; status: string }) => rule.id === "origin_verification" && rule.status === "ready"),
    ).toBe(true);
    expect(
      runtime.bridgeRules.some((rule: { id: string; rule: string }) => rule.id === "no_top_navigation" && rule.rule.includes("allow-top-navigation")),
    ).toBe(true);
    expect(
      runtime.activationChecklist.some(
        (check: { id: string; status: string }) => check.id === "hosted_iframe_urls" && check.status === "external_gate",
      ),
    ).toBe(true);
    expect(
      runtime.activationChecklist.some(
        (check: { id: string; status: string }) => check.id === "voice_exclusion" && check.status === "ready",
      ),
    ).toBe(true);
    expect(runtime.renderContracts.length).toBe(runtime.totalSurfaces);
    expect(
      runtime.renderContracts.some(
        (contract: { type: string; postMessageEvents: string[]; accessibility: string }) =>
          contract.type === "menu-item" &&
          contract.postMessageEvents.includes("menu-item.add-to-cart") &&
          contract.accessibility.includes("iframe title"),
      ),
    ).toBe(true);
    expect(runtime.sessionWidgets.length).toBeGreaterThanOrEqual(5);
    expect(runtime.sessionWidgets.every((widget: { status: string }) => widget.status === "semantic_fallback")).toBe(true);
  });

  it("returns a Swiggy Widget Experience Composer for premium placements and activation proof", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-widget-experience-composer").expect(200);
    const composer = response.body.widgetExperience;

    expect(composer.score).toBeGreaterThanOrEqual(90);
    expect(composer.totals.placements).toBeGreaterThanOrEqual(7);
    expect(composer.totals.semanticFallbacks + composer.totals.externalGates + composer.totals.ready).toBe(
      composer.totals.placements,
    );
    expect(composer.totals.toolsCovered).toBeGreaterThanOrEqual(18);
    expect(composer.totals.eventHandlers).toBeGreaterThanOrEqual(14);
    expect(composer.placements.map((placement: { sourceSurfaceId: string }) => placement.sourceSurfaceId)).toEqual(
      expect.arrayContaining(["food_restaurant_card", "food_cart_widget", "instamart_product_card", "dineout_slot_picker"]),
    );
    expect(
      composer.placements.some(
        (placement: { placement: string; eventHandlers: string[]; safetyGate: string }) =>
          placement.placement === "mobile_sheet" &&
          placement.eventHandlers.includes("slot.booking-requested") &&
          placement.safetyGate.includes("Refresh"),
      ),
    ).toBe(true);
    expect(composer.galleryStates.map((state: { viewport: string }) => state.viewport)).toEqual(
      expect.arrayContaining(["desktop", "tablet", "mobile", "voice", "review"]),
    );
    expect(composer.activationRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4]);
    expect(composer.externalGates.some((gate: string) => gate.includes("hosted iframe"))).toBe(true);
  });

  it("returns a Swiggy Hosted Widget Activation Center for iframe cutover readiness", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-hosted-widget-activation").expect(200);
    const activation = response.body.hostedWidgetActivation;

    expect(activation.score).toBeGreaterThanOrEqual(75);
    expect(activation.totals.surfaces).toBeGreaterThanOrEqual(7);
    expect(activation.totals.hostPolicies).toBe(6);
    expect(activation.totals.readyHostPolicies).toBeGreaterThanOrEqual(4);
    expect(activation.totals.handshakes).toBe(activation.totals.surfaces);
    expect(activation.totals.readyHandshakes).toBe(activation.totals.handshakes);
    expect(activation.totals.fallbackParity).toBe(activation.totals.surfaces);
    expect(activation.totals.readyFallbackParity).toBe(activation.totals.fallbackParity);
    expect(activation.totals.eventHandlers).toBeGreaterThanOrEqual(14);
    expect(activation.totals.swiggyTools).toBeGreaterThanOrEqual(18);
    expect(
      activation.hostPolicies.some(
        (policy: { id: string; status: string }) => policy.id === "approved_parent_origin" && policy.status === "external_gate",
      ),
    ).toBe(true);
    expect(
      activation.hostPolicies.some(
        (policy: { id: string; status: string }) => policy.id === "origin_verified_postmessage" && policy.status === "ready",
      ),
    ).toBe(true);
    expect(
      activation.handshakes.some(
        (handshake: { surfaceId: string; expectedOrigin: string; expectedEvents: string[]; status: string }) =>
          handshake.surfaceId === "food_cart_widget" &&
          handshake.expectedOrigin === "https://mcp.swiggy.com" &&
          handshake.expectedEvents.includes("cart.checkout-requested") &&
          handshake.status === "semantic_fallback",
      ),
    ).toBe(true);
    expect(
      activation.fallbackParity.some(
        (fallback: { surfaceId: string; hostedRequirement: string; voiceBehavior: string }) =>
          fallback.surfaceId === "dineout_slot_picker" &&
          fallback.hostedRequirement.includes("sandbox=") &&
          fallback.voiceBehavior.includes("Voice"),
      ),
    ).toBe(true);
    expect(activation.activationRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(
      activation.telemetryContract.some(
        (field: { field: string; value: string }) => field.field === "hosted_url_logged" && field.value === "false",
      ),
    ).toBe(true);
    expect(activation.reviewerPacket.to).toBe("builders@swiggy.in");
    expect(activation.externalGates.some((gate: string) => gate.includes("hosted iframe URLs"))).toBe(true);
  });

  it("returns a Swiggy Agent Experience Benchmark for premium journey quality", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/swiggy-agent-experience-benchmark").expect(200);
    const benchmark = response.body.agentBenchmark;

    expect(benchmark.score).toBeGreaterThanOrEqual(90);
    expect(benchmark.totals.journeys).toBeGreaterThanOrEqual(8);
    expect(benchmark.totals.bestInClassJourneys).toBeGreaterThanOrEqual(4);
    expect(benchmark.totals.toolsCovered).toBeGreaterThanOrEqual(25);
    expect(benchmark.totals.dimensions).toBe(6);
    expect(benchmark.totals.acceptanceCriteria).toBeGreaterThanOrEqual(30);
    expect(benchmark.dimensions.map((dimension: { id: string }) => dimension.id)).toEqual(
      expect.arrayContaining(["speed", "trust", "personalization", "multimodal", "resilience", "commercial_safety"]),
    );
    expect(
      benchmark.journeys.some(
        (journey: { servers: string[]; surfaces: string[]; swiggyTools: string[]; uxAcceptanceCriteria: string[] }) =>
          journey.servers.includes("combined") &&
          journey.surfaces.includes("widget") &&
          journey.swiggyTools.some((tool) => tool.endsWith("search_restaurants")) &&
          journey.uxAcceptanceCriteria.some((criteria) => criteria.includes("confirmation")),
      ),
    ).toBe(true);
    expect(benchmark.competitorMoats.map((moat: { id: string }) => moat.id)).toEqual(
      expect.arrayContaining(["all_server_context", "confirmation_first_luxury", "widget_ready_multimodal"]),
    );
    expect(benchmark.innovationBacklog.some((item: { owner: string; status: string }) => item.owner === "Swiggy" && item.status === "external_gate")).toBe(true);
    expect(benchmark.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns a Swiggy Private Pilot Control Room for real-user cohort readiness", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-private-pilot-control-room").expect(200);
    const pilot = response.body.privatePilot;

    expect(pilot.score).toBeGreaterThanOrEqual(80);
    expect(pilot.totals.cohorts).toBe(4);
    expect(pilot.totals.targetUsers).toBeGreaterThanOrEqual(30);
    expect(pilot.totals.assignedJourneys).toBeGreaterThanOrEqual(8);
    expect(pilot.totals.consentArtifacts).toBeGreaterThanOrEqual(10);
    expect(pilot.totals.telemetryMetrics).toBe(5);
    expect(pilot.totals.swiggyGates).toBeGreaterThanOrEqual(1);
    expect(pilot.cohorts.map((cohort: { id: string }) => cohort.id)).toEqual(
      expect.arrayContaining(["bengaluru_household_alpha", "voice_office_alpha", "dineout_social_alpha", "staging_seed_beta"]),
    );
    expect(
      pilot.launchGates.some(
        (gate: { id: string; owner: string; status: string }) =>
          gate.id === "swiggy_staging_credentials" && gate.owner === "Swiggy" && gate.status === "swiggy_gate",
      ),
    ).toBe(true);
    expect(
      pilot.telemetryMetrics.some(
        (metric: { id: string; telemetryField: string }) =>
          metric.id === "confirmation_clarity" && metric.telemetryField === "confirmation_clarity_score",
      ),
    ).toBe(true);
    expect(pilot.operatorRunbook.map((step: { sequence: number }) => step.sequence)).toEqual([1, 2, 3, 4]);
    expect(pilot.pilotPacket.handoffDraft).toContain("builders@swiggy.in");
    expect(pilot.externalGates.some((gate: string) => gate.includes("participant identities"))).toBe(true);
  });

  it("returns and executes a credential-aware Swiggy Staging Replay Center", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/swiggy-staging-replay").expect(200);
    const replay = response.body.stagingReplay;

    expect(replay.score).toBeGreaterThanOrEqual(80);
    expect(replay.mode).toBe("mock");
    expect(replay.activeTransport).toBe("local_mock");
    expect(replay.totals.totalTools).toBe(35);
    expect(replay.totals.waves).toBeGreaterThanOrEqual(8);
    expect(replay.totals.safeReplayTools).toBeGreaterThanOrEqual(18);
    expect(replay.totals.dryRunTools).toBe(replay.totals.safeReplayTools);
    expect(replay.totals.commercialTools).toBe(3);
    expect(replay.totals.supportTools).toBe(3);
    expect(replay.waveReadiness.map((wave: { id: string }) => wave.id)).toEqual(
      expect.arrayContaining(["read_tools", "cart_mutations", "commercial_actions", "support_reporting"]),
    );
    expect(
      replay.serverReadiness.some(
        (server: { server: string; status: string; firstSafeTool: string }) =>
          server.server === "food" && server.status === "dry_run" && server.firstSafeTool === "get_addresses",
      ),
    ).toBe(true);
    expect(
      replay.replayProbes.some(
        (probe: { server: string; tool: string; routeClass: string; status: string }) =>
          probe.server === "food" &&
          probe.tool === "get_addresses" &&
          probe.routeClass === "read" &&
          probe.status === "dry_run",
      ),
    ).toBe(true);
    expect(replay.handoffPacket.to).toBe("builders@swiggy.in");
    expect(replay.externalGates.some((gate: string) => gate.includes("staging OAuth credentials"))).toBe(true);
    expect(replay.assertions.some((assertion: string) => assertion.includes("Commercial actions remain blocked"))).toBe(true);

    const executed = await request(app)
      .post("/api/swiggy-staging-replay/run")
      .send({ server: "food", tool: "get_addresses" })
      .expect(200);
    expect(executed.body.replayExecution.decision).toBe("executed_mock");
    expect(executed.body.replayExecution.responseAvailable).toBe(true);
    expect(executed.body.replayExecution.responseHash).toMatch(/^[a-f0-9]{16}$/);
    expect(
      executed.body.replayExecution.telemetry.some(
        (field: { field: string; value: string }) => field.field === "raw_token_logged" && field.value === "false",
      ),
    ).toBe(true);

    const blocked = await request(app)
      .post("/api/swiggy-staging-replay/run")
      .send({ server: "food", tool: "place_food_order" })
      .expect(200);
    expect(blocked.body.replayExecution.decision).toBe("blocked_unsafe_tool");
    expect(blocked.body.replayExecution.responseAvailable).toBe(false);
    expect(blocked.body.replayExecution.assertions.some((assertion: string) => assertion.includes("blocked"))).toBe(true);
  });

  it("returns commercial action guards for confirmations and non-blind retries", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    const response = await request(app).get("/api/mcp/commercial-action-guard").expect(200);
    const guard = response.body.commercialActionGuard;

    expect(guard.score).toBeGreaterThanOrEqual(95);
    expect(guard.totalLanes).toBe(4);
    expect(guard.readyLanes).toBe(4);
    expect(guard.totalGuardrails).toBeGreaterThanOrEqual(8);
    expect(guard.readyGuardrails).toBeGreaterThanOrEqual(7);
    expect(guard.latestPlanProof.sessionId).toBe(created.body.plan.id);
    expect(guard.lanes.map((lane: { actionTool: string }) => lane.actionTool)).toEqual(
      expect.arrayContaining(["place_food_order", "checkout", "book_table", "place_food_order + book_table"]),
    );
    expect(
      guard.lanes.every(
        (lane: { confirmationRequired: boolean; nonIdempotent: boolean; retryPolicy: string }) =>
          lane.confirmationRequired === true &&
          lane.nonIdempotent === true &&
          lane.retryPolicy.toLowerCase().includes("retry"),
      ),
    ).toBe(true);
    expect(
      guard.lanes.some(
        (lane: { id: string; freshReadTool: string; verificationTool: string }) =>
          lane.id === "food_order" &&
          lane.freshReadTool === "get_food_cart" &&
          lane.verificationTool === "get_food_orders",
      ),
    ).toBe(true);
    expect(
      guard.lanes.some(
        (lane: { id: string; preflightChecks: string[] }) =>
          lane.id === "instamart_checkout" && lane.preflightChecks.some((check) => check.includes("Rs 99")),
      ),
    ).toBe(true);
    expect(
      guard.lanes.some(
        (lane: { id: string; confirmationCopy: { chat: string } }) =>
          lane.id === "dineout_booking" && lane.confirmationCopy.chat.includes("party size"),
      ),
    ).toBe(true);
    expect(
      guard.retryDrills.some(
        (drill: { laneId: string; verificationTool: string }) =>
          drill.laneId === "combined_evening" && drill.verificationTool.includes("get_booking_status"),
      ),
    ).toBe(true);
    expect(
      guard.guardrails.some(
        (item: { id: string; status: string }) => item.id === "no_blind_retry" && item.status === "ready",
      ),
    ).toBe(true);
    expect(
      guard.telemetryContract.some(
        (field: { field: string; required: boolean; redaction: string }) =>
          field.field === "confirmation_id" && field.required === true && field.redaction.includes("opaque"),
      ),
    ).toBe(true);
    expect(guard.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns an MCP backpressure governor for rate-limit and Retry-After readiness", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/mcp/backpressure-governor").expect(200);
    const governor = response.body.backpressureGovernor;

    expect(governor.score).toBeGreaterThanOrEqual(90);
    expect(governor.mode).toBe("v1_upstream_shedder");
    expect(governor.totalBuckets).toBeGreaterThanOrEqual(8);
    expect(governor.readyBuckets).toBeGreaterThanOrEqual(7);
    expect(governor.trackingMinIntervalSeconds).toBe(10);
    expect(governor.maxRetries).toBe(5);
    expect(governor.maxUserWaitMs).toBeLessThanOrEqual(30000);
    expect(governor.plannedHeaders).toEqual(
      expect.arrayContaining(["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"]),
    );
    expect(
      governor.buckets.some(
        (bucket: { id: string; plannedLimitPerMinute: number }) =>
          bucket.id === "write_tool_bucket" && bucket.plannedLimitPerMinute === 30,
      ),
    ).toBe(true);
    expect(
      governor.buckets.some(
        (bucket: { id: string; queueDiscipline: string }) =>
          bucket.id === "tracking_bucket" && bucket.queueDiscipline.includes("10 second"),
      ),
    ).toBe(true);
    expect(
      governor.rules.some((rule: { id: string; status: string }) => rule.id === "v1_upstream_shedder" && rule.status === "ready"),
    ).toBe(true);
    expect(
      governor.simulations.some(
        (simulation: { id: string; delayMs: number }) =>
          simulation.id === "planned_429_retry_after" && simulation.delayMs === 23000,
      ),
    ).toBe(true);
    expect(
      governor.simulations.some(
        (simulation: { id: string; status: string }) =>
          simulation.id === "background_batch_block" && simulation.status === "external_gate",
      ),
    ).toBe(true);
    expect(
      governor.telemetry.some(
        (field: { field: string; status: string }) => field.field === "x_ratelimit_remaining" && field.status === "ready",
      ),
    ).toBe(true);
    expect(governor.capacityEmail.to).toBe("builders@swiggy.in");
    expect(governor.externalGates.some((gate: string) => gate.includes("MCP-layer 429"))).toBe(true);
  });

  it("returns an MCP capability registry for tools, resources, prompts, and metadata", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/mcp/capability-registry").expect(200);
    const registry = response.body.registry;

    expect(registry.score).toBeGreaterThanOrEqual(90);
    expect(registry.scopes).toEqual(expect.arrayContaining(["mcp:tools", "mcp:resources", "mcp:prompts"]));
    expect(registry.serverEndpoints.map((endpoint: { server: string; tools: number }) => [endpoint.server, endpoint.tools])).toEqual([
      ["food", 14],
      ["instamart", 13],
      ["dineout", 8],
    ]);
    expect(registry.capabilityGroups.map((group: { kind: string }) => group.kind)).toEqual(
      expect.arrayContaining(["tools", "resources", "prompts", "metadata", "widgets", "auth"]),
    );
    expect(registry.resources.some((resource: { id: string }) => resource.id === "widget_registry")).toBe(true);
    expect(registry.prompts.some((prompt: { id: string }) => prompt.id === "combined_meal_agent")).toBe(true);
    expect(registry.metadata.some((metadata: { id: string }) => metadata.id === "protected_resource")).toBe(true);
    expect(registry.externalGates.some((gate: string) => gate.includes("prompts/list"))).toBe(true);
  });

  it("returns MCP Resource and Prompt Studio coverage for all Swiggy servers", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/mcp/resource-prompt-studio").expect(200);
    const studio = response.body.resourcePromptStudio;

    expect(studio.score).toBe(100);
    expect(studio.totalResources).toBe(6);
    expect(studio.readyResources).toBe(studio.totalResources);
    expect(studio.totalPrompts).toBe(6);
    expect(studio.readyPrompts).toBe(studio.totalPrompts);
    expect(studio.serverSummaries.map((summary: { server: string }) => summary.server)).toEqual([
      "food",
      "instamart",
      "dineout",
    ]);
    expect(
      studio.serverSummaries.every(
        (summary: { resources: number; prompts: number; status: string }) =>
          summary.resources === 2 && summary.prompts === 2 && summary.status === "ready",
      ),
    ).toBe(true);
    expect(studio.resources.map((resource: { uri: string }) => resource.uri)).toEqual(
      expect.arrayContaining([
        "swiggy://food/widgets",
        "swiggy://instamart/static-metadata",
        "swiggy://dineout/widgets",
      ]),
    );
    expect(
      studio.resources.some(
        (resource: { uri: string; sampleRead: { scope: string; registryKind: string } }) =>
          resource.uri === "swiggy://food/widgets" &&
          resource.sampleRead.scope === "mcp:resources" &&
          resource.sampleRead.registryKind === "widget_registry",
      ),
    ).toBe(true);
    expect(studio.prompts.map((prompt: { server: string }) => prompt.server)).toEqual(
      expect.arrayContaining(["food", "instamart", "dineout"]),
    );
    expect(
      studio.prompts.some(
        (prompt: { name: string; sampleMessages: Array<{ text: string }> }) =>
          prompt.name === "dineout_evening_planner" &&
          prompt.sampleMessages[0].text.includes("Dineout") &&
          prompt.sampleMessages[1].text.includes("guests"),
      ),
    ).toBe(true);
    expect(studio.smokeRequests.map((smoke: { method: string }) => smoke.method)).toEqual(
      expect.arrayContaining(["resources/list", "resources/read", "prompts/list", "prompts/get"]),
    );
    expect(studio.smokeRequests).toHaveLength(12);
    expect(studio.externalGates.some((gate: string) => gate.includes("Live resources/list"))).toBe(true);

    const resourceExecution = await request(app)
      .post("/api/mcp/resource-prompt-studio/execute")
      .send({
        server: "food",
        method: "resources/read",
        params: { uri: "swiggy://food/widgets" },
      })
      .expect(200);
    expect(resourceExecution.body.resourcePromptExecution.decision).toBe("executed");
    expect(resourceExecution.body.resourcePromptExecution.executedMethod).toBe("resources/read");
    expect(resourceExecution.body.resourcePromptExecution.responseSummary.kind).toBe("resource_read");
    expect(resourceExecution.body.resourcePromptExecution.responseSummary.available).toBe(true);
    expect(resourceExecution.body.resourcePromptExecution.telemetry.some((field: { field: string; value: string }) => field.field === "raw_resource_prompt_payload_retained" && field.value === "false")).toBe(true);

    const promptExecution = await request(app)
      .post("/api/mcp/resource-prompt-studio/execute")
      .send({
        server: "dineout",
        method: "prompts/get",
        params: { name: "dineout_evening_planner", arguments: { guests: 4, date: "saturday" } },
      })
      .expect(200);
    expect(promptExecution.body.resourcePromptExecution.decision).toBe("executed");
    expect(promptExecution.body.resourcePromptExecution.executedMethod).toBe("prompts/get");
    expect(promptExecution.body.resourcePromptExecution.responseSummary.kind).toBe("prompt_get");
    expect(promptExecution.body.resourcePromptExecution.responseSummary.itemCount).toBeGreaterThan(0);
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

    const transcriptResponse = await request(app).get(`/api/sessions/${sessionId}/staging-transcript`).expect(200);
    const transcript = transcriptResponse.body.transcript;
    expect(transcript.score).toBeGreaterThanOrEqual(90);
    expect(transcript.sessionId).toBe(sessionId);
    expect(transcript.totalEntries).toBeGreaterThanOrEqual(replay.body.replay.length);
    expect(transcript.coveredServers).toEqual(expect.arrayContaining(["food", "instamart", "dineout"]));
    expect(transcript.certificationWaves).toEqual(expect.arrayContaining(["read_tools", "cart_mutations", "commercial_actions"]));
    expect(transcript.jsonl).toContain("\"event\":\"mcp_tool_call\"");
    expect(transcript.markdown).toContain("MealPilot Staging Transcript");
    expect(transcript.redaction.piiFree).toBe(true);
    expect(transcript.redaction.redactedFields).toContain("access_token");
    expect(transcript.supportEnvelope.to).toBe("builders@swiggy.in");
    expect(
      transcript.entries.some(
        (entry: { tool: string; routeClass: string; retryPolicy: string }) =>
          entry.tool === "place_food_order" &&
          entry.routeClass === "commercial_action" &&
          entry.retryPolicy.includes("check order or booking status"),
      ),
    ).toBe(true);
    expect(transcript.readiness.some((item: { id: string; status: string }) => item.id === "staging_credentials" && item.status === "external_gate")).toBe(true);
    expect(transcript.files.some((item: { id: string }) => item.id === "support_brief")).toBe(true);

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

    const governance = await request(app).get("/api/data-governance-center").expect(200);
    const dataGovernance = governance.body.dataGovernance;
    expect(dataGovernance.score).toBeGreaterThanOrEqual(90);
    expect(dataGovernance.dataRole.swiggyRole).toBe("Data Fiduciary");
    expect(dataGovernance.dataRole.mealPilotRole).toBe("Data Processor");
    expect(dataGovernance.residency.boundary).toContain("India/Singapore");
    expect(dataGovernance.dataFlows.map((flow: { id: string }) => flow.id)).toEqual(
      expect.arrayContaining(["oauth_token", "support_payload", "telemetry_trace_context"]),
    );
    expect(dataGovernance.controls.map((control: { id: string }) => control.id)).toEqual(
      expect.arrayContaining([
        "purpose_limitation",
        "no_training_without_consent",
        "dsr_routing",
        "token_redaction",
        "signed_manifest_watch",
      ]),
    );
    expect(dataGovernance.retention.swiggyAuditLogDays).toBe(90);
    expect(dataGovernance.retention.compactionEndpoint).toBe("/api/storage/compact");
    expect(dataGovernance.securityContacts.some((contact: { contact: string }) => contact.contact === "security@swiggy.in")).toBe(
      true,
    );
    expect(dataGovernance.signedManifestReadiness.targetVersion).toBe("v1.2");
    expect(dataGovernance.externalGates.some((gate: string) => gate.includes("DPA"))).toBe(true);
    expect(dataGovernance.externalGates.some((gate: string) => gate.includes("Signed manifest"))).toBe(true);

    const proof = await request(app).get("/api/reviewer-proof").expect(200);
    expect(proof.body.proof.score).toBeGreaterThanOrEqual(80);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Widget contracts")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Widget Runtime Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Widget Experience Composer")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Agent Experience Benchmark")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Private Pilot Control Room")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Staging Cutover Rehearsal")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Staging Credential Drill Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Staging Transcript Export")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Builder Intake Command Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Traffic Readiness Plan")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "MCP Backpressure Governor")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Load Lab")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Quota Negotiation Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Operating Contract Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Offer Intelligence")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Order Lifecycle")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Location Trust")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Cart Mutation Workbench")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Discovery Freshness")).toBe(true);
    expect(
      proof.body.proof.artifacts.some(
        (artifact: { label: string; path: string }) =>
          artifact.label === "Swiggy Confirmation Command Center" &&
          artifact.path === "/api/swiggy-confirmation-command-center",
      ),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some(
        (artifact: { label: string; path: string }) =>
          artifact.label === "Swiggy Cancellation & Care Center" &&
          artifact.path === "/api/swiggy-cancellation-care-center",
      ),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some(
        (artifact: { label: string; path: string }) =>
          artifact.label === "Swiggy Dineout Precision Center" &&
          artifact.path === "/api/swiggy-dineout-precision-center",
      ),
    ).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "SLO Incident Command Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Data Governance Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Upstream Watch")).toBe(true);
    expect(
      proof.body.proof.artifacts.some(
        (artifact: { label: string; path: string }) =>
          artifact.label === "Swiggy Docs Twin Explorer" && artifact.path === "/api/swiggy-docs-twin-explorer",
      ),
    ).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Source Intelligence")).toBe(true);
    expect(
      proof.body.proof.artifacts.some(
        (artifact: { label: string; path: string }) =>
          artifact.label === "Swiggy Deep Site Map" && artifact.path === "/api/swiggy-deep-site-map",
      ),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some(
        (artifact: { label: string; path: string }) =>
          artifact.label === "Developer Quickstart Workbench" && artifact.path === "/api/swiggy-developer-quickstart",
      ),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some(
        (artifact: { label: string; path: string }) =>
          artifact.label === "CTA Execution Center" && artifact.path === "/api/swiggy-cta-execution-center",
      ),
    ).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Innovation Radar")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builders Launch Story Center")).toBe(true);
    expect(
      proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builders Module Intelligence Center"),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builders Journey Gate Center"),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builders Homepage Experience Center"),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builders Source Evolution Center"),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builders Live Source Resilience Center"),
    ).toBe(true);
    expect(
      proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builders Review Decision Center"),
    ).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Premium Concierge Itinerary")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Tool Contract Matrix")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Scenario Runner")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "State Orchestrator")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy OAuth Status")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Auth Lifecycle Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Resource & Prompt Studio")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Enterprise Delegated Auth Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Enterprise Platform Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Audit Ledger Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Submission Console")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "FAQ & Policy Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy FAQ Resolution Center")).toBe(
      true,
    );
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Growth Partnership Center")).toBe(true);
    expect(
      proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builder Talent Signal Center"),
    ).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Builders Conversion Center")).toBe(
      true,
    );
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Channel & Multimodal Studio")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Visual Dish Capture Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Voice Commerce Rehearsal Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Quality Loop Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Ritual Autopilot Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Payment Truth Center")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Meal Window Intelligence")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Swiggy Customization Studio")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Nutrition & Budget Intelligence")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Household Preference Graph")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Luxury Experience Workspace")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Reviewer Artifact Vault")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string; path: string }) => artifact.label === "Swiggy Access Evidence Matrix" && artifact.path === "/api/swiggy-access-evidence-matrix")).toBe(true);
    expect(proof.body.proof.artifacts.some((artifact: { label: string }) => artifact.label === "Visual QA Center")).toBe(true);
  });

  it("returns a traffic readiness and capacity plan for Swiggy launch", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/traffic-readiness-plan").expect(200);
    const plan = response.body.trafficReadiness;

    expect(plan.score).toBeGreaterThanOrEqual(90);
    expect(plan.projectedDailyToolCalls).toBeGreaterThan(0);
    expect(plan.peakQps).toBeLessThan(1);
    expect(plan.lanes.map((lane: { lane: string }) => lane.lane)).toEqual(
      expect.arrayContaining(["commercial", "tracking", "support", "auth"]),
    );
    expect(plan.retryAfterContract.ready).toBe(true);
    expect(plan.retryAfterContract.maxWallClockMs).toBeLessThanOrEqual(30000);
    expect(plan.notifications.some((item: { id: string; leadTimeDays: number }) => item.id === "major_traffic_event" && item.leadTimeDays === 7)).toBe(true);
    expect(plan.rollout.map((stage: { trafficPercent: number }) => stage.trafficPercent)).toEqual([1, 10, 50, 100]);
    expect(plan.capacityUpgradeEmail.to).toBe("builders@swiggy.in");
    expect(plan.externalGates.some((gate: string) => gate.toLowerCase().includes("staging"))).toBe(true);
  });

  it("returns a Swiggy Load Lab for synthetic launch-load simulation", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/swiggy-load-lab").expect(200);
    const loadLab = response.body.loadLab;

    expect(loadLab.score).toBeGreaterThanOrEqual(80);
    expect(loadLab.mode).toBe("mock");
    expect(loadLab.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
      ]),
    );
    expect(loadLab.totals.scenarios).toBe(4);
    expect(loadLab.totals.maxPeakQps).toBeGreaterThan(0);
    expect(loadLab.totals.maxToolCallsPerHour).toBeGreaterThan(0);
    expect(loadLab.totals.retryAfterReady).toBe(true);
    expect(loadLab.scenarios.some((scenario: { id: string; status: string; projected429sPerHour: number }) =>
      scenario.id === "campaign_launch_spike" &&
      scenario.status === "external_gate" &&
      scenario.projected429sPerHour > 0,
    )).toBe(true);
    expect(
      loadLab.lanes.some((lane: { id: string; status: string }) => lane.id === "background_jobs_disabled" && lane.status === "external_gate"),
    ).toBe(true);
    expect(loadLab.cohortRamp.map((stage: { trafficPercent: number }) => stage.trafficPercent)).toEqual([1, 10, 50, 100]);
    expect(loadLab.drills.map((drill: { id: string }) => drill.id)).toEqual(
      expect.arrayContaining(["retry_after_23s", "commercial_single_flight", "tracking_loop_shed"]),
    );
    expect(
      loadLab.operatorActions.some(
        (action: { id: string; owner: string; status: string }) =>
          action.id === "confirm_campaign_capacity" && action.owner === "Swiggy" && action.status === "external_gate",
      ),
    ).toBe(true);
    expect(loadLab.assertions.some((assertion: string) => assertion.includes("Commercial actions stay serialized"))).toBe(true);
    expect(loadLab.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns a Swiggy Quota Negotiation Center for capacity confirmation", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/swiggy-quota-negotiation-center").expect(200);
    const quota = response.body.quotaNegotiation;

    expect(quota.score).toBeGreaterThanOrEqual(70);
    expect(quota.totals.asks).toBe(5);
    expect(quota.totals.scenarios).toBe(4);
    expect(quota.totals.runbookSteps).toBe(4);
    expect(quota.totals.upgradeScenarios).toBeGreaterThanOrEqual(1);
    expect(quota.forecast.projectedDailyToolCalls).toBeGreaterThan(0);
    expect(quota.forecast.maxToolCallsPerHour).toBeGreaterThan(0);
    expect(quota.forecast.retryAfterReady).toBe(true);
    expect(quota.forecast.plannedHeaders).toEqual(
      expect.arrayContaining(["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"]),
    );
    expect(quota.asks.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([
        "developer_tier_confirmation",
        "campaign_capacity_gate",
        "retry_after_header_watch",
        "commercial_single_flight",
        "background_jobs_disabled",
      ]),
    );
    expect(
      quota.scenarios.some(
        (scenario: { id: string; quotaDecision: string; status: string }) =>
          scenario.id === "campaign_launch_spike" &&
          scenario.quotaDecision === "needs_upgrade" &&
          scenario.status === "swiggy_gate",
      ),
    ).toBe(true);
    expect(quota.capacityPacket.to).toBe("builders@swiggy.in");
    expect(quota.capacityPacket.safeFields).toEqual(expect.arrayContaining(["peak QPS", "Retry-After posture"]));
    expect(quota.runbook.some((step: { id: string; command: string }) => step.id === "open_quota_center" && step.command.includes("/api/swiggy-quota-negotiation-center"))).toBe(true);
    expect(quota.assertions.some((assertion: string) => assertion.includes("Rate Plan"))).toBe(true);
    expect(quota.externalGates.some((gate: string) => gate.includes("bespoke campaign"))).toBe(true);
  });

  it("returns Swiggy Offer Intelligence for coupon, deal, and value optimization", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/swiggy-offer-intelligence").expect(200);
    const intelligence = response.body.offerIntelligence;

    expect(intelligence.score).toBeGreaterThanOrEqual(80);
    expect(intelligence.mode).toBe("mock");
    expect(intelligence.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/docs/reference/food/fetch_food_coupons/",
        "https://mcp.swiggy.com/builders/docs/reference/food/apply_food_coupon/",
      ]),
    );
    expect(intelligence.totals.opportunities).toBeGreaterThanOrEqual(3);
    expect(intelligence.totals.estimatedSavings).toBeGreaterThan(0);
    expect(intelligence.totals.officialCouponTools).toBe(2);
    expect(intelligence.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining(["food_coupon_discovery", "food_coupon_application", "dineout_offer_discovery", "instamart_value_substitution"]),
    );
    expect(
      intelligence.opportunities.some(
        (opportunity: { server: string; applyMode: string }) =>
          opportunity.server === "food" && opportunity.applyMode === "confirm_then_apply",
      ),
    ).toBe(true);
    expect(
      intelligence.guardrails.some(
        (guardrail: { id: string; status: string }) => guardrail.id === "coupon_not_order" && guardrail.status === "ready",
      ),
    ).toBe(true);
    expect(intelligence.drills.map((drill: { id: string }) => drill.id)).toEqual(
      expect.arrayContaining(["expired_food_coupon", "coupon_changes_cart_total", "dineout_deal_disappears"]),
    );
    expect(
      intelligence.assertions.some((assertion: string) => assertion.includes("fetch_food_coupons before apply_food_coupon")),
    ).toBe(true);
    expect(intelligence.externalGates.some((gate: string) => gate.includes("Live Food coupon inventory"))).toBe(true);

    const decisionResponse = await request(app)
      .post("/api/swiggy-offer-intelligence/decide")
      .send({
        server: "food",
        offerType: "food_coupon",
        cartFresh: true,
        paymentMode: "cod",
        claimedSavings: 50,
        userConfirmed: true,
      })
      .expect(200);
    const decision = decisionResponse.body.offerDecision;

    expect(decision.decision).toBe("apply_after_confirmation");
    expect(decision.selectedLaneId).toBe("food_coupon_application");
    expect(decision.requiredTool).toContain("apply_food_coupon");
    expect(
      decision.telemetry.some(
        (item: { field: string; value: string }) => item.field === "cart_mutation_executed" && item.value === "false",
      ),
    ).toBe(true);
    expect(decision.assertions.some((assertion: string) => assertion.includes("do not execute cart mutations"))).toBe(true);
  });

  it("returns Swiggy Order Lifecycle for status, tracking, and non-blind recovery", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    await request(app).post("/api/confirm").send({ sessionId: created.body.plan.id, recommendationId: "rec_food" }).expect(200);

    const response = await request(app).get("/api/swiggy-order-lifecycle").expect(200);
    const lifecycle = response.body.orderLifecycle;

    expect(lifecycle.score).toBeGreaterThanOrEqual(80);
    expect(lifecycle.mode).toBe("mock");
    expect(lifecycle.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/docs/reference/food/get_food_orders/",
        "https://mcp.swiggy.com/builders/docs/reference/instamart/track_order/",
        "https://mcp.swiggy.com/builders/docs/reference/dineout/get_booking_status/",
      ]),
    );
    expect(lifecycle.totals.toolsCovered).toBeGreaterThanOrEqual(7);
    expect(lifecycle.totals.trackingCadenceSeconds).toBe(10);
    expect(lifecycle.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining(["food_order_lifecycle", "instamart_order_lifecycle", "dineout_booking_lifecycle", "combined_recovery_desk"]),
    );
    expect(
      lifecycle.timelines.some(
        (timeline: { server: string; state: string; status: string }) =>
          timeline.server === "food" && timeline.state === "preparing" && timeline.status === "ready",
      ),
    ).toBe(true);
    expect(lifecycle.recoveries.map((recovery: { id: string }) => recovery.id)).toEqual(
      expect.arrayContaining(["food_timeout_after_place", "instamart_checkout_uncertain", "dineout_booking_uncertain"]),
    );
    expect(
      lifecycle.recoveries.some((recovery: { blockedRetry: string }) => recovery.blockedRetry.includes("Blind place_food_order retry is blocked")),
    ).toBe(true);
    expect(lifecycle.telemetry.some((field: { field: string }) => field.field === "order_id_hash")).toBe(true);
    expect(lifecycle.assertions.some((assertion: string) => assertion.includes("never blindly retried"))).toBe(true);
    expect(lifecycle.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);

    const deferredProbe = await request(app)
      .post("/api/swiggy-order-lifecycle/probe")
      .send({
        server: "food",
        trigger: "user_tracking_refresh",
        currentStatus: "known_active",
        statusAgeSeconds: 3,
        orderOrBookingId: "food_order_123",
        userConfirmedRetry: false,
      })
      .expect(200);

    expect(deferredProbe.body.lifecycleProbe.decision).toBe("defer_tracking");
    expect(deferredProbe.body.lifecycleProbe.requiredTool).toBe("get_food_order_details then track_food_order");
    expect(deferredProbe.body.lifecycleProbe.blockedRetry).toBe(true);
    expect(deferredProbe.body.lifecycleProbe.input.identifierHash).toMatch(/^[a-f0-9]{16}$/);
    expect(
      deferredProbe.body.lifecycleProbe.telemetry.some(
        (field: { field: string; value: string }) => field.field === "raw_status_payload_retained" && field.value === "false",
      ),
    ).toBe(true);

    const retryProbe = await request(app)
      .post("/api/swiggy-order-lifecycle/probe")
      .send({
        server: "instamart",
        trigger: "user_retry_request",
        currentStatus: "not_found",
        statusAgeSeconds: 14,
        userConfirmedRetry: true,
      })
      .expect(200);

    expect(retryProbe.body.lifecycleProbe.decision).toBe("allow_retry_after_fresh_probe");
    expect(retryProbe.body.lifecycleProbe.blockedRetry).toBe(false);
  });

  it("returns Swiggy Location Trust for saved addresses, Dineout locations, and redaction", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/swiggy-location-trust").expect(200);
    const trust = response.body.locationTrust;

    expect(trust.score).toBeGreaterThanOrEqual(85);
    expect(trust.mode).toBe("mock");
    expect(trust.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/docs/reference/food/get_addresses/",
        "https://mcp.swiggy.com/builders/docs/reference/instamart/create_address/",
        "https://mcp.swiggy.com/builders/docs/reference/instamart/delete_address/",
        "https://mcp.swiggy.com/builders/docs/reference/dineout/get_saved_locations/",
      ]),
    );
    expect(trust.totals.toolsCovered).toBeGreaterThanOrEqual(4);
    expect(trust.totals.readyControls).toBeGreaterThanOrEqual(5);
    expect(trust.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "shared_address_read",
        "instamart_address_create",
        "instamart_address_delete",
        "dineout_saved_location",
      ]),
    );
    expect(
      trust.controls.some(
        (control: { id: string; status: string }) => control.id === "raw_address_redaction" && control.status === "ready",
      ),
    ).toBe(true);
    expect(
      trust.controls.some(
        (control: { id: string; status: string }) => control.id === "address_switch_refresh" && control.status === "ready",
      ),
    ).toBe(true);
    expect(trust.scenarios.map((scenario: { id: string }) => scenario.id)).toEqual(
      expect.arrayContaining(["delete_saved_address", "temporary_guest_location"]),
    );
    expect(trust.telemetry.some((field: { field: string; status: string }) => field.field === "address_id_hash" && field.status === "ready")).toBe(
      true,
    );
    expect(trust.assertions.some((assertion: string) => assertion.includes("Raw addresses never leave"))).toBe(true);
    expect(trust.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);

    const decisionResponse = await request(app)
      .post("/api/swiggy-location-trust/select")
      .send({
        server: "food",
        sourceTool: "get_addresses",
        selectedLabel: "Home",
        userConfirmed: true,
        downstreamIntent: "cart_checkout",
        previousContextFresh: false,
      })
      .expect(200);

    const decision = decisionResponse.body.locationDecision;
    expect(decision.decision).toBe("block_until_refresh");
    expect(decision.requiredNextTool).toBe("get_food_cart");
    expect(decision.invalidatedSurfaces).toEqual(expect.arrayContaining(["food_cart", "food_coupons"]));
    expect(decision.selectedLocationHash).toMatch(/^[a-f0-9]{16}$/);
    expect(decision.telemetry.some((field: { field: string; value: string }) => field.field === "raw_address_retained" && field.value === "false")).toBe(
      true,
    );
    expect(decision.assertions.some((assertion: string) => assertion.includes("never logs raw address"))).toBe(true);
  });

  it("returns Swiggy Cart Mutation Workbench for cart readback and checkout-safe mutations", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/swiggy-cart-mutation-workbench").expect(200);
    const cart = response.body.cartMutation;

    expect(cart.score).toBeGreaterThanOrEqual(85);
    expect(cart.mode).toBe("mock");
    expect(cart.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/docs/reference/food/get_food_cart/",
        "https://mcp.swiggy.com/builders/docs/reference/food/update_food_cart/",
        "https://mcp.swiggy.com/builders/docs/reference/instamart/get_cart/",
        "https://mcp.swiggy.com/builders/docs/reference/instamart/update_cart/",
        "https://mcp.swiggy.com/builders/docs/reference/dineout/create_cart/",
      ]),
    );
    expect(cart.totals.toolsCovered).toBeGreaterThanOrEqual(8);
    expect(cart.totals.readbackLanes).toBeGreaterThanOrEqual(4);
    expect(cart.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining(["food_cart_readback", "instamart_replace_cart", "dineout_cart_gate", "cross_server_cart_preflight"]),
    );
    expect(
      cart.guardrails.some(
        (guardrail: { id: string; status: string }) => guardrail.id === "post_mutation_readback" && guardrail.status === "ready",
      ),
    ).toBe(true);
    expect(
      cart.guardrails.some(
        (guardrail: { id: string; status: string }) => guardrail.id === "payment_method_truth" && guardrail.status === "ready",
      ),
    ).toBe(true);
    expect(cart.scenarios.map((scenario: { id: string }) => scenario.id)).toEqual(
      expect.arrayContaining(["food_customized_quantity", "instamart_address_switch", "cart_uncertain_write"]),
    );
    expect(cart.telemetry.some((field: { field: string }) => field.field === "cart_id_hash")).toBe(true);
    expect(cart.assertions.some((assertion: string) => assertion.includes("update_food_cart is followed by get_food_cart"))).toBe(true);
    expect(cart.externalGates.some((gate: string) => gate.includes("Staging credentials"))).toBe(true);

    const mutationResponse = await request(app)
      .post("/api/swiggy-cart-mutation-workbench/mutate")
      .send({
        server: "food",
        mutationTool: "update_food_cart",
        toolArguments: { restaurantId: "rest_green_bowl", itemId: "paneer_bowl", quantity: 1 },
        contextFresh: true,
        userConfirmed: true,
        commercialActionRequested: false,
      })
      .expect(200);
    const mutation = mutationResponse.body.cartMutation;
    expect(mutation.decision).toBe("mutated_with_readback");
    expect(mutation.executedTools).toEqual(["update_food_cart", "get_food_cart"]);
    expect(mutation.requiredReadbackTool).toBe("get_food_cart");
    expect(mutation.readback.available).toBe(true);
    expect(mutation.readback.paymentMethodLabel).toBe("COD");
    expect(
      mutation.telemetry.some((field: { field: string; value: string }) => field.field === "commercial_action_executed" && field.value === "false"),
    ).toBe(true);
    expect(mutation.assertions.some((assertion: string) => assertion.includes("never calls place_food_order"))).toBe(true);

    const staleResponse = await request(app)
      .post("/api/swiggy-cart-mutation-workbench/mutate")
      .send({
        server: "instamart",
        mutationTool: "update_cart",
        toolArguments: { items: [{ spinId: "spin_moong_dal", quantity: 1 }] },
        contextFresh: false,
        userConfirmed: true,
        commercialActionRequested: false,
      })
      .expect(200);
    expect(staleResponse.body.cartMutation.decision).toBe("blocked_until_refresh");
    expect(staleResponse.body.cartMutation.executedTools).toEqual([]);

    const commercialResponse = await request(app)
      .post("/api/swiggy-cart-mutation-workbench/mutate")
      .send({
        server: "food",
        mutationTool: "update_food_cart",
        contextFresh: true,
        userConfirmed: true,
        commercialActionRequested: true,
      })
      .expect(200);
    expect(commercialResponse.body.cartMutation.decision).toBe("blocked_commercial_action");
    expect(commercialResponse.body.cartMutation.executedTools).toEqual([]);
  });

  it("returns Swiggy Discovery Freshness for search, menu, product, and slot truth", async () => {
    const { app } = createMealPilotServer();
    await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/swiggy-discovery-freshness").expect(200);
    const freshness = response.body.discoveryFreshness;

    expect(freshness.score).toBeGreaterThanOrEqual(85);
    expect(freshness.mode).toBe("mock");
    expect(freshness.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/docs/reference/food/search_restaurants/",
        "https://mcp.swiggy.com/builders/docs/reference/food/search_menu/",
        "https://mcp.swiggy.com/builders/docs/reference/food/get_restaurant_menu/",
        "https://mcp.swiggy.com/builders/docs/reference/instamart/search_products/",
        "https://mcp.swiggy.com/builders/docs/reference/instamart/your_go_to_items/",
        "https://mcp.swiggy.com/builders/docs/reference/dineout/search_restaurants_dineout/",
        "https://mcp.swiggy.com/builders/docs/reference/dineout/get_available_slots/",
      ]),
    );
    expect(freshness.totals.toolsCovered).toBeGreaterThanOrEqual(8);
    expect(freshness.totals.readyControls).toBe(5);
    expect(freshness.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining(["food_menu_detail", "instamart_product_search", "dineout_search_and_details", "dineout_slot_freshness"]),
    );
    expect(
      freshness.controls.some(
        (control: { id: string; status: string }) => control.id === "variant_truth" && control.status === "ready",
      ),
    ).toBe(true);
    expect(
      freshness.controls.some(
        (control: { id: string; status: string }) => control.id === "coordinate_consistency" && control.status === "ready",
      ),
    ).toBe(true);
    expect(freshness.scenarios.map((scenario: { id: string }) => scenario.id)).toEqual(
      expect.arrayContaining(["food_more_menu_options", "instamart_variant_choice", "dineout_slot_selection"]),
    );
    expect(freshness.telemetry.some((field: { field: string }) => field.field === "result_id_hash")).toBe(true);
    expect(freshness.assertions.some((assertion: string) => assertion.includes("search_menu before update_food_cart"))).toBe(true);
    expect(freshness.externalGates.some((gate: string) => gate.includes("Staging credentials"))).toBe(true);

    const resolutionResponse = await request(app)
      .post("/api/swiggy-discovery-freshness/resolve")
      .send({
        server: "instamart",
        discoveryTool: "search_products",
        toolArguments: { query: "tofu", addressId: "addr_home_001" },
        contextFresh: true,
        userSelectedResult: false,
        downstreamIntent: "cart_mutation",
      })
      .expect(200);
    const resolution = resolutionResponse.body.discoveryResolution;
    expect(resolution.decision).toBe("pause_for_selection");
    expect(resolution.selectedLaneId).toBe("instamart_product_search");
    expect(resolution.resultSummary.available).toBe(true);
    expect(resolution.nextRequiredTool).toContain("select variant");
    expect(
      resolution.telemetry.some((field: { field: string; value: string }) => field.field === "cart_mutation_executed" && field.value === "false"),
    ).toBe(true);
    expect(resolution.assertions.some((assertion: string) => assertion.includes("read-only"))).toBe(true);

    const staleResolution = await request(app)
      .post("/api/swiggy-discovery-freshness/resolve")
      .send({
        server: "food",
        discoveryTool: "search_menu",
        toolArguments: { query: "paneer" },
        contextFresh: false,
        userSelectedResult: true,
        downstreamIntent: "cart_mutation",
      })
      .expect(200);
    expect(staleResolution.body.discoveryResolution.decision).toBe("blocked_until_refresh");
    expect(staleResolution.body.discoveryResolution.invalidatedSurfaces).toEqual(expect.arrayContaining(["cart", "coupon", "confirmation"]));
  });

  it("returns Swiggy Confirmation Command Center for separate protected action confirmations", async () => {
    const { app } = createMealPilotServer();

    const response = await request(app).get("/api/swiggy-confirmation-command-center").expect(200);
    const report = response.body.confirmationCommandCenter;

    expect(response.body).toEqual({ confirmationCommandCenter: report });
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.totals.protectedActions).toBeGreaterThanOrEqual(3);
    expect(report.totals.toolsCovered).toBeGreaterThanOrEqual(10);
    expect(report.totals.externalGates).toBeGreaterThanOrEqual(1);
    expect(["place_food_order", "checkout", "book_table"].every((tool) => JSON.stringify(report.lanes).includes(tool))).toBe(true);
    const checklistText = JSON.stringify(report.checklist).toLowerCase();
    expect(checklistText).toContain("separate confirmations");
    expect(checklistText).toContain("post-action status probe");
    expect(report.assertions.some((assertion: string) => assertion.includes("fresh read"))).toBe(true);
    expect(report.assertions.some((assertion: string) => assertion.includes("separate confirmations"))).toBe(true);

    const executionResponse = await request(app)
      .post("/api/swiggy-confirmation-command-center/execute")
      .send({
        server: "food",
        actionTool: "place_food_order",
        preflightArguments: { restaurantId: "rest_green_bowl" },
        actionArguments: { addressId: "addr_home_001", paymentMethod: "COD" },
        statusProbeArguments: { limit: 5 },
        contextFresh: true,
        userConfirmed: true,
        separateConfirmation: true,
        paymentOrFreeTruthAcknowledged: true,
        simulateAmbiguousResult: true,
      })
      .expect(200);
    const execution = executionResponse.body.confirmationExecution;
    expect(execution.decision).toBe("resolved_after_status_probe");
    expect(execution.selectedLaneId).toBe("food_order_confirmation");
    expect(execution.executedTools).toEqual(["get_food_cart", "place_food_order", "get_food_orders"]);
    expect(execution.preflightSummary.available).toBe(true);
    expect(execution.statusProbeSummary.attempted).toBe(true);
    expect(
      execution.telemetry.some((field: { field: string; value: string }) => field.field === "blind_retry_executed" && field.value === "false"),
    ).toBe(true);
    expect(execution.assertions.some((assertion: string) => assertion.includes("separate explicit user confirmation"))).toBe(true);

    const unconfirmedResponse = await request(app)
      .post("/api/swiggy-confirmation-command-center/execute")
      .send({
        server: "instamart",
        actionTool: "checkout",
        contextFresh: true,
        userConfirmed: false,
        separateConfirmation: false,
        paymentOrFreeTruthAcknowledged: true,
      })
      .expect(200);
    expect(unconfirmedResponse.body.confirmationExecution.decision).toBe("awaiting_confirmation");
    expect(unconfirmedResponse.body.confirmationExecution.executedTools).toEqual([]);

    const paidDineoutResponse = await request(app)
      .post("/api/swiggy-confirmation-command-center/execute")
      .send({
        server: "dineout",
        actionTool: "book_table",
        contextFresh: true,
        userConfirmed: true,
        separateConfirmation: true,
        paymentOrFreeTruthAcknowledged: true,
        dineoutFreeBooking: false,
      })
      .expect(200);
    expect(paidDineoutResponse.body.confirmationExecution.decision).toBe("blocked_paid_dineout");
    expect(paidDineoutResponse.body.confirmationExecution.executedTools).toEqual([]);
  });

  it("returns Swiggy Cancellation and Care Center for no-tool cancellation and report_error routing", async () => {
    const { app } = createMealPilotServer();

    const response = await request(app).get("/api/swiggy-cancellation-care-center").expect(200);
    const report = response.body.cancellationCareCenter;

    expect(response.body).toEqual({ cancellationCareCenter: report });
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.customerCarePhone).toBe("080-67466729");
    expect(report.totals.reportErrorTools).toBe(3);
    expect(report.totals.noToolCancellationGuards).toBeGreaterThanOrEqual(2);
    expect(report.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining(["food_cancel_request", "instamart_cancel_request", "dineout_booking_management"]),
    );
    expect(JSON.stringify(report.controls).toLowerCase()).toContain("no-tool cancellation");
    expect(JSON.stringify(report.lanes)).toContain("report_error");
    expect(report.assertions.some((assertion: string) => assertion.includes("never call an MCP cancellation tool"))).toBe(true);
    expect(report.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns Swiggy Dineout Precision Center for free bookings and bill-payment carts", async () => {
    const { app } = createMealPilotServer();

    const response = await request(app).get("/api/swiggy-dineout-precision-center").expect(200);
    const report = response.body.dineoutPrecisionCenter;

    expect(response.body).toEqual({ dineoutPrecisionCenter: report });
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.totals.toolsCovered).toBeGreaterThanOrEqual(7);
    expect(report.totals.freeBookingGuards).toBeGreaterThanOrEqual(1);
    expect(report.totals.billPaymentLanes).toBeGreaterThanOrEqual(1);
    expect(report.lanes.map((lane: { id: string }) => lane.id)).toEqual(
      expect.arrayContaining([
        "free_reservation_direct_booking",
        "standalone_booking_cart",
        "bill_payment_cart",
        "paid_deal_rejection",
        "post_booking_status",
      ]),
    );
    expect(JSON.stringify(report.guards)).toContain("isFree=true");
    expect(
      report.lanes.some(
        (lane: { id: string; cartType: string; requiredFields: string[] }) =>
          lane.id === "bill_payment_cart" &&
          lane.cartType === "DINEOUT" &&
          lane.requiredFields.includes("billAmount"),
      ),
    ).toBe(true);
    expect(report.assertions.some((assertion: string) => assertion.includes("bill-payment cart creation"))).toBe(true);
    expect(report.externalGates.some((gate: string) => gate.includes("staging credentials"))).toBe(true);
  });

  it("returns SLO and incident command evidence for Swiggy operations", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    await request(app).post("/api/confirm").send({ sessionId: created.body.plan.id, recommendationId: "rec_food" }).expect(200);

    const response = await request(app).get("/api/slo-incident-command").expect(200);
    const slo = response.body.sloIncident;

    expect(slo.score).toBeGreaterThanOrEqual(90);
    expect(slo.uptimeTargets.map((target: { id: string }) => target.id)).toEqual(
      expect.arrayContaining(["production_mcp", "oauth", "staging"]),
    );
    expect(slo.uptimeTargets.some((target: { target: string }) => target.target.includes("99.9%"))).toBe(true);
    expect(slo.latencyTargets.map((target: { id: string }) => target.id)).toEqual(
      expect.arrayContaining(["read_tools", "write_tools", "commercial_actions"]),
    );
    expect(slo.incidentComms.map((item: { severity: string }) => item.severity)).toEqual(["S0", "S1", "S2", "S3"]);
    expect(slo.maintenance.noticeHours).toBe(72);
    expect(slo.maintenance.blackoutWindowsIst).toEqual(expect.arrayContaining(["12:00-14:00", "19:00-22:00"]));
    expect(slo.statusPage.url).toContain("status.swiggy.com/mcp");
    expect(slo.remediation.contact).toBe("builders@swiggy.in");
    expect(slo.externalGates.some((gate: string) => gate.includes("status page"))).toBe(true);
  });

  it("returns a production launch bundle for Swiggy Builder Access handoff", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);

    const response = await request(app).get("/api/production-launch-bundle").expect(200);
    const bundle = response.body.launchBundle;

    expect(bundle.score).toBeGreaterThanOrEqual(70);
    expect(bundle.readinessLabel).toBe("local_review_ready");
    expect(bundle.requestedServers).toEqual(["food", "instamart", "dineout"]);
    expect(bundle.artifacts.map((artifact: { label: string }) => artifact.label)).toEqual(
      expect.arrayContaining([
        "MCP Tool Lab",
        "Runtime Telemetry",
        "Audit Ledger Center",
        "Submission Console",
        "FAQ & Policy Center",
        "Swiggy FAQ Resolution Center",
        "Growth Partnership Center",
        "Swiggy Builder Talent Signal Center",
        "Swiggy Builders Conversion Center",
        "Channel & Multimodal Studio",
        "Swiggy Visual Dish Capture Center",
        "Swiggy Voice Commerce Rehearsal Center",
        "Swiggy Quality Loop Center",
        "Swiggy Ritual Autopilot Center",
        "Swiggy Payment Truth Center",
        "Swiggy Meal Window Intelligence",
        "Swiggy Customization Studio",
        "Nutrition & Budget Intelligence",
        "Household Preference Graph",
        "Luxury Experience Workspace",
        "Reviewer Artifact Vault",
        "Swiggy Access Evidence Matrix",
        "Visual QA Center",
        "Swiggy Website Atlas",
        "Swiggy Builders Launch Story Center",
        "Swiggy Builders Module Intelligence Center",
        "Swiggy Builders Journey Gate Center",
        "Swiggy Builders Homepage Experience Center",
        "Swiggy Builders Source Evolution Center",
        "Swiggy Builders Live Source Resilience Center",
        "Swiggy Builders Review Decision Center",
        "Swiggy Operating Contract Center",
        "Swiggy Deep Site Map",
        "Developer Quickstart Workbench",
        "CTA Execution Center",
        "Builder Intake Command Center",
        "Swiggy Docs Coverage",
        "Swiggy Docs Twin Explorer",
        "Swiggy Upstream Watch",
        "Swiggy Source Intelligence",
        "Swiggy Innovation Radar",
        "AI Client Connect Kit",
        "Brand Compliance Kit",
        "Data Governance Center",
        "Swiggy OAuth Status",
        "Swiggy Auth Lifecycle Center",
        "Sandbox Credential Workbench",
        "Enterprise Delegated Auth Center",
        "Swiggy Enterprise Platform Center",
        "Traffic Readiness Plan",
        "MCP Backpressure Governor",
        "Swiggy Load Lab",
        "Swiggy Quota Negotiation Center",
        "Swiggy Offer Intelligence",
        "Swiggy Order Lifecycle",
        "Swiggy Location Trust",
        "Swiggy Cart Mutation Workbench",
        "Swiggy Discovery Freshness",
        "Swiggy Confirmation Command Center",
        "Swiggy Cancellation & Care Center",
        "Swiggy Dineout Precision Center",
        "SLO Incident Command Center",
        "Swiggy Journey Compiler",
        "Swiggy Access Dossier",
        "Premium Use Case Studio",
        "Premium Concierge Itinerary",
        "Tool Contract Matrix",
        "Scenario Runner",
        "State Orchestrator",
        "Resource & Prompt Studio",
        "Widget Runtime Center",
        "Swiggy Widget Experience Composer",
        "Swiggy Hosted Widget Activation Center",
        "Swiggy Agent Experience Benchmark",
        "Swiggy Private Pilot Control Room",
        "Swiggy Staging Replay Center",
        "Staging Cutover Rehearsal",
        "Swiggy Staging Credential Drill Center",
        "Swiggy Live Signal Calibration Center",
        "Staging Transcript Export",
      ]),
    );
    expect(bundle.artifacts.some((artifact: { path: string }) => artifact.path === `/api/sessions/${created.body.plan.id}`)).toBe(true);
    expect(bundle.accessApplication.some((field: { label: string }) => field.label === "Redirect URIs")).toBe(true);
    expect(
      bundle.goLiveGates.some(
        (gate: { label: string; status: string }) => gate.label.includes("48 hours") && gate.status === "external_gate",
      ),
    ).toBe(true);
    expect(bundle.goLiveGates.some((gate: { label: string }) => gate.label.includes("Data governance"))).toBe(true);
    expect(bundle.goLiveGates.some((gate: { label: string; status: string }) => gate.label.includes("delegated-auth") && gate.status === "external_gate")).toBe(true);
    expect(bundle.handoffEmail.body).toContain("/api/enterprise-delegated-auth");
    expect(bundle.handoffEmail.body).toContain("/api/enterprise-platform-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-builders-launch-story");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-builders-module-intelligence");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-builders-source-evolution");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-builders-live-source-resilience");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-builders-review-decision");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-operating-contract-center");
    expect(bundle.handoffEmail.body).toContain("/api/auth/swiggy/status");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-auth-lifecycle-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-builder-intake");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-faq-policy");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-faq-resolution-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-growth-partnership");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-talent-signal-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-conversion-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-benefits-activation-center");
    expect(bundle.handoffEmail.body).toContain("/api/channel-multimodal-studio");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-visual-dish-capture");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-voice-commerce-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-quality-loop-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-ritual-autopilot-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-payment-truth-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-meal-window-intelligence");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-customization-studio");
    expect(bundle.handoffEmail.body).toContain("/api/nutrition-budget-intelligence");
    expect(bundle.handoffEmail.body).toContain("/api/household-preference-graph");
    expect(bundle.handoffEmail.body).toContain("/api/luxury-experience-workspace");
    expect(bundle.handoffEmail.body).toContain("/api/reviewer-artifact-vault");
    expect(bundle.handoffEmail.body).toContain("/api/visual-qa-center");
    expect(bundle.handoffEmail.body).toContain("/api/submission-console");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-docs-twin-explorer");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-upstream-watch");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-source-intelligence");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-innovation-radar");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-developer-quickstart");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-cta-execution-center");
    expect(bundle.handoffEmail.body).toContain("/api/premium-concierge-itinerary");
    expect(bundle.handoffEmail.body).toContain("/api/mcp/tool-contract-matrix");
    expect(bundle.handoffEmail.body).toContain("/api/mcp/scenario-runner");
    expect(bundle.handoffEmail.body).toContain("/api/mcp/state-orchestrator");
    expect(bundle.handoffEmail.body).toContain("/api/mcp/resource-prompt-studio");
    expect(bundle.handoffEmail.body).toContain("/api/mcp/widget-runtime");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-widget-experience-composer");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-hosted-widget-activation");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-agent-experience-benchmark");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-private-pilot-control-room");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-staging-replay");
    expect(bundle.handoffEmail.body).toContain("/api/mcp/backpressure-governor");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-load-lab");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-quota-negotiation-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-offer-intelligence");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-order-lifecycle");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-location-trust");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-cart-mutation-workbench");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-discovery-freshness");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-confirmation-command-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-cancellation-care-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-dineout-precision-center");
    expect(bundle.handoffEmail.body).toContain("/api/mcp/staging-cutover");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-staging-credential-drill");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-credential-handoff-center");
    expect(bundle.handoffEmail.body).toContain("/api/swiggy-live-signal-calibration");
    expect(bundle.handoffEmail.body).toContain("/api/audit-ledger");
    expect(bundle.commands.some((command: { command: string }) => command.command.includes("npm run verify:production"))).toBe(
      true,
    );
    expect(bundle.handoffEmail.to).toBe("builders@swiggy.in");
  });

  it("returns executable resilience drills and support runbook evidence", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    await request(app).post("/api/confirm").send({ sessionId: created.body.plan.id, recommendationId: "rec_food" }).expect(200);

    const resilience = await request(app).get("/api/resilience").expect(200);

    expect(resilience.body.drills.length).toBeGreaterThanOrEqual(5);
    expect(resilience.body.drills.some((drill: { id: string }) => drill.id === "non_idempotent_check_then_retry")).toBe(true);
    expect(resilience.body.runbook.nonBlindRetryTools).toContain("place_food_order");
    expect(resilience.body.runbook.supportPayload.latestSessionId).toBe(created.body.plan.id);
  });

  it("returns Swiggy error envelope, retry, and planned code intelligence", async () => {
    const { app } = createMealPilotServer();
    const response = await request(app).get("/api/error-intelligence").expect(200);
    const report = response.body.errorIntelligence;

    expect(report.score).toBe(100);
    expect(report.envelope.success).toBe(false);
    expect(report.envelope.error.message).toContain("human-readable");
    expect(report.buckets.map((bucket: { id: string }) => bucket.id)).toEqual(
      expect.arrayContaining(["auth_failure", "bad_input", "upstream_timeout", "domain_failure", "internal_error"]),
    );
    expect(
      report.plannedCoreCodes.some((code: { code: string; status: string }) => code.code === "RATE_LIMITED" && code.status === "planned"),
    ).toBe(true);
    expect(
      report.domainCodes.some((code: { server: string; code: string; terminal: boolean }) => code.server === "food" && code.code === "RESTAURANT_CLOSED" && code.terminal),
    ).toBe(true);
    expect(report.retryPolicy.maxRetries).toBe(5);
    expect(report.retryPolicy.nonBlindRetryTools).toEqual(["place_food_order", "checkout", "book_table"]);
    expect(report.assertions.some((assertion: string) => assertion.includes("never blind-retry"))).toBe(true);

    const auth = await request(app)
      .post("/api/error-intelligence/classify")
      .send({ server: "food", tool: "place_food_order", httpStatus: 401, jsonRpcCode: -32001, success: false, message: "Token expired", routeClass: "commercial_action" })
      .expect(200);
    expect(auth.body.classification.decision).toBe("reauth");
    expect(auth.body.classification.maxRetries).toBe(0);
    expect(auth.body.classification.supportRecommended).toBe(false);

    const timeout = await request(app)
      .post("/api/error-intelligence/classify")
      .send({ server: "food", tool: "search_restaurants", httpStatus: 504, success: false, message: "upstream timeout", routeClass: "read" })
      .expect(200);
    expect(timeout.body.classification.decision).toBe("retry_safe_step");
    expect(timeout.body.classification.retryScheduleMs).toEqual([500, 1000, 2000, 4000, 8000]);
    expect(timeout.body.classification.supportRecommended).toBe(true);

    const commercial = await request(app)
      .post("/api/error-intelligence/classify")
      .send({ server: "food", tool: "place_food_order", httpStatus: 504, success: false, message: "placement timed out", routeClass: "commercial_action" })
      .expect(200);
    expect(commercial.body.classification.decision).toBe("block_blind_retry");
    expect(commercial.body.classification.requiredStatusProbe).toBe("get_food_orders");
    expect(commercial.body.classification.riskFlags).toContain("commercial_action_status_probe_required");

    const domain = await request(app)
      .post("/api/error-intelligence/classify")
      .send({ server: "food", tool: "update_food_cart", httpStatus: 200, success: false, message: "Item unavailable", symbolicCode: "ITEM_UNAVAILABLE", routeClass: "cart_mutation" })
      .expect(200);
    expect(domain.body.classification.decision).toBe("surface_domain_failure");
    expect(domain.body.classification.selectedBucketId).toBe("domain_failure");
    expect(domain.body.classification.riskFlags).toContain("domain_failure_not_auto_retried");

    await request(app)
      .post("/api/error-intelligence/classify")
      .send({ server: "food", tool: "search_restaurants", httpStatus: 200, success: true, message: "ok" })
      .expect(400);
  });

  it("returns trace spans, log contract, and route optimization evidence", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);

    const observability = await request(app).get("/api/observability/traces").expect(200);
    expect(observability.body.observability.score).toBeGreaterThanOrEqual(90);
    expect(observability.body.observability.traces[0].sessionId).toBe(created.body.plan.id);
    expect(observability.body.observability.traces[0].spans.some((span: { kind: string }) => span.kind === "mcp_tool")).toBe(true);
    expect(observability.body.observability.logContract.redactedFields).toContain("access_token");

    const optimizer = await request(app).get("/api/swiggy-route-optimizer").expect(200);
    expect(optimizer.body.routeOptimizer.score).toBeGreaterThanOrEqual(90);
    expect(optimizer.body.routeOptimizer.totalSavedCalls).toBeGreaterThan(0);
    expect(optimizer.body.routeOptimizer.officialSources).toEqual(
      expect.arrayContaining([
        "https://mcp.swiggy.com/builders/",
        "https://mcp.swiggy.com/builders/llms.txt",
        "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
      ]),
    );
    expect(optimizer.body.routeOptimizer.totals.baselineCalls).toBeGreaterThan(
      optimizer.body.routeOptimizer.totals.optimizedCalls,
    );
    expect(optimizer.body.routeOptimizer.totals.savedCalls).toBe(optimizer.body.routeOptimizer.totalSavedCalls);
    const parallelToolCount = optimizer.body.routeOptimizer.parallelBatches
      .filter((batch: { parallel: boolean }) => batch.parallel)
      .reduce((sum: number, batch: { tools: Array<{ tool: string }> }) => sum + batch.tools.length, 0);
    expect(optimizer.body.routeOptimizer.totals.parallelizableSteps).toBe(parallelToolCount);
    expect(optimizer.body.routeOptimizer.totals.commercialGates).toBeGreaterThanOrEqual(3);
    expect(optimizer.body.routeOptimizer.profiles.length).toBeGreaterThanOrEqual(4);
    expect(
      optimizer.body.routeOptimizer.profiles.some((profile: { id: string }) => profile.id === "express_parallel_discovery"),
    ).toBe(true);
    expect(optimizer.body.routeOptimizer.parallelBatches.length).toBeGreaterThanOrEqual(5);
    expect(
      optimizer.body.routeOptimizer.parallelBatches
        .filter((batch: { parallel: boolean }) => batch.parallel)
        .flatMap((batch: { tools: Array<{ tool: string }> }) => batch.tools)
        .some((tool: { tool: string }) => ["place_food_order", "checkout", "book_table"].includes(tool.tool)),
    ).toBe(false);
    expect(
      optimizer.body.routeOptimizer.parallelBatches.some(
        (batch: { id: string; parallel: boolean; tools: Array<{ tool: string }> }) =>
          batch.id === "three_server_discovery" &&
          batch.parallel &&
          batch.tools.some((tool) => tool.tool === "search_restaurants_dineout"),
      ),
    ).toBe(true);
    expect(optimizer.body.routeOptimizer.crossServerHandoffs.length).toBeGreaterThanOrEqual(4);
    expect(
      optimizer.body.routeOptimizer.crossServerHandoffs.some(
        (handoff: { id: string; redactionRule: string }) =>
          handoff.id === "support_context_all_servers" && handoff.redactionRule.includes("bearer token"),
      ),
    ).toBe(true);
    expect(
      optimizer.body.routeOptimizer.journeys.some((journey: { id: string }) => journey.id === "three_server_meal_plan"),
    ).toBe(true);
    expect(optimizer.body.routeOptimizer.guardrails.some((guardrail: string) => guardrail.includes("commercial tools"))).toBe(true);
    expect(
      optimizer.body.routeOptimizer.assertions.some((assertion: string) => assertion.includes("Independent Food")),
    ).toBe(true);
  });

  it("records runtime telemetry with redacted API and MCP request evidence", async () => {
    const { app } = createMealPilotServer();
    await request(app).get("/api/health").expect(200);
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    await request(app)
      .post("/api/mcp/food")
      .send({
        jsonrpc: "2.0",
        id: "telemetry",
        method: "tools/call",
        params: { name: "get_addresses", arguments: {} },
      })
      .expect(200);
    await request(app).get(`/api/sessions/${created.body.plan.id}`).expect(200);

    const telemetry = await request(app).get("/api/telemetry/runtime").expect(200);

    expect(telemetry.body.telemetry.score).toBeGreaterThanOrEqual(80);
    expect(telemetry.body.telemetry.events.some((event: { event: string }) => event.event === "mcp_tool_call")).toBe(true);
    expect(telemetry.body.telemetry.events.every((event: { redacted: boolean }) => event.redacted)).toBe(true);
    expect(telemetry.body.telemetry.supportReady.sessionIds).toContain(created.body.plan.id);
    expect(telemetry.body.telemetry.logShape.requiredFields).toContain("userIdHash");
    expect(telemetry.body.telemetry.redactionContract.redactedFields).toContain("access_token");
  });

  it("returns a Swiggy audit ledger center for redacted support evidence", async () => {
    const { app } = createMealPilotServer();
    const created = await request(app).post("/api/plan").send(planningRequest).expect(201);
    await request(app).post("/api/confirm").send({ sessionId: created.body.plan.id, recommendationId: "rec_food" }).expect(200);

    const response = await request(app).get("/api/audit-ledger").expect(200);
    const ledger = response.body.auditLedger;

    expect(ledger.score).toBeGreaterThanOrEqual(90);
    expect(ledger.totalEvents).toBeGreaterThanOrEqual(10);
    expect(ledger.coveredSessions).toBe(1);
    expect(ledger.coveredServers).toEqual(expect.arrayContaining(["food", "instamart", "dineout"]));
    expect(ledger.commercialActions).toBeGreaterThanOrEqual(1);
    expect(ledger.supportReadyEvents).toBe(ledger.totalEvents);
    expect(ledger.retention.swiggyAuditLogDays).toBe(90);
    expect(ledger.retention.localCompactionEndpoint).toBe("/api/storage/compact");
    expect(ledger.redaction.piiFree).toBe(true);
    expect(ledger.redaction.redactedFields).toEqual(
      expect.arrayContaining(["access_token", "payment_credentials", "raw_address"]),
    );
    expect(ledger.events.every((event: { redaction: string }) => event.redaction === "redacted")).toBe(true);
    expect(
      ledger.controls.some((control: { id: string; status: string }) => control.id === "support_correlation" && control.status === "ready"),
    ).toBe(true);
    expect(ledger.dsrRouting.some((item: { owner: string; status: string }) => item.owner === "Swiggy" && item.status === "external_gate")).toBe(true);
    expect(ledger.supportPackage.to).toBe("builders@swiggy.in");
    expect(ledger.assertions.some((assertion: string) => assertion.includes("session ids"))).toBe(true);
  });

  it("runs multi-scenario evaluation lab checks", async () => {
    const { app } = createMealPilotServer();
    const evaluation = await request(app).get("/api/evaluation-lab").expect(200);

    expect(evaluation.body.evaluation.scenarios).toHaveLength(4);
    expect(evaluation.body.evaluation.score).toBeGreaterThanOrEqual(90);
    expect(evaluation.body.evaluation.blockedCount).toBe(0);
    expect(
      evaluation.body.evaluation.scenarios.some((scenario: { surface: string }) => scenario.surface === "voice"),
    ).toBe(true);
    expect(
      evaluation.body.evaluation.aggregateChecks.some((check: { id: string }) => check.id === "voice_contract"),
    ).toBe(true);
  });
});
