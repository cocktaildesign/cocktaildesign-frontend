export const CART_API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.cocktaildesign.ru/api").replace(/\/$/, "");

/** Refresh only discount eligibility. Never replace saved prices, quantities or selections. */
export async function fetchCartDiscountPolicy(codes: string[], signal: AbortSignal): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = Object.create(null);
  if (codes.some(code => !code || code.length > 64)) throw new Error("invalid_cart_code");
  for (let offset = 0; offset < codes.length; offset += 25) {
    const batch = codes.slice(offset, offset + 25);
    const query = new URLSearchParams({ codes: JSON.stringify(batch) });
    const response = await fetch(`${CART_API_BASE}/catalog/cart-discount-policy?${query}`, {
      signal, cache: "no-store",
    });
    if (!response.ok) throw new Error("discount_policy_unavailable");
    const data: { items?: Array<{ code: string; discountExcluded: boolean }> } = await response.json();
    if (!Array.isArray(data.items)) throw new Error("invalid_discount_policy");
    for (const item of data.items) {
      if (!batch.includes(item.code) || typeof item.discountExcluded !== "boolean") {
        throw new Error("invalid_discount_policy");
      }
      result[item.code] = item.discountExcluded;
    }
    if (batch.some(code => !Object.hasOwn(result, code))) throw new Error("cart_item_unavailable");
  }
  return result;
}
