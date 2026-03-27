import Image from "next/image";
import Link from "next/link";

import Container from "@/components/layout/Container";
import Slider from "@/components/ui/slider/Slider";
import MobileSlider from "@/components/ui/slider/mobile-slider/MobileSlider";

import type { WeeklyProductBlock } from "@/lib/api/catalog/types";

import styles from "./HeroSection.module.css";

type HeroSectionProps = {
  weeklyProduct: WeeklyProductBlock | null;
};

// Баннеры для слайдера
const BANNER_IMAGES = [
  {
    id: 1,
    desktopUrl: "/images/hero-baner/banner1.webp",
    mobileUrl: "/images/hero-baner/banner1-mobile.webp",
    alt: "Картинка для перехода в каталог",
    href: "/catalog",
  },
  {
    id: 2,
    desktopUrl: "/images/hero-baner/banner2.webp",
    mobileUrl: "/images/hero-baner/banner2-mobile.webp",
    alt: "Товары со скидкой",
    href: "/catalog/collection/sale",
  },
  {
    id: 3,
    desktopUrl: "/images/hero-baner/banner3.webp",
    mobileUrl: "/images/hero-baner/banner3-mobile.webp",
    alt: "Новинки",
    href: "/catalog/collection/novinki",
  },
];

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

export default function HeroSection({ weeklyProduct }: HeroSectionProps) {
  // Если блок выключен — показываем только слайдер
  if (!weeklyProduct || !weeklyProduct.product) {
    return (
      <Container>
        <section className={styles.hero}>
          <Slider images={BANNER_IMAGES} autoPlayInterval={7000} />
        </section>
      </Container>
    );
  }

  const product = weeklyProduct.product;
  const image = product.images?.[0] ?? null;
  const discount = product.priceOld ? calculateDiscount(product.price, product.priceOld) : null;

  return (
    <Container>
      <section className={styles.hero}>
        {/* Слайдер баннеров */}
        <div className={styles.desktopSlider}>
          <Slider images={BANNER_IMAGES} autoPlayInterval={7000} />
        </div>

        <div className={styles.mobileSlider}>
          <MobileSlider images={BANNER_IMAGES} />
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
                  <Image
                    src={image.src}
                    alt={image.alt}
                    className={styles.weeklyProductImage}
                    width={160}
                    height={160}
                    priority
                  />
                </div>
              )}
            </div>
          </Link>
        </aside>
      </section>
    </Container>
  );
}
