import type { ServerConfig } from "../config.js";
import type {
  AccessDossierField,
  McpServerCoverage,
  MealPlan,
  SubmissionConsole,
  SubmissionConsoleAttachment,
  SubmissionConsoleField,
  SubmissionConsolePacketItem,
  SubmissionConsoleRequirement,
  SubmissionConsoleRunbookStep,
  SubmissionConsoleStatus,
  SubmissionConsoleTrack,
  UserProfile,
} from "../../src/domain/types.js";
import { buildSubmissionPackage } from "./demoStudio.js";
import { buildLaunchBundle } from "./launchBundle.js";
import { buildSwiggyAccessDossier } from "./swiggyAccessDossier.js";
import { buildSwiggyBuilderIntakeCommandCenter } from "./builderIntake.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
];

function scoreStatus(status: SubmissionConsoleStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.68;
  if (status === "external_gate") return 0.42;
  return 0;
}

function mapStatus(status: "ready" | "operator_input" | "external_gate"): SubmissionConsoleStatus {
  return status;
}

function buildTracks(): SubmissionConsoleTrack[] {
  return [
    {
      id: "developer",
      label: "Apply as Developer",
      status: "ready",
      officialUrl: "https://mcp.swiggy.com/builders/access/",
      fit: "Individual developers, small teams, startups, AI agents, and side projects ready to request production access.",
      requiredInputs: ["Developer profile", "Use case", "Demo video", "GitHub/repo link", "Technical contact"],
      mealPilotPositioning:
        "Best immediate path for MealPilot: local proof is complete, production form submission needs final operator-owned contact and demo URL.",
      evidenceLinks: ["/api/swiggy-builder-intake", "/api/swiggy-access-dossier", "/api/production-launch-bundle"],
    },
    {
      id: "enterprise",
      label: "Apply as Enterprise",
      status: "external_gate",
      officialUrl: "https://mcp.swiggy.com/builders/access/",
      fit: "Companies integrating Swiggy commerce into their own products with custom onboarding, enterprise SLAs, contracts, and support.",
      requiredInputs: ["Legal entity", "Security contact", "Traffic plan", "Delegated-auth design", "Contract/DPA review"],
      mealPilotPositioning:
        "Future path after developer-track proof, if MealPilot becomes a platform operator or needs delegated auth, co-marketing, or higher quotas.",
      evidenceLinks: ["/api/enterprise-delegated-auth", "/api/data-governance-center", "/api/slo-incident-command"],
    },
  ];
}

function requirementGate(field: AccessDossierField): SubmissionConsoleRequirement["completionGate"] {
  if (field.status === "ready") return "none";
  if (field.status === "external_gate") return "swiggy_approval";
  return "operator_input";
}

function requirementNextAction(field: AccessDossierField) {
  if (field.status === "ready") return "Copy the prepared value directly into the developer access form.";
  if (field.id === "redirect_uris") return "Replace localhost with the final HTTPS callback before production submission.";
  if (field.id === "static_ip_ranges") return "Paste the final static egress or gateway IP after hosting is selected.";
  if (field.id === "security_contact") return "Add a reachable engineering/security email for Swiggy review.";
  if (field.id === "terms_acknowledgement") return "Review and tick the current Swiggy MCP terms in the official form.";
  if (field.id === "who_you_are") return "Add the final individual/company profile and primary technical contact.";
  if (field.id === "certifications") return "Attach SOC2/ISO evidence only if it exists; otherwise mark not applicable for developer track.";
  return "Resolve the operator-owned input before submitting the official form.";
}

function requirementStatus(field: AccessDossierField): SubmissionConsoleStatus {
  if (field.status === "ready") return "ready";
  if (field.status === "external_gate") return "external_gate";
  if (field.status === "blocked") return "blocked";
  return "operator_input";
}

function buildRequirements(fields: AccessDossierField[]): SubmissionConsoleRequirement[] {
  return fields.map((field) => ({
    id: field.id,
    label: field.label,
    required: field.required,
    status: requirementStatus(field),
    officialSource: field.source,
    preparedValue: field.value,
    completionGate: requirementGate(field),
    nextAction: requirementNextAction(field),
    evidenceLinks: field.proofLinks,
  }));
}

