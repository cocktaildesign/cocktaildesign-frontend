"use client";

import styles from "./ProductList.module.css";
import ProductCard from "../product-card/ProductCard";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";

type ProductListProps = {
  products: CatalogProductPreview[];
  colorMap?: Record<string, string>;
};

export default function ProductList({ products, colorMap }: ProductListProps) {
  if (products.length === 0) {
    return <p className={styles.state}>Ничего не найдено.</p>;
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} colorMap={colorMap} />
      ))}
    </div>
  );
}
