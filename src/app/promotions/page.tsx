import PageLayout from "@/components/layout/PageLayout";
import styles from "./Promotions.module.css";

export default function PromotionsPage() {
  return (
    <PageLayout>
      <section className={styles.promotionsPage}>
        <h1 className={styles.promotionsPageTitle}>Акции</h1>
      </section>
    </PageLayout>
  );
}
