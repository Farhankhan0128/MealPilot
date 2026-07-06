import type { ServerConfig } from "../config.js";
import type {
  SwiggyCredentialHandoffCenter,
  SwiggyCredentialHandoffControl,
  SwiggyCredentialHandoffPhase,
  SwiggyCredentialHandoffStatus,
} from "../../src/domain/types.js";
import { buildCredentialOnboardingReport } from "./credentialOnboarding.js";
import { buildSandboxCredentialWorkbench } from "./sandboxCredentialWorkbench.js";
import { buildSwiggyCredentialVaultCenter } from "./credentialVaultCenter.js";
import { buildSwiggyStagingCredentialDrill } from "./stagingCredentialDrill.js";
import { buildSwiggyStagingCutoverRehearsal } from "./stagingCutover.js";
import { buildStagingCertificationMatrix } from "./stagingCertification.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

function statusWeight(status: SwiggyCredentialHandoffStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.84;
  if (status === "swiggy_gate") return 0.74;
  return 0.2;
}

function phase(input: SwiggyCredentialHandoffPhase): SwiggyCredentialHandoffPhase {
  return input;
}

function control(input: SwiggyCredentialHandoffControl): SwiggyCredentialHandoffControl {
  return input;
}

function commandBase(config: ServerConfig) {
  return `http://localhost:${config.port}`;
}

