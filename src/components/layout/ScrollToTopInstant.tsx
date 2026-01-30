"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTopInstant() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    // Важно: отключаем восстановление скролла браузером
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // 1) Блокируем прокрутку, чтобы не было "проезда" кадра
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    // 2) Мгновенно прыгаем в верх
    window.scrollTo(0, 0);

    // 3) Возвращаем прокрутку в следующий тик
    // (даём браузеру отрисовать уже "верх" новой страницы)
    const id = window.setTimeout(() => {
      document.documentElement.style.overflow = previousOverflow;
    }, 0);

    return () => {
      window.clearTimeout(id);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [pathname]);

  return null;
}
