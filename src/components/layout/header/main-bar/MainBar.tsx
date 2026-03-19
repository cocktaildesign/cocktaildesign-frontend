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

import type { CatalogCategoryPreview, CatalogCollection } from "@/lib/api/catalog/types";

type MainBarProps = {
  categories: CatalogCategoryPreview[];
  collections: CatalogCollection[]; // ← новое
  onCloseCatalog?: () => void;
};

export default function MainBar({ categories, collections }: MainBarProps) {
  const hasHydrated = useFavoritesStore((s) => s.hasHydrated);
  const favoritesCount = useFavoritesStore((s) => Object.keys(s.ids).length);
  const badgeCount = hasHydrated ? favoritesCount : 0;

  const cartItems = useCartStore((s) => s.items);
  const cartHasHydrated = useCartStore((s) => s.hasHydrated);
  const cartCount = cartHasHydrated ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <div className={styles.mainBar}>
      <div className={styles.mainBarLeft}>
        <Logo className={styles.logo} />
      </div>

      <div className={styles.mainBarCenter}>
        {/* Передаём коллекции в мегаменю */}
        <CatalogMenu categories={categories} collections={collections} />
        <SearchBar categories={categories} />
      </div>

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
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </div>
          <span className={styles.actionText}>Корзина</span>
        </Link>
      </div>
    </div>
  );
}
