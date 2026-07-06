import type { SwiggyServer } from "../../domain/types.js";

export type SwiggyEnvironment = "mock" | "staging" | "production";

export const swiggyEndpoints: Record<Exclude<SwiggyEnvironment, "mock">, Record<SwiggyServer, string>> = {
  staging: {
    food: "https://mcp-staging.swiggy.com/food",
    instamart: "https://mcp-staging.swiggy.com/im",
    dineout: "https://mcp-staging.swiggy.com/dineout",
  },
  production: {
    food: "https://mcp.swiggy.com/food",
    instamart: "https://mcp.swiggy.com/im",
    dineout: "https://mcp.swiggy.com/dineout",
  },
};

export interface RawMcpToolCall {
  server: SwiggyServer;
  tool: string;
  arguments?: Record<string, unknown>;
  accessToken: string;
  environment: Exclude<SwiggyEnvironment, "mock">;
}

export interface RawMcpJsonRpcCall {
  server: SwiggyServer;
  request: Record<string, unknown>;
  accessToken: string;
  environment: Exclude<SwiggyEnvironment, "mock">;
}

export async function callSwiggyJsonRpc<T>(call: RawMcpJsonRpcCall): Promise<T> {
  const response = await fetch(swiggyEndpoints[call.environment][call.server], {
    method: "POST",
    headers: {
      Authorization: `Bearer ${call.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(call.request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw Object.assign(new Error(message || `Swiggy MCP call failed with ${response.status}`), {
      status: response.status,
    });
  }

  return (await response.json()) as T;
}

export async function callSwiggyTool<T>(call: RawMcpToolCall): Promise<T> {
  return callSwiggyJsonRpc<T>({
    environment: call.environment,
    server: call.server,
    accessToken: call.accessToken,
    request: {
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method: "tools/call",
      params: {
        name: call.tool,
        arguments: call.arguments ?? {},
      },
    },
  });
}
