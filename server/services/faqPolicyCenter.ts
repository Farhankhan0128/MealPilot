import type {
  SwiggyFaqPolicyCenter,
  SwiggyFaqPolicyItem,
  SwiggyFaqPolicyStatus,
  SwiggyPolicyRule,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/",
];

function statusScore(status: SwiggyFaqPolicyStatus) {
  if (status === "ready") return 1;
  if (status === "documented") return 0.72;
  return 0.45;
}

function faq(
  id: string,
  source: SwiggyFaqPolicyItem["source"],
  audience: SwiggyFaqPolicyItem["audience"],
  question: string,
  officialSignal: string,
  mealPilotAnswer: string,
  status: SwiggyFaqPolicyStatus,
  evidenceLinks: string[],
): SwiggyFaqPolicyItem {
  return { id, source, audience, question, officialSignal, mealPilotAnswer, status, evidenceLinks };
}

function rule(
  id: string,
  category: SwiggyPolicyRule["category"],
  officialRule: string,
  mealPilotControl: string,
  status: SwiggyFaqPolicyStatus,
  evidenceLinks: string[],
): SwiggyPolicyRule {
  return { id, category, officialRule, mealPilotControl, status, evidenceLinks };
}

function buildFaqItems(): SwiggyFaqPolicyItem[] {
  return [
    faq(
      "home_what_is_builders",
      "home_faq",
      "all",
      "What is the Swiggy Builders Club?",
      "Swiggy presents Builders Club as its MCP platform for Food, Instamart, and Dineout agents, apps, and integrations.",
      "MealPilot is a runnable three-server product with Tool Lab, Journey Compiler, and Capability Registry evidence.",
      "ready",
      ["/api/mcp/catalog", "/api/swiggy-journey-compiler", "/api/mcp/capability-registry"],
    ),
    faq(
      "home_individual_developer",
      "home_faq",
      "developers",
      "Can individual developers join?",
      "The public site addresses individual developers and small teams directly.",
      "Submission Console recommends the developer track and keeps enterprise as a future external gate.",
      "ready",
      ["/api/submission-console", "/api/swiggy-access-dossier"],
    ),
    faq(
      "home_what_build",
      "home_faq",
      "all",
      "What can I build with this?",
      "Swiggy encourages agents, copilots, apps, integrations, and commerce workflows across all three servers.",
      "Premium Use Case Studio, Premium Concierge, Journey Compiler, and Scenario Runner turn this into differentiated MealPilot lanes.",
      "ready",
      ["/api/premium-use-case-studio", "/api/premium-concierge-itinerary", "/api/mcp/scenario-runner"],
    ),
    faq(
      "home_send_demo",
      "home_faq",
      "reviewers",
      "Can I send a demo?",
      "Swiggy asks builders to send a demo and highlights standout projects.",
      "Demo Studio, Submission Console, and Launch Bundle provide the recording plan, proof links, and email draft.",
      "ready",
      ["/api/demo-studio", "/api/submission-console", "/api/production-launch-bundle"],
    ),
    faq(
      "home_hiring",
      "home_faq",
      "developers",
      "Does Swiggy hire from the program?",
      "Swiggy says standout builders may be noticed or recruited.",
      "MealPilot keeps this as positioning only; the product proof focuses on user value, safety, and staging readiness.",
      "documented",
      ["/api/swiggy-builder-intake", "/api/reviewer-proof"],
    ),
    faq(
      "home_application_process",
      "home_faq",
      "reviewers",
      "How does the application process work?",
      "The public flow is local build, production access application, review, go-live, and demo sharing.",
      "Submission Console and Staging Cutover preserve the exact sequence with operator and Swiggy gates.",
      "ready",
      ["/api/submission-console", "/api/mcp/staging-cutover"],
    ),
    faq(
      "home_rate_limits",
      "home_faq",
      "developers",
      "Are there rate limits?",
      "Swiggy promises defaults and reviewable expansion requests.",
      "Traffic Readiness, Rate Plan, and Route Optimizer keep volume below pilot ceilings and show expansion email paths.",
      "ready",
      ["/api/traffic-readiness-plan", "/api/rate-limit-plan", "/api/swiggy-route-optimizer"],
    ),
    faq(
      "home_break_something",
      "home_faq",
      "reviewers",
      "What happens if something breaks?",
      "Swiggy points builders toward support, monitoring, and responsible escalation.",
      "Support Bridge, Error Intelligence, SLO Command, Audit Ledger, and Runtime Telemetry prepare redacted support evidence.",
      "ready",
      ["/api/support/bridge", "/api/error-intelligence", "/api/slo-incident-command", "/api/audit-ledger"],
    ),
    faq(
      "developer_approval",
      "developer_faq",
      "developers",
      "Do I need approval to start building?",
      "Developers can start locally before production approval.",
      "Mock MCP, Tool Lab, Scenario Runner, and Staging Transcript let MealPilot prove the flow before credentials.",
      "ready",
      ["/api/mcp/tool-lab", "/api/mcp/scenario-runner", "/api/sessions/:sessionId/staging-transcript"],
    ),
    faq(
      "developer_servers",
      "developer_faq",
      "developers",
      "Which MCP servers can I use?",
      "Swiggy documents Food, Instamart, and Dineout as the three public servers.",
      "MealPilot covers all three with 35 tools, server boundaries, and separate confirmation gates.",
      "ready",
      ["/api/mcp/catalog", "/api/mcp/tool-contract-matrix", "/api/mcp/state-orchestrator"],
    ),
    faq(
      "developer_auth",
      "developer_faq",
      "developers",
      "How does authentication work?",
      "Swiggy docs describe MCP over Streamable HTTP with OAuth 2.1 PKCE.",
      "Credential Cockpit, OAuth Status, and Gateway expose PKCE, redirect URI, token posture, and fail-closed routing.",
      "ready",
      ["/api/credential-onboarding", "/api/auth/swiggy/status", "/api/mcp-gateway"],
    ),
    faq(
      "developer_chain_servers",
      "developer_faq",
      "developers",
      "Can I chain multiple MCP servers in one agent?",
      "Developer examples promote cross-server agents such as ordering, grocery, and reservations together.",
      "Journey Compiler, Premium Concierge, and Route Optimizer compose Food, Instamart, and Dineout while preserving server state boundaries.",
      "ready",
      ["/api/swiggy-journey-compiler", "/api/premium-concierge-itinerary", "/api/swiggy-route-optimizer"],
    ),
    faq(
      "developer_good_demo",
      "developer_faq",
      "reviewers",
      "What does a good demo look like?",
      "Swiggy asks builders to show what they built and share a demo or GitHub link.",
      "Demo Studio lays out the recording sequence and Submission Console lists attachments and handoff drafts.",
      "ready",
      ["/api/demo-studio", "/api/submission-console", "/api/reviewer-proof"],
    ),
    faq(
      "developer_sandbox",
      "developer_faq",
      "developers",
      "Is there a sandbox or test environment?",
      "Swiggy lets builders start on localhost and move to staging/production after review.",
      "MealPilot keeps local mock proof complete and marks seeded staging credentials as the external gate.",
      "ready",
      ["/api/mcp-gateway", "/api/mcp/staging-cutover", "/api/staging-certification-matrix"],
    ),
    faq(
      "enterprise_onboarding",
      "enterprise_faq",
      "enterprises",
      "How does enterprise onboarding work?",
      "Enterprise access includes custom onboarding, dedicated support, contracts, and higher production expectations.",
      "Enterprise Delegated Auth, SLO Command, Data Governance, and Submission Console keep that track prepared but gated.",
      "ready",
      ["/api/enterprise-delegated-auth", "/api/slo-incident-command", "/api/data-governance-center"],
    ),
    faq(
      "enterprise_compliance",
      "enterprise_faq",
      "enterprises",
      "What compliance support is available?",
      "Swiggy references compliance review, data/privacy terms, and enterprise attestations.",
      "Data Governance, Audit Ledger, Access Dossier, and Safety docs show DPDP, retention, DSR, redaction, and DPA gates.",
      "ready",
      ["/api/data-governance-center", "/api/audit-ledger", "/api/swiggy-access-dossier"],
    ),
    faq(
      "enterprise_white_label",
      "enterprise_faq",
      "enterprises",
      "Can we white-label the integration?",
      "The public access page warns against hiding Swiggy's brand and stresses attribution.",
      "Brand Compliance preserves Powered by Swiggy attribution and keeps white-label/co-branding rights as external approvals.",
      "ready",
      ["/api/brand-compliance-kit", "/api/swiggy-access-dossier"],
    ),
  ];
}

