import type {
  SwiggyServer,
  SwiggyToolContract,
  SwiggyToolParityAuditor,
  SwiggyToolParityRow,
  SwiggyToolParityServerSummary,
  SwiggyToolParityStatus,
} from "../../src/domain/types.js";
import {
  fetchSwiggyLlmsManifest,
  parseSwiggyLlmsManifest,
  type ManifestFetchFn,
} from "./llmsManifestVerifier.js";
import { buildSwiggyDocsCoverage } from "./docsCoverage.js";
import { buildSwiggyToolContractMatrix } from "./toolContractMatrix.js";

const llmsUrl = "https://mcp.swiggy.com/builders/llms.txt";
const llmsFullUrl = "https://mcp.swiggy.com/builders/llms-full.txt";
const expectedToolsByServer: Record<SwiggyServer, number> = {
  food: 14,
  instamart: 13,
  dineout: 8,
};

function contractKey(server: SwiggyServer, tool: string) {
  return `${server}_${tool}`;
}

function rowStatus(contract: SwiggyToolContract | undefined): SwiggyToolParityStatus {
  if (!contract) return "watch";
  if (!contract.fixture.responsePreview || !contract.confirmationGate || !contract.retryPolicy) return "watch";
  return "covered";
}

function scoreFor(missing: number, extra: number, matched: number, liveTools: number) {
  if (missing === 0 && extra === 0 && matched === liveTools && liveTools === 35) return 100;
  const completeness = liveTools === 0 ? 0 : matched / liveTools;
  const driftPenalty = Math.min(20, missing * 5 + extra);
  return Math.max(70, Math.round(95 * completeness - driftPenalty));
}

function fallbackReferenceToolsFromCoverage() {
  return buildSwiggyDocsCoverage().pages
    .map((page) => {
      const server = page.markdownUrl.includes("/docs/reference/food/")
        ? "food"
        : page.markdownUrl.includes("/docs/reference/instamart/")
          ? "instamart"
          : page.markdownUrl.includes("/docs/reference/dineout/")
            ? "dineout"
            : undefined;
      const tool = page.markdownUrl.match(/\/docs\/reference\/(?:food|instamart|dineout)\/([^/]+)\.md$/)?.[1];
      if (!server || !tool || tool === "index") return undefined;
      return {
        server,
        tool,
        markdownUrl: page.markdownUrl,
        renderedUrl: page.url,
      };
    })
    .filter((tool): tool is { server: SwiggyServer; tool: string; markdownUrl: string; renderedUrl: string } =>
      Boolean(tool),
    );
}

function buildRows(liveTools: Array<{ server: SwiggyServer; tool: string; markdownUrl: string; renderedUrl: string }>, contracts: SwiggyToolContract[]) {
  const contractById = new Map(contracts.map((contract) => [contract.id, contract]));

  return liveTools.map((liveTool): SwiggyToolParityRow => {
    const id = contractKey(liveTool.server, liveTool.tool);
    const contract = contractById.get(id);

    return {
      id,
      server: liveTool.server,
      tool: liveTool.tool,
      officialMarkdownUrl: liveTool.markdownUrl,
      officialRenderedUrl: liveTool.renderedUrl,
      localContractId: contract?.id ?? null,
      endpoint: contract?.endpoint ?? "",
      behavior: contract?.behavior ?? "missing",
      routeClass: contract?.routeClass ?? "missing",
      parameterCount: contract?.parameters.length ?? 0,
      requiredParameterCount: contract?.requiredParameterCount ?? 0,
      confirmationGate: contract?.confirmationGate ?? "No local contract yet.",
      retryPolicy: contract?.retryPolicy ?? "Block until a local retry policy is written.",
      fixtureReady: Boolean(contract?.fixture.responsePreview),
      referenceMatched: true,
      contractMatched: Boolean(contract),
      status: rowStatus(contract),
      evidenceLinks: contract
        ? [contract.officialReference, "/api/mcp/tool-contract-matrix", "/api/mcp/tool-lab", ...contract.evidenceLinks]
        : [liveTool.renderedUrl, "/api/swiggy-llms-manifest-verifier"],
    };
  });
}

function summarizeServer(server: SwiggyServer, rows: SwiggyToolParityRow[], contracts: SwiggyToolContract[]): SwiggyToolParityServerSummary {
  const serverRows = rows.filter((row) => row.server === server);
  const serverContracts = contracts.filter((contract) => contract.server === server);
  const covered = serverRows.filter((row) => row.status === "covered").length;
  const expectedTools = expectedToolsByServer[server];

  return {
    server,
    liveReferenceTools: serverRows.length,
    localContracts: serverContracts.length,
    expectedTools,
    covered,
    commercialActions: serverRows.filter((row) => row.behavior === "commercial").length,
    mutatingTools: serverRows.filter((row) => row.behavior === "mutating").length,
    supportTools: serverRows.filter((row) => row.behavior === "support").length,
    status: serverRows.length === expectedTools && serverContracts.length === expectedTools && covered === expectedTools ? "covered" : "watch",
  };
}

