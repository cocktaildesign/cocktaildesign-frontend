"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./NavBar.module.css";

type Item = { label: string; href: string };

export default function PriorityCategoryLinks({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    function update() {
      if (!container || !measure) return;
      const available = container.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      let used = 0;
      let count = 0;
      for (const item of Array.from(measure.children)) {
        const width = item.getBoundingClientRect().width;
        const next = used + (count ? gap : 0) + width;
        if (next > available || width === 0) break;
        used = next;
        count++;
      }
      setVisibleCount(count);
    }

    // Text is observed too: downloading a font can change which links fit.
    const observer = new ResizeObserver(update);
    observer.observe(container);
    for (const item of Array.from(measure.children)) observer.observe(item);
    update();
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className={styles.categories} ref={containerRef}>
      <ul className={styles.categoryList}>
        {items.slice(0, visibleCount).map((item) => (
          <li key={item.href}>
            <Link className={styles.categoryLink} href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
      {/* Measurements are noninteractive and hidden from assistive technology. */}
      <div className={styles.measure} ref={measureRef} aria-hidden="true">
        {items.map((item) => <span className={styles.categoryLink} key={item.href}>{item.label}</span>)}
      </div>
    </div>
  );
}