function buildPolicyRules(): SwiggyPolicyRule[] {
  return [
    rule(
      "allowed_agents_apps",
      "allowed",
      "Build apps, agents, tools, copilots, experiments, and commercial partnerships that improve ordering, discovery, dining, or commerce workflows.",
      "MealPilot implements a real household meal operating system with confirmation-safe Food, Instamart, and Dineout routes.",
      "ready",
      ["/api/builder-package.md", "/api/swiggy-journey-compiler", "/api/premium-use-case-studio"],
    ),
    rule(
      "allowed_brand_guidelines",
      "allowed",
      "Integrations should follow Swiggy security and branding guidelines.",
      "Brand Compliance, Data Governance, and Submission Console make attribution, screenshots, and access fields reviewable.",
      "ready",
      ["/api/brand-compliance-kit", "/api/data-governance-center", "/api/submission-console"],
    ),
    rule(
      "restricted_access_resale",
      "restricted",
      "Do not resell, share MCP access with unapproved third parties, or create confusing aggregation layers.",
      "MCP Gateway keeps credentials server-side and enterprise delegated auth is gated on partner approval.",
      "ready",
      ["/api/mcp-gateway", "/api/enterprise-delegated-auth"],
    ),
    rule(
      "restricted_misrepresentation",
      "restricted",
      "Do not misrepresent prices, availability, delivery times, or platform data.",
      "State Orchestrator refreshes authoritative cart and slot state before confirmations and labels Swiggy-sourced data.",
      "ready",
      ["/api/mcp/state-orchestrator", "/api/sessions/:sessionId/preflight"],
    ),
    rule(
      "restricted_rate_limits",
      "restricted",
      "Do not bypass rate limits, logging, monitoring, or safeguards.",
      "Traffic Readiness, Runtime Telemetry, Audit Ledger, and Route Optimizer keep responsible usage measurable.",
      "ready",
      ["/api/traffic-readiness-plan", "/api/telemetry/runtime", "/api/audit-ledger", "/api/swiggy-route-optimizer"],
    ),
    rule(
      "prohibited_manipulation",
      "prohibited",
      "No manipulating order flows, incentives, ranking, fake traffic, deceptive UX, data harvesting, reverse engineering, access-control circumvention, or privacy violations.",
      "Confirmation gates, no blind commercial retries, redaction contracts, and prohibited-conduct controls are covered by tests and verifier.",
      "ready",
      ["/api/resilience", "/api/error-intelligence", "/api/compliance-evidence"],
    ),
    rule(
      "principle_scope",
      "operating_principle",
      "Stay in scope and talk to Swiggy before expanding into new capabilities.",
      "Capability Registry and Upstream Watch distinguish shipped capabilities from roadmap items and external gates.",
      "ready",
      ["/api/mcp/capability-registry", "/api/swiggy-upstream-watch"],
    ),
    rule(
      "principle_user_data",
      "operating_principle",
      "Transaction data from MCP stays governed by Swiggy terms and must be handled responsibly.",
      "Data Governance, Audit Ledger, Privacy Export/Delete, and Runtime Telemetry keep Swiggy-originated data bounded and redacted.",
      "ready",
      ["/api/data-governance-center", "/api/audit-ledger", "/api/privacy/export", "/api/telemetry/runtime"],
    ),
    rule(
      "legal_framework",
      "legal",
      "Enterprise partners may negotiate integration agreement, data protection/privacy terms, liability, misuse, termination, and revocation provisions.",
      "Access Dossier and Enterprise Delegated Auth keep legal acceptance, contracts, DPA, and platform-operator approval as explicit external gates.",
      "documented",
      ["/api/swiggy-access-dossier", "/api/enterprise-delegated-auth", "/api/submission-console"],
    ),
  ];
}

