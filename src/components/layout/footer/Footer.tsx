import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "../Container";
import Logo from "@/components/ui/logo/Logo";
import YandexIcon from "@/components/icons/YandexIcon";
import TelegramIcon from "@/components/icons/social-network/TelegramIcon";
import VKIcon from "@/components/icons/social-network/VKIcon";
import MaxIcon from "@/components/icons/social-network/MaxIcon";
import YouTubeIcon from "@/components/icons/social-network/YouTubeIcon";
import AnalyticsSettings from "@/components/analytics/AnalyticsSettings";
import { getNavigation } from "@/lib/api/navigation";
import { YANDEX_REVIEWS_URL } from "@/lib/reviews";
import styles from "./Footer.module.css";

type FooterLink = { label: string; href: string };
type FooterSocialLink = FooterLink & { icon: ReactNode };
type FooterSection = { title: string; links: FooterLink[] };

const footerMarketplaceLinks = [
  {
    label: "Ozon",
    href: "https://www.ozon.ru/seller/cocktail-design-1254183/",
    image: "/images/marketplaces/ozon-card.png",
    imageClassName: styles.footerMarketplaceLogoPadded,
  },
  {
    label: "Wildberries",
    href: "https://www.wildberries.ru/seller/58713",
    image: "/images/marketplaces/wildberries-card.png",
  },
  {
    label: "Яндекс Маркет",
    href: "https://market.yandex.ru/business--cocktail-design/736760?clid=703&ysclid=mtham0w16r20898382&generalContext=t%3DshopInShop%3Bi%3D1%3Bbi%3D736760%3B&searchContext=sins_ctx",
    image: "/images/marketplaces/yandex-market-card.png",
  },
];


const companyLinks: FooterLink[] = [
  { label: "О нас", href: "/about" },
  { label: "Наше производство", href: "/catalog/collection/nashe-proizvodstvo" },
  { label: "Брендинг и гравировка", href: "/branding" },
  { label: "Реквизиты", href: "/legal/requisites" },
];

const buyerLinks: FooterLink[] = [
  { label: "Доставка", href: "/shipping" },
  { label: "Оплата", href: "/payment-methods" },
  { label: "Возврат и гарантия", href: "/legal/returns" },
  { label: "Для баров и ресторанов", href: "/prof-oborudovanie-dlya-restoranov-i-kafe" },
  { label: "Система скидок", href: "/discounts" },
  { label: "Обратная связь", href: "/support/feedback" },
];

const collectionLinks: FooterLink[] = [
  { label: "Новинки", href: "/catalog/collection/novinki" },
  { label: "Скидки", href: "/catalog/collection/sale" },
  { label: "Уценка", href: "/catalog/collection/utsenka" },
];

const legalLinks: FooterLink[] = [
  { label: "Публичная оферта", href: "/legal/offer" },
  { label: "Обработка персональных данных", href: "/legal/privacy-policy" },
  { label: "Согласие для обратной связи", href: "/legal/consent" },
  { label: "Правовая информация", href: "/legal" },
];

// A short selection from the existing CMS navigation; hidden categories stay hidden.
// The complete category tree remains available through “Весь каталог”.
const categoryHrefs = [
  "/catalog/ms-35c38c23", "/catalog/ms-ba57d348", "/catalog/ms-c374b866",
  "/catalog/ms-ffa19e3a", "/catalog/ms-ad31a2a1", "/catalog/ms-e8de1bd2",
];

const footerKnowledgeLinks: FooterLink[] = [
  { label: "Техники и фишки", href: "/knowledge?tab=techniques" },
  { label: "Обучение", href: "/knowledge?tab=education" },
  { label: "Подкасты и интервью", href: "/knowledge?tab=podcasts" },
  { label: "Индустрия и культура", href: "/knowledge?tab=industry" },
  { label: "Материалы и ресурсы", href: "/knowledge?tab=resources" },
];

const footerSocialLinks: FooterSocialLink[] = [
  {
    label: "Telegram",
    href: "https://t.me/Cocktail_Design_official",
    icon: <TelegramIcon />,
  },
  {
    label: "VK",
    href: "https://vk.ru/cocktail_design",
    icon: <VKIcon />,
  },
  {
    label: "MAX",
    href: "https://max.ru/join/QQKS8__nbdrJTvRVrRSCdMBqinbSTzi34ReNX1TJw80",
    icon: <MaxIcon />,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@cocktaildesign-d7n?si=xtR34NMhHFghKq02",
    icon: <YouTubeIcon />,
  },
];


