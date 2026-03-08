"use client";

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
};

export default function HeroSection() {
  function handleBuyClick() {
    // TODO: добавить в корзину
  }

  return (
    <Container>
      <section className={styles.hero}>
        <Slider images={BANNER_IMAGES} autoPlayInterval={7000} />

        <aside className={styles.weeklyProduct}>
          <div className={styles.weeklyProductCard}>
            <div className={styles.weeklyProductHeader}>
              <span className={styles.weeklyProductTitleGroup}>
                <span className={styles.weeklyProductTitle}>{WEEKLY_PRODUCT.title}</span>

                <span className={styles.weeklyProductBrand}>{WEEKLY_PRODUCT.brand}</span>
              </span>

              <span className={styles.weeklyProductDiscount}>{WEEKLY_PRODUCT.discount}</span>
            </div>

            <div className={styles.weeklyProductContent}>
              <div className={styles.weeklyProductBody}>
                <div className={styles.weeklyProductMain}>
                  <div>
                    <p className={styles.weeklyProductDescription}>{WEEKLY_PRODUCT.description}</p>

                    <div className={styles.weeklyProductPriceBlock}>
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
              </div>
            </div>
          </div>
        </aside>
      </section>
    </Container>
  );
}
