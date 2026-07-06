# Development

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm start
npm run verify:production
MEALPILOT_URL=http://localhost:8787 npm run verify:visual
MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet
```

## App Structure

```text
src/
  App.tsx
  styles.css
  assets/
    mealpilot-logo.svg
  api/
    mealpilotApi.ts
  domain/
    planner.ts
    safety.ts
    types.ts
  integrations/
    swiggy/
      client.ts
      mockClient.ts
      oauth.ts
      retry.ts
server/
  app.ts
  index.ts
  mock/
    swiggyToolRouter.ts
  services/
    advancedWorkflows.ts
    capabilityRegistry.ts
    auditLedger.ts
    confirmationService.ts
    codingAgentGovernance.ts
    credentialOnboarding.ts
    demoStudio.ts
    errorIntelligence.ts
    faqPolicyCenter.ts
    growthPartnership.ts
    launchBundle.ts
    observability.ts
    openApi.ts
    pkce.ts
    productionEvidence.ts
    runtimeTelemetry.ts
    sourceIntelligence.ts
    innovationRadar.ts
    submissionConsole.ts
    supportBridge.ts
    toolLab.ts
    websiteAtlas.ts
  store/
    sessionStore.ts
scripts/
  verify-production.mjs
```

## Design Language

MealPilot uses a Carbon-inspired open product design language documented in `docs/design-language.md`. The web app keeps the implementation local to React, `lucide-react`, `src/assets/mealpilot-logo.svg`, and `src/styles.css`: sticky product header, mobile navigation, reviewer sidebar, footer, 2x spacing, 12-column evidence grids, accessible focus states, explicit confirmation dialog behavior, and visible `actionNotice` feedback for state-changing CTAs.

## Runtime Shape

Development runs two processes:

- `npm run dev:api`: Express API on `http://localhost:8787`
- `npm run dev:web`: Vite app on `http://localhost:5173`

Vite proxies `/api/*` to the Express API.

Production-style local run serves both the built frontend and API from Express:

```bash
npm run build
npm start
```

Open `http://localhost:8787`.

Production verification expects the server to be running:

```bash
npm run build
npm start
npm run verify:production
```

The verifier creates a plan, checks 35-tool coverage, verifies Website Atlas coverage for the public access page, launch blog, rendered-page crawl evidence, page modules, and application CTAs, validates Builder Intake for critical signup/apply/demo/contact/docs CTAs, access-form fields, demo storyboard, outbound drafts, and live-credential gates, validates FAQ & Policy Center coverage for homepage/developer/enterprise questions, footer resources, access ground rules, policy categories, and support contact, validates Growth Partnership Center coverage for get-noticed, hiring, co-branding, direct-support, co-marketing, analytics, launch experiments, metrics, assets, and external partner asks, validates Channel & Multimodal Studio coverage for voice, auto-restock, group ordering, dietary planning, reservation, and screenshot-to-order lanes, validates Nutrition & Budget Intelligence coverage for protein-per-rupee, coupon-safe Food carts, Instamart pantry gaps, group budgets, Dineout balance, safety controls, and external nutrition-data gates, validates Household Preference Graph coverage for Food active orders, Instamart order history, go-to items, Dineout location memory, household weights, forecasts, privacy controls, and external history gates, validates Guest Collaboration & Calendar coverage for guest votes, occasion templates, Dineout-first planning, Food reminder handoffs, Instamart prep, calendar artifacts, Slack/Teams gates, and no-scheduled-delivery safety, validates Luxury Experience Workspace coverage for reservation review, Food cart review, Instamart basket review, combined evening planning, recovery workspaces, all-tool coverage, widget fallbacks, voice contracts, telemetry, and confirmation gates, validates Reviewer Artifact Vault coverage for proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and handoff email, validates Visual QA Center coverage for viewport targets, selector manifests, artifact paths, no-overlap and text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, Deep Site Map card, Developer Quickstart card, Access Evidence Matrix card, Staging Credential Drill card, Live Signal Calibration card, and screenshot automation gates, verifies the 69-page Swiggy Docs Coverage audit and Docs Twin Explorer markdown/rendered page pairs, validates Swiggy Upstream Watch for `llms.txt`, `llms-full.txt`, v1.0 limitations, v1.1/v1.2/v2 roadmap, signed manifest watch, and new-tool action queues, validates Swiggy Source Intelligence, Deep Site Map, and Developer Quickstart for website page, CTA, rendered module, header/docs/footer link, first-call drill, SDK adapter, auth gate, source-section, proof-link, assertion, and external-gate coverage, validates the AI Client Connect Kit for six clients and SDK auth modes, validates the Brand Compliance Kit for attribution, asset gates, palette rules, and no-endorsement copy, validates the Data Governance Center for DPDP roles, residency, data flows, DSR routing, retention, token redaction, security contacts, and signed-manifest watch, validates the Journey Compiler for official recipes and all 35 indexed tools, validates the Access Dossier for production-access fields, review checks, ground rules, and legal readiness, validates the Access Evidence Matrix for 5 sections, 9 required application fields, required attachments, browser runbook rows, proof commands, owner assignment, operator inputs, and Swiggy gates, validates the Premium Use Case Studio for ten differentiated playbooks and all 35 tools placed into routes, validates the Premium Concierge Itinerary for official recipe sources, all-server tool coverage, saved-call optimizations, separate confirmations, and scheduling gates, validates the Staging Cutover Rehearsal for real MCP first calls, fail-closed token handling, retry branches, support packet fields, and 48-hour promotion gates, validates the Swiggy Staging Credential Drill for credential signal, first read-only JSON-RPC probes, seeded-data requirements, operator runbook, handoff email, and external credential gates, validates Swiggy Live Signal Calibration for Food/Instamart/Dineout signal lanes, probes, privacy controls, fallback rules, and live credential gates, validates the Staging Certification Matrix for all-tool wave assignment, 48-hour soak, telemetry, and external credential gates, validates the Staging Transcript Export for JSONL, Markdown, redaction, session ids, support envelope, and non-blind retry evidence, probes all 35 tools in Tool Lab, validates the Tool Contract Matrix for all-tool parameter contracts, response envelopes, confirmation gates, retry policy, and error buckets, validates State Orchestrator for refresh-before-mutation, switch guards, stale-cart recovery, voice/chat contracts, and server boundaries, validates Widget Runtime for iframe sandboxing, origin verification, postMessage events, activation checks, render contracts, semantic fallbacks, voice exclusions, and hosted-widget opt-in gates, calls local MCP `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`, validates Resource & Prompt Studio inventory and smoke requests, validates the MCP Capability Registry for tools/resources/prompts, validates Swiggy OAuth Status, validates credential onboarding, validates Sandbox Credential Workbench for local-to-staging credential gates, runtime telemetry, audit ledger evidence, Submission Console and Access Submission Studio handoff readiness, Support Bridge report_error payloads, SLO Incident Command evidence, Error Intelligence buckets/codes, preflight/replay/widgets/submission evidence, runs resilience-drill and evaluation-lab assertions, asserts reviewer proof remains above target, and confirms the Production Launch Bundle preserves Swiggy external gates.

