import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  AccessSubmissionRehearsal,
  AccessSubmissionRehearsalMode,
  AccessSubmissionStudio,
  AccessSubmissionStudioCopyBlock,
  AccessSubmissionStudioStep,
  AccessSubmissionStudioTarget,
  McpServerCoverage,
  MealPlan,
  SubmissionConsoleAttachment,
  SubmissionConsoleStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildBuilderPacketExport } from "./builderPacketExport.js";
import { buildSandboxCredentialWorkbench } from "./sandboxCredentialWorkbench.js";
import { buildSubmissionConsole } from "./submissionConsole.js";
import { defaultAccessSubmissionState } from "../store/sessionStore.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

function statusWeight(status: SubmissionConsoleStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.72;
  if (status === "external_gate") return 0.46;
  return 0.1;
}

function target(
  id: string,
  label: string,
  url: string,
  cta: string,
  status: SubmissionConsoleStatus,
  purpose: string,
  nextAction: string,
): AccessSubmissionStudioTarget {
  return { id, label, url, cta, status, purpose, nextAction };
}

function copyBlock(
  id: string,
  label: string,
  status: SubmissionConsoleStatus,
  value: string,
  copyAction: string,
): AccessSubmissionStudioCopyBlock {
  return { id, label, status, value, copyAction };
}

function step(
  sequence: number,
  id: string,
  label: string,
  owner: AccessSubmissionStudioStep["owner"],
  status: SubmissionConsoleStatus,
  action: string,
): AccessSubmissionStudioStep {
  return { sequence, id, label, owner, status, action };
}

function requiredAttachmentStatus(attachments: SubmissionConsoleAttachment[], id: string) {
  return attachments.find((attachment) => attachment.id === id)?.status ?? "operator_input";
}

function isFilled(value: string | undefined) {
  return Boolean(value?.trim());
}

function isHttps(value: string | undefined) {
  return Boolean(value?.trim().startsWith("https://"));
}

