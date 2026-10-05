import type { CatalogVariant } from "@/lib/api/catalog/types";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/ё/g, "е");
}

const COLOR_PRIORITIES = [
  ["серебро", "серебристый", "серебряный", "silver"],
  ["золото", "золотой", "золотистый", "gold"],
  ["медь", "медный", "copper"],
  ["черный", "black"],
];
const alphabetical = new Intl.Collator("ru", { sensitivity: "base", numeric: true });

export function variantColor(variant: CatalogVariant): string | null {
  const value = variant.characteristics.find(
    (characteristic) => normalize(characteristic.name) === "выбор цвета",
  )?.value;
  return value?.trim() || null;
}

function priority(value: string): number {
  const index = COLOR_PRIORITIES.findIndex((names) => names.includes(normalize(value)));
  return index < 0 ? COLOR_PRIORITIES.length : index;
}

/** Storefront order only: preserve variant objects, IDs and non-colour option slots. */
export function sortColorVariants(variants: CatalogVariant[]): CatalogVariant[] {
  const colors = variants.flatMap((variant) => {
    const color = variantColor(variant);
    return color ? [{ variant, color, priority: priority(color) }] : [];
  });
  colors.sort((a, b) => a.priority - b.priority ||
    (a.priority === COLOR_PRIORITIES.length ? alphabetical.compare(a.color, b.color) : 0));
  let nextColor = 0;
  return variants.map((variant) => variantColor(variant) ? colors[nextColor++].variant : variant);
}
