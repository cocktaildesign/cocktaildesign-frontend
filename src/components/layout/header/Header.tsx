// src/components/layout/header/Header.tsx

import HeaderClient from "./HeaderClient";
import { getCatalogTreeFromStrapi } from "@/lib/api/catalog";

export default async function Header() {
  const categories = await getCatalogTreeFromStrapi();
  return <HeaderClient categories={categories} />;
}
