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
- Swiggy staging/production endpoint map for the eventual MCP swap.
- OAuth 2.1 PKCE helper for the Swiggy authorization flow.
- Swiggy OAuth Status panel and endpoint for redacted authorize URL, callback outcome, pending PKCE verifier count, token source, expiry, storage policy, and exact-match redirect readiness.
- Swiggy Auth Lifecycle Center at `/api/swiggy-auth-lifecycle-center` that turns PKCE S256, 120-second single-use authorization codes, 5-day access tokens, no refresh-token assumption in v1.0, 401/419 re-auth recovery, exact redirect allowlisting, per-user delegated tokens, and no-token logging into reviewer evidence.
- Credential Cockpit with Dynamic Client Registration preview, redirect URI audit, scope coverage, OAuth metadata endpoints, and external gate tracking.
- Sandbox Credential Workbench that joins localhost demo proof, Dynamic Client Registration, PKCE, exact redirect allowlisting, Swiggy staging credentials, seeded-data plans, 48-hour soak, and production-promotion gates.
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
- Commercial Action Guard that locks Food `place_food_order`, Instamart `checkout`, Dineout `book_table`, and combined journeys behind fresh reads, explicit confirmations, check-then-retry drills, telemetry, and support packets.
- Swiggy Visual Dish Capture Center at `/api/swiggy-visual-dish-capture` plus `/api/swiggy-visual-dish-capture/analyze` that turns a dish photo, menu screenshot, pantry image, or chat image caption into Food menu, Instamart ingredient, Dineout discovery, or combined route plans with no raw-image retention and confirmation-first safety.
- Swiggy Voice Commerce Rehearsal Center at `/api/swiggy-voice-commerce-center` plus `/api/swiggy-voice-commerce-center/rehearse` that turns spoken Food, Instamart, Dineout, and combined requests into short TTS scripts, visual card fallbacks, no-raw-id readbacks, no-raw-audio telemetry, and confirmation-locked route plans.
- Swiggy Quality Loop Center at `/api/swiggy-quality-loop-center` plus `/api/swiggy-quality-loop-center/feedback` that turns post-order, grocery, booking, and combined feedback into consented preference learning, support-safe redaction, repeat optimization, and no-raw-payload telemetry.
- Swiggy Confirmation Command Center at `/api/swiggy-confirmation-command-center` that acts as visible final-commerce confirmation proof for Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`, requiring fresh cart or slot reads, explicit user approval, separate confirmations for combined plans, post-action status probes before retry, Swiggy-response truth for payment and free bookings, and live credential gates before external execution.
- Swiggy Cancellation & Care Center at `/api/swiggy-cancellation-care-center` that keeps Food and Instamart cancellation requests on official customer-care copy instead of fake MCP cancellation calls, routes Dineout booking issues through `get_booking_status`, and prepares `report_error` plus incident email evidence with redacted toolContext.
- Swiggy Dineout Precision Center at `/api/swiggy-dineout-precision-center` that separates free table bookings from Dineout bill-payment carts, validates `isFree=true` and `bookingPrice=0` before `book_table`, blocks paid deals from the free booking path, models `create_cart` with `cartType: "DINEOUT"` for bill payment, and keeps live payment evidence behind Swiggy staging credentials.
- MCP Backpressure Governor that models Swiggy's current upstream-shedder behavior separately from future 429, `Retry-After`, and `X-RateLimit-*` headers with token buckets, tracking cadence, voice burst shaping, and background-job gates.
- Swiggy Load Lab that composes Traffic Readiness, Backpressure Governor, and Route Optimizer evidence into synthetic launch-load scenarios, cohort ramps, Retry-After drills, and Swiggy capacity gates.
- Swiggy Operating Contract Center that consolidates official SLA, rate-limit, support, versioning, changelog, and ship-to-production guidance into one reviewer contract with pillars, runbooks, readiness gates, and a `builders@swiggy.in` launch email.
- Swiggy Offer Intelligence that safely uses Food coupon tools, Dineout deal discovery, Instamart value substitutions, and live-offer disclaimers without bypassing commercial confirmations.
- Swiggy Order Lifecycle Command Center that maps Food, Instamart, and Dineout status tools into post-confirmation timelines, non-blind retry probes, tracking cadence, telemetry, and support-ready recovery.
- MCP Capability Registry that maps and locally exercises `mcp:tools`, `mcp:resources`, `mcp:prompts`, OAuth metadata, widgets, prompt contracts, and external Swiggy gates.
- Resource & Prompt Studio that exercises `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` across Food, Instamart, and Dineout with samples, smoke calls, and live Swiggy gates.
- Swiggy Website Atlas that maps the Builders header, docs subnav, footer groups, production access page, launch blog, rendered-page crawl evidence, page modules, CTAs, and legal/resource links to MealPilot evidence.
- Swiggy Builders Launch Story Center that turns the launch blog into a reviewer-ready story: 18+ launch-era signal reconciled with the current 35-tool docs snapshot, demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing gates.
- Swiggy Deep Site Map that consolidates every Builders page, module, CTA, header link, docs subnav item, footer resource, source-refresh section, and MealPilot proof path into one reviewer audit.
- Developer Quickstart Workbench that turns Swiggy's official self-serve developer path into readiness steps, SDK/framework adapters, first-call `get_addresses` JSON-RPC drills, OAuth gates, and recipe handoffs.
- CTA Execution Center that converts every official Builders CTA, global header link, docs nav item, footer resource, mailto, form, and legal link into click-ready browser actions, keyboard paths, proof links, and explicit manual gates.
- Builder Intake Command Center that converts every signup, apply, demo, contact, docs, and footer CTA into owner-assigned next actions, access-form fields, a demo storyboard, and copy-ready handoff drafts.
- FAQ & Policy Center that maps homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, and legal policy signals to MealPilot evidence.
- Growth Partnership Center that turns Swiggy's get-noticed, co-branding, direct-support, hiring, co-marketing, analytics, and strategic-growth signals into launch experiments, proof assets, metrics, and partner asks.
- Channel & Multimodal Studio that turns Swiggy's developer-page ideas into voice, web chat, Slack/Teams, mobile camera, enterprise, and screenshot-to-order contracts with local execution packets for route plans, response rules, confirmation gates, and telemetry.
- Nutrition & Budget Intelligence that optimizes protein-per-rupee, coupon-safe Food carts, Instamart pantry gaps, group budgets, and Dineout balance routes without medical claims.
- Household Preference Graph that turns consented Food active orders, Instamart go-to items/order history, Dineout saved-location signals, group weights, and support failures into privacy-safe personalization.
- Guest Collaboration & Calendar Center that coordinates guest votes, occasion templates, Dineout slots, Food reminder handoffs, Instamart prep, Slack/Teams gates, and voice-safe briefs.
- Luxury Experience Workspace that turns Dineout reservations, Food carts, Instamart baskets, combined evenings, and recovery flows into polished review workspaces with all 35 Swiggy tools, concierge modes, widget fallbacks, voice contracts, telemetry, and confirmation controls.
- Reviewer Artifact Vault that packages proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and Swiggy handoff copy into one access-submission manifest.
- Visual QA Center that maps reviewer screenshot targets, viewport sizes, selector manifests, text-fit and no-overlap rules, Swiggy widget fallback checks, mobile layout checks, and screenshot automation gates.
- Swiggy Docs Coverage audit that maps all 69 `llms.txt`-linked pages across Start, Build, Operate, Reference, and Blog to MealPilot evidence and external gates.
- Swiggy Docs Twin Explorer that pairs every official markdown twin with its rendered page URL, retrieval command, section group, proof route, and drift gate.
- Swiggy Upstream Watch that tracks `llms.txt`, `llms-full.txt`, the changelog, v1.1/v1.2/v2 roadmap, signed manifests, and update actions for future Swiggy MCP changes.
- Swiggy Source Intelligence that reconciles Builders website pages, CTAs, `llms` docs, markdown twins, reference tool counts, drift signals, and the next build queue against MealPilot evidence.
- Swiggy Innovation Radar that turns Swiggy developer ideas, enterprise signals, access ground rules, support model, and all MCP servers into premium opportunity lanes, route optimizations, build phases, and partner gates.
- AI Client Connect Kit that generates Swiggy MCP configs for Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, generic MCP clients, coding-agent rules, SDK auth modes, and delegated-auth gates.
- Coding Agent Governance that ships root `AGENTS.md`, scores it against official Swiggy `llms.txt`, `llms-full.txt`, markdown-twin, reference, auth, rate-limit, production, confirmation, and redaction rules, and exposes smoke tests for future coding agents.
- Brand Compliance Kit that maps Powered by Swiggy attribution, co-branding rules, brand asset gates, palette usage, no-endorsement copy, and launch screenshot checks.
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
- Support Bridge with official `report_error` JSON-RPC payloads for Food, Instamart, and Dineout, SLA routing, redaction rules, and escalation checklist.
- SLO Incident Command Center with Swiggy uptime targets, latency classes, status-page fallback, S0/S1 comms, maintenance windows, measurement exclusions, and remediation evidence.
- Error Intelligence catalogue for Swiggy `success:false` envelopes, message/HTTP classification, planned symbolic codes, domain failures, retry budgets, and support actions.
- Support report generator that creates a Swiggy-ready `builders@swiggy.in` escalation mail with session IDs.
- Demo Studio with cart preflight checks, offer opportunities, MCP replay transcripts, staging transcript export, demo progress, and submission-field readiness.
- Evaluation Lab with multi-scenario persona QA across Bengaluru, Delhi NCR, Mumbai, chat, voice, lean budgets, and same-day cart-safety turns.
- JSON-RPC replay endpoint that shows the exact tool-call shape MealPilot will use when Swiggy staging credentials are issued.
- Staging Transcript Export that produces session-scoped JSONL, Markdown, redaction manifest, support envelope, certification-wave mapping, and proof links for Swiggy review.
- Builder Access submission package endpoint that mirrors Swiggy's requested application fields and highlights manual inputs.
- Submission Console that consolidates developer/enterprise form targets, official access requirements, prepared fields, proof attachments, packet order, runbook steps, blockers, and copy-ready handoff drafts.
- Access Submission Studio that turns Start Building, Request access, and Send Us a Demo into one operator-facing room with copy blocks, required attachments, browser runbook, generated mailto draft, and explicit external gates.
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
GET  /api/swiggy-builder-intake
GET  /api/swiggy-faq-policy
GET  /api/swiggy-growth-partnership
GET  /api/channel-multimodal-studio
GET  /api/swiggy-visual-dish-capture
GET  /api/swiggy-voice-commerce-center
GET  /api/swiggy-quality-loop-center
GET  /api/nutrition-budget-intelligence
GET  /api/household-preference-graph
GET  /api/guest-collaboration-calendar
GET  /api/luxury-experience-workspace
GET  /api/reviewer-artifact-vault
GET  /api/visual-qa-center
GET  /api/swiggy-docs-coverage
GET  /api/swiggy-docs-twin-explorer
GET  /api/swiggy-upstream-watch
GET  /api/swiggy-source-intelligence
GET  /api/swiggy-deep-site-map
GET  /api/swiggy-developer-quickstart
GET  /api/swiggy-cta-execution-center
GET  /api/swiggy-innovation-radar
GET  /api/ai-client-connect-kit
GET  /api/brand-compliance-kit
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
GET  /api/mcp/widget-runtime
GET  /api/mcp/backpressure-governor
GET  /api/mcp/staging-cutover
GET  /api/mcp/capability-registry
GET  /api/mcp/resource-prompt-studio
GET  /api/mcp-gateway
GET  /api/auth/swiggy/status
GET  /api/swiggy-auth-lifecycle-center
GET  /api/credential-onboarding
GET  /api/sandbox-credential-workbench
GET  /api/enterprise-delegated-auth
GET  /api/enterprise-platform-center
GET  /api/swiggy-load-lab
GET  /api/swiggy-offer-intelligence
GET  /api/swiggy-order-lifecycle
GET  /api/swiggy-location-trust
GET  /api/swiggy-cart-mutation-workbench
GET  /api/swiggy-discovery-freshness
GET  /api/swiggy-confirmation-command-center
GET  /api/swiggy-cancellation-care-center
GET  /api/swiggy-dineout-precision-center
GET  /api/observability/traces
GET  /api/telemetry/runtime
GET  /api/audit-ledger
GET  /api/swiggy-route-optimizer
GET  /api/support/bridge
GET  /api/slo-incident-command
GET  /api/error-intelligence
GET  /api/submission-console
GET  /api/access-submission-studio
PATCH /api/access-submission-studio/state
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
5. Open Builder Intake, FAQ & Policy, Growth Partnership, Channel & Multimodal Studio, Visual Dish Capture, Nutrition & Budget Intelligence, Household Preference Graph, Guest Collaboration & Calendar, Luxury Experience Workspace, Reviewer Artifact Vault, Visual QA Center, and Deep Site Map to show every signup/apply/demo/contact/docs CTA, access-form field, FAQ theme, allowed/restricted/prohibited rule, developer build lane, growth experiment, partner ask, channel contract, screenshot-to-order route, macro/budget route, consented personalization signal, guest vote, calendar handoff, premium review workspace, reviewer artifact, visual QA target, page/module/CTA audit row, email draft, and live credential gate.
6. Open Tool Lab and show 35/35 callable JSON-RPC probes, guarded tools, commercial tools, and innovation lanes.
7. Open Tool Contract Matrix and show all 35 tool contracts, parameter counts, response envelopes, confirmation gates, retry posture, and planned error codes.
8. Open Scenario Runner and show the Food, Instamart, Dineout, and combined recipe traces with all 35 tools, confirmation gates, recovery reads, and reminder handling.
9. Open State Orchestrator and show refresh-before-mutation rules, restaurant/address switch guards, stale-cart recovery, server boundaries, and voice/chat contracts.
10. Open Widget Runtime and show iframe sandboxing, origin-verified postMessage events, semantic fallbacks, voice exclusions, and hosted-widget external gates.
11. Open Commercial Action Guard and show Food order, Instamart checkout, Dineout booking, and combined-flow confirmation locks, check-then-retry drills, telemetry fields, and support packet fields.
12. Open Capability Registry and Resource & Prompt Studio to show tools, resources, prompts, sample reads, prompt messages, smoke calls, OAuth metadata, widgets, and external gates mapped to MealPilot evidence.
13. Open Docs Coverage and Docs Twin Explorer to show all 69 Swiggy `llms.txt` pages, markdown twins, rendered page URLs, retrieval lanes, proof links, and remaining credential gates.
14. Open Upstream Watch to show `llms.txt`, `llms-full.txt`, v1.0 shipped capabilities, v1.1/v1.2/v2 roadmap items, signed-manifest watch, and the new-tool action queue.
15. Open Source Intelligence, Deep Site Map, Developer Quickstart, and CTA Execution to show website, docs, API tool counts, CTA inventory, rendered page modules, header/footer links, proof paths, first-call drills, framework adapters, OAuth gates, click targets, keyboard paths, drift signals, and the next build queue in one reviewer-ready panel.
16. Open Innovation Radar to show premium product lanes, route optimizations, build phases, differentiators, and partner gates derived from Swiggy signals.
17. Open AI Client Connect Kit to show six client configs, coding-agent rules, SDK auth modes, and delegated-auth gates.
18. Open Journey Compiler to show official recipe routes, all 35 tools indexed, confirmation gates, and call savings.
19. Open Access Dossier and Access Evidence Matrix to show production-access fields, review checks, allowed/restricted/prohibited rules, legal readiness, proof attachments, runbook steps, owners, and remaining manual inputs.
20. Open Use Case Studio to show ten premium playbooks, cross-server routing, all 35 tools placed, saved calls, surfaces, safety gates, and launch stages.
21. Open Premium Concierge to show lunch, pantry reset, Dineout evening, dessert reminder, and Sunday recovery itinerary slots with official recipe routes and separate confirmations.
22. Confirm one action, refresh tracking, and show the audit timeline with session IDs.
23. Open Demo Studio and show cart preflight, coupon opportunities, MCP replay, Submission Console, and submission readiness.
24. Start Swiggy OAuth and show the OAuth Status panel with authorize endpoint, pending PKCE verifier, callback result, token source, expiry, and no-token-logging checklist.
25. Open Credential Cockpit and show the `/auth/register` preview, localhost-vs-HTTPS redirect audit, and MCP scope coverage.
26. Open Staging Cutover and show first real MCP probes, fail-closed token behavior, support packet fields, retry branches, and 48-hour promotion gates.
27. Open Staging Credential Drill and show credential signal, first read-only JSON-RPC calls, seeded-data requirements, operator commands, handoff email, and Swiggy-owned promotion gates.
28. Open Delegated Auth Center and show per-user PKCE, token exchange, 5-day access tokens, 30-day user session, logout, troubleshooting, and enterprise partner gates.
29. Open Production Evidence and show widgets, rate limits, Traffic Readiness, MCP Backpressure Governor, SLO Command, Data Governance, version monitor, compliance controls, Source Intelligence artifact, Deep Site Map artifact, Developer Quickstart artifact, CTA Execution artifact, Innovation Radar artifact, Launch Bundle, Trace Monitor, Runtime Telemetry, Audit Ledger, Resilience Lab, Evaluation Lab, and reviewer proof score.
30. Schedule reminders, open Go-Live Gates, then export the Builder Access packet.
31. Open Support Bridge to show `report_error` payloads for Food, Instamart, and Dineout, then generate a support report with traceable session context.
32. Open Error Intelligence to show Swiggy error envelopes, retry buckets, planned codes, and terminal domain failures.

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

`GET /api/swiggy-docs-twin-explorer` is the markdown-twin workbench: every `llms.txt` page is paired with its `.md` source, rendered URL, retrieval command, section group, MealPilot proof route, assertion, and drift gate.

`GET /api/swiggy-source-intelligence` is the source reconciliation center: Builders website pages, homepage/developer/enterprise/docs CTAs, `llms.txt`, `llms-full.txt`, markdown twins, 35-tool reference counts, drift signals, and the build queue are compared against MealPilot evidence so reviewers can see what is implemented, what is watched, and what is gated by Swiggy credentials.

`GET /api/swiggy-builders-launch-story` is the launch-blog story center: it reconciles the April 2026 Builders Club launch narrative with the current 35-tool docs snapshot, then packages story beats, reviewer demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing guardrails.

`GET /api/swiggy-operating-contract-center` is the operate-docs contract center: official SLA, rate-limit, support, versioning, changelog, and ship-to-production guidance become six pillars, S0/rate-limit/support/version runbooks, readiness gates, external Swiggy approval gates, and a launch-review email draft.

`GET /api/swiggy-deep-site-map` is the page-by-page Builders website audit: homepage, developers, enterprises, access, docs, reference, blog, footer, every CTA, header, docs subnav, footer resource, module signal, proof link, source-reconciliation section, assertion, and external gate in one reviewer surface.

`GET /api/swiggy-developer-quickstart` is the self-serve developer onboarding workbench: official quickstart, build-agent, authenticate, and `llms.txt` sources become readiness steps, SDK/framework adapters, first-call `get_addresses` and discovery drills, auth gates, recipe handoffs, commands, assertions, and external Swiggy credential gates.

`GET /api/swiggy-cta-execution-center` is the click-readiness workbench: every official Builders CTA, global header link, docs subnav item, footer resource, mailto, Google Form, and legal link becomes a browser action, keyboard path, proof-link bundle, completion gate, assertion, and operator handoff rule.

`GET /api/swiggy-innovation-radar` is the product strategy engine: Swiggy developer ideas, enterprise signals, access ground rules, support model, and all-server MCP references become premium opportunity lanes, route optimizations, build phases, differentiators, next builds, and explicit staging or partner gates.

`GET /api/mcp/widget-runtime` is the Swiggy widget runtime proof: Food, Instamart, and Dineout widget surfaces, returned-by-tool mapping, iframe sandbox, origin verification, postMessage handlers, activation checklist, render contract matrix, semantic data-envelope fallbacks, voice rules, and hosted-widget opt-in gates.

`GET /api/mcp/commercial-action-guard` is the Swiggy commercial-action safety proof: Food order placement, Instamart checkout, Dineout booking, and combined evening flows mapped to fresh authoritative reads, explicit confirmations, non-blind check-then-retry policies, redacted telemetry fields, support packet context, and staging/production gates.

`GET /api/mcp/resource-prompt-studio` is the MCP resource and prompt proof: every Food, Instamart, and Dineout widget/static resource plus every planner, safety, and recovery prompt is listed with sample `resources/read` and `prompts/get` payloads, JSON-RPC smoke requests, MealPilot uses, and live Swiggy staging gates.

`GET /api/mcp/staging-cutover` is the real-transport rehearsal: Swiggy Streamable HTTP endpoint map, first read-only staging probes, OAuth/DCR readiness, fail-closed bearer-token behavior, retry and reauth branches, support packet fields, and production promotion gates.

`GET /api/submission-console` is the operator handoff console for signing up end to end: developer/enterprise form targets, official access fields, required attachments, demo-video gate, final contact/redirect/static-egress gates, runbook steps, and builders@swiggy.in drafts.

`GET /api/access-submission-studio` is the final Swiggy access submission room: official Start Building, Request access, and Send Us a Demo targets; copy-ready form blocks; required proof attachments; browser runbook; generated mailto draft; and explicit operator/Swiggy gates. `PATCH /api/access-submission-studio/state` persists the operator-owned demo URL, primary contact, production redirect URI, egress/IP, environment summary, terms acknowledgement, form-submitted timestamp, handoff-email timestamp, and notes so the studio can move from ready-to-submit into submitted handoff state without calling Swiggy automatically.

`GET /api/credential-onboarding` previews the Dynamic Client Registration payload for Swiggy's `POST /auth/register`, audits the redirect URI, and lists the exact access-form fields. It does not create external Swiggy state during local tests.

`GET /api/sandbox-credential-workbench` is the localhost-to-staging credential runbook: demo-video readiness, Dynamic Client Registration, PKCE, exact redirect allowlisting, Swiggy-issued staging credentials, seeded Food/Instamart/Dineout data, 48-hour soak, and production-promotion gates.

`GET /api/swiggy-staging-credential-drill` is the first-live-credential drill room: credential signal, first read-only JSON-RPC probes, seeded-data requirements, fail-closed OAuth/token posture, operator commands, builders@swiggy.in handoff email, and production-promotion gates.

`GET /api/enterprise-delegated-auth` turns Swiggy's enterprise delegated-auth guidance into reviewer evidence: platform DCR preregistration, per-user PKCE, authorize URL shape, token exchange, per-user token storage, MCP on-behalf-of calls, 401/419/403 recovery, logout, platform redirect schemes, architecture review, and partner contract/capacity gates.

`GET /api/enterprise-platform-center` turns Swiggy's platform-operator path into reviewer evidence: tenant boundaries, per-user delegated OAuth controls, peak-QPS and quota review, 48-hour staging soak, enterprise support channels, contract gates, co-branding approvals, redacted audit exports, and external Swiggy approvals.

`GET /api/brand-compliance-kit` maps Swiggy attribution and co-branding readiness: Powered by Swiggy copy, no false endorsement, brand asset external gates, #FF5200 usage, white-label restrictions, surface placements, and screenshot checklist.

`GET /api/swiggy-access-dossier` is the operator-facing production-access checklist: required and optional application fields, Swiggy review checks, ground rules, legal readiness, developer/enterprise tracks, proof links, and manual inputs before the Google Form submission.

`GET /api/swiggy-access-evidence-matrix` is the reviewer-facing access ledger: it derives one evidence matrix from Access Dossier, Submission Console, Access Submission Studio, and Reviewer Artifact Vault, then labels each official access field, attachment, runbook step, proof command, operator input, and Swiggy approval gate.

`GET /api/swiggy-builder-intake` is the signup and application command center: all 11 website CTA paths become locally prepared, owner-assigned actions with evidence links, required form fields, demo storyboard steps, copy-ready outbound drafts, and explicit operator/Swiggy gates for final submission and approval.

`GET /api/swiggy-faq-policy` is the FAQ and policy coverage center: homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, and legal signals map to MealPilot evidence links while enterprise contracts, co-branding, support channels, staging credentials, and production credentials remain external gates.

`GET /api/swiggy-growth-partnership` is the growth partnership center: official get-noticed, hiring, co-branding, direct-support, enterprise analytics, and joint go-to-market signals become MealPilot launch experiments, proof assets, metric targets, and explicit partner asks while Swiggy feature placement, co-marketing approval, Slack, partner manager, dashboard access, and higher limits remain external gates.

`GET /api/channel-multimodal-studio` is the developer-lane innovation center: voice ordering, auto-restock, group ordering, dietary planning, reservation planning, and screenshot-to-order become channel contracts, MCP toolchains, local execution packets, response rules, data boundaries, telemetry contracts, and external gates for Slack/Teams, mobile camera, vision/OCR, and enterprise embedding.

`GET /api/swiggy-visual-dish-capture` and `POST /api/swiggy-visual-dish-capture/analyze` productize the screenshot-to-order lane: the analyzer accepts a caption and optional image name, returns a detected dish label, confidence, alternatives, safe Swiggy route plans, no-raw-image-retention telemetry, and confirmation-first next actions.

`GET /api/swiggy-voice-commerce-center` and `POST /api/swiggy-voice-commerce-center/rehearse` productize voice commerce safely: the rehearsal accepts a spoken utterance transcript, classifies the Swiggy route, returns a three-line TTS script, card fallback, confirmation prompt, no-raw-audio telemetry, and Food/Instamart/Dineout toolchain evidence without placing any order or booking.

`GET /api/swiggy-quality-loop-center` and `POST /api/swiggy-quality-loop-center/feedback` productize post-experience learning: ratings and comments become consented derived tags, support-safe issue decisions, repeat-order optimization, and redacted telemetry without storing raw Swiggy payloads or crossing server boundaries.

`GET /api/nutrition-budget-intelligence` is the premium nutrition and budget layer: Food menu search, coupons, cart reads, Instamart go-to items, product search, Dineout slots, and combined routes become protein-per-rupee, pantry-gap, group-budget, and evening-balance playbooks with explicit nutrition-estimate safety controls.

`GET /api/household-preference-graph` is the consented personalization layer: Food active-order signals, Instamart order history and go-to items, Dineout saved-location and booking signals, household modes, pantry forecasts, and support failure memory become ranking weights with retention rules and DPDP controls.

`GET /api/guest-collaboration-calendar` is the group planning and calendar layer: guest votes, Dineout-first date nights, guests-at-home prep, office lunch, weekday reset, recovery meals, ICS reminders, share links, Slack/Teams digests, and voice briefs stay aligned with separate Swiggy confirmations and the Food v1 no-scheduled-delivery constraint.

`GET /api/luxury-experience-workspace` is the premium review layer: lean, premium, family, social, and training modes become Dineout reservation, Food cart, Instamart basket, combined evening, and recovery workspaces with all 35 Swiggy tools, authoritative reads, widget fallbacks, voice contracts, telemetry, and separate confirmation gates.

`GET /api/reviewer-artifact-vault` is the Swiggy access-submission manifest: proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and handoff email copy are bundled in one route.

`GET /api/visual-qa-center` is the screenshot and layout evidence center: desktop, tablet, and mobile selectors, Playwright artifact paths, no-overlap rules, text-fit rules, widget fallback checks, redaction visibility, commercial confirmation visibility, Source Intelligence, Deep Site Map, Innovation Radar, and screenshot automation gates are made reviewable.

`GET /api/coding-agent-governance` is the repo-native Swiggy coding-agent proof: it reads the actual root `AGENTS.md`, verifies official docs source signals, preserves the Food 14 / Instamart 13 / Dineout 8 smoke split, lists guardrails, and fails production verification when future coding-agent rules drift.

`GET /api/builder-packet-export` and `GET /api/builder-packet-export.md` generate the executable Swiggy access packet: prepared form fields, required attachments, verification commands, local artifact paths, visual QA proof, handoff email copy, and explicit operator/Swiggy gates for form submission, demo video, credentials, redirect URI, and co-branding approval.

`GET /api/premium-use-case-studio` is the product innovation map: ten premium MealPilot experiences, all 35 official Swiggy tools placed into use-case routes, cross-server call savings, chat/voice/widget/ops surfaces, safety gates, data boundaries, metrics, differentiators, roadmap, and external gates.

`GET /api/premium-concierge-itinerary` is the premium product operating layer: official Food, Instamart, Dineout, and combined recipe routes become lunch, pantry, Dineout evening, dessert reminder, and recovery itinerary slots with 35-tool coverage, saved-call optimizations, cart refresh rules, separate confirmation gates, and live-credential external gates.

`GET /api/mcp/tool-contract-matrix` is the contract-level Swiggy integration map: all 35 Food, Instamart, and Dineout tools get parameter metadata, source/privacy labels, response envelope guidance, confirmation gates, retry policy, planned/current error buckets, official reference links, and local fixture previews.

`GET /api/mcp/scenario-runner` executes the official Food, Instamart, Dineout, and combined recipes as local JSON-RPC `tools/call` traces, including guard/recovery probes, support paths, confirmation-gated commerce steps, and full 35-tool coverage.

`GET /api/mcp/state-orchestrator` turns Swiggy's multi-turn cart state and voice/chat pattern docs into executable MealPilot rules: authoritative cart refreshes, Food restaurant-switch warnings, Instamart address-switch clears, Dineout slot refreshes, stale-cart recovery, and surface-specific response contracts.

`GET /api/swiggy-route-optimizer` is the official-recipe optimization ledger: it compares baseline and optimized Food, Instamart, Dineout, and combined routes, exposes optimizer profiles, explicit parallel read batches, cross-server handoffs, cache windows, retry ownership, redaction rules, call savings, and commercial confirmation boundaries.

`GET /api/staging-certification-matrix` is the credentialed launch map: all 35 Swiggy tools assigned to staging smoke waves, OAuth/DCR prerequisites, 48-hour soak requirements, telemetry/redaction expectations, rollback policy, and production-promotion gates.

`GET /api/sessions/:sessionId/staging-transcript` exports a Swiggy-ready transcript for one plan session: JSONL log lines, Markdown replay, request IDs, hashed user id, redaction manifest, non-blind retry evidence, support envelope, and certification-wave links.

`GET /api/traffic-readiness-plan` converts Swiggy's expected-volume and rate-limit guidance into reviewer evidence: projected sessions/tool calls, peak QPS, per-lane budgets, Retry-After handling, 1% to 100% rollout stages, seven-day major-event notice, and a capacity-upgrade email draft.

`GET /api/swiggy-load-lab` is the launch-load workbench: it simulates pilot, evening-peak, voice-burst, and campaign-spike scenarios without sending live Swiggy traffic; checks per-lane ceilings, Retry-After readiness, 1% to 100% cohort gates, commercial serialization, and capacity-approval actions.

`GET /api/swiggy-offer-intelligence` is the discount-safety workbench: it sequences Food `fetch_food_coupons` before `apply_food_coupon`, validates Dineout deal context before booking, treats Instamart savings as product-variant and cart-bill optimization, and blocks exact live-savings claims until Swiggy credentials return real offer inventory.

`GET /api/swiggy-order-lifecycle` is the post-confirmation command center: it maps Food `get_food_orders`, `get_food_order_details`, `track_food_order`, Instamart `get_orders`, `get_order_details`, `track_order`, and Dineout `get_booking_status` into status timelines, non-blind retry probes, tracking cadence, redacted telemetry, and support packet rules.

`GET /api/swiggy-location-trust` is the saved-address and location trust center: it covers shared Food/Instamart `get_addresses`, Instamart `create_address` and `delete_address`, Dineout `get_saved_locations`, address-choice pauses, address switch refresh guards, raw-address redaction, and staging credential gates.

`GET /api/swiggy-cart-mutation-workbench` is the cart mutation control room: it covers Food `get_food_cart`, `update_food_cart`, and `flush_food_cart`, Instamart `get_cart`, `update_cart`, and `clear_cart`, Dineout `create_cart`, readback-after-write rules, payment-method truth, add-on confirmation, and live cart-write gates.

`GET /api/swiggy-discovery-freshness` is the search and availability workbench: it covers Food `search_restaurants`, `get_restaurant_menu`, and `search_menu`, Instamart `search_products` and `your_go_to_items`, Dineout `search_restaurants_dineout`, `get_restaurant_details`, and `get_available_slots`, with pagination truth, variant selection, coordinate consistency, and stale-result invalidation.

`GET /api/swiggy-confirmation-command-center` is the visible final-commerce confirmation proof for Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`: it shows fresh cart or slot reads, explicit user approval, separate approvals for combined plans, post-action status probes before retry, Swiggy-response payment and free-booking truth, and external gates for live credentials.

