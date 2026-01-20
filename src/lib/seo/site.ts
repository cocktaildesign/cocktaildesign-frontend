// site.ts — настройки сайта
// название бренда
// базовое описание
// url из env

export const SITE_NAME = "CocktailDesign";

export const SITE_DESCRIPTION = "Гипермаркет барного оборудования: шейкеры, джиггеры, стрейнеры и аксессуары.";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
