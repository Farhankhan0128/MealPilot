# MealPilot

MealPilot India is a privacy-first AI commerce assistant for Indian households and busy professionals. It helps users plan meals, build grocery baskets, order food, and plan dining experiences through Swiggy MCP.

This repository is built as a Swiggy Builders Club access packet and a runnable full-stack product prototype: a concrete real-user use case, a safe confirmation-first commerce flow, a local MCP-style server, and a production-minded technical plan for Food, Instamart, and Dineout.

## Core Use Case

A user should be able to say:

> Plan my high-protein vegetarian week under Rs 2,000. Order today's lunch, add missing groceries for dinner, and suggest a Dineout reservation for Saturday.

MealPilot turns that request into a controlled agent workflow:

1. Understand dietary preferences, budget, location, and timing.
2. Search Swiggy Food, Instamart, and Dineout through MCP tools.
3. Build a clear recommendation with costs and tradeoffs.
4. Ask for explicit confirmation before any order, checkout, or booking action.
5. Keep only the minimum user preferences needed for repeat use.

## Why This Should Qualify For Builder Access

Swiggy's access guidance asks for a concrete use case, real end users, safe user experience, OAuth readiness, responsible traffic, and minimal PII storage. MealPilot is structured around those criteria from day one.

Planned MCP servers:

- `food`: restaurant discovery, menu search, cart updates, and food orders.
- `instamart`: grocery discovery, basket creation, and checkout-ready carts.
- `dineout`: restaurant discovery, availability checks, and reservation planning.

## Product Surface

