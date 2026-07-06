import type {
  SwiggyBuildersPageMeshAuditor,
  SwiggyBuildersPageMeshRow,
  SwiggyBuildersPageMeshStatus,
  SwiggyWebsiteCta,
  SwiggyWebsitePageAtlas,
} from "../../src/domain/types.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

const sourceUrl = "https://mcp.swiggy.com/builders/";
const allowedBuildersPrefix = "https://mcp.swiggy.com/builders/";
const allowedLegalPrefixes = ["https://www.swiggy.com/privacy-policy", "https://www.swiggy.com/terms-and-conditions"];
const allowedFormPrefixes = ["https://forms.gle/"];
const allowedReferencePrefixes = ["https://modelcontextprotocol.io/"];
const allowedMailto = "mailto:builders@swiggy.in";

export interface BuildersPageFetchResult {
  ok: boolean;
  statusCode?: number;
  durationMs: number;
  text?: string;
  error?: string;
}

export type BuildersPageFetchFn = (url: string) => Promise<BuildersPageFetchResult>;

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

function normalizeUrl(url: string) {
  const decodedUrl = decodeHtml(url);
  if (decodedUrl.startsWith("mailto:")) return decodedUrl.toLowerCase();
  try {
    const parsed = new URL(decodedUrl, sourceUrl);
    parsed.hash = parsed.hash.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "/");
    return parsed.toString();
  } catch {
    return decodedUrl;
  }
}

function isAllowedUrl(absoluteUrl: string) {
  const isBuildersGmailCompose =
    absoluteUrl.startsWith("https://mail.google.com/mail/") &&
    new URL(absoluteUrl).searchParams.get("to")?.toLowerCase() === "builders@swiggy.in";

  return (
    absoluteUrl.startsWith(allowedBuildersPrefix) ||
    allowedLegalPrefixes.some((prefix) => absoluteUrl.startsWith(prefix)) ||
    allowedFormPrefixes.some((prefix) => absoluteUrl.startsWith(prefix)) ||
    allowedReferencePrefixes.some((prefix) => absoluteUrl.startsWith(prefix)) ||
    absoluteUrl === allowedMailto ||
    isBuildersGmailCompose
  );
}

function titleFrom(html: string) {
  return stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
}

function anchorsFrom(html: string) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      href: decodeHtml(match[1]),
      label: stripTags(match[2]),
      absoluteUrl: normalizeUrl(match[1]),
    }))
    .filter((anchor) => anchor.label.length > 0);
}

function signalCandidates(page: SwiggyWebsitePageAtlas) {
  return page.modules.map((module) => {
    const officialLead = module.officialSignal.split(/[.;,]/)[0]?.trim() ?? "";
    return [module.title, officialLead].filter((candidate) => candidate.length >= 4);
  });
}

function matchedModuleSignals(page: SwiggyWebsitePageAtlas, text: string) {
  const normalizedText = text.toLowerCase();
  return signalCandidates(page).filter((candidates) =>
    candidates.some((candidate) => normalizedText.includes(candidate.toLowerCase())),
  ).length;
}

function ctaMatches(page: SwiggyWebsitePageAtlas, ctas: SwiggyWebsiteCta[], anchors: Array<{ label: string; absoluteUrl: string }>) {
  const pageCtas = ctas.filter((cta) => page.ctaIds.includes(cta.id));
  const matches = pageCtas.filter((cta) => {
    const expectedUrl = normalizeUrl(cta.url);
    return anchors.some(
      (anchor) =>
        anchor.absoluteUrl === expectedUrl ||
        anchor.label.toLowerCase() === cta.label.toLowerCase() ||
        (cta.id === "apply_prod_access" && ["request access", "apply"].includes(anchor.label.toLowerCase())),
    );
  });

  return { expected: pageCtas.length, matched: matches.length };
}

function statusFor(row: Omit<SwiggyBuildersPageMeshRow, "status">): SwiggyBuildersPageMeshStatus {
  if (!row.statusCode || row.statusCode >= 400) return "blocked";
  if (row.unsafeLinks > 0) return "watch";
  const moduleTarget = Math.max(1, Math.ceil(row.expectedModules * 0.6));
  const ctaTarget = row.expectedCtas === 0 ? 0 : Math.ceil(row.expectedCtas * 0.6);
  if (row.matchedModuleSignals >= moduleTarget && row.matchedCtas >= ctaTarget) return "covered";
  return "watch";
}

function scoreFor(rows: SwiggyBuildersPageMeshRow[]) {
  if (rows.some((row) => row.status === "blocked")) return 70;
  const statusScore = rows.reduce((sum, row) => sum + (row.status === "covered" ? 1 : 0.75), 0) / rows.length;
  const unsafePenalty = Math.min(15, rows.reduce((sum, row) => sum + row.unsafeLinks, 0) * 3);
  return Math.round(statusScore * 100 - unsafePenalty);
}

