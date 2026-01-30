import styles from "./Footer.module.css";
import Container from "../Container";
import type { ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";
import FooterFeedback from "./FooterFeedback";

import Logo from "@/components/ui/logo/Logo";
import StarIcon from "@/components/icons/StarIcon";
import YandexIcon from "@/components/icons/YandexIcon";

import TelegramIcon from "@/components/icons/social-network/TelegramIcon";
import TelegramIconFon from "@/components/icons/social-network/TelegramIconFon";
import VKIcon from "@/components/icons/social-network/VKIcon";
import InstagramIcon from "@/components/icons/social-network/InstagramIcon";
import MaxIcon from "@/components/icons/social-network/MaxIcon";
import PinterestIcon from "@/components/icons/social-network/PinterestIcon";
import ThreadsIcon from "@/components/icons/social-network/ThreadsIcon";
import YouTubeIcon from "@/components/icons/social-network/YouTubeIcon";

type FooterLink = {
  label: string;
  href: string;
};

export const footerCategories: FooterLink[] = [
  { label: "Шейкеры", href: "/c/shakers" },
  { label: "Джиггеры", href: "/c/jiggers" },
  { label: "Барные ложки", href: "/c/bar-spoons" },
  { label: "Стрейнеры", href: "/c/strainers" },
  { label: "Мадлеры", href: "/c/muddlers" },
  { label: "Ситечки и фильтры", href: "/c/filters" },
  { label: "Мерные стаканы", href: "/c/measuring-cups" },
  { label: "Диспенсеры и дозаторы", href: "/c/dispensers" },
  { label: "Гейзеры", href: "/c/pourers" },
  { label: "Щипцы и пинцеты", href: "/c/tongs" },
  { label: "Открывалки и штопоры", href: "/c/openers" },
  { label: "Инвентарь для льда", href: "/c/ice-tools" },
  { label: "Бокалы и стаканы", href: "/c/glassware" },
  { label: "Сиропы и топпинги", href: "/c/syrups" },
  { label: "Барные наборы", href: "/c/bar-sets" },
];

export const footerCompanyLinks: FooterLink[] = [
  { label: "О нас", href: "/about" },
  { label: "Контакты", href: "/contacts" },
  { label: "Отзывы", href: "/reviews" },
  { label: "Реквизиты", href: "/legal/requisites" },
];

export const footerPromosLinks: FooterLink[] = [{ label: "Наши акции", href: "/promos" }];

export const footerSupportLinks: FooterLink[] = [{ label: "Обратная связь", href: "/support/feedback" }];

export const footerDeliveryPaymentLinks: FooterLink[] = [
  { label: "Способы оплаты", href: "/payment" },
  { label: "Способы доставки", href: "/delivery" },
];

export const footerLegalLinks: FooterLink[] = [{ label: "Правовая информация", href: "/legal" }];

export const footerCustomLinks = [{ label: "Брендинг и Гравировка", href: "/branding" }];

export const footerKnowledgeLinks: FooterLink[] = [
  { label: "Техники и фишки", href: "/knowledge?tab=techniques" },
  { label: "Обучение", href: "/knowledge?tab=education" },
  { label: "Подкасты и интервью", href: "/knowledge?tab=podcasts" },
  { label: "Индустрия и культура", href: "/knowledge?tab=industry" },
  { label: "Материалы и ресурсы", href: "/knowledge?tab=resources" },
];

type FooterSocialLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

export const footerSocialLinks: FooterSocialLink[] = [
  { label: "Telegram", href: "https://t.me/Cocktail_Design_official", icon: <TelegramIcon /> },
  { label: "VK", href: "https://vk.com/", icon: <VKIcon /> },
  { label: "Instagram", href: "https://www.instagram.com/", icon: <InstagramIcon /> },
  { label: "MAX", href: "https://max.ru/", icon: <MaxIcon /> },
  { label: "Pinterest", href: "https://www.pinterest.com/", icon: <PinterestIcon /> },
  { label: "Threads", href: "https://www.threads.net/", icon: <ThreadsIcon /> },
  { label: "YouTube", href: "https://www.youtube.com/", icon: <YouTubeIcon /> },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <FooterFeedback />

      <section className={styles.footerSection}>
        <Container>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <Logo color="#fff" />
              <a
                className={styles.footerRating}
                href="https://reviews.yandex.ru/shop/cocktaildesign.ru?utm_source=ya_bro&scroll_to=reviews"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Отзывы на Яндекс: открыть в новой вкладке">
                <YandexIcon className={styles.footerYandexIcon} />

                <div className={styles.footerRatingContent}>
                  <span className={styles.footerRatingContentText}>Рейтинг магазина</span>

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
                  <a
                    className={styles.footerMarketplacesItem}
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.ozon.ru/seller/cocktail-design-1254183/">
                    <Image
                      src="/images/marketplaces/ozon.png"
                      alt="Ozon"
                      width={92}
                      height={29}
                      loading="lazy"
                      sizes="(max-width: 768px) 72px, 92px"
                    />
                  </a>
                  <a
                    className={styles.footerMarketplacesItem}
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.wildberries.ru/seller/58713">
                    <Image
                      src="/images/marketplaces/wb.png"
                      alt="wb"
                      width={92}
                      height={29}
                      loading="lazy"
                      sizes="(max-width: 768px) 72px, 92px"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className={styles.footerColumn}>
              <nav className={styles.footerNav} aria-label="Категории">
                <h3 className={styles.footerTitle}>Категории</h3>
                <ul className={styles.footerList}>
                  {footerCategories.map((category) => (
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
                <ul className={styles.footerList}>
                  {footerCompanyLinks.map((link) => (
                    <li key={link.href} className={styles.footerItem}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav className={styles.footerNav} aria-label="Акции">
                <h3 className={styles.footerTitle}>Акции</h3>
                <ul className={styles.footerList}>
                  {footerPromosLinks.map((link) => (
                    <li key={link.href} className={styles.footerItem}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className={styles.footerColumn}>
              <nav className={styles.footerNav} aria-label="Сервис и поддержка">
                <h3 className={styles.footerTitle}>Сервис и поддержка</h3>
                <ul className={styles.footerList}>
                  {footerSupportLinks.map((link) => (
                    <li key={link.href} className={styles.footerItem}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav className={styles.footerNav} aria-label="Получение и оплата">
                <h3 className={styles.footerTitle}>Получение и оплата</h3>
                <ul className={styles.footerList}>
                  {footerDeliveryPaymentLinks.map((link) => (
                    <li key={link.href} className={styles.footerItem}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav className={styles.footerNav} aria-label="Документы">
                <h3 className={styles.footerTitle}>Документы</h3>
                <ul className={styles.footerList}>
                  {footerLegalLinks.map((link) => (
                    <li key={link.href} className={styles.footerItem}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav className={styles.footerNav} aria-label="Наше производство">
                <h3 className={styles.footerTitle}>Наше производство</h3>
                <ul className={styles.footerList}>
                  {footerCustomLinks.map((link) => (
                    <li key={link.href} className={styles.footerItem}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className={styles.footerColumn}>
              <nav className={styles.footerNav} aria-label="Знания">
                <h3 className={styles.footerTitle}>Знания</h3>
                <ul className={styles.footerList}>
                  {footerKnowledgeLinks.map((link) => (
                    <li key={link.href} className={styles.footerItem}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
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
                  <p className={styles.tgHeaderSubTitle}>Подписывайтесь и будте в курсе последних событий</p>
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

          <span className={styles.line} />

          <div className={styles.footerBottomGrid}>
            <div className={styles.footerBottomLeft}>
              <p className={styles.footerBottomText}>
                Изображения и характеристики товаров приведены справочно; производитель может изменять комплектацию и
                внешний вид без уведомления. Информация на сайте не является публичной офертой (ст. 437 ГК РФ). Оформляя
                заказ, вы принимаете условия:
                <Link href="/legal/offer" className={styles.footerInlineLink}>
                  Публичная оферта
                </Link>
                ,
                <Link href="/legal/privacy-policy" className={styles.footerInlineLink}>
                  Политика конфиденциальности
                </Link>
                .
              </p>
              <p className={styles.footerBottomText}>
                * Instagram — продукт компании Meta Platforms Inc., деятельность которой признана экстремистской и
                запрещена на территории РФ.
              </p>
            </div>

            <div className={styles.footerBottomRight}>
              <a className={styles.footerDev} href="" target="_blank" rel="noopener noreferrer">
                Разработка сайта <span className={styles.footerDevName}>MazalovAlex</span>
              </a>
              <p className={styles.footerCopyright}>
                © 2015—{new Date().getFullYear()}. Cocktail Design. Все права защищены. При полном или частичном
                использовании материалов с сайта ссылка на источник обязательна.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </footer>
  );
}
