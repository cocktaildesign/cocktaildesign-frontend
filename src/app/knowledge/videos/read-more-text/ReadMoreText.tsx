"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ReadMoreText.module.css";

type ReadMoreTextProps = {
  text: string; // Текст описания
};

export default function ReadMoreText({ text }: ReadMoreTextProps) {
  // Состояние: раскрыт ли текст
  const [isExpanded, setIsExpanded] = useState(false);

  // Состояние: есть ли смысл показывать кнопку
  const [canToggle, setCanToggle] = useState(false);

  // Ref на <p> для измерения
  const textRef = useRef<HTMLParagraphElement | null>(null);

  // id для aria-controls
  const contentId = useId();

  // Проверяем переполнение после рендера и при изменении текста
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Важно: измеряем в СВЕРНУТОМ состоянии
    el.classList.remove(styles.expanded);
    el.classList.add(styles.collapsed);

    const overflowing = el.scrollHeight > el.clientHeight + 1;
    setCanToggle(overflowing);

    // Если текст не переполняется — сбрасываем expanded, чтобы не было странных состояний
    if (!overflowing) {
      setIsExpanded(false);
    }
  }, [text]);

  function handleToggle() {
    if (!canToggle) return;
    setIsExpanded((prev) => !prev);
  }

  return (
    <div className={styles.container}>
      <p ref={textRef} id={contentId} className={`${styles.text} ${isExpanded ? styles.expanded : styles.collapsed}`}>
        {text}
      </p>

      {canToggle ? (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={handleToggle}>
          {isExpanded ? "Свернуть" : "Показать полностью"}
        </button>
      ) : null}
    </div>
  );
}
