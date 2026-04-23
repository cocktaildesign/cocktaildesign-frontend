//frontend/src/sections/home/05-banners/Banners.tsx
import Container from "@/components/layout/Container";

import BannerSlider from "@/components/ui/slider/banner-slider/BannerSlider";
import styles from "./Banners.module.css";

const BANNER_IMAGES = [
  {
    id: 1,
    desktopUrl: "/images/Hero/baner-slider/1-desktop.webp",
    mobileUrl: "/images/Hero/baner-slider/1-mobile.webp",
    alt: "Картинка для перехода в категорию «Все для бариста»",
    href: "/catalog/ms-c374b866",
  },
  {
    id: 2,
    desktopUrl: "/images/Hero/baner-slider/2-desktop.webp",
    mobileUrl: "/images/Hero/baner-slider/2-mobile.webp",
    alt: "Картинка для перехода в категорию «Джигеры и мерники»",
    href: "/catalog/ms-57a775a4",
  },
];

export default function Banners() {
  return (
    <section className={styles.section}>
      <Container>
        {/* Баннер внутри контейнера */}
        <div className={styles.sliderWrapper}>
          <BannerSlider images={BANNER_IMAGES} />
        </div>
      </Container>
    </section>
  );
}
