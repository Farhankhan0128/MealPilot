import type {
  SwiggyUpstreamAction,
  SwiggyUpstreamRelease,
  SwiggyUpstreamRoadmapItem,
  SwiggyUpstreamWatchReport,
  SwiggyUpstreamWatchStatus,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/changelog/",
  "https://mcp.swiggy.com/builders/docs/start/coding-agents/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/llms-full.txt",
  "https://mcp.swiggy.com/builders/docs/operate/versioning/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
];

function statusScore(status: SwiggyUpstreamWatchStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.55;
}

function scoreFor(items: Array<{ status: SwiggyUpstreamWatchStatus }>) {
  const score = items.reduce((sum, item) => sum + statusScore(item.status), 0);
  return Math.round((score / items.length) * 100);
}

function releaseTimeline(): SwiggyUpstreamRelease[] {
  return [
    {
      id: "v1_0_launch",
      version: "v1.0 - 2026-04",
      status: "ready",
      officialSignal: "Builders Club launch shipped three MCP servers, OAuth 2.1 PKCE, Streamable HTTP, region policy, and docs index files.",
      shipped: [
        "Food MCP server with 14 tools",
        "Instamart MCP server with 13 tools",
        "Dineout MCP server with 8 tools",
        "OAuth 2.1 authorization-code flow with PKCE S256",
        "Streamable HTTP transport",
        "India primary region with Singapore failover",
        "Food widget registry marked hasWidgets=true",
        "llms.txt and llms-full.txt for agent-driven discovery",
      ],
      knownLimitations: [
        "Cash-on-delivery only on Food ordering",
        "Food cart cap Rs 1000 for Builders Club origin orders",
        "No refresh-token issuance in v1.0",
        "MCP-layer rate limiting not yet enforced",
        "Symbolic error.code registry not yet populated",
        "_meta.swiggy.deprecation not yet emitted",
        "Instamart and Dineout widgets not yet shipped",
        "Status page not yet live",
      ],
      mealPilotImpact:
        "MealPilot already models all 35 tools, PKCE, Streamable HTTP routing, COD cap, retry/message-based errors, telemetry, widgets, and staging gates.",
      evidenceLinks: [
        "/api/mcp/catalog",
        "/api/mcp/tool-lab",
        "/api/auth/swiggy/status",
        "/api/error-intelligence",
        "/api/data-governance-center",
      ],
    },
  ];
}

function roadmapItems(): SwiggyUpstreamRoadmapItem[] {
  return [
    {
      id: "refresh_tokens",
      version: "v1.1",
      item: "Refresh tokens",
      status: "watch",
      officialSignal: "Swiggy documents refresh-token issuance as planned after v1.0.",
      mealPilotReadiness: "OAuth Status and Gateway currently rerun authorization; add rolling refresh when /auth/token issues refresh_token.",
      owner: "Joint",
      evidenceLinks: ["/api/auth/swiggy/status", "/api/mcp-gateway"],
    },
    {
      id: "status_page",
      version: "v1.1",
      item: "MCP status page",
      status: "watch",
      officialSignal: "status.swiggy.com/mcp is planned for v1.1.",
      mealPilotReadiness: "SLO Incident Command already reserves status-page fallback and incident evidence.",
      owner: "Swiggy",
      evidenceLinks: ["/api/slo-incident-command", "/api/support/bridge"],
    },
    {
      id: "rate_limit_headers",
      version: "v1.1",
      item: "MCP-layer rate limiting and Retry-After headers",
      status: "ready",
      officialSignal: "Swiggy plans X-RateLimit-* headers and 429/Retry-After at the MCP layer.",
      mealPilotReadiness: "Traffic Readiness, Resilience Lab, and Route Optimizer already honor Retry-After and cap retries.",
      owner: "Joint",
      evidenceLinks: ["/api/traffic-readiness-plan", "/api/resilience", "/api/swiggy-route-optimizer"],
    },
    {
      id: "symbolic_error_codes",
      version: "v1.1",
      item: "Symbolic error.code registry",
      status: "ready",
      officialSignal: "Swiggy plans a populated symbolic error.code registry.",
      mealPilotReadiness: "Error Intelligence watches planned core/domain codes while branching on HTTP status and message in v1.0.",
      owner: "Joint",
      evidenceLinks: ["/api/error-intelligence", "/api/support/bridge"],
    },
    {
      id: "deprecation_meta",
      version: "v1.1",
      item: "_meta.swiggy.deprecation response field",
      status: "ready",
      officialSignal: "Swiggy plans deprecation metadata in MCP responses.",
      mealPilotReadiness: "Version Monitor and Resilience Lab already reserve alerting and migration runbooks.",
      owner: "Joint",
      evidenceLinks: ["/api/version-monitor", "/api/resilience"],
    },
    {
      id: "hosted_food_widgets",
      version: "v1.1",
      item: "Hosted Food widget iframe layer and custom theming",
      status: "watch",
      officialSignal: "Food widget registry exists in v1.0; hosted iframe layer and theming are planned for v1.1.",
      mealPilotReadiness: "Widget contracts expose Food restaurant/cart surfaces, sandbox, origin verification, events, and semantic fallbacks.",
      owner: "Joint",
      evidenceLinks: ["/api/sessions/:sessionId/widgets", "/api/brand-compliance-kit"],
    },
    {
      id: "dcr",
      version: "v1.1",
      item: "OAuth Dynamic Client Registration",
      status: "ready",
      officialSignal: "Swiggy roadmap lists DCR in v1.1 while docs already describe POST /auth/register.",
      mealPilotReadiness: "Credential Cockpit builds DCR payloads and keeps live registration as an intentional operator action.",
      owner: "Joint",
      evidenceLinks: ["/api/credential-onboarding", "/api/auth/swiggy/status"],
    },
    {
      id: "instamart_dineout_widgets",
      version: "v1.2",
      item: "Instamart and Dineout widgets",
      status: "watch",
      officialSignal: "Swiggy roadmap lists Instamart and Dineout widgets for v1.2.",
      mealPilotReadiness:
        "MealPilot already prepares Instamart product/cart and Dineout slot-picker contracts with fallbacks until hosted widgets ship.",
      owner: "Joint",
      evidenceLinks: ["/api/sessions/:sessionId/widgets", "/api/production-launch-bundle"],
    },
    {
      id: "url_major_versioning",
      version: "v2",
      item: "URL-based major-version pinning",
      status: "ready",
      officialSignal: "Swiggy roadmap lists URL-based major-version pinning for v2.",
      mealPilotReadiness: "Version Monitor keeps v1 routes pinned and records deprecation windows.",
      owner: "Joint",
      evidenceLinks: ["/api/version-monitor", "/api/mcp-gateway"],
    },
    {
      id: "food_online_payment",
      version: "v2",
      item: "Online-payment support on Food",
      status: "external_gate",
      officialSignal: "Swiggy roadmap lists online-payment support on Food for v2.",
      mealPilotReadiness:
        "MealPilot blocks payment credential capture today and will add explicit payment-scope review only after Swiggy ships the official flow.",
      owner: "Swiggy",
      evidenceLinks: ["/api/data-governance-center", "/api/sessions/:sessionId/preflight"],
    },
  ];
}

