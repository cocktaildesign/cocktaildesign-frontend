// frontend/src/components/ui/mobile-bottom-nav/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import styles from "./MobileBottomNav.module.css";

import HeartIcon from "@/components/icons/HeartIcon";
import CartIcon from "@/components/icons/CartIcon";
import CatalogIcon from "@/components/icons/CatalogIcon";
import HomeIcon from "@/components/icons/HomeIcon";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { useCartStore } from "@/lib/cart/cartStore";
import { Modal } from "@/components/ui/modal/Modal";

const MENU_ITEMS = [
  { href: "/", label: "Главная" },
  { href: "/shipping", label: "Доставка" },
  { href: "/payment-methods", label: "Оплата" },
  { href: "/knowledge", label: "Знания" },
  { href: "/legal/requisites", label: "Реквизиты" },
  { href: "/branding", label: "Брендинг" },
  { href: "/contacts", label: "Контакты" },
];

const PLACEHOLDER = "/images/catalog/product-placeholder.webp";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const favoritesHasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoritesIds = useFavoritesStore((state) => state.ids);
  const favoritesCount = favoritesHasHydrated ? Object.keys(favoritesIds).length : 0;

  const cartHasHydrated = useCartStore((state) => state.hasHydrated);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartHasHydrated ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <>
      {/* Нижняя мобильная навигация */}
      <nav className={styles.mobileBottomNav}>
        <Link href="/" className={`${styles.item} ${pathname === "/" ? styles.active : ""}`}>
          <span className={styles.icon}>
            <HomeIcon />
          </span>
          <span className={styles.label}>Главная</span>
        </Link>

        <Link href="/catalog" className={`${styles.item} ${pathname.startsWith("/catalog") ? styles.active : ""}`}>
          <span className={styles.icon}>
            <CatalogIcon />
          </span>
          <span className={styles.label}>Каталог</span>
        </Link>

        {/* Кнопка меню */}
        <button type="button" className={`${styles.item} ${styles.menuItem}`} onClick={() => setIsMenuOpen(true)}>
          <div className={styles.container}>
            <span className={styles.label}>Меню</span>
          </div>
        </button>

        {/* Избранное */}
        <Link href="/favorites" className={`${styles.item} ${pathname === "/favorites" ? styles.active : ""}`}>
          <span className={styles.iconWrapper}>
            <HeartIcon className={styles.iconSvg} />
            {favoritesCount > 0 && <span className={styles.badge}>{favoritesCount}</span>}
          </span>
          <span className={styles.label}>Избранное</span>
        </Link>

        {/* Корзина */}
        <Link href="/cart" className={`${styles.item} ${pathname === "/cart" ? styles.active : ""}`}>
          <span className={styles.iconWrapper}>
            <CartIcon className={styles.iconSvg} />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </span>
          <span className={styles.label}>Корзина</span>
        </Link>
      </nav>

      {/* Меню внутри modal */}
      <Modal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Меню">
        <div className={styles.menuContent}>
          <h2 className={styles.menuTitle}>Меню</h2>

          <div className={styles.menuGrid}>
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.menuCard} ${pathname === item.href ? styles.menuCardActive : ""}`}
                onClick={() => setIsMenuOpen(false)}>
                <div className={styles.menuCardImage}>
                  <Image src={PLACEHOLDER} alt={item.label} fill sizes="50vw" className={styles.menuCardImg} />
                </div>

                <span className={styles.menuCardLabel}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
