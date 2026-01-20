import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";

export const metadata = pageMetadata({
  title: "Контакты",
  description: "Контактная информация CocktailDesign",
  canonical: "/about/contacts",
});

export default function Contacts() {
  return <PageLayout>Контактная информация</PageLayout>;
}
