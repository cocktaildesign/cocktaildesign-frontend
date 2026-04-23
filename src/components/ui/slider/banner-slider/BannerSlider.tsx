"use client";

import { useEffect, useState } from "react";
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

// Интервал автопрокрутки: 6 секунд
const AUTOPLAY_INTERVAL = 6000;

export default function BannerSlider({ images }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = images.length;
  const hasControls = totalSlides > 1;

  function showNextSlide() {
    setCurrentIndex((current) => {
      const nextIndex = current + 1;
      if (nextIndex >= totalSlides) {
        return 0;
      }
      return nextIndex;
    });
  }

  // Автопрокрутка: каждые 6 секунд показываем следующий слайд.
  // Эффект перезапускается при смене currentIndex — поэтому после
  // клика на точку таймер сбрасывается и отсчёт начинается заново.
  useEffect(() => {
    if (totalSlides <= 1) {
      return;
    }

    const timerId = setTimeout(() => {
      showNextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => {
      clearTimeout(timerId);
    };
  }, [currentIndex, totalSlides]);

  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      {/* Слайдер */}
      <div className={styles.slider}>
        <div className={styles.slides}>
          {images.map((image, index) => {
            const isActive = index === currentIndex;
            const slideClassName = `${styles.slide} ${isActive ? styles.slideActive : ""}`;
            const isFirstSlide = index === 0;

            // Десктопная картинка — показывается на экранах от 1024px
            const desktopImage = (
              <Image
                src={image.desktopUrl}
                alt={image.alt}
                width={1360}
                height={400}
                priority={isFirstSlide}
                className={`${styles.image} ${styles.imageDesktop}`}
              />
            );

            // Мобильная картинка — показывается на экранах до 1023px
            const mobileImage = (
              <Image
                src={image.mobileUrl}
                alt={image.alt}
                width={800}
                height={600}
                priority={isFirstSlide}
                className={`${styles.image} ${styles.imageMobile}`}
              />
            );

            // Если есть ссылка — оборачиваем в Link, иначе просто div
            if (image.href) {
              return (
                <Link
                  key={image.id}
                  href={image.href}
                  className={slideClassName}
                  aria-hidden={!isActive}
                  tabIndex={isActive ? 0 : -1}>
                  {desktopImage}
                  {mobileImage}
                </Link>
              );
            }

            return (
              <div key={image.id} className={slideClassName} aria-hidden={!isActive}>
                {desktopImage}
                {mobileImage}
              </div>
            );
          })}
        </div>
      </div>

      {/* Точки под слайдером (показываем только если слайдов больше одного) */}
      {hasControls && (
        <div className={styles.dots}>
          {images.map((image, index) => {
            const isActiveDot = index === currentIndex;
            const dotClassName = `${styles.dot} ${isActiveDot ? styles.dotActive : ""}`;

            return (
              <button
                key={image.id}
                type="button"
                className={dotClassName}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