export function buildSwiggyCredentialHandoffCenter(config: ServerConfig): SwiggyCredentialHandoffCenter {
  const onboarding = buildCredentialOnboardingReport(config);
  const vault = buildSwiggyCredentialVaultCenter(config);
  const sandbox = buildSandboxCredentialWorkbench(config);
  const certification = buildStagingCertificationMatrix(config);
  const cutover = buildSwiggyStagingCutoverRehearsal({ config });
  const drill = buildSwiggyStagingCredentialDrill({
    config,
    cutover,
    onboarding,
    sandbox,
    certification,
  });
  const base = commandBase(config);
  const redirectReady = onboarding.redirectUriAudit.productionSafe;
  const dcrReady = onboarding.dynamicClientRegistration.mode === "ready_for_live_registration";
  const hasToken = vault.secrets.some((secret) => secret.id === "access_token" && secret.status === "ready");
  const hasStagingAccess = config.swiggyMode === "staging" || config.swiggyMode === "production";

  const phases = [
    phase({
      id: "localhost_demo",
      sequence: 1,
      label: "Localhost demo proof",
      owner: "MealPilot",
      status: "ready",
      officialNeed: "Build locally first and show a working product video before requesting production access.",
      mealPilotProof: ["Production verifier", "Visual QA", "Builder packet export"],
      action: "Record the final 2-3 minute MealPilot flow after this endpoint and screenshots are green.",
      evidenceLinks: ["/api/demo-studio", "/api/visual-qa-center", "/api/builder-packet-export"],
    }),
    phase({
      id: "dcr_payload",
      sequence: 2,
      label: "Dynamic Client Registration payload",
      owner: "Joint",
      status: dcrReady || config.swiggyMode === "mock" ? "operator_input" : "swiggy_gate",
      officialNeed: "Register the MCP client with redirect URIs, PKCE, scopes, grant types, and application type.",
      mealPilotProof: [onboarding.dynamicClientRegistration.endpoint, onboarding.dynamicClientRegistration.mode],
      action: "Use the preview payload for review, then run live DCR only with the final callback URI.",
      evidenceLinks: ["/api/credential-onboarding", "/api/auth/swiggy/status"],
    }),
    phase({
      id: "redirect_uri",
      sequence: 3,
      label: "Exact redirect URI",
      owner: "Operator",
      status: redirectReady ? "ready" : "operator_input",
      officialNeed: "Production OAuth requires an exact HTTPS callback; localhost remains local-development only.",
      mealPilotProof: [onboarding.redirectUriAudit.evidence],
      action: redirectReady ? "Submit this URI unchanged." : "Replace localhost with the final HTTPS callback before production review.",
      evidenceLinks: ["/api/credential-onboarding", "/api/swiggy-access-dossier"],
    }),
    phase({
      id: "oauth_pkce",
      sequence: 4,
      label: "OAuth PKCE callback",
      owner: "MealPilot",
      status: "ready",
      officialNeed: "Swiggy MCP calls require OAuth bearer authorization and server-side PKCE verification.",
      mealPilotProof: ["S256 verifier is created server-side", "OAuth callback consumes state once", "Bearer tokens stay redacted"],
      action: "Run /api/auth/swiggy/start after client identity is issued, then inspect the status endpoint.",
      evidenceLinks: ["/api/auth/swiggy/status", "/api/swiggy-auth-lifecycle-center"],
    }),
    phase({
      id: "secret_storage",
      sequence: 5,
      label: "Credential vault and redaction",
      owner: "Operator",
      status: hasToken ? "ready" : "operator_input",
      officialNeed: "Staging and production calls must fail closed without a bearer token and must never expose secrets.",
      mealPilotProof: [`${vault.totals.ready}/${vault.totals.secrets} secrets ready`, `${vault.totals.redactionRules} redaction rules`],
      action: "Store token, expiry, client id, and final mode in managed runtime secrets before staging smoke.",
      evidenceLinks: ["/api/swiggy-credential-vault-center", "/api/mcp-gateway"],
    }),
    phase({
      id: "staging_credentials",
      sequence: 6,
      label: "Staging credentials and seeded users",
      owner: "Swiggy",
      status: hasStagingAccess ? "operator_input" : "swiggy_gate",
      officialNeed: "Use Swiggy-issued staging credentials and seeded identities; avoid real orders during staging.",
      mealPilotProof: [`${sandbox.seededDataPlan.length} seeded server plans`, `${drill.totals.firstCallDrills} first-call drills`],
      action: "Ask Swiggy for Food, Instamart, and Dineout seeded identities and run read-only probes first.",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/swiggy-staging-credential-drill"],
    }),
    phase({
      id: "seeded_smoke",
      sequence: 7,
      label: "Seeded smoke and 35-tool waves",
      owner: "MealPilot",
      status: hasStagingAccess ? "operator_input" : "swiggy_gate",
      officialNeed: "Exercise every requested server and commercial action with stop rules before production.",
      mealPilotProof: [`${certification.assignedTools}/${certification.totalTools} tools assigned`, "No blind retries for commercial tools"],
      action: "Run read, mutation, support, and commercial waves with telemetry and status readbacks.",
      evidenceLinks: ["/api/staging-certification-matrix", "/api/mcp/tool-lab", "/api/staging-transcript"],
    }),
    phase({
      id: "production_promotion",
      sequence: 8,
      label: "Production promotion",
      owner: "Swiggy",
      status: config.swiggyMode === "production" ? "operator_input" : "swiggy_gate",
      officialNeed: "Production follows after Swiggy approval, final credentials, and at least 48 hours of green staging.",
      mealPilotProof: [`${certification.soakHoursRequired}-hour soak gate`, "Production launch bundle and support envelope"],
      action: "Send the handoff email with the launch bundle after staging stays green for 48 hours.",
      evidenceLinks: ["/api/production-launch-bundle", "/api/reviewer-artifact-vault", "/api/support/bridge"],
    }),
  ];

  const controls = [
    control({
      id: "no_full_token",
      label: "No full-token exposure",
      status: "ready",
      proves: "Vault, gateway, auth lifecycle, logs, screenshots, support packets, and exports show only redacted token posture.",
      evidenceLinks: ["/api/swiggy-credential-vault-center", "/api/auth/swiggy/status", "/api/audit-ledger"],
    }),
    control({
      id: "fail_closed_gateway",
      label: "Fail-closed gateway",
      status: cutover.credentialState.tokenSource === "none" && config.swiggyMode !== "mock" ? "blocked" : "ready",
      proves: "Live Swiggy traffic cannot run without bearer authorization; mock mode remains isolated for demos.",
      evidenceLinks: ["/api/mcp-gateway", "/api/mcp/staging-cutover"],
    }),
    control({
      id: "read_first_staging",
      label: "Read-only first calls",
      status: hasStagingAccess ? "operator_input" : "swiggy_gate",
      proves: "Food, Instamart, and Dineout begin with read-only probes before mutation or commercial actions.",
      evidenceLinks: ["/api/swiggy-staging-credential-drill", "/api/swiggy-staging-seed-smoke-center"],
    }),
    control({
      id: "all_tool_certification",
      label: "All-tool certification",
      status: certification.assignedTools === certification.totalTools ? "ready" : "blocked",
      proves: "All 35 official tools are assigned to credentialed staging waves and production gates.",
      evidenceLinks: ["/api/staging-certification-matrix", "/api/mcp/tool-contract-matrix"],
    }),
    control({
      id: "support_ready",
      label: "Support handoff ready",
      status: "ready",
      proves: "The handoff email routes to builders@swiggy.in with redacted evidence, commands, and external gates.",
      evidenceLinks: ["/api/support/bridge", "/api/reviewer-artifact-vault", "/api/production-launch-bundle"],
    }),
  ];

  const credentialPackets = [
    {
      id: "handoff_center",
      label: "Credential handoff center",
      command: `curl -s ${base}/api/swiggy-credential-handoff-center`,
      proves: "Single source for localhost demo, DCR, OAuth, vault, staging credentials, 48-hour soak, and production gates.",
    },
    {
      id: "onboarding",
      label: "OAuth onboarding",
      command: `curl -s ${base}/api/credential-onboarding`,
      proves: "DCR payload, redirect URI audit, scopes, application fields, and external gates.",
    },
    {
      id: "vault",
      label: "Credential vault",
      command: `curl -s ${base}/api/swiggy-credential-vault-center`,
      proves: "Secrets, redaction, token expiry, rotation, support packet, and cutover checks.",
    },
    {
      id: "staging_drill",
      label: "Staging credential drill",
      command: `curl -s ${base}/api/swiggy-staging-credential-drill`,
      proves: "First credentialed calls, seeded data, runbook, and promotion gates.",
    },
    {
      id: "production_packet",
      label: "Production packet",
      command: "npm run verify:production && npm run export:builder-packet",
      proves: "Verifier and builder packet contain the credential handoff evidence before Swiggy review.",
    },
  ];

  const scoreItems = [...phases.map((item) => item.status), ...controls.map((item) => item.status)];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    mode: config.swiggyMode,
    score,
    officialSources,
    currentMode:
      config.swiggyMode === "mock"
        ? "Local proof complete; staging credentials are the next external gate."
        : config.swiggyMode === "staging"
          ? "Staging mode active; complete seeded probes and 48-hour soak."
          : "Production mode active; keep support, telemetry, and reauth monitors green.",
    totals: {
      phases: phases.length,
      ready: phases.filter((item) => item.status === "ready").length,
      operatorInputs: phases.filter((item) => item.status === "operator_input").length,
      swiggyGates: phases.filter((item) => item.status === "swiggy_gate").length,
      blocked: phases.filter((item) => item.status === "blocked").length,
      controls: controls.length,
      packets: credentialPackets.length,
    },
    phases,
    controls,
    credentialPackets,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Freeze local proof",
        command: "npm run build && npm run lint && npm test -- --run && MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "The app, contracts, tests, and production smoke are green before external credential work.",
      },
      {
        sequence: 2,
        label: "Send access packet",
        command: `curl -s ${base}/api/swiggy-credential-handoff-center && curl -s ${base}/api/builder-packet-export`,
        proves: "Swiggy receives a single credential map plus the full reviewer artifact packet.",
      },
      {
        sequence: 3,
        label: "Run staging OAuth",
        command: `SWIGGY_ENV=staging SWIGGY_CLIENT_ID=<issued> SWIGGY_REDIRECT_URI=<https-callback> npm start`,
        proves: "Runtime points to Swiggy staging and remains fail-closed until OAuth completes.",
      },
      {
        sequence: 4,
        label: "Exercise seeded staging",
        command: `curl -s ${base}/api/swiggy-staging-credential-drill && curl -s ${base}/api/staging-certification-matrix`,
        proves: "Read-only probes, guarded writes, all 35 tools, support context, and telemetry gates are ready.",
      },
      {
        sequence: 5,
        label: "Request production promotion",
        command: `curl -s ${base}/api/production-launch-bundle`,
        proves: "48-hour green staging, final credentials, support packet, and rollout plan are bundled.",
      },
    ],
    handoffEmail: {
      to: "builders@swiggy.in",
      subject: "MealPilot credential handoff: localhost proof to staging credentials",
      bodyPreview:
        "MealPilot local proof is green and the credential handoff center maps DCR, OAuth PKCE, exact redirect URI, secret storage, seeded staging data, 35-tool certification, 48-hour soak, and production promotion gates. External asks: staging credentials, seeded Food/Instamart/Dineout users, final production credentials, and approval after green staging.",
    },
    assertions: [
      "Every credential step has an owner, status, action, and source API instead of being buried in separate panels.",
      "MealPilot can demo locally without credentials while preserving Swiggy-owned staging and production gates.",
      "DCR, OAuth PKCE, token redaction, exact redirect URI, seeded data, and 48-hour soak are visible in one reviewer surface.",
      "Production traffic remains blocked until Swiggy approval and final credentials are issued.",
    ],
    externalGates: [
      "Operator must submit the official access form with demo video, GitHub/app links, redirect URI, contact, and expected volume.",
      "Swiggy must issue staging credentials, DCR/client identity, seeded Food/Instamart/Dineout users, and support-channel approvals.",
      "Swiggy must approve production credentials after at least 48 hours of green staging evidence.",
    ],
  };
}
