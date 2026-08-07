// frontend/src/lib/api/mobile-navigation/mappers.ts

import { getStrapiMediaUrl } from "@/lib/api/strapi";

import type { MobileNavigationItem, StrapiMobileNavigationItem, StrapiMobileNavigationMedia } from "./types";

function normalizeTitle(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const title = value.trim();
  return title.length > 0 ? title : null;
}

function normalizeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  return href.length > 0 ? href : null;
}

function normalizeBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") return value;
  return defaultValue;
}

function mapMediaUrl(media: StrapiMobileNavigationMedia | undefined): string | null {
  if (!media || typeof media !== "object") return null;
  const path = typeof media.url === "string" ? media.url : null;
  if (!path) return null;
  return getStrapiMediaUrl(path) ?? null;
}

export function mapMobileNavigationItem(raw: StrapiMobileNavigationItem): MobileNavigationItem | null {
  const title = normalizeTitle(raw?.title);
  const href = normalizeHref(raw?.href);

  if (!title || !href) {
    return null;
  }

  return {
    title,
    href,
    homeImageUrl: mapMediaUrl(raw.homeImage),
    menuImageUrl: mapMediaUrl(raw.menuImage),
    showInHome: normalizeBoolean(raw.showInHome, true),
    showInMenu: normalizeBoolean(raw.showInMenu, true),
    isActive: normalizeBoolean(raw.isActive, true),
  };
}

export function mapMobileNavigationItems(rawItems: unknown): MobileNavigationItem[] {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const items: MobileNavigationItem[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const mapped = mapMobileNavigationItem(raw as StrapiMobileNavigationItem);
    if (mapped) items.push(mapped);
  }

  return items;
}
