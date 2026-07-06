import type {
  DomainErrorCode,
  ErrorClassificationDecision,
  ErrorClassificationResult,
  ErrorIntelligenceBucket,
  ErrorIntelligenceReport,
  PlannedErrorCode,
  SwiggyServer,
} from "../../src/domain/types.js";

const officialSource = "https://mcp.swiggy.com/builders/docs/reference/errors/";

const buckets: ErrorIntelligenceBucket[] = [
  {
    id: "auth_failure",
    label: "Auth failure",
    detect: "HTTP 401 or JSON-RPC -32001",
    userAction: "Re-run OAuth and never retry with the same expired bearer token.",
    retryClass: "reauth",
    maxRetries: 0,
    reportError: false,
    userCopy: "Please reconnect Swiggy before I continue.",
  },
  {
    id: "bad_input",
    label: "Bad input",
    detect: "HTTP 400 with message prefix Invalid or Missing",
    userAction: "Fix arguments, validate the schema, and do not retry the same request.",
    retryClass: "fix_arguments",
    maxRetries: 0,
    reportError: false,
    userCopy: "I need to correct the request details before trying again.",
  },
  {
    id: "upstream_timeout",
    label: "Upstream timeout",
    detect: "HTTP 504 or error.message containing timeout",
    userAction: "Retry safe reads with exponential backoff and jitter, capped at five attempts.",
    retryClass: "safe_backoff",
    maxRetries: 5,
    reportError: true,
    userCopy: "Swiggy is taking longer than usual. I will retry briefly without placing anything twice.",
  },
  {
    id: "upstream_error",
    label: "Upstream error",
    detect: "HTTP 502 or 503",
    userAction: "Retry safe reads and idempotent cart calls with backoff; preserve commercial confirmation locks.",
    retryClass: "safe_backoff",
    maxRetries: 5,
    reportError: true,
    userCopy: "Swiggy had a temporary issue. I will retry only the safe step.",
  },
  {
    id: "domain_failure",
    label: "Domain failure",
    detect: "HTTP 200 with success:false",
    userAction: "Surface the message as terminal unless the user chooses a replacement item, slot, address, or restaurant.",
    retryClass: "domain_terminal",
    maxRetries: 0,
    reportError: true,
    userCopy: "That option is no longer available. I can help choose an alternative.",
  },
  {
    id: "internal_error",
    label: "Internal error",
    detect: "HTTP 500 or JSON-RPC -32603",
    userAction: "Retry once with backoff, then generate report_error if it persists.",
    retryClass: "single_retry_then_report",
    maxRetries: 1,
    reportError: true,
    userCopy: "Something failed unexpectedly. I will try once, then prepare a support report.",
  },
];

const plannedCoreCodes: PlannedErrorCode[] = [
  { code: "UNAUTHENTICATED", meaning: "No or invalid session credentials", http: 401, bucket: "auth_failure", status: "planned" },
  { code: "TOKEN_EXPIRED", meaning: "Access token past expiry", http: 401, bucket: "auth_failure", status: "planned" },
  { code: "SESSION_REVOKED", meaning: "Session invalidated", http: 419, bucket: "auth_failure", status: "planned" },
  { code: "INSUFFICIENT_SCOPE", meaning: "Need broader OAuth scope", http: 403, bucket: "auth_failure", status: "planned" },
  { code: "RATE_LIMITED", meaning: "Too many requests", http: 429, bucket: "upstream_timeout", status: "planned" },
  { code: "VALIDATION_ERROR", meaning: "Input failed schema check", http: 400, bucket: "bad_input", status: "planned" },
  { code: "NOT_FOUND", meaning: "Resource does not exist", http: 404, bucket: "domain_failure", status: "planned" },
  { code: "UPSTREAM_TIMEOUT", meaning: "Swiggy upstream slow", http: 504, bucket: "upstream_timeout", status: "planned" },
  { code: "UPSTREAM_ERROR", meaning: "Swiggy upstream failure", http: 502, bucket: "upstream_error", status: "planned" },
  { code: "INTERNAL_ERROR", meaning: "Unexpected server-side failure", http: 500, bucket: "internal_error", status: "planned" },
];

