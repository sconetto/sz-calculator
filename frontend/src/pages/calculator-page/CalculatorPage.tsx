import React from "react";
import { Modal } from "@/components/modal";
import { useCalculator, useDisplayScaling } from "@/hooks";
import "./CalculatorPage.css";

/**
 * CalculatorPage is the main component representing the calculator UI.
 * It integrates the custom `useCalculator` hook for logic and state,
 * and handles user interactions (button clicks, ripples) and modals.
 */
const CalculatorPage: React.FC = () => {
  const {
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
  } = useCalculator();

  const displayScale = useDisplayScaling(display);

  /**
   * Generates a material-UI style ripple animation on button click.
   * @param event The mouse click event on the button.
   */
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    const rect = button.getBoundingClientRect();
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];

    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  /**
   * Higher-order function that handles generic button clicks (operations, functions)
   * by first triggering the ripple effect, and then calling the provided handler.
   */
  const handleButtonClick =
    (handler: Function) => (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      handler();
    };

  /**
   * Higher-order function that handles digit inputs (0-9, commas)
   * by triggering the ripple effect, and then pushing the digit to the state.
   */
  const handleDigitClick =
    (digit: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      inputDigit(digit);
    };

  return (
    <div className="calculator-page-container">
      <div className="top-buttons">
        <button
          onClick={() => setHistoryModalOpen(true)}
          className="history-button"
          aria-label="History"
        >
          <i className="fa-solid fa-clock-rotate-left"></i>
        </button>
        <button
          onClick={() => setHelpModalOpen(true)}
          className="help-button"
          aria-label="Help"
        >
          <i className="fa-solid fa-question"></i>
        </button>
      </div>

      <div className="calculator-container">
        {isLoading && (
          <div className="loading-overlay" aria-label="Loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        <Modal
          show={isHelpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          title="How to use the calculator"
        >
          <p>1. Enter a number using the digit buttons (manual input is disabled).</p>
          <p>2. Click an operation button (e.g., +, -, ×, ÷).</p>
          <p>3. Enter another number.</p>
          <p>
            4. Click '=' to see the result, or click another operation for
            chained calculations.
          </p>
          <p>
            5. Press C/AC (clear digit, clear operation) to clear a number
            or start a new operation.
          </p>
          <p>
            6. History calculations are present in the top-left corner of the
            calculator (history clean-up available).
          </p>
        </Modal>

        <Modal
          show={isHistoryModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          title="Calculation History"
        >
          {isClearingHistory ? (
            <div className="success-message">
              <i className="fa-solid fa-circle-check"></i>
              <p>History cleared successfully!</p>
            </div>
          ) : history.length === 0 ? (
            <p>No history yet.</p>
          ) : (
            <>
              <div className="history-list">
                {history.map((item, index) => {
                  const [calculation, result] = item.split(" = ");
                  return (
                    <div key={index} className="history-item">
                      <div className="history-calc">{calculation}</div>
                      <div className="history-result">{result}</div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={clearHistory}
                className="clear-history-button"
                aria-label="Clear All History"
              >
                <i className="fa-solid fa-trash-can"></i> Clear All
              </button>
            </>
          )}
        </Modal>

        <Modal
          show={error !== null}
          onClose={() => setError(null)}
          title="Error"
        >
          <p>{error}</p>
        </Modal>

        <div className="sub-display">{subDisplay}</div>
        <div
          className={`display ${animateDisplay ? "display-animate" : ""}`}
          style={{
            fontSize: `calc(var(--display-font-size) * ${displayScale})`,
          }}
        >
          {display}
        </div>
        <div className="keypad">
          <button
            onClick={handleButtonClick(handleBackspace)}
            className="function"
            aria-label="Backspace"
          >
            ⌫
          </button>
          <button
            onClick={handleButtonClick(isFreshInput ? clearAll : clearEntry)}
            className="function"
            aria-label="Clear"
          >
            {isFreshInput ? "AC" : "C"}
          </button>
          <button
            onClick={handleButtonClick(handlePercentage)}
            className="function"
            aria-label="Percentage"
          >
            %
          </button>
          <button
            onClick={handleButtonClick(handlePi)}
            className="function"
            aria-label="Pi"
          >
            π
          </button>

          <button
            onClick={handleButtonClick(() => performUnaryOperation("sqrt"))}
            className="function"
            aria-label="Square Root"
          >
            <i className="fa-solid fa-square-root-variable"></i>
          </button>
          <button
            onClick={handleButtonClick(() => performOperation("pow"))}
            className="function"
            aria-label="Power"
          >
            xʸ
          </button>
          <button
            onClick={handleButtonClick(() => performUnaryOperation("square"))}
            className="function"
            aria-label="Square"
          >
            x²
          </button>
          <button
            onClick={handleButtonClick(() => performOperation("/"))}
            className="operator"
            aria-label="Divide"
          >
            <i className="fa-solid fa-divide"></i>
          </button>

          <button
            onClick={handleDigitClick("7")}
            className="digit"
            aria-label="7"
          >
            7
          </button>
          <button
            onClick={handleDigitClick("8")}
            className="digit"
            aria-label="8"
          >
            8
          </button>
          <button
            onClick={handleDigitClick("9")}
            className="digit"
            aria-label="9"
          >
            9
          </button>
          <button
            onClick={handleButtonClick(() => performOperation("*"))}
            className="operator"
            aria-label="Multiply"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <button
            onClick={handleDigitClick("4")}
            className="digit"
            aria-label="4"
          >
            4
          </button>
          <button
            onClick={handleDigitClick("5")}
            className="digit"
            aria-label="5"
          >
            5
          </button>
          <button
            onClick={handleDigitClick("6")}
            className="digit"
            aria-label="6"
          >
            6
          </button>
          <button
            onClick={handleButtonClick(() => performOperation("-"))}
            className="operator"
            aria-label="Subtract"
          >
            <i className="fa-solid fa-minus"></i>
          </button>

          <button
            onClick={handleDigitClick("1")}
            className="digit"
            aria-label="1"
          >
            1
          </button>
          <button
            onClick={handleDigitClick("2")}
            className="digit"
            aria-label="2"
          >
            2
          </button>
          <button
            onClick={handleDigitClick("3")}
            className="digit"
            aria-label="3"
          >
            3
          </button>
          <button
            onClick={handleButtonClick(() => performOperation("+"))}
            className="operator"
            aria-label="Add"
          >
            <i className="fa-solid fa-plus"></i>
          </button>

          <button
            onClick={handleButtonClick(handleInvert)}
            className="function"
            aria-label="Invert Sign"
          >
            <i className="fa-solid fa-plus-minus"></i>
          </button>
          <button
            onClick={handleDigitClick("0")}
            className="digit"
            aria-label="0"
          >
            0
          </button>
          <button
            onClick={handleDigitClick(".")}
            className="digit"
            aria-label="Comma"
          >
            ,
          </button>
          <button
            onClick={handleButtonClick(handleEqual)}
            className="operator"
            aria-label="Equals"
          >
            <i className="fa-solid fa-equals"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
