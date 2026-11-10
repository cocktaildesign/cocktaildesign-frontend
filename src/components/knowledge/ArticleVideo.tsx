import ContentImage from "./ContentImage";
import type { KnowledgeContentBlock } from "@/app/knowledge/types";
import type { ArticleVideoSource } from "@/lib/knowledge/article-video";
import styles from "./ArticleVideo.module.css";

type Props = ArticleVideoSource & {
  title: string;
  coverSrc: string;
  poster?: Extract<KnowledgeContentBlock, { type: "image" }>;
};

export default function ArticleVideo({ title, coverSrc, poster, externalUrl, embedUrl }: Props) {
  return <section className={styles.section} aria-label={`Видеорецепт: ${title}`} data-article-video>
    {embedUrl ? <div className={styles.player}>
      <iframe src={embedUrl} title={`Видеорецепт: ${title}`} className={styles.iframe}
        allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin" />
    </div> : <a className={styles.posterLink} href={externalUrl} target="_blank" rel="noopener noreferrer"
      aria-label={`Смотреть видеорецепт «${title}» в VK — откроется новая вкладка`}>
      <ContentImage block={poster ?? { id: "video-poster", type: "image", src: coverSrc, alt: "" }}
        className={styles.poster} priority sizes="(max-width: 790px) calc(100vw - 40px), 740px" />
      <span className={styles.shade} aria-hidden="true" />
      <span className={styles.badge}>Видеорецепт</span>
      <span className={styles.play} aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5.5v13L19 12Z" fill="currentColor" /></svg></span>
      <span className={styles.watch}>Смотреть в VK <span aria-hidden="true">↗</span></span>
    </a>}
    <div className={styles.below}>
      {embedUrl ? <a href={externalUrl} target="_blank" rel="noopener noreferrer">Открыть в VK ↗</a>
        : <span>{poster?.caption || "Видео откроется во ВКонтакте"}</span>}
      <a className={styles.recipeLink} href="#recipe-content">Читать рецепт <span aria-hidden="true">↓</span></a>
    </div>
  </section>;
}
