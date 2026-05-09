import type { MealPlan, UserProfile } from "../../src/domain/types.js";
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
}

export function createMemorySessionStore(): SessionStore {
  const plans = new Map<string, MealPlan>();
  const authSessions = new Map<string, AuthSession>();
  let profile = defaultUserProfile;

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
  };
}
