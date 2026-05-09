import { applyItemSubstitution, removePlanItem } from "../../src/domain/planner.js";
import type { BuilderReadinessItem, MealPlan, TrackingEvent, UserProfile } from "../../src/domain/types.js";

export function substitutePlanItem(plan: MealPlan, recommendationId: string, alternativeId: string) {
  const updatedPlan = applyItemSubstitution(plan, recommendationId, alternativeId);
  if (updatedPlan === plan) {
    throw Object.assign(new Error("Substitution is not available for this recommendation."), { status: 404 });
  }
  return updatedPlan;
}

export function removeRecommendationItem(plan: MealPlan, recommendationId: string, itemId: string) {
  const recommendation = plan.recommendations.find((item) => item.id === recommendationId);
  if (!recommendation?.items.some((item) => item.id === itemId)) {
    throw Object.assign(new Error("Item is not available in this recommendation."), { status: 404 });
  }
  return removePlanItem(plan, recommendationId, itemId);
}

export function buildTrackingEvents(plan: MealPlan): TrackingEvent[] {
  const now = Date.now();
  return plan.recommendations
    .filter((recommendation) => recommendation.status === "confirmed")
    .flatMap((recommendation, index) => [
      {
        id: `track_${recommendation.id}_accepted`,
        recommendationId: recommendation.id,
        server: recommendation.server,
        label: `${recommendation.provider} accepted the request`,
        status: "accepted",
        timestamp: new Date(now + index * 1000).toISOString(),
      },
      {
        id: `track_${recommendation.id}_ready`,
        recommendationId: recommendation.id,
        server: recommendation.server,
        label:
          recommendation.server === "dineout"
            ? "Reservation is held in simulated mode"
            : "Order is being prepared in simulated mode",
        status: recommendation.server === "dineout" ? "ready" : "preparing",
        timestamp: new Date(now + index * 1000 + 5000).toISOString(),
      },
    ]);
}

export function buildReadinessChecklist(profile: UserProfile): BuilderReadinessItem[] {
  return [
    {
      id: "local_demo",
      label: "Local end-to-end demo",
      status: "ready",
      evidence: "React UI calls Express API, which stores sessions and executes mock MCP confirmations.",
    },
    {
      id: "oauth",
      label: "OAuth 2.1 PKCE",
      status: "ready",
      evidence: "Server generates state, verifier, and challenge in /api/auth/swiggy/start.",
    },
    {
      id: "confirmation",
      label: "Explicit commercial confirmation",
      status: "ready",
      evidence: "Food, Instamart, and Dineout confirmations are separate and audited.",
    },
    {
      id: "traffic",
      label: "Responsible traffic",
      status: "ready",
      evidence: "Private pilot estimate remains below 1 QPS with retry guardrails.",
    },
    {
      id: "credentials",
      label: "Swiggy staging credentials",
      status: "needs_credentials",
      evidence: "Awaiting Builders Club client_id and staging allowlist.",
    },
    {
      id: "profile",
      label: "Preference consent",
      status: profile.consentToStorePreferences ? "ready" : "manual_review",
      evidence: profile.consentToStorePreferences
        ? "Profile preferences are stored only with explicit consent."
        : "User profile consent must be enabled before production storage.",
    },
  ];
}
