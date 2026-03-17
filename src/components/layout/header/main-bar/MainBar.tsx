// src/components/layout/header/main-bar/MainBar.tsx
"use client";

import Link from "next/link";
import styles from "./MainBar.module.css";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { useCartStore } from "@/lib/cart/cartStore";

import Logo from "@/components/ui/logo/Logo";
import CatalogMenu from "@/components/layout/header/catalog-menu/CatalogMenu";
import SearchBar from "@/components/layout/header/search-bar/SearchBar";
import HeartIcon from "@/components/icons/HeartIcon";
import CartIcon from "@/components/icons/CartIcon";

import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";

type MainBarProps = {
  categories: CatalogCategoryPreview[];
  // Колбэк для закрытия меню каталога — вызывается когда мышь
  // уходит в соседние зоны (логотип, поиск, иконки)
  onCloseCatalog?: () => void;
};

export default function MainBar({ categories }: MainBarProps) {
  const hasHydrated = useFavoritesStore((s) => s.hasHydrated);
  const favoritesCount = useFavoritesStore((s) => Object.keys(s.ids).length);
  const badgeCount = hasHydrated ? favoritesCount : 0;

  // Считаем общее количество товаров в корзине
  const cartItems = useCartStore((s) => s.items);
  // До загрузки localStorage показываем 0
  const cartHasHydrated = useCartStore((s) => s.hasHydrated);
  const cartCount = cartHasHydrated ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <div className={styles.mainBar}>
      {/* Логотип — при наведении закрываем каталог */}
      <div className={styles.mainBarLeft}>
        <Logo className={styles.logo} />
      </div>

      {/* Каталог + поиск */}
      <div className={styles.mainBarCenter}>
        <CatalogMenu categories={categories} />
        <SearchBar categories={categories} />
      </div>

      {/* Избранное + корзина */}
      <div className={styles.mainBarRight}>
        <Link href="/favorites" className={styles.actionLink}>
          <div className={styles.iconWrapper}>
            <HeartIcon className={styles.actionIcon} />
            {badgeCount > 0 && <span className={styles.badge}>{badgeCount}</span>}
          </div>
          <span className={styles.actionText}>Избранное</span>
        </Link>

        <Link href="/cart" className={styles.actionLink}>
          <div className={styles.iconWrapper}>
            <CartIcon className={styles.actionIcon} />
            {/* Показываем бейдж только если есть товары */}
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </div>
          <span className={styles.actionText}>Корзина</span>
        </Link>
      </div>
    </div>
  );
}
