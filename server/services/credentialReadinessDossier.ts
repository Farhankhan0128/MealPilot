import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  SwiggyCredentialReadinessDossier,
  SwiggyCredentialIssuanceState,
  SwiggyCredentialReadinessOwner,
  SwiggyCredentialReadinessReceiptItem,
  SwiggyCredentialReadinessRehearsal,
  SwiggyCredentialReadinessRehearsalMode,
  SwiggyCredentialReadinessSourceSignal,
  SwiggyCredentialReadinessStage,
  SwiggyCredentialReadinessStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { defaultAccessSubmissionState } from "../store/sessionStore.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildCredentialOnboardingReport } from "./credentialOnboarding.js";
import { buildSwiggyCredentialVaultCenter } from "./credentialVaultCenter.js";
import { buildSandboxCredentialWorkbench } from "./sandboxCredentialWorkbench.js";
import { buildStagingCertificationMatrix } from "./stagingCertification.js";
import { buildSwiggySourceFreezeDiff } from "./sourceFreezeDiff.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/llms.txt",
];

function statusWeight(status: SwiggyCredentialReadinessStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.82;
  if (status === "swiggy_gate") return 0.7;
  return 0.2;
}

function stage(input: SwiggyCredentialReadinessStage): SwiggyCredentialReadinessStage {
  return input;
}

function receipt(
  id: string,
  label: string,
  owner: SwiggyCredentialReadinessOwner,
  status: SwiggyCredentialReadinessStatus,
  safeValue: string,
  requiredBefore: SwiggyCredentialReadinessReceiptItem["requiredBefore"],
): SwiggyCredentialReadinessReceiptItem {
  return { id, label, owner, status, safeValue, requiredBefore };
}

function isFilled(value: string | undefined) {
  return Boolean(value?.trim());
}

function buildSourceSignals(
  manifestToolPages: number,
  sourceFreezeDecision: string,
): SwiggyCredentialReadinessSourceSignal[] {
  return [
    {
      id: "homepage_servers",
      label: "Public server count",
      source: "https://mcp.swiggy.com/builders/",
      publicSignal: "Homepage presents 3 MCP Servers for Food, Instamart, and Dineout.",
      mealPilotInterpretation: "Credential requests must keep all three servers in one coherent access packet.",
      status: "ready",
    },
    {
      id: "homepage_tools",
      label: "Homepage API tool promise",
      source: "https://mcp.swiggy.com/builders/",
      publicSignal: "Homepage currently markets 18+ API Tools.",
      mealPilotInterpretation:
        "Use the homepage promise for public positioning, then use llms.txt and reference pages for detailed certification.",
      status: "ready",
    },
    {
      id: "manifest_reference",
      label: "Reference manifest coverage",
      source: "https://mcp.swiggy.com/builders/llms.txt",
      publicSignal: `Local source parity tracks ${manifestToolPages} manifest-backed tool pages.`,
      mealPilotInterpretation:
        "Certification remains broader than homepage copy because the reviewer packet validates each reference tool page.",
      status: manifestToolPages >= 35 ? "ready" : "operator_input",
    },
    {
      id: "source_freeze",
      label: "Source freeze before follow-up",
      source: "/api/swiggy-source-freeze-diff",
      publicSignal: `Latest local source-freeze decision is ${sourceFreezeDecision.replaceAll("_", " ")}.`,
      mealPilotInterpretation: "Re-browse the public source before sending any credential follow-up or demo packet.",
      status: sourceFreezeDecision === "frozen" ? "ready" : "operator_input",
    },
  ];
}

