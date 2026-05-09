import { describe, expect, it } from "vitest";
import { canCompleteAction, requiresExplicitConfirmation } from "./safety";
import { createMealPlan, confirmRecommendation } from "./planner";
import type { UserPlanningRequest } from "./types";

const request: UserPlanningRequest = {
  prompt: "Plan my high-protein vegetarian week under Rs 2,000.",
  city: "Bengaluru",
  budget: 2000,
  diet: "high-protein vegetarian",
  guests: 4,
  day: "saturday",
};

describe("MealPilot planner", () => {
  it("builds a three-server Swiggy MCP plan under budget", async () => {
    const plan = await createMealPlan(request);

    expect(plan.recommendations).toHaveLength(3);
    expect(plan.recommendations.map((item) => item.server)).toEqual(["food", "instamart", "dineout"]);
    expect(plan.budgetFit).toBe("under_budget");
    expect(plan.auditTrail.length).toBeGreaterThanOrEqual(9);
  });

  it("requires explicit confirmation for all commercial actions", async () => {
    const plan = await createMealPlan(request);

    expect(plan.recommendations.every((recommendation) => canCompleteAction(recommendation))).toBe(true);
    expect(requiresExplicitConfirmation("place_food_order")).toBe(true);
    expect(requiresExplicitConfirmation("checkout")).toBe(true);
    expect(requiresExplicitConfirmation("book_table")).toBe(true);
  });

  it("marks only the selected recommendation as confirmed", async () => {
    const plan = await createMealPlan(request);
    const updated = confirmRecommendation(plan, "rec_food");

    expect(updated.recommendations.find((item) => item.id === "rec_food")?.status).toBe("confirmed");
    expect(updated.recommendations.find((item) => item.id === "rec_instamart")?.status).toBe("prepared");
  });
});
