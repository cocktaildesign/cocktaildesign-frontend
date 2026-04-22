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

  // Показываем стрелку назад на всех страницах кроме главной
  const isHome = pathname === "/";

  // Открыт ли поиск
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Счётчик-сигнал для закрытия поиска извне.
  // Когда число меняется, SearchBar видит это и закрывает свою панель.
  const [searchCloseSignal, setSearchCloseSignal] = useState(0);

  // Стрелка показывается если: не главная ИЛИ поиск открыт
  const showBackButton = !isHome || isSearchOpen;

  function handleBackClick() {
    // Если поиск открыт — закрываем его, не уходим со страницы
    if (isSearchOpen) {
      setSearchCloseSignal((value) => value + 1);
      return;
    }

    router.back();
  }

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

      {/* Кнопка назад — на мобилке, когда не главная или поиск открыт */}
      {showBackButton && (
        <button className={styles.backButton} onClick={handleBackClick} aria-label="Назад">
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
