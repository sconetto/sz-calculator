import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callBinaryOp, callUnaryOp, callPercentage, fetchPi } from "./api";

describe("API utils", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockFetchSuccess = (result: number) => {
    return vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result }),
    });
  };

  const mockFetchError = (detail: string) => {
    return vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail }),
    });
  };

  describe("callBinaryOp", () => {
    it("calls add endpoint successfully", async () => {
      vi.stubGlobal("fetch", mockFetchSuccess(15));
      const res = await callBinaryOp(10, 5, "+");
      expect(res).toBe(15);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/add"),
        expect.any(Object),
      );
    });

    it("throws error on failure", async () => {
      vi.stubGlobal("fetch", mockFetchError("Division by zero"));
      await expect(callBinaryOp(10, 0, "/")).rejects.toThrow(
        "Division by zero",
      );
    });
  });

  describe("callUnaryOp", () => {
    it("calls negate endpoint successfully", async () => {
      vi.stubGlobal("fetch", mockFetchSuccess(-5));
      const res = await callUnaryOp(5, "negate");
      expect(res).toBe(-5);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/negate"),
        expect.any(Object),
      );
    });

    it("throws error on failure", async () => {
      vi.stubGlobal("fetch", mockFetchError("Invalid number"));
      await expect(callUnaryOp(-1, "sqrt")).rejects.toThrow("Invalid number");
    });
  });

  describe("callPercentage", () => {
    it("calls percentage endpoint successfully", async () => {
      vi.stubGlobal("fetch", mockFetchSuccess(15));
      const res = await callPercentage(100, 15);
      expect(res).toBe(15);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/percentage"),
        expect.any(Object),
      );
    });
  });

  describe("fetchPi", () => {
    it("calls pi endpoint successfully", async () => {
      vi.stubGlobal("fetch", mockFetchSuccess(3.14159));
      const res = await fetchPi();
      expect(res).toBe(3.14159);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/pi"),
        expect.any(Object),
      );
    });
  });
});
