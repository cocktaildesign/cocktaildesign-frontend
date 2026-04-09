// src/app/discounts/page.tsx

import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import VolumeTiers from "./VolumeTiers";
import DiscountCard from "./discounts-card/DiscountsCard";
import { discounts } from "./data";

import styles from "./Discounts.module.css";

export const metadata = pageMetadata({
  title: "Система скидок — CocktailDesign",
  description:
    "Скидки, промокоды и бонусы для покупателей CocktailDesign. Узнайте, как получить выгоду при заказе барного оборудования и услуг брендирования.",
  canonical: "/discounts",
});

export default function DiscountsPage() {
  return (
    <PageLayout>
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Система скидок</h1>
        <p className={styles.description}>
          Мы заинтересованы в долгосрочной работе и предусмотрели систему скидок в зависимости от объёма заказов. Скидка
          вступает в силу, когда стоимость товаров в корзине превышает 10&nbsp;000&nbsp;₽.
        </p>
        {/* Блок скидки от объёма */}
        <VolumeTiers />

        {/* Сетка остальных акций */}
        <ul className={styles.grid}>
          {discounts.map((discount) => (
            <li key={discount.id}>
              <DiscountCard discount={discount} />
            </li>
          ))}
        </ul>
      </div>
    </PageLayout>
  );
}
