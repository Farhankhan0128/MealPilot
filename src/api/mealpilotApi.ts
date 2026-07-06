import type {
  AgentSurface,
  AgentSurfaceResponse,
  AccessSubmissionStudio,
  AccessSubmissionHandoffState,
  AuditLedgerCenter,
  AiClientConnectKit,
  BrandComplianceKit,
  BuilderReadinessItem,
  BuilderPacketExport,
  CartPreflightReport,
  CommercialActionGuardReport,
  ComplianceEvidence,
  CodingAgentGovernance,
  CredentialOnboardingReport,
  DataGovernanceCenter,
  DemoStudioStep,
  EnterpriseDelegatedAuthCenter,
  ErrorIntelligenceReport,
  EvaluationLab,
  GoLiveCheck,
  GuestCollaborationCenter,
  GroupMember,
  GroupPlan,
  HouseholdPreferenceGraph,
  IncidentReport,
  LaunchBundle,
  LuxuryExperienceWorkspace,
  MealPlan,
  McpBackpressureGovernorReport,
  McpCapabilityRegistry,
  McpGatewayStatus,
  McpResourcePromptStudio,
  McpToolLabReport,
  McpServerCoverage,
  McpReplayStep,
  NutritionBudgetIntelligence,
  ObservabilityTraceReport,
  ObservabilityMetric,
  OpsStatus,
  PantryItem,
  PremiumConciergeItineraryReport,
  PremiumUseCaseStudio,
  RateLimitPlan,
  Reminder,
  ReviewerArtifactVault,
  ResilienceDrill,
  ResilienceRunbook,
  ReviewerProof,
  SwiggyRouteOptimizationReport,
  RestockSuggestion,
  RuntimeTelemetryReport,
  SandboxCredentialWorkbench,
  SloIncidentCommandCenter,
  SubmissionConsole,
  SubmissionPackage,
  StagingCertificationMatrix,
  StagingTranscriptExport,
  TrafficReadinessPlan,
  SupportBridgeReport,
  SwiggyAuthStatusReport,
  SwiggyAccessDossier,
  SwiggyBuilderIntakeCommandCenter,
  SwiggyChannelMultimodalStudio,
  SwiggyWidget,
  SwiggyBuildersMap,
  SwiggyDocsCoverageReport,
  SwiggyFaqPolicyCenter,
  SwiggyGrowthPartnershipCenter,
  SwiggyInnovationRadarReport,
  SwiggyJourneyCompilerReport,
  SwiggyScenarioRunnerReport,
  SwiggySourceIntelligenceReport,
  SwiggyStagingCutoverRehearsal,
  SwiggyStateOrchestratorReport,
  SwiggyToolContractMatrix,
  SwiggyUpstreamWatchReport,
  SwiggyWebsiteAtlas,
  SwiggyWidgetRuntimeReport,
  TrackingEvent,
  UserPlanningRequest,
  UserProfile,
  VersionMonitor,
  VisualQaCenter,
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

export function fetchMcpGateway() {
  return requestJson<{ gateway: McpGatewayStatus }>("/api/mcp-gateway");
}

export function fetchMcpToolLab() {
  return requestJson<{ toolLab: McpToolLabReport }>("/api/mcp/tool-lab");
}

export function fetchMcpCapabilityRegistry() {
  return requestJson<{ registry: McpCapabilityRegistry }>("/api/mcp/capability-registry");
}

export function fetchMcpResourcePromptStudio() {
  return requestJson<{ resourcePromptStudio: McpResourcePromptStudio }>("/api/mcp/resource-prompt-studio");
}

export function fetchSwiggyToolContractMatrix() {
  return requestJson<{ matrix: SwiggyToolContractMatrix }>("/api/mcp/tool-contract-matrix");
}

export function fetchSwiggyScenarioRunner() {
  return requestJson<{ scenarioRunner: SwiggyScenarioRunnerReport }>("/api/mcp/scenario-runner");
}

export function fetchSwiggyStateOrchestrator() {
  return requestJson<{ stateOrchestrator: SwiggyStateOrchestratorReport }>("/api/mcp/state-orchestrator");
}

export function fetchSwiggyWidgetRuntime() {
  return requestJson<{ widgetRuntime: SwiggyWidgetRuntimeReport }>("/api/mcp/widget-runtime");
}

export function fetchCommercialActionGuard() {
  return requestJson<{ commercialActionGuard: CommercialActionGuardReport }>("/api/mcp/commercial-action-guard");
}

export function fetchSwiggyStagingCutover() {
  return requestJson<{ stagingCutover: SwiggyStagingCutoverRehearsal }>("/api/mcp/staging-cutover");
}

export function fetchSwiggyBuildersMap() {
  return requestJson<{ map: SwiggyBuildersMap }>("/api/swiggy-builders-map");
}

export function fetchSwiggyWebsiteAtlas() {
  return requestJson<{ atlas: SwiggyWebsiteAtlas }>("/api/swiggy-website-atlas");
}

export function fetchSwiggyBuilderIntake() {
  return requestJson<{ intake: SwiggyBuilderIntakeCommandCenter }>("/api/swiggy-builder-intake");
}

export function fetchSwiggyFaqPolicyCenter() {
  return requestJson<{ faqPolicy: SwiggyFaqPolicyCenter }>("/api/swiggy-faq-policy");
}

export function fetchSwiggyGrowthPartnershipCenter() {
  return requestJson<{ growthPartnership: SwiggyGrowthPartnershipCenter }>("/api/swiggy-growth-partnership");
}

export function fetchChannelMultimodalStudio() {
  return requestJson<{ channelMultimodalStudio: SwiggyChannelMultimodalStudio }>("/api/channel-multimodal-studio");
}

export function fetchNutritionBudgetIntelligence() {
  return requestJson<{ nutritionBudget: NutritionBudgetIntelligence }>("/api/nutrition-budget-intelligence");
}

export function fetchHouseholdPreferenceGraph() {
  return requestJson<{ householdPreference: HouseholdPreferenceGraph }>("/api/household-preference-graph");
}

export function fetchGuestCollaborationCenter() {
  return requestJson<{ guestCollaboration: GuestCollaborationCenter }>("/api/guest-collaboration-calendar");
}

export function fetchLuxuryExperienceWorkspace() {
  return requestJson<{ luxuryExperience: LuxuryExperienceWorkspace }>("/api/luxury-experience-workspace");
}

export function fetchReviewerArtifactVault() {
  return requestJson<{ reviewerArtifactVault: ReviewerArtifactVault }>("/api/reviewer-artifact-vault");
}

export function fetchVisualQaCenter() {
  return requestJson<{ visualQa: VisualQaCenter }>("/api/visual-qa-center");
}

export function fetchSwiggyDocsCoverage() {
  return requestJson<{ docsCoverage: SwiggyDocsCoverageReport }>("/api/swiggy-docs-coverage");
}

export function fetchSwiggyUpstreamWatch() {
  return requestJson<{ upstreamWatch: SwiggyUpstreamWatchReport }>("/api/swiggy-upstream-watch");
}

export function fetchSwiggySourceIntelligence() {
  return requestJson<{ sourceIntelligence: SwiggySourceIntelligenceReport }>("/api/swiggy-source-intelligence");
}

export function fetchSwiggyInnovationRadar() {
  return requestJson<{ innovationRadar: SwiggyInnovationRadarReport }>("/api/swiggy-innovation-radar");
}

export function fetchAiClientConnectKit() {
  return requestJson<{ connectKit: AiClientConnectKit }>("/api/ai-client-connect-kit");
}

export function fetchCodingAgentGovernance() {
  return requestJson<{ codingAgentGovernance: CodingAgentGovernance }>("/api/coding-agent-governance");
}

export function fetchBrandComplianceKit() {
  return requestJson<{ brandCompliance: BrandComplianceKit }>("/api/brand-compliance-kit");
}

export function fetchSwiggyJourneyCompiler() {
  return requestJson<{ journeyCompiler: SwiggyJourneyCompilerReport }>("/api/swiggy-journey-compiler");
}

export function fetchSwiggyAccessDossier() {
  return requestJson<{ dossier: SwiggyAccessDossier }>("/api/swiggy-access-dossier");
}

export function fetchPremiumUseCaseStudio() {
  return requestJson<{ studio: PremiumUseCaseStudio }>("/api/premium-use-case-studio");
}

export function fetchPremiumConciergeItinerary() {
  return requestJson<{ concierge: PremiumConciergeItineraryReport }>("/api/premium-concierge-itinerary");
}

export function fetchStagingCertificationMatrix() {
  return requestJson<{ matrix: StagingCertificationMatrix }>("/api/staging-certification-matrix");
}

export function fetchCredentialOnboarding() {
  return requestJson<{ onboarding: CredentialOnboardingReport }>("/api/credential-onboarding");
}

export function fetchSandboxCredentialWorkbench() {
  return requestJson<{ sandboxWorkbench: SandboxCredentialWorkbench }>("/api/sandbox-credential-workbench");
}

export function fetchSwiggyAuthStatus() {
  return requestJson<{ authStatus: SwiggyAuthStatusReport }>("/api/auth/swiggy/status");
}

export function fetchEnterpriseDelegatedAuthCenter() {
  return requestJson<{ enterpriseAuth: EnterpriseDelegatedAuthCenter }>("/api/enterprise-delegated-auth");
}

export function fetchAgentSurface(sessionId: string, surface: AgentSurface) {
  const params = new URLSearchParams({ surface });
  return requestJson<{ response: AgentSurfaceResponse }>(`/api/sessions/${sessionId}/surface?${params.toString()}`);
}

export function fetchCartPreflight(sessionId: string) {
  return requestJson<{ preflight: CartPreflightReport }>(`/api/sessions/${sessionId}/preflight`);
}

export function fetchMcpReplay(sessionId: string) {
  return requestJson<{ replay: McpReplayStep[] }>(`/api/sessions/${sessionId}/replay`);
}

export function fetchStagingTranscript(sessionId: string) {
  return requestJson<{ transcript: StagingTranscriptExport }>(`/api/sessions/${sessionId}/staging-transcript`);
}

export function fetchWidgets(sessionId: string) {
  return requestJson<{
    widgets: SwiggyWidget[];
    bridge: { origin: string; sandbox: string; verifyOrigin: boolean };
  }>(`/api/sessions/${sessionId}/widgets`);
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

export function fetchSupportBridge(sessionId?: string) {
  const params = sessionId ? `?${new URLSearchParams({ sessionId }).toString()}` : "";
  return requestJson<{ supportBridge: SupportBridgeReport }>(`/api/support/bridge${params}`);
}

export function fetchSloIncidentCommand() {
  return requestJson<{ sloIncident: SloIncidentCommandCenter }>("/api/slo-incident-command");
}

export function fetchErrorIntelligence() {
  return requestJson<{ errorIntelligence: ErrorIntelligenceReport }>("/api/error-intelligence");
}

export function fetchDemoStudio() {
  return requestJson<{ steps: DemoStudioStep[] }>("/api/demo-studio");
}

export function fetchEvaluationLab() {
  return requestJson<{ evaluation: EvaluationLab }>("/api/evaluation-lab");
}

export function fetchSubmissionPackage() {
  return requestJson<{ package: SubmissionPackage }>("/api/submission-package");
}

export function fetchSubmissionConsole() {
  return requestJson<{ submissionConsole: SubmissionConsole }>("/api/submission-console");
}

export function fetchAccessSubmissionStudio() {
  return requestJson<{ accessSubmissionStudio: AccessSubmissionStudio }>("/api/access-submission-studio");
}

export function updateAccessSubmissionState(
  state: Partial<Omit<AccessSubmissionHandoffState, "updatedAt">>,
) {
  return requestJson<{ accessSubmissionStudio: AccessSubmissionStudio }>("/api/access-submission-studio/state", {
    method: "PATCH",
    body: JSON.stringify(state),
  });
}

export function fetchBuilderPacketExport() {
  return requestJson<{ packet: BuilderPacketExport }>("/api/builder-packet-export");
}

export function fetchRateLimitPlan() {
  return requestJson<{ rateLimit: RateLimitPlan }>("/api/rate-limit-plan");
}

export function fetchTrafficReadinessPlan() {
  return requestJson<{ trafficReadiness: TrafficReadinessPlan }>("/api/traffic-readiness-plan");
}

export function fetchMcpBackpressureGovernor() {
  return requestJson<{ backpressureGovernor: McpBackpressureGovernorReport }>("/api/mcp/backpressure-governor");
}

export function fetchVersionMonitor() {
  return requestJson<{ version: VersionMonitor }>("/api/version-monitor");
}

export function fetchComplianceEvidence() {
  return requestJson<{ compliance: ComplianceEvidence }>("/api/compliance-evidence");
}

export function fetchDataGovernanceCenter() {
  return requestJson<{ dataGovernance: DataGovernanceCenter }>("/api/data-governance-center");
}

export function fetchReviewerProof() {
  return requestJson<{ proof: ReviewerProof }>("/api/reviewer-proof");
}

export function fetchProductionLaunchBundle() {
  return requestJson<{ launchBundle: LaunchBundle }>("/api/production-launch-bundle");
}

export function fetchResilience() {
  return requestJson<{ drills: ResilienceDrill[]; runbook: ResilienceRunbook }>("/api/resilience");
}

export function fetchObservabilityTraces() {
  return requestJson<{ observability: ObservabilityTraceReport }>("/api/observability/traces");
}

export function fetchRuntimeTelemetry() {
  return requestJson<{ telemetry: RuntimeTelemetryReport }>("/api/telemetry/runtime");
}

export function fetchAuditLedger() {
  return requestJson<{ auditLedger: AuditLedgerCenter }>("/api/audit-ledger");
}

export function fetchSwiggyRouteOptimizer() {
  return requestJson<{ routeOptimizer: SwiggyRouteOptimizationReport }>("/api/swiggy-route-optimizer");
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
  return requestJson<{
    authorizationUrl: string;
    mode: string;
    state: string;
    verifierStoredServerSide: boolean;
    authStatus: SwiggyAuthStatusReport;
  }>("/api/auth/swiggy/start", {
    method: "POST",
  });
}

export function completeSwiggyAuth(code: string, state: string) {
  const params = new URLSearchParams({ code, state });
  return requestJson<{
    ok: boolean;
    mode: string;
    tokenExchange: "mocked" | "exchanged";
    state: string;
    tokenType?: string;
    expiresAt?: string;
    scope?: string;
    authStatus: SwiggyAuthStatusReport;
  }>(`/api/auth/swiggy/callback?${params.toString()}`);
}
