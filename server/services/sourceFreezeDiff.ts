import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  UserProfile,
  SwiggySourceFreezeDiffMode,
  SwiggySourceFreezeDiffReport,
  SwiggySourceFreezeDiffRow,
  SwiggySourceFreezeDiffStatus,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";
import {
  buildSwiggyBuildersPageMeshAuditor,
  type BuildersPageFetchFn,
} from "./buildersPageMeshAuditor.js";
import { buildBuilderPacketExport } from "./builderPacketExport.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";
import { buildLaunchBundle } from "./launchBundle.js";
import { buildSwiggySourceIntelligence } from "./sourceIntelligence.js";
import { buildSwiggyUpstreamWatch } from "./upstreamWatch.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";
import { buildSwiggyAccessEvidenceMatrix } from "./accessEvidenceMatrix.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/docs/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/llms-full.txt",
];

function statusScore(status: SwiggySourceFreezeDiffStatus) {
  if (status === "matched") return 1;
  if (status === "watch") return 0.78;
  return 0.4;
}

function row(
  id: string,
  label: string,
  source: string,
  liveValue: string | number,
  localValue: string | number,
  status: SwiggySourceFreezeDiffStatus,
  evidenceLinks: string[],
  nextAction: string,
): SwiggySourceFreezeDiffRow {
  return {
    id,
    label,
    source,
    liveValue: String(liveValue),
    localValue: String(localValue),
    status,
    evidenceLinks,
    nextAction,
  };
}

function scoreFor(rows: SwiggySourceFreezeDiffRow[]) {
  const weighted = rows.reduce((sum, item) => sum + statusScore(item.status), 0);
  return Math.round((weighted / rows.length) * 100);
}

function freezeId(mode: SwiggySourceFreezeDiffMode) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  return `swiggy-source-freeze-${mode}-${stamp}`;
}

