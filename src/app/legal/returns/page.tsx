import LegalDocument from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Условия возврата товара",
  description: "Условия возврата товара магазина Cocktail Design: условия и порядок обращения.",
  canonical: "/legal/returns",
});

export default function Page() { return <LegalDocument id="returns" />; }
