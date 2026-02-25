// src/components/catalog/product-card/ProductCard.tsx

import styles from "./ProductCard.module.css";

/**
 * ProductCard (заглушка)
 *
 * Сейчас это просто UI-каркас.
 * Позже добавим:
 * - image
 * - price
 * - Link
 * - hover states
 */
export default function ProductCard() {
  return (
    <article className={styles.card}>
      {/* Изображение */}
      <div className={styles.thumb} />

      {/* Название */}
      <h3 className={styles.title}>Название товара</h3>

      {/* Цена / мета */}
      <p className={styles.meta}>1 990 ₽</p>
    </article>
  );
}
