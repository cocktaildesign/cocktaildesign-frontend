import type { CatalogBundleComponentProduct, CatalogProductDetail } from "@/lib/api/catalog/types";

const isComposition = (label: string) => label.trim().toLocaleLowerCase("ru") === "комплектация";

export function bundleComponentHref(product: CatalogBundleComponentProduct): string {
  const path = `/catalog/product/${encodeURIComponent(product.slug)}`;
  return product.variantId ? `${path}?variant=${encodeURIComponent(product.variantId)}` : path;
}

/** Only separately available shop cards are shown; descriptions stay in their own section. */
export function productBundleCards(product: CatalogProductDetail) {
  if (product.hideBundleContents) return [];
  return product.bundleItems.filter((item) => item.componentProduct !== null);
}

export function productDisplaySpecifications(product: CatalogProductDetail) {
  return product.specifications.filter((spec) => !isComposition(spec.label));
}