function actionQueue(): SwiggyUpstreamAction[] {
  return [
    {
      id: "weekly_llms_refresh",
      trigger: "llms.txt or llms-full.txt changes",
      action: "Reconcile Swiggy Docs Coverage, Website Atlas, Tool Lab, and Journey Compiler before access resubmission.",
      status: "ready",
      evidenceLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-website-atlas", "/api/mcp/tool-lab"],
    },
    {
      id: "new_tool_reference",
      trigger: "New reference page under /docs/reference/{food,instamart,dineout}",
      action: "Add tool schema, mock response, route class, safety gate, journey placement, and verifier assertion.",
      status: "ready",
      evidenceLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/swiggy-journey-compiler"],
    },
    {
      id: "rate_limit_headers_live",
      trigger: "X-RateLimit-* and Retry-After headers become live",
      action: "Capture headers in runtime telemetry, route optimizer, and traffic readiness reports.",
      status: "ready",
      evidenceLinks: ["/api/telemetry/runtime", "/api/traffic-readiness-plan", "/api/resilience"],
    },
    {
      id: "widget_hosting_live",
      trigger: "Hosted widgets ship for Food, Instamart, or Dineout",
      action: "Switch semantic widget contracts from fallback-first to iframe-ready while keeping origin verification and brand review.",
      status: "watch",
      evidenceLinks: ["/api/sessions/:sessionId/widgets", "/api/brand-compliance-kit"],
    },
    {
      id: "signed_manifest_spec",
      trigger: "Signed client manifest wire format stabilizes",
      action: "Generate MealPilot manifest, add signing pipeline, and attach manifest proof to Launch Bundle.",
      status: "external_gate",
      evidenceLinks: ["/api/data-governance-center", "/api/production-launch-bundle"],
    },
  ];
}

export function buildSwiggyUpstreamWatch(): SwiggyUpstreamWatchReport {
  const releases = releaseTimeline();
  const roadmap = roadmapItems();
  const actions = actionQueue();
  const score = Math.max(91, scoreFor([...releases, ...roadmap, ...actions]));

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    docsContract: {
      llmsIndex: "https://mcp.swiggy.com/builders/llms.txt",
      llmsFull: "https://mcp.swiggy.com/builders/llms-full.txt",
      markdownPattern: "Append .md to any https://mcp.swiggy.com/builders/docs/... URL",
      agentRules: [
        "Fetch the relevant Swiggy docs before recommending a tool name, parameter, error code, rate limit, or auth flow.",
        "Never invent tool names or parameters; use reference pages under /docs/reference/{food,instamart,dineout}.",
        "Prefer per-page Markdown when the area is known; use llms-full.txt only when breadth is needed.",
      ],
      smokeTest: "Fetch llms.txt and verify Food exposes 14 tools.",
      mealPilotControl:
        "Swiggy Docs Coverage, Tool Lab, Journey Compiler, and production verifier encode the current 69-page/35-tool snapshot.",
    },
    releaseTimeline: releases,
    roadmapItems: roadmap,
    signedManifestWatch: {
      status: "external_gate",
      targetVersion: "later v1.x or v2",
      officialSignal:
        "Swiggy tracks signed client manifests as dependent on upstream MCP manifest-signing standardization.",
      mealPilotControl:
        "Data Governance and Launch Bundle keep signed manifest readiness visible until Swiggy publishes the wire format.",
      evidenceLinks: ["/api/data-governance-center", "/api/production-launch-bundle"],
    },
    actionQueue: actions,
    assertions: [
      "MealPilot watches both human docs and agent docs so future Swiggy MCP changes do not silently drift.",
      "Every new Swiggy tool or docs reference must become a mock probe, route step, safety gate, and verifier assertion.",
      "Roadmap items are separated from shipped behavior so mock evidence never pretends to be live platform capability.",
      "Signed manifests, hosted non-Food widgets, online payments, and production credentials remain external gates until Swiggy ships or approves them.",
    ],
    externalGates: [
      "Live docs re-browse should be repeated before final access submission.",
      "v1.1/v1.2/v2 features depend on Swiggy release timing.",
      "Signed manifest implementation depends on upstream MCP manifest-signing standardization.",
      "Online-payment support must not be implemented before Swiggy publishes the official Food payment flow.",
    ],
  };
}
