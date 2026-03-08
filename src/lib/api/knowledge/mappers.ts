// src/lib/api/knowledge/mappers.ts
// Преобразование Strapi → Domain types.
// Этот файл — единственное место, где Strapi-типы превращаются в UI-типы.

import { getStrapiMediaUrl } from "@/lib/api/strapi";

import type { KnowledgeItemPreview, KnowledgeVideoDetail, KnowledgeContentBlock } from "@/app/knowledge/types";

import type {
  StrapiKnowledgeItem,
  StrapiBlock,
  StrapiHeadingBlock,
  StrapiTextBlock,
  StrapiImageBlock,
  StrapiLinkBlock,
  StrapiListBlock,
} from "./types";

const FALLBACK_COVER_SRC = "/test-cover.png";

/* ============================================================
   Helpers
============================================================ */

function normalizeFormat(format: string): KnowledgeItemPreview["format"] {
  if (format === "video") return "video";
  if (format === "article") return "article";
  return "material";
}

export function normalizeTab(tab: string): KnowledgeItemPreview["tab"] {
  if (tab === "techniques") return "techniques";
  if (tab === "education") return "education";
  if (tab === "podcasts") return "podcasts";
  if (tab === "industry") return "industry";
  if (tab === "resources") return "resources";

  return "industry";
}

// Всегда возвращаем строку для обложки.
// Даже если getStrapiMediaUrl вернёт undefined, UI получит fallback.
function resolveCoverSrc(url?: string | null): string {
  if (!url) return FALLBACK_COVER_SRC;

  return getStrapiMediaUrl(url) ?? FALLBACK_COVER_SRC;
}

// Для контентных изображений тоже полезно иметь отдельный helper.
// Здесь fallback не используем, потому что отсутствие картинки
// для блока лучше обработать выше через null.
function resolveMediaSrc(url?: string | null): string | null {
  if (!url) return null;

  return getStrapiMediaUrl(url) ?? null;
}

/* ============================================================
   Preview
============================================================ */

export function mapKnowledgePreview(item: StrapiKnowledgeItem): KnowledgeItemPreview {
  const format = normalizeFormat(item.format);

  const base = {
    id: String(item.id),
    title: item.title,
    slug: item.slug,

    tab: normalizeTab(item.tab),
    format,

    date: item.date,

    coverSrc: resolveCoverSrc(item.cover?.url),

    description: item.description ?? undefined,
  };

  if (format === "video") {
    return {
      ...base,
      format: "video",
      duration: item.duration ?? "",
    };
  }

  if (format === "article") {
    return {
      ...base,
      format: "article",
      readTime: item.readTime ?? "",
    };
  }

  return {
    ...base,
    format: "material",
    label: item.label ?? undefined,
  };
}

/* ============================================================
   Video detail
============================================================ */

export function mapKnowledgeVideoDetail(item: StrapiKnowledgeItem): KnowledgeVideoDetail | null {
  if (!item.embedUrl) return null;

  return {
    id: String(item.id),

    title: item.title,
    slug: item.slug,

    tab: normalizeTab(item.tab),
    format: "video",

    date: item.date,

    coverSrc: resolveCoverSrc(item.cover?.url),

    description: item.description ?? undefined,

    duration: item.duration ?? "",

    embedUrl: item.embedUrl,

    externalUrl: item.externalUrl ?? undefined,
  };
}

/* ============================================================
   Blocks
============================================================ */

function mapHeadingBlock(block: StrapiHeadingBlock): KnowledgeContentBlock {
  return {
    id: String(block.id),
    type: "heading",
    level: block.level === "h3" ? 3 : 2,
    content: block.content,
  };
}

function mapTextBlock(block: StrapiTextBlock): KnowledgeContentBlock {
  return {
    id: String(block.id),
    type: "text",
    content: block.content,
  };
}

function mapImageBlock(block: StrapiImageBlock): KnowledgeContentBlock | null {
  const src = resolveMediaSrc(block.image?.url);
  if (!src) return null;

  return {
    id: String(block.id),
    type: "image",
    src,
    alt: block.alt ?? undefined,
    caption: block.caption ?? undefined,
  };
}

function mapLinkBlock(block: StrapiLinkBlock): KnowledgeContentBlock {
  return {
    id: String(block.id),
    type: "link",
    title: block.title,
    url: block.url,
    description: block.description ?? undefined,
  };
}

function mapListBlock(block: StrapiListBlock): KnowledgeContentBlock | null {
  const items = block.items
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  return {
    id: String(block.id),
    type: "list",
    ordered: block.ordered ?? false,
    items,
  };
}

export function mapKnowledgeBlocks(blocks: StrapiBlock[] | null | undefined): KnowledgeContentBlock[] {
  if (!blocks) return [];

  const result: KnowledgeContentBlock[] = [];

  for (const block of blocks) {
    switch (block.__component) {
      case "blocks.heading-block":
        result.push(mapHeadingBlock(block));
        break;

      case "blocks.text-block":
        result.push(mapTextBlock(block));
        break;

      case "blocks.image-block": {
        const mapped = mapImageBlock(block);
        if (mapped) result.push(mapped);
        break;
      }

      case "blocks.link-block":
        result.push(mapLinkBlock(block));
        break;

      case "blocks.list-block": {
        const mapped = mapListBlock(block);
        if (mapped) result.push(mapped);
        break;
      }
    }
  }

  return result;
}
