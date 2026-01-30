import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo/metadata";

import PageLayout from "@/components/layout/PageLayout";
import { getKnowledgeVideoDetailBySlug } from "../../data";
import styles from "./VideoPage.module.css";
import { formatRelativeFromIsoDate } from "@/lib/date/relativeDate";
import ShareButton from "@/components/ui/share-button/ShareButton";

type Params = {
  slug: string; // /knowledge/videos/[slug]
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps) {
  // Получаем slug из асинхронных params (контракт твоего App Router)
  const { slug } = await params;

  // Берём детальные данные видео по slug
  const item = getKnowledgeVideoDetailBySlug(slug);

  // Если видео не найдено — просто не отдаём метаданные
  if (!item) {
    return {};
  }

  // Формируем SEO-метаданные для страницы видео
  return pageMetadata({
    title: item.title,
    description: item.description,
    canonical: `/knowledge/videos/${item.slug}`,
  });
}

export default async function KnowledgeVideoPage({ params }: PageProps) {
  const { slug } = await params;

  const item = getKnowledgeVideoDetailBySlug(slug);

  // Видео-страница принимает только video
  if (!item || item.format !== "video") {
    notFound();
  }

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/knowledge", label: "Знания" },
        { href: `/knowledge/videos/${item.slug}`, label: item.title },
      ]}>
      <article className={styles.videoPage}>
        <div className={styles.player} role="group" aria-label="Видео">
          <iframe
            // Источник плеера: берём только URL из данных, без HTML из CMS.
            src={item.embedUrl}
            title={item.title}
            // Перф: не грузим тяжёлый iframe сразу, если он вне экрана.
            loading="lazy"
            // Минимально нужные разрешения.
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            // Разрешаем полноэкранный режим.
            allowFullScreen
            // Адаптив: растягиваем на контейнер.
            className={styles.iframe}
          />
        </div>

        <header className={styles.header}>
          {/* Заголовок страницы */}
          <h1 className={styles.title}>{item.title}</h1>

          {/* Ряд меты + действий */}
          <div className={styles.metaRow}>
            <p className={styles.meta}>
              <time dateTime={item.date} title={item.date}>
                {formatRelativeFromIsoDate(item.date)}
              </time>
            </p>

            <div className={styles.actions}>
              <ShareButton
                url={`${process.env.NEXT_PUBLIC_SITE_URL}/knowledge/videos/${item.slug}`}
                title={item.title}
              />
            </div>
          </div>
        </header>

        {/* Контент/описание — отдельно от меты */}
        <div className={styles.body}>{item.description ? <p>{item.description}</p> : null}</div>
      </article>
    </PageLayout>
  );
}
