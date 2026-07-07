import {
  Activity,
  AlertTriangle,
  Bot,
  BookOpen,
  CalendarCheck,
  Camera,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileWarning,
  Gauge,
  GitBranch,
  Grid3X3,
  Loader2,
  LifeBuoy,
  LockKeyhole,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  MousePointerClick,
  Play,
  Radio,
  RefreshCw,
  Rocket,
  Route,
  ScrollText,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Terminal,
  Utensils,
  Users,
  X,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  activateSwiggyBenefit,
  answerSwiggyFaqQuestion,
  buildServerPlan,
  completeSwiggyAuth,
  composeGuestCollaborationHandoff,
  composeLuxuryExperienceWorkspace,
  composeReviewerArtifactPacket,
  composeSwiggyChannelExecutionPacket,
  composeSwiggyGrowthPartnershipAsk,
  composeSwiggyPartnerSuccessHandoff,
  composeSwiggyPartnerSupportPacket,
  composeSwiggyShowcaseSubmission,
  composeSwiggyTalentOutreach,
  addGroupMember,
  confirmAllRecommendations,
  confirmServerRecommendation,
  createSupportReport,
  deletePrivacyData,
  exportPrivacyData,
  fetchAccessSubmissionStudio,
  fetchAgentSurface,
  fetchAuditLedger,
  fetchBuilderPackage,
  fetchBuilderPackageMarkdown,
  fetchBuilderPacketExport,
  fetchBrandComplianceKit,
  fetchChannelMultimodalStudio,
  fetchSwiggyCartMutationWorkbench,
  fetchCartPreflight,
  fetchCodingAgentGovernance,
  fetchCommercialActionGuard,
  fetchComplianceEvidence,
  fetchDataGovernanceCenter,
  fetchCredentialOnboarding,
  fetchSwiggyCredentialHandoffCenter,
  fetchSwiggyCredentialVaultCenter,
  fetchDeveloperQuickstartWorkbench,
  fetchDemoStudio,
  fetchErrorIntelligence,
  fetchEnterpriseDelegatedAuthCenter,
  fetchEnterprisePlatformCenter,
  fetchEvaluationLab,
  fetchGoLive,
  fetchGroupPlan,
  fetchGuestCollaborationCenter,
  fetchHealth,
  fetchHouseholdPreferenceGraph,
  fetchSwiggyHandshakeDoctor,
  fetchLuxuryExperienceWorkspace,
  fetchMcpGateway,
  fetchMcpBackpressureGovernor,
  fetchMcpCatalog,
  fetchMcpCapabilityRegistry,
  fetchMcpResourcePromptStudio,
  fetchMcpToolLab,
  fetchSwiggyToolContractMatrix,
  fetchMcpReplay,
  fetchNutritionBudgetIntelligence,
  fetchObservabilityTraces,
  fetchOpsStatus,
  fetchPantry,
  fetchProfile,
  fetchPremiumConciergeItinerary,
  fetchPremiumUseCaseStudio,
  fetchProductionLaunchBundle,
  fetchRateLimitPlan,
  fetchReviewerProof,
  fetchReviewerArtifactVault,
  fetchResilience,
  fetchRuntimeTelemetry,
  fetchSandboxCredentialWorkbench,
  fetchSloIncidentCommand,
  fetchStagingCertificationMatrix,
  fetchSwiggyStagingCredentialDrill,
  fetchSwiggyStagingSeedSmokeCenter,
  fetchSwiggyLiveSignalCalibration,
  fetchStagingTranscript,
  fetchSubmissionConsole,
  fetchSubmissionPackage,
  fetchSupportBridge,
  fetchSwiggyAuthLifecycleCenter,
  fetchSwiggyAuthStatus,
  fetchSwiggyBuildersMap,
  fetchSwiggyBuildersPageMesh,
  fetchSwiggyBuildersSiteParity,
  fetchSwiggyBuilderIntake,
  fetchSwiggyBuildersLaunchStory,
  fetchSwiggyBuildersModuleIntelligence,
  fetchSwiggyBuildersJourneyGates,
  fetchSwiggyBuildersHomepageExperience,
  fetchSwiggyBuildersSourceEvolution,
  fetchSwiggyBuildersLiveSourceResilience,
  fetchSwiggyBuildersReviewDecision,
  fetchSwiggyBenefitsActivationCenter,
  fetchSwiggyOperatingContractCenter,
  fetchSwiggyFaqPolicyCenter,
  fetchSwiggyFaqResolutionCenter,
  fetchSwiggyGrowthPartnershipCenter,
  fetchSwiggyTalentSignalCenter,
  fetchSwiggyConversionCenter,
  fetchSwiggyShowcaseSubmissionCenter,
  fetchSwiggyDemoEvidenceDirector,
  fetchSwiggySubmissionTimelineCenter,
  fetchSwiggyInteractionQaCenter,
  fetchSwiggyAccessDossier,
  fetchSwiggyAccessEvidenceMatrix,
  fetchSwiggyDocsCoverage,
  fetchSwiggyDocsTwinExplorer,
  fetchSwiggyLlmsManifestVerifier,
  fetchSwiggyToolParityAuditor,
  fetchSwiggyDeepSiteMap,
  fetchSwiggyCancellationCareCenter,
  fetchSwiggyConfirmationCommandCenter,
  fetchSwiggyCustomizationStudio,
  fetchSwiggyDineoutPrecisionCenter,
  fetchSwiggyDiscoveryFreshness,
  fetchSwiggyCtaExecutionCenter,
  fetchSwiggyCtaLiveAudit,
  fetchSwiggyInnovationRadar,
  fetchSwiggyJourneyCompiler,
  fetchSwiggyPartnerSuccessDesk,
  fetchSwiggyPartnerSupportRoom,
  fetchSwiggyScenarioRunner,
  fetchSwiggySourceIntelligence,
  fetchSwiggyStagingCutover,
  fetchSwiggyStateOrchestrator,
  fetchSwiggyWidgetExperienceComposer,
  fetchSwiggyHostedWidgetActivationCenter,
  fetchSwiggyAgentExperienceBenchmark,
  fetchSwiggyPrivatePilotControlRoom,
  fetchSwiggyStagingReplayCenter,
  fetchSwiggyWidgetRuntime,
  fetchSwiggyUpstreamWatch,
  fetchSwiggyWebsiteAtlas,
  fetchSwiggyLoadLab,
  fetchSwiggyQuotaNegotiationCenter,
  fetchSwiggyLocationTrust,
  fetchSwiggyOfferIntelligence,
  fetchSwiggyOrderLifecycle,
  fetchSwiggyMealWindowCenter,
  fetchSwiggyPaymentTruthCenter,
  fetchSwiggyQualityLoopCenter,
  fetchSwiggyRitualAutopilotCenter,
  fetchSwiggyVisualDishCapture,
  fetchSwiggyVoiceCommerceCenter,
  fetchSwiggyRouteOptimizer,
  rehearseSwiggyInteractionQa,
  fetchTrafficReadinessPlan,
  fetchTracking,
  fetchVersionMonitor,
  fetchVisualQaCenter,
  fetchWidgets,
  adviseNutritionBudget,
  removeRecommendationItem,
  forecastSwiggyMealWindow,
  reconcileSwiggyPaymentTruth,
  runSwiggySubmissionTimelineCheckpoint,
  schedulePlan,
  simulateHouseholdPreference,
  startSwiggyAuth,
  substituteRecommendationItem,
  validateSwiggyCustomization,
  updateAccessSubmissionState,
  updateProfile,
  fetchAiClientConnectKit,
  type BuilderPackageResponse,
  type GoLiveResponse,
  type HealthResponse,
  type McpCatalogResponse,
} from "./api/mealpilotApi";
import mealPilotLogo from "./assets/mealpilot-logo.svg";
import { defaultUserProfile, normalizeListInput } from "./domain/profile";
import { buildConfirmationMessage } from "./domain/safety";
import type {
  AgentSurface,
  AgentSurfaceResponse,
  AccessSubmissionHandoffState,
  AccessSubmissionStudio,
  AuditLedgerCenter,
  AiClientConnectKit,
  BuilderPacketExport,
  BrandComplianceKit,
  CartPreflightReport,
  CommercialActionGuardReport,
  ComplianceEvidence,
  CodingAgentGovernance,
  CredentialOnboardingReport,
  DataGovernanceCenter,
  DemoStudioStep,
  DeveloperQuickstartWorkbench,
  EnterpriseDelegatedAuthCenter,
  EnterprisePlatformCenterReport,
  ErrorIntelligenceReport,
  EvaluationLab,
  GoLiveCheck,
  GuestCollaborationCenter,
  GuestCollaborationChannel,
  GuestCollaborationComposition,
  GroupPlan,
  HouseholdPreferenceGraph,
  HouseholdPreferenceSimulation,
  IncidentReport,
  LaunchBundle,
  LuxuryExperienceComposition,
  LuxuryExperienceMode,
  LuxuryExperienceWorkspace,
  MealPlan,
  McpBackpressureGovernorReport,
  McpCapabilityRegistry,
  McpGatewayStatus,
  McpResourcePromptStudio,
  McpToolLabReport,
  McpReplayStep,
  NutritionBudgetAdvice,
  NutritionBudgetIntelligence,
  ObservabilityMetric,
  ObservabilityTraceReport,
  OpsStatus,
  PantryItem,
  PremiumConciergeItineraryReport,
  PremiumUseCaseStudio,
  RateLimitPlan,
  Recommendation,
  Reminder,
  ResilienceDrill,
  ResilienceRunbook,
  ReviewerProof,
  ReviewerArtifactPacketChannel,
  ReviewerArtifactPacketComposition,
  ReviewerArtifactVault,
  RestockSuggestion,
  RuntimeTelemetryReport,
  SandboxCredentialWorkbench,
  SloIncidentCommandCenter,
  SubmissionConsole,
  SubmissionPackage,
  StagingCertificationMatrix,
  StagingTranscriptExport,
  SupportBridgeReport,
  SwiggyAuthLifecycleCenterReport,
  SwiggyAuthStatusReport,
  SwiggyBenefitsActivationCenter,
  SwiggyBenefitsActivationExecution,
  SwiggyAccessDossier,
  SwiggyAccessEvidenceMatrix,
  SwiggyBuildersHomepageExperienceCenter,
  SwiggyBuildersLaunchStoryCenterReport,
  SwiggyBuildersJourneyGateCenter,
  SwiggyBuildersLiveSourceResilienceCenter,
  SwiggyBuildersModuleIntelligenceCenter,
  SwiggyBuildersReviewDecisionCenter,
  SwiggyBuildersSourceEvolutionCenter,
  SwiggyBuildersPageMeshAuditor,
  SwiggyBuildersSiteParityAuditor,
  SwiggyBuilderIntakeCommandCenter,
  SwiggyCancellationCareCenterReport,
  SwiggyCartMutationReport,
  SwiggyChannelMultimodalStudio,
  SwiggyChannelExecutionComposition,
  SwiggyConfirmationCommandCenterReport,
  SwiggyCredentialHandoffCenter,
  SwiggyCredentialVaultCenter,
  SwiggyCustomizationStudio,
  SwiggyCustomizationValidation,
  SwiggyCtaExecutionCenter,
  SwiggyCtaLiveAuditor,
  SwiggyDeepSiteMap,
  SwiggyDineoutPrecisionCenterReport,
  SwiggyDiscoveryFreshnessReport,
  SwiggyWidget,
  SwiggyBuildersMap,
  SwiggyDocsCoverageReport,
  SwiggyDocsTwinExplorer,
  SwiggyFaqAnswerResolution,
  SwiggyFaqPolicyCenter,
  SwiggyFaqResolutionCenter,
  SwiggyGrowthPartnershipCenter,
  SwiggyGrowthPartnershipAskPacket,
  SwiggyTalentSignalCenter,
  SwiggyTalentOutreachPacket,
  SwiggyConversionCenter,
  SwiggyShowcaseSubmissionCenter,
  SwiggyDemoEvidenceDirector,
  SwiggySubmissionTimelineCenter,
  SwiggyInteractionQaCenter,
  SwiggyInteractionQaRehearsal,
  SwiggyPartnerSuccessDesk,
  SwiggyPartnerSuccessHandoffPacket,
  SwiggyPartnerSupportRoom,
  SwiggyPartnerSupportPacket,
  SwiggyHandshakeDoctor,
  SwiggyShowcaseSubmissionComposition,
  SwiggyLlmsManifestVerifier,
  SwiggySubmissionTimelineCheckpoint,
  SwiggyInnovationRadarReport,
  SwiggyJourneyCompilerReport,
  SwiggyLoadLabReport,
  SwiggyQuotaNegotiationCenter,
  SwiggyLocationTrustReport,
  SwiggyOfferIntelligenceReport,
  SwiggyOperatingContractCenterReport,
  SwiggyOrderLifecycleReport,
  SwiggyMealWindow,
  SwiggyMealWindowCenter,
  SwiggyMealWindowForecast,
  SwiggyPaymentTruthCenter,
  SwiggyPaymentTruthReconciliation,
  SwiggyQualityLoopCenter,
  SwiggyRitualAutopilotCenter,
  SwiggyScenarioRunnerReport,
  SwiggySourceIntelligenceReport,
  SwiggyStagingCredentialDrillReport,
  SwiggyStagingSeedSmokeCenter,
  SwiggyStagingCutoverRehearsal,
  SwiggyStagingReplayCenter,
  SwiggyLiveSignalCalibrationReport,
  SwiggyStateOrchestratorReport,
  SwiggyToolContractMatrix,
  SwiggyToolParityAuditor,
  SwiggyWebsiteAtlas,
  SwiggyUpstreamWatchReport,
  SwiggyWidgetExperienceComposer,
  SwiggyHostedWidgetActivationCenter,
  SwiggyAgentExperienceBenchmark,
  SwiggyPrivatePilotControlRoom,
  SwiggyWidgetRuntimeReport,
  SwiggyVisualDishCaptureCenter,
  SwiggyVoiceCommerceCenter,
  SwiggyRouteOptimizationReport,
  SwiggyServer,
  TrafficReadinessPlan,
  ToolCallEvent,
  UserPlanningRequest,
  UserProfile,
  VersionMonitor,
  VisualQaCenter,
} from "./domain/types";

const FAQ_ANSWER_SAMPLE_QUESTION = "What proof does Swiggy need before production access?";

const initialRequest: UserPlanningRequest = {
  prompt:
    "Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, dinner groceries for tonight, and a Dineout option for Saturday evening.",
  city: "Bengaluru",
  budget: 2000,
  diet: "high-protein vegetarian",
  guests: 4,
  day: "saturday",
};

const emptyAccessSubmissionState: AccessSubmissionHandoffState = {
  demoVideoUrl: "",
  technicalContactEmail: "",
  productionRedirectUri: "",
  staticEgressIp: "",
  environmentSummary: "",
  termsAcknowledged: false,
  notes: "",
  updatedAt: "",
};

const scenarios: Array<{
  label: string;
  request: UserPlanningRequest;
}> = [
  {
    label: "Workday protein",
    request: initialRequest,
  },
  {
    label: "Budget reset",
    request: {
      ...initialRequest,
      prompt: "Make this vegetarian plan cheaper but keep protein high and keep a Saturday table option.",
      budget: 1700,
    },
  },
  {
    label: "Delhi family dinner",
    request: {
      prompt:
        "Plan a vegetarian family dinner in Delhi NCR with groceries for tonight and a Dineout option for Sunday.",
      city: "Delhi NCR",
      budget: 2400,
      diet: "vegetarian",
      guests: 5,
      day: "sunday",
    },
  },
];

const navigationSections = [
  { href: "#planner", label: "Planner" },
  { href: "#recommendations", label: "Recommendations" },
  { href: "#launch-center", label: "Launch" },
  { href: "#production-evidence", label: "Evidence" },
  { href: "#demo-studio", label: "Demo" },
  { href: "#ops", label: "Ops" },
];

function formatMoney(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function serverIcon(server: SwiggyServer) {
  if (server === "food") return <Utensils aria-hidden="true" />;
  if (server === "instamart") return <ShoppingBasket aria-hidden="true" />;
  return <CalendarCheck aria-hidden="true" />;
}

function serverLabel(server: SwiggyServer) {
  if (server === "food") return "Food";
  if (server === "instamart") return "Instamart";
  return "Dineout";
}

function statusCopy(status: Recommendation["status"]) {
  if (status === "confirmed") return "Confirmed";
  if (status === "blocked") return "Blocked";
  return "Prepared";
}

async function fetchSourceIntelligenceOptional(): Promise<{ sourceIntelligence: SwiggySourceIntelligenceReport | null }> {
  try {
    return await fetchSwiggySourceIntelligence();
  } catch {
    return { sourceIntelligence: null };
  }
}

async function fetchInnovationRadarOptional(): Promise<{ innovationRadar: SwiggyInnovationRadarReport | null }> {
  try {
    return await fetchSwiggyInnovationRadar();
  } catch {
    return { innovationRadar: null };
  }
}

function MealPilotLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "mealpilot-logo compact" : "mealpilot-logo"}>
      <img src={mealPilotLogo} alt="" aria-hidden="true" />
      <span>
        <strong>MealPilot</strong>
        {!compact ? <small>Swiggy MCP operating system</small> : null}
      </span>
    </span>
  );
}

function App() {
  const [request, setRequest] = useState<UserPlanningRequest>(initialRequest);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [builderPackage, setBuilderPackage] = useState<BuilderPackageResponse | null>(null);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [restock, setRestock] = useState<RestockSuggestion[]>([]);
  const [groupPlan, setGroupPlan] = useState<GroupPlan | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [opsStatus, setOpsStatus] = useState<OpsStatus[]>([]);
  const [mcpGateway, setMcpGateway] = useState<McpGatewayStatus | null>(null);
  const [handshakeDoctor, setHandshakeDoctor] = useState<SwiggyHandshakeDoctor | null>(null);
  const [mcpCatalog, setMcpCatalog] = useState<McpCatalogResponse | null>(null);
  const [mcpCapabilityRegistry, setMcpCapabilityRegistry] = useState<McpCapabilityRegistry | null>(null);
  const [mcpResourcePromptStudio, setMcpResourcePromptStudio] = useState<McpResourcePromptStudio | null>(null);
  const [toolContractMatrix, setToolContractMatrix] = useState<SwiggyToolContractMatrix | null>(null);
  const [scenarioRunner, setScenarioRunner] = useState<SwiggyScenarioRunnerReport | null>(null);
  const [stateOrchestrator, setStateOrchestrator] = useState<SwiggyStateOrchestratorReport | null>(null);
  const [widgetRuntime, setWidgetRuntime] = useState<SwiggyWidgetRuntimeReport | null>(null);
  const [widgetExperience, setWidgetExperience] = useState<SwiggyWidgetExperienceComposer | null>(null);
  const [hostedWidgetActivation, setHostedWidgetActivation] =
    useState<SwiggyHostedWidgetActivationCenter | null>(null);
  const [agentBenchmark, setAgentBenchmark] = useState<SwiggyAgentExperienceBenchmark | null>(null);
  const [privatePilot, setPrivatePilot] = useState<SwiggyPrivatePilotControlRoom | null>(null);
  const [stagingReplay, setStagingReplay] = useState<SwiggyStagingReplayCenter | null>(null);
  const [commercialActionGuard, setCommercialActionGuard] = useState<CommercialActionGuardReport | null>(null);
  const [stagingCutover, setStagingCutover] = useState<SwiggyStagingCutoverRehearsal | null>(null);
  const [stagingCredentialDrill, setStagingCredentialDrill] =
    useState<SwiggyStagingCredentialDrillReport | null>(null);
  const [stagingSeedSmoke, setStagingSeedSmoke] = useState<SwiggyStagingSeedSmokeCenter | null>(null);
  const [liveSignalCalibration, setLiveSignalCalibration] =
    useState<SwiggyLiveSignalCalibrationReport | null>(null);
  const [mcpToolLab, setMcpToolLab] = useState<McpToolLabReport | null>(null);
  const [swiggyBuildersMap, setSwiggyBuildersMap] = useState<SwiggyBuildersMap | null>(null);
  const [swiggyWebsiteAtlas, setSwiggyWebsiteAtlas] = useState<SwiggyWebsiteAtlas | null>(null);
  const [buildersSiteParity, setBuildersSiteParity] = useState<SwiggyBuildersSiteParityAuditor | null>(null);
  const [buildersPageMesh, setBuildersPageMesh] = useState<SwiggyBuildersPageMeshAuditor | null>(null);
  const [buildersLaunchStory, setBuildersLaunchStory] = useState<SwiggyBuildersLaunchStoryCenterReport | null>(null);
  const [moduleIntelligence, setModuleIntelligence] = useState<SwiggyBuildersModuleIntelligenceCenter | null>(null);
  const [journeyGates, setJourneyGates] = useState<SwiggyBuildersJourneyGateCenter | null>(null);
  const [homepageExperience, setHomepageExperience] = useState<SwiggyBuildersHomepageExperienceCenter | null>(null);
  const [sourceEvolution, setSourceEvolution] = useState<SwiggyBuildersSourceEvolutionCenter | null>(null);
  const [liveSourceResilience, setLiveSourceResilience] =
    useState<SwiggyBuildersLiveSourceResilienceCenter | null>(null);
  const [reviewDecision, setReviewDecision] = useState<SwiggyBuildersReviewDecisionCenter | null>(null);
  const [operatingContract, setOperatingContract] = useState<SwiggyOperatingContractCenterReport | null>(null);
  const [swiggyDeepSiteMap, setSwiggyDeepSiteMap] = useState<SwiggyDeepSiteMap | null>(null);
  const [swiggyBuilderIntake, setSwiggyBuilderIntake] = useState<SwiggyBuilderIntakeCommandCenter | null>(null);
  const [swiggyFaqPolicy, setSwiggyFaqPolicy] = useState<SwiggyFaqPolicyCenter | null>(null);
  const [faqResolution, setFaqResolution] = useState<SwiggyFaqResolutionCenter | null>(null);
  const [faqAnswer, setFaqAnswer] = useState<SwiggyFaqAnswerResolution | null>(null);
  const [swiggyGrowthPartnership, setSwiggyGrowthPartnership] = useState<SwiggyGrowthPartnershipCenter | null>(null);
  const [talentSignal, setTalentSignal] = useState<SwiggyTalentSignalCenter | null>(null);
  const [conversionCenter, setConversionCenter] = useState<SwiggyConversionCenter | null>(null);
  const [benefitsActivation, setBenefitsActivation] = useState<SwiggyBenefitsActivationCenter | null>(null);
  const [showcaseSubmission, setShowcaseSubmission] = useState<SwiggyShowcaseSubmissionCenter | null>(null);
  const [demoEvidence, setDemoEvidence] = useState<SwiggyDemoEvidenceDirector | null>(null);
  const [submissionTimeline, setSubmissionTimeline] = useState<SwiggySubmissionTimelineCenter | null>(null);
  const [partnerSuccess, setPartnerSuccess] = useState<SwiggyPartnerSuccessDesk | null>(null);
  const [partnerSupport, setPartnerSupport] = useState<SwiggyPartnerSupportRoom | null>(null);
  const [interactionQa, setInteractionQa] = useState<SwiggyInteractionQaCenter | null>(null);
  const [channelMultimodalStudio, setChannelMultimodalStudio] =
    useState<SwiggyChannelMultimodalStudio | null>(null);
  const [visualDishCapture, setVisualDishCapture] = useState<SwiggyVisualDishCaptureCenter | null>(null);
  const [voiceCommerce, setVoiceCommerce] = useState<SwiggyVoiceCommerceCenter | null>(null);
  const [qualityLoop, setQualityLoop] = useState<SwiggyQualityLoopCenter | null>(null);
  const [ritualAutopilot, setRitualAutopilot] = useState<SwiggyRitualAutopilotCenter | null>(null);
  const [paymentTruth, setPaymentTruth] = useState<SwiggyPaymentTruthCenter | null>(null);
  const [mealWindow, setMealWindow] = useState<SwiggyMealWindowCenter | null>(null);
  const [customizationStudio, setCustomizationStudio] = useState<SwiggyCustomizationStudio | null>(null);
  const [nutritionBudget, setNutritionBudget] = useState<NutritionBudgetIntelligence | null>(null);
  const [householdPreference, setHouseholdPreference] = useState<HouseholdPreferenceGraph | null>(null);
  const [guestCollaboration, setGuestCollaboration] = useState<GuestCollaborationCenter | null>(null);
  const [luxuryExperience, setLuxuryExperience] = useState<LuxuryExperienceWorkspace | null>(null);
  const [reviewerArtifactVault, setReviewerArtifactVault] = useState<ReviewerArtifactVault | null>(null);
  const [visualQa, setVisualQa] = useState<VisualQaCenter | null>(null);
  const [swiggyDocsCoverage, setSwiggyDocsCoverage] = useState<SwiggyDocsCoverageReport | null>(null);
  const [docsTwinExplorer, setDocsTwinExplorer] = useState<SwiggyDocsTwinExplorer | null>(null);
  const [llmsManifest, setLlmsManifest] = useState<SwiggyLlmsManifestVerifier | null>(null);
  const [toolParityAuditor, setToolParityAuditor] = useState<SwiggyToolParityAuditor | null>(null);
  const [swiggyUpstreamWatch, setSwiggyUpstreamWatch] = useState<SwiggyUpstreamWatchReport | null>(null);
  const [swiggySourceIntelligence, setSwiggySourceIntelligence] =
    useState<SwiggySourceIntelligenceReport | null>(null);
  const [developerQuickstart, setDeveloperQuickstart] = useState<DeveloperQuickstartWorkbench | null>(null);
  const [ctaExecution, setCtaExecution] = useState<SwiggyCtaExecutionCenter | null>(null);
  const [ctaLiveAudit, setCtaLiveAudit] = useState<SwiggyCtaLiveAuditor | null>(null);
  const [swiggyInnovationRadar, setSwiggyInnovationRadar] = useState<SwiggyInnovationRadarReport | null>(null);
  const [aiClientConnectKit, setAiClientConnectKit] = useState<AiClientConnectKit | null>(null);
  const [codingAgentGovernance, setCodingAgentGovernance] = useState<CodingAgentGovernance | null>(null);
  const [brandCompliance, setBrandCompliance] = useState<BrandComplianceKit | null>(null);
  const [swiggyJourneyCompiler, setSwiggyJourneyCompiler] = useState<SwiggyJourneyCompilerReport | null>(null);
  const [swiggyAccessDossier, setSwiggyAccessDossier] = useState<SwiggyAccessDossier | null>(null);
  const [accessEvidenceMatrix, setAccessEvidenceMatrix] = useState<SwiggyAccessEvidenceMatrix | null>(null);
  const [premiumUseCaseStudio, setPremiumUseCaseStudio] = useState<PremiumUseCaseStudio | null>(null);
  const [premiumConciergeItinerary, setPremiumConciergeItinerary] =
    useState<PremiumConciergeItineraryReport | null>(null);
  const [stagingCertification, setStagingCertification] = useState<StagingCertificationMatrix | null>(null);
  const [credentialOnboarding, setCredentialOnboarding] = useState<CredentialOnboardingReport | null>(null);
  const [credentialVault, setCredentialVault] = useState<SwiggyCredentialVaultCenter | null>(null);
  const [credentialHandoff, setCredentialHandoff] = useState<SwiggyCredentialHandoffCenter | null>(null);
  const [sandboxCredentialWorkbench, setSandboxCredentialWorkbench] =
    useState<SandboxCredentialWorkbench | null>(null);
  const [enterpriseDelegatedAuth, setEnterpriseDelegatedAuth] = useState<EnterpriseDelegatedAuthCenter | null>(null);
  const [enterprisePlatformCenter, setEnterprisePlatformCenter] = useState<EnterprisePlatformCenterReport | null>(null);
  const [surfaceMode, setSurfaceMode] = useState<AgentSurface>("chat");
  const [agentSurface, setAgentSurface] = useState<AgentSurfaceResponse | null>(null);
  const [goLiveChecks, setGoLiveChecks] = useState<GoLiveCheck[]>([]);
  const [observabilityMetrics, setObservabilityMetrics] = useState<ObservabilityMetric[]>([]);
  const [rollout, setRollout] = useState<GoLiveResponse["rollout"] | null>(null);
  const [incidentReport, setIncidentReport] = useState<IncidentReport | null>(null);
  const [supportBridge, setSupportBridge] = useState<SupportBridgeReport | null>(null);
  const [preflight, setPreflight] = useState<CartPreflightReport | null>(null);
  const [mcpReplay, setMcpReplay] = useState<McpReplayStep[]>([]);
  const [stagingTranscript, setStagingTranscript] = useState<StagingTranscriptExport | null>(null);
  const [demoSteps, setDemoSteps] = useState<DemoStudioStep[]>([]);
  const [evaluationLab, setEvaluationLab] = useState<EvaluationLab | null>(null);
  const [submissionPackage, setSubmissionPackage] = useState<SubmissionPackage | null>(null);
  const [submissionConsole, setSubmissionConsole] = useState<SubmissionConsole | null>(null);
  const [builderPacketExport, setBuilderPacketExport] = useState<BuilderPacketExport | null>(null);
  const [accessSubmissionStudio, setAccessSubmissionStudio] = useState<AccessSubmissionStudio | null>(null);
  const [accessSubmissionForm, setAccessSubmissionForm] =
    useState<AccessSubmissionHandoffState>(emptyAccessSubmissionState);
  const [widgets, setWidgets] = useState<SwiggyWidget[]>([]);
  const [widgetBridge, setWidgetBridge] = useState<{ origin: string; sandbox: string; verifyOrigin: boolean } | null>(
    null,
  );
  const [rateLimit, setRateLimit] = useState<RateLimitPlan | null>(null);
  const [trafficReadiness, setTrafficReadiness] = useState<TrafficReadinessPlan | null>(null);
  const [backpressureGovernor, setBackpressureGovernor] = useState<McpBackpressureGovernorReport | null>(null);
  const [versionMonitor, setVersionMonitor] = useState<VersionMonitor | null>(null);
  const [complianceEvidence, setComplianceEvidence] = useState<ComplianceEvidence | null>(null);
  const [dataGovernance, setDataGovernance] = useState<DataGovernanceCenter | null>(null);
  const [reviewerProof, setReviewerProof] = useState<ReviewerProof | null>(null);
  const [launchBundle, setLaunchBundle] = useState<LaunchBundle | null>(null);
  const [errorIntelligence, setErrorIntelligence] = useState<ErrorIntelligenceReport | null>(null);
  const [resilienceDrills, setResilienceDrills] = useState<ResilienceDrill[]>([]);
  const [resilienceRunbook, setResilienceRunbook] = useState<ResilienceRunbook | null>(null);
  const [observabilityTraceReport, setObservabilityTraceReport] = useState<ObservabilityTraceReport | null>(null);
  const [runtimeTelemetry, setRuntimeTelemetry] = useState<RuntimeTelemetryReport | null>(null);
  const [auditLedger, setAuditLedger] = useState<AuditLedgerCenter | null>(null);
  const [sloIncident, setSloIncident] = useState<SloIncidentCommandCenter | null>(null);
  const [loadLab, setLoadLab] = useState<SwiggyLoadLabReport | null>(null);
  const [quotaNegotiation, setQuotaNegotiation] = useState<SwiggyQuotaNegotiationCenter | null>(null);
  const [offerIntelligence, setOfferIntelligence] = useState<SwiggyOfferIntelligenceReport | null>(null);
  const [orderLifecycle, setOrderLifecycle] = useState<SwiggyOrderLifecycleReport | null>(null);
  const [locationTrust, setLocationTrust] = useState<SwiggyLocationTrustReport | null>(null);
  const [cartMutation, setCartMutation] = useState<SwiggyCartMutationReport | null>(null);
  const [discoveryFreshness, setDiscoveryFreshness] = useState<SwiggyDiscoveryFreshnessReport | null>(null);
  const [confirmationCommandCenter, setConfirmationCommandCenter] =
    useState<SwiggyConfirmationCommandCenterReport | null>(null);
  const [cancellationCareCenter, setCancellationCareCenter] =
    useState<SwiggyCancellationCareCenterReport | null>(null);
  const [dineoutPrecisionCenter, setDineoutPrecisionCenter] =
    useState<SwiggyDineoutPrecisionCenterReport | null>(null);
  const [routeOptimizer, setRouteOptimizer] = useState<SwiggyRouteOptimizationReport | null>(null);
  const [exportText, setExportText] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [swiggyAuthStatus, setSwiggyAuthStatus] = useState<SwiggyAuthStatusReport | null>(null);
  const [authLifecycleCenter, setAuthLifecycleCenter] = useState<SwiggyAuthLifecycleCenterReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const confirmedCount = plan?.recommendations.filter((item) => item.status === "confirmed").length ?? 0;

  const readiness = useMemo(
    () => [
      { label: "Local dev stub", done: true },
      { label: "OAuth 2.1 PKCE shape", done: true },
      { label: "Food + Instamart + Dineout", done: true },
      { label: "Separate confirmation gates", done: true },
      { label: "No blind order retry", done: true },
      { label: "Staging credentials", done: false },
    ],
    [],
  );

  async function buildPlan(nextRequest = request) {
    setIsPlanning(true);
    setError(null);
    setActionNotice(null);
    try {
      const response = await buildServerPlan(nextRequest);
      setPlan(response.plan);
      setActionNotice("Plan refreshed with Food, Instamart, and Dineout recommendations.");
      void fetchAgentSurface(response.plan.id, surfaceMode)
        .then((surfaceResponse) => setAgentSurface(surfaceResponse.response))
        .catch(() => setAgentSurface(null));
      void refreshLaunchCenter().catch(() => undefined);
      void loadPlanDiagnostics(response.plan.id).catch(() => undefined);
    } catch (buildError) {
      setError(buildError instanceof Error ? buildError.message : "Unable to build MealPilot plan.");
    } finally {
      setIsPlanning(false);
    }
  }

  async function saveProfile(nextProfile = profile) {
    setError(null);
    setActionNotice(null);
    try {
      const response = await updateProfile(nextProfile);
      setProfile(response.profile);
      setActionNotice("Household profile saved and planner defaults updated.");
      setRequest((current) => ({
        ...current,
        city: response.profile.defaultCity,
        budget: response.profile.defaultBudget,
        diet: response.profile.diet,
        guests: response.profile.householdSize,
      }));
      const packageResponse = await fetchBuilderPackage();
      setBuilderPackage(packageResponse);
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Unable to save profile.");
    }
  }

  async function saveAccessSubmissionHandoff(nextState = accessSubmissionForm) {
    setError(null);
    setActionNotice(null);
    try {
      const response = await updateAccessSubmissionState(nextState);
      setAccessSubmissionStudio(response.accessSubmissionStudio);
      setAccessSubmissionForm(response.accessSubmissionStudio.handoffState);
      const matrixResponse = await fetchSwiggyAccessEvidenceMatrix();
      setAccessEvidenceMatrix(matrixResponse.accessEvidenceMatrix);
      setActionNotice("Swiggy access handoff state saved locally.");
    } catch (handoffError) {
      setError(handoffError instanceof Error ? handoffError.message : "Unable to save access handoff state.");
    }
  }

  async function loadAdvancedWorkflows() {
    const [
      pantryResponse,
      groupResponse,
      opsResponse,
      gatewayResponse,
      handshakeDoctorResponse,
      catalogResponse,
      capabilityRegistryResponse,
      resourcePromptStudioResponse,
      contractMatrixResponse,
      scenarioRunnerResponse,
      stateOrchestratorResponse,
      widgetRuntimeResponse,
      widgetExperienceResponse,
      hostedWidgetActivationResponse,
      agentBenchmarkResponse,
      privatePilotResponse,
      stagingReplayResponse,
      commercialActionGuardResponse,
      stagingCutoverResponse,
      stagingCredentialDrillResponse,
      stagingSeedSmokeResponse,
      liveSignalCalibrationResponse,
      toolLabResponse,
      buildersMapResponse,
      websiteAtlasResponse,
      buildersSiteParityResponse,
      buildersPageMeshResponse,
      buildersLaunchStoryResponse,
      moduleIntelligenceResponse,
      journeyGatesResponse,
      homepageExperienceResponse,
      sourceEvolutionResponse,
      liveSourceResilienceResponse,
      reviewDecisionResponse,
      operatingContractResponse,
      deepSiteMapResponse,
      builderIntakeResponse,
      faqPolicyResponse,
      faqResolutionResponse,
      faqAnswerResponse,
      growthPartnershipResponse,
      talentSignalResponse,
      conversionResponse,
      benefitsActivationResponse,
      showcaseSubmissionResponse,
      demoEvidenceResponse,
      submissionTimelineResponse,
      partnerSuccessResponse,
      partnerSupportResponse,
      interactionQaResponse,
      channelMultimodalResponse,
      visualDishCaptureResponse,
      voiceCommerceResponse,
      qualityLoopResponse,
      ritualAutopilotResponse,
      paymentTruthResponse,
      mealWindowResponse,
      customizationStudioResponse,
      nutritionBudgetResponse,
      householdPreferenceResponse,
      guestCollaborationResponse,
      luxuryExperienceResponse,
      reviewerArtifactVaultResponse,
      visualQaResponse,
      docsCoverageResponse,
      docsTwinExplorerResponse,
      llmsManifestResponse,
      toolParityAuditorResponse,
      upstreamWatchResponse,
      sourceIntelligenceResponse,
      developerQuickstartResponse,
      ctaExecutionResponse,
      ctaLiveAuditResponse,
      innovationRadarResponse,
      aiClientConnectResponse,
      codingAgentGovernanceResponse,
      brandComplianceResponse,
      journeyCompilerResponse,
      accessDossierResponse,
      accessEvidenceResponse,
      useCaseStudioResponse,
      conciergeResponse,
      stagingCertificationResponse,
      credentialOnboardingResponse,
      credentialVaultResponse,
      credentialHandoffResponse,
      sandboxCredentialResponse,
      authLifecycleResponse,
      enterpriseDelegatedAuthResponse,
      enterprisePlatformResponse,
      supportBridgeResponse,
      goLiveResponse,
      demoStudioResponse,
      evaluationResponse,
      submissionResponse,
      submissionConsoleResponse,
      accessSubmissionStudioResponse,
      packetExportResponse,
      rateLimitResponse,
      trafficReadinessResponse,
      backpressureGovernorResponse,
      versionResponse,
      complianceResponse,
      dataGovernanceResponse,
      proofResponse,
      launchBundleResponse,
      errorIntelligenceResponse,
      resilienceResponse,
      observabilityResponse,
      runtimeTelemetryResponse,
      auditLedgerResponse,
      sloIncidentResponse,
      loadLabResponse,
      quotaNegotiationResponse,
      offerIntelligenceResponse,
      orderLifecycleResponse,
      locationTrustResponse,
      cartMutationResponse,
      discoveryFreshnessResponse,
      confirmationCommandResponse,
      cancellationCareResponse,
      dineoutPrecisionResponse,
      routeOptimizerResponse,
    ] = await Promise.all([
      fetchPantry(),
      fetchGroupPlan(),
      fetchOpsStatus(),
      fetchMcpGateway(),
      fetchSwiggyHandshakeDoctor(),
      fetchMcpCatalog(),
      fetchMcpCapabilityRegistry(),
      fetchMcpResourcePromptStudio(),
      fetchSwiggyToolContractMatrix(),
      fetchSwiggyScenarioRunner(),
      fetchSwiggyStateOrchestrator(),
      fetchSwiggyWidgetRuntime(),
      fetchSwiggyWidgetExperienceComposer(),
      fetchSwiggyHostedWidgetActivationCenter(),
      fetchSwiggyAgentExperienceBenchmark(),
      fetchSwiggyPrivatePilotControlRoom(),
      fetchSwiggyStagingReplayCenter(),
      fetchCommercialActionGuard(),
      fetchSwiggyStagingCutover(),
      fetchSwiggyStagingCredentialDrill(),
      fetchSwiggyStagingSeedSmokeCenter(),
      fetchSwiggyLiveSignalCalibration(),
      fetchMcpToolLab(),
      fetchSwiggyBuildersMap(),
      fetchSwiggyWebsiteAtlas(),
      fetchSwiggyBuildersSiteParity(),
      fetchSwiggyBuildersPageMesh(),
      fetchSwiggyBuildersLaunchStory(),
      fetchSwiggyBuildersModuleIntelligence(),
      fetchSwiggyBuildersJourneyGates(),
      fetchSwiggyBuildersHomepageExperience(),
      fetchSwiggyBuildersSourceEvolution(),
      fetchSwiggyBuildersLiveSourceResilience(),
      fetchSwiggyBuildersReviewDecision(),
      fetchSwiggyOperatingContractCenter(),
      fetchSwiggyDeepSiteMap(),
      fetchSwiggyBuilderIntake(),
      fetchSwiggyFaqPolicyCenter(),
      fetchSwiggyFaqResolutionCenter(),
      answerSwiggyFaqQuestion(FAQ_ANSWER_SAMPLE_QUESTION),
      fetchSwiggyGrowthPartnershipCenter(),
      fetchSwiggyTalentSignalCenter(),
      fetchSwiggyConversionCenter(),
      fetchSwiggyBenefitsActivationCenter(),
      fetchSwiggyShowcaseSubmissionCenter(),
      fetchSwiggyDemoEvidenceDirector(),
      fetchSwiggySubmissionTimelineCenter(),
      fetchSwiggyPartnerSuccessDesk(),
      fetchSwiggyPartnerSupportRoom(),
      fetchSwiggyInteractionQaCenter(),
      fetchChannelMultimodalStudio(),
      fetchSwiggyVisualDishCapture(),
      fetchSwiggyVoiceCommerceCenter(),
      fetchSwiggyQualityLoopCenter(),
      fetchSwiggyRitualAutopilotCenter(),
      fetchSwiggyPaymentTruthCenter(),
      fetchSwiggyMealWindowCenter(),
      fetchSwiggyCustomizationStudio(),
      fetchNutritionBudgetIntelligence(),
      fetchHouseholdPreferenceGraph(),
      fetchGuestCollaborationCenter(),
      fetchLuxuryExperienceWorkspace(),
      fetchReviewerArtifactVault(),
      fetchVisualQaCenter(),
      fetchSwiggyDocsCoverage(),
      fetchSwiggyDocsTwinExplorer(),
      fetchSwiggyLlmsManifestVerifier(),
      fetchSwiggyToolParityAuditor(),
      fetchSwiggyUpstreamWatch(),
      fetchSourceIntelligenceOptional(),
      fetchDeveloperQuickstartWorkbench(),
      fetchSwiggyCtaExecutionCenter(),
      fetchSwiggyCtaLiveAudit(),
      fetchInnovationRadarOptional(),
      fetchAiClientConnectKit(),
      fetchCodingAgentGovernance(),
      fetchBrandComplianceKit(),
      fetchSwiggyJourneyCompiler(),
      fetchSwiggyAccessDossier(),
      fetchSwiggyAccessEvidenceMatrix(),
      fetchPremiumUseCaseStudio(),
      fetchPremiumConciergeItinerary(),
      fetchStagingCertificationMatrix(),
      fetchCredentialOnboarding(),
      fetchSwiggyCredentialVaultCenter(),
      fetchSwiggyCredentialHandoffCenter(),
      fetchSandboxCredentialWorkbench(),
      fetchSwiggyAuthLifecycleCenter(),
      fetchEnterpriseDelegatedAuthCenter(),
      fetchEnterprisePlatformCenter(),
      fetchSupportBridge(),
      fetchGoLive(),
      fetchDemoStudio(),
      fetchEvaluationLab(),
      fetchSubmissionPackage(),
      fetchSubmissionConsole(),
      fetchAccessSubmissionStudio(),
      fetchBuilderPacketExport(),
      fetchRateLimitPlan(),
      fetchTrafficReadinessPlan(),
      fetchMcpBackpressureGovernor(),
      fetchVersionMonitor(),
      fetchComplianceEvidence(),
      fetchDataGovernanceCenter(),
      fetchReviewerProof(),
      fetchProductionLaunchBundle(),
      fetchErrorIntelligence(),
      fetchResilience(),
      fetchObservabilityTraces(),
      fetchRuntimeTelemetry(),
      fetchAuditLedger(),
      fetchSloIncidentCommand(),
      fetchSwiggyLoadLab(),
      fetchSwiggyQuotaNegotiationCenter(),
      fetchSwiggyOfferIntelligence(),
      fetchSwiggyOrderLifecycle(),
      fetchSwiggyLocationTrust(),
      fetchSwiggyCartMutationWorkbench(),
      fetchSwiggyDiscoveryFreshness(),
      fetchSwiggyConfirmationCommandCenter(),
      fetchSwiggyCancellationCareCenter(),
      fetchSwiggyDineoutPrecisionCenter(),
      fetchSwiggyRouteOptimizer(),
    ]);
    setPantry(pantryResponse.pantry);
    setRestock(pantryResponse.suggestions);
    setGroupPlan(groupResponse.groupPlan);
    setOpsStatus(opsResponse.status);
    setMcpGateway(gatewayResponse.gateway);
    setHandshakeDoctor(handshakeDoctorResponse.handshakeDoctor);
    setMcpCatalog(catalogResponse);
    setMcpCapabilityRegistry(capabilityRegistryResponse.registry);
    setMcpResourcePromptStudio(resourcePromptStudioResponse.resourcePromptStudio);
    setToolContractMatrix(contractMatrixResponse.matrix);
    setScenarioRunner(scenarioRunnerResponse.scenarioRunner);
    setStateOrchestrator(stateOrchestratorResponse.stateOrchestrator);
    setWidgetRuntime(widgetRuntimeResponse.widgetRuntime);
    setWidgetExperience(widgetExperienceResponse.widgetExperience);
    setHostedWidgetActivation(hostedWidgetActivationResponse.hostedWidgetActivation);
    setAgentBenchmark(agentBenchmarkResponse.agentBenchmark);
    setPrivatePilot(privatePilotResponse.privatePilot);
    setStagingReplay(stagingReplayResponse.stagingReplay);
    setCommercialActionGuard(commercialActionGuardResponse.commercialActionGuard);
    setStagingCutover(stagingCutoverResponse.stagingCutover);
    setStagingCredentialDrill(stagingCredentialDrillResponse.stagingCredentialDrill);
    setStagingSeedSmoke(stagingSeedSmokeResponse.stagingSeedSmoke);
    setLiveSignalCalibration(liveSignalCalibrationResponse.liveSignalCalibration);
    setMcpToolLab(toolLabResponse.toolLab);
    setSwiggyBuildersMap(buildersMapResponse.map);
    setSwiggyWebsiteAtlas(websiteAtlasResponse.atlas);
    setBuildersSiteParity(buildersSiteParityResponse.buildersSiteParity);
    setBuildersPageMesh(buildersPageMeshResponse.buildersPageMesh);
    setBuildersLaunchStory(buildersLaunchStoryResponse.launchStory);
    setModuleIntelligence(moduleIntelligenceResponse.moduleIntelligence);
    setJourneyGates(journeyGatesResponse.journeyGates);
    setHomepageExperience(homepageExperienceResponse.homepageExperience);
    setSourceEvolution(sourceEvolutionResponse.sourceEvolution);
    setLiveSourceResilience(liveSourceResilienceResponse.liveSourceResilience);
    setReviewDecision(reviewDecisionResponse.reviewDecision);
    setOperatingContract(operatingContractResponse.operatingContract);
    setSwiggyDeepSiteMap(deepSiteMapResponse.deepSiteMap);
    setSwiggyBuilderIntake(builderIntakeResponse.intake);
    setSwiggyFaqPolicy(faqPolicyResponse.faqPolicy);
    setFaqResolution(faqResolutionResponse.faqResolution);
    setFaqAnswer(faqAnswerResponse.faqAnswer);
    setSwiggyGrowthPartnership(growthPartnershipResponse.growthPartnership);
    setTalentSignal(talentSignalResponse.talentSignal);
    setConversionCenter(conversionResponse.conversion);
    setBenefitsActivation(benefitsActivationResponse.benefitsActivation);
    setShowcaseSubmission(showcaseSubmissionResponse.showcaseSubmission);
    setDemoEvidence(demoEvidenceResponse.demoEvidence);
    setSubmissionTimeline(submissionTimelineResponse.submissionTimeline);
    setPartnerSuccess(partnerSuccessResponse.partnerSuccess);
    setPartnerSupport(partnerSupportResponse.partnerSupport);
    setInteractionQa(interactionQaResponse.interactionQa);
    setChannelMultimodalStudio(channelMultimodalResponse.channelMultimodalStudio);
    setVisualDishCapture(visualDishCaptureResponse.visualDishCapture);
    setVoiceCommerce(voiceCommerceResponse.voiceCommerce);
    setQualityLoop(qualityLoopResponse.qualityLoop);
    setRitualAutopilot(ritualAutopilotResponse.ritualAutopilot);
    setPaymentTruth(paymentTruthResponse.paymentTruth);
    setMealWindow(mealWindowResponse.mealWindow);
    setCustomizationStudio(customizationStudioResponse.customizationStudio);
    setNutritionBudget(nutritionBudgetResponse.nutritionBudget);
    setHouseholdPreference(householdPreferenceResponse.householdPreference);
    setGuestCollaboration(guestCollaborationResponse.guestCollaboration);
    setLuxuryExperience(luxuryExperienceResponse.luxuryExperience);
    setReviewerArtifactVault(reviewerArtifactVaultResponse.reviewerArtifactVault);
    setVisualQa(visualQaResponse.visualQa);
    setSwiggyDocsCoverage(docsCoverageResponse.docsCoverage);
    setDocsTwinExplorer(docsTwinExplorerResponse.docsTwinExplorer);
    setLlmsManifest(llmsManifestResponse.llmsManifest);
    setToolParityAuditor(toolParityAuditorResponse.toolParityAuditor);
    setSwiggyUpstreamWatch(upstreamWatchResponse.upstreamWatch);
    setSwiggySourceIntelligence(sourceIntelligenceResponse.sourceIntelligence);
    setDeveloperQuickstart(developerQuickstartResponse.quickstartWorkbench);
    setCtaExecution(ctaExecutionResponse.ctaExecution);
    setCtaLiveAudit(ctaLiveAuditResponse.ctaLiveAudit);
    setSwiggyInnovationRadar(innovationRadarResponse.innovationRadar);
    setAiClientConnectKit(aiClientConnectResponse.connectKit);
    setCodingAgentGovernance(codingAgentGovernanceResponse.codingAgentGovernance);
    setBrandCompliance(brandComplianceResponse.brandCompliance);
    setSwiggyJourneyCompiler(journeyCompilerResponse.journeyCompiler);
    setSwiggyAccessDossier(accessDossierResponse.dossier);
    setAccessEvidenceMatrix(accessEvidenceResponse.accessEvidenceMatrix);
    setPremiumUseCaseStudio(useCaseStudioResponse.studio);
    setPremiumConciergeItinerary(conciergeResponse.concierge);
    setStagingCertification(stagingCertificationResponse.matrix);
    setCredentialOnboarding(credentialOnboardingResponse.onboarding);
    setCredentialVault(credentialVaultResponse.credentialVault);
    setCredentialHandoff(credentialHandoffResponse.credentialHandoff);
    setSandboxCredentialWorkbench(sandboxCredentialResponse.sandboxWorkbench);
    setAuthLifecycleCenter(authLifecycleResponse.authLifecycleCenter);
    setEnterpriseDelegatedAuth(enterpriseDelegatedAuthResponse.enterpriseAuth);
    setEnterprisePlatformCenter(enterprisePlatformResponse.enterprisePlatform);
    setSupportBridge(supportBridgeResponse.supportBridge);
    setGoLiveChecks(goLiveResponse.checks);
    setObservabilityMetrics(goLiveResponse.metrics);
    setRollout(goLiveResponse.rollout);
    setDemoSteps(demoStudioResponse.steps);
    setEvaluationLab(evaluationResponse.evaluation);
    setSubmissionPackage(submissionResponse.package);
    setSubmissionConsole(submissionConsoleResponse.submissionConsole);
    setAccessSubmissionStudio(accessSubmissionStudioResponse.accessSubmissionStudio);
    setAccessSubmissionForm(accessSubmissionStudioResponse.accessSubmissionStudio.handoffState);
    setBuilderPacketExport(packetExportResponse.packet);
    setRateLimit(rateLimitResponse.rateLimit);
    setTrafficReadiness(trafficReadinessResponse.trafficReadiness);
    setBackpressureGovernor(backpressureGovernorResponse.backpressureGovernor);
    setVersionMonitor(versionResponse.version);
    setComplianceEvidence(complianceResponse.compliance);
    setDataGovernance(dataGovernanceResponse.dataGovernance);
    setReviewerProof(proofResponse.proof);
    setLaunchBundle(launchBundleResponse.launchBundle);
    setErrorIntelligence(errorIntelligenceResponse.errorIntelligence);
    setResilienceDrills(resilienceResponse.drills);
    setResilienceRunbook(resilienceResponse.runbook);
    setObservabilityTraceReport(observabilityResponse.observability);
    setRuntimeTelemetry(runtimeTelemetryResponse.telemetry);
    setAuditLedger(auditLedgerResponse.auditLedger);
    setSloIncident(sloIncidentResponse.sloIncident);
    setLoadLab(loadLabResponse.loadLab);
    setQuotaNegotiation(quotaNegotiationResponse.quotaNegotiation);
    setOfferIntelligence(offerIntelligenceResponse.offerIntelligence);
    setOrderLifecycle(orderLifecycleResponse.orderLifecycle);
    setLocationTrust(locationTrustResponse.locationTrust);
    setCartMutation(cartMutationResponse.cartMutation);
    setDiscoveryFreshness(discoveryFreshnessResponse.discoveryFreshness);
    setConfirmationCommandCenter(confirmationCommandResponse.confirmationCommandCenter);
    setCancellationCareCenter(cancellationCareResponse.cancellationCareCenter);
    setDineoutPrecisionCenter(dineoutPrecisionResponse.dineoutPrecisionCenter);
    setRouteOptimizer(routeOptimizerResponse.routeOptimizer);
  }

  async function refreshLaunchCenter() {
    const [
      catalogResponse,
      gatewayResponse,
      handshakeDoctorResponse,
      capabilityRegistryResponse,
      resourcePromptStudioResponse,
      contractMatrixResponse,
      scenarioRunnerResponse,
      stateOrchestratorResponse,
      widgetRuntimeResponse,
      widgetExperienceResponse,
      hostedWidgetActivationResponse,
      agentBenchmarkResponse,
      privatePilotResponse,
      stagingReplayResponse,
      commercialActionGuardResponse,
      stagingCutoverResponse,
      stagingCredentialDrillResponse,
      stagingSeedSmokeResponse,
      liveSignalCalibrationResponse,
      toolLabResponse,
      buildersMapResponse,
      websiteAtlasResponse,
      buildersSiteParityResponse,
      buildersPageMeshResponse,
      buildersLaunchStoryResponse,
      moduleIntelligenceResponse,
      journeyGatesResponse,
      homepageExperienceResponse,
      sourceEvolutionResponse,
      liveSourceResilienceResponse,
      reviewDecisionResponse,
      operatingContractResponse,
      deepSiteMapResponse,
      builderIntakeResponse,
      faqPolicyResponse,
      faqResolutionResponse,
      faqAnswerResponse,
      growthPartnershipResponse,
      talentSignalResponse,
      conversionResponse,
      benefitsActivationResponse,
      showcaseSubmissionResponse,
      demoEvidenceResponse,
      submissionTimelineResponse,
      partnerSuccessResponse,
      partnerSupportResponse,
      interactionQaResponse,
      channelMultimodalResponse,
      visualDishCaptureResponse,
      voiceCommerceResponse,
      qualityLoopResponse,
      ritualAutopilotResponse,
      paymentTruthResponse,
      mealWindowResponse,
      customizationStudioResponse,
      nutritionBudgetResponse,
      householdPreferenceResponse,
      guestCollaborationResponse,
      luxuryExperienceResponse,
      reviewerArtifactVaultResponse,
      visualQaResponse,
      docsCoverageResponse,
      docsTwinExplorerResponse,
      llmsManifestResponse,
      toolParityAuditorResponse,
      upstreamWatchResponse,
      sourceIntelligenceResponse,
      developerQuickstartResponse,
      ctaExecutionResponse,
      ctaLiveAuditResponse,
      innovationRadarResponse,
      aiClientConnectResponse,
      codingAgentGovernanceResponse,
      brandComplianceResponse,
      journeyCompilerResponse,
      accessDossierResponse,
      accessEvidenceResponse,
      useCaseStudioResponse,
      conciergeResponse,
      stagingCertificationResponse,
      credentialOnboardingResponse,
      credentialVaultResponse,
      credentialHandoffResponse,
      sandboxCredentialResponse,
      authLifecycleResponse,
      enterpriseDelegatedAuthResponse,
      enterprisePlatformResponse,
      supportBridgeResponse,
      goLiveResponse,
      demoStudioResponse,
      evaluationResponse,
      submissionResponse,
      submissionConsoleResponse,
      accessSubmissionStudioResponse,
      packetExportResponse,
      rateLimitResponse,
      trafficReadinessResponse,
      backpressureGovernorResponse,
      versionResponse,
      complianceResponse,
      dataGovernanceResponse,
      proofResponse,
      launchBundleResponse,
      errorIntelligenceResponse,
      resilienceResponse,
      observabilityResponse,
      runtimeTelemetryResponse,
      auditLedgerResponse,
      sloIncidentResponse,
      loadLabResponse,
      quotaNegotiationResponse,
      offerIntelligenceResponse,
      orderLifecycleResponse,
      locationTrustResponse,
      cartMutationResponse,
      discoveryFreshnessResponse,
      confirmationCommandResponse,
      cancellationCareResponse,
      dineoutPrecisionResponse,
      routeOptimizerResponse,
    ] = await Promise.all([
      fetchMcpCatalog(),
      fetchMcpGateway(),
      fetchSwiggyHandshakeDoctor(),
      fetchMcpCapabilityRegistry(),
      fetchMcpResourcePromptStudio(),
      fetchSwiggyToolContractMatrix(),
      fetchSwiggyScenarioRunner(),
      fetchSwiggyStateOrchestrator(),
      fetchSwiggyWidgetRuntime(),
      fetchSwiggyWidgetExperienceComposer(),
      fetchSwiggyHostedWidgetActivationCenter(),
      fetchSwiggyAgentExperienceBenchmark(),
      fetchSwiggyPrivatePilotControlRoom(),
      fetchSwiggyStagingReplayCenter(),
      fetchCommercialActionGuard(),
      fetchSwiggyStagingCutover(),
      fetchSwiggyStagingCredentialDrill(),
      fetchSwiggyStagingSeedSmokeCenter(),
      fetchSwiggyLiveSignalCalibration(),
      fetchMcpToolLab(),
      fetchSwiggyBuildersMap(),
      fetchSwiggyWebsiteAtlas(),
      fetchSwiggyBuildersSiteParity(),
      fetchSwiggyBuildersPageMesh(),
      fetchSwiggyBuildersLaunchStory(),
      fetchSwiggyBuildersModuleIntelligence(),
      fetchSwiggyBuildersJourneyGates(),
      fetchSwiggyBuildersHomepageExperience(),
      fetchSwiggyBuildersSourceEvolution(),
      fetchSwiggyBuildersLiveSourceResilience(),
      fetchSwiggyBuildersReviewDecision(),
      fetchSwiggyOperatingContractCenter(),
      fetchSwiggyDeepSiteMap(),
      fetchSwiggyBuilderIntake(),
      fetchSwiggyFaqPolicyCenter(),
      fetchSwiggyFaqResolutionCenter(),
      answerSwiggyFaqQuestion(FAQ_ANSWER_SAMPLE_QUESTION),
      fetchSwiggyGrowthPartnershipCenter(),
      fetchSwiggyTalentSignalCenter(),
      fetchSwiggyConversionCenter(),
      fetchSwiggyBenefitsActivationCenter(),
      fetchSwiggyShowcaseSubmissionCenter(),
      fetchSwiggyDemoEvidenceDirector(),
      fetchSwiggySubmissionTimelineCenter(),
      fetchSwiggyPartnerSuccessDesk(),
      fetchSwiggyPartnerSupportRoom(),
      fetchSwiggyInteractionQaCenter(),
      fetchChannelMultimodalStudio(),
      fetchSwiggyVisualDishCapture(),
      fetchSwiggyVoiceCommerceCenter(),
      fetchSwiggyQualityLoopCenter(),
      fetchSwiggyRitualAutopilotCenter(),
      fetchSwiggyPaymentTruthCenter(),
      fetchSwiggyMealWindowCenter(),
      fetchSwiggyCustomizationStudio(),
      fetchNutritionBudgetIntelligence(),
      fetchHouseholdPreferenceGraph(),
      fetchGuestCollaborationCenter(),
      fetchLuxuryExperienceWorkspace(),
      fetchReviewerArtifactVault(),
      fetchVisualQaCenter(),
      fetchSwiggyDocsCoverage(),
      fetchSwiggyDocsTwinExplorer(),
      fetchSwiggyLlmsManifestVerifier(),
      fetchSwiggyToolParityAuditor(),
      fetchSwiggyUpstreamWatch(),
      fetchSourceIntelligenceOptional(),
      fetchDeveloperQuickstartWorkbench(),
      fetchSwiggyCtaExecutionCenter(),
      fetchSwiggyCtaLiveAudit(),
      fetchInnovationRadarOptional(),
      fetchAiClientConnectKit(),
      fetchCodingAgentGovernance(),
      fetchBrandComplianceKit(),
      fetchSwiggyJourneyCompiler(),
      fetchSwiggyAccessDossier(),
      fetchSwiggyAccessEvidenceMatrix(),
      fetchPremiumUseCaseStudio(),
      fetchPremiumConciergeItinerary(),
      fetchStagingCertificationMatrix(),
      fetchCredentialOnboarding(),
      fetchSwiggyCredentialVaultCenter(),
      fetchSwiggyCredentialHandoffCenter(),
      fetchSandboxCredentialWorkbench(),
      fetchSwiggyAuthLifecycleCenter(),
      fetchEnterpriseDelegatedAuthCenter(),
      fetchEnterprisePlatformCenter(),
      fetchSupportBridge(),
      fetchGoLive(),
      fetchDemoStudio(),
      fetchEvaluationLab(),
      fetchSubmissionPackage(),
      fetchSubmissionConsole(),
      fetchAccessSubmissionStudio(),
      fetchBuilderPacketExport(),
      fetchRateLimitPlan(),
      fetchTrafficReadinessPlan(),
      fetchMcpBackpressureGovernor(),
      fetchVersionMonitor(),
      fetchComplianceEvidence(),
      fetchDataGovernanceCenter(),
      fetchReviewerProof(),
      fetchProductionLaunchBundle(),
      fetchErrorIntelligence(),
      fetchResilience(),
      fetchObservabilityTraces(),
      fetchRuntimeTelemetry(),
      fetchAuditLedger(),
      fetchSloIncidentCommand(),
      fetchSwiggyLoadLab(),
      fetchSwiggyQuotaNegotiationCenter(),
      fetchSwiggyOfferIntelligence(),
      fetchSwiggyOrderLifecycle(),
      fetchSwiggyLocationTrust(),
      fetchSwiggyCartMutationWorkbench(),
      fetchSwiggyDiscoveryFreshness(),
      fetchSwiggyConfirmationCommandCenter(),
      fetchSwiggyCancellationCareCenter(),
      fetchSwiggyDineoutPrecisionCenter(),
      fetchSwiggyRouteOptimizer(),
    ]);
    setMcpCatalog(catalogResponse);
    setMcpGateway(gatewayResponse.gateway);
    setHandshakeDoctor(handshakeDoctorResponse.handshakeDoctor);
    setMcpCapabilityRegistry(capabilityRegistryResponse.registry);
    setMcpResourcePromptStudio(resourcePromptStudioResponse.resourcePromptStudio);
    setToolContractMatrix(contractMatrixResponse.matrix);
    setScenarioRunner(scenarioRunnerResponse.scenarioRunner);
    setStateOrchestrator(stateOrchestratorResponse.stateOrchestrator);
    setWidgetRuntime(widgetRuntimeResponse.widgetRuntime);
    setWidgetExperience(widgetExperienceResponse.widgetExperience);
    setHostedWidgetActivation(hostedWidgetActivationResponse.hostedWidgetActivation);
    setAgentBenchmark(agentBenchmarkResponse.agentBenchmark);
    setPrivatePilot(privatePilotResponse.privatePilot);
    setStagingReplay(stagingReplayResponse.stagingReplay);
    setCommercialActionGuard(commercialActionGuardResponse.commercialActionGuard);
    setStagingCutover(stagingCutoverResponse.stagingCutover);
    setStagingCredentialDrill(stagingCredentialDrillResponse.stagingCredentialDrill);
    setStagingSeedSmoke(stagingSeedSmokeResponse.stagingSeedSmoke);
    setLiveSignalCalibration(liveSignalCalibrationResponse.liveSignalCalibration);
    setMcpToolLab(toolLabResponse.toolLab);
    setSwiggyBuildersMap(buildersMapResponse.map);
    setSwiggyWebsiteAtlas(websiteAtlasResponse.atlas);
    setBuildersSiteParity(buildersSiteParityResponse.buildersSiteParity);
    setBuildersPageMesh(buildersPageMeshResponse.buildersPageMesh);
    setBuildersLaunchStory(buildersLaunchStoryResponse.launchStory);
    setModuleIntelligence(moduleIntelligenceResponse.moduleIntelligence);
    setJourneyGates(journeyGatesResponse.journeyGates);
    setHomepageExperience(homepageExperienceResponse.homepageExperience);
    setSourceEvolution(sourceEvolutionResponse.sourceEvolution);
    setLiveSourceResilience(liveSourceResilienceResponse.liveSourceResilience);
    setReviewDecision(reviewDecisionResponse.reviewDecision);
    setOperatingContract(operatingContractResponse.operatingContract);
    setSwiggyDeepSiteMap(deepSiteMapResponse.deepSiteMap);
    setSwiggyBuilderIntake(builderIntakeResponse.intake);
    setSwiggyFaqPolicy(faqPolicyResponse.faqPolicy);
    setFaqResolution(faqResolutionResponse.faqResolution);
    setFaqAnswer(faqAnswerResponse.faqAnswer);
    setSwiggyGrowthPartnership(growthPartnershipResponse.growthPartnership);
    setTalentSignal(talentSignalResponse.talentSignal);
    setConversionCenter(conversionResponse.conversion);
    setBenefitsActivation(benefitsActivationResponse.benefitsActivation);
    setShowcaseSubmission(showcaseSubmissionResponse.showcaseSubmission);
    setDemoEvidence(demoEvidenceResponse.demoEvidence);
    setSubmissionTimeline(submissionTimelineResponse.submissionTimeline);
    setPartnerSuccess(partnerSuccessResponse.partnerSuccess);
    setPartnerSupport(partnerSupportResponse.partnerSupport);
    setInteractionQa(interactionQaResponse.interactionQa);
    setChannelMultimodalStudio(channelMultimodalResponse.channelMultimodalStudio);
    setVisualDishCapture(visualDishCaptureResponse.visualDishCapture);
    setVoiceCommerce(voiceCommerceResponse.voiceCommerce);
    setQualityLoop(qualityLoopResponse.qualityLoop);
    setRitualAutopilot(ritualAutopilotResponse.ritualAutopilot);
    setPaymentTruth(paymentTruthResponse.paymentTruth);
    setMealWindow(mealWindowResponse.mealWindow);
    setCustomizationStudio(customizationStudioResponse.customizationStudio);
    setNutritionBudget(nutritionBudgetResponse.nutritionBudget);
    setHouseholdPreference(householdPreferenceResponse.householdPreference);
    setGuestCollaboration(guestCollaborationResponse.guestCollaboration);
    setLuxuryExperience(luxuryExperienceResponse.luxuryExperience);
    setReviewerArtifactVault(reviewerArtifactVaultResponse.reviewerArtifactVault);
    setVisualQa(visualQaResponse.visualQa);
    setSwiggyDocsCoverage(docsCoverageResponse.docsCoverage);
    setDocsTwinExplorer(docsTwinExplorerResponse.docsTwinExplorer);
    setLlmsManifest(llmsManifestResponse.llmsManifest);
    setToolParityAuditor(toolParityAuditorResponse.toolParityAuditor);
    setSwiggyUpstreamWatch(upstreamWatchResponse.upstreamWatch);
    setSwiggySourceIntelligence(sourceIntelligenceResponse.sourceIntelligence);
    setDeveloperQuickstart(developerQuickstartResponse.quickstartWorkbench);
    setCtaExecution(ctaExecutionResponse.ctaExecution);
    setCtaLiveAudit(ctaLiveAuditResponse.ctaLiveAudit);
    setSwiggyInnovationRadar(innovationRadarResponse.innovationRadar);
    setAiClientConnectKit(aiClientConnectResponse.connectKit);
    setCodingAgentGovernance(codingAgentGovernanceResponse.codingAgentGovernance);
    setBrandCompliance(brandComplianceResponse.brandCompliance);
    setSwiggyJourneyCompiler(journeyCompilerResponse.journeyCompiler);
    setSwiggyAccessDossier(accessDossierResponse.dossier);
    setAccessEvidenceMatrix(accessEvidenceResponse.accessEvidenceMatrix);
    setPremiumUseCaseStudio(useCaseStudioResponse.studio);
    setPremiumConciergeItinerary(conciergeResponse.concierge);
    setStagingCertification(stagingCertificationResponse.matrix);
    setCredentialOnboarding(credentialOnboardingResponse.onboarding);
    setCredentialVault(credentialVaultResponse.credentialVault);
    setCredentialHandoff(credentialHandoffResponse.credentialHandoff);
    setSandboxCredentialWorkbench(sandboxCredentialResponse.sandboxWorkbench);
    setAuthLifecycleCenter(authLifecycleResponse.authLifecycleCenter);
    setEnterpriseDelegatedAuth(enterpriseDelegatedAuthResponse.enterpriseAuth);
    setEnterprisePlatformCenter(enterprisePlatformResponse.enterprisePlatform);
    setSupportBridge(supportBridgeResponse.supportBridge);
    setGoLiveChecks(goLiveResponse.checks);
    setObservabilityMetrics(goLiveResponse.metrics);
    setRollout(goLiveResponse.rollout);
    setDemoSteps(demoStudioResponse.steps);
    setEvaluationLab(evaluationResponse.evaluation);
    setSubmissionPackage(submissionResponse.package);
    setSubmissionConsole(submissionConsoleResponse.submissionConsole);
    setAccessSubmissionStudio(accessSubmissionStudioResponse.accessSubmissionStudio);
    setAccessSubmissionForm(accessSubmissionStudioResponse.accessSubmissionStudio.handoffState);
    setBuilderPacketExport(packetExportResponse.packet);
    setRateLimit(rateLimitResponse.rateLimit);
    setTrafficReadiness(trafficReadinessResponse.trafficReadiness);
    setBackpressureGovernor(backpressureGovernorResponse.backpressureGovernor);
    setVersionMonitor(versionResponse.version);
    setComplianceEvidence(complianceResponse.compliance);
    setDataGovernance(dataGovernanceResponse.dataGovernance);
    setReviewerProof(proofResponse.proof);
    setLaunchBundle(launchBundleResponse.launchBundle);
    setErrorIntelligence(errorIntelligenceResponse.errorIntelligence);
    setResilienceDrills(resilienceResponse.drills);
    setResilienceRunbook(resilienceResponse.runbook);
    setObservabilityTraceReport(observabilityResponse.observability);
    setRuntimeTelemetry(runtimeTelemetryResponse.telemetry);
    setAuditLedger(auditLedgerResponse.auditLedger);
    setSloIncident(sloIncidentResponse.sloIncident);
    setLoadLab(loadLabResponse.loadLab);
    setQuotaNegotiation(quotaNegotiationResponse.quotaNegotiation);
    setOfferIntelligence(offerIntelligenceResponse.offerIntelligence);
    setOrderLifecycle(orderLifecycleResponse.orderLifecycle);
    setLocationTrust(locationTrustResponse.locationTrust);
    setCartMutation(cartMutationResponse.cartMutation);
    setDiscoveryFreshness(discoveryFreshnessResponse.discoveryFreshness);
    setConfirmationCommandCenter(confirmationCommandResponse.confirmationCommandCenter);
    setCancellationCareCenter(cancellationCareResponse.cancellationCareCenter);
    setDineoutPrecisionCenter(dineoutPrecisionResponse.dineoutPrecisionCenter);
    setRouteOptimizer(routeOptimizerResponse.routeOptimizer);
  }

  async function loadPlanDiagnostics(sessionId: string) {
    const [preflightResponse, replayResponse, transcriptResponse, widgetsResponse] = await Promise.all([
      fetchCartPreflight(sessionId),
      fetchMcpReplay(sessionId),
      fetchStagingTranscript(sessionId),
      fetchWidgets(sessionId),
    ]);
    setPreflight(preflightResponse.preflight);
    setMcpReplay(replayResponse.replay);
    setStagingTranscript(transcriptResponse.transcript);
    setWidgets(widgetsResponse.widgets);
    setWidgetBridge(widgetsResponse.bridge);
  }

  async function confirmEverything() {
    if (!plan) return;
    setIsConfirming(true);
    setError(null);
    setActionNotice(null);
    try {
      const response = await confirmAllRecommendations(plan.id);
      setPlan(response.plan);
      setActionNotice("All prepared recommendations were confirmed through the guarded API path.");
      void refreshLaunchCenter().catch(() => undefined);
      void loadPlanDiagnostics(response.plan.id).catch(() => undefined);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Unable to confirm all actions.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function refreshTracking() {
    if (!plan) return;
    setError(null);
    setActionNotice(null);
    try {
      const response = await fetchTracking(plan.id);
      setPlan(response.plan);
      setActionNotice("Tracking refreshed with the latest simulated Swiggy events.");
      void refreshLaunchCenter().catch(() => undefined);
      void loadPlanDiagnostics(response.plan.id).catch(() => undefined);
    } catch (trackingError) {
      setError(trackingError instanceof Error ? trackingError.message : "Unable to refresh tracking.");
    }
  }

  async function beginOAuth() {
    setError(null);
    setActionNotice(null);
    const popup = window.open("about:blank", "_blank");
    try {
      const response = await startSwiggyAuth();
      setAuthUrl(response.authorizationUrl);
      setSwiggyAuthStatus(response.authStatus);
      if (popup) {
        popup.opener = null;
        popup.location.href = response.authorizationUrl;
        setActionNotice("Swiggy authorization opened in a new tab.");
      } else {
        setActionNotice("OAuth URL is ready. Use the authorization link below to continue.");
      }
    } catch (authError) {
      popup?.close();
      setError(authError instanceof Error ? authError.message : "Unable to start Swiggy OAuth.");
    }
  }

  async function refreshSwiggyAuthStatus() {
    const response = await fetchSwiggyAuthStatus();
    setSwiggyAuthStatus(response.authStatus);
  }

  async function scheduleCurrentPlan() {
    if (!plan) return;
    setError(null);
    setActionNotice(null);
    try {
      const response = await schedulePlan(plan.id);
      setReminders(response.reminders);
      setActionNotice(`${response.reminders.length} reminders scheduled for this plan.`);
      const opsResponse = await fetchOpsStatus().catch(() => null);
      if (opsResponse) setOpsStatus(opsResponse.status);
      void refreshLaunchCenter().catch(() => undefined);
    } catch (scheduleError) {
      setError(scheduleError instanceof Error ? scheduleError.message : "Unable to schedule reminders.");
    }
  }

  async function addDemoGroupMember() {
    setError(null);
    setActionNotice(null);
    try {
      const response = await addGroupMember({
        id: `member_${Date.now()}`,
        name: "Asha",
        diet: "vegetarian",
        allergies: ["none"],
        budget: 550,
      });
      setGroupPlan(response.groupPlan);
      setActionNotice("Demo household member added to group planning.");
    } catch (groupError) {
      setError(groupError instanceof Error ? groupError.message : "Unable to add demo member.");
    }
  }

  async function exportBuilderMarkdown() {
    setError(null);
    setActionNotice(null);
    try {
      setExportText(await fetchBuilderPackageMarkdown());
      setActionNotice("Builder packet exported. Jump to Operating System to review the preview.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Unable to export builder packet.");
    }
  }

  async function exportPrivacy() {
    setError(null);
    setActionNotice(null);
    try {
      const response = await exportPrivacyData();
      setExportText(JSON.stringify(response, null, 2));
      setActionNotice("Privacy export generated in the Operating System preview.");
    } catch (privacyError) {
      setError(privacyError instanceof Error ? privacyError.message : "Unable to export privacy data.");
    }
  }

  async function createIncidentReport() {
    setError(null);
    setActionNotice(null);
    try {
      const response = await createSupportReport(plan?.id);
      setIncidentReport(response.report);
      setActionNotice("Support report generated with a ready email handoff.");
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "Unable to create support report.");
    }
  }

  async function clearPrivacyData() {
    setError(null);
    setActionNotice(null);
    try {
      await deletePrivacyData();
      setPlan(null);
      setReminders([]);
      setPreflight(null);
      setMcpReplay([]);
      setWidgets([]);
      setWidgetBridge(null);
      setExportText("Local profile, plans, pantry, group plan, and reminders were deleted.");
      setActionNotice("Local data deleted. The app has been reset to reviewer-safe defaults.");
      await loadAdvancedWorkflows();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete local data.");
    }
  }

  async function substituteItem(recommendationId: string, alternativeId: string) {
    if (!plan) return;
    setError(null);
    setActionNotice(null);
    try {
      const response = await substituteRecommendationItem(plan.id, recommendationId, alternativeId);
      setPlan(response.plan);
      setActionNotice("Smart substitution applied to the recommendation.");
      void loadPlanDiagnostics(response.plan.id).catch(() => undefined);
    } catch (substituteError) {
      setError(substituteError instanceof Error ? substituteError.message : "Unable to apply substitution.");
    }
  }

  async function removeItem(recommendationId: string, itemId: string) {
    if (!plan) return;
    setError(null);
    setActionNotice(null);
    try {
      const response = await removeRecommendationItem(plan.id, recommendationId, itemId);
      setPlan(response.plan);
      setActionNotice("Item removed and the plan total recalculated.");
      void loadPlanDiagnostics(response.plan.id).catch(() => undefined);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove item.");
    }
  }

  function updateRequest<K extends keyof UserPlanningRequest>(key: K, value: UserPlanningRequest[K]) {
    setRequest((current) => ({ ...current, [key]: value }));
  }

  function applyScenario(nextRequest: UserPlanningRequest) {
    setRequest(nextRequest);
    void buildPlan(nextRequest);
  }

  async function confirmSelected() {
    if (!plan || !selectedRecommendation) return;
    setIsConfirming(true);
    setError(null);
    try {
      const response = await confirmServerRecommendation(plan.id, selectedRecommendation.id);
      setPlan(response.plan);
      setSelectedRecommendation(null);
      setActionNotice(`${serverLabel(selectedRecommendation.server)} action confirmed through the guarded API.`);
      void refreshLaunchCenter().catch(() => undefined);
      void loadPlanDiagnostics(response.plan.id).catch(() => undefined);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Unable to confirm action.");
    } finally {
      setIsConfirming(false);
    }
  }

  useEffect(() => {
    void buildPlan(initialRequest);
    void fetchHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
    void fetchProfile()
      .then((response) => setProfile(response.profile))
      .catch(() => setProfile(defaultUserProfile));
    void fetchBuilderPackage()
      .then(setBuilderPackage)
      .catch(() => setBuilderPackage(null));
    void refreshSwiggyAuthStatus().catch(() => setSwiggyAuthStatus(null));
    void loadAdvancedWorkflows().catch(() => undefined);

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (window.location.pathname === "/auth/swiggy/callback" && code && state) {
      void completeSwiggyAuth(code, state)
        .then((response) => {
          setAuthUrl(null);
          setSwiggyAuthStatus(response.authStatus);
          void refreshLaunchCenter().catch(() => undefined);
        })
        .catch((authError: unknown) => {
          setError(authError instanceof Error ? authError.message : "Unable to complete OAuth callback.");
          void refreshSwiggyAuthStatus().catch(() => undefined);
        })
        .finally(() => {
          window.history.replaceState({}, "", "/");
        });
    }
  }, []);

  useEffect(() => {
    if (!plan) return;
    void fetchAgentSurface(plan.id, surfaceMode)
      .then((response) => setAgentSurface(response.response))
      .catch(() => setAgentSurface(null));
  }, [plan?.id, surfaceMode]);

  useEffect(() => {
    if (!plan) return;
    void loadPlanDiagnostics(plan.id).catch(() => undefined);
  }, [plan?.id]);

  useEffect(() => {
    if (!selectedRecommendation) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedRecommendation(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedRecommendation]);

  return (
    <div className="portal-shell">
      <header className="app-topbar">
        <a className="topbar-brand" href="#planner" onClick={() => setIsMobileNavOpen(false)}>
          <MealPilotLogo />
        </a>
        <nav className="topbar-nav" aria-label="Primary navigation">
          {navigationSections.map((section) => (
            <a key={section.href} href={section.href}>
              {section.label}
            </a>
          ))}
        </nav>
        <div className="topbar-actions">
          <span className="system-status" data-online={health?.ok ? "true" : "false"}>
            <span aria-hidden="true" />
            {health?.ok ? "API live" : "Connecting"}
          </span>
          <button className="login-button" type="button" onClick={() => void beginOAuth()}>
            <LockKeyhole aria-hidden="true" />
            <span>{authUrl ? "Open Swiggy OAuth" : "Login with Swiggy"}</span>
          </button>
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileNavOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span>Menu</span>
          </button>
        </div>
      </header>

      <nav
        id="mobile-navigation"
        className={isMobileNavOpen ? "mobile-navigation open" : "mobile-navigation"}
        aria-label="Mobile navigation"
      >
        {navigationSections.map((section) => (
          <a key={section.href} href={section.href} onClick={() => setIsMobileNavOpen(false)}>
            {section.label}
          </a>
        ))}
      </nav>

      <main className="app-shell">
      <aside className="sidebar" aria-label="MealPilot workspace">
        <div className="brand-block">
          <MealPilotLogo />
        </div>

        <section className="side-panel">
          <div className="panel-title">
            <LockKeyhole aria-hidden="true" />
            <span>Access Mode</span>
          </div>
          <div className="mode-card">
            <strong>{health?.mode === "mock" ? "Local API + MCP stub" : `${health?.mode ?? "API"} mode`}</strong>
            <span>{health?.ok ? "Backend connected" : "Checking backend"}</span>
          </div>
        </section>

        <section className="side-panel profile-panel">
          <div className="panel-title">
            <Bot aria-hidden="true" />
            <span>Household Profile</span>
          </div>
          <label>
            Name
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          </label>
          <label>
            Allergies
            <input
              value={profile.allergies.join(", ")}
              onChange={(event) => setProfile({ ...profile, allergies: normalizeListInput(event.target.value) })}
            />
          </label>
          <label>
            Cuisines
            <input
              value={profile.favoriteCuisines.join(", ")}
              onChange={(event) => setProfile({ ...profile, favoriteCuisines: normalizeListInput(event.target.value) })}
            />
          </label>
          <button className="ghost-button compact" type="button" onClick={() => void saveProfile()}>
            Save profile
          </button>
        </section>

        <section className="side-panel">
          <div className="panel-title">
            <ClipboardCheck aria-hidden="true" />
            <span>Builder Readiness</span>
          </div>
          <ul className="checklist">
            {readiness.map((item) => (
              <li key={item.label} className={item.done ? "done" : ""}>
                <span>{item.done ? <Check aria-hidden="true" /> : <span className="dot" />}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </section>

        <a className="github-link" href="https://github.com/Farhankhan0128/MealPilot" target="_blank" rel="noreferrer">
          <GitBranch aria-hidden="true" />
          <span>GitHub repo</span>
          <ChevronRight aria-hidden="true" />
        </a>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">AI commerce pilot</p>
            <h1>Plan, prepare, confirm.</h1>
          </div>
          <button className="icon-button primary" type="button" onClick={() => void buildPlan()} disabled={isPlanning}>
            {isPlanning ? <Loader2 className="spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
            <span>{isPlanning ? "Planning" : "Run plan"}</span>
          </button>
        </header>

        <section className="action-bar" aria-label="Operations">
          <button className="icon-button dark" type="button" onClick={() => void confirmEverything()} disabled={!plan || isConfirming}>
            {isConfirming ? <Loader2 className="spin" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
            <span>Confirm all prepared</span>
          </button>
          <button className="ghost-button" type="button" onClick={() => void refreshTracking()} disabled={!plan}>
            <RefreshCw aria-hidden="true" />
            Refresh tracking
          </button>
          <button className="ghost-button" type="button" onClick={() => void beginOAuth()}>
            <LockKeyhole aria-hidden="true" />
            {authUrl ? "Open Swiggy OAuth" : "Start Swiggy OAuth"}
          </button>
          <button className="ghost-button" type="button" onClick={() => void scheduleCurrentPlan()} disabled={!plan}>
            <CalendarCheck aria-hidden="true" />
            Schedule reminders
          </button>
          <button className="ghost-button" type="button" onClick={() => void exportBuilderMarkdown()}>
            <ClipboardCheck aria-hidden="true" />
            Export packet
          </button>
          {authUrl ? (
            <a className="auth-url" href={authUrl} target="_blank" rel="noreferrer">
              OAuth URL ready
            </a>
          ) : null}
        </section>

        {actionNotice ? (
          <section className="action-notice" role="status" aria-live="polite">
            <Check aria-hidden="true" />
            <span>{actionNotice}</span>
            {exportText ? <a href="#ops">Open preview</a> : null}
          </section>
        ) : null}

        <SwiggyAuthPanel
          authStatus={swiggyAuthStatus}
          authUrl={authUrl}
          onRefresh={() => void refreshSwiggyAuthStatus()}
        />

        <section className="planner-grid" id="planner">
          <div className="composer-card">
            <div className="scenario-row" aria-label="Demo scenarios">
              {scenarios.map((scenario) => (
                <button key={scenario.label} type="button" onClick={() => applyScenario(scenario.request)}>
                  {scenario.label}
                </button>
              ))}
            </div>

            <label className="prompt-label" htmlFor="prompt">
              Request
            </label>
            <textarea
              id="prompt"
              value={request.prompt}
              onChange={(event) => updateRequest("prompt", event.target.value)}
              rows={5}
            />

            <div className="input-grid">
              <label>
                City
                <select
                  value={request.city}
                  onChange={(event) => updateRequest("city", event.target.value as UserPlanningRequest["city"])}
                >
                  <option>Bengaluru</option>
                  <option>Delhi NCR</option>
                  <option>Mumbai</option>
                </select>
              </label>
              <label>
                Budget
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={request.budget}
                  onChange={(event) => updateRequest("budget", Number(event.target.value))}
                />
              </label>
              <label>
                Diet
                <select
                  value={request.diet}
                  onChange={(event) => updateRequest("diet", event.target.value as UserPlanningRequest["diet"])}
                >
                  <option>high-protein vegetarian</option>
                  <option>vegetarian</option>
                  <option>balanced</option>
                </select>
              </label>
              <label>
                Guests
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={request.guests}
                  onChange={(event) => updateRequest("guests", Number(event.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="metrics-card">
            <Metric icon={<Gauge aria-hidden="true" />} label="Budget" value={plan ? formatMoney(plan.total) : "..."} />
            <Metric icon={<Bot aria-hidden="true" />} label="MCP calls" value={String(plan?.callCount ?? "...")} />
            <Metric icon={<ShieldCheck aria-hidden="true" />} label="Confirmed" value={`${confirmedCount}/3`} />
            <Metric icon={<Database aria-hidden="true" />} label="Backend" value={health?.ok ? "Live" : "..."} />
          </div>
        </section>

        {error ? (
          <section className="error-strip" role="alert">
            {error}
          </section>
        ) : null}

        {plan ? (
          <>
            <section className="insight-strip" aria-label="Planner summary">
              <div>
                <MapPin aria-hidden="true" />
                <span>{plan.summary}</span>
              </div>
              <strong data-fit={plan.budgetFit}>{plan.budgetFit.replace("_", " ")}</strong>
            </section>

            <section className="variant-strip" aria-label="Plan variants">
              {plan.variants.map((variant) => (
                <article key={variant.id}>
                  <strong>{variant.label}</strong>
                  <span>{formatMoney(variant.total)}</span>
                  <p>{variant.tradeoff}</p>
                </article>
              ))}
            </section>

            <section className="recommendations" id="recommendations" aria-label="Swiggy recommendations">
              {plan.recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onConfirm={() => setSelectedRecommendation(recommendation)}
                  onSubstitute={(alternativeId) => void substituteItem(recommendation.id, alternativeId)}
                  onRemove={(itemId) => void removeItem(recommendation.id, itemId)}
                />
              ))}
            </section>

            <section className="lower-grid" id="ops">
              <InsightsPanel insights={plan.insights} />
              <AuditPanel events={plan.auditTrail} />
              <TrackingPanel plan={plan} />
              <ReadinessPanel readiness={builderPackage?.readiness ?? []} />
              <AdvancedWorkflowPanel
                pantry={pantry}
                restock={restock}
                groupPlan={groupPlan}
                reminders={reminders}
                opsStatus={opsStatus}
                exportText={exportText}
                onAddGroupMember={() => void addDemoGroupMember()}
                onExportPrivacy={() => void exportPrivacy()}
                onClearPrivacy={() => void clearPrivacyData()}
              />
              <PremiumConciergePanel concierge={premiumConciergeItinerary} />
              <LaunchCenterPanel
                catalog={mcpCatalog}
                gateway={mcpGateway}
                handshakeDoctor={handshakeDoctor}
                capabilityRegistry={mcpCapabilityRegistry}
                resourcePromptStudio={mcpResourcePromptStudio}
                contractMatrix={toolContractMatrix}
                toolParityAuditor={toolParityAuditor}
                scenarioRunner={scenarioRunner}
                stateOrchestrator={stateOrchestrator}
                widgetRuntime={widgetRuntime}
                widgetExperience={widgetExperience}
                hostedWidgetActivation={hostedWidgetActivation}
                agentBenchmark={agentBenchmark}
                privatePilot={privatePilot}
                stagingReplay={stagingReplay}
                commercialActionGuard={commercialActionGuard}
                stagingCutover={stagingCutover}
                stagingCredentialDrill={stagingCredentialDrill}
                stagingSeedSmoke={stagingSeedSmoke}
                liveSignalCalibration={liveSignalCalibration}
                toolLab={mcpToolLab}
                buildersMap={swiggyBuildersMap}
                websiteAtlas={swiggyWebsiteAtlas}
                buildersSiteParity={buildersSiteParity}
                buildersPageMesh={buildersPageMesh}
                buildersLaunchStory={buildersLaunchStory}
                moduleIntelligence={moduleIntelligence}
                journeyGates={journeyGates}
                homepageExperience={homepageExperience}
                sourceEvolution={sourceEvolution}
                liveSourceResilience={liveSourceResilience}
                reviewDecision={reviewDecision}
                operatingContract={operatingContract}
                deepSiteMap={swiggyDeepSiteMap}
                builderIntake={swiggyBuilderIntake}
                faqPolicy={swiggyFaqPolicy}
                faqResolution={faqResolution}
                faqAnswer={faqAnswer}
                growthPartnership={swiggyGrowthPartnership}
                talentSignal={talentSignal}
                conversionCenter={conversionCenter}
                benefitsActivation={benefitsActivation}
                showcaseSubmission={showcaseSubmission}
                demoEvidence={demoEvidence}
                submissionTimeline={submissionTimeline}
                partnerSuccess={partnerSuccess}
                partnerSupport={partnerSupport}
                interactionQa={interactionQa}
                channelMultimodalStudio={channelMultimodalStudio}
                visualDishCapture={visualDishCapture}
                voiceCommerce={voiceCommerce}
                qualityLoop={qualityLoop}
                ritualAutopilot={ritualAutopilot}
                paymentTruth={paymentTruth}
                mealWindow={mealWindow}
                customizationStudio={customizationStudio}
                nutritionBudget={nutritionBudget}
                householdPreference={householdPreference}
                guestCollaboration={guestCollaboration}
                luxuryExperience={luxuryExperience}
                reviewerArtifactVault={reviewerArtifactVault}
                visualQa={visualQa}
                docsCoverage={swiggyDocsCoverage}
                docsTwinExplorer={docsTwinExplorer}
                llmsManifest={llmsManifest}
                upstreamWatch={swiggyUpstreamWatch}
                sourceIntelligence={swiggySourceIntelligence}
                developerQuickstart={developerQuickstart}
                ctaExecution={ctaExecution}
                ctaLiveAudit={ctaLiveAudit}
                innovationRadar={swiggyInnovationRadar}
                aiClientConnectKit={aiClientConnectKit}
                codingAgentGovernance={codingAgentGovernance}
                brandCompliance={brandCompliance}
                journeyCompiler={swiggyJourneyCompiler}
                accessDossier={swiggyAccessDossier}
                accessEvidenceMatrix={accessEvidenceMatrix}
                useCaseStudio={premiumUseCaseStudio}
                stagingCertification={stagingCertification}
                credentialOnboarding={credentialOnboarding}
                credentialVault={credentialVault}
                credentialHandoff={credentialHandoff}
                sandboxCredentialWorkbench={sandboxCredentialWorkbench}
                enterpriseDelegatedAuth={enterpriseDelegatedAuth}
                surfaceMode={surfaceMode}
                agentSurface={agentSurface}
                goLiveChecks={goLiveChecks}
                observabilityMetrics={observabilityMetrics}
                rollout={rollout}
                incidentReport={incidentReport}
                supportBridge={supportBridge}
                onSurfaceModeChange={setSurfaceMode}
                onCreateReport={() => void createIncidentReport()}
              />
              <DemoStudioPanel
                preflight={preflight}
                replay={mcpReplay}
                stagingTranscript={stagingTranscript}
                steps={demoSteps}
                submissionPackage={submissionPackage}
                submissionConsole={submissionConsole}
                accessSubmissionStudio={accessSubmissionStudio}
                accessSubmissionForm={accessSubmissionForm}
                builderPacketExport={builderPacketExport}
                onAccessSubmissionFormChange={setAccessSubmissionForm}
                onAccessSubmissionSave={() => void saveAccessSubmissionHandoff()}
              />
              <ProductionEvidencePanel
                widgets={widgets}
                widgetBridge={widgetBridge}
                rateLimit={rateLimit}
                trafficReadiness={trafficReadiness}
                backpressureGovernor={backpressureGovernor}
                versionMonitor={versionMonitor}
                complianceEvidence={complianceEvidence}
                dataGovernance={dataGovernance}
                reviewerProof={reviewerProof}
                launchBundle={launchBundle}
                errorIntelligence={errorIntelligence}
                resilienceDrills={resilienceDrills}
                resilienceRunbook={resilienceRunbook}
                observabilityTraceReport={observabilityTraceReport}
                runtimeTelemetry={runtimeTelemetry}
                auditLedger={auditLedger}
                sloIncident={sloIncident}
                loadLab={loadLab}
                quotaNegotiation={quotaNegotiation}
                offerIntelligence={offerIntelligence}
                orderLifecycle={orderLifecycle}
                locationTrust={locationTrust}
                cartMutation={cartMutation}
                discoveryFreshness={discoveryFreshness}
                confirmationCommandCenter={confirmationCommandCenter}
                cancellationCareCenter={cancellationCareCenter}
                dineoutPrecisionCenter={dineoutPrecisionCenter}
                authLifecycleCenter={authLifecycleCenter}
                enterprisePlatformCenter={enterprisePlatformCenter}
                routeOptimizer={routeOptimizer}
                evaluationLab={evaluationLab}
              />
            </section>
          </>
        ) : (
          <div className="empty-state">
            <Loader2 className="spin" aria-hidden="true" />
            <span>Preparing MealPilot</span>
          </div>
        )}
      </section>

      {selectedRecommendation ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRecommendation(null);
          }}
        >
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
          >
            <div className="modal-icon">{serverIcon(selectedRecommendation.server)}</div>
            <h2 id="confirm-title">Confirm {serverLabel(selectedRecommendation.server)}</h2>
            <p id="confirm-description">{buildConfirmationMessage(selectedRecommendation)}</p>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={() => setSelectedRecommendation(null)}>
                Cancel
              </button>
              <button type="button" className="icon-button primary" onClick={() => void confirmSelected()} disabled={isConfirming}>
                {isConfirming ? <Loader2 className="spin" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
                <span>{isConfirming ? "Confirming" : "Confirm action"}</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}
      </main>

      <footer className="app-footer">
        <MealPilotLogo compact />
        <nav aria-label="Footer navigation">
          <a href="#planner">Planner</a>
          <a href="#launch-center">Launch Center</a>
          <a href="#production-evidence">Evidence</a>
          <a href="https://github.com/Farhankhan0128/MealPilot" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
        <p>Designed on an open Carbon-inspired product grid for Swiggy MCP review readiness.</p>
      </footer>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function authEventStatus(status?: SwiggyAuthStatusReport["latestEvent"]["status"]) {
  if (status === "callback_exchanged" || status === "callback_mocked") return "healthy";
  if (status === "callback_failed") return "blocked";
  return "watch";
}

function SwiggyAuthPanel({
  authStatus,
  authUrl,
  onRefresh,
}: {
  authStatus: SwiggyAuthStatusReport | null;
  authUrl: string | null;
  onRefresh: () => void;
}) {
  const latest = authStatus?.latestEvent;
  const redirectStatus = authStatus?.redirectUri.startsWith("https://") ? "ready" : "watch";

  return (
    <section className="auth-status-panel" aria-label="Swiggy OAuth status">
      <div className="auth-status-head">
        <div className="mini-heading">
          <LockKeyhole aria-hidden="true" />
          <strong>Swiggy OAuth</strong>
        </div>
        <button className="ghost-button" type="button" onClick={onRefresh}>
          <RefreshCw aria-hidden="true" />
          Refresh
        </button>
      </div>
      <div className="auth-status-summary" data-status={authEventStatus(latest?.status)}>
        <strong>{latest?.label ?? "Loading OAuth status"}</strong>
        <span>{latest?.status.replaceAll("_", " ") ?? "pending"}</span>
      </div>
      <div className="auth-status-grid">
        <div>
          <strong>{authStatus?.gatewayAuth.tokenSource ?? "none"}</strong>
          <span>Token source</span>
        </div>
        <div>
          <strong>{authStatus?.pendingVerifierCount ?? 0}</strong>
          <span>PKCE pending</span>
        </div>
        <div>
          <strong>{redirectStatus}</strong>
          <span>Redirect URI</span>
        </div>
        <div>
          <strong>{latest?.expiresAt ? new Date(latest.expiresAt).toLocaleDateString("en-IN") : "none"}</strong>
          <span>Token expiry</span>
        </div>
      </div>
      <div className="auth-status-links">
        <span>{authStatus?.endpoints.authorize ?? "OAuth endpoint pending"}</span>
        {authUrl ? (
          <a href={authUrl} target="_blank" rel="noreferrer">
            Open authorize
          </a>
        ) : null}
      </div>
      <ul className="compact-status-list">
        {(authStatus?.callbackChecklist ?? []).slice(0, 4).map((item) => (
          <li key={item.id} data-status={item.status}>
            <span>{item.label}</span>
            <strong>{item.status}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecommendationCard({
  recommendation,
  onConfirm,
  onSubstitute,
  onRemove,
}: {
  recommendation: Recommendation;
  onConfirm: () => void;
  onSubstitute: (alternativeId: string) => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <article className="recommendation" data-server={recommendation.server}>
      <div className="recommendation-head">
        <div>
          <span className="server-pill">
            {serverIcon(recommendation.server)}
            {serverLabel(recommendation.server)}
          </span>
          <h2>{recommendation.title}</h2>
        </div>
        <strong className={`status ${recommendation.status}`}>{statusCopy(recommendation.status)}</strong>
      </div>

      <div className="provider-line">
        <span>{recommendation.provider}</span>
        <span>{recommendation.eta}</span>
      </div>

      <p className="reason">{recommendation.reason}</p>

      <ul className="item-list">
        {recommendation.items.map((item) => (
          <li key={`${recommendation.id}_${item.name}`}>
            <div>
              <span>{item.name}</span>
              <small>{item.quantity}</small>
            </div>
            <div className="item-actions">
              <strong>{item.price === 0 ? "Included" : formatMoney(item.price)}</strong>
              {item.price > 0 && item.id ? (
                <button
                  type="button"
                  onClick={() => {
                  if (item.id) onRemove(item.id);
                  }}
                  disabled={recommendation.status !== "prepared"}
                  aria-disabled={recommendation.status !== "prepared"}
                >
                  Remove
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {recommendation.alternatives.length > 0 ? (
        <div className="substitution-box">
          <small>Smart substitution</small>
          {recommendation.alternatives.map((alternative) => (
            <button
              key={alternative.id}
              type="button"
              onClick={() => onSubstitute(alternative.id)}
              disabled={recommendation.status !== "prepared"}
              aria-disabled={recommendation.status !== "prepared"}
            >
              {alternative.name} - {formatMoney(alternative.price)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="guardrails">
        {recommendation.guardrails.map((guardrail) => (
          <span key={guardrail}>{guardrail}</span>
        ))}
      </div>

      <div className="recommendation-foot">
        <div>
          <small>Estimated total</small>
          <strong>{formatMoney(recommendation.total)}</strong>
        </div>
        <button
          className="icon-button dark"
          type="button"
          onClick={onConfirm}
          disabled={recommendation.status !== "prepared"}
          aria-disabled={recommendation.status !== "prepared"}
        >
          <ShieldCheck aria-hidden="true" />
          <span>{recommendation.status === "prepared" ? "Confirm" : statusCopy(recommendation.status)}</span>
        </button>
      </div>
    </article>
  );
}

function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <section className="analysis-panel">
      <div className="section-heading">
        <Sparkles aria-hidden="true" />
        <h2>Decision Notes</h2>
      </div>
      <ul className="notes-list">
        {insights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </section>
  );
}

function AuditPanel({ events }: { events: ToolCallEvent[] }) {
  return (
    <section className="analysis-panel">
      <div className="section-heading">
        <Activity aria-hidden="true" />
        <h2>Audit Timeline</h2>
      </div>
      <ol className="audit-timeline">
        {events.map((event) => (
          <li key={event.id}>
            <span className="timeline-server">{serverLabel(event.server)}</span>
            <div>
              <strong>{event.tool}</strong>
              <p>{event.detail}</p>
            </div>
            <small>{event.durationMs}ms</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TrackingPanel({ plan }: { plan: MealPlan }) {
  const events = plan.tracking;
  return (
    <section className="analysis-panel">
      <div className="section-heading">
        <RefreshCw aria-hidden="true" />
        <h2>Live Tracking</h2>
      </div>
      {events.length > 0 ? (
        <ol className="tracking-list">
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.label}</strong>
              <span>{event.status.replace("_", " ")}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted-copy">Confirm at least one action to generate simulated Swiggy tracking events.</p>
      )}
    </section>
  );
}

function ReadinessPanel({ readiness }: { readiness: BuilderPackageResponse["readiness"] }) {
  return (
    <section className="analysis-panel">
      <div className="section-heading">
        <ClipboardCheck aria-hidden="true" />
        <h2>Builder Access Package</h2>
      </div>
      <ul className="readiness-list">
        {readiness.map((item) => (
          <li key={item.id} data-status={item.status}>
            <strong>{item.label}</strong>
            <span>{item.evidence}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AdvancedWorkflowPanel({
  pantry,
  restock,
  groupPlan,
  reminders,
  opsStatus,
  exportText,
  onAddGroupMember,
  onExportPrivacy,
  onClearPrivacy,
}: {
  pantry: PantryItem[];
  restock: RestockSuggestion[];
  groupPlan: GroupPlan | null;
  reminders: Reminder[];
  opsStatus: OpsStatus[];
  exportText: string | null;
  onAddGroupMember: () => void;
  onExportPrivacy: () => void;
  onClearPrivacy: () => void;
}) {
  return (
    <section className="analysis-panel advanced-panel">
      <div className="section-heading">
        <Database aria-hidden="true" />
        <h2>Operating System</h2>
      </div>

      <div className="workflow-grid">
        <article>
          <strong>Pantry Autopilot</strong>
          <span>{pantry.length} tracked items</span>
          <ul>
            {restock.slice(0, 3).map((item) => (
              <li key={item.id}>
                {item.name} - {item.quantity}
              </li>
            ))}
          </ul>
        </article>

        <article>
          <strong>Group Planning</strong>
          <span>{groupPlan?.members.length ?? 0} members, {formatMoney(groupPlan?.combinedBudget ?? 0)}</span>
          <p>{groupPlan?.recommendation ?? "No group plan yet."}</p>
          <button type="button" onClick={onAddGroupMember}>
            Add demo member
          </button>
        </article>

        <article>
          <strong>Reminder Queue</strong>
          <span>{reminders.length} scheduled</span>
          <ul>
            {reminders.slice(0, 3).map((reminder) => (
              <li key={reminder.id}>{reminder.label}</li>
            ))}
          </ul>
        </article>

        <article>
          <strong>Ops Status</strong>
          <ul>
            {opsStatus.map((item) => (
              <li key={item.id}>
                {item.label}: {item.status}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="privacy-actions">
        <button type="button" onClick={onExportPrivacy}>
          Export privacy data
        </button>
        <button type="button" onClick={onClearPrivacy}>
          Delete local data
        </button>
      </div>

      {exportText ? <pre className="export-preview">{exportText.slice(0, 1400)}</pre> : null}
    </section>
  );
}

function PremiumConciergePanel({ concierge }: { concierge: PremiumConciergeItineraryReport | null }) {
  const firstSlot = concierge?.itinerary[0];

  return (
    <section className="analysis-panel concierge-panel">
      <div className="section-heading">
        <CalendarCheck aria-hidden="true" />
        <h2>Premium Concierge</h2>
      </div>

      <div className="concierge-summary">
        <div>
          <strong>{concierge?.title ?? "Loading concierge itinerary"}</strong>
          <span>{concierge?.promise ?? "Coordinating Swiggy Food, Instamart, and Dineout into one premium plan."}</span>
        </div>
        <strong>{concierge ? `${concierge.score}/100` : "..."}</strong>
      </div>

      <div className="concierge-stat-grid">
        <div>
          <strong>{concierge?.itinerary.length ?? 0}</strong>
          <span>Slots</span>
        </div>
        <div>
          <strong>{concierge?.totalSavedCalls ?? 0}</strong>
          <span>Calls saved</span>
        </div>
        <div>
          <strong>{concierge?.toolCoverage.map((item) => item.coverage).join(" / ") ?? "..."}</strong>
          <span>Tool coverage</span>
        </div>
      </div>

      <div className="concierge-slot-list">
        {(concierge?.itinerary ?? []).slice(0, 4).map((slot) => (
          <article key={slot.id}>
            <div>
              <strong>{slot.title}</strong>
              <span>{slot.day} / {slot.timeBand}</span>
            </div>
            <small>{slot.primaryRecipe}</small>
            <p>{slot.confirmation}</p>
          </article>
        ))}
      </div>

      {firstSlot ? (
        <ul className="compact-status-list">
          {firstSlot.route.slice(0, 4).map((routeStep) => (
            <li key={`${firstSlot.id}_${routeStep.sequence}`} data-status={routeStep.status === "ready" ? "healthy" : "watch"}>
              <span>{routeStep.label}</span>
              <strong>{serverLabel(routeStep.server)}</strong>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function LaunchCenterPanel({
  catalog,
  gateway,
  handshakeDoctor,
  capabilityRegistry,
  resourcePromptStudio,
  contractMatrix,
  toolParityAuditor,
  scenarioRunner,
  stateOrchestrator,
  widgetRuntime,
  widgetExperience,
  hostedWidgetActivation,
  agentBenchmark,
  privatePilot,
  stagingReplay,
  commercialActionGuard,
  stagingCutover,
  stagingCredentialDrill,
  stagingSeedSmoke,
  liveSignalCalibration,
  toolLab,
  buildersMap,
  websiteAtlas,
  buildersSiteParity,
  buildersPageMesh,
  buildersLaunchStory,
  moduleIntelligence,
  journeyGates,
  homepageExperience,
  sourceEvolution,
  liveSourceResilience,
  operatingContract,
  deepSiteMap,
  builderIntake,
  faqPolicy,
  faqResolution,
  faqAnswer,
  growthPartnership,
  talentSignal,
  conversionCenter,
  benefitsActivation,
  showcaseSubmission,
  demoEvidence,
  submissionTimeline,
  partnerSuccess,
  partnerSupport,
  interactionQa,
  channelMultimodalStudio,
  visualDishCapture,
  voiceCommerce,
  qualityLoop,
  ritualAutopilot,
  paymentTruth,
  mealWindow,
  customizationStudio,
  nutritionBudget,
  householdPreference,
  guestCollaboration,
  luxuryExperience,
  reviewerArtifactVault,
  reviewDecision,
  visualQa,
  docsCoverage,
  docsTwinExplorer,
  llmsManifest,
  upstreamWatch,
  sourceIntelligence,
  developerQuickstart,
  ctaExecution,
  ctaLiveAudit,
  innovationRadar,
  aiClientConnectKit,
  codingAgentGovernance,
  brandCompliance,
  journeyCompiler,
  accessDossier,
  accessEvidenceMatrix,
  useCaseStudio,
  stagingCertification,
  credentialOnboarding,
  credentialVault,
  credentialHandoff,
  sandboxCredentialWorkbench,
  enterpriseDelegatedAuth,
  surfaceMode,
  agentSurface,
  goLiveChecks,
  observabilityMetrics,
  rollout,
  incidentReport,
  supportBridge,
  onSurfaceModeChange,
  onCreateReport,
}: {
  catalog: McpCatalogResponse | null;
  gateway: McpGatewayStatus | null;
  handshakeDoctor: SwiggyHandshakeDoctor | null;
  capabilityRegistry: McpCapabilityRegistry | null;
  resourcePromptStudio: McpResourcePromptStudio | null;
  contractMatrix: SwiggyToolContractMatrix | null;
  toolParityAuditor: SwiggyToolParityAuditor | null;
  scenarioRunner: SwiggyScenarioRunnerReport | null;
  stateOrchestrator: SwiggyStateOrchestratorReport | null;
  widgetRuntime: SwiggyWidgetRuntimeReport | null;
  widgetExperience: SwiggyWidgetExperienceComposer | null;
  hostedWidgetActivation: SwiggyHostedWidgetActivationCenter | null;
  agentBenchmark: SwiggyAgentExperienceBenchmark | null;
  privatePilot: SwiggyPrivatePilotControlRoom | null;
  stagingReplay: SwiggyStagingReplayCenter | null;
  commercialActionGuard: CommercialActionGuardReport | null;
  stagingCutover: SwiggyStagingCutoverRehearsal | null;
  stagingCredentialDrill: SwiggyStagingCredentialDrillReport | null;
  stagingSeedSmoke: SwiggyStagingSeedSmokeCenter | null;
  liveSignalCalibration: SwiggyLiveSignalCalibrationReport | null;
  toolLab: McpToolLabReport | null;
  buildersMap: SwiggyBuildersMap | null;
  websiteAtlas: SwiggyWebsiteAtlas | null;
  buildersSiteParity: SwiggyBuildersSiteParityAuditor | null;
  buildersPageMesh: SwiggyBuildersPageMeshAuditor | null;
  buildersLaunchStory: SwiggyBuildersLaunchStoryCenterReport | null;
  moduleIntelligence: SwiggyBuildersModuleIntelligenceCenter | null;
  journeyGates: SwiggyBuildersJourneyGateCenter | null;
  homepageExperience: SwiggyBuildersHomepageExperienceCenter | null;
  sourceEvolution: SwiggyBuildersSourceEvolutionCenter | null;
  liveSourceResilience: SwiggyBuildersLiveSourceResilienceCenter | null;
  operatingContract: SwiggyOperatingContractCenterReport | null;
  deepSiteMap: SwiggyDeepSiteMap | null;
  builderIntake: SwiggyBuilderIntakeCommandCenter | null;
  faqPolicy: SwiggyFaqPolicyCenter | null;
  faqResolution: SwiggyFaqResolutionCenter | null;
  faqAnswer: SwiggyFaqAnswerResolution | null;
  growthPartnership: SwiggyGrowthPartnershipCenter | null;
  talentSignal: SwiggyTalentSignalCenter | null;
  conversionCenter: SwiggyConversionCenter | null;
  benefitsActivation: SwiggyBenefitsActivationCenter | null;
  showcaseSubmission: SwiggyShowcaseSubmissionCenter | null;
  demoEvidence: SwiggyDemoEvidenceDirector | null;
  submissionTimeline: SwiggySubmissionTimelineCenter | null;
  partnerSuccess: SwiggyPartnerSuccessDesk | null;
  partnerSupport: SwiggyPartnerSupportRoom | null;
  interactionQa: SwiggyInteractionQaCenter | null;
  channelMultimodalStudio: SwiggyChannelMultimodalStudio | null;
  visualDishCapture: SwiggyVisualDishCaptureCenter | null;
  voiceCommerce: SwiggyVoiceCommerceCenter | null;
  qualityLoop: SwiggyQualityLoopCenter | null;
  ritualAutopilot: SwiggyRitualAutopilotCenter | null;
  paymentTruth: SwiggyPaymentTruthCenter | null;
  mealWindow: SwiggyMealWindowCenter | null;
  customizationStudio: SwiggyCustomizationStudio | null;
  nutritionBudget: NutritionBudgetIntelligence | null;
  householdPreference: HouseholdPreferenceGraph | null;
  guestCollaboration: GuestCollaborationCenter | null;
  luxuryExperience: LuxuryExperienceWorkspace | null;
  reviewerArtifactVault: ReviewerArtifactVault | null;
  reviewDecision: SwiggyBuildersReviewDecisionCenter | null;
  visualQa: VisualQaCenter | null;
  docsCoverage: SwiggyDocsCoverageReport | null;
  docsTwinExplorer: SwiggyDocsTwinExplorer | null;
  llmsManifest: SwiggyLlmsManifestVerifier | null;
  upstreamWatch: SwiggyUpstreamWatchReport | null;
  sourceIntelligence: SwiggySourceIntelligenceReport | null;
  developerQuickstart: DeveloperQuickstartWorkbench | null;
  ctaExecution: SwiggyCtaExecutionCenter | null;
  ctaLiveAudit: SwiggyCtaLiveAuditor | null;
  innovationRadar: SwiggyInnovationRadarReport | null;
  aiClientConnectKit: AiClientConnectKit | null;
  codingAgentGovernance: CodingAgentGovernance | null;
  brandCompliance: BrandComplianceKit | null;
  journeyCompiler: SwiggyJourneyCompilerReport | null;
  accessDossier: SwiggyAccessDossier | null;
  accessEvidenceMatrix: SwiggyAccessEvidenceMatrix | null;
  useCaseStudio: PremiumUseCaseStudio | null;
  stagingCertification: StagingCertificationMatrix | null;
  credentialOnboarding: CredentialOnboardingReport | null;
  credentialVault: SwiggyCredentialVaultCenter | null;
  credentialHandoff: SwiggyCredentialHandoffCenter | null;
  sandboxCredentialWorkbench: SandboxCredentialWorkbench | null;
  enterpriseDelegatedAuth: EnterpriseDelegatedAuthCenter | null;
  surfaceMode: AgentSurface;
  agentSurface: AgentSurfaceResponse | null;
  goLiveChecks: GoLiveCheck[];
  observabilityMetrics: ObservabilityMetric[];
  rollout: GoLiveResponse["rollout"] | null;
  incidentReport: IncidentReport | null;
  supportBridge: SupportBridgeReport | null;
  onSurfaceModeChange: (surface: AgentSurface) => void;
  onCreateReport: () => void;
}) {
  const credentialReadyChecks =
    credentialOnboarding?.checks.filter((check) => check.status === "ready").length ?? 0;
  const credentialTotalChecks = credentialOnboarding?.checks.length ?? 0;
  const enterpriseReadySteps =
    enterpriseDelegatedAuth?.flow.filter((step) => step.status === "ready").length ?? 0;
  const enterpriseTokenLifetime =
    enterpriseDelegatedAuth?.tokenLifecycle.find((item) => item.item === "Access token")?.lifetime ?? "5 days";
  const accessReadyFields = accessDossier?.applicationFields.filter((field) => field.status === "ready").length ?? 0;
  const accessManualFields =
    accessDossier?.applicationFields.filter((field) => field.status === "manual_input").length ?? 0;
  const certificationCredentialWaves =
    stagingCertification?.waves.filter((waveItem) => waveItem.status === "requires_staging_credentials").length ?? 0;
  const certificationGateWaves =
    stagingCertification?.waves.filter((waveItem) => waveItem.status === "production_gate").length ?? 0;
  const sourceEvidenceLinks = Array.from(
    new Set((sourceIntelligence?.buildQueue ?? []).flatMap((item) => item.evidenceLinks)),
  ).slice(0, 3);
  const officialSourceLinks = (sourceIntelligence?.officialSources ?? []).slice(0, 2);
  const [faqAnswerQuestion, setFaqAnswerQuestion] = useState(FAQ_ANSWER_SAMPLE_QUESTION);
  const [interactiveFaqAnswer, setInteractiveFaqAnswer] = useState<SwiggyFaqAnswerResolution | null>(null);
  const [faqAnswerStatus, setFaqAnswerStatus] = useState<"idle" | "loading" | "error">("idle");
  const visibleFaqAnswer = interactiveFaqAnswer ?? faqAnswer;
  const [growthAskForm, setGrowthAskForm] = useState({
    experimentId: "luxury_weekend_concierge",
    askId: "co_marketing_review",
    audienceNote: "Premium cross-server launch proof for Swiggy Builders review.",
  });
  const [growthAskPacket, setGrowthAskPacket] = useState<SwiggyGrowthPartnershipAskPacket | null>(null);
  const [growthAskStatus, setGrowthAskStatus] = useState<"idle" | "loading" | "error">("idle");
  const [talentOutreachForm, setTalentOutreachForm] = useState({
    pathId: "builder_visibility",
    demoUrl: "https://youtu.be/mealpilot-swiggy-demo",
    githubUrl: "https://github.com/Farhankhan0128/MealPilot",
    technicalSummary: "Complete Food, Instamart, and Dineout MCP product with premium UX, safety gates, tests, telemetry, and visual QA.",
  });
  const [talentOutreach, setTalentOutreach] = useState<SwiggyTalentOutreachPacket | null>(null);
  const [talentOutreachStatus, setTalentOutreachStatus] = useState<"idle" | "loading" | "error">("idle");
  const [partnerSuccessForm, setPartnerSuccessForm] = useState({
    laneId: "traffic_capacity",
    operatorEmail: "operator@example.com",
    launchWindow: "Launch week dry run",
    contextNote: "Capacity and support handoff for Swiggy Builders review.",
  });
  const [partnerSuccessHandoff, setPartnerSuccessHandoff] = useState<SwiggyPartnerSuccessHandoffPacket | null>(null);
  const [partnerSuccessHandoffStatus, setPartnerSuccessHandoffStatus] = useState<"idle" | "loading" | "error">("idle");
  const [partnerSupportForm, setPartnerSupportForm] = useState({
    channelId: "report_error",
    incidentLaneId: "s1",
    operatorEmail: "operator@example.com",
    sessionId: "mp_support_demo",
    summary: "Report-error support packet for a Swiggy Builders review incident.",
  });
  const [partnerSupportPacket, setPartnerSupportPacket] = useState<SwiggyPartnerSupportPacket | null>(null);
  const [partnerSupportPacketStatus, setPartnerSupportPacketStatus] = useState<"idle" | "loading" | "error">("idle");
  const [interactionQaForm, setInteractionQaForm] = useState({
    laneId: "developer_first_call",
    operatorEmail: "operator@example.com",
    evidenceNote: "Dry-run CTA proof for Swiggy Builders reviewer packet.",
    dryRunConfirmed: true,
  });
  const [interactionQaRehearsal, setInteractionQaRehearsal] = useState<SwiggyInteractionQaRehearsal | null>(null);
  const [interactionQaRehearsalStatus, setInteractionQaRehearsalStatus] = useState<"idle" | "loading" | "error">("idle");
  const [channelExecutionForm, setChannelExecutionForm] = useState({
    laneId: "voice_agent",
    channelId: "voice_tts",
    operatorEmail: "operator@example.com",
    userTrigger: "User asks for a hands-free dinner ordering route.",
    dryRunConfirmed: true,
  });
  const [channelExecutionComposition, setChannelExecutionComposition] = useState<SwiggyChannelExecutionComposition | null>(null);
  const [channelExecutionStatus, setChannelExecutionStatus] = useState<"idle" | "loading" | "error">("idle");
  const [paymentTruthForm, setPaymentTruthForm] = useState<{
    server: "food" | "instamart" | "dineout" | "combined";
    cartTotal: number;
    expectedDiscount: number;
    paymentPreference: "cod" | "online" | "free_booking" | "unknown";
    city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  }>({
    server: "food",
    cartTotal: 720,
    expectedDiscount: 120,
    paymentPreference: "cod",
    city: "Bengaluru",
  });
  const [paymentReconciliation, setPaymentReconciliation] = useState<SwiggyPaymentTruthReconciliation | null>(null);
  const [paymentReconciliationStatus, setPaymentReconciliationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [mealWindowForm, setMealWindowForm] = useState<{
    city: "Bengaluru" | "Delhi NCR" | "Mumbai";
    window: SwiggyMealWindow;
    partySize: number;
    urgency: "now" | "today" | "this_week";
    includeDineout: boolean;
  }>({
    city: "Bengaluru",
    window: "lunch",
    partySize: 2,
    urgency: "now",
    includeDineout: false,
  });
  const [mealWindowForecast, setMealWindowForecast] = useState<SwiggyMealWindowForecast | null>(null);
  const [mealWindowForecastStatus, setMealWindowForecastStatus] = useState<"idle" | "loading" | "error">("idle");
  const [customizationForm, setCustomizationForm] = useState<{
    server: "food" | "instamart" | "dineout" | "combined";
    intent: string;
    hasAllergy: boolean;
    userChangedVariant: boolean;
    quantity: number;
    includeDineout: boolean;
  }>({
    server: "food",
    intent: "Paneer bowl, no onion, less spice",
    hasAllergy: false,
    userChangedVariant: true,
    quantity: 1,
    includeDineout: false,
  });
  const [customizationValidation, setCustomizationValidation] = useState<SwiggyCustomizationValidation | null>(null);
  const [customizationValidationStatus, setCustomizationValidationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [nutritionAdviceForm, setNutritionAdviceForm] = useState<{
    city: "Bengaluru" | "Delhi NCR" | "Mumbai";
    budget: number;
    proteinTargetGrams: number;
    partySize: number;
    preference: "food" | "instamart" | "dineout" | "combined";
    couponSensitive: boolean;
    includeDineout: boolean;
  }>({
    city: "Bengaluru",
    budget: 900,
    proteinTargetGrams: 80,
    partySize: 1,
    preference: "food",
    couponSensitive: true,
    includeDineout: false,
  });
  const [nutritionAdvice, setNutritionAdvice] = useState<NutritionBudgetAdvice | null>(null);
  const [nutritionAdviceStatus, setNutritionAdviceStatus] = useState<"idle" | "loading" | "error">("idle");
  const [preferenceSimulationForm, setPreferenceSimulationForm] = useState<{
    city: "Bengaluru" | "Delhi NCR" | "Mumbai";
    householdMode: "primary_planner" | "family_group" | "office_team" | "weekend_guest";
    preferredServer: "food" | "instamart" | "dineout" | "combined";
    consentToUseHistory: boolean;
    recentFailure: boolean;
    occasionMode: boolean;
  }>({
    city: "Bengaluru",
    householdMode: "family_group",
    preferredServer: "instamart",
    consentToUseHistory: true,
    recentFailure: false,
    occasionMode: false,
  });
  const [preferenceSimulation, setPreferenceSimulation] = useState<HouseholdPreferenceSimulation | null>(null);
  const [preferenceSimulationStatus, setPreferenceSimulationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [guestHandoffForm, setGuestHandoffForm] = useState<{
    templateId: string;
    channel: GuestCollaborationChannel;
    guestCount: number;
    city: "Bengaluru" | "Delhi NCR" | "Mumbai";
    includeDineout: boolean;
  }>({
    templateId: "date_night",
    channel: "calendar_ics",
    guestCount: 2,
    city: "Bengaluru",
    includeDineout: true,
  });
  const [guestHandoff, setGuestHandoff] = useState<GuestCollaborationComposition | null>(null);
  const [guestHandoffStatus, setGuestHandoffStatus] = useState<"idle" | "loading" | "error">("idle");
  const [luxuryWorkspaceForm, setLuxuryWorkspaceForm] = useState<{
    modeId: LuxuryExperienceMode;
    workspaceId: string;
    city: "Bengaluru" | "Delhi NCR" | "Mumbai";
    guestCount: number;
    budget: number;
    includeDineout: boolean;
  }>({
    modeId: "premium",
    workspaceId: "reservation_atelier",
    city: "Bengaluru",
    guestCount: 2,
    budget: 2400,
    includeDineout: true,
  });
  const [luxuryWorkspaceComposition, setLuxuryWorkspaceComposition] =
    useState<LuxuryExperienceComposition | null>(null);
  const [luxuryWorkspaceStatus, setLuxuryWorkspaceStatus] = useState<"idle" | "loading" | "error">("idle");
  const [reviewerPacketForm, setReviewerPacketForm] = useState<{
    sectionId: string;
    channel: ReviewerArtifactPacketChannel;
    audience: "builder_access" | "demo_review" | "partner_support";
    includeScreenshots: boolean;
    includeDemoVideo: boolean;
    includeCredentialGates: boolean;
  }>({
    sectionId: "submission_packet",
    channel: "access_form",
    audience: "builder_access",
    includeScreenshots: true,
    includeDemoVideo: true,
    includeCredentialGates: true,
  });
  const [reviewerPacket, setReviewerPacket] = useState<ReviewerArtifactPacketComposition | null>(null);
  const [reviewerPacketStatus, setReviewerPacketStatus] = useState<"idle" | "loading" | "error">("idle");
  const [showcaseForm, setShowcaseForm] = useState({
    demoUrl: "https://youtu.be/mealpilot-swiggy-demo",
    githubUrl: "https://github.com/Farhankhan0128/MealPilot",
    operatorEmail: "operator@example.com",
  });
  const [showcaseComposition, setShowcaseComposition] = useState<SwiggyShowcaseSubmissionComposition | null>(null);
  const [showcaseComposeStatus, setShowcaseComposeStatus] = useState<"idle" | "loading" | "error">("idle");
  const [timelineCheckpointForm, setTimelineCheckpointForm] = useState<SwiggySubmissionTimelineCheckpoint["inputs"]>({
    demoRecorded: true,
    accessFormSubmitted: true,
    handoffEmailSent: true,
    dcrApproved: false,
    stagingCredentialsIssued: false,
    stagingSoakComplete: false,
    productionApproved: false,
  });
  const [timelineCheckpoint, setTimelineCheckpoint] = useState<SwiggySubmissionTimelineCheckpoint | null>(null);
  const [timelineCheckpointStatus, setTimelineCheckpointStatus] = useState<"idle" | "loading" | "error">("idle");
  const [benefitActivationId, setBenefitActivationId] = useState("quota_expansion");
  const [benefitExecution, setBenefitExecution] = useState<SwiggyBenefitsActivationExecution | null>(null);
  const [benefitExecutionStatus, setBenefitExecutionStatus] = useState<"idle" | "loading" | "error">("idle");

  async function runFaqAnswerConsole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFaqAnswerStatus("loading");
    try {
      const response = await answerSwiggyFaqQuestion(faqAnswerQuestion);
      setInteractiveFaqAnswer(response.faqAnswer);
      setFaqAnswerStatus("idle");
    } catch {
      setFaqAnswerStatus("error");
    }
  }

  async function runGrowthAskComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGrowthAskStatus("loading");
    try {
      const response = await composeSwiggyGrowthPartnershipAsk(growthAskForm);
      setGrowthAskPacket(response.growthAsk);
      setGrowthAskStatus("idle");
    } catch {
      setGrowthAskStatus("error");
    }
  }

  async function runTalentOutreachComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTalentOutreachStatus("loading");
    try {
      const response = await composeSwiggyTalentOutreach(talentOutreachForm);
      setTalentOutreach(response.talentOutreach);
      setTalentOutreachStatus("idle");
    } catch {
      setTalentOutreachStatus("error");
    }
  }

  async function runPartnerSuccessHandoff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPartnerSuccessHandoffStatus("loading");
    try {
      const response = await composeSwiggyPartnerSuccessHandoff(partnerSuccessForm);
      setPartnerSuccessHandoff(response.partnerSuccessHandoff);
      setPartnerSuccessHandoffStatus("idle");
    } catch {
      setPartnerSuccessHandoffStatus("error");
    }
  }

  async function runPartnerSupportPacket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPartnerSupportPacketStatus("loading");
    try {
      const response = await composeSwiggyPartnerSupportPacket(partnerSupportForm);
      setPartnerSupportPacket(response.partnerSupportPacket);
      setPartnerSupportPacketStatus("idle");
    } catch {
      setPartnerSupportPacketStatus("error");
    }
  }

  async function runInteractionQaRehearsal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInteractionQaRehearsalStatus("loading");
    try {
      const response = await rehearseSwiggyInteractionQa(interactionQaForm);
      setInteractionQaRehearsal(response.interactionQaRehearsal);
      setInteractionQaRehearsalStatus("idle");
    } catch {
      setInteractionQaRehearsalStatus("error");
    }
  }

  async function runChannelExecutionComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChannelExecutionStatus("loading");
    try {
      const response = await composeSwiggyChannelExecutionPacket(channelExecutionForm);
      setChannelExecutionComposition(response.channelExecutionComposition);
      setChannelExecutionStatus("idle");
    } catch {
      setChannelExecutionStatus("error");
    }
  }

  async function runPaymentTruthReconciliation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentReconciliationStatus("loading");
    try {
      const response = await reconcileSwiggyPaymentTruth(paymentTruthForm);
      setPaymentReconciliation(response.reconciliation);
      setPaymentReconciliationStatus("idle");
    } catch {
      setPaymentReconciliationStatus("error");
    }
  }

  async function runMealWindowForecast(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMealWindowForecastStatus("loading");
    try {
      const response = await forecastSwiggyMealWindow(mealWindowForm);
      setMealWindowForecast(response.forecast);
      setMealWindowForecastStatus("idle");
    } catch {
      setMealWindowForecastStatus("error");
    }
  }

  async function runCustomizationValidation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCustomizationValidationStatus("loading");
    try {
      const response = await validateSwiggyCustomization(customizationForm);
      setCustomizationValidation(response.validation);
      setCustomizationValidationStatus("idle");
    } catch {
      setCustomizationValidationStatus("error");
    }
  }

  async function runNutritionAdvice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNutritionAdviceStatus("loading");
    try {
      const response = await adviseNutritionBudget(nutritionAdviceForm);
      setNutritionAdvice(response.nutritionAdvice);
      setNutritionAdviceStatus("idle");
    } catch {
      setNutritionAdviceStatus("error");
    }
  }

  async function runPreferenceSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreferenceSimulationStatus("loading");
    try {
      const response = await simulateHouseholdPreference(preferenceSimulationForm);
      setPreferenceSimulation(response.preferenceSimulation);
      setPreferenceSimulationStatus("idle");
    } catch {
      setPreferenceSimulationStatus("error");
    }
  }

  async function runGuestHandoffComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuestHandoffStatus("loading");
    try {
      const response = await composeGuestCollaborationHandoff(guestHandoffForm);
      setGuestHandoff(response.guestCollaborationHandoff);
      setGuestHandoffStatus("idle");
    } catch {
      setGuestHandoffStatus("error");
    }
  }

  async function runLuxuryWorkspaceComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLuxuryWorkspaceStatus("loading");
    try {
      const response = await composeLuxuryExperienceWorkspace(luxuryWorkspaceForm);
      setLuxuryWorkspaceComposition(response.luxuryExperienceComposition);
      setLuxuryWorkspaceStatus("idle");
    } catch {
      setLuxuryWorkspaceStatus("error");
    }
  }

  async function runReviewerPacketComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewerPacketStatus("loading");
    try {
      const response = await composeReviewerArtifactPacket(reviewerPacketForm);
      setReviewerPacket(response.reviewerArtifactPacket);
      setReviewerPacketStatus("idle");
    } catch {
      setReviewerPacketStatus("error");
    }
  }

  async function runShowcaseComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowcaseComposeStatus("loading");
    try {
      const response = await composeSwiggyShowcaseSubmission(showcaseForm);
      setShowcaseComposition(response.showcaseComposition);
      setShowcaseComposeStatus("idle");
    } catch {
      setShowcaseComposeStatus("error");
    }
  }

  async function runTimelineCheckpoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTimelineCheckpointStatus("loading");
    try {
      const response = await runSwiggySubmissionTimelineCheckpoint(timelineCheckpointForm);
      setTimelineCheckpoint(response.submissionTimelineCheckpoint);
      setTimelineCheckpointStatus("idle");
    } catch {
      setTimelineCheckpointStatus("error");
    }
  }

  async function runBenefitActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBenefitExecutionStatus("loading");
    try {
      const response = await activateSwiggyBenefit(benefitActivationId);
      setBenefitExecution(response.benefitsExecution);
      setBenefitExecutionStatus("idle");
    } catch {
      setBenefitExecutionStatus("error");
    }
  }

  return (
    <section className="analysis-panel launch-panel" id="launch-center">
      <div className="section-heading">
        <Radio aria-hidden="true" />
        <h2>Launch Center</h2>
      </div>

      <div className="launch-grid">
        <article className="surface-card">
          <div className="mini-heading">
            <MessageSquare aria-hidden="true" />
            <strong>Agent Surface</strong>
          </div>
          <div className="segmented-control" aria-label="Agent surface mode">
            <button
              type="button"
              className={surfaceMode === "chat" ? "active" : ""}
              onClick={() => onSurfaceModeChange("chat")}
            >
              Chat
            </button>
            <button
              type="button"
              className={surfaceMode === "voice" ? "active" : ""}
              onClick={() => onSurfaceModeChange("voice")}
            >
              Voice
            </button>
          </div>
          <strong>{agentSurface?.headline ?? "Run a plan to generate response contracts."}</strong>
          <p>{agentSurface?.shortSummary ?? "MealPilot will shape different outputs for rich cards and spoken UX."}</p>
          <ul>
            {(agentSurface?.constraints ?? []).map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <Database aria-hidden="true" />
            <strong>MCP Coverage</strong>
          </div>
          <span>
            {catalog
              ? `${catalog.demoReady}/${catalog.totalTools} demo-ready, ${catalog.guarded} guarded`
              : "Loading coverage"}
          </span>
          <div className="coverage-stack">
            {catalog?.servers.map((server) => (
              <div key={server.server}>
                <strong>{serverLabel(server.server)}</strong>
                <span>
                  {server.demoReady}/{server.totalTools} ready
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="capability-registry-card">
          <div className="mini-heading">
            <Grid3X3 aria-hidden="true" />
            <strong>Capability Registry</strong>
          </div>
          <span>
            {capabilityRegistry
              ? `${capabilityRegistry.score}/100, ${capabilityRegistry.capabilityGroups.length} capability groups`
              : "Mapping tools, resources, prompts, and metadata"}
          </span>
          <ul className="compact-status-list">
            {(capabilityRegistry?.capabilityGroups ?? []).slice(0, 5).map((group) => (
              <li
                key={group.id}
                data-status={group.status === "external_gate" ? "watch" : "healthy"}
              >
                <span>{group.label}</span>
                <strong>{group.scope}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="resource-prompt-card">
          <div className="mini-heading">
            <MessageSquare aria-hidden="true" />
            <strong>Resource & Prompt Studio</strong>
          </div>
          <span>
            {resourcePromptStudio
              ? `${resourcePromptStudio.score}/100, ${resourcePromptStudio.readyResources}/${resourcePromptStudio.totalResources} resources`
              : "Exercising resources and prompts"}
          </span>
          <div className="resource-prompt-grid">
            <div>
              <strong>
                {resourcePromptStudio?.readyPrompts ?? 0}/{resourcePromptStudio?.totalPrompts ?? 0}
              </strong>
              <span>Prompts</span>
            </div>
            <div>
              <strong>{resourcePromptStudio?.serverSummaries.length ?? 0}</strong>
              <span>Servers</span>
            </div>
            <div>
              <strong>{resourcePromptStudio?.smokeRequests.length ?? 0}</strong>
              <span>Smoke calls</span>
            </div>
            <div>
              <strong>{resourcePromptStudio ? "POST" : "-"}</strong>
              <span>Execute gate</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(resourcePromptStudio?.serverSummaries ?? []).map((server) => (
              <li key={server.server} data-status={server.status === "ready" ? "healthy" : "watch"}>
                <span>{serverLabel(server.server)}</span>
                <strong>
                  {server.resources} res / {server.prompts} prompts
                </strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/mcp/resource-prompt-studio" target="_blank" rel="noreferrer">
              Studio API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Execute schema
            </a>
          </div>
        </article>

        <article className="contract-matrix-card">
          <div className="mini-heading">
            <FileWarning aria-hidden="true" />
            <strong>Tool Contracts</strong>
          </div>
          <span>
            {contractMatrix
              ? `${contractMatrix.score}/100, ${contractMatrix.totalTools} tools, ${contractMatrix.totalParameters} params`
              : "Compiling tool parameters and envelopes"}
          </span>
          <div className="contract-matrix-grid">
            <div>
              <strong>{contractMatrix?.contracts.filter((contract) => contract.behavior === "commercial").length ?? 0}</strong>
              <span>Commercial</span>
            </div>
            <div>
              <strong>{contractMatrix?.commonErrorEnvelope.plannedCoreCodes.length ?? 0}</strong>
              <span>Planned codes</span>
            </div>
            <div>
              <strong>{contractMatrix?.contracts.filter((contract) => contract.requiredParameterCount > 0).length ?? 0}</strong>
              <span>Param tools</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(contractMatrix?.servers ?? []).map((server) => (
              <li key={server.server} data-status={server.totalTools > 0 ? "healthy" : "watch"}>
                <span>{serverLabel(server.server)}</span>
                <strong>{server.totalTools} tools</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="tool-parity-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Tool Parity Auditor</strong>
          </div>
          <span>
            {toolParityAuditor
              ? `${toolParityAuditor.score}/100, ${toolParityAuditor.totals.matchedTools}/${toolParityAuditor.totals.liveReferenceTools} live refs`
              : "Reconciling live Swiggy references with local contracts"}
          </span>
          <div className="tool-parity-grid">
            <div>
              <strong>{toolParityAuditor?.totals.missingContracts ?? 0}</strong>
              <span>Missing</span>
            </div>
            <div>
              <strong>{toolParityAuditor?.totals.extraContracts ?? 0}</strong>
              <span>Orphans</span>
            </div>
            <div>
              <strong>{toolParityAuditor?.totals.commercialActions ?? 0}</strong>
              <span>Commerce</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(toolParityAuditor?.serverSummaries ?? []).map((server) => (
              <li
                key={server.server}
                data-status={server.status === "covered" ? "healthy" : server.status === "blocked" ? "blocked" : "watch"}
              >
                <span>{serverLabel(server.server)}</span>
                <strong>
                  {server.covered}/{server.expectedTools}
                </strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Tool parity links">
            <a href="/api/swiggy-tool-parity-auditor" target="_blank" rel="noreferrer">
              Parity API
            </a>
            <a href="/api/mcp/tool-contract-matrix" target="_blank" rel="noreferrer">
              Contracts
            </a>
            <a href="/api/swiggy-llms-manifest-verifier" target="_blank" rel="noreferrer">
              Manifest
            </a>
          </div>
        </article>

        <article className="scenario-runner-card">
          <div className="mini-heading">
            <Play aria-hidden="true" />
            <strong>Scenario Runner</strong>
          </div>
          <span>
            {scenarioRunner
              ? `${scenarioRunner.score}/100, ${scenarioRunner.totalScenarios} official recipes`
              : "Executing recipe traces"}
          </span>
          <div className="scenario-runner-grid">
            <div>
              <strong>{scenarioRunner?.totalSteps ?? 0}</strong>
              <span>Steps</span>
            </div>
            <div>
              <strong>
                {scenarioRunner ? `${scenarioRunner.uniqueToolsCovered}/${scenarioRunner.totalOfficialTools}` : "0/35"}
              </strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{scenarioRunner?.gatedSteps ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(scenarioRunner?.scenarios ?? []).map((scenario) => (
              <li key={scenario.id} data-status={scenario.gatedSteps > 0 ? "watch" : "healthy"}>
                <span>{scenario.title}</span>
                <strong>
                  {scenario.passedSteps}/{scenario.totalSteps}
                </strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="state-orchestrator-card">
          <div className="mini-heading">
            <RefreshCw aria-hidden="true" />
            <strong>State Orchestrator</strong>
          </div>
          <span>
            {stateOrchestrator
              ? `${stateOrchestrator.score}/100, ${stateOrchestrator.totalTurnBoundaries} turn guards`
              : "Mapping multi-turn state guards"}
          </span>
          <div className="state-orchestrator-grid">
            <div>
              <strong>{stateOrchestrator?.refreshBeforeMutationCount ?? 0}</strong>
              <span>Refreshes</span>
            </div>
            <div>
              <strong>{stateOrchestrator?.confirmationGateCount ?? 0}</strong>
              <span>Confirm gates</span>
            </div>
            <div>
              <strong>{stateOrchestrator?.surfaceContracts.length ?? 0}</strong>
              <span>Surfaces</span>
            </div>
            <div>
              <strong>{stateOrchestrator ? "POST" : "-"}</strong>
              <span>Rehearse</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(stateOrchestrator?.serverModels ?? []).map((model) => (
              <li key={model.server} data-status="healthy">
                <span>{serverLabel(model.server)}</span>
                <strong>{model.authoritativeReads.length} reads</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="widget-runtime-card">
          <div className="mini-heading">
            <ShoppingBasket aria-hidden="true" />
            <strong>Widget Runtime</strong>
          </div>
          <span>
            {widgetRuntime
              ? `${widgetRuntime.score}/100, ${widgetRuntime.readyActivationChecks}/${widgetRuntime.totalActivationChecks} checks, ${widgetRuntime.fallbackReady}/${widgetRuntime.totalSurfaces} fallbacks`
              : "Mapping iframe and fallback runtime"}
          </span>
          <div className="widget-runtime-grid">
            <div>
              <strong>{widgetRuntime?.eventsHandled ?? 0}</strong>
              <span>Events</span>
            </div>
            <div>
              <strong>{widgetRuntime?.externalActivationGates ?? 0}</strong>
              <span>Gates</span>
            </div>
            <div>
              <strong>{widgetRuntime?.renderContracts.length ?? 0}</strong>
              <span>Contracts</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(widgetRuntime?.surfaces ?? []).slice(0, 5).map((surface) => (
              <li key={surface.id} data-status={surface.status === "external_gate" ? "watch" : "healthy"}>
                <span>{surface.type.replaceAll("-", " ")}</span>
                <strong>{serverLabel(surface.server)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="widget-experience-card">
          <div className="mini-heading">
            <Grid3X3 aria-hidden="true" />
            <strong>Widget Experience</strong>
          </div>
          <span>
            {widgetExperience
              ? `${widgetExperience.score}/100, ${widgetExperience.totals.semanticFallbacks + widgetExperience.totals.ready}/${widgetExperience.totals.placements} placements, ${widgetExperience.galleryStates.length} gallery states`
              : "Composing premium widget placements"}
          </span>
          <div className="widget-experience-grid">
            <div>
              <strong>{widgetExperience?.totals.toolsCovered ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{widgetExperience?.totals.eventHandlers ?? 0}</strong>
              <span>Handlers</span>
            </div>
            <div>
              <strong>{widgetExperience?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(widgetExperience?.placements ?? []).slice(0, 5).map((placement) => (
              <li key={placement.id} data-status={placement.status === "external_gate" ? "watch" : "healthy"}>
                <span>{placement.label}</span>
                <strong>{placement.placement.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="hosted-widget-card">
          <div className="mini-heading">
            <Radio aria-hidden="true" />
            <strong>Hosted Widgets</strong>
          </div>
          <span>
            {hostedWidgetActivation
              ? `${hostedWidgetActivation.score}/100, ${hostedWidgetActivation.totals.readyHandshakes}/${hostedWidgetActivation.totals.handshakes} handshakes`
              : "Preparing hosted widget activation"}
          </span>
          <div className="hosted-widget-grid">
            <div>
              <strong>
                {hostedWidgetActivation?.totals.readyHostPolicies ?? 0}/{hostedWidgetActivation?.totals.hostPolicies ?? 0}
              </strong>
              <span>Policies</span>
            </div>
            <div>
              <strong>{hostedWidgetActivation?.totals.readyFallbackParity ?? 0}</strong>
              <span>Fallbacks</span>
            </div>
            <div>
              <strong>{hostedWidgetActivation?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(hostedWidgetActivation?.hostPolicies ?? []).slice(0, 5).map((policy) => (
              <li
                key={policy.id}
                data-status={policy.status === "ready" || policy.status === "semantic_fallback" ? "healthy" : "watch"}
              >
                <span>{policy.label}</span>
                <strong>{policy.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="agent-benchmark-card">
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Agent Benchmark</strong>
          </div>
          <span>
            {agentBenchmark
              ? `${agentBenchmark.score}/100, ${agentBenchmark.totals.journeys} journeys, ${agentBenchmark.totals.acceptanceCriteria} UX gates`
              : "Benchmarking premium Swiggy journeys"}
          </span>
          <div className="agent-benchmark-grid">
            <div>
              <strong>{agentBenchmark?.totals.bestInClassJourneys ?? 0}</strong>
              <span>Best</span>
            </div>
            <div>
              <strong>{agentBenchmark?.totals.toolsCovered ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{agentBenchmark?.totals.dimensions ?? 0}</strong>
              <span>Scores</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(agentBenchmark?.journeys ?? []).slice(0, 5).map((journey) => (
              <li key={journey.id} data-status={journey.status === "external_gate" ? "watch" : "healthy"}>
                <span>{journey.label}</span>
                <strong>{journey.benchmarkScore}/100</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="private-pilot-card">
          <div className="mini-heading">
            <Users aria-hidden="true" />
            <strong>Private Pilot</strong>
          </div>
          <span>
            {privatePilot
              ? `${privatePilot.score}/100, ${privatePilot.totals.cohorts} cohorts, ${privatePilot.totals.targetUsers} users`
              : "Preparing real-user pilot cohorts"}
          </span>
          <div className="private-pilot-grid">
            <div>
              <strong>{privatePilot?.totals.assignedJourneys ?? 0}</strong>
              <span>Journeys</span>
            </div>
            <div>
              <strong>{privatePilot?.totals.readyGates ?? 0}/{privatePilot?.totals.totalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
            <div>
              <strong>{privatePilot?.totals.telemetryMetrics ?? 0}</strong>
              <span>Metrics</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(privatePilot?.cohorts ?? []).map((cohort) => (
              <li key={cohort.id} data-status={cohort.status === "swiggy_gate" ? "watch" : "healthy"}>
                <span>{cohort.label}</span>
                <strong>{cohort.targetUsers} users</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="staging-replay-card">
          <div className="mini-heading">
            <RefreshCw aria-hidden="true" />
            <strong>Staging Replay</strong>
          </div>
          <span>
            {stagingReplay
              ? `${stagingReplay.score}/100, ${stagingReplay.totals.safeReplayTools}/${stagingReplay.totals.totalTools} safe probes`
              : "Preparing credentialed staging replay"}
          </span>
          <div className="staging-replay-grid">
            <div>
              <strong>{stagingReplay?.totals.dryRunTools ?? 0}</strong>
              <span>Dry-run</span>
            </div>
            <div>
              <strong>{stagingReplay?.totals.credentialedTools ?? 0}</strong>
              <span>Live-ready</span>
            </div>
            <div>
              <strong>{stagingReplay?.totals.commercialTools ?? 0}</strong>
              <span>Blocked</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(stagingReplay?.serverReadiness ?? []).map((server) => (
              <li
                key={server.server}
                data-status={server.status === "ready" || server.status === "dry_run" ? "healthy" : "watch"}
              >
                <span>{serverLabel(server.server)}</span>
                <strong>{server.firstSafeTool}</strong>
              </li>
            ))}
          </ul>
          <ul className="compact-status-list">
            {(stagingReplay?.waveReadiness ?? []).slice(0, 4).map((wave) => (
              <li
                key={wave.id}
                data-status={wave.status === "ready" || wave.status === "dry_run" ? "healthy" : "watch"}
              >
                <span>{wave.id.replaceAll("_", " ")}</span>
                <strong>
                  {wave.executableNow}/{wave.tools}
                </strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="commercial-guard-card">
          <div className="mini-heading">
            <LockKeyhole aria-hidden="true" />
            <strong>Commercial Guard</strong>
          </div>
          <span>
            {commercialActionGuard
              ? `${commercialActionGuard.score}/100, ${commercialActionGuard.readyLanes}/${commercialActionGuard.totalLanes} lanes`
              : "Locking commercial actions"}
          </span>
          <div className="commercial-guard-grid">
            <div>
              <strong>{commercialActionGuard?.readyGuardrails ?? 0}</strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{commercialActionGuard?.retryDrills.length ?? 0}</strong>
              <span>Drills</span>
            </div>
            <div>
              <strong>{commercialActionGuard?.telemetryContract.length ?? 0}</strong>
              <span>Fields</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(commercialActionGuard?.lanes ?? []).map((lane) => (
              <li key={lane.id} data-status={lane.status === "external_gate" ? "watch" : "healthy"}>
                <span>{lane.actionTool}</span>
                <strong>{lane.server === "combined" ? "Combined" : serverLabel(lane.server)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="staging-cutover-card">
          <div className="mini-heading">
            <Activity aria-hidden="true" />
            <strong>Staging Cutover</strong>
          </div>
          <span>
            {stagingCutover
              ? `${stagingCutover.score}/100, ${stagingCutover.routableServers}/${stagingCutover.totalServers} routes`
              : "Rehearsing live MCP cutover"}
          </span>
          <div className="staging-cutover-grid">
            <div>
              <strong>{stagingCutover?.dryRunCalls ?? 0}</strong>
              <span>Dry runs</span>
            </div>
            <div>
              <strong>{stagingCutover?.blockedServers ?? 0}</strong>
              <span>Blocked</span>
            </div>
            <div>
              <strong>{stagingCutover?.promotionChecks.filter((check) => check.status === "external_gate").length ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(stagingCutover?.probes ?? []).map((probe) => (
              <li
                key={probe.id}
                data-status={probe.status === "ready" ? "healthy" : probe.status === "blocked" ? "blocked" : "watch"}
              >
                <span>{serverLabel(probe.server)}</span>
                <strong>{probe.firstTool}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="staging-credential-drill-card">
          <div className="mini-heading">
            <LockKeyhole aria-hidden="true" />
            <strong>Staging Credential Drill</strong>
          </div>
          <span>
            {stagingCredentialDrill
              ? `${stagingCredentialDrill.score}/100, ${stagingCredentialDrill.totals.readyLanes}/${stagingCredentialDrill.totals.lanes} lanes ready`
              : "Composing first credentialed staging run"}
          </span>
          <div className="staging-credential-drill-grid">
            <div>
              <strong>{stagingCredentialDrill?.totals.firstCallDrills ?? 0}</strong>
              <span>First calls</span>
            </div>
            <div>
              <strong>{stagingCredentialDrill?.totals.seededDataRequirements ?? 0}</strong>
              <span>Seed needs</span>
            </div>
            <div>
              <strong>{stagingCredentialDrill?.totals.promotionGates ?? 0}</strong>
              <span>Promo gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(stagingCredentialDrill?.lanes ?? []).slice(0, 5).map((laneItem) => (
              <li
                key={laneItem.id}
                data-status={
                  laneItem.status === "ready"
                    ? "healthy"
                    : laneItem.status === "blocked"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{laneItem.label}</span>
                <strong>{laneItem.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-staging-credential-drill" target="_blank" rel="noreferrer">
              Drill API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/operate/access/" target="_blank" rel="noreferrer">
              Access docs
            </a>
          </div>
        </article>

        <article className="staging-seed-smoke-card">
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Seed & Smoke</strong>
          </div>
          <span>
            {stagingSeedSmoke
              ? `${stagingSeedSmoke.score}/100, ${stagingSeedSmoke.totals.servers} servers, ${stagingSeedSmoke.totals.smokeWaves} waves`
              : "Mapping seeded staging data and smoke waves"}
          </span>
          <div className="staging-seed-smoke-grid">
            <div>
              <strong>{stagingSeedSmoke?.totals.seededFixtures ?? 0}</strong>
              <span>Fixtures</span>
            </div>
            <div>
              <strong>{stagingSeedSmoke?.totals.credentialGates ?? 0}</strong>
              <span>Cred gates</span>
            </div>
            <div>
              <strong>{stagingSeedSmoke?.totals.stopRules ?? 0}</strong>
              <span>Stop rules</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(stagingSeedSmoke?.smokeWaves ?? []).slice(0, 5).map((wave) => (
              <li
                key={wave.id}
                data-status={wave.status === "ready" ? "healthy" : wave.status === "credential_gate" ? "blocked" : "watch"}
              >
                <span>{wave.label}</span>
                <strong>{wave.scope}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-staging-seed-smoke-center" target="_blank" rel="noreferrer">
              Seed smoke API
            </a>
            <a href="/api/staging-certification-matrix" target="_blank" rel="noreferrer">
              Certification
            </a>
          </div>
        </article>

        <article className="live-signal-calibration-card">
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Live Signal Calibration</strong>
          </div>
          <span>
            {liveSignalCalibration
              ? `${liveSignalCalibration.score}/100, ${liveSignalCalibration.totals.readyLanes}/${liveSignalCalibration.totals.lanes} lanes live-ready`
              : "Reconciling local signals with future staging reads"}
          </span>
          <div className="live-signal-calibration-grid">
            <div>
              <strong>{liveSignalCalibration?.totals.probes ?? 0}</strong>
              <span>Probes</span>
            </div>
            <div>
              <strong>{liveSignalCalibration?.totals.stagingWaves ?? 0}</strong>
              <span>Waves</span>
            </div>
            <div>
              <strong>{liveSignalCalibration?.totals.privacyControls ?? 0}</strong>
              <span>Privacy</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(liveSignalCalibration?.signalLanes ?? []).slice(0, 5).map((laneItem) => (
              <li
                key={laneItem.id}
                data-status={laneItem.status === "ready" ? "healthy" : laneItem.status === "privacy_gate" ? "watch" : "watch"}
              >
                <span>{laneItem.label}</span>
                <strong>{laneItem.server === "combined" ? "Combined" : serverLabel(laneItem.server)}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-live-signal-calibration" target="_blank" rel="noreferrer">
              Calibration API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/" target="_blank" rel="noreferrer">
              Data docs
            </a>
          </div>
        </article>

        <article className="tool-lab-card">
          <div className="mini-heading">
            <Bot aria-hidden="true" />
            <strong>Tool Lab</strong>
          </div>
          <span>
            {toolLab
              ? `${toolLab.score}/100, ${toolLab.callableTools}/${toolLab.totalTools} tools callable`
              : "Probing all Swiggy tools"}
          </span>
          <div className="tool-lab-stat-grid">
            <div>
              <strong>{toolLab?.guardedTools ?? 0}</strong>
              <span>Guarded</span>
            </div>
            <div>
              <strong>{toolLab?.commercialTools ?? 0}</strong>
              <span>Commercial</span>
            </div>
            <div>
              <strong>{toolLab?.innovationUseCases.length ?? 0}</strong>
              <span>New lanes</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(toolLab?.servers ?? []).map((server) => (
              <li key={server.server} data-status={server.callableTools === server.totalTools ? "healthy" : "watch"}>
                <span>{serverLabel(server.server)}</span>
                <strong>{server.callableTools}/{server.totalTools}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="journey-compiler-card">
          <div className="mini-heading">
            <GitBranch aria-hidden="true" />
            <strong>Journey Compiler</strong>
          </div>
          <span>
            {journeyCompiler
              ? `${journeyCompiler.score}/100, ${journeyCompiler.totalJourneys} recipe routes`
              : "Compiling Swiggy recipe routes"}
          </span>
          <div className="journey-compiler-grid">
            <div>
              <strong>{journeyCompiler?.totalToolsIndexed ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{journeyCompiler?.journeys.filter((journey) => journey.source === "official_recipe").length ?? 0}</strong>
              <span>Official</span>
            </div>
            <div>
              <strong>{journeyCompiler?.journeys.reduce((sum, journey) => sum + journey.savedCalls, 0) ?? 0}</strong>
              <span>Saved calls</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(journeyCompiler?.journeys ?? []).slice(0, 5).map((journey) => (
              <li key={journey.id} data-status={journey.riskLevel === "high" ? "watch" : "healthy"}>
                <span>{journey.title}</span>
                <strong>{journey.optimizedCalls}/{journey.baselineCalls}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="access-dossier-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Access Dossier</strong>
          </div>
          <span>
            {accessDossier
              ? `${accessDossier.score}/100, ${accessDossier.applicationFields.length} apply fields`
              : "Preparing Swiggy access packet"}
          </span>
          <div className="access-dossier-grid">
            <div>
              <strong>{accessReadyFields}</strong>
              <span>Ready</span>
            </div>
            <div>
              <strong>{accessManualFields}</strong>
              <span>Inputs</span>
            </div>
            <div>
              <strong>{accessDossier?.groundRules.length ?? 0}</strong>
              <span>Rules</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(accessDossier?.reviewChecks ?? []).slice(0, 5).map((check) => (
              <li key={check.id} data-status={check.status === "ready" ? "healthy" : "watch"}>
                <span>{check.label}</span>
                <strong>{check.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="access-evidence-card">
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Access Evidence Matrix</strong>
          </div>
          <span>
            {accessEvidenceMatrix
              ? `${accessEvidenceMatrix.score}/100, ${accessEvidenceMatrix.totals.rows} evidence rows`
              : "Reconciling Swiggy access evidence"}
          </span>
          <div className="access-evidence-grid">
            <div>
              <strong>
                {accessEvidenceMatrix
                  ? `${accessEvidenceMatrix.totals.readyRows}/${accessEvidenceMatrix.totals.rows}`
                  : "0/0"}
              </strong>
              <span>Ready rows</span>
            </div>
            <div>
              <strong>{accessEvidenceMatrix?.totals.operatorRows ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{accessEvidenceMatrix?.totals.externalGateRows ?? 0}</strong>
              <span>Swiggy gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(accessEvidenceMatrix?.sections ?? []).map((section) => (
              <li
                key={section.id}
                data-status={section.externalGateRows > 0 ? "watch" : section.operatorRows > 0 ? "watch" : "healthy"}
              >
                <span>{section.label}</span>
                <strong>{section.readyRows}/{section.totalRows}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-access-evidence-matrix" target="_blank" rel="noreferrer">
              Matrix API
            </a>
            <a href="https://mcp.swiggy.com/builders/access/" target="_blank" rel="noreferrer">
              Access page
            </a>
          </div>
        </article>

        <article className="use-case-studio-card">
          <div className="mini-heading">
            <Sparkles aria-hidden="true" />
            <strong>Use Case Studio</strong>
          </div>
          <span>
            {useCaseStudio
              ? `${useCaseStudio.score}/100, ${useCaseStudio.totalUseCases} premium playbooks`
              : "Mapping premium MealPilot use cases"}
          </span>
          <div className="use-case-studio-grid">
            <div>
              <strong>{useCaseStudio?.crossServerUseCases ?? 0}</strong>
              <span>Cross-server</span>
            </div>
            <div>
              <strong>{useCaseStudio?.totalToolsUsed ?? 0}/{useCaseStudio?.totalOfficialTools ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{useCaseStudio?.useCases.filter((item) => item.stage === "demo_ready").length ?? 0}</strong>
              <span>Demo-ready</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(useCaseStudio?.useCases ?? []).slice(0, 5).map((item) => (
              <li key={item.id} data-status={item.stage === "enterprise_extension" ? "watch" : "healthy"}>
                <span>{item.title}</span>
                <strong>{item.optimizedCalls}/{item.baselineCalls}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="staging-certification-card">
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Staging Certification</strong>
          </div>
          <span>
            {stagingCertification
              ? `${stagingCertification.score}/100, ${stagingCertification.assignedTools}/${stagingCertification.totalTools} tools assigned`
              : "Preparing credentialed staging matrix"}
          </span>
          <div className="staging-certification-grid">
            <div>
              <strong>{stagingCertification?.soakHoursRequired ?? 0}h</strong>
              <span>Soak</span>
            </div>
            <div>
              <strong>{certificationCredentialWaves}</strong>
              <span>Credential waves</span>
            </div>
            <div>
              <strong>{certificationGateWaves}</strong>
              <span>Prod gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(stagingCertification?.waves ?? []).slice(0, 5).map((waveItem) => (
              <li
                key={waveItem.id}
                data-status={waveItem.status === "mock_ready" ? "healthy" : "watch"}
              >
                <span>{waveItem.title}</span>
                <strong>{waveItem.tools.length} tools</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="builders-map-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Builders Map</strong>
          </div>
          <span>
            {buildersMap
              ? `${buildersMap.pages.length} pages/modules, ${buildersMap.ctas.length} CTAs, ${buildersMap.totalOfficialTools} tools`
              : "Loading official Swiggy map"}
          </span>
          <div className="map-stat-grid">
            <div>
              <strong>{buildersMap?.pages.filter((page) => page.implementationStatus === "implemented").length ?? 0}</strong>
              <span>Implemented</span>
            </div>
            <div>
              <strong>{buildersMap?.pages.filter((page) => page.implementationStatus === "documented").length ?? 0}</strong>
              <span>Documented</span>
            </div>
            <div>
              <strong>{buildersMap?.credentialGates.length ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="builders-map-list">
            {(buildersMap?.pages ?? []).slice(0, 5).map((page) => (
              <li key={page.id} data-status={page.implementationStatus}>
                <span>{page.title}</span>
                <strong>{page.implementationStatus.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="website-atlas-card">
          <div className="mini-heading">
            <MapPin aria-hidden="true" />
            <strong>Website Atlas</strong>
          </div>
          <span>
            {websiteAtlas
              ? `${websiteAtlas.score}/100, ${websiteAtlas.pagesCovered} pages, ${websiteAtlas.modulesCovered} modules`
              : "Loading website, header, footer, and CTA coverage"}
          </span>
          <div className="website-atlas-grid">
            <div>
              <strong>{websiteAtlas?.globalHeader.length ?? 0}</strong>
              <span>Header</span>
            </div>
            <div>
              <strong>{websiteAtlas?.footerGroups.reduce((sum, group) => sum + group.links.length, 0) ?? 0}</strong>
              <span>Footer</span>
            </div>
            <div>
              <strong>{websiteAtlas?.ctasCovered ?? 0}</strong>
              <span>CTAs</span>
            </div>
            <div>
              <strong>{websiteAtlas?.liveCrawlPages ?? 0}</strong>
              <span>Crawled</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(websiteAtlas?.crawlEvidence ?? []).slice(0, 6).map((page) => (
              <li key={page.id} data-status={page.status === "covered" ? "healthy" : "watch"}>
                <span>{page.pageId.replaceAll("_", " ")}</span>
                <strong>{page.moduleSignals.length} modules</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="module-intelligence-card">
          <div className="mini-heading">
            <Grid3X3 aria-hidden="true" />
            <strong>Module Intelligence</strong>
          </div>
          <span>
            {moduleIntelligence
              ? `${moduleIntelligence.score}/100, ${moduleIntelligence.totals.ready}/${moduleIntelligence.totals.modules} modules ready`
              : "Turning every Builders module into product, risk, and proof intelligence"}
          </span>
          <div className="module-intelligence-grid">
            <div>
              <strong>{moduleIntelligence?.totals.pages ?? 0}</strong>
              <span>Pages</span>
            </div>
            <div>
              <strong>{moduleIntelligence?.totals.operatorGates ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{moduleIntelligence?.totals.swiggyGates ?? 0}</strong>
              <span>Swiggy</span>
            </div>
            <div>
              <strong>{moduleIntelligence?.totals.journeys ?? 0}</strong>
              <span>Journeys</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(moduleIntelligence?.pageGroups ?? []).slice(0, 5).map((group) => (
              <li key={group.pageId} data-status={group.swiggyGates > 0 ? "blocked" : group.operatorGates > 0 ? "watch" : "healthy"}>
                <span>{group.title}</span>
                <strong>
                  {group.ready}/{group.modules}
                </strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Module intelligence links">
            <a href="/api/swiggy-builders-module-intelligence" target="_blank" rel="noreferrer">
              Module API
            </a>
            <a href="/api/swiggy-deep-site-map" target="_blank" rel="noreferrer">
              Deep Map
            </a>
            <a href="https://mcp.swiggy.com/builders/" target="_blank" rel="noreferrer">
              Builders
            </a>
          </div>
        </article>

        <article className="journey-gates-card">
          <div className="mini-heading">
            <Route aria-hidden="true" />
            <strong>Journey Gates</strong>
          </div>
          <span>
            {journeyGates
              ? `${journeyGates.score}/100, ${journeyGates.totals.ready}/${journeyGates.totals.gates} gates ready`
              : "Official Builders journey mapped to owner, proof, telemetry, and external gates"}
          </span>
          <div className="journey-gates-grid">
            <div>
              <strong>{journeyGates?.totals.operatorGates ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{journeyGates?.totals.swiggyGates ?? 0}</strong>
              <span>Swiggy</span>
            </div>
            <div>
              <strong>{journeyGates?.totals.proofLinks ?? 0}</strong>
              <span>Proofs</span>
            </div>
            <div>
              <strong>{journeyGates?.totals.telemetryLinks ?? 0}</strong>
              <span>Signals</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(journeyGates?.gates ?? []).slice(0, 5).map((gate) => (
              <li
                key={gate.id}
                data-status={gate.status === "ready" ? "healthy" : gate.status === "swiggy_gate" ? "blocked" : "watch"}
              >
                <span>{gate.officialStep}</span>
                <strong>{gate.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Journey gate links">
            <a href="/api/swiggy-builders-journey-gates" target="_blank" rel="noreferrer">
              Gate API
            </a>
            <a href="/api/swiggy-builders-module-intelligence" target="_blank" rel="noreferrer">
              Modules
            </a>
            <a href="/api/swiggy-conversion-center" target="_blank" rel="noreferrer">
              Conversion
            </a>
          </div>
        </article>

        <article className="homepage-experience-card">
          <div className="mini-heading">
            <BookOpen aria-hidden="true" />
            <strong>Homepage Experience</strong>
          </div>
          <span>
            {homepageExperience
              ? `${homepageExperience.score}/100, ${homepageExperience.totals.ready}/${homepageExperience.totals.sections} sections ready`
              : "Header, hero, benefits, FAQ, CTA, and footer mapped to proof"}
          </span>
          <div className="homepage-experience-grid">
            <div>
              <strong>{homepageExperience?.totals.headerLinks ?? 0}</strong>
              <span>Header</span>
            </div>
            <div>
              <strong>{homepageExperience?.totals.footerLinks ?? 0}</strong>
              <span>Footer</span>
            </div>
            <div>
              <strong>{homepageExperience?.totals.ctas ?? 0}</strong>
              <span>CTAs</span>
            </div>
            <div>
              <strong>{homepageExperience?.totals.proofLinks ?? 0}</strong>
              <span>Proofs</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(homepageExperience?.sections ?? []).slice(0, 5).map((sectionItem) => (
              <li
                key={sectionItem.id}
                data-status={
                  sectionItem.status === "ready"
                    ? "healthy"
                    : sectionItem.status === "swiggy_gate"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{sectionItem.label}</span>
                <strong>{sectionItem.ctaIds.length}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Homepage experience links">
            <a href="/api/swiggy-builders-homepage-experience" target="_blank" rel="noreferrer">
              Section API
            </a>
            <a href="/api/swiggy-builders-site-parity" target="_blank" rel="noreferrer">
              Live parity
            </a>
            <a href="/api/swiggy-cta-execution-center" target="_blank" rel="noreferrer">
              CTAs
            </a>
          </div>
        </article>

        <article className="source-evolution-card">
          <div className="mini-heading">
            <ScrollText aria-hidden="true" />
            <strong>Source Evolution</strong>
          </div>
          <span>
            {sourceEvolution
              ? `${sourceEvolution.score}/100, ${sourceEvolution.toolCountBridge.coverageLabel} current tools`
              : "Reconciling Builders source drift, roadmap gates, and packet regressions"}
          </span>
          <div className="source-evolution-grid">
            <div>
              <strong>{sourceEvolution?.toolCountBridge.homepageLaunchCopy ?? "18+"}</strong>
              <span>Launch copy</span>
            </div>
            <div>
              <strong>{sourceEvolution?.toolCountBridge.coverageLabel ?? "0/0"}</strong>
              <span>Current</span>
            </div>
            <div>
              <strong>{sourceEvolution?.totals.roadmapItems ?? 0}</strong>
              <span>Roadmap</span>
            </div>
            <div>
              <strong>{sourceEvolution?.totals.proofLinks ?? 0}</strong>
              <span>Proofs</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(sourceEvolution?.lanes ?? []).slice(0, 5).map((laneItem) => (
              <li
                key={laneItem.id}
                data-status={
                  laneItem.status === "current"
                    ? "healthy"
                    : laneItem.status === "swiggy_gate"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{laneItem.label}</span>
                <strong>{laneItem.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Source evolution links">
            <a href="/api/swiggy-builders-source-evolution" target="_blank" rel="noreferrer">
              Evolution API
            </a>
            <a href="/api/swiggy-source-intelligence" target="_blank" rel="noreferrer">
              Source
            </a>
            <a href="/api/swiggy-upstream-watch" target="_blank" rel="noreferrer">
              Upstream
            </a>
          </div>
        </article>

        <article className="live-source-resilience-card">
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Live Source Resilience</strong>
          </div>
          <span>
            {liveSourceResilience
              ? `${liveSourceResilience.score}/100, ${liveSourceResilience.currentFetch.homepageMode.replace("_", " ")} mode`
              : "Checking live Builders fetch, atlas fallback, page mesh, and llms recovery"}
          </span>
          <div className="live-source-resilience-grid">
            <div>
              <strong>{liveSourceResilience?.currentFetch.homepageStatusCode ?? "n/a"}</strong>
              <span>Status</span>
            </div>
            <div>
              <strong>{liveSourceResilience?.currentFetch.matchedExpectedItems ?? 0}</strong>
              <span>Links</span>
            </div>
            <div>
              <strong>
                {liveSourceResilience
                  ? `${liveSourceResilience.currentFetch.pageMeshIntegrityVerifiedPages}/${liveSourceResilience.currentFetch.pageMeshPages}`
                  : "0/0"}
              </strong>
              <span>Verified</span>
            </div>
            <div>
              <strong>{liveSourceResilience?.currentFetch.markdownTwins ?? 0}</strong>
              <span>Twins</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(liveSourceResilience?.lanes ?? []).slice(0, 5).map((laneItem) => (
              <li
                key={laneItem.id}
                data-status={
                  laneItem.status === "verified"
                    ? "healthy"
                    : laneItem.status === "swiggy_gate"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{laneItem.label}</span>
                <strong>{laneItem.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Live source resilience links">
            <a href="/api/swiggy-builders-live-source-resilience" target="_blank" rel="noreferrer">
              Resilience API
            </a>
            <a href="/api/swiggy-builders-site-parity" target="_blank" rel="noreferrer">
              Site parity
            </a>
            <a href="/api/swiggy-docs-twin-explorer" target="_blank" rel="noreferrer">
              Docs twins
            </a>
          </div>
        </article>

        <article className="builders-site-parity-card">
          <div className="mini-heading">
            <MousePointerClick aria-hidden="true" />
            <strong>Builders Site Parity</strong>
          </div>
          <span>
            {buildersSiteParity
              ? `${buildersSiteParity.score}/100, ${buildersSiteParity.totals.matchedExpectedItems}/${buildersSiteParity.totals.expectedItems} expected links`
              : "Checking live Builders homepage anchors and modules"}
          </span>
          <div className="builders-site-parity-grid">
            <div>
              <strong>{buildersSiteParity?.totals.liveAnchors ?? 0}</strong>
              <span>Anchors</span>
            </div>
            <div>
              <strong>{buildersSiteParity?.totals.unsafeLinks ?? 0}</strong>
              <span>Unsafe</span>
            </div>
            <div>
              <strong>
                {buildersSiteParity
                  ? `${buildersSiteParity.totals.matchedModuleSignals}/${buildersSiteParity.totals.moduleSignals}`
                  : "0/0"}
              </strong>
              <span>Modules</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(buildersSiteParity?.moduleSignals ?? []).map((module) => (
              <li key={module.id} data-status={module.status === "covered" ? "healthy" : "watch"}>
                <span>{module.label}</span>
                <strong>{module.status}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Builders site parity links">
            <a href="/api/swiggy-builders-site-parity" target="_blank" rel="noreferrer">
              Parity API
            </a>
            <a href="https://mcp.swiggy.com/builders/" target="_blank" rel="noreferrer">
              Builders
            </a>
            <a href="/api/swiggy-website-atlas" target="_blank" rel="noreferrer">
              Atlas
            </a>
          </div>
        </article>

        <article className="builders-page-mesh-card">
          <div className="mini-heading">
            <GitBranch aria-hidden="true" />
            <strong>Builders Page Mesh</strong>
          </div>
          <span>
            {buildersPageMesh
              ? `${buildersPageMesh.score}/100, ${buildersPageMesh.totals.integrityVerifiedPages}/${buildersPageMesh.totals.pages} verified pages`
              : "Fetching every public Builders page from Website Atlas"}
          </span>
          <div className="builders-page-mesh-grid">
            <div>
              <strong>{buildersPageMesh?.totals.liveAnchors ?? 0}</strong>
              <span>Anchors</span>
            </div>
            <div>
              <strong>{buildersPageMesh?.totals.unsafeLinks ?? 0}</strong>
              <span>Unsafe</span>
            </div>
            <div>
              <strong>{buildersPageMesh?.totals.atlasFallbackPages ?? 0}</strong>
              <span>Fallbacks</span>
            </div>
            <div>
              <strong>
                {buildersPageMesh
                  ? `${buildersPageMesh.totals.matchedModuleSignals}/${buildersPageMesh.totals.expectedModules}`
                  : "0/0"}
              </strong>
              <span>Modules</span>
            </div>
            <div>
              <strong>
                {buildersPageMesh ? `${buildersPageMesh.totals.matchedCtas}/${buildersPageMesh.totals.expectedCtas}` : "0/0"}
              </strong>
              <span>CTAs</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(buildersPageMesh?.pages ?? []).map((page) => (
              <li
                key={page.id}
                data-status={page.status === "covered" ? "healthy" : page.status === "blocked" ? "blocked" : "watch"}
              >
                <span>{page.title}</span>
                <strong>
                  {page.contentIntegrity === "verified" ? "live" : page.contentIntegrity === "atlas_fallback" ? "atlas" : "blocked"}
                </strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Builders page mesh links">
            <a href="/api/swiggy-builders-page-mesh" target="_blank" rel="noreferrer">
              Mesh API
            </a>
            <a href="/api/swiggy-deep-site-map" target="_blank" rel="noreferrer">
              Site map
            </a>
            <a href="/api/swiggy-cta-execution-center" target="_blank" rel="noreferrer">
              CTAs
            </a>
          </div>
        </article>

        <article className="builders-launch-story-card">
          <div className="mini-heading">
            <Rocket aria-hidden="true" />
            <strong>Launch Story</strong>
          </div>
          <span>
            {buildersLaunchStory
              ? `${buildersLaunchStory.score}/100, ${buildersLaunchStory.launchSignal.currentDocsToolSnapshot}`
              : "Loading Builders Club launch story"}
          </span>
          <div className="builders-launch-story-grid">
            <div>
              <strong>{buildersLaunchStory?.totals.storyBeats ?? 0}</strong>
              <span>Beats</span>
            </div>
            <div>
              <strong>{buildersLaunchStory?.totals.showcaseAssets ?? 0}</strong>
              <span>Assets</span>
            </div>
            <div>
              <strong>{buildersLaunchStory?.totals.ctaPaths ?? 0}</strong>
              <span>CTAs</span>
            </div>
            <div>
              <strong>{buildersLaunchStory?.totals.ecosystemLanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(buildersLaunchStory?.storyBeats ?? []).slice(0, 4).map((beat) => (
              <li key={beat.id} data-status={beat.status === "ready" ? "healthy" : "watch"}>
                <span>{beat.label}</span>
                <strong>{beat.evidenceLinks.length} proofs</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="operating-contract-card">
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Operating Contract</strong>
          </div>
          <span>
            {operatingContract
              ? `${operatingContract.score}/100, ${operatingContract.contractSignal.targetUptime} uptime, ${operatingContract.contractSignal.operatingVersion}`
              : "Loading Swiggy operate-docs contract"}
          </span>
          <div className="operating-contract-grid">
            <div>
              <strong>{operatingContract?.totals.pillars ?? 0}</strong>
              <span>Pillars</span>
            </div>
            <div>
              <strong>{operatingContract?.totals.runbooks ?? 0}</strong>
              <span>Runbooks</span>
            </div>
            <div>
              <strong>{operatingContract?.totals.readinessGates ?? 0}</strong>
              <span>Gates</span>
            </div>
            <div>
              <strong>{operatingContract?.totals.externalGates ?? 0}</strong>
              <span>External</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(operatingContract?.pillars ?? []).slice(0, 4).map((pillar) => (
              <li key={pillar.id} data-status={pillar.status === "ready" ? "healthy" : "watch"}>
                <span>{pillar.label}</span>
                <strong>{pillar.evidenceLinks.length} proofs</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="deep-site-map-card">
          <div className="mini-heading">
            <BookOpen aria-hidden="true" />
            <strong>Deep Site Map</strong>
          </div>
          <span>
            {deepSiteMap
              ? `${deepSiteMap.score}/100, ${deepSiteMap.totals.pages} pages, ${deepSiteMap.totals.proofLinks} proofs`
              : "Auditing every Builders page, module, CTA, header, and footer"}
          </span>
          <div className="deep-site-map-grid">
            <div>
              <strong>{deepSiteMap?.totals.modules ?? 0}</strong>
              <span>Modules</span>
            </div>
            <div>
              <strong>{deepSiteMap?.totals.ctas ?? 0}</strong>
              <span>CTAs</span>
            </div>
            <div>
              <strong>{deepSiteMap?.totals.headerLinks ?? 0}</strong>
              <span>Header</span>
            </div>
            <div>
              <strong>{deepSiteMap?.totals.footerLinks ?? 0}</strong>
              <span>Footer</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(deepSiteMap?.pages ?? []).slice(0, 6).map((page) => (
              <li
                key={page.id}
                data-status={
                  page.coverageStatus === "implemented"
                    ? "healthy"
                    : page.coverageStatus === "documented"
                      ? "healthy"
                    : page.coverageStatus === "external_gate"
                      ? "watch"
                      : page.coverageStatus
                }
              >
                <span>{page.title}</span>
                <strong>{page.moduleCount} modules</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="builder-intake-card">
          <div className="mini-heading">
            <Rocket aria-hidden="true" />
            <strong>Builder Intake</strong>
          </div>
          <span>
            {builderIntake
              ? `${builderIntake.score}/100, ${builderIntake.preparedCtas}/${builderIntake.totalCtas} CTA paths prepared`
              : "Preparing signup and demo actions"}
          </span>
          <div className="builder-intake-grid">
            <div>
              <strong>
                {builderIntake?.readyCtas ?? 0}/{builderIntake?.totalCtas ?? 0}
              </strong>
              <span>CTAs ready</span>
            </div>
            <div>
              <strong>{builderIntake?.readyFields ?? 0}</strong>
              <span>Fields ready</span>
            </div>
            <div>
              <strong>{builderIntake?.operatorCtaGates ?? 0}</strong>
              <span>Submit gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(builderIntake?.checklist ?? []).slice(0, 5).map((item) => (
              <li key={item.id} data-status={item.status === "ready" ? "healthy" : "watch"}>
                <span>{item.label}</span>
                <strong>{item.owner}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="faq-policy-card">
          <div className="mini-heading">
            <BookOpen aria-hidden="true" />
            <strong>FAQ & Policy</strong>
          </div>
          <span>
            {faqPolicy
              ? `${faqPolicy.score}/100, ${faqPolicy.readyQuestions}/${faqPolicy.totalQuestions} FAQ themes`
              : "Mapping FAQ and policy coverage"}
          </span>
          <div className="faq-policy-grid">
            <div>
              <strong>{faqPolicy?.readyRules ?? 0}/{faqPolicy?.totalRules ?? 0}</strong>
              <span>Rules</span>
            </div>
            <div>
              <strong>{faqPolicy?.headerFooterCoverage.headerLinks.length ?? 0}</strong>
              <span>Header</span>
            </div>
            <div>
              <strong>{faqPolicy?.headerFooterCoverage.footerResources.length ?? 0}</strong>
              <span>Footer</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(faqPolicy?.faqItems ?? []).slice(0, 5).map((item) => (
              <li key={item.id} data-status={item.status === "ready" ? "healthy" : "watch"}>
                <span>{item.question}</span>
                <strong>{item.audience}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="faq-resolution-card">
          <div className="mini-heading">
            <BookOpen aria-hidden="true" />
            <strong>FAQ Resolution</strong>
          </div>
          <span>
            {faqResolution
              ? `${faqResolution.score}/100, ${faqResolution.totals.ready}/${faqResolution.totals.questions} answers ready`
              : "Resolving FAQ answers, proof, CTAs, and gates"}
          </span>
          <div className="faq-resolution-grid">
            <div>
              <strong>{faqResolution?.totals.operatorInputs ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{faqResolution?.totals.swiggyGates ?? 0}</strong>
              <span>Swiggy gates</span>
            </div>
            <div>
              <strong>{faqResolution?.totals.activationCtas ?? 0}</strong>
              <span>CTAs</span>
            </div>
          </div>
          <form className="faq-answer-console" onSubmit={runFaqAnswerConsole}>
            <label htmlFor="faq-answer-question">Reviewer question</label>
            <div>
              <input
                id="faq-answer-question"
                type="text"
                value={faqAnswerQuestion}
                onChange={(event) => setFaqAnswerQuestion(event.target.value)}
              />
              <button type="submit" disabled={faqAnswerStatus === "loading"} aria-label="Resolve FAQ answer">
                {faqAnswerStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Search aria-hidden="true" />}
              </button>
            </div>
            {faqAnswerStatus === "error" ? <small role="status">Answer console unavailable.</small> : null}
          </form>
          <div
            className="faq-answer-strip"
            data-status={
              visibleFaqAnswer?.decision === "answered"
                ? "healthy"
                : visibleFaqAnswer?.decision === "blocked_empty"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Reviewer answer</span>
              <strong>
                {visibleFaqAnswer
                  ? `${visibleFaqAnswer.decision.replace(/_/g, " ")} / ${visibleFaqAnswer.confidence} / ${visibleFaqAnswer.matchScore}/100`
                  : "Resolving sample question"}
              </strong>
            </div>
            <p>{visibleFaqAnswer?.answer ?? FAQ_ANSWER_SAMPLE_QUESTION}</p>
            <small>
              {visibleFaqAnswer
                ? `${visibleFaqAnswer.proofLinks.length} proof links / ${visibleFaqAnswer.activationCtas.length} CTAs / ${visibleFaqAnswer.owner}`
                : "Waiting for answer console"}
            </small>
          </div>
          <ul className="compact-status-list">
            {(faqResolution?.questions ?? []).slice(0, 5).map((questionItem) => (
              <li
                key={questionItem.id}
                data-status={
                  questionItem.status === "ready" ? "healthy" : questionItem.status === "swiggy_gate" ? "blocked" : "watch"
                }
              >
                <span>{questionItem.question}</span>
                <strong>{questionItem.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="FAQ resolution links">
            <a href="/api/swiggy-faq-resolution-center" target="_blank" rel="noreferrer">
              Resolution API
            </a>
            <a href="/api/swiggy-faq-policy" target="_blank" rel="noreferrer">
              FAQ policy
            </a>
            <a href="https://mcp.swiggy.com/builders/#faq" target="_blank" rel="noreferrer">
              Official FAQ
            </a>
          </div>
        </article>

        <article className="growth-partnership-card">
          <div className="mini-heading">
            <Rocket aria-hidden="true" />
            <strong>Growth Partnership</strong>
          </div>
          <span>
            {growthPartnership
              ? `${growthPartnership.score}/100, ${growthPartnership.readyExperiments}/${growthPartnership.totalExperiments} experiments`
              : "Preparing co-marketing proof"}
          </span>
          <div className="growth-partnership-grid">
            <div>
              <strong>{growthPartnership?.readySignals ?? 0}/{growthPartnership?.totalSignals ?? 0}</strong>
              <span>Signals</span>
            </div>
            <div>
              <strong>{growthPartnership?.assets.length ?? 0}</strong>
              <span>Assets</span>
            </div>
            <div>
              <strong>{growthPartnership?.partnershipAsks.length ?? 0}</strong>
              <span>Asks</span>
            </div>
          </div>
          <form className="growth-ask-composer" onSubmit={runGrowthAskComposer}>
            <label htmlFor="growth-experiment-select">Experiment</label>
            <select
              id="growth-experiment-select"
              value={growthAskForm.experimentId}
              onChange={(event) => setGrowthAskForm((current) => ({ ...current, experimentId: event.target.value }))}
            >
              {(growthPartnership?.experiments ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <label htmlFor="growth-ask-select">Partner ask</label>
            <div>
              <select
                id="growth-ask-select"
                value={growthAskForm.askId}
                onChange={(event) => setGrowthAskForm((current) => ({ ...current, askId: event.target.value }))}
              >
                {(growthPartnership?.partnershipAsks ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={growthAskStatus === "loading"} aria-label="Compose growth ask">
                {growthAskStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Rocket aria-hidden="true" />}
              </button>
            </div>
            <input
              aria-label="Growth audience note"
              type="text"
              value={growthAskForm.audienceNote}
              onChange={(event) => setGrowthAskForm((current) => ({ ...current, audienceNote: event.target.value }))}
            />
            {growthAskStatus === "error" ? <small role="status">Growth ask composer unavailable.</small> : null}
          </form>
          <div
            className="growth-ask-result"
            data-status={
              growthAskPacket?.decision === "ready_local_handoff"
                ? "healthy"
                : growthAskPacket?.decision === "swiggy_gate" || growthAskPacket?.decision === "unknown_growth_item"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Growth ask</span>
              <strong>
                {growthAskPacket
                  ? `${growthAskPacket.decision.replace(/_/g, " ")} / ${growthAskPacket.readinessScore}/100`
                  : "Awaiting composition"}
              </strong>
            </div>
            <p>
              {growthAskPacket
                ? `${growthAskPacket.proofLinks.length} proof links / ${growthAskPacket.assets.length} assets / ${growthAskPacket.handoffDraft.to}`
                : "Choose a growth experiment and partner ask to generate the local Swiggy handoff packet."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(growthPartnership?.experiments ?? []).slice(0, 5).map((item) => (
              <li key={item.id} data-status={item.status === "ready" ? "healthy" : "watch"}>
                <span>{item.label}</span>
                <strong>{item.launchStage.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="talent-signal-card">
          <div className="mini-heading">
            <Users aria-hidden="true" />
            <strong>Talent Signal</strong>
          </div>
          <span>
            {talentSignal
              ? `${talentSignal.score}/100, ${talentSignal.totals.readySignals}/${talentSignal.totals.signals} signals ready`
              : "Preparing portfolio, GitHub, demo, and hiring-readiness proof"}
          </span>
          <div className="talent-signal-grid">
            <div>
              <strong>{talentSignal?.totals.readyAssets ?? 0}/{talentSignal?.totals.portfolioAssets ?? 0}</strong>
              <span>Assets</span>
            </div>
            <div>
              <strong>{talentSignal?.totals.talentPaths ?? 0}</strong>
              <span>Paths</span>
            </div>
            <div>
              <strong>{talentSignal?.totals.swiggyGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <form className="talent-outreach-composer" onSubmit={runTalentOutreachComposer}>
            <label htmlFor="talent-path-select">Talent path</label>
            <select
              id="talent-path-select"
              value={talentOutreachForm.pathId}
              onChange={(event) => setTalentOutreachForm((current) => ({ ...current, pathId: event.target.value }))}
            >
              {(talentSignal?.talentPaths ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <label htmlFor="talent-demo-url">Demo URL</label>
            <input
              id="talent-demo-url"
              type="url"
              value={talentOutreachForm.demoUrl}
              onChange={(event) => setTalentOutreachForm((current) => ({ ...current, demoUrl: event.target.value }))}
            />
            <label htmlFor="talent-github-url">Repository</label>
            <input
              id="talent-github-url"
              type="url"
              value={talentOutreachForm.githubUrl}
              onChange={(event) => setTalentOutreachForm((current) => ({ ...current, githubUrl: event.target.value }))}
            />
            <div>
              <input
                aria-label="Talent technical summary"
                type="text"
                value={talentOutreachForm.technicalSummary}
                onChange={(event) =>
                  setTalentOutreachForm((current) => ({ ...current, technicalSummary: event.target.value }))
                }
              />
              <button type="submit" disabled={talentOutreachStatus === "loading"} aria-label="Compose talent outreach">
                {talentOutreachStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Users aria-hidden="true" />}
              </button>
            </div>
            {talentOutreachStatus === "error" ? <small role="status">Talent composer unavailable.</small> : null}
          </form>
          <div
            className="talent-outreach-result"
            data-status={
              talentOutreach?.decision === "ready_local_handoff"
                ? "healthy"
                : talentOutreach?.decision === "swiggy_gate" || talentOutreach?.decision === "unknown_talent_path"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Talent outreach</span>
              <strong>
                {talentOutreach
                  ? `${talentOutreach.decision.replace(/_/g, " ")} / ${talentOutreach.readinessScore}/100`
                  : "Awaiting composition"}
              </strong>
            </div>
            <p>
              {talentOutreach
                ? `${talentOutreach.proofLinks.length} proof links / ${talentOutreach.portfolioAssets.length} assets / ${talentOutreach.missingInputs.length} missing`
                : "Choose a portfolio path and attach demo, repo, and technical summary for a local Swiggy outreach packet."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(talentSignal?.talentPaths ?? []).slice(0, 4).map((talentPath) => (
              <li
                key={talentPath.id}
                data-status={talentPath.status === "ready" ? "healthy" : talentPath.status === "swiggy_gate" ? "blocked" : "watch"}
              >
                <span>{talentPath.label}</span>
                <strong>{talentPath.roleSignal}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Talent signal links">
            <a href="/api/swiggy-talent-signal-center" target="_blank" rel="noreferrer">
              Talent API
            </a>
            <a href="/api/swiggy-showcase-submission-center" target="_blank" rel="noreferrer">
              Showcase
            </a>
            <a href="https://github.com/Farhankhan0128/MealPilot" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </article>

        <article className="conversion-center-card">
          <div className="mini-heading">
            <MousePointerClick aria-hidden="true" />
            <strong>Conversion Center</strong>
          </div>
          <span>
            {conversionCenter
              ? `${conversionCenter.score}/100, ${conversionCenter.totals.ready}/${conversionCenter.totals.steps} CTA steps ready`
              : "Mapping final Builders CTAs into an operator handoff funnel"}
          </span>
          <div className="conversion-center-grid">
            <div>
              <strong>{conversionCenter?.totals.operatorInputs ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{conversionCenter?.totals.proofBundles ?? 0}</strong>
              <span>Bundles</span>
            </div>
            <div>
              <strong>{conversionCenter?.totals.swiggyGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(conversionCenter?.conversionSteps ?? []).slice(0, 5).map((conversionStep) => (
              <li
                key={conversionStep.id}
                data-status={
                  conversionStep.status === "ready" ? "healthy" : conversionStep.status === "swiggy_gate" ? "blocked" : "watch"
                }
              >
                <span>{conversionStep.label}</span>
                <strong>{conversionStep.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Conversion center links">
            <a href="/api/swiggy-conversion-center" target="_blank" rel="noreferrer">
              Conversion API
            </a>
            <a href="/api/access-submission-studio" target="_blank" rel="noreferrer">
              Access
            </a>
            <a href="https://mcp.swiggy.com/builders/llms-full.txt" target="_blank" rel="noreferrer">
              llms-full
            </a>
          </div>
        </article>

        <article className="benefits-activation-card">
          <div className="mini-heading">
            <Sparkles aria-hidden="true" />
            <strong>Benefits Activation</strong>
          </div>
          <span>
            {benefitsActivation
              ? `${benefitsActivation.score}/100, ${benefitsActivation.totals.ready}/${benefitsActivation.totals.benefits} benefits ready`
              : "Activating live APIs, quotas, support, co-branding, and growth"}
          </span>
          <div className="benefits-activation-grid">
            <div>
              <strong>{benefitsActivation?.totals.operatorInputs ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{benefitsActivation?.totals.swiggyGates ?? 0}</strong>
              <span>Swiggy gates</span>
            </div>
            <div>
              <strong>{benefitsActivation?.totals.activationCtas ?? 0}</strong>
              <span>CTAs</span>
            </div>
          </div>
          <form className="benefit-activation-console" onSubmit={runBenefitActivation}>
            <label htmlFor="benefit-activation-select">Activate benefit</label>
            <div>
              <select
                id="benefit-activation-select"
                value={benefitActivationId}
                onChange={(event) => setBenefitActivationId(event.target.value)}
              >
                {(benefitsActivation?.lanes ?? []).map((laneItem) => (
                  <option key={laneItem.id} value={laneItem.id}>
                    {laneItem.label}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={benefitExecutionStatus === "loading"} aria-label="Activate Swiggy benefit">
                {benefitExecutionStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
              </button>
            </div>
            {benefitExecutionStatus === "error" ? <small role="status">Benefit activation unavailable.</small> : null}
          </form>
          <div
            className="benefit-activation-result"
            data-status={
              benefitExecution?.decision === "ready_local_handoff"
                ? "healthy"
                : benefitExecution?.decision === "swiggy_gate" || benefitExecution?.decision === "unknown_benefit"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Benefit handoff</span>
              <strong>
                {benefitExecution
                  ? `${benefitExecution.decision.replace(/_/g, " ")} / ${benefitExecution.readinessScore}/100`
                  : "Awaiting activation"}
              </strong>
            </div>
            <p>
              {benefitExecution
                ? `${benefitExecution.owner} / ${benefitExecution.proofLinks.length} proof links / ${benefitExecution.nextAction}`
                : "Select one Builders benefit to generate its owner, CTA, proof bundle, and Swiggy gate."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(benefitsActivation?.lanes ?? []).slice(0, 5).map((laneItem) => (
              <li
                key={laneItem.id}
                data-status={
                  laneItem.status === "ready"
                    ? "healthy"
                    : laneItem.status === "swiggy_gate"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{laneItem.label}</span>
                <strong>{laneItem.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Benefits activation links">
            <a href="/api/swiggy-benefits-activation-center" target="_blank" rel="noreferrer">
              Activation API
            </a>
            <a href="/api/swiggy-growth-partnership" target="_blank" rel="noreferrer">
              Growth
            </a>
            <a href="/api/swiggy-quota-negotiation-center" target="_blank" rel="noreferrer">
              Quotas
            </a>
          </div>
        </article>

        <article className="showcase-submission-card">
          <div className="mini-heading">
            <Sparkles aria-hidden="true" />
            <strong>Showcase Submission</strong>
          </div>
          <span>
            {showcaseSubmission
              ? `${showcaseSubmission.score}/100, ${showcaseSubmission.totals.readyAssets}/${showcaseSubmission.totals.assets} assets ready`
              : "Preparing demo, feature, and co-marketing packet"}
          </span>
          <div className="showcase-submission-grid">
            <div>
              <strong>{showcaseSubmission?.totals.pitchBlocks ?? 0}</strong>
              <span>Pitch blocks</span>
            </div>
            <div>
              <strong>{showcaseSubmission?.totals.operatorInputs ?? 0}</strong>
              <span>Inputs</span>
            </div>
            <div>
              <strong>{showcaseSubmission?.totals.swiggyGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <form className="showcase-composer" onSubmit={runShowcaseComposer}>
            <label htmlFor="showcase-demo-url">Demo URL</label>
            <input
              id="showcase-demo-url"
              type="url"
              value={showcaseForm.demoUrl}
              onChange={(event) => setShowcaseForm((current) => ({ ...current, demoUrl: event.target.value }))}
            />
            <label htmlFor="showcase-github-url">Repository</label>
            <input
              id="showcase-github-url"
              type="url"
              value={showcaseForm.githubUrl}
              onChange={(event) => setShowcaseForm((current) => ({ ...current, githubUrl: event.target.value }))}
            />
            <div>
              <input
                aria-label="Operator email"
                type="email"
                value={showcaseForm.operatorEmail}
                onChange={(event) => setShowcaseForm((current) => ({ ...current, operatorEmail: event.target.value }))}
              />
              <button type="submit" disabled={showcaseComposeStatus === "loading"} aria-label="Compose showcase packet">
                {showcaseComposeStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
              </button>
            </div>
            {showcaseComposeStatus === "error" ? <small role="status">Composer unavailable.</small> : null}
          </form>
          <div
            className="showcase-composer-result"
            data-status={
              showcaseComposition?.decision === "ready_to_send"
                ? "healthy"
                : showcaseComposition?.decision === "blocked_empty"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Outreach packet</span>
              <strong>
                {showcaseComposition
                  ? `${showcaseComposition.decision.replace(/_/g, " ")} / ${showcaseComposition.readinessScore}/100`
                  : "Awaiting compose"}
              </strong>
            </div>
            <p>
              {showcaseComposition
                ? `${showcaseComposition.to} / ${showcaseComposition.proofLinks.length} proof links / ${showcaseComposition.missingInputs.length} missing inputs`
                : "Compose a copy-ready builders@swiggy.in packet from demo, repository, and contact inputs."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(showcaseSubmission?.assets ?? []).slice(0, 5).map((item) => (
              <li
                key={item.id}
                data-status={item.status === "ready" ? "healthy" : item.status === "swiggy_gate" ? "blocked" : "watch"}
              >
                <span>{item.label}</span>
                <strong>{item.format.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Showcase submission links">
            <a href="/api/swiggy-showcase-submission-center" target="_blank" rel="noreferrer">
              Showcase API
            </a>
            <a href="/api/builder-packet-export" target="_blank" rel="noreferrer">
              Packet
            </a>
            <a href="/api/swiggy-builders-launch-story" target="_blank" rel="noreferrer">
              Story
            </a>
          </div>
        </article>

        <article className="demo-evidence-card">
          <div className="mini-heading">
            <Camera aria-hidden="true" />
            <strong>Demo Evidence Director</strong>
          </div>
          <span>
            {demoEvidence
              ? `${demoEvidence.score}/100, ${demoEvidence.totals.readyScenes}/${demoEvidence.totals.scenes} scenes ready`
              : "Preparing 2-3 minute recording gates and proof assets"}
          </span>
          <div className="demo-evidence-grid">
            <div>
              <strong>{demoEvidence?.totals.proofAssets ?? 0}</strong>
              <span>Proof assets</span>
            </div>
            <div>
              <strong>{demoEvidence?.totals.recordingGates ?? 0}</strong>
              <span>Recording gates</span>
            </div>
            <div>
              <strong>{demoEvidence?.totals.operatorInputs ?? 0}</strong>
              <span>Inputs</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(demoEvidence?.scenes ?? []).slice(0, 5).map((item) => (
              <li
                key={item.id}
                data-status={item.status === "ready" ? "healthy" : item.status === "swiggy_gate" ? "blocked" : "watch"}
              >
                <span>{item.label}</span>
                <strong>{item.duration}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Demo evidence links">
            <a href="/api/swiggy-demo-evidence-director" target="_blank" rel="noreferrer">
              Director API
            </a>
            <a href="/api/visual-qa-center" target="_blank" rel="noreferrer">
              Visual QA
            </a>
            <a href="/api/builder-packet-export" target="_blank" rel="noreferrer">
              Packet
            </a>
          </div>
        </article>

        <article className="submission-timeline-card">
          <div className="mini-heading">
            <CalendarCheck aria-hidden="true" />
            <strong>Submission Timeline</strong>
          </div>
          <span>
            {submissionTimeline
              ? `${submissionTimeline.score}/100, ${submissionTimeline.currentStage}`
              : "Sequencing form, demo, credentials, staging, and production handoff"}
          </span>
          <div className="submission-timeline-grid">
            <div>
              <strong>{submissionTimeline?.totals.ready ?? 0}/{submissionTimeline?.totals.phases ?? 0}</strong>
              <span>Phases</span>
            </div>
            <div>
              <strong>{submissionTimeline?.totals.operatorInputs ?? 0}</strong>
              <span>Inputs</span>
            </div>
            <div>
              <strong>{submissionTimeline?.totals.swiggyGates ?? 0}</strong>
              <span>Swiggy gates</span>
            </div>
          </div>
          <form className="timeline-checkpoint-form" onSubmit={runTimelineCheckpoint}>
            {[
              ["demoRecorded", "Demo"],
              ["accessFormSubmitted", "Form"],
              ["handoffEmailSent", "Email"],
              ["dcrApproved", "DCR"],
              ["stagingCredentialsIssued", "Staging"],
              ["stagingSoakComplete", "Soak"],
              ["productionApproved", "Prod"],
            ].map(([field, label]) => (
              <label key={field}>
                <input
                  type="checkbox"
                  checked={timelineCheckpointForm[field as keyof typeof timelineCheckpointForm]}
                  onChange={(event) =>
                    setTimelineCheckpointForm((current) => ({
                      ...current,
                      [field]: event.target.checked,
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
            <button type="submit" disabled={timelineCheckpointStatus === "loading"} aria-label="Run submission timeline checkpoint">
              {timelineCheckpointStatus === "loading" ? <Loader2 aria-hidden="true" /> : <CalendarCheck aria-hidden="true" />}
            </button>
          </form>
          {timelineCheckpointStatus === "error" ? <small className="timeline-checkpoint-error" role="status">Checkpoint unavailable.</small> : null}
          <div
            className="timeline-checkpoint-result"
            data-status={
              timelineCheckpoint?.decision === "ready_for_access_handoff" ||
              timelineCheckpoint?.decision === "ready_for_production_promotion"
                ? "healthy"
                : timelineCheckpoint?.decision === "needs_operator_input"
                  ? "watch"
                  : "blocked"
            }
          >
            <div>
              <span>Timeline checkpoint</span>
              <strong>
                {timelineCheckpoint
                  ? `${timelineCheckpoint.decision.replace(/_/g, " ")} / ${timelineCheckpoint.readinessScore}/100`
                  : "Awaiting checkpoint"}
              </strong>
            </div>
            <p>
              {timelineCheckpoint
                ? `${timelineCheckpoint.currentStage}: ${timelineCheckpoint.nextAction}`
                : "Run a local stage check across demo, form, email, DCR, staging, soak, and production gates."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(submissionTimeline?.phases ?? []).slice(0, 5).map((item) => (
              <li
                key={item.id}
                data-status={item.status === "ready" ? "healthy" : item.status === "swiggy_gate" ? "blocked" : "watch"}
              >
                <span>{item.label}</span>
                <strong>{item.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Submission timeline links">
            <a href="/api/swiggy-submission-timeline-center" target="_blank" rel="noreferrer">
              Timeline API
            </a>
            <a href="/api/access-submission-studio" target="_blank" rel="noreferrer">
              Access studio
            </a>
            <a href="/api/builder-packet-export" target="_blank" rel="noreferrer">
              Packet
            </a>
          </div>
        </article>

        <article className="partner-success-card">
          <div className="mini-heading">
            <LifeBuoy aria-hidden="true" />
            <strong>Partner Success Desk</strong>
          </div>
          <span>
            {partnerSuccess
              ? `${partnerSuccess.score}/100, ${partnerSuccess.totals.ready}/${partnerSuccess.totals.lanes} lanes ready`
              : "Combining support, capacity, incidents, and growth handoffs"}
          </span>
          <div className="partner-success-grid">
            <div>
              <strong>{partnerSuccess?.totals.proofLinks ?? 0}</strong>
              <span>Proof links</span>
            </div>
            <div>
              <strong>{partnerSuccess?.totals.manualInputs ?? 0}</strong>
              <span>Manual</span>
            </div>
            <div>
              <strong>{partnerSuccess?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <form className="partner-success-composer" onSubmit={runPartnerSuccessHandoff}>
            <label htmlFor="partner-success-lane">Success lane</label>
            <select
              id="partner-success-lane"
              value={partnerSuccessForm.laneId}
              onChange={(event) => setPartnerSuccessForm((current) => ({ ...current, laneId: event.target.value }))}
            >
              {(partnerSuccess?.lanes ?? []).map((lane) => (
                <option key={lane.id} value={lane.id}>
                  {lane.label}
                </option>
              ))}
            </select>
            <label htmlFor="partner-success-email">Operator email</label>
            <input
              id="partner-success-email"
              type="email"
              value={partnerSuccessForm.operatorEmail}
              onChange={(event) => setPartnerSuccessForm((current) => ({ ...current, operatorEmail: event.target.value }))}
            />
            <label htmlFor="partner-success-window">Window</label>
            <input
              id="partner-success-window"
              type="text"
              value={partnerSuccessForm.launchWindow}
              onChange={(event) => setPartnerSuccessForm((current) => ({ ...current, launchWindow: event.target.value }))}
            />
            <div>
              <input
                aria-label="Partner success context"
                type="text"
                value={partnerSuccessForm.contextNote}
                onChange={(event) => setPartnerSuccessForm((current) => ({ ...current, contextNote: event.target.value }))}
              />
              <button type="submit" disabled={partnerSuccessHandoffStatus === "loading"} aria-label="Compose partner success handoff">
                {partnerSuccessHandoffStatus === "loading" ? <Loader2 aria-hidden="true" /> : <LifeBuoy aria-hidden="true" />}
              </button>
            </div>
            {partnerSuccessHandoffStatus === "error" ? <small role="status">Partner handoff unavailable.</small> : null}
          </form>
          <div
            className="partner-success-result"
            data-status={
              partnerSuccessHandoff?.decision === "ready_local_handoff"
                ? "healthy"
                : partnerSuccessHandoff?.decision === "swiggy_gate" ||
                    partnerSuccessHandoff?.decision === "unknown_success_lane"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Success handoff</span>
              <strong>
                {partnerSuccessHandoff
                  ? `${partnerSuccessHandoff.decision.replace(/_/g, " ")} / ${partnerSuccessHandoff.readinessScore}/100`
                  : "Awaiting composition"}
              </strong>
            </div>
            <p>
              {partnerSuccessHandoff
                ? `${partnerSuccessHandoff.proofLinks.length} proof links / ${partnerSuccessHandoff.handoffDraft.to} / ${partnerSuccessHandoff.missingInputs.length} missing`
                : "Choose a support, capacity, growth, or enterprise lane to generate the local Swiggy partner-success packet."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(partnerSuccess?.lanes ?? []).slice(0, 5).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Partner success links">
            <a href="/api/swiggy-partner-success-desk" target="_blank" rel="noreferrer">
              Success desk
            </a>
            <a href="/api/support/bridge" target="_blank" rel="noreferrer">
              Support
            </a>
            <a href="/api/traffic-readiness-plan" target="_blank" rel="noreferrer">
              Capacity
            </a>
          </div>
        </article>

        <article className="partner-support-card">
          <div className="mini-heading">
            <MessageSquare aria-hidden="true" />
            <strong>Partner Support Room</strong>
          </div>
          <span>
            {partnerSupport
              ? `${partnerSupport.score}/100, ${partnerSupport.totals.readyChannels}/${partnerSupport.totals.channels} channels ready`
              : "Preparing report_error, incident, and capacity support room"}
          </span>
          <div className="partner-support-grid">
            <div>
              <strong>{partnerSupport?.totals.incidentLanes ?? 0}</strong>
              <span>Incident lanes</span>
            </div>
            <div>
              <strong>{partnerSupport?.totals.evidenceAttachments ?? 0}</strong>
              <span>Attachments</span>
            </div>
            <div>
              <strong>{partnerSupport?.totals.operatorInputs ?? 0}</strong>
              <span>Inputs</span>
            </div>
          </div>
          <form className="partner-support-composer" onSubmit={runPartnerSupportPacket}>
            <label htmlFor="partner-support-channel">Support channel</label>
            <select
              id="partner-support-channel"
              value={partnerSupportForm.channelId}
              onChange={(event) => setPartnerSupportForm((current) => ({ ...current, channelId: event.target.value }))}
            >
              {(partnerSupport?.channels ?? []).map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.label}
                </option>
              ))}
            </select>
            <label htmlFor="partner-support-incident">Incident lane</label>
            <select
              id="partner-support-incident"
              value={partnerSupportForm.incidentLaneId}
              onChange={(event) => setPartnerSupportForm((current) => ({ ...current, incidentLaneId: event.target.value }))}
            >
              {(partnerSupport?.incidentLanes ?? []).map((lane) => (
                <option key={lane.id} value={lane.id}>
                  {lane.label}
                </option>
              ))}
            </select>
            <label htmlFor="partner-support-email">Operator email</label>
            <input
              id="partner-support-email"
              type="email"
              value={partnerSupportForm.operatorEmail}
              onChange={(event) => setPartnerSupportForm((current) => ({ ...current, operatorEmail: event.target.value }))}
            />
            <label htmlFor="partner-support-session">Session id</label>
            <input
              id="partner-support-session"
              type="text"
              value={partnerSupportForm.sessionId}
              onChange={(event) => setPartnerSupportForm((current) => ({ ...current, sessionId: event.target.value }))}
            />
            <div>
              <input
                aria-label="Partner support summary"
                type="text"
                value={partnerSupportForm.summary}
                onChange={(event) => setPartnerSupportForm((current) => ({ ...current, summary: event.target.value }))}
              />
              <button type="submit" disabled={partnerSupportPacketStatus === "loading"} aria-label="Compose partner support packet">
                {partnerSupportPacketStatus === "loading" ? <Loader2 aria-hidden="true" /> : <MessageSquare aria-hidden="true" />}
              </button>
            </div>
            {partnerSupportPacketStatus === "error" ? <small role="status">Support packet composer unavailable.</small> : null}
          </form>
          <div
            className="partner-support-result"
            data-status={
              partnerSupportPacket?.decision === "ready_local_handoff"
                ? "healthy"
                : partnerSupportPacket?.decision === "swiggy_gate" ||
                    partnerSupportPacket?.decision === "unknown_support_lane"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Support packet</span>
              <strong>
                {partnerSupportPacket
                  ? `${partnerSupportPacket.decision.replace(/_/g, " ")} / ${partnerSupportPacket.readinessScore}/100`
                  : "Awaiting composition"}
              </strong>
            </div>
            <p>
              {partnerSupportPacket
                ? `${partnerSupportPacket.proofLinks.length} proof links / ${partnerSupportPacket.emailDraft.to} / ${partnerSupportPacket.missingInputs.length} missing`
                : "Choose a support channel and incident lane to generate the local redacted Swiggy support packet."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(partnerSupport?.channels ?? []).slice(0, 5).map((channel) => (
              <li
                key={channel.id}
                data-status={channel.status === "ready" ? "healthy" : channel.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{channel.label}</span>
                <strong>{channel.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Partner support links">
            <a href="/api/swiggy-partner-support-room" target="_blank" rel="noreferrer">
              Support room
            </a>
            <a href="/api/support/bridge" target="_blank" rel="noreferrer">
              Bridge
            </a>
            <a href="/api/slo-incident-command" target="_blank" rel="noreferrer">
              SLO
            </a>
          </div>
        </article>

        <article className="interaction-qa-card">
          <div className="mini-heading">
            <MousePointerClick aria-hidden="true" />
            <strong>Interaction QA</strong>
          </div>
          <span>
            {interactionQa
              ? `${interactionQa.score}/100, ${interactionQa.totals.working}/${interactionQa.totals.lanes} CTAs working`
              : "Mapping portal clicks to executable routes and Swiggy gates"}
          </span>
          <div className="interaction-qa-grid">
            <div>
              <strong>{interactionQa?.totals.postActions ?? 0}</strong>
              <span>POST/PATCH</span>
            </div>
            <div>
              <strong>{interactionQa?.totals.manualGates ?? 0}</strong>
              <span>Manual</span>
            </div>
            <div>
              <strong>{interactionQa?.totals.externalGates ?? 0}</strong>
              <span>External</span>
            </div>
          </div>
          <form className="interaction-qa-rehearsal" onSubmit={runInteractionQaRehearsal}>
            <label htmlFor="interaction-qa-lane">CTA lane</label>
            <select
              id="interaction-qa-lane"
              value={interactionQaForm.laneId}
              onChange={(event) => setInteractionQaForm((current) => ({ ...current, laneId: event.target.value }))}
            >
              {(interactionQa?.lanes ?? []).map((lane) => (
                <option key={lane.id} value={lane.id}>
                  {lane.ctaLabel}
                </option>
              ))}
            </select>
            <label htmlFor="interaction-qa-email">Operator email</label>
            <input
              id="interaction-qa-email"
              type="email"
              value={interactionQaForm.operatorEmail}
              onChange={(event) => setInteractionQaForm((current) => ({ ...current, operatorEmail: event.target.value }))}
            />
            <label className="interaction-qa-check" htmlFor="interaction-qa-dry-run">
              <input
                id="interaction-qa-dry-run"
                type="checkbox"
                checked={interactionQaForm.dryRunConfirmed}
                onChange={(event) => setInteractionQaForm((current) => ({ ...current, dryRunConfirmed: event.target.checked }))}
              />
              Dry run
            </label>
            <div>
              <input
                aria-label="Interaction QA evidence note"
                type="text"
                value={interactionQaForm.evidenceNote}
                onChange={(event) => setInteractionQaForm((current) => ({ ...current, evidenceNote: event.target.value }))}
              />
              <button type="submit" disabled={interactionQaRehearsalStatus === "loading"} aria-label="Run interaction QA rehearsal">
                {interactionQaRehearsalStatus === "loading" ? <Loader2 aria-hidden="true" /> : <MousePointerClick aria-hidden="true" />}
              </button>
            </div>
            {interactionQaRehearsalStatus === "error" ? <small role="status">Interaction QA rehearsal unavailable.</small> : null}
          </form>
          <div
            className="interaction-qa-result"
            data-status={
              interactionQaRehearsal?.decision === "ready_local_rehearsal"
                ? "healthy"
                : interactionQaRehearsal?.decision === "swiggy_gate" ||
                    interactionQaRehearsal?.decision === "unknown_cta_lane"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>CTA rehearsal</span>
              <strong>
                {interactionQaRehearsal
                  ? `${interactionQaRehearsal.decision.replace(/_/g, " ")} / ${interactionQaRehearsal.readinessScore}/100`
                  : "Awaiting dry run"}
              </strong>
            </div>
            <p>
              {interactionQaRehearsal
                ? `${interactionQaRehearsal.routeContract.method} ${interactionQaRehearsal.routeContract.endpoint} / ${interactionQaRehearsal.proofLinks.length} proofs / ${interactionQaRehearsal.missingInputs.length} missing`
                : "Pick one portal CTA to rehearse its route, expected feedback, proof links, and Swiggy-owned gates."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(interactionQa?.lanes ?? []).slice(0, 5).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "working" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.ctaLabel}</span>
                <strong>{lane.method}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Interaction QA links">
            <a href="/api/swiggy-interaction-qa-center" target="_blank" rel="noreferrer">
              QA API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              OpenAPI
            </a>
            <a href="/api/swiggy-cta-live-audit" target="_blank" rel="noreferrer">
              Live CTAs
            </a>
          </div>
        </article>

        <article className="channel-multimodal-card">
          <div className="mini-heading">
            <Camera aria-hidden="true" />
            <strong>Channel & Multimodal Studio</strong>
          </div>
          <span>
            {channelMultimodalStudio
              ? `${channelMultimodalStudio.score}/100, ${channelMultimodalStudio.readyLanes}/${channelMultimodalStudio.totalLanes} lanes`
              : "Mapping voice, team, camera, and enterprise channels"}
          </span>
          <div className="channel-multimodal-grid">
            <div>
              <strong>
                {channelMultimodalStudio?.readyChannels ?? 0}/{channelMultimodalStudio?.totalChannels ?? 0}
              </strong>
              <span>Channels</span>
            </div>
            <div>
              <strong>
                {channelMultimodalStudio?.readyExecutionPackets ?? 0}/{channelMultimodalStudio?.totalExecutionPackets ?? 0}
              </strong>
              <span>Packets</span>
            </div>
            <div>
              <strong>
                {channelMultimodalStudio?.readyPipelines ?? 0}/{channelMultimodalStudio?.totalPipelines ?? 0}
              </strong>
              <span>Pipelines</span>
            </div>
          </div>
          <form className="channel-execution-composer" onSubmit={runChannelExecutionComposer}>
            <label htmlFor="channel-execution-lane">Developer lane</label>
            <select
              id="channel-execution-lane"
              value={channelExecutionForm.laneId}
              onChange={(event) => setChannelExecutionForm((current) => ({ ...current, laneId: event.target.value }))}
            >
              {(channelMultimodalStudio?.lanes ?? []).map((laneItem) => (
                <option key={laneItem.id} value={laneItem.id}>
                  {laneItem.title}
                </option>
              ))}
            </select>
            <label htmlFor="channel-execution-channel">Channel</label>
            <select
              id="channel-execution-channel"
              value={channelExecutionForm.channelId}
              onChange={(event) => setChannelExecutionForm((current) => ({ ...current, channelId: event.target.value }))}
            >
              {(channelMultimodalStudio?.channels ?? []).map((channelItem) => (
                <option key={channelItem.id} value={channelItem.id}>
                  {channelItem.label}
                </option>
              ))}
            </select>
            <label htmlFor="channel-execution-email">Operator email</label>
            <input
              id="channel-execution-email"
              type="email"
              value={channelExecutionForm.operatorEmail}
              onChange={(event) => setChannelExecutionForm((current) => ({ ...current, operatorEmail: event.target.value }))}
            />
            <label className="channel-execution-check" htmlFor="channel-execution-dry-run">
              <input
                id="channel-execution-dry-run"
                type="checkbox"
                checked={channelExecutionForm.dryRunConfirmed}
                onChange={(event) => setChannelExecutionForm((current) => ({ ...current, dryRunConfirmed: event.target.checked }))}
              />
              Dry run
            </label>
            <div>
              <input
                aria-label="Channel execution trigger"
                type="text"
                value={channelExecutionForm.userTrigger}
                onChange={(event) => setChannelExecutionForm((current) => ({ ...current, userTrigger: event.target.value }))}
              />
              <button type="submit" disabled={channelExecutionStatus === "loading"} aria-label="Compose channel execution packet">
                {channelExecutionStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Camera aria-hidden="true" />}
              </button>
            </div>
            {channelExecutionStatus === "error" ? <small role="status">Channel execution composer unavailable.</small> : null}
          </form>
          <div
            className="channel-execution-result"
            data-status={
              channelExecutionComposition?.decision === "ready_local_packet"
                ? "healthy"
                : channelExecutionComposition?.decision === "swiggy_gate" ||
                    channelExecutionComposition?.decision === "unknown_channel_lane"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Execution packet</span>
              <strong>
                {channelExecutionComposition
                  ? `${channelExecutionComposition.decision.replace(/_/g, " ")} / ${channelExecutionComposition.readinessScore}/100`
                  : "Awaiting channel packet"}
              </strong>
            </div>
            <p>
              {channelExecutionComposition
                ? `${channelExecutionComposition.swiggyToolchain.length} tools / ${channelExecutionComposition.proofLinks.length} proofs / ${channelExecutionComposition.missingInputs.length} missing`
                : "Compose one developer lane into channel-specific route rules, confirmation gates, and telemetry proof."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(channelMultimodalStudio?.lanes ?? []).slice(0, 5).map((laneItem) => (
              <li key={laneItem.id} data-status={laneItem.status === "ready" ? "healthy" : "watch"}>
                <span>{laneItem.title}</span>
                <strong>{laneItem.channels.length} channels</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="visual-dish-capture-card">
          <div className="mini-heading">
            <Camera aria-hidden="true" />
            <strong>Visual Dish Capture</strong>
          </div>
          <span>
            {visualDishCapture
              ? `${visualDishCapture.score}/100, ${visualDishCapture.totals.readyRoutes}/${visualDishCapture.totals.routes} routes safe`
              : "Turning dish photos into safe Swiggy route plans"}
          </span>
          <div className="visual-dish-capture-grid">
            <div>
              <strong>{visualDishCapture?.totals.sampleCaptures ?? 0}</strong>
              <span>Samples</span>
            </div>
            <div>
              <strong>
                {visualDishCapture?.totals.readyGuardrails ?? 0}/{visualDishCapture?.totals.guardrails ?? 0}
              </strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{visualDishCapture?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(visualDishCapture?.routes ?? []).slice(0, 4).map((routeItem) => (
              <li key={routeItem.id} data-status={routeItem.status === "ready" ? "healthy" : "watch"}>
                <span>{routeItem.label}</span>
                <strong>{routeItem.server === "combined" ? "Combined" : serverLabel(routeItem.server)}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-visual-dish-capture" target="_blank" rel="noreferrer">
              Capture API
            </a>
            <a href="https://mcp.swiggy.com/builders/developers/" target="_blank" rel="noreferrer">
              Developer lanes
            </a>
          </div>
        </article>

        <article className="voice-commerce-card">
          <div className="mini-heading">
            <Mic aria-hidden="true" />
            <strong>Voice Commerce Rehearsal</strong>
          </div>
          <span>
            {voiceCommerce
              ? `${voiceCommerce.score}/100, ${voiceCommerce.totals.readyScenarios}/${voiceCommerce.totals.scenarios} scenarios safe`
              : "Rehearsing spoken Swiggy journeys"}
          </span>
          <div className="voice-commerce-grid">
            <div>
              <strong>{voiceCommerce?.totals.samples ?? 0}</strong>
              <span>Samples</span>
            </div>
            <div>
              <strong>
                {voiceCommerce?.totals.readyGuardrails ?? 0}/{voiceCommerce?.totals.guardrails ?? 0}
              </strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{voiceCommerce?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(voiceCommerce?.scenarios ?? []).slice(0, 4).map((scenarioItem) => (
              <li key={scenarioItem.id} data-status={scenarioItem.status === "ready" ? "healthy" : "watch"}>
                <span>{scenarioItem.label}</span>
                <strong>{scenarioItem.server === "combined" ? "Combined" : serverLabel(scenarioItem.server)}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-voice-commerce-center" target="_blank" rel="noreferrer">
              Voice API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/" target="_blank" rel="noreferrer">
              Voice pattern
            </a>
          </div>
        </article>

        <article className="quality-loop-card">
          <div className="mini-heading">
            <RefreshCw aria-hidden="true" />
            <strong>Quality Loop Center</strong>
          </div>
          <span>
            {qualityLoop
              ? `${qualityLoop.score}/100, ${qualityLoop.totals.readyLanes}/${qualityLoop.totals.lanes} loops safe`
              : "Learning from Food, Instamart, and Dineout outcomes"}
          </span>
          <div className="quality-loop-grid">
            <div>
              <strong>{qualityLoop?.totals.samples ?? 0}</strong>
              <span>Samples</span>
            </div>
            <div>
              <strong>
                {qualityLoop?.totals.readyGuardrails ?? 0}/{qualityLoop?.totals.guardrails ?? 0}
              </strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{qualityLoop?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(qualityLoop?.lanes ?? []).slice(0, 4).map((laneItem) => (
              <li key={laneItem.id} data-status={laneItem.status === "ready" ? "healthy" : "watch"}>
                <span>{laneItem.label}</span>
                <strong>{laneItem.server === "combined" ? "Combined" : serverLabel(laneItem.server)}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-quality-loop-center" target="_blank" rel="noreferrer">
              Quality API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/operate/support/" target="_blank" rel="noreferrer">
              Support docs
            </a>
          </div>
        </article>

        <article className="ritual-autopilot-card">
          <div className="mini-heading">
            <CalendarCheck aria-hidden="true" />
            <strong>Ritual Autopilot Center</strong>
          </div>
          <span>
            {ritualAutopilot
              ? `${ritualAutopilot.score}/100, ${ritualAutopilot.totals.readyLanes}/${ritualAutopilot.totals.lanes} routines safe`
              : "Preparing consented weekly routines across Food, Instamart, and Dineout"}
          </span>
          <div className="ritual-autopilot-grid">
            <div>
              <strong>{ritualAutopilot?.totals.samples ?? 0}</strong>
              <span>Samples</span>
            </div>
            <div>
              <strong>
                {ritualAutopilot?.totals.readyGuardrails ?? 0}/{ritualAutopilot?.totals.guardrails ?? 0}
              </strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{ritualAutopilot?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(ritualAutopilot?.lanes ?? []).slice(0, 4).map((laneItem) => (
              <li key={laneItem.id} data-status={laneItem.status === "staging_gate" ? "watch" : "healthy"}>
                <span>{laneItem.label}</span>
                <strong>{laneItem.server === "combined" ? "Combined" : serverLabel(laneItem.server)}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-ritual-autopilot-center" target="_blank" rel="noreferrer">
              Ritual API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/build/recipes/combined/" target="_blank" rel="noreferrer">
              Combined recipe
            </a>
          </div>
        </article>

        <article className="payment-truth-card">
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Payment Truth Center</strong>
          </div>
          <span>
            {paymentTruth
              ? `${paymentTruth.score}/100, ${paymentTruth.totals.readyLanes}/${paymentTruth.totals.lanes} settlement lanes safe`
              : "Reconciling cart totals, coupons, COD, checkout, and booking payment truth"}
          </span>
          <div className="payment-truth-grid">
            <div>
              <strong>{paymentTruth?.totals.samples ?? 0}</strong>
              <span>Samples</span>
            </div>
            <div>
              <strong>
                {paymentTruth?.totals.readyGuardrails ?? 0}/{paymentTruth?.totals.guardrails ?? 0}
              </strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{paymentTruth?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <form className="payment-truth-reconciler" onSubmit={runPaymentTruthReconciliation}>
            <label htmlFor="payment-truth-server">Server</label>
            <select
              id="payment-truth-server"
              value={paymentTruthForm.server}
              onChange={(event) =>
                setPaymentTruthForm((current) => ({
                  ...current,
                  server: event.target.value as typeof paymentTruthForm.server,
                }))
              }
            >
              <option value="food">Food</option>
              <option value="instamart">Instamart</option>
              <option value="dineout">Dineout</option>
              <option value="combined">Combined</option>
            </select>
            <label htmlFor="payment-truth-preference">Payment</label>
            <select
              id="payment-truth-preference"
              value={paymentTruthForm.paymentPreference}
              onChange={(event) =>
                setPaymentTruthForm((current) => ({
                  ...current,
                  paymentPreference: event.target.value as typeof paymentTruthForm.paymentPreference,
                }))
              }
            >
              <option value="cod">COD</option>
              <option value="online">Online</option>
              <option value="free_booking">Free booking</option>
              <option value="unknown">Unknown</option>
            </select>
            <label htmlFor="payment-truth-city">City</label>
            <select
              id="payment-truth-city"
              value={paymentTruthForm.city}
              onChange={(event) =>
                setPaymentTruthForm((current) => ({
                  ...current,
                  city: event.target.value as typeof paymentTruthForm.city,
                }))
              }
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
            </select>
            <div className="payment-truth-number-grid">
              <label htmlFor="payment-truth-total">Total</label>
              <input
                id="payment-truth-total"
                type="number"
                min="0"
                value={paymentTruthForm.cartTotal}
                onChange={(event) =>
                  setPaymentTruthForm((current) => ({ ...current, cartTotal: Number(event.target.value) }))
                }
              />
              <label htmlFor="payment-truth-discount">Discount</label>
              <input
                id="payment-truth-discount"
                type="number"
                min="0"
                value={paymentTruthForm.expectedDiscount}
                onChange={(event) =>
                  setPaymentTruthForm((current) => ({ ...current, expectedDiscount: Number(event.target.value) }))
                }
              />
            </div>
            <button type="submit" disabled={paymentReconciliationStatus === "loading"} aria-label="Reconcile payment truth">
              {paymentReconciliationStatus === "loading" ? <Loader2 aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
              Reconcile
            </button>
            {paymentReconciliationStatus === "error" ? <small role="status">Payment truth reconciliation unavailable.</small> : null}
          </form>
          <div
            className="payment-truth-result"
            data-status={
              paymentReconciliation?.settlementStatus === "ready_for_confirmation"
                ? "healthy"
                : paymentReconciliation?.settlementStatus === "support_review"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Settlement truth</span>
              <strong>
                {paymentReconciliation
                  ? paymentReconciliation.settlementStatus.replace(/_/g, " ")
                  : "Awaiting reconciliation"}
              </strong>
            </div>
            <p>
              {paymentReconciliation
                ? `${paymentReconciliation.selectedLaneId} / ${paymentReconciliation.riskFlags.length} flags / raw payment retained false`
                : "Reconcile cart total, coupon, COD, checkout, or booking copy against Swiggy readback-only rules."}
            </p>
          </div>
          <ul className="compact-status-list">
            {(paymentTruth?.lanes ?? []).slice(0, 5).map((laneItem) => (
              <li key={laneItem.id} data-status={laneItem.status === "staging_gate" ? "watch" : "healthy"}>
                <span>{laneItem.label}</span>
                <strong>{laneItem.server === "combined" ? "Combined" : serverLabel(laneItem.server)}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-payment-truth-center" target="_blank" rel="noreferrer">
              Payment API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/reference/food/get_food_cart/" target="_blank" rel="noreferrer">
              Cart truth
            </a>
          </div>
        </article>

        <article className="meal-window-card">
          <div className="mini-heading">
            <CalendarCheck aria-hidden="true" />
            <strong>Meal Window Intelligence</strong>
          </div>
          <span>
            {mealWindow
              ? `${mealWindow.score}/100, ${mealWindow.totals.readyLanes}/${mealWindow.totals.lanes} timing lanes safe`
              : "Forecasting when to order, cook, reserve, track, or wait"}
          </span>
          <div className="meal-window-grid">
            <div>
              <strong>{mealWindow?.totals.samples ?? 0}</strong>
              <span>Samples</span>
            </div>
            <div>
              <strong>
                {mealWindow?.totals.readyGuardrails ?? 0}/{mealWindow?.totals.guardrails ?? 0}
              </strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{mealWindow?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <form className="meal-window-forecaster" onSubmit={runMealWindowForecast}>
            <label htmlFor="meal-window-city">City</label>
            <select
              id="meal-window-city"
              value={mealWindowForm.city}
              onChange={(event) =>
                setMealWindowForm((current) => ({ ...current, city: event.target.value as typeof mealWindowForm.city }))
              }
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
            </select>
            <label htmlFor="meal-window-window">Window</label>
            <select
              id="meal-window-window"
              value={mealWindowForm.window}
              onChange={(event) =>
                setMealWindowForm((current) => ({ ...current, window: event.target.value as SwiggyMealWindow }))
              }
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="late_night">Late night</option>
              <option value="weekend">Weekend</option>
            </select>
            <label htmlFor="meal-window-urgency">Urgency</label>
            <select
              id="meal-window-urgency"
              value={mealWindowForm.urgency}
              onChange={(event) =>
                setMealWindowForm((current) => ({
                  ...current,
                  urgency: event.target.value as typeof mealWindowForm.urgency,
                }))
              }
            >
              <option value="now">Now</option>
              <option value="today">Today</option>
              <option value="this_week">This week</option>
            </select>
            <div className="meal-window-number-grid">
              <label htmlFor="meal-window-party">Party</label>
              <input
                id="meal-window-party"
                type="number"
                min="1"
                max="24"
                value={mealWindowForm.partySize}
                onChange={(event) =>
                  setMealWindowForm((current) => ({ ...current, partySize: Number(event.target.value) }))
                }
              />
            </div>
            <label className="meal-window-toggle" htmlFor="meal-window-dineout">
              <input
                id="meal-window-dineout"
                type="checkbox"
                checked={mealWindowForm.includeDineout}
                onChange={(event) =>
                  setMealWindowForm((current) => ({ ...current, includeDineout: event.target.checked }))
                }
              />
              Dineout slot path
            </label>
            <button type="submit" disabled={mealWindowForecastStatus === "loading"} aria-label="Forecast meal window">
              {mealWindowForecastStatus === "loading" ? <Loader2 aria-hidden="true" /> : <CalendarCheck aria-hidden="true" />}
              Forecast
            </button>
            {mealWindowForecastStatus === "error" ? <small role="status">Meal window forecast unavailable.</small> : null}
          </form>
          <div
            className="meal-window-result"
            data-status={
              mealWindowForecast?.etaRisk === "high" ? "blocked" : mealWindowForecast?.etaRisk === "medium" ? "watch" : "healthy"
            }
          >
            <div>
              <span>ETA risk</span>
              <strong>{mealWindowForecast ? mealWindowForecast.etaRisk : "Awaiting forecast"}</strong>
            </div>
            <p>
              {mealWindowForecast
                ? `${mealWindowForecast.selectedLaneId} / ${mealWindowForecast.recommendedRoute} / ${mealWindowForecast.timingPlan.length} timed checks`
                : "Forecast the right Food, Instamart, Dineout, or combined route before asking for cart or slot confirmation."}
            </p>
            {mealWindowForecast ? <small>{mealWindowForecast.recommendedAction}</small> : null}
          </div>
          <ul className="compact-status-list">
            {(mealWindow?.lanes ?? []).slice(0, 5).map((laneItem) => (
              <li
                key={laneItem.id}
                data-status={laneItem.status === "staging_gate" || laneItem.status === "watch" ? "watch" : "healthy"}
              >
                <span>{laneItem.label}</span>
                <strong>{laneItem.server === "combined" ? "Combined" : serverLabel(laneItem.server)}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-meal-window-intelligence" target="_blank" rel="noreferrer">
              Window API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/build/recipes/combined/" target="_blank" rel="noreferrer">
              Combined timing
            </a>
          </div>
        </article>

        <article className="customization-studio-card">
          <div className="mini-heading">
            <Grid3X3 aria-hidden="true" />
            <strong>Customization Studio</strong>
          </div>
          <span>
            {customizationStudio
              ? `${customizationStudio.score}/100, ${customizationStudio.totals.readyLanes}/${customizationStudio.totals.lanes} customization lanes safe`
              : "Reviewing add-ons, variants, pack sizes, substitutions, and cart readbacks"}
          </span>
          <div className="customization-studio-grid">
            <div>
              <strong>{customizationStudio?.totals.toolsCovered ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>
                {customizationStudio?.totals.readyGuardrails ?? 0}/{customizationStudio?.totals.guardrails ?? 0}
              </strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{customizationStudio?.totals.samples ?? 0}</strong>
              <span>Samples</span>
            </div>
          </div>
          <form className="customization-validator" onSubmit={runCustomizationValidation}>
            <label htmlFor="customization-server">Server</label>
            <select
              id="customization-server"
              value={customizationForm.server}
              onChange={(event) =>
                setCustomizationForm((current) => ({
                  ...current,
                  server: event.target.value as typeof customizationForm.server,
                  includeDineout: event.target.value === "dineout" ? true : current.includeDineout,
                }))
              }
            >
              <option value="food">Food</option>
              <option value="instamart">Instamart</option>
              <option value="dineout">Dineout-aware</option>
              <option value="combined">Combined</option>
            </select>
            <label htmlFor="customization-intent">Intent</label>
            <textarea
              id="customization-intent"
              value={customizationForm.intent}
              rows={3}
              onChange={(event) => setCustomizationForm((current) => ({ ...current, intent: event.target.value }))}
            />
            <div className="customization-number-grid">
              <label htmlFor="customization-quantity">Qty</label>
              <input
                id="customization-quantity"
                type="number"
                min="1"
                max="24"
                value={customizationForm.quantity}
                onChange={(event) =>
                  setCustomizationForm((current) => ({ ...current, quantity: Number(event.target.value) }))
                }
              />
            </div>
            <div className="customization-toggle-grid">
              <label htmlFor="customization-allergy">
                <input
                  id="customization-allergy"
                  type="checkbox"
                  checked={customizationForm.hasAllergy}
                  onChange={(event) =>
                    setCustomizationForm((current) => ({ ...current, hasAllergy: event.target.checked }))
                  }
                />
                Allergy caution
              </label>
              <label htmlFor="customization-variant">
                <input
                  id="customization-variant"
                  type="checkbox"
                  checked={customizationForm.userChangedVariant}
                  onChange={(event) =>
                    setCustomizationForm((current) => ({ ...current, userChangedVariant: event.target.checked }))
                  }
                />
                Variant changed
              </label>
              <label htmlFor="customization-dineout">
                <input
                  id="customization-dineout"
                  type="checkbox"
                  checked={customizationForm.includeDineout}
                  onChange={(event) =>
                    setCustomizationForm((current) => ({ ...current, includeDineout: event.target.checked }))
                  }
                />
                Include Dineout
              </label>
            </div>
            <button type="submit" disabled={customizationValidationStatus === "loading"} aria-label="Validate customization">
              {customizationValidationStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Grid3X3 aria-hidden="true" />}
              Validate
            </button>
            {customizationValidationStatus === "error" ? (
              <small role="status">Customization validation unavailable.</small>
            ) : null}
          </form>
          <div
            className="customization-result"
            data-status={
              customizationValidation?.mutationRisk === "high"
                ? "blocked"
                : customizationValidation?.mutationRisk === "medium"
                  ? "watch"
                  : "healthy"
            }
          >
            <div>
              <span>Mutation risk</span>
              <strong>{customizationValidation ? customizationValidation.mutationRisk : "Awaiting validation"}</strong>
            </div>
            <p>
              {customizationValidation
                ? `${customizationValidation.selectedLaneId} / readback ${customizationValidation.requiredFreshRead} / ${customizationValidation.checklist.length} checks`
                : "Validate exact add-ons, variants, pack sizes, and caution copy before any Swiggy cart mutation."}
            </p>
            {customizationValidation ? <small>{customizationValidation.recommendedAction}</small> : null}
          </div>
          <ul className="compact-status-list">
            {(customizationStudio?.lanes ?? []).slice(0, 5).map((laneItem) => (
              <li
                key={laneItem.id}
                data-status={laneItem.status === "staging_gate" || laneItem.status === "watch" ? "watch" : "healthy"}
              >
                <span>{laneItem.label}</span>
                <strong>{laneItem.server === "combined" ? "Combined" : serverLabel(laneItem.server)}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-customization-studio" target="_blank" rel="noreferrer">
              Customization API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/reference/food/search_menu/" target="_blank" rel="noreferrer">
              Menu truth
            </a>
          </div>
        </article>

        <article className="nutrition-budget-card">
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Nutrition & Budget Intelligence</strong>
          </div>
          <span>
            {nutritionBudget
              ? `${nutritionBudget.score}/100, ${nutritionBudget.readyRoutes}/${nutritionBudget.totalRoutes} routes`
              : "Optimizing protein, budget, coupons, and pantry gaps"}
          </span>
          <div className="nutrition-budget-grid">
            <div>
              <strong>{nutritionBudget?.totalToolsCovered ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{nutritionBudget?.totalPlaybooks ?? 0}</strong>
              <span>Playbooks</span>
            </div>
            <div>
              <strong>{nutritionBudget?.externalGates.length ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <form className="nutrition-advisor" onSubmit={runNutritionAdvice}>
            <label htmlFor="nutrition-city">City</label>
            <select
              id="nutrition-city"
              value={nutritionAdviceForm.city}
              onChange={(event) =>
                setNutritionAdviceForm((current) => ({ ...current, city: event.target.value as typeof nutritionAdviceForm.city }))
              }
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
            </select>
            <label htmlFor="nutrition-preference">Route</label>
            <select
              id="nutrition-preference"
              value={nutritionAdviceForm.preference}
              onChange={(event) =>
                setNutritionAdviceForm((current) => ({
                  ...current,
                  preference: event.target.value as typeof nutritionAdviceForm.preference,
                  includeDineout: event.target.value === "dineout" ? true : current.includeDineout,
                }))
              }
            >
              <option value="food">Food</option>
              <option value="instamart">Instamart</option>
              <option value="dineout">Dineout</option>
              <option value="combined">Combined</option>
            </select>
            <div className="nutrition-number-grid">
              <label htmlFor="nutrition-budget">Budget</label>
              <input
                id="nutrition-budget"
                type="number"
                min="250"
                max="50000"
                value={nutritionAdviceForm.budget}
                onChange={(event) =>
                  setNutritionAdviceForm((current) => ({ ...current, budget: Number(event.target.value) }))
                }
              />
              <label htmlFor="nutrition-protein">Protein</label>
              <input
                id="nutrition-protein"
                type="number"
                min="20"
                max="300"
                value={nutritionAdviceForm.proteinTargetGrams}
                onChange={(event) =>
                  setNutritionAdviceForm((current) => ({ ...current, proteinTargetGrams: Number(event.target.value) }))
                }
              />
              <label htmlFor="nutrition-party">Party</label>
              <input
                id="nutrition-party"
                type="number"
                min="1"
                max="30"
                value={nutritionAdviceForm.partySize}
                onChange={(event) =>
                  setNutritionAdviceForm((current) => ({ ...current, partySize: Number(event.target.value) }))
                }
              />
            </div>
            <div className="nutrition-toggle-grid">
              <label htmlFor="nutrition-coupon">
                <input
                  id="nutrition-coupon"
                  type="checkbox"
                  checked={nutritionAdviceForm.couponSensitive}
                  onChange={(event) =>
                    setNutritionAdviceForm((current) => ({ ...current, couponSensitive: event.target.checked }))
                  }
                />
                Coupon sensitive
              </label>
              <label htmlFor="nutrition-dineout">
                <input
                  id="nutrition-dineout"
                  type="checkbox"
                  checked={nutritionAdviceForm.includeDineout}
                  onChange={(event) =>
                    setNutritionAdviceForm((current) => ({ ...current, includeDineout: event.target.checked }))
                  }
                />
                Include Dineout
              </label>
            </div>
            <button type="submit" disabled={nutritionAdviceStatus === "loading"} aria-label="Advise nutrition budget route">
              {nutritionAdviceStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Gauge aria-hidden="true" />}
              Advise
            </button>
            {nutritionAdviceStatus === "error" ? <small role="status">Nutrition budget advice unavailable.</small> : null}
          </form>
          <div
            className="nutrition-advice-result"
            data-status={
              nutritionAdvice?.budgetFit === "under_budget"
                ? "healthy"
                : nutritionAdvice?.budgetFit === "at_risk"
                  ? "watch"
                  : "blocked"
            }
          >
            <div>
              <span>Budget fit</span>
              <strong>{nutritionAdvice ? nutritionAdvice.budgetFit.replace("_", " ") : "Awaiting advice"}</strong>
            </div>
            <p>
              {nutritionAdvice
                ? `${nutritionAdvice.selectedRouteId} / Rs ${nutritionAdvice.estimatedCost} / ${Math.round(
                    nutritionAdvice.proteinCoverage * 100,
                  )}% protein coverage`
                : "Choose a Swiggy route before cart, checkout, booking, or order actions."}
            </p>
            {nutritionAdvice ? <small>{nutritionAdvice.recommendedAction}</small> : null}
          </div>
          <ul className="compact-status-list">
            {(nutritionBudget?.routes ?? []).slice(0, 5).map((routeItem) => (
              <li key={routeItem.id} data-status={routeItem.status === "ready" ? "healthy" : "watch"}>
                <span>{routeItem.title}</span>
                <strong>{routeItem.swiggyServers.map(serverLabel).join("/")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="preference-graph-card">
          <div className="mini-heading">
            <Users aria-hidden="true" />
            <strong>Household Preference Graph</strong>
          </div>
          <span>
            {householdPreference
              ? `${householdPreference.score}/100, ${householdPreference.readySignals}/${householdPreference.totalSignals} signals`
              : "Building consented taste, pantry, order, and occasion memory"}
          </span>
          <div className="preference-graph-grid">
            <div>
              <strong>{householdPreference?.totalMembers ?? 0}</strong>
              <span>Modes</span>
            </div>
            <div>
              <strong>
                {householdPreference?.readyForecasts ?? 0}/{householdPreference?.totalForecasts ?? 0}
              </strong>
              <span>Forecasts</span>
            </div>
            <div>
              <strong>{householdPreference?.uniqueToolsCovered ?? 0}</strong>
              <span>Tools</span>
            </div>
          </div>
          <form className="preference-simulator" onSubmit={runPreferenceSimulation}>
            <label htmlFor="preference-city">City</label>
            <select
              id="preference-city"
              value={preferenceSimulationForm.city}
              onChange={(event) =>
                setPreferenceSimulationForm((current) => ({
                  ...current,
                  city: event.target.value as typeof preferenceSimulationForm.city,
                }))
              }
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
            </select>
            <label htmlFor="preference-mode">Mode</label>
            <select
              id="preference-mode"
              value={preferenceSimulationForm.householdMode}
              onChange={(event) =>
                setPreferenceSimulationForm((current) => ({
                  ...current,
                  householdMode: event.target.value as typeof preferenceSimulationForm.householdMode,
                }))
              }
            >
              <option value="primary_planner">Primary planner</option>
              <option value="family_group">Family group</option>
              <option value="office_team">Office team</option>
              <option value="weekend_guest">Weekend guest</option>
            </select>
            <label htmlFor="preference-server">Server</label>
            <select
              id="preference-server"
              value={preferenceSimulationForm.preferredServer}
              onChange={(event) =>
                setPreferenceSimulationForm((current) => ({
                  ...current,
                  preferredServer: event.target.value as typeof preferenceSimulationForm.preferredServer,
                  occasionMode: event.target.value === "dineout" ? true : current.occasionMode,
                }))
              }
            >
              <option value="food">Food</option>
              <option value="instamart">Instamart</option>
              <option value="dineout">Dineout</option>
              <option value="combined">Combined</option>
            </select>
            <div className="preference-toggle-grid">
              <label htmlFor="preference-consent">
                <input
                  id="preference-consent"
                  type="checkbox"
                  checked={preferenceSimulationForm.consentToUseHistory}
                  onChange={(event) =>
                    setPreferenceSimulationForm((current) => ({ ...current, consentToUseHistory: event.target.checked }))
                  }
                />
                History consent
              </label>
              <label htmlFor="preference-failure">
                <input
                  id="preference-failure"
                  type="checkbox"
                  checked={preferenceSimulationForm.recentFailure}
                  onChange={(event) =>
                    setPreferenceSimulationForm((current) => ({ ...current, recentFailure: event.target.checked }))
                  }
                />
                Recent failure
              </label>
              <label htmlFor="preference-occasion">
                <input
                  id="preference-occasion"
                  type="checkbox"
                  checked={preferenceSimulationForm.occasionMode}
                  onChange={(event) =>
                    setPreferenceSimulationForm((current) => ({ ...current, occasionMode: event.target.checked }))
                  }
                />
                Occasion mode
              </label>
            </div>
            <button type="submit" disabled={preferenceSimulationStatus === "loading"} aria-label="Simulate household preference">
              {preferenceSimulationStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Users aria-hidden="true" />}
              Simulate
            </button>
            {preferenceSimulationStatus === "error" ? (
              <small role="status">Household preference simulation unavailable.</small>
            ) : null}
          </form>
          <div
            className="preference-simulation-result"
            data-status={
              preferenceSimulation?.decision === "personalized"
                ? "healthy"
                : preferenceSimulation?.decision === "support_safe_fallback"
                  ? "blocked"
                  : "watch"
            }
          >
            <div>
              <span>Decision</span>
              <strong>{preferenceSimulation ? preferenceSimulation.decision.replace(/_/g, " ") : "Awaiting simulation"}</strong>
            </div>
            <p>
              {preferenceSimulation
                ? `${preferenceSimulation.selectedSignalId} / ${preferenceSimulation.selectedForecastId} / ${preferenceSimulation.confidence}% confidence`
                : "Simulate consented personalization before ranking Food, Instamart, Dineout, or fallback routes."}
            </p>
            {preferenceSimulation ? <small>{preferenceSimulation.recommendedAction}</small> : null}
          </div>
          <ul className="compact-status-list">
            {(householdPreference?.signals ?? []).slice(0, 5).map((signalItem) => (
              <li key={signalItem.id} data-status={signalItem.status === "ready" ? "healthy" : "watch"}>
                <span>{signalItem.label}</span>
                <strong>{signalItem.source.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="guest-collaboration-card">
          <div className="mini-heading">
            <CalendarCheck aria-hidden="true" />
            <strong>Guest Collaboration & Calendar</strong>
          </div>
          <span>
            {guestCollaboration
              ? `${guestCollaboration.score}/100, ${guestCollaboration.readyTemplates}/${guestCollaboration.totalTemplates} templates`
              : "Coordinating guests, votes, Dineout slots, reminders, and calendar handoffs"}
          </span>
          <div className="guest-collaboration-grid">
            <div>
              <strong>
                {guestCollaboration?.readyVoteRounds ?? 0}/{guestCollaboration?.totalVoteRounds ?? 0}
              </strong>
              <span>Votes</span>
            </div>
            <div>
              <strong>
                {guestCollaboration?.readyCalendarArtifacts ?? 0}/{guestCollaboration?.totalCalendarArtifacts ?? 0}
              </strong>
              <span>Handoffs</span>
            </div>
            <div>
              <strong>{guestCollaboration?.uniqueToolsCovered ?? 0}</strong>
              <span>Tools</span>
            </div>
          </div>
          <form className="guest-handoff-composer" onSubmit={runGuestHandoffComposer}>
            <label htmlFor="guest-template">Template</label>
            <select
              id="guest-template"
              value={guestHandoffForm.templateId}
              onChange={(event) => setGuestHandoffForm((current) => ({ ...current, templateId: event.target.value }))}
            >
              {(guestCollaboration?.templates ?? []).map((templateItem) => (
                <option key={templateItem.id} value={templateItem.id}>
                  {templateItem.title}
                </option>
              ))}
            </select>
            <label htmlFor="guest-channel">Channel</label>
            <select
              id="guest-channel"
              value={guestHandoffForm.channel}
              onChange={(event) =>
                setGuestHandoffForm((current) => ({ ...current, channel: event.target.value as GuestCollaborationChannel }))
              }
            >
              <option value="web_share">Web share</option>
              <option value="calendar_ics">Calendar</option>
              <option value="voice_brief">Voice brief</option>
              <option value="slack_teams">Slack/Teams</option>
            </select>
            <label htmlFor="guest-city">City</label>
            <select
              id="guest-city"
              value={guestHandoffForm.city}
              onChange={(event) =>
                setGuestHandoffForm((current) => ({ ...current, city: event.target.value as typeof guestHandoffForm.city }))
              }
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
            </select>
            <div className="guest-handoff-number-grid">
              <label htmlFor="guest-count">Guests</label>
              <input
                id="guest-count"
                type="number"
                min="1"
                max="100"
                value={guestHandoffForm.guestCount}
                onChange={(event) => setGuestHandoffForm((current) => ({ ...current, guestCount: Number(event.target.value) }))}
              />
            </div>
            <label className="guest-handoff-toggle" htmlFor="guest-dineout">
              <input
                id="guest-dineout"
                type="checkbox"
                checked={guestHandoffForm.includeDineout}
                onChange={(event) => setGuestHandoffForm((current) => ({ ...current, includeDineout: event.target.checked }))}
              />
              Dineout-first
            </label>
            <button type="submit" disabled={guestHandoffStatus === "loading"} aria-label="Compose guest collaboration handoff">
              {guestHandoffStatus === "loading" ? <Loader2 aria-hidden="true" /> : <CalendarCheck aria-hidden="true" />}
              Compose
            </button>
            {guestHandoffStatus === "error" ? <small role="status">Guest collaboration handoff unavailable.</small> : null}
          </form>
          <div
            className="guest-handoff-result"
            data-status={
              guestHandoff?.decision === "ready_local_handoff"
                ? "healthy"
                : guestHandoff?.decision === "manual_channel_gate"
                  ? "watch"
                  : "blocked"
            }
          >
            <div>
              <span>Handoff</span>
              <strong>{guestHandoff ? `${guestHandoff.decision.replace(/_/g, " ")} / ${guestHandoff.readinessScore}` : "Awaiting handoff"}</strong>
            </div>
            <p>
              {guestHandoff
                ? `${guestHandoff.selectedTemplate?.id ?? "unknown"} / ${guestHandoff.calendarArtifact?.id ?? "no artifact"} / ${guestHandoff.routePlan.length} steps`
                : "Compose votes, calendar, voice, or workspace handoffs without treating reminders as Swiggy bookings or orders."}
            </p>
            {guestHandoff ? <small>{guestHandoff.nextAction}</small> : null}
          </div>
          <ul className="compact-status-list">
            {(guestCollaboration?.templates ?? []).slice(0, 5).map((templateItem) => (
              <li key={templateItem.id} data-status={templateItem.status === "ready" ? "healthy" : "watch"}>
                <span>{templateItem.title}</span>
                <strong>{templateItem.swiggyServers.map(serverLabel).join("/")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="luxury-experience-card">
          <div className="mini-heading">
            <Sparkles aria-hidden="true" />
            <strong>Luxury Experience Workspace</strong>
          </div>
          <span>
            {luxuryExperience
              ? `${luxuryExperience.score}/100, ${luxuryExperience.readyWorkspaces}/${luxuryExperience.totalWorkspaces} workspaces`
              : "Composing premium reservation, Food cart, Instamart basket, and recovery review surfaces"}
          </span>
          <div className="luxury-experience-grid">
            <div>
              <strong>
                {luxuryExperience?.readyModes ?? 0}/{luxuryExperience?.totalModes ?? 0}
              </strong>
              <span>Modes</span>
            </div>
            <div>
              <strong>
                {luxuryExperience?.readyArtifacts ?? 0}/{luxuryExperience?.totalArtifacts ?? 0}
              </strong>
              <span>Artifacts</span>
            </div>
            <div>
              <strong>{luxuryExperience?.uniqueToolsCovered ?? 0}</strong>
              <span>Tools</span>
            </div>
          </div>
          <form className="luxury-workspace-composer" onSubmit={runLuxuryWorkspaceComposer}>
            <label htmlFor="luxury-mode">Mode</label>
            <select
              id="luxury-mode"
              value={luxuryWorkspaceForm.modeId}
              onChange={(event) =>
                setLuxuryWorkspaceForm((current) => ({ ...current, modeId: event.target.value as LuxuryExperienceMode }))
              }
            >
              {(luxuryExperience?.modes ?? []).map((modeItem) => (
                <option key={modeItem.id} value={modeItem.id}>
                  {modeItem.label}
                </option>
              ))}
            </select>
            <label htmlFor="luxury-workspace">Workspace</label>
            <select
              id="luxury-workspace"
              value={luxuryWorkspaceForm.workspaceId}
              onChange={(event) => setLuxuryWorkspaceForm((current) => ({ ...current, workspaceId: event.target.value }))}
            >
              {(luxuryExperience?.workspaces ?? []).map((workspaceItem) => (
                <option key={workspaceItem.id} value={workspaceItem.id}>
                  {workspaceItem.title}
                </option>
              ))}
            </select>
            <label htmlFor="luxury-city">City</label>
            <select
              id="luxury-city"
              value={luxuryWorkspaceForm.city}
              onChange={(event) =>
                setLuxuryWorkspaceForm((current) => ({ ...current, city: event.target.value as typeof luxuryWorkspaceForm.city }))
              }
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
            </select>
            <div className="luxury-workspace-number-grid">
              <label htmlFor="luxury-guests">Guests</label>
              <input
                id="luxury-guests"
                type="number"
                min="1"
                max="50"
                value={luxuryWorkspaceForm.guestCount}
                onChange={(event) =>
                  setLuxuryWorkspaceForm((current) => ({ ...current, guestCount: Number(event.target.value) }))
                }
              />
            </div>
            <div className="luxury-workspace-number-grid">
              <label htmlFor="luxury-budget">Budget</label>
              <input
                id="luxury-budget"
                type="number"
                min="250"
                max="50000"
                step="50"
                value={luxuryWorkspaceForm.budget}
                onChange={(event) => setLuxuryWorkspaceForm((current) => ({ ...current, budget: Number(event.target.value) }))}
              />
            </div>
            <label className="luxury-workspace-toggle" htmlFor="luxury-dineout">
              <input
                id="luxury-dineout"
                type="checkbox"
                checked={luxuryWorkspaceForm.includeDineout}
                onChange={(event) =>
                  setLuxuryWorkspaceForm((current) => ({ ...current, includeDineout: event.target.checked }))
                }
              />
              Dineout confirmation
            </label>
            <button type="submit" disabled={luxuryWorkspaceStatus === "loading"} aria-label="Compose luxury workspace rehearsal">
              {luxuryWorkspaceStatus === "loading" ? <Loader2 aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
              Compose
            </button>
            {luxuryWorkspaceStatus === "error" ? <small role="status">Luxury workspace rehearsal unavailable.</small> : null}
          </form>
          <div
            className="luxury-workspace-result"
            data-status={
              luxuryWorkspaceComposition?.decision === "ready_review_workspace"
                ? "healthy"
                : luxuryWorkspaceComposition?.decision === "manual_confirmation_gate"
                  ? "watch"
                  : "blocked"
            }
          >
            <div>
              <span>Workspace</span>
              <strong>
                {luxuryWorkspaceComposition
                  ? `${luxuryWorkspaceComposition.decision.replace(/_/g, " ")} / ${luxuryWorkspaceComposition.readinessScore}`
                  : "Awaiting rehearsal"}
              </strong>
            </div>
            <p>
              {luxuryWorkspaceComposition
                ? `${luxuryWorkspaceComposition.selectedWorkspace?.id ?? "unknown"} / ${luxuryWorkspaceComposition.routePlan.length} steps / ${luxuryWorkspaceComposition.reviewArtifacts.length} artifacts`
                : "Prepare a premium review workspace without placing Food orders, Instamart checkout, or Dineout bookings."}
            </p>
            {luxuryWorkspaceComposition ? <small>{luxuryWorkspaceComposition.nextAction}</small> : null}
          </div>
          <ul className="compact-status-list">
            {(luxuryExperience?.workspaces ?? []).slice(0, 5).map((workspaceItem) => (
              <li key={workspaceItem.id} data-status={workspaceItem.status === "ready" ? "healthy" : "watch"}>
                <span>{workspaceItem.title}</span>
                <strong>{workspaceItem.swiggyServers.map(serverLabel).join("/")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="reviewer-artifact-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Reviewer Artifact Vault</strong>
          </div>
          <span>
            {reviewerArtifactVault
              ? `${reviewerArtifactVault.score}/100, ${reviewerArtifactVault.readyArtifacts}/${reviewerArtifactVault.totalArtifacts} artifacts`
              : "Packaging proof links, screenshots, logs, OpenAPI, commands, and Swiggy handoff copy"}
          </span>
          <div className="reviewer-artifact-grid">
            <div>
              <strong>
                {reviewerArtifactVault?.readyScreenshotTargets ?? 0}/{reviewerArtifactVault?.totalScreenshotTargets ?? 0}
              </strong>
              <span>Screenshots</span>
            </div>
            <div>
              <strong>
                {reviewerArtifactVault?.readyCommands ?? 0}/{reviewerArtifactVault?.totalCommands ?? 0}
              </strong>
              <span>Commands</span>
            </div>
            <div>
              <strong>{reviewerArtifactVault?.totalRedactionRules ?? 0}</strong>
              <span>Redactions</span>
            </div>
          </div>
          <form className="reviewer-packet-composer" onSubmit={runReviewerPacketComposer}>
            <label htmlFor="reviewer-section">Section</label>
            <select
              id="reviewer-section"
              value={reviewerPacketForm.sectionId}
              onChange={(event) => setReviewerPacketForm((current) => ({ ...current, sectionId: event.target.value }))}
            >
              {(reviewerArtifactVault?.artifactSections ?? []).map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
            <label htmlFor="reviewer-channel">Channel</label>
            <select
              id="reviewer-channel"
              value={reviewerPacketForm.channel}
              onChange={(event) =>
                setReviewerPacketForm((current) => ({
                  ...current,
                  channel: event.target.value as ReviewerArtifactPacketChannel,
                }))
              }
            >
              <option value="access_form">Access form</option>
              <option value="email_draft">Email draft</option>
              <option value="github_packet">GitHub packet</option>
            </select>
            <label htmlFor="reviewer-audience">Audience</label>
            <select
              id="reviewer-audience"
              value={reviewerPacketForm.audience}
              onChange={(event) =>
                setReviewerPacketForm((current) => ({
                  ...current,
                  audience: event.target.value as typeof reviewerPacketForm.audience,
                }))
              }
            >
              <option value="builder_access">Builder access</option>
              <option value="demo_review">Demo review</option>
              <option value="partner_support">Partner support</option>
            </select>
            <div className="reviewer-packet-toggle-grid">
              <label htmlFor="reviewer-screenshots">
                <input
                  id="reviewer-screenshots"
                  type="checkbox"
                  checked={reviewerPacketForm.includeScreenshots}
                  onChange={(event) =>
                    setReviewerPacketForm((current) => ({ ...current, includeScreenshots: event.target.checked }))
                  }
                />
                Screenshots
              </label>
              <label htmlFor="reviewer-demo-video">
                <input
                  id="reviewer-demo-video"
                  type="checkbox"
                  checked={reviewerPacketForm.includeDemoVideo}
                  onChange={(event) =>
                    setReviewerPacketForm((current) => ({ ...current, includeDemoVideo: event.target.checked }))
                  }
                />
                Demo video
              </label>
              <label htmlFor="reviewer-credentials">
                <input
                  id="reviewer-credentials"
                  type="checkbox"
                  checked={reviewerPacketForm.includeCredentialGates}
                  onChange={(event) =>
                    setReviewerPacketForm((current) => ({ ...current, includeCredentialGates: event.target.checked }))
                  }
                />
                Credentials
              </label>
            </div>
            <button type="submit" disabled={reviewerPacketStatus === "loading"} aria-label="Compose reviewer artifact packet">
              {reviewerPacketStatus === "loading" ? <Loader2 aria-hidden="true" /> : <ClipboardCheck aria-hidden="true" />}
              Compose
            </button>
            {reviewerPacketStatus === "error" ? <small role="status">Reviewer artifact packet unavailable.</small> : null}
          </form>
          <div
            className="reviewer-packet-result"
            data-status={
              reviewerPacket?.decision === "ready_packet"
                ? "healthy"
                : reviewerPacket?.decision === "manual_attachment_gate"
                  ? "watch"
                  : "blocked"
            }
          >
            <div>
              <span>Packet</span>
              <strong>
                {reviewerPacket
                  ? `${reviewerPacket.decision.replace(/_/g, " ")} / ${reviewerPacket.readinessScore}`
                  : "Awaiting packet"}
              </strong>
            </div>
            <p>
              {reviewerPacket
                ? `${reviewerPacket.selectedSection?.id ?? "unknown"} / ${reviewerPacket.includedArtifacts.length} artifacts / ${reviewerPacket.screenshotTargets.length} screenshots`
                : "Compose a Swiggy reviewer handoff with proof links, commands, screenshots, redaction rules, and manual gates."}
            </p>
            {reviewerPacket ? <small>{reviewerPacket.nextAction}</small> : null}
          </div>
          <ul className="compact-status-list">
            {(reviewerArtifactVault?.artifactSections ?? []).slice(0, 4).map((section) => (
              <li key={section.id} data-status={section.artifacts.every((artifactItem) => artifactItem.status === "ready") ? "healthy" : "watch"}>
                <span>{section.label}</span>
                <strong>{section.artifacts.length} items</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="review-decision-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Review Decision</strong>
          </div>
          <span>
            {reviewDecision
              ? `${reviewDecision.score}/100, ${reviewDecision.recommendationLabel}`
              : "Scoring Swiggy review fit, demo, security, source, credentials, ops, and go-live gates"}
          </span>
          <div className="review-decision-grid">
            <div>
              <strong>
                {reviewDecision?.totals.ready ?? 0}/{reviewDecision?.totals.gates ?? 0}
              </strong>
              <span>Ready</span>
            </div>
            <div>
              <strong>{reviewDecision?.totals.operatorInputs ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{reviewDecision?.totals.swiggyGates ?? 0}</strong>
              <span>Swiggy</span>
            </div>
            <div>
              <strong>{reviewDecision?.totals.proofLinks ?? 0}</strong>
              <span>Proofs</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(reviewDecision?.gates ?? []).slice(0, 5).map((gateItem) => (
              <li
                key={gateItem.id}
                data-status={
                  gateItem.status === "ready"
                    ? "healthy"
                    : gateItem.status === "swiggy_gate"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{gateItem.label}</span>
                <strong>{gateItem.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Review decision links">
            <a href="/api/swiggy-builders-review-decision" target="_blank" rel="noreferrer">
              Decision API
            </a>
            <a href="/api/access-submission-studio" target="_blank" rel="noreferrer">
              Access studio
            </a>
            <a href="/api/swiggy-access-evidence-matrix" target="_blank" rel="noreferrer">
              Evidence
            </a>
          </div>
        </article>

        <article className="visual-qa-card">
          <div className="mini-heading">
            <Camera aria-hidden="true" />
            <strong>Visual QA Center</strong>
          </div>
          <span>
            {visualQa
              ? `${visualQa.score}/100, ${visualQa.readyTargets}/${visualQa.totalTargets} targets`
              : "Checking reviewer screenshots, viewport rules, widget fallbacks, and mobile layout gates"}
          </span>
          <div className="visual-qa-grid">
            <div>
              <strong>
                {visualQa?.readyRules ?? 0}/{visualQa?.totalRules ?? 0}
              </strong>
              <span>Rules</span>
            </div>
            <div>
              <strong>
                {visualQa?.readyCommands ?? 0}/{visualQa?.totalCommands ?? 0}
              </strong>
              <span>Commands</span>
            </div>
            <div>
              <strong>{visualQa?.targetGroups.length ?? 0}</strong>
              <span>Groups</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(visualQa?.targetGroups ?? []).slice(0, 4).map((group) => (
              <li key={group.id} data-status={group.targets.every((targetItem) => targetItem.status === "ready") ? "healthy" : "watch"}>
                <span>{group.label}</span>
                <strong>{group.targets.length} targets</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="docs-coverage-card">
          <div className="mini-heading">
            <BookOpen aria-hidden="true" />
            <strong>Docs Coverage</strong>
          </div>
          <span>
            {docsCoverage
              ? `${docsCoverage.score}/100, ${docsCoverage.totalPages} llms.txt pages`
              : "Auditing every Swiggy docs page"}
          </span>
          <div className="docs-coverage-grid">
            <div>
              <strong>{docsCoverage?.sourceInventory.headerLinks ?? 0}</strong>
              <span>Header</span>
            </div>
            <div>
              <strong>{docsCoverage?.sourceInventory.footerLinks ?? 0}</strong>
              <span>Footer</span>
            </div>
            <div>
              <strong>{docsCoverage?.sourceInventory.ctas ?? 0}</strong>
              <span>CTAs</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(docsCoverage?.sections ?? []).map((section) => (
              <li key={section.section} data-status={section.requiresCredentials > 0 ? "watch" : "healthy"}>
                <span>{section.section}</span>
                <strong>{section.implemented}/{section.total}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="docs-twin-card">
          <div className="mini-heading">
            <ScrollText aria-hidden="true" />
            <strong>Docs Twin Explorer</strong>
          </div>
          <span>
            {docsTwinExplorer
              ? `${docsTwinExplorer.score}/100, ${docsTwinExplorer.totals.markdownTwins} markdown twins`
              : "Pairing Swiggy markdown twins with rendered pages and proof routes"}
          </span>
          <div className="docs-twin-grid">
            <div>
              <strong>{docsTwinExplorer?.totals.pages ?? 0}</strong>
              <span>Pages</span>
            </div>
            <div>
              <strong>{docsTwinExplorer?.totals.referenceTools ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{docsTwinExplorer?.retrievalLanes.length ?? 0}</strong>
              <span>Lanes</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(docsTwinExplorer?.groups ?? []).map((group) => (
              <li key={group.id} data-status={group.externalGates > 0 ? "blocked" : group.documented > 0 ? "watch" : "healthy"}>
                <span>{group.label}</span>
                <strong>{group.ready}/{group.total}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Docs twin links">
            <a href="/api/swiggy-docs-twin-explorer" target="_blank" rel="noreferrer">
              Open explorer
            </a>
            <a href="https://mcp.swiggy.com/builders/llms.txt" target="_blank" rel="noreferrer">
              llms.txt
            </a>
            <a href="https://mcp.swiggy.com/builders/llms-full.txt" target="_blank" rel="noreferrer">
              llms-full
            </a>
          </div>
        </article>

        <article className="llms-manifest-card">
          <div className="mini-heading">
            <BookOpen aria-hidden="true" />
            <strong>llms Manifest</strong>
          </div>
          <span>
            {llmsManifest
              ? `${llmsManifest.score}/100, ${llmsManifest.totals.liveLinks}/${llmsManifest.totals.expectedCoveragePages} live links`
              : "Parsing live Swiggy llms.txt"}
          </span>
          <div className="llms-manifest-grid">
            <div>
              <strong>{llmsManifest?.totals.referenceTools ?? 0}</strong>
              <span>Tool refs</span>
            </div>
            <div>
              <strong>{llmsManifest?.totals.unsafeLinks ?? 0}</strong>
              <span>Unsafe</span>
            </div>
            <div>
              <strong>{llmsManifest?.fetch.statusCode ?? "..."}</strong>
              <span>HTTP</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(llmsManifest?.serverToolCounts ?? []).map((server) => (
              <li
                key={server.server}
                data-status={server.status === "covered" ? "healthy" : server.status === "blocked" ? "blocked" : "watch"}
              >
                <span>{serverLabel(server.server)}</span>
                <strong>
                  {server.tools}/{server.expectedTools}
                </strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="llms manifest links">
            <a href="/api/swiggy-llms-manifest-verifier" target="_blank" rel="noreferrer">
              Manifest API
            </a>
            <a href="https://mcp.swiggy.com/builders/llms.txt" target="_blank" rel="noreferrer">
              llms.txt
            </a>
            <a href="/api/swiggy-docs-coverage" target="_blank" rel="noreferrer">
              Coverage
            </a>
          </div>
        </article>

        <article className="source-intelligence-card">
          <div className="mini-heading">
            <FileWarning aria-hidden="true" />
            <strong>Source Intelligence</strong>
          </div>
          <span>
            {sourceIntelligence
              ? `${sourceIntelligence.score}/100, ${sourceIntelligence.clusters.length} source clusters`
              : "Reconciling Swiggy website, docs, CTAs, APIs, and drift signals"}
          </span>
          <div className="source-intelligence-grid">
            <div>
              <strong>{sourceIntelligence?.inventory.toolReferenceTools ?? 0}</strong>
              <span>Tool refs</span>
            </div>
            <div>
              <strong>{sourceIntelligence?.driftSignals.length ?? 0}</strong>
              <span>Drift signals</span>
            </div>
            <div>
              <strong>{sourceIntelligence?.buildQueue.length ?? 0}</strong>
              <span>Queue</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(sourceIntelligence?.driftSignals ?? []).slice(0, 5).map((signal) => (
              <li
                key={signal.id}
                data-status={signal.severity === "blocking" ? "blocked" : signal.severity === "watch" ? "watch" : "healthy"}
              >
                <span>{signal.label}</span>
                <strong>{signal.severity}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Source intelligence links">
            <a href="/api/swiggy-source-intelligence" target="_blank" rel="noreferrer">
              Open report
            </a>
            {sourceEvidenceLinks.slice(0, 2).map((link) => (
              <a key={link} href={link} target="_blank" rel="noreferrer">
                {link.replace("/api/", "")}
              </a>
            ))}
            {officialSourceLinks.slice(0, 1).map((link) => (
              <a key={link} href={link} target="_blank" rel="noreferrer">
                Official source
              </a>
            ))}
          </div>
        </article>

        <article className="developer-quickstart-card">
          <div className="mini-heading">
            <Terminal aria-hidden="true" />
            <strong>Developer Quickstart</strong>
          </div>
          <span>
            {developerQuickstart
              ? `${developerQuickstart.score}/100, ${developerQuickstart.totals.firstCallDrills} first-call drills`
              : "Mapping Swiggy quickstart into first-call readiness"}
          </span>
          <div className="developer-quickstart-grid">
            <div>
              <strong>{developerQuickstart?.totals.steps ?? 0}</strong>
              <span>Steps</span>
            </div>
            <div>
              <strong>{developerQuickstart?.totals.frameworks ?? 0}</strong>
              <span>Frameworks</span>
            </div>
            <div>
              <strong>{developerQuickstart?.totals.authGates ?? 0}</strong>
              <span>Auth gates</span>
            </div>
            <div>
              <strong>{developerQuickstart ? "POST" : "-"}</strong>
              <span>Run drill</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(developerQuickstart?.firstCallDrills ?? []).slice(0, 4).map((drill) => (
              <li
                key={drill.id}
                data-status={drill.status === "ready" ? "healthy" : drill.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{drill.tool}</span>
                <strong>{drill.server}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Developer quickstart links">
            <a href="/api/swiggy-developer-quickstart" target="_blank" rel="noreferrer">
              Open workbench
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Run schema
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/start/developer/" target="_blank" rel="noreferrer">
              Quickstart
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/start/authenticate/" target="_blank" rel="noreferrer">
              OAuth docs
            </a>
          </div>
        </article>

        <article className="cta-execution-card">
          <div className="mini-heading">
            <MousePointerClick aria-hidden="true" />
            <strong>CTA Execution</strong>
          </div>
          <span>
            {ctaExecution
              ? `${ctaExecution.score}/100, ${ctaExecution.totals.targets} click targets`
              : "Preparing every Swiggy CTA, header, docs nav, and footer link"}
          </span>
          <div className="cta-execution-grid">
            <div>
              <strong>{ctaExecution?.totals.ready ?? 0}</strong>
              <span>Ready</span>
            </div>
            <div>
              <strong>{ctaExecution?.totals.operatorActions ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{ctaExecution?.totals.externalGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(ctaExecution?.groups ?? []).map((group) => (
              <li key={group.id} data-status={group.externalGates > 0 ? "blocked" : group.operatorActions > 0 ? "watch" : "healthy"}>
                <span>{group.label}</span>
                <strong>
                  {group.ready}/{group.total}
                </strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="CTA execution links">
            <a href="/api/swiggy-cta-execution-center" target="_blank" rel="noreferrer">
              Open matrix
            </a>
            <a href="https://mcp.swiggy.com/builders/" target="_blank" rel="noreferrer">
              Builders
            </a>
            <a href="mailto:builders@swiggy.in" target="_blank" rel="noreferrer">
              Email
            </a>
          </div>
        </article>

        <article className="cta-live-audit-card">
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>CTA Live Audit</strong>
          </div>
          <span>
            {ctaLiveAudit
              ? `${ctaLiveAudit.score}/100, ${ctaLiveAudit.totals.reachable}/${ctaLiveAudit.totals.probed} safe probes`
              : "Checking Swiggy CTA reachability and manual gates"}
          </span>
          <div className="cta-live-audit-grid">
            <div>
              <strong>{ctaLiveAudit?.totals.reachable ?? 0}</strong>
              <span>Reachable</span>
            </div>
            <div>
              <strong>{ctaLiveAudit?.totals.manualGates ?? 0}</strong>
              <span>Manual</span>
            </div>
            <div>
              <strong>{ctaLiveAudit?.totals.unsafe ?? 0}</strong>
              <span>Unsafe</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(ctaLiveAudit?.rows ?? []).slice(0, 5).map((row) => (
              <li
                key={row.id}
                data-status={row.status === "reachable" ? "healthy" : row.status === "manual_gate" ? "watch" : "blocked"}
              >
                <span>{row.label}</span>
                <strong>{row.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="CTA live audit links">
            <a href="/api/swiggy-cta-live-audit" target="_blank" rel="noreferrer">
              Live audit
            </a>
            <a href="/api/swiggy-cta-execution-center" target="_blank" rel="noreferrer">
              Matrix
            </a>
            <a href="/api/swiggy-builders-page-mesh" target="_blank" rel="noreferrer">
              Pages
            </a>
          </div>
        </article>

        <article className="innovation-radar-card">
          <div className="mini-heading">
            <Sparkles aria-hidden="true" />
            <strong>Innovation Radar</strong>
          </div>
          <span>
            {innovationRadar
              ? `${innovationRadar.score}/100, ${innovationRadar.opportunityCount} premium lanes`
              : "Mapping Swiggy source signals to premium MealPilot product lanes"}
          </span>
          <div className="innovation-radar-grid">
            <div>
              <strong>{innovationRadar?.officialInputs.length ?? 0}</strong>
              <span>Source signals</span>
            </div>
            <div>
              <strong>{innovationRadar?.routeOptimizations.length ?? 0}</strong>
              <span>Route wins</span>
            </div>
            <div>
              <strong>{innovationRadar?.buildPhases.length ?? 0}</strong>
              <span>Phases</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(innovationRadar?.opportunityLanes ?? []).slice(0, 5).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "staging_gate" ? "watch" : "blocked"}
              >
                <span>{lane.label}</span>
                <strong>{lane.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Innovation radar links">
            <a href="/api/swiggy-innovation-radar" target="_blank" rel="noreferrer">
              Open radar
            </a>
            <a href="/api/premium-use-case-studio" target="_blank" rel="noreferrer">
              Use cases
            </a>
            <a href="/api/swiggy-growth-partnership" target="_blank" rel="noreferrer">
              Growth
            </a>
          </div>
        </article>

        <article className="upstream-watch-card">
          <div className="mini-heading">
            <RefreshCw aria-hidden="true" />
            <strong>Upstream Watch</strong>
          </div>
          <span>
            {upstreamWatch
              ? `${upstreamWatch.score}/100, ${upstreamWatch.roadmapItems.length} roadmap watches`
              : "Tracking Swiggy docs and changelog"}
          </span>
          <div className="upstream-watch-grid">
            <div>
              <strong>{upstreamWatch?.releaseTimeline.length ?? 0}</strong>
              <span>Releases</span>
            </div>
            <div>
              <strong>{upstreamWatch?.actionQueue.length ?? 0}</strong>
              <span>Actions</span>
            </div>
            <div>
              <strong>{upstreamWatch?.signedManifestWatch.status ?? "pending"}</strong>
              <span>Manifest</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(upstreamWatch?.roadmapItems ?? []).slice(0, 5).map((item) => (
              <li
                key={item.id}
                data-status={item.status === "external_gate" ? "watch" : item.status}
              >
                <span>{item.item}</span>
                <strong>{item.version}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="client-connect-card">
          <div className="mini-heading">
            <GitBranch aria-hidden="true" />
            <strong>AI Client Connect</strong>
          </div>
          <span>
            {aiClientConnectKit
              ? `${aiClientConnectKit.score}/100, ${aiClientConnectKit.clientTargets.length} clients`
              : "Building client configs"}
          </span>
          <div className="client-connect-grid">
            <div>
              <strong>{aiClientConnectKit?.servers.reduce((sum, server) => sum + server.tools, 0) ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{aiClientConnectKit?.codingAgentRules.length ?? 0}</strong>
              <span>Rules</span>
            </div>
            <div>
              <strong>{aiClientConnectKit?.sdkAdapters.length ?? 0}</strong>
              <span>SDKs</span>
            </div>
            <div>
              <strong>{aiClientConnectKit ? "POST" : "-"}</strong>
              <span>Validate</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(aiClientConnectKit?.clientTargets ?? []).slice(0, 5).map((target) => (
              <li key={target.id} data-status={target.status === "external_client" ? "watch" : "healthy"}>
                <span>{target.label}</span>
                <strong>{target.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="coding-agent-card">
          <div className="mini-heading">
            <Bot aria-hidden="true" />
            <strong>Coding Agent Governance</strong>
          </div>
          <span>
            {codingAgentGovernance
              ? `${codingAgentGovernance.score}/100, ${codingAgentGovernance.ruleFile.status.replaceAll("_", " ")}`
              : "Verifying AGENTS.md against Swiggy docs"}
          </span>
          <div className="coding-agent-grid">
            <div>
              <strong>
                {codingAgentGovernance?.ruleFile.matchedSignals ?? 0}/{codingAgentGovernance?.ruleFile.totalSignals ?? 0}
              </strong>
              <span>Signals</span>
            </div>
            <div>
              <strong>{codingAgentGovernance?.officialSources.length ?? 0}</strong>
              <span>Sources</span>
            </div>
            <div>
              <strong>{codingAgentGovernance?.smokeTests.filter((test) => test.status === "ready").length ?? 0}</strong>
              <span>Smoke tests</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(codingAgentGovernance?.requiredSignals ?? []).slice(0, 5).map((signal) => (
              <li
                key={signal.id}
                data-status={signal.status === "ready" ? "healthy" : signal.status === "missing" ? "blocked" : "watch"}
              >
                <span>{signal.label}</span>
                <strong>{signal.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Coding agent governance links">
            <a href="/api/coding-agent-governance" target="_blank" rel="noreferrer">
              Open governance
            </a>
            <a href="https://mcp.swiggy.com/builders/llms.txt" target="_blank" rel="noreferrer">
              llms index
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/start/coding-agents/" target="_blank" rel="noreferrer">
              Agent docs
            </a>
          </div>
        </article>

        <article className="brand-compliance-card">
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Brand Compliance</strong>
          </div>
          <span>
            {brandCompliance
              ? `${brandCompliance.score}/100, ${brandCompliance.surfaces.length} surfaces`
              : "Checking Swiggy attribution"}
          </span>
          <div className="brand-compliance-grid">
            <div>
              <strong>{brandCompliance?.rules.filter((rule) => rule.status === "ready").length ?? 0}</strong>
              <span>Rules ready</span>
            </div>
            <div>
              <strong>{brandCompliance?.assetGates.length ?? 0}</strong>
              <span>Asset gates</span>
            </div>
            <div>
              <strong>{brandCompliance?.paletteAudit.status ?? "pending"}</strong>
              <span>Palette</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(brandCompliance?.rules ?? []).slice(0, 4).map((rule) => (
              <li key={rule.id} data-status={rule.status === "ready" ? "healthy" : "watch"}>
                <span>{rule.label}</span>
                <strong>{rule.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="builders-map-card">
          <div className="mini-heading">
            <Sparkles aria-hidden="true" />
            <strong>Innovation Queue</strong>
          </div>
          <span>
            {buildersMap
              ? `${buildersMap.opportunities.length} Swiggy-native opportunities ranked`
              : "Loading opportunity map"}
          </span>
          <ul className="opportunity-list">
            {(buildersMap?.opportunities ?? []).slice(0, 4).map((opportunity) => (
              <li key={opportunity.id}>
                <div>
                  <strong>{opportunity.title}</strong>
                  <span>{opportunity.swiggyCapability}</span>
                </div>
                <b>{opportunity.impactScore}</b>
              </li>
            ))}
          </ul>
        </article>

        <article className="credential-card">
          <div className="mini-heading">
            <LockKeyhole aria-hidden="true" />
            <strong>Credential Cockpit</strong>
          </div>
          <span>
            {credentialOnboarding
              ? `${credentialOnboarding.score}/100, ${credentialReadyChecks}/${credentialTotalChecks} checks ready`
              : "Loading OAuth and DCR posture"}
          </span>
          <div className="credential-meta-grid">
            <div>
              <strong>{credentialOnboarding?.dynamicClientRegistration.mode.replaceAll("_", " ") ?? "loading"}</strong>
              <span>DCR mode</span>
            </div>
            <div>
              <strong>{credentialOnboarding?.redirectUriAudit.status ?? "pending"}</strong>
              <span>Redirect URI</span>
            </div>
            <div>
              <strong>{credentialOnboarding?.scopes.length ?? 0}/3</strong>
              <span>MCP scopes</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(credentialOnboarding?.checks ?? []).slice(0, 4).map((check) => (
              <li key={check.id} data-status={check.status}>
                <span>{check.label}</span>
                <strong>{check.status}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="credential-vault-card">
          <div className="mini-heading">
            <LockKeyhole aria-hidden="true" />
            <strong>Credential Vault</strong>
          </div>
          <span>
            {credentialVault
              ? `${credentialVault.score}/100, ${credentialVault.totals.configured}/${credentialVault.totals.secrets} configured`
              : "Checking runtime secrets, redaction, rotation, and cutover gates"}
          </span>
          <div className="credential-vault-grid">
            <div>
              <strong>{credentialVault?.totals.ready ?? 0}</strong>
              <span>Ready</span>
            </div>
            <div>
              <strong>{credentialVault?.totals.operatorInputs ?? 0}</strong>
              <span>Inputs</span>
            </div>
            <div>
              <strong>{credentialVault?.totals.swiggyGates ?? 0}</strong>
              <span>Swiggy gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(credentialVault?.secrets ?? []).slice(0, 5).map((secretItem) => (
              <li
                key={secretItem.id}
                data-status={
                  secretItem.status === "ready"
                    ? "healthy"
                    : secretItem.status === "blocked"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{secretItem.label}</span>
                <strong>{secretItem.envVar}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Credential vault links">
            <a href="/api/swiggy-credential-vault-center" target="_blank" rel="noreferrer">
              Vault API
            </a>
            <a href="/api/credential-onboarding" target="_blank" rel="noreferrer">
              Onboarding
            </a>
            <a href="/api/mcp-gateway" target="_blank" rel="noreferrer">
              Gateway
            </a>
          </div>
        </article>

        <article className="credential-handoff-card">
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Credential Handoff</strong>
          </div>
          <span>
            {credentialHandoff
              ? `${credentialHandoff.score}/100, ${credentialHandoff.totals.ready}/${credentialHandoff.totals.phases} phases ready`
              : "Sequencing localhost proof, OAuth, staging credentials, and promotion"}
          </span>
          <div className="credential-handoff-grid">
            <div>
              <strong>{credentialHandoff?.totals.operatorInputs ?? 0}</strong>
              <span>Operator</span>
            </div>
            <div>
              <strong>{credentialHandoff?.totals.swiggyGates ?? 0}</strong>
              <span>Swiggy gates</span>
            </div>
            <div>
              <strong>{credentialHandoff?.totals.controls ?? 0}</strong>
              <span>Controls</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(credentialHandoff?.phases ?? []).slice(0, 5).map((phaseItem) => (
              <li
                key={phaseItem.id}
                data-status={
                  phaseItem.status === "ready"
                    ? "healthy"
                    : phaseItem.status === "blocked"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{phaseItem.label}</span>
                <strong>{phaseItem.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Credential handoff links">
            <a href="/api/swiggy-credential-handoff-center" target="_blank" rel="noreferrer">
              Handoff API
            </a>
            <a href="/api/swiggy-staging-credential-drill" target="_blank" rel="noreferrer">
              Staging drill
            </a>
            <a href="mailto:builders@swiggy.in" target="_blank" rel="noreferrer">
              Email
            </a>
          </div>
        </article>

        <article className="sandbox-workbench-card">
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Sandbox Credentials</strong>
          </div>
          <span>
            {sandboxCredentialWorkbench
              ? `${sandboxCredentialWorkbench.score}/100, ${sandboxCredentialWorkbench.lanes.length} credential lanes`
              : "Mapping localhost, staging, and production credential gates"}
          </span>
          <div className="sandbox-workbench-grid">
            <div>
              <strong>{sandboxCredentialWorkbench ? sandboxCredentialWorkbench.seededDataPlan.length : "Loading"}</strong>
              <span>Seeded servers</span>
            </div>
            <div>
              <strong>
                {sandboxCredentialWorkbench ? `${sandboxCredentialWorkbench.stagingPromotion.soakHoursRequired}h` : "Loading"}
              </strong>
              <span>Soak</span>
            </div>
            <div>
              <strong>
                {sandboxCredentialWorkbench
                  ? `${sandboxCredentialWorkbench.stagingPromotion.assignedTools}/${sandboxCredentialWorkbench.stagingPromotion.totalTools}`
                  : "Loading"}
              </strong>
              <span>Tools</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {sandboxCredentialWorkbench ? (
              sandboxCredentialWorkbench.lanes.map((laneItem) => (
                <li
                  key={laneItem.id}
                  data-status={
                    laneItem.status === "ready"
                      ? "healthy"
                      : laneItem.status === "blocked"
                        ? "blocked"
                        : "watch"
                  }
                >
                  <span>{laneItem.label}</span>
                  <strong>{laneItem.status.replaceAll("_", " ")}</strong>
                </li>
              ))
            ) : (
              <li data-status="watch">
                <span>Credential lanes</span>
                <strong>Loading</strong>
              </li>
            )}
          </ul>
        </article>

        <article className="enterprise-auth-card">
          <div className="mini-heading">
            <Users aria-hidden="true" />
            <strong>Delegated Auth Center</strong>
          </div>
          <span>
            {enterpriseDelegatedAuth
              ? `${enterpriseDelegatedAuth.score}/100, ${enterpriseDelegatedAuth.flow.length} OBO steps`
              : "Loading enterprise on-behalf-of flow"}
          </span>
          <div className="enterprise-auth-grid">
            <div>
              <strong>
                {enterpriseReadySteps}/{enterpriseDelegatedAuth?.flow.length ?? 0}
              </strong>
              <span>Flow ready</span>
            </div>
            <div>
              <strong>{enterpriseDelegatedAuth?.platformUseCases.length ?? 0}</strong>
              <span>Use cases</span>
            </div>
            <div>
              <strong>{enterpriseTokenLifetime}</strong>
              <span>Token life</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(enterpriseDelegatedAuth?.architectureReview ?? []).slice(0, 4).map((item) => (
              <li
                key={item.topic}
                data-status={item.status === "external_gate" ? "watch" : item.status}
              >
                <span>{item.topic}</span>
                <strong>{item.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <Radio aria-hidden="true" />
            <strong>MCP Gateway</strong>
          </div>
          <span>
            {gateway
              ? `${gateway.readinessScore}/100, ${gateway.activeTransport.replace("_", " ")}`
              : "Loading transport"}
          </span>
          <ul className="compact-status-list">
            {(gateway?.requestedServers ?? []).map((server) => (
              <li key={server.server} data-status={server.status === "blocked" ? "watch" : "healthy"}>
                <span>{serverLabel(server.server)}</span>
                <strong>{server.status}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="handshake-doctor-card">
          <div className="mini-heading">
            <Terminal aria-hidden="true" />
            <strong>Handshake Doctor</strong>
          </div>
          <span>
            {handshakeDoctor
              ? `${handshakeDoctor.score}/100, ${handshakeDoctor.totals.ready}/${handshakeDoctor.totals.probes} probes ready`
              : "Running safe OAuth and endpoint probes"}
          </span>
          <div className="handshake-doctor-grid">
            <div>
              <strong>{handshakeDoctor?.authMetadata.pkceS256 ? "S256" : "Pending"}</strong>
              <span>PKCE</span>
            </div>
            <div>
              <strong>{handshakeDoctor?.authMetadata.scopes.length ?? 0}/3</strong>
              <span>Scopes</span>
            </div>
            <div>
              <strong>{handshakeDoctor?.totals.liveHttpCalls ?? 0}</strong>
              <span>Safe probes</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(handshakeDoctor?.serverEndpoints ?? []).map((endpoint) => (
              <li
                key={endpoint.server}
                data-status={
                  endpoint.status === "ready" ? "healthy" : endpoint.status === "blocked" ? "blocked" : "watch"
                }
              >
                <span>{serverLabel(endpoint.server)}</span>
                <strong>{endpoint.expectedPath}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Handshake doctor links">
            <a href="/api/mcp/handshake-doctor" target="_blank" rel="noreferrer">
              Doctor API
            </a>
            <a href="/api/swiggy-handshake-doctor" target="_blank" rel="noreferrer">
              Product API
            </a>
            <a href="https://mcp.swiggy.com/builders/docs/start/authenticate/" target="_blank" rel="noreferrer">
              OAuth docs
            </a>
          </div>
        </article>

        <article>
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Go-Live Gates</strong>
          </div>
          <ul className="compact-status-list">
            {goLiveChecks.slice(0, 5).map((check) => (
              <li key={check.id} data-status={check.status}>
                <span>{check.label}</span>
                <strong>{check.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <Activity aria-hidden="true" />
            <strong>Observability</strong>
          </div>
          <ul className="compact-status-list">
            {observabilityMetrics.slice(0, 4).map((metric) => (
              <li key={metric.id} data-status={metric.status}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Rollout</strong>
          </div>
          <span>{rollout ? `${rollout.pilotUsers} pilot users, ${rollout.expectedPeakQps}` : "Pilot plan loading"}</span>
          <ol>
            {(rollout?.ramp ?? []).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="support-bridge-card">
          <div className="mini-heading">
            <LifeBuoy aria-hidden="true" />
            <strong>Support Bridge</strong>
          </div>
          <span>
            {supportBridge
              ? `${supportBridge.score}/100, ${supportBridge.reportErrorTools.length} report_error tools`
              : "Preparing runtime support bridge"}
          </span>
          <div className="support-bridge-grid">
            <div>
              <strong>{supportBridge?.reportErrorTools.length ?? 0}</strong>
              <span>Servers</span>
            </div>
            <div>
              <strong>{supportBridge ? "POST" : "-"}</strong>
              <span>Report gate</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(supportBridge?.reportErrorTools ?? []).map((report) => (
              <li key={report.id} data-status={report.status === "ready" ? "healthy" : "watch"}>
                <span>{serverLabel(report.server)}</span>
                <strong>{report.failedTool}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/support/bridge" target="_blank" rel="noreferrer">
              Bridge API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Report schema
            </a>
          </div>
        </article>

        <article>
          <div className="mini-heading">
            <FileWarning aria-hidden="true" />
            <strong>Support Report</strong>
          </div>
          <p>{incidentReport?.summary ?? "Generate a Swiggy-ready support report with session ids and next steps."}</p>
          <button type="button" onClick={onCreateReport}>
            Generate report
          </button>
          {incidentReport ? (
            <a className="support-link" href={incidentReport.mailto}>
              Email builders@swiggy.in
            </a>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function DemoStudioPanel({
  preflight,
  replay,
  stagingTranscript,
  steps,
  submissionPackage,
  submissionConsole,
  accessSubmissionStudio,
  accessSubmissionForm,
  builderPacketExport,
  onAccessSubmissionFormChange,
  onAccessSubmissionSave,
}: {
  preflight: CartPreflightReport | null;
  replay: McpReplayStep[];
  stagingTranscript: StagingTranscriptExport | null;
  steps: DemoStudioStep[];
  submissionPackage: SubmissionPackage | null;
  submissionConsole: SubmissionConsole | null;
  accessSubmissionStudio: AccessSubmissionStudio | null;
  accessSubmissionForm: AccessSubmissionHandoffState;
  builderPacketExport: BuilderPacketExport | null;
  onAccessSubmissionFormChange: (state: AccessSubmissionHandoffState) => void;
  onAccessSubmissionSave: () => void;
}) {
  const readyFields = submissionPackage?.fields.filter((field) => field.status === "ready").length ?? 0;
  const totalFields = submissionPackage?.fields.length ?? 0;
  const updateAccessField = (field: keyof AccessSubmissionHandoffState, value: string | boolean | undefined) => {
    onAccessSubmissionFormChange({ ...accessSubmissionForm, [field]: value });
  };

  return (
    <section className="analysis-panel demo-studio-panel" id="demo-studio">
      <div className="section-heading">
        <ClipboardCheck aria-hidden="true" />
        <h2>Demo Studio</h2>
      </div>

      <div className="demo-studio-grid">
        <article>
          <div className="mini-heading">
            <ShieldCheck aria-hidden="true" />
            <strong>Cart Preflight</strong>
          </div>
          <span>{preflight ? `${preflight.overall.replace("_", " ")} - ${formatMoney(preflight.total)}` : "No active plan"}</span>
          <ul className="compact-status-list">
            {(preflight?.checks ?? []).slice(0, 5).map((check) => (
              <li key={check.id} data-status={check.status === "pass" ? "healthy" : "watch"}>
                <span>{check.label}</span>
                <strong>{check.status}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <Sparkles aria-hidden="true" />
            <strong>Offers</strong>
          </div>
          <ul className="offer-list">
            {(preflight?.offers ?? []).map((offer) => (
              <li key={offer.id}>
                <strong>{offer.code}</strong>
                <span>
                  {offer.status} - {formatMoney(offer.estimatedSavings)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <Database aria-hidden="true" />
            <strong>MCP Replay</strong>
          </div>
          <span>{replay.length} JSON-RPC step(s)</span>
          <ol className="replay-list">
            {replay.slice(0, 5).map((step) => (
              <li key={step.id}>
                <strong>{step.tool}</strong>
                <span>{serverLabel(step.server)} - {step.retryPolicy}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="staging-transcript-card">
          <div className="mini-heading">
            <FileWarning aria-hidden="true" />
            <strong>Staging Transcript</strong>
          </div>
          <span>
            {stagingTranscript
              ? `${stagingTranscript.score}/100, ${stagingTranscript.totalEntries} redacted entries`
              : "Run a plan to export staging evidence"}
          </span>
          <div className="staging-transcript-grid">
            <div>
              <strong>{stagingTranscript?.coveredServers.length ?? 0}/3</strong>
              <span>Servers</span>
            </div>
            <div>
              <strong>{stagingTranscript?.certificationWaves.length ?? 0}</strong>
              <span>Waves</span>
            </div>
            <div>
              <strong>{stagingTranscript?.files.length ?? 0}</strong>
              <span>Files</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(stagingTranscript?.readiness ?? []).slice(0, 4).map((item) => (
              <li key={item.id} data-status={item.status === "ready" ? "healthy" : "watch"}>
                <span>{item.label}</span>
                <strong>{item.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <Play aria-hidden="true" />
            <strong>Demo Run</strong>
          </div>
          <ul className="compact-status-list">
            {steps.slice(0, 6).map((step) => (
              <li key={step.id} data-status={step.status === "done" ? "healthy" : "watch"}>
                <span>{step.label}</span>
                <strong>{step.status}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="submission-card">
          <div className="mini-heading">
            <FileWarning aria-hidden="true" />
            <strong>Submission Package</strong>
          </div>
          <span>
            {readyFields}/{totalFields} fields ready
          </span>
          <div className="submission-grid">
            {(submissionPackage?.fields ?? []).slice(0, 8).map((field) => (
              <div key={field.id} data-status={field.status}>
                <strong>{field.label}</strong>
                <span>{field.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="submission-console-card">
          <div className="mini-heading">
            <Rocket aria-hidden="true" />
            <strong>Submission Console</strong>
          </div>
          <span>
            {submissionConsole
              ? `${submissionConsole.score}/100, ${submissionConsole.recommendedTrack} track`
              : "Preparing access handoff"}
          </span>
          <div className="submission-console-grid">
            <div>
              <strong>
                {submissionConsole
                  ? `${submissionConsole.readyRequirements}/${submissionConsole.totalRequirements}`
                  : "0/0"}
              </strong>
              <span>Requirements</span>
            </div>
            <div>
              <strong>
                {submissionConsole
                  ? `${submissionConsole.readyAttachments}/${submissionConsole.totalAttachments}`
                  : "0/0"}
              </strong>
              <span>Attachments</span>
            </div>
            <div>
              <strong>{submissionConsole?.packetOrder.length ?? 0}</strong>
              <span>Packet order</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(submissionConsole?.runbook ?? []).slice(0, 5).map((step) => (
              <li
                key={step.id}
                data-status={
                  step.status === "ready" ? "healthy" : step.status === "blocked" ? "blocked" : "watch"
                }
              >
                <span>{step.label}</span>
                <strong>{step.owner}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="access-submission-card">
          <div className="mini-heading">
            <Rocket aria-hidden="true" />
            <strong>Access Submission Studio</strong>
          </div>
          <span>
            {accessSubmissionStudio
              ? `${accessSubmissionStudio.score}/100, ${accessSubmissionStudio.submitReadinessLabel}`
              : "Preparing final Swiggy access submission room"}
          </span>
          <div className="access-submission-grid">
            <div>
              <strong>
                {accessSubmissionStudio
                  ? `${accessSubmissionStudio.totals.readyCopyBlocks}/${accessSubmissionStudio.totals.totalCopyBlocks}`
                  : "Loading"}
              </strong>
              <span>Copy blocks</span>
            </div>
            <div>
              <strong>
                {accessSubmissionStudio
                  ? `${accessSubmissionStudio.totals.readyRequiredAttachments}/${accessSubmissionStudio.totals.totalRequiredAttachments}`
                  : "Loading"}
              </strong>
              <span>Attachments</span>
            </div>
            <div>
              <strong>{accessSubmissionStudio ? accessSubmissionStudio.totals.externalGates : "Loading"}</strong>
              <span>External gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(accessSubmissionStudio?.browserRunbook ?? []).slice(0, 6).map((step) => (
              <li
                key={step.id}
                data-status={step.status === "ready" ? "healthy" : step.status === "blocked" ? "blocked" : "watch"}
              >
                <span>{step.label}</span>
                <strong>{step.owner}</strong>
              </li>
            ))}
          </ul>
          <div className="access-submission-actions">
            {(accessSubmissionStudio?.officialTargets ?? []).map((target) => (
              <a key={target.id} href={target.url} target={target.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {target.cta}
              </a>
            ))}
            {accessSubmissionStudio ? <a href={accessSubmissionStudio.mailto.href}>Email builders@swiggy.in</a> : null}
          </div>
          <div className="access-submission-form">
            <label>
              <span>Demo URL</span>
              <input
                value={accessSubmissionForm.demoVideoUrl}
                onChange={(event) => updateAccessField("demoVideoUrl", event.target.value)}
                placeholder="https://loom.com/share/..."
              />
            </label>
            <label>
              <span>Security contact</span>
              <input
                value={accessSubmissionForm.technicalContactEmail}
                onChange={(event) => updateAccessField("technicalContactEmail", event.target.value)}
                placeholder="engineering@example.com"
              />
            </label>
            <label>
              <span>Production redirect</span>
              <input
                value={accessSubmissionForm.productionRedirectUri}
                onChange={(event) => updateAccessField("productionRedirectUri", event.target.value)}
                placeholder="https://app.example.com/auth/swiggy/callback"
              />
            </label>
            <label>
              <span>Static egress/IP</span>
              <input
                value={accessSubmissionForm.staticEgressIp}
                onChange={(event) => updateAccessField("staticEgressIp", event.target.value)}
                placeholder="203.0.113.10/32"
              />
            </label>
            <label className="access-submission-wide">
              <span>Environment summary</span>
              <input
                value={accessSubmissionForm.environmentSummary}
                onChange={(event) => updateAccessField("environmentSummary", event.target.value)}
                placeholder="Render web service, HTTPS, secret env vars, production build"
              />
            </label>
            <label className="access-submission-check">
              <input
                type="checkbox"
                checked={accessSubmissionForm.termsAcknowledged}
                onChange={(event) => updateAccessField("termsAcknowledged", event.target.checked)}
              />
              <span>Terms acknowledged</span>
            </label>
            <div className="access-submission-actions access-submission-wide">
              <button
                type="button"
                onClick={() => updateAccessField("formSubmittedAt", new Date().toISOString())}
              >
                Mark form submitted
              </button>
              <button
                type="button"
                onClick={() => updateAccessField("handoffEmailSentAt", new Date().toISOString())}
              >
                Mark email sent
              </button>
              <button type="button" onClick={onAccessSubmissionSave}>
                Save handoff state
              </button>
            </div>
          </div>
        </article>

        <article className="builder-packet-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Builder Packet Export</strong>
          </div>
          <span>
            {builderPacketExport
              ? `${builderPacketExport.score}/100, ${builderPacketExport.totals.packetFiles} files`
              : "Preparing Swiggy access packet export"}
          </span>
          <div className="submission-console-grid">
            <div>
              <strong>
                {builderPacketExport
                  ? `${builderPacketExport.totals.readyFields}/${builderPacketExport.totals.formFields}`
                  : "0/0"}
              </strong>
              <span>Fields</span>
            </div>
            <div>
              <strong>
                {builderPacketExport
                  ? `${builderPacketExport.totals.readyAttachments}/${builderPacketExport.totals.requiredAttachments}`
                  : "0/0"}
              </strong>
              <span>Attachments</span>
            </div>
            <div>
              <strong>{builderPacketExport?.totals.visualTargets ?? 0}</strong>
              <span>Visual targets</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(builderPacketExport?.readiness ?? []).slice(0, 5).map((item) => (
              <li
                key={item.id}
                data-status={item.status === "ready" ? "healthy" : item.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{item.label}</span>
                <strong>{item.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function ProductionEvidencePanel({
  widgets,
  widgetBridge,
  rateLimit,
  trafficReadiness,
  backpressureGovernor,
  versionMonitor,
  complianceEvidence,
  dataGovernance,
  reviewerProof,
  launchBundle,
  errorIntelligence,
  resilienceDrills,
  resilienceRunbook,
  observabilityTraceReport,
  runtimeTelemetry,
  auditLedger,
  sloIncident,
  loadLab,
  quotaNegotiation,
  offerIntelligence,
  orderLifecycle,
  locationTrust,
  cartMutation,
  discoveryFreshness,
  confirmationCommandCenter,
  cancellationCareCenter,
  dineoutPrecisionCenter,
  authLifecycleCenter,
  enterprisePlatformCenter,
  routeOptimizer,
  evaluationLab,
}: {
  widgets: SwiggyWidget[];
  widgetBridge: { origin: string; sandbox: string; verifyOrigin: boolean } | null;
  rateLimit: RateLimitPlan | null;
  trafficReadiness: TrafficReadinessPlan | null;
  backpressureGovernor: McpBackpressureGovernorReport | null;
  versionMonitor: VersionMonitor | null;
  complianceEvidence: ComplianceEvidence | null;
  dataGovernance: DataGovernanceCenter | null;
  reviewerProof: ReviewerProof | null;
  launchBundle: LaunchBundle | null;
  errorIntelligence: ErrorIntelligenceReport | null;
  resilienceDrills: ResilienceDrill[];
  resilienceRunbook: ResilienceRunbook | null;
  observabilityTraceReport: ObservabilityTraceReport | null;
  runtimeTelemetry: RuntimeTelemetryReport | null;
  auditLedger: AuditLedgerCenter | null;
  sloIncident: SloIncidentCommandCenter | null;
  loadLab: SwiggyLoadLabReport | null;
  quotaNegotiation: SwiggyQuotaNegotiationCenter | null;
  offerIntelligence: SwiggyOfferIntelligenceReport | null;
  orderLifecycle: SwiggyOrderLifecycleReport | null;
  locationTrust: SwiggyLocationTrustReport | null;
  cartMutation: SwiggyCartMutationReport | null;
  discoveryFreshness: SwiggyDiscoveryFreshnessReport | null;
  confirmationCommandCenter: SwiggyConfirmationCommandCenterReport | null;
  cancellationCareCenter: SwiggyCancellationCareCenterReport | null;
  dineoutPrecisionCenter: SwiggyDineoutPrecisionCenterReport | null;
  authLifecycleCenter: SwiggyAuthLifecycleCenterReport | null;
  enterprisePlatformCenter: EnterprisePlatformCenterReport | null;
  routeOptimizer: SwiggyRouteOptimizationReport | null;
  evaluationLab: EvaluationLab | null;
}) {
  const passedDrills = resilienceDrills.filter((drill) => drill.status === "pass").length;

  return (
    <section className="analysis-panel production-evidence-panel" id="production-evidence">
      <div className="section-heading">
        <ShieldCheck aria-hidden="true" />
        <h2>Production Evidence</h2>
      </div>

      <div className="production-evidence-grid">
        <article className="widget-card">
          <div className="mini-heading">
            <MessageSquare aria-hidden="true" />
            <strong>Widget Contracts</strong>
          </div>
          <span>
            {widgets.length} contract(s), origin {widgetBridge?.origin ?? "pending"}
          </span>
          <ul className="widget-list">
            {widgets.slice(0, 5).map((widget) => (
              <li key={widget.id}>
                <strong>{widget.type}</strong>
                <span>{widget.title}</span>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Rate Plan</strong>
          </div>
          <span>{rateLimit ? `${rateLimit.projectedDailyToolCalls.toLocaleString("en-IN")} projected calls/day` : "Loading"}</span>
          <ul className="compact-status-list">
            {(rateLimit?.budgets ?? []).slice(0, 4).map((budget) => (
              <li key={budget.scope} data-status={budget.status === "under_limit" ? "healthy" : "watch"}>
                <span>{budget.scope}</span>
                <strong>{budget.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="traffic-readiness-card">
          <div className="mini-heading">
            <Activity aria-hidden="true" />
            <strong>Traffic Readiness</strong>
          </div>
          <span>
            {trafficReadiness
              ? `${trafficReadiness.score}/100, ${trafficReadiness.projectedDailyToolCalls.toLocaleString("en-IN")} calls/day`
              : "Loading capacity profile"}
          </span>
          <div className="traffic-readiness-grid">
            <div>
              <strong>Peak QPS</strong>
              <span>{trafficReadiness ? trafficReadiness.peakQps.toFixed(2) : "..."}</span>
            </div>
            <div>
              <strong>Rollout</strong>
              <span>{trafficReadiness ? `${trafficReadiness.rollout.length} stages` : "..."}</span>
            </div>
            <div>
              <strong>Notice</strong>
              <span>
                {trafficReadiness
                  ? `${trafficReadiness.notifications.find((item) => item.id === "major_traffic_event")?.leadTimeDays ?? 7} days`
                  : "..."}
              </span>
            </div>
            <div>
              <strong>Retry Budget</strong>
              <span>{trafficReadiness ? `${trafficReadiness.retryAfterContract.maxWallClockMs / 1000}s` : "..."}</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(trafficReadiness?.lanes ?? []).slice(0, 5).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.lane.replace("_", " ")}</span>
                <strong>{lane.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="backpressure-card">
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Backpressure Governor</strong>
          </div>
          <span>
            {backpressureGovernor
              ? `${backpressureGovernor.score}/100, ${backpressureGovernor.readyBuckets}/${backpressureGovernor.totalBuckets} buckets`
              : "Loading backpressure policy"}
          </span>
          <div className="backpressure-grid">
            <div>
              <strong>{backpressureGovernor?.simulations.length ?? 0}</strong>
              <span>Simulations</span>
            </div>
            <div>
              <strong>{backpressureGovernor?.trackingMinIntervalSeconds ?? 10}s</strong>
              <span>Tracking floor</span>
            </div>
            <div>
              <strong>{backpressureGovernor ? backpressureGovernor.maxRetries : 0}</strong>
              <span>Max retries</span>
            </div>
            <div>
              <strong>{backpressureGovernor ? `${backpressureGovernor.maxUserWaitMs / 1000}s` : "..."}</strong>
              <span>User budget</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(backpressureGovernor?.buckets ?? []).slice(0, 5).map((bucket) => (
              <li
                key={bucket.id}
                data-status={bucket.status === "ready" ? "healthy" : bucket.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{bucket.toolClass.replaceAll("_", " ")}</span>
                <strong>{bucket.server === "all" ? "All" : serverLabel(bucket.server)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="load-lab-card">
          <div className="mini-heading">
            <Activity aria-hidden="true" />
            <strong>Swiggy Load Lab</strong>
          </div>
          <span>
            {loadLab
              ? `${loadLab.score}/100, ${loadLab.totals.scenarios} scenarios, ${loadLab.totals.maxPeakQps.toFixed(2)} peak QPS`
              : "Loading launch simulation"}
          </span>
          <div className="load-lab-grid">
            <div>
              <strong>{loadLab?.totals.maxToolCallsPerHour.toLocaleString("en-IN") ?? "..."}</strong>
              <span>Calls/hour</span>
            </div>
            <div>
              <strong>{loadLab?.cohortRamp.map((stage) => `${stage.trafficPercent}%`).join(" -> ") ?? "..."}</strong>
              <span>Cohort ramp</span>
            </div>
            <div>
              <strong>{loadLab?.drills.length ?? 0}</strong>
              <span>Load drills</span>
            </div>
            <div>
              <strong>{loadLab?.totals.externalGates ?? 0}</strong>
              <span>Swiggy gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(loadLab?.scenarios ?? []).slice(0, 4).map((scenario) => (
              <li
                key={scenario.id}
                data-status={scenario.status === "ready" ? "healthy" : scenario.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{scenario.label}</span>
                <strong>{scenario.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="quota-negotiation-card">
          <div className="mini-heading">
            <Gauge aria-hidden="true" />
            <strong>Quota Negotiation</strong>
          </div>
          <span>
            {quotaNegotiation
              ? `${quotaNegotiation.score}/100, ${quotaNegotiation.totals.readyAsks}/${quotaNegotiation.totals.asks} asks ready`
              : "Loading quota packet"}
          </span>
          <div className="quota-negotiation-grid">
            <div>
              <strong>{quotaNegotiation ? quotaNegotiation.forecast.peakQps.toFixed(2) : "..."}</strong>
              <span>Pilot QPS</span>
            </div>
            <div>
              <strong>{quotaNegotiation ? quotaNegotiation.forecast.maxPeakQps.toFixed(2) : "..."}</strong>
              <span>Max QPS</span>
            </div>
            <div>
              <strong>{quotaNegotiation?.totals.upgradeScenarios ?? 0}</strong>
              <span>Upgrade gates</span>
            </div>
            <div>
              <strong>{quotaNegotiation?.forecast.retryAfterReady ? "Ready" : "Watch"}</strong>
              <span>Retry-After</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(quotaNegotiation?.asks ?? []).slice(0, 5).map((quotaAsk) => (
              <li
                key={quotaAsk.id}
                data-status={
                  quotaAsk.status === "ready"
                    ? "healthy"
                    : quotaAsk.status === "swiggy_gate"
                      ? "blocked"
                      : "watch"
                }
              >
                <span>{quotaAsk.label}</span>
                <strong>{quotaAsk.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-intelligence-actions" aria-label="Quota negotiation links">
            <a href="/api/swiggy-quota-negotiation-center" target="_blank" rel="noreferrer">
              Quota API
            </a>
            <a href="/api/swiggy-load-lab" target="_blank" rel="noreferrer">
              Load Lab
            </a>
            <a href="/api/mcp/backpressure-governor" target="_blank" rel="noreferrer">
              Governor
            </a>
          </div>
        </article>

        <article className="offer-intelligence-card">
          <div className="mini-heading">
            <ShoppingBasket aria-hidden="true" />
            <strong>Offer Intelligence</strong>
          </div>
          <span>
            {offerIntelligence
              ? `${offerIntelligence.score}/100, Rs ${offerIntelligence.totals.estimatedSavings.toLocaleString("en-IN")} estimated savings`
              : "Loading offer guardrails"}
          </span>
          <div className="offer-intelligence-grid">
            <div>
              <strong>{offerIntelligence?.totals.opportunities ?? 0}</strong>
              <span>Opportunities</span>
            </div>
            <div>
              <strong>{offerIntelligence?.totals.readyLanes ?? 0}</strong>
              <span>Ready lanes</span>
            </div>
            <div>
              <strong>{offerIntelligence?.totals.officialCouponTools ?? 0}</strong>
              <span>Food coupon tools</span>
            </div>
            <div>
              <strong>{offerIntelligence?.totals.externalGates ?? 0}</strong>
              <span>Live gates</span>
            </div>
            <div>
              <strong>{offerIntelligence ? "POST" : "-"}</strong>
              <span>Decision gate</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(offerIntelligence?.opportunities ?? []).slice(0, 4).map((opportunity) => (
              <li
                key={opportunity.id}
                data-status={opportunity.status === "ready" ? "healthy" : opportunity.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{opportunity.label}</span>
                <strong>Rs {opportunity.estimatedSavings.toLocaleString("en-IN")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-offer-intelligence" target="_blank" rel="noreferrer">
              Offer API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Decision schema
            </a>
          </div>
        </article>

        <article className="order-lifecycle-card">
          <div className="mini-heading">
            <Radio aria-hidden="true" />
            <strong>Order Lifecycle</strong>
          </div>
          <span>
            {orderLifecycle
              ? `${orderLifecycle.score}/100, ${orderLifecycle.totals.toolsCovered} status tools, ${orderLifecycle.totals.trackingCadenceSeconds}s cadence`
              : "Loading lifecycle command center"}
          </span>
          <div className="order-lifecycle-grid">
            <div>
              <strong>{orderLifecycle?.totals.activeTimelines ?? 0}</strong>
              <span>Timelines</span>
            </div>
            <div>
              <strong>{orderLifecycle?.totals.recoveryDrills ?? 0}</strong>
              <span>Recovery drills</span>
            </div>
            <div>
              <strong>{orderLifecycle?.telemetry.length ?? 0}</strong>
              <span>Telemetry fields</span>
            </div>
            <div>
              <strong>{orderLifecycle?.totals.externalGates ?? 0}</strong>
              <span>Live gates</span>
            </div>
            <div>
              <strong>{orderLifecycle ? "POST" : "-"}</strong>
              <span>Status probe</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(orderLifecycle?.timelines ?? []).slice(0, 4).map((timeline) => (
              <li
                key={timeline.id}
                data-status={timeline.status === "ready" ? "healthy" : timeline.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{timeline.label}</span>
                <strong>{timeline.state.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-order-lifecycle" target="_blank" rel="noreferrer">
              Lifecycle API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Probe schema
            </a>
          </div>
        </article>

        <article className="location-trust-card">
          <div className="mini-heading">
            <MapPin aria-hidden="true" />
            <strong>Location Trust</strong>
          </div>
          <span>
            {locationTrust
              ? `${locationTrust.score}/100, ${locationTrust.totals.toolsCovered} address tools, ${locationTrust.totals.readyControls} controls`
              : "Loading address trust center"}
          </span>
          <div className="location-trust-grid">
            <div>
              <strong>{locationTrust?.totals.lanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
            <div>
              <strong>{locationTrust?.totals.scenarios ?? 0}</strong>
              <span>Scenarios</span>
            </div>
            <div>
              <strong>{locationTrust?.totals.redactedFields ?? 0}</strong>
              <span>Redactions</span>
            </div>
            <div>
              <strong>{locationTrust?.totals.externalGates ?? 0}</strong>
              <span>Live gates</span>
            </div>
            <div>
              <strong>{locationTrust ? "POST" : "-"}</strong>
              <span>Select gate</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(locationTrust?.lanes ?? []).slice(0, 4).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-location-trust" target="_blank" rel="noreferrer">
              Trust API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Select schema
            </a>
          </div>
        </article>

        <article className="cart-mutation-card">
          <div className="mini-heading">
            <ShoppingBasket aria-hidden="true" />
            <strong>Cart Mutations</strong>
          </div>
          <span>
            {cartMutation
              ? `${cartMutation.score}/100, ${cartMutation.totals.toolsCovered} cart tools, ${cartMutation.totals.readbackLanes} readbacks`
              : "Loading cart mutation workbench"}
          </span>
          <div className="cart-mutation-grid">
            <div>
              <strong>{cartMutation?.totals.lanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
            <div>
              <strong>{cartMutation?.totals.readyGuardrails ?? 0}</strong>
              <span>Guardrails</span>
            </div>
            <div>
              <strong>{cartMutation?.totals.scenarios ?? 0}</strong>
              <span>Scenarios</span>
            </div>
            <div>
              <strong>{cartMutation?.totals.externalGates ?? 0}</strong>
              <span>Live gates</span>
            </div>
            <div>
              <strong>{cartMutation ? "POST" : "-"}</strong>
              <span>Readback gate</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(cartMutation?.lanes ?? []).slice(0, 4).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.officialTools.length} tools</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-cart-mutation-workbench" target="_blank" rel="noreferrer">
              Cart API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Mutation schema
            </a>
          </div>
        </article>

        <article className="discovery-freshness-card">
          <div className="mini-heading">
            <Search aria-hidden="true" />
            <strong>Discovery Freshness</strong>
          </div>
          <span>
            {discoveryFreshness
              ? `${discoveryFreshness.score}/100, ${discoveryFreshness.totals.toolsCovered} discovery tools, ${discoveryFreshness.totals.freshnessChecks} checks`
              : "Loading discovery freshness"}
          </span>
          <div className="discovery-freshness-grid">
            <div>
              <strong>{discoveryFreshness?.totals.lanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
            <div>
              <strong>{discoveryFreshness?.totals.readyControls ?? 0}</strong>
              <span>Controls</span>
            </div>
            <div>
              <strong>{discoveryFreshness?.totals.scenarios ?? 0}</strong>
              <span>Scenarios</span>
            </div>
            <div>
              <strong>{discoveryFreshness?.totals.externalGates ?? 0}</strong>
              <span>Live gates</span>
            </div>
            <div>
              <strong>{discoveryFreshness ? "POST" : "-"}</strong>
              <span>Resolve gate</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(discoveryFreshness?.lanes ?? []).slice(0, 4).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.officialTools.length} tools</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-discovery-freshness" target="_blank" rel="noreferrer">
              Discovery API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Resolve schema
            </a>
          </div>
        </article>

        <article className="confirmation-command-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Confirmation Command</strong>
          </div>
          <span>
            {confirmationCommandCenter
              ? `${confirmationCommandCenter.score}/100, ${confirmationCommandCenter.totals.protectedActions} protected actions, ${confirmationCommandCenter.totals.postActionProbes} probes`
              : "Loading final commerce confirmations"}
          </span>
          <div className="confirmation-command-grid">
            <div>
              <strong>{confirmationCommandCenter?.totals.lanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
            <div>
              <strong>{confirmationCommandCenter?.totals.readyChecklistItems ?? 0}</strong>
              <span>Checks</span>
            </div>
            <div>
              <strong>{confirmationCommandCenter?.totals.scenarios ?? 0}</strong>
              <span>Drills</span>
            </div>
            <div>
              <strong>{confirmationCommandCenter?.totals.externalGates ?? 0}</strong>
              <span>Live gates</span>
            </div>
            <div>
              <strong>{confirmationCommandCenter ? "POST" : "-"}</strong>
              <span>Execute gate</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(confirmationCommandCenter?.lanes ?? []).slice(0, 4).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.protectedAction.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <div className="source-links">
            <a href="/api/swiggy-confirmation-command-center" target="_blank" rel="noreferrer">
              Command API
            </a>
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              Execute schema
            </a>
          </div>
        </article>

        <article className="cancellation-care-card">
          <div className="mini-heading">
            <LifeBuoy aria-hidden="true" />
            <strong>Cancellation & Care</strong>
          </div>
          <span>
            {cancellationCareCenter
              ? `${cancellationCareCenter.score}/100, ${cancellationCareCenter.totals.noToolCancellationGuards} no-tool guards, ${cancellationCareCenter.customerCarePhone}`
              : "Loading cancellation and support policy"}
          </span>
          <div className="cancellation-care-grid">
            <div>
              <strong>{cancellationCareCenter?.totals.lanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
            <div>
              <strong>{cancellationCareCenter?.totals.reportErrorTools ?? 0}</strong>
              <span>Report tools</span>
            </div>
            <div>
              <strong>{cancellationCareCenter?.totals.readyControls ?? 0}</strong>
              <span>Controls</span>
            </div>
            <div>
              <strong>{cancellationCareCenter?.totals.externalGates ?? 0}</strong>
              <span>Live gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(cancellationCareCenter?.lanes ?? []).slice(0, 4).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.server === "combined" ? "all" : serverLabel(lane.server)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="dineout-precision-card">
          <div className="mini-heading">
            <CalendarCheck aria-hidden="true" />
            <strong>Dineout Precision</strong>
          </div>
          <span>
            {dineoutPrecisionCenter
              ? `${dineoutPrecisionCenter.score}/100, ${dineoutPrecisionCenter.totals.freeBookingGuards} free guards, ${dineoutPrecisionCenter.totals.billPaymentLanes} bill lane`
              : "Loading Dineout booking and bill-payment guards"}
          </span>
          <div className="dineout-precision-grid">
            <div>
              <strong>{dineoutPrecisionCenter?.totals.lanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
            <div>
              <strong>{dineoutPrecisionCenter?.totals.toolsCovered ?? 0}</strong>
              <span>Tools</span>
            </div>
            <div>
              <strong>{dineoutPrecisionCenter?.totals.readyGuards ?? 0}</strong>
              <span>Guards</span>
            </div>
            <div>
              <strong>{dineoutPrecisionCenter?.totals.externalGates ?? 0}</strong>
              <span>Live gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(dineoutPrecisionCenter?.lanes ?? []).slice(0, 4).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.cartType === "none" ? lane.officialTools[0] : lane.cartType.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="auth-lifecycle-card">
          <div className="mini-heading">
            <LockKeyhole aria-hidden="true" />
            <strong>Auth Lifecycle</strong>
          </div>
          <span>
            {authLifecycleCenter
              ? `${authLifecycleCenter.score}/100, ${authLifecycleCenter.tokenLifetimes.accessTokenDays}d token, refresh ${authLifecycleCenter.tokenLifetimes.refreshTokenAvailableInV1 ? "on" : "off"}`
              : "Loading OAuth lifecycle controls"}
          </span>
          <div className="auth-lifecycle-grid">
            <div>
              <strong>{authLifecycleCenter?.totals.lanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
            <div>
              <strong>{authLifecycleCenter?.totals.recoveryScenarios ?? 0}</strong>
              <span>Recoveries</span>
            </div>
            <div>
              <strong>{authLifecycleCenter?.totals.readyStorageRules ?? 0}</strong>
              <span>Storage</span>
            </div>
            <div>
              <strong>{authLifecycleCenter?.currentState.tokenSource ?? "none"}</strong>
              <span>Token source</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(authLifecycleCenter?.lanes ?? []).slice(0, 4).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="enterprise-platform-card">
          <div className="mini-heading">
            <Users aria-hidden="true" />
            <strong>Enterprise Platform</strong>
          </div>
          <span>
            {enterprisePlatformCenter
              ? `${enterprisePlatformCenter.score}/100, ${enterprisePlatformCenter.totals.readyTenantControls} tenant controls`
              : "Loading platform operator controls"}
          </span>
          <div className="enterprise-platform-grid">
            <div>
              <strong>{enterprisePlatformCenter?.totals.readinessLanes ?? 0}</strong>
              <span>Lanes</span>
            </div>
            <div>
              <strong>{enterprisePlatformCenter?.totals.supportLanes ?? 0}</strong>
              <span>Support</span>
            </div>
            <div>
              <strong>{enterprisePlatformCenter?.totals.auditExports ?? 0}</strong>
              <span>Audits</span>
            </div>
            <div>
              <strong>{enterprisePlatformCenter?.totals.contractGates ?? 0}</strong>
              <span>Contracts</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(enterprisePlatformCenter?.readinessLanes ?? []).slice(0, 4).map((lane) => (
              <li
                key={lane.id}
                data-status={lane.status === "ready" ? "healthy" : lane.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{lane.label}</span>
                <strong>{lane.owner}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <RefreshCw aria-hidden="true" />
            <strong>Version Monitor</strong>
          </div>
          <span>{versionMonitor ? `${versionMonitor.currentMajor}, ${versionMonitor.deprecationWindowDays} day window` : "Loading"}</span>
          <ul className="compact-status-list">
            {(versionMonitor?.alerts ?? []).map((alert) => (
              <li key={alert.id} data-status={alert.status === "ready" ? "healthy" : "watch"}>
                <span>{alert.label}</span>
                <strong>{alert.status}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="mini-heading">
            <LockKeyhole aria-hidden="true" />
            <strong>Compliance</strong>
          </div>
          <span>{complianceEvidence?.residency ?? "Loading compliance posture"}</span>
          <ul className="compact-status-list">
            {(complianceEvidence?.controls ?? []).slice(0, 5).map((control) => (
              <li key={control.id} data-status={control.status === "implemented" ? "healthy" : "watch"}>
                <span>{control.label}</span>
                <strong>{control.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="data-governance-card">
          <div className="mini-heading">
            <Database aria-hidden="true" />
            <strong>Data Governance</strong>
          </div>
          <span>
            {dataGovernance
              ? `${dataGovernance.score}/100, ${dataGovernance.dataFlows.length} data flows`
              : "Loading DPDP posture"}
          </span>
          <div className="data-governance-grid">
            <div>
              <strong>
                {dataGovernance ? dataGovernance.controls.filter((control) => control.status === "ready").length : "..."}
              </strong>
              <span>Ready controls</span>
            </div>
            <div>
              <strong>{dataGovernance?.dsrRunbook.length ?? "..."}</strong>
              <span>DSR steps</span>
            </div>
            <div>
              <strong>{dataGovernance?.retention.swiggyAuditLogDays ?? "..."}d</strong>
              <span>Swiggy audit logs</span>
            </div>
            <div>
              <strong>{dataGovernance?.signedManifestReadiness.targetVersion ?? "v..."}</strong>
              <span>Manifest watch</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(dataGovernance?.controls ?? []).slice(0, 5).map((control) => (
              <li
                key={control.id}
                data-status={control.status === "ready" ? "healthy" : control.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{control.label}</span>
                <strong>{control.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="proof-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Reviewer Proof</strong>
          </div>
          <span>{reviewerProof ? `${reviewerProof.score}/100 readiness score` : "Loading proof score"}</span>
          <div className="proof-grid">
            {(reviewerProof?.highlights ?? []).slice(0, 4).map((highlight) => (
              <div key={highlight}>
                <strong>Evidence</strong>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="launch-bundle-card">
          <div className="mini-heading">
            <Rocket aria-hidden="true" />
            <strong>Launch Bundle</strong>
          </div>
          <span>
            {launchBundle
              ? `${launchBundle.score}/100 ${launchBundle.readinessLabel.replaceAll("_", " ")}`
              : "Preparing launch handoff"}
          </span>
          <ul className="compact-status-list">
            {(launchBundle?.goLiveGates ?? []).slice(0, 5).map((gate) => (
              <li
                key={gate.label}
                data-status={gate.status === "ready" ? "healthy" : gate.status === "manual_input" ? "watch" : "blocked"}
              >
                <span>{gate.label}</span>
                <strong>{gate.status.replace("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="error-intelligence-card">
          <div className="mini-heading">
            <AlertTriangle aria-hidden="true" />
            <strong>Error Intelligence</strong>
          </div>
          <span>
            {errorIntelligence
              ? `${errorIntelligence.score}/100, ${errorIntelligence.buckets.length} failure buckets`
              : "Loading error catalogue"}
          </span>
          <div className="source-intelligence-grid">
            <div>
              <strong>{errorIntelligence ? "POST" : "-"}</strong>
              <span>Classify</span>
            </div>
            <div>
              <strong>{errorIntelligence?.retryPolicy.maxRetries ?? 0}</strong>
              <span>Retry cap</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(errorIntelligence?.buckets ?? []).slice(0, 5).map((bucket) => (
              <li key={bucket.id} data-status={bucket.reportError ? "watch" : "healthy"}>
                <span>{bucket.label}</span>
                <strong>{bucket.retryClass.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="resilience-card">
          <div className="mini-heading">
            <FileWarning aria-hidden="true" />
            <strong>Resilience Lab</strong>
          </div>
          <span>
            {resilienceRunbook
              ? `${resilienceRunbook.score}/100 drill score, ${passedDrills}/${resilienceDrills.length} passing`
              : "Loading failure drills"}
          </span>
          <ul className="compact-status-list">
            {resilienceDrills.slice(0, 5).map((drill) => (
              <li key={drill.id} data-status={drill.status === "pass" ? "healthy" : "watch"}>
                <span>{drill.label}</span>
                <strong>{drill.status}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="trace-card">
          <div className="mini-heading">
            <Activity aria-hidden="true" />
            <strong>Trace Monitor</strong>
          </div>
          <span>
            {observabilityTraceReport
              ? `${observabilityTraceReport.score}/100 trace score, ${observabilityTraceReport.traces.length} trace(s)`
              : "Loading trace evidence"}
          </span>
          <ul className="compact-status-list">
            {(observabilityTraceReport?.metrics ?? []).slice(0, 4).map((metric) => (
              <li key={metric.id} data-status={metric.status}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="runtime-telemetry-card">
          <div className="mini-heading">
            <Radio aria-hidden="true" />
            <strong>Runtime Telemetry</strong>
          </div>
          <span>
            {runtimeTelemetry
              ? `${runtimeTelemetry.score}/100 live log score, ${runtimeTelemetry.events.length} event(s)`
              : "Loading live request ledger"}
          </span>
          <ul className="compact-status-list">
            {(runtimeTelemetry?.metrics ?? []).slice(0, 4).map((metric) => (
              <li key={metric.id} data-status={metric.status}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="audit-ledger-card">
          <div className="mini-heading">
            <ClipboardCheck aria-hidden="true" />
            <strong>Audit Ledger</strong>
          </div>
          <span>
            {auditLedger
              ? `${auditLedger.score}/100, ${auditLedger.totalEvents} event(s)`
              : "Loading audit ledger"}
          </span>
          <div className="audit-ledger-grid">
            <div>
              <strong>{auditLedger?.coveredSessions ?? 0}</strong>
              <span>Sessions</span>
            </div>
            <div>
              <strong>{auditLedger?.commercialActions ?? 0}</strong>
              <span>Commercial</span>
            </div>
            <div>
              <strong>{auditLedger?.retention.swiggyAuditLogDays ?? 90}d</strong>
              <span>Swiggy logs</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(auditLedger?.controls ?? []).slice(0, 5).map((control) => (
              <li
                key={control.id}
                data-status={
                  control.status === "ready" ? "healthy" : control.status === "blocked" ? "blocked" : "watch"
                }
              >
                <span>{control.label}</span>
                <strong>{control.status.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="slo-incident-card">
          <div className="mini-heading">
            <LifeBuoy aria-hidden="true" />
            <strong>SLO Command</strong>
          </div>
          <span>
            {sloIncident
              ? `${sloIncident.score}/100, ${sloIncident.uptimeTargets.length} uptime targets`
              : "Loading SLO command center"}
          </span>
          <div className="slo-grid">
            <div>
              <strong>{sloIncident?.statusPage.swiggyStatus.replaceAll("_", " ") ?? "pending"}</strong>
              <span>Status page</span>
            </div>
            <div>
              <strong>
                {sloIncident
                  ? `${sloIncident.latencyTargets.find((target) => target.id === "commercial_actions")?.observedP95Ms ?? 0}ms`
                  : "..."}
              </strong>
              <span>Commercial p95</span>
            </div>
            <div>
              <strong>{sloIncident?.maintenance.noticeHours ?? 0}h</strong>
              <span>Maintenance notice</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(sloIncident?.incidentComms ?? []).slice(0, 4).map((incident) => (
              <li
                key={incident.severity}
                data-status={incident.status === "ready" ? "healthy" : incident.status === "external_gate" ? "blocked" : "watch"}
              >
                <span>{incident.trigger}</span>
                <strong>{incident.severity}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="route-card">
          <div className="mini-heading">
            <GitBranch aria-hidden="true" />
            <strong>Route Optimizer</strong>
          </div>
          <span>
            {routeOptimizer
              ? `${routeOptimizer.score}/100 route score, ${routeOptimizer.totalSavedCalls} calls saved`
              : "Loading route optimizer"}
          </span>
          <div className="route-optimizer-grid">
            <div>
              <strong>{routeOptimizer?.totals.optimizedCalls ?? 0}/{routeOptimizer?.totals.baselineCalls ?? 0}</strong>
              <span>Calls</span>
            </div>
            <div>
              <strong>{routeOptimizer?.parallelBatches.filter((batch) => batch.parallel).length ?? 0}</strong>
              <span>Parallel lanes</span>
            </div>
            <div>
              <strong>{routeOptimizer?.totals.commercialGates ?? 0}</strong>
              <span>Gates</span>
            </div>
          </div>
          <ul className="compact-status-list">
            {(routeOptimizer?.profiles ?? []).slice(0, 4).map((profile) => (
              <li key={profile.id} data-status="healthy">
                <span>{profile.label}</span>
                <strong>{profile.savedCalls} saved</strong>
              </li>
            ))}
          </ul>
          <ul className="compact-status-list">
            {(routeOptimizer?.parallelBatches ?? []).slice(0, 3).map((batch) => (
              <li key={batch.id} data-status={batch.parallel ? "healthy" : "watch"}>
                <span>{batch.label}</span>
                <strong>{batch.phase.replaceAll("_", " ")}</strong>
              </li>
            ))}
          </ul>
          <ul className="compact-status-list">
            {(routeOptimizer?.crossServerHandoffs ?? []).slice(0, 3).map((handoff) => (
              <li key={handoff.id} data-status="healthy">
                <span>{serverLabel(handoff.fromServer)} to {serverLabel(handoff.toServer)}</span>
                <strong>{handoff.cacheWindow.split(";")[0]}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="evaluation-card">
          <div className="mini-heading">
            <Bot aria-hidden="true" />
            <strong>Evaluation Lab</strong>
          </div>
          <span>
            {evaluationLab
              ? `${evaluationLab.score}/100 eval score, ${evaluationLab.passCount}/${evaluationLab.scenarios.length} clean passes`
              : "Running persona QA"}
          </span>
          <ul className="compact-status-list">
            {(evaluationLab?.scenarios ?? []).slice(0, 4).map((scenario) => (
              <li key={scenario.id} data-status={scenario.status === "pass" ? "healthy" : "watch"}>
                <span>{scenario.persona}</span>
                <strong>{scenario.score}/100</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default App;
