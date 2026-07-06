/* global console, fetch, process, URLSearchParams */

import fs from "node:fs";

const baseUrl = process.env.MEALPILOT_URL ?? "http://localhost:8787";
const ciWorkflow = fs.readFileSync(".github/workflows/ci.yml", "utf8");

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }
  return response.json();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const planRequest = {
  prompt: "Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, groceries, and Dineout.",
  city: "Bengaluru",
  budget: 2000,
  diet: "high-protein vegetarian",
  guests: 4,
  day: "saturday",
};

const health = await request("/api/health");
assert(health.ok, "health probe is not ok");

const ready = await request("/api/ready");
assert(ready.ok, "readiness probe is not ok");

const openApi = await request("/api/openapi.json");
assert(openApi.openapi === "3.1.0", "OpenAPI contract is missing");
assert(ciWorkflow.includes("npx playwright install --with-deps chromium"), "CI Playwright browser install is missing");
assert(ciWorkflow.includes("npm run verify:production"), "CI production smoke is missing");
assert(ciWorkflow.includes("npm run verify:visual"), "CI visual smoke is missing");
assert(ciWorkflow.includes("npm run export:builder-packet"), "CI builder packet export is missing");
assert(ciWorkflow.includes("actions/upload-artifact@v4"), "CI reviewer artifact upload is missing");
assert(
  openApi.paths["/api/data-governance-center"].get.summary.includes("Data Governance"),
  "OpenAPI data governance contract is missing",
);
assert(
  openApi.paths["/api/enterprise-delegated-auth"].get.summary.includes("Enterprise Delegated Auth"),
  "OpenAPI enterprise delegated-auth contract is missing",
);
assert(
  openApi.paths["/api/enterprise-platform-center"]?.get?.summary?.includes("Enterprise Platform") &&
    openApi.paths["/api/enterprise-platform-center"]?.get?.responses?.["200"]?.description?.includes("tenant boundaries"),
  "OpenAPI enterprise platform contract is missing",
);
assert(
  openApi.paths["/api/swiggy-builders-launch-story"]?.get?.summary?.includes("Launch Story") &&
    openApi.paths["/api/swiggy-builders-launch-story"]?.get?.responses?.["200"]?.description?.includes("35-tool"),
  "OpenAPI Builders Launch Story contract is missing",
);
assert(
  openApi.paths["/api/swiggy-operating-contract-center"]?.get?.summary?.includes("Operating Contract") &&
    openApi.paths["/api/swiggy-operating-contract-center"]?.get?.responses?.["200"]?.description?.includes("99.9%"),
  "OpenAPI operating contract center is missing",
);
assert(
  openApi.paths["/api/auth/swiggy/status"].get.summary.includes("OAuth callback"),
  "OpenAPI OAuth status contract is missing",
);
assert(
  openApi.paths["/api/swiggy-auth-lifecycle-center"]?.get?.summary?.includes("Auth Lifecycle") &&
    openApi.paths["/api/swiggy-auth-lifecycle-center"]?.get?.responses?.["200"]?.description?.includes("401/419"),
  "OpenAPI Auth Lifecycle Center contract is missing",
);
assert(
  openApi.paths["/api/swiggy-upstream-watch"].get.summary.includes("upstream docs"),
  "OpenAPI upstream watch contract is missing",
);
assert(
  openApi.paths["/api/swiggy-docs-twin-explorer"]?.get?.summary?.includes("docs twin"),
  "OpenAPI docs twin explorer contract is missing",
);
assert(
  openApi.paths["/api/swiggy-source-intelligence"]?.get?.summary?.includes("source intelligence"),
  "OpenAPI source intelligence contract is missing",
);
assert(
  openApi.paths["/api/swiggy-developer-quickstart"]?.get?.summary?.includes("developer quickstart"),
  "OpenAPI developer quickstart contract is missing",
);
assert(
  openApi.paths["/api/swiggy-cta-execution-center"]?.get?.summary?.includes("CTA execution"),
  "OpenAPI CTA execution contract is missing",
);
assert(
  openApi.paths["/api/swiggy-innovation-radar"]?.get?.summary?.includes("innovation radar"),
  "OpenAPI innovation radar contract is missing",
);
assert(
  openApi.paths["/api/swiggy-builder-intake"].get.summary.includes("Builder Intake"),
  "OpenAPI builder intake contract is missing",
);
assert(
  openApi.paths["/api/swiggy-faq-policy"].get.summary.includes("FAQ"),
  "OpenAPI FAQ and policy contract is missing",
);
assert(
  openApi.paths["/api/swiggy-growth-partnership"].get.summary.includes("Growth Partnership"),
  "OpenAPI growth partnership contract is missing",
);
assert(
  openApi.paths["/api/channel-multimodal-studio"].get.summary.includes("Channel and Multimodal"),
  "OpenAPI channel and multimodal studio contract is missing",
);
assert(
  openApi.paths["/api/swiggy-visual-dish-capture"].get.summary.includes("Visual Dish Capture") &&
    openApi.paths["/api/swiggy-visual-dish-capture/analyze"].post.summary.includes("visual dish"),
  "OpenAPI visual dish capture contract is missing",
);
assert(
  openApi.paths["/api/swiggy-voice-commerce-center"].get.summary.includes("Voice Commerce") &&
    openApi.paths["/api/swiggy-voice-commerce-center/rehearse"].post.summary.includes("spoken"),
  "OpenAPI voice commerce contract is missing",
);
assert(
  openApi.paths["/api/swiggy-quality-loop-center"].get.summary.includes("Quality Loop") &&
    openApi.paths["/api/swiggy-quality-loop-center/feedback"].post.summary.includes("feedback"),
  "OpenAPI quality loop contract is missing",
);
assert(
  openApi.paths["/api/nutrition-budget-intelligence"].get.summary.includes("Nutrition and Budget"),
  "OpenAPI nutrition and budget intelligence contract is missing",
);
assert(
  openApi.paths["/api/household-preference-graph"].get.summary.includes("Household Preference Graph"),
  "OpenAPI household preference graph contract is missing",
);
assert(
  openApi.paths["/api/guest-collaboration-calendar"].get.summary.includes("Guest Collaboration"),
  "OpenAPI guest collaboration calendar contract is missing",
);
assert(
  openApi.paths["/api/luxury-experience-workspace"].get.summary.includes("Luxury Experience Workspace"),
  "OpenAPI luxury experience workspace contract is missing",
);
assert(
  openApi.paths["/api/reviewer-artifact-vault"].get.summary.includes("Reviewer Artifact Vault"),
  "OpenAPI reviewer artifact vault contract is missing",
);
assert(
  openApi.paths["/api/visual-qa-center"].get.summary.includes("Visual QA Center"),
  "OpenAPI visual QA center contract is missing",
);
assert(
  openApi.paths["/api/premium-concierge-itinerary"].get.summary.includes("Premium concierge itinerary"),
  "OpenAPI premium concierge itinerary contract is missing",
);
assert(
  openApi.paths["/api/mcp/tool-contract-matrix"].get.summary.includes("tool contract matrix"),
  "OpenAPI tool contract matrix is missing",
);
assert(
  openApi.paths["/api/mcp/scenario-runner"].get.summary.includes("scenario runner"),
  "OpenAPI scenario runner is missing",
);
assert(
  openApi.paths["/api/mcp/state-orchestrator"].get.summary.includes("multi-turn cart state"),
  "OpenAPI state orchestrator is missing",
);
assert(
  openApi.paths["/api/mcp/widget-runtime"].get.summary.includes("widget iframe"),
  "OpenAPI widget runtime is missing",
);
assert(
  openApi.paths["/api/mcp/commercial-action-guard"].get.summary.includes("commercial action"),
  "OpenAPI commercial action guard is missing",
);
assert(
  openApi.paths["/api/mcp/backpressure-governor"].get.summary.includes("backpressure"),
  "OpenAPI backpressure governor is missing",
);
assert(
  openApi.paths["/api/swiggy-load-lab"].get.summary.includes("Load Lab"),
  "OpenAPI Swiggy Load Lab is missing",
);
assert(
  openApi.paths["/api/swiggy-offer-intelligence"].get.summary.includes("Offer Intelligence"),
  "OpenAPI Swiggy Offer Intelligence is missing",
);
assert(
  openApi.paths["/api/swiggy-order-lifecycle"].get.summary.includes("Order Lifecycle"),
  "OpenAPI Swiggy Order Lifecycle is missing",
);
assert(
  openApi.paths["/api/swiggy-location-trust"].get.summary.includes("Location Trust") &&
    openApi.paths["/api/swiggy-location-trust"].get.responses["200"].description.includes("address"),
  "OpenAPI Swiggy Location Trust is missing",
);
assert(
  openApi.paths["/api/swiggy-cart-mutation-workbench"].get.summary.includes("Cart Mutation") &&
    openApi.paths["/api/swiggy-cart-mutation-workbench"].get.responses["200"].description.includes("readback"),
  "OpenAPI Swiggy Cart Mutation Workbench is missing",
);
assert(
  openApi.paths["/api/swiggy-discovery-freshness"].get.summary.includes("Discovery Freshness") &&
    openApi.paths["/api/swiggy-discovery-freshness"].get.responses["200"].description.includes("variant"),
  "OpenAPI Swiggy Discovery Freshness is missing",
);
assert(
  openApi.paths["/api/swiggy-confirmation-command-center"]?.get?.summary?.includes("Confirmation Command") &&
    openApi.paths["/api/swiggy-confirmation-command-center"]?.get?.responses?.["200"]?.description?.includes(
      "separate confirmations",
    ),
  "OpenAPI Swiggy Confirmation Command Center is missing",
);
assert(
  openApi.paths["/api/swiggy-cancellation-care-center"]?.get?.summary?.includes("Cancellation") &&
    openApi.paths["/api/swiggy-cancellation-care-center"]?.get?.responses?.["200"]?.description?.includes(
      "report_error",
    ),
  "OpenAPI Swiggy Cancellation and Care Center is missing",
);
assert(
  openApi.paths["/api/swiggy-dineout-precision-center"]?.get?.summary?.includes("Dineout Precision") &&
    openApi.paths["/api/swiggy-dineout-precision-center"]?.get?.responses?.["200"]?.description?.includes(
      "bill-payment",
    ),
  "OpenAPI Swiggy Dineout Precision Center is missing",
);
assert(
  openApi.paths["/api/mcp/resource-prompt-studio"].get.summary.includes("Resource and Prompt Studio"),
  "OpenAPI resource and prompt studio is missing",
);
assert(
  openApi.paths["/api/mcp/staging-cutover"].get.summary.includes("staging cutover"),
  "OpenAPI staging cutover is missing",
);
assert(
  openApi.paths["/api/swiggy-staging-credential-drill"].get.summary.includes("Staging Credential Drill"),
  "OpenAPI Staging Credential Drill Center contract is missing",
);
assert(
  openApi.paths["/api/swiggy-live-signal-calibration"].get.summary.includes("Live Signal Calibration") &&
    openApi.paths["/api/swiggy-live-signal-calibration"].get.responses["200"].description.includes("privacy controls"),
  "OpenAPI Live Signal Calibration Center contract is missing",
);
assert(
  openApi.paths["/api/audit-ledger"].get.summary.includes("audit ledger"),
  "OpenAPI audit ledger is missing",
);
assert(
  openApi.paths["/api/submission-console"].get.summary.includes("submission console"),
  "OpenAPI submission console is missing",
);
assert(
  openApi.paths["/api/swiggy-access-evidence-matrix"].get.summary.includes("access evidence matrix"),
  "OpenAPI access evidence matrix is missing",
);

const storage = await request("/api/storage/status");
assert(storage.storage.planCount >= 0, "storage diagnostics are missing");

const created = await request("/api/plan", {
  method: "POST",
  body: JSON.stringify(planRequest),
});
const sessionId = created.plan.id;
assert(created.plan.recommendations.length === 3, "plan must include three Swiggy recommendations");

await request(`/api/sessions/${sessionId}`);
await request("/api/mcp/food", {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "verify-telemetry",
    method: "tools/call",
    params: { name: "get_addresses", arguments: {} },
  }),
});
const mcpResources = await request("/api/mcp/food", {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "verify-resources",
    method: "resources/list",
  }),
});
assert(mcpResources.result.resources.length >= 2, "MCP resources/list is incomplete");

const mcpResourceRead = await request("/api/mcp/food", {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "verify-resource-read",
    method: "resources/read",
    params: { uri: "swiggy://food/widgets" },
  }),
});
assert(mcpResourceRead.result.contents[0].text.includes("widget_registry"), "MCP resources/read widget payload is missing");

const mcpPrompts = await request("/api/mcp/dineout", {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "verify-prompts",
    method: "prompts/list",
  }),
});
assert(
  mcpPrompts.result.prompts.some((prompt) => prompt.name === "dineout_evening_planner"),
  "MCP prompts/list is missing Dineout planner prompt",
);

const mcpPrompt = await request("/api/mcp/dineout", {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "verify-prompt-get",
    method: "prompts/get",
    params: { name: "dineout_evening_planner", arguments: { guests: 4, date: "2026-07-11" } },
  }),
});
assert(mcpPrompt.result.messages.length >= 2, "MCP prompts/get messages are incomplete");

const catalog = await request("/api/mcp/catalog");
assert(catalog.totalTools === 35, "MCP catalog must include 35 tools");
assert(catalog.planned === 0, "MCP catalog should have no planned gaps");

const websiteAtlas = await request("/api/swiggy-website-atlas");
assert(websiteAtlas.atlas.score >= 90, "Swiggy website atlas score is below target");
assert(websiteAtlas.atlas.globalHeader.length >= 7, "Swiggy website global header coverage is incomplete");
assert(websiteAtlas.atlas.footerGroups.length >= 3, "Swiggy website footer coverage is incomplete");
assert(websiteAtlas.atlas.pagesCovered >= 8, "Swiggy website page coverage is incomplete");
assert(websiteAtlas.atlas.modulesCovered >= 38, "Swiggy website module coverage is incomplete");
assert(websiteAtlas.atlas.liveCrawlPages >= 6, "Swiggy website live crawl page coverage is incomplete");
assert(websiteAtlas.atlas.liveCrawlSignals >= 90, "Swiggy website live crawl signals are incomplete");
assert(websiteAtlas.atlas.ctas.some((cta) => cta.label === "Start Building"), "Start Building CTA coverage is missing");
assert(
  ["access", "blog_launch"].every((id) => websiteAtlas.atlas.pages.some((page) => page.id === id)),
  "Swiggy access page and launch blog atlas coverage are missing",
);
assert(
  ["home", "developers", "enterprises", "access", "docs_home", "blog_launch"].every((id) =>
    websiteAtlas.atlas.crawlEvidence.some((item) => item.pageId === id),
  ),
  "Swiggy rendered-page crawl evidence is incomplete",
);
assert(
  websiteAtlas.atlas.crawlEvidence.some(
    (item) =>
      item.pageId === "access" &&
      item.renderedLineCount >= 200 &&
      item.ctaSignals.includes("Apply as Developer") &&
      item.moduleSignals.includes("The Ground Rules") &&
      item.mealPilotEvidence.includes("/api/submission-console"),
  ),
  "Swiggy access page crawl evidence is incomplete",
);
assert(
  websiteAtlas.atlas.coverageAssertions.some((assertion) => assertion.includes("Rendered live-page crawl evidence")),
  "Swiggy website crawl assertion is missing",
);
assert(
  ["Apply as Developer", "Apply as Enterprise", "Read the docs", "Apply now"].every((label) =>
    websiteAtlas.atlas.ctas.some((cta) => cta.label === label),
  ),
  "Swiggy website application/blog CTAs are incomplete",
);

const launchStory = await request("/api/swiggy-builders-launch-story");
assert(launchStory.launchStory.score >= 94, "Builders Launch Story score is below target");
assert(
  launchStory.launchStory.launchSignal.blogToolSignal.includes("18+") &&
    launchStory.launchStory.launchSignal.currentDocsToolSnapshot.includes("35 tools") &&
    launchStory.launchStory.launchSignal.reconciliation.includes("current Swiggy docs"),
  "Builders Launch Story tool-count reconciliation is incomplete",
);
assert(
  launchStory.launchStory.totals.storyBeats === 5 &&
    launchStory.launchStory.totals.journeySteps === 5 &&
    launchStory.launchStory.totals.showcaseAssets === 4 &&
    launchStory.launchStory.totals.ecosystemLanes === 4 &&
    launchStory.launchStory.totals.ctaPaths === 3,
  "Builders Launch Story totals are incomplete",
);
assert(
  ["ai_commerce_infrastructure", "india_first_real_users", "builder_ecosystem", "video_to_access"].every((id) =>
    launchStory.launchStory.storyBeats.some((beat) => beat.id === id),
  ),
  "Builders Launch Story beats are incomplete",
);
assert(
  ["build_locally", "record_demo", "apply_for_access", "staging_review", "ship_and_showcase"].every((id) =>
    launchStory.launchStory.builderJourney.some((step) => step.id === id),
  ),
  "Builders Launch Story journey is incomplete",
);
assert(
  ["demo_script", "visual_gallery", "builder_packet", "ecosystem_narrative"].every((id) =>
    launchStory.launchStory.showcaseAssets.some((asset) => asset.id === id),
  ),
  "Builders Launch Story showcase assets are incomplete",
);
assert(
  ["read_docs", "apply_now", "contact_builders"].every((id) =>
    launchStory.launchStory.ctaPaths.some((cta) => cta.id === id),
  ) &&
    launchStory.launchStory.launchGuardrails.some((guard) => guard.id === "tool_count_reconciliation") &&
    launchStory.launchStory.externalGates.some((gate) => gate.includes("Showcase placement")),
  "Builders Launch Story CTA paths or guardrails are incomplete",
);

const operatingContract = await request("/api/swiggy-operating-contract-center");
assert(operatingContract.operatingContract.score >= 80, "operating contract score is below target");
assert(
  operatingContract.operatingContract.contractSignal.currentMode === "mock" &&
    operatingContract.operatingContract.contractSignal.operatingVersion === "v1.0" &&
    operatingContract.operatingContract.contractSignal.targetUptime === "99.9%" &&
    operatingContract.operatingContract.contractSignal.deprecationWindowDays === 180,
  "operating contract signal is incomplete",
);
assert(
  operatingContract.operatingContract.totals.pillars === 6 &&
    operatingContract.operatingContract.totals.runbooks === 4 &&
    operatingContract.operatingContract.totals.readinessGates === 5,
  "operating contract totals are incomplete",
);
assert(
  [
    "uptime_and_latency",
    "rate_limit_and_backpressure",
    "traffic_rollout",
    "support_and_reporting",
    "version_and_deprecation",
    "credential_and_mode_boundary",
  ].every((id) => operatingContract.operatingContract.pillars.some((pillar) => pillar.id === id)),
  "operating contract pillars are incomplete",
);
assert(
  ["s0_outage", "rate_limit_spike", "support_payload", "version_migration"].every((id) =>
    operatingContract.operatingContract.runbooks.some((runbook) => runbook.id === id),
  ),
  "operating contract runbooks are incomplete",
);
assert(
  ["local_contract_pack", "staging_credentials", "capacity_notice", "status_page_readiness", "production_approval"].every((id) =>
    operatingContract.operatingContract.readinessGates.some((gate) => gate.id === id),
  ) &&
    operatingContract.operatingContract.launchEmail.to === "builders@swiggy.in" &&
    operatingContract.operatingContract.externalGates.some((gate) => gate.includes("staging credentials")),
  "operating contract readiness gates or launch email are incomplete",
);

const builderIntake = await request("/api/swiggy-builder-intake");
assert(builderIntake.intake.score >= 75, "builder intake score is below target");
assert(builderIntake.intake.totalCtas === 11, "builder intake CTA coverage is incomplete");
assert(builderIntake.intake.readyCtas === 11, "builder intake ready CTA coverage is incomplete");
assert(builderIntake.intake.preparedCtas === 11, "builder intake prepared CTA coverage is incomplete");
assert(builderIntake.intake.operatorCtaGates >= 4, "builder intake operator CTA gates are incomplete");
assert(builderIntake.intake.swiggyCtaGates >= 2, "builder intake Swiggy CTA gates are incomplete");
assert(builderIntake.intake.totalFields >= 10, "builder intake submission fields are incomplete");
assert(builderIntake.intake.readyFields >= 5, "builder intake ready fields are incomplete");
assert(
  [
    "start_building",
    "see_whats_possible",
    "apply_prod_access",
    "apply_developer",
    "apply_enterprise",
    "enterprise_apply",
    "contact_us",
    "send_demo",
    "llms",
    "read_docs",
    "apply_now",
  ].every((id) =>
    builderIntake.intake.actions.some((action) => action.id === id),
  ),
  "builder intake must include every critical website CTA",
);
assert(
  builderIntake.intake.actions.some(
    (action) =>
      action.id === "apply_developer" &&
      action.actionType === "form" &&
      action.status === "ready" &&
      action.preparedLocally &&
      action.completionGate === "operator_submit" &&
      action.evidenceLinks.includes("/api/swiggy-access-dossier"),
  ),
  "builder intake developer application action is incomplete",
);
assert(
  ["redirect_uris", "static_ip_ranges", "security_contact", "terms_acknowledgement"].every((id) =>
    builderIntake.intake.submissionFields.some((field) => field.id === id),
  ),
  "builder intake application fields are incomplete",
);
assert(builderIntake.intake.demoStoryboard.length === 5, "builder intake demo storyboard is incomplete");
assert(
  builderIntake.intake.demoStoryboard.some((step) => step.proofLink === "/api/mcp/scenario-runner"),
  "builder intake scenario runner storyboard proof is missing",
);
assert(
  builderIntake.intake.outboundDrafts.some(
    (draft) => draft.triggerCta === "send_demo" && draft.body.includes("/api/swiggy-builder-intake"),
  ),
  "builder intake demo email draft is missing",
);
assert(
  builderIntake.intake.checklist.some(
    (item) => item.id === "live_credentials" && item.status === "external_gate" && item.owner === "Swiggy",
  ),
  "builder intake live credential gate is missing",
);

const faqPolicy = await request("/api/swiggy-faq-policy");
assert(faqPolicy.faqPolicy.score >= 90, "FAQ and policy score is below target");
assert(faqPolicy.faqPolicy.totalQuestions >= 16, "FAQ and policy question coverage is incomplete");
assert(faqPolicy.faqPolicy.readyQuestions >= 15, "FAQ and policy ready question coverage is incomplete");
assert(faqPolicy.faqPolicy.totalRules >= 9, "FAQ and policy rule coverage is incomplete");
assert(faqPolicy.faqPolicy.readyRules >= 8, "FAQ and policy ready rule coverage is incomplete");
assert(
  ["Developers", "Enterprises", "Docs", "Blog", "FAQ", "Start Building"].every((label) =>
    faqPolicy.faqPolicy.headerFooterCoverage.headerLinks.includes(label),
  ),
  "FAQ and policy header coverage is incomplete",
);
assert(
  ["Guidelines", "FAQ", "Apply", "llms.txt", "Privacy Policy", "Terms and Conditions", "builders@swiggy.in"].every((label) =>
    faqPolicy.faqPolicy.headerFooterCoverage.footerResources.includes(label),
  ),
  "FAQ and policy footer coverage is incomplete",
);
assert(
  ["developer_auth", "developer_sandbox", "enterprise_white_label", "home_break_something"].every((id) =>
    faqPolicy.faqPolicy.faqItems.some((item) => item.id === id),
  ),
  "FAQ and policy critical FAQ items are incomplete",
);
assert(
  ["allowed", "restricted", "prohibited", "operating_principle", "legal"].every((category) =>
    faqPolicy.faqPolicy.policyRules.some((rule) => rule.category === category),
  ),
  "FAQ and policy category coverage is incomplete",
);
assert(
  faqPolicy.faqPolicy.policyRules.some(
    (rule) => rule.id === "restricted_rate_limits" && rule.evidenceLinks.includes("/api/traffic-readiness-plan"),
  ),
  "FAQ and policy rate-limit control evidence is missing",
);
assert(faqPolicy.faqPolicy.supportContact.email === "builders@swiggy.in", "FAQ and policy support contact is missing");
assert(
  faqPolicy.faqPolicy.externalGates.some((gate) => gate.includes("Enterprise contracts")),
  "FAQ and policy enterprise contract gate is missing",
);

