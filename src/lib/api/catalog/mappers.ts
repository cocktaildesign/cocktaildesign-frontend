// ============================================================================
//frontend/src/lib/api/catalog/mappers.ts
// Преобразование Strapi → Domain types для каталога.
// Это ЕДИНСТВЕННОЕ место, где мы:
// - лезем в item.attributes
// - учитываем populate / null / undefined
// - собираем абсолютные URL для картинок
// - генерируем стабильные slug
// ============================================================================

import { getStrapiMediaUrl } from "@/lib/api/strapi/media";
import type {
  CatalogBundleItem,
  CatalogCategoryPreview,
  CatalogCollection,
  CatalogProductDetail,
  CatalogProductImage,
  CatalogProductPreview,
  CatalogProductSpecification,
  CatalogVariant,
  CatalogVariantCharacteristic,
  StrapiBundleItem,
  StrapiCatalogCollectionItem,
  StrapiCategoryItem,
  StrapiMediaFile,
  StrapiProductItem,
  StrapiVariantItem,
  StrapiWeeklyProductBlockResponse,
  WeeklyProductBlock,
} from "./types";

// ============================================================================
// Таблица транслитерации RU → LAT
// ============================================================================

const RU_TO_LAT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
  ь: "",
  ъ: "",
};

// ============================================================================
// mapCategoryPreview
// ============================================================================

export function mapCategoryPreview(item: StrapiCategoryItem): CatalogCategoryPreview | null {
  const source = item.attributes ?? item;

  const name = source.name?.trim() ?? "";
  const slug = source.slug?.trim() ?? "";

  if (!name || !slug) return null;

  const image = source.image;

  const imagePath =
    image?.formats?.medium?.url ?? image?.formats?.small?.url ?? image?.formats?.thumbnail?.url ?? image?.url ?? null;

  const imageUrl = imagePath ? (getStrapiMediaUrl(imagePath) ?? null) : null;

  const altFromStrapi = image?.alternativeText?.trim() ?? "";
  const alt = altFromStrapi || name;

  const rawCount = source.productsCount;
  const productsCount = typeof rawCount === "number" && Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 0;

  const childrenData = source.children?.data ?? [];
  const children: CatalogCategoryPreview[] = [];

  for (const child of childrenData) {
    const mappedChild = mapCategoryPreview(child);

    if (mappedChild) {
      children.push({
        ...mappedChild,
        children: undefined,
      });
    }
  }

  return {
    id: String(item.id),
    name,
    slug,
    imageSrc: imageUrl,
    alt,
    productsCount,
    children: children.length > 0 ? children : undefined,
  };
}

// Маппер с полным деревом children (для мобильного drill-down).
// В отличие от mapCategoryPreview — НЕ обрезает children у дочерних категорий.
export function mapCategoryPreviewWithChildren(item: StrapiCategoryItem): CatalogCategoryPreview | null {
  const source = item.attributes ?? item;

  const name = source.name?.trim() ?? "";
  const slug = source.slug?.trim() ?? "";

  if (!name || !slug) return null;

  const image = source.image;

  const imagePath =
    image?.formats?.medium?.url ?? image?.formats?.small?.url ?? image?.formats?.thumbnail?.url ?? image?.url ?? null;

  const imageUrl = imagePath ? (getStrapiMediaUrl(imagePath) ?? null) : null;
  const altFromStrapi = image?.alternativeText?.trim() ?? "";
  const alt = altFromStrapi || name;

  const rawCount = source.productsCount;
  const productsCount = typeof rawCount === "number" && Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 0;

  // Рекурсивно маппим детей — и у них тоже сохраняем children
  const childrenData = source.children?.data ?? [];
  const children: CatalogCategoryPreview[] = [];

  for (const child of childrenData) {
    const mappedChild = mapCategoryPreviewWithChildren(child);
    if (mappedChild) {
      children.push(mappedChild); // ← НЕ обрезаем children у детей
    }
  }

  return {
    id: String(item.id),
    name,
    slug,
    imageSrc: imageUrl,
    alt,
    productsCount,
    children: children.length > 0 ? children : undefined,
  };
}

