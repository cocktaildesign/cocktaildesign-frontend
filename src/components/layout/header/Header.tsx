// src/components/layout/header/Header.tsx
import { getTopCategoriesFromStrapi } from "@/lib/api/catalog";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const categories = await getTopCategoriesFromStrapi();
  return <HeaderClient categories={categories} />;
}
