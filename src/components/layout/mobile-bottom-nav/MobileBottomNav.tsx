// frontend/src/components/layout/mobile-bottom-nav/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import styles from "./MobileBottomNav.module.css";

import HeartIcon from "@/components/icons/HeartIcon";
import CartIcon from "@/components/icons/CartIcon";
import CatalogIcon from "@/components/icons/CatalogIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import ArrowBackIcon from "@/components/icons/ArrowBackIcon";
import DialogueIcon from "@/components/icons/DialogueIcon";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { useCartStore } from "@/lib/cart/cartStore";
import NavigationTile from "@/components/navigation/NavigationTile";
import { useCatalogMenu } from "@/components/layout/header/catalog-menu/CatalogMenuProvider";

export type MobileBottomNavMenuItem = {
  title: string;
  href: string;
  imageUrl: string;
};

type Props = {
  menuItems: MobileBottomNavMenuItem[];
};

export default function MobileBottomNav({ menuItems }: Props) {
  const pathname = usePathname();
  // Route changes unmount the open menu and release its modal/focus lifecycle.
  return <MobileNavigation key={pathname} menuItems={menuItems} pathname={pathname} />;
}

function MobileNavigation({ menuItems, pathname }: Props & { pathname: string }) {
  const catalogMenu = useCatalogMenu();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();

  const favoritesHasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoritesIds = useFavoritesStore((state) => state.ids);
  const favoritesCount = favoritesHasHydrated ? Object.keys(favoritesIds).length : 0;

  const cartHasHydrated = useCartStore((state) => state.hasHydrated);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartHasHydrated ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <>
      {/* Нижняя мобильная навигация */}
      <nav className={styles.mobileBottomNav} data-jivo-clearance>
        <Link href="/" className={`${styles.item} ${pathname === "/" ? styles.active : ""}`}>
          <span className={styles.icon}>
            <HomeIcon />
          </span>
          <span className={styles.label}>Главная</span>
        </Link>

        <button type="button" className={`${styles.item} ${styles.catalogButton} ${catalogMenu.isOpen || pathname.startsWith("/catalog") ? styles.active : ""}`}
          aria-label="Каталог" aria-expanded={catalogMenu.isOpen} aria-controls={catalogMenu.menuId} onClick={(event) => catalogMenu.toggle(event.currentTarget)}>
          <span className={styles.icon}>
            <CatalogIcon />
          </span>
          <span className={styles.label}>Каталог</span>
        </button>

        {/* Кнопка меню */}
        <button type="button" className={`${styles.item} ${styles.menuItem}`} aria-haspopup="dialog" aria-expanded={isMenuOpen} aria-controls={menuId} onClick={() => setIsMenuOpen(true)}>
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

      {isMenuOpen && <MobileMenuDialog id={menuId} menuItems={menuItems} pathname={pathname} onClose={handleCloseMenu} />}
    </>
  );
}

function MobileMenuDialog({ id, menuItems, pathname, onClose }: Props & { id: string; pathname: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const mobileViewport = window.matchMedia("(max-width: 600px)");
    const closeOnDesktop = () => { if (!mobileViewport.matches) onClose(); };

    dialog.showModal();
    closeOnDesktop();
    window.addEventListener("popstate", onClose);
    mobileViewport.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("popstate", onClose);
      mobileViewport.removeEventListener("change", closeOnDesktop);
      dialog.close();
      if (previousFocus?.isConnected && previousFocus.getClientRects().length > 0) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [onClose]);

  return createPortal(
    <dialog ref={dialogRef} id={id} className={styles.menuDialog} aria-labelledby={titleId} data-site-overlay="true" onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={(event) => { if (!event.currentTarget.open) onClose(); }}>
      <header className={styles.menuHeader}>
        <button type="button" className={styles.backButton} onClick={onClose} aria-label="Закрыть меню">
          <ArrowBackIcon title="" />
        </button>
        <h2 id={titleId} className={styles.menuTitle}>Меню</h2>
      </header>
      <div className={styles.menuScroll}>
        <nav className={styles.menuGrid} aria-label="Разделы магазина">
          {menuItems.map((item) => (
            <NavigationTile key={item.href} href={item.href} title={item.title} active={pathname === item.href} onClick={onClose} />
          ))}
        </nav>
        <Link href="/support/feedback" className={styles.feedbackLink} onClick={onClose}>
          <span className={styles.feedbackIcon} aria-hidden="true"><DialogueIcon title="" /></span>
          <span className={styles.feedbackText}>
            <span className={styles.feedbackTitle}>Обратная связь</span>
            <span className={styles.feedbackDescription}>Идеи и замечания о сайте и сервисе</span>
          </span>
          <span className={styles.feedbackArrow} aria-hidden="true">→</span>
        </Link>
      </div>
    </dialog>,
    document.body,
  );
}
