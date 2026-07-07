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

The verifier creates a plan, checks 35-tool coverage, verifies Website Atlas coverage for the public access page, launch blog, rendered-page crawl evidence, page modules, and application CTAs, validates Builder Intake for critical signup/apply/demo/contact/docs CTAs, access-form fields, demo storyboard, outbound drafts, and live-credential gates, validates FAQ & Policy Center coverage for homepage/developer/enterprise questions, footer resources, access ground rules, policy categories, and support contact, validates Growth Partnership Center coverage for get-noticed, hiring, co-branding, direct-support, co-marketing, analytics, launch experiments, metrics, assets, and external partner asks, validates Channel & Multimodal Studio coverage for voice, auto-restock, group ordering, dietary planning, reservation, screenshot-to-order lanes, and local channel execution packet composition, validates Nutrition & Budget Intelligence coverage for protein-per-rupee, coupon-safe Food carts, Instamart pantry gaps, group budgets, Dineout balance, safety controls, and external nutrition-data gates, validates Household Preference Graph coverage for Food active orders, Instamart order history, go-to items, Dineout location memory, household weights, forecasts, privacy controls, and external history gates, validates Guest Collaboration & Calendar coverage for guest votes, occasion templates, Dineout-first planning, Food reminder handoffs, Instamart prep, calendar artifacts, Slack/Teams gates, and no-scheduled-delivery safety, validates Luxury Experience Workspace coverage for reservation review, Food cart review, Instamart basket review, combined evening planning, recovery workspaces, all-tool coverage, widget fallbacks, voice contracts, telemetry, and confirmation gates, validates Reviewer Artifact Vault coverage for proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and handoff email, validates Visual QA Center coverage for viewport targets, selector manifests, artifact paths, no-overlap and text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, Deep Site Map card, Developer Quickstart card, Access Evidence Matrix card, Staging Credential Drill card, Live Signal Calibration card, and screenshot automation gates, verifies the 69-page Swiggy Docs Coverage audit and Docs Twin Explorer markdown/rendered page pairs, validates Swiggy Upstream Watch for `llms.txt`, `llms-full.txt`, v1.0 limitations, v1.1/v1.2/v2 roadmap, signed manifest watch, and new-tool action queues, validates Swiggy Source Intelligence, Deep Site Map, Page Mesh semantic integrity, and Developer Quickstart for website page, CTA, rendered module, header/docs/footer link, first-call drill, SDK adapter, auth gate, source-section, proof-link, assertion, and external-gate coverage, validates the AI Client Connect Kit for six clients and SDK auth modes, validates the Brand Compliance Kit for attribution, asset gates, palette rules, and no-endorsement copy, validates the Data Governance Center for DPDP roles, residency, data flows, DSR routing, retention, token redaction, security contacts, and signed-manifest watch, validates the Journey Compiler for official recipes and all 35 indexed tools, validates the Access Dossier for production-access fields, review checks, ground rules, and legal readiness, validates the Access Evidence Matrix for 5 sections, 9 required application fields, required attachments, browser runbook rows, proof commands, owner assignment, operator inputs, and Swiggy gates, validates the Premium Use Case Studio for ten differentiated playbooks and all 35 tools placed into routes, validates the Premium Concierge Itinerary for official source links, all-server tool coverage, saved-call optimizations, separate confirmations, and scheduling gates, validates the Staging Cutover Rehearsal for real MCP first calls, fail-closed token handling, retry branches, support packet fields, and 48-hour promotion gates, validates the Swiggy Staging Credential Drill for credential signal, first read-only JSON-RPC probes, seeded-data requirements, operator runbook, handoff email, and external credential gates, validates Swiggy Live Signal Calibration for Food/Instamart/Dineout signal lanes, probes, privacy controls, fallback rules, and live credential gates, validates the Staging Certification Matrix for all-tool wave assignment, 48-hour soak, telemetry, and external credential gates, validates the Staging Transcript Export for JSONL, Markdown, redaction, session ids, support envelope, and non-blind retry evidence, probes all 35 tools in Tool Lab, validates the Tool Contract Matrix for all-tool parameter contracts, response envelopes, confirmation gates, retry policy, and error buckets, validates State Orchestrator for refresh-before-mutation, switch guards, stale-cart recovery, voice/chat contracts, and server boundaries, validates Widget Runtime for iframe sandboxing, origin verification, postMessage events, activation checks, render contracts, semantic fallbacks, voice exclusions, and hosted-widget opt-in gates, calls local MCP `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`, validates Resource & Prompt Studio inventory and smoke requests, validates the MCP Capability Registry for tools/resources/prompts, validates Swiggy OAuth Status, validates credential onboarding, validates Sandbox Credential Workbench for local-to-staging credential gates, runtime telemetry, audit ledger evidence, Submission Console and Access Submission Studio handoff readiness, Support Bridge report_error payloads, SLO Incident Command evidence, Error Intelligence buckets/codes, preflight/replay/widgets/submission evidence, runs resilience-drill and evaluation-lab assertions, asserts reviewer proof remains above target, and confirms the Production Launch Bundle preserves Swiggy external gates.

The verifier also validates Commercial Action Guard for Food order placement, Instamart checkout, Dineout booking, combined-flow confirmation locks, non-blind retry drills, telemetry, and support packet fields.

The verifier also validates `/api/swiggy-private-pilot-control-room` for real-user cohort readiness, assigned benchmark journeys, consent artifact counts, telemetry fields, operator runbooks, support paths, Swiggy staging replay gates, and copy-ready `builders@swiggy.in` handoff evidence.
The verifier also validates `/api/swiggy-staging-replay` and `/api/swiggy-staging-replay/run` for safe replay probes, dry-run versus credentialed execution state, response hashes, redaction telemetry, missing-token fail-closed behavior, commercial-action blocking, and Swiggy handoff copy.
The verifier also validates `/api/swiggy-hosted-widget-activation` for parent-origin policy, iframe sandboxing, origin-verified postMessage handshakes, semantic fallback parity, no-signed-URL telemetry, commercial confirmation routing, visual proof, and hosted-widget external gates.

The verifier also validates `/api/swiggy-route-optimizer` for official source links, call-saving rollups, optimizer profiles, explicit parallel batches, commercial-action exclusion from parallel batches, cross-server handoff redaction, and source-linked route assertions.

The verifier also validates `/api/swiggy-cta-live-audit` for safe live Builders/docs CTA probes, manual form/email/legal gates, approved-origin checks, blocked-link drift, and reviewer runbook evidence.

The verifier also validates `/api/swiggy-showcase-submission-center` and `/api/swiggy-showcase-submission-center/compose` for feature-ready pitch blocks, demo storyboard steps, metric packs, visual proof, copy-ready outreach packet composition, operator-owned demo/repo/contact inputs, and Swiggy co-branding/feature approval gates.

The verifier also validates `/api/swiggy-demo-evidence-director` for the 2-3 minute recording storyboard, proof assets, recording gates, redaction checks, visual QA links, runbook commands, builders@swiggy.in handoff copy, and explicit operator/Swiggy gates.

