// src/app/cart/cart-summary/CartSummary.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart/cartStore";
import styles from "./CartSummary.module.css";
import Link from "next/link";

// Форматируем цену: 1200 -> "1 200"
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

function formatProductsCount(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;

  // исключение для 11-14
  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} товаров`;
  }

  // 1 товар
  if (last === 1) {
    return `${count} товар`;
  }

  // 2-4 товара
  if (last >= 2 && last <= 4) {
    return `${count} товара`;
  }

  return `${count} товаров`;
}

export default function CartSummary() {
  const items = useCartStore((s) => s.items);

  // Локальный стейт для поля промокода
  const [promoCode, setPromoCode] = useState<string>("");

  // Статус применения промокода
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Сообщение об ошибке
  const [promoError, setPromoError] = useState<string>("");

  // Скидка от промокода в рублях
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  // Считаем общее количество штук
  let totalQuantity = 0;
  for (const item of items) {
    totalQuantity = totalQuantity + item.quantity;
  }

  // Считаем итоговую сумму
  let totalPrice = 0;
  for (const item of items) {
    totalPrice = totalPrice + item.price * item.quantity;
  }

  // Считаем экономию — разница между старой и новой ценой
  let totalSavings = 0;
  for (const item of items) {
    if (item.priceOld > item.price) {
      totalSavings = totalSavings + (item.priceOld - item.price) * item.quantity;
    }
  }

  // Итоговая сумма с учётом скидки промокода
  const finalPrice = totalPrice - promoDiscount;

  // Отправляем промокод на сервер для проверки
  async function handleApplyPromo() {
    // Защита от пустого поля
    if (!promoCode.trim()) return;

    // Показываем загрузку
    setPromoStatus("loading");
    setPromoError("");

    try {
      // Отправляем запрос на наш API
      const response = await fetch("https://api.cocktaildesign.ru/api/promo-code/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          totalPrice: totalPrice,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        // Промокод применён — сохраняем скидку
        setPromoDiscount(data.discountAmount);
        setPromoStatus("success");
      } else {
        // Сервер вернул ошибку — показываем сообщение
        setPromoStatus("error");

        if (data.error === "not_found") {
          setPromoError("Промокод не найден");
        } else if (data.error === "not_active") {
          setPromoError("Промокод неактивен");
        } else if (data.error === "limit_reached") {
          setPromoError("Промокод больше не действует");
        } else {
          setPromoError("Что-то пошло не так");
        }
      }
    } catch {
      // Сеть упала или сервер недоступен
      setPromoStatus("error");
      setPromoError("Ошибка соединения");
    }
  }

  return (
    <section className={styles.summaryWrapper}>
      <Link href="/checkout" className={styles.checkoutButton}>
        Оформить заказ
      </Link>
      <div className={styles.summary}>
        {/* Промокод — кнопка появляется только когда есть текст */}
        <div className={styles.promoBlock}>
          <input
            type="text"
            className={styles.promoInput}
            placeholder="Промокод"
            value={promoCode}
            // Сбрасываем скидку если пользователь изменил код
            onChange={(e) => {
              setPromoCode(e.target.value);
              setPromoStatus("idle");
              setPromoDiscount(0);
              setPromoError("");
            }}
          />
          {/* Показываем кнопку только если пользователь что-то ввёл */}
          {promoCode.length > 0 && promoStatus !== "success" && (
            <button
              type="button"
              className={styles.promoButton}
              onClick={handleApplyPromo}
              disabled={promoStatus === "loading"}>
              {promoStatus === "loading" ? "Проверяем..." : "Применить"}
            </button>
          )}

          {/* Сообщение об ошибке */}
          {promoStatus === "error" && <p className={styles.promoError}>{promoError}</p>}

          {/* Успешное применение */}
          {promoStatus === "success" && <p className={styles.promoSuccess}>Промокод применён!</p>}
        </div>

        {/* Строки итога */}
        <div className={styles.totals}>
          {/* Количество товаров и сумма */}
          <div className={styles.totalRow}>
            <span>{formatProductsCount(totalQuantity)}</span>
            <span>{formatPrice(totalPrice)} ₽</span>
          </div>

          {/* Экономия от скидок на товары */}
          {totalSavings > 0 && (
            <div className={styles.totalRow}>
              <span>Ваша выгода</span>
              <span className={styles.savings}>−{formatPrice(totalSavings)} ₽</span>
            </div>
          )}

          {/* Скидка от промокода */}
          {promoDiscount > 0 && (
            <div className={styles.totalRow}>
              <span>Промокод</span>
              <span className={styles.savings}>−{formatPrice(promoDiscount)} ₽</span>
            </div>
          )}

          {/* Доставка — считается менеджером */}
          <div className={styles.totalRow}>
            <span>Доставка</span>
            <span className={styles.deliveryNote}>при оформлении</span>
          </div>
        </div>

        {/* Итоговая сумма с учётом промокода */}
        <div className={styles.totalFinal}>
          <span className={styles.totalFinalLabel}>Итого</span>
          <span className={styles.totalFinalPrice}>{formatPrice(finalPrice)} ₽</span>
        </div>
      </div>
    </section>
  );
}
