import type { ServerConfig } from "../config.js";
import type {
  CredentialOnboardingReport,
  SandboxCredentialWorkbench,
  SwiggyOperatingContractCenterReport,
  SwiggyStagingCredentialDrillLane,
  SwiggyStagingCredentialDrillReport,
  SwiggyStagingCredentialDrillStatus,
  SwiggyStagingCutoverRehearsal,
  StagingCertificationMatrix,
} from "../../src/domain/types.js";
import { buildCredentialOnboardingReport } from "./credentialOnboarding.js";
import { buildSandboxCredentialWorkbench } from "./sandboxCredentialWorkbench.js";
import { buildStagingCertificationMatrix } from "./stagingCertification.js";
import { buildSwiggyStagingCutoverRehearsal } from "./stagingCutover.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/sla/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function statusWeight(status: SwiggyStagingCredentialDrillStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.82;
  if (status === "swiggy_gate") return 0.68;
  return 0.15;
}

function lane(input: SwiggyStagingCredentialDrillLane): SwiggyStagingCredentialDrillLane {
  return input;
}

function commandBase(config: ServerConfig) {
  return `http://localhost:${config.port}`;
}

function hasLiveCredential(config: ServerConfig, cutover: SwiggyStagingCutoverRehearsal) {
  return config.swiggyMode === "staging" && cutover.credentialState.tokenSource !== "none";
}

function buildLanes(input: {
  config: ServerConfig;
  onboarding: CredentialOnboardingReport;
  sandbox: SandboxCredentialWorkbench;
  certification: StagingCertificationMatrix;
  cutover: SwiggyStagingCutoverRehearsal;
  contract?: SwiggyOperatingContractCenterReport;
}): SwiggyStagingCredentialDrillLane[] {
  const base = commandBase(input.config);
  const liveCredential = hasLiveCredential(input.config, input.cutover);
  const redirectReady = input.onboarding.redirectUriAudit.productionSafe;
  const dcrReady = input.onboarding.dynamicClientRegistration.mode === "ready_for_live_registration";
  const contractReady = input.contract ? input.contract.score >= 80 : true;

  return [
    lane({
      id: "access_packet",
      label: "Access packet and demo proof",
      owner: "Operator",
      status: "operator_input",
      officialSignal: "Swiggy access review asks for the product idea, demo proof, requested servers, contact, and GitHub/app links.",
      localProof: ["/api/swiggy-access-dossier", "/api/production-launch-bundle", "/api/builder-packet-export"],
      drillCommand: `curl -s ${base}/api/builder-packet-export`,
      exitCriteria: [
        "Demo video URL is attached.",
        "GitHub repo, production-safe redirect URI, and primary support contact are filled.",
      ],
    }),
    lane({
      id: "oauth_dcr",
      label: "OAuth and Dynamic Client Registration",
      owner: "Joint",
      status: dcrReady || redirectReady ? "operator_input" : "swiggy_gate",
      officialSignal: "Swiggy documents OAuth 2.1 PKCE, exact redirect URIs, bearer tokens, and DCR at /auth/register.",
      localProof: ["/api/credential-onboarding", "/api/auth/swiggy/status", "/api/mcp-gateway"],
      drillCommand: `curl -s ${base}/api/credential-onboarding`,
      exitCriteria: [
        "Final HTTPS callback is selected or localhost remains explicitly local-only.",
        "Client id is issued by DCR or Swiggy access approval.",
        "Token preview stays redacted after OAuth callback.",
      ],
    }),
    lane({
      id: "seeded_data",
      label: "Seeded staging identities",
      owner: "Swiggy",
      status: liveCredential ? "operator_input" : "swiggy_gate",
      officialSignal: "Staging must use Swiggy-provided seeded data and must not create real orders or bookings.",
      localProof: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix"],
      drillCommand: `curl -s ${base}/api/sandbox-credential-workbench`,
      exitCriteria: [
        "Seeded Food, Instamart, and Dineout users are assigned.",
        "Each server has one read-only smoke before any mutation.",
        "Commercial actions remain confirmation-locked.",
      ],
    }),
    lane({
      id: "first_call_wave",
      label: "First credentialed MCP calls",
      owner: "MealPilot",
      status: liveCredential ? "ready" : "swiggy_gate",
      officialSignal: "Swiggy MCP calls use JSON-RPC tools/call over Streamable HTTP with bearer authorization.",
      localProof: ["/api/mcp/staging-cutover", "/api/telemetry/runtime", "/api/observability/traces"],
      drillCommand: `curl -s ${base}/api/mcp/staging-cutover`,
      exitCriteria: [
        "Food and Instamart begin with get_addresses.",
        "Dineout begins with get_saved_locations.",
        "401 stops immediately and reruns OAuth instead of retrying blindly.",
      ],
    }),
    lane({
      id: "all_tool_certification",
      label: "35-tool staging certification",
      owner: "MealPilot",
      status: liveCredential ? "operator_input" : "swiggy_gate",
      officialSignal: "Production follows only after every staged tool wave and operating guardrail stays green.",
      localProof: ["/api/staging-certification-matrix", "/api/mcp/tool-lab", "/api/swiggy-operating-contract-center"],
      drillCommand: `curl -s ${base}/api/staging-certification-matrix`,
      exitCriteria: [
        `${input.certification.assignedTools}/${input.certification.totalTools} tools remain assigned to certification waves.`,
        "Support report_error payloads are redacted on all three servers.",
        "48-hour green soak is captured before promotion.",
      ],
    }),
    lane({
      id: "operating_contract",
      label: "Operating contract and escalation",
      owner: "Joint",
      status: contractReady ? "ready" : "operator_input",
      officialSignal: "Swiggy operate guidance expects support, rate-limit, SLA, versioning, and production ramp readiness.",
      localProof: ["/api/swiggy-operating-contract-center", "/api/slo-incident-command", "/api/support/bridge"],
      drillCommand: `curl -s ${base}/api/swiggy-operating-contract-center`,
      exitCriteria: [
        "builders@swiggy.in escalation packet includes environment, server, tool, request id, session id, timestamp, and redacted error.",
        "429, 401, 5xx, and deprecation branches are visible in the runbook.",
      ],
    }),
  ];
}

