import type {
  MealPlan,
  SwiggyServer,
  SwiggyWidget,
  SwiggyWidgetActivationCheck,
  SwiggyWidgetBridgeRule,
  SwiggyWidgetRenderContract,
  SwiggyWidgetRuntimeReport,
  SwiggyWidgetRuntimeSurface,
} from "../../src/domain/types.js";
import { buildWidgets } from "./productionEvidence.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/docs/build/widgets/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/voice-vs-chat/",
  "https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state/",
  "https://mcp.swiggy.com/builders/docs/reference/capabilities/",
];

const widgetOrigin = "https://mcp.swiggy.com";
const sandbox = "allow-scripts allow-same-origin allow-popups";

function titleFor(server: SwiggyServer, type: SwiggyWidget["type"]) {
  const serverLabel = server === "food" ? "Food" : server === "instamart" ? "Instamart" : "Dineout";
  return `Swiggy ${serverLabel} ${type.replace("-", " ")}`;
}

function event(type: string, payload: string, handledBy: string) {
  return {
    type,
    direction: "widget_to_parent" as const,
    payload,
    handledBy,
    securityCheck: "Accept only when event.origin equals https://mcp.swiggy.com.",
  };
}

function surface(options: {
  id: string;
  server: SwiggyServer;
  type: SwiggyWidget["type"];
  returnedByTools: string[];
  purpose: string;
  width: string;
  height: number;
  renderer: string;
  voiceSafe: boolean;
  fallbackSummary: string;
  status: SwiggyWidgetRuntimeSurface["status"];
  events: Array<{ type: string; payload: string; handledBy: string }>;
}): SwiggyWidgetRuntimeSurface {
  return {
    id: options.id,
    server: options.server,
    type: options.type,
    returnedByTools: options.returnedByTools,
    purpose: options.purpose,
    iframe: {
      width: options.width,
      height: options.height,
      title: titleFor(options.server, options.type),
      sandbox,
      origin: widgetOrigin,
      themeQuery: "light|dark",
      allowTopNavigation: false,
      parentRequiresHttps: true,
    },
    postMessageEvents: options.events.map((item) => event(item.type, item.payload, item.handledBy)),
    fallback: {
      mode: "semantic_data_envelope",
      renderer: options.renderer,
      voiceSafe: options.voiceSafe,
      summary: options.fallbackSummary,
    },
    status: options.status,
  };
}

