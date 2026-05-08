"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/cartStore";
import { useDiscountTiers, getCurrentTier } from "@/lib/cart/discountTiers";
import PersonIcon from "@/components/icons/payment-tabs/PersonIcon";
import OrganizationIcon from "@/components/icons/payment-tabs/OrganizationIcon";
import styles from "./Checkout.module.css";

type BuyerType = "individual" | "legal";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

export default function CheckoutClient() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const promoType = useCartStore((s) => s.promoType);
  const promoReplacesVolumeDiscount = useCartStore((s) => s.promoReplacesVolumeDiscount);
  const clearCart = useCartStore((s) => s.clearCart);

  const { tiers } = useDiscountTiers();

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

  // Считаем суммы
  let totalPrice = 0;
  let discountableTotal = 0;

  for (const item of items) {
    totalPrice += item.price * item.quantity;

    if (!item.discountExcluded) {
      discountableTotal += item.price * item.quantity;
    }
  }

  // Порог скидки определяется по ОБЩЕЙ сумме корзины (totalPrice),
  // а сама скидка применяется только к товарам без discountExcluded (discountableTotal)
  const currentTier = getCurrentTier(tiers, totalPrice);
  const volumeDiscount = currentTier ? Math.round((discountableTotal * currentTier.percent) / 100) : 0;
  const promoApplied = promoDiscount > 0 || promoType === "inventory" || promoType === "startup";

  let activeVolumeDiscount = volumeDiscount;
  let activePromoDiscount = promoDiscount;

  if (promoReplacesVolumeDiscount && promoApplied) {
    if (volumeDiscount > promoDiscount) {
      activePromoDiscount = 0;
    } else {
      activeVolumeDiscount = 0;
    }
  }

  const finalPrice = totalPrice - activePromoDiscount - activeVolumeDiscount;

  function clearError(field: string) {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

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

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitStatus("loading");

    try {
      const res = await fetch("https://api.cocktaildesign.ru/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerType,
          fullName: buyerType === "individual" ? fullName : undefined,
          contactName: buyerType === "legal" ? contactName : undefined,
          phone,
          telegram: telegram || undefined,
          inn: buyerType === "legal" && inn ? inn : undefined,
          address,
          comment: comment || undefined,
          // Скидки — передаём если есть
          promoCode: promoCode || undefined,
          promoDiscount: activePromoDiscount || undefined,
          volumeDiscount: activeVolumeDiscount || undefined,
          volumeDiscountPercent: currentTier?.percent || undefined,
          items: items.map((item) => ({
            code: item.code,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            engraving: item.engraving,
            discountExcluded: item.discountExcluded,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSubmitStatus("error");
        return;
      }

      // Очищаем корзину и редиректим на страницу успеха
      clearCart();
      router.push(`/checkout/success?order=${data.orderName}`);
    } catch {
      setSubmitStatus("error");
    }
  }

  return (
    <div className={styles.page}>
      <Link href="/cart" className={styles.backLink}>
        ← Вернуться в корзину
      </Link>

      <h1 className={styles.title}>Оформление заказа</h1>

      <div className={styles.layout}>
        {/* Левая колонка */}
        <div className={styles.leftColumn}>
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

          {/* Состав заказа */}
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

            {volumeDiscount > 0 && (
              <div className={styles.orderTotal}>
                <span className={styles.orderTotalLabel}>Скидка за объём {currentTier?.percent}%</span>
                <span className={styles.orderTotalPrice}>−{formatPrice(volumeDiscount)} ₽</span>
              </div>
            )}

            {promoDiscount > 0 && (
              <div className={styles.orderTotal}>
                <span className={styles.orderTotalLabel}>Скидка по промокоду</span>
                <span className={styles.orderTotalPrice}>−{formatPrice(promoDiscount)} ₽</span>
              </div>
            )}

            <div className={styles.orderTotal}>
              <span className={styles.orderTotalLabel}>Итого</span>
              <span className={styles.orderTotalPrice}>{formatPrice(finalPrice)} ₽</span>
            </div>
          </section>
        </div>

        {/* Правая колонка */}
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
