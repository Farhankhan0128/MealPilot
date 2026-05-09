import {
  Activity,
  Bot,
  CalendarCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  Gauge,
  GitBranch,
  Loader2,
  LockKeyhole,
  MapPin,
  Play,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { buildConfirmationMessage } from "./domain/safety";
import { confirmRecommendation, createMealPlan } from "./domain/planner";
import type { MealPlan, Recommendation, SwiggyServer, ToolCallEvent, UserPlanningRequest } from "./domain/types";

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
    try {
      const nextPlan = await createMealPlan(nextRequest);
      setPlan(nextPlan);
    } finally {
      setIsPlanning(false);
    }
  }

  function updateRequest<K extends keyof UserPlanningRequest>(key: K, value: UserPlanningRequest[K]) {
    setRequest((current) => ({ ...current, [key]: value }));
  }

  function applyScenario(nextRequest: UserPlanningRequest) {
    setRequest(nextRequest);
    void buildPlan(nextRequest);
  }

  function confirmSelected() {
    if (!plan || !selectedRecommendation) return;
    setPlan(confirmRecommendation(plan, selectedRecommendation.id));
    setSelectedRecommendation(null);
  }

  useEffect(() => {
    void buildPlan(initialRequest);
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
            <strong>Local stub</strong>
            <span>Staging-ready adapter</span>
          </div>
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
            <Metric icon={<Activity aria-hidden="true" />} label="Health score" value={`${plan?.healthScore ?? "--"}`} />
          </div>
        </section>

        {plan ? (
          <>
            <section className="insight-strip" aria-label="Planner summary">
              <div>
                <MapPin aria-hidden="true" />
                <span>{plan.summary}</span>
              </div>
              <strong data-fit={plan.budgetFit}>{plan.budgetFit.replace("_", " ")}</strong>
            </section>

            <section className="recommendations" aria-label="Swiggy recommendations">
              {plan.recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onConfirm={() => setSelectedRecommendation(recommendation)}
                />
              ))}
            </section>

            <section className="lower-grid">
              <InsightsPanel insights={plan.insights} />
              <AuditPanel events={plan.auditTrail} />
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
              <button type="button" className="icon-button primary" onClick={confirmSelected}>
                <ShieldCheck aria-hidden="true" />
                <span>Confirm action</span>
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
}: {
  recommendation: Recommendation;
  onConfirm: () => void;
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
            <strong>{item.price === 0 ? "Included" : formatMoney(item.price)}</strong>
          </li>
        ))}
      </ul>

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

export default App;
