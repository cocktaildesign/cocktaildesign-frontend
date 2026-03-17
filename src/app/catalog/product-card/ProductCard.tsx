// frontend/src/app/catalog/product-card/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

import QuantityControl from "@/components/ui/quantity/QuantityControl";
import EngravingToggle from "@/components/ui/engraving/EngravingToggle";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";

import { useCartStore } from "@/lib/cart/cartStore";
import type { CartItem } from "@/lib/cart/cartStore";

import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: CatalogProductPreview;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

function getDiscountPercent(price: number, priceOld: number): number | null {
  if (price <= 0) return null;
  if (priceOld <= price) return null;

  const percent = Math.round(((priceOld - price) / priceOld) * 100);

  if (!Number.isFinite(percent) || percent <= 0) return null;

  return percent;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Количество товара — меняется после добавления в корзину
  const [quantity, setQuantity] = useState<number>(1);

  // Включена ли гравировка
  const [engravingChecked, setEngravingChecked] = useState<boolean>(false);

  // Индекс активной картинки для hover scrub
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Берём актуальное количество из store (если товар уже в корзине)
  const cartItem = useCartStore((s) => s.items.find((i) => i.id === product.id));

  // Если товар в корзине — используем quantity из store, иначе локальный стейт
  const displayQuantity = cartItem?.quantity ?? quantity;

  // Если товар в корзине — используем engraving из store, иначе локальный стейт
  const displayEngraving = cartItem?.engraving ?? engravingChecked;

  // Ссылка на детальную страницу товара
  const productHref = `/catalog/product/${product.slug}`;

  // Активная картинка — из массива или фолбэк
  const imageSrc = product.images[activeImageIndex] ?? product.imageUrl ?? "/images/catalog/product-placeholder.webp";

  // Есть ли скидка
  const hasDiscount = product.priceOld > product.price;

  // Процент скидки для бейджа
  const discountPercent = getDiscountPercent(product.price, product.priceOld);

  // Hover scrub — меняем картинку при движении мыши
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (product.images.length <= 1) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const fraction = mouseX / rect.width;
    const index = Math.min(Math.floor(fraction * product.images.length), product.images.length - 1);

    setActiveImageIndex(index);
  }

  // Мышь ушла — возвращаем первое фото
  function handleMouseLeave() {
    setActiveImageIndex(0);
  }

  // Добавление в корзину
  const addItem = useCartStore((s) => s.addItem);

  // Есть ли товар уже в корзине
  const isInCart = useCartStore((s) => s.items.some((item) => item.id === product.id));

  // удаляем товар
  const removeItem = useCartStore((s) => s.removeItem);

  function handleAddToCart() {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      priceOld: product.priceOld,
      imageUrl: product.imageUrl,
      slug: product.slug,
      quantity: quantity,
      engraving: engravingChecked,
    };

    addItem(cartItem);
  }

  return (
    <article className={styles.card}>
      {/* ================================================================
          КЛИКАБЕЛЬНАЯ ЗОНА: картинка + название + цена
          ================================================================ */}
      <Link href={productHref} className={styles.previewLink}>
        {/* Картинка с hover scrub */}
        <div className={styles.thumb} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Бейдж скидки */}
          {discountPercent !== null && <span className={styles.discountBadge}>-{discountPercent}%</span>}

          {/* Кнопка избранного поверх картинки */}
          <FavoriteButton productId={product.id} className={styles.favoriteButtonOverlay} />

          {/* Точки hover scrub — только если картинок больше одной */}
          {product.images.length > 1 && (
            <div className={styles.dots}>
              {product.images.map((_, index) => (
                <span key={index} className={index === activeImageIndex ? styles.dotActive : styles.dot} />
              ))}
            </div>
          )}
        </div>

        {/* Цена и название */}
        <div className={styles.productBody}>
          <div className={styles.priceBlock}>
            <p className={styles.price}>{formatPrice(product.price)} ₽</p>
            {hasDiscount && <p className={styles.priceOld}>{formatPrice(product.priceOld)} ₽</p>}
          </div>

          <div className={styles.productName}>
            <h3 className={styles.title}>{product.name}</h3>
          </div>
        </div>
      </Link>

      {/* ================================================================
          НЕКЛИКАБЕЛЬНАЯ ЗОНА: гравировка / корзина
          ================================================================ */}
      <div className={styles.purchaseSection}>
        {/* Гравировка — используем displayEngraving из store */}
        {product.engravingEnabled && (
          <div className={styles.engravingRow}>
            <EngravingToggle
              checked={displayEngraving}
              onChange={(checked) => {
                // Если товар в корзине — обновляем в store
                if (isInCart) {
                  const updatedItems = useCartStore.getState().items.map((i) => {
                    if (i.id !== product.id) return i;
                    return { ...i, engraving: checked };
                  });
                  useCartStore.setState({ items: updatedItems });
                } else {
                  // Ещё не в корзине — локальный стейт
                  setEngravingChecked(checked);
                }
              }}
            />
          </div>
        )}

        {/* После добавления: количество из store + стрелка */}
        {isInCart ? (
          <div className={styles.actionsRow}>
            <QuantityControl
              min={0}
              value={displayQuantity}
              onChange={(next) => {
                if (next < 1) {
                  removeItem(product.id);
                  setQuantity(1);
                  return;
                }
                // Обновляем quantity в store
                useCartStore.getState().updateQuantity(product.id, next);
              }}
            />
            <Link href="/cart" className={styles.arrowButton}>
              <ArrowRightIcon />
            </Link>
          </div>
        ) : (
          <button type="button" className={styles.addToCartButtonFull} onClick={handleAddToCart}>
            В корзину
          </button>
        )}
      </div>
    </article>
  );
}
