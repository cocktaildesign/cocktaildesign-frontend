// frontend/src/app/knowledge/knowledge-filters/KnowledgeFilters.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import styles from "./KnowledgeFilters.module.css";
import type { KnowledgeTab, KnowledgeFormat } from "../types";

type CategoryItem = {
  label: string;
  href: string;
  matchTab: KnowledgeTab | null;
};

const CATEGORY_ITEMS: CategoryItem[] = [
  { label: "Все материалы", href: "/knowledge", matchTab: null },
  { label: "Техники и фишки", href: "/knowledge?tab=techniques", matchTab: "techniques" },
  { label: "Обучение", href: "/knowledge?tab=education", matchTab: "education" },
  { label: "Подкасты и интервью", href: "/knowledge?tab=podcasts", matchTab: "podcasts" },
  { label: "Индустрия и культура", href: "/knowledge?tab=industry", matchTab: "industry" },
  { label: "Материалы и ресурсы", href: "/knowledge?tab=resources", matchTab: "resources" },
];

type FormatItem = {
  label: string;
  value: KnowledgeFormat;
};

const FORMAT_ITEMS: FormatItem[] = [
  { label: "Видео", value: "video" },
  { label: "Статья", value: "article" },
  { label: "Материал", value: "material" },
];

export default function KnowledgeFilters() {
  const searchParams = useSearchParams();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeTab = searchParams.get("tab");
  const activeFormat = searchParams.get("format");

  let resetCategoryHref = CATEGORY_ITEMS.find((item) => item.matchTab === null)?.href ?? "/knowledge";
  if (activeFormat) {
    resetCategoryHref = `${resetCategoryHref}?format=${activeFormat}`;
  }

  const resetFormatHref = activeTab ? `/knowledge?tab=${activeTab}` : "/knowledge";
  const resetAllHref = "/knowledge";

  const hasActiveFilters = Boolean(activeTab || activeFormat);

  useEffect(() => {
    if (!isMobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  function closeMobileSheet() {
    setIsMobileOpen(false);
  }

  function renderCategoryCard(onNavigate?: () => void) {
    return (
      <div className={styles.categoryCard}>
        {/* Заголовок секции */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>Раздел</h3>

          <Link scroll={false} href={resetCategoryHref} className={styles.resetLink} onClick={onNavigate}>
            Сбросить
          </Link>
        </div>

        <hr className={styles.divider} />
        <span className={styles.sectionLabel}>Тематика материалов</span>

        {/* Список разделов */}
        <nav aria-label="Разделы знаний">
          <ul className={styles.categoryList}>
            {CATEGORY_ITEMS.map((item) => {
              const isActive = item.matchTab === activeTab;

              let href = item.href;
              if (activeFormat) {
                href = `${href}${href.includes("?") ? "&" : "?"}format=${activeFormat}`;
              }

              return (
                <li key={item.href} className={styles.categoryItem}>
                  <Link
                    href={href}
                    scroll={false}
                    onClick={onNavigate}
                    className={`${styles.categoryLink} ${isActive ? styles.categoryLinkActive : ""}`}
                    aria-current={isActive ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    );
  }

  function renderFormatCard(onNavigate?: () => void) {
    return (
      <div className={styles.filtersCard}>
        {/* Заголовок секции */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>Форматы</h3>

          <Link scroll={false} href={resetFormatHref} className={styles.resetLink} onClick={onNavigate}>
            Сбросить
          </Link>
        </div>

        <hr className={styles.divider} />
        <span className={styles.sectionLabel}>Тип контента</span>

        {/* Список форматов */}
        <nav className={styles.formatNav} aria-label="Форматы материалов">
          <ul className={styles.formatList}>
            {FORMAT_ITEMS.map((format) => {
              const isActive = activeFormat === format.value;

              let href = "/knowledge";
              if (activeTab) {
                href = `${href}?tab=${activeTab}`;
              }

              if (!isActive) {
                href = `${href}${activeTab ? "&" : "?"}format=${format.value}`;
              }

              return (
                <li key={format.value} className={`${styles.formatItem} ${isActive ? styles.formatItemActive : ""}`}>
                  <Link
                    href={href}
                    scroll={false}
                    onClick={onNavigate}
                    className={`${styles.formatLink} ${isActive ? styles.formatLinkActive : ""}`}
                    aria-current={isActive ? "page" : undefined}>
                    {format.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <>
      <aside className={styles.containerR} aria-label="Фильтры базы знаний">
        {/* Desktop / tablet */}
        <div className={styles.desktopFilters}>
          {renderCategoryCard()}
          {renderFormatCard()}
        </div>
      </aside>

      {/* Mobile fixed button */}
      <button
        type="button"
        className={styles.mobileOpenButton}
        onClick={() => setIsMobileOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isMobileOpen}>
        <span className={styles.mobileOpenButtonText}>Фильтры</span>

        {hasActiveFilters && <span className={styles.mobileOpenButtonBadge}>есть</span>}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className={styles.mobileSheetRoot} role="dialog" aria-modal="true" aria-label="Фильтры базы знаний">
          <button type="button" className={styles.mobileBackdrop} onClick={closeMobileSheet} aria-label="Закрыть" />

          <div className={styles.mobileSheet}>
            {/* Верхняя часть sheet */}
            <div className={styles.mobileSheetHeader}>
              <h2 className={styles.mobileSheetTitle}>Фильтры</h2>

              <button type="button" className={styles.mobileCloseButton} onClick={closeMobileSheet}>
                Закрыть
              </button>
            </div>

            {/* Контент sheet */}
            <div className={styles.mobileSheetContent}>
              {renderCategoryCard(closeMobileSheet)}
              {renderFormatCard(closeMobileSheet)}
            </div>

            {/* Действия sheet */}
            <div className={styles.mobileSheetFooter}>
              <Link
                href={resetAllHref}
                scroll={false}
                className={styles.mobileResetAllButton}
                onClick={closeMobileSheet}>
                Сбросить всё
              </Link>

              <button type="button" className={styles.mobileApplyButton} onClick={closeMobileSheet}>
                Показать материалы
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