- React + TypeScript planning workspace.
- Carbon-inspired premium portal shell with `src/assets/mealpilot-logo.svg`, sticky header, mobile navigation, footer, responsive 2x grid rules, visible CTA feedback, and documented interaction contracts in `docs/design-language.md`.
- Express API that owns planning sessions, confirmations, OAuth start/callback, and mock MCP routes.
- Mock Swiggy MCP JSON-RPC endpoint for localhost demos before credentials are issued, including `tools/call`, `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`.
- Staging/production MCP gateway forwarding for `tools/call`, `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` once OAuth tokens are available.
- Swiggy staging/production endpoint map for the eventual MCP swap.
- OAuth 2.1 PKCE helper for the Swiggy authorization flow.
- Swiggy OAuth Status panel and endpoint for redacted authorize URL, callback outcome, pending PKCE verifier count, token source, expiry, storage policy, and exact-match redirect readiness.
- Swiggy Auth Lifecycle Center at `/api/swiggy-auth-lifecycle-center` that turns PKCE S256, 120-second single-use authorization codes, 5-day access tokens, no refresh-token assumption in v1.0, 401/419 re-auth recovery, exact redirect allowlisting, per-user delegated tokens, and no-token logging into reviewer evidence.
- Swiggy Benefits Activation Center at `/api/swiggy-benefits-activation-center` plus `POST /api/swiggy-benefits-activation-center/activate` that converts Builders benefits into owner-assigned live API, quota, support, co-branding, showcase, hiring visibility, growth, and enterprise support activation lanes with per-benefit handoff packets.
- Swiggy Growth Partnership composer at `POST /api/swiggy-growth-partnership/compose` that turns one launch experiment and one partner ask into a local proof packet with assets, metrics, builders@swiggy.in draft, and Swiggy-owned co-marketing gates.
- Credential Cockpit with Dynamic Client Registration preview, redirect URI audit, scope coverage, OAuth metadata endpoints, and external gate tracking.
- Swiggy Credential Vault Center at `/api/swiggy-credential-vault-center` for runtime secret posture, no-token redaction rules, rotation runbooks, cutover checks, and support-safe credential packets.
- Swiggy Credential Handoff Center at `/api/swiggy-credential-handoff-center` for localhost proof, DCR, OAuth PKCE, exact redirect URI, secret vault, staging credentials, seeded smoke, 48-hour soak, and production promotion in one owner-assigned room.
- Swiggy Credential Readiness Dossier at `/api/swiggy-credential-readiness-dossier` plus `/api/swiggy-credential-issuance/state` for durable, redacted DCR approval, client-id configured, staging credential issue, seeded-user receipt, support-thread, token-expiry, and first-read readiness metadata without storing secret values.
- Sandbox Credential Workbench that joins localhost demo proof, Dynamic Client Registration, PKCE, exact redirect allowlisting, Swiggy staging credentials, seeded-data plans, 48-hour soak, and production-promotion gates.
- Swiggy Staging Seed & Smoke Center at `/api/swiggy-staging-seed-smoke-center` that turns Food, Instamart, and Dineout seeded-data needs into read, mutation, commercial, support, telemetry, and promotion smoke waves.
- Swiggy Live Signal Calibration Center at `/api/swiggy-live-signal-calibration` that reconciles local preference, discovery, offer, order, location, and support signals with future Food, Instamart, and Dineout staging reads while preserving privacy redaction, drift thresholds, and external credential gates.
- Server-backed household profile with consent-aware preference storage.
- Plan variants for balanced, budget, protein, and social evening strategies.
- Cart editing with visible item removal and smart substitutions before confirmation.
- Confirmation modals for Food, Instamart, and Dineout actions.
- Confirm-all workflow for demo speed while preserving per-action audit entries.
- Simulated post-confirmation tracking for Food, Instamart, and Dineout.
- Pantry Autopilot with restock suggestions.
- Group planning with member-level budget, diet, and allergy constraints.
- Reminder scheduling for food, grocery, and Dineout follow-ups.
- Launch Center with the full 35-tool Swiggy MCP coverage matrix across Food, Instamart, and Dineout.
- MCP Tool Lab that probes all 35 official tools with JSON-RPC samples, response previews, route classes, safety gates, and retry policies.
- Tool Contract Matrix that lists every official Swiggy MCP tool with parameter contracts, response envelopes, retry posture, confirmation gates, error buckets, and local fixture previews.
- State Orchestrator that implements Swiggy's multi-turn cart state, server-boundary, stale-cart recovery, and voice/chat response patterns as explicit turn guards.
- Widget Runtime Center that maps Swiggy widget surfaces to iframe sandbox rules, origin-verified postMessage events, activation checks, render contracts, voice exclusions, opt-in gates, and semantic fallbacks.
- Swiggy Widget Experience Composer that turns those runtime surfaces into premium desktop, tablet, mobile, voice, and reviewer placements with gallery states, event-handler safety gates, and hosted-widget activation runbooks.
- Swiggy Hosted Widget Activation Center at `/api/swiggy-hosted-widget-activation` that packages parent-origin policy, iframe sandbox rules, postMessage handshakes, fallback parity, telemetry redaction, visual proof, and hosted URL approval gates.
- Swiggy Agent Experience Benchmark at `/api/swiggy-agent-experience-benchmark` that scores best-in-class Food, Instamart, Dineout, voice, widget, support, route-optimization, safety, and innovation journeys against UX acceptance criteria and competitive moats.
- Swiggy Private Pilot Control Room at `/api/swiggy-private-pilot-control-room` that turns benchmark journeys into real-user cohorts, consent artifacts, success metrics, telemetry targets, support paths, operator runbooks, and Swiggy staging replay gates.
- Swiggy Staging Replay Center at `/api/swiggy-staging-replay` and `/api/swiggy-staging-replay/run` that executes allowlisted safe replay probes in mock or credentialed staging mode, returns response hashes and redaction telemetry, and blocks commercial tools until seeded staging gates pass.
- Commercial Action Guard that locks Food `place_food_order`, Instamart `checkout`, Dineout `book_table`, and combined journeys behind fresh reads, explicit confirmations, check-then-retry drills, telemetry, and support packets.
- Swiggy Visual Dish Capture Center at `/api/swiggy-visual-dish-capture` plus `/api/swiggy-visual-dish-capture/analyze` that turns a dish photo, menu screenshot, pantry image, or chat image caption into Food menu, Instamart ingredient, Dineout discovery, or combined route plans with no raw-image retention and confirmation-first safety.
- Swiggy Voice Commerce Rehearsal Center at `/api/swiggy-voice-commerce-center` plus `/api/swiggy-voice-commerce-center/rehearse` that turns spoken Food, Instamart, Dineout, and combined requests into short TTS scripts, visual card fallbacks, no-raw-id readbacks, no-raw-audio telemetry, and confirmation-locked route plans.
- Swiggy Quality Loop Center at `/api/swiggy-quality-loop-center` plus `/api/swiggy-quality-loop-center/feedback` that turns post-order, grocery, booking, and combined feedback into consented preference learning, support-safe redaction, repeat optimization, and no-raw-payload telemetry.
- Swiggy Ritual Autopilot Center at `/api/swiggy-ritual-autopilot-center` plus `/api/swiggy-ritual-autopilot-center/plan` that turns recurring lunches, pantry resets, Dineout slotwatch, and weekend household routines into consented plans with reminder-only cadence, fresh reads, and no automatic checkout, order, booking, or subscription behavior.
- Swiggy Payment Truth Center at `/api/swiggy-payment-truth-center` plus `/api/swiggy-payment-truth-center/reconcile` that reconciles Food cart totals, coupons, COD, Instamart checkout bills, Dineout free bookings, and paid-cart gates from Swiggy readbacks without storing payment instruments.
- Swiggy Meal Window Intelligence at `/api/swiggy-meal-window-intelligence` plus `/api/swiggy-meal-window-intelligence/forecast` that forecasts when to order, cook, reserve, track, or wait with advisory ETA risk buckets, fresh-read timing gates, no scheduled Food orders, and tracking cadence caps.
- Swiggy Customization Studio at `/api/swiggy-customization-studio` plus `/api/swiggy-customization-studio/validate` that reviews Food add-ons, menu variants, Instamart pack sizes, allergy-sensitive substitutions, voice-safe choice limits, and cart readback gates before mutation.
- Swiggy Confirmation Command Center at `/api/swiggy-confirmation-command-center` that acts as visible final-commerce confirmation proof for Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`, requiring fresh cart or slot reads, explicit user approval, separate confirmations for combined plans, post-action status probes before retry, Swiggy-response truth for payment and free bookings, and live credential gates before external execution.
- Swiggy Cancellation & Care Center at `/api/swiggy-cancellation-care-center` that keeps Food and Instamart cancellation requests on official customer-care copy instead of fake MCP cancellation calls, routes Dineout booking issues through `get_booking_status`, and prepares `report_error` plus incident email evidence with redacted toolContext.
- Swiggy Dineout Precision Center at `/api/swiggy-dineout-precision-center` that separates free table bookings from Dineout bill-payment carts, validates `isFree=true` and `bookingPrice=0` before `book_table`, blocks paid deals from the free booking path, models `create_cart` with `cartType: "DINEOUT"` for bill payment, and keeps live payment evidence behind Swiggy staging credentials.
- MCP Backpressure Governor that models Swiggy's current upstream-shedder behavior separately from future 429, `Retry-After`, and `X-RateLimit-*` headers with token buckets, tracking cadence, voice burst shaping, and background-job gates.
- Swiggy Handshake Doctor at `/api/mcp/handshake-doctor` and `/api/swiggy-handshake-doctor` that runs safe OAuth metadata and Food `/food`, Instamart `/im`, Dineout `/dineout` endpoint probes without bearer tokens, `tools/call`, or commercial actions.
- Swiggy Load Lab that composes Traffic Readiness, Backpressure Governor, and Route Optimizer evidence into synthetic launch-load scenarios, cohort ramps, Retry-After drills, and Swiggy capacity gates.
- Swiggy Quota Negotiation Center at `/api/swiggy-quota-negotiation-center` that packages pilot/campaign capacity asks, QPS forecasts, Retry-After readiness, route optimization evidence, and a support-safe quota request for `builders@swiggy.in`.
- Swiggy Operating Contract Center that consolidates official SLA, rate-limit, support, versioning, changelog, and ship-to-production guidance into one reviewer contract with pillars, runbooks, readiness gates, and a `builders@swiggy.in` launch email.
- Swiggy Offer Intelligence at `/api/swiggy-offer-intelligence` plus `/api/swiggy-offer-intelligence/decide` that safely uses Food coupon tools, Dineout deal discovery, Instamart value substitutions, and live-offer decision gates without bypassing commercial confirmations or executing cart mutations.
- Swiggy Order Lifecycle Command Center at `/api/swiggy-order-lifecycle` plus `/api/swiggy-order-lifecycle/probe` that maps Food, Instamart, and Dineout status tools into post-confirmation timelines, executable non-blind retry decisions, tracking cadence, telemetry, and support-ready recovery.
- MCP Capability Registry that maps and locally exercises `mcp:tools`, `mcp:resources`, `mcp:prompts`, OAuth metadata, widgets, prompt contracts, and external Swiggy gates.
- Resource & Prompt Studio that exercises `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` across Food, Instamart, and Dineout with samples, smoke calls, and live Swiggy gates.
- Swiggy Website Atlas that maps the Builders header, docs subnav, footer groups, production access page, launch blog, rendered-page crawl evidence, page modules, CTAs, and legal/resource links to MealPilot evidence.
- Swiggy Builders Site Parity Auditor at `/api/swiggy-builders-site-parity` that fetches the live official homepage, extracts anchors, metadata, `llms` alternates, CTA/source/footer/legal links, and module signals, then reconciles them against Website Atlas.
- Swiggy Builders Page Mesh Auditor at `/api/swiggy-builders-page-mesh` that fetches every non-external Website Atlas Builders page from the live public site, checks anchors, page titles, CTA/module parity, approved Swiggy/Form/MCP-reference/contact origins, and semantic page integrity so generic temporary-glitch shells are disclosed as Website Atlas fallback.
- Swiggy Builders Module Intelligence Center at `/api/swiggy-builders-module-intelligence` that turns every official website module into owner, audience, product promise, Swiggy surface, MealPilot proof, route optimization, risk boundary, CTA links, module journeys, and external gates.
- Swiggy Builders Journey Gate Center at `/api/swiggy-builders-journey-gates` that maps Start Building, Apply for Prod Access, Quick Review, Go Live, and Show Us What You Built into owner gates, entry and exit criteria, proof links, telemetry, blockers, and external Swiggy approvals.
- Swiggy Builders Homepage Experience Center at `/api/swiggy-builders-homepage-experience` that maps the live homepage header, hero, how-it-works, benefits, guidelines, FAQ, final CTA, and footer into proof routes, mobile checks, reviewer checks, continuity, and external gates.
- Swiggy Builders Source Evolution Center at `/api/swiggy-builders-source-evolution` that reconciles homepage 18+ launch copy with current 35/35 callable-tool coverage, llms/docs refresh loops, roadmap drift, source gates, and reviewer packet regression proof.
- Swiggy Builders Live Source Resilience Center at `/api/swiggy-builders-live-source-resilience` that reports live homepage fetch mode, Website Atlas fallback, every-page mesh coverage, llms markdown recovery, header/footer/CTA parity, and mandatory browser re-browse gates.
- Swiggy Builders Review Decision Center at `/api/swiggy-builders-review-decision` that turns official review signals into approval-readiness gates, recommendation, reviewer questions, proof links, operator inputs, source watches, and Swiggy-owned credential/go-live gates.
- Swiggy Builders Launch Story Center that turns the launch blog into a reviewer-ready story: 18+ launch-era signal reconciled with the current 35-tool docs snapshot, demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing gates.
- Swiggy Deep Site Map that consolidates every Builders page, module, CTA, header link, docs subnav item, footer resource, source-refresh section, and MealPilot proof path into one reviewer audit.
- Developer Quickstart Workbench that turns Swiggy's official self-serve developer path into readiness steps, SDK/framework adapters, first-call `get_addresses` JSON-RPC drills, OAuth gates, and recipe handoffs.
- CTA Execution Center that converts every official Builders CTA, global header link, docs nav item, footer resource, mailto, form, and legal link into click-ready browser actions, keyboard paths, proof links, and explicit manual gates.
- CTA Live Audit at `/api/swiggy-cta-live-audit` that safely probes official Builders/docs click targets, preserves form/email/legal as manual browser gates, classifies Swiggy-side 403 source blocks as watch evidence, and flags unsafe or truly blocked CTA drift before reviewer submission.
- Builder Intake Command Center that converts every signup, apply, demo, contact, docs, and footer CTA into owner-assigned next actions, access-form fields, a demo storyboard, and copy-ready handoff drafts.
- FAQ & Policy Center that maps homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, and legal policy signals to MealPilot evidence.
- Growth Partnership Center that turns Swiggy's get-noticed, co-branding, direct-support, hiring, co-marketing, analytics, and strategic-growth signals into launch experiments, proof assets, metrics, partner asks, and a local growth-ask composer.
- Swiggy Builder Talent Signal Center at `/api/swiggy-talent-signal-center` plus `POST /api/swiggy-talent-signal-center/compose` that turns standout-project, demo, GitHub, and hiring-visibility signals into portfolio assets, talent paths, outreach packets, proof routes, and Swiggy-owned recruiting gates.
- Swiggy Builders Conversion Center at `/api/swiggy-conversion-center` that turns the final What Will You Cook CTA funnel into Start Building, See What's Possible, Request Access, Send Us a Demo, builders@swiggy.in, `llms.txt`, `llms-full.txt`, proof bundles, operator runbook, and Swiggy go-live gates.
- Swiggy Showcase Submission Center at `/api/swiggy-showcase-submission-center` that packages pitch blocks, a 2-minute demo storyboard, proof metrics, visual-gallery links, outreach copy, operator-owned inputs, and Swiggy co-branding/feature gates for a feature-ready review packet.
- Swiggy Demo Evidence Director at `/api/swiggy-demo-evidence-director` that converts the 2-3 minute recording into timed scenes, proof assets, redaction checks, visual QA links, runbook commands, and builders@swiggy.in handoff copy without recording video or sending email locally.
- Swiggy Submission Timeline Center at `/api/swiggy-submission-timeline-center` that sequences Start Building, proof freeze, demo recording, Request Access, Send Demo, Dynamic Client Registration, staging seed, 48-hour soak, and production promotion with explicit MealPilot, operator, and Swiggy ownership.
- Partner Success Desk at `/api/swiggy-partner-success-desk` plus `POST /api/swiggy-partner-success-desk/compose` that composes access handoff, developer support, SLO incidents, capacity review, backpressure, growth showcase asks, and enterprise Slack/partner-manager gates into one reviewer surface with local handoff packets.
- Swiggy Partner Support Room at `/api/swiggy-partner-support-room` plus `POST /api/swiggy-partner-support-room/compose` that turns report_error, builders@swiggy.in, S0-S3 incidents, capacity escalation, evidence attachments, redaction policy, and enterprise Slack/partner-manager gates into one post-access operator surface with local support packets.
- Swiggy Interaction QA Center at `/api/swiggy-interaction-qa-center` plus `POST /api/swiggy-interaction-qa-center/rehearse` that proves portal CTAs map to executable routes, visible feedback, automated tests, dry-run rehearsal packets, and explicit Swiggy/operator gates.
- Channel & Multimodal Studio plus `POST /api/channel-multimodal-studio/compose` that turns Swiggy's developer-page ideas into voice, web chat, Slack/Teams, mobile camera, enterprise, and screenshot-to-order contracts with local execution packets for route plans, response rules, confirmation gates, telemetry, and platform approval gates.
- Nutrition & Budget Intelligence that optimizes protein-per-rupee, coupon-safe Food carts, Instamart pantry gaps, group budgets, and Dineout balance routes without medical claims.
- Household Preference Graph that turns consented Food active orders, Instamart go-to items/order history, Dineout saved-location signals, group weights, and support failures into privacy-safe personalization.
- Guest Collaboration & Calendar Center that coordinates guest votes, occasion templates, Dineout slots, Food reminder handoffs, Instamart prep, Slack/Teams gates, and voice-safe briefs.
- Luxury Experience Workspace that turns Dineout reservations, Food carts, Instamart baskets, combined evenings, and recovery flows into polished review workspaces with all 35 Swiggy tools, concierge modes, widget fallbacks, voice contracts, telemetry, and confirmation controls.
- Reviewer Artifact Vault that packages proof links, OpenAPI, smoke commands, screenshot targets, Credential Readiness Dossier, redacted issuance state, demo-video checklist, logs, traces, redaction rules, support context, and Swiggy handoff copy into one access-submission manifest.
- Visual QA Center that maps reviewer screenshot targets, viewport sizes, selector manifests, text-fit and no-overlap rules, Swiggy widget fallback checks, mobile layout checks, and screenshot automation gates.
- Swiggy Docs Coverage audit that maps all 69 `llms.txt`-linked pages across Start, Build, Operate, Reference, and Blog to MealPilot evidence and external gates.
- Swiggy Docs Twin Explorer that pairs every official markdown twin with its rendered page URL, retrieval command, section group, proof route, and drift gate.
- Swiggy llms Manifest Verifier at `/api/swiggy-llms-manifest-verifier` that fetches the live official manifest, parses 69 markdown links, verifies rendered twins, enforces Swiggy-only origins, checks Food 14, Instamart 13, Dineout 8 reference-tool counts, and discloses Docs Coverage fallback when live `llms.txt` is blocked.
- Swiggy llms Manifest Rehearsal at `/api/swiggy-llms-manifest-verifier/rehearse` that turns live fetch, Docs Coverage fallback, and tool-parity modes into reviewer-ready decisions, commands, drift gates, telemetry, and missing input lists.
- Swiggy Tool Parity Auditor at `/api/swiggy-tool-parity-auditor` that compares live official reference tools against MealPilot's local contracts, fixtures, route classes, confirmation gates, retry policies, and 35/35 coverage, with Docs Coverage fallback when live `llms.txt` is unavailable.
- Swiggy Upstream Watch that tracks `llms.txt`, `llms-full.txt`, the changelog, v1.1/v1.2/v2 roadmap, signed manifests, and update actions for future Swiggy MCP changes.
- Swiggy Source Intelligence that reconciles Builders website pages, CTAs, `llms` docs, markdown twins, reference tool counts, drift signals, and the next build queue against MealPilot evidence.
- Swiggy Innovation Radar that turns Swiggy developer ideas, enterprise signals, access ground rules, support model, and all MCP servers into premium opportunity lanes, route optimizations, build phases, and partner gates.
- AI Client Connect Kit that generates and validates Swiggy MCP configs for Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, generic MCP clients, coding-agent rules, SDK auth modes, endpoint correctness, secret redaction, and delegated-auth gates.
- Coding Agent Governance that ships root `AGENTS.md`, scores it against official Swiggy `llms.txt`, `llms-full.txt`, markdown-twin, reference, auth, rate-limit, production, confirmation, and redaction rules, and exposes smoke tests for future coding agents.
- Brand Compliance Kit plus rehearsal that maps Powered by Swiggy attribution, co-branding rules, brand asset gates, palette usage, no-endorsement copy, launch screenshot checks, and blocked approval gates for official assets or co-brand launch.
- Data Governance Center that maps Swiggy DPDP roles, India/Singapore residency, tool-call PII flows, DSR routing, 90-day audit logs, token redaction, and signed-manifest watch items.
- Enterprise Delegated Auth Center that models Swiggy's on-behalf-of OAuth 2.1 PKCE flow, per-user token storage, platform redirect schemes, troubleshooting, architecture review, and partner gates.
- Swiggy Enterprise Platform Center that turns the official platform-operator lane into tenant controls, delegated-auth boundaries, quota readiness, support SLAs, contract gates, co-branding review, and enterprise audit exports.
- Swiggy Journey Compiler that turns official Food, Instamart, Dineout, combined, and premium MealPilot routes into call plans with all 35 tools indexed.
- Swiggy Access Dossier that maps production-access application fields, review checks, ground rules, legal readiness, developer/enterprise tracks, proof links, manual inputs, and external gates.
- Swiggy Access Evidence Matrix that reconciles every access field, review check, ground rule, legal term, required attachment, browser runbook step, proof command, owner, and Swiggy gate into one reviewer ledger.
- Premium Use Case Studio with ten differentiated MealPilot playbooks across household reset, voice dinner, date night, office lunch, care meals, pantry autopilot, recovery, hosting, travel, celebration, and reviewer mode.
- Premium Concierge Itinerary that turns official Food, Instamart, Dineout, and combined Swiggy recipes into a day-and-weekend luxury operating plan with all 35 tools covered, route savings, reminders, and separate confirmations.
- Staging Cutover Rehearsal that maps real Swiggy Streamable HTTP transport, OAuth bearer-token gates, first read-only probes, retry branches, support packets, and 48-hour staging promotion checks.
- Staging Certification Matrix that assigns all 35 Swiggy tools to OAuth, read, mutation, commercial, support, 48-hour soak, and production-promotion waves without hiding external credential gates.
- MCP Gateway status center for mock-to-staging-to-production cutover, endpoint routing, bearer-token posture, and canary rollout.
- Chat and voice response simulator that applies separate contracts for card-rich UI and spoken assistant flows.
- Go-live command center with credential, OAuth, confirmation, idempotency, observability, rollout, and privacy checks.
- Observability metrics for tool latency, success rate, confirmed actions, traceable sessions, reminder queue, and credential mode.
- Trace Monitor with span-level MCP tool evidence, redaction contracts, request IDs, and support-ready log fields.
- Runtime Telemetry ledger with live API/MCP request events, hashed user context, session correlation, redaction contract, status classes, and support-ready request IDs.
- Audit Ledger Center with redacted tool-call audit events, support correlation keys, retention posture, DSR routing, and Swiggy support packet fields.
- Swiggy Route Optimizer with call-saving journeys, optimization profiles, parallel read batches, cross-server handoffs, cache/retry rules, confirmation gates, and staging assertions.
- Support Bridge with official `report_error` JSON-RPC payloads for Food, Instamart, and Dineout, plus executable consent-gated reporting with hashed toolContext, SLA routing, redaction rules, and escalation checklist.
- SLO Incident Command Center with Swiggy uptime targets, latency classes, status-page fallback, S0/S1 comms, maintenance windows, measurement exclusions, and remediation evidence.
- Error Intelligence catalogue plus executable classifier for Swiggy `success:false` envelopes, message/HTTP classification, planned symbolic codes, domain failures, retry budgets, reauth, no-blind-retry gates, and support actions.
- Support report generator that creates a Swiggy-ready `builders@swiggy.in` escalation mail with session IDs.
- Demo Studio with cart preflight checks, offer opportunities, MCP replay transcripts, staging transcript export, demo progress, and submission-field readiness.
- Evaluation Lab with multi-scenario persona QA across Bengaluru, Delhi NCR, Mumbai, chat, voice, lean budgets, and same-day cart-safety turns.
- JSON-RPC replay endpoint that shows the exact tool-call shape MealPilot will use when Swiggy staging credentials are issued.
- Staging Transcript Export that produces session-scoped JSONL, Markdown, redaction manifest, support envelope, certification-wave mapping, and proof links for Swiggy review.
- Builder Access submission package endpoint that mirrors Swiggy's requested application fields and highlights manual inputs.
- Submission Console that consolidates developer/enterprise form targets, official access requirements, prepared fields, proof attachments, packet order, runbook steps, blockers, and copy-ready handoff drafts.
- Access Submission Studio that turns Start Building, Request access, and Send Us a Demo into one operator-facing room with copy blocks, required attachments, browser runbook, generated mailto draft, local handoff rehearsals, and explicit external gates.
- Production Launch Bundle with access fields, artifact links, verification commands, go-live gates, and a `builders@swiggy.in` handoff email draft.
- Production Evidence panel with widget contracts, rate-limit budgets, version/deprecation monitoring, compliance controls, data governance, Source Intelligence, Deep Site Map, and Innovation Radar artifacts, and reviewer proof score.
- Swiggy widget contract generator with semantic fallbacks for Food restaurant/cart, Instamart product/cart, and Dineout slot surfaces.
- Rate-limit plan aligned to planned developer-tier ceilings, including per-user, write-tool, client-day, and tracking-poll budgets.
- Version monitor for v1 route pinning, 180-day deprecation windows, and `_meta.swiggy.deprecation` alert readiness.
- DPDP-oriented compliance evidence for consent, PII minimization, deletion, audit logging, and training-data exclusion.
- Data governance evidence for fiduciary/processor boundaries, local DSR endpoints, Swiggy-originated DSR routing, retention, security contacts, and cross-border DPA gates.
- OpenAPI 3.1 contract, readiness probe, security headers, and request IDs for production review.
- Executable Resilience Lab for Swiggy's 5xx retry, 429 Retry-After, 401 reauth, non-idempotent check-then-retry, and deprecation-monitoring checklist.
- Dockerfile, Render blueprint, GitHub Actions CI, and automated production smoke verification.
- Optional file-backed persistence with snapshot export, restore, compaction, retention, and storage diagnostics.
- Privacy export and local data deletion endpoints.
- Ops status dashboard for API, MCP mode, sessions, and reminders.
- Builder Access package endpoint with readiness evidence.
- Visual Dish Capture endpoint pair for no-retention screenshot-to-order route analysis.
- Markdown export for the Builder Access packet.
- Audit timeline with tool names, session IDs, and redacted details.
- Vitest coverage for planner behavior, API behavior, UI/API integration, and retry safety.

## Repository Map

- [`src/`](src/): runnable MealPilot app and Swiggy integration layer.
- [`server/`](server/): Express API, session store, OAuth helper, and local MCP mock.
- [`docs/builder-access-application.md`](docs/builder-access-application.md): copy-ready Swiggy Builders Club application details.
- [`docs/demo-script.md`](docs/demo-script.md): 2-3 minute demo recording flow.
- [`docs/architecture.md`](docs/architecture.md): agent architecture and Swiggy MCP integration model.
- [`docs/design-language.md`](docs/design-language.md): Carbon-inspired MealPilot portal design language, logo, layout, responsive behavior, and CTA contract.
- [`docs/safety-and-compliance.md`](docs/safety-and-compliance.md): order confirmation, PII, OAuth, traffic, and abuse-prevention plan.
- [`docs/roadmap.md`](docs/roadmap.md): MVP, staging, and production path.
- [`docs/swiggy-builders-research-and-product-plan.md`](docs/swiggy-builders-research-and-product-plan.md): full Swiggy Builders website, CTA, API, route-optimization, and product strategy map.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): lint, test, build, production smoke, Playwright visual capture, builder-packet export, and reviewer artifact upload workflow.
- [`Dockerfile`](Dockerfile): production container with `/api/ready` healthcheck.
- [`render.yaml`](render.yaml): deploy blueprint with Swiggy credential placeholders.
- [`scripts/verify-production.mjs`](scripts/verify-production.mjs): automated reviewer smoke test.
- [`prototype/`](prototype/): dependency-free fallback prototype.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

This starts:

- API: `http://localhost:8787`
- Web: `http://localhost:5173`

