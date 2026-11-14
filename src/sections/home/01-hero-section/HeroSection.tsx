import Image from "next/image";
import Link from "next/link";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";

import ContainerNoPaddingMobil from "@/components/layout/ContainerNoPaddingMobil";
import DarkHeroSlider from "@/components/ui/slider/dark-hero/DarkHeroSlider";
import MobileSlider from "@/components/ui/slider/mobile-slider/MobileSlider";

import type { WeeklyProductBlock } from "@/lib/api/catalog/types";

import type { HomepageBanner } from "@/lib/api/homepage-banners/model";

import styles from "./HeroSection.module.css";
import BannerPreloads from "./BannerPreloads";

type HeroSectionProps = {
  weeklyProduct: WeeklyProductBlock | null;
  banners: HomepageBanner[];
};


// Форматирование цены
function formatPrice(value: number): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(value);
  return `${formatted} ₽`;
}

// Расчёт процента скидки
function calculateDiscount(price: number, priceOld: number): string | null {
  if (!priceOld) {
    return null;
  }

  if (priceOld <= price) {
    return null;
  }

  const percent = Math.round(((priceOld - price) / priceOld) * 100);

  if (percent <= 0) {
    return null;
  }

  return `-${percent}%`;
}

export default function HeroSection({ weeklyProduct, banners }: HeroSectionProps) {
  if (!banners.length) return null;
  const desktopSlider = <DarkHeroSlider banners={banners} />;
  // Match the first desktop banner while preserving the existing mobile preload.
  const preloadBanners = [{
    ...banners[0],
    desktopUrl: "/images/hero-concepts-preview/dark-01-startup.webp",
    desktopSrcSet: undefined,
  }, ...banners.slice(1)];
  // Если блок выключен — показываем только слайдер
  if (!weeklyProduct || !weeklyProduct.product) {
    return (
      <section className={styles.hero} data-homepage-banners="hero">
        <BannerPreloads banners={preloadBanners} />
        <ContainerNoPaddingMobil>
          <div className={styles.desktopSlider}>
          {desktopSlider}
          </div>
          <div className={styles.mobileSlider}><MobileSlider images={banners} /></div>
        </ContainerNoPaddingMobil>
      </section>
    );
  }

  const product = weeklyProduct.product;
  const image = product.images?.[0] ?? null;
  const discount = product.priceOld ? calculateDiscount(product.price, product.priceOld) : null;

  return (
    <section className={styles.hero} data-homepage-banners="hero">
      <BannerPreloads banners={preloadBanners} />
      <ContainerNoPaddingMobil>
        {/* Слайдер баннеров */}
        <div className={styles.desktopSlider}>
          {desktopSlider}
        </div>

        <div className={styles.mobileSlider}>
          <MobileSlider images={banners} />
        </div>

        {/* Карточка товара недели */}
        <aside className={styles.weeklyProduct}>
          <Link
            href={`/catalog/product/${product.slug}`}
            className={styles.weeklyProductCard}
            aria-label={`Перейти к товару ${product.name}`}>
            {/* Верхняя часть карточки */}
            <div className={styles.weeklyProductHeader}>
              <span className={styles.weeklyProductTitle}>Товар недели</span>

              {discount && <span className={styles.weeklyProductDiscount}>{discount}</span>}
            </div>

            {/* Основной контент карточки */}
            <div className={styles.weeklyProductMain}>
              <div className={styles.weeklyProductInfo}>
                <p className={styles.weeklyProductDescription}>{product.name}</p>

                <div className={styles.weeklyProductPriceBlock}>
                  <span className={styles.weeklyProductPrice}>{formatPrice(product.price)}</span>

                  {product.priceOld > product.price && (
                    <span className={styles.weeklyProductOldPrice}>{formatPrice(product.priceOld)}</span>
                  )}
                </div>
              </div>

              {image && (
                <div className={styles.weeklyProductImageWrapper}>
                  <picture>
                    <source media="not all and (max-width: 768px)" srcSet={image.src} />
                  <Image
                    src={EMPTY_IMAGE}
                    alt={image.alt}
                    className={styles.weeklyProductImage}
                    width={160}
                    height={160}
                    loading="eager"
                    fetchPriority="high"
                  />
                  </picture>
                </div>
              )}
            </div>
          </Link>
        </aside>
      </ContainerNoPaddingMobil>
    </section>
  );
}
