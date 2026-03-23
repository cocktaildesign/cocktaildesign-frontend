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

  // По умолчанию лучше ставить "Физическое лицо" —
  // обычно это самый частый сценарий в e-commerce.
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

  // При переключении типа покупателя убираем ошибки полей,
  // которые больше не актуальны для текущей формы.
  function handleBuyerTypeChange(type: BuyerType) {
    setBuyerType(type);

    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors.fullName;
      delete nextErrors.contactName;
      delete nextErrors.inn;
      return nextErrors;
    });
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

    if (!phone.trim()) {
      newErrors.phone = "Укажите телефон";
    }

    if (!address.trim()) {
      newErrors.address = "Укажите адрес доставки";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    setSubmitStatus("loading");

    // Здесь позже будет реальная отправка формы
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
          {/* Переключатель типа покупателя */}
          <section className={styles.buyerTypeSection} aria-labelledby="buyer-type-title">
            <div className={styles.buyerTypeHeader}>
              <h2 id="buyer-type-title" className={styles.buyerTypeTitle}>
                Кто оформляет заказ
              </h2>
              <p className={styles.buyerTypeDescription}>
                Выберите подходящий вариант, чтобы показать нужные поля формы.
              </p>
            </div>

            <div className={styles.segmentedControl} role="tablist" aria-label="Тип покупателя">
              <button
                type="button"
                role="tab"
                aria-selected={buyerType === "legal"}
                className={`${styles.segmentButton} ${buyerType === "legal" ? styles.segmentButtonActive : ""}`}
                onClick={() => handleBuyerTypeChange("legal")}>
                <OrganizationIcon className={styles.segmentIcon} width="24" height="24" />
                <span className={styles.segmentText}>
                  <span className={styles.segmentTitle}>Юридическое лицо</span>
                  <span className={styles.segmentSubtitle}>Для бизнеса</span>
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={buyerType === "individual"}
                className={`${styles.segmentButton} ${buyerType === "individual" ? styles.segmentButtonActive : ""}`}
                onClick={() => handleBuyerTypeChange("individual")}>
                <PersonIcon className={styles.segmentIcon} width="24" height="24" />
                <span className={styles.segmentText}>
                  <span className={styles.segmentTitle}>Физическое лицо</span>
                  <span className={styles.segmentSubtitle}>Для себя</span>
                </span>
              </button>
            </div>
          </section>

          {/* Список товаров из корзины */}
          <section className={styles.orderSummary}>
            <h2 className={styles.orderSummaryTitle}>Ваш заказ</h2>

            <div className={styles.orderItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.orderItemMain}>
                    <span className={styles.orderItemName}>{item.name}</span>

                    {item.code && (
                      <span className={styles.orderItemCode}>
                        Артикул: <span className={styles.orderItemCodeValue}>{item.code}</span>
                      </span>
                    )}

                    {item.engraving && <span className={styles.orderItemEngraving}>Гравировка</span>}
                  </div>

                  <span className={styles.orderItemQty}>{item.quantity} шт.</span>

                  <span className={styles.orderItemPrice}>{formatPrice(item.price * item.quantity)} ₽</span>
                </div>
              ))}
            </div>

            <div className={styles.orderTotal}>
              <span className={styles.orderTotalLabel}>Итого</span>
              <span className={styles.orderTotalPrice}>{formatPrice(totalPrice)} ₽</span>
            </div>
          </section>
        </div>

        {/* Правая колонка — форма */}
        <section className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {buyerType === "individual" ? "Контактные данные" : "Данные для оформления"}
            </h2>
            <p className={styles.formDescription}>
              {buyerType === "individual"
                ? "Укажите данные получателя заказа."
                : "Укажите контакт и реквизиты компании."}
            </p>
          </div>

          <div className={styles.formGrid}>
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
                  onChange={(e) => {
                    setInn(e.target.value);
                    clearError("inn");
                  }}
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
        </section>
      </div>
    </div>
  );
}
