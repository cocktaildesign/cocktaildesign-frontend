import type { ReactNode } from "react";
import type { AboutPhoto as Photo } from "./about-content";
import styles from "./AboutPage.module.css";

export default function AboutPhoto({ photo, sizes, priority = false, className = "", children }: {
  photo: Photo;
  sizes: string;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <figure className={`${styles.figure} ${className}`} data-demo={photo.isDemo || undefined}>
      {/* Next image optimization is disabled in this project; pre-sized WebP srcsets keep mobile downloads small. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} srcSet={photo.srcSet} sizes={photo.srcSet ? sizes : undefined}
        width={photo.width} height={photo.height} alt={photo.alt}
        loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
      <figcaption>{children}{photo.caption}</figcaption>
    </figure>
  );
}
