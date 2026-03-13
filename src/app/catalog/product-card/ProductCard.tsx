// frontend/src/app/catalog/product-card/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import QuantityControl from "@/components/ui/quantity/QuantityControl";
import EngravingToggle from "@/components/ui/engraving/EngravingToggle";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";

import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: CatalogProductPreview;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

function getDiscountPercent(price: number, priceOld: number): number | null {
  if (price <= 0) return null;
  if (priceOld <= price) return null;

  const percent = Math.round(((priceOld - price) / priceOld) * 100);

  if (!Number.isFinite(percent) || percent <= 0) return null;

  return percent;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Количество товара — локальный стейт, пока не подключена корзина
  const [quantity, setQuantity] = useState<number>(1);

  // Включена ли гравировка — локальный стейт
  const [engravingChecked, setEngravingChecked] = useState<boolean>(false);

  // Индекс активной картинки для hover scrub
  // Меняется когда мышь двигается по изображению
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Ссылка на детальную страницу товара
  const productHref = `/catalog/product/${product.slug}`;

  // Берём активную картинку из массива.
  // Если массив пустой — фолбэк на imageUrl, потом на плейсхолдер
  const imageSrc = product.images[activeImageIndex] ?? product.imageUrl ?? "/images/catalog/product-placeholder.webp";

  // Есть ли скидка у товара
  const hasDiscount = product.priceOld > product.price;

  // Процент скидки для бейджа
  const discountPercent = getDiscountPercent(product.price, product.priceOld);

  // Вызывается при движении мыши над картинкой.
  // Делим ширину картинки на зоны по количеству фото —
  // мышь в левой зоне = первое фото, в правой = последнее.
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    // Если картинка одна — скраб не нужен
    if (product.images.length <= 1) return;

    // Размеры и позиция блока картинки на экране
    const rect = event.currentTarget.getBoundingClientRect();

    // Позиция мыши внутри блока (0 = левый край)
    const mouseX = event.clientX - rect.left;

    // Доля от 0 до 1 (где мышь относительно ширины)
    const fraction = mouseX / rect.width;

    // Переводим долю в индекс картинки
    const index = Math.min(Math.floor(fraction * product.images.length), product.images.length - 1);

    setActiveImageIndex(index);
  }

  // Мышь ушла с картинки — возвращаем первое фото
  function handleMouseLeave() {
    setActiveImageIndex(0);
  }

  return (
    <article className={styles.card}>
      {/* ================================================================
          КЛИКАБЕЛЬНАЯ ЗОНА: картинка + название + цена
          ================================================================ */}
      <Link href={productHref} className={styles.previewLink}>
        {/* Картинка с hover scrub */}
        <div className={styles.thumb} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Бейдж скидки */}
          {discountPercent !== null && <span className={styles.discountBadge}>-{discountPercent}%</span>}

          {/* Кнопка избранного поверх картинки */}
          <FavoriteButton productId={product.id} className={styles.favoriteButtonOverlay} />

          {/* Точки-индикаторы — только если картинок больше одной */}
          {product.images.length > 1 && (
            <div className={styles.dots}>
              {product.images.map((_, index) => (
                <span key={index} className={index === activeImageIndex ? styles.dotActive : styles.dot} />
              ))}
            </div>
          )}
        </div>

        {/* Цена и название */}
        <div className={styles.productBody}>
          <div className={styles.priceBlock}>
            <p className={styles.price}>{formatPrice(product.price)} ₽</p>

            {hasDiscount && <p className={styles.priceOld}>{formatPrice(product.priceOld)} ₽</p>}
          </div>

          <div className={styles.productName}>
            <h3 className={styles.title}>{product.name}</h3>
          </div>
        </div>
      </Link>

      {/* ================================================================
          НЕКЛИКАБЕЛЬНАЯ ЗОНА: количество / гравировка / корзина
          ================================================================ */}
      <div className={styles.purchaseSection}>
        {product.engravingEnabled ? (
          <>
            <div className={styles.productActions}>
              <QuantityControl value={quantity} onChange={setQuantity} />
              <EngravingToggle checked={engravingChecked} onChange={(checked) => setEngravingChecked(checked)} />
            </div>

            <button type="button" className={styles.addToCartButton}>
              В корзину
            </button>
          </>
        ) : (
          <div className={styles.actionsRow}>
            <QuantityControl value={quantity} onChange={setQuantity} />

            <button type="button" className={styles.addToCartButtonFull}>
              В корзину
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
