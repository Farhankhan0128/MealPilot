import type { ServerConfig } from "../config.js";
import type {
  HouseholdPreferenceGraph,
  MealPlan,
  StagingCertificationMatrix,
  SwiggyDiscoveryFreshnessReport,
  SwiggyLiveSignalCalibrationLane,
  SwiggyLiveSignalCalibrationReport,
  SwiggyLiveSignalCalibrationStatus,
  SwiggyLiveSignalCalibrationWave,
  SwiggyLiveSignalProbe,
  SwiggyLiveSignalServerCalibration,
  SwiggyLocationTrustReport,
  SwiggyOfferIntelligenceReport,
  SwiggyOrderLifecycleReport,
  SwiggyStagingCredentialDrillReport,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/reference/food/tools/",
  "https://mcp.swiggy.com/builders/docs/reference/instamart/tools/",
  "https://mcp.swiggy.com/builders/docs/reference/dineout/tools/",
];

function statusWeight(status: SwiggyLiveSignalCalibrationStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.86;
  if (status === "privacy_gate") return 0.76;
  return 0.68;
}

function uniqueCount(values: string[]) {
  return new Set(values).size;
}

function hasLiveCredential(config: ServerConfig) {
  return config.swiggyMode !== "mock" && Boolean(config.swiggyAccessToken);
}

function buildSignalLanes(input: {
  liveCredential: boolean;
  household?: HouseholdPreferenceGraph;
  offer?: SwiggyOfferIntelligenceReport;
  orderLifecycle?: SwiggyOrderLifecycleReport;
  locationTrust?: SwiggyLocationTrustReport;
  discovery?: SwiggyDiscoveryFreshnessReport;
}): SwiggyLiveSignalCalibrationLane[] {
  const stagingStatus: SwiggyLiveSignalCalibrationStatus = input.liveCredential ? "watch" : "staging_gate";

  return [
    {
      id: "food_active_order_memory",
      label: "Food active-order taste memory",
      server: "food",
      status: stagingStatus,
      officialTools: ["get_food_orders", "get_food_order_details", "track_food_order"],
      localSignal:
        input.household?.signals.find((signal) => signal.id === "food_active_orders")?.preferenceUse ??
        "Local plan and fixture history infer cuisine, protein, price, and delivery windows.",
      liveCalibration:
        "Compare seeded active orders and order details against the local preference graph before using them for ranking.",
      privacyControl: "Hash user id, redact raw address, restaurant order ids, and item-level notes from logs.",
      evidenceLinks: ["/api/household-preference-graph", "/api/swiggy-order-lifecycle"],
    },
    {
      id: "instamart_pantries_and_go_to",
      label: "Instamart go-to and pantry cadence",
      server: "instamart",
      status: stagingStatus,
      officialTools: ["your_go_to_items", "get_orders", "get_order_details", "track_order"],
      localSignal:
        input.household?.signals.find((signal) => signal.id === "instamart_go_to_items")?.preferenceUse ??
        "Local pantry and restock suggestions infer staples, pack sizes, and replenishment cadence.",
      liveCalibration:
        "Diff go-to items, order history, and product variants against MealPilot pantry gaps with a seeded account.",
      privacyControl: "Persist category-level cadence only; never store raw grocery order payloads beyond session evidence.",
      evidenceLinks: ["/api/pantry", "/api/swiggy-discovery-freshness", "/api/swiggy-order-lifecycle"],
    },
    {
      id: "dineout_location_booking_truth",
      label: "Dineout location and booking truth",
      server: "dineout",
      status: stagingStatus,
      officialTools: ["get_saved_locations", "get_booking_status", "get_available_slots", "get_restaurant_details"],
      localSignal:
        input.locationTrust?.scenarios.find((scenario) => scenario.id === "dineout_saved_location_refresh")
          ?.expectedDecision ?? "Local venue suggestions use city, party size, occasion, and booking-window fixtures.",
      liveCalibration:
        "Refresh saved locations, slots, restaurant details, and booking status before recommending reservation timing.",
      privacyControl: "Use coarse location labels in UI and redact saved-place coordinates from reviewer artifacts.",
      evidenceLinks: ["/api/swiggy-location-trust", "/api/swiggy-dineout-precision-center"],
    },
    {
      id: "discovery_relevance_drift",
      label: "Discovery relevance drift",
      server: "combined",
      status: input.discovery && input.discovery.score >= 85 ? "watch" : "staging_gate",
      officialTools: [
        "search_restaurants",
        "search_menu",
        "search_products",
        "search_restaurants_dineout",
        "get_restaurant_details",
      ],
      localSignal: `${input.discovery?.totals.freshnessChecks ?? 0} freshness checks and ${
        input.discovery?.totals.lanes ?? 0
      } query lanes keep local rankings labeled as mock until credentialed reads land.`,
      liveCalibration:
        "Run identical queries across Food, Instamart, and Dineout, then flag price, availability, slot, or variant drift.",
      privacyControl: "Reviewer exports keep query intent, server, and status class without retaining raw personalized payloads.",
      evidenceLinks: ["/api/swiggy-discovery-freshness", "/api/swiggy-route-optimizer"],
    },
    {
      id: "offer_cart_truth",
      label: "Offer and cart truth",
      server: "combined",
      status: input.offer && input.offer.score >= 80 ? "watch" : "staging_gate",
      officialTools: ["fetch_food_coupons", "apply_food_coupon", "get_food_cart", "get_cart", "create_cart"],
      localSignal: `${input.offer?.totals.readyLanes ?? 0} ready offer lanes and ${
        input.offer?.totals.guardedApplications ?? 0
      } guarded application paths are available for confirmation-safe savings.`,
      liveCalibration:
        "Verify coupon eligibility, Dineout deal separation, Instamart cart totals, and payment-method truth before showing savings claims.",
      privacyControl: "Mask coupon codes tied to user identity and treat payment evidence as status-only.",
      evidenceLinks: ["/api/swiggy-offer-intelligence", "/api/swiggy-cart-mutation-workbench"],
    },
    {
      id: "support_failure_memory",
      label: "Support failure memory",
      server: "combined",
      status: "ready",
      officialTools: ["report_error"],
      localSignal:
        "Error Intelligence and Support Bridge already normalize JSON-RPC failures, Retry-After, 401, 5xx, and domain errors.",
      liveCalibration:
        "Convert seeded staging failures into redacted support envelopes before any retry or customer-facing recovery copy.",
      privacyControl: "Support packets include session id, request id, server, tool, timestamp, and redacted context only.",
      evidenceLinks: ["/api/error-intelligence", "/api/support/bridge", "/api/slo-incident-command"],
    },
  ];
}

