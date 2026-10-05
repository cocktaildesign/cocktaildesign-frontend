import LegalDocument from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Политика обработки персональных данных",
  description: "Политика обработки персональных данных магазина Cocktail Design: условия и порядок обращения.",
  canonical: "/legal/privacy-policy",
});

export default function Page() { return <LegalDocument id="privacy-policy" />; }
