import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

import Container from "../Container";
// import FooterFeedback from "./FooterFeedback";
import Logo from "@/components/ui/logo/Logo";

import StarIcon from "@/components/icons/StarIcon";
import YandexIcon from "@/components/icons/YandexIcon";
import TelegramIcon from "@/components/icons/social-network/TelegramIcon";
import TelegramIconFon from "@/components/icons/social-network/TelegramIconFon";
import VKIcon from "@/components/icons/social-network/VKIcon";
import MaxIcon from "@/components/icons/social-network/MaxIcon";
import YouTubeIcon from "@/components/icons/social-network/YouTubeIcon";

import { getNavigation } from "@/lib/api/navigation";
import { YANDEX_REVIEWS_URL } from "@/lib/reviews";

import styles from "./Footer.module.css";
import AnalyticsSettings from "@/components/analytics/AnalyticsSettings";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterSocialLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

type MobileFooterSection = {
  title: string;
  links: FooterLink[];
  ariaLabel: string;
};

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

export const footerCompanyLinks: FooterLink[] = [
  { label: "О нас", href: "/about" },
  { label: "Отзывы на Яндексе", href: YANDEX_REVIEWS_URL, external: true },
  { label: "Реквизиты", href: "/legal/requisites" },
  { label: "Каталог", href: "/catalog" },
  { label: "Для баров и ресторанов", href: "/prof-oborudovanie-dlya-restoranov-i-kafe" },
];

export const footerPromosLinks: FooterLink[] = [
  { label: "Система скидок", href: "/discounts" },
  { label: "Товары со скидкой", href: "/catalog/collection/sale" },
];

export const footerSupportLinks: FooterLink[] = [
  { label: "Обратная связь", href: "/support/feedback" },
  { label: "Контакты", href: "/contacts" },
];

export const footerDeliveryPaymentLinks: FooterLink[] = [
  { label: "Способы оплаты", href: "/payment-methods" },
  { label: "Способы доставки", href: "/shipping" },
];

export const footerLegalLinks: FooterLink[] = [
  { label: "Правовая информация", href: "/legal" },
  { label: "Обработка персональных данных", href: "/legal/privacy-policy" },
  { label: "Согласие для обратной связи", href: "/legal/consent" },
];

export const footerCustomLinks: FooterLink[] = [{ label: "Брендинг и Гравировка", href: "/branding" }];

export const footerKnowledgeLinks: FooterLink[] = [
  { label: "Техники и фишки", href: "/knowledge?tab=techniques" },
  { label: "Обучение", href: "/knowledge?tab=education" },
  { label: "Подкасты и интервью", href: "/knowledge?tab=podcasts" },
  { label: "Индустрия и культура", href: "/knowledge?tab=industry" },
  { label: "Материалы и ресурсы", href: "/knowledge?tab=resources" },
];

