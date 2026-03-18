// src/app/catalog/product-grid/ProductGrid.tsx

import styles from "./ProductGrid.module.css";
import ProductCard from "../product-card/ProductCard";
import { getProductsByCategorySlugFromStrapi, getCollectionProductsFromStrapi } from "@/lib/api/catalog";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";

type ProductGridProps = {
  categorySlug?: string;
  collectionSlug?: string;
  filterCategorySlug?: string; // фильтр по категории внутри коллекции
};

const PAGE_SIZE = 50;

export default async function ProductGrid({ categorySlug, collectionSlug, filterCategorySlug }: ProductGridProps) {
  let products: CatalogProductPreview[] = [];

  if (collectionSlug) {
    // Грузим товары коллекции — с опциональным фильтром по категории
    const res = await getCollectionProductsFromStrapi({
      slug: collectionSlug,
      limit: PAGE_SIZE,
      offset: 0,
      categorySlug: filterCategorySlug,
    });
    products = res.items;
  } else if (categorySlug) {
    // Грузим товары категории — старая логика
    const res = await getProductsByCategorySlugFromStrapi({
      categorySlug,
      limit: PAGE_SIZE,
      offset: 0,
    });
    products = res.items;
  }

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
