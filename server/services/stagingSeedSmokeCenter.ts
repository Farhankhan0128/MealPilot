import type { ServerConfig } from "../config.js";
import type {
  SandboxCredentialWorkbench,
  StagingCertificationMatrix,
  SwiggyServer,
  SwiggyStagingCredentialDrillReport,
  SwiggyStagingSeedServerMatrix,
  SwiggyStagingSeedSmokeCenter,
  SwiggyStagingSeedSmokeStatus,
  SwiggyStagingSmokeWave,
} from "../../src/domain/types.js";
import { buildSandboxCredentialWorkbench } from "./sandboxCredentialWorkbench.js";
import { buildStagingCertificationMatrix } from "./stagingCertification.js";
import { buildSwiggyStagingCredentialDrill } from "./stagingCredentialDrill.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyStagingSeedSmokeStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.82;
  return 0.7;
}

function serverFixture(server: SwiggyServer) {
  if (server === "food") {
    return {
      seededIdentity: "Food staging user with one serviceable saved address, active restaurant catalog, disposable cart, and historical order.",
      fixtures: ["saved address", "open restaurant", "menu item with variants", "coupon candidate", "trackable order"],
      mutationTools: ["update_food_cart", "apply_food_coupon", "flush_food_cart"],
      commercialTool: "place_food_order",
      supportTool: "report_error",
    };
  }

  if (server === "instamart") {
    return {
      seededIdentity: "Instamart staging user with serviceable address, inventory, go-to products, disposable cart, and mock checkout lane.",
      fixtures: ["saved address", "available product", "go-to item", "replaceable cart", "trackable grocery order"],
      mutationTools: ["update_cart", "apply_coupon", "clear_cart"],
      commercialTool: "checkout",
      supportTool: "report_error",
    };
  }

  return {
    seededIdentity: "Dineout staging user with saved city, discoverable restaurant, free slot, paid-cart fixture, and booking-status readback.",
    fixtures: ["saved location", "restaurant details", "free booking slot", "dining bill cart", "booking status id"],
    mutationTools: ["create_cart"],
    commercialTool: "book_table",
    supportTool: "report_error",
  };
}

function stagingStatus(config: ServerConfig, drill: SwiggyStagingCredentialDrillReport): SwiggyStagingSeedSmokeStatus {
  if (config.swiggyMode === "staging" && drill.credentialSignal.stagingVerified) return "operator_input";
  return "credential_gate";
}

function buildServerMatrix(
  config: ServerConfig,
  sandbox: SandboxCredentialWorkbench,
  drill: SwiggyStagingCredentialDrillReport,
): SwiggyStagingSeedServerMatrix[] {
  return sandbox.seededDataPlan.map((seed) => {
    const fixture = serverFixture(seed.server);
    return {
      server: seed.server,
      endpoint: seed.stagingEndpoint,
      seededIdentity: fixture.seededIdentity,
      requiredFixtures: fixture.fixtures,
      firstReadTool: seed.firstReadTool,
      mutationSmokeTools: fixture.mutationTools,
      commercialSmokeTool: fixture.commercialTool,
      supportSmokeTool: fixture.supportTool,
      status: stagingStatus(config, drill),
      evidenceLinks: [
        "/api/sandbox-credential-workbench",
        "/api/swiggy-staging-credential-drill",
        "/api/staging-certification-matrix",
      ],
    };
  });
}

function smokeWave(input: SwiggyStagingSmokeWave): SwiggyStagingSmokeWave {
  return input;
}

