import {
  Activity,
  Bot,
  CalendarCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileWarning,
  Gauge,
  GitBranch,
  Loader2,
  LockKeyhole,
  MapPin,
  MessageSquare,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  buildServerPlan,
  completeSwiggyAuth,
  addGroupMember,
  confirmAllRecommendations,
  confirmServerRecommendation,
  createSupportReport,
  deletePrivacyData,
  exportPrivacyData,
  fetchAgentSurface,
  fetchBuilderPackage,
  fetchBuilderPackageMarkdown,
  fetchCartPreflight,
  fetchComplianceEvidence,
  fetchDemoStudio,
  fetchEvaluationLab,
  fetchGoLive,
  fetchGroupPlan,
  fetchHealth,
  fetchMcpGateway,
  fetchMcpCatalog,
  fetchMcpReplay,
  fetchOpsStatus,
  fetchPantry,
  fetchProfile,
  fetchRateLimitPlan,
  fetchReviewerProof,
  fetchResilience,
  fetchSubmissionPackage,
  fetchTracking,
  fetchVersionMonitor,
  fetchWidgets,
  removeRecommendationItem,
  schedulePlan,
  startSwiggyAuth,
  substituteRecommendationItem,
  updateProfile,
  type BuilderPackageResponse,
  type GoLiveResponse,
  type HealthResponse,
  type McpCatalogResponse,
} from "./api/mealpilotApi";
import { defaultUserProfile, normalizeListInput } from "./domain/profile";
import { buildConfirmationMessage } from "./domain/safety";
import type {
  AgentSurface,
  AgentSurfaceResponse,
  CartPreflightReport,
  ComplianceEvidence,
  DemoStudioStep,
  EvaluationLab,
  GoLiveCheck,
  GroupPlan,
  IncidentReport,
  MealPlan,
  McpGatewayStatus,
  McpReplayStep,
  ObservabilityMetric,
  OpsStatus,
  PantryItem,
  RateLimitPlan,
  Recommendation,
  Reminder,
  ResilienceDrill,
  ResilienceRunbook,
  ReviewerProof,
  RestockSuggestion,
  SubmissionPackage,
  SwiggyWidget,
  SwiggyServer,
  ToolCallEvent,
  UserPlanningRequest,
  UserProfile,
  VersionMonitor,
} from "./domain/types";

