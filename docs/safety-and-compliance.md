# Safety And Compliance Plan

MealPilot is a commerce assistant, so the safety bar is higher than a normal chat app. The product policy is simple: the agent may suggest and prepare, but the user must explicitly approve every commercial action.

## Confirmation Gates

MealPilot requires separate confirmation for:

- Food cart placement.
- Instamart checkout.
- Dineout booking.
- Any change that increases budget by more than 10 percent.
- Any substitution that conflicts with a stored allergy, diet, or dislike.

Confirmations must show:

- Merchant or restaurant name.
- Items or booking details.
- Delivery address or reservation area.
- Estimated total.
- Any known unavailable item or substitution.

## OAuth And Tokens

- Use OAuth 2.1 PKCE.
- Use HTTPS redirect URIs in production.
- Keep `http://localhost` only for local development.
- Re-authenticate once when a Swiggy MCP server returns 401.
- Treat a 401 from one Swiggy MCP server as session expiry for all connected Swiggy servers.
- Route staging and production tool calls through `/api/mcp-gateway`; without a bearer token, the gateway fails closed instead of silently using mock data.
- Keep exchanged bearer tokens in process memory or managed secret storage, and only expose redacted token previews in diagnostics.
- Use `/api/auth/swiggy/status` and the frontend OAuth Status panel to review authorize/token/logout endpoints, pending PKCE verifier count, callback outcome, token source, expiry, and no-token-logging posture without exposing bearer values.

## Retry Policy

Safe to retry:

- Search requests.
- Menu or catalogue reads.
- Availability checks.

Unsafe to retry blindly:

- Food order placement.
- Instamart checkout.
- Dineout table booking.

`/api/swiggy-route-optimizer` is the route-level safety ledger for those rules. It allows only location and discovery reads to run in parallel batches, requires Food and Instamart cart truth plus Dineout slot truth immediately before confirmation, keeps `place_food_order`, `checkout`, and `book_table` out of every parallel batch, and records cross-server handoffs as derived context with raw addresses, payment data, bearer tokens, and full Swiggy payloads redacted.
- Any tool call that mutates cart state without first checking the current cart.

For non-idempotent calls, MealPilot records the attempted action and asks the user to verify the result before trying again.

The `/api/resilience` endpoint turns this policy into executable demo evidence:

- 5xx and upstream timeout backoff for safe read tools.
- 429 `Retry-After` handling without extra burst traffic.
- 401 and JSON-RPC auth recovery through OAuth PKCE.
- Check-then-retry for `place_food_order`, `checkout`, and `book_table`.
- Version/deprecation alerting through `_meta.swiggy.deprecation`.

The `/api/error-intelligence` endpoint maps Swiggy's current `success:false` envelope into retry classes, planned symbolic codes, terminal domain failures, support actions, and the same non-blind retry policy for commercial actions.

The `/api/ai-client-connect-kit` endpoint marks AI-client and coding-agent installs as real Swiggy MCP connections. Operators must treat Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, and generic MCP clients as capable of live commerce calls after OAuth, so confirmation gates and non-blind retry rules still apply outside the MealPilot web UI.

The `/api/swiggy-builders-consumer-witness` endpoint aggregates that consumer path into a reviewer receipt. It keeps AI clients, visual dish capture, voice commerce, nutrition/budget planning, household preferences, guest collaboration, luxury workspaces, and confirmation safety tied to explicit proof links, no-token rules, user confirmation, and Swiggy-owned live credentials.

The `/api/swiggy-builders-tool-reference-witness` endpoint keeps the official MCP reference layer auditable. Food 14, Instamart 13, Dineout 8, contract rows, Tool Lab probes, recipe scenarios, docs twins, and commercial-safety classes remain visible, while live schema drift, staging users, quotas, payments, and production approval remain Swiggy-owned gates.

The `/api/swiggy-builders-credential-sandbox-witness` endpoint keeps sandbox and staging credential readiness auditable without exposing secrets. OAuth PKCE, DCR, vault redaction, credential handoff, seeded staging drills, certification, cutover, and live-signal calibration stay tied to proof links and explicit Swiggy/operator gates.

