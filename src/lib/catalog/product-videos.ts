import pilot from "./product-video-pilot.json";
import published from "./product-videos.json";

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

type ProductVideoIdentity = { moyskladId: string; code: string | null };
type VideoProduct = ProductVideoIdentity & { isSampleSale: boolean };
type VideoVariant = ProductVideoIdentity & { id: string };
type PublishedVideoBinding = ProductVideoIdentity & {
  variant: ProductVideoIdentity | null;
  videos: ProductVideo[];
};

export type ProductVideoSelection = {
  videos: ProductVideo[];
  variantVideos: Record<string, ProductVideo[]>;
};

function sameIdentity(left: ProductVideoIdentity, right: ProductVideoIdentity): boolean {
  return left.moyskladId === right.moyskladId && left.code === right.code;
}

// New media is bound to the exact product and, where applicable, its exact variant.
// A variant's videos must never fall back to another size, colour or parent item.
export function getProductVideos(
  product: VideoProduct,
  variants: VideoVariant[],
  pilotEnabled: boolean,
): ProductVideoSelection {
  const selection: ProductVideoSelection = { videos: [], variantVideos: {} };
  if (product.isSampleSale) return selection;

  const bindings = (published as PublishedVideoBinding[]).filter(entry => sameIdentity(entry, product));
  if (variants.length === 0) {
    selection.videos = bindings.filter(entry => entry.variant === null).flatMap(entry => entry.videos);
    selection.videos.push(...getPilotProductVideos(product, 0, pilotEnabled));
  }
  for (const variant of variants) {
    const videos = bindings.filter(entry => entry.variant !== null && sameIdentity(entry.variant, variant))
      .flatMap(entry => entry.videos);
    if (videos.length > 0) selection.variantVideos[variant.id] = videos;
  }
  return selection;
}

// Pilot bindings use both stable CRM identity and SKU, never a translated name.
// Media is delivered with the release; original Drive files are not web sources.
export function getPilotProductVideos(
  product: VideoProduct,
  variantCount: number,
  enabled: boolean,
): ProductVideo[] {
  if (!enabled || product.isSampleSale || variantCount > 0) return [];
  return pilot.filter(entry => entry.moyskladId === product.moyskladId && entry.code === product.code)
    .flatMap(entry => entry.videos);
}
