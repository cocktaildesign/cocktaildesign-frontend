import PageLayout from "@/components/layout/PageLayout";
import styles from "./CollectionPage.module.css";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import CatalogSidebar from "@/app/catalog/[slug]/catalog-sidebar/CatalogSidebar";
import ProductGrid from "@/app/catalog/product-grid/ProductGrid";
import CollectionMobileCategoryDrillDown from "./mobile-collection-category-drill-down/CollectionMobileCategoryDrillDown";
import { getCollectionProductsFromStrapi, getCollectionCategoriesTreeFromStrapi } from "@/lib/api/catalog";
import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";

type Params = {
  slug: string;
};

type SearchParams = {
  category?: string;
  showAll?: string;
};

type PageProps = {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
};

function findCategoryInTree(items: CatalogCategoryPreview[], slug: string): CatalogCategoryPreview | null {
  for (const item of items) {
    if (item.slug === slug) return item;

    if (item.children && item.children.length > 0) {
      const found = findCategoryInTree(item.children, slug);
      if (found) return found;
    }
  }

  return null;
}

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
  const { category, showAll } = await searchParams;

  // Категория-фильтр из query param ?category=ms-xxxx
  const filterCategorySlug = category?.trim() || null;
  const wantsShowAll = showAll === "true";

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

  // Дерево категорий из товаров этой подборки (уже с imageUrl/alt с бэка)
  const categories = await getCollectionCategoriesTreeFromStrapi(slug);

  // Базовый путь для ссылок в сайдбаре — сохраняем контекст коллекции
  const sidebarBasePath = `/catalog/collection/${collectionSlug}`;

  // Невалидный category slug → как корень (без runtime error)
  const selectedCategory = filterCategorySlug ? findCategoryInTree(categories, filterCategorySlug) : null;
  const drillDownCategorySlug = selectedCategory ? filterCategorySlug : null;

  const currentCategories = selectedCategory ? (selectedCategory.children ?? []) : categories;
  const hasChildren = currentCategories.length > 0;

  // Mobile drill-down: есть children и не нажали «Все товары»
  const showMobileDrillDown = hasChildren && !wantsShowAll;

  // Заголовок секции на mobile: «Категории» на корне / invalid; иначе имя найденной category
  const mobileSectionTitle = selectedCategory ? selectedCategory.name : "Категории";

  // Leaf / showAll с валидной category — имя над ProductGrid (только mobile через CSS)
  const showMobileProductsCategoryTitle = !showMobileDrillDown && Boolean(selectedCategory);

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/catalog", label: "Каталог" },
        { href: sidebarBasePath, label: collectionTitle },
      ]}>
      <section className={styles.page} aria-label={collectionTitle}>
        {/* Заголовок — всегда название подборки, не выбранной категории */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{collectionTitle}</h1>

          <div className={styles.collectionNotice} aria-label="Информация о подборке">
            <p className={styles.collectionNoticeText}>
              Вы просматриваете подборку товаров — {collectionTitle}
              <span className={styles.collectionNoticeDivider}>·</span>
              <Link href="/catalog" className={styles.collectionNoticeLink}>
                Перейти в основной каталог
              </Link>
            </p>
          </div>
        </header>

        {/* MOBILE ≤600 — плитки категорий (скрыто на >600 через CSS) */}
        {showMobileDrillDown && (
          <div className={styles.mobileDrillDown}>
            <h2 className={styles.mobileCategoriesTitle}>{mobileSectionTitle}</h2>
            <CollectionMobileCategoryDrillDown
              categories={currentCategories}
              collectionSlug={collectionSlug}
              currentCategorySlug={drillDownCategorySlug}
            />
          </div>
        )}

        {/* MOBILE ≤600 — имя category над ProductGrid (leaf / showAll); скрыто на >600 */}
        {showMobileProductsCategoryTitle && selectedCategory && (
          <h2 className={styles.mobileProductsCategoryTitle}>{selectedCategory.name}</h2>
        )}

        {/* Desktop/tablet: sidebar + products. На mobile ≤600 при drill-down products скрыты CSS. */}
        <div className={`${styles.layout} ${showMobileDrillDown ? styles.layoutHideProductsOnMobile : ""}`}>
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