function buildSurfaces(): SwiggyWidgetRuntimeSurface[] {
  return [
    surface({
      id: "food_restaurant_card",
      server: "food",
      type: "restaurant-card",
      returnedByTools: ["search_restaurants", "get_restaurant_menu"],
      purpose: "Render one restaurant with provider, rating, ETA, delivery context, and view-menu action.",
      width: "100%; max-width: 420px",
      height: 180,
      renderer: "Launch Center restaurant comparison card and Production Evidence widget list.",
      voiceSafe: true,
      fallbackSummary: "Spoken and chat fallback includes provider, ETA, total, rating, and menu affordance without raw IDs.",
      status: "iframe_planned",
      events: [
        {
          type: "restaurant-card.clicked",
          payload: "{ restaurantId, provider, action }",
          handledBy: "Open menu preview after a fresh get_restaurant_menu read.",
        },
        {
          type: "restaurant-card.menu-requested",
          payload: "{ restaurantId, provider }",
          handledBy: "Request menu details and keep restaurant switch warnings active.",
        },
      ],
    }),
    surface({
      id: "food_menu_item",
      server: "food",
      type: "menu-item",
      returnedByTools: ["get_restaurant_menu", "search_menu"],
      purpose: "Render item name, price, variants, add-ons, dietary cue, and add-to-cart affordance.",
      width: "100%; max-width: 420px",
      height: 240,
      renderer: "Chat menu card with explicit add-to-cart confirmation gate.",
      voiceSafe: false,
      fallbackSummary: "Voice summarizes at most three dishes; chat can show richer menu rows and add-on choices.",
      status: "iframe_planned",
      events: [
        {
          type: "menu-item.add-to-cart",
          payload: "{ restaurantId, itemId, quantity, variants, addons }",
          handledBy: "Stage cart mutation only after user confirmation and a fresh cart read.",
        },
      ],
    }),
    surface({
      id: "food_cart_widget",
      server: "food",
      type: "cart-widget",
      returnedByTools: ["get_food_cart", "update_food_cart", "apply_coupon", "remove_coupon", "place_food_order"],
      purpose: "Render prepared food cart, coupon state, quantity changes, and checkout request.",
      width: "100%; max-width: 480px",
      height: 320,
      renderer: "Production Evidence cart fallback and MCP replay confirmation summary.",
      voiceSafe: false,
      fallbackSummary: "Cart fallback lists item count, total, coupon state, and checkout lock until explicit confirmation.",
      status: "iframe_planned",
      events: [
        {
          type: "cart.item-removed",
          payload: "{ cartId, lineItemId }",
          handledBy: "Refresh get_food_cart and ask before removing the item.",
        },
        {
          type: "cart.quantity-changed",
          payload: "{ cartId, lineItemId, quantity }",
          handledBy: "Refresh get_food_cart and stage update_food_cart.",
        },
        {
          type: "cart.checkout-requested",
          payload: "{ cartId, total, paymentMode }",
          handledBy: "Run preflight and confirmation before place_food_order.",
        },
      ],
    }),
    surface({
      id: "instamart_product_card",
      server: "instamart",
      type: "product-card",
      returnedByTools: ["search_products", "get_product_details", "your_go_to_items"],
      purpose: "Render grocery product, pack size, variant, price, availability, and add-to-cart action.",
      width: "100%; max-width: 420px",
      height: 240,
      renderer: "Grocery restock card and pantry suggestion row.",
      voiceSafe: true,
      fallbackSummary: "Fallback states product name, quantity, price, and stock status; raw spin IDs stay hidden.",
      status: "external_gate",
      events: [
        {
          type: "product.add-to-cart",
          payload: "{ spinId, quantity, variant }",
          handledBy: "Stage Instamart add after cart refresh and address check.",
        },
        {
          type: "product.variant-selected",
          payload: "{ spinId, variantId }",
          handledBy: "Refresh product details before cart mutation.",
        },
      ],
    }),
    surface({
      id: "instamart_cart_widget",
      server: "instamart",
      type: "cart-widget",
      returnedByTools: ["get_cart", "update_cart", "apply_coupon", "remove_coupon", "checkout"],
      purpose: "Render grocery basket, substitutions, slot-sensitive totals, and checkout request.",
      width: "100%; max-width: 480px",
      height: 320,
      renderer: "Pantry autopilot basket summary with address-switch guard.",
      voiceSafe: false,
      fallbackSummary: "Fallback keeps basket state separate from Food and warns before address changes clear the cart.",
      status: "external_gate",
      events: [
        {
          type: "cart.item-removed",
          payload: "{ cartId, spinId }",
          handledBy: "Refresh get_cart and stage update_cart.",
        },
        {
          type: "cart.quantity-changed",
          payload: "{ cartId, spinId, quantity }",
          handledBy: "Refresh get_cart before mutation.",
        },
        {
          type: "cart.checkout-requested",
          payload: "{ cartId, total, slotId }",
          handledBy: "Run availability and confirmation before checkout.",
        },
      ],
    }),
    surface({
      id: "dineout_restaurant_card",
      server: "dineout",
      type: "restaurant-card",
      returnedByTools: ["search_restaurants_dineout", "get_restaurant_details", "get_available_slots"],
      purpose: "Render dineout venue, rating, distance, offer context, availability, and details action.",
      width: "100%; max-width: 420px",
      height: 180,
      renderer: "Dineout venue comparison card with offer and distance warnings.",
      voiceSafe: true,
      fallbackSummary:
        "Fallback summarizes venue, rating, distance, offer, and next available slots without raw restaurant IDs.",
      status: "external_gate",
      events: [
        {
          type: "dineout.restaurant-card.clicked",
          payload: "{ restaurantId, action }",
          handledBy: "Open details from local semantic data until Swiggy publishes the Dineout hosted event contract.",
        },
        {
          type: "dineout.restaurant-card.slots-requested",
          payload: "{ restaurantId, date, partySize }",
          handledBy: "Refresh get_available_slots and keep far-distance warnings active.",
        },
      ],
    }),
    surface({
      id: "dineout_slot_picker",
      server: "dineout",
      type: "slot-picker",
      returnedByTools: ["get_available_slots", "create_cart", "book_table"],
      purpose: "Render restaurant slots, party size, offer context, and booking request.",
      width: "100%; max-width: 420px",
      height: 260,
      renderer: "Dineout reservation lane with stale-slot recovery.",
      voiceSafe: true,
      fallbackSummary: "Fallback presents up to three slots and confirms party size before creating or booking a cart.",
      status: "external_gate",
      events: [
        {
          type: "slot.selected",
          payload: "{ restaurantId, slotId, partySize }",
          handledBy: "Refresh get_available_slots before create_cart.",
        },
        {
          type: "slot.booking-requested",
          payload: "{ cartId, slotId, partySize }",
          handledBy: "Ask confirmation before book_table.",
        },
      ],
    }),
  ];
}

