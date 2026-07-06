import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  RuntimeTelemetryReport,
  SwiggyBuildersReviewDecisionCenter,
  SwiggyBuildersReviewDecisionGate,
  SwiggyBuildersReviewDecisionRecommendation,
  SwiggyBuildersReviewDecisionStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildBuilderPacketExport } from "./builderPacketExport.js";
import { buildLaunchBundle } from "./launchBundle.js";
import { buildReviewerArtifactVault } from "./reviewerArtifactVault.js";
import { buildSwiggyAccessDossier } from "./swiggyAccessDossier.js";
import { buildSwiggyAccessEvidenceMatrix } from "./accessEvidenceMatrix.js";
import { buildSwiggyBuildersJourneyGateCenter } from "./journeyGateCenter.js";
import { buildSwiggyBuildersLiveSourceResilienceCenter } from "./liveSourceResilienceCenter.js";
import { buildSwiggySubmissionTimelineCenter } from "./submissionTimelineCenter.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "mailto:builders@swiggy.in",
];

const statusWeight: Record<SwiggyBuildersReviewDecisionStatus, number> = {
  ready: 1,
  operator_input: 0.72,
  watch: 0.82,
  swiggy_gate: 0.5,
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function gate(input: SwiggyBuildersReviewDecisionGate): SwiggyBuildersReviewDecisionGate {
  return input;
}

function scoreFor(gates: SwiggyBuildersReviewDecisionGate[]) {
  return Math.round((gates.reduce((sum, item) => sum + statusWeight[item.status], 0) / gates.length) * 100);
}

function recommendationFor(gates: SwiggyBuildersReviewDecisionGate[]): SwiggyBuildersReviewDecisionRecommendation {
  const operatorInputs = gates.filter((item) => item.status === "operator_input").length;
  const sourceWatch = gates.some((item) => item.id === "source_review" && item.status === "watch");
  const credentialOnly =
    gates.filter((item) => item.status === "swiggy_gate").every((item) =>
      ["credential_redirect", "go_live_showcase"].includes(item.id),
    ) && operatorInputs === 0;

  if (sourceWatch) return "refresh_source_review";
  if (operatorInputs > 0) return "record_demo_and_submit";
  if (credentialOnly) return "await_swiggy_credentials";
  return "submit_access_packet";
}

function recommendationLabel(recommendation: SwiggyBuildersReviewDecisionRecommendation) {
  if (recommendation === "submit_access_packet") return "Submit the access packet";
  if (recommendation === "record_demo_and_submit") return "Record demo, complete operator fields, then submit";
  if (recommendation === "await_swiggy_credentials") return "Await Swiggy credentials";
  return "Refresh live source review before submission";
}

export async function buildSwiggyBuildersReviewDecisionCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
  handoffState?: AccessSubmissionHandoffState;
}): Promise<SwiggyBuildersReviewDecisionCenter> {
  const [liveSourceResilience] = await Promise.all([
    buildSwiggyBuildersLiveSourceResilienceCenter({
      config: options.config,
      profile: options.profile,
      latestPlan: options.latestPlan,
      plans: options.plans,
      telemetry: options.telemetry,
      handoffState: options.handoffState,
    }),
  ]);
  const accessStudio = buildAccessSubmissionStudio(options);
  const accessMatrix = buildSwiggyAccessEvidenceMatrix(options);
  const accessDossier = buildSwiggyAccessDossier(options.config);
  const journeyGates = buildSwiggyBuildersJourneyGateCenter(options);
  const launchBundle = buildLaunchBundle({ config: options.config, latestPlan: options.latestPlan });
  const reviewerVault = buildReviewerArtifactVault();
  const builderPacket = buildBuilderPacketExport(options);
  const submissionTimeline = buildSwiggySubmissionTimelineCenter(options);
  const handoff = accessStudio.handoffState;

  const coverageTotal = options.coverage.reduce((sum, server) => sum + server.totalTools, 0);
  const coverageReady = options.coverage.reduce((sum, server) => sum + server.demoReady + server.guarded, 0);
  const requiredFieldsReady = accessMatrix.totals.readyRequiredApplicationFields >= 6;
  const requiredAttachmentsReady = accessMatrix.totals.readyRequiredAttachments >= 7;
  const demoReady = Boolean(handoff.demoVideoUrl?.trim());
  const contactReady = Boolean(handoff.technicalContactEmail?.trim());
  const redirectReady = Boolean(handoff.productionRedirectUri?.trim().startsWith("https://"));
  const sourceReady =
    liveSourceResilience.currentFetch.homepageFetchOk &&
    liveSourceResilience.totals.watch <= 1 &&
    liveSourceResilience.totals.swiggyGates === 0;

  const gates = [
    gate({
      id: "builder_fit",
      sequence: 1,
      label: "Builder Fit",
      officialReviewSignal: "Swiggy reviews whether the product is a good fit for live commerce APIs.",
      mealPilotEvidence: `${accessDossier.reviewChecks.filter((item) => item.status === "ready").length}/${accessDossier.reviewChecks.length} access review checks are ready; ${journeyGates.totals.ready}/${journeyGates.totals.gates} journey gates are green.`,
      status: accessDossier.reviewChecks.some((item) => item.id === "use_case_fit" && item.status === "ready")
        ? "ready"
        : "watch",
      owner: "MealPilot",
      proofLinks: ["/api/swiggy-access-dossier", "/api/swiggy-builders-journey-gates", "/api/premium-use-case-studio"],
      reviewerQuestion: "Is this a real AI-commerce use case rather than a generic demo?",
      answer:
        "Yes. MealPilot composes Food, Instamart, and Dineout into planning, pantry, reservation, reminder, and support workflows with confirmation-safe commercial actions.",
      blocker: "None for local review; Swiggy still owns final fit approval.",
      nextAction: "Keep the use-case narrative aligned across the access form, launch bundle, and demo recording.",
    }),
    gate({
      id: "working_demo",
      sequence: 2,
      label: "Working Demo",
      officialReviewSignal: "Swiggy asks builders to show what they built and share a short working demo.",
      mealPilotEvidence: `${reviewerVault.readyArtifacts}/${reviewerVault.totalArtifacts} reviewer artifacts and ${builderPacket.totals.visualTargets} visual targets are packet-ready.`,
      status: demoReady && requiredAttachmentsReady ? "ready" : "operator_input",
      owner: demoReady && requiredAttachmentsReady ? "MealPilot" : "Operator",
      proofLinks: ["/api/demo-studio", "/api/swiggy-demo-evidence-director", "/api/reviewer-artifact-vault", "/api/builder-packet-export"],
      reviewerQuestion: "Can a reviewer see the product working end to end?",
      answer:
        "The local product, packet, screenshots, OpenAPI, and launch center are ready; the final Loom/Drive/YouTube demo URL remains operator-owned until recorded.",
      blocker: demoReady ? "None for demo URL." : "Demo video URL must be recorded and attached before the official access handoff.",
      nextAction: demoReady ? "Attach the recorded demo URL to the form and email." : "Record the 2-3 minute demo and save its HTTPS URL in Access Submission Studio.",
    }),
    gate({
      id: "security_privacy",
      sequence: 3,
      label: "Security And Privacy",
      officialReviewSignal: "Swiggy reviews security setup, data handling, privacy, support, and production posture.",
      mealPilotEvidence: `${accessMatrix.totals.readyRows}/${accessMatrix.totals.rows} evidence rows are ready with ${accessMatrix.totals.sections} sections mapped.`,
      status: requiredFieldsReady ? "ready" : "operator_input",
      owner: requiredFieldsReady ? "MealPilot" : "Operator",
      proofLinks: ["/api/swiggy-access-evidence-matrix", "/api/compliance-evidence", "/api/data-governance-center", "/api/audit-ledger"],
      reviewerQuestion: "Are tokens, PII, commercial actions, and support payloads controlled?",
      answer:
        "Yes. MealPilot keeps no-token logging, redacted telemetry, confirmation gates, consented profile storage, support-safe audit context, and DSR/export/delete evidence.",
      blocker: contactReady ? "None for security contact." : "Final technical/security contact email must be supplied before submission.",
      nextAction: contactReady ? "Keep verifier evidence current." : "Add final security contact in Access Submission Studio.",
    }),
    gate({
      id: "api_tool_coverage",
      sequence: 4,
      label: "API Tool Coverage",
      officialReviewSignal: "Swiggy expects builders to demonstrate useful usage across available MCP tools and server surfaces.",
      mealPilotEvidence: `${coverageReady}/${coverageTotal} Food, Instamart, and Dineout tools are demo-ready or guarded.`,
      status: coverageReady >= coverageTotal ? "ready" : "watch",
      owner: "MealPilot",
      proofLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/swiggy-tool-parity-auditor"],
      reviewerQuestion: "Does MealPilot cover the actual Swiggy MCP surface?",
      answer:
        "Yes. The tool lab, catalog, contract matrix, and parity auditor keep all Food, Instamart, and Dineout tools mapped with safety posture and evidence.",
      blocker: coverageReady >= coverageTotal ? "None." : "Refresh the tool parity auditor and catalogue coverage before final submission.",
      nextAction: "Run production verification and preserve 35/35 coverage in the builder packet.",
    }),
    gate({
      id: "source_review",
      sequence: 5,
      label: "Live Source Review",
      officialReviewSignal: "Swiggy Builders source, docs, access routes, and llms manifests must remain current before submission.",
      mealPilotEvidence: `${liveSourceResilience.score}/100 source resilience score in ${liveSourceResilience.currentFetch.homepageMode.replace("_", " ")} mode with ${liveSourceResilience.totals.verified} verified lanes.`,
      status: sourceReady ? "ready" : "watch",
      owner: sourceReady ? "MealPilot" : "Joint",
      proofLinks: ["/api/swiggy-builders-live-source-resilience", "/api/swiggy-builders-source-evolution", "/api/swiggy-docs-twin-explorer"],
      reviewerQuestion: "Is the packet built against current Swiggy Builders guidance?",
      answer:
        "The live source resilience center checks homepage fetch mode, public page mesh, header/footer/CTA parity, docs twins, and source-evolution re-browse gates.",
      blocker: sourceReady ? "None." : "Re-browse the live Builders site and disclose any Website Atlas fallback before official submission.",
      nextAction: sourceReady ? "Keep source checks in the regression loop." : "Refresh live source proof before recording or submitting.",
    }),
    gate({
      id: "credential_redirect",
      sequence: 6,
      label: "Credential And Redirect Readiness",
      officialReviewSignal: "Swiggy issues credentials after review, with exact redirect URI and client registration controls.",
      mealPilotEvidence: `${accessStudio.totals.readyCopyBlocks}/${accessStudio.totals.totalCopyBlocks} copy blocks are ready; redirect URI is ${redirectReady ? "HTTPS-ready" : "operator-owned"}.`,
      status: redirectReady && options.config.swiggyClientId !== "replace_after_builder_access" ? "ready" : "swiggy_gate",
      owner: "Swiggy",
      proofLinks: ["/api/credential-onboarding", "/api/sandbox-credential-workbench", "/api/swiggy-credential-handoff-center"],
      reviewerQuestion: "Can production OAuth be enabled safely after approval?",
      answer:
        "MealPilot has PKCE, redirect audit, credential handoff, sandbox workbench, fail-closed routing, and no-secret artifact boundaries prepared.",
      blocker: "Swiggy must approve Builder Access and issue client credentials; operator must provide final HTTPS redirect if it changes.",
      nextAction: "Submit redirect and credential details in the official form, then wait for Swiggy approval.",
    }),
    gate({
      id: "ops_support",
      sequence: 7,
      label: "Ops And Support",
      officialReviewSignal: "Swiggy review includes support readiness, rate limits, reliability, traffic plans, and escalation behavior.",
      mealPilotEvidence: `${launchBundle.commands.length} launch commands and ${submissionTimeline.totals.proofLinks} timeline proof links are ready for review.`,
      status: "ready",
      owner: "MealPilot",
      proofLinks: ["/api/support/bridge", "/api/slo-incident-command", "/api/traffic-readiness-plan", "/api/swiggy-operating-contract-center"],
      reviewerQuestion: "Will the integration behave responsibly under review, pilot traffic, and incidents?",
      answer:
        "Yes. Rate-limit budgets, support bridge payloads, SLO command, traffic readiness, backpressure controls, and incident runbooks are already packeted.",
      blocker: "None for local proof; Swiggy-owned support channels and quota approvals remain external.",
      nextAction: "Keep production smoke and support evidence attached to every handoff.",
    }),
    gate({
      id: "go_live_showcase",
      sequence: 8,
      label: "Go Live And Showcase",
      officialReviewSignal: "Swiggy owns production go-live approval, showcase placement, co-branding, and growth partnership unlocks.",
      mealPilotEvidence: `${launchBundle.artifacts.length} launch artifacts and ${launchBundle.goLiveGates.length} go-live gates are consolidated.`,
      status: "swiggy_gate",
      owner: "Swiggy",
      proofLinks: ["/api/production-launch-bundle", "/api/swiggy-showcase-submission-center", "/api/swiggy-growth-partnership"],
      reviewerQuestion: "What remains after the access packet is accepted?",
      answer:
        "Swiggy approval unlocks staging credentials, soak evidence, production credentials, co-branding, showcase submission, and growth partnership motions.",
      blocker: "Production access, public Swiggy claims, and showcase visibility require Swiggy approval.",
      nextAction: "After credentials arrive, run staging certification and attach the launch bundle for production promotion.",
    }),
  ];

  const ready = gates.filter((item) => item.status === "ready").length;
  const operatorInputs = gates.filter((item) => item.status === "operator_input").length;
  const swiggyGates = gates.filter((item) => item.status === "swiggy_gate").length;
  const watch = gates.filter((item) => item.status === "watch").length;
  const proofLinks = unique(gates.flatMap((item) => item.proofLinks));
  const recommendation = recommendationFor(gates);

  return {
    generatedAt: new Date().toISOString(),
    score: scoreFor(gates),
    recommendation,
    recommendationLabel: recommendationLabel(recommendation),
    officialSources,
    totals: {
      gates: gates.length,
      ready,
      operatorInputs,
      swiggyGates,
      watch,
      proofLinks: proofLinks.length,
      reviewerQuestions: gates.length,
    },
    gates,
    decisionRunbook: [
      {
        sequence: 1,
        label: "Freeze local proof",
        owner: "MealPilot",
        action: "Run build, lint, tests, production smoke, visual QA, and builder packet export.",
        proofLinks: ["/api/builder-packet-export", "/api/visual-qa-center", "/api/reviewer-artifact-vault"],
      },
      {
        sequence: 2,
        label: "Complete operator-owned fields",
        owner: "Operator",
        action: "Record the demo URL, add the security contact, confirm redirect/egress values, acknowledge terms, then submit the access form.",
        proofLinks: ["/api/access-submission-studio", "https://mcp.swiggy.com/builders/access/"],
      },
      {
        sequence: 3,
        label: "Send reviewer handoff",
        owner: "Operator",
        action: "Send the generated handoff email to builders@swiggy.in with the demo, packet, OpenAPI, visual report, and review decision center links.",
        proofLinks: ["/api/production-launch-bundle", "/api/swiggy-builders-review-decision"],
      },
      {
        sequence: 4,
        label: "Wait for Swiggy review",
        owner: "Swiggy",
        action: "Swiggy reviews fit, security setup, demo, access form, and credential readiness before staging access.",
        proofLinks: ["/api/swiggy-submission-timeline", "/api/sandbox-credential-workbench"],
      },
    ],
    reviewerQuestions: gates.map((item) => ({
      id: item.id,
      question: item.reviewerQuestion,
      answer: item.answer,
      proofLinks: item.proofLinks,
    })),
    assertions: [
      "Review Decision Center is a local reviewer-readiness decision board; it does not submit forms, send email, approve credentials, or claim Swiggy endorsement.",
      "Every decision gate traces to an official Swiggy Builders signal and at least one MealPilot proof route.",
      "Operator-owned fields and Swiggy-owned approvals remain explicit blockers instead of being fabricated.",
      "The recommendation is recomputed from access evidence, reviewer artifacts, source resilience, launch bundle, and handoff state.",
    ],
    externalGates: [
      "Operator must record and attach the demo URL unless already saved in Access Submission Studio.",
      "Operator must submit the official Swiggy access form and send any final email handoff.",
      "Swiggy owns Builder Access approval, staging credentials, production credentials, quota changes, co-branding, showcase placement, and growth partnership approval.",
    ],
  };
}
