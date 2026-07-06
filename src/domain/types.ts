export type SwiggyServer = "food" | "instamart" | "dineout";

export type CommerceAction = "place_food_order" | "checkout" | "book_table";

export type RecommendationStatus = "prepared" | "confirmed" | "blocked";

export type SpicePreference = "mild" | "medium" | "hot";

export type AgentSurface = "chat" | "voice";

export interface UserProfile {
  id: string;
  name: string;
  householdSize: number;
  defaultCity: UserPlanningRequest["city"];
  defaultBudget: number;
  diet: UserPlanningRequest["diet"];
  allergies: string[];
  dislikes: string[];
  favoriteCuisines: string[];
  spicePreference: SpicePreference;
  addressLabel: SavedLocation["label"];
  consentToStorePreferences: boolean;
}

export interface UserPlanningRequest {
  prompt: string;
  city: "Bengaluru" | "Delhi NCR" | "Mumbai";
  budget: number;
  diet: "vegetarian" | "high-protein vegetarian" | "balanced";
  guests: number;
  day: "today" | "friday" | "saturday" | "sunday";
}

export interface ToolCallEvent {
  id: string;
  server: SwiggyServer;
  tool: string;
  status: "ok" | "needs_user_confirmation" | "simulated" | "blocked";
  durationMs: number;
  detail: string;
  sessionId: string;
}

export interface PlanItem {
  id?: string;
  name: string;
  quantity: string;
  price: number;
  nutrition?: string;
}

export interface ItemAlternative {
  id: string;
  replaces: string;
  name: string;
  quantity: string;
  price: number;
  reason: string;
  nutrition?: string;
}

export interface Recommendation {
  id: string;
  server: SwiggyServer;
  title: string;
  provider: string;
  locationLabel: string;
  eta: string;
  total: number;
  confidence: number;
  reason: string;
  items: PlanItem[];
  toolChain: string[];
  confirmationAction: CommerceAction;
  status: RecommendationStatus;
  guardrails: string[];
  alternatives: ItemAlternative[];
}

export interface PlanVariant {
  id: "balanced" | "budget" | "protein" | "social";
  label: string;
  total: number;
  description: string;
  tradeoff: string;
}

export interface TrackingEvent {
  id: string;
  recommendationId: string;
  server: SwiggyServer;
  label: string;
  status: "queued" | "accepted" | "preparing" | "on_the_way" | "ready" | "completed";
  timestamp: string;
}

export interface BuilderReadinessItem {
  id: string;
  label: string;
  status: "ready" | "needs_credentials" | "manual_review";
  evidence: string;
}

export interface PantryItem {
  id: string;
  name: string;
  category: "protein" | "staple" | "dairy" | "produce" | "snack";
  currentQty: number;
  targetQty: number;
  unit: string;
  estimatedPrice: number;
}

export interface RestockSuggestion {
  id: string;
  itemId: string;
  name: string;
  quantity: string;
  price: number;
  reason: string;
}

export interface GroupMember {
  id: string;
  name: string;
  diet: UserPlanningRequest["diet"];
  allergies: string[];
  budget: number;
}

export interface GroupPlan {
  members: GroupMember[];
  combinedBudget: number;
  constraints: string[];
  recommendation: string;
}

export interface Reminder {
  id: string;
  sessionId: string;
  label: string;
  channel: "in_app" | "email_draft";
  scheduledFor: string;
  status: "scheduled" | "sent" | "cancelled";
}

export interface OpsStatus {
  id: string;
  label: string;
  status: "healthy" | "warning" | "blocked";
  detail: string;
}

export interface McpToolCoverage {
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  stage: string;
  status: "demo_ready" | "guarded" | "planned";
  evidence: string;
}

export interface McpServerCoverage {
  server: SwiggyServer;
  endpoint: string;
  totalTools: number;
  demoReady: number;
  guarded: number;
  planned: number;
  tools: McpToolCoverage[];
}

export interface McpToolProbe {
  id: string;
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  stage: string;
  status: "pass" | "guarded" | "blocked";
  routeClass: "read" | "cart_mutation" | "coupon" | "commercial_action" | "tracking" | "support";
  safetyGate: string;
  retryPolicy: string;
  productUseCase: string;
  request: {
    jsonrpc: "2.0";
    id: string;
    method: "tools/call";
    params: {
      name: string;
      arguments: Record<string, unknown>;
    };
  };
  responsePreview: Record<string, unknown>;
}

export interface McpToolLabServerSummary {
  server: SwiggyServer;
  totalTools: number;
  callableTools: number;
  guardedTools: number;
  commercialTools: number;
}

export interface McpToolLabReport {
  generatedAt: string;
  score: number;
  totalTools: number;
  callableTools: number;
  guardedTools: number;
  commercialTools: number;
  servers: McpToolLabServerSummary[];
  probes: McpToolProbe[];
  routeAssertions: string[];
  innovationUseCases: Array<{
    id: string;
    title: string;
    servers: SwiggyServer[];
    toolchain: string[];
    productSurface: string;
    nextBuild: string;
  }>;
}

export type SwiggyToolContractBehavior = "read" | "mutating" | "commercial" | "support";
export type SwiggyToolContractParameterSource =
  | "user_input"
  | "saved_swiggy_state"
  | "previous_tool"
  | "system_default"
  | "operator_context";

export interface SwiggyToolContractParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  source: SwiggyToolContractParameterSource;
  description: string;
  privacy: "none" | "location" | "account" | "order" | "support";
}

export interface SwiggyToolContract {
  id: string;
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  stage: string;
  officialReference: string;
  behavior: SwiggyToolContractBehavior;
  routeClass: McpToolProbe["routeClass"];
  parameters: SwiggyToolContractParameter[];
  requiredParameterCount: number;
  responseEnvelope: {
    successShape: string;
    failureShape: string;
    messageContract: string;
  };
  preconditions: string[];
  confirmationGate: string;
  retryPolicy: string;
  errorBuckets: string[];
  fixture: {
    requestId: string;
    sampleArguments: Record<string, unknown>;
    responsePreview: Record<string, unknown>;
  };
  evidenceLinks: string[];
}

export interface SwiggyToolContractServerSummary {
  server: SwiggyServer;
  endpoint: string;
  totalTools: number;
  mutatingTools: number;
  commercialTools: number;
  requiredParameters: number;
}

export interface SwiggyToolContractMatrix {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalTools: number;
  totalParameters: number;
  servers: SwiggyToolContractServerSummary[];
  contracts: SwiggyToolContract[];
  commonErrorEnvelope: {
    current: string[];
    transportSignals: string[];
    plannedCoreCodes: string[];
    plannedDomainCodes: Record<SwiggyServer, string[]>;
  };
  assertions: string[];
  externalGates: string[];
}

export type SwiggyScenarioStepStatus = "pass" | "confirmation_gate" | "support_probe" | "external_gate";

export interface SwiggyScenarioStep {
  sequence: number;
  server: SwiggyServer;
  tool: string;
  label: string;
  status: SwiggyScenarioStepStatus;
  confirmationRequired: boolean;
  retryClass: "safe_retry" | "same_arguments_only" | "non_blind_status_check" | "support_once";
  request: {
    jsonrpc: "2.0";
    id: string;
    method: "tools/call";
    params: {
      name: string;
      arguments: Record<string, unknown>;
    };
  };
  responsePreview: Record<string, unknown>;
  assertion: string;
  durationMs: number;
}

export interface SwiggyScenarioRun {
  id: string;
  title: string;
  officialSource: string;
  mode: "mock" | "staging" | "production";
  servers: SwiggyServer[];
  objective: string;
  steps: SwiggyScenarioStep[];
  totalSteps: number;
  passedSteps: number;
  gatedSteps: number;
  toolsCovered: string[];
  routeAssertions: string[];
}

export interface SwiggyScenarioRunnerReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalScenarios: number;
  totalSteps: number;
  passedSteps: number;
  gatedSteps: number;
  totalOfficialTools: number;
  uniqueToolsCovered: number;
  scenarios: SwiggyScenarioRun[];
  toolCoverage: Array<{ server: SwiggyServer; officialTools: number; coveredTools: number; coverage: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyStateGuardStatus = "ready" | "needs_confirmation" | "external_gate";

export interface SwiggyServerStateModel {
  server: SwiggyServer;
  authoritativeReads: string[];
  mutations: string[];
  commercialAction: string;
  switchGuard: string;
  staleStateRecovery: string;
  userVisiblePromise: string;
}

export interface SwiggyTurnBoundaryGuard {
  sequence: number;
  server: SwiggyServer;
  turn: string;
  userIntent: string;
  requiredRefreshTool: string;
  nextTool: string;
  guardrail: string;
  status: SwiggyStateGuardStatus;
  evidenceLinks: string[];
}

export interface SwiggyStateScenario {
  id: string;
  title: string;
  officialPattern: string;
  servers: SwiggyServer[];
  userStory: string;
  turnBoundaries: SwiggyTurnBoundaryGuard[];
  unsafeMemoryRejected: boolean;
  confirmationCopy: {
    chat: string;
    voice: string;
  };
  recoveryPolicy: string;
}

export interface SwiggySurfaceContract {
  surface: "chat" | "voice";
  maxPresentedItems: number;
  responseShape: string;
  forbiddenContent: string[];
  preferredTools: string[];
  confirmationRule: string;
  widgetPolicy: string;
}

export interface SwiggyStateOrchestratorReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalScenarios: number;
  totalTurnBoundaries: number;
  refreshBeforeMutationCount: number;
  confirmationGateCount: number;
  serverModels: SwiggyServerStateModel[];
  scenarios: SwiggyStateScenario[];
  surfaceContracts: SwiggySurfaceContract[];
  assertions: string[];
  externalGates: string[];
}

export type McpCapabilityKind = "tools" | "resources" | "prompts" | "metadata" | "widgets" | "auth";
export type McpCapabilityStatus = "implemented" | "mocked" | "external_gate";

export interface McpCapabilityGroup {
  id: string;
  label: string;
  kind: McpCapabilityKind;
  scope: "mcp:tools" | "mcp:resources" | "mcp:prompts" | "oauth" | "public";
  status: McpCapabilityStatus;
  officialSignal: string;
  mealPilotSurface: string;
  evidenceLinks: string[];
}

export interface McpResourceRegistryItem {
  id: string;
  resourceType: "widget_registry" | "static_metadata" | "oauth_metadata" | "llm_index";
  scope: "mcp:resources" | "public" | "oauth";
  status: McpCapabilityStatus;
  officialSignal: string;
  mealPilotImplementation: string;
  evidenceLink: string;
}

export interface McpPromptRegistryItem {
  id: string;
  promptType: "agent_template" | "safety_template" | "surface_template" | "support_template";
  scope: "mcp:prompts" | "local";
  status: McpCapabilityStatus;
  officialSignal: string;
  mealPilotImplementation: string;
  evidenceLink: string;
}

export interface McpCapabilityRegistry {
  generatedAt: string;
  score: number;
  scopes: string[];
  transport: "local_mock" | "swiggy_streamable_http";
  serverEndpoints: Array<{ server: SwiggyServer; endpoint: string; tools: number }>;
  capabilityGroups: McpCapabilityGroup[];
  resources: McpResourceRegistryItem[];
  prompts: McpPromptRegistryItem[];
  metadata: Array<{ id: string; url: string; status: "documented" | "wired" | "external"; purpose: string }>;
  assertions: string[];
  externalGates: string[];
}

export type McpResourcePromptStatus = "ready" | "external_gate";

export interface McpResourcePromptServerSummary {
  server: SwiggyServer;
  endpoint: string;
  resources: number;
  prompts: number;
  status: McpResourcePromptStatus;
}

export interface McpResourceStudioItem {
  id: string;
  server: SwiggyServer;
  uri: string;
  name: string;
  resourceType: "widget_registry" | "static_metadata";
  mimeType: "application/json";
  sampleRead: Record<string, unknown>;
  returnedByTools: string[];
  mealPilotUse: string;
  status: McpResourcePromptStatus;
  evidenceLinks: string[];
}

export interface McpPromptStudioArgument {
  name: string;
  required: boolean;
  example: string;
}

export interface McpPromptStudioMessage {
  role: "system" | "user";
  text: string;
}

export interface McpPromptStudioItem {
  id: string;
  server: SwiggyServer;
  name: string;
  title: string;
  promptType: "planner" | "recovery" | "safety" | "support";
  arguments: McpPromptStudioArgument[];
  sampleMessages: McpPromptStudioMessage[];
  mealPilotUse: string;
  status: McpResourcePromptStatus;
  evidenceLinks: string[];
}

export interface McpResourcePromptSmokeRequest {
  id: string;
  server: SwiggyServer;
  method: "resources/list" | "resources/read" | "prompts/list" | "prompts/get";
  params: Record<string, unknown>;
  evidenceLinks: string[];
}

export interface McpResourcePromptStudio {
  generatedAt: string;
  score: number;
  totalResources: number;
  totalPrompts: number;
  readyResources: number;
  readyPrompts: number;
  serverSummaries: McpResourcePromptServerSummary[];
  resources: McpResourceStudioItem[];
  prompts: McpPromptStudioItem[];
  smokeRequests: McpResourcePromptSmokeRequest[];
  assertions: string[];
  externalGates: string[];
}

export type McpResourcePromptExecutionDecision = "executed" | "external_gate";

export interface McpResourcePromptExecution {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer;
    method: "resources/list" | "resources/read" | "prompts/list" | "prompts/get";
  };
  decision: McpResourcePromptExecutionDecision;
  executedMethod?: "resources/list" | "resources/read" | "prompts/list" | "prompts/get";
  requestShape: {
    jsonrpc: "2.0";
    method: "resources/list" | "resources/read" | "prompts/list" | "prompts/get";
    paramKeys: string[];
  };
  responseSummary: {
    available: boolean;
    kind: "resource_list" | "resource_read" | "prompt_list" | "prompt_get" | "unknown";
    itemCount: number;
    primaryLabel: string;
    responseHash: string;
  };
  riskFlags: string[];
  userFacingCopy: string;
  telemetry: Array<{
    field: string;
    value: string;
    redaction: string;
  }>;
  assertions: string[];
}

export interface SwiggyBuilderPageCoverage {
  id: string;
  section: "home" | "start" | "build" | "reference" | "operate" | "blog" | "footer";
  title: string;
  url: string;
  purpose: string;
  mealPilotCoverage: string;
  implementationStatus: "implemented" | "documented" | "requires_credentials";
}

export interface SwiggyBuilderCtaCoverage {
  id: string;
  label: string;
  location: string;
  userIntent: string;
  mealPilotResponse: string;
  implementationStatus: "implemented" | "documented" | "requires_credentials";
}

export interface SwiggyInnovationOpportunity {
  id: string;
  title: string;
  swiggyCapability: string;
  userValue: string;
  productSurface: string;
  nextBuild: string;
  impactScore: number;
}

export interface SwiggyBuildersMap {
  generatedAt: string;
  officialSource: string;
  totalOfficialTools: number;
  servers: McpServerCoverage[];
  pages: SwiggyBuilderPageCoverage[];
  ctas: SwiggyBuilderCtaCoverage[];
  opportunities: SwiggyInnovationOpportunity[];
  integrationPrinciples: string[];
  credentialGates: string[];
}

export interface SwiggyWebsiteNavLink {
  id: string;
  label: string;
  url: string;
  location: "global_header" | "docs_subnav" | "footer_program" | "footer_resources" | "footer_legal";
  mealPilotCoverage: string;
}

export interface SwiggyWebsiteCta {
  id: string;
  label: string;
  url: string;
  appearsOn: string[];
  intent: string;
  mealPilotResponse: string;
  status: "implemented" | "documented" | "requires_credentials";
}

export interface SwiggyWebsiteModule {
  id: string;
  pageId: string;
  title: string;
  moduleType: "hero" | "proof" | "steps" | "toolkit" | "faq" | "cta" | "docs_grid" | "footer" | "legal";
  officialSignal: string;
  mealPilotCoverage: string;
  status: "implemented" | "documented" | "requires_credentials";
}

export interface SwiggyWebsitePageAtlas {
  id: string;
  title: string;
  url: string;
  pageType: "marketing" | "docs" | "reference" | "operate" | "blog" | "external";
  primaryAudience: "developers" | "enterprises" | "consumers" | "reviewers" | "all";
  modules: SwiggyWebsiteModule[];
  ctaIds: string[];
  mealPilotOutcome: string;
}

export interface SwiggyWebsiteCrawlEvidence {
  id: string;
  pageId: string;
  url: string;
  renderedLineCount: number;
  headerSignals: string[];
  footerSignals: string[];
  ctaSignals: string[];
  moduleSignals: string[];
  mealPilotEvidence: string[];
  status: "covered" | "watch" | "external_gate";
}

export interface SwiggyWebsiteAtlas {
  generatedAt: string;
  officialSource: string;
  score: number;
  pagesCovered: number;
  modulesCovered: number;
  ctasCovered: number;
  liveCrawlPages: number;
  liveCrawlSignals: number;
  globalHeader: SwiggyWebsiteNavLink[];
  docsHeader: SwiggyWebsiteNavLink[];
  footerGroups: Array<{ id: string; title: string; links: SwiggyWebsiteNavLink[] }>;
  ctas: SwiggyWebsiteCta[];
  pages: SwiggyWebsitePageAtlas[];
  crawlEvidence: SwiggyWebsiteCrawlEvidence[];
  coverageAssertions: string[];
  remainingExternalGates: string[];
}

export type SwiggyDeepSiteMapStatus = "implemented" | "documented" | "watch" | "external_gate";

export interface SwiggyDeepSitePage {
  id: string;
  title: string;
  url: string;
  pageType: SwiggyWebsitePageAtlas["pageType"];
  primaryAudience: SwiggyWebsitePageAtlas["primaryAudience"];
  moduleCount: number;
  ctaCount: number;
  headerSignals: string[];
  footerSignals: string[];
  ctaSignals: string[];
  moduleSignals: string[];
  proofLinks: string[];
  coverageStatus: SwiggyDeepSiteMapStatus;
  nextReviewAction: string;
}

export interface SwiggyDeepSiteCta {
  id: string;
  label: string;
  url: string;
  appearsOn: string[];
  intent: string;
  actionType: "navigate" | "form" | "email" | "docs" | "demo";
  completionGate: SwiggyBuilderCtaCompletionGate;
  mealPilotResponse: string;
  evidenceLinks: string[];
  status: SwiggyDeepSiteMapStatus;
}

export interface SwiggyDeepSiteSection {
  id: string;
  label: string;
  officialSignal: string;
  sourceUrls: string[];
  evidenceLinks: string[];
  total: number;
  ready: number;
  status: SwiggyDeepSiteMapStatus;
  nextAction: string;
}

