"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import CopyButton from "@/components/ui/copy-button/CopyButton";
import { DEFAULT_HERO_BANNERS, type HomepageBanner } from "@/lib/api/homepage-banners/model";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";
import CarouselControls from "../CarouselControls";
import controls from "../CarouselControls.module.css";
import styles from "./DarkHeroSlider.module.css";

const TOPICS = [
  { id: "01-startup", name: "StartUp" },
  { id: "02-production", name: "Собственное производство" },
  { id: "03-branding", name: "Брендинг" },
  { id: "04-new", name: "Новинки" },
] as const;

const SLIDES = TOPICS.map((topic, topicIndex) => ({
  topicIndex,
  src: `/images/hero-concepts-preview/dark-${topic.id}.webp`,
  label: topic.name,
}));

function BannerCopy({ banner, startup }: { banner: HomepageBanner; startup: boolean }) {
  const copy = banner.editorial!;
  const [offer, ...headingLines] = copy.heading.split("\n");
  const promoCode = /^Промокод ([A-Z0-9]+)$/.exec(copy.note)?.[1];

  return <>
    <div className={`${styles.copy} ${startup ? styles.startup : ""}`}>
      <h2 className={styles.heading}>
        {startup ? <>
          <span className={styles.offer}>{offer}</span>
          {headingLines.length > 0 && <span className={styles.gift}>{headingLines.join("\n")}</span>}
        </> : copy.heading}
      </h2>
      {copy.description && <p className={styles.description}>{copy.description}</p>}
      {copy.note && <p className={styles.note}>
        {promoCode ? <>
          <span>Промокод</span><strong>{promoCode}</strong>
          <CopyButton value={promoCode} label="Промокод" className={styles.copyButton}
            successMessage="Скопировано. Вставьте код в корзине" />
        </> : copy.note}
      </p>}
    </div>
    {banner.href && copy.buttonLabel && <Link className={styles.cta} href={banner.href}>
      {copy.buttonLabel}{startup && <span aria-hidden="true">→</span>}
    </Link>}
  </>;
}

export default function DarkHeroSlider({ banners }: { banners: HomepageBanner[] }) {
  const [index, setIndex] = useState(0);
  const previous = () => setIndex(value => (value + SLIDES.length - 1) % SLIDES.length);
  const next = () => setIndex(value => (value + 1) % SLIDES.length);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  }

  return <div className={styles.slider} data-dark-hero-slider="true"
    role="region" aria-label="Предложения Cocktail Design" aria-roledescription="карусель">
    <div className={`${styles.frame} ${controls.frame}`}
      tabIndex={0} aria-label="Баннеры: листайте стрелками влево и вправо" onKeyDown={handleKeyDown}>
      {SLIDES.map((slide, slideIndex) => {
        const active = slideIndex === index;
        // The four themes retain the current homepage copy and destinations.
        const banner = banners[slide.topicIndex]?.editorial
          ? banners[slide.topicIndex]
          : DEFAULT_HERO_BANNERS[slide.topicIndex];
        return <div key={slide.src}
          className={`${styles.slide} ${active ? styles.active : ""}`}
          role="group" aria-roledescription="слайд" aria-label={`${slideIndex + 1} из ${SLIDES.length}: ${slide.label}`}
          aria-hidden={!active} inert={!active}>
          <picture className={styles.art}>
            <source media="(min-width: 601px)" srcSet={slide.src} />
            <Image src={EMPTY_IMAGE} alt="" width={1930} height={815}
              loading={slideIndex === 0 ? "eager" : "lazy"}
              fetchPriority={slideIndex === 0 ? "high" : "auto"} />
          </picture>
          <BannerCopy banner={banner} startup={slide.topicIndex === 0} />
        </div>;
      })}
      <CarouselControls labels={SLIDES.map(slide => slide.label)} index={index}
        select={setIndex} previous={previous} next={next} />
    </div>
  </div>;
}
