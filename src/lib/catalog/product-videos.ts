import pilot from "./product-video-pilot.json";

export type ProductVideo = {
  id: string;
  src: string;
  poster: string;
  thumbnail: string;
  label: string;
  duration: number;
  width: number;
  height: number;
};

// Pilot bindings use both stable CRM identity and SKU, never a translated name.
// Media is delivered with the release; original Drive files are not web sources.
export function getPilotProductVideos(
  product: { moyskladId: string; code: string | null; isSampleSale: boolean },
  variantCount: number,
  enabled: boolean,
): ProductVideo[] {
  if (!enabled || product.isSampleSale || variantCount > 0) return [];
  return pilot.filter(entry => entry.moyskladId === product.moyskladId && entry.code === product.code)
    .flatMap(entry => entry.videos);
}
