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
  engraving: boolean; // ← новое поле
};

// CartState — всё состояние корзины + все actions (действия).
type CartState = {
  // Список товаров в корзине
  items: CartItem[];
  selectedIds: string[];
  hasHydrated: boolean;

  // Actions

  // Выбрать / снять один товар
  toggleSelected: (id: string) => void;

  // Выбрать все товары
  selectAll: () => void;

  // Снять выделение со всех
  clearSelected: () => void;

  // Удалить все выбранные товары
  removeSelected: () => void;

  setHasHydrated: (value: boolean) => void;

  // Добавить товар (если уже есть — увеличить quantity)
  addItem: (item: CartItem) => void;

  // Удалить товар полностью по id
  removeItem: (id: string) => void;

  // Изменить количество товара по id
  updateQuantity: (id: string, quantity: number) => void;

  clearCart: () => void;
};

// Ключ под которым корзина сохраняется в localStorage
const STORAGE_KEY = "cocktaildesign:cart";

// Создаём store — по той же схеме что favoritesStore
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Начальное состояние — пустая корзина
      items: [],
      selectedIds: [],

      // До загрузки localStorage — false, после — true
      hasHydrated: false,

      // Меняем флаг только через set
      setHasHydrated: (value) => set({ hasHydrated: value }),

      // Добавить товар.
      // Если товар уже есть в корзине — просто увеличиваем quantity.
      // Если нет — добавляем в конец массива.
      addItem: (item) => {
        // Ищем товар в корзине по id
        const existingItem = get().items.find((i) => i.id === item.id);

        // Если товар уже есть в корзине
        if (existingItem) {
          // Создаём новый массив — где у нужного товара увеличили quantity
          const updatedItems = get().items.map((i) => {
            // Это не тот товар — возвращаем без изменений
            if (i.id !== item.id) return i;

            // Это тот товар — увеличиваем количество
            return { ...i, quantity: i.quantity + item.quantity };
          });

          set({ items: updatedItems });
          return;
        }

        // Товара нет в корзине — добавляем в конец
        const newItems = [...get().items, item];
        set({ items: newItems });
      },

      // Удалить товар полностью из корзины по id
      removeItem: (id) => {
        const itemsWithoutRemoved = get().items.filter((i) => i.id !== id);
        set({ items: itemsWithoutRemoved });
      },

      // Изменить количество товара.
      // Если quantity <= 0 — удаляем товар совсем.
      updateQuantity: (id, quantity) => {
        // Если количество 0 или меньше — удаляем товар совсем
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        // Иначе — обновляем quantity у нужного товара
        const updatedItems = get().items.map((i) => {
          if (i.id !== id) return i;
          return { ...i, quantity };
        });

        set({ items: updatedItems });
      },

      // Очистить всю корзину
      clearCart: () => {
        set({ items: [] });
      },

      // Выбрать / снять один товар по id
      toggleSelected: (id) => {
        const currentIds = get().selectedIds;

        // Если уже выбран — убираем из массива
        const isSelected = currentIds.includes(id);

        if (isSelected) {
          const withoutId = currentIds.filter((selectedId) => selectedId !== id);
          set({ selectedIds: withoutId });
        } else {
          // Не выбран — добавляем в массив
          set({ selectedIds: [...currentIds, id] });
        }
      },

      // Выбрать все товары — берём все id из items
      selectAll: () => {
        const allIds = get().items.map((item) => item.id);
        set({ selectedIds: allIds });
      },

      // Снять выделение со всех
      clearSelected: () => {
        set({ selectedIds: [] });
      },

      // Удалить все выбранные товары
      removeSelected: () => {
        const selectedIds = get().selectedIds;

        // Оставляем только те товары, которые НЕ выбраны
        const remainingItems = get().items.filter((item) => !selectedIds.includes(item.id));

        // Очищаем и товары и выделение
        set({ items: remainingItems, selectedIds: [] });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Сохраняем в localStorage только данные, без функций
      partialize: (state) => ({ items: state.items }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
