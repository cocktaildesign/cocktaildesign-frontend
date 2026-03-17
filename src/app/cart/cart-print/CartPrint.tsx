// src/app/cart/CartPrint.tsx
// Этот компонент виден ТОЛЬКО при печати (display: none в обычном режиме)

import styles from "./CartPrint.module.css";
import type { CartItem } from "@/lib/cart/cartStore";
import Logo from "@//components/ui/logo/Logo";

type CartPrintProps = {
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

export default function CartPrint({ items, totalPrice, totalQuantity }: CartPrintProps) {
  return (
    <div className={styles.printOnly}>
      {/* Шапка — логотип + контакты */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <div className={styles.contacts}>
          <p>8 (995) 622-62-02</p>
          <p>cocktaildesign@yandex.ru</p>
        </div>
      </div>

      <h1 className={styles.title}>Корзина</h1>

      {/* Таблица товаров */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Наименование</th>
            <th>Цена</th>
            <th>Кол-во</th>
            <th>Стоимость</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.name}
                {/* Пометка о гравировке */}
                {item.engraving && <span className={styles.engraving}>+ Гравировка</span>}
              </td>
              <td>{formatPrice(item.price)} ₽</td>
              <td>{item.quantity}</td>
              <td>{formatPrice(item.price * item.quantity)} ₽</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Итог */}
      <div className={styles.totals}>
        <p>
          Общее кол-во товаров: <strong>{totalQuantity} шт.</strong>
        </p>
        <p>
          Общая стоимость: <strong>{formatPrice(totalPrice)} ₽</strong>
        </p>
      </div>

      {/* Футер */}
      <div className={styles.footer}>
        <p>
          Цены действительны на момент печати. Актуальные цены и сроки акций всегда можно узнать на нашем сайте или по
          телефону
        </p>
      </div>
    </div>
  );
}