const growthPartnership = await request("/api/swiggy-growth-partnership");
assert(growthPartnership.growthPartnership.score >= 90, "growth partnership score is below target");
assert(growthPartnership.growthPartnership.totalSignals >= 14, "growth partnership signal coverage is incomplete");
assert(growthPartnership.growthPartnership.readySignals >= 12, "growth partnership ready signals are incomplete");
assert(growthPartnership.growthPartnership.totalExperiments >= 8, "growth partnership experiment coverage is incomplete");
assert(
  growthPartnership.growthPartnership.readyExperiments === growthPartnership.growthPartnership.totalExperiments,
  "growth partnership experiments must be locally ready",
);
assert(
  ["growth_partnership", "get_noticed", "enterprise_growth_analytics", "developer_hiring_signal"].every((id) =>
    growthPartnership.growthPartnership.signals.some((signal) => signal.id === id),
  ),
  "growth partnership official signals are incomplete",
);
assert(
  ["luxury_weekend_concierge", "voice_fridge_to_dinner", "office_lunch_boardroom", "embedded_enterprise_concierge", "city_trendboard"].every((id) =>
    growthPartnership.growthPartnership.experiments.some((experiment) => experiment.id === id),
  ),
  "growth partnership experiments are incomplete",
);
assert(
  growthPartnership.growthPartnership.experiments.some(
    (experiment) =>
      experiment.id === "luxury_weekend_concierge" &&
      ["food", "instamart", "dineout"].every((server) => experiment.mcpServers.includes(server)) &&
      experiment.requiredTools.includes("dineout.book_table"),
  ),
  "growth partnership cross-server experiment is missing",
);
assert(
  ["demo_storyboard", "co_branding_screenshots", "growth_metrics_pack", "launch_handoff_email"].every((id) =>
    growthPartnership.growthPartnership.assets.some((asset) => asset.id === id),
  ),
  "growth partnership proof assets are incomplete",
);
assert(
  ["co_marketing_review", "priority_slack_channel", "analytics_dashboard_access"].every((id) =>
    growthPartnership.growthPartnership.partnershipAsks.some((ask) => ask.id === id && ask.status === "external_gate"),
  ),
  "growth partnership external partner asks are incomplete",
);
assert(
  ["activation", "cross_server", "conversion_safety", "support"].every((id) =>
    growthPartnership.growthPartnership.metrics.some((metric) => metric.id === id),
  ),
  "growth partnership metrics are incomplete",
);
assert(
  growthPartnership.growthPartnership.externalGates.some((gate) => gate.includes("co-marketing")),
  "growth partnership co-marketing gate is missing",
);

const channelMultimodal = await request("/api/channel-multimodal-studio");
assert(channelMultimodal.channelMultimodalStudio.score >= 89, "channel and multimodal studio score is below target");
assert(channelMultimodal.channelMultimodalStudio.totalLanes === 6, "channel and multimodal lane coverage is incomplete");
assert(
  channelMultimodal.channelMultimodalStudio.readyLanes >= 4,
  "channel and multimodal ready lane coverage is incomplete",
);
assert(channelMultimodal.channelMultimodalStudio.totalChannels === 5, "channel integration coverage is incomplete");
assert(channelMultimodal.channelMultimodalStudio.totalPipelines === 4, "multimodal pipeline coverage is incomplete");
assert(channelMultimodal.channelMultimodalStudio.totalExecutionPackets === 6, "channel execution packet coverage is incomplete");
assert(channelMultimodal.channelMultimodalStudio.readyExecutionPackets === 6, "channel execution packets are not ready");
assert(
  ["voice_agent", "auto_restock", "group_ordering_slack_teams", "dietary_planner", "reservation_agent", "screenshot_to_order"].every(
    (id) => channelMultimodal.channelMultimodalStudio.lanes.some((lane) => lane.id === id),
  ),
  "channel and multimodal developer-page lanes are incomplete",
);
assert(
  channelMultimodal.channelMultimodalStudio.lanes.some(
    (lane) =>
      lane.id === "screenshot_to_order" &&
      lane.channels.includes("mobile_camera") &&
      lane.toolchain.includes("food.search_menu") &&
      lane.safetyControls.some((control) => control.includes("raw image")),
  ),
  "channel and multimodal screenshot-to-order lane is incomplete",
);
assert(
  channelMultimodal.channelMultimodalStudio.channels.some(
    (channel) =>
      channel.channel === "slack_teams" &&
      channel.status === "manual_input" &&
      channel.swiggyTools.includes("food.place_food_order"),
  ),
  "channel and multimodal Slack/Teams contract is incomplete",
);
assert(
  channelMultimodal.channelMultimodalStudio.pipelines.some(
    (pipeline) =>
      pipeline.id === "screenshot_to_order_pipeline" &&
      pipeline.steps.some((step) => step.tool === "search_menu") &&
      pipeline.dataBoundaries.some((boundary) => boundary.includes("raw image")),
  ),
  "channel and multimodal screenshot pipeline is incomplete",
);
assert(
  channelMultimodal.channelMultimodalStudio.executionPackets.some(
    (packet) =>
      packet.id === "voice_agent_packet" &&
      packet.laneId === "voice_agent" &&
      packet.surface === "voice" &&
      packet.routePlan.some((step) => step.includes("3")) &&
      packet.responseRules.some((rule) => rule.includes("Never speak")) &&
      packet.confirmationGate.includes("ETA") &&
      packet.telemetryContract.includes("surface=voice"),
  ),
  "channel and multimodal voice execution packet is incomplete",
);
assert(
  channelMultimodal.channelMultimodalStudio.executionPackets.some(
    (packet) =>
      packet.id === "screenshot_to_order_packet" &&
      packet.surface === "mobile_camera" &&
      packet.routePlan.some((step) => step.includes("approved vision/OCR")) &&
      packet.telemetryContract.includes("image_retained=false"),
  ),
  "channel and multimodal screenshot execution packet is incomplete",
);
assert(
  channelMultimodal.channelMultimodalStudio.externalGates.some((gate) => gate.includes("vision/OCR")),
  "channel and multimodal vision gate is missing",
);

const visualDishCapture = await request("/api/swiggy-visual-dish-capture");
assert(visualDishCapture.visualDishCapture.score >= 78, "visual dish capture score is below target");
assert(
  visualDishCapture.visualDishCapture.totals.routes === 4 &&
    visualDishCapture.visualDishCapture.totals.readyRoutes === 4 &&
    visualDishCapture.visualDishCapture.totals.guardrails === 5 &&
    visualDishCapture.visualDishCapture.totals.readyGuardrails === 3 &&
    visualDishCapture.visualDishCapture.totals.sampleCaptures === 3,
  "visual dish capture totals are incomplete",
);
assert(
  ["food_menu_match", "instamart_ingredient_rescue", "dineout_place_discovery", "combined_craving_to_evening"].every((id) =>
    visualDishCapture.visualDishCapture.routes.some((route) => route.id === id),
  ),
  "visual dish capture routes are incomplete",
);
assert(
  visualDishCapture.visualDishCapture.guardrails.some(
    (guard) => guard.id === "no_raw_image_retention" && guard.policy.includes("raw image bytes"),
  ),
  "visual dish capture raw-image guardrail is missing",
);
const visualDishAnalysis = await request("/api/swiggy-visual-dish-capture/analyze", {
  method: "POST",
  body: JSON.stringify({
    intent: "dish_photo",
    caption: "smoky paneer tikka with chutney",
    city: "Bengaluru",
    imageName: "paneer-tikka.jpg",
  }),
});
assert(visualDishAnalysis.analysis.input.rawImageRetained === false, "visual dish analysis retained raw image");
assert(
  visualDishAnalysis.analysis.detected.label === "paneer tikka" &&
    visualDishAnalysis.analysis.detected.requiresUserConfirmation &&
    visualDishAnalysis.analysis.selectedRouteId === "food_menu_match",
  "visual dish analysis label or route is wrong",
);
assert(
  visualDishAnalysis.analysis.swiggyRoutes.some((route) => route.swiggyTools.includes("search_menu")) &&
    visualDishAnalysis.analysis.telemetry.some((item) => item.field === "raw_image_retained" && item.value === "false"),
  "visual dish analysis route or telemetry is incomplete",
);

const voiceCommerce = await request("/api/swiggy-voice-commerce-center");
assert(voiceCommerce.voiceCommerce.score >= 80, "voice commerce score is below target");
assert(
  voiceCommerce.voiceCommerce.totals.scenarios === 4 &&
    voiceCommerce.voiceCommerce.totals.readyScenarios === 4 &&
    voiceCommerce.voiceCommerce.totals.guardrails === 6 &&
    voiceCommerce.voiceCommerce.totals.readyGuardrails === 4 &&
    voiceCommerce.voiceCommerce.totals.samples === 4,
  "voice commerce totals are incomplete",
);
assert(
  ["voice_food_quick_order", "voice_instamart_restock", "voice_dineout_booking", "voice_combined_evening"].every((id) =>
    voiceCommerce.voiceCommerce.scenarios.some((scenario) => scenario.id === id),
  ),
  "voice commerce scenarios are incomplete",
);
assert(
  voiceCommerce.voiceCommerce.guardrails.some(
    (guard) => guard.id === "no_raw_audio_retention" && guard.policy.includes("never raw audio"),
  ),
  "voice commerce no-audio-retention guardrail is missing",
);
const voiceRehearsal = await request("/api/swiggy-voice-commerce-center/rehearse", {
  method: "POST",
  body: JSON.stringify({
    utterance: "Order paneer tikka near home under 600 rupees",
    city: "Bengaluru",
  }),
});
assert(voiceRehearsal.rehearsal.input.rawAudioRetained === false, "voice rehearsal retained raw audio");
assert(
  voiceRehearsal.rehearsal.detected.intent === "quick_order" &&
    voiceRehearsal.rehearsal.detected.requiresUserConfirmation &&
    voiceRehearsal.rehearsal.selectedScenarioId === "voice_food_quick_order",
  "voice rehearsal intent or route is wrong",
);
assert(
  voiceRehearsal.rehearsal.spokenScript.length <= 3 &&
    voiceRehearsal.rehearsal.swiggyRoute.swiggyTools.includes("place_food_order") &&
    voiceRehearsal.rehearsal.telemetry.some((item) => item.field === "raw_audio_retained" && item.value === "false"),
  "voice rehearsal script, route, or telemetry is incomplete",
);

const qualityLoop = await request("/api/swiggy-quality-loop-center");
assert(qualityLoop.qualityLoop.score >= 84, "quality loop score is below target");
assert(
  qualityLoop.qualityLoop.totals.lanes === 4 &&
    qualityLoop.qualityLoop.totals.readyLanes === 4 &&
    qualityLoop.qualityLoop.totals.guardrails === 6 &&
    qualityLoop.qualityLoop.totals.readyGuardrails === 4 &&
    qualityLoop.qualityLoop.totals.samples === 4,
  "quality loop totals are incomplete",
);
assert(
  ["food_taste_repeat_loop", "instamart_freshness_loop", "dineout_experience_loop", "combined_household_learning_loop"].every((id) =>
    qualityLoop.qualityLoop.lanes.some((lane) => lane.id === id),
  ),
  "quality loop lanes are incomplete",
);
assert(
  qualityLoop.qualityLoop.guardrails.some(
    (guard) => guard.id === "consent_before_learning" && guard.policy.includes("requires user consent"),
  ),
  "quality loop consent guardrail is missing",
);
const qualityFeedback = await request("/api/swiggy-quality-loop-center/feedback", {
  method: "POST",
  body: JSON.stringify({
    server: "food",
    rating: 5,
    comment: "Loved the paneer tikka, repeat this restaurant",
    city: "Bengaluru",
    consentToLearn: true,
  }),
});
assert(
  qualityFeedback.analysis.sentiment === "delighted" &&
    qualityFeedback.analysis.selectedLaneId === "food_taste_repeat_loop" &&
    qualityFeedback.analysis.learningTags.includes("repeat_candidate"),
  "quality feedback learning route is wrong",
);
assert(
  qualityFeedback.analysis.supportPacketNeeded === false &&
    qualityFeedback.analysis.telemetry.some((item) => item.field === "raw_payload_retained" && item.value === "false"),
  "quality feedback telemetry is incomplete",
);
const qualityIssue = await request("/api/swiggy-quality-loop-center/feedback", {
  method: "POST",
  body: JSON.stringify({
    server: "instamart",
    rating: 2,
    comment: "Curd was stale and close to expiry",
    city: "Bengaluru",
    consentToLearn: false,
  }),
});
assert(
  qualityIssue.analysis.supportPacketNeeded &&
    qualityIssue.analysis.learningTags.length === 0 &&
    qualityIssue.analysis.selectedLaneId === "instamart_freshness_loop",
  "quality issue feedback did not preserve support/consent boundaries",
);

const nutritionBudget = await request("/api/nutrition-budget-intelligence");
assert(nutritionBudget.nutritionBudget.score >= 91, "nutrition and budget intelligence score is below target");
assert(nutritionBudget.nutritionBudget.totalTargets === 4, "nutrition and budget targets are incomplete");
assert(nutritionBudget.nutritionBudget.totalRoutes === 6, "nutrition and budget route coverage is incomplete");
assert(nutritionBudget.nutritionBudget.readyRoutes >= 5, "nutrition and budget ready routes are incomplete");
assert(nutritionBudget.nutritionBudget.totalRecommendations === 4, "nutrition and budget recommendations are incomplete");
assert(nutritionBudget.nutritionBudget.totalPlaybooks === 3, "nutrition and budget playbooks are incomplete");
assert(nutritionBudget.nutritionBudget.totalToolsCovered >= 25, "nutrition and budget Swiggy tool coverage is too narrow");
assert(
  ["protein_per_rupee", "budget_guardrail", "household_constraints", "fresh_cart_truth"].every((id) =>
    nutritionBudget.nutritionBudget.targets.some((target) => target.id === id),
  ),
  "nutrition and budget targets are missing",
);
assert(
  [
    "food_protein_lunch",
    "instamart_protein_gap",
    "group_budget_allocator",
    "dineout_evening_balance",
    "coupon_safe_macro_cart",
    "manual_label_macro_camera",
  ].every((id) => nutritionBudget.nutritionBudget.routes.some((route) => route.id === id)),
  "nutrition and budget optimizer routes are missing",
);
assert(
  nutritionBudget.nutritionBudget.routes.some(
    (route) =>
      route.id === "food_protein_lunch" &&
      route.toolchain.includes("food.fetch_food_coupons") &&
      route.toolchain.includes("food.place_food_order") &&
      route.confirmationGate.includes("place_food_order"),
  ),
  "nutrition and budget Food route is incomplete",
);
assert(
  nutritionBudget.nutritionBudget.routes.some(
    (route) =>
      route.id === "instamart_protein_gap" &&
      route.toolchain.includes("instamart.your_go_to_items") &&
      route.toolchain.includes("instamart.checkout") &&
      route.budgetRule.includes("Rs 99"),
  ),
  "nutrition and budget Instamart route is incomplete",
);
assert(
  nutritionBudget.nutritionBudget.routes.some(
    (route) =>
      route.id === "dineout_evening_balance" &&
      ["dineout", "food", "instamart"].every((server) => route.swiggyServers.includes(server)) &&
      route.toolchain.includes("dineout.book_table") &&
      route.dataBoundary.includes("lat/lng"),
  ),
  "nutrition and budget Dineout balance route is incomplete",
);
assert(
  nutritionBudget.nutritionBudget.recommendations.some(
    (item) =>
      item.id === "weekly_protein_restock" &&
      item.proteinPerRupee > 0.2 &&
      item.swiggyTools.includes("instamart.search_products"),
  ),
  "nutrition and budget protein restock recommendation is incomplete",
);
assert(
  nutritionBudget.nutritionBudget.playbooks.some(
    (playbook) =>
      playbook.id === "budget_rescue" &&
      playbook.steps.some((step) => step.tool === "apply_food_coupon") &&
      playbook.steps.some((step) => step.guardrail.includes("COD")),
  ),
  "nutrition and budget coupon playbook is incomplete",
);
assert(
  nutritionBudget.nutritionBudget.safetyControls.some((control) => control.includes("does not make medical claims")),
  "nutrition and budget medical-claim safety control is missing",
);
assert(
  nutritionBudget.nutritionBudget.externalGates.some((gate) => gate.includes("nutrition fields")) &&
    nutritionBudget.nutritionBudget.externalGates.some((gate) => gate.includes("vision/OCR")),
  "nutrition and budget external data gates are missing",
);

const householdPreference = await request("/api/household-preference-graph");
assert(householdPreference.householdPreference.score >= 92, "household preference graph score is below target");
assert(householdPreference.householdPreference.totalSignals === 5, "household preference signals are incomplete");
assert(householdPreference.householdPreference.readySignals >= 4, "household preference ready signals are incomplete");
assert(householdPreference.householdPreference.totalMembers === 4, "household preference member modes are incomplete");
assert(householdPreference.householdPreference.totalForecasts === 4, "household preference forecasts are incomplete");
assert(householdPreference.householdPreference.readyForecasts >= 3, "household preference ready forecasts are incomplete");
assert(householdPreference.householdPreference.totalAutomations === 4, "household preference automations are incomplete");
assert(householdPreference.householdPreference.readyAutomations >= 3, "household preference ready automations are incomplete");
assert(householdPreference.householdPreference.uniqueToolsCovered >= 22, "household preference tool coverage is too narrow");
assert(
  [
    "food_active_order_taste",
    "instamart_go_to_reorder",
    "dineout_location_occasion",
    "local_household_profile",
    "support_and_failure_memory",
  ].every((id) => householdPreference.householdPreference.signals.some((signal) => signal.id === id)),
  "household preference signals are missing",
);
assert(
  householdPreference.householdPreference.signals.some(
    (signal) =>
      signal.id === "instamart_go_to_reorder" &&
      signal.status === "ready" &&
      signal.swiggyTools.includes("instamart.your_go_to_items") &&
      signal.swiggyTools.includes("instamart.get_orders") &&
      signal.retentionRule.includes("raw order lines"),
  ),
  "household preference Instamart go-to signal is incomplete",
);
assert(
  householdPreference.householdPreference.signals.some(
    (signal) =>
      signal.id === "dineout_location_occasion" &&
      signal.swiggyTools.includes("dineout.get_saved_locations") &&
      signal.swiggyTools.includes("dineout.get_booking_status") &&
      signal.preferenceUse.includes("preferred dining areas"),
  ),
  "household preference Dineout signal is incomplete",
);
assert(
  householdPreference.householdPreference.forecasts.some(
    (forecast) =>
      forecast.id === "protein_staple_depletion" &&
      forecast.swiggyTools.includes("instamart.your_go_to_items") &&
      forecast.swiggyTools.includes("instamart.update_cart") &&
      forecast.dataBoundary.includes("raw order history"),
  ),
  "household preference pantry forecast is incomplete",
);
assert(
  householdPreference.householdPreference.automations.some(
    (automation) =>
      automation.id === "active_order_tracking_memory" &&
      automation.swiggyTools.includes("food.get_food_orders") &&
      automation.swiggyTools.includes("instamart.track_order") &&
      automation.guardrail.includes("Cancellation"),
  ),
  "household preference active-order automation is incomplete",
);
assert(
  householdPreference.householdPreference.privacyControls.some((control) => control.includes("model training")),
  "household preference privacy control is missing",
);
assert(
  householdPreference.householdPreference.externalGates.some((gate) => gate.includes("staging and production credentials")),
  "household preference live credential gate is missing",
);

const guestCollaboration = await request("/api/guest-collaboration-calendar");
assert(guestCollaboration.guestCollaboration.score >= 91, "guest collaboration score is below target");
assert(guestCollaboration.guestCollaboration.totalParticipants === 4, "guest collaboration participants are incomplete");
assert(guestCollaboration.guestCollaboration.totalVoteRounds === 4, "guest collaboration vote rounds are incomplete");
assert(guestCollaboration.guestCollaboration.readyVoteRounds >= 3, "guest collaboration ready vote rounds are incomplete");
assert(guestCollaboration.guestCollaboration.totalTemplates === 5, "guest collaboration templates are incomplete");
assert(guestCollaboration.guestCollaboration.readyTemplates >= 4, "guest collaboration ready templates are incomplete");
assert(guestCollaboration.guestCollaboration.totalCalendarArtifacts === 5, "guest collaboration calendar artifacts are incomplete");
assert(guestCollaboration.guestCollaboration.readyCalendarArtifacts >= 4, "guest collaboration ready handoffs are incomplete");
assert(guestCollaboration.guestCollaboration.uniqueToolsCovered >= 20, "guest collaboration Swiggy tool coverage is too narrow");
assert(
  ["date_night", "guests_at_home", "office_lunch", "weekday_reset", "recovery_meal"].every((id) =>
    guestCollaboration.guestCollaboration.templates.some((item) => item.id === id),
  ),
  "guest collaboration occasion templates are missing",
);
assert(
  guestCollaboration.guestCollaboration.templates.some(
    (item) =>
      item.id === "date_night" &&
      item.route.some((step) => step.tool === "book_table") &&
      item.route.some((step) => step.tool === "search_restaurants") &&
      item.reminderRule.includes("no scheduled delivery"),
  ),
  "guest collaboration date-night route is incomplete",
);
assert(
  guestCollaboration.guestCollaboration.voteRounds.some(
    (round) =>
      round.id === "slot_vote" &&
      round.channel === "calendar_ics" &&
      round.swiggyTools.includes("dineout.get_available_slots") &&
      round.decisionRule.includes("free reservation"),
  ),
  "guest collaboration Dineout slot vote is incomplete",
);
assert(
  guestCollaboration.guestCollaboration.calendarArtifacts.some(
    (artifact) =>
      artifact.id === "dessert_reminder" &&
      artifact.contentType === "ics" &&
      artifact.guardrail.includes("scheduled delivery"),
  ),
  "guest collaboration dessert reminder artifact is incomplete",
);
assert(
  guestCollaboration.guestCollaboration.safetyControls.some((control) => control.includes("separate user-visible confirmation")) &&
    guestCollaboration.guestCollaboration.safetyControls.some((control) => control.includes("Food delivery is immediate-only")),
  "guest collaboration safety controls are incomplete",
);
assert(
  guestCollaboration.guestCollaboration.externalGates.some((gate) => gate.includes("Slack/Teams")) &&
    guestCollaboration.guestCollaboration.externalGates.some((gate) => gate.includes("staging and production credentials")),
  "guest collaboration external gates are missing",
);

const luxuryExperience = await request("/api/luxury-experience-workspace");
assert(luxuryExperience.luxuryExperience.score >= 93, "luxury experience score is below target");
assert(luxuryExperience.luxuryExperience.totalModes === 5, "luxury experience modes are incomplete");
assert(luxuryExperience.luxuryExperience.readyModes === 5, "luxury experience ready modes are incomplete");
assert(luxuryExperience.luxuryExperience.totalWorkspaces === 5, "luxury experience workspaces are incomplete");
assert(luxuryExperience.luxuryExperience.readyWorkspaces === 5, "luxury experience ready workspaces are incomplete");
assert(luxuryExperience.luxuryExperience.totalArtifacts === 5, "luxury experience artifacts are incomplete");
assert(luxuryExperience.luxuryExperience.readyArtifacts >= 4, "luxury experience ready artifacts are incomplete");
assert(luxuryExperience.luxuryExperience.uniqueToolsCovered >= 35, "luxury experience must cover all Swiggy tools");
assert(
  ["lean", "premium", "family", "social", "training"].every((id) =>
    luxuryExperience.luxuryExperience.modes.some((item) => item.id === id),
  ),
  "luxury experience concierge modes are missing",
);
assert(
  luxuryExperience.luxuryExperience.workspaces.some(
    (item) =>
      item.id === "reservation_atelier" &&
      item.steps.some((step) => step.tool === "book_table") &&
      item.authoritativeReads.includes("dineout.get_booking_status") &&
      item.commercialGate.includes("party size"),
  ),
  "luxury experience reservation workspace is incomplete",
);
assert(
  luxuryExperience.luxuryExperience.workspaces.some(
    (item) =>
      item.id === "food_cart_salon" &&
      item.steps.some((step) => step.tool === "place_food_order") &&
      item.steps.some((step) => step.tool === "get_food_cart") &&
      item.commercialGate.includes("Rs 1000") &&
      item.widgetFallback.includes("cart-widget"),
  ),
  "luxury experience Food cart workspace is incomplete",
);
assert(
  luxuryExperience.luxuryExperience.workspaces.some(
    (item) =>
      item.id === "instamart_basket_atelier" &&
      item.steps.some((step) => step.tool === "checkout") &&
      item.steps.some((step) => step.tool === "your_go_to_items") &&
      item.commercialGate.includes("Rs 99") &&
      item.voiceContract.includes("your_go_to_items"),
  ),
  "luxury experience Instamart basket workspace is incomplete",
);
assert(
  luxuryExperience.luxuryExperience.artifacts.some(
    (artifact) =>
      artifact.id === "widget_gallery_fallback" &&
      artifact.status === "external_gate" &&
      artifact.guardrail.includes("hosted iframe"),
  ),
  "luxury experience widget fallback gate is missing",
);
assert(
  luxuryExperience.luxuryExperience.safetyControls.some((control) => control.includes("blind-retries")) &&
    luxuryExperience.luxuryExperience.safetyControls.some((control) => control.includes("raw Swiggy ids")),
  "luxury experience safety controls are incomplete",
);
assert(
  luxuryExperience.luxuryExperience.externalGates.some((gate) => gate.includes("staging and production credentials")) &&
    luxuryExperience.luxuryExperience.externalGates.some((gate) => gate.includes("hosted iframe")),
  "luxury experience external gates are missing",
);

