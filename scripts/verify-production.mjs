/* global console, fetch, process */

const baseUrl = process.env.MEALPILOT_URL ?? "http://localhost:8787";

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }
  return response.json();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const planRequest = {
  prompt: "Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, groceries, and Dineout.",
  city: "Bengaluru",
  budget: 2000,
  diet: "high-protein vegetarian",
  guests: 4,
  day: "saturday",
};

const health = await request("/api/health");
assert(health.ok, "health probe is not ok");

const ready = await request("/api/ready");
assert(ready.ok, "readiness probe is not ok");

const openApi = await request("/api/openapi.json");
assert(openApi.openapi === "3.1.0", "OpenAPI contract is missing");

const created = await request("/api/plan", {
  method: "POST",
  body: JSON.stringify(planRequest),
});
const sessionId = created.plan.id;
assert(created.plan.recommendations.length === 3, "plan must include three Swiggy recommendations");

const catalog = await request("/api/mcp/catalog");
assert(catalog.totalTools === 35, "MCP catalog must include 35 tools");
assert(catalog.planned === 0, "MCP catalog should have no planned gaps");

const preflight = await request(`/api/sessions/${sessionId}/preflight`);
assert(preflight.preflight.checks.length >= 15, "preflight checks are incomplete");

const replay = await request(`/api/sessions/${sessionId}/replay`);
assert(replay.replay.length >= 10, "MCP replay is incomplete");

const widgets = await request(`/api/sessions/${sessionId}/widgets`);
assert(widgets.widgets.length >= 5, "widget contracts are incomplete");
assert(widgets.bridge.verifyOrigin, "widget bridge must verify origin");

const proof = await request("/api/reviewer-proof");
assert(proof.proof.score >= 90, "reviewer proof score is below target");

const submission = await request("/api/submission-package");
assert(submission.package.fields.length >= 10, "submission package is incomplete");

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      sessionId,
      toolCoverage: `${catalog.demoReady + catalog.guarded}/${catalog.totalTools}`,
      preflightChecks: preflight.preflight.checks.length,
      replaySteps: replay.replay.length,
      widgets: widgets.widgets.length,
      reviewerScore: proof.proof.score,
      submissionFields: submission.package.fields.length,
    },
    null,
    2,
  ),
);
