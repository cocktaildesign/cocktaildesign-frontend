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
        {images.map((image, index) => {
          // Two 42%-wide banners are visible on the initial mobile screen.
          const isLcpSlide = index < 2;
          const content = (
            <Image
              src={image.mobileUrl}
              alt={image.alt}
              className={styles.image}
              width={480}
              height={600}
              sizes="(max-width: 600px) 42vw, 0px"
              fetchPriority={isLcpSlide ? "high" : "auto"}
              loading={isLcpSlide ? "eager" : "lazy"}
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
