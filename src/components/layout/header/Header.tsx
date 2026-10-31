// src/components/layout/header/Header.tsx

import HeaderClient from "./HeaderClient";
import { getCatalogTreeFromStrapi, getCatalogMenuCollectionsFromStrapi } from "@/lib/api/catalog";

export default async function Header() {
  const [categories, collections] = await Promise.all([
    getCatalogTreeFromStrapi(),
    getCatalogMenuCollectionsFromStrapi(),
  ]);
  return <HeaderClient categories={categories} collections={collections} />;
}
