// src/components/catalog/product-grid/ProductGrid.tsx

import ProductCard from "../product-card/ProductCard";
import styles from "./ProductGrid.module.css";

/**
 * ProductGrid
 *
 * Отвечает только за layout сетки.
 * Не знает про API, категории и т.д.
 *
 * Сейчас рендерим заглушки.
 * Позже заменим на реальные products.map(...)
 */
export default function ProductGrid() {
  return (
    <div className={styles.grid}>
      {/* Заглушки */}
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
    </div>
  );
}