Visit:

```text
http://localhost:5173
```

Quality checks:

```bash
npm run lint
npm test
npm run build
```

Production-style local run:

```bash
npm run build
npm start
```

Then visit:

```text
http://localhost:8787
```

Verify the production server:

```bash
npm run verify:production
```

Capture desktop, tablet, and mobile visual proof from the running production server:

```bash
MEALPILOT_URL=http://localhost:8787 npm run verify:visual
```

The visual harness writes PNG screenshots and `report.json` to `artifacts/visual-qa/`. Those files are local reviewer evidence and are intentionally ignored by git.

Export the Swiggy Builder Access packet from the running production server:

```bash
MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet
```

The exporter writes copy-ready Markdown, machine-readable JSON, and a verification summary to `artifacts/builder-packet/`. These generated files are intentionally ignored by git.

Docker run:

```bash
docker build -t mealpilot .
docker run --rm -p 8787:8787 mealpilot
```

Useful demo endpoints:

```text
GET  /api/mcp/catalog
GET  /api/swiggy-builders-map
GET  /api/swiggy-website-atlas
GET  /api/swiggy-builders-site-parity
GET  /api/swiggy-builders-page-mesh
GET  /api/swiggy-builders-module-intelligence
GET  /api/swiggy-builders-journey-gates
GET  /api/swiggy-builders-homepage-experience
GET  /api/swiggy-cta-live-audit
GET  /api/swiggy-operating-contract-center
POST /api/swiggy-operating-contract-center/rehearse
GET  /api/swiggy-builder-intake
GET  /api/swiggy-faq-policy
GET  /api/swiggy-faq-resolution-center
POST /api/swiggy-faq-resolution-center/answer
GET  /api/swiggy-growth-partnership
POST /api/swiggy-growth-partnership/compose
GET  /api/swiggy-talent-signal-center
POST /api/swiggy-talent-signal-center/compose
GET  /api/swiggy-conversion-center
GET  /api/swiggy-showcase-submission-center
POST /api/swiggy-showcase-submission-center/compose
GET  /api/swiggy-demo-evidence-director
GET  /api/swiggy-submission-timeline-center
POST /api/swiggy-submission-timeline-center/checkpoint
GET  /api/swiggy-partner-success-desk
POST /api/swiggy-partner-success-desk/compose
GET  /api/swiggy-partner-support-room
POST /api/swiggy-partner-support-room/compose
GET  /api/swiggy-interaction-qa-center
POST /api/swiggy-interaction-qa-center/rehearse
GET  /api/channel-multimodal-studio
POST /api/channel-multimodal-studio/compose
GET  /api/swiggy-visual-dish-capture
GET  /api/swiggy-voice-commerce-center
GET  /api/swiggy-quality-loop-center
GET  /api/swiggy-ritual-autopilot-center
GET  /api/swiggy-payment-truth-center
POST /api/swiggy-payment-truth-center/reconcile
GET  /api/swiggy-meal-window-intelligence
POST /api/swiggy-meal-window-intelligence/forecast
GET  /api/swiggy-customization-studio
POST /api/swiggy-customization-studio/validate
GET  /api/nutrition-budget-intelligence
POST /api/nutrition-budget-intelligence/advise
GET  /api/household-preference-graph
POST /api/household-preference-graph/simulate
GET  /api/guest-collaboration-calendar
POST /api/guest-collaboration-calendar/compose
GET  /api/luxury-experience-workspace
POST /api/luxury-experience-workspace/compose
GET  /api/reviewer-artifact-vault
POST /api/reviewer-artifact-vault/compose
GET  /api/visual-qa-center
POST /api/visual-qa-center/rehearse
GET  /api/swiggy-docs-coverage
POST /api/swiggy-docs-coverage/drill
GET  /api/swiggy-docs-twin-explorer
POST /api/swiggy-docs-twin-explorer/rehearse
GET  /api/swiggy-llms-manifest-verifier
POST /api/swiggy-llms-manifest-verifier/rehearse
GET  /api/swiggy-tool-parity-auditor
GET  /api/swiggy-upstream-watch
GET  /api/swiggy-source-intelligence
GET  /api/swiggy-source-freeze-diff
POST /api/swiggy-source-freeze-diff/freeze
GET  /api/swiggy-deep-site-map
GET  /api/swiggy-developer-quickstart
POST /api/swiggy-developer-quickstart/run-first-call
GET  /api/swiggy-cta-execution-center
GET  /api/swiggy-innovation-radar
GET  /api/ai-client-connect-kit
POST /api/ai-client-connect-kit/validate-config
GET  /api/brand-compliance-kit
POST /api/brand-compliance-kit/rehearse
GET  /api/swiggy-journey-compiler
GET  /api/swiggy-access-dossier
GET  /api/swiggy-access-evidence-matrix
GET  /api/premium-use-case-studio
GET  /api/premium-concierge-itinerary
GET  /api/staging-certification-matrix
GET  /api/ready
GET  /api/openapi.json
GET  /api/go-live
GET  /api/mcp/tool-lab
GET  /api/mcp/tool-contract-matrix
GET  /api/mcp/scenario-runner
GET  /api/mcp/state-orchestrator
POST /api/mcp/state-orchestrator/rehearse-surface
GET  /api/mcp/widget-runtime
GET  /api/swiggy-widget-experience-composer
GET  /api/swiggy-hosted-widget-activation
GET  /api/swiggy-agent-experience-benchmark
GET  /api/swiggy-private-pilot-control-room
GET  /api/swiggy-staging-replay
POST /api/swiggy-staging-replay/run
GET  /api/mcp/backpressure-governor
GET  /api/mcp/handshake-doctor
GET  /api/swiggy-handshake-doctor
GET  /api/mcp/staging-cutover
GET  /api/mcp/capability-registry
GET  /api/mcp/resource-prompt-studio
POST /api/mcp/resource-prompt-studio/execute
GET  /api/mcp-gateway
GET  /api/auth/swiggy/status
GET  /api/swiggy-auth-lifecycle-center
GET  /api/credential-onboarding
GET  /api/swiggy-credential-vault-center
GET  /api/swiggy-credential-issuance/state
PATCH /api/swiggy-credential-issuance/state
GET  /api/swiggy-credential-readiness-dossier
POST /api/swiggy-credential-readiness-dossier/rehearse
GET  /api/sandbox-credential-workbench
GET  /api/enterprise-delegated-auth
GET  /api/enterprise-platform-center
GET  /api/swiggy-load-lab
GET  /api/swiggy-quota-negotiation-center
GET  /api/swiggy-offer-intelligence
GET  /api/swiggy-order-lifecycle
POST /api/swiggy-order-lifecycle/probe
GET  /api/swiggy-location-trust
POST /api/swiggy-location-trust/select
GET  /api/swiggy-cart-mutation-workbench
POST /api/swiggy-cart-mutation-workbench/mutate
GET  /api/swiggy-discovery-freshness
POST /api/swiggy-discovery-freshness/resolve
GET  /api/swiggy-confirmation-command-center
POST /api/swiggy-confirmation-command-center/execute
GET  /api/swiggy-cancellation-care-center
GET  /api/swiggy-dineout-precision-center
GET  /api/observability/traces
GET  /api/telemetry/runtime
GET  /api/audit-ledger
GET  /api/swiggy-route-optimizer
GET  /api/support/bridge
POST /api/support/bridge/report
GET  /api/slo-incident-command
GET  /api/error-intelligence
POST /api/error-intelligence/classify
GET  /api/submission-console
GET  /api/access-submission-studio
PATCH /api/access-submission-studio/state
POST /api/access-submission-studio/rehearse
GET  /api/swiggy-builders-review-decision
GET  /api/builder-packet-export
GET  /api/builder-packet-export.md
GET  /api/sessions/:sessionId/surface?surface=chat
GET  /api/sessions/:sessionId/surface?surface=voice
GET  /api/sessions/:sessionId/preflight
GET  /api/sessions/:sessionId/replay
GET  /api/sessions/:sessionId/staging-transcript
GET  /api/demo-studio
GET  /api/evaluation-lab
GET  /api/submission-package
GET  /api/production-launch-bundle
GET  /api/sessions/:sessionId/widgets
GET  /api/rate-limit-plan
GET  /api/traffic-readiness-plan
GET  /api/version-monitor
GET  /api/compliance-evidence
GET  /api/data-governance-center
GET  /api/reviewer-proof
GET  /api/resilience
GET  /api/storage/status
GET  /api/storage/export
POST /api/storage/restore
POST /api/storage/compact
POST /api/support/report
GET  /api/builder-package.md
```

