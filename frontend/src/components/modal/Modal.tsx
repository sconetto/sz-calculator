import React, { useEffect, useState, useRef } from "react";
import "./Modal.css";

/**
 * Props for the Modal component.
 */
interface ModalProps {
  show: boolean; // Controls whether the modal is visible or hidden.
  onClose: () => void; // Callback function when the user tries to close the modal.
  title: string; // The modal title displayed at the top.
  children: React.ReactNode; // The content rendered within the modal body.
}

/**
 * Modal is a generic reusable UI component for pop-ups.
 * It features enter/exit animations and focus trapping for accessibility.
 */
const Modal: React.FC<ModalProps> = ({ show, onClose, title, children }) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (show) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  useEffect(() => {
    if (show && shouldRender && !isAnimating) {
      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusable[0] as HTMLElement;
        const lastElement = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      };

      modal.addEventListener("keydown", handleKeyDown);
      return () => modal.removeEventListener("keydown", handleKeyDown);
    }
  }, [show, shouldRender, isAnimating]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`modal-overlay ${isAnimating ? "modal-open" : "modal-closed"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`modal-content ${isAnimating ? "modal-content-open" : "modal-content-closed"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="modal-close-button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
