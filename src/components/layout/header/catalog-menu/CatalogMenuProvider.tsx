"use client";

import { createContext, useCallback, useContext, useId, useRef, useState, type ReactNode } from "react";

type CatalogMenuState = {
  isOpen: boolean;
  menuId: string;
  toggle: (trigger: HTMLButtonElement) => void;
  close: (restoreFocus?: boolean) => void;
};

const CatalogMenuContext = createContext<CatalogMenuState | null>(null);

export default function CatalogMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();
  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) requestAnimationFrame(() => {
      // Wait until a modal dialog is removed and the page is no longer inert.
      const original = triggerRef.current;
      const visibleTrigger = original?.getClientRects().length ? original :
        Array.from(document.querySelectorAll<HTMLButtonElement>("button[aria-controls]"))
          .find((button) => button.getAttribute("aria-controls") === menuId && button.getClientRects().length);
      visibleTrigger?.focus();
    });
  }, [menuId]);
  const toggle = useCallback((trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setIsOpen((value) => !value);
  }, []);

  return <CatalogMenuContext.Provider value={{ isOpen, menuId, toggle, close }}>{children}</CatalogMenuContext.Provider>;
}

export function useCatalogMenu() {
  const context = useContext(CatalogMenuContext);
  if (!context) throw new Error("CatalogMenuProvider is required");
  return context;
}
