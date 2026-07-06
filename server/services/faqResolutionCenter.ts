import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  SwiggyFaqPolicyStatus,
  SwiggyFaqResolutionCenter,
  SwiggyFaqResolutionCta,
  SwiggyFaqResolutionOwner,
  SwiggyFaqResolutionQuestion,
  SwiggyFaqResolutionStatus,
  UserProfile,
} from "../../src/domain/types.js";
import { buildSwiggyAccessEvidenceMatrix } from "./accessEvidenceMatrix.js";
import { buildSwiggyCtaExecutionCenter } from "./ctaExecutionCenter.js";
import { buildSwiggyFaqPolicyCenter } from "./faqPolicyCenter.js";

function statusWeight(status: SwiggyFaqResolutionStatus) {
  if (status === "ready") return 1;
  if (status === "operator_input") return 0.78;
  return 0.58;
}

function normalizeStatus(status: SwiggyFaqPolicyStatus): SwiggyFaqResolutionStatus {
  if (status === "ready") return "ready";
  if (status === "documented") return "operator_input";
  return "swiggy_gate";
}

function ownerFor(status: SwiggyFaqResolutionStatus): SwiggyFaqResolutionOwner {
  if (status === "swiggy_gate") return "Swiggy";
  if (status === "operator_input") return "Operator";
  return "MealPilot";
}

function recommendedCta(questionId: string, status: SwiggyFaqResolutionStatus) {
  if (questionId.includes("demo")) return "Open Demo Evidence Director and attach the final video URL.";
  if (questionId.includes("rate_limits")) return "Open Quota Negotiation and send the capacity packet before launch traffic.";
  if (questionId.includes("auth")) return "Open Credential Handoff and OAuth Status before staging.";
  if (questionId.includes("sandbox")) return "Open Staging Credential Drill and Sandbox Credential Workbench.";
  if (questionId.includes("enterprise")) return "Open Enterprise Platform Center and keep contract gates explicit.";
  if (questionId.includes("white_label")) return "Open Brand Compliance and request written co-branding approval.";
  if (status === "operator_input") return "Prepare the operator-owned copy or attachment before access submission.";
  if (status === "swiggy_gate") return "Ask Swiggy for approval, credentials, terms, or support channel access.";
  return "Keep the linked proof route green in production verification.";
}

function nextActionFor(status: SwiggyFaqResolutionStatus) {
  if (status === "ready") return "Use this answer in the demo or access packet with the linked proof route.";
  if (status === "operator_input") return "Fill the operator-owned value, demo URL, or email before final submission.";
  return "Keep this answer honest until Swiggy grants the external approval or credential.";
}

