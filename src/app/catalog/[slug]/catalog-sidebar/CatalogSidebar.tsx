// src/app/catalog/[slug]/catalog-sidebar/CatalogSidebar.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ArrowBackIcon from "@/components/icons/ArrowBackIcon";

import styles from "./CatalogSidebar.module.css";

type CatalogSidebarItem = {
  slug: string;
  name: string;
  productsCount: number;
  children?: CatalogSidebarItem[];
};

type CatalogSidebarProps = {
  items: CatalogSidebarItem[];
  activeSlug: string;
  basePath?: string; // если передан — ссылки строятся как basePath?category=slug
};

function findPathSlugs(items: CatalogSidebarItem[], targetSlug: string): string[] {
  for (const item of items) {
    if (item.slug === targetSlug) {
      return [item.slug];
    }

    if (item.children && item.children.length > 0) {
      const childPath = findPathSlugs(item.children, targetSlug);

      if (childPath.length > 0) {
        return [item.slug, ...childPath];
      }
    }
  }

  return [];
}

export default function CatalogSidebar({ items, activeSlug, basePath }: CatalogSidebarProps) {
  const pathSlugs = useMemo(() => findPathSlugs(items, activeSlug), [items, activeSlug]);
  const [openSlugs, setOpenSlugs] = useState<string[]>(pathSlugs);

  function hasOpen(slug: string): boolean {
    return openSlugs.includes(slug);
  }

  function toggleOpen(slug: string) {
    setOpenSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((currentSlug) => currentSlug !== slug);
      }
      return [...prev, slug];
    });
  }

  function renderItem(item: CatalogSidebarItem, level: number) {
    const isTopLevel = level === 0;
    const isActive = item.slug === activeSlug;
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isOpen = hasChildren ? hasOpen(item.slug) : false;

    // Если передан basePath — ссылка ведёт внутри коллекции с фильтром по категории
    // Если нет — стандартная ссылка в каталог
    const href = basePath ? `${basePath}?category=${item.slug}` : `/catalog/${item.slug}`;

    return (
      <li key={item.slug} className={`${styles.item} ${isTopLevel ? styles.itemTop : styles.itemNested}`}>
        <div className={styles.row}>
          <Link
            href={href}
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

        {hasChildren && isOpen ? (
          <ul className={styles.subList} aria-label={`Подкатегории уровня ${level + 1}: ${item.name}`}>
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
