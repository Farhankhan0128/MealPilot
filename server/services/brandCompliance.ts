import type {
  BrandAssetGate,
  BrandComplianceKit,
  BrandComplianceRehearsal,
  BrandComplianceRehearsalMode,
  BrandComplianceRule,
  BrandComplianceStatus,
  BrandSurfacePlacement,
} from "../../src/domain/types.js";

const officialSources = [
  "https://mcp.swiggy.com/builders/",
  "https://mcp.swiggy.com/builders/access/",
  "https://mcp.swiggy.com/builders/enterprises/",
  "https://mcp.swiggy.com/builders/docs/start/enterprise/",
  "https://mcp.swiggy.com/builders/docs/operate/support/",
];

function statusScore(status: BrandComplianceStatus) {
  if (status === "ready") return 1;
  if (status === "watch") return 0.85;
  if (status === "manual_input") return 0.7;
  return 0.55;
}

const rules: BrandComplianceRule[] = [
  {
    id: "powered_by_swiggy",
    label: "Powered by Swiggy attribution",
    status: "ready",
    officialSignal: "Surfaces that direct users to Swiggy-originated data should use Powered by Swiggy attribution.",
    mealPilotControl: "Recommendation cards, widget fallbacks, Demo Studio, transcripts, and Launch Bundle all carry Swiggy service context.",
    evidenceLinks: ["/api/sessions/:sessionId/widgets", "/api/sessions/:sessionId/staging-transcript", "/api/production-launch-bundle"],
  },
  {
    id: "no_false_endorsement",
    label: "No false endorsement",
    status: "ready",
    officialSignal: "Do not imply Swiggy endorsement, sponsorship, or partnership beyond the approved contract.",
    mealPilotControl: "Copy says Swiggy MCP integration and Builder Access review, not official partnership or certified launch.",
    evidenceLinks: ["/api/swiggy-access-dossier", "/api/builder-package.md"],
  },
  {
    id: "brand_assets_after_onboarding",
    label: "Brand assets after onboarding",
    status: "external_gate",
    officialSignal: "Latest logos, wordmarks, and do/don't guidance are shared during onboarding.",
    mealPilotControl: "MealPilot reserves asset slots but does not embed or modify unissued Swiggy marks.",
    evidenceLinks: ["/api/production-launch-bundle", "/api/swiggy-access-dossier"],
  },
  {
    id: "orange_usage",
    label: "Swiggy orange reserved",
    status: "ready",
    officialSignal: "Reference #FF5200 only with Swiggy marks, not as the product's primary palette.",
    mealPilotControl: "MealPilot keeps a restrained green/neutral palette and reserves Swiggy orange for future official marks only.",
    evidenceLinks: ["/api/brand-compliance-kit", "/api/compliance-evidence"],
  },
  {
    id: "white_label_restriction",
    label: "No hidden source or white-label misuse",
    status: "ready",
    officialSignal: "Do not hide Swiggy's brand or confuse users about where commerce data comes from.",
    mealPilotControl: "Plans, support, transcript, and docs expose Food, Instamart, and Dineout as Swiggy-backed lanes.",
    evidenceLinks: ["/api/swiggy-journey-compiler", "/api/staging-certification-matrix"],
  },
  {
    id: "no_misrepresentation",
    label: "No price, availability, or ETA misrepresentation",
    status: "ready",
    officialSignal: "Do not misrepresent prices, availability, delivery times, or platform data.",
    mealPilotControl: "MealPilot labels mock/staging status, refreshes carts before confirmation, and keeps live validation as an external gate.",
    evidenceLinks: ["/api/sessions/:sessionId/preflight", "/api/mcp-gateway", "/api/staging-certification-matrix"],
  },
  {
    id: "support_feedback",
    label: "Support and feedback routing",
    status: "ready",
    officialSignal: "Use builders@swiggy.in, report_error, and designated contacts for support and feedback.",
    mealPilotControl: "Support Bridge creates report_error payloads and mailto escalation with session ids.",
    evidenceLinks: ["/api/support/bridge", "/api/error-intelligence"],
  },
];

