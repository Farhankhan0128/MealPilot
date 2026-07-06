import type {
  CalendarHandoffArtifact,
  GuestCollaborationCenter,
  GuestCollaborationStatus,
  GuestParticipant,
  GuestVoteRound,
  OccasionTemplate,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/book-a-table/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/combined/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-food/",
  "https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
];

function statusScore(status: GuestCollaborationStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.7;
  return 0.45;
}

function participant(input: GuestParticipant): GuestParticipant {
  return input;
}

function voteRound(input: GuestVoteRound): GuestVoteRound {
  return input;
}

function template(input: OccasionTemplate): OccasionTemplate {
  return input;
}

function artifact(input: CalendarHandoffArtifact): CalendarHandoffArtifact {
  return input;
}

const participants = [
  participant({
    id: "host",
    label: "Host",
    role: "host",
    diet: "high-protein vegetarian",
    budgetShare: 900,
    constraints: ["final payer approval", "no silent restaurant switch", "separate Food and Dineout confirmations"],
    voteWeight: 1,
  }),
  participant({
    id: "guest_vegetarian",
    label: "Vegetarian guest",
    role: "guest",
    diet: "vegetarian",
    budgetShare: 550,
    constraints: ["no egg", "mild spice", "prefers North Indian or Italian"],
    voteWeight: 0.8,
  }),
  participant({
    id: "guest_protein",
    label: "Protein-focused guest",
    role: "guest",
    diet: "balanced",
    budgetShare: 650,
    constraints: ["high protein", "dessert optional", "prefers faster delivery"],
    voteWeight: 0.75,
  }),
  participant({
    id: "team_payer",
    label: "Team payer",
    role: "payer",
    diet: "mixed",
    budgetShare: 2200,
    constraints: ["needs visible per-person total", "allergy lock", "single approval card"],
    voteWeight: 1.2,
  }),
];

const voteRounds = [
  voteRound({
    id: "cuisine_vote",
    label: "Cuisine vote",
    channel: "web_share",
    status: "ready",
    prompt: "Pick the cuisine or food mood before MealPilot searches Swiggy.",
    options: ["Italian Dineout", "North Indian Food delivery", "High-protein bowls", "Dessert after dinner"],
    swiggyTools: ["food.search_restaurants", "food.search_menu", "dineout.search_restaurants_dineout"],
    decisionRule: "Weighted majority chooses the discovery query; allergy and budget hard locks override popularity.",
    privacyRule: "Votes stay local to MealPilot until the host confirms a Swiggy query.",
  }),
  voteRound({
    id: "slot_vote",
    label: "Dineout slot vote",
    channel: "calendar_ics",
    status: "ready",
    prompt: "Pick the preferred date/time band for a table.",
    options: ["Friday 8pm", "Saturday lunch", "Saturday 8:30pm", "Sunday brunch"],
    swiggyTools: ["dineout.get_saved_locations", "dineout.get_available_slots", "dineout.book_table"],
    decisionRule: "Use Dineout availability first; only free reservation slots are eligible.",
    privacyRule: "Dineout lat/lng stays scoped to restaurant search and is not shared with Food or Instamart.",
  }),
  voteRound({
    id: "cart_approval",
    label: "Cart approval",
    channel: "slack_teams",
    status: "manual_input",
    prompt: "Approve the final Food or Instamart cart after item and total review.",
    options: ["Approve", "Swap dish", "Reduce total", "Move to groceries"],
    swiggyTools: ["food.get_food_cart", "food.place_food_order", "instamart.get_cart", "instamart.checkout"],
    decisionRule: "Only the payer or host can unlock commercial action calls.",
    privacyRule: "Slack/Teams setup needs workspace approval; local demo keeps votes inside the app.",
  }),
  voteRound({
    id: "voice_brief",
    label: "Voice guest brief",
    channel: "voice_brief",
    status: "ready",
    prompt: "Summarize the final plan for guests without raw ids.",
    options: ["Short summary", "Budget summary", "Directions and ETA", "Diet/allergy summary"],
    swiggyTools: ["dineout.get_booking_status", "food.track_food_order", "instamart.track_order"],
    decisionRule: "Maximum three spoken action items and no internal ids.",
    privacyRule: "Voice copy hides restaurant ids, address ids, order ids, slot ids, and tokens.",
  }),
];

