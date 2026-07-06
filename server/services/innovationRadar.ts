import type {
  SwiggyInnovationInput,
  SwiggyInnovationLane,
  SwiggyInnovationPhase,
  SwiggyInnovationRadarReport,
} from "../../src/domain/types.js";

const buildersBase = "https://mcp.swiggy.com/builders/";

const officialInputs: SwiggyInnovationInput[] = [
  {
    id: "developers_build_ideas",
    label: "Developer build ideas",
    officialSignal:
      "Swiggy highlights voice agents, auto-restock, group ordering, dietary planners, reservation agents, and screenshot-to-order agents as strong developer lanes.",
    sourceUrl: `${buildersBase}developers/`,
    mealPilotResponse:
      "MealPilot turns those examples into concrete Launch Center lanes with MCP toolchains, response contracts, telemetry, and safety gates.",
  },
  {
    id: "enterprise_backend",
    label: "Enterprise commerce backend",
    officialSignal:
      "The enterprise track positions Swiggy Food, Instamart, and Dineout as a commerce backend with production APIs, enterprise rate limits, support, and growth partnership.",
    sourceUrl: `${buildersBase}enterprises/`,
    mealPilotResponse:
      "MealPilot keeps a consumer-grade product now while packaging delegated auth, tenant support, rate-limit, and co-branding readiness for enterprise expansion.",
  },
  {
    id: "access_ground_rules",
    label: "Production access and ground rules",
    officialSignal:
      "The access page asks for use case, architecture, redirect URIs, static IPs, security contact, data handling, traffic plan, and respect for brand, privacy, rate limits, and platform scope.",
    sourceUrl: `${buildersBase}access/`,
    mealPilotResponse:
      "Submission Console, Access Dossier, Source Intelligence, and Production Launch Bundle convert each access requirement into prepared evidence or an explicit external gate.",
  },
  {
    id: "support_contract",
    label: "Support and incident model",
    officialSignal:
      "Operate support docs define builders@swiggy.in, security@swiggy.in, report_error tools, S0-S3 response expectations, co-branding rules, and docs feedback loops.",
    sourceUrl: `${buildersBase}docs/operate/support/`,
    mealPilotResponse:
      "Support Bridge, Error Intelligence, SLO Incident Command, Audit Ledger, and Brand Compliance turn support into in-product, user-safe workflows.",
  },
  {
    id: "reference_contract",
    label: "All-server reference contract",
    officialSignal:
      "Reference docs expose Food, Instamart, and Dineout as 35 callable MCP tools with shared error handling and tool-specific commerce constraints.",
    sourceUrl: `${buildersBase}docs/reference/`,
    mealPilotResponse:
      "Tool Lab, Tool Contract Matrix, Scenario Runner, State Orchestrator, and Commercial Action Guard make the full reference contract executable locally.",
  },
];

