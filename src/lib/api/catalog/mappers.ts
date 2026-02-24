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
  // Достаём поля из Strapi-структуры.
  const source = item.attributes ?? item;

  const name = source.name?.trim() ?? "";
  const slug = source.slug?.trim() ?? "";

  // name и slug обязаны быть непустыми.
  if (!name || !slug) return null;

  // image в твоём API: либо объект, либо null, либо вообще отсутствует.
  const image = source.image;

  // Выбираем "лучший" путь картинки:
  // medium → small → thumbnail → оригинальный url.
  // (Это удобно: на /catalog обычно не нужна full-size картинка.)
  const imagePath =
    image?.formats?.medium?.url ?? image?.formats?.small?.url ?? image?.formats?.thumbnail?.url ?? image?.url ?? null;

  // Strapi отдаёт относительный путь "/uploads/..."
  // Превращаем его в абсолютный URL через helper.
  const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;

  // alt берём из Strapi, если он есть, иначе используем name.
  // Это полезно для a11y и для случаев, когда картинка не загрузилась.
  const altFromStrapi = image?.alternativeText?.trim() ?? "";
  const alt = altFromStrapi || name;

  return {
    id: String(item.id),
    name,
    slug,
    imageSrc: imageUrl,
    alt,
  };
}
