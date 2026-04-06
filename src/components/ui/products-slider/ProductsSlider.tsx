// frontend/src/components/ui/products-slider/ProductsSlider.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ProductsSlider.module.css";

type ProductsSliderProps = {
  children: React.ReactNode;
};

const SLIDE_GAP = 16;

export default function ProductsSlider({ children }: ProductsSliderProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Проверяем, можно ли скроллить влево и вправо
  function updateButtonsState() {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    setCanPrev(slider.scrollLeft > 0);
    setCanNext(slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 1);
  }

  // Прокрутка на ширину одного слайда
  function scrollByOneSlide(direction: "prev" | "next") {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const firstSlide = slider.firstElementChild as HTMLElement | null;

    if (!firstSlide) {
      return;
    }

    const slideWidth = firstSlide.offsetWidth + SLIDE_GAP;

    slider.scrollBy({
      left: direction === "next" ? slideWidth : -slideWidth,
      behavior: "smooth",
    });
  }

  // При маунте и при изменении размера окна пересчитываем видимость кнопок
  useEffect(() => {
    updateButtonsState();

    function handleResize() {
      updateButtonsState();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [children]);

  return (
    <div className={styles.wrapper}>
      {canPrev && (
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrev}`}
          onClick={() => scrollByOneSlide("prev")}
          aria-label="Назад">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
            <path d="M7 1L1 7L7 13" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div ref={sliderRef} className={styles.slider} onScroll={updateButtonsState}>
        {children}
      </div>

      {canNext && (
        <button
          type="button"
          className={`${styles.button} ${styles.buttonNext}`}
          onClick={() => scrollByOneSlide("next")}
          aria-label="Вперёд">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
            <path d="M1 1L7 7L1 13" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
