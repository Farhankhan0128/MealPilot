import type {
  SwiggyTalentPath,
  SwiggyTalentOutreachDecision,
  SwiggyTalentOutreachPacket,
  SwiggyTalentPortfolioAsset,
  SwiggyTalentSignal,
  SwiggyTalentSignalCenter,
  SwiggyTalentSignalStatus,
} from "../../src/domain/types.js";
import { buildReviewerArtifactVault } from "./reviewerArtifactVault.js";
import { buildSwiggyDemoEvidenceDirector } from "./demoEvidenceDirector.js";
import { buildSwiggyGrowthPartnershipCenter } from "./growthPartnership.js";
import { buildSwiggyShowcaseSubmissionCenter } from "./showcaseSubmissionCenter.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/blog/2026-04-17-builders-club-launch/",
];

function statusWeight(status: SwiggyTalentSignalStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.78;
  return 0.56;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function hasUrl(value?: string) {
  return Boolean(value?.trim() && /^https?:\/\//i.test(value.trim()));
}

function talentDecision(
  pathItem: SwiggyTalentPath | null,
  missingInputs: string[],
): SwiggyTalentOutreachDecision {
  if (!pathItem) return "unknown_talent_path";
  if (missingInputs.length > 0) return "needs_operator_input";
  if (pathItem.status === "swiggy_gate") return "swiggy_gate";
  return "ready_local_handoff";
}

function talentReadiness(decision: SwiggyTalentOutreachDecision) {
  if (decision === "ready_local_handoff") return 100;
  if (decision === "needs_operator_input") return 66;
  if (decision === "swiggy_gate") return 58;
  return 0;
}

function signal(input: SwiggyTalentSignal): SwiggyTalentSignal {
  return input;
}

function asset(input: SwiggyTalentPortfolioAsset): SwiggyTalentPortfolioAsset {
  return input;
}

function path(input: SwiggyTalentPath): SwiggyTalentPath {
  return input;
}

export function buildSwiggyTalentSignalCenter(): SwiggyTalentSignalCenter {
  const growth = buildSwiggyGrowthPartnershipCenter();
  const showcase = buildSwiggyShowcaseSubmissionCenter();
  const demoEvidence = buildSwiggyDemoEvidenceDirector();
  const vault = buildReviewerArtifactVault();

  const signals = [
    signal({
      id: "standout_project",
      source: "builders_home",
      officialSignal: "Swiggy invites builders to share demos and says standout projects can get noticed.",
      mealPilotSignal:
        "MealPilot packages a full Swiggy MCP product, 35-tool coverage, visual QA, production verifier output, and a demo script as recruiter-visible proof.",
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/swiggy-showcase-submission-center", "/api/builder-packet-export", "/api/visual-qa-center"],
      nextAction: "Keep the demo packet current and attach the final demo URL before outreach.",
    }),
    signal({
      id: "hiring_visibility",
      source: "developers",
      officialSignal: "The developer page positions impressive Builders projects as signals that may lead to hiring conversations.",
      mealPilotSignal:
        "MealPilot turns the build into an engineering portfolio with architecture, safety, test coverage, observability, and route-optimization evidence.",
      owner: "Joint",
      status: "operator_input",
      proofLinks: ["/api/reviewer-artifact-vault", "/api/swiggy-route-optimizer", "/api/swiggy-tool-parity-auditor"],
      nextAction: "Operator must add the public GitHub/demo link and concise technical summary before sending.",
    }),
    signal({
      id: "swiggy_recruiting_gate",
      source: "developers",
      officialSignal: "Any recruiting or hiring follow-up is at Swiggy's discretion after review.",
      mealPilotSignal:
        "The center never claims interview, hiring, feature, or endorsement status; it only prepares proof for Swiggy review.",
      owner: "Swiggy",
      status: "swiggy_gate",
      proofLinks: ["/api/swiggy-faq-resolution-center", "/api/brand-compliance-kit"],
      nextAction: "Wait for explicit Swiggy outreach before making hiring or partnership claims.",
    }),
    signal({
      id: "technical_depth",
      source: "showcase",
      officialSignal: "Swiggy asks for real products and demos, not concept decks.",
      mealPilotSignal:
        "The reviewer vault holds executable routes, screenshots, logs, traces, OpenAPI, packet export, redaction rules, and production verifier evidence.",
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/reviewer-artifact-vault", "/api/openapi.json", "/api/telemetry/runtime"],
      nextAction: "Open the vault and production verifier summary during the talent or partner review call.",
    }),
    signal({
      id: "open_source_execution",
      source: "showcase",
      officialSignal: "A public product repository and shipped demo make the builder's execution legible to reviewers.",
      mealPilotSignal:
        "MealPilot keeps GitHub, docs, tests, production verifier output, and visual screenshots aligned as an open engineering portfolio.",
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["https://github.com/Farhankhan0128/MealPilot", "/api/builder-packet-export", "/api/visual-qa-center"],
      nextAction: "Push every verified slice so the repository stays current with the reviewer packet.",
    }),
    signal({
      id: "growth_operator_signal",
      source: "access",
      officialSignal: "Swiggy values builders who can grow, operate safely, and collaborate with support.",
      mealPilotSignal:
        `${growth.readyExperiments}/${growth.totalExperiments} growth experiments and ${vault.totalArtifacts} reviewer artifacts prove operating maturity.`,
      owner: "MealPilot",
      status: "ready",
      proofLinks: ["/api/swiggy-growth-partnership", "/api/swiggy-partner-success-desk", "/api/slo-incident-command"],
      nextAction: "Use the growth and support packets to show operator maturity after access approval.",
    }),
    signal({
      id: "demo_story_signal",
      source: "showcase",
      officialSignal: "The access flow asks builders to show a demo.",
      mealPilotSignal:
        `${demoEvidence.totals.readyScenes}/${demoEvidence.totals.scenes} demo scenes and ${showcase.totals.pitchBlocks} pitch blocks are prepared with proof routes.`,
      owner: "Operator",
      status: "operator_input",
      proofLinks: ["/api/swiggy-demo-evidence-director", "docs/demo-script.md"],
      nextAction: "Record and review the final short demo before sending the outreach draft.",
    }),
  ];

  const portfolioAssets = [
    asset({
      id: "demo_video",
      label: "Short demo video",
      format: "demo",
      owner: "Operator",
      status: "operator_input",
      purpose: "Show the premium MealPilot flow, Launch Center proof, confirmation gates, and reviewer packet in under three minutes.",
      proofLinks: ["/api/swiggy-demo-evidence-director", "docs/demo-script.md"],
    }),
    asset({
      id: "github_repo",
      label: "GitHub engineering portfolio",
      format: "github",
      owner: "Operator",
      status: "operator_input",
      purpose: "Attach the pushed MealPilot repository and commit history as the public engineering proof surface.",
      proofLinks: ["https://github.com/Farhankhan0128/MealPilot", "/api/builder-packet-export"],
    }),
    asset({
      id: "architecture_packet",
      label: "Architecture and safety packet",
      format: "architecture",
      owner: "MealPilot",
      status: "ready",
      purpose: "Explain MCP servers, OAuth gates, confirmation boundaries, observability, route optimization, and data governance.",
      proofLinks: ["docs/architecture.md", "/api/data-governance-center", "/api/mcp/commercial-action-guard"],
    }),
    asset({
      id: "metrics_packet",
      label: "Metrics and growth packet",
      format: "metric_pack",
      owner: "MealPilot",
      status: "ready",
      purpose: "Show tool parity, visual QA, route optimization, growth experiments, traffic readiness, and support maturity.",
      proofLinks: ["/api/swiggy-growth-partnership", "/api/swiggy-route-optimizer", "/api/traffic-readiness-plan"],
    }),
    asset({
      id: "visual_gallery",
      label: "Responsive visual gallery",
      format: "visual",
      owner: "MealPilot",
      status: "ready",
      purpose: "Provide desktop, tablet, and mobile screenshots with no overlap, plus the Launch Center talent card.",
      proofLinks: ["/api/visual-qa-center", "artifacts/visual-qa/report.json"],
    }),
    asset({
      id: "talent_outreach",
      label: "Talent and partner outreach draft",
      format: "outreach",
      owner: "Operator",
      status: "operator_input",
      purpose: "Prepare a concise builders@swiggy.in note that shares product proof without claiming hiring entitlement.",
      proofLinks: ["/api/swiggy-talent-signal-center", "/api/swiggy-showcase-submission-center"],
    }),
  ];

  const talentPaths = [
    path({
      id: "builder_visibility",
      label: "Builder visibility",
      roleSignal: "builder",
      pitch: "MealPilot is a complete Swiggy MCP product with all three servers, all tools, premium UX, and production review evidence.",
      evidenceLinks: ["/api/mcp/catalog", "/api/swiggy-builders-launch-story", "/api/builder-packet-export"],
      status: "ready",
      gate: "Swiggy decides whether the project is featured.",
    }),
    path({
      id: "engineering_depth",
      label: "Engineering depth",
      roleSignal: "engineer",
      pitch: "The codebase demonstrates OAuth, DCR, tool contracts, state orchestration, retries, telemetry, visual QA, and no-token logging.",
      evidenceLinks: ["/api/swiggy-auth-lifecycle-center", "/api/mcp/tool-contract-matrix", "/api/telemetry/runtime"],
      status: "ready",
      gate: "Swiggy recruiting outreach is external and never assumed.",
    }),
    path({
      id: "operator_maturity",
      label: "Operator maturity",
      roleSignal: "partner",
      pitch: "MealPilot has support lanes, capacity packets, SLO command, audit proof, launch bundle, and partner success handoff.",
      evidenceLinks: ["/api/swiggy-partner-success-desk", "/api/swiggy-quota-negotiation-center", "/api/production-launch-bundle"],
      status: "ready",
      gate: "Partner support channels require access approval.",
    }),
    path({
      id: "enterprise_readiness",
      label: "Enterprise readiness",
      roleSignal: "enterprise",
      pitch: "Enterprise delegated auth, tenant controls, data governance, support packets, and audit exports are modeled before live credentials.",
      evidenceLinks: ["/api/enterprise-delegated-auth", "/api/enterprise-platform-center", "/api/data-governance-center"],
      status: "swiggy_gate",
      gate: "Enterprise terms, partner manager, Slack, and dashboards require Swiggy approval.",
    }),
  ];

  const proofLinks = unique([
    ...signals.flatMap((item) => item.proofLinks),
    ...portfolioAssets.flatMap((item) => item.proofLinks),
    ...talentPaths.flatMap((item) => item.evidenceLinks),
  ]);
  const scoreItems = [...signals.map((item) => item.status), ...portfolioAssets.map((item) => item.status), ...talentPaths.map((item) => item.status)];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      signals: signals.length,
      readySignals: signals.filter((item) => item.status === "ready").length,
      portfolioAssets: portfolioAssets.length,
      readyAssets: portfolioAssets.filter((item) => item.status === "ready").length,
      talentPaths: talentPaths.length,
      swiggyGates: [...signals, ...portfolioAssets, ...talentPaths].filter((item) => item.status === "swiggy_gate").length,
      proofLinks: proofLinks.length,
    },
    signals,
    portfolioAssets,
    talentPaths,
    reviewerNarrative: [
      {
        sequence: 1,
        label: "Product proof",
        say: "MealPilot is a runnable Swiggy MCP product with premium UX, not a prototype slide.",
        proofLinks: ["/api/mcp/catalog", "/api/swiggy-showcase-submission-center"],
      },
      {
        sequence: 2,
        label: "Engineering proof",
        say: "The app demonstrates contracts, auth, state, confirmation, visual QA, tests, observability, and route optimization.",
        proofLinks: ["/api/mcp/tool-contract-matrix", "/api/swiggy-route-optimizer", "/api/visual-qa-center"],
      },
      {
        sequence: 3,
        label: "Safety proof",
        say: "Commercial actions require explicit confirmation, no blind retries, no raw token logging, and support-safe telemetry.",
        proofLinks: ["/api/swiggy-confirmation-command-center", "/api/data-governance-center"],
      },
      {
        sequence: 4,
        label: "Talent boundary",
        say: "Hiring, featuring, endorsement, and partner access remain Swiggy decisions after review.",
        proofLinks: ["/api/swiggy-faq-resolution-center", "/api/brand-compliance-kit"],
      },
    ],
    outreachDraft: {
      to: "builders@swiggy.in",
      subject: "MealPilot Swiggy MCP builder and talent signal packet",
      bodyPreview:
        "Sharing MealPilot as a complete Swiggy MCP product and builder portfolio: full Food, Instamart, and Dineout coverage, premium UX, safety controls, production verification, visual QA, and demo evidence. I am not claiming feature placement or hiring entitlement; this packet is for review.",
      proofLinks: ["/api/swiggy-talent-signal-center", "/api/builder-packet-export", "/api/reviewer-artifact-vault"],
    },
    assertions: [
      "Talent visibility is treated as a proof packet and outreach path, not a promise of Swiggy hiring, endorsement, or feature placement.",
      "Every portfolio asset links to runnable local evidence, docs, screenshots, or a manual operator-owned demo/GitHub action.",
      "The center composes Showcase, Demo Evidence, Growth Partnership, Reviewer Artifact Vault, and production proof so talent signals stay current.",
      "No form, email, interview request, or external claim is submitted automatically by local verification.",
    ],
    externalGates: [
      "Operator must attach the final public demo video and GitHub link before sending outreach.",
      "Swiggy must decide any hiring conversation, feature placement, co-marketing, endorsement, or enterprise partner channel.",
      "Swiggy access, staging credentials, production credentials, and official brand approval remain external gates.",
    ],
  };
}

