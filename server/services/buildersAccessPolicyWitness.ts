import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  RuntimeTelemetryReport,
  SwiggyBuildersAccessPolicyWitness,
  SwiggyBuildersAccessPolicyWitnessGroup,
  SwiggyBuildersAccessPolicyWitnessRow,
  SwiggyBuildersAccessPolicyWitnessStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildBrandComplianceKit } from "./brandCompliance.js";
import { buildDataGovernanceCenter } from "./dataGovernance.js";
import { buildSwiggyAccessDossier } from "./swiggyAccessDossier.js";
import { buildSwiggyAccessEvidenceMatrix } from "./accessEvidenceMatrix.js";
import { buildSwiggyBuildersReviewDecisionCenter } from "./reviewDecisionCenter.js";
import { buildSwiggyFaqPolicyCenter } from "./faqPolicyCenter.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function weightFor(status: SwiggyBuildersAccessPolicyWitnessStatus) {
  if (status === "proven") return 1;
  if (status === "ready") return 0.94;
  if (status === "watch") return 0.82;
  if (status === "operator_gate") return 0.76;
  return 0.68;
}

function groupFor(row: SwiggyBuildersAccessPolicyWitnessRow) {
  if (row.kind === "application_fields" || row.kind === "track_ctas") return "application_submission";
  if (row.kind === "review_checks" || row.kind === "approval_decision") return "review_approval";
  if (row.kind === "ground_rules" || row.kind === "brand_data_governance") return "policy_safety";
  return "legal_artifacts";
}

function row(input: SwiggyBuildersAccessPolicyWitnessRow): SwiggyBuildersAccessPolicyWitnessRow {
  return input;
}

