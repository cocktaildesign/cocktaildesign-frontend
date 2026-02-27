// src/lib/api/catalog/queries.ts
// ============================================================================
// Запросы к Strapi для каталога.
// Здесь нет JSX и UI — только загрузка данных и подготовка Domain-формата.
// ============================================================================

import { fetchStrapi } from "@/lib/api/strapi/client";

import { CatalogCategoryPreview, StrapiCategoryListResponse } from "./types";
import { mapCategoryPreview } from "./mappers";

// "Верхний уровень витрины" = дети категории с id=14.

const CATALOG_ROOT_PARENT_ID = 14;

// Профиль параметров для /catalog (список верхнего уровня).
const TOP_CATEGORIES_PARAMS: Record<string, string> = {
  sort: "name:asc",
  // Важно: медиа не возвращается автоматически, нужно populate.
  "populate[image]": "true",
  "populate[children][sort]": "name:asc",

  // Фильтр: только верхний уровень (1)
  "filters[parent][id][$eq]": String(CATALOG_ROOT_PARENT_ID),
};

// Получить категории верхнего уровня для страницы /catalog.
export async function getTopCategoriesFromStrapi(): Promise<CatalogCategoryPreview[]> {
  const response: StrapiCategoryListResponse = await fetchStrapi("/api/moysklad-categories", TOP_CATEGORIES_PARAMS);

  // Маппим каждый item в Domain-тип.
  // mapCategoryPreview может вернуть null (если нет name/slug),
  // поэтому делаем фильтрацию.

  // Создаём пустой массив для результата.
  const result: CatalogCategoryPreview[] = [];

  // Проходим по всем категориям из Strapi.
  for (const item of response.data) {
    // Преобразуем Strapi → Domain.
    const mapped = mapCategoryPreview(item);

    // mapCategoryPreview может вернуть null (если нет name или slug).
    // Поэтому добавляем только валидные категории.
    if (mapped !== null) {
      result.push(mapped);
    }
  }

  // Возвращаем готовый массив.
  return result;
}

// Получить одну категорию по slug (для страницы /catalog/[slug]).
export async function getCategoryBySlugFromStrapi(slug: string): Promise<CatalogCategoryPreview | null> {
  const safeSlug = slug.trim();
  if (!safeSlug) return null;

  const params: Record<string, string> = {
    "filters[slug][$eq]": safeSlug,
  };

  const response: StrapiCategoryListResponse = await fetchStrapi("/api/moysklad-categories", params);

  const first = response.data[0];
  if (!first) return null;

  return mapCategoryPreview(first);
}
