import Image from "next/image";
import Link from "next/link";

import PageLayout from "@/components/layout/PageLayout";
import { getTopCategoriesFromStrapi } from "@/lib/api/catalog";
import { pageMetadata } from "@/lib/seo/metadata";

import styles from "./Catalog.module.css";

export const metadata = pageMetadata({
  title: "Каталог",
  description:
    "Каталог барного оборудования: шейкеры, джиггеры, стрейнеры, барные ложки и аксессуары. Фото, характеристики и наличие.",
  canonical: "/catalog",
});

export default async function CatalogPage() {
  // Загружаем категории из Strapi через наш API-слой
  const categories = await getTopCategoriesFromStrapi();

  return (
    <PageLayout>
      <section className={styles.catalogPage}>
        <div className={styles.catalogPageHeader}>
          <h1 className={styles.catalogPageTitle}>Каталог</h1>
        </div>

        <ul className={styles.grid}>
          {categories.map((category) => (
            <li key={category.id} className={styles.card}>
              <Link href={`/catalog/c/${category.slug}`} className={styles.cardLink}>
                {/* Название категории */}
                <span className={styles.name}>{category.name}</span>
                <span className={styles.name}>{category.productsCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  );
}
