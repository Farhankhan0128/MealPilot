import type { ServerConfig } from "../config.js";
import type {
  SandboxCredentialLane,
  SandboxCredentialStatus,
  SandboxCredentialWorkbench,
  SandboxSeededDataPlan,
} from "../../src/domain/types.js";
import { buildCredentialOnboardingReport } from "./credentialOnboarding.js";
import { buildStagingCertificationMatrix } from "./stagingCertification.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/start/developer/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/access/",
];

function statusWeight(status: SandboxCredentialStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.84;
  if (status === "swiggy_gate") return 0.76;
  return 0.2;
}

function lane(
  id: string,
  label: string,
  status: SandboxCredentialStatus,
  owner: SandboxCredentialLane["owner"],
  officialSignal: string,
  mealPilotProof: string[],
  nextAction: string,
): SandboxCredentialLane {
  return { id, label, status, owner, officialSignal, mealPilotProof, nextAction };
}

function command(id: string, commandText: string, proves: string) {
  return { id, command: commandText, proves };
}

function buildSeededDataPlan(config: ServerConfig): SandboxSeededDataPlan[] {
  const stagingBase = config.swiggyBaseUrl.includes("staging") ? config.swiggyBaseUrl : "https://mcp-staging.swiggy.com";
  const status: SandboxCredentialStatus =
    config.swiggyMode === "staging" || config.swiggyMode === "production" ? "ready" : "swiggy_gate";

  return [
    {
      server: "food",
      stagingEndpoint: `${stagingBase}/food`,
      firstReadTool: "get_addresses",
      seededDataNeed: "Seeded user with at least one deliverable address and restaurant catalogue visibility.",
      guardedWrite: "place_food_order",
      confirmationProof: "Check get_food_orders after any failed placement before retrying.",
      status,
    },
    {
      server: "instamart",
      stagingEndpoint: `${stagingBase}/im`,
      firstReadTool: "get_addresses",
      seededDataNeed: "Seeded user with serviceable Instamart address, product inventory, cart, and mock checkout lane.",
      guardedWrite: "checkout",
      confirmationProof: "Check get_orders after any failed checkout before retrying.",
      status,
    },
    {
      server: "dineout",
      stagingEndpoint: `${stagingBase}/dineout`,
      firstReadTool: "search_restaurants_dineout",
      seededDataNeed: "Seeded city, restaurants, slots, dining cart, and booking-status readback.",
      guardedWrite: "book_table",
      confirmationProof: "Check get_booking_status after any failed booking before retrying.",
      status,
    },
  ];
}

