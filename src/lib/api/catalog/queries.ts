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
// ----------------------------------------------------------------------------
// Дерево категорий для sidebar / mega-menu (любая глубина)
// ----------------------------------------------------------------------------

// FlatCategory — один элемент из /api/catalog/categories-flat
type FlatCategory = {
  id: string;
  slug: string;
  name: string;
  productsCount: number;
  parentId: string | null;
};

// normalizeCount
// Приводим счётчик к безопасному числу для UI.
function normalizeCount(value: unknown): number {
  // Если не число — 0
  if (typeof value !== "number") return 0;

  // Если NaN/Infinity — 0
  if (!Number.isFinite(value)) return 0;

  // Если отрицательное или 0 — 0 (для витрины так проще)
  if (value <= 0) return 0;

  return value;
}

// buildCatalogTree
// Собираем дерево любой глубины из плоского списка.
function buildCatalogTree(flat: FlatCategory[]): CatalogCategoryPreview[] {
  // Map: ключ -> значение
  // ключ = id категории
  // значение = готовый узел для UI
  const byId = new Map<string, CatalogCategoryPreview>();

  // 1) Создаём все узлы заранее (без children)
  for (const item of flat) {
    // Без id/slug/name нельзя построить ссылку и отрисовать пункт меню
    if (!item.id || !item.slug || !item.name) continue;

    byId.set(item.id, {
      id: item.id,
      slug: item.slug,
      name: item.name,

      // categories-flat не отдаёт картинки
      imageSrc: null,

      productsCount: normalizeCount(item.productsCount),

      // children появится только если реально есть дети
      children: undefined,
    });
  }

  // 2) Связываем parent -> children
  const roots: CatalogCategoryPreview[] = [];

  for (const item of flat) {
    const node = byId.get(item.id);
    if (!node) continue;

    // Корень
    if (!item.parentId) {
      roots.push(node);
      continue;
    }

    const parent = byId.get(item.parentId);

    // Если родителя нет — не теряем узел
    if (!parent) {
      roots.push(node);
      continue;
    }

    // Ленивая инициализация массива детей
    if (!parent.children) parent.children = [];
    parent.children.push(node);
  }

  // 3) Скрываем "технический root", если он один
  if (roots.length === 1) {
    return roots[0].children ?? [];
  }

  return roots;
}

// getCatalogTreeFromStrapi
// Публичная функция для UI: грузит flat и строит дерево.
export async function getCatalogTreeFromStrapi(): Promise<CatalogCategoryPreview[]> {
  const flat: FlatCategory[] = await fetchStrapi("/api/catalog/categories-flat");
  return buildCatalogTree(flat);
}
