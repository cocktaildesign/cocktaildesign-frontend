// src/lib/favorites/favoritesStore.ts
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FavoriteReference = { productId: string; slug: string; variantId?: string | null };
export const favoriteKey = (productId: string) => `product:${productId}`;

type FavoritesState = {
  // Словарь избранного:
  // ключ = productId, значение = true
  // Почему объект, а не массив:
  // - O(1) проверка "в избранном ли товар"
  // - дешёвый toggle
  ids: Record<string, true>;
  references: Record<string, FavoriteReference>;
  save: (reference: FavoriteReference) => void;
  resolveLegacy: (id: string, reference?: FavoriteReference) => void;

  // Флаг: localStorage уже подгрузился в store
  // Нужен, чтобы UI не "мигал" пустым состоянием на первом рендере
  hasHydrated: boolean;

  // Экшен, чтобы корректно менять hasHydrated (через set, без мутаций)
  setHasHydrated: (value: boolean) => void;

  // Проверить наличие
  isFavorite: (productId: string) => boolean;

  // Переключить (добавить/удалить)
  toggle: (productId: string) => void;
};

const STORAGE_KEY = "cocktaildesign:favorites";

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Важно: по умолчанию всегда пустой объект, НЕ undefined
      ids: {},
      references: {},
      save: (reference) => set(state => {
        const key = favoriteKey(reference.productId);
        return { ids: { ...state.ids, [key]: true }, references: { ...state.references, [key]: reference } };
      }),
      resolveLegacy: (id, reference) => set(state => {
        if (!state.ids[id] || id.startsWith("product:")) return state;
        const ids = { ...state.ids };
        const references = { ...state.references };
        delete ids[id];
        if (reference) {
          const key = favoriteKey(reference.productId);
          ids[key] = true;
          references[key] ??= reference;
        }
        return { ids, references };
      }),

      // До hydration считаем, что данные ещё не готовы
      hasHydrated: false,

      // Меняем флаг только через set (так React/Zustand корректно видят обновление)
      setHasHydrated: (value) => set({ hasHydrated: value }),

      // Простая проверка наличия ключа
      isFavorite: (productId) => get().ids[productId] === true,

      // Toggle без мутаций: создаём новый объект (важно для сравнения по ссылке)
      toggle: (productId) => {
        set((state) => {
          const next = { ...state.ids };

          if (next[productId]) {
            delete next[productId];
          } else {
            next[productId] = true;
          }

          const references = { ...state.references };
          if (!next[productId]) delete references[productId];
          return { ids: next, references };
        });
      },
    }),
    {
      name: STORAGE_KEY,

      // Storage доступен только в браузере (файл client, всё ок)
      storage: createJSONStorage(() => localStorage),

      // В localStorage сохраняем только данные, без функций
      partialize: (state) => ({ ids: state.ids, references: state.references }),

      // Когда persist восстановил данные — ставим флаг
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
