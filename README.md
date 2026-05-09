# MealPilot

MealPilot India is a privacy-first AI commerce assistant for Indian households and busy professionals. It helps users plan meals, build grocery baskets, order food, and plan dining experiences through Swiggy MCP.

This repository is built as a Swiggy Builders Club access packet: a concrete real-user use case, a safe confirmation-first commerce flow, a local prototype, and a production-minded technical plan for Food, Instamart, and Dineout.

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

## Repository Map

- [`docs/builder-access-application.md`](docs/builder-access-application.md): copy-ready Swiggy Builders Club application details.
- [`docs/demo-script.md`](docs/demo-script.md): 2-3 minute demo recording flow.
- [`docs/architecture.md`](docs/architecture.md): agent architecture and Swiggy MCP integration model.
- [`docs/safety-and-compliance.md`](docs/safety-and-compliance.md): order confirmation, PII, OAuth, traffic, and abuse-prevention plan.
- [`docs/roadmap.md`](docs/roadmap.md): MVP, staging, and production path.
- [`prototype/`](prototype/): lightweight static localhost demo for the reviewer-facing walkthrough.

## Local Prototype

The static prototype is intentionally dependency-free so it can be opened immediately:

```bash
cd prototype
python3 -m http.server 5173
```

Then visit:

```text
http://localhost:5173
```

The prototype shows the intended multi-step Swiggy MCP flow and the mandatory confirmation gates before checkout or booking.

## Current Status

Initial builder access proposal and technical packet are ready. Next step: connect the static prototype to a local Swiggy MCP dev stub, record the demo, and submit the Swiggy Builders Club access form.

## Official References

- Swiggy Builders Club: https://mcp.swiggy.com/builders/
- Access and onboarding: https://mcp.swiggy.com/builders/docs/operate/access/
- Developer start guide: https://mcp.swiggy.com/builders/docs/start/
- Combined Food + Dineout recipe: https://mcp.swiggy.com/builders/docs/build/recipes/combined/
