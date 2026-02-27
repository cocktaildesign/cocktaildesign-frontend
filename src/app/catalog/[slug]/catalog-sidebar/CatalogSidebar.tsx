// src/app/catalog/[slug]/catalog-sidebar/CatalogSidebar.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ArrowBackIcon from "@/components/icons/ArrowBackIcon";

import styles from "./CatalogSidebar.module.css";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * CatalogSidebarItem
 *
 * slug — стабильный идентификатор в UI (ключ + часть URL)
 * name — название категории (текст ссылки)
 * productsCount — total товаров в категории (включая всех потомков)
 * children — дочерние категории (может отсутствовать)
 */
type CatalogSidebarItem = {
  slug: string;
  name: string;
  productsCount: number;
  children?: CatalogSidebarItem[];
};

type CatalogSidebarProps = {
  items: CatalogSidebarItem[];
  activeSlug: string;
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * findPathSlugs
 * Ищет путь от корня до targetSlug в дереве categories.
 *
 * Если targetSlug не найден — возвращает [].
 * Как работает (DFS):
 * 1) идём по списку items
 * 2) если текущий item = цель → возвращаем [item.slug]
 * 3) иначе ищем в детях
 * 4) если в детях нашли путь → добавляем текущий slug в начало
 */
function findPathSlugs(items: CatalogSidebarItem[], targetSlug: string): string[] {
  for (const item of items) {
    // База рекурсии: нашли цель
    if (item.slug === targetSlug) {
      return [item.slug];
    }

    // Рекурсивный шаг: ищем в детях
    if (item.children && item.children.length > 0) {
      const childPath = findPathSlugs(item.children, targetSlug);

      // Если childPath не пустой — цель найдена глубже
      if (childPath.length > 0) {
        return [item.slug, ...childPath];
      }
    }
  }

  // Цель не найдена в этом поддереве
  return [];
}

export default function CatalogSidebar({ items, activeSlug }: CatalogSidebarProps) {
  // путь до активной категории (чтобы раскрыть ветку при заходе на страницу)
  // useMemo: пересчитываем только когда меняется items или activeSlug.
  const pathSlugs = useMemo(() => findPathSlugs(items, activeSlug), [items, activeSlug]);

  // openSlugs — список slug категорий, которые сейчас раскрыты в sidebar.
  // Важно: стартуем с pathSlugs, чтобы активная ветка была видна сразу.
  const [openSlugs, setOpenSlugs] = useState<string[]>(pathSlugs);

  // hasOpen - проверка раскрыта ли конкретный slug
  function hasOpen(slug: string): boolean {
    return openSlugs.includes(slug);
  }

  // toggleOpen — открыть/закрыть ветку по клику на стрелку.
  function toggleOpen(slug: string) {
    setOpenSlugs((prev) => {
      // Если slug уже есть в prev — значит ветка раскрыта.
      // Тогда "закрываем" её: возвращаем новый массив БЕЗ этого slug.
      if (prev.includes(slug)) {
        // prev.filter(...) создаёт НОВЫЙ массив
        return prev.filter((currentSlug) => {
          // currentSlug — это один элемент массива prev
          // например:
          // currentSlug = "bar"
          // currentSlug = "shakers"
          // оставляем только те slug, которые НЕ равны slug который мы закрываем
          return currentSlug !== slug;
        });
      }

      // Если slug отсутствует — ветка закрыта.
      // Тогда "открываем": возвращаем новый массив, где добавили slug в конец.
      // [...prev, slug] — это:
      // - копия prev
      // - плюс новый элемент slug
      return [...prev, slug];
    });
  }

  // renderItem — рисует один пункт меню и (если нужно) его детей.
  // Это рекурсия: внутри мы вызываем renderItem для child.
  function renderItem(item: CatalogSidebarItem, level: number) {
    // level === 0 — это верхний уровень (родители меню)
    const isTopLevel = level === 0;

    // Активна ли текущая категория (подсветка ссылки)
    const isActive = item.slug === activeSlug;

    // Есть ли у пункта дети (тогда показываем стрелку и можем раскрывать)
    const hasChildren = Boolean(item.children && item.children.length > 0);

    // Открыта ли ветка (мы храним открытые ветки в openSlugs)
    const isOpen = hasChildren ? hasOpen(item.slug) : false;

    return (
      <li key={item.slug} className={`${styles.item} ${isTopLevel ? styles.itemTop : styles.itemNested}`}>
        {/* ROW — одна строка: слева ссылка, справа count + стрелка */}
        <div className={styles.row}>
          <Link
            href={`/catalog/${item.slug}`}
            scroll={false}
            className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
            aria-current={isActive ? "page" : undefined}>
            {item.name}
          </Link>

          <div className={styles.rightBox}>
            {/* Счётчик показываем только на верхнем уровне */}
            {isTopLevel ? (
              <span className={styles.count} aria-label={`Товаров: ${item.productsCount}`}>
                ({item.productsCount})
              </span>
            ) : null}

            {hasChildren ? (
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => toggleOpen(item.slug)}
                aria-expanded={isOpen}
                aria-label={isOpen ? `Свернуть: ${item.name}` : `Раскрыть: ${item.name}`}>
                <ArrowBackIcon
                  title={undefined}
                  className={`${styles.toggleIcon} ${isOpen ? styles.toggleIconOpen : ""}`}
                />
              </button>
            ) : (
              <span className={styles.togglePlaceholder} aria-hidden="true" />
            )}
          </div>
        </div>
        {/* CHILDREN — если есть дети и ветка открыта, рисуем подсписок */}
        {hasChildren && isOpen ? (
          <ul
            className={styles.subList}
            // level нужен только для aria-label (чтобы понимать на каком уровне мы сейчас)
            aria-label={`Подкатегории уровня ${level + 1}: ${item.name}`}>
            {item.children!.map((child) => renderItem(child, level + 1))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <nav className={styles.sidebar} aria-label="Категории каталога">
      <h2 className={styles.title}>Категории</h2>

      <ul className={styles.list}>{items.map((item) => renderItem(item, 0))}</ul>
    </nav>
  );
}
