import type { ServerConfig } from "../config.js";
import type { LaunchBundle, LaunchBundleArtifact, LaunchBundlePhase, MealPlan, SwiggyServer } from "../../src/domain/types.js";

const requestedServers: SwiggyServer[] = ["food", "instamart", "dineout"];

function hasClientId(config: ServerConfig) {
  return config.swiggyClientId !== "replace_after_builder_access";
}

function statusScore(status: "ready" | "manual_input" | "external_gate") {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.65;
  return 0.35;
}

function buildArtifacts(latestPlan?: MealPlan): LaunchBundleArtifact[] {
  return [
    {
      id: "website_atlas",
      label: "Swiggy Website Atlas",
      path: "/api/swiggy-website-atlas",
      category: "api",
      status: "ready",
      evidence: "Maps Builders header, docs subnav, footer, page modules, CTAs, and legal/resource links.",
    },
    {
      id: "builders_launch_story",
      label: "Swiggy Builders Launch Story Center",
      path: "/api/swiggy-builders-launch-story",
      category: "api",
      status: "ready",
      evidence:
        "Curates the Builders Club launch-blog narrative into a reviewer demo story, current 35-tool reconciliation, showcase assets, CTA paths, and co-marketing gates.",
    },
    {
      id: "operating_contract_center",
      label: "Swiggy Operating Contract Center",
      path: "/api/swiggy-operating-contract-center",
      category: "api",
      status: "ready",
      evidence:
        "Consolidates official SLA, rate-limit, support, versioning, changelog, and ship-to-production guidance into one reviewer operating contract with runbooks and external gates.",
    },
    {
      id: "deep_site_map",
      label: "Swiggy Deep Site Map",
      path: "/api/swiggy-deep-site-map",
      category: "api",
      status: "ready",
      evidence:
        "Consolidates every Builders page, module signal, CTA, header/docs/footer link, proof path, source section, assertion, and external gate into one reviewer audit.",
    },
    {
      id: "developer_quickstart",
      label: "Developer Quickstart Workbench",
      path: "/api/swiggy-developer-quickstart",
      category: "api",
      status: "ready",
      evidence:
        "Turns Swiggy's self-serve developer quickstart into readiness steps, framework adapters, first-call JSON-RPC drills, auth gates, and recipe handoffs.",
    },
    {
      id: "cta_execution",
      label: "CTA Execution Center",
      path: "/api/swiggy-cta-execution-center",
      category: "api",
      status: "ready",
      evidence:
        "Turns every official Builders CTA, global header link, docs nav link, footer resource, mailto, form, and legal link into a click-ready action matrix with proof links and manual gates.",
    },
    {
      id: "builder_intake",
      label: "Builder Intake Command Center",
      path: "/api/swiggy-builder-intake",
      category: "api",
      status: "ready",
      evidence:
        "Turns every signup, apply, demo, contact, docs, and footer CTA into an owner, next action, evidence link, form field, storyboard, and draft handoff.",
    },
    {
      id: "faq_policy",
      label: "FAQ & Policy Center",
      path: "/api/swiggy-faq-policy",
      category: "api",
      status: "ready",
      evidence:
        "Maps homepage, developer, enterprise, access-ground-rule, footer-resource, allowed, restricted, prohibited, operating-principle, and legal FAQ/policy signals to MealPilot proof.",
    },
    {
      id: "growth_partnership",
      label: "Growth Partnership Center",
      path: "/api/swiggy-growth-partnership",
      category: "api",
      status: "ready",
      evidence:
        "Turns Swiggy's get-noticed, co-branding, direct-support, hiring, co-marketing, analytics, and growth-partnership promises into experiments, assets, metrics, and external partner asks.",
    },
    {
      id: "channel_multimodal_studio",
      label: "Channel & Multimodal Studio",
      path: "/api/channel-multimodal-studio",
      category: "api",
      status: "ready",
      evidence:
        "Turns Swiggy's developer-page ideas into voice, web chat, Slack/Teams, mobile camera, enterprise, and screenshot-to-order contracts with MCP toolchains and gates.",
    },
    {
      id: "visual_dish_capture",
      label: "Swiggy Visual Dish Capture Center",
      path: "/api/swiggy-visual-dish-capture",
      category: "api",
      status: "ready",
      evidence:
        "Productizes screenshot-to-order with Food menu matches, Instamart ingredient rescue, Dineout place discovery, sample capture analysis, privacy guardrails, and confirmation gates.",
    },
    {
      id: "voice_commerce_center",
      label: "Swiggy Voice Commerce Rehearsal Center",
      path: "/api/swiggy-voice-commerce-center",
      category: "api",
      status: "ready",
      evidence:
        "Productizes voice-vs-chat guidance with short TTS scripts, card fallbacks, no raw ids, no raw-audio retention, confirmation readbacks, and Swiggy route rehearsal.",
    },
    {
      id: "quality_loop_center",
      label: "Swiggy Quality Loop Center",
      path: "/api/swiggy-quality-loop-center",
      category: "api",
      status: "ready",
      evidence:
        "Turns post-order, grocery, booking, and combined feedback into consented learning tags, support-safe redaction, repeat optimization, and external history gates.",
    },
    {
      id: "ritual_autopilot_center",
      label: "Swiggy Ritual Autopilot Center",
      path: "/api/swiggy-ritual-autopilot-center",
      category: "api",
      status: "ready",
      evidence:
        "Turns recurring household routines into consented Food, Instamart, Dineout, and combined plans with reminder-only cadence, fresh reads, and no automatic commercial actions.",
    },
    {
      id: "payment_truth_center",
      label: "Swiggy Payment Truth Center",
      path: "/api/swiggy-payment-truth-center",
      category: "api",
      status: "ready",
      evidence:
        "Reconciles Food cart totals, coupons, COD, Instamart checkout bills, Dineout free bookings, and paid-cart gates from Swiggy source-of-truth readbacks without storing payment instruments.",
    },
    {
      id: "meal_window_intelligence",
      label: "Swiggy Meal Window Intelligence",
      path: "/api/swiggy-meal-window-intelligence",
      category: "api",
      status: "ready",
      evidence:
        "Forecasts when to order, cook, reserve, track, or wait with fresh-read timing gates, no scheduled Food orders, tracking cadence caps, and advisory-only ETA risk buckets.",
    },
    {
      id: "customization_studio",
      label: "Swiggy Customization Studio",
      path: "/api/swiggy-customization-studio",
      category: "api",
      status: "ready",
      evidence:
        "Turns Food add-ons, menu variants, Instamart pack sizes, allergy cautions, voice-safe choice limits, and post-mutation cart readbacks into a visible customization safety layer.",
    },
    {
      id: "nutrition_budget_intelligence",
      label: "Nutrition & Budget Intelligence",
      path: "/api/nutrition-budget-intelligence",
      category: "api",
      status: "ready",
      evidence:
        "Optimizes protein-per-rupee, coupon-safe Food carts, Instamart pantry gaps, group budgets, and Dineout balance routes with nutrition safety controls.",
    },
    {
      id: "household_preference_graph",
      label: "Household Preference Graph",
      path: "/api/household-preference-graph",
      category: "api",
      status: "ready",
      evidence:
        "Maps consented Food active orders, Instamart go-to items and order history, Dineout saved-location signals, household weights, forecasts, automations, and retention rules.",
    },
    {
      id: "guest_collaboration_calendar",
      label: "Guest Collaboration & Calendar Center",
      path: "/api/guest-collaboration-calendar",
      category: "api",
      status: "ready",
      evidence:
        "Coordinates guest votes, occasion templates, Dineout slots, Food reminders, Instamart prep, calendar handoffs, Slack/Teams gates, and voice-safe briefs.",
    },
    {
      id: "luxury_experience_workspace",
      label: "Luxury Experience Workspace",
      path: "/api/luxury-experience-workspace",
      category: "api",
      status: "ready",
      evidence:
        "Productizes polished reservation, Food cart, Instamart basket, combined evening, and recovery review workspaces with all 35 Swiggy tools, concierge modes, widget fallbacks, voice contracts, telemetry, and confirmation controls.",
    },
    {
      id: "reviewer_artifact_vault",
      label: "Reviewer Artifact Vault",
      path: "/api/reviewer-artifact-vault",
      category: "api",
      status: "ready",
      evidence:
        "Packages proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and Swiggy handoff copy into one reviewer manifest.",
    },
    {
      id: "demo_evidence_director",
      label: "Swiggy Demo Evidence Director",
      path: "/api/swiggy-demo-evidence-director",
      category: "api",
      status: "ready",
      evidence:
        "Coordinates the 2-3 minute demo storyboard, proof assets, recording gates, redaction checks, runbook commands, and builders@swiggy.in handoff copy.",
    },
    {
      id: "access_evidence_matrix",
      label: "Swiggy Access Evidence Matrix",
      path: "/api/swiggy-access-evidence-matrix",
      category: "api",
      status: "ready",
      evidence:
        "Ties every official access field, review check, ground rule, legal item, attachment, browser step, proof command, owner, and external gate to MealPilot evidence.",
    },
    {
      id: "visual_qa_center",
      label: "Visual QA Center",
      path: "/api/visual-qa-center",
      category: "api",
      status: "ready",
      evidence:
        "Maps demo-critical UI screenshots, viewport targets, selector manifests, text-fit/no-overlap rules, widget fallback checks, mobile layout checks, and screenshot automation gates.",
    },
    {
      id: "docs_coverage",
      label: "Swiggy Docs Coverage",
      path: "/api/swiggy-docs-coverage",
      category: "api",
      status: "ready",
      evidence: "Maps all llms.txt-linked docs pages to MealPilot evidence, expansion lanes, and external gates.",
    },
    {
      id: "docs_twin_explorer",
      label: "Swiggy Docs Twin Explorer",
      path: "/api/swiggy-docs-twin-explorer",
      category: "api",
      status: "ready",
      evidence:
        "Pairs every official llms.txt markdown twin with its rendered page, section group, retrieval lane, MealPilot proof route, and drift gate.",
    },
    {
      id: "upstream_watch",
      label: "Swiggy Upstream Watch",
      path: "/api/swiggy-upstream-watch",
      category: "api",
      status: "ready",
      evidence:
        "Tracks llms.txt, llms-full.txt, v1.0 changelog, v1.1/v1.2/v2 roadmap, signed manifest watch, and action queue for future Swiggy MCP changes.",
    },
    {
      id: "source_intelligence",
      label: "Swiggy Source Intelligence",
      path: "/api/swiggy-source-intelligence",
      category: "api",
      status: "ready",
      evidence:
        "Reconciles Swiggy website pages, CTAs, llms docs, markdown twins, 35 MCP tools, source drift signals, build queue, and external credential gates in one reviewer surface.",
    },
    {
      id: "innovation_radar",
      label: "Swiggy Innovation Radar",
      path: "/api/swiggy-innovation-radar",
      category: "api",
      status: "ready",
      evidence:
        "Turns Swiggy developer ideas, enterprise signals, access ground rules, support model, and all MCP servers into premium MealPilot opportunity lanes, route optimizations, build phases, and partner gates.",
    },
    {
      id: "ai_client_connect",
      label: "AI Client Connect Kit",
      path: "/api/ai-client-connect-kit",
      category: "api",
      status: "ready",
      evidence: "Generates Swiggy MCP configs for AI clients, coding-agent rules, SDK auth modes, and delegated-auth gates.",
    },
    {
      id: "journey_compiler",
      label: "Swiggy Journey Compiler",
      path: "/api/swiggy-journey-compiler",
      category: "api",
      status: "ready",
      evidence: "Compiles official Food, Instamart, Dineout, combined, and premium three-server journeys with all 35 tools indexed.",
    },
    {
      id: "access_dossier",
      label: "Swiggy Access Dossier",
      path: "/api/swiggy-access-dossier",
      category: "api",
      status: "ready",
      evidence: "Maps production-access fields, review checks, ground rules, legal readiness, tracks, proof links, manual inputs, and external gates.",
    },
    {
      id: "use_case_studio",
      label: "Premium Use Case Studio",
      path: "/api/premium-use-case-studio",
      category: "api",
      status: "ready",
      evidence: "Packages ten premium MealPilot playbooks with all 35 Swiggy tools placed into optimized, confirmation-safe routes.",
    },
    {
      id: "premium_concierge_itinerary",
      label: "Premium Concierge Itinerary",
      path: "/api/premium-concierge-itinerary",
      category: "api",
      status: "ready",
      evidence:
        "Turns official Food, Instamart, Dineout, and combined Swiggy recipes into a premium day-and-weekend itinerary with route optimizations, confirmations, and reminders.",
    },
    {
      id: "staging_certification",
      label: "Staging Certification Matrix",
      path: "/api/staging-certification-matrix",
      category: "api",
      status: "ready",
      evidence:
        "Groups all 35 Swiggy tools into credentialed staging smoke waves with OAuth/DCR, 48-hour soak, telemetry, rollback, and production promotion gates.",
    },
    {
      id: "brand_compliance",
      label: "Brand Compliance Kit",
      path: "/api/brand-compliance-kit",
      category: "api",
      status: "ready",
      evidence:
        "Maps Powered by Swiggy attribution, co-branding rules, asset gates, palette usage, no-endorsement copy, and launch screenshot checklist.",
    },
    {
      id: "data_governance",
      label: "Data Governance Center",
      path: "/api/data-governance-center",
      category: "api",
      status: "ready",
      evidence:
        "Maps Swiggy DPDP roles, India/Singapore residency, tool-call PII flows, DSR routing, 90-day audit logs, token redaction, and signed-manifest watch items.",
    },
    {
      id: "enterprise_delegated_auth",
      label: "Enterprise Delegated Auth Center",
      path: "/api/enterprise-delegated-auth",
      category: "api",
      status: "ready",
      evidence:
        "Models Swiggy enterprise on-behalf-of OAuth 2.1 PKCE, per-user token lifecycle, redirect schemes, troubleshooting, architecture review, and platform-operator gates.",
    },
    {
      id: "traffic_readiness",
      label: "Traffic Readiness Plan",
      path: "/api/traffic-readiness-plan",
      category: "runtime",
      status: "ready",
      evidence:
        "Packages expected volume, per-lane traffic budgets, Retry-After behavior, seven-day launch notice, capacity-upgrade email, and 1%-to-100% rollout gates.",
    },
    {
      id: "backpressure_governor",
      label: "MCP Backpressure Governor",
      path: "/api/mcp/backpressure-governor",
      category: "runtime",
      status: "ready",
      evidence:
        "Turns Swiggy planned rate-limit guidance into token buckets, queue discipline, Retry-After handling, voice burst shaping, tracking cadence, and background-job gates.",
    },
    {
      id: "load_lab",
      label: "Swiggy Load Lab",
      path: "/api/swiggy-load-lab",
      category: "runtime",
      status: "ready",
      evidence:
        "Composes Traffic Readiness, Backpressure Governor, and Route Optimizer into synthetic launch-load scenarios, cohort ramps, Retry-After drills, and capacity gates.",
    },
    {
      id: "quota_negotiation",
      label: "Swiggy Quota Negotiation Center",
      path: "/api/swiggy-quota-negotiation-center",
      category: "runtime",
      status: "ready",
      evidence:
        "Packages pilot and campaign capacity asks, QPS forecasts, Retry-After readiness, route optimization, and a builders@swiggy.in capacity request packet.",
    },
    {
      id: "offer_intelligence",
      label: "Swiggy Offer Intelligence",
      path: "/api/swiggy-offer-intelligence",
      category: "api",
      status: "ready",
      evidence:
        "Turns Food coupon tools, Dineout deal discovery, Instamart value substitution, and offer-copy gates into confirmation-safe savings evidence.",
    },
    {
      id: "order_lifecycle",
      label: "Swiggy Order Lifecycle",
      path: "/api/swiggy-order-lifecycle",
      category: "runtime",
      status: "ready",
      evidence:
        "Maps Food, Instamart, and Dineout status tools into post-confirmation timelines, non-blind retry probes, tracking cadence, telemetry, and support-ready recovery.",
    },
    {
      id: "location_trust",
      label: "Swiggy Location Trust",
      path: "/api/swiggy-location-trust",
      category: "api",
      status: "ready",
      evidence:
        "Covers Food and Instamart saved-address tools, Dineout saved locations, user-choice pauses, address switch refresh guards, raw-address redaction, and staging credential gates.",
    },
    {
      id: "cart_mutation_workbench",
      label: "Swiggy Cart Mutation Workbench",
      path: "/api/swiggy-cart-mutation-workbench",
      category: "api",
      status: "ready",
      evidence:
        "Makes Food cart readbacks, Instamart full-cart replacement, Dineout create_cart gates, payment-method truth, add-on confirmation, and staging cart-write gates reviewer-visible.",
    },
    {
      id: "discovery_freshness",
      label: "Swiggy Discovery Freshness",
      path: "/api/swiggy-discovery-freshness",
      category: "api",
      status: "ready",
      evidence:
        "Turns Food restaurant/menu search, Instamart product/go-to discovery, Dineout search/details/slots, pagination, variant truth, coordinate consistency, and freshness invalidation into reviewer evidence.",
    },
    {
      id: "confirmation_command_center",
      label: "Swiggy Confirmation Command Center",
      path: "/api/swiggy-confirmation-command-center",
      category: "api",
      status: "ready",
      evidence:
        "Makes final Food place_food_order, Instamart checkout, Dineout book_table, separate combined approvals, post-action status probes, payment truth, and live credential gates reviewer-visible.",
    },
    {
      id: "cancellation_care_center",
      label: "Swiggy Cancellation & Care Center",
      path: "/api/swiggy-cancellation-care-center",
      category: "api",
      status: "ready",
      evidence:
        "Separates Food and Instamart no-tool cancellation requests, official customer-care copy, Dineout booking status, report_error toolContext, and incident email routing.",
    },
    {
      id: "dineout_precision_center",
      label: "Swiggy Dineout Precision Center",
      path: "/api/swiggy-dineout-precision-center",
      category: "api",
      status: "ready",
      evidence:
        "Separates Dineout free reservations from bill-payment carts, validates isFree and bookingPrice before book_table, blocks paid deals, and keeps live payment evidence external-gated.",
    },
    {
      id: "slo_incident_command",
      label: "SLO Incident Command Center",
      path: "/api/slo-incident-command",
      category: "runtime",
      status: "ready",
      evidence:
        "Maps Swiggy 99.9% uptime targets, latency classes, status-page fallback, incident comms, 72-hour maintenance notice, measurement exclusions, and remediation path.",
    },
    {
      id: "tool_lab",
      label: "MCP Tool Lab",
      path: "/api/mcp/tool-lab",
      category: "api",
      status: "ready",
      evidence: "Probes all 35 Food, Instamart, and Dineout tools with JSON-RPC samples and safety gates.",
    },
    {
      id: "tool_contract_matrix",
      label: "Tool Contract Matrix",
      path: "/api/mcp/tool-contract-matrix",
      category: "api",
      status: "ready",
      evidence:
        "Lists every official Swiggy MCP tool with parameters, response envelope, retry policy, confirmation gate, error buckets, and fixture preview.",
    },
    {
      id: "scenario_runner",
      label: "Scenario Runner",
      path: "/api/mcp/scenario-runner",
      category: "api",
      status: "ready",
      evidence:
        "Executes official Food, Instamart, Dineout, and combined recipes as mock JSON-RPC traces with guard/recovery probes across all 35 tools.",
    },
    {
      id: "state_orchestrator",
      label: "State Orchestrator",
      path: "/api/mcp/state-orchestrator",
      category: "api",
      status: "ready",
      evidence:
        "Maps official multi-turn cart state, server-boundary, stale-cart recovery, and voice/chat response contracts into executable MealPilot guards.",
    },
    {
      id: "widget_runtime",
      label: "Widget Runtime Center",
      path: "/api/mcp/widget-runtime",
      category: "api",
      status: "ready",
      evidence:
        "Models Swiggy widget iframe contracts, sandboxing, origin verification, postMessage handlers, voice exclusions, opt-in gates, and semantic fallbacks.",
    },
    {
      id: "commercial_action_guard",
      label: "Commercial Action Guard",
      path: "/api/mcp/commercial-action-guard",
      category: "api",
      status: "ready",
      evidence:
        "Locks Food order placement, Instamart checkout, Dineout booking, and combined commercial flows behind fresh reads, explicit confirmations, check-then-retry drills, telemetry, and support packets.",
    },
    {
      id: "staging_cutover",
      label: "Staging Cutover Rehearsal",
      path: "/api/mcp/staging-cutover",
      category: "runtime",
      status: "ready",
      evidence:
        "Rehearses real Swiggy Streamable HTTP cutover with OAuth, first read-only probes, fail-closed token behavior, retry branches, support packet, and 48-hour staging gates.",
    },
    {
      id: "staging_credential_drill",
      label: "Swiggy Staging Credential Drill Center",
      path: "/api/swiggy-staging-credential-drill",
      category: "runtime",
      status: "ready",
      evidence:
        "Combines credential signal, first-call JSON-RPC drills, seeded-data requirements, operator runbook, handoff email, and Swiggy-owned promotion gates.",
    },
    {
      id: "live_signal_calibration",
      label: "Swiggy Live Signal Calibration Center",
      path: "/api/swiggy-live-signal-calibration",
      category: "runtime",
      status: "ready",
      evidence:
        "Reconciles local personalization, discovery, offer, order, location, and support signals against future Food, Instamart, and Dineout staging reads with privacy and drift gates.",
    },
    {
      id: "capability_registry",
      label: "MCP Capability Registry",
      path: "/api/mcp/capability-registry",
      category: "api",
      status: "ready",
      evidence: "Unifies tools, resources, prompts, OAuth metadata, widgets, and external gates.",
    },
    {
      id: "resource_prompt_studio",
      label: "Resource & Prompt Studio",
      path: "/api/mcp/resource-prompt-studio",
      category: "api",
      status: "ready",
      evidence:
        "Exercises resources/list, resources/read, prompts/list, and prompts/get across Food, Instamart, and Dineout with local samples and live Swiggy gates.",
    },
    {
      id: "credential_cockpit",
      label: "Credential Cockpit",
      path: "/api/credential-onboarding",
      category: "api",
      status: "ready",
      evidence: "Shows OAuth metadata, Dynamic Client Registration preview, redirect audit, scopes, and external gates.",
    },
    {
      id: "sandbox_credential_workbench",
      label: "Sandbox Credential Workbench",
      path: "/api/sandbox-credential-workbench",
      category: "api",
      status: "ready",
      evidence:
        "Joins localhost demo proof, DCR, PKCE, redirect allowlisting, staging credentials, seeded data, 48-hour soak, and production-promotion gates.",
    },
    {
      id: "oauth_status",
      label: "Swiggy OAuth Status",
      path: "/api/auth/swiggy/status",
      category: "api",
      status: "ready",
      evidence:
        "Exposes redacted OAuth lifecycle state, authorize/token/logout endpoints, pending PKCE verifier count, callback outcome, token source, storage policy, and exact-match redirect posture.",
    },
    {
      id: "auth_lifecycle_center",
      label: "Swiggy Auth Lifecycle Center",
      path: "/api/swiggy-auth-lifecycle-center",
      category: "api",
      status: "ready",
      evidence:
        "Turns PKCE, 120-second codes, 5-day tokens, no refresh-token assumption, 401/419 re-auth, exact redirects, per-user tokens, and no-token logging into reviewer evidence.",
    },
    {
      id: "enterprise_platform_center",
      label: "Swiggy Enterprise Platform Center",
      path: "/api/enterprise-platform-center",
      category: "api",
      status: "ready",
      evidence:
        "Turns platform-operator onboarding, tenant boundaries, delegated auth, quota review, contract support, audit exports, staging soak, and co-branding gates into reviewer evidence.",
    },
    {
      id: "runtime_telemetry",
      label: "Runtime Telemetry",
      path: "/api/telemetry/runtime",
      category: "runtime",
      status: "ready",
      evidence: "Captures request IDs, hashed user context, status classes, durations, and session IDs without raw PII.",
    },
    {
      id: "audit_ledger",
      label: "Audit Ledger Center",
      path: "/api/audit-ledger",
      category: "runtime",
      status: "ready",
      evidence:
        "Aggregates redacted plan audit events, Swiggy session support correlation, retention posture, DSR routing, and support packet fields.",
    },
    {
      id: "submission_console",
      label: "Submission Console",
      path: "/api/submission-console",
      category: "api",
      status: "ready",
      evidence:
        "Consolidates official developer/enterprise form targets, prepared access fields, proof attachments, runbook steps, blockers, and handoff drafts.",
    },
    {
      id: "builder_packet_export",
      label: "Builder Packet Export",
      path: "/api/builder-packet-export",
      category: "api",
      status: "ready",
      evidence:
        "Generates copy-ready Markdown and machine-readable JSON packet artifacts with form fields, attachments, commands, handoff email, and explicit operator/Swiggy gates.",
    },
    {
      id: "trace_monitor",
      label: "Trace Monitor",
      path: "/api/observability/traces",
      category: "runtime",
      status: "ready",
      evidence: "Converts plan audit trails into MCP spans with retry, cache, and redaction attributes.",
    },
    {
      id: "route_optimizer",
      label: "Route Optimizer",
      path: "/api/swiggy-route-optimizer",
      category: "api",
      status: "ready",
      evidence: "Documents call-saving routes, cache rules, non-blind retry policy, and staging assertions.",
    },
    {
      id: "resilience",
      label: "Resilience Lab",
      path: "/api/resilience",
      category: "api",
      status: "ready",
      evidence: "Exercises 5xx, 429, 401, non-idempotent recovery, and deprecation-monitoring drills.",
    },
    {
      id: "support_bridge",
      label: "Support Bridge",
      path: "/api/support/bridge",
      category: "api",
      status: "ready",
      evidence: "Prepares official report_error payloads, SLA routing, redaction rules, and escalation email.",
    },
    {
      id: "error_intelligence",
      label: "Error Intelligence",
      path: "/api/error-intelligence",
      category: "api",
      status: "ready",
      evidence: "Maps Swiggy success:false envelopes, retry buckets, planned codes, and terminal domain errors.",
    },
    {
      id: "reviewer_proof",
      label: "Reviewer Proof",
      path: "/api/reviewer-proof",
      category: "api",
      status: "ready",
      evidence: "Aggregates reviewer highlights, blockers, and artifact links into one proof score.",
    },
    {
      id: "builder_packet",
      label: "Builder Packet Markdown",
      path: "/api/builder-package.md",
      category: "doc",
      status: "ready",
      evidence: "Copy-ready application packet for Swiggy Builder Access review.",
    },
    {
      id: "latest_plan",
      label: "Latest Plan Session",
      path: latestPlan ? `/api/sessions/${latestPlan.id}` : "/api/plan",
      category: "api",
      status: latestPlan ? "ready" : "manual_input",
      evidence: latestPlan ? `${latestPlan.id} composes Food, Instamart, and Dineout.` : "Run a plan before recording the final demo.",
    },
    {
      id: "staging_transcript",
      label: "Staging Transcript Export",
      path: latestPlan ? `/api/sessions/${latestPlan.id}/staging-transcript` : "/api/sessions/:sessionId/staging-transcript",
      category: "api",
      status: latestPlan ? "ready" : "manual_input",
      evidence: latestPlan
        ? "Exports redacted JSONL and Markdown replay with session ids, request ids, retry policy, support envelope, and certification-wave mapping."
        : "Run a plan before exporting the staging transcript evidence.",
    },
    {
      id: "demo_video",
      label: "Demo Video URL",
      path: "Loom/Drive/YouTube unlisted URL",
      category: "external",
      status: "manual_input",
      evidence: "Swiggy asks builders to record a short localhost or staging flow video.",
    },
    {
      id: "staging_credentials",
      label: "Staging Credentials",
      path: "mcp-staging.swiggy.com",
      category: "external",
      status: "external_gate",
      evidence: "Issued by Swiggy during application review; required for real seeded-data verification.",
    },
  ];
}

