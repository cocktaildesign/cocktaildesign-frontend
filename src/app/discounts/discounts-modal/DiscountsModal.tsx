"use client";

import Image from "next/image";
import type { DiscountsBlock } from "../types";
import styles from "./DiscountsModal.module.css";

type DiscountModalProps = {
  title: string;
  blocks: DiscountsBlock[];
};

export default function DiscountModal({ title, blocks }: DiscountModalProps) {
  return (
    <div className={styles.content}>
      <h2 className={styles.title}>{title}</h2>

      {blocks.map((block) => {
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

                {/* figcaption — подпись под картинкой, рендерим только если есть */}

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
                href={block.url}
                className={styles.link}
                target={block.url.startsWith("http") ? "_blank" : undefined}
                rel={block.url.startsWith("http") ? "noopener noreferrer" : undefined}
                <a>{block.title}</a>
                {/* Описание ссылки — если есть */}
                {block.description && <p className={styles.linkDescription}>{block.description}</p>}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
