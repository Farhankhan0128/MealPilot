# Roadmap

## Phase 0: Builder Access Packet

Status: complete.

- Define use case and target users.
- Prepare GitHub repository.
- Document safety, privacy, traffic, and OAuth plan.
- Add static prototype for the demo journey.

## Phase 1: Local Prototype

Status: in progress.

- Add local dev stub for Food, Instamart, and Dineout responses. Complete.
- Connect UI to structured planning state. Complete.
- Add explicit confirmation modals for all risky actions. Complete.
- Add audit timeline and redacted log shape. Complete.
- Add profile, variants, substitutions, confirm-all, and tracking. Complete.
- Add pantry, group planning, reminders, privacy controls, ops status, and markdown export. Complete.
- Add Demo Studio, Production Evidence, durable storage, Resilience Lab, and Evaluation Lab evidence. Complete.
- Add MCP Gateway for mock-to-staging-to-production routing and fail-closed auth behavior. Complete.
- Add session-scoped Staging Transcript Export for redacted JSONL, Markdown, support envelope, and certification-wave evidence. Complete.
- Add Traffic Readiness Plan for expected volume, QPS, Retry-After, launch notice, capacity email, and staged rollout. Complete.
- Add SLO Incident Command Center for uptime, latency, status-page fallback, maintenance windows, and incident comms. Complete.
- Add Data Governance Center for DPDP roles, residency, PII flows, DSR routing, retention, token redaction, and signed-manifest watch. Complete.
- Deepen Website Atlas with production access page, launch blog, developer/enterprise apply CTAs, and public conversion paths. Complete.
- Add Enterprise Delegated Auth Center for on-behalf-of PKCE, per-user token storage, platform redirect schemes, troubleshooting, architecture review, and partner gates. Complete.
- Add OAuth Status panel, callback URL cleanup, redacted token posture, and token exchange path. Complete.
- Add Swiggy Upstream Watch for `llms.txt`, `llms-full.txt`, changelog limitations, roadmap items, signed manifests, and release-drift action queues. Complete.
- Add Swiggy Source Intelligence for Builders website, CTA, `llms`, markdown twin, reference count, drift signal, and build-queue reconciliation. Complete.
- Add Builder Intake Command Center for signup, apply, demo, contact, docs, footer CTA actions, application fields, storyboard, and drafts. Complete.
- Add Premium Concierge Itinerary for official Swiggy recipe routes, 35-tool coverage, route savings, reminders, and confirmation gates. Complete.
- Add Tool Contract Matrix for all 35 Swiggy tools, parameters, response envelopes, error buckets, retry posture, and fixture previews. Complete.
- Add Scenario Runner for official Food, Instamart, Dineout, and combined recipes with JSON-RPC traces across all 35 tools. Complete.
- Add State Orchestrator for official multi-turn cart state, stale-cart recovery, switch guards, and voice/chat response contracts. Complete.
- Add Widget Runtime Center for Swiggy iframe contracts, postMessage handlers, activation checks, render contracts, semantic fallbacks, voice exclusions, and hosted-widget gates. Complete.
- Add Commercial Action Guard for Food order, Instamart checkout, Dineout booking, combined-flow confirmation locks, non-blind retry drills, telemetry, and support packets. Complete.
- Add Staging Cutover Rehearsal for real MCP transport, first-call probes, fail-closed token behavior, retry branches, support packet fields, and 48-hour promotion gates. Complete.
- Add Audit Ledger Center for redacted session/tool events, support correlation, retention posture, DSR routing, and support packet fields. Complete.
- Add Submission Console for developer/enterprise form targets, official fields, proof attachments, runbook steps, blockers, and handoff drafts. Complete.
- Add FAQ & Policy Center for homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, and legal evidence. Complete.
- Add Growth Partnership Center for get-noticed, hiring, co-marketing, analytics, strategic guidance, launch experiments, metrics, proof assets, and partner asks. Complete.
- Add Resource & Prompt Studio for Food, Instamart, and Dineout resources/list, resources/read, prompts/list, and prompts/get proof. Complete.
- Add Channel & Multimodal Studio for voice, auto-restock, group bot, dietary planner, reservation, screenshot-to-order developer lanes, and local execution packets. Complete.
- Add Nutrition & Budget Intelligence for protein-per-rupee planning, coupon-safe cart review, Instamart pantry gaps, group budgets, Dineout balance, and nutrition-estimate gates. Complete.
- Add Household Preference Graph for consented active-order, go-to item, order-history, Dineout location, household weighting, forecast, and retention evidence. Complete.
- Add Guest Collaboration & Calendar Center for guest votes, occasion templates, Dineout-first planning, Food reminder handoffs, Instamart prep, calendar artifacts, Slack/Teams gates, and voice-safe briefs. Complete.
- Add Luxury Experience Workspace for polished reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces with all-tool coverage, concierge modes, widget fallbacks, voice contracts, and telemetry. Complete.
- Add Reviewer Artifact Vault for proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and Swiggy handoff copy. Complete.
- Add Visual QA Center for reviewer screenshot targets, selector manifests, no-overlap/text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and screenshot automation gates. Complete.
- Add Carbon-inspired premium portal design language, MealPilot logo, sticky header, mobile navigation, footer, visible CTA feedback, and expanded UI CTA tests. Complete.
- Add MCP Backpressure Governor for Swiggy v1.0 upstream-shedder mode, future 429/header readiness, token buckets, tracking cadence, voice bursts, and background-job gates. Complete.
- Validate real MCP transport against Swiggy staging credentials. Next.

## Phase 2: Swiggy Staging

Target: after Swiggy issues staging credentials.

- Replace local stub URLs with staging MCP URLs.
- Complete OAuth 2.1 PKCE flow.
- Validate 401 handling across all three servers.
- Validate 429 backoff behavior.
- Validate Traffic Readiness lane budgets against live staging telemetry and Swiggy capacity feedback.
- Validate MCP Backpressure Governor against live staging 5xx/upstream shed behavior and update it when Swiggy ships MCP-layer 429 and `X-RateLimit-*` headers.
- Validate SLO Incident Command latency classes and support escalation against live staging traces.
- Validate Data Governance residency, DSR routing, DPA posture, and signed-manifest watch against Swiggy staging review feedback.
- Validate Audit Ledger readback against live staging session IDs and Swiggy support/audit expectations.
- Validate Enterprise Delegated Auth Center with Swiggy platform-operator approval, final redirect allowlist, per-user token storage, logout, and capacity ceilings if MealPilot enters the enterprise track.
- Run 48-hour staging soak with seeded users and low traffic.

## Phase 3: Private Pilot

Target: 50-100 users.

- Invite a small user group in Bengaluru, Delhi NCR, and Mumbai.
- Measure successful plans, cart confirmations, and abandoned confirmations.
- Collect qualitative feedback on trust, usefulness, and clarity.
- Keep peak traffic below 1 QPS.
- Send seven-day notice before any campaign-backed traffic event.

## Phase 4: Production Readiness

- Finalize HTTPS redirect URI.
- Move secrets to managed storage.
- Validate audit dashboard against live staging traces and Swiggy support feedback.
- Add user preference export and deletion.
- Prepare Swiggy notification plan for any launch campaign.
