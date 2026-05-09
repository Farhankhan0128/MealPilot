import { confirmRecommendation } from "../../src/domain/planner.js";
import { buildConfirmationMessage, canCompleteAction } from "../../src/domain/safety.js";
import type { CommerceAction, MealPlan, SwiggyServer, ToolCallEvent } from "../../src/domain/types.js";
import { callMockSwiggyTool } from "../mock/swiggyToolRouter.js";

function actionTool(server: SwiggyServer, action: CommerceAction) {
  if (server === "food" && action === "place_food_order") return "place_food_order";
  if (server === "instamart" && action === "checkout") return "checkout";
  if (server === "dineout" && action === "book_table") return "book_table";
  return action;
}

export async function executeConfirmedRecommendation(plan: MealPlan, recommendationId: string): Promise<MealPlan> {
  const recommendation = plan.recommendations.find((item) => item.id === recommendationId);

  if (!recommendation) {
    throw Object.assign(new Error("Recommendation not found."), { status: 404 });
  }

  if (!canCompleteAction(recommendation)) {
    throw Object.assign(new Error("Recommendation is not ready for confirmation."), { status: 409 });
  }

  const tool = actionTool(recommendation.server, recommendation.confirmationAction);
  const result = await callMockSwiggyTool(recommendation.server, tool);
  const confirmed = confirmRecommendation(plan, recommendationId);

  const executionEvent: ToolCallEvent = {
    id: `execute_${recommendationId}_${Date.now()}`,
    server: recommendation.server,
    tool,
    status: "simulated",
    durationMs: 120,
    detail: `${buildConfirmationMessage(recommendation)} Result: ${JSON.stringify(result).slice(0, 180)}.`,
    sessionId: plan.id,
  };

  return {
    ...confirmed,
    auditTrail: [executionEvent, ...confirmed.auditTrail],
  };
}
