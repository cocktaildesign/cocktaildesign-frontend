import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import DiscountOffers from "./DiscountOffers";
import styles from "./Discounts.module.css";

export const metadata = pageMetadata({
  title: "Система скидок — CocktailDesign",
  description: "Скидка 20% на первый заказ, скидки за объём, бесплатная доставка и предложение ко дню рождения. Условия и промокоды Cocktail Design.",
  canonical: "/discounts",
});

export default function DiscountsPage() {
  return (
    <PageLayout className={styles.layout}>
      <div className={styles.page}>
        <header className={styles.hero}>
          <h1 className={styles.pageTitle}>Система скидок</h1>
          <p className={styles.description}>Для первого заказа и следующих покупок.</p>
        </header>
        <DiscountOffers />
      </div>
    </PageLayout>
  );
}