function buildFirstCallDrills(cutover: SwiggyStagingCutoverRehearsal, sandbox: SandboxCredentialWorkbench) {
  return cutover.probes.map((probe) => {
    const seed = sandbox.seededDataPlan.find((item) => item.server === probe.server);
    return {
      id: `${probe.server}_credential_drill`,
      server: probe.server,
      endpoint: probe.endpoint,
      firstTool: probe.firstTool,
      seededDataNeed: seed?.seededDataNeed ?? "Seeded staging identity from Swiggy access review.",
      status: probe.status === "ready" ? ("ready" as const) : ("swiggy_gate" as const),
      dryRunRequest: {
        jsonrpc: probe.dryRunRequest.jsonrpc,
        method: probe.dryRunRequest.method,
        params: probe.dryRunRequest.params,
      },
      successEvidence: [
        probe.expectedSuccessShape,
        "Telemetry includes request id, session id, duration, tool, server, and redacted user hash.",
        ...(seed ? [seed.confirmationProof] : []),
      ],
      failureStopRule:
        "Stop on 401, 429, network ambiguity, or JSON-RPC error until OAuth, Retry-After, support packet, or status readback is complete.",
    };
  });
}

function buildPromotionGates(
  certification: StagingCertificationMatrix,
  sandbox: SandboxCredentialWorkbench,
): SwiggyStagingCredentialDrillReport["promotionGates"] {
  return [
    {
      id: "credential_issue",
      label: "Staging credential issue",
      status: "swiggy_gate",
      requirement: "Swiggy must issue staging access, seeded identities, and OAuth client identity before live calls.",
      evidence: sandbox.externalGates,
    },
    {
      id: "tool_waves",
      label: "Certification waves",
      status: "operator_input",
      requirement: "Every read, cart mutation, support, and commercial action wave must pass against seeded data.",
      evidence: certification.waves.map((wave) => `${wave.title}: ${wave.tools.length} tools`),
    },
    {
      id: "soak",
      label: "48-hour green soak",
      status: "swiggy_gate",
      requirement: "Staging must stay green for 48 hours before production promotion.",
      evidence: certification.telemetryRequirements,
    },
    {
      id: "promotion_approval",
      label: "Production approval",
      status: "swiggy_gate",
      requirement: "Production credentials, support contact, redirect allowlist, and ramp plan remain Swiggy-controlled.",
      evidence: certification.rollbackPolicy,
    },
  ];
}

function scoreReport(lanes: SwiggyStagingCredentialDrillLane[], gates: SwiggyStagingCredentialDrillReport["promotionGates"]) {
  const laneScore = lanes.reduce((sum, item) => sum + statusWeight(item.status), 0);
  const gateScore = gates.reduce((sum, item) => sum + statusWeight(item.status), 0);
  return Math.round(((laneScore + gateScore) / (lanes.length + gates.length)) * 100);
}

