"use client";

import { useState, useCallback } from "react";
import { Discounts, DiscountsBlock } from "./types";
import styles from "./PromoAccordion.module.css";

interface PromoAccordionProps {
  discount: Discounts;
}

/**
 * Карточка акции в виде аккордеона.
 * Главная акция (id === "2" — скидка 20% на первый заказ) получает особый статус.
 */
export default function PromoAccordion({ discount }: PromoAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const promoCode = findPromoCode(discount.blocks);
  const isFeatured = discount.id === "2";

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const bodyId = `promo-body-${discount.id}`;
  const headerId = `promo-header-${discount.id}`;

  return (
    <div
      className={`${styles.promo} ${isOpen ? styles.promoOpen : ""} ${
        isFeatured ? styles.promoFeatured : ""
      }`}
    >
      <button
        id={headerId}
        className={styles.promoHeader}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={bodyId}
      >
        <div className={styles.promoIcon}>
          <PromoIcon id={discount.id} isFeatured={isFeatured} />
        </div>

        <div className={styles.promoMain}>
          <span className={styles.promoName}>
            {discount.title}
            {isFeatured && (
              <span className={styles.featuredBadge}>Выгодно</span>
            )}
          </span>
          {promoCode && (
            <span className={styles.promoTag}>Промокод: {promoCode}</span>
          )}
        </div>

        <svg
          className={styles.promoArrow}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div id={bodyId} className={styles.promoBody} role="region" aria-labelledby={headerId}>
          <div className={styles.promoContent}>
            <PromoContent blocks={discount.blocks} />
            {promoCode && <CopyButton code={promoCode} />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== Рендер блоков контента ====== */

function PromoContent({ blocks }: { blocks: DiscountsBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading": {
            const Tag = block.level === 2 ? "h2" : "h3";
            return (
              <Tag key={block.id} className={styles.blockHeading}>
                {block.content}
              </Tag>
            );
          }

          case "text":
            return (
              <p key={block.id} className={styles.blockText}>
                {block.content}
              </p>
            );

          case "textSmall":
            return (
              <p key={block.id} className={styles.blockTextSmall}>
                {block.content}
              </p>
            );

          case "image":
            return null;

          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag key={block.id} className={styles.blockList}>
                {block.items.map((item, i) => (
                  <li key={`${block.id}-li-${i}`} className={styles.blockListItem}>
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          }

          case "link":
            return (
              <a
                key={block.id}
                href={block.url}
                className={styles.blockLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.blockLinkTitle}>{block.title}</span>
                {block.description && (
                  <span className={styles.blockLinkDesc}>
                    {block.description}
                  </span>
                )}
              </a>
            );

          default:
            return null;
        }
      })}
    </>
  );
}

/* ====== Кнопка копирования ====== */

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard недоступен — игнорируем */
    }
  }, [code]);

  return (
    <button
      className={`${styles.promoCode} ${
        copied ? styles.promoCodeCopied : ""
      }`}
      onClick={handleCopy}
      aria-label={copied ? "Промокод скопирован" : "Скопировать промокод"}
    >
      {copied ? "Скопировано" : code}
      {!copied && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

/* ====== Иконки ====== */

function PromoIcon({
  id,
  isFeatured,
}: {
  id: string;
  isFeatured?: boolean;
}) {
  // Главная акция — звезда с заливкой
  if (isFeatured || id === "2") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        width="22"
        height="22"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  if (id === "delivery-discount") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="22"
        height="22"
      >
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    );
  }

  // По умолчанию — подарок/праздник (день рождения)
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
    >
      <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
      <path d="M4 8h16v4H4z" />
      <path d="M12 8V4a2 2 0 1 0-4 0v4" />
      <path d="M12 8V4a2 2 0 1 1 4 0v4" />
    </svg>
  );
}

/* ====== Поиск промокода ====== */

function findPromoCode(blocks: DiscountsBlock[]): string | null {
  for (const block of blocks) {
    if (block.type === "text" || block.type === "textSmall") {
      const match = block.content.match(/\b[A-Z0-9]{4,}\b/);
      if (match) return match[0];
    }
  }
  return null;
}