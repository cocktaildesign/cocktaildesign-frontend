// src/app/catalog/product-grid/ProductGrid.tsx

import styles from "./ProductGrid.module.css";
import { getProductsByCategorySlugFromStrapi, getCollectionProductsFromStrapi } from "@/lib/api/catalog";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import { getColorMap } from "@/lib/api/catalog/index";
import ProductGridClient from "./ProductGridClient";

type ProductGridProps = {
  categorySlug?: string;
  collectionSlug?: string;
  filterCategorySlug?: string; // фильтр по категории внутри коллекции
};

const PAGE_SIZE = 50;

export default async function ProductGrid({ categorySlug, collectionSlug, filterCategorySlug }: ProductGridProps) {
  let products: CatalogProductPreview[] = [];
  let hasMore = false;

  const colorMap = await getColorMap();

  if (collectionSlug) {
    // Грузим товары коллекции — с опциональным фильтром по категории
    const res = await getCollectionProductsFromStrapi({
      slug: collectionSlug,
      limit: PAGE_SIZE,
      offset: 0,
      categorySlug: filterCategorySlug,
    });

    products = res.items;
    hasMore = res.hasMore;
  } else if (categorySlug) {
    // Грузим товары категории — старая логика
    const res = await getProductsByCategorySlugFromStrapi({
      categorySlug,
      limit: PAGE_SIZE,
      offset: 0,
    });

    products = res.items;
    hasMore = res.hasMore;
  }

  return (
    <ProductGridClient
      initialProducts={products}
      initialHasMore={hasMore}
      pageSize={PAGE_SIZE}
      categorySlug={categorySlug}
      collectionSlug={collectionSlug}
      filterCategorySlug={filterCategorySlug}
      colorMap={colorMap}
    />
  );
}