function buildSmokeWaves(
  config: ServerConfig,
  drill: SwiggyStagingCredentialDrillReport,
  certification: StagingCertificationMatrix,
): SwiggyStagingSmokeWave[] {
  const status = stagingStatus(config, drill);
  const certifiedTools = certification.waves.flatMap((wave) => wave.tools);
  const readTools = certifiedTools
    .filter((tool) => tool.routeClass === "read")
    .slice(0, 8)
    .map((tool) => `${tool.server}.${tool.tool}`);
  const mutationTools = certifiedTools
    .filter((tool) => tool.routeClass === "cart_mutation" || tool.routeClass === "coupon")
    .slice(0, 8)
    .map((tool) => `${tool.server}.${tool.tool}`);
  const commercialTools = certifiedTools
    .filter((tool) => tool.routeClass === "commercial_action")
    .map((tool) => `${tool.server}.${tool.tool}`);
  const supportTools = certifiedTools
    .filter((tool) => tool.routeClass === "support")
    .map((tool) => `${tool.server}.${tool.tool}`);

  return [
    smokeWave({
      sequence: 1,
      id: "credential_and_seed",
      label: "Credential and seeded identity intake",
      scope: "credential",
      tools: ["auth/register", "auth/authorize", "auth/token"],
      exitCriteria: [
        "Swiggy staging bearer token is present only in runtime memory or vault.",
        "Seeded Food, Instamart, and Dineout users are assigned.",
        "Redirect URI and scopes match the access packet.",
      ],
      stopRules: ["Stop on missing token, unassigned seeded identity, scope mismatch, or redirect mismatch."],
      status,
    }),
    smokeWave({
      sequence: 2,
      id: "read_discovery",
      label: "Read and discovery smoke",
      scope: "read",
      tools: readTools,
      exitCriteria: [
        "Every server returns a redacted JSON-RPC response sample.",
        "Schema, latency, request id, session id, and cache behavior are captured.",
      ],
      stopRules: ["Stop on 401/419, missing request id, PII leakage, or stale location/cart context."],
      status,
    }),
    smokeWave({
      sequence: 3,
      id: "mutation_refresh",
      label: "Mutation with authoritative refresh",
      scope: "mutation",
      tools: mutationTools,
      exitCriteria: [
        "Every cart/address/coupon mutation has before and after readback.",
        "Retries preserve identical session and arguments.",
      ],
      stopRules: ["Stop on ambiguous mutation result until the authoritative cart/address read resolves state."],
      status,
    }),
    smokeWave({
      sequence: 4,
      id: "commercial_confirmation",
      label: "Commercial confirmation smoke",
      scope: "commercial",
      tools: commercialTools,
      exitCriteria: [
        "Each commercial action has explicit visible confirmation.",
        "Status read follows every place_food_order, checkout, or book_table attempt.",
      ],
      stopRules: ["Never blind-retry order, checkout, or booking after 5xx, network loss, or unknown JSON-RPC outcome."],
      status,
    }),
    smokeWave({
      sequence: 5,
      id: "support_escalation",
      label: "Support and report_error smoke",
      scope: "support",
      tools: supportTools,
      exitCriteria: [
        "Food, Instamart, and Dineout support payloads include redacted toolContext.",
        "builders@swiggy.in escalation draft includes environment, server, tool, session id, request id, and timestamp.",
      ],
      stopRules: ["Stop if raw token, full address, payment data, phone, or email appears in support payloads."],
      status,
    }),
    smokeWave({
      sequence: 6,
      id: "promotion_soak",
      label: "48-hour promotion soak",
      scope: "promotion",
      tools: ["verify:production", "verify:visual", "export:builder-packet"],
      exitCriteria: [
        `${certification.assignedTools}/${certification.totalTools} tools remain assigned to staging waves.`,
        `${certification.soakHoursRequired}-hour green soak, visual evidence, runtime telemetry, and support envelope are attached.`,
      ],
      stopRules: ["Stop production promotion if any staging smoke, visual target, support packet, or telemetry redaction check regresses."],
      status: "operator_input",
    }),
  ];
}

