// ============================================================================
//frontend/src/lib/api/catalog/queries.ts
// Запросы к Strapi для каталога.
// Здесь нет JSX и UI — только загрузка данных и подготовка Domain-формата.
// ============================================================================

import { fetchStrapi } from "@/lib/api/strapi/client";

import type {
  BreadcrumbCategory,
  CatalogCategoryPreview,
  CatalogCollection,
  CatalogProductDetail,
  CatalogProductsResponse,
  CatalogVariant,
  StrapiCatalogCollectionsResponse,
  StrapiCatalogProductBySlugResponse,
  StrapiCategoryListResponse,
  StrapiCollectionSelectionMode,
  StrapiProductItem,
  StrapiWeeklyProductBlockResponse,
  WeeklyProductBlock,
} from "./types";

import {
  mapCatalogCollectionBase,
  mapCategoryPreview,
  mapProductDetail,
  mapProductPreview,
  mapVariants,
  mapWeeklyProductBlock,
} from "./mappers";

// ============================================================================
// КАТЕГОРИИ
// ============================================================================

const CATALOG_ROOT_PARENT_ID = 14;

const TOP_CATEGORIES_PARAMS: Record<string, string> = {
  sort: "name:asc",
  "populate[image]": "true",
  "populate[children][sort]": "name:asc",
  "filters[parent][id][$eq]": String(CATALOG_ROOT_PARENT_ID),
};

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

export async function getCategoryBySlugFromStrapi(slug: string): Promise<CatalogCategoryPreview | null> {
  const safeSlug = slug.trim();
  if (!safeSlug) return null;

  // Берём полное дерево — оно уже содержит children на всех уровнях
  const tree = await getCatalogTreeFromStrapi();

  // Ищем категорию рекурсивно по слагу
  return findCategoryInTree(tree, safeSlug);
}

// Рекурсивный поиск категории в дереве по слагу
function findCategoryInTree(items: CatalogCategoryPreview[], slug: string): CatalogCategoryPreview | null {
  for (const item of items) {
    if (item.slug === slug) return item;

    if (item.children && item.children.length > 0) {
      const found = findCategoryInTree(item.children, slug);
      if (found) return found;
    }
  }

  return null;
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

function normalizeCount(value: unknown): number {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;

  return value;
}

function buildCatalogTree(flat: FlatCategory[]): CatalogCategoryPreview[] {
  const byId = new Map<string, CatalogCategoryPreview>();

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

  if (roots.length === 1) {
    return roots[0].children ?? [];
  }

  return roots;
}

export async function getCatalogTreeFromStrapi(): Promise<CatalogCategoryPreview[]> {
  const flat: FlatCategory[] = await fetchStrapi("/api/catalog/categories-flat");

  return buildCatalogTree(flat);
}

// ============================================================================
// ДОЧЕРНИЕ КАТЕГОРИИ С КАРТИНКАМИ (для мобильного drill-down)
// ============================================================================

export async function getChildCategoriesFromStrapi(parentSlug: string): Promise<CatalogCategoryPreview[]> {
  const safeSlug = parentSlug.trim();
  if (!safeSlug) return [];

  const params: Record<string, string> = {
    "filters[slug][$eq]": safeSlug,
    "populate[children][populate][image]": "true",
    "populate[children][sort]": "name:asc",
  };

  const response: StrapiCategoryListResponse = await fetchStrapi("/api/moysklad-categories", params);


  const parent = response.data[0];
  if (!parent) return [];

  const source = parent.attributes ?? parent;
  const childrenData = Array.isArray(source.children) ? source.children : (source.children?.data ?? []);


  const result: CatalogCategoryPreview[] = [];

  for (const child of childrenData) {
    const mapped = mapCategoryPreview(child);
    if (mapped) result.push(mapped);
  }

  return result;
}

// ============================================================================
// ТОВАРЫ (список / грид)
// ============================================================================

type GetProductsParams = {
  categorySlug: string;
  limit: number;
  offset: number;
};

type GetDiscountedProductsParams = {
  limit: number;
  offset: number;
};

type StrapiCatalogProductsResponse = {
  items: StrapiProductItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

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

  const limit = Number.isFinite(params.limit) && params.limit > 0 ? Math.min(params.limit, 100) : 50;
  const offset = Number.isFinite(params.offset) && params.offset >= 0 ? params.offset : 0;

  const query: Record<string, string> = {
    categorySlug: safeSlug,
    limit: String(limit),
    offset: String(offset),
  };

  const response: StrapiCatalogProductsResponse = await fetchStrapi("/api/catalog/products", query);

  const items = response.items.map(mapProductPreview).filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    items,
    total: response.total,
    limit: response.limit,
    offset: response.offset,
    hasMore: response.hasMore,
  };
}

