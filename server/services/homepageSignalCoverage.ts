import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyHomepageSignalCoverageBoard,
  SwiggyHomepageSignalCoverageGroup,
  SwiggyHomepageSignalCoverageRow,
  SwiggyHomepageSignalCoverageStatus,
} from "../../src/domain/types.js";
import { buildSwiggyCtaExecutionCenter } from "./ctaExecutionCenter.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

const officialSource = "https://mcp.swiggy.com/builders/";
const officialSources = [
  officialSource,
  `${officialSource}developers/`,
  `${officialSource}enterprises/`,
  `${officialSource}access/`,
  `${officialSource}docs/`,
  `${officialSource}llms.txt`,
  `${officialSource}llms-full.txt`,
];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyHomepageSignalCoverageStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.82;
  if (status === "operator_gate") return 0.72;
  return 0.62;
}

function row(input: SwiggyHomepageSignalCoverageRow): SwiggyHomepageSignalCoverageRow {
  return input;
}

function group(id: string, label: string, rows: SwiggyHomepageSignalCoverageRow[]): SwiggyHomepageSignalCoverageGroup {
  return {
    id,
    label,
    rows: rows.length,
    ready: rows.filter((item) => item.status === "ready").length,
    operatorGates: rows.filter((item) => item.status === "operator_gate").length,
    swiggyGates: rows.filter((item) => item.status === "swiggy_gate").length,
  };
}

