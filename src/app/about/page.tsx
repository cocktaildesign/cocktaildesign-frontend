import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";

export const metadata = pageMetadata({
  title: "О нас",
  description:
    "CocktailDesign — гипермаркет барного оборудования. Как мы отбираем товары и помогаем собрать бар под задачу.",
  canonical: "/about",
});

export default function AboutPage() {
  return <PageLayout>О нас</PageLayout>;
}