async function buildRow(page: SwiggyWebsitePageAtlas, ctas: SwiggyWebsiteCta[], fetchPage: BuildersPageFetchFn) {
  const response = await fetchPage(page.url);
  const html = response.text ?? "";
  const anchors = anchorsFrom(html);
  const uniqueLiveUrls = new Set(anchors.map((anchor) => anchor.absoluteUrl)).size;
  const unsafeLinks = anchors.filter((anchor) => !isAllowedUrl(anchor.absoluteUrl)).length;
  const text = stripTags(html);
  const modulesMatched = matchedModuleSignals(page, text);
  const ctasMatched = ctaMatches(page, ctas, anchors);
  const rowWithoutStatus = {
    id: page.id,
    title: page.title,
    url: page.url,
    pageType: page.pageType,
    statusCode: response.statusCode,
    durationMs: response.durationMs,
    liveTitle: titleFrom(html),
    anchorCount: anchors.length,
    uniqueLiveUrls,
    unsafeLinks,
    expectedModules: page.modules.length,
    matchedModuleSignals: modulesMatched,
    expectedCtas: ctasMatched.expected,
    matchedCtas: ctasMatched.matched,
    evidenceLinks: ["/api/swiggy-website-atlas", "/api/swiggy-builders-site-parity", "/api/swiggy-deep-site-map"],
  };

  return {
    ...rowWithoutStatus,
    status: statusFor(rowWithoutStatus),
  };
}

export async function fetchBuildersPage(url: string): Promise<BuildersPageFetchResult> {
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
      error: error instanceof Error ? error.message : "unknown Builders page fetch failure",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildSwiggyBuildersPageMeshAuditor(
  fetchPage: BuildersPageFetchFn = fetchBuildersPage,
): Promise<SwiggyBuildersPageMeshAuditor> {
  const atlas = buildSwiggyWebsiteAtlas();
  const pagesToFetch = atlas.pages.filter((page) => page.pageType !== "external");
  const pages = await Promise.all(pagesToFetch.map((page) => buildRow(page, atlas.ctas, fetchPage)));
  const fetchedPages = pages.filter((page) => page.statusCode && page.statusCode < 400).length;
  const unsafeLinks = pages.reduce((sum, page) => sum + page.unsafeLinks, 0);
  const score = scoreFor(pages);
  const status: SwiggyBuildersPageMeshStatus = fetchedPages < pages.length
    ? "blocked"
    : unsafeLinks > 0 || pages.some((page) => page.status === "watch")
      ? "watch"
      : "covered";

  return {
    generatedAt: new Date().toISOString(),
    score,
    status,
    officialSources: [sourceUrl, `${sourceUrl}developers/`, `${sourceUrl}enterprises/`, `${sourceUrl}access/`, `${sourceUrl}docs/`],
    totals: {
      pages: pages.length,
      fetchedPages,
      liveAnchors: pages.reduce((sum, page) => sum + page.anchorCount, 0),
      uniqueLiveUrls: pages.reduce((sum, page) => sum + page.uniqueLiveUrls, 0),
      unsafeLinks,
      expectedModules: pages.reduce((sum, page) => sum + page.expectedModules, 0),
      matchedModuleSignals: pages.reduce((sum, page) => sum + page.matchedModuleSignals, 0),
      expectedCtas: pages.reduce((sum, page) => sum + page.expectedCtas, 0),
      matchedCtas: pages.reduce((sum, page) => sum + page.matchedCtas, 0),
    },
    pages,
    driftSignals: [
      fetchedPages === pages.length
        ? `All ${pages.length} Website Atlas public pages are reachable live.`
        : `${pages.length - fetchedPages} Website Atlas public pages failed live fetch.`,
      unsafeLinks === 0
        ? "No live public-page anchors leave the approved Swiggy Builders, Swiggy legal, forms, MCP reference, or builders@swiggy.in contact origins."
        : `${unsafeLinks} live public-page anchors need origin review.`,
      pages.every((page) => page.status === "covered")
        ? "Every fetched public page satisfies module and CTA parity thresholds."
        : "One or more public pages need module or CTA reconciliation.",
    ],
    operatorRunbook: [
      {
        sequence: 1,
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-page-mesh",
        proves: "MealPilot fetches public Builders pages and reconciles modules, CTAs, anchors, and safe origins.",
      },
      {
        sequence: 2,
        command: "npm run verify:production",
        proves: "Release smoke fails on public page fetch, module, CTA, or unsafe-link drift.",
      },
      {
        sequence: 3,
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "Launch Center card for the live page mesh renders without overflow on reviewer viewports.",
      },
    ],
    assertions: [
      "Only official Swiggy Builders page URLs from Website Atlas are fetched; user-supplied URLs are never accepted.",
      "Every non-external Website Atlas page must remain reachable before the access packet is submitted.",
      "Live page anchors must stay inside Swiggy Builders, Swiggy legal pages, forms.gle, official MCP reference, or builders@swiggy.in contact paths.",
      "Module or CTA drift must trigger Website Atlas, Deep Site Map, CTA Execution, Visual QA, and production verifier updates.",
    ],
    externalGates: [
      "Swiggy may change public pages without notice; re-run the mesh auditor immediately before demo recording.",
      "Legal pages, forms, mailto actions, production credentials, and enterprise terms remain human/operator gates.",
      "The mesh auditor verifies presence and origin safety; it does not submit forms or send emails.",
    ],
  };
}
