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
};

export default function ProductPurchaseControls({ productId, engravingEnabled }: ProductPurchaseControlsProps) {
  // На странице товара состояние всегда начинается с дефолтов:
  // - quantity = 1
  // - engraving = false
  const [quantity, setQuantity] = useState<number>(1);
  const [engravingChecked, setEngravingChecked] = useState<boolean>(false);

  function handleAddToCart() {
    console.log("addToCart", {
      productId,
      quantity,
      engravingChecked, // было engravingEnabled
    });
  }

  return (
    <div className={styles.productPurchaseControls}>
      <div className={styles.productInfoConfigurator}>
        <div className={styles.productActions}>
          <QuantityControl value={quantity} onChange={setQuantity} />
          {engravingEnabled ? <EngravingToggle checked={engravingChecked} onChange={setEngravingChecked} /> : null}{" "}
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