`GET /api/swiggy-cancellation-care-center` is the no-tool cancellation and support workbench: it shows official customer-care copy for Food and Instamart cancellation requests, Dineout booking-status recovery, `report_error` payload context across all three servers, incident email boundaries, planned error-code gates, and live support calibration gates.

`GET /api/swiggy-dineout-precision-center` is the Dineout free-booking and bill-payment precision workbench: it separates `book_table` free reservations from `create_cart` bill-payment carts, requires free-deal proof before booking, blocks paid deals, preserves no-blind retry through `get_booking_status`, and leaves live payment validation as a Swiggy credential gate.

`GET /api/slo-incident-command` turns Swiggy's SLA and uptime guidance into operational evidence: 99.9% uptime targets, latency bands for read/write/commercial tools, status-page fallback, S0-S3 communication plans, 72-hour maintenance notice, measurement exclusions, and remediation path.

`GET /api/data-governance-center` turns Swiggy's Data & Compliance guidance into DPDP evidence: Data Fiduciary/Data Processor roles, India/Singapore residency, tool-call PII inventory, local and Swiggy-originated DSR routing, 90-day Swiggy audit-log retention, token redaction, security contacts, and signed-manifest watch items.

`GET /api/audit-ledger` turns plan audit trails into support-safe Swiggy evidence: redacted session/tool events, support correlation keys, local retention posture, Swiggy 90-day audit-log acknowledgement, DSR routing, and builders@swiggy.in packet fields without raw payloads or tokens.

