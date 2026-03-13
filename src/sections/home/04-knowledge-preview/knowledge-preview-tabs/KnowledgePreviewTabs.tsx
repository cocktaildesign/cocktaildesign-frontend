// src/sections/home/knowledge-preview/knowledge-preview-tabs/KnowledgePreviewTabs.tsx
// Client Component — нужен useState для переключения табов.
// Данные приходят с сервера через props, фильтруем на клиенте.
"use client";

import { useState } from "react";
import Link from "next/link";
import KnowledgeCard from "@/app/knowledge/knowledge-content/knowledge-card/KnowledgeCard";
import type { KnowledgeItemPreview, KnowledgeFormat } from "@/app/knowledge/types";
import styles from "./KnowledgePreviewTabs.module.css";

// Тип одного таба
type Tab = {
  id: KnowledgeFormat | "all"; // "all" | "video" | "article" | "material"
  label: string;
};

// Список табов — константа вне компонента, не пересоздаётся при ререндере
const TABS: Tab[] = [
  { id: "all", label: "Все" },
  { id: "video", label: "Видео" },
  { id: "article", label: "Статьи" },
  { id: "material", label: "Материалы" },
];

type KnowledgePreviewTabsProps = {
  // Все материалы приходят с сервера — фильтруем здесь на клиенте
  items: KnowledgeItemPreview[];
};

export default function KnowledgePreviewTabs({ items }: KnowledgePreviewTabsProps) {
  // Активный таб — по умолчанию "все"
  const [activeTab, setActiveTab] = useState<KnowledgeFormat | "all">("all");

  // Фильтрация: если "all" — показываем всё, иначе только нужный формат
  const filteredItems = activeTab === "all" ? items : items.filter((item) => item.format === activeTab);

  // Показываем только первые 4 карточки
  const visibleItems = filteredItems.slice(0, 4);

  return (
    <div>
      {/* Шапка: табы слева, ссылка справа — одна строка */}
      <div className={styles.header}>
        {/* Группа табов в одном контейнере-капсуле */}
        <div className={styles.tabs} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              // aria-selected сообщает скринридеру какой таб активен
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ссылка на полный раздел — справа от табов */}
        <Link href="/knowledge" className={styles.viewAll}>
          Смотреть все →
        </Link>
      </div>

      {/* Грид карточек — отдельно под шапкой */}
      <div className={styles.grid}>
        {visibleItems.map((item) => (
          <KnowledgeCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
