import type { ReactNode } from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { company } from "@/lib/legal/company";
import { pageMetadata } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/policy";
import { siteUrl } from "@/lib/seo/site";
import AboutPhoto from "./AboutPhoto";
import AboutVideo from "./AboutVideo";
import { aboutMedia, aboutVideo, awards, ownProductsUrl, publications } from "./about-content";
import styles from "./AboutPage.module.css";

export const metadata = pageMetadata({
  title: "О компании Cocktail Design — барный инвентарь из Петербурга",
  description: "Собственное производство барного инвентаря в Санкт-Петербурге с 2016 года. Инструменты Cocktail Design, команда, история мастерской, награды и индивидуальные проекты.",
  canonical: "/about", image: aboutMedia.hero.src,
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
    { "@type": "OnlineStore", "@id": `${siteUrl}/#organization`, name: "Cocktail Design", url: siteUrl, legalName: company.name,
      description: "Производитель барного инвентаря из Санкт-Петербурга и магазин изделий Cocktail Design и других брендов.",
      telephone: company.phone, email: company.email, founder: { "@type": "Person", name: "Дмитрий Кравец" }, sameAs: ["https://t.me/Cocktail_Design_official", "https://vk.ru/cocktail_design"] },
    { "@type": "AboutPage", "@id": `${siteUrl}/about#webpage`, url: `${siteUrl}/about`, name: "О компании Cocktail Design", inLanguage: "ru-RU",
      about: { "@id": `${siteUrl}/#organization` }, breadcrumb: { "@id": `${siteUrl}/about#breadcrumbs` } },
    { "@type": "BreadcrumbList", "@id": `${siteUrl}/about#breadcrumbs`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "О нас", item: `${siteUrl}/about` } ] },
  ],
};
const timeline = [
  { year: "2015", title: "Идея становится инструментом", text: "Первые чертежи, опыты с металлом и геометрические стрейнеры. Рабочее место — стол в съёмной квартире." },
  { year: "2016", title: "Первые встречи с покупателями", text: "19 августа — публичный анонс Cocktail Design. В сентябре показываем первую коллекцию на Moscow Bar Show и получаем заказы на собственные рисунки." },
  { year: "2017 / 2019", title: "Признание барного сообщества", text: "Награды Barproof: «Лучший бар-крафтсмен» в российской категории в 2017 году и Best bar craftsman в 2019-м.", awards: true },
  { year: "2020–2021", title: "Больше возможностей для бара", text: "Развиваем ассортимент, обновляем сайт и упаковку. К собственным изделиям подбираем инструменты других производителей, чтобы всё нужное можно было заказать вместе." },
  { year: "Сегодня", title: "Мастерская, магазин и команда", text: "Создаём коллекции, делаем гравировку, клише и индивидуальные проекты. Помогаем выбрать инвентарь и делимся опытом в разделе «Знания»." },
];

export default function AboutPage() {
  return <PageLayout>
    <article className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <section className={styles.hero} aria-labelledby="about-title">
        <div>
          <p className={styles.eyebrow}>Cocktail Design · Санкт-Петербург</p>
          <h1 id="about-title">Барный инвентарь, созданный барменами</h1>
          <p className={styles.lead}>С 2016 года соединяем опыт работы за стойкой, дизайн и собственное производство. Создаём инструменты, которыми приятно пользоваться каждый день.</p>
          <Link href={ownProductsUrl} className={styles.textLink}>Наши инструменты<Arrow /></Link>
        </div>
        <AboutPhoto photo={aboutMedia.hero} priority sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1408px) 50vw, 700px" className={styles.heroPhoto} />
      </section>
      <ul className={styles.facts} aria-label="О Cocktail Design в трёх фактах"><li>С 2016 года</li><li>Санкт-Петербург</li><li>Собственное производство</li></ul>

      <section id="video" className={styles.workshop} aria-labelledby="workshop-title">
        <div className={styles.sectionHeading}>
          <h2 id="workshop-title">Своя мастерская. Свой характер.</h2>
          <p>Разрабатываем форму, выбираем материал и доводим детали. В наших изделиях сочетаются работа оборудования и ручная обработка — от первых эскизов до готового инструмента.</p>
        </div>
        <AboutVideo media={aboutVideo} />
      </section>

      <section id="history" className={styles.history} aria-labelledby="history-title">
        <div className={styles.sectionHeading}><h2 id="history-title">Как развивался Cocktail Design</h2><p>От первых стрейнеров за домашним столом — к собственной мастерской и магазину.</p></div>
        <div className={styles.historyGrid}>
          <div className={styles.historyIntro}>
            <AboutPhoto photo={aboutMedia.homeWorkshop} sizes="(max-width: 760px) calc(100vw - 32px), 470px" className={styles.archivePhoto} />
            <div className={styles.founderNote}><h3>Всё началось с опыта за баром</h3>
              <p>Основатель компании Дмитрий Кравец искал способ воплотить свои идеи в металле. Первые изделия делал дома, совмещая работу над ними со сменами за стойкой. С этого рабочего стола началась история собственной мастерской и команды.</p></div>
          </div>
          <ol className={styles.timeline} aria-label="История Cocktail Design по годам">
            {timeline.map(event => <li key={event.year}><span className={styles.year}>{event.year}</span>
              <div className={styles.event}><h3>{event.title}</h3><p>{event.text}</p>
                {event.awards && <div className={styles.awardLinks}>{awards.map(award => <ExternalLink key={award.year} href={award.href}>Barproof {award.year}</ExternalLink>)}</div>}
              </div></li>)}
          </ol>
        </div>
        <div className={styles.fullStory}><div><h3>У каждого инструмента есть история. У нас — тоже.</h3><p>Как идея бармена стала мастерской, а первые заказы — делом целой команды. Рассказываем о людях, находках и решениях, которые создали Cocktail Design.</p></div>
          <Link href="/about/history" className={styles.storyLink}>Читать историю компании</Link></div>
      </section>

      <section id="team" className={styles.team} aria-labelledby="team-title">
        <div className={styles.sectionHeading}><h2 id="team-title">За каждым инструментом — команда</h2><p>Придумываем, изготавливаем, помогаем выбрать и собираем заказы. У каждого своя работа, а внимание к деталям — общее.</p></div>
        <AboutPhoto photo={aboutMedia.team} sizes="(max-width: 1072px) calc(100vw - 32px), 1040px" className={styles.teamPhoto} />
        <div className={styles.teamFooter}><p>Мы выросли из барного сообщества и остаёмся его частью. Обсуждаем идеи с барменами, делимся опытом и развиваем инструменты вместе с людьми, которые ими работают.</p></div>
      </section>

      <section id="publications" className={styles.pressSection} aria-labelledby="press-title">
        <h2 id="press-title">Интервью и публикации</h2>
        <ul className={styles.pressList}>{publications.map(item => <li key={item.href}>
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.pressLink}>
            <span className={styles.pressMeta}>{item.publisher}{item.year && <span> · {item.year}</span>}</span>
            <div><h3>{item.title}</h3><p className={styles.pressKind}>{item.kind}</p></div>
            <span className={styles.srOnly}> (в новой вкладке)</span>
          </a>
        </li>)}</ul>
      </section>
      <section className={styles.final} aria-labelledby="final-title">
        <div><h2 id="final-title">От нашей мастерской — к вашей стойке</h2><p>Выбирайте готовые инструменты. А если у вас своя идея — поможем с <Link href="/branding">изготовлением на заказ</Link>.</p></div>
        <Link href={ownProductsUrl} className={styles.primaryLink}>Смотреть наши изделия</Link>
      </section>
    </article>
  </PageLayout>;
}
