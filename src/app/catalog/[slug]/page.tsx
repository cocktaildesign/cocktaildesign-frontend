// src/app/catalog/[slug]/page.tsx

import PageLayout from "@/components/layout/PageLayout";
import styles from "./CategoryPage.module.css";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCategoryBySlugFromStrapi } from "@/lib/api/catalog";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import CatalogSidebar from "./catalog-sidebar/CatalogSidebar";
import { getTopCategoriesFromStrapi } from "@/lib/api/catalog";

type Params = {
  slug: string; //catalog/[slug]
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = await getCategoryBySlugFromStrapi(slug);
  if (!category) return {};

  return pageMetadata({
    title: category.name,
    description: `Товары категории «${category.name}» — ассортимент CocktailDesign.`,
    canonical: `/catalog/${category.slug}`,
  });
}

export default async function CatalogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlugFromStrapi(slug);

  if (!category) {
    notFound();
  }

  const categories = await getTopCategoriesFromStrapi();

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/catalog", label: "Каталог" },
        { href: `/catalog/${category.slug}`, label: category.name },
      ]}>
      <section className={styles.page} aria-label="Каталог категорий">
        {/* Заголовок страницы — над сеткой, чтобы не зависел от колонок */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{category.name}</h1>
        </header>

        {/* 12-колоночная сетка: sidebar (3) + content (9) */}
        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Фильтры и категории">
            <CatalogSidebar items={categories} activeSlug={category.slug} />
          </aside>

          <section className={styles.content} aria-label="Контент">
            Контент
          </section>
        </div>
      </section>
    </PageLayout>
  );
}
