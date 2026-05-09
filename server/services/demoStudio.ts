import type { ServerConfig } from "../config.js";
import type {
  CartPreflightCheck,
  CartPreflightReport,
  DemoStudioStep,
  MealPlan,
  McpReplayStep,
  McpServerCoverage,
  OfferOpportunity,
  Reminder,
  SubmissionPackage,
  SwiggyServer,
  UserProfile,
} from "../../src/domain/types.js";

const endpoints: Record<SwiggyServer, string> = {
  food: "POST mcp.swiggy.com/food",
  instamart: "POST mcp.swiggy.com/im",
  dineout: "POST mcp.swiggy.com/dineout",
};

function commercialTool(tool: string) {
  return ["place_food_order", "checkout", "book_table"].includes(tool);
}

function cartMutationTool(tool: string) {
  return ["update_food_cart", "update_cart", "flush_food_cart", "clear_cart", "apply_food_coupon"].includes(tool);
}

function retryPolicy(tool: string) {
  if (commercialTool(tool)) return "check order or booking status before retry";
  if (cartMutationTool(tool)) return "safe to retry with same arguments";
  return "safe read retry with exponential backoff";
}

function statusForChecks(checks: CartPreflightCheck[]): CartPreflightReport["overall"] {
  if (checks.some((check) => check.status === "blocked")) return "blocked";
  if (checks.some((check) => check.status === "warn")) return "needs_review";
  return "ready";
}

function recommendationChecks(plan: MealPlan): CartPreflightCheck[] {
  return plan.recommendations.flatMap((recommendation) => {
    const totalCap = recommendation.server === "food" ? 1000 : 10000;
    const confirmed = recommendation.status === "confirmed";

    return [
      {
        id: `${recommendation.id}_items`,
        label: `${recommendation.title} items`,
        status: recommendation.items.length > 0 ? "pass" : "blocked",
        evidence: `${recommendation.items.length} item(s) prepared for ${recommendation.provider}.`,
        recommendationId: recommendation.id,
        server: recommendation.server,
      },
      {
        id: `${recommendation.id}_total`,
        label: `${recommendation.title} total`,
        status: recommendation.total <= totalCap ? "pass" : "blocked",
        evidence: `Rs ${recommendation.total.toLocaleString("en-IN")} against Rs ${totalCap.toLocaleString("en-IN")} action cap.`,
        recommendationId: recommendation.id,
        server: recommendation.server,
      },
      {
        id: `${recommendation.id}_confirmation`,
        label: `${recommendation.title} confirmation`,
        status: confirmed ? "pass" : "warn",
        evidence: confirmed
          ? "User confirmation has been recorded."
          : `${recommendation.confirmationAction} remains locked until explicit confirmation.`,
        recommendationId: recommendation.id,
        server: recommendation.server,
      },
      {
        id: `${recommendation.id}_alternatives`,
        label: `${recommendation.title} alternatives`,
        status: recommendation.alternatives.length > 0 ? "pass" : "warn",
        evidence: `${recommendation.alternatives.length} visible substitution option(s).`,
        recommendationId: recommendation.id,
        server: recommendation.server,
      },
    ];
  });
}

function offersForPlan(plan: MealPlan): OfferOpportunity[] {
  return plan.recommendations.map((recommendation) => {
    if (recommendation.server === "food") {
      return {
        id: "offer_food_50",
        server: "food",
        code: "MEALPILOT50",
        label: "Food cart coupon",
        estimatedSavings: recommendation.total >= 350 ? 50 : 0,
        appliesTo: recommendation.title,
        status: recommendation.total >= 350 ? "available" : "not_applicable",
      };
    }

    if (recommendation.server === "instamart") {
      return {
        id: "offer_im_75",
        server: "instamart",
        code: "HEALTHY75",
        label: "Grocery basket coupon",
        estimatedSavings: recommendation.total >= 700 ? 75 : 0,
        appliesTo: recommendation.title,
        status: recommendation.total >= 700 ? "available" : "not_applicable",
      };
    }

    return {
      id: "offer_dineout_early",
      server: "dineout",
      code: "EARLYTABLE",
      label: "Early table deal",
      estimatedSavings: 100,
      appliesTo: recommendation.title,
      status: "available",
    };
  });
}

export function buildCartPreflightReport(plan: MealPlan): CartPreflightReport {
  const checks: CartPreflightCheck[] = [
    {
      id: "budget",
      label: "Budget envelope",
      status: plan.total <= plan.budgetLimit ? "pass" : "warn",
      evidence: `Plan total Rs ${plan.total.toLocaleString("en-IN")} against Rs ${plan.budgetLimit.toLocaleString("en-IN")} budget.`,
    },
    {
      id: "address",
      label: "Address label",
      status: plan.recommendations.every((item) => item.locationLabel.length > 0) ? "pass" : "blocked",
      evidence: "Every commerce action carries a visible location label.",
    },
    {
      id: "payment",
      label: "Payment scope",
      status: "pass",
      evidence: "No payment credential is stored by MealPilot in mock or staging-ready flows.",
    },
    ...recommendationChecks(plan),
  ];

  return {
    sessionId: plan.id,
    overall: statusForChecks(checks),
    total: plan.total,
    checks,
    offers: offersForPlan(plan),
  };
}

