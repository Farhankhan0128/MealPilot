import type {
  SwiggyInteractionQaCenter,
  SwiggyInteractionQaLane,
  SwiggyInteractionQaRehearsal,
  SwiggyInteractionQaRehearsalDecision,
  SwiggyInteractionQaStatus,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/build/tools/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
];

function lane(input: SwiggyInteractionQaLane): SwiggyInteractionQaLane {
  return input;
}

function statusWeight(status: SwiggyInteractionQaStatus) {
  if (status === "working") return 1;
  if (status === "manual_gate") return 0.78;
  return 0.62;
}

function hasEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function rehearsalDecision(
  lane: SwiggyInteractionQaLane | undefined,
  missingInputs: string[],
): SwiggyInteractionQaRehearsalDecision {
  if (!lane) return "unknown_cta_lane";
  if (lane.status === "external_gate") return "swiggy_gate";
  if (missingInputs.length > 0) return "needs_operator_input";
  if (lane.status === "manual_gate") return "manual_gate";
  return "ready_local_rehearsal";
}

function rehearsalScore(decision: SwiggyInteractionQaRehearsalDecision) {
  if (decision === "ready_local_rehearsal") return 100;
  if (decision === "manual_gate") return 78;
  if (decision === "needs_operator_input") return 68;
  if (decision === "swiggy_gate") return 56;
  return 30;
}

