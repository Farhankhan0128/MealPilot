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

function textResponse(body: string, status = 200) {
  return Promise.resolve(
    new Response(body, {
      status,
      headers: { "Content-Type": "text/plain" },
    }),
  );
}

describe("MealPilot app", () => {
  let plan: MealPlan;

  beforeEach(async () => {
    plan = await createMealPlan(request);
    const popup = {
      opener: null as Window | null,
      location: { href: "" },
      close: vi.fn(),
    };
    vi.stubGlobal("open", vi.fn(() => popup));
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
        if (url === "/api/auth/swiggy/start" && init?.method === "POST") {
          return jsonResponse({
            authorizationUrl: "https://mcp.swiggy.com/oauth/authorize?client_id=mealpilot",
            mode: "mock",
            state: "state_test",
            verifierStoredServerSide: true,
            authStatus: {
              authorizeUrl: "https://mcp.swiggy.com/oauth/authorize",
              redirectUri: "http://localhost:8787/auth/swiggy/callback",
              scopes: ["mcp:food", "mcp:instamart", "mcp:dineout"],
              pendingVerifierCount: 1,
              latestEvent: {
                id: "auth_started",
                label: "Authorization started",
                status: "authorize_started",
                createdAt: new Date().toISOString(),
              },
              endpoints: {
                authorize: "https://mcp.swiggy.com/oauth/authorize",
                token: "https://mcp.swiggy.com/oauth/token",
                logout: "https://mcp.swiggy.com/oauth/logout",
              },
              gatewayAuth: {
                tokenSource: "none",
                expiresAt: null,
                hasAccessToken: false,
              },
              callbackChecklist: [
                { id: "pkce", label: "PKCE verifier", status: "ready" },
                { id: "state", label: "State check", status: "ready" },
              ],
              tokenStorageRules: [],
              supportNotes: [],
            },
          });
        }
        if (url === "/api/builder-package.md") {
          return textResponse("# MealPilot builder packet\n\nReady for Swiggy review.");
        }
        if (url === "/api/schedule" && init?.method === "POST") {
          return jsonResponse({
            reminders: [
              { id: "rem_1", label: "Confirm lunch", dueAt: new Date().toISOString(), channel: "in_app" },
              { id: "rem_2", label: "Check groceries", dueAt: new Date().toISOString(), channel: "in_app" },
            ],
          });
        }
        if (url === "/api/ops") {
          return jsonResponse({ status: [{ id: "api", label: "API", status: "ok" }] });
        }
        if (url === "/api/group/members" && init?.method === "POST") {
          return jsonResponse({
            groupPlan: {
              members: [{ id: "member_1", name: "Asha", diet: "vegetarian", allergies: ["none"], budget: 550 }],
              combinedBudget: 2550,
              recommendation: "Group plan balanced across preferences.",
            },
          });
        }
        if (url === "/api/privacy/export") {
          return jsonResponse({
            profile: {},
            pantry: [],
            groupPlan: { members: [], combinedBudget: 0, recommendation: "" },
            plans: [plan],
            reminders: [],
          });
        }
        if (url === "/api/support/report" && init?.method === "POST") {
          return jsonResponse({
            report: {
              id: "incident_test",
              summary: "Support packet ready.",
              mailto: "mailto:builders@swiggy.in?subject=MealPilot",
            },
          });
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

  it("renders the premium portal shell, mobile navigation, and CTA feedback", async () => {
    render(<App />);

    expect(await screen.findByText("Paneer protein bowl")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /MealPilot/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByText("Capability Traceability")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Matrix API" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: expect.stringContaining("/api/swiggy-capability-traceability") }),
      ]),
    );
    expect(screen.getByText("Homepage Signal Coverage")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Signal API" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: expect.stringContaining("/api/swiggy-homepage-signal-coverage") }),
      ]),
    );

    fireEvent.click(screen.getByRole("button", { name: /Menu/i }));
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toHaveClass("open");
    expect(screen.getAllByRole("link", { name: "Launch" }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Login with Swiggy/i }));
    expect(await screen.findByText("Swiggy authorization opened in a new tab.")).toBeInTheDocument();
    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");

    fireEvent.click(screen.getByRole("button", { name: /Export packet/i }));
    expect(await screen.findByText("Builder packet exported. Jump to Operating System to review the preview.")).toBeInTheDocument();
    expect(await screen.findByText(/MealPilot builder packet/)).toBeInTheDocument();
  }, 10000);

  it("shows feedback for operational CTAs instead of silent clicks", async () => {
    render(<App />);

    expect(await screen.findByText("Paneer protein bowl")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Schedule reminders/i }));
    expect(await screen.findByText("2 reminders scheduled for this plan.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Add demo member/i }));
    expect(await screen.findByText("Demo household member added to group planning.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Export privacy data/i }));
    expect(await screen.findByText("Privacy export generated in the Operating System preview.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Generate report/i }));
    expect(await screen.findByText("Support report generated with a ready email handoff.")).toBeInTheDocument();
  }, 15000);
});
