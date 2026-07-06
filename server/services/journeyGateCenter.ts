import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  MealPlan,
  McpServerCoverage,
  SwiggyBuildersJourneyGate,
  SwiggyBuildersJourneyGateCenter,
  SwiggyBuildersJourneyGateStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildSwiggyConversionCenter } from "./conversionCenter.js";
import { buildSwiggyBuildersModuleIntelligenceCenter } from "./moduleIntelligence.js";
import { buildSwiggySubmissionTimelineCenter } from "./submissionTimelineCenter.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/start/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/llms-full.txt",
];

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

function statusWeight(status: SwiggyBuildersJourneyGateStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.84;
  if (status === "operator_gate") return 0.82;
  return 0.72;
}

function gate(input: SwiggyBuildersJourneyGate): SwiggyBuildersJourneyGate {
  return input;
}

export function buildSwiggyBuildersJourneyGateCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
}): SwiggyBuildersJourneyGateCenter {
  const handoffState = options.handoffState ?? emptyHandoffState;
  const timeline = buildSwiggySubmissionTimelineCenter({
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
  const accessStudio = buildAccessSubmissionStudio({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.latestPlan,
    handoffState,
  });
  const moduleIntelligence = buildSwiggyBuildersModuleIntelligenceCenter();

  const gates = [
    gate({
      id: "start_building",
      sequence: 1,
      officialStep: "Start Building",
      sourceSignal: "Builders homepage routes makers into docs, first calls, and MCP tool exploration before access review.",
      owner: "MealPilot",
      status: "ready",
      entryCriteria: [
        "Live Builders source, llms.txt, and llms-full.txt are linked in the local source loop.",
        "MealPilot app, Express API, and mock MCP gateway are runnable locally.",
        "Food, Instamart, and Dineout tool contracts are visible before any mutation is attempted.",
        "Developer quickstart, Tool Lab, and first-call drills are available without production credentials.",
      ],
      exitCriteria: [
        "Build, lint, unit tests, production verifier, and visual QA are green.",
        "MCP catalog and local server coverage remain reconciled with the current 35-tool contract.",
        "Every commercial route keeps readbacks and explicit confirmation boundaries.",
        "Module Intelligence has mapped the public website modules into proof surfaces.",
      ],
      localAutomation: [
        "Run Developer Quickstart and Tool Lab smoke flows.",
        "Compile route contracts and scenario runner evidence.",
        "Refresh Module Intelligence when the live Builders page changes.",
      ],
      proofLinks: [
        "/api/swiggy-developer-quickstart",
        "/api/mcp/tool-lab",
        "/api/mcp/tool-contract-matrix",
        "/api/mcp/scenario-runner",
        "/api/swiggy-builders-module-intelligence",
      ],
      telemetryLinks: ["/api/observability", "/api/mcp/replay", "/api/evaluation-lab"],
      blockerResolution: [
        "If docs drift, refresh Website Atlas, Site Parity, and Module Intelligence before changing product copy.",
        "If an MCP route fails, keep the failing path in mock evidence and do not promote it as production-ready.",
      ],
      riskBoundary: "Do not treat local mock success as Swiggy production access or credential approval.",
      nextAction: "Keep this gate green while deeper access, review, and go-live gates remain explicit.",
      linkedTimelinePhaseIds: ["source_sync", "local_build"],
      linkedConversionStepIds: ["start_building", "see_possible", "llms_txt", "llms_full"],
    }),
    gate({
      id: "apply_prod_access",
      sequence: 2,
      officialStep: "Apply for Prod Access",
      sourceSignal: "Builders access flow asks operators to request production access only after the app and proof packet are ready.",
      owner: "Operator",
      status: accessStudio.canSubmitNow ? "watch" : "operator_gate",
      entryCriteria: [
        "Demo URL, GitHub repository, technical contact, redirect URI, egress IP, and environment summary are prepared.",
        "Access Evidence Matrix, Access Dossier, and Submission Console expose the exact copy and attachment set.",
        "Terms acknowledgement and required Swiggy form fields are reviewed by the operator.",
        "Builder packet export contains launch artifacts, screenshots, safety boundaries, and reviewer commands.",
      ],
      exitCriteria: [
        "Operator submits the official access form in the browser.",
        "Operator sends or records the demo handoff through their own mail client.",
        "Submission timestamp and Swiggy acknowledgement are captured back into MealPilot.",
        "No local automation auto-submits forms, accepts terms, or sends external email.",
      ],
      localAutomation: [
        "Prepare access copy blocks and required attachment checklist.",
        "Generate the builder packet export and reviewer artifact vault.",
        "Draft but never send the builders@swiggy.in handoff.",
      ],
      proofLinks: [
        "/api/access-submission-studio",
        "/api/swiggy-access-evidence-matrix",
        "/api/swiggy-access-dossier",
        "/api/submission-console",
        "/api/builder-packet-export",
      ],
      telemetryLinks: ["/api/audit-ledger", "/api/compliance-evidence"],
      blockerResolution: [
        "If contact, redirect URI, static IP, or environment copy is missing, keep the gate operator-owned.",
        "If legal terms are not acknowledged, keep the form blocked and preserve the evidence packet locally.",
      ],
      riskBoundary: "Forms, email, terms, and production access requests remain external operator actions.",
      nextAction: accessStudio.canSubmitNow
        ? "Operator can review the prepared packet, then submit the official access flow manually."
        : "Complete the remaining handoff fields before asking Swiggy for production access.",
      linkedTimelinePhaseIds: ["access_packet", "submit_access_request"],
      linkedConversionStepIds: ["request_access", "builders_email"],
    }),
    gate({
      id: "quick_review",
      sequence: 3,
      officialStep: "Quick Review",
      sourceSignal: "Swiggy reviews the build, compliance posture, and production evidence before issuing live access.",
      owner: "Swiggy",
      status: "swiggy_gate",
      entryCriteria: [
        "Reviewer Artifact Vault, Production Launch Bundle, and Data Governance Center are ready.",
        "Brand Compliance, FAQ policy, and safety docs define what MealPilot will and will not claim.",
        "Module Intelligence and Submission Timeline show every source, proof, and owner gate.",
        "Evidence is redacted, reproducible, and tied to local commands.",
      ],
      exitCriteria: [
        "Swiggy approves the application or returns explicit reviewer feedback.",
        "Credential scope, quota, branding, and commercial constraints are documented.",
        "Any requested changes are re-run through build, tests, verifier, and visual QA.",
        "Operator captures the review outcome before staging or production claims change.",
      ],
      localAutomation: [
        "Keep reviewer artifacts, launch bundle, and proof report current.",
        "Run production verifier and visual QA before each review packet update.",
        "Route reviewer questions through FAQ Resolution Center and Partner Support Room.",
      ],
      proofLinks: [
        "/api/reviewer-artifact-vault",
        "/api/production-launch-bundle",
        "/api/data-governance-center",
        "/api/brand-compliance-kit",
        "/api/swiggy-faq-resolution-center",
      ],
      telemetryLinks: ["/api/production-readiness", "/api/version-monitor", "/api/error-intelligence"],
      blockerResolution: [
        "If Swiggy asks for evidence, attach the specific proof link rather than broad screenshots.",
        "If a claim needs legal, quota, or brand approval, move it to an external Swiggy gate.",
      ],
      riskBoundary: "Do not claim approval, co-branding, quotas, or production readiness before Swiggy review completes.",
      nextAction: "Wait for Swiggy feedback, then convert any review note into a tracked MealPilot proof update.",
      linkedTimelinePhaseIds: ["review_packet", "quick_review"],
      linkedConversionStepIds: ["go_live_review"],
    }),
    gate({
      id: "go_live",
      sequence: 4,
      officialStep: "Go Live",
      sourceSignal: "Production launch requires approved credentials, staging proof, live signal calibration, and rollback evidence.",
      owner: "Swiggy",
      status: "swiggy_gate",
      entryCriteria: [
        "Swiggy has issued production credentials and approved required scopes.",
        "Credential Handoff Center and Credential Vault Center show redacted, operator-owned setup state.",
        "Staging Certification Matrix and Staging Cutover Rehearsal are green for 48 hours.",
        "Live Signal Calibration, Load Lab, and Backpressure Governor define promotion thresholds.",
      ],
      exitCriteria: [
        "Production credentials are installed through the approved secret path.",
        "Smoke, staging, launch, and rollback commands pass without hidden commercial execution.",
        "Monitoring, incident report, and support routing are active.",
        "Operator and Swiggy agree the app can serve live traffic.",
      ],
      localAutomation: [
        "Run staging certification, cutover rehearsal, live signal calibration, and production launch bundle checks.",
        "Keep credential evidence redacted and never serialize secret values into packets.",
        "Record every launch command and rollback gate for reviewer replay.",
      ],
      proofLinks: [
        "/api/swiggy-credential-handoff-center",
        "/api/swiggy-credential-vault-center",
        "/api/staging-certification-matrix",
        "/api/swiggy-live-signal-calibration",
        "/api/mcp/staging-cutover",
        "/api/production-launch-bundle",
      ],
      telemetryLinks: ["/api/ops", "/api/swiggy-load-lab", "/api/mcp/backpressure-governor", "/api/incident-report"],
      blockerResolution: [
        "If credentials are missing or scope-limited, stay in staging and keep public launch claims disabled.",
        "If live metrics drift, trip the rollback runbook before adding new user traffic.",
      ],
      riskBoundary: "Credentials, production traffic, quotas, and final live approval remain Swiggy-owned gates.",
      nextAction: "Hold this gate until credentials, staging evidence, monitoring, and rollback readiness are all approved.",
      linkedTimelinePhaseIds: ["staging_certification", "go_live"],
      linkedConversionStepIds: ["go_live_review"],
    }),
    gate({
      id: "show_built",
      sequence: 5,
      officialStep: "Show Us What You Built",
      sourceSignal: "Builders asks teams to share demos, product narratives, and showcase-ready proof after the build is real.",
      owner: "Operator",
      status: "operator_gate",
      entryCriteria: [
        "Showcase Submission Center, Demo Evidence Director, and Talent Signal Center are prepared.",
        "Conversion Center and Launch Story map the final CTA into a safe demo handoff.",
        "Visual QA screenshots, builder packet export, and reviewer artifact vault are refreshed.",
        "Metrics, story, and co-marketing claims are separated from Swiggy-owned approvals.",
      ],
      exitCriteria: [
        "Operator records or attaches the approved demo video.",
        "Operator sends the showcase email or demo submission manually.",
        "Any Swiggy showcase, hiring, co-marketing, or ecosystem response is captured as external feedback.",
        "MealPilot avoids using Swiggy marks or partnership claims without approval.",
      ],
      localAutomation: [
        "Assemble demo scenes, proof links, artifact vault entries, and final CTA copy.",
        "Generate the handoff email body for operator review.",
        "Keep the Launch Story and Conversion Center aligned to the public Builders CTA.",
      ],
      proofLinks: [
        "/api/swiggy-showcase-submission-center",
        "/api/swiggy-demo-evidence-director",
        "/api/swiggy-talent-signal-center",
        "/api/swiggy-conversion-center",
        "/api/swiggy-builders-launch-story",
      ],
      telemetryLinks: ["/api/demo-studio", "/api/reviewer-proof"],
      blockerResolution: [
        "If demo video is missing, keep the mailto or showcase action operator-owned.",
        "If co-marketing language is not approved, downgrade the claim to a neutral product proof statement.",
      ],
      riskBoundary: "Demo submission, showcase approval, co-marketing, and public Swiggy claims are not automated.",
      nextAction: "Operator reviews the final demo packet and sends it manually when the build evidence is complete.",
      linkedTimelinePhaseIds: ["showcase_followup", "partner_success"],
      linkedConversionStepIds: ["send_demo", "builders_email"],
    }),
  ];

  const proofLinks = unique(gates.flatMap((item) => item.proofLinks));
  const telemetryLinks = unique(gates.flatMap((item) => item.telemetryLinks));
  const score = Math.round((gates.reduce((sum, item) => sum + statusWeight(item.status), 0) / gates.length) * 100);
  const currentGate = gates.find((item) => item.status === "operator_gate")?.officialStep ?? gates[0].officialStep;

  return {
    generatedAt: new Date().toISOString(),
    score,
    currentGate,
    officialSources: unique([...officialSources, ...timeline.officialSources, ...conversion.officialSources, ...moduleIntelligence.officialSources]),
    totals: {
      gates: gates.length,
      ready: gates.filter((item) => item.status === "ready").length,
      watch: gates.filter((item) => item.status === "watch").length,
      operatorGates: gates.filter((item) => item.status === "operator_gate").length,
      swiggyGates: gates.filter((item) => item.status === "swiggy_gate").length,
      entryCriteria: gates.reduce((sum, item) => sum + item.entryCriteria.length, 0),
      exitCriteria: gates.reduce((sum, item) => sum + item.exitCriteria.length, 0),
      proofLinks: proofLinks.length,
      telemetryLinks: telemetryLinks.length,
    },
    gates,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Start Building proof",
        action: "Run local build, Tool Lab, first-call drills, and Module Intelligence before touching the access form.",
        proofLinks: ["/api/swiggy-developer-quickstart", "/api/mcp/tool-lab", "/api/swiggy-builders-module-intelligence"],
      },
      {
        sequence: 2,
        label: "Apply for prod access",
        action: "Use Access Submission Studio and Builder Packet Export, then manually complete the official access form.",
        proofLinks: ["/api/access-submission-studio", "/api/builder-packet-export", "/api/submission-console"],
      },
      {
        sequence: 3,
        label: "Quick review",
        action: "Send reviewers to the artifact vault, launch bundle, governance evidence, and explicit external gates.",
        proofLinks: ["/api/reviewer-artifact-vault", "/api/production-launch-bundle", "/api/data-governance-center"],
      },
      {
        sequence: 4,
        label: "Go live",
        action: "Wait for Swiggy credentials, then run staging certification, cutover, live signal, and rollback checks.",
        proofLinks: ["/api/staging-certification-matrix", "/api/mcp/staging-cutover", "/api/swiggy-live-signal-calibration"],
      },
      {
        sequence: 5,
        label: "Show what was built",
        action: "Use the demo packet and showcase surfaces, then let the operator send the final demo email manually.",
        proofLinks: ["/api/swiggy-demo-evidence-director", "/api/swiggy-showcase-submission-center", "/api/swiggy-conversion-center"],
      },
    ],
    readinessMap: gates.map((item) => ({
      gateId: item.id,
      label: item.officialStep,
      status: item.status,
      evidence: `${item.proofLinks.length} proof links and ${item.entryCriteria.length + item.exitCriteria.length} criteria mapped.`,
    })),
    assertions: [
      `The official five-step Builders journey is represented as ${gates.length} explicit MealPilot gates.`,
      `${timeline.totals.phases} submission timeline phases, ${conversion.totals.steps} conversion steps, and ${moduleIntelligence.totals.modules} website modules feed this control room.`,
      "Local automation prepares proof, copy, telemetry, and runbooks; it never submits forms, sends email, accepts terms, or claims approval.",
      "Every Swiggy-owned credential, quota, brand, review, production, and showcase decision remains externally gated.",
    ],
    externalGates: [
      "Official production access form submission",
      "builders@swiggy.in email send",
      "Legal terms acknowledgement",
      "Swiggy quick review and reviewer feedback",
      "Production credentials and scope approval",
      "Quota, co-branding, showcase, and public partnership claims",
    ],
  };
}
