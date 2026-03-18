"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTopInstant() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Скроллим сразу
    window.scrollTo(0, 0);

    // И ещё раз через тик — на случай если браузер восстановил скролл после нас
    const id = window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, [pathname]);

  return null;
}
