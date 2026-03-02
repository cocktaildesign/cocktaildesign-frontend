// src/app/page.tsx

import type { Metadata } from "next";
import HeroSection from "@/sections/home/hero-section/HeroSection";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Магазин барного инвентаря в СПб - CocktailDesign",
  description:
    "Интернет магазин барного инвентаря в Санкт-Петербурге. Собственное производство барного оборудования и аксессуаров для баров и ресторанов.",
  canonical: "/",
});

export default function HomePage() {
  return <HeroSection />;
}
