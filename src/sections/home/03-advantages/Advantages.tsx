import styles from "./Advantages.module.css";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";

export default async function Advantages() {
  return (
    <PageLayout>
      <section className={styles.advantages} aria-labelledby="advantages-title">
        <h2 id="advantages-title" className={styles.title}>
          Профессиональный барный инвентарь
        </h2>

        <div className={styles.grid}>
          {/* Левый высокий акцентный блок */}
          <article className={`${styles.card} ${styles.cardTall} ${styles.saleCard}`}>
            <div className={styles.cardSaleBadge}>
              <span>Для новых клиентов</span>
            </div>

            <div className={styles.saleContent}>
              <p className={styles.cardSalePercent}>-20%</p>
              <p className={styles.cardSaleDescription}>Подарок на выбор</p>
              <p className={styles.cardSaleDescriptionText}>К первому заказу</p>
            </div>

            <div className={styles.saleFooter}>
              <Link href="/catalog" className={styles.cardSaleLink}>
                Перейти в каталог
              </Link>
            </div>
          </article>

          {/* Верхняя центральная */}
          <article className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardHeading}>Пожизненная гарантия</h3>
              <p className={styles.cardText}>Мы предоставляем пожизненную гарантию на наш барный инвентарь.</p>
            </div>
          </article>

          {/* Верхняя правая */}
          <article className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardHeading}>Для юридических лиц</h3>
              <p className={styles.cardText}>Возврат НДС, оптовые скидки и постоплата для компаний.</p>
            </div>
          </article>

          {/* Широкая центральная */}
          <article className={`${styles.card} ${styles.cardWide}`}>
            <div className={styles.cardContent}>
              <div className={styles.wideHeader}>
                <h3 className={styles.cardHeading}>Используется лучшими барами</h3>
              </div>

              <p className={styles.cardText}>
                Наш инвентарь использует множество ведущих баров из списка The World&apos;s 50 Best Bars. Лучший продукт
                России 2017 и 2019 по версии Barproof.
              </p>
            </div>
          </article>

          {/* Нижний ряд */}
          <article className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardHeading}>10 лет опыта</h3>
              <p className={styles.cardText}>Опыт работы с барным инвентарем и оборудованием более 10 лет.</p>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.smallCardHeader}>
                <h3 className={styles.cardHeadingSmall}>Гибкая система скидок</h3>
              </div>

              <p className={styles.cardText}>Индивидуальные скидки и предложения для наших клиентов.</p>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.smallCardHeader}>
                <h3 className={styles.cardHeadingSmall}>Быстрая доставка</h3>
              </div>

              <p className={styles.cardText}>Оперативно доставляем заказы по всей России и СНГ.</p>
            </div>
          </article>
        </div>
      </section>
    </PageLayout>
  );
}
