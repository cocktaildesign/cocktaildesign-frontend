// src/lib/cart/cartStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// CartItem - один товар в корзине
export type CartItem = {
  id: string;
  productId?: string;
  variantId?: string | null;
  name: string;
  price: number;
  priceOld: number;
  imageUrl: string | null;
  slug: string;
  quantity: number;
  engraving: boolean;
  // Запрет скидки за объём и процентных промокодов; денежные промокоды разрешены.
  discountExcluded: boolean;
  code: string;
};

// Old saved rows already contain these three fields. Keep their data intact and
// namespace the entity ID by its parent and literal SKU (including / versus \).
export function cartLineKey(item: Pick<CartItem, "id" | "slug" | "code">): string {
  return JSON.stringify([item.slug, item.id, item.code]);
}

export function cartProductHref(item: Pick<CartItem, "slug" | "code" | "variantId">): string {
  const base = `/catalog/product/${item.slug}`;
  if (item.variantId) return `${base}?variant=${encodeURIComponent(item.variantId)}`;
  // A legacy row has no entity type; never guess a variant from its numeric ID.
  return item.variantId === undefined && item.code ? `${base}?sku=${encodeURIComponent(item.code)}` : base;
}

// CartState — всё состояние корзины + все actions (действия).
type CartState = {
  items: CartItem[];
  selectedIds: string[];
  hasHydrated: boolean;

  // Промокод
  promoCode: string;
  promoDiscount: number;
  // Тип промокода — нужен для логики на фронте
  promoType: "percent" | "fixed" | "inventory" | "startup" | "";
  // Плашка с бонусами — для inventory и startup
  promoBonusMessage: string;
  // Заменяет ли промокод объёмную скидку (percent и startup)
  promoReplacesVolumeDiscount: boolean;

  // Actions
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelected: () => void;
  removeSelected: () => void;
  setHasHydrated: (value: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setEngraving: (id: string, engraving: boolean) => void;
  applyDiscountPolicy: (policy: Record<string, boolean>) => void;

  // Установить промокод
  setPromo: (params: {
    code: string;
    discount: number;
    type: "percent" | "fixed" | "inventory" | "startup" | "";
    bonusMessage?: string;
    replacesVolumeDiscount?: boolean;
  }) => void;

  clearPromo: () => void;
  clearCart: () => void;
};

const STORAGE_KEY = "cocktaildesign:cart";
const promoResetState = {
  promoCode: "",
  promoDiscount: 0,
  promoType: "" as const,
  promoBonusMessage: "",
  promoReplacesVolumeDiscount: false,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],
      hasHydrated: false,

      // Промокод по умолчанию пустой
      promoCode: "",
      promoDiscount: 0,
      promoType: "",
      promoBonusMessage: "",
      promoReplacesVolumeDiscount: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      // A manager-priced request only: do not change quantities, prices, promos or selected rows.
      setEngraving: (id, engraving) => {
        const items = get().items;
        if (!items.some(item => cartLineKey(item) === id && item.engraving !== engraving)) return;
        set({ items: items.map(item => cartLineKey(item) === id ? { ...item, engraving } : item) });
      },

      applyDiscountPolicy: (policy) => {
        const state = get();
        let changed = false;
        const items = state.items.map(item => {
          const excluded = policy[item.code.trim()];
          if (typeof excluded !== "boolean" || excluded === item.discountExcluded) return item;
          changed = true;
          return { ...item, discountExcluded: excluded };
        });
        if (!changed) return;
        // A saved percentage promo preview is stale if its eligible subtotal changed.
        // Fixed money promos and gifts keep their existing treatment.
        const resetPercentPromo = state.promoType === "percent" || state.promoType === "startup";
        set({ items, ...(resetPercentPromo ? promoResetState : {}) });
      },

      addItem: (item) => {
        const existingItem = get().items.find((i) => cartLineKey(i) === cartLineKey(item));

        if (existingItem) {
          const updatedItems = get().items.map((i) => {
            if (cartLineKey(i) !== cartLineKey(item)) return i;
            return {
              ...i,
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              price: item.price,
              priceOld: item.priceOld,
              imageUrl: item.imageUrl,
              slug: item.slug,
              engraving: item.engraving,
              discountExcluded: item.discountExcluded,
              code: item.code,
              quantity: i.quantity + item.quantity,
            };
          });

          set({ items: updatedItems, ...promoResetState });
          return;
        }

        const newItems = [...get().items, item];
        set({ items: newItems, ...promoResetState });
      },

      removeItem: (id) => {
        const currentItems = get().items;
        const hasItem = currentItems.some((i) => cartLineKey(i) === id);
        if (!hasItem) return;

        const itemsWithoutRemoved = currentItems.filter((i) => cartLineKey(i) !== id);
        set({ items: itemsWithoutRemoved, ...promoResetState });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const currentItems = get().items;
        const currentItem = currentItems.find((i) => cartLineKey(i) === id);
        if (!currentItem) return;
        if (currentItem.quantity === quantity) return;

        const updatedItems = currentItems.map((i) => {
          if (cartLineKey(i) !== id) return i;
          return { ...i, quantity };
        });

        set({ items: updatedItems, ...promoResetState });
      },

      // Установить промокод со всеми данными
      setPromo: ({ code, discount, type, bonusMessage = "", replacesVolumeDiscount = false }) => {
        set({
          promoCode: code,
          promoDiscount: discount,
          promoType: type,
          promoBonusMessage: bonusMessage,
          promoReplacesVolumeDiscount: replacesVolumeDiscount,
        });
      },

      clearPromo: () => {
        set({
          promoCode: "",
          promoDiscount: 0,
          promoType: "",
          promoBonusMessage: "",
          promoReplacesVolumeDiscount: false,
        });
      },

      clearCart: () => {
        set({
          items: [],
          promoCode: "",
          promoDiscount: 0,
          promoType: "",
          promoBonusMessage: "",
          promoReplacesVolumeDiscount: false,
        });
      },

      toggleSelected: (id) => {
        const currentIds = get().selectedIds;
        const isSelected = currentIds.includes(id);

        if (isSelected) {
          const withoutId = currentIds.filter((selectedId) => selectedId !== id);
          set({ selectedIds: withoutId });
        } else {
          set({ selectedIds: [...currentIds, id] });
        }
      },

      selectAll: () => {
        const allIds = get().items.map(cartLineKey);
        set({ selectedIds: allIds });
      },

      clearSelected: () => {
        set({ selectedIds: [] });
      },

      removeSelected: () => {
        const selectedIds = get().selectedIds;
        if (selectedIds.length === 0) return;
        const remainingItems = get().items.filter((item) => !selectedIds.includes(cartLineKey(item)));
        set({ items: remainingItems, selectedIds: [], ...promoResetState });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
        promoType: state.promoType,
        promoBonusMessage: state.promoBonusMessage,
        promoReplacesVolumeDiscount: state.promoReplacesVolumeDiscount,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