## Builder Access Demo Flow

1. Run a plan from the workspace and show Food, Instamart, and Dineout recommendations.
2. Switch the Launch Center between Chat and Voice to prove surface-specific response shaping.
3. Open MCP Coverage and show all 35 documented tools mapped across the three Swiggy servers.
4. Open Website Atlas and show header, footer, rendered-page crawl evidence, production access page, launch blog, page module, CTA, docs-subnav, and legal/resource coverage.
5. Open Builder Intake, FAQ & Policy, Growth Partnership, Conversion Center, Channel & Multimodal Studio, Visual Dish Capture, Nutrition & Budget Intelligence, Household Preference Graph, Guest Collaboration & Calendar, Luxury Experience Workspace, Reviewer Artifact Vault, Credential Readiness Dossier, Review Decision Center, Visual QA Center, and Deep Site Map to show every signup/apply/demo/contact/docs CTA, final Builders CTA, access-form field, FAQ theme, allowed/restricted/prohibited rule, developer build lane, growth experiment, partner ask, channel contract, screenshot-to-order route, macro/budget route, consented personalization signal, guest vote, calendar handoff, premium review workspace, reviewer artifact, redacted credential receipt, approval-readiness gate, visual QA target, page/module/CTA audit row, email draft, and live credential gate.
6. Open Tool Lab and show 35/35 callable JSON-RPC probes, guarded tools, commercial tools, and innovation lanes.
7. Open Tool Contract Matrix and show all 35 tool contracts, parameter counts, response envelopes, confirmation gates, retry posture, and planned error codes.
8. Open Scenario Runner and show the Food, Instamart, Dineout, and combined recipe traces with all 35 tools, confirmation gates, recovery reads, and reminder handling.
9. Open State Orchestrator and show refresh-before-mutation rules, restaurant/address switch guards, stale-cart recovery, server boundaries, and voice/chat contracts.
10. Open Widget Runtime and show iframe sandboxing, origin-verified postMessage events, semantic fallbacks, voice exclusions, and hosted-widget external gates.
11. Open Commercial Action Guard and show Food order, Instamart checkout, Dineout booking, and combined-flow confirmation locks, check-then-retry drills, telemetry fields, and support packet fields.
12. Open Capability Registry and Resource & Prompt Studio to show tools, resources, prompts, sample reads, prompt messages, smoke calls, OAuth metadata, widgets, and external gates mapped to MealPilot evidence.
13. Open Docs Coverage, Docs Twin Explorer, and llms Manifest Verifier to show all 69 Swiggy `llms.txt` pages, markdown twins, rendered page URLs, live manifest parsing, Swiggy-only origin safety, Food 14, Instamart 13, Dineout 8 tool counts, retrieval lanes, proof links, and remaining credential gates.
14. Open Upstream Watch to show `llms.txt`, `llms-full.txt`, v1.0 shipped capabilities, v1.1/v1.2/v2 roadmap items, signed-manifest watch, and the new-tool action queue.
15. Open Source Intelligence, Deep Site Map, Developer Quickstart, and CTA Execution to show website, docs, API tool counts, CTA inventory, rendered page modules, header/footer links, proof paths, first-call drills, framework adapters, OAuth gates, click targets, keyboard paths, drift signals, and the next build queue in one reviewer-ready panel.
16. Open Innovation Radar to show premium product lanes, route optimizations, build phases, differentiators, and partner gates derived from Swiggy signals.
17. Open AI Client Connect Kit and run `/api/ai-client-connect-kit/validate-config` to show six client configs, Instamart `/im` validation, coding-agent rules, SDK auth modes, secret redaction, and delegated-auth gates.
18. Open Handshake Doctor and run `/api/mcp/handshake-doctor` to show OAuth metadata, `/food`, `/im`, `/dineout` endpoint probes, credential boundaries, and why staging credentials remain the external gate.
19. Open Journey Compiler to show official recipe routes, all 35 tools indexed, confirmation gates, and call savings.
20. Open Access Dossier and Access Evidence Matrix to show production-access fields, review checks, allowed/restricted/prohibited rules, legal readiness, proof attachments, runbook steps, owners, and remaining manual inputs.
21. Open Use Case Studio to show ten premium playbooks, cross-server routing, all 35 tools placed, saved calls, surfaces, safety gates, and launch stages.
22. Open Premium Concierge to show lunch, pantry reset, Dineout evening, dessert reminder, and Sunday recovery itinerary slots with official recipe routes and separate confirmations.
23. Confirm one action, refresh tracking, and show the audit timeline with session IDs.
24. Open Demo Studio and show cart preflight, coupon opportunities, MCP replay, Submission Console, and submission readiness.
25. Start Swiggy OAuth and show the OAuth Status panel with authorize endpoint, pending PKCE verifier, callback result, token source, expiry, and no-token-logging checklist.
25. Open Credential Cockpit and show the `/auth/register` preview, localhost-vs-HTTPS redirect audit, and MCP scope coverage.
26. Open Staging Cutover and show first real MCP probes, fail-closed token behavior, support packet fields, retry branches, and 48-hour promotion gates.
27. Open Staging Credential Drill and show credential signal, first read-only JSON-RPC calls, seeded-data requirements, operator commands, handoff email, and Swiggy-owned promotion gates.
28. Open Delegated Auth Center and show per-user PKCE, token exchange, 5-day access tokens, 30-day user session, logout, troubleshooting, and enterprise partner gates.
29. Open Production Evidence and show widgets, rate limits, Traffic Readiness, MCP Backpressure Governor, Swiggy Quota Negotiation, SLO Command, Data Governance, version monitor, compliance controls, Source Intelligence artifact, Deep Site Map artifact, Developer Quickstart artifact, CTA Execution artifact, Innovation Radar artifact, Launch Bundle, Trace Monitor, Runtime Telemetry, Audit Ledger, Resilience Lab, Evaluation Lab, and reviewer proof score.
30. Schedule reminders, open Go-Live Gates, then export the Builder Access packet.
31. Open Support Bridge to show `report_error` payloads for Food, Instamart, and Dineout, then generate a support report with traceable session context.
32. Open Error Intelligence and call `/api/error-intelligence/classify` to show Swiggy error envelopes, retry buckets, planned codes, terminal domain failures, reauth decisions, and no-blind-retry gates.

