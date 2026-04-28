// src/app/catalog/product/[slug]/ProductComposition.tsx
//
// Блок "Комплектация" на странице товара.
// Показывается после характеристик, только если поле composition
// заполнено в Strapi. Если пусто — блок не появляется вообще.

import styles from "./ProductPage.module.css";

type ProductCompositionProps = {
  // Список пунктов комплектации
  // Каждая строка из Strapi становится отдельным <li>
  items: string[];
};

export default function ProductComposition({ items }: ProductCompositionProps) {
  // Если список пустой — не рендерим блок
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.productComposition}>
      <h3 className={styles.productCompositionTitle}>Комплектация</h3>

      <ul className={styles.productCompositionList}>
        {items.map((item, index) => (
          <li key={index} className={styles.productCompositionItem}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
