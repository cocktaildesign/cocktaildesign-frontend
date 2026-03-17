// src/app/cart/CartItem.tsx
"use client";

import Image from "next/image";
import styles from "./CartItem.module.css";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/cartStore";
import QuantityControl from "@/components/ui/quantity/QuantityControl";
import CloseIcon from "@/components/icons/CloseIcon";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";

// Импортируем тип CartItem из store.
// Переименовываем в CartItemType чтобы не конфликтовать
// с названием самого компонента CartItem
import type { CartItem as CartItemType } from "@/lib/cart/cartStore";

// Пропсы компонента — один товар из корзины
type CartItemProps = {
  item: CartItemType;
};

// Форматируем цену: 1200 -> "1 200"
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

export default function CartItem({ item }: CartItemProps) {
  // Берём нужные actions из store
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Берём action toggleSelected из store
  const toggleSelected = useCartStore((s) => s.toggleSelected);

  // Выбран ли этот товар — проверяем есть ли его id в массиве selectedIds
  const isSelected = useCartStore((s) => s.selectedIds.includes(item.id));

  return (
    <div className={styles.item}>
      {/* Чекбокс выбора товара */}
      <input
        className={styles.itemChekbox}
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelected(item.id)}
      />
      {/* Картинка товара */}
      <div className={styles.image}>
        <Image
          src={item.imageUrl ?? "/images/catalog/product-placeholder.webp"}
          alt={item.name}
          fill
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Информация о товаре */}
      <div className={styles.info}>
        <Link href={`/catalog/product/${item.slug}`} className={styles.name}>
          {item.name}
        </Link>

        {/* Пометка о гравировке */}
        {item.engraving && <p className={styles.engravingNote}>Вы выбрали гравировку</p>}
      </div>

      <div className={styles.blockPrice}>
        {/* Цена умножается на количество */}
        <p className={styles.price}>{formatPrice(item.price * item.quantity)} ₽</p>

        {/* Старая цена тоже умножается */}
        {item.priceOld > item.price && (
          <p className={styles.priceOld}>{formatPrice(item.priceOld * item.quantity)} ₽</p>
        )}
      </div>

      <div className={styles.itemControls}>
        {/* Избранное + удаление — в одну строку */}
        <div className={styles.itemActions}>
          <FavoriteButton productId={item.id} />
          <button type="button" className={styles.remove} onClick={() => removeItem(item.id)}>
            <CloseIcon />
          </button>
        </div>

        {/* Управление количеством */}
        <div className={styles.quantity}>
          <QuantityControl
            value={item.quantity}
            onChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
            className={styles.quantitySmall}
          />
        </div>
      </div>
    </div>
  );
}