## Environment

Copy `.env.example` to `.env.local` when credentials are issued:

```text
SWIGGY_ENV=mock
SWIGGY_CLIENT_ID=replace_after_builder_access
SWIGGY_REDIRECT_URI=http://localhost:5173/auth/swiggy/callback
SWIGGY_SCOPE=mcp:tools mcp:resources mcp:prompts
SWIGGY_ACCESS_TOKEN=
SWIGGY_TOKEN_EXPIRES_AT=
MEALPILOT_DATA_FILE=.mealpilot/mealpilot-store.json
MEALPILOT_PLAN_RETENTION_DAYS=14
VITE_SWIGGY_ENV=mock
VITE_SWIGGY_CLIENT_ID=replace_after_builder_access
VITE_SWIGGY_REDIRECT_URI=http://localhost:5173/auth/swiggy/callback
VITE_SWIGGY_SCOPE=mcp:tools mcp:resources mcp:prompts
```

`MEALPILOT_DATA_FILE` enables durable local JSON persistence. If it is omitted, MealPilot runs with the in-memory store for fast demos and tests.

`SWIGGY_ACCESS_TOKEN` is optional and should only be injected by a secure runtime or local staging test. OAuth callback stores exchanged tokens in process memory and never returns the full token in API responses.

`GET /api/auth/swiggy/status` is the reviewer-visible OAuth lifecycle report: Swiggy authorize/token/logout endpoints, redirect URI, scope, pending PKCE verifier count, latest callback event, token source/expiry, storage policy, and checklist for state validation, 120-second auth codes, 5-day access tokens, and no token logging.

`GET /api/swiggy-auth-lifecycle-center` is the OAuth recovery control room: it proves PKCE S256, 120-second single-use codes, 5-day access tokens, 30-day idle Swiggy sessions, no refresh-token assumption in v1.0, 401/419/403 recovery paths, exact redirect allowlisting, delegated per-user tokens, logout handling, secure storage, and no-token logging.

`GET /api/swiggy-upstream-watch` is the upstream-change control center: Swiggy `llms.txt`, `llms-full.txt`, Markdown page contract, v1.0 shipped capability/limitation inventory, v1.1/v1.2/v2 roadmap watch, signed-manifest external gate, and action queue for new tool pages, rate-limit headers, hosted widgets, and manifest signing.

`GET /api/swiggy-source-freeze-diff` and `POST /api/swiggy-source-freeze-diff/freeze` are the final source-freeze gate before demo recording or access submission: they compose live Builders Page Mesh, Website Atlas header/footer/CTA counts, llms/docs coverage, 35-tool reference parity, Access Evidence Matrix, Builder Packet Export, Upstream Watch, proof commands, missing inputs, and the mandatory browser re-browse gate without submitting external state.

`GET /api/swiggy-docs-twin-explorer` is the markdown-twin workbench: every `llms.txt` page is paired with its `.md` source, rendered URL, retrieval command, section group, MealPilot proof route, assertion, and drift gate.

`GET /api/swiggy-llms-manifest-verifier` and `POST /api/swiggy-llms-manifest-verifier/rehearse` are the manifest source layer: the verifier fetches only Swiggy's official `llms.txt`, parses markdown/rendered twins, compares against 69-page Docs Coverage, enforces Swiggy-only origins, and checks Food 14, Instamart 13, and Dineout 8 reference parity. The rehearsal endpoint accepts live-fetch, coverage-fallback, and tool-parity modes plus llms-full, parity, and drift-gate toggles, then returns a ready/manual/blocked decision, commands, sample links, telemetry, assertions, and missing inputs for reviewer packets.

`GET /api/swiggy-source-intelligence` is the source reconciliation center: Builders website pages, homepage/developer/enterprise/docs CTAs, `llms.txt`, `llms-full.txt`, markdown twins, 35-tool reference counts, drift signals, and the build queue are compared against MealPilot evidence so reviewers can see what is implemented, what is watched, and what is gated by Swiggy credentials.

`GET /api/swiggy-builders-site-parity` is the live homepage parity checker: it fetches only the official Swiggy Builders homepage, extracts anchors, metadata, `llms` alternates, module signals, CTA/source/footer/legal links, and safe-origin signals, then matches them back to Website Atlas and CTA evidence.

`GET /api/swiggy-builders-page-mesh` is the live public-page mesh checker: it fetches each non-external Builders page listed in Website Atlas, extracts anchors and titles, verifies module and CTA parity, blocks user-supplied URLs, and flags any anchor outside approved Swiggy Builders, Swiggy legal, `forms.gle`, official MCP reference, or `builders@swiggy.in` contact origins.

`GET /api/swiggy-builders-module-intelligence` is the page-module product-readiness layer: every Builders module receives an owner, audience, official signal, product promise, Swiggy surface, MealPilot proof, route optimization, risk boundary, CTA mapping, journey placement, and explicit operator or Swiggy gate.

`GET /api/swiggy-builders-journey-gates` is the official Builders journey control room: Start Building, Apply for Prod Access, Quick Review, Go Live, and Show Us What You Built are mapped to owners, readiness, criteria, proof links, telemetry, blockers, and external Swiggy gates.

`GET /api/swiggy-builders-homepage-experience` is the homepage section experience map: header, hero, how-it-works, benefits, guidelines, FAQ, final CTA, and footer each get source signals, MealPilot proof routes, mobile checks, reviewer checks, continuity links, and external gates.

`GET /api/swiggy-builders-review-decision` is the approval-readiness decision board: official Swiggy fit, demo, security, API coverage, source-review, credential, ops, and go-live signals are scored into gates, reviewer questions, proof links, recommendation, operator-owned blockers, and Swiggy-owned approval gates.

`GET /api/swiggy-builders-launch-story` is the launch-blog story center: it reconciles the April 2026 Builders Club launch narrative with the current 35-tool docs snapshot, then packages story beats, reviewer demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing guardrails.

`GET /api/swiggy-operating-contract-center` and `POST /api/swiggy-operating-contract-center/rehearse` are the operate-docs contract layer: official SLA, rate-limit, support, versioning, changelog, and ship-to-production guidance become six pillars, S0/rate-limit/support/version runbooks, readiness gates, external Swiggy approval gates, and a launch-review email draft. The rehearsal accepts local-packet, staging-cutover, and production-launch modes plus capacity, support, version, status-page, and staging credential gates, returning commands, telemetry, missing inputs, and a ready/manual/blocked decision without sending email or claiming Swiggy approval.

`GET /api/swiggy-deep-site-map` is the page-by-page Builders website audit: homepage, developers, enterprises, access, docs, reference, blog, footer, every CTA, header, docs subnav, footer resource, module signal, proof link, source-reconciliation section, assertion, and external gate in one reviewer surface.

`GET /api/swiggy-developer-quickstart` plus `POST /api/swiggy-developer-quickstart/run-first-call` is the self-serve developer onboarding workbench: official quickstart, build-agent, authenticate, and `llms.txt` sources become readiness steps, SDK/framework adapters, executable read-only first-call `get_addresses` and discovery drills, raw-address redaction telemetry, auth gates, recipe handoffs, commands, assertions, and external Swiggy credential gates.

`GET /api/swiggy-cta-execution-center` is the click-readiness workbench: every official Builders CTA, global header link, docs subnav item, footer resource, mailto, Google Form, and legal link becomes a browser action, keyboard path, proof-link bundle, completion gate, assertion, and operator handoff rule.

`GET /api/swiggy-cta-live-audit` is the live click verifier: official Builders/docs targets are safely probed with read-only requests, while forms, email, and legal links stay as manual browser gates with proof, next action, and safe-origin drift evidence.

`GET /api/swiggy-innovation-radar` is the product strategy engine: Swiggy developer ideas, enterprise signals, access ground rules, support model, and all-server MCP references become premium opportunity lanes, route optimizations, build phases, differentiators, next builds, and explicit staging or partner gates.

`GET /api/mcp/widget-runtime` is the Swiggy widget runtime proof: Food, Instamart, and Dineout widget surfaces, returned-by-tool mapping, iframe sandbox, origin verification, postMessage handlers, activation checklist, render contract matrix, semantic data-envelope fallbacks, voice rules, and hosted-widget opt-in gates.

`GET /api/swiggy-widget-experience-composer` is the premium widget experience proof: Swiggy widget runtime surfaces become concrete Launch Center placements, responsive gallery states, postMessage safety handlers, semantic fallback renderers, and a hosted-widget activation runbook for production access review.

`GET /api/swiggy-hosted-widget-activation` is the hosted-widget cutover proof: it records parent-origin policy, sandbox settings, expected widget handshakes, fallback parity, no-signed-URL telemetry, commercial confirmation routing, and the Swiggy-owned gates before hosted iframes replace semantic fallbacks.

`GET /api/swiggy-agent-experience-benchmark` is the premium journey quality proof: MealPilot benchmarks Swiggy Food, Instamart, Dineout, voice, widget, support, route optimization, safety, and innovation journeys against UX acceptance criteria, measurable call savings, competitive moats, telemetry signals, and staging or Swiggy-owned gates.

`GET /api/swiggy-private-pilot-control-room` is the real-user pilot proof: benchmark journeys are assigned to private cohorts with consent artifacts, success metrics, support paths, telemetry targets, operator runbooks, go/no-go rules, and Swiggy-owned staging credential gates before any public launch claim.

`GET /api/mcp/commercial-action-guard` is the Swiggy commercial-action safety proof: Food order placement, Instamart checkout, Dineout booking, and combined evening flows mapped to fresh authoritative reads, explicit confirmations, non-blind check-then-retry policies, redacted telemetry fields, support packet context, and staging/production gates.

`GET /api/mcp/resource-prompt-studio` plus `POST /api/mcp/resource-prompt-studio/execute` is the MCP resource and prompt proof: every Food, Instamart, and Dineout widget/static resource plus every planner, safety, and recovery prompt is listed and executable through `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` with JSON-RPC smoke requests, hashed response summaries, no raw payload retention, MealPilot uses, and live Swiggy staging gates.

`GET /api/mcp/staging-cutover` is the real-transport rehearsal: Swiggy Streamable HTTP endpoint map, first read-only staging probes, OAuth/DCR readiness, fail-closed bearer-token behavior, retry and reauth branches, support packet fields, and production promotion gates.

`GET /api/submission-console` is the operator handoff console for signing up end to end: developer/enterprise form targets, official access fields, required attachments, demo-video gate, final contact/redirect/static-egress gates, runbook steps, and builders@swiggy.in drafts.

`GET /api/access-submission-studio` is the final Swiggy access submission room: official Start Building, Request access, and Send Us a Demo targets; copy-ready form blocks; required proof attachments; browser runbook; generated mailto draft; and explicit operator/Swiggy gates. `PATCH /api/access-submission-studio/state` persists the operator-owned demo URL, primary contact, production redirect URI, egress/IP, environment summary, terms acknowledgement, form-submitted timestamp, handoff-email timestamp, and notes so the studio can move from ready-to-submit into submitted handoff state without calling Swiggy automatically. `POST /api/access-submission-studio/rehearse` runs a local pre-submit, submitted-handoff, or credential-follow-up rehearsal that returns selected official targets, copy blocks, attachments, proof commands, missing inputs, telemetry, and Swiggy-owned credential gates without submitting the form or sending email.