const surfaces: BrandSurfacePlacement[] = [
  {
    id: "recommendation_card",
    surface: "recommendation_card",
    placement: "Each Food, Instamart, and Dineout recommendation card and confirmation panel.",
    requiredCopy: "Powered by Swiggy MCP - Food, Instamart, or Dineout data.",
    status: "ready",
    evidence: "Recommendations include server labels, provider names, location labels, and explicit confirmation gates.",
  },
  {
    id: "widget_fallback",
    surface: "widget",
    placement: "Iframe fallback copy and widget contracts.",
    requiredCopy: "Powered by Swiggy widget fallback.",
    status: "ready",
    evidence: "/api/sessions/:sessionId/widgets exposes Swiggy widget origin, sandbox, and semantic fallback text.",
  },
  {
    id: "voice_surface",
    surface: "voice",
    placement: "Voice response intro and confirmation prompt.",
    requiredCopy: "I found these Swiggy options for you.",
    status: "ready",
    evidence: "Voice responses are concise, do not expose internal IDs, and preserve Swiggy lane context.",
  },
  {
    id: "support_transcript",
    surface: "support",
    placement: "Support Bridge, report_error, and Staging Transcript Export.",
    requiredCopy: "MealPilot Swiggy MCP support context.",
    status: "ready",
    evidence: "Support artifacts include builders@swiggy.in, session ids, request ids, affected Swiggy server, and redaction notes.",
  },
  {
    id: "docs_packet",
    surface: "docs",
    placement: "README, builder packet, access dossier, and launch bundle.",
    requiredCopy: "Built for Swiggy Builders Club review; production approval pending until Swiggy issues credentials.",
    status: "ready",
    evidence: "Docs distinguish local proof from Swiggy-issued staging and production approval.",
  },
  {
    id: "launch_handoff",
    surface: "launch",
    placement: "Production Launch Bundle handoff email.",
    requiredCopy: "MealPilot India for Swiggy Builders Club access review.",
    status: "ready",
    evidence: "Launch Bundle email avoids claiming endorsement and links proof artifacts instead.",
  },
];

const assetGates: BrandAssetGate[] = [
  {
    id: "logo_pack",
    label: "Swiggy logo and wordmark pack",
    status: "external_gate",
    source: "Shared by Swiggy during onboarding.",
    allowedUse: "Use unmodified logos only in approved Powered by Swiggy attribution placements.",
    blockedUse: "Do not crop, recolor, distort, animate, or use as MealPilot's logo.",
    nextAction: "Request latest assets after Builder Access approval and attach them to the design system.",
  },
  {
    id: "do_dont_sheet",
    label: "Do and don't brand sheet",
    status: "external_gate",
    source: "Shared by Swiggy during onboarding.",
    allowedUse: "Validate every MealPilot surface before production launch.",
    blockedUse: "Do not infer missing brand rules from public marketing pages.",
    nextAction: "Add screenshots to the partner review packet once Swiggy shares the sheet.",
  },
  {
    id: "custom_cobranding",
    label: "Custom co-branding rights",
    status: "external_gate",
    source: "Negotiated per partner or enterprise contract.",
    allowedUse: "Use only after explicit written approval.",
    blockedUse: "No white-label or implied sponsorship in local review.",
    nextAction: "Keep MealPilot wording as Builder Access review until contract terms exist.",
  },
];

