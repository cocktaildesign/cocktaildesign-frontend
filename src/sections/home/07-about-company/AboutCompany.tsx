import Link from "next/link";
import Container from "@/components/layout/Container";
import styles from "./AboutCompany.module.css";

export default function AboutCompany() {
  return (
    <section className={styles.section} aria-labelledby="home-about-title">
      <Container>
        <div className={styles.inner}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Cocktail Design</p>
            <h2 id="home-about-title" className={styles.title}>
              Производитель и магазин барного инвентаря
            </h2>
          </div>
          <div className={styles.content}>
            <p>
              Работаем с 2016 года. Собственный барный инвентарь разрабатываем и производим в Санкт-Петербурге.
            </p>
            <p>
              В каталоге представлены наши изделия и товары других брендов. Наносим логотипы на инвентарь,
              изготавливаем клише и создаём эксклюзивные изделия для вашего заведения.
            </p>
            <Link className={styles.link} href="/about">
              О компании <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