export function composeSwiggyTalentOutreach(options: {
  pathId: string;
  demoUrl?: string;
  githubUrl?: string;
  technicalSummary?: string;
}): SwiggyTalentOutreachPacket {
  const center = buildSwiggyTalentSignalCenter();
  const pathItem = center.talentPaths.find((item) => item.id === options.pathId) ?? null;
  const missingInputs = [
    hasUrl(options.demoUrl) ? "" : "demo_url",
    hasUrl(options.githubUrl) ? "" : "github_url",
    options.technicalSummary?.trim() ? "" : "technical_summary",
  ].filter(Boolean);
  const decision = talentDecision(pathItem, missingInputs);
  const portfolioAssets = center.portfolioAssets.slice(0, 6);
  const reviewerNarrative = center.reviewerNarrative;
  const proofLinks = unique([
    "/api/swiggy-talent-signal-center",
    ...(pathItem?.evidenceLinks ?? []),
    ...portfolioAssets.flatMap((item) => item.proofLinks),
    ...reviewerNarrative.flatMap((item) => item.proofLinks),
    options.demoUrl?.trim() ?? "",
    options.githubUrl?.trim() ?? "",
  ]).slice(0, 14);
  const bodyPreview =
    pathItem && decision !== "unknown_talent_path"
      ? `${pathItem.label} outreach: ${pathItem.pitch} Demo: ${options.demoUrl?.trim() || "[operator demo URL required]"} Repo: ${options.githubUrl?.trim() || "[operator GitHub URL required]"} Technical summary: ${options.technicalSummary?.trim() || "[operator summary required]"} Boundary: ${pathItem.gate} Proof: ${proofLinks.join(", ")}`
      : "Unknown talent path. Choose a published Talent Signal path before preparing Swiggy outreach.";

  return {
    generatedAt: new Date().toISOString(),
    pathId: options.pathId,
    decision,
    readinessScore: talentReadiness(decision),
    path: pathItem,
    portfolioAssets,
    reviewerNarrative,
    proofLinks,
    missingInputs,
    handoffDraft: {
      to: center.outreachDraft.to,
      subject: pathItem
        ? `MealPilot Swiggy talent signal: ${pathItem.label}`
        : "MealPilot Swiggy talent signal",
      bodyPreview,
    },
    checklist: [
      {
        id: "talent_path_selected",
        label: pathItem ? `${pathItem.label} selected` : "Valid Talent Signal path selected",
        status: pathItem ? pathItem.status : "operator_input",
        owner: pathItem?.status === "swiggy_gate" ? "Swiggy" : "MealPilot",
      },
      {
        id: "demo_url_attached",
        label: "Public demo URL attached",
        status: hasUrl(options.demoUrl) ? "ready" : "operator_input",
        owner: "Operator",
      },
      {
        id: "github_url_attached",
        label: "GitHub repository URL attached",
        status: hasUrl(options.githubUrl) ? "ready" : "operator_input",
        owner: "Operator",
      },
      {
        id: "technical_summary_written",
        label: "Concise technical summary written",
        status: options.technicalSummary?.trim() ? "ready" : "operator_input",
        owner: "Operator",
      },
      {
        id: "swiggy_recruiting_gate_preserved",
        label: "Swiggy recruiting, feature, and endorsement gate preserved",
        status: pathItem?.status === "swiggy_gate" ? "swiggy_gate" : "ready",
        owner: pathItem?.status === "swiggy_gate" ? "Swiggy" : "MealPilot",
      },
    ],
    assertions: [
      "Talent outreach composition prepares a local packet only; it never sends email, applies for a role, requests an interview, claims feature placement, or claims Swiggy endorsement.",
      "Demo URL, GitHub URL, and technical summary remain operator-owned inputs before any external outreach.",
      ...center.assertions.slice(0, 2),
    ],
    externalGates: center.externalGates,
  };
}
