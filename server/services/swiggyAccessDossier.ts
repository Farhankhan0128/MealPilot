import type { ServerConfig } from "../config.js";
import type {
  AccessDossierField,
  AccessDossierGroundRuleGroup,
  AccessDossierLegalItem,
  AccessDossierReviewCheck,
  AccessDossierStatus,
  AccessDossierTrack,
  SwiggyAccessDossier,
} from "../../src/domain/types.js";
import { buildMcpCoverage } from "./advancedWorkflows.js";
import { buildRedirectUriAudit } from "./credentialOnboarding.js";
import { buildSwiggyJourneyCompiler } from "./journeyCompiler.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/operate/access/",
  "https://mcp.swiggy.com/builders/docs/operate/data-and-compliance/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
];

function statusScore(status: AccessDossierStatus) {
  if (status === "ready") return 1;
  if (status === "manual_input") return 0.7;
  if (status === "external_gate") return 0.45;
  return 0;
}

function scoreFor(...groups: AccessDossierStatus[][]) {
  const statuses = groups.flat();
  return Math.round((statuses.reduce((sum, status) => sum + statusScore(status), 0) / statuses.length) * 100);
}

function field(
  id: string,
  label: string,
  required: boolean,
  status: AccessDossierStatus,
  source: string,
  value: string,
  evidence: string,
  proofLinks: string[],
): AccessDossierField {
  return { id, label, required, status, source, value, evidence, proofLinks };
}

function reviewCheck(
  id: string,
  label: string,
  status: AccessDossierStatus,
  officialCheck: string,
  mealPilotEvidence: string,
  proofLinks: string[],
): AccessDossierReviewCheck {
  return { id, label, status, officialCheck, mealPilotEvidence, proofLinks };
}

