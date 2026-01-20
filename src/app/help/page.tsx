import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";

export const metadata = pageMetadata({
  title: "Помощь",
  description: "Ответы на вопросы: доставка, оплата, возврат, гарантия и поддержка клиентов CocktailDesign.",
  canonical: "/help",
});

export default function HelpPage() {
  return <PageLayout>Помощь</PageLayout>;
}