The `/api/swiggy-journey-compiler` endpoint keeps official recipe constraints visible in every route: Food placement is COD-only with a commercial confirmation gate, Instamart checkout respects the minimum cart threshold and address serviceability, Dineout booking confirms party details before `book_table`, and future Food scheduling remains a reminder/place-later flow until Swiggy exposes scheduled delivery.

The `/api/mcp/scenario-runner` endpoint validates those official recipes as local JSON-RPC traces before live credentials exist. It exercises Food, Instamart, Dineout, and combined flows, keeps `place_food_order`, `checkout`, and `book_table` confirmation-gated, uses status tools before retrying uncertain commerce calls, and leaves future Food scheduling as a reminder-time external gate.

The `/api/mcp/state-orchestrator` endpoint turns Swiggy's multi-turn state and voice/chat patterns into explicit safety controls. It rejects agent-memory cart truth, refreshes `get_food_cart` or `get_cart` before mutations and commercial actions, warns before Food restaurant switches, clears Instamart cart state before address switches, refreshes Dineout slots before booking, and prevents raw ids from being spoken on voice surfaces.

The `/api/swiggy-access-dossier` endpoint maps Swiggy's production-access application fields, review checks, ground rules, legal readiness, and developer/enterprise tracks to MealPilot proof artifacts. It also keeps official form submission, final contact details, static IP details, live credentials, and terms acknowledgement marked as manual or external gates.

The `/api/swiggy-access-evidence-matrix` endpoint reconciles that access evidence with Submission Console, Access Submission Studio, and Reviewer Artifact Vault proof. It keeps operator-owned inputs, staging credentials, legal acceptance, handoff email, form submission, and Swiggy approval labelled as manual or external gates instead of pretending repository evidence can complete them.

The `/api/swiggy-faq-policy` endpoint maps Swiggy public FAQ and policy signals into reviewable controls. It ties homepage, developer, enterprise, access-guideline, footer-resource, allowed/restricted/prohibited, operating-principle, legal, and support-contact themes to MealPilot proof routes while keeping enterprise contracts, co-branding, support channels, staging credentials, and production credentials as external gates.

The `/api/swiggy-faq-resolution-center` endpoint turns those FAQ and policy signals into reviewer-ready answers with owners, proof links, activation CTAs, support contact, and a script while keeping form submission, credentials, co-branding, legal, and enterprise approval as operator or Swiggy gates. The `/api/swiggy-faq-resolution-center/answer` endpoint accepts a single reviewer question, matches it to that controlled corpus, returns proof and policy context, blocks blank input, and never submits forms, sends emails, claims credentials, or completes Swiggy approvals from local automation.

The `/api/swiggy-growth-partnership` endpoint keeps growth ambition inside the safety boundary. Co-marketing experiments, feature/showcase asks, hiring narrative, partner analytics, and strategic launch support are mapped to local evidence, metrics, and guardrails; Swiggy approval remains mandatory for public claims, Slack access, partner-manager assignment, analytics dashboards, higher rate limits, and any co-branded launch.

The `/api/swiggy-talent-signal-center` endpoint keeps builder visibility and hiring-readiness claims inside proof boundaries. Demo, GitHub, architecture, metric, visual, and outreach assets are prepared locally, while any hiring conversation, Swiggy feature placement, endorsement, partner channel, or enterprise support remains Swiggy-owned.

The `/api/swiggy-conversion-center` endpoint keeps the final Swiggy Builders conversion funnel inside explicit ownership boundaries. Start Building, See What's Possible, `llms.txt`, and `llms-full.txt` proof can be verified locally, while Request Access form submission, builders@swiggy.in email sends, demo URL hosting, credentials, go-live approval, co-branding, and feature placement stay operator or Swiggy-owned.

The `/api/swiggy-builders-module-intelligence` endpoint keeps public website interpretation separate from live capability claims. Each module can point to local proof, but legal terms, access forms, email sends, production credentials, quotas, co-branding, and feature placement remain operator or Swiggy-owned gates until explicitly approved.