const opportunityLanes: SwiggyInnovationLane[] = [
  {
    id: "voice_dinner_concierge",
    label: "Voice Dinner Concierge",
    userPromise: "A user can speak a short dinner ask and get three safe options with totals, confirmations, and no raw IDs.",
    sourceSignals: ["developers_build_ideas", "reference_contract"],
    swiggyServers: ["food", "instamart"],
    swiggyTools: ["food.search_restaurants", "food.search_menu", "food.update_food_cart", "food.get_food_cart", "instamart.your_go_to_items"],
    productSurfaces: ["/api/channel-multimodal-studio", "/api/mcp/state-orchestrator", "/api/sessions/:sessionId/surface?surface=voice"],
    routeOptimization: "Use saved address once, top-three spoken choices, and authoritative cart refresh before every commercial confirmation.",
    premiumDifferentiator: "Voice feels like a private household steward rather than a chatbot reading a menu.",
    status: "ready",
  },
  {
    id: "pantry_autopilot",
    label: "Pantry Autopilot",
    userPromise: "MealPilot predicts staple gaps, builds Instamart baskets, and pairs groceries with Food fallback meals.",
    sourceSignals: ["developers_build_ideas", "reference_contract"],
    swiggyServers: ["instamart", "food"],
    swiggyTools: ["instamart.your_go_to_items", "instamart.search_products", "instamart.update_cart", "instamart.get_cart", "food.search_menu"],
    productSurfaces: ["/api/nutrition-budget-intelligence", "/api/household-preference-graph", "/api/pantry"],
    routeOptimization: "Seed with go-to items, search only pantry gaps, then replace the whole cart once instead of item-by-item chatter.",
    premiumDifferentiator: "Replenishment is tied to actual meal plans, not generic grocery subscriptions.",
    status: "ready",
  },
  {
    id: "group_office_lunch",
    label: "Group Office Lunch",
    userPromise: "Teams can collect budgets, diets, and allergies, then place one optimized Swiggy Food cart after explicit confirmation.",
    sourceSignals: ["developers_build_ideas", "support_contract"],
    swiggyServers: ["food"],
    swiggyTools: ["food.search_restaurants", "food.get_restaurant_menu", "food.update_food_cart", "food.get_food_cart", "food.place_food_order"],
    productSurfaces: ["/api/group", "/api/channel-multimodal-studio", "/api/mcp/commercial-action-guard"],
    routeOptimization: "Filter restaurants once by shared location, reuse menu pages, and gate the final cart with a single group-readable summary.",
    premiumDifferentiator: "A workplace lunch tool that respects humans first: allergy, budget, and fairness constraints are first-class.",
    status: "ready",
  },
  {
    id: "dineout_first_evening",
    label: "Dineout-First Evening Planner",
    userPromise: "MealPilot books a table first, then plans pre- or post-dinner Food and Instamart actions around the reservation.",
    sourceSignals: ["developers_build_ideas", "reference_contract"],
    swiggyServers: ["dineout", "food", "instamart"],
    swiggyTools: [
      "dineout.search_restaurants_dineout",
      "dineout.get_available_slots",
      "dineout.book_table",
      "food.search_menu",
      "instamart.search_products",
    ],
    productSurfaces: ["/api/premium-concierge-itinerary", "/api/guest-collaboration-calendar", "/api/swiggy-journey-compiler"],
    routeOptimization: "Resolve slot scarcity first, then build Food and Instamart side quests as reminders rather than unsafe scheduled orders.",
    premiumDifferentiator: "The evening is orchestrated like a concierge itinerary rather than separate commerce tasks.",
    status: "ready",
  },
  {
    id: "screenshot_to_order",
    label: "Screenshot-to-Order Taste Match",
    userPromise: "A user can show a dish inspiration and MealPilot can map it to Swiggy menu/product candidates with disclosure and confirmation.",
    sourceSignals: ["developers_build_ideas", "access_ground_rules"],
    swiggyServers: ["food", "instamart"],
    swiggyTools: ["food.search_menu", "food.get_restaurant_menu", "instamart.search_products", "food.update_food_cart"],
    productSurfaces: ["/api/channel-multimodal-studio", "/api/visual-qa-center", "/api/brand-compliance-kit"],
    routeOptimization: "Convert images into labels locally, search by labels, and never store raw images or imply exact merchant availability before tool reads.",
    premiumDifferentiator: "Visual discovery becomes safe inspiration-to-cart planning, not a brittle image matcher.",
    status: "staging_gate",
  },
  {
    id: "care_meal_protocol",
    label: "Care Meal Protocol",
    userPromise: "Families can send recovery, new-parent, elder-care, or exam-week meals with dietary and support-safe audit trails.",
    sourceSignals: ["access_ground_rules", "support_contract"],
    swiggyServers: ["food", "instamart"],
    swiggyTools: ["food.search_menu", "food.get_food_cart", "instamart.search_products", "instamart.checkout", "food.report_error"],
    productSurfaces: ["/api/premium-use-case-studio", "/api/audit-ledger", "/api/support/bridge"],
    routeOptimization: "Keep addresses and notes minimal, separate empathy copy from merchant data, and generate support packets without raw PII.",
    premiumDifferentiator: "MealPilot turns Swiggy commerce into trusted care logistics with privacy and consent boundaries.",
    status: "ready",
  },
  {
    id: "enterprise_tenant_lane",
    label: "Enterprise Tenant Lane",
    userPromise: "A partner can embed MealPilot-style commerce with per-user OAuth, tenant policies, support SLAs, and co-branded surfaces.",
    sourceSignals: ["enterprise_backend", "support_contract", "access_ground_rules"],
    swiggyServers: ["food", "instamart", "dineout"],
    swiggyTools: ["food.get_addresses", "instamart.get_addresses", "dineout.get_saved_locations", "food.report_error", "instamart.report_error", "dineout.report_error"],
    productSurfaces: ["/api/enterprise-delegated-auth", "/api/data-governance-center", "/api/slo-incident-command"],
    routeOptimization: "Broker per-user tokens server-side, isolate tenant policies, and route every support packet with tenant-safe identifiers.",
    premiumDifferentiator: "A premium consumer product can become an enterprise commerce operating layer without rewriting the Swiggy integration.",
    status: "partner_gate",
  },
  {
    id: "builder_showcase_loop",
    label: "Builder Showcase Loop",
    userPromise: "Every demo, incident, metric, and roadmap item is packaged so Swiggy can review and feature the product quickly.",
    sourceSignals: ["developers_build_ideas", "support_contract", "access_ground_rules"],
    swiggyServers: ["food", "instamart", "dineout"],
    swiggyTools: ["food.report_error", "instamart.report_error", "dineout.report_error"],
    productSurfaces: ["/api/reviewer-artifact-vault", "/api/production-launch-bundle", "/api/swiggy-source-intelligence"],
    routeOptimization: "Keep evidence links stable and reuse the same proof packet for access review, support, hiring, and growth partnership.",
    premiumDifferentiator: "The product markets itself through proof, not claims.",
    status: "ready",
  },
];

