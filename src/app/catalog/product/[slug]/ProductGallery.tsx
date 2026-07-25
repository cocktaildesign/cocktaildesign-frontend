// src/app/catalog/product/[slug]/ProductGallery.tsx
"use client";

import Image from "next/image";

import styles from "./ProductPage.module.css";

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";

type GalleryImage = {
  src: string;
  alt: string;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  activeIndex: number;
  onImageChange: (index: number) => void;
};

export default function ProductGallery({ images, activeIndex, onImageChange }: ProductGalleryProps) {
  const safeImages = images.length > 0 ? images : [{ src: PLACEHOLDER_IMG, alt: "Изображение товара отсутствует" }];

  const safeActiveIndex = activeIndex >= 0 && activeIndex < safeImages.length ? activeIndex : 0;
  const activeImage = safeImages[safeActiveIndex];

  return (
    <div className={styles.productGallery}>
      <ul className={styles.productGalleryThumbs}>
        {safeImages.map((image, index) => (
          <li
            key={`${image.src}-${index}`}
            className={styles.productGalleryThumbItem}
            data-active={safeActiveIndex === index ? "true" : "false"}>
            <button
              type="button"
              onClick={() => onImageChange(index)}
              aria-pressed={safeActiveIndex === index}
              aria-label={`Показать фото ${index + 1}`}
              className={styles.productGalleryThumbButton}>
              <Image src={image.src} alt={image.alt} fill className={styles.productGalleryThumbImage} sizes="80px" />
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.productGalleryMain}>
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          className={styles.productGalleryMainImage}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