function buildFields(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
}): SubmissionConsoleField[] {
  const intake = buildSwiggyBuilderIntakeCommandCenter({
    config: options.config,
    latestPlan: options.latestPlan,
  });
  const simplePackage = buildSubmissionPackage(options);
  const packageFields = new Map(simplePackage.fields.map((field) => [field.id, field]));

  return intake.submissionFields.map((field) => {
    const packageField = packageFields.get(field.id);
    return {
      id: field.id,
      label: field.label,
      required: field.required,
      status: mapStatus(field.status),
      suggestedValue: packageField?.value ?? field.suggestedValue,
      evidenceLinks: field.evidenceLinks,
      officialSource: field.officialSource,
    };
  });
}

function buildAttachments(latestPlan: MealPlan | undefined): SubmissionConsoleAttachment[] {
  const sessionTranscript = latestPlan
    ? `/api/sessions/${latestPlan.id}/staging-transcript`
    : "/api/sessions/:sessionId/staging-transcript";
  const latestPlanPath = latestPlan ? `/api/sessions/${latestPlan.id}` : "/api/plan";

  return [
    {
      id: "github_repo",
      label: "GitHub repository",
      status: "ready",
      path: "https://github.com/Farhankhan0128/MealPilot",
      purpose: "Source code, tests, docs, CI, Docker, Render blueprint, and verifier scripts.",
      mustAttach: true,
    },
    {
      id: "builder_packet",
      label: "Builder packet markdown",
      status: "ready",
      path: "/api/builder-package.md",
      purpose: "Copy-ready product narrative and review evidence.",
      mustAttach: true,
    },
    {
      id: "launch_bundle",
      label: "Production Launch Bundle",
      status: "ready",
      path: "/api/production-launch-bundle",
      purpose: "Consolidated proof artifacts, commands, gates, and handoff email.",
      mustAttach: true,
    },
    {
      id: "access_dossier",
      label: "Access Dossier",
      status: "ready",
      path: "/api/swiggy-access-dossier",
      purpose: "Official application fields, review checks, ground rules, tracks, and legal readiness.",
      mustAttach: true,
    },
    {
      id: "demo_video",
      label: "Demo video URL",
      status: "operator_input",
      path: "Add Loom, Drive, or unlisted YouTube URL after recording",
      purpose: "Swiggy asks builders to share a short demo before production access.",
      mustAttach: true,
    },
    {
      id: "latest_plan",
      label: "Latest MealPilot session",
      status: latestPlan ? "ready" : "operator_input",
      path: latestPlanPath,
      purpose: "Proof that the app generates a real three-server meal operating plan.",
      mustAttach: true,
    },
    {
      id: "staging_transcript",
      label: "Staging transcript export",
      status: latestPlan ? "ready" : "operator_input",
      path: sessionTranscript,
      purpose: "Redacted JSONL, Markdown replay, support envelope, and certification-wave evidence.",
      mustAttach: true,
    },
    {
      id: "credential_cockpit",
      label: "Credential Cockpit",
      status: "ready",
      path: "/api/credential-onboarding",
      purpose: "OAuth, PKCE, Dynamic Client Registration preview, redirect URI audit, and scope proof.",
      mustAttach: true,
    },
    {
      id: "data_governance",
      label: "Data Governance Center",
      status: "ready",
      path: "/api/data-governance-center",
      purpose: "DPDP role boundary, DSR routing, retention, token handling, and security contacts.",
      mustAttach: true,
    },
    {
      id: "audit_ledger",
      label: "Audit Ledger Center",
      status: "ready",
      path: "/api/audit-ledger",
      purpose: "Redacted session/tool audit events, support correlations, retention posture, and DSR routing.",
      mustAttach: true,
    },
    {
      id: "traffic_readiness",
      label: "Traffic Readiness Plan",
      status: "ready",
      path: "/api/traffic-readiness-plan",
      purpose: "Expected volume, QPS, Retry-After behavior, major-event notice, and staged rollout.",
      mustAttach: true,
    },
    {
      id: "brand_compliance",
      label: "Brand Compliance Kit",
      status: "ready",
      path: "/api/brand-compliance-kit",
      purpose: "Attribution, co-branding, no-endorsement copy, asset gates, and screenshot checklist.",
      mustAttach: false,
    },
    {
      id: "enterprise_delegated_auth",
      label: "Enterprise Delegated Auth Center",
      status: "external_gate",
      path: "/api/enterprise-delegated-auth",
      purpose: "Attach only if applying through enterprise/platform-operator track.",
      mustAttach: false,
    },
  ];
}

