// src/app/favorites/FavoritesClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import HeartIcon from "@/components/icons/HeartIcon";
import ProductList from "@/app/catalog/product-grid/ProductList";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { getProductsByIdsFromStrapi } from "@/lib/api/catalog/queries";

import type { CatalogProductPreview } from "@/lib/api/catalog/types";

import styles from "./Favorites.module.css";

export default function FavoritesClient() {
  // Избранные id и состояние hydration из zustand
  const ids = useFavoritesStore((s) => s.ids);
  const hasHydrated = useFavoritesStore((s) => s.hasHydrated);

  // Стабильный массив id
  const favoriteIds = useMemo(() => Object.keys(ids), [ids]);

  const [products, setProducts] = useState<CatalogProductPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Пока zustand не гидратировался или идёт загрузка
  if (!hasHydrated || loading) {
    return (
      <div className={styles.favoritesLoading}>
        <div className={styles.favoritesLoadingCard}>
          <div className={styles.favoritesLoadingIcon}>
            <HeartIcon />
          </div>
          <p className={styles.favoritesLoadingText}>Загружаем избранные товары...</p>
        </div>
      </div>
    );
  }

  // Пустое состояние
  if (products.length === 0) {
    return (
      <div className={styles.favoritesState}>
        <div className={styles.favoritesStateCard}>
          <div className={styles.favoritesStateIcon}>
            <HeartIcon />
          </div>

          <h2 className={styles.favoritesStateTitle}>В избранном пока ничего нет</h2>

          <p className={styles.favoritesStateDescription}>
            Сохраняйте товары в избранное, чтобы быстро вернуться к ним позже.
          </p>

          <div className={styles.favoritesStateActions}>
            <Link href="/catalog" className={styles.primaryButton}>
              Перейти в каталог
            </Link>

            <Link href="/" className={styles.secondaryButton}>
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProductList products={products} />;
}
