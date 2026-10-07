// src/app/favorites/FavoritesClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import HeartIcon from "@/components/icons/HeartIcon";
import ProductList from "@/app/catalog/product-grid/ProductList";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { getProductsByIdsFromStrapi } from "@/lib/api/catalog/queries";

import type { CatalogProductPreview } from "@/lib/api/catalog/types";

import type { LegacyFavoriteIndex } from "@/lib/favorites/legacy";

import styles from "./Favorites.module.css";

export default function FavoritesClient() {
  const ids = useFavoritesStore(s => s.ids);
  const references = useFavoritesStore(s => s.references);
  const hasHydrated = useFavoritesStore(s => s.hasHydrated);
  const favoriteIds = useMemo(() => Object.keys(ids).filter(id => id.startsWith("product:")).map(id => id.slice(8)), [ids]);
  const legacyIds = useMemo(() => Object.keys(ids).filter(id => !id.startsWith("product:")), [ids]);
  const [products, setProducts] = useState<CatalogProductPreview[]>([]);
  const [candidates, setCandidates] = useState<LegacyFavoriteIndex>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!hasHydrated) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const items: CatalogProductPreview[] = [];
        for (let offset = 0; offset < favoriteIds.length; offset += 50) {
          const response = await getProductsByIdsFromStrapi(favoriteIds.slice(offset, offset + 50));
          items.push(...response.items.map(p => ({ ...p, preferredVariantId: references[`product:${p.id}`]?.variantId })));
        }
        if (cancelled) return;
        setProducts(items);
        const recovery: LegacyFavoriteIndex = {};
        for (let offset = 0; offset < legacyIds.length; offset += 50) {
          const batch = legacyIds.slice(offset, offset + 50);
          const response = await fetch(`/api/legacy-favorites?ids=${encodeURIComponent(batch.join(","))}`);
          if (!response.ok) throw new Error("Recovery unavailable");
          Object.assign(recovery, (await response.json()).candidates);
        }
        if (cancelled) return;
        setCandidates(recovery);
        for (const id of legacyIds) {
          if (recovery[id]?.length === 1) useFavoritesStore.getState().resolveLegacy(id, recovery[id][0]);
        }
      } catch { if (!cancelled) setError(true); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [hasHydrated, favoriteIds, legacyIds, references, revision]);

  const recovery = legacyIds.length > 0 && !error && <section className={styles.recovery} aria-label="Ранее сохранённые товары">
    <h2>Ранее сохранённые товары</h2>
    <p>В старой записи не сохранилось точное название. Выберите нужный товар, чтобы вернуть его в избранное.</p>
    {legacyIds.map(id => <div key={id} className={styles.recoveryRow}>
      {(candidates[id] ?? []).map(p => <button key={p.productId} type="button"
        onClick={() => useFavoritesStore.getState().resolveLegacy(id, p)}>{p.name}</button>)}
      {!candidates[id]?.length && <span>Товар пока недоступен в каталоге. Запись сохранена.</span>}
      <button type="button" onClick={() => useFavoritesStore.getState().resolveLegacy(id)}>Удалить старую запись</button>
    </div>)}
  </section>;
  const notice = error && <div className={styles.recovery} role="status">
    <p>Не удалось загрузить избранное. Сохранённые товары не удалены.</p>
    <button type="button" onClick={() => setRevision(v => v + 1)}>Повторить</button>
  </div>;

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
  if (products.length === 0 && legacyIds.length === 0 && !error) {
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

  return <>{notice}{products.length > 0 && <ProductList products={products} />}{recovery}</>;
}