function buildServerCalibration(liveCredential: boolean): SwiggyLiveSignalServerCalibration[] {
  const status: SwiggyLiveSignalCalibrationStatus = liveCredential ? "watch" : "staging_gate";

  return [
    {
      server: "food",
      readOnlyTools: ["get_addresses", "get_food_orders", "get_food_order_details", "track_food_order"],
      seededDataNeed: "Seeded user with saved address, one historical order, and one trackable active order.",
      driftThreshold: "Restaurant/menu/price/rating drift above 5% opens a freshness review before ranking changes ship.",
      redactionRule: "Keep cuisine, eta bucket, price bucket, and status; drop raw address, phone, order id, and delivery notes.",
      status,
    },
    {
      server: "instamart",
      readOnlyTools: ["get_addresses", "your_go_to_items", "get_orders", "get_order_details", "track_order"],
      seededDataNeed: "Seeded user with go-to staples, product variants, order history, and one trackable grocery order.",
      driftThreshold: "Variant or availability mismatch on two consecutive reads disables automated substitution copy.",
      redactionRule: "Keep category, pack-size family, and cadence; drop raw order payloads and address-level coordinates.",
      status,
    },
    {
      server: "dineout",
      readOnlyTools: ["get_saved_locations", "get_booking_status", "get_available_slots", "get_restaurant_details"],
      seededDataNeed: "Seeded user with saved location, Dineout restaurant shortlist, slot inventory, and booking status.",
      driftThreshold: "Slot or free-booking price mismatch forces a fresh get_available_slots read before book_table.",
      redactionRule: "Keep area label, party size, slot bucket, and booking status; drop exact saved-location payloads.",
      status,
    },
  ];
}

function buildStagingWaves(liveCredential: boolean, certification?: StagingCertificationMatrix): SwiggyLiveSignalCalibrationWave[] {
  const liveStatus: SwiggyLiveSignalCalibrationStatus = liveCredential ? "watch" : "staging_gate";
  const assignedTools = certification?.assignedTools ?? 35;

  return [
    {
      id: "local_fixture_baseline",
      sequence: 1,
      label: "Local fixture baseline",
      status: "ready",
      tools: ["get_addresses", "search_restaurants", "search_products", "search_restaurants_dineout"],
      exitCriteria: [
        "Mock labels remain visible in all reviewer-facing evidence.",
        "Preference, discovery, offer, location, and lifecycle reports agree on server boundaries.",
      ],
    },
    {
      id: "seeded_read_sample",
      sequence: 2,
      label: "Seeded read sample",
      status: liveStatus,
      tools: [
        "get_food_orders",
        "get_food_order_details",
        "your_go_to_items",
        "get_orders",
        "get_saved_locations",
        "get_available_slots",
      ],
      exitCriteria: [
        "Food, Instamart, and Dineout each produce one read-only staging transcript.",
        "All raw identifiers are redacted in exported proof.",
      ],
    },
    {
      id: "personalization_diff",
      sequence: 3,
      label: "Personalization diff and drift gate",
      status: liveStatus,
      tools: ["search_menu", "search_products", "get_restaurant_details", "fetch_food_coupons"],
      exitCriteria: [
        "Ranking deltas are bucketed as price, availability, distance, slot, or offer drift.",
        "Any confidence below 0.8 keeps local fixtures as the visible source label.",
      ],
    },
    {
      id: "commercial_adjacent_readback",
      sequence: 4,
      label: "Commercial-adjacent readback",
      status: liveStatus,
      tools: ["get_food_cart", "get_cart", "get_booking_status"],
      exitCriteria: [
        "Cart, deal, and booking readbacks occur before any mutation or checkout.",
        "Payment method and deal evidence stays status-only.",
      ],
    },
    {
      id: "green_soak_monitor",
      sequence: 5,
      label: "48-hour drift monitor",
      status: liveStatus,
      tools: [`${assignedTools} assigned certification tools`],
      exitCriteria: [
        "Two days of staging reads stay within drift thresholds.",
        "Support envelopes exist for every non-green response before production promotion.",
      ],
    },
  ];
}

