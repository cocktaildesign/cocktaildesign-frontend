import { notFound } from "next/navigation";
import Image from "next/image";

import { pageMetadata } from "@/lib/seo/metadata";
import { formatRelativeFromIsoDate } from "@/lib/date/relativeDate";

import PageLayout from "@/components/layout/PageLayout";
import BackButton from "@/components/ui/back-button/BackButton";
import ShareButton from "@/components/ui/share-button/ShareButton";
import TelegramBanner from "@/sections/telegram-cta/TelegramCta";
import { getKnowledgeArticleDetailBySlug } from "../../data";
import styles from "./ArticlePage.module.css";

type Params = {
  slug: string; // slug из сегмента /knowledge/articles/[slug]
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const item = getKnowledgeArticleDetailBySlug(slug);

  if (!item) {
    return {};
  }

  return pageMetadata({
    title: item.title,
    description: item.description,
    canonical: `/knowledge/articles/${item.slug}`,
  });
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const item = getKnowledgeArticleDetailBySlug(slug);

  if (!item) {
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
        <div className={styles.up}>
          <BackButton />

          <p className={styles.detailMeta}>
            Опубликовано:{" "}
            <time dateTime={item.date} title={item.date}>
              {formatRelativeFromIsoDate(item.date)}
            </time>
          </p>
        </div>

        <header className={styles.detailHeader}>
          <h1 className={styles.detailTitle}>{item.title}</h1>

          <div className={styles.metaRow}>
            <div className={styles.actions}>
              <p className={styles.detailMeta}>{item.readTime}</p>

              <ShareButton
                url={`${process.env.NEXT_PUBLIC_SITE_URL}/knowledge/articles/${item.slug}`}
                title={item.title}
              />
            </div>
          </div>
        </header>

        <div className={styles.detailBody}>
          {item.blocks.map((block, index) => {
            // 1) Заголовок секции
            if (block.type === "heading") {
              const Tag = block.level === 2 ? "h2" : "h3";

              return (
                <Tag key={index} className={styles[`heading${block.level}`]}>
                  {block.content}
                </Tag>
              );
            }

            // 2) Абзац текста
            if (block.type === "text") {
              return (
                <p key={`block-${index}`} className={styles.paragraph}>
                  {block.content}
                </p>
              );
            }

            // 3) Список
            if (block.type === "list") {
              const ListTag = block.ordered ? "ol" : "ul";

              return (
                <ListTag key={`block-${index}`} className={styles.list}>
                  {block.items.map((itemText, itemIndex) => (
                    <li key={`li-${index}-${itemIndex}`} className={styles.listItem}>
                      {itemText}
                    </li>
                  ))}
                </ListTag>
              );
            }

            // 4) Картинка (с подписью)
            return (
              <figure key={`block-${index}`} className={styles.figure}>
                <Image src={block.src} alt={block.alt ?? ""} width={870} height={490} className={styles.image} />

                {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
              </figure>
            );
          })}
        </div>
      </article>

      <TelegramBanner />
    </PageLayout>
  );
}