export interface SwiggyDeepSiteMap {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totals: {
    pages: number;
    modules: number;
    ctas: number;
    headerLinks: number;
    footerLinks: number;
    crawlSignals: number;
    proofLinks: number;
    sections: number;
  };
  pages: SwiggyDeepSitePage[];
  ctas: SwiggyDeepSiteCta[];
  sections: SwiggyDeepSiteSection[];
  headerFooterMatrix: Array<{
    id: string;
    label: string;
    location: SwiggyWebsiteNavLink["location"];
    url: string;
    mealPilotCoverage: string;
    status: SwiggyDeepSiteMapStatus;
  }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyBuilderIntakeStatus = "ready" | "operator_input" | "external_gate";
export type SwiggyBuilderCtaTrack = "product" | "developer" | "enterprise" | "docs" | "support" | "demo";
export type SwiggyBuilderCtaCompletionGate = "none" | "operator_submit" | "swiggy_approval" | "external_site";

export interface SwiggyBuilderCtaAction {
  id: string;
  label: string;
  sourcePages: string[];
  location: "global_header" | "docs_subnav" | "footer" | "page_body" | "external";
  officialUrl: string;
  officialIntent: string;
  actionType: "navigate" | "form" | "email" | "docs" | "demo";
  track: SwiggyBuilderCtaTrack;
  status: SwiggyBuilderIntakeStatus;
  preparedLocally: boolean;
  completionGate: SwiggyBuilderCtaCompletionGate;
  mealPilotAction: string;
  proofBundle: string;
  evidenceLinks: string[];
  nextAction: string;
}

export interface SwiggyBuilderSubmissionField {
  id: string;
  label: string;
  required: boolean;
  status: SwiggyBuilderIntakeStatus;
  officialSource: string;
  suggestedValue: string;
  evidenceLinks: string[];
  blockingReason: string | null;
}

export interface SwiggyBuilderDemoStoryboardStep {
  sequence: number;
  title: string;
  officialSignal: string;
  mealPilotAction: string;
  proofLink: string;
  durationSeconds: number;
}

export interface SwiggyBuilderOutboundDraft {
  id: string;
  triggerCta: string;
  to: string;
  subject: string;
  body: string;
  evidenceLinks: string[];
}

export interface SwiggyBuilderSubmissionChecklistItem {
  id: string;
  label: string;
  owner: "MealPilot" | "Operator" | "Swiggy";
  status: SwiggyBuilderIntakeStatus;
  nextAction: string;
  evidenceLinks: string[];
}

export interface SwiggyBuilderIntakeCommandCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  recommendedTrack: "developer" | "enterprise";
  totalCtas: number;
  readyCtas: number;
  preparedCtas: number;
  operatorCtaGates: number;
  swiggyCtaGates: number;
  totalFields: number;
  readyFields: number;
  actions: SwiggyBuilderCtaAction[];
  submissionFields: SwiggyBuilderSubmissionField[];
  demoStoryboard: SwiggyBuilderDemoStoryboardStep[];
  outboundDrafts: SwiggyBuilderOutboundDraft[];
  checklist: SwiggyBuilderSubmissionChecklistItem[];
  assertions: string[];
  externalGates: string[];
}

export type SwiggyCtaExecutionStatus = "ready" | "operator_action" | "external_gate";
export type SwiggyCtaExecutionKind = "navigate" | "docs" | "form" | "email" | "legal" | "proof";

export interface SwiggyCtaExecutionTarget {
  id: string;
  label: string;
  location: SwiggyWebsiteNavLink["location"] | "footer" | "page_body" | "external";
  kind: SwiggyCtaExecutionKind;
  officialUrl: string;
  sourcePages: string[];
  officialIntent: string;
  mealPilotAction: string;
  browserAction: string;
  keyboardPath: string[];
  proofLinks: string[];
  status: SwiggyCtaExecutionStatus;
  completionGate: SwiggyBuilderCtaCompletionGate;
  nextAction: string;
}

export interface SwiggyCtaExecutionGroup {
  id: string;
  label: string;
  total: number;
  ready: number;
  operatorActions: number;
  externalGates: number;
  proofLinks: string[];
}

export interface SwiggyCtaExecutionCommand {
  id: string;
  command: string;
  proves: string;
  expectedSignal: string;
  status: SwiggyCtaExecutionStatus;
}

export interface SwiggyCtaExecutionCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totals: {
    targets: number;
    ready: number;
    operatorActions: number;
    externalGates: number;
    headerLinks: number;
    docsLinks: number;
    footerLinks: number;
    ctas: number;
  };
  groups: SwiggyCtaExecutionGroup[];
  targets: SwiggyCtaExecutionTarget[];
  commands: SwiggyCtaExecutionCommand[];
  assertions: string[];
  externalGates: string[];
}

export type SwiggyDocsSection = "start" | "build" | "operate" | "reference" | "blog";
export type SwiggyDocsCoverageStatus = "implemented" | "documented" | "requires_credentials";

export interface SwiggyDocsCoverageItem {
  id: string;
  section: SwiggyDocsSection;
  title: string;
  url: string;
  markdownUrl: string;
  officialSummary: string;
  mealPilotSurface: string;
  evidenceLinks: string[];
  status: SwiggyDocsCoverageStatus;
}

export interface SwiggyDocsSectionSummary {
  section: SwiggyDocsSection;
  total: number;
  implemented: number;
  documented: number;
  requiresCredentials: number;
}

export interface SwiggyDocsCoverageReport {
  generatedAt: string;
  officialSource: string;
  llmsIndex: string;
  score: number;
  totalPages: number;
  sourceInventory: {
    llmsLinkedPages: number;
    headerLinks: number;
    footerLinks: number;
    ctas: number;
  };
  sections: SwiggyDocsSectionSummary[];
  pages: SwiggyDocsCoverageItem[];
  assertions: string[];
  remainingExternalGates: string[];
}

export type SwiggyDocsTwinStatus = "ready" | "documented" | "watch" | "external_gate";

export interface SwiggyDocsTwinRow {
  id: string;
  section: SwiggyDocsSection;
  title: string;
  markdownUrl: string;
  renderedUrl: string;
  retrievalMode: "markdown_twin" | "rendered_page";
  mealPilotProof: string;
  evidenceLinks: string[];
  status: SwiggyDocsTwinStatus;
  nextAction: string;
}

export interface SwiggyDocsTwinGroup {
  id: SwiggyDocsSection;
  label: string;
  total: number;
  ready: number;
  documented: number;
  externalGates: number;
  sampleMarkdownUrls: string[];
  evidenceLinks: string[];
}

export interface SwiggyDocsTwinRetrievalLane {
  id: string;
  label: string;
  sourceUrl: string;
  command: string;
  expectedSignal: string;
  status: SwiggyDocsTwinStatus;
  evidenceLinks: string[];
}

export interface SwiggyDocsTwinExplorer {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totals: {
    pages: number;
    markdownTwins: number;
    renderedPages: number;
    referenceTools: number;
    sections: number;
    readyRows: number;
    documentedRows: number;
    externalGates: number;
    proofLinks: number;
  };
  groups: SwiggyDocsTwinGroup[];
  rows: SwiggyDocsTwinRow[];
  retrievalLanes: SwiggyDocsTwinRetrievalLane[];
  assertions: string[];
  externalGates: string[];
}

export type SwiggyFaqPolicyStatus = "ready" | "documented" | "external_gate";

export interface SwiggyFaqPolicyItem {
  id: string;
  source: "home_faq" | "developer_faq" | "enterprise_faq" | "access_guidelines" | "footer_resource";
  audience: "all" | "developers" | "enterprises" | "reviewers";
  question: string;
  officialSignal: string;
  mealPilotAnswer: string;
  status: SwiggyFaqPolicyStatus;
  evidenceLinks: string[];
}

export interface SwiggyPolicyRule {
  id: string;
  category: "allowed" | "restricted" | "prohibited" | "operating_principle" | "legal";
  officialRule: string;
  mealPilotControl: string;
  status: SwiggyFaqPolicyStatus;
  evidenceLinks: string[];
}

export interface SwiggyFaqPolicyCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalQuestions: number;
  readyQuestions: number;
  totalRules: number;
  readyRules: number;
  faqItems: SwiggyFaqPolicyItem[];
  policyRules: SwiggyPolicyRule[];
  headerFooterCoverage: {
    headerLinks: string[];
    footerResources: string[];
    evidence: string;
  };
  supportContact: {
    email: string;
    escalationEvidence: string[];
  };
  assertions: string[];
  externalGates: string[];
}

export type SwiggyGrowthPartnershipStatus = "ready" | "manual_input" | "external_gate";

export interface SwiggyGrowthPartnershipSignal {
  id: string;
  source: "builders_home" | "developers" | "enterprises" | "access";
  officialSignal: string;
  mealPilotResponse: string;
  status: SwiggyGrowthPartnershipStatus;
  evidenceLinks: string[];
}

export interface SwiggyGrowthExperiment {
  id: string;
  label: string;
  audience: "developers" | "enterprises" | "consumers" | "reviewers";
  hypothesis: string;
  mcpServers: SwiggyServer[];
  requiredTools: string[];
  launchStage: "local_demo" | "staging_pilot" | "production_pilot" | "co_marketing";
  metric: string;
  guardrail: string;
  status: SwiggyGrowthPartnershipStatus;
  evidenceLinks: string[];
}

export interface SwiggyGrowthAsset {
  id: string;
  label: string;
  purpose: string;
  owner: "MealPilot" | "Operator" | "Swiggy" | "Joint";
  status: SwiggyGrowthPartnershipStatus;
  evidenceLinks: string[];
}

export interface SwiggyGrowthPartnershipCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalSignals: number;
  readySignals: number;
  totalExperiments: number;
  readyExperiments: number;
  signals: SwiggyGrowthPartnershipSignal[];
  experiments: SwiggyGrowthExperiment[];
  assets: SwiggyGrowthAsset[];
  partnershipAsks: SwiggyGrowthAsset[];
  metrics: Array<{ id: string; label: string; target: string; evidenceLinks: string[] }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyChannelMultimodalStatus = "ready" | "manual_input" | "external_gate";
export type SwiggyChannelTarget =
  | "web_chat"
  | "voice"
  | "slack_teams"
  | "mobile_camera"
  | "enterprise_platform";

export interface SwiggyChannelMultimodalLane {
  id: string;
  title: string;
  officialSignal: string;
  targetUser: string;
  channels: SwiggyChannelTarget[];
  mcpServers: SwiggyServer[];
  toolchain: string[];
  inputModes: string[];
  outputSurfaces: string[];
  safetyControls: string[];
  innovationAngle: string;
  status: SwiggyChannelMultimodalStatus;
  evidenceLinks: string[];
}

export interface SwiggyChannelIntegration {
  id: string;
  label: string;
  channel: SwiggyChannelTarget;
  status: SwiggyChannelMultimodalStatus;
  inputContract: string;
  outputContract: string;
  swiggyTools: string[];
  nextBuild: string;
  evidenceLinks: string[];
}

export interface SwiggyMultimodalPipelineStep {
  sequence: number;
  label: string;
  server?: SwiggyServer;
  tool?: string;
  guardrail: string;
}

export interface SwiggyMultimodalPipeline {
  id: string;
  label: string;
  status: SwiggyChannelMultimodalStatus;
  trigger: string;
  steps: SwiggyMultimodalPipelineStep[];
  dataBoundaries: string[];
  externalGates: string[];
  evidenceLinks: string[];
}

export interface SwiggyChannelExecutionPacket {
  id: string;
  laneId: string;
  status: SwiggyChannelMultimodalStatus;
  surface: SwiggyChannelTarget;
  userTrigger: string;
  routePlan: string[];
  responseRules: string[];
  confirmationGate: string;
  telemetryContract: string;
  evidenceLinks: string[];
}

export interface SwiggyChannelMultimodalStudio {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalLanes: number;
  readyLanes: number;
  totalChannels: number;
  readyChannels: number;
  totalPipelines: number;
  readyPipelines: number;
  totalExecutionPackets: number;
  readyExecutionPackets: number;
  lanes: SwiggyChannelMultimodalLane[];
  channels: SwiggyChannelIntegration[];
  pipelines: SwiggyMultimodalPipeline[];
  executionPackets: SwiggyChannelExecutionPacket[];
  assertions: string[];
  externalGates: string[];
}

export type SwiggyVisualDishCaptureStatus = "ready" | "needs_confirmation" | "vision_gate" | "staging_gate";
export type SwiggyVisualDishCaptureIntent = "dish_photo" | "menu_screenshot" | "pantry_photo" | "chat_image";

export interface SwiggyVisualDishRoute {
  id: string;
  label: string;
  server: SwiggyServer | "combined";
  status: SwiggyVisualDishCaptureStatus;
  swiggyTools: string[];
  userConfirmation: string;
  output: string;
  fallback: string;
  evidenceLinks: string[];
}

export interface SwiggyVisualDishGuardrail {
  id: string;
  label: string;
  status: SwiggyVisualDishCaptureStatus;
  policy: string;
  evidenceLinks: string[];
}

export interface SwiggyVisualDishSampleCapture {
  id: string;
  intent: SwiggyVisualDishCaptureIntent;
  inputHint: string;
  detectedLabel: string;
  confidence: number;
  selectedRoute: string;
  status: SwiggyVisualDishCaptureStatus;
}

export interface SwiggyVisualDishCaptureAnalysis {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    intent: SwiggyVisualDishCaptureIntent;
    imageName?: string;
    caption: string;
    city: string;
    rawImageRetained: false;
  };
  detected: {
    label: string;
    cuisine: string;
    confidence: number;
    alternatives: string[];
    requiresUserConfirmation: boolean;
  };
  swiggyRoutes: SwiggyVisualDishRoute[];
  selectedRouteId: string;
  nextActions: string[];
  telemetry: Array<{ field: string; value: string; redaction: string }>;
  assertions: string[];
}

export interface SwiggyVisualDishCaptureCenter {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    routes: number;
    readyRoutes: number;
    guardrails: number;
    readyGuardrails: number;
    sampleCaptures: number;
    externalGates: number;
  };
  routes: SwiggyVisualDishRoute[];
  guardrails: SwiggyVisualDishGuardrail[];
  sampleCaptures: SwiggyVisualDishSampleCapture[];
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyVoiceCommerceStatus = "ready" | "needs_confirmation" | "voice_sdk_gate" | "staging_gate";
export type SwiggyVoiceCommerceIntent = "quick_order" | "pantry_restock" | "book_table" | "combined_evening";

export interface SwiggyVoiceCommerceScenario {
  id: string;
  label: string;
  intent: SwiggyVoiceCommerceIntent;
  server: SwiggyServer | "combined";
  status: SwiggyVoiceCommerceStatus;
  swiggyTools: string[];
  spokenContract: string;
  cardFallback: string;
  confirmationPrompt: string;
  safetyRule: string;
  evidenceLinks: string[];
}

export interface SwiggyVoiceCommerceGuardrail {
  id: string;
  label: string;
  status: SwiggyVoiceCommerceStatus;
  policy: string;
  evidenceLinks: string[];
}

export interface SwiggyVoiceCommerceSample {
  id: string;
  utterance: string;
  detectedIntent: SwiggyVoiceCommerceIntent;
  selectedScenario: string;
  status: SwiggyVoiceCommerceStatus;
}

export interface SwiggyVoiceCommerceRehearsal {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    utterance: string;
    city: string;
    surface: "voice";
    rawAudioRetained: false;
  };
  detected: {
    intent: SwiggyVoiceCommerceIntent;
    confidence: number;
    entities: string[];
    requiresUserConfirmation: boolean;
  };
  selectedScenarioId: string;
  spokenScript: string[];
  cardFallback: string[];
  confirmationPrompt: string;
  swiggyRoute: SwiggyVoiceCommerceScenario;
  telemetry: Array<{ field: string; value: string; redaction: string }>;
  assertions: string[];
}

export interface SwiggyVoiceCommerceCenter {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    scenarios: number;
    readyScenarios: number;
    guardrails: number;
    readyGuardrails: number;
    samples: number;
    externalGates: number;
  };
  scenarios: SwiggyVoiceCommerceScenario[];
  guardrails: SwiggyVoiceCommerceGuardrail[];
  samples: SwiggyVoiceCommerceSample[];
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyQualityLoopStatus = "ready" | "needs_consent" | "support_gate" | "staging_gate";
export type SwiggyQualityLoopSignal = "taste" | "delivery" | "freshness" | "booking" | "value" | "support";

export interface SwiggyQualityLoopLane {
  id: string;
  label: string;
  server: SwiggyServer | "combined";
  status: SwiggyQualityLoopStatus;
  swiggyTools: string[];
  capturedSignals: SwiggyQualityLoopSignal[];
  userQuestion: string;
  learningAction: string;
  supportAction: string;
  nextOptimization: string;
  evidenceLinks: string[];
}

export interface SwiggyQualityLoopGuardrail {
  id: string;
  label: string;
  status: SwiggyQualityLoopStatus;
  policy: string;
  evidenceLinks: string[];
}

export interface SwiggyQualityLoopSample {
  id: string;
  server: SwiggyServer | "combined";
  rating: number;
  comment: string;
  selectedLane: string;
  status: SwiggyQualityLoopStatus;
}

export interface SwiggyQualityFeedbackAnalysis {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer | "combined";
    rating: number;
    comment: string;
    city: string;
    consentToLearn: boolean;
  };
  sentiment: "delighted" | "mixed" | "issue";
  selectedLaneId: string;
  learningTags: string[];
  nextMealPilotAction: string;
  supportPacketNeeded: boolean;
  swiggyRoute: SwiggyQualityLoopLane;
  telemetry: Array<{ field: string; value: string; redaction: string }>;
  assertions: string[];
}

export interface SwiggyQualityLoopCenter {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    readyLanes: number;
    guardrails: number;
    readyGuardrails: number;
    samples: number;
    externalGates: number;
  };
  lanes: SwiggyQualityLoopLane[];
  guardrails: SwiggyQualityLoopGuardrail[];
  samples: SwiggyQualityLoopSample[];
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyRitualAutopilotStatus = "ready" | "needs_consent" | "confirmation_gate" | "staging_gate";
export type SwiggyRitualAutopilotCadence = "weekday" | "weekend" | "weekly" | "occasion";
export type SwiggyRitualAutopilotSignal = "food_history" | "go_to_items" | "booking_slots" | "quality_feedback" | "calendar" | "voice_or_visual";

export interface SwiggyRitualAutopilotLane {
  id: string;
  label: string;
  cadence: SwiggyRitualAutopilotCadence;
  server: SwiggyServer | "combined";
  status: SwiggyRitualAutopilotStatus;
  swiggyTools: string[];
  consentedSignals: SwiggyRitualAutopilotSignal[];
  userPromise: string;
  planningAction: string;
  confirmationBoundary: string;
  evidenceLinks: string[];
}

export interface SwiggyRitualAutopilotGuardrail {
  id: string;
  label: string;
  status: SwiggyRitualAutopilotStatus;
  policy: string;
  evidenceLinks: string[];
}

export interface SwiggyRitualAutopilotSample {
  id: string;
  request: string;
  selectedLane: string;
  cadence: SwiggyRitualAutopilotCadence;
  status: SwiggyRitualAutopilotStatus;
}

export interface SwiggyRitualAutopilotPlan {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    cadence: SwiggyRitualAutopilotCadence;
    householdMode: "solo" | "couple" | "family" | "team";
    city: string;
    budget: number;
    consentToUseHistory: boolean;
  };
  selectedLaneId: string;
  confidence: number;
  weeklyTheme: string;
  routineSlots: Array<{
    day: string;
    action: string;
    swiggyPath: SwiggyServer | "combined";
    requiresConfirmation: boolean;
  }>;
  recommendedNextAction: string;
  swiggyRoute: SwiggyRitualAutopilotLane;
  telemetry: Array<{ field: string; value: string; redaction: string }>;
  assertions: string[];
}