const domainCodes: DomainErrorCode[] = [
  {
    server: "instamart",
    code: "ITEM_OUT_OF_STOCK",
    meaning: "Selected grocery item is unavailable.",
    terminal: true,
    userAction: "Offer an Instamart alternative and refresh cart truth.",
  },
  {
    server: "instamart",
    code: "CART_EXPIRED",
    meaning: "Prepared Instamart cart has expired.",
    terminal: true,
    userAction: "Rebuild the basket from the current pantry plan.",
  },
  {
    server: "instamart",
    code: "ADDRESS_NOT_SERVICEABLE",
    meaning: "Address cannot be served for this grocery order.",
    terminal: true,
    userAction: "Ask the user to select another saved location.",
  },
  {
    server: "instamart",
    code: "MIN_ORDER_NOT_MET",
    meaning: "Basket total is below the minimum order amount.",
    terminal: true,
    userAction: "Suggest the smallest useful pantry add-on.",
  },
  {
    server: "food",
    code: "RESTAURANT_CLOSED",
    meaning: "Restaurant is not accepting orders.",
    terminal: true,
    userAction: "Suggest an open restaurant with similar cuisine and ETA.",
  },
  {
    server: "food",
    code: "ITEM_UNAVAILABLE",
    meaning: "Menu item is no longer available.",
    terminal: true,
    userAction: "Offer menu alternatives and refresh the cart.",
  },
  {
    server: "food",
    code: "COUPON_INVALID",
    meaning: "Coupon is invalid.",
    terminal: true,
    userAction: "Remove the coupon and refresh total before confirmation.",
  },
  {
    server: "food",
    code: "COUPON_NOT_APPLICABLE",
    meaning: "Coupon does not apply to the current cart.",
    terminal: true,
    userAction: "Show the updated total and other available offers.",
  },
  {
    server: "food",
    code: "COUPON_REQUIRES_ONLINE_PAYMENT",
    meaning: "Coupon requires an online payment method.",
    terminal: true,
    userAction: "Explain payment requirement and ask before changing payment path.",
  },
  {
    server: "dineout",
    code: "SLOT_UNAVAILABLE",
    meaning: "Selected reservation slot is gone.",
    terminal: true,
    userAction: "Find adjacent available slots before booking.",
  },
  {
    server: "dineout",
    code: "RESTAURANT_NOT_BOOKABLE",
    meaning: "Venue cannot accept table bookings.",
    terminal: true,
    userAction: "Suggest another Dineout restaurant in the same area.",
  },
  {
    server: "dineout",
    code: "BOOKING_WINDOW_CLOSED",
    meaning: "Reservation window has closed.",
    terminal: true,
    userAction: "Offer a later date or nearby walk-in-friendly venue.",
  },
];

const commercialStatusProbe: Record<string, string> = {
  place_food_order: "get_food_orders",
  checkout: "get_orders",
  book_table: "get_booking_status",
};

function retrySchedule(maxRetries: number) {
  const base = [500, 1000, 2000, 4000, 8000];
  return base.slice(0, maxRetries);
}

function bucketById(id: string) {
  return buckets.find((bucket) => bucket.id === id) ?? buckets.find((bucket) => bucket.id === "internal_error") ?? buckets[0];
}

function classifyBucket(input: {
  server: SwiggyServer;
  httpStatus: number;
  jsonRpcCode?: number;
  success: boolean;
  message: string;
  symbolicCode?: string;
}) {
  const codeMatch = input.symbolicCode
    ? plannedCoreCodes.find((code) => code.code === input.symbolicCode) ??
      domainCodes.find((code) => code.server === input.server && code.code === input.symbolicCode)
    : undefined;
  if (codeMatch && "bucket" in codeMatch) return bucketById(codeMatch.bucket);
  if (codeMatch) return bucketById("domain_failure");

  const message = input.message.toLowerCase();
  if ([401, 403, 419].includes(input.httpStatus) || input.jsonRpcCode === -32001) return bucketById("auth_failure");
  if (input.httpStatus === 400 || message.startsWith("invalid") || message.startsWith("missing")) return bucketById("bad_input");
  if (input.httpStatus === 429 || input.httpStatus === 504 || message.includes("timeout") || message.includes("rate limit")) {
    return bucketById("upstream_timeout");
  }
  if ([502, 503].includes(input.httpStatus)) return bucketById("upstream_error");
  if (input.httpStatus === 500 || input.jsonRpcCode === -32603) return bucketById("internal_error");
  if (!input.success || input.httpStatus === 200) return bucketById("domain_failure");
  return bucketById("internal_error");
}

function decisionFor(bucket: ErrorIntelligenceBucket, input: { tool: string; routeClass: ErrorClassificationResult["input"]["routeClass"] }): ErrorClassificationDecision {
  if (bucket.retryClass === "reauth") return "reauth";
  if (bucket.retryClass === "fix_arguments") return "fix_arguments";
  if (bucket.retryClass === "domain_terminal") return "surface_domain_failure";
  if (input.routeClass === "commercial_action" || input.tool in commercialStatusProbe) return "block_blind_retry";
  if (bucket.retryClass === "safe_backoff") return "retry_safe_step";
  return "single_retry_then_report";
}

