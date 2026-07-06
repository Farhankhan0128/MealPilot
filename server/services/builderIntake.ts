import type { ServerConfig } from "../config.js";
import type {
  AccessDossierStatus,
  MealPlan,
  SwiggyBuilderCtaAction,
  SwiggyBuilderDemoStoryboardStep,
  SwiggyBuilderIntakeCommandCenter,
  SwiggyBuilderIntakeStatus,
  SwiggyBuilderOutboundDraft,
  SwiggyBuilderSubmissionChecklistItem,
  SwiggyBuilderSubmissionField,
  SwiggyWebsiteCta,
} from "../../src/domain/types.js";
import { buildCredentialOnboardingReport, buildRedirectUriAudit } from "./credentialOnboarding.js";
import { buildLaunchBundle } from "./launchBundle.js";
import { buildSwiggyAccessDossier } from "./swiggyAccessDossier.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/llms.txt",
];

function statusScore(status: SwiggyBuilderIntakeStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.65;
  return 0.35;
}

function ctaStatus(status: SwiggyWebsiteCta["status"]): SwiggyBuilderIntakeStatus {
  if (status === "implemented" || status === "documented") return "ready";
  return "external_gate";
}

function fieldStatus(status: AccessDossierStatus): SwiggyBuilderIntakeStatus {
  if (status === "ready") return "ready";
  if (status === "manual_input") return "operator_input";
  return "external_gate";
}

function actionType(cta: SwiggyWebsiteCta): SwiggyBuilderCtaAction["actionType"] {
  if (cta.id === "send_demo") return "demo";
  if (cta.url.startsWith("mailto:")) return "email";
  if (cta.url.includes("forms.gle") || cta.id.includes("apply")) return "form";
  if (cta.url.includes("/docs") || cta.url.includes("llms")) return "docs";
  return "navigate";
}

function actionLocation(cta: SwiggyWebsiteCta): SwiggyBuilderCtaAction["location"] {
  if (cta.appearsOn.some((page) => page.toLowerCase().includes("footer"))) return "footer";
  if (cta.appearsOn.some((page) => page.toLowerCase().includes("docs"))) return "docs_subnav";
  if (cta.url.startsWith("mailto:") || cta.url.includes("forms.gle")) return "external";
  return "page_body";
}

function actionTrack(cta: SwiggyWebsiteCta): SwiggyBuilderCtaAction["track"] {
  if (cta.id.includes("enterprise")) return "enterprise";
  if (cta.id.includes("developer") || cta.id.includes("prod_access") || cta.id === "apply_now") return "developer";
  if (cta.id === "send_demo") return "demo";
  if (cta.id === "contact_us") return "support";
  if (cta.url.includes("/docs") || cta.url.includes("llms")) return "docs";
  return "product";
}

function completionGate(cta: SwiggyWebsiteCta): SwiggyBuilderCtaAction["completionGate"] {
  const type = actionType(cta);
  if (cta.id.includes("enterprise")) return "swiggy_approval";
  if (type === "form" || type === "demo" || type === "email") return "operator_submit";
  if (cta.url.startsWith("http") && !cta.url.startsWith("https://mcp.swiggy.com/builders/")) return "external_site";
  return "none";
}

function evidenceForCta(cta: SwiggyWebsiteCta): string[] {
  const links = ["/api/swiggy-website-atlas"];
  if (cta.id.includes("apply") || cta.url.includes("forms.gle")) {
    links.push("/api/swiggy-access-dossier", "/api/production-launch-bundle");
  }
  if (cta.id === "start_building" || cta.url.includes("/docs/start")) {
    links.push("/api/mcp/catalog", "/api/mcp/tool-lab", "/api/mcp/scenario-runner");
  }
  if (cta.id === "send_demo") {
    links.push("/api/demo-studio", "/api/reviewer-proof", "/api/production-launch-bundle");
  }
  if (cta.url.startsWith("mailto:")) links.push("/api/support/bridge");
  if (cta.url.includes("llms")) links.push("/api/swiggy-docs-coverage", "/api/swiggy-upstream-watch");
  return [...new Set(links)];
}

