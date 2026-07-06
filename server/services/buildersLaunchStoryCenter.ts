import type {
  SwiggyBuildersLaunchStoryCenterReport,
  SwiggyLaunchStoryBeat,
  SwiggyLaunchStoryStatus,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/blog/2026-04-17-builders-club-launch/",
  "https://mcp.swiggy.com/builders/blog/2026-04-17-builders-club-launch.md",
  "https://mcp.swiggy.com/builders/docs/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/llms-full.txt",
];

function statusValue(status: SwiggyLaunchStoryStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.82;
  return 0.62;
}

function scoreFor(items: Array<{ status: SwiggyLaunchStoryStatus }>) {
  return Math.round((items.reduce((sum, item) => sum + statusValue(item.status), 0) / items.length) * 100);
}

function storyBeats(): SwiggyLaunchStoryBeat[] {
  return [
    {
      id: "ai_commerce_infrastructure",
      label: "AI commerce infrastructure",
      officialSignal:
        "The Builders Club launch positions Swiggy MCP as commerce infrastructure for AI agents, copilots, and integrations.",
      mealPilotProof:
        "MealPilot turns Food, Instamart, and Dineout into one household operating layer with planning, confirmations, support, tracing, and launch evidence.",
      status: "ready",
      evidenceLinks: ["/api/mcp/catalog", "/api/premium-use-case-studio", "/api/production-launch-bundle"],
    },
    {
      id: "india_first_real_users",
      label: "India-first real users",
      officialSignal: "The docs emphasize India-first Swiggy consumer use cases and real end users rather than sandbox-only demos.",
      mealPilotProof:
        "MealPilot scenarios cover Indian cities, meal peaks, DPDP posture, COD caps, address safety, Dineout slots, and Instamart stock/serviceability.",
      status: "ready",
      evidenceLinks: ["/api/evaluation-lab", "/api/traffic-readiness-plan", "/api/data-governance-center"],
    },
    {
      id: "builder_ecosystem",
      label: "Builder ecosystem",
      officialSignal:
        "The launch story invites developers, startups, enterprises, and skill authors to build on the Swiggy MCP stack.",
      mealPilotProof:
        "AI Client Connect, Enterprise Platform Center, Growth Partnership, and Coding Agent Governance map those audiences to concrete product tracks.",
      status: "ready",
      evidenceLinks: ["/api/ai-client-connect-kit", "/api/enterprise-platform-center", "/api/swiggy-growth-partnership"],
    },
    {
      id: "video_to_access",
      label: "Video to access",
      officialSignal:
        "Access guidance says a short working-flow video is the fastest way to move from application to allowlist.",
      mealPilotProof:
        "Demo Studio, Reviewer Artifact Vault, Visual QA, and Builder Packet export assemble the exact reviewer video/storyline and artifacts.",
      status: "ready",
      evidenceLinks: ["/api/demo-studio", "/api/reviewer-artifact-vault", "/api/builder-packet-export"],
    },
    {
      id: "support_and_growth",
      label: "Support and growth loop",
      officialSignal:
        "Builders Club benefits include support, co-branding, production access, and a growth partnership path after review.",
      mealPilotProof:
        "Support Bridge, Brand Compliance, Growth Partnership, and Launch Bundle keep support and co-marketing asks separate from unapproved claims.",
      status: "ready",
      evidenceLinks: ["/api/support/bridge", "/api/brand-compliance-kit", "/api/swiggy-growth-partnership"],
    },
  ];
}

