// frontend/src/app/knowledge/data.ts

import type {
  KnowledgeItemPreview,
  KnowledgeVideoDetail,
  KnowledgeArticleDetail,
  KnowledgeMaterialDetail,
} from "./types";

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

/* ============================================================
   ДАННЫЕ ДЛЯ СТРАНИЦЫ ВИДЕО (VIDEO)
============================================================ */

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
    description: `В этом видео разбираем базовую математику коктейлей. Узнаете про соотношение 2:1:0.5, которое лежит в основе 80% классических коктейлей.

		🍸 О чём видео:
		• История формулы Sour
		• Почему это работает
		• Как применить к своим рецептам
		• Примеры известных коктейлей

		📚 Рекомендуемые книги:
		"The Joy of Mixology" — Gary Regan
		"Liquid Intelligence" — Dave Arnold

❓ Вопросы? Пишите в комментариях!`,
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
    description: `🎬 СПОНСОР: Этот видео создано при поддержке БУТЫЛКОМАН — магазин премиум спиритов и инструментов для барменов. Используйте код COCKTAIL20 для скидки 20% на первый заказ.

Сегодня показываю самый простой способ фэт-вошинга, который я знаю. За 5 минут видео вы научитесь делать это дома без специального оборудования.

Что вам понадобится:
✓ Сливочное масло или любое другое масло
✓ Спирт (водка, виски, что угодно)
✓ Марля
✓ Морозилка

ВНИМАНИЕ! Этот способ работает ТОЛЬКО если вы будете точно следовать инструкции. Я уже 3 года использую эту технику в своем баре.

Спасибо за просмотр! 🙏`,
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
    description: `Большое видео про лёд — почему это важнее, чем вы думаете.

Я потратил 2 недели на экспериментирование с разными видами льда для этого видео. Результаты удивили даже меня.

⏱️ Временные метки:
0:00 — Введение
1:20 — Почему лёд важен
3:45 — Куб vs колотый
6:30 — Сферический лёд (это дорого?)
9:15 — Мой рейтинг типов льда
12:00 — Как делать лёд дома
15:00 — Финальные советы

📌 ВАЖНО: В конце видео я даю 3 бесплатных шаблона для расчёта охлаждения. Скачивайте в beschreibung ссылке.

ТАКЖЕ СМОТРИТЕ:
▶ Предыдущее видео про шейк
▶ Мой плейлист про инструменты

Подписывайтесь и включайте уведомления!`,
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
    description: `🍹 ФИНАЛЬНО раскрываю правду про шейк и стир. Это видео должно было выйти полгода назад, но я хотел собрать все источники и мнения экспертов.

Вот что вас ждёт:
• Почему Бонд (James Bond) неправ
• Метод, который используют в лучших барах мира
• Как это работает научно
• Живые примеры с классическими коктейлями
• Частые ошибки, которые делают все

🔗 Источники:
1. Interview с главным барменом Savoy (London)
2. Исследование 2023 про аэрацию коктейлей
3. Моя личная база из 2000+ экспериментов

⭐ Бонус в конце видео: я показываю ошибку из предыдущего видео. Спасибо, кто заметил!

Если вам понравилось — поделитесь с друзьями, которые готовят дома. Они будут благодарны.`,
    embedUrl: "https://vk.com/video_ext.php?oid=-72675133&id=456239770&autoplay=0",
    externalUrl: "https://vk.com/video-72675133_456239770",
  },
};

export function getKnowledgeVideoDetailBySlug(slug: string): KnowledgeVideoDetail | null {
  return KNOWLEDGE_VIDEO_DETAILS_BY_SLUG[slug] ?? null;
}

