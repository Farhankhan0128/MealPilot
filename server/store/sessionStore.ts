import fs from "node:fs";
import path from "node:path";
import type {
  AccessSubmissionHandoffState,
  GroupPlan,
  MealPlan,
  PantryItem,
  Reminder,
  SwiggyCredentialIssuanceState,
  UserProfile,
} from "../../src/domain/types.js";
import { defaultUserProfile } from "../../src/domain/profile.js";

export interface AuthSession {
  state: string;
  verifier: string;
  challenge: string;
  createdAt: string;
  accessToken?: string;
  expiresAt?: string;
}

export interface StoreSnapshot {
  version: 1;
  savedAt: string;
  profile: UserProfile;
  pantry: PantryItem[];
  groupPlan: GroupPlan;
  plans: MealPlan[];
  reminders: Reminder[];
  authSessions: AuthSession[];
  accessSubmission: AccessSubmissionHandoffState;
  credentialIssuance: SwiggyCredentialIssuanceState;
}

export interface StoreDiagnostics {
  kind: "memory" | "file";
  durable: boolean;
  dataFile?: string;
  planCount: number;
  reminderCount: number;
  pantryCount: number;
  authSessionCount: number;
  groupMemberCount: number;
  accessSubmissionUpdatedAt?: string;
  credentialIssuanceUpdatedAt?: string;
  lastSavedAt?: string;
}

export interface CompactionResult {
  removedPlans: number;
  removedReminders: number;
  removedAuthSessions: number;
  retainedPlans: number;
}

export interface SessionStore {
  savePlan(plan: MealPlan): void;
  getPlan(sessionId: string): MealPlan | undefined;
  updatePlan(plan: MealPlan): void;
  saveAuthSession(session: AuthSession): void;
  consumeAuthSession(state: string): AuthSession | undefined;
  getAllPlans(): MealPlan[];
  getProfile(): UserProfile;
  updateProfile(profile: UserProfile): UserProfile;
  getPantry(): PantryItem[];
  updatePantry(items: PantryItem[]): PantryItem[];
  getGroupPlan(): GroupPlan;
  updateGroupPlan(groupPlan: GroupPlan): GroupPlan;
  saveReminder(reminder: Reminder): void;
  getReminders(sessionId?: string): Reminder[];
  getAccessSubmissionState(): AccessSubmissionHandoffState;
  updateAccessSubmissionState(state: AccessSubmissionHandoffState): AccessSubmissionHandoffState;
  getCredentialIssuanceState(): SwiggyCredentialIssuanceState;
  updateCredentialIssuanceState(state: SwiggyCredentialIssuanceState): SwiggyCredentialIssuanceState;
  clearUserData(): void;
  getSnapshot(): StoreSnapshot;
  replaceSnapshot(snapshot: StoreSnapshot): StoreSnapshot;
  compact(options?: { planRetentionDays?: number; authTtlMinutes?: number; now?: Date }): CompactionResult;
  getDiagnostics(): StoreDiagnostics;
}

function defaultPantry(): PantryItem[] {
  return [
    { id: "pantry_tofu", name: "Tofu", category: "protein", currentQty: 1, targetQty: 3, unit: "pack", estimatedPrice: 160 },
    { id: "pantry_dal", name: "Moong dal", category: "staple", currentQty: 0.5, targetQty: 2, unit: "kg", estimatedPrice: 180 },
    { id: "pantry_yogurt", name: "Greek yogurt", category: "dairy", currentQty: 0, targetQty: 2, unit: "tub", estimatedPrice: 210 },
    { id: "pantry_spinach", name: "Spinach", category: "produce", currentQty: 0, targetQty: 2, unit: "bunch", estimatedPrice: 70 },
  ];
}

