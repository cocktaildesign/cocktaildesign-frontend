import Link from "next/link";
import Container from "@/components/layout/Container";
import styles from "./not-found.module.css";

export default function NotFoundPage() {
  return (
    <main className={styles.main}>
      <Container>
        <div className={styles.content}>
          {/* Маленький лейбл сверху */}
          <span className={styles.label}>404 — Страница не найдена</span>

          {/* Тонкая линия */}
          <div className={styles.line} aria-hidden="true" />

          {/* Заголовок */}
          <h1 className={styles.title}>Эта страница не нашлась :(</h1>

          {/* Подсказка */}
          <p className={styles.text}>Возможно, ссылка устарела или товар был удалён. Давайте вернёмся к покупкам.</p>

          {/* Две кнопки */}
          <div className={styles.actions}>
            <Link href="/" className={styles.buttonPrimary}>
              <span>На главную</span>
            </Link>

            <Link href="/catalog" className={styles.buttonSecondary}>
              <span>В каталог</span>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
