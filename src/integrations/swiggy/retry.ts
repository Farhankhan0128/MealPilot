export type ToolClass = "read" | "cart_mutation" | "coupon" | "tracking" | "order_placement";

export interface RetryableError extends Error {
  status?: number;
  code?: string;
}

export function isRetryableError(error: RetryableError): boolean {
  if (error.status === 429) return true;
  if (error.status && error.status >= 500 && error.status < 600) return true;
  return ["UPSTREAM_TIMEOUT", "UPSTREAM_ERROR", "INTERNAL_ERROR"].includes(error.code ?? "");
}

export function isBlindRetryAllowed(toolClass: ToolClass): boolean {
  return toolClass !== "order_placement";
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    toolClass: ToolClass;
    maxAttempts?: number;
    sleep?: (ms: number) => Promise<void>;
  },
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 4;
  const sleep = options.sleep ?? ((ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms)));

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      const typedError = error as RetryableError;
      const finalAttempt = attempt === maxAttempts;

      if (finalAttempt || !isRetryableError(typedError) || !isBlindRetryAllowed(options.toolClass)) {
        throw typedError;
      }

      const baseMs = 500 * 2 ** (attempt - 1);
      await sleep(baseMs);
    }
  }

  throw new Error("Retry loop exhausted unexpectedly.");
}
