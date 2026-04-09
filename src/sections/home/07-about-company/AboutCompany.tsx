// src/sections/home/about-company/AboutCompany.tsx

import Container from "@/components/layout/Container";

import styles from "./AboutCompany.module.css";

// Данные блока вынесены в константу
const POINTS = [
  {
    id: "1",
    title: "Качество",
    description:
      "Собственное производство барного инвентаря с полным контролем качества. Стильная, функциональная и эргономичная продукция для комфортной работы сотрудников.",
  },
  {
    id: "2",
    title: "Сервис",
    description:
      "Менеджеры помогут с выбором оборудования, дадут профессиональные советы по использованию и уходу, проконсультируют по техническим вопросам.",
  },
  {
    id: "3",
    title: "Удобство оплаты",
    description:
      "Система скидок, акции и возможность оплаты как наличными, так и посредством платёжных систем сделают ваши покупки максимально комфортными.",
  },
  {
    id: "4",
    title: "Интернет-магазин",
    description:
      "Постоянно пополняемый ассортимент барного инвентаря и аксессуаров по конкурентным ценам. Наборы и готовые решения, товары для молекулярной кухни и бариста.",
  },
  {
    id: "5",
    title: "Доставка по всему миру",
    description:
      "Доставка заказов выполняется из Санкт-Петербурга по всему миру. Рассчитаем стоимость и подберём для вас оптимальный способ доставки.",
  },
  {
    id: "6",
    title: "Брендинг и гравировка",
    description:
      "Проектируем и производим барный инвентарь под бренд клиента. Нанесение логотипа на металлические изделия, выполнение заказов по проекту клиента.",
  },
];

export default function AboutCompany() {
  return (
    <section className={styles.section}>
      <Container>
        {/* Вступительная часть */}
        <div className={styles.intro}>
          <h2 className={styles.title}>Cocktail Design — барный инвентарь собственного производства</h2>

          <p className={styles.description}>
            Компания Cocktail Design предлагает широкий ассортимент барного инвентаря собственного производства.
            Стильная, функциональная и эргономичная продукция для комфортной работы сотрудников и качественного
            обслуживания гостей заведения.
          </p>
        </div>

        {/* Сетка преимуществ */}
        <div className={styles.grid}>
          {POINTS.map((point) => (
            <div key={point.id} className={styles.point}>
              <h3 className={styles.pointTitle}>{point.title}</h3>
              <p className={styles.pointDescription}>{point.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
