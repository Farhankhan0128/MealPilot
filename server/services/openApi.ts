import type { ServerConfig } from "../config.js";

export function buildOpenApiDocument(config: ServerConfig) {
  return {
    openapi: "3.1.0",
    info: {
      title: "MealPilot India API",
      version: "1.0.0",
      description:
        "Full-stack Swiggy MCP Builder Access demo API for meal planning, confirmation gates, demo evidence, and production readiness.",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: `${config.swiggyMode} local runtime`,
      },
    ],
    tags: [
      { name: "Core", description: "Health, config, profile, and planning" },
      { name: "Commerce", description: "Confirmation, tracking, preflight, replay, and widgets" },
      { name: "Builder Access", description: "Application, launch, evidence, and submission artifacts" },
      { name: "Operations", description: "Readiness, privacy, scheduling, and support" },
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["Core"],
          summary: "Liveness probe",
          responses: { "200": { description: "API is live" } },
        },
      },
      "/api/ready": {
        get: {
          tags: ["Operations"],
          summary: "Readiness probe with build and runtime checks",
          responses: { "200": { description: "Runtime is ready for local demo traffic" } },
        },
      },
      "/api/config": {
        get: {
          tags: ["Core"],
          summary: "Public runtime configuration",
          responses: { "200": { description: "Mode, redirect URI, scope, and requested Swiggy servers" } },
        },
      },
      "/api/plan": {
        post: {
          tags: ["Core"],
          summary: "Create a three-server MealPilot plan",
          responses: { "201": { description: "Plan session with Food, Instamart, and Dineout recommendations" } },
        },
      },
      "/api/confirm": {
        post: {
          tags: ["Commerce"],
          summary: "Confirm one prepared commercial action",
          responses: { "200": { description: "Updated plan with one confirmed recommendation" } },
        },
      },
      "/api/confirm-all": {
        post: {
          tags: ["Commerce"],
          summary: "Confirm all prepared recommendations for demo speed",
          responses: { "200": { description: "Updated plan with separate audit entries per action" } },
        },
      },
      "/api/sessions/{sessionId}": {
        get: {
          tags: ["Core"],
          summary: "Fetch a plan session",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Stored plan" }, "404": { description: "Session not found" } },
        },
      },
      "/api/sessions/{sessionId}/preflight": {
        get: {
          tags: ["Commerce"],
          summary: "Cart and booking preflight report",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Preflight checks and offer opportunities" } },
        },
      },
      "/api/sessions/{sessionId}/replay": {
        get: {
          tags: ["Commerce"],
          summary: "Replayable MCP JSON-RPC transcript",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "JSON-RPC tools/call replay steps" } },
        },
      },
      "/api/sessions/{sessionId}/staging-transcript": {
        get: {
          tags: ["Commerce"],
          summary: "Swiggy staging transcript export",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description:
                "Session-scoped JSONL and Markdown transcript with certification waves, redacted request/response previews, retry policy, support envelope, and evidence links",
            },
          },
        },
      },
      "/api/sessions/{sessionId}/widgets": {
        get: {
          tags: ["Commerce"],
          summary: "Swiggy widget contracts and semantic fallbacks",
          parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Widget metadata and postMessage bridge rules" } },
        },
      },
      "/api/mcp/catalog": {
        get: {
          tags: ["Builder Access"],
          summary: "35-tool Swiggy MCP coverage matrix",
          responses: { "200": { description: "Food, Instamart, and Dineout coverage" } },
        },
      },
      "/api/mcp/tool-lab": {
        get: {
          tags: ["Builder Access"],
          summary: "Executable Swiggy MCP Tool Lab for all 35 official tools",
          responses: { "200": { description: "JSON-RPC probes, safety classes, retry policies, and innovation use cases" } },
        },
      },
      "/api/mcp/capability-registry": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy MCP capability registry for tools, resources, prompts, metadata, widgets, and auth",
          responses: {
            "200": {
              description:
                "Unified registry covering mcp:tools, mcp:resources, mcp:prompts, OAuth metadata, widget contracts, and external gates",
            },
          },
        },
      },
      "/api/mcp/resource-prompt-studio": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy MCP Resource and Prompt Studio for resources/list, resources/read, prompts/list, and prompts/get",
          responses: {
            "200": {
              description:
                "Server-by-server MCP resource and prompt inventory with sample read/get payloads, smoke requests, MealPilot uses, and live Swiggy staging gates",
            },
          },
        },
      },
      "/api/mcp/tool-contract-matrix": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy MCP tool contract matrix for all Food, Instamart, and Dineout tools",
          responses: {
            "200": {
              description:
                "Machine-readable parameter, response envelope, retry, confirmation, error bucket, and fixture contracts for all 35 official Swiggy MCP tools",
            },
          },
        },
      },
      "/api/mcp/scenario-runner": {
        get: {
          tags: ["Builder Access"],
          summary: "Executable Swiggy official recipe scenario runner",
          responses: {
            "200": {
              description:
                "Mock JSON-RPC execution traces for Food, Instamart, Dineout, combined recipes, guard/recovery probes, confirmations, external gates, and all 35 tools",
            },
          },
        },
      },
      "/api/mcp/state-orchestrator": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy multi-turn cart state and voice/chat response orchestrator",
          responses: {
            "200": {
              description:
                "Authoritative cart refresh rules, server-boundary state models, switch guards, stale-cart recovery, voice/chat contracts, and confirmation gates",
            },
          },
        },
      },
      "/api/mcp/widget-runtime": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy widget iframe, postMessage, and semantic fallback runtime",
          responses: {
            "200": {
              description:
                "Widget surface matrix for Food, Instamart, and Dineout with iframe sandboxing, origin checks, postMessage handlers, activation checks, render contracts, voice rules, opt-in gates, and semantic fallbacks",
            },
          },
        },
      },
      "/api/mcp/commercial-action-guard": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy commercial action confirmation and non-blind retry guard",
          responses: {
            "200": {
              description:
                "Food place_food_order, Instamart checkout, Dineout book_table, and combined journey guardrails with fresh reads, explicit confirmations, check-then-retry drills, telemetry, support packets, and external gates",
            },
          },
        },
      },
      "/api/mcp/backpressure-governor": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy MCP adaptive backpressure and future rate-limit governor",
          responses: {
            "200": {
              description:
                "Token buckets, queue discipline, Retry-After handling, tracking cadence, voice burst shaping, background-job gates, telemetry fields, and capacity email for Swiggy MCP rate-limit readiness",
            },
          },
        },
      },
      "/api/mcp/staging-cutover": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy staging cutover rehearsal for real MCP transport",
          responses: {
            "200": {
              description:
                "Credential, OAuth, Streamable HTTP, first-call probe, retry, support, 48-hour staging soak, and production promotion rehearsal for Food, Instamart, and Dineout",
            },
          },
        },
      },
      "/api/swiggy-builders-map": {
        get: {
          tags: ["Builder Access"],
          summary: "Official Swiggy Builders website, CTA, and capability map",
          responses: { "200": { description: "Pages, CTAs, tool coverage, innovation opportunities, and credential gates" } },
        },
      },
      "/api/swiggy-website-atlas": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders website header, footer, page module, and CTA atlas",
          responses: { "200": { description: "Global navigation, docs navigation, footer groups, page modules, CTAs, and coverage assertions" } },
        },
      },
      "/api/swiggy-builder-intake": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builder Intake Command Center for every signup, apply, demo, contact, and docs CTA",
          responses: {
            "200": {
              description:
                "Actionable CTA map, access submission fields, demo storyboard, outbound drafts, checklist, manual inputs, and external Swiggy gates",
            },
          },
        },
      },
      "/api/swiggy-faq-policy": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy FAQ and policy coverage center",
          responses: {
            "200": {
              description:
                "Homepage, developer, enterprise, access-guideline, footer-resource, allowed, restricted, prohibited, operating-principle, and legal coverage mapped to MealPilot evidence",
            },
          },
        },
      },
      "/api/swiggy-growth-partnership": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Growth Partnership Center for co-marketing and strategic launch proof",
          responses: {
            "200": {
              description:
                "Growth-partnership signals, GTM experiments, proof assets, metrics, partnership asks, and external co-marketing gates",
            },
          },
        },
      },
      "/api/channel-multimodal-studio": {
        get: {
          tags: ["Builder Access"],
          summary: "Channel and Multimodal Studio for Swiggy developer build lanes",
          responses: {
            "200": {
              description:
                "Voice, web chat, Slack/Teams, mobile camera, enterprise, and screenshot-to-order lane contracts with Swiggy MCP toolchains, safety controls, and external gates",
            },
          },
        },
      },
      "/api/nutrition-budget-intelligence": {
        get: {
          tags: ["Builder Access"],
          summary: "Nutrition and Budget Intelligence for Swiggy Food, Instamart, and Dineout routes",
          responses: {
            "200": {
              description:
                "Protein-per-rupee, coupon-safe, pantry-gap, group-budget, Dineout balance, and camera-label optimization routes with Swiggy MCP toolchains, nutrition safety controls, and external data gates",
            },
          },
        },
      },
      "/api/household-preference-graph": {
        get: {
          tags: ["Builder Access"],
          summary: "Household Preference Graph for consented Swiggy order, go-to item, and Dineout personalization",
          responses: {
            "200": {
              description:
                "Consent-aware personalization graph covering Food active orders, Instamart order history and go-to items, Dineout saved locations and booking status, household weights, forecasts, automations, retention rules, and external data gates",
            },
          },
        },
      },
      "/api/guest-collaboration-calendar": {
        get: {
          tags: ["Builder Access"],
          summary: "Guest Collaboration and Calendar Center for Swiggy group occasions",
          responses: {
            "200": {
              description:
                "Guest voting, occasion templates, Dineout-first collaboration, Food reminder handoffs, Instamart prep, calendar artifacts, voice briefs, Slack/Teams gates, and Swiggy confirmation controls",
            },
          },
        },
      },
      "/api/luxury-experience-workspace": {
        get: {
          tags: ["Builder Access"],
          summary: "Luxury Experience Workspace for Swiggy reservation and cart review surfaces",
          responses: {
            "200": {
              description:
                "Premium reservation, Food cart, Instamart basket, combined evening, and recovery workspaces with concierge modes, all-tool Swiggy coverage, widget fallbacks, voice contracts, telemetry, and confirmation controls",
            },
          },
        },
      },
      "/api/reviewer-artifact-vault": {
        get: {
          tags: ["Builder Access"],
          summary: "Reviewer Artifact Vault for Swiggy access submission proof",
          responses: {
            "200": {
              description:
                "One-stop reviewer artifact manifest covering proof links, OpenAPI, smoke commands, screenshot targets, demo-video checklist, logs, traces, redaction rules, support context, and Swiggy handoff email",
            },
          },
        },
      },
      "/api/visual-qa-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Visual QA Center for MealPilot reviewer screenshot and layout evidence",
          responses: {
            "200": {
              description:
                "Viewport targets, selector manifests, screenshot artifact paths, text-fit and no-overlap rules, widget fallback checks, mobile layout checks, redaction rules, and manual/automation gates for Swiggy review",
            },
          },
        },
      },
      "/api/swiggy-docs-coverage": {
        get: {
          tags: ["Builder Access"],
          summary: "Page-by-page Swiggy llms.txt documentation coverage audit",
          responses: {
            "200": {
              description:
                "All llms.txt-linked docs pages grouped by section with rendered links, markdown links, MealPilot evidence, and remaining gates",
            },
          },
        },
      },
      "/api/swiggy-docs-twin-explorer": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy docs twin explorer for every llms.txt markdown and rendered page pair",
          responses: {
            "200": {
              description:
                "Official llms.txt documentation explorer with markdown twin URLs, rendered page URLs, section groups, retrieval lanes, proof links, assertions, and drift gates for all Swiggy Builders docs pages",
            },
          },
        },
      },
      "/api/swiggy-upstream-watch": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy upstream docs, changelog, and roadmap watch center",
          responses: {
            "200": {
              description:
                "Tracks llms.txt, llms-full.txt, v1.0 shipped capabilities, v1.1/v1.2/v2 roadmap items, signed manifest watch, action queue, and MealPilot evidence links for future Swiggy MCP changes",
            },
          },
        },
      },
      "/api/swiggy-source-intelligence": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy source intelligence center for website, docs, CTA, API, and drift reconciliation",
          responses: {
            "200": {
              description:
                "Unified source-to-product map covering llms.txt, llms-full.txt, rendered pages, markdown twins, 35 MCP tools, website CTAs, source drift signals, build queue items, and external credential gates",
            },
          },
        },
      },
      "/api/swiggy-deep-site-map": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy deep site map for every Builders page, module, CTA, header, and footer proof path",
          responses: {
            "200": {
              description:
                "Page-by-page Builders website audit with module signals, CTA ownership, header/footer matrix, source reconciliation sections, MealPilot proof links, assertions, and external gates",
            },
          },
        },
      },
      "/api/swiggy-developer-quickstart": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy developer quickstart workbench for first tool call readiness",
          responses: {
            "200": {
              description:
                "Self-serve developer workbench mapping official quickstart, build-agent, and OAuth docs into readiness steps, framework adapters, first-call JSON-RPC drills, recipe handoffs, auth gates, assertions, and verification commands",
            },
          },
        },
      },
      "/api/swiggy-cta-execution-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy CTA execution center for every Builders CTA, header, docs nav, and footer link",
          responses: {
            "200": {
              description:
                "Click-ready execution matrix for official Builders CTAs, global header links, docs subnav links, footer resources, mailto/form/legal gates, proof links, keyboard paths, and production verification commands",
            },
          },
        },
      },
      "/api/swiggy-innovation-radar": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy innovation radar for premium product lanes, route optimization, and build phases",
          responses: {
            "200": {
              description:
                "Maps Swiggy developer ideas, enterprise signals, access rules, support model, and all-server MCP references into differentiated MealPilot opportunity lanes, route optimizations, build phases, assertions, and external gates",
            },
          },
        },
      },
      "/api/ai-client-connect-kit": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy AI client and coding-agent connection kit",
          responses: {
            "200": {
              description:
                "Copy-ready client configs, coding-agent rules, SDK auth modes, delegated-auth blueprint, troubleshooting, and safety gates",
            },
          },
        },
      },
      "/api/coding-agent-governance": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy coding-agent governance for AGENTS.md and official docs retrieval",
          responses: {
            "200": {
              description:
                "Reads the root AGENTS.md file, scores required Swiggy llms.txt, llms-full.txt, Markdown twin, reference, auth, rate-limit, production, commercial-confirmation, and redaction signals, and returns smoke-test commands for future coding agents",
            },
          },
        },
      },
      "/api/brand-compliance-kit": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy brand and co-branding compliance kit",
          responses: {
            "200": {
              description:
                "Attribution copy, co-branding rules, surface placements, brand asset gates, palette audit, launch checklist, and external approval gates",
            },
          },
        },
      },
      "/api/swiggy-journey-compiler": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy official recipe journey compiler and tool route map",
          responses: {
            "200": {
              description:
                "Compiled Food, Instamart, Dineout, combined, and premium MealPilot journeys with every tool indexed to route roles, safety gates, cache policy, retry policy, and UI surface",
            },
          },
        },
      },
      "/api/swiggy-access-dossier": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy production access application dossier",
          responses: {
            "200": {
              description:
                "Apply-ready Swiggy access packet covering application fields, review checks, ground rules, legal readiness, track selection, proof links, manual inputs, and external gates",
            },
          },
        },
      },
      "/api/swiggy-access-evidence-matrix": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy access evidence matrix for every application field, proof artifact, and gate",
          responses: {
            "200": {
              description:
                "Reviewer-ready evidence matrix tying official Swiggy access requirements, review checks, ground rules, legal terms, attachments, browser runbook steps, proof commands, owners, and external gates to MealPilot routes",
            },
          },
        },
      },
      "/api/premium-use-case-studio": {
        get: {
          tags: ["Builder Access"],
          summary: "MealPilot premium Swiggy use-case studio",
          responses: {
            "200": {
              description:
                "Premium MealPilot use-case portfolio with Swiggy servers, all-tool coverage, optimized call plans, surfaces, safety gates, data boundaries, metrics, differentiators, roadmap, and external gates",
            },
          },
        },
      },
      "/api/premium-concierge-itinerary": {
        get: {
          tags: ["Commerce"],
          summary: "Premium concierge itinerary for Swiggy Food, Instamart, and Dineout",
          responses: {
            "200": {
              description:
                "Day-and-weekend itinerary slots with official recipe routes, all-server tool coverage, route optimizations, reminders, confirmations, and external Swiggy gates",
            },
          },
        },
      },
      "/api/staging-certification-matrix": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy staging certification matrix",
          responses: {
            "200": {
              description:
                "Credential-aware staging certification waves covering OAuth/DCR, all 35 Swiggy tools, 48-hour soak, telemetry, rollback, and production promotion gates",
            },
          },
        },
      },
      "/api/mcp-gateway": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy MCP gateway cutover status",
          responses: { "200": { description: "Transport mode, auth posture, endpoint routing, and cutover plan" } },
        },
      },
      "/api/credential-onboarding": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy OAuth and Dynamic Client Registration onboarding cockpit",
          responses: { "200": { description: "DCR preview, redirect URI audit, scopes, access fields, and external gates" } },
        },
      },
      "/api/sandbox-credential-workbench": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy sandbox and staging credential workbench",
          responses: {
            "200": {
              description:
                "Local demo, DCR, PKCE, redirect allowlist, staging credential, seeded-data, 48-hour soak, production-promotion, command, and external-gate evidence for Swiggy access review",
            },
          },
        },
      },
      "/api/auth/swiggy/status": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy OAuth callback and token posture status",
          responses: {
            "200": {
              description:
                "Redacted OAuth lifecycle report with endpoints, redirect URI, pending PKCE verifier count, latest callback outcome, gateway token source, checklist, storage policy, and next actions",
            },
          },
        },
      },
      "/api/enterprise-delegated-auth": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Enterprise Delegated Auth Center",
          responses: {
            "200": {
              description:
                "Enterprise on-behalf-of OAuth 2.1 PKCE flow, per-user token lifecycle, redirect strategy, platform use cases, troubleshooting, architecture review evidence, and external partner gates",
            },
          },
        },
      },
      "/api/go-live": {
        get: {
          tags: ["Builder Access"],
          summary: "Go-live checks and observability metrics",
          responses: { "200": { description: "Readiness gates, metrics, and rollout plan" } },
        },
      },
      "/api/demo-studio": {
        get: {
          tags: ["Builder Access"],
          summary: "Demo recording progress checklist",
          responses: { "200": { description: "Demo steps and evidence links" } },
        },
      },
      "/api/evaluation-lab": {
        get: {
          tags: ["Builder Access"],
          summary: "Multi-scenario agent evaluation lab",
          responses: { "200": { description: "Persona, budget, voice, and safety evaluation results" } },
        },
      },
      "/api/submission-package": {
        get: {
          tags: ["Builder Access"],
          summary: "Form-ready Builder Access submission package",
          responses: { "200": { description: "Application fields, links, and residual risks" } },
        },
      },
      "/api/submission-console": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy production access submission console",
          responses: {
            "200": {
              description:
                "Track-aware official form targets, prepared fields, proof attachments, runbook steps, handoff drafts, blockers, and external gates",
            },
          },
        },
      },
      "/api/access-submission-studio": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy access submission studio",
          responses: {
            "200": {
              description:
                "Final operator-facing Swiggy access room with official CTA targets, copy blocks, attachments, browser runbook, generated mailto draft, blockers, and external gates",
            },
          },
        },
      },
      "/api/access-submission-studio/state": {
        patch: {
          tags: ["Builder Access"],
          summary: "Save local Swiggy access handoff state",
          responses: {
            "200": {
              description:
                "Updated local demo URL, security contact, production redirect, egress, environment, terms, form submission, and handoff email state reflected in the access submission studio",
            },
          },
        },
      },
      "/api/builder-packet-export": {
        get: {
          tags: ["Builder Access"],
          summary: "Executable Swiggy Builder Access packet export",
          responses: {
            "200": {
              description:
                "Copy-ready and machine-readable packet manifest with form fields, required attachments, verification commands, generated file paths, handoff email, readiness gates, and Swiggy external gates",
            },
          },
        },
      },
      "/api/builder-packet-export.md": {
        get: {
          tags: ["Builder Access"],
          summary: "Markdown Swiggy Builder Access packet export",
          responses: {
            "200": {
              description:
                "Reviewer-ready Markdown packet for the official Swiggy access form and builders@swiggy.in handoff",
            },
          },
        },
      },
      "/api/reviewer-proof": {
        get: {
          tags: ["Builder Access"],
          summary: "Reviewer proof score and artifact map",
          responses: { "200": { description: "Score, highlights, blockers, and artifact links" } },
        },
      },
      "/api/production-launch-bundle": {
        get: {
          tags: ["Builder Access"],
          summary: "Production Launch Bundle for Swiggy Builder Access handoff",
          responses: {
            "200": {
              description:
                "Launch score, artifacts, access application fields, commands, external gates, and handoff email draft",
            },
          },
        },
      },
      "/api/traffic-readiness-plan": {
        get: {
          tags: ["Operations"],
          summary: "Traffic readiness and capacity plan for Swiggy launch",
          responses: {
            "200": {
              description:
                "Expected volume, QPS, traffic lanes, Retry-After contract, staged rollout, major-event notifications, capacity email, and external Swiggy gates",
            },
          },
        },
      },
      "/api/swiggy-load-lab": {
        get: {
          tags: ["Operations"],
          summary: "Swiggy Load Lab capacity simulation and launch ramp workbench",
          responses: {
            "200": {
              description:
                "Synthetic launch-load scenarios, lane ceilings, cohort ramps, Retry-After drills, operator actions, and external Swiggy capacity gates",
            },
          },
        },
      },
      "/api/swiggy-offer-intelligence": {
        get: {
          tags: ["Commerce"],
          summary: "Swiggy Offer Intelligence for coupon, deal, and value optimization",
          responses: {
            "200": {
              description:
                "Food coupon discovery/application guardrails, Dineout deal validation, Instamart value substitutions, offer drills, and live-offer external gates",
            },
          },
        },
      },
      "/api/swiggy-order-lifecycle": {
        get: {
          tags: ["Commerce"],
          summary: "Swiggy Order Lifecycle Command Center for status, tracking, and recovery",
          responses: {
            "200": {
              description:
                "Food order, Instamart order, Dineout booking, tracking cadence, non-blind retry probes, lifecycle telemetry, and support-ready recovery evidence",
            },
          },
        },
      },
      "/api/swiggy-location-trust": {
        get: {
          tags: ["Commerce"],
          summary: "Swiggy Location Trust Center for address choice, privacy, and refresh guards",
          responses: {
            "200": {
              description:
                "Food and Instamart address tools, Dineout saved locations, address-choice pauses, address switch refresh guards, raw-address redaction, and staging credential gates",
            },
          },
        },
      },
      "/api/swiggy-cart-mutation-workbench": {
        get: {
          tags: ["Commerce"],
          summary: "Swiggy Cart Mutation Workbench for readback, payment truth, and checkout-safe carts",
          responses: {
            "200": {
              description:
                "Food cart readback, Instamart full-cart replacement, Dineout create_cart gates, payment-method truth, add-on confirmation, commercial single-flight rules, and staging cart-write gates",
            },
          },
        },
      },
      "/api/swiggy-discovery-freshness": {
        get: {
          tags: ["Commerce"],
          summary: "Swiggy Discovery Freshness Workbench for search, menu, product, and slot truth",
          responses: {
            "200": {
              description:
                "Food restaurant and menu search, Instamart product and go-to item discovery, Dineout restaurant details and slots, pagination truth, variant selection, coordinate consistency, and freshness invalidation",
            },
          },
        },
      },
      "/api/support/bridge": {
        get: {
          tags: ["Operations"],
          summary: "Swiggy report_error Support Bridge across Food, Instamart, and Dineout",
          responses: {
            "200": {
              description:
                "Official report_error request shapes, support contacts, SLA matrix, redaction rules, and escalation checklist",
            },
          },
        },
      },
      "/api/slo-incident-command": {
        get: {
          tags: ["Operations"],
          summary: "SLO Incident Command Center for Swiggy MCP operations",
          responses: {
            "200": {
              description:
                "Uptime targets, latency classes, status-page fallback, S0/S1 incident comms, maintenance windows, measurement rules, remediation path, and live readiness checks",
            },
          },
        },
      },
      "/api/data-governance-center": {
        get: {
          tags: ["Operations"],
          summary: "Data Governance Center for Swiggy DPDP, DSR, residency, and token controls",
          responses: {
            "200": {
              description:
                "DPDP data-role boundary, India/Singapore residency, tool-call PII inventory, DSR runbook, retention, security contacts, and signed-manifest readiness",
            },
          },
        },
      },
      "/api/error-intelligence": {
        get: {
          tags: ["Operations"],
          summary: "Swiggy error envelope, retry bucket, and planned code intelligence",
          responses: {
            "200": {
              description:
                "Current success:false envelope, message/HTTP classifiers, retry rules, planned symbolic codes, domain errors, and support actions",
            },
          },
        },
      },
      "/api/resilience": {
        get: {
          tags: ["Builder Access"],
          summary: "Executable resilience drills and Swiggy support runbook",
          responses: { "200": { description: "Retry, rate-limit, auth, idempotency, and deprecation drills" } },
        },
      },
      "/api/observability/traces": {
        get: {
          tags: ["Operations"],
          summary: "Trace spans, log contract, and redaction evidence",
          responses: { "200": { description: "Session traces, span metrics, and structured logging contract" } },
        },
      },
      "/api/telemetry/runtime": {
        get: {
          tags: ["Operations"],
          summary: "Runtime request telemetry ledger with redaction and support correlation",
          responses: { "200": { description: "Recent request events, metrics, redaction contract, and support-ready identifiers" } },
        },
      },
      "/api/audit-ledger": {
        get: {
          tags: ["Operations"],
          summary: "Swiggy audit ledger center for redacted session, support, retention, and DSR evidence",
          responses: {
            "200": {
              description:
                "Audit events, redaction controls, retention posture, DSR routing, support packet, and external gates",
            },
          },
        },
      },
      "/api/swiggy-route-optimizer": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy MCP route optimization and call-saving plan",
          responses: {
            "200": {
              description:
                "Official source links, call-saving totals, optimizer profiles, parallel batches, cross-server handoffs, cache rules, retry policies, guardrails, assertions, and staging assertions",
            },
          },
        },
      },
      "/api/privacy/export": {
        get: {
          tags: ["Operations"],
          summary: "Export local user data",
          responses: { "200": { description: "Profile, pantry, group, plan, and reminder data" } },
        },
      },
      "/api/privacy": {
        delete: {
          tags: ["Operations"],
          summary: "Delete local user data",
          responses: { "200": { description: "Local data deleted" } },
        },
      },
      "/api/storage/status": {
        get: {
          tags: ["Operations"],
          summary: "Storage diagnostics",
          responses: { "200": { description: "Persistence mode, counts, and data file path when enabled" } },
        },
      },
      "/api/storage/export": {
        get: {
          tags: ["Operations"],
          summary: "Export a complete local store snapshot",
          responses: { "200": { description: "Versioned snapshot for backup or local migration" } },
        },
      },
      "/api/storage/restore": {
        post: {
          tags: ["Operations"],
          summary: "Restore a complete local store snapshot",
          responses: { "200": { description: "Restored snapshot" } },
        },
      },
      "/api/storage/compact": {
        post: {
          tags: ["Operations"],
          summary: "Compact expired plans, reminders, and OAuth sessions",
          responses: { "200": { description: "Compaction result and storage diagnostics" } },
        },
      },
      "/api/openapi.json": {
        get: {
          tags: ["Operations"],
          summary: "OpenAPI document",
          responses: { "200": { description: "Machine-readable API contract" } },
        },
      },
    },
  };
}
