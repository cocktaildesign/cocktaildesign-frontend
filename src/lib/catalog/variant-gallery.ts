type VariantGalleryImage = { variantId: string | null };

// A missing variant photo must not leave the previous variant visible. Prefer
// an explicitly assigned image, then a parent image. -1 means use a placeholder,
// never a photo belonging only to another variant.
export function variantGalleryIndex(images: VariantGalleryImage[], variantId: string | null): number {
  if (variantId !== null) {
    const ownIndex = images.findIndex(image => image.variantId === variantId);
    if (ownIndex >= 0) return ownIndex;
  }
  return images.findIndex(image => image.variantId === null);
}
