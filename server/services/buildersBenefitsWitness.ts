import type {
  McpServerCoverage,
  RuntimeTelemetryReport,
  SwiggyBenefitsActivationCenter,
  SwiggyBenefitsActivationLane,
  SwiggyBuildersBenefitsWitness,
  SwiggyBuildersBenefitsWitnessGroup,
  SwiggyBuildersBenefitsWitnessRow,
  SwiggyBuildersBenefitsWitnessStatus,
  UserProfile,
  MealPlan,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";
import { buildBrandComplianceKit } from "./brandCompliance.js";
import { buildSwiggyBenefitsActivationCenter } from "./benefitsActivationCenter.js";
import { buildSwiggyGrowthPartnershipCenter } from "./growthPartnership.js";
import { buildSwiggyPartnerSupportRoom } from "./partnerSupportRoom.js";
import { buildSwiggyQuotaNegotiationCenter } from "./quotaNegotiationCenter.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

type BuildOptions =
  | {
      config: ServerConfig;
      profile: UserProfile;
      coverage: McpServerCoverage[];
      plans: MealPlan[];
      telemetry: RuntimeTelemetryReport;
      benefitsActivation?: SwiggyBenefitsActivationCenter;
    }
  | {
      benefitsActivation: SwiggyBenefitsActivationCenter;
      coverage?: McpServerCoverage[];
    };

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusFor(lane: SwiggyBenefitsActivationLane): SwiggyBuildersBenefitsWitnessStatus {
  if (lane.status === "ready") return "proven";
  if (lane.status === "operator_input") return "operator_gate";
  return "swiggy_gate";
}

function statusWeight(status: SwiggyBuildersBenefitsWitnessStatus) {
  if (status === "proven") return 1;
  if (status === "operator_gate") return 0.86;
  if (status === "swiggy_gate") return 0.78;
  return 0.68;
}

function groupFor(row: SwiggyBuildersBenefitsWitnessRow) {
  if (row.id.includes("api") || row.id.includes("quota") || row.id.includes("experiment")) return "platform";
  if (row.id.includes("support") || row.id.includes("enterprise")) return "operations";
  return "growth";
}

function sourceUrlFor(rowId: string, fallback: string) {
  if (rowId === "quota_expansion") return "https://mcp.swiggy.com/builders/docs/operate/rate-limits/";
  if (rowId === "technical_support") return "https://mcp.swiggy.com/builders/docs/operate/support/";
  if (rowId === "enterprise_support") return "https://mcp.swiggy.com/builders/enterprises/";
  if (rowId === "live_api_access") return "https://mcp.swiggy.com/builders/access/";
  if (rowId === "room_to_experiment") return "https://mcp.swiggy.com/builders/developers/";
  return fallback;
}

function surfaceFor(lane: SwiggyBenefitsActivationLane) {
  if (lane.id === "live_api_access") return "MCP Catalog, Tool Contract Matrix, Staging Certification Matrix";
  if (lane.id === "quota_expansion") return "Quota Negotiation Center, Traffic Readiness Plan, Backpressure Governor";
  if (lane.id === "technical_support") return "Partner Support Room, Support Bridge, SLO Incident Command";
  if (lane.id === "co_branding") return "Brand Compliance Kit, Production Launch Bundle, Showcase Submission Center";
  if (lane.id === "growth_partnership") return "Growth Partnership Center, Showcase Submission Center, Launch Bundle";
  if (lane.id === "showcase_visibility") return "Demo Evidence Director, Submission Console, Reviewer Artifact Vault";
  if (lane.id === "hiring_visibility") return "Builders Launch Story, Coding Agent Governance, Reviewer Artifact Vault";
  if (lane.id === "enterprise_support") return "Enterprise Platform Center, Delegated Auth, Partner Success Desk";
  return lane.mealPilotActivation;
}

function routeOptimizationFor(rowId: string) {
  if (rowId === "live_api_access") return "Keep reads, writes, and commercial confirmations split by server family before credentialed traffic.";
  if (rowId === "quota_expansion") return "Route high-volume read traffic through retry-aware backpressure and pre-campaign capacity review.";
  if (rowId === "room_to_experiment") return "Use local scenario orchestration and synthetic profiles before touching Swiggy-owned production state.";
  if (rowId === "technical_support") return "Attach redacted request ids, traces, and tool context through support-safe report_error flows.";
  if (rowId === "co_branding") return "Keep Powered by Swiggy attribution separate from custom co-branding until written approval exists.";
  if (rowId === "growth_partnership") return "Package metrics, screenshots, demo evidence, and safe claims as one partner review packet.";
  return "Keep the benefit visible as a gated handoff with proof links and explicit owner boundaries.";
}

function riskBoundaryFor(rowId: string) {
  if (rowId === "live_api_access") return "No production API claim is made until Swiggy issues credentials and approves go-live.";
  if (rowId === "quota_expansion") return "Default limits are respected until Swiggy confirms a higher quota or bespoke campaign profile.";
  if (rowId === "technical_support") return "Support automation prepares evidence only; it never sends external email automatically.";
  if (rowId === "co_branding") return "Official logos, custom co-branding, and endorsement claims stay Swiggy-owned gates.";
  if (rowId === "growth_partnership") return "Feature placement and co-marketing are not claimed before Swiggy acceptance.";
  if (rowId === "enterprise_support") return "Partner manager, Slack, SLA, and enterprise contract terms stay Swiggy-owned gates.";
  return "Local experiments remain synthetic and approval-aware until production access exists.";
}

function relatedApisFor(lane: SwiggyBenefitsActivationLane) {
  return unique([
    ...lane.proofLinks,
    lane.id === "live_api_access" ? "/api/swiggy-tool-parity-auditor" : "",
    lane.id === "quota_expansion" ? "/api/swiggy-load-lab" : "",
    lane.id === "technical_support" ? "/api/error-intelligence" : "",
    lane.id === "co_branding" ? "/api/swiggy-showcase-submission-center" : "",
    lane.id === "growth_partnership" ? "/api/swiggy-benefits-activation-center" : "",
    lane.id === "enterprise_support" ? "/api/swiggy-partner-success-desk" : "",
  ]);
}

export function buildSwiggyBuildersBenefitsWitness(options: BuildOptions): SwiggyBuildersBenefitsWitness {
  const atlas = buildSwiggyWebsiteAtlas();
  const activation =
    options.benefitsActivation ??
    ("config" in options
      ? buildSwiggyBenefitsActivationCenter({
      config: options.config,
      profile: options.profile,
      coverage: options.coverage,
      plans: options.plans,
      telemetry: options.telemetry,
        })
      : options.benefitsActivation);
  const coverage = options.coverage ?? [];
  const quota = "config" in options ? buildSwiggyQuotaNegotiationCenter({ config: options.config, plans: options.plans }) : null;
  const growth = buildSwiggyGrowthPartnershipCenter();
  const brand = buildBrandComplianceKit();
  const support = "config" in options ? buildSwiggyPartnerSupportRoom(options) : null;
  const buildersRoot = "https://mcp.swiggy.com/builders/";

  const rows: SwiggyBuildersBenefitsWitnessRow[] = activation.lanes.map((lane) => {
    const status = statusFor(lane);
    return {
      id: lane.id,
      label: lane.label,
      officialSignal: lane.officialBenefit,
      sourceUrl: sourceUrlFor(lane.id, `${atlas.officialSource}#benefits`),
      owner: lane.owner,
      status,
      swiggyPromise: lane.officialBenefit,
      mealPilotSurface: surfaceFor(lane),
      evidence: lane.mealPilotActivation,
      nextAction: lane.nextAction,
      riskBoundary: riskBoundaryFor(lane.id),
      routeOptimization: routeOptimizationFor(lane.id),
      proofLinks: unique([...lane.proofLinks, "/api/swiggy-benefits-activation-center"]),
      relatedApis: relatedApisFor(lane),
    };
  });

  rows.splice(2, 0, {
    id: "room_to_experiment",
    label: "Room to experiment",
    officialSignal: "Builders can prototype and explore Swiggy MCP use cases before production approval.",
    sourceUrl: sourceUrlFor("room_to_experiment", `${buildersRoot}developers/`),
    owner: "MealPilot",
    status: "proven",
    swiggyPromise: "Developers get room to experiment with Swiggy MCP patterns, prompts, resources, and safe local flows.",
    mealPilotSurface: "Scenario Runner, State Orchestrator, Premium Use Case Studio, Innovation Radar",
    evidence: `${growth.readyExperiments}/${growth.totalExperiments} growth experiments are locally ready with ${coverage.length || 3} server families mapped.`,
    nextAction: "Keep experiments synthetic and approval-aware until staging credentials are available.",
    riskBoundary: riskBoundaryFor("room_to_experiment"),
    routeOptimization: routeOptimizationFor("room_to_experiment"),
    proofLinks: [
      "/api/mcp/scenario-runner",
      "/api/mcp/state-orchestrator",
      "/api/premium-use-case-studio",
      "/api/swiggy-innovation-radar",
    ],
    relatedApis: ["/api/mcp/scenario-runner", "/api/mcp/state-orchestrator", "/api/swiggy-growth-partnership"],
  });

  const proofLinks = unique(rows.flatMap((row) => row.proofLinks));
  const groupDefs = [
    { id: "platform", label: "Platform access and experimentation" },
    { id: "operations", label: "Support, quota, and enterprise operations" },
    { id: "growth", label: "Visibility, co-branding, and growth" },
  ];
  const groups: SwiggyBuildersBenefitsWitnessGroup[] = groupDefs.map((group) => {
    const groupRows = rows.filter((row) => groupFor(row) === group.id);
    return {
      id: group.id,
      label: group.label,
      rows: groupRows.length,
      proven: groupRows.filter((row) => row.status === "proven").length,
      operatorGates: groupRows.filter((row) => row.status === "operator_gate").length,
      swiggyGates: groupRows.filter((row) => row.status === "swiggy_gate").length,
      watch: groupRows.filter((row) => row.status === "watch").length,
      proofLinks: unique(groupRows.flatMap((row) => row.proofLinks)),
    };
  });

  const swiggyGates = rows.filter((row) => row.status === "swiggy_gate").length;
  const watch = rows.filter((row) => row.status === "watch").length;
  const decision: SwiggyBuildersBenefitsWitness["decision"] =
    swiggyGates > 0 || watch > 0 ? "benefits_watch" : "benefits_ready";
  const officialTools = coverage.reduce((sum, server) => sum + server.totalTools, 0) || 35;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round((rows.reduce((sum, row) => sum + statusWeight(row.status), 0) / rows.length) * 100),
    decision,
    officialSources: unique([
      buildersRoot,
      `${buildersRoot}developers/`,
      `${buildersRoot}enterprises/`,
      `${buildersRoot}access/`,
      "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
      "https://mcp.swiggy.com/builders/docs/operate/support/",
      ...activation.officialSources,
    ]),
    totals: {
      rows: rows.length,
      proven: rows.filter((row) => row.status === "proven").length,
      operatorGates: rows.filter((row) => row.status === "operator_gate").length,
      swiggyGates,
      watch,
      proofLinks: proofLinks.length,
      swiggyMcpServers: coverage.length || 3,
      officialTools,
      activationCtas: activation.totals.activationCtas,
    },
    rows,
    groups,
    commands: [
      {
        id: "benefits_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-benefits-witness",
        proves: "Every official What You Get benefit is mapped to owner, gate, proof links, and product surface.",
        expectedSignal: "totals.rows >= 9 && totals.proofLinks >= 20",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Production smoke keeps benefits witness aligned with activation, quota, support, growth, and brand evidence.",
        expectedSignal: "benefitsWitnessScore >= 80",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Benefits Witness card is captured with every reviewer-critical Launch Center surface.",
        expectedSignal: "79 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Every Benefits Activation lane is represented in the Builders Benefits Witness.",
      "The official What You Get module is tied to local proof routes without claiming Swiggy-owned approvals.",
      `Quota asks ${quota ? quota.totals.readyAsks : 0}/${quota ? quota.totals.asks : 0}, support channels ${
        support ? support.totals.channels : 0
      }, brand rules ${brand.rules.filter((rule) => rule.status === "ready").length}/${brand.rules.length}, and growth experiments ${
        growth.readyExperiments
      }/${growth.totalExperiments} are cross-referenced.`,
      "Live API access, quota expansion, co-branding, showcase placement, growth partnership, and enterprise support remain explicitly gated.",
    ],
    externalGates: [
      "Swiggy must approve production credentials, quota increases, co-branding, showcase placement, enterprise support, and partner-manager access.",
      "Operators must submit access forms, demos, emails, and growth asks manually with current proof links.",
      "Public Builders copy can drift; Website Atlas and this witness must be refreshed before final submission.",
    ],
  };
}
