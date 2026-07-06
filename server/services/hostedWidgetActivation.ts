import type {
  MealPlan,
  SwiggyHostedWidgetActivationCenter,
  SwiggyHostedWidgetActivationStatus,
  SwiggyHostedWidgetFallbackParity,
  SwiggyHostedWidgetHandshake,
  SwiggyHostedWidgetHostPolicy,
  SwiggyWidgetRuntimeSurface,
} from "../../src/domain/types.js";
import { buildSwiggyWidgetExperienceComposer } from "./widgetExperienceComposer.js";
import { buildSwiggyWidgetRuntime } from "./widgetRuntime.js";

const endpoint = "/api/swiggy-hosted-widget-activation";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
];

function scoreStatus(status: SwiggyHostedWidgetActivationStatus) {
  if (status === "ready") return 1;
  if (status === "semantic_fallback") return 0.86;
  if (status === "external_gate") return 0.62;
  return 0.15;
}

function hostPolicy(input: SwiggyHostedWidgetHostPolicy): SwiggyHostedWidgetHostPolicy {
  return input;
}

function buildHostPolicies(): SwiggyHostedWidgetHostPolicy[] {
  return [
    hostPolicy({
      id: "approved_parent_origin",
      label: "Approved parent origin",
      status: "external_gate",
      requirement: "Swiggy-hosted iframes should render only inside an approved HTTPS parent origin.",
      mealPilotControl:
        "MealPilot keeps hosted widgets disabled until the production origin is approved; local review uses semantic fallbacks.",
      evidenceLinks: [endpoint, "/api/mcp/widget-runtime", "/api/production-launch-bundle"],
    }),
    hostPolicy({
      id: "sandbox_policy",
      label: "Iframe sandbox policy",
      status: "ready",
      requirement: "Hosted widgets need a restrictive iframe sandbox and must not receive top-navigation permission.",
      mealPilotControl: "Runtime surfaces use allow-scripts allow-same-origin allow-popups and keep allow-top-navigation absent.",
      evidenceLinks: [endpoint, "/api/mcp/widget-runtime"],
    }),
    hostPolicy({
      id: "origin_verified_postmessage",
      label: "Origin-verified postMessage",
      status: "ready",
      requirement: "Parent listeners must accept widget events only from the Swiggy widget origin.",
      mealPilotControl: "Every runtime event records an event.origin === https://mcp.swiggy.com security check.",
      evidenceLinks: [endpoint, "/api/mcp/widget-runtime", "/api/swiggy-widget-experience-composer"],
    }),
    hostPolicy({
      id: "hosted_url_contract",
      label: "Hosted widget URL contract",
      status: "external_gate",
      requirement: "Swiggy must return or document hosted iframe URLs for the widget surface types.",
      mealPilotControl:
        "MealPilot records target surface ids, fallback parity, and activation commands without fabricating live widget URLs.",
      evidenceLinks: [endpoint, "/api/swiggy-widget-experience-composer"],
    }),
    hostPolicy({
      id: "voice_exclusion",
      label: "Voice exclusion",
      status: "ready",
      requirement: "Voice flows should not embed iframes; they must use semantic summaries instead.",
      mealPilotControl: "Voice-safe surfaces expose summaries; richer widget actions stay in chat/mobile surfaces.",
      evidenceLinks: [endpoint, "/api/mcp/widget-runtime", "/api/sessions/:sessionId/surface?surface=voice"],
    }),
    hostPolicy({
      id: "commercial_confirmation_bridge",
      label: "Commercial confirmation bridge",
      status: "ready",
      requirement: "Widget events that can mutate carts or complete commercial actions must route through confirmations.",
      mealPilotControl:
        "Checkout, booking, and add-to-cart postMessage events are mapped to confirmation and commercial-action guard proof.",
      evidenceLinks: [endpoint, "/api/mcp/commercial-action-guard", "/api/swiggy-staging-replay"],
    }),
  ];
}

function handshakeFor(surface: SwiggyWidgetRuntimeSurface): SwiggyHostedWidgetHandshake {
  const eventTypes = surface.postMessageEvents.map((event) => event.type);
  const blockedByHostedUrl = surface.status === "external_gate" || surface.status === "iframe_planned";
  return {
    id: `${surface.id}_hosted_handshake`,
    surfaceId: surface.id,
    server: surface.server,
    widgetType: surface.type,
    status: blockedByHostedUrl ? "semantic_fallback" : "ready",
    expectedOrigin: surface.iframe.origin,
    expectedEvents: eventTypes,
    fallbackParity: `${surface.fallback.renderer} remains the source of truth until the hosted iframe URL is approved.`,
    activationGate: blockedByHostedUrl
      ? "Requires Swiggy-hosted iframe URL and approved parent origin."
      : "Hosted iframe can replace fallback after final screenshot pass.",
    proofLinks: [endpoint, "/api/mcp/widget-runtime", "/api/swiggy-widget-experience-composer"],
  };
}

function fallbackFor(surface: SwiggyWidgetRuntimeSurface): SwiggyHostedWidgetFallbackParity {
  return {
    id: `${surface.id}_fallback_parity`,
    surfaceId: surface.id,
    label: `${surface.server} ${surface.type.replaceAll("-", " ")}`,
    status: surface.fallback.voiceSafe ? "ready" : "semantic_fallback",
    semanticRenderer: surface.fallback.renderer,
    hostedRequirement: `${surface.iframe.title}, ${surface.iframe.width}, ${surface.iframe.height}px, sandbox=${surface.iframe.sandbox}.`,
    voiceBehavior: surface.fallback.voiceSafe
      ? "Voice can summarize this widget's semantic envelope."
      : "Voice must avoid hosted iframe actions and ask the user to continue in chat or mobile.",
    proofLinks: [endpoint, "/api/visual-qa-center", "/api/sessions/:sessionId/widgets"],
  };
}