export function buildSwiggyFaqPolicyCenter(): SwiggyFaqPolicyCenter {
  const faqItems = buildFaqItems();
  const policyRules = buildPolicyRules();
  const statuses = [...faqItems.map((item) => item.status), ...policyRules.map((item) => item.status)];
  const score = Math.round((statuses.reduce((sum, status) => sum + statusScore(status), 0) / statuses.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totalQuestions: faqItems.length,
    readyQuestions: faqItems.filter((item) => item.status === "ready").length,
    totalRules: policyRules.length,
    readyRules: policyRules.filter((item) => item.status === "ready").length,
    faqItems,
    policyRules,
    headerFooterCoverage: {
      headerLinks: ["Builders Club", "Developers", "Enterprises", "Docs", "Blog", "FAQ", "Start Building"],
      footerResources: ["Guidelines", "FAQ", "Apply", "llms.txt", "Privacy Policy", "Terms and Conditions", "builders@swiggy.in"],
      evidence: "Website Atlas covers header, docs subnav, footer resource groups, and public CTA destinations.",
    },
    supportContact: {
      email: "builders@swiggy.in",
      escalationEvidence: ["/api/support/bridge", "/api/slo-incident-command", "/api/error-intelligence"],
    },
    assertions: [
      "MealPilot answers the homepage, developer, and enterprise FAQ themes with runnable product evidence.",
      "Allowed, restricted, prohibited, operating-principle, and legal framework signals are mapped to MealPilot controls.",
      "Footer resources such as Guidelines, FAQ, Apply, llms.txt, privacy, terms, and builders@swiggy.in have evidence routes.",
      "Enterprise legal, co-branding, Slack/support channels, staging credentials, and production credentials remain external gates.",
    ],
    externalGates: [
      "Official FAQ answers may expand; rerun website and docs coverage before final submission.",
      "Enterprise contracts, DPA terms, co-branding rights, Slack/support channel, and status dashboards require Swiggy approval.",
      "Staging/production credentials and official form submission remain outside local automation.",
    ],
  };
}
