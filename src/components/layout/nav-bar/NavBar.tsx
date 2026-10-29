// src/components/layout/NavBar.tsx

import Link from "next/link";
import Container from "@/components/layout/Container";
import styles from "./NavBar.module.css";
import { getNavigation } from "@/lib/api/navigation";
import PriorityCategoryLinks from "./PriorityCategoryLinks";

const NOVINKI_SLUG = "novinki";
const UTSENKA_SLUG = "utsenka";
const WINE_CATEGORY_HREF = "/catalog/ms-8f966568";

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

  // These collections stay visible even when there is no room for categories.
  const pinnedSlugs = new Set([NOVINKI_SLUG, UTSENKA_SLUG, "sale"]);
  const headerItems = navigation.header
    .filter((item) => !pinnedSlugs.has(hrefCollectionSlug(item.href)))
    // В этой строке вместо винной категории показываем подборку собственного производства.
    // Остальная навигация (каталог и подвал) продолжает использовать настройки Strapi.
    .map((item) =>
      item.href === WINE_CATEGORY_HREF
        ? { label: "Наше производство", href: collectionHref("nashe-proizvodstvo") }
        : item,
    );

  return (
    <nav className={styles.navBar} aria-label="Категории товаров">
      <Container>
        <div className={styles.inner}>
          <PriorityCategoryLinks items={headerItems} />
          <ul className={styles.collections} aria-label="Подборки товаров">
            <li><Link className={styles.categoryLink} href={collectionHref(NOVINKI_SLUG)}>Новинки</Link></li>
            <li><Link className={styles.categoryLink} href="/catalog/collection/sale">Скидки</Link></li>
            <li><Link className={styles.categoryLink} href={collectionHref(UTSENKA_SLUG)}>Уценка</Link></li>
          </ul>
        </div>
      </Container>
    </nav>
  );
}
