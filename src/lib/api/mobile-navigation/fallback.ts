// frontend/src/lib/api/mobile-navigation/fallback.ts
// Старые hardcoded title/href + static images.
// Используются, если Strapi недоступен / пустой / item без media.

import type { MobileNavigationItem } from "./types";

export const MOBILE_NAV_PLACEHOLDER_IMAGE = "/images/catalog/product-placeholder.webp";

/** Старые HOME-картинки по href (из прежнего MobileCatalogShortcuts). */
export const HOME_IMAGE_FALLBACK_BY_HREF: Record<string, string> = {
  "/catalog": "/images/home/1.webp",
  "/knowledge": "/images/home/2.webp",
  "/legal/requisites": "/images/home/3.webp",
  "/branding": "/images/home/5.webp",
  "/contacts": "/images/home/4.webp",
  "/shipping": "/images/home/6.webp",
  "/payment-methods": "/images/home/7.webp",
};

/** Старые Menu-картинки по href (из прежнего MENU_ITEMS). */
export const MENU_IMAGE_FALLBACK_BY_HREF: Record<string, string> = {
  "/catalog": "/images/mobilBottomMenuImage/catalog.webp",
  "/contacts": "/images/mobilBottomMenuImage/contacts.webp",
  "/shipping": "/images/mobilBottomMenuImage/delivery.webp",
  "/payment-methods": "/images/mobilBottomMenuImage/pay.webp",
  "/legal/requisites": "/images/mobilBottomMenuImage/requisites.webp",
  "/branding": "/images/mobilBottomMenuImage/branding.webp",
  "/knowledge": "/images/mobilBottomMenuImage/knowledge.webp",
  "/catalog/collection/sale": "/images/mobilBottomMenuImage/sale.webp",
};

/**
 * Полный fallback-список (порядок как в seed).
 * CMS — source of truth; этот список только при ошибке/пустом ответе.
 */
export const MOBILE_NAVIGATION_FALLBACK: MobileNavigationItem[] = [
  {
    title: "Каталог",
    href: "/catalog",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "О нас",
    href: "/about",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Знания",
    href: "/knowledge",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Реквизиты",
    href: "/legal/requisites",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Брендинг",
    href: "/branding",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Контакты",
    href: "/contacts",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Доставка",
    href: "/shipping",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Оплата",
    href: "/payment-methods",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Новинки",
    href: "/catalog/collection/novinki",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Уценка",
    href: "/catalog/collection/utsenka",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Система скидок",
    href: "/discounts",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: true,
    showInMenu: true,
    isActive: true,
  },
  {
    title: "Товары со скидкой",
    href: "/catalog/collection/sale",
    homeImageUrl: null,
    menuImageUrl: null,
    showInHome: false,
    showInMenu: true,
    isActive: true,
  },
];

export function resolveHomeImageUrl(href: string, cmsUrl: string | null): string {
  if (cmsUrl) return cmsUrl;
  return HOME_IMAGE_FALLBACK_BY_HREF[href] ?? MOBILE_NAV_PLACEHOLDER_IMAGE;
}

export function resolveMenuImageUrl(href: string, cmsUrl: string | null): string {
  if (cmsUrl) return cmsUrl;
  return MENU_IMAGE_FALLBACK_BY_HREF[href] ?? MOBILE_NAV_PLACEHOLDER_IMAGE;
}