const reviewerArtifactVault = await request("/api/reviewer-artifact-vault");
assert(reviewerArtifactVault.reviewerArtifactVault.score >= 90, "reviewer artifact vault score is below target");
assert(reviewerArtifactVault.reviewerArtifactVault.totalArtifacts >= 30, "reviewer artifact vault artifacts are incomplete");
assert(reviewerArtifactVault.reviewerArtifactVault.readyArtifacts >= 30, "reviewer artifact vault ready artifacts are incomplete");
assert(reviewerArtifactVault.reviewerArtifactVault.totalScreenshotTargets === 12, "reviewer artifact vault screenshot targets are incomplete");
assert(reviewerArtifactVault.reviewerArtifactVault.readyScreenshotTargets >= 5, "reviewer artifact vault ready screenshots are incomplete");
assert(reviewerArtifactVault.reviewerArtifactVault.totalCommands === 7, "reviewer artifact vault commands are incomplete");
assert(reviewerArtifactVault.reviewerArtifactVault.readyCommands >= 6, "reviewer artifact vault ready commands are incomplete");
assert(reviewerArtifactVault.reviewerArtifactVault.totalRedactionRules >= 6, "reviewer artifact vault redaction rules are incomplete");
assert(
  ["submission_packet", "product_depth", "mcp_contracts", "operations_and_logs"].every((id) =>
    reviewerArtifactVault.reviewerArtifactVault.artifactSections.some((section) => section.id === id),
  ),
  "reviewer artifact vault sections are missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.artifactSections.some((section) =>
    section.artifacts.some((artifact) => artifact.id === "openapi_contract" && artifact.path === "/api/openapi.json"),
  ),
  "reviewer artifact vault OpenAPI artifact is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.artifactSections.some((section) =>
    section.artifacts.some((artifact) => artifact.id === "luxury_experience" && artifact.path === "/api/luxury-experience-workspace"),
  ),
  "reviewer artifact vault luxury workspace artifact is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.artifactSections.some((section) =>
    section.artifacts.some(
      (artifact) =>
        artifact.id === "deep_site_map" &&
        artifact.label === "Swiggy Deep Site Map" &&
        artifact.path === "/api/swiggy-deep-site-map",
    ),
  ),
  "reviewer artifact vault deep site map artifact is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.artifactSections.some((section) =>
    section.artifacts.some(
      (artifact) =>
        artifact.id === "developer_quickstart" &&
        artifact.label === "Developer Quickstart Workbench" &&
        artifact.path === "/api/swiggy-developer-quickstart",
    ),
  ),
  "reviewer artifact vault developer quickstart artifact is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.artifactSections.some((section) =>
    section.artifacts.some(
      (artifact) =>
        artifact.id === "cta_execution" &&
        artifact.label === "CTA Execution Center" &&
        artifact.path === "/api/swiggy-cta-execution-center",
    ),
  ),
  "reviewer artifact vault CTA execution artifact is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.artifactSections.some((section) =>
    section.artifacts.some(
      (artifact) =>
        artifact.id === "docs_twin_explorer" &&
        artifact.label === "Swiggy Docs Twin Explorer" &&
        artifact.path === "/api/swiggy-docs-twin-explorer",
    ),
  ),
  "reviewer artifact vault docs twin explorer artifact is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.artifactSections.some((section) =>
    section.artifacts.some(
      (artifact) =>
        artifact.id === "access_evidence_matrix" &&
        artifact.label === "Swiggy Access Evidence Matrix" &&
        artifact.path === "/api/swiggy-access-evidence-matrix",
    ),
  ),
  "reviewer artifact vault access evidence matrix artifact is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.screenshotTargets.some(
    (target) =>
      target.id === "luxury_workspace_card" &&
      target.selector === ".luxury-experience-card" &&
      target.status === "ready",
  ),
  "reviewer artifact vault luxury screenshot target is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.screenshotTargets.some(
    (target) =>
      target.id === "developer_quickstart_card" &&
      target.selector === ".developer-quickstart-card" &&
      target.status === "ready",
  ),
  "reviewer artifact vault developer quickstart screenshot target is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.screenshotTargets.some(
    (target) =>
      target.id === "cta_execution_card" &&
      target.selector === ".cta-execution-card" &&
      target.status === "ready",
  ),
  "reviewer artifact vault CTA execution screenshot target is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.screenshotTargets.some(
    (target) =>
      target.id === "docs_twin_card" &&
      target.selector === ".docs-twin-card" &&
      target.status === "ready",
  ),
  "reviewer artifact vault docs twin screenshot target is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.screenshotTargets.some(
    (target) =>
      target.id === "access_evidence_card" &&
      target.selector === ".access-evidence-card" &&
      target.status === "ready",
  ),
  "reviewer artifact vault access evidence screenshot target is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.commands.some(
    (command) =>
      command.id === "verify_production" &&
      command.command.includes("npm run verify:production") &&
      command.expectedSignal.includes("35/35"),
  ),
  "reviewer artifact vault production verifier command is missing",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.redactionRules.some((rule) => rule.includes("bearer tokens")) &&
    reviewerArtifactVault.reviewerArtifactVault.handoffChecklist.some((item) => item.id === "record_video" && item.status === "manual_input"),
  "reviewer artifact vault redaction or demo-video handoff is incomplete",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.reviewerEmail.to === "builders@swiggy.in" &&
    reviewerArtifactVault.reviewerArtifactVault.reviewerEmail.body.includes("/api/reviewer-artifact-vault"),
  "reviewer artifact vault email draft is incomplete",
);
assert(
  reviewerArtifactVault.reviewerArtifactVault.externalGates.some((gate) => gate.includes("staging credentials")),
  "reviewer artifact vault external gates are missing",
);

const visualQa = await request("/api/visual-qa-center");
assert(visualQa.visualQa.score === 100, "visual QA score is below target");
assert(visualQa.visualQa.totalTargets === 31, "visual QA targets are incomplete");
assert(visualQa.visualQa.readyTargets === 31, "visual QA ready targets are incomplete");
assert(visualQa.visualQa.totalRules === 7, "visual QA rules are incomplete");
assert(visualQa.visualQa.readyRules === 7, "visual QA ready rules are incomplete");
assert(visualQa.visualQa.totalCommands === 5, "visual QA commands are incomplete");
assert(visualQa.visualQa.readyCommands === 5, "visual QA ready commands are incomplete");
assert(
  ["desktop_review", "premium_surfaces", "mobile_review", "swiggy_widget_fallbacks"].every((id) =>
    visualQa.visualQa.targetGroups.some((group) => group.id === id),
  ),
  "visual QA target groups are missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some(
      (target) =>
        target.id === "visual_qa_card" &&
        target.selector === ".visual-qa-card" &&
        target.viewport === "desktop",
    ),
  ),
  "visual QA card screenshot target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "mobile_launch_center" && target.width === 390 && target.viewport === "mobile"),
  ),
  "visual QA mobile launch target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some(
      (target) =>
        target.id === "innovation_radar_card" &&
        target.selector === ".innovation-radar-card" &&
        target.artifactPath.includes("artifacts/visual-qa"),
    ),
  ),
  "visual QA innovation radar target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "source_intelligence_card" && target.selector === ".source-intelligence-card"),
  ),
  "visual QA source intelligence target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "deep_site_map_card" && target.selector === ".deep-site-map-card"),
  ),
  "visual QA deep site map target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "builders_launch_story_card" && target.selector === ".builders-launch-story-card"),
  ),
  "visual QA Builders Launch Story target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "operating_contract_card" && target.selector === ".operating-contract-card"),
  ),
  "visual QA operating contract target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some(
      (target) => target.id === "staging_credential_drill_card" && target.selector === ".staging-credential-drill-card",
    ),
  ),
  "visual QA staging credential drill target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some(
      (target) => target.id === "live_signal_calibration_card" && target.selector === ".live-signal-calibration-card",
    ),
  ),
  "visual QA live signal calibration target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "visual_dish_capture_card" && target.selector === ".visual-dish-capture-card"),
  ),
  "visual QA visual dish capture target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "voice_commerce_card" && target.selector === ".voice-commerce-card"),
  ),
  "visual QA voice commerce target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "quality_loop_card" && target.selector === ".quality-loop-card"),
  ),
  "visual QA quality loop target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "developer_quickstart_card" && target.selector === ".developer-quickstart-card"),
  ),
  "visual QA developer quickstart target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "cta_execution_card" && target.selector === ".cta-execution-card"),
  ),
  "visual QA CTA execution target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "docs_twin_card" && target.selector === ".docs-twin-card"),
  ),
  "visual QA docs twin target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "access_evidence_card" && target.selector === ".access-evidence-card"),
  ),
  "visual QA access evidence matrix target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "coding_agent_card" && target.selector === ".coding-agent-card"),
  ),
  "visual QA coding agent governance target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "confirmation_command_card" && target.selector === ".confirmation-command-card"),
  ),
  "visual QA confirmation command target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "cancellation_care_card" && target.selector === ".cancellation-care-card"),
  ),
  "visual QA cancellation care target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "dineout_precision_card" && target.selector === ".dineout-precision-card"),
  ),
  "visual QA Dineout Precision target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "auth_lifecycle_card" && target.selector === ".auth-lifecycle-card"),
  ),
  "visual QA Auth Lifecycle target is missing",
);
assert(
  visualQa.visualQa.targetGroups.some((group) =>
    group.targets.some((target) => target.id === "enterprise_platform_card" && target.selector === ".enterprise-platform-card"),
  ),
  "visual QA enterprise platform target is missing",
);
assert(
  visualQa.visualQa.rules.some(
    (rule) =>
      rule.id === "no_overlap" &&
      rule.check.includes("1440") &&
      rule.check.includes("390"),
  ),
  "visual QA no-overlap rule is missing",
);
assert(
  visualQa.visualQa.rules.some(
    (rule) =>
      rule.id === "swiggy_widget_security" &&
      rule.check.includes("iframe-sandboxed") &&
      rule.check.includes("origin-verified"),
  ),
  "visual QA widget security rule is missing",
);
assert(
  visualQa.visualQa.commands.some(
    (command) =>
      command.id === "visual_target_manifest" &&
      command.command.includes("/api/visual-qa-center") &&
      command.expectedSignal.includes(".visual-qa-card"),
  ),
  "visual QA manifest command is missing",
);
assert(
  visualQa.visualQa.commands.some(
    (command) =>
      command.id === "visual_capture_harness" &&
      command.command === "npm run verify:visual" &&
      command.expectedSignal.includes("targetCount >= 31"),
  ),
  "visual QA Playwright command is missing",
);
assert(
  visualQa.visualQa.externalGates.some((gate) => gate.includes("Selected PNG screenshots")) &&
    visualQa.visualQa.assertions.some((assertion) => assertion.includes("Desktop, tablet, and mobile")),
  "visual QA external gate or assertion is missing",
);

const docsCoverage = await request("/api/swiggy-docs-coverage");
assert(docsCoverage.docsCoverage.score >= 95, "Swiggy docs coverage score is below target");
assert(docsCoverage.docsCoverage.totalPages === 69, "Swiggy docs coverage must include all llms.txt-linked pages");
assert(
  docsCoverage.docsCoverage.sections.some((section) => section.section === "reference" && section.total === 40),
  "Swiggy reference docs coverage is incomplete",
);
assert(
  docsCoverage.docsCoverage.pages.some((page) => page.id === "consumer_ai_client"),
  "Swiggy consumer AI-client docs coverage is missing",
);
assert(
  docsCoverage.docsCoverage.pages.some(
    (page) =>
      page.id === "delegated_auth" &&
      page.status === "implemented" &&
      page.evidenceLinks.includes("/api/enterprise-delegated-auth"),
  ),
  "Swiggy enterprise delegated-auth docs coverage is missing",
);
assert(
  docsCoverage.docsCoverage.pages.some(
    (page) =>
      page.id === "enterprise_index" &&
      page.status === "implemented" &&
      page.evidenceLinks.includes("/api/enterprise-platform-center"),
  ),
  "Swiggy enterprise platform docs coverage is missing",
);
assert(
  docsCoverage.docsCoverage.pages.some(
    (page) =>
      page.id === "launch_blog" &&
      page.status === "implemented" &&
      page.evidenceLinks.includes("/api/swiggy-builders-launch-story"),
  ),
  "Swiggy launch blog docs coverage is missing",
);

const docsTwinExplorer = await request("/api/swiggy-docs-twin-explorer");
assert(docsTwinExplorer.docsTwinExplorer.score >= 95, "Swiggy docs twin explorer score is below target");
assert(docsTwinExplorer.docsTwinExplorer.totals.pages === 69, "Swiggy docs twin explorer page coverage is incomplete");
assert(docsTwinExplorer.docsTwinExplorer.totals.markdownTwins === 69, "Swiggy docs twin markdown coverage is incomplete");
assert(docsTwinExplorer.docsTwinExplorer.totals.renderedPages === 69, "Swiggy docs twin rendered page coverage is incomplete");
assert(docsTwinExplorer.docsTwinExplorer.totals.referenceTools === 35, "Swiggy docs twin reference tool coverage is incomplete");
assert(docsTwinExplorer.docsTwinExplorer.totals.sections === 5, "Swiggy docs twin section coverage is incomplete");
assert(
  ["start", "build", "operate", "reference", "blog"].every((id) =>
    docsTwinExplorer.docsTwinExplorer.groups.some((group) => group.id === id),
  ),
  "Swiggy docs twin groups are incomplete",
);
assert(
  docsTwinExplorer.docsTwinExplorer.rows.some(
    (row) =>
      row.id === "developer_quickstart" &&
      row.markdownUrl.endsWith("/docs/start/developer/index.md") &&
      row.renderedUrl.endsWith("/docs/start/developer/") &&
      row.retrievalMode === "markdown_twin" &&
      row.evidenceLinks.includes("/api/swiggy-developer-quickstart"),
  ),
  "Swiggy docs twin developer quickstart row is missing",
);
assert(
  docsTwinExplorer.docsTwinExplorer.rows.some(
    (row) =>
      row.id === "reference_food_place_food_order" &&
      row.section === "reference" &&
      row.markdownUrl.endsWith("/docs/reference/food/place_food_order.md"),
  ),
  "Swiggy docs twin place_food_order reference row is missing",
);
assert(
  docsTwinExplorer.docsTwinExplorer.retrievalLanes.some(
    (lane) =>
      lane.id === "proof_readback" &&
      lane.command.includes("/api/swiggy-docs-twin-explorer") &&
      lane.expectedSignal.includes("totals.pages === 69"),
  ),
  "Swiggy docs twin proof readback lane is missing",
);
assert(
  docsTwinExplorer.docsTwinExplorer.assertions.some((assertion) => assertion.includes("markdown twin URL")) &&
    docsTwinExplorer.docsTwinExplorer.externalGates.some((gate) => gate.includes("re-browse llms.txt")),
  "Swiggy docs twin assertions or external gates are missing",
);

const upstreamWatch = await request("/api/swiggy-upstream-watch");
assert(upstreamWatch.upstreamWatch.score >= 90, "Swiggy upstream watch score is below target");
assert(
  upstreamWatch.upstreamWatch.docsContract.llmsIndex === "https://mcp.swiggy.com/builders/llms.txt" &&
    upstreamWatch.upstreamWatch.docsContract.llmsFull === "https://mcp.swiggy.com/builders/llms-full.txt",
  "Swiggy upstream watch docs retrieval contract is incomplete",
);
assert(
  upstreamWatch.upstreamWatch.docsContract.smokeTest.includes("Food exposes 14 tools"),
  "Swiggy upstream watch smoke test is missing",
);
assert(
  upstreamWatch.upstreamWatch.releaseTimeline.some(
    (release) =>
      release.id === "v1_0_launch" &&
      release.shipped.some((item) => item.includes("Food MCP server")) &&
      release.knownLimitations.some((item) => item.includes("No refresh-token issuance")),
  ),
  "Swiggy upstream watch v1.0 launch/limitations are incomplete",
);
assert(
  [
    "refresh_tokens",
    "status_page",
    "rate_limit_headers",
    "symbolic_error_codes",
    "deprecation_meta",
    "hosted_food_widgets",
    "dcr",
    "instamart_dineout_widgets",
    "url_major_versioning",
    "food_online_payment",
  ].every((id) => upstreamWatch.upstreamWatch.roadmapItems.some((item) => item.id === id)),
  "Swiggy upstream watch roadmap is incomplete",
);
assert(
  upstreamWatch.upstreamWatch.signedManifestWatch.status === "external_gate" &&
    upstreamWatch.upstreamWatch.signedManifestWatch.targetVersion.includes("v"),
  "Swiggy upstream watch signed-manifest gate is missing",
);
assert(
  upstreamWatch.upstreamWatch.actionQueue.some((action) => action.id === "weekly_llms_refresh") &&
    upstreamWatch.upstreamWatch.actionQueue.some((action) => action.id === "new_tool_reference"),
  "Swiggy upstream watch action queue is incomplete",
);

const sourceIntelligence = await request("/api/swiggy-source-intelligence");
assert(sourceIntelligence.sourceIntelligence.score >= 92, "Swiggy source intelligence score is below target");
assert(sourceIntelligence.sourceIntelligence.inventory.llmsLinkedPages === 69, "source intelligence llms inventory is incomplete");
assert(sourceIntelligence.sourceIntelligence.inventory.toolReferenceTools === 35, "source intelligence tool reference count is incomplete");
assert(sourceIntelligence.sourceIntelligence.inventory.ctas >= 11, "source intelligence CTA inventory is incomplete");
assert(
  [
    ["food", 14],
    ["instamart", 13],
    ["dineout", 8],
  ].every(([server, tools]) =>
    sourceIntelligence.sourceIntelligence.serverInventory.some((item) => item.server === server && item.tools === tools),
  ),
  "source intelligence server inventory is incomplete",
);
assert(
  ["marketing_site", "start_tracks", "build_recipes", "reference_tools", "operate_contract", "source_refresh_loop"].every(
    (id) => sourceIntelligence.sourceIntelligence.clusters.some((cluster) => cluster.id === id),
  ),
  "source intelligence coverage clusters are incomplete",
);
assert(
  sourceIntelligence.sourceIntelligence.driftSignals.some(
    (signal) =>
      signal.id === "homepage_tool_count_language" &&
      signal.severity === "info" &&
      signal.mealPilotInterpretation.includes("35-tool contract"),
  ),
  "source intelligence homepage tool-count drift signal is missing",
);
assert(
  sourceIntelligence.sourceIntelligence.driftSignals.some(
    (signal) => signal.id === "live_credential_gate" && signal.severity === "blocking",
  ),
  "source intelligence live credential gate signal is missing",
);
assert(
  sourceIntelligence.sourceIntelligence.buildQueue.some(
    (item) =>
      item.id === "staging_credential_replay" &&
      item.status === "external_gate" &&
      item.evidenceLinks.includes("/api/mcp/staging-cutover"),
  ),
  "source intelligence staging replay queue is missing",
);

const deepSiteMap = await request("/api/swiggy-deep-site-map");
assert(deepSiteMap.deepSiteMap.score >= 90, "Swiggy deep site map score is below target");
assert(deepSiteMap.deepSiteMap.totals.pages >= 8, "deep site map page coverage is incomplete");
assert(deepSiteMap.deepSiteMap.totals.modules >= 38, "deep site map module coverage is incomplete");
assert(deepSiteMap.deepSiteMap.totals.ctas >= 11, "deep site map CTA coverage is incomplete");
assert(deepSiteMap.deepSiteMap.totals.headerLinks >= 12, "deep site map header coverage is incomplete");
assert(deepSiteMap.deepSiteMap.totals.footerLinks >= 6, "deep site map footer coverage is incomplete");
assert(deepSiteMap.deepSiteMap.totals.proofLinks >= 20, "deep site map proof-link coverage is incomplete");
assert(
  ["home", "developers", "enterprises", "access", "docs_home", "blog_launch"].every((id) =>
    deepSiteMap.deepSiteMap.pages.some((page) => page.id === id),
  ),
  "deep site map critical pages are incomplete",
);
assert(
  deepSiteMap.deepSiteMap.pages.some(
    (page) =>
      page.id === "access" &&
      page.ctaSignals.includes("Apply as Developer") &&
      page.moduleSignals.includes("The Ground Rules") &&
      page.proofLinks.includes("/api/submission-console"),
  ),
  "deep site map access-page proof row is incomplete",
);
assert(
  deepSiteMap.deepSiteMap.ctas.some(
    (cta) =>
      cta.id === "apply_developer" &&
      cta.completionGate === "operator_submit" &&
      cta.status === "documented" &&
      cta.evidenceLinks.includes("/api/swiggy-access-dossier"),
  ),
  "deep site map developer-apply CTA gate is incomplete",
);
assert(
  deepSiteMap.deepSiteMap.headerFooterMatrix.some((item) => item.label === "Start Building") &&
    deepSiteMap.deepSiteMap.headerFooterMatrix.some((item) => item.label === "Privacy Policy"),
  "deep site map header/footer matrix is incomplete",
);
assert(
  ["site_pages", "header_footer", "cta_paths", "source_reconciliation"].every((id) =>
    deepSiteMap.deepSiteMap.sections.some((section) => section.id === id),
  ),
  "deep site map sections are incomplete",
);
assert(
  deepSiteMap.deepSiteMap.assertions.some((assertion) => assertion.includes("Every public Builders page")) &&
    deepSiteMap.deepSiteMap.externalGates.some((gate) => gate.includes("Google Forms")),
  "deep site map assertions or external gates are incomplete",
);

const developerQuickstart = await request("/api/swiggy-developer-quickstart");
assert(developerQuickstart.quickstartWorkbench.score >= 85, "developer quickstart score is below target");
assert(developerQuickstart.quickstartWorkbench.totals.steps === 6, "developer quickstart step coverage is incomplete");
assert(developerQuickstart.quickstartWorkbench.totals.frameworks >= 5, "developer quickstart framework coverage is incomplete");
assert(developerQuickstart.quickstartWorkbench.totals.firstCallDrills === 4, "developer quickstart first-call drills are incomplete");
assert(developerQuickstart.quickstartWorkbench.totals.recipeHandoffs === 4, "developer quickstart recipe handoffs are incomplete");
assert(developerQuickstart.quickstartWorkbench.totals.authGates === 5, "developer quickstart auth gates are incomplete");
assert(
  ["developer_quickstart", "build_an_agent", "authenticate", "llms_index"].every((id) =>
    developerQuickstart.quickstartWorkbench.officialSources.some((source) => source.id === id),
  ),
  "developer quickstart official sources are incomplete",
);
assert(
  developerQuickstart.quickstartWorkbench.firstCallDrills.some(
    (drill) =>
      drill.id === "food_get_addresses" &&
      drill.server === "food" &&
      drill.tool === "get_addresses" &&
      drill.jsonRpc.method === "tools/call" &&
      drill.jsonRpc.params.name === "get_addresses",
  ),
  "developer quickstart get_addresses first-call drill is missing",
);
assert(
  developerQuickstart.quickstartWorkbench.frameworkAdapters.some(
    (adapter) =>
      adapter.id === "openai_agents_js" &&
      adapter.authMode === "native_auth_provider" &&
      adapter.serverUrls.includes("https://mcp.swiggy.com/im"),
  ),
  "developer quickstart OpenAI Agents JS adapter is missing",
);
assert(
  developerQuickstart.quickstartWorkbench.recipeHandoffs.some(
    (handoff) =>
      handoff.id === "combined_evening" &&
      handoff.confirmationGates.includes("book_table") &&
      handoff.evidenceLinks.includes("/api/swiggy-route-optimizer"),
  ),
  "developer quickstart combined route handoff is missing",
);
assert(
  developerQuickstart.quickstartWorkbench.authGates.some((gate) => gate.id === "staging" && gate.status === "external_gate"),
  "developer quickstart staging auth gate is missing",
);

const ctaExecution = await request("/api/swiggy-cta-execution-center");
assert(ctaExecution.ctaExecution.score >= 85, "CTA execution score is below target");
assert(ctaExecution.ctaExecution.totals.targets >= 28, "CTA execution target coverage is incomplete");
assert(ctaExecution.ctaExecution.totals.ctas === 11, "CTA execution official CTA count is incomplete");
assert(ctaExecution.ctaExecution.totals.headerLinks >= 7, "CTA execution header link count is incomplete");
assert(ctaExecution.ctaExecution.totals.docsLinks >= 5, "CTA execution docs link count is incomplete");
assert(ctaExecution.ctaExecution.totals.footerLinks >= 6, "CTA execution footer link count is incomplete");
assert(ctaExecution.ctaExecution.totals.operatorActions > 0, "CTA execution operator actions are missing");
assert(ctaExecution.ctaExecution.totals.externalGates > 0, "CTA execution external gates are missing");
assert(
  ["cta_paths", "global_header", "docs_subnav", "footer_links"].every((id) =>
    ctaExecution.ctaExecution.groups.some((group) => group.id === id),
  ),
  "CTA execution groups are incomplete",
);
assert(
  ctaExecution.ctaExecution.targets.some(
    (target) =>
      target.id === "cta_start_building" &&
      target.label === "Start Building" &&
      target.kind === "docs" &&
      target.status === "ready" &&
      target.proofLinks.includes("/api/mcp/tool-lab") &&
      target.keyboardPath.includes("Confirm Start Building loads"),
  ),
  "CTA execution Start Building target is missing",
);
assert(
  ctaExecution.ctaExecution.targets.some(
    (target) =>
      target.id === "cta_apply_developer" &&
      target.kind === "form" &&
      target.completionGate === "operator_submit" &&
      target.status === "operator_action" &&
      target.browserAction.includes("official Swiggy access form"),
  ),
  "CTA execution developer form gate is missing",
);
assert(
  ctaExecution.ctaExecution.targets.some(
    (target) =>
      target.id === "cta_contact_us" &&
      target.kind === "email" &&
      target.officialUrl === "mailto:builders@swiggy.in" &&
      target.status === "operator_action",
  ),
  "CTA execution contact email gate is missing",
);
assert(
  ctaExecution.ctaExecution.targets.some((target) => target.label === "Privacy Policy" && target.kind === "legal"),
  "CTA execution legal footer target is missing",
);
assert(
  ctaExecution.ctaExecution.commands.some(
    (command) => command.id === "production_gate" && command.expectedSignal.includes("ctaExecutionScore"),
  ),
  "CTA execution production verifier command is missing",
);
assert(
  ctaExecution.ctaExecution.assertions.some((assertion) => assertion.includes("Global header")) &&
    ctaExecution.ctaExecution.externalGates.some((gate) => gate.includes("Google Forms")),
  "CTA execution assertions or external gates are missing",
);

