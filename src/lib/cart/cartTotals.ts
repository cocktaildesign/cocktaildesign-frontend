import type { CartItem } from "./cartStore";
import { getCurrentTier, getNextTier, type DiscountTier } from "./discountTiers";

type Promo = {
  promoDiscount: number;
  promoType: "percent" | "fixed" | "inventory" | "startup" | "";
  promoReplacesVolumeDiscount: boolean;
};

/** Existing cart/checkout rules, shared by every displayed order total. */
export function calculateCartTotals(items: CartItem[], tiers: DiscountTier[], promo: Promo) {
  let totalPrice = 0;
  let totalQuantity = 0;
  let totalSavings = 0;
  let discountableTotal = 0;
  for (const item of items) {
    totalPrice += item.price * item.quantity;
    totalQuantity += item.quantity;
    if (item.priceOld > item.price) totalSavings += (item.priceOld - item.price) * item.quantity;
    if (!item.discountExcluded) discountableTotal += item.price * item.quantity;
  }

  // All items count toward the tier; only eligible items receive the percentage.
  const currentTier = getCurrentTier(tiers, totalPrice);
  const nextTier = getNextTier(tiers, totalPrice);
  const volumeDiscount = currentTier ? Math.round((discountableTotal * currentTier.percent) / 100) : 0;
  const { promoDiscount, promoType, promoReplacesVolumeDiscount } = promo;
  const promoApplied = promoDiscount > 0 || promoType === "inventory" || promoType === "startup";
  let activeVolumeDiscount = volumeDiscount;
  let activePromoDiscount = promoDiscount;
  if (promoReplacesVolumeDiscount && promoApplied) {
    if (volumeDiscount > promoDiscount) activePromoDiscount = 0;
    else activeVolumeDiscount = 0;
  }
  if (!promoReplacesVolumeDiscount && activePromoDiscount > 0) {
    const remainingAfterVolume = Math.max(0, totalPrice - activeVolumeDiscount);
    activePromoDiscount = Math.min(activePromoDiscount, remainingAfterVolume);
  }
  const finalPrice = Math.max(0, totalPrice - activePromoDiscount - activeVolumeDiscount);
  return { totalPrice, totalQuantity, totalSavings, discountableTotal, currentTier, nextTier,
    promoApplied, activeVolumeDiscount, activePromoDiscount, finalPrice };
}

export type CartTotals = ReturnType<typeof calculateCartTotals>;
