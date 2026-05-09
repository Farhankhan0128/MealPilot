# Development

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm start
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
    confirmationService.ts
    pkce.ts
  store/
    sessionStore.ts
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

## API

- `GET /api/health`
- `GET /api/config`
- `POST /api/plan`
- `GET /api/sessions/:sessionId`
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
- `GET /api/privacy/export`
- `DELETE /api/privacy`
- `POST /api/mcp/:server`
- `POST /api/auth/swiggy/start`
- `GET /api/auth/swiggy/callback`

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
- The React UI loads server-generated plans and confirms through the API.
- All commercial actions require explicit confirmation.
- Confirming one recommendation does not silently confirm the others.
- Order-placement class tools are not blindly retried.
