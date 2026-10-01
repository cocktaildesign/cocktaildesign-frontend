//frontend/src/sections/home/05-banners/Banners.tsx
import Container from "@/components/layout/Container";

import BannerSlider from "@/components/ui/slider/banner-slider/BannerSlider";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";
import styles from "./Banners.module.css";


export default function Banners({ banners }: { banners: HomepageBanner[] }) {
  if (!banners.length) return null;
  return (
    <section className={styles.section}>
      <Container>
        {/* Баннер внутри контейнера */}
        <div className={styles.sliderWrapper}>
          <BannerSlider key={banners.map(b => b.id).join(",")} images={banners} />
        </div>
      </Container>
    </section>
  );
}
