// src/app/catalog/product-grid/ProductGrid.tsx
"use client";

import { useEffect, useState } from "react";

import styles from "./ProductGrid.module.css";
import ProductCard from "../product-card/ProductCard";

import { getProductsByCategorySlugFromStrapi } from "@/lib/api/catalog";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";

type ProductGridProps = {
  categorySlug: string;
};

const PAGE_SIZE = 50;

export default function ProductGrid({ categorySlug }: ProductGridProps) {
  // Список товаров, которые мы уже загрузили и показываем на странице.
  const [products, setProducts] = useState<CatalogProductPreview[]>([]);

  // loading — показывает, что запрос "в процессе" (чтобы показать "Загрузка...")
  const [loading, setLoading] = useState(false);

  // error — текст ошибки, если запрос упал
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // cancelled = true означает: компонент уже размонтировался,
    // значит НЕЛЬЗЯ делать setState (React ругнётся).
    let cancelled = false;

    // 1) Объявляем async-функцию, которая будет грузить первую страницу товаров.
    // Важно: useEffect не может быть async напрямую, поэтому делаем вложенную функцию.
    async function loadFirstPage() {
      // 2) Мы запускаем загрузку:
      // - показываем "loading"
      // - чистим прошлую ошибку
      // - очищаем список (чтобы не показывать товары от прошлой категории)
      setLoading(true);
      setError(null);
      setProducts([]);

      // 3) Дальше начинается "опасная" часть — сетевой запрос.
      // try/catch/finally:
      // - try: выполняем запрос
      // - catch: если запрос упал — попадаем сюда
      // - finally: выполнится ВСЕГДА (и при успехе, и при ошибке)
      try {
        // 4) await = "подожди, пока промис завершится".
        // То есть JS НЕ идёт дальше по строкам, пока не получим ответ от API.
        const res = await getProductsByCategorySlugFromStrapi({
          categorySlug, // slug текущей категории из URL
          limit: PAGE_SIZE, // сколько товаров просим за раз
          offset: 0, // первая страница начинается с 0
        });

        // 5) Если за время запроса компонент размонтировался — выходим.
        if (cancelled) return;

        // 6) Запрос успешен → кладём товары в state → React перерендерит grid.
        setProducts(res.items);
      } catch (e) {
        // 7) Если запрос упал (например 500 или сеть) — попадаем сюда.
        if (cancelled) return;

        // Превращаем ошибку в текст для пользователя.
        setError(e instanceof Error ? e.message : "Не удалось загрузить товары");
      } finally {
        // 8) finally срабатывает всегда: и при success, и при error.
        // Мы убираем loading, чтобы скрыть "Загрузка..."
        if (cancelled) return;
        setLoading(false);
      }
    }

    // 9) Запускаем загрузку сразу при:
    // - первом рендере компонента
    // - и при каждом изменении categorySlug
    loadFirstPage();

    // 10) Cleanup: вызовется перед размонтированием компонента
    // или перед следующим эффектом (когда categorySlug поменяется).
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  // UI-состояния: сначала loading, потом error, потом empty, потом grid.

  if (loading) {
    return <p className={styles.state}>Загрузка товаров…</p>;
  }

  if (error) {
    return (
      <p className={styles.state} role="alert">
        {error}
      </p>
    );
  }

  if (products.length === 0) {
    return <p className={styles.state}>В этой категории пока нет товаров.</p>;
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
