import type {
  AgentSurface,
  AgentSurfaceResponse,
  AccessSubmissionStudio,
  AccessSubmissionHandoffState,
  AuditLedgerCenter,
  AiClientConnectKit,
  AiClientConfigValidation,
  AiClientTarget,
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
  DeveloperFirstCallExecution,
  EnterpriseDelegatedAuthCenter,
  ErrorClassificationResult,
  ErrorIntelligenceReport,
  EvaluationLab,
  GoLiveCheck,
  GuestCollaborationCenter,
  GuestCollaborationChannel,
  GuestCollaborationComposition,
  GroupMember,
  GroupPlan,
  HouseholdPreferenceGraph,
  HouseholdPreferenceSimulation,
  IncidentReport,
  LaunchBundle,
  LuxuryExperienceComposition,
  LuxuryExperienceWorkspace,
  MealPlan,
  McpBackpressureGovernorReport,
  McpCapabilityRegistry,
  McpResourcePromptExecution,
  McpGatewayStatus,
  McpResourcePromptStudio,
  McpToolLabReport,
  McpServerCoverage,
  McpReplayStep,
  NutritionBudgetAdvice,
  NutritionBudgetIntelligence,
  ObservabilityTraceReport,
  ObservabilityMetric,
  OpsStatus,
  PantryItem,
  PremiumConciergeItineraryReport,
  PremiumUseCaseStudio,
  RateLimitPlan,
  Reminder,
  ReviewerArtifactPacketChannel,
  ReviewerArtifactPacketComposition,
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
  SupportBridgeExecution,
  SwiggyHandshakeDoctor,
  SwiggyAuthStatusReport,
  SwiggyAuthLifecycleCenterReport,
  SwiggyBenefitsActivationCenter,
  SwiggyBenefitsActivationExecution,
  EnterprisePlatformCenterReport,
  SwiggyBuildersHomepageExperienceCenter,
  SwiggyBuildersLaunchStoryCenterReport,
  SwiggyBuildersJourneyGateCenter,
  SwiggyBuildersLiveSourceResilienceCenter,
  SwiggyBuildersModuleIntelligenceCenter,
  SwiggyBuildersReviewDecisionCenter,
  SwiggyBuildersSourceEvolutionCenter,
  SwiggyBuildersPageMeshAuditor,
  SwiggyBuildersSiteParityAuditor,
  SwiggyAccessDossier,
  SwiggyAccessEvidenceMatrix,
  SwiggyBuilderIntakeCommandCenter,
  SwiggyCancellationCareCenterReport,
  SwiggyCartMutationExecution,
  SwiggyCartMutationReport,
  SwiggyChannelMultimodalStudio,
  SwiggyChannelExecutionComposition,
  SwiggyConfirmationCommandCenterReport,
  SwiggyConfirmationExecution,
  SwiggyConversionCenter,
  SwiggyCredentialHandoffCenter,
  SwiggyCredentialVaultCenter,
  SwiggyDeepSiteMap,
  SwiggyDineoutPrecisionCenterReport,
  SwiggyDiscoveryResolution,
  SwiggyDiscoveryFreshnessReport,
  DeveloperQuickstartWorkbench,
  SwiggyCtaExecutionCenter,
  SwiggyCtaLiveAuditor,
  SwiggyWidget,
  SwiggyWidgetExperienceComposer,
  SwiggyHostedWidgetActivationCenter,
  SwiggyAgentExperienceBenchmark,
  SwiggyPrivatePilotControlRoom,
  SwiggyBuildersMap,
  SwiggyCustomizationStudio,
  SwiggyCustomizationValidation,
  SwiggyDocsCoverageReport,
  SwiggyDocsTwinExplorer,
  SwiggyFaqAnswerResolution,
  SwiggyFaqPolicyCenter,
  SwiggyFaqResolutionCenter,
  SwiggyGrowthPartnershipCenter,
  SwiggyGrowthPartnershipAskPacket,
  SwiggyTalentSignalCenter,
  SwiggyTalentOutreachPacket,
  SwiggyDemoEvidenceDirector,
  SwiggyInteractionQaCenter,
  SwiggyPartnerSupportRoom,
  SwiggyShowcaseSubmissionComposition,
  SwiggyShowcaseSubmissionCenter,
  SwiggySubmissionTimelineCheckpoint,
  SwiggySubmissionTimelineCenter,
  SwiggyPartnerSuccessDesk,
  SwiggyPartnerSuccessHandoffPacket,
  SwiggyPartnerSupportPacket,
  SwiggyInteractionQaRehearsal,
  SwiggyLlmsManifestVerifier,
  SwiggyInnovationRadarReport,
  SwiggyJourneyCompilerReport,
  SwiggyLoadLabReport,
  SwiggyLocationSelectionDecision,
  SwiggyLocationTrustReport,
  SwiggyOfferDecision,
  SwiggyOfferIntelligenceReport,
  SwiggyOperatingContractCenterReport,
  SwiggyOrderLifecycleProbe,
  SwiggyOrderLifecycleReport,
  SwiggyMealWindow,
  SwiggyMealWindowCenter,
  SwiggyMealWindowForecast,
  SwiggyPaymentTruthCenter,
  SwiggyPaymentTruthReconciliation,
  SwiggyQuotaNegotiationCenter,
  SwiggyScenarioRunnerReport,
  SwiggySourceIntelligenceReport,
  SwiggyQualityFeedbackAnalysis,
  SwiggyQualityLoopCenter,
  SwiggyRitualAutopilotCadence,
  SwiggyRitualAutopilotCenter,
  SwiggyRitualAutopilotPlan,
  SwiggyStagingCredentialDrillReport,
  SwiggyStagingSeedSmokeCenter,
  SwiggyStagingCutoverRehearsal,
  SwiggyStagingReplayCenter,
  SwiggyStagingReplayExecution,
  SwiggyLiveSignalCalibrationReport,
  SwiggySurfaceContractRehearsal,
  SwiggySurfaceRehearsalTarget,
  SwiggyStateOrchestratorReport,
  SwiggyToolContractMatrix,
  SwiggyToolParityAuditor,
  SwiggyUpstreamWatchReport,
  SwiggyWebsiteAtlas,
  SwiggyWidgetRuntimeReport,
  SwiggyVisualDishCaptureAnalysis,
  SwiggyVisualDishCaptureCenter,
  SwiggyVisualDishCaptureIntent,
  SwiggyVoiceCommerceCenter,
  SwiggyVoiceCommerceRehearsal,
  TrackingEvent,
  UserPlanningRequest,
  UserProfile,
  VersionMonitor,
  VisualQaCaptureMode,
  VisualQaCenter,
  VisualQaRehearsal,
  VisualQaViewport,
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

export function fetchSwiggyHandshakeDoctor() {
  return requestJson<{ handshakeDoctor: SwiggyHandshakeDoctor }>("/api/mcp/handshake-doctor");
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

export function executeMcpResourcePrompt(input: {
  server: "food" | "instamart" | "dineout";
  method: "resources/list" | "resources/read" | "prompts/list" | "prompts/get";
  params?: Record<string, unknown>;
}) {
  return requestJson<{ resourcePromptExecution: McpResourcePromptExecution }>(
    "/api/mcp/resource-prompt-studio/execute",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
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

export function rehearseSwiggySurfaceContract(input: {
  sessionId: string;
  scenarioId?: string;
  preferredSurface?: SwiggySurfaceRehearsalTarget;
}) {
  return requestJson<{ surfaceRehearsal: SwiggySurfaceContractRehearsal }>(
    "/api/mcp/state-orchestrator/rehearse-surface",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyWidgetRuntime() {
  return requestJson<{ widgetRuntime: SwiggyWidgetRuntimeReport }>("/api/mcp/widget-runtime");
}

export function fetchSwiggyWidgetExperienceComposer() {
  return requestJson<{ widgetExperience: SwiggyWidgetExperienceComposer }>("/api/swiggy-widget-experience-composer");
}

export function fetchSwiggyHostedWidgetActivationCenter() {
  return requestJson<{ hostedWidgetActivation: SwiggyHostedWidgetActivationCenter }>(
    "/api/swiggy-hosted-widget-activation",
  );
}

export function fetchSwiggyAgentExperienceBenchmark() {
  return requestJson<{ agentBenchmark: SwiggyAgentExperienceBenchmark }>("/api/swiggy-agent-experience-benchmark");
}

export function fetchSwiggyPrivatePilotControlRoom() {
  return requestJson<{ privatePilot: SwiggyPrivatePilotControlRoom }>("/api/swiggy-private-pilot-control-room");
}

export function fetchSwiggyStagingReplayCenter() {
  return requestJson<{ stagingReplay: SwiggyStagingReplayCenter }>("/api/swiggy-staging-replay");
}

export function runSwiggyStagingReplay(input: {
  server: "food" | "instamart" | "dineout";
  tool: string;
  arguments?: Record<string, unknown>;
}) {
  return requestJson<{ replayExecution: SwiggyStagingReplayExecution }>("/api/swiggy-staging-replay/run", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchCommercialActionGuard() {
  return requestJson<{ commercialActionGuard: CommercialActionGuardReport }>("/api/mcp/commercial-action-guard");
}

export function fetchSwiggyStagingCutover() {
  return requestJson<{ stagingCutover: SwiggyStagingCutoverRehearsal }>("/api/mcp/staging-cutover");
}

export function fetchSwiggyStagingCredentialDrill() {
  return requestJson<{ stagingCredentialDrill: SwiggyStagingCredentialDrillReport }>(
    "/api/swiggy-staging-credential-drill",
  );
}

export function fetchSwiggyStagingSeedSmokeCenter() {
  return requestJson<{ stagingSeedSmoke: SwiggyStagingSeedSmokeCenter }>(
    "/api/swiggy-staging-seed-smoke-center",
  );
}

export function fetchSwiggyLiveSignalCalibration() {
  return requestJson<{ liveSignalCalibration: SwiggyLiveSignalCalibrationReport }>(
    "/api/swiggy-live-signal-calibration",
  );
}

export function fetchSwiggyBuildersMap() {
  return requestJson<{ map: SwiggyBuildersMap }>("/api/swiggy-builders-map");
}

export function fetchSwiggyWebsiteAtlas() {
  return requestJson<{ atlas: SwiggyWebsiteAtlas }>("/api/swiggy-website-atlas");
}

export function fetchSwiggyBuildersSiteParity() {
  return requestJson<{ buildersSiteParity: SwiggyBuildersSiteParityAuditor }>("/api/swiggy-builders-site-parity");
}

export function fetchSwiggyBuildersPageMesh() {
  return requestJson<{ buildersPageMesh: SwiggyBuildersPageMeshAuditor }>("/api/swiggy-builders-page-mesh");
}

export function fetchSwiggyBuildersLaunchStory() {
  return requestJson<{ launchStory: SwiggyBuildersLaunchStoryCenterReport }>("/api/swiggy-builders-launch-story");
}

export function fetchSwiggyBuildersModuleIntelligence() {
  return requestJson<{ moduleIntelligence: SwiggyBuildersModuleIntelligenceCenter }>(
    "/api/swiggy-builders-module-intelligence",
  );
}

export function fetchSwiggyBuildersJourneyGates() {
  return requestJson<{ journeyGates: SwiggyBuildersJourneyGateCenter }>(
    "/api/swiggy-builders-journey-gates",
  );
}

export function fetchSwiggyBuildersHomepageExperience() {
  return requestJson<{ homepageExperience: SwiggyBuildersHomepageExperienceCenter }>(
    "/api/swiggy-builders-homepage-experience",
  );
}

export function fetchSwiggyBuildersSourceEvolution() {
  return requestJson<{ sourceEvolution: SwiggyBuildersSourceEvolutionCenter }>(
    "/api/swiggy-builders-source-evolution",
  );
}

export function fetchSwiggyBuildersLiveSourceResilience() {
  return requestJson<{ liveSourceResilience: SwiggyBuildersLiveSourceResilienceCenter }>(
    "/api/swiggy-builders-live-source-resilience",
  );
}

export function fetchSwiggyBuildersReviewDecision() {
  return requestJson<{ reviewDecision: SwiggyBuildersReviewDecisionCenter }>(
    "/api/swiggy-builders-review-decision",
  );
}

export function fetchSwiggyOperatingContractCenter() {
  return requestJson<{ operatingContract: SwiggyOperatingContractCenterReport }>(
    "/api/swiggy-operating-contract-center",
  );
}

export function fetchSwiggyBuilderIntake() {
  return requestJson<{ intake: SwiggyBuilderIntakeCommandCenter }>("/api/swiggy-builder-intake");
}

export function fetchSwiggyFaqPolicyCenter() {
  return requestJson<{ faqPolicy: SwiggyFaqPolicyCenter }>("/api/swiggy-faq-policy");
}

export function fetchSwiggyFaqResolutionCenter() {
  return requestJson<{ faqResolution: SwiggyFaqResolutionCenter }>("/api/swiggy-faq-resolution-center");
}

export function answerSwiggyFaqQuestion(question: string) {
  return requestJson<{ faqAnswer: SwiggyFaqAnswerResolution }>("/api/swiggy-faq-resolution-center/answer", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export function fetchSwiggyGrowthPartnershipCenter() {
  return requestJson<{ growthPartnership: SwiggyGrowthPartnershipCenter }>("/api/swiggy-growth-partnership");
}

export function composeSwiggyGrowthPartnershipAsk(input: {
  experimentId: string;
  askId: string;
  audienceNote: string;
}) {
  return requestJson<{ growthAsk: SwiggyGrowthPartnershipAskPacket }>("/api/swiggy-growth-partnership/compose", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyTalentSignalCenter() {
  return requestJson<{ talentSignal: SwiggyTalentSignalCenter }>("/api/swiggy-talent-signal-center");
}

export function composeSwiggyTalentOutreach(input: {
  pathId: string;
  demoUrl: string;
  githubUrl: string;
  technicalSummary: string;
}) {
  return requestJson<{ talentOutreach: SwiggyTalentOutreachPacket }>(
    "/api/swiggy-talent-signal-center/compose",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyConversionCenter() {
  return requestJson<{ conversion: SwiggyConversionCenter }>("/api/swiggy-conversion-center");
}

export function fetchSwiggyBenefitsActivationCenter() {
  return requestJson<{ benefitsActivation: SwiggyBenefitsActivationCenter }>(
    "/api/swiggy-benefits-activation-center",
  );
}

export function activateSwiggyBenefit(benefitId: string) {
  return requestJson<{ benefitsExecution: SwiggyBenefitsActivationExecution }>(
    "/api/swiggy-benefits-activation-center/activate",
    {
      method: "POST",
      body: JSON.stringify({ benefitId }),
    },
  );
}

export function fetchSwiggyShowcaseSubmissionCenter() {
  return requestJson<{ showcaseSubmission: SwiggyShowcaseSubmissionCenter }>(
    "/api/swiggy-showcase-submission-center",
  );
}

export function composeSwiggyShowcaseSubmission(input: {
  demoUrl: string;
  githubUrl: string;
  operatorEmail: string;
  note?: string;
}) {
  return requestJson<{ showcaseComposition: SwiggyShowcaseSubmissionComposition }>(
    "/api/swiggy-showcase-submission-center/compose",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyDemoEvidenceDirector() {
  return requestJson<{ demoEvidence: SwiggyDemoEvidenceDirector }>("/api/swiggy-demo-evidence-director");
}

export function fetchSwiggySubmissionTimelineCenter() {
  return requestJson<{ submissionTimeline: SwiggySubmissionTimelineCenter }>(
    "/api/swiggy-submission-timeline-center",
  );
}

export function runSwiggySubmissionTimelineCheckpoint(input: SwiggySubmissionTimelineCheckpoint["inputs"]) {
  return requestJson<{ submissionTimelineCheckpoint: SwiggySubmissionTimelineCheckpoint }>(
    "/api/swiggy-submission-timeline-center/checkpoint",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyPartnerSuccessDesk() {
  return requestJson<{ partnerSuccess: SwiggyPartnerSuccessDesk }>("/api/swiggy-partner-success-desk");
}

export function composeSwiggyPartnerSuccessHandoff(input: {
  laneId: string;
  operatorEmail: string;
  launchWindow: string;
  contextNote: string;
}) {
  return requestJson<{ partnerSuccessHandoff: SwiggyPartnerSuccessHandoffPacket }>(
    "/api/swiggy-partner-success-desk/compose",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyPartnerSupportRoom() {
  return requestJson<{ partnerSupport: SwiggyPartnerSupportRoom }>("/api/swiggy-partner-support-room");
}

export function composeSwiggyPartnerSupportPacket(input: {
  channelId: string;
  incidentLaneId: string;
  operatorEmail: string;
  sessionId: string;
  summary: string;
}) {
  return requestJson<{ partnerSupportPacket: SwiggyPartnerSupportPacket }>(
    "/api/swiggy-partner-support-room/compose",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyInteractionQaCenter() {
  return requestJson<{ interactionQa: SwiggyInteractionQaCenter }>("/api/swiggy-interaction-qa-center");
}

export function rehearseSwiggyInteractionQa(input: {
  laneId: string;
  operatorEmail: string;
  evidenceNote: string;
  dryRunConfirmed: boolean;
}) {
  return requestJson<{ interactionQaRehearsal: SwiggyInteractionQaRehearsal }>(
    "/api/swiggy-interaction-qa-center/rehearse",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchChannelMultimodalStudio() {
  return requestJson<{ channelMultimodalStudio: SwiggyChannelMultimodalStudio }>("/api/channel-multimodal-studio");
}

export function composeSwiggyChannelExecutionPacket(input: {
  laneId: string;
  channelId: string;
  operatorEmail: string;
  userTrigger: string;
  dryRunConfirmed: boolean;
}) {
  return requestJson<{ channelExecutionComposition: SwiggyChannelExecutionComposition }>(
    "/api/channel-multimodal-studio/compose",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyVisualDishCapture() {
  return requestJson<{ visualDishCapture: SwiggyVisualDishCaptureCenter }>("/api/swiggy-visual-dish-capture");
}

export function analyzeSwiggyVisualDishCapture(input: {
  intent: SwiggyVisualDishCaptureIntent;
  caption: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  imageName?: string;
}) {
  return requestJson<{ analysis: SwiggyVisualDishCaptureAnalysis }>("/api/swiggy-visual-dish-capture/analyze", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyVoiceCommerceCenter() {
  return requestJson<{ voiceCommerce: SwiggyVoiceCommerceCenter }>("/api/swiggy-voice-commerce-center");
}

export function rehearseSwiggyVoiceCommerce(input: {
  utterance: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
}) {
  return requestJson<{ rehearsal: SwiggyVoiceCommerceRehearsal }>("/api/swiggy-voice-commerce-center/rehearse", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyQualityLoopCenter() {
  return requestJson<{ qualityLoop: SwiggyQualityLoopCenter }>("/api/swiggy-quality-loop-center");
}

export function analyzeSwiggyQualityFeedback(input: {
  server: "food" | "instamart" | "dineout" | "combined";
  rating: number;
  comment: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  consentToLearn: boolean;
}) {
  return requestJson<{ analysis: SwiggyQualityFeedbackAnalysis }>("/api/swiggy-quality-loop-center/feedback", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyRitualAutopilotCenter() {
  return requestJson<{ ritualAutopilot: SwiggyRitualAutopilotCenter }>("/api/swiggy-ritual-autopilot-center");
}

export function planSwiggyRitualAutopilot(input: {
  cadence: SwiggyRitualAutopilotCadence;
  householdMode: "solo" | "couple" | "family" | "team";
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  budget: number;
  consentToUseHistory: boolean;
}) {
  return requestJson<{ ritualPlan: SwiggyRitualAutopilotPlan }>("/api/swiggy-ritual-autopilot-center/plan", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyPaymentTruthCenter() {
  return requestJson<{ paymentTruth: SwiggyPaymentTruthCenter }>("/api/swiggy-payment-truth-center");
}

export function fetchSwiggyMealWindowCenter() {
  return requestJson<{ mealWindow: SwiggyMealWindowCenter }>("/api/swiggy-meal-window-intelligence");
}

export function forecastSwiggyMealWindow(input: {
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  window: SwiggyMealWindow;
  partySize: number;
  urgency: "now" | "today" | "this_week";
  includeDineout: boolean;
}) {
  return requestJson<{ forecast: SwiggyMealWindowForecast }>("/api/swiggy-meal-window-intelligence/forecast", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyCustomizationStudio() {
  return requestJson<{ customizationStudio: SwiggyCustomizationStudio }>("/api/swiggy-customization-studio");
}

export function validateSwiggyCustomization(input: {
  server: "food" | "instamart" | "dineout" | "combined";
  intent: string;
  hasAllergy: boolean;
  userChangedVariant: boolean;
  quantity: number;
  includeDineout: boolean;
}) {
  return requestJson<{ validation: SwiggyCustomizationValidation }>("/api/swiggy-customization-studio/validate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function reconcileSwiggyPaymentTruth(input: {
  server: "food" | "instamart" | "dineout" | "combined";
  cartTotal: number;
  expectedDiscount: number;
  paymentPreference: "cod" | "online" | "free_booking" | "unknown";
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
}) {
  return requestJson<{ reconciliation: SwiggyPaymentTruthReconciliation }>(
    "/api/swiggy-payment-truth-center/reconcile",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchNutritionBudgetIntelligence() {
  return requestJson<{ nutritionBudget: NutritionBudgetIntelligence }>("/api/nutrition-budget-intelligence");
}

export function adviseNutritionBudget(input: {
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  budget: number;
  proteinTargetGrams: number;
  partySize: number;
  preference: "food" | "instamart" | "dineout" | "combined";
  couponSensitive: boolean;
  includeDineout: boolean;
}) {
  return requestJson<{ nutritionAdvice: NutritionBudgetAdvice }>("/api/nutrition-budget-intelligence/advise", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchHouseholdPreferenceGraph() {
  return requestJson<{ householdPreference: HouseholdPreferenceGraph }>("/api/household-preference-graph");
}

export function simulateHouseholdPreference(input: {
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  householdMode: "primary_planner" | "family_group" | "office_team" | "weekend_guest";
  preferredServer: "food" | "instamart" | "dineout" | "combined";
  consentToUseHistory: boolean;
  recentFailure: boolean;
  occasionMode: boolean;
}) {
  return requestJson<{ preferenceSimulation: HouseholdPreferenceSimulation }>("/api/household-preference-graph/simulate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchGuestCollaborationCenter() {
  return requestJson<{ guestCollaboration: GuestCollaborationCenter }>("/api/guest-collaboration-calendar");
}

export function composeGuestCollaborationHandoff(input: {
  templateId: string;
  channel: GuestCollaborationChannel;
  guestCount: number;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  includeDineout: boolean;
}) {
  return requestJson<{ guestCollaborationHandoff: GuestCollaborationComposition }>(
    "/api/guest-collaboration-calendar/compose",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchLuxuryExperienceWorkspace() {
  return requestJson<{ luxuryExperience: LuxuryExperienceWorkspace }>("/api/luxury-experience-workspace");
}

export function composeLuxuryExperienceWorkspace(input: {
  modeId: "lean" | "premium" | "family" | "social" | "training";
  workspaceId: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  guestCount: number;
  budget: number;
  includeDineout: boolean;
}) {
  return requestJson<{ luxuryExperienceComposition: LuxuryExperienceComposition }>(
    "/api/luxury-experience-workspace/compose",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchReviewerArtifactVault() {
  return requestJson<{ reviewerArtifactVault: ReviewerArtifactVault }>("/api/reviewer-artifact-vault");
}

export function composeReviewerArtifactPacket(input: {
  sectionId: string;
  channel: ReviewerArtifactPacketChannel;
  audience: "builder_access" | "demo_review" | "partner_support";
  includeScreenshots: boolean;
  includeDemoVideo: boolean;
  includeCredentialGates: boolean;
}) {
  return requestJson<{ reviewerArtifactPacket: ReviewerArtifactPacketComposition }>(
    "/api/reviewer-artifact-vault/compose",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchVisualQaCenter() {
  return requestJson<{ visualQa: VisualQaCenter }>("/api/visual-qa-center");
}

export function rehearseVisualQaCapture(input: {
  targetGroupId: string;
  viewport: VisualQaViewport;
  captureMode: VisualQaCaptureMode;
  includeSwiggyWidgets: boolean;
  includeManualAttachments: boolean;
}) {
  return requestJson<{ visualQaRehearsal: VisualQaRehearsal }>("/api/visual-qa-center/rehearse", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyDocsCoverage() {
  return requestJson<{ docsCoverage: SwiggyDocsCoverageReport }>("/api/swiggy-docs-coverage");
}

export function fetchSwiggyDocsTwinExplorer() {
  return requestJson<{ docsTwinExplorer: SwiggyDocsTwinExplorer }>("/api/swiggy-docs-twin-explorer");
}

export function fetchSwiggyLlmsManifestVerifier() {
  return requestJson<{ llmsManifest: SwiggyLlmsManifestVerifier }>("/api/swiggy-llms-manifest-verifier");
}

export function fetchSwiggyToolParityAuditor() {
  return requestJson<{ toolParityAuditor: SwiggyToolParityAuditor }>("/api/swiggy-tool-parity-auditor");
}

export function fetchSwiggyUpstreamWatch() {
  return requestJson<{ upstreamWatch: SwiggyUpstreamWatchReport }>("/api/swiggy-upstream-watch");
}

export function fetchSwiggySourceIntelligence() {
  return requestJson<{ sourceIntelligence: SwiggySourceIntelligenceReport }>("/api/swiggy-source-intelligence");
}

export function fetchSwiggyDeepSiteMap() {
  return requestJson<{ deepSiteMap: SwiggyDeepSiteMap }>("/api/swiggy-deep-site-map");
}

export function fetchDeveloperQuickstartWorkbench() {
  return requestJson<{ quickstartWorkbench: DeveloperQuickstartWorkbench }>("/api/swiggy-developer-quickstart");
}

export function runDeveloperQuickstartFirstCall(input: {
  drillId: "food_get_addresses" | "food_search_restaurants" | "instamart_search_products" | "dineout_search_restaurants";
}) {
  return requestJson<{ firstCallExecution: DeveloperFirstCallExecution }>(
    "/api/swiggy-developer-quickstart/run-first-call",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyCtaExecutionCenter() {
  return requestJson<{ ctaExecution: SwiggyCtaExecutionCenter }>("/api/swiggy-cta-execution-center");
}

export function fetchSwiggyCtaLiveAudit() {
  return requestJson<{ ctaLiveAudit: SwiggyCtaLiveAuditor }>("/api/swiggy-cta-live-audit");
}

export function fetchSwiggyInnovationRadar() {
  return requestJson<{ innovationRadar: SwiggyInnovationRadarReport }>("/api/swiggy-innovation-radar");
}

export function fetchAiClientConnectKit() {
  return requestJson<{ connectKit: AiClientConnectKit }>("/api/ai-client-connect-kit");
}

export function validateAiClientConfig(input: { targetId: AiClientTarget; config?: Record<string, unknown> }) {
  return requestJson<{ validation: AiClientConfigValidation }>("/api/ai-client-connect-kit/validate-config", {
    method: "POST",
    body: JSON.stringify(input),
  });
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

export function fetchSwiggyAccessEvidenceMatrix() {
  return requestJson<{ accessEvidenceMatrix: SwiggyAccessEvidenceMatrix }>("/api/swiggy-access-evidence-matrix");
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

export function fetchSwiggyCredentialVaultCenter() {
  return requestJson<{ credentialVault: SwiggyCredentialVaultCenter }>("/api/swiggy-credential-vault-center");
}

export function fetchSwiggyCredentialHandoffCenter() {
  return requestJson<{ credentialHandoff: SwiggyCredentialHandoffCenter }>(
    "/api/swiggy-credential-handoff-center",
  );
}

export function fetchSandboxCredentialWorkbench() {
  return requestJson<{ sandboxWorkbench: SandboxCredentialWorkbench }>("/api/sandbox-credential-workbench");
}

export function fetchSwiggyAuthStatus() {
  return requestJson<{ authStatus: SwiggyAuthStatusReport }>("/api/auth/swiggy/status");
}

export function fetchSwiggyAuthLifecycleCenter() {
  return requestJson<{ authLifecycleCenter: SwiggyAuthLifecycleCenterReport }>("/api/swiggy-auth-lifecycle-center");
}

export function fetchEnterpriseDelegatedAuthCenter() {
  return requestJson<{ enterpriseAuth: EnterpriseDelegatedAuthCenter }>("/api/enterprise-delegated-auth");
}

export function fetchEnterprisePlatformCenter() {
  return requestJson<{ enterprisePlatform: EnterprisePlatformCenterReport }>("/api/enterprise-platform-center");
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

export function executeSupportBridgeReport(input: {
  server: "food" | "instamart" | "dineout";
  failedTool: string;
  severity: "S0" | "S1" | "S2" | "S3";
  errorMessage: string;
  flowDescription: string;
  userNotes: string;
  toolContext?: Record<string, unknown>;
  sessionId?: string;
  issueObserved: boolean;
  userConsented: boolean;
}) {
  return requestJson<{ supportExecution: SupportBridgeExecution }>("/api/support/bridge/report", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSloIncidentCommand() {
  return requestJson<{ sloIncident: SloIncidentCommandCenter }>("/api/slo-incident-command");
}

export function fetchErrorIntelligence() {
  return requestJson<{ errorIntelligence: ErrorIntelligenceReport }>("/api/error-intelligence");
}

export function classifySwiggyMcpError(input: {
  server: "food" | "instamart" | "dineout";
  tool: string;
  httpStatus: number;
  jsonRpcCode?: number;
  success?: false;
  message: string;
  symbolicCode?: string;
  routeClass?: "read" | "cart_mutation" | "coupon" | "commercial_action" | "tracking" | "support";
}) {
  return requestJson<{ classification: ErrorClassificationResult }>("/api/error-intelligence/classify", {
    method: "POST",
    body: JSON.stringify(input),
  });
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

export function fetchSwiggyLoadLab() {
  return requestJson<{ loadLab: SwiggyLoadLabReport }>("/api/swiggy-load-lab");
}

export function fetchSwiggyQuotaNegotiationCenter() {
  return requestJson<{ quotaNegotiation: SwiggyQuotaNegotiationCenter }>("/api/swiggy-quota-negotiation-center");
}

export function fetchSwiggyOfferIntelligence() {
  return requestJson<{ offerIntelligence: SwiggyOfferIntelligenceReport }>("/api/swiggy-offer-intelligence");
}

export function decideSwiggyOffer(input: {
  server: "food" | "instamart" | "dineout" | "combined";
  offerType: "food_coupon" | "dineout_deal" | "instamart_value" | "combined_savings";
  cartFresh: boolean;
  paymentMode: "cod" | "online" | "free_booking" | "unknown";
  claimedSavings: number;
  userConfirmed: boolean;
}) {
  return requestJson<{ offerDecision: SwiggyOfferDecision }>("/api/swiggy-offer-intelligence/decide", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyOrderLifecycle() {
  return requestJson<{ orderLifecycle: SwiggyOrderLifecycleReport }>("/api/swiggy-order-lifecycle");
}

export function probeSwiggyOrderLifecycle(input: {
  server: "food" | "instamart" | "dineout";
  trigger: "user_tracking_refresh" | "commercial_action_timeout" | "commercial_action_5xx" | "user_retry_request" | "support_request";
  currentStatus: "known_active" | "known_completed" | "not_found" | "unknown";
  statusAgeSeconds: number;
  orderOrBookingId?: string;
  userConfirmedRetry: boolean;
}) {
  return requestJson<{ lifecycleProbe: SwiggyOrderLifecycleProbe }>("/api/swiggy-order-lifecycle/probe", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyLocationTrust() {
  return requestJson<{ locationTrust: SwiggyLocationTrustReport }>("/api/swiggy-location-trust");
}

export function selectSwiggyLocation(input: {
  server: "food" | "instamart" | "dineout" | "combined";
  sourceTool: "get_addresses" | "get_saved_locations" | "create_address" | "delete_address";
  selectedLabel: string;
  userConfirmed: boolean;
  downstreamIntent:
    | "food_discovery"
    | "instamart_discovery"
    | "dineout_discovery"
    | "cart_checkout"
    | "combined_plan"
    | "address_create"
    | "address_delete";
  previousContextFresh: boolean;
}) {
  return requestJson<{ locationDecision: SwiggyLocationSelectionDecision }>("/api/swiggy-location-trust/select", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyCartMutationWorkbench() {
  return requestJson<{ cartMutation: SwiggyCartMutationReport }>("/api/swiggy-cart-mutation-workbench");
}

export function mutateSwiggyCart(input: {
  server: "food" | "instamart" | "dineout";
  mutationTool: "update_food_cart" | "flush_food_cart" | "update_cart" | "clear_cart" | "create_cart";
  toolArguments?: Record<string, unknown>;
  contextFresh: boolean;
  userConfirmed: boolean;
  commercialActionRequested: boolean;
}) {
  return requestJson<{ cartMutation: SwiggyCartMutationExecution }>("/api/swiggy-cart-mutation-workbench/mutate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyDiscoveryFreshness() {
  return requestJson<{ discoveryFreshness: SwiggyDiscoveryFreshnessReport }>("/api/swiggy-discovery-freshness");
}

export function resolveSwiggyDiscoveryFreshness(input: {
  server: "food" | "instamart" | "dineout";
  discoveryTool:
    | "search_restaurants"
    | "get_restaurant_menu"
    | "search_menu"
    | "search_products"
    | "your_go_to_items"
    | "search_restaurants_dineout"
    | "get_restaurant_details"
    | "get_available_slots";
  toolArguments?: Record<string, unknown>;
  contextFresh: boolean;
  userSelectedResult: boolean;
  downstreamIntent: "browse" | "cart_mutation" | "booking" | "combined_plan";
}) {
  return requestJson<{ discoveryResolution: SwiggyDiscoveryResolution }>("/api/swiggy-discovery-freshness/resolve", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSwiggyConfirmationCommandCenter() {
  return requestJson<{ confirmationCommandCenter: SwiggyConfirmationCommandCenterReport }>(
    "/api/swiggy-confirmation-command-center",
  );
}

export function executeSwiggyConfirmationCommand(input: {
  server: "food" | "instamart" | "dineout";
  actionTool: "place_food_order" | "checkout" | "book_table";
  preflightArguments?: Record<string, unknown>;
  actionArguments?: Record<string, unknown>;
  statusProbeArguments?: Record<string, unknown>;
  contextFresh: boolean;
  userConfirmed: boolean;
  separateConfirmation: boolean;
  paymentOrFreeTruthAcknowledged: boolean;
  dineoutFreeBooking?: boolean;
  simulateAmbiguousResult?: boolean;
}) {
  return requestJson<{ confirmationExecution: SwiggyConfirmationExecution }>(
    "/api/swiggy-confirmation-command-center/execute",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function fetchSwiggyCancellationCareCenter() {
  return requestJson<{ cancellationCareCenter: SwiggyCancellationCareCenterReport }>(
    "/api/swiggy-cancellation-care-center",
  );
}

export function fetchSwiggyDineoutPrecisionCenter() {
  return requestJson<{ dineoutPrecisionCenter: SwiggyDineoutPrecisionCenterReport }>(
    "/api/swiggy-dineout-precision-center",
  );
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
