import type { CatalogBundleComponentProduct, CatalogProductDetail } from "@/lib/api/catalog/types";

export type CompositionLine = { id: string; name: string; quantity: number | null; href: string | null };
const isComposition = (label: string) => label.trim().toLocaleLowerCase("ru") === "комплектация";

export function bundleComponentHref(product: CatalogBundleComponentProduct): string {
  const path = `/catalog/product/${encodeURIComponent(product.slug)}`;
  return product.variantId ? `${path}?variant=${encodeURIComponent(product.variantId)}` : path;
}

/** CRM composition is authoritative; legacy editorial text remains a fallback, never erased. */
export function productComposition(product: CatalogProductDetail): CompositionLine[] {
  if (product.hideBundleContents) return [];
  if (product.bundleItems.length) return product.bundleItems.map((item) => ({
    id: item.id, name: item.name, quantity: item.quantity,
    href: item.componentProduct ? bundleComponentHref(item.componentProduct) : null,
  }));
  const text = product.composition.length ? product.composition : product.specifications
    .filter((spec) => isComposition(spec.label)).map((spec) => spec.value);
  return text.flatMap((value) => value.split(/[;\r\n]+/)).map((value) => value.trim()).filter(Boolean)
    .map((name, i) => ({ id: `editorial-${i}`, name, quantity: null, href: null }));
}

export function productDisplaySpecifications(product: CatalogProductDetail) {
  return product.specifications.filter((spec) => !isComposition(spec.label));
}