function buildBridgeRules(fallbackReady: number, surfaceCount: number): SwiggyWidgetBridgeRule[] {
  return [
    {
      id: "origin_verification",
      label: "Origin verification",
      status: "ready",
      rule: "Accept widget postMessage events only when event.origin is https://mcp.swiggy.com.",
      evidence: "All runtime surfaces declare the same securityCheck on every event.",
    },
    {
      id: "sandbox",
      label: "Iframe sandbox",
      status: "ready",
      rule: `Iframe sandbox is ${sandbox}.`,
      evidence: "The session widget bridge and runtime surfaces use the same sandbox contract.",
    },
    {
      id: "no_top_navigation",
      label: "No top navigation",
      status: "ready",
      rule: "Sandbox omits allow-top-navigation so widgets cannot navigate the parent page.",
      evidence: "allowTopNavigation is false on every runtime surface.",
    },
    {
      id: "https_parent",
      label: "HTTPS parent",
      status: "external_gate",
      rule: "Production parent page must be served over HTTPS before hosted Swiggy iframes are enabled.",
      evidence: "Local reviewer mode proves the contract; final HTTPS redirect is tracked in the Launch Bundle.",
    },
    {
      id: "no_dom_crossing",
      label: "No DOM crossing",
      status: "ready",
      rule: "Parent never reaches into iframe DOM; all interactions use postMessage and semantic fallbacks.",
      evidence: "Runtime events define payloads and handlers instead of DOM selectors.",
    },
    {
      id: "theme_query",
      label: "Theme query",
      status: "ready",
      rule: "Only light or dark theme query values are generated until custom brand theming ships.",
      evidence: "themeQuery is constrained to light|dark.",
    },
    {
      id: "voice_surface",
      label: "Voice fallback",
      status: "ready",
      rule: "Voice surfaces do not render iframes and present at most three spoken options.",
      evidence: "Voice-safe fallback flags are included per widget surface.",
    },
    {
      id: "semantic_fallback",
      label: "Semantic fallback",
      status: "ready",
      rule: "Every widget-capable tool response can render from semantic data without hosted widget availability.",
      evidence: `${fallbackReady}/${surfaceCount} runtime surfaces declare semantic_data_envelope fallback mode.`,
    },
  ];
}

function activationCheck(options: SwiggyWidgetActivationCheck): SwiggyWidgetActivationCheck {
  return options;
}

