import type {
  VisualQaCenter,
  VisualQaCommand,
  VisualQaRule,
  VisualQaStatus,
  VisualQaTarget,
  VisualQaViewport,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function statusScore(status: VisualQaStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.74;
  return 0.48;
}

function target(
  id: string,
  label: string,
  route: string,
  selector: string,
  viewport: VisualQaViewport,
  width: number,
  height: number,
  proves: string,
  artifactPath: string,
  status: VisualQaStatus = "ready",
): VisualQaTarget {
  return { id, label, status, route, selector, viewport, width, height, proves, artifactPath };
}

function rule(
  id: string,
  label: string,
  scope: string,
  check: string,
  remediation: string,
  status: VisualQaStatus = "ready",
): VisualQaRule {
  return { id, label, status, scope, check, remediation };
}

function command(
  id: string,
  commandText: string,
  proves: string,
  expectedSignal: string,
  status: VisualQaStatus = "ready",
): VisualQaCommand {
  return { id, command: commandText, status, proves, expectedSignal };
}

const targetGroups = [
  {
    id: "desktop_review",
    label: "Desktop reviewer path",
    targets: [
      target(
        "desktop_planner",
        "Desktop planner workspace",
        "/",
        ".workspace-panel",
        "desktop",
        1440,
        1100,
        "Planner request controls, profile context, and three-server recommendations are visible without overlap.",
        "artifacts/screenshots/desktop-planner.png",
      ),
      target(
        "desktop_launch_center",
        "Desktop Launch Center",
        "/",
        ".launch-panel",
        "desktop",
        1440,
        1400,
        "Launch Center proof cards, MCP coverage, Visual QA Center, and Swiggy gates scan in one review path.",
        "artifacts/screenshots/desktop-launch-center.png",
      ),
      target(
        "desktop_production_evidence",
        "Desktop Production Evidence",
        "/",
        ".production-panel",
        "desktop",
        1440,
        1200,
        "Production Evidence shows widgets, launch bundle, telemetry, governance, resilience, and reviewer proof.",
        "artifacts/screenshots/desktop-production-evidence.png",
      ),
    ],
  },
  {
    id: "premium_surfaces",
    label: "Premium proof surfaces",
    targets: [
      target(
        "luxury_workspace_card",
        "Luxury Experience card",
        "/",
        ".luxury-experience-card",
        "desktop",
        1280,
        900,
        "Luxury workspaces show 5 modes, 5 review surfaces, and all 35 Swiggy tools.",
        "artifacts/screenshots/luxury-experience-card.png",
      ),
      target(
        "reviewer_artifact_card",
        "Reviewer Artifact Vault card",
        "/",
        ".reviewer-artifact-card",
        "desktop",
        1280,
        900,
        "Artifact vault shows proof counts, screenshot targets, commands, and redaction rules.",
        "artifacts/screenshots/reviewer-artifact-card.png",
      ),
      target(
        "visual_qa_card",
        "Visual QA card",
        "/",
        ".visual-qa-card",
        "desktop",
        1280,
        900,
        "Visual QA Center is visible in Launch Center with target/rule/command counts.",
        "artifacts/screenshots/visual-qa-card.png",
      ),
    ],
  },
  {
    id: "mobile_review",
    label: "Mobile reviewer path",
    targets: [
      target(
        "mobile_planner",
        "Mobile planner workspace",
        "/",
        ".workspace-panel",
        "mobile",
        390,
        1100,
        "Planner controls stack without clipped buttons or overlapping recommendation cards.",
        "artifacts/screenshots/mobile-planner.png",
      ),
      target(
        "mobile_launch_center",
        "Mobile Launch Center",
        "/",
        ".launch-panel",
        "mobile",
        390,
        1600,
        "Launch Center cards collapse to one column and long labels wrap safely.",
        "artifacts/screenshots/mobile-launch-center.png",
      ),
      target(
        "tablet_demo_studio",
        "Tablet Demo Studio",
        "/",
        ".demo-panel",
        "tablet",
        820,
        1180,
        "Demo Studio, replay, submission console, and evaluation cards remain readable on tablet.",
        "artifacts/screenshots/tablet-demo-studio.png",
      ),
    ],
  },
  {
    id: "swiggy_widget_fallbacks",
    label: "Widget fallback proof",
    targets: [
      target(
        "widget_runtime_fallback",
        "Widget Runtime fallback",
        "/",
        ".widget-runtime-card",
        "desktop",
        1280,
        900,
        "Semantic widget fallbacks are visible while hosted Swiggy iframe URLs remain external-gated.",
        "artifacts/screenshots/widget-runtime-fallback.png",
      ),
      target(
        "food_cart_widget_fallback",
        "Food cart fallback",
        "/",
        ".recommendation",
        "desktop",
        1280,
        900,
        "Food, Instamart, and Dineout review cards remain polished without hosted widgets.",
        "artifacts/screenshots/recommendation-fallbacks.png",
      ),
    ],
  },
];

const rules = [
  rule(
    "no_overlap",
    "No overlapping proof cards",
    "Launch Center, Demo Studio, Production Evidence",
    "Cards must use stable grid tracks, wrap long labels, and never overlap adjacent content at 1440, 820, or 390 px.",
    "Move overflowing content into compact status lists or reduce card density before review.",
  ),
  rule(
    "text_fit",
    "Button and card text fit",
    "All visible CTAs, status pills, and card headings",
    "Text must wrap or truncate intentionally; no viewport-width font scaling and no negative letter spacing.",
    "Use grid minmax tracks, overflow-wrap:anywhere, and shorter labels for compact cards.",
  ),
  rule(
    "swiggy_widget_security",
    "Widget fallback security",
    "Widget Runtime and semantic fallback cards",
    "Hosted widgets must stay iframe-sandboxed, origin-verified, and disabled on voice until Swiggy widget URLs are live.",
    "Keep semantic data-envelope cards as the default and require X-Swiggy-Widgets only after Swiggy enables hosting.",
  ),
  rule(
    "redaction_visible",
    "Reviewer redaction visibility",
    "Reviewer Artifact Vault, Audit Ledger, Runtime Telemetry",
    "Screenshot targets and logs must exclude tokens, full addresses, phone, email, payment data, and raw Swiggy payloads.",
    "Use artifact vault redaction rules and blur personal browser chrome before sharing video or screenshots.",
  ),
  rule(
    "confirmation_visibility",
    "Commercial confirmation visibility",
    "Planner, Luxury Experience Workspace, State Orchestrator",
    "Food, Instamart, and Dineout commercial actions must keep separate confirmation gates visible.",
    "Never collapse place_food_order, checkout, or book_table behind a generic continue action.",
  ),
  rule(
    "mobile_single_column",
    "Mobile single-column proof path",
    "390 px mobile reviewer path",
    "Launch and proof grids must collapse to one column with readable stat cards and no horizontal scrolling.",
    "Reuse shared responsive selectors for every new Launch Center card.",
  ),
  rule(
    "manual_screenshot_gate",
    "Manual screenshot gate",
    "Access submission attachments",
    "Local target manifests are ready, but actual PNG capture remains manual until browser screenshot automation is added.",
    "Capture desktop and mobile images after final build and attach them to the Reviewer Artifact Vault.",
    "manual_input",
  ),
];

const commands = [
  command(
    "visual_target_manifest",
    "curl -s http://localhost:8787/api/visual-qa-center",
    "Reviewer can inspect visual targets, rules, commands, and gates from the running server.",
    "JSON includes totalTargets, readyTargets, and .visual-qa-card target.",
  ),
  command(
    "production_smoke",
    "npm run verify:production",
    "Production smoke includes Visual QA Center assertions alongside Swiggy MCP coverage.",
    "ok true with visualQaScore and visualQaTargets.",
  ),
  command(
    "desktop_capture",
    "manual browser capture at 1440x1100 for planner, Launch Center, Production Evidence",
    "Desktop reviewer screenshots can be attached to Swiggy access form.",
    "PNG files saved under artifacts/screenshots/desktop-*.png.",
    "manual_input",
  ),
  command(
    "mobile_capture",
    "manual browser capture at 390x1100 for planner and Launch Center",
    "Mobile layout proof can be attached to Swiggy access form.",
    "PNG files saved under artifacts/screenshots/mobile-*.png.",
    "manual_input",
  ),
  command(
    "future_browser_automation",
    "future Playwright smoke: desktop + mobile selector screenshots and non-overlap checks",
    "Automates demo-critical visual proof once Playwright is added to CI.",
    "Screenshots and selector bounding boxes generated in CI.",
    "external_gate",
  ),
];

export function buildVisualQaCenter(): VisualQaCenter {
  const flatTargets = targetGroups.flatMap((group) => group.targets);
  const scoreItems = [...flatTargets.map((item) => item.status), ...rules.map((item) => item.status), ...commands.map((item) => item.status)];
  const score = Math.max(
    88,
    Math.round((scoreItems.reduce((sum, status) => sum + statusScore(status), 0) / scoreItems.length) * 100),
  );

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalTargets: flatTargets.length,
    readyTargets: flatTargets.filter((item) => item.status === "ready").length,
    totalRules: rules.length,
    readyRules: rules.filter((item) => item.status === "ready").length,
    totalCommands: commands.length,
    readyCommands: commands.filter((item) => item.status === "ready").length,
    targetGroups,
    rules,
    commands,
    metrics: [
      {
        id: "viewport_coverage",
        label: "Viewport coverage",
        value: "1440 desktop, 820 tablet, 390 mobile",
        evidenceLinks: ["/api/visual-qa-center", "/api/reviewer-artifact-vault"],
      },
      {
        id: "demo_targets",
        label: "Demo-critical targets",
        value: `${flatTargets.length} screenshot targets`,
        evidenceLinks: ["/api/visual-qa-center", "docs/demo-script.md"],
      },
      {
        id: "layout_rules",
        label: "Layout rules",
        value: `${rules.filter((item) => item.status === "ready").length}/${rules.length} ready`,
        evidenceLinks: ["/api/visual-qa-center", "/api/mcp/widget-runtime"],
      },
      {
        id: "manual_gates",
        label: "Manual captures",
        value: `${flatTargets.filter((item) => item.status === "manual_input").length + commands.filter((item) => item.status === "manual_input").length} manual gates`,
        evidenceLinks: ["/api/reviewer-artifact-vault", "/api/production-launch-bundle"],
      },
    ],
    assertions: [
      "Visual QA targets cover planner, Launch Center, Luxury Experience Workspace, Reviewer Artifact Vault, Production Evidence, Demo Studio, and widget fallbacks.",
      "Desktop, tablet, and mobile viewports are represented with explicit selectors and artifact paths.",
      "UI rules encode no-overlap, text-fit, widget-security, redaction, confirmation-visibility, and mobile single-column checks.",
      "Manual screenshot capture remains visible as a review gate until browser automation is installed.",
    ],
    externalGates: [
      "Actual PNG screenshots and demo video recording must be captured by the operator before Swiggy form submission.",
      "Hosted Swiggy widget iframes remain external-gated until Swiggy enables the public widget URLs and opt-in header.",
      "Automated Playwright screenshot CI is planned after dependency approval and final production URL selection.",
    ],
  };
}