export interface SwiggyRitualAutopilotCenter {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    readyLanes: number;
    guardrails: number;
    readyGuardrails: number;
    samples: number;
    externalGates: number;
  };
  lanes: SwiggyRitualAutopilotLane[];
  guardrails: SwiggyRitualAutopilotGuardrail[];
  samples: SwiggyRitualAutopilotSample[];
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyPaymentTruthStatus = "ready" | "confirmation_gate" | "support_gate" | "staging_gate";
export type SwiggyPaymentTruthSignal =
  | "cart_total"
  | "coupon_discount"
  | "payment_methods"
  | "cod_eligibility"
  | "free_booking"
  | "bill_payment";

export interface SwiggyPaymentTruthLane {
  id: string;
  label: string;
  server: SwiggyServer | "combined";
  status: SwiggyPaymentTruthStatus;
  swiggyTools: string[];
  trustedSignals: SwiggyPaymentTruthSignal[];
  truthSource: string;
  userPromise: string;
  paymentBoundary: string;
  evidenceLinks: string[];
}

export interface SwiggyPaymentTruthGuardrail {
  id: string;
  label: string;
  status: SwiggyPaymentTruthStatus;
  policy: string;
  evidenceLinks: string[];
}

export interface SwiggyPaymentTruthSample {
  id: string;
  server: SwiggyServer | "combined";
  prompt: string;
  selectedLane: string;
  status: SwiggyPaymentTruthStatus;
}

export interface SwiggyPaymentTruthReconciliation {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer | "combined";
    cartTotal: number;
    expectedDiscount: number;
    paymentPreference: "cod" | "online" | "free_booking" | "unknown";
    city: string;
  };
  selectedLaneId: string;
  settlementStatus: "ready_for_confirmation" | "needs_cart_readback" | "support_review";
  userFacingCopy: string;
  riskFlags: string[];
  swiggyRoute: SwiggyPaymentTruthLane;
  telemetry: Array<{ field: string; value: string; redaction: string }>;
  assertions: string[];
}

export interface SwiggyPaymentTruthCenter {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    readyLanes: number;
    guardrails: number;
    readyGuardrails: number;
    samples: number;
    externalGates: number;
  };
  lanes: SwiggyPaymentTruthLane[];
  guardrails: SwiggyPaymentTruthGuardrail[];
  samples: SwiggyPaymentTruthSample[];
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyMealWindowStatus = "ready" | "watch" | "confirmation_gate" | "staging_gate";
export type SwiggyMealWindow = "breakfast" | "lunch" | "dinner" | "late_night" | "weekend";
export type SwiggyMealWindowSignal = "restaurant_eta" | "menu_availability" | "product_availability" | "dineout_slots" | "tracking_cadence" | "reminder_time";

export interface SwiggyMealWindowLane {
  id: string;
  label: string;
  window: SwiggyMealWindow;
  server: SwiggyServer | "combined";
  status: SwiggyMealWindowStatus;
  swiggyTools: string[];
  timingSignals: SwiggyMealWindowSignal[];
  userPromise: string;
  optimizationRule: string;
  confirmationBoundary: string;
  evidenceLinks: string[];
}

export interface SwiggyMealWindowGuardrail {
  id: string;
  label: string;
  status: SwiggyMealWindowStatus;
  policy: string;
  evidenceLinks: string[];
}

export interface SwiggyMealWindowSample {
  id: string;
  prompt: string;
  selectedLane: string;
  window: SwiggyMealWindow;
  status: SwiggyMealWindowStatus;
}

export interface SwiggyMealWindowForecast {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    city: string;
    window: SwiggyMealWindow;
    partySize: number;
    urgency: "now" | "today" | "this_week";
    includeDineout: boolean;
  };
  selectedLaneId: string;
  etaRisk: "low" | "medium" | "high";
  recommendedRoute: SwiggyServer | "combined";
  recommendedAction: string;
  timingPlan: Array<{ sequence: number; label: string; server: SwiggyServer | "combined"; tool: string; guardrail: string }>;
  swiggyRoute: SwiggyMealWindowLane;
  telemetry: Array<{ field: string; value: string; redaction: string }>;
  assertions: string[];
}

export interface SwiggyMealWindowCenter {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    readyLanes: number;
    guardrails: number;
    readyGuardrails: number;
    samples: number;
    externalGates: number;
  };
  lanes: SwiggyMealWindowLane[];
  guardrails: SwiggyMealWindowGuardrail[];
  samples: SwiggyMealWindowSample[];
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyCustomizationStatus = "ready" | "watch" | "confirmation_gate" | "staging_gate";
export type SwiggyCustomizationRisk = "low" | "medium" | "high";
export type SwiggyCustomizationSignal =
  | "food_addons"
  | "food_variants"
  | "instamart_pack_size"
  | "instamart_stock"
  | "allergy_note"
  | "cart_readback";

export interface SwiggyCustomizationLane {
  id: string;
  label: string;
  server: SwiggyServer | "combined";
  status: SwiggyCustomizationStatus;
  swiggyTools: string[];
  customizationSignals: SwiggyCustomizationSignal[];
  decisionSurface: string;
  sourceTruth: string;
  mutationBoundary: string;
  confirmationCopy: string;
  evidenceLinks: string[];
}

export interface SwiggyCustomizationGuardrail {
  id: string;
  label: string;
  status: SwiggyCustomizationStatus;
  policy: string;
  evidenceLinks: string[];
}

export interface SwiggyCustomizationSample {
  id: string;
  prompt: string;
  selectedLane: string;
  server: SwiggyServer | "combined";
  status: SwiggyCustomizationStatus;
}

export interface SwiggyCustomizationValidation {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer | "combined";
    intent: string;
    hasAllergy: boolean;
    userChangedVariant: boolean;
    quantity: number;
    includeDineout: boolean;
  };
  selectedLaneId: string;
  mutationRisk: SwiggyCustomizationRisk;
  requiredFreshRead: string;
  recommendedAction: string;
  swiggyRoute: SwiggyCustomizationLane;
  checklist: Array<{ sequence: number; label: string; tool: string; guardrail: string }>;
  telemetry: Array<{ field: string; value: string; redaction: string }>;
  assertions: string[];
}

export interface SwiggyCustomizationStudio {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    readyLanes: number;
    guardrails: number;
    readyGuardrails: number;
    samples: number;
    toolsCovered: number;
    externalGates: number;
  };
  lanes: SwiggyCustomizationLane[];
  guardrails: SwiggyCustomizationGuardrail[];
  samples: SwiggyCustomizationSample[];
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type NutritionBudgetStatus = "ready" | "needs_live_data" | "external_gate";

export interface NutritionBudgetTarget {
  id: string;
  label: string;
  dailyTarget: string;
  mealPilotControl: string;
  swiggySignals: string[];
}

export interface NutritionBudgetRoute {
  id: string;
  title: string;
  status: NutritionBudgetStatus;
  userIntent: string;
  swiggyServers: SwiggyServer[];
  toolchain: string[];
  budgetRule: string;
  nutritionHeuristic: string;
  optimizationMetric: string;
  confirmationGate: string;
  dataBoundary: string;
  evidenceLinks: string[];
}

export interface NutritionBudgetRecommendation {
  id: string;
  label: string;
  routeId: string;
  estimatedProteinGrams: number;
  estimatedCost: number;
  proteinPerRupee: number;
  estimatedSavings: number;
  swiggyTools: string[];
  rationale: string;
  safetyNote: string;
}

export interface NutritionBudgetPlaybook {
  id: string;
  title: string;
  trigger: string;
  steps: Array<{
    sequence: number;
    label: string;
    server?: SwiggyServer;
    tool?: string;
    guardrail: string;
  }>;
  outputSurface: string;
  status: NutritionBudgetStatus;
}

export interface NutritionBudgetIntelligence {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalTargets: number;
  totalRoutes: number;
  readyRoutes: number;
  totalRecommendations: number;
  totalPlaybooks: number;
  totalToolsCovered: number;
  targets: NutritionBudgetTarget[];
  routes: NutritionBudgetRoute[];
  recommendations: NutritionBudgetRecommendation[];
  playbooks: NutritionBudgetPlaybook[];
  metrics: Array<{ id: string; label: string; value: string; evidenceLinks: string[] }>;
  safetyControls: string[];
  assertions: string[];
  externalGates: string[];
}

export type HouseholdPreferenceStatus = "ready" | "needs_live_history" | "external_gate";

export interface HouseholdPreferenceSignal {
  id: string;
  label: string;
  status: HouseholdPreferenceStatus;
  source: "swiggy_food" | "swiggy_instamart" | "swiggy_dineout" | "mealpilot_local";
  swiggyTools: string[];
  preferenceUse: string;
  retentionRule: string;
  evidenceLinks: string[];
}

export interface HouseholdPreferenceMember {
  id: string;
  label: string;
  weight: number;
  dietPattern: string;
  preferenceVector: string[];
  hardExclusions: string[];
  swiggySignals: string[];
  personalizationRole: string;
}

export interface HouseholdPreferenceForecast {
  id: string;
  label: string;
  status: HouseholdPreferenceStatus;
  horizon: string;
  prediction: string;
  swiggyTools: string[];
  confidence: number;
  trigger: string;
  confirmationGate: string;
  dataBoundary: string;
}

export interface HouseholdPreferenceAutomation {
  id: string;
  label: string;
  status: HouseholdPreferenceStatus;
  trigger: string;
  action: string;
  swiggyTools: string[];
  guardrail: string;
  evidenceLinks: string[];
}

export interface HouseholdPreferenceGraph {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalSignals: number;
  readySignals: number;
  totalMembers: number;
  totalForecasts: number;
  readyForecasts: number;
  totalAutomations: number;
  readyAutomations: number;
  uniqueToolsCovered: number;
  signals: HouseholdPreferenceSignal[];
  members: HouseholdPreferenceMember[];
  forecasts: HouseholdPreferenceForecast[];
  automations: HouseholdPreferenceAutomation[];
  privacyControls: string[];
  metrics: Array<{ id: string; label: string; value: string; evidenceLinks: string[] }>;
  assertions: string[];
  externalGates: string[];
}

export type GuestCollaborationStatus = "ready" | "manual_input" | "external_gate";
export type GuestCollaborationChannel = "web_share" | "slack_teams" | "calendar_ics" | "email_draft" | "voice_brief";

export interface GuestParticipant {
  id: string;
  label: string;
  role: "host" | "guest" | "payer" | "operator";
  diet: string;
  budgetShare: number;
  constraints: string[];
  voteWeight: number;
}

export interface GuestVoteRound {
  id: string;
  label: string;
  channel: GuestCollaborationChannel;
  status: GuestCollaborationStatus;
  prompt: string;
  options: string[];
  swiggyTools: string[];
  decisionRule: string;
  privacyRule: string;
}

export interface OccasionTemplate {
  id: string;
  title: string;
  status: GuestCollaborationStatus;
  intent: string;
  swiggyServers: SwiggyServer[];
  route: Array<{
    sequence: number;
    label: string;
    server?: SwiggyServer;
    tool?: string;
    guardrail: string;
  }>;
  output: string;
  confirmationGate: string;
  reminderRule: string;
  evidenceLinks: string[];
}

export interface CalendarHandoffArtifact {
  id: string;
  label: string;
  channel: GuestCollaborationChannel;
  status: GuestCollaborationStatus;
  contentType: "ics" | "mailto" | "share_link" | "voice_summary" | "runbook";
  payloadPreview: string;
  guardrail: string;
  evidenceLinks: string[];
}

export interface GuestCollaborationCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalParticipants: number;
  totalVoteRounds: number;
  readyVoteRounds: number;
  totalTemplates: number;
  readyTemplates: number;
  totalCalendarArtifacts: number;
  readyCalendarArtifacts: number;
  uniqueToolsCovered: number;
  participants: GuestParticipant[];
  voteRounds: GuestVoteRound[];
  templates: OccasionTemplate[];
  calendarArtifacts: CalendarHandoffArtifact[];
  metrics: Array<{ id: string; label: string; value: string; evidenceLinks: string[] }>;
  safetyControls: string[];
  assertions: string[];
  externalGates: string[];
}

export type LuxuryExperienceStatus = "ready" | "manual_input" | "external_gate";
export type LuxuryExperienceMode = "lean" | "premium" | "family" | "social" | "training";

export interface LuxuryExperienceModePlan {
  id: LuxuryExperienceMode;
  label: string;
  status: LuxuryExperienceStatus;
  audience: string;
  optimizationGoal: string;
  budgetBand: string;
  swiggyServers: SwiggyServer[];
  toolchain: string[];
  workspaceOutputs: string[];
  guardrails: string[];
}

export interface LuxuryWorkspaceStep {
  sequence: number;
  label: string;
  server?: SwiggyServer;
  tool?: string;
  risk: "read" | "cart_mutation" | "commercial" | "support" | "handoff";
  guardrail: string;
  surface: "web" | "voice" | "widget_fallback" | "ops";
}

export interface LuxuryReviewWorkspace {
  id: string;
  title: string;
  status: LuxuryExperienceStatus;
  kind: "reservation" | "food_cart" | "instamart_cart" | "combined_evening" | "recovery";
  swiggyServers: SwiggyServer[];
  steps: LuxuryWorkspaceStep[];
  authoritativeReads: string[];
  commercialGate: string;
  widgetFallback: string;
  voiceContract: string;
  telemetry: string[];
  evidenceLinks: string[];
}

export interface LuxurySurfaceArtifact {
  id: string;
  label: string;
  status: LuxuryExperienceStatus;
  channel: "web" | "voice" | "widget_fallback" | "ops";
  content: string;
  guardrail: string;
  evidenceLinks: string[];
}

export interface LuxuryExperienceWorkspace {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalModes: number;
  readyModes: number;
  totalWorkspaces: number;
  readyWorkspaces: number;
  totalArtifacts: number;
  readyArtifacts: number;
  uniqueToolsCovered: number;
  modes: LuxuryExperienceModePlan[];
  workspaces: LuxuryReviewWorkspace[];
  artifacts: LuxurySurfaceArtifact[];
  metrics: Array<{ id: string; label: string; value: string; evidenceLinks: string[] }>;
  safetyControls: string[];
  assertions: string[];
  externalGates: string[];
}

export type ReviewerArtifactStatus = "ready" | "manual_input" | "external_gate";

export interface ReviewerArtifactItem {
  id: string;
  label: string;
  category: "api" | "doc" | "ui" | "command" | "email" | "log" | "video";
  status: ReviewerArtifactStatus;
  path: string;
  proves: string;
  redaction: string;
}

export interface ReviewerScreenshotTarget {
  id: string;
  label: string;
  status: ReviewerArtifactStatus;
  route: string;
  selector: string;
  viewport: "desktop" | "mobile";
  proves: string;
  fallback: string;
}

export interface ReviewerArtifactCommand {
  id: string;
  command: string;
  status: ReviewerArtifactStatus;
  proves: string;
  expectedSignal: string;
}

export interface ReviewerArtifactVault {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalArtifacts: number;
  readyArtifacts: number;
  totalScreenshotTargets: number;
  readyScreenshotTargets: number;
  totalCommands: number;
  readyCommands: number;
  totalRedactionRules: number;
  artifactSections: Array<{ id: string; label: string; artifacts: ReviewerArtifactItem[] }>;
  screenshotTargets: ReviewerScreenshotTarget[];
  commands: ReviewerArtifactCommand[];
  redactionRules: string[];
  handoffChecklist: Array<{ id: string; label: string; status: ReviewerArtifactStatus; owner: string; evidenceLinks: string[] }>;
  reviewerEmail: { to: string; subject: string; body: string };
  assertions: string[];
  externalGates: string[];
}

export type VisualQaStatus = "ready" | "manual_input" | "external_gate";
export type VisualQaViewport = "desktop" | "tablet" | "mobile";

export interface VisualQaTarget {
  id: string;
  label: string;
  status: VisualQaStatus;
  route: string;
  selector: string;
  viewport: VisualQaViewport;
  width: number;
  height: number;
  proves: string;
  artifactPath: string;
}

export interface VisualQaRule {
  id: string;
  label: string;
  status: VisualQaStatus;
  scope: string;
  check: string;
  remediation: string;
}

export interface VisualQaCommand {
  id: string;
  command: string;
  status: VisualQaStatus;
  proves: string;
  expectedSignal: string;
}

export interface VisualQaCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalTargets: number;
  readyTargets: number;
  totalRules: number;
  readyRules: number;
  totalCommands: number;
  readyCommands: number;
  targetGroups: Array<{ id: string; label: string; targets: VisualQaTarget[] }>;
  rules: VisualQaRule[];
  commands: VisualQaCommand[];
  metrics: Array<{ id: string; label: string; value: string; evidenceLinks: string[] }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyUpstreamWatchStatus = "ready" | "watch" | "external_gate";

export interface SwiggyDocsRetrievalContract {
  llmsIndex: string;
  llmsFull: string;
  markdownPattern: string;
  agentRules: string[];
  smokeTest: string;
  mealPilotControl: string;
}

export interface SwiggyUpstreamRelease {
  id: string;
  version: string;
  status: SwiggyUpstreamWatchStatus;
  officialSignal: string;
  shipped: string[];
  knownLimitations: string[];
  mealPilotImpact: string;
  evidenceLinks: string[];
}

export interface SwiggyUpstreamRoadmapItem {
  id: string;
  version: "v1.1" | "v1.2" | "v2" | "future";
  item: string;
  status: SwiggyUpstreamWatchStatus;
  officialSignal: string;
  mealPilotReadiness: string;
  owner: "MealPilot" | "Swiggy" | "Joint";
  evidenceLinks: string[];
}

export interface SwiggyUpstreamAction {
  id: string;
  trigger: string;
  action: string;
  status: SwiggyUpstreamWatchStatus;
  evidenceLinks: string[];
}

export interface SwiggyUpstreamWatchReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  docsContract: SwiggyDocsRetrievalContract;
  releaseTimeline: SwiggyUpstreamRelease[];
  roadmapItems: SwiggyUpstreamRoadmapItem[];
  signedManifestWatch: {
    status: SwiggyUpstreamWatchStatus;
    targetVersion: string;
    officialSignal: string;
    mealPilotControl: string;
    evidenceLinks: string[];
  };
  actionQueue: SwiggyUpstreamAction[];
  assertions: string[];
  externalGates: string[];
}

export type SwiggySourceIntelligenceStatus = "covered" | "watch" | "external_gate";
export type SwiggySourceDriftSeverity = "info" | "watch" | "blocking";

export interface SwiggySourceInventory {
  sourceOfTruth: string;
  llmsLinkedPages: number;
  markdownTwinPattern: string;
  marketingPages: number;
  docsSections: number;
  headerLinks: number;
  footerLinks: number;
  ctas: number;
  toolReferenceTools: number;
}

export interface SwiggySourceServerInventory {
  server: SwiggyServer;
  endpoint: string;
  tools: number;
  docsReference: string;
  mealPilotProof: string[];
  status: SwiggySourceIntelligenceStatus;
}

export interface SwiggySourceCoverageCluster {
  id: string;
  label: string;
  officialSignal: string;
  coveredSources: string[];
  mealPilotEvidence: string[];
  status: SwiggySourceIntelligenceStatus;
  score: number;
  nextAction: string;
}

