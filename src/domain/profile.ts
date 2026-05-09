import type { UserProfile } from "./types.js";

export const defaultUserProfile: UserProfile = {
  id: "profile_demo",
  name: "Farhan",
  householdSize: 2,
  defaultCity: "Bengaluru",
  defaultBudget: 2000,
  diet: "high-protein vegetarian",
  allergies: ["none"],
  dislikes: ["mushroom"],
  favoriteCuisines: ["North Indian", "Italian", "Healthy bowls"],
  spicePreference: "medium",
  addressLabel: "Home",
  consentToStorePreferences: true,
};

export function normalizeListInput(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
