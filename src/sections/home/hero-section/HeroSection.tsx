// frontend/src/sections/home/hero-section/HeroSection.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Slider from "@/components/ui/slider/Slider";
import styles from "./HeroSection.module.css";

// Тип блока "Товар недели", который мы получаем из API слоя
import type { WeeklyProductBlock } from "@/lib/api/catalog/types";

// Пропсы компонента: либо блок есть, либо null (если в Strapi выключили)
type HeroSectionProps = {
  weeklyProduct: WeeklyProductBlock | null;
};

// Баннеры для слайдера (пока статические)
const BANNER_IMAGES = [
  { id: 1, url: "/banner1.jpg", alt: "Баннер 1" },
  { id: 2, url: "/banner2.jpg", alt: "Баннер 2" },
  { id: 3, url: "/banner3.jpg", alt: "Баннер 3" },
  { id: 4, url: "/banner4.jpg", alt: "Баннер 4" },
];

// Форматирование цены для UI
// 1950 -> "1 950 ₽"
function formatPrice(value: number): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(value);
  return `${formatted} ₽`;
}

// Расчёт процента скидки
// price = 1950
// priceOld = 2450
// -> "-20%"
function calculateDiscount(price: number, priceOld: number): string | null {
  // если старой цены нет — скидки нет
  if (!priceOld) return null;

  // если старая цена меньше или равна новой — скидки нет
  if (priceOld <= price) return null;

  const percent = Math.round(((priceOld - price) / priceOld) * 100);

  // защита от некорректных значений
  if (percent <= 0) return null;

  return `-${percent}%`;
}

export default function HeroSection({ weeklyProduct }: HeroSectionProps) {
  // Если блок выключен в Strapi — показываем только слайдер
  if (!weeklyProduct || !weeklyProduct.product) {
    return (
      <Container>
        <section className={styles.hero}>
          <Slider images={BANNER_IMAGES} autoPlayInterval={7000} />
        </section>
      </Container>
    );
  }

  // Товар из блока
  const product = weeklyProduct.product;

  // =========================
  // Расчёт скидки
  // =========================
  let discount: string | null = null;

  if (product.priceOld) {
    discount = calculateDiscount(product.price, product.priceOld);
  }

  // =========================
  // Получение первой картинки
  // =========================
  let image = null;

  if (product.images && product.images.length > 0) {
    image = product.images[0];
  }

  return (
    <Container>
      <section className={styles.hero}>
        {/* Слайдер баннеров */}
        <Slider images={BANNER_IMAGES} autoPlayInterval={7000} />

        {/* Карточка "Товар недели" */}
        <aside className={styles.weeklyProduct}>
          {/* Весь блок кликабельный → переход на страницу товара */}
          <Link
            href={`/catalog/product/${product.slug}`}
            className={styles.weeklyProductCard}
            aria-label={`Перейти к товару ${product.name}`}>
            {/* ================= HEADER ================= */}
            <div className={styles.weeklyProductHeader}>
              <span className={styles.weeklyProductTitleGroup}>
                <span className={styles.weeklyProductTitle}>Товар недели</span>

                <span className={styles.weeklyProductBrand}>CocktailDesign</span>
              </span>

              {/* Скидка показывается только если она есть */}
              {discount && <span className={styles.weeklyProductDiscount}>{discount}</span>}
            </div>

            {/* ================= CONTENT ================= */}
            <div className={styles.weeklyProductContent}>
              <div className={styles.weeklyProductBody}>
                <div className={styles.weeklyProductMain}>
                  {/* Текстовая часть */}
                  <div>
                    <p className={styles.weeklyProductDescription}>{product.name}</p>

                    {/* Блок цен */}
                    <div className={styles.weeklyProductPriceBlock}>
                      <span className={styles.weeklyProductPrice}>{formatPrice(product.price)}</span>

                      {/* старая цена показывается только если она больше */}
                      {product.priceOld > product.price && (
                        <span className={styles.weeklyProductOldPrice}>{formatPrice(product.priceOld)}</span>
                      )}
                    </div>
                  </div>

                  {/* Картинка товара */}
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
              </div>
            </div>
          </Link>
        </aside>
      </section>
    </Container>
  );
}
