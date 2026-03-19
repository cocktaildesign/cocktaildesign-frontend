// src/app/catalog/product/[slug]/VariantSelector.tsx
//
// "use client" — управляет выбором варианта товара.
//
// Содержит внутри себя:
// - ProductGallery (колонки 1-6)
// - блок вариантов + "О товаре" + артикул (колонки 6-10)
// - ProductPurchaseControls в сайдбаре (колонки 10-13)
//
// Все три блока рендерятся через Fragment (<>) прямо в Grid родителя.
// CSS классы productGallery / productInfo / productSidebar
// уже содержат нужные grid-column — сетка не ломается.

"use client";

import { useState } from "react";
import type { CatalogProductDetail, CatalogProductSpecification, CatalogVariant } from "@/lib/api/catalog/types";
import ProductGallery from "./ProductGallery";
import ProductPurchaseControls from "./ProductPurchaseControls";
import ScrollToDescriptionButton from "./ScrollToDescriptionButton";
import CopyButton from "@/components/ui/copy-button/CopyButton";
import Link from "next/link";
import styles from "./ProductPage.module.css";

type VariantSelectorProps = {
  product: CatalogProductDetail;
  variants: CatalogVariant[];
  specifications: CatalogProductSpecification[];
};

export default function VariantSelector({ product, variants, specifications }: VariantSelectorProps) {
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  const activeVariant = variants.find((v) => v.id === activeVariantId) ?? null;

  // ─── Актуальные данные (вариант или товар) ─────────────────────────────
  const activePrice = activeVariant?.price && activeVariant.price > 0 ? activeVariant.price : product.price;

  const activePriceOld =
    activeVariant?.priceOld && activeVariant.priceOld > 0 ? activeVariant.priceOld : product.priceOld;

  const activeCode = activeVariant?.code ?? product.code;

  // ─── Общий массив фото: товар + все варианты ───────────────────────────
  const variantImages = variants.flatMap((v) => v.images);
  const allImages = [...product.images, ...variantImages];
  const activeImages = allImages.length > 0 ? allImages : product.images;

  // Индекс первого фото активного варианта в общем массиве
  const activeImageIndex = activeVariant?.images[0]
    ? allImages.findIndex((img) => img.src === activeVariant.images[0].src)
    : 0;

  // ─── Группируем варианты по характеристикам ───────────────────────────
  type CharacteristicOption = {
    value: string;
    variantIds: string[];
  };

  const characteristicMap = new Map<string, CharacteristicOption[]>();

  for (const variant of variants) {
    for (const ch of variant.characteristics) {
      const name = ch.name.trim();
      const value = ch.value.trim();

      if (!name || !value) continue;

      if (!characteristicMap.has(name)) {
        characteristicMap.set(name, []);
      }

      const options = characteristicMap.get(name)!;
      const existing = options.find((o) => o.value === value);

      if (existing) {
        if (!existing.variantIds.includes(variant.id)) {
          existing.variantIds.push(variant.id);
        }
      } else {
        options.push({ value, variantIds: [variant.id] });
      }
    }
  }

  const characteristicEntries = Array.from(characteristicMap.entries());

  // ─── Обработчик клика на тег ──────────────────────────────────────────
  function handleTagClick(variantIds: string[]) {
    const firstVariantId = variantIds[0];
    if (!firstVariantId) return;

    if (activeVariantId === firstVariantId) {
      setActiveVariantId(null);
      return;
    }

    setActiveVariantId(firstVariantId);
  }

  function isTagActive(variantIds: string[]): boolean {
    if (!activeVariantId) return false;
    return variantIds.includes(activeVariantId);
  }

  return (
    <>
      {/* ── ГАЛЕРЕЯ ───────────────────────────────────────────────────────
          key меняется при смене варианта → компонент пересоздаётся →
          startIndex применяется → галерея переключается на фото варианта */}
      <ProductGallery key={activeVariantId ?? "default"} images={activeImages} startIndex={activeImageIndex} />

      {/* ── КОЛОНКА ИНФОРМАЦИИ ────────────────────────────────────────── */}
      <div className={styles.productInfo}>
        {/* Артикул */}
        <div className={styles.productMetaSku}>
          <p className={styles.productMetaSkuTitle}>
            Артикул: <span>{activeCode ?? "—"}</span>
          </p>
          <CopyButton value={activeCode ?? ""} label="Артикул" />
        </div>

        {/* Варианты */}
        {variants.length > 0 && characteristicEntries.length > 0 && (
          <div className={styles.productVariants}>
            {characteristicEntries.map(([name, options]) => (
              <div key={name} className={styles.productVariant}>
                <span className={styles.productInfoTitle}>{name}</span>

                <ul className={styles.productVariantValues}>
                  {options.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => handleTagClick(option.variantIds)}
                        data-active={isTagActive(option.variantIds) ? "true" : "false"}
                        className={styles.productVariantValueButton}
                        aria-pressed={isTagActive(option.variantIds)}>
                        {option.value}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* О товаре — спецификации */}
        <div>
          <div className={styles.productAboutHeader}>
            <h2 className={styles.productInfoTitle}>О товаре</h2>
            <ScrollToDescriptionButton />
          </div>

          {specifications.map((spec) => (
            <div key={spec.id} className={styles.specRow}>
              <div className={styles.specLeft}>
                <span className={styles.specLabel}>{spec.label}</span>
              </div>

              <div className={styles.specValue}>
                {spec.href ? (
                  <Link href={spec.href} className={styles.specLink}>
                    {spec.value}
                  </Link>
                ) : (
                  spec.value
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── САЙДБАР ───────────────────────────────────────────────────── */}
      <div className={styles.productSidebar}>
        <div className={styles.productPurchase}>
          tsx
          <ProductPurchaseControls
            key={activeVariant ? activeVariant.id : product.id}
            productId={activeVariant ? activeVariant.id : product.id}
            engravingEnabled={product.engravingEnabled}
            price={activePrice}
            priceOld={activePriceOld}
            name={activeVariant ? activeVariant.name : product.name}
            slug={product.slug}
            imageUrl={activeImages[0]?.src ?? null}
          />
        </div>
      </div>
    </>
  );
}
