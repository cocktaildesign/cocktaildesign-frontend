// src/sections/home/popular-categories/PopularCategories.tsx

import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

import { getTopCategoriesFromStrapi } from "@/lib/api/catalog";

import styles from "./PopularCategories.module.css";

export default async function PopularCategories() {
  const categories = await getTopCategoriesFromStrapi();

  // берем только 12
  const visibleCategories = categories.slice(0, 12);

  if (!visibleCategories.length) return null;

  return (
    <PageLayout>
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>Популярные категории</h2>

          <Link href="/catalog" className={styles.viewAll}>
            Смотреть всё →
          </Link>
        </div>

        <ul className={styles.grid}>
          {visibleCategories.map((category) => (
            <li key={category.id} className={styles.card}>
              <Link href={`/catalog/${category.slug}`} className={styles.cardLink}>
                <div className={styles.cardText}>
                  <h3 className={styles.categoryTitle}>{category.name}</h3>
                </div>

                <div className={styles.imageWrapper}>
                  <Image
                    src={category.imageSrc || "/images/catalog/product-placeholder.webp"}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    fill
                    alt={category.name ? `Категория: ${category.name}` : "Категория"}
                    className={styles.image}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  );
}
