import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SuccessClient from "./SuccessClient";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "Заказ оформлен", canonical: "/checkout/success", noindex: true });

export default function SuccessPage() {
  return (
    <PageLayout showBreadcrumbs={false}>
      <Suspense>
        <SuccessClient />
      </Suspense>
    </PageLayout>
  );
}
