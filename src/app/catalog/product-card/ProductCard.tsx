"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

import QuantityControl from "@/components/ui/quantity/QuantityControl";
import EngravingToggle from "@/components/ui/engraving/EngravingToggle";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";

import { useCartStore } from "@/lib/cart/cartStore";
import type { CartItem } from "@/lib/cart/cartStore";

import type { CatalogProductPreview, CatalogVariant } from "@/lib/api/catalog/types";

import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: CatalogProductPreview;
  colorMap?: Record<string, string>;
};

const MAX_PREVIEW_IMAGES = 4;
const COLOR_GROUP_NAME = "Выбор цвета";

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

function normalizeColorKey(value: string): string {
  return value.trim().toLowerCase();
}

function resolveColorHex(label: string, colorMap: Record<string, string>): string | null {
  const normalized = normalizeColorKey(label);

  return colorMap[normalized] ?? null;
}

function getVariantLabel(variant: CatalogVariant): string {
  const firstCharacteristicValue = variant.characteristics[0]?.value?.trim();

  if (firstCharacteristicValue) {
    return firstCharacteristicValue;
  }

  return variant.name;
}

function getVariantGroupTitle(variants: CatalogVariant[]): string | null {
  const firstGroupName = variants[0]?.characteristics[0]?.name?.trim();

  if (!firstGroupName) {
    return null;
  }

  return firstGroupName;
}

function isColorGroup(groupTitle: string | null): boolean {
  return groupTitle === COLOR_GROUP_NAME;
}

function buildUniqueImages(product: CatalogProductPreview): string[] {
  const productImages = product.images ?? [];

  const variantImages = product.variants.flatMap((variant) => variant.images.map((image) => image.src));

  return Array.from(new Set([...productImages, ...variantImages]))
    .filter(Boolean)
    .slice(0, MAX_PREVIEW_IMAGES);
}

function getVariantImageIndex(variant: CatalogVariant | null, images: string[]): number {
  const variantImage = variant?.images[0]?.src;

  if (!variantImage) {
    return 0;
  }

  const variantImageIndex = images.findIndex((image) => image === variantImage);

  return variantImageIndex >= 0 ? variantImageIndex : 0;
}

function sumWidths(widths: number[], gap: number): number {
  if (widths.length === 0) {
    return 0;
  }

  return widths.reduce((total, width) => total + width, 0) + gap * (widths.length - 1);
}

