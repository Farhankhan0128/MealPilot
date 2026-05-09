# Roadmap

## Phase 0: Builder Access Packet

Status: ready.

- Define use case and target users.
- Prepare GitHub repository.
- Document safety, privacy, traffic, and OAuth plan.
- Add static prototype for the demo journey.

## Phase 1: Local Prototype

Target: 2-4 days.

- Add local dev stub for Food, Instamart, and Dineout responses.
- Connect UI to a small backend agent API.
- Add structured planning state.
- Add explicit confirmation modals for all risky actions.
- Add trace IDs and redacted logs.

## Phase 2: Swiggy Staging

Target: after Swiggy issues staging credentials.

- Replace local stub URLs with staging MCP URLs.
- Complete OAuth 2.1 PKCE flow.
- Validate 401 handling across all three servers.
- Validate 429 backoff behavior.
- Run 48-hour staging soak with seeded users and low traffic.

## Phase 3: Private Pilot

Target: 50-100 users.

- Invite a small user group in Bengaluru, Delhi NCR, and Mumbai.
- Measure successful plans, cart confirmations, and abandoned confirmations.
- Collect qualitative feedback on trust, usefulness, and clarity.
- Keep peak traffic below 1 QPS.

## Phase 4: Production Readiness

- Finalize HTTPS redirect URI.
- Move secrets to managed storage.
- Add audit dashboard.
- Add user preference export and deletion.
- Prepare Swiggy notification plan for any launch campaign.