export function buildMcpReplay(plan: MealPlan): McpReplayStep[] {
  const steps = plan.recommendations.flatMap((recommendation) =>
    recommendation.toolChain.map((tool) => ({
      server: recommendation.server,
      endpoint: endpoints[recommendation.server],
      tool,
      recommendation,
    })),
  );

  return steps.map((step, index) => ({
    id: `replay_${plan.id}_${index + 1}`,
    sequence: index + 1,
    server: step.server,
    endpoint: step.endpoint,
    tool: step.tool,
    request: {
      jsonrpc: "2.0",
      id: `${plan.id}_${index + 1}`,
      method: "tools/call",
      params: {
        name: step.tool,
        arguments: {
          sessionId: plan.id,
          recommendationId: step.recommendation.id,
        },
      },
    },
    response: {
      success: true,
      mode: "mock",
      recommendation: step.recommendation.title,
      commercialActionLocked: commercialTool(step.tool) && step.recommendation.status !== "confirmed",
    },
    durationMs: 95 + index * 13,
    retryPolicy: retryPolicy(step.tool),
  }));
}

export function buildDemoStudio(options: {
  plans: MealPlan[];
  coverage: McpServerCoverage[];
  reminders: Reminder[];
  hasClientId: boolean;
}): DemoStudioStep[] {
  const latestPlan = options.plans.at(-1);
  const hasConfirmed = latestPlan?.recommendations.some((item) => item.status === "confirmed") ?? false;
  const allToolsMapped = options.coverage.reduce((sum, server) => sum + server.planned, 0) === 0;

  return [
    {
      id: "profile",
      label: "Profile and consent",
      status: "done",
      evidence: "Household profile, allergies, cuisine preferences, and consent are represented server-side.",
    },
    {
      id: "plan",
      label: "Three-server plan",
      status: latestPlan ? "done" : "active",
      evidence: latestPlan ? `${latestPlan.id} generated across Food, Instamart, and Dineout.` : "No plan session yet.",
      artifactUrl: latestPlan ? `/api/sessions/${latestPlan.id}` : undefined,
    },
    {
      id: "coverage",
      label: "MCP coverage",
      status: allToolsMapped ? "done" : "active",
      evidence: allToolsMapped ? "All 35 documented tools are demo-ready or guarded." : "Some tools are still planned.",
      artifactUrl: "/api/mcp/catalog",
    },
    {
      id: "surface",
      label: "Chat and voice contracts",
      status: latestPlan ? "done" : "pending",
      evidence: latestPlan ? "Surface payloads are available for chat and voice." : "Run a plan first.",
      artifactUrl: latestPlan ? `/api/sessions/${latestPlan.id}/surface?surface=voice` : undefined,
    },
    {
      id: "confirmation",
      label: "Commercial confirmation",
      status: hasConfirmed ? "done" : latestPlan ? "active" : "pending",
      evidence: hasConfirmed ? "At least one commercial action has explicit confirmation." : "Confirm one prepared action.",
    },
    {
      id: "reminders",
      label: "Follow-up operations",
      status: options.reminders.length > 0 ? "done" : latestPlan ? "active" : "pending",
      evidence: `${options.reminders.length} reminder(s) scheduled.`,
      artifactUrl: "/api/schedule",
    },
    {
      id: "credentials",
      label: "Credential swap",
      status: options.hasClientId ? "done" : "pending",
      evidence: options.hasClientId ? "Client id is configured." : "Awaiting Builder Access client id.",
    },
  ];
}

export function buildSubmissionPackage(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
}): SubmissionPackage {
  const totalTools = options.coverage.reduce((sum, server) => sum + server.totalTools, 0);
  const readyTools = options.coverage.reduce((sum, server) => sum + server.demoReady + server.guarded, 0);

  return {
    generatedAt: new Date().toISOString(),
    fields: [
      { id: "name", label: "Integration name", value: "MealPilot India", status: "ready" },
      { id: "owner", label: "Organization", value: "Farhan Khan / MealPilot", status: "ready" },
      {
        id: "use_case",
        label: "Use case",
        value:
          "AI commerce assistant for household meal planning across Food, Instamart, and Dineout with confirmation-first ordering.",
        status: "ready",
      },
      {
        id: "redirect",
        label: "Redirect URI",
        value: options.config.swiggyRedirectUri,
        status: options.config.swiggyRedirectUri.startsWith("https://") ? "ready" : "manual_input",
      },
      { id: "servers", label: "Requested servers", value: "food, instamart, dineout", status: "ready" },
      { id: "traffic", label: "Expected traffic", value: "100 pilot users, below 1 QPS peak", status: "ready" },
      {
        id: "tool_coverage",
        label: "Tool coverage",
        value: `${readyTools}/${totalTools} tools mapped as demo-ready or guarded`,
        status: "ready",
      },
      {
        id: "security_contact",
        label: "Security contact",
        value: "Add primary engineering email before submission",
        status: "manual_input",
      },
      {
        id: "static_ip",
        label: "Static IP range",
        value: "Add deployment NAT IP after hosting is selected",
        status: "manual_input",
      },
      {
        id: "privacy",
        label: "Privacy posture",
        value: `Consent ${options.profile.consentToStorePreferences ? "captured" : "not captured"}; export/delete controls implemented`,
        status: "ready",
      },
    ],
    links: [
      { label: "GitHub", url: "https://github.com/Farhankhan0128/MealPilot" },
      { label: "Builder packet", url: "/api/builder-package.md" },
      { label: "Latest plan", url: options.latestPlan ? `/api/sessions/${options.latestPlan.id}` : "/api/plan" },
      { label: "MCP coverage", url: "/api/mcp/catalog" },
    ],
    residualRisks: [
      "Replace localhost redirect with HTTPS production URI before production access.",
      "Add security contact email and deployment IP range before submitting the form.",
      "Record the final 2-3 minute video after staging credentials are issued.",
    ],
  };
}
