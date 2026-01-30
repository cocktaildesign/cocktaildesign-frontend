"use client";

import { useCallback } from "react";
import styles from "./ShareButton.module.css";
import ShareIcon from "@/components/icons/ShareIcon";

type ShareButtonProps = {
  url: string; // ссылка на страницу
  title: string; // заголовок для шаринга
};

export default function ShareButton({ url, title }: ShareButtonProps) {
  const handleShare = useCallback(async () => {
    // Нативный share (мобильные устройства + современные браузеры)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch {
        // Пользователь отменил — игнорируем
      }
      return;
    }

    // Fallback — копирование ссылки
    try {
      await navigator.clipboard.writeText(url);
      alert("Ссылка скопирована");
    } catch {
      alert("Не удалось скопировать ссылку");
    }
  }, [title, url]);

  return (
    <button type="button" className={styles.button} onClick={handleShare} aria-label="Поделиться страницей">
      <ShareIcon />
      Поделиться
    </button>
  );
}
