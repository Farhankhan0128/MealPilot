import type {
  SwiggyLlmsManifestLink,
  SwiggyLlmsManifestRehearsal,
  SwiggyLlmsManifestRehearsalMode,
  SwiggyLlmsManifestSection,
  SwiggyLlmsManifestVerifier,
  SwiggyLlmsManifestStatus,
  SwiggyDocsSection,
  SwiggyServer,
} from "../../src/domain/types.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";

const llmsUrl = "https://mcp.swiggy.com/builders/llms.txt";
const llmsFullUrl = "https://mcp.swiggy.com/builders/llms-full.txt";
const allowedPrefix = "https://mcp.swiggy.com/builders/";

export interface ManifestFetchResult {
  ok: boolean;
  statusCode?: number;
  durationMs: number;
  text?: string;
  error?: string;
}

export type ManifestFetchFn = (url: string) => Promise<ManifestFetchResult>;

function sectionFromUrl(url: string): SwiggyDocsSection {
  if (url.includes("/docs/start/")) return "start";
  if (url.includes("/docs/build/")) return "build";
  if (url.includes("/docs/operate/")) return "operate";
  if (url.includes("/docs/reference/")) return "reference";
  return "blog";
}

function renderedTwin(markdownUrl: string) {
  if (markdownUrl.endsWith("/index.md")) return markdownUrl.replace(/index\.md$/, "");
  return markdownUrl.replace(/\.md$/, "/");
}

function referenceServer(url: string): SwiggyServer | undefined {
  if (url.includes("/docs/reference/food/")) return "food";
  if (url.includes("/docs/reference/instamart/")) return "instamart";
  if (url.includes("/docs/reference/dineout/")) return "dineout";
  return undefined;
}

function referenceTool(url: string) {
  const match = url.match(/\/docs\/reference\/(?:food|instamart|dineout)\/([^/]+)\.md$/);
  if (!match || match[1] === "index") return undefined;
  return match[1];
}

export function parseSwiggyLlmsManifest(text: string) {
  let currentSection = "Intro";
  const links: SwiggyLlmsManifestLink[] = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((line) => {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      currentSection = heading[1].trim();
      return;
    }

    const link = line.match(/^-\s+\[([^\]]+)\]\((https:\/\/mcp\.swiggy\.com\/builders\/[^)]+\.md)\)(?::\s*(.+))?$/);
    if (!link) return;

    const markdownUrl = link[2];
    const server = referenceServer(markdownUrl);
    const tool = referenceTool(markdownUrl);
    links.push({
      id: markdownUrl
        .replace(allowedPrefix, "")
        .replace(/\.md$/, "")
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_|_$/g, "")
        .toLowerCase(),
      title: link[1],
      manifestSection: currentSection,
      docsSection: sectionFromUrl(markdownUrl),
      markdownUrl,
      renderedUrl: renderedTwin(markdownUrl),
      summary: link[3] ?? "",
      server,
      tool,
      status: "covered",
    });
  });

  return links;
}

function sectionSummary(links: SwiggyLlmsManifestLink[]): SwiggyLlmsManifestSection[] {
  return (["start", "build", "operate", "reference", "blog"] satisfies SwiggyDocsSection[]).map((section) => {
    const sectionLinks = links.filter((link) => link.docsSection === section);
    return {
      section,
      liveLinks: sectionLinks.length,
      markdownTwins: sectionLinks.filter((link) => link.markdownUrl.endsWith(".md")).length,
      renderedTwins: sectionLinks.filter((link) => link.renderedUrl.startsWith(allowedPrefix)).length,
      referenceTools: sectionLinks.filter((link) => Boolean(link.tool)).length,
      status: sectionLinks.length > 0 ? "covered" : "watch",
    };
  });
}

function statusFor(fetchResult: ManifestFetchResult, links: SwiggyLlmsManifestLink[], expectedPages: number): SwiggyLlmsManifestStatus {
  if (!fetchResult.ok && links.length === 0) return "blocked";
  if (links.length !== expectedPages) return "watch";
  if (!links.every((link) => link.markdownUrl.startsWith(allowedPrefix) && link.renderedUrl.startsWith(allowedPrefix))) {
    return "watch";
  }
  return "covered";
}

function fallbackLinksFromCoverage(coverage: ReturnType<typeof buildSwiggyDocsCoverage>): SwiggyLlmsManifestLink[] {
  return coverage.pages.map((page) => {
    const server = referenceServer(page.markdownUrl);
    const tool = referenceTool(page.markdownUrl);
    return {
      id: page.id,
      title: page.title,
      manifestSection: `${page.section} fallback`,
      docsSection: page.section,
      markdownUrl: page.markdownUrl,
      renderedUrl: page.url,
      summary: page.officialSummary,
      server,
      tool,
      status: "covered" as const,
    };
  });
}