function buildActivationChecklist(options: {
  surfaces: SwiggyWidgetRuntimeSurface[];
  fallbackReady: number;
  eventsHandled: number;
}): SwiggyWidgetActivationCheck[] {
  const widgetDocs = officialSources[0];
  const voiceDocs = officialSources[1];
  const cartDocs = officialSources[2];
  const localRuntime = "/api/mcp/widget-runtime";

  return [
    activationCheck({
      id: "semantic_data_envelope",
      label: "Semantic envelope fallback",
      status: "ready",
      requirement: "Use the Swiggy data envelope when hosted widgets are absent.",
      mealPilotProof: `${options.fallbackReady}/${options.surfaces.length} surfaces render from semantic_data_envelope.`,
      evidenceLinks: [widgetDocs, localRuntime, "/api/sessions/:sessionId/widgets"],
    }),
    activationCheck({
      id: "iframe_size_matrix",
      label: "Iframe size matrix",
      status: "ready",
      requirement: "Size restaurant cards, menu items, carts, products, and slot pickers per widget type.",
      mealPilotProof: "Each surface declares max-width, height, title, origin, sandbox, and HTTPS requirements.",
      evidenceLinks: [widgetDocs, localRuntime],
    }),
    activationCheck({
      id: "postmessage_bridge",
      label: "postMessage bridge",
      status: "ready",
      requirement: "Handle widget events through a parent bridge rather than iframe DOM reads.",
      mealPilotProof: `${options.eventsHandled} widget_to_parent events map to MealPilot handlers and preflight gates.`,
      evidenceLinks: [widgetDocs, localRuntime],
    }),
    activationCheck({
      id: "origin_filter",
      label: "Origin filter",
      status: "ready",
      requirement: "Ignore postMessage events unless the origin is https://mcp.swiggy.com.",
      mealPilotProof: "Every event carries the same origin verification security check.",
      evidenceLinks: [widgetDocs, localRuntime],
    }),
    activationCheck({
      id: "iframe_sandbox",
      label: "Iframe sandbox",
      status: "ready",
      requirement: "Sandbox iframes with scripts, same-origin, and popups while omitting top navigation.",
      mealPilotProof: `All render contracts use ${sandbox} and allowTopNavigation=false.`,
      evidenceLinks: [widgetDocs, localRuntime],
    }),
    activationCheck({
      id: "no_dom_crossing",
      label: "No DOM crossing",
      status: "ready",
      requirement: "Treat postMessage as the only widget-client channel.",
      mealPilotProof: "Render contracts expose events and semantic fallbacks, not iframe selectors or DOM reach-ins.",
      evidenceLinks: [widgetDocs, localRuntime],
    }),
    activationCheck({
      id: "theme_switch",
      label: "Theme switch",
      status: "ready",
      requirement: "Prepare light/dark theme query support while hosted theming remains gated.",
      mealPilotProof: "The iframe contract limits themeQuery to light|dark and keeps custom brand theming external.",
      evidenceLinks: [widgetDocs, "/api/brand-compliance-kit"],
    }),
    activationCheck({
      id: "accessibility_titles",
      label: "Accessibility titles",
      status: "ready",
      requirement: "Give every iframe wrapper a meaningful title and preserve keyboard navigation.",
      mealPilotProof: "titleFor(server, type) generates screen-reader-friendly titles for every surface.",
      evidenceLinks: [widgetDocs, localRuntime],
    }),
    activationCheck({
      id: "voice_exclusion",
      label: "Voice exclusion",
      status: "ready",
      requirement: "Do not render widgets on voice or TTS surfaces; use concise spoken responses.",
      mealPilotProof: "Every surface declares voice behavior and voice responses stay capped at three options.",
      evidenceLinks: [voiceDocs, "/api/mcp/state-orchestrator", localRuntime],
    }),
    activationCheck({
      id: "fresh_cart_refresh",
      label: "Fresh cart refresh",
      status: "ready",
      requirement: "Refresh authoritative Food or Instamart cart state before widget-driven cart mutations.",
      mealPilotProof: "Cart event handlers stage get_*_cart reads before update, checkout, or order placement.",
      evidenceLinks: [cartDocs, "/api/mcp/state-orchestrator", localRuntime],
    }),
    activationCheck({
      id: "raw_id_hygiene",
      label: "Raw ID hygiene",
      status: "ready",
      requirement: "Keep raw restaurant IDs, spin IDs, cart tokens, and internal codes out of user-facing speech and cards.",
      mealPilotProof: "Fallback summaries expose names, totals, ETA, stock, and offers without raw IDs.",
      evidenceLinks: [voiceDocs, "/api/data-governance-center", localRuntime],
    }),
    activationCheck({
      id: "launch_observability",
      label: "Launch observability",
      status: "ready",
      requirement: "Preserve widget failures as traceable reviewer and support evidence.",
      mealPilotProof: "Widget Runtime links to production evidence, Launch Bundle, telemetry, and SLO incident artifacts.",
      evidenceLinks: ["/api/production-launch-bundle", "/api/runtime-telemetry", "/api/slo-incident-command"],
    }),
    activationCheck({
      id: "hosted_iframe_urls",
      label: "Hosted iframe URLs",
      status: "external_gate",
      requirement: "Wait for public https://mcp.swiggy.com/widgets/... iframe URLs before live embedding.",
      mealPilotProof: "MealPilot keeps all hosted URLs off by default and serves semantic fallbacks locally.",
      evidenceLinks: [widgetDocs, "/api/swiggy-upstream-watch", localRuntime],
    }),
    activationCheck({
      id: "opt_in_header",
      label: "Opt-in header",
      status: "external_gate",
      requirement: "Send X-Swiggy-Widgets: enabled only after Swiggy enables the v1.x hosted layer.",
      mealPilotProof: "The launch gate stores the planned header and keeps local review responses in fallback mode.",
      evidenceLinks: [widgetDocs, "/api/credential-onboarding", localRuntime],
    }),
    activationCheck({
      id: "https_parent",
      label: "HTTPS parent",
      status: "external_gate",
      requirement: "Serve the parent page over HTTPS before hosted widget activation.",
      mealPilotProof: "Localhost proves the contract; final HTTPS, redirect URI, and static IP checks remain in Launch Bundle.",
      evidenceLinks: [widgetDocs, "/api/production-launch-bundle"],
    }),
    activationCheck({
      id: "non_food_hosted_widgets",
      label: "Non-Food hosted widgets",
      status: "external_gate",
      requirement: "Keep Instamart and Dineout hosted widgets gated until Swiggy publishes those resources.",
      mealPilotProof:
        "Instamart product/cart and Dineout restaurant/slot surfaces are modeled as semantic fallbacks with hosted status gated.",
      evidenceLinks: [widgetDocs, "/api/swiggy-upstream-watch", localRuntime],
    }),
  ];
}

