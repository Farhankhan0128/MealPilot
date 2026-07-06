import type { ServerConfig } from "../config.js";
import type {
  AccessDossierStatus,
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  SubmissionConsoleStatus,
  SwiggyAccessEvidenceKind,
  SwiggyAccessEvidenceMatrix,
  SwiggyAccessEvidenceOwner,
  SwiggyAccessEvidenceRow,
  SwiggyAccessEvidenceSection,
  UserProfile,
} from "../../src/domain/types.js";
import { defaultAccessSubmissionState } from "../store/sessionStore.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildReviewerArtifactVault } from "./reviewerArtifactVault.js";
import { buildSubmissionConsole } from "./submissionConsole.js";
import { buildSwiggyAccessDossier } from "./swiggyAccessDossier.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function normalizeStatus(status: AccessDossierStatus | SubmissionConsoleStatus | "manual_input") {
  if (status === "manual_input") return "operator_input" as const;
  if (status === "blocked") return "watch" as const;
  return status;
}

function ownerFor(status: SwiggyAccessEvidenceRow["status"]): SwiggyAccessEvidenceOwner {
  if (status === "external_gate") return "Swiggy";
  if (status === "operator_input") return "Operator";
  return "MealPilot";
}

function scoreStatus(status: SwiggyAccessEvidenceRow["status"]) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.72;
  if (status === "external_gate") return 0.46;
  return 0.35;
}

function row(
  id: string,
  label: string,
  kind: SwiggyAccessEvidenceKind,
  status: SwiggyAccessEvidenceRow["status"],
  officialSource: string,
  officialRequirement: string,
  mealPilotEvidence: string,
  nextAction: string,
  evidenceLinks: string[],
): SwiggyAccessEvidenceRow {
  return {
    id,
    label,
    kind,
    status,
    owner: ownerFor(status),
    officialSource,
    officialRequirement,
    mealPilotEvidence,
    nextAction,
    evidenceLinks,
  };
}

function section(id: string, label: string, description: string, rows: SwiggyAccessEvidenceRow[]): SwiggyAccessEvidenceSection {
  return {
    id,
    label,
    description,
    readyRows: rows.filter((item) => item.status === "ready").length,
    operatorRows: rows.filter((item) => item.status === "operator_input").length,
    externalGateRows: rows.filter((item) => item.status === "external_gate").length,
    totalRows: rows.length,
    rows,
  };
}

