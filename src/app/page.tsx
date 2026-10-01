// src/app/page.tsx
import styles from "./HomePage.module.css";

import type { Metadata } from "next";
import HeroSection from "@/sections/home/01-hero-section/HeroSection";
import CategoryProductShelves from "@/sections/home/category-product-shelves/CategoryProductShelves";
import SaleProductsShelf from "@/sections/home/sale-products-shelf/SaleProductsShelf";
import PopularCategories from "@/sections/home/02-popular-categories/PopularCategories";
import Advantages from "@/sections/home/03-advantages/Advantages";
import Telegram from "@/sections/telegram/Telegram";
import KnowledgePreview from "@/sections/home/04-knowledge-preview/KnowledgePreview";
import Banners from "@/sections/home/05-banners/Banners";
import SocialLinks from "@/sections/home/06-social-links/SocialLinks";
import AboutCompany from "@/sections/home/07-about-company/AboutCompany";
import MobileCatalogShortcuts from "@/sections/home/mobile-catalog-shortcuts/MobileCatalogShortcuts";
import FeedbackNotice from "@/sections/home/feedback-notice/FeedbackNotice";

import { pageMetadata } from "@/lib/seo/metadata";
import { getHomepageCollectionsFromStrapi, getWeeklyProductBlock } from "@/lib/api/catalog";
import { filterHomeMobileNavigation, getMobileNavigation } from "@/lib/api/mobile-navigation";

import { getHomepageBanners } from "@/lib/api/homepage-banners";

export const metadata: Metadata = pageMetadata({
  title: "Магазин барного инвентаря в СПб - CocktailDesign",
  description:
    "Интернет магазин барного инвентаря в Санкт-Петербурге. Собственное производство барного оборудования и аксессуаров для баров и ресторанов.",
  canonical: "/",
});

export default async function HomePage() {
  const [banners, homepageCollections, weeklyProduct, mobileNavigation] = await Promise.all([
    getHomepageBanners(),
    getHomepageCollectionsFromStrapi(),
    getWeeklyProductBlock(),
    getMobileNavigation(),
  ]);
  const homeShortcuts = filterHomeMobileNavigation(mobileNavigation);

  return (
    <main className={styles.homePage}>
      <HeroSection weeklyProduct={weeklyProduct} banners={banners.hero} />
      <FeedbackNotice />
      <MobileCatalogShortcuts items={homeShortcuts} />
      <CategoryProductShelves collection={homepageCollections.collectionAfterShortcuts} />
      <PopularCategories />
      <Advantages />
      <Telegram />
      <SaleProductsShelf collection={homepageCollections.saleCollectionAfterTelegram} />
      <KnowledgePreview />
      <CategoryProductShelves collection={homepageCollections.collectionAfterKnowledge} />
      <Banners banners={banners.promo} />
      <CategoryProductShelves collection={homepageCollections.collectionAfterBanners} />
      <SocialLinks />
      <AboutCompany />
    </main>
  );
}
