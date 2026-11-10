// CollectionMobileCategoryDrillDown.tsx
// Mobile ≤600: плитки категорий внутри подборки (URL остаётся /catalog/collection/[slug]).
import Image from "next/image";
import Link from "next/link";

import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";

import styles from "./CollectionMobileCategoryDrillDown.module.css";

type CollectionMobileCategoryDrillDownProps = {
  categories: CatalogCategoryPreview[];
  collectionSlug: string;
};

function buildCategoryHref(collectionSlug: string, categorySlug: string): string {
  const params = new URLSearchParams();
  params.set("category", categorySlug);
  return `/catalog/collection/${collectionSlug}?${params.toString()}`;
}

export default function CollectionMobileCategoryDrillDown({
  categories,
  collectionSlug,
}: CollectionMobileCategoryDrillDownProps) {
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
    </ul>
  );
}