The verifier also validates `/api/swiggy-submission-timeline-center` and `/api/swiggy-submission-timeline-center/checkpoint` for the eight-phase Start Building, proof-freeze, demo, access-form, handoff-email, DCR, staging, soak, and production-promotion timeline with proof links, executable stage checks, missing operator actions, and explicit operator/Swiggy gates.

The verifier also validates `/api/swiggy-conversion-center` for the final What Will You Cook CTA funnel, Start Building, See What's Possible, Request Access, Send Us a Demo, builders@swiggy.in, `llms.txt`, `llms-full.txt`, proof bundles, operator runbook, and go-live gates.

The verifier also validates `/api/swiggy-builders-module-intelligence` for every Website Atlas module, page grouping, owner, audience, product promise, route optimization, risk boundary, proof links, module journeys, and external operator or Swiggy gates.

The verifier also validates `/api/swiggy-partner-success-desk` and `POST /api/swiggy-partner-success-desk/compose` for access handoff, developer support, SLO incidents, capacity review, backpressure controls, growth showcase asks, escalation emails, local partner-success handoff packets, missing-input guards, and enterprise Slack/partner-manager gates.

The verifier also validates `/api/swiggy-partner-support-room` and `POST /api/swiggy-partner-support-room/compose` for report_error readiness, builders@swiggy.in support email drafts, S0-S3 incident lanes, redacted evidence attachments, local support packets, missing-input guards, capacity escalation, runtime/audit proof, and enterprise Slack/partner-manager gates.

The verifier also validates `/api/swiggy-benefits-activation-center` and `POST /api/swiggy-benefits-activation-center/activate` for live API access, quota expansion, technical support, Powered by Swiggy attribution, showcase visibility, hiring visibility, growth partnership, enterprise support, activation CTAs, proof links, per-benefit handoff packets, and explicit Swiggy/operator gates.

The verifier also validates `/api/swiggy-interaction-qa-center` and `POST /api/swiggy-interaction-qa-center/rehearse` for planner, confirmation, support-report, privacy, packet-export, first-call, access-submission, partner-support CTA contracts, dry-run route rehearsals, missing-input guards, automated proof, and explicit Swiggy/operator gates.

The verifier also validates `/api/swiggy-staging-seed-smoke-center` for Food, Instamart, and Dineout seeded fixtures, read/mutation/commercial/support smoke waves, no-blind-retry stop rules, telemetry evidence, and Swiggy staging credential gates.

The verifier also validates `/api/swiggy-load-lab` for synthetic launch-load scenarios, Retry-After readiness, cohort ramp math, background-job gating, commercial serialization assertions, and external Swiggy capacity actions. `/api/swiggy-quota-negotiation-center` composes that evidence into pilot/campaign quota asks, a capacity packet, and Swiggy-owned bespoke-limit gates.

The verifier also validates `/api/swiggy-offer-intelligence` and `/api/swiggy-offer-intelligence/decide` for Food coupon tool sequencing, Dineout deal validation, Instamart value substitutions, no-blind-discount guardrails, apply/surface/block decisions, no-cart-mutation telemetry, offer recovery drills, live-inventory external gates, and launch-bundle handoff coverage.

The verifier also validates `/api/swiggy-order-lifecycle` and `/api/swiggy-order-lifecycle/probe` for Food, Instamart, and Dineout status tools, tracking cadence, executable refresh/defer/support/retry decisions, non-blind retry recovery, timeline telemetry redaction, support-ready lifecycle packets, and launch-bundle handoff coverage.

The verifier also validates `/api/swiggy-location-trust` and `/api/swiggy-location-trust/select` for Food/Instamart saved-address tools, Instamart create/delete address flows, Dineout saved locations, address-choice pauses, executable ready/pause/block/mutation decisions, address switch refresh guards, raw-address redaction, and staging credential gates.

The MCP gateway test suite covers staging/production forwarding for `tools/call`, `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`; unsupported methods stay fail-closed with JSON-RPC errors, and missing live tokens still return 401.

The verifier also validates `/api/swiggy-cart-mutation-workbench` and `/api/swiggy-cart-mutation-workbench/mutate` for Food cart readback, Instamart full-cart replacement, Dineout create_cart gates, executable readback-after-write decisions, payment-method truth, add-on confirmation, no-commercial-action telemetry, commercial single-flight rules, and staging cart-write gates.

The verifier also validates `/api/swiggy-discovery-freshness` and `/api/swiggy-discovery-freshness/resolve` for Food restaurant/menu discovery, Instamart product and go-to item variants, Dineout restaurant details and slots, executable read-only discovery, pagination truth, coordinate consistency, no-cart-mutation telemetry, freshness invalidation, and staging discovery gates.

The verifier also validates `/api/swiggy-live-signal-calibration` for Food active-order memory, Instamart go-to and order-history cadence, Dineout saved-location and booking truth, discovery relevance drift, offer/cart truth, support failure memory, privacy controls, and staging credential gates.

The verifier also validates `/api/swiggy-confirmation-command-center` and `/api/swiggy-confirmation-command-center/execute` for final Food `place_food_order`, Instamart `checkout`, and Dineout `book_table` proof: fresh cart or slot reads, explicit per-action approvals, separate combined-plan confirmations, guarded preflight -> protected action -> status-probe execution, Swiggy-response payment and free-booking truth, no-blind-retry telemetry, paid-Dineout blocking, and live credential gates.

The verifier also validates `/api/swiggy-cancellation-care-center` for Food and Instamart no-tool cancellation handling, official customer-care copy, Dineout booking-status recovery, `report_error` payload context, incident email routing, planned error-code gates, and live support calibration gates.

The verifier also validates `/api/swiggy-dineout-precision-center` for the Dineout free-booking and bill-payment split: `book_table` only follows free slot evidence, `create_cart` bill payment uses `cartType: "DINEOUT"`, paid deals are blocked from the free booking path, `get_booking_status` guards retries, and live payment proof stays credential-gated.

The verifier also validates `/api/swiggy-visual-dish-capture` and `/api/swiggy-visual-dish-capture/analyze` for camera-to-commerce routing: dish photos, menu screenshots, pantry photos, and chat images resolve to confirmed labels before Food, Instamart, Dineout, or combined route plans; raw images are not retained; and vision, staging, and confirmation gates remain visible.

The verifier also validates `/api/swiggy-voice-commerce-center` and `/api/swiggy-voice-commerce-center/rehearse` for spoken-commerce routing: Food quick orders, Instamart restock, Dineout bookings, and combined evening plans become short TTS scripts, visual card fallbacks, confirmation prompts, no-raw-id readbacks, and no-raw-audio telemetry.

The verifier also validates `/api/swiggy-quality-loop-center` and `/api/swiggy-quality-loop-center/feedback` for post-experience learning: Food, Instamart, Dineout, and combined feedback resolve to consented tags, support packet decisions, no-raw-payload telemetry, and next-route optimization.

The verifier also validates `/api/swiggy-ritual-autopilot-center` and `/api/swiggy-ritual-autopilot-center/plan` for recurring routine planning: weekday lunches, pantry resets, Dineout slotwatch, and combined weekend routes resolve to consented draft routines with reminder-only cadence, fresh-read gates, and no automatic checkout, order, booking, or subscription behavior.

