import type {
  AgentSurface,
  AgentSurfaceResponse,
  BuilderReadinessItem,
  GoLiveCheck,
  GroupMember,
  GroupPlan,
  IncidentReport,
  MealPlan,
  McpServerCoverage,
  ObservabilityMetric,
  OpsStatus,
  PantryItem,
  Reminder,
  RestockSuggestion,
  TrackingEvent,
  UserPlanningRequest,
  UserProfile,
} from "../domain/types";

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

export interface McpCatalogResponse {
  totalTools: number;
  demoReady: number;
  guarded: number;
  planned: number;
  servers: McpServerCoverage[];
}

export interface GoLiveResponse {
  checks: GoLiveCheck[];
  metrics: ObservabilityMetric[];
  rollout: {
    pilotUsers: number;
    ramp: string[];
    expectedPeakQps: string;
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

export function fetchBuilderPackageMarkdown() {
  return fetch("/api/builder-package.md").then(async (response) => {
    if (!response.ok) throw new Error(`MealPilot API failed with ${response.status}`);
    return response.text();
  });
}

export function fetchMcpCatalog() {
  return requestJson<McpCatalogResponse>("/api/mcp/catalog");
}

export function fetchAgentSurface(sessionId: string, surface: AgentSurface) {
  const params = new URLSearchParams({ surface });
  return requestJson<{ response: AgentSurfaceResponse }>(`/api/sessions/${sessionId}/surface?${params.toString()}`);
}

export function fetchPantry() {
  return requestJson<{ pantry: PantryItem[]; suggestions: RestockSuggestion[] }>("/api/pantry");
}

export function updatePantry(pantry: PantryItem[]) {
  return requestJson<{ pantry: PantryItem[]; suggestions: RestockSuggestion[] }>("/api/pantry", {
    method: "PUT",
    body: JSON.stringify({ pantry }),
  });
}

export function fetchGroupPlan() {
  return requestJson<{ groupPlan: GroupPlan }>("/api/group");
}

export function addGroupMember(member: GroupMember) {
  return requestJson<{ groupPlan: GroupPlan }>("/api/group/members", {
    method: "POST",
    body: JSON.stringify(member),
  });
}

export function schedulePlan(sessionId: string) {
  return requestJson<{ reminders: Reminder[] }>("/api/schedule", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function fetchOpsStatus() {
  return requestJson<{ status: OpsStatus[] }>("/api/ops");
}

export function fetchGoLive() {
  return requestJson<GoLiveResponse>("/api/go-live");
}

export function createSupportReport(sessionId?: string) {
  return requestJson<{ report: IncidentReport }>("/api/support/report", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function exportPrivacyData() {
  return requestJson<{
    profile: UserProfile;
    pantry: PantryItem[];
    groupPlan: GroupPlan;
    plans: MealPlan[];
    reminders: Reminder[];
  }>("/api/privacy/export");
}

export function deletePrivacyData() {
  return requestJson<{ ok: true }>("/api/privacy", {
    method: "DELETE",
  });
}

export function startSwiggyAuth() {
  return requestJson<{ authorizationUrl: string; mode: string; state: string }>("/api/auth/swiggy/start", {
    method: "POST",
  });
}

export function completeSwiggyAuth(code: string, state: string) {
  const params = new URLSearchParams({ code, state });
  return requestJson<{ ok: boolean; mode: string; tokenExchange: string; state: string }>(
    `/api/auth/swiggy/callback?${params.toString()}`,
  );
}
