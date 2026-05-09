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
});
