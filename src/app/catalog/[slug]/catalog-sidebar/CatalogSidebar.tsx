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

  return (
    <nav className={styles.sidebar} aria-label="Категории каталога">
      <h2 className={styles.title}>Категории</h2>

      <ul className={styles.list}>
        {items.map((item) => {
          // isActive — является ли эта категория текущей (из URL).
          const isActive = item.slug === activeSlug;

          // hasChildren — есть ли у категории дети.
          // Мы показываем стрелку только если дети реально существуют.
          const hasChildren = Boolean(item.children && item.children.length > 0);

          // isOpen — раскрыта ли ветка (только если hasChildren=true).
          // Если детей нет — ветка "не раскрываемая", считаем isOpen=false.
          const isOpen = hasChildren ? hasOpen(item.slug) : false;

          return (
            <li key={item.slug} className={styles.item}>
              <div className={styles.row}>
                <Link
                  href={`/catalog/${item.slug}`}
                  scroll={false}
                  className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}>
                  {item.name}
                </Link>

                <div className={styles.rightBox}>
                  <span className={styles.count} aria-label={`Товаров: ${item.productsCount}`}>
                    ({item.productsCount})
                  </span>

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
              <span className={styles.line} aria-hidden="true" />

              {hasChildren && isOpen ? (
                <ul className={styles.subList} aria-label={`Подкатегории: ${item.name}`}>
                  {item.children!.map((child) => {
                    // childActive — подсветка, если активная категория = этот ребёнок
                    const childActive = child.slug === activeSlug;

                    return (
                      <li key={child.slug} className={styles.subItem}>
                        <Link
                          href={`/catalog/${child.slug}`}
                          scroll={false}
                          className={`${styles.subLink} ${childActive ? styles.linkActive : ""}`}
                          aria-current={childActive ? "page" : undefined}>
                          {child.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
