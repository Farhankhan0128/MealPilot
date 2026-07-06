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
  openApi.paths["/api/auth/swiggy/status"].get.summary.includes("OAuth callback"),
  "OpenAPI OAuth status contract is missing",
);
assert(
  openApi.paths["/api/swiggy-upstream-watch"].get.summary.includes("upstream docs"),
  "OpenAPI upstream watch contract is missing",
);
assert(
  openApi.paths["/api/swiggy-source-intelligence"]?.get?.summary?.includes("source intelligence"),
  "OpenAPI source intelligence contract is missing",
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
  openApi.paths["/api/mcp/resource-prompt-studio"].get.summary.includes("Resource and Prompt Studio"),
  "OpenAPI resource and prompt studio is missing",
);
assert(
  openApi.paths["/api/mcp/staging-cutover"].get.summary.includes("staging cutover"),
  "OpenAPI staging cutover is missing",
);
assert(
  openApi.paths["/api/audit-ledger"].get.summary.includes("audit ledger"),
  "OpenAPI audit ledger is missing",
);
assert(
  openApi.paths["/api/submission-console"].get.summary.includes("submission console"),
  "OpenAPI submission console is missing",
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
assert(reviewerArtifactVault.reviewerArtifactVault.totalScreenshotTargets === 7, "reviewer artifact vault screenshot targets are incomplete");
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
  reviewerArtifactVault.reviewerArtifactVault.screenshotTargets.some(
    (target) =>
      target.id === "luxury_workspace_card" &&
      target.selector === ".luxury-experience-card" &&
      target.status === "ready",
  ),
  "reviewer artifact vault luxury screenshot target is missing",
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
assert(visualQa.visualQa.totalTargets === 14, "visual QA targets are incomplete");
assert(visualQa.visualQa.readyTargets === 14, "visual QA ready targets are incomplete");
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
    group.targets.some((target) => target.id === "coding_agent_card" && target.selector === ".coding-agent-card"),
  ),
  "visual QA coding agent governance target is missing",
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
      command.expectedSignal.includes("targetCount >= 14"),
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
  proof.proof.artifacts.some((artifact) => artifact.label === "Swiggy Innovation Radar"),
  "reviewer proof innovation radar artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "Staging Cutover Rehearsal"),
  "reviewer proof staging cutover artifact is missing",
);
assert(
  proof.proof.artifacts.some((artifact) => artifact.label === "SLO Incident Command Center"),
  "reviewer proof SLO incident artifact is missing",
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
  proof.proof.artifacts.some((artifact) => artifact.label === "Enterprise Delegated Auth Center"),
  "reviewer proof enterprise delegated-auth artifact is missing",
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
  ["builder_packet", "launch_bundle", "access_dossier", "demo_video", "audit_ledger"].every((id) =>
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

const builderPacket = await request("/api/builder-packet-export");
assert(builderPacket.packet.score >= 85, "builder packet export score is below target");
assert(builderPacket.packet.recommendedTrack === "developer", "builder packet export recommended track is wrong");
assert(builderPacket.packet.outputDirectory === "artifacts/builder-packet", "builder packet output directory is missing");
assert(builderPacket.packet.totals.formFields >= 10, "builder packet form-field coverage is incomplete");
assert(builderPacket.packet.totals.requiredAttachments >= 10, "builder packet attachment coverage is incomplete");
assert(builderPacket.packet.totals.launchArtifacts >= 50, "builder packet launch artifact coverage is incomplete");
assert(builderPacket.packet.totals.visualTargets === 14, "builder packet visual target coverage is incomplete");
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
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Builder Intake Command Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "FAQ & Policy Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Growth Partnership Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Channel & Multimodal Studio") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Nutrition & Budget Intelligence") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Household Preference Graph") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Guest Collaboration & Calendar Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Luxury Experience Workspace") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Reviewer Artifact Vault") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Visual QA Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Docs Coverage") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Upstream Watch") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Source Intelligence") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy Innovation Radar") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "AI Client Connect Kit") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Brand Compliance Kit") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Data Governance Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Swiggy OAuth Status") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Enterprise Delegated Auth Center") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "Traffic Readiness Plan") &&
    launchBundle.launchBundle.artifacts.some((artifact) => artifact.label === "MCP Backpressure Governor") &&
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
  launchBundle.launchBundle.handoffEmail.body.includes("/api/visual-qa-center"),
  "launch bundle visual QA handoff link is missing",
);
assert(
  launchBundle.launchBundle.handoffEmail.body.includes("/api/submission-console"),
  "launch bundle submission console handoff link is missing",
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
      builderIntakeScore: builderIntake.intake.score,
      builderIntakeCtas: `${builderIntake.intake.readyCtas}/${builderIntake.intake.totalCtas}`,
      docsCoverageScore: docsCoverage.docsCoverage.score,
      docsCoveragePages: docsCoverage.docsCoverage.totalPages,
      upstreamWatchScore: upstreamWatch.upstreamWatch.score,
      upstreamRoadmapItems: upstreamWatch.upstreamWatch.roadmapItems.length,
      sourceIntelligenceScore: sourceIntelligence.sourceIntelligence.score,
      sourceDriftSignals: sourceIntelligence.sourceIntelligence.driftSignals.length,
      innovationRadarScore: innovationRadar.innovationRadar.score,
      innovationRadarLanes: innovationRadar.innovationRadar.opportunityCount,
      enterpriseDelegatedAuthScore: enterpriseAuth.enterpriseAuth.score,
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
      sloIncidentScore: sloIncident.sloIncident.score,
      sloUptimeTargets: sloIncident.sloIncident.uptimeTargets.length,
      resilienceScore: resilience.runbook.score,
      observabilityScore: observability.observability.score,
      runtimeTelemetryScore: runtimeTelemetry.telemetry.score,
      runtimeTelemetryEvents: runtimeTelemetry.telemetry.events.length,
      auditLedgerScore: auditLedger.auditLedger.score,
      auditLedgerEvents: auditLedger.auditLedger.totalEvents,
      routeOptimizerScore: routeOptimizer.routeOptimizer.score,
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
      builderPacketScore: builderPacket.packet.score,
      builderPacketFiles: builderPacket.packet.totals.packetFiles,
      builderPacketVisualTargets: builderPacket.packet.totals.visualTargets,
      faqPolicyScore: faqPolicy.faqPolicy.score,
      faqPolicyQuestions: faqPolicy.faqPolicy.totalQuestions,
      growthPartnershipScore: growthPartnership.growthPartnership.score,
      growthExperiments: growthPartnership.growthPartnership.totalExperiments,
      channelMultimodalScore: channelMultimodal.channelMultimodalStudio.score,
      channelMultimodalLanes: channelMultimodal.channelMultimodalStudio.totalLanes,
      channelExecutionPackets: channelMultimodal.channelMultimodalStudio.totalExecutionPackets,
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
