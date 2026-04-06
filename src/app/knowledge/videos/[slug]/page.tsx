// frontend/src/app/knowledge/videos/[slug]/page.tsx

import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo/metadata";
import BackButton from "@/components/ui/back-button/BackButton";

import PageLayout from "@/components/layout/PageLayout";
import { getKnowledgeVideoBySlugFromStrapi } from "@/lib/api/knowledge";
import styles from "./VideoPage.module.css";
import { formatRelativeFromIsoDate } from "@/lib/date/relativeDate";
import ShareButton from "@/components/ui/share-button/ShareButton";
import ReadMoreText from "../read-more-text/ReadMoreText";

type Params = {
  slug: string;
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const item = await getKnowledgeVideoBySlugFromStrapi(slug);

  if (!item) {
    return {};
  }

  return pageMetadata({
    title: item.title,
    description: item.description,
    canonical: `/knowledge/videos/${item.slug}`,
  });
}

export default async function KnowledgeVideoPage({ params }: PageProps) {
  const { slug } = await params;

  const item = await getKnowledgeVideoBySlugFromStrapi(slug);

  if (!item) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/knowledge", label: "Знания" },
        { href: `/knowledge/videos/${item.slug}`, label: item.title },
      ]}>
      <article className={styles.videoPage}>
        {/* Верхняя часть страницы */}
        <BackButton />

        <div className={styles.content}>
          {/* Плеер */}
          <div className={styles.player} role="group" aria-label="Видео">
            <iframe
              src={item.embedUrl}
              title={item.title}
              loading="lazy"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            />
          </div>

          {/* Заголовок и действия */}
          <header className={styles.header}>
            <h1 className={styles.title}>{item.title}</h1>

            <div className={styles.metaRow}>
              <p className={styles.meta}>
                <time dateTime={item.date} title={item.date}>
                  {formatRelativeFromIsoDate(item.date)}
                </time>
              </p>

              <div className={styles.actions}>
                <ShareButton url={`${siteUrl}/knowledge/videos/${item.slug}`} title={item.title} />
              </div>
            </div>
          </header>

          {/* Описание */}
          {item.description ? <ReadMoreText text={item.description} /> : null}
        </div>
      </article>
    </PageLayout>
  );
}
