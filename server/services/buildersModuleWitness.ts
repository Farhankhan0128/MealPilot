import type {
  MealPlan,
  SwiggyBuildersModuleIntelligenceItem,
  SwiggyBuildersModuleWitness,
  SwiggyBuildersModuleWitnessRow,
  SwiggyBuildersModuleWitnessSourceState,
  SwiggyBuildersModuleWitnessStatus,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";
import { buildSwiggyBuildersPageMeshAuditor, type BuildersPageFetchFn } from "./buildersPageMeshAuditor.js";
import { buildSwiggyDeepSiteMap } from "./deepSiteMap.js";
import { buildSwiggyBuildersModuleIntelligenceCenter } from "./moduleIntelligence.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function sourceStateFor(contentIntegrity?: "verified" | "atlas_fallback" | "blocked"): SwiggyBuildersModuleWitnessSourceState {
  if (contentIntegrity === "verified") return "live_verified";
  if (contentIntegrity === "blocked") return "source_blocked";
  if (contentIntegrity === "atlas_fallback") return "atlas_fallback";
  return "not_live_checked";
}

function statusFor(
  module: SwiggyBuildersModuleIntelligenceItem,
  sourceState: SwiggyBuildersModuleWitnessSourceState,
): SwiggyBuildersModuleWitnessStatus {
  if (sourceState === "source_blocked") return "blocked";
  if (module.status === "operator_gate") return "operator_gate";
  if (module.status === "swiggy_gate") return "swiggy_gate";
  if (module.status === "watch") return "watch";
  if (sourceState === "live_verified") return "proven";
  if (sourceState === "atlas_fallback") return "fallback";
  return "watch";
}

function weightFor(status: SwiggyBuildersModuleWitnessStatus) {
  if (status === "proven") return 1;
  if (status === "fallback") return 0.9;
  if (status === "operator_gate") return 0.84;
  if (status === "swiggy_gate") return 0.78;
  if (status === "watch") return 0.72;
  return 0.45;
}

function evidenceFor(module: SwiggyBuildersModuleIntelligenceItem, sourceState: SwiggyBuildersModuleWitnessSourceState) {
  if (sourceState === "live_verified") {
    return "Page Mesh live verification and Module Intelligence agree on this official module signal.";
  }
  if (sourceState === "atlas_fallback") {
    return "Website Atlas and Module Intelligence preserve the module witness while the live public page returns fallback content.";
  }
  if (sourceState === "source_blocked") {
    return "Automated source fetch was blocked; the module stays visible as blocked drift until re-browsed.";
  }
  if (module.owner === "Swiggy") {
    return "Module is mapped locally, but the final capability remains Swiggy-owned until approval.";
  }
  return "Module Intelligence maps this module while Page Mesh has no live page to verify.";
}

