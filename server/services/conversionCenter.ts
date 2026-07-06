import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  MealPlan,
  McpServerCoverage,
  SwiggyConversionCenter,
  SwiggyConversionProofBundle,
  SwiggyConversionStatus,
  SwiggyConversionStep,
  UserProfile,
} from "../../src/domain/types.js";
import { buildAccessSubmissionStudio } from "./accessSubmissionStudio.js";
import { buildSwiggyBuilderIntakeCommandCenter } from "./builderIntake.js";
import { buildSwiggyCtaExecutionCenter } from "./ctaExecutionCenter.js";
import { buildSwiggyDocsTwinExplorer } from "./docsTwinExplorer.js";
import { buildSwiggySubmissionTimelineCenter } from "./submissionTimelineCenter.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/llms-full.txt",
];

function statusWeight(status: SwiggyConversionStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.78;
  return 0.58;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function step(input: SwiggyConversionStep): SwiggyConversionStep {
  return input;
}

function bundle(input: SwiggyConversionProofBundle): SwiggyConversionProofBundle {
  return input;
}

const emptyHandoffState: AccessSubmissionHandoffState = {
  demoVideoUrl: "",
  technicalContactEmail: "",
  productionRedirectUri: "",
  staticEgressIp: "",
  environmentSummary: "",
  termsAcknowledged: false,
  notes: "",
  updatedAt: "",
};

export function buildSwiggyConversionCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
}): SwiggyConversionCenter {
  const intake = buildSwiggyBuilderIntakeCommandCenter(options);
  const ctaExecution = buildSwiggyCtaExecutionCenter(options);
  const timeline = buildSwiggySubmissionTimelineCenter({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.latestPlan,
    handoffState: options.handoffState ?? emptyHandoffState,
  });
  const accessStudio = buildAccessSubmissionStudio({
    config: options.config,
    profile: options.profile,
    coverage: options.coverage,
    latestPlan: options.latestPlan,
    handoffState: options.handoffState ?? emptyHandoffState,
  });
  const docsTwin = buildSwiggyDocsTwinExplorer();

  const steps = [
    step({
      id: "start_building",
      label: "Start Building",
      officialCta: "Start Building",
      sourceModule: "final_cta",
      destination: "https://mcp.swiggy.com/builders/docs/start/",
      owner: "MealPilot",
      status: "ready",
      userIntent: "Move from homepage intent into local development and docs.",
      mealPilotExecution: "Open Developer Quickstart, Tool Lab, Scenario Runner, and local MCP gateway proof.",
      proofLinks: ["/api/swiggy-developer-quickstart", "/api/mcp/tool-lab", "/api/mcp/scenario-runner"],
      completionGate: "none",
      nextAction: "Keep docs, local JSON-RPC calls, and first-call drills green before access submission.",
    }),
    step({
      id: "see_possible",
      label: "See What's Possible",
      officialCta: "See What's Possible",
      sourceModule: "final_cta",
      destination: "https://mcp.swiggy.com/builders/developers/",
      owner: "MealPilot",
      status: "ready",
      userIntent: "Explore Swiggy's developer inspiration lanes and convert them into MealPilot use cases.",
      mealPilotExecution: "Open Premium Use Case Studio, Innovation Radar, Channel Studio, and Talent Signal Center.",
      proofLinks: ["/api/premium-use-case-studio", "/api/swiggy-innovation-radar", "/api/swiggy-talent-signal-center"],
      completionGate: "none",
      nextAction: "Use this path during demos to show MealPilot goes beyond a thin order bot.",
    }),
    step({
      id: "request_access",
      label: "Request Access",
      officialCta: "Request access",
      sourceModule: "access",
      destination: "https://mcp.swiggy.com/builders/access/",
      owner: "Operator",
      status: "operator_input",
      userIntent: "Submit the official production access form after local proof is ready.",
      mealPilotExecution: "Open Access Submission Studio with copy blocks, attachments, browser runbook, and mailto draft.",
      proofLinks: ["/api/access-submission-studio", "/api/swiggy-access-evidence-matrix", "/api/submission-console"],
      completionGate: "operator_submit",
      nextAction: "Operator submits the official form only after demo URL, contact, redirect URI, and terms fields are final.",
    }),
    step({
      id: "send_demo",
      label: "Send Us a Demo",
      officialCta: "Send Us a Demo",
      sourceModule: "final_cta",
      destination: "mailto:builders@swiggy.in",
      owner: "Operator",
      status: "operator_input",
      userIntent: "Send demo video, GitHub link, and proof packet to the Builders team.",
      mealPilotExecution: "Use Demo Evidence Director, Showcase Submission, Talent Signal, and Builder Packet Export.",
      proofLinks: ["/api/swiggy-demo-evidence-director", "/api/swiggy-showcase-submission-center", "/api/builder-packet-export"],
      completionGate: "operator_submit",
      nextAction: "Operator reviews the email body and sends it manually from their mail client.",
    }),
    step({
      id: "builders_email",
      label: "builders@swiggy.in",
      officialCta: "builders@swiggy.in",
      sourceModule: "footer",
      destination: "mailto:builders@swiggy.in",
      owner: "Operator",
      status: "operator_input",
      userIntent: "Ask for support, capacity, showcase, or access follow-up.",
      mealPilotExecution: "Use Partner Support Room, Quota Negotiation, Operating Contract, or Talent Signal based on intent.",
      proofLinks: ["/api/swiggy-partner-support-room", "/api/swiggy-quota-negotiation-center", "/api/swiggy-operating-contract-center"],
      completionGate: "operator_submit",
      nextAction: "Never auto-send; attach the relevant support-safe packet and retain Swiggy acknowledgement.",
    }),
    step({
      id: "llms_txt",
      label: "llms.txt",
      officialCta: "llms.txt",
      sourceModule: "footer",
      destination: "https://mcp.swiggy.com/builders/llms.txt",
      owner: "MealPilot",
      status: "ready",
      userIntent: "Give coding agents the concise Swiggy documentation index.",
      mealPilotExecution: "Verify manifest, docs coverage, docs twin explorer, and coding-agent governance.",
      proofLinks: ["/api/swiggy-llms-manifest-verifier", "/api/swiggy-docs-coverage", "/api/coding-agent-governance"],
      completionGate: "none",
      nextAction: "Keep live manifest checks green before assigning coding-agent work.",
    }),
    step({
      id: "llms_full",
      label: "llms-full.txt",
      officialCta: "llms-full.txt",
      sourceModule: "footer",
      destination: "https://mcp.swiggy.com/builders/llms-full.txt",
      owner: "MealPilot",
      status: "ready",
      userIntent: "Give agents the full Swiggy docs corpus without storing it inside MealPilot artifacts.",
      mealPilotExecution: `${docsTwin.totals.markdownTwins}/${docsTwin.totals.pages} markdown twins map rendered docs to proof routes.`,
      proofLinks: ["/api/swiggy-docs-twin-explorer", "/api/swiggy-upstream-watch", "/api/swiggy-source-intelligence"],
      completionGate: "none",
      nextAction: "Use as an external retrieval source; do not paste or persist the full corpus in local packets.",
    }),
    step({
      id: "go_live_review",
      label: "Go Live Review",
      officialCta: "Go live after quick review",
      sourceModule: "access",
      destination: "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
      owner: "Swiggy",
      status: "swiggy_gate",
      userIntent: "Promote from local/staging proof into production credentials and live user traffic.",
      mealPilotExecution: "Open Credential Handoff, Staging Certification, Live Signal Calibration, and Production Launch Bundle.",
      proofLinks: ["/api/swiggy-credential-handoff-center", "/api/staging-certification-matrix", "/api/production-launch-bundle"],
      completionGate: "swiggy_approval",
      nextAction: "Wait for Swiggy approval, issued credentials, and 48-hour green staging evidence before public claims.",
    }),
  ];

  const proofBundles = [
    bundle({
      id: "local_build",
      label: "Local build proof",
      covers: ["Start Building", "Docs", "Tool Lab", "Scenario Runner"],
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/swiggy-developer-quickstart", "/api/mcp/tool-lab", "/api/mcp/scenario-runner"],
    }),
    bundle({
      id: "submission_packet",
      label: "Submission packet",
      covers: ["Request Access", "Send Us a Demo", "Required attachments"],
      owner: "Operator",
      status: accessStudio.totals.operatorBlocks > 0 ? "operator_input" : "ready",
      proofLinks: ["/api/access-submission-studio", "/api/builder-packet-export", "/api/reviewer-artifact-vault"],
    }),
    bundle({
      id: "email_packet",
      label: "Email packet",
      covers: ["builders@swiggy.in", "Support", "Quota", "Showcase"],
      owner: "Operator",
      status: "operator_input",
      proofLinks: ["/api/swiggy-partner-support-room", "/api/swiggy-quota-negotiation-center", "/api/swiggy-showcase-submission-center"],
    }),
    bundle({
      id: "docs_packet",
      label: "Agent docs packet",
      covers: ["llms.txt", "llms-full.txt", "Markdown twins"],
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/swiggy-llms-manifest-verifier", "/api/swiggy-docs-twin-explorer", "/api/coding-agent-governance"],
    }),
    bundle({
      id: "production_packet",
      label: "Go-live packet",
      covers: ["Quick review", "Staging", "Credentials", "Launch bundle"],
      owner: "Swiggy",
      status: "swiggy_gate",
      proofLinks: ["/api/swiggy-credential-handoff-center", "/api/production-launch-bundle"],
    }),
  ];

  const proofLinks = unique([...steps.flatMap((item) => item.proofLinks), ...proofBundles.flatMap((item) => item.proofLinks)]);
  const scoreItems = [...steps.map((item) => item.status), ...proofBundles.map((item) => item.status)];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources: unique([...officialSources, ...ctaExecution.officialSources, ...intake.officialSources]),
    totals: {
      steps: steps.length,
      ready: steps.filter((item) => item.status === "ready").length,
      operatorInputs: steps.filter((item) => item.status === "operator_input").length,
      swiggyGates: [...steps, ...proofBundles].filter((item) => item.status === "swiggy_gate").length,
      proofBundles: proofBundles.length,
      officialDestinations: unique(steps.map((item) => item.destination)).length,
      proofLinks: proofLinks.length,
    },
    conversionSteps: steps,
    proofBundles,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Build locally",
        action: "Open Start Building, run first-call drills, and verify local MCP coverage.",
        proofLinks: ["/api/swiggy-developer-quickstart", "/api/mcp/tool-lab"],
      },
      {
        sequence: 2,
        label: "Freeze packet",
        action: "Export builder packet, visual QA, reviewer vault, and demo evidence before external submission.",
        proofLinks: ["/api/builder-packet-export", "/api/visual-qa-center", "/api/reviewer-artifact-vault"],
      },
      {
        sequence: 3,
        label: "Submit access",
        action: "Use Access Submission Studio to paste prepared fields into the official form and submit manually.",
        proofLinks: ["/api/access-submission-studio", "/api/submission-console"],
      },
      {
        sequence: 4,
        label: "Send demo",
        action: "Open the generated builders@swiggy.in draft, attach final demo/GitHub links, and send manually.",
        proofLinks: ["/api/swiggy-demo-evidence-director", "/api/swiggy-talent-signal-center"],
      },
      {
        sequence: 5,
        label: "Wait for go-live",
        action: `Follow the ${timeline.totals.phases}-phase submission timeline and treat credentials, production promotion, co-branding, feature placement, and partner access as Swiggy gates.`,
        proofLinks: ["/api/swiggy-credential-handoff-center", "/api/swiggy-benefits-activation-center"],
      },
    ],
    handoffDraft: {
      to: "builders@swiggy.in",
      subject: "MealPilot Swiggy Builders conversion packet",
      bodyPreview:
        "Sharing the complete MealPilot conversion packet for Swiggy Builders: Start Building proof, access form fields, demo evidence, GitHub link, builder packet, llms/doc coverage, support-safe packets, and explicit Swiggy-owned go-live gates.",
      proofLinks: ["/api/swiggy-conversion-center", "/api/builder-packet-export", "/api/access-submission-studio"],
    },
    assertions: [
      "The closing Builders CTA module is represented as a full funnel rather than scattered links.",
      "Start Building and docs sources are locally verifiable, while forms, emails, credentials, production promotion, and Swiggy approvals stay manual or external.",
      "llms.txt and llms-full.txt are used as retrieval sources and evidence links without copying the full corpus into local artifacts.",
      "The conversion funnel composes CTA Execution, Builder Intake, Submission Timeline, Access Submission Studio, and Docs Twin proof.",
    ],
    externalGates: [
      "Operator must submit the official access form, send builders@swiggy.in emails, and attach demo/GitHub links manually.",
      "Swiggy must approve production access, credentials, production promotion, co-branding, feature placement, and partner support.",
      "Legal, privacy, and terms review remain human-gated before public launch claims.",
    ],
  };
}
