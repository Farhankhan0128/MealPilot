# Demo Script

Target length: 2-3 minutes.

## Recording Setup

- Browser: `http://localhost:5173`
- App state: fresh user session.
- Demo city: Bengaluru or Delhi NCR.
- Persona: vegetarian professional planning meals for the week.
- Command: `npm run dev`

## Script

### 1. Open The Product

Show the MealPilot command center. The first screen should already be the planning workspace, not a marketing page.

Voiceover:

> MealPilot is an AI commerce assistant that composes Swiggy Food, Instamart, and Dineout into a single safe meal-planning flow.

### 2. Enter The User Ask

Prompt:

```text
Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, dinner groceries for tonight, and a Dineout option for Saturday evening.
```

Show the agent extracting:

- Budget.
- Diet.
- Timing.
- Food order.
- Grocery basket.
- Dineout reservation intent.

### 3. Show Tool Composition

Show the three planning cards:

- Food: lunch recommendation and cart preview.
- Instamart: dinner ingredients basket.
- Dineout: Saturday table options.

Voiceover:

> The agent can prepare each commerce action, but it cannot complete any order or booking until the user confirms that specific action.

### 4. Show User Control

Change budget from Rs 2,000 to Rs 1,700.

Show the plan adjusting:

- Lower grocery basket total.
- Food item substitution.
- Dineout recommendation still available but not automatically booked.

Then show:

- Household profile preferences.
- Plan variants: balanced, budget, protein, social.
- Smart substitution before confirmation.

### 5. Confirm One Safe Action

Click confirm for the Food cart only.

Show:

- Confirmation modal.
- Restaurant name.
- Items.
- Delivery address label.
- Estimated total.

Do not show a real payment or production order unless staging credentials explicitly allow it.

Optional faster demo path: click confirm all prepared and show that MealPilot still records separate audit entries for Food, Instamart, and Dineout.

### 6. Show Safety Logs

Show the in-app audit timeline with:

- Tool names.
- Status codes.
- Trace IDs.
- No raw PII.
- 401 and 429 handling notes.
- Simulated tracking events after confirmation.
- Builder Access readiness evidence.

Then mention the tested retry policy:

- Reads and cart mutations may retry with backoff.
- `place_food_order`, `checkout`, and `book_table` are not blindly retried.

### 7. Show Launch Readiness

Open the Launch Center and show:

