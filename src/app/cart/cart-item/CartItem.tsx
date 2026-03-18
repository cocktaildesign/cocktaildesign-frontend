// src/app/cart/cart-item/CartItem.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/cartStore";
import QuantityControl from "@/components/ui/quantity/QuantityControl";
import CloseIcon from "@/components/icons/CloseIcon";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";
import styles from "./CartItem.module.css";

// Импортируем тип CartItem из store и переименовываем,
// чтобы не конфликтовал с названием компонента
import type { CartItem as CartItemType } from "@/lib/cart/cartStore";

type CartItemProps = {
  item: CartItemType;
};

// 1200 -> "1 200"
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleSelected = useCartStore((s) => s.toggleSelected);

  // Проверяем есть ли id товара в списке выбранных
  const isSelected = useCartStore((s) => s.selectedIds.includes(item.id));

  return (
    <div className={styles.item}>
      {/* Чекбокс выбора */}
      <input
        type="checkbox"
        className={styles.itemCheckbox}
        checked={isSelected}
        onChange={() => toggleSelected(item.id)}
      />

      {/* Картинка */}
      <div className={styles.image}>
        <Image
          src={item.imageUrl ?? "/images/catalog/product-placeholder.webp"}
          alt={item.name}
          fill
          sizes="80px"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Название + гравировка */}
      <div className={styles.info}>
        <Link href={`/catalog/product/${item.slug}`} className={styles.name}>
          {item.name}
        </Link>
        {item.engraving && <p className={styles.engravingNote}>Вы выбрали гравировку</p>}
      </div>

      {/* Цена × количество */}
      <div className={styles.blockPrice}>
        <p className={styles.price}>{formatPrice(item.price * item.quantity)} ₽</p>
        {item.priceOld > item.price && (
          <p className={styles.priceOld}>{formatPrice(item.priceOld * item.quantity)} ₽</p>
        )}
      </div>

      {/* Избранное, удаление, количество */}
      <div className={styles.itemControls}>
        <div className={styles.itemActions}>
          <FavoriteButton productId={item.id} />
          <button type="button" className={styles.remove} onClick={() => removeItem(item.id)}>
            <CloseIcon />
          </button>
        </div>
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
