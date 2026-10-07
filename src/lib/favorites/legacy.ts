import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import type { FavoriteReference } from "./favoritesStore";

export type LegacyFavoriteCandidate = FavoriteReference & { name: string };
export type LegacyFavoriteIndex = Record<string, LegacyFavoriteCandidate[]>;

export function indexLegacyFavorites(products: CatalogProductPreview[], index: LegacyFavoriteIndex = {}) {
  const add = (id: string, candidate: LegacyFavoriteCandidate) => {
    const existing = index[id] ??= [];
    if (!existing.some(p => p.productId === candidate.productId)) existing.push(candidate);
  };
  for (const p of products) {
    add(p.id, { productId: p.id, slug: p.slug, name: p.name, variantId: null });
    for (const v of p.variants) add(v.id, { productId: p.id, slug: p.slug, name: v.name, variantId: v.id });
  }
  return index;
}