export async function getDiscountedProductsFromStrapi(
  params: GetDiscountedProductsParams,
): Promise<CatalogProductsResponse> {
  const limit = Number.isFinite(params.limit) && params.limit > 0 ? Math.min(params.limit, 100) : 50;
  const offset = Number.isFinite(params.offset) && params.offset >= 0 ? params.offset : 0;

  const query: Record<string, string> = {
    limit: String(limit),
    offset: String(offset),
  };

  const response: StrapiCatalogProductsResponse = await fetchStrapi("/api/catalog/products-discounted", query);

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
// ПОДБОРКИ ТОВАРОВ ДЛЯ ГЛАВНОЙ (catalog-collections)
// ============================================================================

function normalizeSelectionMode(value: unknown): StrapiCollectionSelectionMode {
  if (value === "category") return "category";
  if (value === "discount") return "discount";
  return "manual";
}

function buildCollectionViewAllHref(params: {
  selectionMode: StrapiCollectionSelectionMode;
  collectionSlug: string;
  sourceCategorySlug: string | null;
}): string | null {
  if (params.collectionSlug) {
    return `/catalog/collection/${params.collectionSlug}`;
  }

  return null;
}

export async function getCatalogCollectionsWithProductsFromStrapi(): Promise<CatalogCollection[]> {
  const params: Record<string, string> = {
    sort: "sortOrder:asc",
    "populate[products][populate]": "image",
    "populate[sourceCategory]": "true",
  };

  try {
    const response: StrapiCatalogCollectionsResponse = await fetchStrapi("/api/catalog-collections", params);

    const result: CatalogCollection[] = [];
    const rawCollections = response.data ?? [];

    for (const item of rawCollections) {
      const base = mapCatalogCollectionBase(item);
      if (!base) continue;

      const selectionMode = normalizeSelectionMode(item.selectionMode);
      const sourceCategorySlug = item.sourceCategory?.slug?.trim() ?? null;
      const products: CatalogCollection["products"] = [];

      if (selectionMode === "manual") {
        const rawProducts = Array.isArray(item.products) ? item.products : [];

        for (const product of rawProducts) {
          const mapped = mapProductPreview(product);

          if (mapped) {
            products.push(mapped);
          }
        }
      }

      if (selectionMode === "category" && sourceCategorySlug) {
        const categoryProductsResponse = await getProductsByCategorySlugFromStrapi({
          categorySlug: sourceCategorySlug,
          limit: 100,
          offset: 0,
        });

        products.push(...categoryProductsResponse.items);
      }

      if (selectionMode === "discount") {
        const discountedProductsResponse = await getDiscountedProductsFromStrapi({
          limit: 100,
          offset: 0,
        });

        products.push(...discountedProductsResponse.items);
      }

      result.push({
        ...base,
        viewAllHref: buildCollectionViewAllHref({
          selectionMode,
          collectionSlug: base.slug,
          sourceCategorySlug,
        }),
        products,
      });
    }

    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : "";

    if (
      message.includes(" 404 ") ||
      message.includes("Not Found") ||
      message.includes(" 403 ") ||
      message.includes("Forbidden")
    ) {
      return [];
    }

    throw e;
  }
}

// ============================================================================
// ТОВАР (детальная страница /catalog/product/[slug])
// ============================================================================

export type CatalogProductPageData = {
  product: CatalogProductDetail;
  variants: CatalogVariant[];
  breadcrumbsCategories: BreadcrumbCategory[];
};

export async function getProductBySlugFromStrapi(slug: string): Promise<CatalogProductPageData | null> {
  const rawSlug = slug.trim();
  if (!rawSlug) return null;

  const stableSlug = rawSlug.startsWith("ms-") ? rawSlug.slice(0, 11) : rawSlug;

  try {
    const response: StrapiCatalogProductBySlugResponse = await fetchStrapi("/api/catalog/product", {
      slug: stableSlug,
    });

    const product = mapProductDetail(response.item, response.bundleItems);
    if (!product) return null;

    const variants = mapVariants(response.variants);

    return {
      product,
      variants,
      breadcrumbsCategories: response.breadcrumbsCategories ?? [],
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes(" 404 ") || message.includes("Not Found")) return null;

    throw e;
  }
}

// ============================================================================
// ИЗБРАННОЕ: ТОВАРЫ ПО ID
// ============================================================================

type StrapiCatalogProductsByIdsResponse = {
  items: StrapiProductItem[];
  total?: number;
};

export async function getProductsByIdsFromStrapi(productIds: string[]): Promise<CatalogProductsResponse> {
  if (productIds.length === 0) {
    return { items: [], total: 0, limit: 0, offset: 0, hasMore: false };
  }

  const normalizedIds = productIds.map((id) => id.trim()).filter(Boolean);

  if (normalizedIds.length === 0) {
    return { items: [], total: 0, limit: 0, offset: 0, hasMore: false };
  }

  const idsParam = normalizedIds.join(",");

  const query: Record<string, string> = {
    ids: idsParam,
  };

  const response: StrapiCatalogProductsByIdsResponse = await fetchStrapi("/api/catalog/products-by-ids", query);

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

// ============================================================================
// ТОВАР НЕДЕЛИ
// ============================================================================

export async function getWeeklyProductBlock(): Promise<WeeklyProductBlock | null> {
  const params: Record<string, string> = {
    "populate[product][populate]": "image",
  };

  try {
    const response: StrapiWeeklyProductBlockResponse = await fetchStrapi("/api/weekly-product-block", params);

    return mapWeeklyProductBlock(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "";

    if (
      message.includes(" 404 ") ||
      message.includes("Not Found") ||
      message.includes(" 403 ") ||
      message.includes("Forbidden")
    ) {
      return null;
    }

    throw e;
  }
}

// ============================================================================
// КОЛЛЕКЦИИ — страница /catalog/collection/[slug]
// ============================================================================

export type CollectionMeta = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
};

type StrapiCollectionProductsResponse = {
  collection: CollectionMeta;
  items: StrapiProductItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export async function getCollectionProductsFromStrapi(params: {
  slug: string;
  limit: number;
  offset: number;
  categorySlug?: string;
}): Promise<{ collection: CollectionMeta } & CatalogProductsResponse> {
  const safeSlug = params.slug.trim();

  if (!safeSlug) {
    return {
      collection: { id: "", title: "", slug: "", description: null },
      items: [],
      total: 0,
      limit: params.limit,
      offset: params.offset,
      hasMore: false,
    };
  }

  const limit = Number.isFinite(params.limit) && params.limit > 0 ? Math.min(params.limit, 100) : 50;
  const offset = Number.isFinite(params.offset) && params.offset >= 0 ? params.offset : 0;

  const query: Record<string, string> = {
    limit: String(limit),
    offset: String(offset),
  };

  if (params.categorySlug?.trim()) {
    query.categorySlug = params.categorySlug.trim();
  }

  const response: StrapiCollectionProductsResponse = await fetchStrapi(
    `/api/catalog/collection/${safeSlug}/products`,
    query,
  );

  const items = response.items.map(mapProductPreview).filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    collection: response.collection,
    items,
    total: response.total,
    limit: response.limit,
    offset: response.offset,
    hasMore: response.hasMore,
  };
}

export async function getCollectionCategoriesTreeFromStrapi(slug: string): Promise<CatalogCategoryPreview[]> {
  const safeSlug = slug.trim();
  if (!safeSlug) return [];

  try {
    const flat: FlatCategory[] = await fetchStrapi(`/api/catalog/collection/${safeSlug}/categories-tree`);

    return buildCatalogTree(flat);
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("404") || message.includes("Not Found")) return [];
    throw e;
  }
}

// ============================================================================
// КОЛЛЕКЦИЯ ЦВЕТОВ
// ============================================================================

export async function getColorMap(): Promise<Record<string, string>> {
  try {
    const response = await fetchStrapi<{
      data: Array<{ id: number; name: string; hex: string }>;
    }>("/api/colors", { "pagination[pageSize]": "100" });

    const result: Record<string, string> = {};

    for (const item of response.data ?? []) {
      if (item.name && item.hex) {
        result[item.name.toLowerCase()] = item.hex.startsWith("#") ? item.hex : `#${item.hex}`;
      }
    }

    return result;
  } catch {
    return {};
  }
}
