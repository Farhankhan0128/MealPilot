import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyLocationTrustControl,
  SwiggyLocationTrustLane,
  SwiggyLocationTrustReport,
  SwiggyLocationTrustScenario,
  SwiggyLocationTrustStatus,
  SwiggyLocationTrustTelemetry,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/reference/food/get_addresses/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/get_addresses/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/create_address/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/delete_address/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/get_saved_locations/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/search_restaurants_dineout/",
];

function statusWeight(status: SwiggyLocationTrustStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.78;
  return 0.48;
}

export function buildSwiggyLocationTrust(options: { config: ServerConfig; plans: MealPlan[] }): SwiggyLocationTrustReport {
  const latestPlan = options.plans.at(-1);
  const planLocations = new Set((latestPlan?.recommendations ?? []).map((recommendation) => recommendation.locationLabel));
  const activeLabels = planLocations.size ? Array.from(planLocations).join(", ") : "Home";

  const lanes: SwiggyLocationTrustLane[] = [
    {
      id: "shared_address_read",
      server: "combined",
      label: "Shared Address Read",
      officialTools: ["get_addresses"],
      purpose: "Fetch saved delivery addresses for authenticated Food and Instamart sessions before discovery.",
      userGate: "Stop after the address list and ask which address should drive the next Food or Instamart operation.",
      refreshPolicy: "Changing the selected address invalidates cached restaurants, products, carts, coupons, and delivery estimates.",
      privacyPosture: "Use address id hashes and labels only; Swiggy returns the shared list without latitude/longitude.",
      status: "ready",
      evidenceLinks: [officialSources[2], officialSources[3], "/api/mcp/state-orchestrator"],
    },
    {
      id: "instamart_address_create",
      server: "instamart",
      label: "Instamart Address Create",
      officialTools: ["create_address"],
      purpose: "Capture an explicit user request to add a delivery address for Food and Instamart availability.",
      userGate: "Require user-entered address fields and confirmation before any mutating create_address call.",
      refreshPolicy: "After create_address succeeds, re-read get_addresses and let the user choose the new address.",
      privacyPosture: "Do not echo room number, phone, or full address into logs, transcripts, or reviewer packets.",
      status: "ready",
      evidenceLinks: [officialSources[4], "/api/data-governance-center"],
    },
    {
      id: "instamart_address_delete",
      server: "instamart",
      label: "Instamart Address Delete",
      officialTools: ["delete_address"],
      purpose: "Delete a saved Food/Instamart address only after the user names the exact address to remove.",
      userGate: "Ask for destructive confirmation and show the address label, never a raw hidden id.",
      refreshPolicy: "Clear active carts and saved-location joins, then re-read get_addresses before another commercial action.",
      privacyPosture: "Store delete intent, hashed address id, and request id; raw address body stays out of telemetry.",
      status: "ready",
      evidenceLinks: [officialSources[5], "/api/audit-ledger"],
    },
    {
      id: "dineout_saved_location",
      server: "dineout",
      label: "Dineout Saved Location",
      officialTools: ["get_saved_locations", "search_restaurants_dineout"],
      purpose: "Use saved Dineout locations when the user asks for restaurants near home, office, or my location.",
      userGate: "Show saved locations as numbered options and pass only the chosen addressId into restaurant search.",
      refreshPolicy: "Dineout searches and slots are refreshed whenever the chosen saved location changes.",
      privacyPosture: "Expose a coarse label and hashed saved-location id; do not persist Dineout address lines.",
      status: "ready",
      evidenceLinks: [officialSources[6], officialSources[7]],
    },
    {
      id: "cross_server_location_handoff",
      server: "combined",
      label: "Cross-server Location Handoff",
      officialTools: ["get_addresses", "get_saved_locations"],
      purpose: `Keep Food, Instamart, and Dineout recommendations aligned to the user-selected label: ${activeLabels}.`,
      userGate: "Ask again before reusing a Food/Instamart address as a Dineout saved-location context.",
      refreshPolicy: "A location switch restarts discovery, cart, slot, coupon, and availability evidence for every affected server.",
      privacyPosture: "Only derived labels move across servers; raw addresses, coordinates, and tokens do not.",
      status: "watch",
      evidenceLinks: ["/api/mcp/scenario-runner", "/api/swiggy-order-lifecycle"],
    },
    {
      id: "live_location_calibration",
      server: "combined",
      label: "Live Location Calibration",
      officialTools: ["get_addresses", "get_saved_locations"],
      purpose: "Compare mock address fixtures against Swiggy staging users once credentials and seeded saved locations exist.",
      userGate: "Keep production location writes disabled until Swiggy staging credentials are issued and reviewed.",
      refreshPolicy: "Replay every saved-address branch in staging before approving production credentials.",
      privacyPosture: "Capture only redacted staging transcript waves and hashed ids.",
      status: "external_gate",
      evidenceLinks: ["/api/sandbox-credential-workbench", "/api/staging-certification-matrix"],
    },
  ];

  const controls: SwiggyLocationTrustControl[] = [
    {
      id: "purpose_limited_address_use",
      label: "Purpose-limited Address Use",
      policy: "Saved addresses are used only for the active Food, Instamart, or Dineout session and are not copied into preference memory.",
      status: "ready",
      evidenceLinks: ["/api/data-governance-center", "/api/compliance-evidence"],
    },
    {
      id: "raw_address_redaction",
      label: "Raw Address Redaction",
      policy: "Room, phone, full address lines, coordinates, and bearer tokens are blocked from logs, support packets, screenshots, and launch exports.",
      status: "ready",
      evidenceLinks: ["/api/telemetry/runtime", "/api/support/bridge"],
    },
    {
      id: "address_choice_pause",
      label: "Address Choice Pause",
      policy: "After get_addresses or get_saved_locations, the assistant pauses and waits for the user to choose the address before downstream discovery.",
      status: "ready",
      evidenceLinks: [officialSources[3], officialSources[6]],
    },
    {
      id: "address_switch_refresh",
      label: "Address Switch Refresh",
      policy: "Changing address invalidates carts, products, restaurant search, coupons, Dineout slots, and confirmation preflight state.",
      status: "ready",
      evidenceLinks: ["/api/sessions/:sessionId/preflight", "/api/mcp/state-orchestrator"],
    },
    {
      id: "delete_address_intent",
      label: "Delete Address Intent",
      policy: "delete_address requires an explicit destructive confirmation and a post-delete get_addresses refresh before new orders.",
      status: "ready",
      evidenceLinks: [officialSources[5], "/api/audit-ledger"],
    },
  ];

  const scenarios: SwiggyLocationTrustScenario[] = [
    {
      id: "home_address_alignment",
      label: "Home Food and Instamart Alignment",
      trigger: "User asks for dinner and grocery top-up near home.",
      expectedDecision: "Call get_addresses once, pause for user choice, then reuse the selected address id for Food and Instamart discovery.",
      protectedFields: ["full_address", "coordinates", "access_token"],
      status: "ready",
    },
    {
      id: "office_dineout_search",
      label: "Office Dineout Search",
      trigger: "User asks for a team table near my office.",
      expectedDecision: "Call get_saved_locations, show numbered options, and pass only the chosen addressId to Dineout restaurant search.",
      protectedFields: ["address_line", "address_id", "booking_context"],
      status: "ready",
    },
    {
      id: "temporary_guest_location",
      label: "Temporary Guest Location",
      trigger: "Guest adds a one-time party address.",
      expectedDecision: "Create the address only after confirmation, mark it one-session, and prevent it from preference memory.",
      protectedFields: ["guest_phone", "room_number", "full_address"],
      status: "watch",
    },
    {
      id: "delete_saved_address",
      label: "Delete Saved Address",
      trigger: "User removes an old office address before checkout.",
      expectedDecision: "Confirm destructive intent, call delete_address, refresh addresses, and block checkout until a surviving address is selected.",
      protectedFields: ["address_id", "full_address", "cart_id"],
      status: "ready",
    },
  ];

  const telemetry: SwiggyLocationTrustTelemetry[] = [
    { field: "address_id_hash", source: "get_addresses or get_saved_locations", redaction: "hash only; no raw address id", status: "ready" },
    { field: "location_label", source: "user-visible choice", redaction: "coarse label only", status: "ready" },
    { field: "lat_lng_precision", source: "Dineout direct-coordinate search", redaction: "precision bucket only", status: "watch" },
    { field: "delete_address_intent", source: "destructive confirmation", redaction: "boolean intent and request id only", status: "ready" },
    { field: "saved_location_source", source: "Food/Instamart or Dineout", redaction: "server name only", status: "ready" },
  ];

  const externalGates = [
    "Swiggy staging credentials are required before live saved-address lists can be replayed.",
    "Exact Swiggy address IDs, address lines, coordinates, and user tokens are never logged raw.",
    "Dineout saved-location availability must be verified with seeded accounts before production launch.",
  ];

  const score =
    (lanes.reduce((sum, lane) => sum + statusWeight(lane.status), 0) / lanes.length) * 30 +
    (controls.reduce((sum, control) => sum + statusWeight(control.status), 0) / controls.length) * 25 +
    (scenarios.reduce((sum, scenario) => sum + statusWeight(scenario.status), 0) / scenarios.length) * 25 +
    (telemetry.reduce((sum, field) => sum + statusWeight(field.status), 0) / telemetry.length) * 20;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.round(score),
    mode: options.config.swiggyMode,
    officialSources,
    totals: {
      lanes: lanes.length,
      toolsCovered: new Set(lanes.flatMap((lane) => lane.officialTools)).size,
      readyControls: controls.filter((control) => control.status === "ready").length,
      scenarios: scenarios.length,
      redactedFields: new Set(scenarios.flatMap((scenario) => scenario.protectedFields)).size + telemetry.length,
      externalGates: externalGates.length,
    },
    lanes,
    controls,
    scenarios,
    telemetry,
    operatorActions: [
      {
        id: "seed_saved_locations",
        label: "Seed saved locations",
        owner: "Swiggy",
        status: "external_gate",
        evidence: "Needed to replay get_addresses and get_saved_locations with real saved-address fixtures.",
      },
      {
        id: "enforce_address_choice_pause",
        label: "Enforce address choice pause",
        owner: "MealPilot",
        status: "ready",
        evidence: "State Orchestrator and Scenario Runner pause after saved-address reads until user selection.",
      },
      {
        id: "redact_location_support_packets",
        label: "Redact location support packets",
        owner: "MealPilot",
        status: "ready",
        evidence: "Support Bridge and Runtime Telemetry carry hashed ids and coarse labels instead of full addresses.",
      },
    ],
    assertions: [
      "Food and Instamart get_addresses must stop and let the user choose an address before downstream discovery.",
      "Dineout get_saved_locations is used for home, office, or my location requests and passes only a chosen addressId.",
      "Raw addresses never leave the active session through logs, support packets, screenshots, or launch exports.",
      "Address creation and deletion are explicit user-intent flows followed by a fresh saved-address read.",
      "Address switches refresh carts, coupons, products, restaurants, Dineout slots, and confirmation preflight state.",
    ],
    externalGates,
  };
}
