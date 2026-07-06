import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  MealPlan,
  McpServerCoverage,
  RuntimeTelemetryReport,
  SwiggyBuildersHomepageExperienceCenter,
  SwiggyBuildersHomepageExperienceStatus,
  SwiggyBuildersHomepageSection,
  UserProfile,
} from "../../src/domain/types.js";
import { buildSwiggyBenefitsActivationCenter } from "./benefitsActivationCenter.js";
import { buildSwiggyConversionCenter } from "./conversionCenter.js";
import { buildSwiggyCtaExecutionCenter } from "./ctaExecutionCenter.js";
import { buildSwiggyFaqResolutionCenter } from "./faqResolutionCenter.js";
import { buildSwiggyBuildersJourneyGateCenter } from "./journeyGateCenter.js";
import { buildSwiggyBuildersModuleIntelligenceCenter } from "./moduleIntelligence.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

const buildersRoot = "https://mcp.swiggy.com/builders/";

const emptyHandoffState: AccessSubmissionHandoffState = {
  demoVideoUrl: "",
  technicalContactEmail: "",
  productionRedirectUri: "",
  staticEgressIp: "",
  environmentSummary: "",
  termsAcknowledged: false,
  notes: "",
  updatedAt: "",
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyBuildersHomepageExperienceStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.86;
  if (status === "operator_gate") return 0.8;
  return 0.72;
}

function section(input: SwiggyBuildersHomepageSection): SwiggyBuildersHomepageSection {
  return input;
}