function Arrow({ external = false }: { external?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={external ? "M7 17 17 7M7 7h10v10" : "M4 12h15m-6-6 6 6-6 6"} />
  </svg>;
}

function FooterLinksList({ links }: { links: FooterLink[] }) {
  return <ul className={styles.footerList}>
    {links.map(link => <li key={link.href}>
      <Link href={link.href} className={styles.footerLink}>{link.label}</Link>
    </li>)}
  </ul>;
}

function SocialLinks() {
  return <nav className={styles.socialNav} aria-label="Каналы Cocktail Design в соцсетях">
    <h2 className={styles.secondaryTitle}>Мы в соцсетях</h2>
    <ul className={styles.socialList}>
      {footerSocialLinks.map(item => <li key={item.href}>
        <a href={item.href} target="_blank" rel="noopener noreferrer"
          aria-label={item.label + ": канал Cocktail Design, открыть в новой вкладке"} className={styles.socialLink}>
          {item.icon}
        </a>
      </li>)}
    </ul>
  </nav>;
}

function SectionContent({ section }: { section: FooterSection }) {
  return <>
    <FooterLinksList links={section.links} />
    {section.title === "Каталог" && <>
      <ul className={styles.collections} aria-label="Подборки товаров">
        {collectionLinks.map(link => <li key={link.href}>
          <Link href={link.href}>{link.label}</Link>
        </li>)}
      </ul>
      <Link href="/catalog" className={styles.actionLink}>Весь каталог <Arrow /></Link>
    </>}
  </>;
}

export default async function Footer() {
  const navigation = await getNavigation();
  const categoryLinks = categoryHrefs.flatMap(href => {
    const category = navigation.footer.find(item => item.href === href);
    return category ? [category] : [];
  });
  const sections: FooterSection[] = [
    { title: "Каталог", links: categoryLinks },
    { title: "Покупателям", links: buyerLinks },
    { title: "Компания", links: companyLinks },
    { title: "Знания", links: footerKnowledgeLinks },
  ];

  return <footer className={styles.footer}>
    <Container>
      <div className={styles.mainGrid}>
        <section className={styles.contactCard} aria-label="Контакты Cocktail Design">
          <Logo color="white" className={styles.logo} linkClassName={styles.logoLink} />
          <div className={styles.contactDetails}>
            <h2 className={`${styles.smallLabel} ${styles.contactHeading}`}>Контакты</h2>
            <a className={styles.phone} href="tel:+79956226202">+7 (995) 622-62-02</a>
            <a className={styles.email} href="mailto:cocktaildesign@yandex.ru">cocktaildesign@yandex.ru</a>
            <nav className={styles.managerLinks} aria-label="Написать менеджеру Cocktail Design">
              <span>Написать:</span>
              <a href="https://t.me/Manager_cocktail_design" target="_blank" rel="noopener noreferrer"
                aria-label="Написать менеджеру в Telegram, открыть в новой вкладке">Telegram</a>
              <a href="https://max.ru/u/f9LHodD0cOLWKnOz-T53SpORKXEy2ENCK_4sq882r9L9MRQzWWDdeYS4daM"
                target="_blank" rel="noopener noreferrer"
                aria-label="Написать менеджеру в MAX, открыть в новой вкладке">MAX</a>
            </nav>
            <div className={styles.hours}>
              <h3 className={styles.smallLabel}><span className={styles.hoursLabel}>Часы работы, </span>МСК</h3>
              <span>Пн–Пт: 10:00–18:00</span>
              <span>Сб–Вс: 10:00–17:00</span>
            </div>
          </div>
          <div className={styles.contactActions}>
            <Link href="/contacts" className={styles.actionLink}>Все контакты <Arrow /></Link>
            <a className={styles.reviews} href={YANDEX_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
              aria-label="Отзывы на Яндексе: открыть в новой вкладке">
              <YandexIcon className={styles.yandexIcon} aria-hidden="true" />
              <span>Отзывы</span>
            </a>
          </div>
        </section>

        <div className={styles.desktopNavigation}>
          {sections.map(section => <div key={section.title} className={styles.navigationColumn}>
            <nav aria-label={section.title + " в подвале"}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <SectionContent section={section} />
            </nav>
          </div>)}
        </div>
        <div className={styles.mobileNavigation}>
          {sections.map(section => <details key={section.title} className={styles.accordion}>
            <summary>{section.title}<span className={styles.chevron} aria-hidden="true" /></summary>
            <nav className={styles.accordionBody} aria-label={section.title + " в подвале"}>
              <SectionContent section={section} />
            </nav>
          </details>)}
        </div>
      </div>

      <div className={styles.secondaryRow}>
        <SocialLinks />
        <nav aria-label="Магазины Cocktail Design на маркетплейсах" className={styles.marketplaces}>
          <h2 className={styles.secondaryTitle}>Мы на маркетплейсах</h2>
          <ul className={styles.marketplaceList}>
            {footerMarketplaceLinks.map(item => <li key={item.label}>
              <a href={item.href} className={styles.marketplaceLink} target="_blank" rel="noopener noreferrer"
                aria-label={item.label + ": открыть наш магазин в новой вкладке"}>
                <span className={styles.marketplaceIcon}>
                  <Image src={item.image} className={item.imageClassName} alt="" width={32} height={32} loading="lazy" />
                </span>
                {item.label}<Arrow external />
              </a>
            </li>)}
          </ul>
        </nav>
        <aside aria-label="Подписка на Telegram-канал" className={styles.telegram}>
          <div>
            <h2 className={styles.secondaryTitle}>Telegram Cocktail Design</h2>
            <p>Новинки, производство и жизнь бренда.</p>
            <a className={styles.actionLink} href="https://t.me/Cocktail_Design_official" target="_blank" rel="noopener noreferrer"
              aria-label="Открыть Telegram-канал Cocktail Design в новой вкладке">Открыть канал <Arrow /></a>
          </div>
          <div className={styles.qr} aria-hidden="true">
            <Image src="/images/qr/tgQr.png" alt="" width={96} height={96} loading="lazy" sizes="96px" />
          </div>
        </aside>
      </div>

      <div className={styles.bottom}>
        <nav aria-label="Правовые документы"><ul className={styles.legalLinks}>
          {legalLinks.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
        </ul></nav>
        <p className={styles.legalNote}>Условия розничной покупки описаны в <Link href="/legal/offer">Публичной оферте</Link>.
          {" "}Заказы организаций и ИП согласовываются отдельно.</p>
        <div className={styles.analytics}><AnalyticsSettings /></div>
        <div className={styles.bottomLine}>
          <p>© 2015—{new Date().getFullYear()}. Cocktail Design. Все права защищены.<br />
            При полном или частичном использовании материалов с сайта ссылка на источник обязательна.</p>
          <a href="https://t.me/mazalovalex" target="_blank" rel="noopener noreferrer" className={styles.developer}>
            Разработка сайта <span>MazalovAlex</span>
          </a>
        </div>
      </div>
    </Container>
  </footer>;
}
