// src/app/catalog/product/[slug]/ProductGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ProductPage.module.css";

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";

type GalleryImage = {
  src: string;
  alt: string;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  startIndex?: number;
};

export default function ProductGallery({ images, startIndex = 0 }: ProductGalleryProps) {
  const safeImages = images.length > 0 ? images : [{ src: PLACEHOLDER_IMG, alt: "Изображение товара отсутствует" }];

  const [activeIndex, setActiveIndex] = useState(startIndex);

  const activeImage = safeImages[activeIndex] ?? safeImages[0];

  return (
    <div className={styles.productGallery}>
      <ul className={styles.productGalleryThumbs}>
        {safeImages.map((img, index) => (
          <li
            key={img.src}
            className={styles.productGalleryThumbItem}
            data-active={activeIndex === index ? "true" : "false"}>
            <button
              onClick={() => setActiveIndex(index)}
              aria-pressed={activeIndex === index}
              aria-label={`Показать фото ${index + 1}`}
              className={styles.productGalleryThumbButton}>
              <Image src={img.src} alt={img.alt} fill className={styles.productGalleryThumbImage} sizes="80px" />
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
