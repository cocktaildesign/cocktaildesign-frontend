// src/app/favorites/FavoritesClient.tsx
"use client";

import HeartIcon from "@/components/icons/HeartIcon";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { getProductsByIdsFromStrapi } from "@/lib/api/catalog/queries";

import ProductList from "@/app/catalog/product-grid/ProductList";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";

import styles from "./Favorites.module.css";

export default function FavoritesClient() {
  // 1) Подписываемся на ids и hydration
  // ids — объект, ссылка меняется только когда ты делаешь toggle
  const ids = useFavoritesStore((s) => s.ids);
  const hasHydrated = useFavoritesStore((s) => s.hasHydrated);

  // 2) Получаем массив id стабильно (не в селекторе zustand!)
  const favoriteIds = useMemo(() => Object.keys(ids), [ids]);

  const [products, setProducts] = useState<CatalogProductPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // До hydration не лезем в API, иначе будет "пусто" при рефреше
    if (!hasHydrated) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      if (favoriteIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const response = await getProductsByIdsFromStrapi(favoriteIds);

      if (cancelled) return;
      setProducts(response.items);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, favoriteIds]);

  // Пока hydration не завершился — показываем лоадер (без "мигания" пустого состояния)
  if (!hasHydrated || loading) {
    return <div className={styles.favoritesLoading}>Загрузка...</div>;
  }

  // Пустое состояние
  if (products.length === 0) {
    return (
      <div className={styles.favoritesState}>
        <div className={styles.favoritesStateIcon}>
          <HeartIcon />
        </div>
        <h2 className={styles.favoritesStateTitle}>Здесь будут ваши избранные товары</h2>
        <p className={styles.favoritesStateDescroption}>Добавьте товары, чтобы не искать их снова</p>
        <Link href="/catalog" className={styles.favoritesStateButtons}>
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return <ProductList products={products} />;
}
