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

/** Контент статьи и материалосв хранится блоками */
export type KnowledgeArticleBlock =
  | {
      id: string; // уникальный идентификатор блока внутри статьи
      /** Заголовок секции внутри статьи */
      type: "heading";
      /** Уровень заголовка (h2 | h3) */
      level: 2 | 3;
      content: string;
    }
  | {
      id: string;
      /** Абзац текста (может содержать переносы строк через \n) */
      type: "text";
      content: string;
    }
  | {
      id: string;
      /** Изображение внутри статьи */
      type: "image";
      src: string;

      /** alt для доступности (если нет — считаем изображение декоративным) */
      alt?: string;
      /** Подпись под изображением (рендерим через figcaption) */
      caption?: string;
    }
  | {
      id: string;
      /** Список (для ингредиентов/шагов/чеклистов) */
      type: "list";
      /** Элементы списка — без разметки, просто строки */
      items: string[];
      /** true = <ol>, false/undefined = <ul> */
      ordered?: boolean;
    }
  | {
      id: string;
      /** Ссылка/ресурс (будет использоваться в material, но тип блоков общий) */
      type: "link";
      /** Название ссылки (что это за ресурс) */
      title: string;
      /** Адрес (лучше абсолютный: https://...) */
      url: string;
      /** Короткое описание (опционально) */
      description?: string;
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

/** Материал — детальная страница */
export type KnowledgeMaterialDetail = KnowledgeMaterialPreview & {
  /** Полный контент материала блоками (как у статьи) */
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
export type KnowledgeItemDetail = KnowledgeVideoDetail | KnowledgeArticleDetail | KnowledgeMaterialDetail;