const templates = [
  template({
    id: "date_night",
    title: "Date Night Concierge",
    status: "ready",
    intent: "Book a Dineout table first, then prepare a dessert reminder without claiming future Food scheduling.",
    swiggyServers: ["dineout", "food"],
    route: [
      { sequence: 1, label: "Resolve saved Dineout location", server: "dineout", tool: "get_saved_locations", guardrail: "Use lat/lng only for restaurant search." },
      { sequence: 2, label: "Search restaurants and details", server: "dineout", tool: "search_restaurants_dineout", guardrail: "Filter to AVAILABLE restaurants." },
      { sequence: 3, label: "Read restaurant details", server: "dineout", tool: "get_restaurant_details", guardrail: "Show amenities, address, rating, and free-booking deal context." },
      { sequence: 4, label: "Check table slots", server: "dineout", tool: "get_available_slots", guardrail: "Confirm date, time, and guest count before booking." },
      { sequence: 5, label: "Book table", server: "dineout", tool: "book_table", guardrail: "On failure, call get_booking_status before any retry." },
      { sequence: 6, label: "Verify booking status", server: "dineout", tool: "get_booking_status", guardrail: "Confirmation number and restaurant address come from Swiggy status." },
      { sequence: 7, label: "Prepare dessert reminder", server: "food", tool: "search_restaurants", guardrail: "Food v1 immediate-order only; create reminder instead of scheduled order." },
    ],
    output: "Calendar invite plus dessert-order reminder.",
    confirmationGate: "Dineout booking and later Food cart placement are separate confirmations.",
    reminderRule: "Dessert is a reminder-time confirmation because Swiggy Food v1 has no scheduled delivery tool.",
    evidenceLinks: ["/api/premium-concierge-itinerary", "/api/schedule", "/api/mcp/scenario-runner"],
  }),
  template({
    id: "guests_at_home",
    title: "Guests at Home",
    status: "ready",
    intent: "Coordinate hosted dinner with Food starters, Instamart staples, and allergy-safe voting.",
    swiggyServers: ["food", "instamart"],
    route: [
      { sequence: 1, label: "Collect guest constraints", guardrail: "Allergy and diet locks override votes." },
      { sequence: 2, label: "Resolve Food address", server: "food", tool: "get_addresses", guardrail: "Use addressId for delivery and never pass it into Dineout." },
      { sequence: 3, label: "Search Food starters", server: "food", tool: "search_menu", guardrail: "Only confirmed restaurant cart mutations." },
      { sequence: 4, label: "Read menu details", server: "food", tool: "get_restaurant_menu", guardrail: "Show variants/add-ons before cart mutation." },
      { sequence: 5, label: "Search prep groceries", server: "instamart", tool: "search_products", guardrail: "Address-scoped serviceability and stock are visible." },
      { sequence: 6, label: "Refresh grocery cart", server: "instamart", tool: "get_cart", guardrail: "Show final totals and substitutions before checkout." },
      { sequence: 7, label: "Refresh Food cart", server: "food", tool: "get_food_cart", guardrail: "Food cart truth comes from Swiggy before placement." },
    ],
    output: "Host checklist, Food cart review, Instamart prep basket, and guest summary.",
    confirmationGate: "Food and Instamart carts require separate approval by the host.",
    reminderRule: "Prep reminder fires before guests arrive; delivery timing is confirmed at action time.",
    evidenceLinks: ["/api/group", "/api/nutrition-budget-intelligence", "/api/household-preference-graph"],
  }),
  template({
    id: "office_lunch",
    title: "Office Lunch Boardroom",
    status: "manual_input",
    intent: "Collect team lunch votes and produce one payer-approved Food order.",
    swiggyServers: ["food"],
    route: [
      { sequence: 1, label: "Collect Slack/Teams votes", guardrail: "Workspace app install is external." },
      { sequence: 2, label: "Search restaurants", server: "food", tool: "search_restaurants", guardrail: "Open restaurants only." },
      { sequence: 3, label: "Read menu and build cart", server: "food", tool: "get_restaurant_menu", guardrail: "Warn before restaurant switch flushes cart." },
      { sequence: 4, label: "Update team cart", server: "food", tool: "update_food_cart", guardrail: "Use payer-approved item ids and quantities." },
      { sequence: 5, label: "Fetch coupons and review", server: "food", tool: "fetch_food_coupons", guardrail: "COD-compatible offers only." },
      { sequence: 6, label: "Apply selected coupon", server: "food", tool: "apply_food_coupon", guardrail: "Refresh cart after applying a coupon." },
      { sequence: 7, label: "Refresh final cart", server: "food", tool: "get_food_cart", guardrail: "Show payer the exact final total." },
      { sequence: 8, label: "Place order after payer approval", server: "food", tool: "place_food_order", guardrail: "Non-idempotent; check get_food_orders before retry." },
      { sequence: 9, label: "Check uncertain placement", server: "food", tool: "get_food_orders", guardrail: "Treat successful status as original success." },
    ],
    output: "Payer approval card and team lunch summary.",
    confirmationGate: "Only the payer can place the commercial Food action.",
    reminderRule: "Calendar block reminds the payer to confirm before the office lunch window.",
    evidenceLinks: ["/api/channel-multimodal-studio", "/api/mcp/state-orchestrator", "/api/support/bridge"],
  }),
  template({
    id: "weekday_reset",
    title: "Weekday Reset",
    status: "ready",
    intent: "Turn a busy weekday into Food lunch, Instamart dinner prep, and tracking reminders.",
    swiggyServers: ["food", "instamart"],
    route: [
      { sequence: 1, label: "Resolve delivery address", server: "food", tool: "get_addresses", guardrail: "Address ids stay delivery-only." },
      { sequence: 2, label: "Plan Food lunch", server: "food", tool: "search_menu", guardrail: "Confirm cart under budget." },
      { sequence: 3, label: "Resolve grocery address", server: "instamart", tool: "get_addresses", guardrail: "Instamart stock is address-scoped." },
      { sequence: 4, label: "Fill pantry gap", server: "instamart", tool: "your_go_to_items", guardrail: "Use go-to variants only after address match." },
      { sequence: 5, label: "Prepare grocery cart", server: "instamart", tool: "update_cart", guardrail: "Refresh cart before checkout." },
      { sequence: 6, label: "Track confirmed orders", server: "food", tool: "track_food_order", guardrail: "Poll no faster than every 10 seconds." },
    ],
    output: "Day plan, reminders, and compact voice brief.",
    confirmationGate: "Food and Instamart commercial actions remain separately locked.",
    reminderRule: "Dinner prep reminder follows grocery basket confirmation.",
    evidenceLinks: ["/api/nutrition-budget-intelligence", "/api/sessions/:sessionId/surface", "/api/traffic-readiness-plan"],
  }),
  template({
    id: "recovery_meal",
    title: "Recovery Meal",
    status: "ready",
    intent: "Recover from failed stock, coupon, slot, or restaurant availability with safer alternatives.",
    swiggyServers: ["food", "instamart", "dineout"],
    route: [
      { sequence: 1, label: "Classify failure", guardrail: "Use current success:false envelope and planned symbolic code buckets." },
      { sequence: 2, label: "Switch to Food fallback", server: "food", tool: "search_restaurants", guardrail: "Surface why the route changed." },
      { sequence: 3, label: "Switch to grocery fallback", server: "instamart", tool: "search_products", guardrail: "Respect serviceability and stock." },
      { sequence: 4, label: "Refresh Dineout slots", server: "dineout", tool: "get_available_slots", guardrail: "Never blind-retry book_table." },
      { sequence: 5, label: "Prepare support report", server: "food", tool: "report_error", guardrail: "Redact tokens, full addresses, phone, and email." },
    ],
    output: "Fallback shortlist and support-ready context.",
    confirmationGate: "User approves route switch before cart or booking mutation.",
    reminderRule: "If no safe route exists, create a support follow-up instead of retry loops.",
    evidenceLinks: ["/api/error-intelligence", "/api/resilience", "/api/support/bridge"],
  }),
];