function buildMailto(to: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function overrideFieldStatus(
  fieldId: string,
  original: { status: SubmissionConsoleStatus; suggestedValue: string },
  state: AccessSubmissionHandoffState,
) {
  if (fieldId === "who_you_are" && isFilled(state.technicalContactEmail)) {
    return {
      status: "ready" as const,
      value: `Farhan Khan / MealPilot India. Primary technical and security contact: ${state.technicalContactEmail}.`,
    };
  }
  if (fieldId === "security_contact" && isFilled(state.technicalContactEmail)) {
    return { status: "ready" as const, value: state.technicalContactEmail };
  }
  if (fieldId === "redirect_uris" && isHttps(state.productionRedirectUri)) {
    return { status: "ready" as const, value: state.productionRedirectUri };
  }
  if (fieldId === "static_ip_ranges" && isFilled(state.staticEgressIp)) {
    return { status: "ready" as const, value: state.staticEgressIp };
  }
  if (fieldId === "environment_details" && isFilled(state.environmentSummary)) {
    return { status: "ready" as const, value: state.environmentSummary };
  }
  if (fieldId === "terms_acknowledgement" && state.termsAcknowledged) {
    return { status: "ready" as const, value: `Acknowledged locally at ${state.updatedAt}` };
  }
  if (fieldId === "certifications" && original.suggestedValue.toLowerCase().includes("not applicable")) {
    return { status: "ready" as const, value: original.suggestedValue };
  }
  return { status: original.status, value: original.suggestedValue };
}

export function buildAccessSubmissionStudio(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
}): AccessSubmissionStudio {
  const handoffState = { ...defaultAccessSubmissionState(), ...(options.handoffState ?? {}) };
  const submissionConsole = buildSubmissionConsole(options);
  const builderPacket = buildBuilderPacketExport(options);
  const sandboxWorkbench = buildSandboxCredentialWorkbench(options.config);
  const requiredAttachments = submissionConsole.attachments.filter((attachment) => attachment.mustAttach);
  const attachmentChecklist = requiredAttachments.map((attachment) => ({
    id: attachment.id,
    label: attachment.label,
    status: attachment.id === "demo_video" && isFilled(handoffState.demoVideoUrl) ? "ready" as const : attachment.status,
    path: attachment.id === "demo_video" && isFilled(handoffState.demoVideoUrl) ? handoffState.demoVideoUrl : attachment.path,
    required: attachment.mustAttach,
  }));
  const readyRequiredAttachments = attachmentChecklist.filter((attachment) => attachment.status === "ready");
  const externalGatedItems = [
    ...submissionConsole.runbook.filter((item) => item.status === "external_gate"),
    ...submissionConsole.requirements.filter((item) => item.status === "external_gate"),
    ...builderPacket.readiness.filter((item) => item.status === "external_gate"),
    ...sandboxWorkbench.lanes.filter((lane) => lane.status === "swiggy_gate"),
  ];
  const copyBlocks = [
    copyBlock(
      "track",
      "Recommended track",
      "ready",
      submissionConsole.recommendedTrack,
      "Choose this track on the official Swiggy access page.",
    ),
    ...submissionConsole.fields.map((field) => {
      const override = overrideFieldStatus(field.id, field, handoffState);
      return copyBlock(field.id, field.label, override.status, override.value, "Paste into the matching Swiggy access form field.");
    }),
    copyBlock(
      "handoff_email_subject",
      "Handoff email subject",
      "ready",
      builderPacket.copyBlocks.handoffEmail.subject,
      "Use as the builders@swiggy.in follow-up subject after form submission.",
    ),
  ];
  const readyCopyBlocks = copyBlocks.filter((block) => block.status === "ready").length;
  const requiredFieldIds = new Set(submissionConsole.fields.filter((field) => field.required).map((field) => field.id));
  const operatorFields = copyBlocks.filter(
    (block) => block.status === "operator_input" && (requiredFieldIds.size === 0 || requiredFieldIds.has(block.id)),
  );
  const operatorAttachments = attachmentChecklist.filter((attachment) => attachment.required && attachment.status === "operator_input");
  const targets = [
    target(
      "start_building",
      "Start Building",
      "https://mcp.swiggy.com/builders/docs/",
      "Start Building",
      "ready",
      "Open docs and verify the local demo still maps to current Swiggy MCP guidance.",
      "Use before recording the final demo to confirm no source drift.",
    ),
    target(
      "request_access",
      "Request Access",
      "https://mcp.swiggy.com/builders/access/",
      "Request access",
      handoffState.formSubmittedAt ? "ready" : "operator_input",
      "Official production access form entry point for developer and enterprise tracks.",
      "Open in browser, paste prepared values, attach proof links, and submit manually.",
    ),
    target(
      "send_demo",
      "Send Us a Demo",
      "mailto:builders@swiggy.in",
      "Send Us a Demo",
      handoffState.handoffEmailSentAt ? "ready" : "operator_input",
      "Follow-up channel advertised by Swiggy for builders with a working demo.",
      "Send the generated handoff email after the access form is submitted.",
    ),
  ];
  const browserRunbook = [
    step(1, "run_verifiers", "Run local verification", "MealPilot", "ready", "Run build, tests, lint, production smoke, visual QA, and packet export."),
    step(2, "record_demo", "Record demo video", "Operator", isFilled(handoffState.demoVideoUrl) ? "ready" : requiredAttachmentStatus(requiredAttachments, "demo_video"), "Record the 2-3 minute MealPilot flow and paste the URL into the form."),
    step(3, "copy_form_values", "Copy form values", "Operator", operatorFields.length === 0 ? "ready" : "operator_input", `Resolve ${operatorFields.length} operator-owned field(s), then paste all copy blocks.`),
    step(4, "attach_packet", "Attach packet and evidence", "Operator", readyRequiredAttachments.length >= 8 ? "ready" : "operator_input", `Attach ${readyRequiredAttachments.length}/${requiredAttachments.length} required evidence links.`),
    step(5, "submit_access_form", "Submit official access form", "Operator", handoffState.formSubmittedAt ? "ready" : "operator_input", "Open Request access, choose developer track, paste values, attach proof, and submit."),
    step(6, "send_handoff", "Send builders handoff", "Operator", handoffState.handoffEmailSentAt ? "ready" : "operator_input", "Send the generated email to builders@swiggy.in with the demo URL and packet links."),
    step(7, "await_credentials", "Await staging credentials", "Swiggy", "external_gate", "Swiggy reviews the use case, security setup, demo, and rollout plan before issuing staging credentials."),
  ];
  const blockers = [
    ...operatorFields.map((field) => `${field.label}: operator input required`),
    ...operatorAttachments.map((attachment) => `${attachment.label}: operator input required`),
    ...(handoffState.formSubmittedAt ? [] : ["Official Swiggy access form must be submitted in the browser."]),
    ...(handoffState.handoffEmailSentAt ? [] : ["builders@swiggy.in handoff email must be sent by the operator."]),
    "Swiggy staging and production credentials require Swiggy approval.",
  ];
  const scoreItems = [
    ...copyBlocks.map((block) => block.status),
    ...attachmentChecklist.map((attachment) => attachment.status),
    ...targets.map((item) => item.status),
    ...browserRunbook.map((item) => item.status),
  ];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);
  const email = builderPacket.copyBlocks.handoffEmail;

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    recommendedTrack: submissionConsole.recommendedTrack,
    canSubmitNow: operatorFields.length === 0 && operatorAttachments.length === 0 && !handoffState.formSubmittedAt,
    submitReadinessLabel: `${readyCopyBlocks}/${copyBlocks.length} copy blocks, ${readyRequiredAttachments.length}/${attachmentChecklist.length} required attachments`,
    officialTargets: targets,
    copyBlocks,
    attachmentChecklist,
    browserRunbook,
    handoffState,
    mailto: {
      to: email.to,
      subject: email.subject,
      body: email.body,
      href: buildMailto(email.to, email.subject, email.body),
    },
    totals: {
      readyCopyBlocks,
      totalCopyBlocks: copyBlocks.length,
      readyRequiredAttachments: readyRequiredAttachments.length,
      totalRequiredAttachments: attachmentChecklist.length,
      operatorBlocks: operatorFields.length + operatorAttachments.length + targets.filter((item) => item.status === "operator_input").length,
      externalGates: externalGatedItems.length,
    },
    blockers,
    assertions: [
      "MealPilot prepares the official Swiggy access submission but never auto-submits the external form during local tests.",
      "The studio preserves Start Building, Request access, and Send Us a Demo as explicit official CTA targets.",
      "Every copy block is sourced from Submission Console or Builder Packet evidence, not hand-written at submission time.",
      "The mailto draft is generated from the same handoff email that appears in the Builder Packet Export.",
      "Swiggy staging credentials, seeded users, production approval, and co-branding remain external gates.",
    ],
    externalGates: [
      "Operator must record and paste the demo video URL.",
      "Operator must submit the official Swiggy access form in the browser.",
      "Operator must send the builders@swiggy.in handoff email after submission.",
      "Swiggy must issue staging credentials, approve seeded data, and later approve production credentials.",
    ],
  };
}

