# Swiggy Builders Research and MealPilot Product Plan

Last researched: 2026-07-06

This document is the working source of truth for mapping Swiggy Builders Club into MealPilot. It records the current official website surface, all exposed MCP server families, CTAs, production gates, and the product roadmap required to turn MealPilot into a premium Swiggy-native meal operating system.

Official sources:

- Builders Club home: https://mcp.swiggy.com/builders/
- Developers page: https://mcp.swiggy.com/builders/developers/
- Enterprises page: https://mcp.swiggy.com/builders/enterprises/
- Access application and ground rules: https://mcp.swiggy.com/builders/access/
- Docs home: https://mcp.swiggy.com/builders/docs/
- LLM index: https://mcp.swiggy.com/builders/llms.txt
- Full LLM pack: https://mcp.swiggy.com/builders/llms-full.txt
- Start docs: https://mcp.swiggy.com/builders/docs/start/
- Coding agents: https://mcp.swiggy.com/builders/docs/start/coding-agents/
- Authentication: https://mcp.swiggy.com/builders/docs/start/authenticate/
- Food order recipe: https://mcp.swiggy.com/builders/docs/build/recipes/order-food/
- Grocery order recipe: https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/
- Table booking recipe: https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/
- Combined route recipe: https://mcp.swiggy.com/builders/docs/build/recipes/combined/
- Multi-turn state pattern: https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/
- Voice vs chat pattern: https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/
- Developer quickstart: https://mcp.swiggy.com/builders/docs/start/developer/
- Build recipes: https://mcp.swiggy.com/builders/docs/build/
- Reference: https://mcp.swiggy.com/builders/docs/reference/
- Error codes: https://mcp.swiggy.com/builders/docs/reference/errors/
- Operate: https://mcp.swiggy.com/builders/docs/operate/
- Changelog: https://mcp.swiggy.com/builders/docs/operate/changelog/

## Executive Summary

Swiggy Builders Club exposes a three-server MCP commerce platform:

| Server | Endpoint | Official tools | MealPilot status |
| --- | --- | ---: | --- |
| Food | `POST https://mcp.swiggy.com/food` | 14 | Mapped, locally mocked, confirmation-gated |
| Instamart | `POST https://mcp.swiggy.com/im` | 13 | Mapped, locally mocked, confirmation-gated |
| Dineout | `POST https://mcp.swiggy.com/dineout` | 8 | Mapped, locally mocked, confirmation-gated |
| Total | 3 MCP servers | 35 | Covered in `/api/mcp/catalog` and `/api/swiggy-builders-map` |

MealPilot should not be a thin order bot. The best product direction is a premium household food operating layer that combines daily food delivery, grocery replenishment, nutrition-aware planning, group constraints, restaurant reservations, and support-grade audit evidence. The core moat is orchestration across all three Swiggy servers with explicit consent, visible tradeoffs, and safe non-idempotent action handling.

## Website and Module Inventory

| Website module | What Swiggy communicates | MealPilot implementation |
| --- | --- | --- |
| Homepage hero | Build AI agents, apps, and integrations on Swiggy Food, Instamart, and Dineout. Localhost development is allowed before production access. | README, runnable local app, mock MCP gateway, Docker, Render blueprint, CI, demo script |
| What is Builders Club | Real products, AI-native agents, experimentation, support, and visibility. | MealPilot is positioned as a real Indian household assistant with privacy, confirmation, production evidence, and a Premium Use Case Studio |
| How it works | Start building, apply for production access, review, go live, show demo. | `/api/demo-studio`, `/api/submission-package`, `/api/swiggy-access-dossier`, `/api/swiggy-access-evidence-matrix`, `/api/builder-package.md`, `docs/demo-script.md` |
| What you get | Live APIs, rate limits, support, co-branding, direct support, hiring visibility, and growth partnership. | Rate-limit plan, Support Bridge, Growth Partnership Center, Talent Signal Center, support report, product positioning, reviewer proof |
| FAQ | Program fit, application, rate limits, breakage, demos, developer setup, enterprise onboarding, compliance, white-label limits, and support. | `/api/swiggy-faq-policy` maps FAQ themes and policy categories to MealPilot evidence; `/api/swiggy-faq-resolution-center` turns them into reviewer-ready answers, proof links, CTAs, and gates |
| Start | Developer, enterprise, consumer, coding-agent, and AI-client paths. | Developer path implemented; AI Client Connect Kit covers consumer clients, coding-agent rules, SDK auth modes, and enterprise delegated-auth gates |
| Authenticate | OAuth 2.1 with PKCE, Dynamic Client Registration, token lifecycle, scopes. | Server PKCE start/callback, Credential Cockpit, Capability Registry, DCR preview, process-memory token posture, exact redirect URI config, fail-closed staging/production mode |
| Developer quickstart | First tool call and localhost-to-production journey. | `/api/swiggy-developer-quickstart`, `/api/mcp/:server` JSON-RPC mock for tools/resources/prompts, first-call drills, SDK adapters, auth gates, and Swiggy gateway cutover |
| CTA execution | Click-through readiness for official CTAs, header, docs nav, footer, mailto, forms, and legal links. | `/api/swiggy-cta-execution-center` maps browser actions, keyboard paths, proof links, completion gates, assertions, and operator handoffs |
| Build recipes | Food order, grocery order, table booking, combined evening planner. | One MealPilot plan composes Food, Instamart, and Dineout recommendations, and `/api/swiggy-journey-compiler` compiles the official recipes plus premium routes |
| Agent patterns | Voice vs chat and multi-turn cart state. | `/api/sessions/:sessionId/surface`, cart preflight, replay, voice-safe constraints |
| Widgets | Planned widget registry and iframe/postMessage contract. | Semantic widget fallbacks, sandbox policy, origin verification, Capability Registry resource inventory |
| Ship to production | Retries, observability, idempotency, go-live checklist. | Request IDs, trace spans, route optimizer, resilience drills, Error Intelligence, Support Bridge, SLO Incident Command, Data Governance Center, support report, Traffic Readiness Plan, Production Launch Bundle, non-blind commercial action policy |
| Reference | Every tool grouped by server and journey stage, plus current error envelope guidance. | 35-tool catalog plus executable Tool Lab, `/api/swiggy-docs-coverage`, `/api/swiggy-docs-twin-explorer`, `/api/swiggy-upstream-watch`, `/api/swiggy-source-intelligence`, `/api/swiggy-deep-site-map`, `/api/swiggy-developer-quickstart`, `/api/swiggy-cta-execution-center`, `/api/swiggy-innovation-radar`, and `/api/error-intelligence` in API and UI |
| Operate | Access, SLA, rate limits, compliance, versioning, changelog, support. | Launch Center, Access Evidence Matrix, Production Evidence, Innovation Radar, Data Governance Center, compliance evidence, version monitor, rate-limit plan, Traffic Readiness Plan, SLO Incident Command |
| Blog | Launch and ecosystem narrative. | Product strategy aligns with Swiggy-native, India-first agent commerce |
| Footer | Developers, enterprises, guidelines, FAQ, apply, llms, legal, builders email. | Website Atlas, FAQ & Policy Center, README/docs, and support/reporting artifacts cover these links |

