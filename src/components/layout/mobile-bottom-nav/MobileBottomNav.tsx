"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./MobileBottomNav.module.css";

import HeartIcon from "@/components/icons/HeartIcon";
import CartIcon from "@/components/icons/CartIcon";
import CatalogIcon from "@/components/icons/CatalogIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import MenuIcon from "@/components/icons/MenuIcon";

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
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

      <button className={`${styles.item} ${styles.menuItem}`}>
        <span className={styles.label}>Меню</span>
      </button>

      <Link href="/favorites" className={`${styles.item} ${pathname === "/favorites" ? styles.active : ""}`}>
        <span className={styles.icon}>
          <HeartIcon />
        </span>
        <span className={styles.label}>Избранное</span>
      </Link>

      <Link href="/cart" className={`${styles.item} ${pathname === "/cart" ? styles.active : ""}`}>
        <span className={styles.icon}>
          <CartIcon />
        </span>
        <span className={styles.label}>Корзина</span>
      </Link>
    </nav>
  );
}
