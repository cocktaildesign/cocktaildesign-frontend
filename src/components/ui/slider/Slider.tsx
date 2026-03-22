// frontend/src/components/ui/slider/Slider.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Slider.module.css";

type SlideImage = {
  id: number;
  url: string;
  alt: string;
  href?: string;
};

type SliderProps = {
  images: SlideImage[];
  autoPlayInterval?: number;
};

// Следующий индекс (с зацикливанием)
function getNextSlideIndex(current: number, total: number) {
  const next = current + 1;
  return next >= total ? 0 : next;
}

// Предыдущий индекс (с зацикливанием)
function getPrevSlideIndex(current: number, total: number) {
  const prev = current - 1;
  return prev < 0 ? total - 1 : prev;
}

export default function Slider({ images, autoPlayInterval = 7000 }: SliderProps) {
  const totalSlides = images.length;
  const hasControls = totalSlides > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const timerIdRef = useRef<number | null>(null);

  // Перезапуск автоплея
  function restartAutoplay() {
    if (!hasControls) return;

    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
    }

    timerIdRef.current = window.setInterval(() => {
      setCurrentIndex((current) => getNextSlideIndex(current, totalSlides));
    }, autoPlayInterval);
  }

  function showNextSlide() {
    if (!hasControls) return;

    setCurrentIndex((current) => getNextSlideIndex(current, totalSlides));
    restartAutoplay();
  }

  function showPrevSlide() {
    if (!hasControls) return;

    setCurrentIndex((current) => getPrevSlideIndex(current, totalSlides));
    restartAutoplay();
  }

  // Автоплей
  useEffect(() => {
    if (!hasControls) return;

    const id = window.setInterval(() => {
      setCurrentIndex((current) => getNextSlideIndex(current, totalSlides));
    }, autoPlayInterval);

    timerIdRef.current = id;

    return () => {
      window.clearInterval(id);
      timerIdRef.current = null;
    };
  }, [hasControls, totalSlides, autoPlayInterval]);

  if (totalSlides === 0) return null;

  return (
    <div className={styles.slider}>
      <div className={styles.slides} aria-live="polite">
        {images.map((image, index) => {
          const isActive = index === currentIndex;
          const slideClassName = isActive ? styles.slideActive : styles.slide;

          // 👉 Если есть ссылка — делаем слайд ссылкой
          if (image.href) {
            return (
              <Link key={image.id} href={image.href} aria-label={image.alt} className={slideClassName}>
                <Image
                  src={image.url}
                  alt={image.alt}
                  className={styles.image}
                  width={1200}
                  height={500}
                  sizes="100vw"
                  priority={isActive}
                />
              </Link>
            );
          }

          // 👉 Если ссылки нет — обычный div
          return (
            <div key={image.id} className={slideClassName} aria-hidden={!isActive}>
              <Image
                src={image.url}
                alt={image.alt}
                className={styles.image}
                width={1200}
                height={500}
                sizes="100vw"
                priority={isActive}
              />
            </div>
          );
        })}
      </div>

      {hasControls && (
        <>
          <button type="button" onClick={showPrevSlide} className={styles.hotZoneLeft} aria-label="Предыдущий слайд">
            <span className={styles.prevButton} aria-hidden="true">
              ←
            </span>
          </button>

          <button type="button" onClick={showNextSlide} className={styles.hotZoneRight} aria-label="Следующий слайд">
            <span className={styles.nextButton} aria-hidden="true">
              →
            </span>
          </button>

          <div className={styles.progressBar} aria-hidden="true">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div key={index} className={index === currentIndex ? styles.progressItemActive : styles.progressItem} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