export async function buildSwiggyBuildersModuleWitness(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
  fetchPage?: BuildersPageFetchFn;
}): Promise<SwiggyBuildersModuleWitness> {
  const [moduleIntelligence, pageMesh] = await Promise.all([
    Promise.resolve(buildSwiggyBuildersModuleIntelligenceCenter()),
    buildSwiggyBuildersPageMeshAuditor(options.fetchPage),
  ]);
  const deepSiteMap = buildSwiggyDeepSiteMap({ config: options.config, latestPlan: options.latestPlan });
  const pageMeshById = new Map(pageMesh.pages.map((page) => [page.id, page]));
  const deepPageById = new Map(deepSiteMap.pages.map((page) => [page.id, page]));

  const rows: SwiggyBuildersModuleWitnessRow[] = moduleIntelligence.modules.map((module) => {
    const meshPage = pageMeshById.get(module.pageId);
    const deepPage = deepPageById.get(module.pageId);
    const sourceState = sourceStateFor(meshPage?.contentIntegrity);
    const status = statusFor(module, sourceState);
    const proofLinks = unique([
      ...module.proofLinks,
      ...(deepPage?.proofLinks ?? []),
      ...(meshPage?.evidenceLinks ?? []),
      "/api/swiggy-builders-module-intelligence",
      "/api/swiggy-builders-page-mesh",
    ]);

    return {
      id: module.id,
      pageId: module.pageId,
      pageTitle: module.pageTitle,
      moduleTitle: module.title,
      moduleType: module.moduleType,
      sourceUrl: module.sourceUrl,
      officialSignal: module.officialSignal,
      status,
      sourceState,
      owner: module.owner,
      pageCoverageStatus: meshPage?.status ?? "not_live_checked",
      proofLinks,
      evidence: evidenceFor(module, sourceState),
      nextAction:
        status === "fallback"
          ? "Re-browse the live Swiggy Builders page before demo recording, then keep the Website Atlas fallback disclosed if Swiggy serves a temporary shell."
          : module.nextAction,
      ctaIds: module.ctaIds,
      routeOptimization: module.routeOptimization,
      riskBoundary: module.riskBoundary,
    };
  });

  const proofLinks = unique(rows.flatMap((row) => row.proofLinks));
  const pageSummaries = moduleIntelligence.pageGroups.map((group) => {
    const pageRows = rows.filter((row) => row.pageId === group.pageId);
    const meshPage = pageMeshById.get(group.pageId);
    return {
      pageId: group.pageId,
      title: group.title,
      sourceUrl: group.sourceUrl,
      modules: pageRows.length,
      proven: pageRows.filter((row) => row.status === "proven").length,
      fallback: pageRows.filter((row) => row.status === "fallback").length,
      watch: pageRows.filter((row) => row.status === "watch" || row.status === "blocked").length,
      operatorGates: pageRows.filter((row) => row.status === "operator_gate").length,
      swiggyGates: pageRows.filter((row) => row.status === "swiggy_gate").length,
      sourceState: sourceStateFor(meshPage?.contentIntegrity),
      proofLinks: unique(pageRows.flatMap((row) => row.proofLinks)),
    };
  });

  const blocked = rows.filter((row) => row.status === "blocked").length;
  const watch = rows.filter((row) => row.status === "watch").length;
  const fallback = rows.filter((row) => row.status === "fallback").length;
  const gated = rows.filter((row) => row.status === "operator_gate" || row.status === "swiggy_gate").length;
  const decision: SwiggyBuildersModuleWitness["decision"] =
    blocked > 0 ? "blocked_module_drift" : watch + fallback + gated > 0 ? "module_witness_watch" : "module_witness_ready";
  const score = Math.round((rows.reduce((sum, row) => sum + weightFor(row.status), 0) / rows.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    decision,
    officialSources: unique([...moduleIntelligence.officialSources, ...pageMesh.officialSources, ...deepSiteMap.officialSources]),
    totals: {
      modules: rows.length,
      proven: rows.filter((row) => row.status === "proven").length,
      fallback,
      watch,
      operatorGates: rows.filter((row) => row.status === "operator_gate").length,
      swiggyGates: rows.filter((row) => row.status === "swiggy_gate").length,
      blocked,
      pages: pageSummaries.length,
      ctaMappedModules: rows.filter((row) => row.ctaIds.length > 0).length,
      liveVerifiedPages: pageMesh.totals.integrityVerifiedPages,
      atlasFallbackPages: pageMesh.totals.atlasFallbackPages,
      proofLinks: proofLinks.length,
    },
    rows,
    pageSummaries,
    commands: [
      {
        id: "module_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-module-witness",
        proves: "Every Website Atlas module has source state, owner, proof links, route optimization, and risk boundary in one receipt.",
        expectedSignal: "totals.modules >= 38 && totals.blocked === 0",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke keeps Module Witness aligned with Page Mesh, Deep Site Map, and Module Intelligence.",
        expectedSignal: "moduleWitnessScore >= 80",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Module Witness Launch Center card is captured with all reviewer-critical surfaces.",
        expectedSignal: "74 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Every Website Atlas module has one Module Witness row.",
      "Module Witness composes Module Intelligence, Page Mesh, and Deep Site Map without inventing new Swiggy product claims.",
      "Live page fallback, source block, operator gate, and Swiggy approval gate states stay visible to reviewers.",
      "Every module row carries proof links, route optimization, risk boundary, source URL, CTA mapping, and next action.",
    ],
    externalGates: [
      "Swiggy public pages can serve fallback or temporary-glitch shells; re-browse before final access submission.",
      "External forms, email sends, legal terms, co-branding, quotas, credentials, and production approval remain outside local automation.",
      "Food, Instamart, and Dineout production behavior requires issued Swiggy credentials and staging certification.",
    ],
  };
}
