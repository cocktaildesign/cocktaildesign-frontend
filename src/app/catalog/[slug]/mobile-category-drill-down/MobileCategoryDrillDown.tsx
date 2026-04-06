// MobileCategoryDrillDown.tsx
import Image from "next/image";
import Link from "next/link";

import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";

import styles from "./MobileCategoryDrillDown.module.css";

type MobileCategoryDrillDownProps = {
  categories: CatalogCategoryPreview[];
  currentSlug: string;
};

export default function MobileCategoryDrillDown({ categories, currentSlug }: MobileCategoryDrillDownProps) {
  return (
    <ul className={styles.grid}>
      {/* Карточки категорий */}
      {categories.map((category) => (
        <li key={category.id} className={styles.card}>
          <Link href={`/catalog/${category.slug}`} className={styles.cardLink}>
            <div className={styles.cardText}>
              <span className={styles.title}>{category.name}</span>
            </div>

            <div className={styles.imageWrapper}>
              <Image
                src={category.imageSrc ?? "/images/catalog/product-placeholder.webp"}
                alt={category.name}
                fill
                sizes="(max-width: 600px) 33vw"
                className={styles.image}
              />
            </div>
          </Link>
        </li>
      ))}

      {/* Карточка перехода ко всем товарам */}
      <li className={styles.card}>
        <Link href={`/catalog/${currentSlug}?showAll=true`} className={styles.cardLink}>
          <div className={styles.cardText}>
            <span className={styles.title}>Все товары</span>
          </div>

          <div className={styles.imageWrapperAll}>
            <span className={styles.allIcon} aria-hidden="true">
              ⊞
            </span>
          </div>
        </Link>
      </li>
    </ul>
  );
}
