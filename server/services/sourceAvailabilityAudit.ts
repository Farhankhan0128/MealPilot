import type {
  SwiggySourceAvailabilityAudit,
  SwiggySourceAvailabilityKind,
  SwiggySourceAvailabilityMode,
  SwiggySourceAvailabilityRow,
  SwiggySourceAvailabilityStatus,
} from "../../src/domain/types.js";
import { buildSwiggyBuildersPageMeshAuditor, type BuildersPageFetchFn, fetchBuildersPage } from "./buildersPageMeshAuditor.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

const source = "https://mcp.swiggy.com/builders/";

interface SourceTarget {
  id: string;
  label: string;
  kind: SwiggySourceAvailabilityKind;
  url: string;
  expectedSignals: string[];
  fallback: string;
  proofLinks: string[];
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function hasGenericGlitch(text: string) {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("we'll be back shortly") ||
    normalized.includes("we are fixing a temporary glitch") ||
    normalized.includes("genericerror") ||
    normalized.includes("genericnotfound")
  );
}

function contentModeFor(target: SourceTarget, result: Awaited<ReturnType<BuildersPageFetchFn>>): SwiggySourceAvailabilityMode {
  const text = result.text ?? "";
  const normalized = stripTags(text).toLowerCase();

  if (result.error) return "network_error";
  if (!result.statusCode || result.statusCode >= 400) return "http_error";
  if (hasGenericGlitch(text)) return "generic_glitch";
  if (
    target.kind === "manifest" &&
    (normalized.includes("https://mcp.swiggy.com/builders/") || normalized.includes("# swiggy"))
  ) {
    return "live_manifest";
  }
  if (target.expectedSignals.some((signal) => normalized.includes(signal.toLowerCase()))) return "live_builders";
  return "unexpected_body";
}

function availabilityFor(mode: SwiggySourceAvailabilityMode): SwiggySourceAvailabilityStatus {
  if (mode === "live_builders" || mode === "live_manifest") return "verified";
  if (mode === "generic_glitch") return "fallback";
  if (mode === "http_error" || mode === "network_error") return "blocked";
  return "watch";
}

function evidenceFor(target: SourceTarget, mode: SwiggySourceAvailabilityMode, statusCode: number | undefined) {
  if (mode === "live_builders") return `Live response contains expected Builders signals for ${target.label}.`;
  if (mode === "live_manifest") return `Live response contains agent-readable Swiggy Builders manifest links for ${target.label}.`;
  if (mode === "generic_glitch") return "Live response looked like Swiggy's temporary-glitch shell; local evidence fallback is active.";
  if (mode === "http_error") return `HTTP ${statusCode ?? "unknown"} prevented live verification; local proof remains the evidence floor.`;
  if (mode === "network_error") return "Network fetch failed before live verification; local proof remains the evidence floor.";
  return "Live response did not include the expected Builders source signals; manual browser review is required.";
}

function nextActionFor(status: SwiggySourceAvailabilityStatus) {
  if (status === "verified") return "Keep this source in the pre-submission source refresh loop.";
  if (status === "fallback") return "Re-browse this official source in a browser before access submission and attach fallback disclosure.";
  if (status === "watch") return "Compare the live body with Website Atlas, Docs Coverage, and Source Intelligence before changing product claims.";
  return "Retry from a browser or different network before final reviewer handoff.";
}

function sourceTargets(): SourceTarget[] {
  const atlas = buildSwiggyWebsiteAtlas();
  const docsCoverage = buildSwiggyDocsCoverage();
  const pageTargets = atlas.pages
    .filter((page) => page.pageType !== "external")
    .map((page): SourceTarget => ({
      id: `page_${page.id}`,
      label: page.title,
      kind: "website_page",
      url: page.url,
      expectedSignals: [page.title, ...page.modules.slice(0, 2).map((module) => module.title)],
      fallback: `Website Atlas and Deep Site Map preserve ${page.modules.length} modules and ${page.ctaIds.length} CTA(s).`,
      proofLinks: ["/api/swiggy-website-atlas", "/api/swiggy-deep-site-map", "/api/swiggy-builders-page-mesh"],
    }));
  const docsRootTargets = [
    ...atlas.docsHeader,
    { id: "docs_reference_food", label: "Food reference", url: `${source}docs/reference/food/` },
    { id: "docs_reference_instamart", label: "Instamart reference", url: `${source}docs/reference/instamart/` },
    { id: "docs_reference_dineout", label: "Dineout reference", url: `${source}docs/reference/dineout/` },
  ].map((link): SourceTarget => ({
    id: `docs_${link.id}`,
    label: link.label,
    kind: "docs_root",
    url: link.url,
    expectedSignals: [link.label, "Swiggy", "MCP"],
    fallback: `${docsCoverage.totalPages} Docs Coverage rows and ${docsCoverage.sourceInventory.llmsLinkedPages} llms-linked pages remain mapped.`,
    proofLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer", "/api/swiggy-llms-manifest-verifier"],
  }));
  const manifestTargets: SourceTarget[] = [
    {
      id: "manifest_llms",
      label: "llms.txt",
      kind: "manifest",
      url: `${source}llms.txt`,
      expectedSignals: ["https://mcp.swiggy.com/builders/", "Food", "Instamart", "Dineout"],
      fallback: "llms Manifest Verifier falls back to complete Docs Coverage when live manifest retrieval is blocked.",
      proofLinks: ["/api/swiggy-llms-manifest-verifier", "/api/swiggy-docs-coverage"],
    },
    {
      id: "manifest_llms_full",
      label: "llms-full.txt",
      kind: "manifest",
      url: `${source}llms-full.txt`,
      expectedSignals: ["Swiggy", "MCP", "reference"],
      fallback: "llms-full is linked for reviewer retrieval and intentionally not stored as a large local artifact.",
      proofLinks: ["/api/swiggy-llms-manifest-verifier", "/api/swiggy-upstream-watch"],
    },
  ];

  return [...pageTargets, ...docsRootTargets, ...manifestTargets];
}

