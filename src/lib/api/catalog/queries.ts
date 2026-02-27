// src/lib/api/catalog/queries.ts
// ============================================================================
// Запросы к Strapi для каталога.
// Здесь нет JSX и UI — только загрузка данных и подготовка Domain-формата.
// ============================================================================

import { fetchStrapi } from "@/lib/api/strapi/client";

import type {
  CatalogCategoryPreview,
  CatalogProductsResponse,
  StrapiCategoryListResponse,
  StrapiProductItem,
} from "./types";

import { mapCategoryPreview, mapProductPreview } from "./mappers";

// ============================================================================
// КАТЕГОРИИ
// ============================================================================

// "Верхний уровень витрины" = дети категории с id=14.
const CATALOG_ROOT_PARENT_ID = 14;

// Профиль параметров для /catalog (список верхнего уровня).
const TOP_CATEGORIES_PARAMS: Record<string, string> = {
  sort: "name:asc",

  // Важно: медиа не возвращается автоматически, нужно populate.
  "populate[image]": "true",
  "populate[children][sort]": "name:asc",

  // Фильтр: только верхний уровень
  "filters[parent][id][$eq]": String(CATALOG_ROOT_PARENT_ID),
};

// ----------------------------------------------------------------------------
// Получить категории верхнего уровня для страницы /catalog.
// ----------------------------------------------------------------------------
export async function getTopCategoriesFromStrapi(): Promise<CatalogCategoryPreview[]> {
  const response: StrapiCategoryListResponse = await fetchStrapi("/api/moysklad-categories", TOP_CATEGORIES_PARAMS);

  const result: CatalogCategoryPreview[] = [];

  for (const item of response.data) {
    const mapped = mapCategoryPreview(item);

    if (mapped !== null) {
      result.push(mapped);
    }
  }

  return result;
}

// ----------------------------------------------------------------------------
// Получить одну категорию по slug (для страницы /catalog/[slug]).
// ----------------------------------------------------------------------------
export async function getCategoryBySlugFromStrapi(slug: string): Promise<CatalogCategoryPreview | null> {
  const safeSlug = slug.trim();
  if (!safeSlug) return null;

  const params: Record<string, string> = {
    "filters[slug][$eq]": safeSlug,
    "populate[image]": "true",
    "populate[children]": "true",
  };

  const response: StrapiCategoryListResponse = await fetchStrapi("/api/moysklad-categories", params);

  const first = response.data[0];
  if (!first) return null;

  return mapCategoryPreview(first);
}

// ============================================================================
// ДЕРЕВО КАТЕГОРИЙ (flat → tree)
// ============================================================================

type FlatCategory = {
  id: string;
  slug: string;
  name: string;
  productsCount: number;
  parentId: string | null;
};

// ----------------------------------------------------------------------------
// normalizeCount
// Приводим счётчик к безопасному числу для UI.
// ----------------------------------------------------------------------------
function normalizeCount(value: unknown): number {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;

  return value;
}

// ----------------------------------------------------------------------------
// buildCatalogTree
// Собираем дерево любой глубины из плоского списка.
// ----------------------------------------------------------------------------
function buildCatalogTree(flat: FlatCategory[]): CatalogCategoryPreview[] {
  const byId = new Map<string, CatalogCategoryPreview>();

  // 1. создаём узлы
  for (const item of flat) {
    if (!item.id || !item.slug || !item.name) continue;

    byId.set(item.id, {
      id: item.id,
      slug: item.slug,
      name: item.name,
      imageSrc: null,
      productsCount: normalizeCount(item.productsCount),
      children: undefined,
    });
  }

  // 2. связываем parent → children
  const roots: CatalogCategoryPreview[] = [];

  for (const item of flat) {
    const node = byId.get(item.id);
    if (!node) continue;

    if (!item.parentId) {
      roots.push(node);
      continue;
    }

    const parent = byId.get(item.parentId);

    if (!parent) {
      roots.push(node);
      continue;
    }

    if (!parent.children) parent.children = [];
    parent.children.push(node);
  }

  // 3. скрываем технический root
  if (roots.length === 1) {
    return roots[0].children ?? [];
  }

  return roots;
}

// ----------------------------------------------------------------------------
// Публичная функция получения дерева категорий.
// ----------------------------------------------------------------------------
export async function getCatalogTreeFromStrapi(): Promise<CatalogCategoryPreview[]> {
  const flat: FlatCategory[] = await fetchStrapi("/api/catalog/categories-flat");

  return buildCatalogTree(flat);
}

// ============================================================================
// ТОВАРЫ
// ============================================================================

type GetProductsParams = {
  categorySlug: string;
  limit: number;
  offset: number;
};

// Ответ backend (сырой)
type StrapiCatalogProductsResponse = {
  items: StrapiProductItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

// ----------------------------------------------------------------------------
// Получить товары категории (с pagination).
// Backend должен включать товары всех потомков категории.
// ----------------------------------------------------------------------------
export async function getProductsByCategorySlugFromStrapi(params: GetProductsParams): Promise<CatalogProductsResponse> {
  const safeSlug = params.categorySlug.trim();

  if (!safeSlug) {
    return {
      items: [],
      total: 0,
      limit: params.limit,
      offset: params.offset,
      hasMore: false,
    };
  }

  // защита limit
  const limit = Number.isFinite(params.limit) && params.limit > 0 ? Math.min(params.limit, 100) : 50;

  const offset = Number.isFinite(params.offset) && params.offset >= 0 ? params.offset : 0;

  const query: Record<string, string> = {
    categorySlug: safeSlug,
    limit: String(limit),
    offset: String(offset),
  };

  const response: StrapiCatalogProductsResponse = await fetchStrapi("/api/catalog/products", query);

  // маппинг Strapi → Domain
  const items = response.items.map(mapProductPreview).filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    items,
    total: response.total,
    limit: response.limit,
    offset: response.offset,
    hasMore: response.hasMore,
  };
}
