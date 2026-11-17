"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent } from "react";
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
  const gesture = useRef<{id: number; x: number; y: number; moved: boolean; control: boolean} | null>(null);
  const suppressClick = useRef(false);

  function cancelGesture() {
    if (gesture.current) suppressClick.current = true;
    gesture.current = null;
  }

  function startGesture(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) {cancelGesture(); return;}
    if (event.button !== 0) return;
    suppressClick.current = false;
    const target = event.target as Element;
    gesture.current = {id: event.pointerId, x: event.clientX, y: event.clientY, moved: false,
      control: !target.closest("[data-hero-card]") || !!target.closest("button")};
  }

  function moveGesture(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (start?.id === event.pointerId && Math.max(Math.abs(event.clientX - start.x), Math.abs(event.clientY - start.y)) > 10) start.moved = true;
  }

  function endGesture(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    const dx = start.x - event.clientX;
    const dy = start.y - event.clientY;
    suppressClick.current = start.moved || Math.max(Math.abs(dx), Math.abs(dy)) > 10;
    if (!start.control && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) carousel.select(carousel.index + (dx > 0 ? 1 : -1));
  }

  if (!images.length) return null;
  return <div className={styles.slider}>
    <div className={`${styles.frame} ${controls.frame}`} data-mobile-dark-hero="true"
      role="region" aria-label="Мобильные баннеры" aria-roledescription="карусель"
      onMouseEnter={carousel.interactions.onMouseEnter} onMouseLeave={carousel.interactions.onMouseLeave}
      onFocusCapture={carousel.interactions.onFocusCapture} onBlurCapture={carousel.interactions.onBlurCapture}
      onPointerDown={startGesture} onPointerMove={moveGesture} onPointerUp={endGesture}
      onPointerCancel={cancelGesture} onPointerLeave={cancelGesture}
      onDragStart={event => event.preventDefault()}
      onClickCapture={event => {
        // A drag/scroll must not follow the card link; keyboard activation stays available.
        if (suppressClick.current && event.detail !== 0) {
          event.preventDefault(); event.stopPropagation(); suppressClick.current = false;
        }
      }}>
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
          // Shorten only the current mobile copy; future CMS edits and desktop copy stay independent.
          const headingText = index === 1 && copy.heading.replace(/\s+/g, " ").trim() === "Барный инвентарь нашего производства"
            ? "Наше\nпроизводство" : copy.heading;
          const description = index === 2 && copy.description.replace(/\s+/g, " ").trim() === "Гравировка, клише с логотипом и эксклюзивные изделия."
            ? "Гравировка\nи клише с вашим\nлоготипом." : copy.description;
          const active = index === carousel.index;
          const [offer, ...heading] = headingText.split("\n");
          const promo = /^Промокод ([A-Z0-9]+)$/.exec(copy.note)?.[1];
          return <div key={topic.id} className={`${styles.slide} ${active ? styles.active : ""}`}
            style={{"--hero-focus": topic.focus} as CSSProperties}
            data-hero-card="true" role="group" aria-roledescription="слайд" aria-label={`${index + 1} из 4: ${topic.label}`}
            aria-hidden={!active} inert={!active}>
            <div className={styles.content}>
              <h2 className={styles.heading}>{index === 0 ? <>
                <span className={styles.offer}>{offer}</span>
                <span className={styles.gift}>{heading.join("\n")}</span>
              </> : headingText}</h2>
              {description && <p className={styles.description}>{description}</p>}
              {copy.note && <p className={styles.note}>{promo ? <>
                <span>Промокод</span><strong>{promo}</strong>
                <CopyButton value={promo} label={`Промокод ${promo}`} className={styles.copyButton}
                  successMessage="Скопировано. Вставьте код в корзине" />
              </> : copy.note}</p>}
            </div>
            {banner.href && copy.buttonLabel && <Link href={banner.href} className={styles.cardLink}
              aria-label={`${copy.buttonLabel}: ${headingText.replace(/\s+/g, " ")}`} draggable={false}>
              <span className={styles.cta}>{copy.buttonLabel}<span aria-hidden="true">→</span></span>
            </Link>}
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
