// Opening indexing requires both an explicit release flag and the final HTTPS origin.
export function canIndex(site: string, flag: string | undefined): boolean {
  return flag === "true" && site.replace(/\/$/, "") === "https://cocktaildesign.ru";
}

export function robotsPolicy(index: boolean) {
  return {
    index, follow: index,
    googleBot: { index, follow: index, "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 },
  };
}

export function cleanPageTitle(title: string): string {
  return title.trim().replace(/(?:\s*[—–-]\s*Cocktail\s*Design)+$/i, "").trim();
}

export function descriptionText(text: string, limit = 180): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  const start = clean.slice(0, limit - 1);
  const space = start.lastIndexOf(" ");
  return `${space > limit / 2 ? start.slice(0, space) : start}…`;
}

export type PageQuery = Record<string, string | string[] | undefined>;

export function pageNumber(raw: string | string[] | undefined): number | null {
  if (raw === undefined) return 1;
  if (typeof raw !== "string" || !/^[1-9]\d{0,4}$/.test(raw)) return null;
  return Number(raw);
}

export function listingHref(path: string, page: number, category?: string | null, showAll = false): string {
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (showAll) query.set("showAll", "true");
  if (page > 1) query.set("page", String(page));
  return query.size ? `${path}?${query}` : path;
}

export function withQuery(path: string, query: PageQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, item);
  }
  return params.size ? `${path}?${params}` : path;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