const initialRequest: UserPlanningRequest = {
  prompt:
    "Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, dinner groceries for tonight, and a Dineout option for Saturday evening.",
  city: "Bengaluru",
  budget: 2000,
  diet: "high-protein vegetarian",
  guests: 4,
  day: "saturday",
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
  const [mcpCatalog, setMcpCatalog] = useState<McpCatalogResponse | null>(null);
  const [surfaceMode, setSurfaceMode] = useState<AgentSurface>("chat");
  const [agentSurface, setAgentSurface] = useState<AgentSurfaceResponse | null>(null);
  const [goLiveChecks, setGoLiveChecks] = useState<GoLiveCheck[]>([]);
  const [observabilityMetrics, setObservabilityMetrics] = useState<ObservabilityMetric[]>([]);
  const [rollout, setRollout] = useState<GoLiveResponse["rollout"] | null>(null);
  const [incidentReport, setIncidentReport] = useState<IncidentReport | null>(null);
  const [preflight, setPreflight] = useState<CartPreflightReport | null>(null);
  const [mcpReplay, setMcpReplay] = useState<McpReplayStep[]>([]);
  const [demoSteps, setDemoSteps] = useState<DemoStudioStep[]>([]);
  const [evaluationLab, setEvaluationLab] = useState<EvaluationLab | null>(null);
  const [submissionPackage, setSubmissionPackage] = useState<SubmissionPackage | null>(null);
  const [widgets, setWidgets] = useState<SwiggyWidget[]>([]);
  const [widgetBridge, setWidgetBridge] = useState<{ origin: string; sandbox: string; verifyOrigin: boolean } | null>(
    null,
  );
  const [rateLimit, setRateLimit] = useState<RateLimitPlan | null>(null);
  const [versionMonitor, setVersionMonitor] = useState<VersionMonitor | null>(null);
  const [complianceEvidence, setComplianceEvidence] = useState<ComplianceEvidence | null>(null);
  const [reviewerProof, setReviewerProof] = useState<ReviewerProof | null>(null);
  const [resilienceDrills, setResilienceDrills] = useState<ResilienceDrill[]>([]);
  const [resilienceRunbook, setResilienceRunbook] = useState<ResilienceRunbook | null>(null);
  const [exportText, setExportText] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    try {
      const response = await buildServerPlan(nextRequest);
      setPlan(response.plan);
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
    try {
      const response = await updateProfile(nextProfile);
      setProfile(response.profile);
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

  async function loadAdvancedWorkflows() {
    const [
      pantryResponse,
      groupResponse,
      opsResponse,
      gatewayResponse,
      catalogResponse,
      goLiveResponse,
      demoStudioResponse,
      evaluationResponse,
      submissionResponse,
      rateLimitResponse,
      versionResponse,
      complianceResponse,
      proofResponse,
      resilienceResponse,
    ] = await Promise.all([
      fetchPantry(),
      fetchGroupPlan(),
      fetchOpsStatus(),
      fetchMcpGateway(),
      fetchMcpCatalog(),
      fetchGoLive(),
      fetchDemoStudio(),
      fetchEvaluationLab(),
      fetchSubmissionPackage(),
      fetchRateLimitPlan(),
      fetchVersionMonitor(),
      fetchComplianceEvidence(),
      fetchReviewerProof(),
      fetchResilience(),
    ]);
    setPantry(pantryResponse.pantry);
    setRestock(pantryResponse.suggestions);
    setGroupPlan(groupResponse.groupPlan);
    setOpsStatus(opsResponse.status);
    setMcpGateway(gatewayResponse.gateway);
    setMcpCatalog(catalogResponse);
    setGoLiveChecks(goLiveResponse.checks);
    setObservabilityMetrics(goLiveResponse.metrics);
    setRollout(goLiveResponse.rollout);
    setDemoSteps(demoStudioResponse.steps);
    setEvaluationLab(evaluationResponse.evaluation);
    setSubmissionPackage(submissionResponse.package);
    setRateLimit(rateLimitResponse.rateLimit);
    setVersionMonitor(versionResponse.version);
    setComplianceEvidence(complianceResponse.compliance);
    setReviewerProof(proofResponse.proof);
    setResilienceDrills(resilienceResponse.drills);
    setResilienceRunbook(resilienceResponse.runbook);
  }

  async function refreshLaunchCenter() {
    const [
      catalogResponse,
      gatewayResponse,
      goLiveResponse,
      demoStudioResponse,
      evaluationResponse,
      submissionResponse,
      rateLimitResponse,
      versionResponse,
      complianceResponse,
      proofResponse,
      resilienceResponse,
    ] = await Promise.all([
      fetchMcpCatalog(),
      fetchMcpGateway(),
      fetchGoLive(),
      fetchDemoStudio(),
      fetchEvaluationLab(),
      fetchSubmissionPackage(),
      fetchRateLimitPlan(),
      fetchVersionMonitor(),
      fetchComplianceEvidence(),
      fetchReviewerProof(),
      fetchResilience(),
    ]);
    setMcpCatalog(catalogResponse);
    setMcpGateway(gatewayResponse.gateway);
    setGoLiveChecks(goLiveResponse.checks);
    setObservabilityMetrics(goLiveResponse.metrics);
    setRollout(goLiveResponse.rollout);
    setDemoSteps(demoStudioResponse.steps);
    setEvaluationLab(evaluationResponse.evaluation);
    setSubmissionPackage(submissionResponse.package);
    setRateLimit(rateLimitResponse.rateLimit);
    setVersionMonitor(versionResponse.version);
    setComplianceEvidence(complianceResponse.compliance);
    setReviewerProof(proofResponse.proof);
    setResilienceDrills(resilienceResponse.drills);
    setResilienceRunbook(resilienceResponse.runbook);
  }

  async function loadPlanDiagnostics(sessionId: string) {
    const [preflightResponse, replayResponse, widgetsResponse] = await Promise.all([
      fetchCartPreflight(sessionId),
      fetchMcpReplay(sessionId),
      fetchWidgets(sessionId),
    ]);
    setPreflight(preflightResponse.preflight);
    setMcpReplay(replayResponse.replay);
    setWidgets(widgetsResponse.widgets);
    setWidgetBridge(widgetsResponse.bridge);
  }

  async function confirmEverything() {
    if (!plan) return;
    setIsConfirming(true);
    setError(null);
    try {
      const response = await confirmAllRecommendations(plan.id);
      setPlan(response.plan);
      await Promise.all([refreshLaunchCenter(), loadPlanDiagnostics(response.plan.id)]);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Unable to confirm all actions.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function refreshTracking() {
    if (!plan) return;
    setError(null);
    try {
      const response = await fetchTracking(plan.id);
      setPlan(response.plan);
      await Promise.all([refreshLaunchCenter(), loadPlanDiagnostics(response.plan.id)]);
    } catch (trackingError) {
      setError(trackingError instanceof Error ? trackingError.message : "Unable to refresh tracking.");
    }
  }

  async function beginOAuth() {
    setError(null);
    try {
      const response = await startSwiggyAuth();
      setAuthUrl(response.authorizationUrl);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to start Swiggy OAuth.");
    }
  }

  async function scheduleCurrentPlan() {
    if (!plan) return;
    const response = await schedulePlan(plan.id);
    setReminders(response.reminders);
    const [opsResponse] = await Promise.all([fetchOpsStatus(), refreshLaunchCenter()]);
    setOpsStatus(opsResponse.status);
  }

  async function addDemoGroupMember() {
    const response = await addGroupMember({
      id: `member_${Date.now()}`,
      name: "Asha",
      diet: "vegetarian",
      allergies: ["none"],
      budget: 550,
    });
    setGroupPlan(response.groupPlan);
  }

  async function exportBuilderMarkdown() {
    setExportText(await fetchBuilderPackageMarkdown());
  }

  async function exportPrivacy() {
    const response = await exportPrivacyData();
    setExportText(JSON.stringify(response, null, 2));
  }

  async function createIncidentReport() {
    const response = await createSupportReport(plan?.id);
    setIncidentReport(response.report);
  }

  async function clearPrivacyData() {
    await deletePrivacyData();
    setPlan(null);
    setReminders([]);
    setPreflight(null);
    setMcpReplay([]);
    setWidgets([]);
    setWidgetBridge(null);
    setExportText("Local profile, plans, pantry, group plan, and reminders were deleted.");
    await loadAdvancedWorkflows();
  }

  async function substituteItem(recommendationId: string, alternativeId: string) {
    if (!plan) return;
    const response = await substituteRecommendationItem(plan.id, recommendationId, alternativeId);
    setPlan(response.plan);
    await loadPlanDiagnostics(response.plan.id);
  }

  async function removeItem(recommendationId: string, itemId: string) {
    if (!plan) return;
    const response = await removeRecommendationItem(plan.id, recommendationId, itemId);
    setPlan(response.plan);
    await loadPlanDiagnostics(response.plan.id);
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
      await Promise.all([refreshLaunchCenter(), loadPlanDiagnostics(response.plan.id)]);
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
    void loadAdvancedWorkflows().catch(() => undefined);

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (window.location.pathname === "/auth/swiggy/callback" && code && state) {
      void completeSwiggyAuth(code, state)
        .then((response) => setAuthUrl(`OAuth callback ${response.tokenExchange}`))
        .catch((authError: unknown) =>
          setError(authError instanceof Error ? authError.message : "Unable to complete OAuth callback."),
        );
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

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="MealPilot workspace">
        <div className="brand-block">
          <div className="brand-mark">
            <Sparkles aria-hidden="true" />
          </div>
          <div>
            <p>MealPilot</p>
            <span>Swiggy MCP command center</span>
          </div>
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
            Start Swiggy OAuth
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

        <section className="planner-grid">
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

            <section className="recommendations" aria-label="Swiggy recommendations">
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

            <section className="lower-grid">
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
              <LaunchCenterPanel
                catalog={mcpCatalog}
                gateway={mcpGateway}
                surfaceMode={surfaceMode}
                agentSurface={agentSurface}
                goLiveChecks={goLiveChecks}
                observabilityMetrics={observabilityMetrics}
                rollout={rollout}
                incidentReport={incidentReport}
                onSurfaceModeChange={setSurfaceMode}
                onCreateReport={() => void createIncidentReport()}
              />
              <DemoStudioPanel
                preflight={preflight}
                replay={mcpReplay}
                steps={demoSteps}
                submissionPackage={submissionPackage}
              />
              <ProductionEvidencePanel
                widgets={widgets}
                widgetBridge={widgetBridge}
                rateLimit={rateLimit}
                versionMonitor={versionMonitor}
                complianceEvidence={complianceEvidence}
                reviewerProof={reviewerProof}
                resilienceDrills={resilienceDrills}
                resilienceRunbook={resilienceRunbook}
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
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="modal-icon">{serverIcon(selectedRecommendation.server)}</div>
            <h2 id="confirm-title">Confirm {serverLabel(selectedRecommendation.server)}</h2>
            <p>{buildConfirmationMessage(selectedRecommendation)}</p>
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
          disabled={recommendation.status === "confirmed"}
        >
          <ShieldCheck aria-hidden="true" />
          <span>{recommendation.status === "confirmed" ? "Confirmed" : "Confirm"}</span>
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

function LaunchCenterPanel({
  catalog,
  gateway,
  surfaceMode,
  agentSurface,
  goLiveChecks,
  observabilityMetrics,
  rollout,
  incidentReport,
  onSurfaceModeChange,
  onCreateReport,
}: {
  catalog: McpCatalogResponse | null;
  gateway: McpGatewayStatus | null;
  surfaceMode: AgentSurface;
  agentSurface: AgentSurfaceResponse | null;
  goLiveChecks: GoLiveCheck[];
  observabilityMetrics: ObservabilityMetric[];
  rollout: GoLiveResponse["rollout"] | null;
  incidentReport: IncidentReport | null;
  onSurfaceModeChange: (surface: AgentSurface) => void;
  onCreateReport: () => void;
}) {
  return (
    <section className="analysis-panel launch-panel">
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
  steps,
  submissionPackage,
}: {
  preflight: CartPreflightReport | null;
  replay: McpReplayStep[];
  steps: DemoStudioStep[];
  submissionPackage: SubmissionPackage | null;
}) {
  const readyFields = submissionPackage?.fields.filter((field) => field.status === "ready").length ?? 0;
  const totalFields = submissionPackage?.fields.length ?? 0;

  return (
    <section className="analysis-panel demo-studio-panel">
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
      </div>
    </section>
  );
}

function ProductionEvidencePanel({
  widgets,
  widgetBridge,
  rateLimit,
  versionMonitor,
  complianceEvidence,
  reviewerProof,
  resilienceDrills,
  resilienceRunbook,
  evaluationLab,
}: {
  widgets: SwiggyWidget[];
  widgetBridge: { origin: string; sandbox: string; verifyOrigin: boolean } | null;
  rateLimit: RateLimitPlan | null;
  versionMonitor: VersionMonitor | null;
  complianceEvidence: ComplianceEvidence | null;
  reviewerProof: ReviewerProof | null;
  resilienceDrills: ResilienceDrill[];
  resilienceRunbook: ResilienceRunbook | null;
  evaluationLab: EvaluationLab | null;
}) {
  const passedDrills = resilienceDrills.filter((drill) => drill.status === "pass").length;

  return (
    <section className="analysis-panel production-evidence-panel">
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
