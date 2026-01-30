"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Container from "@/components/layout/Container";
import Slider from "@/components/ui/slider/Slider";
import styles from "./HeroSection.module.css";

const BANNER_IMAGES = [
  { id: 1, url: "/banner1.jpg", alt: "Баннер 1" },
  { id: 2, url: "/banner2.jpg", alt: "Баннер 2" },
  { id: 3, url: "/banner3.jpg", alt: "Баннер 3" },
  { id: 4, url: "/banner4.jpg", alt: "Баннер 4" },
];

const WEEKLY_PRODUCT = {
  title: "Товар недели",
  brand: "CocktailDesign",
  discount: "-20%",
  description: "Шейкер-бостон с утяжелителями Subliva 850 мл.",
  currentPrice: "1 950 ₽",
  originalPrice: "2 450 ₽",
  image: "/banner1.jpg",
  imageAlt: "Шейкер-бостон",
  ctaText: "Купить сейчас",
};

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const weeklyProductPanelId = "weekly-product-panel";

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const root = rootRef.current;
      const target = event.target as Node | null;

      if (!root || !target) return;
      if (root.contains(target)) return;

      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  function close() {
    setIsOpen(false);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    close();
  }

  function handleBuyClick() {
    // TODO: добавить в корзину
  }

  return (
    <Container>
      <section className={styles.hero}>
        <Slider images={BANNER_IMAGES} autoPlayInterval={7000} />

        <aside ref={rootRef} className={styles.weeklyProduct}>
          <div className={styles.weeklyProductShell} data-open={isOpen ? "1" : "0"}>
            <button
              type="button"
              className={styles.weeklyProductTrigger}
              aria-expanded={isOpen}
              aria-controls={weeklyProductPanelId}
              onClick={toggle}
              onKeyDown={handleTriggerKeyDown}>
              <span className={styles.triggerTop}>
                <span className={styles.triggerTitleGroup}>
                  <span className={styles.triggerTitle}>{WEEKLY_PRODUCT.title}</span>
                  <span className={styles.triggerBrand}>{WEEKLY_PRODUCT.brand}</span>
                </span>

                <span className={styles.triggerBadge}>{WEEKLY_PRODUCT.discount}</span>
              </span>
            </button>

            <div id={weeklyProductPanelId} className={styles.triggerBody} aria-hidden={!isOpen}>
              <div className={styles.triggerContent}>
                <div className={styles.weeklyProductText}>
                  <div className={styles.weeklyProductMain}>
                    <div>
                      <p className={styles.weeklyProductDescription}>{WEEKLY_PRODUCT.description}</p>

                      <div className={styles.weeklyProductPriceSection}>
                        <span className={styles.weeklyProductPrice}>{WEEKLY_PRODUCT.currentPrice}</span>
                        <span className={styles.weeklyProductOldPrice}>{WEEKLY_PRODUCT.originalPrice}</span>
                      </div>
                    </div>

                    <div className={styles.weeklyProductImageWrapper}>
                      <Image
                        src={WEEKLY_PRODUCT.image}
                        alt={WEEKLY_PRODUCT.imageAlt}
                        className={styles.weeklyProductImage}
                        width={160}
                        height={160}
                        priority
                      />
                    </div>
                  </div>

                  <button type="button" className={styles.weeklyProductButton} onClick={handleBuyClick}>
                    {WEEKLY_PRODUCT.ctaText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </Container>
  );
}