const buildPhases: SwiggyInnovationPhase[] = [
  {
    id: "local_os",
    label: "Local Product OS",
    status: "ready",
    focus: "Run all 35 tools through local JSON-RPC evidence, premium UI, docs, tests, and support-safe logs.",
    proofLinks: ["/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/reviewer-artifact-vault"],
    exitCriteria: ["35/35 local tool proof", "Source and docs coverage above 90", "Production verifier passes"],
  },
  {
    id: "access_submission",
    label: "Access Submission",
    status: "ready",
    focus: "Package use case, architecture, redirect URI, traffic plan, data handling, demo, and source drift proof.",
    proofLinks: ["/api/submission-console", "/api/swiggy-access-dossier", "/api/production-launch-bundle"],
    exitCriteria: ["Demo recorded", "GitHub link attached", "Manual access form submitted"],
  },
  {
    id: "credentialed_staging",
    label: "Credentialed Staging",
    status: "staging_gate",
    focus: "Replay read-only, mutation, commercial, support, and telemetry waves with issued Swiggy staging credentials.",
    proofLinks: ["/api/mcp/staging-cutover", "/api/staging-certification-matrix", "/api/sessions/:sessionId/staging-transcript"],
    exitCriteria: ["OAuth token exchange succeeds", "48-hour soak green", "No duplicate commercial actions"],
  },
  {
    id: "premium_launch",
    label: "Premium Launch",
    status: "partner_gate",
    focus: "Go live with guarded commerce, staged rollout, status communications, and Swiggy co-branding approval.",
    proofLinks: ["/api/traffic-readiness-plan", "/api/slo-incident-command", "/api/brand-compliance-kit"],
    exitCriteria: ["Production credentials issued", "Co-branding assets approved", "Capacity and incident contacts confirmed"],
  },
  {
    id: "growth_compounding",
    label: "Growth Compounding",
    status: "partner_gate",
    focus: "Use analytics, experiments, hiring/showcase hooks, and enterprise tenant lanes to compound differentiation.",
    proofLinks: ["/api/swiggy-growth-partnership", "/api/evaluation-lab", "/api/enterprise-delegated-auth"],
    exitCriteria: ["Partner dashboard access", "Feature/showcase approval", "Enterprise contract if needed"],
  },
];