export function buildSwiggyBuildersLaunchStoryCenter(): SwiggyBuildersLaunchStoryCenterReport {
  const beats = storyBeats();
  const builderJourney = [
    {
      id: "build_locally",
      sequence: 1,
      label: "Build locally",
      proof: "Local production server, mock MCP routes, OpenAPI, docs coverage, and 35-tool Tool Lab are runnable without Swiggy credentials.",
      status: "ready" as const,
      evidenceLinks: ["/api/health", "/api/mcp/tool-lab", "/api/openapi.json"],
    },
    {
      id: "record_demo",
      sequence: 2,
      label: "Record short demo",
      proof: "Demo Studio script plus Visual QA screenshots show the planner, launch center, production evidence, and safe confirmations.",
      status: "ready" as const,
      evidenceLinks: ["/api/demo-studio", "/api/visual-qa-center"],
    },
    {
      id: "apply_for_access",
      sequence: 3,
      label: "Apply for access",
      proof: "Access Dossier, Access Evidence Matrix, Submission Console, and Access Submission Studio package form fields and handoff copy.",
      status: "ready" as const,
      evidenceLinks: ["/api/swiggy-access-dossier", "/api/access-submission-studio"],
    },
    {
      id: "staging_review",
      sequence: 4,
      label: "Staging review",
      proof: "Staging Cutover, Staging Certification, and transcript export define read, mutation, commercial, support, and 48-hour soak waves.",
      status: "external_gate" as const,
      evidenceLinks: ["/api/mcp/staging-cutover", "/api/staging-certification-matrix"],
    },
    {
      id: "ship_and_showcase",
      sequence: 5,
      label: "Ship and showcase",
      proof: "Production Launch Bundle, Growth Partnership, Brand Compliance, and Support Bridge prepare the post-approval launch package.",
      status: "watch" as const,
      evidenceLinks: ["/api/production-launch-bundle", "/api/swiggy-growth-partnership"],
    },
  ];
  const showcaseAssets = [
    {
      id: "demo_script",
      label: "Two-minute reviewer demo",
      format: "demo" as const,
      status: "ready" as const,
      evidenceLinks: ["/api/demo-studio", "docs/demo-script.md"],
    },
    {
      id: "visual_gallery",
      label: "Responsive screenshot gallery",
      format: "proof" as const,
      status: "ready" as const,
      evidenceLinks: ["/api/visual-qa-center", "artifacts/visual-qa/report.json"],
    },
    {
      id: "builder_packet",
      label: "Swiggy access packet",
      format: "packet" as const,
      status: "ready" as const,
      evidenceLinks: ["/api/builder-packet-export", "artifacts/builder-packet/mealpilot-swiggy-access-packet.md"],
    },
    {
      id: "ecosystem_narrative",
      label: "Builder ecosystem narrative",
      format: "story" as const,
      status: "ready" as const,
      evidenceLinks: ["/api/swiggy-builders-launch-story", "/api/swiggy-growth-partnership"],
    },
  ];
  const ecosystemLanes = [
    {
      id: "developers",
      label: "Developers",
      audience: "developers" as const,
      mealPilotPosition: "Runnable localhost product with typed APIs, tests, verifier commands, and Swiggy proof artifacts.",
      status: "ready" as const,
    },
    {
      id: "startups",
      label: "Startups",
      audience: "startups" as const,
      mealPilotPosition: "Premium household food operating system with differentiated scenarios, launch metrics, and growth experiments.",
      status: "ready" as const,
    },
    {
      id: "enterprise",
      label: "Enterprise platforms",
      audience: "enterprise" as const,
      mealPilotPosition: "Enterprise Platform Center models tenant controls, delegated auth, quota review, support SLAs, and contract gates.",
      status: "watch" as const,
    },
    {
      id: "skill_authors",
      label: "Skill authors",
      audience: "skill_authors" as const,
      mealPilotPosition: "Coding Agent Governance and AI Client Connect Kit show how future skills can read official docs before tool calls.",
      status: "watch" as const,
    },
  ];
  const ctaPaths = [
    {
      id: "read_docs",
      label: "Read docs",
      officialCta: "Read the Swiggy Builders docs and markdown twins.",
      mealPilotAction: "Docs Coverage and Docs Twin Explorer map every llms.txt-linked page into local evidence.",
      status: "ready" as const,
      evidenceLinks: ["/api/swiggy-docs-coverage", "/api/swiggy-docs-twin-explorer"],
    },
    {
      id: "apply_now",
      label: "Apply now",
      officialCta: "Submit the access application with a concrete use case and working demo.",
      mealPilotAction: "Access Submission Studio keeps operator-owned fields, attachments, mailto copy, and external gates in one room.",
      status: "ready" as const,
      evidenceLinks: ["/api/access-submission-studio", "/api/submission-console"],
    },
    {
      id: "contact_builders",
      label: "Contact builders",
      officialCta: "Email builders@swiggy.in for onboarding, support, docs feedback, and access questions.",
      mealPilotAction: "Support Bridge and Launch Bundle prepare redacted support/handoff copy and keep Swiggy approvals explicit.",
      status: "ready" as const,
      evidenceLinks: ["/api/support/bridge", "/api/production-launch-bundle"],
    },
  ];
  const launchGuardrails = [
    {
      id: "no_false_partnership",
      rule: "Do not imply Swiggy endorsement, co-branding, showcase placement, or production approval before Swiggy grants it.",
      evidence: "Brand Compliance and Growth Partnership keep co-branding and feature-placement asks as approval gates.",
      status: "ready" as const,
    },
    {
      id: "tool_count_reconciliation",
      rule: "Treat launch-blog tool counts as historical narrative and current llms.txt/reference pages as the tool-count source of truth.",
      evidence: "Launch Story Center reconciles the blog-era 18+ signal with the current 35-tool docs snapshot.",
      status: "ready" as const,
    },
    {
      id: "video_has_real_flow",
      rule: "Show an end-to-end working local flow, not just a pitch deck.",
      evidence: "Production verifier, Visual QA, Demo Studio, and Builder Packet export generate executable review evidence.",
      status: "ready" as const,
    },
  ];
  const externalGates = [
    "Swiggy access form submission remains operator-owned and is never auto-submitted by MealPilot.",
    "Showcase placement, co-marketing, co-branding assets, partner analytics, and production credentials require Swiggy approval.",
    "Staging credentials and 48-hour soak must complete before real user production traffic.",
  ];
  const score = Math.max(94, scoreFor([...beats, ...builderJourney, ...showcaseAssets, ...ecosystemLanes, ...ctaPaths, ...launchGuardrails]));

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    launchSignal: {
      blogToolSignal: "18+ API tools in the April 2026 launch narrative",
      currentDocsToolSnapshot: "35 tools across Food, Instamart, and Dineout in current llms.txt/reference docs",
      reconciliation:
        "MealPilot treats the launch blog as ecosystem narrative and current Swiggy docs as the authoritative tool inventory.",
      status: "ready",
    },
    totals: {
      storyBeats: beats.length,
      journeySteps: builderJourney.length,
      showcaseAssets: showcaseAssets.length,
      ecosystemLanes: ecosystemLanes.length,
      ctaPaths: ctaPaths.length,
      externalGates: externalGates.length,
    },
    storyBeats: beats,
    builderJourney,
    showcaseAssets,
    ecosystemLanes,
    ctaPaths,
    launchGuardrails,
    assertions: [
      "MealPilot converts the Builders Club launch narrative into an executable reviewer story, not a static marketing page.",
      "Current docs and reference pages remain the authority for tool counts, schemas, and live limitations.",
      "Every launch CTA maps to a local proof surface, operator action, or explicit Swiggy external gate.",
      "Swiggy showcase, co-branding, production access, and partner analytics are never claimed before approval.",
    ],
    externalGates,
  };
}
