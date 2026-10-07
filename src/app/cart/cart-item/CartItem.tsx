// src/app/cart/cart-item/CartItem.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { cartLineKey, cartProductHref, useCartStore } from "@/lib/cart/cartStore";
import QuantityControl from "@/components/ui/quantity/QuantityControl";
import CloseIcon from "@/components/icons/CloseIcon";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";
import styles from "./CartItem.module.css";
import { useId } from "react";
import EngravingToggle from "@/components/ui/engraving/EngravingToggle";

// Импортируем тип CartItem из store и переименовываем,
// чтобы не конфликтовал с названием компонента
import type { CartItem as CartItemType } from "@/lib/cart/cartStore";

type CartItemProps = {
  item: CartItemType;
  engravingEnabled: boolean;
};

// 1200 -> "1 200"
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

export default function CartItem({ item, engravingEnabled }: CartItemProps) {
  const lineKey = cartLineKey(item);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleSelected = useCartStore((s) => s.toggleSelected);
  const setEngraving = useCartStore((s) => s.setEngraving);
  const engravingNoteId = useId();

  // Проверяем есть ли id товара в списке выбранных
  const isSelected = useCartStore((s) => s.selectedIds.includes(lineKey));

  return (
    <div className={styles.item}>
      {/* Чекбокс выбора */}
      <input
        type="checkbox"
        className={styles.itemCheckbox}
        checked={isSelected}
        onChange={() => toggleSelected(lineKey)}
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
        <Link href={cartProductHref(item)} className={styles.name}>
          {item.name}
        </Link>
        {item.discountExcluded && (
          <span className={styles.discountExcludedBadge}>Без скидки за объём и процентных промокодов</span>
        )}
        <span className={styles.sku}>Артикул: {item.code}</span>
        {(engravingEnabled || item.engraving) && <div className={styles.engravingBlock}>
          <EngravingToggle checked={item.engraving} className={styles.engravingToggle}
            ariaLabel={`Гравировка: ${item.name}`} describedBy={engravingNoteId}
            onChange={checked => {
              // Removing a saved request is always possible, including while the API is unavailable.
              if (!checked || engravingEnabled) setEngraving(lineKey, checked);
            }} />
          <p id={engravingNoteId} className={styles.engravingNote}>Стоимость согласует менеджер. Не включена в итог.
            {item.engraving && item.quantity > 1 ? ` Выбрана для всех ${item.quantity} шт. этого товара.` : ""}
          </p>
        </div>}
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
          <FavoriteButton productId={item.productId} slug={item.slug} variantId={item.variantId} code={item.code} />
          <button type="button" className={styles.remove} onClick={() => removeItem(lineKey)}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.quantity}>
          <QuantityControl
            value={item.quantity}
            onChange={(newQuantity) => updateQuantity(lineKey, newQuantity)}
            className={styles.quantitySmall}
          />
        </div>
      </div>
    </div>
  );
}
