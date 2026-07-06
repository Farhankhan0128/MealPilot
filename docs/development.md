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

The verifier creates a plan, checks 35-tool coverage, verifies Website Atlas coverage for the public access page, launch blog, page modules, and application CTAs, validates Builder Intake for critical signup/apply/demo/contact/docs CTAs, access-form fields, demo storyboard, outbound drafts, and live-credential gates, validates FAQ & Policy Center coverage for homepage/developer/enterprise questions, footer resources, access ground rules, policy categories, and support contact, validates Growth Partnership Center coverage for get-noticed, hiring, co-branding, direct-support, co-marketing, analytics, launch experiments, metrics, assets, and external partner asks, validates Channel & Multimodal Studio coverage for voice, auto-restock, group ordering, dietary planning, reservation, and screenshot-to-order lanes, validates Nutrition & Budget Intelligence coverage for protein-per-rupee, coupon-safe Food carts, Instamart pantry gaps, group budgets, Dineout balance, safety controls, and external nutrition-data gates, validates Household Preference Graph coverage for Food active orders, Instamart order history, go-to items, Dineout location memory, household weights, forecasts, privacy controls, and external history gates, validates Guest Collaboration & Calendar coverage for guest votes, occasion templates, Dineout-first planning, Food reminder handoffs, Instamart prep, calendar artifacts, Slack/Teams gates, and no-scheduled-delivery safety, validates Luxury Experience Workspace coverage for reservation review, Food cart review, Instamart basket review, combined evening planning, recovery workspaces, all-tool coverage, widget fallbacks, voice contracts, telemetry, and confirmation gates, validates Reviewer Artifact Vault coverage for proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and handoff email, validates Visual QA Center coverage for viewport targets, selector manifests, artifact paths, no-overlap and text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and screenshot automation gates, verifies the 69-page Swiggy Docs Coverage audit, validates Swiggy Upstream Watch for `llms.txt`, `llms-full.txt`, v1.0 limitations, v1.1/v1.2/v2 roadmap, signed manifest watch, and new-tool action queues, validates the AI Client Connect Kit for six clients and SDK auth modes, validates the Brand Compliance Kit for attribution, asset gates, palette rules, and no-endorsement copy, validates the Data Governance Center for DPDP roles, residency, data flows, DSR routing, retention, token redaction, security contacts, and signed-manifest watch, validates the Journey Compiler for official recipes and all 35 indexed tools, validates the Access Dossier for production-access fields, review checks, ground rules, and legal readiness, validates the Premium Use Case Studio for ten differentiated playbooks and all 35 tools placed into routes, validates the Premium Concierge Itinerary for official recipe sources, all-server tool coverage, saved-call optimizations, separate confirmations, and scheduling gates, validates the Staging Cutover Rehearsal for real MCP first calls, fail-closed token handling, retry branches, support packet fields, and 48-hour promotion gates, validates the Staging Certification Matrix for all-tool wave assignment, 48-hour soak, telemetry, and external credential gates, validates the Staging Transcript Export for JSONL, Markdown, redaction, session ids, support envelope, and non-blind retry evidence, probes all 35 tools in Tool Lab, validates the Tool Contract Matrix for all-tool parameter contracts, response envelopes, confirmation gates, retry policy, and error buckets, validates State Orchestrator for refresh-before-mutation, switch guards, stale-cart recovery, voice/chat contracts, and server boundaries, validates Widget Runtime for iframe sandboxing, origin verification, postMessage events, activation checks, render contracts, semantic fallbacks, voice exclusions, and hosted-widget opt-in gates, calls local MCP `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`, validates Resource & Prompt Studio inventory and smoke requests, validates the MCP Capability Registry for tools/resources/prompts, validates Swiggy OAuth Status, validates credential onboarding, runtime telemetry, audit ledger evidence, Submission Console handoff readiness, Support Bridge report_error payloads, SLO Incident Command evidence, Error Intelligence buckets/codes, preflight/replay/widgets/submission evidence, runs resilience-drill and evaluation-lab assertions, asserts reviewer proof remains above target, and confirms the Production Launch Bundle preserves Swiggy external gates.

The verifier also validates Commercial Action Guard for Food order placement, Instamart checkout, Dineout booking, combined-flow confirmation locks, non-blind retry drills, telemetry, and support packet fields.

The verifier also validates `/api/swiggy-source-intelligence` for Builders website inventory, CTA coverage, `llms` and markdown documentation counts, 35-tool reference alignment, drift signals, external gates, and build-queue readiness.

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
- `GET /api/swiggy-docs-coverage`
- `GET /api/swiggy-upstream-watch`
- `GET /api/swiggy-source-intelligence`
- `GET /api/swiggy-innovation-radar`
- `GET /api/ai-client-connect-kit`
- `GET /api/brand-compliance-kit`
- `GET /api/swiggy-journey-compiler`
- `GET /api/swiggy-access-dossier`
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
- `GET /api/credential-onboarding`
- `GET /api/enterprise-delegated-auth`
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
- `GET /api/evaluation-lab`
- `GET /api/submission-package`
- `GET /api/production-launch-bundle`
- `GET /api/rate-limit-plan`
- `GET /api/traffic-readiness-plan`
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

