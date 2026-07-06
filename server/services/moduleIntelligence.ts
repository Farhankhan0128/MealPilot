import type {
  SwiggyBuildersModuleIntelligenceCenter,
  SwiggyBuildersModuleIntelligenceItem,
  SwiggyBuildersModuleIntelligenceStatus,
  SwiggyBuildersModuleJourney,
  SwiggyWebsiteModule,
  SwiggyWebsitePageAtlas,
} from "../../src/domain/types.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

const buildersRoot = "https://mcp.swiggy.com/builders/";

const proofByPage: Record<string, string[]> = {
  home: ["/api/swiggy-website-atlas", "/api/swiggy-builders-site-parity", "/api/swiggy-conversion-center"],
  developers: ["/api/swiggy-innovation-radar", "/api/channel-multimodal-studio", "/api/mcp/tool-lab"],
  access: ["/api/access-submission-studio", "/api/swiggy-access-evidence-matrix", "/api/production-launch-bundle"],
  enterprises: ["/api/enterprise-platform-center", "/api/enterprise-delegated-auth", "/api/swiggy-growth-partnership"],
  blog_launch: ["/api/swiggy-builders-launch-story", "/api/swiggy-showcase-submission-center", "/api/swiggy-demo-evidence-director"],
  docs_home: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer", "/api/coding-agent-governance"],
  reference: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix"],
  footer: ["/api/swiggy-faq-resolution-center", "/api/swiggy-partner-support-room", "/api/data-governance-center"],
};

const proofByType: Record<SwiggyWebsiteModule["moduleType"], string[]> = {
  hero: ["/api/swiggy-builders-launch-story", "/api/premium-use-case-studio"],
  proof: ["/api/reviewer-artifact-vault", "/api/production-launch-bundle"],
  steps: ["/api/swiggy-submission-timeline-center", "/api/staging-certification-matrix"],
  toolkit: ["/api/mcp/tool-lab", "/api/swiggy-journey-compiler"],
  faq: ["/api/swiggy-faq-policy", "/api/swiggy-faq-resolution-center"],
  cta: ["/api/swiggy-cta-execution-center", "/api/swiggy-conversion-center"],
  docs_grid: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer"],
  footer: ["/api/swiggy-partner-support-room", "/api/swiggy-source-intelligence"],
  legal: ["/api/data-governance-center", "/api/brand-compliance-kit"],
};

const promiseByType: Record<SwiggyWebsiteModule["moduleType"], string> = {
  hero: "Turn the page's main promise into a reviewer-visible MealPilot capability.",
  proof: "Convert public benefits and credibility claims into measured evidence surfaces.",
  steps: "Map the official journey into owner-assigned runbooks and launch gates.",
  toolkit: "Translate Swiggy MCP tool and build ideas into executable MealPilot routes.",
  faq: "Resolve reviewer questions with evidence, safety boundaries, and external gates.",
  cta: "Make the next click copy-ready, proof-backed, and safely human-gated when external.",
  docs_grid: "Keep agent-readable docs, rendered pages, and local implementation surfaces reconciled.",
  footer: "Preserve support, resources, source manifests, and legal links in the access packet.",
  legal: "Keep legal, privacy, brand, and data boundaries explicit before live launch claims.",
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyBuildersModuleIntelligenceStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.82;
  if (status === "operator_gate") return 0.74;
  return 0.62;
}

function statusFor(page: SwiggyWebsitePageAtlas, module: SwiggyWebsiteModule): SwiggyBuildersModuleIntelligenceStatus {
  if (module.moduleType === "legal" || module.id.includes("ready_to_apply") || module.id.includes("final_cta")) {
    return "operator_gate";
  }
  if (
    module.officialSignal.toLowerCase().includes("production access") ||
    module.officialSignal.toLowerCase().includes("co-branding") ||
    module.officialSignal.toLowerCase().includes("custom integration") ||
    page.primaryAudience === "enterprises"
  ) {
    return "swiggy_gate";
  }
  if (module.status === "documented") return "watch";
  return "ready";
}

function ownerFor(status: SwiggyBuildersModuleIntelligenceStatus, module: SwiggyWebsiteModule) {
  if (status === "swiggy_gate") return "Swiggy";
  if (status === "operator_gate") return "Operator";
  if (module.moduleType === "steps" || module.moduleType === "proof") return "Joint";
  return "MealPilot";
}

function swiggySurfaceFor(page: SwiggyWebsitePageAtlas, module: SwiggyWebsiteModule) {
  if (module.moduleType === "toolkit") return "Food, Instamart, Dineout MCP reference and route recipes";
  if (module.moduleType === "docs_grid") return "Start, Build, Reference, Operate docs plus llms manifests";
  if (module.moduleType === "cta") return "Builders CTA, access form, docs link, or builders@swiggy.in handoff";
  if (module.moduleType === "legal") return "Swiggy legal, privacy, access guidelines, and compliance expectations";
  if (page.primaryAudience === "enterprises") return "Enterprise Builders access, delegated auth, support, quotas, and commercial review";
  return "Swiggy Builders public website and MCP platform promise";
}

