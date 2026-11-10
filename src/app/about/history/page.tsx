import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { pageMetadata } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/policy";
import { siteUrl } from "@/lib/seo/site";
import AboutPhoto from "../AboutPhoto";
import { aboutMedia, ownProductsUrl } from "../about-content";
import { storyChapters } from "../about-story";
import styles from "./HistoryPage.module.css";

export const metadata = pageMetadata({
  title: "История Cocktail Design: от первых стрейнеров к мастерской",
  description: "Как появились первые инструменты Cocktail Design: домашние прототипы, Moscow Bar Show 2016, собственная мастерская, команда и магазин. Рассказ с архивными фотографиями.",
  canonical: "/about/history",
});

const breadcrumbs = [
  { href: "/", label: "Главная" },
  { href: "/about", label: "О нас" },
  { href: "/about/history", label: "История компании" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/about/history#webpage`,
      url: `${siteUrl}/about/history`,
      name: "История Cocktail Design",
      description: "От первых стрейнеров за домашним столом до мастерской и магазина барного инвентаря.",
      inLanguage: "ru-RU",
      about: { "@id": `${siteUrl}/#organization` },
      isPartOf: { "@type": "WebSite", url: siteUrl },
      breadcrumb: { "@id": `${siteUrl}/about/history#breadcrumbs` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/about/history#breadcrumbs`,
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: `${siteUrl}${crumb.href === "/" ? "" : crumb.href}`,
      })),
    },
  ],
};

const photoSizes = "(max-width: 792px) calc(100vw - 32px), 760px";

function ArchivePhotos({ chapterId }: { chapterId: string }) {
  if (chapterId === "first-prototypes") {
    return <AboutPhoto photo={aboutMedia.homeWorkshop} sizes={photoSizes} className={styles.archivePhoto} />;
  }

  if (chapterId === "first-exhibition") {
    return (
      <div className={styles.photoPair}>
        <AboutPhoto photo={aboutMedia.exhibition} sizes="(max-width: 792px) calc((100vw - 48px) / 2), 372px" className={styles.archivePhoto} />
        <AboutPhoto photo={aboutMedia.packaging} sizes="(max-width: 792px) calc((100vw - 48px) / 2), 372px" className={styles.archivePhoto} />
      </div>
    );
  }

  if (chapterId === "workshop-and-shop") {
    return <AboutPhoto photo={aboutMedia.award} sizes={photoSizes} className={styles.archivePhoto} />;
  }

  return null;
}

export default function HistoryPage() {
  return (
    <PageLayout breadcrumbsItems={breadcrumbs}>
      <article className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
        <header className={styles.intro}>
          <Link href="/about" className={styles.returnLink}><span aria-hidden="true">←</span> О компании</Link>
          <p className={styles.eyebrow}>История Cocktail Design</p>
          <h1>От домашнего стола до своей мастерской</h1>
          <p className={styles.lead}>Как опыт работы за баром превратился в первые инструменты, а небольшое дело — в производство, магазин и команду.</p>
        </header>

        <div className={styles.chapters}>
          {storyChapters.map(chapter => (
            <section key={chapter.id} id={chapter.id} className={styles.chapter} aria-labelledby={`${chapter.id}-title`}>
              <header className={styles.chapterHeading}>
                <p className={styles.period}>{chapter.period}</p>
                <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
              </header>
              <div className={styles.prose}>
                {chapter.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </div>
              <ArchivePhotos chapterId={chapter.id} />
            </section>
          ))}
        </div>

        <footer className={styles.continue}>
          <h2>История продолжается в нашей работе</h2>
          <div className={styles.links}>
            <Link href="/about">О компании сегодня <span aria-hidden="true">→</span></Link>
            <Link href={ownProductsUrl}>Наши инструменты <span aria-hidden="true">→</span></Link>
          </div>
        </footer>
      </article>
    </PageLayout>
  );
}
