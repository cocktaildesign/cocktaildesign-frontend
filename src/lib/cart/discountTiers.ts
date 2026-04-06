// src/lib/cart/discountTiers.ts
"use client";

import { useEffect, useState } from "react";

// Один порог скидки — как приходит из Strapi
export type DiscountTier = {
  id: number;
  minAmount: number; // от какой суммы работает скидка
  percent: number; // размер скидки в процентах
};

// URL бэкенда
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.cocktaildesign.ru/api";

// Находим текущий активный тир —
// последний у которого minAmount <= discountableTotal
// Пример: сумма 25 000 → возвращает тир 20 000 (7%)
export function getCurrentTier(tiers: DiscountTier[], discountableTotal: number): DiscountTier | null {
  let result: DiscountTier | null = null;

  for (const tier of tiers) {
    if (discountableTotal >= tier.minAmount) {
      result = tier;
    }
  }

  return result;
}

// Находим следующий тир —
// первый у которого minAmount > discountableTotal
// Пример: сумма 25 000 → возвращает тир 30 000 (10%)
export function getNextTier(tiers: DiscountTier[], discountableTotal: number): DiscountTier | null {
  for (const tier of tiers) {
    if (tier.minAmount > discountableTotal) {
      return tier;
    }
  }

  // Достигли максимального тира — следующего нет
  return null;
}

// Хук — загружает тиры из Strapi один раз при монтировании компонента
export function useDiscountTiers(): {
  tiers: DiscountTier[];
  isLoading: boolean;
} {
  const [tiers, setTiers] = useState<DiscountTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTiers() {
      try {
        const response = await fetch(`${API_BASE}/discount-tiers?sort=minAmount:asc&pagination[pageSize]=100`);

        if (!response.ok) {
          setTiers([]);
          return;
        }

        const data = await response.json();

        // Strapi возвращает { data: [...] }
        const rawItems: Array<{ id: number; minAmount: number; percent: number }> = data.data ?? [];

        // Берём только валидные тиры
        const mappedTiers: DiscountTier[] = [];

        for (const item of rawItems) {
          if (item.minAmount > 0 && item.percent > 0) {
            mappedTiers.push({
              id: item.id,
              minAmount: item.minAmount,
              percent: item.percent,
            });
          }
        }

        setTiers(mappedTiers);
      } catch {
        // Если запрос упал — работаем без тиров, корзина не ломается
        setTiers([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadTiers();
  }, []);

  return { tiers, isLoading };
}
