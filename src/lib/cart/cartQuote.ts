// Presentation of an already calculated cart. Does not choose or apply discounts.
export type QuoteItem = {
  name: string;
  slug: string;
  code: string | null;
  price: number;
  quantity: number;
  engraving: boolean;
  discountExcluded: boolean;
};

export type QuotePricing = {
  volumeDiscount: number;
  promoDiscount: number;
  promoType: "percent" | "fixed" | "inventory" | "startup" | "";
  promoCode: string;
  bonusMessage: string;
};

export const NO_QUOTE_DISCOUNTS: QuotePricing = {
  volumeDiscount: 0, promoDiscount: 0, promoType: "", promoCode: "", bonusMessage: "",
};

export function moneyCents(value: number): number {
  const cents = Math.round(value * 100);
  if (!Number.isFinite(value) || value < 0 || !Number.isSafeInteger(cents) || Math.abs(cents / 100 - value) > 0.000001) {
    throw new Error("invalid_quote_money");
  }
  return cents;
}

/** Allocate only the existing percentage discount, preserving its exact rounded total. */
function allocateCents(amount: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(sum) || amount > sum) throw new Error("invalid_quote_discount");
  if (amount === 0) return weights.map(() => 0);
  const denominator = BigInt(sum);
  const shares = weights.map((weight, index) => {
    const numerator = BigInt(amount) * BigInt(weight);
    return { index, value: Number(numerator / denominator), remainder: numerator % denominator };
  });
  const remaining = amount - shares.reduce((sum, share) => sum + share.value, 0);
  const ordered = [...shares].sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
  for (let i = 0; i < remaining; i++) ordered[i].value++;
  return shares.map(share => share.value);
}

export function buildCartQuote(items: QuoteItem[], pricing: QuotePricing) {
  const volumeCents = moneyCents(pricing.volumeDiscount);
  const promoCents = moneyCents(pricing.promoDiscount);
  const isPercent = pricing.promoType === "percent" || pricing.promoType === "startup";
  if ((isPercent && volumeCents > 0 && promoCents > 0) ||
      (!isPercent && pricing.promoType !== "fixed" && promoCents > 0)) throw new Error("invalid_quote_discount");
  const percentageCents = volumeCents + (isPercent ? promoCents : 0);
  const fixedCents = pricing.promoType === "fixed" ? promoCents : 0;
  const base = items.map(item => {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error("invalid_quote_quantity");
    const unitCents = moneyCents(item.price);
    const lineCents = unitCents * item.quantity;
    if (!Number.isSafeInteger(lineCents)) throw new Error("invalid_quote_money");
    return { ...item, unitCents, lineCents };
  });
  const subtotalCents = base.reduce((sum, item) => sum + item.lineCents, 0);
  if (!Number.isSafeInteger(subtotalCents) || percentageCents + fixedCents > subtotalCents) throw new Error("invalid_quote_discount");
  const discounts = allocateCents(percentageCents, base.map(item => item.discountExcluded ? 0 : item.lineCents));
  const rows = base.map((item, index) => {
    const discountCents = discounts[index];
    const unitDiscountCents = Math.round(discountCents / item.quantity);
    return { ...item, discountCents, unitDiscountCents,
      unitFinalCents: item.unitCents - unitDiscountCents,
      finalCents: item.lineCents - discountCents,
      roundedUnit: unitDiscountCents * item.quantity !== discountCents };
  });
  return { rows, pricing, subtotalCents, volumeCents, percentageCents, fixedCents,
    totalDiscountCents: percentageCents + fixedCents,
    finalCents: subtotalCents - percentageCents - fixedCents,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    hasRoundedUnits: rows.some(row => row.roundedUnit) };
}

export type CartQuote = ReturnType<typeof buildCartQuote>;
export const QUOTE_ROUNDING_NOTE = "≈ — цена и скидка за единицу округлены до копеек. Стоимость строки и итог рассчитаны с точной суммой скидки.";
export const QUOTE_PRICE_NOTE = "Цена на сайте уже учитывает снижение цены товара. Дополнительная скидка по заказу показана отдельно.";

export function quoteSummaryRows(quote: CartQuote): Array<{ label: string; cents: number }> {
  const rows = [{ label: "Сумма до скидок по заказу", cents: quote.subtotalCents }];
  if (quote.volumeCents > 0) rows.push({ label: "Скидка за объём", cents: -quote.volumeCents });
  const code = quote.pricing.promoCode ? ` (${quote.pricing.promoCode})` : "";
  if (quote.percentageCents > quote.volumeCents) rows.push({
    label: (quote.pricing.promoType === "startup" ? "Акция СТАРТАП" : "Процентный промокод") + code,
    cents: -(quote.percentageCents - quote.volumeCents),
  });
  if (quote.fixedCents > 0) rows.push({ label: "Денежный промокод" + code, cents: -quote.fixedCents });
  return rows;
}