const innovationRadar = await request("/api/swiggy-innovation-radar");
assert(innovationRadar.innovationRadar.score >= 70, "innovation radar score is below target");
assert(innovationRadar.innovationRadar.opportunityCount === 8, "innovation radar opportunity count is incomplete");
assert(
  ["developers_build_ideas", "enterprise_backend", "access_ground_rules", "support_contract", "reference_contract"].every((id) =>
    innovationRadar.innovationRadar.officialInputs.some((input) => input.id === id),
  ),
  "innovation radar official inputs are incomplete",
);
assert(
  ["voice_dinner_concierge", "pantry_autopilot", "group_office_lunch", "dineout_first_evening", "screenshot_to_order", "enterprise_tenant_lane"].every(
    (id) => innovationRadar.innovationRadar.opportunityLanes.some((lane) => lane.id === id),
  ),
  "innovation radar opportunity lanes are incomplete",
);
assert(
  innovationRadar.innovationRadar.opportunityLanes.some(
    (lane) =>
      lane.id === "dineout_first_evening" &&
      ["dineout", "food", "instamart"].every((server) => lane.swiggyServers.includes(server)) &&
      lane.swiggyTools.includes("dineout.book_table") &&
      lane.status === "ready",
  ),
  "innovation radar Dineout-first lane is missing",
);
assert(
  innovationRadar.innovationRadar.routeOptimizations.some((item) => item.includes("cart")),
  "innovation radar route optimization evidence is missing",
);
assert(
  innovationRadar.innovationRadar.buildPhases.some((phase) => phase.id === "credentialed_staging" && phase.status === "staging_gate"),
  "innovation radar staging gate phase is missing",
);

const aiClientConnect = await request("/api/ai-client-connect-kit");
assert(aiClientConnect.connectKit.score >= 95, "AI client connect kit score is below target");
assert(aiClientConnect.connectKit.clientTargets.length === 6, "AI client connect kit must cover six official clients");
assert(
  aiClientConnect.connectKit.clientTargets.some((target) => target.id === "chatgpt" && target.status === "external_client"),
  "AI client connect kit ChatGPT external client path is missing",
);
assert(
  aiClientConnect.connectKit.codingAgentRules.some((rule) => rule.target === "agents_md"),
  "AI client connect kit AGENTS.md rule is missing",
);
assert(
  aiClientConnect.connectKit.sdkAdapters.some((adapter) => adapter.authMode === "native_auth_provider") &&
    aiClientConnect.connectKit.sdkAdapters.some((adapter) => adapter.authMode === "bearer_header"),
  "AI client connect kit SDK auth-mode split is incomplete",
);
assert(
  aiClientConnect.connectKit.enterpriseDelegatedAuth.tokenLifecycle.some((item) => item.item === "Access token"),
  "AI client connect kit delegated auth lifecycle is missing",
);

const codingAgentGovernance = await request("/api/coding-agent-governance");
assert(codingAgentGovernance.codingAgentGovernance.score >= 95, "coding agent governance score is below target");
assert(
  codingAgentGovernance.codingAgentGovernance.ruleFile.path === "AGENTS.md" &&
    codingAgentGovernance.codingAgentGovernance.ruleFile.status === "ready" &&
    codingAgentGovernance.codingAgentGovernance.ruleFile.matchedSignals ===
      codingAgentGovernance.codingAgentGovernance.ruleFile.totalSignals,
  "coding agent governance AGENTS.md rule file is not ready",
);
assert(
  [
    "https://mcp.swiggy.com/builders/docs/start/coding-agents/",
    "https://mcp.swiggy.com/builders/llms.txt",
    "https://mcp.swiggy.com/builders/llms-full.txt",
  ].every((url) => codingAgentGovernance.codingAgentGovernance.officialSources.some((source) => source.url === url)),
  "coding agent governance official sources are incomplete",
);
assert(
  ["llms_index", "markdown_twins", "never_invent_tools", "food_tool_count_smoke"].every((id) =>
    codingAgentGovernance.codingAgentGovernance.requiredSignals.some((signal) => signal.id === id && signal.status === "ready"),
  ),
  "coding agent governance required signals are incomplete",
);
assert(
  codingAgentGovernance.codingAgentGovernance.smokeTests.some(
    (test) =>
      test.id === "food_tool_count" &&
      test.command.includes("llms.txt") &&
      test.expected.includes("Food reference exposes 14 tools"),
  ),
  "coding agent governance Food tool-count smoke test is missing",
);
assert(
  codingAgentGovernance.codingAgentGovernance.guardrails.some((guardrail) => guardrail.includes("Never log bearer tokens")) &&
    codingAgentGovernance.codingAgentGovernance.commands.some((command) => command.includes("/api/coding-agent-governance")),
  "coding agent governance guardrails or commands are incomplete",
);

const brandCompliance = await request("/api/brand-compliance-kit");
assert(brandCompliance.brandCompliance.score >= 85, "brand compliance score is below target");
assert(
  brandCompliance.brandCompliance.attributionCopy.includes("Powered by Swiggy MCP"),
  "brand compliance attribution copy is missing",
);
assert(
  [
    "powered_by_swiggy",
    "no_false_endorsement",
    "brand_assets_after_onboarding",
    "orange_usage",
    "white_label_restriction",
    "no_misrepresentation",
  ].every((id) => brandCompliance.brandCompliance.rules.some((rule) => rule.id === id)),
  "brand compliance rules are incomplete",
);
assert(
  brandCompliance.brandCompliance.surfaces.some((surface) => surface.id === "recommendation_card") &&
    brandCompliance.brandCompliance.surfaces.some((surface) => surface.id === "voice_surface") &&
    brandCompliance.brandCompliance.surfaces.some((surface) => surface.id === "support_transcript"),
  "brand compliance surface placements are incomplete",
);
assert(
  brandCompliance.brandCompliance.assetGates.some((gate) => gate.id === "logo_pack" && gate.status === "external_gate"),
  "brand compliance must preserve Swiggy asset delivery as an external gate",
);
assert(
  brandCompliance.brandCompliance.paletteAudit.swiggyOrange === "#FF5200" &&
    brandCompliance.brandCompliance.paletteAudit.orangeUsage === "reserved_for_swiggy_marks_only",
  "brand compliance palette audit is incomplete",
);

const journeyCompiler = await request("/api/swiggy-journey-compiler");
assert(journeyCompiler.journeyCompiler.score >= 95, "Swiggy journey compiler score is below target");
assert(journeyCompiler.journeyCompiler.totalJourneys >= 5, "Swiggy journey compiler journey coverage is incomplete");
assert(journeyCompiler.journeyCompiler.totalToolsIndexed === 35, "Swiggy journey compiler must index all 35 tools");
assert(
  journeyCompiler.journeyCompiler.journeys.some((journey) => journey.id === "combined_evening"),
  "Swiggy combined evening journey is missing",
);
assert(
  journeyCompiler.journeyCompiler.journeys.some(
    (journey) => journey.id === "household_reset" && journey.servers.length === 3,
  ),
  "MealPilot three-server household journey is missing",
);
assert(
  journeyCompiler.journeyCompiler.toolIndex.every((item) => item.journeyIds.length > 0),
  "Swiggy journey compiler has unplaced tools",
);
assert(
  journeyCompiler.journeyCompiler.journeys.some((journey) =>
    journey.steps.some((step) => step.tool === "book_table" && step.confirmationRequired),
  ),
  "Swiggy journey compiler must gate Dineout booking",
);

const accessDossier = await request("/api/swiggy-access-dossier");
assert(accessDossier.dossier.score >= 90, "Swiggy access dossier score is below target");
assert(accessDossier.dossier.recommendedTrack === "developer", "Swiggy access dossier should recommend developer track");
assert(
  accessDossier.dossier.applicationFields.some((field) => field.id === "what_you_are_building" && field.status === "ready") &&
    accessDossier.dossier.applicationFields.some((field) => field.id === "terms_acknowledgement" && field.status === "manual_input") &&
    accessDossier.dossier.applicationFields.some((field) => field.id === "static_ip_ranges"),
  "Swiggy access dossier application fields are incomplete",
);
assert(
  ["security_check", "compliance_review", "use_case_fit", "gradual_rollout", "ongoing_partnership"].every((id) =>
    accessDossier.dossier.reviewChecks.some((check) => check.id === id),
  ),
  "Swiggy access dossier review checks are incomplete",
);
assert(
  ["allowed", "restricted", "prohibited", "operating_principle"].every((stance) =>
    accessDossier.dossier.groundRules.some((rule) => rule.officialStance === stance),
  ),
  "Swiggy access dossier ground rules are incomplete",
);
assert(
  accessDossier.dossier.legalReadiness.some((item) => item.id === "data_protection_terms" && item.status === "ready"),
  "Swiggy access dossier legal readiness is incomplete",
);
assert(
  accessDossier.dossier.externalGates.some((gate) => gate.includes("Google Form")),
  "Swiggy access dossier must preserve form submission as a gate",
);

const accessEvidenceMatrix = await request("/api/swiggy-access-evidence-matrix");
assert(accessEvidenceMatrix.accessEvidenceMatrix.score >= 80, "access evidence matrix score is below target");
assert(accessEvidenceMatrix.accessEvidenceMatrix.recommendedTrack === "developer", "access evidence matrix developer track is missing");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.sections === 5, "access evidence matrix sections are incomplete");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.requiredApplicationFields === 9, "access evidence matrix required fields are incomplete");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.readyRequiredApplicationFields >= 4, "access evidence matrix ready required fields are too low");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.requiredAttachments >= 10, "access evidence matrix attachments are incomplete");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.readyRequiredAttachments >= 8, "access evidence matrix ready attachments are too low");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.rows >= 40, "access evidence matrix rows are incomplete");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.readyRows >= 25, "access evidence matrix ready rows are too low");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.operatorRows >= 5, "access evidence matrix operator rows are missing");
assert(accessEvidenceMatrix.accessEvidenceMatrix.totals.externalGateRows >= 3, "access evidence matrix external gates are missing");
assert(
  ["application_fields", "review_and_rules", "legal_and_tracks", "attachments_and_runbook", "reviewer_proof_commands"].every((id) =>
    accessEvidenceMatrix.accessEvidenceMatrix.sections.some((section) => section.id === id),
  ),
  "access evidence matrix section ids are missing",
);
assert(
  accessEvidenceMatrix.accessEvidenceMatrix.sections.some((section) =>
    section.rows.some((row) => row.id === "field_terms_acknowledgement" && row.owner === "Operator" && row.status === "operator_input"),
  ),
  "access evidence matrix terms operator gate is missing",
);
assert(
  accessEvidenceMatrix.accessEvidenceMatrix.sections.some((section) =>
    section.rows.some((row) => row.id === "runbook_await_credentials" && row.owner === "Swiggy" && row.status === "external_gate"),
  ),
  "access evidence matrix Swiggy credential gate is missing",
);
assert(
  ["matrix_readback", "production_verifier", "submission_state"].every((id) =>
    accessEvidenceMatrix.accessEvidenceMatrix.commands.some((command) => command.id === id),
  ),
  "access evidence matrix proof commands are missing",
);
assert(
  accessEvidenceMatrix.accessEvidenceMatrix.assertions.some((assertion) => assertion.includes("Every official access-page")) &&
    accessEvidenceMatrix.accessEvidenceMatrix.externalGates.some((gate) => gate.includes("staging credentials")),
  "access evidence matrix assertions or external gates are incomplete",
);

const useCaseStudio = await request("/api/premium-use-case-studio");
assert(useCaseStudio.studio.score >= 95, "premium use-case studio score is below target");
assert(useCaseStudio.studio.totalUseCases >= 10, "premium use-case studio use-case coverage is incomplete");
assert(useCaseStudio.studio.crossServerUseCases >= 8, "premium use-case studio cross-server coverage is incomplete");
assert(
  useCaseStudio.studio.totalToolsUsed === 35 && useCaseStudio.studio.totalOfficialTools === 35,
  "premium use-case studio must place all 35 official tools",
);
assert(
  useCaseStudio.studio.toolCoverage.every((server) => server.usedTools === server.totalTools),
  "premium use-case studio per-server tool coverage is incomplete",
);
assert(
  useCaseStudio.studio.useCases.some((item) => item.id === "voice_fridge_to_dinner") &&
    useCaseStudio.studio.useCases.some((item) => item.id === "care_circle_meals") &&
    useCaseStudio.studio.useCases.some((item) => item.id === "traveler_hotel_mode"),
  "premium use-case studio is missing differentiated use cases",
);
assert(
  useCaseStudio.studio.assertions.some((assertion) => assertion.includes("35/35 official Swiggy tools")),
  "premium use-case studio all-tool assertion is missing",
);

