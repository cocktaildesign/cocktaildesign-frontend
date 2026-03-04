// src/lib/api/catalog/queries.ts
// ============================================================================
// Запросы к Strapi для каталога.
// Здесь нет JSX и UI — только загрузка данных и подготовка Domain-формата.
// ============================================================================

import { fetchStrapi } from "@/lib/api/strapi/client";

import type {
  BreadcrumbCategory,
  CatalogCategoryPreview,
  CatalogProductDetail,
  CatalogProductsResponse,
  CatalogVariant,
  StrapiCatalogProductBySlugResponse,
  StrapiCategoryListResponse,
  StrapiProductItem,
} from "./types";

import { mapCategoryPreview, mapProductDetail, mapProductPreview, mapVariants } from "./mappers";

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

  // 1) создаём узлы
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

  // 2) связываем parent → children
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

  // 3) скрываем технический root
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
// ТОВАРЫ (список / грид)
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

// ============================================================================
// ТОВАР (детальная страница /catalog/product/[slug])
// ============================================================================

export type CatalogProductPageData = {
  product: CatalogProductDetail;
  variants: CatalogVariant[];
  breadcrumbsCategories: BreadcrumbCategory[];
};

// ----------------------------------------------------------------------------
// Товар по slug (детальная страница)
// ----------------------------------------------------------------------------
export async function getProductBySlugFromStrapi(slug: string): Promise<CatalogProductPageData | null> {
  const rawSlug = slug.trim();
  if (!rawSlug) return null;

  // 1) Нормализуем slug:
  //    принимаем "ms-xxxxxxxx-любая-строка" и режем до "ms-xxxxxxxx"
  //    чтобы совпасть с тем, что хранится в Strapi.
  const stableSlug = rawSlug.startsWith("ms-") ? rawSlug.slice(0, 11) : rawSlug;

  try {
    // 2) Запрашиваем backend по стабильному slug
    const response: StrapiCatalogProductBySlugResponse = await fetchStrapi("/api/catalog/product", {
      slug: stableSlug,
    });

    // 3) Маппим Strapi → Domain
    const product = mapProductDetail(response.item);
    if (!product) return null;

    // 4) variants: маппим в безопасный Domain-формат
    const variants = mapVariants(response.variants);

    return {
      product,
      variants,
      breadcrumbsCategories: response.breadcrumbsCategories ?? [],
    };
  } catch (e) {
    // 404 = не найдено → вернём null, страница покажет notFound()
    const message = e instanceof Error ? e.message : "";
    if (message.includes(" 404 ") || message.includes("Not Found")) return null;

    // Любая другая ошибка — это реально проблема
    throw e;
  }
}

// ============================================================================
// ИЗБРАННОЕ: ТОВАРЫ ПО ID
// ============================================================================

type StrapiCatalogProductsByIdsResponse = {
  items: StrapiProductItem[];
  // total/limit/offset/hasMore могут отсутствовать — это нормально для этого endpoint
  total?: number;
};

// ----------------------------------------------------------------------------
// Получить список товаров по массиву Strapi id.
// GET /api/catalog/products-by-ids?ids=867,866,848
//
// Возвращаем в формате CatalogProductsResponse, чтобы UI мог переиспользовать
// уже существующий подход (items/total/...)
// ----------------------------------------------------------------------------
export async function getProductsByIdsFromStrapi(productIds: string[]): Promise<CatalogProductsResponse> {
  // 1) Если ids пустой — сразу пустой результат (без запроса)
  if (productIds.length === 0) {
    return { items: [], total: 0, limit: 0, offset: 0, hasMore: false };
  }

  // 2) Нормализуем ids: trim + удаляем пустые
  const normalizedIds = productIds.map((id) => id.trim()).filter(Boolean);

  if (normalizedIds.length === 0) {
    return { items: [], total: 0, limit: 0, offset: 0, hasMore: false };
  }

  // 3) Query-параметр "ids" = "867,866"
  const idsParam = normalizedIds.join(",");

  const query: Record<string, string> = {
    ids: idsParam,
  };

  // 4) Запрос
  const response: StrapiCatalogProductsByIdsResponse = await fetchStrapi("/api/catalog/products-by-ids", query);

  // 5) Маппинг Strapi → Domain (как в остальных запросах)
  const items = (response.items ?? [])
    .map(mapProductPreview)
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    items,
    total: typeof response.total === "number" ? response.total : items.length,
    limit: normalizedIds.length,
    offset: 0,
    hasMore: false,
  };
}