function buildProbes(liveCredential: boolean): SwiggyLiveSignalProbe[] {
  const status: SwiggyLiveSignalCalibrationStatus = liveCredential ? "watch" : "staging_gate";

  return [
    {
      id: "food_order_profile_probe",
      server: "food",
      signal: "Cuisine, protein, delivery eta, and active order status",
      sourceTools: ["get_food_orders", "get_food_order_details", "track_food_order"],
      currentEvidence: "/api/household-preference-graph and /api/swiggy-order-lifecycle",
      stagingProof: "Seeded Food order transcript with redacted order id and status bucket.",
      failureStopRule: "Stop on 401, missing seeded order, or status mismatch until OAuth or seeded data is fixed.",
      status,
    },
    {
      id: "instamart_cadence_probe",
      server: "instamart",
      signal: "Staples, pack sizes, variant truth, and replenishment cadence",
      sourceTools: ["your_go_to_items", "get_orders", "get_order_details"],
      currentEvidence: "/api/pantry, /api/swiggy-discovery-freshness, and /api/swiggy-order-lifecycle",
      stagingProof: "Seeded Instamart go-to and order-history transcript with category-level export.",
      failureStopRule: "Stop on variant ambiguity, unavailable items, or cart mismatch before proposing substitution copy.",
      status,
    },
    {
      id: "dineout_context_probe",
      server: "dineout",
      signal: "Saved area, slot truth, booking status, and venue preference",
      sourceTools: ["get_saved_locations", "get_available_slots", "get_booking_status"],
      currentEvidence: "/api/swiggy-location-trust and /api/swiggy-dineout-precision-center",
      stagingProof: "Seeded Dineout location and slot transcript with exact coordinates redacted.",
      failureStopRule: "Stop on paid/free ambiguity or slot drift until get_available_slots confirms the final state.",
      status,
    },
    {
      id: "combined_offer_drift_probe",
      server: "combined",
      signal: "Coupon, cart, deal, and savings copy truth",
      sourceTools: ["fetch_food_coupons", "apply_food_coupon", "get_food_cart", "get_cart", "create_cart"],
      currentEvidence: "/api/swiggy-offer-intelligence and /api/swiggy-cart-mutation-workbench",
      stagingProof: "Readback transcript proving offer copy and cart totals before any confirmed action.",
      failureStopRule: "Stop on coupon rejection, deal/cart ambiguity, or payment-method uncertainty.",
      status,
    },
  ];
}

function scoreReport(lanes: SwiggyLiveSignalCalibrationLane[], waves: SwiggyLiveSignalCalibrationWave[], probes: SwiggyLiveSignalProbe[]) {
  const scores = [...lanes.map((lane) => lane.status), ...waves.map((wave) => wave.status), ...probes.map((probe) => probe.status)];
  return Math.round((scores.reduce((sum, status) => sum + statusWeight(status), 0) / scores.length) * 100);
}

