import type { ServerConfig } from "../config.js";
import type {
  MealPlan,
  SwiggyCtaExecutionTarget,
  SwiggyCtaLiveAuditRow,
  SwiggyCtaLiveAuditStatus,
  SwiggyCtaLiveAuditor,
} from "../../src/domain/types.js";
import { buildSwiggyCtaExecutionCenter } from "./ctaExecutionCenter.js";

const sourceUrl = "https://mcp.swiggy.com/builders/";
const allowedPrefixes = [
  "https://mcp.swiggy.com/builders/",
  "https://www.swiggy.com/privacy-policy",
  "https://www.swiggy.com/terms-and-conditions",
  "https://forms.gle/",
  "https://modelcontextprotocol.io/",
];
const allowedMailto = "mailto:builders@swiggy.in";

export interface CtaLiveProbeResult {
  ok: boolean;
  statusCode?: number;
  durationMs: number;
  redirectLocation?: string;
  error?: string;
}

export type CtaLiveProbeFn = (url: string) => Promise<CtaLiveProbeResult>;

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeUrl(url: string) {
  if (url.startsWith("mailto:")) return url.toLowerCase();
  try {
    const parsed = new URL(url, sourceUrl);
    parsed.hash = parsed.hash.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "/");
    return parsed.toString();
  } catch {
    return url;
  }
}

function isAllowedUrl(normalizedUrl: string) {
  if (normalizedUrl === allowedMailto) return true;
  try {
    const parsed = new URL(normalizedUrl);
    const isBuildersGmailCompose =
      parsed.origin === "https://mail.google.com" &&
      parsed.searchParams.get("to")?.toLowerCase() === "builders@swiggy.in";

    return isBuildersGmailCompose || allowedPrefixes.some((prefix) => normalizedUrl.startsWith(prefix));
  } catch {
    return false;
  }
}

function shouldProbe(target: SwiggyCtaExecutionTarget, normalizedUrl: string) {
  return target.kind === "navigate" || target.kind === "docs" || normalizedUrl.startsWith("https://mcp.swiggy.com/builders/");
}

function manualGateEvidence(target: SwiggyCtaExecutionTarget) {
  if (target.kind === "email") return "Email CTAs open a draft only; MealPilot never sends builders@swiggy.in mail automatically.";
  if (target.kind === "form") return "Form CTAs are operator-submitted in the browser after demo URL and proof links are final.";
  if (target.kind === "legal") return "Legal links are kept as browser review gates because Swiggy legal pages may block server-side fetches.";
  return "Target is intentionally gated for manual browser review.";
}

function statusWeight(status: SwiggyCtaLiveAuditStatus) {
  if (status === "reachable") return 1;
  if (status === "manual_gate") return 0.9;
  if (status === "watch") return 0.7;
  return 0;
}

function statusFromProbe(probe: CtaLiveProbeResult) {
  if (!probe.statusCode) return "blocked" as const;
  if (probe.statusCode >= 200 && probe.statusCode < 400) return "reachable" as const;
  if (probe.statusCode === 403 || probe.statusCode === 405) return "watch" as const;
  return "blocked" as const;
}

async function buildRow(target: SwiggyCtaExecutionTarget, probeTarget: CtaLiveProbeFn): Promise<SwiggyCtaLiveAuditRow> {
  const normalizedUrl = normalizeUrl(target.officialUrl);
  const allowed = isAllowedUrl(normalizedUrl);
  if (!allowed) {
    return {
      id: target.id,
      label: target.label,
      kind: target.kind,
      officialUrl: target.officialUrl,
      normalizedUrl,
      sourcePages: target.sourcePages,
      durationMs: 0,
      evidence: "URL is outside the approved Swiggy Builders, forms, legal, MCP reference, or builders contact origins.",
      nextAction: "Review this target before exposing it in the Launch Center.",
      status: "blocked",
    };
  }

  if (!shouldProbe(target, normalizedUrl)) {
    return {
      id: target.id,
      label: target.label,
      kind: target.kind,
      officialUrl: target.officialUrl,
      normalizedUrl,
      sourcePages: target.sourcePages,
      durationMs: 0,
      evidence: manualGateEvidence(target),
      nextAction: target.nextAction,
      status: "manual_gate",
    };
  }

  const probe = await probeTarget(normalizedUrl);
  const status = probe.ok ? statusFromProbe(probe) : "blocked";
  return {
    id: target.id,
    label: target.label,
    kind: target.kind,
    officialUrl: target.officialUrl,
    normalizedUrl,
    sourcePages: target.sourcePages,
    statusCode: probe.statusCode,
    durationMs: probe.durationMs,
    redirectLocation: probe.redirectLocation,
    evidence:
      status === "reachable"
        ? `Safe live probe reached ${normalizedUrl} with HTTP ${probe.statusCode}.`
        : probe.error ?? `Safe live probe returned HTTP ${probe.statusCode ?? "unknown"}.`,
    nextAction: status === "reachable" ? "Keep this CTA in the verifier and Launch Center visual proof." : target.nextAction,
    status,
  };
}

