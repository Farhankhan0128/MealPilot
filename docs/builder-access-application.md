# Swiggy Builders Club Application

This is the copy-ready application packet for MealPilot.

## Integration Name

MealPilot India

## Organization

Farhan Khan / MealPilot

## One-Paragraph Use Case

MealPilot India is a privacy-first AI commerce assistant for Indian households and busy professionals. It converts natural-language goals like "high-protein vegetarian week under Rs 2,000" or "plan Saturday dinner for four" into safe Swiggy MCP workflows across Food, Instamart, and Dineout. It discovers suitable meals, builds Instamart baskets for missing ingredients, recommends Dineout reservations, and never places an order, checkout, or booking without explicit user confirmation. The first pilot targets 50-100 users in Bengaluru, Delhi NCR, and Mumbai through a web chat interface.

## Servers Requested

- `food`
- `instamart`
- `dineout`

Rationale: MealPilot's core value comes from composing food delivery, grocery restocking, and dining reservations into one household planning workflow.

## Redirect URIs

Local development:

```text
http://localhost:5173/auth/swiggy/callback
```

Production placeholder:

```text
https://mealpilot.app/auth/swiggy/callback
```

The production URI will use HTTPS and exact-match OAuth redirect validation.

## Expected Volume

Pilot estimate:

- Users: 100 pilot users.
- Sessions: 2 sessions per user per week.
- Tool calls: 8-15 Swiggy MCP calls per session.
- Weekly calls: about 1,600-3,000 MCP tool calls.
- Peak traffic: below 1 QPS during the private pilot.
- Orders: initially fewer than 20 completed orders or bookings per day.

Scale-up after staging:

- Expand to 500 users only after staging has been stable for at least 48 hours.
- Notify Swiggy before any public launch, campaign, or traffic spike.

## Technical Readiness

