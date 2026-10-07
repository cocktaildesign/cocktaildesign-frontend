"use client";

import useCarousel from "./useCarousel";
import CarouselControls from "./CarouselControls";
import controls from "./CarouselControls.module.css";
import Image from "next/image";
import Link from "next/link";
import HeroBannerContent from "./HeroBannerContent";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";

import styles from "./Slider.module.css";

type SliderProps = {
  images: HomepageBanner[];
  autoPlayInterval?: number;
  mobile?: boolean;
};

export default function Slider({ images, autoPlayInterval = 7000, mobile = false }: SliderProps) {
  const totalSlides = images.length;
  const carousel = useCarousel(totalSlides, autoPlayInterval);
  const currentIndex = carousel.index;
  const editorial = images.some(image => image.editorial);
  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className={`${styles.slider} ${controls.frame} ${editorial ? styles.editorial : ""} ${mobile ? styles.mobile : ""}`}
      style={{aspectRatio: mobile ? (editorial ? undefined : "4 / 5") : editorial ? "64 / 27" : String(images[0].desktopAspect || 16 / 9)}}
      role="region" aria-label={mobile ? "Мобильные баннеры" : "Предложения Cocktail Design"} aria-roledescription="карусель"
      {...carousel.interactions}>
      <div className={styles.slides} aria-live={carousel.rotating ? "off" : "polite"}>
        {images.map((image, index) => {
          const isActive = index === currentIndex;
          const slideClassName = isActive ? styles.slideActive : styles.slide;
          const isLcpSlide = index === 0;

          if (image.href) {
            return (
              <Link key={image.id} href={image.href} aria-label={image.editorial ? undefined : image.alt} aria-hidden={!isActive} tabIndex={isActive ? 0 : -1} className={slideClassName}>
                {image.editorial ? <HeroBannerContent banner={image} mobile={mobile} priority={isLcpSlide} /> : <picture>
                  <source media={mobile ? "(max-width: 600px)" : "not all and (max-width: 600px)"} srcSet={mobile ? image.mobileSrcSet ?? image.mobileUrl : image.desktopSrcSet ?? image.desktopUrl} sizes="100vw" />
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
              {image.editorial ? <HeroBannerContent banner={image} mobile={mobile} priority={isLcpSlide} /> : <picture>
                <source media={mobile ? "(max-width: 600px)" : "not all and (max-width: 600px)"} srcSet={mobile ? image.mobileSrcSet ?? image.mobileUrl : image.desktopSrcSet ?? image.desktopUrl} sizes="100vw" />
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

      <CarouselControls labels={images.map(image => image.alt)} index={currentIndex} select={carousel.select} previous={carousel.previous} next={carousel.next} />
    </div>
  );
}