export function buildSwiggyInnovationRadar(): SwiggyInnovationRadarReport {
  const readyLanes = opportunityLanes.filter((lane) => lane.status === "ready").length;
  const gatedLanes = opportunityLanes.length - readyLanes;
  const readyPhases = buildPhases.filter((phase) => phase.status === "ready").length;
  const score = Math.round(((readyLanes / opportunityLanes.length) * 55 + (readyPhases / buildPhases.length) * 25 + 20));

  return {
    generatedAt: new Date().toISOString(),
    score,
    opportunityCount: opportunityLanes.length,
    officialInputs,
    opportunityLanes,
    routeOptimizations: [
      "Resolve saved addresses once per server family, then reuse them until the user changes location.",
      "Refresh Food and Instamart carts immediately before any commercial confirmation.",
      "Prefer Instamart your_go_to_items for reorder-style flows and only search for missing pantry gaps.",
      "Plan Dineout slots before Food/Instamart side quests when the evening depends on table availability.",
      "Use report_error and support packets as user-facing recovery affordances, not just developer diagnostics.",
      "Keep voice responses to three options, no raw IDs, and explicit totals before confirmation.",
      "Treat image inputs as local labels and never store raw screenshots unless a future consented media workflow requires it.",
    ],
    buildPhases,
    differentiators: [
      "Three-server orchestration: Food, Instamart, and Dineout are planned together instead of as siloed order flows.",
      "Proof-led product: every premium claim links to an API evidence surface, verifier assertion, or explicit external gate.",
      "Care-grade privacy: support, audit, and personalization avoid raw tokens, payment data, full addresses, and full Swiggy payload storage.",
      "Luxury without fragility: concierge itineraries and visual/voice modes are backed by cart truth, confirmation gates, and recovery reads.",
      "Enterprise-ready path: the same consumer product can graduate into delegated auth, tenant policy, and partner SLAs.",
    ],
    nextBuilds: [
      "Record the premium demo using the Innovation Radar lanes as the narrative spine.",
      "Attach Source Intelligence, Deep Site Map, Innovation Radar, and Production Launch Bundle to the Swiggy access submission.",
      "When staging credentials arrive, replay the top three ready lanes through Staging Certification before enabling screenshots or enterprise lanes.",
      "Ask Swiggy for feedback on voice, screenshot-to-order, and enterprise tenant lanes as distinct growth partnership proposals.",
    ],
    assertions: [
      `Innovation Radar maps ${opportunityLanes.length} differentiated product lanes to official Swiggy source signals.`,
      "Every lane names Swiggy servers, MCP tools, product surfaces, route optimizations, and premium differentiators.",
      "Staging-only and partner-only opportunities stay explicitly gated until Swiggy credentials or approvals exist.",
      "The roadmap turns Swiggy's public developer ideas into a MealPilot-specific product strategy rather than a generic API wrapper.",
    ],
    externalGates: [
      `${gatedLanes} opportunity lanes need staging credentials, hosted widget/vision validation, or Swiggy partnership approval before production claims.`,
      "Actual access-form submission, credential issuance, partner-manager assignment, and co-branding assets remain Swiggy/operator actions.",
      "Enterprise tenant lane requires delegated-auth approval, contract terms, and capacity quotas.",
    ],
  };
}
