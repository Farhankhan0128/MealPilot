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

## Retry Policy

Safe to retry:

- Search requests.
- Menu or catalogue reads.
- Availability checks.

Unsafe to retry blindly:

- Food order placement.
- Instamart checkout.
- Dineout table booking.
- Any tool call that mutates cart state without first checking the current cart.

For non-idempotent calls, MealPilot records the attempted action and asks the user to verify the result before trying again.

The `/api/resilience` endpoint turns this policy into executable demo evidence:

- 5xx and upstream timeout backoff for safe read tools.
- 429 `Retry-After` handling without extra burst traffic.
- 401 and JSON-RPC auth recovery through OAuth PKCE.
- Check-then-retry for `place_food_order`, `checkout`, and `book_table`.
- Version/deprecation alerting through `_meta.swiggy.deprecation`.

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
- Backoff on 429.
- Do not launch public campaigns without notifying Swiggy in advance.

## Data Minimization

MealPilot stores:

- Dietary preferences.
- Budget bands.
- Cuisine preferences.
- High-level location labels such as home or office.

MealPilot does not store by default:

- Full Swiggy order payloads.
- Raw address strings beyond what is needed in active session state.
- Payment credentials.
- Swiggy session IDs as internal business identifiers.

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
