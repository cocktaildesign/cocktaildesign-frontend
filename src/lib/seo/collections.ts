import { fetchStrapi } from "@/lib/api/strapi/client";

// Only published collection identifiers; do not populate the whole catalogue to build a sitemap.
export async function getSitemapCollectionSlugs(): Promise<string[]> {
  const slugs = new Set<string>();
  let page = 1;
  while (true) {
    const response = await fetchStrapi<{
      data: { slug: string }[];
      meta?: { pagination?: { pageCount: number } };
    }>("/api/catalog-collections", {
      "fields[0]": "slug", "pagination[pageSize]": "100", "pagination[page]": String(page),
      status: "published", sort: "id:asc",
    });
    for (const item of response.data) if (item.slug?.trim()) slugs.add(item.slug.trim());
    if (page >= (response.meta?.pagination?.pageCount ?? 1)) break;
    page++;
  }
  return [...slugs];
}
