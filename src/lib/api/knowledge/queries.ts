// src/lib/api/knowledge/queries.ts
// Получение данных knowledge из Strapi и преобразование в Domain types.
// Здесь нет JSX и UI — только загрузка и подготовка данных.

import { fetchStrapi, getStrapiMediaUrl } from "@/lib/api/strapi";

import type {
  KnowledgeItemPreview,
  KnowledgeVideoDetail,
  KnowledgeArticleDetail,
  KnowledgeMaterialDetail,
} from "@/app/knowledge/types";

import type { StrapiKnowledgeListResponse } from "./types";

import { mapKnowledgePreview, mapKnowledgeVideoDetail, mapKnowledgeBlocks, normalizeTab } from "./mappers";

const FALLBACK_COVER_SRC = "/test-cover.png";

/* ============================================================
   Helpers
============================================================ */

// Всегда возвращаем строку для coverSrc.
// Это защищает нас от ситуации, когда getStrapiMediaUrl(...)
// вернёт undefined.
function resolveCoverSrc(url?: string | null): string {
  if (!url) return FALLBACK_COVER_SRC;

  return getStrapiMediaUrl(url) ?? FALLBACK_COVER_SRC;
}

/* ============================================================
   Populate profiles (конфигурация запросов)
   Один источник правды для populate-параметров.
============================================================ */

/**
 * Параметры для списка карточек (/knowledge)
 * Нам нужна только обложка и сортировка.
 */
const LIST_PARAMS: Record<string, string> = {
  "populate[cover]": "true",
  sort: "date:desc",
};

/**
 * Базовые параметры для видео.
 * Видео не используют blocks.
 */
const VIDEO_PARAMS_BASE: Record<string, string> = {
  "populate[cover]": "true",
};

/**
 * Общие параметры для страниц с blocks (article и material).
 * Если добавишь новый блок в Strapi — править нужно только здесь.
 */
const DETAIL_BLOCKS_PARAMS: Record<string, string> = {
  "populate[cover]": "true",

  "populate[blocks][on][blocks.heading-block]": "true",
  "populate[blocks][on][blocks.text-block]": "true",
  "populate[blocks][on][blocks.list-block]": "true",
  "populate[blocks][on][blocks.link-block]": "true",

  // важно: populate image внутри image-block
  "populate[blocks][on][blocks.image-block][populate][image]": "true",
};

/* ============================================================
   List (карточки)
============================================================ */

export async function getKnowledgeItemsFromStrapi(
  tab: string | null,
  format: string | null,
): Promise<KnowledgeItemPreview[]> {
  // создаём копию базовых параметров
  const params: Record<string, string> = { ...LIST_PARAMS };

  // применяем фильтры, если есть
  if (tab) {
    params["filters[tab][$eq]"] = tab;
  }

  if (format) {
    params["filters[format][$eq]"] = format;
  }

  const response: StrapiKnowledgeListResponse = await fetchStrapi("/api/knowledge-items", params);

  return response.data.map(mapKnowledgePreview);
}

/* ============================================================
   Video detail
============================================================ */

export async function getKnowledgeVideoBySlugFromStrapi(slug: string): Promise<KnowledgeVideoDetail | null> {
  const params: Record<string, string> = {
    ...VIDEO_PARAMS_BASE,
    "filters[slug][$eq]": slug,
    "filters[format][$eq]": "video",
  };

  const response: StrapiKnowledgeListResponse = await fetchStrapi("/api/knowledge-items", params);

  const item = response.data[0];

  if (!item) return null;

  return mapKnowledgeVideoDetail(item);
}

/* ============================================================
   Article detail
============================================================ */

export async function getKnowledgeArticleBySlugFromStrapi(slug: string): Promise<KnowledgeArticleDetail | null> {
  const params: Record<string, string> = {
    ...DETAIL_BLOCKS_PARAMS,
    "filters[slug][$eq]": slug,
    "filters[format][$eq]": "article",
  };

  const response: StrapiKnowledgeListResponse = await fetchStrapi("/api/knowledge-items", params);

  const item = response.data[0];

  if (!item) return null;

  return {
    id: String(item.id),

    title: item.title,
    slug: item.slug,

    tab: normalizeTab(item.tab),
    format: "article",

    date: item.date,

    coverSrc: resolveCoverSrc(item.cover?.url),

    description: item.description ?? undefined,

    readTime: item.readTime ?? "",

    blocks: mapKnowledgeBlocks(item.blocks),
  };
}

/* ============================================================
   Material detail
============================================================ */

export async function getKnowledgeMaterialBySlugFromStrapi(slug: string): Promise<KnowledgeMaterialDetail | null> {
  const params: Record<string, string> = {
    ...DETAIL_BLOCKS_PARAMS,
    "filters[slug][$eq]": slug,
    "filters[format][$eq]": "material",
  };

  const response: StrapiKnowledgeListResponse = await fetchStrapi("/api/knowledge-items", params);

  const item = response.data[0];

  if (!item) return null;

  return {
    id: String(item.id),

    title: item.title,
    slug: item.slug,

    tab: normalizeTab(item.tab),
    format: "material",

    date: item.date,

    coverSrc: resolveCoverSrc(item.cover?.url),

    description: item.description ?? undefined,

    label: item.label ?? undefined,

    blocks: mapKnowledgeBlocks(item.blocks),
  };
}
