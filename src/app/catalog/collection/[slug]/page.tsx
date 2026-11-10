import PageLayout from "@/components/layout/PageLayout";
import styles from "./CollectionPage.module.css";
import { pageMetadata } from "@/lib/seo/metadata";
import { listingHref, pageNumber } from "@/lib/seo/policy";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
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
  page?: string;
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

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const page = pageNumber(query.page) ?? 1;

  try {
    const data = await getCollectionProductsFromStrapi({ slug, limit: 1, offset: 0 });

    return pageMetadata({
      title: `${data.collection.title}${page > 1 ? ` — страница ${page}` : ""}`,
      description: data.collection.description ?? `Подборка товаров «${data.collection.title}» — CocktailDesign.`,
      canonical: listingHref(`/catalog/collection/${slug}`, page, query.category),
      noindex: Boolean(query.category),
    });
  } catch {
    return {};
  }
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { category, page: rawPage } = await searchParams;
  const page = pageNumber(rawPage);
  if (page === null) notFound();

  // Категория-фильтр из query param ?category=ms-xxxx
  const requestedCategorySlug = category?.trim() || null;

  let collectionTitle = "";
  let collectionSlug = slug;
  let collectionDescription = "";

  try {
    const data = await getCollectionProductsFromStrapi({ slug, limit: 1, offset: 0 });
    collectionTitle = data.collection.title;
    collectionSlug = data.collection.slug;
    collectionDescription = data.collection.description?.trim() ?? "";
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
  const selectedCategory = requestedCategorySlug ? findCategoryInTree(categories, requestedCategorySlug) : null;
  const filterCategorySlug = selectedCategory?.slug;
  const hasSubcategories = Boolean(selectedCategory?.children?.length);
  const currentCategories = hasSubcategories ? selectedCategory!.children! : categories;

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
            <div className={styles.collectionNoticeContent}>
              <p className={styles.collectionNoticeText}>
                {collectionDescription || `Вы просматриваете подборку «${collectionTitle}». Весь ассортимент доступен в каталоге.`}
              </p>
            </div>
            <Link href="/catalog" className={styles.collectionNoticeLink}>
              Смотреть весь каталог
              <ArrowRightIcon className={styles.collectionNoticeArrow} title="" />
            </Link>
          </div>
        </header>

        {/* Фильтр необязателен: товары подборки видны сразу, включая старые ссылки с showAll. */}
        {categories.length > 0 && (
          <details key={`${collectionSlug}:${filterCategorySlug ?? "all"}`} className={styles.mobileCategories}>
            <summary className={styles.mobileCategoriesToggle}>
              Выбрать категорию
              <span className={styles.mobileCategoriesChevron} aria-hidden="true" />
            </summary>
            <div className={styles.mobileCategoriesBody}>
              {selectedCategory && <Link href={sidebarBasePath} className={styles.resetCategory}>Все категории подборки</Link>}
              {hasSubcategories && <p className={styles.mobileCategoriesTitle}>{selectedCategory!.name}</p>}
              <CollectionMobileCategoryDrillDown categories={currentCategories} collectionSlug={collectionSlug} />
            </div>
          </details>
        )}

        {selectedCategory && (
          <div className={styles.selectedCategory}>
            <h2 className={styles.selectedCategoryTitle}>{selectedCategory.name}</h2>
            <Link href={sidebarBasePath} className={styles.resetCategory}>Сбросить</Link>
          </div>
        )}

        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Категории">
            {categories.length > 0 ? (
              <CatalogSidebar items={categories} activeSlug={filterCategorySlug ?? ""} basePath={sidebarBasePath} />
            ) : null}
          </aside>

          <section className={styles.content} aria-label="Список товаров">
            <ProductGrid collectionSlug={collectionSlug} filterCategorySlug={filterCategorySlug} page={page} />
          </section>
        </div>
      </section>
    </PageLayout>
  );
}