The verifier also validates `/api/swiggy-payment-truth-center` and `POST /api/swiggy-payment-truth-center/reconcile` for payment truth: Food cart totals, coupons, COD support, Instamart checkout bills, Dineout free bookings, paid-cart gates, interactive Launch Center reconciliation, and support-review paths resolve to Swiggy readback-only copy with no payment-instrument retention.

The verifier also validates `/api/swiggy-meal-window-intelligence` and `/api/swiggy-meal-window-intelligence/forecast` for timing safety: Food ETA, Instamart availability, Dineout slots, and tracking cadence resolve to advisory order/cook/reserve/track/wait routes with no scheduled Food orders and fresh-read gates before commercial action.

The verifier also validates `/api/swiggy-customization-studio` and `/api/swiggy-customization-studio/validate` for customization safety: Food add-ons, variants, allergy cautions, Instamart pack sizes, full-cart replacement, voice-safe choice limits, and post-mutation cart readbacks resolve to exact-choice review gates before cart mutation.

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
- `GET /api/swiggy-widget-experience-composer`
- `GET /api/swiggy-hosted-widget-activation`
- `GET /api/swiggy-agent-experience-benchmark`
- `GET /api/swiggy-private-pilot-control-room`
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
- `GET /api/swiggy-builders-site-parity`
- `GET /api/swiggy-builders-page-mesh`
- `GET /api/swiggy-builders-module-intelligence`
- `GET /api/swiggy-cta-live-audit`
- `GET /api/swiggy-builders-launch-story`
- `GET /api/swiggy-operating-contract-center`
- `GET /api/swiggy-builder-intake`
- `GET /api/swiggy-faq-policy`
- `GET /api/swiggy-faq-resolution-center`
- `POST /api/swiggy-faq-resolution-center/answer`
- `GET /api/swiggy-growth-partnership`
- `POST /api/swiggy-growth-partnership/compose`
- `GET /api/swiggy-talent-signal-center`
- `POST /api/swiggy-talent-signal-center/compose`
- `GET /api/swiggy-conversion-center`
- `GET /api/swiggy-partner-success-desk`
- `POST /api/swiggy-partner-success-desk/compose`
- `GET /api/swiggy-interaction-qa-center`
- `POST /api/swiggy-interaction-qa-center/rehearse`
- `GET /api/channel-multimodal-studio`
- `POST /api/channel-multimodal-studio/compose`
- `GET /api/swiggy-visual-dish-capture`
- `GET /api/swiggy-voice-commerce-center`
- `GET /api/swiggy-quality-loop-center`
- `GET /api/swiggy-ritual-autopilot-center`
- `GET /api/swiggy-payment-truth-center`
- `POST /api/swiggy-payment-truth-center/reconcile`
- `GET /api/swiggy-meal-window-intelligence`
- `POST /api/swiggy-meal-window-intelligence/forecast`
- `GET /api/swiggy-customization-studio`
- `POST /api/swiggy-customization-studio/validate`
- `GET /api/nutrition-budget-intelligence`
- `POST /api/nutrition-budget-intelligence/advise`
- `GET /api/household-preference-graph`
- `POST /api/household-preference-graph/simulate`
- `GET /api/guest-collaboration-calendar`
- `POST /api/guest-collaboration-calendar/compose`
- `GET /api/luxury-experience-workspace`
- `POST /api/luxury-experience-workspace/compose`
- `GET /api/reviewer-artifact-vault`
- `GET /api/swiggy-builders-review-decision`
- `GET /api/visual-qa-center`
- `GET /api/swiggy-showcase-submission-center`
- `POST /api/swiggy-showcase-submission-center/compose`
- `GET /api/swiggy-demo-evidence-director`
- `GET /api/swiggy-submission-timeline-center`
- `POST /api/swiggy-submission-timeline-center/checkpoint`
- `GET /api/swiggy-partner-support-room`
- `POST /api/swiggy-partner-support-room/compose`
- `GET /api/builder-packet-export`
- `GET /api/builder-packet-export.md`
- `GET /api/swiggy-docs-coverage`
- `GET /api/swiggy-docs-twin-explorer`
- `GET /api/swiggy-llms-manifest-verifier`
- `GET /api/swiggy-tool-parity-auditor`
- `GET /api/swiggy-upstream-watch`
- `GET /api/swiggy-source-intelligence`
- `GET /api/swiggy-deep-site-map`
- `GET /api/swiggy-developer-quickstart`
- `POST /api/swiggy-developer-quickstart/run-first-call`
- `GET /api/swiggy-cta-execution-center`
- `GET /api/swiggy-innovation-radar`
- `GET /api/ai-client-connect-kit`
- `POST /api/ai-client-connect-kit/validate-config`
- `GET /api/coding-agent-governance`
- `GET /api/brand-compliance-kit`
- `GET /api/swiggy-journey-compiler`
- `GET /api/swiggy-access-dossier`
- `GET /api/swiggy-access-evidence-matrix`
- `GET /api/premium-use-case-studio`
- `GET /api/premium-concierge-itinerary`
- `GET /api/staging-certification-matrix`
- `GET /api/swiggy-staging-replay`
- `POST /api/swiggy-staging-replay/run`
- `GET /api/sessions/:sessionId/staging-transcript`
- `GET /api/mcp/tool-lab`
- `GET /api/mcp/tool-contract-matrix`
- `GET /api/mcp/scenario-runner`
- `GET /api/mcp/state-orchestrator`
- `POST /api/mcp/state-orchestrator/rehearse-surface`
- `GET /api/mcp/capability-registry`
- `GET /api/mcp/resource-prompt-studio`
- `POST /api/mcp/resource-prompt-studio/execute`
- `GET /api/mcp-gateway`
- `GET /api/mcp/handshake-doctor`
- `GET /api/swiggy-handshake-doctor`
- `GET /api/auth/swiggy/status`
- `GET /api/swiggy-auth-lifecycle-center`
- `GET /api/credential-onboarding`
- `GET /api/swiggy-credential-vault-center`
- `GET /api/sandbox-credential-workbench`
- `GET /api/swiggy-staging-credential-drill`
- `GET /api/swiggy-staging-seed-smoke-center`
- `GET /api/enterprise-delegated-auth`
- `GET /api/enterprise-platform-center`
- `GET /api/observability/traces`
- `GET /api/telemetry/runtime`
- `GET /api/audit-ledger`
- `GET /api/swiggy-route-optimizer`
- `GET /api/support/bridge`
- `POST /api/support/bridge/report`
- `GET /api/slo-incident-command`
- `GET /api/data-governance-center`
- `GET /api/error-intelligence`
- `POST /api/error-intelligence/classify`
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
- `GET /api/swiggy-quota-negotiation-center`
- `GET /api/swiggy-offer-intelligence`
- `GET /api/swiggy-order-lifecycle`
- `POST /api/swiggy-order-lifecycle/probe`
- `GET /api/swiggy-location-trust`
- `POST /api/swiggy-location-trust/select`
- `GET /api/swiggy-cart-mutation-workbench`
- `POST /api/swiggy-cart-mutation-workbench/mutate`
- `GET /api/swiggy-discovery-freshness`
- `POST /api/swiggy-discovery-freshness/resolve`
- `GET /api/swiggy-confirmation-command-center`
- `POST /api/swiggy-confirmation-command-center/execute`
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
- Sandbox credential verification: `npm run verify:production` checks local OAuth readiness, DCR, credential handoff sequencing, seeded-data lanes, staging cutover commands, and 48-hour soak gates before the packet is sent.

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

