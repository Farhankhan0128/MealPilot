import type {
  AccessSubmissionHandoffState,
  McpServerCoverage,
  MealPlan,
  UserProfile,
  SwiggySourceFreezeDiffMode,
  SwiggySourceFreezeBrowserReceipt,
  SwiggySourceFreezeDiffReport,
  SwiggySourceFreezeDiffRow,
  SwiggySourceFreezeDiffStatus,
  SwiggyBuildersAccessPolicyWitness,
  SwiggyBuildersCredentialSandboxWitness,
} from "../../src/domain/types.js";
import type { ServerConfig } from "../config.js";
import {
  buildSwiggyBuildersPageMeshAuditor,
  type BuildersPageFetchFn,
} from "./buildersPageMeshAuditor.js";
import { buildBuilderPacketExport } from "./builderPacketExport.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";
import { buildLaunchBundle } from "./launchBundle.js";
import { buildSwiggySourceIntelligence } from "./sourceIntelligence.js";
import { buildSwiggyUpstreamWatch } from "./upstreamWatch.js";
import { buildSwiggyWebsiteAtlas } from "./websiteAtlas.js";
import { buildSwiggyAccessEvidenceMatrix } from "./accessEvidenceMatrix.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/developers/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/docs/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/llms.txt",
  "https://mcp.swiggy.com/builders/llms-full.txt",
];

function statusScore(status: SwiggySourceFreezeDiffStatus) {
  if (status === "matched") return 1;
  if (status === "watch") return 0.78;
  return 0.4;
}

function row(
  id: string,
  label: string,
  source: string,
  liveValue: string | number,
  localValue: string | number,
  status: SwiggySourceFreezeDiffStatus,
  evidenceLinks: string[],
  nextAction: string,
): SwiggySourceFreezeDiffRow {
  return {
    id,
    label,
    source,
    liveValue: String(liveValue),
    localValue: String(localValue),
    status,
    evidenceLinks,
    nextAction,
  };
}

function scoreFor(rows: SwiggySourceFreezeDiffRow[]) {
  const weighted = rows.reduce((sum, item) => sum + statusScore(item.status), 0);
  return Math.round((weighted / rows.length) * 100);
}

function freezeId(mode: SwiggySourceFreezeDiffMode) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  return `swiggy-source-freeze-${mode}-${stamp}`;
}

export interface SourceFreezeAccessPolicyRollup {
  score: number;
  decision: string;
  rows: number;
  readyRequiredApplicationFields: number;
  requiredApplicationFields: number;
  applicationFields: number;
  policyRules: number;
  readyPolicyRules: number;
  requiredAttachments: number;
  browserRunbookSteps: number;
  proofLinks: number;
  reviewGates: number;
  operatorGates: number;
  swiggyGates: number;
}

export interface SourceFreezeCredentialSandboxRollup {
  score: number;
  decision: string;
  rows: number;
  stagingDrills: number;
  certificationTools: number;
  redactionRules: number;
  proofLinks: number;
  operatorGates: number;
  swiggyGates: number;
}

export function accessPolicyRollupFromWitness(witness: SwiggyBuildersAccessPolicyWitness): SourceFreezeAccessPolicyRollup {
  return {
    score: witness.score,
    decision: witness.decision,
    rows: witness.totals.rows,
    readyRequiredApplicationFields: witness.totals.readyRequiredApplicationFields,
    requiredApplicationFields: witness.totals.requiredApplicationFields,
    applicationFields: witness.totals.applicationFields,
    policyRules: witness.totals.policyRules,
    readyPolicyRules: witness.totals.readyPolicyRules,
    requiredAttachments: witness.totals.requiredAttachments,
    browserRunbookSteps: witness.totals.browserRunbookSteps,
    proofLinks: witness.totals.proofLinks,
    reviewGates: witness.totals.reviewGates,
    operatorGates: witness.totals.operatorGates,
    swiggyGates: witness.totals.swiggyGates,
  };
}

export function credentialSandboxRollupFromWitness(
  witness: SwiggyBuildersCredentialSandboxWitness,
): SourceFreezeCredentialSandboxRollup {
  return {
    score: witness.score,
    decision: witness.decision,
    rows: witness.totals.rows,
    stagingDrills: witness.totals.stagingDrills,
    certificationTools: witness.totals.certificationTools,
    redactionRules: witness.totals.redactionRules,
    proofLinks: witness.totals.proofLinks,
    operatorGates: witness.totals.operatorGates,
    swiggyGates: witness.totals.swiggyGates,
  };
}

