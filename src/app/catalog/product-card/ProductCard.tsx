// frontend/src/app/catalog/product-card/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";
import styles from "./ProductCard.module.css";

import type { CatalogProductPreview } from "@/lib/api/catalog/types";

type ProductCardProps = {
  product: CatalogProductPreview;
};

export default function ProductCard({ product }: ProductCardProps) {
  // Количество (пока локально для UI)
  const [quantity, setQuantity] = useState<number>(1);
  // Флаг гравировки (пока локально для UI)
  const [engravingEnabled, setEngravingEnabled] = useState<boolean>(false);
  // Избранное (local storage / store)

  // URL на страницу товара
  const productHref = `/catalog/product/${product.slug}`;

  // Картинка (с фолбэком)
  const imageSrc = product.imageUrl?.trim() ? product.imageUrl : "/images/catalog/product-placeholder.webp";

  function increment() {
    setQuantity((prev) => prev + 1);
  }

  function decrement() {
    setQuantity((prev) => {
      // Защита: нельзя меньше 1
      if (prev <= 1) return 1;
      return prev - 1;
    });
  }

  return (
    <article className={styles.card}>
      {/* ====================================================================
          Кликабельное превью (вариант A): картинка + цена + название
          ==================================================================== */}
      <Link href={productHref} className={styles.previewLink}>
        <div className={styles.thumb}>
          {/* Основное изображение товара */}
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Кнопка избранного поверх изображения */}
          <FavoriteButton productId={product.id} className={styles.favoriteButtonOverlay} />
        </div>

        <div className={styles.productBody}>
          <div className={styles.productInfo}>
            <div className={styles.priceBlock}>
              <p className={styles.price}>{product.price} ₽</p>
            </div>

            <div className={styles.productName}>
              <h3 className={styles.title}>{product.name}</h3>
            </div>
          </div>
        </div>
      </Link>

      {/* ====================================================================
          Некликабельная зона действий: количество / гравировка / в корзину
          ==================================================================== */}
      <div className={styles.purchaseSection}>
        <div className={styles.productActions}>
          <div className={styles.quantityControl}>
            <button
              type="button"
              className={styles.quantityButton}
              aria-label="Уменьшить количество"
              onClick={decrement}>
              -
            </button>

            <input
              type="number"
              className={styles.quantityInput}
              aria-label="Количество"
              min={1}
              value={quantity}
              onChange={(changeEvent) => {
                const raw = changeEvent.target.value;

                // Когда пользователь удалил значение (пустая строка)
                if (raw === "") {
                  setQuantity(1);
                  return;
                }

                const next = Number(raw);

                // Защита от NaN и значений меньше 1
                if (!Number.isFinite(next) || next < 1) {
                  setQuantity(1);
                  return;
                }

                setQuantity(next);
              }}
            />

            <button
              type="button"
              className={styles.quantityButton}
              aria-label="Увеличить количество"
              onClick={increment}>
              +
            </button>
          </div>

          <label className={styles.engravingControl}>
            <input
              type="checkbox"
              checked={engravingEnabled}
              className={styles.engravingCheckbox}
              onChange={(eventChange) => {
                setEngravingEnabled(eventChange.target.checked);
              }}
            />
            <span className={styles.switch} aria-hidden="true" />
            <span className={styles.label}>Гравировка</span>
          </label>
        </div>

        <button type="button" className={styles.addToCartButton}>
          В корзину
        </button>
      </div>
    </article>
  );
}
