// src/app/favorites/page.tsx
import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./Favorites.module.css";
import FavoritesClient from "./FavoritesClient";

export const metadata = pageMetadata({
  title: "Избранное — Магазин барного инвентаря Cocktail Design",
  description: "Ваш список избранных товаров в магазине барного инвентаря Cocktail Design.",
  canonical: "/favorites",
});

export default function FavoritesPage() {
  return (
    <PageLayout>
      <section className={styles.favoritesPage}>
        <div className={styles.favoritesPageHeader}>
          <h1 className={styles.favoritesPageTitle}>Избранное</h1>
        </div>

        <FavoritesClient />
      </section>
    </PageLayout>
  );
}