// ============================================================================
// SLUG
// ============================================================================

function makeStableIdPart(moyskladId: string): string {
  if (!moyskladId) return "ms-unknown";

  const firstChunk = moyskladId.split("-")[0] ?? "";
  const short = (firstChunk || moyskladId).slice(0, 8);

  return `ms-${short}`;
}

function makeNameTail(name?: string): string {
  if (!name) return "";

  const lower = name.toLowerCase();

  const transliterated = lower
    .split("")
    .map((char) => RU_TO_LAT[char] ?? char)
    .join("");

  const cleaned = transliterated.replace(/[^a-z0-9\s-]/gi, " ");

  const compact = cleaned.trim().replace(/\s+/g, "-").replace(/-+/g, "-");

  return compact.slice(0, 60);
}

export function makeProductSlug(moyskladId: string, name?: string): string {
  const stable = makeStableIdPart(moyskladId);
  const tail = makeNameTail(name);

  if (!tail) return stable;
  return `${stable}-${tail}`;
}

// ============================================================================
// IMAGE helpers
// ============================================================================

function pickBestImagePath(file: StrapiMediaFile | null): string | null {
  if (!file) return null;

  return (
    file.formats?.large?.url ??
    file.formats?.medium?.url ??
    file.formats?.small?.url ??
    file.formats?.thumbnail?.url ??
    file.url ??
    null
  );
}

function mapMediaArray(
  raw: StrapiMediaFile[] | { data?: Array<{ id: number; attributes?: StrapiMediaFile }> } | null | undefined,
  fallbackAlt: string,
): CatalogProductImage[] {
  const images: CatalogProductImage[] = [];

  if (Array.isArray(raw)) {
    for (const file of raw) {
      const imagePath = pickBestImagePath(file);
      const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;
      if (!imageUrl) continue;

      images.push({
        src: imageUrl,
        alt: file?.alternativeText?.trim() || fallbackAlt,
      });
    }

    return images;
  }

  if (raw && !Array.isArray(raw) && raw.data) {
    for (const item of raw.data) {
      const file = item?.attributes ?? null;
      const imagePath = pickBestImagePath(file);
      const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;
      if (!imageUrl) continue;

      images.push({
        src: imageUrl,
        alt: file?.alternativeText?.trim() || fallbackAlt,
      });
    }

    return images;
  }

  return images;
}

function mapPreviewImageUrls(
  raw: StrapiMediaFile[] | { data?: Array<{ id: number; attributes?: StrapiMediaFile }> } | null | undefined,
): string[] {
  const images: string[] = [];

  if (Array.isArray(raw)) {
    const sliced = raw.slice(0, 4);

    for (const file of sliced) {
      const path = pickBestImagePath(file);
      const url = path ? (getStrapiMediaUrl(path) ?? null) : null;

      if (url) {
        images.push(url);
      }
    }

    return images;
  }

  if (raw && !Array.isArray(raw) && raw.data) {
    const sliced = raw.data.slice(0, 4);

    for (const item of sliced) {
      const file = item?.attributes ?? null;
      const path = pickBestImagePath(file);
      const url = path ? (getStrapiMediaUrl(path) ?? null) : null;

      if (url) {
        images.push(url);
      }
    }

    return images;
  }

  return images;
}

// ============================================================================
// mapProductPreview
// ============================================================================

export function mapProductPreview(item: StrapiProductItem): CatalogProductPreview | null {
  const source = item.attributes ?? item;

  const name = source.name?.trim() ?? "";
  const moyskladId = source.moyskladId?.trim() ?? "";

  const rawCode = source.code;
  const code = typeof rawCode === "string" && rawCode.trim() ? rawCode.trim() : null;

  if (!name || !moyskladId) return null;

  const rawPrice = source.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  const rawPriceOld = source.priceOld;
  const priceOld =
    typeof rawPriceOld === "number" && Number.isFinite(rawPriceOld) && rawPriceOld > 0 ? rawPriceOld : price;

  const firstImage = Array.isArray(source.image) ? source.image[0] : (source.image?.data?.[0]?.attributes ?? null);

  const imagePath = pickBestImagePath(firstImage);
  const imageUrl = imagePath ? (getStrapiMediaUrl(imagePath) ?? null) : null;

  const images = mapPreviewImageUrls(source.image);

  const engravingEnabled = source.engravingEnabled === true;
  const discountExcluded = source.discountExcluded === true;

  const slug = makeProductSlug(moyskladId, name);

  // Варианты могут прийти:
  // 1) в корне объекта товара
  // 2) внутри attributes
  const rawVariants = item.variants ?? source.variants ?? [];
  const variants = mapVariants(rawVariants);

  return {
    id: String(item.id),
    moyskladId,
    slug,
    name,
    price,
    priceOld,
    imageUrl,
    images,
    engravingEnabled,
    discountExcluded,
    code,
    variants,
  };
}

