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
  collections: CatalogCollection[];
};

export default function MainBar({ categories, collections }: MainBarProps) {
  // Количество избранных товаров после гидрации стора
  const favoritesHasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoritesIds = useFavoritesStore((state) => state.ids);

  const favoritesCount = favoritesHasHydrated ? Object.keys(favoritesIds).length : 0;

  // Количество товаров в корзине после гидрации стора
  const cartHasHydrated = useCartStore((state) => state.hasHydrated);
  const cartItems = useCartStore((state) => state.items);

  const cartCount = cartHasHydrated ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <div className={styles.mainBar}>
      {/* Логотип */}
      <div className={styles.mainBarLeft}>
        <Logo className={styles.logo} />
      </div>

      {/* Каталог и поиск */}
      <div className={styles.mainBarCenter}>
        <CatalogMenu categories={categories} collections={collections} />
        <SearchBar categories={categories} />
      </div>

      {/* Избранное и корзина */}
      <div className={styles.mainBarRight}>
        <Link href="/favorites" className={styles.actionLink}>
          <div className={styles.iconWrapper}>
            <HeartIcon className={styles.actionIcon} />
            {favoritesCount > 0 && <span className={styles.badge}>{favoritesCount}</span>}
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