export const footerSocialLinks: FooterSocialLink[] = [
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

function FooterLinksList({ links }: { links: FooterLink[] }) {
  return (
    <ul className={styles.footerList}>
      {links.map((link) => (
        <li key={link.href} className={styles.footerItem}>
          {link.external ? (
            <a href={link.href} className={styles.footerLink} target="_blank" rel="noopener noreferrer"
              aria-label={`${link.label}: открыть в новой вкладке`}>
              {link.label}
            </a>
          ) : (
            <Link href={link.href} className={styles.footerLink}>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function Footer() {
  const navigation = await getNavigation();
  const currentYear = new Date().getFullYear();

  const mobileSections: MobileFooterSection[] = [
    {
      title: "Категории",
      links: navigation.footer,
      ariaLabel: "Категории",
    },
    {
      title: "Компания",
      links: footerCompanyLinks,
      ariaLabel: "Компания",
    },
    {
      title: "Акции",
      links: footerPromosLinks,
      ariaLabel: "Акции",
    },
    {
      title: "Сервис и поддержка",
      links: footerSupportLinks,
      ariaLabel: "Сервис и поддержка",
    },
    {
      title: "Получение и оплата",
      links: footerDeliveryPaymentLinks,
      ariaLabel: "Получение и оплата",
    },
    {
      title: "Документы",
      links: footerLegalLinks,
      ariaLabel: "Документы",
    },
    {
      title: "Наше производство",
      links: footerCustomLinks,
      ariaLabel: "Наше производство",
    },
    {
      title: "Знания",
      links: footerKnowledgeLinks,
      ariaLabel: "Знания",
    },
  ];

  return (
    <footer className={styles.footer}>
      {/* <FooterFeedback /> */}

      <section className={styles.footerSection}>
        <Container>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <Logo color="white" className={styles.logo} />

              <a
                className={styles.footerRating}
                href={YANDEX_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Отзывы на Яндексе: открыть в новой вкладке">
                <YandexIcon className={styles.footerYandexIcon} />

                <div className={styles.footerRatingContent}>
                  <span className={styles.footerRatingContentText}>Отзывы на Яндексе</span>

                  <span className={styles.starRow} aria-hidden="true">
                    <StarIcon className={styles.footerRatingIcon} />
                    <StarIcon className={styles.footerRatingIcon} />
                    <StarIcon className={styles.footerRatingIcon} />
                    <StarIcon className={styles.footerRatingIcon} />
                    <StarIcon className={styles.footerRatingIcon} />
                  </span>
                </div>
              </a>

              <div className={styles.footerMarketplaces}>
                <p className={styles.footerMarketplacesTitle}>Мы на маркетплейсах</p>

                <div className={styles.footerMarketplacesList}>
                  {footerMarketplaceLinks.map((marketplace) => (
                    <a
                      key={marketplace.label}
                      className={styles.footerMarketplacesItem}
                      href={marketplace.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${marketplace.label}: открыть наш магазин в новой вкладке`}>
                      <span className={styles.footerMarketplaceIcon}>
                        <Image
                          className={marketplace.imageClassName}
                          src={marketplace.image}
                          alt=""
                          width={40}
                          height={40}
                          loading="lazy"
                        />
                      </span>
                      <span className={styles.footerMarketplaceLabel}>{marketplace.label}</span>
                      <svg
                        className={styles.footerMarketplaceArrow}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false">
                        <path d="M6 18 18 6M6 6h12v12" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              <div className={styles.footerPhone}>
                <a className={styles.footerPhoneLink} href="tel:+79956226202" aria-label="Позвонить 8 995 622-62-02">
                  <span className={styles.footerPhoneText}>8 995 622-62-02</span>
                </a>
              </div>
            </div>

            <div className={styles.footerColumn}>
              <nav className={styles.footerNav} aria-label="Категории">
                <h3 className={styles.footerTitle}>Категории</h3>

                <ul className={styles.footerList}>
                  {navigation.footer.map((category) => (
                    <li key={category.href} className={styles.footerItem}>
                      <Link href={category.href} className={styles.footerLink}>
                        {category.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className={styles.footerColumn}>
              <nav className={styles.footerNav} aria-label="Компания">
                <h3 className={styles.footerTitle}>Компания</h3>
                <FooterLinksList links={footerCompanyLinks} />
              </nav>

              <nav className={styles.footerNav} aria-label="Акции">
                <h3 className={styles.footerTitle}>Акции</h3>
                <FooterLinksList links={footerPromosLinks} />
              </nav>
            </div>

            <div className={styles.footerColumn}>
              <nav className={styles.footerNav} aria-label="Сервис и поддержка">
                <h3 className={styles.footerTitle}>Сервис и поддержка</h3>
                <FooterLinksList links={footerSupportLinks} />
              </nav>

              <nav className={styles.footerNav} aria-label="Получение и оплата">
                <h3 className={styles.footerTitle}>Получение и оплата</h3>
                <FooterLinksList links={footerDeliveryPaymentLinks} />
              </nav>

              <nav className={styles.footerNav} aria-label="Документы">
                <h3 className={styles.footerTitle}>Документы</h3>
                <FooterLinksList links={footerLegalLinks} />
              </nav>

              <nav className={styles.footerNav} aria-label="Наше производство">
                <h3 className={styles.footerTitle}>Наше производство</h3>
                <FooterLinksList links={footerCustomLinks} />
              </nav>
            </div>

            <div className={styles.footerColumn}>
              <nav className={styles.footerNav} aria-label="Знания">
                <h3 className={styles.footerTitle}>Знания</h3>
                <FooterLinksList links={footerKnowledgeLinks} />
              </nav>
            </div>

            <div className={styles.footerColumnSocial}>
              <nav className={styles.footerNav} aria-label="Наши соцсети">
                <h3 className={styles.footerTitle}>Наши соцсети</h3>

                <ul className={styles.socialList}>
                  {footerSocialLinks.map((item) => (
                    <li key={item.href} className={styles.socialItem}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${item.label}: открыть в новой вкладке`}
                        className={styles.socialLink}>
                        {item.icon}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <aside className={styles.tgCard} aria-label="Подписка на Telegram-канал">
                <div className={styles.tgHeader}>
                  <h3 className={styles.tgHeaderTitle}>Telegram</h3>
                  <p className={styles.tgHeaderSubTitle}>Подписывайтесь и будьте в курсе последних событий</p>
                </div>

                <div className={styles.tgQr} aria-hidden="true">
                  <Image
                    src="/images/qr/tgQr.png"
                    alt=""
                    width={180}
                    height={180}
                    loading="lazy"
                    sizes="(max-width: 768px) 0px, 180px"
                  />
                </div>

                <div className={styles.tgActions}>
                  <a
                    href="https://t.me/Cocktail_Design_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tgButton}
                    aria-label="Открыть Telegram-канал Cocktail Design в новой вкладке">
                    <span className={styles.tgButtonIcon} aria-hidden="true">
                      <TelegramIconFon />
                    </span>
                    <span className={styles.tgButtonText}>Открыть канал</span>
                  </a>
                </div>
              </aside>
            </div>
          </div>

          <div className={styles.footerMobileSocial}>
            <nav className={styles.footerNav} aria-label="Наши соцсети">
              <h3 className={styles.footerTitle}>Наши соцсети</h3>

              <ul className={styles.socialList}>
                {footerSocialLinks.map((item) => (
                  <li key={item.href} className={styles.socialItem}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.label}: открыть в новой вкладке`}
                      className={styles.socialLink}>
                      {item.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className={styles.footerMobileAccordion}>
            {mobileSections.map((section) => (
              <details key={section.title} className={styles.footerAccordion}>
                <summary className={styles.footerAccordionSummary}>{section.title}</summary>

                <nav className={styles.footerAccordionBody} aria-label={section.ariaLabel}>
                  <FooterLinksList links={section.links} />
                </nav>
              </details>
            ))}
          </div>

          <div className={styles.footerMobileTelegram}>
            <aside className={styles.tgCard} aria-label="Подписка на Telegram-канал">
              <div className={styles.tgHeader}>
                <h3 className={styles.tgHeaderTitle}>Telegram</h3>
                <p className={styles.tgHeaderSubTitle}>Подписывайтесь и будьте в курсе последних событий</p>
              </div>

              <div className={styles.tgActions}>
                <a
                  href="https://t.me/Cocktail_Design_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.tgButton}
                  aria-label="Открыть Telegram-канал Cocktail Design в новой вкладке">
                  <span className={styles.tgButtonIcon} aria-hidden="true">
                    <TelegramIconFon />
                  </span>
                  <span className={styles.tgButtonText}>Открыть канал</span>
                </a>
              </div>
            </aside>
          </div>

          <span className={styles.line} />

          <div className={styles.footerBottomGrid}>
            <div className={styles.footerBottomLeft}>
              <p className={styles.footerBottomText}>
                Условия розничной покупки описаны в{" "}
                <Link href="/legal/offer" className={styles.footerInlineLink}>
                  Публичной оферте
                </Link>
                . Заказы организаций и ИП согласовываются отдельно. Подробнее об использовании данных — в{" "}
                <Link href="/legal/privacy-policy" className={styles.footerInlineLink}>
                  Политике обработки персональных данных
                </Link>
                .
              </p>
            </div>

            <div className={styles.footerBottomRight}>
              <a className={styles.footerDev} href="https://t.me/mazalovalex" target="_blank" rel="noopener noreferrer">
                Разработка сайта <span className={styles.footerDevName}>MazalovAlex</span>
              </a>

              <p className={styles.footerCopyright}>
                © 2015—{currentYear}. Cocktail Design. Все права защищены. При полном или частичном использовании
                материалов с сайта ссылка на источник обязательна.
              </p>
            </div>
          </div>
          <AnalyticsSettings />
        </Container>
      </section>
    </footer>
  );
}
