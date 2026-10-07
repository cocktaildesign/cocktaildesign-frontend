import { NextRequest, NextResponse } from "next/server";
import { fetchStrapi } from "@/lib/api/strapi/client";
import { getProductsByCategorySlugFromStrapi } from "@/lib/api/catalog/queries";
import { indexLegacyFavorites, type LegacyFavoriteIndex } from "@/lib/favorites/legacy";

// Build a shared index of public entries only for legacy recovery. Never guess
// which entity was saved when a number belongs to two different products.
let cached: { expires: number; value: LegacyFavoriteIndex } | undefined;
let pending: Promise<LegacyFavoriteIndex> | undefined;
async function index() {
  if (cached && cached.expires > Date.now()) return cached.value;
  if (!pending) pending = (async () => {
    const categories = await fetchStrapi<{ slug: string; parentId: number | null }[]>("/api/catalog/categories-flat");
    const result: LegacyFavoriteIndex = {};
    for (const category of categories.filter(c => !c.parentId)) {
      for (let offset = 0; ; offset += 100) {
        if (offset >= 10000) throw new Error("Catalogue limit reached");
        const page = await getProductsByCategorySlugFromStrapi({ categorySlug: category.slug, limit: 100, offset });
        indexLegacyFavorites(page.items, result);
        if (!page.hasMore) break;
        if (!page.items.length) throw new Error("Incomplete catalogue page");
      }
    }
    cached = { expires: Date.now() + 60 * 60 * 1000, value: result };
    return result;
  })().finally(() => { pending = undefined; });
  return pending;
}

export async function GET(request: NextRequest) {
  const ids = [...new Set((request.nextUrl.searchParams.get("ids") ?? "").split(","))];
  if (!ids.length || ids.length > 50 || ids.some(id => !/^\d{1,12}$/.test(id))) {
    return NextResponse.json({ error: "invalid_ids" }, { status: 400 });
  }
  try {
    const all = await index();
    return NextResponse.json({ candidates: Object.fromEntries(ids.map(id => [id, all[id] ?? []])) });
  } catch {
    return NextResponse.json({ error: "catalogue_unavailable" }, { status: 503 });
  }
}
