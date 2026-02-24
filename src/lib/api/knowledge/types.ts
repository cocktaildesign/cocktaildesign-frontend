// src/lib/api/knowledge/types.ts
// ============================================================================
// Типы для knowledge.
// Два слоя:
// 1) Strapi-типы — как реально приходит из CMS (то, что возвращает API Strapi)
// 2) Public-типы — то, что удобно использовать на страницах/в UI (нормализованное)
// ============================================================================

// ---------------------------------------------------------------------------
// 1) Strapi types (внутренние)
// ---------------------------------------------------------------------------

// Медиа-файл Strapi (упрощённо: нам достаточно url + базовых мета-полей).
// Важно: url в Strapi обычно относительный ("/uploads/..."), абсолютный делаем отдельно.
export type StrapiMediaFile = {
  url: string;

  // Эти поля часто есть у медиа в Strapi, но могут быть пустыми
  alternativeText?: string | null;
  caption?: string | null;

  // Размеры могут не приходить или быть null — поэтому optional + null
  width?: number | null;
  height?: number | null;
};

// Заголовок: blocks.heading-block
export type StrapiHeadingBlock = {
  __component: "blocks.heading-block";
  id: number;

  // Текст заголовка
  content: string;

  // Ограничиваемся тем, что реально рендерим в UI
  level: "h2" | "h3";
};

// Текст: blocks.text-block
export type StrapiTextBlock = {
  __component: "blocks.text-block";
  id: number;

  // Текст абзаца (как есть из CMS)
  content: string;
};

// Картинка: blocks.image-block
export type StrapiImageBlock = {
  __component: "blocks.image-block";
  id: number;

  // alt/caption могут быть не заполнены в CMS
  alt: string | null;
  caption: string | null;

  // В Strapi media нужно "populate", иначе image будет отсутствовать.
  // Поэтому тут optional + null — это нормальное состояние данных из CMS.
  image?: StrapiMediaFile | null;
};

// Ссылка: blocks.link-block
export type StrapiLinkBlock = {
  __component: "blocks.link-block";
  id: number;

  // Заголовок ссылки (обязателен в CMS)
  title: string;

  // URL (обязателен в CMS)
  url: string;

  // Описание может быть пустым
  description: string | null;
};

// Список: blocks.list-block
export type StrapiListBlock = {
  __component: "blocks.list-block";
  id: number;

  // В идеале это string[], но если CMS/данные “плавающие” — лучше принимать unknown[]
  // и уже в маппере приводить к string[] безопасно.
  items: unknown[];

  // В Strapi boolean обычно всегда приходит boolean.
  // Делаем non-optional, потому что UI ожидает конкретное значение.
  ordered: boolean;
};

// Union всех поддерживаемых блоков.
// Если добавляешь новый компонент в Strapi Dynamic Zone — добавь тип и включи в union.
export type StrapiBlock = StrapiHeadingBlock | StrapiTextBlock | StrapiImageBlock | StrapiLinkBlock | StrapiListBlock;

// Один элемент knowledge в виде "уплощённого" объекта (как у тебя реально приходит в JSON).
export type StrapiKnowledgeItem = {
  id: number;

  // Основные поля (как в админке)
  title: string;
  slug: string;

  // В Strapi это строки, UI потом нормализует
  tab: string;
  format: string;

  // Дата публикации (строка ISO или YYYY-MM-DD — у тебя YYYY-MM-DD)
  date: string;

  // Описание может быть пустым
  description: string | null;

  // Формат-специфичные поля (могут быть null)
  duration: string | null; // например: "12:34"
  readTime: string | null; // например: "7 мин чтения"
  label: string | null; // бейдж/лейбл

  // Видео/ссылки (могут быть null)
  embedUrl: string | null; // url для iframe / embed
  externalUrl: string | null; // внешняя ссылка (если нужна)

  // Обложка материала (media)
  // В Strapi это объект медиа, нужен populate[cover]
  cover: StrapiMediaFile | null;

  // Контент (Dynamic Zone): нужен populate для image внутри image-block
  blocks?: StrapiBlock[] | null;
};

// Ответ списка (collection-type)
export type StrapiKnowledgeListResponse = {
  data: StrapiKnowledgeItem[];
};

// ---------------------------------------------------------------------------
// 2) Public types (то, что удобно для страниц / компонентов)
// ---------------------------------------------------------------------------

// Tab — доменный тип (одинаков для article / video / material).
// Держим в lib/api, чтобы не зависеть от app/.
export type KnowledgeTab = "techniques" | "education" | "podcasts" | "industry" | "resources";

// Публичные блоки контента — то, что рендерит UI.
// Это НЕ Strapi-типы. Это нормализованная форма после маппера.
export type KnowledgeContentBlock =
  | {
      // Заголовок
      id: string;
      type: "heading";
      level: 2 | 3;
      content: string;
    }
  | {
      // Текст
      id: string;
      type: "text";
      content: string;
    }
  | {
      // Список
      id: string;
      type: "list";
      ordered: boolean;
      items: string[];
    }
  | {
      // Картинка
      id: string;
      type: "image";
      src: string;
      alt?: string;
      caption?: string;
    }
  | {
      // Ссылка
      id: string;
      type: "link";
      title: string;
      url: string;
      description?: string;
    };

// Деталка видео: минимум того, что нужно странице видео.
export type KnowledgeVideoDetail = {
  id: string;
  title: string;
  slug: string;
  format: "video";
  date: string;
  description?: string;

  // Для видео embedUrl обязателен (страница без него не работает)
  embedUrl: string;

  // Внешняя ссылка опциональна (если нужна кнопка "Смотреть на YouTube" и т.п.)
  externalUrl?: string;
};

// Деталка статьи: по смыслу как материал, но format = "article" + readTime.
export type KnowledgeArticleDetail = {
  id: string;
  title: string;
  slug: string;

  tab: KnowledgeTab;
  format: "article";

  date: string;
  description?: string;

  coverSrc: string;
  readTime: string;

  blocks: KnowledgeContentBlock[];
};

// Деталка материала: по структуре как статья, но format = "material" + label (опционально).
// Важно: ссылки внутри материалов лучше хранить именно в blocks (link-block),
// а не в externalUrl на уровне айтема (externalUrl можно использовать только если есть реальная нужда).
export type KnowledgeMaterialDetail = {
  id: string;
  title: string;
  slug: string;

  tab: KnowledgeTab;
  format: "material";

  date: string;
  description?: string;

  coverSrc: string;
  label?: string;

  blocks: KnowledgeContentBlock[];
};
