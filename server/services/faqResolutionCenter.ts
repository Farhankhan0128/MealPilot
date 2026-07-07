import type { ServerConfig } from "../config.js";
import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  SwiggyFaqAnswerResolution,
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

function normalizeQuestion(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensFor(value: string) {
  const stopWords = new Set(["a", "an", "and", "are", "can", "do", "does", "for", "how", "i", "is", "me", "of", "or", "the", "this", "to", "we", "what", "with"]);
  return normalizeQuestion(value)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function phraseBoost(normalizedQuestion: string, candidate: SwiggyFaqResolutionQuestion) {
  let boost = 0;
  if (normalizedQuestion.includes("production") && candidate.id.includes("application")) boost += 7;
  if (normalizedQuestion.includes("access") && candidate.id.includes("application")) boost += 7;
  if (normalizedQuestion.includes("proof") && candidate.id.includes("demo")) boost += 8;
  if (normalizedQuestion.includes("demo") && candidate.id.includes("demo")) boost += 10;
  if (normalizedQuestion.includes("rate") && candidate.id.includes("rate_limits")) boost += 12;
  if (normalizedQuestion.includes("auth") && candidate.id.includes("auth")) boost += 12;
  if (normalizedQuestion.includes("credential") && candidate.id.includes("sandbox")) boost += 8;
  if (normalizedQuestion.includes("white") && candidate.id.includes("white_label")) boost += 12;
  if (normalizedQuestion.includes("enterprise") && candidate.id.includes("enterprise")) boost += 10;
  if (normalizedQuestion.includes("support") && candidate.id.includes("break_something")) boost += 8;
  return boost;
}

function scoreQuestion(normalizedQuestion: string, inputTokens: string[], candidate: SwiggyFaqResolutionQuestion) {
  const corpusTokens = tokensFor(
    `${candidate.id} ${candidate.question} ${candidate.officialSignal} ${candidate.resolvedAnswer} ${candidate.recommendedCta} ${candidate.nextAction} ${candidate.source} ${candidate.audience}`,
  );
  const corpus = new Set(corpusTokens);
  const overlap = inputTokens.filter((token) => corpus.has(token)).length;
  const coverage = inputTokens.length > 0 ? overlap / inputTokens.length : 0;
  const density = corpusTokens.length > 0 ? overlap / corpusTokens.length : 0;
  return Math.min(100, Math.round(coverage * 68 + density * 24 + phraseBoost(normalizedQuestion, candidate)));
}

function confidenceFor(score: number): SwiggyFaqAnswerResolution["confidence"] {
  if (score >= 70) return "high";
  if (score >= 42) return "medium";
  return "low";
}

function answerDecisionFor(status: SwiggyFaqResolutionStatus, score: number): SwiggyFaqAnswerResolution["decision"] {
  if (score < 25 || status !== "ready") return "needs_operator_review";
  return "answered";
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

export function answerSwiggyFaqQuestion(
  options: {
    question: string;
  } & Parameters<typeof buildSwiggyFaqResolutionCenter>[0],
): SwiggyFaqAnswerResolution {
  const center = buildSwiggyFaqResolutionCenter(options);
  const inputQuestion = options.question.trim();
  const normalizedQuestion = normalizeQuestion(inputQuestion);

  if (!normalizedQuestion) {
    return {
      generatedAt: center.generatedAt,
      inputQuestion,
      normalizedQuestion,
      decision: "blocked_empty",
      matchedQuestionId: null,
      confidence: "low",
      matchScore: 0,
      owner: "Operator",
      status: "operator_input",
      audience: "reviewers",
      source: "access_guidelines",
      question: "Ask a Swiggy reviewer question",
      answer: "Enter the reviewer question before generating a FAQ-backed answer. MealPilot will not guess, submit a form, send an email, or claim Swiggy approval without an explicit question and matching proof.",
      recommendedCta: "Enter the exact reviewer question and run the FAQ Answer Console again.",
      nextAction: "Collect the reviewer question, then attach the generated answer packet to the manual access conversation.",
      proofLinks: ["/api/swiggy-faq-resolution-center", "/api/swiggy-faq-policy"],
      relatedPolicyRules: [],
      activationCtas: center.activationCtas.filter((item) => ["answer_packet", "manual_gates"].includes(item.id)),
      supportContact: center.supportContact,
      assertions: [
        "Blank reviewer questions are blocked instead of answered from assumptions.",
        "No external form, email, credential, approval, or Swiggy production action is executed by this answer.",
      ],
      externalGates: center.externalGates,
    };
  }

  const inputTokens = tokensFor(inputQuestion);
  const ranked = center.questions
    .map((candidate) => ({ candidate, score: scoreQuestion(normalizedQuestion, inputTokens, candidate) }))
    .sort((left, right) => right.score - left.score);
  const best = ranked[0]?.candidate ?? center.questions[0];
  const matchScore = ranked[0]?.score ?? 0;
  const relatedPolicyRules = center.policyResolutions
    .map((rule) => {
      const sharedProof = rule.proofLinks.filter((link) => best.proofLinks.includes(link)).length;
      const overlap = tokensFor(`${rule.id} ${rule.category} ${rule.answer}`).filter((token) => inputTokens.includes(token)).length;
      return { rule, score: sharedProof * 20 + overlap * 6 + (rule.status === best.status ? 4 : 0) };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.rule);
  const activationCtas = center.activationCtas
    .filter((item) => {
      const linked = item.proofLinks.some((link) => best.proofLinks.includes(link) || link === "/api/swiggy-faq-resolution-center");
      return linked || ["answer_packet", "proof_routes", "manual_gates"].includes(item.id);
    })
    .slice(0, 3);

  return {
    generatedAt: new Date().toISOString(),
    inputQuestion,
    normalizedQuestion,
    decision: answerDecisionFor(best.status, matchScore),
    matchedQuestionId: best.id,
    confidence: confidenceFor(matchScore),
    matchScore,
    owner: best.owner,
    status: best.status,
    audience: best.audience,
    source: best.source,
    question: best.question,
    answer: `${best.resolvedAnswer} Official signal: ${best.officialSignal}`,
    recommendedCta: best.recommendedCta,
    nextAction: best.nextAction,
    proofLinks: unique(["/api/swiggy-faq-resolution-center", ...best.proofLinks, ...relatedPolicyRules.flatMap((rule) => rule.proofLinks)]).slice(0, 10),
    relatedPolicyRules,
    activationCtas,
    supportContact: center.supportContact,
    assertions: [
      "The answer is selected from the Swiggy FAQ Resolution Center corpus and linked back to proof routes.",
      "No external form, email, credential, approval, or Swiggy production action is executed by this answer.",
      ...center.assertions.slice(0, 2),
    ],
    externalGates: center.externalGates,
  };
}
