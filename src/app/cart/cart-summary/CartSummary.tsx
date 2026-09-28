"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/cartStore";
import type { CartTotals } from "@/lib/cart/cartTotals";
import CartProgress from "./cart-progress/CartProgress";
import styles from "./CartSummary.module.css";
import type { useCartDiscountPolicy } from "@/lib/cart/useCartDiscountPolicy";
import { CART_API_BASE } from "@/lib/cart/discountPolicy";
import DiscountPolicyNotice from "./DiscountPolicyNotice";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

function formatProductsCount(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} товаров`;
  if (last === 1) return `${count} товар`;
  if (last >= 2 && last <= 4) return `${count} товара`;
  return `${count} товаров`;
}

export default function CartSummary({ totals, discountPolicy }: {
  totals: CartTotals;
  discountPolicy: ReturnType<typeof useCartDiscountPolicy>;
}) {
  const promoCode = useCartStore((s) => s.promoCode);
  const promoType = useCartStore((s) => s.promoType);
  const promoBonusMessage = useCartStore((s) => s.promoBonusMessage);
  const setPromo = useCartStore((s) => s.setPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);

  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [promoError, setPromoError] = useState("");

  const { totalPrice, totalQuantity, totalSavings, discountableTotal, currentTier, nextTier,
    promoApplied, activeVolumeDiscount, activePromoDiscount, finalPrice } = totals;

  // Когда пользователь меняет текст в поле промокода — сбрасываем всё
  function handlePromoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPromoStatus("idle");
    setPromoError("");
    clearPromo();
    // Сохраняем только введённый код — скидка пока 0
    setPromo({ code: e.target.value, discount: 0, type: "" });
  }

  async function handleApplyPromo() {
    if (!discountPolicy.ready) return;
    if (!promoCode.trim()) return;

    const basketAtRequest = JSON.stringify(useCartStore.getState().items);

    setPromoStatus("loading");
    setPromoError("");

    try {
      const response = await fetch(`${CART_API_BASE}/promo-code/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          totalPrice,
          discountableTotal,
        }),
      });

      const data = await response.json();

      if (JSON.stringify(useCartStore.getState().items) !== basketAtRequest) {
        setPromoStatus("idle");
        return;
      }

      if (data.ok) {
        setPromo({
          code: promoCode.trim(),
          discount: data.discountAmount,
          type: data.discountType,
          bonusMessage: data.bonusMessage ?? "",
          replacesVolumeDiscount: data.replacesVolumeDiscount ?? false,
        });
        setPromoStatus("success");
      } else {
        setPromoStatus("error");
        clearPromo();

        const errorMessages: Record<string, string> = {
          not_found: "Промокод не найден",
          not_active: "Промокод неактивен",
          limit_reached: "Промокод больше не действует",
          min_amount_not_reached: `Промокод действует от ${formatPrice(data.minAmount ?? 0)} ₽`,
        };

        setPromoError(errorMessages[data.error] ?? "Что-то пошло не так");
      }
    } catch {
      setPromoStatus("error");
      setPromoError("Ошибка соединения");
    }
  }

  if (!discountPolicy.ready) {
    return <section className={styles.summaryWrapper}><DiscountPolicyNotice {...discountPolicy} /></section>;
  }

  return (
    <section className={styles.summaryWrapper}>
      {/* Кнопка оформления */}
      <Link href="/checkout" className={styles.checkoutButton}>
        Оформить заказ
      </Link>

      {/* Основной блок */}
      <div className={styles.summary}>
        {/* Прогресс считаем от общей суммы корзины, а не от discountableTotal */}
        <CartProgress discountableTotal={totalPrice} currentTier={currentTier} nextTier={nextTier} />

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

          {/* Кнопка применить — показываем если промокод не применён */}
          {promoCode.length > 0 && !promoApplied && promoStatus !== "success" && (
            <button
              type="button"
              className={styles.promoButton}
              onClick={handleApplyPromo}
              disabled={promoStatus === "loading"}>
              {promoStatus === "loading" ? "Проверяем..." : "Применить"}
            </button>
          )}

          {promoStatus === "error" && <p className={styles.promoError}>{promoError}</p>}

          {/* Обычный промокод применён */}
          {promoApplied && promoType !== "inventory" && promoType !== "startup" && (
            <p className={styles.promoSuccess}>Промокод применён!</p>
          )}

          {/* Плашка для подарка (inventory) и стартапа (startup) */}
          {promoApplied && promoBonusMessage && (
            <div className={styles.promoBonusMessage}>
              {promoBonusMessage.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
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

          {activeVolumeDiscount > 0 && (
            <div className={styles.totalRow}>
              <span>Скидка за объём {currentTier?.percent}%</span>
              <span className={styles.savings}>−{formatPrice(activeVolumeDiscount)} ₽</span>
            </div>
          )}

          {activePromoDiscount > 0 && (
            <div className={styles.totalRow}>
              <span>{promoType === "startup" ? "Акция СТАРТАП −20%" : "Промокод"}</span>
              <span className={styles.savings}>−{formatPrice(activePromoDiscount)} ₽</span>
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
