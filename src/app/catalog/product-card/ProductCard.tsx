// src/app/catalog/product-card/ProductCard.tsx
import styles from "./ProductCard.module.css";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import Image from "next/image";
import { useState } from "react";
import HeartIcon from "@/components/icons/HeartIcon";
import { useFavorite } from "@/lib/favorites/useFavorite";

type ProductCardProps = {
  product: CatalogProductPreview;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [engravingEnabled, setEngravingEnabled] = useState<boolean>(false);
  const { isFavorite, toggleFavorite } = useFavorite(product.id);

  function increment() {
    setQuantity((prev) => prev + 1);
  }

  function decrement() {
    setQuantity((prev) => {
      // защита: нельзя меньше 1
      if (prev <= 1) return 1;
      return prev - 1;
    });
  }

  const imageSrc = product.imageUrl?.trim() ? product.imageUrl : "/images/catalog/product-placeholder.webp";

  return (
    <article className={styles.card}>
      {/* Картинки пока не трогаем: просто заглушка */}
      <div className={styles.thumb}>
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 50vw, 25vw"></Image>

        {/* Иконка избранное */}

        <button
          className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite();
          }}
          aria-pressed={isFavorite}>
          <HeartIcon className={styles.favoriteIcon} />
        </button>
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
                  // когда пользователь удалил значение (пустая строка)
                  if (raw === "") {
                    setQuantity(1);
                    return;
                  }

                  const next = Number(raw);
                  // защита от NaN и значений меньше 1
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
      </div>
    </article>
  );
}