The verifier also validates Commercial Action Guard for Food order placement, Instamart checkout, Dineout booking, combined-flow confirmation locks, non-blind retry drills, telemetry, and support packet fields.

The verifier also validates `/api/swiggy-route-optimizer` for official source links, call-saving rollups, optimizer profiles, explicit parallel batches, commercial-action exclusion from parallel batches, cross-server handoff redaction, and source-linked route assertions.

The verifier also validates `/api/swiggy-load-lab` for synthetic launch-load scenarios, Retry-After readiness, cohort ramp math, background-job gating, commercial serialization assertions, and external Swiggy capacity actions.

The verifier also validates `/api/swiggy-offer-intelligence` for Food coupon tool sequencing, Dineout deal validation, Instamart value substitutions, no-blind-discount guardrails, offer recovery drills, live-inventory external gates, and launch-bundle handoff coverage.

The verifier also validates `/api/swiggy-order-lifecycle` for Food, Instamart, and Dineout status tools, tracking cadence, non-blind retry recovery, timeline telemetry redaction, support-ready lifecycle packets, and launch-bundle handoff coverage.

The verifier also validates `/api/swiggy-location-trust` for Food/Instamart saved-address tools, Instamart create/delete address flows, Dineout saved locations, address-choice pauses, address switch refresh guards, raw-address redaction, and staging credential gates.

The verifier also validates `/api/swiggy-cart-mutation-workbench` for Food cart readback, Instamart full-cart replacement, Dineout create_cart gates, payment-method truth, add-on confirmation, commercial single-flight rules, and staging cart-write gates.

The verifier also validates `/api/swiggy-discovery-freshness` for Food restaurant/menu discovery, Instamart product and go-to item variants, Dineout restaurant details and slots, pagination truth, coordinate consistency, freshness invalidation, and staging discovery gates.

The verifier also validates `/api/swiggy-live-signal-calibration` for Food active-order memory, Instamart go-to and order-history cadence, Dineout saved-location and booking truth, discovery relevance drift, offer/cart truth, support failure memory, privacy controls, and staging credential gates.

The verifier also validates `/api/swiggy-confirmation-command-center` for final Food `place_food_order`, Instamart `checkout`, and Dineout `book_table` proof: fresh cart or slot reads, explicit per-action approvals, separate combined-plan confirmations, post-action status probes before retry, Swiggy-response payment and free-booking truth, and live credential gates.

