import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./Discounts.module.css";
// Импортируем данные — page.tsx серверный, может читать данные напрямую
import { discounts } from "./data";
import DiscountCard from "./discounts-card/DiscountsCard";

export const metadata = pageMetadata({
  title: "Система скидок — CocktailDesign",
  description:
    "Скидки, промокоды и бонусы для покупателей CocktailDesign. Узнайте, как получить выгоду при заказе барного оборудования и услуг брендирования.",
  canonical: "/discounts",
});

export default function DiscountsPage() {
  return (
    <PageLayout>
      <section className={styles.discountsSection}>
        <h1 className={styles.discountsSectionTitle}>Система скидок</h1>

        <ul className={styles.discountsList}>
          {discounts.map((discount) => (
            <li key={discount.id} className={styles.discountsItem}>
              {/* Передаём один объект акции в карточку */}
              <DiscountCard discount={discount} />
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  );
}
