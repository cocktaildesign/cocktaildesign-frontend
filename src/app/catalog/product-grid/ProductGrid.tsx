// frontend/src/app/catalog/product-grid/ProductGrid.tsx
"use client";

// ============================================================================
// ProductGrid (Client Component)
// Задача: загрузить 1-ю порцию товаров (limit=50) и отрисовать сетку.
// Пока БЕЗ infinite scroll — только первая загрузка.
// ============================================================================

import { useEffect, useState } from "react";

import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import { getProductsByCategorySlugFromStrapi } from "@/lib/api/catalog/queries";

import ProductCard from "../product-card/ProductCard";
import styles from "./ProductGrid.module.css";

type ProductGridProps = {
  // slug категории из URL /catalog/[slug]
  categorySlug: string;
};

export default function ProductGrid(props: ProductGridProps) {
  const { categorySlug } = props;

  // Товары для отображения
  const [items, setItems] = useState<CatalogProductPreview[]>([]);

  // Состояния загрузки/ошибки
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    // Небольшая защита: если categorySlug пустой — не делаем запрос
    const safeSlug = categorySlug.trim();
    if (!safeSlug) {
      setItems([]);
      setIsLoading(false);
      setErrorText("Пустой slug категории. Проверь URL.");
      return;
    }

    let isCancelled = false;

    async function loadFirstPage() {
      try {
        setIsLoading(true);
        setErrorText(null);

        // Загружаем первую порцию
        const response = await getProductsByCategorySlugFromStrapi({
          categorySlug: safeSlug,
          limit: 50,
          offset: 0,
        });

        // Если компонент уже размонтирован — не трогаем state
        if (isCancelled) return;

        setItems(response.items);
      } catch (err) {
        if (isCancelled) return;

        // Важно: не показываем пользователю "сырой объект ошибки"
        // Делам понятное сообщение
        setErrorText("Не удалось загрузить товары. Проверь API /api/catalog/products и консоль.");
        setItems([]);
      } finally {
        if (isCancelled) return;
        setIsLoading(false);
      }
    }

    loadFirstPage();

    return () => {
      // Нужна защита от setState после unmount (частая проблема в эффектах)
      isCancelled = true;
    };
  }, [categorySlug]);

  // 1) Загрузка
  if (isLoading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-live="polite">
        {/* Пока просто рендерим несколько заглушек карточек */}
        <ProductCard variant="skeleton" />
        <ProductCard variant="skeleton" />
        <ProductCard variant="skeleton" />
        <ProductCard variant="skeleton" />
        <ProductCard variant="skeleton" />
        <ProductCard variant="skeleton" />
        <ProductCard variant="skeleton" />
        <ProductCard variant="skeleton" />
      </div>
    );
  }

  // 2) Ошибка
  if (errorText) {
    return (
      <div role="alert" aria-live="polite">
        {errorText}
      </div>
    );
  }

  // 3) Пустой результат
  if (items.length === 0) {
    return <div aria-live="polite">Товары не найдены.</div>;
  }

  // 4) Обычный рендер
  return (
    <div className={styles.grid}>
      {items.map((product) => (
        <ProductCard key={product.moyskladId || product.id} product={product} />
      ))}
    </div>
  );
}
