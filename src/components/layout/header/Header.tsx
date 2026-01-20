"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import styles from "./Header.module.css";

import TelegramIcon from "@/components/icons/TelegramIcon";
import MaxBrandIcon from "@/components/icons/MaxIcon";
import Logo from "@/components/ui/logo/Logo";
import CatalogMenu from "@/components/layout/header/catalog-menu/CatalogMenu";
import SearchBar from "@/components/layout/header/SearchBar";
import HeartIcon from "@/components/icons/HeartIcon";
import CartIcon from "@/components/icons/CartIcon";
import InfoIcon from "@/components/icons/InfoIcon";

type NavLink = { label: string; href: string };
type TopNavItem = NavLink & { children?: NavLink[] };
type CatalogItem = NavLink;

// Категории в третьей строке хедера (NavBar).
const CATALOG_ITEMS: CatalogItem[] = [
  { label: "Шейкеры", href: "/catalog/sheykeri" },
  { label: "Смесительные стаканы", href: "/catalog/smesitelnye-stakany" },
  { label: "Джиггеры и мерники", href: "/catalog/dzhiggery-i-merniki" },
  { label: "Барные ложки", href: "/catalog/barnye-lozhki" },
  { label: "Армбэнды и аксессуары", href: "/catalog/aksessuary" },
  { label: "Собственное производство", href: "/catalog/production" },
  { label: "Трубочки и украшения", href: "/catalog/trubochki" },
];

// Пункты верхнего меню (в TopBar). У некоторых пунктов есть выпадающий список.
const TOP_NAV_ITEMS: TopNavItem[] = [
  { label: "Знания", href: "/knowledge" },
  { label: "Оплата и доставка", href: "/shipping" },
  { label: "Брендинг", href: "/branding" },
  { label: "Система скидок", href: "/discounts" },
  {
    label: "О нас",
    href: "",
    children: [
      { label: "О компании", href: "/about/company" },
      { label: "Реквизиты", href: "/legal/requisites" },
      { label: "Контакты", href: "/about/contacts" },
    ],
  },
  { label: "Для юрлиц", href: "/b2b" },
];

/**
 * TopNav — верхнее меню.
 * Dropdown сделан на CSS: открывается по hover мышью и по focus-within с клавиатуры.
 * Здесь нет JS-логики специально: меньше багов, проще поддержка.
 */
function TopNav() {
  return (
    <nav className={styles.topBarNav} aria-label="Верхнее меню">
      <ul className={styles.topNavList}>
        {TOP_NAV_ITEMS.map((item) => {
          const children = item.children ?? [];
          const hasChildren = children.length > 0;

          return (
            <li key={item.href} className={styles.topNavItem}>
              {/* Пункт меню (с индикатором, если есть подпункты) */}
              <Link href={item.href} className={`${styles.linkBase} ${styles.topNavLink}`}>
                {item.label}
                {hasChildren && (
                  <span className={styles.chevron} aria-hidden="true">
                    ▾
                  </span>
                )}
              </Link>

              {/* Dropdown: рендерим только если есть подпункты */}
              {hasChildren && (
                <div className={styles.dropdown}>
                  <ul className={styles.dropdownList}>
                    {children.map((child) => (
                      <li key={child.href}>
                        <Link className={styles.dropdownLink} href={child.href}>
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * MainBar — центральная часть хедера:
 * логотип, кнопка "Каталог", поиск, избранное и корзина.
 * Логики состояния здесь нет: это чистая разметка.
 */
function MainBar() {
  return (
    <div className={styles.mainBar}>
      {/* Логотип */}
      <div className={styles.mainBarLeft}>
        <Logo className={styles.logo} />
      </div>

      {/* Каталог + поиск */}
      <div className={styles.mainBarCenter}>
        <CatalogMenu />

        {/* SearchBar может быть интерактивным компонентом (поэтому Header остаётся client). */}
        <SearchBar />
      </div>

      {/* Действия: избранное и корзина */}
      <div className={styles.rightMainBar}>
        <Link href="/favorites" className={styles.actionLink}>
          <HeartIcon className={styles.actionIcon} />
          <span className={styles.actionText}>Избранное</span>
        </Link>

        <Link href="/cart" className={styles.actionLink}>
          <CartIcon className={styles.actionIcon} />
          <span className={styles.actionText}>Корзина</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * Header — статический хедер страницы.
 * Важно: тут нет “прилипания”, нет слушателей скролла и нет ResizeObserver.
 * Этот компонент отвечает только за разметку трёх строк:
 * 1) TopBar (контакты + меню)
 * 2) MainBar (логотип + поиск + действия)
 * 3) NavBar (категории)
 */
export default function Header() {
  return (
    <header className={styles.header}>
      <Container>
        {/* 1) TopBar: слева “Написать нам” + соцсети, по центру верхнее меню, справа телефон */}
        <div className={styles.topBar}>
          {/* Левая часть TopBar: текст + соцсети */}
          <div className={styles.topBarLeft}>
            <span className={styles.topBarLeftText}>Написать нам</span>

            {/* Соцсети: внешние ссылки */}
            <div className={styles.topBarLeftSocial}>
              <a
                className="icon"
                href="https://t.me/yourbot"
                aria-label="Telegram"
                rel="noopener noreferrer"
                target="_blank">
                <TelegramIcon />
              </a>

              <a className="icon" href="https://max.ru/xxx" aria-label="MAX" rel="noopener noreferrer" target="_blank">
                <MaxBrandIcon />
              </a>
            </div>
          </div>

          {/* Верхнее меню (TopNav) */}
          <TopNav />

          {/* Контакты: tooltip с графиком + основной телефон */}
          <address className={styles.topBarContact}>
            {/* Tooltip: появляется по hover (CSS) */}
            <div className={styles.infoTooltip}>
              <InfoIcon className={styles.infoIcon} title="Часы работы" />

              <div className={styles.infoDropdown}>
                <div className={styles.infoDropdownContent}>
                  <p className={styles.infoDropdownTitle}>Звонок бесплатный 07:00 – 22:00</p>
                  <p className={styles.infoDropdownSubtitle}>Дополнительный телефон</p>
                  <a href="tel:+74956471000" className={styles.infoDropdownPhone}>
                    +7 (495) 647-10-00
                  </a>
                </div>
              </div>
            </div>

            {/* Основной телефон */}
            <a className={`${styles.linkBase} ${styles.phoneLink}`} href="tel:+78002221100">
              8 800 222-11-00
            </a>
          </address>
        </div>

        {/* 2) MainBar: логотип, каталог, поиск, действия */}
        <MainBar />

        {/* 3) NavBar: категории + кнопка “Акции” */}
        <nav className={styles.navBar} aria-label="Категории товаров">
          <ul className={styles.categoryList}>
            {CATALOG_ITEMS.map((item) => (
              <li key={item.href} className={styles.categoryItem}>
                <Link className={`${styles.linkBase} ${styles.categoryLink}`} href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link className={styles.sale} href="/sale">
            % Акции
          </Link>
        </nav>
      </Container>
    </header>
  );
}
