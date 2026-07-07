import type {
  SwiggyShowcaseSubmissionComposition,
  SwiggyShowcaseSubmissionAsset,
  SwiggyShowcaseSubmissionCenter,
  SwiggyShowcaseSubmissionDecision,
  SwiggyShowcaseSubmissionStatus,
} from "../../src/domain/types.js";
import { buildSwiggyBuildersLaunchStoryCenter } from "./buildersLaunchStoryCenter.js";
import { buildSwiggyGrowthPartnershipCenter } from "./growthPartnership.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/blog/2026-04-17-builders-club-launch/",
];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyShowcaseSubmissionStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.78;
  return 0.58;
}

function asset(input: SwiggyShowcaseSubmissionAsset): SwiggyShowcaseSubmissionAsset {
  return input;
}

function normalize(value?: string) {
  return (value ?? "").trim();
}

function isExternalUrl(value: string) {
  return /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(value);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function compositionDecision(missingInputs: string[]): SwiggyShowcaseSubmissionDecision {
  if (missingInputs.length >= 3) return "blocked_empty";
  if (missingInputs.length > 0) return "needs_operator_input";
  return "ready_to_send";
}

export function buildSwiggyShowcaseSubmissionCenter(): SwiggyShowcaseSubmissionCenter {
  const growth = buildSwiggyGrowthPartnershipCenter();
  const launchStory = buildSwiggyBuildersLaunchStoryCenter();
  const readyExperiments = growth.experiments.filter((item) => item.status === "ready").length;
  const readyStoryBeats = launchStory.storyBeats.filter((beat) => beat.status === "ready").length;

  const pitchBlocks = [
    {
      id: "one_liner",
      label: "One-liner",
      copy:
        "MealPilot is a premium Swiggy MCP household food operating system that combines Food, Instamart, and Dineout into one confirmation-first planning, ordering, reservation, and recovery layer.",
      evidenceLinks: ["/api/premium-use-case-studio", "/api/mcp/catalog"],
    },
    {
      id: "why_swiggy",
      label: "Why it belongs in Builders Club",
      copy:
        "The product demonstrates all three Swiggy MCP servers, all 35 tools, safe commercial confirmations, support-grade telemetry, and a realistic India-first household use case.",
      evidenceLinks: ["/api/swiggy-tool-parity-auditor", "/api/swiggy-staging-seed-smoke-center"],
    },
    {
      id: "differentiator",
      label: "Differentiator",
      copy:
        "MealPilot is not a thin order bot: it optimizes meal windows, household preferences, guest collaboration, visual dish capture, voice commerce, support recovery, and luxury concierge workflows.",
      evidenceLinks: ["/api/swiggy-innovation-radar", "/api/luxury-experience-workspace"],
    },
    {
      id: "safety",
      label: "Safety and trust",
      copy:
        "Every Food order, Instamart checkout, and Dineout booking remains separately confirmed; uncertain commercial outcomes use status readback before retry; raw tokens, payment data, and PII stay out of logs.",
      evidenceLinks: ["/api/swiggy-confirmation-command-center", "/api/data-governance-center"],
    },
  ];

  const assets = [
    asset({
      id: "two_minute_demo",
      label: "Two-minute demo video",
      format: "video",
      status: "operator_input",
      owner: "Operator",
      purpose: "Attach Loom, Drive, or unlisted YouTube walkthrough for Swiggy access and showcase review.",
      evidenceLinks: ["/api/demo-studio", "docs/demo-script.md"],
    }),
    asset({
      id: "launch_story",
      label: "Launch story narrative",
      format: "narrative",
      status: "ready",
      owner: "MealPilot",
      purpose: `${readyStoryBeats}/${launchStory.storyBeats.length} launch-story beats map official Builders Club signals to MealPilot proof.`,
      evidenceLinks: ["/api/swiggy-builders-launch-story", "/api/swiggy-website-atlas"],
    }),
    asset({
      id: "metric_pack",
      label: "Metric proof pack",
      format: "metric_pack",
      status: "ready",
      owner: "MealPilot",
      purpose: `${readyExperiments}/${growth.experiments.length} growth experiments plus route, support, visual, and staging-smoke metrics are ready.`,
      evidenceLinks: ["/api/swiggy-growth-partnership", "/api/telemetry/runtime", "/api/evaluation-lab"],
    }),
    asset({
      id: "visual_gallery",
      label: "Responsive visual proof",
      format: "visual",
      status: "ready",
      owner: "MealPilot",
      purpose: "Visual QA captures the portal on desktop, tablet, mobile, and demo-critical cards with no overflow.",
      evidenceLinks: ["/api/visual-qa-center", "artifacts/visual-qa/report.json"],
    }),
    asset({
      id: "swiggy_outreach",
      label: "builders@swiggy.in outreach",
      format: "email",
      status: "operator_input",
      owner: "Operator",
      purpose: "Operator sends final access/showcase email after attaching demo video and access packet links.",
      evidenceLinks: ["/api/access-submission-studio", "/api/builder-packet-export"],
    }),
    asset({
      id: "powered_by_swiggy",
      label: "Powered by Swiggy review",
      format: "co_branding",
      status: "swiggy_gate",
      owner: "Swiggy",
      purpose: "Co-branding, feature placement, public endorsement, and logo/asset use stay Swiggy-approved gates.",
      evidenceLinks: ["/api/brand-compliance-kit", "/api/swiggy-growth-partnership"],
    }),
  ];

  const evidenceLinks = unique([...pitchBlocks.flatMap((block) => block.evidenceLinks), ...assets.flatMap((item) => item.evidenceLinks)]);
  const score = Math.round((assets.reduce((sum, item) => sum + statusWeight(item.status), 0) / assets.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      assets: assets.length,
      readyAssets: assets.filter((item) => item.status === "ready").length,
      operatorInputs: assets.filter((item) => item.status === "operator_input").length,
      swiggyGates: assets.filter((item) => item.status === "swiggy_gate").length,
      evidenceLinks: evidenceLinks.length,
      pitchBlocks: pitchBlocks.length,
    },
    pitchBlocks,
    assets,
    demoStoryboard: [
      {
        sequence: 1,
        label: "Open with India household problem",
        shot: "Show planner prompt, profile, budget, guests, city, and Food/Instamart/Dineout recommendations.",
        proofLinks: ["/api/plan", "/api/demo-studio"],
      },
      {
        sequence: 2,
        label: "Show all Swiggy MCP coverage",
        shot: "Open Launch Center cards for 35-tool parity, contracts, scenario runner, and staging seed/smoke readiness.",
        proofLinks: ["/api/mcp/catalog", "/api/swiggy-staging-seed-smoke-center"],
      },
      {
        sequence: 3,
        label: "Show safe commercial action",
        shot: "Confirm one recommendation and show audit, telemetry, status readback, and no-blind-retry controls.",
        proofLinks: ["/api/swiggy-confirmation-command-center", "/api/audit-ledger"],
      },
      {
        sequence: 4,
        label: "Show premium differentiation",
        shot: "Open voice, visual dish capture, guest collaboration, luxury workspace, and growth partnership cards.",
        proofLinks: ["/api/swiggy-voice-commerce-center", "/api/swiggy-visual-dish-capture", "/api/luxury-experience-workspace"],
      },
      {
        sequence: 5,
        label: "Close with access packet",
        shot: "Export builder packet and show manual Swiggy gates for access, demo email, co-branding, Slack, and production credentials.",
        proofLinks: ["/api/builder-packet-export", "/api/swiggy-showcase-submission-center"],
      },
    ],
    metricPack: [
      { id: "tool_coverage", label: "Swiggy tool coverage", target: "35/35 official tools mapped and probed locally", source: "/api/mcp/tool-lab" },
      { id: "visual_targets", label: "Visual QA targets", target: "All reviewer screenshot targets pass without overflow", source: "/api/visual-qa-center" },
      { id: "growth_experiments", label: "Growth experiments", target: `${readyExperiments}/${growth.experiments.length} ready experiments`, source: "/api/swiggy-growth-partnership" },
      { id: "staging_smoke", label: "Staging smoke waves", target: "Food, Instamart, and Dineout seeded smoke plan with no-blind-retry gates", source: "/api/swiggy-staging-seed-smoke-center" },
    ],
    outreachEmail: {
      to: "builders@swiggy.in",
      subject: "MealPilot Swiggy MCP showcase and access review packet",
      bodyPreview:
        "Hi Swiggy Builders team, sharing MealPilot: a premium household food operating layer built on Food, Instamart, and Dineout MCP. The packet includes demo video, access evidence, visual QA, staging smoke plan, safety controls, and growth/showcase assets.",
      evidenceLinks: ["/api/swiggy-showcase-submission-center", "/api/builder-packet-export", "/api/swiggy-growth-partnership"],
    },
    assertions: [
      "Showcase copy is prepared locally but no email, form submission, co-branding claim, feature request, or public endorsement is sent automatically.",
      "Swiggy feature placement, hiring conversations, co-marketing, partner manager, Slack, and Powered by Swiggy asset approval remain external gates.",
      "Demo assets link to executable MealPilot proof routes instead of unsupported marketing claims.",
      "The storyboard keeps commercial actions confirmation-first and highlights staging credential gates before production claims.",
    ],
    externalGates: [
      "Operator must add a real demo-video URL before submission.",
      "Swiggy must approve production access, co-branding, public feature placement, and any partnership announcement.",
      "Swiggy must issue staging/production credentials before live transaction evidence can be shown.",
    ],
  };
}

export function composeSwiggyShowcaseSubmission(input: {
  demoUrl?: string;
  githubUrl?: string;
  operatorEmail?: string;
  note?: string;
}): SwiggyShowcaseSubmissionComposition {
  const center = buildSwiggyShowcaseSubmissionCenter();
  const demoUrl = normalize(input.demoUrl);
  const githubUrl = normalize(input.githubUrl);
  const operatorEmail = normalize(input.operatorEmail);
  const note = normalize(input.note);
  const missingInputs = [
    !isExternalUrl(demoUrl) ? "demoUrl" : "",
    !isExternalUrl(githubUrl) ? "githubUrl" : "",
    !isEmail(operatorEmail) ? "operatorEmail" : "",
  ].filter(Boolean);
  const decision = compositionDecision(missingInputs);
  const readinessScore = Math.max(0, Math.round(((3 - missingInputs.length) / 3) * 100));
  const proofLinks = unique([
    "/api/swiggy-showcase-submission-center",
    "/api/builder-packet-export",
    "/api/swiggy-demo-evidence-director",
    "/api/visual-qa-center",
    demoUrl,
    githubUrl,
    ...center.pitchBlocks.flatMap((block) => block.evidenceLinks),
    ...center.metricPack.map((metric) => metric.source),
  ]).slice(0, 14);
  const checklist = [
    {
      id: "demo_url",
      label: "Unlisted demo video URL attached",
      status: isExternalUrl(demoUrl) ? "ready" : "operator_input",
      owner: "Operator",
    },
    {
      id: "github_url",
      label: "Current GitHub repository attached",
      status: isExternalUrl(githubUrl) ? "ready" : "operator_input",
      owner: "Operator",
    },
    {
      id: "operator_email",
      label: "Technical operator contact included",
      status: isEmail(operatorEmail) ? "ready" : "operator_input",
      owner: "Operator",
    },
    {
      id: "proof_packet",
      label: "MealPilot proof packet and metrics linked",
      status: "ready",
      owner: "MealPilot",
    },
    {
      id: "swiggy_approval",
      label: "Production, feature, and co-branding approvals stay with Swiggy",
      status: "swiggy_gate",
      owner: "Swiggy",
    },
  ] satisfies SwiggyShowcaseSubmissionComposition["checklist"];
  const body = [
    "Hi Swiggy Builders team,",
    "",
    "Sharing MealPilot for Swiggy Builders showcase and production-access review.",
    "",
    center.pitchBlocks.map((block) => `${block.label}: ${block.copy}`).join("\n\n"),
    "",
    `Demo video: ${demoUrl || "[operator to add unlisted demo URL]"}`,
    `GitHub repository: ${githubUrl || "[operator to add repository URL]"}`,
    `Technical contact: ${operatorEmail || "[operator to add contact email]"}`,
    note ? `Operator note: ${note}` : "",
    "",
    `Proof packet: ${proofLinks.slice(0, 8).join(", ")}`,
    "",
    "Manual gates: this draft does not submit forms, send email, request co-branding, claim production credentials, or imply Swiggy endorsement. We will wait for Swiggy review before production access, public feature placement, co-marketing, or Powered by Swiggy asset use.",
    "",
    "Thanks,",
    "MealPilot operator",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return {
    generatedAt: new Date().toISOString(),
    decision,
    readinessScore,
    inputs: {
      demoUrl,
      githubUrl,
      operatorEmail,
      note,
    },
    missingInputs,
    to: center.outreachEmail.to,
    subject: center.outreachEmail.subject,
    body,
    checklist,
    proofLinks,
    pitchBlocks: center.pitchBlocks,
    metricPack: center.metricPack,
    assertions: [
      "The composed showcase packet is copy-ready but is not sent automatically.",
      "Invalid or missing demo, repository, and operator contact inputs remain visible as operator-owned gates.",
      ...center.assertions.slice(0, 2),
    ],
    externalGates: center.externalGates,
  };
}
