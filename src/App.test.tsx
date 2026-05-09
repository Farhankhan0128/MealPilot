import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { confirmRecommendation, createMealPlan } from "./domain/planner";
import type { MealPlan, UserPlanningRequest } from "./domain/types";

const request: UserPlanningRequest = {
  prompt:
    "Plan my high-protein vegetarian week under Rs 2,000. I need lunch today, dinner groceries, and Dineout.",
  city: "Bengaluru",
  budget: 2000,
  diet: "high-protein vegetarian",
  guests: 4,
  day: "saturday",
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("MealPilot app", () => {
  let plan: MealPlan;

  beforeEach(async () => {
    plan = await createMealPlan(request);
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/health") {
          return jsonResponse({
            ok: true,
            appName: "MealPilot India",
            mode: "mock",
            hasClientId: false,
            time: new Date().toISOString(),
          });
        }
        if (url === "/api/plan" && init?.method === "POST") {
          return jsonResponse({ plan, meta: { userIdHash: "sha256:test", storedServerSide: true } }, 201);
        }
        if (url === "/api/confirm" && init?.method === "POST") {
          return jsonResponse({ plan: confirmRecommendation(plan, "rec_food") });
        }
        return jsonResponse({ error: { message: "Not found" } }, 404);
      }),
    );
  });

  it("loads a server-generated plan and confirms through the API", async () => {
    render(<App />);

    expect(await screen.findByText("Paneer protein bowl")).toBeInTheDocument();
    expect(await screen.findByText("Live")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm action" }));

    await waitFor(() => expect(screen.getByText("Confirmed")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith("/api/confirm", expect.objectContaining({ method: "POST" }));
  });
});
