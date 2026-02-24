// src/lib/api/strapi/media.ts
// ============================================================================
// Хелпер для медиа: Strapi отдаёт относительный путь "/uploads/..."
// а нам нужен абсолютный URL.
// ============================================================================

import { getStrapiUrl } from "./client";

export function getStrapiMediaUrl(path: string): string {
  return `${getStrapiUrl()}${path}`;
}
