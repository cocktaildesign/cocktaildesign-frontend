// KnowledgeCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./KnowledgeCard.module.css";

import type { KnowledgeItemPreview, KnowledgeFormat } from "../../types";

type KnowledgeCardProps = {
  // Один материал для отображения в карточке
  item: KnowledgeItemPreview;
};

// Единая точка правды: какой URL-сегмент соответствует формату.
const formatToSegment: Record<KnowledgeFormat, "videos" | "articles"> = {
  video: "videos",
  article: "articles",
  material: "articles",
};

// Строим URL детальной страницы элемента
function getItemHref(item: KnowledgeItemPreview): string {
  const segment = formatToSegment[item.format];
  return `/knowledge/${segment}/${item.slug}`;
}

// Текст бейджа формата материала
function getBadgeLabel(format: KnowledgeFormat): string {
  if (format === "video") return "Видео";
  if (format === "article") return "Статья";
  return "Материал";
}

function getMetaText(item: KnowledgeItemPreview): string {
  if (item.format === "video") {
    return item.duration;
  }

  if (item.format === "article") {
    return item.readTime;
  }

  return "Подборка";
}

export default function KnowledgeCard({ item }: KnowledgeCardProps) {
  const href = getItemHref(item);
  const metaText = getMetaText(item);

  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} href={href}>
        <div className={styles.imageWrapper}>
          {/* Обложка из данных*/}
          <Image src={item.coverSrc} alt={item.title} fill className={styles.image} />
          <span className={styles.badge}>{getBadgeLabel(item.format)}</span>
        </div>

        <div className={styles.content}>
          {/* Метаданные */}
          <div className={styles.metaRow}>
            {/* время просмотра или время прочтения */}
            <span className={styles.meta}>{metaText}</span>

            {/* Дата */}
            <time className={styles.date} dateTime={item.date}>
              {item.date}
            </time>
          </div>

          {/* Заголовок */}
          <h3 className={styles.cardTitle}>{item.title}</h3>
        </div>
      </Link>
    </article>
  );
}
