"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductList from "./ProductList";
import styles from "./ProductGrid.module.css";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";

type ProductGridClientProps = {
  initialProducts: CatalogProductPreview[];
  initialHasMore: boolean;
  pageSize: number;
  categorySlug?: string;
  collectionSlug?: string;
  filterCategorySlug?: string;
  colorMap: Record<string, string>;
};

type ProductsApiResponse = {
  items?: CatalogProductPreview[];
  hasMore?: boolean;
};

async function fetchProductsBatch(params: {
  limit: number;
  offset: number;
  categorySlug?: string;
  collectionSlug?: string;
  filterCategorySlug?: string;
}): Promise<{ items: CatalogProductPreview[]; hasMore: boolean }> {
  const query = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });

  if (params.collectionSlug) {
    query.set("collectionSlug", params.collectionSlug);
    if (params.filterCategorySlug) {
      query.set("filterCategorySlug", params.filterCategorySlug);
    }
  } else if (params.categorySlug) {
    query.set("categorySlug", params.categorySlug);
  }

  const response = await fetch(`/api/catalog-load-more?${query.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.status}`);
  }

  const data = (await response.json()) as ProductsApiResponse;

  return {
    items: data.items ?? [],
    hasMore: data.hasMore === true,
  };
}

export default function ProductGridClient({
  initialProducts,
  initialHasMore,
  pageSize,
  categorySlug,
  collectionSlug,
  filterCategorySlug,
  colorMap,
}: ProductGridClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lockRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (lockRef.current || isLoading || !hasMore) return;
    if (!categorySlug && !collectionSlug) return;

    lockRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const offset = products.length;
      const response = await fetchProductsBatch({
        limit: pageSize,
        offset,
        categorySlug,
        collectionSlug,
        filterCategorySlug,
      });

      setProducts((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const appended = response.items.filter((item) => !existingIds.has(item.id));
        return appended.length > 0 ? [...current, ...appended] : current;
      });
      setHasMore(response.hasMore);
    } catch {
      setError("Не удалось загрузить товары");
    } finally {
      lockRef.current = false;
      setIsLoading(false);
    }
  }, [categorySlug, collectionSlug, filterCategorySlug, hasMore, isLoading, pageSize, products.length]);

  useEffect(() => {
    if (!hasMore) return;
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  if (products.length === 0) {
    return <p className={styles.state}>В этой категории пока нет товаров.</p>;
  }

  return (
    <div className={styles.listWrapper}>
      <ProductList products={products} colorMap={colorMap} />

      <div ref={sentinelRef} className={styles.loadMoreSentinel} aria-hidden="true" />

      {error && (
        <div className={styles.loadMoreStatus}>
          <p className={styles.loadMoreError}>{error}</p>
          <button type="button" className={styles.loadMoreButton} onClick={() => void loadMore()} disabled={isLoading}>
            Повторить
          </button>
        </div>
      )}

      {!error && hasMore && (
        <div className={styles.loadMoreStatus}>
          {isLoading ? (
            <p className={styles.loadMoreLoading}>Загружаем товары...</p>
          ) : (
            <button type="button" className={styles.loadMoreButton} onClick={() => void loadMore()}>
              Показать еще
            </button>
          )}
        </div>
      )}
    </div>
  );
}
