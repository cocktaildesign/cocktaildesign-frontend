// src/app/checkout/page.tsx
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import CheckoutClient from "./CheckoutClient";

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
    <PageLayout>
      <CheckoutClient />
    </PageLayout>
  );
}
