"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import CopyButton from "@/components/ui/copy-button/CopyButton";
import { DEFAULT_HERO_BANNERS, type HomepageBanner } from "@/lib/api/homepage-banners/model";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";
import CarouselControls from "../CarouselControls";
import controls from "../CarouselControls.module.css";
import styles from "./HeroConceptsPreview.module.css";

const SERIES = [
  { id: "dark", name: "Тёмные", description: "Тёмная серия", range: "1–4" },
  { id: "light", name: "Светлые", description: "Светлая серия", range: "5–8" },
  { id: "atelier", name: "Архитектурный свет", description: "Архитектурный свет", range: "9–12" },
] as const;

const TOPICS = [
  { id: "01-startup", name: "StartUp" },
  { id: "02-production", name: "Собственное производство" },
  { id: "03-branding", name: "Брендинг" },
  { id: "04-new", name: "Новинки" },
] as const;

const SLIDES = SERIES.flatMap((series, seriesIndex) => TOPICS.map((topic, topicIndex) => ({
  series,
  seriesIndex,
  topic,
  topicIndex,
  src: `/images/hero-concepts-preview/${series.id}-${topic.id}.webp`,
  label: `${series.description} · ${topic.name}`,
})));

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

export default function HeroConceptsPreview({ banners }: { banners: HomepageBanner[] }) {
  const [index, setIndex] = useState(0);
  const selected = SLIDES[index];
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

  return <div className={styles.preview} data-hero-concepts-preview="true"
    role="region" aria-label="Предложения Cocktail Design: 12 вариантов оформления" aria-roledescription="карусель">
    <div className={styles.toolbar}>
      <span className={styles.caption}>Варианты оформления</span>
      <div className={styles.series} role="group" aria-label="Выбрать серию, сохранив тему баннера">
        {SERIES.map((series, seriesIndex) => <button key={series.id} type="button"
          aria-pressed={selected.seriesIndex === seriesIndex}
          onClick={() => setIndex(seriesIndex * TOPICS.length + selected.topicIndex)}>
          {series.name}<span>{series.range}</span>
        </button>)}
      </div>
      <p className={styles.selection} aria-live="polite" aria-atomic="true">
        <strong>{index + 1} / {SLIDES.length}</strong>
        <span>{selected.series.description} · {selected.topic.name}</span>
      </p>
    </div>

    <div className={`${styles.frame} ${controls.frame} ${styles[selected.series.id]}`}
      tabIndex={0} aria-label="Баннеры: листайте стрелками влево и вправо" onKeyDown={handleKeyDown}>
      {SLIDES.map((slide, slideIndex) => {
        const active = slideIndex === index;
        // All three concepts share the same current homepage copy for each topic.
        const banner = banners[slide.topicIndex]?.editorial
          ? banners[slide.topicIndex]
          : DEFAULT_HERO_BANNERS[slide.topicIndex];
        return <div key={slide.src}
          className={`${styles.slide} ${styles[slide.series.id]} ${active ? styles.active : ""}`}
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
