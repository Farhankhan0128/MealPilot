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
- Docs Coverage showing all 69 Swiggy `llms.txt` pages mapped to MealPilot evidence and external gates.
- Upstream Watch showing `llms.txt`, `llms-full.txt`, v1.0 limitations, v1.1/v1.2/v2 roadmap items, signed-manifest watch, and new-tool action queues.
- Source Intelligence showing official website pages, CTA inventory, `llms` docs, markdown twins, 35-tool reference counts, drift signals, and build-queue actions.
- Innovation Radar showing premium opportunity lanes, route optimizations, build phases, differentiators, and staging or partner gates derived from Swiggy source signals.
- AI Client Connect Kit showing Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, generic MCP config, coding-agent rules, and SDK auth modes.
- Brand Compliance Kit showing Powered by Swiggy attribution, co-branding asset gates, palette audit, and no-endorsement copy.
- Journey Compiler showing official recipe routes, all 35 tools, confirmation gates, recovery reads, and call savings.
- Access Dossier showing Swiggy application fields, review checks, ground rules, legal readiness, and the developer-track submission path.
- Premium Use Case Studio showing ten differentiated MealPilot playbooks, all 35 tools placed, cross-server routes, surfaces, saved calls, and launch stages.
- Premium Concierge showing lunch, pantry reset, Dineout evening, dessert reminder, and Sunday recovery slots with official recipe routes, saved-call optimization, and separate confirmations.
- Luxury Experience Workspace showing lean, premium, family, social, and training modes plus reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces with all 35 Swiggy tools, widget fallbacks, voice contracts, and telemetry.
- Reviewer Artifact Vault showing proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and Swiggy handoff copy.
- Visual QA Center showing desktop/tablet/mobile screenshot targets, selectors, artifact paths, no-overlap checks, text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and automation gates.
- Staging Cutover Rehearsal showing first read-only MCP probes, fail-closed bearer-token behavior, retry branches, support packet fields, and 48-hour green gates.
- Staging Certification Matrix showing all 35 tools assigned to staging smoke waves, 48-hour soak, telemetry, rollback, and production-promotion gates.
- Staging Transcript Export showing session-scoped JSONL, Markdown replay, redaction manifest, support envelope, and non-blind retry evidence.
- Local MCP resources/prompts calls: `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`.
- MCP Gateway showing mock transport now and the exact staging/production endpoint cutover path.
- OAuth Status showing authorize/token/logout endpoints, pending PKCE verifier count, callback outcome, token source, expiry, and no-token-logging checklist.
- Delegated Auth Center showing enterprise on-behalf-of PKCE, per-user token storage, 5-day access token, 30-day user session, logout, troubleshooting, redirect schemes, and platform-operator gates.
- Go-Live Gates for credentials, OAuth, confirmation, idempotency, observability, rollout, and privacy.
- Observability metrics with traceable session IDs.
- Audit Ledger Center with redacted session/tool audit events, support correlation, retention posture, and DSR routing.
- Support Bridge with official `report_error` payloads for Food, Instamart, and Dineout.
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
- MCP Backpressure Governor artifact at `/api/mcp/backpressure-governor` with current upstream-shedder handling, future 429/header readiness, token buckets, tracking floor, voice burst shaping, and background-job gates.
- SLO Command score, uptime targets, commercial p95 latency, maintenance windows, and status-page external gate.
- Data Governance Center with DPDP roles, India/Singapore residency, data-flow inventory, DSR routing, 90-day Swiggy audit retention, token redaction, and signed-manifest watch.
- Audit Ledger Center with redacted session/tool events, support correlation keys, DSR routing, and Swiggy support packet fields.
- Enterprise Delegated Auth Center artifact for platform DCR preregistration, per-user OAuth, MCP on-behalf-of calls, 401/419/403 recovery, and architecture-review evidence.
- Version monitor with v1 route pinning and deprecation alert readiness.
- Compliance controls for consent, PII minimization, deletion, audit logging, and training-data exclusion.
- Support Bridge redaction rules, SLA matrix, and escalation checklist.
- Swiggy Docs Coverage artifact in reviewer proof and launch handoff.
- Swiggy Upstream Watch artifact for changelog, coding-agent docs, roadmap, signed-manifest, and release-drift control.
- Swiggy Source Intelligence artifact for website/docs/API drift reconciliation, 35-tool count alignment, and external gate tracking.
- Swiggy Innovation Radar artifact for premium product strategy, opportunity lanes, route optimization, build phases, and partner gates.
- Tool Contract Matrix artifact for all-tool schema, response envelope, retry, confirmation, and error-bucket evidence.
- State Orchestrator artifact for official multi-turn cart state, switch guards, stale-cart recovery, and voice/chat response contracts.
- Commercial Action Guard artifact for non-idempotent Food, Instamart, Dineout, and combined commercial-action safety.
- Resource & Prompt Studio artifact for MCP resource and prompt reads across all three Swiggy servers.
- Staging Cutover Rehearsal artifact for real MCP transport readiness, OAuth gates, first-call probes, support packet fields, and production promotion checks.
- Website Atlas coverage for the production access page, launch blog, apply CTAs, header, footer, and docs subnav.
- Builder Intake Command Center for CTA ownership, access-form values, demo storyboard, outbound drafts, and live credential gates.
- Channel & Multimodal Studio for voice, auto-restock, group ordering, dietary planner, reservation, and screenshot-to-order channel contracts plus local execution packets for route plans, response rules, confirmation gates, and telemetry.
- Nutrition & Budget Intelligence for protein-per-rupee, coupon-safe cart review, Instamart pantry gaps, group budgets, Dineout balance, and nutrition safety controls.
- Household Preference Graph for consented order/go-to/saved-location signals, household weights, pantry forecasts, retention rules, and cancellation-safe active-order memory.
- Guest Collaboration & Calendar Center for guest votes, date-night and guests-at-home templates, Dineout slot checks, Food reminder handoffs, Instamart prep, ICS artifacts, Slack/Teams gates, and voice-safe briefs.
- Luxury Experience Workspace for polished reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces with all-tool coverage and separate confirmations.
- Reviewer Artifact Vault for proof links, screenshot targets, verification commands, redaction rules, and access-review handoff email.
- Visual QA Center for reviewer screenshot selectors, viewport coverage, no-overlap/text-fit rules, widget fallback checks, and screenshot automation gates.
- AI Client Connect Kit artifact for consumer AI-client, coding-agent, SDK, and delegated-auth readiness.
- Brand Compliance Kit artifact for attribution, co-branding, palette, and external asset gates.
- Swiggy Journey Compiler artifact for official recipe routes and all-tool coverage.
- Swiggy Access Dossier artifact for access-page fields, ground rules, and manual inputs.
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
- `/api/swiggy-upstream-watch`
- `/api/swiggy-source-intelligence`
- `/api/swiggy-innovation-radar`
- `/api/swiggy-builder-intake`
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
- `/api/mcp/staging-cutover`
- `/api/mcp-gateway`
- `/api/auth/swiggy/status`
- `/api/enterprise-delegated-auth`
- `/api/traffic-readiness-plan`
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