function buildRenderContracts(surfaces: SwiggyWidgetRuntimeSurface[]): SwiggyWidgetRenderContract[] {
  return surfaces.map((item) => ({
    id: item.id,
    server: item.server,
    type: item.type,
    status: item.status,
    iframeSize: `${item.iframe.width}; height: ${item.iframe.height}px`,
    returnedByTools: item.returnedByTools,
    postMessageEvents: item.postMessageEvents.map((message) => message.type),
    fallbackRenderer: item.fallback.renderer,
    accessibility: `${item.iframe.title} iframe title with keyboard navigation preserved inside the hosted widget.`,
    voiceBehavior: item.fallback.voiceSafe
      ? "May be summarized on voice as text only; iframe rendering remains chat/web-only."
      : "Do not render or narrate widget detail on voice; summarize the safe confirmation state instead.",
  }));
}

function calculateScore(options: {
  fallbackReady: number;
  totalSurfaces: number;
  bridgeRules: SwiggyWidgetBridgeRule[];
  readyActivationChecks: number;
  totalActivationChecks: number;
  renderContracts: SwiggyWidgetRenderContract[];
  eventsHandled: number;
}) {
  const bridgeReady = options.bridgeRules.filter((rule) => rule.status === "ready").length;
  const fallbackRatio = options.fallbackReady / options.totalSurfaces;
  const bridgeRatio = bridgeReady / options.bridgeRules.length;
  const activationRatio = options.readyActivationChecks / options.totalActivationChecks;
  const renderRatio = options.renderContracts.length / options.totalSurfaces;
  const eventRatio = Math.min(1, options.eventsHandled / 14);

  return Math.round(
    Math.min(100, fallbackRatio * 35 + bridgeRatio * 25 + activationRatio * 25 + renderRatio * 10 + eventRatio * 5),
  );
}

