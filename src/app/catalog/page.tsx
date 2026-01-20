import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";

export const metadata = pageMetadata({
  title: "Каталог",
  description:
    "Каталог барного оборудования: шейкеры, джиггеры, стрейнеры, барные ложки и аксессуары. Фото, характеристики и наличие.",
  canonical: "/catalog",
});

export default function CatalogPage() {
  return <PageLayout>Каталог</PageLayout>;
}
