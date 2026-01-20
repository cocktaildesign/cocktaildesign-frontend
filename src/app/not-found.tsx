import Link from "next/link";
import Container from "@/components/layout/Container";
import styles from "./not-found.module.css";

export default function NotFoundPage() {
  return (
    <main className={styles.main}>
      <Container>
        <h1 className={styles.title}>Страница не найдена</h1>
        <p className={styles.text}>Возможно, ссылка устарела или страница была удалена.</p>
        <Link className={styles.link} href="/catalog">
          Перейти в каталог →
        </Link>
      </Container>
    </main>
  );
}
