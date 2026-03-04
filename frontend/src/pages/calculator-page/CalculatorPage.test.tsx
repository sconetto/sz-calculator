import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CalculatorPage from "./CalculatorPage";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("alert", vi.fn());
  vi.stubGlobal("sessionStorage", {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CalculatorPage", () => {
  it("renders calculator with display and buttons", () => {
    render(<CalculatorPage />);
    expect(screen.getByLabelText("Clear")).toBeDefined();
    expect(document.querySelector(".display")).toBeDefined();
    expect(screen.getByLabelText("1")).toBeDefined();
  });

  it("displays digit when button is clicked", () => {
    render(<CalculatorPage />);
    const button = screen.getByLabelText("5");
    fireEvent.click(button);
    const display = document.querySelector(".display");
    expect(display?.textContent).toBe("5");
  });

  it("clears display when AC is clicked", () => {
    render(<CalculatorPage />);
    const fiveButton = screen.getByLabelText("5");
    const clearButton = screen.getByLabelText("Clear");

    fireEvent.click(fiveButton);
    const display1 = document.querySelector(".display");
    expect(display1?.textContent).toBe("5");

    fireEvent.click(clearButton);
    const display2 = document.querySelector(".display");
    expect(display2?.textContent).toBe("0");
  });

  it("calls add endpoint when + is pressed", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 7 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<CalculatorPage />);

    fireEvent.click(screen.getByLabelText("3"));
    fireEvent.click(screen.getByLabelText("Add"));
    fireEvent.click(screen.getByLabelText("4"));
    fireEvent.click(screen.getByLabelText("Equals"));

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8888/add",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ a: 3, b: 4 }),
      }),
    );
  });

  it("opens history modal when history button is clicked", () => {
    render(<CalculatorPage />);
    const historyButton = screen.getByLabelText("History");
    fireEvent.click(historyButton);
    expect(screen.getByText("Calculation History")).toBeDefined();
  });

  it("opens help modal when help button is clicked", () => {
    render(<CalculatorPage />);
    const helpButton = screen.getByLabelText("Help");
    fireEvent.click(helpButton);
    expect(screen.getByText("How to use the calculator")).toBeDefined();
  });
});
