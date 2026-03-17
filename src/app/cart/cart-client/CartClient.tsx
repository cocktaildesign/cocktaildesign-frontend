// src/app/cart/cart-client/CartClient.tsx
"use client";

import Link from "next/link";
import CartPrint from "../cart-print/CartPrint";
import CartItem from "../cart-item/CartItem";
import CartSummary from "../cart-summary/CartSummary";
import PrinterIcon from "@/components/icons/cart/PrinterIcon";
import ExcelIcon from "@/components/icons/cart/ExcelIcon";
import { useCartStore } from "@/lib/cart/cartStore";
import styles from "./CartClient.module.css";
import { exportCartToXlsx } from "@/lib/cart/exportToXlsx";

export default function CartClient() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const selectedIds = useCartStore((s) => s.selectedIds);
  const selectAll = useCartStore((s) => s.selectAll);
  const clearSelected = useCartStore((s) => s.clearSelected);
  const removeSelected = useCartStore((s) => s.removeSelected);

  // Все ли товары выбраны?
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  // Есть ли хоть один выбранный?
  const hasSelected = selectedIds.length > 0;

  // Пока localStorage не загрузился — ничего не показываем
  // Иначе будет hydration mismatch
  if (!hasHydrated) {
    return null;
  }

  // Корзина пустая
  // Корзина пустая
  if (items.length === 0) {
    return (
      <>
        <div className={styles.emptyCart}>
          <h2 className={styles.emptyTitle}>Ваша корзина пока пуста</h2>

          <p className={styles.emptyText}>
            Акции, специальные предложения и обзоры самых интересных товаров на главной странице помогут вам
            определиться с выбором.
          </p>
        </div>
        <div className={styles.emptyActions}>
          <Link href="/catalog" className={styles.primaryButton}>
            Перейти в каталог
          </Link>

          <Link href="/" className={styles.secondaryButton}>
            На главную
          </Link>
        </div>
      </>
    );
  }
  // Считаем итоги для печати
  let totalQuantity = 0;
  let totalPrice = 0;
  for (const item of items) {
    totalQuantity = totalQuantity + item.quantity;
    totalPrice = totalPrice + item.price * item.quantity;
  }

  return (
    <div>
      <section className={styles.cart}>
        {/* Левая колонка — список товаров */}
        <div className={styles.cartItems}>
          <div className={styles.cartTitleRow}>
            <h1 className={styles.cartTitle}>Корзина</h1>
            <div className={styles.cartActions}>
              <button type="button" className={styles.cartActionButton} onClick={() => exportCartToXlsx(items)}>
                <ExcelIcon className={styles.cartIcon} color="#A1A1A1" width="20" height="20" />
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

          {/* Шапка списка — чекбокс "Выбрать все" + кнопка удаления выбранных */}
          <div className={styles.cartHeader}>
            {/* Чекбокс "Выбрать все" */}
            <label className={styles.selectAllLabel}>
              <input
                className={styles.itemCheckbox}
                type="checkbox"
                checked={allSelected}
                onChange={() => {
                  if (allSelected) {
                    clearSelected();
                  } else {
                    selectAll();
                  }
                }}
              />
              Выбрать все ({items.length})
            </label>

            {/* Кнопка удаления — показываем только если есть выбранные */}
            {hasSelected && (
              <button className={styles.buttonDeleteAll} type="button" onClick={removeSelected}>
                Удалить выбранные ({selectedIds.length})
              </button>
            )}
          </div>

          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Правая колонка — итог, промокод, кнопка */}
        <div className={styles.cartSummary}>
          <CartSummary />
        </div>
      </section>

      {/* Блок для печати — СНАРУЖИ .cart, скрыт в обычном режиме */}
      <CartPrint items={items} totalPrice={totalPrice} totalQuantity={totalQuantity} />
    </div>
  );
}
