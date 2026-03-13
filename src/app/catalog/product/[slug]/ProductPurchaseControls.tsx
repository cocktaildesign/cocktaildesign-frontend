// src/app/catalog/product/[slug]/ProductPurchaseControls.tsx
"use client";

import { useState } from "react";

import QuantityControl from "@/components/ui/quantity/QuantityControl";
import EngravingToggle from "@/components/ui/engraving/EngravingToggle";
import CartIcon from "@/components/icons/CartIcon";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";
import DeliveryIcon from "@/components/icons/product-page/DeliveryIcon";

import styles from "./ProductPage.module.css";

type ProductPurchaseControlsProps = {
  productId: string;
  engravingEnabled: boolean;
  price: number;
  priceOld: number;
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
}: ProductPurchaseControlsProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [engravingChecked, setEngravingChecked] = useState<boolean>(false);

  const hasDiscount = priceOld > price;
  const savingsAmount = getSavingsAmount(price, priceOld);

  function handleAddToCart() {
    console.log("addToCart", {
      productId,
      quantity,
      engravingChecked,
    });
  }

  return (
    <div className={styles.productPurchaseControls}>
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

      <div className={styles.productInfoConfigurator}>
        <div className={styles.productActions}>
          <QuantityControl value={quantity} onChange={setQuantity} />

          {engravingEnabled ? <EngravingToggle checked={engravingChecked} onChange={setEngravingChecked} /> : null}
        </div>
      </div>

      <div className={styles.productActions}>
        <button type="button" className={styles.addToCartButton} onClick={handleAddToCart}>
          <CartIcon />
          <span>В корзину</span>
        </button>

        <div className={styles.favoriteButton}>
          <FavoriteButton productId={productId} />
        </div>
      </div>

      <button type="button" className={styles.quickOrderButton}>
        <span>Быстрый заказ</span>
      </button>

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
