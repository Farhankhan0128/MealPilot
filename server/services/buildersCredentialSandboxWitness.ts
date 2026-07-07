import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  SwiggyAuthStatusReport,
  SwiggyBuildersCredentialSandboxWitness,
  SwiggyBuildersCredentialSandboxWitnessGroup,
  SwiggyBuildersCredentialSandboxWitnessRow,
  SwiggyBuildersCredentialSandboxWitnessStatus,
  SwiggyCredentialIssuanceState,
  UserProfile,
} from "../../src/domain/types.js";
import { buildCredentialOnboardingReport } from "./credentialOnboarding.js";
import { buildSwiggyAuthLifecycleCenter } from "./authLifecycleCenter.js";
import { buildSwiggyCredentialVaultCenter } from "./credentialVaultCenter.js";
import { buildSwiggyCredentialHandoffCenter } from "./credentialHandoffCenter.js";
import { buildSwiggyCredentialReadinessDossier } from "./credentialReadinessDossier.js";
import { buildSandboxCredentialWorkbench } from "./sandboxCredentialWorkbench.js";
import { buildSwiggyStagingCutoverRehearsal } from "./stagingCutover.js";
import { buildSwiggyStagingCredentialDrill } from "./stagingCredentialDrill.js";
import { buildSwiggyStagingSeedSmokeCenter } from "./stagingSeedSmokeCenter.js";
import { buildStagingCertificationMatrix } from "./stagingCertification.js";
import { buildSwiggyLiveSignalCalibration } from "./liveSignalCalibration.js";
import { buildEnterpriseDelegatedAuthCenter } from "./enterpriseDelegatedAuth.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function weightFor(status: SwiggyBuildersCredentialSandboxWitnessStatus) {
  if (status === "proven") return 1;
  if (status === "ready") return 0.94;
  if (status === "watch") return 0.82;
  if (status === "operator_gate") return 0.74;
  return 0.78;
}

function groupFor(row: SwiggyBuildersCredentialSandboxWitnessRow) {
  if (row.kind === "oauth_lifecycle" || row.kind === "dynamic_client_registration") return "auth_registration";
  if (row.kind === "vault_redaction" || row.kind === "handoff_packet") return "secret_handoff";
  if (row.kind === "sandbox_workbench" || row.kind === "staging_drill") return "sandbox_staging";
  return "certification_cutover";
}

function row(input: SwiggyBuildersCredentialSandboxWitnessRow): SwiggyBuildersCredentialSandboxWitnessRow {
  return input;
}

