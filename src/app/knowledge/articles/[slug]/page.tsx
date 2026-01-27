import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo/metadata";

import PageLayout from "@/components/layout/PageLayout";
import { getKnowledgeItemBySlug } from "../../data";
import styles from "../../KnowledgePage.module.css";

type Params = {
  slug: string; // slug из сегмента /knowledge/articles/[slug]
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const item = getKnowledgeItemBySlug(slug);

  if (!item || item.format !== "article") {
    return {};
  }

  return pageMetadata({
    title: item.title,
    description: item.description,

    canonical: `/knowledge/articles/${item.slug}`,
  });
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  // Разворачиваем params, потому что это Promise.
  const { slug } = await params;

  // Берём элемент по slug.
  const item = getKnowledgeItemBySlug(slug);

  // если нет элемента ИЛИ формат не text — это 404.
  if (!item || item.format !== "article") {
    notFound();
  }

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/knowledge", label: "Знания" },
        { href: `/knowledge/articles/${item.slug}`, label: item.title },
      ]}>
      <article className={styles.detailPage}>
        <header className={styles.detailHeader}>
          <h1 className={styles.detailTitle}>{item.title}</h1>
          <p className={styles.detailMeta}>
            Дата: <time dateTime={item.date}>{item.date}</time>
          </p>
        </header>

        <div className={styles.detailBody}>
          <p>Здесь будет текст статьи из Strapi.</p>
          <p>Slug: {item.slug}</p>
          <p>Tab: {item.tab}</p>
        </div>
      </article>
    </PageLayout>
  );
}
