// src/lib/api/catalog/types.ts
// ============================================================================
// Типы для каталога категорий.
// Два слоя:
// 1) Strapi-типы — как реально приходит из API (то, что мы парсим)
// 2) Domain-типы — как удобно рендерить на страницах/в UI
// ============================================================================

// ============================================================
//    1) Strapi types (упрощённо, только то, что нужно /catalog)
// ============================================================

export type StrapiMediaFormat = {
  url?: string; // "/uploads/medium_xxx.png"
};

// Медиа в Strapi(нам нужен только URL)
export type StrapiMediaFile = {
  url?: string; // "/uploads/xxx.png"
  alternativeText?: string | null;

  // formats может быть, а может и не быть (зависит от файла/настроек)
  formats?: {
    medium?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    thumbnail?: StrapiMediaFormat;
  };
};

// StrapiMediaField — это "обёртка" Strapi вокруг relation/media.
export type StrapiMediaField = StrapiMediaFile | null;

// StrapiCategoryAttributes — поля категории, как они лежат в Strapi.
export type StrapiCategoryAttributes = {
  name: string;
  slug: string;
  image?: StrapiMediaField | null;

  productsCount?: number | null;

  // children (2-й уровень)
  children?: {
    data?: StrapiCategoryItem[];
  };
};

//    StrapiCategoryItem — один элемент массива `data` из Strapi.
//      { data: [ { id, attributes }, ... ] }

export type StrapiCategoryItem = {
  id: number;
  attributes?: StrapiCategoryAttributes;

  // Плоский формат (когда контроллер/плагин отдаёт поля без attributes)
  name?: string;
  slug?: string;
  image?: StrapiMediaField;

  productsCount?: number | null;
  children?: {
    data?: StrapiCategoryItem[];
  };
};

//   StrapiCategoryListResponse — ответ /api/moysklad-categories (список).
export type StrapiCategoryListResponse = {
  data: StrapiCategoryItem[];
};

export type StrapiProductAttributes = {
  name?: string;
  moyskladId?: string;
  price?: number | null;

  // В Strapi у тебя image: multiple: true
  // Формат может быть:
  // 1) упрощённый: массив файлов
  // 2) стандартный Strapi: { data: [{ attributes: файл }] }
  image?:
    | StrapiMediaFile[]
    | {
        data?: Array<{
          id: number;
          attributes?: StrapiMediaFile;
        }>;
      }
    | null;
};

export type StrapiProductItem = {
  id: number;
  attributes?: StrapiProductAttributes;

  // На случай плоского ответа (без attributes)
  name?: string;
  moyskladId?: string;
  price?: number | null;
  image?: StrapiProductAttributes["image"];
};

//  ============================================================
//    2) Domain types (то, что отдаём в UI)
// ============================================================

//    CatalogCategoryPreview — это то, что получит UI (/catalog).

export type CatalogCategoryPreview = {
  id: string;
  name: string;
  slug: string;
  imageSrc: string | null;
  alt?: string;

  productsCount: number;
  children?: CatalogCategoryPreview[];
};

//  ============================================================
//    3) Domain types — товары (то, что отдаём в UI)
// ============================================================

// CatalogProductPreview — минимальная модель товара для списка/грида.
// Важно: это НЕ детальная карточка товара, а "превью" для каталога.
export type CatalogProductPreview = {
  id: string; // Strapi id
  moyskladId: string; // внешний стабильный id
  slug: string; // URL

  name: string; //загаловок карточки
  price: number; // Цена
  imageUrl: string | null; // Картинка карточки.
};

// Ответ API для infinite scroll.
// offset/limit — классическая пагинация "как у маркетплейсов".

export type CatalogProductsResponse = {
  items: CatalogProductPreview[];

  total: number; // всего товаров по фильтру (может пригодиться для "Найдено N")
  limit: number; // сколько попросили
  offset: number; // с какого смещения

  hasMore: boolean; // есть ли следующая порция (ключ для infinite scroll)
};
