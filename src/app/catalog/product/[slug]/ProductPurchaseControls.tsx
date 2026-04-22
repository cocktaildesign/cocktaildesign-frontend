// src/app/catalog/product/[slug]/ProductPurchaseControls.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import QuantityControl from "@/components/ui/quantity/QuantityControl";
import EngravingToggle from "@/components/ui/engraving/EngravingToggle";
import CartIcon from "@/components/icons/CartIcon";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
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
  code?: string | null;
  // Флаг — товар не участвует в скидках и промокодах
  discountExcluded: boolean;
};

// 1200 -> "1 200"
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

// Считаем разницу между старой и новой ценой
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
  code,
  discountExcluded,
}: ProductPurchaseControlsProps) {
  // Локальный стейт — используется пока товар НЕ в корзине
  const [quantity, setQuantity] = useState<number>(1);
  const [engravingChecked, setEngravingChecked] = useState<boolean>(false);

  // Берём товар из корзины (если он там есть)
  const cartItem = useCartStore((s) => s.items.find((i) => i.id === productId));

  // Actions из store
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  // Товар уже в корзине?
  const isInCart = Boolean(cartItem);

  // Если в корзине — показываем значения из store, иначе — локальные
  const displayQuantity = cartItem?.quantity ?? quantity;
  const displayEngraving = cartItem?.engraving ?? engravingChecked;

  const hasDiscount = priceOld > price;
  const savingsAmount = getSavingsAmount(price, priceOld);

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
      discountExcluded: discountExcluded,
      code: code ?? "",
    };

    addItem(item);
  }

  // Меняем количество. Вызывается из QuantityControl — и на десктопе, и на мобилке
  function handleQuantityChange(next: number) {
    // Ноль или меньше — удаляем товар из корзины
    if (next < 1) {
      removeItem(productId);
      setQuantity(1);
      return;
    }

    // Товар в корзине — обновляем количество в store
    if (isInCart) {
      updateQuantity(productId, next);
      return;
    }

    // Товар не в корзине — меняем локальный стейт
    setQuantity(next);
  }

  // Меняем гравировку. Если товар в корзине — обновляем store, иначе — локальный стейт
  function handleEngravingChange(checked: boolean) {
    if (isInCart) {
      const updatedItems = useCartStore.getState().items.map((i) => {
        if (i.id !== productId) return i;
        return { ...i, engraving: checked };
      });
      useCartStore.setState({ items: updatedItems });
      return;
    }

    setEngravingChecked(checked);
  }

  return (
    <>
      {/* ==========================================================
          Десктопный блок — скрыт на мобилке
          ========================================================== */}
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
            <QuantityControl min={0} value={displayQuantity} onChange={handleQuantityChange} />

            {engravingEnabled ? <EngravingToggle checked={displayEngraving} onChange={handleEngravingChange} /> : null}
          </div>
        </div>

        {/* Кнопка корзины + избранное */}
        <div className={styles.productActions}>
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
      </div>

      {/* ==========================================================
          Блок доставки — видно всегда (и на десктопе, и на мобилке)
          ========================================================== */}
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

      {/* ==========================================================
          Sticky bar — только для мобилки
          ========================================================== */}
      <div className={styles.mobileStickyBar}>
        {/* Цена слева */}
        <div className={styles.mobileStickyPriceBlock}>
          {hasDiscount && <span className={styles.mobileStickyPriceOld}>{formatPrice(priceOld)} ₽</span>}
          <span className={styles.mobileStickyPrice}>{formatPrice(price)} ₽</span>
        </div>

        {/* Действия справа */}
        <div className={styles.mobileStickyActions}>
          <div className={styles.mobileStickyFavorite}>
            <FavoriteButton productId={productId} />
          </div>

          {isInCart ? (
            <>
              <QuantityControl min={0} value={displayQuantity} onChange={handleQuantityChange} />

              <Link href="/cart" className={styles.mobileStickyArrowButton} aria-label="Перейти в корзину">
                <ArrowRightIcon />
              </Link>
            </>
          ) : (
            <button type="button" className={styles.mobileStickyAddButton} onClick={handleAddToCart}>
              <CartIcon />
              <span>В корзину</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