The `/api/swiggy-builders-module-witness` endpoint keeps row-level module proof auditable without claiming source ownership. Live and fallback source states, proof links, CTA mappings, and next actions are visible locally, while browser re-browse, external forms, legal acceptance, credentials, quotas, production approval, and public Swiggy claims remain operator or Swiggy-owned gates.

The `/api/swiggy-builders-navigation-witness` endpoint keeps public navigation and footer proof separate from external action authority. Header/docs/footer links can be normalized and mapped locally, while legal review, email sends, forms, production access, credentials, quotas, and co-branding remain manual operator or Swiggy-owned gates.

The `/api/swiggy-builders-journey-gates` endpoint turns the official Builders journey into explicit ownership gates. MealPilot may prepare Start Building proof, access packets, review evidence, go-live runbooks, and showcase copy, but applying for production access, accepting legal terms, sending email, receiving credentials, going live, and making public Swiggy claims remain operator or Swiggy-owned actions.

The `/api/swiggy-builders-homepage-experience` endpoint keeps section-level website proof honest. Header, hero, how-it-works, benefits, guidelines, FAQ, final CTA, and footer rows can point to local evidence and mobile/reviewer checks, but official navigation, legal pages, forms, email, credentials, quota, brand, and production approvals remain external gates.

The `/api/channel-multimodal-studio` endpoint keeps developer-page innovation lanes inside explicit channel and privacy boundaries. Voice, Slack/Teams, mobile camera, and enterprise surfaces inherit the same confirmation rules as the web app; local execution packets define route plans, response rules, confirmation gates, and telemetry contracts. Screenshot-to-order stores no raw image by default, converts images to user-confirmed labels before Swiggy tool calls, and keeps Slack/Teams installation, vision/OCR approval, and enterprise embedding as external gates.

The `/api/swiggy-visual-dish-capture` endpoint productizes that screenshot-to-order boundary. It accepts only captions and lightweight image names in local proof mode, never raw image bytes, and routes inferred dish/menu/pantry/chat labels through Food search, Instamart ingredient planning, Dineout discovery, or combined journeys only after user confirmation. Live computer-vision classification, staging seeded data, and real Swiggy cart mutations remain external gates until credentials and reviewer approval exist.

The `/api/swiggy-voice-commerce-center` endpoint productizes voice commerce without weakening the safety boundary. It accepts transcribed utterances in local proof mode, never raw audio, limits spoken choices to short TTS scripts, pushes rich detail to card fallbacks, and blocks Food orders, Instamart checkout, and Dineout bookings behind explicit readback confirmation. Live ASR/TTS, microphone permissions, seeded Swiggy voice transcripts, and production traffic remain external gates.

The `/api/swiggy-quality-loop-center` endpoint keeps post-experience learning consented and support-safe. Ratings can influence active-session recovery immediately, but durable preference tags require consent; low-rating issue handling prepares redacted support context without storing full Swiggy payloads, raw order details, full addresses, payment data, or free-form sensitive messages.

The `/api/swiggy-ritual-autopilot-center` endpoint keeps recurring routines as reviewed plans, not subscriptions. Calendar cadence can schedule reminders and draft shortlists, but it cannot place Food orders, check out Instamart carts, book Dineout tables, or trigger any paid/reserved action without a fresh readback and explicit user confirmation.

The `/api/swiggy-payment-truth-center` endpoint keeps settlement copy grounded in Swiggy readbacks. MealPilot can display cart totals, coupon discounts, COD labels, Instamart bill breakdowns, Dineout free-booking proof, and paid-cart gates only when Swiggy cart or status responses prove them; card, UPI, wallet, and other payment-instrument details are never stored.

The `/api/swiggy-meal-window-intelligence` endpoint keeps timing forecasts advisory and non-commercial. Future Food windows are reminders only because no scheduled Food order path is exposed; every order, checkout, or booking still requires fresh Swiggy reads and explicit confirmation in the live meal window, and ETA or slot telemetry is reduced to risk buckets instead of retaining raw payloads.

