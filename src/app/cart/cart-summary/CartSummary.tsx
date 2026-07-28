"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/cartStore";
import { useDiscountTiers, getCurrentTier, getNextTier } from "@/lib/cart/discountTiers";
import CartProgress from "./cart-progress/CartProgress";
import styles from "./CartSummary.module.css";

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

export default function CartSummary() {
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const promoType = useCartStore((s) => s.promoType);
  const promoBonusMessage = useCartStore((s) => s.promoBonusMessage);
  const promoReplacesVolumeDiscount = useCartStore((s) => s.promoReplacesVolumeDiscount);
  const setPromo = useCartStore((s) => s.setPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);

  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [promoError, setPromoError] = useState("");

  const { tiers } = useDiscountTiers();

  // Считаем суммы
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

  // Порог скидки определяется по ОБЩЕЙ сумме корзины (totalPrice),
  // а сама скидка применяется только к товарам без discountExcluded (discountableTotal).
  // Так "лимитированные" товары помогают добраться до лучшего tier'а, но сами скидку не получают.
  const currentTier = getCurrentTier(tiers, totalPrice);
  const nextTier = getNextTier(tiers, totalPrice);
  const volumeDiscount = currentTier ? Math.round((discountableTotal * currentTier.percent) / 100) : 0;

  // Промокод применён если есть скидка или тип (берётся из store — сохраняется после перезагрузки)
  const promoApplied = promoDiscount > 0 || promoType === "inventory" || promoType === "startup";

  // Если промокод заменяет объёмную скидку — берём ту что выгоднее для клиента
  // Если не заменяет (fixed) — суммируем обе
  let activeVolumeDiscount = volumeDiscount;
  let activePromoDiscount = promoDiscount;

  if (promoReplacesVolumeDiscount && promoApplied) {
    if (volumeDiscount > promoDiscount) {
      // Объёмная скидка выгоднее — промокод не применяется
      activePromoDiscount = 0;
    } else {
      // Промокод выгоднее — объёмная скидка не применяется
      activeVolumeDiscount = 0;
    }
  }

  const finalPrice = totalPrice - activePromoDiscount - activeVolumeDiscount;

  // Когда пользователь меняет текст в поле промокода — сбрасываем всё
  function handlePromoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPromoStatus("idle");
    setPromoError("");
    clearPromo();
    // Сохраняем только введённый код — скидка пока 0
    setPromo({ code: e.target.value, discount: 0, type: "" });
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
          totalPrice,
          discountableTotal,
        }),
      });

      const data = await response.json();

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
