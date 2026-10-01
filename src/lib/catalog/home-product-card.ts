import type { CatalogProductPreview } from "@/lib/api/catalog/types";

export type HomeProductCardData = Pick<CatalogProductPreview,
  "id" | "slug" | "name" | "price" | "priceOld" | "images" | "imageUrl" | "imageSrcSets" |
  "preferredVariantId" | "isNew" | "noveltyBadgeColor" | "isSampleSale" | "badges"
> & { badgeMoyskladId: string };

// Home cards link to a product; variant selection and cart controls live in the
// full catalogue. Send only displayed data across the server/client boundary.
export function homeProductCard(product: CatalogProductPreview): HomeProductCardData {
  const { id, slug, name, price, priceOld, images, imageUrl, preferredVariantId,
    isNew, noveltyBadgeColor, isSampleSale, badges } = product;
  const visibleSources = new Set([...images, ...(imageUrl ? [imageUrl] : [])]);
  return {
    id, slug, name, price, priceOld, images, imageUrl, preferredVariantId,
    isNew, noveltyBadgeColor, isSampleSale, badges,
    imageSrcSets: Object.fromEntries(Object.entries(product.imageSrcSets ?? {}).filter(([src]) => visibleSources.has(src))),
    badgeMoyskladId: product.variants.find(variant => variant.id === preferredVariantId)?.moyskladId ?? product.moyskladId,
  };
}