export function buildSwiggyBuildersHomepageExperienceCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
  handoffState?: AccessSubmissionHandoffState;
}): SwiggyBuildersHomepageExperienceCenter {
  const handoffState = options.handoffState ?? emptyHandoffState;
  const atlas = buildSwiggyWebsiteAtlas();
  const ctaExecution = buildSwiggyCtaExecutionCenter({ config: options.config, latestPlan: options.latestPlan });
  const moduleIntelligence = buildSwiggyBuildersModuleIntelligenceCenter();
  const journeyGates = buildSwiggyBuildersJourneyGateCenter({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.latestPlan,
    handoffState,
  });
  const conversion = buildSwiggyConversionCenter({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.latestPlan,
    handoffState,
  });
  const benefits = buildSwiggyBenefitsActivationCenter({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    plans: options.plans,
    telemetry: options.telemetry,
  });
  const faqResolution = buildSwiggyFaqResolutionCenter({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.latestPlan,
    handoffState,
  });

  const sections = [
    section({
      id: "global_header",
      sequence: 1,
      label: "Global Header",
      anchor: buildersRoot,
      sourceSignal: "Builders Club, Developers, Enterprises, Docs, Blog, FAQ, and Start Building links orient every visitor.",
      experiencePromise: "Navigation never strands a builder; each link has a visible MealPilot proof route or external boundary.",
      mealPilotSurface: "Website Atlas, CTA Execution Center, and Deep Site Map reconcile header links with product surfaces.",
      status: "ready",
      ctaIds: atlas.globalHeader.map((link) => link.id),
      proofLinks: ["/api/swiggy-website-atlas", "/api/swiggy-cta-execution-center", "/api/swiggy-deep-site-map"],
      mobileCheck: "Mobile navigation remains explicit and the Launch Center card exposes the same section proof.",
      reviewerCheck: "Reviewer can open Header links in Website Atlas and verify each route has a MealPilot coverage statement.",
      externalGate: "External Swiggy pages remain official browser destinations and are not mirrored as local content.",
      nextAction: "Keep header links synchronized with live Site Parity before every access packet export.",
    }),
    section({
      id: "hero",
      sequence: 2,
      label: "Hero",
      anchor: buildersRoot,
      sourceSignal: "Build on Food, Instamart, and Dineout with localhost-first proof before production access.",
      experiencePromise: "A reviewer sees MealPilot as a real product immediately, with all three MCP servers visible.",
      mealPilotSurface: "Tool Lab, MCP Catalog, and Builder Packet Export prove the app is runnable before credentials.",
      status: "ready",
      ctaIds: ["start_building", "see_whats_possible"],
      proofLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/builder-packet-export"],
      mobileCheck: "Hero proof compresses to measurable status blocks instead of decorative marketing copy.",
      reviewerCheck: "Reviewer can run build, tests, verifier, and Tool Lab from the packet commands.",
      externalGate: "Hero copy cannot imply live production access until Swiggy issues credentials.",
      nextAction: "Keep the hero tied to executable local proof and current 35-tool coverage.",
    }),
    section({
      id: "how_it_works",
      sequence: 3,
      label: "How It Works",
      anchor: `${buildersRoot}#how-it-works`,
      sourceSignal: "Start Building, Apply for Prod Access, Quick Review, Go Live, and Show Us What You Built.",
      experiencePromise: "The journey reads as a controlled path, not a vague launch checklist.",
      mealPilotSurface: "Journey Gate Center and Submission Timeline map every step to owner, status, and proof.",
      status: "operator_gate",
      ctaIds: journeyGates.gates.map((gate) => gate.id),
      proofLinks: ["/api/swiggy-builders-journey-gates", "/api/swiggy-submission-timeline-center", "/api/access-submission-studio"],
      mobileCheck: "The five steps are visible as compact status rows with owners on mobile.",
      reviewerCheck: "Reviewer can inspect 5 gates, 40 criteria, 25 proof links, and external ownership boundaries.",
      externalGate: "Application submission, review, credentials, go-live, and demo send remain operator or Swiggy-owned.",
      nextAction: "Use Journey Gates as the official path readback before recording the access demo.",
    }),
    section({
      id: "benefits",
      sequence: 4,
      label: "What You Get",
      anchor: `${buildersRoot}#benefits`,
      sourceSignal: "Live APIs, quota expansion, support, Powered by Swiggy, showcase visibility, growth, and enterprise support.",
      experiencePromise: "Benefits become activation lanes with proof, owner, CTA, and approval status.",
      mealPilotSurface: "Benefits Activation composes quota, support, growth, brand, enterprise, and partner success evidence.",
      status: benefits.totals.swiggyGates > 0 ? "swiggy_gate" : "ready",
      ctaIds: benefits.activationCtas.map((cta) => cta.id),
      proofLinks: ["/api/swiggy-benefits-activation-center", "/api/swiggy-quota-negotiation-center", "/api/brand-compliance-kit"],
      mobileCheck: "Benefit counts fit into four compact stats and do not hide Swiggy-owned approvals.",
      reviewerCheck: `Reviewer can inspect ${benefits.totals.benefits} benefit lanes and ${benefits.totals.activationCtas} activation CTAs.`,
      externalGate: "No benefit is claimed as granted before access, quota, brand, showcase, or enterprise approval.",
      nextAction: "Keep benefits framed as activation readiness until Swiggy grants the actual benefit.",
    }),
    section({
      id: "guidelines",
      sequence: 5,
      label: "Guidelines",
      anchor: `${buildersRoot}#guidelines`,
      sourceSignal: "Access guidance, operating principles, allowed/restricted/prohibited rules, legal, and safety expectations.",
      experiencePromise: "Guidelines are treated as product controls, not a footer-only compliance afterthought.",
      mealPilotSurface: "Access Dossier, Access Evidence Matrix, Data Governance, and Brand Compliance preserve policy boundaries.",
      status: "operator_gate",
      ctaIds: ["apply_prod_access", "apply_developer", "apply_enterprise"],
      proofLinks: ["/api/swiggy-access-dossier", "/api/swiggy-access-evidence-matrix", "/api/data-governance-center", "/api/brand-compliance-kit"],
      mobileCheck: "Policy proof stays visible beside access CTAs and does not rely on long legal paragraphs.",
      reviewerCheck: "Reviewer can trace every access field and ground rule to local evidence and manual gates.",
      externalGate: "Terms acknowledgement, legal review, and official application submission remain external.",
      nextAction: "Update access evidence before any claim about production readiness or co-branding.",
    }),
    section({
      id: "faq",
      sequence: 6,
      label: "FAQ",
      anchor: `${buildersRoot}#faq`,
      sourceSignal: "Program fit, demo, approvals, rate limits, support, sandbox, auth, enterprise, and white-label questions.",
      experiencePromise: "Every FAQ answer has an owner, evidence route, next CTA, and honest approval boundary.",
      mealPilotSurface: "FAQ Policy and FAQ Resolution synchronize answers, CTA proof, support contact, and access evidence.",
      status: faqResolution.totals.swiggyGates > 0 ? "swiggy_gate" : "ready",
      ctaIds: faqResolution.activationCtas.map((cta) => cta.id),
      proofLinks: ["/api/swiggy-faq-policy", "/api/swiggy-faq-resolution-center", "/api/swiggy-access-evidence-matrix"],
      mobileCheck: "FAQ status remains scannable as counts and proof links rather than long hidden copy.",
      reviewerCheck: `Reviewer can inspect ${faqResolution.totals.questions} questions and ${faqResolution.totals.policyRules} policy rules.`,
      externalGate: "Credentials, co-branding, legal answers, and enterprise terms require Swiggy approval.",
      nextAction: "Use FAQ Resolution before reviewer calls and access submission.",
    }),
    section({
      id: "final_cta",
      sequence: 7,
      label: "What Will You Cook?",
      anchor: `${buildersRoot}#final-cta`,
      sourceSignal: "Final CTA asks builders to start, send a demo, request access, or contact builders@swiggy.in.",
      experiencePromise: "The end of the page becomes a copy-ready, proof-backed handoff instead of a dead button cluster.",
      mealPilotSurface: "Conversion Center and CTA Execution Center map every final CTA to destination, owner, proof, and gate.",
      status: "operator_gate",
      ctaIds: conversion.conversionSteps.map((step) => step.id),
      proofLinks: ["/api/swiggy-conversion-center", "/api/swiggy-cta-execution-center", "/api/swiggy-demo-evidence-director"],
      mobileCheck: "Final CTA links remain large enough to tap and expose the manual send/submit boundary.",
      reviewerCheck: `Reviewer can inspect ${conversion.totals.steps} CTA steps and ${ctaExecution.totals.targets} total click targets.`,
      externalGate: "Mail clients, Google Forms, and official access pages are never auto-submitted.",
      nextAction: "Use Conversion Center to decide which final CTA is safe for the current review stage.",
    }),
    section({
      id: "footer",
      sequence: 8,
      label: "Footer",
      anchor: buildersRoot,
      sourceSignal: "Program, resource, legal, llms, and builders@swiggy.in links close the page.",
      experiencePromise: "Footer links stay part of the product evidence loop instead of being ignored after the CTA.",
      mealPilotSurface: "Website Atlas, Source Intelligence, Docs Twin Explorer, and reviewer vault preserve footer proof.",
      status: "watch",
      ctaIds: atlas.footerGroups.flatMap((group) => group.links.map((link) => link.id)),
      proofLinks: ["/api/swiggy-website-atlas", "/api/swiggy-source-intelligence", "/api/swiggy-docs-twin-explorer", "/api/reviewer-artifact-vault"],
      mobileCheck: "Footer legal, docs, and contact links remain readable on mobile and in exported docs.",
      reviewerCheck: "Reviewer can inspect footer resources, llms links, privacy, terms, and contact routes from the atlas.",
      externalGate: "Legal pages and official contact channels stay outside local automation.",
      nextAction: "Keep footer and llms source links refreshed before packaging the builder packet.",
    }),
  ];

  const proofLinks = unique(sections.flatMap((item) => item.proofLinks));
  const score = Math.round((sections.reduce((sum, item) => sum + statusWeight(item.status), 0) / sections.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources: unique([buildersRoot, `${buildersRoot}#faq`, `${buildersRoot}llms.txt`, ...atlas.pages.map((page) => page.url)]),
    totals: {
      sections: sections.length,
      ready: sections.filter((item) => item.status === "ready").length,
      watch: sections.filter((item) => item.status === "watch").length,
      operatorGates: sections.filter((item) => item.status === "operator_gate").length,
      swiggyGates: sections.filter((item) => item.status === "swiggy_gate").length,
      headerLinks: atlas.globalHeader.length,
      footerLinks: atlas.footerGroups.reduce((sum, group) => sum + group.links.length, 0),
      ctas: unique(sections.flatMap((item) => item.ctaIds)).length,
      proofLinks: proofLinks.length,
    },
    sections,
    continuityMap: [
      {
        from: "global_header",
        to: "hero",
        continuity: "Header promises resolve into executable local three-server proof.",
        proofLinks: ["/api/swiggy-website-atlas", "/api/mcp/catalog"],
      },
      {
        from: "hero",
        to: "how_it_works",
        continuity: "Local proof feeds the five-step production-access journey.",
        proofLinks: ["/api/swiggy-builders-journey-gates", "/api/swiggy-submission-timeline-center"],
      },
      {
        from: "benefits",
        to: "guidelines",
        continuity: "Benefit ambition is checked against access, brand, legal, and data boundaries.",
        proofLinks: ["/api/swiggy-benefits-activation-center", "/api/swiggy-access-dossier"],
      },
      {
        from: "faq",
        to: "final_cta",
        continuity: "Answered objections convert into safe CTA handoffs with manual gates.",
        proofLinks: ["/api/swiggy-faq-resolution-center", "/api/swiggy-conversion-center"],
      },
      {
        from: "final_cta",
        to: "footer",
        continuity: "Final action links remain backed by footer docs, legal, support, and source manifests.",
        proofLinks: ["/api/swiggy-source-intelligence", "/api/swiggy-docs-twin-explorer"],
      },
    ],
    reviewerRunbook: [
      {
        sequence: 1,
        label: "Open the live homepage",
        action: "Compare header, hero, how-it-works, benefits, guidelines, FAQ, final CTA, and footer against the local section map.",
        proofLinks: ["/api/swiggy-builders-homepage-experience", "/api/swiggy-builders-site-parity"],
      },
      {
        sequence: 2,
        label: "Trace section continuity",
        action: "Move from header to final CTA and verify each section has a proof route, mobile check, reviewer check, and external gate.",
        proofLinks: ["/api/swiggy-builders-homepage-experience", "/api/swiggy-builders-journey-gates"],
      },
      {
        sequence: 3,
        label: "Freeze reviewer packet",
        action: "Run production verifier, visual QA, and builder packet export after section proof is current.",
        proofLinks: ["/api/visual-qa-center", "/api/builder-packet-export"],
      },
    ],
    assertions: [
      `Every primary Builders homepage section is mapped into ${sections.length} MealPilot experience rows.`,
      `${atlas.globalHeader.length} global header links, ${atlas.footerGroups.length} footer groups, and ${ctaExecution.totals.targets} click targets feed the homepage experience contract.`,
      `${moduleIntelligence.totals.modules} Website Atlas modules remain the source inventory behind the section experience map.`,
      "Each section includes mobile and reviewer checks so the portal is audited as an experience, not just an API list.",
      "External forms, emails, legal pages, credentials, quota, brand, and production claims stay explicitly gated.",
    ],
    externalGates: [
      "Official Swiggy navigation, legal pages, forms, email, and docs remain external sources.",
      "Production access, quick review, go-live, quota, brand, showcase, and enterprise benefits require Swiggy approval.",
      "Operator must submit forms, send demo email, record acknowledgements, and refresh proof before public claims.",
    ],
  };
}