const concierge = await request("/api/premium-concierge-itinerary");
assert(concierge.concierge.score >= 95, "premium concierge itinerary score is below target");
assert(
  [
    "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
    "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
    "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
    "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  ].every((source) => concierge.concierge.officialSources.includes(source)),
  "premium concierge itinerary official recipe sources are incomplete",
);
assert(
  ["weekday_lunch", "evening_grocery_reset", "saturday_evening", "sunday_recovery"].every((id) =>
    concierge.concierge.itinerary.some((slot) => slot.id === id),
  ),
  "premium concierge itinerary slots are incomplete",
);
assert(
  concierge.concierge.toolCoverage.map((item) => item.coverage).join(",") === "14/14,13/13,8/8",
  "premium concierge itinerary per-server tool coverage is incomplete",
);
assert(concierge.concierge.totalSavedCalls >= 10, "premium concierge itinerary saved-call optimization is missing");
assert(
  concierge.concierge.itinerary.some(
    (slot) => slot.primaryRecipe === "combined" && slot.servers.includes("dineout") && slot.servers.includes("food"),
  ),
  "premium concierge itinerary combined Food/Dineout route is missing",
);
assert(
  concierge.concierge.safetyControls.some((control) => control.includes("confirmations remain separate")),
  "premium concierge itinerary separate confirmation control is missing",
);
assert(
  concierge.concierge.externalGates.some((gate) => gate.includes("scheduled delivery")),
  "premium concierge itinerary scheduled-delivery external gate is missing",
);

const stagingCertification = await request("/api/staging-certification-matrix");
const stagingTools = stagingCertification.matrix.waves.flatMap((wave) => wave.tools);
const stagingToolIds = new Set(stagingTools.map((tool) => tool.id));
assert(stagingCertification.matrix.score >= 90, "staging certification score is below target");
assert(stagingCertification.matrix.totalTools === 35, "staging certification must include 35 tools");
assert(stagingCertification.matrix.assignedTools === 35, "staging certification must assign all tools");
assert(stagingTools.length === 35 && stagingToolIds.size === 35, "staging certification tool wave assignment is not unique");
assert(stagingCertification.matrix.soakHoursRequired === 48, "staging certification 48-hour soak is missing");
assert(
  [
    "preflight",
    "oauth_dcr",
    "read_tools",
    "cart_mutations",
    "commercial_actions",
    "support_reporting",
    "soak_48h",
    "production_promotion",
  ].every((id) => stagingCertification.matrix.waves.some((wave) => wave.id === id)),
  "staging certification waves are incomplete",
);
assert(
  stagingCertification.matrix.waves.some(
    (wave) =>
      wave.id === "commercial_actions" &&
      wave.tools.some((tool) => tool.tool === "place_food_order" && tool.expectedEvidence.includes("no blind retry")),
  ),
  "staging certification commercial action gate is missing",
);
assert(
  stagingCertification.matrix.perServer.every((server) => server.totalTools === server.assignedTools),
  "staging certification per-server assignment is incomplete",
);
assert(
  stagingCertification.matrix.telemetryRequirements.some((item) => item.includes("session_id")),
  "staging certification session-id telemetry requirement is missing",
);
assert(
  stagingCertification.matrix.externalGates.some((gate) => gate.includes("staging credentials")),
  "staging certification must preserve external staging credentials gate",
);

const toolLab = await request("/api/mcp/tool-lab");
assert(toolLab.toolLab.totalTools === 35, "Tool Lab must probe all 35 official tools");
assert(toolLab.toolLab.callableTools === 35, "Tool Lab must keep all official tools callable in mock mode");
assert(toolLab.toolLab.score >= 95, "Tool Lab score is below target");
assert(toolLab.toolLab.commercialTools === 3, "Tool Lab commercial action classification is incomplete");
assert(
  toolLab.toolLab.probes.some(
    (probe) =>
      probe.tool === "book_table" &&
      probe.routeClass === "commercial_action" &&
      probe.safetyGate.includes("explicit user confirmation"),
  ),
  "Tool Lab booking confirmation gate is missing",
);

const toolContracts = await request("/api/mcp/tool-contract-matrix");
assert(toolContracts.matrix.score === 100, "tool contract matrix score is below target");
assert(toolContracts.matrix.totalTools === 35, "tool contract matrix must include all 35 tools");
assert(toolContracts.matrix.totalParameters > 50, "tool contract matrix parameter coverage is incomplete");
assert(
  toolContracts.matrix.servers.map((server) => server.totalTools).join(",") === "14,13,8",
  "tool contract matrix server counts are incomplete",
);
assert(
  toolContracts.matrix.contracts.every((contract) =>
    contract.officialReference.startsWith("https://mcp.swiggy.com/builders/docs/reference/"),
  ),
  "tool contract matrix official references are incomplete",
);
const foodOrderContract = toolContracts.matrix.contracts.find((contract) => contract.tool === "place_food_order");
assert(
  foodOrderContract.parameters.some((param) => param.name === "addressId") &&
    foodOrderContract.parameters.some((param) => param.name === "paymentMethod") &&
    foodOrderContract.confirmationGate.includes("get_food_cart") &&
    foodOrderContract.confirmationGate.includes("Rs 1000"),
  "tool contract matrix Food order contract is incomplete",
);
const checkoutContract = toolContracts.matrix.contracts.find((contract) => contract.tool === "checkout");
assert(
  checkoutContract.confirmationGate.includes("get_cart") &&
    checkoutContract.preconditions.some((item) => item.includes("Multi-store")),
  "tool contract matrix Instamart checkout contract is incomplete",
);
const bookingContract = toolContracts.matrix.contracts.find((contract) => contract.tool === "book_table");
assert(
  ["restaurantId", "slotId", "itemId", "reservationTime", "guestCount", "latitude", "longitude"].every((name) =>
    bookingContract.parameters.some((param) => param.name === name),
  ) && bookingContract.preconditions.some((item) => item.includes("free reservations")),
  "tool contract matrix Dineout booking contract is incomplete",
);
assert(
  toolContracts.matrix.commonErrorEnvelope.current.includes("error.message required") &&
    toolContracts.matrix.commonErrorEnvelope.plannedCoreCodes.includes("RATE_LIMITED") &&
    toolContracts.matrix.commonErrorEnvelope.plannedDomainCodes.dineout.includes("SLOT_UNAVAILABLE"),
  "tool contract matrix error envelope is incomplete",
);

const scenarioRunner = await request("/api/mcp/scenario-runner");
assert(scenarioRunner.scenarioRunner.score === 100, "scenario runner score is below target");
assert(scenarioRunner.scenarioRunner.totalScenarios === 4, "scenario runner official recipe count is incomplete");
assert(scenarioRunner.scenarioRunner.totalOfficialTools === 35, "scenario runner official tool count is incomplete");
assert(scenarioRunner.scenarioRunner.uniqueToolsCovered === 35, "scenario runner must cover all official tools");
assert(
  scenarioRunner.scenarioRunner.toolCoverage.map((item) => item.coverage).join(",") === "14/14,13/13,8/8",
  "scenario runner per-server coverage is incomplete",
);
assert(
  ["food_order_recipe", "instamart_order_recipe", "dineout_booking_recipe", "combined_evening_recipe"].every((id) =>
    scenarioRunner.scenarioRunner.scenarios.some((scenario) => scenario.id === id),
  ),
  "scenario runner official recipe traces are incomplete",
);
assert(
  scenarioRunner.scenarioRunner.scenarios.every((scenario) =>
    scenario.steps.every((step) => step.request.method === "tools/call"),
  ),
  "scenario runner JSON-RPC request traces are incomplete",
);
assert(
  scenarioRunner.scenarioRunner.scenarios.some(
    (scenario) =>
      scenario.id === "combined_evening_recipe" &&
      scenario.routeAssertions.some((assertion) => assertion.includes("reminder")),
  ),
  "scenario runner combined reminder assertion is missing",
);
assert(
  scenarioRunner.scenarioRunner.scenarios.some((scenario) =>
    scenario.steps.some((step) => step.tool === "place_food_order" && step.confirmationRequired),
  ),
  "scenario runner Food confirmation gate is missing",
);

const stateOrchestrator = await request("/api/mcp/state-orchestrator");
assert(stateOrchestrator.stateOrchestrator.score >= 90, "state orchestrator score is below target");
assert(stateOrchestrator.stateOrchestrator.totalScenarios >= 6, "state orchestrator scenario coverage is incomplete");
assert(stateOrchestrator.stateOrchestrator.totalTurnBoundaries >= 15, "state orchestrator turn-boundary coverage is incomplete");
assert(
  stateOrchestrator.stateOrchestrator.refreshBeforeMutationCount === stateOrchestrator.stateOrchestrator.totalTurnBoundaries,
  "state orchestrator must refresh before every mutation/commercial action",
);
assert(stateOrchestrator.stateOrchestrator.confirmationGateCount >= 7, "state orchestrator confirmation gates are incomplete");
assert(
  stateOrchestrator.stateOrchestrator.serverModels.map((model) => model.server).join(",") === "food,instamart,dineout",
  "state orchestrator server models are incomplete",
);
assert(
  stateOrchestrator.stateOrchestrator.serverModels.some(
    (model) =>
      model.server === "food" &&
      model.switchGuard.includes("restaurant") &&
      model.authoritativeReads.includes("get_food_cart"),
  ),
  "state orchestrator Food restaurant-switch guard is missing",
);
assert(
  ["food_restaurant_switch", "instamart_address_switch", "dineout_slot_refresh", "combined_server_boundaries", "abandoned_cart_recovery"].every((id) =>
    stateOrchestrator.stateOrchestrator.scenarios.some((scenario) => scenario.id === id),
  ),
  "state orchestrator critical state scenarios are incomplete",
);
assert(
  stateOrchestrator.stateOrchestrator.scenarios.every((scenario) => scenario.unsafeMemoryRejected),
  "state orchestrator must reject unsafe agent memory in every scenario",
);
const voiceContract = stateOrchestrator.stateOrchestrator.surfaceContracts.find((contract) => contract.surface === "voice");
const chatContract = stateOrchestrator.stateOrchestrator.surfaceContracts.find((contract) => contract.surface === "chat");
assert(
  voiceContract.maxPresentedItems === 3 &&
    voiceContract.forbiddenContent.includes("raw addressId") &&
    voiceContract.forbiddenContent.includes("spinId"),
  "state orchestrator voice contract is incomplete",
);
assert(
  chatContract.maxPresentedItems === 8 && chatContract.widgetPolicy.includes("semantic widget contracts"),
  "state orchestrator chat contract is incomplete",
);

const capabilityRegistry = await request("/api/mcp/capability-registry");
assert(capabilityRegistry.registry.score >= 90, "capability registry score is below target");
assert(
  capabilityRegistry.registry.scopes.includes("mcp:tools") &&
    capabilityRegistry.registry.scopes.includes("mcp:resources") &&
    capabilityRegistry.registry.scopes.includes("mcp:prompts"),
  "capability registry scope coverage is incomplete",
);
assert(capabilityRegistry.registry.serverEndpoints.length === 3, "capability registry server endpoints are incomplete");
assert(
  capabilityRegistry.registry.capabilityGroups.some((group) => group.kind === "resources") &&
    capabilityRegistry.registry.capabilityGroups.some((group) => group.kind === "prompts"),
  "capability registry resources/prompts groups are missing",
);
assert(
  capabilityRegistry.registry.resources.some((resource) => resource.id === "widget_registry"),
  "capability registry widget resource is missing",
);
assert(
  capabilityRegistry.registry.prompts.some((prompt) => prompt.id === "combined_meal_agent"),
  "capability registry prompt template is missing",
);

const resourcePromptStudio = await request("/api/mcp/resource-prompt-studio");
assert(resourcePromptStudio.resourcePromptStudio.score >= 95, "resource and prompt studio score is below target");
assert(resourcePromptStudio.resourcePromptStudio.totalResources === 6, "resource studio resource coverage is incomplete");
assert(
  resourcePromptStudio.resourcePromptStudio.readyResources === resourcePromptStudio.resourcePromptStudio.totalResources,
  "resource studio ready resource coverage is incomplete",
);
assert(resourcePromptStudio.resourcePromptStudio.totalPrompts === 6, "prompt studio prompt coverage is incomplete");
assert(
  resourcePromptStudio.resourcePromptStudio.readyPrompts === resourcePromptStudio.resourcePromptStudio.totalPrompts,
  "prompt studio ready prompt coverage is incomplete",
);
assert(
  resourcePromptStudio.resourcePromptStudio.serverSummaries.length === 3 &&
    resourcePromptStudio.resourcePromptStudio.serverSummaries.every(
      (summary) => summary.resources === 2 && summary.prompts === 2 && summary.status === "ready",
    ),
  "resource and prompt studio server summaries are incomplete",
);
assert(
  resourcePromptStudio.resourcePromptStudio.resources.some(
    (resource) =>
      resource.uri === "swiggy://food/widgets" &&
      resource.sampleRead.scope === "mcp:resources" &&
      resource.sampleRead.registryKind === "widget_registry",
  ),
  "resource and prompt studio Food widget resource is missing",
);
assert(
  resourcePromptStudio.resourcePromptStudio.prompts.some(
    (prompt) =>
      prompt.name === "dineout_evening_planner" &&
      prompt.sampleMessages[0].text.includes("Dineout") &&
      prompt.sampleMessages[1].text.includes("guests"),
  ),
  "resource and prompt studio Dineout prompt sample is missing",
);
assert(
  ["resources/list", "resources/read", "prompts/list", "prompts/get"].every((method) =>
    resourcePromptStudio.resourcePromptStudio.smokeRequests.some((smoke) => smoke.method === method),
  ),
  "resource and prompt studio smoke requests are incomplete",
);
assert(resourcePromptStudio.resourcePromptStudio.smokeRequests.length === 12, "resource and prompt studio smoke count is wrong");
assert(
  resourcePromptStudio.resourcePromptStudio.externalGates.some((gate) => gate.includes("Live resources/list")),
  "resource and prompt studio live Swiggy gates are missing",
);

const gateway = await request("/api/mcp-gateway");
assert(gateway.gateway.readinessScore >= 90, "MCP gateway readiness score is below target");
assert(gateway.gateway.requestedServers.length === 3, "MCP gateway server map is incomplete");

const stagingCutover = await request("/api/mcp/staging-cutover");
assert(stagingCutover.stagingCutover.score >= 85, "staging cutover score is below target");
assert(stagingCutover.stagingCutover.totalServers === 3, "staging cutover server coverage is incomplete");
assert(stagingCutover.stagingCutover.routableServers === 3, "staging cutover local routes should be routable");
assert(stagingCutover.stagingCutover.blockedServers === 0, "staging cutover local routes should not be blocked");
assert(stagingCutover.stagingCutover.dryRunCalls === 3, "staging cutover first-call probes are incomplete");
assert(
  stagingCutover.stagingCutover.probes.map((probe) => `${probe.server}:${probe.firstTool}`).join(",") ===
    "food:get_addresses,instamart:get_addresses,dineout:get_saved_locations",
  "staging cutover first tool sequence is wrong",
);
assert(
  stagingCutover.stagingCutover.probes.every((probe) => probe.dryRunRequest.method === "tools/call"),
  "staging cutover probes must be JSON-RPC tools/call",
);
assert(
  stagingCutover.stagingCutover.probes.every(
    (probe) =>
      probe.failureBranches.some((branch) => branch.status === "401") &&
      probe.failureBranches.some((branch) => branch.status === "network"),
  ),
  "staging cutover failure branches are incomplete",
);
assert(
  stagingCutover.stagingCutover.oauthChecks.some((check) => check.id === "pkce" && check.status === "ready"),
  "staging cutover PKCE evidence is missing",
);
assert(
  stagingCutover.stagingCutover.transportChecks.some((check) => check.id === "fail_closed" && check.status === "ready"),
  "staging cutover fail-closed evidence is missing",
);
assert(
  stagingCutover.stagingCutover.promotionChecks.some(
    (check) => check.id === "green_48h" && check.status === "external_gate",
  ),
  "staging cutover 48-hour staging gate is missing",
);
assert(stagingCutover.stagingCutover.supportPacket.to === "builders@swiggy.in", "staging cutover support packet is missing");
assert(
  stagingCutover.stagingCutover.commands.some(
    (command) => command.id === "staging_env" && command.command.includes("SWIGGY_ENV=staging"),
  ),
  "staging cutover staging command is missing",
);

const onboarding = await request("/api/credential-onboarding");
assert(onboarding.onboarding.score >= 90, "credential onboarding score is below target");
assert(
  onboarding.onboarding.dynamicClientRegistration.endpoint.includes("/auth/register"),
  "DCR endpoint preview is missing",
);
assert(
  onboarding.onboarding.scopes.includes("mcp:tools") &&
    onboarding.onboarding.scopes.includes("mcp:resources") &&
    onboarding.onboarding.scopes.includes("mcp:prompts"),
  "credential onboarding scope coverage is incomplete",
);
assert(
  onboarding.onboarding.checks.some((check) => check.id === "pkce" && check.status === "ready"),
  "credential onboarding PKCE evidence is missing",
);

const sandboxWorkbench = await request("/api/sandbox-credential-workbench");
assert(sandboxWorkbench.sandboxWorkbench.score >= 82, "sandbox credential workbench score is below target");
const sandboxScoreWeights = {
  ready: 1,
  operator_input: 0.84,
  swiggy_gate: 0.76,
  blocked: 0.2,
};
const calculatedSandboxScore = Math.round(
  (sandboxWorkbench.sandboxWorkbench.lanes.reduce((sum, lane) => sum + sandboxScoreWeights[lane.status], 0) /
    sandboxWorkbench.sandboxWorkbench.lanes.length) *
    100,
);
assert(
  sandboxWorkbench.sandboxWorkbench.score === calculatedSandboxScore,
  "sandbox credential score must match lane status weights",
);
assert(
  sandboxWorkbench.sandboxWorkbench.officialSources.includes(
    "https://mcp.swiggy.com/builders/docs/start/authenticate/",
  ) &&
    sandboxWorkbench.sandboxWorkbench.officialSources.includes(
      "https://mcp.swiggy.com/builders/docs/operate/access/",
    ),
  "sandbox credential workbench official source coverage is incomplete",
);
assert(
  sandboxWorkbench.sandboxWorkbench.localReadiness.scopesReady &&
    sandboxWorkbench.sandboxWorkbench.localReadiness.pkceReady,
  "sandbox credential local OAuth readiness is incomplete",
);
for (const laneId of [
  "local_video",
  "dcr_client_identity",
  "pkce_oauth",
  "redirect_allowlist",
  "staging_credentials",
  "production_promotion",
]) {
  assert(
    sandboxWorkbench.sandboxWorkbench.lanes.some((lane) => lane.id === laneId),
    `sandbox credential lane ${laneId} is missing`,
  );
}
for (const [server, guardedWrite] of [
  ["food", "place_food_order"],
  ["instamart", "checkout"],
  ["dineout", "book_table"],
]) {
  assert(
    sandboxWorkbench.sandboxWorkbench.seededDataPlan.some(
      (plan) => plan.server === server && plan.guardedWrite === guardedWrite,
    ),
    `sandbox credential seeded data plan for ${server} is missing`,
  );
}
assert(sandboxWorkbench.sandboxWorkbench.stagingPromotion.soakHoursRequired === 48, "sandbox credential 48-hour soak is missing");
assert(
  sandboxWorkbench.sandboxWorkbench.stagingPromotion.assignedTools === 35 &&
    sandboxWorkbench.sandboxWorkbench.stagingPromotion.totalTools === 35,
  "sandbox credential workbench does not cover all 35 tools",
);
assert(
  sandboxWorkbench.sandboxWorkbench.commands.some(
    (command) => command.id === "staging_cutover" && command.command.includes("/api/mcp/staging-cutover"),
  ) &&
    sandboxWorkbench.sandboxWorkbench.commands.some((command) => command.id === "production_smoke"),
  "sandbox credential workbench commands are incomplete",
);
assert(
  sandboxWorkbench.sandboxWorkbench.assertions.some((assertion) =>
    assertion.includes("locally without Swiggy credentials"),
  ) &&
    sandboxWorkbench.sandboxWorkbench.externalGates.some((gate) => gate.includes("staging credentials")),
  "sandbox credential workbench readiness assertions are incomplete",
);

const stagingCredentialDrill = await request("/api/swiggy-staging-credential-drill");
assert(stagingCredentialDrill.stagingCredentialDrill.score >= 70, "staging credential drill score is below target");
assert(
  stagingCredentialDrill.stagingCredentialDrill.credentialSignal.currentGate === "swiggy_gate",
  "staging credential drill must preserve Swiggy credential external gate",
);
assert(
  stagingCredentialDrill.stagingCredentialDrill.totals.lanes === 6 &&
    stagingCredentialDrill.stagingCredentialDrill.totals.firstCallDrills === 3 &&
    stagingCredentialDrill.stagingCredentialDrill.totals.seededDataRequirements === 3 &&
    stagingCredentialDrill.stagingCredentialDrill.totals.promotionGates === 4,
  "staging credential drill totals are incomplete",
);
assert(
  ["oauth_dcr", "seeded_data", "first_call_wave", "operating_contract"].every((id) =>
    stagingCredentialDrill.stagingCredentialDrill.lanes.some((lane) => lane.id === id),
  ),
  "staging credential drill lanes are incomplete",
);
assert(
  stagingCredentialDrill.stagingCredentialDrill.firstCallDrills.map((drill) => `${drill.server}:${drill.firstTool}`).join(",") ===
    "food:get_addresses,instamart:get_addresses,dineout:get_saved_locations",
  "staging credential drill first-call drills are incomplete",
);
assert(
  stagingCredentialDrill.stagingCredentialDrill.operatorRunbook.some(
    (step) => step.command.includes("SWIGGY_ENV=staging") && step.proves.includes("Swiggy staging"),
  ),
  "staging credential drill operator runbook is incomplete",
);
assert(
  stagingCredentialDrill.stagingCredentialDrill.handoffEmail.to === "builders@swiggy.in" &&
    stagingCredentialDrill.stagingCredentialDrill.externalGates.some((gate) => gate.includes("staging credentials")),
  "staging credential drill handoff or external gate is missing",
);

const liveSignalCalibration = await request("/api/swiggy-live-signal-calibration");
assert(liveSignalCalibration.liveSignalCalibration.score >= 74, "live signal calibration score is below target");
assert(
  liveSignalCalibration.liveSignalCalibration.totals.lanes === 6 &&
    liveSignalCalibration.liveSignalCalibration.totals.probes === 4 &&
    liveSignalCalibration.liveSignalCalibration.totals.stagingWaves === 5 &&
    liveSignalCalibration.liveSignalCalibration.totals.privacyControls === 4,
  "live signal calibration totals are incomplete",
);
assert(
  ["food_active_order_memory", "instamart_pantries_and_go_to", "dineout_location_booking_truth", "offer_cart_truth"].every(
    (id) => liveSignalCalibration.liveSignalCalibration.signalLanes.some((lane) => lane.id === id),
  ),
  "live signal calibration lanes are incomplete",
);
assert(
  liveSignalCalibration.liveSignalCalibration.serverCalibration.map((server) => `${server.server}:${server.readOnlyTools.length}`).join(",") ===
    "food:4,instamart:5,dineout:4",
  "live signal calibration server calibration is incomplete",
);
assert(
  liveSignalCalibration.liveSignalCalibration.probes.some(
    (probe) => probe.id === "combined_offer_drift_probe" && probe.failureStopRule.includes("coupon rejection"),
  ),
  "live signal calibration offer drift probe is missing",
);
assert(
  liveSignalCalibration.liveSignalCalibration.operatorRunbook.some(
    (step) => step.command.includes("/api/swiggy-live-signal-calibration") && step.proves.includes("staging"),
  ) &&
    liveSignalCalibration.liveSignalCalibration.externalGates.some((gate) => gate.includes("seeded Food")),
  "live signal calibration runbook or external gate is missing",
);

const authStatusBefore = await request("/api/auth/swiggy/status");
assert(authStatusBefore.authStatus.endpoints.authorize.includes("/auth/authorize"), "OAuth authorize endpoint is missing");
assert(authStatusBefore.authStatus.endpoints.token.includes("/auth/token"), "OAuth token endpoint is missing");
assert(
  authStatusBefore.authStatus.callbackChecklist.some((item) => item.id === "pkce_s256" && item.status === "ready"),
  "OAuth status PKCE checklist is missing",
);
assert(
  authStatusBefore.authStatus.storagePolicy.some((item) => item.includes("Never log access tokens")),
  "OAuth status storage policy is incomplete",
);

const authStart = await request("/api/auth/swiggy/start", { method: "POST" });
assert(authStart.authorizationUrl.includes("/auth/authorize"), "OAuth start authorize URL is missing");
assert(authStart.verifierStoredServerSide, "OAuth start must keep verifier server-side");
assert(authStart.authStatus.pendingVerifierCount >= 1, "OAuth start pending verifier count is missing");
assert(
  authStart.authStatus.latestEvent.status === "authorization_url_created",
  "OAuth start latest event is wrong",
);

const authCallback = await request(
  `/api/auth/swiggy/callback?${new URLSearchParams({ code: "verify_mock_code", state: authStart.state }).toString()}`,
);
assert(authCallback.tokenExchange === "mocked", "mock OAuth callback did not complete");
assert(authCallback.authStatus.latestEvent.status === "callback_mocked", "OAuth callback status is wrong");
assert(authCallback.authStatus.pendingVerifierCount === 0, "OAuth callback should consume the verifier");

const authStatusAfter = await request("/api/auth/swiggy/status");
assert(
  authStatusAfter.authStatus.latestEvent.status === "callback_mocked",
  "OAuth status did not preserve latest callback event",
);

const authLifecycle = await request("/api/swiggy-auth-lifecycle-center");
assert(
  Object.keys(authLifecycle).join(",") === "authLifecycleCenter",
  "Auth Lifecycle Center response shape is incorrect",
);
assert(authLifecycle.authLifecycleCenter.score >= 90, "Auth Lifecycle Center score is below target");
assert(authLifecycle.authLifecycleCenter.tokenLifetimes.authorizationCodeSeconds === 120, "auth code lifetime is missing");
assert(authLifecycle.authLifecycleCenter.tokenLifetimes.accessTokenDays === 5, "access token lifetime is missing");
assert(authLifecycle.authLifecycleCenter.tokenLifetimes.idleSessionDays === 30, "idle session lifetime is missing");
assert(authLifecycle.authLifecycleCenter.tokenLifetimes.refreshTokenAvailableInV1 === false, "refresh-token v1 gate is missing");
assert(
  ["pkce_s256_authorize", "single_use_code_exchange", "five_day_access_token", "no_refresh_token_v1", "reauth_on_401_419"].every((id) =>
    authLifecycle.authLifecycleCenter.lanes.some((lane) => lane.id === id),
  ),
  "Auth Lifecycle lanes are incomplete",
);
assert(
  ["401", "419", "403", "refresh_requested", "logout"].every((trigger) =>
    authLifecycle.authLifecycleCenter.recoveryScenarios.some((scenario) => scenario.trigger === trigger),
  ),
  "Auth Lifecycle recovery scenarios are incomplete",
);
assert(
  authLifecycle.authLifecycleCenter.storageRules.some((rule) => rule.id === "no_plaintext_logs") &&
    authLifecycle.authLifecycleCenter.assertions.some((assertion) => assertion.includes("does not assume refresh-token")),
  "Auth Lifecycle storage or assertions are incomplete",
);

const enterpriseAuth = await request("/api/enterprise-delegated-auth");
assert(enterpriseAuth.enterpriseAuth.score >= 90, "enterprise delegated auth score is below target");
assert(
  enterpriseAuth.enterpriseAuth.principle.swiggyRole === "Data Fiduciary" &&
    enterpriseAuth.enterpriseAuth.principle.platformRole === "Data Processor",
  "enterprise delegated auth DPDP role boundary is missing",
);
assert(
  [
    "platform_preregistration",
    "per_user_pkce",
    "authorize_redirect",
    "token_exchange",
    "per_user_storage",
    "mcp_call_on_behalf",
    "expiry_reauth",
    "logout_disconnect",
  ].every((id) => enterpriseAuth.enterpriseAuth.flow.some((step) => step.id === id)),
  "enterprise delegated auth OBO flow is incomplete",
);
assert(
  enterpriseAuth.enterpriseAuth.redirectUriStrategy.exactMatchRequired &&
    ["googleassistant://oauth2redirect", "alexa://oauth/callback", "jio-hello://oauth/callback"].every((uri) =>
      enterpriseAuth.enterpriseAuth.redirectUriStrategy.allowedExamples.includes(uri),
    ),
  "enterprise delegated auth redirect strategy is incomplete",
);
assert(
  enterpriseAuth.enterpriseAuth.tokenLifecycle.some(
    (item) => item.item === "Authorization code" && item.lifetime === "120 seconds",
  ) &&
    enterpriseAuth.enterpriseAuth.tokenLifecycle.some((item) => item.item === "Access token" && item.lifetime === "5 days") &&
    enterpriseAuth.enterpriseAuth.tokenLifecycle.some(
      (item) => item.item === "User session" && item.lifetime === "30 days idle sliding",
    ),
  "enterprise delegated auth token lifecycle is incomplete",
);
assert(
  ["per_user_boundary", "no_password_or_otp", "plaintext_lifetime", "logout_revoke"].every((id) =>
    enterpriseAuth.enterpriseAuth.storageRules.some((rule) => rule.id === id),
  ),
  "enterprise delegated auth storage rules are incomplete",
);
assert(
  ["mcp:tools", "mcp:resources", "mcp:prompts"].every((scope) =>
    enterpriseAuth.enterpriseAuth.scopes.some((item) => item.scope === scope),
  ),
  "enterprise delegated auth scope coverage is incomplete",
);
assert(
  ["401 Unauthorized", "419 Session expired", "403 Forbidden", "Upstream shedding", "Bad redirect"].every((symptom) =>
    enterpriseAuth.enterpriseAuth.troubleshooting.some((item) => item.symptom === symptom),
  ),
  "enterprise delegated auth troubleshooting matrix is incomplete",
);
assert(
  enterpriseAuth.enterpriseAuth.platformUseCases.some((useCase) => useCase.surface === "enterprise_saas"),
  "enterprise delegated auth enterprise SaaS use case is missing",
);
assert(
  enterpriseAuth.enterpriseAuth.architectureReview.some((item) => item.topic === "Delegated OAuth") &&
    enterpriseAuth.enterpriseAuth.architectureReview.some((item) => item.topic === "Observability handoff") &&
    enterpriseAuth.enterpriseAuth.architectureReview.some((item) => item.topic === "Data handling"),
  "enterprise delegated auth architecture review is incomplete",
);
assert(
  enterpriseAuth.enterpriseAuth.externalGates.some((gate) => gate.includes("platform-operator")),
  "enterprise delegated auth must preserve platform-operator gate",
);

const enterprisePlatform = await request("/api/enterprise-platform-center");
assert(
  Object.keys(enterprisePlatform).join(",") === "enterprisePlatform",
  "enterprise platform response shape is incorrect",
);
assert(enterprisePlatform.enterprisePlatform.score >= 88, "enterprise platform score is below target");
assert(
  enterprisePlatform.enterprisePlatform.currentTrack === "developer_ready_enterprise_planned" &&
    enterprisePlatform.enterprisePlatform.platformProfile.surfaces.includes("enterprise SaaS"),
  "enterprise platform profile is incomplete",
);
assert(
  ["platform_operator_path", "tenant_delegated_auth", "quota_and_peak_qps", "staging_soak", "contract_sla_support"].every((id) =>
    enterprisePlatform.enterprisePlatform.readinessLanes.some((lane) => lane.id === id),
  ),
  "enterprise platform readiness lanes are incomplete",
);
assert(
  ["tenant_registry", "per_user_tokens", "tenant_quota_profile", "tenant_support_routing", "tenant_audit_export"].every((id) =>
    enterprisePlatform.enterprisePlatform.tenantControls.some((control) => control.id === id),
  ),
  "enterprise platform tenant controls are incomplete",
);
assert(
  ["builders_email", "security_email", "designated_contact", "runtime_report_error", "enterprise_slack"].every((id) =>
    enterprisePlatform.enterprisePlatform.supportLanes.some((lane) => lane.id === id),
  ),
  "enterprise platform support lanes are incomplete",
);
assert(
  ["commercial_terms", "security_attestations", "peak_qps_review", "co_branding_approval"].every((id) =>
    enterprisePlatform.enterprisePlatform.contractGates.some((gate) => gate.id === id),
  ),
  "enterprise platform contract gates are incomplete",
);
assert(
  enterprisePlatform.enterprisePlatform.auditExports.length === 3 &&
    enterprisePlatform.enterprisePlatform.externalGates.some((gate) => gate.includes("Enterprise access")),
  "enterprise platform audit exports or gates are incomplete",
);
assert(
  enterprisePlatform.enterprisePlatform.assertions.some((assertion) => assertion.includes("separate access track")),
  "enterprise platform assertions are incomplete",
);

const preflight = await request(`/api/sessions/${sessionId}/preflight`);
assert(preflight.preflight.checks.length >= 15, "preflight checks are incomplete");

const replay = await request(`/api/sessions/${sessionId}/replay`);
assert(replay.replay.length >= 10, "MCP replay is incomplete");

const stagingTranscript = await request(`/api/sessions/${sessionId}/staging-transcript`);
assert(stagingTranscript.transcript.score >= 90, "staging transcript score is below target");
assert(stagingTranscript.transcript.sessionId === sessionId, "staging transcript session id is wrong");
assert(stagingTranscript.transcript.totalEntries >= replay.replay.length, "staging transcript entry count must cover replay");
assert(
  ["food", "instamart", "dineout"].every((server) => stagingTranscript.transcript.coveredServers.includes(server)),
  "staging transcript must cover all three servers for the verification plan",
);
assert(stagingTranscript.transcript.jsonl.includes('"event":"mcp_tool_call"'), "staging transcript JSONL is missing MCP events");
assert(stagingTranscript.transcript.markdown.includes("MealPilot Staging Transcript"), "staging transcript markdown is missing");
assert(stagingTranscript.transcript.redaction.piiFree, "staging transcript must be marked PII-free");
assert(
  stagingTranscript.transcript.redaction.redactedFields.includes("access_token"),
  "staging transcript redaction manifest is incomplete",
);
assert(stagingTranscript.transcript.supportEnvelope.to === "builders@swiggy.in", "staging transcript support target is missing");
assert(
  stagingTranscript.transcript.entries.some(
    (entry) =>
      entry.tool === "place_food_order" &&
      entry.routeClass === "commercial_action" &&
      entry.retryPolicy.includes("check order or booking status"),
  ),
  "staging transcript non-blind retry evidence is missing",
);
assert(
  stagingTranscript.transcript.readiness.some((item) => item.id === "staging_credentials" && item.status === "external_gate"),
  "staging transcript must preserve live staging as an external gate",
);

const widgets = await request(`/api/sessions/${sessionId}/widgets`);
assert(widgets.widgets.length >= 5, "widget contracts are incomplete");
assert(widgets.bridge.verifyOrigin, "widget bridge must verify origin");

const widgetRuntime = await request("/api/mcp/widget-runtime");
assert(widgetRuntime.widgetRuntime.score >= 90, "widget runtime score is below target");
assert(widgetRuntime.widgetRuntime.totalSurfaces >= 7, "widget runtime surfaces are incomplete");
assert(
  widgetRuntime.widgetRuntime.fallbackReady === widgetRuntime.widgetRuntime.totalSurfaces,
  "widget runtime semantic fallback coverage is incomplete",
);
assert(widgetRuntime.widgetRuntime.hostedReady === 0, "widget runtime must keep hosted widgets gated in local review");
assert(widgetRuntime.widgetRuntime.eventsHandled >= 14, "widget runtime postMessage event handling is incomplete");
assert(widgetRuntime.widgetRuntime.totalActivationChecks >= 16, "widget runtime activation checklist is incomplete");
assert(widgetRuntime.widgetRuntime.readyActivationChecks >= 12, "widget runtime ready activation checks are incomplete");
assert(widgetRuntime.widgetRuntime.externalActivationGates >= 4, "widget runtime external activation gates are incomplete");
assert(widgetRuntime.widgetRuntime.optInHeader.status === "external_gate", "widget runtime opt-in header gate is missing");
assert(
  ["restaurant-card", "menu-item", "cart-widget", "product-card", "slot-picker"].every((type) =>
    widgetRuntime.widgetRuntime.surfaces.some((surface) => surface.type === type),
  ),
  "widget runtime surface types are incomplete",
);
assert(
  widgetRuntime.widgetRuntime.surfaces.some(
    (surface) =>
      surface.server === "dineout" &&
      surface.type === "restaurant-card" &&
      surface.returnedByTools.includes("get_available_slots"),
  ),
  "widget runtime Dineout restaurant-card surface is missing",
);
assert(
  widgetRuntime.widgetRuntime.surfaces.some(
    (surface) => surface.server === "food" && surface.returnedByTools.includes("search_restaurants"),
  ),
  "widget runtime Food restaurant tools are missing",
);
assert(
  widgetRuntime.widgetRuntime.bridgeRules.some(
    (rule) => rule.id === "origin_verification" && rule.status === "ready",
  ),
  "widget runtime origin verification is missing",
);
assert(
  widgetRuntime.widgetRuntime.bridgeRules.some(
    (rule) => rule.id === "no_top_navigation" && rule.rule.includes("allow-top-navigation"),
  ),
  "widget runtime no-top-navigation sandbox rule is missing",
);
assert(
  widgetRuntime.widgetRuntime.activationChecklist.some(
    (check) => check.id === "hosted_iframe_urls" && check.status === "external_gate",
  ),
  "widget runtime hosted iframe activation gate is missing",
);
assert(
  widgetRuntime.widgetRuntime.activationChecklist.some(
    (check) => check.id === "voice_exclusion" && check.status === "ready",
  ),
  "widget runtime voice exclusion activation check is missing",
);
assert(
  widgetRuntime.widgetRuntime.renderContracts.length === widgetRuntime.widgetRuntime.totalSurfaces,
  "widget runtime render contract matrix is incomplete",
);
assert(
  widgetRuntime.widgetRuntime.renderContracts.some(
    (contract) =>
      contract.type === "menu-item" &&
      contract.postMessageEvents.includes("menu-item.add-to-cart") &&
      contract.accessibility.includes("iframe title"),
  ),
  "widget runtime menu-item render contract is incomplete",
);
assert(widgetRuntime.widgetRuntime.sessionWidgets.length >= 5, "widget runtime session widget readback is incomplete");
assert(
  widgetRuntime.widgetRuntime.sessionWidgets.every((widget) => widget.status === "semantic_fallback"),
  "widget runtime session widgets must remain semantic fallbacks",
);

const commercialActionGuard = await request("/api/mcp/commercial-action-guard");
assert(commercialActionGuard.commercialActionGuard.score >= 95, "commercial action guard score is below target");
assert(commercialActionGuard.commercialActionGuard.totalLanes === 4, "commercial action guard lanes are incomplete");
assert(commercialActionGuard.commercialActionGuard.readyLanes === 4, "commercial action guard lanes are not ready");
assert(
  commercialActionGuard.commercialActionGuard.totalGuardrails >= 8,
  "commercial action guard guardrails are incomplete",
);
assert(
  commercialActionGuard.commercialActionGuard.readyGuardrails >= 7,
  "commercial action guard ready guardrails are incomplete",
);
assert(
  ["place_food_order", "checkout", "book_table", "place_food_order + book_table"].every((tool) =>
    commercialActionGuard.commercialActionGuard.lanes.some((lane) => lane.actionTool === tool),
  ),
  "commercial action guard action tools are incomplete",
);
assert(
  commercialActionGuard.commercialActionGuard.lanes.every(
    (lane) => lane.confirmationRequired === true && lane.nonIdempotent === true,
  ),
  "commercial action guard must require confirmations on non-idempotent lanes",
);
assert(
  commercialActionGuard.commercialActionGuard.lanes.some(
    (lane) =>
      lane.id === "food_order" &&
      lane.freshReadTool === "get_food_cart" &&
      lane.verificationTool === "get_food_orders",
  ),
  "commercial action guard Food check-then-retry lane is missing",
);
assert(
  commercialActionGuard.commercialActionGuard.lanes.some(
    (lane) => lane.id === "instamart_checkout" && lane.preflightChecks.some((check) => check.includes("Rs 99")),
  ),
  "commercial action guard Instamart minimum-order preflight is missing",
);
assert(
  commercialActionGuard.commercialActionGuard.retryDrills.some(
    (drill) => drill.laneId === "combined_evening" && drill.verificationTool.includes("get_booking_status"),
  ),
  "commercial action guard combined retry drill is missing",
);
assert(
  commercialActionGuard.commercialActionGuard.telemetryContract.some(
    (field) => field.field === "confirmation_id" && field.required === true && field.redaction.includes("opaque"),
  ),
  "commercial action guard confirmation telemetry contract is missing",
);
assert(
  commercialActionGuard.commercialActionGuard.externalGates.some((gate) => gate.includes("staging credentials")),
  "commercial action guard staging credential gate is missing",
);

const proof = await request("/api/reviewer-proof");
assert(proof.proof.score >= 90, "reviewer proof score is below target");
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Traffic Readiness Plan"),
  "reviewer proof traffic readiness artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Builder Intake Command Center"),
  "reviewer proof builder intake artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "FAQ & Policy Center"),
  "reviewer proof FAQ and policy artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Growth Partnership Center"),
  "reviewer proof growth partnership artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Channel & Multimodal Studio"),
  "reviewer proof channel and multimodal artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Visual Dish Capture Center"),
  "reviewer proof visual dish capture artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Voice Commerce Rehearsal Center"),
  "reviewer proof voice commerce artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Quality Loop Center"),
  "reviewer proof quality loop artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Nutrition & Budget Intelligence"),
  "reviewer proof nutrition and budget artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Household Preference Graph"),
  "reviewer proof household preference artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Guest Collaboration & Calendar Center"),
  "reviewer proof guest collaboration artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Luxury Experience Workspace"),
  "reviewer proof luxury experience artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Reviewer Artifact Vault"),
  "reviewer proof artifact vault is missing",
);
assert(
  proof.proof.artifacts.some(
    (artifact) => artifact.label === "Swiggy Access Evidence Matrix" && artifact.path === "/api/swiggy-access-evidence-matrix",
  ),
  "reviewer proof access evidence matrix artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Visual QA Center"),
  "reviewer proof visual QA center is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Widget Runtime Center"),
  "reviewer proof widget runtime artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Commercial Action Guard"),
  "reviewer proof commercial action guard artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "MCP Backpressure Governor"),
  "reviewer proof backpressure governor artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Source Intelligence"),
  "reviewer proof source intelligence artifact is missing",
);
assert(
  proof.proof.artifacts.some(
    (artifact) => artifact.label === "Swiggy Deep Site Map" && artifact.path === "/api/swiggy-deep-site-map",
  ),
  "reviewer proof deep site map artifact is missing",
);
assert(
  proof.proof.artifacts.some(
    (artifact) => artifact.label === "Developer Quickstart Workbench" && artifact.path === "/api/swiggy-developer-quickstart",
  ),
  "reviewer proof developer quickstart artifact is missing",
);
assert(
  proof.proof.artifacts.some(
    (artifact) => artifact.label === "CTA Execution Center" && artifact.path === "/api/swiggy-cta-execution-center",
  ),
  "reviewer proof CTA execution artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Innovation Radar"),
  "reviewer proof innovation radar artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Staging Cutover Rehearsal"),
  "reviewer proof staging cutover artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Staging Credential Drill Center"),
  "reviewer proof staging credential drill artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "SLO Incident Command Center"),
  "reviewer proof SLO incident artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Operating Contract Center"),
  "reviewer proof operating contract artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Data Governance Center"),
  "reviewer proof data governance artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Upstream Watch"),
  "reviewer proof upstream watch artifact is missing",
);
assert(
  proof.proof.artifacts.some(
    (artifact) => artifact.label === "Swiggy Docs Twin Explorer" && artifact.path === "/api/swiggy-docs-twin-explorer",
  ),
  "reviewer proof docs twin explorer artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Premium Concierge Itinerary"),
  "reviewer proof premium concierge artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Tool Contract Matrix"),
  "reviewer proof tool contract matrix artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Scenario Runner"),
  "reviewer proof scenario runner artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "State Orchestrator"),
  "reviewer proof state orchestrator artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Resource & Prompt Studio"),
  "reviewer proof resource and prompt studio artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy OAuth Status"),
  "reviewer proof OAuth status artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Auth Lifecycle Center"),
  "reviewer proof Auth Lifecycle artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Enterprise Delegated Auth Center"),
  "reviewer proof enterprise delegated-auth artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Builders Launch Story Center"),
  "reviewer proof Builders Launch Story artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Enterprise Platform Center"),
  "reviewer proof enterprise platform artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Audit Ledger Center"),
  "reviewer proof audit ledger artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Submission Console"),
  "reviewer proof submission console artifact is missing",
);

