// src/sections/home/02-popular-categories/PopularCategories.tsx

import Image from "next/image";
import Link from "next/link";

import Container from "@/components/layout/Container";

import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

// Используем единый источник дерева категорий — учитывает menuOrder и isHiddenInMenu
import { getTopCategoriesFromTree } from "@/lib/api/catalog";

import styles from "./PopularCategories.module.css";

export default async function PopularCategories() {
  // Берём верхний уровень из общего дерева /catalog/categories-flat
  // (раньше был отдельный запрос getTopCategoriesFromStrapi)
  const categories = await getTopCategoriesFromTree();

  const visibleCategories = categories.slice(0, 12);

  if (!visibleCategories.length) return null;

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.header}>
          <h2 className={styles.title}>Популярные категории</h2>

          <Link href="/catalog" className={styles.viewAllLink}>
            <span className={styles.viewAllText}>Все</span>
            <ArrowRightIcon className={styles.viewAllIcon} title="Вперёд" />
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
                    sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    fill
                    alt={category.name ? `Категория: ${category.name}` : "Категория"}
                    className={styles.image}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
