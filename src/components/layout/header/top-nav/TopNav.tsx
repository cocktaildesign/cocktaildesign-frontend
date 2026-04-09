"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "./TopNav.module.css";

// Тип ссылки
type NavLink = {
  label: string;
  href: string;
};

// Тип пункта верхнего меню
type TopNavItem = NavLink & {
  children?: NavLink[];
};

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
    href: "/about",
    children: [
      { label: "О компании", href: "/about" },
      { label: "Реквизиты", href: "/legal/requisites" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
];

export default function TopNav() {
  // Какой dropdown сейчас открыт
  const [openItemLabel, setOpenItemLabel] = useState<string | null>(null);

  // Ссылка на весь блок меню
  const navRef = useRef<HTMLElement | null>(null);

  // Переключение dropdown по клику
  function handleToggle(label: string) {
    setOpenItemLabel((currentLabel) => {
      if (currentLabel === label) {
        return null;
      }

      return label;
    });
  }

  // Закрытие dropdown
  function handleCloseDropdown() {
    setOpenItemLabel(null);
  }

  // Закрытие по клику вне меню
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!navRef.current) return;

      const target = event.target as Node;

      if (!navRef.current.contains(target)) {
        setOpenItemLabel(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Закрытие по клавише Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenItemLabel(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <nav ref={navRef} className={styles.topBarNav} aria-label="Верхнее меню">
      {/* Список пунктов меню */}
      <ul className={styles.topNavList}>
        {TOP_NAV_ITEMS.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          const isOpen = openItemLabel === item.label;

          return (
            <li key={item.label} className={`${styles.topNavItem} ${isOpen ? styles.topNavItemOpen : ""}`}>
              {/* Кнопка для пункта с dropdown */}
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
              {hasChildren && item.children && (
                <div className={styles.dropdown}>
                  <ul className={styles.dropdownList}>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link href={child.href} className={styles.dropdownLink} onClick={handleCloseDropdown}>
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
