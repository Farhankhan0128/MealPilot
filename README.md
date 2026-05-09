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

## Environment

Copy `.env.example` to `.env.local` when credentials are issued:

```text
SWIGGY_ENV=mock
SWIGGY_CLIENT_ID=replace_after_builder_access
SWIGGY_REDIRECT_URI=http://localhost:5173/auth/swiggy/callback
SWIGGY_SCOPE=mcp:tools mcp:resources mcp:prompts
VITE_SWIGGY_ENV=mock
VITE_SWIGGY_CLIENT_ID=replace_after_builder_access
VITE_SWIGGY_REDIRECT_URI=http://localhost:5173/auth/swiggy/callback
VITE_SWIGGY_SCOPE=mcp:tools mcp:resources mcp:prompts
```

## Current Status

Runnable full-stack localhost app, builder access proposal, technical packet, safety plan, and tests are ready. Next step: record the 2-3 minute demo and submit the Swiggy Builders Club access form.

## Official References

- Swiggy Builders Club: https://mcp.swiggy.com/builders/
- Access and onboarding: https://mcp.swiggy.com/builders/docs/operate/access/
- Developer start guide: https://mcp.swiggy.com/builders/docs/start/
- Authenticate: https://mcp.swiggy.com/builders/docs/start/authenticate/
- Combined Food + Dineout recipe: https://mcp.swiggy.com/builders/docs/build/recipes/combined/
- Ship to production: https://mcp.swiggy.com/builders/docs/build/ship-to-production/
