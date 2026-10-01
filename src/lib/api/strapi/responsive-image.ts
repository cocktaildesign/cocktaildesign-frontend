type ImageCandidate = { url?: string; width?: number | null };
type Media = ImageCandidate & { formats?: Record<string, ImageCandidate> | null };

// Use only variants actually supplied by Strapi; never invent file-name prefixes.
// The original <img> remains a fallback when formats are absent.
export function mediaSrcSet(file: Media | null | undefined, resolve: (path: string) => string | undefined): string | undefined {
  if (!file) return undefined;
  const widths = new Map<number, string>();
  for (const candidate of [...Object.values(file.formats ?? {}), file]) {
    if (!candidate?.url || !Number.isInteger(candidate.width) || (candidate.width ?? 0) <= 0) continue;
    const url = resolve(candidate.url);
    if (!url || /[\s,]/.test(url)) continue;
    widths.set(candidate.width as number, url);
  }
  if (widths.size < 2) return undefined;
  return [...widths].sort(([a], [b]) => a - b).map(([width, url]) => `${url} ${width}w`).join(", ");
}
