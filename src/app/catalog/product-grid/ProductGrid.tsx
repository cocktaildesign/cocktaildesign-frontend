// src/app/catalog/product-grid/ProductGrid.tsx

import { getProductsByCategorySlugFromStrapi, getCollectionProductsFromStrapi } from "@/lib/api/catalog";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import { getColorMap } from "@/lib/api/catalog/index";
import ProductGridClient from "./ProductGridClient";
import { notFound } from "next/navigation";

type ProductGridProps = {
  categorySlug?: string;
  collectionSlug?: string;
  filterCategorySlug?: string; // фильтр по категории внутри коллекции
  page?: number;
};

const PAGE_SIZE = 50;

export default async function ProductGrid({ categorySlug, collectionSlug, filterCategorySlug, page = 1 }: ProductGridProps) {
  let products: CatalogProductPreview[] = [];
  let hasMore = false;
  const offset = (page - 1) * PAGE_SIZE;

  const colorMap = await getColorMap();

  if (collectionSlug) {
    // Грузим товары коллекции — с опциональным фильтром по категории
    const res = await getCollectionProductsFromStrapi({
      slug: collectionSlug,
      limit: PAGE_SIZE,
      offset,
      categorySlug: filterCategorySlug,
    });

    products = res.items;
    hasMore = res.hasMore;
  } else if (categorySlug) {
    // Грузим товары категории — старая логика
    const res = await getProductsByCategorySlugFromStrapi({
      categorySlug,
      limit: PAGE_SIZE,
      offset,
    });

    products = res.items;
    hasMore = res.hasMore;
  }

  if (page > 1 && products.length === 0) notFound();

  // key меняется только при смене выдачи (подборка / категория / страница),
  // чтобы ProductGridClient перемонтировался и взял новые initialProducts.
  // При load more key стабилен — подгруженные товары не сбрасываются.
  const gridKey = collectionSlug
    ? `collection:${collectionSlug}:category:${filterCategorySlug ?? "all"}`
    : `category:${categorySlug ?? "all"}`;

  return (
    <ProductGridClient
      key={`${gridKey}:page:${page}`}
      initialProducts={products}
      initialHasMore={hasMore}
      pageSize={PAGE_SIZE}
      initialPage={page}
      categorySlug={categorySlug}
      collectionSlug={collectionSlug}
      filterCategorySlug={filterCategorySlug}
      colorMap={colorMap}
    />
  );
}