export async function buildSwiggyCredentialReadinessDossier(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
  credentialIssuance?: SwiggyCredentialIssuanceState;
}): Promise<SwiggyCredentialReadinessDossier> {
  const handoffState = { ...defaultAccessSubmissionState(), ...(options.handoffState ?? {}) };
  const credentialIssuance = options.credentialIssuance;
  const runtimeConfig = options.config;
  const accessStudio = buildAccessSubmissionStudio({
    ...options,
    handoffState,
  });
  const onboarding = buildCredentialOnboardingReport(runtimeConfig);
  const vault = buildSwiggyCredentialVaultCenter(runtimeConfig);
  const sandbox = buildSandboxCredentialWorkbench(runtimeConfig);
  const certification = buildStagingCertificationMatrix(runtimeConfig);
  const hasStagingRuntime = runtimeConfig.swiggyMode === "staging" || runtimeConfig.swiggyMode === "production";
  const hasAccessToken = vault.secrets.some((secretItem) => secretItem.id === "access_token" && secretItem.configured);
  const seededServerCount = Object.values(credentialIssuance?.seededUsersReceived ?? {}).filter(Boolean).length;
  const allSeededUsersReceived = seededServerCount === 3;
  const base = `http://localhost:${runtimeConfig.port}`;
  const manifestToolPages = certification.totalTools;
  const sourceFreeze = await buildSwiggySourceFreezeDiff({
    config: runtimeConfig,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.latestPlan,
    handoffState,
    mode: "pre_access_submission",
    includeLivePageMesh: true,
    includeLlmsManifest: true,
    includeAccessPacket: true,
    includeBrowserRebrowse: true,
  });
  const sourceSignals = buildSourceSignals(manifestToolPages, sourceFreeze.decision);

  const stages = [
    stage({
      id: "source_freeze",
      sequence: 1,
      label: "Freeze public source evidence",
      owner: "MealPilot",
      status: sourceFreeze.decision === "ready_to_freeze" ? "ready" : "operator_input",
      evidenceLinks: ["/api/swiggy-source-freeze-diff", "/api/swiggy-source-intelligence"],
      proof: `${sourceFreeze.score}/100 source-freeze score with ${sourceFreeze.missingInputs.length} missing input(s).`,
      nextAction: "Re-browse Builders, rerun the freeze diff, and attach the latest source snapshot before follow-up.",
    }),
    stage({
      id: "access_receipt",
      sequence: 2,
      label: "Access packet receipt",
      owner: "Operator",
      status: handoffState.formSubmittedAt && handoffState.handoffEmailSentAt ? "ready" : "operator_input",
      evidenceLinks: ["/api/access-submission-studio", "/api/builder-packet-export"],
      proof: accessStudio.submitReadinessLabel,
      nextAction: "Save form submission and handoff-email timestamps after the operator sends the packet.",
    }),
    stage({
      id: "dcr_receipt",
      sequence: 3,
      label: "DCR client receipt",
      owner: "Swiggy",
      status: credentialIssuance?.dcrApprovedAt && credentialIssuance.clientIdConfigured ? "ready" : "swiggy_gate",
      evidenceLinks: ["/api/credential-onboarding", "/api/auth/swiggy/status"],
      proof: credentialIssuance?.dcrApprovedAt
        ? `DCR approved at ${credentialIssuance.dcrApprovedAt}; client id configured=${credentialIssuance.clientIdConfigured}.`
        : onboarding.dynamicClientRegistration.mode.replaceAll("_", " "),
      nextAction: "When Swiggy confirms client identity or DCR approval, store only redacted client metadata in the vault.",
    }),
    stage({
      id: "secret_receipt",
      sequence: 4,
      label: "Credential vault receipt",
      owner: "Operator",
      status: hasAccessToken && credentialIssuance?.tokenExpiryRecorded ? "ready" : "operator_input",
      evidenceLinks: ["/api/swiggy-credential-vault-center", "/api/mcp-gateway"],
      proof: `${vault.totals.configured}/${vault.totals.secrets} runtime credential slots configured; token expiry recorded=${Boolean(credentialIssuance?.tokenExpiryRecorded)}.`,
      nextAction: "Store issued staging token, expiry, client id, redirect URI, and environment in managed secrets.",
    }),
    stage({
      id: "seeded_staging",
      sequence: 5,
      label: "Seeded staging receipt",
      owner: "Swiggy",
      status: hasStagingRuntime && allSeededUsersReceived && credentialIssuance?.firstReadProbeReady ? "ready" : "swiggy_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/swiggy-staging-credential-drill"],
      proof: `${seededServerCount}/${sandbox.seededDataPlan.length} seeded server receipts; first-read probe ready=${Boolean(credentialIssuance?.firstReadProbeReady)}.`,
      nextAction: "Ask Swiggy for seeded Food, Instamart, and Dineout identities before any mutation smoke.",
    }),
    stage({
      id: "production_promotion",
      sequence: 6,
      label: "Production promotion receipt",
      owner: "Swiggy",
      status: runtimeConfig.swiggyMode === "production" ? "operator_input" : "swiggy_gate",
      evidenceLinks: ["/api/staging-certification-matrix", "/api/production-launch-bundle"],
      proof: `${certification.assignedTools}/${certification.totalTools} tools assigned with ${certification.soakHoursRequired}h soak.`,
      nextAction: "Attach green staging telemetry, support packet, and rollout plan when requesting production credentials.",
    }),
  ];

  const receiptChecklist = [
    receipt(
      "form_submission_timestamp",
      "Official access form timestamp",
      "Operator",
      handoffState.formSubmittedAt ? "ready" : "operator_input",
      handoffState.formSubmittedAt ?? "not saved",
      "access_followup",
    ),
    receipt(
      "handoff_email_timestamp",
      "builders@swiggy.in handoff timestamp",
      "Operator",
      handoffState.handoffEmailSentAt ? "ready" : "operator_input",
      handoffState.handoffEmailSentAt ?? "not saved",
      "access_followup",
    ),
    receipt(
      "production_redirect_uri",
      "Production redirect URI",
      "Operator",
      handoffState.productionRedirectUri.startsWith("https://") ? "ready" : "operator_input",
      handoffState.productionRedirectUri || "HTTPS callback pending",
      "staging_smoke",
    ),
    receipt(
      "technical_contact",
      "Technical/security contact",
      "Operator",
      isFilled(handoffState.technicalContactEmail) ? "ready" : "operator_input",
      handoffState.technicalContactEmail || "contact pending",
      "access_followup",
    ),
    receipt(
      "dcr_approved_at",
      "DCR approval timestamp",
      "Swiggy",
      credentialIssuance?.dcrApprovedAt ? "ready" : "swiggy_gate",
      credentialIssuance?.dcrApprovedAt ?? "awaiting Swiggy DCR approval",
      "staging_smoke",
    ),
    receipt(
      "client_id_configured",
      "Client id configured",
      "Operator",
      credentialIssuance?.clientIdConfigured ? "ready" : "operator_input",
      credentialIssuance?.clientIdConfigured ? "configured without exposing value" : "not configured",
      "staging_smoke",
    ),
    receipt(
      "staging_token",
      "Staging bearer token",
      "Swiggy",
      hasAccessToken && Boolean(credentialIssuance?.stagingCredentialsIssuedAt) ? "ready" : "swiggy_gate",
      hasAccessToken ? "configured and redacted" : "awaiting Swiggy-issued credential",
      "staging_smoke",
    ),
    receipt(
      "seeded_identities",
      "Seeded Food, Instamart, and Dineout identities",
      "Swiggy",
      allSeededUsersReceived ? "ready" : "swiggy_gate",
      allSeededUsersReceived ? "all seeded receipts saved without raw PII" : `${seededServerCount}/3 seeded server receipts saved`,
      "staging_smoke",
    ),
    receipt(
      "support_thread",
      "Swiggy support thread id",
      "Operator",
      isFilled(credentialIssuance?.supportThreadId) ? "ready" : "operator_input",
      credentialIssuance?.supportThreadId || "support thread pending",
      "access_followup",
    ),
    receipt(
      "first_read_probe_ready",
      "First read probe ready",
      "MealPilot",
      credentialIssuance?.firstReadProbeReady ? "ready" : "operator_input",
      credentialIssuance?.firstReadProbeReady ? "read-only probe checklist ready" : "first-read probe not marked ready",
      "staging_smoke",
    ),
    receipt(
      "production_credentials",
      "Production credentials and go-live approval",
      "Swiggy",
      runtimeConfig.swiggyMode === "production" ? "operator_input" : "swiggy_gate",
      runtimeConfig.swiggyMode === "production" ? "production mode configured" : "awaiting approval after 48-hour soak",
      "production_promotion",
    ),
  ];

  const proofCommands = [
    {
      id: "source_freeze",
      command: `curl -fsS ${base}/api/swiggy-source-freeze-diff`,
      proves: "Public Builders source, llms manifest, access packet, and browser re-browse gates are current.",
    },
    {
      id: "access_studio",
      command: `curl -fsS ${base}/api/access-submission-studio`,
      proves: "Access form copy blocks, proof attachments, runbook, and handoff state are ready.",
    },
    {
      id: "credential_dossier",
      command: `curl -fsS ${base}/api/swiggy-credential-readiness-dossier`,
      proves: "Credential receipt checklist joins source freeze, access submission, DCR, vault, staging, and production gates.",
    },
    {
      id: "credential_handoff",
      command: `curl -fsS ${base}/api/swiggy-credential-handoff-center`,
      proves: "Owner-assigned localhost-to-production credential phases and controls remain visible.",
    },
    {
      id: "production_verifier",
      command: "npm run verify:production && npm run export:builder-packet",
      proves: "Reviewer packet and production smoke are green before sending the credential follow-up.",
    },
  ];

  const statusItems = [
    ...sourceSignals.map((item) => item.status),
    ...stages.map((item) => item.status),
    ...receiptChecklist.map((item) => item.status),
  ];
  const score = Math.round((statusItems.reduce((sum, status) => sum + statusWeight(status), 0) / statusItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    mode: runtimeConfig.swiggyMode,
    score,
    officialSources,
    publicSourceSnapshot: {
      buildersServers: 3,
      homepageApiToolsLabel: "18+ API Tools",
      manifestToolPages,
      interpretation:
        "Treat homepage counts as public positioning and llms/reference coverage as the certification ledger for credential readiness.",
    },
    totals: {
      stages: stages.length,
      readyStages: stages.filter((item) => item.status === "ready").length,
      receiptItems: receiptChecklist.length,
      readyReceiptItems: receiptChecklist.filter((item) => item.status === "ready").length,
      swiggyGates: [...stages, ...receiptChecklist].filter((item) => item.status === "swiggy_gate").length,
      operatorInputs: [...stages, ...receiptChecklist].filter((item) => item.status === "operator_input").length,
      proofCommands: proofCommands.length,
    },
    sourceSignals,
    stages,
    receiptChecklist,
    proofCommands,
    reviewerNarrative:
      "MealPilot has the local access packet, source freeze, DCR preview, vault posture, sandbox plan, and 35-tool certification map ready; live credentials, seeded identities, and production approval remain Swiggy-owned gates.",
    assertions: [
      "The dossier separates public homepage counts from llms/reference tool certification so source drift is visible.",
      "Credential receipt fields are redacted status fields only; no full token, auth code, PKCE verifier, or raw user payload is returned.",
      "Every post-access step has an owner, proof command, and next action before staging or production traffic can run.",
      "MealPilot can rehearse the credential receipt workflow locally without creating Swiggy external state.",
    ],
    externalGates: [
      "Operator must submit the official access form and send the builders@swiggy.in follow-up.",
      "Swiggy must issue DCR/client identity, staging credentials, and seeded users.",
      "Swiggy must approve production credentials after green staging evidence and support readiness.",
    ],
  };
}