## CTA Coverage

| CTA | User intent | MealPilot response |
| --- | --- | --- |
| Start Building | Begin locally without production approval. | `npm run dev`, local MCP mock, API routes, Docker, Render blueprint |
| See What's Possible | Understand what can be built. | Demo scenarios, plan variants, pantry, group planning, reminders, widgets, evaluation lab |
| Request access / Apply | Submit for production access. | Builder access package, submission package, Access Evidence Matrix, markdown export, demo script |
| Apply as Developer | Submit the developer access form. | Access Dossier developer track, Access Evidence Matrix, Production Launch Bundle, and builder-access application docs |
| Apply as Enterprise | Submit the enterprise access form. | Access Dossier enterprise track, Access Evidence Matrix, delegated-auth notes, co-branding gates, and enterprise support posture |
| Apply now | Convert launch-blog interest into access review. | Launch Bundle packages the blog journey into proof links and manual attachments |
| Read the docs | Move from marketing or blog content into implementation. | Docs Coverage, Docs Twin Explorer, Tool Lab, Journey Compiler, and Launch Center |
| Send Us a Demo | Show evidence to Swiggy. | Demo Studio, MCP replay, preflight, submission fields |
| Docs | Explore source-of-truth implementation guidance. | This doc, README references, `/api/swiggy-builders-map` |
| builders@swiggy.in | Ask for support, access, rate upgrades, traffic-event notices, and escalation. | Support Bridge, support report, Traffic Readiness capacity email, rate-limit upgrade mailto, resilience runbook |
| llms.txt / llms-full.txt | Give coding agents clean docs. | Used as the page inventory backing this plan, Docs Coverage, Docs Twin Explorer, Upstream Watch, Source Intelligence, Deep Site Map, and Developer Quickstart Workbench |

## Complete Tool Coverage

### Food, 14 Tools

| Stage | Tools | MealPilot use |
| --- | --- | --- |
| Location/discovery | `get_addresses`, `search_restaurants` | Resolve address and restaurant candidates |
| Menu | `get_restaurant_menu`, `search_menu` | Select dishes, alternatives, and chat widgets |
| Cart/offers | `update_food_cart`, `get_food_cart`, `flush_food_cart`, `fetch_food_coupons`, `apply_food_coupon` | Prepare cart, refresh truth, handle offers, warn on restaurant switch |
| Order | `place_food_order` | Confirmation-only commercial action |
| Track | `get_food_orders`, `get_food_order_details`, `track_food_order` | Status lookup and non-blind retry probe |
| Support | `report_error` | Escalation payload |

### Instamart, 13 Tools

| Stage | Tools | MealPilot use |
| --- | --- | --- |
| Location/discovery | `create_address`, `delete_address`, `get_addresses`, `search_products`, `your_go_to_items` | Address lifecycle, grocery search, go-to replenishment |
| Cart | `update_cart`, `get_cart`, `clear_cart` | Basket preparation, authoritative cart refresh, address-switch safety |
| Order | `checkout` | Confirmation-only grocery checkout |
| Track | `get_orders`, `get_order_details`, `track_order` | Order history, status lookup, delivery tracking |
| Support | `report_error` | Escalation payload |

### Dineout, 8 Tools

| Stage | Tools | MealPilot use |
| --- | --- | --- |
| Find | `get_saved_locations`, `search_restaurants_dineout`, `get_restaurant_details` | Location-aware Dineout discovery and venue details |
| Reserve | `get_available_slots`, `create_cart`, `book_table` | Availability and confirmation-only free reservation |
| Manage | `get_booking_status` | Booking verification and non-blind retry probe |
| Support | `report_error` | Escalation payload |

## Product Strategy

MealPilot should become a luxury-grade food and meal intelligence product with these pillars:

1. Daily Meal Concierge
   - Combines lunch delivery, dinner groceries, and weekend dining in one plan.
   - Uses Food, Instamart, and Dineout without hiding separate confirmations.

2. Nutritional Budget Optimizer
   - Optimizes protein per rupee, meal variety, cuisine fit, and time to table.
   - Future staging work should incorporate live menu/product fields where available.

3. Pantry Autopilot
   - Converts Instamart go-to items and household pantry gaps into replenishment suggestions.
   - Keeps address serviceability and stock warnings visible.

4. Occasion Orchestrator
   - Plans full evenings using Dineout reservation, dessert delivery, and reminder flows.
   - Adds group constraints, allergy filters, and follow-up notifications.

5. Voice-Safe Commerce
   - Gives short spoken responses, hides IDs, limits option counts, and reads totals before confirmation.
   - Uses `your_go_to_items` for low-call reorder flows.

6. Builder Reviewer Console
   - Packages proof for Swiggy access review: tool coverage, Tool Lab probes, replay, OpenAPI, rate limits, compliance, and support runbooks.

