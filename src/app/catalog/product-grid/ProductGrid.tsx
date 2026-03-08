// src/app/catalog/product-grid/ProductGrid.tsx
// Server Component — данные грузятся на сервере, клиент получает готовый HTML.

import styles from "./ProductGrid.module.css";
import ProductCard from "../product-card/ProductCard";
import { getProductsByCategorySlugFromStrapi } from "@/lib/api/catalog";

type ProductGridProps = {
  categorySlug: string;
};

const PAGE_SIZE = 50;

// async — потому что мы делаем await внутри
// В App Router Server Components могут быть async — это нормально
export default async function ProductGrid({ categorySlug }: ProductGridProps) {
  // Грузим товары прямо здесь — на сервере, до отдачи HTML клиенту
  // Никакого useEffect, никакого "Загрузка..."
  const res = await getProductsByCategorySlugFromStrapi({
    categorySlug,
    limit: PAGE_SIZE,
    offset: 0,
  });

  const products = res.items;

  // Пустая категория
  if (products.length === 0) {
    return <p className={styles.state}>В этой категории пока нет товаров.</p>;
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
