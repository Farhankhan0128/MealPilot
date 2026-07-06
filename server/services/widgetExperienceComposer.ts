import type {
  MealPlan,
  SwiggyServer,
  SwiggyWidgetExperienceComposer,
  SwiggyWidgetExperienceGalleryState,
  SwiggyWidgetExperiencePlacement,
  SwiggyWidgetExperiencePlacementName,
  SwiggyWidgetExperienceStatus,
  SwiggyWidgetRuntimeSurface,
} from "../../src/domain/types.js";
import { buildSwiggyWidgetRuntime } from "./widgetRuntime.js";

const composerEndpoint = "/api/swiggy-widget-experience-composer";
const runtimeEndpoint = "/api/mcp/widget-runtime";
const visualQaEndpoint = "/api/visual-qa-center";
const sessionWidgetsEndpoint = "/api/sessions/:sessionId/widgets";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
];

function serverLabel(server: SwiggyServer) {
  return server === "food" ? "Food" : server === "instamart" ? "Instamart" : "Dineout";
}

function placementFor(surface: SwiggyWidgetRuntimeSurface): SwiggyWidgetExperiencePlacementName {
  if (surface.type === "cart-widget") return "ops_review";
  if (surface.type === "menu-item" || surface.type === "slot-picker") return "mobile_sheet";
  if (surface.fallback.voiceSafe) return "recommendation_card";
  return "planner";
}

function statusFor(surface: SwiggyWidgetRuntimeSurface): SwiggyWidgetExperienceStatus {
  if (surface.status === "hosted_ready") return "ready";
  if (surface.status === "external_gate") return "external_gate";
  if (surface.status === "fallback_ready" || surface.status === "iframe_planned") return "semantic_fallback";
  return "watch";
}

function safetyGateFor(surface: SwiggyWidgetRuntimeSurface) {
  if (surface.type === "cart-widget") {
    return "Refresh authoritative cart state, show item/total delta, and require explicit confirmation before mutation.";
  }
  if (surface.type === "slot-picker") {
    return "Refresh available slots and confirm party size, offer, and booking intent before create_cart or book_table.";
  }
  if (surface.type === "menu-item" || surface.type === "product-card") {
    return "Refresh item or product details and stage add-to-cart instead of executing a commercial action directly.";
  }
  return "Use fresh restaurant details and keep raw Swiggy identifiers out of the visible UI.";
}

function nextActionFor(surface: SwiggyWidgetRuntimeSurface) {
  if (surface.status === "external_gate") {
    return "Enable hosted iframe URLs after Swiggy grants widget production access and the parent origin is approved.";
  }
  return "Keep semantic fallback rendering active, then swap to hosted iframe source when Swiggy returns a widget URL.";
}

function buildPlacement(surface: SwiggyWidgetRuntimeSurface, index: number): SwiggyWidgetExperiencePlacement {
  const eventHandlers = surface.postMessageEvents.map((event) => event.type);
  return {
    id: `${surface.id}_experience`,
    sequence: index + 1,
    label: `${serverLabel(surface.server)} ${surface.type.replaceAll("-", " ")}`,
    server: surface.server,
    widgetType: surface.type,
    sourceSurfaceId: surface.id,
    placement: placementFor(surface),
    status: statusFor(surface),
    swiggyTools: surface.returnedByTools,
    uiContract: `${surface.iframe.width}, ${surface.iframe.height}px, ${surface.iframe.title}, sandbox=${surface.iframe.sandbox}.`,
    fallbackRenderer: surface.fallback.renderer,
    eventHandlers,
    safetyGate: safetyGateFor(surface),
    proofLinks: [composerEndpoint, runtimeEndpoint, visualQaEndpoint, sessionWidgetsEndpoint],
    nextAction: nextActionFor(surface),
  };
}

