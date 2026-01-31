/* ============================================================
   Доменные перечисления
============================================================ */

/** Категории контента в разделе "Знания" */
export type KnowledgeTab = "techniques" | "education" | "podcasts" | "industry" | "resources";

/** Форматы материалов */
export type KnowledgeFormat = "video" | "article" | "material";

/* ============================================================
   Базовая модель превью (карточки в списке)
============================================================ */

/** Общие поля для всех элементов в списках */
type KnowledgePreviewBase = {
  id: string;
  title: string;
  slug: string;

  /** Категория */
  tab: KnowledgeTab;

  /** Формат контента */
  format: KnowledgeFormat;

  /** Дата публикации (ISO: YYYY-MM-DD) */
  date: string;

  /** Обложка карточки */
  coverSrc: string;

  /** Короткое описание/тизер */
  description?: string;
};

/* ============================================================
   Preview-типы по форматам
============================================================ */

/** Видео (карточка в списке) */
export type KnowledgeVideoPreview = KnowledgePreviewBase & {
  format: "video";

  /** Длительность видео (как отображается в UI) */
  duration: string;
};

/** Статья (карточка в списке) */
export type KnowledgeArticlePreview = KnowledgePreviewBase & {
  format: "article";

  /** Время чтения */
  readTime: string;
};

/** Материал/подборка (карточка в списке) */
export type KnowledgeMaterialPreview = KnowledgePreviewBase & {
  format: "material";

  /** Опциональный бейдж (например "Подборка") */
  label?: string;
};

/* ============================================================
   Блоки контента статьи
============================================================ */

/** Контент статьи хранится блоками */

export type KnowledgeArticleBlock =
  | {
      /** Заголовок секции внутри статьи */
      type: "heading";
      /** Уровень заголовка (h2 | h3) */
      level: 2 | 3;
      content: string;
    }
  | {
      /** Абзац текста (может содержать переносы строк через \n) */
      type: "text";
      content: string;
    }
  | {
      /** Изображение внутри статьи */
      type: "image";
      src: string;

      /** alt для доступности (если нет — считаем изображение декоративным) */
      alt?: string;

      /** Подпись под изображением (рендерим через figcaption) */
      caption?: string;
    }
  | {
      /** Список (для ингредиентов/шагов/чеклистов) */
      type: "list";

      /** Элементы списка — без разметки, просто строки */
      items: string[];

      /** true = <ol>, false/undefined = <ul> */
      ordered?: boolean;
    };

/* ============================================================
   Detail-типы (детальные страницы)
============================================================ */

/** Видео — детальная страница */
export type KnowledgeVideoDetail = KnowledgeVideoPreview & {
  /** Встраиваемый плеер */
  embedUrl: string;

  /** Внешняя ссылка (опционально) */
  externalUrl?: string;
};

/** Статья — детальная страница */
export type KnowledgeArticleDetail = KnowledgeArticlePreview & {
  /** Полный контент статьи блоками */
  blocks: KnowledgeArticleBlock[];
};

/* ============================================================
   Union-типы
============================================================ */

/** Любой элемент для списков */
export type KnowledgeItemPreview = KnowledgeVideoPreview | KnowledgeArticlePreview | KnowledgeMaterialPreview;

/**
 * Детальные данные.
 */
export type KnowledgeItemDetail = KnowledgeVideoDetail | KnowledgeArticleDetail;
