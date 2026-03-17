// site.ts — настройки сайта
// название бренда
// базовое описание
// url из env

export const SITE_NAME = "CocktailDesign";

export const SITE_DESCRIPTION =
  "Интернет магазин барного инвентаря в Санкт-Петербурге. Собственное производство барного оборудования и аксессуаров для баров и ресторанов.";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
