import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyBuilderCtaAction,
  SwiggyBuilderCtaCompletionGate,
  SwiggyCtaExecutionCenter,
  SwiggyCtaExecutionKind,
  SwiggyCtaExecutionStatus,
  SwiggyCtaExecutionTarget,
  SwiggyWebsiteNavLink,
} from "../../src/domain/types.js";
import { buildSwiggyBuilderIntakeCommandCenter } from "./builderIntake.js";
import { buildSwiggyDeepSiteMap } from "./deepSiteMap.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyCtaExecutionStatus) {
  if (status === "ready") return 1;
  if (status === "operator_action") return 0.78;
  return 0.55;
}

function kindForUrl(url: string, action?: SwiggyBuilderCtaAction): SwiggyCtaExecutionKind {
  if (action?.actionType === "form") return "form";
  if (action?.actionType === "email" || url.startsWith("mailto:")) return "email";
  if (url.includes("privacy") || url.includes("terms")) return "legal";
  if (url.includes("/docs") || url.includes("llms")) return "docs";
  if (url.startsWith("/api/")) return "proof";
  return "navigate";
}

function statusForGate(completionGate: SwiggyBuilderCtaCompletionGate): SwiggyCtaExecutionStatus {
  if (completionGate === "none") return "ready";
  if (completionGate === "operator_submit") return "operator_action";
  return "external_gate";
}

function browserActionFor(kind: SwiggyCtaExecutionKind, url: string) {
  if (kind === "email") return `Open ${url} and verify the generated mail draft before the operator sends it.`;
  if (kind === "form") return "Open the official Swiggy access form, paste prepared fields, attach proof links, and stop before final submit.";
  if (kind === "legal") return "Open the external Swiggy legal page in a new tab and keep it as compliance evidence.";
  if (kind === "docs") return "Open the official documentation or llms source and reconcile the linked MealPilot proof.";
  if (kind === "proof") return "Open the local MealPilot API proof in a new tab and verify the JSON signal.";
  return "Open the official Builders page in a new tab and confirm the expected section or anchor is reachable.";
}

function keyboardPathFor(kind: SwiggyCtaExecutionKind, label: string) {
  if (kind === "email") return ["Tab to CTA", "Enter", "Confirm mail client opens", "Do not send without operator approval"];
  if (kind === "form") return ["Tab to CTA", "Enter", "Paste prepared values", "Attach demo/proof links", "Operator submits manually"];
  if (kind === "legal") return ["Tab to footer legal link", "Enter", "Confirm external page loads", "Return to MealPilot"];
  return ["Tab to link", "Enter", `Confirm ${label} loads`, "Return to Launch Center proof"];
}

function targetFromAction(action: SwiggyBuilderCtaAction): SwiggyCtaExecutionTarget {
  const kind = kindForUrl(action.officialUrl, action);
  const status = statusForGate(action.completionGate);
  return {
    id: `cta_${action.id}`,
    label: action.label,
    location: action.location,
    kind,
    officialUrl: action.officialUrl,
    sourcePages: action.sourcePages,
    officialIntent: action.officialIntent,
    mealPilotAction: action.mealPilotAction,
    browserAction: browserActionFor(kind, action.officialUrl),
    keyboardPath: keyboardPathFor(kind, action.label),
    proofLinks: action.evidenceLinks,
    status,
    completionGate: action.completionGate,
    nextAction: action.nextAction,
  };
}

function targetFromLink(link: SwiggyWebsiteNavLink): SwiggyCtaExecutionTarget {
  const kind = kindForUrl(link.url);
  const status = kind === "legal" ? "operator_action" : "ready";
  const completionGate: SwiggyBuilderCtaCompletionGate = kind === "legal" ? "external_site" : "none";
  return {
    id: `link_${link.location}_${link.id}`,
    label: link.label,
    location: link.location,
    kind,
    officialUrl: link.url,
    sourcePages: [link.location.replace("_", " ")],
    officialIntent: link.mealPilotCoverage,
    mealPilotAction: link.mealPilotCoverage,
    browserAction: browserActionFor(kind, link.url),
    keyboardPath: keyboardPathFor(kind, link.label),
    proofLinks: ["/api/swiggy-website-atlas", "/api/swiggy-deep-site-map"],
    status,
    completionGate,
    nextAction: status === "ready" ? "Keep this link present in the Launch Center and verifier." : "Open manually during legal/compliance review.",
  };
}