## Route and MCP Optimization Plan

| Concern | Optimization |
| --- | --- |
| Saved addresses | Fetch once per session per server family unless the user changes location |
| Cart truth | Always call `get_food_cart` or `get_cart` before confirmation and before placement |
| Food restaurant switch | Warn before a cart-flushing restaurant change |
| Instamart address switch | Clear or rebuild cart before changing address because stock/serviceability can change |
| Dineout booking | Confirm date, time, party size, restaurant, and free booking status before `book_table` |
| Non-idempotent actions | Use `get_food_orders`, `get_orders`, or `get_booking_status` before retrying after a network failure |
| Rate limits | Keep interactive planning at 4-6 calls per active turn; do not poll tracking faster than 10 seconds |
| Widgets | Use `/api/mcp/widget-runtime` semantic fallbacks now; enable widget iframe headers after Swiggy hosting goes live |
| Voice | Prefer `your_go_to_items`, top 3 results, spoken prices, and no raw IDs |
| Observability | Log request ID, trace ID, session ID, tool, duration, status, and hashed user context only |
| Audit ledger | Keep support-safe session/tool metadata, retention posture, DSR routing, and no raw Swiggy payloads |

`/api/swiggy-route-optimizer` now makes this plan executable as reviewer evidence. It exposes four optimizer profiles: Express Parallel Discovery for three-server planning, Voice Minimal Reorder for low-spoken-output grocery replenishment, Occasion Conversion Guard for Dineout-first evenings, and Support-Safe Recovery for uncertain commercial outcomes.

| Optimizer artifact | What it proves | Official grounding |
| --- | --- | --- |
| Call-saving totals | Baseline calls, optimized calls, saved calls, commercial gates, parallel tools, and expected latency are derived from the Food, Instamart, Dineout, and combined journey rows. | `llms.txt`, order-food, order-groceries, book-a-table, combined |
| Parallel batches | Only location resolution, discovery fanout, and cart/slot truth reads are marked parallel; commercial actions are serialized. | Multi-turn state, ship-to-production, route recipes |
| Cache/retry matrix | Addresses are session cached, carts are never cached at action boundaries, tracking is throttled, and non-idempotent writes use status lookup before retry. | Multi-turn state, rate limits, error guidance |
| Cross-server handoffs | Food/Instamart address context, Dineout-to-Food reminders, Instamart pantry-to-Food budget, and support packets share derived/redacted context only. | Data and compliance, support, combined recipe |
| Confirmation boundaries | `place_food_order`, `checkout`, and `book_table` stay behind separate visible confirmations and never appear in parallel batches. | Order-food, order-groceries, book-a-table |

## Backend Implementation Status

| Capability | Artifact |
| --- | --- |
| API server | `server/app.ts` |
| MCP gateway | `server/services/mcpGateway.ts` |
| Credential onboarding | `server/services/credentialOnboarding.ts` |
| Credential Vault Center | `server/services/credentialVaultCenter.ts` |
| Local Swiggy JSON-RPC mock | `server/mock/swiggyToolRouter.ts` |
| 35-tool coverage matrix | `server/services/advancedWorkflows.ts` |
| Executable Tool Lab | `server/services/toolLab.ts` |
| Tool Contract Matrix | `server/services/toolContractMatrix.ts` |
| Scenario Runner | `server/services/scenarioRunner.ts` |
| State Orchestrator | `server/services/stateOrchestrator.ts` |
| Widget Runtime Center | `server/services/widgetRuntime.ts` |
| Commercial Action Guard | `server/services/commercialActionGuard.ts` |
| Staging Cutover Rehearsal | `server/services/stagingCutover.ts` |
| MCP Capability Registry | `server/services/capabilityRegistry.ts` |
| Website Atlas | `server/services/websiteAtlas.ts` |
| Module Intelligence Center | `server/services/moduleIntelligence.ts` |
| Builder Intake Command Center | `server/services/builderIntake.ts` |
| FAQ & Policy Center | `server/services/faqPolicyCenter.ts` |
| Growth Partnership Center | `server/services/growthPartnership.ts` |
| Benefits Activation Center | `server/services/benefitsActivationCenter.ts` |
| Conversion Center | `server/services/conversionCenter.ts` |
| Showcase Submission Center | `server/services/showcaseSubmissionCenter.ts` |
| Demo Evidence Director | `server/services/demoEvidenceDirector.ts` |
| Submission Timeline Center | `server/services/submissionTimelineCenter.ts` |
| Partner Success Desk | `server/services/partnerSuccessDesk.ts` |
| Partner Support Room | `server/services/partnerSupportRoom.ts` |
| Interaction QA Center | `server/services/interactionQaCenter.ts` |
| Staging Seed & Smoke Center | `server/services/stagingSeedSmokeCenter.ts` |
| Swiggy Builders map | `server/services/swiggyBuildersMap.ts` |
| Swiggy Docs Coverage | `server/services/docsCoverage.ts` |
| Swiggy Docs Twin Explorer | `server/services/docsTwinExplorer.ts` |
| Swiggy llms Manifest Verifier | `server/services/llmsManifestVerifier.ts` |
| Swiggy Tool Parity Auditor | `server/services/toolParityAuditor.ts` |
| Swiggy Builders Site Parity Auditor | `server/services/buildersSiteParityAuditor.ts` |
| Swiggy Builders Page Mesh Auditor | `server/services/buildersPageMeshAuditor.ts` |
| Swiggy Upstream Watch | `server/services/upstreamWatch.ts` |
| Swiggy Source Intelligence | `server/services/sourceIntelligence.ts` |
| Swiggy Deep Site Map | `server/services/deepSiteMap.ts` |
| Developer Quickstart Workbench | `server/services/developerQuickstartWorkbench.ts` |
| CTA Execution Center | `server/services/ctaExecutionCenter.ts` |
| CTA Live Auditor | `server/services/ctaLiveAuditor.ts` |
| Swiggy Innovation Radar | `server/services/innovationRadar.ts` |
| AI Client Connect Kit | `server/services/aiClientConnect.ts` |
| Brand Compliance Kit | `server/services/brandCompliance.ts` |
| Data Governance Center | `server/services/dataGovernance.ts` |
| Enterprise Delegated Auth Center | `server/services/enterpriseDelegatedAuth.ts` |
| Swiggy Journey Compiler | `server/services/journeyCompiler.ts` |
| Swiggy Access Dossier | `server/services/swiggyAccessDossier.ts` |
| Swiggy Access Evidence Matrix | `server/services/accessEvidenceMatrix.ts` |
| Premium Use Case Studio | `server/services/premiumUseCaseStudio.ts` |
| Premium Concierge Itinerary | `server/services/premiumConciergeItinerary.ts` |
| Staging Certification Matrix | `server/services/stagingCertification.ts` |
| Swiggy Handshake Doctor | `server/services/swiggyHandshakeDoctor.ts` |
| Staging Transcript Export | `server/services/stagingTranscript.ts` |
| Traffic Readiness Plan | `server/services/trafficReadiness.ts` |
| Swiggy Quota Negotiation Center | `server/services/quotaNegotiationCenter.ts` |
| SLO Incident Command Center | `server/services/sloIncidentCommand.ts` |
| Resource & Prompt Studio | `server/services/resourcePromptStudio.ts` |
| Channel & Multimodal Studio | `server/services/channelMultimodalStudio.ts` |
| Nutrition & Budget Intelligence | `server/services/nutritionBudgetIntelligence.ts` |
| Household Preference Graph | `server/services/householdPreferenceGraph.ts` |
| Guest Collaboration & Calendar Center | `server/services/guestCollaborationCenter.ts` |
| Luxury Experience Workspace | `server/services/luxuryExperienceWorkspace.ts` |
| Reviewer Artifact Vault | `server/services/reviewerArtifactVault.ts` |
| Visual QA Center | `server/services/visualQaCenter.ts` |
| OAuth PKCE helper | `server/services/pkce.ts` |
| Resilience drills | `server/services/resilienceDrills.ts` |
| Production evidence | `server/services/productionEvidence.ts` |
| Production Launch Bundle | `server/services/launchBundle.ts` |
| Submission Console | `server/services/submissionConsole.ts` |
| OpenAPI | `server/services/openApi.ts` |
| Trace and route optimization evidence | `server/services/observability.ts` |
| Runtime telemetry ledger | `server/services/runtimeTelemetry.ts` |
| Audit Ledger Center | `server/services/auditLedger.ts` |
| Swiggy OAuth Status | `server/services/swiggyAuthStatus.ts` |
| Support Bridge | `server/services/supportBridge.ts` |
| Error Intelligence | `server/services/errorIntelligence.ts` |
| Persistence | `server/store/sessionStore.ts` |
| Production smoke script | `scripts/verify-production.mjs` |

