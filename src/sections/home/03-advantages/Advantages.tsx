import styles from "./Advantages.module.css";
import PageLayout from "@/components/layout/PageLayout";
import Logo from "@/components/ui/logo/Logo";
import Link from "next/link";
import Image from "next/image";
import GuaranteeIcon from "@/components/icons/home-page/GuaranteeIcon";
import TheWorlds50BestLogo from "@/components/icons/home-page/TheWorlds50BestLogo";
import BarProofLogo from "@/components/icons/home-page/BarProofLogo";

export default async function Advantages() {
  return (
    <PageLayout>
      <section className={styles.advantages}>
        <h2 className={styles.title}>Профессиональный барный инвентарь</h2>

        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.cardTall}`}>
            <Logo className={styles.logoSmall} />
            <p className={styles.cardDescription}>Магазин барного инвентаря</p>

            <div className={styles.cardSale}>
              <div className={styles.cardSaleBadge}>
                <span>Для новых клиентов</span>
              </div>

              <div className={styles.cardSaleContent}>
                <p className={styles.cardSalePercent}>-20%</p>
                <p className={styles.cardSaleDescription}>Подарок на выбор</p>
              </div>

              <Link href="/catalog" className={styles.cardSaleButton}>
                Перейти в каталог
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardMeta}>
              <GuaranteeIcon className={styles.cardIcon} />
              <p className={styles.cardSubtitle}>Распространяется только на продукцию Cocktail Design</p>
            </div>
            <p className={styles.cardTitle}>Пожизненная гарантия на нашу продукцию</p>
          </div>

          <div className={`${styles.card} ${styles.cardWide}`}>
            <h3 className={styles.cardHeading}>Для юридических лиц</h3>
            <div className={styles.cardImageWrap}>
              <Image src="/images/page/Advantages/bg_srrein.webp" alt="Для юридических лиц" fill />
            </div>
            <div className={styles.cardFeatures}>
              <p className={styles.cardTitle}>Возврат НДС</p>
              <p className={styles.cardTitle}>Оптовые скидки</p>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardColor}`}>
            <TheWorlds50BestLogo className={styles.theWorlds50BestLogo} />
            <p className={styles.cardTitle}>Наш инвентарь используют бары из списка The World&apos;s 50 Best Bars</p>
          </div>

          <div className={`${styles.card} ${styles.cardColor}`}>
            <BarProofLogo className={styles.barProofLogo} />
            <p className={styles.cardTitle}>Лучший продукт России 2017 и 2019 по версии Barproof</p>
          </div>

          <div className={styles.card}>
            <span className={styles.cardAccent}>10</span>
            <p className={styles.cardTitle}>Лет опыта в барном инвентаре и оборудовании</p>
          </div>

          <div className={styles.bottomCard}>Поставим товар под заказ</div>

          <div className={styles.bottomCard}>Гибкая система скидок</div>

          <div className={styles.bottomCard}>Разработка и брендинг</div>

          <div className={styles.bottomCard}>Быстрая доставка</div>
        </div>
      </section>
    </PageLayout>
  );
}
