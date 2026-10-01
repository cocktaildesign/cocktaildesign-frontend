// frontend/src/app/knowledge/materials/[slug]/page.tsx

import { notFound } from "next/navigation";
import ReadingBody from "@/components/knowledge/ReadingBody";
import KnowledgeTools from "@/components/knowledge/KnowledgeTools";

import { pageMetadata } from "@/lib/seo/metadata";
import { knowledgeImage } from "@/lib/seo/knowledge";
import { siteUrl } from "@/lib/seo/site";
import { formatRelativeFromIsoDate } from "@/lib/date/relativeDate";

import PageLayout from "@/components/layout/PageLayout";
import BackButton from "@/components/ui/back-button/BackButton";
import ShareButton from "@/components/ui/share-button/ShareButton";
import TelegramBanner from "@/sections/telegram-cta/TelegramCta";

import { getKnowledgeMaterialBySlugFromStrapi } from "@/lib/api/knowledge";

import styles from "@/components/knowledge/Reading.module.css";

type Params = {
  slug: string;
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const item = await getKnowledgeMaterialBySlugFromStrapi(slug);

  if (!item) return {};

  return pageMetadata({
    title: item.title,
    description: item.description,
    canonical: `/knowledge/materials/${item.slug}`,
    image: knowledgeImage(item.coverSrc, siteUrl),
  });
}

export default async function KnowledgeMaterialPage({ params }: PageProps) {
  const { slug } = await params;

  const item = await getKnowledgeMaterialBySlugFromStrapi(slug);

  if (!item) notFound();

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/knowledge", label: "Знания" },
        { href: `/knowledge/materials/${item.slug}`, label: item.title },
      ]}>
      <article className={styles.page}>
        {/* Верхняя строка */}
        <div className={styles.up}>
          <BackButton />

          <p className={styles.meta}>
            Опубликовано:{" "}
            <time dateTime={item.date} title={item.date}>
              {formatRelativeFromIsoDate(item.date)}
            </time>
          </p>
        </div>

        {/* Заголовок материала */}
        <header className={styles.header}>
          <h1 className={styles.title}>{item.title}</h1>

          <div className={styles.actions}>
              {/* label у материала опциональный */}
              {item.label ? <p className={styles.meta}>{item.label}</p> : null}

              <ShareButton
                url={`${siteUrl}/knowledge/materials/${item.slug}`}
                title={item.title}
              />
          </div>
        </header>

        <ReadingBody blocks={item.blocks} slug={item.slug} />
        <KnowledgeTools slug={item.slug} />
      </article>

      <TelegramBanner />
    </PageLayout>
  );
}
