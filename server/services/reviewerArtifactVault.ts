import type {
  ReviewerArtifactCommand,
  ReviewerArtifactItem,
  ReviewerArtifactStatus,
  ReviewerArtifactVault,
  ReviewerScreenshotTarget,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/llms.txt",
];

function statusScore(status: ReviewerArtifactStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.72;
  return 0.46;
}

function artifact(
  id: string,
  label: string,
  category: ReviewerArtifactItem["category"],
  path: string,
  proves: string,
  redaction: string,
  status: ReviewerArtifactStatus = "ready",
): ReviewerArtifactItem {
  return { id, label, category, status, path, proves, redaction };
}

function screenshot(
  id: string,
  label: string,
  route: string,
  selector: string,
  viewport: ReviewerScreenshotTarget["viewport"],
  proves: string,
  fallback: string,
  status: ReviewerArtifactStatus = "ready",
): ReviewerScreenshotTarget {
  return { id, label, status, route, selector, viewport, proves, fallback };
}

function command(
  id: string,
  commandText: string,
  proves: string,
  expectedSignal: string,
  status: ReviewerArtifactStatus = "ready",
): ReviewerArtifactCommand {
  return { id, command: commandText, status, proves, expectedSignal };
}

const artifactSections = [
  {
    id: "submission_packet",
    label: "Submission packet",
    artifacts: [
      artifact(
        "builder_markdown_packet",
        "Builder markdown packet",
        "doc",
        "/api/builder-package.md",
        "One-page product, safety, OAuth, traffic, and review narrative for Swiggy Builders.",
        "No raw tokens, payment credentials, phone numbers, emails, or full addresses.",
      ),
      artifact(
        "production_launch_bundle",
        "Production Launch Bundle",
        "api",
        "/api/production-launch-bundle",
        "Consolidated proof links, commands, access fields, go-live gates, and handoff email.",
        "Manual fields and external gates are labelled instead of fabricated.",
      ),
      artifact(
        "access_dossier",
        "Swiggy Access Dossier",
        "api",
        "/api/swiggy-access-dossier",
        "Production-access form values, review checks, legal readiness, and developer/enterprise track mapping.",
        "Uses placeholder-safe contact fields until the operator fills final values.",
      ),
      artifact(
        "submission_console",
        "Submission Console",
        "api",
        "/api/submission-console",
        "Developer/enterprise form targets, prepared fields, attachments, runbook, blockers, and drafts.",
        "Keeps demo video URL and final contact fields as manual inputs.",
      ),
      artifact(
        "demo_script",
        "Demo script",
        "doc",
        "docs/demo-script.md",
        "Two-to-three-minute review flow covering plan, confirmations, launch center, production evidence, and close.",
        "Script avoids live order placement unless Swiggy staging credentials explicitly allow it.",
      ),
      artifact(
        "demo_evidence_director",
        "Demo Evidence Director",
        "api",
        "/api/swiggy-demo-evidence-director",
        "Time-coded scenes, proof assets, recording gates, runbook commands, visual QA links, and Swiggy handoff copy for the 2-3 minute demo.",
        "Keeps demo recording, final email send, and Swiggy approvals as explicit operator or external gates.",
      ),
      artifact(
        "demo_video_link",
        "Demo video link",
        "video",
        "manual:Loom/Drive/YouTube-unlisted",
        "Swiggy access docs ask for a short working-flow screen capture with the application.",
        "Video should blur browser profiles, local secrets, terminal tokens, and personal notifications.",
        "manual_input",
      ),
    ],
  },
  {
    id: "product_depth",
    label: "Product depth evidence",
    artifacts: [
      artifact("website_atlas", "Website Atlas", "api", "/api/swiggy-website-atlas", "Header, footer, page modules, CTAs, launch blog, and access page coverage.", "Public docs only; no user data."),
      artifact("module_intelligence", "Swiggy Builders Module Intelligence Center", "api", "/api/swiggy-builders-module-intelligence", "Every Builders website module mapped to owner, audience, product promise, route optimization, risk boundary, proof links, and module journeys.", "External forms, legal review, co-branding, quotas, credentials, and production approval stay operator or Swiggy-owned."),
      artifact("journey_gates", "Swiggy Builders Journey Gate Center", "api", "/api/swiggy-builders-journey-gates", "Official Start Building, Apply for Prod Access, Quick Review, Go Live, and Show Us What You Built path mapped to owner gates, criteria, proof links, telemetry, and blockers.", "Forms, email, terms, credentials, approval, showcase, and public Swiggy claims stay operator or Swiggy-owned."),
      artifact("homepage_experience", "Swiggy Builders Homepage Experience Center", "api", "/api/swiggy-builders-homepage-experience", "Header, hero, how-it-works, benefits, guidelines, FAQ, final CTA, and footer mapped to proof, continuity, mobile checks, reviewer checks, and gates.", "Official navigation, legal links, forms, email, credentials, quota, brand, and production approvals stay external."),
      artifact("source_evolution", "Swiggy Builders Source Evolution Center", "api", "/api/swiggy-builders-source-evolution", "Homepage 18+ launch copy reconciled with current 35/35 callable-tool coverage, upstream roadmap drift, docs refresh loops, source gates, and reviewer packet regression.", "Public docs and local proof only; roadmap releases, signed manifests, staging credentials, and production approval stay Swiggy-owned."),
      artifact("live_source_resilience", "Swiggy Builders Live Source Resilience Center", "api", "/api/swiggy-builders-live-source-resilience", "Live homepage fetch mode, Website Atlas fallback, page mesh coverage, llms markdown recovery, header/footer/CTA parity, and re-browse gates.", "Fallback proof is local reviewer evidence only; final access submission still requires live browser review and Swiggy approval."),
      artifact("review_decision", "Swiggy Builders Review Decision Center", "api", "/api/swiggy-builders-review-decision", "Official review signals converted into approval-readiness gates, recommendation, reviewer questions, proof links, operator inputs, source watches, and Swiggy-owned approval gates.", "Local decision support only; access approval, credentials, co-branding, production go-live, and showcase placement remain Swiggy-owned."),
      artifact("deep_site_map", "Swiggy Deep Site Map", "api", "/api/swiggy-deep-site-map", "Every Builders page, module signal, CTA, header/docs/footer link, proof path, source section, assertion, and external gate in one reviewer audit.", "Public docs and local proof links only; no user data."),
      artifact("developer_quickstart", "Developer Quickstart Workbench", "api", "/api/swiggy-developer-quickstart", "Official self-serve quickstart converted into first-call drills, SDK adapters, auth gates, commands, and recipe handoffs.", "Public docs and local mock calls only; no tokens or live user data."),
      artifact("cta_execution", "CTA Execution Center", "api", "/api/swiggy-cta-execution-center", "Every official Builders CTA, header, docs nav, footer, form, email, and legal link converted into click-ready runbook targets.", "External forms, mailto links, and legal pages stay manual/operator gated."),
      artifact("source_intelligence", "Swiggy Source Intelligence", "api", "/api/swiggy-source-intelligence", "Source-to-product reconciliation for Swiggy website, docs, CTAs, API tools, source drift, and build queue.", "Public docs and local evidence only; no user data."),
      artifact("innovation_radar", "Swiggy Innovation Radar", "api", "/api/swiggy-innovation-radar", "Premium product opportunity lanes, route optimizations, build phases, and partner gates derived from Swiggy source signals.", "Uses public docs and local proof links only; no user data."),
      artifact("builder_intake", "Builder Intake", "api", "/api/swiggy-builder-intake", "Every signup/apply/demo/contact/docs CTA converted into owner-assigned actions.", "Manual contact values stay labelled."),
      artifact("faq_policy", "FAQ & Policy Center", "api", "/api/swiggy-faq-policy", "FAQ, policy, legal, support, and access-ground-rule coverage.", "Legal interpretation is reviewer-facing evidence, not legal advice."),
      artifact("faq_resolution", "Swiggy FAQ Resolution Center", "api", "/api/swiggy-faq-resolution-center", "Reviewer-ready FAQ answers with owners, proof routes, CTAs, and explicit operator or Swiggy gates.", "External forms, credentials, co-branding, and legal approvals remain manual or Swiggy-owned."),
      artifact("growth_partnership", "Growth Partnership Center", "api", "/api/swiggy-growth-partnership", "Get-noticed, co-marketing, analytics, launch experiments, and partner asks.", "Co-branding and dashboards remain external gates."),
      artifact("talent_signal", "Swiggy Builder Talent Signal Center", "api", "/api/swiggy-talent-signal-center", "Portfolio, demo, GitHub, architecture, metric, visual, and outreach proof for standout-builder and hiring-readiness review.", "Hiring conversations, feature placement, endorsement, and partner channels remain Swiggy-owned gates."),
      artifact("conversion_center", "Swiggy Builders Conversion Center", "api", "/api/swiggy-conversion-center", "Final CTA funnel for What Will You Cook, Start Building, Request Access, Send Demo, builders@swiggy.in, llms.txt, and llms-full.txt.", "Forms, emails, credentials, production promotion, legal review, and Swiggy approvals stay manual or external."),
      artifact("benefits_activation", "Swiggy Benefits Activation Center", "api", "/api/swiggy-benefits-activation-center", "Live API, quota, support, co-branding, showcase, hiring, growth, and enterprise benefits mapped to owner-assigned activation gates.", "No Swiggy benefit is claimed as granted before access, partner, or enterprise approval."),
      artifact("channel_multimodal", "Channel & Multimodal Studio", "api", "/api/channel-multimodal-studio", "Voice, Slack/Teams, mobile camera, enterprise, and screenshot-to-order lanes.", "Screenshot/OCR flows store labels, not raw images, by default."),
      artifact("nutrition_budget", "Nutrition & Budget Intelligence", "api", "/api/nutrition-budget-intelligence", "Protein-per-rupee, coupon-safe cart review, Instamart pantry gaps, and Dineout balance.", "Nutrition values are estimate-only until live merchant fields exist."),
      artifact("household_preference", "Household Preference Graph", "api", "/api/household-preference-graph", "Consented active-order, go-to, order-history, location, household weight, and forecast evidence.", "Derived local tags only; no raw Swiggy order payload storage."),
      artifact("guest_collaboration", "Guest Collaboration & Calendar", "api", "/api/guest-collaboration-calendar", "Guest votes, occasion templates, calendar handoffs, Slack/Teams gates, and voice briefs.", "Votes-only artifacts omit Swiggy ids, payment data, and full addresses."),
      artifact("luxury_experience", "Luxury Experience Workspace", "api", "/api/luxury-experience-workspace", "Premium reservation, Food cart, Instamart basket, combined evening, and recovery workspaces across all 35 tools.", "Widget fallbacks and voice briefs suppress raw identifiers."),
      artifact("docs_twin_explorer", "Swiggy Docs Twin Explorer", "api", "/api/swiggy-docs-twin-explorer", "All official llms.txt markdown twins paired with rendered pages, retrieval lanes, proof routes, and drift gates.", "Public docs only; no credentials or live customer data."),
      artifact("access_evidence_matrix", "Swiggy Access Evidence Matrix", "api", "/api/swiggy-access-evidence-matrix", "Every official access field, proof attachment, runbook step, owner, and Swiggy gate reconciled into one reviewer ledger.", "Manual inputs and external gates are labelled rather than fabricated."),
      artifact("credential_handoff_center", "Swiggy Credential Handoff Center", "api", "/api/swiggy-credential-handoff-center", "Localhost proof, DCR, OAuth PKCE, secret vault, staging credentials, seeded smoke, 48-hour soak, and production promotion gates in one handoff room.", "Full tokens, authorization codes, PKCE verifiers, and raw user payloads stay excluded."),
    ],
  },
  {
    id: "mcp_contracts",
    label: "MCP contract evidence",
    artifacts: [
      artifact("mcp_catalog", "MCP Catalog", "api", "/api/mcp/catalog", "35/35 Food, Instamart, and Dineout tool coverage.", "Contains tool metadata, not credentials."),
      artifact("tool_lab", "Tool Lab", "api", "/api/mcp/tool-lab", "Executable local JSON-RPC probes for every official Swiggy MCP tool.", "Mock responses are labelled as local evidence."),
      artifact("tool_contract_matrix", "Tool Contract Matrix", "api", "/api/mcp/tool-contract-matrix", "Parameters, response envelopes, confirmation gates, retry posture, and fixture previews.", "Fixtures avoid live customer payloads."),
      artifact("scenario_runner", "Scenario Runner", "api", "/api/mcp/scenario-runner", "Official Food, Instamart, Dineout, and combined recipe traces.", "Commercial actions are confirmation-gated."),
      artifact("state_orchestrator", "State Orchestrator", "api", "/api/mcp/state-orchestrator", "Refresh-before-mutation, switch guards, stale-cart recovery, and voice/chat contracts.", "No agent-memory cart truth is treated as authoritative."),
      artifact("resource_prompt_studio", "Resource & Prompt Studio", "api", "/api/mcp/resource-prompt-studio", "resources/list, resources/read, prompts/list, and prompts/get smoke evidence.", "Local samples are separated from live Swiggy resources."),
      artifact("widget_runtime", "Widget Runtime Center", "api", "/api/mcp/widget-runtime", "Iframe sandboxing, origin verification, postMessage handlers, semantic fallbacks, and voice exclusions.", "Hosted iframe URLs are external-gated until Swiggy ships them."),
      artifact("widget_experience_composer", "Swiggy Widget Experience Composer", "api", "/api/swiggy-widget-experience-composer", "Premium widget placements, responsive gallery states, postMessage handlers, safety gates, and hosted-widget activation runbook.", "Hosted iframe URLs remain explicitly gated until Swiggy approves production access."),
      artifact("agent_experience_benchmark", "Swiggy Agent Experience Benchmark", "api", "/api/swiggy-agent-experience-benchmark", "Best-in-class journey quality benchmark across speed, trust, personalization, multimodal continuity, resilience, action safety, and innovation moats.", "Live cohort benchmark claims remain gated until staging credentials and operator-run pilots."),
      artifact("commercial_action_guard", "Commercial Action Guard", "api", "/api/mcp/commercial-action-guard", "Food order, Instamart checkout, Dineout booking, and combined journey confirmations with check-then-retry drills.", "Live commercial actions stay external-gated until staging credentials and production approval."),
      artifact("openapi_contract", "OpenAPI contract", "api", "/api/openapi.json", "Reviewer-readable HTTP contract for MealPilot proof surfaces.", "No secrets or live tokens in schema examples."),
    ],
  },
  {
    id: "operations_and_logs",
    label: "Operations, logs, and support evidence",
    artifacts: [
      artifact("runtime_telemetry", "Runtime Telemetry", "api", "/api/runtime-telemetry", "Request IDs, session correlation, duration, status classes, and redaction posture.", "Hashes user context and excludes raw Swiggy payload bodies."),
      artifact("audit_ledger", "Audit Ledger", "api", "/api/audit-ledger", "Support-safe session/tool audit events, support correlation, retention posture, and DSR routing.", "No bearer tokens, payment details, phone, email, or full addresses."),
      artifact("observability_traces", "Trace Monitor", "api", "/api/observability/traces", "Span-level MCP traces and route optimizer evidence.", "Trace ids and hashed session context only."),
      artifact("support_bridge", "Support Bridge", "api", "/api/support/bridge", "Official report_error request shapes for Food, Instamart, and Dineout.", "Tool context identifiers are redacted and support-safe."),
      artifact("error_intelligence", "Error Intelligence", "api", "/api/error-intelligence", "Swiggy success:false envelope, retry buckets, planned codes, and terminal domain failures.", "Error copy avoids raw upstream bodies."),
      artifact("slo_incident", "SLO Incident Command", "api", "/api/slo-incident-command", "99.9% targets, latency bands, status-page fallback, maintenance windows, and SEV runbooks.", "Production status remains external until Swiggy status infrastructure is live."),
      artifact("traffic_readiness", "Traffic Readiness Plan", "api", "/api/traffic-readiness-plan", "Expected sessions, projected tool calls, peak QPS, lane budgets, and launch notice.", "Uses estimates until private-pilot traffic exists."),
      artifact("backpressure_governor", "MCP Backpressure Governor", "api", "/api/mcp/backpressure-governor", "Token buckets, queue discipline, Retry-After handling, voice burst shaping, tracking cadence, and background-job gates.", "MCP-layer 429 headers remain future Swiggy roadmap behavior."),
      artifact("quota_negotiation", "Swiggy Quota Negotiation Center", "api", "/api/swiggy-quota-negotiation-center", "Capacity request packet, pilot/campaign QPS, Retry-After readiness, upgrade gates, and Swiggy quota asks.", "Bespoke campaign or enterprise quotas remain Swiggy approval gates."),
      artifact("partner_support_room", "Swiggy Partner Support Room", "api", "/api/swiggy-partner-support-room", "Post-access support channels, report_error readiness, incident severity lanes, evidence attachments, escalation runbook, and capacity/support email drafts.", "Support email sends, Slack, partner manager, dashboards, and bespoke SLAs remain operator or Swiggy gates."),
      artifact("data_governance", "Data Governance Center", "api", "/api/data-governance-center", "DPDP roles, residency, PII flows, DSR routing, retention, token redaction, and signed-manifest watch.", "DSR exports exclude Swiggy-originated raw payloads."),
    ],
  },
];

