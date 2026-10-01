import type { KnowledgeArticleDetail } from "@/app/knowledge/types";
import { descriptionText } from "./policy";

// Do not advertise the generic fallback as an article's illustration.
export function knowledgeImage(src: string, origin: string): string | undefined {
  if (!src.trim()) return undefined;
  try {
    const url = new URL(src, origin);
    if (!["https:", "http:"].includes(url.protocol) || url.pathname === "/test-cover.png") return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function articleJsonLd(item: KnowledgeArticleDetail, origin: string) {
  const url = new URL(`/knowledge/articles/${item.slug}`, origin).href;
  const image = knowledgeImage(item.coverSrc, origin);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: item.title,
    description: item.description ? descriptionText(item.description) : undefined,
    image: image ? [image] : undefined,
    inLanguage: "ru-RU",
    publisher: { "@type": "Organization", name: "Cocktail Design", url: origin },
    // CMS import dates are not verified original publication dates. Authors and
    // publication dates can be added after editorial verification, not inferred.
  };
}
