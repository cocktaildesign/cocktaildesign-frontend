// src/lib/api/strapi/client.ts
// ============================================================================
// Strapi client: только базовый URL и fetch.
// ============================================================================

// Базовый URL Strapi (на проде задаёшь STRAPI_URL в env)
const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";

// Даём доступ к URL другим модулям (например, для картинок)
export function getStrapiUrl(): string {
  return STRAPI_URL;
}

// Универсальный запрос к Strapi.
// path: "/api/knowledge-items"
// params: объект query-параметров (populate, filters, sort, ...)
export async function fetchStrapi(path: string, params?: Record<string, string>) {
  const url = new URL(path, STRAPI_URL);

  // Добавляем query-параметры в URL
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  // App Router: можно кешировать и ревалидировать
  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Strapi error: ${response.status} ${response.statusText}. Body: ${body}`);
  }

  return response.json();
}
