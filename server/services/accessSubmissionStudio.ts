import type { ServerConfig } from "../config.js";
import type {
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

function buildMailto(to: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildAccessSubmissionStudio(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
}): AccessSubmissionStudio {
  const submissionConsole = buildSubmissionConsole(options);
  const builderPacket = buildBuilderPacketExport(options);
  const sandboxWorkbench = buildSandboxCredentialWorkbench(options.config);
  const requiredAttachments = submissionConsole.attachments.filter((attachment) => attachment.mustAttach);
  const readyRequiredAttachments = requiredAttachments.filter((attachment) => attachment.status === "ready");
  const operatorFields = submissionConsole.fields.filter((field) => field.status === "operator_input");
  const operatorAttachments = requiredAttachments.filter((attachment) => attachment.status === "operator_input");
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
    ...submissionConsole.fields.map((field) =>
      copyBlock(field.id, field.label, field.status, field.suggestedValue, "Paste into the matching Swiggy access form field."),
    ),
    copyBlock(
      "handoff_email_subject",
      "Handoff email subject",
      "ready",
      builderPacket.copyBlocks.handoffEmail.subject,
      "Use as the builders@swiggy.in follow-up subject after form submission.",
    ),
  ];
  const readyCopyBlocks = copyBlocks.filter((block) => block.status === "ready").length;
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
      "operator_input",
      "Official production access form entry point for developer and enterprise tracks.",
      "Open in browser, paste prepared values, attach proof links, and submit manually.",
    ),
    target(
      "send_demo",
      "Send Us a Demo",
      "mailto:builders@swiggy.in",
      "Send Us a Demo",
      "operator_input",
      "Follow-up channel advertised by Swiggy for builders with a working demo.",
      "Send the generated handoff email after the access form is submitted.",
    ),
  ];
  const browserRunbook = [
    step(1, "run_verifiers", "Run local verification", "MealPilot", "ready", "Run build, tests, lint, production smoke, visual QA, and packet export."),
    step(2, "record_demo", "Record demo video", "Operator", requiredAttachmentStatus(requiredAttachments, "demo_video"), "Record the 2-3 minute MealPilot flow and paste the URL into the form."),
    step(3, "copy_form_values", "Copy form values", "Operator", operatorFields.length === 0 ? "ready" : "operator_input", `Resolve ${operatorFields.length} operator-owned field(s), then paste all copy blocks.`),
    step(4, "attach_packet", "Attach packet and evidence", "Operator", readyRequiredAttachments.length >= 8 ? "ready" : "operator_input", `Attach ${readyRequiredAttachments.length}/${requiredAttachments.length} required evidence links.`),
    step(5, "submit_access_form", "Submit official access form", "Operator", "operator_input", "Open Request access, choose developer track, paste values, attach proof, and submit."),
    step(6, "send_handoff", "Send builders handoff", "Operator", "operator_input", "Send the generated email to builders@swiggy.in with the demo URL and packet links."),
    step(7, "await_credentials", "Await staging credentials", "Swiggy", "external_gate", "Swiggy reviews the use case, security setup, demo, and rollout plan before issuing staging credentials."),
  ];
  const blockers = [
    ...operatorFields.map((field) => `${field.label}: operator input required`),
    ...operatorAttachments.map((attachment) => `${attachment.label}: operator input required`),
    "Official Swiggy access form must be submitted in the browser.",
    "Swiggy staging and production credentials require Swiggy approval.",
  ];
  const scoreItems = [
    ...copyBlocks.map((block) => block.status),
    ...requiredAttachments.map((attachment) => attachment.status),
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
    canSubmitNow: false,
    submitReadinessLabel: `${readyCopyBlocks}/${copyBlocks.length} copy blocks, ${readyRequiredAttachments.length}/${requiredAttachments.length} required attachments`,
    officialTargets: targets,
    copyBlocks,
    attachmentChecklist: requiredAttachments.map((attachment) => ({
      id: attachment.id,
      label: attachment.label,
      status: attachment.status,
      path: attachment.path,
      required: attachment.mustAttach,
    })),
    browserRunbook,
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
      totalRequiredAttachments: requiredAttachments.length,
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
