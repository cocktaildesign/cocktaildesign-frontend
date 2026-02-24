// src/lib/api/catalog/mappers.ts
// ============================================================================
// Преобразование Strapi → Domain types для каталога.
// Это ЕДИНСТВЕННОЕ место, где мы:
// - лезем в item.attributes
// - учитываем populate / null / undefined
// - собираем абсолютные URL для картинок
// ============================================================================

import { getStrapiMediaUrl } from "@/lib/api/strapi/media";
import type { CatalogCategoryPreview, StrapiCategoryItem } from "./types";

//    mapCategoryPreview
//    Превращает одну категорию из Strapi в объект, удобный UI.

export function mapCategoryPreview(item: StrapiCategoryItem): CatalogCategoryPreview | null {
  const source = item.attributes ?? item;

  const name = source.name?.trim() ?? "";
  const slug = source.slug?.trim() ?? "";
  if (!name || !slug) return null;

  const image = source.image;

  const imagePath =
    image?.formats?.medium?.url ?? image?.formats?.small?.url ?? image?.formats?.thumbnail?.url ?? image?.url ?? null;

  const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;

  const altFromStrapi = image?.alternativeText?.trim() ?? "";
  const alt = altFromStrapi || name;

  // ✅ productsCount: приводим к числу, отрицательные/NaN → 0
  const rawCount = source.productsCount;
  const productsCount = typeof rawCount === "number" && Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 0;

  return {
    id: String(item.id),
    name,
    slug,
    imageSrc: imageUrl,
    alt,
    productsCount,
  };
}