export async function buildSwiggySourceFreezeDiff(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
  mode?: SwiggySourceFreezeDiffMode;
  includeLivePageMesh?: boolean;
  includeLlmsManifest?: boolean;
  includeAccessPacket?: boolean;
  includeBrowserRebrowse?: boolean;
  fetchPage?: BuildersPageFetchFn;
}): Promise<SwiggySourceFreezeDiffReport> {
  const mode = options.mode ?? "pre_access_submission";
  const includeLivePageMesh = options.includeLivePageMesh ?? true;
  const includeLlmsManifest = options.includeLlmsManifest ?? true;
  const includeAccessPacket = options.includeAccessPacket ?? true;
  const includeBrowserRebrowse = options.includeBrowserRebrowse ?? mode !== "post_source_change";
  const atlas = buildSwiggyWebsiteAtlas();
  const docsCoverage = buildSwiggyDocsCoverage();
  const sourceIntelligence = buildSwiggySourceIntelligence();
  const upstreamWatch = buildSwiggyUpstreamWatch();
  const accessEvidence = buildSwiggyAccessEvidenceMatrix(options);
  const packet = buildBuilderPacketExport(options);
  const launchBundle = buildLaunchBundle({ config: options.config, latestPlan: options.latestPlan });
  const pageMesh = includeLivePageMesh
    ? await buildSwiggyBuildersPageMeshAuditor(options.fetchPage)
    : undefined;
  const footerLinks = atlas.footerGroups.reduce((sum, group) => sum + group.links.length, 0);
  const pageMeshPages = pageMesh?.totals.pages ?? atlas.pages.filter((page) => page.pageType !== "external").length;
  const fetchedPages = pageMesh?.totals.fetchedPages ?? 0;
  const verifiedPages = pageMesh?.totals.integrityVerifiedPages ?? 0;
  const atlasFallbackPages = pageMesh?.totals.atlasFallbackPages ?? pageMeshPages;
  const unsafeLinks = pageMesh?.totals.unsafeLinks ?? 0;
  const rows = [
    row(
      "builders_pages",
      "Builders page inventory",
      "Live Page Mesh vs Website Atlas",
      `${verifiedPages}/${pageMeshPages} verified, ${atlasFallbackPages} fallback`,
      `${atlas.pagesCovered} atlas pages`,
      !includeLivePageMesh ? "watch" : pageMesh?.status === "blocked" ? "blocked" : pageMeshPages >= 7 ? "matched" : "watch",
      ["/api/swiggy-builders-page-mesh", "/api/swiggy-website-atlas"],
      "Refresh Website Atlas and Page Mesh if the public Builders page count changes.",
    ),
    row(
      "header_footer",
      "Header and footer links",
      "Builders homepage navigation",
      `${atlas.globalHeader.length} header / ${footerLinks} footer`,
      `${sourceIntelligence.inventory.headerLinks} header / ${sourceIntelligence.inventory.footerLinks} footer`,
      atlas.globalHeader.length === sourceIntelligence.inventory.headerLinks &&
        footerLinks === sourceIntelligence.inventory.footerLinks
        ? "matched"
        : "watch",
      ["/api/swiggy-website-atlas", "/api/swiggy-source-intelligence"],
      "Reconcile any header/footer delta before recording the final demo.",
    ),
    row(
      "cta_inventory",
      "CTA inventory",
      "Start Building, Request access, Send Us a Demo, docs/footer CTAs",
      atlas.ctasCovered,
      sourceIntelligence.inventory.ctas,
      atlas.ctasCovered >= 11 && sourceIntelligence.inventory.ctas >= 11 ? "matched" : "watch",
      ["/api/swiggy-cta-execution-center", "/api/swiggy-cta-live-audit"],
      "Keep each official CTA mapped to a local proof route, manual browser action, or external gate.",
    ),
    row(
      "llms_docs",
      "llms and markdown docs",
      "llms.txt, llms-full.txt, and markdown twins",
      includeLlmsManifest ? docsCoverage.totalPages : "skipped",
      sourceIntelligence.inventory.llmsLinkedPages,
      includeLlmsManifest && docsCoverage.totalPages === sourceIntelligence.inventory.llmsLinkedPages ? "matched" : "watch",
      ["/api/swiggy-llms-manifest-verifier", "/api/swiggy-docs-twin-explorer"],
      "Re-run llms manifest verification if Swiggy adds or removes markdown pages.",
    ),
    row(
      "reference_tools",
      "MCP reference tools",
      "Food, Instamart, and Dineout reference pages",
      sourceIntelligence.inventory.toolReferenceTools,
      "35 callable tools",
      sourceIntelligence.inventory.toolReferenceTools === 35 ? "matched" : "blocked",
      ["/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/swiggy-tool-parity-auditor"],
      "A tool-count delta must create schema, mock, Tool Lab, route, safety, and verifier updates.",
    ),
    row(
      "access_packet",
      "Access packet proof",
      "Access Evidence Matrix and Builder Packet Export",
      includeAccessPacket ? `${accessEvidence.totals.rows} evidence rows` : "skipped",
      `${packet.totals.packetFiles} packet files / ${packet.totals.visualTargets} visual targets`,
      includeAccessPacket && accessEvidence.totals.rows >= 50 && packet.totals.packetFiles >= 4 ? "matched" : "watch",
      ["/api/swiggy-access-evidence-matrix", "/api/builder-packet-export"],
      "Export the builder packet after the final freeze and attach the ignored artifacts to the reviewer handoff.",
    ),
    row(
      "upstream_watch",
      "Upstream roadmap watch",
      "Changelog, roadmap, signed manifest, hosted widgets, payment gates",
      `${upstreamWatch.roadmapItems.length} roadmap watches`,
      `${sourceIntelligence.driftSignals.length} drift signals`,
      upstreamWatch.roadmapItems.length >= 10 && sourceIntelligence.driftSignals.length >= 5 ? "matched" : "watch",
      ["/api/swiggy-upstream-watch", "/api/swiggy-source-intelligence"],
      "Keep roadmap behavior separate from shipped behavior until Swiggy releases or approves it.",
    ),
    row(
      "browser_rebrowse",
      "Manual browser re-browse gate",
      "Official Swiggy Builders site",
      includeBrowserRebrowse ? "required before submission" : "not required for this mode",
      pageMesh?.status ?? "local source freeze",
      includeBrowserRebrowse && mode === "pre_access_submission" ? "watch" : "matched",
      ["/api/swiggy-builders-live-source-resilience", "https://mcp.swiggy.com/builders/"],
      "Open the live Builders site in a browser immediately before recording or submitting the access packet.",
    ),
  ];
  const missingInputs = rows
    .filter((item) => item.status !== "matched")
    .map((item) => `${item.label}: ${item.nextAction}`);
  if (rows.some((item) => item.status === "blocked")) {
    missingInputs.push("blocked Swiggy source contract change");
  }
  const score = scoreFor(rows);
  const decision: SwiggySourceFreezeDiffReport["decision"] =
    rows.some((item) => item.status === "blocked")
      ? "blocked_external_gate"
      : missingInputs.length > 0
        ? "refresh_required"
        : "ready_to_freeze";

  return {
    generatedAt: new Date().toISOString(),
    freezeId: freezeId(mode),
    decision,
    score,
    mode,
    includeLivePageMesh,
    includeLlmsManifest,
    includeAccessPacket,
    includeBrowserRebrowse,
    officialSources,
    liveSnapshot: {
      homepageMode: pageMesh?.status ?? "not_fetched",
      pageMeshPages,
      fetchedPages,
      verifiedPages,
      atlasFallbackPages,
      unsafeLinks,
      ctas: atlas.ctasCovered,
      headerLinks: atlas.globalHeader.length,
      footerLinks,
      llmsPages: docsCoverage.totalPages,
      referenceTools: sourceIntelligence.inventory.toolReferenceTools,
    },
    localPacket: {
      sourceIntelligenceScore: sourceIntelligence.score,
      sourceClusters: sourceIntelligence.clusters.length,
      driftSignals: sourceIntelligence.driftSignals.length,
      accessEvidenceRows: accessEvidence.totals.rows,
      packetFiles: packet.totals.packetFiles,
      packetVisualTargets: packet.totals.visualTargets,
      launchArtifacts: launchBundle.artifacts.length,
    },
    diffRows: rows,
    commands: [
      {
        command: "curl -fsS http://localhost:8787/api/swiggy-source-freeze-diff",
        proves: "Final live-source freeze diff, snapshot counts, missing inputs, and proof commands are current.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Source Intelligence, Upstream Watch, Page Mesh, Access Evidence, and Builder Packet stay aligned.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet",
        proves: "Ignored reviewer packet artifacts are regenerated after the freeze decision.",
      },
    ],
    missingInputs,
    telemetry: [
      { field: "mode", value: mode, redaction: "safe source-freeze mode" },
      { field: "decision", value: decision, redaction: "safe source-freeze decision" },
      { field: "page_mesh_pages", value: String(pageMeshPages), redaction: "aggregate count only" },
      { field: "verified_pages", value: String(verifiedPages), redaction: "aggregate count only" },
      { field: "reference_tools", value: String(sourceIntelligence.inventory.toolReferenceTools), redaction: "aggregate count only" },
      { field: "access_evidence_rows", value: String(accessEvidence.totals.rows), redaction: "aggregate count only" },
    ],
    assertions: [
      "The freeze diff accepts no user-supplied source URL; it only reads the official Swiggy Builders source set.",
      "Live fetch fallback is disclosed as atlas fallback and never counted as silent source parity.",
      "Header, footer, CTA, docs, llms, reference-tool, access-packet, and roadmap signals must all align before final submission.",
      "A browser re-browse remains an operator gate because automated HTTP checks cannot prove the whole human-visible website experience.",
    ],
    externalGates: [
      "Swiggy can update Builders pages, llms manifests, docs, or reference tools without notice.",
      "Live staging credentials and seeded users remain required before source freeze can become credentialed replay proof.",
      "Operator must open the official Builders page in a browser before final access submission.",
    ],
    nextAction:
      decision === "ready_to_freeze"
        ? "Regenerate the builder packet, record the demo, and submit the access form with the frozen source proof attached."
        : decision === "refresh_required"
          ? `Resolve ${missingInputs.join("; ")} before recording or submitting the access packet.`
          : "Stop final submission until the blocked Swiggy source contract change is reconciled.",
  };
}
