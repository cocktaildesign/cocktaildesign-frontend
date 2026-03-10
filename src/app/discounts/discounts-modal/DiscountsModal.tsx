"use client";

import Image from "next/image";
import type { DiscountsBlock } from "../types";
import styles from "./DiscountsModal.module.css";

type DiscountModalProps = {
  title: string;
  blocks: DiscountsBlock[];
};

// Рендерит один блок контента (всё кроме первого image)
function renderBlock(block: DiscountsBlock) {
  switch (block.type) {
    case "heading":
      if (block.level === 2) {
        return (
          <h3 key={block.id} className={styles.heading2}>
            {block.content}
          </h3>
        );
      }
      return (
        <h4 key={block.id} className={styles.heading3}>
          {block.content}
        </h4>
      );

    case "text":
      return (
        <p key={block.id} className={styles.text}>
          {block.content}
        </p>
      );

    case "textSmall":
      return (
        <p key={block.id} className={styles.textSmall}>
          {block.content}
        </p>
      );

    case "image":
      return (
        <figure key={block.id} className={styles.figure}>
          <Image className={styles.image} src={block.src} alt={block.alt || ""} width={660} height={300} />
          {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
        </figure>
      );

    case "list":
      if (block.ordered) {
        return (
          <ol key={block.id} className={styles.list}>
            {block.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={block.id} className={styles.list}>
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

    case "link":
      return (
        <div key={block.id} className={styles.linkBlock}>
          <a
            href={block.url}
            className={styles.link}
            target={block.url.startsWith("http") ? "_blank" : undefined}
            rel={block.url.startsWith("http") ? "noopener noreferrer" : undefined}>
            {block.title}
          </a>
          {block.description && <p className={styles.linkDescription}>{block.description}</p>}
        </div>
      );

    default:
      return null;
  }
}

export default function DiscountModal({ title, blocks }: DiscountModalProps) {
  // Ищем первый image-блок — он пойдёт в левую колонку
  const firstImageBlock = blocks.find((b) => b.type === "image");

  // Все остальные блоки — в правую колонку
  // Если image-блок есть, исключаем его из правой части
  const contentBlocks = firstImageBlock ? blocks.filter((b) => b !== firstImageBlock) : blocks;

  return (
    <div className={styles.layout}>
      {/* Левая колонка — только если есть картинка */}
      {firstImageBlock && firstImageBlock.type === "image" && (
        <div className={styles.imageSide}>
          <Image
            className={styles.sideImage}
            src={firstImageBlock.src}
            alt={firstImageBlock.alt || ""}
            width={400}
            height={500}
          />
        </div>
      )}

      {/* Правая колонка — заголовок + все текстовые блоки */}
      <div className={styles.contentSide}>
        <h2 className={styles.title}>{title}</h2>
        {contentBlocks.map((block) => renderBlock(block))}
      </div>
    </div>
  );
}