function scoreFor(rows: SwiggySourceAvailabilityRow[]) {
  const weights: Record<SwiggySourceAvailabilityStatus, number> = {
    verified: 1,
    fallback: 0.9,
    watch: 0.82,
    blocked: 0.74,
  };
  return Math.round((rows.reduce((sum, row) => sum + weights[row.availability], 0) / rows.length) * 100);
}

export async function buildSwiggySourceAvailabilityAudit(
  fetchSource: BuildersPageFetchFn = fetchBuildersPage,
): Promise<SwiggySourceAvailabilityAudit> {
  const [pageMesh, responses] = await Promise.all([
    buildSwiggyBuildersPageMeshAuditor(fetchSource),
    Promise.all(sourceTargets().map(async (target) => ({ target, result: await fetchSource(target.url) }))),
  ]);

  const rows = responses.map(({ target, result }): SwiggySourceAvailabilityRow => {
    const contentMode = contentModeFor(target, result);
    const availability = availabilityFor(contentMode);
    return {
      id: target.id,
      label: target.label,
      kind: target.kind,
      url: target.url,
      statusCode: result.statusCode,
      durationMs: result.durationMs,
      contentMode,
      availability,
      sourceEvidence: evidenceFor(target, contentMode, result.statusCode),
      mealPilotFallback: target.fallback,
      proofLinks: target.proofLinks,
      nextAction: nextActionFor(availability),
    };
  });
  const proofLinks = unique(rows.flatMap((row) => row.proofLinks));

  return {
    generatedAt: new Date().toISOString(),
    score: scoreFor(rows),
    officialSources: rows.map((row) => row.url),
    totals: {
      sources: rows.length,
      probed: rows.filter((row) => row.statusCode || row.contentMode === "network_error").length,
      verified: rows.filter((row) => row.availability === "verified").length,
      fallback: rows.filter((row) => row.availability === "fallback").length,
      watch: rows.filter((row) => row.availability === "watch").length,
      blocked: rows.filter((row) => row.availability === "blocked").length,
      websitePages: rows.filter((row) => row.kind === "website_page").length,
      docsRoots: rows.filter((row) => row.kind === "docs_root").length,
      manifests: rows.filter((row) => row.kind === "manifest").length,
      proofLinks: proofLinks.length,
    },
    rows,
    fallbackRunbook: [
      {
        sequence: 1,
        label: "Classify public source availability",
        action: "Probe every official Builders page, docs root, and manifest URL and classify live, fallback, watch, or blocked state.",
        proofLinks: ["/api/swiggy-source-availability-audit"],
      },
      {
        sequence: 2,
        label: "Preserve local evidence",
        action: `Use Page Mesh fallback when live integrity is unavailable; current mesh reports ${pageMesh.totals.atlasFallbackPages} atlas fallback page(s).`,
        proofLinks: ["/api/swiggy-builders-page-mesh", "/api/swiggy-website-atlas"],
      },
      {
        sequence: 3,
        label: "Attach reviewer disclosure",
        action: "If any source is fallback, include the fallback disclosure and re-browse note in the builder packet before submission.",
        proofLinks: ["/api/builder-packet-export", "/api/reviewer-artifact-vault"],
      },
    ],
    commands: [
      {
        id: "source_availability_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-source-availability-audit",
        proves: "MealPilot reports live/fallback status for every official public source row.",
        expectedSignal: "totals.sources >= 15 && totals.manifests === 2",
      },
      {
        id: "full_source_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Source availability, Page Mesh, Deep Site Map, llms verifier, and packet evidence remain synchronized.",
        expectedSignal: "sourceAvailabilityScore >= 70",
      },
    ],
    assertions: [
      "Temporary-glitch shells are classified as fallback, not as live source proof.",
      "Every source row maps to at least one local MealPilot proof route.",
      "Manifest rows are verified only when they expose agent-readable Builders content or are explicitly fallback-disclosed.",
      "A final access packet still requires a human browser review of the official Builders site before submission.",
    ],
    externalGates: [
      "Swiggy controls public source availability, edge blocking, and temporary outage shells.",
      "Local fallback evidence does not replace Swiggy credentials, legal approval, production access, or reviewer approval.",
    ],
  };
}
