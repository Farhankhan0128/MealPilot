import type {
  ComplianceEvidence,
  MealPlan,
  RateLimitPlan,
  ReviewerProof,
  SwiggyServer,
  SwiggyWidget,
  UserProfile,
  VersionMonitor,
} from "../../src/domain/types.js";

const widgetOrigin = "https://mcp.swiggy.com/widgets";

function serverPath(server: SwiggyServer) {
  if (server === "instamart") return "im";
  return server;
}

export function buildWidgets(plan: MealPlan): SwiggyWidget[] {
  return plan.recommendations.flatMap<SwiggyWidget>((recommendation): SwiggyWidget[] => {
    const base = `${widgetOrigin}/${serverPath(recommendation.server)}`;
    const common = {
      server: recommendation.server,
      status: "semantic_fallback" as const,
    };

    if (recommendation.server === "food") {
      return [
        {
          ...common,
          id: `widget_${recommendation.id}_restaurant`,
          type: "restaurant-card" as const,
          title: recommendation.provider,
          src: `${base}/restaurant-card?id=${encodeURIComponent(recommendation.provider)}&theme=light`,
          fallback: `${recommendation.provider}, ${recommendation.eta}, Rs ${recommendation.total.toLocaleString("en-IN")}`,
          width: "100%; max-width: 420px",
          height: 180,
          events: ["restaurant-card.clicked", "restaurant-card.menu-requested"],
        },
        {
          ...common,
          id: `widget_${recommendation.id}_cart`,
          type: "cart-widget" as const,
          title: `${recommendation.title} cart`,
          src: `${base}/cart-widget?session=${plan.id}&theme=light`,
          fallback: `${recommendation.items.length} prepared food item(s), checkout locked until confirmation.`,
          width: "100%; max-width: 480px",
          height: 320,
          events: ["cart.item-removed", "cart.quantity-changed", "cart.checkout-requested"],
        },
      ];
    }

    if (recommendation.server === "instamart") {
      return [
        {
          ...common,
          id: `widget_${recommendation.id}_product`,
          type: "product-card" as const,
          title: recommendation.title,
          src: `${base}/product-card?session=${plan.id}&theme=light`,
          fallback: `${recommendation.items.length} grocery item(s), Rs ${recommendation.total.toLocaleString("en-IN")}`,
          width: "100%; max-width: 420px",
          height: 240,
          events: ["product.add-to-cart", "product.variant-selected"],
        },
        {
          ...common,
          id: `widget_${recommendation.id}_cart`,
          type: "cart-widget" as const,
          title: "Instamart basket",
          src: `${base}/cart-widget?session=${plan.id}&theme=light`,
          fallback: "Basket checkout remains locked until explicit user confirmation.",
          width: "100%; max-width: 480px",
          height: 320,
          events: ["cart.item-removed", "cart.quantity-changed", "cart.checkout-requested"],
        },
      ];
    }

    return [
      {
        ...common,
        id: `widget_${recommendation.id}_slot`,
        type: "slot-picker" as const,
        title: recommendation.title,
        src: `${base}/slot-picker?session=${plan.id}&theme=light`,
        fallback: `${recommendation.provider}, ${recommendation.eta}, ${recommendation.locationLabel}`,
        width: "100%; max-width: 420px",
        height: 260,
        events: ["slot.selected", "slot.booking-requested"],
      },
    ];
  });
}

export function buildRateLimitPlan(plans: MealPlan[]): RateLimitPlan {
  const latest = plans.at(-1);
  const estimatedToolCallsPerSession = latest?.callCount ?? 12;
  const projectedDailySessions = 200;
  const projectedDailyToolCalls = estimatedToolCallsPerSession * projectedDailySessions;

  return {
    generatedAt: new Date().toISOString(),
    estimatedToolCallsPerSession,
    projectedDailyToolCalls,
    budgets: [
      {
        scope: "Per authenticated user, per server",
        plannedLimit: "120 requests / minute",
        mealPilotEstimate: "4-6 calls during an active planning turn",
        status: "under_limit",
        mitigation: "One saved-address read per session and cart refresh only at action boundaries.",
      },
      {
        scope: "Per authenticated user write tools",
        plannedLimit: "30 requests / minute",
        mealPilotEstimate: "1-3 writes after explicit confirmation",
        status: "under_limit",
        mitigation: "Commercial actions are serialized and never run as hidden background jobs.",
      },
      {
        scope: "Per client_id across all servers",
        plannedLimit: "50,000 requests / day",
        mealPilotEstimate: `${projectedDailyToolCalls.toLocaleString("en-IN")} requests / day at 100 pilot users`,
        status: projectedDailyToolCalls < 50000 ? "under_limit" : "needs_upgrade",
        mitigation: "Request higher ceiling before public launch or campaign traffic.",
      },
      {
        scope: "Tracking polling",
        plannedLimit: "Do not poll faster than 10s",
        mealPilotEstimate: "Manual refresh plus reminder-based follow-up",
        status: "under_limit",
        mitigation: "Use user-triggered refresh and scheduled reminders rather than tight polling loops.",
      },
    ],
    upgradeEmail:
      "mailto:builders@swiggy.in?subject=MealPilot%20rate%20limit%20upgrade&body=client_id%3A%20TBD%0Aexpected_qps%3A%20%3C1%20pilot%2C%20TBD%20launch%0Asurface%3A%20chat%20and%20voice",
  };
}

