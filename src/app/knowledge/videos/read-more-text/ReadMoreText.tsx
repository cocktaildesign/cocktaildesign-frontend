// frontend/src/app/knowledge/videos/read-more-text/ReadMoreText.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ReadMoreText.module.css";

type ReadMoreTextProps = {
  text: string;
};

export default function ReadMoreText({ text }: ReadMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);

  const textRef = useRef<HTMLParagraphElement | null>(null);
  const contentId = useId();

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    el.classList.remove(styles.expanded);
    el.classList.add(styles.collapsed);

    const overflowing = el.scrollHeight > el.clientHeight + 1;
    setCanToggle(overflowing);

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
