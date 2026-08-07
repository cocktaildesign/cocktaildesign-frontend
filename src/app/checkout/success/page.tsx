import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <PageLayout showBreadcrumbs={false}>
      <Suspense>
        <SuccessClient />
      </Suspense>
    </PageLayout>
  );
}
