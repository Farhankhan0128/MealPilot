import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  CodingAgentGovernance,
  CodingAgentGovernanceSignal,
  CodingAgentGovernanceStatus,
} from "../../src/domain/types.js";

const officialSources = [
  {
    id: "coding_agents",
    label: "Coding Agents",
    url: "https://mcp.swiggy.com/builders/docs/start/coding-agents/",
    useCase: "Repo-level coding-agent instructions and smoke-test behavior.",
  },
  {
    id: "llms_index",
    label: "llms.txt index",
    url: "https://mcp.swiggy.com/builders/llms.txt",
    useCase: "Compact discovery index for current Swiggy Builders Club pages.",
  },
  {
    id: "llms_full",
    label: "llms-full.txt",
    url: "https://mcp.swiggy.com/builders/llms-full.txt",
    useCase: "Full-text fallback for broad audits across the docs corpus.",
  },
  {
    id: "tool_references",
    label: "Reference tool pages",
    url: "https://mcp.swiggy.com/builders/docs/reference/food/",
    useCase: "Food, Instamart, and Dineout tool schema verification.",
  },
  {
    id: "production_rules",
    label: "Ship to production",
    url: "https://mcp.swiggy.com/builders/docs/build/ship-to-production/",
    useCase: "Production access, safety, and rollout gates.",
  },
];

const requiredSignalDefinitions = [
  {
    id: "llms_index",
    label: "Official llms index",
    tokens: ["https://mcp.swiggy.com/builders/llms.txt"],
    evidence: "Agents can discover current docs before making Swiggy changes.",
  },
  {
    id: "llms_full",
    label: "Official full-text docs",
    tokens: ["https://mcp.swiggy.com/builders/llms-full.txt"],
    evidence: "Broad audits have a sanctioned full-text source.",
  },
  {
    id: "markdown_twins",
    label: "Page-specific Markdown twins",
    tokens: ["Append `.md`", "Markdown twin"],
    evidence: "Agents know to fetch exact docs pages instead of relying on stale memory.",
  },
  {
    id: "coding_agents_page",
    label: "Coding-agent setup source",
    tokens: ["https://mcp.swiggy.com/builders/docs/start/coding-agents/"],
    evidence: "The root rule file points future agents at Swiggy's agent instructions.",
  },
  {
    id: "reference_paths",
    label: "Reference tool paths",
    tokens: ["/builders/docs/reference/food/", "/builders/docs/reference/instamart/", "/builders/docs/reference/dineout/"],
    evidence: "Tool schemas are routed to the Food, Instamart, and Dineout references.",
  },
  {
    id: "auth_errors_rates_prod",
    label: "Auth, errors, rate limits, production",
    tokens: ["/docs/start/authenticate/", "/docs/reference/errors/", "/docs/operate/rate-limits/", "/docs/build/ship-to-production/"],
    evidence: "High-risk implementation details are explicitly source-gated.",
  },
  {
    id: "never_invent_tools",
    label: "No invented tool contracts",
    tokens: ["Never invent Swiggy tool names"],
    evidence: "The repo tells agents to verify names, parameters, scopes, retries, limits, and errors.",
  },
  {
    id: "verify_before_coding",
    label: "Verify before implementation",
    tokens: ["Before recommending any Swiggy tool name"],
    evidence: "Claims about Swiggy behavior must be checked against official pages first.",
  },
  {
    id: "food_tool_count_smoke",
    label: "Food 14-tool smoke test",
    tokens: ["Food exposes 14 tools", "Instamart exposes 13 tools", "Dineout exposes 8 tools"],
    evidence: "The current 35-tool reference split is encoded for quick regression checks.",
  },
  {
    id: "commercial_confirmation",
    label: "Commercial confirmation gates",
    tokens: ["place_food_order", "checkout", "book_table"],
    evidence: "Commercial Swiggy tools stay behind explicit user confirmation.",
  },
  {
    id: "no_sensitive_logs",
    label: "Sensitive data redaction",
    tokens: ["Do not log tokens", "raw Swiggy payloads"],
    evidence: "Agents preserve MealPilot's token, PII, address, payment, and raw-payload redaction boundary.",
  },
];