export function buildSandboxCredentialWorkbench(config: ServerConfig): SandboxCredentialWorkbench {
  const onboarding = buildCredentialOnboardingReport(config);
  const certification = buildStagingCertificationMatrix(config);
  const redirectReady = onboarding.redirectUriAudit.status === "ready";
  const scopesReady = ["mcp:tools", "mcp:resources", "mcp:prompts"].every((scope) => onboarding.scopes.includes(scope));
  const hasTokenStorage = onboarding.checks.some((check) => check.id === "token_storage" && check.status !== "blocked");
  const hasStagingAccess = config.swiggyMode === "staging" || config.swiggyMode === "production";
  const localCommandBaseUrl = `http://localhost:${config.port}`;

  const lanes = [
    lane(
      "local_video",
      "Local video proof",
      "ready",
      "MealPilot",
      "Swiggy says builders can build locally first, then send a short working video.",
      ["/api/demo-studio", "/api/visual-qa-center", "/api/builder-packet-export"],
      "Record the 2-3 minute MealPilot flow after the latest production smoke is green.",
    ),
    lane(
      "dcr_client_identity",
      "Dynamic Client Registration",
      onboarding.dynamicClientRegistration.mode === "ready_for_live_registration" ? "ready" : "operator_input",
      "Operator",
      "Swiggy MCP clients register through POST /auth/register; no static client id is needed to start.",
      ["/api/credential-onboarding", "/api/auth/swiggy/status"],
      "Use the preview payload during review, then run live DCR with the final redirect URI.",
    ),
    lane(
      "pkce_oauth",
      "PKCE OAuth readiness",
      "ready",
      "MealPilot",
      "OAuth 2.1 PKCE uses /auth/authorize, /auth/token, and Bearer tokens for MCP calls.",
      ["/api/auth/swiggy/status", "/api/mcp-gateway"],
      "Keep verifier server-side, consume state once, and rerun OAuth on 401 or 419.",
    ),
    lane(
      "redirect_allowlist",
      "Redirect allowlist",
      redirectReady ? "ready" : "operator_input",
      "Operator",
      "Production requires exact-match HTTPS redirect URIs; localhost is allowed for local development.",
      ["/api/credential-onboarding", "/api/swiggy-access-dossier"],
      redirectReady ? "Submit this exact callback URI." : "Replace localhost with the final HTTPS callback before production review.",
    ),
    lane(
      "staging_credentials",
      "Staging credentials and seeded users",
      hasStagingAccess ? "ready" : "swiggy_gate",
      "Swiggy",
      "Developers receive staging credentials during review; staging uses seeded data and no real orders.",
      ["/api/mcp/staging-cutover", "/api/staging-certification-matrix"],
      "After Swiggy issues credentials, run read-only probes first and then guarded write waves.",
    ),
    lane(
      "production_promotion",
      "Production promotion",
      hasStagingAccess ? "operator_input" : "swiggy_gate",
      "Swiggy",
      "Production follows after the staging integration stays green for at least 48 hours.",
      ["/api/staging-certification-matrix", "/api/production-launch-bundle"],
      "Attach 48-hour telemetry, visual QA, transcript, support envelope, and rollout plan before production traffic.",
    ),
  ];

  const score = Math.round((lanes.reduce((sum, item) => sum + statusWeight(item.status), 0) / lanes.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    mode: config.swiggyMode,
    score,
    officialSources,
    localReadiness: {
      redirectUriStatus: onboarding.redirectUriAudit.status,
      dcrMode: onboarding.dynamicClientRegistration.mode,
      scopesReady,
      pkceReady: onboarding.checks.some((check) => check.id === "pkce" && check.status === "ready"),
      tokenStorageReady: hasTokenStorage,
    },
    lanes,
    seededDataPlan: buildSeededDataPlan(config),
    stagingPromotion: {
      soakHoursRequired: certification.soakHoursRequired,
      assignedTools: certification.assignedTools,
      totalTools: certification.totalTools,
      requiredEvidence: [
        "Read-only probes for Food, Instamart, and Dineout against seeded staging users.",
        "Guarded write waves for cart mutations, coupon, checkout, order placement, and table booking.",
        "No blind retries on place_food_order, checkout, or book_table.",
        "Redacted staging transcript, runtime telemetry, support envelope, and Visual QA report.",
        "48-hour green soak before production promotion.",
      ],
    },
    commands: [
      command("onboarding", `curl -s ${localCommandBaseUrl}/api/credential-onboarding`, "DCR payload, redirect URI audit, scopes, and external gates."),
      command("auth_status", `curl -s ${localCommandBaseUrl}/api/auth/swiggy/status`, "PKCE callback posture, token source, expiry, and no-token-logging checklist."),
      command("staging_cutover", `curl -s ${localCommandBaseUrl}/api/mcp/staging-cutover`, "First-call staging probes and fail-closed token behavior."),
      command("certification", `curl -s ${localCommandBaseUrl}/api/staging-certification-matrix`, "All 35 tools assigned to certification waves and 48-hour soak gates."),
      command("production_smoke", "npm run verify:production", "End-to-end local proof before sending the access packet."),
    ],
    assertions: [
      "MealPilot can demo locally without Swiggy credentials while preserving the exact staging and production gates.",
      "Dynamic Client Registration, PKCE, exact redirect URI, and three MCP scopes are visible before any live OAuth run.",
      "Staging expects seeded data and no real orders; commercial tools stay confirmation-locked and check-before-retry.",
      "Production promotion is blocked until Swiggy issues credentials and staging remains green for 48 hours.",
    ],
    externalGates: [
      "Operator must submit the official access form and demo video.",
      "Swiggy must issue staging credentials and seeded users.",
      "Swiggy must approve production credentials, final redirect URI, support channel, and any enterprise terms.",
    ],
  };
}