/* ============================================================
   ДАННЫЕ ДЛЯ СТРАНИЦЫ СТАТЬИ (ARTICLE)
============================================================ */

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
        id: "b1",
        type: "heading",
        level: 2,
        content: "Две оси вкуса, которые определяют всё",
      },
      {
        id: "b2",
        type: "text",
        content:
          "Если вы готовите коктейли, забудьте о сложных формулах. Есть только два компонента, которые имеют значение: кислота и сладость. Всё остальное — детали.",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Кислота работает как лифт для вкуса — она поднимает ароматы, открывает ингредиенты, делает напиток живым. Сладость же — это миротворец, который сглаживает острые углы и гармонизирует горечь.",
      },
      {
        id: "b4",
        type: "image",
        src: "/test-cover2.png",
        alt: "Диаграмма баланса кислотности и сладости",
        caption: "Правильный баланс кислоты и сладости создаёт идеальный коктейль",
      },
      {
        id: "b5",
        type: "heading",
        level: 2,
        content: "Кислота: главный герой",
      },
      {
        id: "b6",
        type: "text",
        content:
          "Лимон, лайм, уксус, вермут — всё это кислотные компоненты. В хорошем коктейле кислота должна быть заметна, но не подавляющей. Вы должны чувствовать её, но она не должна доминировать.",
      },
      {
        id: "b7",
        type: "list",
        items: [
          "Свежий лимонный сок — 0.75 oz",
          "Свежий лаймовый сок — 0.5 oz",
          "Виноградный уксус — 0.25 oz",
          "Вермут — как регулятор кислотности",
        ],
      },
      {
        id: "b8",
        type: "text",
        content:
          "Правило номер один: всегда используйте СВЕЖИЙ сок. Если вы используете бутилированный сок, вы уже проиграли. Свежий сок содержит кислоту, которая правильно взаимодействует с алкоголем и другими компонентами.",
      },
      {
        id: "b9",
        type: "heading",
        level: 2,
        content: "Сладость: искусство баланса",
      },
      {
        id: "b10",
        type: "text",
        content:
          "Сироп, ликёры, фруктовые компоненты — всё это добавляет сладость. Но здесь главное не переборщить. Сладость не должна быть видна, она должна работать в фоне.",
      },
      {
        id: "b11",
        type: "text",
        content:
          "Классический подход: если вы добавляете 0.75 oz кислоты, добавляйте 0.5 oz сладости. Это создаёт естественный баланс, при котором ни один компонент не доминирует.",
      },
      {
        id: "b12",
        type: "heading",
        level: 2,
        content: "Практическая проверка",
      },
      {
        id: "b13",
        type: "text",
        content:
          "Самый простой способ проверить баланс — это микровкус. Смешайте компоненты в одну ложку и попробуйте. Вы должны почувствовать полноту вкуса, а не только кислоту или только сладость.",
      },
      {
        id: "b14",
        type: "text",
        content:
          "Если напиток слишком кислый — добавьте сиропа. Если слишком сладкий — добавьте сока. Это займёт 30 секунд, но результат будет идеальным.",
      },
    ],
  },

  "basic-bar-tools": {
    id: "k5",
    title: "Статья: базовый набор барного инвентаря",
    tab: "industry",
    format: "article",
    slug: "basic-bar-tools",
    date: "2026-01-20",
    coverSrc: "/test-cover.png",
    readTime: "10 минут",
    description: "Подробный разбор базового набора барного инвентаря для дома и профессионального бара.",

    blocks: [
      {
        id: "b1",
        type: "heading",
        level: 2,
        content: "С чего начать: 5 инструментов для дома",
      },
      {
        id: "b2",
        type: "text",
        content:
          "Вам не нужны 50 предметов, чтобы готовить отличные коктейли дома. Начните с этих пяти, и вы сможете делать 95% классических напитков.",
      },
      {
        id: "b3",
        type: "heading",
        level: 3,
        content: "1. Boston Shaker (двухчастный шейкер)",
      },
      {
        id: "b4",
        type: "text",
        content:
          "Это два стакана, которые вместе образуют шейкер. Не берите красивые, берите функциональные. Стеклянная часть и металлическая часть должны плотно прилегать друг к другу.",
      },
      {
        id: "b5",
        type: "text",
        content: "Цена: от 500 до 2000 рублей. Не переплачивайте за бренд, переплачивайте за качество.",
      },
      {
        id: "b6",
        type: "heading",
        level: 3,
        content: "2. Джиггер (мерный стакан)",
      },
      {
        id: "b7",
        type: "text",
        content:
          "Два стакана в одном инструменте: 25 ml с одной стороны, 50 ml с другой. Это гарантирует консистентность. Используйте его ДЛЯ КАЖДОГО КОКТЕЙЛЯ.",
      },
      {
        id: "b8",
        type: "heading",
        level: 3,
        content: "3. Bar Spoon (ложка для размешивания)",
      },
      {
        id: "b9",
        type: "text",
        content:
          "Длинная ложка с утяжелённой ручкой. Она нужна для стирования коктейлей (размешивания в mixing glass). Не экономьте на этом — хорошая ложка прослужит 10 лет.",
      },
      {
        id: "b10",
        type: "heading",
        level: 3,
        content: "4. Strainer (ситечко)",
      },
      {
        id: "b11",
        type: "text",
        content:
          "Есть два типа: Hawthorne (с пружинкой) и Julep (простое). Hawthorne универсален и работает со всеми шейкерами. Julep более элегантен, но требует мастерства.",
      },
      {
        id: "b12",
        type: "heading",
        level: 3,
        content: "5. Muddler (толкушка)",
      },
      {
        id: "b13",
        type: "text",
        content:
          "Для размешивания мяты, имбиря и других ингредиентов. Деревянный муддлер лучше, чем пластиковый, потому что не повреждает стекло.",
      },
      {
        id: "b14",
        type: "heading",
        level: 2,
        content: "Что добавить потом",
      },
      {
        id: "b15",
        type: "text",
        content:
          "Когда вы освоитесь с основными пятью инструментами, вы сможете добавить: лёдный совок, ножницы для лимона, воронку, bottle opener. Но это не критично.",
      },
      {
        id: "b16",
        type: "heading",
        level: 2,
        content: "Где покупать",
      },
      {
        id: "b17",
        type: "text",
        content:
          "AliExpress (долго, но дёшево), специализированные магазины барного инвентаря (быстро, дороговато), Wildberries и Ozon (средняя цена, быстрая доставка).",
      },
      {
        id: "b18",
        type: "text",
        content:
          "Совет: купите один хороший набор вместо пяти плохих. Инвестиция в качество окупается за первый месяц использования.",
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
        id: "b1",
        type: "image",
        src: "/test-cover3.png",
        alt: "Силиконовые формы для декорирования коктейлей",
        caption: "Современные формы позволяют создавать сложные украшения за минуты",
      },
      {
        id: "b2",
        type: "heading",
        level: 2,
        content: "Когда искусство встречается с технологией",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Десять лет назад декорирование коктейля была чистой ручной работой. Сегодня это сочетание техники и мастерства. Силиконовые формы — ключ к этой эволюции.",
      },
      {
        id: "b4",
        type: "heading",
        level: 2,
        content: "Почему именно силикон?",
      },
      {
        id: "b5",
        type: "text",
        content:
          "Силикон нейтрален по вкусу, не впитывает влагу, не реагирует с кислотами и спиртом. Это означает, что вы можете создавать украшения из любых компонентов: от замороженных соков до желе и мусса.",
      },
      {
        id: "b6",
        type: "heading",
        level: 2,
        content: "Какие формы выбрать?",
      },
      {
        id: "b7",
        type: "text",
        content:
          "Начните с простых: кубики льда, сферы, трубочки. Затем переходите к сложным формам: листья, цветы, геометрические фигуры. Чем проще форма, тем больше вариантов использования.",
      },
      {
        id: "b8",
        type: "heading",
        level: 2,
        content: "Техники заполнения",
      },
      {
        id: "b9",
        type: "heading",
        level: 3,
        content: "Методом слоёв",
      },
      {
        id: "b10",
        type: "text",
        content:
          "Наливаете разные соки или сиропы слоями, позволяя каждому слою замёрзнуть перед добавлением следующего. Результат — красивые полосы в украшении.",
      },
      {
        id: "b11",
        type: "heading",
        level: 3,
        content: "Методом инъекции",
      },
      {
        id: "b12",
        type: "text",
        content:
          "Заполняете форму одной основой (например, льдом), потом впрыскиваете цветной компонент шприцем. Это создаёт эффект мраморной текстуры.",
      },
      {
        id: "b13",
        type: "heading",
        level: 3,
        content: "Методом замораживания",
      },
      {
        id: "b14",
        type: "text",
        content:
          "Помещаете форму в морозилку сразу со всеми компонентами. Самый простой способ, но даёт меньше контроля над результатом.",
      },
      {
        id: "b15",
        type: "heading",
        level: 2,
        content: "Практические рецепты",
      },
      {
        id: "b16",
        type: "heading",
        level: 3,
        content: "Апельсиновый лёд",
      },
      {
        id: "b17",
        type: "list",
        items: ["Свежевыжатый апельсиновый сок — 150 ml", "Агар-агар — 2 г", "Сахар — 10 г"],
      },
      {
        id: "b18",
        type: "text",
        content:
          "Нагрейте сок, добавьте агар и сахар, дайте закипеть. Разлейте в формы и заморозьте 2 часа. Результат: прозрачный апельсиновый куб с естественным вкусом.",
      },
      {
        id: "b19",
        type: "heading",
        level: 3,
        content: "Ягодный гель",
      },
      {
        id: "b20",
        type: "list",
        items: ["Пюре малины — 100 g", "Желатин — 3 g", "Лимонный сок — 15 ml", "Сахар — 20 g"],
      },
      {
        id: "b21",
        type: "text",
        content:
          "Размочите желатин, подогрейте пюре с лимоном, добавьте желатин и сахар. Залейте в сферические формы и охладите 4 часа. Получится элегантное украшение с интенсивным ягодным вкусом.",
      },
      {
        id: "b22",
        type: "heading",
        level: 2,
        content: "Хранение и сроки",
      },
      {
        id: "b23",
        type: "text",
        content:
          "Украшения из силиконовых форм хранятся в морозилке до 2 недель в герметичном контейнере. Если вы добавляли алкоголь — они могут храниться дольше благодаря консервирующему эффекту.",
      },
    ],
  },
};

