import type {
  ReviewerArtifactCommand,
  ReviewerArtifactItem,
  ReviewerArtifactPacketChannel,
  ReviewerArtifactPacketComposition,
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
        "access_submission_studio",
        "Access Submission Studio",
        "api",
        "/api/access-submission-studio",
        "Official Start Building, Request access, and Send Us a Demo targets with copy blocks, required attachments, saved handoff state, browser runbook, mailto draft, and local rehearsals.",
        "Never submits the external Swiggy form or sends email; demo URL, contacts, redirect URI, egress, terms, credentials, and approval stay explicit operator or Swiggy gates.",
      ),
      artifact(
        "submission_timeline_center",
        "Swiggy Submission Timeline Center",
        "api",
        "/api/swiggy-submission-timeline-center",
        "Start Building, proof freeze, demo recording, Request Access, Send Demo, DCR, staging seed, 48-hour soak, partner success, and production promotion sequenced into one owner-tagged timeline.",
        "Form submission, email send, DCR approval, staging credentials, seeded data, production promotion, and showcase approval remain operator or Swiggy gates.",
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
        "showcase_submission_center",
        "Swiggy Showcase Submission Center",
        "api",
        "/api/swiggy-showcase-submission-center",
        "Feature-ready pitch blocks, demo storyboard, metric proof, visual-gallery links, and builders@swiggy.in outreach copy for the Show Us What You Built path.",
        "Demo video hosting, final email send, co-branding, public Swiggy claims, and showcase approval stay operator or Swiggy-owned.",
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
      artifact("capability_traceability", "Swiggy Capability Traceability Matrix", "api", "/api/swiggy-capability-traceability", "Official pages, website modules, CTAs, MCP server families, lifecycle gates, owners, route optimizations, proof links, and external gates mapped to MealPilot proof surfaces.", "External Swiggy form submission, staging credentials, co-branding, quotas, showcase placement, and production approval remain operator or Swiggy-owned."),
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
      artifact("credential_readiness_dossier", "Swiggy Credential Readiness Dossier", "api", "/api/swiggy-credential-readiness-dossier", "Source-freeze-aware credential receipt dossier with redacted issuance state, DCR/client receipt, staging credentials, seeded-user gates, proof commands, and rehearsal packets.", "No bearer tokens, client secrets, authorization codes, PKCE verifiers, or raw seeded-user PII are returned."),
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
      artifact("hosted_widget_activation", "Swiggy Hosted Widget Activation Center", "api", "/api/swiggy-hosted-widget-activation", "Parent-origin policy, iframe sandbox, postMessage handshakes, fallback parity, telemetry redaction, and hosted URL gates.", "Hosted widget URLs and approved parent origin remain Swiggy-owned external gates."),
      artifact("agent_experience_benchmark", "Swiggy Agent Experience Benchmark", "api", "/api/swiggy-agent-experience-benchmark", "Best-in-class journey quality benchmark across speed, trust, personalization, multimodal continuity, resilience, action safety, and innovation moats.", "Live cohort benchmark claims remain gated until staging credentials and operator-run pilots."),
      artifact("private_pilot_control_room", "Swiggy Private Pilot Control Room", "api", "/api/swiggy-private-pilot-control-room", "Private-pilot cohorts, consent artifacts, success metrics, telemetry targets, support paths, operator runbook, and staging replay gates.", "Participant identities, live cohort results, staging credentials, and public launch claims remain external-gated."),
      artifact("staging_replay_center", "Swiggy Staging Replay Center", "api", "/api/swiggy-staging-replay", "Credential-aware safe replay probes, dry-run evidence, blocked commercial tools, response hashes, and Swiggy handoff packet.", "Live staging replay requires OAuth credentials; commercial actions remain blocked until seeded staging gates pass."),
      artifact("commercial_action_guard", "Commercial Action Guard", "api", "/api/mcp/commercial-action-guard", "Food order, Instamart checkout, Dineout booking, and combined journey confirmations with check-then-retry drills.", "Live commercial actions stay external-gated until staging credentials and production approval."),
      artifact("openapi_contract", "OpenAPI contract", "api", "/api/openapi.json", "Reviewer-readable HTTP contract for MealPilot proof surfaces.", "No secrets or live tokens in schema examples."),
    ],
  },
  {
    id: "mcp_client_readiness",
    label: "MCP client and coding-agent readiness",
    artifacts: [
      artifact("ai_client_connect", "AI Client Connect Kit", "api", "/api/ai-client-connect-kit", "Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, generic MCP client, SDK auth, endpoint, and redaction-ready config evidence.", "Generated snippets use placeholders and never include bearer tokens or client secrets."),
      artifact("coding_agent_governance", "Coding Agent Governance", "api", "/api/coding-agent-governance", "Root AGENTS.md, official Swiggy coding-agent docs, markdown twin retrieval, tool split, confirmation rules, and no-token/no-PII guardrails.", "Reads repo instructions and public docs only; no credentials or live user payloads are exposed."),
      artifact("mcp_gateway", "MCP Gateway", "api", "/api/mcp-gateway", "Local mock, staging, and production gateway posture with OAuth token presence, fail-closed state, and per-server endpoint readiness.", "Token values are redacted; absent credentials remain external gates."),
      artifact("capability_registry", "MCP Capability Registry", "api", "/api/mcp/capability-registry", "Tools, resources, prompts, OAuth metadata, widgets, static metadata, prompt templates, and external gates in one MCP inventory.", "Contains capability metadata and route links, not secrets."),
      artifact("handshake_doctor", "Swiggy Handshake Doctor", "api", "/api/mcp/handshake-doctor", "Safe OAuth metadata plus Food, Instamart, and Dineout endpoint probes without bearer tokens, tools/call, or commercial actions.", "Probe results avoid arbitrary URLs and never send credentials."),
      artifact("llms_manifest_verifier", "Swiggy llms Manifest Verifier", "api", "/api/swiggy-llms-manifest-verifier", "Official llms.txt or disclosed Docs Coverage fallback parsing, rendered twins, Swiggy-only origin checks, and Food 14 / Instamart 13 / Dineout 8 reference counts.", "Public manifest links only; fallback mode is explicitly labelled."),
      artifact("tool_parity_auditor", "Swiggy Tool Parity Auditor", "api", "/api/swiggy-tool-parity-auditor", "Live reference tools reconciled against MealPilot contracts, fixtures, route classes, confirmation gates, retry posture, and 35/35 server parity.", "Fixture previews avoid live customer payloads and commercial execution."),
      artifact("docs_coverage", "Swiggy Docs Coverage", "api", "/api/swiggy-docs-coverage", "69-page llms.txt source map across Start, Build, Operate, Reference, and Blog with MealPilot proof links and external gates.", "Public documentation coverage only; credential-only fields remain gated."),
    ],
  },
  {
    id: "source_freeze_live_audit",
    label: "Source freeze and live-site QA",
    artifacts: [
      artifact("builders_site_parity", "Swiggy Builders Site Parity", "api", "/api/swiggy-builders-site-parity", "Live Builders homepage anchors, metadata, llms alternates, CTA/source/footer/legal links, and Website Atlas reconciliation.", "Fetches only official public Swiggy pages and stores metadata rather than page HTML."),
      artifact("builders_page_mesh", "Swiggy Builders Page Mesh", "api", "/api/swiggy-builders-page-mesh", "Every non-external Website Atlas Builders page checked for reachability, anchors, titles, CTA/module parity, and approved origins.", "User-supplied URLs are rejected; public source glitches are disclosed as drift."),
      artifact("cta_live_audit", "CTA Live Audit", "api", "/api/swiggy-cta-live-audit", "Official Builders/docs click targets probed safely, with forms, email, and legal links kept as manual browser gates.", "No external forms, email sends, or legal workflows are auto-submitted."),
      artifact("interaction_qa", "Swiggy Interaction QA Center", "api", "/api/swiggy-interaction-qa-center", "Planner, confirmation, packet export, support, privacy, first-call, access submission, and partner-support CTAs mapped to executable route contracts and visible feedback.", "External Swiggy gates remain manual and unsafe commercial actions are never executed."),
      artifact("source_freeze_diff", "Swiggy Source Freeze Diff", "api", "/api/swiggy-source-freeze-diff", "Live page mesh, Website Atlas counts, llms/docs coverage, tool parity, Access Evidence Matrix, Builder Packet Export, Upstream Watch, proof commands, and browser re-browse gates in one pre-submission freeze.", "Browser re-browse receipts are metadata-only and exclude screenshots, cookies, tokens, and page HTML."),
      artifact("credential_vault_center", "Swiggy Credential Vault Center", "api", "/api/swiggy-credential-vault-center", "Runtime credential metadata, configured-secret posture, redaction rules, rotation runbooks, cutover checks, and support-safe credential packets.", "Full bearer tokens, refresh tokens, authorization codes, client secrets, and PKCE verifiers are never returned."),
      artifact("staging_seed_smoke", "Swiggy Staging Seed & Smoke Center", "api", "/api/swiggy-staging-seed-smoke-center", "Food, Instamart, and Dineout seeded fixtures mapped to read, mutation, commercial, support, telemetry, and promotion smoke waves.", "Live staging execution waits for Swiggy-issued credentials and seeded test users."),
    ],
  },
  {
    id: "executable_rehearsal_matrix",
    label: "Executable CTA rehearsal matrix",
    artifacts: [
      artifact("access_submission_rehearsal", "Access Submission Rehearsal", "api", "/api/access-submission-studio/rehearse", "Official access-form packet dry-run with operator inputs, proof attachments, browser runbook, generated mailto, and Swiggy-owned submit gates.", "Does not submit the external form or send email."),
      artifact("reviewer_packet_composer", "Reviewer Artifact Packet Composer", "api", "/api/reviewer-artifact-vault/compose", "Reviewer-safe packets by section, channel, audience, screenshots, demo-video, and credential-gate choices.", "No bearer tokens, client secrets, screenshots, or demo videos are attached automatically."),
      artifact("visual_qa_rehearsal", "Visual QA Rehearsal", "api", "/api/visual-qa-center/rehearse", "Screenshot target group, viewport, capture mode, Swiggy-widget inclusion, and manual attachment readiness converted into commands and layout proof.", "Manual capture gates stay labelled until artifacts are present."),
      artifact("docs_coverage_drill", "Docs Coverage Drill", "api", "/api/swiggy-docs-coverage/drill", "Selected llms.txt docs sections, rendered twins, retrieval commands, proof links, and source drift gates.", "Public docs only; credential-only source evidence remains gated."),
      artifact("docs_twin_rehearsal", "Docs Twin Rehearsal", "api", "/api/swiggy-docs-twin-explorer/rehearse", "Markdown/rendered-page proof packets for official Swiggy docs twins, retrieval lanes, and reviewer evidence.", "Does not store private docs or credentials."),
      artifact("llms_manifest_rehearsal", "llms Manifest Rehearsal", "api", "/api/swiggy-llms-manifest-verifier/rehearse", "Live-fetch, Docs Coverage fallback, and tool-parity modes with commands, telemetry, assertions, readiness decisions, and missing source gates.", "Fallback mode is explicitly disclosed."),
      artifact("ai_client_validate_config", "AI Client Config Validation", "api", "/api/ai-client-connect-kit/validate-config", "AI client endpoint, Instamart /im route, SDK auth mode, submitted-client gate, and secret redaction validation.", "Only placeholder configs are returned; secrets are never echoed."),
      artifact("brand_compliance_rehearsal", "Brand Compliance Rehearsal", "api", "/api/brand-compliance-kit/rehearse", "Powered by Swiggy attribution, co-branding boundaries, no-endorsement copy, asset gates, and screenshot checklist.", "Swiggy logo/co-brand approval remains external."),
      artifact("interaction_qa_rehearsal", "Interaction QA Rehearsal", "api", "/api/swiggy-interaction-qa-center/rehearse", "CTA dry-run packets with route contracts, browser actions, expected feedback, automation proof, and external gates.", "Unsafe external or commercial actions are not executed."),
      artifact("source_freeze_rehearsal", "Source Freeze Rehearsal", "api", "/api/swiggy-source-freeze-diff/freeze", "Pre-demo, pre-access-submission, and post-source-change freeze gates with metadata-only browser re-browse receipts.", "No screenshots, cookies, tokens, or page HTML are stored in receipts."),
      artifact("growth_partnership_composer", "Growth Partnership Composer", "api", "/api/swiggy-growth-partnership/compose", "Launch experiment, metrics, proof-asset, co-marketing, and builders@swiggy.in partner ask packet.", "Co-marketing, dashboards, endorsement, and Swiggy approval remain external."),
      artifact("partner_success_composer", "Partner Success Composer", "api", "/api/swiggy-partner-success-desk/compose", "Support, quota, incident, growth, enterprise, escalation, and partner-manager handoff packet.", "Partner manager, Slack, support dashboard, and email-send actions remain external."),
      artifact("showcase_submission_composer", "Showcase Submission Composer", "api", "/api/swiggy-showcase-submission-center/compose", "Pitch copy, demo storyboard, metric pack, visual gallery, outreach copy, and showcase approval gates.", "Demo hosting, outreach sending, and showcase placement remain operator or Swiggy gates."),
      artifact("channel_multimodal_composer", "Channel & Multimodal Composer", "api", "/api/channel-multimodal-studio/compose", "Voice, web chat, Slack/Teams, mobile camera, enterprise, and screenshot-to-order execution packets.", "External channel installs and raw media capture remain operator controlled."),
      artifact("nutrition_budget_advisor", "Nutrition & Budget Advisor", "api", "/api/nutrition-budget-intelligence/advise", "Protein-per-rupee, coupon-safe Food carts, Instamart pantry gaps, group budgets, Dineout balance, and nutrition-data gates.", "Nutrition outputs are estimates until live merchant nutrition fields exist."),
      artifact("household_preference_simulator", "Household Preference Simulator", "api", "/api/household-preference-graph/simulate", "Consented Food, Instamart, Dineout, household-weight, forecast, privacy, and external history gates.", "No raw Swiggy order payloads or household PII are stored."),
      artifact("guest_collaboration_composer", "Guest Collaboration Composer", "api", "/api/guest-collaboration-calendar/compose", "Guest vote, occasion, Dineout-first, Food reminder, Instamart prep, calendar, Slack/Teams, and no-scheduled-delivery packets.", "Guest identities and external calendar writes stay gated."),
      artifact("luxury_experience_composer", "Luxury Experience Composer", "api", "/api/luxury-experience-workspace/compose", "Premium Dineout, Food, Instamart, combined-evening, and recovery workspaces with widget fallbacks and confirmation boundaries.", "No commercial actions are executed without explicit confirmation and credentials."),
    ],
  },
  {
    id: "partner_signal_operations",
    label: "Partner, brand, and live-signal operations",
    artifacts: [
      artifact("operating_contract", "Swiggy Operating Contract Center", "api", "/api/swiggy-operating-contract-center", "SLA, rate-limit, support, versioning, changelog, ship-to-production, and incident runbooks consolidated for reviewer handoff.", "Swiggy production SLA, support channels, and credentialed go-live remain external gates."),
      artifact("brand_compliance", "Brand Compliance Kit", "api", "/api/brand-compliance-kit", "Powered by Swiggy attribution, co-branding boundaries, asset-gate checks, launch screenshots, and no-endorsement copy.", "Public Swiggy claims, logo usage, and co-branding approvals stay Swiggy-owned."),
      artifact("partner_success_desk", "Swiggy Partner Success Desk", "api", "/api/swiggy-partner-success-desk", "Access handoff, developer support, SLO incidents, capacity review, backpressure, growth showcase asks, and enterprise gates in one packet composer.", "Partner manager, Slack, bespoke SLA, dashboard, and email-send actions remain operator or Swiggy gates."),
      artifact("live_signal_calibration", "Swiggy Live Signal Calibration Center", "api", "/api/swiggy-live-signal-calibration", "Preference, discovery, offer, order, location, and support signal probes mapped to staging reads, privacy controls, drift thresholds, and external credential gates.", "Live Swiggy-originated signal reads require staging or production credentials and are never implied from local fixtures."),
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
  {
    id: "runtime_governance",
    label: "Runtime governance and session proof",
    artifacts: [
      artifact("health_check", "Health Check", "api", "/api/health", "Process-level health for local production smoke and reviewer readiness.", "Contains service status only, no user data."),
      artifact("readiness_check", "Readiness Check", "api", "/api/ready", "API/static serving, storage mode, OAuth scope, session count, and 35/35 MCP coverage.", "Redacts credentials and reports configuration posture only."),
      artifact("runtime_config", "Runtime Config", "api", "/api/config", "Redacted runtime configuration, Swiggy MCP base URLs, redirect URI, scope, and feature availability.", "No client secrets, tokens, or environment secrets are returned."),
      artifact("privacy_delete", "Privacy Delete", "api", "/api/privacy", "MealPilot-held DSR deletion behavior for local sessions while keeping Swiggy-owned data boundaries explicit.", "Deletes local app data only; Swiggy-originated DSRs remain Swiggy-routed."),
      artifact("privacy_export", "Privacy Export", "api", "/api/privacy/export", "MealPilot-held session export for DSR review.", "No raw Swiggy payload bodies, tokens, payment details, phone, email, or full addresses."),
      artifact("storage_status", "Storage Status", "api", "/api/storage/status", "Memory/durable storage mode, stored-session counts, compaction posture, and backup readiness.", "Storage metadata only; no raw user payloads."),
      artifact("storage_export", "Storage Export", "api", "/api/storage/export", "Support-safe local storage snapshot for reviewer backup drills.", "Exports only local application state with sensitive fields omitted."),
      artifact("storage_compact", "Storage Compact", "api", "/api/storage/compact", "Local compaction drill for data retention and support footprint control.", "Does not modify Swiggy systems or live credentials."),
      artifact("storage_restore", "Storage Restore", "api", "/api/storage/restore", "Local restore drill for reviewer reproducibility and recovery evidence.", "Accepts support-safe exports only."),
      artifact("reviewer_proof", "Reviewer Proof", "api", "/api/reviewer-proof", "Proof score, launch evidence, telemetry posture, screenshot status, and submission readiness.", "Aggregates safe proof links without secrets."),
      artifact("evaluation_lab", "Evaluation Lab", "api", "/api/evaluation-lab", "Persona and scenario QA for route quality, action safety, privacy, and premium experience acceptance.", "Uses local scenarios and avoids live customer data."),
      artifact("submission_package", "Submission Package", "api", "/api/submission-package", "Swiggy application fields, proof links, attachments, support context, and external gates.", "Operator-owned fields stay labelled until final submission."),
      artifact("demo_studio", "Demo Studio", "api", "/api/demo-studio", "Demo script, scenes, proof assets, and operator-owned video gates.", "No video is uploaded or sent automatically."),
      artifact("support_bridge_report", "Support Bridge Report", "api", "/api/support/bridge/report", "Consent-gated report_error payload drills with redacted context, receipts, SLA routing, and escalation fields.", "Observed issue and user consent are required; raw upstream payloads stay excluded."),
      artifact("session_readback", "Session Readback", "api", "/api/sessions/{sessionId}", "Session plan, recommendations, confirmations, audit ids, and support correlation for reviewer replay.", "Session ids are local and support-safe; no raw Swiggy payloads."),
      artifact("session_preflight", "Session Preflight", "api", "/api/sessions/{sessionId}/preflight", "Stale-data, confirmation, route, and safety checks before commercial action.", "Preflight evidence only; no action is executed."),
      artifact("session_replay", "Session Replay", "api", "/api/sessions/{sessionId}/replay", "Redacted session replay with route decisions, tool evidence, and non-blind retry posture.", "No bearer tokens, payment data, or full addresses."),
      artifact("session_widgets", "Session Widgets", "api", "/api/sessions/{sessionId}/widgets", "Widget render contracts, fallback states, and session-scoped postMessage readiness.", "Hosted widget URLs remain gated until Swiggy approval."),
      artifact("session_staging_transcript", "Session Staging Transcript", "api", "/api/sessions/{sessionId}/staging-transcript", "Swiggy-ready JSONL and Markdown replay with redaction manifest, support envelope, and certification-wave mapping.", "Transcript hashes identifiers and excludes secrets."),
      artifact("planner_api", "Planner API", "api", "/api/plan", "Core MealPilot planner entrypoint across Food, Instamart, Dineout, route optimization, telemetry, and support evidence.", "Planner uses local/mock proof until Swiggy credentials exist."),
      artifact("confirmation_api", "Confirmation API", "api", "/api/confirm", "Single explicit confirmation path with commercial-action safety boundaries.", "Requires explicit recommendation selection and does not blind-retry."),
      artifact("confirm_all_api", "Confirm All API", "api", "/api/confirm-all", "Batch confirmation safety with explicit user intent, preflight proof, and audit correlation.", "Commercial execution remains gated by credentials and confirmations."),
      artifact("go_live", "Go Live Checklist", "api", "/api/go-live", "Production promotion checks, approval gates, traffic posture, observability, and rollback readiness.", "Swiggy production approval remains external."),
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
  screenshot("credential_readiness_card", "Credential Readiness Dossier card", "/", ".credential-readiness-card", "mobile", "Shows redacted credential issuance receipts, homepage-vs-manifest source signals, rehearsal controls, and Swiggy credential gates.", "Use /api/swiggy-credential-readiness-dossier JSON readback."),
  screenshot("hosted_widget_preview", "Hosted widget preview", "/", ".widget-runtime-card", "desktop", "Shows semantic fallbacks for Swiggy widget types and hosted iframe gates.", "Use /api/mcp/widget-runtime until hosted iframe URLs are live.", "external_gate"),
  screenshot("widget_experience_composer", "Swiggy Widget Experience Composer", "/", ".widget-experience-card", "desktop", "Shows premium Swiggy widget placements, gallery states, event handlers, and hosted-widget gates.", "Use /api/swiggy-widget-experience-composer JSON readback."),
  screenshot("hosted_widget_activation", "Swiggy Hosted Widget Activation Center", "/", ".hosted-widget-card", "desktop", "Shows hosted-widget host policies, handshakes, fallback parity, external gates, and Swiggy approval status.", "Use /api/swiggy-hosted-widget-activation JSON readback."),
  screenshot("agent_experience_benchmark", "Swiggy Agent Experience Benchmark", "/", ".agent-benchmark-card", "desktop", "Shows benchmarked premium Swiggy journeys, tool coverage, UX gates, and best-in-class score.", "Use /api/swiggy-agent-experience-benchmark JSON readback."),
  screenshot("private_pilot_control_room", "Swiggy Private Pilot Control Room", "/", ".private-pilot-card", "desktop", "Shows real-user pilot cohorts, assigned journeys, gates, telemetry metrics, and Swiggy staging dependencies.", "Use /api/swiggy-private-pilot-control-room JSON readback."),
  screenshot("staging_replay_card", "Swiggy Staging Replay Center", "/", ".staging-replay-card", "desktop", "Shows safe replay tools, dry-run/live counts, commercial blocks, server readiness, and wave execution coverage.", "Use /api/swiggy-staging-replay JSON readback."),
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

const audienceCopy: Record<ReviewerArtifactPacketComposition["audience"], string> = {
  builder_access:
    "Builder Access packet emphasizes production-readiness proof, OpenAPI, tool coverage, visual evidence, and explicit Swiggy gates.",
  demo_review:
    "Demo review packet emphasizes the short working-flow recording, screenshot targets, reviewer script, and visible no-secret posture.",
  partner_support:
    "Partner support packet emphasizes report_error readiness, incident evidence, support-safe logs, telemetry, and escalation context.",
};

function scorePacket(statuses: ReviewerArtifactStatus[]) {
  return Math.max(40, Math.min(99, Math.round((statuses.reduce((sum, status) => sum + statusScore(status), 0) / statuses.length) * 100)));
}

function channelLabel(channel: ReviewerArtifactPacketChannel) {
  if (channel === "access_form") return "access form";
  if (channel === "github_packet") return "GitHub packet";
  return "email draft";
}

export function composeReviewerArtifactPacket(input: {
  sectionId: string;
  channel: ReviewerArtifactPacketChannel;
  audience: ReviewerArtifactPacketComposition["audience"];
  includeScreenshots: boolean;
  includeDemoVideo: boolean;
  includeCredentialGates: boolean;
}): ReviewerArtifactPacketComposition {
  const selectedSection = artifactSections.find((section) => section.id === input.sectionId);
  const includedArtifacts = selectedSection?.artifacts ?? [];
  const selectedScreenshots = input.includeScreenshots ? screenshotTargets.filter((target) => target.status !== "external_gate").slice(0, 8) : [];
  const selectedCommands = commands.filter((commandItem) => commandItem.status === "ready");
  const selectedChecklist = handoffChecklist.filter(
    (item) => input.includeCredentialGates || !item.label.toLowerCase().includes("credential"),
  );
  const missingInputs: string[] = [];

  if (!selectedSection) missingInputs.push("known reviewer artifact section");
  if (input.includeDemoVideo && handoffChecklist.some((item) => item.id === "record_video" && item.status === "manual_input")) {
    missingInputs.push("demo video URL");
  }
  if (input.includeScreenshots && input.channel === "access_form" && input.audience === "builder_access") {
    missingInputs.push("selected screenshots");
  }
  if (input.includeCredentialGates) missingInputs.push("final redirect URI and static IP");

  const statusInputs = [
    ...(includedArtifacts.length > 0 ? includedArtifacts.map((item) => item.status) : (["external_gate"] as ReviewerArtifactStatus[])),
    ...(selectedScreenshots.length > 0 ? selectedScreenshots.map((item) => item.status) : (["manual_input"] as ReviewerArtifactStatus[])),
    ...selectedCommands.map((item) => item.status),
    ...selectedChecklist.map((item) => item.status),
  ];
  const readinessScore = scorePacket(statusInputs);
  const decision: ReviewerArtifactPacketComposition["decision"] = !selectedSection
    ? "unknown_section"
    : missingInputs.length > 0
      ? "manual_attachment_gate"
      : "ready_packet";

  const body = [
    "Hi Swiggy Builders team,",
    "",
    audienceCopy[input.audience],
    "",
    `Packet channel: ${channelLabel(input.channel)}`,
    `Artifact section: ${selectedSection?.label ?? input.sectionId}`,
    `Included artifacts: ${includedArtifacts.map((artifactItem) => artifactItem.path).join(", ") || "none"}`,
    `Verification commands: ${selectedCommands.map((commandItem) => commandItem.command).join(" | ")}`,
    "",
    missingInputs.length > 0 ? `Manual inputs still needed: ${missingInputs.join(", ")}.` : "All selected packet inputs are ready for reviewer handoff.",
  ].join("\n");

  return {
    generatedAt: new Date().toISOString(),
    decision,
    readinessScore,
    channel: input.channel,
    audience: input.audience,
    selectedSection,
    includedArtifacts,
    screenshotTargets: selectedScreenshots,
    commands: selectedCommands,
    handoffChecklist: selectedChecklist,
    missingInputs,
    redactionRules,
    reviewerEmail: {
      to: "builders@swiggy.in",
      subject: `MealPilot Swiggy MCP ${channelLabel(input.channel)} packet`,
      body,
    },
    telemetry: [
      { field: "section_id", value: selectedSection?.id ?? input.sectionId, redaction: "safe artifact section id" },
      { field: "channel", value: input.channel, redaction: "safe channel enum" },
      { field: "audience", value: input.audience, redaction: "safe reviewer audience enum" },
      { field: "artifact_count", value: String(includedArtifacts.length), redaction: "aggregate count only" },
      { field: "screenshot_count", value: String(selectedScreenshots.length), redaction: "aggregate count only" },
    ],
    assertions: [
      "The packet contains proof links and commands only; it does not attach bearer tokens, OAuth codes, cookies, payment data, or raw Swiggy payloads.",
      "Manual demo video, screenshots, credentials, redirect URI, and production approval gates remain explicitly labelled instead of fabricated.",
      "Reviewer-facing copy distinguishes local proof, mock evidence, staging gates, and Swiggy-owned production approval.",
      "Every included artifact inherits the vault redaction posture before it is shared through form, email, or GitHub packet channels.",
    ],
    nextAction:
      decision === "ready_packet"
        ? `Attach the ${selectedSection?.label ?? "selected"} packet through the ${channelLabel(input.channel)} with the ready verification commands.`
        : decision === "manual_attachment_gate"
          ? `Resolve ${missingInputs.join(", ")} before sending the ${channelLabel(input.channel)} packet.`
          : "Choose a known reviewer artifact section before preparing a Swiggy handoff packet.",
  };
}

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
    "- Swiggy Capability Traceability Matrix: /api/swiggy-capability-traceability",
    "- Swiggy Builders Journey Gate Center: /api/swiggy-builders-journey-gates",
    "- Swiggy Builders Homepage Experience Center: /api/swiggy-builders-homepage-experience",
    "- Swiggy Builders Source Evolution Center: /api/swiggy-builders-source-evolution",
    "- Swiggy Builders Live Source Resilience Center: /api/swiggy-builders-live-source-resilience",
    "- Swiggy Builders Review Decision Center: /api/swiggy-builders-review-decision",
    "- Deep Site Map: /api/swiggy-deep-site-map",
    "- Developer Quickstart Workbench: /api/swiggy-developer-quickstart",
    "- CTA Execution Center: /api/swiggy-cta-execution-center",
    "- Swiggy FAQ Resolution Center: /api/swiggy-faq-resolution-center",
    "- Swiggy Operating Contract Center: /api/swiggy-operating-contract-center",
    "- Brand Compliance Kit: /api/brand-compliance-kit",
    "- Growth Partnership Center: /api/swiggy-growth-partnership",
    "- Swiggy Partner Success Desk: /api/swiggy-partner-success-desk",
    "- Swiggy Builder Talent Signal Center: /api/swiggy-talent-signal-center",
    "- Swiggy Builders Conversion Center: /api/swiggy-conversion-center",
    "- Traffic Readiness Plan: /api/traffic-readiness-plan",
    "- Swiggy Quota Negotiation Center: /api/swiggy-quota-negotiation-center",
    "- Data Governance Center: /api/data-governance-center",
    "- Swiggy Live Signal Calibration Center: /api/swiggy-live-signal-calibration",
    "- Builder packet: /api/builder-package.md",
    "- OpenAPI: /api/openapi.json",
    "- Demo script: docs/demo-script.md",
    "- Demo Evidence Director: /api/swiggy-demo-evidence-director",
    "- Swiggy Showcase Submission Center: /api/swiggy-showcase-submission-center",
    "- Swiggy Partner Support Room: /api/swiggy-partner-support-room",
    "- Swiggy Benefits Activation Center: /api/swiggy-benefits-activation-center",
    "- Access Submission Studio: /api/access-submission-studio",
    "- Swiggy Submission Timeline Center: /api/swiggy-submission-timeline-center",
    "- Swiggy Credential Handoff Center: /api/swiggy-credential-handoff-center",
    "- Swiggy Credential Readiness Dossier: /api/swiggy-credential-readiness-dossier",
    "- Credential Issuance Receipt State: /api/swiggy-credential-issuance/state",
    "- Swiggy Builders Site Parity: /api/swiggy-builders-site-parity",
    "- Swiggy Builders Page Mesh: /api/swiggy-builders-page-mesh",
    "- CTA Live Audit: /api/swiggy-cta-live-audit",
    "- Swiggy Interaction QA Center: /api/swiggy-interaction-qa-center",
    "- Swiggy Source Freeze Diff: /api/swiggy-source-freeze-diff",
    "- Swiggy Credential Vault Center: /api/swiggy-credential-vault-center",
    "- Swiggy Staging Seed & Smoke Center: /api/swiggy-staging-seed-smoke-center",
    "- Access Submission Rehearsal: /api/access-submission-studio/rehearse",
    "- Reviewer Artifact Packet Composer: /api/reviewer-artifact-vault/compose",
    "- Visual QA Rehearsal: /api/visual-qa-center/rehearse",
    "- Docs Coverage Drill: /api/swiggy-docs-coverage/drill",
    "- Docs Twin Rehearsal: /api/swiggy-docs-twin-explorer/rehearse",
    "- llms Manifest Rehearsal: /api/swiggy-llms-manifest-verifier/rehearse",
    "- AI Client Config Validation: /api/ai-client-connect-kit/validate-config",
    "- Brand Compliance Rehearsal: /api/brand-compliance-kit/rehearse",
    "- Interaction QA Rehearsal: /api/swiggy-interaction-qa-center/rehearse",
    "- Source Freeze Rehearsal: /api/swiggy-source-freeze-diff/freeze",
    "- Growth Partnership Composer: /api/swiggy-growth-partnership/compose",
    "- Partner Success Composer: /api/swiggy-partner-success-desk/compose",
    "- Showcase Submission Composer: /api/swiggy-showcase-submission-center/compose",
    "- Channel & Multimodal Composer: /api/channel-multimodal-studio/compose",
    "- Nutrition & Budget Advisor: /api/nutrition-budget-intelligence/advise",
    "- Household Preference Simulator: /api/household-preference-graph/simulate",
    "- Guest Collaboration Composer: /api/guest-collaboration-calendar/compose",
    "- Luxury Experience Composer: /api/luxury-experience-workspace/compose",
    "- Health Check: /api/health",
    "- Readiness Check: /api/ready",
    "- Runtime Config: /api/config",
    "- Privacy Delete: /api/privacy",
    "- Privacy Export: /api/privacy/export",
    "- Storage Status: /api/storage/status",
    "- Storage Export: /api/storage/export",
    "- Storage Compact: /api/storage/compact",
    "- Storage Restore: /api/storage/restore",
    "- Reviewer Proof: /api/reviewer-proof",
    "- Evaluation Lab: /api/evaluation-lab",
    "- Submission Package: /api/submission-package",
    "- Demo Studio: /api/demo-studio",
    "- Support Bridge Report: /api/support/bridge/report",
    "- Session Readback: /api/sessions/{sessionId}",
    "- Session Preflight: /api/sessions/{sessionId}/preflight",
    "- Session Replay: /api/sessions/{sessionId}/replay",
    "- Session Widgets: /api/sessions/{sessionId}/widgets",
    "- Session Staging Transcript: /api/sessions/{sessionId}/staging-transcript",
    "- Planner API: /api/plan",
    "- Confirmation API: /api/confirm",
    "- Confirm All API: /api/confirm-all",
    "- Go Live Checklist: /api/go-live",
    "- AI Client Connect Kit: /api/ai-client-connect-kit",
    "- Coding Agent Governance: /api/coding-agent-governance",
    "- MCP Gateway: /api/mcp-gateway",
    "- MCP Capability Registry: /api/mcp/capability-registry",
    "- Swiggy Handshake Doctor: /api/mcp/handshake-doctor",
    "- Swiggy llms Manifest Verifier: /api/swiggy-llms-manifest-verifier",
    "- Swiggy Tool Parity Auditor: /api/swiggy-tool-parity-auditor",
    "- Swiggy Docs Coverage: /api/swiggy-docs-coverage",
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
