import type {
  SwiggyDemoEvidenceDirector,
  SwiggyDemoEvidenceOwner,
  SwiggyDemoEvidenceScene,
  SwiggyDemoEvidenceStatus,
  SwiggyDemoProofAsset,
  SwiggyDemoRecordingGate,
} from "../../src/domain/types.js";
import { buildReviewerArtifactVault } from "./reviewerArtifactVault.js";
import { buildSwiggyShowcaseSubmissionCenter } from "./showcaseSubmissionCenter.js";
import { buildVisualQaCenter } from "./visualQaCenter.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function statusWeight(status: SwiggyDemoEvidenceStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.76;
  return 0.55;
}

function scene(input: SwiggyDemoEvidenceScene): SwiggyDemoEvidenceScene {
  return input;
}

function proofAsset(
  id: string,
  label: string,
  source: string,
  owner: SwiggyDemoEvidenceOwner,
  status: SwiggyDemoEvidenceStatus,
  purpose: string,
  redaction: string,
): SwiggyDemoProofAsset {
  return { id, label, source, owner, status, purpose, redaction };
}

function recordingGate(
  id: string,
  label: string,
  owner: SwiggyDemoEvidenceOwner,
  status: SwiggyDemoEvidenceStatus,
  check: string,
  evidenceLinks: string[],
): SwiggyDemoRecordingGate {
  return { id, label, owner, status, check, evidenceLinks };
}

