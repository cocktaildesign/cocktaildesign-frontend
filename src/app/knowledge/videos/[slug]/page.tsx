// frontend/src/app/knowledge/videos/[slug]/page.tsx

import { notFound } from "next/navigation";
import ReadingBody from "@/components/knowledge/ReadingBody";
import KnowledgeTools from "@/components/knowledge/KnowledgeTools";
import { pageMetadata } from "@/lib/seo/metadata";
import { knowledgeImage } from "@/lib/seo/knowledge";
import { videoJsonLd } from "@/lib/seo/video";
import { serializeJsonLd } from "@/lib/seo/policy";
import { siteUrl } from "@/lib/seo/site";
import BackButton from "@/components/ui/back-button/BackButton";

import PageLayout from "@/components/layout/PageLayout";
import { getKnowledgeVideoBySlugFromStrapi } from "@/lib/api/knowledge";
import styles from "@/components/knowledge/Reading.module.css";
import { formatRelativeFromIsoDate } from "@/lib/date/relativeDate";
import ShareButton from "@/components/ui/share-button/ShareButton";

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
    image: knowledgeImage(item.coverSrc, siteUrl),
  });
}

export default async function KnowledgeVideoPage({ params }: PageProps) {
  const { slug } = await params;

  const item = await getKnowledgeVideoBySlugFromStrapi(slug);

  if (!item) notFound();

  const structuredData = videoJsonLd(item, siteUrl);

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/knowledge", label: "Знания" },
        { href: `/knowledge/videos/${item.slug}`, label: item.title },
      ]}>
      <article className={styles.page}>
        {structuredData && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
        )}
        {/* Верхняя часть страницы */}
        <BackButton />


          {/* Заголовок и действия */}
          <header className={styles.header}>
            <h1 className={styles.title}>{item.title}</h1>

            <div className={styles.actions}>
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

          {/* Описание */}
          {item.description ? <ReadingBody slug={item.slug} blocks={[{ type: "text", id: "description", content: item.description }]} /> : null}

          {(item.externalUrl || item.links.length > 0) && (
            <nav className={styles.resources} aria-label="Видео и дополнительные материалы">
              {item.externalUrl && (
                <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                  Открыть видео на площадке ↗
                </a>
              )}
              {item.links.map((link) => (
                <div key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title} ↗</a>
                  {link.description && <p>{link.description}</p>}
                </div>
              ))}
            </nav>
          )}
        <KnowledgeTools slug={item.slug} />
      </article>
    </PageLayout>
  );
}
