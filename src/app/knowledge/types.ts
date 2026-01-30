// types.ts

export type KnowledgeTab = "techniques" | "education" | "podcasts" | "industry" | "resources";

export type KnowledgeFormat = "video" | "article" | "material";

/** Общие поля для карточки */
type KnowledgePreviewBase = {
  id: string;
  title: string;
  tab: KnowledgeTab;
  slug: string;
  date: string; // ISO: YYYY-MM-DD

  // Для карточки. Если пока одна обложка — всё равно поле полезно.
  coverSrc: string;

  // Тизер (если хочешь показывать позже)
  description?: string;
};

/** Видео в списке */
export type KnowledgeVideoPreview = KnowledgePreviewBase & {
  format: "video";
  duration: string; // обязательно для видео
};

/** Видео отедльная страница где плеер */
export type KnowledgeVideoDetail = KnowledgeVideoPreview & {
  embedUrl: string; // URL плеера (vk video_ext.php...), обязателен
  externalUrl?: string; // ссылка “открыть в VK”, запасной вариант
};

/** Статья в списке */
export type KnowledgeArticlePreview = KnowledgePreviewBase & {
  format: "article";
  readTime: string; // обязательно для статей
};

/** Материал в списке (ссылки/подборка) */
export type KnowledgeMaterialPreview = KnowledgePreviewBase & {
  format: "material";
  // Можно без времени. Если хочешь — добавим label.
  label?: string; // например "Подборка" / "Ссылки"
};

export type KnowledgeItemPreview = KnowledgeVideoPreview | KnowledgeArticlePreview | KnowledgeMaterialPreview;

export type KnowledgeItemDetail = KnowledgeVideoDetail;
