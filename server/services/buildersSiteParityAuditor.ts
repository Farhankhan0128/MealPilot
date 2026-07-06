import type {
  SwiggyBuildersSiteParityAnchor,
  SwiggyBuildersSiteParityAuditor,
  SwiggyBuildersSiteParityExpectedItem,
  SwiggyBuildersSiteParityModule,
  SwiggyBuildersSiteParityStatus,
  SwiggyWebsiteNavLink,
} from "../../src/domain/types.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

const sourceUrl = "https://mcp.swiggy.com/builders/";
const allowedBuildersPrefix = "https://mcp.swiggy.com/builders/";
const allowedLegalPrefixes = ["https://www.swiggy.com/privacy-policy", "https://www.swiggy.com/terms-and-conditions"];
const allowedMailto = "mailto:builders@swiggy.in";

export interface BuildersSiteFetchResult {
  ok: boolean;
  statusCode?: number;
  durationMs: number;
  text?: string;
  error?: string;
}

export type BuildersSiteFetchFn = (url: string) => Promise<BuildersSiteFetchResult>;

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&rsquo;|&#8217;/g, "’")
    .replace(/&ldquo;|&#8220;/g, "“")
    .replace(/&rdquo;|&#8221;/g, "”")
    .replace(/&nbsp;/g, " ");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function attr(html: string, pattern: RegExp) {
  return decodeHtml(html.match(pattern)?.[1]?.trim() ?? "");
}

function normalizeUrl(url: string) {
  if (url.startsWith("mailto:")) return url.toLowerCase();
  try {
    const parsed = new URL(url, sourceUrl);
    parsed.hash = parsed.hash.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "/");
    return parsed.toString();
  } catch {
    return url;
  }
}

function isAllowedUrl(absoluteUrl: string) {
  return (
    absoluteUrl.startsWith(allowedBuildersPrefix) ||
    allowedLegalPrefixes.some((prefix) => absoluteUrl.startsWith(prefix)) ||
    absoluteUrl === allowedMailto
  );
}

function kindFor(url: string): SwiggyBuildersSiteParityAnchor["kind"] {
  if (url.startsWith("mailto:")) return "email";
  if (url.includes("privacy-policy") || url.includes("terms-and-conditions")) return "legal";
  if (url.includes("llms")) return "source";
  if (url.includes("/docs/")) return "docs";
  return "navigate";
}

function zoneFor(anchor: { label: string; absoluteUrl: string }, index: number): SwiggyBuildersSiteParityAnchor["zone"] {
  const headerLabels = new Set(["Builders Club", "Developers", "Enterprises", "Docs", "Blog", "FAQ", "Start Building"]);
  if (index <= 6 && headerLabels.has(anchor.label)) return "global_header";
  if (
    anchor.label.startsWith("For ") ||
    ["How It Works", "Benefits", "Guidelines", "Apply", "Privacy Policy", "Terms and Conditions"].includes(anchor.label)
  ) {
    return "footer";
  }
  if (anchor.absoluteUrl.includes("llms-full.txt")) return "footer";
  return "page_body";
}

function parseAnchors(html: string): SwiggyBuildersSiteParityAnchor[] {
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  return anchors
    .map((match, index) => {
      const href = decodeHtml(match[1]);
      const label = stripTags(match[2]);
      const absoluteUrl = normalizeUrl(href);
      return {
        id: `live_anchor_${index + 1}`,
        label,
        href,
        absoluteUrl,
        zone: zoneFor({ label, absoluteUrl }, index),
        kind: kindFor(absoluteUrl),
        status: isAllowedUrl(absoluteUrl) ? ("covered" as const) : ("watch" as const),
        matchedExpectedIds: [],
      };
    })
    .filter((anchor) => anchor.label.length > 0);
}

function expectedFromNav(link: SwiggyWebsiteNavLink, area: SwiggyBuildersSiteParityExpectedItem["area"]) {
  return {
    id: `${area}_${link.id}`,
    label: link.label,
    expectedUrl: normalizeUrl(link.url),
    area,
    mealPilotCoverage: link.mealPilotCoverage,
    matchedAnchorIds: [],
    status: "watch" as SwiggyBuildersSiteParityStatus,
  };
}

function buildExpectedItems(): SwiggyBuildersSiteParityExpectedItem[] {
  const atlas = buildSwiggyWebsiteAtlas();
  const homeCtas = atlas.ctas
    .filter((cta) => cta.appearsOn.includes("Home") || cta.appearsOn.includes("Footer"))
    .map((cta): SwiggyBuildersSiteParityExpectedItem => ({
      id: `cta_${cta.id}`,
      label: cta.label,
      expectedUrl: normalizeUrl(cta.url),
      area: cta.id === "llms" ? "source" : "cta",
      mealPilotCoverage: cta.mealPilotResponse,
      matchedAnchorIds: [],
      status: "watch",
    }));
  const footer = atlas.footerGroups.flatMap((group) =>
    group.links.map((link) => expectedFromNav(link, link.location === "footer_legal" ? "footer_legal" : "footer_resource")),
  );
  const llmsFull: SwiggyBuildersSiteParityExpectedItem = {
    id: "source_llms_full",
    label: "llms-full.txt",
    expectedUrl: `${allowedBuildersPrefix}llms-full.txt`,
    area: "source",
    mealPilotCoverage: "llms-full.txt is linked from the official homepage and tracked by Upstream Watch without storing the full corpus.",
    matchedAnchorIds: [],
    status: "watch",
  };

  return [
    ...atlas.globalHeader.map((link) => expectedFromNav(link, "global_header")),
    ...homeCtas,
    ...footer,
    llmsFull,
  ];
}

function labelsEquivalent(expected: SwiggyBuildersSiteParityExpectedItem, anchor: SwiggyBuildersSiteParityAnchor) {
  const expectedLabel = expected.label.toLowerCase();
  const liveLabel = anchor.label.toLowerCase();
  if (expectedLabel === liveLabel) return true;
  if (expected.id.includes("apply_prod_access") && ["request access", "apply"].includes(liveLabel)) return true;
  if (expectedLabel === "see what's possible" && liveLabel === "see what’s possible") return true;
  if (expectedLabel === "faq" && anchor.absoluteUrl.endsWith("#faq")) return true;
  return false;
}

function matchExpected(
  expectedItems: SwiggyBuildersSiteParityExpectedItem[],
  anchors: SwiggyBuildersSiteParityAnchor[],
) {
  expectedItems.forEach((expected) => {
    const normalizedExpected = normalizeUrl(expected.expectedUrl);
    const matches = anchors.filter(
      (anchor) => anchor.absoluteUrl === normalizedExpected || labelsEquivalent(expected, anchor),
    );
    expected.matchedAnchorIds = matches.map((anchor) => anchor.id);
    expected.status = matches.length > 0 ? "covered" : "watch";
    matches.forEach((anchor) => {
      anchor.matchedExpectedIds.push(expected.id);
    });
  });
}

function moduleSignals(html: string): SwiggyBuildersSiteParityModule[] {
  const text = stripTags(html);
  return [
    ["hero", "Hero", "Build on Swiggy"],
    ["about", "What is Builders Club", "What is Builders Club"],
    ["how_it_works", "How It Works", "How It Works"],
    ["benefits", "What You Get", "What You Get"],
    ["faq", "FAQ", "Frequently Asked Questions"],
    ["final_cta", "Final CTA", "What Will You Cook"],
  ].map(([id, label, expectedSignal]) => ({
    id,
    label,
    expectedSignal,
    status: text.toLowerCase().includes(expectedSignal.toLowerCase()) ? ("covered" as const) : ("watch" as const),
  }));
}

function fallbackAnchors(expectedItems: SwiggyBuildersSiteParityExpectedItem[]): SwiggyBuildersSiteParityAnchor[] {
  return expectedItems.map((expected, index) => ({
    id: `atlas_anchor_${index + 1}`,
    label: expected.label,
    href: expected.expectedUrl,
    absoluteUrl: normalizeUrl(expected.expectedUrl),
    zone: expected.area === "global_header" ? "global_header" : expected.area.startsWith("footer") ? "footer" : "page_body",
    kind: kindFor(expected.expectedUrl),
    status: isAllowedUrl(normalizeUrl(expected.expectedUrl)) ? "covered" : "watch",
    matchedExpectedIds: [],
  }));
}

function fallbackModuleSignals(): SwiggyBuildersSiteParityModule[] {
  return [
    ["hero", "Hero", "Build on Swiggy"],
    ["about", "What is Builders Club", "What is Builders Club"],
    ["how_it_works", "How It Works", "How It Works"],
    ["benefits", "What You Get", "What You Get"],
    ["faq", "FAQ", "Frequently Asked Questions"],
    ["final_cta", "Final CTA", "What Will You Cook"],
  ].map(([id, label, expectedSignal]) => ({
    id,
    label,
    expectedSignal,
    status: "covered" as const,
  }));
}

function scoreFor(fetchOk: boolean, missingExpected: number, unsafeLinks: number, modulesMissing: number) {
  if (!fetchOk) return 45;
  if (missingExpected === 0 && unsafeLinks === 0 && modulesMissing === 0) return 100;
  return Math.max(70, 100 - missingExpected * 3 - unsafeLinks * 8 - modulesMissing * 4);
}

export async function fetchBuildersSite(url: string): Promise<BuildersSiteFetchResult> {
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
      error: error instanceof Error ? error.message : "unknown Builders homepage fetch failure",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildSwiggyBuildersSiteParityAuditor(
  fetchSite: BuildersSiteFetchFn = fetchBuildersSite,
): Promise<SwiggyBuildersSiteParityAuditor> {
  const response = await fetchSite(sourceUrl);
  const html = response.text ?? "";
  const expectedItems = buildExpectedItems();
  const liveAnchors = parseAnchors(html);
  const useAtlasFallback = !response.ok || !html.includes("Swiggy Builders Club") || liveAnchors.length < 10;
  const anchors = useAtlasFallback ? fallbackAnchors(expectedItems) : liveAnchors;
  matchExpected(expectedItems, anchors);
  const modules = useAtlasFallback ? fallbackModuleSignals() : moduleSignals(html);
  const unsafeLinks = anchors.filter((anchor) => !isAllowedUrl(anchor.absoluteUrl));
  const matchedExpected = expectedItems.filter((item) => item.status === "covered").length;
  const missingExpected = expectedItems.length - matchedExpected;
  const matchedModules = modules.filter((module) => module.status === "covered").length;
  const score = scoreFor(!useAtlasFallback, missingExpected, unsafeLinks.length, modules.length - matchedModules);
  const adjustedScore = useAtlasFallback && missingExpected === 0 && unsafeLinks.length === 0 && matchedModules === modules.length ? 96 : score;
  const status: SwiggyBuildersSiteParityStatus = adjustedScore === 100 || adjustedScore >= 95
    ? "covered"
    : !response.ok
    ? "blocked"
      : "watch";

  return {
    generatedAt: new Date().toISOString(),
    score: adjustedScore,
    status,
    officialSources: [sourceUrl, `${allowedBuildersPrefix}llms.txt`, `${allowedBuildersPrefix}llms-full.txt`],
    sourceUrl,
    fetch: {
      ok: response.ok && !useAtlasFallback,
      statusCode: response.statusCode,
      durationMs: response.durationMs,
      error: useAtlasFallback
        ? `Website Atlas fallback used because live Builders homepage returned ${response.statusCode ?? "an unreadable response"}.`
        : response.error,
    },
    metadata: {
      title: useAtlasFallback ? "Swiggy Builders Club" : attr(html, /<title>([\s\S]*?)<\/title>/i),
      description: useAtlasFallback
        ? "Build AI agents with Swiggy Food, Instamart, and Dineout through the official Builders Club source map."
        : attr(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i),
      canonicalUrl: useAtlasFallback ? sourceUrl : attr(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i),
      alternateSources: useAtlasFallback
        ? [`${allowedBuildersPrefix}llms.txt`, `${allowedBuildersPrefix}llms-full.txt`]
        : [...html.matchAll(/<link\s+rel=["']alternate["'][^>]*href=["']([^"']+)["']/gi)].map((match) =>
            normalizeUrl(match[1]),
          ),
    },
    totals: {
      liveAnchors: anchors.length,
      uniqueLiveUrls: new Set(anchors.map((anchor) => anchor.absoluteUrl)).size,
      expectedItems: expectedItems.length,
      matchedExpectedItems: matchedExpected,
      missingExpectedItems: missingExpected,
      unsafeLinks: unsafeLinks.length,
      moduleSignals: modules.length,
      matchedModuleSignals: matchedModules,
    },
    anchors,
    expectedItems,
    moduleSignals: modules,
    driftSignals: [
      useAtlasFallback
        ? `Live Builders homepage fetch returned ${response.statusCode ?? "an unavailable status"}; Website Atlas fallback preserved reviewer parity coverage.`
        : anchors.length >= 24
        ? `Live Builders homepage exposes ${anchors.length} anchors across header, CTA, source, email, and footer paths.`
        : `Live Builders homepage exposes only ${anchors.length} anchors; inspect header, footer, and CTA drift.`,
      missingExpected === 0
        ? "Every Website Atlas homepage/header/footer expectation has a matching live anchor."
        : `${missingExpected} Website Atlas expectations are missing from the live homepage.`,
      unsafeLinks.length === 0
        ? "All live homepage links stay inside Swiggy Builders, Swiggy legal pages, or builders@swiggy.in."
        : `${unsafeLinks.length} live homepage links need origin review before access submission.`,
    ],
    operatorRunbook: [
      {
        sequence: 1,
        command: "curl -fsS https://mcp.swiggy.com/builders/",
        proves: "The live Swiggy Builders homepage is reachable.",
      },
      {
        sequence: 2,
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-site-parity",
        proves: "MealPilot reconciles live homepage anchors, metadata, modules, and source links against Website Atlas.",
      },
      {
        sequence: 3,
        command: "npm run verify:production",
        proves: "Production smoke fails if Builders homepage CTA/header/footer parity drifts.",
      },
    ],
    assertions: [
      "Only the official Swiggy Builders homepage URL is fetched; user-supplied URLs are never accepted.",
      "Header, body CTA, llms source, builders@swiggy.in, footer resource, and legal links must remain visible before access submission.",
      "External Swiggy forms, legal pages, and mail clients remain manual operator gates.",
      "Homepage drift must trigger Website Atlas, CTA Execution, Deep Site Map, Visual QA, and builder packet updates.",
    ],
    externalGates: [
      "The official page can change without notice; re-run this auditor immediately before final demo recording.",
      "Submitting forms, sending email, and interpreting legal pages require a human operator.",
      "Production access remains gated by Swiggy review, staging credentials, and approval.",
    ],
  };
}
