// src/app/checkout/CheckoutClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/cartStore";
import PersonIcon from "@/components/icons/payment-tabs/PersonIcon";
import OrganizationIcon from "@/components/icons/payment-tabs/OrganizationIcon";
import styles from "./Checkout.module.css";

type BuyerType = "individual" | "legal";

// 1200 -> "1 200"
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

export default function CheckoutClient() {
  const items = useCartStore((s) => s.items);

  const [buyerType, setBuyerType] = useState<BuyerType>("legal");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactName, setContactName] = useState("");
  const [inn, setInn] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Итоговая сумма заказа
  let totalPrice = 0;
  for (const item of items) {
    totalPrice += item.price * item.quantity;
  }

  // Сброс одной ошибки при вводе
  function clearError(field: string) {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  // Валидация перед отправкой
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (buyerType === "legal" && !contactName.trim()) {
      newErrors.contactName = "Укажите контактное лицо";
    }
    if (buyerType === "individual" && !fullName.trim()) {
      newErrors.fullName = "Укажите имя и фамилию";
    }
    if (!phone.trim()) newErrors.phone = "Укажите телефон";
    if (!address.trim()) newErrors.address = "Укажите адрес доставки";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSubmitStatus("loading");
    console.log("Отправляем заказ...");
  }

  return (
    <div className={styles.page}>
      {/* Назад в корзину */}
      <Link href="/cart" className={styles.backLink}>
        ← Вернуться в корзину
      </Link>

      <h1 className={styles.title}>Оформление заказа</h1>

      <div className={styles.layout}>
        {/* Левая колонка — тип покупателя + список товаров */}
        <div className={styles.leftColumn}>
          {/* Карточки выбора типа покупателя */}
          <div className={styles.tabButtons}>
            <button
              type="button"
              className={`${styles.tabButton} ${buyerType === "legal" ? styles.active : ""}`}
              onClick={() => setBuyerType("legal")}>
              <OrganizationIcon className={styles.icon} width="38" height="34" />
              <span className={styles.tabText}>
                <span className={styles.tabTitle}>Юридическое лицо</span>
                <span className={styles.tabSubtitle}>Для компаний и ресторанов</span>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.tabButton} ${buyerType === "individual" ? styles.active : ""}`}
              onClick={() => setBuyerType("individual")}>
              <PersonIcon className={styles.icon} width="38" height="34" />
              <span className={styles.tabText}>
                <span className={styles.tabTitle}>Физическое лицо</span>
                <span className={styles.tabSubtitle}>Для частных покупателей</span>
              </span>
            </button>
          </div>

          {/* Список товаров из корзины */}
          <div className={styles.orderSummary}>
            <h2 className={styles.orderSummaryTitle}>Ваш заказ</h2>

            <div className={styles.orderItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <span className={styles.orderItemName}>
                    {item.name}
                    {item.engraving && <span className={styles.orderItemEngraving}>Гравировка</span>}
                  </span>
                  <span className={styles.orderItemQty}>{item.quantity} шт.</span>
                  <span className={styles.orderItemPrice}>{formatPrice(item.price * item.quantity)} ₽</span>
                </div>
              ))}
            </div>

            <div className={styles.orderTotal}>
              <span className={styles.orderTotalLabel}>Итого</span>
              <span className={styles.orderTotalPrice}>{formatPrice(totalPrice)} ₽</span>
            </div>
          </div>
        </div>

        {/* Правая колонка — форма */}
        <div className={styles.form}>
          <div className={styles.formGrid}>
            {/* Контактное лицо — только для юрлица */}
            {buyerType === "legal" && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="contactName">
                  Контактное лицо <span className={styles.required}>*</span>
                </label>
                <input
                  id="contactName"
                  type="text"
                  className={`${styles.input} ${errors.contactName ? styles.inputError : ""}`}
                  placeholder="Имя Фамилия"
                  value={contactName}
                  onChange={(e) => {
                    setContactName(e.target.value);
                    clearError("contactName");
                  }}
                />
                {errors.contactName && <p className={styles.errorText}>{errors.contactName}</p>}
              </div>
            )}

            {/* Имя Фамилия — только для физлица */}
            {buyerType === "individual" && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fullName">
                  Имя Фамилия <span className={styles.required}>*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
                  placeholder="Имя Фамилия"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearError("fullName");
                  }}
                />
                {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
              </div>
            )}

            {/* Телефон */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                Телефон <span className={styles.required}>*</span>
              </label>
              <input
                id="phone"
                type="tel"
                className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                placeholder="+7 999 123 45 67"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError("phone");
                }}
              />
              {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
            </div>

            {/* Telegram */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="telegram">
                Telegram
              </label>
              <input
                id="telegram"
                type="text"
                className={styles.input}
                placeholder="@username"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
              />
            </div>

            {/* ИНН — только для юрлица */}
            {buyerType === "legal" && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="inn">
                  ИНН компании
                </label>
                <input
                  id="inn"
                  type="text"
                  className={styles.input}
                  placeholder="7736570901"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                />
              </div>
            )}

            {/* Адрес доставки — на всю ширину */}
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="address">
                Адрес доставки <span className={styles.required}>*</span>
              </label>
              <input
                id="address"
                type="text"
                className={`${styles.input} ${errors.address ? styles.inputError : ""}`}
                placeholder="г. Москва, ул. Тверская, д. 1"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  clearError("address");
                }}
              />
              {errors.address && <p className={styles.errorText}>{errors.address}</p>}
            </div>

            {/* Комментарий — на всю ширину */}
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="comment">
                Комментарий к заказу
              </label>
              <textarea
                id="comment"
                className={styles.textarea}
                placeholder="Любые пожелания к заказу"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Кнопка отправки */}
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={submitStatus === "loading"}>
            {submitStatus === "loading" ? "Отправляем..." : "Оформить заказ"}
          </button>

          {submitStatus === "error" && <p className={styles.errorText}>Что-то пошло не так. Попробуйте ещё раз.</p>}
        </div>
      </div>
    </div>
  );
}
