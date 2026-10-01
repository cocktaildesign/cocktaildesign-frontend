// src/app/sitemap.ts
import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/site";
import { getCatalogTreeFromStrapi, getProductsByCategorySlugFromStrapi, getCollectionProductsFromStrapi } from "@/lib/api/catalog";
import { getKnowledgeItemsFromStrapi } from "@/lib/api/knowledge";
import { getSitemapCollectionSlugs } from "@/lib/seo/collections";
import { SAMPLE_SALE_CATEGORY_SLUG } from "@/lib/catalog/sample-sale";

export const revalidate = 3600;

type SitemapItem = MetadataRoute.Sitemap[number];

// ============================================================================
// TYPES
// ============================================================================

type CatalogTreeNode = {
  slug: string;
  children?: CatalogTreeNode[];
};

// ============================================================================
// HELPERS
// ============================================================================

// собираем все slug категорий (рекурсивно)
function flattenCategories(items: CatalogTreeNode[]): string[] {
  const result: string[] = [];

  for (const item of items) {
    result.push(item.slug);

    if (item.children && item.children.length > 0) {
      result.push(...flattenCategories(item.children));
    }
  }

  return result;
}

// собираем все товары через категории (без дублей)
async function getAllProductSlugs(categorySlugs: string[], collectionSlugs: string[]): Promise<string[]> {
  const productSlugsSet = new Set<string>();

  for (const source of [
    ...categorySlugs.map(slug => ({ slug, collection: false })),
    ...collectionSlugs.map(slug => ({ slug, collection: true })),
  ]) {
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = source.collection
        ? await getCollectionProductsFromStrapi({ slug: source.slug, limit, offset })
        : await getProductsByCategorySlugFromStrapi({ categorySlug: source.slug, limit, offset });

      for (const product of response.items) {
        if (product.slug) {
          productSlugsSet.add(product.slug);
        }
      }

      if (!response.hasMore) break;
      if (!response.items.length) throw new Error("Incomplete catalogue response while building sitemap");

      offset += limit;
    }
  }

  return Array.from(productSlugsSet);
}

// ============================================================================
// SITEMAP
// ============================================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // --- статика ---
  const staticPages: SitemapItem[] = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },

    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/branding`, changeFrequency: "monthly", priority: 0.8 },

    { url: `${siteUrl}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/prof-oborudovanie-dlya-restoranov-i-kafe`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/posuda-dlya-barov-i-restoranov`, changeFrequency: "monthly", priority: 0.7 },

    { url: `${siteUrl}/contacts`, changeFrequency: "monthly", priority: 0.7 },

    { url: `${siteUrl}/discounts`, changeFrequency: "weekly", priority: 0.7 },

    { url: `${siteUrl}/knowledge`, changeFrequency: "weekly", priority: 0.8 },

    { url: `${siteUrl}/payment-methods`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/shipping`, changeFrequency: "monthly", priority: 0.6 },

    { url: `${siteUrl}/support`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/support/feedback`, changeFrequency: "monthly", priority: 0.5 },

    { url: `${siteUrl}/legal`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/legal/offer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/requisites`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // --- данные ---
  const [catalogTree, knowledgeItems, collectionSlugs] = await Promise.all([
    getCatalogTreeFromStrapi(),
    getKnowledgeItemsFromStrapi(null, null),
    getSitemapCollectionSlugs(),
  ]);

  // --- категории ---
  const categorySlugs = flattenCategories(catalogTree).filter(slug => slug !== SAMPLE_SALE_CATEGORY_SLUG);

  const categoryPages: SitemapItem[] = categorySlugs.map((slug) => ({
    url: `${siteUrl}/catalog/${slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // --- товары ---
  const productSlugs = await getAllProductSlugs(catalogTree.map(category => category.slug), collectionSlugs);

  const collectionPages: SitemapItem[] = collectionSlugs.map(slug => ({
    url: `${siteUrl}/catalog/collection/${slug}`, changeFrequency: "daily", priority: 0.8,
  }));

  const productPages: SitemapItem[] = productSlugs.map((slug) => ({
    url: `${siteUrl}/catalog/product/${slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // --- knowledge ---
  const knowledgePages: SitemapItem[] = knowledgeItems.map((item) => {
    const segment = item.format === "video" ? "videos" : item.format === "article" ? "articles" : "materials";

    return {
      url: `${siteUrl}/knowledge/${segment}/${item.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    };
  });

  return [...new Map([...staticPages, ...categoryPages, ...collectionPages, ...productPages, ...knowledgePages]
    .map(item => [item.url, item])).values()];
}
