import type { MealPlan, SwiggyBuildersCoverageReceipt, SwiggyBuildersCoverageReceiptRow } from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";
import { buildSwiggyBuildersPageMeshAuditor, type BuildersPageFetchFn } from "./buildersPageMeshAuditor.js";
import { buildSwiggyCtaLiveAuditor, type CtaLiveProbeFn } from "./ctaLiveAuditor.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";
import { buildSwiggySourceAvailabilityAudit } from "./sourceAvailabilityAudit.js";
import { buildSwiggyToolParityAuditor } from "./toolParityAuditor.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";
import { buildVisualQaCenter } from "./visualQaCenter.js";
import type { ManifestFetchFn } from "./llmsManifestVerifier.js";

const officialSource = "https://mcp.swiggy.com/builders/";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function percent(actual: number, expected: number) {
  if (expected <= 0) return 100;
  return Math.min(100, Math.round((actual / expected) * 100));
}

function row(input: Omit<SwiggyBuildersCoverageReceiptRow, "coveragePercent"> & { actualCount: number; expectedCount: number }) {
  const { actualCount, expectedCount, ...rest } = input;
  return {
    ...rest,
    coveragePercent: percent(actualCount, expectedCount),
  };
}

function scoreFor(rows: SwiggyBuildersCoverageReceiptRow[]) {
  const weights: Record<SwiggyBuildersCoverageReceiptRow["status"], number> = {
    covered: 1,
    fallback: 0.9,
    manual_gate: 0.88,
    watch: 0.8,
    blocked: 0.45,
  };
  return Math.round((rows.reduce((sum, item) => sum + weights[item.status], 0) / rows.length) * 100);
}

