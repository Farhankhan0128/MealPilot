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
- Express API that owns planning sessions, confirmations, OAuth start/callback, and mock MCP routes.
- Mock Swiggy MCP JSON-RPC endpoint for localhost demos before credentials are issued.
- Swiggy staging/production endpoint map for the eventual MCP swap.
- OAuth 2.1 PKCE helper for the Swiggy authorization flow.
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
- MCP Gateway status center for mock-to-staging-to-production cutover, endpoint routing, bearer-token posture, and canary rollout.
- Chat and voice response simulator that applies separate contracts for card-rich UI and spoken assistant flows.
- Go-live command center with credential, OAuth, confirmation, idempotency, observability, rollout, and privacy checks.
- Observability metrics for tool latency, success rate, confirmed actions, traceable sessions, reminder queue, and credential mode.
- Support report generator that creates a Swiggy-ready `builders@swiggy.in` escalation mail with session IDs.
- Demo Studio with cart preflight checks, offer opportunities, MCP replay transcripts, demo progress, and submission-field readiness.
- Evaluation Lab with multi-scenario persona QA across Bengaluru, Delhi NCR, Mumbai, chat, voice, lean budgets, and same-day cart-safety turns.
- JSON-RPC replay endpoint that shows the exact tool-call shape MealPilot will use when Swiggy staging credentials are issued.
- Builder Access submission package endpoint that mirrors Swiggy's requested application fields and highlights manual inputs.
- Production Evidence panel with widget contracts, rate-limit budgets, version/deprecation monitoring, compliance controls, and reviewer proof score.
- Swiggy widget contract generator with semantic fallbacks for Food restaurant/cart, Instamart product/cart, and Dineout slot surfaces.
- Rate-limit plan aligned to planned developer-tier ceilings, including per-user, write-tool, client-day, and tracking-poll budgets.
- Version monitor for v1 route pinning, 180-day deprecation windows, and `_meta.swiggy.deprecation` alert readiness.
- DPDP-oriented compliance evidence for consent, PII minimization, deletion, audit logging, and training-data exclusion.
- OpenAPI 3.1 contract, readiness probe, security headers, and request IDs for production review.
- Executable Resilience Lab for Swiggy's 5xx retry, 429 Retry-After, 401 reauth, non-idempotent check-then-retry, and deprecation-monitoring checklist.
- Dockerfile, Render blueprint, GitHub Actions CI, and automated production smoke verification.
- Optional file-backed persistence with snapshot export, restore, compaction, retention, and storage diagnostics.
- Privacy export and local data deletion endpoints.
- Ops status dashboard for API, MCP mode, sessions, and reminders.
- Builder Access package endpoint with readiness evidence.
- Markdown export for the Builder Access packet.
- Audit timeline with tool names, session IDs, and redacted details.
- Vitest coverage for planner behavior, API behavior, UI/API integration, and retry safety.

## Repository Map

- [`src/`](src/): runnable MealPilot app and Swiggy integration layer.
- [`server/`](server/): Express API, session store, OAuth helper, and local MCP mock.
- [`docs/builder-access-application.md`](docs/builder-access-application.md): copy-ready Swiggy Builders Club application details.
- [`docs/demo-script.md`](docs/demo-script.md): 2-3 minute demo recording flow.
- [`docs/architecture.md`](docs/architecture.md): agent architecture and Swiggy MCP integration model.
- [`docs/safety-and-compliance.md`](docs/safety-and-compliance.md): order confirmation, PII, OAuth, traffic, and abuse-prevention plan.
- [`docs/roadmap.md`](docs/roadmap.md): MVP, staging, and production path.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): lint, test, build, and production smoke workflow.
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

Docker run:

```bash
docker build -t mealpilot .
docker run --rm -p 8787:8787 mealpilot
```

Useful demo endpoints:

```text
GET  /api/mcp/catalog
GET  /api/ready
GET  /api/openapi.json
GET  /api/go-live
GET  /api/mcp-gateway
GET  /api/sessions/:sessionId/surface?surface=chat
GET  /api/sessions/:sessionId/surface?surface=voice
GET  /api/sessions/:sessionId/preflight
GET  /api/sessions/:sessionId/replay
GET  /api/demo-studio
GET  /api/evaluation-lab
GET  /api/submission-package
GET  /api/sessions/:sessionId/widgets
GET  /api/rate-limit-plan
GET  /api/version-monitor
GET  /api/compliance-evidence
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
4. Confirm one action, refresh tracking, and show the audit timeline with session IDs.
5. Open Demo Studio and show cart preflight, coupon opportunities, MCP replay, and submission readiness.
6. Open Production Evidence and show widgets, rate limits, version monitor, compliance controls, Resilience Lab, Evaluation Lab, and reviewer proof score.
7. Schedule reminders, open Go-Live Gates, then export the Builder Access packet.
8. Generate a support report to show how a production issue would be escalated with traceable session context.

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

## Current Status

Runnable full-stack localhost app, optional durable persistence, 35-tool Swiggy MCP coverage map, staging/production MCP gateway, builder access proposal, technical packet, safety plan, launch readiness dashboard, demo studio, production evidence center, executable resilience drills, multi-scenario evaluation lab, submission package, support workflow, and tests are ready. Next step: record the 2-3 minute demo and submit the Swiggy Builders Club access form with the GitHub repo and packet export.

CI/CD and deploy assets are included: GitHub Actions runs lint, tests, build, and production smoke verification; Docker serves the built frontend and API from one container; Render can deploy from `render.yaml` after Swiggy credentials are issued.

## Official References

- Swiggy Builders Club: https://mcp.swiggy.com/builders/
- Access and onboarding: https://mcp.swiggy.com/builders/docs/operate/access/
- Developer start guide: https://mcp.swiggy.com/builders/docs/start/
- Authenticate: https://mcp.swiggy.com/builders/docs/start/authenticate/
- Combined Food + Dineout recipe: https://mcp.swiggy.com/builders/docs/build/recipes/combined/
- Ship to production: https://mcp.swiggy.com/builders/docs/build/ship-to-production/
