// src/app/catalog/product/[slug]/BundleItems.tsx
//
// Карточки составляющих, доступных для покупки по отдельности.

import Link from "next/link";
import Image from "next/image";
import type { CatalogBundleItem } from "@/lib/api/catalog/types";
import { bundleComponentHref } from "@/lib/catalog/bundle-display";
import styles from "./BundleItems.module.css";

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";

type BundleItemsProps = {
  items: CatalogBundleItem[];
};

export default function BundleItems({ items }: BundleItemsProps) {
  // Фильтруем элементы без компонента (на случай кривых данных)
  const validItems = items.filter((item) => item.componentProduct !== null);

  if (validItems.length === 0) return null;

  return (
    <div className={styles.bundleItems}>
      <p className={styles.bundleItemsTitle}>Можно купить отдельно</p>
      <div className={styles.bundleItemsInner} role="region" aria-label="Товары из комплекта" tabIndex={0}>
        {/* Карточки товаров */}
        {validItems.map((item, index) => {
          const cp = item.componentProduct!;
          const imgSrc = cp.imageUrl ?? PLACEHOLDER_IMG;
          const isLast = index === validItems.length - 1;

          return (
            <div key={item.id} className={styles.bundleItemWrapper}>
              <Link href={bundleComponentHref(cp)} className={styles.bundleItemCard}>
                {/* Фото товара */}
                <div className={styles.bundleItemCardImage}>
                  <Image src={imgSrc} alt={cp.name} fill sizes="160px" className={styles.bundleItemCardImg} />
                </div>

                {/* Название */}
                <p className={styles.bundleItemCardName}>{cp.name}</p>
                <p className={styles.bundleItemCardQty}>В наборе: {item.quantity.toLocaleString("ru-RU")} шт.</p>

                {/* Цена + количество */}
                <div className={styles.bundleItemCardBottom}>
                  <span className={styles.bundleItemCardPrice}>{cp.price.toLocaleString("ru-RU")} ₽ / шт.</span>
                </div>
              </Link>

              {/* Разделитель "+" между карточками, не после последней */}
              {!isLast && <div className={styles.bundleItemPlus}>+</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
