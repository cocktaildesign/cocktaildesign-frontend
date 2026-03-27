"use client";

import { useState } from "react";
import Link from "next/link";

import PageLayout from "@/components/layout/PageLayout";
import styles from "./Advantages.module.css";
import { PromoModal } from "./PromoModal";

const cards = [
  {
    front: "Пожизненная гарантия",
    back: "Пожизненная гарантия на продукцию CocktailDesign. Берём на себя ремонт или замену — без лишних формальностей.",
  },
  {
    front: "The World's 50 Best Bars",
    back: "Наш инвентарь используют ведущие бары мира. Лучший продукт России 2017 и 2019 по версии Barproof.",
  },
  {
    front: "Работа с юр. лицами",
    back: "Возврат НДС, оптовые скидки, постоплата для компаний.",
  },
  {
    front: "Быстрая доставка",
    back: "Оперативно доставляем заказы по всей России и СНГ.",
  },
];

export default function Advantages() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  function handleCardClick(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <PageLayout>
      <section className={styles.section}>
        <h2 className={styles.title}>Профессиональный барный инвентарь</h2>

        <div className={styles.grid}>
          {cards.map((card, index) => {
            const isOpen = openIndex === index;

            return (
              <button
                key={card.front}
                type="button"
                className={styles.flipCard}
                onClick={() => handleCardClick(index)}
                aria-expanded={isOpen}>
                <div className={`${styles.flipCardInner} ${isOpen ? styles.flipped : ""}`}>
                  <div className={styles.front}>
                    <div className={styles.frontTop}>
                      <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.toggleIcon}>+</span>
                    </div>
                    <h3 className={styles.cardTitle}>{card.front}</h3>
                  </div>

                  <div className={styles.back}>
                    <span className={styles.toggleIcon}>−</span>
                    <p className={styles.cardText}>{card.back}</p>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Акцентная карточка */}
          <div className={styles.promoCard}>
            <div>
              <span className={styles.promoBadge}>Для новых клиентов</span>
              <p className={styles.promoPercent}>-20%</p>
              <div className={styles.promoRow}>
                <span className={styles.promoTitle}>Подарок на выбор</span>
                <span className={styles.promoSubtitle}>от 20 000₽</span>
              </div>
            </div>

            <div className={styles.promoBottom}>
              <span className={styles.promoCode}>STARTCD20</span>
              <div className={styles.promoFooter}>
                <Link href="/catalog" className={styles.promoLink}>
                  В каталог →
                </Link>
                <button type="button" className={styles.promoBtn} onClick={() => setIsPromoOpen(true)}>
                  Подробнее
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PromoModal isOpen={isPromoOpen} onClose={() => setIsPromoOpen(false)} />
    </PageLayout>
  );
}
