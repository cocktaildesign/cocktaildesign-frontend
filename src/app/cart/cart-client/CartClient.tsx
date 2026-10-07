"use client";

import Link from "next/link";
import { useState } from "react";

import CartPrint from "../cart-print/CartPrint";
import CartItem from "../cart-item/CartItem";
import EngravingFiles from "@/components/engraving-files/EngravingFiles";
import CartSummary from "../cart-summary/CartSummary";

import PrinterIcon from "@/components/icons/cart/PrinterIcon";
import DownloadIcon from "@/components/icons/cart/DownloadIcon";

import { cartLineKey, useCartStore } from "@/lib/cart/cartStore";
import { exportCartToXlsx } from "@/lib/cart/exportToXlsx";
import { calculateCartTotals } from "@/lib/cart/cartTotals";
import { useDiscountTiers } from "@/lib/cart/discountTiers";
import { useCartDiscountPolicy } from "@/lib/cart/useCartDiscountPolicy";
import { buildCartQuote, moneyCents, type CartQuote, type QuotePricing } from "@/lib/cart/cartQuote";

import styles from "./CartClient.module.css";

// 1200 -> "1 200"
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

export default function CartClient() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const selectedIds = useCartStore((s) => s.selectedIds);
  const selectAll = useCartStore((s) => s.selectAll);
  const clearSelected = useCartStore((s) => s.clearSelected);
  const removeSelected = useCartStore((s) => s.removeSelected);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const promoType = useCartStore((s) => s.promoType);
  const promoReplacesVolumeDiscount = useCartStore((s) => s.promoReplacesVolumeDiscount);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoBonusMessage = useCartStore((s) => s.promoBonusMessage);
  const [promoLoading, setPromoLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const { tiers, isLoading, error: tiersError } = useDiscountTiers();
  const policy = useCartDiscountPolicy();
  const discountPolicy = { ...policy, ready: policy.ready && !isLoading };
  const totals = calculateCartTotals(items, tiers, { promoDiscount, promoType, promoReplacesVolumeDiscount });
  const quotePricing: QuotePricing = { volumeDiscount: totals.activeVolumeDiscount,
    promoDiscount: totals.activePromoDiscount, promoType, promoCode, bonusMessage: promoBonusMessage };
  let quote: CartQuote | null = null;
  let quoteError = "";
  if (discountPolicy.ready && !tiersError && !promoLoading) {
    try {
      quote = buildCartQuote(items, quotePricing);
      if (quote.finalCents !== moneyCents(totals.finalPrice)) throw new Error("quote_total_mismatch");
    } catch {
      quote = null;
      quoteError = "Не удалось подготовить КП. Проверьте цены и количество товаров.";
    }
  }
  const quoteNotice = quoteError || (tiersError ? "Не удалось проверить скидки для КП. Обновите страницу и повторите." :
    discountPolicy.error ? "КП будет доступно после проверки скидок. Нажмите «Повторить» в блоке итога." :
    !quote ? "Проверяем скидки перед подготовкой КП…" : "");

  async function downloadQuote() {
    if (!quote || exporting) return;
    setExporting(true);
    setExportError("");
    try {
      await exportCartToXlsx(items, quotePricing);
    } catch {
      setExportError("Не удалось скачать КП. Повторите попытку.");
    } finally {
      setExporting(false);
    }
  }

  // Все ли товары выбраны
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  // Есть ли хоть один выбранный
  const hasSelected = selectedIds.length > 0;

  // Ждём пока Zustand загрузит данные из localStorage
  if (!hasHydrated) return null;

  // Пустая корзина
  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2 className={styles.emptyTitle}>Ваша корзина пока пуста</h2>

        <p className={styles.emptyText}>
          Акции, специальные предложения и обзоры самых интересных товаров на главной странице помогут вам определиться
          с выбором.
        </p>

        <div className={styles.emptyActions}>
          <Link href="/catalog" className={styles.primaryButton}>
            Перейти в каталог
          </Link>

          <Link href="/" className={styles.secondaryButton}>
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const { finalPrice } = totals;

  return (
    <div className={styles.cartPage}>
      <section className={styles.cart}>
        {/* Левая колонка — список товаров */}
        <div className={styles.cartItems}>
          {/* Заголовок и действия */}
          <div className={styles.cartTitleRow}>
            <h1 className={styles.cartTitle}>Корзина</h1>

            <div className={styles.cartActions}>
              <button type="button" className={styles.cartActionButton} onClick={downloadQuote} disabled={!quote || exporting}>
                <DownloadIcon className={styles.cartIcon} color="#A1A1A1" width="15" height="15" />
                <span>{exporting ? "Готовим КП…" : "Скачать"}</span>
              </button>

              <button
                type="button"
                className={styles.cartActionButton}
                onClick={() => window.print()}
                disabled={!quote || exporting}
                aria-label="Распечатать страницу">
                <PrinterIcon className={styles.cartIcon} color="#A1A1A1" width="20" height="20" aria-hidden="true" />
                <span>Распечатать</span>
              </button>
            </div>
          </div>
          {(quoteNotice || exportError) && <p className={styles.quoteNotice} role="status">{quoteNotice || exportError}</p>}

          {/* Выбор товаров */}
          <div className={styles.cartHeader}>
            <label className={styles.selectAllLabel}>
              <input
                type="checkbox"
                className={styles.itemCheckbox}
                checked={allSelected}
                onChange={() => (allSelected ? clearSelected() : selectAll())}
              />
              Выбрать все ({items.length})
            </label>

            {hasSelected && (
              <button type="button" className={styles.buttonDeleteAll} onClick={removeSelected}>
                Удалить выбранные ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Список товаров */}
          {items.map((item) => (
            <CartItem key={cartLineKey(item)} item={item} engravingEnabled={policy.engravingByCode[item.code.trim()] === true} />
          ))}
          {items.some(item => item.engraving) && <EngravingFiles />}
        </div>

        {/* Правая колонка — итог */}
        <div className={styles.cartSummary}>
          <CartSummary totals={totals} discountPolicy={discountPolicy} onPromoLoadingChange={setPromoLoading} />
        </div>
      </section>

      {/* Sticky bar только для мобилки */}
      <div className={styles.mobileCheckoutBar} role="region" aria-label="Итог заказа">
        <div className={styles.mobileCheckoutInfo}>
          <span className={styles.mobileCheckoutLabel}>
            {discountPolicy.ready ? (items.some(item => item.engraving) ? "Без стоимости гравировки" : "Итого") : discountPolicy.error ? "Нужна проверка скидок" : "Проверяем скидки…"}
          </span>
          <span className={styles.mobileCheckoutPrice} aria-live="polite" aria-atomic="true">
            {discountPolicy.ready ? `${formatPrice(finalPrice)} ₽` : "—"}
          </span>
        </div>

        {discountPolicy.ready ? (
          <Link href="/checkout" className={styles.mobileCheckoutButton}>Оформить заказ</Link>
        ) : discountPolicy.error ? (
          <button type="button" className={styles.mobileCheckoutButton} onClick={discountPolicy.retry}>Повторить</button>
        ) : (
          <button type="button" className={styles.mobileCheckoutButton} disabled>Оформить заказ</button>
        )}
      </div>

      {/* Блок только для печати */}
      <CartPrint quote={quote} notice={quoteNotice} />
    </div>
  );
}