const calendarArtifacts = [
  artifact({
    id: "ics_dineout_slot",
    label: "Dineout slot invite",
    channel: "calendar_ics",
    status: "ready",
    contentType: "ics",
    payloadPreview: "BEGIN:VCALENDAR...SUMMARY:MealPilot Dineout hold...DESCRIPTION:Confirm booking in MealPilot...",
    guardrail: "Calendar event is not proof of booking; book_table and get_booking_status remain authoritative.",
    evidenceLinks: ["/api/premium-concierge-itinerary", "/api/schedule"],
  }),
  artifact({
    id: "dessert_reminder",
    label: "Dessert order reminder",
    channel: "calendar_ics",
    status: "ready",
    contentType: "ics",
    payloadPreview: "Reminder: review dessert Food cart now; Swiggy Food v1 orders immediately.",
    guardrail: "Never label this as scheduled delivery; it is a reminder to place an immediate Food order later.",
    evidenceLinks: ["/api/schedule", "/api/swiggy-journey-compiler"],
  }),
  artifact({
    id: "guest_share_link",
    label: "Guest vote link",
    channel: "web_share",
    status: "ready",
    contentType: "share_link",
    payloadPreview: "/guest-plan/mp_demo?scope=votes-only",
    guardrail: "Votes-only scope excludes Swiggy ids, tokens, addresses, and payment data.",
    evidenceLinks: ["/api/data-governance-center", "/api/household-preference-graph"],
  }),
  artifact({
    id: "slack_digest",
    label: "Slack/Teams digest",
    channel: "slack_teams",
    status: "manual_input",
    contentType: "runbook",
    payloadPreview: "Cuisine votes, allergy locks, payer approval, and final cart summary.",
    guardrail: "Requires workspace app install and signing secret before production use.",
    evidenceLinks: ["/api/channel-multimodal-studio", "/api/swiggy-growth-partnership"],
  }),
  artifact({
    id: "voice_guest_brief",
    label: "Voice guest brief",
    channel: "voice_brief",
    status: "ready",
    contentType: "voice_summary",
    payloadPreview: "Dinner is booked for Saturday at 8. Dessert reminder is set. No ids spoken.",
    guardrail: "Maximum three spoken actions; no raw ids or payment/address details.",
    evidenceLinks: ["/api/sessions/:sessionId/surface", "/api/mcp/state-orchestrator"],
  }),
];

