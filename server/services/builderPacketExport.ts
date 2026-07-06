import type { ServerConfig } from "../config.js";
import type {
  BuilderPacketExport,
  BuilderPacketExportFile,
  BuilderPacketExportReadiness,
  McpServerCoverage,
  MealPlan,
  SubmissionConsole,
  UserProfile,
} from "../../src/domain/types.js";
import { buildLaunchBundle } from "./launchBundle.js";
import { buildSubmissionConsole } from "./submissionConsole.js";
import { buildVisualQaCenter } from "./visualQaCenter.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
  "https://mcp.swiggy.com/builders/docs/operate/rate-limits/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
  "https://mcp.swiggy.com/builders/llms.txt",
];

function readiness(id: string, label: string, status: BuilderPacketExportReadiness["status"], evidence: string, action: string) {
  return { id, label, status, evidence, action };
}

function file(
  id: string,
  label: string,
  path: string,
  format: BuilderPacketExportFile["format"],
  source: string,
  mustAttach = true,
): BuilderPacketExportFile {
  return { id, label, path, format, source, mustAttach };
}

function command(id: string, commandText: string, proves: string) {
  return { id, command: commandText, proves };
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatFields(console: SubmissionConsole) {
  return console.fields
    .map((field) => `- ${field.label}: ${field.suggestedValue} (${formatStatus(field.status)})`)
    .join("\n");
}

function formatAttachments(console: SubmissionConsole) {
  return console.attachments
    .filter((attachment) => attachment.mustAttach)
    .map((attachment) => `- ${attachment.label}: ${attachment.path} (${formatStatus(attachment.status)})`)
    .join("\n");
}

export function buildBuilderPacketMarkdown(packet: BuilderPacketExport) {
  return `# MealPilot Swiggy Builders Access Packet

Generated: ${packet.generatedAt}
Recommended track: ${packet.recommendedTrack}
Packet score: ${packet.score}/100

## Executive Summary

${packet.executiveSummary}

## Official Sources

${packet.officialSources.map((source) => `- ${source}`).join("\n")}

## Form Fields

${packet.copyBlocks.formFields}

## Required Attachments

${packet.copyBlocks.attachments}

## Verification Commands

${packet.commands.map((item) => `- \`${item.command}\`: ${item.proves}`).join("\n")}

## Generated Files

${packet.files.map((item) => `- ${item.label}: ${item.path} (${item.format})`).join("\n")}

## Readiness

${packet.readiness.map((item) => `- ${item.label}: ${formatStatus(item.status)} - ${item.action}`).join("\n")}

## Handoff Email

To: ${packet.copyBlocks.handoffEmail.to}

Subject: ${packet.copyBlocks.handoffEmail.subject}

${packet.copyBlocks.handoffEmail.body}

## External Gates

