/**
 * API utility module to handle communication with the Go backend API.
 * Uses fetch to send JSON requests and parse responses.
 * Supports request cancellation via AbortController.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888";

/** Represents the standard error shape returned by the API */
export interface ApiError {
  detail: string;
}

/** Supported binary operations requiring two operands */
export type Operator = "+" | "-" | "*" | "/" | "pow";
/** Supported unary operations requiring only one operand */
export type UnaryOperator = "sqrt" | "square" | "negate";

/**
 * Creates a new AbortController for request cancellation.
 * @returns A new AbortController instance.
 */
export const createAbortController = (): AbortController =>
  new AbortController();

/**
 * Calls a backend endpoint for a binary operation.
 * @param a The first operand.
 * @param b The second operand.
 * @param op The mathematical operator.
 * @param signal Optional AbortSignal for cancellation.
 * @returns A promise resolving to the calculated number.
 */
export const callBinaryOp = async (
  a: number,
  b: number,
  op: Operator,
  signal?: AbortSignal,
): Promise<number> => {
  const operations: Record<Operator, string> = {
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
    pow: "power",
  };

  const response = await fetch(`${API_URL}/${operations[op]}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a, b }),
    signal,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.detail || "An unknown error occurred.");
  }

  const data = await response.json();
  return data.result;
};

/**
 * Calls a backend endpoint for a unary operation.
 * @param value The operand.
 * @param op The mathematical unary operator.
 * @param signal Optional AbortSignal for cancellation.
 * @returns A promise resolving to the calculated result.
 */
export const callUnaryOp = async (
  value: number,
  op: UnaryOperator,
  signal?: AbortSignal,
): Promise<number> => {
  const response = await fetch(`${API_URL}/${op}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
    signal,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.detail || "An unknown error occurred.");
  }

  const data = await response.json();
  return data.result;
};

/**
 * Calls a backend endpoint for calculating a percentage value.
 * @param value The base value.
 * @param percent The percentage value to calculate against the base.
 * @param signal Optional AbortSignal for cancellation.
 * @returns A promise resolving to the computed percentage amount.
 */
export const callPercentage = async (
  value: number,
  percent: number,
  signal?: AbortSignal,
): Promise<number> => {
  const response = await fetch(`${API_URL}/percentage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value, percent }),
    signal,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.detail || "An unknown error occurred.");
  }

  const data = await response.json();
  return data.result;
};

/**
 * Fetches the mathematical constant Pi from the backend.
 * @param signal Optional AbortSignal for cancellation.
 * @returns A promise resolving to Pi.
 */
export const fetchPi = async (signal?: AbortSignal): Promise<number> => {
  const response = await fetch(`${API_URL}/pi`, { signal });
  if (!response.ok) {
    throw new Error("Failed to fetch Pi value.");
  }
  const data = await response.json();
  return data.result;
};
