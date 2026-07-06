import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyBuilderCtaAction,
  SwiggyDeepSiteCta,
  SwiggyDeepSiteMap,
  SwiggyDeepSiteMapStatus,
  SwiggyDeepSitePage,
  SwiggyDeepSiteSection,
  SwiggyWebsiteCrawlEvidence,
  SwiggyWebsiteNavLink,
} from "../../src/domain/types.js";
import { buildSwiggyBuilderIntakeCommandCenter } from "./builderIntake.js";
import { buildSwiggySourceIntelligence } from "./sourceIntelligence.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyDeepSiteMapStatus) {
  if (status === "implemented") return 1;
  if (status === "documented") return 0.88;
  if (status === "watch") return 0.72;
  return 0.56;
}

function ctaStatus(action: SwiggyBuilderCtaAction | undefined, fallback: SwiggyDeepSiteMapStatus) {
  if (!action) return fallback;
  if (action.completionGate === "swiggy_approval" || action.completionGate === "external_site") return "external_gate";
  if (action.completionGate === "operator_submit") return "documented";
  return action.preparedLocally ? "implemented" : "watch";
}

function pageStatus(
  moduleStatuses: SwiggyDeepSiteMapStatus[],
  actions: Array<SwiggyBuilderCtaAction | undefined>,
): SwiggyDeepSiteMapStatus {
  if (actions.some((action) => action?.completionGate === "swiggy_approval")) return "external_gate";
  if (moduleStatuses.every((status) => status === "implemented") && actions.every((action) => action?.preparedLocally ?? true)) {
    return "implemented";
  }
  if (moduleStatuses.some((status) => status === "watch")) return "watch";
  return "documented";
}

function linkToMatrix(link: SwiggyWebsiteNavLink, status: SwiggyDeepSiteMapStatus) {
  return {
    id: link.id,
    label: link.label,
    location: link.location,
    url: link.url,
    mealPilotCoverage: link.mealPilotCoverage,
    status,
  };
}

function actionForPage(
  status: SwiggyDeepSiteMapStatus,
  crawl: SwiggyWebsiteCrawlEvidence | undefined,
  proofLinks: string[],
) {
  if (status === "implemented") return `Keep ${proofLinks.length} MealPilot proof link(s) green in verifier and demo.`;
  if (status === "documented") return "Use the prepared proof and complete the manual browser/email step during operator handoff.";
  if (status === "watch") return `Refresh this page before the next demo; last crawl captured ${crawl?.renderedLineCount ?? 0} rendered lines.`;
  return "Treat as external-gated until Swiggy approval, enterprise terms, or production credentials are issued.";
}

function section(
  id: string,
  label: string,
  officialSignal: string,
  sourceUrls: string[],
  evidenceLinks: string[],
  total: number,
  ready: number,
  status: SwiggyDeepSiteMapStatus,
  nextAction: string,
): SwiggyDeepSiteSection {
  return { id, label, officialSignal, sourceUrls, evidenceLinks, total, ready, status, nextAction };
}

