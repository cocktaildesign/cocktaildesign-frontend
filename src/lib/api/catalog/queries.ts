// ============================================================================
//frontend/src/lib/api/catalog/queries.ts
// Запросы к Strapi для каталога.
// Здесь нет JSX и UI — только загрузка данных и подготовка Domain-формата.
// ============================================================================

import { fetchStrapi } from "@/lib/api/strapi/client";
import { getStrapiMediaUrl } from "@/lib/api/strapi/media";

import type {
  BreadcrumbCategory,
  CatalogCategoryPreview,
  CatalogCollection,
  CatalogProductDetail,
  CatalogProductPreview,
  CatalogProductsResponse,
  CatalogVariant,
  HomepageCollectionReference,
  HomepageCollections,
  HomepageSettings,
  StrapiCatalogCollectionsResponse,
  StrapiCatalogProductBySlugResponse,
  StrapiCollectionSelectionMode,
  StrapiHomepageResponse,
  StrapiProductItem,
  StrapiWeeklyProductBlockResponse,
  WeeklyProductBlock,
} from "./types";

import {
  mapCatalogCollectionBase,
  mapProductDetail,
  mapProductPreview,
  mapVariants,
  mapWeeklyProductBlock,
} from "./mappers";

// ============================================================================
// КАТЕГОРИИ — поиск конкретной категории по slug
// ============================================================================

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
//
// Единый источник данных для меню/навигации/плиток на всём сайте.
// На бэке (/api/catalog/categories-flat):
// - применена сортировка menuOrder + алфавит
// - скрытые категории (isHiddenInMenu = true) отфильтрованы
// - есть imageUrl и alt
// ============================================================================

