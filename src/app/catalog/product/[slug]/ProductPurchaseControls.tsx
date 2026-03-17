// src/app/catalog/product/[slug]/ProductPurchaseControls.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import QuantityControl from "@/components/ui/quantity/QuantityControl";
import EngravingToggle from "@/components/ui/engraving/EngravingToggle";
import CartIcon from "@/components/icons/CartIcon";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";
import DeliveryIcon from "@/components/icons/product-page/DeliveryIcon";
import { useCartStore } from "@/lib/cart/cartStore";
import type { CartItem } from "@/lib/cart/cartStore";

import styles from "./ProductPage.module.css";

type ProductPurchaseControlsProps = {
  productId: string;
  engravingEnabled: boolean;
  price: number;
  priceOld: number;
  name: string;
  slug: string;
  imageUrl: string | null;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

function getSavingsAmount(price: number, priceOld: number): number | null {
  if (price <= 0) return null;
  if (priceOld <= price) return null;

  const savings = priceOld - price;

  if (!Number.isFinite(savings) || savings <= 0) return null;

  return savings;
}

export default function ProductPurchaseControls({
  productId,
  engravingEnabled,
  price,
  priceOld,
  name,
  slug,
  imageUrl,
}: ProductPurchaseControlsProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [engravingChecked, setEngravingChecked] = useState<boolean>(false);

  // Берём товар из store если он уже в корзине
  const cartItem = useCartStore((s) => s.items.find((i) => i.id === productId));

  // Есть ли товар в корзине
  const isInCart = Boolean(cartItem);

  // Если товар в корзине — берём значения из store, иначе локальный стейт
  const displayQuantity = cartItem?.quantity ?? quantity;
  const displayEngraving = cartItem?.engraving ?? engravingChecked;

  const hasDiscount = priceOld > price;
  const savingsAmount = getSavingsAmount(price, priceOld);

  // Берём actions из store
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);

  function handleAddToCart() {
    const item: CartItem = {
      id: productId,
      name: name,
      price: price,
      imageUrl: imageUrl,
      priceOld: priceOld,
      slug: slug,
      quantity: quantity,
      engraving: engravingChecked,
    };

    addItem(item);
  }

  return (
    <div className={styles.productPurchaseControls}>
      {/* Цена */}
      <div className={styles.productPurchasePriceBlock}>
        {hasDiscount && (
          <div className={styles.productPurchasePriceTopRow}>
            <span className={styles.productPurchasePriceOld}>{formatPrice(priceOld)} ₽</span>

            {savingsAmount !== null && (
              <span className={styles.productPurchaseBenefitBadge}>Выгода {formatPrice(savingsAmount)} ₽</span>
            )}
          </div>
        )}

        <div className={styles.productPurchasePrice}>{formatPrice(price)} ₽</div>
      </div>

      {/* Количество и гравировка */}
      <div className={styles.productInfoConfigurator}>
        <div className={styles.productActions}>
          {/* Количество из store если в корзине, иначе локальный стейт */}
          <QuantityControl
            min={0}
            value={displayQuantity}
            onChange={(next) => {
              if (next < 1) {
                removeItem(productId);
                setQuantity(1);
                return;
              }
              if (isInCart) {
                useCartStore.getState().updateQuantity(productId, next);
              } else {
                setQuantity(next);
              }
            }}
          />

          {/* Гравировка из store если в корзине, иначе локальный стейт */}
          {engravingEnabled ? (
            <EngravingToggle
              checked={displayEngraving}
              onChange={(checked) => {
                if (isInCart) {
                  const updatedItems = useCartStore.getState().items.map((i) => {
                    if (i.id !== productId) return i;
                    return { ...i, engraving: checked };
                  });
                  useCartStore.setState({ items: updatedItems });
                } else {
                  setEngravingChecked(checked);
                }
              }}
            />
          ) : null}
        </div>
      </div>

      {/* Кнопка корзины + избранное */}
      <div className={styles.productActions}>
        {/* Если в корзине — ссылка на корзину, иначе — кнопка добавления */}
        {isInCart ? (
          <Link href="/cart" className={styles.goToCartButton}>
            <CartIcon />
            <span>В корзине</span>
          </Link>
        ) : (
          <button type="button" className={styles.addToCartButton} onClick={handleAddToCart}>
            <CartIcon />
            <span>В корзину</span>
          </button>
        )}

        <div className={styles.favoriteButton}>
          <FavoriteButton productId={productId} />
        </div>
      </div>

      {/* Быстрый заказ */}
      <button type="button" className={styles.quickOrderButton}>
        <span>Быстрый заказ</span>
      </button>

      {/* Доставка */}
      <div className={styles.deliveryBlock}>
        <h3 className={styles.deliveryTitle}>Доставка</h3>

        <div className={styles.deliveryItem}>
          <div className={styles.deliveryIcon}>
            <DeliveryIcon color="black" width="32" height="32" />
          </div>

          <p className={styles.deliveryText}>
            Доставим <span className={styles.deliveryHighlight}>завтра</span> в пункт выдачи курьером
          </p>
        </div>
      </div>
    </div>
  );
}
