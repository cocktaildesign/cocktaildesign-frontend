"use client";

import { useEffect, useRef, useState } from "react";
import type { AboutVideoMedia } from "./about-content";
import styles from "./AboutPage.module.css";

export default function AboutVideo({ media }: { media: AboutVideoMedia }) {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const player = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!started) return;
    player.current?.focus();
    void player.current?.play().catch(() => { /* Native controls remain available. */ });
  }, [started]);
  const cover = <>
    <picture><img src={media.poster.src} srcSet={media.poster.srcSet} sizes="(max-width: 1408px) calc(100vw - 32px), 1360px"
      width={media.poster.width} height={media.poster.height} alt="" loading="lazy" decoding="async" /></picture>
    <span className={styles.videoPlay} aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></span>
  </>;
  return <div>
    <div className={styles.videoFrame}>
      {media.file ? started ? <video ref={player} src={media.file} controls playsInline preload="none" tabIndex={0}
        aria-label={media.title} poster={media.poster.src} onError={() => setFailed(true)}>
        {media.captions && <track kind="captions" src={media.captions} srcLang="ru" label="Русский" default />}
      </video> : <button type="button" className={styles.videoPoster} onClick={() => setStarted(true)} aria-label={`Смотреть видео: ${media.title}`}>{cover}</button>
        : <a className={styles.videoPoster} href={media.href} target="_blank" rel="noopener noreferrer" aria-label={`Смотреть видео: ${media.title} в VK (в новой вкладке)`}>{cover}</a>}
    </div>
    <div className={styles.videoCaption}><strong>{media.title}</strong><span>{media.durationLabel}{!media.file && " · Смотреть в VK"}</span></div>
    {failed && <p className={styles.videoFallback} role="status">Видео не удалось загрузить. <a href={media.href} target="_blank" rel="noopener noreferrer">Открыть в VK<span className={styles.srOnly}> (в новой вкладке)</span></a></p>}
  </div>;
}