function cta(input: SwiggyFaqResolutionCta): SwiggyFaqResolutionCta {
  return input;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function buildSwiggyFaqResolutionCenter(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
}): SwiggyFaqResolutionCenter {
  const faqPolicy = buildSwiggyFaqPolicyCenter();
  const ctaExecution = buildSwiggyCtaExecutionCenter({ config: options.config, latestPlan: options.latestPlan });
  const accessEvidence = buildSwiggyAccessEvidenceMatrix(options);

  const questions: SwiggyFaqResolutionQuestion[] = faqPolicy.faqItems.map((item) => {
    const status = normalizeStatus(item.status);
    return {
      id: item.id,
      question: item.question,
      audience: item.audience,
      source: item.source,
      owner: ownerFor(status),
      status,
      officialSignal: item.officialSignal,
      resolvedAnswer: item.mealPilotAnswer,
      proofLinks: item.evidenceLinks,
      recommendedCta: recommendedCta(item.id, status),
      nextAction: nextActionFor(status),
    };
  });

  const policyResolutions = faqPolicy.policyRules.map((rule) => {
    const status = normalizeStatus(rule.status);
    return {
      id: rule.id,
      category: rule.category,
      status,
      owner: ownerFor(status),
      answer: `${rule.officialRule} MealPilot control: ${rule.mealPilotControl}`,
      proofLinks: rule.evidenceLinks,
    };
  });

  const activationCtas = [
    cta({
      id: "answer_packet",
      label: "Answer packet",
      status: "ready",
      owner: "MealPilot",
      action: "Open the FAQ Resolution Center before a reviewer call or access submission.",
      proofLinks: ["/api/swiggy-faq-resolution-center", "/api/swiggy-faq-policy"],
    }),
    cta({
      id: "official_faq",
      label: "Official FAQ",
      status: "ready",
      owner: "MealPilot",
      action: "Open the public Builders FAQ and reconcile it with MealPilot answers.",
      proofLinks: ["https://mcp.swiggy.com/builders/#faq", "/api/swiggy-website-atlas"],
    }),
    cta({
      id: "access_form",
      label: "Access form",
      status: accessEvidence.totals.operatorRows > 0 ? "operator_input" : "ready",
      owner: "Operator",
      action: "Copy FAQ-backed proof into the official access form and stop before manual submit.",
      proofLinks: ["/api/swiggy-access-evidence-matrix", "/api/access-submission-studio"],
    }),
    cta({
      id: "proof_routes",
      label: "Proof routes",
      status: "ready",
      owner: "MealPilot",
      action: "Open local proof routes for every FAQ answer during review.",
      proofLinks: unique(questions.flatMap((item) => item.proofLinks)).slice(0, 8),
    }),
    cta({
      id: "manual_gates",
      label: "Manual and Swiggy gates",
      status: questions.some((item) => item.status !== "ready") ? "operator_input" : "ready",
      owner: "Joint",
      action: "Call out demo URL, form submit, credentials, co-branding, and enterprise terms as non-local actions.",
      proofLinks: ["/api/swiggy-benefits-activation-center", "/api/swiggy-credential-handoff-center"],
    }),
  ];

  const allStatuses = [...questions.map((item) => item.status), ...policyResolutions.map((item) => item.status), ...activationCtas.map((item) => item.status)];
  const proofLinks = unique([
    ...questions.flatMap((item) => item.proofLinks),
    ...policyResolutions.flatMap((item) => item.proofLinks),
    ...activationCtas.flatMap((item) => item.proofLinks),
    ...ctaExecution.targets.slice(0, 8).flatMap((target) => target.proofLinks),
  ]);
  const score = Math.round((allStatuses.reduce((sum, status) => sum + statusWeight(status), 0) / allStatuses.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources: faqPolicy.officialSources,
    totals: {
      questions: questions.length,
      ready: questions.filter((item) => item.status === "ready").length,
      operatorInputs: questions.filter((item) => item.status === "operator_input").length,
      swiggyGates: questions.filter((item) => item.status === "swiggy_gate").length,
      policyRules: policyResolutions.length,
      activationCtas: activationCtas.length,
      proofLinks: proofLinks.length,
    },
    questions,
    policyResolutions,
    activationCtas,
    reviewerScript: [
      {
        sequence: 1,
        label: "Program fit",
        say: "MealPilot is a runnable three-server Swiggy MCP product, not a concept deck.",
        proofLinks: ["/api/mcp/catalog", "/api/swiggy-journey-compiler"],
      },
      {
        sequence: 2,
        label: "Application and demo",
        say: "The official access flow stays operator-owned; MealPilot prepares fields, demo scenes, and proof attachments.",
        proofLinks: ["/api/submission-console", "/api/swiggy-demo-evidence-director"],
      },
      {
        sequence: 3,
        label: "Auth and sandbox",
        say: "Local proof runs without credentials; staging and production remain gated on Swiggy-issued credentials.",
        proofLinks: ["/api/swiggy-credential-handoff-center", "/api/swiggy-staging-credential-drill"],
      },
      {
        sequence: 4,
        label: "Limits and support",
        say: "Quota, Retry-After posture, report_error, support emails, and incidents are packaged without automatic external submission.",
        proofLinks: ["/api/swiggy-quota-negotiation-center", "/api/swiggy-partner-support-room"],
      },
      {
        sequence: 5,
        label: "Compliance and brand",
        say: "Brand, white-label, data, legal, and enterprise terms remain explicit Swiggy approval gates.",
        proofLinks: ["/api/brand-compliance-kit", "/api/data-governance-center", "/api/enterprise-platform-center"],
      },
    ],
    supportContact: {
      email: faqPolicy.supportContact.email,
      evidenceLinks: faqPolicy.supportContact.escalationEvidence,
    },
    assertions: [
      "Every public FAQ answer is converted into a reviewer-ready response with proof links and a next action.",
      "Documented, operator-owned, and Swiggy-owned answers remain visibly distinct instead of being overclaimed.",
      "The center composes FAQ Policy, CTA Execution, and Access Evidence Matrix so questions, actions, and proof stay synchronized.",
      "External forms, email sends, credentials, co-branding, and enterprise terms are never auto-submitted from local tests.",
    ],
    externalGates: [
      "Operator must record the final demo, fill access fields, submit official forms, and send emails manually.",
      "Swiggy must issue staging or production credentials, approve co-branding, and grant enterprise terms or partner support channels.",
      "Legal, privacy, white-label, and enterprise contract answers require final Swiggy/legal review before public claims.",
    ],
  };
}
