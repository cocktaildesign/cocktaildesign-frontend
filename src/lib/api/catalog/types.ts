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

// Медиа в Strapi (нам нужен только URL)
export type StrapiMediaFile = {
  url?: string; // "/uploads/xxx.png"
  alternativeText?: string | null;

  // formats может быть, а может и не быть (зависит от файла/настроек)
  formats?: {
    medium?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    thumbnail?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
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

// StrapiCategoryItem — один элемент массива `data` из Strapi.
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

// StrapiCategoryListResponse — ответ /api/moysklad-categories (список).
export type StrapiCategoryListResponse = {
  data: StrapiCategoryItem[];
};

// ============================================================
//    1.1) Strapi types — товары
// ============================================================

export type StrapiProductSpecification = {
  id?: number;
  label?: string | null;
  value?: string | null;
  href?: string | null;
};

export type StrapiProductAttributes = {
  name?: string;
  moyskladId?: string;
  price?: number | null;

  // Детальная страница товара
  slug?: string | null;
  priceOld?: number | null;
  description?: string | null;
  engravingEnabled?: boolean | null;
  specifications?: StrapiProductSpecification[] | null;
  code?: string | null;
  displayTitle?: string | null;
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
  slug?: string | null;
  priceOld?: number | null;
  description?: string | null;
  engravingEnabled?: boolean | null;
  specifications?: StrapiProductSpecification[] | null;
  code?: string | null;
  displayTitle?: string | null;
  image?: StrapiProductAttributes["image"];
};

// ============================================================
//    1.2) Strapi types — варианты (variants)
//    meta НЕ типизируем (не усложняем) — оставляем unknown
// ============================================================

export type StrapiVariantCharacteristic = {
  id?: string;
  meta?: unknown;
  name?: string; // например: "цвет"
  value?: string; // например: "желтый"
};

export type StrapiVariantAttributes = {
  name?: string | null;
  moyskladId?: string | null;

  price?: number | null;
  priceOld?: number | null;

  characteristics?: StrapiVariantCharacteristic[] | null;

  // (позже) можно добавить image, если решишь хранить фото у варианта
  // image?: ...
};

export type StrapiVariantItem = {
  id: number;
  attributes?: StrapiVariantAttributes;
};

// ============================================================
//    2) Domain types (то, что отдаём в UI)
// ============================================================

// CatalogCategoryPreview — это то, что получит UI (/catalog).
export type CatalogCategoryPreview = {
  id: string;
  name: string;
  slug: string;
  imageSrc: string | null;
  alt?: string;

  productsCount: number;
  children?: CatalogCategoryPreview[];
};

// ============================================================
//    3) Domain types — товары (то, что отдаём в UI)
// ============================================================

// CatalogProductPreview — минимальная модель товара для списка/грида.
export type CatalogProductPreview = {
  id: string; // Strapi id
  moyskladId: string; // внешний стабильный id
  slug: string; // URL

  name: string; // заголовок карточки
  price: number; // цена
  imageUrl: string | null; // картинка карточки
  images: string[];
  engravingEnabled: boolean;
};

// Ответ API для infinite scroll.
export type CatalogProductsResponse = {
  items: CatalogProductPreview[];

  total: number;
  limit: number;
  offset: number;

  hasMore: boolean;
};

// ============================================================
//    4) Товар: детальная страница (/catalog/product/[slug])
// ============================================================

// Категория для хлебных крошек (приходит из backend как breadcrumbsCategories)
export type BreadcrumbCategory = {
  id: string;
  slug: string;
  name: string;
};

export type CatalogProductImage = {
  src: string;
  alt: string;
};

export type CatalogProductSpecification = {
  id: string;
  label: string;
  value: string;
  href: string | null;
};

// Детальная модель товара для страницы товара.
export type CatalogProductDetail = {
  id: string;
  moyskladId: string;
  slug: string;

  name: string;
  price: number;
  priceOld: number;
  description: string | null;

  images: CatalogProductImage[];
  specifications: CatalogProductSpecification[];
  engravingEnabled: boolean;
  code: string | null;
};

// Упрощённая характеристика (для UI): просто name/value как текст
export type CatalogVariantCharacteristic = {
  name: string;
  value: string;
};

// Вариант для UI (детальная страница)
export type CatalogVariant = {
  id: string; // Strapi id варианта
  moyskladId: string;

  name: string;
  price: number;
  priceOld: number;

  characteristics: CatalogVariantCharacteristic[];
};

// Сырой ответ backend:
// GET /api/catalog/product?slug=ms-xxxxxxx
export type StrapiCatalogProductBySlugResponse = {
  item: StrapiProductItem;
  variants?: StrapiVariantItem[];
  breadcrumbsCategories?: BreadcrumbCategory[];
};

// ============================================================
//    5) Товар недели (главная страница)
// ============================================================

// Сырой ответ Strapi:
// GET /api/weekly-product-block?populate[product][populate]=image
export type StrapiWeeklyProductBlockResponse = {
  data: {
    id: number;
    isEnabled?: boolean | null;
    product?: StrapiProductItem | null;
  } | null;
};

// Domain-модель для UI главной страницы
export type WeeklyProductBlock = {
  isEnabled: boolean;

  product: {
    id: string;
    name: string;
    displayTitle: string | null;
    slug: string;
    price: number;
    priceOld: number;
    description: string | null;
    images: CatalogProductImage[];
    engravingEnabled: boolean;
    code: string | null;
  } | null;
};