- Chat versus Voice response mode.
- MCP Coverage showing all 35 Swiggy tools mapped across Food, Instamart, and Dineout.
- Tool Contract Matrix showing parameter contracts, response envelopes, confirmation gates, retry posture, fixture previews, and planned error codes for all 35 tools.
- Widget Runtime Center showing iframe sandbox policy, origin checks, postMessage handlers, semantic fallbacks, voice exclusions, and hosted-widget gates.
- Commercial Action Guard showing fresh-read requirements, chat/voice confirmations, non-blind retry drills, telemetry fields, and support packets for Food orders, Instamart checkout, Dineout bookings, and combined journeys.
- Capability Registry and Resource & Prompt Studio showing `mcp:tools`, `mcp:resources`, `mcp:prompts`, metadata, widgets, prompt contracts, sample reads, and prompt messages.
- FAQ & Policy Center showing homepage/developer/enterprise FAQ coverage, footer resources, access ground rules, legal signals, and external gates.
- Growth Partnership Center showing launch experiments, co-marketing assets, metric targets, partner asks, and external Swiggy approvals.
- Builders Launch Story Center showing the April 2026 launch narrative, current 35-tool docs reconciliation, reviewer demo journey, showcase assets, CTA paths, and co-marketing gates.
- Operating Contract Center showing SLA, rate-limit/backpressure, traffic rollout, support escalation, version/deprecation, readiness gates, and Swiggy external approvals in one reviewer contract.
- Staging Credential Drill Center showing credential signal, first read-only JSON-RPC probes, seeded-data needs, operator runbook, handoff email, and promotion gates before live staging credentials arrive.
- Live Signal Calibration Center showing Food, Instamart, and Dineout signal lanes, read-only staging probes, privacy redaction, drift thresholds, fallback rules, and credential gates before live personalization claims.
- Docs Coverage showing all 69 Swiggy `llms.txt` pages mapped to MealPilot evidence and external gates.
- Docs Twin Explorer showing markdown twins, rendered URLs, retrieval lanes, section groups, proof links, and drift gates.
- Upstream Watch showing `llms.txt`, `llms-full.txt`, v1.0 limitations, v1.1/v1.2/v2 roadmap items, signed-manifest watch, and new-tool action queues.
- Source Intelligence showing official website pages, CTA inventory, `llms` docs, markdown twins, 35-tool reference counts, drift signals, and build-queue actions.
- Deep Site Map showing every Builders page, rendered module signal, CTA, header/docs/footer link, proof path, source-reconciliation section, assertion, and external gate in one reviewer audit.
- Developer Quickstart Workbench showing official first-call steps, SDK/framework adapters, `get_addresses` JSON-RPC drills, OAuth gates, and recipe handoffs.
- CTA Execution Center showing official CTA/header/footer/docs click targets, keyboard paths, proof links, operator gates, and non-auto-submission rules.
- Innovation Radar showing premium opportunity lanes, route optimizations, build phases, differentiators, and staging or partner gates derived from Swiggy source signals.
- AI Client Connect Kit showing Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, generic MCP config, coding-agent rules, and SDK auth modes.
- Brand Compliance Kit showing Powered by Swiggy attribution, co-branding asset gates, palette audit, and no-endorsement copy.
- Journey Compiler showing official recipe routes, all 35 tools, confirmation gates, recovery reads, and call savings.
- Access Dossier showing Swiggy application fields, review checks, ground rules, legal readiness, and the developer-track submission path.
- Access Evidence Matrix showing field coverage, required attachments, browser runbook steps, proof commands, owner assignment, operator inputs, and Swiggy approval gates.
- Premium Use Case Studio showing ten differentiated MealPilot playbooks, all 35 tools placed, cross-server routes, surfaces, saved calls, and launch stages.
- Premium Concierge showing lunch, pantry reset, Dineout evening, dessert reminder, and Sunday recovery slots with official recipe routes, saved-call optimization, and separate confirmations.
- Luxury Experience Workspace showing lean, premium, family, social, and training modes plus reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces with all 35 Swiggy tools, widget fallbacks, voice contracts, and telemetry.
- Reviewer Artifact Vault showing proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and Swiggy handoff copy.
- Visual QA Center showing desktop/tablet/mobile screenshot targets, selectors, artifact paths, no-overlap checks, text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and automation gates.
- Coding Agent Governance showing the root `AGENTS.md` file, official Swiggy source rules, tool-count smoke tests, and future-agent guardrails.
- Staging Cutover Rehearsal showing first read-only MCP probes, fail-closed bearer-token behavior, retry branches, support packet fields, and 48-hour green gates.
- Staging Certification Matrix showing all 35 tools assigned to staging smoke waves, 48-hour soak, telemetry, rollback, and production-promotion gates.
- Staging Transcript Export showing session-scoped JSONL, Markdown replay, redaction manifest, support envelope, and non-blind retry evidence.
- Local MCP resources/prompts calls: `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`, including executable redacted summaries.
- MCP Gateway showing mock transport now and the exact staging/production endpoint cutover path.
- OAuth Status showing authorize/token/logout endpoints, pending PKCE verifier count, callback outcome, token source, expiry, and no-token-logging checklist.
- Delegated Auth Center showing enterprise on-behalf-of PKCE, per-user token storage, 5-day access token, 30-day user session, logout, troubleshooting, redirect schemes, and platform-operator gates.
- Go-Live Gates for credentials, OAuth, confirmation, idempotency, observability, rollout, and privacy.
- Observability metrics with traceable session IDs.
- Audit Ledger Center with redacted session/tool audit events, support correlation, retention posture, and DSR routing.
- Support Bridge with official `report_error` payloads for Food, Instamart, and Dineout, plus consent-gated executable support reporting.
- SLO Incident Command Center with 99.9% uptime targets, latency classes, status-page fallback, 72-hour maintenance notice, and S0-S3 escalation runbooks.
- Error Intelligence with Swiggy failure buckets, planned symbolic codes, and terminal domain failures.
- Support report generation with a pre-filled `builders@swiggy.in` escalation.
- Resilience Lab evidence for 5xx retries, 429 Retry-After, 401 reauth, non-idempotent check-then-retry, and deprecation metadata.
- Traffic Readiness showing expected tool-call volume, peak QPS, Retry-After contract, seven-day launch notice, and 1% to 100% rollout.

