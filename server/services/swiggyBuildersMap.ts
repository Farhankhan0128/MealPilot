import type {
  SwiggyBuilderCtaCoverage,
  SwiggyBuilderPageCoverage,
  SwiggyBuildersMap,
  SwiggyInnovationOpportunity,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";

const officialSource = "https://mcp.swiggy.com/builders/";

const pages: SwiggyBuilderPageCoverage[] = [
  {
    id: "home",
    section: "home",
    title: "Builders Club home",
    url: officialSource,
    purpose: "Program overview for developers and enterprises building on Swiggy Food, Instamart, and Dineout.",
    mealPilotCoverage:
      "README, builder packet, demo studio, and Launch Center present MealPilot as a real end-user product, not a sandbox-only demo.",
    implementationStatus: "implemented",
  },
  {
    id: "start",
    section: "start",
    title: "Start",
    url: "https://mcp.swiggy.com/builders/docs/start/",
    purpose: "Route builders into developer, enterprise, or consumer paths.",
    mealPilotCoverage:
      "MealPilot follows the developer product path and includes notes for a later enterprise/voice-agent delegated-auth path.",
    implementationStatus: "implemented",
  },
  {
    id: "authenticate",
    section: "start",
    title: "Authenticate",
    url: "https://mcp.swiggy.com/builders/docs/start/authenticate/",
    purpose: "OAuth 2.1 PKCE, dynamic client registration, token lifecycle, scopes, and redirect URI rules.",
    mealPilotCoverage:
      "Server-owned PKCE start/callback routes, Credential Cockpit, DCR preview, exact redirect URI audit, in-memory token posture, 401 fail-closed behavior, and support for mcp:tools/resources/prompts.",
    implementationStatus: "implemented",
  },
  {
    id: "developer_quickstart",
    section: "start",
    title: "Developer quickstart",
    url: "https://mcp.swiggy.com/builders/docs/start/developer/",
    purpose: "First MCP tool call and path from localhost to staging to production.",
    mealPilotCoverage:
      "Local JSON-RPC mock mirrors tools/call, /api/mcp/:server routes can switch to staging/production once a bearer token exists, and /api/mcp-gateway shows cutover posture.",
    implementationStatus: "implemented",
  },
  {
    id: "build_recipes",
    section: "build",
    title: "Build recipes",
    url: "https://mcp.swiggy.com/builders/docs/build/",
    purpose: "End-to-end Food, Instamart, Dineout, and combined-agent journeys.",
    mealPilotCoverage:
      "The planner composes lunch delivery, grocery basket, and Dineout reservation recommendations in one session with per-action confirmation.",
    implementationStatus: "implemented",
  },
  {
    id: "multi_turn_state",
    section: "build",
    title: "Multi-turn cart state",
    url: "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
    purpose: "Refresh server-side carts at turn boundaries and avoid agent memory drift.",
    mealPilotCoverage:
      "Preflight and replay surfaces require get_food_cart/get_cart before confirmation, with restaurant/address switch warnings documented for staging hardening.",
    implementationStatus: "implemented",
  },
  {
    id: "voice_vs_chat",
    section: "build",
    title: "Voice vs chat",
    url: "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
    purpose: "Separate spoken response contracts from rich-card chat contracts.",
    mealPilotCoverage:
      "/api/sessions/:sessionId/surface returns chat and voice payloads with separate list limits, confirmation copy, and hidden internal IDs.",
    implementationStatus: "implemented",
  },
  {
    id: "widgets",
    section: "build",
    title: "Widgets",
    url: "https://mcp.swiggy.com/builders/docs/build/widgets/",
    purpose: "Planned iframe widget contracts, sandboxing, postMessage events, and semantic fallbacks.",
    mealPilotCoverage:
      "/api/sessions/:sessionId/widgets generates restaurant, menu/cart, product/cart, and slot-picker contracts with verified origin and fallback text.",
    implementationStatus: "implemented",
  },
  {
    id: "ship_to_production",
    section: "build",
    title: "Ship to production",
    url: "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
    purpose: "Retries, observability, idempotency, go-live checklist, and support escalation.",
    mealPilotCoverage:
      "Resilience Lab, Go-Live Gates, request IDs, support reports, and non-blind retry policy are exposed as API and UI evidence.",
    implementationStatus: "implemented",
  },
  {
    id: "reference",
    section: "reference",
    title: "Reference",
    url: "https://mcp.swiggy.com/builders/docs/reference/",
    purpose: "35 MCP tools across Food, Instamart, and Dineout.",
    mealPilotCoverage:
      "/api/mcp/catalog maps all 14 Food, 13 Instamart, and 8 Dineout tools; /api/mcp/tool-lab probes all 35 with JSON-RPC samples, response previews, safety gates, and retry classes.",
    implementationStatus: "implemented",
  },
  {
    id: "errors",
    section: "reference",
    title: "Error codes",
    url: "https://mcp.swiggy.com/builders/docs/reference/errors/",
    purpose: "Current failure envelope, auth errors, retry buckets, and planned symbolic error codes.",
    mealPilotCoverage:
      "Retry helpers, resilience drills, support report generation, and fail-closed staging behavior mirror the current error-envelope guidance.",
    implementationStatus: "implemented",
  },
  {
    id: "operate_access",
    section: "operate",
    title: "Access & onboarding",
    url: "https://mcp.swiggy.com/builders/docs/operate/access/",
    purpose: "Production access application expectations, staging access, production approval, and support channel.",
    mealPilotCoverage:
      "Builder package endpoint, Credential Cockpit, submission package, demo script, and docs folder provide the application packet and remaining external credential gates.",
    implementationStatus: "implemented",
  },
  {
    id: "rate_limits",
    section: "operate",
    title: "Rate limits",
    url: "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
    purpose: "Current v1.0 no-MCP-layer 429 posture, planned quotas, Retry-After contract, and upgrade path.",
    mealPilotCoverage:
      "Rate Limit Plan budgets per user/server, write tools, client-day volume, and tracking-poll cadence, plus a builders@swiggy.in upgrade mail.",
    implementationStatus: "implemented",
  },
  {
    id: "data_compliance",
    section: "operate",
    title: "Data & compliance",
    url: "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
    purpose: "DPDP posture, data residency, consent, audit logs, encryption, data-subject rights, and security contacts.",
    mealPilotCoverage:
      "Compliance evidence, privacy export/delete, minimal local profile storage, redacted audit details, and no training-data commitments are implemented.",
    implementationStatus: "implemented",
  },
  {
    id: "versioning",
    section: "operate",
    title: "Versioning",
    url: "https://mcp.swiggy.com/builders/docs/operate/versioning/",
    purpose: "SemVer commitment, 180-day deprecation flow, future URL version pinning, and experimental-tool posture.",
    mealPilotCoverage:
      "Version Monitor tracks v1 route pinning, implementation.version capture, and _meta.swiggy.deprecation alert readiness.",
    implementationStatus: "implemented",
  },
  {
    id: "support",
    section: "operate",
    title: "Support",
    url: "https://mcp.swiggy.com/builders/docs/operate/support/",
    purpose: "Escalation routes and incident payload expectations.",
    mealPilotCoverage:
      "/api/support/report creates a builders@swiggy.in mailto with session IDs, severity, and next steps.",
    implementationStatus: "implemented",
  },
  {
    id: "blog_launch",
    section: "blog",
    title: "Builders Club launch blog",
    url: "https://mcp.swiggy.com/builders/blog/2026-04-17-builders-club-launch/",
    purpose: "Program narrative and ecosystem positioning.",
    mealPilotCoverage:
      "The product plan positions MealPilot as an India-first household operating layer on top of Swiggy MCP, with video-ready proof artifacts.",
    implementationStatus: "documented",
  },
  {
    id: "footer_resources",
    section: "footer",
    title: "Footer resources",
    url: officialSource,
    purpose: "Developers, enterprises, guidelines, FAQ, apply, llms.txt, privacy policy, terms, and builders@swiggy.in.",
    mealPilotCoverage:
      "Documentation links these resources, exports a builder packet, and keeps legal/support links visible in README and docs.",
    implementationStatus: "documented",
  },
];

const ctas: SwiggyBuilderCtaCoverage[] = [
  {
    id: "start_building",
    label: "Start Building",
    location: "Homepage header, hero, and final CTA",
    userIntent: "Begin a localhost build without waiting for production approval.",
    mealPilotResponse: "Local mock mode, deterministic JSON-RPC routes, Docker/Render assets, and npm scripts let reviewers run immediately.",
    implementationStatus: "implemented",
  },
  {
    id: "see_whats_possible",
    label: "See What's Possible",
    location: "Homepage hero",
    userIntent: "Understand practical Food, Instamart, and Dineout use cases.",
    mealPilotResponse: "Demo scenarios, plan variants, pantry autopilot, group planning, reminders, widgets, evaluation lab, and resilience lab show the use-case spread.",
    implementationStatus: "implemented",
  },
  {
    id: "request_access",
    label: "Request access / Apply",
    location: "Homepage final CTA, footer, access docs",
    userIntent: "Submit production access material.",
    mealPilotResponse: "Builder package, submission package, markdown export, demo script, and readiness gates mirror the requested application fields.",
    implementationStatus: "documented",
  },
  {
    id: "send_demo",
    label: "Send Us a Demo",
    location: "Homepage final CTA and access docs",
    userIntent: "Share evidence that the product works end to end.",
    mealPilotResponse: "Demo Studio gives a scripted recording path with coverage, preflight, replay, submission fields, and support proof.",
    implementationStatus: "implemented",
  },
  {
    id: "docs",
    label: "Docs",
    location: "Global navigation and footer resources",
    userIntent: "Explore implementation guidance and reference pages.",
    mealPilotResponse: "This map and docs/swiggy-builders-research-and-product-plan.md keep the official docs mapped to product artifacts.",
    implementationStatus: "implemented",
  },
  {
    id: "contact_builders",
    label: "builders@swiggy.in",
    location: "Homepage, footer, support and operate pages",
    userIntent: "Ask questions, send demo links, request rate upgrades, or escalate incidents.",
    mealPilotResponse: "Support report, rate-limit upgrade link, and resilience runbook prefill Swiggy-ready mailto payloads.",
    implementationStatus: "implemented",
  },
  {
    id: "llms",
    label: "llms.txt / llms-full.txt",
    location: "Homepage and docs footer",
    userIntent: "Give coding agents clean source-of-truth docs.",
    mealPilotResponse: "The new Swiggy Builders map uses the llms index as a documentation inventory and records the researched pages in one artifact.",
    implementationStatus: "implemented",
  },
];

const opportunities: SwiggyInnovationOpportunity[] = [
  {
    id: "nutritional_budget_optimizer",
    title: "Nutritional Budget Optimizer",
    swiggyCapability: "Food search/menu + Instamart search_products + cart tools",
    userValue: "Balances daily protein, convenience, and weekly grocery spend instead of treating orders and groceries separately.",
    productSurface: "Nutrition & Budget Intelligence, planner variants, cart preflight, and pantry autopilot",
    nextBuild: "Use live Swiggy or merchant nutrition fields as a higher-confidence signal when they are available.",
    impactScore: 96,
  },
  {
    id: "occasion_orchestrator",
    title: "Occasion Orchestrator",
    swiggyCapability: "Dineout slots + Food dessert delivery + saved locations",
    userValue: "Plans a full evening with reservation, post-dinner dessert, travel-distance warnings, and separate confirmations.",
    productSurface: "Guest Collaboration & Calendar Center, combined plan, Dineout card, reminders, and voice/chat response contracts",
    nextBuild: "Replace local guest-vote and calendar artifacts with live collaboration channels after production domain and workspace approvals.",
    impactScore: 94,
  },
  {
    id: "luxury_review_workspace",
    title: "Luxury Review Workspace",
    swiggyCapability: "All Food, Instamart, and Dineout recipe tools with widgets, voice contracts, state guards, and production telemetry",
    userValue:
      "Turns every high-risk commerce moment into a polished review surface where users can inspect reservations, carts, baskets, recovery options, and confirmations before Swiggy mutations run.",
    productSurface: "Luxury Experience Workspace, Premium Concierge, Tool Contract Matrix, State Orchestrator, Widget Runtime, and Launch Center",
    nextBuild: "Swap semantic local cards for Swiggy-hosted widgets after iframe hosting is live and staging credentials validate the same confirmation gates.",
    impactScore: 95,
  },
  {
    id: "go_to_replenishment",
    title: "Go-To Replenishment",
    swiggyCapability: "Instamart your_go_to_items + search_products + update_cart",
    userValue: "Turns frequent household purchases into low-friction restock suggestions with budget and address safeguards.",
    productSurface: "Household Preference Graph, Pantry Autopilot, and group household profile",
    nextBuild: "Replace mock go-to signals with live Instamart order history and variant cadence once staging credentials are available.",
    impactScore: 93,
  },
  {
    id: "voice_safe_commerce",
    title: "Voice-Safe Commerce",
    swiggyCapability: "Shared OAuth across all servers plus compact tracking and status tools",
    userValue: "Lets busy users reorder, track, and book without hearing long IDs, menus, or unsafe hidden confirmations.",
    productSurface: "Agent Surface toggle and Evaluation Lab voice scenario",
    nextBuild: "Add speech transcript tests and ambient-surface rate shaping for mealtime burst traffic.",
    impactScore: 91,
  },
  {
    id: "builder_reviewer_console",
    title: "Builder Reviewer Console",
    swiggyCapability: "Official access, rate-limit, versioning, support, and widget contracts",
    userValue: "Makes approval faster by packaging evidence reviewers otherwise have to infer manually.",
    productSurface: "Reviewer Artifact Vault, Visual QA Center, Launch Center, Demo Studio, Production Evidence, and builder packet export",
    nextBuild: "Replace Visual QA Center manual screenshot gates with automated browser snapshots and attach the live staging transcript after credentials arrive.",
    impactScore: 90,
  },
];

export function buildSwiggyBuildersMap(): SwiggyBuildersMap {
  const servers = buildMcpCoverage();

  return {
    generatedAt: new Date().toISOString(),
    officialSource,
    totalOfficialTools: servers.reduce((sum, server) => sum + server.totalTools, 0),
    servers,
    pages,
    ctas,
    opportunities,
    integrationPrinciples: [
      "Treat Swiggy carts as server-side authority; refresh carts before mutation, confirmation, and order placement.",
      "Keep Food, Instamart, and Dineout actions separate at confirmation time even when one user request composes all three.",
      "Use one OAuth session across all Swiggy servers, but fail closed when a token is missing, expired, or revoked.",
      "Keep Dynamic Client Registration and redirect URI readiness visible before staging, without creating live external state in local tests.",
      "Tie every official tool to executable Tool Lab evidence before replacing local probes with staging traffic.",
      "Retry reads, tracking, coupons, and idempotent cart mutations, but use check-then-retry for place_food_order, checkout, and book_table.",
      "Render rich widgets only on chat/web surfaces and keep voice responses short, spoken-friendly, and free of raw IDs.",
      "Store the least possible data locally: user preferences with consent, redacted audit events, and Swiggy session IDs only for support.",
    ],
    credentialGates: [
      "Production client access is external to this repo and must come from Swiggy Builder Access approval.",
      "Dynamic Client Registration must be run against the final Swiggy environment and final exact-match redirect URI.",
      "Staging credentials are required before real Swiggy seeded-data verification can replace the local MCP mock.",
      "Production requires HTTPS exact-match redirect URIs, a working OAuth callback, and 48 hours of green staging evidence.",
      "Live orders, grocery checkout, and table bookings cannot be truthfully verified in mock mode; they remain simulated until credentials are issued.",
    ],
  };
}
