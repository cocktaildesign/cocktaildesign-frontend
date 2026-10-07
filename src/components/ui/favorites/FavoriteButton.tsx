"use client";

import { useState } from "react";
import styles from "./FavoriteButton.module.css";
import HeartIcon from "@/components/icons/HeartIcon";
import { favoriteKey, useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { getProductBySlugFromStrapi } from "@/lib/api/catalog/queries";

type FavoriteButtonProps = {
  productId?: string;
  slug: string;
  variantId?: string | null;
  code?: string;
  className?: string;
};

export default function FavoriteButton({ productId, slug, variantId, code, className = "" }: FavoriteButtonProps) {
  const savedKey = useFavoritesStore(state => Object.keys(state.ids).find(key =>
    key === (productId ? favoriteKey(productId) : "") || state.references[key]?.slug === slug));
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const isFavorite = Boolean(savedKey);

  async function toggle() {
    if (busy) return;
    if (savedKey) { useFavoritesStore.getState().toggle(savedKey); return; }
    setBusy(true);
    setFailed(false);
    try {
      // Only old cart rows need this GET: they did not save their parent ID.
      const data = productId ? null : await getProductBySlugFromStrapi(slug);
      const parentId = productId ?? data?.product.id;
      if (!parentId) throw new Error("Product unavailable");
      const selectedVariant = variantId ?? data?.variants.find(v => v.code === code)?.id ?? null;
      useFavoritesStore.getState().save({ productId: parentId, slug, variantId: selectedVariant });
    } catch { setFailed(true); }
    finally { setBusy(false); }
  }

  return <button type="button"
    className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ""} ${className}`.trim()}
    disabled={busy} aria-busy={busy} aria-pressed={isFavorite}
    title={failed ? "Не удалось сохранить. Нажмите, чтобы повторить." : undefined}
    aria-label={failed ? "Не удалось сохранить. Повторить добавление в избранное" : isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
    onClick={event => { event.preventDefault(); event.stopPropagation(); void toggle(); }}>
    <HeartIcon className={styles.favoriteIcon} />
  </button>;
}
