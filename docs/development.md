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
```

## App Structure

```text
src/
  App.tsx
  styles.css
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
    confirmationService.ts
    demoStudio.ts
    openApi.ts
    pkce.ts
    productionEvidence.ts
  store/
    sessionStore.ts
scripts/
  verify-production.mjs
```

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

The verifier creates a plan, checks 35-tool coverage, validates preflight/replay/widgets/submission evidence, runs resilience-drill and evaluation-lab assertions, and asserts reviewer proof remains above target.

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
- `GET /api/demo-studio`
- `GET /api/evaluation-lab`
- `GET /api/submission-package`
- `GET /api/rate-limit-plan`
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

## Safety Tests

The test suite checks that:

- MealPilot composes Food, Instamart, and Dineout recommendations.
- `/api/plan`, `/api/confirm`, and `/api/mcp/:server` work end to end.
- Profile, substitution, confirm-all, tracking, and Builder Access package routes work end to end.
- Pantry, group planning, scheduling, ops, privacy, markdown export, and OAuth callback routes work end to end.
- Readiness, OpenAPI, preflight, replay, widgets, submission, rate-limit, version, compliance, and reviewer proof routes work end to end.
- Resilience drills cover safe 5xx retries, 429 Retry-After handling, 401 reauth, non-idempotent check-then-retry, and deprecation monitoring.
- Evaluation Lab checks multi-persona city coverage, voice-safe responses, budget fit, preflight gates, confirmation locks, and PII minimization.
- File-backed storage persists plans across server instances and exposes export/compaction diagnostics.
- The React UI loads server-generated plans and confirms through the API.
- All commercial actions require explicit confirmation.
- Confirming one recommendation does not silently confirm the others.
- Order-placement class tools are not blindly retried.