The verifier also validates `/api/swiggy-cancellation-care-center` for Food and Instamart no-tool cancellation handling, official customer-care copy, Dineout booking-status recovery, `report_error` payload context, incident email routing, planned error-code gates, and live support calibration gates.

The verifier also validates `/api/swiggy-dineout-precision-center` for the Dineout free-booking and bill-payment split: `book_table` only follows free slot evidence, `create_cart` bill payment uses `cartType: "DINEOUT"`, paid deals are blocked from the free booking path, `get_booking_status` guards retries, and live payment proof stays credential-gated.

The verifier also validates `/api/swiggy-visual-dish-capture` and `/api/swiggy-visual-dish-capture/analyze` for camera-to-commerce routing: dish photos, menu screenshots, pantry photos, and chat images resolve to confirmed labels before Food, Instamart, Dineout, or combined route plans; raw images are not retained; and vision, staging, and confirmation gates remain visible.

The verifier also validates `/api/swiggy-auth-lifecycle-center` for Swiggy OAuth token lifecycle: PKCE S256, 120-second single-use codes, 5-day access tokens, no refresh-token assumption in v1.0, 401/419/403 recovery, exact redirect allowlisting, delegated per-user token boundaries, logout handling, secure storage, and no-token logging.

The verifier also validates `/api/swiggy-source-intelligence` for Builders website inventory, CTA coverage, `llms` and markdown documentation counts, 35-tool reference alignment, drift signals, external gates, and build-queue readiness.

The verifier also validates `/api/coding-agent-governance` for the root `AGENTS.md` file, official Swiggy coding-agent docs, `llms.txt`, `llms-full.txt`, markdown-twin retrieval, reference paths, Food 14 / Instamart 13 / Dineout 8 smoke evidence, commercial confirmation rules, and no-token/no-PII logging guardrails.

The verifier also validates `/api/swiggy-innovation-radar` for official source inputs, premium opportunity lanes, all-server Dineout-first orchestration, route optimization evidence, staged build phases, and partner/staging gates.

The UI test suite validates the premium portal shell, mobile navigation, Swiggy OAuth start behavior, builder-packet export feedback, reminder scheduling feedback, group-member feedback, privacy export feedback, support-report feedback, and guarded confirmation flow.

Durable local persistence:

```bash
MEALPILOT_DATA_FILE=.mealpilot/mealpilot-store.json npm start
```

When `MEALPILOT_DATA_FILE` is set, plans, reminders, pantry state, group state, OAuth sessions, and profile data are persisted to a versioned JSON snapshot. Omit it for in-memory demo mode.

## API