The `/api/swiggy-customization-studio` endpoint keeps item customization exact and reviewable. Food add-ons and variants must come from fresh `search_menu` or menu responses, Instamart pack sizes must come from fresh product or go-to-item responses, allergy-sensitive substitutions are cautionary rather than guaranteed, and success copy waits for `get_food_cart` or `get_cart` readback.

The `/api/nutrition-budget-intelligence` endpoint keeps premium macro planning inside non-medical, estimate-only boundaries. Protein-per-rupee routes use Food menu/search, COD-safe coupons, Instamart go-to items, product search, and Dineout slots as planning signals, but Swiggy cart reads remain the commercial source of truth before coupon application, checkout, order placement, or booking. Live merchant nutrition fields, real coupon eligibility, stock, serviceability, and camera/OCR labels remain external data gates.

The `/api/household-preference-graph` endpoint keeps personalization inside consented, minimized data boundaries. It stores derived taste, pantry, cadence, area, and failure-class tags only when local preference storage is allowed; raw Swiggy order payloads, full addresses, tokens, payment data, phone, and email are excluded. Food and Instamart cancellation requests are handled with Swiggy customer-care copy rather than MCP tool calls, and Swiggy-originated DSRs remain routed through the Swiggy app while MealPilot deletes derived local data.

The `/api/guest-collaboration-calendar` endpoint keeps group planning separate from commerce execution. Guest votes, share links, calendar artifacts, Slack/Teams digests, and voice briefs exclude raw Swiggy ids, payment data, full addresses, tokens, phone, and email; Dineout reservations, Food orders, and Instamart checkout still require separate user-visible confirmations, and future Food delivery is modeled only as a reminder-time confirmation because Swiggy Food v1 has no scheduled-delivery tool.

The `/api/luxury-experience-workspace` endpoint keeps premium UI polish tied to the same commerce safety rules. Reservation, Food cart, Instamart basket, combined evening, and recovery workspaces must refresh authoritative Swiggy state before commercial calls; enforce Food COD and Rs 1000 cart cap, Instamart Rs 99 minimum and address-scoped serviceability, Dineout free-slot confirmation, non-blind retry, widget fallback gating, voice id suppression, and redacted telemetry.

The `/api/reviewer-artifact-vault` endpoint keeps the Swiggy access packet shareable. Every proof link, screenshot target, command, log, trace, and handoff artifact carries a redaction rule; demo videos and screenshots must blur tokens, browser profiles, notifications, local secrets, full addresses, phone, email, payment data, and raw Swiggy payloads before submission.

The `/api/visual-qa-center` endpoint keeps reviewer screenshot work inside the same safety boundary. It records selectors, viewport sizes, artifact paths, no-overlap rules, text-fit rules, widget fallback checks, mobile layout checks, redaction visibility, and commercial-confirmation visibility so screenshots and demo captures do not expose tokens, secrets, full addresses, phone, email, payment data, or raw Swiggy payloads.

The `/api/brand-compliance-kit` endpoint maps Swiggy attribution and co-branding readiness. It keeps "Powered by Swiggy" copy visible for Swiggy-originated surfaces, avoids false endorsement claims, reserves `#FF5200` for approved Swiggy marks, and keeps logo packs, do/don't sheets, and custom co-branding rights as external onboarding gates.

The `/api/premium-use-case-studio` endpoint turns product innovation into auditable route plans. Every premium playbook lists the Swiggy tools it needs, the call savings expected from route optimization, confirmation gates for commercial actions, data boundaries, and launch stages so luxury use cases do not bypass safety.

The `/api/staging-certification-matrix` endpoint turns launch safety into staged evidence. It assigns all 35 official Swiggy tools to credentialed smoke waves, keeps `place_food_order`, `checkout`, and `book_table` behind non-blind retry evidence, and preserves staging credentials, 48-hour soak, and production approval as external gates.

The `/api/swiggy-staging-replay` and `/api/swiggy-staging-replay/run` endpoints enforce the same boundary at execution time. Only allowlisted read, tracking, cart-read, and `report_error` probes can run; mock responses are labelled dry-run; non-mock mode requires OAuth bearer state; commercial actions are blocked; and responses are represented with hashes plus redaction telemetry instead of raw credential or user payload data.

