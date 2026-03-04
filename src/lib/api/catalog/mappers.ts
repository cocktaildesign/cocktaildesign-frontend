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
  CatalogProductPreview,
  CatalogVariant,
  CatalogVariantCharacteristic,
  StrapiCategoryItem,
  StrapiMediaFile,
  StrapiProductItem,
  StrapiVariantItem,
} from "./types";

// ============================================================================
// Таблица транслитерации RU → LAT.
// Вынесена на уровень модуля, чтобы:
// - не пересоздавалась на каждый вызов функции
// - была легко переиспользуема
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
// Превращает Strapi категорию в Domain-объект для UI.
// ============================================================================
export function mapCategoryPreview(item: StrapiCategoryItem): CatalogCategoryPreview | null {
  // Strapi может вернуть либо attributes, либо "плоский" объект
  const source = item.attributes ?? item;

  // Название и slug обязательны для UI
  const name = source.name?.trim() ?? "";
  const slug = source.slug?.trim() ?? "";
  if (!name || !slug) return null;

  // Изображение может быть null / undefined
  const image = source.image;

  // Выбираем лучший доступный размер
  const imagePath =
    image?.formats?.medium?.url ?? image?.formats?.small?.url ?? image?.formats?.thumbnail?.url ?? image?.url ?? null;

  // Превращаем относительный путь Strapi → абсолютный URL
  const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;

  // alt текст (важно для accessibility)
  const altFromStrapi = image?.alternativeText?.trim() ?? "";
  const alt = altFromStrapi || name;

  // productsCount: нормализация
  const rawCount = source.productsCount;
  const productsCount = typeof rawCount === "number" && Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 0;

  // Дети (второй уровень)
  const childrenData = source.children?.data ?? [];
  const children: CatalogCategoryPreview[] = [];

  for (const child of childrenData) {
    const mappedChild = mapCategoryPreview(child);

    if (mappedChild) {
      children.push({
        ...mappedChild,
        children: undefined, // ограничиваем глубину
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
// Генерация slug товара
// ============================================================================

// Стабильная часть slug из moyskladId
// Пример: "28953401-6aa6-..." → "ms-28953401"
function makeStableIdPart(moyskladId: string): string {
  if (!moyskladId) return "ms-unknown";

  const firstChunk = moyskladId.split("-")[0] ?? "";
  const short = (firstChunk || moyskladId).slice(0, 8);

  return `ms-${short}`;
}

// Генерация "красивого хвоста" из имени
// Пример: "Шейкер Boston 800 мл" → "shejker-boston-800-ml"
function makeNameTail(name?: string): string {
  if (!name) return "";

  // 1) нижний регистр
  const lower = name.toLowerCase();

  // 2) транслитерация RU → LAT
  const transliterated = lower
    .split("")
    .map((char) => RU_TO_LAT[char] ?? char)
    .join("");

  // 3) удаляем мусор (оставляем латиницу/цифры/пробел/дефис)
  const cleaned = transliterated.replace(/[^a-z0-9\s-]/gi, " ");

  // 4) пробелы → дефисы, убираем повторяющиеся дефисы
  const compact = cleaned.trim().replace(/\s+/g, "-").replace(/-+/g, "-");

  // 5) ограничиваем длину хвоста
  return compact.slice(0, 60);
}

// Главная функция генерации slug товара:
// stable id + optional name tail
export function makeProductSlug(moyskladId: string, name?: string): string {
  const stable = makeStableIdPart(moyskladId);
  const tail = makeNameTail(name);

  if (!tail) return stable;
  return `${stable}-${tail}`;
}

// ============================================================================
// Маппинг товаров (Strapi → Domain)
// ============================================================================

// ----------------------------------------------------------------------------
// pickFirstProductImage
// Достаём "первую картинку" товара из разных возможных форматов Strapi.
// Почему нужно:
// - у товара image: multiple
// - разные контроллеры могут отдавать разные формы (массив или { data })
// ----------------------------------------------------------------------------
function pickFirstProductImage(image: StrapiProductItem["image"]): StrapiMediaFile | null {
  // Вариант 1: упрощённый формат — массив файлов
  if (Array.isArray(image)) {
    const first = image[0] ?? null;
    return first ?? null;
  }

  // Вариант 2: стандартный формат Strapi — { data: [{ attributes: файл }] }
  const firstFromData = image?.data?.[0]?.attributes ?? null;
  return firstFromData;
}

// ----------------------------------------------------------------------------
// mapProductPreview
// Превращает Strapi товар в "карточку" для грида.
// ----------------------------------------------------------------------------
export function mapProductPreview(item: StrapiProductItem): CatalogProductPreview | null {
  const source = item.attributes ?? item;

  const name = source.name?.trim() ?? "";
  const moyskladId = source.moyskladId?.trim() ?? "";
  if (!name || !moyskladId) return null;

  // price: приводим к нормальному числу (NaN/<=0 → 0)
  const rawPrice = source.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  // image: берём первую картинку
  const firstImage = pickFirstProductImage(source.image ?? null);

  const imagePath =
    firstImage?.formats?.medium?.url ??
    firstImage?.formats?.small?.url ??
    firstImage?.formats?.thumbnail?.url ??
    firstImage?.url ??
    null;

  const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;

  // slug: уже "правильный" (латиница), но ключ остаётся стабильным ms-<8>
  const slug = makeProductSlug(moyskladId, name);

  return {
    id: String(item.id),
    moyskladId,
    slug,
    name,
    price,
    imageUrl,
  };
}

// ----------------------------------------------------------------------------
// mapProductDetail
// Превращает Strapi товар в детальную модель для страницы товара.
// ----------------------------------------------------------------------------
export function mapProductDetail(item: StrapiProductItem): CatalogProductDetail | null {
  const source = item.attributes;

  // Для детальной страницы ожидаем, что данные лежат в attributes
  if (!source) return null;

  const name = source.name?.trim() ?? "";
  const moyskladId = source.moyskladId?.trim() ?? "";
  const slug = source.slug?.trim() ?? "";

  // Если чего-то нет — страницу лучше считать "не найдено"
  if (!name || !moyskladId || !slug) return null;

  // price: нормализуем (NaN/<=0 → 0)
  const rawPrice = source.price;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  // priceOld: допускаем 0 (это значит "нет старой цены")
  const rawPriceOld = source.priceOld;
  const priceOld = typeof rawPriceOld === "number" && Number.isFinite(rawPriceOld) && rawPriceOld > 0 ? rawPriceOld : 0;

  // description: строка или null
  const description = typeof source.description === "string" ? source.description : null;

  // image: используем ТУ ЖЕ логику, что и в preview (через pickFirstProductImage)
  const firstImage = pickFirstProductImage(source.image ?? null);

  const imagePath =
    firstImage?.formats?.medium?.url ??
    firstImage?.formats?.small?.url ??
    firstImage?.formats?.thumbnail?.url ??
    firstImage?.url ??
    null;

  const imageUrl = imagePath ? getStrapiMediaUrl(imagePath) : null;

  return {
    id: String(item.id),
    moyskladId,
    slug,

    name,
    price,
    priceOld,
    description,

    imageUrl,
  };
}

// ============================================================================
// ВАРИАНТЫ (variants)
// Пока делаем максимально простой маппинг:
// - берём name/value как есть
// - meta игнорируем
// ============================================================================

// ----------------------------------------------------------------------------
// mapVariantCharacteristics
// Превращаем "сырой массив" characteristics в безопасный список { name, value }.
// ----------------------------------------------------------------------------
function mapVariantCharacteristics(raw: unknown): CatalogVariantCharacteristic[] {
  if (!Array.isArray(raw)) return [];

  const result: CatalogVariantCharacteristic[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;

    const obj = item as { name?: unknown; value?: unknown };

    const name = typeof obj.name === "string" ? obj.name.trim() : "";
    const value = typeof obj.value === "string" ? obj.value.trim() : "";

    // Для UI нам важна пара name/value. Пустое — выкидываем.
    if (!name || !value) continue;

    result.push({ name, value });
  }

  return result;
}

// ----------------------------------------------------------------------------
// mapVariant
// Один Strapi-variant → Domain-variant для UI.
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// mapVariants
// Маппим массив variants, отбрасываем мусорные/битые элементы.
// ----------------------------------------------------------------------------
export function mapVariants(items: StrapiVariantItem[] | undefined): CatalogVariant[] {
  if (!items || items.length === 0) return [];

  const result: CatalogVariant[] = [];

  for (const v of items) {
    const mapped = mapVariant(v);
    if (mapped) result.push(mapped);
  }

  return result;
}
