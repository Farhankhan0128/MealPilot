import {
  Activity,
  Bot,
  CalendarCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  Gauge,
  GitBranch,
  Loader2,
  LockKeyhole,
  MapPin,
  Play,
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
  deletePrivacyData,
  exportPrivacyData,
  fetchBuilderPackage,
  fetchBuilderPackageMarkdown,
  fetchGroupPlan,
  fetchHealth,
  fetchOpsStatus,
  fetchPantry,
  fetchProfile,
  fetchTracking,
  removeRecommendationItem,
  schedulePlan,
  startSwiggyAuth,
  substituteRecommendationItem,
  updateProfile,
  type BuilderPackageResponse,
  type HealthResponse,
} from "./api/mealpilotApi";
import { defaultUserProfile, normalizeListInput } from "./domain/profile";
import { buildConfirmationMessage } from "./domain/safety";
import type {
  GroupPlan,
  MealPlan,
  OpsStatus,
  PantryItem,
  Recommendation,
  Reminder,
  RestockSuggestion,
  SwiggyServer,
  ToolCallEvent,
  UserPlanningRequest,
  UserProfile,
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
    const [pantryResponse, groupResponse, opsResponse] = await Promise.all([
      fetchPantry(),
      fetchGroupPlan(),
      fetchOpsStatus(),
    ]);
    setPantry(pantryResponse.pantry);
    setRestock(pantryResponse.suggestions);
    setGroupPlan(groupResponse.groupPlan);
    setOpsStatus(opsResponse.status);
  }

  async function confirmEverything() {
    if (!plan) return;
    setIsConfirming(true);
    setError(null);
    try {
      const response = await confirmAllRecommendations(plan.id);
      setPlan(response.plan);
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
    const opsResponse = await fetchOpsStatus();
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

  async function clearPrivacyData() {
    await deletePrivacyData();
    setPlan(null);
    setReminders([]);
    setExportText("Local profile, plans, pantry, group plan, and reminders were deleted.");
    await loadAdvancedWorkflows();
  }

  async function substituteItem(recommendationId: string, alternativeId: string) {
    if (!plan) return;
    const response = await substituteRecommendationItem(plan.id, recommendationId, alternativeId);
    setPlan(response.plan);
  }

  async function removeItem(recommendationId: string, itemId: string) {
    if (!plan) return;
    const response = await removeRecommendationItem(plan.id, recommendationId, itemId);
    setPlan(response.plan);
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

export default App;
