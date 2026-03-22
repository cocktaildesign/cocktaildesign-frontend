import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./PaymentMethods.module.css";
import PaymentTabs from "./payment-tabs/PaymentTabs";

export const metadata = pageMetadata({
  title: "Способы оплаты | CocktailDesign",
  description:
    "Ознакомьтесь с доступными способами оплаты барного инвентаря и аксессуаров от CocktailDesign — банковские карты, онлайн-платежи и наличные.",
  canonical: "/payment-methods",
});

export default function PaymentMethods() {
  return (
    <PageLayout>
      <section className={styles.paymentMethodsPage}>
        <h1 className={styles.paymentMethodsPageTitle}>Способы оплаты</h1>

        <p className={styles.paymentMethodsPageDescription}>
          Выберите удобный способ оплаты — для физических и юридических лиц.
        </p>

        <PaymentTabs />
      </section>
    </PageLayout>
  );
}