The `/api/swiggy-hosted-widget-activation` endpoint keeps hosted iframe activation behind explicit safety gates. MealPilot verifies parent-origin policy, iframe sandbox settings, postMessage event origins, semantic fallback parity, no signed widget URL logging, and confirmation routing before hosted widgets can replace local semantic fallbacks.

The `/api/swiggy-live-signal-calibration` endpoint prevents local personalization fixtures from being mistaken for live Swiggy data. It requires read-only Food, Instamart, and Dineout staging probes, privacy redaction, drift thresholds, fallback rules, and 48-hour green soak before real user order, pantry, location, booking, discovery, or offer signals can influence production claims.

The `/api/sessions/:sessionId/staging-transcript` endpoint exports one session as Swiggy-ready JSONL and Markdown with request IDs, session IDs, hashed user identifiers, certification-wave mapping, redaction manifest, and support envelope. It is designed to be safe to attach to `builders@swiggy.in` because raw tokens, payment credentials, full addresses, phone, email, and full tool payloads are excluded.

The `/api/traffic-readiness-plan` endpoint turns launch capacity into auditable evidence. It records expected daily sessions, projected tool calls, peak QPS, per-lane budgets for discovery/cart/commercial/tracking/support/auth traffic, Retry-After behavior, seven-day major-event notice, staged rollout, and the capacity-upgrade email draft.

The `/api/swiggy-load-lab` endpoint validates capacity without generating live upstream Swiggy traffic. It composes Traffic Readiness, Backpressure Governor, and Route Optimizer evidence into synthetic pilot, evening-peak, voice-burst, and campaign-spike scenarios; it preserves Retry-After behavior, commercial single-flight writes, 1% to 100% cohort ramps, and Swiggy capacity approval as explicit gates.

The `/api/swiggy-offer-intelligence` endpoint keeps discounts honest and confirmation-safe. Food coupons are fetched before application and cart totals are re-read after coupon mutations; Dineout deals are treated as discovery and restaurant-detail signals before free booking confirmation; Instamart savings are derived from product variants and cart bill breakdowns rather than undocumented coupon behavior.

The `/api/swiggy-order-lifecycle` endpoint protects users after confirmation. It probes Food and Instamart order-history/detail tools and Dineout booking status before any retry, keeps tracking refreshes at 10 seconds or slower, redacts order and booking identifiers, and turns lifecycle state into support-safe packets.

The `/api/swiggy-location-trust` endpoint protects saved-address and location flows before discovery or checkout. It pauses after Food/Instamart `get_addresses` and Dineout `get_saved_locations` until the user chooses a location, requires explicit intent for address creation or deletion, refreshes carts, coupons, products, restaurants, and Dineout slots on address switches, and keeps raw address lines, coordinates, phone, and address IDs out of logs and support packets.

The `/api/swiggy-cart-mutation-workbench` endpoint protects cart state before commercial action. Food `update_food_cart` and `flush_food_cart` must be followed by `get_food_cart`; Instamart `update_cart` is treated as full-cart replacement and must be followed by `get_cart`; payment methods and coupon savings are surfaced only from cart responses; Dineout `create_cart` remains gated to valid standalone booking or bill-payment contexts.

The `/api/swiggy-discovery-freshness` endpoint protects search and availability truth before cart state exists. Food delivery search is separated from Dineout reservation search; menu browsing uses `get_restaurant_menu` while cart-ready customization comes from `search_menu`; Instamart `search_products` and `your_go_to_items` require explicit variant choice; Dineout details and slots preserve the same coordinates or saved-location context used in search.

The `/api/swiggy-confirmation-command-center` endpoint is the user-visible final-commerce confirmation proof for Food `place_food_order`, Instamart `checkout`, and Dineout `book_table`. It requires fresh `get_food_cart`, `get_cart`, or Dineout slot reads before approval; records explicit user confirmation for each final action; keeps combined Food, Instamart, and Dineout plans as separate approvals; probes order or booking status before retrying an uncertain action; treats payment methods, payment requirement, and free-booking status as true only when returned by Swiggy; and leaves live credentials, staging data, and production execution behind external gates.

