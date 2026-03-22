"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./PaymentTabs.module.css";

type PaymentTab = "legal" | "physical";

// Экспортируем компонент по умолчанию
export default function PaymentTabs() {
  // Состояние активной вкладки:
  // "legal" = юридические лица
  // "physical" = физические лица
  const [activeTab, setActiveTab] = useState<PaymentTab>("legal");

  return (
    <div className={styles.tabs}>
      {/* Левая колонка: навигация */}
      <div className={styles.tabButtons} role="tablist" aria-label="Разделы оплаты">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "legal"}
          aria-controls="payment-panel-legal"
          id="payment-tab-legal"
          className={`${styles.tabButton} ${activeTab === "legal" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("legal")}>
          <span className={styles.tabButtonText}>Юридические лица</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "physical"}
          aria-controls="payment-panel-physical"
          id="payment-tab-physical"
          className={`${styles.tabButton} ${activeTab === "physical" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("physical")}>
          <span className={styles.tabButtonText}>Физические лица</span>
        </button>
      </div>

      {/* Правая колонка: контент */}
      <div className={styles.tabContent}>
        {activeTab === "legal" && (
          <section
            id="payment-panel-legal"
            role="tabpanel"
            aria-labelledby="payment-tab-legal"
            className={styles.tabPane}>
            <div className={styles.headerBlock}>
              <div className={styles.headerText}>
                <h2 className={styles.pageTitle}>Оплата по счёту</h2>
                <p className={styles.pageSubtitle}>Выставим счёт. Оплата по реквизитам</p>
              </div>
            </div>

            <div className={styles.innerCard}>
              <h3 className={styles.sectionTitle}>Как происходит оплата</h3>

              <ol className={styles.stepsList}>
                <li className={styles.stepItem}>
                  <span className={styles.stepNumber}>1</span>

                  <div className={styles.stepContent}>
                    <h4 className={styles.stepTitle}>Вы оставляете заявку</h4>
                    <p className={styles.stepDescription}>Менеджер связывается с вами</p>
                  </div>
                </li>

                <li className={styles.stepItem}>
                  <span className={styles.stepNumber}>2</span>

                  <div className={styles.stepContent}>
                    <h4 className={styles.stepTitle}>Мы выставляем счёт</h4>
                    <p className={styles.stepDescription}>Отправляем на email</p>
                  </div>
                </li>

                <li className={styles.stepItem}>
                  <span className={styles.stepNumber}>3</span>

                  <div className={styles.stepContent}>
                    <h4 className={styles.stepTitle}>Вы производите оплату</h4>
                    <p className={styles.stepDescription}>Товар резервируется</p>
                  </div>
                </li>

                <li className={styles.stepItem}>
                  <span className={styles.stepNumber}>4</span>

                  <div className={styles.stepContent}>
                    <h4 className={styles.stepTitle}>Отгрузка товара</h4>
                    <p className={styles.stepDescription}>После поступления средств</p>
                  </div>
                </li>
              </ol>

              <div className={styles.noteBox}>
                <p className={styles.noteTitle}>Срок резерва товара — 14 рабочих дней</p>
                <p className={styles.noteText}>Мы резервируем товар на 14 рабочих дней с момента выставления счёта.</p>
              </div>

              <Link href="/legal/requisites" className={styles.paymentLink}>
                Смотреть реквизиты
              </Link>
            </div>
          </section>
        )}

        {activeTab === "physical" && (
          <section
            id="payment-panel-physical"
            role="tabpanel"
            aria-labelledby="payment-tab-physical"
            className={styles.tabPane}>
            <div className={styles.headerBlock}>
              <div className={styles.headerText}>
                <h2 className={styles.pageTitle}>Способы оплаты для физических лиц</h2>
                <p className={styles.pageSubtitle}>Простые и безопасные платежи</p>
              </div>
            </div>

            <div className={styles.innerCard}>
              <div className={styles.physicalCards}>
                <article className={styles.physicalCard}>
                  <h3 className={styles.cardTitle}>Оплата наличными</h3>
                  <p className={styles.cardText}>Возможна оплата наличными при самовывозе в Санкт-Петербурге.</p>
                </article>

                <article className={styles.physicalCard}>
                  <h3 className={styles.cardTitle}>Оплата картой</h3>
                  <p className={styles.cardText}>Картами Visa, MasterCard, Мир. Без комиссии.</p>
                </article>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