- `GET /api/health`
- `GET /api/ready`
- `GET /api/openapi.json`
- `GET /api/config`
- `POST /api/plan`
- `GET /api/sessions/:sessionId`
- `GET /api/sessions/:sessionId/surface`
- `GET /api/sessions/:sessionId/preflight`
- `GET /api/sessions/:sessionId/replay`
- `GET /api/sessions/:sessionId/widgets`
- `GET /api/mcp/widget-runtime`
- `GET /api/mcp/backpressure-governor`
- `GET /api/mcp/staging-cutover`
- `POST /api/confirm`
- `POST /api/confirm-all`
- `POST /api/substitute`
- `POST /api/remove-item`
- `GET /api/tracking/:sessionId`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/builder-package`
- `GET /api/builder-package.md`
- `GET /api/pantry`
- `PUT /api/pantry`
- `GET /api/group`
- `POST /api/group/members`
- `POST /api/schedule`
- `GET /api/schedule`
- `GET /api/ops`
- `GET /api/go-live`
- `GET /api/swiggy-website-atlas`
- `GET /api/swiggy-builders-launch-story`
- `GET /api/swiggy-operating-contract-center`
- `GET /api/swiggy-builder-intake`
- `GET /api/swiggy-faq-policy`
- `GET /api/swiggy-growth-partnership`
- `GET /api/channel-multimodal-studio`
- `GET /api/nutrition-budget-intelligence`
- `GET /api/household-preference-graph`
- `GET /api/guest-collaboration-calendar`
- `GET /api/luxury-experience-workspace`
- `GET /api/reviewer-artifact-vault`
- `GET /api/visual-qa-center`
- `GET /api/builder-packet-export`
- `GET /api/builder-packet-export.md`
- `GET /api/swiggy-docs-coverage`
- `GET /api/swiggy-docs-twin-explorer`
- `GET /api/swiggy-upstream-watch`
- `GET /api/swiggy-source-intelligence`
- `GET /api/swiggy-deep-site-map`
- `GET /api/swiggy-developer-quickstart`
- `GET /api/swiggy-cta-execution-center`
- `GET /api/swiggy-innovation-radar`
- `GET /api/ai-client-connect-kit`
- `GET /api/coding-agent-governance`
- `GET /api/brand-compliance-kit`
- `GET /api/swiggy-journey-compiler`
- `GET /api/swiggy-access-dossier`
- `GET /api/swiggy-access-evidence-matrix`
- `GET /api/premium-use-case-studio`
- `GET /api/premium-concierge-itinerary`
- `GET /api/staging-certification-matrix`
- `GET /api/sessions/:sessionId/staging-transcript`
- `GET /api/mcp/tool-lab`
- `GET /api/mcp/tool-contract-matrix`
- `GET /api/mcp/scenario-runner`
- `GET /api/mcp/state-orchestrator`
- `GET /api/mcp/capability-registry`
- `GET /api/mcp/resource-prompt-studio`
- `GET /api/mcp-gateway`
- `GET /api/auth/swiggy/status`
- `GET /api/swiggy-auth-lifecycle-center`
- `GET /api/credential-onboarding`
- `GET /api/sandbox-credential-workbench`
- `GET /api/swiggy-staging-credential-drill`
- `GET /api/enterprise-delegated-auth`
- `GET /api/enterprise-platform-center`
- `GET /api/observability/traces`
- `GET /api/telemetry/runtime`
- `GET /api/audit-ledger`
- `GET /api/swiggy-route-optimizer`
- `GET /api/support/bridge`
- `GET /api/slo-incident-command`
- `GET /api/data-governance-center`
- `GET /api/error-intelligence`
- `GET /api/demo-studio`
- `GET /api/submission-console`
- `GET /api/access-submission-studio`
- `PATCH /api/access-submission-studio/state`
- `GET /api/evaluation-lab`
- `GET /api/submission-package`
- `GET /api/production-launch-bundle`
- `GET /api/rate-limit-plan`
- `GET /api/traffic-readiness-plan`
- `GET /api/swiggy-load-lab`
- `GET /api/swiggy-offer-intelligence`
- `GET /api/swiggy-order-lifecycle`
- `GET /api/swiggy-location-trust`
- `GET /api/swiggy-cart-mutation-workbench`
- `GET /api/swiggy-discovery-freshness`
- `GET /api/swiggy-confirmation-command-center`
- `GET /api/swiggy-cancellation-care-center`
- `GET /api/swiggy-dineout-precision-center`
- `GET /api/version-monitor`
- `GET /api/compliance-evidence`
- `GET /api/reviewer-proof`
- `GET /api/resilience`
- `GET /api/storage/status`
- `GET /api/storage/export`
- `POST /api/storage/restore`
- `POST /api/storage/compact`
- `GET /api/privacy/export`
- `DELETE /api/privacy`
- `POST /api/mcp/:server`
- `POST /api/auth/swiggy/start`
- `GET /api/auth/swiggy/callback`

## CI And Deploy

GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

It runs:

- `npm ci`
- `npm run lint`
- `npm test -- --run`
- `npm run build`
- production smoke verification against `npm start`
- CI reviewer evidence capture: `npm run verify:production`, `npm run verify:visual`, `npm run export:builder-packet`, and uploaded `artifacts/visual-qa` plus `artifacts/builder-packet`
- Sandbox credential verification: `npm run verify:production` checks local OAuth readiness, DCR, seeded-data lanes, staging cutover commands, and 48-hour soak gates before the packet is sent.

Docker:

```bash
docker build -t mealpilot .
docker run --rm -p 8787:8787 mealpilot
```

Render:

```text
render.yaml
```

Fill `SWIGGY_CLIENT_ID` and `SWIGGY_REDIRECT_URI` after Builder Access credentials are issued.
`MEALPILOT_DATA_FILE` is set in the Render blueprint so app state survives restarts when the platform has persistent disk mounted at `/var/data`.

## Swiggy Modes

MealPilot starts in mock mode so the builder-access demo works before credentials are issued.

```text
SWIGGY_ENV=mock
```

After staging credentials:

```text
SWIGGY_ENV=staging
SWIGGY_CLIENT_ID=<issued-client-id>
SWIGGY_REDIRECT_URI=http://localhost:5173/auth/swiggy/callback
```

Production should use an HTTPS redirect URI with exact-match allowlisting.

`SWIGGY_ACCESS_TOKEN` can be injected by a secure runtime for staging smoke tests, but normal OAuth callback stores the exchanged token in process memory. `/api/mcp-gateway` shows whether each server is using local mock routing, routable Swiggy streamable HTTP, or blocked fail-closed mode.

`/api/auth/swiggy/status` shows the reviewer-safe OAuth lifecycle: Swiggy authorize/token/logout endpoints, redirect URI, scope, pending PKCE verifier count, latest callback event, token source, expiry, callback checklist, and secure token storage rules. The frontend OAuth Status panel calls this endpoint after auth start and callback completion.

`/api/swiggy-auth-lifecycle-center` is the reviewer-safe auth recovery control room. It turns Swiggy's 120-second authorization codes, 5-day access tokens, 30-day idle sessions, no v1 refresh-token issuance, 401/419/403 recovery, exact redirect allowlisting, delegated per-user tokens, logout, and no-token logging into a dashboard card plus production verifier assertions.

`/api/credential-onboarding` shows the OAuth metadata URLs, Dynamic Client Registration dry-run payload for `/auth/register`, redirect URI audit, required MCP scopes, access-form fields, and the external Swiggy gates. Local tests keep this as evidence only and do not create live Swiggy client registrations.

`/api/sandbox-credential-workbench` shows the reviewer-facing localhost-to-staging credential plan: local demo proof, DCR, PKCE, exact redirect allowlisting, staging credentials, seeded Food/Instamart/Dineout data, 48-hour soak, commands, and production-promotion gates.

`/api/enterprise-delegated-auth` shows the enterprise platform-operator flow: per-user PKCE, authorization-code exchange, per-user bearer token handling, 5-day token lifetime, 30-day Swiggy user session, redirect scheme strategy, logout, 401/419/403 recovery, capacity backoff, and the contract/staging/production gates Swiggy must approve.

`/api/enterprise-platform-center` is the broader platform-operator proof surface. It maps tenant registry boundaries, per-user delegated tokens, tenant-scoped quota profiles, support routing, audit exports, peak-QPS review, contract gates, co-branding approval, staging soak, and enterprise Slack/dashboard gates without pretending those external Swiggy approvals are already granted.

`/api/mcp/resource-prompt-studio` shows the concrete MCP resources and prompts surfaced by the local mock: two resource URIs and two prompts for each Swiggy server, sample `resources/read` and `prompts/get` payloads, JSON-RPC smoke requests, and live staging gates for Swiggy-issued credentials.

`/api/channel-multimodal-studio` shows the developer-page build lanes as concrete channel contracts: voice ordering, auto-restock, group ordering, dietary planning, reservation planning, and screenshot-to-order, with Swiggy toolchains, local execution packets, response rules, confirmation gates, telemetry contracts, and Slack/Teams, mobile camera, vision/OCR, and enterprise gates.

`/api/swiggy-visual-dish-capture` is the productized screenshot-to-order proof surface. It maps dish photos, menu screenshots, pantry photos, and chat images into safe Food menu search, Instamart ingredient rescue, Dineout discovery, or combined evening routes; `/api/swiggy-visual-dish-capture/analyze` returns deterministic label, confidence, route, confirmation, telemetry, and no-raw-image-retention evidence for reviewer smoke tests.

`/api/nutrition-budget-intelligence` shows premium nutrition and budget planning routes: protein-per-rupee Food search, COD-safe coupons, Instamart go-to and product search, group-budget allocation, Dineout evening balance, and camera-label macro planning with no medical claims.

`/api/household-preference-graph` shows consent-aware personalization routes: Food active-order taste signals, Instamart go-to items and order history, Dineout saved-location memory, household member weights, pantry forecasts, failure memory, retention rules, and DPDP controls.

`/api/guest-collaboration-calendar` shows guest collaboration routes: vote rounds, date night, guests at home, office lunch, weekday reset, recovery meal, calendar reminders, share links, voice briefs, and Slack/Teams handoff gates.

`/api/luxury-experience-workspace` shows premium review workspaces: lean, premium, family, social, and training modes; Dineout reservation review; Food cart review; Instamart basket review; combined evening planning; recovery desk; widget fallbacks; voice contracts; and telemetry gates.

`/api/reviewer-artifact-vault` shows the Swiggy access-submission manifest: proof links, Deep Site Map, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, handoff checklist, and reviewer email copy.

`/api/visual-qa-center` shows reviewer screenshot targets, desktop/tablet/mobile viewport sizes, selector manifests, Playwright screenshot artifact paths, no-overlap rules, text-fit rules, widget fallback checks, redaction visibility, commercial confirmation visibility, mobile layout checks, Source Intelligence, Deep Site Map, Innovation Radar, Access Evidence Matrix card proof, and automation gates. Run `npm run verify:visual` against the production server to generate PNGs plus `artifacts/visual-qa/report.json`.

`/api/swiggy-builders-launch-story` turns the April 2026 Builders Club launch blog into a reviewer-ready story center. It reconciles the launch-era 18+ API-tool narrative with the current 35-tool docs snapshot and packages story beats, the demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing guardrails.

`/api/swiggy-operating-contract-center` consolidates official operate and ship-to-production guidance into one reviewer contract: SLA and latency targets, current/future rate-limit behavior, traffic rollout, support escalation, version/deprecation watch, runbooks, readiness gates, and Swiggy external approvals.

`/api/swiggy-cta-execution-center` shows the click-readiness workbench for every official Swiggy Builders CTA, global header link, docs subnav item, footer resource, mailto, Google Form, and legal link. Each target includes a browser action, keyboard path, proof links, completion gate, assertion coverage, and an operator-vs-Swiggy external gate.

`/api/coding-agent-governance` reads the root `AGENTS.md` and scores the rules future coding agents must follow before editing Swiggy integrations: fetch official docs first, prefer page `.md` twins, never invent tools or parameters, preserve commercial confirmation gates, and keep sensitive data out of logs.

`/api/access-submission-studio` is the final operator room before Swiggy submission. It joins official Start Building, Request access, and Send Us a Demo targets with copy-ready form values, required attachments, browser runbook steps, generated builders@swiggy.in mailto draft, blockers, and external gates. `PATCH /api/access-submission-studio/state` saves the local handoff fields for demo URL, contact, production redirect, static egress, environment, terms, form submission, handoff email, and notes; it never submits the official Swiggy form or sends email during local tests.

`/api/swiggy-access-evidence-matrix` is the access-review evidence ledger. It reconciles Access Dossier, Submission Console, Access Submission Studio, and Reviewer Artifact Vault rows into one owner-tagged matrix for official fields, proof attachments, runbook steps, commands, manual operator inputs, and Swiggy approval gates.

`/api/builder-packet-export` and `/api/builder-packet-export.md` turn the Submission Console, Access Submission Studio, Access Evidence Matrix, Production Launch Bundle, Reviewer Artifact Vault, Deep Site Map, and Visual QA Center into a reproducible Swiggy access packet. Run `npm run export:builder-packet` against the production server to write `artifacts/builder-packet/mealpilot-swiggy-access-packet.json`, `mealpilot-swiggy-access-packet.md`, and `verification-summary.json`.

`/api/swiggy-confirmation-command-center` is the final-commerce proof surface for Swiggy Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`. It shows the last fresh cart or slot read, the explicit user approval, separate approval rows for combined plans, post-action status probes before retry, payment/free-booking values as reported by Swiggy, and external gates for live credentials.