export interface SwiggySourceDriftSignal {
  id: string;
  label: string;
  severity: SwiggySourceDriftSeverity;
  officialSignal: string;
  mealPilotInterpretation: string;
  action: string;
  evidenceLinks: string[];
}

export interface SwiggySourceBuildQueueItem {
  id: string;
  label: string;
  owner: "MealPilot" | "Operator" | "Swiggy" | "Joint";
  status: SwiggySourceIntelligenceStatus;
  trigger: string;
  nextBuild: string;
  evidenceLinks: string[];
}

export interface SwiggySourceIntelligenceReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  inventory: SwiggySourceInventory;
  serverInventory: SwiggySourceServerInventory[];
  clusters: SwiggySourceCoverageCluster[];
  driftSignals: SwiggySourceDriftSignal[];
  buildQueue: SwiggySourceBuildQueueItem[];
  assertions: string[];
  externalGates: string[];
}

export type SwiggyInnovationStatus = "ready" | "staging_gate" | "partner_gate";

export interface SwiggyInnovationInput {
  id: string;
  label: string;
  officialSignal: string;
  sourceUrl: string;
  mealPilotResponse: string;
}

export interface SwiggyInnovationLane {
  id: string;
  label: string;
  userPromise: string;
  sourceSignals: string[];
  swiggyServers: SwiggyServer[];
  swiggyTools: string[];
  productSurfaces: string[];
  routeOptimization: string;
  premiumDifferentiator: string;
  status: SwiggyInnovationStatus;
}

export interface SwiggyInnovationPhase {
  id: string;
  label: string;
  status: SwiggyInnovationStatus;
  focus: string;
  proofLinks: string[];
  exitCriteria: string[];
}

export interface SwiggyInnovationRadarReport {
  generatedAt: string;
  score: number;
  opportunityCount: number;
  officialInputs: SwiggyInnovationInput[];
  opportunityLanes: SwiggyInnovationLane[];
  routeOptimizations: string[];
  buildPhases: SwiggyInnovationPhase[];
  differentiators: string[];
  nextBuilds: string[];
  assertions: string[];
  externalGates: string[];
}

export type AiClientTarget = "claude_desktop" | "chatgpt" | "cursor" | "vs_code" | "windsurf" | "generic_mcp";
export type AiClientInstallStatus = "ready_to_copy" | "external_client" | "requires_oauth";
export type AgentSdkAuthMode = "native_auth_provider" | "bearer_header" | "mixed";

export interface AiClientServerConfig {
  id: string;
  label: string;
  server: SwiggyServer;
  url: string;
  tools: number;
}

export interface AiClientConfigTarget {
  id: AiClientTarget;
  label: string;
  status: AiClientInstallStatus;
  officialSignal: string;
  installPath: string;
  setupSteps: string[];
  config: Record<string, unknown>;
  verificationPrompt: string;
  privacyNote: string;
}

export interface CodingAgentRule {
  id: string;
  target: "claude_code" | "cursor_rules" | "windsurf_rules" | "agents_md" | "raw";
  path: string;
  status: "ready_to_copy";
  rule: string;
  smokeTest: string;
}

export interface AgentSdkAdapter {
  id: string;
  label: string;
  authMode: AgentSdkAuthMode;
  officialSignal: string;
  mealPilotAdapter: string;
  reconnectPolicy: string;
}

export interface EnterpriseDelegatedAuthBlueprint {
  status: "external_gate";
  flow: string[];
  tokenLifecycle: Array<{ item: string; lifetime: string; action: string }>;
  storageRules: string[];
  redirectUriExamples: string[];
}

export interface AiClientConnectKit {
  generatedAt: string;
  score: number;
  officialSources: string[];
  servers: AiClientServerConfig[];
  clientTargets: AiClientConfigTarget[];
  codingAgentRules: CodingAgentRule[];
  sdkAdapters: AgentSdkAdapter[];
  enterpriseDelegatedAuth: EnterpriseDelegatedAuthBlueprint;
  troubleshooting: Array<{ symptom: string; fix: string }>;
  safetyAssertions: string[];
  externalGates: string[];
}

export type DeveloperQuickstartStatus = "ready" | "operator_input" | "external_gate" | "watch";

export interface DeveloperQuickstartSource {
  id: string;
  label: string;
  url: string;
  signal: string;
}

export interface DeveloperQuickstartStep {
  id: string;
  sequence: number;
  label: string;
  officialSignal: string;
  mealPilotEvidence: string;
  endpoint: string;
  status: DeveloperQuickstartStatus;
}

export interface DeveloperFrameworkAdapter {
  id: string;
  label: string;
  language: "typescript" | "python" | "multi";
  authMode: AgentSdkAuthMode;
  mcpClient: string;
  serverUrls: string[];
  setupSteps: string[];
  firstCallPrompt: string;
  reconnectPolicy: string;
  status: DeveloperQuickstartStatus;
}

export interface DeveloperFirstCallDrill {
  id: string;
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  jsonRpc: {
    jsonrpc: "2.0";
    id: string;
    method: "tools/call" | "tools/list";
    params: {
      name?: string;
      arguments?: Record<string, unknown>;
    };
  };
  expectedSignal: string;
  prerequisites: string[];
  retryPolicy: string;
  safetyGate: string;
  status: DeveloperQuickstartStatus;
}

export interface DeveloperRecipeHandoff {
  id: string;
  label: string;
  officialDoc: string;
  servers: SwiggyServer[];
  tools: string[];
  routeOptimization: string;
  confirmationGates: string[];
  evidenceLinks: string[];
  status: DeveloperQuickstartStatus;
}

export interface DeveloperQuickstartAuthGate {
  id: string;
  label: string;
  officialRequirement: string;
  mealPilotControl: string;
  evidenceLinks: string[];
  status: DeveloperQuickstartStatus;
}

export interface DeveloperQuickstartWorkbench {
  generatedAt: string;
  score: number;
  officialSources: DeveloperQuickstartSource[];
  totals: {
    steps: number;
    frameworks: number;
    firstCallDrills: number;
    recipeHandoffs: number;
    authGates: number;
    readyItems: number;
  };
  readinessSteps: DeveloperQuickstartStep[];
  frameworkAdapters: DeveloperFrameworkAdapter[];
  firstCallDrills: DeveloperFirstCallDrill[];
  recipeHandoffs: DeveloperRecipeHandoff[];
  authGates: DeveloperQuickstartAuthGate[];
  commands: Array<{ id: string; command: string; proves: string; expectedSignal: string }>;
  assertions: string[];
  externalGates: string[];
}

export type CodingAgentGovernanceStatus = "ready" | "needs_update" | "missing";

export interface CodingAgentGovernanceSource {
  id: string;
  label: string;
  url: string;
  useCase: string;
}

export interface CodingAgentGovernanceRuleFile {
  path: string;
  absolutePath: string;
  status: CodingAgentGovernanceStatus;
  matchedSignals: number;
  totalSignals: number;
  missingSignals: string[];
  sha256: string;
}

export interface CodingAgentGovernanceSignal {
  id: string;
  label: string;
  status: CodingAgentGovernanceStatus;
  evidence: string;
}

export interface CodingAgentGovernanceSmokeTest {
  id: string;
  label: string;
  command: string;
  expected: string;
  status: CodingAgentGovernanceStatus;
}

export interface CodingAgentGovernance {
  generatedAt: string;
  score: number;
  officialSources: CodingAgentGovernanceSource[];
  ruleFile: CodingAgentGovernanceRuleFile;
  requiredSignals: CodingAgentGovernanceSignal[];
  smokeTests: CodingAgentGovernanceSmokeTest[];
  guardrails: string[];
  commands: string[];
  assertions: string[];
  externalGates: string[];
}

export type JourneyStepRole = "core" | "optional" | "recovery" | "support";
export type JourneyRiskLevel = "low" | "medium" | "high";

export interface CompiledJourneyStep {
  id: string;
  sequence: number;
  lane: string;
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  role: JourneyStepRole;
  purpose: string;
  inputFrom: string[];
  output: string;
  cachePolicy: string;
  retryPolicy: string;
  errorBuckets: string[];
  confirmationRequired: boolean;
  uiSurface: string;
}

export interface CompiledSwiggyJourney {
  id: string;
  title: string;
  source: "official_recipe" | "mealpilot_innovation";
  officialRecipe?: string;
  scenario: string;
  servers: SwiggyServer[];
  baselineCalls: number;
  optimizedCalls: number;
  savedCalls: number;
  riskLevel: JourneyRiskLevel;
  steps: CompiledJourneyStep[];
  parallelizableGroups: string[][];
  confirmationGates: string[];
  dataDependencies: string[];
  userExperience: string[];
  externalGates: string[];
}

export interface JourneyToolIndexItem {
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  stage: string;
  role: JourneyStepRole;
  journeyIds: string[];
  safetyClass: "read" | "cart_mutation" | "coupon" | "commercial_action" | "tracking" | "support";
}

export interface SwiggyJourneyCompilerReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalJourneys: number;
  totalToolsIndexed: number;
  journeys: CompiledSwiggyJourney[];
  toolIndex: JourneyToolIndexItem[];
  globalOptimizations: string[];
  assertions: string[];
  externalGates: string[];
}

export type AccessDossierStatus = "ready" | "manual_input" | "external_gate" | "blocked";

export interface AccessDossierField {
  id: string;
  label: string;
  required: boolean;
  status: AccessDossierStatus;
  source: string;
  value: string;
  evidence: string;
  proofLinks: string[];
}

export interface AccessDossierReviewCheck {
  id: string;
  label: string;
  status: AccessDossierStatus;
  officialCheck: string;
  mealPilotEvidence: string;
  proofLinks: string[];
}

export interface AccessDossierGroundRuleGroup {
  id: string;
  label: string;
  status: AccessDossierStatus;
  officialStance: "allowed" | "restricted" | "prohibited" | "operating_principle";
  officialItems: string[];
  mealPilotControls: string[];
  proofLinks: string[];
}

export interface AccessDossierTrack {
  id: "developer" | "enterprise";
  label: string;
  status: AccessDossierStatus;
  fit: string;
  applicationUrl: string;
  requiredBeforeSubmit: string[];
  mealPilotPositioning: string;
}

export interface AccessDossierLegalItem {
  id: string;
  label: string;
  status: AccessDossierStatus;
  evidence: string;
  nextAction: string;
}

export interface SwiggyAccessDossier {
  generatedAt: string;
  score: number;
  officialSources: string[];
  recommendedTrack: "developer" | "enterprise";
  applicationFields: AccessDossierField[];
  reviewChecks: AccessDossierReviewCheck[];
  groundRules: AccessDossierGroundRuleGroup[];
  tracks: AccessDossierTrack[];
  legalReadiness: AccessDossierLegalItem[];
  submissionSequence: string[];
  proofLinks: Array<{ label: string; path: string; purpose: string }>;
  assertions: string[];
  externalGates: string[];
}

export type PremiumUseCaseTier = "signature" | "concierge" | "enterprise";
export type PremiumUseCaseStage = "demo_ready" | "staging_after_credentials" | "enterprise_extension";
export type PremiumUseCaseSurface = "chat" | "voice" | "widget" | "ops";

export interface PremiumUseCaseRouteStep {
  sequence: number;
  label: string;
  servers: SwiggyServer[];
  tools: string[];
  purpose: string;
  optimization: string;
  confirmationGate: string;
  surface: PremiumUseCaseSurface;
}

export interface PremiumUseCaseBlueprint {
  id: string;
  title: string;
  tier: PremiumUseCaseTier;
  stage: PremiumUseCaseStage;
  audience: string;
  promise: string;
  servers: SwiggyServer[];
  primaryTools: string[];
  baselineCalls: number;
  optimizedCalls: number;
  savedCalls: number;
  route: PremiumUseCaseRouteStep[];
  safetyGates: string[];
  dataBoundaries: string[];
  successMetrics: string[];
  premiumDifferentiators: string[];
}

export interface PremiumUseCaseToolCoverage {
  server: SwiggyServer;
  totalTools: number;
  usedTools: number;
  useCaseIds: string[];
}

export interface PremiumUseCaseStudio {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalUseCases: number;
  crossServerUseCases: number;
  totalToolsUsed: number;
  totalOfficialTools: number;
  useCases: PremiumUseCaseBlueprint[];
  toolCoverage: PremiumUseCaseToolCoverage[];
  marketThesis: string[];
  innovationPrinciples: string[];
  roadmap: Array<{ phase: string; title: string; deliverable: string; status: PremiumUseCaseStage }>;
  assertions: string[];
  externalGates: string[];
}

export type PremiumConciergeItineraryStatus = "ready" | "needs_confirmation" | "scheduled_reminder" | "external_gate";

export interface PremiumConciergeItineraryStep {
  sequence: number;
  label: string;
  server: SwiggyServer;
  tools: string[];
  purpose: string;
  optimization: string;
  userControl: string;
  status: PremiumConciergeItineraryStatus;
}

export interface PremiumConciergeItinerarySlot {
  id: string;
  day: "today" | "tomorrow" | "saturday" | "sunday";
  timeBand: string;
  title: string;
  intent: string;
  servers: SwiggyServer[];
  primaryRecipe: "food" | "instamart" | "dineout" | "combined";
  route: PremiumConciergeItineraryStep[];
  estimatedCalls: number;
  savedCalls: number;
  confirmation: string;
  fallback: string;
}

export interface PremiumConciergeToolCoverage {
  server: SwiggyServer;
  officialTools: number;
  itineraryTools: number;
  coverage: string;
}

export interface PremiumConciergeItineraryReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  title: string;
  promise: string;
  itinerary: PremiumConciergeItinerarySlot[];
  totalEstimatedCalls: number;
  totalSavedCalls: number;
  toolCoverage: PremiumConciergeToolCoverage[];
  luxuryDifferentiators: string[];
  routeOptimizations: string[];
  safetyControls: string[];
  externalGates: string[];
}

export type StagingCertificationStatus =
  | "mock_ready"
  | "requires_staging_credentials"
  | "manual_input"
  | "production_gate";

export type StagingCertificationWaveId =
  | "preflight"
  | "oauth_dcr"
  | "read_tools"
  | "cart_mutations"
  | "commercial_actions"
  | "support_reporting"
  | "soak_48h"
  | "production_promotion";

export interface StagingCertificationTool {
  id: string;
  server: SwiggyServer;
  endpoint: string;
  stagingEndpoint: string;
  tool: string;
  stage: string;
  routeClass: "read" | "cart_mutation" | "coupon" | "commercial_action" | "tracking" | "support";
  waveId: StagingCertificationWaveId;
  status: StagingCertificationStatus;
  localEvidence: string;
  smokePrompt: string;
  expectedEvidence: string;
}

export interface StagingCertificationWave {
  id: StagingCertificationWaveId;
  title: string;
  status: StagingCertificationStatus;
  owner: "MealPilot" | "Operator" | "Swiggy";
  objective: string;
  officialRequirement: string;
  entryCriteria: string[];
  exitCriteria: string[];
  tools: StagingCertificationTool[];
  evidenceLinks: string[];
  commands: string[];
}

export interface StagingCertificationServer {
  server: SwiggyServer;
  stagingEndpoint: string;
  productionEndpoint: string;
  totalTools: number;
  assignedTools: number;
  requiredScopes: string[];
  requiredEnv: string[];
  status: StagingCertificationStatus;
  smokeAssertions: string[];
}

export interface StagingCertificationChecklistItem {
  id: string;
  label: string;
  status: StagingCertificationStatus;
  evidence: string;
}

export interface StagingCertificationMatrix {
  generatedAt: string;
  score: number;
  currentMode: "mock" | "staging" | "production";
  liveStagingVerified: boolean;
  stagingBaseUrl: string;
  productionBaseUrl: string;
  soakHoursRequired: number;
  officialSources: string[];
  totalTools: number;
  assignedTools: number;
  waves: StagingCertificationWave[];
  perServer: StagingCertificationServer[];
  credentialChecklist: StagingCertificationChecklistItem[];
  telemetryRequirements: string[];
  rollbackPolicy: string[];
  commands: Array<{ id: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export interface AgentSurfaceResponse {
  surface: AgentSurface;
  headline: string;
  shortSummary: string;
  recommendationIds: string[];
  cards: Array<{
    title: string;
    provider: string;
    total: number;
    eta: string;
  }>;
  confirmationPrompt: string;
  constraints: string[];
}

export interface GoLiveCheck {
  id: string;
  label: string;
  status: "ready" | "needs_credentials" | "manual_review";
  evidence: string;
}

export interface ObservabilityMetric {
  id: string;
  label: string;
  value: string;
  status: "healthy" | "watch" | "blocked";
  detail: string;
}

export interface IncidentReport {
  id: string;
  severity: "S0" | "S1" | "S2" | "S3";
  subject: string;
  summary: string;
  mailto: string;
  sessionIds: string[];
  nextSteps: string[];
}

export interface SupportBridgeToolReport {
  id: string;
  server: SwiggyServer;
  endpoint: string;
  failedTool: string;
  status: "ready" | "needs_session";
  request: {
    jsonrpc: "2.0";
    id: string;
    method: "tools/call";
    params: {
      name: "report_error";
      arguments: {
        tool: string;
        domain: string;
        errorMessage: string;
        flowDescription: string;
        toolContext: Record<string, string | number | boolean>;
        userNotes: string;
      };
    };
  };
  responsePreview: {
    success: true;
    data: {
      mailto: string;
      summary: string;
      supportCorrelation: string;
    };
    message: string;
  };
  evidence: string;
}

export interface SupportBridgeReport {
  generatedAt: string;
  score: number;
  latestSessionId?: string;
  reportErrorTools: SupportBridgeToolReport[];
  contactChannels: Array<{ channel: string; useCase: string; status: "ready" | "external" }>;
  slaMatrix: Array<{ severity: "S0" | "S1" | "S2" | "S3"; trigger: string; ack: string; updateCadence: string }>;
  redactionRules: string[];
  escalationChecklist: string[];
  incidentEmail: {
    to: string;
    subject: string;
    body: string;
  };
  externalGates: string[];
}

export type SupportBridgeExecutionDecision =
  | "reported_with_receipt"
  | "external_gate"
  | "blocked_missing_session"
  | "blocked_user_consent"
  | "blocked_no_observed_issue";

export interface SupportBridgeExecution {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer;
    failedTool: string;
    severity: "S0" | "S1" | "S2" | "S3";
    issueObserved: boolean;
    userConsented: boolean;
    sessionIdProvided: boolean;
  };
  decision: SupportBridgeExecutionDecision;
  executedTools: Array<"report_error">;
  reportErrorArguments: {
    tool: string;
    domain: "food" | "im" | "dineout";
    errorMessage: string;
    flowDescription: string;
    toolContext: Record<string, string | number | boolean>;
    userNotes: string;
  };
  redaction: {
    contextKeys: string[];
    contextHash: string;
    rawTokensRetained: false;
    rawPaymentRetained: false;
    rawAddressRetained: false;
  };
  responseSummary: {
    available: boolean;
    statusLabel: string;
    receiptHash: string;
  };
  supportPacket: {
    sessionIdHash: string;
    failedTool: string;
    server: SwiggyServer;
    escalationTarget: "builders@swiggy.in";
    emailSubject: string;
  };
  riskFlags: string[];
  userFacingCopy: string;
  telemetry: Array<{
    field: string;
    value: string;
    redaction: string;
  }>;
  assertions: string[];
}

export type ErrorRetryClass = "reauth" | "fix_arguments" | "safe_backoff" | "domain_terminal" | "single_retry_then_report";

export interface ErrorIntelligenceBucket {
  id: string;
  label: string;
  detect: string;
  userAction: string;
  retryClass: ErrorRetryClass;
  maxRetries: number;
  reportError: boolean;
  userCopy: string;
}

export interface PlannedErrorCode {
  code: string;
  meaning: string;
  http: number;
  bucket: string;
  status: "planned";
}

export interface DomainErrorCode {
  server: SwiggyServer;
  code: string;
  meaning: string;
  terminal: boolean;
  userAction: string;
}

export interface ErrorIntelligenceReport {
  generatedAt: string;
  score: number;
  officialSource: string;
  envelope: {
    success: false;
    error: {
      message: string;
      reportLink?: string;
      reportHint?: string;
    };
    primarySignal: string;
    secondarySignals: string[];
  };
  buckets: ErrorIntelligenceBucket[];
  plannedCoreCodes: PlannedErrorCode[];
  domainCodes: DomainErrorCode[];
  retryPolicy: {
    initialBackoffMs: number;
    maxBackoffMs: number;
    maxRetries: number;
    jitter: boolean;
    nonBlindRetryTools: CommerceAction[];
  };
  observabilityHooks: string[];
  supportActions: string[];
  assertions: string[];
}

export interface OfferOpportunity {
  id: string;
  server: SwiggyServer;
  code: string;
  label: string;
  estimatedSavings: number;
  appliesTo: string;
  status: "available" | "applied" | "not_applicable";
}

export interface CartPreflightCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "blocked";
  evidence: string;
  recommendationId?: string;
  server?: SwiggyServer;
}

