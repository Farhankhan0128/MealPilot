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
- Separate MCP clients for Food, Instamart, and Dineout.
- Local 35-tool MCP coverage map aligned to Food, Instamart, and Dineout reference docs.
- Chat and voice surface response contracts to avoid long spoken lists or exposed internal IDs.
- Cart preflight checks for budget, location label, payment scope, item readiness, confirmation status, and substitutions.
- MCP replay transcripts that expose the JSON-RPC `tools/call` shape for local review and staging migration.
- Submission package generator for access-form fields, application links, and manual-input gaps.
- Widget contract generator for Food, Instamart, and Dineout surfaces with iframe sizing, sandbox policy, origin verification, and semantic fallbacks.
- Rate-limit plan for per-user, write-tool, client-day, and tracking-poll budgets.
- Version/deprecation monitor for v1 route pinning, 180-day deprecation windows, and `_meta.swiggy.deprecation` alerts.
- DPDP-oriented compliance evidence for consent, minimization, deletion, audit logging, and no model-training use of Swiggy-originated data.
- OpenAPI 3.1 contract, readiness probe, request IDs, and security headers.
- GitHub Actions CI, Dockerfile, Render blueprint, and production smoke verification script.
- Optional file-backed persistence with versioned snapshots, restore, compaction, retention, and storage diagnostics.
- Confirmation gates before `place_food_order`, Instamart checkout, or `book_table`.
- Safe retry policy: no blind retries for non-idempotent order or booking actions.
- 401 handling: re-run OAuth once and refresh all MCP clients.
- 429 handling: backoff, degrade gracefully, and respect Swiggy rate limits.
- OpenTelemetry traces with Swiggy session IDs treated as support identifiers only.
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
6. Launch Center shows 35-tool coverage, chat/voice behavior, go-live gates, and observability metrics.
7. Demo Studio shows cart preflight, MCP replay, and submission readiness.
8. Production Evidence shows widgets, rate limits, versioning, compliance, and reviewer proof score.
9. Show `/api/ready`, `/api/openapi.json`, and `npm run verify:production`.
10. Show storage diagnostics and snapshot export in `/api/storage/status` and `/api/storage/export`.
11. Logs show trace IDs, no raw PII, and safe error handling.

## Primary Technical Contact

Farhan Khan

Email: add primary engineering email before submission.

## Application Links

- GitHub: https://github.com/Farhankhan0128/MealPilot
- Demo video: add Loom, Drive, or unlisted YouTube link before submission.