function proofBundleForCta(cta: SwiggyWebsiteCta) {
  if (cta.id === "start_building") return "Local dev, MCP Tool Lab, Scenario Runner, and smoke verifier are ready.";
  if (cta.id === "see_whats_possible") return "Premium use cases, channel lanes, and all-server route plans are mapped.";
  if (cta.id === "send_demo") return "Demo Studio, storyboard, reviewer proof, and handoff email are ready for a video URL.";
  if (cta.id === "contact_us") return "Support Bridge, report_error payloads, and redacted escalation copy are ready.";
  if (cta.id === "llms") return "Docs Coverage and Upstream Watch preserve llms.txt and llms-full.txt coverage.";
  if (cta.id === "read_docs") return "Docs Coverage, Tool Lab, and Journey Compiler map docs into executable evidence.";
  if (cta.id.includes("enterprise")) return "Enterprise delegated auth, governance, SLO, co-branding, and support artifacts are staged.";
  if (cta.id.includes("apply")) return "Access Dossier, Submission Console, Production Launch Bundle, and form fields are prepared.";
  return "Website Atlas maps the CTA to a MealPilot proof surface.";
}

function nextActionForCta(cta: SwiggyWebsiteCta, status: SwiggyBuilderIntakeStatus) {
  if (cta.id === "send_demo") return "Record the 2-3 minute MealPilot walkthrough, attach the URL, and send the generated demo email.";
  if (cta.id === "apply_developer") return "Paste the developer-track field values into the official Google Form after final contact and demo URL are ready.";
  if (cta.id === "apply_enterprise" || cta.id === "enterprise_apply") {
    return "Use this only if MealPilot moves into a platform/operator partnership with Swiggy-approved enterprise terms.";
  }
  if (cta.id === "apply_prod_access" || cta.id === "apply_now") {
    return "Open the Access Dossier and resolve manual inputs before submitting for production review.";
  }
  if (status === "external_gate") return "Wait for Swiggy approval or credentials before marking this action complete.";
  return "Keep this path in the demo script and production handoff.";
}

function buildCtaActions(ctas: SwiggyWebsiteCta[]): SwiggyBuilderCtaAction[] {
  return ctas.map((cta) => {
    const status = ctaStatus(cta.status);
    const preparedLocally = status !== "external_gate";
    return {
      id: cta.id,
      label: cta.label,
      sourcePages: cta.appearsOn,
      location: actionLocation(cta),
      officialUrl: cta.url,
      officialIntent: cta.intent,
      actionType: actionType(cta),
      track: actionTrack(cta),
      status,
      preparedLocally,
      completionGate: completionGate(cta),
      mealPilotAction: cta.mealPilotResponse,
      proofBundle: proofBundleForCta(cta),
      evidenceLinks: evidenceForCta(cta),
      nextAction: nextActionForCta(cta, status),
    };
  });
}

function buildSubmissionFields(config: ServerConfig): SwiggyBuilderSubmissionField[] {
  const dossier = buildSwiggyAccessDossier(config);
  return dossier.applicationFields.map((field) => {
    const status = fieldStatus(field.status);
    return {
      id: field.id,
      label: field.label,
      required: field.required,
      status,
      officialSource: field.source,
      suggestedValue: field.value,
      evidenceLinks: field.proofLinks,
      blockingReason: status === "ready" ? null : field.evidence,
    };
  });
}

function buildDemoStoryboard(latestPlan?: MealPlan): SwiggyBuilderDemoStoryboardStep[] {
  const sessionPath = latestPlan ? `/api/sessions/${latestPlan.id}/staging-transcript` : "/api/sessions/:sessionId/staging-transcript";
  return [
    {
      sequence: 1,
      title: "Open with real product scope",
      officialSignal: "Builders homepage asks for real products using Food, Instamart, and Dineout.",
      mealPilotAction: "Show the planner generating Food, Instamart, and Dineout recommendations from one user request.",
      proofLink: "/api/mcp/catalog",
      durationSeconds: 20,
    },
    {
      sequence: 2,
      title: "Show local build without credentials",
      officialSignal: "Access docs say builders should wire the product locally before applying.",
      mealPilotAction: "Open Tool Lab, Scenario Runner, and MCP replay to prove local JSON-RPC calls before Swiggy credentials.",
      proofLink: "/api/mcp/scenario-runner",
      durationSeconds: 35,
    },
    {
      sequence: 3,
      title: "Prove safe commerce",
      officialSignal: "Swiggy looks for confirmation-safe agents that respect the user and retry safely.",
      mealPilotAction: "Confirm one prepared action, show preflight, non-blind retry evidence, and redacted runtime telemetry.",
      proofLink: latestPlan ? `/api/sessions/${latestPlan.id}/preflight` : "/api/sessions/:sessionId/preflight",
      durationSeconds: 35,
    },
    {
      sequence: 4,
      title: "Show signup readiness",
      officialSignal: "Access page asks for redirect URIs, IPs, contact, privacy, infra, terms, and expected volume.",
      mealPilotAction: "Open Access Dossier, Credential Cockpit, Traffic Readiness, and this Intake Command Center.",
      proofLink: "/api/swiggy-builder-intake",
      durationSeconds: 35,
    },
    {
      sequence: 5,
      title: "Close with reviewer handoff",
      officialSignal: "Access docs recommend sending a video, GitHub link, and proof package.",
      mealPilotAction: "Show Production Launch Bundle, reviewer proof, and the generated handoff email.",
      proofLink: sessionPath,
      durationSeconds: 25,
    },
  ];
}

