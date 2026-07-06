# MealPilot Agent Rules

These rules keep every coding-agent change grounded in the current Swiggy Builders Club contract.

## Swiggy Documentation Contract

- Start with the official docs index before adding or changing Swiggy MCP code: https://mcp.swiggy.com/builders/llms.txt
- Use the full text only for broad sweeps: https://mcp.swiggy.com/builders/llms-full.txt
- Prefer a page-specific Markdown twin when the area is known. Append `.md` to the rendered docs URL.
- Coding-agent setup guidance lives at https://mcp.swiggy.com/builders/docs/start/coding-agents/
- Tool schemas live under `/builders/docs/reference/food/`, `/builders/docs/reference/instamart/`, and `/builders/docs/reference/dineout/`.
- Auth, error, rate-limit, and production behavior must be checked from:
  - https://mcp.swiggy.com/builders/docs/start/authenticate/
  - https://mcp.swiggy.com/builders/docs/reference/errors/
  - https://mcp.swiggy.com/builders/docs/operate/rate-limits/
  - https://mcp.swiggy.com/builders/docs/build/ship-to-production/

## Non-Negotiable Build Rules

- Never invent Swiggy tool names, parameters, scopes, retry behavior, rate limits, auth flow, or error codes.
- Before recommending any Swiggy tool name, parameter, error code, rate limit, or auth behavior, fetch or verify the relevant official page.
- Keep the current reference-count smoke test in mind: Food exposes 14 tools, Instamart exposes 13 tools, and Dineout exposes 8 tools, for 35 callable reference tools.
- Treat broad homepage language such as 18+ as marketing language; the reference docs and Tool Lab contract are authoritative for MealPilot implementation.
- Commercial actions require explicit user confirmation before execution: `place_food_order`, `checkout`, and `book_table`.
- Do not log tokens, auth codes, phone numbers, emails, payment data, exact addresses, raw coordinates, or raw Swiggy payloads.
- Local mocks are allowed until Swiggy credentials are issued, but staging/production gates must remain visible and fail closed.

## Smoke Test

Before merging Swiggy integration changes, run the local gates and verify the governance endpoint:

```bash
curl -s https://mcp.swiggy.com/builders/llms.txt
npm run verify:production
curl -s http://localhost:8787/api/coding-agent-governance
```

