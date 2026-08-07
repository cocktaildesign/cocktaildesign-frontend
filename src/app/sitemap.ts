// src/app/sitemap.ts
import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/site";
import { getCatalogTreeFromStrapi, getProductsByCategorySlugFromStrapi } from "@/lib/api/catalog";
import { getKnowledgeItemsFromStrapi } from "@/lib/api/knowledge";

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
async function getAllProductSlugs(categorySlugs: string[]): Promise<string[]> {
  const productSlugsSet = new Set<string>();

  for (const categorySlug of categorySlugs) {
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await getProductsByCategorySlugFromStrapi({
        categorySlug,
        limit,
        offset,
      });

      for (const product of response.items) {
        if (product.slug) {
          productSlugsSet.add(product.slug);
        }
      }

      if (!response.hasMore) break;

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

    { url: `${siteUrl}/contacts`, changeFrequency: "monthly", priority: 0.7 },

    { url: `${siteUrl}/discounts`, changeFrequency: "weekly", priority: 0.7 },

    { url: `${siteUrl}/help`, changeFrequency: "monthly", priority: 0.6 },

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
  const [catalogTree, knowledgeItems] = await Promise.all([
    getCatalogTreeFromStrapi(),
    getKnowledgeItemsFromStrapi(null, null),
  ]);

  // --- категории ---
  const categorySlugs = flattenCategories(catalogTree);

  const categoryPages: SitemapItem[] = categorySlugs.map((slug) => ({
    url: `${siteUrl}/catalog/${slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // --- товары ---
  const productSlugs = await getAllProductSlugs(categorySlugs);

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

  return [...staticPages, ...categoryPages, ...productPages, ...knowledgePages];
}