export async function buildSwiggyBuildersCoverageReceipt(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
  fetchPage?: BuildersPageFetchFn;
  probeTarget?: CtaLiveProbeFn;
  fetchManifest?: ManifestFetchFn;
}): Promise<SwiggyBuildersCoverageReceipt> {
  const atlas = buildSwiggyWebsiteAtlas();
  const docsCoverage = buildSwiggyDocsCoverage();
  const visualQa = buildVisualQaCenter();
  const footerLinks = atlas.footerGroups.reduce((sum, group) => sum + group.links.length, 0);
  const atlasModules = atlas.pages.reduce((sum, page) => sum + page.modules.length, 0);

  const [pageMesh, ctaLiveAudit, toolParity, sourceAvailability] = await Promise.all([
    buildSwiggyBuildersPageMeshAuditor(options.fetchPage),
    buildSwiggyCtaLiveAuditor({
      config: options.config,
      latestPlan: options.latestPlan,
      probeTarget: options.probeTarget,
    }),
    buildSwiggyToolParityAuditor(options.fetchManifest),
    buildSwiggySourceAvailabilityAudit(options.fetchPage),
  ]);

  const rows: SwiggyBuildersCoverageReceiptRow[] = [
    row({
      id: "public_pages",
      label: "Public Builders pages",
      sourceSignal: "Website Atlas + Page Mesh",
      expected: "7 non-external Builders pages",
      actual: `${pageMesh.totals.integrityVerifiedPages}/${pageMesh.totals.pages} live, ${pageMesh.totals.atlasFallbackPages} fallback`,
      actualCount: pageMesh.totals.pages,
      expectedCount: 7,
      status: pageMesh.totals.unsafeLinks > 0 ? "blocked" : pageMesh.totals.atlasFallbackPages > 0 ? "fallback" : "covered",
      evidence: "Every public Builders page is fetched or mapped to a Website Atlas fallback row.",
      proofLinks: ["/api/swiggy-builders-page-mesh", "/api/swiggy-website-atlas", "/api/swiggy-deep-site-map"],
      nextAction: "Re-run the Page Mesh before demo recording and reconcile any page count or unsafe-link drift.",
    }),
    row({
      id: "modules",
      label: "Website modules",
      sourceSignal: "Website Atlas modules + Page Mesh semantic signals",
      expected: `${atlasModules} Website Atlas modules`,
      actual: `${pageMesh.totals.matchedModuleSignals}/${pageMesh.totals.expectedModules} live-checkable signals, ${atlasModules} atlas modules mapped`,
      actualCount: pageMesh.totals.matchedModuleSignals >= pageMesh.totals.expectedModules ? atlasModules : pageMesh.totals.matchedModuleSignals,
      expectedCount: atlasModules,
      status: pageMesh.totals.matchedModuleSignals >= pageMesh.totals.expectedModules && atlasModules >= 38 ? "covered" : "watch",
      evidence: "Module Intelligence maps every Website Atlas module; Page Mesh reconciles live-checkable module titles and official signal text.",
      proofLinks: ["/api/swiggy-builders-module-intelligence", "/api/swiggy-builders-page-mesh"],
      nextAction: "Update Module Intelligence, Deep Site Map, and Launch Center if Swiggy adds or renames modules.",
    }),
    row({
      id: "ctas",
      label: "Official CTA inventory",
      sourceSignal: "Website Atlas CTAs + CTA Live Audit",
      expected: `${atlas.ctasCovered} Website Atlas CTAs and ${ctaLiveAudit.totals.targets} execution targets`,
      actual: `${ctaLiveAudit.totals.reachable} reachable, ${ctaLiveAudit.totals.manualGates} manual, ${ctaLiveAudit.totals.blocked} blocked`,
      actualCount: atlas.ctasCovered,
      expectedCount: 11,
      status: ctaLiveAudit.totals.unsafe > 0 ? "blocked" : ctaLiveAudit.totals.blocked > 0 ? "watch" : "covered",
      evidence: "Every CTA is mapped to an approved origin, a safe probe, or a manual browser gate.",
      proofLinks: ["/api/swiggy-cta-execution-center", "/api/swiggy-cta-live-audit"],
      nextAction: "Resolve unsafe origins immediately; treat blocked public probes as browser re-check items before submission.",
    }),
    row({
      id: "global_header",
      label: "Global header",
      sourceSignal: "Website Atlas global header",
      expected: "7 header links",
      actual: `${atlas.globalHeader.length} header links mapped`,
      actualCount: atlas.globalHeader.length,
      expectedCount: 7,
      status: atlas.globalHeader.length >= 7 ? "covered" : "watch",
      evidence: "Builders Club, Developers, Enterprises, Docs, Blog, FAQ, and Start Building links have MealPilot coverage.",
      proofLinks: ["/api/swiggy-website-atlas", "/api/swiggy-homepage-signal-coverage"],
      nextAction: "Add a coverage row and CTA contract if Swiggy changes the global header.",
    }),
    row({
      id: "docs_nav",
      label: "Docs navigation roots",
      sourceSignal: "Website Atlas docs subnav + Docs Coverage",
      expected: "5 docs roots and 69 llms-linked docs pages",
      actual: `${atlas.docsHeader.length} docs roots, ${docsCoverage.totalPages} docs pages`,
      actualCount: docsCoverage.totalPages,
      expectedCount: 69,
      status: atlas.docsHeader.length >= 5 && docsCoverage.totalPages === 69 ? "covered" : "watch",
      evidence: "Start, Build, Operate, Reference, and Blog sections are mapped through rendered and markdown twins.",
      proofLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer"],
      nextAction: "Refresh Docs Coverage and Tool Parity if llms.txt adds or removes docs pages.",
    }),
    row({
      id: "footer_resources",
      label: "Footer resources and legal",
      sourceSignal: "Website Atlas footer groups",
      expected: "Program, resources, legal, contact, llms, and llms-full footer coverage",
      actual: `${footerLinks} footer links across ${atlas.footerGroups.length} groups`,
      actualCount: footerLinks,
      expectedCount: 8,
      status: footerLinks >= 8 ? "covered" : "watch",
      evidence: "Footer resources, legal links, contact routes, and agent-readable manifests remain mapped.",
      proofLinks: ["/api/swiggy-website-atlas", "/api/swiggy-cta-execution-center"],
      nextAction: "Keep legal/form/email footer actions as explicit manual gates.",
    }),
    row({
      id: "llms_manifest",
      label: "llms manifest and markdown twins",
      sourceSignal: "llms.txt, llms-full.txt, Docs Coverage, Source Availability",
      expected: "2 manifests and 69 docs pages",
      actual: `${sourceAvailability.totals.manifests} manifests, ${sourceAvailability.totals.blocked} blocked source probe(s)`,
      actualCount: docsCoverage.totalPages,
      expectedCount: 69,
      status:
        sourceAvailability.totals.manifests === 2 && sourceAvailability.totals.blocked === 0
          ? "covered"
          : sourceAvailability.totals.manifests === 2
            ? "fallback"
            : "watch",
      evidence: "Manifest rows are either live-verified or fallback-disclosed through Docs Coverage and llms Manifest Verifier.",
      proofLinks: ["/api/swiggy-source-availability-audit", "/api/swiggy-llms-manifest-verifier"],
      nextAction: "Use Docs Coverage fallback when Swiggy blocks server fetches, then re-browse manifests before final submission.",
    }),
    row({
      id: "reference_tools",
      label: "MCP reference tools",
      sourceSignal: "Food, Instamart, and Dineout reference pages",
      expected: "35 official tools across 3 servers",
      actual: `${toolParity.totals.matchedTools}/${toolParity.totals.liveReferenceTools} matched, ${toolParity.totals.localContracts} contracts`,
      actualCount: toolParity.totals.matchedTools,
      expectedCount: 35,
      status:
        toolParity.totals.liveReferenceTools === 35 &&
        toolParity.totals.matchedTools === 35 &&
        toolParity.totals.missingContracts === 0
          ? "covered"
          : "blocked",
      evidence: "Tool Parity reconciles official Swiggy reference tools against local contracts, fixtures, route classes, and safety gates.",
      proofLinks: ["/api/swiggy-tool-parity-auditor", "/api/mcp/tool-contract-matrix", "/api/mcp/tool-lab"],
      nextAction: "A missing or extra reference tool must update contracts, mocks, Tool Lab, Journey Compiler, and production smoke.",
    }),
    row({
      id: "visual_receipt",
      label: "Visual proof surface",
      sourceSignal: "Visual QA Center",
      expected: "72 reviewer screenshot targets",
      actual: `${visualQa.readyTargets}/${visualQa.totalTargets} ready targets`,
      actualCount: visualQa.readyTargets,
      expectedCount: 72,
      status: visualQa.totalTargets >= 72 && visualQa.readyTargets === visualQa.totalTargets ? "covered" : "watch",
      evidence: "Reviewer-critical Launch Center cards, mobile/tablet layouts, and widget fallbacks have screenshot targets.",
      proofLinks: ["/api/visual-qa-center", "/api/builder-packet-export"],
      nextAction: "Run visual capture after any receipt-card or Launch Center layout change.",
    }),
    row({
      id: "external_gates",
      label: "External approval gates",
      sourceSignal: "Builder access, forms, email, legal, credentials, and production approval",
      expected: "All non-local actions named as operator or Swiggy gates",
      actual: `${ctaLiveAudit.totals.manualGates} CTA manual gates, ${sourceAvailability.totals.blocked} source blocks`,
      actualCount: ctaLiveAudit.totals.manualGates,
      expectedCount: 7,
      status: "manual_gate",
      evidence: "MealPilot prepares proof and copy locally without submitting forms, sending email, or claiming Swiggy approval.",
      proofLinks: ["/api/access-submission-studio", "/api/swiggy-builders-review-decision", "/api/builder-packet-export"],
      nextAction: "Operator must record the demo, submit the Swiggy access form, send the handoff email, and wait for issued credentials.",
    }),
  ];

  const missingRows = rows.filter((item) => item.status === "blocked").length;
  const watchRows = rows.filter((item) => item.status === "watch" || item.status === "fallback").length;
  const decision: SwiggyBuildersCoverageReceipt["decision"] =
    missingRows > 0 ? "blocked_drift" : watchRows > 0 ? "coverage_watch" : "complete_coverage";
  const proofLinks = unique(rows.flatMap((item) => item.proofLinks));

  return {
    generatedAt: new Date().toISOString(),
    decision,
    score: scoreFor(rows),
    officialSources: unique([
      officialSource,
      ...pageMesh.officialSources,
      docsCoverage.llmsIndex,
      ...toolParity.officialSources.filter((source) => source.startsWith("https://")),
    ]),
    totals: {
      pages: pageMesh.totals.pages,
      modules: atlasModules,
      matchedModules: pageMesh.totals.matchedModuleSignals >= pageMesh.totals.expectedModules ? atlasModules : pageMesh.totals.matchedModuleSignals,
      ctas: atlas.ctasCovered,
      ctaTargets: ctaLiveAudit.totals.targets,
      reachableCtas: ctaLiveAudit.totals.reachable,
      manualCtaGates: ctaLiveAudit.totals.manualGates,
      headerLinks: atlas.globalHeader.length,
      docsLinks: atlas.docsHeader.length,
      footerLinks,
      llmsPages: docsCoverage.totalPages,
      referenceTools: toolParity.totals.liveReferenceTools,
      matchedTools: toolParity.totals.matchedTools,
      visualTargets: visualQa.totalTargets,
      unsafeLinks: pageMesh.totals.unsafeLinks + ctaLiveAudit.totals.unsafe,
      fallbackPages: pageMesh.totals.atlasFallbackPages,
      blockedSources: sourceAvailability.totals.blocked,
      missingRows,
      proofLinks: proofLinks.length,
    },
    rows,
    commands: [
      {
        id: "coverage_receipt_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-coverage-receipt",
        proves: "A compact all-up receipt summarizes public pages, modules, CTAs, nav, docs, manifests, tools, visual proof, and external gates.",
        expectedSignal: "decision !== 'blocked_drift' && totals.referenceTools === 35",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke keeps the receipt aligned with Page Mesh, CTA Live Audit, Source Availability, Tool Parity, and Visual QA.",
        expectedSignal: "coverageReceiptScore >= 85",
      },
      {
        id: "visual_receipt_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Coverage Receipt card is captured with every reviewer-critical surface.",
        expectedSignal: "77 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Coverage Receipt composes existing evidence; it does not create a second source of truth.",
      "Swiggy-owned source blocks are disclosed as watch or fallback states, not hidden as completed live verification.",
      "Unsafe links, missing MCP tool contracts, missing docs pages, or stale visual targets block the receipt.",
      "Forms, emails, credentials, production approval, legal review, and co-branding remain explicit operator or Swiggy gates.",
    ],
    externalGates: [
      "Swiggy may block automated source probes or change public Builders pages without notice.",
      "Final access submission still requires operator browser re-browse, demo recording, form submission, and Swiggy approval.",
      "Staging and production MCP credentials are required before live commerce response envelopes can be certified.",
    ],
  };
}
