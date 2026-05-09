export interface PkcePair {
  verifier: string;
  challenge: string;
}

function base64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return btoa(String.fromCharCode(...view))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createPkcePair(): Promise<PkcePair> {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64Url(verifierBytes);
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return {
    verifier,
    challenge: base64Url(digest),
  };
}

export function buildSwiggyAuthorizeUrl(options: {
  clientId: string;
  redirectUri: string;
  challenge: string;
  state: string;
  scope?: string;
  baseUrl?: string;
}) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    code_challenge: options.challenge,
    code_challenge_method: "S256",
    state: options.state,
    scope: options.scope ?? "mcp:tools mcp:resources mcp:prompts",
  });

  return `${options.baseUrl ?? "https://mcp.swiggy.com"}/auth/authorize?${params.toString()}`;
}
