import type {
  SwiggySourceBuildQueueItem,
  SwiggySourceCoverageCluster,
  SwiggySourceDriftSignal,
  SwiggySourceIntelligenceReport,
  SwiggySourceIntelligenceStatus,
  SwiggySourceServerInventory,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";
import { buildSwiggyUpstreamWatch } from "./upstreamWatch.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

const officialSource = "https://mcp.swiggy.com/builders/";
const officialSources = [
  officialSource,
  `${officialSource}developers/`,
  `${officialSource}enterprises/`,
  `${officialSource}docs/`,
  `${officialSource}docs/start/`,
  `${officialSource}docs/build/`,
  `${officialSource}docs/reference/`,
  `${officialSource}docs/operate/`,
  `${officialSource}blog/`,
  `${officialSource}llms.txt`,
  `${officialSource}llms-full.txt`,
];

function statusWeight(status: SwiggySourceIntelligenceStatus) {
  if (status === "covered") return 1;
  if (status === "watch") return 0.78;
  return 0.5;
}

function scoreFor(items: Array<{ status: SwiggySourceIntelligenceStatus }>) {
  const weighted = items.reduce((sum, item) => sum + statusWeight(item.status), 0);
  return Math.round((weighted / items.length) * 100);
}

function cluster(
  id: string,
  label: string,
  officialSignal: string,
  coveredSources: string[],
  mealPilotEvidence: string[],
  status: SwiggySourceIntelligenceStatus,
  nextAction: string,
): SwiggySourceCoverageCluster {
  return {
    id,
    label,
    officialSignal,
    coveredSources,
    mealPilotEvidence,
    status,
    score: Math.round(statusWeight(status) * 100),
    nextAction,
  };
}

function serverInventory(): SwiggySourceServerInventory[] {
  return buildMcpCoverage().map((server) => ({
    server: server.server,
    endpoint: server.endpoint,
    tools: server.totalTools,
    docsReference: `${officialSource}docs/reference/${server.server}/`,
    mealPilotProof: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix"],
    status: "covered",
  }));
}

function coverageClusters(): SwiggySourceCoverageCluster[] {
  return [
    cluster(
      "marketing_site",
      "Complete Builders website surface",
      "Home, Developers, Enterprises, Blog, FAQ, Access, global header, footer, and application CTAs frame the builder journey.",
      [
        `${officialSource}`,
        `${officialSource}developers/`,
        `${officialSource}enterprises/`,
        `${officialSource}blog/`,
        `${officialSource}access/`,
      ],
      ["/api/swiggy-website-atlas", "/api/swiggy-builder-intake", "/api/swiggy-faq-policy"],
      "covered",
      "Keep all public CTAs wired to either local proof, prepared email, prepared access form, or documented external gate.",
    ),
    cluster(
      "start_tracks",
      "Developer, enterprise, and AI-client tracks",
      "Start docs route builders into developer agents, enterprise delegated auth, or consumer AI-client installation.",
      [
        `${officialSource}docs/start/`,
        `${officialSource}docs/start/developer/`,
        `${officialSource}docs/start/enterprise/`,
        `${officialSource}docs/start/consumer/`,
        `${officialSource}docs/start/authenticate/`,
      ],
      ["/api/ai-client-connect-kit", "/api/enterprise-delegated-auth", "/api/credential-onboarding"],
      "covered",
      "Keep the developer path runnable locally while enterprise and consumer paths remain documented with explicit gates.",
    ),
    cluster(
      "build_recipes",
      "Official recipes and agent patterns",
      "Build docs define Food, Instamart, Dineout, combined evening, voice/chat, multi-turn state, widgets, and ship-to-production recipes.",
      [
        `${officialSource}docs/build/`,
        `${officialSource}docs/build/recipes/order-food/`,
        `${officialSource}docs/build/recipes/order-groceries/`,
        `${officialSource}docs/build/recipes/book-a-table/`,
        `${officialSource}docs/build/recipes/combined/`,
      ],
      ["/api/swiggy-journey-compiler", "/api/mcp/scenario-runner", "/api/mcp/state-orchestrator", "/api/mcp/widget-runtime"],
      "covered",
      "Use these source recipes as regression fixtures for every future MealPilot flow.",
    ),
    cluster(
      "reference_tools",
      "All official MCP tool reference pages",
      "Reference docs list 35 tools across Food, Instamart, and Dineout with shared error guidance.",
      [
        `${officialSource}docs/reference/`,
        `${officialSource}docs/reference/food/`,
        `${officialSource}docs/reference/instamart/`,
        `${officialSource}docs/reference/dineout/`,
      ],
      ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/error-intelligence"],
      "covered",
      "Any new reference page must become a Tool Lab probe, contract row, route step, and verifier assertion.",
    ),
    cluster(
      "operate_contract",
      "Production operation contract",
      "Operate docs define access, SLA, rate limits, data and compliance, versioning, changelog, and support.",
      [
        `${officialSource}docs/operate/`,
        `${officialSource}docs/operate/access/`,
        `${officialSource}docs/operate/sla/`,
        `${officialSource}docs/operate/rate-limits/`,
        `${officialSource}docs/operate/data-and-compliance/`,
      ],
      [
        "/api/traffic-readiness-plan",
        "/api/data-governance-center",
        "/api/slo-incident-command",
        "/api/support/bridge",
        "/api/production-launch-bundle",
      ],
      "covered",
      "Keep production claims separated from local mock evidence until Swiggy staging and production credentials exist.",
    ),
    cluster(
      "source_refresh_loop",
      "Agent-readable source refresh loop",
      "Swiggy publishes llms.txt and llms-full.txt plus per-page markdown twins for coding agents.",
      [`${officialSource}llms.txt`, `${officialSource}llms-full.txt`],
      ["/api/swiggy-docs-coverage", "/api/swiggy-upstream-watch", "/api/swiggy-source-intelligence"],
      "watch",
      "Before final access submission, refresh the llms inventory and reconcile this report against any source changes.",
    ),
  ];
}

function driftSignals(): SwiggySourceDriftSignal[] {
  return [
    {
      id: "homepage_tool_count_language",
      label: "Homepage shorthand says 18+ tools while docs reference 35 tools",
      severity: "info",
      officialSignal:
        "The marketing homepage uses '18+ API Tools', while the Docs home and Reference pages enumerate 35 tools across Food, Instamart, and Dineout.",
      mealPilotInterpretation:
        "MealPilot treats the reference and llms index as authoritative for implementation, so all product surfaces keep the 35-tool contract.",
      action: "Keep UI and verifier copy on 35 tools, and mention homepage shorthand only inside source intelligence.",
      evidenceLinks: ["/api/mcp/catalog", "/api/swiggy-docs-coverage", "/api/swiggy-website-atlas"],
    },
    {
      id: "reference_sidebar_count_language",
      label: "Reference navigation counts include server and error index pages",
      severity: "info",
      officialSignal:
        "Reference navigation groups show Food 15, Instamart 14, and Dineout 9 entries, while the endpoint table shows 14, 13, and 8 callable tools.",
      mealPilotInterpretation:
        "MealPilot counts callable MCP tools only and keeps index/error pages in docs coverage rather than Tool Lab probes.",
      action: "Keep server overview pages in Docs Coverage and actual callable tools in Catalog, Tool Lab, and Tool Contract Matrix.",
      evidenceLinks: ["/api/swiggy-docs-coverage", "/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix"],
    },
    {
      id: "future_rate_limit_headers",
      label: "Rate-limit behavior is split between current v1.0 and planned headers",
      severity: "watch",
      officialSignal:
        "Swiggy documents current upstream-shedder behavior separately from future MCP-layer 429, Retry-After, and X-RateLimit headers.",
      mealPilotInterpretation:
        "MealPilot models both paths without pretending future headers are currently live.",
      action: "Update runtime telemetry parsing once Swiggy starts sending MCP-layer rate-limit headers.",
      evidenceLinks: ["/api/mcp/backpressure-governor", "/api/traffic-readiness-plan", "/api/swiggy-upstream-watch"],
    },
    {
      id: "future_hosted_widgets",
      label: "Hosted widgets and non-Food widgets remain staged",
      severity: "watch",
      officialSignal:
        "Docs describe widget contracts and roadmap items, while hosted iframe and Instamart/Dineout widget availability are gated by future releases.",
      mealPilotInterpretation:
        "MealPilot ships semantic fallbacks and iframe readiness now, with activation gated on Swiggy rollout.",
      action: "Switch fallbacks to hosted widgets after origin, sandbox, and staging render checks pass.",
      evidenceLinks: ["/api/mcp/widget-runtime", "/api/sessions/:sessionId/widgets", "/api/visual-qa-center"],
    },
    {
      id: "live_credential_gate",
      label: "Local completeness does not prove live Swiggy commerce execution",
      severity: "blocking",
      officialSignal:
        "Builders can develop on localhost, but production access, staging credentials, exact redirect URI review, and real user traffic require Swiggy approval.",
      mealPilotInterpretation:
        "MealPilot keeps live order, grocery checkout, and table-booking proof external-gated until credentials are issued.",
      action: "Submit the access packet, complete OAuth/DCR with issued credentials, then replay staging certification waves.",
      evidenceLinks: ["/api/credential-onboarding", "/api/mcp/staging-cutover", "/api/staging-certification-matrix"],
    },
  ];
}

function buildQueue(): SwiggySourceBuildQueueItem[] {
  return [
    {
      id: "refresh_llms_before_submission",
      label: "Refresh official source index before access submission",
      owner: "Operator",
      status: "watch",
      trigger: "Final demo recording or Swiggy source update",
      nextBuild: "Re-browse llms.txt, llms-full.txt, homepage, developers, enterprises, docs, reference, and operate pages.",
      evidenceLinks: ["/api/swiggy-source-intelligence", "/api/swiggy-docs-coverage"],
    },
    {
      id: "new_reference_page_pipeline",
      label: "Convert new Swiggy reference pages into executable MealPilot proof",
      owner: "MealPilot",
      status: "covered",
      trigger: "New /docs/reference/{server}/{tool}.md entry",
      nextBuild: "Add schema, fixture, Tool Lab probe, Tool Contract Matrix row, Journey Compiler placement, and production verifier assertion.",
      evidenceLinks: ["/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/swiggy-journey-compiler"],
    },
    {
      id: "staging_credential_replay",
      label: "Replace local source proof with Swiggy staging replay",
      owner: "Joint",
      status: "external_gate",
      trigger: "Swiggy issues staging credentials and seeded users",
      nextBuild: "Run read-only probes first, then guarded mutation/commercial waves with 48-hour soak telemetry.",
      evidenceLinks: ["/api/mcp/staging-cutover", "/api/staging-certification-matrix", "/api/sessions/:sessionId/staging-transcript"],
    },
    {
      id: "hosted_widget_upgrade",
      label: "Upgrade semantic cards to hosted Swiggy widgets",
      owner: "Joint",
      status: "watch",
      trigger: "Hosted widget registry and non-Food widgets become available",
      nextBuild: "Validate iframe origin, sandbox policy, postMessage bridge, screenshots, text fit, and voice fallbacks.",
      evidenceLinks: ["/api/mcp/widget-runtime", "/api/visual-qa-center", "/api/brand-compliance-kit"],
    },
    {
      id: "enterprise_scale_lane",
      label: "Turn enterprise docs into a tenant-ready platform lane",
      owner: "Swiggy",
      status: "external_gate",
      trigger: "Enterprise access, delegated auth, custom quotas, and commercial terms are approved",
      nextBuild: "Enable tenant-specific OAuth brokering, per-user token lifecycle, support SLAs, and enterprise audit exports.",
      evidenceLinks: ["/api/enterprise-delegated-auth", "/api/data-governance-center", "/api/slo-incident-command"],
    },
  ];
}

export function buildSwiggySourceIntelligence(): SwiggySourceIntelligenceReport {
  const docsCoverage = buildSwiggyDocsCoverage();
  const websiteAtlas = buildSwiggyWebsiteAtlas();
  const upstreamWatch = buildSwiggyUpstreamWatch();
  const servers = serverInventory();
  const clusters = coverageClusters();
  const drift = driftSignals();
  const queue = buildQueue();
  const totalReferenceTools = servers.reduce((sum, server) => sum + server.tools, 0);
  const score = Math.round((scoreFor([...clusters, ...queue]) + docsCoverage.score + websiteAtlas.score + upstreamWatch.score) / 4);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    inventory: {
      sourceOfTruth: "Swiggy Builders llms.txt, llms-full.txt, rendered pages, and markdown twins",
      llmsLinkedPages: docsCoverage.totalPages,
      markdownTwinPattern: "Fetch https://mcp.swiggy.com/builders/docs/... as .md for clean agent-readable source.",
      marketingPages: websiteAtlas.pagesCovered,
      docsSections: docsCoverage.sections.length,
      headerLinks: websiteAtlas.globalHeader.length,
      footerLinks: websiteAtlas.footerGroups.reduce((sum, group) => sum + group.links.length, 0),
      ctas: websiteAtlas.ctasCovered,
      toolReferenceTools: totalReferenceTools,
    },
    serverInventory: servers,
    clusters,
    driftSignals: drift,
    buildQueue: queue,
    assertions: [
      "MealPilot now has one source-intelligence report that reconciles website pages, CTAs, docs sections, reference tools, upstream roadmap items, and local evidence.",
      "The 35 callable MCP tool count comes from Swiggy's reference endpoint table and the same Tool Lab coverage source used by the verifier.",
      "Homepage shorthand, reference-index counts, future rate limits, hosted widgets, and live credential limitations are explicit drift signals rather than hidden assumptions.",
      "Every Swiggy source cluster points to an API evidence surface so reviewers can verify the claim without reading implementation code.",
    ],
    externalGates: [
      "Live Swiggy staging credentials and seeded users are required before local proof can become credentialed replay proof.",
      "Hosted widget activation depends on Swiggy registry rollout and brand/origin validation.",
      "Enterprise delegated-auth and higher rate limits require Swiggy partnership approval.",
      "Final access submission should repeat live source browsing against Swiggy Builders immediately before sending the packet.",
    ],
  };
}
