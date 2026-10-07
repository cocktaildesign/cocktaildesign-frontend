import styles from "./CarouselControls.module.css";

export default function CarouselControls({labels, index, select, previous, next}: {
  labels: string[]; index: number; select: (index: number) => void; previous: () => void; next: () => void;
}) {
  if (labels.length < 2) return null;
  return <>
    <button type="button" className={`${styles.arrow} ${styles.previous}`} onClick={previous} aria-label="Предыдущий слайд">
      <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></span>
    </button>
    <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={next} aria-label="Следующий слайд">
      <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg></span>
    </button>
    <div className={styles.pagination} aria-label="Выбор баннера">
      {labels.map((label, value) => <button key={value} type="button" className={styles.dot}
        aria-label={`Баннер ${value + 1}: ${label}`} aria-current={value === index ? "true" : undefined}
        onClick={() => select(value)} />)}
    </div>
  </>;
}
