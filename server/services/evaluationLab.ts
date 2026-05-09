import { createMealPlan } from "../../src/domain/planner.js";
import type {
  AgentSurface,
  EvaluationCheck,
  EvaluationLab,
  EvaluationScenario,
  EvaluationStatus,
  MealPlan,
  SwiggyServer,
  UserPlanningRequest,
  UserProfile,
} from "../../src/domain/types.js";
import { buildAgentSurfaceResponse } from "./advancedWorkflows.js";
import { buildCartPreflightReport } from "./demoStudio.js";

const scenarioDefinitions: Array<{
  id: string;
  persona: string;
  surface: AgentSurface;
  goal: string;
  request: UserPlanningRequest;
}> = [
  {
    id: "bengaluru_protein_private_pilot",
    persona: "Busy Bengaluru vegetarian professional",
    surface: "chat",
    goal: "High-protein weekly planning with lunch, groceries, and a Saturday table.",
    request: {
      prompt:
        "Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, dinner groceries, and a Dineout option for Saturday.",
      city: "Bengaluru",
      budget: 2000,
      diet: "high-protein vegetarian",
      guests: 4,
      day: "saturday",
    },
  },
  {
    id: "delhi_family_allergy_budget",
    persona: "Delhi NCR family planner with allergy constraints",
    surface: "chat",
    goal: "Family dinner plan that remains explicit about confirmation and substitutions.",
    request: {
      prompt:
        "Plan vegetarian dinner for my family in Delhi NCR, keep the basket practical, avoid surprise bookings, and include a Sunday Dineout backup.",
      city: "Delhi NCR",
      budget: 2400,
      diet: "vegetarian",
      guests: 5,
      day: "sunday",
    },
  },
  {
    id: "mumbai_lean_budget_voice",
    persona: "Mumbai office worker using a voice assistant",
    surface: "voice",
    goal: "Lean-budget plan that keeps voice output short and does not expose internal IDs.",
    request: {
      prompt:
        "I am at work in Mumbai. Build a vegetarian budget reset with lunch, groceries, and a Friday table option, but keep it voice friendly.",
      city: "Mumbai",
      budget: 1700,
      diet: "vegetarian",
      guests: 2,
      day: "friday",
    },
  },
  {
    id: "same_day_recovery_today",
    persona: "Same-day planner checking multi-turn cart safety",
    surface: "chat",
    goal: "Today-only plan that refreshes cart truth before any commercial action.",
    request: {
      prompt:
        "Plan food now, groceries for tonight, and a same-day Dineout option. I may change my mind before ordering.",
      city: "Bengaluru",
      budget: 2100,
      diet: "balanced",
      guests: 3,
      day: "today",
    },
  },
];

function scenarioStatus(checks: EvaluationCheck[]): EvaluationStatus {
  if (checks.some((check) => check.status === "blocked")) return "blocked";
  if (checks.some((check) => check.status === "watch")) return "watch";
  return "pass";
}

function scoreForChecks(checks: EvaluationCheck[]) {
  const value = checks.reduce((sum, check) => {
    if (check.status === "pass") return sum + 1;
    if (check.status === "watch") return sum + 0.72;
    return sum;
  }, 0);

  return Math.round((value / checks.length) * 100);
}

function hasAllServers(plan: MealPlan) {
  const servers = new Set<SwiggyServer>(plan.recommendations.map((recommendation) => recommendation.server));
  return ["food", "instamart", "dineout"].every((server) => servers.has(server as SwiggyServer));
}