export function buildSwiggyHomepageSignalCoverageBoard(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
}): SwiggyHomepageSignalCoverageBoard {
  const atlas = buildSwiggyWebsiteAtlas();
  const ctaExecution = buildSwiggyCtaExecutionCenter(options);
  const footerLinks = atlas.footerGroups.reduce((sum, footerGroup) => sum + footerGroup.links.length, 0);
  const proofLinks = unique([
    "/api/swiggy-website-atlas",
    "/api/swiggy-builders-homepage-experience",
    "/api/swiggy-cta-execution-center",
    "/api/swiggy-builders-live-source-resilience",
    "/api/swiggy-capability-traceability",
    "/api/swiggy-builder-intake",
    "/api/swiggy-access-dossier",
    "/api/swiggy-access-evidence-matrix",
    "/api/swiggy-demo-evidence-director",
    "/api/swiggy-showcase-submission-center",
    "/api/swiggy-partner-support-room",
    "/api/swiggy-growth-partnership",
    "/api/brand-compliance-kit",
    "/api/traffic-readiness-plan",
    "/api/swiggy-quota-negotiation-center",
    "/api/swiggy-faq-resolution-center",
    "/api/swiggy-llms-manifest-verifier",
    "/api/swiggy-docs-twin-explorer",
    "/api/mcp/tool-lab",
    "/api/swiggy-tool-parity-auditor",
  ]);

  const navigationSignals = [
    row({
      id: "global_header",
      label: "Global header",
      publicSignal: "Builders Club, Developers, Enterprises, Docs, Blog, FAQ, and Start Building stay reachable from the top navigation.",
      sourceLocation: "Homepage header",
      mealPilotSurface: "Launch Center source cards plus Website Atlas header inventory.",
      backendEndpoint: "/api/swiggy-website-atlas",
      frontendVisibility: "Launch Center Homepage Signal Coverage and Website Atlas cards.",
      docsProof: "README and docs/development describe website header coverage.",
      testProof: "server/app.test.ts OpenAPI, Website Atlas, CTA Execution, and visual QA assertions.",
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/swiggy-website-atlas", "/api/swiggy-cta-execution-center"],
      nextAction: "Re-run Source Freeze Diff before final submission if any header item changes.",
    }),
    row({
      id: "docs_subnav",
      label: "Docs navigation",
      publicSignal: "Docs home, Start, Build, Reference, and Operate paths stay available for developer review.",
      sourceLocation: "Docs subnavigation",
      mealPilotSurface: "Docs Coverage, Docs Twin Explorer, Journey Compiler, and Operating Contract cards.",
      backendEndpoint: "/api/swiggy-docs-coverage",
      frontendVisibility: "Launch Center docs/source cards and Operating System evidence.",
      docsProof: "README demo checklist and docs/development API inventory include the docs routes.",
      testProof: "Production verifier checks 69 docs rows, rendered twins, llms manifests, and source evolution.",
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer"],
      nextAction: "Refresh llms and markdown twins if Swiggy docs navigation changes.",
    }),
    row({
      id: "footer_resources_legal",
      label: "Footer resources and legal",
      publicSignal: "Guidelines, FAQ, Apply, llms.txt, Privacy Policy, and Terms are represented and safely gated.",
      sourceLocation: "Homepage footer",
      mealPilotSurface: "CTA Execution Center, FAQ Center, Data Governance, Brand Compliance, and Source Freeze Diff.",
      backendEndpoint: "/api/swiggy-cta-execution-center",
      frontendVisibility: "Launch Center CTA and governance cards.",
      docsProof: "README and docs/development call out footer, legal, and privacy proof surfaces.",
      testProof: "Production verifier checks footer links, legal gates, data governance, and CTA Execution counts.",
      owner: "Joint",
      status: "operator_gate",
      proofLinks: ["/api/swiggy-cta-execution-center", "/api/data-governance-center", "/api/brand-compliance-kit"],
      nextAction: "Operator/legal review opens privacy and terms pages manually before production launch claims.",
    }),
  ];

  const accessSignals = [
    row({
      id: "start_build_apply",
      label: "Start, build, and apply flow",
      publicSignal: "Start Building, Apply for Prod Access, Quick Review, Go Live, and Show Us What You Built form the public journey.",
      sourceLocation: "Homepage hero, access page, and conversion CTAs",
      mealPilotSurface: "Journey Gates, Builder Intake, Access Dossier, Access Evidence Matrix, and Builder Packet Export.",
      backendEndpoint: "/api/swiggy-builders-journey-gates",
      frontendVisibility: "Launch Center Journey Gates, Builder Intake, Access Submission, and packet cards.",
      docsProof: "README access packet section and docs/development builder workflow.",
      testProof: "server/app.test.ts and verify-production check Journey Gates, Access Evidence, and Builder Packet readiness.",
      owner: "Joint",
      status: "operator_gate",
      proofLinks: ["/api/swiggy-builders-journey-gates", "/api/swiggy-builder-intake", "/api/builder-packet-export"],
      nextAction: "Record demo, paste packet links into the official form, and stop before operator submit.",
    }),
    row({
      id: "demo_submission",
      label: "Demo submission",
      publicSignal: "Send Us a Demo invites a working video, repo, contact, metric, and proof handoff.",
      sourceLocation: "Homepage and Developers CTA",
      mealPilotSurface: "Demo Evidence Director, Showcase Submission Center, Reviewer Artifact Vault, and visual QA.",
      backendEndpoint: "/api/swiggy-demo-evidence-director",
      frontendVisibility: "Launch Center Demo Evidence and Showcase cards.",
      docsProof: "README demo script and docs/development demo evidence route descriptions.",
      testProof: "Verifier checks demo storyboard, proof assets, visual QA links, and builders@swiggy.in copy.",
      owner: "Operator",
      status: "operator_gate",
      proofLinks: ["/api/swiggy-demo-evidence-director", "/api/swiggy-showcase-submission-center", "/api/reviewer-artifact-vault"],
      nextAction: "Operator records and hosts the final 2-3 minute demo before sending or submitting.",
    }),
  ];

  const promiseSignals = [
    row({
      id: "generous_rate_limits",
      label: "Generous rate limits",
      publicSignal: "Public Builders positioning promises production-grade rate-limit and capacity paths.",
      sourceLocation: "Homepage benefits and Operate docs",
      mealPilotSurface: "Traffic Readiness, Backpressure Governor, Load Lab, Route Optimizer, and Quota Negotiation Center.",
      backendEndpoint: "/api/swiggy-quota-negotiation-center",
      frontendVisibility: "Production Evidence and Launch Center capacity cards.",
      docsProof: "README rate-limit and quota negotiation sections.",
      testProof: "Production verifier checks route savings, backpressure, load lab, and quota packet evidence.",
      owner: "Joint",
      status: "watch",
      proofLinks: ["/api/traffic-readiness-plan", "/api/mcp/backpressure-governor", "/api/swiggy-quota-negotiation-center"],
      nextAction: "Use measured launch traffic and route savings when asking Swiggy for bespoke limits.",
    }),
    row({
      id: "direct_support_slack",
      label: "Direct support and Slack",
      publicSignal: "Builders support paths include builders@swiggy.in and enterprise Slack/partner-manager gates.",
      sourceLocation: "Homepage/footer/support docs",
      mealPilotSurface: "Partner Support Room, Partner Success Desk, Support Bridge, SLO Incident Command, and Audit Ledger.",
      backendEndpoint: "/api/swiggy-partner-support-room",
      frontendVisibility: "Launch Center Partner Support and Operating System support cards.",
      docsProof: "README support workflow and docs/development partner support sections.",
      testProof: "Verifier checks report_error packets, support email drafts, incident lanes, and Slack external gates.",
      owner: "Joint",
      status: "operator_gate",
      proofLinks: ["/api/swiggy-partner-support-room", "/api/swiggy-partner-success-desk", "/api/support/bridge"],
      nextAction: "Use local packets until Swiggy grants enterprise Slack or partner-manager channels.",
    }),
    row({
      id: "cobrand_growth",
      label: "Co-branding and growth",
      publicSignal: "Homepage benefits point to Powered by Swiggy attribution, showcase visibility, hiring, and growth partnerships.",
      sourceLocation: "Homepage benefits and showcase CTAs",
      mealPilotSurface: "Benefits Activation, Growth Partnership, Brand Compliance, Talent Signal, and Launch Bundle.",
      backendEndpoint: "/api/swiggy-benefits-activation-center",
      frontendVisibility: "Launch Center benefits, growth, talent, and compliance cards.",
      docsProof: "README benefit activation, growth, and brand compliance sections.",
      testProof: "Verifier checks benefit lanes, co-branding gates, growth packets, and no-endorsement assertions.",
      owner: "Swiggy",
      status: "swiggy_gate",
      proofLinks: ["/api/swiggy-benefits-activation-center", "/api/swiggy-growth-partnership", "/api/brand-compliance-kit"],
      nextAction: "Wait for Swiggy approval before claiming Powered by Swiggy, showcase placement, or co-marketing.",
    }),
  ];

  const sourceSignals = [
    row({
      id: "faq_policy",
      label: "FAQ and policy answers",
      publicSignal: "Homepage FAQ answers program fit, access, demo, production, and safety questions.",
      sourceLocation: "Homepage FAQ and footer FAQ",
      mealPilotSurface: "FAQ Policy Center and FAQ Resolution Center.",
      backendEndpoint: "/api/swiggy-faq-resolution-center",
      frontendVisibility: "Launch Center FAQ cards.",
      docsProof: "README FAQ route descriptions and docs/development FAQ sections.",
      testProof: "Verifier checks public FAQ question coverage, answer routing, and CTA links.",
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/swiggy-faq-policy", "/api/swiggy-faq-resolution-center"],
      nextAction: "Refresh FAQ mappings after source drift or new public questions.",
    }),
    row({
      id: "llms_agent_sources",
      label: "llms and agent-readable sources",
      publicSignal: "llms.txt and llms-full.txt expose source-of-truth pages for coding agents.",
      sourceLocation: "Homepage/footer source links",
      mealPilotSurface: "llms Manifest Verifier, Docs Twin Explorer, Source Intelligence, and Coding Agent Governance.",
      backendEndpoint: "/api/swiggy-llms-manifest-verifier",
      frontendVisibility: "Launch Center source and coding-agent cards.",
      docsProof: "README llms manifest and docs twin sections.",
      testProof: "Verifier checks 69 linked pages, markdown twins, Swiggy-only origins, and 35 reference tools.",
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/swiggy-llms-manifest-verifier", "/api/swiggy-docs-twin-explorer", "/api/coding-agent-governance"],
      nextAction: "Fetch official manifests before any future Swiggy integration edit.",
    }),
    row({
      id: "mcp_capabilities",
      label: "Food, Instamart, and Dineout capabilities",
      publicSignal: "Homepage and docs promise agentic commerce across three MCP server families.",
      sourceLocation: "Homepage capabilities and reference docs",
      mealPilotSurface: "Tool Lab, Tool Contract Matrix, Scenario Runner, Premium Use Case Studio, and Capability Traceability.",
      backendEndpoint: "/api/mcp/tool-lab",
      frontendVisibility: "Launch Center MCP, contract, scenario, and premium use-case cards.",
      docsProof: "README full product inventory and docs/development MCP coverage.",
      testProof: "Verifier checks 35/35 tool coverage, contracts, route classes, and scenario traces.",
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/swiggy-capability-traceability"],
      nextAction: "Promote any new Swiggy reference tool into Tool Lab, contracts, routes, docs, tests, and verifier.",
    }),
  ];

  const groupsInput = [
    ["navigation", "Header, docs, footer", navigationSignals] as const,
    ["access", "Start, apply, demo", accessSignals] as const,
    ["benefits", "Rate, support, growth", promiseSignals] as const,
    ["sources", "FAQ, llms, MCP", sourceSignals] as const,
  ];
  const signals = groupsInput.flatMap(([, , rows]) => rows);
  const score = Math.round((signals.reduce((sum, item) => sum + statusWeight(item.status), 0) / signals.length) * 100);
  const allProofLinks = unique([...proofLinks, ...signals.flatMap((signal) => signal.proofLinks)]);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSource,
    officialSources,
    totals: {
      signals: signals.length,
      ready: signals.filter((signal) => signal.status === "ready").length,
      watch: signals.filter((signal) => signal.status === "watch").length,
      operatorGates: signals.filter((signal) => signal.status === "operator_gate").length,
      swiggyGates: signals.filter((signal) => signal.status === "swiggy_gate").length,
      headerLinks: atlas.globalHeader.length,
      docsLinks: atlas.docsHeader.length,
      footerLinks,
      ctas: ctaExecution.totals.ctas,
      proofLinks: allProofLinks.length,
    },
    groups: groupsInput.map(([id, label, rows]) => group(id, label, rows)),
    signals,
    commands: [
      {
        command: "curl -s http://localhost:8787/api/swiggy-homepage-signal-coverage",
        proves: "Reads every public homepage signal, header/footer/docs link count, surface mapping, proof link, owner, and gate.",
        expectedSignal: "totals.signals === 11 && totals.headerLinks >= 7 && totals.footerLinks >= 8",
      },
      {
        command: "npm run verify:production",
        proves: "Fails release if homepage signals, llms, CTA, support, growth, rate-limit, or MCP coverage drifts.",
        expectedSignal: "homepageSignalCoverageScore >= 80 && homepageSignalCoverageSignals === 11",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "Captures the Homepage Signal Coverage card as reviewer screenshot evidence.",
        expectedSignal: "72 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Every public homepage promise has a named MealPilot surface, backend endpoint, frontend visibility, docs proof, and test proof.",
      "Global header, docs subnav, footer resources, footer legal links, and official CTAs are counted from Website Atlas and CTA Execution.",
      "Google Forms, email sends, Slack/partner-manager access, co-branding, legal interpretation, and production access remain explicit gates.",
      "llms.txt, llms-full.txt, and MCP reference coverage remain first-class source signals for coding agents.",
    ],
    externalGates: [
      "Swiggy controls production access, staging credentials, co-branding approval, showcase placement, and enterprise Slack.",
      "Operator must record the final demo, submit official forms, send emails, and complete legal review manually.",
      "Automated tests can prepare and verify packets, but must not submit Swiggy forms or claim Swiggy approval.",
    ],
  };
}
