import { Fragment, type ReactNode } from "react";
import type { KnowledgeContentBlock } from "@/app/knowledge/types";
import { plainHeading, readingBlocks, readingContents, safeReadingHref } from "@/lib/knowledge/reading";
import ContentImage from "./ContentImage";
import styles from "./Reading.module.css";

// Small, deliberately limited inline grammar; React escapes all source text.
function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const tokens = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|\[([^\]]+)\]\(([^\s)]+)\)/g;
  let start = 0;
  for (const match of text.matchAll(tokens)) {
    parts.push(text.slice(start, match.index));
    const href = match[4] && safeReadingHref(match[4]);
    parts.push(match[1] ? <strong key={match.index}>{match[1]}</strong> : match[2] ? <em key={match.index}>{match[2]}</em> : href ? <a key={match.index} href={href}>{match[3]}</a> : match[0]);
    start = match.index + match[0].length;
  }
  parts.push(text.slice(start));
  return <>{parts}</>;
}

export default function ReadingBody({ blocks, slug }: { blocks: KnowledgeContentBlock[]; slug: string }) {
  const content = readingBlocks(blocks, slug);
  const contents = readingContents(content);
  return (
    <div className={styles.reading} data-knowledge-reading>
      {contents.length > 0 && <details className={styles.contents}>
        <summary>В этом материале <span>Разделов: {contents.length}</span></summary>
        <nav aria-label="Содержание материала"><ul>{contents.map(entry => <li key={entry.id}><a href={`#${entry.id}`}>{plainHeading(entry.content)}</a></li>)}</ul></nav>
      </details>}
      {content.map((block, index) => {
        const key = `block-${index}`;
        switch (block.type) {
          case "heading": { const Tag = block.level === 2 ? "h2" : "h3"; return <Tag id={block.id} key={key}><Inline text={block.content} /></Tag>; }
          case "text": return <p key={key}><Inline text={block.content} /></p>;
          case "label": return <p className={styles.label} key={key}><strong>{block.content}</strong></p>;
          case "quote": return <blockquote key={key}><Inline text={block.content} /></blockquote>;
          case "rule": return <hr key={key} />;
          case "list": { const Tag = block.ordered ? "ol" : "ul"; return <Tag key={key} start={block.ordered ? block.start : undefined}>{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</Tag>; }
          case "gallery": return <div key={key} className={block.images.length > 1 ? styles.gallery : styles.singleImage}>
            {block.images.map((image, i) => <figure key={`${image.id}-${i}`}>
              <a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Открыть изображение: ${image.alt || `иллюстрация ${i + 1}`}`}>
                <ContentImage block={image} className={styles.image} priority={index === 0} sizes={block.images.length > 1 ? "(max-width: 600px) calc((100vw - 52px) / 2), 356px" : "(max-width: 800px) calc(100vw - 40px), 740px"} />
              </a>
              {image.caption && <figcaption><Inline text={image.caption} /></figcaption>}
            </figure>)}
          </div>;
          case "link": { const href = safeReadingHref(block.url); return <div key={key} className={styles.resource}>
            {href ? <a href={href} target={href.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer"><Inline text={block.title} /> ↗</a> : <Fragment>{block.title}</Fragment>}
            {block.description && <p><Inline text={block.description} /></p>}
          </div>; }
        }
      })}
    </div>
  );
}