export async function buildSwiggyToolParityAuditor(
  fetchManifest: ManifestFetchFn = fetchSwiggyLlmsManifest,
): Promise<SwiggyToolParityAuditor> {
  const [manifest, matrix] = await Promise.all([fetchManifest(llmsUrl), buildSwiggyToolContractMatrix()]);
  const links = manifest.text ? parseSwiggyLlmsManifest(manifest.text) : [];
  const parsedTools = links
    .filter((link): link is typeof link & { server: SwiggyServer; tool: string } => Boolean(link.server && link.tool))
    .map((link) => ({
      server: link.server,
      tool: link.tool,
      markdownUrl: link.markdownUrl,
      renderedUrl: link.renderedUrl,
    }));
  const usedCoverageFallback = parsedTools.length === 0 && !manifest.ok;
  const liveTools = usedCoverageFallback ? fallbackReferenceToolsFromCoverage() : parsedTools;
  const rows = buildRows(liveTools, matrix.contracts);
  const liveIds = new Set(rows.map((row) => row.id));
  const localIds = new Set(matrix.contracts.map((contract) => contract.id));
  const missingContracts = rows.filter((row) => !row.contractMatched).map((row) => row.id);
  const extraContracts = matrix.contracts.filter((contract) => !liveIds.has(contract.id)).map((contract) => contract.id);
  const matchedTools = rows.filter((row) => row.contractMatched).length;
  const score = scoreFor(missingContracts.length, extraContracts.length, matchedTools, liveTools.length);
  const status: SwiggyToolParityStatus = missingContracts.length === 0 && extraContracts.length === 0 && matchedTools === liveTools.length && liveTools.length === localIds.size
      ? "covered"
      : "watch";

  return {
    generatedAt: new Date().toISOString(),
    score,
    status,
    officialSources: [
      llmsUrl,
      llmsFullUrl,
      "https://mcp.swiggy.com/builders/docs/reference/",
      "/api/swiggy-llms-manifest-verifier",
      "/api/mcp/tool-contract-matrix",
    ],
    totals: {
      liveReferenceTools: liveTools.length,
      localContracts: matrix.totalTools,
      matchedTools,
      missingContracts: missingContracts.length,
      extraContracts: extraContracts.length,
      commercialActions: rows.filter((row) => row.behavior === "commercial").length,
      supportTools: rows.filter((row) => row.behavior === "support").length,
      routeClasses: new Set(rows.map((row) => row.routeClass)).size,
    },
    serverSummaries: (["food", "instamart", "dineout"] as SwiggyServer[]).map((server) =>
      summarizeServer(server, rows, matrix.contracts),
    ),
    rows,
    missingContracts,
    extraContracts,
    driftSignals: [
      usedCoverageFallback
        ? "Live reference manifest was unavailable; Docs Coverage fallback preserved the expected 35 Swiggy tools."
        : liveTools.length === 35
        ? "Live reference manifest still exposes the expected 35 Swiggy tools."
        : `Live reference manifest exposes ${liveTools.length} tools; update local contracts before review.`,
      missingContracts.length === 0
        ? "Every live reference tool has a local Tool Contract Matrix row."
        : `${missingContracts.length} live reference tools are missing local contracts.`,
      extraContracts.length === 0
        ? "No local Tool Contract Matrix rows are orphaned from the live manifest."
        : `${extraContracts.length} local tool contracts are not present in the current live manifest.`,
    ],
    operatorRunbook: [
      {
        sequence: 1,
        command: "curl -fsS https://mcp.swiggy.com/builders/llms.txt",
        proves: "Swiggy's live coding-agent manifest is reachable and official.",
      },
      {
        sequence: 2,
        command: "curl -fsS http://localhost:8787/api/swiggy-tool-parity-auditor",
        proves: "MealPilot reconciles live reference tools against local contracts, fixtures, safety classes, and retry policies.",
      },
      {
        sequence: 3,
        command: "npm run verify:production",
        proves: "Production smoke keeps the live-reference parity auditor, Tool Contract Matrix, Tool Lab, and manifest verifier aligned.",
      },
    ],
    assertions: [
      "Only the official Swiggy llms.txt URL is fetched; user-supplied URLs are never accepted.",
      "When live llms.txt is blocked, Docs Coverage fallback can preserve the 35-tool reference list while disclosing fetch failure.",
      "Every live reference tool must have one local contract with parameter metadata, route class, confirmation gate, retry policy, and fixture evidence.",
      "Commercial actions remain explicitly classified for place_food_order, checkout, and book_table.",
      "Any missing or orphaned contract blocks the access packet until Tool Lab, Journey Compiler, and production verifier are updated.",
    ],
    externalGates: [
      "Swiggy staging credentials are still required before live response envelopes can be certified.",
      "A new live reference tool requires a local mock fixture before it can be included in reviewer demos.",
      "Re-run this auditor immediately before the final Builder Access submission because Swiggy may update llms.txt.",
    ],
  };
}
