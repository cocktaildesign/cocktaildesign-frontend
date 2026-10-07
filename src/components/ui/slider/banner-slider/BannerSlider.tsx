"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";

import styles from "./BannerSlider.module.css";

type BannerSliderProps = {
  images: HomepageBanner[];
};

// Интервал автопрокрутки: 6 секунд
const AUTOPLAY_INTERVAL = 6000;

export default function BannerSlider({ images }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = images.length;
  const hasControls = totalSlides > 1;

  // Автопрокрутка: каждые 6 секунд показываем следующий слайд.
  // Эффект перезапускается при смене currentIndex — поэтому после
  // клика на точку таймер сбрасывается и отсчёт начинается заново.
  useEffect(() => {
    if (totalSlides <= 1) {
      return;
    }

    const timerId = setTimeout(() => {
      setCurrentIndex((current) => (current + 1) % totalSlides);
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

            // picture loads only the artwork for this screen size.
            const picture = (
              <picture>
                <source
                  media="(max-width: 1023px)"
                  srcSet={image.mobileSrcSet || image.mobileUrl}
                  sizes="100vw"
                  width={800}
                  height={600}
                />
                <img
                  src={image.desktopUrl}
                  srcSet={image.desktopSrcSet}
                  sizes="(min-width: 1440px) 1360px, 100vw"
                  alt={image.alt}
                  width={1360}
                  height={280}
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              </picture>
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
                  {picture}
                </Link>
              );
            }

            return (
              <div key={image.id} className={slideClassName} aria-hidden={!isActive}>
                {picture}
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