`/api/swiggy-cancellation-care-center` is the cancellation and care proof surface. It blocks fake Food and Instamart cancellation calls, shows the official Swiggy customer-care phone copy, routes Dineout booking issues through `get_booking_status`, prepares `report_error` payloads with redacted toolContext, and keeps incident email evidence ready for `builders@swiggy.in`.

`/api/swiggy-dineout-precision-center` is the Dineout precision proof surface. It separates free table bookings from bill-payment carts, validates `isFree=true` and `bookingPrice=0` before `book_table`, uses `cartType: "DINEOUT"` for bill-payment `create_cart`, blocks paid deals from the free booking path, and keeps live payment validation behind Swiggy credentials.

## Safety Tests

The test suite checks that:

- MealPilot composes Food, Instamart, and Dineout recommendations.
- `/api/plan`, `/api/confirm`, and `/api/mcp/:server` work end to end.
- MCP Gateway reports mock/staging/production cutover status and staging calls fail closed without a bearer token.
- Staging Cutover Rehearsal records first real MCP probes, OAuth and token gates, fail-closed behavior, support packet fields, retry branches, and 48-hour promotion checks.
- Website Atlas covers global header, docs subnav, footer groups, production access page, launch blog, rendered-page crawl evidence, page modules, CTAs, resource links, and legal links.
- Swiggy Builders Launch Story Center converts the launch blog into a reviewer-ready story, reconciles the launch-era 18+ signal with the current 35-tool docs snapshot, and packages demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing guardrails.
- Swiggy Operating Contract Center joins SLA, rate limits, support, versioning, changelog, and ship-to-production sources into pillars, runbooks, readiness gates, and external approval gates.
- Builder Intake Command Center turns all 11 signup, apply, demo, contact, docs, and footer CTA paths into locally prepared action ownership, form values, demo storyboard steps, copy-ready drafts, and explicit external gates for final form/email submission and Swiggy approval.
- FAQ & Policy Center maps homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, and legal signals to MealPilot evidence links.
- Growth Partnership Center maps get-noticed, hiring, co-branding, direct support, co-marketing, analytics, strategic guidance, launch experiments, metrics, proof assets, and external partner asks.
- Channel & Multimodal Studio maps voice, web chat, Slack/Teams, mobile camera, enterprise, and screenshot-to-order channels to Swiggy MCP toolchains, local execution packets, response contracts, telemetry, and external platform gates.
- Nutrition & Budget Intelligence maps Food, Instamart, Dineout, coupon, cart, group, and camera-label routes to protein-per-rupee estimates, budget controls, safety notes, and external data gates.
- Household Preference Graph maps active orders, go-to items, order history, saved-location signals, household weights, forecasts, cancellation rules, and retention boundaries to consented personalization evidence.
- Guest Collaboration & Calendar Center maps group votes, occasion templates, Dineout slot checks, Food reminder handoffs, Instamart prep, calendar artifacts, and Slack/Teams gates to separate Swiggy confirmation controls.
- Luxury Experience Workspace maps reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces to authoritative Swiggy reads, all-tool coverage, widget fallbacks, voice contracts, telemetry, and separate confirmation gates.
- Reviewer Artifact Vault maps proof links, screenshots, logs, traces, OpenAPI, commands, video checklist, handoff checklist, and redaction rules into one safe Swiggy access-review manifest.
- Visual QA Center maps demo-critical selectors, viewport dimensions, screenshot artifact paths, text-fit and no-overlap rules, widget fallback checks, mobile layout checks, redaction visibility, and screenshot automation gates.
- Swiggy Staging Credential Drill Center composes credential onboarding, sandbox workbench, staging cutover, staging certification, seeded-data needs, first-call JSON-RPC drills, operator commands, and builders@swiggy.in handoff copy into one first-live-credential runbook.
- Tool Lab probes all 35 official tools, preserves JSON-RPC `tools/call` shape, and classifies commercial actions behind confirmation gates.
- Tool Contract Matrix maps all 35 tool parameters, source/privacy labels, response envelopes, current and planned error buckets, retry posture, fixture previews, and official references.
- State Orchestrator maps multi-turn cart truth, Food restaurant switches, Instamart address switches, Dineout slot refreshes, stale-cart recovery, and voice/chat response differences to explicit guards.
- Swiggy Docs Coverage maps all 69 `llms.txt` pages across Start, Build, Operate, Reference, and Blog to app evidence and external gates.
- Swiggy Docs Twin Explorer pairs all 69 official markdown twins with rendered URLs, retrieval lanes, proof links, section groups, and drift gates.
- Swiggy Upstream Watch maps Swiggy's changelog, `llms.txt`, `llms-full.txt`, v1.0 limitations, v1.1/v1.2/v2 roadmap, signed manifests, and action queues to MealPilot proof surfaces.
- Swiggy Source Intelligence reconciles Builders website pages, CTAs, `llms` docs, markdown twins, reference tool counts, drift signals, and build-queue items into one Launch Center surface.
- Swiggy Deep Site Map consolidates every Builders page, rendered module signal, CTA, header link, docs subnav item, footer resource, proof link, source-reconciliation section, assertion, and external gate into one Launch Center audit surface.
- Developer Quickstart Workbench maps Swiggy's official quickstart, build-agent, OAuth, and `llms.txt` sources to readiness steps, SDK adapters, first-call JSON-RPC drills, recipe handoffs, auth gates, and verifier commands.
- CTA Execution Center converts official Builders CTAs, header links, docs nav links, footer resources, mailto links, Google Forms, and legal links into click-ready browser actions, keyboard paths, proof bundles, and manual completion gates.
- Swiggy Innovation Radar maps Swiggy developer ideas, enterprise signals, access ground rules, support model, and MCP references into premium product lanes, route optimizations, build phases, differentiators, and partner gates.
- Traffic Readiness maps expected sessions, daily tool calls, peak QPS, Retry-After behavior, seven-day major-event notice, capacity upgrade email, and the 1% -> 10% -> 50% -> 100% rollout.
- AI Client Connect Kit generates client configs, coding-agent rule files, SDK auth-mode guidance, troubleshooting, privacy notes, and delegated-auth gates.
- Coding Agent Governance verifies `AGENTS.md` against official Swiggy docs retrieval rules, current tool-count smoke tests, commercial confirmation gates, and sensitive-data redaction boundaries.
- Brand Compliance Kit maps Powered by Swiggy attribution, co-branding rules, asset gates, palette usage, no-endorsement copy, and final screenshot review.
- Data Governance Center maps Swiggy Data Fiduciary and MealPilot Data Processor roles, India/Singapore residency, tool-call PII flows, local DSR endpoints, Swiggy-originated DSR routing, 90-day audit retention, token redaction, security contacts, and signed-manifest watch items.
- Enterprise Delegated Auth Center maps Swiggy's multi-tenant on-behalf-of OAuth 2.1 flow, per-user token storage, platform redirect schemes, troubleshooting, architecture review, and external partner gates.
- Swiggy Enterprise Platform Center maps the official platform-operator lane into tenant boundaries, delegated-auth controls, quota and peak-QPS review, support SLAs, contract gates, co-branding approvals, and enterprise audit exports.
- Swiggy Journey Compiler maps all 35 tools into official Food, Instamart, Dineout, combined, and premium MealPilot journeys with confirmation and recovery gates.
- Swiggy Access Dossier maps access-form fields, Swiggy review checks, allowed/restricted/prohibited conduct, legal readiness, developer/enterprise tracks, proof links, and external/manual gates.
- Swiggy Access Evidence Matrix reconciles every official access field, required attachment, runbook step, proof command, owner, operator input, and Swiggy gate into one reviewer-ready ledger.
- Premium Use Case Studio maps ten premium product playbooks across all three Swiggy servers and all 35 official tools, with route savings, surfaces, safety gates, metrics, and launch stages.
- Premium Concierge Itinerary turns the official Food, Instamart, Dineout, and combined recipes into a luxury day-and-weekend operating plan with all 35 tools covered, route savings, reminders, cart refresh rules, and separate confirmations.
- Staging Certification Matrix assigns all 35 tools to OAuth, read, mutation, commercial, support, 48-hour soak, and production-promotion waves while preserving staging credentials and production approval as external gates.
- Staging Transcript Export converts one plan session into Swiggy-ready JSONL, Markdown replay, redaction manifest, support envelope, certification-wave mapping, and non-blind retry evidence.
- MCP Capability Registry maps `mcp:tools`, `mcp:resources`, `mcp:prompts`, OAuth metadata, widget registry, static metadata, prompt templates, and external gates.
- Resource & Prompt Studio exercises all local `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` paths across Food, Instamart, and Dineout.
- Swiggy Visual Dish Capture Center validates the camera-to-commerce lane with no raw-image retention, user-confirmed labels, Food/Instamart/Dineout route plans, and vision or staging gates before live execution.
- Local MCP JSON-RPC supports `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` for review-time evidence before live Swiggy credentials.
- Submission Console consolidates developer/enterprise access targets, official access requirements, prepared form fields, required attachments, packet order, demo-video gate, runbook steps, blockers, and builders@swiggy.in drafts.
- Access Submission Studio validates official CTA targets, copy blocks, required proof attachments, browser runbook, generated mailto handoff, and non-auto-submission gates.
- Swiggy Access Evidence Matrix validates required field coverage, attachment readiness, proof-command coverage, owner assignment, and unresolved Swiggy/operator gates.
- Builder Packet Export writes the copy-ready and machine-readable Swiggy access packet under ignored local artifacts, preserving operator-owned form submission and Swiggy credential gates.
- GitHub Actions installs Chromium for Playwright, runs production smoke, captures visual evidence, exports the Swiggy builder packet, and uploads ignored reviewer artifacts for every push and pull request.
- Swiggy OAuth Status reports authorize/token/logout endpoints, pending PKCE verifier count, callback status, token source, token expiry, storage rules, and no-token-logging posture.
- Credential onboarding reports DCR preview, redirect URI status, metadata endpoints, PKCE readiness, scopes, and access-form fields.
- Runtime telemetry records live API and MCP request events with request IDs, hashed user context, session correlation, status classes, latency, and redaction evidence.
- Audit Ledger Center records redacted plan audit events, support correlation keys, retention posture, DSR routing, and builders@swiggy.in packet fields.
- Support Bridge prepares official `report_error` payloads for Food, Instamart, and Dineout with toolContext identifiers, redaction rules, SLA routing, and builders@swiggy.in escalation.
- SLO Incident Command maps 99.9% uptime targets, latency classes, status-page fallback, S0-S3 runbooks, 72-hour maintenance notice, measurement exclusions, and remediation evidence.
- Error Intelligence maps Swiggy's current `success:false` failure envelope, message/HTTP buckets, planned symbolic codes, domain failures, retry policy, observability hooks, and support actions.
- Swiggy Confirmation Command Center verifies final Food order, Instamart checkout, and Dineout booking proof with fresh cart or slot reads, explicit separate approvals, non-blind retry probes, Swiggy-response payment/free-booking truth, and live credential gates.
- Swiggy Cancellation & Care Center verifies no-tool cancellation handling, official customer-care copy, Dineout booking recovery, `report_error` support context, incident email routing, and planned error-code gates.
- Swiggy Auth Lifecycle Center verifies PKCE, token lifetimes, v1 refresh-token gating, re-auth recovery, secure storage, and no-token logging.
- Profile, substitution, confirm-all, tracking, and Builder Access package routes work end to end.
- Pantry, group planning, scheduling, ops, privacy, markdown export, and OAuth callback routes work end to end.
- Readiness, OpenAPI, preflight, replay, widgets, Widget Runtime, Staging Cutover, submission, Submission Console, Access Evidence Matrix, Production Launch Bundle, rate-limit, version, compliance, data governance, audit ledger, and reviewer proof routes work end to end.
- Resilience drills cover safe 5xx retries, 429 Retry-After handling, 401 reauth, non-idempotent check-then-retry, and deprecation monitoring.
- Evaluation Lab checks multi-persona city coverage, voice-safe responses, budget fit, preflight gates, confirmation locks, and PII minimization.
- File-backed storage persists plans across server instances and exposes export/compaction diagnostics.
- The React UI loads server-generated plans and confirms through the API.
- All commercial actions require explicit confirmation.
- Confirming one recommendation does not silently confirm the others.
- Order-placement class tools are not blindly retried.