export function buildSwiggyStagingSeedSmokeCenter(options: {
  config: ServerConfig;
  sandbox?: SandboxCredentialWorkbench;
  drill?: SwiggyStagingCredentialDrillReport;
  certification?: StagingCertificationMatrix;
}): SwiggyStagingSeedSmokeCenter {
  const sandbox = options.sandbox ?? buildSandboxCredentialWorkbench(options.config);
  const certification = options.certification ?? buildStagingCertificationMatrix(options.config);
  const drill = options.drill ?? buildSwiggyStagingCredentialDrill({ config: options.config, sandbox, certification });
  const serverMatrix = buildServerMatrix(options.config, sandbox, drill);
  const smokeWaves = buildSmokeWaves(options.config, drill, certification);
  const evidenceLinks = unique([
    ...serverMatrix.flatMap((server) => server.evidenceLinks),
    "/api/telemetry/runtime",
    "/api/observability/traces",
  ]);
  const stopRules = smokeWaves.flatMap((wave) => wave.stopRules);
  const score = Math.round(
    ([...serverMatrix.map((server) => server.status), ...smokeWaves.map((wave) => wave.status)].reduce(
      (sum, status) => sum + statusWeight(status),
      0,
    ) /
      (serverMatrix.length + smokeWaves.length)) *
      100,
  );

  return {
    generatedAt: new Date().toISOString(),
    score,
    mode: options.config.swiggyMode,
    officialSources,
    totals: {
      servers: serverMatrix.length,
      seededFixtures: serverMatrix.reduce((sum, server) => sum + server.requiredFixtures.length, 0),
      smokeWaves: smokeWaves.length,
      credentialGates: [...serverMatrix, ...smokeWaves].filter((item) => item.status === "credential_gate").length,
      stopRules: stopRules.length,
      evidenceLinks: evidenceLinks.length,
    },
    serverMatrix,
    smokeWaves,
    telemetryEvidence: [
      {
        id: "runtime_event_contract",
        label: "Runtime event contract",
        requiredFields: ["sessionId", "requestId", "server", "tool", "status", "durationMs", "redactionApplied"],
        evidenceLinks: ["/api/telemetry/runtime", "/api/audit-ledger"],
      },
      {
        id: "trace_contract",
        label: "Trace contract",
        requiredFields: ["traceId", "spanId", "server", "tool", "routeClass", "retryDecision", "supportCorrelationId"],
        evidenceLinks: ["/api/observability/traces", "/api/support/bridge"],
      },
      {
        id: "promotion_packet",
        label: "Promotion packet",
        requiredFields: ["visualQaReport", "builderPacket", "stagingTranscript", "supportEnvelope", "48hSoak"],
        evidenceLinks: ["/api/visual-qa-center", "/api/builder-packet-export", "/api/staging-certification-matrix"],
      },
    ],
    operatorRunbook: [
      {
        sequence: 1,
        label: "Confirm seeded staging users and scopes",
        command: `curl -s http://localhost:${options.config.port}/api/swiggy-staging-seed-smoke-center`,
        proves: "Food, Instamart, and Dineout seeded fixtures, first reads, and credential gates are visible.",
      },
      {
        sequence: 2,
        label: "Run production smoke before requesting live staging calls",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Local contract, OpenAPI, route, support, telemetry, and packet coverage are green.",
      },
      {
        sequence: 3,
        label: "Capture visual and packet artifacts",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual && MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet",
        proves: "Reviewer screenshots and access packet include the staging seed and smoke surface.",
      },
    ],
    assertions: [
      "Seeded staging data is required before any live Swiggy MCP write or commercial action can be certified.",
      "Every server starts with read-only smoke before mutation, commercial action, or support report drills.",
      "Commercial tools stay confirmation-locked and use status readback before retry after any ambiguous outcome.",
      "Promotion requires telemetry, trace, support, visual QA, and 48-hour soak evidence.",
    ],
    externalGates: [
      "Swiggy must issue staging credentials, seeded identities, and OAuth client approval.",
      "Swiggy must confirm whether staging commercial actions create no real orders, checkouts, bookings, or payments.",
      "Production credentials remain blocked until all seed/smoke waves and the 48-hour soak are accepted.",
    ],
  };
}