export function buildBrandComplianceKit(): BrandComplianceKit {
  const launchChecklist = [
    {
      id: "attribution_visible",
      label: "Attribution visible on Swiggy data surfaces",
      status: "ready" as const,
      evidence: `${surfaces.filter((surface) => surface.status === "ready").length}/${surfaces.length} reviewed surfaces have attribution guidance.`,
    },
    {
      id: "asset_gates",
      label: "Unissued assets are not embedded",
      status: "ready" as const,
      evidence: "All logo and custom co-branding assets remain external gates until Swiggy shares them.",
    },
    {
      id: "palette",
      label: "Swiggy orange is not a MealPilot primary color",
      status: "ready" as const,
      evidence: "MealPilot uses its own green/neutral UI palette and reserves #FF5200 for future Swiggy marks.",
    },
    {
      id: "review_screenshots",
      label: "Final brand screenshot pass",
      status: "manual_input" as const,
      evidence: "Capture production screenshots after official assets and HTTPS redirect URI are installed.",
    },
    {
      id: "contract_rights",
      label: "Custom co-branding contract",
      status: "external_gate" as const,
      evidence: "Custom or white-label co-branding requires explicit Swiggy approval.",
    },
  ];
  const scoreItems = [
    ...rules.map((rule) => rule.status),
    ...surfaces.map((surface) => surface.status),
    ...assetGates.map((gate) => gate.status),
    ...launchChecklist.map((item) => item.status),
    "ready" as const,
  ];
  const score = Math.round((scoreItems.reduce((sum, status) => sum + statusScore(status), 0) / scoreItems.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    officialSources,
    attributionCopy: [
      "Powered by Swiggy MCP",
      "Food, Instamart, and Dineout results are served through Swiggy MCP.",
      "Production access and co-branding assets are pending Swiggy onboarding approval.",
    ],
    rules,
    surfaces,
    assetGates,
    paletteAudit: {
      primaryPalette: "MealPilot green, white, neutral ink, and safety accents.",
      swiggyOrange: "#FF5200",
      orangeUsage: "reserved_for_swiggy_marks_only",
      status: "ready",
      evidence: "No Swiggy-orange primary theme is used; the color is reserved for approved Swiggy marks after onboarding.",
    },
    launchChecklist,
    assertions: [
      "MealPilot does not claim official Swiggy endorsement before production approval.",
      "Swiggy-originated recommendation, widget, support, and transcript surfaces have explicit attribution guidance.",
      "Official logos, wordmarks, and custom co-branding rights remain external gates until Swiggy shares assets or contract terms.",
      "MealPilot reserves #FF5200 for Swiggy marks and does not use it as the app's primary palette.",
    ],
    externalGates: [
      "Latest Swiggy brand asset pack and do/don't sheet from onboarding.",
      "Written approval for any custom co-branding, white-label, or enterprise placement.",
      "Final screenshot review after staging credentials and production URL are installed.",
    ],
  };
}

export function rehearseBrandCompliance(input: {
  mode: BrandComplianceRehearsalMode;
  includeAttributionAudit: boolean;
  includeFinalScreenshots: boolean;
  includeOfficialAssets: boolean;
  includeCobrandApproval: boolean;
}): BrandComplianceRehearsal {
  const kit = buildBrandComplianceKit();
  const missingInputs: string[] = [];
  const selectedRules =
    input.mode === "local_review"
      ? kit.rules.filter((rule) => rule.status !== "external_gate")
      : kit.rules;
  const selectedSurfaces =
    input.mode === "cobrand_launch"
      ? kit.surfaces
      : kit.surfaces.filter((surface) => surface.surface !== "launch" || input.includeFinalScreenshots);
  const selectedAssetGates =
    input.includeOfficialAssets || input.includeCobrandApproval || input.mode !== "local_review" ? kit.assetGates : [];

  if (input.includeAttributionAudit && kit.surfaces.some((surface) => surface.status !== "ready")) {
    missingInputs.push("attribution surface review");
  }
  if (input.includeFinalScreenshots) missingInputs.push("final production screenshots");
  if (input.includeOfficialAssets) missingInputs.push("official Swiggy brand asset pack");
  if (input.includeCobrandApproval || input.mode === "cobrand_launch") missingInputs.push("written Swiggy co-branding approval");
  if (input.mode === "asset_onboarding" && !input.includeOfficialAssets) missingInputs.push("asset onboarding request");

  const decision: BrandComplianceRehearsal["decision"] =
    missingInputs.some((item) => item.includes("official Swiggy") || item.includes("written Swiggy"))
      ? "blocked_brand_gate"
      : missingInputs.length > 0
        ? "manual_brand_gate"
        : "ready_brand_packet";

  return {
    generatedAt: new Date().toISOString(),
    decision,
    readinessScore: kit.score,
    mode: input.mode,
    includeAttributionAudit: input.includeAttributionAudit,
    includeFinalScreenshots: input.includeFinalScreenshots,
    includeOfficialAssets: input.includeOfficialAssets,
    includeCobrandApproval: input.includeCobrandApproval,
    selectedRules,
    selectedSurfaces,
    selectedAssetGates,
    attributionCopy: kit.attributionCopy,
    commands: [
      {
        command: "curl -fsS http://localhost:8787/api/brand-compliance-kit",
        proves: "Attribution, no-endorsement, palette, asset gates, and surface placements are reviewable.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:visual",
        proves: "Reviewer screenshots cover premium UI, attribution surfaces, and no-overlap rules.",
      },
      {
        command: "MEALPILOT_URL=http://localhost:8787 npm run verify:production",
        proves: "Brand compliance remains wired into reviewer proof, launch bundle, and safety assertions.",
      },
    ],
    missingInputs,
    telemetry: [
      { field: "mode", value: input.mode, redaction: "safe brand rehearsal mode" },
      { field: "surfaces", value: String(selectedSurfaces.length), redaction: "aggregate count only" },
      { field: "rules", value: String(selectedRules.length), redaction: "aggregate count only" },
      { field: "asset_gates", value: String(selectedAssetGates.length), redaction: "aggregate count only" },
      { field: "palette_status", value: kit.paletteAudit.status, redaction: "safe status enum" },
    ],
    assertions: [
      "MealPilot keeps its own logo and never uses Swiggy marks as the MealPilot logo.",
      "Powered by Swiggy attribution is prepared for Swiggy-originated Food, Instamart, Dineout, widget, support, and launch surfaces.",
      "The rehearsal never downloads, modifies, recolors, or embeds unissued Swiggy brand assets.",
      "Co-branding and endorsement language remain blocked until Swiggy gives written approval.",
    ],
    nextAction:
      decision === "ready_brand_packet"
        ? "Attach the brand compliance packet, attribution copy, and visual QA screenshots to the reviewer handoff."
        : decision === "manual_brand_gate"
          ? `Resolve ${missingInputs.join(", ")} before final brand review.`
          : `Keep brand launch blocked on ${missingInputs.join(", ")} and use local attribution evidence only.`,
  };
}