// ============================================================================
// mapCatalogCollectionBase
// ============================================================================

export function mapCatalogCollectionBase(
  item: StrapiCatalogCollectionItem,
): Omit<CatalogCollection, "products" | "viewAllHref"> | null {
  const rawTitle = item.title;
  const rawSlug = item.slug;
  const rawDescription = item.description;
  const rawSortOrder = item.sortOrder;

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
  const description = typeof rawDescription === "string" && rawDescription.trim() ? rawDescription.trim() : null;
  const sortOrder = typeof rawSortOrder === "number" && Number.isFinite(rawSortOrder) ? rawSortOrder : 0;

  if (!title || !slug) return null;

  return {
    id: String(item.id),
    title,
    slug,
    description,
    sortOrder,
  };
}

// ============================================================================
// SPECIFICATIONS
// ============================================================================

function mapProductSpecifications(raw: unknown): CatalogProductSpecification[] {
  if (!Array.isArray(raw)) return [];

  const result: CatalogProductSpecification[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;

    const spec = item as {
      id?: unknown;
      label?: unknown;
      value?: unknown;
      href?: unknown;
      specification?: {
        id?: unknown;
        name?: unknown;
      } | null;
    };

    const relationName =
      spec.specification && typeof spec.specification === "object" && typeof spec.specification.name === "string"
        ? spec.specification.name.trim()
        : "";

    const label = typeof spec.label === "string" ? spec.label.trim() : "";
    const value = typeof spec.value === "string" ? spec.value.trim() : "";
    const href = typeof spec.href === "string" ? spec.href.trim() : "";

    const finalLabel = relationName || label;

    if (!finalLabel || !value) continue;

    result.push({
      id: String(spec.id ?? `${finalLabel}-${value}`),
      label: finalLabel,
      value,
      href: href || null,
    });
  }

  return result;
}

// ============================================================================
// BUNDLE ITEMS
// ============================================================================

export function mapBundleItems(raw: StrapiBundleItem[] | undefined): CatalogBundleItem[] {
  if (!raw || raw.length === 0) return [];

  const result: CatalogBundleItem[] = [];

  for (const item of raw) {
    const cp = item.componentProduct ?? null;

    result.push({
      id: String(item.id),
      quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
      componentProduct: cp
        ? {
            id: String(cp.id),
            name: cp.name ?? "",
            slug: cp.slug ?? "",
            price: typeof cp.price === "number" && cp.price > 0 ? cp.price : 0,
            imageUrl: cp.imageUrl ?? null,
          }
        : null,
    });
  }

  return result;
}

// ============================================================================
// mapProductDetail
// ============================================================================

export function mapProductDetail(
  item: StrapiProductItem,
  rawBundleItems?: StrapiBundleItem[],
): CatalogProductDetail | null {
  const source = item.attributes;

  if (!source) return null;

  const name = source.name?.trim() ?? "";
  const moyskladId = source.moyskladId?.trim() ?? "";
  const slug = source.slug?.trim() ?? "";

  if (!name || !moyskladId || !slug) return null;

  const rawPrice = source.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  const rawPriceOld = source.priceOld;
  const priceOld = typeof rawPriceOld === "number" && Number.isFinite(rawPriceOld) && rawPriceOld > 0 ? rawPriceOld : 0;

  const description = typeof source.description === "string" ? source.description : null;
  const rawCode = source.code;
  const code = typeof rawCode === "string" && rawCode.trim() ? rawCode.trim() : null;
  const engravingEnabled = source.engravingEnabled === true;
  const discountExcluded = source.discountExcluded === true;

  const images = mapMediaArray(source.image, name);
  const specifications = mapProductSpecifications(source.specifications);
  console.log("RAW SPECIFICATIONS:", JSON.stringify(source.specifications, null, 2));
  const bundleItems = mapBundleItems(rawBundleItems);

  return {
    id: String(item.id),
    moyskladId,
    slug,
    name,
    price,
    priceOld,
    description,
    images,
    specifications,
    engravingEnabled,
    discountExcluded,
    code,
    bundleItems,
  };
}

