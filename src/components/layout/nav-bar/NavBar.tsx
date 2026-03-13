// src/components/layout/NavBar.tsx

import Link from "next/link";
import Container from "@/components/layout/Container";
import styles from "./NavBar.module.css";

// Статические ссылки на категории.
// В будущем заменим на данные из Strapi.
const CATALOG_ITEMS = [
  { label: "Шейкеры", href: "/catalog/sheykeri" },
  { label: "Смесительные стаканы", href: "/catalog/smesitelnye-stakany" },
  { label: "Джиггеры и мерники", href: "/catalog/dzhiggery-i-merniki" },
  { label: "Барные ложки", href: "/catalog/barnye-lozhki" },
  { label: "Армбэнды и аксессуары", href: "/catalog/aksessuary" },
  { label: "Собственное производство", href: "/catalog/production" },
  { label: "Трубочки и украшения", href: "/catalog/trubochki" },
];

// Этот компонент — серверный (без "use client").
// Он просто рендерит статичные ссылки, никакого стейта не нужно.
export default function NavBar() {
  return (
    <nav className={styles.navBar} aria-label="Категории товаров">
      <Container>
        <div className={styles.inner}>
          <ul className={styles.categoryList}>
            {CATALOG_ITEMS.map((item) => (
              <li key={item.href} className={styles.categoryItem}>
                <Link className={styles.categoryLink} href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link className={styles.sale} href="/discounts-product">
            % Товары со скидкой
          </Link>
        </div>
      </Container>
    </nav>
  );
}