export async function probeCtaTarget(url: string): Promise<CtaLiveProbeResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { redirect: "manual", signal: controller.signal });
    return {
      ok: response.ok || (response.status >= 300 && response.status < 400),
      statusCode: response.status,
      durationMs: Date.now() - startedAt,
      redirectLocation: response.headers.get("location") ?? undefined,
    };
  } catch (error) {
    return {
      ok: false,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "unknown CTA live probe failure",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildSwiggyCtaLiveAuditor(options: {
  config: ServerConfig;
  latestPlan?: MealPlan;
  probeTarget?: CtaLiveProbeFn;
}): Promise<SwiggyCtaLiveAuditor> {
  const ctaExecution = buildSwiggyCtaExecutionCenter({ config: options.config, latestPlan: options.latestPlan });
  const rows = await Promise.all(ctaExecution.targets.map((target) => buildRow(target, options.probeTarget ?? probeCtaTarget)));
  const unsafe = rows.filter((row) => !isAllowedUrl(row.normalizedUrl)).length;
  const score = Math.round((rows.reduce((sum, row) => sum + statusWeight(row.status), 0) / rows.length) * 100);
  const totals = {
    targets: rows.length,
    probed: rows.filter((row) => row.statusCode !== undefined).length,
    reachable: rows.filter((row) => row.status === "reachable").length,
    manualGates: rows.filter((row) => row.status === "manual_gate").length,
    watch: rows.filter((row) => row.status === "watch").length,
    blocked: rows.filter((row) => row.status === "blocked").length,
    unsafe,
  };

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources: unique([sourceUrl, ...ctaExecution.officialSources]),
    totals,
    rows,
    driftSignals: [
      totals.probed > 0 ? `${totals.reachable}/${totals.probed} safe HTTP CTA targets responded successfully.` : "No HTTP CTA targets were probed.",
      totals.manualGates > 0
        ? `${totals.manualGates} form, email, legal, or approval CTAs remain explicit manual browser gates.`
        : "No manual CTA gates are currently present.",
      totals.unsafe === 0 ? "No CTA target leaves the approved Swiggy Builders origin set." : `${totals.unsafe} CTA targets need origin review.`,
      totals.blocked === 0 ? "No CTA target is blocked in the live auditor." : `${totals.blocked} CTA targets failed live audit.`,
    ],
    operatorRunbook: [
      {
        sequence: 1,
        command: "curl -fsS http://localhost:8787/api/swiggy-cta-live-audit",
        proves: "Safe live CTA probes, manual gates, and approved origins are reviewable as JSON.",
      },
      {
        sequence: 2,
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Release smoke fails when reachable CTA count, manual gates, or safe-origin rules drift.",
      },
      {
        sequence: 3,
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "The Launch Center CTA Live Audit card renders across the screenshot manifest.",
      },
    ],
    assertions: [
      "Live CTA probes are derived only from the canonical CTA Execution Center; user-supplied URLs are never accepted.",
      "Server-side probes are limited to safe read-only GET requests and never submit Swiggy forms, send email, or execute commerce tools.",
      "Legal, form, and mail CTAs remain explicit operator browser gates even when they are visible in the Launch Center.",
      "Every live-audited CTA keeps a source page, official URL, evidence string, and next action.",
    ],
    externalGates: [
      "Google Forms submission, builders@swiggy.in email send, legal review, enterprise terms, and production approval remain manual/operator gates.",
      "Swiggy may block legal pages from server fetches; browser review is the authoritative legal-link check.",
      "Production credentials are required before CTA paths can trigger real Swiggy MCP commerce flows.",
    ],
  };
}