function mealPilotSurfaceFor(page: SwiggyWebsitePageAtlas, module: SwiggyWebsiteModule) {
  if (module.moduleType === "toolkit") return "Tool Lab, Journey Compiler, Scenario Runner, and route optimizer";
  if (module.moduleType === "cta") return "CTA Execution, Conversion Center, Access Submission Studio, and Builder Packet Export";
  if (module.moduleType === "faq") return "FAQ Policy Center, FAQ Resolution Center, and reviewer script";
  if (module.moduleType === "legal") return "Data Governance, Brand Compliance, Access Dossier, and safety docs";
  if (page.id === "blog_launch") return "Builders Launch Story, Showcase Submission, Demo Evidence Director, and Launch Bundle";
  return module.mealPilotCoverage;
}

function routeOptimizationFor(module: SwiggyWebsiteModule) {
  if (module.moduleType === "toolkit") return "Prefer batched read-first discovery, cache stable metadata, and keep commercial actions out of parallel batches.";
  if (module.moduleType === "steps") return "Sequence build, proof freeze, access submission, staging, soak, and production promotion with explicit owner gates.";
  if (module.moduleType === "cta") return "Prepare the local proof first, then hand the operator to the external form, mail client, or docs link.";
  if (module.moduleType === "docs_grid") return "Use llms markdown twins for agent retrieval and rendered pages for browser proof.";
  if (module.moduleType === "faq" || module.moduleType === "legal") return "Answer from local evidence, then preserve legal, policy, or approval decisions as human review gates.";
  return "Route users from inspiration into a concrete MealPilot proof surface before asking for Swiggy approval.";
}

function riskBoundaryFor(status: SwiggyBuildersModuleIntelligenceStatus, module: SwiggyWebsiteModule) {
  if (status === "swiggy_gate") return "Do not claim access, feature placement, co-branding, quotas, or production readiness before Swiggy approval.";
  if (status === "operator_gate") return "Do not auto-submit forms, send email, accept legal terms, or request credentials from local automation.";
  if (module.moduleType === "toolkit") return "Every mutation or commercial action stays behind explicit confirmation and fresh Swiggy readbacks.";
  return "Keep public-source evidence separated from credentialed staging or production execution.";
}

function nextActionFor(status: SwiggyBuildersModuleIntelligenceStatus, module: SwiggyWebsiteModule) {
  if (status === "ready") return "Keep this module green in production verifier, visual QA, and builder packet export.";
  if (status === "watch") return "Refresh the live page and update the mapped proof if Swiggy changes the module copy.";
  if (status === "operator_gate") return "Prepare proof locally, then let the operator complete the browser, mail, or legal action manually.";
  return `Wait for Swiggy approval before presenting ${module.title} as live production capability.`;
}

function itemFor(page: SwiggyWebsitePageAtlas, module: SwiggyWebsiteModule): SwiggyBuildersModuleIntelligenceItem {
  const status = statusFor(page, module);
  return {
    id: module.id,
    pageId: page.id,
    pageTitle: page.title,
    title: module.title,
    moduleType: module.moduleType,
    officialSignal: module.officialSignal,
    audience: page.primaryAudience,
    sourceUrl: page.url,
    owner: ownerFor(status, module),
    status,
    productPromise: promiseByType[module.moduleType],
    swiggySurface: swiggySurfaceFor(page, module),
    mealPilotSurface: mealPilotSurfaceFor(page, module),
    routeOptimization: routeOptimizationFor(module),
    riskBoundary: riskBoundaryFor(status, module),
    ctaIds: page.ctaIds,
    proofLinks: unique([...(proofByPage[page.id] ?? []), ...proofByType[module.moduleType]]),
    nextAction: nextActionFor(status, module),
  };
}

function journey(
  id: string,
  label: string,
  modules: SwiggyBuildersModuleIntelligenceItem[],
  moduleIds: string[],
  promise: string,
  nextAction: string,
): SwiggyBuildersModuleJourney {
  const matched = modules.filter((item) => moduleIds.includes(item.id));
  const statuses = matched.map((item) => item.status);
  const status: SwiggyBuildersModuleIntelligenceStatus = statuses.includes("swiggy_gate")
    ? "swiggy_gate"
    : statuses.includes("operator_gate")
      ? "operator_gate"
      : statuses.includes("watch")
        ? "watch"
        : "ready";

  return {
    id,
    label,
    moduleIds,
    promise,
    proofLinks: unique(matched.flatMap((item) => item.proofLinks)),
    status,
    nextAction,
  };
}

