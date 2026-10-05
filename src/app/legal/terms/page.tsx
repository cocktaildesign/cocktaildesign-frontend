import LegalDocument from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Пользовательское соглашение",
  description: "Пользовательское соглашение магазина Cocktail Design: условия и порядок обращения.",
  canonical: "/legal/terms",
});

export default function Page() { return <LegalDocument id="terms" />; }
