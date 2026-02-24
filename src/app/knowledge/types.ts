// frontend/src/app/knowledge/types.ts
// Domain types для knowledge.
// Эти типы используются во всём UI и возвращаются из API-модуля.

/* ============================================================
   Перечисления
============================================================ */

export type KnowledgeTab = "techniques" | "education" | "podcasts" | "industry" | "resources";

export type KnowledgeFormat = "video" | "article" | "material";

/* ============================================================
   Preview (карточки списка)
============================================================ */

type KnowledgePreviewBase = {
  id: string;
  title: string;
  slug: string;

  tab: KnowledgeTab;
  format: KnowledgeFormat;

  date: string;
  coverSrc: string;

  description?: string;
};

export type KnowledgeVideoPreview = KnowledgePreviewBase & {
  format: "video";
  duration: string;
};

export type KnowledgeArticlePreview = KnowledgePreviewBase & {
  format: "article";
  readTime: string;
};

export type KnowledgeMaterialPreview = KnowledgePreviewBase & {
  format: "material";
  label?: string;
};

/* ============================================================
   Content blocks (единый тип для article и material)
============================================================ */

/**
 * ordered всегда boolean.
 * Маппер обязан подставить false, если CMS не вернула значение.
 */
export type KnowledgeContentBlock =
  | {
      id: string;
      type: "heading";
      level: 2 | 3;
      content: string;
    }
  | {
      id: string;
      type: "text";
      content: string;
    }
  | {
      id: string;
      type: "image";
      src: string;
      alt?: string;
      caption?: string;
    }
  | {
      id: string;
      type: "list";
      ordered: boolean;
      items: string[];
    }
  | {
      id: string;
      type: "link";
      title: string;
      url: string;
      description?: string;
    };

/**
 * Алиас для обратной совместимости.
 * Можно постепенно удалить позже.
 */


/* ============================================================
   Detail types
============================================================ */

export type KnowledgeVideoDetail = KnowledgeVideoPreview & {
  embedUrl: string;
  externalUrl?: string;
};

export type KnowledgeArticleDetail = KnowledgeArticlePreview & {
  blocks: KnowledgeContentBlock[];
};

export type KnowledgeMaterialDetail = KnowledgeMaterialPreview & {
  blocks: KnowledgeContentBlock[];
};

/* ============================================================
   Union types
============================================================ */

export type KnowledgeItemPreview = KnowledgeVideoPreview | KnowledgeArticlePreview | KnowledgeMaterialPreview;

export type KnowledgeItemDetail = KnowledgeVideoDetail | KnowledgeArticleDetail | KnowledgeMaterialDetail;