### 8. Show Demo Studio

Open Demo Studio and show:

- Cart Preflight status before any risky action.
- Offer opportunities for Food, Instamart, and Dineout.
- MCP Replay with JSON-RPC `tools/call` requests.
- Submission Console with developer/enterprise form targets, prepared attachments, runbook steps, blockers, and handoff drafts.
- Access Evidence Matrix with the same submission evidence reconciled into one reviewer ledger.
- Evaluation Lab score across Bengaluru, Delhi NCR, Mumbai, chat, voice, budget, confirmation, and privacy scenarios.
- Demo Run status.
- Submission Package readiness and remaining manual fields.

### 9. Show Production Evidence

Open Production Evidence and show:

- The premium portal shell, MealPilot logo, sticky header, mobile navigation, footer, visible CTA feedback, and `docs/design-language.md` as the design-system proof.
- Swiggy widget contracts with semantic fallbacks.
- Widget Runtime Center artifact at `/api/mcp/widget-runtime` with secure iframe, postMessage, and fallback behavior.
- Commercial Action Guard artifact at `/api/mcp/commercial-action-guard` with confirmation locks, check-then-retry recovery, and support-safe telemetry.
- Rate-limit budgets under planned developer-tier ceilings.
- Traffic Readiness Plan with per-lane budgets, capacity upgrade email, and major-event notification gates.
- Swiggy Load Lab at `/api/swiggy-load-lab` with synthetic launch-load scenarios, 1% to 100% cohort ramps, Retry-After drill proof, commercial serialization, and campaign capacity gates.
- Swiggy Offer Intelligence at `/api/swiggy-offer-intelligence` plus `/api/swiggy-offer-intelligence/decide` with Food coupon sequencing, Dineout deal validation, Instamart value substitutions, no-blind-discount guardrails, no-mutation offer decisions, and live-offer gates.
- Swiggy Order Lifecycle at `/api/swiggy-order-lifecycle` plus `/api/swiggy-order-lifecycle/probe` with order-history/status tools, 10-second tracking cadence, executable non-blind retry decisions, and support-safe timeline telemetry.
- Swiggy Location Trust at `/api/swiggy-location-trust` plus `/api/swiggy-location-trust/select` with Food/Instamart saved-address reads, Instamart create/delete address intent, Dineout saved locations, executable address-choice decisions, switch refresh guards, and raw-address redaction.
- Swiggy Cart Mutation Workbench at `/api/swiggy-cart-mutation-workbench` plus `/api/swiggy-cart-mutation-workbench/mutate` with Food cart readback, Instamart full-cart replacement, Dineout create_cart gates, executable readback-after-write decisions, payment-method truth, add-on confirmation, and staging cart-write gates.
- Swiggy Discovery Freshness at `/api/swiggy-discovery-freshness` plus `/api/swiggy-discovery-freshness/resolve` with Food search/menu pagination, Instamart variants and go-to items, Dineout restaurant details and slots, executable read-only discovery, coordinate consistency, and stale-result invalidation.
- Swiggy Confirmation Command Center at `/api/swiggy-confirmation-command-center` plus `/api/swiggy-confirmation-command-center/execute` with final-commerce proof for Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`: fresh cart or slot reads, explicit separate approvals, guarded preflight/action/status-probe execution, no-blind-retry telemetry, Swiggy-response payment/free-booking truth, and live credential gates.
- Swiggy Cancellation & Care Center at `/api/swiggy-cancellation-care-center` with Food and Instamart no-tool cancellation handling, official customer-care copy, Dineout booking-status recovery, `report_error` support context, and incident email routing.
- Swiggy Dineout Precision Center at `/api/swiggy-dineout-precision-center` with free-booking validation, bill-payment `create_cart` modeling, paid-deal blocking, booking-status retry probes, and live payment gates.
- Swiggy Auth Lifecycle Center at `/api/swiggy-auth-lifecycle-center` with PKCE S256, 120-second authorization codes, 5-day access tokens, no v1 refresh-token assumption, 401/419/403 re-auth recovery, exact redirect gates, per-user delegated tokens, logout, and no-token logging.
- MCP Backpressure Governor artifact at `/api/mcp/backpressure-governor` with current upstream-shedder handling, future 429/header readiness, token buckets, tracking floor, voice burst shaping, and background-job gates.
- SLO Command score, uptime targets, commercial p95 latency, maintenance windows, and status-page external gate.
- Data Governance Center with DPDP roles, India/Singapore residency, data-flow inventory, DSR routing, 90-day Swiggy audit retention, token redaction, and signed-manifest watch.
- Audit Ledger Center with redacted session/tool events, support correlation keys, DSR routing, and Swiggy support packet fields.
- Enterprise Delegated Auth Center artifact for platform DCR preregistration, per-user OAuth, MCP on-behalf-of calls, 401/419/403 recovery, and architecture-review evidence.
- Swiggy Enterprise Platform Center artifact for tenant boundaries, quota review, support SLAs, contract gates, co-branding approval, and enterprise audit exports.
- Version monitor with v1 route pinning and deprecation alert readiness.
- Compliance controls for consent, PII minimization, deletion, audit logging, and training-data exclusion.
- Support Bridge redaction rules, executable report gate, SLA matrix, and escalation checklist.
- Swiggy Docs Coverage artifact in reviewer proof and launch handoff.
- Swiggy Docs Twin Explorer artifact for markdown twin retrieval, rendered-page pairing, and proof readback.
- Swiggy Upstream Watch artifact for changelog, coding-agent docs, roadmap, signed-manifest, and release-drift control.
- Swiggy Source Intelligence artifact for website/docs/API drift reconciliation, 35-tool count alignment, and external gate tracking.
- Swiggy Deep Site Map artifact for page/module/CTA/header/footer proof coverage and reviewer readback.
- Developer Quickstart Workbench artifact for self-serve first-call readiness, SDK adapters, auth gates, and route handoffs.
- CTA Execution Center artifact for click-readiness, keyboard navigation, manual form/email gates, and footer/legal proof.
- Swiggy Innovation Radar artifact for premium product strategy, opportunity lanes, route optimization, build phases, and partner gates.
- Route Optimizer artifact for profile comparison, parallel read batches, cross-server handoffs, call savings, cache/retry policy, and commercial confirmation gates.
- Tool Contract Matrix artifact for all-tool schema, response envelope, retry, confirmation, and error-bucket evidence.
- State Orchestrator artifact for official multi-turn cart state, switch guards, stale-cart recovery, and voice/chat response contracts.
- Commercial Action Guard artifact for non-idempotent Food, Instamart, Dineout, and combined commercial-action safety.
- Resource & Prompt Studio artifact for MCP resource and prompt reads across all three Swiggy servers.
- Staging Cutover Rehearsal artifact for real MCP transport readiness, OAuth gates, first-call probes, support packet fields, and production promotion checks.
- Visual Dish Capture artifact at `/api/swiggy-visual-dish-capture` plus `/api/swiggy-visual-dish-capture/analyze` for screenshot-to-order smoke proof.
- Voice Commerce artifact at `/api/swiggy-voice-commerce-center` plus `/api/swiggy-voice-commerce-center/rehearse` for spoken Swiggy route rehearsal.
- Quality Loop artifact at `/api/swiggy-quality-loop-center` plus `/api/swiggy-quality-loop-center/feedback` for post-experience learning and support-safe feedback proof.
- Ritual Autopilot artifact at `/api/swiggy-ritual-autopilot-center` plus `/api/swiggy-ritual-autopilot-center/plan` for consented recurring routine proof with no automatic commercial action.
- Payment Truth artifact at `/api/swiggy-payment-truth-center` plus `/api/swiggy-payment-truth-center/reconcile` for cart, coupon, COD, checkout, booking, and paid-cart source-of-truth proof.
- Meal Window Intelligence artifact at `/api/swiggy-meal-window-intelligence` plus `/api/swiggy-meal-window-intelligence/forecast` for order/cook/reserve/track/wait timing proof with no scheduled Food orders.
- Customization Studio artifact at `/api/swiggy-customization-studio` plus `/api/swiggy-customization-studio/validate` for add-on, variant, pack-size, allergy-caution, and cart-readback proof.
- Website Atlas coverage for the production access page, launch blog, apply CTAs, header, footer, and docs subnav.
- Builders Launch Story Center artifact for launch-blog story beats, 18+ to 35-tool reconciliation, demo journey, showcase packet, CTA paths, and external co-marketing gates.
- Deep Site Map coverage for every Builders page row, module signal, CTA gate, source section, proof link, assertion, and external gate.
- Builder Intake Command Center for CTA ownership, access-form values, demo storyboard, outbound drafts, and live credential gates.
- Channel & Multimodal Studio for voice, auto-restock, group ordering, dietary planner, reservation, and screenshot-to-order channel contracts plus local execution packets for route plans, response rules, confirmation gates, and telemetry.
- Visual Dish Capture Center for dish photo, menu screenshot, pantry photo, and chat-image captions routed into Food, Instamart, Dineout, or combined plans with no raw-image retention and confirmation-first labels.
- Voice Commerce Rehearsal Center for quick Food orders, Instamart restock, Dineout bookings, and combined spoken intents with short TTS, card fallbacks, no raw-audio retention, and confirmation prompts.
- Quality Loop Center for consented repeat learning, feedback triage, support-safe issue routing, and no raw Swiggy payload retention across Food, Instamart, Dineout, and combined journeys.
- Nutrition & Budget Intelligence for protein-per-rupee, coupon-safe cart review, Instamart pantry gaps, group budgets, Dineout balance, and nutrition safety controls.
- Household Preference Graph for consented order/go-to/saved-location signals, household weights, pantry forecasts, retention rules, and cancellation-safe active-order memory.
- Guest Collaboration & Calendar Center for guest votes, date-night and guests-at-home templates, Dineout slot checks, Food reminder handoffs, Instamart prep, ICS artifacts, Slack/Teams gates, and voice-safe briefs.
- Luxury Experience Workspace for polished reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces with all-tool coverage and separate confirmations.
- Reviewer Artifact Vault for proof links, screenshot targets, verification commands, redaction rules, and access-review handoff email.
- Visual QA Center for reviewer screenshot selectors, viewport coverage, Deep Site Map and Access Evidence Matrix card proof, no-overlap/text-fit rules, widget fallback checks, and screenshot automation gates.
- AI Client Connect Kit artifact for consumer AI-client, coding-agent, SDK, and delegated-auth readiness.
- Brand Compliance Kit artifact for attribution, co-branding, palette, and external asset gates.
- Swiggy Journey Compiler artifact for official recipe routes and all-tool coverage.
- Swiggy Access Dossier artifact for access-page fields, ground rules, and manual inputs.
- Swiggy Access Evidence Matrix artifact for access-page fields, proof attachments, runbook steps, proof commands, owners, and external gates.
- Premium Use Case Studio artifact for innovation depth and differentiated premium product lanes.
- Premium Concierge Itinerary artifact for official route-to-product execution, all-server coverage, and scheduling gates.
- Staging Certification Matrix artifact for credentialed smoke waves, all-tool staging coverage, and 48-hour soak readiness.
- Staging Transcript Export artifact for session ids, request ids, redacted JSONL, and support-ready replay evidence.
- Error Intelligence retry classes and non-blind commercial action policy.
- Resilience Lab drill score and support runbook payload.
- Evaluation Lab persona QA score and scenario list.
- Reviewer Proof score and artifact links.

### 10. Close

Briefly show production readiness:

- `/api/ready`
- `/api/openapi.json`
- `/api/swiggy-docs-twin-explorer`
- `/api/swiggy-upstream-watch`
- `/api/swiggy-source-intelligence`
- `/api/swiggy-deep-site-map`
- `/api/swiggy-developer-quickstart`
- `/api/swiggy-cta-execution-center`
- `/api/swiggy-innovation-radar`
- `/api/swiggy-builder-intake`
- `/api/swiggy-access-dossier`
- `/api/swiggy-access-evidence-matrix`
- `/api/swiggy-faq-policy`
- `/api/swiggy-growth-partnership`
- `/api/channel-multimodal-studio`
- `/api/nutrition-budget-intelligence`
- `/api/household-preference-graph`
- `/api/guest-collaboration-calendar`
- `/api/luxury-experience-workspace`
- `/api/reviewer-artifact-vault`
- `/api/visual-qa-center`
- `/api/premium-concierge-itinerary`
- `/api/mcp/tool-contract-matrix`
- `/api/mcp/scenario-runner`
- `/api/mcp/state-orchestrator`
- `/api/mcp/resource-prompt-studio`
- `/api/mcp/resource-prompt-studio/execute`
- `/api/mcp/staging-cutover`
- `/api/mcp-gateway`
- `/api/auth/swiggy/status`
- `/api/enterprise-delegated-auth`
- `/api/enterprise-platform-center`
- `/api/traffic-readiness-plan`
- `/api/swiggy-load-lab`
- `/api/swiggy-offer-intelligence`
- `/api/swiggy-order-lifecycle`
- `/api/swiggy-order-lifecycle/probe`
- `/api/swiggy-location-trust`
- `/api/swiggy-location-trust/select`
- `/api/swiggy-cart-mutation-workbench`
- `/api/swiggy-cart-mutation-workbench/mutate`
- `/api/swiggy-discovery-freshness`
- `/api/swiggy-discovery-freshness/resolve`
- `/api/swiggy-confirmation-command-center`
- `/api/swiggy-confirmation-command-center/execute`
- `/api/swiggy-cancellation-care-center`
- `/api/swiggy-dineout-precision-center`
- `/api/swiggy-auth-lifecycle-center`
- `/api/slo-incident-command`
- `/api/audit-ledger`
- `/api/submission-console`
- `/api/storage/status`
- `/api/storage/export`
- `/api/resilience`
- `/api/evaluation-lab`
- GitHub Actions workflow
- Dockerfile
- `npm run verify:production`

Voiceover:

> We are requesting access to Food, Instamart, and Dineout servers for a private pilot. Our expected traffic is below 1 QPS, with staging validation before production use.

## Submission Checklist

- Add the GitHub repo link.
- Add the demo video link.
- Add production redirect URI.
- Add primary engineering contact email.
- Confirm requested servers: `food`, `instamart`, `dineout`.
- Run `npm run lint`, `npm test`, and `npm run build` before sharing.