## Frontend Implementation Status

| Surface | Artifact |
| --- | --- |
| Planner workspace | `src/App.tsx` |
| Recommendation cards | Food, Instamart, and Dineout cards with item controls |
| Premium Concierge | Lunch, pantry reset, Dineout evening, dessert reminder, and recovery itinerary slots with official Swiggy route plans |
| Launch Center | Tool coverage, Tool Contract Matrix, Scenario Runner, State Orchestrator, Widget Runtime Center, Commercial Action Guard, Staging Cutover Rehearsal, Swiggy Handshake Doctor, Capability Registry, Resource & Prompt Studio, Website Atlas, Module Intelligence, Builder Intake, FAQ & Policy Center, Growth Partnership Center, Conversion Center, Showcase Submission Center, Submission Timeline Center, Partner Success Desk, Interaction QA Center, Channel & Multimodal Studio, Nutrition & Budget Intelligence, Household Preference Graph, Guest Collaboration & Calendar Center, Luxury Experience Workspace, Reviewer Artifact Vault, Visual QA Center, Access Evidence Matrix, Docs Coverage, Docs Twin Explorer, llms Manifest Verifier, Upstream Watch, Source Intelligence, Deep Site Map, Developer Quickstart, CTA Execution, Innovation Radar, Tool Lab, gateway, OAuth Status, Credential Cockpit, Credential Vault Center, Delegated Auth Center, Builders map, Support Bridge, go-live, observability, support |
| Guest Collaboration & Calendar | Guest votes, occasion templates, Dineout-first date nights, guests-at-home prep, office lunch, weekday reset, recovery meal, ICS artifacts, Slack/Teams gates, and voice-safe briefs |
| Luxury Experience Workspace | Lean, premium, family, social, and training modes plus polished Dineout reservation, Food cart, Instamart basket, combined evening, and recovery review surfaces |
| Reviewer Artifact Vault | Proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and handoff copy |
| Visual QA Center | Viewport targets, selector manifests, artifact paths, no-overlap rules, text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and screenshot automation gates |
| Demo Studio | Preflight, offers, replay, demo progress, submission package |
| Submission Console | Developer/enterprise form targets, official access requirements, prepared fields, proof attachments, packet order, runbook steps, blockers, and handoff drafts |
| Access Evidence Matrix | Official access fields, review checks, rules, legal terms, required attachments, browser runbook steps, proof commands, owners, operator inputs, and Swiggy gates |
| Production Evidence | Widgets, rate limits, Traffic Readiness, SLO Incident Command, Data Governance, Source Intelligence, Deep Site Map, Developer Quickstart, CTA Execution, Innovation Radar, Audit Ledger, versioning, compliance, Production Launch Bundle, Error Intelligence, reviewer proof, resilience, telemetry, evaluation |
| Trace Monitor | Span-level MCP traces, log contract, and redaction evidence |
| Runtime Telemetry | Live API/MCP request events, status classes, request IDs, session correlation, and redaction contract |
| Audit Ledger | Redacted session/tool events, support correlation, retention posture, DSR routing, and support packet fields |
| Route Optimizer | Call-saving journeys, optimizer profiles, parallel batches, cache/retry rules, cross-server handoffs, confirmation boundaries, and staging assertions |
| Safety UX | Confirmation modal per commercial action |
| Styling | `src/styles.css` |

