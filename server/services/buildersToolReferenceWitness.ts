import type {
  SwiggyBuildersToolReferenceWitness,
  SwiggyBuildersToolReferenceWitnessGroup,
  SwiggyBuildersToolReferenceWitnessRow,
  SwiggyBuildersToolReferenceWitnessStatus,
  SwiggyServer,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";
import { buildSwiggyDocsTwinExplorer } from "./docsTwinExplorer.js";
import { buildSwiggyScenarioRunner } from "./scenarioRunner.js";
import { buildMcpToolLabReport } from "./toolLab.js";
import { buildSwiggyToolContractMatrix } from "./toolContractMatrix.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function weightFor(status: SwiggyBuildersToolReferenceWitnessStatus) {
  if (status === "proven") return 1;
  if (status === "ready") return 0.94;
  if (status === "watch") return 0.78;
  if (status === "operator_gate") return 0.72;
  return 0.64;
}

function groupFor(row: SwiggyBuildersToolReferenceWitnessRow) {
  if (row.kind === "food_reference" || row.kind === "instamart_reference" || row.kind === "dineout_reference") {
    return "server_references";
  }
  if (row.kind === "contract_matrix" || row.kind === "tool_lab" || row.kind === "scenario_runner") {
    return "executable_contracts";
  }
  if (row.kind === "docs_coverage") return "docs_and_drift";
  return "commercial_safety";
}

function row(input: SwiggyBuildersToolReferenceWitnessRow): SwiggyBuildersToolReferenceWitnessRow {
  return input;
}

function serverCoverage(coverage: ReturnType<typeof buildMcpCoverage>, server: SwiggyServer) {
  return coverage.find((item) => item.server === server);
}

