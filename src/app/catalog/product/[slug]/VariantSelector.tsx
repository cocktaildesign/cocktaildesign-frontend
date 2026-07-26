// src/app/catalog/product/[slug]/VariantSelector.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import CopyButton from "@/components/ui/copy-button/CopyButton";

import type { CatalogProductDetail, CatalogProductSpecification, CatalogVariant } from "@/lib/api/catalog/types";

import ProductComposition from "./ProductComposition";
import ProductGallery from "./ProductGallery";
import ProductPurchaseControls from "./ProductPurchaseControls";
import ScrollToDescriptionButton from "./ScrollToDescriptionButton";

import styles from "./ProductPage.module.css";

const COLOR_CHARACTERISTIC_NAME = "Выбор цвета";
const PRODUCT_SPECIFICATIONS_PREVIEW_LIMIT = 4;
const FEATURES_SPECIFICATION_LABEL = "Особенности";

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

function ProductSpecificationValue({ spec }: { spec: CatalogProductSpecification }) {
  if (spec.href) {
    return (
      <Link href={spec.href} className={styles.specLink}>
        {spec.value}
      </Link>
    );
  }

  return spec.value;
}

export default function VariantSelector({ product, variants, specifications, colorMap }: VariantSelectorProps) {
  const searchParams = useSearchParams();
  const requestedVariantId = searchParams.get("variant");

  /*
   * Собираем общую галерею.
   *
   * У фотографий родительского товара variantId равен null.
   * У фотографий модификатора сохраняем id этого модификатора.
   */
  const galleryImages = [
    ...product.images.map((image) => ({
      ...image,
      variantId: null,
    })),
    ...variants.flatMap((variant) =>
      variant.images.map((image) => ({
        ...image,
        variantId: variant.id,
      })),
    ),
  ];

  const firstVariantId = variants[0]?.id ?? null;

  /*
   * Если в URL передан существующий модификатор,
   * выбираем его. Иначе выбираем первый вариант.
   *
   * Пример:
   * /catalog/product/product-slug?variant=123
   */
  const initialVariantId =
    requestedVariantId && variants.some((variant) => variant.id === requestedVariantId)
      ? requestedVariantId
      : firstVariantId;

  const initialVariantImageIndex = initialVariantId
    ? galleryImages.findIndex((image) => image.variantId === initialVariantId)
    : 0;

  const [activeVariantId, setActiveVariantId] = useState<string | null>(initialVariantId);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(
    initialVariantImageIndex >= 0 ? initialVariantImageIndex : 0,
  );

  const activeVariant = variants.find((variant) => variant.id === activeVariantId) ?? null;

  const activePrice = activeVariant?.price && activeVariant.price > 0 ? activeVariant.price : product.price;

  const activePriceOld =
    activeVariant?.priceOld && activeVariant.priceOld > 0 ? activeVariant.priceOld : product.priceOld;

  const activeCode = activeVariant?.code ?? product.code;

  const previewSpecifications = specifications
    .filter((specification) => specification.label.trim() !== FEATURES_SPECIFICATION_LABEL)
    .slice(0, PRODUCT_SPECIFICATIONS_PREVIEW_LIMIT);

  const hasSpecifications = specifications.length > 0;

  /*
   * Группируем варианты по характеристикам.
   *
   * Пример:
   * "Выбор цвета" → красный, синий, чёрный.
   */
  const characteristicMap = new Map<string, CharacteristicOption[]>();

  for (const variant of variants) {
    for (const characteristic of variant.characteristics) {
      const name = characteristic.name.trim();
      const value = characteristic.value.trim();

      if (!name || !value) {
        continue;
      }

      if (!characteristicMap.has(name)) {
        characteristicMap.set(name, []);
      }

      const options = characteristicMap.get(name);

      if (!options) {
        continue;
      }

      const existingOption = options.find((option) => option.value === value);

      if (existingOption) {
        if (!existingOption.variantIds.includes(variant.id)) {
          existingOption.variantIds.push(variant.id);
        }

        continue;
      }

      options.push({
        value,
        variantIds: [variant.id],
      });
    }
  }

  const characteristicEntries = Array.from(characteristicMap.entries());

  function handleTagClick(variantIds: string[]) {
    const selectedVariantId = variantIds[0];

    if (!selectedVariantId) {
      return;
    }

    setActiveVariantId(selectedVariantId);

    const variantImageIndex = galleryImages.findIndex((image) => image.variantId === selectedVariantId);

    if (variantImageIndex >= 0) {
      setActiveImageIndex(variantImageIndex);
    }
  }

  function handleImageChange(index: number) {
    setActiveImageIndex(index);

    const selectedImage = galleryImages[index];
    const selectedVariantId = selectedImage?.variantId;

    /*
     * Если фотография принадлежит модификатору,
     * синхронизируем цену, артикул и выбранный тег.
     *
     * Если это общее фото товара, текущий вариант не сбрасываем.
     */
    if (selectedVariantId) {
      setActiveVariantId(selectedVariantId);
    }
  }

  function isTagActive(variantIds: string[]): boolean {
    if (!activeVariantId) {
      return false;
    }

    return variantIds.includes(activeVariantId);
  }

  function scrollToSpecifications() {
    const element = document.getElementById("product-specifications");

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const activeCartImage =
    galleryImages[activeImageIndex]?.src ?? activeVariant?.images[0]?.src ?? product.images[0]?.src ?? null;

  return (
    <>
      <ProductGallery images={galleryImages} activeIndex={activeImageIndex} onImageChange={handleImageChange} />

      <div className={styles.productInfo}>
        <h1 className={styles.productPageTitleMobile}>{product.name}</h1>

        <div className={styles.productMetaSku}>
          <p className={styles.productMetaSkuTitle}>
            Артикул: <span>{activeCode ?? "—"}</span>
          </p>

          <CopyButton value={activeCode ?? ""} label="Артикул" />
        </div>

        {variants.length > 0 && characteristicEntries.length > 0 && (
          <div className={styles.productVariants}>
            {characteristicEntries.map(([name, options]) => {
              const isColor = name === COLOR_CHARACTERISTIC_NAME;

              const activeColorValue = activeVariant
                ? (activeVariant.characteristics.find(
                    (characteristic) => characteristic.name === COLOR_CHARACTERISTIC_NAME,
                  )?.value ?? "")
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

                      if (isColor) {
                        const color = colorMap[option.value.toLowerCase()] ?? "#cccccc";

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
                              <span className={styles.productVariantColorCircle} style={{ backgroundColor: color }} />
                            </button>
                          </li>
                        );
                      }

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

        {hasSpecifications && (
          <div>
            <div className={styles.productAboutHeader}>
              <h2 className={styles.productInfoTitle}>О товаре</h2>

              <ScrollToDescriptionButton />
            </div>

            {previewSpecifications.map((specification) => (
              <div key={specification.id} className={styles.specRow}>
                <div className={styles.specLeft}>
                  <span className={styles.specLabel}>{specification.label}</span>
                </div>

                <div className={styles.specValue}>
                  <ProductSpecificationValue spec={specification} />
                </div>
              </div>
            ))}

            <button type="button" onClick={scrollToSpecifications} className={styles.allSpecificationsLink}>
              <span>Все характеристики</span>
              <ArrowRightIcon className={styles.allSpecificationsLinkIcon} />
            </button>
          </div>
        )}

        <ProductComposition items={product.composition} />

        <Link href="/discounts" className={styles.buttonSale}>
          <div className={styles.buttonSaleImageWrapper}>
            <Image
              src="/images/catalog/saleImage.webp"
              alt="Скидка"
              width={40}
              height={40}
              className={styles.buttonSaleImage}
            />
          </div>

          <div className={styles.buttonSaleText}>
            <span className={styles.buttonSaleTitle}>Как получить скидку</span>

            <span className={styles.buttonSaleSubtitle}>Нажмите, чтобы узнать условия</span>
          </div>

          <ArrowRightIcon className={styles.buttonSaleArrow} />
        </Link>
      </div>

      <div className={styles.productSidebar}>
        <div className={styles.productPurchase}>
          <ProductPurchaseControls
            key={activeVariant?.id ?? product.id}
            productId={activeVariant?.id ?? product.id}
            engravingEnabled={product.engravingEnabled}
            price={activePrice}
            priceOld={activePriceOld}
            name={activeVariant?.name ?? product.name}
            slug={product.slug}
            imageUrl={activeCartImage}
            code={activeCode}
            discountExcluded={product.discountExcluded}
          />
        </div>
      </div>
    </>
  );
}