export function rehearseSwiggyCredentialReadiness(input: {
  dossier: SwiggyCredentialReadinessDossier;
  mode: SwiggyCredentialReadinessRehearsalMode;
  includeSourceFreeze: boolean;
  includeCredentialReceipt: boolean;
  includeProductionPromotion: boolean;
}): SwiggyCredentialReadinessRehearsal {
  const selectedStages = input.dossier.stages.filter((stageItem) => {
    if (stageItem.id === "source_freeze") return input.includeSourceFreeze;
    if (stageItem.id === "production_promotion") return input.includeProductionPromotion;
    if (input.mode === "access_packet_sent") {
      return ["access_receipt", "dcr_receipt"].includes(stageItem.id);
    }
    if (input.mode === "staging_credentials_issued") {
      return ["access_receipt", "dcr_receipt", "secret_receipt", "seeded_staging"].includes(stageItem.id);
    }
    return true;
  });
  const receiptChecklist = input.includeCredentialReceipt
    ? input.dossier.receiptChecklist.filter((item) => {
        if (input.mode === "access_packet_sent") return item.requiredBefore === "access_followup";
        if (input.mode === "staging_credentials_issued") return item.requiredBefore !== "production_promotion";
        return true;
      })
    : [];
  const commands = input.dossier.proofCommands
    .filter((command) => {
      if (command.id === "source_freeze") return input.includeSourceFreeze;
      if (command.id === "credential_handoff") return input.includeCredentialReceipt;
      if (command.id === "production_verifier") return input.includeProductionPromotion || input.mode !== "access_packet_sent";
      return true;
    })
    .map(({ command, proves }) => ({ command, proves }));
  const missingInputs = [
    ...selectedStages
      .filter((stageItem) => stageItem.status !== "ready")
      .map((stageItem) => `${stageItem.label}: ${stageItem.nextAction}`),
    ...receiptChecklist
      .filter((item) => item.status !== "ready")
      .map((item) => `${item.label}: ${item.safeValue}`),
  ];
  const swiggyBlocked = [...selectedStages, ...receiptChecklist].some((item) => item.status === "swiggy_gate");
  const decision = swiggyBlocked
    ? "blocked_on_swiggy_credentials"
    : input.mode === "access_packet_sent"
      ? "ready_for_credential_followup"
      : "ready_for_staging_receipt";
  const scoreItems = [...selectedStages.map((item) => item.status), ...receiptChecklist.map((item) => item.status)];
  const readinessScore =
    scoreItems.length === 0
      ? input.dossier.score
      : Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    mode: input.mode,
    decision,
    readinessScore,
    includeSourceFreeze: input.includeSourceFreeze,
    includeCredentialReceipt: input.includeCredentialReceipt,
    includeProductionPromotion: input.includeProductionPromotion,
    selectedStages,
    receiptChecklist,
    commands,
    missingInputs,
    telemetry: [
      { field: "mode", value: input.mode, redaction: "safe rehearsal mode" },
      { field: "decision", value: decision, redaction: "safe credential-readiness decision" },
      { field: "receipt_items", value: String(receiptChecklist.length), redaction: "counts only" },
      { field: "missing_inputs", value: String(missingInputs.length), redaction: "counts only" },
    ],
    nextAction:
      decision === "blocked_on_swiggy_credentials"
        ? "Send the credential follow-up packet, then wait for Swiggy-issued staging credentials and seeded users."
        : input.mode === "access_packet_sent"
          ? "Send the redacted follow-up with source freeze, access receipt, DCR preview, and proof commands."
          : "Store issued credentials in the vault, run read-only staging probes, then start seeded smoke waves.",
    assertions: [
      "This rehearsal produces local operator instructions only and does not submit forms, send email, register clients, or call Swiggy staging.",
      "No secret material is included; receipt values are redacted status fields or operator-owned timestamps.",
      "Commercial Food, Instamart, and Dineout actions remain blocked until credentialed staging and explicit confirmation gates pass.",
    ],
  };
}
