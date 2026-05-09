import { describe, expect, it, vi } from "vitest";
import { isBlindRetryAllowed, retryWithBackoff } from "./retry";

describe("Swiggy retry policy", () => {
  it("does not blind-retry order placement class tools", () => {
    expect(isBlindRetryAllowed("order_placement")).toBe(false);
    expect(isBlindRetryAllowed("read")).toBe(true);
  });

  it("retries retriable read failures with backoff", async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(Object.assign(new Error("upstream"), { status: 502 }))
      .mockResolvedValueOnce("ok");

    await expect(
      retryWithBackoff(fn, {
        toolClass: "read",
        sleep: async () => undefined,
      }),
    ).resolves.toBe("ok");

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("surfaces order placement failures instead of retrying blindly", async () => {
    const fn = vi.fn<() => Promise<string>>().mockRejectedValue(Object.assign(new Error("timeout"), { status: 504 }));

    await expect(
      retryWithBackoff(fn, {
        toolClass: "order_placement",
        sleep: async () => undefined,
      }),
    ).rejects.toThrow("timeout");

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
