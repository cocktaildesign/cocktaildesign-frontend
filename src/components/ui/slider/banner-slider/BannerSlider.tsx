"use client";

import useCarousel from "../useCarousel";
import CarouselControls from "../CarouselControls";
import controls from "../CarouselControls.module.css";
import PromoBannerContent from "./PromoBannerContent";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";

import styles from "./BannerSlider.module.css";

type BannerSliderProps = {
  images: HomepageBanner[];
};

export default function BannerSlider({ images }: BannerSliderProps) {
  const totalSlides = images.length;
  const carousel = useCarousel(totalSlides);
  const currentIndex = carousel.index;
  const editorial = images.some(image => image.editorial);
  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      {/* Слайдер */}
      <div className={`${styles.slider} ${controls.frame} ${editorial ? styles.editorial : ""}`} role="region" aria-label="Категории товаров" aria-roledescription="карусель" {...carousel.interactions}>
        <div className={styles.slides} aria-live={carousel.rotating ? "off" : "polite"}>
          {images.map((image, index) => {
            const isActive = index === currentIndex;
            const slideClassName = `${styles.slide} ${isActive ? styles.slideActive : ""}`;

            // picture loads only the artwork for this screen size.
            const picture = image.editorial ? <PromoBannerContent banner={image} /> : (
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
        <CarouselControls labels={images.map(image => image.alt)} index={currentIndex} select={carousel.select} previous={carousel.previous} next={carousel.next} />
      </div>

    </div>
  );
}
