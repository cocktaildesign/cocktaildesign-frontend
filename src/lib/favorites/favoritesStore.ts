// src/lib/favorites/favoritesStore.ts
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FavoritesState = {
  // Словарь избранного:
  // ключ = productId, значение = true
  // Почему объект, а не массив:
  // - O(1) проверка "в избранном ли товар"
  // - дешёвый toggle
  ids: Record<string, true>;

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

          return { ids: next };
        });
      },
    }),
    {
      name: STORAGE_KEY,

      // Storage доступен только в браузере (файл client, всё ок)
      storage: createJSONStorage(() => localStorage),

      // В localStorage сохраняем только данные, без функций
      partialize: (state) => ({ ids: state.ids }),

      // Когда persist восстановил данные — ставим флаг
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
