import { useState, useCallback, useEffect, useRef } from "react";
import {
  callBinaryOp,
  callUnaryOp,
  callPercentage,
  fetchPi,
  createAbortController,
  Operator,
  UnaryOperator,
} from "@/utils/api";

const MAX_HISTORY_SIZE = 50;

/**
 * Truncates history to max size, keeping most recent entries.
 */
const truncateHistory = (history: string[]): string[] => {
  if (history.length > MAX_HISTORY_SIZE) {
    return history.slice(history.length - MAX_HISTORY_SIZE);
  }
  return history;
};

/**
 * useCalculator is a custom React hook that encapsulates all state and logic
 * for the calculator. It handles user input, communicates with the backend API
 * for mathematical operations, and manages calculation history and errors.
 * Includes request cancellation, history size limits, and debouncing.
 *
 * @returns An object containing all state variables and handler functions needed by the UI.
 */
export const useCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isFreshInput, setIsFreshInput] = useState(true);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [animateDisplay, setAnimateDisplay] = useState(false);
  const [subDisplay, setSubDisplay] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const storedHistory = sessionStorage.getItem("calculator-history");
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) {
          setHistory(truncateHistory(parsed));
        }
      } catch {
        sessionStorage.removeItem("calculator-history");
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Adds a calculation entry to the history and persists it to sessionStorage.
   * Automatically truncates history if it exceeds MAX_HISTORY_SIZE.
   * @param calculation The calculation string to add (e.g., "5 + 3 = 8")
   */
  const addToHistory = useCallback((calculation: string) => {
    setHistory((prev) => {
      const newHistory = truncateHistory([...prev, calculation]);
      sessionStorage.setItem("calculator-history", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  /**
   * Clears all calculation history from state and sessionStorage.
   * Shows a temporary success message before closing the history modal.
   */
  const clearHistory = useCallback(() => {
    setIsClearingHistory(true);
    setHistory([]);
    sessionStorage.removeItem("calculator-history");
    setTimeout(() => {
      setIsClearingHistory(false);
      setHistoryModalOpen(false);
    }, 1500);
  }, []);

  /**
   * Handles digit button presses. Appends the digit to the current display
   * or starts fresh input if waiting for a new operand. Prevents multiple decimal points.
   * @param digit The digit or decimal point character to input
   */
  const inputDigit = useCallback(
    (digit: string) => {
      setAnimateDisplay(true);
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        if (digit === "." && display.includes(".")) return;
        setDisplay((prev) =>
          prev === "0" && digit !== "." ? digit : prev + digit,
        );
      }
      setIsFreshInput(false);

      setTimeout(() => setAnimateDisplay(false), 200);
    },
    [display, waitingForOperand],
  );

  /**
   * Resets the entire calculator state: clears display, removes previous value,
   * operator, and sub-display. Also aborts any pending API requests.
   */
  const clearAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setIsFreshInput(true);
    setSubDisplay("");
  }, []);

  /**
   * Clears only the current display entry (sets to '0') while preserving
   * the previous value and operator for continued calculation.
   */
  const clearEntry = useCallback(() => {
    setDisplay("0");
    setIsFreshInput(true);
  }, []);

  /**
   * Removes the last digit from the current display.
   * If only one digit remains, resets to '0'.
   */
  const handleBackspace = useCallback(() => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  }, []);

  /**
   * Handles binary operation button presses (+, -, *, /, ^).
   * If a previous operation exists, executes it before setting the new operator.
   * Uses AbortController to cancel any pending requests.
   * @param nextOperator The binary operator to apply
   */
  const performOperation = async (nextOperator: Operator) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setSubDisplay(`${display} ${nextOperator}`);
    } else if (operator) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = createAbortController();

      setIsLoading(true);
      try {
        const result = await callBinaryOp(
          prevValue,
          inputValue,
          operator,
          abortControllerRef.current.signal,
        );
        addToHistory(`${prevValue} ${operator} ${inputValue} = ${result}`);
        setDisplay(String(result));
        setPrevValue(result);
        setSubDisplay(`${result} ${nextOperator}`);
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  /**
   * Executes a unary operation (sqrt, square, negate) immediately.
   * Cancels any pending requests before executing.
   * @param op The unary operation to perform
   */
  const performUnaryOperation = async (op: UnaryOperator) => {
    const inputValue = parseFloat(display);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = createAbortController();

    setIsLoading(true);
    try {
      const result = await callUnaryOp(
        inputValue,
        op,
        abortControllerRef.current.signal,
      );
      const opDisplay =
        op === "sqrt"
          ? `√(${inputValue})`
          : op === "square"
            ? `${inputValue}²`
            : `-${inputValue}`;
      addToHistory(`${opDisplay} = ${result}`);
      setSubDisplay(opDisplay);
      setDisplay(String(result));
      setWaitingForOperand(true);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Executes the pending binary operation and displays the final result.
   * Adds the complete calculation to history.
   * Cancels any pending requests before executing.
   */
  const handleEqual = useCallback(async () => {
    if (!operator || prevValue === null) return;

    const inputValue = parseFloat(display);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = createAbortController();

    setIsLoading(true);
    try {
      const result = await callBinaryOp(
        prevValue,
        inputValue,
        operator,
        abortControllerRef.current.signal,
      );
      addToHistory(`${prevValue} ${operator} ${inputValue} = ${result}`);
      setSubDisplay(`${prevValue} ${operator} ${inputValue}`);
      setDisplay(String(result));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [operator, prevValue, display, addToHistory]);

  /**
   * Toggles the sign of the current display value (positive/negative).
   * Uses the backend negate endpoint via unary operation.
   */
  const handleInvert = async () => {
    const currentValue = parseFloat(display);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = createAbortController();

    setIsLoading(true);
    try {
      const result = await callUnaryOp(
        currentValue,
        "negate",
        abortControllerRef.current.signal,
      );
      setDisplay(String(result));
      if (waitingForOperand) {
        setWaitingForOperand(false);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculates the percentage of the current value.
   * If a binary operator is active, calculates percentage of the previous value.
   * Otherwise, calculates simple percentage (e.g., 50% = 0.5 * value).
   * Uses the backend percentage endpoint.
   */
  const handlePercentage = async () => {
    const currentValue = parseFloat(display);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = createAbortController();

    setIsLoading(true);
    try {
      if (operator && prevValue !== null) {
        const result = await callPercentage(
          prevValue,
          currentValue,
          abortControllerRef.current.signal,
        );
        setSubDisplay(`${prevValue} ${operator} ${result}`);
        setDisplay(String(result));
      } else {
        const result = await callPercentage(
          1,
          currentValue,
          abortControllerRef.current.signal,
        );
        setSubDisplay(`${currentValue}%`);
        setDisplay(String(result));
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inserts the mathematical constant Pi (π) into the display.
   * Fetches the value from the backend API.
   */
  const handlePi = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = createAbortController();

    setIsLoading(true);
    try {
      const result = await fetchPi(abortControllerRef.current.signal);
      setDisplay(String(result));
      setWaitingForOperand(true);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    display,
    subDisplay,
    isFreshInput,
    isHelpModalOpen,
    setHelpModalOpen,
    isHistoryModalOpen,
    setHistoryModalOpen,
    history,
    error,
    setError,
    isClearingHistory,
    animateDisplay,
    isLoading,
    inputDigit,
    clearAll,
    clearEntry,
    handleBackspace,
    performOperation,
    performUnaryOperation,
    handleEqual,
    handleInvert,
    handlePercentage,
    handlePi,
    clearHistory,
  };
};
