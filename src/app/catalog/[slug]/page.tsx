// Страница категории каталога.
// Десктоп (> 1024px): сайдбар слева + товары справа — как раньше.
// Мобилка (< 1024px): если есть дочерние категории — показываем drill-down список.
//                     если дочерних нет — показываем товары без сайдбара.
// Мобилка + ?showAll=true: показываем все товары категории минуя drill-down.

import PageLayout from "@/components/layout/PageLayout";
import styles from "./CategoryPage.module.css";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import CatalogSidebar from "./catalog-sidebar/CatalogSidebar";
import ProductGrid from "../product-grid/ProductGrid";
import MobileCategoryDrillDown from "./mobile-category-drill-down/MobileCategoryDrillDown";
import { getCatalogTreeFromStrapi, getCategoryBySlugFromStrapi, getChildCategoriesFromTree } from "@/lib/api/catalog";

type Params = {
  slug: string;
};

type PageProps = {
  params: Promise<Params>;
  searchParams: Promise<{ showAll?: string }>;
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

export default async function CatalogCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { showAll } = await searchParams;

  const category = await getCategoryBySlugFromStrapi(slug);

  if (!category) {
    notFound();
  }

  const categories = await getCatalogTreeFromStrapi();

  // Есть ли дочерние категории у текущей?
  const hasChildren = Boolean(category.children && category.children.length > 0);

  // Показываем drill-down только если есть дети И не нажали "Все товары"
  const showDrillDown = hasChildren && showAll !== "true";

  // Берём детей категории из общего дерева /catalog/categories-flat
  // (раньше был отдельный запрос getChildCategoriesFromStrapi)
  const childCategories = showDrillDown ? await getChildCategoriesFromTree(category.slug) : [];

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/catalog", label: "Каталог" },
        { href: `/catalog/${category.slug}`, label: category.name },
      ]}>
      <section className={styles.page} aria-label="Каталог категорий">
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{category.name}</h1>
        </header>

        {/* =========================================================
            ДЕСКТОП — сайдбар + товары
            ========================================================= */}
        <div
          className={`${styles.desktopLayout} ${showDrillDown ? "" : styles.desktopLayoutShowOnMobile}`}
          aria-label="Каталог категории">
          <aside aria-label="Фильтры и категории">
            <CatalogSidebar items={categories} activeSlug={category.slug} />
          </aside>

          {showDrillDown ? (
            <section aria-label="Список товаров">
              <ProductGrid categorySlug={category.slug} />
            </section>
          ) : (
            <section className={styles.productsSingleLayout} aria-label="Список товаров">
              <ProductGrid categorySlug={category.slug} />
            </section>
          )}
        </div>

        {/* =========================================================
            МОБИЛКА — drill-down (только когда showDrillDown=true)
            ========================================================= */}
        {showDrillDown && (
          <div className={styles.mobileLayout}>
            <MobileCategoryDrillDown categories={childCategories} currentSlug={category.slug} />
          </div>
        )}
      </section>
    </PageLayout>
  );
}