function buildPhases(config: ServerConfig, latestPlan: MealPlan | undefined, artifacts: LaunchBundleArtifact[]): LaunchBundlePhase[] {
  const artifact = (id: string) => artifacts.find((item) => item.id === id)?.path ?? id;
  const productionRedirectReady = config.swiggyRedirectUri.startsWith("https://");

  return [
    {
      id: "local_review",
      label: "Local reviewer demo",
      status: latestPlan ? "ready" : "manual_input",
      owner: "MealPilot",
      evidence: latestPlan
        ? "A three-server plan exists and all local proof endpoints are available."
        : "Run a plan and confirm one action before recording.",
      artifacts: [
        artifact("latest_plan"),
        artifact("staging_transcript"),
        artifact("website_atlas"),
        artifact("deep_site_map"),
        artifact("developer_quickstart"),
        artifact("cta_execution"),
        artifact("builder_intake"),
        artifact("faq_policy"),
        artifact("growth_partnership"),
        artifact("channel_multimodal_studio"),
        artifact("visual_dish_capture"),
        artifact("voice_commerce_center"),
        artifact("quality_loop_center"),
        artifact("nutrition_budget_intelligence"),
        artifact("household_preference_graph"),
        artifact("guest_collaboration_calendar"),
        artifact("luxury_experience_workspace"),
        artifact("reviewer_artifact_vault"),
        artifact("access_evidence_matrix"),
        artifact("visual_qa_center"),
        artifact("submission_console"),
        artifact("docs_twin_explorer"),
        artifact("upstream_watch"),
        artifact("source_intelligence"),
        artifact("innovation_radar"),
        artifact("premium_concierge_itinerary"),
        artifact("tool_lab"),
        artifact("tool_contract_matrix"),
        artifact("scenario_runner"),
        artifact("state_orchestrator"),
        artifact("widget_runtime"),
        artifact("commercial_action_guard"),
        artifact("live_signal_calibration"),
        artifact("backpressure_governor"),
        artifact("load_lab"),
        artifact("offer_intelligence"),
        artifact("order_lifecycle"),
        artifact("staging_cutover"),
        artifact("capability_registry"),
        artifact("resource_prompt_studio"),
        artifact("oauth_status"),
        artifact("runtime_telemetry"),
        artifact("audit_ledger"),
        artifact("slo_incident_command"),
        artifact("data_governance"),
        artifact("enterprise_delegated_auth"),
      ],
    },
    {
      id: "access_application",
      label: "Builder Access application",
      status: "manual_input",
      owner: "Operator",
      evidence: "Application fields are prepared; final contact email, video URL, and production redirect must be supplied.",
      artifacts: [
        artifact("builder_packet"),
        artifact("submission_console"),
        artifact("credential_cockpit"),
        artifact("oauth_status"),
        artifact("enterprise_delegated_auth"),
        artifact("traffic_readiness"),
        artifact("backpressure_governor"),
        artifact("load_lab"),
        artifact("offer_intelligence"),
        artifact("order_lifecycle"),
        artifact("demo_video"),
        artifact("staging_credential_drill"),
        artifact("live_signal_calibration"),
      ],
    },
    {
      id: "staging_cutover",
      label: "Staging cutover",
      status: hasClientId(config) ? "manual_input" : "external_gate",
      owner: "Swiggy",
      evidence: hasClientId(config)
        ? "Client identity is configured; complete OAuth and run seeded-data smoke."
        : "Await staging credentials or live Dynamic Client Registration approval.",
      artifacts: [
        artifact("staging_credentials"),
        artifact("staging_certification"),
        artifact("staging_cutover"),
        artifact("staging_credential_drill"),
        artifact("live_signal_calibration"),
        "/api/mcp-gateway",
        "/api/telemetry/runtime",
        artifact("audit_ledger"),
      ],
    },
    {
      id: "production_promotion",
      label: "Production promotion",
      status: productionRedirectReady && config.swiggyMode === "production" ? "manual_input" : "external_gate",
      owner: "Swiggy",
      evidence: "Production requires HTTPS exact-match redirect URI, 48 hours green staging, and Swiggy approval.",
      artifacts: [
        artifact("traffic_readiness"),
        artifact("backpressure_governor"),
        artifact("load_lab"),
        artifact("offer_intelligence"),
        artifact("order_lifecycle"),
        artifact("slo_incident_command"),
        artifact("data_governance"),
        artifact("enterprise_delegated_auth"),
        artifact("route_optimizer"),
        artifact("resilience"),
        artifact("trace_monitor"),
        artifact("audit_ledger"),
      ],
    },
  ];
}

