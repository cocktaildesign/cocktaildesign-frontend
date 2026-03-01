// src/lib/favorites/useFavorite.ts
"use client";

import { useFavoritesStore } from "./favoritesStore";

type UseFavoriteResult = {
  isFavorite: boolean;
  toggleFavorite: () => void;
};

export function useFavorite(productId: string): UseFavoriteResult {
  // Берём boolean "в избранном ли этот товар"
  // Важно: селектор возвращает примитив (boolean) — это стабильно и быстро
  const isFavorite = useFavoritesStore((state) => state.ids[productId] === true);

  // Экшен toggle — ссылка стабильная
  const toggle = useFavoritesStore((state) => state.toggle);

  return {
    isFavorite,
    toggleFavorite: () => toggle(productId),
  };
}
