import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  McpServerCoverage,
  SwiggyBuildersCompletionLedger,
  SwiggyBuildersCompletionRequirement,
  SwiggyBuildersCompletionStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildBuilderPacketExport } from "./builderPacketExport.js";
import { buildLaunchBundle } from "./launchBundle.js";
import { buildReviewerArtifactVault } from "./reviewerArtifactVault.js";
import { buildSwiggyBuildersMap } from "./swiggyBuildersMap.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";
import { buildVisualQaCenter } from "./visualQaCenter.js";

const officialSource = "https://mcp.swiggy.com/builders/";
const officialSources = [
  officialSource,
  `${officialSource}developers/`,
  `${officialSource}enterprises/`,
  `${officialSource}access/`,
  `${officialSource}docs/`,
  `${officialSource}docs/start/enterprise/`,
  `${officialSource}docs/start/enterprise/delegated-auth/`,
  `${officialSource}docs/build/recipes/combined/`,
  `${officialSource}docs/operate/sla/`,
  `${officialSource}llms.txt`,
  `${officialSource}llms-full.txt`,
];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyBuildersCompletionStatus) {
  if (status === "proven") return 1;
  if (status === "watch") return 0.82;
  if (status === "operator_gate") return 0.68;
  return 0.52;
}

function requirement(input: SwiggyBuildersCompletionRequirement): SwiggyBuildersCompletionRequirement {
  return input;
}

