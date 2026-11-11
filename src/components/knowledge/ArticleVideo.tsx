"use client";

import { useEffect, useRef, useState } from "react";
import ContentImage from "./ContentImage";
import type { KnowledgeContentBlock } from "@/app/knowledge/types";
import type { ArticleVideoSource } from "@/lib/knowledge/article-video";
import styles from "./ArticleVideo.module.css";

type Props = ArticleVideoSource & {
  title: string;
  coverSrc: string;
  poster?: Extract<KnowledgeContentBlock, { type: "image" }>;
};

export default function ArticleVideo({ title, coverSrc, poster, externalUrl, embedUrl, local }: Props) {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const player = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!started) return;
    player.current?.focus();
    void player.current?.play().catch(() => { /* Native controls allow another tap if playback is blocked. */ });
  }, [started]);

  return <section className={`${styles.section}${local ? ` ${styles.localSection}` : ""}`} aria-label={`Видеорецепт: ${title}`} data-article-video>
    {local ? <div className={styles.localFrame}>
      {started ? <video ref={player} key={local.src} src={local.src} poster={local.poster} controls playsInline preload="none"
        tabIndex={0} aria-label={`Видеорецепт: ${title}`} onError={() => setFailed(true)} />
        : <button type="button" className={styles.localPoster} onClick={() => setStarted(true)} aria-label={`Смотреть видеорецепт: ${title}`}>
          <ContentImage block={{ id: "local-video-poster", type: "image", src: local.poster, alt: "", width: 540, height: 960 }}
            className={styles.localPosterImage} priority sizes="340px" />
          <span className={styles.shade} aria-hidden="true" />
          <span className={styles.badge}>Видеорецепт · {local.durationLabel}</span>
          <span className={styles.play} aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5.5v13L19 12Z" fill="currentColor" /></svg></span>
          <span className={styles.watch}>Смотреть рецепт</span>
        </button>}
    </div> : embedUrl ? <div className={styles.player}>
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
    {failed && <p className={styles.failure} role="status">Не удалось загрузить видео. Можно посмотреть его в VK по ссылке ниже.</p>}
    <div className={styles.below}>
      {local || embedUrl ? <a href={externalUrl} target="_blank" rel="noopener noreferrer" aria-label="Открыть видео в VK в новой вкладке">Открыть в VK ↗</a>
        : <span>{poster?.caption || "Видео откроется во ВКонтакте"}</span>}
      <a className={styles.recipeLink} href="#recipe-content">Читать рецепт <span aria-hidden="true">↓</span></a>
    </div>
  </section>;
}
