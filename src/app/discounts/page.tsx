import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import VolumeTiers from "./VolumeTiers";
import PromoAccordion from "./PromoAccordion";
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
        <div className={styles.hero}>
          <h1 className={styles.pageTitle}>Система скидок</h1>
          <p className={styles.description}>
            Чем больше заказ — тем выгоднее условия. Введите сумму и увидите свою скидку мгновенно.
          </p>
        </div>

        <VolumeTiers />

        <section className={styles.promosSection}>
          <h2 className={styles.promosTitle}>Акции и промокоды</h2>
          <div className={styles.promosList}>
            {discounts.map((discount) => (
              <PromoAccordion key={discount.id} discount={discount} />
            ))}
          </div>
        </section>

        <div className={styles.cta}>
          <p className={styles.ctaText}>Знаете нужную сумму? Перейдите в каталог и соберите заказ.</p>
          <Link href="/catalog" className={styles.ctaButton}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Перейти в каталог
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
