import styles from "./ProductNoveltyBadge.module.css";

const DEFAULT_NOVELTY_BADGE_COLOR = "#2eae4a";

type ProductNoveltyBadgeProps = {
  isNew: boolean;
  backgroundColor: string;
};

function normalizeBackgroundColor(value: string): string {
  const trimmed = value.trim();

  if (!/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return DEFAULT_NOVELTY_BADGE_COLOR;
  }

  return trimmed;
}

export default function ProductNoveltyBadge({ isNew, backgroundColor }: ProductNoveltyBadgeProps) {
  if (!isNew) {
    return null;
  }

  const safeBackgroundColor = normalizeBackgroundColor(backgroundColor);

  return (
    <span className={styles.badge} style={{ backgroundColor: safeBackgroundColor }}>
      НОВИНКА
    </span>
  );
}