${packet.externalGates.map((gate) => `- ${gate}`).join("\n")}
`;
}

export function buildBuilderPacketExport(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
}): BuilderPacketExport {
  const submissionConsole = buildSubmissionConsole(options);
  const launchBundle = buildLaunchBundle({ config: options.config, latestPlan: options.latestPlan });
  const visualQa = buildVisualQaCenter();
  const requiredAttachments = submissionConsole.attachments.filter((item) => item.mustAttach);
  const readyAttachments = requiredAttachments.filter((item) => item.status === "ready");
  const operatorItems = [
    ...submissionConsole.fields.filter((item) => item.status === "operator_input"),
    ...submissionConsole.requirements.filter((item) => item.status === "operator_input"),
    ...requiredAttachments.filter((item) => item.status === "operator_input"),
  ];
  const scoreItems = [
    submissionConsole.score,
    launchBundle.score,
    visualQa.score,
    Math.round((readyAttachments.length / requiredAttachments.length) * 100),
    operatorItems.length <= 8 ? 90 : 75,
  ];
  const score = Math.round(scoreItems.reduce((sum, item) => sum + item, 0) / scoreItems.length);

  const files = [
    file(
      "packet_json",
      "Machine-readable access packet",
      "artifacts/builder-packet/mealpilot-swiggy-access-packet.json",
      "json",
      "/api/builder-packet-export",
    ),
    file(
      "packet_markdown",
      "Copy-ready access packet",
      "artifacts/builder-packet/mealpilot-swiggy-access-packet.md",
      "markdown",
      "/api/builder-packet-export.md",
    ),
    file(
      "visual_report",
      "Visual QA screenshot report",
      "artifacts/visual-qa/report.json",
      "json",
      "/api/visual-qa-center",
    ),
    file(
      "production_summary",
      "Production verification summary",
      "artifacts/builder-packet/verification-summary.json",
      "json",
      "scripts/verify-production.mjs",
    ),
  ];

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    recommendedTrack: submissionConsole.recommendedTrack,
    outputDirectory: "artifacts/builder-packet",
    executiveSummary:
      "MealPilot is a Swiggy MCP-ready premium commerce operating system for planning Food, Instamart, and Dineout journeys with confirmation-safe ordering, consented personalization, route optimization, visual proof, logging, tracing, and Swiggy access-review evidence.",
    totals: {
      formFields: submissionConsole.totalFields,
      readyFields: submissionConsole.readyFields,
      requiredAttachments: requiredAttachments.length,
      readyAttachments: readyAttachments.length,
      launchArtifacts: launchBundle.artifacts.length,
      visualTargets: visualQa.totalTargets,
      packetFiles: files.length,
    },
    files,
    readiness: [
      readiness(
        "local_product",
        "Local product proof",
        "ready",
        "Production server, verifier, tests, and Playwright visual capture are executable locally.",
        "Run npm run build, npm run verify:production, and npm run verify:visual.",
      ),
      readiness(
        "swiggy_form_values",
        "Swiggy form values",
        submissionConsole.readyFields >= 6 ? "ready" : "operator_input",
        `${submissionConsole.readyFields}/${submissionConsole.totalFields} prepared fields are copy-ready.`,
        "Copy values from the packet into the official developer access form.",
      ),
      readiness(
        "required_attachments",
        "Required attachments",
        readyAttachments.length >= 7 ? "ready" : "operator_input",
        `${readyAttachments.length}/${requiredAttachments.length} required attachments are ready.`,
        "Attach GitHub, generated packet, visual report, launch bundle, governance, traffic, and audit links.",
      ),
      readiness(
        "demo_video",
        "Demo video URL",
        "operator_input",
        "Swiggy asks builders to share demos; recording still requires an operator-owned URL.",
        "Record the 2-3 minute demo and paste the URL into the form and handoff email.",
      ),
      readiness(
        "staging_credentials",
        "Swiggy staging credentials",
        "external_gate",
        "Credentialed staging depends on Swiggy approval after the access submission.",
        "Run staging certification waves after Swiggy issues credentials.",
      ),
    ],
    commands: [
      command("build", "npm run build", "Compiles TypeScript and Vite production assets."),
      command("unit_tests", "npm test -- --run", "Runs planner, API, UI, and retry safety tests."),
      command("lint", "npm run lint", "Checks frontend, backend, and scripts."),
      command("production_smoke", "npm run verify:production", "Exercises the full local Swiggy proof surface and API contract."),
      command("visual_capture", "MEALPILOT_URL=http://localhost:8787 npm run verify:visual", "Captures 27 desktop/tablet/mobile screenshots and fails on overflow."),
      command("packet_export", "MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet", "Writes the access packet JSON and Markdown artifacts."),
    ],
    copyBlocks: {
      formFields: formatFields(submissionConsole),
      attachments: formatAttachments(submissionConsole),
      handoffEmail:
        launchBundle.handoffEmail ?? submissionConsole.outboundDrafts.find((draft) => draft.to === "builders@swiggy.in")!,
    },
    assertions: [
      "The packet preserves official Swiggy external gates instead of pretending to submit forms, send email, or mint credentials locally.",
      "The packet references Food, Instamart, and Dineout evidence through the Launch Bundle, Submission Console, MCP Tool Lab, and Tool Contract Matrix.",
      "The packet is reproducible from localhost and intentionally writes generated artifacts outside git.",
      "The visual report is connected to the same selector manifest used by the Visual QA Center.",
    ],
    externalGates: [
      "Official Google Form submission must be completed by the operator.",
      "Demo video URL, final security contact, HTTPS redirect URI, static egress/IP, and terms acknowledgement require operator input.",
      "Swiggy review, staging credentials, production credentials, support channel, and co-branding approval require Swiggy action.",
    ],
  };
}
