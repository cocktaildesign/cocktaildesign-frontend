"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import FavoriteButton from "@/components/ui/favorites/FavoriteButton";

import type { CatalogProductPreview } from "@/lib/api/catalog/types";

import styles from "./HomeProductCard.module.css";

type ProductCardProps = {
  product: CatalogProductPreview;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

function getDiscountPercent(price: number, priceOld: number): number | null {
  if (price <= 0) {
    return null;
  }

  if (priceOld <= price) {
    return null;
  }

  const percent = Math.round(((priceOld - price) / priceOld) * 100);

  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  return percent;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const productHref = product.preferredVariantId
    ? `/catalog/product/${product.slug}?variant=${encodeURIComponent(product.preferredVariantId)}`
    : `/catalog/product/${product.slug}`;
  const imagesCount = product.images.length;

  const imageSrc = product.images[activeImageIndex] ?? product.imageUrl ?? "/images/catalog/product-placeholder.webp";

  const hasDiscount = product.priceOld > product.price;
  const discountPercent = getDiscountPercent(product.price, product.priceOld);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (imagesCount <= 1) {
      return;
    }

    const cardRect = event.currentTarget.getBoundingClientRect();
    const cursorX = event.clientX - cardRect.left;
    const cursorFraction = cursorX / cardRect.width;

    const nextImageIndex = Math.min(Math.floor(cursorFraction * imagesCount), imagesCount - 1);

    setActiveImageIndex(nextImageIndex);
  }

  function handleMouseLeave() {
    setActiveImageIndex(0);
  }

  return (
    <article className={styles.card}>
      <Link href={productHref} className={styles.previewLink}>
        {/* Картинка товара */}
        <div className={styles.thumb} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          <FavoriteButton productId={product.id} className={styles.favoriteButtonOverlay} />

          {imagesCount > 1 && (
            <div className={styles.dots}>
              {product.images.map((_, index) => (
                <span key={index} className={index === activeImageIndex ? styles.dotActive : styles.dot} />
              ))}
            </div>
          )}
        </div>

        {/* Цена и название */}
        <div className={styles.productBody}>
          {discountPercent !== null && <span className={styles.discountBadge}>-{discountPercent}%</span>}

          <div className={styles.priceBlock}>
            <p className={styles.price}>{formatPrice(product.price)} ₽</p>

            {hasDiscount && <p className={styles.priceOld}>{formatPrice(product.priceOld)} ₽</p>}
          </div>

          <div className={styles.productName}>
            <h3 className={styles.title}>{product.name}</h3>
          </div>
        </div>
      </Link>
    </article>
  );
}
