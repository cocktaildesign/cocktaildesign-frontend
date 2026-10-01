import type { CatalogProductDetail, CatalogVariant, ProductBadge } from "@/lib/api/catalog/types";

export function offerAvailability(id: string, states: Record<string, boolean>, badges: ProductBadge[] = []) {
  if (states[id] === true) return "https://schema.org/OutOfStock";
  if (states[id] === false) return "https://schema.org/InStock";
  if (badges.some(b => b.label.trim().replace(/\s+/g, " ").toLowerCase() === "нет в наличии")) {
    return "https://schema.org/OutOfStock";
  }
  // Unknown is not an assertion that stock exists (e.g. bundles or an unavailable API).
  return undefined;
}

export function productJsonLd(product: CatalogProductDetail, variants: CatalogVariant[], states: Record<string, boolean>, site: string) {
  const url = `${site}/catalog/product/${product.slug}`;
  const brand = product.specifications.find(s => /^(бренд|торговая марка)$/i.test(s.label.trim()))?.value.trim();
  const common = {
    name: product.name,
    description: product.description || undefined, sku: product.code || undefined, url,
    image: product.images.map(i => i.src),
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
  };
  if (variants.length) {
    return {
      "@context": "https://schema.org", "@type": "ProductGroup", ...common,
      productGroupID: product.moyskladId,
      hasVariant: variants.map(variant => {
        const variantUrl = `${url}?variant=${encodeURIComponent(variant.id)}`;
        const price = variant.price > 0 ? variant.price : product.price;
        return {
          "@type": "Product", ...common, name: variant.name || product.name,
          sku: variant.code || undefined, productID: variant.moyskladId, url: variantUrl,
          image: (variant.images.length ? variant.images : product.images).map(i => i.src),
          offers: Number.isFinite(price) && price > 0 ? {
            "@type": "Offer", url: variantUrl, priceCurrency: "RUB", price,
            availability: offerAvailability(variant.moyskladId, states, product.badges),
          } : undefined,
        };
      }),
    };
  }
  return {
    "@context": "https://schema.org", "@type": "Product", ...common,
    offers: Number.isFinite(product.price) && product.price > 0 ? {
      "@type": "Offer", url, priceCurrency: "RUB", price: product.price,
      availability: offerAvailability(product.moyskladId, states, product.badges),
    } : undefined,
  };
}