export async function buildSwiggyBuildersToolReferenceWitness(): Promise<SwiggyBuildersToolReferenceWitness> {
  const coverage = buildMcpCoverage();
  const [contractMatrix, toolLab, scenarioRunner] = await Promise.all([
    buildSwiggyToolContractMatrix(),
    buildMcpToolLabReport(),
    buildSwiggyScenarioRunner(),
  ]);
  const docsCoverage = buildSwiggyDocsCoverage();
  const docsTwin = buildSwiggyDocsTwinExplorer();

  const food = serverCoverage(coverage, "food");
  const instamart = serverCoverage(coverage, "instamart");
  const dineout = serverCoverage(coverage, "dineout");
  const officialTools = coverage.reduce((sum, item) => sum + item.totalTools, 0);
  const commercialTools = contractMatrix.contracts.filter((contract) => contract.behavior === "commercial").length;
  const mutatingTools = contractMatrix.contracts.filter((contract) => contract.behavior === "mutating").length;
  const trackingTools = contractMatrix.contracts.filter((contract) => contract.routeClass === "tracking").length;

  const rows = [
    row({
      id: "food_reference_contract",
      label: "Food reference contract",
      kind: "food_reference",
      officialSignal: "Swiggy Food exposes the delivery planning, cart, coupon, order, tracking, and support tool family.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/reference/food/",
      owner: "MealPilot",
      status: food?.totalTools === 14 ? "proven" : "watch",
      mealPilotSurface: "MCP Catalog, Tool Contract Matrix, Tool Lab",
      evidence: `${food?.totalTools ?? 0}/14 Food tools are cataloged with ${food?.demoReady ?? 0} demo-ready and ${food?.guarded ?? 0} guarded lanes.`,
      routeOptimization:
        "Use Food reads for address, restaurant, menu, cart, coupon, order, and tracking state before any place_food_order action.",
      riskBoundary:
        "Food cart mutation, coupon application, and order placement remain confirmation-gated and never run as hidden background actions.",
      nextAction: "Keep Food reference rows synchronized with llms manifest drift and staging contract readbacks.",
      proofLinks: ["/api/mcp/catalog", "/api/swiggy-tool-contract-matrix", "/api/mcp/tool-lab", "/api/swiggy-developer-quickstart"],
      relatedApis: ["/api/swiggy-journey-compiler", "/api/swiggy-confirmation-command-center"],
    }),
    row({
      id: "instamart_reference_contract",
      label: "Instamart reference contract",
      kind: "instamart_reference",
      officialSignal: "Swiggy Instamart exposes grocery address, product search, go-to items, cart, checkout, order, tracking, and support tools.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/reference/instamart/",
      owner: "MealPilot",
      status: instamart?.totalTools === 13 ? "proven" : "watch",
      mealPilotSurface: "MCP Catalog, Tool Contract Matrix, Tool Lab",
      evidence: `${instamart?.totalTools ?? 0}/13 Instamart tools are cataloged with ${instamart?.demoReady ?? 0} demo-ready and ${instamart?.guarded ?? 0} guarded lanes.`,
      routeOptimization:
        "Preserve address serviceability, exact variants, go-to cadence, cart truth, checkout minimums, and order status as separate Instamart states.",
      riskBoundary:
        "Address writes, cart replacement, clear-cart, and checkout stay user-approved, with full cart readback before any checkout path.",
      nextAction: "Replay Instamart fixtures against seeded staging users once Swiggy issues credentials.",
      proofLinks: ["/api/mcp/catalog", "/api/swiggy-tool-contract-matrix", "/api/mcp/tool-lab", "/api/swiggy-staging-seed-smoke-center"],
      relatedApis: ["/api/swiggy-cart-mutation-workbench", "/api/swiggy-payment-truth-center"],
    }),
    row({
      id: "dineout_reference_contract",
      label: "Dineout reference contract",
      kind: "dineout_reference",
      officialSignal: "Swiggy Dineout exposes saved locations, restaurant discovery, details, slots, cart, booking, booking status, and support tools.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/reference/dineout/",
      owner: "MealPilot",
      status: dineout?.totalTools === 8 ? "proven" : "watch",
      mealPilotSurface: "MCP Catalog, Tool Contract Matrix, Tool Lab",
      evidence: `${dineout?.totalTools ?? 0}/8 Dineout tools are cataloged with ${dineout?.demoReady ?? 0} demo-ready and ${dineout?.guarded ?? 0} guarded lanes.`,
      routeOptimization:
        "Carry the same saved-location or coordinate context through Dineout search, details, slots, cart, booking, and booking-status probes.",
      riskBoundary:
        "Booking confirmation, free-booking status, paid-deal support, and venue availability remain Swiggy-authoritative and user-confirmed.",
      nextAction: "Keep Dineout slot and booking fixtures paired with non-blind booking-status recovery checks.",
      proofLinks: ["/api/mcp/catalog", "/api/swiggy-tool-contract-matrix", "/api/mcp/tool-lab", "/api/swiggy-dineout-precision-center"],
      relatedApis: ["/api/swiggy-dineout-precision-center", "/api/swiggy-confirmation-command-center"],
    }),
    row({
      id: "contract_matrix_coverage",
      label: "Contract matrix coverage",
      kind: "contract_matrix",
      officialSignal: "Every reference tool needs parameters, response-envelope handling, preconditions, retry policy, and fixture evidence.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/reference/",
      owner: "MealPilot",
      status: contractMatrix.totalTools === 35 && contractMatrix.score >= 95 ? "proven" : "watch",
      mealPilotSurface: "Swiggy Tool Contract Matrix",
      evidence: `${contractMatrix.totalTools} contract rows, ${contractMatrix.totalParameters} parameters, ${mutatingTools} mutating tools, and ${commercialTools} commercial tools are modeled.`,
      routeOptimization:
        "Classify calls into read, cart mutation, coupon, commercial action, tracking, and support lanes so route planners can minimize calls without weakening safety.",
      riskBoundary:
        "Fixture previews are local contract evidence; live upstream schema drift still requires Swiggy staging and production readbacks.",
      nextAction: "Compare contract rows against live docs twins before every access submission and after any llms manifest drift.",
      proofLinks: ["/api/swiggy-tool-contract-matrix", "/api/swiggy-docs-twin-explorer", "/api/swiggy-upstream-watch"],
      relatedApis: ["/api/error-intelligence", "/api/mcp/backpressure-governor"],
    }),
    row({
      id: "tool_lab_probe_coverage",
      label: "Tool Lab probe coverage",
      kind: "tool_lab",
      officialSignal: "Every official reference tool should have a runnable JSON-RPC tools/call sample before live credentials exist.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/start/developer/",
      owner: "MealPilot",
      status: toolLab.totalTools === 35 && toolLab.callableTools === 35 ? "proven" : "watch",
      mealPilotSurface: "MCP Tool Lab",
      evidence: `${toolLab.callableTools}/${toolLab.totalTools} local probes are callable, including ${toolLab.guardedTools} guarded and ${toolLab.commercialTools} commercial probes.`,
      routeOptimization:
        "Use mock probes to verify route shape, argument redaction, support payloads, and non-blind retry policy before swapping to live MCP.",
      riskBoundary:
        "Mock probe success is not live Swiggy approval; staging credentials, seeded accounts, quotas, and live payments remain external gates.",
      nextAction: "Attach Tool Lab output to every reviewer packet and rerun after each new Swiggy reference page changes.",
      proofLinks: ["/api/mcp/tool-lab", "/api/sessions/demo/staging-transcript", "/api/reviewer-artifact-vault"],
      relatedApis: ["/api/mcp/catalog", "/api/swiggy-staging-seed-smoke-center"],
    }),
    row({
      id: "scenario_runner_recipe_coverage",
      label: "Official recipe scenario coverage",
      kind: "scenario_runner",
      officialSignal: "Swiggy's Food, grocery, table-booking, and combined recipes must remain executable with explicit guards.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
      owner: "MealPilot",
      status:
        scenarioRunner.uniqueToolsCovered === 35 && scenarioRunner.totalOfficialTools === 35 && scenarioRunner.score >= 90
          ? "proven"
          : "watch",
      mealPilotSurface: "Scenario Runner and Journey Compiler",
      evidence: `${scenarioRunner.uniqueToolsCovered}/${scenarioRunner.totalOfficialTools} tools are covered across ${scenarioRunner.totalScenarios} official recipe scenarios and ${scenarioRunner.totalSteps} route steps.`,
      routeOptimization:
        "Treat discovery fanout and status reads as optimizable, while cart mutation and commercial actions remain serialized behind confirmation gates.",
      riskBoundary:
        "Scenario success is local proof until Swiggy issues seeded staging users and confirms production quota, support, and payment behavior.",
      nextAction: "Promote representative Food, Instamart, Dineout, and combined traces into staging transcript export.",
      proofLinks: ["/api/mcp/scenario-runner", "/api/swiggy-journey-compiler", "/api/swiggy-route-optimization"],
      relatedApis: ["/api/staging-transcript", "/api/production-launch-bundle"],
    }),
    row({
      id: "docs_reference_coverage",
      label: "Docs reference and twin coverage",
      kind: "docs_coverage",
      officialSignal: "Reference docs, llms links, rendered pages, and markdown twins need drift checks before coding-agent ingestion.",
      sourceUrl: "https://mcp.swiggy.com/builders/llms.txt",
      owner: "Joint",
      status:
        docsCoverage.totalPages >= 69 && docsTwin.totals.referenceTools === 35 && docsTwin.totals.externalGates === 0
          ? "proven"
          : "watch",
      mealPilotSurface: "Docs Coverage, Docs Twin Explorer, llms Manifest Verifier",
      evidence: `${docsCoverage.totalPages} docs pages, ${docsTwin.totals.markdownTwins} markdown twins, ${docsTwin.totals.renderedPages} rendered pages, and ${docsTwin.totals.referenceTools} reference tools are tracked.`,
      routeOptimization:
        "Use docs twins and llms links as the source refresh loop for tool counts, recipe steps, error envelopes, and ship-to-production gates.",
      riskBoundary:
        "Live Swiggy docs remain authoritative; fallback copies are marked as reviewer evidence only when public pages or llms manifests are unreachable.",
      nextAction: "Re-run docs coverage and llms manifest verification before final access submission.",
      proofLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer", "/api/swiggy-llms-manifest-verifier"],
      relatedApis: ["/api/swiggy-source-intelligence", "/api/swiggy-source-freeze-diff"],
    }),
    row({
      id: "commercial_safety_classes",
      label: "Commercial safety classes",
      kind: "commercial_safety",
      officialSignal: "Commercial and mutating Swiggy calls require explicit user intent, confirmation, status probes, and support-safe error handling.",
      sourceUrl: "https://mcp.swiggy.com/builders/docs/reference/errors/",
      owner: "Joint",
      status: commercialTools === 3 && trackingTools >= 4 ? "proven" : "watch",
      mealPilotSurface: "Commercial Action Guard, Confirmation Command Center, Error Intelligence",
      evidence: `${commercialTools} commercial tools, ${mutatingTools} mutating tools, ${trackingTools} tracking/status tools, and ${contractMatrix.commonErrorEnvelope.plannedCoreCodes.length} planned core error codes are classified.`,
      routeOptimization:
        "Pair every protected action with preflight reads, single-flight execution, post-action status probes, and redacted support packets.",
      riskBoundary:
        "Food place order, Instamart checkout, Dineout booking, paid deals, retries, cancellation, and support actions remain user-confirmed and Swiggy-authoritative.",
      nextAction: "Keep every new route bound to Commercial Action Guard before it appears in the Launch Center.",
      proofLinks: ["/api/mcp/commercial-action-guard", "/api/swiggy-confirmation-command-center", "/api/error-intelligence", "/api/support/bridge"],
      relatedApis: ["/api/swiggy-cancellation-care-center", "/api/support/bridge"],
    }),
  ];

  const proofLinks = unique(rows.flatMap((item) => item.proofLinks));
  const groupDefs = [
    { id: "server_references", label: "Server references" },
    { id: "executable_contracts", label: "Executable contracts" },
    { id: "docs_and_drift", label: "Docs and drift" },
    { id: "commercial_safety", label: "Commercial safety" },
  ];
  const groups: SwiggyBuildersToolReferenceWitnessGroup[] = groupDefs.map((group) => {
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
      swiggyGates > 1 ? "tool_reference_blocked" : watch > 0 || operatorGates > 0 || swiggyGates > 0 ? "tool_reference_watch" : "tool_reference_ready",
    officialSources: unique([
      ...contractMatrix.officialSources,
      ...scenarioRunner.officialSources,
      docsCoverage.officialSource,
      ...docsTwin.officialSources,
      "https://mcp.swiggy.com/builders/llms.txt",
    ]),
    totals: {
      rows: rows.length,
      proven: rows.filter((item) => item.status === "proven").length,
      ready: rows.filter((item) => item.status === "ready").length,
      watch,
      operatorGates,
      swiggyGates,
      proofLinks: proofLinks.length,
      servers: coverage.length,
      officialTools,
      foodTools: food?.totalTools ?? 0,
      instamartTools: instamart?.totalTools ?? 0,
      dineoutTools: dineout?.totalTools ?? 0,
      contractRows: contractMatrix.totalTools,
      contractParameters: contractMatrix.totalParameters,
      toolLabProbes: toolLab.totalTools,
      scenarioToolsCovered: scenarioRunner.uniqueToolsCovered,
      docsPages: docsCoverage.totalPages,
      commercialTools,
    },
    rows,
    groups,
    commands: [
      {
        id: "tool_reference_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-tool-reference-witness",
        proves: "Food 14, Instamart 13, Dineout 8, contract rows, probes, scenarios, docs twins, and commercial safety are witnessed together.",
        expectedSignal: "totals.officialTools === 35 && totals.contractRows === 35",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke keeps the tool reference witness aligned with catalog, contract, Tool Lab, scenario, docs, and safety evidence.",
        expectedSignal: "toolReferenceWitnessScore >= 90",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Tool Reference Witness card is captured with every reviewer-critical Launch Center surface.",
        expectedSignal: "78 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Food, Instamart, and Dineout tool counts remain 14, 13, and 8 until Swiggy publishes a new authoritative contract.",
      "Every official tool has a catalog row, contract row, local JSON-RPC probe, docs source, and safety class.",
      "Route optimization never bypasses confirmation, status probes, redaction, OAuth, or Swiggy-owned production approval.",
      "Docs twins, llms manifests, Tool Lab probes, and production smoke form one reviewer-readable reference receipt.",
    ],
    externalGates: [
      "Live contract drift checks require Swiggy staging credentials, seeded users, OAuth approvals, quotas, and production access.",
      "Paid Dineout, online payment, symbolic error.code behavior, and live support dashboards remain Swiggy-owned gates.",
      "Operators must rerun docs, Tool Lab, scenario, visual, packet, and production verification after every official reference update.",
    ],
  };
}