const dataGovernance = await request("/api/data-governance-center");
assert(dataGovernance.dataGovernance.score >= 90, "data governance score is below target");
assert(dataGovernance.dataGovernance.dataRole.swiggyRole === "Data Fiduciary", "Swiggy data fiduciary role is missing");
assert(dataGovernance.dataGovernance.dataRole.mealPilotRole === "Data Processor", "MealPilot processor role is missing");
assert(
  dataGovernance.dataGovernance.residency.boundary.includes("India/Singapore"),
  "data governance residency boundary is incomplete",
);
assert(
  ["oauth_token", "support_payload", "telemetry_trace_context"].every((id) =>
    dataGovernance.dataGovernance.dataFlows.some((flow) => flow.id === id),
  ),
  "data governance data-flow inventory is incomplete",
);
assert(
  ["purpose_limitation", "no_training_without_consent", "dsr_routing", "token_redaction", "signed_manifest_watch"].every((id) =>
    dataGovernance.dataGovernance.controls.some((control) => control.id === id),
  ),
  "data governance controls are incomplete",
);
assert(dataGovernance.dataGovernance.retention.swiggyAuditLogDays === 90, "Swiggy audit-log retention is missing");
assert(
  dataGovernance.dataGovernance.retention.compactionEndpoint === "/api/storage/compact",
  "local compaction endpoint is missing from data governance",
);
assert(
  dataGovernance.dataGovernance.securityContacts.some((contact) => contact.contact === "security@swiggy.in"),
  "security contact is missing from data governance",
);
assert(
  dataGovernance.dataGovernance.signedManifestReadiness.targetVersion === "v1.2",
  "signed-manifest watch target is missing",
);
assert(
  dataGovernance.dataGovernance.externalGates.some((gate) => gate.includes("DPA")) &&
    dataGovernance.dataGovernance.externalGates.some((gate) => gate.includes("Signed manifest")),
  "data governance external gates are incomplete",
);

const trafficReadiness = await request("/api/traffic-readiness-plan");
assert(trafficReadiness.trafficReadiness.score >= 90, "traffic readiness score is below target");
assert(trafficReadiness.trafficReadiness.projectedDailyToolCalls > 0, "traffic readiness volume forecast is missing");
assert(trafficReadiness.trafficReadiness.peakQps < 1, "traffic readiness peak QPS should stay under pilot target");
assert(
  ["commercial", "tracking", "support", "auth"].every((lane) =>
    trafficReadiness.trafficReadiness.lanes.some((item) => item.lane === lane),
  ),
  "traffic readiness lane budgets are incomplete",
);
assert(trafficReadiness.trafficReadiness.retryAfterContract.ready, "traffic readiness Retry-After contract is not ready");
assert(
  trafficReadiness.trafficReadiness.retryAfterContract.maxWallClockMs <= 30000,
  "traffic readiness retry budget exceeds Swiggy guidance",
);
assert(
  trafficReadiness.trafficReadiness.notifications.some(
    (item) => item.id === "major_traffic_event" && item.leadTimeDays === 7,
  ),
  "traffic readiness major-event notice is missing",
);
assert(
  trafficReadiness.trafficReadiness.rollout.map((stage) => stage.trafficPercent).join(",") === "1,10,50,100",
  "traffic readiness staged rollout is incomplete",
);
assert(
  trafficReadiness.trafficReadiness.capacityUpgradeEmail.to === "builders@swiggy.in",
  "traffic readiness capacity email target is missing",
);

const backpressureGovernor = await request("/api/mcp/backpressure-governor");
assert(backpressureGovernor.backpressureGovernor.score >= 90, "backpressure governor score is below target");
assert(
  backpressureGovernor.backpressureGovernor.mode === "v1_upstream_shedder",
  "backpressure governor must model current upstream shedder mode",
);
assert(backpressureGovernor.backpressureGovernor.totalBuckets >= 8, "backpressure governor buckets are incomplete");
assert(backpressureGovernor.backpressureGovernor.readyBuckets >= 7, "backpressure governor ready buckets are incomplete");
assert(backpressureGovernor.backpressureGovernor.trackingMinIntervalSeconds === 10, "tracking cadence floor is missing");
assert(backpressureGovernor.backpressureGovernor.maxRetries === 5, "backpressure max retry budget is missing");
assert(backpressureGovernor.backpressureGovernor.maxUserWaitMs <= 30000, "backpressure user wait budget is too high");
assert(
  ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"].every((header) =>
    backpressureGovernor.backpressureGovernor.plannedHeaders.includes(header),
  ),
  "backpressure planned rate-limit headers are incomplete",
);
assert(
  backpressureGovernor.backpressureGovernor.buckets.some(
    (bucket) => bucket.id === "write_tool_bucket" && bucket.plannedLimitPerMinute === 30,
  ),
  "backpressure write bucket is missing",
);
assert(
  backpressureGovernor.backpressureGovernor.buckets.some(
    (bucket) => bucket.id === "tracking_bucket" && bucket.queueDiscipline.includes("10 second"),
  ),
  "backpressure tracking cadence bucket is missing",
);
assert(
  backpressureGovernor.backpressureGovernor.rules.some(
    (rule) => rule.id === "v1_upstream_shedder" && rule.status === "ready",
  ),
  "backpressure current upstream-shedder rule is missing",
);
assert(
  backpressureGovernor.backpressureGovernor.simulations.some(
    (simulation) => simulation.id === "planned_429_retry_after" && simulation.delayMs === 23000,
  ),
  "backpressure Retry-After simulation is missing",
);
assert(
  backpressureGovernor.backpressureGovernor.simulations.some(
    (simulation) => simulation.id === "background_batch_block" && simulation.status === "external_gate",
  ),
  "backpressure background-job gate simulation is missing",
);
assert(
  backpressureGovernor.backpressureGovernor.telemetry.some(
    (field) => field.field === "x_ratelimit_remaining" && field.status === "ready",
  ),
  "backpressure rate-limit telemetry contract is missing",
);
assert(
  backpressureGovernor.backpressureGovernor.capacityEmail.to === "builders@swiggy.in",
  "backpressure capacity email target is missing",
);
assert(
  backpressureGovernor.backpressureGovernor.externalGates.some((gate) => gate.includes("MCP-layer 429")),
  "backpressure future 429 gate is missing",
);

const loadLab = await request("/api/swiggy-load-lab");
assert(loadLab.loadLab.score >= 80, "Load Lab score is below target");
assert(loadLab.loadLab.totals.scenarios === 4, "Load Lab scenarios are incomplete");
assert(loadLab.loadLab.totals.maxPeakQps > 0, "Load Lab peak QPS is missing");
assert(loadLab.loadLab.totals.maxToolCallsPerHour > 0, "Load Lab tool-call rollup is missing");
assert(loadLab.loadLab.totals.retryAfterReady, "Load Lab Retry-After readiness is missing");
assert(
  loadLab.loadLab.officialSources.includes("https://mcp.swiggy.com/builders/llms.txt") &&
    loadLab.loadLab.officialSources.some((source) => source.includes("/docs/operate/rate-limits/")),
  "Load Lab official sources are incomplete",
);
assert(
  loadLab.loadLab.scenarios.some(
    (scenario) =>
      scenario.id === "campaign_launch_spike" &&
      scenario.status === "external_gate" &&
      scenario.projected429sPerHour > 0,
  ),
  "Load Lab campaign spike gate is missing",
);
assert(
  loadLab.loadLab.lanes.some((lane) => lane.id === "background_jobs_disabled" && lane.status === "external_gate"),
  "Load Lab background-job gate is missing",
);
assert(
  loadLab.loadLab.cohortRamp.map((stage) => stage.trafficPercent).join(",") === "1,10,50,100",
  "Load Lab cohort ramp is incomplete",
);
assert(
  ["retry_after_23s", "commercial_single_flight", "tracking_loop_shed"].every((id) =>
    loadLab.loadLab.drills.some((drill) => drill.id === id),
  ),
  "Load Lab load drills are incomplete",
);
assert(
  loadLab.loadLab.operatorActions.some(
    (action) => action.id === "confirm_campaign_capacity" && action.owner === "Swiggy" && action.status === "external_gate",
  ),
  "Load Lab campaign capacity action is missing",
);
assert(
  loadLab.loadLab.assertions.some((assertion) => assertion.includes("Commercial actions stay serialized")),
  "Load Lab commercial serialization assertion is missing",
);

const offerIntelligence = await request("/api/swiggy-offer-intelligence");
assert(offerIntelligence.offerIntelligence.score >= 80, "Offer Intelligence score is below target");
assert(offerIntelligence.offerIntelligence.totals.opportunities >= 3, "Offer Intelligence opportunities are incomplete");
assert(offerIntelligence.offerIntelligence.totals.estimatedSavings > 0, "Offer Intelligence savings rollup is missing");
assert(offerIntelligence.offerIntelligence.totals.officialCouponTools === 2, "Offer Intelligence official Food coupon tools are missing");
assert(
  offerIntelligence.offerIntelligence.officialSources.includes("https://mcp.swiggy.com/builders/llms.txt") &&
    offerIntelligence.offerIntelligence.officialSources.some((source) => source.includes("/reference/food/fetch_food_coupons/")) &&
    offerIntelligence.offerIntelligence.officialSources.some((source) => source.includes("/reference/food/apply_food_coupon/")),
  "Offer Intelligence official sources are incomplete",
);
assert(
  ["food_coupon_discovery", "food_coupon_application", "dineout_offer_discovery", "instamart_value_substitution"].every((id) =>
    offerIntelligence.offerIntelligence.lanes.some((lane) => lane.id === id),
  ),
  "Offer Intelligence lanes are incomplete",
);
assert(
  offerIntelligence.offerIntelligence.opportunities.some(
    (opportunity) => opportunity.server === "food" && opportunity.applyMode === "confirm_then_apply",
  ),
  "Offer Intelligence Food coupon apply gate is missing",
);
assert(
  offerIntelligence.offerIntelligence.guardrails.some(
    (guardrail) => guardrail.id === "coupon_not_order" && guardrail.status === "ready",
  ),
  "Offer Intelligence coupon/order guardrail is missing",
);
assert(
  ["expired_food_coupon", "coupon_changes_cart_total", "dineout_deal_disappears"].every((id) =>
    offerIntelligence.offerIntelligence.drills.some((drill) => drill.id === id),
  ),
  "Offer Intelligence drills are incomplete",
);
assert(
  offerIntelligence.offerIntelligence.assertions.some((assertion) =>
    assertion.includes("fetch_food_coupons before apply_food_coupon"),
  ),
  "Offer Intelligence coupon sequence assertion is missing",
);

const orderLifecycle = await request("/api/swiggy-order-lifecycle");
assert(orderLifecycle.orderLifecycle.score >= 80, "Order Lifecycle score is below target");
assert(orderLifecycle.orderLifecycle.totals.toolsCovered >= 7, "Order Lifecycle status tools are incomplete");
assert(orderLifecycle.orderLifecycle.totals.trackingCadenceSeconds === 10, "Order Lifecycle tracking cadence is missing");
assert(
  orderLifecycle.orderLifecycle.officialSources.includes("https://mcp.swiggy.com/builders/llms.txt") &&
    orderLifecycle.orderLifecycle.officialSources.some((source) => source.includes("/reference/food/get_food_orders/")) &&
    orderLifecycle.orderLifecycle.officialSources.some((source) => source.includes("/reference/instamart/track_order/")) &&
    orderLifecycle.orderLifecycle.officialSources.some((source) => source.includes("/reference/dineout/get_booking_status/")),
  "Order Lifecycle official sources are incomplete",
);
assert(
  ["food_order_lifecycle", "instamart_order_lifecycle", "dineout_booking_lifecycle", "combined_recovery_desk"].every((id) =>
    orderLifecycle.orderLifecycle.lanes.some((lane) => lane.id === id),
  ),
  "Order Lifecycle lanes are incomplete",
);
assert(
  orderLifecycle.orderLifecycle.timelines.some(
    (timeline) =>
      timeline.server === "food" &&
      ["preparing", "awaiting_confirmation"].includes(timeline.state) &&
      ["ready", "watch"].includes(timeline.status),
  ),
  "Order Lifecycle Food timeline is missing",
);
assert(
  ["food_timeout_after_place", "instamart_checkout_uncertain", "dineout_booking_uncertain"].every((id) =>
    orderLifecycle.orderLifecycle.recoveries.some((recovery) => recovery.id === id),
  ),
  "Order Lifecycle recovery drills are incomplete",
);
assert(
  orderLifecycle.orderLifecycle.recoveries.some((recovery) =>
    recovery.blockedRetry.includes("Blind place_food_order retry is blocked"),
  ),
  "Order Lifecycle blind retry block is missing",
);
assert(
  orderLifecycle.orderLifecycle.telemetry.some((field) => field.field === "order_id_hash" && field.status === "ready"),
  "Order Lifecycle telemetry redaction is missing",
);
assert(
  orderLifecycle.orderLifecycle.assertions.some((assertion) => assertion.includes("never blindly retried")),
  "Order Lifecycle non-blind retry assertion is missing",
);

const locationTrust = await request("/api/swiggy-location-trust");
assert(locationTrust.locationTrust.score >= 85, "Location Trust score is below target");
assert(locationTrust.locationTrust.totals.toolsCovered >= 4, "Location Trust address tools are incomplete");
assert(locationTrust.locationTrust.totals.readyControls >= 5, "Location Trust ready controls are incomplete");
assert(
  locationTrust.locationTrust.officialSources.includes("https://mcp.swiggy.com/builders/llms.txt") &&
    locationTrust.locationTrust.officialSources.some((source) => source.includes("/reference/food/get_addresses/")) &&
    locationTrust.locationTrust.officialSources.some((source) => source.includes("/reference/instamart/create_address/")) &&
    locationTrust.locationTrust.officialSources.some((source) => source.includes("/reference/instamart/delete_address/")) &&
    locationTrust.locationTrust.officialSources.some((source) => source.includes("/reference/dineout/get_saved_locations/")),
  "Location Trust official sources are incomplete",
);
assert(
  ["shared_address_read", "instamart_address_create", "instamart_address_delete", "dineout_saved_location"].every((id) =>
    locationTrust.locationTrust.lanes.some((lane) => lane.id === id),
  ),
  "Location Trust lanes are incomplete",
);
assert(
  locationTrust.locationTrust.controls.some((control) => control.id === "raw_address_redaction" && control.status === "ready") &&
    locationTrust.locationTrust.controls.some((control) => control.id === "address_switch_refresh" && control.status === "ready"),
  "Location Trust privacy and switch controls are missing",
);
assert(
  ["delete_saved_address", "temporary_guest_location"].every((id) =>
    locationTrust.locationTrust.scenarios.some((scenario) => scenario.id === id),
  ),
  "Location Trust scenarios are incomplete",
);
assert(
  locationTrust.locationTrust.telemetry.some((field) => field.field === "address_id_hash" && field.status === "ready"),
  "Location Trust telemetry redaction is missing",
);
assert(
  locationTrust.locationTrust.assertions.some((assertion) => assertion.includes("Raw addresses never leave")),
  "Location Trust raw-address assertion is missing",
);
assert(
  locationTrust.locationTrust.externalGates.some((gate) => gate.includes("staging credentials")),
  "Location Trust staging credential gate is missing",
);

const cartMutation = await request("/api/swiggy-cart-mutation-workbench");
assert(cartMutation.cartMutation.score >= 85, "Cart Mutation Workbench score is below target");
assert(cartMutation.cartMutation.totals.toolsCovered >= 8, "Cart Mutation Workbench tools are incomplete");
assert(cartMutation.cartMutation.totals.readbackLanes >= 4, "Cart Mutation Workbench readback lanes are incomplete");
assert(
  cartMutation.cartMutation.officialSources.includes("https://mcp.swiggy.com/builders/llms.txt") &&
    cartMutation.cartMutation.officialSources.some((source) => source.includes("/reference/food/get_food_cart/")) &&
    cartMutation.cartMutation.officialSources.some((source) => source.includes("/reference/food/update_food_cart/")) &&
    cartMutation.cartMutation.officialSources.some((source) => source.includes("/reference/instamart/get_cart/")) &&
    cartMutation.cartMutation.officialSources.some((source) => source.includes("/reference/instamart/update_cart/")) &&
    cartMutation.cartMutation.officialSources.some((source) => source.includes("/reference/dineout/create_cart/")),
  "Cart Mutation Workbench official sources are incomplete",
);
assert(
  ["food_cart_readback", "instamart_replace_cart", "dineout_cart_gate", "cross_server_cart_preflight"].every((id) =>
    cartMutation.cartMutation.lanes.some((lane) => lane.id === id),
  ),
  "Cart Mutation Workbench lanes are incomplete",
);
assert(
  cartMutation.cartMutation.guardrails.some((guardrail) => guardrail.id === "post_mutation_readback" && guardrail.status === "ready") &&
    cartMutation.cartMutation.guardrails.some((guardrail) => guardrail.id === "payment_method_truth" && guardrail.status === "ready"),
  "Cart Mutation Workbench guardrails are missing",
);
assert(
  ["food_customized_quantity", "instamart_address_switch", "cart_uncertain_write"].every((id) =>
    cartMutation.cartMutation.scenarios.some((scenario) => scenario.id === id),
  ),
  "Cart Mutation Workbench scenarios are incomplete",
);
assert(
  cartMutation.cartMutation.telemetry.some((field) => field.field === "cart_id_hash" && field.status === "ready"),
  "Cart Mutation Workbench telemetry redaction is missing",
);
assert(
  cartMutation.cartMutation.assertions.some((assertion) => assertion.includes("update_food_cart is followed by get_food_cart")),
  "Cart Mutation Workbench readback assertion is missing",
);