function buildOutboundDrafts(config: ServerConfig, latestPlan?: MealPlan): SwiggyBuilderOutboundDraft[] {
  const launchBundle = buildLaunchBundle({ config, latestPlan });
  const sessionLine = latestPlan
    ? `Session transcript: /api/sessions/${latestPlan.id}/staging-transcript`
    : "Session transcript: run one plan to generate /api/sessions/:sessionId/staging-transcript";

  return [
    {
      id: "send_demo_email",
      triggerCta: "send_demo",
      to: "builders@swiggy.in",
      subject: launchBundle.handoffEmail.subject,
      body: [
        "Hi Swiggy Builders team,",
        "",
        "Sharing MealPilot India for review. It is a premium AI meal operating system using Food, Instamart, and Dineout with explicit confirmations, local JSON-RPC proof, and staging-ready OAuth posture.",
        "",
        "Demo video: add final Loom/Drive/YouTube link",
        "GitHub: https://github.com/Farhankhan0128/MealPilot",
        "Production Launch Bundle: /api/production-launch-bundle",
        "Builder Intake Command Center: /api/swiggy-builder-intake",
        "Scenario Runner: /api/mcp/scenario-runner",
        sessionLine,
        "",
        "Manual fields still to fill: final security contact, final HTTPS redirect URI, static IP/egress, and official form terms acknowledgement.",
        "",
        "Thanks,",
        "MealPilot India",
      ].join("\n"),
      evidenceLinks: ["/api/production-launch-bundle", "/api/swiggy-builder-intake", "/api/reviewer-proof"],
    },
    {
      id: "enterprise_interest_email",
      triggerCta: "enterprise_apply",
      to: "builders@swiggy.in",
      subject: "MealPilot India - enterprise delegated-auth discussion",
      body: [
        "Hi Swiggy Builders team,",
        "",
        "MealPilot has a developer-track product ready locally and an enterprise-track design for platform on-behalf-of OAuth, per-user token lifecycle, delegated auth, support escalation, and co-branding review.",
        "",
        "Enterprise Delegated Auth Center: /api/enterprise-delegated-auth",
        "Data Governance Center: /api/data-governance-center",
        "SLO Incident Command Center: /api/slo-incident-command",
        "",
        "Please share the partner review path if this should move from developer access into enterprise onboarding.",
      ].join("\n"),
      evidenceLinks: ["/api/enterprise-delegated-auth", "/api/data-governance-center", "/api/slo-incident-command"],
    },
  ];
}

