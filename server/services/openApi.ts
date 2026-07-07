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
      "/api/mcp/resource-prompt-studio/execute": {
        post: {
          tags: ["Builder Access"],
          summary: "Execute a Swiggy MCP resource or prompt method with redacted summary",
          responses: {
            "200": {
              description:
                "Executable MCP resources/list, resources/read, prompts/list, and prompts/get gate across Food, Instamart, and Dineout with response hashing, no raw payload retention, server-scoped execution, and live credential gates",
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
      "/api/mcp/state-orchestrator/rehearse-surface": {
        post: {
          tags: ["Builder Access"],
          summary: "Rehearse Swiggy chat, voice, and widget surface contracts for a MealPilot session",
          responses: {
            "200": {
              description:
                "Executable surface-contract rehearsal with chat rich cards, voice three-item caps, widget semantic fallbacks, raw-ID suppression, confirmation locks, and no commercial action execution",
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
      "/api/swiggy-widget-experience-composer": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Widget Experience Composer for premium widget placements and semantic fallbacks",
          responses: {
            "200": {
              description:
                "User-facing widget composition proof with mobile, tablet, desktop, voice, and review gallery states, Swiggy tool coverage, postMessage handlers, fallback renderers, safety gates, and hosted-widget activation runbook",
            },
          },
        },
      },
      "/api/swiggy-hosted-widget-activation": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Hosted Widget Activation Center",
          responses: {
            "200": {
              description:
                "Hosted widget activation proof with parent-origin policy, iframe sandbox rules, origin-verified postMessage handshakes, semantic fallback parity, telemetry redaction, commercial confirmation routing, reviewer packet, and Swiggy-owned hosted URL gates",
            },
          },
        },
      },
      "/api/swiggy-agent-experience-benchmark": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Agent Experience Benchmark for premium journey quality and innovation moats",
          responses: {
            "200": {
              description:
                "Best-in-class agent experience scorecard that benchmarks Swiggy Food, Instamart, Dineout, voice, widget, support, route optimization, safety, and reviewer proof journeys against UX acceptance criteria and innovation moats",
            },
          },
        },
      },
      "/api/swiggy-private-pilot-control-room": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Private Pilot Control Room for real-user cohort readiness and staging replay gates",
          responses: {
            "200": {
              description:
                "Operator-ready private pilot room with cohorts, consent artifacts, assigned benchmark journeys, success metrics, support paths, telemetry targets, go/no-go gates, staging credential dependencies, and Swiggy handoff packet copy",
            },
          },
        },
      },
      "/api/swiggy-staging-replay": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Credentialed Staging Replay Center",
          responses: {
            "200": {
              description:
                "Token-aware staging replay dashboard with safe read/support probes, dry-run evidence, blocked commercial actions, wave readiness, server readiness, replay commands, redaction assertions, and builders@swiggy.in handoff packet",
            },
          },
        },
      },
      "/api/swiggy-staging-replay/run": {
        post: {
          tags: ["Builder Access"],
          summary: "Execute a safe Swiggy staging replay probe",
          responses: {
            "200": {
              description:
                "Runs an allowlisted read/tracking/support replay through local mock or credentialed Swiggy staging, fails closed without bearer token, blocks commercial tools, and returns response hash plus redaction telemetry",
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
      "/api/swiggy-confirmation-command-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Confirmation Command Center for final Food, Instamart, and Dineout actions",
          responses: {
            "200": {
              description:
                "Reviewer-visible final commerce confirmation center with fresh cart and slot reads, separate confirmations for place_food_order, checkout, and book_table, post-action status probes, redacted telemetry, support packets, and external credential gates",
            },
          },
        },
      },
      "/api/swiggy-confirmation-command-center/execute": {
        post: {
          tags: ["Builder Access"],
          summary: "Execute a guarded Swiggy final-commerce confirmation with status probe",
          responses: {
            "200": {
              description:
                "Executable protected-action gate for Food place_food_order, Instamart checkout, or Dineout book_table with fresh preflight read, separate explicit confirmation, Swiggy payment or free-booking truth, post-action status probe, no-blind-retry telemetry, and live credential gates",
            },
          },
        },
      },
      "/api/swiggy-cancellation-care-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Cancellation and Care Center for no-tool cancellations and report_error support",
          responses: {
            "200": {
              description:
                "Cancellation and support guardrails for Food and Instamart customer-care copy, Dineout booking status, report_error toolContext, incident email routing, planned error-code gates, and live support calibration",
            },
          },
        },
      },
      "/api/swiggy-dineout-precision-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Dineout Precision Center for free bookings and bill-payment carts",
          responses: {
            "200": {
              description:
                "Dineout-specific proof that separates free book_table reservations from create_cart bill-payment carts, validates isFree and bookingPrice before booking, blocks paid deals, requires get_booking_status before retry, and gates live payment evidence on Swiggy credentials",
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
      "/api/swiggy-builders-site-parity": {
        get: {
          tags: ["Builder Access"],
          summary: "Live Swiggy Builders homepage parity auditor",
          responses: {
            "200": {
              description:
                "Fetches the official Swiggy Builders homepage and reconciles live anchors, metadata, header links, CTAs, llms sources, footer resources, legal links, and module signals against MealPilot evidence",
            },
          },
        },
      },
      "/api/swiggy-builders-page-mesh": {
        get: {
          tags: ["Builder Access"],
          summary: "Live Swiggy Builders public page mesh auditor",
          responses: {
            "200": {
              description:
                "Fetches the official public Builders pages from Website Atlas and reconciles live page titles, anchors, modules, CTAs, safe origins, and page-level drift signals",
            },
          },
        },
      },
      "/api/swiggy-builders-launch-story": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders Launch Story Center for the launch blog, demo story, and showcase path",
          responses: {
            "200": {
              description:
                "Launch-blog narrative, current 35-tool docs reconciliation, builder journey, reviewer demo assets, ecosystem lanes, CTA paths, co-marketing guardrails, and Swiggy external gates",
            },
          },
        },
      },
      "/api/swiggy-builders-module-intelligence": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders Module Intelligence Center for page-module product readiness",
          responses: {
            "200": {
              description:
                "Every Builders website module mapped to owner, audience, official signal, product promise, Swiggy surface, MealPilot proof, route optimization, risk boundary, CTA links, module journeys, and external gates",
            },
          },
        },
      },
      "/api/swiggy-builders-journey-gates": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders Journey Gate Center for the official five-step path",
          responses: {
            "200": {
              description:
                "Start Building, Apply for Prod Access, Quick Review, Go Live, and Show Us What You Built mapped to owners, statuses, entry and exit criteria, proof links, telemetry, blockers, runbook actions, and external Swiggy gates",
            },
          },
        },
      },
      "/api/swiggy-builders-homepage-experience": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders Homepage Experience Center for section-by-section proof",
          responses: {
            "200": {
              description:
                "Header, hero, how-it-works, benefits, guidelines, FAQ, final CTA, and footer sections mapped to source signals, MealPilot surfaces, CTA continuity, mobile checks, reviewer checks, proof links, and external Swiggy gates",
            },
          },
        },
      },
      "/api/swiggy-builders-source-evolution": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders Source Evolution Center for 18+ to 35-tool reconciliation and upstream drift gates",
          responses: {
            "200": {
              description:
                "Homepage 18+ launch copy reconciled with current 35/35 callable-tool coverage, llms and docs refresh loops, roadmap version watch, rate-limit and signed-manifest gates, homepage/widget drift, reviewer packet regression, proof links, runbook, assertions, and external Swiggy gates",
            },
          },
        },
      },
      "/api/swiggy-builders-live-source-resilience": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders Live Source Resilience Center for homepage fallback, page mesh, and llms recovery",
          responses: {
            "200": {
              description:
                "Live homepage fetch state, Website Atlas fallback mode, public page mesh coverage, llms and markdown twin recovery, header/footer/CTA parity, source evolution re-browse gates, verifier regression, proof links, and external Swiggy source gates",
            },
          },
        },
      },
      "/api/swiggy-builders-review-decision": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders Review Decision Center for access-approval readiness",
          responses: {
            "200": {
              description:
                "Official Swiggy review signals mapped to MealPilot approval-readiness decision gates, recommendation, reviewer questions, proof links, operator-owned fields, source-review watches, credential gates, go-live gates, and access handoff runbook",
            },
          },
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
      "/api/swiggy-faq-resolution-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy FAQ Resolution Center for reviewer-ready answers, CTAs, and proof links",
          responses: {
            "200": {
              description:
                "Every public Builders FAQ question, policy rule, answer, owner, CTA, proof route, reviewer script, support contact, and external Swiggy/operator gate resolved for access review",
            },
          },
        },
      },
      "/api/swiggy-faq-resolution-center/answer": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy FAQ Answer Console for one reviewer question",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                  },
                  required: ["question"],
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Matched FAQ answer with confidence, owner, status, proof links, related policy rules, activation CTAs, support contact, assertions, and explicit operator or Swiggy gates without submitting external actions",
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
      "/api/swiggy-growth-partnership/compose": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy Growth Partnership ask composer for one launch experiment",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    experimentId: { type: "string" },
                    askId: { type: "string" },
                    audienceNote: { type: "string" },
                  },
                  required: ["experimentId", "askId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Selected growth experiment handoff packet with decision, proof links, assets, metrics, checklist, builders@swiggy.in draft, and explicit Swiggy gates without sending email, opening Slack, requesting dashboards, or claiming approval",
            },
          },
        },
      },
      "/api/swiggy-talent-signal-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builder Talent Signal Center for portfolio, demo, GitHub, and hiring-readiness proof",
          responses: {
            "200": {
              description:
                "Builder visibility, developer hiring signal, portfolio assets, talent paths, outreach draft, proof routes, and Swiggy-owned recruiting or feature-placement gates mapped to MealPilot evidence",
            },
          },
        },
      },
      "/api/swiggy-talent-signal-center/compose": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy Talent Signal outreach composer for one portfolio path",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    pathId: { type: "string" },
                    demoUrl: { type: "string" },
                    githubUrl: { type: "string" },
                    technicalSummary: { type: "string" },
                  },
                  required: ["pathId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Selected Talent Signal outreach packet with path, portfolio assets, reviewer narrative, proof links, missing inputs, builders@swiggy.in draft, and explicit Swiggy recruiting or feature-placement gates without sending email or claiming endorsement",
            },
          },
        },
      },
      "/api/swiggy-conversion-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Builders Conversion Center for the final CTA funnel and operator handoff",
          responses: {
            "200": {
              description:
                "What Will You Cook, Start Building, Request Access, Send Us a Demo, builders@swiggy.in, llms.txt, llms-full.txt, proof bundles, operator runbook, and Swiggy go-live gates mapped to MealPilot evidence",
            },
          },
        },
      },
      "/api/swiggy-benefits-activation-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Benefits Activation Center for live APIs, quotas, support, co-branding, visibility, and growth",
          responses: {
            "200": {
              description:
                "Owner-assigned activation map for Builders benefits including live API access, quota expansion, technical support, Powered by Swiggy attribution, showcase visibility, hiring visibility, growth partnership, enterprise support, CTAs, proof links, and external Swiggy gates",
            },
          },
        },
      },
      "/api/swiggy-benefits-activation-center/activate": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy Benefits Activation action for one Builders benefit",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    benefitId: { type: "string" },
                  },
                  required: ["benefitId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Selected benefit activation packet with decision, owner, CTA, proof links, checklist, handoff draft, assertions, and external Swiggy/operator gates without sending email or submitting external actions",
            },
          },
        },
      },
      "/api/swiggy-showcase-submission-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Showcase Submission Center for demo, feature, and co-marketing review",
          responses: {
            "200": {
              description:
                "Feature-ready pitch blocks, demo storyboard, metric pack, visual proof, outreach email, co-branding gates, and Swiggy-owned showcase approvals",
            },
          },
        },
      },
      "/api/swiggy-showcase-submission-center/compose": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy Showcase Submission Composer for copy-ready demo outreach",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    demoUrl: { type: "string" },
                    githubUrl: { type: "string" },
                    operatorEmail: { type: "string" },
                    note: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Copy-ready builders@swiggy.in showcase packet with readiness decision, missing operator inputs, checklist, proof links, pitch blocks, metric pack, assertions, and explicit Swiggy approval gates without sending email",
            },
          },
        },
      },
      "/api/swiggy-demo-evidence-director": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Demo Evidence Director for 2-3 minute recording and showcase handoff proof",
          responses: {
            "200": {
              description:
                "Time-coded demo scenes, proof assets, recording gates, visual QA evidence, redaction checks, runbook commands, handoff email copy, and Swiggy-owned approval gates",
            },
          },
        },
      },
      "/api/swiggy-submission-timeline-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Submission Timeline Center for access, demo, credential, and launch handoff",
          responses: {
            "200": {
              description:
                "End-to-end operator and Swiggy-owned timeline for Start Building, Request Access, Send Demo, Dynamic Client Registration, staging seed, 48-hour soak, production promotion, proof links, and external gates",
            },
          },
        },
      },
      "/api/swiggy-submission-timeline-center/checkpoint": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy Submission Timeline Checkpoint for operator and Swiggy gate readiness",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    demoRecorded: { type: "boolean" },
                    accessFormSubmitted: { type: "boolean" },
                    handoffEmailSent: { type: "boolean" },
                    dcrApproved: { type: "boolean" },
                    stagingCredentialsIssued: { type: "boolean" },
                    stagingSoakComplete: { type: "boolean" },
                    productionApproved: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Local checkpoint decision with readiness score, current phase, next action, checklist, missing operator actions, Swiggy gates, proof links, assertions, and external gates without submitting forms, sending email, registering DCR, or promoting production",
            },
          },
        },
      },
      "/api/swiggy-partner-success-desk": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Partner Success Desk for support, growth, capacity, and incident operations",
          responses: {
            "200": {
              description:
                "Composed partner-success desk covering access handoff, developer support, SLO incident readiness, capacity review, backpressure, growth showcase asks, enterprise Slack gates, proof links, and escalation emails",
            },
          },
        },
      },
      "/api/swiggy-partner-success-desk/compose": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy Partner Success handoff composer for one support or growth lane",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    laneId: { type: "string" },
                    operatorEmail: { type: "string" },
                    launchWindow: { type: "string" },
                    contextNote: { type: "string" },
                  },
                  required: ["laneId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Selected Partner Success handoff packet with lane, escalation email, reviewer runbook, proof links, missing inputs, checklist, builders@swiggy.in draft, and explicit Slack, partner-manager, dashboard, support, rate-limit, and co-marketing gates without sending email or changing external Swiggy state",
            },
          },
        },
      },
      "/api/swiggy-partner-support-room": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Partner Support Room for report_error, incident, capacity, and enterprise support operations",
          responses: {
            "200": {
              description:
                "Post-access support room with contact channels, report_error readiness, S0-S3 incident lanes, redacted evidence attachments, escalation runbook, support email drafts, capacity escalation, and Swiggy-owned enterprise support gates",
            },
          },
        },
      },
      "/api/swiggy-partner-support-room/compose": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy Partner Support packet composer for one support channel and incident lane",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    channelId: { type: "string" },
                    incidentLaneId: { type: "string" },
                    operatorEmail: { type: "string" },
                    sessionId: { type: "string" },
                    summary: { type: "string" },
                  },
                  required: ["channelId", "incidentLaneId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Local Partner Support packet with selected channel, S0-S3 incident lane, redacted evidence attachments, proof links, builders@swiggy.in draft, missing-input guards, safety assertions, and explicit report_error, Slack, partner-manager, and Swiggy approval gates without sending email or changing external Swiggy state",
            },
          },
        },
      },
      "/api/swiggy-interaction-qa-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Interaction QA Center for clickable portal CTAs and external gates",
          responses: {
            "200": {
              description:
                "Reviewer-visible CTA contract matrix covering executable MealPilot actions, Swiggy access/manual gates, visible feedback, automation coverage, and regression runbooks",
            },
          },
        },
      },
      "/api/swiggy-interaction-qa-center/rehearse": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy Interaction QA rehearsal for one portal CTA contract",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    laneId: { type: "string" },
                    operatorEmail: { type: "string" },
                    evidenceNote: { type: "string" },
                    dryRunConfirmed: { type: "boolean" },
                  },
                  required: ["laneId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Local Interaction QA rehearsal with selected CTA lane, route contract, browser action, expected feedback, proof links, automation coverage, missing-input guards, checklist, and explicit form, Slack, credential, commercial-action, and Swiggy approval gates without executing unsafe external actions",
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
      "/api/channel-multimodal-studio/compose": {
        post: {
          tags: ["Builder Access"],
          summary: "Channel and Multimodal execution packet composer for one Swiggy developer lane",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    laneId: { type: "string" },
                    channelId: { type: "string" },
                    operatorEmail: { type: "string" },
                    userTrigger: { type: "string" },
                    dryRunConfirmed: { type: "boolean" },
                  },
                  required: ["laneId", "channelId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Local channel execution packet with selected Swiggy developer lane, target channel, MCP toolchain, route plan, response rules, confirmation gate, telemetry contract, proof links, missing-input guards, checklist, and explicit Slack/Teams, camera/OCR, enterprise, credential, and commercial-action gates without executing live Swiggy commerce or external channel setup",
            },
          },
        },
      },
      "/api/swiggy-visual-dish-capture": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Visual Dish Capture Center for camera-to-commerce route planning",
          responses: {
            "200": {
              description:
                "Visual dish capture routes, Food/Instamart/Dineout toolchains, sample captures, privacy guardrails, confirmation gates, and external vision/staging approvals",
            },
          },
        },
      },
      "/api/swiggy-visual-dish-capture/analyze": {
        post: {
          tags: ["Commerce"],
          summary: "Analyze a visual dish caption into safe Swiggy route plans",
          responses: {
            "200": {
              description:
                "Detected dish label, confidence, alternatives, selected Food/Instamart/Dineout route, no-raw-image-retention telemetry, and confirmation-first next actions",
            },
          },
        },
      },
      "/api/swiggy-voice-commerce-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Voice Commerce Rehearsal Center for spoken agent flows",
          responses: {
            "200": {
              description:
                "Voice Food, Instamart, Dineout, and combined scenario contracts with TTS limits, card fallbacks, confirmation prompts, guardrails, and staging gates",
            },
          },
        },
      },
      "/api/swiggy-voice-commerce-center/rehearse": {
        post: {
          tags: ["Commerce"],
          summary: "Rehearse a spoken MealPilot request into a safe Swiggy voice route",
          responses: {
            "200": {
              description:
                "Detected voice intent, short spoken script, visual fallback, confirmation prompt, selected Swiggy route, no-raw-audio telemetry, and commerce-lock assertions",
            },
          },
        },
      },
      "/api/swiggy-quality-loop-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Quality Loop Center for post-experience learning and support signals",
          responses: {
            "200": {
              description:
                "Food, Instamart, Dineout, and combined feedback loops with consented learning, support redaction, repeat optimization, and external history gates",
            },
          },
        },
      },
      "/api/swiggy-quality-loop-center/feedback": {
        post: {
          tags: ["Commerce"],
          summary: "Analyze post-order or post-booking feedback into safe Swiggy learning routes",
          responses: {
            "200": {
              description:
                "Feedback sentiment, selected quality loop, consented learning tags, support packet decision, redacted telemetry, and next MealPilot optimization action",
            },
          },
        },
      },
      "/api/swiggy-ritual-autopilot-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Ritual Autopilot Center for consented household routines",
          responses: {
            "200": {
              description:
                "Weekday lunch, pantry reset, Dineout slotwatch, and combined weekend ritual lanes with consent gates, fresh-read boundaries, reminder-only calendar use, and no automatic Swiggy commercial actions",
            },
          },
        },
      },
      "/api/swiggy-ritual-autopilot-center/plan": {
        post: {
          tags: ["Commerce"],
          summary: "Plan a consented Swiggy ritual without automatic checkout or booking",
          responses: {
            "200": {
              description:
                "Generated ritual routine slots, selected Swiggy lane, consent status, confirmation boundaries, no-auto-commercial-action telemetry, and next review action",
            },
          },
        },
      },
      "/api/swiggy-payment-truth-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Payment Truth Center for cart, coupon, COD, checkout, and booking settlement proof",
          responses: {
            "200": {
              description:
                "Food cart payment truth, Instamart checkout bill truth, Dineout free-booking truth, paid-cart gates, combined settlement readbacks, payment guardrails, and no payment-instrument retention evidence",
            },
          },
        },
      },
      "/api/swiggy-payment-truth-center/reconcile": {
        post: {
          tags: ["Commerce"],
          summary: "Reconcile a Swiggy cart or booking payment claim before confirmation",
          responses: {
            "200": {
              description:
                "Selected payment truth lane, settlement status, risk flags, user-facing copy, redacted telemetry, and confirmation-lock assertions",
            },
          },
        },
      },
      "/api/swiggy-meal-window-intelligence": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Meal Window Intelligence for order, cook, reserve, and track timing gates",
          responses: {
            "200": {
              description:
                "Timing-aware Food, Instamart, Dineout, combined, and tracking lanes with no scheduled Food order invariant, fresh-read windows, cadence caps, samples, and official Swiggy source links",
            },
          },
        },
      },
      "/api/swiggy-meal-window-intelligence/forecast": {
        post: {
          tags: ["Commerce"],
          summary: "Forecast a safe meal window route before Swiggy cart, checkout, booking, or tracking actions",
          responses: {
            "200": {
              description:
                "Selected timing lane, ETA risk bucket, route plan, redacted telemetry, no-scheduled-order assertion, and fresh-read confirmation requirements",
            },
          },
        },
      },
      "/api/swiggy-customization-studio": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Customization Studio for Food add-ons, variants, and Instamart pack-size truth",
          responses: {
            "200": {
              description:
                "Food search_menu customization, get_restaurant_menu browsing, update_food_cart readbacks, Instamart product variants, full-cart replacement, allergy cautions, voice-safe choices, and raw-id redaction",
            },
          },
        },
      },
      "/api/swiggy-customization-studio/validate": {
        post: {
          tags: ["Commerce"],
          summary: "Validate a Swiggy customization before cart mutation",
          responses: {
            "200": {
              description:
                "Selected customization lane, mutation risk bucket, required fresh cart readback, exact-tool checklist, redacted telemetry, and allergy-sensitive assertions",
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
      "/api/nutrition-budget-intelligence/advise": {
        post: {
          tags: ["Commerce"],
          summary: "Advise a Swiggy nutrition and budget route before cart, checkout, booking, or order actions",
          responses: {
            "200": {
              description:
                "Selected Food, Instamart, Dineout, or combined nutrition-budget route with budget-fit verdict, protein estimate, fresh-read checklist, redacted telemetry, no-medical-claim assertion, and separate commercial confirmation gates",
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
      "/api/household-preference-graph/simulate": {
        post: {
          tags: ["Personalization"],
          summary: "Simulate consent-aware Household Preference personalization before Swiggy route ranking",
          responses: {
            "200": {
              description:
                "Selected Food, Instamart, Dineout, or local-only personalization decision with household member, signal, forecast, automation, confidence, retention policy, checklist, redacted telemetry, and no raw Swiggy history retention assertions",
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
      "/api/guest-collaboration-calendar/compose": {
        post: {
          tags: ["Collaboration"],
          summary: "Compose a guest collaboration handoff for Swiggy occasions",
          responses: {
            "200": {
              description:
                "Selected occasion template, collaboration channel, vote round, calendar or share artifact, route plan, readiness decision, missing channel gates, proof links, redacted telemetry, no-scheduled-Food assertion, and separate Swiggy confirmation boundaries",
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
      "/api/luxury-experience-workspace/compose": {
        post: {
          tags: ["Builder Access"],
          summary: "Compose a Luxury Experience Workspace rehearsal without live Swiggy commerce",
          responses: {
            "200": {
              description:
                "Selected luxury mode and review workspace with route steps, confirmation gates, review artifacts, readiness decision, missing inputs, redacted telemetry, no-commerce assertion, and separate Food, Instamart, and Dineout approval boundaries",
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
      "/api/reviewer-artifact-vault/compose": {
        post: {
          tags: ["Builder Access"],
          summary: "Compose a Reviewer Artifact Vault packet for Swiggy access handoff",
          responses: {
            "200": {
              description:
                "Selected artifact section, handoff channel, audience, proof links, screenshots, verification commands, redaction rules, reviewer email copy, readiness decision, missing attachment gates, and telemetry for Swiggy Builder Access review",
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
      "/api/visual-qa-center/rehearse": {
        post: {
          tags: ["Builder Access"],
          summary: "Rehearse a Visual QA capture plan for Swiggy reviewer evidence",
          responses: {
            "200": {
              description:
                "Selected Visual QA target group, viewport, capture mode, screenshot targets, layout rules, verification commands, artifact paths, readiness decision, missing capture gates, telemetry, and no-blank-render assertions",
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
      "/api/swiggy-docs-coverage/drill": {
        post: {
          tags: ["Builder Access"],
          summary: "Drill into Swiggy Docs Coverage for reviewer source evidence",
          responses: {
            "200": {
              description:
                "Selected Swiggy docs section and focus with llms.txt pages, rendered twins, evidence links, retrieval commands, readiness decision, missing source gates, telemetry, and credential/drift assertions",
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
      "/api/swiggy-docs-twin-explorer/rehearse": {
        post: {
          tags: ["Builder Access"],
          summary: "Rehearse Swiggy Docs Twin retrieval for reviewer source-pair evidence",
          responses: {
            "200": {
              description:
                "Selected retrieval lane and docs section with markdown/rendered source pairs, proof links, commands, readiness decision, missing drift gates, telemetry, and source safety assertions",
            },
          },
        },
      },
      "/api/swiggy-llms-manifest-verifier": {
        get: {
          tags: ["Builder Access"],
          summary: "Live Swiggy llms.txt manifest verifier",
          responses: {
            "200": {
              description:
                "Fetches and parses the official Swiggy llms.txt manifest, verifies markdown/rendered twins, Food 14, Instamart 13, Dineout 8 reference-tool counts, and reports drift without accepting arbitrary URLs",
            },
          },
        },
      },
      "/api/swiggy-llms-manifest-verifier/rehearse": {
        post: {
          tags: ["Builder Access"],
          summary: "Rehearse Swiggy llms.txt manifest verification for reviewer source evidence",
          responses: {
            "200": {
              description:
                "Selected manifest rehearsal mode with live/fallback disclosure, expected coverage pages, section counts, Food/Instamart/Dineout tool parity, commands, drift signals, missing gates, telemetry, and source-safety assertions",
            },
          },
        },
      },
      "/api/swiggy-tool-parity-auditor": {
        get: {
          tags: ["Builder Access"],
          summary: "Live Swiggy tool parity auditor",
          responses: {
            "200": {
              description:
                "Compares the live Swiggy llms.txt reference tools with MealPilot local contracts, fixtures, route classes, confirmation gates, retry policies, and Food 14, Instamart 13, Dineout 8 coverage",
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
      "/api/swiggy-source-freeze-diff": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy source freeze diff for final pre-submission source proof",
          responses: {
            "200": {
              description:
                "Composes live Builders page mesh, header/footer/CTA counts, llms docs, MCP tool counts, access packet evidence, upstream watch, proof commands, missing inputs, and browser re-browse gates",
            },
          },
        },
      },
      "/api/swiggy-source-freeze-diff/freeze": {
        post: {
          tags: ["Builder Access"],
          summary: "Run an explicit Swiggy source freeze diff mode",
          responses: {
            "200": {
              description:
                "Mode-specific source freeze decision for pre-demo, pre-access-submission, or post-source-change workflows, optionally including a metadata-only browser re-browse receipt, with local evidence only and no external submission",
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
      "/api/swiggy-developer-quickstart/run-first-call": {
        post: {
          tags: ["Builder Access"],
          summary: "Run a read-only Swiggy developer quickstart first-call drill",
          responses: {
            "200": {
              description:
                "Executable get_addresses, search_restaurants, search_products, or Dineout search first-call drill with response hashing, raw address redaction, no commercial action execution, and live credential gates",
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
      "/api/swiggy-cta-live-audit": {
        get: {
          tags: ["Builder Access"],
          summary: "Live Swiggy CTA auditor for safe click target verification",
          responses: {
            "200": {
              description:
                "Safe live probes for Swiggy Builders CTA targets, manual gates for forms, mail, and legal links, approved-origin checks, drift signals, and reviewer runbook evidence",
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
      "/api/ai-client-connect-kit/validate-config": {
        post: {
          tags: ["Builder Access"],
          summary: "Validate a Swiggy AI client MCP configuration",
          responses: {
            "200": {
              description:
                "Executable validation for Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, and generic MCP configs covering Food, Instamart /im, Dineout, OAuth readiness, secret redaction, and verification prompts",
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
      "/api/brand-compliance-kit/rehearse": {
        post: {
          tags: ["Builder Access"],
          summary: "Rehearse Swiggy brand attribution and co-branding readiness",
          responses: {
            "200": {
              description:
                "Selected brand rehearsal mode with Powered by Swiggy attribution, reviewed surfaces, palette status, official asset gates, screenshot gates, co-branding approval gates, commands, telemetry, and missing inputs",
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
      "/api/swiggy-staging-credential-drill": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Staging Credential Drill Center",
          responses: {
            "200": {
              description:
                "Credential issuance signal, first read-only probes, seeded data requirements, fail-closed token posture, operator runbook, handoff email, and promotion gates for Swiggy staging access",
            },
          },
        },
      },
      "/api/swiggy-staging-seed-smoke-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Staging Seed and Smoke Center",
          responses: {
            "200": {
              description:
                "Seeded data matrix, read/mutation/commercial/support smoke waves, telemetry evidence, stop rules, and promotion blockers for Swiggy staging certification",
            },
          },
        },
      },
      "/api/swiggy-live-signal-calibration": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Live Signal Calibration Center",
          responses: {
            "200": {
              description:
                "Food, Instamart, and Dineout live-signal calibration lanes, read-only probes, privacy controls, drift thresholds, fallback rules, operator runbook, and staging credential gates",
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
      "/api/swiggy-handshake-doctor": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy MCP OAuth and endpoint handshake doctor",
          responses: {
            "200": {
              description:
                "Safe live GET/OPTIONS probes for OAuth metadata, Food /food, Instamart /im, and Dineout /dineout endpoints without bearer tokens, tools/call payloads, or commercial actions",
            },
          },
        },
      },
      "/api/mcp/handshake-doctor": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy MCP handshake doctor alias",
          responses: {
            "200": {
              description:
                "Alias for the Swiggy handshake doctor, returning safe OAuth metadata and Food /food, Instamart /im, Dineout /dineout endpoint probes without tools/call execution",
            },
          },
        },
      },
      "/api/credential-onboarding": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy OAuth and Dynamic Client Registration onboarding cockpit",
          responses: { "200": { description: "DCR preview, redirect URI audit, scopes, access fields, and external gates" } },
        },
      },
      "/api/swiggy-credential-vault-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Credential Vault Center for secret posture, redaction, rotation, and cutover",
          responses: {
            "200": {
              description:
                "Runtime credential inventory, configured-secret posture, redaction rules, rotation runbook, support packet, and cutover gates without full token exposure",
            },
          },
        },
      },
      "/api/swiggy-credential-handoff-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Credential Handoff Center from localhost proof to staging and production",
          responses: {
            "200": {
              description:
                "Unified credential handoff room covering local demo proof, DCR, OAuth PKCE, exact redirect URI, secret vault, staging credentials, seeded smoke, 48-hour soak, handoff email, and production promotion gates",
            },
          },
        },
      },
      "/api/swiggy-credential-issuance/state": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy credential issuance receipt state",
          responses: {
            "200": {
              description:
                "Durable redacted state for DCR approval, client-id configuration, staging credential issuance, seeded user receipt, support thread, token-expiry recording, first-read readiness, notes, and update timestamp",
            },
          },
        },
        patch: {
          tags: ["Builder Access"],
          summary: "Update Swiggy credential issuance receipt state",
          responses: {
            "200": {
              description:
                "Persists redacted credential issuance metadata and returns the refreshed credential readiness dossier without storing tokens, secrets, auth codes, PKCE verifiers, or raw seeded-user PII",
            },
          },
        },
      },
      "/api/swiggy-credential-readiness-dossier": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Credential Readiness Dossier for source freeze, access receipt, DCR, vault, staging, and production",
          responses: {
            "200": {
              description:
                "Credential readiness dossier combining homepage 3-server and 18+ API-tool signals, llms/reference certification, source freeze, access submission state, DCR receipt, vault posture, seeded staging receipts, proof commands, and Swiggy-owned gates",
            },
          },
        },
      },
      "/api/swiggy-credential-readiness-dossier/rehearse": {
        post: {
          tags: ["Builder Access"],
          summary: "Swiggy credential readiness dossier rehearsal",
          responses: {
            "200": {
              description:
                "Local credential receipt rehearsal for access-packet follow-up, staging credential receipt, or production promotion readiness with redacted telemetry and no external Swiggy state changes",
            },
          },
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
      "/api/swiggy-auth-lifecycle-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Auth Lifecycle Center for PKCE, token expiry, and re-auth recovery",
          responses: {
            "200": {
              description:
                "OAuth lifecycle proof for PKCE S256, 120-second single-use codes, 5-day access tokens, no refresh-token assumption in v1.0, 401/419 re-auth recovery, exact redirect allowlisting, delegated per-user tokens, no-token logging, and live credential gates",
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
      "/api/enterprise-platform-center": {
        get: {
          tags: ["Builder Access"],
          summary: "Swiggy Enterprise Platform Center for tenant, quota, support, and contract readiness",
          responses: {
            "200": {
              description:
                "Enterprise platform readiness report for platform-operator onboarding, per-user delegated OAuth, tenant boundaries, peak QPS and quota review, 48-hour staging soak, contract SLAs, support channels, audit exports, co-branding gates, and enterprise external approvals",
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
      "/api/access-submission-studio/rehearse": {
        post: {
          tags: ["Builder Access"],
          summary: "Rehearse Swiggy access submission handoff without external submission",
          responses: {
            "200": {
              description:
                "Selected access handoff mode with official targets, copy blocks, attachments, browser runbook, mailto draft, commands, telemetry, missing inputs, and explicit Swiggy credential gates",
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
      "/api/swiggy-quota-negotiation-center": {
        get: {
          tags: ["Operations"],
          summary: "Swiggy Quota Negotiation Center for capacity confirmation and bespoke limits",
          responses: {
            "200": {
              description:
                "capacity request packet composing rate-limit budgets, traffic readiness, backpressure, Load Lab scenarios, route optimization, Retry-After headers, and Swiggy quota gates",
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
      "/api/swiggy-offer-intelligence/decide": {
        post: {
          tags: ["Commerce"],
          summary: "Decide whether a Swiggy offer can be applied, surfaced, or blocked",
          responses: {
            "200": {
              description:
                "Offer decision, selected savings lane, required fresh tool, user-facing copy, risk flags, redacted telemetry, and no-cart-mutation assertions",
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
      "/api/swiggy-order-lifecycle/probe": {
        post: {
          tags: ["Commerce"],
          summary: "Probe Swiggy order or booking status before tracking, support, or retry decisions",
          description:
            "Lifecycle decision, required official status tool, cadence floor, blind-retry block, user-facing copy, redacted telemetry, and no-raw-payload assertions",
          responses: {
            "200": {
              description:
                "Order lifecycle probe for Food, Instamart, and Dineout that blocks blind commercial retries until official Swiggy status is refreshed",
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
      "/api/swiggy-location-trust/select": {
        post: {
          tags: ["Commerce"],
          summary: "Select a Swiggy saved address or Dineout saved location before downstream discovery",
          description:
            "Location decision, selected-location hash, required next tool, invalidated downstream surfaces, user-facing copy, privacy telemetry, and no-raw-address assertions",
          responses: {
            "200": {
              description:
                "Address or saved-location selection decision for Food, Instamart, Dineout, combined planning, address creation, and address deletion flows",
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
      "/api/swiggy-cart-mutation-workbench/mutate": {
        post: {
          tags: ["Commerce"],
          summary: "Execute a safe Swiggy cart mutation and immediate readback",
          description:
            "Cart mutation decision, safe tool execution, required readback tool, redacted cart summary, no-commercial-action telemetry, and raw-payload retention assertions",
          responses: {
            "200": {
              description:
                "Food or Instamart cart mutation with immediate get_food_cart/get_cart readback, or a blocked/external-gate decision for unsafe contexts",
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
      "/api/swiggy-discovery-freshness/resolve": {
        post: {
          tags: ["Commerce"],
          summary: "Resolve fresh Swiggy discovery results before cart, slot, or confirmation state",
          description:
            "Read-only discovery execution, result summary, selected lane, required next tool, invalidated downstream surfaces, redacted telemetry, and no-cart-mutation assertions",
          responses: {
            "200": {
              description:
                "Food, Instamart, or Dineout discovery resolution using safe read tools such as search_menu, search_products, get_restaurant_details, or get_available_slots",
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
      "/api/support/bridge/report": {
        post: {
          tags: ["Operations"],
          summary: "Execute a redacted Swiggy report_error support report",
          responses: {
            "200": {
              description:
                "Consent-gated report_error execution for Food, Instamart, or Dineout with observed-issue checks, hashed toolContext identifiers, no raw tokens/payment/address retention, support receipt summary, and live credential gates",
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
      "/api/swiggy-operating-contract-center": {
        get: {
          tags: ["Operations"],
          summary: "Swiggy Operating Contract Center for SLA, rate-limit, support, versioning, and launch traffic",
          responses: {
            "200": {
              description:
                "Official operate-docs contract across 99.9% uptime, rate-limit/backpressure, traffic rollout, support escalation, version/deprecation, credentials, runbooks, and Swiggy external gates",
            },
          },
        },
      },
      "/api/swiggy-operating-contract-center/rehearse": {
        post: {
          tags: ["Operations"],
          summary: "Rehearse Swiggy operating contract readiness for access handoff",
          responses: {
            "200": {
              description:
                "Selected operating readiness mode with SLA, capacity notice, support packet, version watch, status fallback, staging credential gates, commands, telemetry, launch email draft, and missing inputs",
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
      "/api/error-intelligence/classify": {
        post: {
          tags: ["Operations"],
          summary: "Classify a Swiggy MCP error envelope into a safe recovery action",
          responses: {
            "200": {
              description:
                "Executable classifier for success:false, HTTP, JSON-RPC, and planned symbolic-code errors with retry, reauth, support, no-blind-retry, redacted telemetry, and user-safe copy decisions",
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