type FlatCategory = {
  id: string;
  slug: string;
  name: string;
  productsCount: number;
  parentId: string | null;
  // Новые поля из бэка — могут быть undefined для других эндпоинтов
  // (например /catalog/collection/:slug/categories-tree пока их не отдаёт)
  imageUrl?: string | null;
  alt?: string | null;
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

    // imageUrl с бэка приходит как относительный путь "/uploads/xxx.webp"
    // Превращаем его в абсолютный URL через getStrapiMediaUrl
    const imageSrc = item.imageUrl ? (getStrapiMediaUrl(item.imageUrl) ?? null) : null;

    // alt: если бэк прислал alt — используем его, иначе фолбэк на name
    const alt = typeof item.alt === "string" && item.alt.trim() ? item.alt.trim() : item.name;

    byId.set(item.id, {
      id: item.id,
      slug: item.slug,
      name: item.name,
      imageSrc,
      alt,
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
// ВЕРХНИЙ УРОВЕНЬ КАТЕГОРИЙ ИЗ ДЕРЕВА
//
// Используется на главной (PopularCategories), на /catalog и на /about.
// Возвращает только верхний уровень БЕЗ детей — чтобы плитки
// не таскали лишние данные о подкатегориях.
// ============================================================================

export async function getTopCategoriesFromTree(): Promise<CatalogCategoryPreview[]> {
  // Берём полное дерево — оно уже отсортировано на бэке
  const tree = await getCatalogTreeFromStrapi();

  // Возвращаем только верхний уровень БЕЗ детей
  return tree.map((node) => ({
    id: node.id,
    name: node.name,
    slug: node.slug,
    imageSrc: node.imageSrc,
    alt: node.alt,
    productsCount: node.productsCount,
    children: undefined,
  }));
}

// ============================================================================
// ДЕТИ КОНКРЕТНОЙ КАТЕГОРИИ ИЗ ДЕРЕВА
//
// Используется в мобильном drill-down на /catalog/[slug].
// Находим родителя в дереве по slug и возвращаем его children.
// ============================================================================

export async function getChildCategoriesFromTree(parentSlug: string): Promise<CatalogCategoryPreview[]> {
  const safeSlug = parentSlug.trim();
  if (!safeSlug) return [];

  // Берём всё дерево
  const tree = await getCatalogTreeFromStrapi();

  // Ищем родителя рекурсивно по слагу
  const parent = findCategoryInTree(tree, safeSlug);
  if (!parent) return [];

  // Возвращаем детей этого родителя (или пустой массив если детей нет)
  return parent.children ?? [];
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

function hasRealDiscount(item: { price: number; priceOld: number }): boolean {
  return item.price > 0 && item.priceOld > item.price;
}

export function prepareDiscountProductPreview(product: CatalogProductPreview): CatalogProductPreview {
  const variants = product.variants;

  const discountedWithIndex = variants
    .map((variant, index) => ({ variant, index }))
    .filter(({ variant }) => hasRealDiscount(variant));

  if (discountedWithIndex.length === 0) {
    return product;
  }

  discountedWithIndex.sort((a, b) => {
    const discountRateA =
      (a.variant.priceOld - a.variant.price) / a.variant.priceOld;

    const discountRateB =
      (b.variant.priceOld - b.variant.price) / b.variant.priceOld;

    if (discountRateB !== discountRateA) {
      return discountRateB - discountRateA;
    }

    const savingsA = a.variant.priceOld - a.variant.price;
    const savingsB = b.variant.priceOld - b.variant.price;

    if (savingsB !== savingsA) {
      return savingsB - savingsA;
    }

    return a.index - b.index;
  });

  const preferredVariant = discountedWithIndex[0].variant;
  const discountedVariants = discountedWithIndex.map(({ variant }) => variant);

  const preferredVariantImageSrcs = preferredVariant.images.map((image) => image.src);
  const images = Array.from(new Set([...preferredVariantImageSrcs, ...product.images]));

  return {
    ...product,
    price: preferredVariant.price,
    priceOld: preferredVariant.priceOld,
    code: preferredVariant.code ?? product.code,
    imageUrl: preferredVariant.images[0]?.src ?? product.imageUrl,
    images,
    variants: discountedVariants,
    preferredVariantId: preferredVariant.id,
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

  const items = response.items
    .map(mapProductPreview)
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .map(prepareDiscountProductPreview);

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

const HOME_COLLECTION_PRODUCTS_LIMIT = 100;

function normalizeSelectionMode(value: unknown): StrapiCollectionSelectionMode {
  if (value === "category") return "category";
  if (value === "discount") return "discount";
  if (value === "new") return "new";
  return "manual";
}

function normalizeHomepageCollectionReference(value: unknown): HomepageCollectionReference | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as HomepageCollectionReference;
  const slug = typeof item.slug === "string" ? item.slug.trim() : "";

  if (!slug) {
    return null;
  }

  return {
    id: item.id,
    documentId: item.documentId,
    title: item.title,
    slug,
    description: item.description,
    sortOrder: item.sortOrder,
    selectionMode: item.selectionMode,
  };
}

export async function getHomepageFromStrapi(): Promise<HomepageSettings> {
  const empty: HomepageSettings = {
    collectionAfterShortcuts: null,
    saleCollectionAfterTelegram: null,
    collectionAfterKnowledge: null,
    collectionAfterBanners: null,
  };

  try {
    const response: StrapiHomepageResponse = await fetchStrapi("/api/homepage", {
      populate: "*",
    });

    const data = response.data;

    if (!data) {
      return empty;
    }

    return {
      collectionAfterShortcuts: normalizeHomepageCollectionReference(data.collectionAfterShortcuts),
      saleCollectionAfterTelegram: normalizeHomepageCollectionReference(data.saleCollectionAfterTelegram),
      collectionAfterKnowledge: normalizeHomepageCollectionReference(data.collectionAfterKnowledge),
      collectionAfterBanners: normalizeHomepageCollectionReference(data.collectionAfterBanners),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "";

    if (
      message.includes(" 404 ") ||
      message.includes("Not Found") ||
      message.includes(" 403 ") ||
      message.includes("Forbidden")
    ) {
      return empty;
    }

    throw e;
  }
}

async function loadHomepageSlotCollection(
  reference: HomepageCollectionReference | null,
  requireDiscount = false,
): Promise<CatalogCollection | null> {
  if (!reference?.slug) {
    return null;
  }

  if (requireDiscount && normalizeSelectionMode(reference.selectionMode) !== "discount") {
    return null;
  }

  try {
    const data = await getCollectionProductsFromStrapi({
      slug: reference.slug,
      limit: HOME_COLLECTION_PRODUCTS_LIMIT,
      offset: 0,
    });

    if (!data.collection.slug || !data.collection.title) {
      return null;
    }

    if (requireDiscount && data.collection.selectionMode !== "discount") {
      return null;
    }

    const sortOrder =
      typeof reference.sortOrder === "number" && Number.isFinite(reference.sortOrder) ? reference.sortOrder : 0;

    return {
      id: data.collection.id,
      title: data.collection.title,
      slug: data.collection.slug,
      description: data.collection.description,
      sortOrder,
      viewAllHref: `/catalog/collection/${data.collection.slug}`,
      products: data.items,
    };
  } catch {
    return null;
  }
}

export async function getHomepageCollectionsFromStrapi(): Promise<HomepageCollections> {
  const empty: HomepageCollections = {
    collectionAfterShortcuts: null,
    saleCollectionAfterTelegram: null,
    collectionAfterKnowledge: null,
    collectionAfterBanners: null,
  };

  try {
    const homepage = await getHomepageFromStrapi();

    const [collectionAfterShortcuts, saleCollectionAfterTelegram, collectionAfterKnowledge, collectionAfterBanners] =
      await Promise.all([
        loadHomepageSlotCollection(homepage.collectionAfterShortcuts),
        loadHomepageSlotCollection(homepage.saleCollectionAfterTelegram, true),
        loadHomepageSlotCollection(homepage.collectionAfterKnowledge),
        loadHomepageSlotCollection(homepage.collectionAfterBanners),
      ]);

    return {
      collectionAfterShortcuts,
      saleCollectionAfterTelegram,
      collectionAfterKnowledge,
      collectionAfterBanners,
    };
  } catch {
    return empty;
  }
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
    "populate[products][populate][image]": "true",
    "populate[products][populate][variants][populate][image]": "true",
    "populate[sourceCategory]": "true",
  };

  try {
    const response: StrapiCatalogCollectionsResponse = await fetchStrapi("/api/catalog-collections", params);

    const result: CatalogCollection[] = [];
    // isHiddenInMenu не фильтруем здесь: скрытие только в большом меню «Каталог».
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
    "populate[product][populate][image]": "true",
    "populate[product][populate][variants][populate][image]": "true",
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
  selectionMode: StrapiCollectionSelectionMode;
};

type StrapiCollectionProductsResponse = {
  collection: Omit<CollectionMeta, "selectionMode"> & {
    selectionMode?: unknown;
  };
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
      collection: {
        id: "",
        title: "",
        slug: "",
        description: null,
        selectionMode: "manual",
      },
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

  const collection: CollectionMeta = {
    ...response.collection,
    selectionMode: normalizeSelectionMode(response.collection.selectionMode),
  };

  const mappedItems = response.items
    .map(mapProductPreview)
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const items =
    collection.selectionMode === "discount"
      ? mappedItems.map(prepareDiscountProductPreview)
      : mappedItems;

  return {
    collection,
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
