// src/app/catalog/product-card/ProductCard.tsx
import styles from "./ProductCard.module.css";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";

type ProductCardProps = {
  product: CatalogProductPreview;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      {/* Картинки пока не трогаем: просто заглушка */}
      <div className={styles.thumb} />

      <h3 className={styles.title}>{product.name}</h3>

      <p className={styles.meta}>{product.price} ₽</p>
    </article>
  );
}
