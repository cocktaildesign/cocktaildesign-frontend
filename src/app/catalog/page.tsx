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

function formatProductsCount(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;

  //ислючение
  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} товаров`;
  }

  // 1 товар
  if (last === 1) {
    return `${count} товар`;
  }

  // 2-4 товара
  if (last >= 2 && last <= 4) {
    return `${count} товара`;
  }

  return `${count} товаров`;
}

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
                <div className={styles.cardText}>
                  <h3 className={styles.title}>{category.name}</h3>
                  <span className={styles.count}>{formatProductsCount(category.productsCount)}</span>
                </div>

                {/* Контейнер изображения */}
                <div className={styles.imageWrapper}>
                  <Image
                    src={category.imageSrc || "/placeholder-image.jpg"}
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
