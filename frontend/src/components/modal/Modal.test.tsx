import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "./Modal";

describe("Modal component", () => {
  it("does not render when show is false", () => {
    const { container } = render(
      <Modal show={false} onClose={() => {}} title="Test Modal">
        <p>Modal Content</p>
      </Modal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders content when show is true", () => {
    render(
      <Modal show={true} onClose={() => {}} title="Test Modal">
        <p>Modal Content</p>
      </Modal>,
    );
    expect(screen.getByText("Test Modal")).toBeDefined();
    expect(screen.getByText("Modal Content")).toBeDefined();
  });

  it("calls onClose when overlay is clicked", () => {
    const onCloseMock = vi.fn();
    render(
      <Modal show={true} onClose={onCloseMock} title="Test Modal">
        <p>Modal Content</p>
      </Modal>,
    );

    // The overlay is the first element with class 'modal-overlay'
    const overlay = document.querySelector(".modal-overlay");
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    const onCloseMock = vi.fn();
    render(
      <Modal show={true} onClose={onCloseMock} title="Test Modal">
        <p>Modal Content</p>
      </Modal>,
    );

    const closeBtn = document.querySelector(".modal-close-button");
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