export interface CartPreflightReport {
  sessionId: string;
  overall: "ready" | "needs_review" | "blocked";
  total: number;
  checks: CartPreflightCheck[];
  offers: OfferOpportunity[];
}

export interface McpReplayStep {
  id: string;
  sequence: number;
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  durationMs: number;
  retryPolicy: string;
}

export interface StagingTranscriptEntry {
  id: string;
  sequence: number;
  ts: string;
  requestId: string;
  sessionId: string;
  userIdHash: string;
  server: SwiggyServer;
  endpoint: string;
  tool: string;
  routeClass: "read" | "cart_mutation" | "coupon" | "commercial_action" | "tracking" | "support";
  certificationWave: StagingCertificationWaveId;
  status: "ok" | "locked";
  durationMs: number;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  retryPolicy: string;
  redacted: boolean;
}

export interface StagingTranscriptFile {
  id: string;
  label: string;
  path: string;
  mimeType: string;
  status: "ready" | "external_gate";
  purpose: string;
}

export interface StagingTranscriptExport {
  generatedAt: string;
  sessionId: string;
  mode: "mock" | "staging" | "production";
  score: number;
  totalEntries: number;
  coveredServers: SwiggyServer[];
  certificationWaves: StagingCertificationWaveId[];
  liveStagingReady: boolean;
  entries: StagingTranscriptEntry[];
  jsonl: string;
  markdown: string;
  files: StagingTranscriptFile[];
  redaction: {
    redactedFields: string[];
    allowedFields: string[];
    piiFree: boolean;
    evidence: string;
  };
  supportEnvelope: {
    to: string;
    subject: string;
    requiredFields: string[];
    bodyPreview: string;
  };
  readiness: Array<{ id: string; label: string; status: "ready" | "watch" | "blocked" | "external_gate"; evidence: string }>;
  proofLinks: Array<{ label: string; path: string }>;
  assertions: string[];
  externalGates: string[];
}

export interface DemoStudioStep {
  id: string;
  label: string;
  status: "done" | "active" | "pending";
  evidence: string;
  artifactUrl?: string;
}

export interface SubmissionField {
  id: string;
  label: string;
  value: string;
  status: "ready" | "manual_input";
}

export interface SubmissionPackage {
  generatedAt: string;
  fields: SubmissionField[];
  links: Array<{ label: string; url: string }>;
  residualRisks: string[];
}

export type SubmissionConsoleStatus = "ready" | "operator_input" | "external_gate" | "blocked";

export interface SubmissionConsoleTrack {
  id: "developer" | "enterprise";
  label: string;
  status: SubmissionConsoleStatus;
  officialUrl: string;
  fit: string;
  requiredInputs: string[];
  mealPilotPositioning: string;
  evidenceLinks: string[];
}

export interface SubmissionConsoleField {
  id: string;
  label: string;
  required: boolean;
  status: SubmissionConsoleStatus;
  suggestedValue: string;
  evidenceLinks: string[];
  officialSource: string;
}

export interface SubmissionConsoleAttachment {
  id: string;
  label: string;
  status: SubmissionConsoleStatus;
  path: string;
  purpose: string;
  mustAttach: boolean;
}

export interface SubmissionConsoleRunbookStep {
  id: string;
  sequence: number;
  label: string;
  owner: "MealPilot" | "Operator" | "Swiggy";
  status: SubmissionConsoleStatus;
  action: string;
  evidenceLinks: string[];
}

export interface SubmissionConsoleRequirement {
  id: string;
  label: string;
  required: boolean;
  status: SubmissionConsoleStatus;
  officialSource: string;
  preparedValue: string;
  completionGate: "none" | "operator_input" | "swiggy_approval";
  nextAction: string;
  evidenceLinks: string[];
}

export interface SubmissionConsolePacketItem {
  sequence: number;
  id: string;
  label: string;
  itemType: "field" | "attachment" | "runbook" | "email";
  status: SubmissionConsoleStatus;
  path: string;
  operatorAction: string;
  evidenceLinks: string[];
}

export interface SubmissionConsole {
  generatedAt: string;
  score: number;
  officialSources: string[];
  recommendedTrack: "developer" | "enterprise";
  formTargets: SubmissionConsoleTrack[];
  readyRequirements: number;
  totalRequirements: number;
  operatorRequirements: number;
  requirements: SubmissionConsoleRequirement[];
  readyFields: number;
  totalFields: number;
  fields: SubmissionConsoleField[];
  readyAttachments: number;
  totalAttachments: number;
  attachments: SubmissionConsoleAttachment[];
  packetOrder: SubmissionConsolePacketItem[];
  runbook: SubmissionConsoleRunbookStep[];
  outboundDrafts: SwiggyBuilderOutboundDraft[];
  blockers: string[];
  assertions: string[];
  externalGates: string[];
}

export interface BuilderPacketExportFile {
  id: string;
  label: string;
  path: string;
  format: "json" | "markdown";
  source: string;
  mustAttach: boolean;
}

export interface BuilderPacketExportReadiness {
  id: string;
  label: string;
  status: "ready" | "operator_input" | "external_gate";
  evidence: string;
  action: string;
}

export interface BuilderPacketExport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  recommendedTrack: "developer" | "enterprise";
  outputDirectory: string;
  executiveSummary: string;
  totals: {
    formFields: number;
    readyFields: number;
    requiredAttachments: number;
    readyAttachments: number;
    launchArtifacts: number;
    visualTargets: number;
    packetFiles: number;
  };
  files: BuilderPacketExportFile[];
  readiness: BuilderPacketExportReadiness[];
  commands: Array<{ id: string; command: string; proves: string }>;
  copyBlocks: {
    formFields: string;
    attachments: string;
    handoffEmail: {
      to: string;
      subject: string;
      body: string;
    };
  };
  assertions: string[];
  externalGates: string[];
}

export interface AccessSubmissionStudioTarget {
  id: string;
  label: string;
  url: string;
  cta: string;
  status: SubmissionConsoleStatus;
  purpose: string;
  nextAction: string;
}

export interface AccessSubmissionStudioCopyBlock {
  id: string;
  label: string;
  status: SubmissionConsoleStatus;
  value: string;
  copyAction: string;
}

export interface AccessSubmissionStudioAttachment {
  id: string;
  label: string;
  status: SubmissionConsoleStatus;
  path: string;
  required: boolean;
}

export interface AccessSubmissionStudioStep {
  id: string;
  sequence: number;
  label: string;
  owner: "MealPilot" | "Operator" | "Swiggy";
  status: SubmissionConsoleStatus;
  action: string;
}

export interface AccessSubmissionHandoffState {
  demoVideoUrl: string;
  technicalContactEmail: string;
  productionRedirectUri: string;
  staticEgressIp: string;
  environmentSummary: string;
  termsAcknowledged: boolean;
  formSubmittedAt?: string;
  handoffEmailSentAt?: string;
  notes: string;
  updatedAt: string;
}

export interface AccessSubmissionStudio {
  generatedAt: string;
  score: number;
  officialSources: string[];
  recommendedTrack: "developer" | "enterprise";
  canSubmitNow: boolean;
  submitReadinessLabel: string;
  officialTargets: AccessSubmissionStudioTarget[];
  copyBlocks: AccessSubmissionStudioCopyBlock[];
  attachmentChecklist: AccessSubmissionStudioAttachment[];
  browserRunbook: AccessSubmissionStudioStep[];
  handoffState: AccessSubmissionHandoffState;
  mailto: {
    to: string;
    subject: string;
    body: string;
    href: string;
  };
  totals: {
    readyCopyBlocks: number;
    totalCopyBlocks: number;
    readyRequiredAttachments: number;
    totalRequiredAttachments: number;
    operatorBlocks: number;
    externalGates: number;
  };
  blockers: string[];
  assertions: string[];
  externalGates: string[];
}

export type SwiggyAccessEvidenceStatus = "ready" | "operator_input" | "external_gate" | "watch";
export type SwiggyAccessEvidenceOwner = "MealPilot" | "Operator" | "Swiggy";
export type SwiggyAccessEvidenceKind =
  | "application_field"
  | "review_check"
  | "ground_rule"
  | "legal"
  | "track"
  | "attachment"
  | "runbook"
  | "proof";

export interface SwiggyAccessEvidenceRow {
  id: string;
  label: string;
  kind: SwiggyAccessEvidenceKind;
  status: SwiggyAccessEvidenceStatus;
  owner: SwiggyAccessEvidenceOwner;
  officialSource: string;
  officialRequirement: string;
  mealPilotEvidence: string;
  nextAction: string;
  evidenceLinks: string[];
}

export interface SwiggyAccessEvidenceSection {
  id: string;
  label: string;
  description: string;
  readyRows: number;
  operatorRows: number;
  externalGateRows: number;
  totalRows: number;
  rows: SwiggyAccessEvidenceRow[];
}

export interface SwiggyAccessEvidenceCommand {
  id: string;
  command: string;
  proves: string;
  expectedSignal: string;
}

export interface SwiggyAccessEvidenceMatrix {
  generatedAt: string;
  score: number;
  officialSources: string[];
  recommendedTrack: "developer" | "enterprise";
  totals: {
    rows: number;
    readyRows: number;
    operatorRows: number;
    externalGateRows: number;
    sections: number;
    requiredApplicationFields: number;
    readyRequiredApplicationFields: number;
    requiredAttachments: number;
    readyRequiredAttachments: number;
    proofCommands: number;
  };
  sections: SwiggyAccessEvidenceSection[];
  commands: SwiggyAccessEvidenceCommand[];
  submissionReadiness: string[];
  assertions: string[];
  externalGates: string[];
}

export interface SwiggyWidget {
  id: string;
  type: "restaurant-card" | "menu-item" | "cart-widget" | "product-card" | "slot-picker";
  server: SwiggyServer;
  title: string;
  src: string;
  fallback: string;
  width: string;
  height: number;
  events: string[];
  status: "contract_ready" | "semantic_fallback";
}

export type SwiggyWidgetRuntimeStatus = "fallback_ready" | "iframe_planned" | "hosted_ready" | "external_gate";

export interface SwiggyWidgetRuntimeSurface {
  id: string;
  server: SwiggyServer;
  type: SwiggyWidget["type"];
  returnedByTools: string[];
  purpose: string;
  iframe: {
    width: string;
    height: number;
    title: string;
    sandbox: string;
    origin: string;
    themeQuery: "light|dark";
    allowTopNavigation: false;
    parentRequiresHttps: boolean;
  };
  postMessageEvents: Array<{
    type: string;
    direction: "widget_to_parent";
    payload: string;
    handledBy: string;
    securityCheck: string;
  }>;
  fallback: {
    mode: "semantic_data_envelope";
    renderer: string;
    voiceSafe: boolean;
    summary: string;
  };
  status: SwiggyWidgetRuntimeStatus;
}

export interface SwiggyWidgetBridgeRule {
  id: string;
  label: string;
  status: "ready" | "external_gate";
  rule: string;
  evidence: string;
}

export interface SwiggyWidgetActivationCheck {
  id: string;
  label: string;
  status: SwiggyWidgetBridgeRule["status"];
  requirement: string;
  mealPilotProof: string;
  evidenceLinks: string[];
}

export interface SwiggyWidgetRenderContract {
  id: string;
  server: SwiggyServer;
  type: SwiggyWidget["type"];
  status: SwiggyWidgetRuntimeStatus;
  iframeSize: string;
  returnedByTools: string[];
  postMessageEvents: string[];
  fallbackRenderer: string;
  accessibility: string;
  voiceBehavior: string;
}

export interface SwiggyWidgetRuntimeReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalSurfaces: number;
  fallbackReady: number;
  hostedReady: number;
  eventsHandled: number;
  totalActivationChecks: number;
  readyActivationChecks: number;
  externalActivationGates: number;
  optInHeader: {
    name: "X-Swiggy-Widgets";
    plannedValue: "enabled";
    status: "external_gate";
    mealPilotBehavior: string;
  };
  surfaces: SwiggyWidgetRuntimeSurface[];
  bridgeRules: SwiggyWidgetBridgeRule[];
  activationChecklist: SwiggyWidgetActivationCheck[];
  renderContracts: SwiggyWidgetRenderContract[];
  sessionWidgets: SwiggyWidget[];
  assertions: string[];
  externalGates: string[];
}

export type CommercialActionGuardStatus = "ready" | "watch" | "external_gate";
export type CommercialActionLaneId = "food_order" | "instamart_checkout" | "dineout_booking" | "combined_evening";
export type CommercialActionRouteClass = "commercial_action" | "cart_mutation" | "tracking_read";

export interface CommercialActionLane {
  id: CommercialActionLaneId;
  label: string;
  server: SwiggyServer | "combined";
  actionTool: "place_food_order" | "checkout" | "book_table" | "place_food_order + book_table";
  freshReadTool: string;
  verificationTool: string;
  status: CommercialActionGuardStatus;
  confirmationRequired: true;
  nonIdempotent: boolean;
  paymentPolicy: string;
  routeClass: CommercialActionRouteClass;
  confirmationCopy: {
    chat: string;
    voice: string;
  };
  preflightChecks: string[];
  retryPolicy: string;
  telemetryFields: string[];
  supportPacketFields: string[];
  evidenceLinks: string[];
}

export interface CommercialActionGuardrail {
  id: string;
  label: string;
  status: CommercialActionGuardStatus;
  requirement: string;
  mealPilotControl: string;
  evidenceLinks: string[];
}

export interface CommercialActionRetryDrill {
  id: string;
  laneId: CommercialActionLaneId;
  label: string;
  simulatedFailure: string;
  firstResponse: string;
  verificationTool: string;
  retryDecision: string;
  supportContext: string[];
  status: CommercialActionGuardStatus;
}

export interface CommercialActionTelemetryContract {
  id: string;
  field: string;
  required: boolean;
  redaction: string;
  example: string;
}

export interface CommercialActionGuardReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalLanes: number;
  readyLanes: number;
  totalGuardrails: number;
  readyGuardrails: number;
  retryDrills: CommercialActionRetryDrill[];
  lanes: CommercialActionLane[];
  guardrails: CommercialActionGuardrail[];
  telemetryContract: CommercialActionTelemetryContract[];
  confirmationMatrix: Array<{
    laneId: CommercialActionLaneId;
    chat: string;
    voice: string;
  }>;
  latestPlanProof?: {
    sessionId: string;
    recommendations: number;
    commercialRecommendations: number;
  };
  assertions: string[];
  externalGates: string[];
}

export interface RateLimitBudget {
  scope: string;
  plannedLimit: string;
  mealPilotEstimate: string;
  status: "under_limit" | "watch" | "needs_upgrade";
  mitigation: string;
}

export interface RateLimitPlan {
  generatedAt: string;
  estimatedToolCallsPerSession: number;
  projectedDailyToolCalls: number;
  budgets: RateLimitBudget[];
  upgradeEmail: string;
}

export type TrafficReadinessStatus = "ready" | "watch" | "manual_input" | "external_gate";

export type TrafficLane = "discovery" | "cart" | "commercial" | "tracking" | "support" | "auth";

export interface TrafficLaneBudget {
  id: string;
  server: SwiggyServer | "all";
  lane: TrafficLane;
  plannedLimit: string;
  mealPilotEstimate: string;
  peakQps: number;
  dailyCalls: number;
  retryAfterPolicy: string;
  status: TrafficReadinessStatus;
  evidenceLinks: string[];
}

export interface TrafficRolloutStage {
  id: string;
  label: string;
  trafficPercent: number;
  pilotUsers: number;
  duration: string;
  entryCriteria: string[];
  rollbackTrigger: string[];
  status: TrafficReadinessStatus;
}

export interface TrafficNotification {
  id: string;
  label: string;
  leadTimeDays: number;
  channel: string;
  status: TrafficReadinessStatus;
  evidence: string;
}

export interface TrafficReadinessPlan {
  generatedAt: string;
  score: number;
  officialSources: string[];
  projectedDailySessions: number;
  estimatedToolCallsPerSession: number;
  projectedDailyToolCalls: number;
  peakQps: number;
  lanes: TrafficLaneBudget[];
  rollout: TrafficRolloutStage[];
  notifications: TrafficNotification[];
  retryAfterContract: {
    ready: boolean;
    maxWallClockMs: number;
    evidence: string[];
  };
  capacityUpgradeEmail: {
    to: string;
    subject: string;
    body: string;
  };
  guardrails: string[];
  assertions: string[];
  externalGates: string[];
}

export type BackpressureStatus = "ready" | "watch" | "external_gate";
export type BackpressureToolClass = "read" | "write" | "commercial" | "tracking" | "auth" | "background";
export type BackpressureSurface = "chat" | "voice" | "background" | "support";

export interface McpBackpressureBucket {
  id: string;
  server: SwiggyServer | "all";
  toolClass: BackpressureToolClass;
  plannedLimitPerMinute: number | "not_enforced_v1";
  burstWindowSeconds: number;
  burstMultiplier: number;
  queueDiscipline: string;
  retryAfterBehavior: string;
  shedAction: string;
  status: BackpressureStatus;
  evidenceLinks: string[];
}

export interface McpBackpressureRule {
  id: string;
  label: string;
  status: BackpressureStatus;
  swiggySignal: string;
  mealPilotControl: string;
  proof: string;
  evidenceLinks: string[];
}

export interface McpBackpressureSimulation {
  id: string;
  label: string;
  surface: BackpressureSurface;
  scenario: string;
  detectedSignal: string;
  governorDecision: string;
  delayMs: number;
  allowedCalls: number;
  deferredCalls: number;
  droppedCalls: number;
  toolSequence: string[];
  status: BackpressureStatus;
  evidenceLinks: string[];
}

