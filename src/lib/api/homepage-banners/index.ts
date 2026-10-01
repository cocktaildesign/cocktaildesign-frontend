import { fetchStrapi, getStrapiUrl } from "../strapi/client";
import { DEFAULT_HERO_BANNERS, DEFAULT_PROMO_BANNERS, normalizeBanners } from "./model";

export async function getHomepageBanners() {
  try {
    const result = await fetchStrapi<{ data: { heroBanners?: unknown; promoBanners?: unknown } | null }>("/api/homepage", {
      "populate[heroBanners][populate]": "*",
      "populate[promoBanners][populate]": "*",
    });
    return {
      hero: normalizeBanners(result.data?.heroBanners, DEFAULT_HERO_BANNERS, getStrapiUrl()),
      promo: normalizeBanners(result.data?.promoBanners, DEFAULT_PROMO_BANNERS, getStrapiUrl()),
    };
  } catch {
    console.warn("[homepage-banners] CMS unavailable; using bundled banners");
    return { hero: DEFAULT_HERO_BANNERS, promo: DEFAULT_PROMO_BANNERS };
  }
}
