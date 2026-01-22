"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { createPortal } from "react-dom";

import styles from "./Modal.module.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function Modal(props: ModalProps) {
  const { isOpen, onClose, children, title } = props;
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const element = contentRef.current as HTMLDivElement | null;
    element?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div className={styles.content} ref={contentRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Закрыть модальное окно">
          ×
        </button>
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
