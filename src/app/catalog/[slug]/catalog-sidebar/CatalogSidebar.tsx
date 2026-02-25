// src/app/catalog/[slug]/catalog-sidebar/CatalogSidebar.tsx
import styles from "./CatalogSidebar.module.css";
import Link from "next/link";

type CatalogSidebarItem = {
  slug: string;
  name: string;
};

type CatalogSidebarProps = {
  items: CatalogSidebarItem[];
  activeSlug: string;
};

export default function CatalogSidebar({ items, activeSlug }: CatalogSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>Категории</h2>

      {/* Заглушка: дальше здесь будет список категорий + фильтры */}
      <nav aria-label="Категории каталога">
        <ul className={styles.list}>
          {items.map((item) => {
            const isActive = item.slug === activeSlug;

            return (
              <li key={item.slug} className={styles.item}>
                <Link
                  href={`/catalog/${item.slug}`}
                  scroll={false}
                  className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
