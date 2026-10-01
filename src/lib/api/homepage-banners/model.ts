export type HomepageBanner = {
  id: number;
  desktopUrl: string;
  mobileUrl: string;
  desktopSrcSet?: string;
  mobileSrcSet?: string;
  alt: string;
  href?: string;
};

export const DEFAULT_HERO_BANNERS: HomepageBanner[] = [
  {
    id: 1,
    desktopUrl: "/images/hero-baner/banner1.webp",
    mobileUrl: "/images/hero-baner/banner1-mobile.webp",
    alt: "Картинка для перехода в каталог",
    href: "/catalog",
  },
  {
    id: 2,
    desktopUrl: "/images/hero-baner/banner2.webp",
    mobileUrl: "/images/hero-baner/banner2-mobile.webp",
    alt: "Товары со скидкой",
    href: "/catalog/collection/sale",
  },
  {
    id: 3,
    desktopUrl: "/images/hero-baner/banner3.webp",
    mobileUrl: "/images/hero-baner/banner3-mobile.webp",
    alt: "Новинки",
    href: "/catalog/collection/novinki",
  },
];

export const DEFAULT_PROMO_BANNERS: HomepageBanner[] = [
  {
    id: 1,
    desktopUrl: "/images/Hero/baner-slider/1-desktop.webp",
    mobileUrl: "/images/Hero/baner-slider/1-mobile.webp",
    alt: "Картинка для перехода в категорию «Все для бариста»",
    href: "/catalog/ms-c374b866",
  },
  {
    id: 2,
    desktopUrl: "/images/Hero/baner-slider/2-desktop.webp",
    mobileUrl: "/images/Hero/baner-slider/2-mobile.webp",
    alt: "Картинка для перехода в категорию «Джигеры и мерники»",
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
    const desktopUrl = mediaUrl(slide.desktopImage, base);
    const mobileUrl = mediaUrl(slide.mobileImage, base);
    if (!desktopUrl || !mobileUrl) return [];
    return [{id: typeof slide.id === "number" ? slide.id : index, desktopUrl, mobileUrl,
      desktopSrcSet: mediaSrcSet(slide.desktopImage, base),
      mobileSrcSet: mediaSrcSet(slide.mobileImage, base),
      alt: typeof slide.title === "string" ? slide.title : "Баннер Cocktail Design",
      href: safeBannerHref(slide.href)}];
  });
  return active.length && !slides.length ? fallback : slides;
}
