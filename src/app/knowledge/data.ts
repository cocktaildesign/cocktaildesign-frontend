// frontend/src/app/knowledge/data.ts

import type { KnowledgeItemPreview, KnowledgeVideoDetail, KnowledgeArticleDetail } from "./types";

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

  {
    id: "k8",
    title: "Силиконовые формы: будущее декорирования",
    tab: "techniques",
    format: "article",
    slug: "silicone-molds-future",
    date: "2026-01-30",
    coverSrc: "/test-cover3.png",
    readTime: "8 мин чтения",
    description:
      "Силиконовые формы как технология, которая закрепляется в профессиональном декорировании — в баре и на кухне.",
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
    description: `Содержание лекции и таймкоды:
		00:03 Введение в премию 50 Best Bars
		• Самая обсуждаемая премия в мире баров.
		• Это своеобразный "Оскар" среди баров.
		• Рейтинг появился в 2009 году, но сама премия существует с 2002 года.

		01:00 Структура премии и голосование
		• Принадлежит медиахолдингу William Reed Business Media.
		• Голосование проходит анонимно среди 700 экспертов.


		*Meta Platforms Inc. признана экстремистской, её продукты запрещены на территории РФ`,

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

// ДАННЫЕ ДЛЯ СТРАНИЦЫ СТАТЬИ!

const KNOWLEDGE_ARTICLE_DETAILS_BY_SLUG: Record<string, KnowledgeArticleDetail> = {
  "acidity-sweetness-basics": {
    id: "k3",
    title: "Теория: кислотность и сладость в коктейлях",
    tab: "education",
    format: "article",
    slug: "acidity-sweetness-basics",
    date: "2026-01-15",
    coverSrc: "/test-cover2.png",
    readTime: "7 мин чтения",
    description: "Как кислотность и сладость влияют на вкус коктейля и как находить баланс.",

    blocks: [
      {
        type: "heading",
        level: 2,
        content: "База баланса: кислота и сладость",
      },
      {
        type: "text",
        content:
          'Кислотность и сладость — базовая ось баланса вкуса. В коктейлях они работают парой: кислота "поднимает" вкус, сладость сглаживает углы.',
      },
      {
        type: "text",
        content:
          "Практическое правило: сначала выстраиваем кислотность (цитрус/кислотный компонент), затем добираем сладость сиропом, корректируя по 5–10 мл.",
      },
      {
        type: "image",
        src: "/test-cover2.png",
        alt: "Иллюстрация к теме кислотности и сладости",
        caption: "Кислота и сладость — ключевая пара баланса вкуса",
      },
      {
        type: "text",
        content:
          'Дальше можно учитывать крепость и горечь, но без стабильной пары "кислота-сладость" коктейль почти всегда будет плоским или резким.',
      },
    ],
  },

  "silicone-molds-future": {
    id: "k8",
    title: "Силиконовые формы: будущее декорирования",
    tab: "techniques",
    format: "article",
    slug: "silicone-molds-future",
    date: "2026-01-30",
    coverSrc: "/test-cover3.png",
    readTime: "8 мин чтения",
    description:
      "Силиконовые формы как технология, которая закрепляется в профессиональном декорировании — в баре и на кухне.",

    blocks: [
      {
        type: "image",
        src: "/test-cover3.png",
        alt: "Силиконовые формы: пример декорирования",
        caption: "Силиконовые формы в профессиональном декорировании",
      },

      {
        type: "text",
        content: "Силиконовые формы: будущее декорирования и их роль в профессиональном барменском и кулинарном мире",
      },

      {
        type: "text",
        content:
          "Коллеги, приветствую вас в новом году! Как эксперт в сфере барменского искусства и инновационного декорирования, я рад поделиться наблюдениями и идеями, которые не только вдохновляют, но и открывают новые горизонты для профессионалов.",
      },

      /* ===================== Секция 1 ===================== */

      {
        type: "heading",
        level: 2,
        content: "История технологии: от льда до кулинарных шедевров",
      },
      {
        type: "text",
        content:
          "Идея силиконовых форм восходит к 1930-м годам, когда изобретатель Ллойд Коупман впервые разработал формы для создания ледяных украшений. С тех пор они стали неотъемлемой частью гастрономии, кондитерского искусства и миксологии.",
      },

      /* ===================== Секция 2 ===================== */

      {
        type: "heading",
        level: 2,
        content: "Простота и гениальность: минимализм в деталях",
      },
      {
        type: "text",
        content:
          "Часто сложные формы с замысловатым дизайном кажутся более привлекательными. Однако истинное мастерство проявляется в работе с простыми формами — геометрическими отверстиями, которые требуют большего контроля и навыков.",
      },

      {
        type: "image",
        src: "/test-cover4.png",
        alt: "Дополнительные рецепты для работы с формами",
        caption: "Рецепты и техники для работы с простыми формами",
      },

      /* ===================== Секция 3 ===================== */

      {
        type: "heading",
        level: 2,
        content: "Дополнительные рецепты для работы с простыми формами",
      },

      /* ---------- Рецепт 1 ---------- */

      {
        type: "heading",
        level: 3,
        content: "Чипс и гель из свёклы",
      },
      {
        type: "list",
        items: ["Варёная свёкла — 300 г", "Изомальт — 80 г", "Сироп глюкозы — 40 г", "Сахарная пудра — 25 г"],
      },
      {
        type: "text",
        content:
          "Инструкция:\nГорячую свёклу и ингредиенты пробиваем в блендере до пасты. Протираем через сито и даём отдохнуть 2 часа. Можно использовать как гель или дегидрировать при 60°C 12 часов.",
      },

      /* ---------- Рецепт 2 ---------- */

      {
        type: "heading",
        level: 3,
        content: "Чипс из смородины",
      },
      {
        type: "list",
        items: [
          "Пюре смородины — 175 г",
          "Ксантан — 4 г",
          "Изомальт — 30 г",
          "Сироп глюкозы — 7 г",
          "Сахарная пудра — 10 г",
        ],
      },
      {
        type: "text",
        content:
          "Инструкция:\nСмешать ингредиенты, довести до кипения, добавить ксантан. Распределить тонким слоем и запечь 4–5 минут при 165°C. Придать форму листа.",
      },

      /* ---------- Рецепт 3 ---------- */

      {
        type: "heading",
        level: 3,
        content: "Хрустящий брокколи-чипс",
      },
      {
        type: "list",
        items: ["Пюре брокколи — 200 г", "Изомальт — 60 г", "Сахарная пудра — 20 г", "Картофельный крахмал — 25 г"],
      },
      {
        type: "text",
        content:
          "Технология:\nСмешать всё до гладкости, тонко распределить и запекать 1 час 20 минут при 110–120°C. Пока пластично — придать форму.",
      },
    ],
  },
};

export function getKnowledgeArticleDetailBySlug(slug: string): KnowledgeArticleDetail | null {
  return KNOWLEDGE_ARTICLE_DETAILS_BY_SLUG[slug] ?? null;
}
