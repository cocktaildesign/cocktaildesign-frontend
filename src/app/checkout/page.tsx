// src/app/checkout/page.tsx
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import CheckoutClient from "./CheckoutClient";
import styles from './Checkout.module.css'

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Оформление заказа",
    canonical: "/checkout",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <PageLayout className={styles.CheckoutPage}>
      <CheckoutClient />
    </PageLayout>
  );
}
