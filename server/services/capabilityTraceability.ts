import type { ServerConfig } from "../config.js";
import type {
  McpServerCoverage,
  SwiggyBuildersModuleIntelligenceStatus,
  SwiggyBuilderPageCoverage,
  SwiggyCtaExecutionStatus,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";
import { buildSwiggyBuildersMap } from "./swiggyBuildersMap.js";
import { buildSwiggyBuildersModuleIntelligenceCenter } from "./moduleIntelligence.js";
import { buildSwiggyCtaExecutionCenter } from "./ctaExecutionCenter.js";

type TraceabilityOwner = "MealPilot" | "Operator" | "Swiggy" | "Joint";
type TraceabilityKind = "official_page" | "website_module" | "official_cta" | "mcp_server" | "lifecycle_gate";
type TraceabilityStatus = "ready" | "watch" | "operator_gate" | "swiggy_gate";

type CapabilityTraceabilityRow = {
  id: string;
  kind: TraceabilityKind;
  label: string;
  officialSource: string;
  officialSignal: string;
  mealPilotSurface: string;
  proofLinks: string[];
  owner: TraceabilityOwner;
  status: TraceabilityStatus;
  routeOptimization: string;
  nextAction: string;
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: TraceabilityStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.84;
  if (status === "operator_gate") return 0.76;
  return 0.62;
}

function statusFromPage(page: SwiggyBuilderPageCoverage): TraceabilityStatus {
  if (page.implementationStatus === "implemented") return "ready";
  if (page.section === "footer" || page.section === "blog") return "watch";
  return "operator_gate";
}

function ownerFromStatus(status: TraceabilityStatus): TraceabilityOwner {
  if (status === "swiggy_gate") return "Swiggy";
  if (status === "operator_gate") return "Operator";
  if (status === "watch") return "Joint";
  return "MealPilot";
}

function statusFromCta(status: SwiggyCtaExecutionStatus): TraceabilityStatus {
  if (status === "ready") return "ready";
  if (status === "operator_action") return "operator_gate";
  return "swiggy_gate";
}

function statusFromModule(status: SwiggyBuildersModuleIntelligenceStatus): TraceabilityStatus {
  if (status === "ready") return "ready";
  if (status === "operator_gate") return "operator_gate";
  if (status === "swiggy_gate") return "swiggy_gate";
  return "watch";
}

function pageProofLinks(page: SwiggyBuilderPageCoverage) {
  const bySection: Record<string, string[]> = {
    home: ["/api/swiggy-website-atlas", "/api/swiggy-builders-site-parity", "/api/swiggy-conversion-center"],
    start: ["/api/swiggy-developer-quickstart", "/api/mcp-gateway", "/api/ai-client-connect-kit"],
    build: ["/api/swiggy-journey-compiler", "/api/mcp/scenario-runner", "/api/mcp/state-orchestrator"],
    reference: ["/api/mcp/catalog", "/api/mcp/tool-contract-matrix", "/api/swiggy-tool-parity-auditor"],
    operate: ["/api/swiggy-operating-contract-center", "/api/data-governance-center", "/api/slo-incident-command"],
    blog: ["/api/swiggy-builders-launch-story", "/api/swiggy-showcase-submission-center", "/api/swiggy-demo-evidence-director"],
    footer: ["/api/swiggy-faq-resolution-center", "/api/swiggy-partner-support-room", "/api/reviewer-artifact-vault"],
  };
  return bySection[page.section] ?? ["/api/swiggy-builders-map", "/api/reviewer-artifact-vault"];
}

function rowScore(rows: CapabilityTraceabilityRow[]) {
  return Math.round((rows.reduce((sum, row) => sum + statusWeight(row.status), 0) / rows.length) * 100);
}

function serverRow(server: McpServerCoverage): CapabilityTraceabilityRow {
  const serverName = server.server === "food" ? "Food" : server.server === "instamart" ? "Instamart" : "Dineout";
  const coveredTools = server.demoReady + server.guarded + server.planned;
  const surfaceByServer: Record<string, string> = {
    food: "Food discovery, menu, cart, order, tracking, cancellation-care, quality-loop, offer, and confirmation surfaces.",
    instamart:
      "Instamart product search, cart mutation, checkout readiness, pantry restock, go-to items, household preference, and payment-truth surfaces.",
    dineout:
      "Dineout restaurant discovery, slot selection, booking, bill-payment precision, occasion calendar, concierge itinerary, and cancellation-care surfaces.",
  };

  return {
    id: `mcp_${server.server}`,
    kind: "mcp_server",
    label: `${serverName} MCP server`,
    officialSource: "https://mcp.swiggy.com/builders/docs/reference/",
    officialSignal: `${server.totalTools} official ${serverName} tools available through Swiggy MCP.`,
    mealPilotSurface: surfaceByServer[server.server] ?? `${serverName} tool coverage in MealPilot.`,
    proofLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/swiggy-tool-parity-auditor"],
    owner: "MealPilot",
    status: coveredTools === server.totalTools ? "ready" : "watch",
    routeOptimization:
      "Batch read-only discovery where safe, refresh server-side state before mutation, and keep commercial tools behind explicit confirmation.",
    nextAction:
      "Keep local mock fixtures, Tool Lab probes, contract matrix, and live staging transcript aligned before replacing mock calls with production traffic.",
  };
}

function lifecycleRows(): CapabilityTraceabilityRow[] {
  return [
    {
      id: "lifecycle_local_build",
      kind: "lifecycle_gate",
      label: "Local build to first call",
      officialSource: "https://mcp.swiggy.com/builders/docs/start/",
      officialSignal: "Builders should be able to prototype locally before production access.",
      mealPilotSurface: "Developer Quickstart, Tool Lab, MCP Gateway, and JSON-RPC mock routes.",
      proofLinks: ["/api/swiggy-developer-quickstart", "/api/mcp/tool-lab", "/api/mcp-gateway"],
      owner: "MealPilot",
      status: "ready",
      routeOptimization: "Start with read-only calls, keep credentials out of git, and expose exact first-call evidence.",
      nextAction: "Run the first-call drill after staging credentials are issued.",
    },
    {
      id: "lifecycle_access_review",
      kind: "lifecycle_gate",
      label: "Access review packet",
      officialSource: "https://mcp.swiggy.com/builders/access/",
      officialSignal: "Production access needs clear use case, demo, repository, safety posture, and contact details.",
      mealPilotSurface: "Access Submission Studio, Access Evidence Matrix, Builder Packet Export, and Reviewer Artifact Vault.",
      proofLinks: ["/api/access-submission-studio", "/api/swiggy-access-evidence-matrix", "/api/builder-packet-export"],
      owner: "Operator",
      status: "operator_gate",
      routeOptimization: "Prepare proof locally, then hand the operator to the official form and mail draft without automated submission.",
      nextAction: "Record the 2-3 minute demo, paste final links, and submit the official Swiggy access form manually.",
    },
    {
      id: "lifecycle_staging_soak",
      kind: "lifecycle_gate",
      label: "Staging credential soak",
      officialSource: "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
      officialSignal: "Go-live requires staging evidence, observability, retries, support readiness, and production approval.",
      mealPilotSurface: "Staging Cutover, Credential Drill, Certification Matrix, Staging Transcript, telemetry, and SLO Incident Command.",
      proofLinks: [
        "/api/mcp/staging-cutover",
        "/api/swiggy-staging-credential-drill",
        "/api/staging-certification-matrix",
        "/api/slo-incident-command",
      ],
      owner: "Swiggy",
      status: "swiggy_gate",
      routeOptimization: "Run read-first staging probes, capture transcript evidence, and promote only after 48 hours of green checks.",
      nextAction: "Wait for Swiggy staging credentials, then replace mock transcript proof with real seeded-data calls.",
    },
    {
      id: "lifecycle_showcase",
      kind: "lifecycle_gate",
      label: "Show Us What You Built",
      officialSource: "https://mcp.swiggy.com/builders/",
      officialSignal: "Swiggy invites builders to send a demo, standout project, and launch story.",
      mealPilotSurface: "Showcase Submission Center, Demo Evidence Director, Talent Signal Center, and Growth Partnership Center.",
      proofLinks: [
        "/api/swiggy-showcase-submission-center",
        "/api/swiggy-demo-evidence-director",
        "/api/swiggy-talent-signal-center",
        "/api/swiggy-growth-partnership",
      ],
      owner: "Operator",
      status: "operator_gate",
      routeOptimization: "Package proof assets and outreach copy locally, then let the operator choose the final showcase channel.",
      nextAction: "Attach final demo video and screenshots after visual QA and production smoke pass.",
    },
  ];
}

export function buildSwiggyCapabilityTraceability(config: ServerConfig) {
  const buildersMap = buildSwiggyBuildersMap();
  const moduleCenter = buildSwiggyBuildersModuleIntelligenceCenter();
  const ctaCenter = buildSwiggyCtaExecutionCenter({ config });
  const servers = buildMcpCoverage();

  const pageRows: CapabilityTraceabilityRow[] = buildersMap.pages.map((page) => {
    const status = statusFromPage(page);
    return {
      id: `page_${page.id}`,
      kind: "official_page",
      label: page.title,
      officialSource: page.url,
      officialSignal: page.purpose,
      mealPilotSurface: page.mealPilotCoverage,
      proofLinks: pageProofLinks(page),
      owner: ownerFromStatus(status),
      status,
      routeOptimization: "Route the official page promise into a MealPilot proof surface before asking for access or approval.",
      nextAction: status === "ready" ? "Keep this page green in atlas, parity, and production smoke." : "Refresh live source before final review.",
    };
  });

  const moduleRows: CapabilityTraceabilityRow[] = moduleCenter.modules.map((module) => {
    const status = statusFromModule(module.status);
    return {
      id: `module_${module.id}`,
      kind: "website_module",
      label: module.title,
      officialSource: module.sourceUrl,
      officialSignal: module.officialSignal,
      mealPilotSurface: module.mealPilotSurface,
      proofLinks: module.proofLinks,
      owner: ownerFromStatus(status),
      status,
      routeOptimization: module.routeOptimization,
      nextAction: module.nextAction,
    };
  });

  const ctaRows: CapabilityTraceabilityRow[] = ctaCenter.targets.map((target) => {
    const status = statusFromCta(target.status);
    return {
      id: `cta_${target.id}`,
      kind: "official_cta",
      label: target.label,
      officialSource: target.officialUrl,
      officialSignal: target.officialIntent,
      mealPilotSurface: target.mealPilotAction,
      proofLinks: target.proofLinks,
      owner: ownerFromStatus(status),
      status,
      routeOptimization: target.browserAction,
      nextAction: target.nextAction,
    };
  });

  const rows = [...pageRows, ...moduleRows, ...ctaRows, ...servers.map(serverRow), ...lifecycleRows()];
  const score = rowScore(rows);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSource: buildersMap.officialSource,
    officialSources: unique([
      buildersMap.officialSource,
      ...buildersMap.pages.map((page) => page.url),
      ...moduleCenter.officialSources,
      ...ctaCenter.officialSources,
    ]),
    totals: {
      rows: rows.length,
      officialPages: pageRows.length,
      websiteModules: moduleRows.length,
      officialCtas: ctaRows.length,
      mcpServers: servers.length,
      officialTools: buildersMap.totalOfficialTools,
      lifecycleGates: lifecycleRows().length,
      ready: rows.filter((row) => row.status === "ready").length,
      watch: rows.filter((row) => row.status === "watch").length,
      operatorGates: rows.filter((row) => row.status === "operator_gate").length,
      swiggyGates: rows.filter((row) => row.status === "swiggy_gate").length,
    },
    groups: [
      { id: "official_pages", label: "Official pages", rows: pageRows.length, ready: pageRows.filter((row) => row.status === "ready").length },
      {
        id: "website_modules",
        label: "Website modules",
        rows: moduleRows.length,
        ready: moduleRows.filter((row) => row.status === "ready").length,
      },
      { id: "official_ctas", label: "Official CTAs and links", rows: ctaRows.length, ready: ctaRows.filter((row) => row.status === "ready").length },
      {
        id: "mcp_servers",
        label: "MCP server families",
        rows: servers.length,
        ready: servers.filter((server) => server.demoReady + server.guarded + server.planned === server.totalTools).length,
      },
      { id: "lifecycle_gates", label: "Builder lifecycle gates", rows: 4, ready: 1 },
    ],
    rows,
    routeOptimizations: [
      "Read-first batching: addresses, discovery, menu, slots, carts, and order status can be grouped before a user-facing recommendation.",
      "Mutation isolation: update_cart, checkout, place_food_order, book_table, cancellation, and report_error stay out of parallel speculative batches.",
      "Cross-server handoff: use one user intent to prepare Food, Instamart, and Dineout options, but preserve separate confirmation and audit events.",
      "Source freshness: use llms manifests, Website Atlas, Page Mesh, and Source Freeze Diff before the final access packet is submitted.",
      "Reviewer acceleration: route every official CTA or page promise to a local proof endpoint, visual target, production verifier assertion, and owner gate.",
    ],
    commands: [
      {
        command: "curl -s http://localhost:8787/api/swiggy-capability-traceability",
        proves: "Reads the official page, module, CTA, MCP server, lifecycle, owner, and proof-link traceability matrix.",
        expectedSignal: "totals.officialTools === 35 && totals.officialPages >= 17 && totals.officialCtas >= 31",
      },
      {
        command: "npm run verify:production",
        proves: "Fails release if the traceability score, row counts, MCP server coverage, or official CTA coverage drops.",
        expectedSignal: "capabilityTraceabilityScore >= 88 && capabilityTraceabilityRows >= 90",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "Keeps Launch Center and reviewer cards visually safe after traceability links are added to handoff artifacts.",
        expectedSignal: "76 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Every official Swiggy Builders page in the local source map has at least one MealPilot proof route.",
      "Every Website Atlas module is owner-tagged with a route optimization, risk boundary, proof link, and next action.",
      "Every official CTA, header link, docs link, footer link, legal link, and builders@swiggy.in path has a safe execution contract.",
      "All three Swiggy MCP server families are represented with 35 total tools and confirmation-first route boundaries.",
      "External Swiggy access approval, staging credentials, legal review, and email/form submission remain explicit gates.",
    ],
    externalGates: [
      "The official Swiggy access form and builders@swiggy.in email must be submitted by the operator.",
      "Swiggy staging credentials are required before live MCP traffic can replace mock evidence.",
      "Co-branding, showcase placement, enterprise support, quota upgrades, and production go-live remain Swiggy approval decisions.",
    ],
  };
}
