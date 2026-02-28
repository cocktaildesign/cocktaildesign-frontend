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
  return process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
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

  const response = await fetch(url.toString(), {
    // На клиенте будет проигнорировано — ок
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Strapi error: ${response.status} ${response.statusText}. Body: ${body}`);
  }

  return (await response.json()) as T;
}
