"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import styles from "./KnowledgeFilters.module.css";
import type { KnowledgeTab, KnowledgeFormat } from "../types";

// Один пункт списка "Разделы"
type CategoryItem = {
  label: string; // текст для пользователя
  href: string; // ссылка, которая меняет URL
  matchTab: KnowledgeTab | null; // null = "Все материалы"
};

// Меню (разделы)
const CATEGORY_ITEMS: CategoryItem[] = [
  { label: "Все материалы", href: "/knowledge", matchTab: null },
  { label: "Техники и фишки", href: "/knowledge?tab=techniques", matchTab: "techniques" },
  { label: "Обучение", href: "/knowledge?tab=education", matchTab: "education" },
  { label: "Подкасты и интервью", href: "/knowledge?tab=podcasts", matchTab: "podcasts" },
  { label: "Индустрия и культура", href: "/knowledge?tab=industry", matchTab: "industry" },
  { label: "Материалы и ресурсы", href: "/knowledge?tab=resources", matchTab: "resources" },
];

// Один пункт списка "Форматы"
type FormatItem = {
  label: string;
  value: KnowledgeFormat;
};

// Меню (форматы)
const FORMAT_ITEMS: FormatItem[] = [
  { label: "Видео", value: "video" },
  { label: "Статья", value: "article" },
  { label: "Подкаст", value: "podcast" },
  { label: "Материал", value: "material" },
];

export default function KnowledgeFilters() {
  // Query-параметры читаем на клиенте (это UI-сайдбар).
  const searchParams = useSearchParams();

  // Активные фильтры из URL:
  // /knowledge -> tab=null, format=null
  // /knowledge?tab=podcasts -> tab="podcasts"
  // /knowledge?tab=education&format=video -> оба выбраны
  const activeTab = searchParams.get("tab"); // string | null
  const activeFormat = searchParams.get("format"); // string | null

  // Сбросить раздел: переходим на "Все материалы", но сохраняем выбранный формат.
  let resetCategoryHref = CATEGORY_ITEMS.find((item) => item.matchTab === null)?.href ?? "/knowledge";
  if (activeFormat) {
    resetCategoryHref = `${resetCategoryHref}?format=${activeFormat}`;
  }

  // Сбросить формат: убираем format, но сохраняем выбранный tab.
  const resetFormatHref = activeTab ? `/knowledge?tab=${activeTab}` : "/knowledge";

  return (
    <aside className={styles.container}>
      {/* ===== Разделы ===== */}
      <div className={styles.categoryCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>Раздел</h3>

          <Link scroll={false} href={resetCategoryHref} className={styles.resetLink}>
            Сбросить
          </Link>
        </div>

        <hr className={styles.divider} />
        <span className={styles.sectionLabel}>По теме</span>

        <nav aria-label="Разделы знаний">
          <ul className={styles.categoryList}>
            {CATEGORY_ITEMS.map((item) => {
              // Пункт активен, если совпадает tab из URL (включая null для "Все материалы").
              const isActive = item.matchTab === activeTab;

              // Базовая ссылка категории
              let href = item.href;

              // Если выбран формат — сохраняем его при переключении раздела.
              if (activeFormat) {
                href = `${href}${href.includes("?") ? "&" : "?"}format=${activeFormat}`;
              }

              return (
                <li key={item.href} className={styles.categoryItem}>
                  <Link
                    href={href}
                    scroll={false} // при переключении фильтров не прыгаем наверх
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

      {/* ===== Фильтры (форматы) ===== */}
      <div className={styles.filtersCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>Форматы</h3>

          <Link scroll={false} href={resetFormatHref} className={styles.resetLink}>
            Сбросить
          </Link>
        </div>

        <hr className={styles.divider} />
        <span className={styles.sectionLabel}>Фильтры</span>

        <nav className={styles.formatNav} aria-label="Форматы материалов">
          <ul className={styles.formatList}>
            {FORMAT_ITEMS.map((format) => {
              // Активный формат — тот, что в URL.
              const isActive = activeFormat === format.value;

              // Базовый URL
              let href = "/knowledge";

              // Если выбрана категория — сохраняем её
              if (activeTab) {
                href = `${href}?tab=${activeTab}`;
              }

              // Повторный клик по активному формату снимает format (оставляем только tab).
              if (!isActive) {
                href = `${href}${activeTab ? "&" : "?"}format=${format.value}`;
              }

              return (
                <li key={format.value} className={`${styles.formatItem} ${isActive ? styles.formatItemActive : ""}`}>
                  <Link
                    href={href}
                    scroll={false}
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
    </aside>
  );
}
