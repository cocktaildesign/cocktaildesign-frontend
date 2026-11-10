import type { ReactNode } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { company } from "@/lib/legal/company";
import { pageMetadata } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/policy";
import { siteUrl } from "@/lib/seo/site";
import AboutPhoto from "./AboutPhoto";
import { aboutMedia, aboutVideo, awards, ownProductsUrl, publications } from "./about-content";
import { storyChapters } from "./about-story";
import styles from "./AboutPage.module.css";

export const metadata = pageMetadata({
  title: "О нас: история и мастерская Cocktail Design",
  description: "Как Cocktail Design вырос из первых стрейнеров за домашним столом в мастерскую и магазин барного инвентаря. История с 2016 года, команда, архивные фотографии и Barproof.",
  canonical: "/about",
});
function Arrow({ external = false }: { external?: boolean }) {
  return <span aria-hidden="true" className={styles.arrow}>{external ? "↗" : "→"}</span>;
}
function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={styles.textLink}>{children}<Arrow external /><span className={styles.srOnly}> (в новой вкладке)</span></a>;
}
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore", "@id": `${siteUrl}/#organization`,
      name: "Cocktail Design", url: siteUrl, legalName: company.name,
      description: "Производитель барного инвентаря из Санкт-Петербурга и магазин изделий Cocktail Design и других брендов.",
      telephone: company.phone, email: company.email,
      sameAs: ["https://t.me/Cocktail_Design_official", "https://vk.ru/cocktail_design"],
    },
    {
      "@type": "AboutPage", "@id": `${siteUrl}/about#webpage`,
      url: `${siteUrl}/about`, name: "О Cocktail Design — история и мастерская",
      inLanguage: "ru-RU", about: { "@id": `${siteUrl}/#organization` },
      breadcrumb: { "@id": `${siteUrl}/about#breadcrumbs` },
    },
    {
      "@type": "BreadcrumbList", "@id": `${siteUrl}/about#breadcrumbs`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "О нас", item: `${siteUrl}/about` },
      ],
    },
  ],
};
const halfWidth = "(max-width: 760px) calc(100vw - 32px), (max-width: 1408px) 46vw, 620px";

function ChapterMedia({ id }: { id: string }) {
  if (id === "first-prototypes") return <AboutPhoto photo={aboutMedia.homeWorkshop} sizes={halfWidth} className={styles.homePhoto} />;
  if (id === "first-exhibition") return <div className={styles.archivePair}>
    <AboutPhoto photo={aboutMedia.exhibition} sizes="(max-width: 760px) calc((100vw - 48px) / 2), 300px" />
    <AboutPhoto photo={aboutMedia.packaging} sizes="(max-width: 760px) calc((100vw - 48px) / 2), 300px" />
  </div>;
  if (id === "workshop-and-shop") return <div className={styles.recognition}>
    <AboutPhoto photo={aboutMedia.award} sizes={halfWidth} />
    <ul className={styles.awards} aria-label="Награды Cocktail Design">
      {awards.map(award => <li key={award.year}>
        <span className={styles.awardYear}>{award.year}</span>
        <div><h4>{award.title}</h4><p>{award.text}</p><ExternalLink href={award.href}>{award.source}</ExternalLink></div>
      </li>)}
    </ul>
  </div>;
  return null;
}