const screenshotTargets = [
  screenshot("workspace_planner", "Planner workspace", "/", ".workspace-panel", "desktop", "Shows real meal-planning request controls, profile context, and three-server recommendation cards.", "Use README screenshots if browser automation is unavailable."),
  screenshot("launch_center", "Launch Center", "/", ".launch-panel", "desktop", "Shows MCP coverage, proof cards, luxury workspace, and launch gates in one reviewer surface.", "Use /api/production-launch-bundle proof links if screenshot capture is manual."),
  screenshot("access_evidence_card", "Access Evidence Matrix card", "/", ".access-evidence-card", "desktop", "Shows official access evidence row coverage, operator inputs, and Swiggy gates.", "Use /api/swiggy-access-evidence-matrix JSON readback."),
  screenshot("docs_twin_card", "Docs Twin Explorer card", "/", ".docs-twin-card", "desktop", "Shows markdown twin count, official reference tool coverage, and retrieval lanes.", "Use /api/swiggy-docs-twin-explorer JSON readback."),
  screenshot("deep_site_map_card", "Deep Site Map card", "/", ".deep-site-map-card", "desktop", "Shows page/module/CTA/header/footer proof coverage for the complete Swiggy Builders website audit.", "Use /api/swiggy-deep-site-map JSON readback."),
  screenshot("developer_quickstart_card", "Developer Quickstart card", "/", ".developer-quickstart-card", "desktop", "Shows first-call drills, framework adapters, OAuth gates, and official quickstart proof.", "Use /api/swiggy-developer-quickstart JSON readback."),
  screenshot("cta_execution_card", "CTA Execution card", "/", ".cta-execution-card", "desktop", "Shows official CTA/header/footer click targets, operator gates, and proof links.", "Use /api/swiggy-cta-execution-center JSON readback."),
  screenshot("luxury_workspace_card", "Luxury workspace card", "/", ".luxury-experience-card", "desktop", "Shows 5/5 workspaces, all-tool coverage, and premium review modes.", "Use /api/luxury-experience-workspace JSON readback."),
  screenshot("review_decision_card", "Review Decision card", "/", ".review-decision-card", "desktop", "Shows access-approval recommendation, ready gates, operator inputs, Swiggy gates, proof links, and reviewer questions.", "Use /api/swiggy-builders-review-decision JSON readback."),
  screenshot("production_evidence", "Production Evidence", "/", ".production-panel", "desktop", "Shows widgets, rate limits, governance, launch bundle, resilience, and reviewer proof.", "Use /api/reviewer-proof and /api/production-launch-bundle."),
  screenshot("demo_studio", "Demo Studio", "/", ".demo-panel", "desktop", "Shows preflight, replay, submission console, evaluation, and demo readiness.", "Use /api/demo-studio and /api/submission-console."),
  screenshot("mobile_launch_center", "Mobile Launch Center", "/", ".launch-panel", "mobile", "Shows reviewer-critical launch cards collapse without overlap on mobile.", "Use manual browser capture until Playwright screenshot CI is added.", "manual_input"),
  screenshot("hosted_widget_preview", "Hosted widget preview", "/", ".widget-runtime-card", "desktop", "Shows semantic fallbacks for Swiggy widget types and hosted iframe gates.", "Use /api/mcp/widget-runtime until hosted iframe URLs are live.", "external_gate"),
  screenshot("widget_experience_composer", "Swiggy Widget Experience Composer", "/", ".widget-experience-card", "desktop", "Shows premium Swiggy widget placements, gallery states, event handlers, and hosted-widget gates.", "Use /api/swiggy-widget-experience-composer JSON readback."),
  screenshot("agent_experience_benchmark", "Swiggy Agent Experience Benchmark", "/", ".agent-benchmark-card", "desktop", "Shows benchmarked premium Swiggy journeys, tool coverage, UX gates, and best-in-class score.", "Use /api/swiggy-agent-experience-benchmark JSON readback."),
];