export function buildSwiggyInteractionQaCenter(): SwiggyInteractionQaCenter {
  const lanes = [
    lane({
      id: "plan_submit",
      label: "Planner submit creates a Swiggy three-server plan",
      surface: "planner",
      ctaLabel: "Build Plan",
      endpoint: "/api/plan",
      method: "POST",
      status: "working",
      swiggyRelevance: "Exercises Food, Instamart, and Dineout route planning before any commercial action.",
      expectedFeedback: "New session id, three recommendations, audit trail, variants, and visible confirmation buttons.",
      automationCoverage: ["server/app.test.ts", "src/App.test.tsx", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/plan", "/api/mcp/scenario-runner", "/api/mcp/tool-lab"],
    }),
    lane({
      id: "single_confirmation",
      label: "Single recommendation confirmation is guarded",
      surface: "planner",
      ctaLabel: "Confirm",
      endpoint: "/api/confirm",
      method: "POST",
      status: "working",
      swiggyRelevance: "Maps to final Food order, Instamart checkout, or Dineout booking approval without blind retry.",
      expectedFeedback: "Only the selected recommendation moves to confirmed and the audit trail records one simulated action.",
      automationCoverage: ["server/app.test.ts", "src/App.test.tsx", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/confirm", "/api/swiggy-confirmation-command-center", "/api/mcp/commercial-action-guard"],
    }),
    lane({
      id: "bulk_confirmation",
      label: "Demo-speed confirmation preserves separate actions",
      surface: "planner",
      ctaLabel: "Confirm All",
      endpoint: "/api/confirm-all",
      method: "POST",
      status: "working",
      swiggyRelevance: "Shows demo convenience while preserving separate Swiggy commercial action records.",
      expectedFeedback: "All prepared recommendations are confirmed with separate Food, Instamart, and Dineout audit events.",
      automationCoverage: ["server/app.test.ts", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/confirm-all", "/api/audit-ledger", "/api/telemetry/runtime"],
    }),
    lane({
      id: "item_substitution",
      label: "Item substitution updates a cart candidate",
      surface: "planner",
      ctaLabel: "Swap",
      endpoint: "/api/substitute",
      method: "POST",
      status: "working",
      swiggyRelevance: "Models safe cart mutation choices before using Swiggy Food or Instamart cart tools.",
      expectedFeedback: "Replacement item appears in the recommendation and budget totals stay recalculated.",
      automationCoverage: ["server/app.test.ts", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/substitute", "/api/swiggy-customization-studio", "/api/swiggy-cart-mutation-workbench"],
    }),
    lane({
      id: "privacy_export",
      label: "Privacy export is visible and user-owned",
      surface: "settings",
      ctaLabel: "Export Data",
      endpoint: "/api/privacy/export",
      method: "GET",
      status: "working",
      swiggyRelevance: "Supports Swiggy access-review expectations for minimal PII, DSR, and redaction posture.",
      expectedFeedback: "A local export summary is returned without raw Swiggy tokens or payment instruments.",
      automationCoverage: ["src/App.test.tsx", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/privacy/export", "/api/data-governance-center", "/api/audit-ledger"],
    }),
    lane({
      id: "support_report",
      label: "Support report requires observed issue and consent",
      surface: "production_evidence",
      ctaLabel: "Create Support Report",
      endpoint: "/api/support/report",
      method: "POST",
      status: "working",
      swiggyRelevance: "Maps to Swiggy support escalation and report_error evidence without sending unsupported claims.",
      expectedFeedback: "Incident draft contains session, severity, redacted context, and builders@swiggy.in handoff copy.",
      automationCoverage: ["server/app.test.ts", "src/App.test.tsx", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/support/report", "/api/support/bridge", "/api/error-intelligence"],
    }),
    lane({
      id: "builder_packet_export",
      label: "Builder packet export opens reviewer artifacts",
      surface: "launch_center",
      ctaLabel: "Export Builder Packet",
      endpoint: "/api/builder-packet-export",
      method: "GET",
      status: "working",
      swiggyRelevance: "Packages Swiggy access-form, demo, proof links, visual QA, and verification evidence.",
      expectedFeedback: "Machine-readable and Markdown packet endpoints return access evidence and reviewer proof.",
      automationCoverage: ["scripts/export-builder-packet.mjs", "scripts/verify-production.mjs", "server/app.test.ts"],
      evidenceLinks: ["/api/builder-packet-export", "/api/builder-packet-export.md", "/api/reviewer-artifact-vault"],
    }),
    lane({
      id: "developer_first_call",
      label: "Developer first-call drill is executable when safe",
      surface: "launch_center",
      ctaLabel: "Run first call",
      endpoint: "/api/swiggy-developer-quickstart/run-first-call",
      method: "POST",
      status: "working",
      swiggyRelevance: "Exercises the official read-only first-call path for MCP client confidence.",
      expectedFeedback: "Read-only get_addresses-style drill returns redacted request/response summaries or a credential gate.",
      automationCoverage: ["server/app.test.ts", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/swiggy-developer-quickstart", "/api/swiggy-developer-quickstart/run-first-call"],
    }),
    lane({
      id: "access_submission",
      label: "Official access submission stays operator gated",
      surface: "launch_center",
      ctaLabel: "Request access",
      endpoint: "https://mcp.swiggy.com/builders/access/",
      method: "GET",
      status: "manual_gate",
      swiggyRelevance: "Swiggy owns production approval, demo review, and credential issuance.",
      expectedFeedback: "MealPilot opens proof routes and mail drafts, but the official form and demo email are submitted manually.",
      automationCoverage: ["server/app.test.ts", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/access-submission-studio", "/api/submission-console", "/api/swiggy-builder-intake"],
    }),
    lane({
      id: "enterprise_slack",
      label: "Enterprise Slack and partner manager are not auto-claimed",
      surface: "launch_center",
      ctaLabel: "Request partner support",
      endpoint: "mailto:builders@swiggy.in",
      method: "GET",
      status: "external_gate",
      swiggyRelevance: "Swiggy's enterprise support, Slack, partner manager, and analytics access are approval-gated.",
      expectedFeedback: "Only copy-ready drafts and evidence links are prepared; no Slack invite or partner claim is automated.",
      automationCoverage: ["server/app.test.ts", "scripts/verify-production.mjs"],
      evidenceLinks: ["/api/swiggy-partner-success-desk", "/api/enterprise-platform-center", "/api/swiggy-growth-partnership"],
    }),
  ];

  const score = Math.round((lanes.reduce((sum, item) => sum + statusWeight(item.status), 0) / lanes.length) * 100);
  const automatedProofs = new Set(lanes.flatMap((item) => item.automationCoverage)).size;

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      lanes: lanes.length,
      working: lanes.filter((item) => item.status === "working").length,
      manualGates: lanes.filter((item) => item.status === "manual_gate").length,
      externalGates: lanes.filter((item) => item.status === "external_gate").length,
      automatedProofs,
      postActions: lanes.filter((item) => item.method === "POST" || item.method === "PATCH").length,
    },
    lanes,
    regressionRunbook: [
      {
        sequence: 1,
        label: "Run unit and integration coverage for clickable surfaces",
        command: "npm test -- --run",
        expectedSignal: "App CTA tests and server endpoint tests pass without skipped interaction lanes.",
      },
      {
        sequence: 2,
        label: "Run production smoke against the live local server",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        expectedSignal: "Interaction QA score, working lanes, manual gates, and external gates are asserted.",
      },
      {
        sequence: 3,
        label: "Capture visual proof for launch-center interaction card",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        expectedSignal: "The interaction QA card renders with no overflow across reviewer viewports.",
      },
    ],
    clickAssertions: [
      "Every locally executable CTA maps to an HTTP route with automated test or verifier coverage.",
      "Every Swiggy-owned action, including access approval, Slack, partner manager, and production credentials, remains a manual or external gate.",
      "Commercial Swiggy actions require explicit user confirmation and never execute from a link-only proof card.",
      "User-facing CTAs return visible feedback: session update, packet export, report draft, redacted drill result, or an explicit gate.",
    ],
    externalGates: [
      "Official Swiggy access form, production credential issuance, enterprise Slack, partner manager, and co-marketing approval.",
      "Live commercial order, checkout, booking, cancellation, and payment evidence without approved staging or production credentials.",
    ],
  };
}

export function rehearseSwiggyInteractionQaLane(options: {
  laneId: string;
  operatorEmail?: string;
  evidenceNote?: string;
  dryRunConfirmed?: boolean;
}): SwiggyInteractionQaRehearsal {
  const center = buildSwiggyInteractionQaCenter();
  const lane = center.lanes.find((item) => item.id === options.laneId);
  const operatorEmail = options.operatorEmail?.trim() ?? "";
  const evidenceNote = options.evidenceNote?.trim() ?? "";
  const missingInputs = [
    !hasEmail(operatorEmail) ? "operator_email" : "",
    evidenceNote.length < 16 ? "evidence_note" : "",
    options.dryRunConfirmed !== true ? "dry_run_confirmation" : "",
  ].filter(Boolean);
  const decision = rehearsalDecision(lane, missingInputs);
  const routeContract: SwiggyInteractionQaRehearsal["routeContract"] = {
    method: lane?.method ?? "BROWSER",
    endpoint: lane?.endpoint ?? "unknown",
    surface: lane?.surface ?? "unknown",
    browserAction: lane
      ? `${lane.ctaLabel} on ${lane.surface.replace(/_/g, " ")} should surface: ${lane.expectedFeedback}`
      : "Choose a known Interaction QA lane before running a local rehearsal.",
  };
  const proofLinks = unique([
    "/api/swiggy-interaction-qa-center",
    lane?.endpoint.startsWith("/") ? lane.endpoint : "",
    ...(lane?.evidenceLinks ?? []),
    "/api/openapi.json",
    "/api/swiggy-cta-live-audit",
  ]);

  return {
    generatedAt: new Date().toISOString(),
    laneId: options.laneId,
    decision,
    readinessScore: rehearsalScore(decision),
    lane: lane ?? null,
    routeContract,
    expectedFeedback: lane?.expectedFeedback ?? "Unknown CTA lane cannot be rehearsed.",
    proofLinks,
    automationCoverage: lane?.automationCoverage ?? [],
    missingInputs,
    checklist: [
      {
        id: "operator_identity",
        label: "Named operator is attached to the CTA QA evidence",
        status: hasEmail(operatorEmail) ? "working" : "manual_gate",
        owner: "Operator",
      },
      {
        id: "dry_run_scope",
        label: "Dry-run rehearsal is confirmed before checking the CTA contract",
        status: options.dryRunConfirmed === true ? "working" : "manual_gate",
        owner: "MealPilot",
      },
      {
        id: "lane_contract",
        label: lane ? `${lane.ctaLabel} maps to ${lane.method} ${lane.endpoint}` : "Known CTA lane is selected",
        status: lane?.status ?? "manual_gate",
        owner: lane?.status === "external_gate" ? "Swiggy" : lane?.status === "manual_gate" ? "Operator" : "MealPilot",
      },
      {
        id: "visible_feedback",
        label: lane?.expectedFeedback ?? "Visible feedback contract is unavailable",
        status: lane?.status ?? "manual_gate",
        owner: lane?.status === "external_gate" ? "Swiggy" : "MealPilot",
      },
      {
        id: "swiggy_gate_preserved",
        label: "Swiggy-owned form, Slack, credential, production, and commercial gates are not bypassed",
        status: decision === "swiggy_gate" ? "external_gate" : "working",
        owner: "Swiggy",
      },
    ],
    assertions: [
      "Interaction QA rehearsal generates route, browser-action, proof-link, and expected-feedback evidence without executing unsafe external actions.",
      "Commercial Swiggy actions still require explicit user confirmation and approved staging or production credentials.",
      "Official access form submission, Slack, partner manager, production credentials, and co-marketing remain operator or Swiggy gates.",
      "Every ready local CTA rehearsal includes automation coverage or a production verifier proof link before it is treated as working.",
    ],
    externalGates: [
      "Official Swiggy access form submission and production approval remain manual.",
      "Enterprise Slack, partner manager, production credentials, co-marketing, and live commercial actions require Swiggy approval.",
    ],
  };
}