export default function ProductCard({ product, colorMap = {} }: ProductCardProps) {
  const uniqueImages = useMemo(() => buildUniqueImages(product), [product]);
  const initialVariant = product.variants[0] ?? null;

  const [quantity, setQuantity] = useState<number>(1);
  const [engravingChecked, setEngravingChecked] = useState<boolean>(false);
  const [activeVariant, setActiveVariant] = useState<CatalogVariant | null>(initialVariant);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(() =>
    getVariantImageIndex(initialVariant, uniqueImages),
  );
  const [expandedVariants, setExpandedVariants] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(product.variants.length);

  const hasVariants = product.variants.length > 0;

  const variantGroupTitle = useMemo(() => getVariantGroupTitle(product.variants), [product.variants]);

  const isColorVariants = useMemo(() => isColorGroup(variantGroupTitle), [variantGroupTitle]);

  const activeItemId = activeVariant?.id ?? product.id;

  const cartItem = useCartStore((state) => state.items.find((item) => item.id === activeItemId));

  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const isInCart = useCartStore((state) => state.items.some((item) => item.id === activeItemId));

  const displayQuantity = cartItem?.quantity ?? quantity;
  const displayEngraving = cartItem?.engraving ?? engravingChecked;

  const productHref = `/catalog/product/${product.slug}`;

  const hasActiveVariantPrice =
    activeVariant !== null &&
    Number.isFinite(activeVariant.price) &&
    activeVariant.price > 0;

  const activePrice = hasActiveVariantPrice
    ? activeVariant.price
    : product.price;

  const activePriceOldCandidate = hasActiveVariantPrice
    ? activeVariant.priceOld
    : product.priceOld;

  const activePriceOld =
    Number.isFinite(activePriceOldCandidate) &&
    activePriceOldCandidate > activePrice
      ? activePriceOldCandidate
      : 0;

  const currentImageIndex = activeImageIndex >= 0 && activeImageIndex < uniqueImages.length ? activeImageIndex : 0;

  const imageSrc = uniqueImages[currentImageIndex] ?? product.imageUrl ?? "/images/catalog/product-placeholder.webp";

  const hasDiscount = activePriceOld > activePrice;
  const discountPercent = getDiscountPercent(activePrice, activePriceOld);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRootRef = useRef<HTMLDivElement | null>(null);
  const moreMeasureRef = useRef<HTMLButtonElement | null>(null);

  const safeVisibleCount = expandedVariants ? product.variants.length : visibleCount;

  const visibleVariants = expandedVariants ? product.variants : product.variants.slice(0, safeVisibleCount);

  const hiddenVariantsCount = Math.max(product.variants.length - safeVisibleCount, 0);

  useLayoutEffect(() => {
    if (!hasVariants) {
      return;
    }

    function updateVisibleCount() {
      if (expandedVariants) {
        setVisibleCount(product.variants.length);
        return;
      }

      const container = containerRef.current;
      const measureRoot = measureRootRef.current;

      if (!container || !measureRoot) {
        return;
      }

      const containerWidth = container.clientWidth;

      if (containerWidth <= 0) {
        return;
      }

      const containerStyles = window.getComputedStyle(container);
      const gapValue = containerStyles.columnGap || containerStyles.gap || "0";
      const gap = Number.parseFloat(gapValue) || 0;

      const itemWidths = product.variants.map((_, index) => {
        const node = measureRoot.querySelector<HTMLElement>(`[data-measure-variant="${index}"]`);

        return node?.offsetWidth ?? 0;
      });

      const allFitWidth = sumWidths(itemWidths, gap);

      if (allFitWidth <= containerWidth) {
        setVisibleCount(product.variants.length);
        return;
      }

      const moreWidth = moreMeasureRef.current?.offsetWidth ?? 0;

      let bestCount = 0;

      for (let count = 0; count <= product.variants.length; count += 1) {
        const visibleWidths = itemWidths.slice(0, count);
        const widthOfVisibleItems = sumWidths(visibleWidths, gap);

        const hiddenCount = product.variants.length - count;
        const needMoreButton = hiddenCount > 0;

        const widthOfMoreButton = needMoreButton ? moreWidth : 0;
        const gapBeforeMoreButton = needMoreButton && count > 0 ? gap : 0;

        const totalWidth = widthOfVisibleItems + gapBeforeMoreButton + widthOfMoreButton;

        if (totalWidth <= containerWidth) {
          bestCount = count;
        }
      }

      setVisibleCount(bestCount);
    }

    updateVisibleCount();

    const resizeObserver = new ResizeObserver(() => {
      updateVisibleCount();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateVisibleCount);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateVisibleCount);
    };
  }, [expandedVariants, hasVariants, product.variants]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (uniqueImages.length <= 1) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const fraction = mouseX / rect.width;

    const nextImageIndex = Math.min(Math.floor(fraction * uniqueImages.length), uniqueImages.length - 1);

    setActiveImageIndex(nextImageIndex);
  }

  function handleMouseLeave() {
    setActiveImageIndex(getVariantImageIndex(activeVariant, uniqueImages));
  }

  function handleVariantSelect(variant: CatalogVariant) {
    setActiveVariant(variant);
    setActiveImageIndex(getVariantImageIndex(variant, uniqueImages));
  }

  function handleExpandVariants() {
    setExpandedVariants(true);
  }

  function handleAddToCart() {
    const cartItemToAdd: CartItem = {
      id: activeItemId,
      name: activeVariant?.name ?? product.name,
      price: activePrice,
      priceOld: activePriceOld,
      imageUrl: imageSrc,
      slug: product.slug,
      quantity,
      engraving: engravingChecked,
      discountExcluded: product.discountExcluded,
      code: activeVariant?.code ?? product.code ?? "",
    };

    addItem(cartItemToAdd);
  }

  function renderVariantButton(
    variant: CatalogVariant,
    options?: {
      measure?: boolean;
      measureIndex?: number;
    },
  ) {
    const label = getVariantLabel(variant);
    const isActive = activeVariant?.id === variant.id;
    const isMeasure = options?.measure === true;
    const measureIndex = options?.measureIndex;

    if (isColorVariants) {
      const hex = resolveColorHex(label, colorMap);

      return (
        <button
          key={isMeasure ? `measure-${variant.id}` : variant.id}
          data-measure-variant={typeof measureIndex === "number" ? measureIndex : undefined}
          type="button"
          className={`${styles.colorOption} ${isActive && !isMeasure ? styles.colorOptionActive : ""}`}
          onClick={isMeasure ? undefined : () => handleVariantSelect(variant)}
          aria-label={`${variantGroupTitle}: ${label}`}
          title={label}
          tabIndex={isMeasure ? -1 : 0}>
          <span
            className={`${styles.colorCircle} ${!hex ? styles.colorCircleFallback : ""}`}
            style={hex ? { backgroundColor: hex } : undefined}
          />
        </button>
      );
    }

    return (
      <button
        key={isMeasure ? `measure-${variant.id}` : variant.id}
        data-measure-variant={typeof measureIndex === "number" ? measureIndex : undefined}
        type="button"
        className={`${styles.textOption} ${isActive && !isMeasure ? styles.textOptionActive : ""}`}
        onClick={isMeasure ? undefined : () => handleVariantSelect(variant)}
        tabIndex={isMeasure ? -1 : 0}>
        {label}
      </button>
    );
  }

  return (
    <article className={styles.card}>
      <Link href={productHref} className={styles.previewLink}>
        <div className={styles.thumb} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {discountPercent !== null && <span className={styles.discountBadge}>-{discountPercent}%</span>}

          <FavoriteButton productId={product.id} className={styles.favoriteButtonOverlay} />

          {uniqueImages.length > 1 && (
            <div className={styles.dots}>
              {uniqueImages.map((_, index) => (
                <span key={index} className={index === currentImageIndex ? styles.dotActive : styles.dot} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.productBody}>
          <div className={styles.priceBlock}>
            <p className={styles.price}>{formatPrice(activePrice)} ₽</p>

            {hasDiscount && <p className={styles.priceOld}>{formatPrice(activePriceOld)} ₽</p>}
          </div>

          <div className={styles.productName}>
            <h3 className={styles.title}>{product.name}</h3>
          </div>
        </div>
      </Link>

      <section className={styles.variantSection}>
        {hasVariants && variantGroupTitle ? (
          <div className={styles.variantGroup}>
            <span className={styles.variantGroupTitle}>{variantGroupTitle}</span>

            <div
              ref={containerRef}
              className={styles.variantGroupValues}
              style={{
                flexWrap: expandedVariants ? "wrap" : "nowrap",
                overflow: expandedVariants ? "visible" : "hidden",
              }}>
              {visibleVariants.map((variant) => renderVariantButton(variant))}

              {!expandedVariants && hiddenVariantsCount > 0 && (
                <button
                  type="button"
                  className={styles.moreOptionsButton}
                  onClick={handleExpandVariants}
                  aria-label={`Показать ещё ${hiddenVariantsCount} вариантов`}>
                  +{hiddenVariantsCount}
                </button>
              )}
            </div>

            {!expandedVariants && (
              <div ref={measureRootRef} aria-hidden="true" className={styles.variantMeasureRoot}>
                {product.variants.map((variant, index) =>
                  renderVariantButton(variant, {
                    measure: true,
                    measureIndex: index,
                  }),
                )}

                <button ref={moreMeasureRef} type="button" className={styles.moreOptionsButton} tabIndex={-1}>
                  +{product.variants.length}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.variantGroupEmpty} aria-hidden="true" />
        )}
      </section>

      <div className={styles.purchaseSection}>
        {product.engravingEnabled ? (
          <div className={styles.engravingRow}>
            <EngravingToggle
              checked={displayEngraving}
              onChange={(checked) => {
                if (isInCart) {
                  const updatedItems = useCartStore.getState().items.map((item) => {
                    if (item.id !== activeItemId) {
                      return item;
                    }

                    return {
                      ...item,
                      engraving: checked,
                    };
                  });

                  useCartStore.setState({
                    items: updatedItems,
                  });
                } else {
                  setEngravingChecked(checked);
                }
              }}
            />
          </div>
        ) : (
          <div className={styles.engravingRowEmpty} aria-hidden="true" />
        )}

        {isInCart ? (
          <div className={styles.actionsRow}>
            <QuantityControl
              min={0}
              value={displayQuantity}
              onChange={(next) => {
                if (next < 1) {
                  removeItem(activeItemId);
                  setQuantity(1);
                  return;
                }

                useCartStore.getState().updateQuantity(activeItemId, next);
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
