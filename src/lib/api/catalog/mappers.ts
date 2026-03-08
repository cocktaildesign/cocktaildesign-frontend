// src/lib/api/catalog/mappers.ts
// ============================================================================
// Преобразование Strapi → Domain types для каталога.
// Это ЕДИНСТВЕННОЕ место, где мы:
// - лезем в item.attributes
// - учитываем populate / null / undefined
// - собираем абсолютные URL для картинок
// - генерируем стабильные slug
// ============================================================================

import { getStrapiMediaUrl } from "@/lib/api/strapi/media";
import type {
  CatalogCategoryPreview,
  CatalogProductDetail,
  CatalogProductImage,
  CatalogProductPreview,
  CatalogProductSpecification,
  CatalogVariant,
  CatalogVariantCharacteristic,
  StrapiCategoryItem,
  StrapiMediaFile,
  StrapiProductItem,
  StrapiVariantItem,
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

  return file.formats?.medium?.url ?? file.formats?.small?.url ?? file.formats?.thumbnail?.url ?? file.url ?? null;
}

// ============================================================================
// mapProductPreview
// ============================================================================

export function mapProductPreview(item: StrapiProductItem): CatalogProductPreview | null {
  const source = item.attributes ?? item;

  const name = source.name?.trim() ?? "";
  const moyskladId = source.moyskladId?.trim() ?? "";

  if (!name || !moyskladId) return null;

  const rawPrice = source.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  const firstImage = Array.isArray(source.image) ? source.image[0] : (source.image?.data?.[0]?.attributes ?? null);

  const imagePath = pickBestImagePath(firstImage);
  const imageUrl = imagePath ? (getStrapiMediaUrl(imagePath) ?? null) : null;

  // Берём до 4 картинок для hover scrub
  // Используем medium если есть, иначе оригинал
  const images: string[] = [];

  if (Array.isArray(source.image)) {
    // берём максимум 4 фото
    const sliced = source.image.slice(0, 4);

    for (const file of sliced) {
      const path = pickBestImagePath(file);
      const url = path ? (getStrapiMediaUrl(path) ?? null) : null;

      // добавляем только валидные URL
      if (url) images.push(url);
    }
  }

  // Гравировка — если поле не задано в Strapi, считаем false
  const engravingEnabled = source.engravingEnabled === true;
  const slug = makeProductSlug(moyskladId, name);

  return {
    id: String(item.id),
    moyskladId,
    slug,
    name,
    price,
    imageUrl,
    images,
    engravingEnabled,
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
    };

    const label = typeof spec.label === "string" ? spec.label.trim() : "";
    const value = typeof spec.value === "string" ? spec.value.trim() : "";
    const href = typeof spec.href === "string" ? spec.href.trim() : "";

    if (!label || !value) continue;

    result.push({
      id: String(spec.id ?? `${label}-${value}`),
      label,
      value,
      href: href || null,
    });
  }

  return result;
}

// ============================================================================
// mapProductDetail
// ============================================================================

export function mapProductDetail(item: StrapiProductItem): CatalogProductDetail | null {
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

  const images: CatalogProductImage[] = [];
  const rawImages = source.image;
  const rawCode = source.code;
  const code = typeof rawCode === "string" && rawCode.trim() ? rawCode.trim() : null;
  const engravingEnabled = source.engravingEnabled === true;

  // вариант 1 — массив файлов
  if (Array.isArray(rawImages)) {
    for (const file of rawImages) {
      const imagePath = pickBestImagePath(file);
      const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;

      if (!imageUrl) continue;

      images.push({
        src: imageUrl,
        alt: file?.alternativeText?.trim() || name,
      });
    }
  }

  // вариант 2 — стандартный Strapi
  if (!Array.isArray(rawImages) && rawImages?.data) {
    for (const item of rawImages.data) {
      const file = item?.attributes ?? null;
      const imagePath = pickBestImagePath(file);
      const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;

      if (!imageUrl) continue;

      images.push({
        src: imageUrl,
        alt: file?.alternativeText?.trim() || name,
      });
    }
  }

  const specifications = mapProductSpecifications(source.specifications);

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
    code,
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
  const source = item.attributes;

  if (!source) return null;

  const name = typeof source.name === "string" ? source.name.trim() : "";
  const moyskladId = typeof source.moyskladId === "string" ? source.moyskladId.trim() : "";

  if (!name || !moyskladId) return null;

  const rawPrice = source.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  const rawPriceOld = source.priceOld;
  const priceOld = typeof rawPriceOld === "number" && Number.isFinite(rawPriceOld) && rawPriceOld > 0 ? rawPriceOld : 0;

  const characteristics = mapVariantCharacteristics(source.characteristics);

  return {
    id: String(item.id),
    moyskladId,
    name,
    price,
    priceOld,
    characteristics,
  };
}

export function mapVariants(items: StrapiVariantItem[] | undefined): CatalogVariant[] {
  if (!items || items.length === 0) return [];

  const result: CatalogVariant[] = [];

  for (const v of items) {
    const mapped = mapVariant(v);
    if (mapped) result.push(mapped);
  }

  return result;
}