`/api/credential-onboarding` shows the OAuth metadata URLs, Dynamic Client Registration dry-run payload for `/auth/register`, redirect URI audit, required MCP scopes, access-form fields, and the external Swiggy gates. Local tests keep this as evidence only and do not create live Swiggy client registrations.

`/api/enterprise-delegated-auth` shows the enterprise platform-operator flow: per-user PKCE, authorization-code exchange, per-user bearer token handling, 5-day token lifetime, 30-day Swiggy user session, redirect scheme strategy, logout, 401/419/403 recovery, capacity backoff, and the contract/staging/production gates Swiggy must approve.

`/api/mcp/resource-prompt-studio` shows the concrete MCP resources and prompts surfaced by the local mock: two resource URIs and two prompts for each Swiggy server, sample `resources/read` and `prompts/get` payloads, JSON-RPC smoke requests, and live staging gates for Swiggy-issued credentials.

`/api/channel-multimodal-studio` shows the developer-page build lanes as concrete channel contracts: voice ordering, auto-restock, group ordering, dietary planning, reservation planning, and screenshot-to-order, with Swiggy toolchains, local execution packets, response rules, confirmation gates, telemetry contracts, and Slack/Teams, mobile camera, vision/OCR, and enterprise gates.

`/api/nutrition-budget-intelligence` shows premium nutrition and budget planning routes: protein-per-rupee Food search, COD-safe coupons, Instamart go-to and product search, group-budget allocation, Dineout evening balance, and camera-label macro planning with no medical claims.

`/api/household-preference-graph` shows consent-aware personalization routes: Food active-order taste signals, Instamart go-to items and order history, Dineout saved-location memory, household member weights, pantry forecasts, failure memory, retention rules, and DPDP controls.

`/api/guest-collaboration-calendar` shows guest collaboration routes: vote rounds, date night, guests at home, office lunch, weekday reset, recovery meal, calendar reminders, share links, voice briefs, and Slack/Teams handoff gates.

`/api/luxury-experience-workspace` shows premium review workspaces: lean, premium, family, social, and training modes; Dineout reservation review; Food cart review; Instamart basket review; combined evening planning; recovery desk; widget fallbacks; voice contracts; and telemetry gates.

`/api/reviewer-artifact-vault` shows the Swiggy access-submission manifest: proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, handoff checklist, and reviewer email copy.

`/api/visual-qa-center` shows reviewer screenshot targets, desktop/tablet/mobile viewport sizes, selector manifests, Playwright screenshot artifact paths, no-overlap rules, text-fit rules, widget fallback checks, redaction visibility, commercial confirmation visibility, mobile layout checks, Source Intelligence, Innovation Radar, and automation gates. Run `npm run verify:visual` against the production server to generate PNGs plus `artifacts/visual-qa/report.json`.

## Safety Tests

The test suite checks that:

- MealPilot composes Food, Instamart, and Dineout recommendations.
- `/api/plan`, `/api/confirm`, and `/api/mcp/:server` work end to end.
- MCP Gateway reports mock/staging/production cutover status and staging calls fail closed without a bearer token.
- Staging Cutover Rehearsal records first real MCP probes, OAuth and token gates, fail-closed behavior, support packet fields, retry branches, and 48-hour promotion checks.
- Website Atlas covers global header, docs subnav, footer groups, production access page, launch blog, page modules, CTAs, resource links, and legal links.
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
- Tool Lab probes all 35 official tools, preserves JSON-RPC `tools/call` shape, and classifies commercial actions behind confirmation gates.
- Tool Contract Matrix maps all 35 tool parameters, source/privacy labels, response envelopes, current and planned error buckets, retry posture, fixture previews, and official references.
- State Orchestrator maps multi-turn cart truth, Food restaurant switches, Instamart address switches, Dineout slot refreshes, stale-cart recovery, and voice/chat response differences to explicit guards.
- Swiggy Docs Coverage maps all 69 `llms.txt` pages across Start, Build, Operate, Reference, and Blog to app evidence and external gates.
- Swiggy Upstream Watch maps Swiggy's changelog, `llms.txt`, `llms-full.txt`, v1.0 limitations, v1.1/v1.2/v2 roadmap, signed manifests, and action queues to MealPilot proof surfaces.
- Swiggy Source Intelligence reconciles Builders website pages, CTAs, `llms` docs, markdown twins, reference tool counts, drift signals, and build-queue items into one Launch Center surface.
- Swiggy Innovation Radar maps Swiggy developer ideas, enterprise signals, access ground rules, support model, and MCP references into premium product lanes, route optimizations, build phases, differentiators, and partner gates.
- Traffic Readiness maps expected sessions, daily tool calls, peak QPS, Retry-After behavior, seven-day major-event notice, capacity upgrade email, and the 1% -> 10% -> 50% -> 100% rollout.
- AI Client Connect Kit generates client configs, coding-agent rule files, SDK auth-mode guidance, troubleshooting, privacy notes, and delegated-auth gates.
- Brand Compliance Kit maps Powered by Swiggy attribution, co-branding rules, asset gates, palette usage, no-endorsement copy, and final screenshot review.
- Data Governance Center maps Swiggy Data Fiduciary and MealPilot Data Processor roles, India/Singapore residency, tool-call PII flows, local DSR endpoints, Swiggy-originated DSR routing, 90-day audit retention, token redaction, security contacts, and signed-manifest watch items.
- Enterprise Delegated Auth Center maps Swiggy's multi-tenant on-behalf-of OAuth 2.1 flow, per-user token storage, platform redirect schemes, troubleshooting, architecture review, and external partner gates.
- Swiggy Journey Compiler maps all 35 tools into official Food, Instamart, Dineout, combined, and premium MealPilot journeys with confirmation and recovery gates.
- Swiggy Access Dossier maps access-form fields, Swiggy review checks, allowed/restricted/prohibited conduct, legal readiness, developer/enterprise tracks, proof links, and external/manual gates.
- Premium Use Case Studio maps ten premium product playbooks across all three Swiggy servers and all 35 official tools, with route savings, surfaces, safety gates, metrics, and launch stages.
- Premium Concierge Itinerary turns the official Food, Instamart, Dineout, and combined recipes into a luxury day-and-weekend operating plan with all 35 tools covered, route savings, reminders, cart refresh rules, and separate confirmations.
- Staging Certification Matrix assigns all 35 tools to OAuth, read, mutation, commercial, support, 48-hour soak, and production-promotion waves while preserving staging credentials and production approval as external gates.
- Staging Transcript Export converts one plan session into Swiggy-ready JSONL, Markdown replay, redaction manifest, support envelope, certification-wave mapping, and non-blind retry evidence.
- MCP Capability Registry maps `mcp:tools`, `mcp:resources`, `mcp:prompts`, OAuth metadata, widget registry, static metadata, prompt templates, and external gates.
- Resource & Prompt Studio exercises all local `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` paths across Food, Instamart, and Dineout.
- Local MCP JSON-RPC supports `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` for review-time evidence before live Swiggy credentials.
- Submission Console consolidates developer/enterprise access targets, official access requirements, prepared form fields, required attachments, packet order, demo-video gate, runbook steps, blockers, and builders@swiggy.in drafts.
- Swiggy OAuth Status reports authorize/token/logout endpoints, pending PKCE verifier count, callback status, token source, token expiry, storage rules, and no-token-logging posture.
- Credential onboarding reports DCR preview, redirect URI status, metadata endpoints, PKCE readiness, scopes, and access-form fields.
- Runtime telemetry records live API and MCP request events with request IDs, hashed user context, session correlation, status classes, latency, and redaction evidence.
- Audit Ledger Center records redacted plan audit events, support correlation keys, retention posture, DSR routing, and builders@swiggy.in packet fields.
- Support Bridge prepares official `report_error` payloads for Food, Instamart, and Dineout with toolContext identifiers, redaction rules, SLA routing, and builders@swiggy.in escalation.
- SLO Incident Command maps 99.9% uptime targets, latency classes, status-page fallback, S0-S3 runbooks, 72-hour maintenance notice, measurement exclusions, and remediation evidence.
- Error Intelligence maps Swiggy's current `success:false` failure envelope, message/HTTP buckets, planned symbolic codes, domain failures, retry policy, observability hooks, and support actions.
- Profile, substitution, confirm-all, tracking, and Builder Access package routes work end to end.
- Pantry, group planning, scheduling, ops, privacy, markdown export, and OAuth callback routes work end to end.
- Readiness, OpenAPI, preflight, replay, widgets, Widget Runtime, Staging Cutover, submission, Submission Console, Production Launch Bundle, rate-limit, version, compliance, data governance, audit ledger, and reviewer proof routes work end to end.
- Resilience drills cover safe 5xx retries, 429 Retry-After handling, 401 reauth, non-idempotent check-then-retry, and deprecation monitoring.
- Evaluation Lab checks multi-persona city coverage, voice-safe responses, budget fit, preflight gates, confirmation locks, and PII minimization.
- File-backed storage persists plans across server instances and exposes export/compaction diagnostics.
- The React UI loads server-generated plans and confirms through the API.
- All commercial actions require explicit confirmation.
- Confirming one recommendation does not silently confirm the others.
- Order-placement class tools are not blindly retried.