`/api/mcp/handshake-doctor` and `/api/swiggy-handshake-doctor` run safe live GET/OPTIONS probes against Swiggy OAuth metadata and the Food `/food`, Instamart `/im`, and Dineout `/dineout` MCP endpoints. They never send bearer tokens, never invoke `tools/call`, never accept arbitrary probe URLs, and classify protected-resource metadata or endpoint auth responses as watch signals rather than local build failures.

`/api/auth/swiggy/status` shows the reviewer-safe OAuth lifecycle: Swiggy authorize/token/logout endpoints, redirect URI, scope, pending PKCE verifier count, latest callback event, token source, expiry, callback checklist, and secure token storage rules. The frontend OAuth Status panel calls this endpoint after auth start and callback completion.

`/api/swiggy-auth-lifecycle-center` is the reviewer-safe auth recovery control room. It turns Swiggy's 120-second authorization codes, 5-day access tokens, 30-day idle sessions, no v1 refresh-token issuance, 401/419/403 recovery, exact redirect allowlisting, delegated per-user tokens, logout, and no-token logging into a dashboard card plus production verifier assertions.

`/api/credential-onboarding` shows the OAuth metadata URLs, Dynamic Client Registration dry-run payload for `/auth/register`, redirect URI audit, required MCP scopes, access-form fields, and the external Swiggy gates. Local tests keep this as evidence only and do not create live Swiggy client registrations.

`/api/swiggy-credential-vault-center` shows runtime credential metadata, configured/unconfigured secret posture, redaction rules, OAuth/client rotation runbooks, cutover checks, and a support-safe packet for `builders@swiggy.in`. It intentionally never returns full bearer tokens, authorization codes, refresh tokens, or PKCE verifiers.

`/api/sandbox-credential-workbench` shows the reviewer-facing localhost-to-staging credential plan: local demo proof, DCR, PKCE, exact redirect allowlisting, staging credentials, seeded Food/Instamart/Dineout data, 48-hour soak, commands, and production-promotion gates.

`/api/swiggy-credential-handoff-center` shows the owner-assigned credential handoff path: localhost proof, DCR, OAuth PKCE, exact redirect URI, vault storage, Swiggy staging credentials, seeded smoke, 35-tool certification, 48-hour soak, and production promotion.

`/api/swiggy-llms-manifest-verifier` fetches only the official Swiggy `llms.txt` URL, parses markdown links, derives rendered twins, compares live page count against Docs Coverage, verifies Swiggy-only origins, and checks Food 14, Instamart 13, and Dineout 8 reference-tool counts. Tests inject fixture text so CI does not depend on live network for parser correctness.

`/api/swiggy-tool-parity-auditor` reuses that official manifest feed to compare each live reference tool against the local Tool Contract Matrix. It reports matched/missing/orphan contracts, server-by-server 14/13/8 parity, commercial/support route classes, confirmation gates, retry posture, fixtures, and drift signals. Fixture tests inject manifest text; production smoke uses the live Swiggy source.

`/api/enterprise-delegated-auth` shows the enterprise platform-operator flow: per-user PKCE, authorization-code exchange, per-user bearer token handling, 5-day token lifetime, 30-day Swiggy user session, redirect scheme strategy, logout, 401/419/403 recovery, capacity backoff, and the contract/staging/production gates Swiggy must approve.

`/api/enterprise-platform-center` is the broader platform-operator proof surface. It maps tenant registry boundaries, per-user delegated tokens, tenant-scoped quota profiles, support routing, audit exports, peak-QPS review, contract gates, co-branding approval, staging soak, and enterprise Slack/dashboard gates without pretending those external Swiggy approvals are already granted.

`/api/mcp/resource-prompt-studio` shows the concrete MCP resources and prompts surfaced by the local mock: two resource URIs and two prompts for each Swiggy server, sample `resources/read` and `prompts/get` payloads, JSON-RPC smoke requests, and live staging gates for Swiggy-issued credentials.

`/api/channel-multimodal-studio` shows the developer-page build lanes as concrete channel contracts: voice ordering, auto-restock, group ordering, dietary planning, reservation planning, and screenshot-to-order, with Swiggy toolchains, local execution packets, response rules, confirmation gates, telemetry contracts, and Slack/Teams, mobile camera, vision/OCR, and enterprise gates. `POST /api/channel-multimodal-studio/compose` generates a local lane-and-channel execution packet with MCP toolchain, route plan, response rules, confirmation gate, telemetry contract, proof links, missing-input guards, checklist, and Swiggy/platform gates without executing live Swiggy commerce.

`/api/swiggy-visual-dish-capture` is the productized screenshot-to-order proof surface. It maps dish photos, menu screenshots, pantry photos, and chat images into safe Food menu search, Instamart ingredient rescue, Dineout discovery, or combined evening routes; `/api/swiggy-visual-dish-capture/analyze` returns deterministic label, confidence, route, confirmation, telemetry, and no-raw-image-retention evidence for reviewer smoke tests.

`/api/swiggy-voice-commerce-center` is the productized voice-commerce proof surface. It maps spoken quick orders, pantry restock, table booking, and combined evening intents into short TTS scripts, visual fallbacks, Swiggy toolchains, confirmation prompts, no-raw-id policies, and no-raw-audio telemetry; `/api/swiggy-voice-commerce-center/rehearse` provides deterministic local smoke proof.

`/api/swiggy-quality-loop-center` is the productized post-experience learning proof surface. It maps Food, Instamart, Dineout, and combined feedback into consented derived tags, support-safe redaction, repeat optimization, external history gates, and `/api/swiggy-quality-loop-center/feedback` smoke analysis.

`/api/swiggy-ritual-autopilot-center` is the productized recurring-routine proof surface. It maps weekday lunch repeat, pantry reset, date-night slotwatch, and family weekend routes into consented draft plans; `/api/swiggy-ritual-autopilot-center/plan` returns deterministic routine slots, no-auto-commercial-action telemetry, and confirmation boundaries.

`/api/swiggy-payment-truth-center` is the productized payment truth proof surface. It maps Food cart payment truth, Instamart bill checkout truth, Dineout free booking truth, Dineout paid-cart gates, and combined settlement readbacks into source-of-truth guardrails; `POST /api/swiggy-payment-truth-center/reconcile` returns deterministic settlement status, risk flags, support-review copy, selected truth lane, and no-payment-instrument telemetry.

`/api/swiggy-meal-window-intelligence` is the productized timing proof surface. It maps Food lunch ETA, Instamart dinner backup, Dineout slot windows, post-confirmation tracking, and weekend combined planning into safe timing lanes; `/api/swiggy-meal-window-intelligence/forecast` returns ETA risk buckets, timing steps, no-scheduled-order telemetry, and the Launch Center forecaster's selected Food, Instamart, Dineout, or combined route proof.