export function buildSwiggyBuildersModuleIntelligenceCenter(): SwiggyBuildersModuleIntelligenceCenter {
  const atlas = buildSwiggyWebsiteAtlas();
  const modules = atlas.pages.flatMap((page) => page.modules.map((module) => itemFor(page, module)));
  const proofLinks = unique(modules.flatMap((module) => module.proofLinks));
  const pageGroups = atlas.pages.map((page) => {
    const pageModules = modules.filter((module) => module.pageId === page.id);
    return {
      pageId: page.id,
      title: page.title,
      sourceUrl: page.url,
      modules: pageModules.length,
      ready: pageModules.filter((module) => module.status === "ready").length,
      operatorGates: pageModules.filter((module) => module.status === "operator_gate").length,
      swiggyGates: pageModules.filter((module) => module.status === "swiggy_gate").length,
      proofLinks: unique(pageModules.flatMap((module) => module.proofLinks)),
    };
  });
  const journeys = [
    journey(
      "homepage_to_access",
      "Homepage to access packet",
      modules,
      ["home_hero", "home_how_it_works", "home_final_cta", "access_ready_to_apply"],
      "A visitor can move from homepage intent to a prepared access packet without losing proof context.",
      "Keep Conversion Center, Access Submission Studio, and Builder Packet Export synchronized.",
    ),
    journey(
      "developer_innovation",
      "Developer idea to working route",
      modules,
      ["developers_hero", "developers_build_ideas", "developers_toolkit", "reference_food", "reference_instamart", "reference_dineout"],
      "Developer inspiration converts into all-server MealPilot route plans and executable Tool Lab proof.",
      "Use Tool Lab and Journey Compiler as the regression basis for new route ideas.",
    ),
    journey(
      "operate_to_go_live",
      "Operate docs to go-live gates",
      modules,
      ["access_application_fields", "access_review_checks", "access_ground_rules", "access_legal_framework", "blog_launch_builder_journey"],
      "Access, review, compliance, and production promotion stay owner-tagged from the first demo.",
      "Keep Swiggy-owned credentials, legal, and production approval gates explicit.",
    ),
    journey(
      "agent_docs_loop",
      "Agent source refresh loop",
      modules,
      ["docs_home_tracks", "docs_home_explore", "docs_home_standard", "footer_resources"],
      "Human reviewers and coding agents use the same official source loop.",
      "Refresh llms.txt, llms-full.txt, markdown twins, and rendered pages before final submission.",
    ),
  ];
  const scoreItems = [...modules, ...journeys];
  const score = Math.round((scoreItems.reduce((sum, item) => sum + statusWeight(item.status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources: unique([buildersRoot, ...atlas.pages.map((page) => page.url), `${buildersRoot}llms.txt`, `${buildersRoot}llms-full.txt`]),
    totals: {
      pages: atlas.pages.length,
      modules: modules.length,
      ready: modules.filter((module) => module.status === "ready").length,
      watch: modules.filter((module) => module.status === "watch").length,
      operatorGates: modules.filter((module) => module.status === "operator_gate").length,
      swiggyGates: modules.filter((module) => module.status === "swiggy_gate").length,
      ctaMappedModules: modules.filter((module) => module.ctaIds.length > 0).length,
      proofLinks: proofLinks.length,
      journeys: journeys.length,
    },
    modules,
    pageGroups,
    journeys,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Review homepage modules",
        action: "Open Module Intelligence, Website Atlas, and Site Parity before recording the access demo.",
        proofLinks: ["/api/swiggy-builders-module-intelligence", "/api/swiggy-website-atlas", "/api/swiggy-builders-site-parity"],
      },
      {
        sequence: 2,
        label: "Follow module journeys",
        action: "Use the four journeys to move from public promise into local proof, operator handoff, and Swiggy approval gates.",
        proofLinks: ["/api/swiggy-conversion-center", "/api/swiggy-submission-timeline-center", "/api/swiggy-source-intelligence"],
      },
      {
        sequence: 3,
        label: "Freeze reviewer evidence",
        action: "Run production verifier, visual QA, and builder packet export after module signals are stable.",
        proofLinks: ["/api/visual-qa-center", "/api/builder-packet-export", "/api/production-launch-bundle"],
      },
    ],
    assertions: [
      "Every Website Atlas module is converted into an owner, product promise, Swiggy surface, MealPilot proof surface, route optimization, and risk boundary.",
      "Homepage, developer, enterprise, access, docs, reference, blog, and footer modules remain tied to official source URLs.",
      "CTA, legal, credential, form, email, co-branding, quota, and production-access promises are marked as operator or Swiggy gates rather than local automation.",
      "Module journeys connect public website modules to executable MealPilot proof without inventing unsupported Swiggy APIs.",
    ],
    externalGates: [
      "Official website modules can drift; re-run live parity and page mesh immediately before final submission.",
      "Access forms, email sends, legal terms, co-branding, feature placement, quotas, and credentials stay external to local automation.",
      "Credentialed Food, Instamart, and Dineout execution requires Swiggy staging and production approval.",
    ],
  };
}