## Testing Plan

Current automated checks:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run verify:production` after production-style local start

Coverage targets:

- Planner behavior and budget logic
- Retry policy and non-blind retry classification
- API health, config, security headers, OpenAPI
- Builder package and Swiggy Builders map
- Website Atlas for header, footer, production access page, launch blog, page modules, CTAs, and legal/resource links
- Module Intelligence Center for every page module's owner, audience, product promise, route optimization, risk boundary, proof links, journey placement, and external gates
- Swiggy Builders Page Mesh Auditor for live public page reachability, title/anchor extraction, module signal parity, CTA matching, and safe-origin drift checks across every non-external Website Atlas page
- FAQ & Policy Center for homepage/developer/enterprise FAQ themes, access ground rules, footer resources, allowed/restricted/prohibited policy categories, legal signals, and support contact
- Growth Partnership Center for get-noticed, hiring, co-branding, direct support, co-marketing, analytics dashboards, strategic guidance, launch experiments, metrics, assets, and partner asks
- Benefits Activation Center for live API access, quota expansion, support, co-branding, showcase visibility, hiring visibility, growth partnership, enterprise support, CTAs, owners, and proof links
- Showcase Submission Center for demo video readiness, pitch blocks, metric packs, visual proof, outreach email, operator inputs, and co-branding/feature approval gates
- Submission Timeline Center for access-form, demo-handoff, DCR, staging, 48-hour soak, and production-promotion sequencing with proof links and explicit operator/Swiggy gates
- Conversion Center for the final What Will You Cook CTA funnel, Start Building, See What's Possible, Request Access, Send Us a Demo, builders@swiggy.in, `llms.txt`, `llms-full.txt`, proof bundles, operator runbook, and go-live gates
- Credential Handoff Center for localhost proof, DCR, OAuth PKCE, exact redirect URI, secret vault, staging credentials, seeded smoke, 48-hour soak, and production promotion in one owner-assigned reviewer room
- Partner Success Desk for access handoff, support, SLO incidents, capacity review, backpressure, growth showcase, escalation emails, and enterprise Slack/partner-manager external gates
- Interaction QA Center for clickable portal CTAs, route contracts, visible feedback expectations, automation proof, and explicit Swiggy/operator gates
- Staging Seed & Smoke Center for seeded server fixtures, read-first staging probes, mutation refreshes, commercial stop rules, support smoke, telemetry evidence, and promotion blockers
- Swiggy Upstream Watch for `llms.txt`, `llms-full.txt`, changelog limitations, v1.1/v1.2/v2 roadmap items, signed manifests, and new-tool action queues
- Swiggy Source Intelligence for website, CTA, `llms`, markdown twin, reference count, drift signal, external gate, and build-queue reconciliation
- Swiggy Docs Twin Explorer for all 69 official markdown/rendered page pairs, retrieval lanes, proof routes, assertions, and drift gates
- Swiggy Deep Site Map for page rows, rendered module signals, CTA gates, header/docs/footer links, source sections, proof links, assertions, and external gates
- Developer Quickstart Workbench for official first-call readiness, SDK/framework adapters, `get_addresses` JSON-RPC drills, OAuth gates, commands, and recipe handoffs
- CTA Execution Center for official CTAs, header/docs/footer links, browser actions, keyboard paths, proof bundles, and manual form/email/legal gates
- CTA Live Auditor for safe live Builders/docs URL probes, manual form/email/legal gates, approved-origin checks, blocked-link drift, and reviewer runbook evidence
- Swiggy Innovation Radar for developer ideas, enterprise signals, access rules, support model, MCP references, premium opportunity lanes, route optimizations, build phases, and partner gates
- Credential onboarding and Dynamic Client Registration preview
- Credential Vault Center for runtime secret posture, redaction, rotation, and Swiggy support packets
- Tool Lab probes for all 35 tools
- Tool Contract Matrix coverage for all 35 tool parameters, response envelopes, source/privacy labels, retry policy, confirmation gates, error buckets, and local fixture previews
- Scenario Runner traces for official Food, Instamart, Dineout, and combined recipes, including guard/recovery probes and all 35 tools
- State Orchestrator coverage for multi-turn cart truth, server boundaries, stale-cart recovery, switch warnings, confirmation gates, and voice/chat response contracts
- Commercial Action Guard coverage for non-idempotent Food order placement, Instamart checkout, Dineout booking, combined-flow confirmations, check-then-retry drills, telemetry, and support packets
- Journey Compiler coverage for official recipes, premium routes, confirmation gates, recovery reads, and all 35 indexed tools
- Brand Compliance Kit coverage for attribution, co-branding rules, brand asset external gates, palette audit, no-endorsement copy, and launch screenshot review
- Data Governance Center coverage for DPDP roles, India/Singapore residency, PII flow inventory, DSR routing, 90-day audit retention, token redaction, security contacts, and signed-manifest watch
- Enterprise Delegated Auth Center coverage for platform DCR preregistration, per-user PKCE, token exchange, token storage, logout, redirect schemes, 401/419/403 recovery, capacity backoff, and architecture review
- Access Dossier coverage for production-access fields, review checks, rules, legal readiness, developer/enterprise tracks, proof links, and manual inputs
- Access Evidence Matrix coverage for official access fields, proof attachments, browser runbook steps, proof commands, owners, operator inputs, and Swiggy approval gates
- Premium Use Case Studio coverage for ten differentiated product lanes, all 35 tools placed into routes, saved calls, safety gates, and launch stages
- Premium Concierge Itinerary coverage for official recipe sources, all-server tool coverage, saved-call optimizations, cart refresh rules, separate confirmations, and Food scheduling external gates
- Swiggy Handshake Doctor coverage for OAuth authorization metadata, protected-resource watch state, Food `/food`, Instamart `/im`, Dineout `/dineout`, GET/OPTIONS-only safety, no bearer-token disclosure, and no `tools/call` execution
- Staging Certification Matrix coverage for all 35 tools assigned to credentialed smoke waves, 48-hour soak, OAuth/DCR gates, telemetry requirements, rollback, and production promotion
- Staging Transcript Export coverage for JSONL, Markdown, redaction, support envelope, session ids, request ids, and non-blind retry evidence
- Traffic Readiness coverage for expected sessions, projected tool calls, peak QPS, per-lane budgets, Retry-After behavior, seven-day traffic notice, capacity email, and 1% to 100% rollout
- SLO Incident Command coverage for 99.9% uptime targets, latency bands, status-page fallback, severity comms, maintenance windows, measurement exclusions, and remediation
- MCP Capability Registry for tools, resources, prompts, OAuth metadata, widget resources, prompt contracts, and external gates
- Resource & Prompt Studio for concrete `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` smoke evidence across all three Swiggy servers
- Channel & Multimodal Studio for developer-page build lanes: voice agent, auto-restock, group ordering, dietary planner, reservation agent, and screenshot-to-order, with local execution packets for route plans, response rules, confirmation gates, and telemetry contracts
- Nutrition & Budget Intelligence for protein-per-rupee, COD-safe Food coupons, Instamart pantry gaps, group budget allocation, Dineout balance, no-medical-claims controls, and external nutrition-data gates
- Household Preference Graph for active Food order signals, Instamart go-to items and order history, Dineout location memory, household weights, pantry forecasts, failure memory, retention rules, and DSR boundaries
- Guest Collaboration & Calendar Center for guest votes, occasion templates, Dineout slot checks, Food reminder handoffs, Instamart prep, calendar/share artifacts, Slack/Teams gates, voice-safe briefs, and no-scheduled-delivery controls
- Luxury Experience Workspace for all 35 Swiggy tools across premium reservation, Food cart, Instamart basket, combined evening, and recovery workspaces with widget fallbacks, voice contracts, telemetry, and confirmation gates
- Reviewer Artifact Vault for access-submission proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and reviewer handoff copy
- Visual QA Center for screenshot targets, selectors, viewport dimensions, artifact paths, no-overlap/text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and screenshot automation gates
- Swiggy Builders Page Mesh Auditor for a live multi-page check of Builders homepage, developer, enterprise, access, blog, docs, and reference pages before reviewer submission
- Swiggy Deep Site Map for a single reviewer audit of every Builders page, module signal, CTA, header/docs/footer link, source-reconciliation section, MealPilot proof path, assertion, and external gate
- Swiggy llms Manifest Verifier for live `llms.txt` parsing, markdown/rendered twin derivation, Swiggy-only origin safety, Docs Coverage comparison, and Food 14, Instamart 13, Dineout 8 reference-tool drift checks
- Swiggy OAuth Status coverage for authorize/token/logout endpoints, callback lifecycle, pending PKCE verifier count, token source, expiry, storage policy, and no-token-logging checklist
- Local MCP JSON-RPC shape
- OAuth callback and fail-closed staging behavior
- Storage export, restore, compaction
- Widget Runtime, Staging Cutover, widget contracts, rate-limit, traffic readiness, SLO command, data governance, version, compliance, reviewer proof
- Audit Ledger Center coverage for redacted session/tool events, support correlation, retention posture, DSR routing, and support packet fields
- Submission Console coverage for developer/enterprise access targets, official access requirements, official fields, proof attachments, packet order, runbook gates, and handoff drafts
- Access Evidence Matrix coverage for reconciling Access Dossier, Submission Console, Access Submission Studio, Reviewer Artifact Vault, and production verifier proof into one ledger
- Production Launch Bundle proof artifacts, access application fields, commands, go-live gates, and handoff email
- Support Bridge report_error request shapes, toolContext identifiers, SLA routing, redaction rules, and escalation checklist
- Error Intelligence buckets, planned core codes, terminal domain failures, retry ceilings, and non-blind commercial action policy
- Trace monitor, runtime telemetry, and route optimizer
- Resilience drills and evaluation lab

## Credential and External Gates

These items cannot be truthfully completed from the repository alone:

1. Swiggy Builder Access approval.
2. Staging credentials or Dynamic Client Registration flow accepted for this runtime.
3. HTTPS exact-match redirect URI allowlisting for production.
4. Real seeded-data staging validation across Food, Instamart, and Dineout.
5. Real production live orders, grocery checkout, and table booking verification.
6. Swiggy-hosted public widget iframe layer, which the docs describe as planned for v1.x.
7. Enterprise platform-operator approval, partner contract, capacity ceilings, exact redirect allowlist, and delegated-auth production cutover.

MealPilot must keep mock evidence clearly labeled as simulated until these gates are completed.

## Next Build Phases

### Phase 1 - Current Product Foundation

- Keep `/api/mcp/catalog` and `/api/swiggy-builders-map` as source-of-truth evidence.
- Keep `/api/swiggy-website-atlas` as source-of-truth evidence for public website modules, production access page, launch blog, navigation, CTAs, and footer links.
- Keep `/api/swiggy-builders-module-intelligence` as source-of-truth evidence for page-module ownership, product promises, route optimizations, proof links, module journeys, and risk gates.
- Keep `/api/swiggy-builders-launch-story` as source-of-truth evidence for launch-blog narrative, current 35-tool reconciliation, reviewer demo story, showcase assets, ecosystem lanes, CTA paths, and co-marketing gates.
- Keep `/api/swiggy-faq-policy` as source-of-truth evidence for FAQ themes, access ground rules, footer resources, policy categories, legal signals, support contact, and external policy gates.
- Keep `/api/swiggy-faq-resolution-center` as source-of-truth evidence for reviewer-ready FAQ answers, owners, proof links, activation CTAs, reviewer script steps, and operator or Swiggy gates.
- Keep `/api/swiggy-growth-partnership` as source-of-truth evidence for Swiggy growth-partnership signals, GTM experiments, proof assets, metrics, partner asks, and co-marketing gates.
- Keep `/api/swiggy-talent-signal-center` as source-of-truth evidence for standout-project, demo, GitHub, portfolio, hiring-readiness, outreach, reviewer narrative, and Swiggy recruiting/feature-placement gates.
- Keep `/api/swiggy-conversion-center` as source-of-truth evidence for the final Builders CTA funnel, access-form and demo-email handoff, docs retrieval links, proof bundles, operator runbook, and Swiggy go-live gates.
- Keep `/api/swiggy-benefits-activation-center` as source-of-truth evidence for turning Builders benefits into owner-assigned activation lanes, CTAs, proof routes, and external Swiggy/operator gates.
- Keep `/api/swiggy-docs-coverage` as source-of-truth evidence for all 69 Swiggy `llms.txt` pages and their implementation or external-gate status.
- Keep `/api/swiggy-docs-twin-explorer` as source-of-truth evidence for every official markdown twin, rendered page URL, retrieval lane, proof route, assertion, and drift gate.
- Keep `/api/swiggy-upstream-watch` as source-of-truth evidence for Swiggy docs retrieval contracts, changelog limitations, roadmap watches, signed-manifest readiness, and release-drift action queues.
- Keep `/api/swiggy-source-intelligence` as source-of-truth evidence for website/docs/API count reconciliation, drift interpretation, external credential gates, and the next build queue before every access submission.
- Keep `/api/swiggy-innovation-radar` as source-of-truth evidence for differentiated product strategy, route optimizations, premium opportunity sequencing, and staging or partnership gates.
- Keep `/api/ai-client-connect-kit` as source-of-truth evidence for consumer AI-client configs, coding-agent rules, SDK auth modes, and delegated-auth readiness.
- Keep `/api/brand-compliance-kit` as source-of-truth evidence for Powered by Swiggy attribution, co-branding guardrails, brand asset gates, and palette usage.
- Keep `/api/swiggy-journey-compiler` as source-of-truth evidence for official recipe routes, premium three-server orchestration, confirmation gates, and all-tool indexing.
- Keep `/api/swiggy-access-dossier` as source-of-truth evidence for the Swiggy production-access application packet and ground-rule compliance.
- Keep `/api/swiggy-access-evidence-matrix` as source-of-truth evidence for official access fields, proof attachments, runbook steps, proof commands, owner assignment, operator inputs, and Swiggy gates.
- Keep `/api/premium-use-case-studio` as source-of-truth evidence for differentiated MealPilot product lanes and all-tool use-case coverage.
- Keep `/api/premium-concierge-itinerary` as source-of-truth evidence for the productized luxury itinerary, official recipe route execution, saved-call optimizations, reminders, and confirmation gates.
- Keep `/api/staging-certification-matrix` as source-of-truth evidence for credentialed staging waves, all-tool smoke assignments, 48-hour soak, telemetry, rollback, and production-promotion gates.
- Keep `/api/swiggy-staging-seed-smoke-center` as source-of-truth evidence for seeded Food, Instamart, and Dineout staging fixtures, smoke wave order, stop rules, telemetry evidence, and production blockers.
- Keep `/api/sessions/:sessionId/staging-transcript` as source-of-truth session export evidence for Swiggy-ready JSONL, Markdown, redaction, support, and certification-wave mapping.
- Keep `/api/submission-console` as source-of-truth evidence for the official access-form handoff, prepared fields, proof attachments, demo-video gate, runbook, blockers, and drafts.
- Keep `/api/traffic-readiness-plan` as source-of-truth evidence for expected volume, peak QPS, lane budgets, Retry-After handling, major-event notice, capacity email, and staged rollout.
- Keep `/api/swiggy-quota-negotiation-center` as the source-of-truth capacity request packet for developer-tier confirmation, campaign upgrade gates, Retry-After header watch, commercial single-flight proof, disabled background jobs, and Swiggy bespoke quota asks.
- Keep `/api/slo-incident-command` as source-of-truth evidence for Swiggy uptime targets, latency classes, status-page fallback, maintenance windows, severity comms, and remediation.
- Keep `/api/data-governance-center` as source-of-truth evidence for Swiggy DPDP role boundaries, residency, PII flows, DSR routing, retention, token handling, security contacts, and signed-manifest watch.
- Keep `/api/audit-ledger` as source-of-truth evidence for redacted session/tool audit events, support correlation, local retention posture, Swiggy audit-log acknowledgement, DSR routing, and support packet fields.
- Keep `/api/enterprise-delegated-auth` as source-of-truth evidence for enterprise on-behalf-of PKCE, per-user token lifecycle, redirect schemes, troubleshooting, architecture review, and platform-operator gates.
- Keep `/api/mcp/tool-lab` as executable JSON-RPC evidence for every official tool.
- Keep `/api/mcp/tool-contract-matrix` as source-of-truth evidence for every official tool contract, parameter, response envelope, retry posture, confirmation gate, and error bucket.
- Keep `/api/mcp/scenario-runner` as source-of-truth evidence for official recipe-level execution, guard/recovery branches, confirmation gates, and all-tool coverage.
- Keep `/api/mcp/state-orchestrator` as source-of-truth evidence for multi-turn cart state, server-boundary, stale-cart recovery, and voice/chat pattern compliance.
- Keep `/api/mcp/widget-runtime` as source-of-truth evidence for Swiggy iframe sandboxing, origin-verified postMessage handlers, semantic fallbacks, voice exclusions, and hosted-widget gates.
- Keep `/api/mcp/staging-cutover` as source-of-truth evidence for real MCP first-call probes, OAuth gates, fail-closed routing, retry branches, support packet fields, and production promotion gates.
- Keep `/api/swiggy-builder-intake` as source-of-truth evidence for converting all 11 website CTA paths and access requirements into locally prepared owner-assigned submission actions, demo steps, drafts, and explicit operator/Swiggy gates.
- Keep `/api/swiggy-deep-site-map` as source-of-truth evidence for the complete Builders website audit: page rows, module signals, CTA gates, header/footer matrix, source sections, proof links, assertions, and external gates.
- Keep `/api/swiggy-developer-quickstart` as source-of-truth evidence for the official self-serve developer path: readiness steps, framework adapters, first-call drills, OAuth gates, commands, recipe handoffs, and external credential gates.
- Keep `/api/swiggy-cta-execution-center` as source-of-truth evidence for every official CTA, header/docs/footer link, browser action, keyboard path, proof bundle, and operator-gated form/email/legal action.
- Keep `/api/mcp/capability-registry` as the source-of-truth map for `mcp:tools`, `mcp:resources`, `mcp:prompts`, metadata, widgets, and prompt contracts.
- Keep `/api/mcp/resource-prompt-studio` as source-of-truth evidence for local MCP resource and prompt inventory, samples, smoke requests, and live staging gates.
- Keep `/api/channel-multimodal-studio` as source-of-truth evidence for channel contracts, local execution packets, multimodal pipelines, Swiggy toolchains, privacy boundaries, telemetry contracts, and external platform gates.
- Keep `/api/nutrition-budget-intelligence` as source-of-truth evidence for nutrition and budget routes, protein-per-rupee metrics, coupon-safe cart review, pantry gaps, group budgets, Dineout balance, and nutrition safety controls.
- Keep `/api/household-preference-graph` as source-of-truth evidence for consented personalization, Swiggy order/go-to/location signals, household weighting, forecasts, automations, and retention boundaries.
- Keep `/api/guest-collaboration-calendar` as source-of-truth evidence for group votes, occasion templates, Dineout-first planning, Food reminder handoffs, Instamart prep, calendar artifacts, Slack/Teams gates, voice-safe briefs, and separate confirmation controls.
- Keep `/api/luxury-experience-workspace` as source-of-truth evidence for polished reservation, Food cart, Instamart basket, combined evening, and recovery workspaces with all-tool coverage, concierge modes, widget fallbacks, voice contracts, telemetry, and confirmation gates.
- Keep `/api/reviewer-artifact-vault` as source-of-truth evidence for the Swiggy access-review manifest, including proof links, OpenAPI, commands, screenshot targets, video checklist, redaction rules, logs, traces, support context, and handoff email.
- Keep `/api/visual-qa-center` as source-of-truth evidence for reviewer screenshot selectors, viewport coverage, artifact paths, no-overlap/text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and screenshot automation gates.
- Keep local `/api/mcp/:server` resources/list, resources/read, prompts/list, and prompts/get working until live Swiggy resources/prompts are validated.
- Keep `/api/auth/swiggy/status` as source-of-truth evidence for OAuth callback state, pending PKCE verifiers, token source, expiry, secure storage policy, and callback checklist.
- Keep `/api/credential-onboarding` as the source-of-truth credential, DCR, scope, and redirect URI evidence.
- Keep `/api/production-launch-bundle` as the consolidated reviewer handoff with artifacts, verification commands, access fields, and external Swiggy gates.
- Keep `/api/support/bridge` as the source-of-truth runtime support artifact for the three official `report_error` tools.
- Keep `/api/error-intelligence` as the source-of-truth Swiggy error envelope, planned code, retry bucket, and terminal domain failure artifact.
- Keep mock mode runnable for access review.
- Maintain docs and README against official docs.

### Phase 2 - Staging Integration

- Complete real OAuth/DCR path against staging.
- Replace seeded Tool Lab mock calls with staging `tools/call` traffic and preserve the same safety classifications.
- Record real session IDs, tool latencies, and JSON-RPC responses.
- Add staging transcript export to Demo Studio.

### Phase 3 - Premium Personalization

- Replace estimated macro heuristics with live Swiggy or merchant nutrition fields when available.
- Replace mock household preference signals with live Food active orders, Instamart go-to/order history, and Dineout booking signals once staging credentials are issued.
- Calibrate pantry depletion forecasts with live Instamart go-to cadence and order details.
- Replace local occasion-template scoring with staging readback, live guest-channel analytics, and approved workspace installs once Swiggy credentials and Slack/Teams gates are cleared.

### Phase 4 - Production Hardening

- Add OpenTelemetry spans if the deploy platform supports it.
- Keep `/api/observability/traces` as the stable span/log contract until OpenTelemetry export is enabled.
- Keep `/api/swiggy-route-optimizer` as the route-safety and call-saving contract for Swiggy review, including optimizer profiles, explicit parallel batches, cache/retry policy, cross-server handoffs, commercial confirmation boundaries, and source-linked assertions.
- Add durable encrypted store or managed database.
- Add structured logs with sampling and PII redaction.
- Add CI smoke test that runs against staging credentials from secrets.
- Replace Visual QA Center manual screenshot gates with automated screenshot-backed UI verification for demo-critical panels.

### Phase 5 - Luxury Experience

- Replace local polished reservation and cart review workspaces with live Swiggy staging reads, hosted widgets, and screenshot-backed UI verification once external gates clear.
- Add food images or widget-backed rich cards when Swiggy widgets are available.
- Calibrate concierge-style planning modes with private-pilot usage, live Swiggy cart/booking outcomes, and real latency telemetry.
- Replace local calendar/share artifacts with production ICS domain, approved guest collaboration channels, and Swiggy-hosted widget links after external gates clear.

## Definition of Done

The full objective is complete only when:

- All 35 official tools are implemented or guarded with explicit production behavior.
- Food, Instamart, and Dineout real staging calls are verified with Swiggy credentials.
- OAuth works end to end with exact redirect URIs.
- No commercial action can happen without visible confirmation.
- Non-idempotent retry behavior is verified against real Swiggy status/order lookup tools.
- Logging, tracing, OpenAPI, docs, tests, and production smoke checks pass.
- Route optimizer evidence proves cache, retry, parallel batch, cross-server handoff, confirmation, and call-saving behavior for representative Food, Instamart, Dineout, and combined journeys.
- The app is recorded and packaged for Swiggy Builder Access review.
- Remaining external gates are either completed or clearly marked as waiting on Swiggy approval.
