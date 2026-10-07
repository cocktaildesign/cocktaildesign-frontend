export type HomepageBanner = {
  id: number;
  desktopUrl: string;
  mobileUrl: string;
  desktopSrcSet?: string;
  mobileSrcSet?: string;
  alt: string;
  href?: string;
  desktopAspect?: number;
  editorial?: {
    heading: string;
    description: string;
    buttonLabel: string;
    note: string;
  };
};

export const DEFAULT_HERO_BANNERS: HomepageBanner[] = [
  {
    id: 1,
    desktopUrl: "/images/hero-editorial-20261007/catalog.webp",
    mobileUrl: "/images/hero-editorial-20261007/catalog.webp",
    alt: "Профессиональный барный инвентарь — перейти в каталог",
    href: "/catalog",
    editorial: {heading: "Барный инвентарь\nдля профессионалов", description: "Шейкеры, джиггеры, стрейнеры\nи аксессуары для вашего бара.", buttonLabel: "Перейти в каталог", note: ""},
  },
  {
    id: 2,
    desktopUrl: "/images/hero-editorial-20261007/discounts.webp",
    mobileUrl: "/images/hero-editorial-20261007/discounts.webp",
    alt: "Ваша формула идеального бара — условия скидок до 20%",
    href: "/discounts",
    editorial: {heading: "Скидки\nдо 20%", description: "Чем больше сумма заказа,\nтем выше ваша скидка.", buttonLabel: "Условия скидок", note: "Действуют условия и исключения.\nПодробнее — в разделе скидок."},
  },
  {
    id: 3,
    desktopUrl: "/images/hero-editorial-20261007/novinki.webp",
    mobileUrl: "/images/hero-editorial-20261007/novinki.webp",
    alt: "Новинки барного инвентаря — последние поступления",
    href: "/catalog/collection/novinki",
    editorial: {heading: "Новинки барного\nинвентаря", description: "Последние поступления\nдля профессиональной миксологии.", buttonLabel: "Смотреть новинки", note: ""},
  },
];

export const DEFAULT_PROMO_BANNERS: HomepageBanner[] = [
  {
    id: 1,
    desktopUrl: "/images/homepage-promo-20261007/barista-desktop.webp",
    mobileUrl: "/images/homepage-promo-20261007/barista-mobile.webp",
    alt: "Всё для бариста — питчеры, темперы и аксессуары для кофе",
    href: "/catalog/ms-c374b866",
  },
  {
    id: 2,
    desktopUrl: "/images/homepage-promo-20261007/jiggers-desktop.webp",
    mobileUrl: "/images/homepage-promo-20261007/jiggers-mobile.webp",
    alt: "Джиггеры и мерники — для точной дозировки и баланса вкуса",
    href: "/catalog/ms-57a775a4",
  },
];

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function mediaUrl(value: unknown, base: string): string | undefined {
  const url = object(value).url;
  if (typeof url !== "string" || !/^\/uploads\/[^\\\s]+$/.test(url)) return undefined;
  return new URL(url, base).toString();
}

function mediaSrcSet(value: unknown, base: string): string | undefined {
  const media = object(value);
  const widths = new Map<number, string>();
  for (const candidate of [...Object.values(object(media.formats)), media]) {
    const file = object(candidate);
    const url = mediaUrl(file, base);
    const width = file.width;
    if (url && !url.includes(",") && typeof width === "number" && Number.isInteger(width) && width > 0) {
      widths.set(width, url);
    }
  }
  return widths.size > 1
    ? [...widths].sort(([a], [b]) => a - b).map(([width, url]) => `${url} ${width}w`).join(", ")
    : undefined;
}

export function safeBannerHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const href = value.trim();
  if (!/^(?:\/(?!\/)[^\\\s]*|https:\/\/[^\\\s]+)$/.test(href)) return undefined;
  return href;
}

export function normalizeBanners(value: unknown, fallback: HomepageBanner[], base: string): HomepageBanner[] {
  // Missing configuration/API failure uses existing artwork. An intentionally empty list stays empty.
  if (!Array.isArray(value)) return fallback;
  const active = value.map(object).filter(slide => slide.isActive !== false);
  const slides = active.flatMap((slide, index): HomepageBanner[] => {
    const href = safeBannerHref(slide.href);
    if (slide.useTextLayout === true) {
      const productUrl = mediaUrl(slide.productImage, base);
      const heading = typeof slide.heading === "string" ? slide.heading.trim() : "";
      const buttonLabel = typeof slide.buttonLabel === "string" ? slide.buttonLabel.trim() : "";
      if (!productUrl || !heading || (href && !buttonLabel)) return [];
      return [{id: typeof slide.id === "number" ? slide.id : index,
        desktopUrl: productUrl, mobileUrl: productUrl,
        desktopSrcSet: mediaSrcSet(slide.productImage, base), mobileSrcSet: mediaSrcSet(slide.productImage, base),
        alt: typeof slide.title === "string" ? slide.title : heading, href,
        editorial: {heading, buttonLabel,
          description: typeof slide.description === "string" ? slide.description.trim() : "",
          note: typeof slide.note === "string" ? slide.note.trim() : ""}}];
    }
    const desktopUrl = mediaUrl(slide.desktopImage, base);
    const mobileUrl = mediaUrl(slide.mobileImage, base);
    if (!desktopUrl || !mobileUrl) return [];
    return [{id: typeof slide.id === "number" ? slide.id : index, desktopUrl, mobileUrl,
      desktopSrcSet: mediaSrcSet(slide.desktopImage, base),
      mobileSrcSet: mediaSrcSet(slide.mobileImage, base),
      alt: typeof slide.title === "string" ? slide.title : "Баннер Cocktail Design",
      href,
      desktopAspect: typeof object(slide.desktopImage).width === "number" && typeof object(slide.desktopImage).height === "number"
        ? Math.max(1, Math.min(3, Number(object(slide.desktopImage).width) / Number(object(slide.desktopImage).height) || 16 / 9)) : 16 / 9}];
  });
  return active.length && !slides.length ? fallback : slides;
}
