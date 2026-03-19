// src/app/catalog/product/[slug]/page.tsx
//
// Server Component — данные грузятся на сервере, клиенту уходит готовый HTML.
// Интерактивные части (галерея, варианты, цена) вынесены в VariantSelector.

import { pageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/seo/site";
import ProductsSlider from "@/components/ui/products-slider/ProductsSlider";
import { notFound } from "next/navigation";
import { getStrapiMediaUrl } from "@/lib/api/strapi/media";
import Link from "next/link";
import Image from "next/image";
import PageLayout from "@/components/layout/PageLayout";
import { getProductBySlugFromStrapi } from "@/lib/api/catalog";
import BundleItems from "./bundle/BundleItems";
import VariantSelector from "./VariantSelector";

import styles from "./ProductPage.module.css";

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

type ImageFormat = { url: string };

type ProductImageFormats = {
  thumbnail?: ImageFormat;
  small?: ImageFormat;
  medium?: ImageFormat;
  large?: ImageFormat;
} | null;

type ProductImage = {
  url: string;
  alternativeText?: string | null;
  formats?: ProductImageFormats;
};

type RelatedProductAttributes = {
  name: string | null;
  slug: string | null;
  price: number | null;
  priceOld: number | null;
  image: ProductImage[] | null;
};

type RelatedProduct = {
  id: number;
  attributes: RelatedProductAttributes;
};

type RelatedProductsResponse = {
  items: RelatedProduct[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

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

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });

  if (!res.ok) return null;

  return (await res.json()) as RelatedProductsResponse;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProductBySlugFromStrapi(slug);

  if (!data) return {};

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

  const data = await getProductBySlugFromStrapi(slug);
  if (!data) notFound();

  const { product, breadcrumbsCategories } = data;
  const variants = data.variants ?? [];
  const specifications = product.specifications ?? [];

  const productUrl = `${siteUrl}/catalog/product/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.code ?? undefined,
    image: product.images.map((image) => image.src),
    url: productUrl,
    brand: { "@type": "Brand", name: "CocktailDesign" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "RUB",
      price: String(product.price),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const breadcrumbsItems = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    ...breadcrumbsCategories.map((c) => ({
      href: `/catalog/${c.slug}`,
      label: c.name,
    })),
    { href: `/catalog/product/${product.slug}`, label: product.name },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />

      <section className={styles.productPage}>
        <header className={styles.productPageHeader}>
          <h1 className={styles.productPageTitle}>{product.name}</h1>
        </header>

        <div className={styles.productLayout}>
          {/* VariantSelector: галерея + варианты + О товаре + сайдбар */}
          <VariantSelector product={product} variants={variants} specifications={specifications} />

          {/* Состав комплекта — только для bundle товаров */}
          {product.bundleItems.length > 0 && <BundleItems items={product.bundleItems} bundlePrice={product.price} />}

          {/* Описание */}
          {product.description?.trim() ? (
            <div id="product-description" className={styles.productDescription}>
              <h2 className={styles.productDescriptionTitle}>Описание</h2>
              <div className={styles.productDescriptionText}>{product.description}</div>
            </div>
          ) : null}

          {/* Похожие товары */}
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
                        <Image
                          src={itemImg}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          alt={itemName}
                          className={styles.relatedImageImg}
                        />
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
