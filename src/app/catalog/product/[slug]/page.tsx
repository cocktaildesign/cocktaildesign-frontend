// src/app/catalog/product/[slug]/page.tsx
//
// Server Component — данные грузятся на сервере.
// Интерактивные части страницы вынесены в клиентские компоненты.

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import PageLayout from "@/components/layout/PageLayout";
import ProductsSlider from "@/components/ui/products-slider/ProductsSlider";
import BundleItems from "./bundle/BundleItems";
import VariantSelector from "./VariantSelector";
import ProductDetailsNavigation from "./ProductDetailsNavigation";

import { pageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/seo/site";
import {
  getColorMap,
  getCollectionProductsFromStrapi,
  getProductBySlugFromStrapi,
  getProductsByCategorySlugFromStrapi,
} from "@/lib/api/catalog";
import type { CatalogProductPreview, CatalogProductSpecification } from "@/lib/api/catalog/types";
import { UTSENKA_COLLECTION_HREF, UTSENKA_COLLECTION_SLUG, UTSENKA_LABEL } from "@/lib/catalog/sample-sale";

import styles from "./ProductPage.module.css";

// Кэш страницы товара — 3 минуты (180 секунд)
// Менеджер скрыл товар или поменял цену → через 3 минуты обновится на сайте
export const revalidate = 180;

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";
const FEATURES_SPECIFICATION_LABEL = "Особенности";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

function getFeatureItems(value: string): string[] {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ProductSpecificationValue({ spec }: { spec: CatalogProductSpecification }) {
  const isFeatures = spec.label === FEATURES_SPECIFICATION_LABEL;
  const featureItems = isFeatures ? getFeatureItems(spec.value) : [];

  if (isFeatures && featureItems.length > 1) {
    return (
      <ul className={styles.productFullSpecificationFeatureList}>
        {featureItems.map((item) => (
          <li key={item} className={styles.productFullSpecificationFeatureItem}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (spec.href) {
    return (
      <Link href={spec.href} className={styles.specLink}>
        {spec.value}
      </Link>
    );
  }

  return spec.value;
}

function ProductFullSpecifications({ specifications }: { specifications: CatalogProductSpecification[] }) {
  if (specifications.length === 0) {
    return null;
  }

  return (
    <section id="product-specifications" className={styles.productFullSpecifications}>
      <h2 className={styles.productFullSpecificationsTitle}>Характеристики</h2>

      <div className={styles.productFullSpecificationsList}>
        {specifications.map((spec) => (
          <div key={spec.id} className={styles.productFullSpecificationRow}>
            <div className={styles.productFullSpecificationLabel}>{spec.label}</div>

            <div className={styles.productFullSpecificationDots} aria-hidden="true" />

            <div className={styles.productFullSpecificationValue}>
              <ProductSpecificationValue spec={spec} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProductBySlugFromStrapi(slug);

  if (!data) {
    return {};
  }

  const { product } = data;
  const ogImage = product.images[0]?.src;

  const rawDescription = product.description?.trim() ?? "";
  const description =
    rawDescription.length > 160
      ? `${rawDescription.slice(0, 157)}...`
      : rawDescription || `${product.name} — товар из каталога Cocktail Design.`;

  return pageMetadata({
    title: product.name,
    description,
    canonical: `/catalog/product/${product.slug}`,
    image: ogImage,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const [data, colorMap] = await Promise.all([getProductBySlugFromStrapi(slug), getColorMap()]);

  if (!data) {
    notFound();
  }

  const { product, breadcrumbsCategories } = data;
  const variants = data.variants ?? [];
  const specifications = product.specifications ?? [];

  const hasDescription = Boolean(product.description?.trim());
  const hasSpecifications = specifications.length > 0;

  const productUrl = `${siteUrl}/catalog/product/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.code ?? undefined,
    image: product.images.map((image) => image.src),
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "CocktailDesign",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "RUB",
      price: String(product.price),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const breadcrumbsItems = product.isSampleSale
    ? [
        { href: "/", label: "Главная" },
        { href: "/catalog", label: "Каталог" },
        { href: UTSENKA_COLLECTION_HREF, label: UTSENKA_LABEL },
        {
          href: `/catalog/product/${product.slug}`,
          label: product.name,
        },
      ]
    : [
        { href: "/", label: "Главная" },
        { href: "/catalog", label: "Каталог" },
        ...breadcrumbsCategories.map((category) => ({
          href: `/catalog/${category.slug}`,
          label: category.name,
        })),
        {
          href: `/catalog/product/${product.slug}`,
          label: product.name,
        },
      ];

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbsItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${siteUrl}${item.href}`,
    })),
  };

  let relatedItems: CatalogProductPreview[] = [];

  if (product.isSampleSale) {
    const relatedResponse = await getCollectionProductsFromStrapi({
      slug: UTSENKA_COLLECTION_SLUG,
      limit: 100,
      offset: 0,
    });

    relatedItems = relatedResponse.items.filter((item) => item.id !== product.id);
  } else {
    const relatedCategorySlug = breadcrumbsCategories[0]?.slug ?? "";

    const relatedResponse = relatedCategorySlug
      ? await getProductsByCategorySlugFromStrapi({
          categorySlug: relatedCategorySlug,
          limit: 100,
          offset: 0,
        })
      : null;

    relatedItems = (relatedResponse?.items ?? []).filter((item) => item.id !== product.id);
  }

  const hasRelatedProducts = relatedItems.length > 0;

  return (
    <PageLayout breadcrumbsItems={breadcrumbsItems}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />

      <section
        className={`${styles.productPage}${product.engravingEnabled ? ` ${styles.productPageWithEngravingSticky}` : ""}`}>
        <header className={styles.productPageHeader}>
          <h1 className={styles.productPageTitle}>{product.name}</h1>
        </header>

        <div className={styles.productLayout}>
          {/* Галерея, варианты, короткие характеристики и блок покупки */}
          <VariantSelector product={product} variants={variants} specifications={specifications} colorMap={colorMap} />

          {/* Состав комплекта */}
          {product.bundleItems.length > 0 && <BundleItems items={product.bundleItems} bundlePrice={product.price} />}

          {/* Якорная навигация по нижним блокам */}
          <ProductDetailsNavigation
            hasDescription={hasDescription}
            hasSpecifications={hasSpecifications}
            hasRelatedProducts={hasRelatedProducts}
          />

          {/* Описание */}
          {hasDescription ? (
            <section id="product-description" className={styles.productDescription}>
              <h2 className={styles.productDescriptionTitle}>Описание</h2>
              <div className={styles.productDescriptionText}>{product.description}</div>
            </section>
          ) : null}

          {/* Полный список характеристик */}
          <ProductFullSpecifications specifications={specifications} />

          {/* Товары из этой категории */}
          {hasRelatedProducts ? (
            <section id="product-related" className={styles.related} aria-label="Товары из этой категории">
              <h2 className={styles.relatedTitle}>Товары из категории</h2>

              <ProductsSlider>
                {relatedItems.map((item) => {
                  const itemImage = item.imageUrl ?? PLACEHOLDER_IMG;

                  return (
                    <div key={item.id} className={styles.relatedSlide}>
                      <Link href={`/catalog/product/${item.slug}`} className={styles.relatedCard}>
                        <div className={styles.relatedImage}>
                          <Image
                            src={itemImage}
                            fill
                            sizes="(max-width: 600px) 45vw, (max-width: 1200px) 33vw, 200px"
                            alt={item.name}
                            className={styles.relatedImageImg}
                          />
                        </div>

                        <div className={styles.relatedCardPrice}>{item.price.toLocaleString("ru-RU")} ₽</div>
                        <div className={styles.relatedCardTitle}>{item.name}</div>
                      </Link>
                    </div>
                  );
                })}
              </ProductsSlider>
            </section>
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}