The `/api/swiggy-cancellation-care-center` endpoint keeps cancellation and care flows inside official Swiggy boundaries. Food and Instamart cancellation requests show the Swiggy customer-care phone copy and never call a fake MCP cancellation tool; Dineout booking issues use `get_booking_status`; in-session user-reported errors use the matching server's `report_error` with redacted toolContext; and silent developer incidents route to `builders@swiggy.in` with session ids, time range, expected versus actual behavior, and no raw tokens, payment data, full addresses, or full payloads.

The `/api/swiggy-dineout-precision-center` endpoint keeps Dineout commerce paths explicit. Free table bookings require fresh slot evidence with `isFree=true` and `bookingPrice=0` before `book_table`; paid deals are not passed to the free booking path; `create_cart` with `cartType: "DINEOUT"` is treated as a bill-payment cart; ambiguous mutations require `get_booking_status` or `report_error` before retry; and live payment completion remains gated on Swiggy staging credentials.

The `/api/swiggy-auth-lifecycle-center` endpoint keeps OAuth recovery safe. Authorization codes are treated as 120-second single-use values, access tokens as 5-day bearer credentials, refresh-token issuance as unavailable in v1.0, 401/419/403 as re-auth decisions rather than tool retries, and token storage as memory or secure secret storage only. API responses expose token source, scope, and expiry, but never bearer values, OTPs, phone numbers, or Authorization headers.

The `/api/mcp/backpressure-governor` endpoint keeps current and future rate-limit behavior separate. Current Swiggy v1.0 upstream shedding is treated as bounded `UPSTREAM_ERROR` retry behavior; future MCP-layer 429 responses, `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` are reserved as first-class telemetry and governor signals. Tracking calls stay at 10 seconds or slower, voice bursts are shaped before broad search, commercial writes remain single-flight, and background jobs stay disabled until Swiggy approves bespoke ceilings.

The `/api/slo-incident-command` endpoint turns Swiggy SLA and uptime guidance into operational evidence. It maps 99.9% uptime targets, read/write/commercial latency bands, status-page fallback, S0-S3 incident comms, 72-hour maintenance notice, SLO measurement exclusions, and partnership-based remediation.

The `/api/swiggy-operating-contract-center` endpoint keeps the full operating contract in one reviewer surface. It joins SLA, rate limits, support, versioning, changelog, and ship-to-production guidance into pillars, runbooks, readiness gates, a `builders@swiggy.in` launch-review email, and explicit external gates for staging credentials, production approval, status-page polling, capacity upgrades, and enterprise support lanes.

The `/api/data-governance-center` endpoint turns Swiggy Data & Compliance guidance into auditable DPDP posture. It records Swiggy as Data Fiduciary, MealPilot as Data Processor, the India/Singapore residency boundary, tool-call PII inventory, local DSR export/delete actions, Swiggy-originated DSR routing through the Swiggy app, 90-day Swiggy audit-log retention, token redaction, security contacts, cross-border DPA gates, and signed-manifest watch items.

The `/api/audit-ledger` endpoint keeps audit evidence support-safe. It derives redacted session/tool events from MealPilot plan trails, records server, tool, status, duration, route class, and support correlation keys, acknowledges Swiggy-side 90-day audit-log retention, routes Swiggy-originated DSRs back to Swiggy, and omits raw request/response bodies, bearer tokens, addresses, phone, email, and payment data.

The `/api/swiggy-upstream-watch` endpoint keeps shipped Swiggy MCP behavior separate from roadmap behavior. It tracks `llms.txt`, `llms-full.txt`, changelog limitations, v1.1/v1.2/v2 roadmap items, signed manifests, and action queues so online payments, hosted widgets, symbolic codes, rate-limit headers, and manifest signing stay gated until Swiggy ships or approves them.

