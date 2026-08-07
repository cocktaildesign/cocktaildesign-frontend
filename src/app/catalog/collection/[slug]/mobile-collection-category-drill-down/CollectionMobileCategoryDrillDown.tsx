// CollectionMobileCategoryDrillDown.tsx
// Mobile ≤600: плитки категорий внутри подборки (URL остаётся /catalog/collection/[slug]).
import Image from "next/image";
import Link from "next/link";

import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";

import styles from "./CollectionMobileCategoryDrillDown.module.css";

type CollectionMobileCategoryDrillDownProps = {
  categories: CatalogCategoryPreview[];
  collectionSlug: string;
  // null/undefined на корне подборки; slug — когда смотрим children категории
  currentCategorySlug?: string | null;
};

function buildShowAllHref(collectionSlug: string, currentCategorySlug?: string | null): string {
  const params = new URLSearchParams();

  if (currentCategorySlug) {
    params.set("category", currentCategorySlug);
  }

  params.set("showAll", "true");

  return `/catalog/collection/${collectionSlug}?${params.toString()}`;
}

function buildCategoryHref(collectionSlug: string, categorySlug: string): string {
  const params = new URLSearchParams();
  params.set("category", categorySlug);
  return `/catalog/collection/${collectionSlug}?${params.toString()}`;
}

export default function CollectionMobileCategoryDrillDown({
  categories,
  collectionSlug,
  currentCategorySlug,
}: CollectionMobileCategoryDrillDownProps) {
  const showAllHref = buildShowAllHref(collectionSlug, currentCategorySlug);

  return (
    <ul className={styles.grid}>
      {categories.map((category) => (
        <li key={category.id} className={styles.card}>
          <Link href={buildCategoryHref(collectionSlug, category.slug)} className={styles.cardLink}>
            <div className={styles.cardText}>
              <span className={styles.title}>{category.name}</span>
            </div>

            <div className={styles.imageWrapper}>
              <Image
                src={category.imageSrc ?? "/images/catalog/product-placeholder.webp"}
                alt={category.alt || category.name}
                fill
                sizes="(max-width: 600px) 33vw"
                className={styles.image}
              />
            </div>
          </Link>
        </li>
      ))}

      <li className={styles.card}>
        <Link href={showAllHref} className={styles.cardLink}>
          <div className={styles.cardText}>
            <span className={styles.title}>Все товары</span>
          </div>

          <div className={styles.imageWrapperAll}>
            <span className={styles.allIcon} aria-hidden="true">
              <Image
                src="/images/catalog/allProductsImage.webp"
                alt="Все товары"
                fill
                sizes="(max-width: 600px) 33vw"
                className={styles.image}
              />
            </span>
          </div>
        </Link>
      </li>
    </ul>
  );
}
