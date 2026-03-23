"use client";

import Link from "next/link";
import { useId, useState, type FocusEvent } from "react";
import { useRouter } from "next/navigation";

import CatalogIcon from "@/components/icons/CatalogIcon";

import type { CatalogCategoryPreview, CatalogCollection } from "@/lib/api/catalog/types";

import styles from "./CatalogMenu.module.css";

type CatalogMenuProps = {
  categories: CatalogCategoryPreview[];
  collections: CatalogCollection[];
};

function itemHasChildren(item: CatalogCategoryPreview) {
  return (item.children?.length ?? 0) > 0;
}

export default function CatalogMenu({ categories, collections }: CatalogMenuProps) {
  // Состояние открытия меню
  const [isOpen, setIsOpen] = useState(false);

  // Активная категория в левой колонке
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");

  const menuId = useId();
  const router = useRouter();

  // Если текущий activeId больше не существует,
  // используем первую категорию как безопасный запасной вариант
  const resolvedActiveId = categories.some((item) => item.id === activeId) ? activeId : (categories[0]?.id ?? "");

  const activeCategory = categories.find((item) => item.id === resolvedActiveId);
  const level2Items = activeCategory?.children ?? [];

  function openMenu() {
    setIsOpen(true);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextFocused = event.relatedTarget;

    if (nextFocused instanceof Node && event.currentTarget.contains(nextFocused)) {
      return;
    }

    closeMenu();
  }

  function handleCategoryEnter(categoryId: string) {
    setActiveId(categoryId);
  }

  function handleCollectionEnter() {
    setActiveId("");
  }

  function handleSectionClick(sectionSlug: string) {
    router.push(`/catalog/${sectionSlug}`);
    closeMenu();
  }

  return (
    <div className={styles.catalogMenu} onMouseLeave={closeMenu} onFocus={openMenu} onBlur={handleBlur}>
      {/* Кнопка открытия каталога */}
      <button
        type="button"
        className={styles.buttonCta}
        onMouseEnter={openMenu}
        aria-expanded={isOpen}
        aria-controls={menuId}>
        <CatalogIcon className={styles.catalogIcon} />
        <span className={styles.buttonCtaText}>Каталог</span>
      </button>

      {/* Выпадающая панель */}
      {isOpen && (
        <div id={menuId} className={styles.panel}>
          <div className={styles.columns}>
            {/* Левая колонка: категории и коллекции */}
            <ul className={styles.topList}>
              {categories.map((item) => {
                const isActive = item.id === resolvedActiveId;

                return (
                  <li key={item.id} className={styles.topListItem}>
                    <Link
                      href={`/catalog/${item.slug}`}
                      className={`${styles.topItemButton} ${isActive ? styles.topItemButtonActive : ""}`}
                      onMouseEnter={() => handleCategoryEnter(item.id)}
                      onFocus={() => handleCategoryEnter(item.id)}
                      onClick={closeMenu}>
                      <span className={styles.topItemTitle}>{item.name}</span>

                      {itemHasChildren(item) ? (
                        <span className={styles.chevron} aria-hidden="true">
                          ›
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}

              {collections.length > 0 && <li className={styles.divider} aria-hidden="true" />}

              {collections.map((collection) => (
                <li key={collection.id} className={styles.topListItem}>
                  <Link
                    href={`/catalog/collection/${collection.slug}`}
                    className={styles.topItemButton}
                    onMouseEnter={handleCollectionEnter}
                    onFocus={handleCollectionEnter}
                    onClick={closeMenu}>
                    <span className={styles.topItemTitle}>{collection.title}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Правая зона: подкатегории */}
            <div className={styles.subPanel}>
              {level2Items.length > 0 ? (
                <div className={styles.subGrid}>
                  {level2Items.map((section) => {
                    const level3Items = section.children ?? [];

                    return (
                      <div
                        key={section.id}
                        className={styles.subSection}
                        onClick={() => handleSectionClick(section.slug)}>
                        <span className={styles.subSectionTitle}>{section.name}</span>

                        {level3Items.length > 0 ? (
                          <ul className={styles.thirdList}>
                            {level3Items.map((leaf) => (
                              <li key={leaf.id} className={styles.thirdListItem}>
                                <Link
                                  href={`/catalog/${leaf.slug}`}
                                  className={styles.thirdListLink}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    closeMenu();
                                  }}>
                                  {leaf.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
