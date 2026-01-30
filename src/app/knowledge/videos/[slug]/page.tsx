// frontend/src/app/knowledge/videos/[slug]/page.tsx

import { notFound } from "next/navigation"; // Next.js: серверный 404 для App Router
import { pageMetadata } from "@/lib/seo/metadata"; // Внутренняя утилита для SEO-метаданных
import BackButton from "@/components/ui/back-button/BackButton"; // UI: кнопка "назад" (client component)

import PageLayout from "@/components/layout/PageLayout"; // Общий лэйаут страницы + хлебные крошки
import { getKnowledgeVideoDetailBySlug } from "../../data"; // Данные именно для видео-детали (embedUrl и т.д.)
import styles from "./VideoPage.module.css"; // CSS Modules: стили только для этой страницы
import { formatRelativeFromIsoDate } from "@/lib/date/relativeDate"; // Утилита: "2 месяца назад"
import ShareButton from "@/components/ui/share-button/ShareButton"; // UI: поделиться (client component)

type Params = {
  slug: string; // Динамический сегмент маршрута: /knowledge/videos/[slug]
};

type PageProps = {
  // В твоей версии Next params приходит как Promise -> обязательно await
  params: Promise<Params>;
};

/**
 * Next.js (App Router): генерация SEO метаданных на сервере.
 * Здесь нельзя вызывать notFound() — просто возвращаем {} если данных нет.
 */
export async function generateMetadata({ params }: PageProps) {
  // 1) Получаем slug (обязателен await из-за Promise)
  const { slug } = await params;

  // 2) Берём детальные данные видео по slug
  const item = getKnowledgeVideoDetailBySlug(slug);

  // 3) Если видео не найдено — метаданные не отдаём
  if (!item) {
    return {};
  }

  // 4) Возвращаем SEO данные
  return pageMetadata({
    title: item.title,
    description: item.description,
    canonical: `/knowledge/videos/${item.slug}`,
  });
}

/**
 * Серверная страница видео: рендерится на сервере, iframe отдаём как есть.
 */
export default async function KnowledgeVideoPage({ params }: PageProps) {
  // 1) Получаем slug
  const { slug } = await params;

  // 2) Берём детальные данные видео (embedUrl обязателен на этой странице)
  const item = getKnowledgeVideoDetailBySlug(slug);

  // 3) Если нет данных — отдаём 404
  // (Проверка format оставлена как "защитная" — структуру не меняю)
  if (!item || item.format !== "video") {
    notFound();
  }

  return (
    <PageLayout
      // Хлебные крошки — часть UX и SEO: помогают навигации и пониманию структуры сайта
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/knowledge", label: "Знания" },
        { href: `/knowledge/videos/${item.slug}`, label: item.title },
      ]}>
      {/* Семантика: article — самостоятельный материал */}
      <article className={styles.videoPage}>
        {/* Кнопка "назад" (client): возвращает в историю или на /knowledge */}
        <BackButton />

        {/* Общий контейнер карточки-контента: фон, скругления, цвет текста */}
        <div className={styles.content}>
          {/* Плеер: контейнер отвечает за пропорции 16:9 и обрезку */}
          <div className={styles.player} role="group" aria-label="Видео">
            <iframe
              // src берём из данных (важно: не вставляем HTML из CMS, только URL)
              src={item.embedUrl}
              // a11y: название фрейма (скринридер)
              title={item.title}
              // perf: lazy-iframe (не грузим сразу, если ниже экрана)
              loading="lazy"
              // Разрешения для плеера
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              // Полноэкранный режим
              allowFullScreen
              // Растягиваем на контейнер
              className={styles.iframe}
            />
          </div>

          {/* Header: заголовок + мета-информация + действия (поделиться) */}
          <header className={styles.header}>
            {/* H1 — единственный заголовок страницы */}
            <h1 className={styles.title}>{item.title}</h1>

            {/* Ряд меты и действий: слева дата, справа кнопка */}
            <div className={styles.metaRow}>
              {/* Мета-информация: дата публикации */}
              <p className={styles.meta}>
                {/* dateTime = ISO для семантики/SEO, текст = "2 месяца назад" для UX */}
                <time dateTime={item.date} title={item.date}>
                  {formatRelativeFromIsoDate(item.date)}
                </time>
              </p>

              {/* Действия: кнопка "поделиться" */}
              <div className={styles.actions}>
                <ShareButton
                  // Абсолютный URL (чтобы корректно копировалось/шарилось)
                  url={`${process.env.NEXT_PUBLIC_SITE_URL}/knowledge/videos/${item.slug}`}
                  title={item.title}
                />
              </div>
            </div>
          </header>

          {/* Основной текст/описание материала */}
          <div className={styles.body}>
            {item.description ? <p className={styles.description}>{item.description}</p> : null}
          </div>
        </div>
      </article>
    </PageLayout>
  );
}