export interface McpBackpressureTelemetryField {
  field: string;
  source: string;
  redaction: string;
  status: BackpressureStatus;
}

export interface McpBackpressureGovernorReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  mode: "v1_upstream_shedder" | "v1x_mcp_rate_limit_headers";
  totalBuckets: number;
  readyBuckets: number;
  trackingMinIntervalSeconds: number;
  maxRetries: number;
  maxUserWaitMs: number;
  plannedHeaders: string[];
  buckets: McpBackpressureBucket[];
  rules: McpBackpressureRule[];
  simulations: McpBackpressureSimulation[];
  telemetry: McpBackpressureTelemetryField[];
  capacityEmail: {
    to: string;
    subject: string;
    body: string;
  };
  assertions: string[];
  externalGates: string[];
}

export type SwiggyLoadLabStatus = "ready" | "watch" | "external_gate";

export interface SwiggyLoadLabScenario {
  id: string;
  label: string;
  description: string;
  pilotUsers: number;
  sessionsPerHour: number;
  toolCallsPerHour: number;
  peakQps: number;
  writeQps: number;
  retryAfterSeconds: number;
  projected429sPerHour: number;
  p95LatencyMs: number;
  status: SwiggyLoadLabStatus;
  bottleneck: string;
  decision: string;
  evidenceLinks: string[];
}

export interface SwiggyLoadLabLane {
  id: string;
  server: SwiggyServer | "all";
  lane: TrafficLane | "background";
  expectedQps: number;
  plannedCeiling: string;
  governor: string;
  status: SwiggyLoadLabStatus;
  evidenceLinks: string[];
}

export interface SwiggyLoadLabCohort {
  id: string;
  label: string;
  trafficPercent: number;
  users: number;
  entryGate: string;
  rollbackSignal: string;
  status: SwiggyLoadLabStatus;
}

export interface SwiggyLoadLabDrill {
  id: string;
  label: string;
  trigger: string;
  expectedDecision: string;
  proof: string;
  status: SwiggyLoadLabStatus;
}

export interface SwiggyLoadLabReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  mode: "mock" | "staging" | "production";
  totals: {
    scenarios: number;
    maxPeakQps: number;
    maxToolCallsPerHour: number;
    recommendedPilotUsers: number;
    retryAfterReady: boolean;
    externalGates: number;
  };
  scenarios: SwiggyLoadLabScenario[];
  lanes: SwiggyLoadLabLane[];
  cohortRamp: SwiggyLoadLabCohort[];
  drills: SwiggyLoadLabDrill[];
  operatorActions: Array<{ id: string; label: string; owner: "MealPilot" | "Operator" | "Swiggy"; status: SwiggyLoadLabStatus; evidence: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyOfferStatus = "ready" | "watch" | "external_gate";

export interface SwiggyOfferLane {
  id: string;
  server: SwiggyServer | "combined";
  label: string;
  officialTools: string[];
  route: string;
  guardrail: string;
  status: SwiggyOfferStatus;
  evidenceLinks: string[];
}

export interface SwiggyOfferOpportunity {
  id: string;
  server: SwiggyServer | "combined";
  label: string;
  source: "official_tool" | "cart_preflight" | "derived_value";
  estimatedSavings: number;
  applyMode: "auto_blocked" | "confirm_then_apply" | "surface_only";
  userCopy: string;
  proof: string;
  status: SwiggyOfferStatus;
  evidenceLinks: string[];
}

export interface SwiggyOfferGuardrail {
  id: string;
  label: string;
  policy: string;
  status: SwiggyOfferStatus;
  evidenceLinks: string[];
}

export interface SwiggyOfferDrill {
  id: string;
  label: string;
  trigger: string;
  expectedDecision: string;
  status: SwiggyOfferStatus;
}

export interface SwiggyOfferDecision {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer | "combined";
    offerType: "food_coupon" | "dineout_deal" | "instamart_value" | "combined_savings";
    cartFresh: boolean;
    paymentMode: "cod" | "online" | "free_booking" | "unknown";
    claimedSavings: number;
    userConfirmed: boolean;
  };
  decision: "apply_after_confirmation" | "surface_only" | "block";
  selectedLaneId: string;
  requiredTool: string;
  userFacingCopy: string;
  riskFlags: string[];
  telemetry: Array<{ field: string; value: string; redaction: string }>;
  assertions: string[];
}

export interface SwiggyOfferIntelligenceReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    opportunities: number;
    estimatedSavings: number;
    readyLanes: number;
    guardedApplications: number;
    officialCouponTools: number;
    externalGates: number;
  };
  lanes: SwiggyOfferLane[];
  opportunities: SwiggyOfferOpportunity[];
  guardrails: SwiggyOfferGuardrail[];
  drills: SwiggyOfferDrill[];
  operatorActions: Array<{ id: string; label: string; owner: "MealPilot" | "Operator" | "Swiggy"; status: SwiggyOfferStatus; evidence: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyOrderLifecycleStatus = "ready" | "watch" | "external_gate";

export interface SwiggyOrderLifecycleLane {
  id: string;
  server: SwiggyServer | "combined";
  label: string;
  officialTools: string[];
  cadenceSeconds: number;
  retryPolicy: string;
  supportEscalation: string;
  status: SwiggyOrderLifecycleStatus;
  evidenceLinks: string[];
}

export interface SwiggyOrderLifecycleTimeline {
  id: string;
  server: SwiggyServer;
  label: string;
  state: string;
  etaMinutes: number | null;
  visibleCopy: string;
  supportTrigger: string;
  status: SwiggyOrderLifecycleStatus;
  evidenceLinks: string[];
}

export interface SwiggyOrderLifecycleRecovery {
  id: string;
  trigger: string;
  statusProbe: string;
  decision: string;
  blockedRetry: string;
  supportPacket: string;
  status: SwiggyOrderLifecycleStatus;
}

export interface SwiggyOrderLifecycleTelemetry {
  field: string;
  source: string;
  redaction: string;
  status: SwiggyOrderLifecycleStatus;
}

export interface SwiggyOrderLifecycleReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    toolsCovered: number;
    activeTimelines: number;
    recoveryDrills: number;
    trackingCadenceSeconds: number;
    externalGates: number;
  };
  lanes: SwiggyOrderLifecycleLane[];
  timelines: SwiggyOrderLifecycleTimeline[];
  recoveries: SwiggyOrderLifecycleRecovery[];
  telemetry: SwiggyOrderLifecycleTelemetry[];
  operatorActions: Array<{
    id: string;
    label: string;
    owner: "MealPilot" | "Operator" | "Swiggy";
    status: SwiggyOrderLifecycleStatus;
    evidence: string;
  }>;
  assertions: string[];
  externalGates: string[];
}

export interface SwiggyOrderLifecycleProbe {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer;
    trigger: "user_tracking_refresh" | "commercial_action_timeout" | "commercial_action_5xx" | "user_retry_request" | "support_request";
    currentStatus: "known_active" | "known_completed" | "not_found" | "unknown";
    statusAgeSeconds: number;
    hasOrderOrBookingId: boolean;
    identifierHash: string | null;
    userConfirmedRetry: boolean;
  };
  decision:
    | "defer_tracking"
    | "refresh_status"
    | "show_existing_status"
    | "block_retry"
    | "allow_retry_after_fresh_probe"
    | "escalate_support";
  requiredTool: string;
  cadenceSeconds: number;
  blockedRetry: boolean;
  userFacingCopy: string;
  riskFlags: string[];
  telemetry: Array<{
    field: string;
    value: string;
    redaction: string;
  }>;
  assertions: string[];
}

export type SwiggyLocationTrustStatus = "ready" | "watch" | "external_gate";

export interface SwiggyLocationTrustLane {
  id: string;
  server: SwiggyServer | "combined";
  label: string;
  officialTools: string[];
  purpose: string;
  userGate: string;
  refreshPolicy: string;
  privacyPosture: string;
  status: SwiggyLocationTrustStatus;
  evidenceLinks: string[];
}

export interface SwiggyLocationTrustControl {
  id: string;
  label: string;
  policy: string;
  status: SwiggyLocationTrustStatus;
  evidenceLinks: string[];
}

export interface SwiggyLocationTrustScenario {
  id: string;
  label: string;
  trigger: string;
  expectedDecision: string;
  protectedFields: string[];
  status: SwiggyLocationTrustStatus;
}

export interface SwiggyLocationTrustTelemetry {
  field: string;
  source: string;
  redaction: string;
  status: SwiggyLocationTrustStatus;
}

export interface SwiggyLocationTrustReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    toolsCovered: number;
    readyControls: number;
    scenarios: number;
    redactedFields: number;
    externalGates: number;
  };
  lanes: SwiggyLocationTrustLane[];
  controls: SwiggyLocationTrustControl[];
  scenarios: SwiggyLocationTrustScenario[];
  telemetry: SwiggyLocationTrustTelemetry[];
  operatorActions: Array<{
    id: string;
    label: string;
    owner: "MealPilot" | "Operator" | "Swiggy";
    status: SwiggyLocationTrustStatus;
    evidence: string;
  }>;
  assertions: string[];
  externalGates: string[];
}

export interface SwiggyLocationSelectionDecision {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer | "combined";
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
  };
  decision: "ready_for_discovery" | "pause_for_user_choice" | "block_until_refresh" | "confirm_address_mutation";
  selectedLocationHash: string;
  requiredNextTool: string;
  invalidatedSurfaces: string[];
  userFacingCopy: string;
  riskFlags: string[];
  telemetry: Array<{
    field: string;
    value: string;
    redaction: string;
  }>;
  assertions: string[];
}

export type SwiggyCartMutationStatus = "ready" | "watch" | "external_gate";

export interface SwiggyCartMutationLane {
  id: string;
  server: SwiggyServer | "combined";
  label: string;
  officialTools: string[];
  mutationRule: string;
  readbackRule: string;
  userGate: string;
  status: SwiggyCartMutationStatus;
  evidenceLinks: string[];
}

export interface SwiggyCartMutationGuardrail {
  id: string;
  label: string;
  policy: string;
  status: SwiggyCartMutationStatus;
  evidenceLinks: string[];
}

export interface SwiggyCartMutationScenario {
  id: string;
  label: string;
  trigger: string;
  expectedDecision: string;
  tools: string[];
  status: SwiggyCartMutationStatus;
}

export interface SwiggyCartMutationTelemetry {
  field: string;
  source: string;
  redaction: string;
  status: SwiggyCartMutationStatus;
}

export interface SwiggyCartMutationReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    toolsCovered: number;
    readyGuardrails: number;
    scenarios: number;
    readbackLanes: number;
    externalGates: number;
  };
  lanes: SwiggyCartMutationLane[];
  guardrails: SwiggyCartMutationGuardrail[];
  scenarios: SwiggyCartMutationScenario[];
  telemetry: SwiggyCartMutationTelemetry[];
  operatorActions: Array<{
    id: string;
    label: string;
    owner: "MealPilot" | "Operator" | "Swiggy";
    status: SwiggyCartMutationStatus;
    evidence: string;
  }>;
  assertions: string[];
  externalGates: string[];
}

export interface SwiggyCartMutationExecution {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer;
    mutationTool: "update_food_cart" | "flush_food_cart" | "update_cart" | "clear_cart" | "create_cart";
    contextFresh: boolean;
    userConfirmed: boolean;
    commercialActionRequested: boolean;
  };
  decision:
    | "mutated_with_readback"
    | "blocked_until_refresh"
    | "blocked_for_confirmation"
    | "blocked_commercial_action"
    | "external_gate";
  requiredReadbackTool: "get_food_cart" | "get_cart" | "get_available_slots";
  executedTools: string[];
  readback: {
    available: boolean;
    status: string;
    totalBucket: string;
    paymentMethodLabel: string;
  };
  userFacingCopy: string;
  riskFlags: string[];
  telemetry: Array<{
    field: string;
    value: string;
    redaction: string;
  }>;
  assertions: string[];
}

export type SwiggyDiscoveryFreshnessStatus = "ready" | "watch" | "external_gate";

export interface SwiggyDiscoveryFreshnessLane {
  id: string;
  server: SwiggyServer | "combined";
  label: string;
  officialTools: string[];
  freshnessRule: string;
  selectionRule: string;
  mutationBoundary: string;
  status: SwiggyDiscoveryFreshnessStatus;
  evidenceLinks: string[];
}

export interface SwiggyDiscoveryFreshnessControl {
  id: string;
  label: string;
  policy: string;
  status: SwiggyDiscoveryFreshnessStatus;
  evidenceLinks: string[];
}

export interface SwiggyDiscoveryFreshnessScenario {
  id: string;
  label: string;
  trigger: string;
  expectedDecision: string;
  tools: string[];
  status: SwiggyDiscoveryFreshnessStatus;
}

export interface SwiggyDiscoveryFreshnessTelemetry {
  field: string;
  source: string;
  redaction: string;
  status: SwiggyDiscoveryFreshnessStatus;
}

export interface SwiggyDiscoveryFreshnessReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    toolsCovered: number;
    readyControls: number;
    scenarios: number;
    freshnessChecks: number;
    externalGates: number;
  };
  lanes: SwiggyDiscoveryFreshnessLane[];
  controls: SwiggyDiscoveryFreshnessControl[];
  scenarios: SwiggyDiscoveryFreshnessScenario[];
  telemetry: SwiggyDiscoveryFreshnessTelemetry[];
  operatorActions: Array<{
    id: string;
    label: string;
    owner: "MealPilot" | "Operator" | "Swiggy";
    status: SwiggyDiscoveryFreshnessStatus;
    evidence: string;
  }>;
  assertions: string[];
  externalGates: string[];
}

export interface SwiggyDiscoveryResolution {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer;
    discoveryTool:
      | "search_restaurants"
      | "get_restaurant_menu"
      | "search_menu"
      | "search_products"
      | "your_go_to_items"
      | "search_restaurants_dineout"
      | "get_restaurant_details"
      | "get_available_slots";
    contextFresh: boolean;
    userSelectedResult: boolean;
    downstreamIntent: "browse" | "cart_mutation" | "booking" | "combined_plan";
  };
  decision: "resolved_for_selection" | "pause_for_selection" | "blocked_until_refresh" | "external_gate";
  selectedLaneId: string;
  resultSummary: {
    available: boolean;
    resultCount: number;
    primaryLabel: string;
    freshnessTag: string;
  };
  invalidatedSurfaces: string[];
  nextRequiredTool: string;
  userFacingCopy: string;
  riskFlags: string[];
  telemetry: Array<{
    field: string;
    value: string;
    redaction: string;
  }>;
  assertions: string[];
}

export type SwiggyConfirmationCommandStatus = "ready" | "watch" | "external_gate";

export interface SwiggyConfirmationLane {
  id: string;
  server: SwiggyServer | "combined";
  label: string;
  officialTools: string[];
  protectedAction: string;
  confirmationCopy: string;
  preflightReads: string[];
  postActionProbe: string;
  retryPolicy: string;
  status: SwiggyConfirmationCommandStatus;
  evidenceLinks: string[];
}

export interface SwiggyConfirmationChecklistItem {
  id: string;
  label: string;
  policy: string;
  status: SwiggyConfirmationCommandStatus;
  evidenceLinks: string[];
}

export interface SwiggyConfirmationScenario {
  id: string;
  label: string;
  trigger: string;
  expectedDecision: string;
  protectedAction: string;
  status: SwiggyConfirmationCommandStatus;
}

export interface SwiggyConfirmationTelemetry {
  field: string;
  source: string;
  redaction: string;
  status: SwiggyConfirmationCommandStatus;
}

export interface SwiggyConfirmationCommandCenterReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    toolsCovered: number;
    readyChecklistItems: number;
    scenarios: number;
    protectedActions: number;
    postActionProbes: number;
    externalGates: number;
  };
  lanes: SwiggyConfirmationLane[];
  checklist: SwiggyConfirmationChecklistItem[];
  scenarios: SwiggyConfirmationScenario[];
  telemetry: SwiggyConfirmationTelemetry[];
  operatorActions: Array<{
    id: string;
    label: string;
    owner: "MealPilot" | "Operator" | "Swiggy";
    status: SwiggyConfirmationCommandStatus;
    evidence: string;
  }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyConfirmationExecutionDecision =
  | "executed_with_status_probe"
  | "resolved_after_status_probe"
  | "awaiting_confirmation"
  | "blocked_until_refresh"
  | "blocked_payment_truth"
  | "blocked_server_mismatch"
  | "blocked_paid_dineout"
  | "external_gate";

export interface SwiggyConfirmationExecution {
  generatedAt: string;
  requestId: string;
  mode: "mock" | "staging" | "production";
  input: {
    server: SwiggyServer;
    actionTool: "place_food_order" | "checkout" | "book_table";
    contextFresh: boolean;
    userConfirmed: boolean;
    separateConfirmation: boolean;
    paymentOrFreeTruthAcknowledged: boolean;
    simulateAmbiguousResult: boolean;
  };
  decision: SwiggyConfirmationExecutionDecision;
  selectedLaneId: "food_order_confirmation" | "instamart_checkout_confirmation" | "dineout_booking_confirmation";
  preflightTool: "get_food_cart" | "get_cart" | "get_available_slots";
  protectedActionTool: "place_food_order" | "checkout" | "book_table";
  statusProbeTool: "get_food_orders" | "get_orders" | "get_booking_status";
  executedTools: string[];
  preflightSummary: {
    available: boolean;
    totalLabel: string;
    paymentOrFreeLabel: string;
    statusLabel: string;
  };
  actionSummary: {
    attempted: boolean;
    statusLabel: string;
    referenceHash: string;
  };
  statusProbeSummary: {
    attempted: boolean;
    statusLabel: string;
    referenceHash: string;
  };
  riskFlags: string[];
  userFacingCopy: string;
  supportPacket: {
    confirmationIdHash: string;
    preflightSnapshotHash: string;
    protectedAction: string;
    statusProbe: string;
    retryPolicy: string;
  };
  telemetry: Array<{
    field: string;
    value: string;
    redaction: string;
  }>;
  assertions: string[];
}

export type SwiggyCancellationCareStatus = "ready" | "watch" | "external_gate";

export interface SwiggyCancellationCareLane {
  id: string;
  server: SwiggyServer | "combined";
  label: string;
  officialTools: string[];
  userIntent: string;
  allowedAction: string;
  blockedAction: string;
  supportCopy: string;
  status: SwiggyCancellationCareStatus;
  evidenceLinks: string[];
}

export interface SwiggyCancellationCareControl {
  id: string;
  label: string;
  policy: string;
  status: SwiggyCancellationCareStatus;
  evidenceLinks: string[];
}

export interface SwiggyCancellationCareScenario {
  id: string;
  label: string;
  trigger: string;
  expectedDecision: string;
  status: SwiggyCancellationCareStatus;
}

export interface SwiggyCancellationCareTelemetry {
  field: string;
  source: string;
  redaction: string;
  status: SwiggyCancellationCareStatus;
}

export interface SwiggyCancellationCareCenterReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  customerCarePhone: string;
  totals: {
    lanes: number;
    reportErrorTools: number;
    readyControls: number;
    scenarios: number;
    noToolCancellationGuards: number;
    externalGates: number;
  };
  lanes: SwiggyCancellationCareLane[];
  controls: SwiggyCancellationCareControl[];
  scenarios: SwiggyCancellationCareScenario[];
  telemetry: SwiggyCancellationCareTelemetry[];
  operatorActions: Array<{
    id: string;
    label: string;
    owner: "MealPilot" | "Operator" | "Swiggy";
    status: SwiggyCancellationCareStatus;
    evidence: string;
  }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyDineoutPrecisionStatus = "ready" | "watch" | "external_gate";

export interface SwiggyDineoutPrecisionLane {
  id: string;
  label: string;
  intent: "free_table_booking" | "standalone_booking_cart" | "bill_payment_cart" | "post_booking_status" | "live_calibration";
  officialTools: string[];
  cartType: "DEAL_TICKET_PURCHASE" | "DINEOUT" | "none";
  requiredFields: string[];
  allowedAction: string;
  blockedAction: string;
  confirmationCopy: string;
  status: SwiggyDineoutPrecisionStatus;
  evidenceLinks: string[];
}

export interface SwiggyDineoutPrecisionGuard {
  id: string;
  label: string;
  policy: string;
  status: SwiggyDineoutPrecisionStatus;
  evidenceLinks: string[];
}

export interface SwiggyDineoutPrecisionScenario {
  id: string;
  label: string;
  trigger: string;
  expectedDecision: string;
  protectedTool: string;
  status: SwiggyDineoutPrecisionStatus;
}

export interface SwiggyDineoutPrecisionTelemetry {
  field: string;
  source: string;
  redaction: string;
  status: SwiggyDineoutPrecisionStatus;
}

export interface SwiggyDineoutPrecisionCenterReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  totals: {
    lanes: number;
    toolsCovered: number;
    freeBookingGuards: number;
    billPaymentLanes: number;
    readyGuards: number;
    scenarios: number;
    externalGates: number;
  };
  lanes: SwiggyDineoutPrecisionLane[];
  guards: SwiggyDineoutPrecisionGuard[];
  scenarios: SwiggyDineoutPrecisionScenario[];
  telemetry: SwiggyDineoutPrecisionTelemetry[];
  operatorActions: Array<{
    id: string;
    label: string;
    owner: "MealPilot" | "Operator" | "Swiggy";
    status: SwiggyDineoutPrecisionStatus;
    evidence: string;
  }>;
  assertions: string[];
  externalGates: string[];
}

export interface VersionAlert {
  id: string;
  label: string;
  status: "ready" | "watch" | "blocked";
  evidence: string;
}

export interface VersionMonitor {
  currentMajor: string;
  pinnedRoutes: Record<SwiggyServer, string>;
  deprecationWindowDays: number;
  alerts: VersionAlert[];
}

export interface ComplianceControl {
  id: string;
  label: string;
  status: "implemented" | "manual_review";
  evidence: string;
}

export interface ComplianceEvidence {
  residency: string;
  dataRole: string;
  retainedFields: string[];
  controls: ComplianceControl[];
}

export type DataGovernanceStatus = "ready" | "watch" | "manual_input" | "external_gate";

export interface DataGovernanceControl {
  id: string;
  label: string;
  status: DataGovernanceStatus;
  swiggyRequirement: string;
  mealPilotControl: string;
  evidenceLinks: string[];
}

export interface DataFlowInventoryItem {
  id: string;
  category: "identity" | "location" | "preference" | "commerce" | "support" | "telemetry" | "token";
  source: "user" | "swiggy_mcp" | "mealpilot";
  fields: string[];
  storage: "not_persisted" | "session_only" | "local_profile" | "runtime_memory" | "redacted_log";
  retention: string;
  lawfulBasis: string;
  controls: string[];
  status: DataGovernanceStatus;
}

export interface DataSubjectRequestStep {
  id: string;
  requestType: "access" | "correction" | "erasure" | "swiggy_originated";
  owner: "MealPilot" | "Swiggy" | "Joint";
  status: DataGovernanceStatus;
  action: string;
  evidence: string;
}

export interface DataGovernanceCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  dataRole: {
    swiggyRole: "Data Fiduciary";
    mealPilotRole: "Data Processor";
    evidence: string;
  };
  residency: {
    primaryCompute: string;
    primaryDataStores: string;
    failover: string;
    boundary: string;
    status: DataGovernanceStatus;
  };
  dataFlows: DataFlowInventoryItem[];
  controls: DataGovernanceControl[];
  dsrRunbook: DataSubjectRequestStep[];
  retention: {
    localPlanRetentionDays: number;
    swiggyAuditLogDays: number;
    compactionEndpoint: string;
    evidence: string[];
  };
  securityContacts: Array<{ label: string; contact: string; useCase: string; status: DataGovernanceStatus }>;
  signedManifestReadiness: {
    status: DataGovernanceStatus;
    targetVersion: string;
    evidence: string[];
  };
  assertions: string[];
  externalGates: string[];
}

export type BrandComplianceStatus = "ready" | "watch" | "manual_input" | "external_gate";

export interface BrandComplianceRule {
  id: string;
  label: string;
  status: BrandComplianceStatus;
  officialSignal: string;
  mealPilotControl: string;
  evidenceLinks: string[];
}

export interface BrandSurfacePlacement {
  id: string;
  surface: "planner" | "recommendation_card" | "voice" | "widget" | "support" | "docs" | "launch";
  placement: string;
  requiredCopy: string;
  status: BrandComplianceStatus;
  evidence: string;
}

export interface BrandAssetGate {
  id: string;
  label: string;
  status: BrandComplianceStatus;
  source: string;
  allowedUse: string;
  blockedUse: string;
  nextAction: string;
}

export interface BrandComplianceKit {
  generatedAt: string;
  score: number;
  officialSources: string[];
  attributionCopy: string[];
  rules: BrandComplianceRule[];
  surfaces: BrandSurfacePlacement[];
  assetGates: BrandAssetGate[];
  paletteAudit: {
    primaryPalette: string;
    swiggyOrange: "#FF5200";
    orangeUsage: "reserved_for_swiggy_marks_only" | "used_as_primary_palette";
    status: BrandComplianceStatus;
    evidence: string;
  };
  launchChecklist: Array<{ id: string; label: string; status: BrandComplianceStatus; evidence: string }>;
  assertions: string[];
  externalGates: string[];
}

export interface ReviewerProof {
  score: number;
  highlights: string[];
  blockers: string[];
  artifacts: Array<{ label: string; path: string }>;
}

export interface LaunchBundleArtifact {
  id: string;
  label: string;
  path: string;
  category: "api" | "doc" | "command" | "runtime" | "external";
  status: "ready" | "manual_input" | "external_gate";
  evidence: string;
}

export interface LaunchBundlePhase {
  id: string;
  label: string;
  status: "ready" | "manual_input" | "external_gate";
  owner: "MealPilot" | "Operator" | "Swiggy";
  evidence: string;
  artifacts: string[];
}

export interface LaunchBundle {
  generatedAt: string;
  score: number;
  readinessLabel: "local_review_ready" | "staging_ready" | "production_ready";
  integrationName: string;
  requestedServers: SwiggyServer[];
  reviewerNarrative: string;
  artifacts: LaunchBundleArtifact[];
  phases: LaunchBundlePhase[];
  commands: Array<{ id: string; command: string; proves: string }>;
  accessApplication: Array<{ label: string; value: string; status: "ready" | "manual_input" | "external_gate" }>;
  goLiveGates: Array<{ label: string; status: "ready" | "manual_input" | "external_gate"; evidence: string }>;
  handoffEmail: {
    to: string;
    subject: string;
    body: string;
  };
}

export type ResilienceStatus = "pass" | "watch" | "blocked";

export interface ResilienceDrillStep {
  id: string;
  sequence: number;
  server: SwiggyServer | "all";
  tool: string;
  label: string;
  simulatedResponse: string;
  action: string;
  evidence: string;
  status: ResilienceStatus;
}

export interface ResilienceDrill {
  id: string;
  label: string;
  swiggyRequirement: string;
  failureMode: string;
  protectedTools: string[];
  recoveryPattern: string;
  retryBudgetMs: number;
  userImpact: string;
  status: ResilienceStatus;
  steps: ResilienceDrillStep[];
}

export interface ResilienceRunbook {
  generatedAt: string;
  score: number;
  safeRetryClasses: string[];
  nonBlindRetryTools: CommerceAction[];
  escalationEmail: string;
  checklist: Array<{ id: string; label: string; status: ResilienceStatus; evidence: string }>;
  supportPayload: Record<string, string>;
}

export interface ObservabilityAttribute {
  key: string;
  value: string | number | boolean;
}

export interface TraceSpan {
  id: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  kind: "api_request" | "mcp_tool" | "confirmation_gate" | "retry_guard" | "privacy_filter";
  server?: SwiggyServer | "all";
  tool?: string;
  status: "ok" | "locked" | "watch" | "blocked";
  startOffsetMs: number;
  durationMs: number;
  attributes: ObservabilityAttribute[];
}

export interface TraceEnvelope {
  traceId: string;
  requestId: string;
  sessionId: string;
  rootName: string;
  status: "ok" | "watch" | "blocked";
  durationMs: number;
  spanCount: number;
  spans: TraceSpan[];
}

export interface TraceMetric {
  id: string;
  label: string;
  value: string;
  status: "healthy" | "watch" | "blocked";
  evidence: string;
}

export interface ObservabilityTraceReport {
  generatedAt: string;
  score: number;
  traces: TraceEnvelope[];
  metrics: TraceMetric[];
  logContract: {
    requiredFields: string[];
    redactedFields: string[];
    sample: Record<string, string | number | boolean>;
  };
}

export type SloIncidentStatus = "ready" | "watch" | "external_gate" | "blocked";

export interface SloTarget {
  id: string;
  label: string;
  scope: string;
  target: string;
  monthlyDowntimeBudget: string;
  measurement: string;
  status: SloIncidentStatus;
  evidenceLinks: string[];
}

export interface SloLatencyClass {
  id: string;
  label: string;
  toolClass: "read" | "write" | "commercial";
  p50TargetMs: number;
  p95TargetMs: number;
  p99TargetMs: number;
  observedP95Ms: number;
  status: SloIncidentStatus;
  evidence: string;
}

export interface IncidentCommunicationPlan {
  severity: "S0" | "S1" | "S2" | "S3";
  trigger: string;
  ack: string;
  updateCadence: string;
  owner: "MealPilot" | "Swiggy" | "Joint";
  status: SloIncidentStatus;
  runbook: string[];
}

export interface MaintenanceWindowPlan {
  noticeHours: number;
  blackoutWindowsIst: string[];
  status: SloIncidentStatus;
  evidence: string;
}

export interface SloIncidentCommandCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  currentMode: "mock" | "staging" | "production";
  latestSessionId?: string;
  uptimeTargets: SloTarget[];
  latencyTargets: SloLatencyClass[];
  statusPage: {
    url: string;
    swiggyStatus: "planned_v1_1" | "live_external";
    mealPilotFallback: string;
    status: SloIncidentStatus;
  };
  incidentComms: IncidentCommunicationPlan[];
  maintenance: MaintenanceWindowPlan;
  measurementRules: string[];
  remediation: {
    contact: string;
    status: SloIncidentStatus;
    evidence: string[];
  };
  liveReadiness: Array<{ id: string; label: string; status: SloIncidentStatus; evidence: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyOperatingContractStatus = "ready" | "watch" | "external_gate";

export interface SwiggyOperatingContractPillar {
  id: string;
  label: string;
  status: SwiggyOperatingContractStatus;
  officialSignal: string;
  mealPilotControl: string;
  evidenceLinks: string[];
}

export interface SwiggyOperatingContractRunbook {
  id: string;
  label: string;
  owner: "MealPilot" | "Swiggy" | "Joint";
  status: SwiggyOperatingContractStatus;
  trigger: string;
  action: string;
  evidenceLinks: string[];
}

export interface SwiggyOperatingContractReadinessGate {
  id: string;
  label: string;
  status: SwiggyOperatingContractStatus;
  proof: string;
  nextAction: string;
}

export interface SwiggyOperatingContractCenterReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  contractSignal: {
    currentMode: "mock" | "staging" | "production";
    operatingVersion: "v1.0";
    targetUptime: "99.9%";
    deprecationWindowDays: number;
    summary: string;
  };
  totals: {
    pillars: number;
    runbooks: number;
    readinessGates: number;
    readyPillars: number;
    externalGates: number;
  };
  pillars: SwiggyOperatingContractPillar[];
  runbooks: SwiggyOperatingContractRunbook[];
  readinessGates: SwiggyOperatingContractReadinessGate[];
  launchEmail: {
    to: string;
    subject: string;
    body: string;
  };
  assertions: string[];
  externalGates: string[];
}

export interface RuntimeTelemetryEvent {
  ts: string;
  level: "info" | "warn" | "error";
  event: "mealpilot_request" | "mcp_tool_call";
  requestId: string;
  method: string;
  route: string;
  userIdHash: string;
  sessionId?: string;
  durationMs: number;
  status: number;
  statusClass: "2xx" | "3xx" | "4xx" | "5xx";
  redacted: boolean;
}

export interface RuntimeTelemetryMetric {
  id: string;
  label: string;
  value: string;
  status: "healthy" | "watch" | "blocked";
  evidence: string;
}

export interface RuntimeTelemetryReport {
  generatedAt: string;
  score: number;
  events: RuntimeTelemetryEvent[];
  metrics: RuntimeTelemetryMetric[];
  logShape: {
    requiredFields: string[];
    sample: RuntimeTelemetryEvent | null;
  };
  redactionContract: {
    redactedFields: string[];
    allowedIdentifiers: string[];
    evidence: string[];
  };
  supportReady: {
    escalationEmail: string;
    requestIds: string[];
    sessionIds: string[];
    timeRange: string;
  };
}

export type AuditLedgerStatus = "ready" | "watch" | "blocked" | "external_gate";

export interface AuditLedgerEvent {
  id: string;
  sessionId: string;
  server: SwiggyServer;
  tool: string;
  status: ToolCallEvent["status"];
  durationMs: number;
  routeClass: "read" | "cart_mutation" | "coupon" | "commercial_action" | "tracking" | "support";
  redaction: "redacted";
  supportCorrelation: string;
  evidence: string;
}

export interface AuditLedgerControl {
  id: string;
  label: string;
  status: AuditLedgerStatus;
  requirement: string;
  evidence: string;
}

export interface AuditLedgerCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totalEvents: number;
  coveredSessions: number;
  coveredServers: SwiggyServer[];
  commercialActions: number;
  supportReadyEvents: number;
  retention: {
    mealPilotPlanRetentionDays: number;
    swiggyAuditLogDays: number;
    localCompactionEndpoint: string;
    evidence: string;
  };
  redaction: {
    redactedFields: string[];
    allowedFields: string[];
    piiFree: boolean;
    evidence: string;
  };
  events: AuditLedgerEvent[];
  controls: AuditLedgerControl[];
  dsrRouting: Array<{ id: string; label: string; owner: "MealPilot" | "Swiggy"; status: AuditLedgerStatus; evidence: string }>;
  supportPackage: {
    to: string;
    requiredFields: string[];
    bodyPreview: string;
  };
  assertions: string[];
  externalGates: string[];
}

export interface RouteOptimizationStep {
  id: string;
  sequence: number;
  server: SwiggyServer;
  tool: string;
  toolClass: "read" | "cart_mutation" | "coupon" | "tracking" | "commercial_action" | "support";
  whenToCall: string;
  cachePolicy: string;
  retryPolicy: string;
  confirmationGate: string;
  expectedLatencyMs: number;
}

export interface RouteOptimizationJourney {
  id: string;
  title: string;
  userIntent: string;
  optimizedFor: "latency" | "safety" | "conversion" | "voice";
  swiggyServers: SwiggyServer[];
  baselineCalls: number;
  optimizedCalls: number;
  savedCalls: number;
  steps: RouteOptimizationStep[];
  controls: string[];
}

export interface RouteOptimizationTotals {
  baselineCalls: number;
  optimizedCalls: number;
  savedCalls: number;
  parallelizableSteps: number;
  commercialGates: number;
  expectedLatencyMs: number;
}

export interface RouteOptimizationProfile {
  id: string;
  label: string;
  objective: string;
  bestFor: string;
  journeyIds: string[];
  estimatedLatencyMs: number;
  savedCalls: number;
  safetyPosture: string;
}

export interface RouteOptimizationBatch {
  id: string;
  label: string;
  phase: "location" | "discovery" | "cart_truth" | "confirmation" | "commercial" | "support";
  parallel: boolean;
  tools: Array<{ server: SwiggyServer; tool: string }>;
  expectedLatencyMs: number;
  savedCalls: number;
  riskControl: string;
}

export interface RouteOptimizationHandoff {
  id: string;
  fromServer: SwiggyServer;
  toServer: SwiggyServer;
  sharedContext: string;
  redactionRule: string;
  cacheWindow: string;
  proofLink: string;
}

export interface SwiggyRouteOptimizationReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  totals: RouteOptimizationTotals;
  totalSavedCalls: number;
  journeys: RouteOptimizationJourney[];
  profiles: RouteOptimizationProfile[];
  parallelBatches: RouteOptimizationBatch[];
  crossServerHandoffs: RouteOptimizationHandoff[];
  cacheRules: string[];
  guardrails: string[];
  stagingAssertions: string[];
  assertions: string[];
}

export type CredentialReadinessStatus = "ready" | "watch" | "blocked";

export interface CredentialOnboardingCheck {
  id: string;
  label: string;
  status: CredentialReadinessStatus;
  owner: "MealPilot" | "Swiggy" | "Operator";
  evidence: string;
  nextAction: string;
}

export interface OAuthMetadataEndpoint {
  id: string;
  label: string;
  url: string;
  purpose: string;
  status: "wired" | "documented" | "external";
}

export interface RedirectUriAudit {
  redirectUri: string;
  status: CredentialReadinessStatus;
  productionSafe: boolean;
  localhostAllowed: boolean;
  exactMatchRequired: boolean;
  evidence: string;
}

export interface DynamicClientRegistrationPlan {
  endpoint: string;
  mode: "dry_run" | "mock_registered" | "ready_for_live_registration";
  supportedBySwiggy: boolean;
  payload: {
    client_name: string;
    redirect_uris: string[];
    scope: string;
    grant_types: string[];
    response_types: string[];
    token_endpoint_auth_method: string;
    application_type: string;
  };
  simulatedResponse: {
    client_id: string;
    client_id_issued_at: number;
    redirect_uris: string[];
    scope: string;
  };
  evidence: string[];
}

export interface CredentialAccessApplicationField {
  id: string;
  label: string;
  value: string;
  status: "ready" | "manual_input" | "external";
  source: string;
}

export interface CredentialOnboardingReport {
  generatedAt: string;
  mode: "mock" | "staging" | "production";
  baseUrl: string;
  score: number;
  requestedServers: SwiggyServer[];
  scopes: string[];
  redirectUriAudit: RedirectUriAudit;
  dynamicClientRegistration: DynamicClientRegistrationPlan;
  metadataEndpoints: OAuthMetadataEndpoint[];
  checks: CredentialOnboardingCheck[];
  accessApplicationFields: CredentialAccessApplicationField[];
  launchSequence: string[];
  externalGates: string[];
}

export type SandboxCredentialStatus = "ready" | "operator_input" | "swiggy_gate" | "blocked";