function signalStatus(content: string, tokens: string[]): CodingAgentGovernanceStatus {
  if (!content) return "missing";
  return tokens.every((token) => content.includes(token)) ? "ready" : "needs_update";
}

function requiredSignals(content: string): CodingAgentGovernanceSignal[] {
  return requiredSignalDefinitions.map((definition) => ({
    id: definition.id,
    label: definition.label,
    status: signalStatus(content, definition.tokens),
    evidence: definition.evidence,
  }));
}

function ruleFileContent() {
  const rulePath = path.join(process.cwd(), "AGENTS.md");
  if (!fs.existsSync(rulePath)) {
    return { content: "", path: rulePath };
  }

  return { content: fs.readFileSync(rulePath, "utf8"), path: rulePath };
}

export function buildCodingAgentGovernance(): CodingAgentGovernance {
  const { content, path: absolutePath } = ruleFileContent();
  const signals = requiredSignals(content);
  const missingSignals = signals.filter((signal) => signal.status !== "ready").map((signal) => signal.id);
  const matchedSignals = signals.length - missingSignals.length;
  const ruleFileStatus: CodingAgentGovernanceStatus = !content
    ? "missing"
    : missingSignals.length === 0
      ? "ready"
      : "needs_update";
  const score = Math.round((matchedSignals / signals.length) * 100);
  const sha256 = content ? crypto.createHash("sha256").update(content).digest("hex") : "";

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    ruleFile: {
      path: "AGENTS.md",
      absolutePath,
      status: ruleFileStatus,
      matchedSignals,
      totalSignals: signals.length,
      missingSignals,
      sha256,
    },
    requiredSignals: signals,
    smokeTests: [
      {
        id: "food_tool_count",
        label: "Food tool-count check",
        command: "curl -s https://mcp.swiggy.com/builders/llms.txt",
        expected: "Food reference exposes 14 tools; Instamart exposes 13; Dineout exposes 8.",
        status: signals.some((signal) => signal.id === "food_tool_count_smoke" && signal.status === "ready")
          ? "ready"
          : "needs_update",
      },
      {
        id: "production_governance",
        label: "Production verifier check",
        command: "npm run verify:production",
        expected: "Summary includes codingAgentGovernanceScore and AGENTS.md readiness.",
        status: "ready",
      },
      {
        id: "local_endpoint",
        label: "Local endpoint readback",
        command: "curl -s http://localhost:8787/api/coding-agent-governance",
        expected: "JSON reports ruleFile.status ready and score at least 95.",
        status: ruleFileStatus,
      },
    ],
    guardrails: [
      "Fetch official Swiggy docs before naming tools, parameters, error codes, rate limits, auth behavior, or production behavior.",
      "Never invent Swiggy MCP tool names, scopes, parameters, retry semantics, rate limits, or error codes.",
      "Require explicit confirmation for place_food_order, checkout, and book_table.",
      "Never log bearer tokens, auth codes, phone, email, payment data, exact addresses, raw coordinates, or raw Swiggy payloads.",
      "Keep local mocks clearly labeled until Swiggy issues staging or production credentials.",
    ],
    commands: [
      "curl -s https://mcp.swiggy.com/builders/llms.txt",
      "curl -s https://mcp.swiggy.com/builders/docs/start/coding-agents.md",
      "npm run verify:production",
      "curl -s http://localhost:8787/api/coding-agent-governance",
    ],
    assertions: [
      "MealPilot ships a root AGENTS.md instead of only generating copy-ready snippets.",
      "The governance endpoint reads the actual AGENTS.md file and scores required Swiggy source signals.",
      "The official coding-agent docs, llms index, llms-full file, Markdown twins, and tool reference paths are represented.",
      "Commercial actions, credential gates, and redaction boundaries remain explicit for future coding agents.",
    ],
    externalGates: [
      "Live Swiggy staging credentials are still issued by Swiggy after access approval.",
      "Agents must refresh official docs when Swiggy updates tool schemas, auth, errors, rate limits, or production rules.",
    ],
  };
}