export function buildSwiggyStagingCredentialDrill(options: {
  config: ServerConfig;
  cutover?: SwiggyStagingCutoverRehearsal;
  onboarding?: CredentialOnboardingReport;
  sandbox?: SandboxCredentialWorkbench;
  certification?: StagingCertificationMatrix;
  operatingContract?: SwiggyOperatingContractCenterReport;
}): SwiggyStagingCredentialDrillReport {
  const onboarding = options.onboarding ?? buildCredentialOnboardingReport(options.config);
  const sandbox = options.sandbox ?? buildSandboxCredentialWorkbench(options.config);
  const certification = options.certification ?? buildStagingCertificationMatrix(options.config);
  const cutover =
    options.cutover ??
    buildSwiggyStagingCutoverRehearsal({
      config: options.config,
    });
  const liveCredential = hasLiveCredential(options.config, cutover);
  const lanes = buildLanes({
    config: options.config,
    onboarding,
    sandbox,
    certification,
    cutover,
    contract: options.operatingContract,
  });
  const firstCallDrills = buildFirstCallDrills(cutover, sandbox);
  const promotionGates = buildPromotionGates(certification, sandbox);
  const readyLanes = lanes.filter((item) => item.status === "ready").length;
  const base = commandBase(options.config);

  return {
    generatedAt: new Date().toISOString(),
    mode: options.config.swiggyMode,
    score: scoreReport(lanes, promotionGates),
    officialSources,
    credentialSignal: {
      clientIdConfigured: cutover.credentialState.clientIdConfigured,
      tokenSource: cutover.credentialState.tokenSource,
      redirectUri: cutover.credentialState.redirectUri,
      stagingVerified: liveCredential,
      currentGate: liveCredential ? "operator_input" : "swiggy_gate",
      evidence: liveCredential
        ? "Runtime is in staging with a bearer-token source; proceed through seeded-data drills."
        : "Local proof is complete, but Swiggy staging credentials and seeded data are still external.",
    },
    totals: {
      lanes: lanes.length,
      readyLanes,
      firstCallDrills: firstCallDrills.length,
      seededDataRequirements: sandbox.seededDataPlan.length,
      promotionGates: promotionGates.length,
      externalGates: sandbox.externalGates.length + cutover.externalGates.length,
    },
    lanes,
    firstCallDrills,
    seededDataRequirements: sandbox.seededDataPlan,
    promotionGates,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Rebuild and smoke locally",
        command: "npm test -- --run && npm run lint && npm run build && npm run verify:production",
        proves: "Local contracts, premium UI, MCP mock routes, and proof APIs are healthy before touching staging.",
      },
      {
        sequence: 2,
        label: "Start staging runtime",
        command: "SWIGGY_ENV=staging SWIGGY_CLIENT_ID=<issued> SWIGGY_REDIRECT_URI=<https-callback> npm start",
        proves: "MealPilot points at Swiggy staging and fails closed without OAuth.",
      },
      {
        sequence: 3,
        label: "Complete OAuth and check token posture",
        command: `open ${base}/api/auth/swiggy/start && curl -s ${base}/api/auth/swiggy/status`,
        proves: "PKCE callback stores a redacted runtime token and keeps verifier/state server-side.",
      },
      {
        sequence: 4,
        label: "Run read-only first calls",
        command: `curl -s ${base}/api/swiggy-staging-credential-drill`,
        proves: "Food, Instamart, and Dineout first-call dry-run payloads and stop rules are current.",
      },
      {
        sequence: 5,
        label: "Collect promotion evidence",
        command: `curl -s ${base}/api/staging-certification-matrix && curl -s ${base}/api/production-launch-bundle`,
        proves: "All 35 tools, 48-hour soak gates, support context, and production ramp evidence are ready.",
      },
    ],
    handoffEmail: {
      to: "builders@swiggy.in",
      subject: "MealPilot staging credential drill readiness",
      bodyPreview:
        "MealPilot is ready for Swiggy staging credentials. Local proof includes builder packet export, OAuth/DCR readiness, three-server seeded-data plan, first-call JSON-RPC drills, 35-tool certification matrix, operating contract, visual QA report, and production launch bundle. External gates: staging credentials, seeded users, 48-hour green soak, and production approval.",
    },
    assertions: [
      "MealPilot has a single operator drill for the first credentialed staging run instead of scattered checklist items.",
      "First staging calls are read-only for all three Swiggy servers before any cart mutation or commercial action.",
      "The report is honest about Swiggy-owned gates: credentials, seeded data, 48-hour soak, and production promotion.",
      "All credentials remain redacted and non-mock traffic continues to fail closed without bearer authorization.",
    ],
    externalGates: [
      "Swiggy must issue staging credentials, DCR/client identity, and seeded user data.",
      "Operator must provide final HTTPS redirect URI, demo video URL, and primary support contact.",
      "Swiggy must approve production credentials after 48 hours of green staging evidence.",
    ],
  };
}
