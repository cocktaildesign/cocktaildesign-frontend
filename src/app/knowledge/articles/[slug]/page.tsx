// frontend/src/app/knowledge/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import ContentImage from "@/components/knowledge/ContentImage";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { knowledgeCatalog } from "@/lib/seo/related-content";

import { pageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, knowledgeImage } from "@/lib/seo/knowledge";
import { serializeJsonLd } from "@/lib/seo/policy";
import { siteUrl } from "@/lib/seo/site";
import { formatRelativeFromIsoDate } from "@/lib/date/relativeDate";

import PageLayout from "@/components/layout/PageLayout";
import BackButton from "@/components/ui/back-button/BackButton";
import ShareButton from "@/components/ui/share-button/ShareButton";
import TelegramBanner from "@/sections/telegram-cta/TelegramCta";
import { getKnowledgeArticleBySlugFromStrapi } from "@/lib/api/knowledge";
import styles from "./ArticlePage.module.css";

type Params = {
  slug: string;
};

type PageProps = {
  params: Promise<Params>;
};

function assertNever(value: never): never {
  throw new Error(`Unhandled block variant: ${JSON.stringify(value)}`);
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const item = await getKnowledgeArticleBySlugFromStrapi(slug);

  if (!item) {
    return {};
  }

  return pageMetadata({
    title: item.title,
    description: item.description,
    canonical: `/knowledge/articles/${item.slug}`,
    image: knowledgeImage(item.coverSrc, siteUrl),
    type: "article",
  });
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const item = await getKnowledgeArticleBySlugFromStrapi(slug);

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd(item, siteUrl)) }} />
        {/* Верхняя строка */}
        <div className={styles.up}>
          <BackButton />

          <p className={styles.detailMeta}>
            Опубликовано:{" "}
            <time dateTime={item.date} title={item.date}>
              {formatRelativeFromIsoDate(item.date)}
            </time>
          </p>
        </div>

        {/* Заголовок статьи */}
        <header className={styles.detailHeader}>
          <h1 className={styles.detailTitle}>{item.title}</h1>

          <div className={styles.metaRow}>
            <div className={styles.actions}>
              <p className={styles.detailMeta}>{item.readTime}</p>

              <ShareButton
                url={`${siteUrl}/knowledge/articles/${item.slug}`}
                title={item.title}
              />
            </div>
          </div>
        </header>

        {/* Контент статьи */}
        <div className={styles.detailBody}>
          {item.blocks.map((block, index) => {
            const blockKey = `${block.type}-${block.id}-${index}`;

            switch (block.type) {
              case "heading": {
                const Tag = block.level === 2 ? "h2" : "h3";

                return (
                  <Tag key={blockKey} className={styles[`heading${block.level}`]}>
                    {block.content}
                  </Tag>
                );
              }

              case "text": {
                return (
                  <p key={blockKey} className={styles.paragraph}>
                    {block.content}
                  </p>
                );
              }

              case "list": {
                const ListTag = block.ordered ? "ol" : "ul";

                return (
                  <ListTag key={blockKey} className={styles.list}>
                    {block.items.map((itemText, itemIndex) => (
                      <li key={`${blockKey}-${itemIndex}`} className={styles.listItem}>
                        {itemText}
                      </li>
                    ))}
                  </ListTag>
                );
              }

              case "image": {
                return (
                  <figure key={blockKey} className={styles.figure}>
                    <ContentImage block={block} className={styles.image} priority={index < 2} />
                    {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
                  </figure>
                );
              }

              case "link": {
                return (
                  <div key={blockKey} className={styles.linkBlock}>
                    <a className={styles.link} href={block.url} target="_blank" rel="noopener noreferrer">
                      {block.title}
                    </a>

                    {block.description ? <p className={styles.linkDescription}>{block.description}</p> : null}
                  </div>
                );
              }

              default: {
                return assertNever(block);
              }
            }
          })}
        </div>
        <RelatedLinks title="По теме в каталоге" links={knowledgeCatalog[item.slug]} />
      </article>

      <TelegramBanner />
    </PageLayout>
  );
}