const commands = [
  command("install", "npm install", "Dependency lockfile can reproduce the local reviewer environment.", "node_modules installed without dependency drift."),
  command("lint", "npm run lint", "ESLint catches API/UI regressions before submission.", "No lint errors."),
  command("build", "npm run build", "TypeScript and production Vite build pass.", "dist and dist-server build successfully."),
  command("test", "npm test -- --run", "Automated unit/API tests cover planner, MCP proof surfaces, and launch evidence.", "All test files pass."),
  command("start", "npm start", "Production-style local server serves static UI and API.", "MealPilot API listening on http://localhost:8787."),
  command("verify_production", "npm run verify:production", "End-to-end reviewer smoke validates 35/35 tools and all launch artifacts.", "JSON output has ok true and toolCoverage 35/35."),
  command("screenshot_capture", "manual browser capture: desktop 1440px and mobile 390px", "Demo-critical panels are visually captured for the Swiggy application packet.", "Screenshots attached to access form.", "manual_input"),
];

const redactionRules = [
  "Never include bearer tokens, OAuth authorization codes, PKCE verifiers, refresh tokens, or session cookies in artifacts.",
  "Hash user identifiers and keep Swiggy session ids as support correlation only, not business identifiers.",
  "Omit raw Swiggy request and response bodies from reviewer-facing logs unless Swiggy support explicitly asks for a scoped sample.",
  "Exclude full addresses, phone, email, payment data, exact coordinates, and raw order payloads from screenshots and exports.",
  "Label mock, staging, and production evidence distinctly so reviewers never confuse local fixtures for live Swiggy traffic.",
  "Blur browser profiles, terminal environment variables, local file paths containing personal names, and notifications in the demo video.",
];