export function buildVersionMonitor(): VersionMonitor {
  return {
    currentMajor: "v1",
    pinnedRoutes: {
      food: "https://mcp.swiggy.com/v1/food",
      instamart: "https://mcp.swiggy.com/v1/im",
      dineout: "https://mcp.swiggy.com/v1/dineout",
    },
    deprecationWindowDays: 180,
    alerts: [
      {
        id: "initialize_version",
        label: "Initialize version capture",
        status: "ready",
        evidence: "MealPilot records implementation.version during MCP initialize once staging credentials are installed.",
      },
      {
        id: "deprecation_meta",
        label: "Deprecation metadata",
        status: "ready",
        evidence: "Client-side response handling reserves alerting for _meta.swiggy.deprecation.",
      },
      {
        id: "unknown_error_code",
        label: "Unknown error codes",
        status: "ready",
        evidence: "Retry policy treats unknown codes as generic failures unless explicitly marked retryable.",
      },
      {
        id: "experimental_tools",
        label: "Experimental tools",
        status: "watch",
        evidence: "Experimental capabilities stay outside the default plan until staging validation.",
      },
    ],
  };
}

export function buildComplianceEvidence(profile: UserProfile): ComplianceEvidence {
  return {
    residency: "Target deployment region: India-first, ap-south-1 for primary compute.",
    dataRole: "MealPilot acts as processor for Swiggy-originated data and stores only user-controlled preferences locally.",
    retainedFields: [
      "Diet preference",
      "Budget range",
      "Household size",
      "Cuisine preferences",
      "Allergy and dislike filters",
      "Swiggy session ids for support correlation",
    ],
    controls: [
      {
        id: "consent",
        label: "Preference consent",
        status: profile.consentToStorePreferences ? "implemented" : "manual_review",
        evidence: profile.consentToStorePreferences
          ? "Profile consent is captured before durable preference use."
          : "User has not granted preference storage consent.",
      },
      {
        id: "pii_minimization",
        label: "PII minimization",
        status: "implemented",
        evidence: "Raw address text, payment credentials, and full order payloads are not persisted in the local store.",
      },
      {
        id: "deletion",
        label: "Deletion workflow",
        status: "implemented",
        evidence: "/api/privacy deletes profile, pantry, group, plan, auth, and reminder data from the local store.",
      },
      {
        id: "audit_logging",
        label: "Audit logging",
        status: "implemented",
        evidence: "Audit entries store tool name, session id, status, duration, and redacted detail only.",
      },
      {
        id: "training_data",
        label: "Model training exclusion",
        status: "implemented",
        evidence: "Builder packet states Swiggy-originated data is not used for model training or advertising.",
      },
    ],
  };
}

export function buildReviewerProof(options: {
  plans: MealPlan[];
  widgets: SwiggyWidget[];
  rateLimit: RateLimitPlan;
  compliance: ComplianceEvidence;
  version: VersionMonitor;
}): ReviewerProof {
  const latest = options.plans.at(-1);
  const implementedControls = options.compliance.controls.filter((control) => control.status === "implemented").length;
  const readyRateBudgets = options.rateLimit.budgets.filter((budget) => budget.status === "under_limit").length;
  const readyVersionAlerts = options.version.alerts.filter((alert) => alert.status === "ready").length;
  const score =
    40 +
    (latest ? 15 : 0) +
    Math.min(options.widgets.length, 5) * 3 +
    implementedControls * 4 +
    readyRateBudgets * 3 +
    readyVersionAlerts * 2;

  return {
    score: Math.min(100, score),
    highlights: [
      latest ? `Latest plan ${latest.id} composes all three Swiggy servers.` : "Run a plan to populate live reviewer proof.",
      `${options.widgets.length} widget contracts are ready with semantic fallbacks.`,
      `${implementedControls}/${options.compliance.controls.length} compliance controls implemented.`,
      `${readyRateBudgets}/${options.rateLimit.budgets.length} rate-limit budgets are under planned ceilings.`,
    ],
    blockers: [
      "Production client_id is still pending Builder Access.",
      "HTTPS redirect URI and static deployment IP must be filled before production approval.",
    ],
    artifacts: [
      { label: "Builder packet", path: "/api/builder-package.md" },
      { label: "Widget contracts", path: latest ? `/api/sessions/${latest.id}/widgets` : "/api/widgets/latest" },
      { label: "Rate-limit plan", path: "/api/rate-limit-plan" },
      { label: "Compliance evidence", path: "/api/compliance-evidence" },
      { label: "Version monitor", path: "/api/version-monitor" },
    ],
  };
}