`GET /api/credential-onboarding` previews the Dynamic Client Registration payload for Swiggy's `POST /auth/register`, audits the redirect URI, and lists the exact access-form fields. It does not create external Swiggy state during local tests.

`GET /api/swiggy-credential-vault-center` is the metadata-only credential vault: configured/unconfigured runtime secrets, full-token redaction rules, OAuth and client rotation runbooks, support-safe packet fields, and Swiggy-owned cutover gates without returning bearer tokens.

`GET /api/swiggy-benefits-activation-center` activates the Swiggy Builders "What you get" promises: live APIs, quota expansion, technical support, Powered by Swiggy attribution, showcase visibility, hiring visibility, growth partnership, and enterprise support are mapped to MealPilot proof routes, CTAs, owner gates, and a builders@swiggy.in partner email draft. `POST /api/swiggy-benefits-activation-center/activate` powers the Launch Center selector for one benefit at a time, returning a decision, readiness score, owner, matching CTA, proof links, checklist, handoff draft, and explicit operator/Swiggy gates without sending email, submitting forms, opening Slack, requesting assets, or claiming approval.

`GET /api/swiggy-credential-handoff-center` is the credential handoff room: local demo proof, Dynamic Client Registration, exact redirect URI, OAuth PKCE, secret storage, staging credentials, seeded smoke, 35-tool certification, 48-hour soak, handoff email, and production promotion are sequenced with explicit MealPilot, operator, and Swiggy ownership.

`GET /api/swiggy-credential-issuance/state` and `PATCH /api/swiggy-credential-issuance/state` persist the redacted credential receipt ledger after Swiggy responds: DCR approval timestamp, client-id configured flag, staging credential issue timestamp, Food/Instamart/Dineout seeded-user receipt booleans, support thread id, token-expiry recorded flag, first-read probe readiness, and notes. The state never stores bearer tokens, client secrets, auth codes, PKCE verifiers, or raw seeded-user PII.

`GET /api/swiggy-credential-readiness-dossier` and `POST /api/swiggy-credential-readiness-dossier/rehearse` join source freeze, public Builders 3-server and 18+ API-tool homepage signals, 35-tool manifest certification, access submission state, DCR, credential vault, seeded staging receipts, proof commands, and production-promotion gates into one operator room.

`GET /api/sandbox-credential-workbench` is the localhost-to-staging credential runbook: demo-video readiness, Dynamic Client Registration, PKCE, exact redirect allowlisting, Swiggy-issued staging credentials, seeded Food/Instamart/Dineout data, 48-hour soak, and production-promotion gates.

`GET /api/swiggy-staging-credential-drill` is the first-live-credential drill room: credential signal, first read-only JSON-RPC probes, seeded-data requirements, fail-closed OAuth/token posture, operator commands, builders@swiggy.in handoff email, and production-promotion gates.

`GET /api/swiggy-staging-seed-smoke-center` is the seeded staging smoke matrix: Food, Instamart, and Dineout fixtures, first reads, mutation refresh checks, commercial no-blind-retry stop rules, support payload smoke, telemetry evidence, and 48-hour promotion blockers are all visible before Swiggy issues credentials.

`GET /api/enterprise-delegated-auth` turns Swiggy's enterprise delegated-auth guidance into reviewer evidence: platform DCR preregistration, per-user PKCE, authorize URL shape, token exchange, per-user token storage, MCP on-behalf-of calls, 401/419/403 recovery, logout, platform redirect schemes, architecture review, and partner contract/capacity gates.

`GET /api/enterprise-platform-center` turns Swiggy's platform-operator path into reviewer evidence: tenant boundaries, per-user delegated OAuth controls, peak-QPS and quota review, 48-hour staging soak, enterprise support channels, contract gates, co-branding approvals, redacted audit exports, and external Swiggy approvals.

`GET /api/brand-compliance-kit` and `POST /api/brand-compliance-kit/rehearse` map Swiggy attribution and co-branding readiness: Powered by Swiggy copy, no false endorsement, brand asset external gates, #FF5200 usage, white-label restrictions, surface placements, and screenshot checklist. The rehearsal accepts local-review, asset-onboarding, and co-brand-launch modes plus attribution, screenshot, official-asset, and co-brand approval gates, then returns commands, telemetry, attribution copy, missing inputs, and a ready/manual/blocked decision without modifying Swiggy marks or claiming approval.

`GET /api/swiggy-access-dossier` is the operator-facing production-access checklist: required and optional application fields, Swiggy review checks, ground rules, legal readiness, developer/enterprise tracks, proof links, and manual inputs before the Google Form submission.

`GET /api/swiggy-access-evidence-matrix` is the reviewer-facing access ledger: it derives one evidence matrix from Access Dossier, Submission Console, Access Submission Studio, and Reviewer Artifact Vault, then labels each official access field, attachment, runbook step, proof command, operator input, and Swiggy approval gate.

`GET /api/swiggy-builder-intake` is the signup and application command center: all 11 website CTA paths become locally prepared, owner-assigned actions with evidence links, required form fields, demo storyboard steps, copy-ready outbound drafts, and explicit operator/Swiggy gates for final submission and approval.

`GET /api/swiggy-faq-policy` is the FAQ and policy coverage center: homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, and legal signals map to MealPilot evidence links while enterprise contracts, co-branding, support channels, staging credentials, and production credentials remain external gates.

`GET /api/swiggy-faq-resolution-center` turns public Builders FAQ questions and policy rules into reviewer-ready answers with owners, proof links, activation CTAs, a five-step reviewer script, support contact, and explicit operator or Swiggy gates.

`POST /api/swiggy-faq-resolution-center/answer` powers the Launch Center FAQ Answer Console: it accepts one reviewer question and returns the matched FAQ answer, confidence, owner/status, proof links, related policy rules, activation CTAs, support contact, and explicit gates. Blank questions return `blocked_empty` so MealPilot never fabricates an access-review answer or triggers external forms, email, credentials, or Swiggy approvals.

`GET /api/swiggy-growth-partnership` is the growth partnership center: official get-noticed, hiring, co-branding, direct-support, enterprise analytics, and joint go-to-market signals become MealPilot launch experiments, proof assets, metric targets, and explicit partner asks while Swiggy feature placement, co-marketing approval, Slack, partner manager, dashboard access, and higher limits remain external gates. `POST /api/swiggy-growth-partnership/compose` powers the Launch Center growth composer for one experiment and one partner ask, returning a readiness decision, proof links, assets, metrics, checklist, builders@swiggy.in draft, and safety assertions without sending email, opening Slack, requesting dashboards, changing limits, or claiming Swiggy approval.

`GET /api/swiggy-talent-signal-center` is the builder talent and portfolio center: standout-project, demo, GitHub, architecture, metrics, visual proof, and outreach signals become portfolio assets and talent paths while Swiggy recruiting, feature placement, endorsement, partner channels, and enterprise support remain explicit external gates. `POST /api/swiggy-talent-signal-center/compose` powers the Launch Center Talent Signal composer with one talent path, demo URL, GitHub URL, and technical summary, returning a local outreach packet with readiness decision, missing inputs, portfolio assets, reviewer narrative, proof links, builders@swiggy.in draft, and no-endorsement assertions without sending email, applying for a role, requesting an interview, or claiming Swiggy approval.

`GET /api/swiggy-conversion-center` is the final Builders conversion room: What Will You Cook, Start Building, See What's Possible, Request Access, Send Us a Demo, builders@swiggy.in, `llms.txt`, `llms-full.txt`, proof bundles, and go-live review are mapped into owner-tagged steps, a five-step operator runbook, handoff copy, and explicit operator or Swiggy gates.

`GET /api/swiggy-showcase-submission-center` is the feature-ready Swiggy showcase packet: pitch blocks, demo storyboard, metric pack, visual proof links, and a draft builders@swiggy.in outreach email are prepared locally while the demo video URL remains operator-owned and any Powered by Swiggy or feature-placement claims stay behind Swiggy approval gates.

`POST /api/swiggy-showcase-submission-center/compose` powers the Launch Center Showcase Composer: it accepts the operator demo URL, repository URL, and contact email, then returns a copy-ready `builders@swiggy.in` outreach packet with checklist, proof links, metric pack, missing-input gates, and Swiggy approval gates. It never sends email or submits external forms.

`GET /api/swiggy-demo-evidence-director` is the recording control plane for the Swiggy demo: it prepares a 2-3 minute scene list, proof assets, visual QA requirements, redaction gates, runbook commands, and handoff email copy while leaving video recording, URL hosting, final email send, form submission, credentials, co-branding, and showcase approval as operator or Swiggy-owned gates.

`GET /api/swiggy-submission-timeline-center` is the end-to-end signup timeline: it turns Swiggy's Start Building, Request Access, Send Demo, DCR, staging, soak, and production-promotion path into eight owner-tagged phases, daily runbook actions, proof links, and external gates while preventing local automation from submitting forms, sending email, or claiming approval.

`POST /api/swiggy-submission-timeline-center/checkpoint` powers the Launch Center timeline checkpoint: it accepts demo/form/email/DCR/staging/soak/production stage booleans and returns the current phase, readiness score, next action, missing operator actions, Swiggy gates, proof links, and no-external-submission assertions.

`GET /api/swiggy-partner-success-desk` is the post-access operator room: access handoff, developer support, SLO incident readiness, capacity review, backpressure controls, growth showcase asks, and enterprise Slack/partner-manager gates are composed from existing verified proof routes with escalation email drafts. `POST /api/swiggy-partner-success-desk/compose` powers the Launch Center Partner Success composer for one support, capacity, growth, or enterprise lane, returning a decision, missing inputs, escalation email target, proof links, reviewer runbook, checklist, builders@swiggy.in draft, and explicit Slack/partner-manager/dashboard/rate-limit gates without sending email or changing external Swiggy state.

`GET /api/swiggy-partner-support-room` is the post-access support operating room: builders@swiggy.in, `report_error`, S0-S3 incident lanes, runtime telemetry, audit evidence, capacity escalation, support email drafts, redaction gates, and enterprise Slack/partner-manager approvals are composed into one operator-safe support packet. `POST /api/swiggy-partner-support-room/compose` powers the Launch Center Partner Support composer for one channel and S0-S3 incident lane, returning a readiness decision, missing inputs, redacted evidence attachments, proof links, builders@swiggy.in draft, safety assertions, and explicit report_error/Slack/partner-manager gates without sending email or changing Swiggy state.

`GET /api/swiggy-interaction-qa-center` is the clickable-portal contract: planner, confirmation, packet export, support, privacy, first-call, access submission, and partner-support CTAs are mapped to routes, visible feedback, automation coverage, manual gates, and Swiggy-owned external gates. `POST /api/swiggy-interaction-qa-center/rehearse` powers the Launch Center CTA rehearsal by selecting one lane and returning the route contract, browser action, expected feedback, proof links, automation coverage, missing-input guards, checklist, and explicit form/Slack/credential/commercial-action gates without executing unsafe external actions.

