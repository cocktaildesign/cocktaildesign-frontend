import type { ReactNode } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { company } from "@/lib/legal/company";
import { pageMetadata } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/policy";
import { siteUrl } from "@/lib/seo/site";
import AboutPhoto from "./AboutPhoto";
import { aboutMedia, ownProductsUrl, publications, timeline } from "./about-content";
import styles from "./AboutPage.module.css";

export const metadata = pageMetadata({
  title: "О нас: мастерская барных инструментов",
  description: "Cocktail Design — барный инвентарь из Санкт-Петербурга. История с 2016 года, собственные разработки, мастерская и награды Barproof. Изделия для баров и индивидуальные проекты.",
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
      url: `${siteUrl}/about`, name: "О Cocktail Design — мастерская барных инструментов",
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

export default function AboutPage() {
  return (
    <PageLayout>
      <article className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Cocktail Design · Санкт-Петербург</p>
            <h1 id="about-title">Барный инвентарь, созданный барменами</h1>
            <p className={styles.lead}>С 2016 года соединяем опыт работы за баром, дизайн и собственное производство.</p>
            <p className={styles.heroDescription}>Создаём свои инструменты и выбираем изделия других брендов — для профессионалов и тех, кто увлечён барной культурой.</p>
            <Link href={ownProductsUrl} className={styles.textLink}>Наши инструменты<Arrow /></Link>
          </div>
          <AboutPhoto photo={aboutMedia.hero} priority sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1408px) 54vw, 720px" className={styles.heroPhoto} />
        </section>
        <ul className={styles.facts} aria-label="О Cocktail Design в трёх фактах">
          <li>С 2016 года</li><li>Санкт-Петербург</li><li>Собственное производство</li>
        </ul>

        <section className={styles.section} aria-labelledby="workshop-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>От идеи к предмету</p><h2 id="workshop-title">Своя мастерская в Петербурге</h2></div>
            <p>Разрабатываем форму, работаем с металлом и доводим инструмент до готового результата. В производстве сочетаются оборудование и ручная работа.</p>
          </div>
          {aboutMedia.video?.kind === "external" ? (
            <a className={styles.videoLink} href={aboutMedia.video.href} target="_blank" rel="noopener noreferrer"
              aria-label="Смотреть видео Cocktail Design в VK (в новой вкладке)">
              <AboutPhoto photo={aboutMedia.workshop} sizes="(max-width: 1408px) calc(100vw - 48px), 1360px" className={styles.workshopPhoto} />
              <span className={styles.videoPlay} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
              </span>
              <span className={styles.videoOverlay}><span>{aboutMedia.video.title}</span><span>Смотреть видео в VK <Arrow external /></span></span>
            </a>
          ) : aboutMedia.video?.kind === "file" ? (
            <figure className={`${styles.figure} ${styles.workshopPhoto}`}>
              <video controls preload="none" poster={aboutMedia.workshop.src} playsInline aria-label={aboutMedia.video.title} width={1440} height={810}>
                <source src={aboutMedia.video.src} />
                {aboutMedia.video.captionsSrc && <track kind="captions" src={aboutMedia.video.captionsSrc} srcLang="ru" label="Русский" default />}
                <a href={aboutMedia.video.src}>Открыть видео «{aboutMedia.video.title}»</a>
              </video>
              <figcaption>{aboutMedia.video.title}</figcaption>
            </figure>
          ) : <AboutPhoto photo={aboutMedia.workshop} sizes="(max-width: 1408px) calc(100vw - 48px), 1360px" className={styles.workshopPhoto} />}
          <div className={styles.processNotes}>
            <p><span>01 / Форма</span>Продумываем инструмент для работы за стойкой.</p>
            <p><span>02 / Детали</span>Соединяем материал, рисунок и удобство в руке.</p>
            <p><span>03 / Ваш характер</span>Добавляем гравировку и создаём индивидуальные изделия.</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.history}`} aria-labelledby="history-title">
          <div className={styles.historyIntro}>
            <p className={styles.eyebrow}>Наша история</p><h2 id="history-title">Всё началось за барной стойкой</h2>
            <p>Опыт основателя Cocktail Design Дмитрия Кравца стал отправной точкой для собственных инструментов — удобных в работе и узнаваемых по форме.</p>
          </div>
          <div className={styles.historyPortrait}>
            <AboutPhoto photo={aboutMedia.founder} sizes="(max-width: 760px) calc(100vw - 32px), 440px" className={styles.founderPhoto}>
              <strong>Дмитрий Кравец</strong><span className={styles.founderRole}>Основатель Cocktail Design</span>
            </AboutPhoto>
          </div>
          <ol className={styles.timeline} aria-label="Как развивался Cocktail Design">
            {timeline.map((event) => <li key={event.year}>
              <span className={styles.year}>{event.year}</span>
              <div className={styles.event}><h3>{event.title}</h3><p>{event.text}</p>
                {"href" in event && <ExternalLink href={event.href}>{event.source}</ExternalLink>}
              </div>
            </li>)}
          </ol>
          <div className={styles.historyTool}>
            <AboutPhoto photo={aboutMedia.earlyTool} sizes="(max-width: 760px) calc(100vw - 32px), 440px" className={styles.earlyToolPhoto} />
            <p>Одними из первых изделий стали геометрические стрейнеры. С них началась история наших собственных разработок.</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="team-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Люди и общее дело</p><h2 id="team-title">За каждым инструментом — команда</h2></div>
            <p>Люди, которые разрабатывают, создают и помогают выбрать. Мы обсуждаем идеи с барменами и остаёмся частью профессионального сообщества.</p>
          </div>
          <AboutPhoto photo={aboutMedia.team} sizes="(max-width: 1408px) calc(100vw - 48px), 1360px" className={styles.teamPhoto} />
          <div className={styles.communityFooter}>
            <p>Делимся опытом, пробуем новое и собираем полезные материалы о техниках, инструментах и людях барной индустрии.</p>
            <Link href="/knowledge" className={styles.textLink}>Знания и интервью<Arrow /></Link>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="press-title">
          <div className={styles.pressHeading}><p className={styles.eyebrow}>О нас — в разговоре</p><h2 id="press-title">Интервью и публикации</h2></div>
          <ul className={styles.pressGrid}>
            {publications.map((item) => <li key={item.href} className={styles.pressCard}>
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
