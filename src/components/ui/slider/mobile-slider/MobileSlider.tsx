import Image from "next/image";
import Link from "next/link";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";


import styles from "./MobileSlider.module.css";

type SlideImage = {
  id: number;
  desktopUrl: string;
  mobileUrl: string;
  mobileSrcSet?: string;
  alt: string;
  href?: string;
};

type MobileSliderProps = {
  images: SlideImage[];
};

export default function MobileSlider({ images }: MobileSliderProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className={styles.slider} aria-label="Мобильные баннеры">
      <div className={styles.track}>
        {images.map((image, index) => {
          // Only the first banner needs priority; the next one peeks into view.
          const isLcpSlide = index === 0;
          const content = (
            <picture>
              <source media="(max-width: 600px)" srcSet={image.mobileSrcSet ?? image.mobileUrl} sizes="86vw" />
            <Image
              src={EMPTY_IMAGE}
              alt={image.alt}
              className={styles.image}
              width={480}
              height={600}
              sizes="(max-width: 600px) 86vw, 0px"
              fetchPriority={isLcpSlide ? "high" : "auto"}
              loading={isLcpSlide ? "eager" : "lazy"}
            />
            </picture>
          );

          return image.href ? (
            <Link key={image.id} href={image.href} className={styles.slide} aria-label={image.alt}>
              {content}
            </Link>
          ) : (
            <div key={image.id} className={styles.slide}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
