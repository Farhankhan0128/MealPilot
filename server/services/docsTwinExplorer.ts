import type {
  SwiggyDocsCoverageItem,
  SwiggyDocsCoverageStatus,
  SwiggyDocsSection,
  SwiggyDocsTwinExplorer,
  SwiggyDocsTwinStatus,
} from "../../src/domain/types.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusFromCoverage(status: SwiggyDocsCoverageStatus): SwiggyDocsTwinStatus {
  if (status === "implemented") return "ready";
  if (status === "documented") return "documented";
  return "external_gate";
}

function statusScore(status: SwiggyDocsTwinStatus) {
  if (status === "ready") return 1;
  if (status === "documented") return 0.82;
  if (status === "watch") return 0.72;
  return 0.5;
}

function sectionLabel(section: SwiggyDocsSection) {
  if (section === "start") return "Start";
  if (section === "build") return "Build";
  if (section === "operate") return "Operate";
  if (section === "reference") return "Reference";
  return "Blog";
}

function nextAction(page: SwiggyDocsCoverageItem, status: SwiggyDocsTwinStatus) {
  if (status === "ready") return `Keep ${page.title} linked to ${page.evidenceLinks.length} MealPilot proof route(s).`;
  if (status === "documented") return `Review ${page.title} before final access submission and promote to implemented when a live product surface exists.`;
  return `Wait for Swiggy credentials or product access before claiming ${page.title} as executable.`;
}

function toRow(page: SwiggyDocsCoverageItem) {
  const status = statusFromCoverage(page.status);
  return {
    id: page.id,
    section: page.section,
    title: page.title,
    markdownUrl: page.markdownUrl,
    renderedUrl: page.url,
    retrievalMode: "markdown_twin" as const,
    mealPilotProof: page.mealPilotSurface,
    evidenceLinks: page.evidenceLinks,
    status,
    nextAction: nextAction(page, status),
  };
}

export function buildSwiggyDocsTwinExplorer(): SwiggyDocsTwinExplorer {
  const coverage = buildSwiggyDocsCoverage();
  const rows = coverage.pages.map(toRow);
  const groups = (["start", "build", "operate", "reference", "blog"] satisfies SwiggyDocsSection[]).map((section) => {
    const sectionRows = rows.filter((row) => row.section === section);
    return {
      id: section,
      label: sectionLabel(section),
      total: sectionRows.length,
      ready: sectionRows.filter((row) => row.status === "ready").length,
      documented: sectionRows.filter((row) => row.status === "documented").length,
      externalGates: sectionRows.filter((row) => row.status === "external_gate").length,
      sampleMarkdownUrls: sectionRows.slice(0, 4).map((row) => row.markdownUrl),
      evidenceLinks: unique(sectionRows.flatMap((row) => row.evidenceLinks)).slice(0, 8),
    };
  });
  const proofLinks = unique(rows.flatMap((row) => row.evidenceLinks));
  const referenceTools = rows.filter((row) => row.id.startsWith("reference_") && row.id.split("_").length >= 3).length;
  const score = Math.round((rows.reduce((sum, row) => sum + statusScore(row.status), 0) / rows.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources: [coverage.officialSource, coverage.llmsIndex, "https://mcp.swiggy.com/builders/llms-full.txt"],
    totals: {
      pages: rows.length,
      markdownTwins: rows.filter((row) => row.markdownUrl.endsWith(".md")).length,
      renderedPages: rows.filter((row) => row.renderedUrl.startsWith(coverage.officialSource)).length,
      referenceTools,
      sections: groups.length,
      readyRows: rows.filter((row) => row.status === "ready").length,
      documentedRows: rows.filter((row) => row.status === "documented").length,
      externalGates: rows.filter((row) => row.status === "external_gate").length,
      proofLinks: proofLinks.length,
    },
    groups,
    rows,
    retrievalLanes: [
      {
        id: "llms_index",
        label: "llms.txt inventory",
        sourceUrl: coverage.llmsIndex,
        command: "curl -s https://mcp.swiggy.com/builders/llms.txt",
        expectedSignal: "35+ tools across 3 MCP servers and markdown twin URLs",
        status: "ready",
        evidenceLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-upstream-watch"],
      },
      {
        id: "markdown_twins",
        label: "Markdown twin fetch",
        sourceUrl: "https://mcp.swiggy.com/builders/docs/start/developer/index.md",
        command: "curl -s https://mcp.swiggy.com/builders/docs/start/developer/index.md",
        expectedSignal: "Clean markdown usable by coding agents before editing Swiggy integrations",
        status: "ready",
        evidenceLinks: ["/api/coding-agent-governance", "/api/swiggy-developer-quickstart"],
      },
      {
        id: "rendered_pages",
        label: "Rendered page fallback",
        sourceUrl: "https://mcp.swiggy.com/builders/docs/start/developer/",
        command: "curl -s https://mcp.swiggy.com/builders/docs/start/developer/",
        expectedSignal: "Rendered HTML page loads for browser review and visual source reconciliation",
        status: "ready",
        evidenceLinks: ["/api/swiggy-website-atlas", "/api/swiggy-deep-site-map"],
      },
      {
        id: "proof_readback",
        label: "MealPilot proof readback",
        sourceUrl: "/api/swiggy-docs-twin-explorer",
        command: "curl -s http://localhost:8787/api/swiggy-docs-twin-explorer",
        expectedSignal: "totals.pages === 69 && totals.markdownTwins === 69 && totals.referenceTools === 35",
        status: "ready",
        evidenceLinks: ["/api/swiggy-docs-twin-explorer", "/api/openapi.json"],
      },
      {
        id: "drift_watch",
        label: "Upstream drift watch",
        sourceUrl: "/api/swiggy-upstream-watch",
        command: "npm run verify:production",
        expectedSignal: "docsTwinPages === 69 and upstream watch remains >= 90",
        status: "watch",
        evidenceLinks: ["/api/swiggy-upstream-watch", "/api/version-monitor"],
      },
    ],
    assertions: [
      "Every llms.txt-linked page is represented by both a markdown twin URL and a rendered page URL.",
      "The Reference section includes all 35 Food, Instamart, and Dineout tool pages generated from the same catalog as Tool Lab.",
      "Coding-agent and human reviewer flows use markdown twins first, then rendered pages for browser proof.",
      "Docs Twin Explorer reuses Docs Coverage evidence so source reconciliation, quickstart, CTA execution, and production verifier stay aligned.",
    ],
    externalGates: [
      "Swiggy may add new markdown twins, tools, widgets, or roadmap pages; re-browse llms.txt before final submission.",
      "Enterprise and production-only docs remain evidence until Swiggy issues credentials and access approval.",
      "Signed manifest verification remains a Swiggy roadmap gate tracked by Upstream Watch.",
    ],
  };
}