function checksForPlan(plan: MealPlan, surface: AgentSurface): EvaluationCheck[] {
  const preflight = buildCartPreflightReport(plan);
  const response = buildAgentSurfaceResponse(plan, surface);
  const commercialActionsLocked = plan.recommendations.every((recommendation) => recommendation.status === "prepared");
  const hasNoRawPii = plan.auditTrail.every((event) => !/(token|payment|full address|phone)/i.test(event.detail));
  const budgetStatus: EvaluationStatus =
    plan.budgetFit === "under_budget" ? "pass" : plan.budgetFit === "at_risk" ? "watch" : "blocked";
  const voiceSafe =
    surface === "chat" ||
    (response.cards.length <= 3 &&
      response.constraints.some((constraint) => /No internal IDs/i.test(constraint)) &&
      response.confirmationPrompt.length < 180);

  return [
    {
      id: "three_server_composition",
      label: "Food + Instamart + Dineout composition",
      status: hasAllServers(plan) ? "pass" : "blocked",
      evidence: `${plan.recommendations.length} recommendations generated across ${[
        ...new Set(plan.recommendations.map((item) => item.server)),
      ].join(", ")}.`,
    },
    {
      id: "budget_fit",
      label: "Budget fit",
      status: budgetStatus,
      evidence: `Plan total Rs ${plan.total.toLocaleString("en-IN")} against Rs ${plan.budgetLimit.toLocaleString("en-IN")} budget.`,
    },
    {
      id: "confirmation_lock",
      label: "Commercial actions locked",
      status: commercialActionsLocked ? "pass" : "blocked",
      evidence: commercialActionsLocked
        ? "All food order, grocery checkout, and table booking actions remain prepared until explicit confirmation."
        : "One or more commercial actions was already confirmed during evaluation.",
    },
    {
      id: "preflight",
      label: "Preflight safety",
      status: preflight.overall === "blocked" ? "blocked" : preflight.overall === "needs_review" ? "watch" : "pass",
      evidence: `${preflight.checks.length} checks, ${preflight.offers.length} offer opportunities, overall ${preflight.overall}.`,
    },
    {
      id: "surface_contract",
      label: `${surface} response contract`,
      status: voiceSafe ? "pass" : "blocked",
      evidence:
        surface === "voice"
          ? `${response.cards.length} spoken card(s); voice constraints prevent IDs and long lists.`
          : `${response.cards.length} rich card(s) with visible totals and confirmation prompt.`,
    },
    {
      id: "pii_minimization",
      label: "No raw sensitive data in audit detail",
      status: hasNoRawPii ? "pass" : "blocked",
      evidence: hasNoRawPii
        ? "Audit detail remains redacted to labels, tool names, session ids, and durations."
        : "Audit detail included a sensitive token, payment, address, or phone marker.",
    },
  ];
}

function risksForScenario(checks: EvaluationCheck[]) {
  return checks
    .filter((check) => check.status !== "pass")
    .map((check) => `${check.label}: ${check.evidence}`);
}

function aggregateChecks(scenarios: EvaluationScenario[], profile: UserProfile): EvaluationCheck[] {
  const allChecks = scenarios.flatMap((scenario) => scenario.checks);
  const blocked = allChecks.filter((check) => check.status === "blocked").length;
  const watched = allChecks.filter((check) => check.status === "watch").length;
  const passRate = Math.round(((allChecks.length - blocked - watched) / allChecks.length) * 100);
  const voiceScenarios = scenarios.filter((scenario) => scenario.surface === "voice");

  return [
    {
      id: "scenario_breadth",
      label: "Persona and city breadth",
      status: scenarios.length >= 4 ? "pass" : "watch",
      evidence: `${scenarios.length} scenarios cover ${[...new Set(scenarios.map((scenario) => scenario.request.city))].join(", ")}.`,
    },
    {
      id: "safety_gate_rate",
      label: "Safety gate pass rate",
      status: blocked === 0 ? (watched <= 2 ? "pass" : "watch") : "blocked",
      evidence: `${passRate}% checks passed outright; ${watched} watch item(s), ${blocked} blocked item(s).`,
    },
    {
      id: "voice_contract",
      label: "Voice surface coverage",
      status: voiceScenarios.length > 0 ? "pass" : "watch",
      evidence: `${voiceScenarios.length} voice scenario(s) verify short spoken cards and hidden internal IDs.`,
    },
    {
      id: "profile_consent",
      label: "Profile consent baseline",
      status: profile.consentToStorePreferences ? "pass" : "watch",
      evidence: profile.consentToStorePreferences
        ? "Evaluation ran with stored preference consent enabled."
        : "Evaluation still passes without durable preference consent; production should prompt before persistence.",
    },
  ];
}

export async function buildEvaluationLab(profile: UserProfile): Promise<EvaluationLab> {
  const scenarios = await Promise.all(
    scenarioDefinitions.map(async (definition): Promise<EvaluationScenario> => {
      const plan = await createMealPlan(definition.request, undefined, profile);
      const checks = checksForPlan(plan, definition.surface);
      const status = scenarioStatus(checks);

      return {
        id: definition.id,
        persona: definition.persona,
        surface: definition.surface,
        goal: definition.goal,
        request: definition.request,
        score: scoreForChecks(checks),
        status,
        planTotal: plan.total,
        budgetFit: plan.budgetFit,
        toolCalls: plan.callCount,
        recommendationCount: plan.recommendations.length,
        checks,
        risks: risksForScenario(checks),
      };
    }),
  );
  const aggregates = aggregateChecks(scenarios, profile);
  const scenarioScore = Math.round(scenarios.reduce((sum, scenario) => sum + scenario.score, 0) / scenarios.length);
  const aggregateScore = scoreForChecks(aggregates);
  const passCount = scenarios.filter((scenario) => scenario.status === "pass").length;
  const watchCount = scenarios.filter((scenario) => scenario.status === "watch").length;
  const blockedCount = scenarios.filter((scenario) => scenario.status === "blocked").length;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round(scenarioScore * 0.75 + aggregateScore * 0.25),
    passCount,
    watchCount,
    blockedCount,
    scenarios,
    aggregateChecks: aggregates,
  };
}