export default function AboutPage() {
  return (
    <PageLayout>
      <article className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Cocktail Design · Санкт-Петербург</p>
            <h1 id="about-title">Барный инвентарь, созданный барменами</h1>
            <p className={styles.lead}>Начали с собственных стрейнеров за домашним столом. Сегодня создаём инструменты и помогаем собрать всё для работы за баром.</p>
            <p className={styles.heroDescription}>С 2016 года создаём свои коллекции и индивидуальные проекты. Сегодня в нашем магазине — изделия Cocktail Design и других брендов.</p>
            <Link href={ownProductsUrl} className={styles.textLink}>Наши инструменты<Arrow /></Link>
          </div>
          <AboutPhoto photo={aboutMedia.hero} priority sizes={halfWidth} className={styles.heroPhoto} />
        </section>
        <ul className={styles.facts} aria-label="О Cocktail Design в трёх фактах">
          <li>С 2016 года</li><li>Санкт-Петербург</li><li>Собственное производство</li>
        </ul>
        <nav className={styles.pageNav} aria-label="Разделы страницы о компании">
          <a href="#history">История</a><a href="#team">Команда</a><a href="#video">Видео</a><a href="#publications">Публикации</a>
        </nav>

        <section id="history" className={styles.history} aria-labelledby="history-title">
          <div className={styles.storyIntro}>
            <p className={styles.eyebrow}>Наша история</p>
            <h2 id="history-title">Всё началось за барной стойкой</h2>
            <p>О первых попытках, людях рядом и решениях, из которых вырос Cocktail Design.</p>
          </div>
          {storyChapters.map(chapter => {
            const hasMedia = ["first-prototypes", "first-exhibition", "workshop-and-shop"].includes(chapter.id);
            return <section key={chapter.id} id={chapter.id} aria-labelledby={`${chapter.id}-title`}
              className={`${styles.chapter} ${hasMedia ? styles.chapterWithMedia : styles.chapterPlain} ${chapter.id === "first-exhibition" ? styles.chapterPhotoLeft : ""}`}>
              <div className={styles.chapterCopy}>
                <header className={styles.chapterHeading}>
                  <p className={styles.period}>{chapter.period}</p>
                  <h3 id={`${chapter.id}-title`}>{chapter.title}</h3>
                </header>
                <div className={styles.prose}>{chapter.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
              </div>
              {hasMedia && <div className={styles.chapterMedia}><ChapterMedia id={chapter.id} /></div>}
            </section>;
          })}
        </section>

        <section id="team" className={styles.team} aria-labelledby="team-title">
          <div className={styles.teamCopy}>
            <p className={styles.eyebrow}>Люди и общее дело</p>
            <h2 id="team-title">За каждым инструментом — команда</h2>
            <p>Придумать форму, довести детали, помочь с выбором и собрать заказ. За каждым из этих шагов стоят люди.</p>
            <p>Мы остаёмся частью барного сообщества: обсуждаем идеи, делимся опытом и собираем полезные материалы для тех, кто работает за стойкой.</p>
            <Link href="/knowledge" className={styles.textLink}>Знания и интервью<Arrow /></Link>
          </div>
          <AboutPhoto photo={aboutMedia.team} sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1408px) 60vw, 850px" className={styles.teamPhoto} />
        </section>

        <section id="video" className={styles.videoSection} aria-labelledby="video-title">
          <div>
            <p className={styles.eyebrow}>Видео</p>
            <h2 id="video-title">{aboutVideo.title}</h2>
            <p>Ещё немного о нашем мире — в видео из сообщества.</p>
          </div>
          <a href={aboutVideo.href} target="_blank" rel="noopener noreferrer" className={styles.videoLink}
            aria-label="Смотреть видео Cocktail Design в VK (в новой вкладке)">
            <span className={styles.videoPlay} aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></span>
            <span><strong>Смотреть видео</strong><span className={styles.videoProvider}>VK Видео</span></span>
            <Arrow external />
          </a>
        </section>

        <section id="publications" className={styles.pressSection} aria-labelledby="press-title">
          <div className={styles.pressHeading}><p className={styles.eyebrow}>Продолжение истории</p><h2 id="press-title">Интервью и публикации</h2></div>
          <ul className={styles.pressGrid}>
            {publications.map(item => <li key={item.href} className={styles.pressCard}>
              <p className={styles.pressMeta}>{item.publisher}{item.year && <span> · {item.year}</span>}</p>
              <h3>{item.title}</h3><p className={styles.pressDescription}>{item.description}</p>
              <p className={styles.pressKind}>{item.kind}</p><ExternalLink href={item.href}>{item.label}</ExternalLink>
            </li>)}
          </ul>
        </section>
        <aside className={styles.support} aria-labelledby="support-title">
          <h2 id="support-title">Остаёмся на связи</h2>
          <div><p>Поможем с выбором инструмента, уходом и вопросами по вашим изделиям.</p><Link href="/contacts" className={styles.textLink}>Связаться с нами<Arrow /></Link></div>
        </aside>
        <section className={styles.final} aria-labelledby="final-title">
          <p className={styles.eyebrow}>Продолжение — в ваших руках</p><h2 id="final-title">От нашей мастерской — к вашей стойке</h2>
          <div className={styles.finalActions}>
            <Link href={ownProductsUrl} className={styles.primaryLink}>Смотреть наши изделия<Arrow /></Link>
            <Link href="/branding" className={styles.textLink}>Брендинг и изготовление на заказ<Arrow /></Link>
          </div>
          <p className={styles.finalNote}>В магазине — изделия Cocktail Design и товары других брендов.</p>
        </section>
      </article>
    </PageLayout>
  );
}
