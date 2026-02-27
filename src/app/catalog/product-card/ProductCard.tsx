// frontend/src/app/catalog/product-card/ProductCard.tsx

// ============================================================================
// ProductCard
// Варианты:
// - "skeleton" (заглушка)
// - обычная карточка с данными
// ============================================================================

import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import styles from "./ProductCard.module.css";

type ProductCardProps =
  | {
      variant: "skeleton";
    }
  | {
      product: CatalogProductPreview;
      variant?: undefined;
    };

// formatPrice
// Форматируем число в "1 990 ₽".
// Важно: сейчас считаем, что price уже в рублях (integer).
// Если у тебя на бэке price в копейках — поменяем одним шагом позже.
function formatPrice(value: number): string {
  const safe = Number.isFinite(value) && value > 0 ? value : 0;

  return `${new Intl.NumberFormat("ru-RU").format(safe)} ₽`;
}

export default function ProductCard(props: ProductCardProps) {
  // 1) Skeleton режим: просто каркас
  if (props.variant === "skeleton") {
    return (
      <article className={styles.card} aria-hidden="true">
        <div className={styles.thumb} />
        <h3 className={styles.title}>Загрузка…</h3>
        <p className={styles.meta}>—</p>
      </article>
    );
  }

  const { product } = props;

  return (
    <article className={styles.card}>
      {/* Изображение:
          - если imageUrl нет → показываем пустой блок (плейсхолдер)
          - если есть → обычный img
      */}
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.thumb} src={product.imageUrl} alt={product.name} loading="lazy" />
      ) : (
        <div className={styles.thumb} aria-hidden="true" />
      )}

      {/* Название товара */}
      <h3 className={styles.title}>{product.name}</h3>

      {/* Цена */}
      <p className={styles.meta}>{formatPrice(product.price)}</p>
    </article>
  );
}
