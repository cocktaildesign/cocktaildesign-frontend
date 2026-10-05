// src/app/catalog/product/[slug]/ProductComposition.tsx
//
// Блок "Комплектация" на странице товара.
// Показывается после характеристик, только если поле composition
// заполнено в Strapi. Если пусто — блок не появляется вообще.

import Link from "next/link";
import type { CompositionLine } from "@/lib/catalog/bundle-display";
import styles from "./ProductPage.module.css";

type ProductCompositionProps = {
  // Список пунктов комплектации
  // Каждая строка из Strapi становится отдельным <li>
  items: CompositionLine[];
};

export default function ProductComposition({ items }: ProductCompositionProps) {
  // Если список пустой — не рендерим блок
  if (items.length === 0) {
    return null;
  }

  return (
      <ul className={styles.productCompositionList}>
        {items.map((item) => (
          <li key={item.id} className={styles.productCompositionItem}>
            <span>{item.href ? <Link href={item.href} className={styles.specLink}>{item.name}</Link> : item.name}</span>
            {item.quantity !== null && <span className={styles.compositionQuantity}>× {item.quantity.toLocaleString("ru-RU")}</span>}
          </li>
        ))}
      </ul>
  );
}
