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
import ArrowBackIcon from "@/components/icons/ArrowBackIcon";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { useCartStore } from "@/lib/cart/cartStore";
import { Modal } from "@/components/ui/modal/Modal";

const MENU_ITEMS = [
  { href: "/catalog", label: "Каталог", imageSrc: "/images/mobilBottomMenuImage/catalog.webp" },

  { href: "/contacts", label: "Контакты", imageSrc: "/images/mobilBottomMenuImage/contacts.webp" },
  { href: "/shipping", label: "Доставка", imageSrc: "/images/mobilBottomMenuImage/delivery.webp" },

  { href: "/payment-methods", label: "Оплата", imageSrc: "/images/mobilBottomMenuImage/pay.webp" },
  { href: "/legal/requisites", label: "Реквизиты", imageSrc: "/images/mobilBottomMenuImage/requisites.webp" },
  { href: "/branding", label: "Брендинг", imageSrc: "/images/mobilBottomMenuImage/branding.webp" },

  { href: "/knowledge", label: "Знания", imageSrc: "/images/mobilBottomMenuImage/knowledge.webp" },
  { href: "/catalog/collection/sale", label: "Скидки", imageSrc: "/images/mobilBottomMenuImage/sale.webp" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const favoritesHasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoritesIds = useFavoritesStore((state) => state.ids);
  const favoritesCount = favoritesHasHydrated ? Object.keys(favoritesIds).length : 0;

  const cartHasHydrated = useCartStore((state) => state.hasHydrated);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartHasHydrated ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  function handleCloseMenu() {
    setIsMenuOpen(false);
  }

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

      {/* Меню внутри modal. hideCloseButton — у нас своя стрелка "назад" */}
      <Modal isOpen={isMenuOpen} onClose={handleCloseMenu} title="Меню" hideCloseButton>
        <div className={styles.menuContent}>
          <div className={styles.menuHeader}>
            <button type="button" className={styles.backButton} onClick={handleCloseMenu} aria-label="Назад">
              <ArrowBackIcon />
            </button>
          </div>
          <h2 className={styles.menuTitle}>Меню</h2>

          <div className={styles.menuGrid}>
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              let cardClassName = styles.menuCard;
              if (isActive) {
                cardClassName = `${styles.menuCard} ${styles.menuCardActive}`;
              }

              return (
                <Link key={item.href} href={item.href} className={cardClassName} onClick={handleCloseMenu}>
                  <span className={styles.menuCardLabel}>{item.label}</span>

                  <div className={styles.menuCardImage}>
                    <Image src={item.imageSrc} alt={item.label} fill sizes="40vw" className={styles.menuCardImg} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}