`GET /api/channel-multimodal-studio` is the developer-lane innovation center: voice ordering, auto-restock, group ordering, dietary planning, reservation planning, and screenshot-to-order become channel contracts, MCP toolchains, local execution packets, response rules, data boundaries, telemetry contracts, and external gates for Slack/Teams, mobile camera, vision/OCR, and enterprise embedding. `POST /api/channel-multimodal-studio/compose` powers the Launch Center channel composer by selecting one developer lane and one channel, returning the MCP toolchain, route plan, response rules, confirmation gate, telemetry contract, proof links, checklist, missing-input guards, and explicit Slack/Teams, camera/OCR, enterprise, credential, and commercial-action gates without executing live Swiggy commerce or external setup.

`GET /api/swiggy-visual-dish-capture` and `POST /api/swiggy-visual-dish-capture/analyze` productize the screenshot-to-order lane: the analyzer accepts a caption and optional image name, returns a detected dish label, confidence, alternatives, safe Swiggy route plans, no-raw-image-retention telemetry, and confirmation-first next actions.

`GET /api/swiggy-voice-commerce-center` and `POST /api/swiggy-voice-commerce-center/rehearse` productize voice commerce safely: the rehearsal accepts a spoken utterance transcript, classifies the Swiggy route, returns a three-line TTS script, card fallback, confirmation prompt, no-raw-audio telemetry, and Food/Instamart/Dineout toolchain evidence without placing any order or booking.

`GET /api/swiggy-quality-loop-center` and `POST /api/swiggy-quality-loop-center/feedback` productize post-experience learning: ratings and comments become consented derived tags, support-safe issue decisions, repeat-order optimization, and redacted telemetry without storing raw Swiggy payloads or crossing server boundaries.

`GET /api/swiggy-ritual-autopilot-center` and `POST /api/swiggy-ritual-autopilot-center/plan` productize recurring household routines: weekday lunches, pantry resets, date-night slotwatch, and weekend route choices become consented drafts with fresh Swiggy reads, reminder-only calendar cadence, and explicit confirmation boundaries before any commercial action.

`GET /api/swiggy-payment-truth-center` and `POST /api/swiggy-payment-truth-center/reconcile` productize payment and settlement truth: cart totals, coupon savings, payment labels, COD eligibility, Instamart bill breakdown, Dineout free-booking proof, and paid-cart gates come only from Swiggy cart or status readbacks. The Launch Center reconciler makes this interactive by returning settlement status, selected truth lane, risk flags, support-review copy, and no-payment-instrument telemetry.

`GET /api/swiggy-meal-window-intelligence` and `POST /api/swiggy-meal-window-intelligence/forecast` productize meal timing: Food ETA windows, Instamart availability, Dineout slots, and tracking cadence become advisory order/cook/reserve/track/wait routes with no scheduled Food orders and no raw ETA or slot payload retention. The Launch Center forecaster makes this interactive with city, window, urgency, party-size, and Dineout-slot controls that return the selected Swiggy route, ETA risk, and timing-plan proof.

`GET /api/swiggy-customization-studio` and `POST /api/swiggy-customization-studio/validate` productize item choice safety: Food `search_menu` customization shape, menu browsing, add-ons, variants, Instamart pack-size truth, full-cart replacement, allergy cautions, and post-mutation cart readbacks become a visible review layer before any cart write. The Launch Center validator makes this actionable with server, intent, quantity, allergy, variant, and Dineout-aware controls that return mutation risk, selected Swiggy route, required cart readback, and checklist proof.

`GET /api/nutrition-budget-intelligence` and `POST /api/nutrition-budget-intelligence/advise` are the premium nutrition and budget layer: Food menu search, coupons, cart reads, Instamart go-to items, product search, Dineout slots, and combined routes become protein-per-rupee, pantry-gap, group-budget, and evening-balance playbooks with explicit nutrition-estimate safety controls. The Launch Center advisor accepts city, budget, protein target, party size, route preference, coupon sensitivity, and Dineout intent, then returns budget fit, selected Swiggy route, protein coverage, fresh-read checklist, and no-medical-claim telemetry without mutating carts.

`GET /api/household-preference-graph` and `POST /api/household-preference-graph/simulate` are the consented personalization layer: Food active-order signals, Instamart order history and go-to items, Dineout saved-location and booking signals, household modes, pantry forecasts, and support failure memory become ranking weights with retention rules and DPDP controls. The Launch Center simulator accepts city, household mode, preferred Swiggy server, history consent, recent-failure context, and occasion mode, returning a local-only, personalized, or support-safe fallback decision with redacted telemetry and no raw Swiggy history retention.

`GET /api/guest-collaboration-calendar` and `POST /api/guest-collaboration-calendar/compose` are the group planning and calendar layer: guest votes, Dineout-first date nights, guests-at-home prep, office lunch, weekday reset, recovery meals, ICS reminders, share links, Slack/Teams digests, and voice briefs stay aligned with separate Swiggy confirmations and the Food v1 no-scheduled-delivery constraint. The Launch Center composer turns a template, channel, guest count, city, and Dineout intent into a local handoff with route steps, calendar/share artifact, missing channel gates, no-scheduled-Food telemetry, and separate booking/order/checkout boundaries.

`GET /api/luxury-experience-workspace` and `POST /api/luxury-experience-workspace/compose` are the premium review layer: lean, premium, family, social, and training modes become Dineout reservation, Food cart, Instamart basket, combined evening, and recovery workspaces with all 35 Swiggy tools, authoritative reads, widget fallbacks, voice contracts, telemetry, and separate confirmation gates. The Launch Center composer accepts mode, workspace, city, guest count, budget, and Dineout confirmation, then returns a read-only route rehearsal with review artifacts, missing gates, redacted telemetry, no-commerce assertions, and separate Food, Instamart, and Dineout approval boundaries.

`GET /api/reviewer-artifact-vault` and `POST /api/reviewer-artifact-vault/compose` are the Swiggy access-submission manifest and packet composer: proof links, OpenAPI, smoke commands, screenshot targets, Credential Readiness Dossier, redacted credential issuance state, Demo Evidence Director, demo-video checklist, logs, traces, redaction rules, support context, and handoff email copy are bundled in one route. The Launch Center composer accepts artifact section, channel, audience, screenshots, demo-video, and credential-gate inputs, then returns a reviewer-safe packet with included artifacts, commands, redaction rules, email copy, missing attachment gates, telemetry, and explicit no-secret assertions.

`GET /api/visual-qa-center` and `POST /api/visual-qa-center/rehearse` are the screenshot and layout evidence center: desktop, tablet, and mobile selectors, Playwright artifact paths, no-overlap rules, text-fit rules, widget fallback checks, redaction visibility, commercial confirmation visibility, Source Intelligence, Deep Site Map, Innovation Radar, and screenshot automation gates are made reviewable. The Launch Center rehearsal accepts target group, viewport, capture mode, Swiggy-widget inclusion, and manual attachment readiness, then returns screenshot targets, rules, commands, artifact paths, readiness decision, missing capture gates, telemetry, and no-blank-render assertions.

`GET /api/swiggy-docs-coverage` and `POST /api/swiggy-docs-coverage/drill` are the 69-page Swiggy source coverage layer: every `llms.txt` page across Start, Build, Operate, Reference, and Blog is mapped to rendered and markdown URLs, MealPilot evidence, and external gates. The Launch Center drill accepts docs section, focus, rendered-twin inclusion, and external-gate disclosure, then returns selected pages, evidence routes, retrieval commands, readiness decision, missing source gates, telemetry, and credential/drift assertions.

`GET /api/swiggy-docs-twin-explorer` and `POST /api/swiggy-docs-twin-explorer/rehearse` pair every official markdown twin with its rendered Swiggy page. The Launch Center rehearsal accepts retrieval lane, docs section, rendered-page inclusion, and proof-link inclusion, then returns source pairs, commands, readiness decision, missing drift gates, telemetry, and source-safety assertions.

`GET /api/swiggy-llms-manifest-verifier` and `POST /api/swiggy-llms-manifest-verifier/rehearse` verify the official coding-agent manifest and make it executable from Launch Center. The verifier parses live or fallback manifest links, rendered twins, safe origins, and Food 14 / Instamart 13 / Dineout 8 reference counts. The rehearsal accepts manifest mode, llms-full, tool parity, and drift-gate inputs, then returns reviewer commands, telemetry, assertions, a readiness decision, and manual gates when source evidence is incomplete.

`GET /api/coding-agent-governance` is the repo-native Swiggy coding-agent proof: it reads the actual root `AGENTS.md`, verifies official docs source signals, preserves the Food 14 / Instamart 13 / Dineout 8 smoke split, lists guardrails, and fails production verification when future coding-agent rules drift.

`GET /api/builder-packet-export` and `GET /api/builder-packet-export.md` generate the executable Swiggy access packet: prepared form fields, required attachments, verification commands, local artifact paths, visual QA proof, handoff email copy, and explicit operator/Swiggy gates for form submission, demo video, credentials, redirect URI, and co-branding approval.

`GET /api/premium-use-case-studio` is the product innovation map: ten premium MealPilot experiences, all 35 official Swiggy tools placed into use-case routes, cross-server call savings, chat/voice/widget/ops surfaces, safety gates, data boundaries, metrics, differentiators, roadmap, and external gates.

`GET /api/premium-concierge-itinerary` is the premium product operating layer: official Food, Instamart, Dineout, and combined recipe routes become lunch, pantry, Dineout evening, dessert reminder, and recovery itinerary slots with 35-tool coverage, saved-call optimizations, cart refresh rules, separate confirmation gates, and live-credential external gates.

`GET /api/mcp/tool-contract-matrix` is the contract-level Swiggy integration map: all 35 Food, Instamart, and Dineout tools get parameter metadata, source/privacy labels, response envelope guidance, confirmation gates, retry policy, planned/current error buckets, official reference links, and local fixture previews.

`GET /api/swiggy-tool-parity-auditor` is the live-reference reconciliation layer: the official Swiggy `llms.txt` reference tools are matched against MealPilot contracts, fixtures, route classes, commercial/support safety labels, confirmation gates, retry posture, and server-by-server 14/13/8 parity before access submission.

`GET /api/mcp/scenario-runner` executes the official Food, Instamart, Dineout, and combined recipes as local JSON-RPC `tools/call` traces, including guard/recovery probes, support paths, confirmation-gated commerce steps, and full 35-tool coverage.

`GET /api/mcp/state-orchestrator` plus `POST /api/mcp/state-orchestrator/rehearse-surface` turns Swiggy's multi-turn cart state and voice/chat pattern docs into executable MealPilot rules: authoritative cart refreshes, Food restaurant-switch warnings, Instamart address-switch clears, Dineout slot refreshes, stale-cart recovery, and same-route chat, voice, and widget surface rehearsals with raw-ID suppression and commercial-action locks.

`GET /api/swiggy-route-optimizer` is the official-recipe optimization ledger: it compares baseline and optimized Food, Instamart, Dineout, and combined routes, exposes optimizer profiles, explicit parallel read batches, cross-server handoffs, cache windows, retry ownership, redaction rules, call savings, and commercial confirmation boundaries.

`GET /api/staging-certification-matrix` is the credentialed launch map: all 35 Swiggy tools assigned to staging smoke waves, OAuth/DCR prerequisites, 48-hour soak requirements, telemetry/redaction expectations, rollback policy, and production-promotion gates.

