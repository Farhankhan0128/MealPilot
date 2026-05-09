# Development

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

## App Structure

```text
src/
  App.tsx
  styles.css
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
```

## Swiggy Modes

MealPilot starts in mock mode so the builder-access demo works before credentials are issued.

```text
VITE_SWIGGY_ENV=mock
```

After staging credentials:

```text
VITE_SWIGGY_ENV=staging
VITE_SWIGGY_CLIENT_ID=<issued-client-id>
VITE_SWIGGY_REDIRECT_URI=http://localhost:5173/auth/swiggy/callback
```

Production should use an HTTPS redirect URI with exact-match allowlisting.

## Safety Tests

The test suite checks that:

- MealPilot composes Food, Instamart, and Dineout recommendations.
- All commercial actions require explicit confirmation.
- Confirming one recommendation does not silently confirm the others.
- Order-placement class tools are not blindly retried.