function defaultGroupPlan(): GroupPlan {
  return {
    members: [
      { id: "member_farhan", name: "Farhan", diet: "high-protein vegetarian", allergies: [], budget: 600 },
      { id: "member_guest", name: "Guest", diet: "vegetarian", allergies: ["peanut"], budget: 500 },
    ],
    combinedBudget: 1100,
    constraints: ["vegetarian", "peanut-safe"],
    recommendation: "Choose high-protein bowls and keep dessert optional until everyone confirms.",
  };
}

function emptyGroupPlan(): GroupPlan {
  return {
    members: [],
    combinedBudget: 0,
    constraints: [],
    recommendation: "No group plan yet.",
  };
}

export function defaultAccessSubmissionState(): AccessSubmissionHandoffState {
  return {
    demoVideoUrl: "",
    technicalContactEmail: "",
    productionRedirectUri: "",
    staticEgressIp: "",
    environmentSummary: "",
    termsAcknowledged: false,
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

export function defaultCredentialIssuanceState(): SwiggyCredentialIssuanceState {
  return {
    clientIdConfigured: false,
    seededUsersReceived: {
      food: false,
      instamart: false,
      dineout: false,
    },
    supportThreadId: "",
    tokenExpiryRecorded: false,
    firstReadProbeReady: false,
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

function snapshotNow(args: {
  profile: UserProfile;
  pantry: PantryItem[];
  groupPlan: GroupPlan;
  plans: MealPlan[];
  reminders: Reminder[];
  authSessions: AuthSession[];
  accessSubmission: AccessSubmissionHandoffState;
  credentialIssuance: SwiggyCredentialIssuanceState;
}): StoreSnapshot {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    ...args,
  };
}

function normalizeSnapshot(input: Partial<StoreSnapshot> | undefined): StoreSnapshot {
  return {
    version: 1,
    savedAt: input?.savedAt ?? new Date().toISOString(),
    profile: input?.profile ?? defaultUserProfile,
    pantry: input?.pantry ?? defaultPantry(),
    groupPlan: input?.groupPlan ?? defaultGroupPlan(),
    plans: input?.plans ?? [],
    reminders: input?.reminders ?? [],
    authSessions: input?.authSessions ?? [],
    accessSubmission: {
      ...defaultAccessSubmissionState(),
      ...(input?.accessSubmission ?? {}),
    },
    credentialIssuance: {
      ...defaultCredentialIssuanceState(),
      ...(input?.credentialIssuance ?? {}),
      seededUsersReceived: {
        ...defaultCredentialIssuanceState().seededUsersReceived,
        ...(input?.credentialIssuance?.seededUsersReceived ?? {}),
      },
    },
  };
}

export function createMemorySessionStore(initial?: Partial<StoreSnapshot>): SessionStore {
  const snapshot = normalizeSnapshot(initial);
  const plans = new Map<string, MealPlan>();
  const authSessions = new Map<string, AuthSession>();
  const reminders = new Map<string, Reminder>();
  let profile = snapshot.profile;
  let pantry: PantryItem[] = snapshot.pantry;
  let groupPlan: GroupPlan = snapshot.groupPlan;
  let accessSubmission: AccessSubmissionHandoffState = snapshot.accessSubmission;
  let credentialIssuance: SwiggyCredentialIssuanceState = snapshot.credentialIssuance;
  let lastSavedAt = snapshot.savedAt;

  snapshot.plans.forEach((plan) => plans.set(plan.id, plan));
  snapshot.authSessions.forEach((session) => authSessions.set(session.state, session));
  snapshot.reminders.forEach((reminder) => reminders.set(reminder.id, reminder));

  function currentSnapshot() {
    lastSavedAt = new Date().toISOString();
    return snapshotNow({
      profile,
      pantry,
      groupPlan,
      plans: [...plans.values()],
      reminders: [...reminders.values()],
      authSessions: [...authSessions.values()],
      accessSubmission,
      credentialIssuance,
    });
  }

  return {
    savePlan(plan) {
      plans.set(plan.id, plan);
    },
    getPlan(sessionId) {
      return plans.get(sessionId);
    },
    updatePlan(plan) {
      plans.set(plan.id, plan);
    },
    saveAuthSession(session) {
      authSessions.set(session.state, session);
    },
    consumeAuthSession(state) {
      const session = authSessions.get(state);
      authSessions.delete(state);
      return session;
    },
    getAllPlans() {
      return [...plans.values()];
    },
    getProfile() {
      return profile;
    },
    updateProfile(nextProfile) {
      profile = nextProfile;
      return profile;
    },
    getPantry() {
      return pantry;
    },
    updatePantry(items) {
      pantry = items;
      return pantry;
    },
    getGroupPlan() {
      return groupPlan;
    },
    updateGroupPlan(nextGroupPlan) {
      groupPlan = nextGroupPlan;
      return groupPlan;
    },
    saveReminder(reminder) {
      reminders.set(reminder.id, reminder);
    },
    getReminders(sessionId) {
      const allReminders = [...reminders.values()];
      return sessionId ? allReminders.filter((reminder) => reminder.sessionId === sessionId) : allReminders;
    },
    getAccessSubmissionState() {
      return accessSubmission;
    },
    updateAccessSubmissionState(nextState) {
      accessSubmission = nextState;
      return accessSubmission;
    },
    getCredentialIssuanceState() {
      return credentialIssuance;
    },
    updateCredentialIssuanceState(nextState) {
      credentialIssuance = nextState;
      return credentialIssuance;
    },
    clearUserData() {
      plans.clear();
      authSessions.clear();
      reminders.clear();
      profile = defaultUserProfile;
      pantry = [];
      groupPlan = emptyGroupPlan();
      accessSubmission = defaultAccessSubmissionState();
      credentialIssuance = defaultCredentialIssuanceState();
      lastSavedAt = new Date().toISOString();
    },
    getSnapshot() {
      return currentSnapshot();
    },
    replaceSnapshot(nextSnapshot) {
      const normalized = normalizeSnapshot(nextSnapshot);
      plans.clear();
      authSessions.clear();
      reminders.clear();
      normalized.plans.forEach((plan) => plans.set(plan.id, plan));
      normalized.authSessions.forEach((session) => authSessions.set(session.state, session));
      normalized.reminders.forEach((reminder) => reminders.set(reminder.id, reminder));
      profile = normalized.profile;
      pantry = normalized.pantry;
      groupPlan = normalized.groupPlan;
      accessSubmission = normalized.accessSubmission;
      credentialIssuance = normalized.credentialIssuance;
      lastSavedAt = normalized.savedAt;
      return currentSnapshot();
    },
    compact(options = {}) {
      const now = options.now ?? new Date();
      const planRetentionMs = (options.planRetentionDays ?? 14) * 24 * 60 * 60 * 1000;
      const authTtlMs = (options.authTtlMinutes ?? 15) * 60 * 1000;
      const planIdsBefore = new Set(plans.keys());
      const authIdsBefore = new Set(authSessions.keys());
      const reminderIdsBefore = new Set(reminders.keys());

      for (const plan of plans.values()) {
        const fallbackTime = Number(plan.id.split("_")[1] ? parseInt(plan.id.split("_")[1], 36) : Date.now());
        const createdAt = fallbackTime;
        if (Number.isFinite(createdAt) && now.getTime() - createdAt > planRetentionMs) {
          plans.delete(plan.id);
        }
      }

      for (const session of authSessions.values()) {
        const createdAt = Date.parse(session.createdAt);
        if (Number.isFinite(createdAt) && now.getTime() - createdAt > authTtlMs) {
          authSessions.delete(session.state);
        }
      }

      for (const reminder of reminders.values()) {
        if (!plans.has(reminder.sessionId)) {
          reminders.delete(reminder.id);
        }
      }

      lastSavedAt = new Date().toISOString();
      return {
        removedPlans: [...planIdsBefore].filter((id) => !plans.has(id)).length,
        removedAuthSessions: [...authIdsBefore].filter((id) => !authSessions.has(id)).length,
        removedReminders: [...reminderIdsBefore].filter((id) => !reminders.has(id)).length,
        retainedPlans: plans.size,
      };
    },
    getDiagnostics() {
      return {
        kind: "memory",
        durable: false,
        planCount: plans.size,
        reminderCount: reminders.size,
        pantryCount: pantry.length,
        authSessionCount: authSessions.size,
        groupMemberCount: groupPlan.members.length,
        accessSubmissionUpdatedAt: accessSubmission.updatedAt,
        credentialIssuanceUpdatedAt: credentialIssuance.updatedAt,
        lastSavedAt,
      };
    },
  };
}

export function createFileSessionStore(filePath: string): SessionStore {
  const resolvedPath = path.resolve(filePath);
  const snapshot = fs.existsSync(resolvedPath)
    ? normalizeSnapshot(JSON.parse(fs.readFileSync(resolvedPath, "utf8")) as Partial<StoreSnapshot>)
    : normalizeSnapshot(undefined);
  const memoryStore = createMemorySessionStore(snapshot);

  function persist() {
    const nextSnapshot = memoryStore.getSnapshot();
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    const tempPath = `${resolvedPath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(nextSnapshot, null, 2));
    fs.renameSync(tempPath, resolvedPath);
  }

  function withPersist<T>(operation: () => T): T {
    const result = operation();
    persist();
    return result;
  }

  if (!fs.existsSync(resolvedPath)) {
    persist();
  }

  return {
    savePlan(plan) {
      return withPersist(() => memoryStore.savePlan(plan));
    },
    getPlan(sessionId) {
      return memoryStore.getPlan(sessionId);
    },
    updatePlan(plan) {
      return withPersist(() => memoryStore.updatePlan(plan));
    },
    saveAuthSession(session) {
      return withPersist(() => memoryStore.saveAuthSession(session));
    },
    consumeAuthSession(state) {
      return withPersist(() => memoryStore.consumeAuthSession(state));
    },
    getAllPlans() {
      return memoryStore.getAllPlans();
    },
    getProfile() {
      return memoryStore.getProfile();
    },
    updateProfile(profile) {
      return withPersist(() => memoryStore.updateProfile(profile));
    },
    getPantry() {
      return memoryStore.getPantry();
    },
    updatePantry(items) {
      return withPersist(() => memoryStore.updatePantry(items));
    },
    getGroupPlan() {
      return memoryStore.getGroupPlan();
    },
    updateGroupPlan(groupPlan) {
      return withPersist(() => memoryStore.updateGroupPlan(groupPlan));
    },
    saveReminder(reminder) {
      return withPersist(() => memoryStore.saveReminder(reminder));
    },
    getReminders(sessionId) {
      return memoryStore.getReminders(sessionId);
    },
    getAccessSubmissionState() {
      return memoryStore.getAccessSubmissionState();
    },
    updateAccessSubmissionState(state) {
      return withPersist(() => memoryStore.updateAccessSubmissionState(state));
    },
    getCredentialIssuanceState() {
      return memoryStore.getCredentialIssuanceState();
    },
    updateCredentialIssuanceState(state) {
      return withPersist(() => memoryStore.updateCredentialIssuanceState(state));
    },
    clearUserData() {
      return withPersist(() => memoryStore.clearUserData());
    },
    getSnapshot() {
      return memoryStore.getSnapshot();
    },
    replaceSnapshot(snapshot) {
      return withPersist(() => memoryStore.replaceSnapshot(snapshot));
    },
    compact(options) {
      return withPersist(() => memoryStore.compact(options));
    },
    getDiagnostics() {
      return {
        ...memoryStore.getDiagnostics(),
        kind: "file",
        durable: true,
        dataFile: resolvedPath,
      };
    },
  };
}