`GET /api/swiggy-staging-replay` and `POST /api/swiggy-staging-replay/run` are the credentialed replay bridge: local mock calls are marked dry-run, live calls require OAuth bearer state, response bodies are reduced to hashes and redaction telemetry, and `place_food_order`, `checkout`, and `book_table` stay blocked until Swiggy staging approval and seeded data are ready.

`GET /api/sessions/:sessionId/staging-transcript` exports a Swiggy-ready transcript for one plan session: JSONL log lines, Markdown replay, request IDs, hashed user id, redaction manifest, non-blind retry evidence, support envelope, and certification-wave links.

`GET /api/traffic-readiness-plan` converts Swiggy's expected-volume and rate-limit guidance into reviewer evidence: projected sessions/tool calls, peak QPS, per-lane budgets, Retry-After handling, 1% to 100% rollout stages, seven-day major-event notice, and a capacity-upgrade email draft.

`GET /api/swiggy-load-lab` is the launch-load workbench: it simulates pilot, evening-peak, voice-burst, and campaign-spike scenarios without sending live Swiggy traffic; checks per-lane ceilings, Retry-After readiness, 1% to 100% cohort gates, commercial serialization, and capacity-approval actions.

`GET /api/swiggy-quota-negotiation-center` is the Swiggy capacity packet: it composes rate-limit budgets, Traffic Readiness, Backpressure Governor, Load Lab scenarios, Route Optimizer savings, Retry-After header readiness, campaign upgrade gates, runbook steps, and a no-secret email body for `builders@swiggy.in`.

`GET /api/swiggy-offer-intelligence` and `POST /api/swiggy-offer-intelligence/decide` are the discount-safety workbench: they sequence Food `fetch_food_coupons` before `apply_food_coupon`, validate Dineout deal context before booking, treat Instamart savings as product-variant and cart-bill optimization, and return apply/surface/block decisions without executing cart mutations.

`GET /api/swiggy-order-lifecycle` plus `POST /api/swiggy-order-lifecycle/probe` is the post-confirmation command center: it maps Food `get_food_orders`, `get_food_order_details`, `track_food_order`, Instamart `get_orders`, `get_order_details`, `track_order`, and Dineout `get_booking_status` into status timelines, executable status-refresh/defer/support/retry decisions, non-blind retry probes, tracking cadence, redacted telemetry, and support packet rules.

`GET /api/swiggy-location-trust` plus `POST /api/swiggy-location-trust/select` is the saved-address and location trust center: it covers shared Food/Instamart `get_addresses`, Instamart `create_address` and `delete_address`, Dineout `get_saved_locations`, address-choice pauses, executable ready/pause/block/mutation decisions, address switch refresh guards, raw-address redaction, and staging credential gates.

`GET /api/swiggy-cart-mutation-workbench` plus `POST /api/swiggy-cart-mutation-workbench/mutate` is the cart mutation control room: it covers Food `get_food_cart`, `update_food_cart`, and `flush_food_cart`, Instamart `get_cart`, `update_cart`, and `clear_cart`, Dineout `create_cart`, executable readback-after-write decisions, payment-method truth, add-on confirmation, no-commercial-action guarantees, and live cart-write gates.

`GET /api/swiggy-discovery-freshness` plus `POST /api/swiggy-discovery-freshness/resolve` is the search and availability workbench: it covers Food `search_restaurants`, `get_restaurant_menu`, and `search_menu`, Instamart `search_products` and `your_go_to_items`, Dineout `search_restaurants_dineout`, `get_restaurant_details`, and `get_available_slots`, with executable read-only discovery, pagination truth, variant selection, coordinate consistency, no-cart-mutation telemetry, and stale-result invalidation.

`GET /api/swiggy-confirmation-command-center` plus `POST /api/swiggy-confirmation-command-center/execute` is the visible and executable final-commerce confirmation proof for Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`: it shows fresh cart or slot reads, explicit user approval, separate approvals for combined plans, guarded preflight -> protected action -> status-probe execution, Swiggy-response payment and free-booking truth, no-blind-retry telemetry, paid-Dineout blocking, and external gates for live credentials.

`GET /api/swiggy-cancellation-care-center` is the no-tool cancellation and support workbench: it shows official customer-care copy for Food and Instamart cancellation requests, Dineout booking-status recovery, `report_error` payload context across all three servers, incident email boundaries, planned error-code gates, and live support calibration gates.

`GET /api/swiggy-dineout-precision-center` is the Dineout free-booking and bill-payment precision workbench: it separates `book_table` free reservations from `create_cart` bill-payment carts, requires free-deal proof before booking, blocks paid deals, preserves no-blind retry through `get_booking_status`, and leaves live payment validation as a Swiggy credential gate.

`GET /api/support/bridge` plus `POST /api/support/bridge/report` is the executable Swiggy support bridge: it prepares and sends official Food, Instamart, or Dineout `report_error` calls only after an observed user-visible issue, a MealPilot session id, and user consent; it hashes toolContext identifiers, strips phone/email/secret patterns from notes, records report receipts, and leaves live Swiggy support execution credential-gated outside mock mode.

`GET /api/slo-incident-command` turns Swiggy's SLA and uptime guidance into operational evidence: 99.9% uptime targets, latency bands for read/write/commercial tools, status-page fallback, S0-S3 communication plans, 72-hour maintenance notice, measurement exclusions, and remediation path.

`GET /api/data-governance-center` turns Swiggy's Data & Compliance guidance into DPDP evidence: Data Fiduciary/Data Processor roles, India/Singapore residency, tool-call PII inventory, local and Swiggy-originated DSR routing, 90-day Swiggy audit-log retention, token redaction, security contacts, and signed-manifest watch items.

`GET /api/audit-ledger` turns plan audit trails into support-safe Swiggy evidence: redacted session/tool events, support correlation keys, local retention posture, Swiggy 90-day audit-log acknowledgement, DSR routing, and builders@swiggy.in packet fields without raw payloads or tokens.

`GET /api/swiggy-live-signal-calibration` is the live-personalization calibration center: it maps Food active orders, Instamart go-to/order history, Dineout saved locations/booking status, discovery relevance, offer/cart truth, and support failure memory into read-only staging probes with privacy controls and fallback rules.

`GET /api/production-launch-bundle` consolidates the reviewer handoff: proof artifacts, commands, application fields, manual inputs, external Swiggy gates, and the draft access-review email. It intentionally keeps staging credentials and production approval marked as external gates until Swiggy issues them.

## Current Status

Runnable full-stack localhost app, optional durable persistence, 35-tool Swiggy MCP coverage map, Swiggy Website Atlas with production-access and launch-blog coverage, Swiggy Builders Site Parity, Page Mesh, Module Intelligence, Journey Gate, Homepage Experience, Live Source Resilience, and Source Freeze Diff auditors, CTA Execution and Live Audit coverage, Swiggy Builders Launch Story Center, Swiggy Operating Contract Center, Builder Intake Command Center, FAQ & Policy Center, Growth Partnership Center, Swiggy Builders Conversion Center, Swiggy Showcase Submission Center, Partner Success Desk, Channel & Multimodal Studio, Swiggy Visual Dish Capture Center, Swiggy Voice Commerce Rehearsal Center, Swiggy Quality Loop Center, Swiggy Ritual Autopilot Center, Swiggy Payment Truth Center, Swiggy Meal Window Intelligence, Swiggy Customization Studio, Nutrition & Budget Intelligence, Household Preference Graph, Guest Collaboration & Calendar Center, Luxury Experience Workspace, Reviewer Artifact Vault, Visual QA Center, 69-page Swiggy Docs Coverage audit, Swiggy Docs Twin Explorer, Swiggy llms Manifest Verifier, Swiggy Upstream Watch, Swiggy Source Intelligence, Swiggy Deep Site Map, Developer Quickstart Workbench, CTA Execution Center, Swiggy Innovation Radar, AI Client Connect Kit, Coding Agent Governance with root `AGENTS.md`, Brand Compliance Kit, Data Governance Center, Enterprise Delegated Auth Center, Swiggy Enterprise Platform Center, Swiggy Journey Compiler, Swiggy Access Dossier, Swiggy Access Evidence Matrix, Premium Use Case Studio, Premium Concierge Itinerary, Staging Cutover Rehearsal, Swiggy Staging Credential Drill Center, Swiggy Live Signal Calibration Center, Swiggy Handshake Doctor, Staging Certification Matrix, Staging Transcript Export, executable 35-tool MCP Tool Lab, Tool Contract Matrix, Scenario Runner, State Orchestrator, Widget Runtime Center, Swiggy Widget Experience Composer, Swiggy Hosted Widget Activation Center, Swiggy Agent Experience Benchmark, Swiggy Private Pilot Control Room, Commercial Action Guard, Swiggy Confirmation Command Center, Swiggy Cancellation & Care Center, Swiggy Dineout Precision Center, MCP Capability Registry, Resource & Prompt Studio, staging/production MCP gateway, Swiggy OAuth Status, Swiggy Auth Lifecycle Center, Credential Cockpit with OAuth/DCR evidence, Swiggy Credential Vault Center for secret posture and redaction, Sandbox Credential Workbench for localhost-to-staging access readiness, runtime telemetry ledger, Audit Ledger Center, Submission Console, Access Submission Studio, builder access proposal, technical packet, safety plan, launch readiness dashboard, demo studio, production evidence center, Traffic Readiness Plan, Swiggy Load Lab, Swiggy Quota Negotiation Center, Swiggy Offer Intelligence, Swiggy Order Lifecycle, SLO Incident Command Center, Production Launch Bundle, executable resilience drills, Support Bridge, Error Intelligence, multi-scenario evaluation lab, submission package, support workflow, and tests are ready. Next step: record the 2-3 minute demo and submit the Swiggy Builders Club access form with the GitHub repo and packet export.

CI/CD and deploy assets are included: GitHub Actions runs lint, tests, build, production smoke verification, Playwright screenshot capture, and builder-packet export, then uploads reviewer evidence artifacts; Docker serves the built frontend and API from one container; Render can deploy from `render.yaml` after Swiggy credentials are issued.

## Official References

- Swiggy Builders Club: https://mcp.swiggy.com/builders/
- Developers: https://mcp.swiggy.com/builders/developers/
- Enterprises: https://mcp.swiggy.com/builders/enterprises/
- Access application and ground rules: https://mcp.swiggy.com/builders/access/
- Docs home: https://mcp.swiggy.com/builders/docs/
- Access and onboarding: https://mcp.swiggy.com/builders/docs/operate/access/
- Developer start guide: https://mcp.swiggy.com/builders/docs/start/
- Authenticate: https://mcp.swiggy.com/builders/docs/start/authenticate/
- Coding agents: https://mcp.swiggy.com/builders/docs/start/coding-agents/
- Enterprise platform start: https://mcp.swiggy.com/builders/docs/start/enterprise/
- Enterprise delegated auth: https://mcp.swiggy.com/builders/docs/start/enterprise/delegated-auth/
- Changelog: https://mcp.swiggy.com/builders/docs/operate/changelog/
- Combined Food + Dineout recipe: https://mcp.swiggy.com/builders/docs/build/recipes/combined/
- Ship to production: https://mcp.swiggy.com/builders/docs/build/ship-to-production/
- SLA & uptime: https://mcp.swiggy.com/builders/docs/operate/sla/
- Data & compliance: https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/
