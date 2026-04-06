"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/cartStore";
import { useDiscountTiers, getCurrentTier, getNextTier } from "@/lib/cart/discountTiers";
import CartProgress from "./cart-progress/CartProgress";
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

  const { tiers } = useDiscountTiers();

  let totalQuantity = 0;
  let totalPrice = 0;
  let totalSavings = 0;
  let discountableTotal = 0;

  for (const item of items) {
    totalQuantity += item.quantity;
    totalPrice += item.price * item.quantity;

    if (item.priceOld > item.price) {
      totalSavings += (item.priceOld - item.price) * item.quantity;
    }

    if (!item.discountExcluded) {
      discountableTotal += item.price * item.quantity;
    }
  }

  const currentTier = getCurrentTier(tiers, discountableTotal);
  const nextTier = getNextTier(tiers, discountableTotal);

  const volumeDiscount = currentTier ? Math.round((discountableTotal * currentTier.percent) / 100) : 0;

  const finalPrice = totalPrice - promoDiscount - volumeDiscount;

  function handlePromoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPromoCode(e.target.value);
    setPromoStatus("idle");
    setPromoDiscount(0);
    setPromoError("");
  }

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;

    setPromoStatus("loading");
    setPromoError("");

    try {
      const response = await fetch("https://api.cocktaildesign.ru/api/promo-code/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          totalPrice: discountableTotal,
        }),
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
      {/* Кнопка оформления */}
      <Link href="/checkout" className={styles.checkoutButton}>
        Оформить заказ
      </Link>

      {/* Основной блок */}
      <div className={styles.summary}>
        <CartProgress discountableTotal={discountableTotal} currentTier={currentTier} nextTier={nextTier} />

        {/* Доставка */}
        <div className={styles.totalRow}>
          <span>Довезем до ТК</span>
          <span className={styles.savings}>Бесплатно</span>
        </div>

        {/* Промокод */}
        <div className={styles.promoBlock}>
          <input
            type="text"
            className={styles.promoInput}
            placeholder="Промокод"
            value={promoCode}
            onChange={handlePromoChange}
          />

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

        {/* Итоги */}
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

          {volumeDiscount > 0 && (
            <div className={styles.totalRow}>
              <span>Скидка за объём {currentTier?.percent}%</span>
              <span className={styles.savings}>−{formatPrice(volumeDiscount)} ₽</span>
            </div>
          )}

          {promoDiscount > 0 && (
            <div className={styles.totalRow}>
              <span>Промокод</span>
              <span className={styles.savings}>−{formatPrice(promoDiscount)} ₽</span>
            </div>
          )}
        </div>

        {/* Финальная сумма */}
        <div className={styles.totalFinal}>
          <span className={styles.totalFinalLabel}>Итого:</span>
          <span className={styles.totalFinalPrice}>{formatPrice(finalPrice)} ₽</span>
        </div>
      </div>
    </section>
  );
}