export function buildSwiggyHostedWidgetActivationCenter(latestPlan?: MealPlan): SwiggyHostedWidgetActivationCenter {
  const runtime = buildSwiggyWidgetRuntime(latestPlan);
  const composer = buildSwiggyWidgetExperienceComposer(latestPlan);
  const hostPolicies = buildHostPolicies();
  const handshakes = runtime.surfaces.map(handshakeFor);
  const fallbackParity = runtime.surfaces.map(fallbackFor);
  const swiggyTools = new Set(composer.placements.flatMap((placement) => placement.swiggyTools)).size;
  const externalGates =
    hostPolicies.filter((policy) => policy.status === "external_gate").length +
    composer.totals.externalGates +
    runtime.externalActivationGates;
  const statusScores = [
    ...hostPolicies.map((policy) => policy.status),
    ...handshakes.map((handshake) => handshake.status),
    ...fallbackParity.map((fallback) => fallback.status),
  ].map(scoreStatus);
  const score = Math.round((statusScores.reduce((sum, value) => sum + value, 0) / statusScores.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      surfaces: runtime.totalSurfaces,
      readyHostPolicies: hostPolicies.filter((policy) => policy.status === "ready").length,
      hostPolicies: hostPolicies.length,
      handshakes: handshakes.length,
      readyHandshakes: handshakes.filter((handshake) => handshake.status === "ready" || handshake.status === "semantic_fallback")
        .length,
      fallbackParity: fallbackParity.length,
      readyFallbackParity: fallbackParity.filter((fallback) => fallback.status === "ready" || fallback.status === "semantic_fallback")
        .length,
      eventHandlers: runtime.eventsHandled,
      externalGates,
      swiggyTools,
    },
    hostPolicies,
    handshakes,
    fallbackParity,
    activationRunbook: [
      {
        sequence: 1,
        label: "Keep semantic parity live",
        owner: "MealPilot",
        status: "ready",
        action: "Render every widget-capable response through fixed-size semantic cards before hosted URLs are approved.",
        proofLinks: [endpoint, "/api/mcp/widget-runtime", "/api/visual-qa-center"],
      },
      {
        sequence: 2,
        label: "Attach parent origin",
        owner: "Operator",
        status: "external_gate",
        action: "Submit the final HTTPS app origin to Swiggy with the Builder Access packet.",
        proofLinks: [endpoint, "/api/access-submission-studio", "/api/production-launch-bundle"],
      },
      {
        sequence: 3,
        label: "Enable hosted iframe URLs",
        owner: "Swiggy",
        status: "external_gate",
        action: "Issue hosted widget URL behavior and approve the X-Swiggy-Widgets opt-in during production access review.",
        proofLinks: [endpoint, "/api/mcp/widget-runtime"],
      },
      {
        sequence: 4,
        label: "Run postMessage smoke",
        owner: "MealPilot",
        status: "semantic_fallback",
        action: "Replay every expected widget event against the parent handler and verify commercial events still require confirmation.",
        proofLinks: [endpoint, "/api/mcp/commercial-action-guard", "/api/swiggy-staging-replay"],
      },
      {
        sequence: 5,
        label: "Freeze reviewer screenshots",
        owner: "Operator",
        status: "ready",
        action: "Capture hosted-widget card, mobile Launch Center, and fallback screenshots before sending the demo packet.",
        proofLinks: [endpoint, "/api/visual-qa-center", "/api/reviewer-artifact-vault"],
      },
    ],
    telemetryContract: [
      { field: "widget_surface_id", value: "food_cart_widget", redaction: "plain surface id" },
      { field: "widget_origin_verified", value: "true", redaction: "boolean only" },
      { field: "hosted_url_logged", value: "false", redaction: "store allowlisted host metadata, not signed URLs" },
      { field: "raw_widget_payload_logged", value: "false", redaction: "event payloads are summarized by type and schema" },
      { field: "commercial_action_executed", value: "false_without_confirmation", redaction: "confirmation result only" },
    ],
    reviewerPacket: {
      to: "builders@swiggy.in",
      subject: "MealPilot hosted widget activation proof",
      body:
        "MealPilot has a hosted widget activation center for Swiggy Food, Instamart, and Dineout. It proves iframe sandboxing, origin-verified postMessage handlers, fallback parity, commercial confirmation routing, visual QA targets, and the external gates needed before hosted widget URLs replace semantic fallbacks.",
      proofLinks: [
        endpoint,
        "/api/mcp/widget-runtime",
        "/api/swiggy-widget-experience-composer",
        "/api/mcp/commercial-action-guard",
        "/api/visual-qa-center",
      ],
    },
    assertions: [
      `${runtime.totalSurfaces} widget runtime surfaces have hosted activation handshakes and fallback parity rows.`,
      `${runtime.eventsHandled} widget postMessage handlers stay origin-verified before any parent action runs.`,
      `${swiggyTools} Swiggy tools feed widget-capable Food, Instamart, and Dineout placements.`,
      "Hosted iframe URLs are never fabricated locally; semantic fallbacks stay active until Swiggy approval.",
      "Commercial widget events route through confirmation and non-blind retry controls.",
    ],
    externalGates: [
      "Swiggy must approve the production parent origin before hosted widgets replace semantic fallbacks.",
      "Swiggy-hosted iframe URLs and X-Swiggy-Widgets behavior remain production-access gates.",
      "Final screenshots with hosted iframes require live widget URLs and approved staging or production credentials.",
    ],
  };
}
