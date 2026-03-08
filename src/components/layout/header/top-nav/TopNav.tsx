// src/components/layout/header/top-nav/TopNav.tsx
"use client";

import Link from "next/link";
import styles from "./TopNav.module.css";

// Типы — живут здесь, рядом с компонентом который их использует
type NavLink = { label: string; href: string };
type TopNavItem = NavLink & { children?: NavLink[] };

// Статические ссылки верхнего меню
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

export default function TopNav() {
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
