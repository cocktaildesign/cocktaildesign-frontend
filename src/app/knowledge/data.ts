// frontend/src/app/knowledge/data.ts

import type { KnowledgeItemPreview, KnowledgeVideoDetail } from "./types";

/**
 * Массив превью-элементов для страницы /knowledge
 * Здесь ТОЛЬКО данные для карточек (не детальный контент статьи/видео)
 */
const KNOWLEDGE_ITEMS: KnowledgeItemPreview[] = [
  {
    // ===== Видео =====
    id: "k1",
    title: "Лекция: формулы баланса вкуса",
    tab: "education",
    format: "video", // дискриминатор формата
    slug: "flavor-balance-formulas",

    date: "2026-01-10",

    // Обложка карточки (пока одна тестовая — потом будут реальные)
    coverSrc: "/test-cover.png",

    // Специфично для video
    duration: "2:43",

    description: "Разбираем базовые формулы баланса вкуса и то, как они применяются в коктейлях.",
  },

  {
    id: "k2",
    title: "Техника: быстрый фэт-вошинг дома",
    tab: "techniques",
    format: "video",
    slug: "fat-washing-fast",

    date: "2026-01-12",
    coverSrc: "/test-cover.png",

    duration: "5:23",

    description: "Показываем простой и быстрый способ фэт-вошинга без профессионального оборудования.",
  },

  {
    // ===== Статья =====
    id: "k3",
    title: "Теория: кислотность и сладость в коктейлях",
    tab: "education",
    format: "article",
    slug: "acidity-sweetness-basics",

    date: "2026-01-15",
    coverSrc: "/test-cover2.png",

    // Специфично для article
    readTime: "7 мин чтения",

    description: "Как кислотность и сладость влияют на вкус коктейля и как находить баланс.",
  },

  {
    id: "k4",
    title: "Видео: как выбирать лёд для разных напитков",
    tab: "techniques",
    format: "video",
    slug: "ice-selection-guide",

    date: "2026-01-18",
    coverSrc: "/test-cover.png",

    duration: "15:23",

    description: "Разбираем типы льда и объясняем, какой лёд подходит для разных коктейлей.",
  },

  {
    id: "k5",
    title: "Статья: базовый набор барного инвентаря",
    tab: "industry",
    format: "article",
    slug: "basic-bar-tools",

    date: "2026-01-20",
    coverSrc: "/test-cover.png",

    readTime: "10 минут",

    description: "Подробный разбор базового набора барного инвентаря для дома и профессионального бара.",
  },

  {
    id: "k6",
    title: "Лекция: шейк vs стир — когда и почему",
    tab: "education",
    format: "video",
    slug: "shake-vs-stir",

    date: "2026-01-22",
    coverSrc: "/test-cover.png",

    duration: "12 мин",

    description: "Разбираем разницу между шейком и стиром и объясняем, когда использовать каждый метод.",
  },

  // ===== Пример материала (тестово) =====
  {
    id: "k7",
    title: "Подборка полезных ресурсов для барменов",
    tab: "resources",
    format: "material",
    slug: "bartender-resources",

    date: "2026-01-25",
    coverSrc: "/test-cover.png",

    // для material нет duration/readTime — и это ок по типам
    description: "Ссылки на книги, курсы и полезные сайты по миксологии.",
  },
];
/**
 * Получить все элементы для списка
 */
export function getKnowledgeItems(): KnowledgeItemPreview[] {
  return KNOWLEDGE_ITEMS;
}

/**
 * Найти элемент по slug (для детальных страниц)
 */
export function getKnowledgeItemBySlug(slug: string): KnowledgeItemPreview | null {
  return KNOWLEDGE_ITEMS.find((item) => item.slug === slug) ?? null;
}

// ДАННЫЕ ДЛЯ ВИДЕО СТРАНИЦЫ!

const KNOWLEDGE_VIDEO_DETAILS_BY_SLUG: Record<string, KnowledgeVideoDetail> = {
  "flavor-balance-formulas": {
    id: "k1",
    title: "Лекция: формулы баланса вкуса",
    tab: "education",
    format: "video",
    slug: "flavor-balance-formulas",
    date: "2026-01-10",
    coverSrc: "/test-cover.png",
    duration: "2:43",
    description: "Разбираем базовые формулы баланса вкуса и то, как они применяются в коктейлях.",

    embedUrl: "https://vk.com/video_ext.php?oid=-72675133&id=456239770&autoplay=0",
    externalUrl: "https://vk.com/video-72675133_456239770",
  },

  "fat-washing-fast": {
    id: "k2",
    title: "Техника: быстрый фэт-вошинг дома",
    tab: "techniques",
    format: "video",
    slug: "fat-washing-fast",
    date: "2026-01-12",
    coverSrc: "/test-cover.png",
    duration: "5:23",
    description: "Показываем простой и быстрый способ фэт-вошинга без профессионального оборудования.",

    embedUrl: "https://vk.com/video_ext.php?oid=-72675133&id=456239770&autoplay=0",
    externalUrl: "https://vk.com/video-72675133_456239770",
  },

  "ice-selection-guide": {
    id: "k4",
    title: "Видео: как выбирать лёд для разных напитков",
    tab: "techniques",
    format: "video",
    slug: "ice-selection-guide",
    date: "2026-01-18",
    coverSrc: "/test-cover.png",
    duration: "15:23",
    description: "Разбираем типы льда и объясняем, какой лёд подходит для разных коктейлей.",

    embedUrl: "https://vk.com/video_ext.php?oid=-72675133&id=456239770&autoplay=0",
    externalUrl: "https://vk.com/video-72675133_456239770",
  },

  "shake-vs-stir": {
    id: "k6",
    title: "Лекция: шейк vs стир — когда и почему",
    tab: "education",
    format: "video",
    slug: "shake-vs-stir",
    date: "2026-01-22",
    coverSrc: "/test-cover.png",
    duration: "12 мин",
    description: "Разбираем разницу между шейком и стиром и объясняем, когда использовать каждый метод.",

    embedUrl: "https://vk.com/video_ext.php?oid=-72675133&id=456239770&autoplay=0",
    externalUrl: "https://vk.com/video-72675133_456239770",
  },
};

export function getKnowledgeVideoDetailBySlug(slug: string): KnowledgeVideoDetail | null {
  return KNOWLEDGE_VIDEO_DETAILS_BY_SLUG[slug] ?? null;
}
