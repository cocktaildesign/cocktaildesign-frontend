"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import styles from "./BannerSlider.module.css";

type BannerImage = {
  id: number;
  desktopUrl: string;
  mobileUrl: string;
  alt: string;
  href?: string;
};

type BannerSliderProps = {
  images: BannerImage[];
};

export default function BannerSlider({ images }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = images.length;
  const hasControls = totalSlides > 1;

  function showNextSlide() {
    setCurrentIndex((current) => {
      const nextIndex = current + 1;
      return nextIndex >= totalSlides ? 0 : nextIndex;
    });
  }

  function showPrevSlide() {
    setCurrentIndex((current) => {
      const prevIndex = current - 1;
      return prevIndex < 0 ? totalSlides - 1 : prevIndex;
    });
  }

  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className={styles.slider}>
      {/* Слайды */}
      <div className={styles.slides}>
        {images.map((image, index) => {
          const isActive = index === currentIndex;
          const slideClassName = `${styles.slide} ${isActive ? styles.slideActive : ""}`;

          const imageElement = (
            <Image
              src={image.desktopUrl}
              alt={image.alt}
              fill
              priority={index === 0}
              className={styles.image}
              sizes="(max-width: 600px) 100vw, 1200px"
            />
          );

          if (image.href) {
            return (
              <Link
                key={image.id}
                href={image.href}
                className={slideClassName}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}>
                {imageElement}
              </Link>
            );
          }

          return (
            <div key={image.id} className={slideClassName} aria-hidden={!isActive}>
              {imageElement}
            </div>
          );
        })}
      </div>

      {/* Кнопки и точки показываем только если слайдов больше одного */}
      {hasControls && (
        <>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            onClick={showPrevSlide}
            aria-label="Предыдущий слайд">
            ←
          </button>

          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={showNextSlide}
            aria-label="Следующий слайд">
            →
          </button>

          <div className={styles.dots} aria-hidden="true">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ""}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
