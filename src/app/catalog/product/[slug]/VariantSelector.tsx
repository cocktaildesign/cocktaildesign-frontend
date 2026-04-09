// src/app/catalog/product/[slug]/VariantSelector.tsx
"use client";

import { useState } from "react";
import type { CatalogProductDetail, CatalogProductSpecification, CatalogVariant } from "@/lib/api/catalog/types";
import ProductGallery from "./ProductGallery";
import ProductPurchaseControls from "./ProductPurchaseControls";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

import ScrollToDescriptionButton from "./ScrollToDescriptionButton";
import CopyButton from "@/components/ui/copy-button/CopyButton";
import Link from "next/link";
import styles from "./ProductPage.module.css";
import Image from "next/image";

// Название характеристики цвета в МойСклад
const COLOR_CHARACTERISTIC_NAME = "Выбор цвета";

type CharacteristicOption = {
  value: string;
  variantIds: string[];
};

type VariantSelectorProps = {
  product: CatalogProductDetail;
  variants: CatalogVariant[];
  specifications: CatalogProductSpecification[];
  colorMap: Record<string, string>;
};

export default function VariantSelector({ product, variants, specifications, colorMap }: VariantSelectorProps) {
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  // Находим активный вариант по id
  const activeVariant = variants.find((v) => v.id === activeVariantId) ?? null;

  // Цена: берём от варианта если есть, иначе от товара
  const activePrice = activeVariant?.price && activeVariant.price > 0 ? activeVariant.price : product.price;

  // Старая цена: берём от варианта если есть, иначе от товара
  const activePriceOld =
    activeVariant?.priceOld && activeVariant.priceOld > 0 ? activeVariant.priceOld : product.priceOld;

  // Артикул: берём от варианта если есть, иначе от товара
  const activeCode = activeVariant?.code ?? product.code;

  // Общий массив фото: сначала фото товара, потом фото всех вариантов
  const variantImages = variants.flatMap((v) => v.images);
  const allImages = [...product.images, ...variantImages];
  const activeImages = allImages.length > 0 ? allImages : product.images;

  // Индекс первого фото активного варианта в общем массиве
  const activeImageIndex = activeVariant?.images[0]
    ? allImages.findIndex((img) => img.src === activeVariant.images[0].src)
    : 0;

  // ─── Группируем варианты по характеристикам ───────────────────────────
  // Результат: Map { "Выбор цвета" → [{ value: "красный", variantIds: ["1"] }] }
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

  // ─── Клик на тег или кружок ───────────────────────────────────────────
  function handleTagClick(variantIds: string[]) {
    const firstVariantId = variantIds[0];
    if (!firstVariantId) return;

    // Повторный клик — снимаем выбор
    if (activeVariantId === firstVariantId) {
      setActiveVariantId(null);
      return;
    }

    setActiveVariantId(firstVariantId);
  }

  // Проверяем активен ли тег
  function isTagActive(variantIds: string[]): boolean {
    if (!activeVariantId) return false;
    return variantIds.includes(activeVariantId);
  }

  return (
    <>
      {/* Галерея — key пересоздаёт компонент при смене варианта */}
      <ProductGallery key={activeVariantId ?? "default"} images={activeImages} startIndex={activeImageIndex} />

      {/* Колонка информации */}
      <div className={styles.productInfo}>
        <h1 className={styles.productPageTitleMobile}>{product.name}</h1>
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
            {characteristicEntries.map(([name, options]) => {
              const isColor = name === COLOR_CHARACTERISTIC_NAME;

              // Название выбранного цвета для отображения рядом с заголовком
              const activeColorValue = activeVariant
                ? (activeVariant.characteristics.find((ch) => ch.name === COLOR_CHARACTERISTIC_NAME)?.value ?? "")
                : "";

              return (
                <div key={name} className={styles.productVariant}>
                  <span className={styles.productInfoTitle}>
                    {name}
                    {isColor && activeColorValue ? `: ${activeColorValue}` : ""}
                  </span>

                  <ul className={styles.productVariantValues}>
                    {options.map((option) => {
                      const active = isTagActive(option.variantIds);

                      // Для цвета — кружок
                      if (isColor) {
                        const hex = colorMap[option.value.toLowerCase()] ?? "#cccccc";

                        return (
                          <li key={option.value}>
                            <button
                              type="button"
                              onClick={() => handleTagClick(option.variantIds)}
                              data-active={active ? "true" : "false"}
                              className={styles.productVariantColorButton}
                              aria-pressed={active}
                              aria-label={option.value}
                              title={option.value}>
                              <span className={styles.productVariantColorCircle} style={{ backgroundColor: hex }} />
                            </button>
                          </li>
                        );
                      }

                      // Для остальных — текстовый тег
                      return (
                        <li key={option.value}>
                          <button
                            type="button"
                            onClick={() => handleTagClick(option.variantIds)}
                            data-active={active ? "true" : "false"}
                            className={styles.productVariantValueButton}
                            aria-pressed={active}
                            title={option.value}>
                            {option.value}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
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

        <Link href="/discounts" className={styles.buttonSale}>
          {/* Картинка */}
          <div className={styles.buttonSaleImageWrapper}>
            <Image
              src="/images/catalog/saleImage.webp"
              alt="Скидка"
              width={40}
              height={40}
              className={styles.buttonSaleImage}
            />
          </div>

          {/* Текст */}
          <div className={styles.buttonSaleText}>
            <span className={styles.buttonSaleTitle}>Как получить скидку</span>
            <span className={styles.buttonSaleSubtitle}>Нажмите, чтобы узнать условия</span>
          </div>

          {/* Стрелка */}
          <ArrowRightIcon className={styles.buttonSaleArrow} />
        </Link>
      </div>

      {/* Сайдбар с ценой и кнопками */}
      <div className={styles.productSidebar}>
        <div className={styles.productPurchase}>
          <ProductPurchaseControls
            key={activeVariant ? activeVariant.id : product.id}
            productId={activeVariant ? activeVariant.id : product.id}
            engravingEnabled={product.engravingEnabled}
            price={activePrice}
            priceOld={activePriceOld}
            name={activeVariant ? activeVariant.name : product.name}
            slug={product.slug}
            imageUrl={activeImages[0]?.src ?? null}
            code={activeCode}
            discountExcluded={product.discountExcluded}
          />
        </div>
      </div>
    </>
  );
}