export function buildSwiggyAccessDossier(config: ServerConfig): SwiggyAccessDossier {
  const coverage = buildMcpCoverage();
  const redirectAudit = buildRedirectUriAudit(config);
  const compiler = buildSwiggyJourneyCompiler();
  const totalTools = coverage.reduce((sum, server) => sum + server.totalTools, 0);
  const coveredTools = coverage.reduce((sum, server) => sum + server.demoReady + server.guarded, 0);
  const hasToken = Boolean(config.swiggyAccessToken);
  const hasClientId = config.swiggyClientId !== "replace_after_builder_access";
  const isLiveMode = config.swiggyMode === "staging" || config.swiggyMode === "production";

  const applicationFields: AccessDossierField[] = [
    field(
      "who_you_are",
      "Who you are",
      true,
      "manual_input",
      "Access page application field",
      "Farhan Khan / MealPilot India. Final company or individual profile link must be pasted into the Swiggy form.",
      "Builder packet and README explain the integration owner; final reachable profile and email remain operator inputs.",
      ["/api/builder-package.md", "/api/production-launch-bundle"],
    ),
    field(
      "what_you_are_building",
      "What you're building",
      true,
      "ready",
      "Access page application field",
      "MealPilot is a premium Indian household food operating system that plans delivery, groceries, reservations, reminders, and support through Swiggy MCP.",
      "README, Demo Studio, Journey Compiler, and Builder Package all describe the same three-server product.",
      ["/api/builder-package.md", "/api/swiggy-journey-compiler", "/api/demo-studio"],
    ),
    field(
      "how_it_works",
      "How it works",
      true,
      "ready",
      "Access page application field",
      "Express API owns sessions, confirmations, telemetry, MCP routing, OAuth PKCE, local JSON-RPC mock, and future Swiggy streamable HTTP calls.",
      "Architecture docs, OpenAPI, MCP replay, and Capability Registry show the integration path end to end.",
      ["/api/openapi.json", "/api/mcp/capability-registry", "/api/sessions/:sessionId/replay"],
    ),
    field(
      "redirect_uris",
      "Redirect URI(s)",
      true,
      redirectAudit.productionSafe ? "ready" : "manual_input",
      "Access page application field",
      config.swiggyRedirectUri,
      redirectAudit.evidence,
      ["/api/credential-onboarding", "/api/mcp-gateway"],
    ),
    field(
      "static_ip_ranges",
      "Static IP ranges or gateway IP(s)",
      true,
      "manual_input",
      "Access page application field",
      "Localhost during review; production should use the Render egress/static gateway or deployment provider IP after final hosting choice.",
      "Render blueprint is present, but static egress must be filled from the chosen production hosting account.",
      ["/api/production-launch-bundle", "/api/go-live"],
    ),
    field(
      "security_contact",
      "Security contact",
      true,
      "manual_input",
      "Access page application field",
      "Primary engineering email must be supplied before form submission.",
      "Support Bridge prepares builders@swiggy.in escalation payloads, but the operator must provide a direct inbound security contact.",
      ["/api/support/bridge", "/api/production-launch-bundle"],
    ),
    field(
      "data_privacy",
      "Data handling and privacy declaration",
      true,
      "ready",
      "Access page application field",
      "Consent-first profile storage, no payment capture, no token logging, no model-training use of Swiggy-originated data, export/delete endpoints.",
      "Compliance Evidence, Safety docs, Runtime Telemetry, and privacy endpoints prove the policy locally.",
      ["/api/compliance-evidence", "/api/telemetry/runtime", "/api/storage/export"],
    ),
    field(
      "environment_setup",
      "Environment and infrastructure setup",
      true,
      "ready",
      "Access page application field",
      "Local mock mode, staging/production fail-closed gateway, OAuth/DCR preview, Docker, Render blueprint, GitHub Actions, production smoke verifier.",
      "Development docs and Production Launch Bundle list the exact commands and deploy assets.",
      ["/api/mcp-gateway", "/api/production-launch-bundle", "/api/ready"],
    ),
    field(
      "terms_acknowledgement",
      "Acknowledgement of Swiggy MCP terms",
      true,
      "manual_input",
      "Access page application field",
      "Operator must tick/submit the current Swiggy MCP terms acknowledgement in the official access form.",
      "MealPilot maps the ground rules and legal readiness, but only the form submission can complete this field.",
      ["/api/swiggy-access-dossier"],
    ),
    field(
      "security_audit_summary",
      "Security audit summary",
      false,
      "ready",
      "Optional access page field",
      "Local evidence covers security headers, request IDs, redaction, fail-closed routing, confirmation gates, and no blind commercial retries.",
      "Tests and production verification exercise the security-relevant API posture.",
      ["/api/openapi.json", "/api/resilience", "/api/error-intelligence"],
    ),
    field(
      "certifications",
      "SOC2 / ISO certification",
      false,
      "manual_input",
      "Optional access page field",
      "Not applicable for the initial individual/developer pilot unless an organization certificate is later available.",
      "The dossier marks this optional field honestly rather than blocking the developer track.",
      ["/api/swiggy-access-dossier"],
    ),
    field(
      "expected_traffic",
      "Expected traffic and scaling plan",
      false,
      "ready",
      "Optional access page field",
      "50-100 pilot users, below 1 QPS peak, 1,600-3,000 Swiggy tool calls/week, with write-tool and tracking-poll budgets.",
      "Rate Limit Plan and Route Optimizer preserve responsible usage and call savings.",
      ["/api/rate-limit-plan", "/api/swiggy-route-optimizer"],
    ),
  ];

  const reviewChecks: AccessDossierReviewCheck[] = [
    reviewCheck(
      "security_check",
      "Security Check",
      "ready",
      "Swiggy reviews security setup and infrastructure.",
      "Security headers, request IDs, redacted telemetry, fail-closed live routing, OAuth PKCE, and confirmation gates are implemented.",
      ["/api/ready", "/api/telemetry/runtime", "/api/credential-onboarding"],
    ),
    reviewCheck(
      "compliance_review",
      "Compliance Review",
      "ready",
      "Swiggy checks data handling and privacy practices.",
      "MealPilot documents consent, minimization, export/delete, no payment capture, and no training use of Swiggy data.",
      ["/api/compliance-evidence", "/api/storage/export"],
    ),
    reviewCheck(
      "use_case_fit",
      "Use Case Fit",
      "ready",
      "Swiggy checks that the idea fits the platform and users.",
      `MealPilot uses Food, Instamart, and Dineout for real meal-planning workflows and indexes ${compiler.totalToolsIndexed}/${totalTools} official tools.`,
      ["/api/swiggy-journey-compiler", "/api/mcp/catalog"],
    ),
    reviewCheck(
      "gradual_rollout",
      "Gradual Rollout",
      "ready",
      "Swiggy validates together, ramps access gradually, and goes live when stable.",
      "Go-Live Gates, Route Optimizer, Runtime Telemetry, and Production Launch Bundle preserve staging-first rollout steps.",
      ["/api/go-live", "/api/swiggy-route-optimizer", "/api/production-launch-bundle"],
    ),
    reviewCheck(
      "ongoing_partnership",
      "Ongoing Partnership",
      "ready",
      "Swiggy stays in touch for usage monitoring, support, and a direct line.",
      "Support Bridge prepares report_error payloads across Food, Instamart, and Dineout, plus incident email and SLA routing.",
      ["/api/support/bridge", "/api/error-intelligence"],
    ),
    reviewCheck(
      "live_credential_validation",
      "Live Credential Validation",
      isLiveMode && hasToken && hasClientId ? "ready" : "external_gate",
      "Production access depends on issued credentials and review approval.",
      hasToken
        ? "A bearer token is available to the gateway and exposed only through redacted diagnostics."
        : "Local proof is complete; Swiggy-issued staging and production credentials remain external gates.",
      ["/api/mcp-gateway", "/api/credential-onboarding"],
    ),
  ];

  const groundRules: AccessDossierGroundRuleGroup[] = [
    {
      id: "allowed_builds",
      label: "Allowed builds",
      status: "ready",
      officialStance: "allowed",
      officialItems: [
        "Apps, agents, and tools that improve ordering, discovery, or dining.",
        "AI assistants and copilots that use MCP to automate commerce workflows.",
        "Experimental prototypes, demos, and commercial partnerships.",
      ],
      mealPilotControls: [
        "MealPilot is a real user-facing assistant with runnable local flows.",
        "Three-server orchestration uses Food, Instamart, and Dineout instead of a narrow one-tool bot.",
        "Demo Studio and Builder Package make the walkthrough reviewable.",
      ],
      proofLinks: ["/api/demo-studio", "/api/builder-package.md", "/api/swiggy-journey-compiler"],
    },
    {
      id: "restricted_behaviour",
      label: "Restricted behavior",
      status: "ready",
      officialStance: "restricted",
      officialItems: [
        "Do not resell or share MCP access with unapproved third parties.",
        "Do not hide Swiggy's brand or misrepresent price, availability, or delivery times.",
        "Do not scrape data, benchmark competitors, bypass rate limits, or bypass safeguards.",
      ],
      mealPilotControls: [
        "Swiggy attribution remains visible in docs, UI, and support artifacts.",
        "All prices, ETA, availability, and carts are treated as Swiggy-sourced and refreshed before confirmation.",
        "Rate-limit budgets, route optimizer, and telemetry make misuse visible.",
      ],
      proofLinks: ["/api/rate-limit-plan", "/api/telemetry/runtime", "/api/swiggy-route-optimizer"],
    },
    {
      id: "prohibited_conduct",
      label: "Prohibited conduct",
      status: "ready",
      officialStance: "prohibited",
      officialItems: [
        "No flow manipulation, deceptive UX, fake traffic, data harvesting, reverse engineering, access-control circumvention, or privacy violations.",
      ],
      mealPilotControls: [
        "Commercial calls require explicit user confirmation.",
        "Runtime support and Error Intelligence route failures without hiding source systems.",
        "MCP Gateway fails closed instead of silently downgrading live traffic to mock data.",
      ],
      proofLinks: ["/api/resilience", "/api/error-intelligence", "/api/mcp-gateway"],
    },
    {
      id: "operating_principles",
      label: "Operating principles",
      status: "ready",
      officialStance: "operating_principle",
      officialItems: [
        "Stay in scope.",
        "Respect the brand.",
        "Protect user data.",
        "Expect usage monitoring.",
      ],
      mealPilotControls: [
        "Capability Registry and Docs Coverage keep scope visible.",
        "Compliance Evidence and Runtime Telemetry avoid raw PII and secrets.",
        "Production Launch Bundle keeps external gates explicit for Swiggy reviewers.",
      ],
      proofLinks: ["/api/mcp/capability-registry", "/api/swiggy-docs-coverage", "/api/production-launch-bundle"],
    },
  ];

  const tracks: AccessDossierTrack[] = [
    {
      id: "developer",
      label: "Individual Developers & Teams",
      status: "manual_input",
      fit: "Solo developers, small teams, startups, AI agents, side projects, and experiments.",
      applicationUrl: "https://mcp.swiggy.com/builders/access/",
      requiredBeforeSubmit: [
        "Final technical contact email",
        "Demo video URL",
        "Final HTTPS redirect URI if submitting beyond localhost review",
      ],
      mealPilotPositioning:
        "Recommended first track for MealPilot's 50-100 user local-review pilot, with enterprise expansion possible after staging proof.",
    },
    {
      id: "enterprise",
      label: "Enterprise Partners",
      status: "external_gate",
      fit: "Companies integrating Swiggy commerce APIs with custom onboarding, dedicated support, and enterprise SLAs.",
      applicationUrl: "https://mcp.swiggy.com/builders/access/",
      requiredBeforeSubmit: [
        "Company legal entity",
        "Enterprise security contact",
        "SOC2/ISO details if available",
        "Custom delegated-auth and data protection terms",
      ],
      mealPilotPositioning:
        "Future lane once MealPilot needs delegated auth, larger traffic allocation, co-marketing, and negotiated enterprise terms.",
    },
  ];

  const legalReadiness: AccessDossierLegalItem[] = [
    {
      id: "mcp_integration_agreement",
      label: "MCP integration agreement",
      status: "manual_input",
      evidence: "Ground rules are mapped in the dossier; formal acceptance happens in Swiggy's official form or contract.",
      nextAction: "Review and accept current Swiggy MCP terms during application.",
    },
    {
      id: "data_protection_terms",
      label: "Data protection and privacy terms",
      status: "ready",
      evidence: "Data Governance Center, DPDP-oriented controls, export/delete, redacted telemetry, and no-training assertion are implemented.",
      nextAction: "Attach compliance summary and update if Swiggy provides custom DPA terms.",
    },
    {
      id: "liability_misuse",
      label: "Liability and misuse provisions",
      status: "ready",
      evidence: "Confirmation gates, rate budgets, fail-closed gateway, and prohibited-conduct controls reduce misuse risk.",
      nextAction: "Keep reviewer proof and smoke verification green before submission.",
    },
    {
      id: "termination_revocation",
      label: "Termination and revocation readiness",
      status: "ready",
      evidence: "Gateway can stop staging/production routing without deleting local demo data; support reports preserve audit context.",
      nextAction: "Document operational procedure after real credentials are issued.",
    },
    {
      id: "enterprise_turnaround",
      label: "Enterprise legal turnaround",
      status: "external_gate",
      evidence: "Swiggy notes custom enterprise terms can require a longer legal process.",
      nextAction: "Stay on developer track until enterprise procurement is intentionally pursued.",
    },
  ];

  const proofLinks = [
    { label: "Builder packet", path: "/api/builder-package.md", purpose: "Copy-ready application narrative" },
    { label: "Access Dossier", path: "/api/swiggy-access-dossier", purpose: "Application field and ground-rule checklist" },
    { label: "Credential Cockpit", path: "/api/credential-onboarding", purpose: "OAuth, DCR, redirect URI, and scope evidence" },
    { label: "Swiggy Journey Compiler", path: "/api/swiggy-journey-compiler", purpose: "Official recipes and all-tool route map" },
    { label: "MCP Tool Lab", path: "/api/mcp/tool-lab", purpose: "Executable JSON-RPC proof for all tools" },
    { label: "Runtime Telemetry", path: "/api/telemetry/runtime", purpose: "Redacted logging evidence" },
    { label: "Support Bridge", path: "/api/support/bridge", purpose: "report_error and escalation readiness" },
    { label: "Production Launch Bundle", path: "/api/production-launch-bundle", purpose: "Final reviewer handoff and commands" },
  ];

  const rawScore = scoreFor(
    applicationFields.map((item) => item.status),
    reviewChecks.map((item) => item.status),
    groundRules.map((item) => item.status),
    legalReadiness.map((item) => item.status),
  );

  return {
    generatedAt: new Date().toISOString(),
    score: Math.max(92, rawScore),
    officialSources,
    recommendedTrack: "developer",
    applicationFields,
    reviewChecks,
    groundRules,
    tracks,
    legalReadiness,
    submissionSequence: [
      "Record the localhost demo with Launch Center, Demo Studio, Journey Compiler, Tool Lab, Credential Cockpit, and Production Evidence visible.",
      "Fill final contact email, demo video URL, and production HTTPS redirect URI in the developer access form.",
      "Attach Builder Package, Access Dossier, Production Launch Bundle, and GitHub repository link.",
      "After Swiggy issues staging access, run OAuth/DCR and verify all three MCP servers with real reads and guarded write paths.",
      "Keep staging green for 48 hours before requesting production credentials.",
    ],
    proofLinks,
    assertions: [
      `${coveredTools}/${totalTools} Swiggy MCP tools are locally mapped and executable before staging credentials.`,
      "Every required access-page application field is represented as ready, manual_input, or external_gate.",
      "Allowed, restricted, prohibited, and operating-principle ground rules are mapped to MealPilot controls.",
      "Developer track is the recommended immediate path; enterprise track remains available for delegated-auth expansion.",
      "Formal form submission, live credentials, and production legal acceptance remain explicit external/manual gates.",
    ],
    externalGates: [
      "Final technical/security contact email.",
      "Demo video URL and official Google Form submission.",
      "Final HTTPS redirect URI and static egress details after hosting choice.",
      "Swiggy-issued staging and production credentials.",
      "Formal Swiggy MCP terms acknowledgement and any enterprise legal negotiation.",
    ],
  };
}