function missingAccessPolicyRollup(): SourceFreezeAccessPolicyRollup {
  return {
    score: 0,
    decision: "not_composed",
    rows: 0,
    readyRequiredApplicationFields: 0,
    requiredApplicationFields: 0,
    applicationFields: 0,
    policyRules: 0,
    readyPolicyRules: 0,
    requiredAttachments: 0,
    browserRunbookSteps: 0,
    proofLinks: 0,
    reviewGates: 0,
    operatorGates: 0,
    swiggyGates: 0,
  };
}

function missingCredentialSandboxRollup(): SourceFreezeCredentialSandboxRollup {
  return {
    score: 0,
    decision: "not_composed",
    rows: 0,
    stagingDrills: 0,
    certificationTools: 0,
    redactionRules: 0,
    proofLinks: 0,
    operatorGates: 0,
    swiggyGates: 0,
  };
}

export async function buildSwiggySourceFreezeDiff(options: {
  config: ServerConfig;
  profile: UserProfile;
  coverage: McpServerCoverage[];
  latestPlan?: MealPlan;
  handoffState?: AccessSubmissionHandoffState;
  accessPolicyWitness?: SourceFreezeAccessPolicyRollup;
  credentialSandboxWitness?: SourceFreezeCredentialSandboxRollup;
  mode?: SwiggySourceFreezeDiffMode;
  includeLivePageMesh?: boolean;
  includeLlmsManifest?: boolean;
  includeAccessPacket?: boolean;
  includeBrowserRebrowse?: boolean;
  browserRebrowseReceipt?: SwiggySourceFreezeBrowserReceipt;
  fetchPage?: BuildersPageFetchFn;
}): Promise<SwiggySourceFreezeDiffReport> {
  const mode = options.mode ?? "pre_access_submission";
  const includeLivePageMesh = options.includeLivePageMesh ?? true;
  const includeLlmsManifest = options.includeLlmsManifest ?? true;
  const includeAccessPacket = options.includeAccessPacket ?? true;
  const includeBrowserRebrowse = options.includeBrowserRebrowse ?? mode !== "post_source_change";
  const browserRebrowseReceipt = includeBrowserRebrowse ? options.browserRebrowseReceipt : undefined;
  const atlas = buildSwiggyWebsiteAtlas();
  const docsCoverage = buildSwiggyDocsCoverage();
  const sourceIntelligence = buildSwiggySourceIntelligence();
  const upstreamWatch = buildSwiggyUpstreamWatch();
  const accessEvidence = buildSwiggyAccessEvidenceMatrix(options);
  const accessPolicy = options.accessPolicyWitness ?? missingAccessPolicyRollup();
  const credentialSandbox = options.credentialSandboxWitness ?? missingCredentialSandboxRollup();
  const packet = buildBuilderPacketExport(options);
  const launchBundle = buildLaunchBundle({ config: options.config, latestPlan: options.latestPlan });
  const pageMesh = includeLivePageMesh
    ? await buildSwiggyBuildersPageMeshAuditor(options.fetchPage)
    : undefined;
  const footerLinks = atlas.footerGroups.reduce((sum, group) => sum + group.links.length, 0);
  const pageMeshPages = pageMesh?.totals.pages ?? atlas.pages.filter((page) => page.pageType !== "external").length;
  const fetchedPages = pageMesh?.totals.fetchedPages ?? 0;
  const verifiedPages = pageMesh?.totals.integrityVerifiedPages ?? 0;
  const atlasFallbackPages = pageMesh?.totals.atlasFallbackPages ?? pageMeshPages;
  const unsafeLinks = pageMesh?.totals.unsafeLinks ?? 0;
  const rows = [
    row(
      "builders_pages",
      "Builders page inventory",
      "Live Page Mesh vs Website Atlas",
      `${verifiedPages}/${pageMeshPages} verified, ${atlasFallbackPages} fallback`,
      `${atlas.pagesCovered} atlas pages`,
      !includeLivePageMesh ? "watch" : pageMesh?.status === "blocked" ? "blocked" : pageMeshPages >= 7 ? "matched" : "watch",
      ["/api/swiggy-builders-page-mesh", "/api/swiggy-website-atlas"],
      "Refresh Website Atlas and Page Mesh if the public Builders page count changes.",
    ),
    row(
      "header_footer",
      "Header and footer links",
      "Builders homepage navigation",
      `${atlas.globalHeader.length} header / ${footerLinks} footer`,
      `${sourceIntelligence.inventory.headerLinks} header / ${sourceIntelligence.inventory.footerLinks} footer`,
      atlas.globalHeader.length === sourceIntelligence.inventory.headerLinks &&
        footerLinks === sourceIntelligence.inventory.footerLinks
        ? "matched"
        : "watch",
      ["/api/swiggy-website-atlas", "/api/swiggy-source-intelligence"],
      "Reconcile any header/footer delta before recording the final demo.",
    ),
    row(
      "cta_inventory",
      "CTA inventory",
      "Start Building, Request access, Send Us a Demo, docs/footer CTAs",
      atlas.ctasCovered,
      sourceIntelligence.inventory.ctas,
      atlas.ctasCovered >= 11 && sourceIntelligence.inventory.ctas >= 11 ? "matched" : "watch",
      ["/api/swiggy-cta-execution-center", "/api/swiggy-cta-live-audit"],
      "Keep each official CTA mapped to a local proof route, manual browser action, or external gate.",
    ),
    row(
      "llms_docs",
      "llms and markdown docs",
      "llms.txt, llms-full.txt, and markdown twins",
      includeLlmsManifest ? docsCoverage.totalPages : "skipped",
      sourceIntelligence.inventory.llmsLinkedPages,
      includeLlmsManifest && docsCoverage.totalPages === sourceIntelligence.inventory.llmsLinkedPages ? "matched" : "watch",
      ["/api/swiggy-llms-manifest-verifier", "/api/swiggy-docs-twin-explorer"],
      "Re-run llms manifest verification if Swiggy adds or removes markdown pages.",
    ),
    row(
      "reference_tools",
      "MCP reference tools",
      "Food, Instamart, and Dineout reference pages",
      sourceIntelligence.inventory.toolReferenceTools,
      "35 callable tools",
      sourceIntelligence.inventory.toolReferenceTools === 35 ? "matched" : "blocked",
      ["/api/mcp/tool-lab", "/api/mcp/tool-contract-matrix", "/api/swiggy-tool-parity-auditor"],
      "A tool-count delta must create schema, mock, Tool Lab, route, safety, and verifier updates.",
    ),
    row(
      "access_packet",
      "Access packet proof",
      "Access Evidence Matrix, Access Policy Witness, and Builder Packet Export",
      includeAccessPacket
        ? `${accessEvidence.totals.rows} evidence rows / ${accessPolicy.rows} access-policy rows`
        : "skipped",
      `${packet.totals.packetFiles} packet files / ${packet.totals.visualTargets} visual targets / ${accessPolicy.score} access-policy score`,
      includeAccessPacket &&
        accessEvidence.totals.rows >= 50 &&
        accessPolicy.score >= 83 &&
        accessPolicy.rows >= 8 &&
        packet.totals.packetFiles >= 4
        ? "matched"
        : "watch",
      ["/api/swiggy-access-evidence-matrix", "/api/swiggy-builders-access-policy-witness", "/api/builder-packet-export"],
      "Export the builder packet after the final freeze and attach the ignored artifacts to the reviewer handoff.",
    ),
    row(
      "access_policy_witness",
      "Access policy witness freeze",
      "Swiggy access rules, legal gates, CTAs, attachments, brand, data, and approval ownership",
      includeAccessPacket
        ? `${accessPolicy.score}/100 ${accessPolicy.decision}; ${accessPolicy.readyRequiredApplicationFields}/${accessPolicy.requiredApplicationFields} required fields`
        : "skipped",
      `${accessPolicy.rows} rows / ${accessPolicy.proofLinks} proof links / ${accessPolicy.reviewGates} review gates`,
      includeAccessPacket &&
        accessPolicy.score >= 83 &&
        accessPolicy.rows >= 8 &&
        accessPolicy.applicationFields >= 8 &&
        accessPolicy.policyRules >= 7 &&
        accessPolicy.requiredAttachments >= 5 &&
        accessPolicy.browserRunbookSteps >= 5 &&
        accessPolicy.proofLinks >= 16 &&
        accessPolicy.decision !== "access_policy_blocked"
        ? "matched"
        : "watch",
      ["/api/swiggy-builders-access-policy-witness", "/api/access-submission-studio", "/api/swiggy-access-evidence-matrix"],
      "Keep production access approval, legal acceptance, form submission, email handoff, and co-branding as manual or Swiggy-owned gates.",
    ),
    row(
      "credential_sandbox_witness",
      "Credential sandbox witness freeze",
      "OAuth PKCE, DCR, vault, sandbox, staging drills, certification, cutover, and live-signal gates",
      includeAccessPacket
        ? `${credentialSandbox.score}/100 ${credentialSandbox.decision}; ${credentialSandbox.stagingDrills} staging drills; ${credentialSandbox.certificationTools}/35 tools`
        : "skipped",
      `${credentialSandbox.rows} rows / ${credentialSandbox.proofLinks} proof links / ${credentialSandbox.redactionRules} redaction rules`,
      includeAccessPacket &&
        credentialSandbox.score >= 84 &&
        credentialSandbox.rows >= 8 &&
        credentialSandbox.stagingDrills === 3 &&
        credentialSandbox.certificationTools === 35 &&
        credentialSandbox.redactionRules >= 4 &&
        credentialSandbox.proofLinks >= 16
        ? "matched"
        : "watch",
      ["/api/swiggy-builders-credential-sandbox-witness", "/api/swiggy-credential-readiness-dossier", "/api/swiggy-credential-vault-center"],
      "Do not treat the freeze as credentialed replay proof until Swiggy issues staging credentials and seeded users.",
    ),
    row(
      "upstream_watch",
      "Upstream roadmap watch",
      "Changelog, roadmap, signed manifest, hosted widgets, payment gates",
      `${upstreamWatch.roadmapItems.length} roadmap watches`,
      `${sourceIntelligence.driftSignals.length} drift signals`,
      upstreamWatch.roadmapItems.length >= 10 && sourceIntelligence.driftSignals.length >= 5 ? "matched" : "watch",
      ["/api/swiggy-upstream-watch", "/api/swiggy-source-intelligence"],
      "Keep roadmap behavior separate from shipped behavior until Swiggy releases or approves it.",
    ),
    row(
      "browser_rebrowse",
      "Manual browser re-browse gate",
      "Official Swiggy Builders site",
      includeBrowserRebrowse
        ? browserRebrowseReceipt
          ? `receipt saved at ${browserRebrowseReceipt.checkedAt}`
          : "required before submission"
        : "not required for this mode",
      browserRebrowseReceipt
        ? `${browserRebrowseReceipt.actor} / ${browserRebrowseReceipt.viewport}`
        : pageMesh?.status ?? "local source freeze",
      includeBrowserRebrowse && mode === "pre_access_submission" && !browserRebrowseReceipt ? "watch" : "matched",
      ["/api/swiggy-builders-live-source-resilience", "https://mcp.swiggy.com/builders/"],
      browserRebrowseReceipt
        ? "Attach or reference the final browser screenshot with the builder packet."
        : "Open the live Builders site in a browser immediately before recording or submitting the access packet.",
    ),
  ];
  const missingInputs = rows
    .filter((item) => item.status !== "matched")
    .map((item) => `${item.label}: ${item.nextAction}`);
  if (rows.some((item) => item.status === "blocked")) {
    missingInputs.push("blocked Swiggy source contract change");
  }
  const score = scoreFor(rows);
  const decision: SwiggySourceFreezeDiffReport["decision"] =
    rows.some((item) => item.status === "blocked")
      ? "blocked_external_gate"
      : missingInputs.length > 0
        ? "refresh_required"
        : "ready_to_freeze";

  return {
    generatedAt: new Date().toISOString(),
    freezeId: freezeId(mode),
    decision,
    score,
    mode,
    includeLivePageMesh,
    includeLlmsManifest,
    includeAccessPacket,
    includeBrowserRebrowse,
    browserRebrowseReceipt,
    officialSources,
    liveSnapshot: {
      homepageMode: pageMesh?.status ?? "not_fetched",
      pageMeshPages,
      fetchedPages,
      verifiedPages,
      atlasFallbackPages,
      unsafeLinks,
      ctas: atlas.ctasCovered,
      headerLinks: atlas.globalHeader.length,
      footerLinks,
      llmsPages: docsCoverage.totalPages,
      referenceTools: sourceIntelligence.inventory.toolReferenceTools,
    },
    localPacket: {
      sourceIntelligenceScore: sourceIntelligence.score,
      sourceClusters: sourceIntelligence.clusters.length,
      driftSignals: sourceIntelligence.driftSignals.length,
      accessEvidenceRows: accessEvidence.totals.rows,
      accessPolicyScore: accessPolicy.score,
      accessPolicyRows: accessPolicy.rows,
      accessPolicyGates: accessPolicy.operatorGates + accessPolicy.swiggyGates,
      credentialSandboxScore: credentialSandbox.score,
      credentialSandboxRows: credentialSandbox.rows,
      credentialSandboxGates: credentialSandbox.operatorGates + credentialSandbox.swiggyGates,
      packetFiles: packet.totals.packetFiles,
      packetVisualTargets: packet.totals.visualTargets,
      launchArtifacts: launchBundle.artifacts.length,
    },
    diffRows: rows,
    commands: [
      {
        command: "curl -fsS http://localhost:8787/api/swiggy-source-freeze-diff",
        proves: "Final live-source freeze diff, snapshot counts, missing inputs, and proof commands are current.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves:
          "Source Intelligence, Upstream Watch, Page Mesh, Access Evidence, Access Policy Witness, Credential Sandbox Witness, and Builder Packet stay aligned.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run export:builder-packet",
        proves: "Ignored reviewer packet artifacts are regenerated after the freeze decision.",
      },
    ],
    missingInputs,
    telemetry: [
      { field: "mode", value: mode, redaction: "safe source-freeze mode" },
      { field: "decision", value: decision, redaction: "safe source-freeze decision" },
      { field: "page_mesh_pages", value: String(pageMeshPages), redaction: "aggregate count only" },
      { field: "verified_pages", value: String(verifiedPages), redaction: "aggregate count only" },
      { field: "reference_tools", value: String(sourceIntelligence.inventory.toolReferenceTools), redaction: "aggregate count only" },
      { field: "access_evidence_rows", value: String(accessEvidence.totals.rows), redaction: "aggregate count only" },
      { field: "access_policy_score", value: String(accessPolicy.score), redaction: "aggregate score only" },
      { field: "access_policy_gates", value: String(accessPolicy.operatorGates + accessPolicy.swiggyGates), redaction: "aggregate gate count only" },
      { field: "credential_sandbox_score", value: String(credentialSandbox.score), redaction: "aggregate score only" },
      { field: "credential_sandbox_gates", value: String(credentialSandbox.operatorGates + credentialSandbox.swiggyGates), redaction: "aggregate gate count only" },
      ...(browserRebrowseReceipt
        ? [
            {
              field: "browser_rebrowse_receipt",
              value: `${browserRebrowseReceipt.checkedAt} / ${browserRebrowseReceipt.viewport}`,
              redaction: "operator receipt metadata only",
            },
          ]
        : []),
    ],
    assertions: [
      "The freeze diff accepts no user-supplied source URL; it only reads the official Swiggy Builders source set.",
      "Live fetch fallback is disclosed as atlas fallback and never counted as silent source parity.",
      "Header, footer, CTA, docs, llms, reference-tool, access-packet, access-policy, credential-sandbox, and roadmap signals must all align before final submission.",
      "The pre-submission freeze includes Credential Sandbox Witness and Access Policy Witness rollups before a packet can be considered ready.",
      "Credential and access-policy witness rows expose only aggregate redacted readiness, never raw tokens, client secrets, auth codes, PKCE verifiers, user PII, screenshots, cookies, or page HTML.",
      "The freeze includes access and credential witnesses but still preserves Swiggy-owned approval, staging credential, production credential, and co-branding gates.",
      browserRebrowseReceipt
        ? "The browser re-browse operator receipt is metadata-only and does not store screenshots, cookies, profile data, tokens, or page HTML."
        : "A browser re-browse remains an operator gate because automated HTTP checks cannot prove the whole human-visible website experience.",
    ],
    externalGates: [
      "Swiggy can update Builders pages, llms manifests, docs, or reference tools without notice.",
      "Live staging credentials, production credentials, and seeded users remain required before source freeze can become credentialed replay proof.",
      browserRebrowseReceipt
        ? "Final screenshot attachment remains operator-owned outside the API response."
        : "Operator must open the official Builders page in a browser before final access submission.",
    ],
    nextAction:
      decision === "ready_to_freeze"
        ? "Regenerate the builder packet, record the demo, and submit the access form with the frozen source proof attached."
        : decision === "refresh_required"
          ? `Resolve ${missingInputs.join("; ")} before recording or submitting the access packet.`
          : "Stop final submission until the blocked Swiggy source contract change is reconciled.",
  };
}
