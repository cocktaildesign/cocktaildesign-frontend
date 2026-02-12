"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./PaymentTabs.module.css";
import PersonIcon from "@/components/icons/payment-tabs/PersonIcon";
import OrganizationIcon from "@/components/icons/payment-tabs/OrganizationIcon";

// Экспортируем компонент по умолчанию
export default function PaymentTabs() {
  // Состояние активной вкладки: "legal" = юридические лица, "physical" = физические лица
  const [activeTab, setActiveTab] = useState<"physical" | "legal">("legal");

  return (
    <div className={styles.tabs}>
      {/* Заготовка кнопок табов */}
      <div className={styles.tabButtons}>
        <button
          className={`${styles.tabButton} ${activeTab === "legal" ? styles.active : ""}`}
          onClick={() => setActiveTab("legal")}>
          <OrganizationIcon className={styles.icon} width="38" height="34" />
          <span className={styles.tabText}>
            <span className={styles.tabTitle}>Юридические лица</span>
            <span className={styles.tabSubtitle}>Надёжная оплата с индивидуальными условиями</span>
          </span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "physical" ? styles.active : ""}`}
          onClick={() => setActiveTab("physical")}>
          <PersonIcon className={styles.icon} width="38" height="34" />
          <span className={styles.tabText}>
            <span className={styles.tabTitle}>Физические лица</span>
            <span className={styles.tabSubtitle}>Простые и безопасные платежи</span>
          </span>
        </button>
      </div>

      {/* Заготовка контента табов */}

      <div className={styles.tabContent}>
        {activeTab === "legal" && (
          <div className={styles.tabPane}>
            <ul className={styles.paymentList}>
              <li className={styles.paymentItem}>
                <h3 className={styles.paymentTitle}>Оплата счета</h3>
                <p className={styles.paymentDescription}>
                  После выставления счета менеджером оплату необходимо произвести в течение 3 рабочих дней. Если
                  требуется, срок можно продлить по договоренности с менеджером. Товар отправляется в течение суток
                  после получения оплаты, за исключением заказных позиций.
                </p>
                <Link href="/legal/requisites" className={styles.paymentButton}>
                  Смотреть реквизиты
                </Link>
              </li>
            </ul>
          </div>
        )}

        {activeTab === "physical" && (
          <div className={styles.tabPane}>
            <ul className={styles.paymentList}>
              <li className={styles.paymentItem}>
                <h3 className={styles.paymentTitle}>Оплата наличными</h3>
                <p className={styles.paymentDescription}>
                  Возможна оплата наличными при самовывозе в Санкт-Петербурге.
                </p>
              </li>

              <li className={styles.paymentItem}>
                <h3 className={styles.paymentTitle}>Оплата картой</h3>
                <p className={styles.paymentDescription}>Картами Visa, MasterCard, Мир. Без комиссии</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