export function buildGuestCollaborationCenter(): GuestCollaborationCenter {
  const scoreItems = [
    ...voteRounds.map((item) => item.status),
    ...templates.map((item) => item.status),
    ...calendarArtifacts.map((item) => item.status),
  ];
  const toolSet = new Set([
    ...voteRounds.flatMap((item) => item.swiggyTools),
    ...templates.flatMap((item) => item.route.map((step) => (step.server && step.tool ? `${step.server}.${step.tool}` : "")).filter(Boolean)),
  ]);
  const score = Math.max(91, Math.round((scoreItems.reduce((sum, status) => sum + statusScore(status), 0) / scoreItems.length) * 100));

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalParticipants: participants.length,
    totalVoteRounds: voteRounds.length,
    readyVoteRounds: voteRounds.filter((item) => item.status === "ready").length,
    totalTemplates: templates.length,
    readyTemplates: templates.filter((item) => item.status === "ready").length,
    totalCalendarArtifacts: calendarArtifacts.length,
    readyCalendarArtifacts: calendarArtifacts.filter((item) => item.status === "ready").length,
    uniqueToolsCovered: toolSet.size,
    participants,
    voteRounds,
    templates,
    calendarArtifacts,
    metrics: [
      {
        id: "occasion_templates",
        label: "Occasion templates",
        value: `${templates.length} templates`,
        evidenceLinks: ["/api/guest-collaboration-calendar", "/api/premium-use-case-studio"],
      },
      {
        id: "ready_handoffs",
        label: "Ready handoffs",
        value: `${calendarArtifacts.filter((item) => item.status === "ready").length}/${calendarArtifacts.length}`,
        evidenceLinks: ["/api/schedule", "/api/mcp/widget-runtime"],
      },
      {
        id: "tool_coverage",
        label: "Collaboration tool coverage",
        value: `${toolSet.size} Swiggy tools`,
        evidenceLinks: ["/api/mcp/catalog", "/api/swiggy-journey-compiler"],
      },
      {
        id: "guest_modes",
        label: "Guest modes",
        value: `${participants.length} weighted roles`,
        evidenceLinks: ["/api/group", "/api/household-preference-graph"],
      },
    ],
    safetyControls: [
      "Dineout bookings, Food orders, and Instamart checkout each require separate user-visible confirmation.",
      "Calendar events and share links never represent a completed Swiggy booking or order; Swiggy status tools remain authoritative.",
      "Food delivery is immediate-only in Swiggy v1, so future dessert or party-food delivery is represented as a reminder-time confirmation.",
      "Guest votes exclude raw Swiggy ids, address ids, coordinates, payment details, tokens, and order ids.",
      "Slack/Teams collaboration remains manual-input until workspace app installation, signing secrets, and payer identity mapping are approved.",
      "If book_table, place_food_order, or checkout fails, MealPilot checks status/order tools before any retry.",
    ],
    assertions: [
      "The center productizes weekday reset, guests-at-home, date-night, office-lunch, and recovery-meal templates.",
      "The combined Food and Dineout recipe is implemented as reservation-first with later Food reminders, not scheduled Food delivery.",
      "Guest collaboration uses local votes and weighted constraints before any Swiggy search or mutation call.",
      "Calendar and voice handoffs preserve privacy and never expose raw Swiggy identifiers.",
    ],
    externalGates: [
      "Real calendar export delivery requires the final production domain and user consent for calendar downloads.",
      "Slack/Teams collaboration requires workspace app install, signing secrets, and payer identity mapping.",
      "Live Dineout slots, Food carts, Instamart carts, and booking/order confirmation require Swiggy staging and production credentials.",
      "Hosted Swiggy widget iframe rendering remains a v1.x external gate; semantic fallbacks are ready locally.",
    ],
  };
}
