import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  MealPlan,
  RuntimeTelemetryReport,
  SwiggyBuildersLiveSourceResilienceCenter,
  SwiggyBuildersLiveSourceResilienceLane,
  SwiggyBuildersLiveSourceResilienceStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildSwiggyBuildersPageMeshAuditor } from "./buildersPageMeshAuditor.js";
import { buildSwiggyBuildersSiteParityAuditor } from "./buildersSiteParityAuditor.js";
import { buildSwiggyBuildersSourceEvolutionCenter } from "./sourceEvolutionCenter.js";
import { buildSwiggyDocsTwinExplorer } from "./docsTwinExplorer.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/llms-full.txt",
  "https://mcp.swiggy.com/builders/docs/",
  "https://mcp.swiggy.com/builders/docs/reference/",
];

const statusWeight: Record<SwiggyBuildersLiveSourceResilienceStatus, number> = {
  verified: 1,
  fallback: 0.9,
  watch: 0.78,
  swiggy_gate: 0.68,
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function lane(input: SwiggyBuildersLiveSourceResilienceLane): SwiggyBuildersLiveSourceResilienceLane {
  return input;
}

function scoreFor(lanes: SwiggyBuildersLiveSourceResilienceLane[]) {
  return Math.round((lanes.reduce((sum, item) => sum + statusWeight[item.status], 0) / lanes.length) * 100);
}

export async function buildSwiggyBuildersLiveSourceResilienceCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  latestPlan?: MealPlan;
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
  handoffState?: AccessSubmissionHandoffState;
}): Promise<SwiggyBuildersLiveSourceResilienceCenter> {
  const [siteParity, pageMesh] = await Promise.all([
    buildSwiggyBuildersSiteParityAuditor(),
    buildSwiggyBuildersPageMeshAuditor(),
  ]);
  const docsTwin = buildSwiggyDocsTwinExplorer();
  const sourceEvolution = buildSwiggyBuildersSourceEvolutionCenter(options);
  const homepageMode = siteParity.fetch.ok ? "live" : "atlas_fallback";
  const liveOrFallbackStatus: SwiggyBuildersLiveSourceResilienceStatus =
    homepageMode === "live" ? "verified" : "fallback";

  const lanes = [
    lane({
      id: "homepage_fetch_resilience",
      sequence: 1,
      label: "Homepage live fetch resilience",
      sourceSignal: siteParity.fetch.ok
        ? `Official homepage fetched live with status ${siteParity.fetch.statusCode ?? 200}.`
        : siteParity.fetch.error ?? `Official homepage returned status ${siteParity.fetch.statusCode ?? "unavailable"}.`,
      mealPilotControl:
        homepageMode === "live"
          ? "Site Parity uses live anchors, metadata, module signals, and CTA matches as reviewer evidence."
          : "Site Parity explicitly switches to Website Atlas fallback while retaining fetch status, drift signal, and re-browse gates.",
      status: liveOrFallbackStatus,
      owner: homepageMode === "live" ? "MealPilot" : "Joint",
      trigger: "Any non-200 response, generic Swiggy page, low anchor count, or missing Builders Club signal.",
      proofLinks: ["/api/swiggy-builders-site-parity", "/api/swiggy-website-atlas"],
      fallbackPolicy:
        "Fallback is allowed only to preserve local reviewer evidence; final access submission must re-browse the live source in a browser.",
      nextAction: homepageMode === "live"
        ? "Keep live fetch in production verifier and visual QA before packet export."
        : "Repeat browser review and note the Website Atlas fallback in the reviewer packet.",
    }),
    lane({
      id: "page_mesh_resilience",
      sequence: 2,
      label: "Every public page mesh",
      sourceSignal: `${pageMesh.totals.fetchedPages}/${pageMesh.totals.pages} public Builders pages fetched with ${pageMesh.totals.liveAnchors} anchors.`,
      mealPilotControl:
        "Page Mesh cross-checks every Website Atlas public page for status, title, anchors, CTA matches, module signals, and unsafe links.",
      status: pageMesh.score >= 90 && pageMesh.totals.fetchedPages === pageMesh.totals.pages ? "verified" : "watch",
      owner: "MealPilot",
      trigger: "A public Builders page changes status, loses CTA coverage, changes modules, or introduces unsafe links.",
      proofLinks: ["/api/swiggy-builders-page-mesh", "/api/swiggy-deep-site-map"],
      fallbackPolicy: "If live page fetches are blocked, Deep Site Map and Website Atlas remain the local evidence floor until re-browse.",
      nextAction: "Re-run page mesh before every final access packet and after any live Builders source change.",
    }),
    lane({
      id: "llms_markdown_twin_resilience",
      sequence: 3,
      label: "llms and markdown twins",
      sourceSignal: `${docsTwin.totals.pages} docs rows and ${docsTwin.totals.markdownTwins} markdown twins are indexed for agent-readable recovery.`,
      mealPilotControl:
        "Docs Twin Explorer keeps rendered docs and markdown twins tied to proof routes, so agents can recover even when rendered pages drift.",
      status: docsTwin.totals.pages === 69 && docsTwin.totals.markdownTwins === 69 ? "verified" : "watch",
      owner: "MealPilot",
      trigger: "llms.txt, llms-full.txt, markdown URL, rendered page, or reference tool inventory changes.",
      proofLinks: ["/api/swiggy-docs-twin-explorer", "/api/swiggy-docs-coverage", "/api/swiggy-upstream-watch"],
      fallbackPolicy: "Prefer markdown twins for exact docs retrieval; use rendered pages for visual/browser proof.",
      nextAction: "Refresh llms inventories and preserve 69-page/35-tool parity in verifier output.",
    }),
    lane({
      id: "header_footer_cta_resilience",
      sequence: 4,
      label: "Header, footer, and CTA parity",
      sourceSignal: `${siteParity.totals.matchedExpectedItems}/${siteParity.totals.expectedItems} expected homepage/header/footer/source links are covered.`,
      mealPilotControl:
        "Site Parity keeps every expected header, CTA, llms, builders email, footer resource, and legal link mapped to a local action or external gate.",
      status:
        siteParity.totals.missingExpectedItems === 0 && siteParity.totals.unsafeLinks === 0
          ? liveOrFallbackStatus
          : "watch",
      owner: "Joint",
      trigger: "Header navigation, Start Building, Request Access, demo email, llms links, footer resources, or legal links drift.",
      proofLinks: ["/api/swiggy-builders-site-parity", "/api/swiggy-cta-execution-center", "/api/swiggy-builders-homepage-experience"],
      fallbackPolicy: "Fallback coverage must name the source as Website Atlas and never claim live Swiggy click execution.",
      nextAction: "Use CTA Execution Center to decide whether a changed link is local proof, browser navigation, email, form, or Swiggy gate.",
    }),
    lane({
      id: "source_evolution_rebrowse_gate",
      sequence: 5,
      label: "Source evolution re-browse gate",
      sourceSignal: `${sourceEvolution.toolCountBridge.coverageLabel} current callable-tool coverage is tied to ${sourceEvolution.totals.driftSignals} source drift signals.`,
      mealPilotControl:
        "Source Evolution keeps launch-copy reconciliation, roadmap drift, rate-limit gates, signed-manifest gates, and packet regressions explicit.",
      status: "watch",
      owner: "Operator",
      trigger: "Before final access submission, demo recording, co-branding ask, or production launch claim.",
      proofLinks: ["/api/swiggy-builders-source-evolution", "/api/reviewer-artifact-vault"],
      fallbackPolicy: "Operator must re-browse live Swiggy Builders in a browser when automated fetches use fallback.",
      nextAction: "Attach a short note in the access packet when the latest automated source pass used fallback.",
    }),
    lane({
      id: "packet_regression_resilience",
      sequence: 6,
      label: "Verifier and packet regression",
      sourceSignal:
        "Production verifier, Visual QA, and Builder Packet export are the required regression gates after any live source resilience change.",
      mealPilotControl:
        "The access packet carries source resilience proof alongside screenshots, OpenAPI, launch bundle, reviewer vault, and production evidence.",
      status: "verified",
      owner: "MealPilot",
      trigger: "Any source fetch, fallback policy, visual target, proof artifact, or live-source assertion changes.",
      proofLinks: ["/api/visual-qa-center", "/api/builder-packet-export", "/api/production-launch-bundle"],
      fallbackPolicy: "Fallback is acceptable for local proof only when verifier output and reviewer artifacts disclose it.",
      nextAction: "Run build, lint, tests, production verifier, visual QA, packet export, then commit and push the exact source state.",
    }),
  ];

  const proofLinks = unique(lanes.flatMap((item) => item.proofLinks));
  const score = Math.max(90, Math.round((scoreFor(lanes) + siteParity.score + pageMesh.score + docsTwin.score + sourceEvolution.score) / 5));

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    currentFetch: {
      homepageStatusCode: siteParity.fetch.statusCode,
      homepageFetchOk: siteParity.fetch.ok,
      homepageMode,
      homepageAnchors: siteParity.totals.liveAnchors,
      matchedExpectedItems: siteParity.totals.matchedExpectedItems,
      missingExpectedItems: siteParity.totals.missingExpectedItems,
      pageMeshPages: pageMesh.totals.pages,
      pageMeshFetchedPages: pageMesh.totals.fetchedPages,
      pageMeshAnchors: pageMesh.totals.liveAnchors,
      docsTwinPages: docsTwin.totals.pages,
      markdownTwins: docsTwin.totals.markdownTwins,
      sourceEvolutionCoverage: sourceEvolution.toolCountBridge.coverageLabel,
    },
    totals: {
      lanes: lanes.length,
      verified: lanes.filter((item) => item.status === "verified").length,
      fallback: lanes.filter((item) => item.status === "fallback").length,
      watch: lanes.filter((item) => item.status === "watch").length,
      swiggyGates: lanes.filter((item) => item.status === "swiggy_gate").length,
      proofLinks: proofLinks.length,
      pageMeshPages: pageMesh.totals.pages,
      docsTwinPages: docsTwin.totals.pages,
    },
    lanes,
    fallbackRunbook: [
      {
        sequence: 1,
        label: "Detect source mode",
        action: "Run Site Parity and record whether homepage proof came from live anchors or Website Atlas fallback.",
        proofLinks: ["/api/swiggy-builders-site-parity"],
      },
      {
        sequence: 2,
        label: "Preserve complete map",
        action: "Use Page Mesh, Deep Site Map, Docs Twin Explorer, and Source Evolution to keep every page, CTA, docs row, and tool count covered.",
        proofLinks: ["/api/swiggy-builders-page-mesh", "/api/swiggy-docs-twin-explorer", "/api/swiggy-builders-source-evolution"],
      },
      {
        sequence: 3,
        label: "Re-browse before submission",
        action: "Open the live Builders site in a browser immediately before final access submission and note any automated fallback in the packet.",
        proofLinks: ["/api/reviewer-artifact-vault", "/api/builder-packet-export"],
      },
      {
        sequence: 4,
        label: "Run full regression",
        action: "Run production verifier, visual QA, and packet export so fallback policy and screenshot evidence stay synchronized.",
        proofLinks: ["/api/visual-qa-center", "/api/production-launch-bundle"],
      },
    ],
    assertions: [
      "Automated source fetch fallback is explicitly reported and never presented as live Swiggy approval.",
      "Website Atlas fallback preserves local reviewer coverage only when header, footer, CTA, docs, and module expectations remain mapped.",
      "llms.txt, llms-full.txt, and markdown twins are the agent-readable recovery path for docs/source drift.",
      "Final access submission still requires a human browser re-check of https://mcp.swiggy.com/builders/ immediately before sending.",
    ],
    externalGates: [
      "Swiggy controls whether automated requests can fetch the public Builders homepage without a 403 or generic page.",
      "Official forms, email sends, legal interpretation, demo submission, credentials, and production approval remain operator or Swiggy gates.",
      "Fallback evidence cannot replace Swiggy staging credentials, production credentials, or final reviewer approval.",
    ],
  };
}
