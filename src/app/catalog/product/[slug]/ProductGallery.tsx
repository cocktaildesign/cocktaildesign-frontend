// src/app/catalog/product/[slug]/ProductGallery.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductVideo } from "@/lib/catalog/product-videos";
import ProductVideoPlayer from "./ProductVideoPlayer";

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
  videos?: ProductVideo[];
};

export default function ProductGallery({ images, activeIndex, onImageChange, videos = [] }: ProductGalleryProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const safeImages = images.length > 0 ? images : [{ src: PLACEHOLDER_IMG, alt: "Изображение товара отсутствует" }];

  const safeActiveIndex = activeIndex >= 0 && activeIndex < safeImages.length ? activeIndex : 0;
  const activeImage = safeImages[safeActiveIndex];
  const activeVideo = videos.find(video => video.id === activeVideoId);

  const imageThumbnail = (image: GalleryImage, index: number) => (
    <li key={`${image.src}-${index}`} className={styles.productGalleryThumbItem}
      data-active={!activeVideo && safeActiveIndex === index ? "true" : "false"}>
      <button type="button" onClick={() => { setActiveVideoId(null); onImageChange(index); }}
        aria-pressed={!activeVideo && safeActiveIndex === index}
        aria-label={`Показать фото ${index + 1}`} className={styles.productGalleryThumbButton}>
        <Image src={image.src} alt={image.alt} fill className={styles.productGalleryThumbImage} sizes="80px" />
      </button>
    </li>
  );

  return (
    <div className={styles.productGallery}>
      <ul className={styles.productGalleryThumbs} aria-label="Фото и видео товара">
        {imageThumbnail(safeImages[0], 0)}
        {videos.map(video => <li key={video.id} className={styles.productGalleryThumbItem}
          data-active={activeVideo?.id === video.id ? "true" : "false"}>
          <button type="button" onClick={() => setActiveVideoId(video.id)}
            aria-pressed={activeVideo?.id === video.id}
            aria-label={`Смотреть ${video.label}, ${Math.round(video.duration)} с`}
            className={styles.productGalleryThumbButton}>
            <Image src={video.thumbnail} alt="" fill className={styles.productGalleryThumbImage} sizes="80px" />
            <span className={styles.productVideoPlay} aria-hidden="true">▶</span>
            <span className={styles.productVideoDuration} aria-hidden="true">{Math.round(video.duration)} с</span>
          </button>
        </li>)}
        {safeImages.slice(1).map((image, index) => imageThumbnail(image, index + 1))}
      </ul>

      <div className={styles.productGalleryMain}>
        {activeVideo ? <ProductVideoPlayer key={activeVideo.id} video={activeVideo} /> : <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          fetchPriority="high"
          className={styles.productGalleryMainImage}
          sizes="(max-width: 768px) 100vw, 50vw"
        />}
      </div>
    </div>
  );
}