export function buildSwiggyLiveSignalCalibration(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
  household?: HouseholdPreferenceGraph;
  offer?: SwiggyOfferIntelligenceReport;
  orderLifecycle?: SwiggyOrderLifecycleReport;
  locationTrust?: SwiggyLocationTrustReport;
  discovery?: SwiggyDiscoveryFreshnessReport;
  stagingCredentialDrill?: SwiggyStagingCredentialDrillReport;
  certification?: StagingCertificationMatrix;
}): SwiggyLiveSignalCalibrationReport {
  const liveCredential = hasLiveCredential(options.config);
  const signalLanes = buildSignalLanes({
    liveCredential,
    household: options.household,
    offer: options.offer,
    orderLifecycle: options.orderLifecycle,
    locationTrust: options.locationTrust,
    discovery: options.discovery,
  });
  const serverCalibration = buildServerCalibration(liveCredential);
  const stagingWaves = buildStagingWaves(liveCredential, options.certification);
  const probes = buildProbes(liveCredential);
  const privacyControls = [
    {
      id: "signal_minimization",
      label: "Signal minimization",
      control: "Convert order, pantry, location, and booking payloads into category, cadence, eta, slot, and status buckets.",
      status: "ready" as const,
    },
    {
      id: "reviewer_redaction",
      label: "Reviewer redaction",
      control: "Visual QA, staging transcripts, support packets, and builder exports never expose raw addresses, tokens, or order ids.",
      status: "ready" as const,
    },
    {
      id: "credential_boundary",
      label: "Credential boundary",
      control: "Non-mock signal calibration stays disabled until Swiggy staging credentials and seeded users are issued.",
      status: liveCredential ? ("watch" as const) : ("staging_gate" as const),
    },
    {
      id: "user_control",
      label: "User control",
      control: "Profile export and erasure endpoints remain the local source for MealPilot-held preference state.",
      status: "ready" as const,
    },
  ];
  const base = `http://localhost:${options.config.port}`;
  const readOnlyTools = serverCalibration.flatMap((server) => server.readOnlyTools);
  const readyLanes = signalLanes.filter((lane) => lane.status === "ready").length;

  return {
    generatedAt: new Date().toISOString(),
    mode: options.config.swiggyMode,
    score: scoreReport(signalLanes, stagingWaves, probes),
    officialSources,
    totals: {
      lanes: signalLanes.length,
      readyLanes,
      probes: probes.length,
      stagingWaves: stagingWaves.length,
      privacyControls: privacyControls.length,
      externalGates: liveCredential ? 2 : 4,
    },
    signalLanes,
    serverCalibration,
    stagingWaves,
    probes,
    privacyControls,
    fallbackRules: [
      {
        id: "mock_label_preserved",
        trigger: "No Swiggy staging credentials or seeded users",
        action: "Show local fixture/mock labels and keep live personalization copy disabled.",
        evidence: "/api/swiggy-staging-credential-drill",
      },
      {
        id: "drift_threshold_exceeded",
        trigger: "Price, availability, variant, slot, or booking drift exceeds threshold",
        action: "Refresh the source tool and downgrade recommendation confidence until the read stabilizes.",
        evidence: "/api/swiggy-discovery-freshness",
      },
      {
        id: "privacy_redaction_failure",
        trigger: "A proof artifact contains raw address, token, order id, phone, or exact coordinates",
        action: "Block export and rerun redaction before submitting the builder packet.",
        evidence: "/api/data-governance-center",
      },
    ],
    operatorRunbook: [
      {
        sequence: 1,
        label: "Baseline local signals",
        command: `curl -s ${base}/api/swiggy-live-signal-calibration`,
        proves: "Local preference, discovery, offer, order, location, and privacy evidence is connected before staging.",
      },
      {
        sequence: 2,
        label: "Run credential drill",
        command: `curl -s ${base}/api/swiggy-staging-credential-drill`,
        proves: "Swiggy credential, seeded-data, and first-call gates are current.",
      },
      {
        sequence: 3,
        label: "Replay read-only staging tools",
        command: "SWIGGY_ENV=staging SWIGGY_ACCESS_TOKEN=<redacted> npm run verify:production",
        proves: `${uniqueCount(readOnlyTools)} unique read-only tools can be inspected without commercial side effects.`,
      },
      {
        sequence: 4,
        label: "Export proof packet",
        command: "MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet",
        proves: "Builder packet includes redacted calibration evidence, visual QA target, and launch bundle links.",
      },
    ],
    assertions: [
      "MealPilot does not claim live personalization until Swiggy-issued staging credentials and seeded users are present.",
      "Food, Instamart, and Dineout read-only signals calibrate before any cart mutation, checkout, or table booking.",
      "Every live signal has a redaction rule, drift threshold, fallback rule, and reviewer evidence link.",
      options.latestPlan
        ? `Latest plan ${options.latestPlan.id} remains the demo anchor for signal calibration.`
        : "Run a plan before recording the final live-signal calibration demo.",
      options.stagingCredentialDrill
        ? `Credential drill gate is ${options.stagingCredentialDrill.credentialSignal.currentGate}.`
        : "Credential drill must be loaded before staging calibration starts.",
    ],
    externalGates: [
      "Swiggy must issue staging credentials and seeded Food, Instamart, and Dineout users.",
      "Operator must run OAuth with a final redirect URI before live signal replay.",
      "48-hour staging soak must stay green before production personalization claims ship.",
      "Swiggy production approval is required before real user order, pantry, location, or booking signals are used.",
    ],
  };
}
