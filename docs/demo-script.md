# Demo Script

Target length: 2-3 minutes.

## Recording Setup

- Browser: `http://localhost:5173`
- App state: fresh user session.
- Demo city: Bengaluru or Delhi NCR.
- Persona: vegetarian professional planning meals for the week.

## Script

### 1. Open The Product

Show the MealPilot interface. The first screen should already be the planning workspace, not a marketing page.

Voiceover:

> MealPilot is an AI commerce assistant that composes Swiggy Food, Instamart, and Dineout into a single safe meal-planning flow.

### 2. Enter The User Ask

Prompt:

```text
Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, dinner groceries for tonight, and a Dineout option for Saturday evening.
```

Show the agent extracting:

- Budget.
- Diet.
- Timing.
- Food order.
- Grocery basket.
- Dineout reservation intent.

### 3. Show Tool Composition

Show the three planning cards:

- Food: lunch recommendation and cart preview.
- Instamart: dinner ingredients basket.
- Dineout: Saturday table options.

Voiceover:

> The agent can prepare each commerce action, but it cannot complete any order or booking until the user confirms that specific action.

### 4. Show User Control

Change budget from Rs 2,000 to Rs 1,700.

Show the plan adjusting:

- Lower grocery basket total.
- Food item substitution.
- Dineout recommendation still available but not automatically booked.

### 5. Confirm One Safe Action

Click confirm for the Food cart only.

Show:

- Confirmation modal.
- Restaurant name.
- Items.
- Delivery address label.
- Estimated total.

Do not show a real payment or production order unless staging credentials explicitly allow it.

### 6. Show Safety Logs

Show developer console or observability panel with:

- Tool names.
- Status codes.
- Trace IDs.
- No raw PII.
- 401 and 429 handling notes.

### 7. Close

Voiceover:

> We are requesting access to Food, Instamart, and Dineout servers for a private pilot. Our expected traffic is below 1 QPS, with staging validation before production use.

## Submission Checklist

- Add the GitHub repo link.
- Add the demo video link.
- Add production redirect URI.
- Add primary engineering contact email.
- Confirm requested servers: `food`, `instamart`, `dineout`.
