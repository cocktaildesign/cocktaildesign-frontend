// src/app/catalog/collection/[slug]/page.tsx

import PageLayout from "@/components/layout/PageLayout";
import styles from "./CollectionPage.module.css";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import CatalogSidebar from "@/app/catalog/[slug]/catalog-sidebar/CatalogSidebar";
import ProductGrid from "@/app/catalog/product-grid/ProductGrid";
import { getCollectionProductsFromStrapi, getCollectionCategoriesTreeFromStrapi } from "@/lib/api/catalog";

type Params = {
  slug: string;
};

type SearchParams = {
  category?: string;
};

type PageProps = {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getCollectionProductsFromStrapi({ slug, limit: 1, offset: 0 });

    return pageMetadata({
      title: data.collection.title,
      description: data.collection.description ?? `Подборка товаров «${data.collection.title}» — CocktailDesign.`,
      canonical: `/catalog/collection/${slug}`,
    });
  } catch {
    return {};
  }
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { category } = await searchParams;

  // Категория-фильтр из query param ?category=ms-xxxx
  const filterCategorySlug = category?.trim() ?? null;

  let collectionTitle = "";
  let collectionSlug = slug;

  try {
    const data = await getCollectionProductsFromStrapi({ slug, limit: 1, offset: 0 });
    collectionTitle = data.collection.title;
    collectionSlug = data.collection.slug;
  } catch {
    notFound();
  }

  if (!collectionTitle) {
    notFound();
  }

  // Загружаем дерево категорий из товаров коллекции
  const categories = await getCollectionCategoriesTreeFromStrapi(slug);

  // Базовый путь для ссылок в сайдбаре — сохраняем контекст коллекции
  const sidebarBasePath = `/catalog/collection/${collectionSlug}`;

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/catalog", label: "Каталог" },
        { href: sidebarBasePath, label: collectionTitle },
      ]}>
      <section className={styles.page} aria-label={collectionTitle}>
        {/* Заголовок */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{collectionTitle}</h1>
        </header>

        {/* Сетка: сайдбар + товары */}
        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Категории">
            {categories.length > 0 ? (
              <CatalogSidebar items={categories} activeSlug={filterCategorySlug ?? ""} basePath={sidebarBasePath} />
            ) : null}
          </aside>

          <section className={styles.content} aria-label="Список товаров">
            <ProductGrid collectionSlug={collectionSlug} filterCategorySlug={filterCategorySlug ?? undefined} />
          </section>
        </div>
      </section>
    </PageLayout>
  );
}
