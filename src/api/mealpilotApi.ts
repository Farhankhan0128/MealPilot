import type { BuilderReadinessItem, MealPlan, TrackingEvent, UserPlanningRequest, UserProfile } from "../domain/types";

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

export interface BuilderPackageResponse {
  readiness: BuilderReadinessItem[];
  application: {
    integrationName: string;
    requestedServers: string[];
    expectedVolume: string;
    useCase: string;
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

export function fetchProfile() {
  return requestJson<{ profile: UserProfile }>("/api/profile");
}

export function updateProfile(profile: UserProfile) {
  return requestJson<{ profile: UserProfile }>("/api/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
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

export function confirmAllRecommendations(sessionId: string) {
  return requestJson<{ plan: MealPlan }>("/api/confirm-all", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function substituteRecommendationItem(sessionId: string, recommendationId: string, alternativeId: string) {
  return requestJson<{ plan: MealPlan }>("/api/substitute", {
    method: "POST",
    body: JSON.stringify({ sessionId, recommendationId, alternativeId }),
  });
}

export function removeRecommendationItem(sessionId: string, recommendationId: string, itemId: string) {
  return requestJson<{ plan: MealPlan }>("/api/remove-item", {
    method: "POST",
    body: JSON.stringify({ sessionId, recommendationId, itemId }),
  });
}

export function fetchTracking(sessionId: string) {
  return requestJson<{ plan: MealPlan; tracking: TrackingEvent[] }>(`/api/tracking/${sessionId}`);
}

export function fetchBuilderPackage() {
  return requestJson<BuilderPackageResponse>("/api/builder-package");
}

export function startSwiggyAuth() {
  return requestJson<{ authorizationUrl: string; mode: string; state: string }>("/api/auth/swiggy/start", {
    method: "POST",
  });
}
