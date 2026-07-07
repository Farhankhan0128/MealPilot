import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { createMealPlan } from "../src/domain/planner.js";
import { defaultUserProfile } from "../src/domain/profile.js";
import type { GroupMember, PantryItem, SwiggyServer, UserPlanningRequest } from "../src/domain/types.js";
import { readConfig, type ServerConfig } from "./config.js";
import { handleMockJsonRpc, type JsonRpcRequest } from "./mock/swiggyToolRouter.js";
import { executeAllPreparedRecommendations, executeConfirmedRecommendation } from "./services/confirmationService.js";
import {
  buildAgentSurfaceResponse,
  buildApplicationMarkdown,
  buildGoLiveChecks,
  buildGroupPlan,
  buildIncidentReport,
  buildMcpCoverage,
  buildObservabilityMetrics,
  buildOpsStatus,
  buildPlanReminders,
  buildRestockSuggestions,
} from "./services/advancedWorkflows.js";
import { buildSwiggyAgentExperienceBenchmark } from "./services/agentExperienceBenchmark.js";
import { buildAiClientConnectKit, validateAiClientConfig } from "./services/aiClientConnect.js";
import { buildAccessSubmissionStudio, rehearseAccessSubmission } from "./services/accessSubmissionStudio.js";
import { buildSwiggyAuthLifecycleCenter } from "./services/authLifecycleCenter.js";
import { buildAuditLedgerCenter } from "./services/auditLedger.js";
import { activateSwiggyBenefit, buildSwiggyBenefitsActivationCenter } from "./services/benefitsActivationCenter.js";
import { buildBrandComplianceKit, rehearseBrandCompliance } from "./services/brandCompliance.js";
import { buildSwiggyBuildersLaunchStoryCenter } from "./services/buildersLaunchStoryCenter.js";
import { buildSwiggyBuildersLiveSourceResilienceCenter } from "./services/liveSourceResilienceCenter.js";
import { buildSwiggyBuildersModuleIntelligenceCenter } from "./services/moduleIntelligence.js";
import { buildSwiggyBuildersModuleWitness } from "./services/buildersModuleWitness.js";
import { buildSwiggyBuildersNavigationWitness } from "./services/buildersNavigationWitness.js";
import { buildSwiggyBuildersBenefitsWitness } from "./services/buildersBenefitsWitness.js";
import { buildSwiggyBuildersAiNativeWitness } from "./services/buildersAiNativeWitness.js";
import { buildSwiggyBuildersEnterpriseWitness } from "./services/buildersEnterpriseWitness.js";
import { buildSwiggyBuildersConsumerWitness } from "./services/buildersConsumerWitness.js";
import { buildSwiggyBuildersReviewDecisionCenter } from "./services/reviewDecisionCenter.js";
import { buildSwiggyBuildersSourceEvolutionCenter } from "./services/sourceEvolutionCenter.js";
import { buildSwiggySourceFreezeDiff } from "./services/sourceFreezeDiff.js";
import { buildSwiggyBuildersPageMeshAuditor } from "./services/buildersPageMeshAuditor.js";
import { buildSwiggyBuildersSiteParityAuditor } from "./services/buildersSiteParityAuditor.js";
import { buildBuilderPacketExport, buildBuilderPacketMarkdown } from "./services/builderPacketExport.js";
import { buildMcpBackpressureGovernor } from "./services/backpressureGovernor.js";
import { buildSwiggyBuilderIntakeCommandCenter } from "./services/builderIntake.js";
import { buildSwiggyCartMutationWorkbench, mutateSwiggyCartWithReadback } from "./services/cartMutationWorkbench.js";
import { buildSwiggyChannelMultimodalStudio, composeSwiggyChannelExecutionPacket } from "./services/channelMultimodalStudio.js";
import { buildCodingAgentGovernance } from "./services/codingAgentGovernance.js";
import { buildCommercialActionGuard } from "./services/commercialActionGuard.js";
import { buildSwiggyConversionCenter } from "./services/conversionCenter.js";
import { buildSwiggyCancellationCareCenter } from "./services/cancellationCareCenter.js";
import { buildSwiggyConfirmationCommandCenter, executeSwiggyConfirmationCommand } from "./services/confirmationCommandCenter.js";
import { buildSwiggyCtaExecutionCenter } from "./services/ctaExecutionCenter.js";
import { buildSwiggyCtaLiveAuditor } from "./services/ctaLiveAuditor.js";
import { buildSwiggyCustomizationStudio, validateSwiggyCustomization } from "./services/customizationStudio.js";
import { buildSwiggyAccessEvidenceMatrix } from "./services/accessEvidenceMatrix.js";
import { buildSwiggyAccessDossier } from "./services/swiggyAccessDossier.js";
import {
  buildReadinessChecklist,
  buildTrackingEvents,
  removeRecommendationItem,
  substitutePlanItem,
} from "./services/planOperations.js";
import {
  buildCartPreflightReport,
  buildDemoStudio,
  buildMcpReplay,
  buildSubmissionPackage,
} from "./services/demoStudio.js";
import { buildMcpCapabilityRegistry } from "./services/capabilityRegistry.js";
import { buildSwiggyBuildersCompletionLedger } from "./services/buildersCompletionLedger.js";
import { buildSwiggyBuildersCoverageReceipt } from "./services/buildersCoverageReceipt.js";
import { buildSwiggyCapabilityTraceability } from "./services/capabilityTraceability.js";
import { buildSwiggySourceAvailabilityAudit } from "./services/sourceAvailabilityAudit.js";
import { buildEvaluationLab } from "./services/evaluationLab.js";
import { buildErrorIntelligenceReport, classifyMcpError } from "./services/errorIntelligence.js";
import { buildSwiggyFaqPolicyCenter } from "./services/faqPolicyCenter.js";
import { answerSwiggyFaqQuestion, buildSwiggyFaqResolutionCenter } from "./services/faqResolutionCenter.js";
import { buildGuestCollaborationCenter, composeGuestCollaborationHandoff } from "./services/guestCollaborationCenter.js";
import { buildSwiggyGrowthPartnershipCenter, composeSwiggyGrowthPartnershipAsk } from "./services/growthPartnership.js";
import { buildSwiggyDemoEvidenceDirector } from "./services/demoEvidenceDirector.js";
import { buildSwiggyHostedWidgetActivationCenter } from "./services/hostedWidgetActivation.js";
import { buildSwiggyBuildersHomepageExperienceCenter } from "./services/homepageExperienceCenter.js";
import { buildSwiggyHomepageSignalCoverageBoard } from "./services/homepageSignalCoverage.js";
import { buildHouseholdPreferenceGraph, simulateHouseholdPreference } from "./services/householdPreferenceGraph.js";
import { buildSwiggyInteractionQaCenter, rehearseSwiggyInteractionQaLane } from "./services/interactionQaCenter.js";
import { buildSwiggyInnovationRadar } from "./services/innovationRadar.js";
import { buildSwiggyJourneyCompiler } from "./services/journeyCompiler.js";
import { buildSwiggyBuildersJourneyGateCenter } from "./services/journeyGateCenter.js";
import { buildLaunchBundle } from "./services/launchBundle.js";
import { buildSwiggyLiveSignalCalibration } from "./services/liveSignalCalibration.js";
import { buildSwiggyLoadLab } from "./services/loadLab.js";
import { buildSwiggyLocationTrust, selectSwiggyLocation } from "./services/locationTrust.js";
import { buildLuxuryExperienceWorkspace, composeLuxuryExperienceWorkspace } from "./services/luxuryExperienceWorkspace.js";
import {
  buildMcpGatewayStatus,
  callConfiguredSwiggyTool,
  exchangeSwiggyAuthorizationCode,
} from "./services/mcpGateway.js";
import { buildCredentialOnboardingReport } from "./services/credentialOnboarding.js";
import { buildSwiggyCredentialHandoffCenter } from "./services/credentialHandoffCenter.js";
import {
  buildSwiggyCredentialReadinessDossier,
  rehearseSwiggyCredentialReadiness,
} from "./services/credentialReadinessDossier.js";
import { buildSwiggyCredentialVaultCenter } from "./services/credentialVaultCenter.js";
import { buildDataGovernanceCenter } from "./services/dataGovernance.js";
import { buildSwiggyDeepSiteMap } from "./services/deepSiteMap.js";
import { buildDeveloperQuickstartWorkbench, executeDeveloperFirstCall } from "./services/developerQuickstartWorkbench.js";
import { buildSwiggyDiscoveryFreshness, resolveSwiggyDiscoveryFreshness } from "./services/discoveryFreshness.js";
import { buildSwiggyDineoutPrecisionCenter } from "./services/dineoutPrecisionCenter.js";
import { buildSwiggyDocsCoverage, drillSwiggyDocsCoverage } from "./services/docsCoverage.js";
import { buildSwiggyDocsTwinExplorer, rehearseSwiggyDocsTwinRetrieval } from "./services/docsTwinExplorer.js";
import { buildSwiggyLlmsManifestVerifier, rehearseSwiggyLlmsManifest } from "./services/llmsManifestVerifier.js";
import { buildEnterpriseDelegatedAuthCenter } from "./services/enterpriseDelegatedAuth.js";
import { buildEnterprisePlatformCenter } from "./services/enterprisePlatformCenter.js";
import {
  buildComplianceEvidence,
  buildRateLimitPlan,
  buildReviewerProof,
  buildVersionMonitor,
  buildWidgets,
} from "./services/productionEvidence.js";
import { buildResilienceDrills, buildResilienceRunbook } from "./services/resilienceDrills.js";
import { buildOpenApiDocument } from "./services/openApi.js";
import { buildSandboxCredentialWorkbench } from "./services/sandboxCredentialWorkbench.js";
import { buildSwiggyShowcaseSubmissionCenter, composeSwiggyShowcaseSubmission } from "./services/showcaseSubmissionCenter.js";
import { buildSwiggySubmissionTimelineCenter, buildSwiggySubmissionTimelineCheckpoint } from "./services/submissionTimelineCenter.js";
import { buildSwiggyTalentSignalCenter, composeSwiggyTalentOutreach } from "./services/talentSignalCenter.js";
import { adviseNutritionBudget, buildNutritionBudgetIntelligence } from "./services/nutritionBudgetIntelligence.js";
import { buildObservabilityTraceReport, buildSwiggyRouteOptimizationReport } from "./services/observability.js";
import { buildSwiggyOfferIntelligence, decideSwiggyOffer } from "./services/offerIntelligence.js";
import { buildSwiggyOperatingContractCenter, rehearseSwiggyOperatingContract } from "./services/operatingContractCenter.js";
import { buildSwiggyOrderLifecycle, probeSwiggyOrderLifecycle } from "./services/orderLifecycle.js";
import { buildSwiggyPartnerSuccessDesk, composeSwiggyPartnerSuccessHandoff } from "./services/partnerSuccessDesk.js";
import { buildSwiggyPartnerSupportRoom, composeSwiggyPartnerSupportPacket } from "./services/partnerSupportRoom.js";
import { buildSwiggyPaymentTruthCenter, reconcileSwiggyPaymentTruth } from "./services/paymentTruthCenter.js";
import { buildSwiggyMealWindowCenter, forecastSwiggyMealWindow } from "./services/mealWindowIntelligence.js";
import { buildSwiggyPrivatePilotControlRoom } from "./services/privatePilotControlRoom.js";
import { buildPremiumConciergeItinerary } from "./services/premiumConciergeItinerary.js";
import { buildPremiumUseCaseStudio } from "./services/premiumUseCaseStudio.js";
import { buildSwiggyQuotaNegotiationCenter } from "./services/quotaNegotiationCenter.js";
import { analyzeSwiggyQualityFeedback, buildSwiggyQualityLoopCenter } from "./services/qualityLoopCenter.js";
import { buildSwiggyRitualAutopilotCenter, planSwiggyRitualAutopilot } from "./services/ritualAutopilotCenter.js";
import { buildReviewerArtifactVault, composeReviewerArtifactPacket } from "./services/reviewerArtifactVault.js";
import { createPkcePair, createState } from "./services/pkce.js";
import { buildMcpResourcePromptStudio, executeMcpResourcePrompt } from "./services/resourcePromptStudio.js";
import { buildSwiggyStagingCredentialDrill } from "./services/stagingCredentialDrill.js";
import { buildSwiggyStagingCutoverRehearsal } from "./services/stagingCutover.js";
import {
  buildSwiggyStagingReplayCenter,
  buildSwiggyStagingReplayExecution,
} from "./services/stagingReplayCenter.js";
import { buildSwiggyStagingSeedSmokeCenter } from "./services/stagingSeedSmokeCenter.js";
import { buildStagingCertificationMatrix } from "./services/stagingCertification.js";
import { buildStagingTranscriptExport } from "./services/stagingTranscript.js";
import { buildSubmissionConsole } from "./services/submissionConsole.js";
import { buildSwiggyStateOrchestrator, rehearseSwiggySurfaceContract } from "./services/stateOrchestrator.js";
import { buildSwiggyWidgetExperienceComposer } from "./services/widgetExperienceComposer.js";
import { buildSwiggyWidgetRuntime } from "./services/widgetRuntime.js";
import { buildSwiggyBuildersMap } from "./services/swiggyBuildersMap.js";
import { buildSwiggyAuthStatusReport, type AuthLifecycleEvent } from "./services/swiggyAuthStatus.js";
import { buildSwiggyHandshakeDoctor } from "./services/swiggyHandshakeDoctor.js";
import { buildSupportBridgeReport, executeSupportBridgeReport } from "./services/supportBridge.js";
import { buildSwiggyScenarioRunner } from "./services/scenarioRunner.js";
import { buildSwiggyToolContractMatrix } from "./services/toolContractMatrix.js";
import { buildSwiggyToolParityAuditor } from "./services/toolParityAuditor.js";
import { buildMcpToolLabReport } from "./services/toolLab.js";
import { buildTrafficReadinessPlan } from "./services/trafficReadiness.js";
import { buildSloIncidentCommandCenter } from "./services/sloIncidentCommand.js";
import { buildSwiggySourceIntelligence } from "./services/sourceIntelligence.js";
import { buildSwiggyUpstreamWatch } from "./services/upstreamWatch.js";
import { buildVisualQaCenter, rehearseVisualQaCapture } from "./services/visualQaCenter.js";
import { analyzeSwiggyVisualDishCapture, buildSwiggyVisualDishCaptureCenter } from "./services/visualDishCapture.js";
import { buildSwiggyVoiceCommerceCenter, rehearseSwiggyVoiceCommerce } from "./services/voiceCommerceCenter.js";
import { buildSwiggyWebsiteAtlas } from "./services/websiteAtlas.js";
import { createRuntimeTelemetry, type RuntimeTelemetryRecorder } from "./services/runtimeTelemetry.js";
import { createMemorySessionStore, type SessionStore } from "./store/sessionStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const planningRequestSchema = z.object({
  prompt: z.string().min(8),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  budget: z.number().int().min(500).max(10000),
  diet: z.enum(["vegetarian", "high-protein vegetarian", "balanced"]),
  guests: z.number().int().min(1).max(12),
  day: z.enum(["today", "friday", "saturday", "sunday"]),
});