function buildRunbook(options: {
  config: ServerConfig;
  fields: SubmissionConsoleField[];
  attachments: SubmissionConsoleAttachment[];
}): SubmissionConsoleRunbookStep[] {
  const manualFields = options.fields.filter((field) => field.status === "operator_input");
  const manualAttachments = options.attachments.filter((item) => item.status === "operator_input");
  const hasHttpsRedirect = options.config.swiggyRedirectUri.startsWith("https://");

  return [
    {
      id: "verify_local_product",
      sequence: 1,
      label: "Verify local product proof",
      owner: "MealPilot",
      status: "ready",
      action: "Run tests, lint, build, and production smoke before recording or submitting.",
      evidenceLinks: ["/api/ready", "/api/openapi.json", "/api/production-launch-bundle"],
    },
    {
      id: "record_demo",
      sequence: 2,
      label: "Record demo video",
      owner: "Operator",
      status: manualAttachments.some((item) => item.id === "demo_video") ? "operator_input" : "ready",
      action: "Record the 2-3 minute Builder Access walkthrough and paste the public/private-share URL into the form.",
      evidenceLinks: ["/api/demo-studio", "/api/swiggy-builder-intake"],
    },
    {
      id: "fill_manual_fields",
      sequence: 3,
      label: "Fill manual form fields",
      owner: "Operator",
      status: manualFields.length > 0 ? "operator_input" : "ready",
      action: `Resolve ${manualFields.length} manual field(s): ${manualFields.map((field) => field.label).join(", ") || "none"}.`,
      evidenceLinks: ["/api/swiggy-access-dossier", "/api/submission-console"],
    },
    {
      id: "set_production_network",
      sequence: 4,
      label: "Set production redirect and egress",
      owner: "Operator",
      status: hasHttpsRedirect ? "ready" : "operator_input",
      action: "Replace localhost with the final HTTPS redirect URI and add static egress/NAT details after hosting is chosen.",
      evidenceLinks: ["/api/credential-onboarding", "/api/mcp-gateway"],
    },
    {
      id: "submit_developer_form",
      sequence: 5,
      label: "Submit developer access form",
      owner: "Operator",
      status: "operator_input",
      action: "Open the official Swiggy access page, choose developer track, paste prepared values, attach proof links, and acknowledge current terms.",
      evidenceLinks: ["/api/submission-console", "/api/production-launch-bundle"],
    },
    {
      id: "send_handoff_email",
      sequence: 6,
      label: "Send handoff email",
      owner: "Operator",
      status: "operator_input",
      action: "Send the generated handoff draft to builders@swiggy.in after the form is submitted.",
      evidenceLinks: ["/api/production-launch-bundle", "/api/swiggy-builder-intake"],
    },
    {
      id: "await_staging_credentials",
      sequence: 7,
      label: "Await staging credentials",
      owner: "Swiggy",
      status: "external_gate",
      action: "Swiggy reviews the form, demo, security posture, use case fit, and rollout plan before issuing credentials.",
      evidenceLinks: ["/api/mcp/staging-cutover", "/api/staging-certification-matrix"],
    },
  ];
}

function buildPacketOrder(options: {
  fields: SubmissionConsoleField[];
  attachments: SubmissionConsoleAttachment[];
}): SubmissionConsolePacketItem[] {
  const fieldSummary =
    options.fields
      .filter((field) => field.required)
      .map((field) => field.label)
      .join(", ") || "No required fields";
  const requiredAttachments = options.attachments.filter((attachment) => attachment.mustAttach);
  const attachmentItems = requiredAttachments.slice(0, 8).map((attachment, index): SubmissionConsolePacketItem => ({
    sequence: index + 2,
    id: `attach_${attachment.id}`,
    label: `Attach ${attachment.label}`,
    itemType: "attachment",
    status: attachment.status,
    path: attachment.path,
    operatorAction: attachment.status === "ready" ? "Attach or paste this proof link into the official form." : attachment.purpose,
    evidenceLinks: [attachment.path],
  }));

  return [
    {
      sequence: 1,
      id: "field_values",
      label: "Copy required form values",
      itemType: "field",
      status: options.fields.some((field) => field.required && field.status !== "ready") ? "operator_input" : "ready",
      path: "/api/submission-console",
      operatorAction: `Paste prepared values for: ${fieldSummary}.`,
      evidenceLinks: ["/api/swiggy-access-dossier", "/api/swiggy-builder-intake"],
    },
    ...attachmentItems,
    {
      sequence: attachmentItems.length + 2,
      id: "submit_developer_form",
      label: "Submit developer form",
      itemType: "runbook",
      status: "operator_input",
      path: "https://mcp.swiggy.com/builders/access/",
      operatorAction: "Open the official access page, choose Apply as Developer, paste values, attach proof links, and submit.",
      evidenceLinks: ["/api/submission-console", "/api/production-launch-bundle"],
    },
    {
      sequence: attachmentItems.length + 3,
      id: "send_handoff_email",
      label: "Send builders handoff email",
      itemType: "email",
      status: "operator_input",
      path: "/api/swiggy-builder-intake",
      operatorAction: "Send the generated draft to builders@swiggy.in after the official form is submitted.",
      evidenceLinks: ["/api/swiggy-builder-intake", "/api/production-launch-bundle"],
    },
    {
      sequence: attachmentItems.length + 4,
      id: "await_staging_credentials",
      label: "Wait for Swiggy staging credentials",
      itemType: "runbook",
      status: "external_gate",
      path: "/api/mcp/staging-cutover",
      operatorAction: "Run the staging certification waves after Swiggy issues credentials.",
      evidenceLinks: ["/api/mcp/staging-cutover", "/api/staging-certification-matrix"],
    },
  ];
}

