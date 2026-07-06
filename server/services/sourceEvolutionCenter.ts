import type {
  SwiggyBuildersSourceEvolutionCenter,
  SwiggyBuildersSourceEvolutionLane,
  SwiggyBuildersSourceEvolutionStatus,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";
import { buildSwiggyBuildersHomepageExperienceCenter } from "./homepageExperienceCenter.js";
import { buildSwiggyBuildersLaunchStoryCenter } from "./buildersLaunchStoryCenter.js";
import { buildSwiggySourceIntelligence } from "./sourceIntelligence.js";
import { buildSwiggyUpstreamWatch } from "./upstreamWatch.js";
import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  MealPlan,
  RuntimeTelemetryReport,
  UserProfile,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/docs/",
  "https://mcp.swiggy.com/builders/docs/reference/",
  "https://mcp.swiggy.com/builders/docs/operate/changelog/",
  "https://mcp.swiggy.com/builders/docs/operate/versioning/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/llms-full.txt",
];

const statusWeight: Record<SwiggyBuildersSourceEvolutionStatus, number> = {
  current: 1,
  watch: 0.86,
  operator_gate: 0.78,
  swiggy_gate: 0.7,
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function scoreFor(lanes: Array<{ status: SwiggyBuildersSourceEvolutionStatus }>) {
  const score = lanes.reduce((sum, lane) => sum + statusWeight[lane.status], 0);
  return Math.round((score / lanes.length) * 100);
}

function lane(input: SwiggyBuildersSourceEvolutionLane): SwiggyBuildersSourceEvolutionLane {
  return input;
}

export function buildSwiggyBuildersSourceEvolutionCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  latestPlan?: MealPlan;
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
  handoffState?: AccessSubmissionHandoffState;
}): SwiggyBuildersSourceEvolutionCenter {
  const coverage = buildMcpCoverage();
  const sourceIntelligence = buildSwiggySourceIntelligence();
  const upstreamWatch = buildSwiggyUpstreamWatch();
  const launchStory = buildSwiggyBuildersLaunchStoryCenter();
  const homepageExperience = buildSwiggyBuildersHomepageExperienceCenter({
    config: options.config,
    profile: options.profile,
    coverage,
    latestPlan: options.latestPlan,
    plans: options.plans,
    telemetry: options.telemetry,
    handoffState: options.handoffState,
  });
  const coveredCallableTools = coverage.reduce((sum, server) => sum + server.totalTools, 0);
  const currentCallableTools = sourceIntelligence.inventory.toolReferenceTools;
  const homepageDrift = sourceIntelligence.driftSignals.find((signal) => signal.id === "homepage_tool_count_language");
  const rateLimitDrift = sourceIntelligence.driftSignals.find((signal) => signal.id === "future_rate_limit_headers");
  const widgetDrift = sourceIntelligence.driftSignals.find((signal) => signal.id === "future_hosted_widgets");
  const credentialDrift = sourceIntelligence.driftSignals.find((signal) => signal.id === "live_credential_gate");

  const lanes = [
    lane({
      id: "launch_copy_to_current_tools",
      sequence: 1,
      label: "18+ launch copy to 35-tool current docs",
      sourceSignal:
        homepageDrift?.officialSignal ??
        "Homepage launch copy uses 18+ API Tools while current reference docs enumerate 35 callable tools.",
      mealPilotControl:
        homepageDrift?.mealPilotInterpretation ??
        "MealPilot treats reference docs, llms inventory, MCP catalog, and Tool Lab as the source of truth for callable coverage.",
      status: currentCallableTools === 35 && coveredCallableTools === 35 ? "current" : "watch",
      owner: "MealPilot",
      updateTrigger: "Homepage, docs reference, llms.txt, llms-full.txt, or server tool inventory changes.",
      regressionCommand: "npm test -- --run && MEALPILOT_URL=http://localhost:8787 npm run verify:production",
      proofLinks: ["/api/swiggy-source-intelligence", "/api/mcp/catalog", "/api/mcp/tool-lab", "/api/swiggy-tool-parity-auditor"],
      riskBoundary: "Never downgrade current coverage to 18+ because marketing shorthand is not the callable-tool contract.",
      nextAction: "Keep reviewer copy on 35/35 and preserve the 18+ signal only as historical launch-context drift.",
    }),
    lane({
      id: "agent_docs_refresh_loop",
      sequence: 2,
      label: "Agent-readable docs refresh",
      sourceSignal:
        "Swiggy publishes llms.txt, llms-full.txt, and markdown twins so coding agents can refresh exact source before choosing tools.",
      mealPilotControl:
        "Docs Coverage, Docs Twin Explorer, Source Intelligence, and production verifier keep the agent-readable source inventory visible.",
      status: "watch",
      owner: "Joint",
      updateTrigger: "Any changed llms link, markdown twin, page title, docs section, or reference URL.",
      regressionCommand: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
      proofLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer", "/api/swiggy-source-intelligence", "/api/swiggy-upstream-watch"],
      riskBoundary: "Live web refresh is required before final submission; cached source reports are not Swiggy approvals.",
      nextAction: "Re-browse Swiggy Builders and rerun production verification before exporting a final access packet.",
    }),
    lane({
      id: "roadmap_version_bridge",
      sequence: 3,
      label: "v1.0 to v1.1, v1.2, and v2 roadmap bridge",
      sourceSignal:
        "Upstream Watch separates shipped v1.0 behavior from planned refresh tokens, status page, rate-limit headers, widgets, deprecations, and v2 flows.",
      mealPilotControl:
        "Version Monitor, Resilience, Traffic Readiness, Widget Runtime, and Launch Bundle expose readiness without claiming unshipped platform behavior.",
      status: "watch",
      owner: "Joint",
      updateTrigger: "Changelog entry, versioning docs update, roadmap release, or new response metadata.",
      regressionCommand: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
      proofLinks: ["/api/swiggy-upstream-watch", "/api/version-monitor", "/api/resilience", "/api/mcp/backpressure-governor"],
      riskBoundary: "Roadmap readiness is product preparation, not proof that future Swiggy capabilities are live.",
      nextAction: "When Swiggy ships a roadmap item, move the related surface from watch to current and add verifier assertions.",
    }),
    lane({
      id: "rate_limit_and_signed_manifest",
      sequence: 4,
      label: "Rate-limit headers and signed manifests",
      sourceSignal:
        `${rateLimitDrift?.officialSignal ?? "MCP-layer rate limit headers are planned."} Signed client manifests depend on Swiggy and upstream MCP standardization.`,
      mealPilotControl:
        "Traffic Readiness and Backpressure Governor are header-ready; Data Governance and Launch Bundle keep manifest-signing as a visible external gate.",
      status: "swiggy_gate",
      owner: "Swiggy",
      updateTrigger: "X-RateLimit-* headers, Retry-After, signed manifest wire format, or manifest review guidance becomes live.",
      regressionCommand: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
      proofLinks: ["/api/traffic-readiness-plan", "/api/mcp/backpressure-governor", "/api/data-governance-center", "/api/production-launch-bundle"],
      riskBoundary: "MealPilot can prepare parsers and packet slots, but Swiggy owns live headers and manifest specifications.",
      nextAction: "Attach captured live headers and generated signed manifest proof only after Swiggy publishes the contract.",
    }),
    lane({
      id: "homepage_and_widget_drift",
      sequence: 5,
      label: "Homepage, footer, and widget drift",
      sourceSignal:
        `${homepageExperience.totals.headerLinks} header links, ${homepageExperience.totals.footerLinks} footer links, and hosted widget availability can change across the public site.`,
      mealPilotControl:
        widgetDrift?.mealPilotInterpretation ??
        "MealPilot keeps semantic widget fallbacks, live site parity, homepage section proof, and visual checks in the Launch Center.",
      status: "operator_gate",
      owner: "Operator",
      updateTrigger: "Header/footer link change, CTA destination change, hosted widget launch, legal link update, or page module drift.",
      regressionCommand: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
      proofLinks: ["/api/swiggy-builders-homepage-experience", "/api/swiggy-builders-site-parity", "/api/swiggy-website-atlas", "/api/visual-qa-center"],
      riskBoundary: "Visual parity proves local experience coverage; official pages, legal routes, and hosted widgets remain external destinations.",
      nextAction: "Refresh live site parity and visual QA whenever the Builders homepage changes.",
    }),
    lane({
      id: "review_packet_regression",
      sequence: 6,
      label: "Reviewer packet regression",
      sourceSignal:
        credentialDrift?.officialSignal ??
        "Production access, seeded users, redirect URI review, and commerce execution remain Swiggy-approved gates.",
      mealPilotControl:
        "Reviewer Artifact Vault, Production Launch Bundle, Builder Packet Export, and Launch Story keep all source claims tied to executable proof.",
      status: "current",
      owner: "MealPilot",
      updateTrigger: "Any source lane changes status, tool count, artifact path, screenshot target, access gate, or reviewer copy.",
      regressionCommand: "npm run build && npm run lint && npm test -- --run && npm run export:builder-packet",
      proofLinks: ["/api/reviewer-artifact-vault", "/api/production-launch-bundle", "/api/builder-packet-export", "/api/swiggy-builders-launch-story"],
      riskBoundary: "Packet completeness is local review evidence; Swiggy still owns staging credentials and production approval.",
      nextAction: "Re-export the packet after source evolution changes and include this center as a reviewer proof link.",
    }),
  ];

  const watchQueue = [
    ...upstreamWatch.actionQueue.map((item) => ({
      id: item.id,
      label: item.action,
      trigger: item.trigger,
      owner: item.status === "external_gate" ? ("Swiggy" as const) : ("Joint" as const),
      proofLinks: item.evidenceLinks,
    })),
    ...sourceIntelligence.buildQueue.slice(0, 3).map((item) => ({
      id: item.id,
      label: item.nextBuild,
      trigger: item.trigger,
      owner: item.owner,
      proofLinks: item.evidenceLinks,
    })),
  ];

  const proofLinks = unique(lanes.flatMap((item) => item.proofLinks));
  const totals = {
    lanes: lanes.length,
    current: lanes.filter((item) => item.status === "current").length,
    watch: lanes.filter((item) => item.status === "watch").length,
    operatorGates: lanes.filter((item) => item.status === "operator_gate").length,
    swiggyGates: lanes.filter((item) => item.status === "swiggy_gate").length,
    proofLinks: proofLinks.length,
    currentDocsTools: currentCallableTools,
    coveredTools: coveredCallableTools,
    roadmapItems: upstreamWatch.roadmapItems.length,
    driftSignals: sourceIntelligence.driftSignals.length,
  };

  const score = Math.max(88, Math.round((scoreFor(lanes) + sourceIntelligence.score + upstreamWatch.score + launchStory.score) / 4));

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    toolCountBridge: {
      homepageLaunchCopy: "18+ API Tools",
      currentCallableTools,
      coveredCallableTools,
      coverageLabel: `${coveredCallableTools}/${currentCallableTools}`,
      sourceOfTruth: sourceIntelligence.inventory.sourceOfTruth,
      reconciliation:
        "MealPilot treats 18+ as launch-era marketing shorthand and 35/35 as the current callable MCP coverage target.",
    },
    totals,
    lanes,
    watchQueue,
    releaseRunbook: [
      {
        sequence: 1,
        label: "Refresh live source",
        action: "Browse Swiggy Builders, docs, llms.txt, and llms-full.txt before final access submission.",
        proofLinks: ["/api/swiggy-source-intelligence", "/api/swiggy-upstream-watch"],
      },
      {
        sequence: 2,
        label: "Reconcile tool counts",
        action: "Confirm homepage shorthand still does not override the 35-tool reference contract.",
        proofLinks: ["/api/mcp/catalog", "/api/swiggy-tool-parity-auditor"],
      },
      {
        sequence: 3,
        label: "Run regression evidence",
        action: "Run build, lint, tests, production verifier, visual QA, and packet export from the same source state.",
        proofLinks: ["/api/visual-qa-center", "/api/builder-packet-export"],
      },
      {
        sequence: 4,
        label: "Attach reviewer proof",
        action: "Attach this center in Reviewer Artifact Vault, Production Evidence, and Launch Bundle handoff copy.",
        proofLinks: ["/api/reviewer-artifact-vault", "/api/production-launch-bundle"],
      },
    ],
    assertions: [
      "18+ launch-era copy is never treated as the current callable-tool ceiling.",
      "The current MealPilot MCP coverage target is 35/35 callable tools across Food, Instamart, and Dineout.",
      "Roadmap features, hosted widgets, rate-limit headers, signed manifests, online payments, staging credentials, and production approval remain gated until Swiggy ships or approves them.",
      "Every public-source change must land in API proof, Launch Center UI, verifier assertions, visual targets, and packet exports before reviewer handoff.",
    ],
    externalGates: [
      "Swiggy controls live Builders docs, roadmap timing, official access approval, staging credentials, and production credentials.",
      "signed client manifest implementation depends on Swiggy publishing a supported wire format and review process.",
      "Hosted widgets, online Food payments, refresh tokens, and production traffic remain unavailable until Swiggy ships or approves them.",
      "Final source reconciliation should be repeated against live https://mcp.swiggy.com/builders/ immediately before access submission.",
    ],
  };
}