The `/api/swiggy-source-intelligence` endpoint keeps website, docs, API count, CTA, and credential-gate drift visible before launch. It treats the 35-tool reference docs as the implementation contract, records homepage/count-language differences as non-blocking watch items, and keeps live Swiggy credential approval as an external gate rather than implying production access.

The `/api/swiggy-builders-page-mesh` endpoint treats HTTP 200 as necessary but not sufficient. If a public Builders URL returns Swiggy's generic temporary-glitch shell or misses expected Builders/page signals, MealPilot marks the row as Website Atlas fallback, keeps local reviewer coverage alive, and avoids claiming the page body was semantically verified live.

The `/api/swiggy-llms-manifest-verifier` and `/api/swiggy-tool-parity-auditor` endpoints preserve source-truth evidence during official source outages. If live `llms.txt` returns 403 or is unavailable, MealPilot discloses Docs Coverage fallback, keeps 69 docs pages and 35 reference tools aligned, and never claims a successful live manifest read.

The `/api/swiggy-cta-live-audit` endpoint treats safe Swiggy-origin 403 probes as `watch` evidence rather than blocked CTAs. Unsafe origins, unexpected destinations, form submission, email sends, legal acceptance, and production actions remain blocked or manual gates.

The `/api/swiggy-innovation-radar` endpoint keeps innovation grounded in Swiggy's source material and safety boundaries. Premium lanes such as voice ordering, auto-restock, group lunch, Dineout-first evenings, screenshot-to-order, care meals, and enterprise tenant commerce name their MCP tools, route optimizations, proof surfaces, and staging or partner gates before any production claim is made.

The `/api/mcp/widget-runtime` endpoint keeps hosted widget behavior explicit and gated. MealPilot models Food, Instamart, and Dineout iframe surfaces, verifies postMessage origin as `https://mcp.swiggy.com`, omits `allow-top-navigation`, avoids parent-to-iframe DOM access, serves semantic data-envelope fallbacks, exposes activation checks and render contracts, and disables widget rendering on voice surfaces until Swiggy-hosted iframe URLs and opt-in headers are live.

The `/api/swiggy-widget-experience-composer` endpoint keeps the user-facing widget experience reviewable without loosening those gates. It turns each runtime surface into desktop, tablet, mobile, voice, and reviewer placements, but still routes commercial events through fresh reads and explicit confirmations while hosted iframe URLs, parent-origin approval, and `X-Swiggy-Widgets` stay external gates.

The `/api/swiggy-agent-experience-benchmark` endpoint keeps premium and competitive claims tied to proof. It scores journeys only against local evidence from route optimization, use-case blueprints, commercial guards, widget fallbacks, and review artifacts; live cohort benchmarks, co-branding claims, and hosted-widget superiority claims remain gated on Swiggy staging credentials, operator-run pilots, and production approval.

The `/api/swiggy-private-pilot-control-room` endpoint keeps real-user pilot planning explicit without storing participant identities in the repo. It counts consent artifacts, maps success metrics, names support paths, and keeps live cohort results, participant manifests, staging credentials, and any public launch claim gated outside local proof until Swiggy and the operator approve the pilot.

The `/api/mcp/commercial-action-guard` endpoint keeps Food order placement, Instamart checkout, Dineout booking, and combined commercial journeys behind explicit confirmation locks. It maps each non-idempotent action to a fresh authoritative read, a verification tool, a check-then-retry drill, redacted telemetry fields, and support packet context so ambiguous 5xx or network failures cannot create duplicate orders or bookings.

The `/api/mcp/resource-prompt-studio` endpoint keeps `mcp:resources` and `mcp:prompts` evidence reviewable without implying live Swiggy ownership. Local `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` samples can be used for verifier proof, but live server resources, prompt templates, hosted widget URLs, and metadata freshness remain gated on Swiggy staging credentials and production review.

The `/api/mcp/staging-cutover` endpoint keeps real Swiggy traffic separate from local proof. It rehearses first read-only MCP probes for Food, Instamart, and Dineout, requires OAuth bearer state for non-mock routing, documents 401 re-auth, 429 Retry-After, 5xx/network retry branches, prepares support packet fields for builders@swiggy.in, and keeps seeded staging data, 48-hour green telemetry, and production credentials marked as external gates.

