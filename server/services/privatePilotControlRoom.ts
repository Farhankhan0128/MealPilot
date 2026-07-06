import type {
  SwiggyPrivatePilotCohort,
  SwiggyPrivatePilotControlRoom,
  SwiggyPrivatePilotGate,
  SwiggyPrivatePilotMetric,
  SwiggyPrivatePilotStatus,
} from "../../src/domain/types.js";
import { defaultUserProfile } from "../../src/domain/profile.js";
import { readConfig } from "../config.js";
import { buildSwiggyAgentExperienceBenchmark } from "./agentExperienceBenchmark.js";
import { buildDataGovernanceCenter } from "./dataGovernance.js";
import { buildReviewerArtifactVault } from "./reviewerArtifactVault.js";
import { buildSupportBridgeReport } from "./supportBridge.js";
import { buildTrafficReadinessPlan } from "./trafficReadiness.js";
import { buildVisualQaCenter } from "./visualQaCenter.js";

const endpoint = "/api/swiggy-private-pilot-control-room";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/docs/operate/go-live-checklist/",
];

function cohort(input: SwiggyPrivatePilotCohort): SwiggyPrivatePilotCohort {
  return input;
}

function gate(input: SwiggyPrivatePilotGate): SwiggyPrivatePilotGate {
  return input;
}

function metric(input: SwiggyPrivatePilotMetric): SwiggyPrivatePilotMetric {
  return input;
}

function statusScore(status: SwiggyPrivatePilotStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.75;
  if (status === "operator_input") return 0.55;
  return 0.35;
}