`/api/swiggy-customization-studio` is the productized customization proof surface. It maps Food `search_menu` add-ons and variants, Instamart product pack sizes, allergy-sensitive substitution cautions, voice-safe choice limits, and cart readback gates into exact-choice review lanes; `/api/swiggy-customization-studio/validate` returns deterministic mutation-risk buckets, required readback tools, selected Swiggy route proof, and checklist steps without mutating a cart. The Launch Center validator exercises Food, Instamart, and combined/Dineout-aware customization paths from the UI.

`/api/nutrition-budget-intelligence` shows premium nutrition and budget planning routes: protein-per-rupee Food search, COD-safe coupons, Instamart go-to and product search, group-budget allocation, Dineout evening balance, and camera-label macro planning with no medical claims. `/api/nutrition-budget-intelligence/advise` powers the Launch Center advisor with city, budget, protein target, party size, route preference, coupon sensitivity, and Dineout intent, returning the selected Swiggy route, budget-fit verdict, protein estimate, fresh-read checklist, and no-medical-claim telemetry without mutating carts.

`/api/household-preference-graph` shows consent-aware personalization routes: Food active-order taste signals, Instamart go-to items and order history, Dineout saved-location memory, household member weights, pantry forecasts, failure memory, retention rules, and DPDP controls. `/api/household-preference-graph/simulate` powers the Launch Center simulator with city, household mode, preferred server, history consent, recent failure, and occasion mode inputs, returning local-only, personalized, or support-safe fallback decisions without retaining raw Swiggy history.

`/api/guest-collaboration-calendar` shows guest collaboration routes: vote rounds, date night, guests at home, office lunch, weekday reset, recovery meal, calendar reminders, share links, voice briefs, and Slack/Teams handoff gates. `/api/guest-collaboration-calendar/compose` powers the Launch Center composer with template, channel, guest count, city, and Dineout inputs, returning route steps, calendar/share/voice/workspace artifact, readiness decision, missing channel gates, no-scheduled-Food telemetry, and separate Swiggy confirmation boundaries.

`/api/luxury-experience-workspace` shows premium review workspaces: lean, premium, family, social, and training modes; Dineout reservation review; Food cart review; Instamart basket review; combined evening planning; recovery desk; widget fallbacks; voice contracts; and telemetry gates. `/api/luxury-experience-workspace/compose` powers the Launch Center composer with mode, workspace, city, guest count, budget, and Dineout confirmation inputs, returning route steps, review artifacts, readiness decision, manual confirmation gaps, redacted telemetry, no-commerce assertions, and separate Food, Instamart, and Dineout approval boundaries.

`/api/reviewer-artifact-vault` shows the Swiggy access-submission manifest: proof links, Deep Site Map, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, handoff checklist, and reviewer email copy.

`/api/visual-qa-center` shows reviewer screenshot targets, desktop/tablet/mobile viewport sizes, selector manifests, Playwright screenshot artifact paths, no-overlap rules, text-fit rules, widget fallback checks, redaction visibility, commercial confirmation visibility, mobile layout checks, Source Intelligence, Deep Site Map, Innovation Radar, Access Evidence Matrix card proof, and automation gates. Run `npm run verify:visual` against the production server to generate PNGs plus `artifacts/visual-qa/report.json`.

`/api/swiggy-builders-site-parity` fetches only the official Swiggy Builders homepage, extracts anchors, metadata, `llms` alternates, module signals, CTA/source/footer/legal links, and safe-origin signals, then matches them back to Website Atlas and CTA evidence. Fixture tests avoid live network dependency; production smoke uses the live page.

`/api/swiggy-builders-page-mesh` fetches every non-external Website Atlas Builders page from the live public site, extracts anchors and titles, reconciles module/CTA coverage, rejects user-supplied URLs, and fails production smoke when public pages become unreachable or links leave approved Builders, legal, `forms.gle`, official MCP reference, or builders email contact origins.

`/api/swiggy-builders-module-intelligence` converts Website Atlas modules into product-readiness rows with owner, audience, official signal, product promise, Swiggy surface, MealPilot proof, route optimization, risk boundary, CTA mapping, journey placement, and explicit external gates.

`/api/swiggy-builders-launch-story` turns the April 2026 Builders Club launch blog into a reviewer-ready story center. It reconciles the launch-era 18+ API-tool narrative with the current 35-tool docs snapshot and packages story beats, the demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing guardrails.

`/api/swiggy-operating-contract-center` consolidates official operate and ship-to-production guidance into one reviewer contract: SLA and latency targets, current/future rate-limit behavior, traffic rollout, support escalation, version/deprecation watch, runbooks, readiness gates, and Swiggy external approvals.

`/api/swiggy-cta-execution-center` shows the click-readiness workbench for every official Swiggy Builders CTA, global header link, docs subnav item, footer resource, mailto, Google Form, and legal link. Each target includes a browser action, keyboard path, proof links, completion gate, assertion coverage, and an operator-vs-Swiggy external gate.

`/api/swiggy-cta-live-audit` verifies the click-readiness workbench against live public targets: Builders/docs URLs are safely probed, form/email/legal links remain manual browser gates, and unsafe or blocked targets become production-smoke failures.

`/api/swiggy-showcase-submission-center` prepares the public Swiggy showcase packet: pitch copy, demo flow, metric proof, visual-gallery links, and a builders@swiggy.in email draft are generated from local evidence while video recording, final email submission, co-branding, and feature placement remain explicit operator or Swiggy gates. `/api/swiggy-showcase-submission-center/compose` powers the Launch Center Showcase Composer by accepting operator demo, repository, and contact inputs, returning a copy-ready outreach body, readiness score, checklist, proof links, and missing-input gates without sending email.

`/api/swiggy-demo-evidence-director` prepares the final demo recording packet: six timed scenes, proof assets, visual QA expectations, redaction review gates, runbook commands, and handoff email copy are generated locally while recording, URL hosting, final send, access approval, credentials, and co-branding stay operator or Swiggy owned.

`/api/swiggy-submission-timeline-center` prepares the operator launch timeline: eight phases cover Start Building review, packet freeze, demo capture, Request Access form submission, Send Demo handoff, DCR, staging credentials/seed, and production promotion, each with owner, status, entrypoint, checklist, proof links, and no-automatic-external-submission safety. `/api/swiggy-submission-timeline-center/checkpoint` turns stage booleans into a current-phase decision, readiness score, next action, missing operator actions, Swiggy gates, proof links, and Launch Center checkpoint UI.

`/api/swiggy-conversion-center` is the final Swiggy Builders conversion center: it composes CTA Execution, Builder Intake, Submission Timeline, Access Submission Studio, Docs Twin Explorer, and proof bundles into owner-tagged steps for What Will You Cook, Start Building, See What's Possible, Request Access, Send Us a Demo, builders@swiggy.in, `llms.txt`, `llms-full.txt`, and go-live review.

`/api/swiggy-partner-success-desk` composes the post-access operator room: access handoff, support bridge, SLO incidents, capacity review, backpressure, growth showcase asks, and enterprise Slack/partner-manager gates are pulled into one reviewer surface with proof links and escalation email drafts.

