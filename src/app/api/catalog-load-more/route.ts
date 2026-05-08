import { NextRequest, NextResponse } from "next/server";
import { getCollectionProductsFromStrapi, getProductsByCategorySlugFromStrapi } from "@/lib/api/catalog";

function parseLimit(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 50;
  return Math.min(100, Math.max(1, Math.floor(parsed)));
}

function parseOffset(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const limit = parseLimit(searchParams.get("limit"));
  const offset = parseOffset(searchParams.get("offset"));

  const categorySlug = searchParams.get("categorySlug")?.trim() ?? "";
  const collectionSlug = searchParams.get("collectionSlug")?.trim() ?? "";
  const filterCategorySlug = searchParams.get("filterCategorySlug")?.trim() ?? "";

  if (!categorySlug && !collectionSlug) {
    return NextResponse.json({ error: "categorySlug or collectionSlug is required" }, { status: 400 });
  }

  try {
    if (collectionSlug) {
      const result = await getCollectionProductsFromStrapi({
        slug: collectionSlug,
        limit,
        offset,
        categorySlug: filterCategorySlug || undefined,
      });

      return NextResponse.json({ items: result.items, hasMore: result.hasMore });
    }

    const result = await getProductsByCategorySlugFromStrapi({
      categorySlug,
      limit,
      offset,
    });

    return NextResponse.json({ items: result.items, hasMore: result.hasMore });
  } catch {
    return NextResponse.json({ error: "failed_to_load_products" }, { status: 500 });
  }
}
