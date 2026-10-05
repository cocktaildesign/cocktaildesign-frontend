import LegalDocument from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Публичная оферта",
  description: "Публичная оферта магазина Cocktail Design: условия и порядок обращения.",
  canonical: "/legal/offer",
});

export default function Page() { return <LegalDocument id="offer" />; }