export function rehearseAccessSubmission(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
  mode: AccessSubmissionRehearsalMode;
  includeFormSubmission: boolean;
  includeHandoffEmail: boolean;
  includeCredentialGates: boolean;
}): AccessSubmissionRehearsal {
  const studio = buildAccessSubmissionStudio(options);
  const missingInputs = [
    ...studio.copyBlocks
      .filter((block) => block.status === "operator_input")
      .map((block) => `${block.label} copy block`),
    ...studio.attachmentChecklist
      .filter((attachment) => attachment.required && attachment.status === "operator_input")
      .map((attachment) => `${attachment.label} attachment`),
  ];

  if (options.includeFormSubmission && !studio.handoffState.formSubmittedAt) {
    missingInputs.push("official Swiggy access form submission");
  }
  if (options.includeHandoffEmail && !studio.handoffState.handoffEmailSentAt) {
    missingInputs.push("builders@swiggy.in handoff email");
  }
  if (options.includeCredentialGates || options.mode === "credential_followup") {
    missingInputs.push("Swiggy staging credential issuance");
  }

  const decision: AccessSubmissionRehearsal["decision"] =
    missingInputs.some((input) => input.includes("Swiggy staging credential"))
      ? "blocked_swiggy_gate"
      : missingInputs.length > 0
        ? "manual_submission_gate"
        : "ready_access_packet";

  const selectedTargets =
    options.mode === "pre_submit"
      ? studio.officialTargets.filter((target) => target.id !== "send_demo")
      : studio.officialTargets;
  const browserRunbook =
    options.mode === "credential_followup"
      ? studio.browserRunbook
      : studio.browserRunbook.filter((stepItem) => stepItem.id !== "await_credentials");

  return {
    generatedAt: new Date().toISOString(),
    decision,
    readinessScore: studio.score,
    mode: options.mode,
    includeFormSubmission: options.includeFormSubmission,
    includeHandoffEmail: options.includeHandoffEmail,
    includeCredentialGates: options.includeCredentialGates,
    selectedTargets,
    copyBlocks: studio.copyBlocks,
    attachmentChecklist: studio.attachmentChecklist,
    browserRunbook,
    mailto: studio.mailto,
    commands: [
      {
        command: "curl -fsS http://localhost:8787/api/access-submission-studio",
        proves: "Official targets, copy blocks, attachments, runbook, and external gates are prepared.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet",
        proves: "Reviewer packet artifacts and verification summary are refreshed before submission.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Access dossier, evidence matrix, reviewer vault, and launch bundle remain aligned.",
      },
    ],
    missingInputs,
    telemetry: [
      { field: "mode", value: options.mode, redaction: "safe access rehearsal mode" },
      { field: "copy_blocks_ready", value: `${studio.totals.readyCopyBlocks}/${studio.totals.totalCopyBlocks}`, redaction: "aggregate count only" },
      { field: "attachments_ready", value: `${studio.totals.readyRequiredAttachments}/${studio.totals.totalRequiredAttachments}`, redaction: "aggregate count only" },
      { field: "targets", value: String(selectedTargets.length), redaction: "aggregate count only" },
      { field: "external_gates", value: String(studio.totals.externalGates), redaction: "aggregate count only" },
    ],
    assertions: [
      "The rehearsal prepares the official Swiggy access handoff but never submits the external form.",
      "The builders@swiggy.in email remains a copy-ready mailto draft and is not sent by the API.",
      "Demo URL, security contact, redirect URI, egress/IP, and environment summary are operator-owned inputs.",
      "Staging credentials, production approval, seeded data, and co-branding remain Swiggy external gates.",
    ],
    nextAction:
      decision === "ready_access_packet"
        ? "Open the official Request access target, paste the prepared copy blocks, attach evidence, and send the handoff email manually."
        : decision === "manual_submission_gate"
          ? `Resolve ${missingInputs.join(", ")} before using the official Swiggy access targets.`
          : `Keep the submission blocked on ${missingInputs.join(", ")} and use the local packet as reviewer evidence only.`,
  };
}
