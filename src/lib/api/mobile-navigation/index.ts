// frontend/src/lib/api/mobile-navigation/index.ts
// Единый getter для HOME quick menu и fullscreen «Меню».

import { fetchStrapi } from "@/lib/api/strapi";

import { MOBILE_NAVIGATION_FALLBACK } from "./fallback";
import { mapMobileNavigationItems } from "./mappers";
import type { MobileNavigationItem, StrapiMobileNavigationResponse } from "./types";

export type { MobileNavigationItem } from "./types";
export {
  MOBILE_NAVIGATION_FALLBACK,
  MOBILE_NAV_PLACEHOLDER_IMAGE,
  resolveHomeImageUrl,
  resolveMenuImageUrl,
} from "./fallback";

const POPULATE_PARAMS: Record<string, string> = {
  "populate[items][populate][homeImage]": "true",
  "populate[items][populate][menuImage]": "true",
};

/**
 * Получает пункты Mobile Navigation из Strapi.
 * При ошибке / пустом ответе возвращает fallback (старые hardcoded пункты).
 * Не бросает ошибку на page/layout.
 */
export async function getMobileNavigation(): Promise<MobileNavigationItem[]> {
  try {
    const response = await fetchStrapi<StrapiMobileNavigationResponse>("/api/mobile-navigation", POPULATE_PARAMS);

    const items = mapMobileNavigationItems(response?.data?.items);

    if (items.length === 0) {
      return MOBILE_NAVIGATION_FALLBACK;
    }

    return items;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("❌ Ошибка при загрузке mobile-navigation:", message.slice(0, 300));
    return MOBILE_NAVIGATION_FALLBACK;
  }
}

export function filterHomeMobileNavigation(items: MobileNavigationItem[]): MobileNavigationItem[] {
  return items.filter((item) => item.isActive && item.showInHome);
}

export function filterMenuMobileNavigation(items: MobileNavigationItem[]): MobileNavigationItem[] {
  return items.filter((item) => item.isActive && item.showInMenu);
}
