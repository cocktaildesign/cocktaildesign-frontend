// src/components/layout/header/HeaderClient.tsx
"use client";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
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

import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";

type HeaderClientProps = {
  categories: CatalogCategoryPreview[];
};

type NavLink = { label: string; href: string };
type TopNavItem = NavLink & { children?: NavLink[] };
type CatalogItem = NavLink;

const CATALOG_ITEMS: CatalogItem[] = [
  { label: "Шейкеры", href: "/catalog/sheykeri" },
  { label: "Смесительные стаканы", href: "/catalog/smesitelnye-stakany" },
  { label: "Джиггеры и мерники", href: "/catalog/dzhiggery-i-merniki" },
  { label: "Барные ложки", href: "/catalog/barnye-lozhki" },
  { label: "Армбэнды и аксессуары", href: "/catalog/aksessuary" },
  { label: "Собственное производство", href: "/catalog/production" },
  { label: "Трубочки и украшения", href: "/catalog/trubochki" },
];

const TOP_NAV_ITEMS: TopNavItem[] = [
  { label: "Знания", href: "/knowledge" },
  {
    label: "Получение и оплата",
    href: "/shipping",
    children: [
      { label: "Способы оплаты", href: "/payment-methods" },
      { label: "Доставка", href: "/shipping" },
    ],
  },
  { label: "Брендинг", href: "/branding" },
  { label: "Система скидок", href: "/discounts" },
  {
    label: "О нас",
    href: "",
    children: [
      { label: "О компании", href: "/about" },
      { label: "Реквизиты", href: "/legal/requisites" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
];

function TopNav() {
  return (
    <nav className={styles.topBarNav} aria-label="Верхнее меню">
      <ul className={styles.topNavList}>
        {TOP_NAV_ITEMS.map((item) => {
          const children = item.children ?? [];
          const hasChildren = children.length > 0;

          return (
            <li key={item.href} className={styles.topNavItem}>
              {hasChildren ? (
                <button
                  type="button"
                  className={`${styles.linkBase} ${styles.topNavLink} ${styles.dropdownTrigger}`}
                  aria-haspopup="true">
                  {item.label}
                  <span className={styles.chevron} aria-hidden="true">
                    ▾
                  </span>
                </button>
              ) : (
                <Link href={item.href} className={`${styles.linkBase} ${styles.topNavLink}`}>
                  {item.label}
                </Link>
              )}

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

function MainBar({ categories }: { categories: CatalogCategoryPreview[] }) {
  const hasHydrated = useFavoritesStore((s) => s.hasHydrated);
  const favoritesCount = useFavoritesStore((s) => Object.keys(s.ids).length);
  const badgeCount = hasHydrated ? favoritesCount : 0;

  return (
    <div className={styles.mainBar}>
      <div className={styles.mainBarLeft}>
        <Logo className={styles.logo} />
      </div>

      <div className={styles.mainBarCenter}>
        <CatalogMenu />
        <SearchBar categories={categories} />
      </div>

      <div className={styles.rightMainBar}>
        <Link href="/favorites" className={styles.actionLink}>
          <div className={styles.iconWrapper}>
            <HeartIcon className={styles.actionIcon} />
            {badgeCount > 0 && <span className={styles.badge}>{badgeCount}</span>}
          </div>
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

export default function HeaderClient({ categories }: HeaderClientProps) {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.topBarLeftText}>Написать нам</span>

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

          <TopNav />

          <address className={styles.topBarContact}>
            <div className={styles.infoTooltip}>
              <InfoIcon className={styles.infoIcon} title="Часы работы" />

              <div className={styles.infoDropdown}>
                <div className={styles.infoDropdownContent}>
                  <p className={styles.infoDropdownText}>Звонок бесплатный</p>

                  <ul className={styles.infoDropdownSchedule}>
                    <li>
                      Пн–Пт: <time>10:00–18:00</time>
                    </li>
                    <li>
                      Сб–Вс: <time>10:00–17:00</time>
                    </li>
                  </ul>

                  <p className={styles.infoDropdownTitle}>Email</p>
                  <a href="mailto:cocktaildesign@yandex.ru" className={styles.infoDropdownEmail}>
                    cocktaildesign@yandex.ru
                  </a>
                </div>
              </div>
            </div>

            <a className={`${styles.linkBase} ${styles.phoneLink}`} href="tel:+78002221100">
              8 (995) 622-62-02
            </a>
          </address>
        </div>

        <MainBar categories={categories} />

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

          <Link className={styles.sale} href="/promotions">
            % Акции
          </Link>
        </nav>
      </Container>
    </header>
  );
}
