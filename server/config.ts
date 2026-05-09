export type SwiggyRuntimeMode = "mock" | "staging" | "production";

export interface ServerConfig {
  appName: string;
  port: number;
  swiggyMode: SwiggyRuntimeMode;
  swiggyClientId: string;
  swiggyRedirectUri: string;
  swiggyScope: string;
  swiggyBaseUrl: string;
}

function readMode(value: string | undefined): SwiggyRuntimeMode {
  if (value === "staging" || value === "production") return value;
  return "mock";
}

export function readConfig(): ServerConfig {
  const swiggyMode = readMode(process.env.SWIGGY_ENV ?? process.env.VITE_SWIGGY_ENV);

  return {
    appName: "MealPilot India",
    port: Number(process.env.PORT ?? 8787),
    swiggyMode,
    swiggyClientId:
      process.env.SWIGGY_CLIENT_ID ?? process.env.VITE_SWIGGY_CLIENT_ID ?? "replace_after_builder_access",
    swiggyRedirectUri:
      process.env.SWIGGY_REDIRECT_URI ??
      process.env.VITE_SWIGGY_REDIRECT_URI ??
      "http://localhost:5173/auth/swiggy/callback",
    swiggyScope: process.env.SWIGGY_SCOPE ?? process.env.VITE_SWIGGY_SCOPE ?? "mcp:tools mcp:resources mcp:prompts",
    swiggyBaseUrl:
      swiggyMode === "production" ? "https://mcp.swiggy.com" : "https://mcp-staging.swiggy.com",
  };
}
