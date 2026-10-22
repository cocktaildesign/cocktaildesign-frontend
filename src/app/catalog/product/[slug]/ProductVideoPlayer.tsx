"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductVideo } from "@/lib/catalog/product-videos";
import styles from "./ProductPage.module.css";

export default function ProductVideoPlayer({ video }: { video: ProductVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    // Playback begins only after the user selects the video thumbnail.
    // Honour reduced motion for automatic repetition, and pause off screen.
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setLoop = () => { player.loop = !preference.matches; };
    setLoop();
    preference.addEventListener("change", setLoop);
    const pauseHidden = () => { if (document.hidden) player.pause(); };
    document.addEventListener("visibilitychange", pauseHidden);
    const observer = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting) player.pause();
    });
    observer.observe(player);
    return () => {
      player.pause();
      observer.disconnect();
      preference.removeEventListener("change", setLoop);
      document.removeEventListener("visibilitychange", pauseHidden);
    };
  }, [attempt, failed]);

  if (failed) return (
    <div className={styles.productVideoError} role="status">
      <p>Видео не загрузилось. Фотографии доступны рядом.</p>
      <button type="button" onClick={() => { setFailed(false); setAttempt(n => n + 1); }}>Повторить</button>
    </div>
  );

  return <video
    key={`${video.id}-${attempt}`}
    ref={ref}
    src={video.src}
    poster={video.poster}
    width={video.width}
    height={video.height}
    className={styles.productGalleryVideo}
    aria-label={`${video.label}. Без звука`}
    controls
    muted
    playsInline
    autoPlay
    preload="none"
    onError={() => setFailed(true)}
  />;
}