function buildChecklist(config: ServerConfig, latestPlan?: MealPlan): SwiggyBuilderSubmissionChecklistItem[] {
  const redirectAudit = buildRedirectUriAudit(config);
  const onboarding = buildCredentialOnboardingReport(config);
  const hasClientId = config.swiggyClientId !== "replace_after_builder_access";
  const hasToken = Boolean(config.swiggyAccessToken);

  return [
    {
      id: "local_product",
      label: "Runnable local product",
      owner: "MealPilot",
      status: "ready",
      nextAction: "Keep npm test, lint, build, and production smoke green before every submission update.",
      evidenceLinks: ["/api/ready", "/api/openapi.json", "/api/production-launch-bundle"],
    },
    {
      id: "demo_video",
      label: "2-3 minute walkthrough video",
      owner: "Operator",
      status: latestPlan ? "operator_input" : "operator_input",
      nextAction: latestPlan
        ? "Record the storyboard and paste the video URL into the official access form."
        : "Run one plan, confirm one safe action, then record the storyboard.",
      evidenceLinks: ["/api/demo-studio", "/api/swiggy-builder-intake"],
    },
    {
      id: "final_contact",
      label: "Primary technical and security contact",
      owner: "Operator",
      status: "operator_input",
      nextAction: "Add the final reachable engineering/security email to the form and handoff email.",
      evidenceLinks: ["/api/swiggy-access-dossier", "/api/support/bridge"],
    },
    {
      id: "https_redirect",
      label: "Production HTTPS redirect URI",
      owner: "Operator",
      status: redirectAudit.productionSafe ? "ready" : "operator_input",
      nextAction: redirectAudit.productionSafe
        ? "Submit this exact redirect URI in the access form."
        : "Deploy the app behind HTTPS and replace the localhost callback before production review.",
      evidenceLinks: ["/api/credential-onboarding", "/api/auth/swiggy/status"],
    },
    {
      id: "static_ip",
      label: "Static IP or gateway egress",
      owner: "Operator",
      status: "operator_input",
      nextAction: "Fill the static egress or deployment gateway IP once final hosting is selected.",
      evidenceLinks: ["/api/production-launch-bundle", "/api/traffic-readiness-plan"],
    },
    {
      id: "live_credentials",
      label: "Staging and production credentials",
      owner: "Swiggy",
      status: hasClientId && hasToken ? "ready" : "external_gate",
      nextAction: hasClientId && hasToken
        ? "Run the staging certification waves and preserve the transcript evidence."
        : "Submit the application and wait for Swiggy-issued staging credentials or live DCR approval.",
      evidenceLinks: ["/api/mcp-gateway", "/api/staging-certification-matrix"],
    },
    {
      id: "dcr_scope",
      label: "OAuth DCR and MCP scopes",
      owner: "MealPilot",
      status: onboarding.checks.every((check) => check.status !== "blocked") ? "ready" : "operator_input",
      nextAction: "Keep mcp:tools, mcp:resources, and mcp:prompts in the access request.",
      evidenceLinks: ["/api/credential-onboarding", "/api/mcp/capability-registry"],
    },
  ];
}

export function buildSwiggyBuilderIntakeCommandCenter(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
}): SwiggyBuilderIntakeCommandCenter {
  const website = buildSwiggyWebsiteAtlas();
  const actions = buildCtaActions(website.ctas);
  const submissionFields = buildSubmissionFields(options.config);
  const demoStoryboard = buildDemoStoryboard(options.latestPlan);
  const outboundDrafts = buildOutboundDrafts(options.config, options.latestPlan);
  const checklist = buildChecklist(options.config, options.latestPlan);
  const statuses = [...actions.map((item) => item.status), ...submissionFields.map((item) => item.status), ...checklist.map((item) => item.status)];
  const score = Math.round((statuses.reduce((sum, status) => sum + statusScore(status), 0) / statuses.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    recommendedTrack: "developer",
    totalCtas: actions.length,
    readyCtas: actions.filter((item) => item.status === "ready").length,
    preparedCtas: actions.filter((item) => item.preparedLocally).length,
    operatorCtaGates: actions.filter((item) => item.completionGate === "operator_submit").length,
    swiggyCtaGates: actions.filter((item) => item.completionGate === "swiggy_approval").length,
    totalFields: submissionFields.length,
    readyFields: submissionFields.filter((item) => item.status === "ready").length,
    actions,
    submissionFields,
    demoStoryboard,
    outboundDrafts,
    checklist,
    assertions: [
      "Every Website Atlas CTA is converted into a concrete MealPilot action, evidence path, owner, and next step.",
      "Every current Swiggy CTA path is locally prepared; final form submission, email send, enterprise approval, and live credentials remain explicit gates.",
      "The developer access path is preferred until enterprise delegated-auth, custom contracts, and co-branding rights are approved.",
      "MealPilot does not submit Google Forms or email externally during local tests; it produces copy-ready payloads and preserves manual gates.",
      "The demo storyboard follows Swiggy's access guidance: build locally, show a real flow, prove safe retries, then request production access.",
    ],
    externalGates: [
      "Official Google Form submission, final terms acknowledgement, final contact email, and demo video URL require operator input.",
      "Staging credentials, production credentials, seeded data, static IP allowlisting, and final HTTPS redirect approval require Swiggy or hosting-provider action.",
      "Enterprise partnership, Slack channel, per-partner dashboards, and co-branding asset approvals are not available until Swiggy approves the enterprise track.",
    ],
  };
}