export interface SandboxCredentialLane {
  id: string;
  label: string;
  status: SandboxCredentialStatus;
  owner: "MealPilot" | "Operator" | "Swiggy";
  officialSignal: string;
  mealPilotProof: string[];
  nextAction: string;
}

export interface SandboxSeededDataPlan {
  server: SwiggyServer;
  stagingEndpoint: string;
  firstReadTool: string;
  seededDataNeed: string;
  guardedWrite: string;
  confirmationProof: string;
  status: SandboxCredentialStatus;
}

export interface SandboxCredentialWorkbench {
  generatedAt: string;
  mode: "mock" | "staging" | "production";
  score: number;
  officialSources: string[];
  localReadiness: {
    redirectUriStatus: CredentialReadinessStatus;
    dcrMode: DynamicClientRegistrationPlan["mode"];
    scopesReady: boolean;
    pkceReady: boolean;
    tokenStorageReady: boolean;
  };
  lanes: SandboxCredentialLane[];
  seededDataPlan: SandboxSeededDataPlan[];
  stagingPromotion: {
    soakHoursRequired: number;
    assignedTools: number;
    totalTools: number;
    requiredEvidence: string[];
  };
  commands: Array<{ id: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyStagingCredentialDrillStatus = "ready" | "operator_input" | "swiggy_gate" | "blocked";

export interface SwiggyStagingCredentialDrillLane {
  id: string;
  label: string;
  owner: "MealPilot" | "Operator" | "Swiggy" | "Joint";
  status: SwiggyStagingCredentialDrillStatus;
  officialSignal: string;
  localProof: string[];
  drillCommand: string;
  exitCriteria: string[];
}

export interface SwiggyStagingFirstCallDrill {
  id: string;
  server: SwiggyServer;
  endpoint: string;
  firstTool: string;
  seededDataNeed: string;
  status: SwiggyStagingCredentialDrillStatus;
  dryRunRequest: {
    jsonrpc: "2.0";
    method: "tools/call";
    params: {
      name: string;
      arguments: Record<string, unknown>;
    };
  };
  successEvidence: string[];
  failureStopRule: string;
}

export interface SwiggyStagingCredentialDrillReport {
  generatedAt: string;
  mode: "mock" | "staging" | "production";
  score: number;
  officialSources: string[];
  credentialSignal: {
    clientIdConfigured: boolean;
    tokenSource: McpGatewayStatus["auth"]["tokenSource"];
    redirectUri: string;
    stagingVerified: boolean;
    currentGate: SwiggyStagingCredentialDrillStatus;
    evidence: string;
  };
  totals: {
    lanes: number;
    readyLanes: number;
    firstCallDrills: number;
    seededDataRequirements: number;
    promotionGates: number;
    externalGates: number;
  };
  lanes: SwiggyStagingCredentialDrillLane[];
  firstCallDrills: SwiggyStagingFirstCallDrill[];
  seededDataRequirements: SandboxSeededDataPlan[];
  promotionGates: Array<{
    id: string;
    label: string;
    status: SwiggyStagingCredentialDrillStatus;
    requirement: string;
    evidence: string[];
  }>;
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  handoffEmail: {
    to: string;
    subject: string;
    bodyPreview: string;
  };
  assertions: string[];
  externalGates: string[];
}

export type SwiggyLiveSignalCalibrationStatus = "ready" | "watch" | "staging_gate" | "privacy_gate";

export interface SwiggyLiveSignalCalibrationLane {
  id: string;
  label: string;
  server: SwiggyServer | "combined";
  status: SwiggyLiveSignalCalibrationStatus;
  officialTools: string[];
  localSignal: string;
  liveCalibration: string;
  privacyControl: string;
  evidenceLinks: string[];
}

export interface SwiggyLiveSignalServerCalibration {
  server: SwiggyServer;
  readOnlyTools: string[];
  seededDataNeed: string;
  driftThreshold: string;
  redactionRule: string;
  status: SwiggyLiveSignalCalibrationStatus;
}

export interface SwiggyLiveSignalCalibrationWave {
  id: string;
  sequence: number;
  label: string;
  status: SwiggyLiveSignalCalibrationStatus;
  tools: string[];
  exitCriteria: string[];
}

export interface SwiggyLiveSignalProbe {
  id: string;
  server: SwiggyServer | "combined";
  signal: string;
  sourceTools: string[];
  currentEvidence: string;
  stagingProof: string;
  failureStopRule: string;
  status: SwiggyLiveSignalCalibrationStatus;
}

export interface SwiggyLiveSignalCalibrationReport {
  generatedAt: string;
  mode: "mock" | "staging" | "production";
  score: number;
  officialSources: string[];
  totals: {
    lanes: number;
    readyLanes: number;
    probes: number;
    stagingWaves: number;
    privacyControls: number;
    externalGates: number;
  };
  signalLanes: SwiggyLiveSignalCalibrationLane[];
  serverCalibration: SwiggyLiveSignalServerCalibration[];
  stagingWaves: SwiggyLiveSignalCalibrationWave[];
  probes: SwiggyLiveSignalProbe[];
  privacyControls: Array<{ id: string; label: string; control: string; status: SwiggyLiveSignalCalibrationStatus }>;
  fallbackRules: Array<{ id: string; trigger: string; action: string; evidence: string }>;
  operatorRunbook: Array<{ sequence: number; label: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type EnterpriseDelegatedAuthStatus = "ready" | "watch" | "external_gate";

export interface EnterpriseDelegatedAuthStep {
  id: string;
  sequence: number;
  label: string;
  status: EnterpriseDelegatedAuthStatus;
  owner: "MealPilot" | "Swiggy" | "Operator" | "End user";
  swiggyRequirement: string;
  mealPilotControl: string;
  evidenceLinks: string[];
}

export interface EnterprisePlatformUseCase {
  id: string;
  label: string;
  surface: "voice" | "chat" | "app" | "enterprise_saas" | "lifestyle";
  servers: SwiggyServer[];
  userBase: string;
  peakQps: string;
  consentModel: string;
  status: EnterpriseDelegatedAuthStatus;
  evidenceLinks: string[];
}

export interface EnterpriseTokenRule {
  id: string;
  label: string;
  status: EnterpriseDelegatedAuthStatus;
  requirement: string;
  mealPilotControl: string;
}

export interface EnterpriseDelegatedAuthCenter {
  generatedAt: string;
  score: number;
  officialSources: string[];
  currentTrack: "developer_ready_enterprise_planned";
  principle: {
    swiggyRole: "Data Fiduciary";
    platformRole: "Data Processor";
    evidence: string;
  };
  flow: EnterpriseDelegatedAuthStep[];
  platformUseCases: EnterprisePlatformUseCase[];
  redirectUriStrategy: {
    exactMatchRequired: boolean;
    allowedExamples: string[];
    currentRedirectUri: string;
    currentStatus: EnterpriseDelegatedAuthStatus;
    evidence: string[];
  };
  tokenLifecycle: Array<{
    item: string;
    lifetime: string;
    rule: string;
    mealPilotControl: string;
    status: EnterpriseDelegatedAuthStatus;
  }>;
  storageRules: EnterpriseTokenRule[];
  scopes: Array<{ scope: string; grants: string; status: EnterpriseDelegatedAuthStatus; evidence: string }>;
  troubleshooting: Array<{ symptom: string; likelyCause: string; recovery: string; status: EnterpriseDelegatedAuthStatus }>;
  onboardingSequence: EnterpriseDelegatedAuthStep[];
  architectureReview: Array<{
    topic: string;
    swiggyQuestion: string;
    mealPilotEvidence: string;
    status: EnterpriseDelegatedAuthStatus;
    evidenceLinks: string[];
  }>;
  externalGates: string[];
  assertions: string[];
}

export type EnterprisePlatformStatus = "ready" | "watch" | "external_gate";

export interface EnterprisePlatformReadinessLane {
  id: string;
  label: string;
  owner: "MealPilot" | "Swiggy" | "Operator" | "Joint";
  status: EnterprisePlatformStatus;
  officialRequirement: string;
  mealPilotControl: string;
  evidenceLinks: string[];
}

export interface EnterpriseTenantControl {
  id: string;
  label: string;
  status: EnterprisePlatformStatus;
  tenantBoundary: string;
  control: string;
  evidenceLinks: string[];
}

export interface EnterpriseSupportLane {
  id: string;
  channel: string;
  useCase: string;
  sla: string;
  status: EnterprisePlatformStatus;
  evidenceLinks: string[];
}

export interface EnterprisePlatformCenterReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  currentTrack: "developer_ready_enterprise_planned";
  platformProfile: {
    mode: "mock" | "staging" | "production";
    tenantModel: string;
    expectedPeakQps: string;
    surfaces: string[];
    userGeography: string;
    productionGate: string;
  };
  totals: {
    readinessLanes: number;
    readyTenantControls: number;
    supportLanes: number;
    contractGates: number;
    auditExports: number;
    externalGates: number;
  };
  readinessLanes: EnterprisePlatformReadinessLane[];
  tenantControls: EnterpriseTenantControl[];
  supportLanes: EnterpriseSupportLane[];
  contractGates: Array<{
    id: string;
    label: string;
    requirement: string;
    mealPilotEvidence: string;
    status: EnterprisePlatformStatus;
  }>;
  auditExports: Array<{ id: string; label: string; contents: string[]; status: EnterprisePlatformStatus; evidenceLinks: string[] }>;
  operatorActions: Array<{ id: string; label: string; owner: "MealPilot" | "Swiggy" | "Operator" | "Joint"; status: EnterprisePlatformStatus; evidence: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyLaunchStoryStatus = "ready" | "watch" | "external_gate";

export interface SwiggyLaunchStoryBeat {
  id: string;
  label: string;
  officialSignal: string;
  mealPilotProof: string;
  status: SwiggyLaunchStoryStatus;
  evidenceLinks: string[];
}

export interface SwiggyBuildersLaunchStoryCenterReport {
  generatedAt: string;
  score: number;
  officialSources: string[];
  launchSignal: {
    blogToolSignal: string;
    currentDocsToolSnapshot: string;
    reconciliation: string;
    status: SwiggyLaunchStoryStatus;
  };
  totals: {
    storyBeats: number;
    journeySteps: number;
    showcaseAssets: number;
    ecosystemLanes: number;
    ctaPaths: number;
    externalGates: number;
  };
  storyBeats: SwiggyLaunchStoryBeat[];
  builderJourney: Array<{ id: string; sequence: number; label: string; proof: string; status: SwiggyLaunchStoryStatus; evidenceLinks: string[] }>;
  showcaseAssets: Array<{ id: string; label: string; format: "demo" | "proof" | "packet" | "story"; status: SwiggyLaunchStoryStatus; evidenceLinks: string[] }>;
  ecosystemLanes: Array<{ id: string; label: string; audience: "developers" | "startups" | "enterprise" | "skill_authors"; mealPilotPosition: string; status: SwiggyLaunchStoryStatus }>;
  ctaPaths: Array<{ id: string; label: string; officialCta: string; mealPilotAction: string; status: SwiggyLaunchStoryStatus; evidenceLinks: string[] }>;
  launchGuardrails: Array<{ id: string; rule: string; evidence: string; status: SwiggyLaunchStoryStatus }>;
  assertions: string[];
  externalGates: string[];
}

export type EvaluationStatus = "pass" | "watch" | "blocked";

export interface EvaluationCheck {
  id: string;
  label: string;
  status: EvaluationStatus;
  evidence: string;
}

export interface EvaluationScenario {
  id: string;
  persona: string;
  surface: AgentSurface;
  goal: string;
  request: UserPlanningRequest;
  score: number;
  status: EvaluationStatus;
  planTotal: number;
  budgetFit: MealPlan["budgetFit"];
  toolCalls: number;
  recommendationCount: number;
  checks: EvaluationCheck[];
  risks: string[];
}

export interface EvaluationLab {
  generatedAt: string;
  score: number;
  passCount: number;
  watchCount: number;
  blockedCount: number;
  scenarios: EvaluationScenario[];
  aggregateChecks: EvaluationCheck[];
}

export interface McpGatewayCheck {
  id: string;
  label: string;
  status: "ready" | "watch" | "blocked";
  evidence: string;
}

export interface McpGatewayStatus {
  generatedAt: string;
  mode: "mock" | "staging" | "production";
  activeTransport: "local_mock" | "swiggy_streamable_http";
  readinessScore: number;
  baseUrl: string;
  requestedServers: Array<{ server: SwiggyServer; endpoint: string; status: "mocked" | "routable" | "blocked" }>;
  auth: {
    clientIdConfigured: boolean;
    tokenSource: "runtime" | "environment" | "none";
    tokenPreview?: string;
    expiresAt?: string;
    scope: string;
  };
  checks: McpGatewayCheck[];
  cutoverPlan: string[];
  fallbackPlan: string[];
  canaryPlan: string[];
}

export type SwiggyStagingCutoverStatus = "ready" | "watch" | "blocked" | "external_gate";

export interface SwiggyStagingCutoverProbe {
  id: string;
  server: SwiggyServer;
  endpoint: string;
  firstTool: string;
  transport: "local_mock" | "swiggy_streamable_http";
  status: SwiggyStagingCutoverStatus;
  dryRunRequest: {
    jsonrpc: "2.0";
    id: string;
    method: "tools/call";
    params: {
      name: string;
      arguments: Record<string, unknown>;
    };
  };
  expectedSuccessShape: string;
  promotionEvidence: string[];
  failureBranches: Array<{
    status: "401" | "429" | "5xx" | "network" | "jsonrpc_error";
    action: string;
  }>;
}

export interface SwiggyStagingCutoverCheck {
  id: string;
  label: string;
  status: SwiggyStagingCutoverStatus;
  requirement: string;
  evidence: string;
  nextAction: string;
}

export interface SwiggyStagingCutoverRehearsal {
  generatedAt: string;
  score: number;
  officialSources: string[];
  mode: "mock" | "staging" | "production";
  activeTransport: McpGatewayStatus["activeTransport"];
  credentialState: {
    clientIdConfigured: boolean;
    tokenSource: McpGatewayStatus["auth"]["tokenSource"];
    tokenExpiresAt?: string;
    scope: string;
    redirectUri: string;
  };
  totalServers: number;
  routableServers: number;
  blockedServers: number;
  dryRunCalls: number;
  probes: SwiggyStagingCutoverProbe[];
  oauthChecks: SwiggyStagingCutoverCheck[];
  transportChecks: SwiggyStagingCutoverCheck[];
  promotionChecks: SwiggyStagingCutoverCheck[];
  supportPacket: {
    to: string;
    subject: string;
    requiredFields: string[];
    bodyPreview: string;
  };
  commands: Array<{ id: string; command: string; proves: string }>;
  assertions: string[];
  externalGates: string[];
}

export type SwiggyAuthEventStatus =
  | "not_started"
  | "authorization_url_created"
  | "callback_mocked"
  | "callback_exchanged"
  | "callback_failed";

export interface SwiggyAuthLatestEvent {
  status: SwiggyAuthEventStatus;
  label: string;
  at?: string;
  statePreview?: string;
  tokenExchange?: "mocked" | "exchanged";
  tokenSource: "runtime" | "environment" | "none";
  expiresAt?: string;
  scope?: string;
  error?: string;
}

export interface SwiggyAuthStatusReport {
  generatedAt: string;
  mode: "mock" | "staging" | "production";
  endpoints: {
    authorize: string;
    token: string;
    logout: string;
    authorizationServerMetadata: string;
    protectedResourceMetadata: string;
  };
  redirectUri: string;
  scope: string;
  clientIdConfigured: boolean;
  pendingVerifierCount: number;
  latestEvent: SwiggyAuthLatestEvent;
  gatewayAuth: McpGatewayStatus["auth"];
  callbackChecklist: Array<{ id: string; label: string; status: "ready" | "watch" | "blocked"; evidence: string }>;
  storagePolicy: string[];
  nextActions: string[];
}

export type SwiggyAuthLifecycleStatus = "ready" | "watch" | "external_gate";

export interface SwiggyAuthLifecycleLane {
  id: string;
  label: string;
  officialContract: string;
  mealPilotControl: string;
  status: SwiggyAuthLifecycleStatus;
  evidenceLinks: string[];
}

export interface SwiggyAuthRecoveryScenario {
  id: string;
  trigger: "401" | "419" | "403" | "code_expired" | "refresh_requested" | "logout";
  expectedDecision: string;
  userVisibleAction: string;
  status: SwiggyAuthLifecycleStatus;
}

export interface SwiggyAuthLifecycleCenterReport {
  generatedAt: string;
  score: number;
  mode: "mock" | "staging" | "production";
  officialSources: string[];
  tokenLifetimes: {
    authorizationCodeSeconds: number;
    accessTokenDays: number;
    idleSessionDays: number;
    proactiveReauthWindowSeconds: number;
    refreshTokenAvailableInV1: boolean;
  };
  currentState: {
    tokenSource: "runtime" | "environment" | "none";
    latestEvent: SwiggyAuthLatestEvent;
    pendingVerifierCount: number;
    clientIdConfigured: boolean;
    redirectUri: string;
    scope: string;
  };
  totals: {
    lanes: number;
    recoveryScenarios: number;
    readyStorageRules: number;
    troubleshootingCases: number;
    externalGates: number;
  };
  lanes: SwiggyAuthLifecycleLane[];
  recoveryScenarios: SwiggyAuthRecoveryScenario[];
  storageRules: Array<{ id: string; rule: string; status: SwiggyAuthLifecycleStatus; evidence: string }>;
  troubleshooting: Array<{ symptom: string; likelyCause: string; recovery: string; status: SwiggyAuthLifecycleStatus }>;
  operatorActions: Array<{
    id: string;
    label: string;
    owner: "MealPilot" | "Operator" | "Swiggy";
    status: SwiggyAuthLifecycleStatus;
    evidence: string;
  }>;
  assertions: string[];
  externalGates: string[];
}

export interface MealPlan {
  id: string;
  summary: string;
  total: number;
  budgetLimit: number;
  budgetFit: "under_budget" | "at_risk" | "over_budget";
  callCount: number;
  healthScore: number;
  recommendations: Recommendation[];
  auditTrail: ToolCallEvent[];
  insights: string[];
  variants: PlanVariant[];
  tracking: TrackingEvent[];
  profileSnapshot?: UserProfile;
}

export interface SavedLocation {
  id: string;
  label: "Home" | "Office";
  displayText: string;
}

export interface FoodRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distanceKm: number;
  availabilityStatus: "OPEN" | "CLOSED";
}

export interface GroceryBasket {
  title: string;
  merchant: string;
  items: PlanItem[];
}

export interface DineoutSlot {
  restaurantName: string;
  area: string;
  cuisine: string;
  rating: number;
  time: string;
  guests: number;
  estimatedSpendPerPerson: number;
}

export interface SwiggyPlanningClient {
  getSavedLocations(): Promise<SavedLocation[]>;
  searchFoodRestaurants(request: UserPlanningRequest, addressId: string): Promise<FoodRestaurant[]>;
  buildFoodCart(request: UserPlanningRequest, restaurant: FoodRestaurant): Promise<Recommendation>;
  buildInstamartBasket(request: UserPlanningRequest): Promise<Recommendation>;
  findDineoutSlot(request: UserPlanningRequest): Promise<Recommendation>;
}
