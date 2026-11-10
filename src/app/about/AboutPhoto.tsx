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
      <picture>
        {photo.mobile && <source media="(max-width: 760px)" srcSet={photo.mobile.srcSet || photo.mobile.src}
          sizes={sizes} width={photo.mobile.width} height={photo.mobile.height} />}
        {/* Pre-sized WebP srcsets keep downloads small. */}
        <img src={photo.src} srcSet={photo.srcSet} sizes={photo.srcSet ? sizes : undefined}
          width={photo.width} height={photo.height} alt={photo.alt}
          loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
      </picture>
      {(children || photo.caption) && <figcaption>{children}{photo.caption}</figcaption>}
    </figure>
  );
}