function buildGalleryStates(placements: SwiggyWidgetExperiencePlacement[]): SwiggyWidgetExperienceGalleryState[] {
  return [
    {
      id: "desktop_launch_center",
      label: "Desktop Launch Center",
      status: "semantic_fallback",
      viewport: "desktop",
      evidenceLinks: [composerEndpoint, runtimeEndpoint, visualQaEndpoint],
      fallbackSummary: `${placements.length} Swiggy widget placements render as premium proof cards before hosted iframes are approved.`,
    },
    {
      id: "tablet_planner_review",
      label: "Tablet planner review",
      status: "semantic_fallback",
      viewport: "tablet",
      evidenceLinks: [composerEndpoint, visualQaEndpoint],
      fallbackSummary: "Restaurant, cart, product, and booking fallbacks keep fixed dimensions and readable totals on tablet.",
    },
    {
      id: "mobile_widget_sheet",
      label: "Mobile widget sheet",
      status: "semantic_fallback",
      viewport: "mobile",
      evidenceLinks: [composerEndpoint, visualQaEndpoint],
      fallbackSummary: "Menu items and slot pickers collapse into one-column sheets with confirmation-first CTA sequencing.",
    },
    {
      id: "voice_companion",
      label: "Voice companion fallback",
      status: "ready",
      viewport: "voice",
      evidenceLinks: [composerEndpoint, "/api/mcp/state-orchestrator"],
      fallbackSummary: "Voice mode skips iframes and speaks at most three safe options from the semantic data envelope.",
    },
    {
      id: "hosted_widget_gate",
      label: "Hosted widget activation gate",
      status: "external_gate",
      viewport: "review",
      evidenceLinks: [composerEndpoint, runtimeEndpoint, "/api/production-launch-bundle"],
      fallbackSummary: "Swiggy-hosted iframe URLs, approved parent origin, and X-Swiggy-Widgets remain explicit approval gates.",
    },
  ];
}

export function buildSwiggyWidgetExperienceComposer(latestPlan?: MealPlan): SwiggyWidgetExperienceComposer {
  const runtime = buildSwiggyWidgetRuntime(latestPlan);
  const placements = runtime.surfaces.map(buildPlacement);
  const toolsCovered = new Set(placements.flatMap((placement) => placement.swiggyTools)).size;
  const proofLinks = new Set(placements.flatMap((placement) => placement.proofLinks)).size;
  const semanticFallbacks = placements.filter((placement) => placement.status === "semantic_fallback").length;
  const externalGates = placements.filter((placement) => placement.status === "external_gate").length;
  const ready = placements.filter((placement) => placement.status === "ready").length;
  const watch = placements.filter((placement) => placement.status === "watch").length;
  const eventHandlers = placements.reduce((sum, placement) => sum + placement.eventHandlers.length, 0);
  const galleryStates = buildGalleryStates(placements);
  const reviewReadyPlacements = ready + semanticFallbacks + externalGates * 0.9;
  const score = Math.min(
    100,
    Math.round(
      (placements.length ? reviewReadyPlacements / placements.length : 0) * 55 +
        (eventHandlers >= runtime.eventsHandled ? 20 : 12) +
        (galleryStates.length >= 5 ? 15 : 8) +
        (toolsCovered >= 18 ? 10 : 6),
    ),
  );

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      placements: placements.length,
      ready,
      semanticFallbacks,
      externalGates,
      watch,
      toolsCovered,
      eventHandlers,
      proofLinks,
    },
    placements,
    galleryStates,
    activationRunbook: [
      {
        sequence: 1,
        label: "Render semantic fallback",
        owner: "MealPilot",
        action: "Keep every Swiggy widget-capable response visible through typed data-envelope cards before hosted URLs exist.",
        proofLinks: [composerEndpoint, runtimeEndpoint, sessionWidgetsEndpoint],
      },
      {
        sequence: 2,
        label: "Verify iframe shell",
        owner: "MealPilot",
        action: "Use the runtime sandbox, title, HTTPS, theme, and no-top-navigation contract for every future hosted iframe.",
        proofLinks: [runtimeEndpoint, visualQaEndpoint],
      },
      {
        sequence: 3,
        label: "Wire postMessage handlers",
        owner: "MealPilot",
        action: "Accept widget events only from https://mcp.swiggy.com and route all commercial actions through confirmation gates.",
        proofLinks: [composerEndpoint, runtimeEndpoint, "/api/mcp/commercial-action-guard"],
      },
      {
        sequence: 4,
        label: "Request hosted widget activation",
        owner: "Swiggy",
        action: "Approve the parent origin, hosted widget URLs, and X-Swiggy-Widgets behavior during production access review.",
        proofLinks: [composerEndpoint, "/api/production-launch-bundle"],
      },
    ],
    assertions: [
      `${placements.length}/${runtime.totalSurfaces} runtime surfaces have a premium experience placement.`,
      `${eventHandlers} postMessage event handlers are mapped to user-visible safety gates.`,
      `${galleryStates.length} gallery states cover desktop, tablet, mobile, voice, and hosted-widget review.`,
      `${toolsCovered} unique Swiggy tools feed widget-capable placements across Food, Instamart, and Dineout.`,
    ],
    externalGates: [
      "Swiggy-hosted iframe URLs are enabled only after production access approval.",
      "The production parent origin and HTTPS redirect URI must be approved before hosted widgets replace semantic fallbacks.",
      "X-Swiggy-Widgets remains an opt-in gate until Swiggy confirms header behavior for MealPilot.",
    ],
  };
}
