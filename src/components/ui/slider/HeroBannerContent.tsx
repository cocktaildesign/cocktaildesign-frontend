import type { HomepageBanner } from "@/lib/api/homepage-banners/model";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";
import button from "./BannerButton.module.css";
import styles from "./HeroBannerContent.module.css";

export const HERO_ART_SIZES = "(min-width: 1440px) 600px, 46vw";

export default function HeroBannerContent({ banner, mobile, priority }: {
  banner: HomepageBanner; mobile?: boolean; priority: boolean;
}) {
  const copy = banner.editorial!;
  return <div className={`${styles.banner} ${mobile ? styles.mobile : ""}`}>
    <div className={styles.copy}>
      <h2 className={styles.heading}>{copy.heading}</h2>
      <p className={styles.description}>{copy.description}</p>
      <div className={styles.action}>{banner.href && <span className={button.button}>{copy.buttonLabel}</span>}</div>
      <p className={styles.note}>{copy.note}</p>
    </div>
    <picture className={styles.art}>
      <source media={mobile ? "(max-width: 600px)" : "not all and (max-width: 600px)"}
        srcSet={mobile ? banner.mobileSrcSet || banner.mobileUrl : banner.desktopSrcSet || banner.desktopUrl}
        sizes={mobile ? "86vw" : HERO_ART_SIZES} />
      {/* One responsive product photograph; the hidden desktop/mobile layout downloads only a tiny placeholder. */}
      <img src={EMPTY_IMAGE} alt="" width={1000} height={800}
        loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />
    </picture>
  </div>;
}
