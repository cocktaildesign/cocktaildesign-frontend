import { getStrapiUrl } from "@/lib/api/strapi/client";
import { getStrapiMediaUrl } from "@/lib/api/strapi/media";
import { mediaSrcSet } from "@/lib/api/strapi/responsive-image";
import type { CatalogCategoryPreview, StrapiMediaFile } from "./types";

/** Optional image metadata for homepage tiles. The catalog tree still owns visibility and order. */
export async function getCategoryImageSrcSets(categories: CatalogCategoryPreview[]): Promise<Record<string, string>> {
  const visible = categories.filter((category) => category.imageSrc);
  if (!visible.length) return {};

  try {
    const url = new URL("/api/moysklad-categories", getStrapiUrl());
    url.searchParams.set("fields[0]", "slug");
    url.searchParams.set("pagination[pageSize]", String(visible.length));
    visible.forEach((category, index) => url.searchParams.set(`filters[slug][$in][${index}]`, category.slug));
    ["url", "width", "formats"].forEach((field, index) => url.searchParams.set(`populate[image][fields][${index}]`, field));

    // Cached server-side; a slow or unavailable metadata endpoint keeps the existing images.
    const response = await fetch(url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(2000) });
    if (!response.ok) return {};
    const body = await response.json();
    if (!Array.isArray(body?.data)) return {};

    const result: Record<string, string> = {};
    for (const category of visible) {
      const file: StrapiMediaFile | undefined = body.data.find(
        (item: { slug?: string } | null) => item?.slug === category.slug,
      )?.image;
      if (!file) continue;
      // Avoid mixing old tree data with a newly replaced CMS photo during cache refreshes.
      const candidates = [file, ...Object.values(file.formats ?? {})];
      if (!candidates.some((candidate) => candidate?.url && getStrapiMediaUrl(candidate.url) === category.imageSrc)) continue;
      const srcSet = mediaSrcSet(file, getStrapiMediaUrl);
      if (srcSet) result[category.slug] = srcSet;
    }
    return result;
  } catch {
    return {};
  }
}
