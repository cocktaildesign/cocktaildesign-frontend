import Container from "@/components/layout/Container";
import Slider from "@/components/ui/slider/Slider";
import styles from "./Banners.module.css";

const BANNER_IMAGES = [
  {
    id: 1,
    desktopUrl: "/images/Hero/baner-slider/1.webp",
    mobileUrl: "/images/Hero/baner-slider/1.webp",
    alt: "Картинка для перехода в категорияю все для бариста",
    href: "/catalog/ms-c374b866",
  },
];

export default function Banners() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.sliderWrapper}>
          <Slider images={BANNER_IMAGES} autoPlayInterval={7000} />
        </div>
      </Container>
    </section>
  );
}
