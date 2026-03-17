import Image from "next/image";
import Link from "next/link";

import PageLayout from "@/components/layout/PageLayout";
import { getTopCategoriesFromStrapi } from "@/lib/api/catalog";
import { pageMetadata } from "@/lib/seo/metadata";

import TelegramIcon from "@/components/icons/social-network/TelegramIcon";
import VKIcon from "@/components/icons/social-network/VKIcon";
import MaxIcon from "@/components/icons/social-network/MaxIcon";
import YouTubeIcon from "@/components/icons/social-network/YouTubeIcon";

import styles from "./AboutPage.module.css";

export const metadata = pageMetadata({
  title: "О нас",
  description:
    "CocktailDesign — производственная компания и интернет-магазин барного инвентаря собственного производства. Премиальные решения для баров, ресторанов и Horeca.",
  canonical: "/about",
});

function formatProductsCount(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;

  // исключение
  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} товаров`;
  }

  // 1 товар
  if (last === 1) {
    return `${count} товар`;
  }

  // 2-4 товара
  if (last >= 2 && last <= 4) {
    return `${count} товара`;
  }

  return `${count} товаров`;
}

export default async function AboutPage() {
  const categories = await getTopCategoriesFromStrapi();
  return (
    <PageLayout>
      <div className={styles.page}>
        {/* ───────────── HERO ───────────── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>О компании</span>
            <h1 className={styles.heroTitle}>
              Cocktail
              <br />
              <em>Design</em>
            </h1>
            <p className={styles.heroLead}>
              Производственная компания и интернет-магазин барного инвентаря собственного производства. Стильные,
              функциональные и эргономичные решения для баров, ресторанов и профессионалов индустрии.
            </p>
          </div>
        </section>

        {/* ───────────── TAGLINE ───────────── */}
        <div className={styles.taglineBlock}>
          <p className={styles.taglineText}>
            Продукцией пользуются сильнейшие представители барной индустрии, лучшие барные амбассадоры мира и
            алкогольные компании.
          </p>
          <div className={styles.taglineMeta}>
            <span className={styles.taglineBadge}>Barproof 2017</span>
            <span className={styles.taglineBadge}>Barproof 2019</span>
          </div>
        </div>

        {/* ───────────── АССОРТИМЕНТ ───────────── */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionMeta}>
              <span className={styles.sectionTag}>Ассортимент</span>
            </div>
            <div className={styles.textBlock}>
              <p>
                Компания Cocktail Design предлагает широкий ассортимент барного инвентаря собственного производства. В
                каталоге нашего интернет-магазина постоянно пополняемый ассортимент барного инвентаря и аксессуаров по
                конкурентным ценам.
              </p>
              <p>
                Обеспечиваем потребителей стильной, функциональной и эргономичной продукцией для комфортной работы
                сотрудников и качественного обслуживания посетителей заведения. Предлагаем наборы и готовые решения,
                товары для молекулярной кухни, бариста и многое другое.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────── РЕПУТАЦИЯ (DARK) ───────────── */}
        <section className={styles.highlight}>
          <span className={styles.highlightTag}>Репутация</span>
          <h2 className={styles.highlightTitle}>Признание на международном рынке</h2>
          <div className={styles.highlightBadges}>
            <span className={styles.badge}>Barproof 2017</span>
            <span className={styles.badge}>Barproof 2019</span>
          </div>
          <div className={styles.highlightBody}>
            <p className={styles.highlightText}>
              Производственная компания Cocktail Design активно себя зарекомендовала на международном рынке барных
              продуктов премиального уровня, являясь одним из ведущих производителей эксклюзивного барного инвентаря.
            </p>
            <p className={styles.highlightText}>
              Выпускаемой предприятием продукцией пользуются сильнейшие представители барной индустрии, без
              преувеличения лучшие барные амбассадоры мира и алкогольные компании. Наш продукт признан лучшим по версии
              Barproof 2017 г. и 2019 г.
            </p>
          </div>
        </section>

        {/* ───────────── БРЕНДИНГ ───────────── */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionMeta}>
              <span className={styles.sectionTag}>Брендинг</span>
            </div>
            <div className={styles.textBlock}>
              <p>
                Кроме того, мы занимаемся брендингом, проектируя, разрабатывая и производя барный инвентарь, аксессуары
                и прочую рекламную продукцию для ведущих брендов сегмента Horeca.
              </p>
              <p>
                Мастерская оказывает услуги по нанесению логотипа на любые металлические изделия из нашего
                интернет-магазина, при этом возможно выполнение заказов по проекту клиента.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────── СЕРВИС ───────────── */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionMeta}>
              <span className={styles.sectionTag}>Сервис</span>
            </div>
            <div className={styles.servicesGrid}>
              <article className={styles.serviceCard}>
                <h3 className={styles.serviceTitle}>Консультация</h3>
                <p className={styles.serviceText}>
                  Наши менеджеры всегда готовы оказать помощь в выборе оборудования, дать профессиональные советы по
                  использованию и уходу выбранных моделей, а также проконсультировать по техническим вопросам.
                </p>
              </article>
              <article className={styles.serviceCard}>
                <h3 className={styles.serviceTitle}>Условия покупки</h3>
                <p className={styles.serviceText}>
                  Система скидок, акции и возможность оплаты как наличными, так и посредством платёжных систем сделают
                  ваши покупки максимально комфортными.
                </p>
              </article>
              <article className={styles.serviceCard}>
                <h3 className={styles.serviceTitle}>Доставка</h3>
                <p className={styles.serviceText}>
                  Доставка заказов выполняется из Санкт-Петербурга по всему миру. Мы рассчитаем стоимость и подберём для
                  вас оптимальный способ доставки.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ───────────── BANNER → КАТАЛОГ ───────────── */}
        <div className={styles.catalogBanner}>
          <p className={styles.catalogBannerText}>
            Более 1&nbsp;000 позиций барного инвентаря — для тех, кто создаёт атмосферу в заведении
          </p>
        </div>

        {/* ───────────── КАТАЛОГ ───────────── */}
        <section className={styles.catalogSection}>
          <div className={styles.catalogHeader}>
            <span className={styles.sectionTag}>Каталог</span>
            <Link href="/catalog" className={styles.catalogLink}>
              Смотреть все →
            </Link>
          </div>
          <ul className={styles.grid}>
            {categories.map((category) => (
              <li key={category.id} className={styles.card}>
                <Link href={`/catalog/${category.slug}`} className={styles.cardLink}>
                  <div className={styles.cardText}>
                    <h3 className={styles.title}>{category.name}</h3>
                    <span className={styles.count}>{formatProductsCount(category.productsCount)}</span>
                  </div>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={category.imageSrc || "/placeholder-image.jpg"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      alt={category.name ? `Категория: ${category.name}` : "Категория"}
                      className={styles.image}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ───────────── СОЦСЕТИ ───────────── */}
        <section className={styles.socialSection}>
          <div className={styles.socialSectionInner}>
            <div className={styles.socialSectionLeft}>
              <span className={styles.sectionTag}>Соцсети</span>
              <h2 className={styles.socialSectionTitle}>Подписывайтесь и будьте в курсе последних событий</h2>
              <ul className={styles.socialLinksList}>
                <li>
                  <a
                    href="https://t.me/Cocktail_Design_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIconLink}
                    aria-label="Telegram">
                    <TelegramIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://vk.ru/cocktail_design"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIconLink}
                    aria-label="VK">
                    <VKIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://max.ru/join/QQKS8__nbdrJTvRVrRSCdMBqinbSTzi34ReNX1TJw80"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIconLink}
                    aria-label="MAX">
                    <MaxIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/@cocktaildesign-d7n?si=xtR34NMhHFghKq02"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIconLink}
                    aria-label="YouTube">
                    <YouTubeIcon />
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.socialSectionVisual} aria-hidden="true">
              <span className={styles.socialSectionVisualText}>Cocktail Design</span>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