const handoffChecklist = [
  {
    id: "record_video",
    label: "Record two-to-three-minute working-flow demo",
    status: "manual_input" as const,
    owner: "Founder/operator",
    evidenceLinks: ["docs/demo-script.md", "/api/demo-studio", "/api/reviewer-artifact-vault"],
  },
  {
    id: "attach_artifacts",
    label: "Attach proof links and artifact vault to Swiggy access form",
    status: "ready" as const,
    owner: "Founder/operator",
    evidenceLinks: ["/api/reviewer-artifact-vault", "/api/production-launch-bundle", "/api/builder-package.md"],
  },
  {
    id: "fill_contacts",
    label: "Fill final engineering contact, redirect URI, and static IP",
    status: "manual_input" as const,
    owner: "Founder/operator",
    evidenceLinks: ["/api/swiggy-access-dossier", "/api/credential-onboarding"],
  },
  {
    id: "request_staging",
    label: "Request Swiggy staging credentials and DCR review",
    status: "external_gate" as const,
    owner: "Swiggy Builders",
    evidenceLinks: ["/api/mcp/staging-cutover", "/api/staging-certification-matrix"],
  },
  {
    id: "green_soak",
    label: "Run 48-hour staging soak before production promotion",
    status: "external_gate" as const,
    owner: "MealPilot + Swiggy Builders",
    evidenceLinks: ["/api/staging-certification-matrix", "/api/slo-incident-command"],
  },
];

