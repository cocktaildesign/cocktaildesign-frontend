"use client";

import { useState } from "react";
import styles from "./ShippingTabs.module.css";

// Экспортируем компонент
export default function DeliveryTabs() {
  // Состояние активной вкладки
  const [activeTab, setActiveTab] = useState<"world" | "spb" | "pickup" | "discounts" | "returns" | "damaged">("world");

  return (
    <div className={styles.tabs}>
      {/* Кнопки табов */}
      <div className={styles.tabButtons}>
        <button
          className={`${styles.tabButton} ${activeTab === "world" ? styles.active : ""}`}
          onClick={() => setActiveTab("world")}>
          Россия и мир
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "spb" ? styles.active : ""}`}
          onClick={() => setActiveTab("spb")}>
          Санкт-Петербург
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "pickup" ? styles.active : ""}`}
          onClick={() => setActiveTab("pickup")}>
          Самовывоз
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "discounts" ? styles.active : ""}`}
          onClick={() => setActiveTab("discounts")}>
          Скидки на доставку
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "returns" ? styles.active : ""}`}
          onClick={() => setActiveTab("returns")}>
          Возврат
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "damaged" ? styles.active : ""}`}
          onClick={() => setActiveTab("damaged")}>
          Повреждённая посылка
        </button>
      </div>

      {/* Контент табов */}
      <div className={styles.tabContent}>
        {activeTab === "world" && (
          <section className={styles.tabPane} aria-labelledby="world-delivery-title">
            <h2 id="world-delivery-title" className={styles.tabTitle}>
              Доставка по России и миру
            </h2>

            <dl className={styles.tabText}>
              <dt className={styles.deliveryRegion}>Россия, Беларусь, Казахстан, Армения</dt>
              <dd className={styles.deliveryMethod}>Курьерская служба СДЭК</dd>

              <dt className={styles.deliveryRegion}>Весь мир</dt>
              <dd className={styles.deliveryMethod}>Почта России, EMS</dd>
            </dl>

            <p className={styles.tabText}>
              Средняя стоимость курьерской доставки по России — 350–500 ₽, срок доставки — 3–5 дней. Отправка
              производится в течение 2 рабочих дней после оплаты заказа.
            </p>
          </section>
        )}

        {activeTab === "spb" && (
          <section className={styles.tabPane} aria-labelledby="spb-delivery-title">
            <h2 id="spb-delivery-title" className={styles.tabTitle}>
              Доставка по Санкт-Петербургу
            </h2>

            <dl className={styles.tabList}>
              <dt className={styles.deliveryRegion}>Центр Санкт-Петербурга</dt>
              <dd className={styles.deliveryMethod}>Экспресс-доставка — 700 ₽</dd>

              <dt className={styles.deliveryRegion}>
                Василеостровский, Адмиралтейский, Петроградский, Центральный районы
              </dt>
              <dd className={styles.deliveryMethod}>Заказы от 7000 ₽ — бесплатная доставка</dd>

              <dt className={styles.deliveryRegion}>Остальные районы</dt>
              <dd className={styles.deliveryMethod}>Экспресс-доставка — по тарифам службы доставки</dd>

              <dt className={styles.deliveryRegion}>СДЭК</dt>
              <dd className={styles.deliveryMethod}>
                1-2 рабочих дня: до ПВЗ — 275 ₽, курьером — 465 ₽ (при заказе от 5000 ₽ — бесплатно)
              </dd>
            </dl>
          </section>
        )}

        {activeTab === "pickup" && (
          <section className={styles.tabPane} aria-labelledby="pickup-delivery-title">
            <h2 id="pickup-delivery-title" className={styles.tabTitle}>
              Самовывоз
            </h2>

            <dl className={styles.tabList}>
              <dt className={styles.deliveryRegion}>Адрес</dt>
              <dd className={styles.deliveryMethod}>
                ул. Уральская 19к8, бизнес-центр «Урал Плаза», оф.120, Санкт-Петербург
              </dd>

              <dt className={styles.deliveryRegion}>Условия</dt>
              <dd className={styles.deliveryMethod}>
                Самовывоз осуществляется по предварительному согласованию в рабочие часы
              </dd>
            </dl>

            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>Телефон:</span>{" "}
                <a href="tel:+79956226202" className={styles.contactLink}>
                  +7 (995) 622-62-02
                </a>
              </p>

              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>E-mail:</span>{" "}
                <a href="mailto:cocktaildesign@yandex.ru" className={styles.contactLink}>
                  cocktaildesign@yandex.ru
                </a>
              </p>
            </div>
          </section>
        )}

        {activeTab === "discounts" && (
          <section className={styles.tabPane} aria-labelledby="delivery-discounts-title">
            <h2 id="delivery-discounts-title" className={styles.tabTitle}>
              Скидки на доставку
            </h2>

            <dl className={styles.tabList}>
              <dt className={styles.deliveryRegion}>Россия</dt>
              <dd className={styles.deliveryMethod}>Бесплатная доставка при заказе от 5000 ₽</dd>

              <dt className={styles.deliveryRegion}>Крупногабаритные и отдалённые регионы</dt>
              <dd className={styles.deliveryMethod}>
                Для РФ, Казахстана, Беларуси, Армении — скидка 350 ₽ за каждые 5000 ₽ в чеке
              </dd>
            </dl>
          </section>
        )}

        {activeTab === "returns" && (
          <section className={styles.tabPane} aria-labelledby="delivery-returns-title">
            <h2 id="delivery-returns-title" className={styles.tabTitle}>
              Условия возврата
            </h2>

            <p className={styles.tabText}>
              Возврат и обмен товаров возможен в течение 14 дней с момента покупки. Товар должен быть неиспользованным и
              сохранять свой товарный вид и потребительские свойства.
            </p>

            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>Телефон:</span>{" "}
                <a href="tel:+79956226202" className={styles.contactLink}>
                  +7 (995) 622-62-02
                </a>
              </p>

              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>E-mail:</span>{" "}
                <a href="mailto:cocktaildesign@yandex.ru" className={styles.contactLink}>
                  cocktaildesign@yandex.ru
                </a>
              </p>
            </div>
          </section>
        )}

        {activeTab === "damaged" && (
          <section className={styles.tabPane} aria-labelledby="damaged-delivery-title">
            <h2 id="damaged-delivery-title" className={styles.tabTitle}>
              Повреждённая посылка
            </h2>
            <p className={styles.tabText}>
              Если при получении посылки вы заметили явные повреждения упаковки, следы вскрытия или подозрительные
              звуки, сразу составьте акт о повреждении на месте. Для этого обратитесь к сотруднику службы доставки — он
              подскажет, как правильно зафиксировать факт повреждения.
            </p>

            <div className={styles.contactInfo}>
              <p className={styles.contactText}>После оформления акта свяжитесь с нами:</p>

              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>Телефон:</span>{" "}
                <a href="tel:+79956226202" className={styles.contactLink}>
                  +7 (995) 622-62-02
                </a>
              </p>

              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>E-mail:</span>{" "}
                <a href="mailto:cocktaildesign@yandex.ru" className={styles.contactLink}>
                  cocktaildesign@yandex.ru
                </a>
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