`/api/swiggy-partner-support-room` prepares the support operating room after access: contact channels, report_error readiness, S0-S3 incident lanes, redacted evidence attachments, escalation runbook steps, builders@swiggy.in drafts, capacity escalation, and enterprise support gates are packaged without sending email or requesting Slack locally. `POST /api/swiggy-partner-support-room/compose` generates a local channel-and-incident support packet with readiness decision, missing operator inputs, redacted attachments, proof links, builders@swiggy.in draft, safety assertions, and Swiggy-owned report_error, Slack, partner-manager, and enterprise approval gates.

`/api/swiggy-benefits-activation-center` turns Swiggy Builders benefits into an activation room: live APIs, quota expansion, technical support, co-branding, showcase visibility, hiring visibility, growth partnership, and enterprise support each have an owner, proof route, CTA, next action, and external gate. `POST /api/swiggy-benefits-activation-center/activate` generates one local activation packet for the selected benefit, including its readiness decision, matching CTA, proof links, checklist, builders@swiggy.in draft, safety assertions, and unknown-benefit guard.

`/api/swiggy-interaction-qa-center` composes the clickable portal contract: every locally executable CTA maps to a route, feedback expectation, automated proof, and Swiggy relevance, while access form submission, Slack, partner manager, production credentials, and co-marketing remain manual or external gates. `POST /api/swiggy-interaction-qa-center/rehearse` generates a local CTA dry-run packet with route contract, browser action, expected feedback, proof links, automation coverage, checklist, missing-input guards, and Swiggy-owned form, Slack, credential, and commercial-action gates.

`/api/coding-agent-governance` reads the root `AGENTS.md` and scores the rules future coding agents must follow before editing Swiggy integrations: fetch official docs first, prefer page `.md` twins, never invent tools or parameters, preserve commercial confirmation gates, and keep sensitive data out of logs.

`/api/access-submission-studio` is the final operator room before Swiggy submission. It joins official Start Building, Request access, and Send Us a Demo targets with copy-ready form values, required attachments, browser runbook steps, generated builders@swiggy.in mailto draft, blockers, and external gates. `PATCH /api/access-submission-studio/state` saves the local handoff fields for demo URL, contact, production redirect, static egress, environment, terms, form submission, handoff email, and notes; it never submits the official Swiggy form or sends email during local tests.

`/api/swiggy-access-evidence-matrix` is the access-review evidence ledger. It reconciles Access Dossier, Submission Console, Access Submission Studio, and Reviewer Artifact Vault rows into one owner-tagged matrix for official fields, proof attachments, runbook steps, commands, manual operator inputs, and Swiggy approval gates.

`/api/swiggy-builders-review-decision` is the approval-readiness board. It composes Access Submission Studio, Access Evidence Matrix, Access Dossier, Journey Gates, Launch Bundle, Reviewer Artifact Vault, Submission Timeline, and Live Source Resilience into an explicit recommendation, eight decision gates, reviewer Q&A, proof links, and operator-vs-Swiggy blockers.

`/api/builder-packet-export` and `/api/builder-packet-export.md` turn the Submission Console, Access Submission Studio, Access Evidence Matrix, Production Launch Bundle, Reviewer Artifact Vault, Demo Evidence Director, Deep Site Map, and Visual QA Center into a reproducible Swiggy access packet. Run `npm run export:builder-packet` against the production server to write `artifacts/builder-packet/mealpilot-swiggy-access-packet.json`, `mealpilot-swiggy-access-packet.md`, and `verification-summary.json`.

