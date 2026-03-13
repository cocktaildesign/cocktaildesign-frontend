"use client";

import { useRef, useState, useCallback } from "react";
import styles from "./ProductsSlider.module.css";

type ProductsSliderProps = {
  children: React.ReactNode;
};

export default function ProductsSlider({ children }: ProductsSliderProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const handleScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  function scrollByOneSlide(direction: "prev" | "next") {
    const el = sliderRef.current;
    if (!el) return;
    const firstSlide = el.firstElementChild as HTMLElement | null;
    if (!firstSlide) return;
    const slideWidth = firstSlide.offsetWidth + 16;
    el.scrollBy({
      left: direction === "next" ? slideWidth : -slideWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className={styles.wrapper}>
      {canPrev && (
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrev}`}
          onClick={() => scrollByOneSlide("prev")}
          aria-label="Назад">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div ref={sliderRef} className={styles.slider} onScroll={handleScroll}>
        {children}
      </div>

      {canNext && (
        <button
          type="button"
          className={`${styles.button} ${styles.buttonNext}`}
          onClick={() => scrollByOneSlide("next")}
          aria-label="Вперёд">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M1 1L7 7L1 13" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
