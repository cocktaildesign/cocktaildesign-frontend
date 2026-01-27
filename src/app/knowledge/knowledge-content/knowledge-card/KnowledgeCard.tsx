// KnowledgeCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./KnowledgeCard.module.css";
import type { KnowledgeItem, KnowledgeFormat } from "../../types";

type KnowledgeCardProps = {
  // Один материал для отображения в карточке
  item: KnowledgeItem;
};

// Строим URL детальной страницы элемента
function getItemHref(item: KnowledgeItem): string {
  if (item.format === "video") return `/knowledge/videos/${item.slug}`;
  return `/knowledge/articles/${item.slug}`;
}

// Текст бейджа формата материала
function getBadgeLabel(format: KnowledgeFormat): string {
  if (format === "video") return "Видео";
  if (format === "article") return "Статья";
  if (format === "podcast") return "Подкаст";
  if (format === "material") return "Материал";
  return "";
}

export default function KnowledgeCard({ item }: KnowledgeCardProps) {
  const href = getItemHref(item);

  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} href={href}>
        <div className={styles.imageWrapper}>
          <Image src="/test-cover.png" alt="" fill priority className={styles.image} />
        </div>

        <div className={styles.content}>
          {/* Метаданные */}
          <div className={styles.metaRow}>
            <span className={styles.badge}>{getBadgeLabel(item.format)}</span>
            <span className={styles.meta}>{item.duration ?? item.date}</span>
          </div>

          {/* Заголовок */}
          <h3 className={styles.cardTitle}>{item.title}</h3>

          {/* Дата */}
          <time className={styles.date} dateTime="2026-01-10">
            10 января 2026
          </time>
        </div>
      </Link>
    </article>
  );
}
