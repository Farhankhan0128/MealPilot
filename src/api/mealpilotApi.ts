import type { MealPlan, UserPlanningRequest } from "../domain/types";

export interface HealthResponse {
  ok: boolean;
  appName: string;
  mode: "mock" | "staging" | "production";
  hasClientId: boolean;
  time: string;
}

export interface PlanResponse {
  plan: MealPlan;
  meta: {
    userIdHash: string;
    storedServerSide: boolean;
  };
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `MealPilot API failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchHealth() {
  return requestJson<HealthResponse>("/api/health");
}

export function buildServerPlan(request: UserPlanningRequest) {
  return requestJson<PlanResponse>("/api/plan", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function confirmServerRecommendation(sessionId: string, recommendationId: string) {
  return requestJson<{ plan: MealPlan }>("/api/confirm", {
    method: "POST",
    body: JSON.stringify({ sessionId, recommendationId }),
  });
}

export function startSwiggyAuth() {
  return requestJson<{ authorizationUrl: string; mode: string; state: string }>("/api/auth/swiggy/start", {
    method: "POST",
  });
}
