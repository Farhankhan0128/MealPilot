import type {
  ComplianceEvidence,
  DataGovernanceCenter,
  EnterpriseDelegatedAuthCenter,
  MealPlan,
  RateLimitPlan,
  ReviewerProof,
  SloIncidentCommandCenter,
  SwiggyServer,
  TrafficReadinessPlan,
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
  trafficReadiness: TrafficReadinessPlan;
  sloIncident: SloIncidentCommandCenter;
  compliance: ComplianceEvidence;
  dataGovernance: DataGovernanceCenter;
  enterpriseAuth: EnterpriseDelegatedAuthCenter;
  version: VersionMonitor;
}): ReviewerProof {
  const latest = options.plans.at(-1);
  const implementedControls = options.compliance.controls.filter((control) => control.status === "implemented").length;
  const readyDataControls = options.dataGovernance.controls.filter((control) => control.status === "ready").length;
  const readyRateBudgets = options.rateLimit.budgets.filter((budget) => budget.status === "under_limit").length;
  const readyTrafficLanes = options.trafficReadiness.lanes.filter((lane) => lane.status === "ready").length;
  const readySloChecks = options.sloIncident.liveReadiness.filter((item) => item.status === "ready").length;
  const readyVersionAlerts = options.version.alerts.filter((alert) => alert.status === "ready").length;
  const readyEnterpriseFlow = options.enterpriseAuth.flow.filter((step) => step.status === "ready").length;
  const score =
    40 +
    (latest ? 15 : 0) +
    Math.min(options.widgets.length, 5) * 3 +
    implementedControls * 4 +
    readyRateBudgets * 3 +
    Math.min(readyTrafficLanes, 5) * 2 +
    Math.min(readySloChecks, 4) * 2 +
    Math.min(readyDataControls, 4) * 2 +
    Math.min(readyEnterpriseFlow, 5) * 2 +
    readyVersionAlerts * 2;

  return {
    score: Math.min(100, score),
    highlights: [
      latest ? `Latest plan ${latest.id} composes all three Swiggy servers.` : "Run a plan to populate live reviewer proof.",
      `${options.widgets.length} widget contracts are ready with semantic fallbacks.`,
      `${implementedControls}/${options.compliance.controls.length} compliance controls implemented.`,
      `${readyRateBudgets}/${options.rateLimit.budgets.length} rate-limit budgets are under planned ceilings.`,
      `${readyTrafficLanes}/${options.trafficReadiness.lanes.length} traffic lanes are launch-ready at ${options.trafficReadiness.peakQps.toFixed(2)} peak QPS.`,
      `${readySloChecks}/${options.sloIncident.liveReadiness.length} SLO command checks are ready with ${options.sloIncident.uptimeTargets.length} uptime targets.`,
      `${readyDataControls}/${options.dataGovernance.controls.length} data-governance controls are ready across DPDP, DSR, logs, and token handling.`,
      `${readyEnterpriseFlow}/${options.enterpriseAuth.flow.length} delegated-auth OBO steps are ready, with enterprise partnership gates explicit.`,
    ],
    blockers: [
      "Production client_id is still pending Builder Access.",
      "HTTPS redirect URI and static deployment IP must be filled before production approval.",
    ],
    artifacts: [
      { label: "Builder packet", path: "/api/builder-package.md" },
      { label: "Production Launch Bundle", path: "/api/production-launch-bundle" },
      { label: "Staging Transcript Export", path: latest ? `/api/sessions/${latest.id}/staging-transcript` : "/api/sessions/:sessionId/staging-transcript" },
      { label: "Widget contracts", path: latest ? `/api/sessions/${latest.id}/widgets` : "/api/widgets/latest" },
      { label: "Widget Runtime Center", path: "/api/mcp/widget-runtime" },
      { label: "Staging Cutover Rehearsal", path: "/api/mcp/staging-cutover" },
      { label: "Website Atlas", path: "/api/swiggy-website-atlas" },
      { label: "Builder Intake Command Center", path: "/api/swiggy-builder-intake" },
      { label: "FAQ & Policy Center", path: "/api/swiggy-faq-policy" },
      { label: "Growth Partnership Center", path: "/api/swiggy-growth-partnership" },
      { label: "Channel & Multimodal Studio", path: "/api/channel-multimodal-studio" },
      { label: "Nutrition & Budget Intelligence", path: "/api/nutrition-budget-intelligence" },
      { label: "Household Preference Graph", path: "/api/household-preference-graph" },
      { label: "Guest Collaboration & Calendar Center", path: "/api/guest-collaboration-calendar" },
      { label: "Luxury Experience Workspace", path: "/api/luxury-experience-workspace" },
      { label: "Reviewer Artifact Vault", path: "/api/reviewer-artifact-vault" },
      { label: "Visual QA Center", path: "/api/visual-qa-center" },
      { label: "Swiggy Access Evidence Matrix", path: "/api/swiggy-access-evidence-matrix" },
      { label: "Swiggy Docs Coverage", path: "/api/swiggy-docs-coverage" },
      { label: "Swiggy Docs Twin Explorer", path: "/api/swiggy-docs-twin-explorer" },
      { label: "Swiggy Upstream Watch", path: "/api/swiggy-upstream-watch" },
      { label: "Swiggy Source Intelligence", path: "/api/swiggy-source-intelligence" },
      { label: "Swiggy Deep Site Map", path: "/api/swiggy-deep-site-map" },
      { label: "Developer Quickstart Workbench", path: "/api/swiggy-developer-quickstart" },
      { label: "CTA Execution Center", path: "/api/swiggy-cta-execution-center" },
      { label: "Swiggy Innovation Radar", path: "/api/swiggy-innovation-radar" },
      { label: "AI Client Connect Kit", path: "/api/ai-client-connect-kit" },
      { label: "Brand Compliance Kit", path: "/api/brand-compliance-kit" },
      { label: "Swiggy Journey Compiler", path: "/api/swiggy-journey-compiler" },
      { label: "Swiggy Access Dossier", path: "/api/swiggy-access-dossier" },
      { label: "Premium Use Case Studio", path: "/api/premium-use-case-studio" },
      { label: "Premium Concierge Itinerary", path: "/api/premium-concierge-itinerary" },
      { label: "Staging Certification Matrix", path: "/api/staging-certification-matrix" },
      { label: "MCP Tool Lab", path: "/api/mcp/tool-lab" },
      { label: "Tool Contract Matrix", path: "/api/mcp/tool-contract-matrix" },
      { label: "Scenario Runner", path: "/api/mcp/scenario-runner" },
      { label: "State Orchestrator", path: "/api/mcp/state-orchestrator" },
      { label: "Commercial Action Guard", path: "/api/mcp/commercial-action-guard" },
      { label: "MCP Capability Registry", path: "/api/mcp/capability-registry" },
      { label: "Resource & Prompt Studio", path: "/api/mcp/resource-prompt-studio" },
      { label: "MCP Gateway", path: "/api/mcp-gateway" },
      { label: "Swiggy OAuth Status", path: "/api/auth/swiggy/status" },
      { label: "Rate-limit plan", path: "/api/rate-limit-plan" },
      { label: "Traffic Readiness Plan", path: "/api/traffic-readiness-plan" },
      { label: "MCP Backpressure Governor", path: "/api/mcp/backpressure-governor" },
      { label: "Swiggy Load Lab", path: "/api/swiggy-load-lab" },
      { label: "Swiggy Offer Intelligence", path: "/api/swiggy-offer-intelligence" },
      { label: "SLO Incident Command Center", path: "/api/slo-incident-command" },
      { label: "Data Governance Center", path: "/api/data-governance-center" },
      { label: "Enterprise Delegated Auth Center", path: "/api/enterprise-delegated-auth" },
      { label: "Compliance evidence", path: "/api/compliance-evidence" },
      { label: "Version monitor", path: "/api/version-monitor" },
      { label: "Support Bridge", path: "/api/support/bridge" },
      { label: "Error Intelligence", path: "/api/error-intelligence" },
      { label: "Resilience drills", path: "/api/resilience" },
      { label: "Trace monitor", path: "/api/observability/traces" },
      { label: "Runtime telemetry", path: "/api/telemetry/runtime" },
      { label: "Audit Ledger Center", path: "/api/audit-ledger" },
      { label: "Submission Console", path: "/api/submission-console" },
      { label: "Route optimizer", path: "/api/swiggy-route-optimizer" },
      { label: "Evaluation Lab", path: "/api/evaluation-lab" },
    ],
  };
}
