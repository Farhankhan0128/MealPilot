import type {
  SwiggyLlmsManifestLink,
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
  if (!fetchResult.ok) return "blocked";
  if (links.length !== expectedPages) return "watch";
  if (!links.every((link) => link.markdownUrl.startsWith(allowedPrefix) && link.renderedUrl.startsWith(allowedPrefix))) {
    return "watch";
  }
  return "covered";
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
  const links = manifest.text ? parseSwiggyLlmsManifest(manifest.text) : [];
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
      links.length === coverage.totalPages
        ? "Live llms.txt page count matches MealPilot Docs Coverage."
        : `Live llms.txt has ${links.length} links; MealPilot coverage expects ${coverage.totalPages}.`,
      referenceTools.length === 35
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
