import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyBuildersConsumerWitness,
  SwiggyBuildersConsumerWitnessGroup,
  SwiggyBuildersConsumerWitnessRow,
  SwiggyBuildersConsumerWitnessStatus,
} from "../../src/domain/types.js";
import { buildAiClientConnectKit } from "./aiClientConnect.js";
import { buildSwiggyConfirmationCommandCenter } from "./confirmationCommandCenter.js";
import { buildGuestCollaborationCenter } from "./guestCollaborationCenter.js";
import { buildHouseholdPreferenceGraph } from "./householdPreferenceGraph.js";
import { buildLuxuryExperienceWorkspace } from "./luxuryExperienceWorkspace.js";
import { buildNutritionBudgetIntelligence } from "./nutritionBudgetIntelligence.js";
import { buildSwiggyVisualDishCaptureCenter } from "./visualDishCapture.js";
import { buildSwiggyVoiceCommerceCenter } from "./voiceCommerceCenter.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function weightFor(status: SwiggyBuildersConsumerWitnessStatus) {
  if (status === "proven") return 1;
  if (status === "ready") return 0.94;
  if (status === "watch") return 0.78;
  if (status === "operator_gate") return 0.72;
  return 0.64;
}

function groupFor(row: SwiggyBuildersConsumerWitnessRow) {
  if (row.kind === "ai_client") return "client_entry";
  if (row.kind === "visual_input" || row.kind === "voice_surface") return "multimodal_surfaces";
  if (
    row.kind === "nutrition_budget" ||
    row.kind === "household_personalization" ||
    row.kind === "guest_collaboration"
  ) {
    return "planning_personalization";
  }
  return "premium_safety";
}

function row(input: SwiggyBuildersConsumerWitnessRow): SwiggyBuildersConsumerWitnessRow {
  return input;
}

