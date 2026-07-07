import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  SwiggySubmissionTimelineCheckpoint,
  SwiggySubmissionTimelineCheckpointDecision,
  SwiggySubmissionTimelineCenter,
  SwiggySubmissionTimelinePhase,
  SwiggySubmissionTimelineStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildBuilderPacketExport } from "./builderPacketExport.js";
import { buildSandboxCredentialWorkbench } from "./sandboxCredentialWorkbench.js";
import { buildSwiggyShowcaseSubmissionCenter } from "./showcaseSubmissionCenter.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
];

function statusWeight(status: SwiggySubmissionTimelineStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.7;
  return 0.42;
}

function phase(input: SwiggySubmissionTimelinePhase): SwiggySubmissionTimelinePhase {
  return input;
}

function firstOpenAction(phases: SwiggySubmissionTimelinePhase[]) {
  return phases.find((item) => item.status === "operator_input")?.nextAction ?? phases.find((item) => item.status === "swiggy_gate")?.nextAction ?? "Keep verifier evidence fresh while Swiggy reviews the packet.";
}

function asBoolean(value: unknown) {
  return value === true;
}

function checkpointDecision(input: SwiggySubmissionTimelineCheckpoint["inputs"]): SwiggySubmissionTimelineCheckpointDecision {
  if (!input.demoRecorded || !input.accessFormSubmitted || !input.handoffEmailSent) return "needs_operator_input";
  if (!input.dcrApproved || !input.stagingCredentialsIssued) return "await_swiggy_review";
  if (!input.stagingSoakComplete) return "ready_for_staging_soak";
  if (!input.productionApproved) return "await_production_approval";
  return "ready_for_production_promotion";
}

export function buildSwiggySubmissionTimelineCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
}): SwiggySubmissionTimelineCenter {
  const accessStudio = buildAccessSubmissionStudio(options);
  const builderPacket = buildBuilderPacketExport(options);
  const sandboxWorkbench = buildSandboxCredentialWorkbench(options.config);
  const showcaseSubmission = buildSwiggyShowcaseSubmissionCenter();
  const handoff = accessStudio.handoffState;
  const demoReady = Boolean(handoff.demoVideoUrl?.trim());
  const formSubmitted = Boolean(handoff.formSubmittedAt);
  const emailSent = Boolean(handoff.handoffEmailSentAt);
  const redirectReady = Boolean(handoff.productionRedirectUri?.trim().startsWith("https://"));
  const stagingReady = sandboxWorkbench.lanes.filter((lane) => lane.status === "ready").length;

  const phases = [
    phase({
      sequence: 1,
      id: "start_building_review",
      label: "Start Building review",
      officialAction: "Open Swiggy Builders docs and confirm the current MCP contract.",
      owner: "MealPilot",
      status: "ready",
      plannedWindow: "Day 0, before every submission run",
      entrypoint: "https://mcp.swiggy.com/builders/docs/",
      checklist: [
        "Review live Builders homepage and docs links.",
        "Confirm Food, Instamart, and Dineout remain mapped in Tool Lab.",
        "Refresh source intelligence and page mesh before sending the packet.",
      ],
      evidenceLinks: ["/api/swiggy-source-intelligence", "/api/swiggy-builders-page-mesh", "/api/swiggy-tool-parity-auditor"],
      nextAction: "Run production verification and packet export.",
    }),
    phase({
      sequence: 2,
      id: "local_packet_freeze",
      label: "Local packet freeze",
      officialAction: "Prepare proof artifacts before requesting access.",
      owner: "MealPilot",
      status: "ready",
      plannedWindow: "Day 0",
      entrypoint: "/api/builder-packet-export",
      checklist: [
        "Build, lint, test, production-smoke, visual-smoke, and export packet.",
        "Keep OpenAPI, screenshot manifest, and reviewer vault linked.",
        "Confirm packet has no bearer tokens, raw PII, or fake Swiggy approvals.",
      ],
      evidenceLinks: ["/api/builder-packet-export", "/api/reviewer-artifact-vault", "/api/visual-qa-center"],
      nextAction: "Record the 2-3 minute demo video and attach it to the access packet.",
    }),
    phase({
      sequence: 3,
      id: "demo_video_capture",
      label: "Demo video capture",
      officialAction: "Send Us a Demo requires an operator-owned demo artifact.",
      owner: "Operator",
      status: demoReady ? "ready" : "operator_input",
      plannedWindow: "Day 0",
      entrypoint: "/api/access-submission-studio",
      checklist: [
        "Record planner, Launch Center, confirmation gate, and builder-packet export.",
        "Show no automatic ordering, checkout, booking, form submission, or email sending.",
        "Paste the final demo URL into Access Submission Studio.",
      ],
      evidenceLinks: ["/api/demo-studio", "/api/swiggy-showcase-submission-center", "/api/access-submission-studio"],
      nextAction: demoReady ? "Use the saved demo URL in the access form and handoff email." : "Record the demo video and save its HTTPS URL.",
    }),
    phase({
      sequence: 4,
      id: "request_access_form",
      label: "Request access form",
      officialAction: "Submit the official Swiggy access request in the browser.",
      owner: "Operator",
      status: formSubmitted ? "ready" : "operator_input",
      plannedWindow: "Day 0 after demo recording",
      entrypoint: "https://mcp.swiggy.com/builders/access/",
      checklist: [
        "Choose the developer track unless Swiggy asks for the enterprise path.",
        "Paste prepared copy blocks and attach packet evidence.",
        "Mark form-submitted timestamp locally only after browser submission is complete.",
      ],
      evidenceLinks: ["/api/submission-console", "/api/swiggy-access-evidence-matrix", "/api/access-submission-studio"],
      nextAction: formSubmitted ? "Send the builders@swiggy.in handoff email." : "Open Request access and submit the prepared packet manually.",
    }),
    phase({
      sequence: 5,
      id: "send_demo_handoff",
      label: "Send demo handoff",
      officialAction: "Send the demo and packet context to builders@swiggy.in.",
      owner: "Operator",
      status: emailSent ? "ready" : "operator_input",
      plannedWindow: "Day 0 after form submission",
      entrypoint: "mailto:builders@swiggy.in",
      checklist: [
        "Use the generated handoff email subject and body.",
        "Include demo, GitHub, OpenAPI, builder packet, and verification summary links.",
        "Do not claim Powered by Swiggy placement until Swiggy approves it.",
      ],
      evidenceLinks: ["/api/swiggy-showcase-submission-center", "/api/production-launch-bundle", "/api/builder-packet-export.md"],
      nextAction: emailSent ? "Wait for Swiggy review and credential response." : "Send the handoff email from the operator mailbox.",
    }),
    phase({
      sequence: 6,
      id: "dynamic_client_registration",
      label: "Dynamic Client Registration",
      officialAction: "Register the OAuth client after Swiggy approval.",
      owner: "Joint",
      status: redirectReady && options.config.swiggyClientId !== "replace_after_builder_access" ? "ready" : "swiggy_gate",
      plannedWindow: "After Swiggy accepts the builder request",
      entrypoint: "/api/credential-onboarding",
      checklist: [
        "Use exact HTTPS redirect URI allowlisting.",
        "Preserve PKCE S256 and no-token-logging controls.",
        "Store issued client identifiers outside git and packet artifacts.",
      ],
      evidenceLinks: ["/api/credential-onboarding", "/api/swiggy-auth-lifecycle-center", "/api/sandbox-credential-workbench"],
      nextAction: "Wait for Swiggy client-registration approval and issued credentials.",
    }),
    phase({
      sequence: 7,
      id: "staging_credentials_and_seed",
      label: "Staging credentials and seed",
      officialAction: "Run first read-only calls and seeded data smoke after credentials arrive.",
      owner: "Joint",
      status: stagingReady >= 3 ? "ready" : "swiggy_gate",
      plannedWindow: "Days 1-2 after credentials",
      entrypoint: "/api/swiggy-staging-seed-smoke-center",
      checklist: [
        "Probe Food, Instamart, and Dineout read paths first.",
        "Run mutation refresh checks only after seeded fixtures are confirmed.",
        "Keep support payloads redacted and session-correlated.",
      ],
      evidenceLinks: ["/api/swiggy-staging-seed-smoke-center", "/api/staging-certification-matrix", "/api/mcp/handshake-doctor"],
      nextAction: "Wait for Swiggy staging credentials and seeded test data.",
    }),
    phase({
      sequence: 8,
      id: "production_promotion",
      label: "Production promotion",
      officialAction: "Promote after 48-hour soak, support readiness, and Swiggy approval.",
      owner: "Swiggy",
      status: "swiggy_gate",
      plannedWindow: "After 48-hour staging soak",
      entrypoint: "/api/production-launch-bundle",
      checklist: [
        "Attach soak summary, traffic plan, SLO incident plan, and rollback proof.",
        "Keep cohort ramp, rate limits, and support escalation visible.",
        "Request production credentials only after Swiggy signs off.",
      ],
      evidenceLinks: ["/api/production-launch-bundle", "/api/traffic-readiness-plan", "/api/slo-incident-command"],
      nextAction: "Wait for Swiggy production approval and production credentials.",
    }),
  ];

  const proofLinks = new Set(phases.flatMap((item) => item.evidenceLinks));
  const ready = phases.filter((item) => item.status === "ready").length;
  const operatorInputs = phases.filter((item) => item.status === "operator_input").length;
  const swiggyGates = phases.filter((item) => item.status === "swiggy_gate").length;
  const score = Math.round((phases.reduce((sum, item) => sum + statusWeight(item.status), 0) / phases.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    currentStage: phases.find((item) => item.status !== "ready")?.label ?? "Ready for Swiggy production approval",
    nextOperatorAction: firstOpenAction(phases),
    totals: {
      phases: phases.length,
      ready,
      operatorInputs,
      swiggyGates,
      officialActions: phases.length,
      proofLinks: proofLinks.size,
    },
    phases,
    dailyRunbook: [
      {
        day: "Day 0",
        focus: "Freeze proof and submit",
        actions: ["Run verification", "Record demo", "Submit access form", "Send handoff email"],
        proofLinks: ["/api/builder-packet-export", "/api/swiggy-showcase-submission-center", "/api/access-submission-studio"],
      },
      {
        day: "Day 1",
        focus: "Credential readiness",
        actions: ["Prepare DCR payload", "Confirm redirect URI", "Stage first read-only probes"],
        proofLinks: ["/api/credential-onboarding", "/api/swiggy-auth-lifecycle-center", "/api/staging-certification-matrix"],
      },
      {
        day: "Day 2",
        focus: "Staging soak and production request",
        actions: ["Run seeded smoke", "Attach traffic/SLO proof", "Request production promotion"],
        proofLinks: ["/api/swiggy-staging-seed-smoke-center", "/api/traffic-readiness-plan", "/api/production-launch-bundle"],
      },
    ],
    handoffPacket: {
      formTarget: "https://mcp.swiggy.com/builders/access/",
      demoTarget: "mailto:builders@swiggy.in",
      supportEmail: "builders@swiggy.in",
      packetLinks: [
        "/api/builder-packet-export",
        "/api/builder-packet-export.md",
        "/api/swiggy-showcase-submission-center",
        "/api/production-launch-bundle",
      ],
      safetyNote:
        "MealPilot prepares copy, evidence, links, and runbooks locally with no automatic external submission; browser form submission, email sending, credential issuance, co-branding, and production approval stay operator- or Swiggy-owned.",
    },
    assertions: [
      `Builder packet score is ${builderPacket.score} with ${builderPacket.totals.visualTargets} visual targets.`,
      `Access Studio readiness is ${accessStudio.submitReadinessLabel}.`,
      `Showcase packet has ${showcaseSubmission.totals.assets} assets and ${showcaseSubmission.totals.swiggyGates} Swiggy approval gate.`,
      "Every phase has an official entrypoint, proof links, explicit owner, and no automatic external submission.",
    ],
    externalGates: [
      "Official Swiggy access form submission must happen in the browser.",
      "builders@swiggy.in handoff email must be sent by the operator.",
      "Dynamic Client Registration, staging credentials, seeded data, co-branding, feature placement, and production credentials require Swiggy approval.",
    ],
  };
}

export function buildSwiggySubmissionTimelineCheckpoint(
  options: Parameters<typeof buildSwiggySubmissionTimelineCenter>[0] & {
    checkpoint: Partial<SwiggySubmissionTimelineCheckpoint["inputs"]>;
  },
): SwiggySubmissionTimelineCheckpoint {
  const center = buildSwiggySubmissionTimelineCenter(options);
  const inputs = {
    demoRecorded: asBoolean(options.checkpoint.demoRecorded),
    accessFormSubmitted: asBoolean(options.checkpoint.accessFormSubmitted),
    handoffEmailSent: asBoolean(options.checkpoint.handoffEmailSent),
    dcrApproved: asBoolean(options.checkpoint.dcrApproved),
    stagingCredentialsIssued: asBoolean(options.checkpoint.stagingCredentialsIssued),
    stagingSoakComplete: asBoolean(options.checkpoint.stagingSoakComplete),
    productionApproved: asBoolean(options.checkpoint.productionApproved),
  };
  const checkpointStatusByPhase = new Map<string, SwiggySubmissionTimelineStatus>([
    ["start_building_review", "ready"],
    ["local_packet_freeze", "ready"],
    ["demo_video_capture", inputs.demoRecorded ? "ready" : "operator_input"],
    ["request_access_form", inputs.accessFormSubmitted ? "ready" : "operator_input"],
    ["send_demo_handoff", inputs.handoffEmailSent ? "ready" : "operator_input"],
    ["dynamic_client_registration", inputs.dcrApproved ? "ready" : "swiggy_gate"],
    ["staging_credentials_and_seed", inputs.stagingCredentialsIssued ? "ready" : "swiggy_gate"],
    ["production_promotion", inputs.productionApproved ? "ready" : "swiggy_gate"],
  ]);
  const checklist = center.phases.map((timelinePhase) => {
    const status = checkpointStatusByPhase.get(timelinePhase.id) ?? timelinePhase.status;
    return {
      phaseId: timelinePhase.id,
      label: timelinePhase.label,
      owner: timelinePhase.owner,
      status,
      action:
        timelinePhase.id === "production_promotion" && inputs.stagingSoakComplete && !inputs.productionApproved
          ? "Attach soak summary and request production promotion from Swiggy."
          : timelinePhase.nextAction,
      evidenceLinks: timelinePhase.evidenceLinks,
    };
  });
  const decision = checkpointDecision(inputs);
  const current = checklist.find((item) => item.status !== "ready") ?? checklist.at(-1);
  const readyCount = checklist.filter((item) => item.status === "ready").length;
  const missingOperatorActions = checklist
    .filter((item) => item.status === "operator_input")
    .map((item) => `${item.label}: ${item.action}`);
  const swiggyGates = checklist
    .filter((item) => item.status === "swiggy_gate")
    .map((item) => `${item.label}: ${item.action}`);
  const proofLinks = Array.from(new Set(checklist.flatMap((item) => item.evidenceLinks))).slice(0, 24);

  return {
    generatedAt: new Date().toISOString(),
    decision,
    readinessScore: Math.round((readyCount / checklist.length) * 100),
    currentPhaseId: current?.phaseId ?? "production_promotion",
    currentStage: current?.label ?? "Production promotion",
    nextAction:
      missingOperatorActions[0] ??
      swiggyGates[0] ??
      (decision === "ready_for_staging_soak"
        ? "Run staging seed smoke, attach telemetry, and complete the 48-hour soak."
        : "Attach final launch evidence and coordinate production promotion with Swiggy."),
    inputs,
    checklist,
    missingOperatorActions,
    swiggyGates,
    proofLinks,
    assertions: [
      "The checkpoint is a local readiness assessment and never submits the Swiggy form, sends email, registers DCR, or promotes production.",
      "Operator-owned actions and Swiggy-owned gates remain separate even when earlier timeline phases are complete.",
      ...center.assertions.slice(0, 2),
    ],
    externalGates: center.externalGates,
  };
}
