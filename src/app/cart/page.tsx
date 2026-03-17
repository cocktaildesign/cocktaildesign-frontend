// src/app/cart/page.tsx
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import CartClient from "./cart-client/CartClient";
import styles from "./Cart.module.css";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Корзина",
    canonical: "/cart",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <PageLayout className={styles.CartPage}>
      <CartClient />
    </PageLayout>
  );
}