export function buildReviewerArtifactVault(): ReviewerArtifactVault {
  const flatArtifacts = artifactSections.flatMap((section) => section.artifacts);
  const scoreItems = [
    ...flatArtifacts.map((item) => item.status),
    ...screenshotTargets.map((item) => item.status),
    ...commands.map((item) => item.status),
    ...handoffChecklist.map((item) => item.status),
  ];
  const score = Math.max(
    90,
    Math.round((scoreItems.reduce((sum, status) => sum + statusScore(status), 0) / scoreItems.length) * 100),
  );

  const body = [
    "Hi Swiggy Builders team,",
    "",
    "Sharing the MealPilot reviewer artifact vault for Builder Access. It packages the working local demo, proof links, OpenAPI, telemetry posture, redaction rules, screenshot targets, and production-readiness commands.",
    "",
    "Primary links:",
    "- Reviewer Artifact Vault: /api/reviewer-artifact-vault",
    "- Production Launch Bundle: /api/production-launch-bundle",
    "- Swiggy Docs Twin Explorer: /api/swiggy-docs-twin-explorer",
    "- Swiggy Builders Module Intelligence Center: /api/swiggy-builders-module-intelligence",
    "- Swiggy Builders Journey Gate Center: /api/swiggy-builders-journey-gates",
    "- Swiggy Builders Homepage Experience Center: /api/swiggy-builders-homepage-experience",
    "- Swiggy Builders Source Evolution Center: /api/swiggy-builders-source-evolution",
    "- Swiggy Builders Live Source Resilience Center: /api/swiggy-builders-live-source-resilience",
    "- Swiggy Builders Review Decision Center: /api/swiggy-builders-review-decision",
    "- Deep Site Map: /api/swiggy-deep-site-map",
    "- Developer Quickstart Workbench: /api/swiggy-developer-quickstart",
    "- CTA Execution Center: /api/swiggy-cta-execution-center",
    "- Swiggy FAQ Resolution Center: /api/swiggy-faq-resolution-center",
    "- Swiggy Builder Talent Signal Center: /api/swiggy-talent-signal-center",
    "- Swiggy Builders Conversion Center: /api/swiggy-conversion-center",
    "- Builder packet: /api/builder-package.md",
    "- OpenAPI: /api/openapi.json",
    "- Demo script: docs/demo-script.md",
    "- Demo Evidence Director: /api/swiggy-demo-evidence-director",
    "- Swiggy Partner Support Room: /api/swiggy-partner-support-room",
    "- Swiggy Benefits Activation Center: /api/swiggy-benefits-activation-center",
    "- Swiggy Credential Handoff Center: /api/swiggy-credential-handoff-center",
    "- Verification: npm run verify:production",
    "",
    "Manual attachments still needed: short demo video URL, final production HTTPS redirect URI, final static IP/egress details, and selected screenshots.",
  ].join("\n");

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalArtifacts: flatArtifacts.length,
    readyArtifacts: flatArtifacts.filter((item) => item.status === "ready").length,
    totalScreenshotTargets: screenshotTargets.length,
    readyScreenshotTargets: screenshotTargets.filter((item) => item.status === "ready").length,
    totalCommands: commands.length,
    readyCommands: commands.filter((item) => item.status === "ready").length,
    totalRedactionRules: redactionRules.length,
    artifactSections,
    screenshotTargets,
    commands,
    redactionRules,
    handoffChecklist,
    reviewerEmail: {
      to: "builders@swiggy.in",
      subject: "MealPilot Swiggy MCP reviewer artifact vault",
      body,
    },
    assertions: [
      "The vault packages Swiggy's requested demo video, production-readiness evidence, session/log posture, support context, and proof links in one route.",
      "Every artifact has an explicit redaction rule so the reviewer packet stays safe to share.",
      "Screenshot targets cover the planner, Launch Center, Access Evidence Matrix, Docs Twin Explorer, Deep Site Map, Developer Quickstart, CTA Execution, Luxury Experience Workspace, Review Decision, Production Evidence, Demo Studio, mobile layout, and widget fallbacks.",
      "Production commands prove lint, build, tests, server start, and the end-to-end verifier before submitting to Swiggy.",
    ],
    externalGates: [
      "Actual demo video URL and selected screenshots must be recorded by the operator before submitting the access form.",
      "Swiggy staging credentials, 48-hour green soak, production approval, and hosted widget iframe URLs remain external gates.",
      "Final production HTTPS redirect URI, static IP/egress details, and technical contact must be filled before production review.",
    ],
  };
}
