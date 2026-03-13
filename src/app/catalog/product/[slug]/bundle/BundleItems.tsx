// src/app/catalog/product/[slug]/BundleItems.tsx
//
// Блок "Состав комплекта" — показывается только для bundle-товаров.
// Layout: слева — карточка с заголовком и ценой, справа — карточки товаров.

import Link from "next/link";
import Image from "next/image";
import type { CatalogBundleItem } from "@/lib/api/catalog/types";
import styles from "./BundleItems.module.css";

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";

type BundleItemsProps = {
  items: CatalogBundleItem[];
  // Цена всего комплекта — берём из product.price в page.tsx
  bundlePrice: number;
};

export default function BundleItems({ items, bundlePrice }: BundleItemsProps) {
  // Фильтруем элементы без компонента (на случай кривых данных)
  const validItems = items.filter((item) => item.componentProduct !== null);

  if (validItems.length === 0) return null;

  return (
    <div className={styles.bundleItems}>
      <div className={styles.bundleItemsInner}>
        {/* Левая карточка — заголовок + цена */}
        <div className={styles.bundleItemsSummary}>
          <div>
            <p className={styles.bundleItemsSummaryLabel}>Комплект</p>
            <p className={styles.bundleItemsSummaryCount}>
              из {validItems.length} {validItems.length === 1 ? "товара" : "товаров"}
            </p>
            <p className={styles.bundleItemsSummaryDesc}>Все необходимое в одном наборе</p>
          </div>

          <p className={styles.bundleItemsSummaryPrice}>{bundlePrice.toLocaleString("ru-RU")} ₽</p>
        </div>

        {/* Карточки товаров */}
        {validItems.map((item, index) => {
          const cp = item.componentProduct!;
          const imgSrc = cp.imageUrl ?? PLACEHOLDER_IMG;
          const isLast = index === validItems.length - 1;

          return (
            <div key={item.id} className={styles.bundleItemWrapper}>
              <Link href={`/catalog/product/${cp.slug}`} className={styles.bundleItemCard}>
                {/* Фото товара */}
                <div className={styles.bundleItemCardImage}>
                  <Image src={imgSrc} alt={cp.name} fill sizes="160px" className={styles.bundleItemCardImg} />
                </div>

                {/* Название */}
                <p className={styles.bundleItemCardName}>{cp.name}</p>

                {/* Цена + количество */}
                <div className={styles.bundleItemCardBottom}>
                  <span className={styles.bundleItemCardPrice}>{cp.price.toLocaleString("ru-RU")} ₽</span>
                  {item.quantity > 1 && <span className={styles.bundleItemCardQty}>× {item.quantity}</span>}
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