The `/api/swiggy-staging-credential-drill` endpoint keeps the first live credential run bounded. It composes credential signal, read-only JSON-RPC first calls, seeded-data requirements, operator commands, and handoff copy without attempting to mint credentials, fake seeded users, or run commercial actions before Swiggy issues staging access.

The `/api/premium-concierge-itinerary` endpoint turns Swiggy's official Food, Instamart, Dineout, and combined recipes into a premium operating timeline without weakening safety. It keeps cart refreshes at turn boundaries, treats Food scheduling as a reminder until Swiggy ships a scheduling flow, and preserves separate confirmations for `place_food_order`, `checkout`, and `book_table`.

The `/api/enterprise-delegated-auth` endpoint keeps the enterprise on-behalf-of boundary explicit. Swiggy remains the Data Fiduciary; MealPilot/platform storage is limited to scoped per-user session state. Each end user gets a fresh PKCE verifier/challenge, one Swiggy authorization code exchange, one per-user bearer token, and a logout/delete path. Tokens are never shared across users, passwords/OTPs/payment credentials never pass through MealPilot, 401/419/403 failures trigger re-auth or entitlement review, and platform-operator approval, capacity ceilings, final redirect allowlists, partner contracts, staging credentials, and production cutover remain external gates.

The `/api/enterprise-platform-center` endpoint keeps platform-scale operation honest. Tenant ids, workspace ids, Swiggy session ids, and end-user OAuth grants stay separated; support packets stay redacted; quota profiles are tenant-scoped; audit exports expose request ids and support correlation rather than raw payloads; and enterprise-only Slack, dashboards, co-branding assets, designated contacts, bespoke remedies, and commercial terms remain external gates until Swiggy approves them.

The `/api/evaluation-lab` endpoint regression-tests the product against multiple user scenarios before review:

- Chat and voice response shaping.
- Budget fit across Bengaluru, Delhi NCR, and Mumbai.
- Confirmation gates for all commercial actions.
- Preflight checks before cart, checkout, or booking actions.
- Redacted audit detail with no token, payment, phone, or full-address leakage.

## Rate Limits And Traffic

Initial pilot target:

- Below 1 QPS peak.
- Poll tracking no faster than every 10 seconds.
- Run Swiggy Load Lab before each invite ramp or campaign and block campaign-scale traffic until Swiggy confirms capacity.
- Honor `Retry-After` on 429 once MCP-layer throttling ships.
- Cap user-facing retries at 30 seconds.
- Ramp production traffic 1% -> 10% -> 50% -> 100% over at least 24 hours.
- Do not launch public campaigns without notifying Swiggy at least seven days in advance.
- Avoid planned maintenance during 12:00-14:00 and 19:00-22:00 IST meal windows.
- Escalate S0/S1 production failures with session ids, request ids, timestamps, and affected Swiggy servers.

## Data Minimization

MealPilot stores:

- Dietary preferences.
- Budget bands.
- Cuisine preferences.
- High-level location labels such as home or office.
- Redacted session IDs only for support correlation and local proof artifacts.

MealPilot does not store by default:

- Full Swiggy order payloads.
- Raw address strings beyond what is needed in active session state.
- Payment credentials.
- Swiggy session IDs as internal business identifiers.
- Swiggy-originated data for analytics, advertising, or model training.

## Logging

Logs may include:

- Internal hashed user ID.
- Tool name.
- Latency.
- Result status.
- Trace ID.
- Swiggy session ID only as a support identifier.

Logs must not include:

- OAuth tokens.
- Full addresses.
- Payment details.
- Raw user messages that contain sensitive personal information.

## Abuse Prevention

MealPilot will not:

- Scrape Swiggy.
- Bulk export restaurant, menu, or catalogue data.
- Benchmark Swiggy against competitors.
- Resell Swiggy data.
- Hide order placement behind ambiguous UI.
- Auto-order without user confirmation.
