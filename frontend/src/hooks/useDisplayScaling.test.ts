import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useDisplayScaling } from "./useDisplayScaling";

describe("useDisplayScaling", () => {
  it("should return 1 for a short string", () => {
    const { result } = renderHook(() => useDisplayScaling("1234"));
    expect(result.current).toBe(1);
  });

  it("should return 0.85 for string length > 8", () => {
    const { result } = renderHook(() => useDisplayScaling("123456789"));
    expect(result.current).toBe(0.85);
  });

  it("should return 0.7 for string length > 10", () => {
    const { result } = renderHook(() => useDisplayScaling("12345678901"));
    expect(result.current).toBe(0.7);
  });

  it("should return 0.6 for string length > 12", () => {
    const { result } = renderHook(() => useDisplayScaling("1234567890123"));
    expect(result.current).toBe(0.6);
  });

  it("should update scale when string length changes", () => {
    const { result, rerender } = renderHook(
      ({ display }) => useDisplayScaling(display),
      {
        initialProps: { display: "1" },
      },
    );
    expect(result.current).toBe(1);

    rerender({ display: "1234567890123" });
    expect(result.current).toBe(0.6);

    rerender({ display: "1234" });
    expect(result.current).toBe(1);
  });
});