const confirmSchema = z.object({
  sessionId: z.string().min(4),
  recommendationId: z.string().min(4),
});

const substitutionSchema = z.object({
  sessionId: z.string().min(4),
  recommendationId: z.string().min(4),
  alternativeId: z.string().min(4),
});

const removeItemSchema = z.object({
  sessionId: z.string().min(4),
  recommendationId: z.string().min(4),
  itemId: z.string().min(2),
});

const profileSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(1),
  householdSize: z.number().int().min(1).max(12),
  defaultCity: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  defaultBudget: z.number().int().min(500).max(10000),
  diet: z.enum(["vegetarian", "high-protein vegetarian", "balanced"]),
  allergies: z.array(z.string().min(1)).max(12),
  dislikes: z.array(z.string().min(1)).max(12),
  favoriteCuisines: z.array(z.string().min(1)).max(12),
  spicePreference: z.enum(["mild", "medium", "hot"]),
  addressLabel: z.enum(["Home", "Office"]),
  consentToStorePreferences: z.boolean(),
});

const pantryItemSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(1),
  category: z.enum(["protein", "staple", "dairy", "produce", "snack"]),
  currentQty: z.number().min(0),
  targetQty: z.number().min(0),
  unit: z.string().min(1),
  estimatedPrice: z.number().min(0),
});

const groupMemberSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(1),
  diet: z.enum(["vegetarian", "high-protein vegetarian", "balanced"]),
  allergies: z.array(z.string()).max(12),
  budget: z.number().int().min(100).max(5000),
});

const accessSubmissionStateSchema = z.object({
  demoVideoUrl: z.string().trim().optional(),
  technicalContactEmail: z.string().trim().optional(),
  productionRedirectUri: z.string().trim().optional(),
  staticEgressIp: z.string().trim().optional(),
  environmentSummary: z.string().trim().optional(),
  termsAcknowledged: z.boolean().optional(),
  formSubmittedAt: z.string().trim().optional(),
  handoffEmailSentAt: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const accessSubmissionRehearsalSchema = z.object({
  mode: z.enum(["pre_submit", "submitted_handoff", "credential_followup"]),
  includeFormSubmission: z.boolean(),
  includeHandoffEmail: z.boolean(),
  includeCredentialGates: z.boolean(),
  handoffState: accessSubmissionStateSchema.optional(),
});

const credentialIssuanceStateSchema = z.object({
  dcrApprovedAt: z.string().trim().optional(),
  clientIdConfigured: z.boolean().optional(),
  stagingCredentialsIssuedAt: z.string().trim().optional(),
  seededUsersReceived: z
    .object({
      food: z.boolean().optional(),
      instamart: z.boolean().optional(),
      dineout: z.boolean().optional(),
    })
    .optional(),
  supportThreadId: z.string().trim().optional(),
  tokenExpiryRecorded: z.boolean().optional(),
  firstReadProbeReady: z.boolean().optional(),
  notes: z.string().trim().max(1000).optional(),
});

const credentialReadinessRehearsalSchema = z.object({
  mode: z.enum(["access_packet_sent", "staging_credentials_issued", "production_promotion_ready"]),
  includeSourceFreeze: z.boolean(),
  includeCredentialReceipt: z.boolean(),
  includeProductionPromotion: z.boolean(),
});

const sourceFreezeDiffSchema = z.object({
  mode: z.enum(["pre_demo", "pre_access_submission", "post_source_change"]),
  includeLivePageMesh: z.boolean(),
  includeLlmsManifest: z.boolean(),
  includeAccessPacket: z.boolean(),
  includeBrowserRebrowse: z.boolean(),
  browserRebrowseReceipt: z
    .object({
      checkedAt: z.string().datetime(),
      actor: z.string().trim().min(2).max(80),
      viewport: z.enum(["desktop", "mobile", "tablet", "desktop_mobile", "all_form_factors"]),
      notes: z.string().trim().max(240).optional(),
    })
    .optional(),
});

const visualDishAnalyzeSchema = z.object({
  intent: z.enum(["dish_photo", "menu_screenshot", "pantry_photo", "chat_image"]),
  caption: z.string().trim().min(3).max(240),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  imageName: z.string().trim().max(120).optional(),
});

const voiceCommerceRehearsalSchema = z.object({
  utterance: z.string().trim().min(4).max(240),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
});

const qualityFeedbackSchema = z.object({
  server: z.enum(["food", "instamart", "dineout", "combined"]),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(280),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  consentToLearn: z.boolean(),
});

const ritualAutopilotPlanSchema = z.object({
  cadence: z.enum(["weekday", "weekend", "weekly", "occasion"]),
  householdMode: z.enum(["solo", "couple", "family", "team"]),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  budget: z.number().int().min(300).max(20000),
  consentToUseHistory: z.boolean(),
});

const paymentTruthReconcileSchema = z.object({
  server: z.enum(["food", "instamart", "dineout", "combined"]),
  cartTotal: z.number().min(0).max(100000),
  expectedDiscount: z.number().min(0).max(50000),
  paymentPreference: z.enum(["cod", "online", "free_booking", "unknown"]),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
});

const mealWindowForecastSchema = z.object({
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  window: z.enum(["breakfast", "lunch", "dinner", "late_night", "weekend"]),
  partySize: z.number().int().min(1).max(20),
  urgency: z.enum(["now", "today", "this_week"]),
  includeDineout: z.boolean(),
});

const customizationValidationSchema = z.object({
  server: z.enum(["food", "instamart", "dineout", "combined"]),
  intent: z.string().trim().min(3).max(240),
  hasAllergy: z.boolean(),
  userChangedVariant: z.boolean(),
  quantity: z.number().int().min(1).max(20),
  includeDineout: z.boolean(),
});

const nutritionBudgetAdviceSchema = z.object({
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  budget: z.number().int().min(250).max(50000),
  proteinTargetGrams: z.number().int().min(20).max(300),
  partySize: z.number().int().min(1).max(30),
  preference: z.enum(["food", "instamart", "dineout", "combined"]),
  couponSensitive: z.boolean(),
  includeDineout: z.boolean(),
});

const householdPreferenceSimulationSchema = z.object({
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  householdMode: z.enum(["primary_planner", "family_group", "office_team", "weekend_guest"]),
  preferredServer: z.enum(["food", "instamart", "dineout", "combined"]),
  consentToUseHistory: z.boolean(),
  recentFailure: z.boolean(),
  occasionMode: z.boolean(),
});

const guestCollaborationComposeSchema = z.object({
  templateId: z.string().trim().min(2).max(80),
  channel: z.enum(["web_share", "slack_teams", "calendar_ics", "email_draft", "voice_brief"]),
  guestCount: z.number().int().min(1).max(100),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  includeDineout: z.boolean(),
});

const luxuryExperienceComposeSchema = z.object({
  modeId: z.enum(["lean", "premium", "family", "social", "training"]),
  workspaceId: z.string().trim().min(2).max(80),
  city: z.enum(["Bengaluru", "Delhi NCR", "Mumbai"]),
  guestCount: z.number().int().min(1).max(50),
  budget: z.number().int().min(250).max(50000),
  includeDineout: z.boolean(),
});

const reviewerArtifactPacketSchema = z.object({
  sectionId: z.string().trim().min(2).max(80),
  channel: z.enum(["access_form", "email_draft", "github_packet"]),
  audience: z.enum(["builder_access", "demo_review", "partner_support"]),
  includeScreenshots: z.boolean(),
  includeDemoVideo: z.boolean(),
  includeCredentialGates: z.boolean(),
});

const visualQaRehearsalSchema = z.object({
  targetGroupId: z.string().trim().min(2).max(80),
  viewport: z.enum(["desktop", "tablet", "mobile"]),
  captureMode: z.enum(["full_manifest", "critical_review", "mobile_regression", "widget_fallback"]),
  includeSwiggyWidgets: z.boolean(),
  includeManualAttachments: z.boolean(),
});

const docsCoverageDrillSchema = z.object({
  section: z.enum(["start", "build", "operate", "reference", "blog"]),
  focus: z.enum(["all_pages", "mcp_tools", "access_review", "agent_build"]),
  includeRenderedTwins: z.boolean(),
  includeExternalGates: z.boolean(),
});

const docsTwinRehearsalSchema = z.object({
  laneId: z.string().trim().min(2).max(80),
  section: z.enum(["start", "build", "operate", "reference", "blog"]),
  includeRenderedPages: z.boolean(),
  includeProofLinks: z.boolean(),
});

const llmsManifestRehearsalSchema = z.object({
  mode: z.enum(["live_fetch", "coverage_fallback", "tool_parity"]),
  includeFullManifest: z.boolean(),
  enforceToolParity: z.boolean(),
  includeDriftGates: z.boolean(),
});

const operatingContractRehearsalSchema = z.object({
  mode: z.enum(["local_packet", "staging_cutover", "production_launch"]),
  includeCapacityNotice: z.boolean(),
  includeSupportPacket: z.boolean(),
  includeVersionWatch: z.boolean(),
  includeStatusPageFallback: z.boolean(),
  includeStagingCredentials: z.boolean(),
});

const brandComplianceRehearsalSchema = z.object({
  mode: z.enum(["local_review", "asset_onboarding", "cobrand_launch"]),
  includeAttributionAudit: z.boolean(),
  includeFinalScreenshots: z.boolean(),
  includeOfficialAssets: z.boolean(),
  includeCobrandApproval: z.boolean(),
});

const offerDecisionSchema = z.object({
  server: z.enum(["food", "instamart", "dineout", "combined"]),
  offerType: z.enum(["food_coupon", "dineout_deal", "instamart_value", "combined_savings"]),
  cartFresh: z.boolean(),
  paymentMode: z.enum(["cod", "online", "free_booking", "unknown"]),
  claimedSavings: z.number().min(0).max(100000),
  userConfirmed: z.boolean(),
});

const locationSelectionSchema = z.object({
  server: z.enum(["food", "instamart", "dineout", "combined"]),
  sourceTool: z.enum(["get_addresses", "get_saved_locations", "create_address", "delete_address"]),
  selectedLabel: z.string().min(1).max(80),
  userConfirmed: z.boolean(),
  downstreamIntent: z.enum([
    "food_discovery",
    "instamart_discovery",
    "dineout_discovery",
    "cart_checkout",
    "combined_plan",
    "address_create",
    "address_delete",
  ]),
  previousContextFresh: z.boolean(),
});

const orderLifecycleProbeSchema = z.object({
  server: z.enum(["food", "instamart", "dineout"]),
  trigger: z.enum(["user_tracking_refresh", "commercial_action_timeout", "commercial_action_5xx", "user_retry_request", "support_request"]),
  currentStatus: z.enum(["known_active", "known_completed", "not_found", "unknown"]),
  statusAgeSeconds: z.number().int().min(0).max(86400),
  orderOrBookingId: z.string().min(1).max(120).optional(),
  userConfirmedRetry: z.boolean(),
});

const cartMutationExecutionSchema = z.object({
  server: z.enum(["food", "instamart", "dineout"]),
  mutationTool: z.enum(["update_food_cart", "flush_food_cart", "update_cart", "clear_cart", "create_cart"]),
  toolArguments: z.record(z.string(), z.unknown()).default({}),
  contextFresh: z.boolean(),
  userConfirmed: z.boolean(),
  commercialActionRequested: z.boolean(),
});

const discoveryResolutionSchema = z.object({
  server: z.enum(["food", "instamart", "dineout"]),
  discoveryTool: z.enum([
    "search_restaurants",
    "get_restaurant_menu",
    "search_menu",
    "search_products",
    "your_go_to_items",
    "search_restaurants_dineout",
    "get_restaurant_details",
    "get_available_slots",
  ]),
  toolArguments: z.record(z.string(), z.unknown()).default({}),
  contextFresh: z.boolean(),
  userSelectedResult: z.boolean(),
  downstreamIntent: z.enum(["browse", "cart_mutation", "booking", "combined_plan"]),
});

const confirmationExecutionSchema = z.object({
  server: z.enum(["food", "instamart", "dineout"]),
  actionTool: z.enum(["place_food_order", "checkout", "book_table"]),
  preflightArguments: z.record(z.string(), z.unknown()).default({}),
  actionArguments: z.record(z.string(), z.unknown()).default({}),
  statusProbeArguments: z.record(z.string(), z.unknown()).default({}),
  contextFresh: z.boolean(),
  userConfirmed: z.boolean(),
  separateConfirmation: z.boolean(),
  paymentOrFreeTruthAcknowledged: z.boolean(),
  dineoutFreeBooking: z.boolean().default(false),
  simulateAmbiguousResult: z.boolean().default(false),
});

const supportReportSchema = z.object({
  server: z.enum(["food", "instamart", "dineout"]),
  failedTool: z.string().trim().min(2).max(80),
  severity: z.enum(["S0", "S1", "S2", "S3"]),
  errorMessage: z.string().trim().min(3).max(320),
  flowDescription: z.string().trim().min(3).max(320),
  userNotes: z.string().trim().min(3).max(320),
  toolContext: z.record(z.string(), z.unknown()).default({}),
  sessionId: z.string().trim().min(4).max(120).optional(),
  issueObserved: z.boolean(),
  userConsented: z.boolean(),
});

const errorClassificationSchema = z.object({
  server: z.enum(["food", "instamart", "dineout"]),
  tool: z.string().trim().min(2).max(80),
  httpStatus: z.number().int().min(100).max(599),
  jsonRpcCode: z.number().int().optional(),
  success: z.literal(false).optional(),
  message: z.string().trim().min(1).max(320),
  symbolicCode: z.string().trim().min(2).max(80).optional(),
  routeClass: z
    .enum(["read", "cart_mutation", "coupon", "commercial_action", "tracking", "support"])
    .optional(),
});

const aiClientConfigValidationSchema = z.object({
  targetId: z.enum(["claude_desktop", "chatgpt", "cursor", "vs_code", "windsurf", "generic_mcp"]),
  config: z.record(z.string(), z.unknown()).optional(),
});

const resourcePromptExecutionSchema = z
  .object({
    server: z.enum(["food", "instamart", "dineout"]),
    method: z.enum(["resources/list", "resources/read", "prompts/list", "prompts/get"]),
    params: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((value, ctx) => {
    if (value.method === "resources/read" && typeof value.params.uri !== "string") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "resources/read requires params.uri" });
    }
    if (value.method === "prompts/get" && typeof value.params.name !== "string") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "prompts/get requires params.name" });
    }
  });