export async function buildSwiggyBuildersCredentialSandboxWitness(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
  credentialIssuance?: SwiggyCredentialIssuanceState;
  authStatus: SwiggyAuthStatusReport;
}): Promise<SwiggyBuildersCredentialSandboxWitness> {
  const onboarding = buildCredentialOnboardingReport(options.config);
  const authLifecycle = buildSwiggyAuthLifecycleCenter(options.authStatus);
  const vault = buildSwiggyCredentialVaultCenter(options.config);
  const handoff = buildSwiggyCredentialHandoffCenter(options.config);
  const readinessDossier = await buildSwiggyCredentialReadinessDossier({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.latestPlan,
    handoffState: options.handoffState,
    credentialIssuance: options.credentialIssuance,
  });
  const sandbox = buildSandboxCredentialWorkbench(options.config);
  const certification = buildStagingCertificationMatrix(options.config);
  const cutover = buildSwiggyStagingCutoverRehearsal({ config: options.config, latestPlan: options.latestPlan });
  const drill = buildSwiggyStagingCredentialDrill({
    config: options.config,
    onboarding,
    sandbox,
    certification,
    cutover,
  });
  const seedSmoke = buildSwiggyStagingSeedSmokeCenter({
    config: options.config,
    sandbox,
    drill,
    certification,
  });
  const liveCalibration = buildSwiggyLiveSignalCalibration({
    config: options.config,
    latestPlan: options.latestPlan,
    stagingCredentialDrill: drill,
    certification,
  });
  const delegatedAuth = buildEnterpriseDelegatedAuthCenter(options.config);
  const hasStagingRuntime = options.config.swiggyMode === "staging" || options.config.swiggyMode === "production";
  const hasToken = vault.secrets.some((secret) => secret.id === "access_token" && secret.configured);

  const rows = [
    row({
      id: "oauth_lifecycle_pkce",
      label: "OAuth lifecycle and PKCE",
      kind: "oauth_lifecycle",
      officialSignal: "Swiggy MCP uses OAuth 2.1 with authorization code plus PKCE, bearer tokens, logout, and metadata endpoints.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/start/authenticate/",
      owner: "MealPilot",
      status: authLifecycle.totals.lanes >= 6 && authLifecycle.totals.readyStorageRules >= 3 ? "proven" : "watch",
      mealPilotSurface: "Auth Status and Auth Lifecycle Center",
      evidence: `${authLifecycle.totals.lanes} auth lanes, ${authLifecycle.totals.recoveryScenarios} recovery scenarios, and ${authLifecycle.totals.readyStorageRules} token storage rules are modeled.`,
      routeOptimization:
        "Reuse valid bearer state for read probes, trigger reauth on 401/419, and keep PKCE verifier/state lifecycle on the backend.",
      riskBoundary:
        "Bearer tokens, authorization codes, OTPs, phone numbers, and payment credentials never appear in screenshots, logs, packets, or support payloads.",
      nextAction: "Run /api/auth/swiggy/start after DCR or Swiggy client identity is issued, then attach the redacted status receipt.",
      proofLinks: ["/api/auth/swiggy/status", "/api/swiggy-auth-lifecycle-center", "/api/mcp-gateway"],
      relatedApis: ["/api/credential-onboarding", "/api/swiggy-credential-vault-center"],
    }),
    row({
      id: "dynamic_client_registration_receipt",
      label: "Dynamic Client Registration receipt",
      kind: "dynamic_client_registration",
      officialSignal: "MCP clients can register redirect URIs, scopes, grant types, response types, and application metadata through DCR.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/start/developer/",
      owner: "Joint",
      status: onboarding.dynamicClientRegistration.mode === "dry_run" ? "operator_gate" : "ready",
      mealPilotSurface: "Credential Onboarding",
      evidence: `${onboarding.checks.length} onboarding checks, ${onboarding.metadataEndpoints.length} metadata endpoints, and DCR mode ${onboarding.dynamicClientRegistration.mode} are ready for review.`,
      routeOptimization:
        "Keep registration as a preview until the final exact callback URI is known, then use one Swiggy client identity across Food, Instamart, and Dineout.",
      riskBoundary:
        "DCR preview is not represented as live Swiggy approval; production callback must be exact-match HTTPS before promotion.",
      nextAction: "Replace localhost with the final HTTPS callback and perform live registration only during the credential handoff step.",
      proofLinks: ["/api/credential-onboarding", "/api/developer-quickstart-workbench", "/api/swiggy-access-dossier"],
      relatedApis: ["/api/auth/swiggy/status", "/api/swiggy-source-freeze-diff"],
    }),
    row({
      id: "credential_vault_redaction",
      label: "Credential vault and redaction",
      kind: "vault_redaction",
      officialSignal: "Staging and production credentials must stay in managed runtime storage with token redaction and fail-closed behavior.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/operate/access/",
      owner: "Operator",
      status: hasToken ? "ready" : "operator_gate",
      mealPilotSurface: "Credential Vault Center",
      evidence: `${vault.totals.ready}/${vault.totals.secrets} secrets ready, ${vault.totals.redactionRules} redaction rules, and ${vault.totals.rotations} rotation runbook steps are exposed without raw secrets.`,
      routeOptimization:
        "Send only token source, expiry, scope, and configured/unconfigured state to downstream readiness surfaces so all reviewers can inspect safety without seeing secrets.",
      riskBoundary:
        "No endpoint returns full access tokens, client secrets, authorization headers, addresses, phone numbers, payment data, or OTP material.",
      nextAction: hasToken
        ? "Run staging smoke with the managed token source and monitor expiry."
        : "Store client id, token, expiry, final redirect, and mode through managed environment secrets after Swiggy approval.",
      proofLinks: ["/api/swiggy-credential-vault-center", "/api/mcp-gateway", "/api/support/bridge"],
      relatedApis: ["/api/observability/traces", "/api/telemetry/runtime"],
    }),
    row({
      id: "handoff_readiness_packet",
      label: "Handoff readiness packet",
      kind: "handoff_packet",
      officialSignal: "Builder access requires a working local demo, credential follow-up, staging receipt, production plan, and support-safe evidence packet.",
      sourceUrl: "https://mcp.swiggy.com/builders/access/",
      owner: "Joint",
      status: handoff.totals.ready >= 1 && readinessDossier.totals.proofCommands >= 3 ? "ready" : "watch",
      mealPilotSurface: "Credential Handoff Center and Readiness Dossier",
      evidence: `${handoff.totals.phases} handoff phases, ${handoff.totals.controls} controls, ${readinessDossier.totals.stages} readiness stages, and ${readinessDossier.totals.proofCommands} proof commands are packetized.`,
      routeOptimization:
        "Bundle source freeze, demo proof, credential receipt, staging smoke, support envelope, and production promotion into one follow-up narrative.",
      riskBoundary:
        "Form submission, email send, staging issuance, seeded users, and production approval remain explicitly operator- or Swiggy-owned gates.",
      nextAction: "Attach this witness to the builder packet before sending the next credential follow-up.",
      proofLinks: ["/api/swiggy-credential-handoff-center", "/api/swiggy-credential-readiness-dossier", "/api/builder-packet-export"],
      relatedApis: ["/api/access-submission-studio", "/api/swiggy-submission-timeline-center"],
    }),
    row({
      id: "sandbox_credential_workbench",
      label: "Sandbox credential workbench",
      kind: "sandbox_workbench",
      officialSignal: "Builders can start locally, then move through staging credentials, seeded data, and no-real-order smoke before production.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
      owner: "Joint",
      status: sandbox.lanes.some((lane) => lane.status === "swiggy_gate") ? "swiggy_gate" : "ready",
      mealPilotSurface: "Sandbox Credential Workbench",
      evidence: `${sandbox.lanes.length} credential lanes and ${sandbox.seededDataPlan.length} seeded-data server plans cover Food, Instamart, and Dineout.`,
      routeOptimization:
        "Use localhost proof and mock JSON-RPC probes before switching each server to staging with read-only tools first.",
      riskBoundary:
        "Staging smoke uses seeded identities and stop rules; real orders, real payments, and hidden write calls are not part of sandbox proof.",
      nextAction: "After credentials arrive, run server-by-server read probes before any cart, checkout, booking, or support wave.",
      proofLinks: ["/api/sandbox-credential-workbench", "/api/swiggy-staging-credential-drill", "/api/mcp/tool-lab"],
      relatedApis: ["/api/mcp/staging-cutover", "/api/swiggy-staging-replay"],
    }),
    row({
      id: "staging_credential_drill",
      label: "Staging credential drill",
      kind: "staging_drill",
      officialSignal: "Staging credentials, seeded accounts, first-call probes, and promotion gates must be rehearsed before production traffic.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
      owner: hasStagingRuntime ? "Operator" : "Swiggy",
      status: hasStagingRuntime ? "operator_gate" : "swiggy_gate",
      mealPilotSurface: "Staging Credential Drill",
      evidence: `${drill.totals.readyLanes}/${drill.totals.lanes} drill lanes ready with ${drill.totals.firstCallDrills} first-call drills, ${drill.totals.seededDataRequirements} seeded data requirements, and ${drill.totals.promotionGates} promotion gates.`,
      routeOptimization:
        "Promote one server at a time from metadata, to first read, to guarded mutation, to commercial confirmation, with status readback between each step.",
      riskBoundary:
        "401, 419, missing seeded data, ambiguous 5xx, or support-redaction failure stops the staging drill until the credential issue is resolved.",
      nextAction: "Request seeded Food, Instamart, and Dineout users, then run the first-call drill transcript.",
      proofLinks: ["/api/swiggy-staging-credential-drill", "/api/swiggy-staging-replay", "/api/sessions/demo/staging-transcript"],
      relatedApis: ["/api/mcp/staging-cutover", "/api/swiggy-staging-seed-smoke-center"],
    }),
    row({
      id: "seed_smoke_certification",
      label: "Seed smoke and certification",
      kind: "seed_smoke",
      officialSignal: "All 35 official tools need staging smoke waves, evidence, stop rules, and a green soak before production.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/reference/",
      owner: "MealPilot",
      status: certification.assignedTools === 35 && seedSmoke.totals.smokeWaves >= 6 ? "ready" : "watch",
      mealPilotSurface: "Staging Seed Smoke and Certification Matrix",
      evidence: `${certification.assignedTools}/${certification.totalTools} certification tools, ${certification.waves.length} waves, ${seedSmoke.totals.seededFixtures} fixtures, and ${seedSmoke.totals.stopRules} stop rules are mapped.`,
      routeOptimization:
        "Replay read, mutation, commercial, support, and promotion waves from the same certification matrix so coverage cannot drift across tools.",
      riskBoundary:
        "Commercial actions require visible confirmation, status readback, and no blind retries even in staging.",
      nextAction: "Attach seed smoke telemetry and the certification matrix after Swiggy issues staging credentials.",
      proofLinks: ["/api/swiggy-staging-seed-smoke-center", "/api/staging-certification-matrix", "/api/sessions/demo/staging-transcript"],
      relatedApis: ["/api/swiggy-tool-contract-matrix", "/api/mcp/scenario-runner"],
    }),
    row({
      id: "cutover_live_calibration",
      label: "Cutover and live-signal calibration",
      kind: "certification_cutover",
      officialSignal: "Production follows only after staging credentials, 48-hour green soak, observability, support, and final Swiggy approval.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
      owner: "Joint",
      status: cutover.mode === "production" ? "ready" : "swiggy_gate",
      mealPilotSurface: "Staging Cutover, Live Signal Calibration, and Enterprise Delegated Auth",
      evidence: `${cutover.dryRunCalls} cutover probes, ${liveCalibration.totals.probes} live calibration probes, and ${delegatedAuth.flow.length} delegated auth flow steps are ready for production review.`,
      routeOptimization:
        "Calibrate live order, inventory, booking, support, and signal freshness with canary traffic before widening rollout.",
      riskBoundary:
        "Production credentials, quotas, paid Dineout behavior, live payments, support escalation, showcase approval, and legal/cobrand approvals remain Swiggy-controlled.",
      nextAction: "Complete the 48-hour staging soak, export the launch bundle, and request production promotion.",
      proofLinks: ["/api/mcp/staging-cutover", "/api/swiggy-live-signal-calibration", "/api/enterprise-delegated-auth", "/api/production-launch-bundle"],
      relatedApis: ["/api/go-live", "/api/rate-limit-plan", "/api/version-monitor"],
    }),
  ];

  const proofLinks = unique(rows.flatMap((item) => item.proofLinks));
  const groupDefs = [
    { id: "auth_registration", label: "Auth and registration" },
    { id: "secret_handoff", label: "Secret handoff" },
    { id: "sandbox_staging", label: "Sandbox and staging" },
    { id: "certification_cutover", label: "Certification and cutover" },
  ];
  const groups: SwiggyBuildersCredentialSandboxWitnessGroup[] = groupDefs.map((group) => {
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
      swiggyGates > 2
        ? "credential_sandbox_blocked"
        : watch > 0 || operatorGates > 0 || swiggyGates > 0
          ? "credential_sandbox_watch"
          : "credential_sandbox_ready",
    officialSources: unique([
      ...onboarding.dynamicClientRegistration.evidence,
      ...sandbox.officialSources,
      ...certification.officialSources,
      ...cutover.officialSources,
      ...readinessDossier.officialSources,
      ...liveCalibration.officialSources,
      ...delegatedAuth.officialSources,
      "https://mcp.swiggy.com/builders/",
      "https://mcp.swiggy.com/builders/access/",
    ]).filter((source) => source.startsWith("https://")),
    totals: {
      rows: rows.length,
      proven: rows.filter((item) => item.status === "proven").length,
      ready: rows.filter((item) => item.status === "ready").length,
      watch,
      operatorGates,
      swiggyGates,
      proofLinks: proofLinks.length,
      onboardingChecks: onboarding.checks.length,
      authLifecycleLanes: authLifecycle.totals.lanes,
      vaultSecrets: vault.totals.secrets,
      redactionRules: vault.totals.redactionRules,
      handoffPhases: handoff.totals.phases,
      readinessStages: readinessDossier.totals.stages,
      sandboxLanes: sandbox.lanes.length,
      stagingDrills: drill.totals.firstCallDrills,
      seedFixtures: seedSmoke.totals.seededFixtures,
      smokeWaves: seedSmoke.totals.smokeWaves,
      certificationTools: certification.totalTools,
      cutoverProbes: cutover.dryRunCalls,
      liveCalibrationProbes: liveCalibration.totals.probes,
      delegatedAuthSteps: delegatedAuth.flow.length,
    },
    rows,
    groups,
    commands: [
      {
        id: "credential_sandbox_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-credential-sandbox-witness",
        proves:
          "OAuth, DCR, vault, handoff, sandbox, staging drills, seeded smoke, certification, cutover, and live-signal gates are witnessed together.",
        expectedSignal: "totals.certificationTools === 35 && totals.stagingDrills === 3",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke fails if credential, sandbox, staging, certification, or visual evidence falls out of the packet.",
        expectedSignal: "credentialSandboxWitnessScore >= 84",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Credential Sandbox Witness card is captured with every reviewer-critical Launch Center surface.",
        expectedSignal: "78 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Credential access is treated as a reviewer-visible lifecycle: OAuth, DCR, vault, handoff, sandbox, staging smoke, and production promotion.",
      "MealPilot can prove local readiness without claiming Swiggy-issued staging or production credentials before Swiggy grants them.",
      "Every credentialed call remains tied to redaction, explicit confirmation, status readback, support-safe telemetry, and no blind retries.",
      "Sandbox and staging proof spans Food, Instamart, Dineout, all 35 tools, seeded users, first-call drills, and the 48-hour promotion gate.",
    ],
    externalGates: [
      "Swiggy must approve Builder Access, DCR/client identity, staging OAuth credentials, seeded users, quotas, and production credentials.",
      "The operator must replace localhost with the final HTTPS redirect, store runtime secrets, submit follow-up timestamps, and attach demo proof.",
      "Paid Dineout, live payments, support escalation, showcase placement, cobranding, legal, and commercial approvals remain Swiggy-owned gates.",
    ],
  };
}
