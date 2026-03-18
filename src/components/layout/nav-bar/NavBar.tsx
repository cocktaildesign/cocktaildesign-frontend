// src/components/layout/NavBar.tsx

import Link from "next/link";
import Container from "@/components/layout/Container";
import styles from "./NavBar.module.css";
import { getNavigation } from "@/lib/api/navigation";

// Этот компонент остаётся серверным,
// просто теперь он асинхронный.
export default async function NavBar() {
  // Получаем навигацию из Strapi
  const navigation = await getNavigation();

  return (
    <nav className={styles.navBar} aria-label="Категории товаров">
      <Container>
        <div className={styles.inner}>
          <ul className={styles.categoryList}>
            {navigation.header.map((item) => (
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
