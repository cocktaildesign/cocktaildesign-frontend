// src/components/layout/NavBar.tsx

import Link from "next/link";
import Container from "@/components/layout/Container";
import styles from "./NavBar.module.css";
import { getNavigation } from "@/lib/api/navigation";

const NOVINKI_SLUG = "novinki";
const UTSENKA_SLUG = "utsenka";

function collectionHref(slug: string) {
  return `/catalog/collection/${slug}`;
}

function hrefCollectionSlug(href: string) {
  const parts = href.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

// Этот компонент остаётся серверным,
// просто теперь он асинхронный.
export default async function NavBar() {
  // Получаем навигацию из Strapi
  const navigation = await getNavigation();

  // novinki и utsenka закреплены слева — из списка Strapi убираем, чтобы не было дублей.
  const pinnedSlugs = new Set([NOVINKI_SLUG, UTSENKA_SLUG]);
  const headerItems = navigation.header.filter((item) => !pinnedSlugs.has(hrefCollectionSlug(item.href)));

  return (
    <nav className={styles.navBar} aria-label="Категории товаров">
      <Container>
        <div className={styles.inner}>
          <Link className={styles.newLink} href={collectionHref(NOVINKI_SLUG)}>
            Новинки
          </Link>

          <Link className={styles.utsenkaLink} href={collectionHref(UTSENKA_SLUG)}>
            Уценка
          </Link>

          <ul className={styles.categoryList}>
            {headerItems.map((item) => (
              <li key={item.href} className={styles.categoryItem}>
                <Link className={styles.categoryLink} href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link className={styles.sale} href="/catalog/collection/sale">
            % Товары со скидкой
          </Link>
        </div>
      </Container>
    </nav>
  );
}
