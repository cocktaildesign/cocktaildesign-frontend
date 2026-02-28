// src/lib/api/strapi/client.ts
// ============================================================================
// Strapi client: базовый URL и fetch.
// Работает и на сервере (Next.js), и в браузере (client components).
// ============================================================================

/**
 * resolveStrapiUrl
 *
 * Почему так:
 * - На сервере можно читать STRAPI_URL (обычная env).
 * - В браузере доступны только NEXT_PUBLIC_* переменные.
 *
 * Если client-компонент вызывает fetchStrapi, то STRAPI_URL будет undefined,
 * и без NEXT_PUBLIC_STRAPI_URL мы упадём в localhost:1337 (как у тебя сейчас).
 */
function resolveStrapiUrl(): string {
  // Браузер
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
  }

  // Сервер (Next.js)
  return process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
}

// Базовый URL Strapi
const STRAPI_URL = resolveStrapiUrl();

// Даём доступ к URL другим модулям (например, для картинок)
export function getStrapiUrl(): string {
  return STRAPI_URL;
}

/**
 * fetchStrapi
 *
 * path: "/api/knowledge-items"
 * params: query-параметры (populate, filters, sort, ...)
 */
export async function fetchStrapi<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, STRAPI_URL);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  // Важно:
  // - На сервере revalidate ок.
  // - В браузере next:{revalidate} игнорируется, но не ломает.
  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Strapi error: ${response.status} ${response.statusText}. Body: ${body}`);
  }

  return (await response.json()) as T;
}
