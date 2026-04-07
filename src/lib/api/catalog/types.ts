// ============================================================================
//frontend/src/lib/api/catalog/types.ts
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
  discountExcluded?: boolean | null;
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

  // Варианты могут прийти внутри attributes
  variants?: StrapiVariantItem[] | null;
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
  discountExcluded?: boolean | null;
  specifications?: StrapiProductSpecification[] | null;
  code?: string | null;
  displayTitle?: string | null;
  image?: StrapiProductAttributes["image"];

  // Варианты могут прийти и в корне объекта
  variants?: StrapiVariantItem[] | null;
};

// ============================================================
//    1.2) Strapi types — варианты (variants)
// ============================================================

export type StrapiVariantCharacteristic = {
  id?: string;
  meta?: unknown;
  name?: string;
  value?: string;
};

export type StrapiVariantAttributes = {
  name?: string | null;
  moyskladId?: string | null;

  price?: number | null;
  priceOld?: number | null;
  code?: string | null;

  characteristics?: StrapiVariantCharacteristic[] | null;

  // Фото варианта — массив медиа
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

export type StrapiVariantItem = {
  id: number;
  attributes?: StrapiVariantAttributes;

  // На случай плоского ответа варианта
  name?: string | null;
  moyskladId?: string | null;
  price?: number | null;
  priceOld?: number | null;
  code?: string | null;
  characteristics?: StrapiVariantCharacteristic[] | null;
  image?: StrapiVariantAttributes["image"];
};

// ============================================================
//    1.3) Strapi types — подборки товаров (catalog-collections)
// ============================================================

export type StrapiCollectionSelectionMode = "manual" | "category" | "discount";

export type StrapiCatalogCollectionSourceCategory = {
  id: number;
  documentId?: string;
  name?: string | null;
  slug?: string | null;
  productsCount?: number | null;
};

export type StrapiCatalogCollectionItem = {
  id: number;
  documentId?: string;

  title?: string | null;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;

  selectionMode?: StrapiCollectionSelectionMode | string | null;
  sourceCategory?: StrapiCatalogCollectionSourceCategory | null;

  products?: StrapiProductItem[] | null;
};

export type StrapiCatalogCollectionsResponse = {
  data: StrapiCatalogCollectionItem[];
};

// ============================================================
//    1.4) Strapi types — состав комплекта (bundle items)
//    Приходит из корня ответа /api/catalog/product, не из attributes
// ============================================================

// Один компонент комплекта — как приходит из Strapi
export type StrapiBundleItem = {
  id: number;
  quantity?: number | null;
  componentProduct?: {
    id: number;
    name?: string | null;
    slug?: string | null;
    price?: number | null;
    imageUrl?: string | null;
  } | null;
};

// ============================================================
//    2) Domain types (то, что отдаём в UI)
// ============================================================

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

export type CatalogProductPreview = {
  id: string;
  moyskladId: string;
  slug: string;

  name: string;
  price: number;
  priceOld: number;
  imageUrl: string | null;
  images: string[];
  engravingEnabled: boolean;
  discountExcluded: boolean;
  code: string | null;
  variants: CatalogVariant[];
};

export type CatalogProductsResponse = {
  items: CatalogProductPreview[];

  total: number;
  limit: number;
  offset: number;

  hasMore: boolean;
};

// ============================================================
//    3.1) Domain types — подборки товаров для главной
// ============================================================

export type CatalogCollection = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  viewAllHref: string | null;
  products: CatalogProductPreview[];
};

// ============================================================
//    4) Товар: детальная страница (/catalog/product/[slug])
// ============================================================

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

// Один товар внутри комплекта (domain тип для UI)
export type CatalogBundleComponentProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
};

// Один элемент состава комплекта (domain тип для UI)
export type CatalogBundleItem = {
  id: string;
  quantity: number;
  componentProduct: CatalogBundleComponentProduct | null;
};

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
  discountExcluded: boolean;
  code: string | null;

  // Состав комплекта — пустой массив для обычных товаров
  bundleItems: CatalogBundleItem[];
};

export type CatalogVariantCharacteristic = {
  name: string;
  value: string;
};

export type CatalogVariant = {
  id: string;
  moyskladId: string;

  name: string;
  price: number;
  priceOld: number;
  code: string | null;

  characteristics: CatalogVariantCharacteristic[];

  // Фото варианта — первое используется как главное при выборе варианта
  images: CatalogProductImage[];
};

export type StrapiCatalogProductBySlugResponse = {
  item: StrapiProductItem;
  variants?: StrapiVariantItem[];
  breadcrumbsCategories?: BreadcrumbCategory[];
  // Состав комплекта — приходит из корня ответа (не из item.attributes)
  bundleItems?: StrapiBundleItem[];
};

// ============================================================
//    5) Товар недели
// ============================================================

export type StrapiWeeklyProductBlockResponse = {
  data: {
    id: number;
    isEnabled?: boolean | null;
    product?: StrapiProductItem | null;
  } | null;
};

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