`GET /api/swiggy-live-signal-calibration` is the live-personalization calibration center: it maps Food active orders, Instamart go-to/order history, Dineout saved locations/booking status, discovery relevance, offer/cart truth, and support failure memory into read-only staging probes with privacy controls and fallback rules.

`GET /api/production-launch-bundle` consolidates the reviewer handoff: proof artifacts, commands, application fields, manual inputs, external Swiggy gates, and the draft access-review email. It intentionally keeps staging credentials and production approval marked as external gates until Swiggy issues them.

## Current Status

Runnable full-stack localhost app, optional durable persistence, 35-tool Swiggy MCP coverage map, Swiggy Website Atlas with production-access and launch-blog coverage, Swiggy Builders Launch Story Center, Swiggy Operating Contract Center, Builder Intake Command Center, FAQ & Policy Center, Growth Partnership Center, Channel & Multimodal Studio, Swiggy Visual Dish Capture Center, Swiggy Voice Commerce Rehearsal Center, Swiggy Quality Loop Center, Nutrition & Budget Intelligence, Household Preference Graph, Guest Collaboration & Calendar Center, Luxury Experience Workspace, Reviewer Artifact Vault, Visual QA Center, 69-page Swiggy Docs Coverage audit, Swiggy Docs Twin Explorer, Swiggy Upstream Watch, Swiggy Source Intelligence, Swiggy Deep Site Map, Developer Quickstart Workbench, CTA Execution Center, Swiggy Innovation Radar, AI Client Connect Kit, Coding Agent Governance with root `AGENTS.md`, Brand Compliance Kit, Data Governance Center, Enterprise Delegated Auth Center, Swiggy Enterprise Platform Center, Swiggy Journey Compiler, Swiggy Access Dossier, Swiggy Access Evidence Matrix, Premium Use Case Studio, Premium Concierge Itinerary, Staging Cutover Rehearsal, Swiggy Staging Credential Drill Center, Swiggy Live Signal Calibration Center, Staging Certification Matrix, Staging Transcript Export, executable 35-tool MCP Tool Lab, Tool Contract Matrix, Scenario Runner, State Orchestrator, Widget Runtime Center, Commercial Action Guard, Swiggy Confirmation Command Center, Swiggy Cancellation & Care Center, Swiggy Dineout Precision Center, MCP Capability Registry, Resource & Prompt Studio, staging/production MCP gateway, Swiggy OAuth Status, Swiggy Auth Lifecycle Center, Credential Cockpit with OAuth/DCR evidence, Sandbox Credential Workbench for localhost-to-staging access readiness, runtime telemetry ledger, Audit Ledger Center, Submission Console, Access Submission Studio, builder access proposal, technical packet, safety plan, launch readiness dashboard, demo studio, production evidence center, Traffic Readiness Plan, Swiggy Load Lab, Swiggy Offer Intelligence, Swiggy Order Lifecycle, SLO Incident Command Center, Production Launch Bundle, executable resilience drills, Support Bridge, Error Intelligence, multi-scenario evaluation lab, submission package, support workflow, and tests are ready. Next step: record the 2-3 minute demo and submit the Swiggy Builders Club access form with the GitHub repo and packet export.

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
