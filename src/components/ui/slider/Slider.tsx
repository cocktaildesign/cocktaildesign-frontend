"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Slider.module.css";

type SlideImage = {
  id: number;
  url: string;
  alt: string;
};

type SliderProps = {
  images: SlideImage[];
  autoPlayInterval?: number;
};

// Возвращает индекс следующего слайда с зацикливанием.
function getNextSlideIndex(current: number, total: number) {
  const next = current + 1;
  return next >= total ? 0 : next;
}

// Возвращает индекс предыдущего слайда с зацикливанием.
function getPrevSlideIndex(current: number, total: number) {
  const prev = current - 1;
  return prev < 0 ? total - 1 : prev;
}

export default function Slider({ images, autoPlayInterval = 7000 }: SliderProps) {
  const totalSlides = images.length;
  const hasControls = totalSlides > 1;

  // Единственное UI-состояние: какой слайд сейчас показан.
  const [currentIndex, setCurrentIndex] = useState(0);

  // Таймер не должен вызывать ререндеры, поэтому id интервала храним в ref.
  const timerIdRef = useRef<number | null>(null);

  // Перезапускаем автоплей после ручной навигации,
  // чтобы избежать "внезапного" перелистывания сразу после клика.
  function restartAutoplay() {
    if (!hasControls) return;

    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
    }

    timerIdRef.current = window.setInterval(() => {
      setCurrentIndex((current) => getNextSlideIndex(current, totalSlides));
    }, autoPlayInterval);
  }

  // Показать следующий слайд.
  function showNextSlide() {
    if (!hasControls) return;

    setCurrentIndex((current) => getNextSlideIndex(current, totalSlides));
    restartAutoplay();
  }

  // Показать предыдущий слайд.
  function showPrevSlide() {
    if (!hasControls) return;

    setCurrentIndex((current) => getPrevSlideIndex(current, totalSlides));
    restartAutoplay();
  }

  // Автоплей — внешняя система (interval), поэтому управление жизненным циклом в useEffect.
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

          return (
            <div key={image.id} className={isActive ? styles.slideActive : styles.slide} aria-hidden={!isActive}>
              <Image
                src={image.url}
                alt={image.alt}
                className={styles.image}
                width={1200}
                height={500}
                sizes="100vw"
                // Приоритет загрузки только активному слайду, чтобы не прелоадить всё сразу.
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

          {/* Декоративный индикатор. Скринридеру он не нужен. */}
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