function scoreFor(status: SwiggyLlmsManifestStatus) {
  if (status === "covered") return 100;
  if (status === "watch") return 82;
  return 45;
}

export async function fetchSwiggyLlmsManifest(url: string): Promise<ManifestFetchResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return {
      ok: response.ok,
      statusCode: response.status,
      durationMs: Date.now() - startedAt,
      text: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "unknown manifest fetch failure",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildSwiggyLlmsManifestVerifier(
  fetchManifest: ManifestFetchFn = fetchSwiggyLlmsManifest,
): Promise<SwiggyLlmsManifestVerifier> {
  const coverage = buildSwiggyDocsCoverage();
  const manifest = await fetchManifest(llmsUrl);
  const parsedLinks = manifest.text ? parseSwiggyLlmsManifest(manifest.text) : [];
  const usedCoverageFallback = parsedLinks.length === 0 && !manifest.ok;
  const links = usedCoverageFallback ? fallbackLinksFromCoverage(coverage) : parsedLinks;
  const sections = sectionSummary(links);
  const status = statusFor(manifest, links, coverage.totalPages);
  const unsafeLinks = links.filter((link) => !link.markdownUrl.startsWith(allowedPrefix) || !link.renderedUrl.startsWith(allowedPrefix));
  const referenceTools = links.filter((link) => Boolean(link.tool));
  const serverToolCounts = (["food", "instamart", "dineout"] as SwiggyServer[]).map((server) => ({
    server,
    tools: referenceTools.filter((link) => link.server === server).length,
    expectedTools: server === "food" ? 14 : server === "instamart" ? 13 : 8,
    status: referenceTools.filter((link) => link.server === server).length === (server === "food" ? 14 : server === "instamart" ? 13 : 8)
      ? ("covered" as const)
      : ("watch" as const),
  }));

  return {
    generatedAt: new Date().toISOString(),
    score: scoreFor(status),
    status,
    officialSources: [llmsUrl, llmsFullUrl, "https://mcp.swiggy.com/builders/docs/start/coding-agents/"],
    sourceUrl: llmsUrl,
    fetch: {
      ok: manifest.ok,
      statusCode: manifest.statusCode,
      durationMs: manifest.durationMs,
      error: manifest.error,
    },
    totals: {
      liveLinks: links.length,
      expectedCoveragePages: coverage.totalPages,
      markdownTwins: links.filter((link) => link.markdownUrl.endsWith(".md")).length,
      renderedTwins: links.filter((link) => link.renderedUrl.startsWith(allowedPrefix)).length,
      referenceTools: referenceTools.length,
      unsafeLinks: unsafeLinks.length,
      sections: sections.length,
    },
    sections,
    serverToolCounts,
    sampleLinks: links.slice(0, 12),
    driftSignals: [
      usedCoverageFallback
        ? `Live llms.txt returned ${manifest.statusCode ?? "an unavailable status"}; Docs Coverage fallback preserved ${links.length} source-linked pages.`
        : links.length === coverage.totalPages
        ? "Live llms.txt page count matches MealPilot Docs Coverage."
        : `Live llms.txt has ${links.length} links; MealPilot coverage expects ${coverage.totalPages}.`,
      usedCoverageFallback
        ? "Docs Coverage fallback preserves 35 Food, Instamart, and Dineout reference tool pages while live llms.txt is unavailable."
        : referenceTools.length === 35
        ? "Live reference manifest still exposes 35 Food, Instamart, and Dineout tool pages."
        : `Live reference manifest exposes ${referenceTools.length} tool pages; update Tool Lab before access submission.`,
      unsafeLinks.length === 0
        ? "All manifest links stay inside https://mcp.swiggy.com/builders/."
        : `${unsafeLinks.length} manifest links need manual review before coding-agent ingestion.`,
    ],
    operatorRunbook: [
      {
        sequence: 1,
        command: "curl -fsS https://mcp.swiggy.com/builders/llms.txt",
        proves: "Swiggy's live coding-agent manifest is reachable.",
      },
      {
        sequence: 2,
        command: "curl -fsS http://localhost:8787/api/swiggy-llms-manifest-verifier",
        proves: "MealPilot parsed live links, rendered twins, reference tools, and drift signals.",
      },
      {
        sequence: 3,
        command: "npm run verify:production",
        proves: "Manifest verifier, Docs Coverage, Docs Twin Explorer, Tool Lab, and Source Intelligence remain aligned.",
      },
    ],
    assertions: [
      "Only the official Swiggy llms.txt URL is fetched; user-supplied URLs are never accepted.",
      "When the official llms.txt fetch is blocked, complete Docs Coverage fallback is disclosed instead of claiming a live manifest read.",
      "Every markdown link should produce a rendered-page twin under the same Swiggy Builders origin.",
      "Food, Instamart, and Dineout reference tool counts must remain 14, 13, and 8 until Swiggy publishes a new contract.",
      "Any link-count drift must trigger Docs Coverage, Tool Lab, Journey Compiler, and production verifier updates before submission.",
    ],
    externalGates: [
      "Swiggy can update llms.txt without notice; re-run this verifier immediately before final access submission.",
      "llms-full.txt content volume is intentionally linked but not fully stored in MealPilot artifacts.",
      "New reference tools require Swiggy staging credentials before live behavior can be certified.",
    ],
  };
}

export async function rehearseSwiggyLlmsManifest(input: {
  mode: SwiggyLlmsManifestRehearsalMode;
  includeFullManifest: boolean;
  enforceToolParity: boolean;
  includeDriftGates: boolean;
  fetchManifest?: ManifestFetchFn;
}): Promise<SwiggyLlmsManifestRehearsal> {
  const verifier = await buildSwiggyLlmsManifestVerifier(input.fetchManifest);
  const selectedSections =
    input.mode === "tool_parity"
      ? verifier.sections.filter((section) => section.referenceTools > 0)
      : verifier.sections;
  const missingInputs: string[] = [];

  if (input.mode === "live_fetch" && !verifier.fetch.ok) missingInputs.push("live llms.txt fetch");
  if (input.mode === "coverage_fallback" && verifier.fetch.ok && !input.includeDriftGates) {
    missingInputs.push("fallback disclosure gate");
  }
  if (input.includeFullManifest && !input.includeDriftGates) missingInputs.push("llms-full storage disclosure");
  if (input.enforceToolParity && verifier.serverToolCounts.some((count) => count.status !== "covered")) {
    missingInputs.push("Food/Instamart/Dineout tool parity");
  }
  if (!input.includeDriftGates && verifier.status !== "covered") missingInputs.push("source drift review");

  const decision: SwiggyLlmsManifestRehearsal["decision"] =
    verifier.status === "blocked" && input.mode === "live_fetch"
      ? "blocked_manifest_source"
      : missingInputs.length > 0
        ? "manual_drift_gate"
        : "ready_manifest_packet";

  return {
    generatedAt: new Date().toISOString(),
    decision,
    readinessScore: verifier.score,
    mode: input.mode,
    includeFullManifest: input.includeFullManifest,
    enforceToolParity: input.enforceToolParity,
    sourceUrl: verifier.sourceUrl,
    expectedCoveragePages: verifier.totals.expectedCoveragePages,
    selectedSections,
    sampleLinks: verifier.sampleLinks,
    serverToolCounts: verifier.serverToolCounts,
    commands: [
      { command: "curl -fsS https://mcp.swiggy.com/builders/llms.txt", proves: "Official Swiggy coding-agent manifest is reachable." },
      { command: "curl -fsS http://localhost:8787/api/swiggy-llms-manifest-verifier", proves: "MealPilot parses links, rendered twins, reference tools, and drift signals." },
      { command: "npm run verify:production", proves: "Docs Coverage, Docs Twin Explorer, Tool Lab, and manifest verifier stay aligned." },
    ],
    driftSignals: verifier.driftSignals,
    missingInputs,
    telemetry: [
      { field: "mode", value: input.mode, redaction: "safe manifest rehearsal mode" },
      { field: "manifest_status", value: verifier.status, redaction: "safe status enum" },
      { field: "live_links", value: String(verifier.totals.liveLinks), redaction: "aggregate count only" },
      { field: "reference_tools", value: String(verifier.totals.referenceTools), redaction: "aggregate count only" },
      { field: "unsafe_links", value: String(verifier.totals.unsafeLinks), redaction: "aggregate count only" },
    ],
    assertions: [
      "The rehearsal only references the official Swiggy llms.txt and llms-full.txt URLs; no user-supplied source URL is accepted.",
      "Coverage fallback is disclosed whenever the live manifest is unavailable or intentionally used.",
      "Tool parity remains Food 14, Instamart 13, and Dineout 8 until Swiggy publishes a new contract.",
      "llms-full is linked for reviewer retrieval but not stored as a large local artifact.",
    ],
    nextAction:
      decision === "ready_manifest_packet"
        ? "Run the manifest verifier and production smoke, then attach drift signals to the reviewer packet."
        : decision === "manual_drift_gate"
          ? `Resolve ${missingInputs.join(", ")} before presenting the manifest source packet.`
          : "Live manifest source is blocked; disclose Docs Coverage fallback and retry the official Swiggy URL before submission.",
  };
}
