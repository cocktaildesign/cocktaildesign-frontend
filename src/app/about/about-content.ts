/** Editorial content for /about. Replacement instructions: docs/ABOUT_PAGE_MEDIA.md. */
export type AboutPhoto = {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  isDemo: boolean;
  requiresReplacement: boolean;
  publicationApproved: boolean;
};

export const ownProductsUrl = "/catalog/collection/nashe-proizvodstvo";
export const aboutMedia: {
  hero: AboutPhoto;
  workshop: AboutPhoto;
  founder: AboutPhoto;
  earlyTool: AboutPhoto;
  team: AboutPhoto | null;
  video: { src: string; title: string; captionsSrc?: string } | null;
} = {
  hero: {
    src: "/images/about/hero-demo-960.webp",
    srcSet: "/images/about/hero-demo-640.webp 640w, /images/about/hero-demo-960.webp 960w, /images/about/hero-demo-1440.webp 1440w",
    width: 1440, height: 1080,
    alt: "Иллюстрация для макета: работа над металлическим барным инструментом",
    caption: "Иллюстрация для макета · заменим фотографией мастерской",
    isDemo: true, requiresReplacement: true, publicationApproved: false,
  },
  workshop: {
    src: "/images/about/workshop-demo-1440.webp",
    srcSet: "/images/about/workshop-demo-640.webp 640w, /images/about/workshop-demo-960.webp 960w, /images/about/workshop-demo-1440.webp 1440w",
    width: 1440, height: 683,
    alt: "Иллюстрация для макета: инструменты и детали на рабочем столе",
    caption: "Иллюстрация для макета · здесь будет фото или видео производства",
    isDemo: true, requiresReplacement: true, publicationApproved: false,
  },
  founder: {
    src: "/images/about/founder-640.webp", width: 640, height: 457,
    alt: "Дмитрий Кравец, основатель Cocktail Design",
    caption: "Архивное фото · Inshaker",
    isDemo: false, requiresReplacement: false, publicationApproved: false,
  },
  earlyTool: {
    src: "/images/about/early-tool-960.webp", width: 960, height: 640,
    alt: "Геометрические стрейнеры Cocktail Design из архивного интервью",
    caption: "Инструменты Cocktail Design · архив Inshaker, 2019",
    isDemo: false, requiresReplacement: false, publicationApproved: false,
  },
  team: null,
  // A local MP4/WebM and optional WebVTT captions enable the native player.
  // Until a real video is ready, the workshop remains an ordinary photo.
  video: null,
};

export const timeline = [
  { year: "2015", title: "От идеи к первому инструменту", text: "Опыт работы за баром становится отправной точкой для собственных разработок." },
  { year: "2016", title: "Запуск Cocktail Design", text: "Первые продажи и начало истории нашей марки." },
  { year: "2017", title: "Награда Barproof", text: "Лучший бар-крафтсмен, российская категория.", source: "Time Out", href: "https://www.timeout.ru/spb/feature/472543" },
  { year: "2019", title: "Награда Barproof", text: "Best bar craftsman.", source: "Restoran.ru", href: "https://spb.restoran.ru/spb/news/restoransnewsspb/itogi-barproof-awards-2019/" },
  { year: "Сегодня", title: "Свои изделия и ваши идеи", text: "Барные инструменты, гравировка, клише и индивидуальные проекты." },
] as const;

export const publications = [
  {
    publisher: "Inshaker", year: "2019", kind: "Интервью",
    title: "От работы за баром — к своему производству",
    description: "Дмитрий Кравец о первых инструментах и истории Cocktail Design.",
    label: "Читать интервью",
    href: "https://ru.inshaker.com/trends/novosti/rabota-rukami-cocktail-design-i-ih-barnyy-inventar",
  },
  {
    publisher: "WHERE2DRINK", year: "2023", kind: "Партнёрский материал",
    title: "Инструменты с вашим характером",
    description: "Собственные изделия, гравировка и работа над индивидуальными заказами.",
    label: "Читать материал",
    href: "https://where2drink.ru/news/partners/vsye-dlya-bara-kastomizatsiya-ot-cocktail-design/",
  },
  {
    publisher: "Подкаст Дринкхакера", year: "2019", kind: "Подкаст · выпуск № 2",
    title: "Cocktail Design и барные идеи",
    description: "Разговор с Дмитрием Кравцом о создании инструментов и визуализации коктейлей.",
    label: "Найти выпуск в архиве",
    href: "https://podcastrepublic.net/podcast/1460457228",
  },
  {
    publisher: "Long Tongue at the Bar", year: "", kind: "Анонс подкаста · выпуск № 2",
    title: "Бизнес за пределами барной стойки",
    description: "Разговор о том, чем можно заняться в барной индустрии, кроме открытия заведений.",
    label: "Открыть анонс",
    href: "https://t.me/bar_hub/71",
  },
] as const;
