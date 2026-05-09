import type { GroupPlan, MealPlan, PantryItem, Reminder, UserProfile } from "../../src/domain/types.js";
import { defaultUserProfile } from "../../src/domain/profile.js";

export interface AuthSession {
  state: string;
  verifier: string;
  challenge: string;
  createdAt: string;
  accessToken?: string;
  expiresAt?: string;
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
  clearUserData(): void;
}

export function createMemorySessionStore(): SessionStore {
  const plans = new Map<string, MealPlan>();
  const authSessions = new Map<string, AuthSession>();
  const reminders = new Map<string, Reminder>();
  let profile = defaultUserProfile;
  let pantry: PantryItem[] = [
    { id: "pantry_tofu", name: "Tofu", category: "protein", currentQty: 1, targetQty: 3, unit: "pack", estimatedPrice: 160 },
    { id: "pantry_dal", name: "Moong dal", category: "staple", currentQty: 0.5, targetQty: 2, unit: "kg", estimatedPrice: 180 },
    { id: "pantry_yogurt", name: "Greek yogurt", category: "dairy", currentQty: 0, targetQty: 2, unit: "tub", estimatedPrice: 210 },
    { id: "pantry_spinach", name: "Spinach", category: "produce", currentQty: 0, targetQty: 2, unit: "bunch", estimatedPrice: 70 },
  ];
  let groupPlan: GroupPlan = {
    members: [
      { id: "member_farhan", name: "Farhan", diet: "high-protein vegetarian", allergies: [], budget: 600 },
      { id: "member_guest", name: "Guest", diet: "vegetarian", allergies: ["peanut"], budget: 500 },
    ],
    combinedBudget: 1100,
    constraints: ["vegetarian", "peanut-safe"],
    recommendation: "Choose high-protein bowls and keep dessert optional until everyone confirms.",
  };

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
    clearUserData() {
      plans.clear();
      authSessions.clear();
      reminders.clear();
      profile = defaultUserProfile;
      pantry = [];
      groupPlan = {
        members: [],
        combinedBudget: 0,
        constraints: [],
        recommendation: "No group plan yet.",
      };
    },
  };
}