function group(id: string, label: string, targets: SwiggyCtaExecutionTarget[]) {
  return {
    id,
    label,
    total: targets.length,
    ready: targets.filter((target) => target.status === "ready").length,
    operatorActions: targets.filter((target) => target.status === "operator_action").length,
    externalGates: targets.filter((target) => target.status === "external_gate").length,
    proofLinks: unique(targets.flatMap((target) => target.proofLinks)).slice(0, 8),
  };
}

export function buildSwiggyCtaExecutionCenter(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
}): SwiggyCtaExecutionCenter {
  const atlas = buildSwiggyWebsiteAtlas();
  const intake = buildSwiggyBuilderIntakeCommandCenter(options);
  const deepSiteMap = buildSwiggyDeepSiteMap(options);
  const ctaTargets = intake.actions.map(targetFromAction);
  const headerTargets = atlas.globalHeader.map(targetFromLink);
  const docsTargets = atlas.docsHeader.map(targetFromLink);
  const footerTargets = atlas.footerGroups.flatMap((footerGroup) => footerGroup.links.map(targetFromLink));
  const targets = [...ctaTargets, ...headerTargets, ...docsTargets, ...footerTargets];
  const groups = [
    group("cta_paths", "Official CTA paths", ctaTargets),
    group("global_header", "Global header", headerTargets),
    group("docs_subnav", "Docs navigation", docsTargets),
    group("footer_links", "Footer and legal links", footerTargets),
  ];
  const score = Math.round((targets.reduce((sum, target) => sum + statusWeight(target.status), 0) / targets.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources: unique([atlas.officialSource, ...intake.officialSources, ...deepSiteMap.officialSources]),
    totals: {
      targets: targets.length,
      ready: targets.filter((target) => target.status === "ready").length,
      operatorActions: targets.filter((target) => target.status === "operator_action").length,
      externalGates: targets.filter((target) => target.status === "external_gate").length,
      headerLinks: headerTargets.length,
      docsLinks: docsTargets.length,
      footerLinks: footerTargets.length,
      ctas: ctaTargets.length,
    },
    groups,
    targets,
    commands: [
      {
        id: "cta_readback",
        command: "curl -s http://localhost:8787/api/swiggy-cta-execution-center",
        proves: "Reads every official CTA, header link, docs nav link, footer link, status, proof link, and manual gate.",
        expectedSignal: "totals.targets >= 28 && groups.length === 4",
        status: "ready",
      },
      {
        id: "visual_target",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "Captures the Launch Center CTA Execution card across the reviewer screenshot manifest.",
        expectedSignal: "developer screenshots include cta_execution_card with no overflow issues",
        status: "ready",
      },
      {
        id: "production_gate",
        command: "npm run verify:production",
        proves: "Fails the release if the CTA execution target count, groups, proof links, or external gates drift.",
        expectedSignal: "ctaExecutionTargets >= 28 && ctaExecutionScore >= 85",
        status: "ready",
      },
    ],
    assertions: [
      "Every Website Atlas CTA is converted into an executable browser action with proof links and a completion gate.",
      "Global header, docs subnav, footer resource links, builders@swiggy.in, Privacy Policy, and Terms are represented as click targets.",
      "External Google Forms, mail clients, enterprise approvals, and legal pages remain operator-gated instead of being auto-submitted by tests.",
      "The Deep Site Map and Builder Intake remain the source evidence for CTA intent, page coverage, and manual Swiggy gates.",
    ],
    externalGates: [
      "Official Swiggy Google Forms must be submitted by the operator in a browser after demo URL and contact fields are final.",
      "mailto:builders@swiggy.in opens a draft but must not be sent automatically during local tests.",
      "Privacy Policy, Terms, enterprise partnership, co-branding, and production access require human/legal review.",
    ],
  };
}