// ============================================================================
// VARIANTS
// ============================================================================

function mapVariantCharacteristics(raw: unknown): CatalogVariantCharacteristic[] {
  if (!Array.isArray(raw)) return [];

  const result: CatalogVariantCharacteristic[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;

    const obj = item as { name?: unknown; value?: unknown };

    const name = typeof obj.name === "string" ? obj.name.trim() : "";
    const value = typeof obj.value === "string" ? obj.value.trim() : "";

    if (!name || !value) continue;

    result.push({ name, value });
  }

  return result;
}

export function mapVariant(item: StrapiVariantItem): CatalogVariant | null {
  const source = item.attributes ?? item;

  const name = typeof source.name === "string" ? source.name.trim() : "";
  const moyskladId = typeof source.moyskladId === "string" ? source.moyskladId.trim() : "";

  if (!name || !moyskladId) return null;

  const rawPrice = source.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  const rawPriceOld = source.priceOld;
  const priceOld = typeof rawPriceOld === "number" && Number.isFinite(rawPriceOld) && rawPriceOld > 0 ? rawPriceOld : 0;

  const rawCode = source.code;
  const code = typeof rawCode === "string" && rawCode.trim() ? rawCode.trim() : null;

  const characteristics = mapVariantCharacteristics(source.characteristics);
  const images = mapMediaArray(source.image, name);

  return {
    id: String(item.id),
    moyskladId,
    name,
    price,
    priceOld,
    code,
    characteristics,
    images,
  };
}

export function mapVariants(items: StrapiVariantItem[] | undefined | null): CatalogVariant[] {
  if (!items || items.length === 0) return [];

  const result: CatalogVariant[] = [];

  for (const item of items) {
    const mapped = mapVariant(item);

    if (mapped) {
      result.push(mapped);
    }
  }

  return result;
}

// ============================================================================
// WEEKLY PRODUCT BLOCK
// ============================================================================

export function mapWeeklyProductBlock(response: StrapiWeeklyProductBlockResponse): WeeklyProductBlock | null {
  const data = response.data;

  if (!data) return null;

  const product = data.product;

  if (!product) {
    return {
      isEnabled: data.isEnabled === true,
      product: null,
    };
  }

  const source = product.attributes ?? product;

  const name = source.name?.trim() ?? "";
  const slug = source.slug?.trim() ?? "";
  const rawDisplayTitle = source.displayTitle;
  const displayTitle = typeof rawDisplayTitle === "string" && rawDisplayTitle.trim() ? rawDisplayTitle.trim() : null;

  if (!name || !slug) {
    return {
      isEnabled: data.isEnabled === true,
      product: null,
    };
  }

  const rawPrice = source.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  const rawPriceOld = source.priceOld;
  const priceOld = typeof rawPriceOld === "number" && Number.isFinite(rawPriceOld) && rawPriceOld > 0 ? rawPriceOld : 0;

  const description = typeof source.description === "string" ? source.description : null;
  const rawCode = source.code;
  const code = typeof rawCode === "string" && rawCode.trim() ? rawCode.trim() : null;
  const engravingEnabled = source.engravingEnabled === true;

  const images = mapMediaArray(source.image, name);

  return {
    isEnabled: data.isEnabled === true,
    product: {
      id: String(product.id),
      name,
      displayTitle,
      slug,
      price,
      priceOld,
      description,
      images,
      engravingEnabled,
      code,
    },
  };
}