const developerFirstCallSchema = z.object({
  drillId: z.enum(["food_get_addresses", "food_search_restaurants", "instamart_search_products", "dineout_search_restaurants"]),
});

const mcpServerSchema = z.enum(["food", "instamart", "dineout"]);
const stagingReplayRunSchema = z.object({
  server: mcpServerSchema,
  tool: z.string().trim().min(1).max(120),
  arguments: z.record(z.string(), z.unknown()).default({}),
});
const agentSurfaceSchema = z.enum(["chat", "voice"]);
const surfaceContractRehearsalSchema = z.object({
  sessionId: z.string().min(4),
  scenarioId: z.string().trim().optional(),
  preferredSurface: z.enum(["chat", "voice", "widget"]).optional(),
});

export interface MealPilotServerOptions {
  config?: ServerConfig;
  store?: SessionStore;
  serveStatic?: boolean;
}

function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

function hashForLog(input: string) {
  return `sha256:${crypto.createHash("sha256").update(input).digest("hex").slice(0, 16)}`;
}

function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
}

function requestContext(telemetry: RuntimeTelemetryRecorder) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = crypto.randomUUID();
    res.setHeader("X-MealPilot-Request-Id", requestId);
    const startedAt = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        const durationMs = Date.now() - startedAt;
        const isMcpToolCall = req.method === "POST" && /^\/api\/mcp\/(food|instamart|dineout)$/.test(req.path);
        const event = isMcpToolCall ? "mcp_tool_call" : "mealpilot_request";
        telemetry.recordRequest({
          req,
          ts: new Date().toISOString(),
          level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
          requestId,
          event,
          method: req.method,
          durationMs,
          status: res.statusCode,
        });
        console.info(
          JSON.stringify({
            event,
            requestId,
            method: req.method,
            path: req.path,
            status: res.statusCode,
            durationMs,
          }),
        );
      }
    });
    next();
  };
}

