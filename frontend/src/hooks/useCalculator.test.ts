import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCalculator } from "./useCalculator";
import * as api from "@/utils/api";

vi.mock("@/utils/api", () => ({
  callBinaryOp: vi.fn(),
  callUnaryOp: vi.fn(),
  callPercentage: vi.fn(),
  fetchPi: vi.fn(),
  createAbortController: vi.fn(() => ({ signal: undefined, abort: vi.fn() })),
}));

describe("useCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useCalculator());
    expect(result.current.display).toBe("0");
    expect(result.current.subDisplay).toBe("");
    expect(result.current.history).toEqual([]);
  });

  it("handles digit input", () => {
    const { result } = renderHook(() => useCalculator());
    act(() => {
      result.current.inputDigit("5");
    });
    expect(result.current.display).toBe("5");
    act(() => {
      result.current.inputDigit("2");
    });
    expect(result.current.display).toBe("52");
  });

  it("handles backspace", () => {
    const { result } = renderHook(() => useCalculator());
    act(() => {
      result.current.inputDigit("5");
      result.current.inputDigit("2");
    });
    expect(result.current.display).toBe("52");
    act(() => {
      result.current.handleBackspace();
    });
    expect(result.current.display).toBe("5");
    act(() => {
      result.current.handleBackspace();
    });
    expect(result.current.display).toBe("0");
  });

  it("handles clearAll", () => {
    const { result } = renderHook(() => useCalculator());
    act(() => {
      result.current.inputDigit("5");
    });
    expect(result.current.display).toBe("5");
    act(() => {
      result.current.clearAll();
    });
    expect(result.current.display).toBe("0");
    expect(result.current.isFreshInput).toBe(true);
  });

  it("performs basic binary operations successfully", async () => {
    vi.mocked(api.callBinaryOp).mockResolvedValue(10);
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("5");
    });

    await act(async () => {
      await result.current.performOperation("+");
    });

    expect(result.current.subDisplay).toBe("5 +");

    act(() => {
      result.current.inputDigit("5");
    });

    await act(async () => {
      await result.current.handleEqual();
    });

    expect(api.callBinaryOp).toHaveBeenCalled();
    expect(result.current.display).toBe("10");
    expect(result.current.subDisplay).toBe("5 + 5");
    expect(result.current.history).toHaveLength(1);
  });

  it("performs unary operations successfully", async () => {
    vi.mocked(api.callUnaryOp).mockResolvedValue(-5);
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("5");
    });

    await act(async () => {
      await result.current.performUnaryOperation("negate");
    });

    expect(api.callUnaryOp).toHaveBeenCalled();
    expect(result.current.display).toBe("-5");
  });

  it("handles pi fetch", async () => {
    vi.mocked(api.fetchPi).mockResolvedValue(3.14159);
    const { result } = renderHook(() => useCalculator());

    await act(async () => {
      await result.current.handlePi();
    });

    expect(api.fetchPi).toHaveBeenCalled();
    expect(result.current.display).toBe("3.14159");
  });

  it("handles errors properly", async () => {
    vi.mocked(api.callUnaryOp).mockRejectedValue(
      new Error("Calculation error"),
    );
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("-1");
    });

    await act(async () => {
      await result.current.performUnaryOperation("sqrt");
    });

    expect(result.current.error).toBe("Calculation error");
  });
});
