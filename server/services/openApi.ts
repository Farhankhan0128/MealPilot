import type { ServerConfig } from "../config.js";

export function buildOpenApiDocument(config: ServerConfig) {
  return {
    openapi: "3.1.0",
    info: {
      title: "MealPilot India API",
      version: "1.0.0",
      description:
        "Full-stack Swiggy MCP Builder Access demo API for meal planning, confirmation gates, demo evidence, and production readiness.",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: `${config.swiggyMode} local runtime`,
      },
    ],
    tags: [
      { name: "Core", description: "Health, config, profile, and planning" },
      { name: "Commerce", description: "Confirmation, tracking, preflight, replay, and widgets" },
      { name: "Builder Access", description: "Application, launch, evidence, and submission artifacts" },
      { name: "Operations", description: "Readiness, privacy, scheduling, and support" },
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["Core"],
          summary: "Liveness probe",
          responses: { "200": { description: "API is live" } },
        },
      },
      "/api/ready": {
        get: {
          tags: ["Operations"],
          summary: "Readiness probe with build and runtime checks",
          responses: { "200": { description: "Runtime is ready for local demo traffic" } },
        },
      },
      "/api/config": {
        get: {
          tags: ["Core"],
          summary: "Public runtime configuration",
          responses: { "200": { description: "Mode, redirect URI, scope, and requested Swiggy servers" } },
        },
      },
      "/api/plan": {
        post: {
          tags: ["Core"],
          summary: "Create a three-server MealPilot plan",
          responses: { "201": { description: "Plan session with Food, Instamart, and Dineout recommendations" } },
        },
      },
      "/api/confirm": {
        post: {
          tags: ["Commerce"],
          summary: "Confirm one prepared commercial action",
          responses: { "200": { description: "Updated plan with one confirmed recommendation" } },
        },
      },
      "/api/confirm-all": {
        post: {
          tags: ["Commerce"],
          summary: "Confirm all prepared recommendations for demo speed",
          responses: { "200": { description: "Updated plan with separate audit entries per action" } },
        },
      },
      "/api/sessions/{sessionId}": {
        get: {
          tags: ["Core"],
          summary: "Fetch a plan session",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Stored plan" }, "404": { description: "Session not found" } },
        },
      },
      "/api/sessions/{sessionId}/preflight": {
        get: {
          tags: ["Commerce"],
          summary: "Cart and booking preflight report",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Preflight checks and offer opportunities" } },
        },
      },
      "/api/sessions/{sessionId}/replay": {
        get: {
          tags: ["Commerce"],
          summary: "Replayable MCP JSON-RPC transcript",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "JSON-RPC tools/call replay steps" } },
        },
      },
      "/api/sessions/{sessionId}/widgets": {
        get: {
          tags: ["Commerce"],
          summary: "Swiggy widget contracts and semantic fallbacks",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Widget metadata and postMessage bridge rules" } },
        },
      },
      "/api/mcp/catalog": {
        get: {
          tags: ["Builder Access"],
          summary: "35-tool Swiggy MCP coverage matrix",
          responses: { "200": { description: "Food, Instamart, and Dineout coverage" } },
        },
      },
      "/api/go-live": {
        get: {
          tags: ["Builder Access"],
          summary: "Go-live checks and observability metrics",
          responses: { "200": { description: "Readiness gates, metrics, and rollout plan" } },
        },
      },
      "/api/demo-studio": {
        get: {
          tags: ["Builder Access"],
          summary: "Demo recording progress checklist",
          responses: { "200": { description: "Demo steps and evidence links" } },
        },
      },
      "/api/evaluation-lab": {
        get: {
          tags: ["Builder Access"],
          summary: "Multi-scenario agent evaluation lab",
          responses: { "200": { description: "Persona, budget, voice, and safety evaluation results" } },
        },
      },
      "/api/submission-package": {
        get: {
          tags: ["Builder Access"],
          summary: "Form-ready Builder Access submission package",
          responses: { "200": { description: "Application fields, links, and residual risks" } },
        },
      },
      "/api/reviewer-proof": {
        get: {
          tags: ["Builder Access"],
          summary: "Reviewer proof score and artifact map",
          responses: { "200": { description: "Score, highlights, blockers, and artifact links" } },
        },
      },
      "/api/resilience": {
        get: {
          tags: ["Builder Access"],
          summary: "Executable resilience drills and Swiggy support runbook",
          responses: { "200": { description: "Retry, rate-limit, auth, idempotency, and deprecation drills" } },
        },
      },
      "/api/privacy/export": {
        get: {
          tags: ["Operations"],
          summary: "Export local user data",
          responses: { "200": { description: "Profile, pantry, group, plan, and reminder data" } },
        },
      },
      "/api/privacy": {
        delete: {
          tags: ["Operations"],
          summary: "Delete local user data",
          responses: { "200": { description: "Local data deleted" } },
        },
      },
      "/api/storage/status": {
        get: {
          tags: ["Operations"],
          summary: "Storage diagnostics",
          responses: { "200": { description: "Persistence mode, counts, and data file path when enabled" } },
        },
      },
      "/api/storage/export": {
        get: {
          tags: ["Operations"],
          summary: "Export a complete local store snapshot",
          responses: { "200": { description: "Versioned snapshot for backup or local migration" } },
        },
      },
      "/api/storage/restore": {
        post: {
          tags: ["Operations"],
          summary: "Restore a complete local store snapshot",
          responses: { "200": { description: "Restored snapshot" } },
        },
      },
      "/api/storage/compact": {
        post: {
          tags: ["Operations"],
          summary: "Compact expired plans, reminders, and OAuth sessions",
          responses: { "200": { description: "Compaction result and storage diagnostics" } },
        },
      },
      "/api/openapi.json": {
        get: {
          tags: ["Operations"],
          summary: "OpenAPI document",
          responses: { "200": { description: "Machine-readable API contract" } },
        },
      },
    },
  };
}
