import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo/metadata";

import PageLayout from "@/components/layout/PageLayout";
import { getKnowledgeItemBySlug } from "../../data";
import styles from "./ArticlePage.module.css";
import type { KnowledgeItemPreview } from "../../types";

type Params = {
  slug: string; // slug из сегмента /knowledge/articles/[slug]
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const item = getKnowledgeItemBySlug(slug);

  if (!item || (item.format !== "article" && item.format !== "material")) {
    return {};
  }

  return pageMetadata({
    title: item.title,
    description: item.description,
    canonical: `/knowledge/articles/${item.slug}`,
  });
}

function getDetailMeta(item: KnowledgeItemPreview): string {
  if (item.format === "article") return item.readTime;
  return "Подборка";
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  // Разворачиваем params, потому что это Promise.
  const { slug } = await params;

  // Берём элемент по slug.
  const item = getKnowledgeItemBySlug(slug);

  // если нет элемента ИЛИ формат не text — это 404.
  if (!item || (item.format !== "article" && item.format !== "material")) {
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

          <div className={styles.detailHeaderMeta}>
            <p className={styles.detailMeta}>{getDetailMeta(item)}</p>

            <p className={styles.detailMeta}>
              <time dateTime={item.date}>{item.date}</time>
            </p>
          </div>
        </header>

        <div className={styles.detailBody}>
          <p>
            {item.format === "material"
              ? "Здесь будет материал/подборка ссылок из Strapi."
              : "Здесь будет текст статьи из Strapi."}
          </p>
          <p>Slug: {item.slug}</p>
          <p>Tab: {item.tab}</p>
        </div>
      </article>
    </PageLayout>
  );
}
