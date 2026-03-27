import Image from "next/image";
import Link from "next/link";

import styles from "./MobileSlider.module.css";

type SlideImage = {
  id: number;
  desktopUrl: string;
  mobileUrl: string;
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
        {images.map((image) => {
          const content = (
            <Image
              src={image.mobileUrl}
              alt={image.alt}
              className={styles.image}
              width={480}
              height={600}
              sizes="42vw"
              priority={image.id === images[0]?.id}
            />
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