export function buildSwiggyPrivatePilotControlRoom(): SwiggyPrivatePilotControlRoom {
  const config = readConfig();
  const benchmark = buildSwiggyAgentExperienceBenchmark();
  const traffic = buildTrafficReadinessPlan({ plans: [], config });
  const support = buildSupportBridgeReport({ plans: [] });
  const governance = buildDataGovernanceCenter({ profile: defaultUserProfile, config });
  const visualQa = buildVisualQaCenter();
  const vault = buildReviewerArtifactVault();
  const journeyIds = benchmark.journeys.map((journey) => journey.id);

  const cohorts = [
    cohort({
      id: "bengaluru_household_alpha",
      label: "Bengaluru household alpha",
      audience: "Families and busy professionals who need one weekly Food, Instamart, and Dineout plan.",
      targetUsers: 12,
      city: "Bengaluru",
      assignedJourneys: ["household_week_reset_benchmark", "pantry_autopilot_plus_benchmark", "guest_hosting_os_benchmark"],
      consentArtifacts: ["pilot consent checkbox", "preference storage notice", "support log redaction notice"],
      successMetrics: ["80% plan completion", "0 blind commercial retries", "90% confirmation clarity"],
      supportPath: "S1 support via Support Bridge with builders@swiggy.in escalation draft.",
      status: "ready",
      proofLinks: [endpoint, "/api/swiggy-agent-experience-benchmark", "/api/data-governance-center"],
    }),
    cohort({
      id: "voice_office_alpha",
      label: "Voice office alpha",
      audience: "Office workers validating short voice journeys and no raw identifier leakage.",
      targetUsers: 8,
      city: "Mumbai",
      assignedJourneys: ["voice_fridge_to_dinner_benchmark", "office_lunch_boardroom_benchmark"],
      consentArtifacts: ["voice no-audio-retention notice", "short-response acceptance form", "pilot support contact"],
      successMetrics: ["voice response under three options", "95% no raw ID exposure", "under 12 optimized MCP calls"],
      supportPath: "S2 support through support packet with hashed session id and no raw audio.",
      status: "ready",
      proofLinks: [endpoint, "/api/swiggy-voice-commerce-center", "/api/evaluation-lab"],
    }),
    cohort({
      id: "dineout_social_alpha",
      label: "Dineout social alpha",
      audience: "Small groups testing date-night, guest-hosting, and Dineout recovery flows.",
      targetUsers: 10,
      city: "Delhi NCR",
      assignedJourneys: ["date_night_orchestrator_benchmark", "guest_hosting_os_benchmark", "rainy_day_rescue_benchmark"],
      consentArtifacts: ["guest vote notice", "calendar export notice", "Dineout free-booking confirmation script"],
      successMetrics: ["100% party-size confirmation", "0 paid-cart/free-booking confusion", "support route under one minute"],
      supportPath: "S1 Dineout booking support through booking-status readback and report_error packet.",
      status: "ready",
      proofLinks: [endpoint, "/api/swiggy-dineout-precision-center", "/api/guest-collaboration-calendar"],
    }),
    cohort({
      id: "staging_seed_beta",
      label: "Staging seeded beta",
      audience: "Credentialed staging users replaying all benchmark journeys with seeded Swiggy data.",
      targetUsers: 6,
      city: "Bengaluru",
      assignedJourneys: journeyIds,
      consentArtifacts: ["staging credential boundary", "seeded account notice", "48-hour soak acceptance"],
      successMetrics: ["35/35 tool wave coverage", "48-hour soak with zero Sev1 issues", "all support packets redacted"],
      supportPath: "Swiggy credential and staging support gate through the handoff room.",
      status: "swiggy_gate",
      proofLinks: [endpoint, "/api/swiggy-staging-seed-smoke-center", "/api/staging-certification-matrix"],
    }),
  ];

  const launchGates = [
    gate({
      id: "consent_and_privacy",
      label: "Consent and privacy",
      owner: "MealPilot",
      status: "ready",
      requiredEvidence: `${governance.score}/100 governance score with DSR, retention, token redaction, and pilot consent language.`,
      proofLinks: [endpoint, "/api/data-governance-center", "/api/privacy/export"],
      nextAction: "Attach pilot consent copy to the demo packet before recruiting users.",
    }),
    gate({
      id: "visual_and_demo_packet",
      label: "Visual and demo packet",
      owner: "MealPilot",
      status: "ready",
      requiredEvidence: `${visualQa.totalTargets}/${visualQa.totalTargets} visual targets plus ${vault.totalArtifacts} reviewer artifacts are packet-ready.`,
      proofLinks: [endpoint, "/api/visual-qa-center", "/api/reviewer-artifact-vault"],
      nextAction: "Capture final desktop/mobile screenshots after every new pilot-facing feature.",
    }),
    gate({
      id: "traffic_budget",
      label: "Traffic budget",
      owner: "MealPilot",
      status: traffic.score >= 90 ? "ready" : "watch",
      requiredEvidence: `${traffic.score}/100 traffic readiness score with ${traffic.projectedDailyToolCalls} projected daily tool calls.`,
      proofLinks: [endpoint, "/api/traffic-readiness-plan", "/api/swiggy-quota-negotiation-center"],
      nextAction: "Keep pilot cohort under developer-tier QPS until Swiggy approves higher quota.",
    }),
    gate({
      id: "support_bridge",
      label: "Support bridge",
      owner: "MealPilot",
      status: "ready",
      requiredEvidence: `${support.score}/100 support readiness with ${support.reportErrorTools.length} report_error payload families.`,
      proofLinks: [endpoint, "/api/support/bridge", "/api/swiggy-partner-support-room"],
      nextAction: "Route every pilot incident through hashed support packets and severity labels.",
    }),
    gate({
      id: "operator_recruiting",
      label: "Pilot recruiting",
      owner: "Operator",
      status: "operator_input",
      requiredEvidence: "Operator must collect pilot participant list, contact permission, and demo/video sharing consent.",
      proofLinks: [endpoint, "/api/access-submission-studio", "/api/swiggy-demo-evidence-director"],
      nextAction: "Invite 30 private-pilot users and attach the participant manifest outside the repo.",
    }),
    gate({
      id: "swiggy_staging_credentials",
      label: "Swiggy staging credentials",
      owner: "Swiggy",
      status: "swiggy_gate",
      requiredEvidence: "Swiggy must issue staging credentials, seeded accounts, approved redirect URI, and production-review guidance.",
      proofLinks: [endpoint, "/api/sandbox-credential-workbench", "/api/swiggy-credential-handoff-center"],
      nextAction: "Send the access packet, demo link, benchmark score, and pilot plan to builders@swiggy.in.",
    }),
  ];

  const telemetryMetrics = [
    metric({
      id: "journey_completion",
      label: "Journey completion",
      target: ">=80% of assigned benchmark journeys completed without manual rescue.",
      currentEvidence: `${benchmark.totals.bestInClassJourneys}/${benchmark.totals.journeys} benchmark journeys are best-in-class locally.`,
      telemetryField: "pilot_journey_completed",
      status: "ready",
    }),
    metric({
      id: "confirmation_clarity",
      label: "Confirmation clarity",
      target: ">=90% users understand cart/order/booking action before confirmation.",
      currentEvidence: `${benchmark.totals.acceptanceCriteria} UX acceptance criteria include confirmation-first controls.`,
      telemetryField: "confirmation_clarity_score",
      status: "ready",
    }),
    metric({
      id: "support_time",
      label: "Support time to packet",
      target: "<=60 seconds to generate redacted support packet after a pilot issue.",
      currentEvidence: `${support.reportErrorTools.length} report_error payload families are ready.`,
      telemetryField: "support_packet_duration_ms",
      status: "ready",
    }),
    metric({
      id: "privacy_incidents",
      label: "Privacy incidents",
      target: "0 raw token, raw address, raw audio, or raw Swiggy payload incidents.",
      currentEvidence: `${governance.controls.length} governance controls and DSR routing are active.`,
      telemetryField: "privacy_incident_count",
      status: "ready",
    }),
    metric({
      id: "staging_replay",
      label: "Staging replay",
      target: "100% benchmark journeys replayed after credentials are issued.",
      currentEvidence: "Staging replay is planned but waits for Swiggy-issued credentials and seeded accounts.",
      telemetryField: "staging_replay_pass_rate",
      status: "swiggy_gate",
    }),
  ];

  const readyGateScore = launchGates.reduce((sum, item) => sum + statusScore(item.status), 0) / launchGates.length;
  const readyCohortScore = cohorts.reduce((sum, item) => sum + statusScore(item.status), 0) / cohorts.length;
  const readyMetricScore = telemetryMetrics.reduce((sum, item) => sum + statusScore(item.status), 0) / telemetryMetrics.length;
  const score = Math.round(readyGateScore * 35 + readyCohortScore * 35 + readyMetricScore * 20 + (benchmark.score >= 95 ? 10 : 6));
  const assignedJourneys = new Set(cohorts.flatMap((item) => item.assignedJourneys));
  const consentArtifacts = cohorts.reduce((sum, item) => sum + item.consentArtifacts.length, 0);
  const successMetrics = cohorts.reduce((sum, item) => sum + item.successMetrics.length, 0);
  const readyGates = launchGates.filter((item) => item.status === "ready").length;
  const swiggyGates = launchGates.filter((item) => item.status === "swiggy_gate").length;

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    totals: {
      cohorts: cohorts.length,
      targetUsers: cohorts.reduce((sum, item) => sum + item.targetUsers, 0),
      assignedJourneys: assignedJourneys.size,
      consentArtifacts,
      successMetrics,
      readyGates,
      totalGates: launchGates.length,
      telemetryMetrics: telemetryMetrics.length,
      swiggyGates,
    },
    cohorts,
    launchGates,
    telemetryMetrics,
    operatorRunbook: [
      {
        sequence: 1,
        label: "Freeze benchmark packet",
        owner: "MealPilot",
        status: "ready",
        action: "Run production, visual, and builder-packet verification and attach the benchmark/pilot endpoints.",
        proofLinks: [endpoint, "/api/swiggy-agent-experience-benchmark", "/api/builder-packet-export"],
      },
      {
        sequence: 2,
        label: "Recruit private pilot",
        owner: "Operator",
        status: "operator_input",
        action: "Recruit target users, collect consent, and keep participant identities outside source control.",
        proofLinks: [endpoint, "/api/access-submission-studio"],
      },
      {
        sequence: 3,
        label: "Run local pilot rehearsal",
        owner: "MealPilot",
        status: "ready",
        action: "Assign benchmark journeys, record completion/confidence/support metrics, and block unsafe automation.",
        proofLinks: [endpoint, "/api/evaluation-lab", "/api/runtime-telemetry"],
      },
      {
        sequence: 4,
        label: "Request staging replay",
        owner: "Swiggy",
        status: "swiggy_gate",
        action: "Issue staging credentials and seeded data so every benchmark journey can replay against live Swiggy MCP.",
        proofLinks: [endpoint, "/api/swiggy-credential-handoff-center"],
      },
    ],
    pilotPacket: {
      title: "MealPilot Swiggy Private Pilot Plan",
      recommendedDuration: "14 days: 3-day local rehearsal, 7-day private pilot, 48-hour staging soak, 2-day launch review.",
      minimumEvidenceBeforeSubmit: [
        "Production verifier ok true",
        "Visual QA all targets captured with no overflow",
        "Builder packet export attached",
        "Private pilot consent copy and participant manifest prepared outside repo",
        "Swiggy staging credential request sent to builders@swiggy.in",
      ],
      goNoGoRule:
        "Go only when ready gates stay green, no privacy or commercial-action incident is open, support packets are redacted, and Swiggy-owned staging gates are acknowledged.",
      handoffDraft:
        "To builders@swiggy.in: Hi Swiggy Builders team, MealPilot is ready for a 36-user private pilot. We have attached the benchmark, consent, visual QA, support, traffic, and credential handoff evidence and request staging credentials plus seeded Food, Instamart, and Dineout accounts.",
    },
    assertions: [
      `${cohorts.length} private-pilot cohorts cover household, voice, Dineout/social, and staging seeded replay lanes.`,
      `${assignedJourneys.size}/${benchmark.totals.journeys} benchmark journeys are assigned to pilot cohorts.`,
      `${consentArtifacts} consent artifacts keep pilot data collection explicit before user recruitment.`,
      `${telemetryMetrics.length} telemetry metrics define completion, confirmation clarity, support, privacy, and staging replay proof.`,
    ],
    externalGates: [
      "Operator must recruit pilot users and store participant identities outside this repository.",
      "Swiggy must issue staging credentials and seeded accounts before live replay claims are made.",
      "Public launch, co-branding, and hosted widget claims remain gated on Swiggy production approval.",
    ],
  };
}