export function getKnowledgeArticleDetailBySlug(slug: string): KnowledgeArticleDetail | null {
  return KNOWLEDGE_ARTICLE_DETAILS_BY_SLUG[slug] ?? null;
}

/* ============================================================
   ДАННЫЕ ДЛЯ СТРАНИЦЫ МАТЕРИАЛОВ (material)
============================================================ */

const KNOWLEDGE_MATERIAL_DETAILS_BY_SLUG: Record<string, KnowledgeMaterialDetail> = {
  "bartender-resources": {
    id: "k7",
    title: "Подборка полезных ресурсов для барменов",
    tab: "resources",
    format: "material",
    slug: "bartender-resources",
    date: "2026-01-25",
    coverSrc: "/test-cover.png",
    description: "Ссылки на книги, курсы и полезные сайты по миксологии.",

    blocks: [
      {
        id: "m1",
        type: "heading",
        level: 2,
        content: "Обязательные книги",
      },
      {
        id: "m2",
        type: "link",
        title: "The Bar Book — Jeffrey Morgenthaler",
        url: "https://www.jeffreymorgenthaler.com/the-bar-book/",
        description:
          "Библия барменского мастерства. Техника, баланс, философия работы за стойкой. Если вы прочитаете только одну книгу — пусть это будет эта.",
      },
      {
        id: "m3",
        type: "link",
        title: "Liquid Intelligence — Dave Arnold",
        url: "https://www.davearnold.net/",
        description:
          "Наука коктейлей. Для тех, кто хочет понять, почему всё работает именно так, а не иначе. Сложная, но стоит каждой страницы.",
      },
      {
        id: "m4",
        type: "link",
        title: "The Joy of Mixology — Gary Regan",
        url: "https://www.garyregancocktails.com/",
        description:
          "История коктейльной культуры + 100 классических рецептов. Идеально для понимания эволюции барменства.",
      },
      {
        id: "m5",
        type: "link",
        title: "Imbibe! — David Wondrich",
        url: "https://www.davidwondrich.com/",
        description: "Историческая справка о происхождении коктейлей. Если вам нравится история — это ваша книга.",
      },

      {
        id: "m6",
        type: "heading",
        level: 2,
        content: "Сайты и базы рецептов",
      },
      {
        id: "m7",
        type: "link",
        title: "Difford's Guide",
        url: "https://www.diffordsguide.com/",
        description:
          "Самая большая база коктейлей в интернете. 15000+ рецептов, подробные статьи по технике, ингредиентам и истории. Платный доступ, но стоит денег.",
      },
      {
        id: "m8",
        type: "link",
        title: "Liquor.com",
        url: "https://www.liquor.com/",
        description: "Рецепты, тренды, статьи от проф барменов. Хороший контент, бесплатно, на английском.",
      },
      {
        id: "m9",
        type: "link",
        title: "The Spruce Eats — Cocktail Recipes",
        url: "https://www.thespruceeats.com/",
        description: "Простые и понятные рецепты для дома. Хорошие фото, пошаговые инструкции.",
      },
      {
        id: "m10",
        type: "link",
        title: "Serious Eats — Cocktails",
        url: "https://www.seriouseats.com/",
        description: "Научный подход к рецептам. Объяснение каждого компонента и его функции в коктейле.",
      },

      {
        id: "m11",
        type: "heading",
        level: 2,
        content: "Официальные стандарты",
      },
      {
        id: "m12",
        type: "link",
        title: "IBA (International Bartenders Association)",
        url: "https://iba-world.com/",
        description:
          "Официальный список коктейлей IBA и правила приготовления. Если вы изучаете классику — начните отсюда.",
      },
      {
        id: "m13",
        type: "link",
        title: "USBA (United States Bartenders Association)",
        url: "https://www.usbartenders.org/",
        description: "Американский стандарт. Немного отличается от IBA, но оба валидны.",
      },

      {
        id: "m14",
        type: "heading",
        level: 2,
        content: "Онлайн-курсы и обучение",
      },
      {
        id: "m15",
        type: "link",
        title: "Mixology Masterclass — Skillshare",
        url: "https://www.skillshare.com/",
        description:
          "Видео-курсы от профессиональных барменов. Платформа работает по подписке. Качество контента высокое.",
      },
      {
        id: "m16",
        type: "link",
        title: "The Cocktail Guide — Udemy",
        url: "https://www.udemy.com/",
        description: "Множество курсов от новичка до профессионала. Дешёво, когда на распродаже.",
      },
      {
        id: "m17",
        type: "link",
        title: "Barrel Proof — YouTube",
        url: "https://www.youtube.com/",
        description: "Канал про виски и коктейли. Бесплатно, хорошее качество съёмки, советы от экспертов.",
      },

      {
        id: "m18",
        type: "heading",
        level: 2,
        content: "Инструменты и софт",
      },
      {
        id: "m19",
        type: "link",
        title: "Cocktail Flow — приложение для iOS",
        url: "https://apps.apple.com/",
        description: "Учит правильной технике шейка и стира через видео. Есть таймер и подсказки.",
      },
      {
        id: "m20",
        type: "link",
        title: "Negroni Recipe App",
        url: "https://apps.apple.com/",
        description: "Более 2000 рецептов, поиск по ингредиентам, сохранение избранных.",
      },
      {
        id: "m21",
        type: "link",
        title: "DrinkPal — Android приложение",
        url: "https://play.google.com/",
        description: "Универсальное приложение с рецептами, техниками и таймерами для приготовления.",
      },

      {
        id: "m22",
        type: "heading",
        level: 2,
        content: "Инстаграм и социальные сети",
      },
      {
        id: "m23",
        type: "link",
        title: "@jeffmorgenthaler на Instagram",
        url: "https://www.instagram.com/",
        description: "Легендарный бармен из Portland. Регулярные советы, новые идеи, взгляд за кулисы.",
      },
      {
        id: "m24",
        type: "link",
        title: "@drinksmagazine на Instagram",
        url: "https://www.instagram.com/",
        description: "Лучшие коктейли со всего мира. Вдохновение для новых рецептов.",
      },
      {
        id: "m25",
        type: "link",
        title: "@cocktailstagram на Instagram",
        url: "https://www.instagram.com/",
        description: "Ежедневная подборка лучших коктейльных фото и идей от комьюнити.",
      },

      {
        id: "m26",
        type: "heading",
        level: 2,
        content: "Совет новичку",
      },
      {
        id: "m27",
        type: "text",
        content:
          "Не пытайтесь освоить всё сразу. Начните с The Bar Book, затем выберите 3-4 ресурса, которые вам нравятся, и углубляйтесь в них. Практика важнее теории — готовьте, экспериментируйте, ошибайтесь и учитесь.",
      },
    ],
  },
};

export function getKnowledgeMaterialDetailBySlug(slug: string): KnowledgeMaterialDetail | null {
  return KNOWLEDGE_MATERIAL_DETAILS_BY_SLUG[slug] ?? null;
}