export function buildSwiggyAccessEvidenceMatrix(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
}): SwiggyAccessEvidenceMatrix {
  const handoffState = { ...defaultAccessSubmissionState(), ...(options.handoffState ?? {}) };
  const dossier = buildSwiggyAccessDossier(options.config);
  const submissionConsole = buildSubmissionConsole(options);
  const accessStudio = buildAccessSubmissionStudio({ ...options, handoffState });
  const reviewerVault = buildReviewerArtifactVault();

  const applicationRows = dossier.applicationFields.map((field) =>
    row(
      `field_${field.id}`,
      field.label,
      "application_field",
      normalizeStatus(field.status),
      field.source,
      field.required ? "Required Swiggy access application field" : "Optional Swiggy access application field",
      field.evidence,
      field.status === "ready" ? "Copy prepared value into the official form." : field.value,
      field.proofLinks,
    ),
  );

  const reviewRows = dossier.reviewChecks.map((check) =>
    row(
      `review_${check.id}`,
      check.label,
      "review_check",
      normalizeStatus(check.status),
      "Swiggy access review check",
      check.officialCheck,
      check.mealPilotEvidence,
      check.status === "ready" ? "Keep evidence green before form submission." : "Wait for Swiggy review or credentials.",
      check.proofLinks,
    ),
  );

  const ruleRows = dossier.groundRules.map((rule) =>
    row(
      `rule_${rule.id}`,
      rule.label,
      "ground_rule",
      normalizeStatus(rule.status),
      `Access page ${rule.officialStance} guidance`,
      rule.officialItems.join(" "),
      rule.mealPilotControls.join(" "),
      "Use these controls in the demo and access handoff.",
      rule.proofLinks,
    ),
  );

  const legalRows = dossier.legalReadiness.map((item) =>
    row(
      `legal_${item.id}`,
      item.label,
      "legal",
      normalizeStatus(item.status),
      "Swiggy MCP terms and legal readiness",
      item.label,
      item.evidence,
      item.nextAction,
      ["/api/swiggy-access-dossier", "/api/access-submission-studio"],
    ),
  );

  const targetRows = accessStudio.officialTargets.map((target) =>
    row(
      `target_${target.id}`,
      target.label,
      "track",
      normalizeStatus(target.status),
      target.url,
      target.purpose,
      `CTA "${target.cta}" is preserved as an explicit operator action.`,
      target.nextAction,
      [target.url, "/api/access-submission-studio"],
    ),
  );

  const attachmentRows = submissionConsole.attachments
    .filter((attachment) => attachment.mustAttach)
    .map((attachment) =>
      row(
        `attachment_${attachment.id}`,
        attachment.label,
        "attachment",
        normalizeStatus(attachment.status),
        "Swiggy access proof attachment",
        attachment.purpose,
        attachment.path,
        attachment.status === "ready" ? "Attach this proof link to the packet." : "Resolve operator input before submission.",
        [attachment.path],
      ),
    );

  const runbookRows = accessStudio.browserRunbook.map((step) =>
    row(
      `runbook_${step.id}`,
      step.label,
      "runbook",
      normalizeStatus(step.status),
      "Official access submission flow",
      step.action,
      `Owner: ${step.owner}.`,
      step.status === "ready" ? "Keep this step complete." : step.action,
      ["/api/access-submission-studio"],
    ),
  );

  const proofRows = reviewerVault.commands.map((command) =>
    row(
      `proof_${command.id}`,
      command.id.replaceAll("_", " "),
      "proof",
      command.status === "ready" ? "ready" : command.status === "manual_input" ? "operator_input" : "external_gate",
      "Reviewer artifact command",
      command.proves,
      command.expectedSignal,
      `Run ${command.command}`,
      ["/api/reviewer-artifact-vault"],
    ),
  );

  const sections = [
    section(
      "application_fields",
      "Application Fields",
      "Every official production-access field mapped to prepared values, evidence, and owner gates.",
      applicationRows,
    ),
    section(
      "review_and_rules",
      "Review Checks & Ground Rules",
      "Security, compliance, use-case fit, rollout, support, allowed behavior, restrictions, and prohibited conduct.",
      [...reviewRows, ...ruleRows],
    ),
    section(
      "legal_and_tracks",
      "Legal & Track Selection",
      "Developer and enterprise track readiness plus terms, data protection, liability, and revocation posture.",
      [...legalRows, ...targetRows],
    ),
    section(
      "attachments_and_runbook",
      "Attachments & Browser Runbook",
      "Required proof links, demo inputs, browser submission steps, and handoff email gates.",
      [...attachmentRows, ...runbookRows],
    ),
    section(
      "reviewer_proof_commands",
      "Reviewer Proof Commands",
      "Executable commands that prove the access packet, visual evidence, production smoke, and artifact vault.",
      proofRows,
    ),
  ];

  const rows = sections.flatMap((item) => item.rows);
  const readyRows = rows.filter((item) => item.status === "ready").length;
  const operatorRows = rows.filter((item) => item.status === "operator_input").length;
  const externalGateRows = rows.filter((item) => item.status === "external_gate").length;
  const readyRequiredApplicationFields = dossier.applicationFields.filter((field) => field.required && field.status === "ready").length;
  const requiredApplicationFields = dossier.applicationFields.filter((field) => field.required).length;
  const requiredAttachments = accessStudio.attachmentChecklist.filter((attachment) => attachment.required).length;
  const readyRequiredAttachments = accessStudio.attachmentChecklist.filter(
    (attachment) => attachment.required && attachment.status === "ready",
  ).length;
  const score = Math.round((rows.reduce((sum, item) => sum + scoreStatus(item.status), 0) / rows.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    recommendedTrack: submissionConsole.recommendedTrack,
    totals: {
      rows: rows.length,
      readyRows,
      operatorRows,
      externalGateRows,
      sections: sections.length,
      requiredApplicationFields,
      readyRequiredApplicationFields,
      requiredAttachments,
      readyRequiredAttachments,
      proofCommands: proofRows.length,
    },
    sections,
    commands: [
      {
        id: "matrix_readback",
        command: "curl -s http://localhost:8787/api/swiggy-access-evidence-matrix",
        proves: "Reviewer can inspect every access requirement, owner, proof route, command, and gate.",
        expectedSignal: "totals.sections === 5 && totals.requiredApplicationFields === 9",
      },
      {
        id: "production_verifier",
        command: "npm run verify:production",
        proves: "Production smoke checks the evidence matrix alongside access dossier and submission studio.",
        expectedSignal: "accessEvidenceRows >= 40 && accessEvidenceReadyRows >= 25",
      },
      {
        id: "submission_state",
        command: "PATCH /api/access-submission-studio/state",
        proves: "Operator-owned demo URL, contact, redirect, egress, terms, form, and handoff timestamps can be persisted.",
        expectedSignal: "canSubmitNow becomes true before form submission, then false after submitted timestamps exist",
      },
    ],
    submissionReadiness: [
      `${readyRequiredApplicationFields}/${requiredApplicationFields} required application fields are ready.`,
      `${readyRequiredAttachments}/${requiredAttachments} required attachments are ready.`,
      `${operatorRows} row(s) still require operator-owned input before the official form is submitted.`,
      `${externalGateRows} row(s) remain true Swiggy approval or credential gates.`,
      `Recommended track remains ${submissionConsole.recommendedTrack}.`,
    ],
    assertions: [
      "Every official access-page application field is represented in the evidence matrix.",
      "Developer, enterprise, Request access, Start Building, and Send Us a Demo paths remain explicit instead of hidden behind generic CTAs.",
      "The matrix never claims external form submission, staging credentials, production credentials, legal acceptance, or Swiggy approval as locally complete.",
      "Required attachments, browser runbook steps, reviewer commands, and handoff email evidence are tied back to existing MealPilot routes.",
      "The matrix is derived from Access Dossier, Submission Console, Access Submission Studio, and Reviewer Artifact Vault so reviewers see one coherent readiness ledger.",
    ],
    externalGates: [
      ...accessStudio.externalGates,
      "Swiggy review, staging credentials, seeded data, production credentials, and any enterprise legal negotiation remain external gates.",
    ],
  };
}
