import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./Shipping.module.css";
import DeliveryTabs from "./shipping-tabs/ShippingTabs";

export const metadata = pageMetadata({
  title: "Доставка | CocktailDesign",
  description: "Узнайте условия и сроки доставки барного инвентаря и аксессуаров от CocktailDesign по всей России.",
  canonical: "/shipping",
});

export default function Shipping() {
  return (
    <PageLayout>
      <section className={styles.shippingPage}>
        <h1 className={styles.shippingPageTitle}>Доставка</h1>
        <DeliveryTabs />
      </section>
    </PageLayout>
  );
}
