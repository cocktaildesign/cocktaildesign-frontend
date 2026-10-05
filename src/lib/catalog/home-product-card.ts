import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import { sortColorVariants, variantColor } from "./color-order";

export type HomeProductCardData = Pick<CatalogProductPreview,
  "id" | "slug" | "name" | "price" | "priceOld" | "images" | "imageUrl" | "imageSrcSets" |
  "preferredVariantId" | "isNew" | "noveltyBadgeColor" | "isSampleSale" | "badges"
> & { badgeMoyskladId: string };

// Home cards link to a product; variant selection and cart controls live in the
// full catalogue. Send only displayed data across the server/client boundary.
export function homeProductCard(product: CatalogProductPreview): HomeProductCardData {
  // Explicit promotional selections keep their price/photo/link. Ordinary colour
  // cards open the same default variant as the catalogue and detail page.
  const defaultVariant = !product.preferredVariantId
    ? sortColorVariants(product.variants)[0]
    : undefined;
  if (defaultVariant && variantColor(defaultVariant)) {
    const hasPrice = defaultVariant.price > 0;
    const images = Array.from(new Set([
      ...defaultVariant.images.map(image => image.src), ...product.images,
    ])).slice(0, 4);
    product = {
      ...product,
      preferredVariantId: defaultVariant.id,
      price: hasPrice ? defaultVariant.price : product.price,
      priceOld: hasPrice ? defaultVariant.priceOld : product.priceOld,
      images,
      imageUrl: images[0] ?? product.imageUrl,
    };
  }
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