function subjectFor(config: ServerConfig) {
  return `MealPilot India - Swiggy Builders Club access review (${config.swiggyMode})`;
}

function readinessLabelFor(config: ServerConfig): LaunchBundle["readinessLabel"] {
  if (config.swiggyMode === "production" && hasClientId(config) && config.swiggyRedirectUri.startsWith("https://")) {
    return "production_ready";
  }

  if (hasClientId(config)) return "staging_ready";

  return "local_review_ready";
}

export function buildLaunchBundle(options: { config: ServerConfig; latestPlan?: MealPlan }): LaunchBundle {
  const artifacts = buildArtifacts(options.latestPlan);
  const phases = buildPhases(options.config, options.latestPlan, artifacts);
  const accessApplication = [
    { label: "Integration name & organization", value: "MealPilot India / Farhan Khan", status: "ready" as const },
    { label: "Redirect URIs", value: options.config.swiggyRedirectUri, status: options.config.swiggyRedirectUri.startsWith("https://") ? "ready" as const : "manual_input" as const },
    { label: "Servers", value: requestedServers.join(", "), status: "ready" as const },
    {
      label: "Expected volume",
      value: "200 pilot sessions/day, about 2,400 tool calls/day, below 1 peak QPS; details in /api/traffic-readiness-plan",
      status: "ready" as const,
    },
    {
      label: "Use case",
      value: "Premium AI meal operating system across Food, Instamart, and Dineout with explicit confirmations.",
      status: "ready" as const,
    },
    { label: "Primary technical contact", value: "Add final engineering email before submission", status: "manual_input" as const },
    { label: "Demo video", value: "Record final localhost or staging run and attach URL", status: "manual_input" as const },
  ];
  const goLiveGates = [
    {
      label: "All 35 tools mapped and probed",
      status: "ready" as const,
      evidence: "/api/mcp/catalog and /api/mcp/tool-lab cover Food, Instamart, and Dineout.",
    },
    {
      label: "OAuth and DCR evidence",
      status: "ready" as const,
      evidence: "/api/credential-onboarding previews DCR; /api/auth/swiggy/status proves PKCE, callback, and token posture.",
    },
    {
      label: "Runtime logging and tracing",
      status: "ready" as const,
      evidence: "/api/telemetry/runtime, /api/audit-ledger, and /api/observability/traces expose redacted support-ready evidence.",
    },
    {
      label: "Traffic and capacity profile",
      status: "ready" as const,
      evidence: "/api/traffic-readiness-plan maps expected volume, QPS, Retry-After handling, major-event notice, and staged rollout.",
    },
    {
      label: "SLO and incident command",
      status: "ready" as const,
      evidence: "/api/slo-incident-command maps uptime, latency, status-page fallback, maintenance windows, and escalation evidence.",
    },
    {
      label: "Data governance and DSR posture",
      status: "ready" as const,
      evidence: "/api/data-governance-center maps DPDP roles, PII flows, local DSR endpoints, Swiggy DSR routing, retention, and token redaction.",
    },
    {
      label: "Enterprise delegated-auth readiness",
      status: "external_gate" as const,
      evidence:
        "/api/enterprise-delegated-auth proves the OBO flow design; platform-operator approval, final redirect allowlist, and partner contract remain external.",
    },
    {
      label: "Staging green for 48 hours",
      status: "external_gate" as const,
      evidence: "Requires Swiggy-issued staging credentials, seeded-data verification, and /api/staging-certification-matrix soak evidence.",
    },
    {
      label: "Production credentials",
      status: "external_gate" as const,
      evidence: "Requires Swiggy Builder Access approval after staging.",
    },
  ];
  const scoreItems = [...artifacts.map((item) => item.status), ...phases.map((phase) => phase.status), ...goLiveGates.map((gate) => gate.status)];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusScore(status), 0) / scoreItems.length) * 100);
  const body = [
    "Hi Swiggy Builders team,",
    "",
    "Sharing MealPilot India for Builder Access review. It is a premium AI meal-planning and commerce assistant using Food, Instamart, and Dineout with explicit confirmation gates.",
    "",
    "Key proof links:",
    "- Builder packet: /api/builder-package.md",
    "- Executable packet export: /api/builder-packet-export",
    "- Packet Markdown export: /api/builder-packet-export.md",
    "- Website Atlas: /api/swiggy-website-atlas",
    "- Swiggy Builders Launch Story Center: /api/swiggy-builders-launch-story",
    "- Deep Site Map: /api/swiggy-deep-site-map",
    "- Developer Quickstart Workbench: /api/swiggy-developer-quickstart",
    "- CTA Execution Center: /api/swiggy-cta-execution-center",
    "- Builder Intake Command Center: /api/swiggy-builder-intake",
    "- FAQ & Policy Center: /api/swiggy-faq-policy",
    "- Growth Partnership Center: /api/swiggy-growth-partnership",
    "- Channel & Multimodal Studio: /api/channel-multimodal-studio",
    "- Swiggy Visual Dish Capture Center: /api/swiggy-visual-dish-capture",
    "- Swiggy Voice Commerce Rehearsal Center: /api/swiggy-voice-commerce-center",
    "- Swiggy Quality Loop Center: /api/swiggy-quality-loop-center",
    "- Swiggy Ritual Autopilot Center: /api/swiggy-ritual-autopilot-center",
    "- Swiggy Payment Truth Center: /api/swiggy-payment-truth-center",
    "- Swiggy Meal Window Intelligence: /api/swiggy-meal-window-intelligence",
    "- Swiggy Customization Studio: /api/swiggy-customization-studio",
    "- Nutrition & Budget Intelligence: /api/nutrition-budget-intelligence",
    "- Household Preference Graph: /api/household-preference-graph",
    "- Guest Collaboration & Calendar Center: /api/guest-collaboration-calendar",
    "- Luxury Experience Workspace: /api/luxury-experience-workspace",
    "- Reviewer Artifact Vault: /api/reviewer-artifact-vault",
    "- Swiggy Demo Evidence Director: /api/swiggy-demo-evidence-director",
    "- Swiggy Access Evidence Matrix: /api/swiggy-access-evidence-matrix",
    "- Visual QA Center: /api/visual-qa-center",
    "- Submission Console: /api/submission-console",
    "- Swiggy Docs Coverage: /api/swiggy-docs-coverage",
    "- Swiggy Docs Twin Explorer: /api/swiggy-docs-twin-explorer",
    "- Swiggy Upstream Watch: /api/swiggy-upstream-watch",
    "- Swiggy Source Intelligence: /api/swiggy-source-intelligence",
    "- Swiggy Innovation Radar: /api/swiggy-innovation-radar",
    "- AI Client Connect Kit: /api/ai-client-connect-kit",
    "- Swiggy Journey Compiler: /api/swiggy-journey-compiler",
    "- Swiggy Access Dossier: /api/swiggy-access-dossier",
    "- Premium Use Case Studio: /api/premium-use-case-studio",
    "- Premium Concierge Itinerary: /api/premium-concierge-itinerary",
    "- Staging Certification Matrix: /api/staging-certification-matrix",
    "- Brand Compliance Kit: /api/brand-compliance-kit",
    "- Tool Contract Matrix: /api/mcp/tool-contract-matrix",
    "- Scenario Runner: /api/mcp/scenario-runner",
    "- State Orchestrator: /api/mcp/state-orchestrator",
    "- Widget Runtime Center: /api/mcp/widget-runtime",
    "- Commercial Action Guard: /api/mcp/commercial-action-guard",
    "- Staging Cutover Rehearsal: /api/mcp/staging-cutover",
    "- Swiggy Staging Credential Drill Center: /api/swiggy-staging-credential-drill",
    "- Swiggy Live Signal Calibration Center: /api/swiggy-live-signal-calibration",
    "- Data Governance Center: /api/data-governance-center",
    "- Enterprise Delegated Auth Center: /api/enterprise-delegated-auth",
    "- Traffic Readiness Plan: /api/traffic-readiness-plan",
    "- MCP Backpressure Governor: /api/mcp/backpressure-governor",
    "- Swiggy Load Lab: /api/swiggy-load-lab",
    "- Swiggy Quota Negotiation Center: /api/swiggy-quota-negotiation-center",
    "- Swiggy Operating Contract Center: /api/swiggy-operating-contract-center",
    "- Swiggy Offer Intelligence: /api/swiggy-offer-intelligence",
    "- Swiggy Order Lifecycle: /api/swiggy-order-lifecycle",
    "- Swiggy Location Trust: /api/swiggy-location-trust",
    "- Swiggy Cart Mutation Workbench: /api/swiggy-cart-mutation-workbench",
    "- Swiggy Discovery Freshness: /api/swiggy-discovery-freshness",
    "- Swiggy Confirmation Command Center: /api/swiggy-confirmation-command-center",
    "- Swiggy Cancellation & Care Center: /api/swiggy-cancellation-care-center",
    "- Swiggy Dineout Precision Center: /api/swiggy-dineout-precision-center",
    "- SLO Incident Command Center: /api/slo-incident-command",
    "- MCP Tool Lab: /api/mcp/tool-lab",
    "- MCP Capability Registry: /api/mcp/capability-registry",
    "- Resource & Prompt Studio: /api/mcp/resource-prompt-studio",
    "- Credential Cockpit: /api/credential-onboarding",
    "- Sandbox Credential Workbench: /api/sandbox-credential-workbench",
    "- Swiggy OAuth Status: /api/auth/swiggy/status",
    "- Swiggy Auth Lifecycle Center: /api/swiggy-auth-lifecycle-center",
    "- Swiggy Enterprise Platform Center: /api/enterprise-platform-center",
    "- Error Intelligence: /api/error-intelligence",
    "- Support Bridge: /api/support/bridge",
    "- Runtime Telemetry: /api/telemetry/runtime",
    "- Audit Ledger Center: /api/audit-ledger",
    options.latestPlan
      ? `- Staging Transcript Export: /api/sessions/${options.latestPlan.id}/staging-transcript`
      : "- Staging Transcript Export: run one plan to generate session-scoped evidence",
    "- Production smoke: npm run verify:production",
    "",
    "Manual attachments before submission: demo video URL, final technical contact email, final HTTPS redirect URI.",
  ].join("\n");

  return {
    generatedAt: new Date().toISOString(),
    score,
    readinessLabel: readinessLabelFor(options.config),
    integrationName: "MealPilot India",
    requestedServers,
    reviewerNarrative:
      "MealPilot is a confirmation-first Swiggy MCP product that composes delivery, groceries, and table reservations into one household meal operating system with complete local proof, telemetry, and review artifacts.",
    artifacts,
    phases,
    commands: [
      { id: "install", command: "npm install", proves: "Dependencies resolve for local reviewer setup." },
      { id: "dev", command: "npm run dev", proves: "Runs API and web app for localhost demo." },
      { id: "quality", command: "npm test && npm run lint && npm run build", proves: "Tests, lint, and production build pass." },
      { id: "smoke", command: "npm start && npm run verify:production", proves: "Production-style server exposes all reviewer proof endpoints." },
    ],
    accessApplication,
    goLiveGates,
    handoffEmail: {
      to: "builders@swiggy.in",
      subject: subjectFor(options.config),
      body,
    },
  };
}