export function buildSwiggyDeepSiteMap(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
}): SwiggyDeepSiteMap {
  const atlas = buildSwiggyWebsiteAtlas();
  const sourceIntelligence = buildSwiggySourceIntelligence();
  const intake = buildSwiggyBuilderIntakeCommandCenter({
    config: options.config,
    latestPlan: options.latestPlan,
  });
  const actionById = new Map(intake.actions.map((action) => [action.id, action]));

  const pages: SwiggyDeepSitePage[] = atlas.pages.map((page) => {
    const crawl = atlas.crawlEvidence.find((item) => item.pageId === page.id);
    const pageActions = page.ctaIds.map((id) => actionById.get(id));
    const moduleStatuses = page.modules.map((module) =>
      module.status === "implemented" ? "implemented" : module.status === "documented" ? "documented" : "external_gate",
    );
    const coverageStatus = pageStatus(moduleStatuses, pageActions);
    const proofLinks = unique([
      ...(crawl?.mealPilotEvidence ?? []),
      ...pageActions.flatMap((action) => action?.evidenceLinks ?? []),
      ...page.modules.flatMap((module) => (module.mealPilotCoverage.includes("/api/") ? [module.mealPilotCoverage] : [])),
    ]);

    return {
      id: page.id,
      title: page.title,
      url: page.url,
      pageType: page.pageType,
      primaryAudience: page.primaryAudience,
      moduleCount: page.modules.length,
      ctaCount: page.ctaIds.length,
      headerSignals: crawl?.headerSignals ?? [],
      footerSignals: crawl?.footerSignals ?? [],
      ctaSignals: crawl?.ctaSignals ?? page.ctaIds,
      moduleSignals: crawl?.moduleSignals ?? page.modules.map((module) => module.title),
      proofLinks,
      coverageStatus,
      nextReviewAction: actionForPage(coverageStatus, crawl, proofLinks),
    };
  });

  const ctas: SwiggyDeepSiteCta[] = atlas.ctas.map((cta) => {
    const action = actionById.get(cta.id);
    const status = ctaStatus(action, cta.status === "implemented" ? "implemented" : "documented");
    return {
      id: cta.id,
      label: cta.label,
      url: cta.url,
      appearsOn: cta.appearsOn,
      intent: cta.intent,
      actionType: action?.actionType ?? (cta.url.startsWith("mailto:") ? "email" : "navigate"),
      completionGate: action?.completionGate ?? "none",
      mealPilotResponse: action?.mealPilotAction ?? cta.mealPilotResponse,
      evidenceLinks: action?.evidenceLinks ?? ["/api/swiggy-website-atlas"],
      status,
    };
  });

  const footerLinks = atlas.footerGroups.flatMap((group) => group.links);
  const headerFooterMatrix = [
    ...atlas.globalHeader.map((link) => linkToMatrix(link, "implemented")),
    ...atlas.docsHeader.map((link) => linkToMatrix(link, "implemented")),
    ...footerLinks.map((link) => linkToMatrix(link, link.location.includes("legal") ? "documented" : "implemented")),
  ];
  const proofLinks = unique([
    ...pages.flatMap((page) => page.proofLinks),
    ...ctas.flatMap((cta) => cta.evidenceLinks),
    ...sourceIntelligence.clusters.flatMap((cluster) => cluster.mealPilotEvidence),
  ]);
  const implementedPages = pages.filter((page) => page.coverageStatus === "implemented").length;
  const implementedCtas = ctas.filter((cta) => cta.status === "implemented").length;
  const sections = [
    section(
      "site_pages",
      "Website pages and modules",
      "Homepage, Developers, Enterprises, Access, Docs, Reference, Blog, and Footer are all represented with module-level proof.",
      atlas.pages.map((page) => page.url),
      ["/api/swiggy-website-atlas", "/api/swiggy-source-intelligence"],
      pages.length,
      implementedPages,
      implementedPages >= 5 ? "implemented" : "watch",
      "Use this page list as the operator checklist before every access-demo recording.",
    ),
    section(
      "header_footer",
      "Header, docs nav, and footer",
      "Global header, docs subnav, footer program links, resource links, legal links, and builders@swiggy.in are mapped.",
      headerFooterMatrix.map((link) => link.url),
      ["/api/swiggy-website-atlas", "/api/swiggy-faq-policy"],
      headerFooterMatrix.length,
      headerFooterMatrix.filter((link) => link.status !== "external_gate").length,
      "implemented",
      "Keep legal links documented and never imply Swiggy endorsement before approval.",
    ),
    section(
      "cta_paths",
      "CTA paths and operator gates",
      "Start Building, Apply, Send Demo, Contact, Read Docs, llms, developer, and enterprise CTAs are converted into owned actions.",
      ctas.map((cta) => cta.url),
      ["/api/swiggy-builder-intake", "/api/access-submission-studio"],
      ctas.length,
      implementedCtas,
      implementedCtas >= 6 ? "documented" : "watch",
      "Keep form/email CTAs manual and copy-ready; local tests must not submit external Swiggy state.",
    ),
    section(
      "source_reconciliation",
      "llms and docs source reconciliation",
      "llms.txt, llms-full.txt, markdown twins, and reference pages remain the source-of-truth refresh loop.",
      sourceIntelligence.officialSources,
      ["/api/swiggy-docs-coverage", "/api/swiggy-upstream-watch", "/api/coding-agent-governance"],
      sourceIntelligence.inventory.llmsLinkedPages,
      sourceIntelligence.inventory.toolReferenceTools,
      "watch",
      "Refresh official source pages before final production submission and after Swiggy changelog updates.",
    ),
  ];
  const scoreItems = [
    ...pages.map((page) => page.coverageStatus),
    ...ctas.map((cta) => cta.status),
    ...sections.map((item) => item.status),
    ...headerFooterMatrix.map((link) => link.status),
  ];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources: unique([atlas.officialSource, ...sourceIntelligence.officialSources]),
    totals: {
      pages: pages.length,
      modules: pages.reduce((sum, page) => sum + page.moduleCount, 0),
      ctas: ctas.length,
      headerLinks: atlas.globalHeader.length + atlas.docsHeader.length,
      footerLinks: footerLinks.length,
      crawlSignals: atlas.liveCrawlSignals,
      proofLinks: proofLinks.length,
      sections: sections.length,
    },
    pages,
    ctas,
    sections,
    headerFooterMatrix,
    assertions: [
      "Every public Builders page represented in Website Atlas is converted into a Deep Site Map page row with modules, CTAs, and proof links.",
      "Global header, docs subnav, footer resources, legal links, and builders@swiggy.in remain visible as a single matrix.",
      "Form and email CTAs are prepared locally but still require explicit operator action outside local automated tests.",
      "The official llms source loop remains a watch item because Swiggy can add pages, tools, rate-limit headers, widgets, or manifest signing later.",
    ],
    externalGates: [
      "External Google Forms and mailto actions require an operator in the browser or mail client.",
      "Enterprise partnership, co-branding, custom rate limits, and production credentials require Swiggy approval.",
      "Legal/privacy/terms interpretation must be confirmed before live user launch.",
    ],
  };
}
