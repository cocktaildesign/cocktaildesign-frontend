// frontend/src/app/payment-methods/page.tsx
import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./PaymentMethods.module.css";
import PaymentTabs from "./payment-tabs/PaymentTabs";

export const metadata = pageMetadata({
  title: "Способы оплаты | CocktailDesign",
  description:
    "Способы оплаты в CocktailDesign для юридических и физических лиц: по счёту, банковской картой и наличными.",
  canonical: "/payment-methods",
});

export default function PaymentMethods() {
  return (
    <PageLayout>
      <section className={styles.paymentMethodsPage}>
        <h1 className={styles.paymentMethodsPageTitle}>Способы оплаты</h1>

        <PaymentTabs />
      </section>
    </PageLayout>
  );
}
