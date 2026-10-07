"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroBannerContent from "./HeroBannerContent";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";

import styles from "./Slider.module.css";

type SliderProps = {
  images: HomepageBanner[];
  autoPlayInterval?: number;
};

function getNextSlideIndex(current: number, total: number) {
  const next = current + 1;
  return next >= total ? 0 : next;
}

function getPrevSlideIndex(current: number, total: number) {
  const prev = current - 1;
  return prev < 0 ? total - 1 : prev;
}

export default function Slider({ images, autoPlayInterval = 7000 }: SliderProps) {
  const totalSlides = images.length;
  const hasControls = totalSlides > 1;

  const [currentIndex, setCurrentIndex] = useState(0);

  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  const touchStartXRef = useRef(0);
  const editorial = images.some(image => image.editorial);
  const rotating = hasControls && !paused && !hovered && !focused && !reducedMotion && !hidden;

  function selectSlide(index: number) { setCurrentIndex(index); setPaused(true); }
  function showNextSlide() { if (hasControls) selectSlide(getNextSlideIndex(currentIndex, totalSlides)); }
  function showPrevSlide() { if (hasControls) selectSlide(getPrevSlideIndex(currentIndex, totalSlides)); }

  // Запоминаем точку начала свайпа
  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0].clientX;
  }

  // Сравниваем начало и конец свайпа
  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (!hasControls) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = touchStartXRef.current - touchEndX;

    if (Math.abs(swipeDistance) < 50) {
      return;
    }

    if (swipeDistance > 0) {
      showNextSlide();
    } else {
      showPrevSlide();
    }
  }

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    const onVisibility = () => setHidden(document.hidden);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    // Read browser preferences after hydration; no timer is allowed before this check.
    const frame = requestAnimationFrame(() => { onMotion(); onVisibility(); });
    return () => { cancelAnimationFrame(frame); motion.removeEventListener("change", onMotion); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    if (!rotating || window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) return;
    const timer = window.setTimeout(() => setCurrentIndex(current => getNextSlideIndex(current, totalSlides)), autoPlayInterval);
    return () => window.clearTimeout(timer);
  }, [rotating, currentIndex, totalSlides, autoPlayInterval]);

  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className={`${styles.slider} ${editorial ? styles.editorial : ""}`}
      style={{aspectRatio: editorial ? "64 / 27" : String(images[0].desktopAspect || 16 / 9)}}
      role="region" aria-label="Предложения Cocktail Design" aria-roledescription="карусель"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className={styles.slides} aria-live={rotating ? "off" : "polite"} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {images.map((image, index) => {
          const isActive = index === currentIndex;
          const slideClassName = isActive ? styles.slideActive : styles.slide;
          const isLcpSlide = index === 0;

          if (image.href) {
            return (
              <Link key={image.id} href={image.href} aria-label={image.editorial ? undefined : image.alt} aria-hidden={!isActive} tabIndex={isActive ? 0 : -1} className={slideClassName}>
                {image.editorial ? <HeroBannerContent banner={image} priority={isLcpSlide} /> : <picture>
                  <source media="not all and (max-width: 600px)" srcSet={image.desktopSrcSet ?? image.desktopUrl} sizes="100vw" />
                <Image
                  src={EMPTY_IMAGE}
                  alt={image.alt}
                  className={styles.image}
                  width={1280}
                  height={720}
                  sizes="(max-width: 600px) 0px, 100vw"
                  fetchPriority={isLcpSlide ? "high" : "auto"}
                  loading={isLcpSlide ? "eager" : "lazy"}
                />
                </picture>}
              </Link>
            );
          }

          return (
            <div key={image.id} className={slideClassName} aria-hidden={!isActive}>
              {image.editorial ? <HeroBannerContent banner={image} priority={isLcpSlide} /> : <picture>
                <source media="not all and (max-width: 600px)" srcSet={image.desktopSrcSet ?? image.desktopUrl} sizes="100vw" />
              <Image
                src={EMPTY_IMAGE}
                alt={image.alt}
                className={styles.image}
                width={1280}
                height={720}
                sizes="(max-width: 600px) 0px, 100vw"
                fetchPriority={isLcpSlide ? "high" : "auto"}
                loading={isLcpSlide ? "eager" : "lazy"}
              />
              </picture>}
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

          <div className={styles.progressBar} aria-label="Выбор баннера">
            {images.map((image, index) => <button key={image.id} type="button"
              className={`${styles.progressItem} ${index === currentIndex ? styles.progressItemActive : ""}`}
              aria-label={`Баннер ${index + 1}: ${image.alt}`} aria-current={index === currentIndex ? "true" : undefined}
              onClick={() => selectSlide(index)} />)}
            {!reducedMotion && <button type="button" className={styles.pauseButton}
              aria-label={paused ? "Включить автоматическую смену баннеров" : "Остановить автоматическую смену баннеров"}
              onClick={() => setPaused(value => !value)}><span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span></button>}
          </div>
        </>
      )}
    </div>
  );
}