export function buildSwiggyDemoEvidenceDirector(): SwiggyDemoEvidenceDirector {
  const showcase = buildSwiggyShowcaseSubmissionCenter();
  const vault = buildReviewerArtifactVault();
  const visualQa = buildVisualQaCenter();
  const visualTargets = visualQa.totalTargets;
  const readyScreenshots = visualQa.readyTargets;

  const scenes = [
    scene({
      sequence: 1,
      id: "opening_context",
      label: "Open with the household food mission",
      duration: "0:00-0:20",
      status: "ready",
      cameraCue: "Show the MealPilot planner, profile context, budget, and city controls on desktop.",
      narration:
        "MealPilot turns Food, Instamart, and Dineout into one confirmation-safe planning layer for Indian households.",
      proofLinks: ["/api/plan", "/api/premium-use-case-studio", "/api/swiggy-showcase-submission-center"],
      recordingGate: "No live personal addresses, phone numbers, browser profiles, or notifications on screen.",
    }),
    scene({
      sequence: 2,
      id: "mcp_coverage",
      label: "Prove all Swiggy MCP coverage",
      duration: "0:20-0:45",
      status: "ready",
      cameraCue: "Open Launch Center and hover Tool Lab, Contract Matrix, and Staging Seed Smoke cards.",
      narration: "The local product maps every official Swiggy tool, scenario, state guard, and commercial confirmation path.",
      proofLinks: ["/api/mcp/catalog", "/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix"],
      recordingGate: "Keep mock, staging, and production labels visible so reviewers can distinguish fixture evidence.",
    }),
    scene({
      sequence: 3,
      id: "commercial_guard",
      label: "Show confirmation-first commerce",
      duration: "0:45-1:10",
      status: "ready",
      cameraCue: "Trigger one recommendation confirmation path and show audit/status readback without placing a live order.",
      narration:
        "MealPilot separates Food orders, Instamart checkout, and Dineout booking into explicit approvals with status checks before retry.",
      proofLinks: ["/api/swiggy-confirmation-command-center", "/api/audit-ledger", "/api/mcp/commercial-action-guard"],
      recordingGate: "Do not place a live commercial transaction unless Swiggy staging credentials explicitly allow it.",
    }),
    scene({
      sequence: 4,
      id: "premium_differentiation",
      label: "Demonstrate premium differentiation",
      duration: "1:10-1:40",
      status: "ready",
      cameraCue: "Scan voice commerce, visual dish capture, luxury workspace, and growth partnership proof cards.",
      narration:
        "The portal goes beyond ordering: it handles guests, rituals, nutrition budgets, concierge planning, voice, camera, and support recovery.",
      proofLinks: [
        "/api/swiggy-voice-commerce-center",
        "/api/swiggy-visual-dish-capture",
        "/api/luxury-experience-workspace",
        "/api/swiggy-growth-partnership",
      ],
      recordingGate: "Use synthetic or local-fixture imagery and avoid raw user screenshots in visual dish examples.",
    }),
    scene({
      sequence: 5,
      id: "reviewer_evidence",
      label: "Show review packet and visual proof",
      duration: "1:40-2:10",
      status: "ready",
      cameraCue: "Open Reviewer Artifact Vault, Visual QA Center, and Builder Packet Export links.",
      narration: `The reviewer packet includes ${vault.totalArtifacts} artifacts, ${readyScreenshots}/${visualTargets} visual targets, commands, screenshots, and redaction rules.`,
      proofLinks: ["/api/reviewer-artifact-vault", "/api/visual-qa-center", "/api/builder-packet-export"],
      recordingGate: "Confirm generated screenshots do not reveal secrets, exact addresses, email, phone, or payment data.",
    }),
    scene({
      sequence: 6,
      id: "handoff_close",
      label: "Close with Swiggy handoff gates",
      duration: "2:10-2:35",
      status: "operator_input",
      cameraCue: "Show Showcase Submission, Submission Timeline, demo URL field, and builders@swiggy.in handoff copy.",
      narration:
        "The access packet is ready locally; the operator still owns the video URL, final form submission, and Swiggy owns access, credentials, and co-branding approval.",
      proofLinks: ["/api/swiggy-demo-evidence-director", "/api/swiggy-submission-timeline-center", "/api/access-submission-studio"],
      recordingGate: "Paste the final unlisted demo URL only after the recorded video has been reviewed and redacted.",
    }),
  ];

  const proofAssets = [
    proofAsset(
      "storyboard",
      "2-3 minute demo storyboard",
      "/api/swiggy-demo-evidence-director",
      "MealPilot",
      "ready",
      "Time-coded scenes for the official Swiggy demo request.",
      "Narration avoids live customer identifiers and unsupported co-branding claims.",
    ),
    proofAsset(
      "showcase_packet",
      "Showcase submission packet",
      "/api/swiggy-showcase-submission-center",
      "MealPilot",
      "ready",
      `${showcase.totals.readyAssets}/${showcase.totals.assets} showcase assets are ready for feature review.`,
      "Swiggy feature placement and Powered by Swiggy claims remain gated.",
    ),
    proofAsset(
      "visual_report",
      "Visual QA screenshot report",
      "artifacts/visual-qa/report.json",
      "MealPilot",
      "ready",
      `${readyScreenshots}/${visualTargets} screenshot targets are ready for desktop, tablet, and mobile review.`,
      "Screenshots must exclude tokens, profiles, notifications, exact addresses, payment data, phone, and email.",
    ),
    proofAsset(
      "reviewer_vault",
      "Reviewer Artifact Vault",
      "/api/reviewer-artifact-vault",
      "MealPilot",
      "ready",
      `${vault.readyArtifacts}/${vault.totalArtifacts} reviewer artifacts carry proof paths and redaction rules.`,
      "Each artifact declares a redaction policy before it is shared externally.",
    ),
    proofAsset(
      "builder_packet",
      "Builder packet export",
      "/api/builder-packet-export",
      "MealPilot",
      "ready",
      "Copy-ready JSON and Markdown packet for the Swiggy access application.",
      "Generated artifacts stay local and exclude secrets.",
    ),
    proofAsset(
      "verification_summary",
      "Production verification summary",
      "artifacts/builder-packet/verification-summary.json",
      "MealPilot",
      "ready",
      "Production smoke validates the API contract, launch evidence, and Swiggy proof surface.",
      "Verification output reports counts and gates instead of raw customer payloads.",
    ),
    proofAsset(
      "demo_video_url",
      "Unlisted demo video URL",
      "manual:Loom/Drive/YouTube-unlisted",
      "Operator",
      "operator_input",
      "Final 2-3 minute screen recording for Swiggy Builders review.",
      "Blur browser profiles, secrets, terminal env vars, personal notifications, PII, and live identifiers.",
    ),
    proofAsset(
      "swiggy_approval",
      "Swiggy showcase and co-branding approval",
      "external:Swiggy Builders review",
      "Swiggy",
      "swiggy_gate",
      "Swiggy approval for production access, public feature placement, logo use, and co-marketing.",
      "No Powered by Swiggy, public endorsement, or partnership claim is shown before approval.",
    ),
  ];

  const recordingGates = [
    recordingGate(
      "build_before_recording",
      "Production build is green",
      "MealPilot",
      "ready",
      "Run build, lint, unit/API tests, and production verification before recording.",
      ["npm run build", "npm run lint", "npm test -- --run", "npm run verify:production"],
    ),
    recordingGate(
      "visual_before_recording",
      "Responsive screenshots are green",
      "MealPilot",
      "ready",
      `Capture all ${visualTargets} visual QA targets before selecting screenshots for the demo packet.`,
      ["MEALPILOT_URL=http://localhost:8787 npm run verify:visual", "/api/visual-qa-center"],
    ),
    recordingGate(
      "redaction_review",
      "Redaction review is complete",
      "Operator",
      "operator_input",
      "Review the video and screenshots for tokens, browser profiles, personal notifications, full addresses, phone, email, and payment data.",
      ["/api/reviewer-artifact-vault", "docs/safety-and-compliance.md"],
    ),
    recordingGate(
      "demo_url_attached",
      "Demo URL attached",
      "Operator",
      "operator_input",
      "Paste the final unlisted video URL into the access form, handoff email, and builder packet notes.",
      ["/api/access-submission-studio", "/api/swiggy-showcase-submission-center"],
    ),
    recordingGate(
      "final_email_send",
      "Final builders@swiggy.in email sent",
      "Operator",
      "operator_input",
      "Send the prepared handoff email only after the video URL and screenshots are attached.",
      ["/api/swiggy-demo-evidence-director", "/api/builder-packet-export"],
    ),
    recordingGate(
      "swiggy_access_review",
      "Swiggy review and approval",
      "Swiggy",
      "swiggy_gate",
      "Swiggy must approve production access, credentials, co-branding, showcase placement, and support channel setup.",
      ["https://mcp.swiggy.com/builders/access/", "/api/swiggy-submission-timeline-center"],
    ),
  ];

  const proofLinks = unique([
    ...scenes.flatMap((item) => item.proofLinks),
    ...recordingGates.flatMap((item) => item.evidenceLinks),
    ...proofAssets.map((item) => item.source),
  ]);
  const scoreItems = [
    ...scenes.map((item) => item.status),
    ...proofAssets.map((item) => item.status),
    ...recordingGates.map((item) => item.status),
  ];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusWeight(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    recommendedRuntime: "2-3 minute screen recording from local production server at http://localhost:8787",
    totals: {
      scenes: scenes.length,
      readyScenes: scenes.filter((item) => item.status === "ready").length,
      proofAssets: proofAssets.length,
      readyProofAssets: proofAssets.filter((item) => item.status === "ready").length,
      recordingGates: recordingGates.length,
      operatorInputs: [...scenes, ...proofAssets, ...recordingGates].filter((item) => item.status === "operator_input").length,
      swiggyGates: [...scenes, ...proofAssets, ...recordingGates].filter((item) => item.status === "swiggy_gate").length,
      proofLinks: proofLinks.length,
    },
    scenes,
    proofAssets,
    recordingGates,
    runbook: [
      { sequence: 1, label: "Build", command: "npm run build", proves: "TypeScript and Vite production assets compile." },
      { sequence: 2, label: "Test", command: "npm test -- --run", proves: "Planner, API, Swiggy proof, and UI tests pass." },
      { sequence: 3, label: "Smoke", command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production", proves: "Runtime proof routes and OpenAPI contract pass." },
      { sequence: 4, label: "Visual QA", command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual", proves: `${visualTargets} screenshot targets capture without overflow.` },
      { sequence: 5, label: "Packet", command: "MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet", proves: "Builder packet JSON, Markdown, and verification summary are written." },
    ],
    handoffEmail: {
      to: "builders@swiggy.in",
      subject: "MealPilot Swiggy MCP demo evidence and showcase packet",
      bodyPreview:
        "Hi Swiggy Builders team, sharing MealPilot's 2-3 minute demo evidence director with storyboard, visual QA, reviewer vault, builder packet, redaction gates, and the final unlisted demo URL once recorded.",
      evidenceLinks: ["/api/swiggy-demo-evidence-director", "/api/swiggy-showcase-submission-center", "/api/builder-packet-export"],
    },
    assertions: [
      "The director prepares demo evidence locally but does not record video, submit forms, send email, or claim Swiggy approval automatically.",
      "Every scene links to executable proof routes so the video script stays grounded in working product behavior.",
      "Recording gates require redaction review before demo URLs, screenshots, or generated packets are shared externally.",
      "Swiggy production access, credentials, support channels, showcase placement, and co-branding remain explicit external gates.",
    ],
    externalGates: [
      "Operator must record, review, redact, host, and attach the final demo video URL.",
      "Operator must send the final builders@swiggy.in handoff email and official access form.",
      "Swiggy must approve access, staging and production credentials, co-branding, showcase placement, and partner support setup.",
    ],
  };
}
