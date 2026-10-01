// src/components/layout/header/Header.tsx

import HeaderClient from "./HeaderClient";
import { getCatalogTreeFromStrapi, getCatalogCollectionsWithProductsFromStrapi } from "@/lib/api/catalog";

export default async function Header() {
  const categories = await getCatalogTreeFromStrapi();
  const collections = await getCatalogCollectionsWithProductsFromStrapi();

  // The menu renders collection names/links only, never their product galleries.
  // Keep those server-side so every page does not download unused catalogue data.
  const menuCollections = collections.map(collection => ({ ...collection, products: [] }));
  return <HeaderClient categories={categories} collections={menuCollections} />;
}
