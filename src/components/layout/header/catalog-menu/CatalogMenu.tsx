// src/components/layout/header/catalog-menu/CatalogMenu.tsx
import CatalogIcon from "@/components/icons/CatalogIcon";
import styles from "./CatalogMenu.module.css";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";
import Link from "next/link";

type CatalogMenuProps = {
  categories: CatalogCategoryPreview[];
};

function itemHasChildren(item: CatalogCategoryPreview) {
  return (item.children?.length ?? 0) > 0;
}

export default function CatalogMenu({ categories }: CatalogMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const menuId = useId();
  const router = useRouter();

  const activeCategory = categories.find((item) => item.id === activeId);
  const level2Items = activeCategory?.children ?? [];

  function openMenu() {
    setIsOpen(true);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    const nextFocused = e.relatedTarget;
    if (nextFocused instanceof Node && e.currentTarget.contains(nextFocused)) {
      return;
    }
    closeMenu();
  }

  return (
    <div className={styles.catalogMenu} onFocus={openMenu} onBlur={handleBlur}>
      <button
        type="button"
        className={styles.buttonCta}
        onMouseEnter={openMenu}
        aria-expanded={isOpen}
        aria-controls={menuId}>
        <CatalogIcon className={styles.catalogIcon} />
        Каталог
      </button>

      {isOpen && (
        <div id={menuId} className={styles.panel} onMouseLeave={closeMenu}>
          <div className={styles.columns}>
            {/* ЛЕВАЯ КОЛОНКА */}
            <ul className={styles.topList}>
              {categories.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <li key={item.id} className={styles.topListItem}>
                    <Link
                      href={`/catalog/${item.slug}`}
                      className={styles.topItemButton}
                      onMouseEnter={() => {
                        // всегда обновляем activeId — даже если нет детей
                        // тогда правая колонка корректно очищается
                        setActiveId(item.id);
                      }}
                      onFocus={() => {
                        setActiveId(item.id);
                      }}
                      aria-current={isActive ? "true" : undefined}
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
            </ul>

            {/* ПРАВАЯ ЗОНА — рендерится только если у активной категории есть дети */}
            {level2Items.length > 0 ? (
              <div className={styles.subPanel}>
                <div className={styles.subGrid}>
                  {level2Items.map((section) => {
                    const level3Items = section.children ?? [];
                    return (
                      <div
                        key={section.id}
                        className={styles.subSection}
                        onClick={() => {
                          router.push(`/catalog/${section.slug}`);
                          closeMenu();
                        }}>
                        <span className={styles.subSectionTitle}>{section.name}</span>

                        {level3Items.length > 0 ? (
                          <ul className={styles.thirdList}>
                            {level3Items.map((leaf) => (
                              <li key={leaf.id} className={styles.thirdListItem}>
                                <Link
                                  href={`/catalog/${leaf.slug}`}
                                  className={styles.thirdListLink}
                                  onClick={(e) => {
                                    e.stopPropagation();
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
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