export function buildSwiggyBuildersConsumerWitness(options: {
  config: ServerConfig;
  plans: MealPlan[];
}): SwiggyBuildersConsumerWitness {
  const atlas = buildSwiggyWebsiteAtlas();
  const aiClient = buildAiClientConnectKit();
  const visualDish = buildSwiggyVisualDishCaptureCenter(options.config);
  const voiceCommerce = buildSwiggyVoiceCommerceCenter(options.config);
  const nutritionBudget = buildNutritionBudgetIntelligence();
  const householdPreference = buildHouseholdPreferenceGraph();
  const guestCollaboration = buildGuestCollaborationCenter();
  const luxuryExperience = buildLuxuryExperienceWorkspace();
  const confirmationCommand = buildSwiggyConfirmationCommandCenter(options);
  const consumerAiClientUrl = `${atlas.officialSource}docs/start/consumer/use-in-ai-client/`;

  const rows = [
    row({
      id: "consumer_ai_client_install",
      label: "Consumer AI client install",
      kind: "ai_client",
      officialSignal:
        "Swiggy documents consumer AI-client setup against Food, Instamart, and Dineout MCP servers.",
      sourceUrl: consumerAiClientUrl,
      owner: "MealPilot",
      status: aiClient.score >= 90 ? "proven" : "watch",
      mealPilotSurface: "AI Client Connect Kit and Launch Center",
      evidence: `${aiClient.clientTargets.length} client targets, ${aiClient.servers.length} Swiggy MCP servers, and ${aiClient.codingAgentRules.length} coding-agent rules are ready.`,
      routeOptimization:
        "Keep each client configuration pointed at the official remote MCP endpoints while routing Food, Instamart, and Dineout through one confirmation-safe MealPilot planner.",
      riskBoundary:
        "The user supplies their own AI client and Swiggy OAuth session; MealPilot never asks for passwords, OTPs, raw bearer tokens, or payment credentials.",
      nextAction: "Keep client snippets and redaction tests aligned with the current consumer AI-client documentation.",
      proofLinks: ["/api/ai-client-connect-kit", "/api/mcp-catalog", "/api/mcp-gateway"],
      relatedApis: ["/api/swiggy-builders-ai-native-witness", "/api/swiggy-tool-contract-matrix"],
    }),
    row({
      id: "visual_dish_capture",
      label: "Visual dish and menu capture",
      kind: "visual_input",
      officialSignal:
        "Consumer agents can start from user-provided context; MealPilot converts dish photos, menu screenshots, pantry photos, and chat images into safe Swiggy routes.",
      sourceUrl: consumerAiClientUrl,
      owner: "MealPilot",
      status: visualDish.totals.readyRoutes >= visualDish.totals.routes ? "proven" : "watch",
      mealPilotSurface: "Visual Dish Capture Center",
      evidence: `${visualDish.totals.readyRoutes}/${visualDish.totals.routes} visual routes, ${visualDish.totals.sampleCaptures} sample captures, and ${visualDish.totals.readyGuardrails}/${visualDish.totals.guardrails} guardrails are ready.`,
      routeOptimization:
        "Translate visual intent into the smallest necessary toolchain, then ask the user to confirm detected dishes, quantities, city, and cart mutations before any commercial action.",
      riskBoundary:
        "Raw images are not retained, ambiguous detections remain user-confirmed, and live visual inference credentials remain a Swiggy/operator staging gate.",
      nextAction: "Run the visual dish rehearsal with staging credentials once Swiggy enables live vision paths.",
      proofLinks: ["/api/swiggy-visual-dish-capture", "/api/swiggy-channel-multimodal-studio", "/api/visual-qa-center"],
      relatedApis: ["/api/swiggy-visual-dish-capture/analyze", "/api/commercial-action-guard"],
    }),
    row({
      id: "voice_commerce_rehearsal",
      label: "Voice commerce rehearsal",
      kind: "voice_surface",
      officialSignal:
        "Consumer AI clients can drive natural-language Swiggy journeys; MealPilot rehearses voice requests with a visible card fallback and confirmation copy.",
      sourceUrl: consumerAiClientUrl,
      owner: "MealPilot",
      status: voiceCommerce.totals.readyScenarios >= voiceCommerce.totals.scenarios ? "proven" : "watch",
      mealPilotSurface: "Voice Commerce Center",
      evidence: `${voiceCommerce.totals.readyScenarios}/${voiceCommerce.totals.scenarios} voice scenarios, ${voiceCommerce.totals.samples} sample utterances, and ${voiceCommerce.totals.readyGuardrails}/${voiceCommerce.totals.guardrails} guardrails are ready.`,
      routeOptimization:
        "Detect quick order, pantry restock, table booking, and combined-evening intent, then present a deterministic web card before checkout or booking.",
      riskBoundary:
        "Raw audio is not retained, voice SDK integration is external, and every protected action still requires explicit visual confirmation.",
      nextAction: "Connect the rehearsal script to the chosen voice SDK only after Swiggy staging credentials exist.",
      proofLinks: ["/api/swiggy-voice-commerce-center", "/api/swiggy-confirmation-command-center", "/api/swiggy-state-orchestrator"],
      relatedApis: ["/api/swiggy-voice-commerce-center/rehearse", "/api/swiggy-widget-runtime"],
    }),
    row({
      id: "nutrition_budget_planner",
      label: "Nutrition and budget planner",
      kind: "nutrition_budget",
      officialSignal:
        "Consumer agents should return useful decisions, not just lists; MealPilot optimizes protein, price, coupons, and cross-Swiggy routes.",
      sourceUrl: `${atlas.officialSource}docs/build/tool-catalog/`,
      owner: "MealPilot",
      status: nutritionBudget.readyRoutes >= nutritionBudget.totalRoutes ? "proven" : "watch",
      mealPilotSurface: "Nutrition Budget Intelligence",
      evidence: `${nutritionBudget.totalTargets} targets, ${nutritionBudget.readyRoutes}/${nutritionBudget.totalRoutes} ready routes, ${nutritionBudget.totalRecommendations} recommendations, and ${nutritionBudget.totalToolsCovered} Swiggy tools are covered.`,
      routeOptimization:
        "Rank Food, Instamart, and Dineout choices by protein-per-rupee, budget fit, coupon sensitivity, delivery state, and guest count before proposing a cart.",
      riskBoundary:
        "Nutrition math is heuristic guidance, live prices can change, and final cart, coupon, payment, and table booking choices remain user-confirmed.",
      nextAction: "Re-run advice against live catalog and offer payloads during staging certification.",
      proofLinks: ["/api/nutrition-budget-intelligence", "/api/swiggy-offer-intelligence", "/api/swiggy-route-optimization"],
      relatedApis: ["/api/nutrition-budget-intelligence/advise", "/api/swiggy-payment-truth-center"],
    }),
    row({
      id: "household_preference_graph",
      label: "Household preference graph",
      kind: "household_personalization",
      officialSignal:
        "Consumer experiences should remember consented preferences and still respect live Swiggy state.",
      sourceUrl: `${atlas.officialSource}docs/operate/data-and-compliance/`,
      owner: "MealPilot",
      status:
        householdPreference.readySignals >= householdPreference.totalSignals &&
        householdPreference.readyForecasts >= householdPreference.totalForecasts
          ? "proven"
          : "watch",
      mealPilotSurface: "Household Preference Graph",
      evidence: `${householdPreference.readySignals}/${householdPreference.totalSignals} signals, ${householdPreference.totalMembers} members, ${householdPreference.readyForecasts}/${householdPreference.totalForecasts} forecasts, and ${householdPreference.uniqueToolsCovered} tools are modeled.`,
      routeOptimization:
        "Blend go-to items, household diet patterns, city, time window, order history, and pantry signals while keeping local preferences separate from Swiggy-owned account data.",
      riskBoundary:
        "Preference memory is local and consented; Swiggy order history, location, and account data stay behind OAuth and privacy controls.",
      nextAction: "Use the privacy export and data governance center before enabling persistent preference sync.",
      proofLinks: ["/api/household-preference-graph", "/api/data-governance-center", "/api/privacy"],
      relatedApis: ["/api/household-preference-graph/simulate", "/api/privacy/export"],
    }),
    row({
      id: "guest_collaboration_calendar",
      label: "Guest collaboration and calendar handoff",
      kind: "guest_collaboration",
      officialSignal:
        "Consumer planning often spans groups; MealPilot turns guest votes, occasions, reminders, and channel handoffs into one safe Swiggy route.",
      sourceUrl: `${atlas.officialSource}docs/build/agentic-workflows/`,
      owner: "MealPilot",
      status:
        guestCollaboration.readyTemplates >= guestCollaboration.totalTemplates &&
        guestCollaboration.readyCalendarArtifacts >= guestCollaboration.totalCalendarArtifacts
          ? "proven"
          : "watch",
      mealPilotSurface: "Guest Collaboration Calendar",
      evidence: `${guestCollaboration.totalParticipants} participants, ${guestCollaboration.readyVoteRounds}/${guestCollaboration.totalVoteRounds} vote rounds, ${guestCollaboration.readyTemplates}/${guestCollaboration.totalTemplates} templates, and ${guestCollaboration.readyCalendarArtifacts}/${guestCollaboration.totalCalendarArtifacts} handoffs are ready.`,
      routeOptimization:
        "Resolve guest constraints first, then compose Food, Instamart, and Dineout options with share links, ICS handoffs, and explicit final-order ownership.",
      riskBoundary:
        "Calendar, Slack, Teams, and email sends are local/manual handoffs until the operator authorizes each external channel.",
      nextAction: "Attach the selected guest handoff artifact to staging transcripts before reviewer demo.",
      proofLinks: ["/api/guest-collaboration-calendar", "/api/group-plan", "/api/plan-reminders"],
      relatedApis: ["/api/guest-collaboration-calendar/compose", "/api/reviewer-artifact-vault"],
    }),
    row({
      id: "luxury_experience_workspace",
      label: "Premium review workspace",
      kind: "luxury_workspace",
      officialSignal:
        "Best consumer experiences should feel premium while staying operationally safe across restaurant, Instamart, Dineout, recovery, and concierge-like journeys.",
      sourceUrl: `${atlas.officialSource}docs/build/widgets/`,
      owner: "MealPilot",
      status: luxuryExperience.readyWorkspaces >= luxuryExperience.totalWorkspaces ? "proven" : "watch",
      mealPilotSurface: "Luxury Experience Workspace",
      evidence: `${luxuryExperience.readyModes}/${luxuryExperience.totalModes} modes, ${luxuryExperience.readyWorkspaces}/${luxuryExperience.totalWorkspaces} workspaces, ${luxuryExperience.readyArtifacts}/${luxuryExperience.totalArtifacts} artifacts, and ${luxuryExperience.uniqueToolsCovered} tools are covered.`,
      routeOptimization:
        "Stage rich review workspaces that combine authoritative reads, widget fallback states, voice contracts, and commercial gates before a final CTA.",
      riskBoundary:
        "Premium copy, concierge claims, widget activation, and support escalation stay grounded in approved Swiggy capabilities and reviewer-visible fallbacks.",
      nextAction: "Capture the premium workspace in visual QA after any new widget or voice surface is added.",
      proofLinks: ["/api/luxury-experience-workspace", "/api/swiggy-widget-experience-composer", "/api/premium-concierge-itinerary"],
      relatedApis: ["/api/luxury-experience-workspace/compose", "/api/swiggy-hosted-widget-activation-center"],
    }),
    row({
      id: "confirmation_safety_boundary",
      label: "Commercial confirmation safety",
      kind: "confirmation_safety",
      officialSignal:
        "Consumer agents must not surprise users with Food orders, Instamart checkout, Dineout bookings, or cancellation/support mutations.",
      sourceUrl: `${atlas.officialSource}docs/operate/data-and-compliance/`,
      owner: "Joint",
      status: confirmationCommand.totals.readyChecklistItems >= 5 ? "proven" : "watch",
      mealPilotSurface: "Swiggy Confirmation Command Center",
      evidence: `${confirmationCommand.totals.lanes} confirmation lanes, ${confirmationCommand.totals.toolsCovered} tools, ${confirmationCommand.totals.protectedActions} protected actions, and ${confirmationCommand.totals.postActionProbes} post-action probes are modeled.`,
      routeOptimization:
        "Preflight cart, address, booking, and support state before mutation, then probe the authoritative Swiggy state before any retry.",
      riskBoundary:
        "Only the user can approve a commercial action; staging/production credentials, live payment outcomes, and Swiggy support actions remain external gates.",
      nextAction: "Keep protected-action rehearsals paired with every new consumer journey before pushing to production.",
      proofLinks: ["/api/swiggy-confirmation-command-center", "/api/commercial-action-guard", "/api/swiggy-cart-mutation-workbench"],
      relatedApis: ["/api/swiggy-confirmation-command-center/execute", "/api/swiggy-cancellation-care-center"],
    }),
  ];

  const proofLinks = unique(rows.flatMap((item) => item.proofLinks));
  const groupDefs = [
    { id: "client_entry", label: "Client entry" },
    { id: "multimodal_surfaces", label: "Multimodal surfaces" },
    { id: "planning_personalization", label: "Planning and personalization" },
    { id: "premium_safety", label: "Premium and safety" },
  ];
  const groups: SwiggyBuildersConsumerWitnessGroup[] = groupDefs.map((group) => {
    const groupRows = rows.filter((item) => groupFor(item) === group.id);
    return {
      id: group.id,
      label: group.label,
      rows: groupRows.length,
      proven: groupRows.filter((item) => item.status === "proven").length,
      ready: groupRows.filter((item) => item.status === "ready").length,
      watch: groupRows.filter((item) => item.status === "watch").length,
      gates: groupRows.filter((item) => item.status === "operator_gate" || item.status === "swiggy_gate").length,
      proofLinks: unique(groupRows.flatMap((item) => item.proofLinks)),
    };
  });
  const operatorGates = rows.filter((item) => item.status === "operator_gate").length;
  const swiggyGates = rows.filter((item) => item.status === "swiggy_gate").length;
  const watch = rows.filter((item) => item.status === "watch").length;
  const score = Math.round((rows.reduce((sum, item) => sum + weightFor(item.status), 0) / rows.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    decision: swiggyGates > 1 ? "consumer_blocked" : watch > 0 || operatorGates > 0 || swiggyGates > 0 ? "consumer_watch" : "consumer_ready",
    officialSources: unique([
      atlas.officialSource,
      consumerAiClientUrl,
      ...aiClient.officialSources,
      ...visualDish.officialSources,
      ...voiceCommerce.officialSources,
      ...nutritionBudget.officialSources,
      ...householdPreference.officialSources,
      ...guestCollaboration.officialSources,
      ...luxuryExperience.officialSources,
      ...confirmationCommand.officialSources,
    ]),
    totals: {
      rows: rows.length,
      proven: rows.filter((item) => item.status === "proven").length,
      ready: rows.filter((item) => item.status === "ready").length,
      watch,
      operatorGates,
      swiggyGates,
      proofLinks: proofLinks.length,
      clientTargets: aiClient.clientTargets.length,
      visualRoutes: visualDish.totals.routes,
      voiceRoutes: voiceCommerce.totals.scenarios,
      nutritionTargets: nutritionBudget.totalTargets,
      householdSignals: householdPreference.totalSignals,
      guestTemplates: guestCollaboration.totalTemplates,
      luxuryWorkspaces: luxuryExperience.totalWorkspaces,
      confirmationActions: confirmationCommand.totals.protectedActions,
    },
    rows,
    groups,
    commands: [
      {
        id: "consumer_witness_api",
        command: "curl -fsS http://localhost:8787/api/swiggy-builders-consumer-witness",
        proves:
          "Consumer AI-client setup, multimodal input, planning, personalization, premium workspaces, and confirmation safety are witnessed together.",
        expectedSignal: "totals.rows >= 8 && totals.clientTargets >= 6",
      },
      {
        id: "production_regression",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves:
          "Production smoke keeps consumer witness aligned with AI clients, visual, voice, nutrition, household, guest, luxury, and confirmation evidence.",
        expectedSignal: "consumerWitnessScore >= 84",
      },
      {
        id: "visual_capture",
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Consumer Witness card is captured with every reviewer-critical Launch Center surface.",
        expectedSignal: "77 screenshot targets return no overflow issues",
      },
    ],
    assertions: [
      "Consumer access is represented as an AI-client path with user-owned setup and explicit Swiggy MCP endpoints.",
      "Visual, voice, nutrition, household, guest, luxury, and confirmation surfaces all reuse existing MealPilot proof centers.",
      "Commercial Food, Instamart, Dineout, cancellation, payment, and support actions remain behind explicit user confirmation and Swiggy-owned credentials.",
      "Consumer witness rows route to source URLs, proof links, risk boundaries, and grouped readiness instead of relying on design claims.",
    ],
    externalGates: [
      "Swiggy must issue staging and production credentials, OAuth approvals, seeded users, and any live payment, booking, widget, or support permissions.",
      "Operators must connect their chosen AI client, voice SDK, calendar, Slack, Teams, email, and demo-video channels manually.",
      "Live visual inference, account history, order history, location, coupons, booking inventory, and payment outcomes remain Swiggy-authoritative data.",
    ],
  };
}
