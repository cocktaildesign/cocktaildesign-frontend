// src/app/catalog/[slug]/catalog-sidebar/CatalogSidebar.tsx
import styles from "./CatalogSidebar.module.css";
import Link from "next/link";

type CatalogSidebarItem = {
  slug: string;
  name: string;
  children?: CatalogSidebarItem[];
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

                {/* 2-й уровень: показываем только у активной категории */}
                {isActive && item.children && item.children.length > 0 ? (
                  <ul className={styles.subList} aria-label={`Подкатегории: ${item.name}`}>
                    {item.children.map((child) => (
                      <li key={child.slug} className={styles.subItem}>
                        <Link href={`/catalog/${child.slug}`} scroll={false} className={styles.subLink}>
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