export function buildSubmissionConsole(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
}): SubmissionConsole {
  const intake = buildSwiggyBuilderIntakeCommandCenter({
    config: options.config,
    latestPlan: options.latestPlan,
  });
  const dossier = buildSwiggyAccessDossier(options.config);
  const launchBundle = buildLaunchBundle({ config: options.config, latestPlan: options.latestPlan });
  const formTargets = buildTracks();
  const requirements = buildRequirements(dossier.applicationFields);
  const fields = buildFields(options);
  const attachments = buildAttachments(options.latestPlan);
  const runbook = buildRunbook({ config: options.config, fields, attachments });
  const packetOrder = buildPacketOrder({ fields, attachments });
  const statuses = [
    ...formTargets.filter((item) => item.id === "developer").map((item) => item.status),
    ...fields.map((item) => item.status),
    ...attachments.filter((item) => item.mustAttach).map((item) => item.status),
    ...runbook.map((item) => item.status),
    ...requirements.filter((item) => item.required).map((item) => item.status),
  ];
  const blockers = [
    ...fields.filter((item) => item.status !== "ready").map((item) => `${item.label}: ${item.status.replace("_", " ")}`),
    ...attachments.filter((item) => item.mustAttach && item.status !== "ready").map((item) => `${item.label}: ${item.status.replace("_", " ")}`),
    ...runbook.filter((item) => item.status !== "ready").map((item) => `${item.label}: ${item.status.replace("_", " ")}`),
  ];

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round((statuses.reduce((sum, status) => sum + scoreStatus(status), 0) / statuses.length) * 100),
    officialSources,
    recommendedTrack: "developer",
    formTargets,
    readyRequirements: requirements.filter((item) => item.status === "ready").length,
    totalRequirements: requirements.length,
    operatorRequirements: requirements.filter((item) => item.completionGate === "operator_input").length,
    requirements,
    readyFields: fields.filter((item) => item.status === "ready").length,
    totalFields: fields.length,
    fields,
    readyAttachments: attachments.filter((item) => item.mustAttach && item.status === "ready").length,
    totalAttachments: attachments.filter((item) => item.mustAttach).length,
    attachments,
    packetOrder,
    runbook,
    outboundDrafts: intake.outboundDrafts,
    blockers,
    assertions: [
      "Developer track is the correct immediate path for MealPilot until enterprise delegated-auth and contracts are intentionally pursued.",
      `${dossier.applicationFields.length} official access-page fields are represented with suggested values, evidence links, and remaining owner gates.`,
      `${launchBundle.artifacts.length} launch artifacts remain available for the handoff package, including verifier commands and Swiggy external gates.`,
      "MealPilot prepares official form values and email drafts but does not submit Google Forms or send emails during local tests.",
      `${requirements.length} official access requirements are represented as a copy-order-ready pre-submit dossier.`,
      "Staging credentials, production credentials, demo video URL, final contact, terms acknowledgement, HTTPS redirect, and static egress remain explicit gates.",
    ],
    externalGates: [
      "Official Google Form submission must be performed by the operator in the browser.",
      "Final demo video URL, primary security contact, HTTPS redirect URI, static IP/egress, and terms acknowledgement require operator input.",
      "Swiggy review, staging credentials, seeded data, production credentials, Slack/support channel, co-branding approval, and enterprise contracts require Swiggy action.",
    ],
  };
}
