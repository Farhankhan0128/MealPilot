import type {
  MealPlan,
  SwiggyBuildersNavigationWitness,
  SwiggyBuildersNavigationWitnessKind,
  SwiggyBuildersNavigationWitnessRow,
  SwiggyBuildersNavigationWitnessStatus,
  SwiggyWebsiteNavLink,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";
import { buildSwiggyCtaLiveAuditor, type CtaLiveProbeFn } from "./ctaLiveAuditor.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeUrl(url: string) {
  if (url.startsWith("mailto:")) return url.toLowerCase();
  try {
    const parsed = new URL(url, "https://mcp.swiggy.com/builders/");
    parsed.hash = parsed.hash.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "/");
    return parsed.toString();
  } catch {
    return url;
  }
}

function kindFor(link: SwiggyWebsiteNavLink): SwiggyBuildersNavigationWitnessKind {
  if (link.location === "global_header") return "header";
  if (link.location === "docs_subnav") return "docs_nav";
  if (link.location === "footer_program") return "footer_program";
  if (link.location === "footer_legal") return "footer_legal";
  return "footer_resource";
}

function proofLinksFor(link: SwiggyWebsiteNavLink) {
  const base = ["/api/swiggy-website-atlas", "/api/swiggy-cta-execution-center", "/api/swiggy-cta-live-audit"];
  if (link.location === "docs_subnav") return unique([...base, "/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer"]);
  if (link.location === "footer_legal") return unique([...base, "/api/data-governance-center", "/api/brand-compliance-kit"]);
  if (link.location === "footer_resources") return unique([...base, "/api/swiggy-source-availability-audit"]);
  return unique([...base, "/api/swiggy-builders-page-mesh"]);
}

function ownerFor(link: SwiggyWebsiteNavLink): SwiggyBuildersNavigationWitnessRow["owner"] {
  if (link.location === "footer_legal") return "Swiggy";
  if (link.url.startsWith("mailto:")) return "Operator";
  if (link.id.includes("apply")) return "Joint";
  return "MealPilot";
}

function statusFor(link: SwiggyWebsiteNavLink, hasCtaMatch: boolean): SwiggyBuildersNavigationWitnessStatus {
  if (link.url.startsWith("mailto:") || link.location === "footer_legal") return "manual_gate";
  if (hasCtaMatch) return "verified";
  if (link.url.startsWith("https://mcp.swiggy.com/builders/")) return "verified";
  return "watch";
}

function statusWeight(status: SwiggyBuildersNavigationWitnessStatus) {
  if (status === "verified") return 1;
  if (status === "manual_gate") return 0.9;
  if (status === "watch") return 0.72;
  return 0.35;
}

export async function buildSwiggyBuildersNavigationWitness(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
  probeTarget?: CtaLiveProbeFn;
}): Promise<SwiggyBuildersNavigationWitness> {
  const atlas = buildSwiggyWebsiteAtlas();
  const ctaLive = await buildSwiggyCtaLiveAuditor({
    config: options.config,
    latestPlan: options.latestPlan,
    probeTarget: options.probeTarget,
  });
  const ctaUrls = new Set(ctaLive.rows.map((row) => row.normalizedUrl));
  const footerLinks = atlas.footerGroups.flatMap((group) => group.links);
  const links = [...atlas.globalHeader, ...atlas.docsHeader, ...footerLinks];

  const rows: SwiggyBuildersNavigationWitnessRow[] = links.map((link) => {
    const normalizedUrl = normalizeUrl(link.url);
    const hasCtaMatch = ctaUrls.has(normalizedUrl);
    const status = statusFor(link, hasCtaMatch);
    const sourceState = link.url.startsWith("mailto:")
      ? "mail_manual_gate"
      : link.location === "footer_legal"
        ? "legal_manual_gate"
        : hasCtaMatch
          ? "cta_live_match"
          : "atlas_mapped";

    return {
      id: `${link.location}_${link.id}`,
      label: link.label,
      url: link.url,
      normalizedUrl,
      kind: kindFor(link),
      location: link.location,
      status,
      sourceState,
      owner: ownerFor(link),
      mealPilotCoverage: link.mealPilotCoverage,
      evidence: hasCtaMatch
        ? "CTA Live Audit has a matching normalized target for this navigation link."
        : "Website Atlas preserves this official navigation or footer link as reviewer evidence.",
      nextAction:
        status === "manual_gate"
          ? "Keep this as a browser/operator review gate; do not accept legal terms or send email automatically."
          : "Keep this navigation link visible in Website Atlas, Page Mesh, and visual QA before submission.",
      proofLinks: proofLinksFor(link),
    };
  });

  const proofLinks = unique(rows.flatMap((row) => row.proofLinks));
  const groupDefs = [
    { id: "global_header", label: "Global header" },
    { id: "docs_subnav", label: "Docs navigation" },
    { id: "footer_program", label: "Footer program" },
    { id: "footer_resources", label: "Footer resources" },
    { id: "footer_legal", label: "Footer legal" },
  ];
  const groups = groupDefs.map((group) => {
    const groupRows = rows.filter((row) => row.location === group.id);
    return {
      id: group.id,
      label: group.label,
      rows: groupRows.length,
      verified: groupRows.filter((row) => row.status === "verified").length,
      manualGates: groupRows.filter((row) => row.status === "manual_gate").length,
      watch: groupRows.filter((row) => row.status === "watch").length,
      blocked: groupRows.filter((row) => row.status === "blocked").length,
      proofLinks: unique(groupRows.flatMap((row) => row.proofLinks)),
    };
  });

  const blocked = rows.filter((row) => row.status === "blocked").length;
  const watch = rows.filter((row) => row.status === "watch").length;
  const decision: SwiggyBuildersNavigationWitness["decision"] =
    blocked > 0 ? "navigation_blocked" : watch > 0 ? "navigation_watch" : "navigation_ready";

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round((rows.reduce((sum, row) => sum + statusWeight(row.status), 0) / rows.length) * 100),
    decision,
    officialSources: unique([atlas.officialSource, ...links.map((link) => link.url), ...ctaLive.officialSources]),
    totals: {
      rows: rows.length,
      verified: rows.filter((row) => row.status === "verified").length,
      manualGates: rows.filter((row) => row.status === "manual_gate").length,
      watch,
      blocked,
      headerLinks: atlas.globalHeader.length,
      docsLinks: atlas.docsHeader.length,
      footerLinks: footerLinks.length,
      proofLinks: proofLinks.length,
    },
    rows,
    groups,
    commands: [
      {
        id: "navigation_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-navigation-witness",
        proves: "Header, docs nav, and footer links are witnessed with proof links, live CTA matches, and manual gates.",
        expectedSignal: "totals.rows >= 20 && totals.blocked === 0",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke keeps navigation evidence aligned with Website Atlas and CTA Live Audit.",
        expectedSignal: "navigationWitnessScore >= 90",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Navigation Witness card is captured with every reviewer-critical Launch Center surface.",
        expectedSignal: "79 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Every Website Atlas global header, docs subnav, and footer link has one Navigation Witness row.",
      "Legal and email links remain manual gates; local automation never accepts legal terms or sends builders@swiggy.in mail.",
      "Navigation Witness composes Website Atlas and CTA Live Audit without accepting user-supplied URLs.",
    ],
    externalGates: [
      "Swiggy may change public navigation, legal links, docs roots, or footer resources without notice.",
      "Legal review, email sends, forms, production access, co-branding, quotas, and credentials remain operator or Swiggy-owned.",
    ],
  };
}