`/api/swiggy-confirmation-command-center` is the final-commerce proof surface for Swiggy Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`. `/api/swiggy-confirmation-command-center/execute` makes that proof executable in mock and credentialed modes: it requires fresh context, separate confirmation, Swiggy payment/free-booking truth, blocks paid Dineout free-booking misuse, runs preflight -> action -> status probe, records no-blind-retry telemetry, and keeps live credentials as an external gate.

`/api/swiggy-cancellation-care-center` is the cancellation and care proof surface. It blocks fake Food and Instamart cancellation calls, shows the official Swiggy customer-care phone copy, routes Dineout booking issues through `get_booking_status`, prepares `report_error` payloads with redacted toolContext, and keeps incident email evidence ready for `builders@swiggy.in`.

`/api/swiggy-dineout-precision-center` is the Dineout precision proof surface. It separates free table bookings from bill-payment carts, validates `isFree=true` and `bookingPrice=0` before `book_table`, uses `cartType: "DINEOUT"` for bill-payment `create_cart`, blocks paid deals from the free booking path, and keeps live payment validation behind Swiggy credentials.

`/api/mcp/state-orchestrator/rehearse-surface` proves the same MealPilot session can render Swiggy output safely across chat, voice, and widget surfaces: chat gets richer cards, voice is capped to three spoken options, widget output stays semantic fallback, raw recommendation IDs stay hashed, and commercial actions remain locked.

## Safety Tests

The test suite checks that:

- MealPilot composes Food, Instamart, and Dineout recommendations.
- `/api/plan`, `/api/confirm`, and `/api/mcp/:server` work end to end.
- MCP Gateway reports mock/staging/production cutover status and staging calls fail closed without a bearer token.
- Staging Cutover Rehearsal records first real MCP probes, OAuth and token gates, fail-closed behavior, support packet fields, retry branches, and 48-hour promotion checks.
- Swiggy Staging Replay Center turns the staging certification matrix into executable safe probes: mock mode is labelled dry-run, staging and production require OAuth bearer state, commercial tools are blocked, and responses are represented by hashes plus redaction telemetry.
- Website Atlas covers global header, docs subnav, footer groups, production access page, launch blog, rendered-page crawl evidence, page modules, CTAs, resource links, and legal links.
- Swiggy Builders Page Mesh Auditor fetches every non-external Website Atlas page live and reconciles page reachability, anchor counts, module signals, CTA matches, and safe-origin drift.
- Swiggy Builders Module Intelligence Center maps each Website Atlas module into owner, product promise, proof links, route optimization, risk boundary, module journeys, and external gates.
- Swiggy Builders Journey Gate Center maps the official Start Building, Apply for Prod Access, Quick Review, Go Live, and Show Us What You Built path into owner gates, criteria, proof links, telemetry, blockers, and external Swiggy approvals.
- Swiggy Builders Homepage Experience Center maps header, hero, how-it-works, benefits, guidelines, FAQ, final CTA, and footer into section proof, mobile checks, reviewer checks, continuity, and external gates.
- Swiggy Builders Source Evolution Center reconciles homepage 18+ launch copy with current 35/35 callable-tool coverage, llms/docs refresh loops, v1.0/v1.1/v1.2/v2 roadmap drift, signed-manifest/rate-limit gates, visual proof, and reviewer packet regression.
- Swiggy Builders Live Source Resilience Center reports live homepage fetch mode, Website Atlas fallback, every-page mesh coverage, llms markdown recovery, header/footer/CTA parity, and mandatory browser re-browse gates before reviewer submission.
- Swiggy Builders Review Decision Center converts official fit, demo, security, API coverage, source-review, credential, ops, and go-live review signals into approval-readiness gates, recommendation, reviewer questions, proof links, operator blockers, and Swiggy-owned gates.
- CTA Live Audit probes official Builders/docs click targets, keeps form/email/legal CTAs manual, and fails smoke on unsafe or blocked CTA drift.
- Swiggy Builders Launch Story Center converts the launch blog into a reviewer-ready story, reconciles the launch-era 18+ signal with the current 35-tool docs snapshot, and packages demo journey, showcase assets, ecosystem lanes, CTA paths, and co-marketing guardrails.
- Swiggy Operating Contract Center joins SLA, rate limits, support, versioning, changelog, and ship-to-production sources into pillars, runbooks, readiness gates, and external approval gates.
- Builder Intake Command Center turns all 11 signup, apply, demo, contact, docs, and footer CTA paths into locally prepared action ownership, form values, demo storyboard steps, copy-ready drafts, and explicit external gates for final form/email submission and Swiggy approval.
- FAQ & Policy Center maps homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, and legal signals to MealPilot evidence links.
- Growth Partnership Center maps get-noticed, hiring, co-branding, direct support, co-marketing, analytics, strategic guidance, launch experiments, metrics, proof assets, and external partner asks. `POST /api/swiggy-growth-partnership/compose` generates a local launch-experiment handoff packet with selected partner ask, proof links, assets, metrics, checklist, builders@swiggy.in draft, and Swiggy-owned co-marketing gates.
- Swiggy Showcase Submission Center packages pitch blocks, demo storyboard, metric pack, visual-gallery links, outreach copy, operator inputs, and Swiggy approval gates for a feature-ready review packet.
- Swiggy Submission Timeline Center sequences access form submission, demo handoff, DCR, staging seed, 48-hour soak, and production promotion with explicit MealPilot, operator, and Swiggy ownership.
- Swiggy Builders Conversion Center maps the final CTA funnel, official docs links, email handoff, proof bundles, operator runbook, and go-live gates into one tested reviewer endpoint.
- Partner Success Desk composes access handoff, developer support, SLO incident readiness, traffic capacity, backpressure controls, growth showcase asks, escalation emails, and Swiggy-owned Slack/partner-manager gates. `POST /api/swiggy-partner-success-desk/compose` generates a local lane-specific handoff packet with operator email/window/context checks, escalation target, proof links, reviewer runbook, checklist, builders@swiggy.in draft, and Swiggy-owned Slack/partner-manager/dashboard gates.
- Interaction QA Center maps portal CTAs to executable MealPilot routes, visible feedback, regression commands, automation coverage, and explicit Swiggy/operator gates. `POST /api/swiggy-interaction-qa-center/rehearse` turns one CTA lane into a reviewer-visible dry-run packet without bypassing Swiggy-owned gates.
- Channel & Multimodal Studio maps voice, web chat, Slack/Teams, mobile camera, enterprise, and screenshot-to-order channels to Swiggy MCP toolchains, local execution packets, response contracts, telemetry, and external platform gates. `POST /api/channel-multimodal-studio/compose` turns one developer lane and one channel into a reviewer-visible execution packet with route rules and confirmation gates.
- Swiggy Voice Commerce Rehearsal Center validates spoken Swiggy route planning with no raw-audio retention, no raw ids in TTS, short scripts, visual fallbacks, and confirmation readbacks before live execution.
- Swiggy Quality Loop Center validates consented post-experience learning, support-safe feedback analysis, repeat optimization, and no raw Swiggy payload storage.
- Swiggy Ritual Autopilot Center validates recurring routine planning with consented history, reminder-only calendar cadence, fresh reads, explicit confirmations, and no automatic subscription or commercial action.
- Swiggy Payment Truth Center validates cart totals, coupon savings, COD eligibility, Instamart bills, Dineout free-booking status, paid-cart gates, support-review routes, and no raw payment-instrument retention through the Launch Center reconciler.
- Swiggy Meal Window Intelligence validates order/cook/reserve/track/wait timing gates, no scheduled Food orders, fresh reads before action, and redacted ETA/slot telemetry.
- Swiggy Customization Studio validates Food add-ons, variants, Instamart pack sizes, allergy cautions, raw-id suppression, and post-mutation cart readbacks.
- Nutrition & Budget Intelligence maps Food, Instamart, Dineout, coupon, cart, group, and camera-label routes to protein-per-rupee estimates, budget controls, safety notes, external data gates, and an executable advisor endpoint that selects safe Swiggy routes before any commercial action.
- Household Preference Graph maps active orders, go-to items, order history, saved-location signals, household weights, forecasts, cancellation rules, retention boundaries, and executable consent/fallback simulations to personalization evidence.
- Guest Collaboration & Calendar Center maps group votes, occasion templates, Dineout slot checks, Food reminder handoffs, Instamart prep, calendar artifacts, Slack/Teams gates, and executable local handoff composition to separate Swiggy confirmation controls.
- Luxury Experience Workspace maps reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces to authoritative Swiggy reads, all-tool coverage, widget fallbacks, voice contracts, telemetry, and separate confirmation gates.
- Reviewer Artifact Vault maps proof links, screenshots, logs, traces, OpenAPI, commands, video checklist, handoff checklist, and redaction rules into one safe Swiggy access-review manifest.
- Staging Seed & Smoke Center maps seeded Food, Instamart, and Dineout fixture needs to credential intake, read, mutation, commercial, support, telemetry, and promotion smoke waves.
- Visual QA Center maps demo-critical selectors, viewport dimensions, screenshot artifact paths, text-fit and no-overlap rules, widget fallback checks, mobile layout checks, redaction visibility, and screenshot automation gates.
- Swiggy Staging Credential Drill Center composes credential onboarding, sandbox workbench, staging cutover, staging certification, seeded-data needs, first-call JSON-RPC drills, operator commands, and builders@swiggy.in handoff copy into one first-live-credential runbook.
- Swiggy Credential Vault Center composes credential onboarding, MCP gateway status, sandbox workbench evidence, configured-secret posture, redaction policy, and rotation/cutover runbooks into one safe credential review surface.
- Tool Lab probes all 35 official tools, preserves JSON-RPC `tools/call` shape, and classifies commercial actions behind confirmation gates.
- Tool Contract Matrix maps all 35 tool parameters, source/privacy labels, response envelopes, current and planned error buckets, retry posture, fixture previews, and official references.
- State Orchestrator maps multi-turn cart truth, Food restaurant switches, Instamart address switches, Dineout slot refreshes, stale-cart recovery, and voice/chat/widget response differences to explicit executable guards.
- Swiggy Docs Coverage maps all 69 `llms.txt` pages across Start, Build, Operate, Reference, and Blog to app evidence and external gates.
- Swiggy Docs Twin Explorer pairs all 69 official markdown twins with rendered URLs, retrieval lanes, proof links, section groups, and drift gates.
- Swiggy Upstream Watch maps Swiggy's changelog, `llms.txt`, `llms-full.txt`, v1.0 limitations, v1.1/v1.2/v2 roadmap, signed manifests, and action queues to MealPilot proof surfaces.
- Swiggy Source Intelligence reconciles Builders website pages, CTAs, `llms` docs, markdown twins, reference tool counts, drift signals, and build-queue items into one Launch Center surface.
- Swiggy Deep Site Map consolidates every Builders page, rendered module signal, CTA, header link, docs subnav item, footer resource, proof link, source-reconciliation section, assertion, and external gate into one Launch Center audit surface.
- Developer Quickstart Workbench maps Swiggy's official quickstart, build-agent, OAuth, and `llms.txt` sources to readiness steps, SDK adapters, first-call JSON-RPC drills, recipe handoffs, auth gates, and verifier commands; `/api/swiggy-developer-quickstart/run-first-call` executes read-only drills with redacted response summaries and live credential gates.
- CTA Execution Center converts official Builders CTAs, header links, docs nav links, footer resources, mailto links, Google Forms, and legal links into click-ready browser actions, keyboard paths, proof bundles, and manual completion gates.
- Swiggy FAQ Resolution Center converts Builders FAQ and policy coverage into reviewer-ready answers, owners, proof links, activation CTAs, a support contact, and explicit operator or Swiggy gates. Its Launch Center answer console accepts one reviewer question, returns the matched FAQ answer with confidence and policy context, and blocks blank questions instead of guessing.
- Swiggy Innovation Radar maps Swiggy developer ideas, enterprise signals, access ground rules, support model, and MCP references into premium product lanes, route optimizations, build phases, differentiators, and partner gates.
- Swiggy Builder Talent Signal Center converts standout-project, demo, GitHub, hiring-visibility, and portfolio signals into proof assets, talent paths, outreach copy, reviewer narrative, and Swiggy-owned recruiting or feature-placement gates. `POST /api/swiggy-talent-signal-center/compose` generates a local path-specific outreach packet with demo/repo/summary input checks, portfolio assets, reviewer narrative, proof links, builders@swiggy.in draft, and no-endorsement assertions.
- Traffic Readiness maps expected sessions, daily tool calls, peak QPS, Retry-After behavior, seven-day major-event notice, capacity upgrade email, and the 1% -> 10% -> 50% -> 100% rollout.
- Swiggy Quota Negotiation Center composes Rate Limit Plan, Traffic Readiness, Backpressure Governor, Load Lab, and Route Optimizer into five capacity asks, four launch scenarios, four runbook steps, Retry-After header readiness, and a `builders@swiggy.in` capacity packet.
- AI Client Connect Kit generates and validates client configs, coding-agent rule files, SDK auth-mode guidance, endpoint correctness, secret redaction, troubleshooting, privacy notes, and delegated-auth gates.
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
- Resource & Prompt Studio exercises all local `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` paths across Food, Instamart, and Dineout; `/api/mcp/resource-prompt-studio/execute` runs each method with hashed response summaries, no raw payload retention, and live credential gates.
- Swiggy Visual Dish Capture Center validates the camera-to-commerce lane with no raw-image retention, user-confirmed labels, Food/Instamart/Dineout route plans, and vision or staging gates before live execution.
- Swiggy Voice Commerce Rehearsal Center validates short spoken scripts, visual card fallbacks, no raw-audio retention, and confirmation prompts across Food, Instamart, Dineout, and combined journeys.
- Local MCP JSON-RPC supports `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` for review-time evidence before live Swiggy credentials.
- Submission Console consolidates developer/enterprise access targets, official access requirements, prepared form fields, required attachments, packet order, demo-video gate, runbook steps, blockers, and builders@swiggy.in drafts.
- Access Submission Studio validates official CTA targets, copy blocks, required proof attachments, browser runbook, generated mailto handoff, and non-auto-submission gates.
- Swiggy Access Evidence Matrix validates required field coverage, attachment readiness, proof-command coverage, owner assignment, and unresolved Swiggy/operator gates.
- Builder Packet Export writes the copy-ready and machine-readable Swiggy access packet under ignored local artifacts, preserving operator-owned form submission and Swiggy credential gates.
- GitHub Actions installs Chromium for Playwright, runs production smoke, captures visual evidence, exports the Swiggy builder packet, and uploads ignored reviewer artifacts for every push and pull request.
- Swiggy OAuth Status reports authorize/token/logout endpoints, pending PKCE verifier count, callback status, token source, token expiry, storage rules, and no-token-logging posture.
- Credential onboarding reports DCR preview, redirect URI status, metadata endpoints, PKCE readiness, scopes, and access-form fields.
- Credential Vault Center reports seven runtime credential slots, four rotation runbooks, four redaction rules, support-safe fields, forbidden fields, and Swiggy-owned credential gates.
- Runtime telemetry records live API and MCP request events with request IDs, hashed user context, session correlation, status classes, latency, and redaction evidence.
- Audit Ledger Center records redacted plan audit events, support correlation keys, retention posture, DSR routing, and builders@swiggy.in packet fields.
- Support Bridge prepares official `report_error` payloads for Food, Instamart, and Dineout, and `/api/support/bridge/report` executes consent-gated reports with observed-issue checks, hashed toolContext identifiers, redacted notes, receipt summaries, SLA routing, and builders@swiggy.in escalation.
- SLO Incident Command maps 99.9% uptime targets, latency classes, status-page fallback, S0-S3 runbooks, 72-hour maintenance notice, measurement exclusions, and remediation evidence.
- Error Intelligence maps Swiggy's current `success:false` failure envelope, message/HTTP buckets, planned symbolic codes, domain failures, retry policy, observability hooks, and support actions; `/api/error-intelligence/classify` turns a concrete MCP error sample into reauth, fix-arguments, safe-backoff, domain-failure, support, or no-blind-retry decisions.
- Swiggy Confirmation Command Center verifies final Food order, Instamart checkout, and Dineout booking proof with fresh cart or slot reads, explicit separate approvals, non-blind retry probes, Swiggy-response payment/free-booking truth, and live credential gates.
- Swiggy Cancellation & Care Center verifies no-tool cancellation handling, official customer-care copy, Dineout booking recovery, `report_error` support context, incident email routing, and planned error-code gates.
- Swiggy Auth Lifecycle Center verifies PKCE, token lifetimes, v1 refresh-token gating, re-auth recovery, secure storage, and no-token logging.
- Profile, substitution, confirm-all, tracking, and Builder Access package routes work end to end.
- Pantry, group planning, scheduling, ops, privacy, markdown export, and OAuth callback routes work end to end.
- Readiness, OpenAPI, preflight, replay, widgets, Widget Runtime, Widget Experience Composer, Agent Experience Benchmark, Private Pilot Control Room, Staging Cutover, submission, Submission Console, Access Evidence Matrix, Production Launch Bundle, rate-limit, version, compliance, data governance, audit ledger, and reviewer proof routes work end to end.
- Hosted Widget Activation Center keeps Swiggy iframe cutover safe: semantic fallbacks stay live, parent origins and hosted URLs remain external gates, postMessage events require origin verification, and commercial widget events still route through confirmation guards.
- Resilience drills cover safe 5xx retries, 429 Retry-After handling, 401 reauth, non-idempotent check-then-retry, and deprecation monitoring.
- Evaluation Lab checks multi-persona city coverage, voice-safe responses, budget fit, preflight gates, confirmation locks, and PII minimization.
- File-backed storage persists plans across server instances and exposes export/compaction diagnostics.
- The React UI loads server-generated plans and confirms through the API.
- All commercial actions require explicit confirmation.
- Confirming one recommendation does not silently confirm the others.
- Order-placement class tools are not blindly retried.
