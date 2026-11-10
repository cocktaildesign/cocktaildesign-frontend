/** Documentary photos and video. Sources/permissions: docs/ABOUT_PAGE_MEDIA.md. Local preview only. */
type ImageSource = { src: string; srcSet?: string; width: number; height: number };
export type AboutPhoto = ImageSource & {
  alt: string;
  caption: string;
  mobile?: ImageSource;
  isDemo: boolean;
  requiresReplacement: boolean;
  /** Permission to use the photo is separate from permission to publish the page. */
  publicationApproved: boolean;
};
export const ownProductsUrl = "/catalog/collection/nashe-proizvodstvo";
const base = "/images/about/archive";
function archive(key: string, widths: number[], width: number, height: number): ImageSource {
  return {
    src: `${base}/${key}-${width}.webp`, width, height,
    srcSet: widths.map(w => `${base}/${key}-${w}.webp ${w}w`).join(", "),
  };
}
const approved = { isDemo: false, requiresReplacement: false, publicationApproved: true };
export const aboutMedia = {
  hero: {
    src: "/images/about/current/finished-tools-1440.webp", width: 1440, height: 960,
    srcSet: [480, 800, 1440].map(w => `/images/about/current/finished-tools-${w}.webp ${w}w`).join(", "),
    isDemo: false, requiresReplacement: false, publicationApproved: false,
    alt: "Геометрический стрейнер Cocktail Design рядом с шейкерами и другими инструментами",
    caption: "Инструменты Cocktail Design · фото Inshaker",
  },
  homeWorkshop: {
    ...archive("home-workshop", [480, 800, 1200, 1600], 1600, 1067), ...approved,
    alt: "Работа над первым стрейнером под настольной лампой в квартире",
    caption: "Первое рабочее место — стол в квартире",
  },
  exhibition: {
    ...archive("first-exhibition", [480, 720], 720, 960), ...approved,
    alt: "У стола с первыми инструментами Cocktail Design на выставке",
    caption: "Moscow Bar Show · Санкт-Петербург, 2016",
  },
  packaging: {
    ...archive("first-packaging", [480, 720], 720, 960), ...approved,
    alt: "Первые стрейнеры Cocktail Design в деревянных коробках",
    caption: "Первая коллекция и её деревянные коробки",
  },
  award: {
    ...archive("award", [480, 800, 1200], 1200, 800), ...approved,
    alt: "Вручение премии Barproof: сцена и участники церемонии",
    caption: "Вручение Barproof · архив Cocktail Design. Фото: @alexsandrboev / Geometria",
  },
  team: {
    ...archive("team", [480, 800, 1200, 1600], 1600, 1067), ...approved,
    mobile: archive("team-portrait", [480, 800, 1200, 1600], 1600, 2400),
    alt: "Команда Cocktail Design на совместной фотографии",
    caption: "Команда Cocktail Design · из архива компании",
  },
} satisfies Record<string, AboutPhoto>;

// Owner-supplied video, not a production tour. No third-party embed loads with the page.
export type AboutVideoMedia = { href: string; title: string; poster: AboutPhoto; file?: string; captions?: string; durationLabel?: string };
export const aboutVideo: AboutVideoMedia = {
  href: "https://vk.ru/cocktail_design?z=video-72675133_456239330",
  title: "Эксклюзивный барный инвентарь",
  durationLabel: "23 секунды",
  file: "/videos/about/cocktail-design-film-720p.mp4",
  poster: {
    src: "/images/about/current/video-poster-1280.webp", width: 1280, height: 720,
    srcSet: [640, 1280].map(w => `/images/about/current/video-poster-${w}.webp ${w}w`).join(", "),
    ...approved,
    alt: "Узорный стрейнер — кадр из ролика Cocktail Design", caption: "",
  },
};
export const awards = [
  { year: "2017", title: "Barproof", text: "Лучший бар-крафтсмен · российская категория", source: "Результаты 2017", href: "https://www.timeout.ru/spb/feature/472543" },
  { year: "2019", title: "Barproof", text: "Best bar craftsman", source: "Результаты 2019", href: "https://spb.restoran.ru/spb/news/restoransnewsspb/itogi-barproof-awards-2019/" },
];
export const publications = [
  {
    publisher: "Inshaker", year: "2019", kind: "Интервью",
    title: "От работы за баром — к своему производству",
    description: "Первые инструменты и история мастерской в разговоре с основателем.",
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
    description: "Разговор с основателем о создании инструментов и визуализации коктейлей.",
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
];