export function buildSwiggyBuildersCompletionLedger(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
}): SwiggyBuildersCompletionLedger {
  const atlas = buildSwiggyWebsiteAtlas();
  const buildersMap = buildSwiggyBuildersMap();
  const docsCoverage = buildSwiggyDocsCoverage();
  const reviewerVault = buildReviewerArtifactVault();
  const visualQa = buildVisualQaCenter();
  const launchBundle = buildLaunchBundle({ config: options.config, latestPlan: options.latestPlan });
  const builderPacket = buildBuilderPacketExport(options);
  const footerLinks = atlas.footerGroups.reduce((sum, group) => sum + group.links.length, 0);

  const requirements = [
    requirement({
      id: "complete_public_site",
      group: "source_coverage",
      label: "Complete public Builders website",
      objectiveSignal: "Explore every page, module, CTA, header, footer, and public source link on the Builders site.",
      evidenceSummary: `${buildersMap.pages.length} pages, ${atlas.pages.reduce((sum, page) => sum + page.modules.length, 0)} modules, ${atlas.ctas.length} primary CTAs, ${atlas.globalHeader.length} header links, ${atlas.docsHeader.length} docs links, and ${footerLinks} footer links are inventoried.`,
      frontendSurface: "Launch Center Website Atlas, Site Parity, Page Mesh, Deep Site Map, Module Intelligence, Capability Traceability, and Homepage Signal Coverage cards.",
      backendEndpoints: [
        "/api/swiggy-website-atlas",
        "/api/swiggy-builders-site-parity",
        "/api/swiggy-builders-page-mesh",
        "/api/swiggy-deep-site-map",
        "/api/swiggy-builders-module-intelligence",
        "/api/swiggy-capability-traceability",
        "/api/swiggy-homepage-signal-coverage",
      ],
      docsProof: ["README.md", "docs/development.md", "docs/swiggy-builders-research-and-product-plan.md"],
      testProof: ["server/app.test.ts Website Atlas/Page Mesh/Capability Traceability/Homepage Signal assertions", "scripts/verify-production.mjs source coverage assertions"],
      owner: "MealPilot",
      status: "proven",
      proofLinks: [
        "/api/swiggy-website-atlas",
        "/api/swiggy-builders-page-mesh",
        "/api/swiggy-deep-site-map",
        "/api/swiggy-homepage-signal-coverage",
      ],
      remainingGate: "Final access submission still requires a human browser re-browse when Swiggy public pages change.",
      nextAction: "Run Source Freeze Diff before demo recording or packet submission.",
    }),
    requirement({
      id: "all_mcp_servers_and_tools",
      group: "mcp_integration",
      label: "All Swiggy MCP servers and APIs",
      objectiveSignal: "Use all MCP servers and APIs offered by Swiggy: Food, Instamart, Dineout, tools, resources, prompts, widgets, OAuth, and support surfaces.",
      evidenceSummary: `${buildersMap.servers.length} MCP server families and ${buildersMap.totalOfficialTools}/${buildersMap.totalOfficialTools} official tools are covered with local probes, contracts, route classes, scenario traces, and safety gates.`,
      frontendSurface: "Launch Center MCP Gateway, Tool Lab, Tool Contract Matrix, Scenario Runner, Capability Registry, Resource & Prompt Studio, Widget Runtime, and Tool Parity cards.",
      backendEndpoints: [
        "/api/mcp/catalog",
        "/api/mcp/tool-lab",
        "/api/mcp/tool-contract-matrix",
        "/api/mcp/scenario-runner",
        "/api/mcp/capability-registry",
        "/api/mcp/resource-prompt-studio",
        "/api/mcp/widget-runtime",
        "/api/swiggy-tool-parity-auditor",
      ],
      docsProof: ["README.md", "docs/architecture.md", "docs/development.md"],
      testProof: ["server/app.test.ts MCP coverage assertions", "scripts/verify-production.mjs 35/35 tool coverage assertions"],
      owner: "MealPilot",
      status: "proven",
      proofLinks: ["/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/mcp/scenario-runner", "/api/swiggy-tool-parity-auditor"],
      remainingGate: "Live staging and production calls require Swiggy-issued OAuth/client credentials.",
      nextAction: "Promote any new Swiggy reference tool through Tool Lab, contracts, scenarios, route optimizer, docs, tests, and verifier.",
    }),
    requirement({
      id: "route_optimization",
      group: "product_depth",
      label: "Route optimization and differentiated product depth",
      objectiveSignal: "Optimize MCP server routes and identify deep, innovative MealPilot use cases that are distinct from generic competitors.",
      evidenceSummary: "Official Food, Instamart, Dineout, combined, premium, voice, widget, guest, household, concierge, and recovery routes are modeled with saved calls, parallel reads, cross-server handoffs, and confirmation boundaries.",
      frontendSurface: "Launch Center Route Optimizer, Journey Compiler, Premium Use Case Studio, Premium Concierge, Agent Benchmark, and Innovation Radar cards.",
      backendEndpoints: [
        "/api/swiggy-route-optimizer",
        "/api/swiggy-journey-compiler",
        "/api/premium-use-case-studio",
        "/api/premium-concierge-itinerary",
        "/api/swiggy-agent-experience-benchmark",
        "/api/swiggy-innovation-radar",
      ],
      docsProof: ["README.md", "docs/swiggy-builders-research-and-product-plan.md", "docs/roadmap.md"],
      testProof: ["scripts/verify-production.mjs route optimizer, journey compiler, premium use case, concierge, benchmark, and innovation assertions"],
      owner: "MealPilot",
      status: "proven",
      proofLinks: [
        "/api/swiggy-route-optimizer",
        "/api/swiggy-journey-compiler",
        "/api/premium-use-case-studio",
        "/api/premium-concierge-itinerary",
        "/api/swiggy-innovation-radar",
      ],
      remainingGate: "Measured production savings require live pilot telemetry after Swiggy credentials are granted.",
      nextAction: "Use private pilot telemetry to refine call savings and capacity asks.",
    }),
    requirement({
      id: "premium_frontend",
      group: "product_depth",
      label: "Premium front-end across form factors",
      objectiveSignal: "Build a proper luxurious, mobile-friendly frontend with working CTAs and reviewer-ready screens across desktop, tablet, and mobile.",
      evidenceSummary: `${visualQa.readyTargets}/${visualQa.totalTargets} visual targets are ready, including desktop, tablet, mobile, widget fallback, source, launch, credential, and reviewer cards.`,
      frontendSurface: "The React portal, mobile navigation, Launch Center, Operating System, Production Evidence, and Visual QA panels.",
      backendEndpoints: ["/", "/api/visual-qa-center", "/api/reviewer-artifact-vault"],
      docsProof: ["docs/design-language.md", "README.md", "docs/demo-script.md"],
      testProof: ["src/App.test.tsx premium portal test", "MEALPILOT_URL=http://localhost:8787 npm run verify:visual"],
      owner: "MealPilot",
      status: "proven",
      proofLinks: ["/api/visual-qa-center", "/api/reviewer-artifact-vault"],
      remainingGate: "Final screenshots should be regenerated after each UI-affecting change.",
      nextAction: "Keep every new card behind a Visual QA target when it is part of reviewer proof.",
    }),
    requirement({
      id: "backend_logging_tracing",
      group: "operations",
      label: "Backend, logging, tracing, and observability",
      objectiveSignal: "Provide backend APIs, logging, tracing, request IDs, audit evidence, runtime telemetry, resilience, support, and SLO operations.",
      evidenceSummary: "OpenAPI, request IDs, audit ledger, runtime telemetry, observability traces, SLO incident command, support bridge, resilience drills, and production launch bundle are wired into verifier coverage.",
      frontendSurface: "Operating System and Production Evidence panels.",
      backendEndpoints: [
        "/api/openapi.json",
        "/api/audit-ledger",
        "/api/runtime-telemetry",
        "/api/observability/traces",
        "/api/slo-incident-command",
        "/api/support/bridge",
        "/api/resilience",
        "/api/production-launch-bundle",
      ],
      docsProof: ["docs/architecture.md", "docs/development.md", "docs/safety-and-compliance.md"],
      testProof: ["server/app.test.ts OpenAPI/security header assertions", "scripts/verify-production.mjs observability, telemetry, audit, support, and SLO assertions"],
      owner: "MealPilot",
      status: "proven",
      proofLinks: ["/api/openapi.json", "/api/audit-ledger", "/api/runtime-telemetry", "/api/observability/traces", "/api/slo-incident-command"],
      remainingGate: "External Swiggy status page and live support receipts require production/staging access.",
      nextAction: "Attach live staging correlation IDs after credentials arrive.",
    }),
    requirement({
      id: "tests_and_verifiers",
      group: "operations",
      label: "Complete test and verifier coverage",
      objectiveSignal: "Provide complete test cases, production verification, visual verification, and artifact export gates.",
      evidenceSummary: "Unit, integration, production, visual, and packet-export commands cover source, product, MCP, UI, operations, docs, access, and handoff evidence.",
      frontendSurface: "Visual QA Center, Reviewer Artifact Vault, Builder Packet Export, and Completion Ledger cards.",
      backendEndpoints: ["/api/visual-qa-center", "/api/reviewer-artifact-vault", "/api/builder-packet-export"],
      docsProof: ["README.md", "docs/development.md"],
      testProof: ["npm test -- --run", "npm run lint", "npm run build", "npm run verify:production", "npm run verify:visual", "npm run export:builder-packet"],
      owner: "MealPilot",
      status: "proven",
      proofLinks: ["/api/visual-qa-center", "/api/reviewer-artifact-vault", "/api/builder-packet-export"],
      remainingGate: "Visual artifacts should be regenerated on the same machine before final submission.",
      nextAction: "Run full verification after every shipped slice and attach updated packet files.",
    }),
    requirement({
      id: "docs_and_research",
      group: "source_coverage",
      label: "Research, README, and docs folder",
      objectiveSignal: "Create detailed plans and documentation covering the complete Swiggy site, APIs, routes, safety, architecture, and product strategy.",
      evidenceSummary: `${docsCoverage.totalPages} docs pages are mapped, with README, architecture, development, safety, demo, access application, roadmap, and research/product-plan docs maintained.`,
      frontendSurface: "Launch Center Source Intelligence, Docs Coverage, Docs Twin Explorer, and Coding Agent Governance cards.",
      backendEndpoints: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer", "/api/swiggy-source-intelligence", "/api/coding-agent-governance"],
      docsProof: [
        "README.md",
        "docs/development.md",
        "docs/architecture.md",
        "docs/design-language.md",
        "docs/safety-and-compliance.md",
        "docs/swiggy-builders-research-and-product-plan.md",
      ],
      testProof: ["scripts/verify-production.mjs docs coverage, docs twin, source intelligence, and coding agent governance assertions"],
      owner: "MealPilot",
      status: "proven",
      proofLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer", "/api/swiggy-source-intelligence"],
      remainingGate: "Live llms fetch can fall back to local docs coverage when Swiggy returns a temporary-glitch shell; fallback is explicitly reported.",
      nextAction: "Refresh docs coverage after Swiggy changes llms manifests or reference pages.",
    }),
    requirement({
      id: "developer_enterprise_tracks",
      group: "source_coverage",
      label: "Developer and enterprise tracks",
      objectiveSignal: "Cover developer quickstart, enterprise delegated auth, platform operators, access rules, support, SLA, quota, and reviewer evidence as first-class Swiggy Builders promises.",
      evidenceSummary: "Developer quickstart, first-call workbench, AI client configs, enterprise delegated auth, enterprise platform, support/SLA, quota, access evidence, and reviewer artifacts are mapped into proof routes and Launch Center cards.",
      frontendSurface: "Launch Center Developer Quickstart, AI Client Connect, Enterprise Delegated Auth, Enterprise Platform, Operating Contract, Partner Support, Quota Negotiation, and Access Evidence cards.",
      backendEndpoints: [
        "/api/swiggy-developer-quickstart",
        "/api/ai-client-connect-kit",
        "/api/enterprise-delegated-auth",
        "/api/enterprise-platform-center",
        "/api/swiggy-operating-contract-center",
        "/api/swiggy-partner-support-room",
        "/api/swiggy-quota-negotiation-center",
        "/api/swiggy-access-evidence-matrix",
      ],
      docsProof: ["README.md", "docs/development.md", "docs/swiggy-builders-research-and-product-plan.md"],
      testProof: ["scripts/verify-production.mjs developer quickstart, AI client, enterprise auth/platform, operating contract, support, quota, and access assertions"],
      owner: "Joint",
      status: "watch",
      proofLinks: [
        "/api/swiggy-developer-quickstart",
        "/api/enterprise-delegated-auth",
        "/api/enterprise-platform-center",
        "/api/swiggy-operating-contract-center",
        "/api/swiggy-quota-negotiation-center",
      ],
      remainingGate: "Enterprise contracts, partner manager, Slack, higher quotas, dashboards, and delegated-auth production approval remain Swiggy-owned.",
      nextAction: "Use this row as the source for a future dedicated Developer + Enterprise Signal Coverage board if the ledger needs a deeper sub-board.",
    }),
    requirement({
      id: "signup_access_submission",
      group: "handoff",
      label: "Sign up and access submission readiness",
      objectiveSignal: "Sign up for every single thing end to end, prepare sandbox credentials, access forms, demo, and go-live gates without unsafe external submission.",
      evidenceSummary: "Submission Console, Access Submission Studio, Access Dossier, Access Evidence Matrix, Builder Packet Export, Demo Evidence Director, Showcase Submission, and Submission Timeline prepare the end-to-end packet while keeping external submissions manual.",
      frontendSurface: "Launch Center access, submission, demo, showcase, credential readiness, and builder packet cards.",
      backendEndpoints: [
        "/api/submission-console",
        "/api/access-submission-studio",
        "/api/swiggy-access-dossier",
        "/api/swiggy-access-evidence-matrix",
        "/api/builder-packet-export",
        "/api/swiggy-demo-evidence-director",
        "/api/swiggy-showcase-submission-center",
      ],
      docsProof: ["docs/builder-access-application.md", "docs/demo-script.md", "README.md"],
      testProof: ["scripts/verify-production.mjs submission console, access studio, builder packet, demo evidence, and showcase assertions"],
      owner: "Operator",
      status: "operator_gate",
      proofLinks: ["/api/access-submission-studio", "/api/swiggy-access-evidence-matrix", "/api/builder-packet-export", "/api/swiggy-demo-evidence-director"],
      remainingGate: "The operator must submit official Swiggy forms, record/host the demo video, send emails, and accept legal terms manually.",
      nextAction: "Record the 2-3 minute demo and submit the official Swiggy Builders Club access form with the generated packet.",
    }),
    requirement({
      id: "sandbox_and_credentials",
      group: "handoff",
      label: "Sandbox, staging, and credentials",
      objectiveSignal: "Explore testing sandbox credentials and wire local, staging, and production readiness without fabricating access.",
      evidenceSummary: "Credential onboarding, vault, handoff, readiness dossier, sandbox workbench, staging cutover, staging replay, seed smoke, certification, live calibration, and transcript export model every credential gate.",
      frontendSurface: "Credential Cockpit, Operating System, Launch Center staging and credential cards.",
      backendEndpoints: [
        "/api/credential-onboarding",
        "/api/swiggy-credential-vault-center",
        "/api/swiggy-credential-handoff-center",
        "/api/swiggy-credential-readiness-dossier",
        "/api/sandbox-credential-workbench",
        "/api/mcp/staging-cutover",
        "/api/swiggy-staging-replay",
        "/api/swiggy-staging-seed-smoke-center",
        "/api/staging-certification-matrix",
      ],
      docsProof: ["docs/development.md", "docs/safety-and-compliance.md", ".env.example"],
      testProof: ["scripts/verify-production.mjs credential, sandbox, staging, certification, and transcript assertions"],
      owner: "Swiggy",
      status: "swiggy_gate",
      proofLinks: ["/api/swiggy-credential-readiness-dossier", "/api/swiggy-credential-handoff-center", "/api/sandbox-credential-workbench", "/api/mcp/staging-cutover"],
      remainingGate: "Swiggy must grant client credentials, staging tokens, seeded users, hosted widget URLs, and production approval.",
      nextAction: "After access approval, enter credentials via environment variables and run staging certification plus 48-hour soak.",
    }),
    requirement({
      id: "safety_privacy_compliance",
      group: "operations",
      label: "Safety, privacy, and compliance",
      objectiveSignal: "Preserve user trust, privacy, legal boundaries, confirmation gates, and no unsafe commerce automation.",
      evidenceSummary: "Commercial Action Guard, Confirmation Command, Data Governance, Brand Compliance, Payment Truth, Dineout Precision, Cancellation Care, Error Intelligence, and Support Bridge enforce confirmation-first, redacted, operator-safe behavior.",
      frontendSurface: "Production Evidence and Launch Center safety/compliance cards.",
      backendEndpoints: [
        "/api/mcp/commercial-action-guard",
        "/api/swiggy-confirmation-command-center",
        "/api/data-governance-center",
        "/api/brand-compliance-kit",
        "/api/swiggy-payment-truth-center",
        "/api/swiggy-dineout-precision-center",
        "/api/swiggy-cancellation-care-center",
        "/api/error-intelligence",
      ],
      docsProof: ["docs/safety-and-compliance.md", "README.md", "docs/development.md"],
      testProof: ["scripts/verify-production.mjs commercial guard, data governance, brand, payment, Dineout precision, cancellation, and error assertions"],
      owner: "MealPilot",
      status: "proven",
      proofLinks: ["/api/mcp/commercial-action-guard", "/api/data-governance-center", "/api/brand-compliance-kit", "/api/swiggy-payment-truth-center"],
      remainingGate: "Swiggy legal/privacy interpretation, DPA, and production policy review remain external.",
      nextAction: "Re-run safety and compliance verifier after any new commercial or data route.",
    }),
    requirement({
      id: "reviewer_packet_and_launch",
      group: "handoff",
      label: "Finished reviewer packet and launch readiness",
      objectiveSignal: "Deliver a finished product with complete reviewer artifacts, launch bundle, packet export, source freeze, and explicit remaining gates.",
      evidenceSummary: `${reviewerVault.readyArtifacts}/${reviewerVault.totalArtifacts} reviewer artifacts, ${launchBundle.artifacts.filter((item) => item.status === "ready").length}/${launchBundle.artifacts.length} launch artifacts, and ${builderPacket.totals.packetFiles} packet files are generated or listed with commands and gates.`,
      frontendSurface: "Reviewer Artifact Vault, Builder Packet Export, Launch Bundle, Source Freeze Diff, Review Decision, and Completion Ledger cards.",
      backendEndpoints: [
        "/api/reviewer-artifact-vault",
        "/api/production-launch-bundle",
        "/api/builder-packet-export",
        "/api/swiggy-source-freeze-diff",
        "/api/swiggy-builders-review-decision",
      ],
      docsProof: ["README.md", "docs/builder-access-application.md", "docs/demo-script.md"],
      testProof: ["scripts/verify-production.mjs reviewer vault, launch bundle, builder packet, source freeze, and review decision assertions"],
      owner: "Joint",
      status: "watch",
      proofLinks: ["/api/reviewer-artifact-vault", "/api/production-launch-bundle", "/api/builder-packet-export", "/api/swiggy-source-freeze-diff"],
      remainingGate: "The product is locally packet-ready, but final demo recording, official access approval, staging credentials, production promotion, and co-branding are external/manual.",
      nextAction: "Freeze source, export packet, record demo, submit form, then run staging and production promotion gates when Swiggy grants access.",
    }),
  ];

  const proofLinks = unique(requirements.flatMap((item) => item.proofLinks));
  const groups = ([
    ["source_coverage", "Source and website coverage"],
    ["product_depth", "Premium product depth"],
    ["mcp_integration", "MCP integration"],
    ["operations", "Operations and safety"],
    ["handoff", "Submission and launch handoff"],
  ] as const).map(([id, label]) => {
    const groupRows = requirements.filter((item) => item.group === id);
    return {
      id,
      label,
      requirements: groupRows.length,
      proven: groupRows.filter((item) => item.status === "proven").length,
      watch: groupRows.filter((item) => item.status === "watch").length,
      operatorGates: groupRows.filter((item) => item.status === "operator_gate").length,
      swiggyGates: groupRows.filter((item) => item.status === "swiggy_gate").length,
    };
  });
  const score = Math.round((requirements.reduce((sum, item) => sum + statusWeight(item.status), 0) / requirements.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSource,
    officialSources,
    totals: {
      requirements: requirements.length,
      proven: requirements.filter((item) => item.status === "proven").length,
      watch: requirements.filter((item) => item.status === "watch").length,
      operatorGates: requirements.filter((item) => item.status === "operator_gate").length,
      swiggyGates: requirements.filter((item) => item.status === "swiggy_gate").length,
      officialPages: buildersMap.pages.length,
      websiteModules: atlas.pages.reduce((sum, page) => sum + page.modules.length, 0),
      officialCtas: atlas.ctas.length,
      mcpServers: buildersMap.servers.length,
      mcpTools: buildersMap.totalOfficialTools,
      docsPages: docsCoverage.totalPages,
      reviewerArtifacts: reviewerVault.totalArtifacts,
      visualTargets: visualQa.totalTargets,
      launchArtifacts: launchBundle.artifacts.length,
      packetFiles: builderPacket.totals.packetFiles,
      proofLinks: proofLinks.length,
    },
    groups,
    requirements,
    commands: [
      {
        command: "curl -s http://localhost:8787/api/swiggy-builders-completion-ledger",
        proves: "Reads the full objective-to-evidence completion ledger.",
        expectedSignal: "totals.requirements === 12 && totals.mcpTools === 35 && totals.visualTargets >= 72",
      },
      {
        command: "npm run verify:production",
        proves: "Fails release if the completion ledger loses source, MCP, docs, visual, packet, or gate coverage.",
        expectedSignal: "buildersCompletionRequirements === 12 && buildersCompletionMcpTools === 35",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "Captures the Completion Ledger card along with every reviewer surface.",
        expectedSignal: "72 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Every explicit user objective is mapped to a proof route, frontend surface, documentation artifact, verifier signal, owner, and remaining gate.",
      "Completion is not claimed when the remaining work depends on operator actions or Swiggy-issued credentials.",
      "Source coverage, MCP coverage, premium product depth, operations, safety, docs, tests, visual QA, and access submission are tracked in one board.",
      "External forms, emails, staging credentials, production credentials, co-branding, showcase placement, and legal approval remain explicit gates.",
    ],
    externalGates: [
      "Operator must submit official forms, record/host the demo, send email drafts, and accept legal terms manually.",
      "Swiggy must grant client credentials, staging users, quotas, hosted widget URLs, production approval, co-branding, and showcase placement.",
      "Automated code cannot truthfully complete live Swiggy signup or production launch without those external approvals.",
    ],
  };
}
