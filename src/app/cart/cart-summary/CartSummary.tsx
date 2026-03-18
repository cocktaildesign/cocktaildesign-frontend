// src/app/cart/cart-summary/CartSummary.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/cartStore";
import styles from "./CartSummary.module.css";

// 1200 -> "1 200"
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

// Склонение: 1 товар / 2 товара / 5 товаров
function formatProductsCount(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} товаров`;
  if (last === 1) return `${count} товар`;
  if (last >= 2 && last <= 4) return `${count} товара`;
  return `${count} товаров`;
}

export default function CartSummary() {
  const items = useCartStore((s) => s.items);

  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [promoError, setPromoError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Считаем итоги
  let totalQuantity = 0;
  let totalPrice = 0;
  let totalSavings = 0;

  for (const item of items) {
    totalQuantity += item.quantity;
    totalPrice += item.price * item.quantity;
    if (item.priceOld > item.price) {
      totalSavings += (item.priceOld - item.price) * item.quantity;
    }
  }

  // Итог с учётом промокода
  const finalPrice = totalPrice - promoDiscount;

  // Сброс промокода при изменении поля
  function handlePromoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPromoCode(e.target.value);
    setPromoStatus("idle");
    setPromoDiscount(0);
    setPromoError("");
  }

  // Отправка промокода на сервер
  async function handleApplyPromo() {
    if (!promoCode.trim()) return;

    setPromoStatus("loading");
    setPromoError("");

    try {
      const response = await fetch("https://api.cocktaildesign.ru/api/promo-code/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), totalPrice }),
      });

      const data = await response.json();

      if (data.ok) {
        setPromoDiscount(data.discountAmount);
        setPromoStatus("success");
      } else {
        setPromoStatus("error");
        const errorMessages: Record<string, string> = {
          not_found: "Промокод не найден",
          not_active: "Промокод неактивен",
          limit_reached: "Промокод больше не действует",
        };
        setPromoError(errorMessages[data.error] ?? "Что-то пошло не так");
      }
    } catch {
      setPromoStatus("error");
      setPromoError("Ошибка соединения");
    }
  }

  return (
    <section className={styles.summaryWrapper}>
      {/* Кнопка оформления заказа */}
      <Link href="/checkout" className={styles.checkoutButton}>
        Оформить заказ
      </Link>

      <div className={styles.summary}>
        {/* Промокод */}
        <div className={styles.promoBlock}>
          <input
            type="text"
            className={styles.promoInput}
            placeholder="Промокод"
            value={promoCode}
            onChange={handlePromoChange}
          />

          {/* Кнопка появляется только когда что-то введено и промокод ещё не применён */}
          {promoCode.length > 0 && promoStatus !== "success" && (
            <button
              type="button"
              className={styles.promoButton}
              onClick={handleApplyPromo}
              disabled={promoStatus === "loading"}>
              {promoStatus === "loading" ? "Проверяем..." : "Применить"}
            </button>
          )}

          {promoStatus === "error" && <p className={styles.promoError}>{promoError}</p>}
          {promoStatus === "success" && <p className={styles.promoSuccess}>Промокод применён!</p>}
        </div>

        {/* Строки итога */}
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>{formatProductsCount(totalQuantity)}</span>
            <span>{formatPrice(totalPrice)} ₽</span>
          </div>

          {totalSavings > 0 && (
            <div className={styles.totalRow}>
              <span>Ваша выгода</span>
              <span className={styles.savings}>−{formatPrice(totalSavings)} ₽</span>
            </div>
          )}

          {promoDiscount > 0 && (
            <div className={styles.totalRow}>
              <span>Промокод</span>
              <span className={styles.savings}>−{formatPrice(promoDiscount)} ₽</span>
            </div>
          )}

          <div className={styles.totalRow}>
            <span>Доставка</span>
            <span className={styles.deliveryNote}>при оформлении</span>
          </div>
        </div>

        {/* Итоговая сумма */}
        <div className={styles.totalFinal}>
          <span className={styles.totalFinalLabel}>Итого</span>
          <span className={styles.totalFinalPrice}>{formatPrice(finalPrice)} ₽</span>
        </div>
      </div>
    </section>
  );
}
