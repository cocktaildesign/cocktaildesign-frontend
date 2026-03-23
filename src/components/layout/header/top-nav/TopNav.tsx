"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./TopNav.module.css";

// Типы для ссылок
type NavLink = { label: string; href: string };
type TopNavItem = NavLink & { children?: NavLink[] };

// Ссылки верхнего меню
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
    href: "#",
    children: [
      { label: "О компании", href: "/about" },
      { label: "Реквизиты", href: "/legal/requisites" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
];

export default function TopNav() {
  // Какой dropdown сейчас открыт на мобильных
  const [openItemLabel, setOpenItemLabel] = useState<string | null>(null);

  // Открытие и закрытие dropdown по клику
  function handleToggle(label: string) {
    setOpenItemLabel((currentLabel) => {
      if (currentLabel === label) {
        return null;
      }

      return label;
    });
  }

  // Закрываем dropdown после перехода по ссылке
  function handleCloseDropdown() {
    setOpenItemLabel(null);
  }

  return (
    <nav className={styles.topBarNav} aria-label="Верхнее меню">
      {/* Список пунктов меню */}
      <ul className={styles.topNavList}>
        {TOP_NAV_ITEMS.map((item) => {
          const hasChildren = !!item.children?.length;
          const isOpen = openItemLabel === item.label;

          return (
            <li key={item.label} className={`${styles.topNavItem} ${isOpen ? styles.topNavItemOpen : ""}`}>
              {/* Кнопка если есть dropdown */}
              {hasChildren ? (
                <button
                  type="button"
                  className={`${styles.linkBase} ${styles.topNavLink}`}
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  onClick={() => handleToggle(item.label)}>
                  <span>{item.label}</span>

                  <span className={styles.chevron} aria-hidden="true">
                    ▾
                  </span>
                </button>
              ) : (
                /* Обычная ссылка */
                <Link
                  href={item.href}
                  className={`${styles.linkBase} ${styles.topNavLink}`}
                  onClick={handleCloseDropdown}>
                  {item.label}
                </Link>
              )}

              {/* Dropdown */}
              {hasChildren && (
                <div className={styles.dropdown}>
                  <ul className={styles.dropdownList}>
                    {item.children!.map((child) => (
                      <li key={child.href}>
                        <Link className={styles.dropdownLink} href={child.href} onClick={handleCloseDropdown}>
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
