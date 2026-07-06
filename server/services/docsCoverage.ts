import type {
  SwiggyDocsCoverageItem,
  SwiggyDocsCoverageReport,
  SwiggyDocsSection,
  SwiggyServer,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";

const officialSource = "https://mcp.swiggy.com/builders/";
const llmsIndex = `${officialSource}llms.txt`;

type StaticDoc = Omit<SwiggyDocsCoverageItem, "url" | "markdownUrl"> & {
  markdownPath: string;
};

const staticDocs: StaticDoc[] = [
  {
    id: "docs_index",
    section: "build",
    title: "Swiggy Builders Club",
    markdownPath: "docs/index.md",
    officialSummary: "Build commerce into your AI agent with Food, Instamart, Dineout, and 35 MCP tools.",
    mealPilotSurface:
      "README, Launch Center, Premium Use Case Studio, Visual Dish Capture, Voice Commerce, Quality Loop, Ritual Autopilot, Website Atlas, and reviewer proof package the complete product story.",
    evidenceLinks: [
      "/api/premium-use-case-studio",
      "/api/swiggy-visual-dish-capture",
      "/api/swiggy-voice-commerce-center",
      "/api/swiggy-quality-loop-center",
      "/api/swiggy-ritual-autopilot-center",
      "/api/swiggy-website-atlas",
      "/api/reviewer-proof",
    ],
    status: "implemented",
  },
  {
    id: "multi_turn_cart_state",
    section: "build",
    title: "Multi-turn cart state",
    markdownPath: "docs/build/agent-patterns/multi-turn-state.md",
    officialSummary: "Refresh server-side cart truth across turns and avoid agent memory drift.",
    mealPilotSurface: "Cart Preflight, MCP Replay, and Route Optimizer require get_food_cart/get_cart before risky steps.",
    evidenceLinks: ["/api/sessions/:sessionId/preflight", "/api/swiggy-route-optimizer"],
    status: "implemented",
  },
  {
    id: "voice_vs_chat",
    section: "build",
    title: "Voice vs chat",
    markdownPath: "docs/build/agent-patterns/voice-vs-chat.md",
    officialSummary: "Shape Swiggy tool responses differently for TTS and rich chat cards.",
    mealPilotSurface: "Agent Surface returns separate chat and voice contracts with hidden raw IDs and confirmation copy.",
    evidenceLinks: ["/api/sessions/:sessionId/surface", "/api/evaluation-lab"],
    status: "implemented",
  },
  {
    id: "build",
    section: "build",
    title: "Build",
    markdownPath: "docs/build/index.md",
    officialSummary: "Recipes and patterns for shipping Swiggy MCP agents.",
    mealPilotSurface:
      "Premium Use Case Studio, Journey Compiler, Visual Dish Capture, Voice Commerce, Quality Loop, Ritual Autopilot, Planner, Demo Studio, widgets, preflight, and replay implement the recipe backbone.",
    evidenceLinks: [
      "/api/premium-use-case-studio",
      "/api/swiggy-journey-compiler",
      "/api/swiggy-visual-dish-capture",
      "/api/swiggy-voice-commerce-center",
      "/api/swiggy-quality-loop-center",
      "/api/swiggy-ritual-autopilot-center",
      "/api/demo-studio",
      "/api/sessions/:sessionId/replay",
    ],
    status: "implemented",
  },
  {
    id: "book_a_table",
    section: "build",
    title: "Book a table",
    markdownPath: "docs/build/recipes/book-a-table.md",
    officialSummary: "Dineout journey to find restaurants, check availability, and reserve.",
    mealPilotSurface: "Journey Compiler maps Dineout search, details, slots, booking confirmation, and get_booking_status retry guard.",
    evidenceLinks: ["/api/swiggy-journey-compiler", "/api/sessions/:sessionId/widgets"],
    status: "implemented",
  },
  {
    id: "combined_evening",
    section: "build",
    title: "Plan my evening (combined)",
    markdownPath: "docs/build/recipes/combined.md",
    officialSummary: "Compose Food delivery and Dineout reservations in one agent turn.",
    mealPilotSurface: "Journey Compiler maps the official Dineout plus Food evening flow and MealPilot's premium three-server reset.",
    evidenceLinks: ["/api/swiggy-journey-compiler", "/api/plan"],
    status: "implemented",
  },
  {
    id: "order_food",
    section: "build",
    title: "Order food end-to-end",
    markdownPath: "docs/build/recipes/order-food.md",
    officialSummary: "Canonical Food journey from address to placed order to tracking.",
    mealPilotSurface: "Journey Compiler maps Food address, restaurant, menu, cart, coupon, COD cap, placement, recovery, tracking, and support.",
    evidenceLinks: ["/api/swiggy-journey-compiler", "/api/plan", "/api/support/bridge"],
    status: "implemented",
  },
  {
    id: "order_groceries",
    section: "build",
    title: "Order groceries end-to-end",
    markdownPath: "docs/build/recipes/order-groceries.md",
    officialSummary: "Full Instamart journey from product search to cart, checkout, and tracking.",
    mealPilotSurface: "Journey Compiler maps Instamart address, go-to items, product search, cart, Rs 99 minimum, checkout, recovery, tracking, and support.",
    evidenceLinks: ["/api/swiggy-journey-compiler", "/api/pantry", "/api/plan"],
    status: "implemented",
  },
  {
    id: "ship_to_production",
    section: "build",
    title: "Ship to production",
    markdownPath: "docs/build/ship-to-production.md",
    officialSummary: "Retries, observability, idempotency, support escalation, and go-live checklist.",
    mealPilotSurface:
      "Resilience Lab, Error Intelligence, Support Bridge, SLO Incident Command, Runtime Telemetry, Traffic Readiness, Staging Credential Drill, Live Signal Calibration, Staging Certification Matrix, Staging Transcript Export, and Launch Bundle cover shipping proof.",
    evidenceLinks: [
      "/api/resilience",
      "/api/error-intelligence",
      "/api/slo-incident-command",
      "/api/traffic-readiness-plan",
      "/api/swiggy-staging-credential-drill",
      "/api/swiggy-live-signal-calibration",
      "/api/staging-certification-matrix",
      "/api/sessions/:sessionId/staging-transcript",
      "/api/production-launch-bundle",
    ],
    status: "implemented",
  },
  {
    id: "widgets",
    section: "build",
    title: "Widgets",
    markdownPath: "docs/build/widgets.md",
    officialSummary: "Render-ready UI fragments from Swiggy MCP servers with semantic fallbacks.",
    mealPilotSurface: "Widget contracts include iframe metadata, origin verification, sandbox policy, and fallback text.",
    evidenceLinks: ["/api/sessions/:sessionId/widgets", "/api/mcp/capability-registry"],
    status: "implemented",
  },
  {
    id: "access_onboarding",
    section: "operate",
    title: "Access & onboarding",
    markdownPath: "docs/operate/access.md",
    officialSummary: "Apply for production access and provide demo, security, and use-case details.",
    mealPilotSurface:
      "Access Dossier, Submission Package, Credential Cockpit, Staging Credential Drill, Live Signal Calibration, Data Governance Center, Traffic Readiness, Brand Compliance Kit, Builder Packet, and Launch Bundle prepare access review fields, volume, checks, rules, DPDP posture, legal readiness, and gates.",
    evidenceLinks: [
      "/api/swiggy-access-dossier",
      "/api/submission-package",
      "/api/credential-onboarding",
      "/api/swiggy-staging-credential-drill",
      "/api/swiggy-live-signal-calibration",
      "/api/data-governance-center",
      "/api/traffic-readiness-plan",
      "/api/brand-compliance-kit",
      "/api/builder-package.md",
    ],
    status: "implemented",
  },
  {
    id: "changelog",
    section: "operate",
    title: "Changelog",
    markdownPath: "docs/operate/changelog.md",
    officialSummary: "Release notes grouped by Swiggy MCP version.",
    mealPilotSurface:
      "Swiggy Operating Contract Center, Swiggy Upstream Watch, Version Monitor, SLO Incident Command, and Data Governance Center watch v1.1 status-page, rate-limit, error-code, deprecation, widget, DCR, v1.2/v2, and signed-manifest roadmap items.",
    evidenceLinks: [
      "/api/swiggy-operating-contract-center",
      "/api/swiggy-upstream-watch",
      "/api/version-monitor",
      "/api/slo-incident-command",
      "/api/data-governance-center",
      "/api/production-launch-bundle",
    ],
    status: "implemented",
  },
  {
    id: "data_compliance",
    section: "operate",
    title: "Data & compliance",
    markdownPath: "docs/operate/data-and-compliance.md",
    officialSummary: "DPDP, residency, consent, no-PII stance, audit logs, and security contacts.",
    mealPilotSurface:
      "Data Governance Center, Access Dossier, Compliance evidence, privacy export/delete, audit redaction, retention, DSR routing, token redaction, and safety docs map the policy.",
    evidenceLinks: [
      "/api/data-governance-center",
      "/api/swiggy-access-dossier",
      "/api/compliance-evidence",
      "/api/privacy/export",
      "/api/privacy",
    ],
    status: "implemented",
  },
  {
    id: "operate",
    section: "operate",
    title: "Operate",
    markdownPath: "docs/operate/index.md",
    officialSummary: "Partner contract for SLA, rate limits, data handling, versioning, and support.",
    mealPilotSurface:
      "Production Evidence, SLO Incident Command, Data Governance Center, Traffic Readiness, and Staging Certification consolidate uptime, latency, rate limits, capacity, compliance, versioning, support, traces, staging soak, and promotion gates.",
    evidenceLinks: [
      "/api/reviewer-proof",
      "/api/slo-incident-command",
      "/api/data-governance-center",
      "/api/traffic-readiness-plan",
      "/api/production-launch-bundle",
      "/api/staging-certification-matrix",
    ],
    status: "implemented",
  },
  {
    id: "rate_limits",
    section: "operate",
    title: "Rate limits",
    markdownPath: "docs/operate/rate-limits.md",
    officialSummary: "429 behavior, planned quotas, Retry-After, and larger allocation requests.",
    mealPilotSurface:
      "Swiggy Operating Contract Center, Rate Limit Plan, Traffic Readiness, Route Optimizer, and Staging Certification constrain calls, polling, Retry-After behavior, launch notice, and staging wave budgets.",
    evidenceLinks: [
      "/api/swiggy-operating-contract-center",
      "/api/rate-limit-plan",
      "/api/traffic-readiness-plan",
      "/api/swiggy-route-optimizer",
      "/api/staging-certification-matrix",
    ],
    status: "implemented",
  },
  {
    id: "sla_uptime",
    section: "operate",
    title: "SLA & uptime",
    markdownPath: "docs/operate/sla.md",
    officialSummary: "Service-level objectives for Swiggy MCP endpoints.",
    mealPilotSurface:
      "Swiggy Operating Contract Center, SLO Incident Command, Support Bridge SLA matrix, Observability traces, Traffic Readiness, and Staging Certification turn uptime expectations into latency targets, status-page fallback, maintenance notice, soak, launch-window, capacity, and escalation evidence.",
    evidenceLinks: [
      "/api/swiggy-operating-contract-center",
      "/api/slo-incident-command",
      "/api/support/bridge",
      "/api/observability/traces",
      "/api/traffic-readiness-plan",
      "/api/staging-certification-matrix",
    ],
    status: "implemented",
  },
  {
    id: "support",
    section: "operate",
    title: "Support",
    markdownPath: "docs/operate/support.md",
    officialSummary: "Support channels, incident severities, co-branding, and agent error reporting.",
    mealPilotSurface:
      "Swiggy Operating Contract Center, Support Report, Support Bridge, SLO Incident Command, Data Governance Center, and Brand Compliance Kit generate builders@swiggy.in, report_error payloads, redaction rules, DSR routing, severity comms, and co-branding guardrails.",
    evidenceLinks: [
      "/api/swiggy-operating-contract-center",
      "/api/support/report",
      "/api/support/bridge",
      "/api/slo-incident-command",
      "/api/data-governance-center",
      "/api/brand-compliance-kit",
    ],
    status: "implemented",
  },
  {
    id: "versioning",
    section: "operate",
    title: "Versioning",
    markdownPath: "docs/operate/versioning.md",
    officialSummary: "SemVer, deprecation window, breaking-change announcements, and experimental tools.",
    mealPilotSurface:
      "Swiggy Operating Contract Center, Version Monitor, Launch Bundle, and Resilience Lab track version pinning and deprecation metadata.",
    evidenceLinks: ["/api/swiggy-operating-contract-center", "/api/version-monitor", "/api/resilience"],
    status: "implemented",
  },
  {
    id: "reference",
    section: "reference",
    title: "Reference",
    markdownPath: "docs/reference/index.md",
    officialSummary: "Every Swiggy MCP tool grouped by server and journey stage.",
    mealPilotSurface: "MCP Catalog and Tool Lab expose all 35 tools with route classes, safety gates, and JSON-RPC samples.",
    evidenceLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab"],
    status: "implemented",
  },
  {
    id: "reference_errors",
    section: "reference",
    title: "Error codes",
    markdownPath: "docs/reference/errors.md",
    officialSummary: "Current failure envelope, retry classes, report_error guidance, and planned symbolic codes.",
    mealPilotSurface: "Error Intelligence models buckets, domain failures, planned codes, support actions, and retry ceilings.",
    evidenceLinks: ["/api/error-intelligence", "/api/support/bridge"],
    status: "implemented",
  },
  {
    id: "reference_food",
    section: "reference",
    title: "Food",
    markdownPath: "docs/reference/food/index.md",
    officialSummary: "Food delivery MCP server overview.",
    mealPilotSurface: "Food planner lane, catalog, Tool Lab probes, replay, tracking, and support coverage.",
    evidenceLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/plan"],
    status: "implemented",
  },
  {
    id: "reference_instamart",
    section: "reference",
    title: "Instamart",
    markdownPath: "docs/reference/instamart/index.md",
    officialSummary: "Instamart grocery and essentials MCP server overview.",
    mealPilotSurface: "Pantry autopilot, grocery planner lane, catalog, Tool Lab probes, replay, tracking, and support.",
    evidenceLinks: ["/api/pantry", "/api/mcp/tool-lab", "/api/plan"],
    status: "implemented",
  },
  {
    id: "reference_dineout",
    section: "reference",
    title: "Dineout",
    markdownPath: "docs/reference/dineout/index.md",
    officialSummary: "Dineout restaurant discovery and table booking MCP server overview.",
    mealPilotSurface: "Reservation planner lane, slot widgets, booking confirmation, catalog, and Tool Lab probes.",
    evidenceLinks: ["/api/plan", "/api/sessions/:sessionId/widgets", "/api/mcp/tool-lab"],
    status: "implemented",
  },
  {
    id: "authenticate",
    section: "start",
    title: "Authenticate",
    markdownPath: "docs/start/authenticate.md",
    officialSummary: "OAuth 2.1 with PKCE, credential flow, expired-token handling, and scopes.",
    mealPilotSurface:
      "Credential Cockpit, OAuth Status, Staging Credential Drill, Live Signal Calibration, Data Governance Center, PKCE start/callback, fail-closed gateway, and error intelligence cover auth posture and token redaction.",
    evidenceLinks: [
      "/api/credential-onboarding",
      "/api/auth/swiggy/status",
      "/api/swiggy-staging-credential-drill",
      "/api/swiggy-live-signal-calibration",
      "/api/data-governance-center",
      "/api/auth/swiggy/start",
      "/api/mcp-gateway",
    ],
    status: "implemented",
  },
  {
    id: "coding_agents",
    section: "start",
    title: "Coding agents",
    markdownPath: "docs/start/coding-agents.md",
    officialSummary: "Plug Builders Club docs into coding agents before writing Swiggy integrations.",
    mealPilotSurface:
      "AI Client Connect Kit emits coding-agent rule files; Swiggy Upstream Watch records llms.txt, llms-full.txt, Markdown page, and smoke-test retrieval contracts.",
    evidenceLinks: ["/api/ai-client-connect-kit", "/api/swiggy-upstream-watch", "/api/swiggy-docs-coverage"],
    status: "implemented",
  },
  {
    id: "consumer_index",
    section: "start",
    title: "Use Swiggy in your AI client",
    markdownPath: "docs/start/consumer/index.md",
    officialSummary: "Paste a config, complete OAuth, and use Swiggy MCP from an AI client.",
    mealPilotSurface: "AI Client Connect Kit emits the six-client config inventory plus OAuth, privacy, and verification steps.",
    evidenceLinks: ["/api/ai-client-connect-kit", "/api/mcp/capability-registry"],
    status: "implemented",
  },
  {
    id: "consumer_ai_client",
    section: "start",
    title: "Connect your AI client",
    markdownPath: "docs/start/consumer/use-in-ai-client.md",
    officialSummary: "Configurations for Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, and MCP clients.",
    mealPilotSurface: "AI Client Connect Kit generates copy-ready client configs, setup steps, verification prompts, and privacy notes.",
    evidenceLinks: ["/api/ai-client-connect-kit", "/api/mcp-gateway"],
    status: "implemented",
  },
  {
    id: "build_agent",
    section: "start",
    title: "Build an agent",
    markdownPath: "docs/start/developer/build-an-agent.md",
    officialSummary: "Working code to wire Swiggy MCP into an agent framework.",
    mealPilotSurface:
      "Developer Quickstart Workbench, Express MCP gateway, JSON-RPC mock, typed client fetchers, and Tool Lab provide the app-level implementation.",
    evidenceLinks: ["/api/swiggy-developer-quickstart", "/api/mcp-gateway", "/api/mcp/tool-lab", "/api/openapi.json"],
    status: "implemented",
  },
  {
    id: "developer_quickstart",
    section: "start",
    title: "Developer quickstart",
    markdownPath: "docs/start/developer/index.md",
    officialSummary: "Zero to first successful Swiggy tool call.",
    mealPilotSurface:
      "Developer Quickstart Workbench, local mock mode, npm scripts, Docker/Render assets, and production smoke create the reviewer quickstart.",
    evidenceLinks: ["/api/swiggy-developer-quickstart", "/api/health", "/api/mcp/food", "/api/mcp/tool-lab"],
    status: "implemented",
  },
  {
    id: "delegated_auth",
    section: "start",
    title: "Delegated auth",
    markdownPath: "docs/start/enterprise/delegated-auth.md",
    officialSummary: "OAuth 2.1 on-behalf-of flow for multi-tenant platforms.",
    mealPilotSurface:
      "Enterprise Delegated Auth Center models OBO PKCE, DCR preregistration, per-user token storage, troubleshooting, logout, architecture review, and partner gates.",
    evidenceLinks: ["/api/enterprise-delegated-auth", "/api/credential-onboarding", "/api/data-governance-center"],
    status: "implemented",
  },
  {
    id: "enterprise_index",
    section: "start",
    title: "Power an agent platform",
    markdownPath: "docs/start/enterprise/index.md",
    officialSummary: "White-glove onboarding for platforms operating Swiggy on behalf of many users.",
    mealPilotSurface:
      "Enterprise Platform Center turns platform-operator application, tenant boundaries, delegated auth, quota profiles, contract support, audit exports, staging soak, and co-branding gates into a first-class artifact.",
    evidenceLinks: ["/api/enterprise-platform-center", "/api/enterprise-delegated-auth", "/api/production-launch-bundle"],
    status: "implemented",
  },
  {
    id: "start",
    section: "start",
    title: "Start",
    markdownPath: "docs/start/index.md",
    officialSummary: "Pick developer, enterprise, or AI-client consumer path.",
    mealPilotSurface: "Launch Center covers developer path now and documents enterprise/consumer expansion lanes.",
    evidenceLinks: ["/api/swiggy-builders-map", "/api/swiggy-docs-coverage"],
    status: "implemented",
  },
  {
    id: "what_is_swiggy_mcp",
    section: "start",
    title: "What is Swiggy MCP?",
    markdownPath: "docs/start/what-is-swiggy-mcp.md",
    officialSummary: "What Builders Club offers, who it is for, and when to use it.",
    mealPilotSurface: "Research plan and README position MealPilot as a Swiggy-native household food operating layer.",
    evidenceLinks: ["/api/swiggy-builders-map", "/api/builder-package.md"],
    status: "implemented",
  },
  {
    id: "launch_blog",
    section: "blog",
    title: "Swiggy Announces Builders Club",
    markdownPath: "blog/2026-04-17-builders-club-launch.md",
    officialSummary: "Ecosystem narrative for Swiggy MCP builders.",
    mealPilotSurface:
      "Swiggy Builders Launch Story Center reconciles the launch-blog ecosystem narrative with the current 35-tool docs snapshot, reviewer demo journey, showcase assets, CTAs, and co-marketing gates.",
    evidenceLinks: ["/api/swiggy-builders-launch-story", "/api/swiggy-builders-map", "/api/production-launch-bundle"],
    status: "implemented",
  },
];

function renderedUrl(markdownPath: string) {
  const renderedPath = markdownPath.endsWith("index.md")
    ? markdownPath.replace(/index\.md$/, "")
    : markdownPath.replace(/\.md$/, "/");
  return `${officialSource}${renderedPath}`;
}

function markdownUrl(markdownPath: string) {
  return `${officialSource}${markdownPath}`;
}

function toItem(doc: StaticDoc): SwiggyDocsCoverageItem {
  return {
    id: doc.id,
    section: doc.section,
    title: doc.title,
    url: renderedUrl(doc.markdownPath),
    markdownUrl: markdownUrl(doc.markdownPath),
    officialSummary: doc.officialSummary,
    mealPilotSurface: doc.mealPilotSurface,
    evidenceLinks: doc.evidenceLinks,
    status: doc.status,
  };
}

function serverLabel(server: SwiggyServer) {
  if (server === "food") return "Food";
  if (server === "instamart") return "Instamart";
  return "Dineout";
}

function toolDocs(): SwiggyDocsCoverageItem[] {
  return buildMcpCoverage().flatMap((server) =>
    server.tools.map((tool) => ({
      id: `reference_${tool.server}_${tool.tool}`,
      section: "reference" as const,
      title: tool.tool,
      url: renderedUrl(`docs/reference/${tool.server}/${tool.tool}.md`),
      markdownUrl: markdownUrl(`docs/reference/${tool.server}/${tool.tool}.md`),
      officialSummary: `${serverLabel(tool.server)} ${tool.stage} tool on ${tool.endpoint}.`,
      mealPilotSurface: `${tool.evidence} Tool Lab includes JSON-RPC request, response preview, safety gate, retry class, and product use case.`,
      evidenceLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab"],
      status: "implemented" as const,
    })),
  );
}

function scoreFor(pages: SwiggyDocsCoverageItem[]) {
  const value = pages.reduce((sum, page) => {
    if (page.status === "implemented") return sum + 1;
    if (page.status === "documented") return sum + 0.75;
    return sum + 0.4;
  }, 0);
  return Math.round((value / pages.length) * 100);
}

function summarizeSection(section: SwiggyDocsSection, pages: SwiggyDocsCoverageItem[]) {
  const sectionPages = pages.filter((page) => page.section === section);
  return {
    section,
    total: sectionPages.length,
    implemented: sectionPages.filter((page) => page.status === "implemented").length,
    documented: sectionPages.filter((page) => page.status === "documented").length,
    requiresCredentials: sectionPages.filter((page) => page.status === "requires_credentials").length,
  };
}

export function buildSwiggyDocsCoverage(): SwiggyDocsCoverageReport {
  const pages = [...staticDocs.map(toItem), ...toolDocs()].sort((left, right) => {
    const sectionCompare = left.section.localeCompare(right.section);
    return sectionCompare === 0 ? left.title.localeCompare(right.title) : sectionCompare;
  });

  return {
    generatedAt: new Date().toISOString(),
    officialSource,
    llmsIndex,
    score: scoreFor(pages),
    totalPages: pages.length,
    sourceInventory: {
      llmsLinkedPages: pages.length,
      headerLinks: 7,
      footerLinks: 8,
      ctas: 7,
    },
    sections: (["start", "build", "operate", "reference", "blog"] satisfies SwiggyDocsSection[]).map((section) =>
      summarizeSection(section, pages),
    ),
    pages,
    assertions: [
      `${pages.length} Swiggy llms.txt-linked documentation pages are mapped to MealPilot artifacts.`,
      "Every Food, Instamart, and Dineout tool reference page is generated from the same 35-tool coverage source used by MCP Catalog.",
      "Start, Build, Operate, Reference, Blog, header, footer, and CTA surfaces have API-visible evidence links.",
      "Consumer AI-client, coding-agent, and SDK setup pages are backed by the AI Client Connect Kit; enterprise delegated auth is modeled in its own center with partnership gates explicit.",
    ],
    remainingExternalGates: [
      "Live production access form submission and approval remain outside this local repository.",
      "Enterprise delegated auth requires platform-operator approval, Swiggy-issued credentials, partner capacity ceilings, and approved redirect URIs.",
      "Future llms.txt changes should be re-browsed and reflected in this static coverage report before access submission.",
    ],
  };
}
