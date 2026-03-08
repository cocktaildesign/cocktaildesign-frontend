// frontend/src/app/catalog/product-card/ProductCard.tsx
"use client";
import QuantityControl from "@/components/ui/quantity/QuantityControl";
import EngravingToggle from "@/components/ui/engraving/EngravingToggle";
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

  // URL на страницу товара которая показывает добавялем кол-во и гравировка если есть
  const productHref = `/catalog/product/${product.slug}`;

  // Картинка (с фолбэком)
  const imageSrc = product.imageUrl?.trim() ? product.imageUrl : "/images/catalog/product-placeholder.webp";

  //URL
  return (
    <article className={styles.card}>
      {/* ====================================================================
          Кликабельное превью 
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
          <QuantityControl value={quantity} onChange={setQuantity} />

          <EngravingToggle
            checked={engravingEnabled}
            onChange={(nextChecked) => {
              setEngravingEnabled(nextChecked);
            }}
          />
        </div>

        <button type="button" className={styles.addToCartButton}>
          В корзину
        </button>
      </div>
    </article>
  );
}
