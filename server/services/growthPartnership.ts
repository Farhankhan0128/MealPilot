import type {
  SwiggyGrowthAsset,
  SwiggyGrowthExperiment,
  SwiggyGrowthPartnershipAskDecision,
  SwiggyGrowthPartnershipAskPacket,
  SwiggyGrowthPartnershipCenter,
  SwiggyGrowthPartnershipSignal,
  SwiggyGrowthPartnershipStatus,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
];

function statusScore(status: SwiggyGrowthPartnershipStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.7;
  return 0.45;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function decisionFor(
  experiment: SwiggyGrowthExperiment | null,
  ask: SwiggyGrowthAsset | null,
): SwiggyGrowthPartnershipAskDecision {
  if (!experiment || !ask) return "unknown_growth_item";
  if (experiment.status === "manual_input" || ask.status === "manual_input") return "needs_operator_input";
  if (experiment.status === "external_gate" || ask.status === "external_gate") return "swiggy_gate";
  return "ready_local_handoff";
}

function readinessFor(decision: SwiggyGrowthPartnershipAskDecision) {
  if (decision === "ready_local_handoff") return 100;
  if (decision === "needs_operator_input") return 72;
  if (decision === "swiggy_gate") return 64;
  return 0;
}

function signal(
  id: string,
  source: SwiggyGrowthPartnershipSignal["source"],
  officialSignal: string,
  mealPilotResponse: string,
  status: SwiggyGrowthPartnershipStatus,
  evidenceLinks: string[],
): SwiggyGrowthPartnershipSignal {
  return { id, source, officialSignal, mealPilotResponse, status, evidenceLinks };
}

function experiment(options: {
  id: string;
  label: string;
  audience: SwiggyGrowthExperiment["audience"];
  hypothesis: string;
  mcpServers: SwiggyServer[];
  requiredTools: string[];
  launchStage: SwiggyGrowthExperiment["launchStage"];
  metric: string;
  guardrail: string;
  status: SwiggyGrowthPartnershipStatus;
  evidenceLinks: string[];
}): SwiggyGrowthExperiment {
  return options;
}

function asset(
  id: string,
  label: string,
  purpose: string,
  owner: SwiggyGrowthAsset["owner"],
  status: SwiggyGrowthPartnershipStatus,
  evidenceLinks: string[],
): SwiggyGrowthAsset {
  return { id, label, purpose, owner, status, evidenceLinks };
}

function buildSignals(): SwiggyGrowthPartnershipSignal[] {
  return [
    signal(
      "live_api_access",
      "builders_home",
      "Swiggy positions live Food, Instamart, and Dineout API access as the core value once production is approved.",
      "MealPilot already models all three MCP servers, 35 tools, staging cutover, and production promotion gates.",
      "ready",
      ["/api/mcp/catalog", "/api/mcp/staging-cutover", "/api/staging-certification-matrix"],
    ),
    signal(
      "generous_rate_limits",
      "builders_home",
      "Swiggy says builders start with defaults and can ask for more when needed.",
      "Traffic Readiness and Rate Plan quantify expected volume, capacity asks, and ramp gates.",
      "ready",
      ["/api/traffic-readiness-plan", "/api/rate-limit-plan", "/api/swiggy-route-optimizer"],
    ),
    signal(
      "room_to_experiment",
      "builders_home",
      "Swiggy encourages fast iteration and bold experiments before production.",
      "Premium Use Case Studio and Evaluation Lab convert experiments into measured launch lanes.",
      "ready",
      ["/api/premium-use-case-studio", "/api/evaluation-lab"],
    ),
    signal(
      "co_branding",
      "builders_home",
      "Swiggy calls out Powered by Swiggy co-branding as a credibility benefit.",
      "Brand Compliance prepares attribution, screenshot review, and asset gates without claiming endorsement.",
      "ready",
      ["/api/brand-compliance-kit", "/api/swiggy-faq-policy"],
    ),
    signal(
      "direct_support",
      "builders_home",
      "Swiggy mentions technical support, integration help, and Slack for approved builders.",
      "Support Bridge, SLO Incident Command, and Error Intelligence prepare support packets; Slack access remains Swiggy gated.",
      "manual_input",
      ["/api/support/bridge", "/api/slo-incident-command", "/api/error-intelligence"],
    ),
    signal(
      "growth_partnership",
      "builders_home",
      "Swiggy describes co-marketing, strategic support, and shared growth for strong builders.",
      "This Growth Partnership Center turns MealPilot's proof into experiments, metrics, launch assets, and partner asks.",
      "ready",
      ["/api/swiggy-growth-partnership", "/api/production-launch-bundle"],
    ),
    signal(
      "get_noticed",
      "builders_home",
      "Swiggy asks builders to send a demo and says standout projects can get featured.",
      "Demo Studio, Submission Console, and Launch Bundle provide the demo plan, proof links, and outreach draft.",
      "ready",
      ["/api/demo-studio", "/api/submission-console", "/api/production-launch-bundle"],
    ),
    signal(
      "developer_hiring_signal",
      "developers",
      "The developer page says impressive projects may be featured and hiring conversations may follow.",
      "MealPilot keeps this as a showcase lane with founder narrative and proof artifacts, not as an entitlement.",
      "ready",
      ["/api/swiggy-growth-partnership", "/api/reviewer-proof"],
    ),
    signal(
      "developer_possibilities",
      "developers",
      "Swiggy lists voice agents, auto-restock, group ordering, dietary planning, reservations, and multimodal agents as inspiration.",
      "MealPilot packages these into premium, cross-server use cases and measurable launch experiments.",
      "ready",
      ["/api/premium-use-case-studio", "/api/swiggy-journey-compiler"],
    ),
    signal(
      "enterprise_scale_confidence",
      "enterprises",
      "Enterprise positioning emphasizes SLAs, rate limits, and infrastructure scale.",
      "SLO Incident Command, Traffic Readiness, Data Governance, and Audit Ledger prepare the enterprise proof path.",
      "ready",
      ["/api/slo-incident-command", "/api/traffic-readiness-plan", "/api/data-governance-center", "/api/audit-ledger"],
    ),
    signal(
      "enterprise_production_api",
      "enterprises",
      "Enterprise access includes production APIs with real catalog, inventory, and transactions.",
      "MealPilot has local and staging rehearsals ready, but real production credentials remain an external gate.",
      "external_gate",
      ["/api/mcp-gateway", "/api/staging-certification-matrix"],
    ),
    signal(
      "enterprise_dedicated_support",
      "enterprises",
      "Enterprise access references a named partner manager, priority Slack channel, and direct engineering access.",
      "MealPilot prepares support packets and escalation runbooks; named manager and Slack are Swiggy approvals.",
      "external_gate",
      ["/api/support/bridge", "/api/slo-incident-command"],
    ),
    signal(
      "enterprise_custom_integration",
      "enterprises",
      "Swiggy offers tailored onboarding and integration support for specific enterprise use cases.",
      "Enterprise Delegated Auth, AI Client Connect, and Journey Compiler provide the architecture walkthrough.",
      "ready",
      ["/api/enterprise-delegated-auth", "/api/ai-client-connect-kit", "/api/swiggy-journey-compiler"],
    ),
    signal(
      "enterprise_growth_analytics",
      "enterprises",
      "Enterprise growth partnership includes joint go-to-market support, analytics dashboards, and strategic guidance.",
      "MealPilot defines the metric pack and launch experiments locally; Swiggy dashboard access is a partner gate.",
      "ready",
      ["/api/swiggy-growth-partnership", "/api/telemetry/runtime", "/api/evaluation-lab"],
    ),
    signal(
      "ongoing_partnership_review",
      "access",
      "The access page says Swiggy monitors usage, validates rollout, and stays in touch during partnership.",
      "Audit Ledger, Runtime Telemetry, SLO Command, and Growth Partnership Center make ongoing review inspectable.",
      "ready",
      ["/api/audit-ledger", "/api/telemetry/runtime", "/api/slo-incident-command", "/api/swiggy-growth-partnership"],
    ),
  ];
}

function buildExperiments(): SwiggyGrowthExperiment[] {
  return [
    experiment({
      id: "luxury_weekend_concierge",
      label: "Luxury Weekend Concierge",
      audience: "consumers",
      hypothesis: "A single premium plan that combines dinner groceries, Food recovery, and Dineout reservation intent will lift cross-server conversion.",
      mcpServers: ["food", "instamart", "dineout"],
      requiredTools: ["food.search_restaurants", "food.update_food_cart", "instamart.search_products", "instamart.update_cart", "dineout.get_available_slots", "dineout.book_table"],
      launchStage: "production_pilot",
      metric: "Cross-server plan completion above 35% with zero blind commercial retries.",
      guardrail: "Separate confirmations for Food order, Instamart checkout, and Dineout booking.",
      status: "ready",
      evidenceLinks: ["/api/premium-concierge-itinerary", "/api/mcp/scenario-runner", "/api/mcp/state-orchestrator"],
    }),
    experiment({
      id: "voice_fridge_to_dinner",
      label: "Voice Fridge-to-Dinner",
      audience: "consumers",
      hypothesis: "A voice-safe pantry-to-dinner flow can make Swiggy MCP feel like a household operating layer.",
      mcpServers: ["food", "instamart"],
      requiredTools: ["food.search_menu", "food.get_food_cart", "instamart.search_products", "instamart.get_cart"],
      launchStage: "staging_pilot",
      metric: "Voice response completion above 80% while exposing no raw ids.",
      guardrail: "Voice contract limits choices and never speaks addressId, restaurantId, productId, or token data.",
      status: "ready",
      evidenceLinks: ["/api/sessions/:sessionId/surface?surface=voice", "/api/evaluation-lab"],
    }),
    experiment({
      id: "office_lunch_boardroom",
      label: "Office Lunch Boardroom",
      audience: "enterprises",
      hypothesis: "A group lunch planner can become an enterprise demo for Food plus Dineout hospitality flows.",
      mcpServers: ["food", "dineout"],
      requiredTools: ["food.search_restaurants", "food.search_menu", "food.place_food_order", "dineout.search_restaurants_dineout", "dineout.book_table"],
      launchStage: "production_pilot",
      metric: "Team plan acceptance above 50% and support incident rate below 1%.",
      guardrail: "Group allergy and budget constraints are applied before cart or booking actions.",
      status: "ready",
      evidenceLinks: ["/api/group", "/api/premium-use-case-studio", "/api/slo-incident-command"],
    }),
    experiment({
      id: "care_circle_meals",
      label: "Care Circle Meals",
      audience: "consumers",
      hypothesis: "A caregiver mode can turn Swiggy's three servers into a retention-heavy household use case.",
      mcpServers: ["food", "instamart"],
      requiredTools: ["food.get_addresses", "food.track_food_order", "food.report_error", "instamart.track_order", "instamart.report_error"],
      launchStage: "staging_pilot",
      metric: "Repeat weekly planning above 40% with successful support handoff for failed deliveries.",
      guardrail: "No full addresses, phone, email, or payment details are persisted in MealPilot.",
      status: "ready",
      evidenceLinks: ["/api/premium-use-case-studio", "/api/support/bridge", "/api/data-governance-center"],
    }),
    experiment({
      id: "traveler_hotel_mode",
      label: "Traveler Hotel Mode",
      audience: "consumers",
      hypothesis: "Temporary-address flows can differentiate MealPilot for business travelers and premium hotel stays.",
      mcpServers: ["food", "instamart", "dineout"],
      requiredTools: ["food.add_address", "food.delete_address", "instamart.add_address", "instamart.delete_address", "dineout.get_saved_locations"],
      launchStage: "staging_pilot",
      metric: "Temporary-address cleanup at 100% before session closure.",
      guardrail: "Address additions are scoped to explicit user confirmation and cleanup reminders.",
      status: "ready",
      evidenceLinks: ["/api/mcp/state-orchestrator", "/api/audit-ledger", "/api/premium-use-case-studio"],
    }),
    experiment({
      id: "celebration_split_plan",
      label: "Celebration Split Plan",
      audience: "consumers",
      hypothesis: "Combining dessert delivery, party groceries, and a table booking creates a premium celebration lane Swiggy can showcase.",
      mcpServers: ["food", "instamart", "dineout"],
      requiredTools: ["food.search_menu", "food.apply_food_coupon", "instamart.search_products", "instamart.apply_coupon", "dineout.get_available_slots"],
      launchStage: "production_pilot",
      metric: "Average order value lift above 20% while keeping coupon usage compliant.",
      guardrail: "Every coupon and commercial action is refreshed before confirmation.",
      status: "ready",
      evidenceLinks: ["/api/swiggy-route-optimizer", "/api/mcp/tool-contract-matrix"],
    }),
    experiment({
      id: "embedded_enterprise_concierge",
      label: "Embedded Enterprise Concierge",
      audience: "enterprises",
      hypothesis: "MealPilot can power a partner app as an on-behalf-of Swiggy commerce layer after delegated-auth approval.",
      mcpServers: ["food", "instamart", "dineout"],
      requiredTools: ["food.get_orders", "instamart.get_orders", "dineout.get_bookings", "food.report_error", "instamart.report_error", "dineout.report_error"],
      launchStage: "co_marketing",
      metric: "Partner pilot reaches 1,000 authenticated users with clean OBO token separation.",
      guardrail: "Per-user PKCE, token isolation, DSR routing, and partner contract gates are mandatory.",
      status: "ready",
      evidenceLinks: ["/api/enterprise-delegated-auth", "/api/data-governance-center", "/api/traffic-readiness-plan"],
    }),
    experiment({
      id: "city_trendboard",
      label: "City Trendboard",
      audience: "reviewers",
      hypothesis: "A read-only analytics story can help Swiggy evaluate MealPilot as a strategic growth partner without triggering commerce risk.",
      mcpServers: ["food", "instamart", "dineout"],
      requiredTools: ["food.search_restaurants", "instamart.search_products", "dineout.search_restaurants_dineout"],
      launchStage: "local_demo",
      metric: "Reviewer can inspect three-city trend insights without raw user PII.",
      guardrail: "Only aggregate, local, non-personal demo metrics are shown before Swiggy analytics approval.",
      status: "ready",
      evidenceLinks: ["/api/evaluation-lab", "/api/telemetry/runtime", "/api/swiggy-website-atlas"],
    }),
  ];
}

function buildAssets(): SwiggyGrowthAsset[] {
  return [
    asset("demo_storyboard", "Demo storyboard", "Two-minute recording path with proof links and product narrative.", "MealPilot", "ready", ["/api/demo-studio", "docs/demo-script.md"]),
    asset("founder_showcase", "Founder showcase packet", "Concise builder story, product thesis, GitHub link, and artifacts for Swiggy review.", "Operator", "manual_input", ["/api/submission-console", "/api/builder-package.md"]),
    asset("co_branding_screenshots", "Co-branding screenshot pack", "Screenshots proving Powered by Swiggy attribution and no false endorsement copy.", "MealPilot", "ready", ["/api/brand-compliance-kit"]),
    asset("growth_metrics_pack", "Growth metrics pack", "Activation, cross-server conversion, confirmation safety, latency, and support metrics.", "MealPilot", "ready", ["/api/telemetry/runtime", "/api/evaluation-lab", "/api/slo-incident-command"]),
    asset("launch_handoff_email", "Launch handoff email", "Copy-ready builders@swiggy.in outreach with proof links and remaining gates.", "MealPilot", "ready", ["/api/production-launch-bundle"]),
    asset("support_sev_packet", "Support and SEV packet", "Escalation, report_error, severity, redaction, and audit correlation evidence.", "MealPilot", "ready", ["/api/support/bridge", "/api/slo-incident-command", "/api/audit-ledger"]),
    asset("case_study_outline", "Case-study outline", "Premium MealPilot story arc for a Swiggy feature or launch blog once approved.", "Joint", "ready", ["/api/swiggy-growth-partnership", "/api/premium-concierge-itinerary"]),
  ];
}

function buildPartnershipAsks(): SwiggyGrowthAsset[] {
  return [
    asset("feature_review", "Feature or showcase review", "Swiggy review for featuring MealPilot after demo and staging proof.", "Swiggy", "external_gate", ["/api/demo-studio", "/api/reviewer-proof"]),
    asset("co_marketing_review", "Co-marketing review", "Approval for joint launch copy, screenshots, attribution, and any public claims.", "Joint", "external_gate", ["/api/brand-compliance-kit", "/api/swiggy-faq-policy"]),
    asset("priority_slack_channel", "Priority Slack or partner channel", "Named escalation path for launch week and enterprise pilots.", "Swiggy", "external_gate", ["/api/support/bridge", "/api/slo-incident-command"]),
    asset("analytics_dashboard_access", "Swiggy analytics dashboard access", "Partner-side dashboard or agreed metrics export for growth experiments.", "Swiggy", "external_gate", ["/api/telemetry/runtime", "/api/swiggy-growth-partnership"]),
    asset("higher_rate_limits", "Higher production rate limits", "Capacity increase for co-marketing or enterprise traffic beyond the developer pilot.", "Swiggy", "external_gate", ["/api/traffic-readiness-plan", "/api/rate-limit-plan"]),
    asset("partner_manager", "Named partner manager", "Owner for strategic guidance, joint GTM cadence, and custom integration feedback.", "Swiggy", "external_gate", ["/api/swiggy-growth-partnership", "/api/enterprise-delegated-auth"]),
  ];
}

export function buildSwiggyGrowthPartnershipCenter(): SwiggyGrowthPartnershipCenter {
  const signals = buildSignals();
  const experiments = buildExperiments();
  const assets = buildAssets();
  const partnershipAsks = buildPartnershipAsks();
  const scoreItems = [...signals.map((item) => item.status), ...experiments.map((item) => item.status), ...assets.map((item) => item.status)];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusScore(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalSignals: signals.length,
    readySignals: signals.filter((item) => item.status === "ready").length,
    totalExperiments: experiments.length,
    readyExperiments: experiments.filter((item) => item.status === "ready").length,
    signals,
    experiments,
    assets,
    partnershipAsks,
    metrics: [
      { id: "activation", label: "Activated Swiggy plans", target: "60% of demo users create a three-server plan", evidenceLinks: ["/api/evaluation-lab"] },
      { id: "cross_server", label: "Cross-server adoption", target: "35% of pilot sessions touch Food, Instamart, and Dineout", evidenceLinks: ["/api/telemetry/runtime", "/api/mcp/catalog"] },
      { id: "conversion_safety", label: "Confirmation safety", target: "100% commercial actions require explicit confirmation", evidenceLinks: ["/api/mcp/state-orchestrator", "/api/resilience"] },
      { id: "latency", label: "Reviewer p95 latency", target: "Read tools under 2.5s and commercial actions under 5s in staging", evidenceLinks: ["/api/slo-incident-command"] },
      { id: "support", label: "Support quality", target: "Every failed commerce action has support packet evidence", evidenceLinks: ["/api/support/bridge", "/api/audit-ledger"] },
      { id: "retention", label: "Weekly repeat planning", target: "40% repeat use in household/care-circle pilots", evidenceLinks: ["/api/premium-use-case-studio"] },
    ],
    assertions: [
      "MealPilot maps Swiggy's growth-partnership promise into concrete launch experiments, assets, metrics, and partner asks.",
      "All growth experiments preserve confirmation, privacy, brand, rate-limit, and support controls.",
      "The experiment set uses Food, Instamart, and Dineout together, not as isolated demos.",
      "Feature placement, co-marketing, Slack, analytics dashboards, higher rate limits, and partner management remain Swiggy-side approvals.",
    ],
    externalGates: [
      "Swiggy must approve any public feature, co-marketing language, or claim of partnership.",
      "Priority Slack, named partner manager, Swiggy analytics dashboards, and higher production limits require Swiggy access.",
      "Production growth experiments require staging credentials, production credentials, and a final approved launch window.",
    ],
  };
}

export function composeSwiggyGrowthPartnershipAsk(options: {
  experimentId: string;
  askId: string;
  audienceNote?: string;
}): SwiggyGrowthPartnershipAskPacket {
  const center = buildSwiggyGrowthPartnershipCenter();
  const experimentItem = center.experiments.find((item) => item.id === options.experimentId) ?? null;
  const askItem = center.partnershipAsks.find((item) => item.id === options.askId) ?? null;
  const decision = decisionFor(experimentItem, askItem);
  const assets = center.assets
    .filter((item) => item.status === "ready" || item.id === "founder_showcase")
    .slice(0, 5);
  const metrics = center.metrics.slice(0, 4);
  const proofLinks = unique([
    "/api/swiggy-growth-partnership",
    ...(experimentItem?.evidenceLinks ?? []),
    ...(askItem?.evidenceLinks ?? []),
    ...assets.flatMap((item) => item.evidenceLinks),
    ...metrics.flatMap((item) => item.evidenceLinks),
  ]).slice(0, 12);
  const bodyPreview =
    experimentItem && askItem
      ? `${experimentItem.label} growth ask: ${askItem.label}. Hypothesis: ${experimentItem.hypothesis} Metric: ${experimentItem.metric} Guardrail: ${experimentItem.guardrail} Audience note: ${options.audienceNote?.trim() || "MealPilot reviewer-ready Swiggy Builders launch proof."} Proof: ${proofLinks.join(", ")}`
      : `Unknown growth experiment or partner ask. Choose one published experiment and one published partnership ask before sending anything externally.`;

  return {
    generatedAt: new Date().toISOString(),
    experimentId: options.experimentId,
    askId: options.askId,
    decision,
    readinessScore: readinessFor(decision),
    experiment: experimentItem,
    ask: askItem,
    assets,
    metrics,
    proofLinks,
    handoffDraft: {
      to: "builders@swiggy.in",
      subject:
        experimentItem && askItem
          ? `MealPilot growth partnership ask: ${experimentItem.label} / ${askItem.label}`
          : "MealPilot growth partnership ask",
      bodyPreview,
    },
    checklist: [
      {
        id: "experiment_selected",
        label: experimentItem ? `${experimentItem.label} selected` : "Valid growth experiment selected",
        status: experimentItem ? experimentItem.status : "manual_input",
        owner: "MealPilot",
      },
      {
        id: "partner_ask_selected",
        label: askItem ? `${askItem.label} selected` : "Valid partnership ask selected",
        status: askItem ? askItem.status : "manual_input",
        owner: askItem?.owner ?? "Operator",
      },
      {
        id: "proof_attached",
        label: `${proofLinks.length} proof links attached`,
        status: proofLinks.length >= 5 ? "ready" : "manual_input",
        owner: "MealPilot",
      },
      {
        id: "swiggy_gate_preserved",
        label: "Swiggy approval gate preserved before public claims",
        status: decision === "swiggy_gate" ? "external_gate" : "ready",
        owner: decision === "swiggy_gate" ? "Swiggy" : "MealPilot",
      },
    ],
    assertions: [
      "Growth partnership ask composition prepares a local handoff packet only; it never sends email, opens Slack, requests dashboards, changes rate limits, or claims Swiggy approval.",
      "Co-marketing, feature placement, priority Slack, dashboards, higher limits, and partner manager asks stay external Swiggy gates.",
      ...center.assertions.slice(0, 2),
    ],
    externalGates: center.externalGates,
  };
}
