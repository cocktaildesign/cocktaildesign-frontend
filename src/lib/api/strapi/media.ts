// src/lib/api/strapi/media.ts
// ============================================================================
// Хелпер для медиа: Strapi отдаёт относительный путь "/uploads/..."
// а нам нужен абсолютный URL.
// ============================================================================

// src/lib/api/strapi/media.ts
import { getStrapiUrl } from "./client";

export function getStrapiMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;

  const base = getStrapiUrl().replace(/\/api\/?$/, "");
  return `${base}${path}`;
}