export async function buildSwiggyBuildersAccessPolicyWitness(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  plans: MealPlan[];
  telemetry: RuntimeTelemetryReport;
  handoffState?: AccessSubmissionHandoffState;
}): Promise<SwiggyBuildersAccessPolicyWitness> {
  const dossier = buildSwiggyAccessDossier(options.config);
  const accessMatrix = buildSwiggyAccessEvidenceMatrix(options);
  const accessStudio = buildAccessSubmissionStudio(options);
  const faqPolicy = buildSwiggyFaqPolicyCenter();
  const brand = buildBrandComplianceKit();
  const dataGovernance = buildDataGovernanceCenter({ config: options.config, profile: options.profile });
  const reviewDecision = await buildSwiggyBuildersReviewDecisionCenter(options);
  const requiredFields = dossier.applicationFields.filter((field) => field.required);
  const readyRequiredFields = requiredFields.filter((field) => field.status === "ready");
  const readyReviewChecks = dossier.reviewChecks.filter((check) => check.status === "ready");
  const readyGroundRules = dossier.groundRules.filter((rule) => rule.status === "ready");
  const legalManualOrExternal = dossier.legalReadiness.filter((item) => item.status !== "ready");
  const requiredAttachments = accessStudio.attachmentChecklist.filter((attachment) => attachment.required);
  const readyRequiredAttachments = requiredAttachments.filter((attachment) => attachment.status === "ready");
  const readyBrandRules = brand.rules.filter((ruleItem) => ruleItem.status === "ready");
  const readyDataControls = dataGovernance.controls.filter((control) => control.status === "ready");

  const rows = [
    row({
      id: "access_application_fields",
      label: "Access application fields",
      kind: "application_fields",
      officialSignal: "Swiggy production access requires builder identity, use case, URLs, security contact, redirect URI, environment, and terms fields.",
      sourceUrl: "https://mcp.swiggy.com/builders/access/",
      owner: readyRequiredFields.length === requiredFields.length ? "MealPilot" : "Operator",
      status: readyRequiredFields.length === requiredFields.length ? "ready" : "operator_gate",
      mealPilotSurface: "Swiggy Access Dossier and Access Evidence Matrix",
      evidence: `${readyRequiredFields.length}/${requiredFields.length} required fields are ready across ${dossier.applicationFields.length} application fields.`,
      routeOptimization:
        "Keep access-form values generated from the same packet, redirect URI, proof routes, and security contacts used by the demo.",
      riskBoundary:
        "MealPilot prepares copy and proof only; the operator must paste values into Swiggy's official form and accept terms manually.",
      nextAction:
        readyRequiredFields.length === requiredFields.length
          ? "Copy prepared values into the official Swiggy form during submission."
          : "Fill demo URL, final HTTPS redirect, static egress/IP, and contact fields before submission.",
      proofLinks: ["/api/swiggy-access-dossier", "/api/swiggy-access-evidence-matrix", "/api/access-submission-studio"],
      relatedApis: ["/api/submission-console", "/api/builder-packet-export"],
    }),
    row({
      id: "access_review_checks",
      label: "Access review checks",
      kind: "review_checks",
      officialSignal: "Swiggy reviews fit, safety, privacy, operational readiness, support posture, scale, and demo proof before production access.",
      sourceUrl: "https://mcp.swiggy.com/builders/access/",
      owner: "Joint",
      status: readyReviewChecks.length === dossier.reviewChecks.length ? "ready" : "watch",
      mealPilotSurface: "Access Dossier, Review Decision Center, and Launch Bundle",
      evidence: `${readyReviewChecks.length}/${dossier.reviewChecks.length} review checks are ready; review recommendation is ${reviewDecision.recommendation}.`,
      routeOptimization:
        "Route reviewers from one decision board into proof APIs for demo, tool coverage, safety, traffic, support, and source freshness.",
      riskBoundary:
        "Review readiness is decision support only; Swiggy owns access approval, production credentials, showcase placement, and go-live acceptance.",
      nextAction: "Use the Review Decision Center before every production-access submission or credential follow-up.",
      proofLinks: ["/api/swiggy-builders-review-decision", "/api/production-launch-bundle", "/api/reviewer-artifact-vault"],
      relatedApis: ["/api/swiggy-builders-journey-gates", "/api/swiggy-builders-completion-ledger"],
    }),
    row({
      id: "access_ground_rules",
      label: "Allowed, restricted, and prohibited rules",
      kind: "ground_rules",
      officialSignal: "The Access page and FAQ define allowed builder use, restricted misuse, prohibited manipulation, user-data obligations, and scope discipline.",
      sourceUrl: "https://mcp.swiggy.com/builders/access/",
      owner: "MealPilot",
      status: readyGroundRules.length === dossier.groundRules.length && faqPolicy.readyRules >= faqPolicy.totalRules - 1 ? "ready" : "watch",
      mealPilotSurface: "FAQ & Policy Center and Safety Controls",
      evidence: `${readyGroundRules.length}/${dossier.groundRules.length} dossier ground-rule groups and ${faqPolicy.readyRules}/${faqPolicy.totalRules} policy rules are ready.`,
      routeOptimization:
        "Bind every commercial or mutating route to confirmation, rate-limit, support, telemetry, and redaction controls before it enters the planner.",
      riskBoundary:
        "MealPilot does not bypass access controls, scrape data, fake traffic, manipulate incentives, hide Swiggy attribution, or blind-retry commercial actions.",
      nextAction: "Keep FAQ and policy rows attached to the access packet and demo voiceover.",
      proofLinks: ["/api/swiggy-faq-policy", "/api/safety-and-compliance", "/api/mcp/commercial-action-guard"],
      relatedApis: ["/api/error-intelligence", "/api/swiggy-confirmation-command-center"],
    }),
    row({
      id: "legal_terms_readiness",
      label: "Legal and terms readiness",
      kind: "legal_terms",
      officialSignal: "Production access can require terms acceptance, DPDP/privacy posture, partner agreement, liability, revocation, and enterprise legal review.",
      sourceUrl: "https://mcp.swiggy.com/builders/access/",
      owner: legalManualOrExternal.length > 0 ? "Operator" : "MealPilot",
      status: legalManualOrExternal.length > 0 ? "operator_gate" : "ready",
      mealPilotSurface: "Access Dossier, Data Governance, and Access Submission Studio",
      evidence: `${dossier.legalReadiness.length - legalManualOrExternal.length}/${dossier.legalReadiness.length} legal readiness items are ready; ${accessStudio.handoffState.termsAcknowledged ? "terms acknowledged locally" : "terms acknowledgement pending"}.`,
      routeOptimization:
        "Separate legal acceptance, partner agreement, DPA, and production approval from technical proof so reviewers see exact ownership.",
      riskBoundary:
        "MealPilot never auto-accepts terms, sends legal commitments, signs DPAs, or claims Swiggy partnership without written approval.",
      nextAction: "Have the operator review Swiggy terms and save acknowledgement only after reading the official page.",
      proofLinks: ["/api/swiggy-access-dossier", "/api/data-governance-center", "/api/access-submission-studio"],
      relatedApis: ["/api/enterprise-delegated-auth", "/api/audit-ledger"],
    }),
    row({
      id: "track_cta_targets",
      label: "Developer, enterprise, docs, and demo CTAs",
      kind: "track_ctas",
      officialSignal: "Start Building, Request Access, Send Demo, Developer, Enterprise, Docs, FAQ, Blog, llms, and legal links remain official operator-facing CTAs.",
      sourceUrl: "https://mcp.swiggy.com/builders/",
      owner: "Operator",
      status: accessStudio.officialTargets.length >= 3 ? "ready" : "watch",
      mealPilotSurface: "Access Submission Studio, CTA Execution, and Navigation Witness",
      evidence: `${accessStudio.officialTargets.length} official submission targets are mapped with browser-runbook steps and copy blocks.`,
      routeOptimization:
        "Expose official CTAs as links and proof routes instead of hiding them behind automation, preserving Swiggy's review path.",
      riskBoundary:
        "External browser navigation, form submission, email send, and legal clickthrough stay manual and auditable.",
      nextAction: "Use the browser runbook to open official CTAs during the final reviewer recording.",
      proofLinks: ["/api/access-submission-studio", "/api/swiggy-cta-execution-center", "/api/swiggy-builders-navigation-witness"],
      relatedApis: ["/api/swiggy-conversion-center", "/api/swiggy-builders-homepage-experience"],
    }),
    row({
      id: "attachments_and_runbook",
      label: "Attachments and browser runbook",
      kind: "attachments_runbook",
      officialSignal: "Swiggy access review expects demo, GitHub/repository proof, product summary, security posture, visual evidence, and follow-up packet artifacts.",
      sourceUrl: "https://mcp.swiggy.com/builders/access/",
      owner: readyRequiredAttachments.length === requiredAttachments.length ? "MealPilot" : "Operator",
      status: readyRequiredAttachments.length === requiredAttachments.length ? "ready" : "operator_gate",
      mealPilotSurface: "Access Submission Studio and Reviewer Artifact Vault",
      evidence: `${readyRequiredAttachments.length}/${requiredAttachments.length} required attachments are ready, with ${accessStudio.browserRunbook.length} browser runbook steps and ${accessStudio.totals.totalCopyBlocks} copy blocks.`,
      routeOptimization:
        "Keep screenshots, production smoke, visual QA, packet export, demo URL, and mailto copy in one repeatable runbook.",
      riskBoundary:
        "The app can prepare artifacts and mailto drafts, but it does not upload files, submit forms, or send email without the operator.",
      nextAction: "Record the demo URL and rerun the packet export before manual submission.",
      proofLinks: ["/api/reviewer-artifact-vault", "/api/access-submission-studio", "/api/builder-packet-export"],
      relatedApis: ["/api/demo-studio", "/api/visual-qa-center"],
    }),
    row({
      id: "brand_data_governance",
      label: "Brand, data, and compliance controls",
      kind: "brand_data_governance",
      officialSignal: "Swiggy expects clear attribution, no false endorsement, responsible data handling, support-safe telemetry, and privacy/legal compliance.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
      owner: "Joint",
      status: readyBrandRules.length >= 6 && readyDataControls.length >= 6 ? "ready" : "watch",
      mealPilotSurface: "Brand Compliance Kit and Data Governance Center",
      evidence: `${readyBrandRules.length}/${brand.rules.length} brand rules and ${readyDataControls.length}/${dataGovernance.controls.length} data controls are ready.`,
      routeOptimization:
        "Use one attribution, redaction, DSR, retention, support, and audit policy across web UI, widgets, voice, transcripts, and packets.",
      riskBoundary:
        "Swiggy-originated data stays scoped to user tasks; raw tokens, payment details, full addresses, and support payload PII are not exposed.",
      nextAction: "Attach Brand Compliance and Data Governance receipts to any enterprise or co-branding review.",
      proofLinks: ["/api/brand-compliance-kit", "/api/data-governance-center", "/api/safety-and-compliance", "/api/compliance-evidence"],
      relatedApis: ["/api/support/bridge", "/api/telemetry/runtime"],
    }),
    row({
      id: "approval_decision_gate",
      label: "Approval decision gate",
      kind: "approval_decision",
      officialSignal: "Swiggy owns production access, credentials, review approval, co-branding, showcase placement, and any public claims.",
      sourceUrl: "https://mcp.swiggy.com/builders/access/",
      owner: "Swiggy",
      status: reviewDecision.recommendation === "submit_access_packet" ? "operator_gate" : "swiggy_gate",
      mealPilotSurface: "Review Decision Center",
      evidence: `${reviewDecision.score}/100 review decision score with ${reviewDecision.totals.ready}/${reviewDecision.totals.gates} gates ready and ${reviewDecision.totals.swiggyGates} Swiggy gates.`,
      routeOptimization:
        "Keep final submit/credential/go-live decisions separated from technical route optimization and demo readiness.",
      riskBoundary:
        "No local endpoint can claim production approval, live credentials, legal acceptance, Swiggy endorsement, or go-live rights.",
      nextAction: reviewDecision.recommendationLabel,
      proofLinks: ["/api/swiggy-builders-review-decision", "/api/swiggy-submission-timeline-center", "/api/production-launch-bundle"],
      relatedApis: ["/api/swiggy-builders-credential-sandbox-witness", "/api/swiggy-partner-success-desk"],
    }),
  ];

  const proofLinks = unique(rows.flatMap((item) => item.proofLinks));
  const groupDefs = [
    { id: "application_submission", label: "Application submission" },
    { id: "review_approval", label: "Review approval" },
    { id: "policy_safety", label: "Policy and safety" },
    { id: "legal_artifacts", label: "Legal artifacts" },
  ];
  const groups: SwiggyBuildersAccessPolicyWitnessGroup[] = groupDefs.map((group) => {
    const groupRows = rows.filter((item) => groupFor(item) === group.id);
    return {
      id: group.id,
      label: group.label,
      rows: groupRows.length,
      proven: groupRows.filter((item) => item.status === "proven").length,
      ready: groupRows.filter((item) => item.status === "ready").length,
      watch: groupRows.filter((item) => item.status === "watch").length,
      gates: groupRows.filter((item) => item.status === "operator_gate" || item.status === "swiggy_gate").length,
      proofLinks: unique(groupRows.flatMap((item) => item.proofLinks)),
    };
  });
  const operatorGates = rows.filter((item) => item.status === "operator_gate").length;
  const swiggyGates = rows.filter((item) => item.status === "swiggy_gate").length;
  const watch = rows.filter((item) => item.status === "watch").length;
  const score = Math.round((rows.reduce((sum, item) => sum + weightFor(item.status), 0) / rows.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    decision:
      swiggyGates > 1
        ? "access_policy_blocked"
        : watch > 0 || operatorGates > 0 || swiggyGates > 0
          ? "access_policy_watch"
          : "access_policy_ready",
    recommendedTrack: accessMatrix.recommendedTrack,
    officialSources: unique([
      ...dossier.officialSources,
      ...accessMatrix.officialSources,
      ...accessStudio.officialSources,
      ...faqPolicy.officialSources,
      ...brand.officialSources,
      ...dataGovernance.officialSources,
      ...reviewDecision.officialSources,
    ]),
    totals: {
      rows: rows.length,
      proven: rows.filter((item) => item.status === "proven").length,
      ready: rows.filter((item) => item.status === "ready").length,
      watch,
      operatorGates,
      swiggyGates,
      proofLinks: proofLinks.length,
      applicationFields: dossier.applicationFields.length,
      readyRequiredApplicationFields: readyRequiredFields.length,
      requiredApplicationFields: requiredFields.length,
      reviewChecks: dossier.reviewChecks.length,
      policyRules: faqPolicy.totalRules,
      readyPolicyRules: faqPolicy.readyRules,
      legalItems: dossier.legalReadiness.length,
      officialTargets: accessStudio.officialTargets.length,
      requiredAttachments: requiredAttachments.length,
      readyRequiredAttachments: readyRequiredAttachments.length,
      browserRunbookSteps: accessStudio.browserRunbook.length,
      brandRules: brand.rules.length,
      dataControls: dataGovernance.controls.length,
      reviewGates: reviewDecision.totals.gates,
    },
    rows,
    groups,
    commands: [
      {
        id: "access_policy_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-access-policy-witness",
        proves:
          "Access form fields, review checks, policies, legal gates, CTAs, attachments, brand/data controls, and approval decision are witnessed together.",
        expectedSignal: "totals.applicationFields >= 8 && totals.policyRules >= 7",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke fails if access policy, submission, legal, brand, data, or visual evidence falls out of the packet.",
        expectedSignal: "accessPolicyWitnessScore >= 83",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Access Policy Witness card is captured with every reviewer-critical Launch Center surface.",
        expectedSignal: "79 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Access-policy readiness is one receipt across form fields, review checks, ground rules, legal terms, CTAs, attachments, brand, data, and approval gates.",
      "MealPilot prepares proof and copy but does not submit forms, send email, accept terms, request credentials, or claim approval automatically.",
      "Allowed, restricted, prohibited, operating-principle, and legal framework signals remain tied to concrete product controls.",
      "Swiggy production access, credentials, co-branding, enterprise contracts, showcase placement, and public endorsement remain Swiggy-owned gates.",
    ],
    externalGates: [
      "The operator must record the demo URL, review terms, submit the official access form, and send the builders@swiggy.in handoff email manually.",
      "Swiggy must approve production access, issue staging and production credentials, confirm support/capacity, and approve any co-branding or showcase claims.",
      "Enterprise contracts, DPAs, liability terms, white-label rights, custom quotas, and public partner claims require explicit written approval.",
    ],
  };
}