export function classifyMcpError(input: {
  server: SwiggyServer;
  tool: string;
  httpStatus: number;
  jsonRpcCode?: number;
  success?: boolean;
  message: string;
  symbolicCode?: string;
  routeClass?: ErrorClassificationResult["input"]["routeClass"];
}): ErrorClassificationResult {
  const normalized = {
    ...input,
    success: input.success ?? false,
    routeClass: input.routeClass ?? "read",
  };
  const bucket = classifyBucket(normalized);
  const decision = decisionFor(bucket, normalized);
  const requiredStatusProbe = decision === "block_blind_retry" ? commercialStatusProbe[normalized.tool] : undefined;
  const maxRetries = decision === "block_blind_retry" ? 0 : bucket.maxRetries;
  const supportRecommended = bucket.reportError && decision !== "reauth" && decision !== "fix_arguments";
  const riskFlags = [
    decision === "block_blind_retry" ? "commercial_action_status_probe_required" : "",
    bucket.id === "domain_failure" ? "domain_failure_not_auto_retried" : "",
    supportRecommended ? "support_packet_ready" : "",
  ].filter(Boolean);

  return {
    generatedAt: new Date().toISOString(),
    requestId: `err_${Date.now().toString(36)}`,
    officialSource,
    input: {
      server: normalized.server,
      tool: normalized.tool,
      httpStatus: normalized.httpStatus,
      jsonRpcCode: normalized.jsonRpcCode,
      success: normalized.success,
      message: normalized.message.slice(0, 180),
      symbolicCode: normalized.symbolicCode,
      routeClass: normalized.routeClass,
    },
    selectedBucketId: bucket.id,
    retryClass: bucket.retryClass,
    decision,
    maxRetries,
    retryScheduleMs: retrySchedule(maxRetries),
    requiredStatusProbe,
    supportRecommended,
    reportErrorAvailable: supportRecommended,
    userFacingCopy:
      decision === "block_blind_retry"
        ? "I will check the latest Swiggy status before any retry, so nothing is placed twice."
        : bucket.userCopy,
    nextActions: [
      decision === "reauth" ? "Restart Swiggy OAuth and refresh MCP clients." : "",
      decision === "fix_arguments" ? "Correct the JSON-RPC arguments before trying again." : "",
      decision === "retry_safe_step" ? "Retry only safe read or idempotent steps with capped backoff and jitter." : "",
      decision === "surface_domain_failure" ? "Show the user the unavailable item, slot, address, or coupon and ask for an alternative." : "",
      decision === "single_retry_then_report" ? "Retry once with backoff, then prepare report_error if it persists." : "",
      requiredStatusProbe ? `Run ${requiredStatusProbe} before any retry or support escalation.` : "",
      supportRecommended ? "Prepare a redacted report_error payload if the problem persists or Swiggy asks for diagnostics." : "",
    ].filter(Boolean),
    riskFlags,
    telemetry: [
      { field: "server", value: normalized.server, redaction: "safe enum" },
      { field: "tool", value: normalized.tool, redaction: "tool name only" },
      { field: "http_status", value: String(normalized.httpStatus), redaction: "numeric status only" },
      { field: "jsonrpc_code", value: String(normalized.jsonRpcCode ?? "none"), redaction: "numeric code only" },
      { field: "selected_bucket", value: bucket.id, redaction: "safe enum" },
      { field: "raw_payload_retained", value: "false", redaction: "hard-coded privacy invariant" },
      { field: "blind_retry_executed", value: "false", redaction: "hard-coded safety invariant" },
    ],
    assertions: [
      "Current Swiggy MCP failures are classified primarily from success:false and error.message, with HTTP and JSON-RPC codes as secondary signals.",
      "Commercial actions never blind-retry; they require a matching status probe first.",
      "Auth failures restart OAuth instead of retrying the same bearer token.",
      "Bad input and domain failures are not retried automatically.",
      "report_error is recommended only with redacted support context and no raw tokens, payment data, or full addresses.",
    ],
  };
}

export function buildErrorIntelligenceReport(): ErrorIntelligenceReport {
  return {
    generatedAt: new Date().toISOString(),
    score: 100,
    officialSource,
    envelope: {
      success: false,
      error: {
        message: "human-readable description",
        reportLink: "https://...",
        reportHint: "Run report_error to share diagnostics",
      },
      primarySignal: "error.message string and success:false envelope",
      secondarySignals: ["HTTP status", "JSON-RPC code -32001 or -32603", "optional reportLink/reportHint"],
    },
    buckets,
    plannedCoreCodes,
    domainCodes,
    retryPolicy: {
      initialBackoffMs: 500,
      maxBackoffMs: 8000,
      maxRetries: 5,
      jitter: true,
      nonBlindRetryTools: ["place_food_order", "checkout", "book_table"],
    },
    observabilityHooks: [
      "Tag error bucket, HTTP status, JSON-RPC code, server, tool, request id, and session id.",
      "Record success:false domain failures as terminal product events, not retriable infrastructure errors.",
      "Preserve reportLink/reportHint only after redaction and never log access tokens or payment details.",
    ],
    supportActions: [
      "Use report_error when the envelope includes reportHint/reportLink or the issue persists after allowed retry budget.",
      "Attach MealPilot session id, X-MealPilot-Request-Id, server, tool, timestamp, and expected versus actual behavior.",
      "For commercial action uncertainty, run matching status lookup before report or retry.",
    ],
    assertions: [
      "Auth failures restart OAuth instead of retrying an expired token.",
      "Bad input and domain failures do not retry automatically.",
      "Timeouts and upstream errors retry only safe/idempotent classes with capped exponential backoff.",
      "place_food_order, checkout, and book_table never blind-retry.",
      "Planned symbolic codes are modeled without depending on them being emitted today.",
    ],
  };
}
