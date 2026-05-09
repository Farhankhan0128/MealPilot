import type {
  GroupMember,
  GroupPlan,
  MealPlan,
  OpsStatus,
  PantryItem,
  Reminder,
  RestockSuggestion,
  UserProfile,
} from "../../src/domain/types.js";

export function buildRestockSuggestions(pantry: PantryItem[]): RestockSuggestion[] {
  return pantry
    .filter((item) => item.currentQty < item.targetQty)
    .map((item) => {
      const missing = item.targetQty - item.currentQty;
      return {
        id: `restock_${item.id}`,
        itemId: item.id,
        name: item.name,
        quantity: `${missing} ${item.unit}`,
        price: Math.round(missing * item.estimatedPrice),
        reason: `${item.name} is below household target of ${item.targetQty} ${item.unit}.`,
      };
    });
}

export function buildGroupPlan(members: GroupMember[]): GroupPlan {
  const combinedBudget = members.reduce((sum, member) => sum + member.budget, 0);
  const diets = [...new Set(members.map((member) => member.diet))];
  const allergies = [...new Set(members.flatMap((member) => member.allergies))].filter(Boolean);

  return {
    members,
    combinedBudget,
    constraints: [...diets, ...allergies.map((allergy) => `${allergy}-safe`)],
    recommendation:
      combinedBudget >= 1200
        ? "Use group-friendly bowls plus shared starters; keep allergy-safe filtering on."
        : "Use individual bowls and avoid shared add-ons to protect budget and allergies.",
  };
}

export function buildPlanReminders(plan: MealPlan): Reminder[] {
  const now = Date.now();
  return [
    {
      id: `reminder_${plan.id}_food`,
      sessionId: plan.id,
      label: "Review lunch order window",
      channel: "in_app",
      scheduledFor: new Date(now + 15 * 60 * 1000).toISOString(),
      status: "scheduled",
    },
    {
      id: `reminder_${plan.id}_instamart`,
      sessionId: plan.id,
      label: "Check grocery basket before dinner prep",
      channel: "in_app",
      scheduledFor: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
    },
    {
      id: `reminder_${plan.id}_dineout`,
      sessionId: plan.id,
      label: "Confirm table timing with guests",
      channel: "email_draft",
      scheduledFor: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
    },
  ];
}

export function buildOpsStatus(options: { hasClientId: boolean; planCount: number; reminderCount: number }): OpsStatus[] {
  return [
    {
      id: "api",
      label: "API health",
      status: "healthy",
      detail: "Express API is responding and serving the production build.",
    },
    {
      id: "mcp",
      label: "MCP mode",
      status: options.hasClientId ? "healthy" : "warning",
      detail: options.hasClientId ? "Client id configured." : "Mock mode active until Swiggy credentials are issued.",
    },
    {
      id: "sessions",
      label: "Plan sessions",
      status: options.planCount > 0 ? "healthy" : "warning",
      detail: `${options.planCount} in-memory plan session(s) active.`,
    },
    {
      id: "reminders",
      label: "Reminder queue",
      status: "healthy",
      detail: `${options.reminderCount} scheduled reminder(s) in local queue.`,
    },
  ];
}

export function buildApplicationMarkdown(args: {
  profile: UserProfile;
  readiness: Array<{ label: string; status: string; evidence: string }>;
}) {
  const readiness = args.readiness
    .map((item) => `- ${item.label}: ${item.status} - ${item.evidence}`)
    .join("\n");

  return `# MealPilot India - Swiggy Builder Access Packet

## Use Case

MealPilot India is a privacy-first AI commerce assistant for Indian households. It composes Swiggy Food, Instamart, and Dineout into meal planning, grocery restocking, and dining workflows with explicit confirmation gates.

## Requested Servers

- food
- instamart
- dineout

## Pilot

- Target users: 50-100 private pilot users
- Expected traffic: below 1 QPS peak
- Tool calls: about 1,600-3,000 per week

## Safety

- Separate confirmation before food order, grocery checkout, or table booking
- No blind retry for non-idempotent commercial actions
- Minimal profile storage with explicit consent
- Swiggy session ids treated as support identifiers only

## Profile Snapshot

- Household size: ${args.profile.householdSize}
- Diet: ${args.profile.diet}
- City: ${args.profile.defaultCity}
- Consent: ${args.profile.consentToStorePreferences ? "yes" : "no"}

## Readiness

${readiness}
`;
}
