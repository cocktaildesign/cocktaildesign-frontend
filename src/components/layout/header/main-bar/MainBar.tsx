"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./MainBar.module.css";

import { useFavoritesStore } from "@/lib/favorites/favoritesStore";
import { useCartStore } from "@/lib/cart/cartStore";

import Logo from "@/components/ui/logo/Logo";
import CatalogMenu from "@/components/layout/header/catalog-menu/CatalogMenu";
import SearchBar from "@/components/layout/header/search-bar/SearchBar";
import HeartIcon from "@/components/icons/HeartIcon";
import CartIcon from "@/components/icons/CartIcon";
import ArrowBackIcon from "@/components/icons/ArrowBackIcon";

import type { CatalogCategoryPreview, CatalogCollection } from "@/lib/api/catalog/types";

type MainBarProps = {
  categories: CatalogCategoryPreview[];
  collections: CatalogCollection[];
};

export default function MainBar({ categories, collections }: MainBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Находимся ли мы на главной странице
  const isHome = pathname === "/";

  // Открыт ли поиск
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Сигнал для закрытия поиска извне
  const [searchCloseSignal, setSearchCloseSignal] = useState(0);

  // Показываем стрелку назад:
  // - если это не главная
  // - или если открыт поиск
  const showBackButton = !isHome || isSearchOpen;

  function handleBackClick() {
    // Если поиск открыт — просто закрываем его
    if (isSearchOpen) {
      setSearchCloseSignal((value) => value + 1);
      return;
    }

    router.back();
  }

  // Избранное
  const favoritesHasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoritesIds = useFavoritesStore((state) => state.ids);

  // Корзина
  const cartHasHydrated = useCartStore((state) => state.hasHydrated);
  const cartItems = useCartStore((state) => state.items);

  // Пока store не гидратирован — счётчики не показываем
  const favoritesCount = favoritesHasHydrated ? Object.keys(favoritesIds).length : 0;
  const cartCount = cartHasHydrated ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <div className={styles.mainBar}>
      {/* Логотип */}
      <div className={styles.mainBarLeft}>
        <Logo className={styles.logo} />
      </div>

      {/* Кнопка назад */}
      {showBackButton && (
        <button type="button" className={styles.backButton} onClick={handleBackClick} aria-label="Назад">
          <ArrowBackIcon className={styles.backIcon} color="red" />
        </button>
      )}

      {/* Каталог и поиск */}
      <div className={`${styles.mainBarCenter} ${showBackButton ? styles.mainBarCenterInner : ""}`}>
        <CatalogMenu categories={categories} collections={collections} />
        <SearchBar categories={categories} onOpenChange={setIsSearchOpen} closeSignal={searchCloseSignal} />
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