export function buildSwiggyWidgetRuntime(latestPlan?: MealPlan): SwiggyWidgetRuntimeReport {
  const surfaces = buildSurfaces();
  const fallbackReady = surfaces.filter((item) => item.fallback.mode === "semantic_data_envelope").length;
  const hostedReady = surfaces.filter((item) => item.status === "hosted_ready").length;
  const eventsHandled = surfaces.reduce((sum, item) => sum + item.postMessageEvents.length, 0);
  const sessionWidgets = latestPlan ? buildWidgets(latestPlan) : [];
  const bridgeRules = buildBridgeRules(fallbackReady, surfaces.length);
  const activationChecklist = buildActivationChecklist({ surfaces, fallbackReady, eventsHandled });
  const renderContracts = buildRenderContracts(surfaces);
  const readyActivationChecks = activationChecklist.filter((item) => item.status === "ready").length;
  const externalActivationGates = activationChecklist.filter((item) => item.status === "external_gate").length;
  const score = calculateScore({
    fallbackReady,
    totalSurfaces: surfaces.length,
    bridgeRules,
    readyActivationChecks,
    totalActivationChecks: activationChecklist.length,
    renderContracts,
    eventsHandled,
  });

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalSurfaces: surfaces.length,
    fallbackReady,
    hostedReady,
    eventsHandled,
    totalActivationChecks: activationChecklist.length,
    readyActivationChecks,
    externalActivationGates,
    optInHeader: {
      name: "X-Swiggy-Widgets",
      plannedValue: "enabled",
      status: "external_gate",
      mealPilotBehavior:
        "MealPilot stores the opt-in as a launch gate and renders semantic data-envelope fallbacks until hosted iframes are live.",
    },
    surfaces,
    bridgeRules,
    activationChecklist,
    renderContracts,
    sessionWidgets,
    assertions: [
      "Every Food, Instamart, and Dineout widget surface has a semantic fallback before hosted iframe availability.",
      "Widget activation checks preserve the current Swiggy v1.0 hosted-URL and opt-in-header gates while proving local readiness.",
      "The render contract matrix gives every surface an iframe size, accessibility title, event list, and fallback renderer.",
      "Widget postMessage events are ignored unless they originate from https://mcp.swiggy.com.",
      "Voice responses skip iframe rendering and keep IDs, raw cart tokens, restaurant IDs, and spin IDs out of speech.",
      "Cart-touching widget events require an authoritative cart or slot refresh before any mutation or commercial action.",
      "Session-scoped widget contracts remain semantic_fallback until Swiggy enables hosted widget resources and opt-in headers.",
    ],
    externalGates: [
      "Hosted iframe widget URLs and X-Swiggy-Widgets: enabled opt-in are gated by Swiggy v1.x rollout.",
      "Instamart and Dineout hosted widgets remain roadmap-gated until Swiggy ships non-Food widget resources.",
      "Final production HTTPS parent, redirect URI, and production credentials must be approved before hosted widget activation.",
    ],
  };
}
