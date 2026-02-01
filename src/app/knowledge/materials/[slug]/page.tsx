import { notFound } from "next/navigation";
import Image from "next/image";

import { pageMetadata } from "@/lib/seo/metadata";
import { formatRelativeFromIsoDate } from "@/lib/date/relativeDate";

import PageLayout from "@/components/layout/PageLayout";
import BackButton from "@/components/ui/back-button/BackButton";
import ShareButton from "@/components/ui/share-button/ShareButton";
import TelegramBanner from "@/sections/telegram-cta/TelegramCta";
import { getKnowledgeMaterialDetailBySlug } from "../../data";
import styles from "./MaterialPage.module.css";

type Params = {
  slug: string; // slug из сегмента /knowledge/material/[slug]
};

type PageProps = {
  params: Promise<Params>;
};

function assertNever(value: never): never {
  throw new Error(`Unhandled block variant: ${JSON.stringify(value)}`);
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const item = getKnowledgeMaterialDetailBySlug(slug);

  if (!item) {
    return {};
  }

  return pageMetadata({
    title: item.title,
    description: item.description,
    canonical: `/knowledge/materials/${item.slug}`,
  });
}

export default async function KnowledgeMaterialPage({ params }: PageProps) {
  const { slug } = await params;

  const item = getKnowledgeMaterialDetailBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <PageLayout
      breadcrumbsItems={[
        { href: "/", label: "Главная" },
        { href: "/knowledge", label: "Знания" },
        { href: `/knowledge/materials/${item.slug}`, label: item.title },
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
              <p className={styles.detailMeta}>{item.label}</p>

              <ShareButton
                url={`${process.env.NEXT_PUBLIC_SITE_URL}/knowledge/materials/${item.slug}`}
                title={item.title}
              />
            </div>
          </div>
        </header>

        <div className={styles.detailBody}>
          {item.blocks.map((block) => {
            switch (block.type) {
              case "heading": {
                const Tag = block.level === 2 ? "h2" : "h3";

                return (
                  <Tag key={block.id} className={styles[`heading${block.level}`]}>
                    {block.content}
                  </Tag>
                );
              }

              case "text": {
                return (
                  <p key={block.id} className={styles.paragraph}>
                    {block.content}
                  </p>
                );
              }

              case "list": {
                const ListTag = block.ordered ? "ol" : "ul";

                return (
                  <ListTag key={block.id} className={styles.list}>
                    {block.items.map((itemText) => (
                      <li key={`${block.id}-${itemText}`} className={styles.listItem}>
                        {itemText}
                      </li>
                    ))}
                  </ListTag>
                );
              }

              case "image": {
                return (
                  <figure key={block.id} className={styles.figure}>
                    <Image src={block.src} alt={block.alt ?? ""} width={870} height={490} className={styles.image} />
                    {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
                  </figure>
                );
              }

              case "link": {
                return (
                  <div key={block.id} className={styles.linkBlock}>
                    <a className={styles.link} href={block.url} target="_blank" rel="noopener noreferrer">
                      {block.title}
                    </a>

                    {/* Описание (необязательно) */}
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
      </article>

      <TelegramBanner />
    </PageLayout>
  );
}
