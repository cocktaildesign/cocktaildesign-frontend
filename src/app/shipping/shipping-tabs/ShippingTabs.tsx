// frontend/src/app/shipping/shipping-tabs/ShippingTabs.tsx
"use client";

import { useState } from "react";
import styles from "./ShippingTabs.module.css";

type ShippingTab = "world" | "spb" | "pickup" | "discounts" | "returns" | "damaged";

type TabButton = {
  id: ShippingTab;
  label: string;
};

const TAB_BUTTONS: TabButton[] = [
  { id: "world", label: "Россия и мир" },
  { id: "spb", label: "Санкт-Петербург" },
  { id: "pickup", label: "Самовывоз" },
  { id: "discounts", label: "Скидки на доставку" },
  { id: "returns", label: "Возврат" },
  { id: "damaged", label: "Повреждённая посылка" },
];

// Экспортируем компонент
export default function DeliveryTabs() {
  // Состояние активной вкладки
  const [activeTab, setActiveTab] = useState<ShippingTab>("world");

  return (
    <div className={styles.tabs}>
      {/* Левая колонка с кнопками */}
      <div className={styles.tabButtons} role="tablist" aria-label="Разделы доставки">
        {TAB_BUTTONS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`shipping-panel-${tab.id}`}
              id={`shipping-tab-${tab.id}`}
              className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Правая колонка с контентом */}
      <div className={styles.tabContent}>
        {activeTab === "world" && (
          <section
            id="shipping-panel-world"
            role="tabpanel"
            aria-labelledby="shipping-tab-world"
            className={styles.tabPane}>
            <h2 className={styles.tabTitle}>Доставка по России и миру</h2>

            <dl className={styles.infoList}>
              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>Россия, Беларусь, Казахстан, Армения</dt>
                <dd className={styles.deliveryMethod}>Курьерская служба СДЭК</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>Весь мир</dt>
                <dd className={styles.deliveryMethod}>Почта России, EMS</dd>
              </div>
            </dl>

            <p className={styles.noteText}>
              Средняя стоимость курьерской доставки по России — 350–500 ₽, срок доставки — 3–5 дней. Отправка
              производится в течение 2 рабочих дней после оплаты заказа.
            </p>
          </section>
        )}

        {activeTab === "spb" && (
          <section
            id="shipping-panel-spb"
            role="tabpanel"
            aria-labelledby="shipping-tab-spb"
            className={styles.tabPane}>
            <h2 className={styles.tabTitle}>Доставка по Санкт-Петербургу</h2>

            <dl className={styles.infoList}>
              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>Центр Санкт-Петербурга</dt>
                <dd className={styles.deliveryMethod}>Экспресс-доставка — 700 ₽</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>
                  Василеостровский, Адмиралтейский, Петроградский, Центральный районы
                </dt>
                <dd className={styles.deliveryMethod}>Заказы от 7000 ₽ — бесплатная доставка</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>Остальные районы</dt>
                <dd className={styles.deliveryMethod}>Экспресс-доставка — по тарифам службы доставки</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>СДЭК</dt>
                <dd className={styles.deliveryMethod}>
                  1–2 рабочих дня: до ПВЗ — 275 ₽, курьером — 465 ₽. При заказе от 5000 ₽ — бесплатно.
                </dd>
              </div>
            </dl>
          </section>
        )}

        {activeTab === "pickup" && (
          <section
            id="shipping-panel-pickup"
            role="tabpanel"
            aria-labelledby="shipping-tab-pickup"
            className={styles.tabPane}>
            <h2 className={styles.tabTitle}>Самовывоз</h2>

            <dl className={styles.infoList}>
              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>Адрес</dt>
                <dd className={styles.deliveryMethod}>
                  ул. Уральская 19к8, бизнес-центр «Урал Плаза», оф. 120, Санкт-Петербург
                </dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>Условия</dt>
                <dd className={styles.deliveryMethod}>
                  Самовывоз осуществляется по предварительному согласованию в рабочие часы.
                </dd>
              </div>
            </dl>

            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>Телефон:</span>
                <a href="tel:+79956226202" className={styles.contactLink}>
                  +7 (995) 622-62-02
                </a>
              </p>

              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>E-mail:</span>
                <a href="mailto:cocktaildesign@yandex.ru" className={styles.contactLink}>
                  cocktaildesign@yandex.ru
                </a>
              </p>
            </div>
          </section>
        )}

        {activeTab === "discounts" && (
          <section
            id="shipping-panel-discounts"
            role="tabpanel"
            aria-labelledby="shipping-tab-discounts"
            className={styles.tabPane}>
            <h2 className={styles.tabTitle}>Скидки на доставку</h2>

            <dl className={styles.infoList}>
              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>Россия</dt>
                <dd className={styles.deliveryMethod}>Бесплатная доставка при заказе от 5000 ₽</dd>
              </div>

              <div className={styles.infoItem}>
                <dt className={styles.deliveryRegion}>Крупногабаритные и отдалённые регионы</dt>
                <dd className={styles.deliveryMethod}>
                  Для РФ, Казахстана, Беларуси, Армении — скидка 350 ₽ за каждые 5000 ₽ в чеке.
                </dd>
              </div>
            </dl>
          </section>
        )}

        {activeTab === "returns" && (
          <section
            id="shipping-panel-returns"
            role="tabpanel"
            aria-labelledby="shipping-tab-returns"
            className={styles.tabPane}>
            <h2 className={styles.tabTitle}>Условия возврата</h2>

            <p className={styles.noteText}>
              Возврат и обмен товаров возможен в течение 14 дней с момента покупки. Товар должен быть неиспользованным и
              сохранять товарный вид и потребительские свойства.
            </p>

            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>Телефон:</span>
                <a href="tel:+79956226202" className={styles.contactLink}>
                  +7 (995) 622-62-02
                </a>
              </p>

              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>E-mail:</span>
                <a href="mailto:cocktaildesign@yandex.ru" className={styles.contactLink}>
                  cocktaildesign@yandex.ru
                </a>
              </p>
            </div>
          </section>
        )}

        {activeTab === "damaged" && (
          <section
            id="shipping-panel-damaged"
            role="tabpanel"
            aria-labelledby="shipping-tab-damaged"
            className={styles.tabPane}>
            <h2 className={styles.tabTitle}>Повреждённая посылка</h2>

            <p className={styles.noteText}>
              Если при получении посылки вы заметили явные повреждения упаковки, следы вскрытия или подозрительные
              звуки, сразу составьте акт о повреждении на месте. Для этого обратитесь к сотруднику службы доставки — он
              подскажет, как правильно зафиксировать факт повреждения.
            </p>

            <div className={styles.contactInfo}>
              <p className={styles.contactText}>После оформления акта свяжитесь с нами:</p>

              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>Телефон:</span>
                <a href="tel:+79956226202" className={styles.contactLink}>
                  +7 (995) 622-62-02
                </a>
              </p>

              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>E-mail:</span>
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
