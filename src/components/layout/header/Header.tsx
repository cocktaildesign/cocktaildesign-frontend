// src/components/layout/header/Header.tsx

import HeaderClient from "./HeaderClient";
import { getCatalogTreeFromStrapi, getCatalogCollectionsWithProductsFromStrapi } from "@/lib/api/catalog";

export default async function Header() {
  const categories = await getCatalogTreeFromStrapi();
  const collections = await getCatalogCollectionsWithProductsFromStrapi();

  return <HeaderClient categories={categories} collections={collections} />;
}