const discoveryFreshness = await request("/api/swiggy-discovery-freshness");
assert(discoveryFreshness.discoveryFreshness.score >= 85, "Discovery Freshness score is below target");
assert(discoveryFreshness.discoveryFreshness.totals.toolsCovered >= 8, "Discovery Freshness tools are incomplete");
assert(discoveryFreshness.discoveryFreshness.totals.readyControls === 5, "Discovery Freshness controls are incomplete");
assert(
  discoveryFreshness.discoveryFreshness.officialSources.includes("https://mcp.swiggy.com/builders/llms.txt") &&
    discoveryFreshness.discoveryFreshness.officialSources.some((source) => source.includes("/reference/food/search_restaurants/")) &&
    discoveryFreshness.discoveryFreshness.officialSources.some((source) => source.includes("/reference/food/search_menu/")) &&
    discoveryFreshness.discoveryFreshness.officialSources.some((source) => source.includes("/reference/instamart/search_products/")) &&
    discoveryFreshness.discoveryFreshness.officialSources.some((source) => source.includes("/reference/instamart/your_go_to_items/")) &&
    discoveryFreshness.discoveryFreshness.officialSources.some((source) => source.includes("/reference/dineout/get_available_slots/")),
  "Discovery Freshness official sources are incomplete",
);
assert(
  ["food_menu_detail", "instamart_product_search", "dineout_search_and_details", "dineout_slot_freshness"].every((id) =>
    discoveryFreshness.discoveryFreshness.lanes.some((lane) => lane.id === id),
  ),
  "Discovery Freshness lanes are incomplete",
);
assert(
  discoveryFreshness.discoveryFreshness.controls.some((control) => control.id === "variant_truth" && control.status === "ready") &&
    discoveryFreshness.discoveryFreshness.controls.some((control) => control.id === "coordinate_consistency" && control.status === "ready"),
  "Discovery Freshness controls are missing",
);
assert(
  ["food_more_menu_options", "instamart_variant_choice", "dineout_slot_selection"].every((id) =>
    discoveryFreshness.discoveryFreshness.scenarios.some((scenario) => scenario.id === id),
  ),
  "Discovery Freshness scenarios are incomplete",
);
assert(
  discoveryFreshness.discoveryFreshness.telemetry.some((field) => field.field === "result_id_hash" && field.status === "ready"),
  "Discovery Freshness telemetry redaction is missing",
);
assert(
  discoveryFreshness.discoveryFreshness.assertions.some((assertion) => assertion.includes("search_menu before update_food_cart")),
  "Discovery Freshness menu-to-cart assertion is missing",
);

const confirmationCommand = await request("/api/swiggy-confirmation-command-center");
assert(
  Object.keys(confirmationCommand).join(",") === "confirmationCommandCenter",
  "Confirmation Command Center response shape is incorrect",
);
assert(confirmationCommand.confirmationCommandCenter.score >= 90, "Confirmation Command Center score is below target");
assert(
  confirmationCommand.confirmationCommandCenter.totals.protectedActions >= 3,
  "Confirmation Command Center protected actions are incomplete",
);
assert(
  confirmationCommand.confirmationCommandCenter.totals.toolsCovered >= 10,
  "Confirmation Command Center tool coverage is incomplete",
);
assert(
  confirmationCommand.confirmationCommandCenter.totals.externalGates >= 1,
  "Confirmation Command Center external gates are missing",
);
assert(
  ["place_food_order", "checkout", "book_table"].every((tool) =>
    JSON.stringify(confirmationCommand.confirmationCommandCenter.lanes).includes(tool),
  ),
  "Confirmation Command Center protected lanes are incomplete",
);
assert(
  JSON.stringify(confirmationCommand.confirmationCommandCenter.checklist).toLowerCase().includes("separate confirmations") &&
    JSON.stringify(confirmationCommand.confirmationCommandCenter.checklist).toLowerCase().includes("post-action status probe"),
  "Confirmation Command Center checklist is incomplete",
);
assert(
  confirmationCommand.confirmationCommandCenter.assertions.some((assertion) => assertion.includes("fresh read")) &&
    confirmationCommand.confirmationCommandCenter.assertions.some((assertion) => assertion.includes("separate confirmations")),
  "Confirmation Command Center assertions are incomplete",
);

const cancellationCare = await request("/api/swiggy-cancellation-care-center");
assert(
  Object.keys(cancellationCare).join(",") === "cancellationCareCenter",
  "Cancellation and Care Center response shape is incorrect",
);
assert(cancellationCare.cancellationCareCenter.score >= 90, "Cancellation and Care Center score is below target");
assert(cancellationCare.cancellationCareCenter.customerCarePhone === "080-67466729", "customer care phone is missing");
assert(cancellationCare.cancellationCareCenter.totals.reportErrorTools === 3, "report_error tool coverage is incomplete");
assert(
  cancellationCare.cancellationCareCenter.totals.noToolCancellationGuards >= 2,
  "no-tool cancellation guards are incomplete",
);
assert(
  ["food_cancel_request", "instamart_cancel_request", "dineout_booking_management"].every((id) =>
    cancellationCare.cancellationCareCenter.lanes.some((lane) => lane.id === id),
  ),
  "Cancellation and Care lanes are incomplete",
);
assert(
  JSON.stringify(cancellationCare.cancellationCareCenter.controls).toLowerCase().includes("no-tool cancellation") &&
    JSON.stringify(cancellationCare.cancellationCareCenter.lanes).includes("report_error"),
  "Cancellation and Care controls are incomplete",
);
assert(
  cancellationCare.cancellationCareCenter.assertions.some((assertion) =>
    assertion.includes("never call an MCP cancellation tool"),
  ),
  "Cancellation and Care cancellation assertion is missing",
);

const dineoutPrecision = await request("/api/swiggy-dineout-precision-center");
assert(
  Object.keys(dineoutPrecision).join(",") === "dineoutPrecisionCenter",
  "Dineout Precision Center response shape is incorrect",
);
assert(dineoutPrecision.dineoutPrecisionCenter.score >= 90, "Dineout Precision Center score is below target");
assert(dineoutPrecision.dineoutPrecisionCenter.totals.toolsCovered >= 7, "Dineout Precision tool coverage is incomplete");
assert(dineoutPrecision.dineoutPrecisionCenter.totals.freeBookingGuards >= 1, "Dineout free-booking guard is missing");
assert(dineoutPrecision.dineoutPrecisionCenter.totals.billPaymentLanes >= 1, "Dineout bill-payment lane is missing");
assert(
  ["free_reservation_direct_booking", "bill_payment_cart", "paid_deal_rejection", "post_booking_status"].every((id) =>
    dineoutPrecision.dineoutPrecisionCenter.lanes.some((lane) => lane.id === id),
  ),
  "Dineout Precision lanes are incomplete",
);
assert(
  JSON.stringify(dineoutPrecision.dineoutPrecisionCenter.guards).includes("isFree=true") &&
    dineoutPrecision.dineoutPrecisionCenter.lanes.some(
      (lane) => lane.id === "bill_payment_cart" && lane.cartType === "DINEOUT" && lane.requiredFields.includes("billAmount"),
    ),
  "Dineout Precision guardrails are incomplete",
);
assert(
  dineoutPrecision.dineoutPrecisionCenter.assertions.some((assertion) =>
    assertion.includes("free reservation booking from Dineout bill-payment cart creation"),
  ),
  "Dineout Precision assertions are incomplete",
);

const sloIncident = await request("/api/slo-incident-command");
assert(sloIncident.sloIncident.score >= 90, "SLO incident command score is below target");
assert(
  ["production_mcp", "oauth", "staging"].every((id) =>
    sloIncident.sloIncident.uptimeTargets.some((target) => target.id === id),
  ),
  "SLO incident uptime targets are incomplete",
);
assert(
  sloIncident.sloIncident.uptimeTargets.some((target) => target.target.includes("99.9%")),
  "SLO incident 99.9 uptime target is missing",
);
assert(
  ["read_tools", "write_tools", "commercial_actions"].every((id) =>
    sloIncident.sloIncident.latencyTargets.some((target) => target.id === id),
  ),
  "SLO incident latency targets are incomplete",
);
assert(
  sloIncident.sloIncident.incidentComms.map((item) => item.severity).join(",") === "S0,S1,S2,S3",
  "SLO incident severity ladder is incomplete",
);
assert(sloIncident.sloIncident.maintenance.noticeHours === 72, "SLO incident maintenance notice is missing");
assert(
  sloIncident.sloIncident.maintenance.blackoutWindowsIst.includes("12:00-14:00") &&
    sloIncident.sloIncident.maintenance.blackoutWindowsIst.includes("19:00-22:00"),
  "SLO incident maintenance blackout windows are incomplete",
);
assert(sloIncident.sloIncident.statusPage.url.includes("status.swiggy.com/mcp"), "SLO incident status page gate is missing");
assert(sloIncident.sloIncident.remediation.contact === "builders@swiggy.in", "SLO incident remediation contact is missing");

const resilience = await request("/api/resilience");
assert(resilience.drills.length >= 5, "resilience drills are incomplete");
assert(
  resilience.drills.some((drill) => drill.id === "non_idempotent_check_then_retry"),
  "non-idempotent recovery drill is missing",
);
assert(resilience.runbook.nonBlindRetryTools.includes("place_food_order"), "order retry runbook is missing");
assert(resilience.runbook.score >= 90, "resilience drill score is below target");

const observability = await request("/api/observability/traces");
assert(observability.observability.score >= 90, "observability trace score is below target");
assert(observability.observability.traces.length >= 1, "observability traces are missing");
assert(
  observability.observability.logContract.redactedFields.includes("access_token"),
  "observability redaction contract is missing",
);

const runtimeTelemetry = await request("/api/telemetry/runtime");
assert(runtimeTelemetry.telemetry.score >= 80, "runtime telemetry score is below target");
assert(runtimeTelemetry.telemetry.events.length >= 5, "runtime telemetry events are missing");
assert(
  runtimeTelemetry.telemetry.events.some((event) => event.event === "mcp_tool_call"),
  "runtime telemetry MCP event is missing",
);
assert(
  runtimeTelemetry.telemetry.redactionContract.redactedFields.includes("access_token"),
  "runtime telemetry redaction contract is missing",
);
assert(
  runtimeTelemetry.telemetry.supportReady.sessionIds.includes(sessionId),
  "runtime telemetry session correlation is missing",
);

const auditLedger = await request("/api/audit-ledger");
assert(auditLedger.auditLedger.score >= 85, "audit ledger score is below target");
assert(auditLedger.auditLedger.totalEvents >= 9, "audit ledger events are missing");
assert(
  ["food", "instamart", "dineout"].every((server) => auditLedger.auditLedger.coveredServers.includes(server)),
  "audit ledger server coverage is incomplete",
);
assert(
  auditLedger.auditLedger.supportReadyEvents === auditLedger.auditLedger.totalEvents,
  "audit ledger support correlations are incomplete",
);
assert(auditLedger.auditLedger.retention.swiggyAuditLogDays === 90, "audit ledger Swiggy retention posture is missing");
assert(
  auditLedger.auditLedger.retention.localCompactionEndpoint === "/api/storage/compact",
  "audit ledger local compaction endpoint is missing",
);
assert(auditLedger.auditLedger.redaction.piiFree, "audit ledger must be redacted");
assert(
  ["access_token", "payment_credentials", "raw_address"].every((field) =>
    auditLedger.auditLedger.redaction.redactedFields.includes(field),
  ),
  "audit ledger redaction fields are incomplete",
);
assert(
  auditLedger.auditLedger.controls.some((control) => control.id === "support_correlation" && control.status === "ready"),
  "audit ledger support correlation control is missing",
);
assert(
  auditLedger.auditLedger.dsrRouting.some((item) => item.owner === "Swiggy" && item.status === "external_gate"),
  "audit ledger Swiggy-originated DSR gate is missing",
);
assert(auditLedger.auditLedger.supportPackage.to === "builders@swiggy.in", "audit ledger support package contact is missing");

const routeOptimizer = await request("/api/swiggy-route-optimizer");
assert(routeOptimizer.routeOptimizer.score >= 90, "route optimizer score is below target");
assert(routeOptimizer.routeOptimizer.totalSavedCalls > 0, "route optimizer call savings are missing");
assert(routeOptimizer.routeOptimizer.journeys.length >= 3, "route optimizer journeys are incomplete");
assert(
  routeOptimizer.routeOptimizer.officialSources.includes("https://mcp.swiggy.com/builders/llms.txt") &&
    routeOptimizer.routeOptimizer.officialSources.some((source) => source.includes("/docs/build/recipes/order-food/")),
  "route optimizer official sources are incomplete",
);
const routeTotals = routeOptimizer.routeOptimizer.journeys.reduce(
  (totals, journey) => ({
    baselineCalls: totals.baselineCalls + journey.baselineCalls,
    optimizedCalls: totals.optimizedCalls + journey.optimizedCalls,
    savedCalls: totals.savedCalls + journey.savedCalls,
    commercialGates:
      totals.commercialGates + journey.steps.filter((step) => step.toolClass === "commercial_action").length,
  }),
  { baselineCalls: 0, optimizedCalls: 0, savedCalls: 0, commercialGates: 0 },
);
assert(routeOptimizer.routeOptimizer.totals.baselineCalls === routeTotals.baselineCalls, "route optimizer baseline rollup is inconsistent");
assert(routeOptimizer.routeOptimizer.totals.optimizedCalls === routeTotals.optimizedCalls, "route optimizer optimized rollup is inconsistent");
assert(routeOptimizer.routeOptimizer.totals.savedCalls === routeOptimizer.routeOptimizer.totalSavedCalls, "route optimizer saved-call total is inconsistent");
assert(routeOptimizer.routeOptimizer.totals.savedCalls === routeTotals.savedCalls, "route optimizer journey savings rollup is inconsistent");
assert(routeOptimizer.routeOptimizer.totals.commercialGates === routeTotals.commercialGates, "route optimizer commercial gate rollup is inconsistent");
assert(routeOptimizer.routeOptimizer.profiles.length >= 4, "route optimizer profiles are incomplete");
assert(
  routeOptimizer.routeOptimizer.profiles.some((profile) => profile.id === "express_parallel_discovery" && profile.savedCalls >= 6),
  "route optimizer express parallel profile is missing",
);
assert(routeOptimizer.routeOptimizer.parallelBatches.length >= 5, "route optimizer parallel batches are incomplete");
const parallelToolCount = routeOptimizer.routeOptimizer.parallelBatches
  .filter((batch) => batch.parallel)
  .reduce((sum, batch) => sum + batch.tools.length, 0);
assert(
  routeOptimizer.routeOptimizer.totals.parallelizableSteps === parallelToolCount,
  "route optimizer parallelizable count must come from explicit parallel batches",
);
assert(
  !routeOptimizer.routeOptimizer.parallelBatches
    .filter((batch) => batch.parallel)
    .flatMap((batch) => batch.tools)
    .some((tool) => ["place_food_order", "checkout", "book_table"].includes(tool.tool)),
  "route optimizer must not put commercial actions in parallel batches",
);
assert(routeOptimizer.routeOptimizer.crossServerHandoffs.length >= 4, "route optimizer cross-server handoffs are incomplete");
assert(
  routeOptimizer.routeOptimizer.crossServerHandoffs.some(
    (handoff) => handoff.id === "support_context_all_servers" && handoff.redactionRule.includes("bearer token"),
  ),
  "route optimizer support redaction handoff is missing",
);
assert(
  routeOptimizer.routeOptimizer.assertions.some((assertion) => assertion.includes("Independent Food")),
  "route optimizer assertions are incomplete",
);

const supportBridge = await request(`/api/support/bridge?${new URLSearchParams({ sessionId }).toString()}`);
assert(supportBridge.supportBridge.score >= 95, "support bridge score is below target");
assert(supportBridge.supportBridge.reportErrorTools.length === 3, "support bridge must cover three MCP servers");
assert(
  supportBridge.supportBridge.reportErrorTools.every((report) => report.request.params.name === "report_error"),
  "support bridge report_error tool requests are incomplete",
);
assert(
  supportBridge.supportBridge.reportErrorTools.some(
    (report) => report.server === "instamart" && report.request.params.arguments.domain === "im",
  ),
  "support bridge Instamart domain mapping is missing",
);
assert(
  supportBridge.supportBridge.redactionRules.some((rule) => rule.includes("access tokens")),
  "support bridge redaction rules are missing",
);
assert(supportBridge.supportBridge.incidentEmail.to === "builders@swiggy.in", "support bridge email target is missing");

const errorIntelligence = await request("/api/error-intelligence");
assert(errorIntelligence.errorIntelligence.score >= 95, "error intelligence score is below target");
assert(
  errorIntelligence.errorIntelligence.buckets.some((bucket) => bucket.id === "domain_failure"),
  "error intelligence domain failure bucket is missing",
);
assert(
  errorIntelligence.errorIntelligence.plannedCoreCodes.some((code) => code.code === "UPSTREAM_TIMEOUT"),
  "error intelligence planned code registry is incomplete",
);
assert(
  errorIntelligence.errorIntelligence.domainCodes.some((code) => code.code === "SLOT_UNAVAILABLE"),
  "error intelligence Dineout domain codes are missing",
);
assert(
  errorIntelligence.errorIntelligence.retryPolicy.nonBlindRetryTools.includes("book_table"),
  "error intelligence non-blind retry policy is missing",
);

const evaluation = await request("/api/evaluation-lab");
assert(evaluation.evaluation.scenarios.length >= 4, "evaluation scenarios are incomplete");
assert(evaluation.evaluation.score >= 90, "evaluation score is below target");
assert(evaluation.evaluation.blockedCount === 0, "evaluation lab has blocked scenarios");
assert(
  evaluation.evaluation.scenarios.some((scenario) => scenario.surface === "voice"),
  "voice evaluation scenario is missing",
);

const submission = await request("/api/submission-package");
assert(submission.package.fields.length >= 10, "submission package is incomplete");

const submissionConsole = await request("/api/submission-console");
assert(submissionConsole.submissionConsole.score >= 75, "submission console score is below target");
assert(submissionConsole.submissionConsole.recommendedTrack === "developer", "submission console developer track is missing");
assert(
  submissionConsole.submissionConsole.formTargets.some((target) => target.id === "developer") &&
    submissionConsole.submissionConsole.formTargets.some((target) => target.id === "enterprise" && target.status === "external_gate"),
  "submission console form targets are incomplete",
);
assert(submissionConsole.submissionConsole.totalRequirements === 12, "submission console official requirement coverage is incomplete");
assert(submissionConsole.submissionConsole.readyRequirements >= 6, "submission console ready requirement coverage is too low");
assert(submissionConsole.submissionConsole.operatorRequirements >= 4, "submission console operator requirement gates are incomplete");
assert(
  ["who_you_are", "redirect_uris", "static_ip_ranges", "security_contact", "terms_acknowledgement", "expected_traffic"].every((id) =>
    submissionConsole.submissionConsole.requirements.some((requirement) => requirement.id === id),
  ),
  "submission console official requirement dossier is incomplete",
);
assert(
  submissionConsole.submissionConsole.requirements.some(
    (requirement) =>
      requirement.id === "terms_acknowledgement" &&
      requirement.completionGate === "operator_input" &&
      requirement.nextAction.includes("tick"),
  ),
  "submission console terms acknowledgement gate is incomplete",
);
assert(submissionConsole.submissionConsole.totalFields >= 10, "submission console field coverage is incomplete");
assert(submissionConsole.submissionConsole.readyFields >= 5, "submission console ready fields are too low");
assert(
  ["redirect_uris", "static_ip_ranges", "security_contact", "terms_acknowledgement"].every((id) =>
    submissionConsole.submissionConsole.fields.some((field) => field.id === id),
  ),
  "submission console official fields are incomplete",
);
assert(
  ["builder_packet", "launch_bundle", "access_dossier", "demo_video", "sandbox_credential_workbench", "audit_ledger"].every((id) =>
    submissionConsole.submissionConsole.attachments.some((attachment) => attachment.id === id),
  ),
  "submission console attachment pack is incomplete",
);
assert(submissionConsole.submissionConsole.packetOrder.length >= 10, "submission console packet order is incomplete");
assert(
  ["field_values", "submit_developer_form", "send_handoff_email", "await_staging_credentials"].every((id) =>
    submissionConsole.submissionConsole.packetOrder.some((item) => item.id === id),
  ),
  "submission console packet order critical steps are missing",
);
assert(
  submissionConsole.submissionConsole.packetOrder.some(
    (item) =>
      item.id === "submit_developer_form" &&
      item.path === "https://mcp.swiggy.com/builders/access/" &&
      item.status === "operator_input",
  ),
  "submission console official form packet step is incomplete",
);
assert(
  submissionConsole.submissionConsole.runbook.some(
    (step) => step.id === "await_staging_credentials" && step.owner === "Swiggy" && step.status === "external_gate",
  ),
  "submission console staging credential gate is missing",
);
assert(
  submissionConsole.submissionConsole.outboundDrafts.some((draft) => draft.to === "builders@swiggy.in"),
  "submission console handoff draft is missing",
);
assert(
  submissionConsole.submissionConsole.externalGates.some((gate) => gate.includes("Google Form")),
  "submission console official form gate is missing",
);

const accessSubmissionStudio = await request("/api/access-submission-studio");
assert(accessSubmissionStudio.accessSubmissionStudio.score >= 75, "access submission studio score is below target");
assert(accessSubmissionStudio.accessSubmissionStudio.recommendedTrack === "developer", "access submission studio developer track is missing");
assert(accessSubmissionStudio.accessSubmissionStudio.canSubmitNow === false, "access submission studio must not claim local auto-submit readiness");
assert(
  accessSubmissionStudio.accessSubmissionStudio.officialSources.includes("https://mcp.swiggy.com/builders/") &&
    accessSubmissionStudio.accessSubmissionStudio.officialSources.includes("https://mcp.swiggy.com/builders/access/"),
  "access submission studio official sources are incomplete",
);
assert(
  ["start_building", "request_access", "send_demo"].every((id) =>
    accessSubmissionStudio.accessSubmissionStudio.officialTargets.some((target) => target.id === id),
  ),
  "access submission studio official CTA targets are incomplete",
);
assert(
  accessSubmissionStudio.accessSubmissionStudio.officialTargets.some(
    (target) =>
      target.id === "request_access" &&
      target.cta === "Request access" &&
      target.url === "https://mcp.swiggy.com/builders/access/" &&
      target.status === "operator_input",
  ),
  "access submission studio request-access target is incomplete",
);
assert(
  ["track", "redirect_uris", "security_contact", "handoff_email_subject"].every((id) =>
    accessSubmissionStudio.accessSubmissionStudio.copyBlocks.some((block) => block.id === id),
  ),
  "access submission studio copy blocks are incomplete",
);
assert(
  ["builder_packet", "sandbox_credential_workbench", "staging_transcript", "demo_video"].every((id) =>
    accessSubmissionStudio.accessSubmissionStudio.attachmentChecklist.some((attachment) => attachment.id === id),
  ),
  "access submission studio attachment checklist is incomplete",
);
assert(
  ["run_verifiers", "record_demo", "submit_access_form", "send_handoff", "await_credentials"].every((id) =>
    accessSubmissionStudio.accessSubmissionStudio.browserRunbook.some((step) => step.id === id),
  ),
  "access submission studio browser runbook is incomplete",
);
assert(
  accessSubmissionStudio.accessSubmissionStudio.mailto.to === "builders@swiggy.in" &&
    accessSubmissionStudio.accessSubmissionStudio.mailto.href.startsWith("mailto:"),
  "access submission studio builders mailto is incomplete",
);
assert(
  accessSubmissionStudio.accessSubmissionStudio.totals.readyRequiredAttachments >= 8 &&
    accessSubmissionStudio.accessSubmissionStudio.totals.operatorBlocks >= 1,
  "access submission studio readiness totals are incomplete",
);
assert(
  accessSubmissionStudio.accessSubmissionStudio.externalGates.some((gate) => gate.includes("official Swiggy access form")) &&
    accessSubmissionStudio.accessSubmissionStudio.assertions.some((assertion) => assertion.includes("never auto-submits")),
  "access submission studio external-gate assertions are incomplete",
);

const savedAccessSubmissionStudio = await request("/api/access-submission-studio/state", {
  method: "PATCH",
  body: JSON.stringify({
    demoVideoUrl: "https://loom.com/share/mealpilot-demo",
    technicalContactEmail: "eng@example.com",
    productionRedirectUri: "https://mealpilot.example.com/auth/swiggy/callback",
    staticEgressIp: "203.0.113.10/32",
    environmentSummary: "Production HTTPS web service with secret environment variables and redacted logs.",
    termsAcknowledged: true,
  }),
});
assert(savedAccessSubmissionStudio.accessSubmissionStudio.canSubmitNow, "access submission handoff state did not become locally submit-ready");
assert(
  savedAccessSubmissionStudio.accessSubmissionStudio.handoffState.demoVideoUrl ===
    "https://loom.com/share/mealpilot-demo",
  "access submission demo URL was not saved",
);
assert(
  savedAccessSubmissionStudio.accessSubmissionStudio.copyBlocks.some(
    (block) => block.id === "security_contact" && block.status === "ready" && block.value === "eng@example.com",
  ) &&
    savedAccessSubmissionStudio.accessSubmissionStudio.copyBlocks.some(
      (block) =>
        block.id === "redirect_uris" &&
        block.status === "ready" &&
        block.value === "https://mealpilot.example.com/auth/swiggy/callback",
    ),
  "access submission saved copy blocks are incomplete",
);
assert(
  savedAccessSubmissionStudio.accessSubmissionStudio.attachmentChecklist.some(
    (attachment) =>
      attachment.id === "demo_video" &&
      attachment.status === "ready" &&
      attachment.path === "https://loom.com/share/mealpilot-demo",
  ),
  "access submission saved demo attachment is incomplete",
);

