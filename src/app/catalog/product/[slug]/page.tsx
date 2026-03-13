// src/app/catalog/product/[slug]/page.tsx
//
// Server Component — данные грузятся на сервере, клиенту уходит готовый HTML.
// Интерактивные части (кнопки, количество, избранное) вынесены в ProductPurchaseControls.

import ProductsSlider from "@/components/ui/products-slider/ProductsSlider";
import { notFound } from "next/navigation";
import { getStrapiMediaUrl } from "@/lib/api/strapi/media";
import Link from "next/link";
import Image from "next/image";
import ProductGallery from "./ProductGallery";
import PageLayout from "@/components/layout/PageLayout";
import { getProductBySlugFromStrapi } from "@/lib/api/catalog";
import ProductPurchaseControls from "./ProductPurchaseControls";
import BundleItems from "./bundle/BundleItems";

import ArrowBackIcon from "@/components/icons/ArrowBackIcon";
import CopyButton from "@/components/ui/copy-button/CopyButton";

import styles from "./ProductPage.module.css";

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";

// Типы для App Router: params приходит как Promise в Next.js 15+
type Params = { slug: string };
type PageProps = { params: Promise<Params> };

// Один формат изображения (thumbnail / small / medium / large)
type ImageFormat = {
  url: string;
};

// Набор возможных размеров изображения из Strapi
type ProductImageFormats = {
  thumbnail?: ImageFormat;
  small?: ImageFormat;
  medium?: ImageFormat;
  large?: ImageFormat;
} | null;

// Один объект изображения товара
type ProductImage = {
  url: string;
  alternativeText?: string | null;
  formats?: ProductImageFormats;
};

// Атрибуты товара из API
type RelatedProductAttributes = {
  name: string | null;
  slug: string | null;
  price: number | null;
  priceOld: number | null;
  image: ProductImage[] | null;
};

// Один товар из ответа API
type RelatedProduct = {
  id: number;
  attributes: RelatedProductAttributes;
};

// Полный ответ endpoint `/api/catalog/products`
type RelatedProductsResponse = {
  items: RelatedProduct[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

// Запрос для получения блока похожие товары
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.cocktaildesign.ru/api";

async function getRelatedProducts(params: {
  categorySlug: string;
  limit: number;
  offset: number;
}): Promise<RelatedProductsResponse | null> {
  const { categorySlug, limit, offset } = params;

  if (!categorySlug) return null;

  const url = new URL(`${API_BASE}/catalog/products`);
  url.searchParams.set("categorySlug", categorySlug);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  return (await res.json()) as RelatedProductsResponse;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const data = await getProductBySlugFromStrapi(slug);
  if (!data) notFound();

  const { product, breadcrumbsCategories } = data;

  const variants = data.variants ?? [];
  const images = product.images ?? [];
  const specifications = product.specifications ?? [];

  const characteristicsByName: Record<string, string[]> = {};

  for (const variant of variants) {
    const characteristics = variant.characteristics ?? [];

    for (const ch of characteristics) {
      const name = ch.name.trim();
      const value = ch.value.trim();

      if (!name || !value) continue;

      if (!characteristicsByName[name]) {
        characteristicsByName[name] = [];
      }

      if (!characteristicsByName[name].includes(value)) {
        characteristicsByName[name].push(value);
      }
    }
  }

  const characteristicEntries = Object.entries(characteristicsByName);

  const breadcrumbsItems = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    ...breadcrumbsCategories.map((c) => ({
      href: `/catalog/${c.slug}`,
      label: c.name,
    })),
    { href: `/catalog/product/${product.slug}`, label: product.name },
  ];

  const relatedCategorySlug = breadcrumbsCategories[0]?.slug ?? "";

  const relatedResponse = await getRelatedProducts({
    categorySlug: relatedCategorySlug,
    limit: 1000,
    offset: 0,
  });

  const relatedItems = (relatedResponse?.items ?? []).filter((item) => {
    const itemSlug = item.attributes.slug ?? "";
    return itemSlug && itemSlug !== product.slug;
  });

  return (
    <PageLayout breadcrumbsItems={breadcrumbsItems}>
      <section className={styles.productPage}>
        <header className={styles.productPageHeader}>
          <h1 className={styles.productPageTitle}>{product.name}</h1>
        </header>

        <div className={styles.productLayout}>
          <div className={styles.productMeta}>
            <div className={styles.productMetaSku}>
              <p className={styles.productMetaSkuTitle}>
                Артикул: <span>{product.code}</span>
              </p>
              <CopyButton value={product.code ?? ""} label="Артикул" />
            </div>
          </div>

          <ProductGallery images={images} />

          <div className={styles.productInfo}>
            {variants.length > 0 && characteristicEntries.length > 0 ? (
              <div className={styles.productVariants}>
                {characteristicEntries.map(([name, values]) => (
                  <div key={name} className={styles.productVariant}>
                    <span className={styles.productInfoTitle}>{name}</span>

                    <ul className={styles.productVariantValues}>
                      {values.map((value) => (
                        <li key={value} className={styles.productVariantValue}>
                          {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}

            <div>
              <div className={styles.productAboutHeader}>
                <h2 className={styles.productInfoTitle}>О товаре</h2>

                <a href="#product-description" className={styles.productAboutButton}>
                  <span className={styles.productAboutButtonText}>Перейти к описанию</span>
                  <ArrowBackIcon className={styles.productAboutButtonIcon} />
                </a>
              </div>

              {specifications.map((spec) => (
                <div key={spec.id} className={styles.specRow}>
                  <div className={styles.specLeft}>
                    <span className={styles.specLabel}>{spec.label}</span>
                  </div>

                  <div className={styles.specValue}>
                    {spec.href ? (
                      <Link href={spec.href} className={styles.specLink}>
                        {spec.value}
                      </Link>
                    ) : (
                      spec.value
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.productSidebar}>
            <div className={styles.productPurchase}>
              <ProductPurchaseControls
                productId={product.id}
                engravingEnabled={product.engravingEnabled}
                price={product.price}
                priceOld={product.priceOld}
              />
            </div>
          </div>

          {product.bundleItems.length > 0 && <BundleItems items={product.bundleItems} bundlePrice={product.price} />}

          {product.description?.trim() ? (
            <div id="product-description" className={styles.productDescription}>
              <h2 className={styles.productDescriptionTitle}>Описание</h2>
              <div className={styles.productDescriptionText}>{product.description}</div>
            </div>
          ) : null}

          <section className={styles.related} aria-label="Похожие товары">
            <h2 className={styles.relatedTitle}>Аналогичные товары</h2>

            <ProductsSlider>
              {relatedItems.map((item) => {
                const itemSlug = item.attributes.slug ?? "";
                const itemName = item.attributes.name ?? "Товар";
                const itemPrice = item.attributes.price ?? 0;

                const rawImg = item.attributes.image?.[0]?.url ?? undefined;
                const itemImg = getStrapiMediaUrl(rawImg) ?? PLACEHOLDER_IMG;

                return (
                  <div key={item.id} className={styles.relatedSlide}>
                    <Link href={`/catalog/product/${itemSlug}`} className={styles.relatedCard}>
                      <div className={styles.relatedImage}>
                        <Image src={itemImg} fill alt={itemName} className={styles.relatedImageImg} />
                      </div>
                      <div className={styles.relatedCardPrice}>{itemPrice} ₽</div>
                      <div className={styles.relatedCardTitle}>{itemName}</div>
                    </Link>
                  </div>
                );
              })}
            </ProductsSlider>
          </section>
        </div>
      </section>
    </PageLayout>
  );
}
