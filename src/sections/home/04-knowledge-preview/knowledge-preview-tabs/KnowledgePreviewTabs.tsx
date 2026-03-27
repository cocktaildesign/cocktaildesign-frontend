// src/sections/home/knowledge-preview/knowledge-preview-tabs/KnowledgePreviewTabs.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

import KnowledgeCard from "@/app/knowledge/knowledge-content/knowledge-card/KnowledgeCard";
import type { KnowledgeItemPreview, KnowledgeFormat } from "@/app/knowledge/types";

import styles from "./KnowledgePreviewTabs.module.css";

type Tab = {
  id: KnowledgeFormat | "all";
  label: string;
};

const TABS: Tab[] = [
  { id: "all", label: "Все" },
  { id: "video", label: "Видео" },
  { id: "article", label: "Статьи" },
  { id: "material", label: "Материалы" },
];

type KnowledgePreviewTabsProps = {
  items: KnowledgeItemPreview[];
};

// Ссылка и текст кнопки зависят от активного таба
function getViewAllConfig(activeTab: KnowledgeFormat | "all") {
  if (activeTab === "video") {
    return {
      href: "/knowledge?format=video",
      label: "Все видео",
    };
  }

  if (activeTab === "article") {
    return {
      href: "/knowledge?format=article",
      label: "Все статьи",
    };
  }

  if (activeTab === "material") {
    return {
      href: "/knowledge?format=material",
      label: "Все материалы",
    };
  }

  return {
    href: "/knowledge",
    label: "Смотреть все",
  };
}

export default function KnowledgePreviewTabs({ items }: KnowledgePreviewTabsProps) {
  // Активный таб
  const [activeTab, setActiveTab] = useState<KnowledgeFormat | "all">("all");

  // Фильтруем материалы по активному табу
  const filteredItems = activeTab === "all" ? items : items.filter((item) => item.format === activeTab);

  // Показываем только первые 4 карточки
  const visibleItems = filteredItems.slice(0, 4);

  const viewAll = getViewAllConfig(activeTab);

  return (
    <div className={styles.section}>
      {/* Верхняя часть блока */}
      <div className={styles.header}>
        {/* Табы */}
        <div className={styles.tabs} role="tablist" aria-label="Формат материалов">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Ссылка на полный раздел — desktop/tablet */}
        <Link href={viewAll.href} className={styles.viewAll}>
          {viewAll.label} →
        </Link>
      </div>

      {/* Карточки материалов */}
      <div className={styles.grid}>
        {visibleItems.map((item) => (
          <div key={item.id} className={styles.cardItem}>
            <KnowledgeCard item={item} />
          </div>
        ))}
      </div>

      {/* Кнопка снизу — mobile */}
      <div className={styles.footer}>
        <Link href={viewAll.href} className={styles.viewAllMobile}>
          {viewAll.label}
        </Link>
      </div>
    </div>
  );
}
