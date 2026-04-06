"use client";

import Link from "next/link";

import CartPrint from "../cart-print/CartPrint";
import CartItem from "../cart-item/CartItem";
import CartSummary from "../cart-summary/CartSummary";

import PrinterIcon from "@/components/icons/cart/PrinterIcon";
import DownloadIcon from "@/components/icons/cart/DownloadIcon";

import { useCartStore } from "@/lib/cart/cartStore";
import { exportCartToXlsx } from "@/lib/cart/exportToXlsx";

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

  // Считаем итоги для блока печати и mobile sticky bar
  let totalQuantity = 0;
  let totalPrice = 0;

  for (const item of items) {
    totalQuantity += item.quantity;
    totalPrice += item.price * item.quantity;
  }

  return (
    <div className={styles.cartPage}>
      <section className={styles.cart}>
        {/* Левая колонка — список товаров */}
        <div className={styles.cartItems}>
          {/* Заголовок и действия */}
          <div className={styles.cartTitleRow}>
            <h1 className={styles.cartTitle}>Корзина</h1>

            <div className={styles.cartActions}>
              <button type="button" className={styles.cartActionButton} onClick={() => exportCartToXlsx(items)}>
                <DownloadIcon className={styles.cartIcon} color="#A1A1A1" width="15" height="15" />
                <span>Скачать</span>
              </button>

              <button
                type="button"
                className={styles.cartActionButton}
                onClick={() => window.print()}
                aria-label="Распечатать страницу">
                <PrinterIcon className={styles.cartIcon} color="#A1A1A1" width="20" height="20" aria-hidden="true" />
                <span>Распечатать</span>
              </button>
            </div>
          </div>

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
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Правая колонка — итог */}
        <div className={styles.cartSummary}>
          <CartSummary />
        </div>
      </section>

      {/* Sticky bar только для мобилки */}
      <div className={styles.mobileCheckoutBar}>
        <div className={styles.mobileCheckoutInfo}>
          <span className={styles.mobileCheckoutLabel}>Итого</span>
          <span className={styles.mobileCheckoutPrice}>{formatPrice(totalPrice)} ₽</span>
        </div>

        <Link href="/checkout" className={styles.mobileCheckoutButton}>
          Оформить заказ
        </Link>
      </div>

      {/* Блок только для печати */}
      <CartPrint items={items} totalPrice={totalPrice} totalQuantity={totalQuantity} />
    </div>
  );
}
