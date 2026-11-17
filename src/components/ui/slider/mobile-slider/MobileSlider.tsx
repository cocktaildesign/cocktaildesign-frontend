"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import CopyButton from "@/components/ui/copy-button/CopyButton";
import { DEFAULT_HERO_BANNERS, type HomepageBanner } from "@/lib/api/homepage-banners/model";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";
import useCarousel from "../useCarousel";
import CarouselControls from "../CarouselControls";
import controls from "../CarouselControls.module.css";
import styles from "./MobileSlider.module.css";

const TOPICS = [
  {id: "01-startup", label: "StartUp", focus: "60%", width: 1908, height: 824},
  {id: "02-production", label: "Собственное производство", focus: "48%", width: 1930, height: 815},
  {id: "03-branding", label: "Брендинг", focus: "65%", width: 1930, height: 815},
  {id: "04-new", label: "Новинки", focus: "60%", width: 1930, height: 815},
] as const;

export default function MobileSlider({images}: {images: HomepageBanner[]}) {
  const carousel = useCarousel(TOPICS.length, 7000, false);
  if (!images.length) return null;
  return <div className={styles.slider}>
    <div className={`${styles.frame} ${controls.frame}`} data-mobile-dark-hero="true"
      role="region" aria-label="Мобильные баннеры" aria-roledescription="карусель"
      {...carousel.interactions}>
      <div className={styles.slides} aria-live={carousel.rotating ? "off" : "polite"}
        tabIndex={0} aria-label="Баннеры: листайте стрелками влево и вправо"
        onKeyDown={event => {
          if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (event.key === "ArrowLeft") {event.preventDefault(); carousel.previous();}
          if (event.key === "ArrowRight") {event.preventDefault(); carousel.next();}
        }}>
        {TOPICS.map((topic, index) => {
          const banner = images[index]?.editorial ? images[index] : DEFAULT_HERO_BANNERS[index];
          const copy = banner.editorial!;
          const active = index === carousel.index;
          const [offer, ...heading] = copy.heading.split("\n");
          const promo = /^Промокод ([A-Z0-9]+)$/.exec(copy.note)?.[1];
          return <div key={topic.id} className={`${styles.slide} ${active ? styles.active : ""}`}
            style={{"--hero-focus": topic.focus} as CSSProperties}
            role="group" aria-roledescription="слайд" aria-label={`${index + 1} из 4: ${topic.label}`}
            aria-hidden={!active} inert={!active}>
            <div className={styles.content}>
              <h2 className={styles.heading}>{index === 0 ? <>
                <span className={styles.offer}>{offer}</span>
                <span className={styles.gift}>{heading.join("\n")}</span>
              </> : copy.heading}</h2>
              {copy.description && <p className={styles.description}>{copy.description}</p>}
              {banner.href && copy.buttonLabel && <Link href={banner.href} className={styles.cta}>
                {copy.buttonLabel}<span aria-hidden="true">→</span>
              </Link>}
              {copy.note && <p className={styles.note}>{promo ? <>
                <span>Промокод</span><strong>{promo}</strong>
                <CopyButton value={promo} label="Промокод" className={styles.copyButton}
                  successMessage="Скопировано. Вставьте код в корзине" />
              </> : copy.note}</p>}
            </div>
            <picture className={styles.art}>
              <source media="(max-width: 600px)" srcSet={`/images/hero-concepts-preview/dark-${topic.id}.webp`} />
              <Image src={EMPTY_IMAGE} alt="" width={topic.width} height={topic.height}
                loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} />
            </picture>
          </div>;
        })}
      </div>
      <div className={styles.controls}>
        <CarouselControls labels={TOPICS.map(topic => topic.label)} index={carousel.index}
          select={carousel.select} previous={carousel.previous} next={carousel.next} />
      </div>
    </div>
  </div>;
}
