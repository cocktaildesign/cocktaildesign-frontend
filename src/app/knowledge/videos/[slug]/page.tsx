import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo/metadata";

import PageLayout from "@/components/layout/PageLayout";
import { getKnowledgeVideoDetailBySlug } from "../../data";
import styles from "./VideoPage.module.css";
import { title } from "process";

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
        <header className={styles.header}>
          <h1 className={styles.title}>{item.title}</h1>

          <div className={styles.metaRow}>
            <p className={styles.meta}>
              <time dateTime={item.date}>{item.date}</time>
            </p>

            <span className={styles.separator} aria-hidden="true">
              •
            </span>

            <p className={styles.meta}>{item.duration}</p>
          </div>
        </header>

        {/* Пока заглушка — позже подставим iframe VK/YouTube */}
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

        <div className={styles.body}>{item.description ? <p>{item.description}</p> : null}</div>
      </article>
    </PageLayout>
  );
}