export function createMealPilotServer(options: MealPilotServerOptions = {}) {
  const config = options.config ?? readConfig();
  const store = options.store ?? createMemorySessionStore();
  const telemetry = createRuntimeTelemetry();
  let runtimeAccessToken = config.swiggyAccessToken;
  let runtimeTokenExpiresAt = config.swiggyTokenExpiresAt;
  let runtimeTokenSource: "runtime" | "environment" | "none" = config.swiggyAccessToken ? "environment" : "none";
  let latestAuthEvent: AuthLifecycleEvent | undefined = runtimeAccessToken
    ? {
        status: "callback_exchanged",
        label: "Token loaded from environment",
        at: new Date().toISOString(),
        tokenExchange: "exchanged",
        tokenSource: "environment",
        expiresAt: runtimeTokenExpiresAt,
        scope: config.swiggyScope,
      }
    : undefined;
  const app = express();

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(requestContext(telemetry));
  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json({ limit: "1mb" }));

  function runtimeCredentials() {
    return {
      accessToken: runtimeAccessToken,
      expiresAt: runtimeTokenExpiresAt,
      tokenSource: runtimeTokenSource,
    };
  }

  function buildRuntimeGatewayStatus() {
    return buildMcpGatewayStatus(config, runtimeCredentials());
  }

  function buildAuthStatus() {
    return buildSwiggyAuthStatusReport({
      config,
      gatewayAuth: buildRuntimeGatewayStatus().auth,
      pendingVerifierCount: store.getDiagnostics().authSessionCount,
      latestEvent: latestAuthEvent,
    });
  }

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      appName: config.appName,
      mode: config.swiggyMode,
      hasClientId: config.swiggyClientId !== "replace_after_builder_access",
      storage: store.getDiagnostics(),
      time: new Date().toISOString(),
    });
  });

  app.get("/api/ready", (_req, res) => {
    const plans = store.getAllPlans();
    const coverage = buildMcpCoverage();
    const totalTools = coverage.reduce((sum, server) => sum + server.totalTools, 0);
    const mappedTools = coverage.reduce((sum, server) => sum + server.demoReady + server.guarded, 0);
    const ready = totalTools === mappedTools && config.swiggyScope.includes("mcp:tools");

    res.status(ready ? 200 : 503).json({
      ok: ready,
      mode: config.swiggyMode,
      checks: {
        api: "ready",
        staticServing: options.serveStatic ? "enabled" : "disabled",
        mcpCoverage: `${mappedTools}/${totalTools}`,
        scope: config.swiggyScope,
        sessions: plans.length,
        storage: store.getDiagnostics().durable ? "durable" : "memory",
      },
    });
  });

  app.get("/api/openapi.json", (_req, res) => {
    res.json(buildOpenApiDocument(config));
  });

  app.get("/api/telemetry/runtime", (_req, res) => {
    res.json({ telemetry: telemetry.buildReport() });
  });

  app.get("/api/audit-ledger", (_req, res) => {
    res.json({ auditLedger: buildAuditLedgerCenter({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/config", (_req, res) => {
    res.json({
      appName: config.appName,
      mode: config.swiggyMode,
      redirectUri: config.swiggyRedirectUri,
      scope: config.swiggyScope,
      requestedServers: ["food", "instamart", "dineout"],
      storage: store.getDiagnostics(),
      gateway: buildRuntimeGatewayStatus(),
    });
  });

  app.get("/api/mcp-gateway", (_req, res) => {
    res.json({ gateway: buildRuntimeGatewayStatus() });
  });

  const handshakeDoctorHandler = asyncRoute(async (_req: Request, res: Response) => {
    res.json({ handshakeDoctor: await buildSwiggyHandshakeDoctor(config) });
  });

  app.get("/api/swiggy-handshake-doctor", handshakeDoctorHandler);
  app.get("/api/mcp/handshake-doctor", handshakeDoctorHandler);

  app.get("/api/mcp/staging-cutover", (_req, res) => {
    res.json({
      stagingCutover: buildSwiggyStagingCutoverRehearsal({
        config,
        credentials: runtimeCredentials(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/swiggy-staging-replay", (_req, res) => {
    const runtimeConfig = {
      ...config,
      swiggyAccessToken: runtimeAccessToken,
      swiggyTokenExpiresAt: runtimeTokenExpiresAt,
    };
    res.json({
      stagingReplay: buildSwiggyStagingReplayCenter({
        config: runtimeConfig,
        credentials: runtimeCredentials(),
        certification: buildStagingCertificationMatrix(runtimeConfig),
      }),
    });
  });

  app.post(
    "/api/swiggy-staging-replay/run",
    asyncRoute(async (req, res) => {
      const body = stagingReplayRunSchema.parse(req.body);
      const runtimeConfig = {
        ...config,
        swiggyAccessToken: runtimeAccessToken,
        swiggyTokenExpiresAt: runtimeTokenExpiresAt,
      };
      const replayExecution = await buildSwiggyStagingReplayExecution({
        config: runtimeConfig,
        credentials: runtimeCredentials(),
        server: body.server,
        tool: body.tool,
        toolArguments: body.arguments,
        executeTool: async (server, request) => {
          if (runtimeConfig.swiggyMode === "mock") {
            return handleMockJsonRpc(server, request);
          }
          return callConfiguredSwiggyTool({
            config: runtimeConfig,
            server,
            request,
            accessToken: runtimeAccessToken,
          });
        },
      });

      res.json({ replayExecution });
    }),
  );

  app.get("/api/swiggy-staging-credential-drill", (_req, res) => {
    const runtimeConfig = {
      ...config,
      swiggyAccessToken: runtimeAccessToken,
      swiggyTokenExpiresAt: runtimeTokenExpiresAt,
    };
    const cutover = buildSwiggyStagingCutoverRehearsal({
      config,
      credentials: runtimeCredentials(),
      latestPlan: store.getAllPlans().at(-1),
    });

    res.json({
      stagingCredentialDrill: buildSwiggyStagingCredentialDrill({
        config: runtimeConfig,
        cutover,
        onboarding: buildCredentialOnboardingReport(runtimeConfig),
        sandbox: buildSandboxCredentialWorkbench(runtimeConfig),
        certification: buildStagingCertificationMatrix(runtimeConfig),
      }),
    });
  });

  app.get("/api/swiggy-staging-seed-smoke-center", (_req, res) => {
    const runtimeConfig = {
      ...config,
      swiggyAccessToken: runtimeAccessToken,
      swiggyTokenExpiresAt: runtimeTokenExpiresAt,
    };
    const cutover = buildSwiggyStagingCutoverRehearsal({
      config,
      credentials: runtimeCredentials(),
      latestPlan: store.getAllPlans().at(-1),
    });
    const sandbox = buildSandboxCredentialWorkbench(runtimeConfig);
    const certification = buildStagingCertificationMatrix(runtimeConfig);
    const drill = buildSwiggyStagingCredentialDrill({
      config: runtimeConfig,
      cutover,
      onboarding: buildCredentialOnboardingReport(runtimeConfig),
      sandbox,
      certification,
    });

    res.json({
      stagingSeedSmoke: buildSwiggyStagingSeedSmokeCenter({
        config: runtimeConfig,
        sandbox,
        drill,
        certification,
      }),
    });
  });

  app.get("/api/swiggy-live-signal-calibration", (_req, res) => {
    const runtimeConfig = {
      ...config,
      swiggyAccessToken: runtimeAccessToken,
      swiggyTokenExpiresAt: runtimeTokenExpiresAt,
    };
    const plans = store.getAllPlans();
    const latestPlan = plans.at(-1);
    const cutover = buildSwiggyStagingCutoverRehearsal({
      config,
      credentials: runtimeCredentials(),
      latestPlan,
    });
    const certification = buildStagingCertificationMatrix(runtimeConfig);
    const stagingCredentialDrill = buildSwiggyStagingCredentialDrill({
      config: runtimeConfig,
      cutover,
      onboarding: buildCredentialOnboardingReport(runtimeConfig),
      sandbox: buildSandboxCredentialWorkbench(runtimeConfig),
      certification,
    });

    res.json({
      liveSignalCalibration: buildSwiggyLiveSignalCalibration({
        config: runtimeConfig,
        latestPlan,
        household: buildHouseholdPreferenceGraph(),
        offer: buildSwiggyOfferIntelligence({ plans, config: runtimeConfig }),
        orderLifecycle: buildSwiggyOrderLifecycle({ plans, config: runtimeConfig }),
        locationTrust: buildSwiggyLocationTrust({ plans, config: runtimeConfig }),
        discovery: buildSwiggyDiscoveryFreshness({ plans, config: runtimeConfig }),
        stagingCredentialDrill,
        certification,
      }),
    });
  });

  app.get("/api/credential-onboarding", (_req, res) => {
    res.json({
      onboarding: buildCredentialOnboardingReport({
        ...config,
        swiggyAccessToken: runtimeAccessToken,
        swiggyTokenExpiresAt: runtimeTokenExpiresAt,
      }),
    });
  });

  app.get("/api/swiggy-credential-vault-center", (_req, res) => {
    res.json({
      credentialVault: buildSwiggyCredentialVaultCenter({
        ...config,
        swiggyAccessToken: runtimeAccessToken,
        swiggyTokenExpiresAt: runtimeTokenExpiresAt,
      }),
    });
  });

  app.get("/api/swiggy-credential-handoff-center", (_req, res) => {
    res.json({
      credentialHandoff: buildSwiggyCredentialHandoffCenter({
        ...config,
        swiggyAccessToken: runtimeAccessToken,
        swiggyTokenExpiresAt: runtimeTokenExpiresAt,
      }),
    });
  });

  app.get("/api/swiggy-credential-issuance/state", (_req, res) => {
    res.json({ credentialIssuance: store.getCredentialIssuanceState() });
  });

  app.patch("/api/swiggy-credential-issuance/state", asyncRoute(async (req, res) => {
    const body = credentialIssuanceStateSchema.parse(req.body);
    const current = store.getCredentialIssuanceState();
    const nextState = store.updateCredentialIssuanceState({
      ...current,
      ...body,
      seededUsersReceived: {
        ...current.seededUsersReceived,
        ...(body.seededUsersReceived ?? {}),
      },
      updatedAt: new Date().toISOString(),
    });
    const runtimeConfig = {
      ...config,
      swiggyAccessToken: runtimeAccessToken,
      swiggyTokenExpiresAt: runtimeTokenExpiresAt,
    };

    res.json({
      credentialIssuance: nextState,
      credentialReadinessDossier: await buildSwiggyCredentialReadinessDossier({
        config: runtimeConfig,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
        credentialIssuance: nextState,
      }),
    });
  }));

  app.get("/api/swiggy-credential-readiness-dossier", asyncRoute(async (_req, res) => {
    const runtimeConfig = {
      ...config,
      swiggyAccessToken: runtimeAccessToken,
      swiggyTokenExpiresAt: runtimeTokenExpiresAt,
    };
    res.json({
      credentialReadinessDossier: await buildSwiggyCredentialReadinessDossier({
        config: runtimeConfig,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
        credentialIssuance: store.getCredentialIssuanceState(),
      }),
    });
  }));

  app.post("/api/swiggy-credential-readiness-dossier/rehearse", asyncRoute(async (req, res) => {
    const body = credentialReadinessRehearsalSchema.parse(req.body);
    const runtimeConfig = {
      ...config,
      swiggyAccessToken: runtimeAccessToken,
      swiggyTokenExpiresAt: runtimeTokenExpiresAt,
    };
    const dossier = await buildSwiggyCredentialReadinessDossier({
      config: runtimeConfig,
      profile: store.getProfile(),
      coverage: buildMcpCoverage(),
      latestPlan: store.getAllPlans().at(-1),
      handoffState: store.getAccessSubmissionState(),
      credentialIssuance: store.getCredentialIssuanceState(),
    });

    res.json({
      credentialReadinessRehearsal: rehearseSwiggyCredentialReadiness({
        dossier,
        mode: body.mode,
        includeSourceFreeze: body.includeSourceFreeze,
        includeCredentialReceipt: body.includeCredentialReceipt,
        includeProductionPromotion: body.includeProductionPromotion,
      }),
    });
  }));

  app.get("/api/sandbox-credential-workbench", (_req, res) => {
    res.json({
      sandboxWorkbench: buildSandboxCredentialWorkbench({
        ...config,
        swiggyAccessToken: runtimeAccessToken,
        swiggyTokenExpiresAt: runtimeTokenExpiresAt,
      }),
    });
  });

  app.get("/api/enterprise-delegated-auth", (_req, res) => {
    res.json({ enterpriseAuth: buildEnterpriseDelegatedAuthCenter(config) });
  });

  app.get("/api/enterprise-platform-center", (_req, res) => {
    res.json({ enterprisePlatform: buildEnterprisePlatformCenter(config) });
  });

  app.get("/api/profile", (_req, res) => {
    res.json({ profile: store.getProfile() });
  });

  app.put("/api/profile", (req, res) => {
    const profile = profileSchema.parse({
      ...defaultUserProfile,
      ...req.body,
    });
    res.json({ profile: store.updateProfile(profile) });
  });

  app.post(
    "/api/plan",
    asyncRoute(async (req, res) => {
      const request = planningRequestSchema.parse(req.body) satisfies UserPlanningRequest;
      const plan = await createMealPlan(request, undefined, store.getProfile());
      store.savePlan(plan);

      res.status(201).json({
        plan,
        meta: {
          userIdHash: hashForLog(`${request.city}:${request.diet}`),
          storedServerSide: true,
        },
      });
    }),
  );

  app.post(
    "/api/confirm",
    asyncRoute(async (req, res) => {
      const body = confirmSchema.parse(req.body);
      const plan = store.getPlan(body.sessionId);

      if (!plan) {
        res.status(404).json({ error: { message: "Session not found." } });
        return;
      }

      const updatedPlan = await executeConfirmedRecommendation(plan, body.recommendationId);
      const finalPlan = { ...updatedPlan, tracking: buildTrackingEvents(updatedPlan) };
      store.updatePlan(finalPlan);
      res.json({ plan: finalPlan });
    }),
  );

  app.post(
    "/api/confirm-all",
    asyncRoute(async (req, res) => {
      const body = z.object({ sessionId: z.string().min(4) }).parse(req.body);
      const plan = store.getPlan(body.sessionId);

      if (!plan) {
        res.status(404).json({ error: { message: "Session not found." } });
        return;
      }

      const updatedPlan = await executeAllPreparedRecommendations(plan);
      const finalPlan = { ...updatedPlan, tracking: buildTrackingEvents(updatedPlan) };
      store.updatePlan(finalPlan);
      res.json({ plan: finalPlan });
    }),
  );

  app.post(
    "/api/substitute",
    asyncRoute(async (req, res) => {
      const body = substitutionSchema.parse(req.body);
      const plan = store.getPlan(body.sessionId);

      if (!plan) {
        res.status(404).json({ error: { message: "Session not found." } });
        return;
      }

      const updatedPlan = substitutePlanItem(plan, body.recommendationId, body.alternativeId);
      store.updatePlan(updatedPlan);
      res.json({ plan: updatedPlan });
    }),
  );

  app.post(
    "/api/remove-item",
    asyncRoute(async (req, res) => {
      const body = removeItemSchema.parse(req.body);
      const plan = store.getPlan(body.sessionId);

      if (!plan) {
        res.status(404).json({ error: { message: "Session not found." } });
        return;
      }

      const updatedPlan = removeRecommendationItem(plan, body.recommendationId, body.itemId);
      store.updatePlan(updatedPlan);
      res.json({ plan: updatedPlan });
    }),
  );

  app.get("/api/tracking/:sessionId", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    const tracking = buildTrackingEvents(plan);
    const updatedPlan = { ...plan, tracking };
    store.updatePlan(updatedPlan);
    res.json({ tracking, plan: updatedPlan });
  });

  app.get("/api/builder-package", (_req, res) => {
    const readiness = buildReadinessChecklist(store.getProfile());
    res.json({
      readiness,
      application: {
        integrationName: "MealPilot India",
        requestedServers: ["food", "instamart", "dineout"],
        expectedVolume: "100 pilot users, below 1 QPS peak, about 1,600-3,000 MCP tool calls per week.",
        useCase:
          "A privacy-first AI commerce assistant that composes Food, Instamart, and Dineout for Indian household meal planning with explicit confirmation gates.",
      },
    });
  });

  app.get("/api/builder-package.md", (_req, res) => {
    const plans = store.getAllPlans();
    const latestPlan = plans.at(-1);
    const markdown = buildApplicationMarkdown({
      profile: store.getProfile(),
      readiness: buildReadinessChecklist(store.getProfile()),
      coverage: buildMcpCoverage(),
      goLive: buildGoLiveChecks({
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
        hasPlan: plans.length > 0,
        hasReminders: store.getReminders().length > 0,
        hasConfirmedAction:
          latestPlan?.recommendations.some((recommendation) => recommendation.status === "confirmed") ?? false,
      }),
    });
    res.type("text/markdown").send(markdown);
  });

  app.get("/api/mcp/catalog", (_req, res) => {
    const coverage = buildMcpCoverage();
    res.json({
      totalTools: coverage.reduce((sum, server) => sum + server.totalTools, 0),
      demoReady: coverage.reduce((sum, server) => sum + server.demoReady, 0),
      guarded: coverage.reduce((sum, server) => sum + server.guarded, 0),
      planned: coverage.reduce((sum, server) => sum + server.planned, 0),
      servers: coverage,
    });
  });

  app.get("/api/mcp/capability-registry", (_req, res) => {
    res.json({ registry: buildMcpCapabilityRegistry({ config, coverage: buildMcpCoverage() }) });
  });

  app.get("/api/mcp/resource-prompt-studio", (_req, res) => {
    res.json({ resourcePromptStudio: buildMcpResourcePromptStudio() });
  });

  app.post(
    "/api/mcp/resource-prompt-studio/execute",
    asyncRoute(async (req, res) => {
      const body = resourcePromptExecutionSchema.parse(req.body);
      const executeJsonRpc = async (
        server: SwiggyServer,
        method: "resources/list" | "resources/read" | "prompts/list" | "prompts/get",
        params: Record<string, unknown>,
      ) => {
        const request = {
          jsonrpc: "2.0",
          id: `resource-prompt-${Date.now().toString(36)}`,
          method,
          params,
        } as JsonRpcRequest;

        if (config.swiggyMode === "mock") {
          return handleMockJsonRpc(server, request);
        }

        return callConfiguredSwiggyTool({
          config,
          server,
          request,
          accessToken: runtimeAccessToken,
        });
      };

      res.json({
        resourcePromptExecution: await executeMcpResourcePrompt({
          config,
          ...body,
          liveCredentialReady: Boolean(runtimeAccessToken),
          executeJsonRpc,
        }),
      });
    }),
  );

  app.get(
    "/api/mcp/tool-contract-matrix",
    asyncRoute(async (_req, res) => {
      res.json({ matrix: await buildSwiggyToolContractMatrix() });
    }),
  );

  app.get(
    "/api/mcp/scenario-runner",
    asyncRoute(async (_req, res) => {
      res.json({ scenarioRunner: await buildSwiggyScenarioRunner() });
    }),
  );

  app.get("/api/mcp/state-orchestrator", (_req, res) => {
    res.json({ stateOrchestrator: buildSwiggyStateOrchestrator(store.getAllPlans().at(-1)) });
  });

  app.post("/api/mcp/state-orchestrator/rehearse-surface", (req, res) => {
    const body = surfaceContractRehearsalSchema.parse(req.body);
    const plan = store.getPlan(body.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({
      surfaceRehearsal: rehearseSwiggySurfaceContract({
        plan,
        scenarioId: body.scenarioId,
        preferredSurface: body.preferredSurface,
      }),
    });
  });

  app.get("/api/mcp/widget-runtime", (_req, res) => {
    res.json({ widgetRuntime: buildSwiggyWidgetRuntime(store.getAllPlans().at(-1)) });
  });

  app.get("/api/swiggy-widget-experience-composer", (_req, res) => {
    res.json({ widgetExperience: buildSwiggyWidgetExperienceComposer(store.getAllPlans().at(-1)) });
  });

  app.get("/api/swiggy-hosted-widget-activation", (_req, res) => {
    res.json({ hostedWidgetActivation: buildSwiggyHostedWidgetActivationCenter(store.getAllPlans().at(-1)) });
  });

  app.get("/api/swiggy-agent-experience-benchmark", (_req, res) => {
    res.json({ agentBenchmark: buildSwiggyAgentExperienceBenchmark(store.getAllPlans().at(-1)) });
  });

  app.get("/api/swiggy-private-pilot-control-room", (_req, res) => {
    res.json({ privatePilot: buildSwiggyPrivatePilotControlRoom() });
  });

  app.get("/api/mcp/commercial-action-guard", (_req, res) => {
    res.json({ commercialActionGuard: buildCommercialActionGuard(store.getAllPlans().at(-1)) });
  });

  app.get("/api/mcp/backpressure-governor", (_req, res) => {
    res.json({ backpressureGovernor: buildMcpBackpressureGovernor(store.getAllPlans().at(-1)) });
  });

  app.get("/api/swiggy-builders-map", (_req, res) => {
    res.json({ map: buildSwiggyBuildersMap() });
  });

  app.get("/api/swiggy-capability-traceability", (_req, res) => {
    res.json({ capabilityTraceability: buildSwiggyCapabilityTraceability(config) });
  });

  app.get("/api/swiggy-homepage-signal-coverage", (_req, res) => {
    res.json({
      homepageSignalCoverage: buildSwiggyHomepageSignalCoverageBoard({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/swiggy-builders-completion-ledger", (_req, res) => {
    res.json({
      buildersCompletion: buildSwiggyBuildersCompletionLedger({
        config,
        profile: defaultUserProfile,
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get(
    "/api/swiggy-builders-coverage-receipt",
    asyncRoute(async (_req, res) => {
      res.json({
        coverageReceipt: await buildSwiggyBuildersCoverageReceipt({
          config,
          latestPlan: store.getAllPlans().at(-1),
        }),
      });
    }),
  );

  app.get("/api/swiggy-website-atlas", (_req, res) => {
    res.json({ atlas: buildSwiggyWebsiteAtlas() });
  });

  app.get(
    "/api/swiggy-builders-site-parity",
    asyncRoute(async (_req, res) => {
      res.json({ buildersSiteParity: await buildSwiggyBuildersSiteParityAuditor() });
    }),
  );

  app.get(
    "/api/swiggy-builders-page-mesh",
    asyncRoute(async (_req, res) => {
      res.json({ buildersPageMesh: await buildSwiggyBuildersPageMeshAuditor() });
    }),
  );

  app.get("/api/swiggy-builders-launch-story", (_req, res) => {
    res.json({ launchStory: buildSwiggyBuildersLaunchStoryCenter() });
  });

  app.get("/api/swiggy-builders-module-intelligence", (_req, res) => {
    res.json({ moduleIntelligence: buildSwiggyBuildersModuleIntelligenceCenter() });
  });

  app.get(
    "/api/swiggy-builders-module-witness",
    asyncRoute(async (_req, res) => {
      res.json({
        moduleWitness: await buildSwiggyBuildersModuleWitness({
          config,
          latestPlan: store.getAllPlans().at(-1),
        }),
      });
    }),
  );

  app.get(
    "/api/swiggy-builders-navigation-witness",
    asyncRoute(async (_req, res) => {
      res.json({
        navigationWitness: await buildSwiggyBuildersNavigationWitness({
          config,
          latestPlan: store.getAllPlans().at(-1),
        }),
      });
    }),
  );

  app.get("/api/swiggy-builders-benefits-witness", (_req, res) => {
    res.json({
      benefitsWitness: buildSwiggyBuildersBenefitsWitness({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
      }),
    });
  });

  app.get("/api/swiggy-builders-ai-native-witness", (_req, res) => {
    res.json({ aiNativeWitness: buildSwiggyBuildersAiNativeWitness(store.getAllPlans().at(-1)) });
  });

  app.get("/api/swiggy-builders-enterprise-witness", (_req, res) => {
    res.json({
      enterpriseWitness: buildSwiggyBuildersEnterpriseWitness({
        config,
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
      }),
    });
  });

  app.get("/api/swiggy-builders-consumer-witness", (_req, res) => {
    res.json({
      consumerWitness: buildSwiggyBuildersConsumerWitness({
        config,
        plans: store.getAllPlans(),
      }),
    });
  });

  app.get("/api/swiggy-builders-journey-gates", (_req, res) => {
    res.json({
      journeyGates: buildSwiggyBuildersJourneyGateCenter({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.get("/api/swiggy-builders-homepage-experience", (_req, res) => {
    res.json({
      homepageExperience: buildSwiggyBuildersHomepageExperienceCenter({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.get("/api/swiggy-builders-source-evolution", (_req, res) => {
    res.json({
      sourceEvolution: buildSwiggyBuildersSourceEvolutionCenter({
        config,
        profile: store.getProfile(),
        latestPlan: store.getAllPlans().at(-1),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.get(
    "/api/swiggy-builders-live-source-resilience",
    asyncRoute(async (_req, res) => {
      res.json({
        liveSourceResilience: await buildSwiggyBuildersLiveSourceResilienceCenter({
          config,
          profile: store.getProfile(),
          latestPlan: store.getAllPlans().at(-1),
          plans: store.getAllPlans(),
          telemetry: telemetry.buildReport(),
          handoffState: store.getAccessSubmissionState(),
        }),
      });
    }),
  );

  app.get(
    "/api/swiggy-source-availability-audit",
    asyncRoute(async (_req, res) => {
      res.json({ sourceAvailability: await buildSwiggySourceAvailabilityAudit() });
    }),
  );

  app.get(
    "/api/swiggy-builders-review-decision",
    asyncRoute(async (_req, res) => {
      res.json({
        reviewDecision: await buildSwiggyBuildersReviewDecisionCenter({
          config,
          profile: store.getProfile(),
          coverage: buildMcpCoverage(),
          latestPlan: store.getAllPlans().at(-1),
          plans: store.getAllPlans(),
          telemetry: telemetry.buildReport(),
          handoffState: store.getAccessSubmissionState(),
        }),
      });
    }),
  );

  app.get("/api/swiggy-builder-intake", (_req, res) => {
    res.json({
      intake: buildSwiggyBuilderIntakeCommandCenter({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/swiggy-faq-policy", (_req, res) => {
    res.json({ faqPolicy: buildSwiggyFaqPolicyCenter() });
  });

  app.get("/api/swiggy-faq-resolution-center", (_req, res) => {
    res.json({
      faqResolution: buildSwiggyFaqResolutionCenter({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.post("/api/swiggy-faq-resolution-center/answer", (req, res) => {
    const question = typeof req.body?.question === "string" ? req.body.question : "";
    res.json({
      faqAnswer: answerSwiggyFaqQuestion({
        question,
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.get("/api/swiggy-growth-partnership", (_req, res) => {
    res.json({ growthPartnership: buildSwiggyGrowthPartnershipCenter() });
  });

  app.post("/api/swiggy-growth-partnership/compose", (req, res) => {
    res.json({
      growthAsk: composeSwiggyGrowthPartnershipAsk({
        experimentId: typeof req.body?.experimentId === "string" ? req.body.experimentId : "",
        askId: typeof req.body?.askId === "string" ? req.body.askId : "",
        audienceNote: typeof req.body?.audienceNote === "string" ? req.body.audienceNote : "",
      }),
    });
  });

  app.get("/api/swiggy-talent-signal-center", (_req, res) => {
    res.json({ talentSignal: buildSwiggyTalentSignalCenter() });
  });

  app.post("/api/swiggy-talent-signal-center/compose", (req, res) => {
    res.json({
      talentOutreach: composeSwiggyTalentOutreach({
        pathId: typeof req.body?.pathId === "string" ? req.body.pathId : "",
        demoUrl: typeof req.body?.demoUrl === "string" ? req.body.demoUrl : "",
        githubUrl: typeof req.body?.githubUrl === "string" ? req.body.githubUrl : "",
        technicalSummary: typeof req.body?.technicalSummary === "string" ? req.body.technicalSummary : "",
      }),
    });
  });

  app.get("/api/swiggy-conversion-center", (_req, res) => {
    res.json({
      conversion: buildSwiggyConversionCenter({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.get("/api/swiggy-benefits-activation-center", (_req, res) => {
    res.json({
      benefitsActivation: buildSwiggyBenefitsActivationCenter({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
      }),
    });
  });

  app.post("/api/swiggy-benefits-activation-center/activate", (req, res) => {
    res.json({
      benefitsExecution: activateSwiggyBenefit({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
        benefitId: typeof req.body?.benefitId === "string" ? req.body.benefitId : "",
      }),
    });
  });

  app.get("/api/swiggy-showcase-submission-center", (_req, res) => {
    res.json({ showcaseSubmission: buildSwiggyShowcaseSubmissionCenter() });
  });

  app.post("/api/swiggy-showcase-submission-center/compose", (req, res) => {
    res.json({
      showcaseComposition: composeSwiggyShowcaseSubmission({
        demoUrl: typeof req.body?.demoUrl === "string" ? req.body.demoUrl : "",
        githubUrl: typeof req.body?.githubUrl === "string" ? req.body.githubUrl : "",
        operatorEmail: typeof req.body?.operatorEmail === "string" ? req.body.operatorEmail : "",
        note: typeof req.body?.note === "string" ? req.body.note : "",
      }),
    });
  });

  app.get("/api/swiggy-demo-evidence-director", (_req, res) => {
    res.json({ demoEvidence: buildSwiggyDemoEvidenceDirector() });
  });

  app.get("/api/swiggy-submission-timeline-center", (_req, res) => {
    res.json({
      submissionTimeline: buildSwiggySubmissionTimelineCenter({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.post("/api/swiggy-submission-timeline-center/checkpoint", (req, res) => {
    res.json({
      submissionTimelineCheckpoint: buildSwiggySubmissionTimelineCheckpoint({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
        checkpoint: {
          demoRecorded: req.body?.demoRecorded === true,
          accessFormSubmitted: req.body?.accessFormSubmitted === true,
          handoffEmailSent: req.body?.handoffEmailSent === true,
          dcrApproved: req.body?.dcrApproved === true,
          stagingCredentialsIssued: req.body?.stagingCredentialsIssued === true,
          stagingSoakComplete: req.body?.stagingSoakComplete === true,
          productionApproved: req.body?.productionApproved === true,
        },
      }),
    });
  });

  app.get("/api/swiggy-partner-success-desk", (_req, res) => {
    res.json({
      partnerSuccess: buildSwiggyPartnerSuccessDesk({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
      }),
    });
  });

  app.post("/api/swiggy-partner-success-desk/compose", (req, res) => {
    res.json({
      partnerSuccessHandoff: composeSwiggyPartnerSuccessHandoff({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
        laneId: typeof req.body?.laneId === "string" ? req.body.laneId : "",
        operatorEmail: typeof req.body?.operatorEmail === "string" ? req.body.operatorEmail : "",
        launchWindow: typeof req.body?.launchWindow === "string" ? req.body.launchWindow : "",
        contextNote: typeof req.body?.contextNote === "string" ? req.body.contextNote : "",
      }),
    });
  });

  app.get("/api/swiggy-partner-support-room", (_req, res) => {
    res.json({
      partnerSupport: buildSwiggyPartnerSupportRoom({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
      }),
    });
  });

  app.post("/api/swiggy-partner-support-room/compose", (req, res) => {
    res.json({
      partnerSupportPacket: composeSwiggyPartnerSupportPacket({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
        channelId: typeof req.body?.channelId === "string" ? req.body.channelId : "",
        incidentLaneId: typeof req.body?.incidentLaneId === "string" ? req.body.incidentLaneId : "",
        operatorEmail: typeof req.body?.operatorEmail === "string" ? req.body.operatorEmail : "",
        sessionId: typeof req.body?.sessionId === "string" ? req.body.sessionId : "",
        summary: typeof req.body?.summary === "string" ? req.body.summary : "",
      }),
    });
  });

  app.get("/api/swiggy-interaction-qa-center", (_req, res) => {
    res.json({ interactionQa: buildSwiggyInteractionQaCenter() });
  });

  app.post("/api/swiggy-interaction-qa-center/rehearse", (req, res) => {
    res.json({
      interactionQaRehearsal: rehearseSwiggyInteractionQaLane({
        laneId: typeof req.body?.laneId === "string" ? req.body.laneId : "",
        operatorEmail: typeof req.body?.operatorEmail === "string" ? req.body.operatorEmail : "",
        evidenceNote: typeof req.body?.evidenceNote === "string" ? req.body.evidenceNote : "",
        dryRunConfirmed: req.body?.dryRunConfirmed === true,
      }),
    });
  });

  app.get("/api/channel-multimodal-studio", (_req, res) => {
    res.json({ channelMultimodalStudio: buildSwiggyChannelMultimodalStudio() });
  });

  app.post("/api/channel-multimodal-studio/compose", (req, res) => {
    res.json({
      channelExecutionComposition: composeSwiggyChannelExecutionPacket({
        laneId: typeof req.body?.laneId === "string" ? req.body.laneId : "",
        channelId: typeof req.body?.channelId === "string" ? req.body.channelId : "",
        operatorEmail: typeof req.body?.operatorEmail === "string" ? req.body.operatorEmail : "",
        userTrigger: typeof req.body?.userTrigger === "string" ? req.body.userTrigger : "",
        dryRunConfirmed: req.body?.dryRunConfirmed === true,
      }),
    });
  });

  app.get("/api/swiggy-visual-dish-capture", (_req, res) => {
    res.json({ visualDishCapture: buildSwiggyVisualDishCaptureCenter(config) });
  });

  app.post("/api/swiggy-visual-dish-capture/analyze", (req, res) => {
    const body = visualDishAnalyzeSchema.parse(req.body);
    res.json({
      analysis: analyzeSwiggyVisualDishCapture({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-voice-commerce-center", (_req, res) => {
    res.json({ voiceCommerce: buildSwiggyVoiceCommerceCenter(config) });
  });

  app.post("/api/swiggy-voice-commerce-center/rehearse", (req, res) => {
    const body = voiceCommerceRehearsalSchema.parse(req.body);
    res.json({
      rehearsal: rehearseSwiggyVoiceCommerce({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-quality-loop-center", (_req, res) => {
    res.json({ qualityLoop: buildSwiggyQualityLoopCenter(config) });
  });

  app.post("/api/swiggy-quality-loop-center/feedback", (req, res) => {
    const body = qualityFeedbackSchema.parse(req.body);
    res.json({
      analysis: analyzeSwiggyQualityFeedback({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-ritual-autopilot-center", (_req, res) => {
    res.json({ ritualAutopilot: buildSwiggyRitualAutopilotCenter(config) });
  });

  app.post("/api/swiggy-ritual-autopilot-center/plan", (req, res) => {
    const body = ritualAutopilotPlanSchema.parse(req.body);
    res.json({
      ritualPlan: planSwiggyRitualAutopilot({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-payment-truth-center", (_req, res) => {
    res.json({ paymentTruth: buildSwiggyPaymentTruthCenter(config) });
  });

  app.post("/api/swiggy-payment-truth-center/reconcile", (req, res) => {
    const body = paymentTruthReconcileSchema.parse(req.body);
    res.json({
      reconciliation: reconcileSwiggyPaymentTruth({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-meal-window-intelligence", (_req, res) => {
    res.json({ mealWindow: buildSwiggyMealWindowCenter(config) });
  });

  app.post("/api/swiggy-meal-window-intelligence/forecast", (req, res) => {
    const body = mealWindowForecastSchema.parse(req.body);
    res.json({
      forecast: forecastSwiggyMealWindow({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-customization-studio", (_req, res) => {
    res.json({ customizationStudio: buildSwiggyCustomizationStudio(config) });
  });

  app.post("/api/swiggy-customization-studio/validate", (req, res) => {
    const body = customizationValidationSchema.parse(req.body);
    res.json({
      validation: validateSwiggyCustomization({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/nutrition-budget-intelligence", (_req, res) => {
    res.json({ nutritionBudget: buildNutritionBudgetIntelligence() });
  });

  app.post("/api/nutrition-budget-intelligence/advise", (req, res) => {
    const body = nutritionBudgetAdviceSchema.parse(req.body);
    res.json({ nutritionAdvice: adviseNutritionBudget(body) });
  });

  app.get("/api/household-preference-graph", (_req, res) => {
    res.json({ householdPreference: buildHouseholdPreferenceGraph() });
  });

  app.post("/api/household-preference-graph/simulate", (req, res) => {
    const body = householdPreferenceSimulationSchema.parse(req.body);
    res.json({ preferenceSimulation: simulateHouseholdPreference(body) });
  });

  app.get("/api/guest-collaboration-calendar", (_req, res) => {
    res.json({ guestCollaboration: buildGuestCollaborationCenter() });
  });

  app.post("/api/guest-collaboration-calendar/compose", (req, res) => {
    const body = guestCollaborationComposeSchema.parse(req.body);
    res.json({ guestCollaborationHandoff: composeGuestCollaborationHandoff(body) });
  });

  app.get("/api/luxury-experience-workspace", (_req, res) => {
    res.json({ luxuryExperience: buildLuxuryExperienceWorkspace() });
  });

  app.post("/api/luxury-experience-workspace/compose", (req, res) => {
    const body = luxuryExperienceComposeSchema.parse(req.body);
    res.json({ luxuryExperienceComposition: composeLuxuryExperienceWorkspace(body) });
  });

  app.get("/api/reviewer-artifact-vault", (_req, res) => {
    res.json({ reviewerArtifactVault: buildReviewerArtifactVault() });
  });

  app.post("/api/reviewer-artifact-vault/compose", (req, res) => {
    const body = reviewerArtifactPacketSchema.parse(req.body);
    res.json({ reviewerArtifactPacket: composeReviewerArtifactPacket(body) });
  });

  app.get("/api/visual-qa-center", (_req, res) => {
    res.json({ visualQa: buildVisualQaCenter() });
  });

  app.post("/api/visual-qa-center/rehearse", (req, res) => {
    const body = visualQaRehearsalSchema.parse(req.body);
    res.json({ visualQaRehearsal: rehearseVisualQaCapture(body) });
  });

  app.get("/api/swiggy-docs-coverage", (_req, res) => {
    res.json({ docsCoverage: buildSwiggyDocsCoverage() });
  });

  app.post("/api/swiggy-docs-coverage/drill", (req, res) => {
    const body = docsCoverageDrillSchema.parse(req.body);
    res.json({ docsCoverageDrill: drillSwiggyDocsCoverage(body) });
  });

  app.get("/api/swiggy-docs-twin-explorer", (_req, res) => {
    res.json({ docsTwinExplorer: buildSwiggyDocsTwinExplorer() });
  });

  app.post("/api/swiggy-docs-twin-explorer/rehearse", (req, res) => {
    const body = docsTwinRehearsalSchema.parse(req.body);
    res.json({ docsTwinRehearsal: rehearseSwiggyDocsTwinRetrieval(body) });
  });

  app.get(
    "/api/swiggy-llms-manifest-verifier",
    asyncRoute(async (_req, res) => {
      res.json({ llmsManifest: await buildSwiggyLlmsManifestVerifier() });
    }),
  );

  app.post(
    "/api/swiggy-llms-manifest-verifier/rehearse",
    asyncRoute(async (req, res) => {
      const body = llmsManifestRehearsalSchema.parse(req.body);
      res.json({ llmsManifestRehearsal: await rehearseSwiggyLlmsManifest(body) });
    }),
  );

  app.get(
    "/api/swiggy-tool-parity-auditor",
    asyncRoute(async (_req, res) => {
      res.json({ toolParityAuditor: await buildSwiggyToolParityAuditor() });
    }),
  );

  app.get("/api/swiggy-upstream-watch", (_req, res) => {
    res.json({ upstreamWatch: buildSwiggyUpstreamWatch() });
  });

  app.get("/api/swiggy-source-intelligence", (_req, res) => {
    res.json({ sourceIntelligence: buildSwiggySourceIntelligence() });
  });

  app.get(
    "/api/swiggy-source-freeze-diff",
    asyncRoute(async (_req, res) => {
      res.json({
        sourceFreezeDiff: await buildSwiggySourceFreezeDiff({
          config,
          profile: store.getProfile(),
          coverage: buildMcpCoverage(),
          latestPlan: store.getAllPlans().at(-1),
          handoffState: store.getAccessSubmissionState(),
        }),
      });
    }),
  );

  app.post(
    "/api/swiggy-source-freeze-diff/freeze",
    asyncRoute(async (req, res) => {
      const body = sourceFreezeDiffSchema.parse(req.body);
      res.json({
        sourceFreezeDiff: await buildSwiggySourceFreezeDiff({
          config,
          profile: store.getProfile(),
          coverage: buildMcpCoverage(),
          latestPlan: store.getAllPlans().at(-1),
          handoffState: store.getAccessSubmissionState(),
          ...body,
        }),
      });
    }),
  );

  app.get("/api/swiggy-deep-site-map", (_req, res) => {
    res.json({
      deepSiteMap: buildSwiggyDeepSiteMap({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/swiggy-developer-quickstart", (_req, res) => {
    res.json({ quickstartWorkbench: buildDeveloperQuickstartWorkbench() });
  });

  app.post(
    "/api/swiggy-developer-quickstart/run-first-call",
    asyncRoute(async (req, res) => {
      const body = developerFirstCallSchema.parse(req.body);
      const executeTool = async (server: SwiggyServer, tool: string, toolArguments: Record<string, unknown>) => {
        const request: JsonRpcRequest = {
          jsonrpc: "2.0",
          id: `quickstart-${Date.now().toString(36)}`,
          method: "tools/call",
          params: {
            name: tool,
            arguments: toolArguments,
          },
        };

        if (config.swiggyMode === "mock") {
          return handleMockJsonRpc(server, request);
        }

        return callConfiguredSwiggyTool({
          config,
          server,
          request,
          accessToken: runtimeAccessToken,
        });
      };

      res.json({
        firstCallExecution: await executeDeveloperFirstCall({
          config,
          ...body,
          liveCredentialReady: Boolean(runtimeAccessToken),
          executeTool,
        }),
      });
    }),
  );

  app.get("/api/swiggy-cta-execution-center", (_req, res) => {
    res.json({
      ctaExecution: buildSwiggyCtaExecutionCenter({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get(
    "/api/swiggy-cta-live-audit",
    asyncRoute(async (_req, res) => {
      res.json({
        ctaLiveAudit: await buildSwiggyCtaLiveAuditor({
          config,
          latestPlan: store.getAllPlans().at(-1),
        }),
      });
    }),
  );

  app.get("/api/swiggy-innovation-radar", (_req, res) => {
    res.json({ innovationRadar: buildSwiggyInnovationRadar() });
  });

  app.get("/api/ai-client-connect-kit", (_req, res) => {
    res.json({ connectKit: buildAiClientConnectKit() });
  });

  app.post("/api/ai-client-connect-kit/validate-config", (req, res) => {
    const body = aiClientConfigValidationSchema.parse(req.body);
    res.json({ validation: validateAiClientConfig(body) });
  });

  app.get("/api/coding-agent-governance", (_req, res) => {
    res.json({ codingAgentGovernance: buildCodingAgentGovernance() });
  });

  app.get("/api/brand-compliance-kit", (_req, res) => {
    res.json({ brandCompliance: buildBrandComplianceKit() });
  });

  app.post("/api/brand-compliance-kit/rehearse", (req, res) => {
    const body = brandComplianceRehearsalSchema.parse(req.body);
    res.json({ brandComplianceRehearsal: rehearseBrandCompliance(body) });
  });

  app.get("/api/swiggy-journey-compiler", (_req, res) => {
    res.json({ journeyCompiler: buildSwiggyJourneyCompiler() });
  });

  app.get("/api/swiggy-access-dossier", (_req, res) => {
    res.json({ dossier: buildSwiggyAccessDossier(config) });
  });

  app.get("/api/swiggy-access-evidence-matrix", (_req, res) => {
    res.json({
      accessEvidenceMatrix: buildSwiggyAccessEvidenceMatrix({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.get("/api/premium-use-case-studio", (_req, res) => {
    res.json({ studio: buildPremiumUseCaseStudio() });
  });

  app.get("/api/premium-concierge-itinerary", (_req, res) => {
    res.json({ concierge: buildPremiumConciergeItinerary() });
  });

  app.get("/api/staging-certification-matrix", (_req, res) => {
    res.json({ matrix: buildStagingCertificationMatrix(config) });
  });

  app.get(
    "/api/mcp/tool-lab",
    asyncRoute(async (_req, res) => {
      res.json({ toolLab: await buildMcpToolLabReport() });
    }),
  );

  app.get("/api/sessions/:sessionId/surface", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    const surface = agentSurfaceSchema.parse(req.query.surface ?? "chat");
    res.json({ response: buildAgentSurfaceResponse(plan, surface) });
  });

  app.get("/api/sessions/:sessionId/preflight", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ preflight: buildCartPreflightReport(plan) });
  });

  app.get("/api/sessions/:sessionId/replay", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ replay: buildMcpReplay(plan) });
  });

  app.get("/api/sessions/:sessionId/staging-transcript", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ transcript: buildStagingTranscriptExport({ plan, config }) });
  });

  app.get("/api/sessions/:sessionId/widgets", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({
      widgets: buildWidgets(plan),
      bridge: {
        origin: "https://mcp.swiggy.com",
        sandbox: "allow-scripts allow-same-origin allow-popups",
        verifyOrigin: true,
      },
    });
  });

  app.get("/api/sessions/:sessionId", (req, res) => {
    const plan = store.getPlan(req.params.sessionId);
    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    res.json({ plan });
  });

  app.get("/api/pantry", (_req, res) => {
    const pantry = store.getPantry();
    res.json({ pantry, suggestions: buildRestockSuggestions(pantry) });
  });

  app.put("/api/pantry", (req, res) => {
    const pantry = z.array(pantryItemSchema).parse(req.body.pantry) satisfies PantryItem[];
    res.json({ pantry: store.updatePantry(pantry), suggestions: buildRestockSuggestions(pantry) });
  });

  app.get("/api/group", (_req, res) => {
    res.json({ groupPlan: store.getGroupPlan() });
  });

  app.post("/api/group/members", (req, res) => {
    const member = groupMemberSchema.parse(req.body) satisfies GroupMember;
    const current = store.getGroupPlan();
    const members = [...current.members.filter((item) => item.id !== member.id), member];
    const groupPlan = buildGroupPlan(members);
    res.status(201).json({ groupPlan: store.updateGroupPlan(groupPlan) });
  });

  app.post("/api/schedule", (req, res) => {
    const body = z.object({ sessionId: z.string().min(4) }).parse(req.body);
    const plan = store.getPlan(body.sessionId);

    if (!plan) {
      res.status(404).json({ error: { message: "Session not found." } });
      return;
    }

    const reminders = buildPlanReminders(plan);
    reminders.forEach(store.saveReminder);
    res.status(201).json({ reminders });
  });

  app.get("/api/schedule", (req, res) => {
    const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : undefined;
    res.json({ reminders: store.getReminders(sessionId) });
  });

  app.get("/api/ops", (_req, res) => {
    res.json({
      status: buildOpsStatus({
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
        planCount: store.getAllPlans().length,
        reminderCount: store.getReminders().length,
      }),
    });
  });

  app.get("/api/go-live", (_req, res) => {
    const plans = store.getAllPlans();
    const latestPlan = plans.at(-1);
    res.json({
      checks: buildGoLiveChecks({
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
        hasPlan: plans.length > 0,
        hasReminders: store.getReminders().length > 0,
        hasConfirmedAction:
          latestPlan?.recommendations.some((recommendation) => recommendation.status === "confirmed") ?? false,
      }),
      metrics: buildObservabilityMetrics({
        plans,
        reminderCount: store.getReminders().length,
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
      }),
      rollout: {
        pilotUsers: 100,
        ramp: ["1% private pilot", "10% friend-and-family", "50% staged city cohort", "100% after 48h green"],
        expectedPeakQps: "<1 QPS",
      },
    });
  });

  app.post("/api/support/report", (req, res) => {
    const body = z.object({ sessionId: z.string().optional() }).parse(req.body ?? {});
    res.status(201).json({ report: buildIncidentReport({ plans: store.getAllPlans(), sessionId: body.sessionId }) });
  });

  app.get("/api/support/bridge", (req, res) => {
    const query = z.object({ sessionId: z.string().optional() }).parse(req.query);
    res.json({ supportBridge: buildSupportBridgeReport({ plans: store.getAllPlans(), sessionId: query.sessionId }) });
  });

  app.post(
    "/api/support/bridge/report",
    asyncRoute(async (req, res) => {
      const body = supportReportSchema.parse(req.body);
      const executeTool = async (server: SwiggyServer, tool: string, toolArguments: Record<string, unknown>) => {
        const request: JsonRpcRequest = {
          jsonrpc: "2.0",
          id: `support-${Date.now().toString(36)}`,
          method: "tools/call",
          params: {
            name: tool,
            arguments: toolArguments,
          },
        };

        if (config.swiggyMode === "mock") {
          return handleMockJsonRpc(server, request);
        }

        return callConfiguredSwiggyTool({
          config,
          server,
          request,
          accessToken: runtimeAccessToken,
        });
      };

      res.json({
        supportExecution: await executeSupportBridgeReport({
          config,
          ...body,
          liveCredentialReady: Boolean(runtimeAccessToken),
          executeTool,
        }),
      });
    }),
  );

  app.get("/api/slo-incident-command", (_req, res) => {
    res.json({
      sloIncident: buildSloIncidentCommandCenter({
        plans: store.getAllPlans(),
        telemetry: telemetry.buildReport(),
        config,
      }),
    });
  });

  app.get("/api/error-intelligence", (_req, res) => {
    res.json({ errorIntelligence: buildErrorIntelligenceReport() });
  });

  app.post("/api/error-intelligence/classify", (req, res) => {
    const body = errorClassificationSchema.parse(req.body);
    res.json({ classification: classifyMcpError(body) });
  });

  app.get("/api/demo-studio", (_req, res) => {
    res.json({
      steps: buildDemoStudio({
        plans: store.getAllPlans(),
        coverage: buildMcpCoverage(),
        reminders: store.getReminders(),
        hasClientId: config.swiggyClientId !== "replace_after_builder_access",
      }),
    });
  });

  app.get(
    "/api/evaluation-lab",
    asyncRoute(async (_req, res) => {
      res.json({ evaluation: await buildEvaluationLab(store.getProfile()) });
    }),
  );

  app.get("/api/submission-package", (_req, res) => {
    res.json({
      package: buildSubmissionPackage({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/submission-console", (_req, res) => {
    res.json({
      submissionConsole: buildSubmissionConsole({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/access-submission-studio", (_req, res) => {
    res.json({
      accessSubmissionStudio: buildAccessSubmissionStudio({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: store.getAccessSubmissionState(),
      }),
    });
  });

  app.patch("/api/access-submission-studio/state", (req, res) => {
    const body = accessSubmissionStateSchema.parse(req.body);
    const current = store.getAccessSubmissionState();
    const nextState = store.updateAccessSubmissionState({
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      accessSubmissionStudio: buildAccessSubmissionStudio({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState: nextState,
      }),
    });
  });

  app.post("/api/access-submission-studio/rehearse", (req, res) => {
    const body = accessSubmissionRehearsalSchema.parse(req.body);
    const current = store.getAccessSubmissionState();
    const handoffState = {
      ...current,
      ...(body.handoffState ?? {}),
      updatedAt: current.updatedAt,
    };

    res.json({
      accessSubmissionRehearsal: rehearseAccessSubmission({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
        handoffState,
        mode: body.mode,
        includeFormSubmission: body.includeFormSubmission,
        includeHandoffEmail: body.includeHandoffEmail,
        includeCredentialGates: body.includeCredentialGates,
      }),
    });
  });

  app.get("/api/builder-packet-export", (_req, res) => {
    res.json({
      packet: buildBuilderPacketExport({
        config,
        profile: store.getProfile(),
        coverage: buildMcpCoverage(),
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/builder-packet-export.md", (_req, res) => {
    const packet = buildBuilderPacketExport({
      config,
      profile: store.getProfile(),
      coverage: buildMcpCoverage(),
      latestPlan: store.getAllPlans().at(-1),
    });
    res.type("text/markdown").send(buildBuilderPacketMarkdown(packet));
  });

  app.get("/api/rate-limit-plan", (_req, res) => {
    res.json({ rateLimit: buildRateLimitPlan(store.getAllPlans()) });
  });

  app.get("/api/traffic-readiness-plan", (_req, res) => {
    res.json({ trafficReadiness: buildTrafficReadinessPlan({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-load-lab", (_req, res) => {
    res.json({ loadLab: buildSwiggyLoadLab({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-quota-negotiation-center", (_req, res) => {
    res.json({ quotaNegotiation: buildSwiggyQuotaNegotiationCenter({ plans: store.getAllPlans(), config }) });
  });

  app.get("/api/swiggy-offer-intelligence", (_req, res) => {
    res.json({ offerIntelligence: buildSwiggyOfferIntelligence({ plans: store.getAllPlans(), config }) });
  });

  app.post("/api/swiggy-offer-intelligence/decide", (req, res) => {
    const body = offerDecisionSchema.parse(req.body);
    res.json({
      offerDecision: decideSwiggyOffer({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-order-lifecycle", (_req, res) => {
    res.json({ orderLifecycle: buildSwiggyOrderLifecycle({ plans: store.getAllPlans(), config }) });
  });

  app.post("/api/swiggy-order-lifecycle/probe", (req, res) => {
    const body = orderLifecycleProbeSchema.parse(req.body);
    res.json({
      lifecycleProbe: probeSwiggyOrderLifecycle({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-location-trust", (_req, res) => {
    res.json({ locationTrust: buildSwiggyLocationTrust({ plans: store.getAllPlans(), config }) });
  });

  app.post("/api/swiggy-location-trust/select", (req, res) => {
    const body = locationSelectionSchema.parse(req.body);
    res.json({
      locationDecision: selectSwiggyLocation({
        config,
        ...body,
      }),
    });
  });

  app.get("/api/swiggy-cart-mutation-workbench", (_req, res) => {
    res.json({ cartMutation: buildSwiggyCartMutationWorkbench({ plans: store.getAllPlans(), config }) });
  });

  app.post(
    "/api/swiggy-cart-mutation-workbench/mutate",
    asyncRoute(async (req, res) => {
      const body = cartMutationExecutionSchema.parse(req.body);
      const executeTool = async (server: SwiggyServer, tool: string, toolArguments: Record<string, unknown>) => {
        const request: JsonRpcRequest = {
          jsonrpc: "2.0",
          id: `cart-${Date.now().toString(36)}`,
          method: "tools/call",
          params: {
            name: tool,
            arguments: toolArguments,
          },
        };

        if (config.swiggyMode === "mock") {
          return handleMockJsonRpc(server, request);
        }

        return callConfiguredSwiggyTool({
          config,
          server,
          request,
          accessToken: runtimeAccessToken,
        });
      };

      res.json({
        cartMutation: await mutateSwiggyCartWithReadback({
          config,
          ...body,
          liveCredentialReady: Boolean(runtimeAccessToken),
          executeTool,
        }),
      });
    }),
  );

  app.get("/api/swiggy-discovery-freshness", (_req, res) => {
    res.json({ discoveryFreshness: buildSwiggyDiscoveryFreshness({ plans: store.getAllPlans(), config }) });
  });

  app.post(
    "/api/swiggy-discovery-freshness/resolve",
    asyncRoute(async (req, res) => {
      const body = discoveryResolutionSchema.parse(req.body);
      const executeTool = async (server: SwiggyServer, tool: string, toolArguments: Record<string, unknown>) => {
        const request: JsonRpcRequest = {
          jsonrpc: "2.0",
          id: `discovery-${Date.now().toString(36)}`,
          method: "tools/call",
          params: {
            name: tool,
            arguments: toolArguments,
          },
        };

        if (config.swiggyMode === "mock") {
          return handleMockJsonRpc(server, request);
        }

        return callConfiguredSwiggyTool({
          config,
          server,
          request,
          accessToken: runtimeAccessToken,
        });
      };

      res.json({
        discoveryResolution: await resolveSwiggyDiscoveryFreshness({
          config,
          ...body,
          liveCredentialReady: Boolean(runtimeAccessToken),
          executeTool,
        }),
      });
    }),
  );

  app.get("/api/swiggy-confirmation-command-center", (_req, res) => {
    res.json({
      confirmationCommandCenter: buildSwiggyConfirmationCommandCenter({
        plans: store.getAllPlans(),
        config,
      }),
    });
  });

  app.post(
    "/api/swiggy-confirmation-command-center/execute",
    asyncRoute(async (req, res) => {
      const body = confirmationExecutionSchema.parse(req.body);
      const executeTool = async (server: SwiggyServer, tool: string, toolArguments: Record<string, unknown>) => {
        const request: JsonRpcRequest = {
          jsonrpc: "2.0",
          id: `confirmation-${Date.now().toString(36)}`,
          method: "tools/call",
          params: {
            name: tool,
            arguments: toolArguments,
          },
        };

        if (config.swiggyMode === "mock") {
          return handleMockJsonRpc(server, request);
        }

        return callConfiguredSwiggyTool({
          config,
          server,
          request,
          accessToken: runtimeAccessToken,
        });
      };

      res.json({
        confirmationExecution: await executeSwiggyConfirmationCommand({
          config,
          ...body,
          liveCredentialReady: Boolean(runtimeAccessToken),
          executeTool,
        }),
      });
    }),
  );

  app.get("/api/swiggy-cancellation-care-center", (_req, res) => {
    res.json({
      cancellationCareCenter: buildSwiggyCancellationCareCenter({
        plans: store.getAllPlans(),
        config,
      }),
    });
  });

  app.get("/api/swiggy-dineout-precision-center", (_req, res) => {
    res.json({
      dineoutPrecisionCenter: buildSwiggyDineoutPrecisionCenter({
        plans: store.getAllPlans(),
        config,
      }),
    });
  });

  app.get("/api/version-monitor", (_req, res) => {
    res.json({ version: buildVersionMonitor() });
  });

  app.get("/api/swiggy-operating-contract-center", (_req, res) => {
    const plans = store.getAllPlans();
    const rateLimit = buildRateLimitPlan(plans);
    const trafficReadiness = buildTrafficReadinessPlan({ plans, config });
    const sloIncident = buildSloIncidentCommandCenter({ plans, telemetry: telemetry.buildReport(), config });
    const supportBridge = buildSupportBridgeReport({ plans });
    const version = buildVersionMonitor();

    res.json({
      operatingContract: buildSwiggyOperatingContractCenter({
        config,
        rateLimit,
        trafficReadiness,
        sloIncident,
        supportBridge,
        version,
      }),
    });
  });

  app.post("/api/swiggy-operating-contract-center/rehearse", (req, res) => {
    const body = operatingContractRehearsalSchema.parse(req.body);
    const plans = store.getAllPlans();
    const rateLimit = buildRateLimitPlan(plans);
    const trafficReadiness = buildTrafficReadinessPlan({ plans, config });
    const sloIncident = buildSloIncidentCommandCenter({ plans, telemetry: telemetry.buildReport(), config });
    const supportBridge = buildSupportBridgeReport({ plans });
    const version = buildVersionMonitor();

    res.json({
      operatingContractRehearsal: rehearseSwiggyOperatingContract({
        config,
        rateLimit,
        trafficReadiness,
        sloIncident,
        supportBridge,
        version,
        ...body,
      }),
    });
  });

  app.get("/api/compliance-evidence", (_req, res) => {
    res.json({ compliance: buildComplianceEvidence(store.getProfile()) });
  });

  app.get("/api/data-governance-center", (_req, res) => {
    res.json({
      dataGovernance: buildDataGovernanceCenter({
        profile: store.getProfile(),
        config,
      }),
    });
  });

  app.get("/api/reviewer-proof", (_req, res) => {
    const plans = store.getAllPlans();
    const latestPlan = plans.at(-1);
    const widgets = latestPlan ? buildWidgets(latestPlan) : [];
    const rateLimit = buildRateLimitPlan(plans);
    const trafficReadiness = buildTrafficReadinessPlan({ plans, config });
    const sloIncident = buildSloIncidentCommandCenter({ plans, telemetry: telemetry.buildReport(), config });
    const compliance = buildComplianceEvidence(store.getProfile());
    const dataGovernance = buildDataGovernanceCenter({ profile: store.getProfile(), config });
    const enterpriseAuth = buildEnterpriseDelegatedAuthCenter(config);
    const version = buildVersionMonitor();

    res.json({
      proof: buildReviewerProof({
        plans,
        widgets,
        rateLimit,
        trafficReadiness,
        sloIncident,
        compliance,
        dataGovernance,
        enterpriseAuth,
        version,
      }),
    });
  });

  app.get("/api/production-launch-bundle", (_req, res) => {
    res.json({
      launchBundle: buildLaunchBundle({
        config,
        latestPlan: store.getAllPlans().at(-1),
      }),
    });
  });

  app.get("/api/resilience", (_req, res) => {
    const plans = store.getAllPlans();
    const drills = buildResilienceDrills({
      plans,
      hasClientId: config.swiggyClientId !== "replace_after_builder_access",
    });

    res.json({
      drills,
      runbook: buildResilienceRunbook(drills, plans),
    });
  });

  app.get("/api/observability/traces", (_req, res) => {
    res.json({ observability: buildObservabilityTraceReport(store.getAllPlans()) });
  });

  app.get("/api/swiggy-route-optimizer", (_req, res) => {
    res.json({ routeOptimizer: buildSwiggyRouteOptimizationReport() });
  });

  app.get("/api/privacy/export", (_req, res) => {
    res.json({
      profile: store.getProfile(),
      pantry: store.getPantry(),
      groupPlan: store.getGroupPlan(),
      plans: store.getAllPlans(),
      reminders: store.getReminders(),
    });
  });

  app.get("/api/storage/status", (_req, res) => {
    res.json({ storage: store.getDiagnostics() });
  });

  app.get("/api/storage/export", (_req, res) => {
    res.json({ snapshot: store.getSnapshot() });
  });

  app.post("/api/storage/restore", (req, res) => {
    const body = z.object({ snapshot: z.object({ version: z.literal(1) }).passthrough() }).parse(req.body);
    res.json({ snapshot: store.replaceSnapshot(body.snapshot as unknown as ReturnType<typeof store.getSnapshot>) });
  });

  app.post("/api/storage/compact", (req, res) => {
    const body = z
      .object({
        planRetentionDays: z.number().int().min(1).max(365).optional(),
        authTtlMinutes: z.number().int().min(1).max(1440).optional(),
      })
      .parse(req.body ?? {});
    res.json({
      result: store.compact({
        planRetentionDays: body.planRetentionDays ?? config.planRetentionDays,
        authTtlMinutes: body.authTtlMinutes,
      }),
      storage: store.getDiagnostics(),
    });
  });

  app.delete("/api/privacy", (_req, res) => {
    store.clearUserData();
    res.json({ ok: true });
  });

  app.post(
    "/api/mcp/:server",
    asyncRoute(async (req, res) => {
      const server = mcpServerSchema.parse(req.params.server) as SwiggyServer;
      if (config.swiggyMode === "mock") {
        res.json(await handleMockJsonRpc(server, req.body));
        return;
      }

      if (!runtimeAccessToken) {
        res.status(401).json({
          error: {
            message: "Swiggy OAuth token is required before staging or production MCP calls.",
          },
          gateway: buildRuntimeGatewayStatus(),
        });
        return;
      }

      res.json(
        await callConfiguredSwiggyTool({
          config,
          server,
          request: req.body,
          accessToken: runtimeAccessToken,
        }),
      );
    }),
  );

  app.post("/api/auth/swiggy/start", (_req, res) => {
    const { verifier, challenge } = createPkcePair();
    const state = createState();
    store.saveAuthSession({
      state,
      verifier,
      challenge,
      createdAt: new Date().toISOString(),
    });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.swiggyClientId,
      redirect_uri: config.swiggyRedirectUri,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
      scope: config.swiggyScope,
    });

    latestAuthEvent = {
      status: "authorization_url_created",
      label: "Authorization URL created",
      at: new Date().toISOString(),
      statePreview: state,
      tokenSource: runtimeTokenSource,
      scope: config.swiggyScope,
      expiresAt: runtimeTokenExpiresAt,
    };

    res.json({
      authorizationUrl: `${config.swiggyBaseUrl}/auth/authorize?${params.toString()}`,
      mode: config.swiggyMode,
      state,
      verifierStoredServerSide: true,
      authStatus: buildAuthStatus(),
    });
  });

  app.get("/api/auth/swiggy/status", (_req, res) => {
    res.json({ authStatus: buildAuthStatus() });
  });

  app.get("/api/swiggy-auth-lifecycle-center", (_req, res) => {
    res.json({ authLifecycleCenter: buildSwiggyAuthLifecycleCenter(buildAuthStatus()) });
  });

  app.get(
    "/api/auth/swiggy/callback",
    asyncRoute(async (req, res) => {
      const code = String(req.query.code ?? "");
      const state = String(req.query.state ?? "");
      const session = store.consumeAuthSession(state);

      if (!code || !state || !session) {
        latestAuthEvent = {
          status: "callback_failed",
          label: "Invalid OAuth callback",
          at: new Date().toISOString(),
          statePreview: state,
          tokenSource: runtimeTokenSource,
          scope: config.swiggyScope,
          expiresAt: runtimeTokenExpiresAt,
          error: "Missing code/state or state verifier was not found.",
        };
        res.status(400).json({ error: { message: "Invalid OAuth callback." }, authStatus: buildAuthStatus() });
        return;
      }

      if (config.swiggyMode !== "mock") {
        const exchanged = await exchangeSwiggyAuthorizationCode({
          config,
          code,
          verifier: session.verifier,
        });
        runtimeAccessToken = exchanged.accessToken;
        runtimeTokenExpiresAt = exchanged.expiresAt;
        runtimeTokenSource = "runtime";
        latestAuthEvent = {
          status: "callback_exchanged",
          label: "OAuth callback exchanged",
          at: new Date().toISOString(),
          statePreview: state,
          tokenExchange: "exchanged",
          tokenSource: "runtime",
          expiresAt: exchanged.expiresAt,
          scope: exchanged.scope,
        };

        res.json({
          ok: true,
          mode: config.swiggyMode,
          tokenExchange: "exchanged",
          tokenType: exchanged.tokenType,
          expiresAt: exchanged.expiresAt,
          scope: exchanged.scope,
          state,
          authStatus: buildAuthStatus(),
        });
        return;
      }

      latestAuthEvent = {
        status: "callback_mocked",
        label: "OAuth callback mocked",
        at: new Date().toISOString(),
        statePreview: state,
        tokenExchange: "mocked",
        tokenSource: runtimeTokenSource,
        scope: config.swiggyScope,
        expiresAt: runtimeTokenExpiresAt,
      };

      res.json({
        ok: true,
        mode: config.swiggyMode,
        tokenExchange: "mocked",
        state,
        authStatus: buildAuthStatus(),
      });
    }),
  );

  if (options.serveStatic) {
    const distPath = path.resolve(__dirname, "../../dist");
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next;

    if (error instanceof z.ZodError) {
      res.status(400).json({ error: { message: "Invalid request.", issues: error.issues } });
      return;
    }

    const typed = error as Error & { status?: number };
    res.status(typed.status ?? 500).json({
      error: {
        message: typed.message || "Unexpected server error.",
      },
    });
  });

  return { app, store, config };
}