const builderPacket = await request("/api/builder-packet-export");
assert(builderPacket.packet.score >= 85, "builder packet export score is below target");
assert(builderPacket.packet.recommendedTrack === "developer", "builder packet export recommended track is wrong");
assert(builderPacket.packet.outputDirectory === "artifacts/builder-packet", "builder packet output directory is missing");
assert(builderPacket.packet.totals.formFields >= 10, "builder packet form-field coverage is incomplete");
assert(builderPacket.packet.totals.requiredAttachments >= 10, "builder packet attachment coverage is incomplete");
assert(builderPacket.packet.totals.launchArtifacts >= 50, "builder packet launch artifact coverage is incomplete");
assert(builderPacket.packet.totals.visualTargets === 31, "builder packet visual target coverage is incomplete");
assert(
  ["packet_json", "packet_markdown", "visual_report", "production_summary"].every((id) =>
    builderPacket.packet.files.some((file) => file.id === id),
  ),
  "builder packet export files are incomplete",
);
assert(
  builderPacket.packet.commands.some(
    (command) => command.id === "packet_export" && command.command.includes("npm run export:builder-packet"),
  ),
  "builder packet export command is missing",
);
assert(
  builderPacket.packet.commands.some((command) => command.id === "visual_capture" && command.proves.includes("31")),
  "builder packet visual capture command is stale",
);
assert(
  builderPacket.packet.copyBlocks.formFields.includes("Redirect URI(s)") &&
    builderPacket.packet.copyBlocks.attachments.includes("Production Launch Bundle") &&
    builderPacket.packet.copyBlocks.handoffEmail.to === "builders@swiggy.in",
  "builder packet copy blocks are incomplete",
);
assert(
  builderPacket.packet.readiness.some((item) => item.id === "demo_video" && item.status === "operator_input") &&
    builderPacket.packet.readiness.some((item) => item.id === "staging_credentials" && item.status === "external_gate"),
  "builder packet readiness gates are incomplete",
);
assert(
  builderPacket.packet.externalGates.some((gate) => gate.includes("Google Form")) &&
    builderPacket.packet.assertions.some((assertion) => assertion.includes("outside git")),
  "builder packet external gate or assertion is missing",
);

const launchBundle = await request("/api/production-launch-bundle");
assert(launchBundle.launchBundle.score >= 70, "launch bundle score is below target");
assert(launchBundle.launchBundle.requestedServers.length === 3, "launch bundle server coverage is incomplete");
assert(launchBundle.launchBundle.artifacts.length >= 10, "launch bundle artifact set is incomplete");
assert(
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "MCP Tool Lab") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Runtime Telemetry") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Audit Ledger Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Submission Console") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Website Atlas") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Deep Site Map") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Developer Quickstart Workbench") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "CTA Execution Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Builder Intake Command Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "FAQ & Policy Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Growth Partnership Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Channel & Multimodal Studio") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Visual Dish Capture Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Voice Commerce Rehearsal Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Quality Loop Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Nutrition & Budget Intelligence") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Household Preference Graph") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Guest Collaboration & Calendar Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Luxury Experience Workspace") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Reviewer Artifact Vault") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Access Evidence Matrix") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Visual QA Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Builders Launch Story Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Operating Contract Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Docs Coverage") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Docs Twin Explorer") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Upstream Watch") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Source Intelligence") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Innovation Radar") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "AI Client Connect Kit") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Brand Compliance Kit") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Data Governance Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy OAuth Status") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Auth Lifecycle Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Sandbox Credential Workbench") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Enterprise Delegated Auth Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Enterprise Platform Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Traffic Readiness Plan") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "MCP Backpressure Governor") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Load Lab") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Offer Intelligence") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Order Lifecycle") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Confirmation Command Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Cancellation & Care Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Dineout Precision Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "SLO Incident Command Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Journey Compiler") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Access Dossier") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Premium Use Case Studio") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Premium Concierge Itinerary") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Tool Contract Matrix") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Scenario Runner") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "State Orchestrator") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Resource & Prompt Studio") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Widget Runtime Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Commercial Action Guard") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Staging Cutover Rehearsal") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Staging Credential Drill Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Live Signal Calibration Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Staging Certification Matrix") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Staging Transcript Export"),
  "launch bundle proof artifacts are incomplete",
);
assert(
  launchBundle.launchBundle.goLiveGates.some((gate) => gate.status === "external_gate"),
  "launch bundle must preserve external Swiggy gates",
);
assert(
  launchBundle.launchBundle.goLiveGates.some((gate) => gate.label.includes("Data governance")),
  "launch bundle data governance go-live gate is missing",
);
assert(
  launchBundle.launchBundle.goLiveGates.some(
    (gate) => gate.label.includes("delegated-auth") && gate.status === "external_gate",
  ),
  "launch bundle enterprise delegated-auth gate is missing",
);
assert(
  launchBundle.launchBundle.commands.some((command) => command.command.includes("npm run verify:production")),
  "launch bundle verifier command is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/enterprise-delegated-auth"),
  "launch bundle delegated-auth handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/auth/swiggy/status"),
  "launch bundle OAuth status handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-auth-lifecycle-center"),
  "launch bundle Auth Lifecycle handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-builders-launch-story"),
  "launch bundle Builders Launch Story handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-operating-contract-center"),
  "launch bundle operating contract handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/enterprise-platform-center"),
  "launch bundle enterprise platform handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/sandbox-credential-workbench"),
  "launch bundle sandbox credential handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-staging-credential-drill"),
  "launch bundle staging credential drill handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-live-signal-calibration"),
  "launch bundle live signal calibration handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-builder-intake"),
  "launch bundle builder intake handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-faq-policy"),
  "launch bundle FAQ and policy handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-growth-partnership"),
  "launch bundle growth partnership handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/channel-multimodal-studio"),
  "launch bundle channel and multimodal handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-visual-dish-capture"),
  "launch bundle visual dish capture handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-voice-commerce-center"),
  "launch bundle voice commerce handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-quality-loop-center"),
  "launch bundle quality loop handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/nutrition-budget-intelligence"),
  "launch bundle nutrition and budget handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/household-preference-graph"),
  "launch bundle household preference handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/guest-collaboration-calendar"),
  "launch bundle guest collaboration handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/luxury-experience-workspace"),
  "launch bundle luxury experience handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/reviewer-artifact-vault"),
  "launch bundle reviewer artifact vault handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-access-evidence-matrix"),
  "launch bundle access evidence matrix handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/visual-qa-center"),
  "launch bundle visual QA handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/submission-console"),
  "launch bundle submission console handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-docs-twin-explorer"),
  "launch bundle docs twin handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-upstream-watch"),
  "launch bundle upstream watch handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-source-intelligence"),
  "launch bundle source intelligence handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-deep-site-map"),
  "launch bundle deep site map handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-developer-quickstart"),
  "launch bundle developer quickstart handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-cta-execution-center"),
  "launch bundle CTA execution handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-innovation-radar"),
  "launch bundle innovation radar handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/premium-concierge-itinerary"),
  "launch bundle premium concierge handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/mcp/tool-contract-matrix"),
  "launch bundle tool contract matrix handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/mcp/scenario-runner"),
  "launch bundle scenario runner handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/mcp/state-orchestrator"),
  "launch bundle state orchestrator handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/mcp/resource-prompt-studio"),
  "launch bundle resource and prompt studio handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/mcp/widget-runtime"),
  "launch bundle widget runtime handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/mcp/commercial-action-guard"),
  "launch bundle commercial action guard handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/mcp/backpressure-governor"),
  "launch bundle backpressure governor handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-load-lab"),
  "launch bundle Load Lab handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-offer-intelligence"),
  "launch bundle Offer Intelligence handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-order-lifecycle"),
  "launch bundle Order Lifecycle handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-location-trust"),
  "launch bundle Location Trust handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-cart-mutation-workbench"),
  "launch bundle Cart Mutation Workbench handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-discovery-freshness"),
  "launch bundle Discovery Freshness handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-confirmation-command-center"),
  "launch bundle Confirmation Command Center handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-cancellation-care-center"),
  "launch bundle Cancellation and Care handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/swiggy-dineout-precision-center"),
  "launch bundle Dineout Precision handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/mcp/staging-cutover"),
  "launch bundle staging cutover handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/audit-ledger"),
  "launch bundle audit ledger handoff link is missing",
);
assert(launchBundle.launchBundle.handoffEmail.to === "builders@swiggy.in", "launch bundle handoff email is missing");

const snapshot = await request("/api/storage/export");
assert(snapshot.snapshot.version === 1, "storage snapshot is missing version");

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      sessionId,
      mcpResources: mcpResources.result.resources.length,
      mcpPrompts: mcpPrompts.result.prompts.length,
      toolCoverage: `${catalog.demoReady + catalog.guarded}/${catalog.totalTools}`,
      websiteAtlasScore: websiteAtlas.atlas.score,
      websiteAtlasPages: websiteAtlas.atlas.pagesCovered,
      websiteAtlasModules: websiteAtlas.atlas.modulesCovered,
      websiteAtlasCtas: websiteAtlas.atlas.ctasCovered,
      websiteAtlasCrawlPages: websiteAtlas.atlas.liveCrawlPages,
      websiteAtlasCrawlSignals: websiteAtlas.atlas.liveCrawlSignals,
      buildersLaunchStoryScore: launchStory.launchStory.score,
      buildersLaunchStoryAssets: launchStory.launchStory.totals.showcaseAssets,
      buildersLaunchStoryCtas: launchStory.launchStory.totals.ctaPaths,
      operatingContractScore: operatingContract.operatingContract.score,
      operatingContractPillars: operatingContract.operatingContract.totals.pillars,
      operatingContractRunbooks: operatingContract.operatingContract.totals.runbooks,
      builderIntakeScore: builderIntake.intake.score,
      builderIntakeCtas: `${builderIntake.intake.readyCtas}/${builderIntake.intake.totalCtas}`,
      docsCoverageScore: docsCoverage.docsCoverage.score,
      docsCoveragePages: docsCoverage.docsCoverage.totalPages,
      docsTwinScore: docsTwinExplorer.docsTwinExplorer.score,
      docsTwinPages: docsTwinExplorer.docsTwinExplorer.totals.pages,
      docsTwinMarkdownTwins: docsTwinExplorer.docsTwinExplorer.totals.markdownTwins,
      upstreamWatchScore: upstreamWatch.upstreamWatch.score,
      upstreamRoadmapItems: upstreamWatch.upstreamWatch.roadmapItems.length,
      sourceIntelligenceScore: sourceIntelligence.sourceIntelligence.score,
      sourceDriftSignals: sourceIntelligence.sourceIntelligence.driftSignals.length,
      deepSiteMapScore: deepSiteMap.deepSiteMap.score,
      deepSiteMapPages: deepSiteMap.deepSiteMap.totals.pages,
      deepSiteMapCtas: deepSiteMap.deepSiteMap.totals.ctas,
      developerQuickstartScore: developerQuickstart.quickstartWorkbench.score,
      developerQuickstartFirstCalls: developerQuickstart.quickstartWorkbench.totals.firstCallDrills,
      developerQuickstartFrameworks: developerQuickstart.quickstartWorkbench.totals.frameworks,
      ctaExecutionScore: ctaExecution.ctaExecution.score,
      ctaExecutionTargets: ctaExecution.ctaExecution.totals.targets,
      ctaExecutionOperatorActions: ctaExecution.ctaExecution.totals.operatorActions,
      innovationRadarScore: innovationRadar.innovationRadar.score,
      innovationRadarLanes: innovationRadar.innovationRadar.opportunityCount,
      enterpriseDelegatedAuthScore: enterpriseAuth.enterpriseAuth.score,
      enterprisePlatformScore: enterprisePlatform.enterprisePlatform.score,
      enterprisePlatformTenantControls: enterprisePlatform.enterprisePlatform.totals.readyTenantControls,
      enterprisePlatformSupportLanes: enterprisePlatform.enterprisePlatform.totals.supportLanes,
      authLifecycleScore: authLifecycle.authLifecycleCenter.score,
      authLifecycleRecoveries: authLifecycle.authLifecycleCenter.totals.recoveryScenarios,
      authLifecycleRefreshTokenV1: authLifecycle.authLifecycleCenter.tokenLifetimes.refreshTokenAvailableInV1,
      aiClientConnectScore: aiClientConnect.connectKit.score,
      aiClientTargets: aiClientConnect.connectKit.clientTargets.length,
      codingAgentGovernanceScore: codingAgentGovernance.codingAgentGovernance.score,
      codingAgentSignals: codingAgentGovernance.codingAgentGovernance.ruleFile.totalSignals,
      brandComplianceScore: brandCompliance.brandCompliance.score,
      brandSurfaces: brandCompliance.brandCompliance.surfaces.length,
      journeyCompilerScore: journeyCompiler.journeyCompiler.score,
      compiledJourneys: journeyCompiler.journeyCompiler.totalJourneys,
      accessDossierScore: accessDossier.dossier.score,
      accessApplicationFields: accessDossier.dossier.applicationFields.length,
      accessEvidenceScore: accessEvidenceMatrix.accessEvidenceMatrix.score,
      accessEvidenceRows: accessEvidenceMatrix.accessEvidenceMatrix.totals.rows,
      accessEvidenceReadyRows: accessEvidenceMatrix.accessEvidenceMatrix.totals.readyRows,
      premiumUseCaseScore: useCaseStudio.studio.score,
      premiumUseCases: useCaseStudio.studio.totalUseCases,
      premiumConciergeScore: concierge.concierge.score,
      conciergeSlots: concierge.concierge.itinerary.length,
      stagingCertificationScore: stagingCertification.matrix.score,
      stagingCertificationTools: `${stagingCertification.matrix.assignedTools}/${stagingCertification.matrix.totalTools}`,
      sandboxCredentialScore: sandboxWorkbench.sandboxWorkbench.score,
      sandboxCredentialLanes: sandboxWorkbench.sandboxWorkbench.lanes.length,
      sandboxSeededServers: sandboxWorkbench.sandboxWorkbench.seededDataPlan.length,
      toolLabScore: toolLab.toolLab.score,
      toolLabCallable: `${toolLab.toolLab.callableTools}/${toolLab.toolLab.totalTools}`,
      toolContractScore: toolContracts.matrix.score,
      toolContractParameters: toolContracts.matrix.totalParameters,
      scenarioRunnerScore: scenarioRunner.scenarioRunner.score,
      scenarioRunnerSteps: scenarioRunner.scenarioRunner.totalSteps,
      stateOrchestratorScore: stateOrchestrator.stateOrchestrator.score,
      stateTurnBoundaries: stateOrchestrator.stateOrchestrator.totalTurnBoundaries,
      widgetRuntimeScore: widgetRuntime.widgetRuntime.score,
      widgetRuntimeSurfaces: widgetRuntime.widgetRuntime.totalSurfaces,
      commercialActionGuardScore: commercialActionGuard.commercialActionGuard.score,
      commercialActionLanes: commercialActionGuard.commercialActionGuard.totalLanes,
      capabilityRegistryScore: capabilityRegistry.registry.score,
      capabilityRegistryGroups: capabilityRegistry.registry.capabilityGroups.length,
      resourcePromptScore: resourcePromptStudio.resourcePromptStudio.score,
      resourcePromptResources: resourcePromptStudio.resourcePromptStudio.totalResources,
      resourcePromptPrompts: resourcePromptStudio.resourcePromptStudio.totalPrompts,
      gatewayScore: gateway.gateway.readinessScore,
      stagingCutoverScore: stagingCutover.stagingCutover.score,
      stagingCutoverDryRuns: stagingCutover.stagingCutover.dryRunCalls,
      stagingCredentialDrillScore: stagingCredentialDrill.stagingCredentialDrill.score,
      stagingCredentialFirstCalls: stagingCredentialDrill.stagingCredentialDrill.totals.firstCallDrills,
      authStatus: authStatusAfter.authStatus.latestEvent.status,
      onboardingScore: onboarding.onboarding.score,
      preflightChecks: preflight.preflight.checks.length,
      replaySteps: replay.replay.length,
      stagingTranscriptScore: stagingTranscript.transcript.score,
      stagingTranscriptEntries: stagingTranscript.transcript.totalEntries,
      widgets: widgets.widgets.length,
      reviewerScore: proof.proof.score,
      dataGovernanceScore: dataGovernance.dataGovernance.score,
      dataFlows: dataGovernance.dataGovernance.dataFlows.length,
      trafficReadinessScore: trafficReadiness.trafficReadiness.score,
      projectedDailyToolCalls: trafficReadiness.trafficReadiness.projectedDailyToolCalls,
      backpressureGovernorScore: backpressureGovernor.backpressureGovernor.score,
      backpressureBuckets: backpressureGovernor.backpressureGovernor.totalBuckets,
      loadLabScore: loadLab.loadLab.score,
      loadLabScenarios: loadLab.loadLab.totals.scenarios,
      loadLabMaxPeakQps: loadLab.loadLab.totals.maxPeakQps,
      loadLabExternalGates: loadLab.loadLab.totals.externalGates,
      offerIntelligenceScore: offerIntelligence.offerIntelligence.score,
      offerIntelligenceOpportunities: offerIntelligence.offerIntelligence.totals.opportunities,
      offerIntelligenceSavings: offerIntelligence.offerIntelligence.totals.estimatedSavings,
      orderLifecycleScore: orderLifecycle.orderLifecycle.score,
      orderLifecycleTools: orderLifecycle.orderLifecycle.totals.toolsCovered,
      orderLifecycleRecoveries: orderLifecycle.orderLifecycle.totals.recoveryDrills,
      locationTrustScore: locationTrust.locationTrust.score,
      locationTrustTools: locationTrust.locationTrust.totals.toolsCovered,
      locationTrustScenarios: locationTrust.locationTrust.totals.scenarios,
      cartMutationScore: cartMutation.cartMutation.score,
      cartMutationTools: cartMutation.cartMutation.totals.toolsCovered,
      cartMutationReadbacks: cartMutation.cartMutation.totals.readbackLanes,
      discoveryFreshnessScore: discoveryFreshness.discoveryFreshness.score,
      discoveryFreshnessTools: discoveryFreshness.discoveryFreshness.totals.toolsCovered,
      discoveryFreshnessChecks: discoveryFreshness.discoveryFreshness.totals.freshnessChecks,
      confirmationCommandScore: confirmationCommand.confirmationCommandCenter.score,
      confirmationCommandTools: confirmationCommand.confirmationCommandCenter.totals.toolsCovered,
      confirmationCommandProtectedActions: confirmationCommand.confirmationCommandCenter.totals.protectedActions,
      confirmationCommandExternalGates: confirmationCommand.confirmationCommandCenter.totals.externalGates,
      cancellationCareScore: cancellationCare.cancellationCareCenter.score,
      cancellationCareReportErrorTools: cancellationCare.cancellationCareCenter.totals.reportErrorTools,
      cancellationCareNoToolGuards: cancellationCare.cancellationCareCenter.totals.noToolCancellationGuards,
      cancellationCareExternalGates: cancellationCare.cancellationCareCenter.totals.externalGates,
      dineoutPrecisionScore: dineoutPrecision.dineoutPrecisionCenter.score,
      dineoutPrecisionTools: dineoutPrecision.dineoutPrecisionCenter.totals.toolsCovered,
      dineoutPrecisionFreeGuards: dineoutPrecision.dineoutPrecisionCenter.totals.freeBookingGuards,
      dineoutPrecisionBillLanes: dineoutPrecision.dineoutPrecisionCenter.totals.billPaymentLanes,
      sloIncidentScore: sloIncident.sloIncident.score,
      sloUptimeTargets: sloIncident.sloIncident.uptimeTargets.length,
      resilienceScore: resilience.runbook.score,
      observabilityScore: observability.observability.score,
      runtimeTelemetryScore: runtimeTelemetry.telemetry.score,
      runtimeTelemetryEvents: runtimeTelemetry.telemetry.events.length,
      auditLedgerScore: auditLedger.auditLedger.score,
      auditLedgerEvents: auditLedger.auditLedger.totalEvents,
      routeOptimizerScore: routeOptimizer.routeOptimizer.score,
      routeOptimizerProfiles: routeOptimizer.routeOptimizer.profiles.length,
      routeOptimizerParallelBatches: routeOptimizer.routeOptimizer.parallelBatches.length,
      routeOptimizerHandoffs: routeOptimizer.routeOptimizer.crossServerHandoffs.length,
      routeOptimizerParallelTools: routeOptimizer.routeOptimizer.totals.parallelizableSteps,
      supportBridgeScore: supportBridge.supportBridge.score,
      supportBridgeReports: supportBridge.supportBridge.reportErrorTools.length,
      errorIntelligenceScore: errorIntelligence.errorIntelligence.score,
      errorBuckets: errorIntelligence.errorIntelligence.buckets.length,
      evaluationScore: evaluation.evaluation.score,
      evaluationScenarios: evaluation.evaluation.scenarios.length,
      submissionFields: submission.package.fields.length,
      submissionConsoleScore: submissionConsole.submissionConsole.score,
      submissionConsoleAttachments: submissionConsole.submissionConsole.totalAttachments,
      submissionRequirements: submissionConsole.submissionConsole.totalRequirements,
      submissionPacketItems: submissionConsole.submissionConsole.packetOrder.length,
      accessSubmissionStudioScore: accessSubmissionStudio.accessSubmissionStudio.score,
      accessSubmissionTargets: accessSubmissionStudio.accessSubmissionStudio.officialTargets.length,
      accessSubmissionCopyBlocks: accessSubmissionStudio.accessSubmissionStudio.totals.totalCopyBlocks,
      builderPacketScore: builderPacket.packet.score,
      builderPacketFiles: builderPacket.packet.totals.packetFiles,
      builderPacketVisualTargets: builderPacket.packet.totals.visualTargets,
      liveSignalCalibrationScore: liveSignalCalibration.liveSignalCalibration.score,
      liveSignalCalibrationLanes: liveSignalCalibration.liveSignalCalibration.totals.lanes,
      liveSignalCalibrationProbes: liveSignalCalibration.liveSignalCalibration.totals.probes,
      faqPolicyScore: faqPolicy.faqPolicy.score,
      faqPolicyQuestions: faqPolicy.faqPolicy.totalQuestions,
      growthPartnershipScore: growthPartnership.growthPartnership.score,
      growthExperiments: growthPartnership.growthPartnership.totalExperiments,
      channelMultimodalScore: channelMultimodal.channelMultimodalStudio.score,
      channelMultimodalLanes: channelMultimodal.channelMultimodalStudio.totalLanes,
      channelExecutionPackets: channelMultimodal.channelMultimodalStudio.totalExecutionPackets,
      visualDishCaptureScore: visualDishCapture.visualDishCapture.score,
      visualDishCaptureRoutes: visualDishCapture.visualDishCapture.totals.routes,
      visualDishAnalysisRoute: visualDishAnalysis.analysis.selectedRouteId,
      voiceCommerceScore: voiceCommerce.voiceCommerce.score,
      voiceCommerceScenarios: voiceCommerce.voiceCommerce.totals.scenarios,
      voiceRehearsalRoute: voiceRehearsal.rehearsal.selectedScenarioId,
      qualityLoopScore: qualityLoop.qualityLoop.score,
      qualityLoopLanes: qualityLoop.qualityLoop.totals.lanes,
      qualityFeedbackLane: qualityFeedback.analysis.selectedLaneId,
      nutritionBudgetScore: nutritionBudget.nutritionBudget.score,
      nutritionBudgetRoutes: nutritionBudget.nutritionBudget.totalRoutes,
      householdPreferenceScore: householdPreference.householdPreference.score,
      householdPreferenceSignals: householdPreference.householdPreference.totalSignals,
      guestCollaborationScore: guestCollaboration.guestCollaboration.score,
      guestCollaborationTemplates: guestCollaboration.guestCollaboration.totalTemplates,
      luxuryExperienceScore: luxuryExperience.luxuryExperience.score,
      luxuryExperienceWorkspaces: luxuryExperience.luxuryExperience.totalWorkspaces,
      reviewerArtifactVaultScore: reviewerArtifactVault.reviewerArtifactVault.score,
      reviewerArtifactVaultArtifacts: reviewerArtifactVault.reviewerArtifactVault.totalArtifacts,
      visualQaScore: visualQa.visualQa.score,
      visualQaTargets: visualQa.visualQa.totalTargets,
      launchBundleScore: launchBundle.launchBundle.score,
      launchBundleArtifacts: launchBundle.launchBundle.artifacts.length,
      storage: storage.storage.kind,
      ciReviewerEvidence: true,
    },
    null,
    2,
  ),
);
