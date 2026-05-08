// src/lib/cart/cartStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// CartItem - один товар в корзине
export type CartItem = {
  id: string;
  name: string;
  price: number;
  priceOld: number;
  imageUrl: string | null;
  slug: string;
  quantity: number;
  engraving: boolean;
  // Флаг — товар не участвует в скидках и промокодах
  discountExcluded: boolean;
  code: string;
};

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

      addItem: (item) => {
        const existingItem = get().items.find((i) => i.id === item.id);

        if (existingItem) {
          const updatedItems = get().items.map((i) => {
            if (i.id !== item.id) return i;
            return {
              ...i,
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
        const hasItem = currentItems.some((i) => i.id === id);
        if (!hasItem) return;

        const itemsWithoutRemoved = currentItems.filter((i) => i.id !== id);
        set({ items: itemsWithoutRemoved, ...promoResetState });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const currentItems = get().items;
        const currentItem = currentItems.find((i) => i.id === id);
        if (!currentItem) return;
        if (currentItem.quantity === quantity) return;

        const updatedItems = currentItems.map((i) => {
          if (i.id !== id) return i;
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
        const allIds = get().items.map((item) => item.id);
        set({ selectedIds: allIds });
      },

      clearSelected: () => {
        set({ selectedIds: [] });
      },

      removeSelected: () => {
        const selectedIds = get().selectedIds;
        if (selectedIds.length === 0) return;
        const remainingItems = get().items.filter((item) => !selectedIds.includes(item.id));
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