- OAuth 2.1 PKCE flow with HTTPS redirect URI in production.
- Swiggy Auth Lifecycle Center that proves PKCE S256, 120-second codes, 5-day tokens, no v1 refresh-token assumption, 401/419/403 recovery, delegated per-user token boundaries, logout, secure storage, and no-token logging.
- Credential Cockpit that previews Dynamic Client Registration at `/auth/register`, audits localhost vs HTTPS redirect URIs, tracks `mcp:tools mcp:resources mcp:prompts`, and labels external gates.
- Separate MCP clients for Food, Instamart, and Dineout.
- MCP Gateway that keeps mock demos local, fails closed without staging auth, and routes to Swiggy streamable HTTP once OAuth provides a bearer token.
- Local 35-tool MCP coverage map aligned to Food, Instamart, and Dineout reference docs.
- Local MCP JSON-RPC mock supports `tools/call`, `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` so all requested scopes have executable review evidence.
- Swiggy Website Atlas that maps the Builders global header, docs subnav, footer groups, production access page, launch blog, page modules, CTAs, and legal/resource links to MealPilot artifacts.
- Swiggy Builders Module Intelligence Center that maps every official website module to owner, audience, product promise, Swiggy surface, MealPilot proof, route optimization, risk boundary, CTA links, journeys, and gates.
- Swiggy Builders Journey Gate Center that maps Start Building, Apply for Prod Access, Quick Review, Go Live, and Show Us What You Built to owner gates, entry and exit criteria, proof routes, telemetry, blockers, and explicit external Swiggy decisions.
- Swiggy Builders Homepage Experience Center that maps homepage header, hero, how-it-works, benefits, guidelines, FAQ, final CTA, and footer sections to local proof, mobile/reviewer checks, continuity, and external gates.
- Swiggy Builders Source Evolution Center that reconciles homepage 18+ launch copy with current 35/35 callable-tool coverage, llms/docs refresh loops, upstream roadmap drift, source gates, and packet regression proof.
- Swiggy Builders Live Source Resilience Center that reports live homepage fetch mode, Website Atlas fallback, every-page mesh coverage, llms markdown recovery, header/footer/CTA parity, mandatory browser re-browse gates, and receipt-backed final freeze proof.
- Swiggy Builders Review Decision Center that converts official review signals into approval-readiness gates, recommendation, reviewer questions, proof links, operator blockers, and Swiggy-owned credential/go-live gates.
- Swiggy Builders Launch Story Center that reconciles the April 2026 launch-blog 18+ tool narrative with the current 35-tool docs snapshot, reviewer demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing gates.
- Swiggy Deep Site Map that consolidates every Builders page, module signal, CTA, header/docs/footer link, proof path, source-reconciliation section, assertion, and external gate into one reviewer audit.
- Developer Quickstart Workbench that converts Swiggy's official self-serve developer path into readiness steps, framework adapters, first-call `get_addresses` drills, OAuth gates, and recipe handoffs.
- CTA Execution Center that converts every official Builders CTA, global header link, docs nav item, footer resource, mailto, Google Form, and legal link into a browser action, keyboard path, proof bundle, and explicit operator gate.
- Builder Intake Command Center that turns all 11 signup, apply, demo, contact, docs, and footer CTA paths into next actions, form values, demo storyboard steps, copy-ready drafts, and explicit gates for operator submission or Swiggy approval.
- Swiggy Builders Conversion Center that turns the final What Will You Cook funnel into Start Building, See What's Possible, Request Access, Send Us a Demo, builders@swiggy.in, `llms.txt`, `llms-full.txt`, proof bundles, operator runbook, and Swiggy go-live gates.
- MCP Tool Lab that probes all 35 official tools with JSON-RPC samples, response previews, route classes, safety gates, retry policies, and innovation use cases.
- Tool Contract Matrix for all 35 official tools with parameter contracts, response envelopes, confirmation gates, retry policies, error buckets, and local fixture previews.
- State Orchestrator for multi-turn cart truth, Food restaurant switches, Instamart address switches, Dineout slot refreshes, abandoned-cart recovery, and voice/chat response contracts.
- MCP Capability Registry that covers `mcp:tools`, `mcp:resources`, `mcp:prompts`, OAuth metadata, widget registry, static metadata, local prompt contracts, and external Swiggy gates.
- Carbon-inspired premium portal design language with a custom MealPilot logo, sticky header, mobile navigation, footer, visible CTA feedback, mobile/tablet/desktop grids, and a documented CTA contract in `docs/design-language.md`.
- Brand Compliance Kit for Powered by Swiggy attribution, no false endorsement, co-branding asset gates, #FF5200 usage, and surface placement review.
- Data Governance Center for DPDP role mapping, India/Singapore residency, Swiggy tool-call PII inventory, DSR routing, 90-day audit-log retention, token redaction, security contacts, and signed-manifest watch.
- Swiggy Journey Compiler that converts official Food, Instamart, Dineout, combined, and premium MealPilot flows into optimized call plans with all 35 tools indexed.
- Swiggy Access Dossier that maps production-access form fields, review checks, ground rules, legal readiness, developer/enterprise tracks, proof links, and remaining manual inputs.
- Swiggy Access Evidence Matrix that reconciles application fields, review checks, ground rules, legal terms, required attachments, runbook steps, proof commands, owners, operator inputs, and Swiggy gates.
- Premium Use Case Studio with ten differentiated Swiggy-native product playbooks and all 35 official tools assigned to premium route plans.
- Premium Concierge Itinerary that turns official Swiggy recipe routes into lunch, pantry reset, Dineout evening, dessert reminder, and recovery slots with full 35-tool coverage and separate confirmation gates.
- Staging Cutover Rehearsal with real MCP first-call probes, OAuth bearer-token gates, fail-closed routing, retry branches, support packet fields, and 48-hour green promotion checks.
- Swiggy Staging Replay Center with allowlisted safe probes, mock dry-run labels, credentialed staging execution, response hashes, redaction telemetry, and commercial-action blocks.
- Credential Handoff Center with owner-assigned localhost proof, DCR, OAuth PKCE, redirect URI, vault storage, staging credential, seeded smoke, soak, and production-promotion phases.
- Credential Readiness Dossier with redacted DCR approval, client-id configured, staging credential issue, seeded-user receipt, support-thread, token-expiry, first-read, source-freeze, and production-promotion evidence.
- Staging Certification Matrix with all 35 tools assigned to credentialed smoke waves, OAuth/DCR checks, 48-hour soak, telemetry requirements, rollback, and production promotion gates.
- Chat and voice surface response contracts to avoid long spoken lists or exposed internal IDs.
- Cart preflight checks for budget, location label, payment scope, item readiness, confirmation status, and substitutions.
- MCP replay transcripts that expose the JSON-RPC `tools/call` shape for local review and staging migration.
- Staging Transcript Export that packages one session as JSONL, Markdown replay, redaction manifest, support envelope, and certification-wave evidence.
- Evaluation Lab that runs multi-scenario checks for persona breadth, city coverage, voice-safe output, budget fit, confirmation locks, preflight safety, and PII minimization.
- Submission package generator for access-form fields, application links, and manual-input gaps.
- Submission Console for developer/enterprise form targets, official access requirements, prepared field values, proof attachments, packet order, demo-video gate, runbook steps, blockers, and handoff drafts.
- FAQ & Policy Center for homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, legal, and support-contact evidence.
- Growth Partnership Center for get-noticed, hiring, co-branding, direct-support, co-marketing, analytics, strategic guidance, launch experiments, metrics, proof assets, and external partner asks.
- Channel & Multimodal Studio for voice, auto-restock, group ordering, dietary planner, reservation, and screenshot-to-order build lanes from the developer page, including local route-plan packets, response rules, confirmation gates, and telemetry contracts.
- Visual Dish Capture Center for no-retention dish photo, menu screenshot, pantry photo, and chat-image analysis that turns confirmed labels into Food, Instamart, Dineout, or combined route plans.
- Voice Commerce Rehearsal Center for no-retention spoken Food, Instamart, Dineout, and combined route rehearsal with short TTS scripts, card fallbacks, no raw ids, and confirmation prompts.
- Quality Loop Center for consented Food, Instamart, Dineout, and combined feedback learning with support-safe redaction, repeat optimization, and no raw Swiggy payload retention.
- Ritual Autopilot Center for consented recurring lunch, pantry reset, Dineout slotwatch, and weekend household routines with reminder-only cadence, fresh reads, and no automatic order, checkout, booking, or subscription behavior.
- Payment Truth Center for Food cart totals, coupon savings, COD eligibility, Instamart bill review, Dineout free-booking proof, paid-cart gates, and no raw payment-instrument storage.
- Meal Window Intelligence for order/cook/reserve/track/wait timing forecasts with advisory ETA risk buckets, no scheduled Food orders, fresh reads before action, and no raw ETA or slot retention.
- Customization Studio for Food add-ons, variants, Instamart pack sizes, allergy-sensitive substitutions, voice-safe choice limits, and cart readbacks before mutation.
- Nutrition & Budget Intelligence for protein-per-rupee planning, COD-safe Food coupons, Instamart pantry gaps, group budgets, Dineout balance, and nutrition-estimate safety controls.
- Household Preference Graph for consented Food active orders, Instamart go-to items/order history, Dineout saved-location memory, household weights, pantry forecasts, and privacy-safe personalization.
- Guest Collaboration & Calendar Center for guest votes, date night, guests-at-home, office lunch, weekday reset, recovery meal, calendar reminders, share links, voice briefs, and Slack/Teams handoff gates.
- Luxury Experience Workspace for premium reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces with all 35 Swiggy tools, widget fallbacks, voice contracts, telemetry, and confirmation gates.
- Reviewer Artifact Vault for proof links, OpenAPI, smoke commands, screenshot targets, Credential Readiness Dossier, redacted issuance state, demo-video checklist, logs, traces, redaction rules, support context, and Swiggy handoff copy.
- Visual QA Center for desktop/tablet/mobile screenshot targets, selector manifests, artifact paths, no-overlap and text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and automation gates.
- Coding Agent Governance for root `AGENTS.md`, official Swiggy docs retrieval rules, Food 14 / Instamart 13 / Dineout 8 smoke evidence, and future-agent no-invention/no-sensitive-log guardrails.
- Resource & Prompt Studio for Food, Instamart, and Dineout `mcp:resources` and `mcp:prompts` smoke evidence.
- Production Launch Bundle that combines artifact links, verification commands, access application fields, go-live gates, manual inputs, and the draft `builders@swiggy.in` handoff email.
- Widget contract generator for Food, Instamart, and Dineout surfaces with iframe sizing, sandbox policy, origin verification, and semantic fallbacks.
- Widget Runtime Center for iframe sandboxing, origin-verified postMessage handlers, activation checks, render contracts, voice-safe fallbacks, opt-in headers, and hosted-widget external gates.
- Swiggy Widget Experience Composer for premium widget placements, responsive gallery states, event-handler safety gates, semantic fallback renderers, and hosted-widget activation runbooks.
- Swiggy Hosted Widget Activation Center for parent-origin approval, iframe sandbox rules, postMessage handshake proof, fallback parity, telemetry redaction, and hosted URL cutover gates.
- Swiggy Agent Experience Benchmark for route speed, trust, personalization, multimodal continuity, resilience, commercial safety, UX acceptance gates, and innovation moats across premium Food, Instamart, Dineout, support, voice, and widget journeys.
- Swiggy Private Pilot Control Room for turning benchmarked journeys into real-user cohorts, consent artifacts, success metrics, telemetry targets, support paths, operator runbooks, and Swiggy staging replay gates.
- Credentialed replay proof at `/api/swiggy-staging-replay` and `/api/swiggy-staging-replay/run` so reviewers can see exactly which safe tools execute now and which live/commercial gates remain Swiggy-owned.
- Commercial Action Guard for Food `place_food_order`, Instamart `checkout`, Dineout `book_table`, and combined journey confirmation locks, non-blind retry drills, redacted telemetry, and support packet context.
- Rate-limit plan for per-user, write-tool, client-day, and tracking-poll budgets.
- MCP Backpressure Governor for current Swiggy v1.0 upstream-shedder handling, future MCP-layer 429/`Retry-After`/`X-RateLimit-*` readiness, token buckets, voice burst shaping, tracking cadence, and background-job gates.
- Version/deprecation monitor for v1 route pinning, 180-day deprecation windows, and `_meta.swiggy.deprecation` alerts.
- DPDP-oriented compliance evidence for consent, minimization, deletion, audit logging, no model-training use of Swiggy-originated data, local DSR endpoints, and Swiggy-originated DSR routing.
- Executable Resilience Lab for 5xx retry, 429 Retry-After, 401 reauth, non-idempotent check-then-retry, and deprecation metadata drills.
- Trace Monitor for MCP spans, request IDs, support log fields, and redaction evidence.
- Runtime Telemetry ledger for live API/MCP request logs, status classes, hashed user context, session IDs, request IDs, and redaction checks.
- Audit Ledger Center for redacted Swiggy session/tool events, support correlation, retention posture, DSR routing, and packet fields.
- Swiggy Route Optimizer for official-source-grounded profiles, parallel read batches, cache policies, call savings, retry classes, cross-server handoffs, confirmation gates, and staging assertions.
- Swiggy Confirmation Command Center at `/api/swiggy-confirmation-command-center` plus `/api/swiggy-confirmation-command-center/execute` for final-commerce confirmation proof across Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`, including fresh cart or slot reads, explicit user confirmation, separate approvals for combined plans, guarded preflight/action/status-probe execution, no-blind-retry telemetry, Swiggy-response payment/free-booking truth, paid-Dineout blocking, and external live credential gates.
- Swiggy Cancellation & Care Center at `/api/swiggy-cancellation-care-center` for Food and Instamart no-tool cancellation handling, official customer-care copy, Dineout booking-status recovery, `report_error` support payloads, incident email routing, and live support gates.
- Swiggy Dineout Precision Center at `/api/swiggy-dineout-precision-center` for Dineout free reservation proof, `create_cart` bill-payment cart modeling, paid-deal blocking, `get_booking_status` retry protection, and live payment credential gates.
- Support Bridge for official `report_error` calls across Food, Instamart, and Dineout, including toolContext identifiers, SLA routing, redaction rules, and escalation checklist.
- SLO Incident Command Center for 99.9% uptime targets, read/write/commercial latency bands, status-page fallback, S0-S3 incident comms, 72-hour maintenance notice, and remediation evidence.
- Error Intelligence catalogue for the current Swiggy failure envelope, message/HTTP buckets, planned symbolic codes, domain failures, retry limits, observability hooks, and user-safe recovery copy.
- Swiggy Docs Coverage audit for all 69 `llms.txt` pages, including consumer AI-client and enterprise delegated-auth expansion gates.
- Swiggy Docs Twin Explorer that pairs every official markdown twin with its rendered URL, retrieval lane, MealPilot proof route, assertion, and drift gate.
- Swiggy Upstream Watch for `llms.txt`, `llms-full.txt`, changelog v1.0 limitations, v1.1/v1.2/v2 roadmap, signed manifests, and update action queues.
- Swiggy Source Intelligence and Deep Site Map for Builders website pages, CTAs, module signals, header/docs/footer links, `llms` docs, markdown twins, 35-tool reference alignment, drift signals, build-queue actions, proof paths, and live credential gates.
- Swiggy Innovation Radar for premium product lanes, route optimizations, build phases, differentiators, and staging or partner gates derived from Swiggy developer, enterprise, access, support, and reference signals.
- AI Client Connect Kit for Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, generic MCP clients, coding-agent rules, SDK auth modes, and enterprise delegated-auth lifecycle gates.
- OpenAPI 3.1 contract, readiness probe, request IDs, and security headers.
- GitHub Actions CI, Dockerfile, Render blueprint, and production smoke verification script.
- Optional file-backed persistence with versioned snapshots, restore, compaction, retention, and storage diagnostics.
- Confirmation gates before `place_food_order`, Instamart checkout, or `book_table`.
- Safe retry policy: no blind retries for non-idempotent order or booking actions.
- 401 handling: re-run OAuth once and refresh all MCP clients.
- 429 handling: backoff, degrade gracefully, and respect Swiggy rate limits.
- `/api/observability/traces` produces span-level trace evidence now; OpenTelemetry export can be added without changing span names once the deployment platform supports it.
- Support report generator for `builders@swiggy.in` with session IDs and timestamps.

## Security And Privacy Summary

- No raw payment credentials stored by MealPilot.
- No full Swiggy order payloads stored by default.
- Store only durable preferences such as dietary preference, budget range, and cuisine dislikes.
- Hash internal user IDs in logs.
- Keep OAuth tokens encrypted at rest when server-side storage is required.
- Do not scrape, bulk export, benchmark, or resell Swiggy catalogue data.

## Demo Video Plan

The application will include a 2-3 minute Loom or unlisted YouTube demo showing:

1. Local app on `http://localhost`.
2. OAuth-ready login path.
3. User asks for a weekly meal plan under budget.
4. Agent composes Food, Instamart, and Dineout recommendations.
5. Cart and booking actions pause for explicit confirmation.
6. Launch Center shows 35-tool coverage, Journey Compiler, Access Dossier, Access Evidence Matrix, Builder Intake, FAQ & Policy Center, FAQ Resolution Center, Growth Partnership Center, Talent Signal Center, Conversion Center, Showcase Submission Center, Demo Evidence Director, Partner Support Room, Channel & Multimodal Studio, Visual Dish Capture Center, Voice Commerce Rehearsal Center, Quality Loop Center, Ritual Autopilot Center, Payment Truth Center, Meal Window Intelligence, Customization Studio, Nutrition & Budget Intelligence, Household Preference Graph, Guest Collaboration & Calendar Center, Luxury Experience Workspace, Reviewer Artifact Vault, Credential Readiness Dossier, receipt-backed Source Freeze Diff, Review Decision Center, Visual QA Center, Premium Use Case Studio, Premium Concierge Itinerary, Staging Cutover Rehearsal, Swiggy Staging Replay Center, Staging Certification Matrix, Brand Compliance Kit, Capability Registry, Resource & Prompt Studio, Tool Contract Matrix, Scenario Runner, State Orchestrator, Widget Runtime Center, Swiggy Widget Experience Composer, Swiggy Hosted Widget Activation Center, Swiggy Agent Experience Benchmark, Swiggy Private Pilot Control Room, Commercial Action Guard, Website Atlas, Module Intelligence, Builders Launch Story Center, Docs Coverage, Docs Twin Explorer, Upstream Watch, Source Intelligence, Deep Site Map, Developer Quickstart, CTA Execution, Innovation Radar, AI Client Connect Kit, Tool Lab, MCP Gateway cutover, OAuth Status, Credential Cockpit, Sandbox Credential Workbench, Delegated Auth Center, chat/voice behavior, go-live gates, and observability metrics.
7. Demo Studio shows cart preflight, MCP replay, Staging Transcript Export, Submission Console, Access Submission Studio, and submission readiness.
8. Production Evidence shows widgets, rate limits, Traffic Readiness, Swiggy Load Lab, Offer Intelligence, Order Lifecycle, MCP Backpressure Governor, SLO Command, Data Governance, versioning, compliance, Production Launch Bundle, trace monitor, runtime telemetry, audit ledger, route optimizer, resilience drills, Evaluation Lab, Source Intelligence artifact, Deep Site Map artifact, Developer Quickstart artifact, CTA Execution artifact, Innovation Radar artifact, and reviewer proof score.
9. Show `/api/ready`, `/api/openapi.json`, `/api/swiggy-website-atlas`, `/api/swiggy-builders-module-intelligence`, `/api/swiggy-builders-launch-story`, `/api/swiggy-builder-intake`, `/api/swiggy-faq-policy`, `/api/swiggy-faq-resolution-center`, `/api/swiggy-growth-partnership`, `/api/swiggy-talent-signal-center`, `/api/swiggy-conversion-center`, `/api/swiggy-showcase-submission-center`, `/api/swiggy-demo-evidence-director`, `/api/swiggy-partner-support-room`, `/api/channel-multimodal-studio`, `/api/swiggy-visual-dish-capture`, `/api/swiggy-voice-commerce-center`, `/api/nutrition-budget-intelligence`, `/api/household-preference-graph`, `/api/guest-collaboration-calendar`, `/api/luxury-experience-workspace`, `/api/reviewer-artifact-vault`, `/api/visual-qa-center`, `/api/submission-console`, `/api/access-submission-studio`, `/api/swiggy-docs-twin-explorer`, `/api/swiggy-upstream-watch`, `/api/swiggy-source-intelligence`, `/api/swiggy-deep-site-map`, `/api/swiggy-developer-quickstart`, `/api/swiggy-cta-execution-center`, `/api/swiggy-innovation-radar`, `/api/mcp/tool-lab`, `/api/mcp/tool-contract-matrix`, `/api/mcp/scenario-runner`, `/api/mcp/state-orchestrator`, `/api/mcp/commercial-action-guard`, `/api/mcp/backpressure-governor`, `/api/mcp/resource-prompt-studio`, `/api/mcp/widget-runtime`, `/api/swiggy-widget-experience-composer`, `/api/swiggy-hosted-widget-activation`, `/api/swiggy-agent-experience-benchmark`, `/api/swiggy-private-pilot-control-room`, `/api/swiggy-staging-replay`, `/api/mcp/staging-cutover`, `/api/swiggy-journey-compiler`, `/api/swiggy-access-dossier`, `/api/swiggy-access-evidence-matrix`, `/api/premium-use-case-studio`, `/api/premium-concierge-itinerary`, `/api/staging-certification-matrix`, `/api/auth/swiggy/status`, `/api/credential-onboarding`, `/api/sandbox-credential-workbench`, `/api/enterprise-delegated-auth`, `/api/enterprise-platform-center`, `/api/audit-ledger`, and `npm run verify:production`.
10. Show storage diagnostics and snapshot export in `/api/storage/status` and `/api/storage/export`.
11. Show `/api/observability/traces` with trace IDs, no raw PII, and safe log fields.
12. Show `/api/telemetry/runtime` with live request IDs, session IDs, redaction fields, and MCP event coverage.
13. Show `/api/audit-ledger` with redacted audit events, support correlation, retention, DSR routing, and Swiggy support packet fields.
14. Show `/api/submission-console`, `/api/access-submission-studio`, and `/api/swiggy-access-evidence-matrix` with developer/enterprise targets, official CTAs, copy blocks, attachments, browser runbook steps, blockers, owners, proof commands, and drafts. Save demo URL, primary contact, production redirect URI, static egress/IP, environment summary, terms acknowledgement, submitted-form timestamp, and sent-email timestamp through `PATCH /api/access-submission-studio/state` before recording the final reviewer packet.
15. Show `/api/swiggy-route-optimizer` with call-saving routes, optimizer profiles, parallel read batches, cache/retry policies, cross-server handoffs, redaction rules, confirmation gates, and staging assertions.
16. Show `/api/mcp/capability-registry` with tools, resources, prompts, metadata, widgets, and external gates.
17. Show `/api/mcp/resource-prompt-studio` and `/api/mcp/resource-prompt-studio/execute` with all six resource reads, all six prompt samples, twelve JSON-RPC smoke requests, executable method calls, and no-raw-payload summaries.
18. Show `/api/support/bridge` and `/api/support/bridge/report` with Food, Instamart, and Dineout `report_error` payloads, consent gates, redacted toolContext, and receipt evidence.
19. Show `/api/swiggy-docs-coverage` and `/api/swiggy-docs-twin-explorer` with 69 docs pages mapped to evidence, markdown twins, rendered URLs, retrieval lanes, and external gates.
20. Show `/api/ai-client-connect-kit` with six client configs, coding-agent rules, SDK auth modes, and delegated-auth gates.
21. Show `/api/slo-incident-command` with uptime targets, latency classes, status fallback, maintenance windows, and S0-S3 comms.
22. Show `/api/data-governance-center` with DPDP roles, data flows, DSR routing, retention, security contacts, and signed-manifest watch.
23. Show `/api/enterprise-delegated-auth` with per-user PKCE, token lifecycle, logout, redirect schemes, troubleshooting, architecture review, and platform-operator gates.
24. Show `/api/enterprise-platform-center` with tenant boundaries, quota review, support SLAs, contract gates, co-branding approval, and enterprise audit exports.
25. Show `/api/error-intelligence` with Swiggy error buckets, planned codes, and domain failures.
26. Show `/api/resilience` with the order-placement recovery runbook.
27. Show `/api/evaluation-lab` with persona QA across chat and voice surfaces.
28. Show `/api/traffic-readiness-plan` with expected volume, lane budgets, Retry-After handling, seven-day notice, capacity email, and staged rollout.
29. Show `/api/swiggy-load-lab` with synthetic pilot/campaign load scenarios, cohort ramps, Retry-After drills, commercial single-flight proof, and external capacity gates.
30. Show `/api/swiggy-offer-intelligence` with Food coupon sequencing, Dineout deal validation, Instamart value substitutions, savings disclaimers, and no-blind-discount drills.
31. Show `/api/swiggy-order-lifecycle` and `/api/swiggy-order-lifecycle/probe` with Food/Instamart/Dineout status tools, tracking cadence, executable non-blind retry decisions, and support-safe lifecycle telemetry.
32. Show `/api/swiggy-location-trust` and `/api/swiggy-location-trust/select` with Food/Instamart saved-address tools, Dineout saved locations, executable address-choice decisions, address switch refresh, and raw-address redaction.
33. Show `/api/swiggy-cart-mutation-workbench` and `/api/swiggy-cart-mutation-workbench/mutate` with Food cart readback, Instamart full-cart replacement, Dineout create_cart gates, executable readback-after-write decisions, payment-method truth, and checkout-safe mutation rules.
34. Show `/api/swiggy-discovery-freshness` and `/api/swiggy-discovery-freshness/resolve` with Food search/menu truth, Instamart product variants, Dineout details/slots, executable read-only discovery, pagination, coordinate consistency, and stale-result invalidation.
35. Show `/api/production-launch-bundle` with proof artifacts, verification commands, external Swiggy gates, and the review email draft.

