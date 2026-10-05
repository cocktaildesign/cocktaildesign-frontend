import LegalDocument from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Согласие на обработку персональных данных",
  description: "Согласие на обработку персональных данных магазина Cocktail Design: условия и порядок обращения.",
  canonical: "/legal/consent",
});

export default function Page() { return <LegalDocument id="consent" />; }
