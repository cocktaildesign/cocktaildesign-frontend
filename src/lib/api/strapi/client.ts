// src/lib/api/strapi/client.ts
// ============================================================================
// Strapi client: базовый URL и fetch.
// Работает и на сервере (Next.js), и в браузере (client components).
// ============================================================================

function getBaseUrl(): string {
  // В браузере доступны только NEXT_PUBLIC_*
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
  }

  // На сервере доступны оба варианта
  return process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1338";
}

export function getStrapiUrl(): string {
  return getBaseUrl();
}

export async function fetchStrapi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  // A hidden product returns 404. Background fetch revalidation can retain the
  // old successful response on 404, so product visibility must be read fresh.
  // Keep caching lists/navigation; identical detail reads still dedupe per render.
  const response = await fetch(url.toString(), path === "/api/catalog/product"
    ? { cache: "no-store" }
    : { next: { revalidate: 60 } });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Strapi error: ${response.status} ${response.statusText}. Body: ${body}`);
  }

  return (await response.json()) as T;
}