## Primary Technical Contact

Farhan Khan

Email: add primary engineering email before submission.

## Application Links

- GitHub: https://github.com/Farhankhan0128/MealPilot
- Demo video: add Loom, Drive, or unlisted YouTube link before submission.
- Swiggy Builders Launch Story Center: `/api/swiggy-builders-launch-story`
- Swiggy Builders Module Intelligence Center: `/api/swiggy-builders-module-intelligence`
- Swiggy Builders Journey Gate Center: `/api/swiggy-builders-journey-gates`
- Swiggy Builders Homepage Experience Center: `/api/swiggy-builders-homepage-experience`
- Swiggy Builders Source Evolution Center: `/api/swiggy-builders-source-evolution`
- Swiggy Builders Live Source Resilience Center: `/api/swiggy-builders-live-source-resilience`
- Swiggy Builders Review Decision Center: `/api/swiggy-builders-review-decision`
- Builder Intake Command Center: `/api/swiggy-builder-intake`
- FAQ & Policy Center: `/api/swiggy-faq-policy`
- Swiggy FAQ Resolution Center: `/api/swiggy-faq-resolution-center`
- Growth Partnership Center: `/api/swiggy-growth-partnership`
- Swiggy Builder Talent Signal Center: `/api/swiggy-talent-signal-center`
- Swiggy Builders Conversion Center: `/api/swiggy-conversion-center`
- Benefits Activation Center: `/api/swiggy-benefits-activation-center`
- Channel & Multimodal Studio: `/api/channel-multimodal-studio`
- Visual Dish Capture Center: `/api/swiggy-visual-dish-capture`
- Voice Commerce Rehearsal Center: `/api/swiggy-voice-commerce-center`
- Quality Loop Center: `/api/swiggy-quality-loop-center`
- Ritual Autopilot Center: `/api/swiggy-ritual-autopilot-center`
- Payment Truth Center: `/api/swiggy-payment-truth-center`
- Meal Window Intelligence: `/api/swiggy-meal-window-intelligence`
- Customization Studio: `/api/swiggy-customization-studio`
- Nutrition & Budget Intelligence: `/api/nutrition-budget-intelligence`
- Household Preference Graph: `/api/household-preference-graph`
- Guest Collaboration & Calendar Center: `/api/guest-collaboration-calendar`
- Luxury Experience Workspace: `/api/luxury-experience-workspace`
- Reviewer Artifact Vault: `/api/reviewer-artifact-vault`
- Visual QA Center: `/api/visual-qa-center`
- Submission Console: `/api/submission-console`
- Access Submission Studio: `/api/access-submission-studio`
- Access Submission Studio saved handoff state: `PATCH /api/access-submission-studio/state`
- Swiggy Access Evidence Matrix: `/api/swiggy-access-evidence-matrix`
- MCP Capability Registry: `/api/mcp/capability-registry`
- Resource & Prompt Studio: `/api/mcp/resource-prompt-studio`, `/api/mcp/resource-prompt-studio/execute`
- Swiggy Widget Experience Composer: `/api/swiggy-widget-experience-composer`
- Swiggy Hosted Widget Activation Center: `/api/swiggy-hosted-widget-activation`
- Swiggy Agent Experience Benchmark: `/api/swiggy-agent-experience-benchmark`
- Swiggy Private Pilot Control Room: `/api/swiggy-private-pilot-control-room`
- Swiggy Staging Replay Center: `/api/swiggy-staging-replay`
- Swiggy Docs Coverage: `/api/swiggy-docs-coverage`
- Swiggy Docs Twin Explorer: `/api/swiggy-docs-twin-explorer`
- Swiggy Upstream Watch: `/api/swiggy-upstream-watch`
- Swiggy Source Intelligence: `/api/swiggy-source-intelligence`
- Swiggy Deep Site Map: `/api/swiggy-deep-site-map`
- Developer Quickstart Workbench: `/api/swiggy-developer-quickstart`, `/api/swiggy-developer-quickstart/run-first-call`
- CTA Execution Center: `/api/swiggy-cta-execution-center`
- Swiggy Innovation Radar: `/api/swiggy-innovation-radar`
- AI Client Connect Kit: `/api/ai-client-connect-kit`
- Tool Contract Matrix: `/api/mcp/tool-contract-matrix`
- Scenario Runner: `/api/mcp/scenario-runner`
- State Orchestrator: `/api/mcp/state-orchestrator`
- Commercial Action Guard: `/api/mcp/commercial-action-guard`
- Brand Compliance Kit: `/api/brand-compliance-kit`
- Data Governance Center: `/api/data-governance-center`
- Enterprise Delegated Auth Center: `/api/enterprise-delegated-auth`
- Swiggy Enterprise Platform Center: `/api/enterprise-platform-center`
- Swiggy OAuth Status: `/api/auth/swiggy/status`
- Swiggy Auth Lifecycle Center: `/api/swiggy-auth-lifecycle-center`
- Swiggy Journey Compiler: `/api/swiggy-journey-compiler`
- Swiggy Access Dossier: `/api/swiggy-access-dossier`
- Swiggy Access Evidence Matrix: `/api/swiggy-access-evidence-matrix`
- Premium Use Case Studio: `/api/premium-use-case-studio`
- Premium Concierge Itinerary: `/api/premium-concierge-itinerary`
- Staging Certification Matrix: `/api/staging-certification-matrix`
- Sandbox Credential Workbench: `/api/sandbox-credential-workbench`
- Staging Transcript Export: `/api/sessions/:sessionId/staging-transcript`
- Traffic Readiness Plan: `/api/traffic-readiness-plan`
- Swiggy Load Lab: `/api/swiggy-load-lab`
- Swiggy Offer Intelligence: `/api/swiggy-offer-intelligence` and `/api/swiggy-offer-intelligence/decide`
- Swiggy Order Lifecycle: `/api/swiggy-order-lifecycle`, `/api/swiggy-order-lifecycle/probe`
- Swiggy Location Trust: `/api/swiggy-location-trust`, `/api/swiggy-location-trust/select`
- Swiggy Cart Mutation Workbench: `/api/swiggy-cart-mutation-workbench`, `/api/swiggy-cart-mutation-workbench/mutate`
- Swiggy Discovery Freshness: `/api/swiggy-discovery-freshness`, `/api/swiggy-discovery-freshness/resolve`
- Swiggy Confirmation Command Center: `/api/swiggy-confirmation-command-center`, `/api/swiggy-confirmation-command-center/execute`
- Swiggy Cancellation & Care Center: `/api/swiggy-cancellation-care-center`
- Swiggy Dineout Precision Center: `/api/swiggy-dineout-precision-center`
- SLO Incident Command Center: `/api/slo-incident-command`
- Support Bridge: `/api/support/bridge`, `/api/support/bridge/report`
- Error Intelligence: `/api/error-intelligence`
- Production Launch Bundle: `/api/production-launch-bundle`
