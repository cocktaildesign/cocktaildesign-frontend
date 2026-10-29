import Link from "next/link";
import CopyButton from "@/components/ui/copy-button/CopyButton";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";
import { EMPTY_IMAGE } from "@/lib/images/empty-image";
import styles from "./StartupBannerContent.module.css";

// Unlike the transparent editorial product photo, this composition fills the banner.
export const STARTUP_ART_SIZES = "100vw";

export default function StartupBannerContent({ banner, mobile, priority }: {
  banner: HomepageBanner; mobile?: boolean; priority: boolean;
}) {
  const copy = banner.editorial!;
  const [offer, ...headingLines] = copy.heading.split("\n");
  // Only this explicit CMS note format enables copying; other notes remain plain text.
  const promoCode = /^Промокод ([A-Z0-9]+)$/.exec(copy.note)?.[1];

  return <div className={`${styles.banner} ${mobile ? styles.mobile : ""}`}>
    <picture className={styles.art}>
      <source media={mobile ? "(max-width: 600px)" : "not all and (max-width: 600px)"}
        srcSet={mobile ? banner.mobileSrcSet || banner.mobileUrl : banner.desktopSrcSet || banner.desktopUrl}
        sizes={STARTUP_ART_SIZES} />
      {/* The hidden desktop/mobile layout requests only the tiny placeholder. */}
      <img src={EMPTY_IMAGE} alt="" width={1932} height={814}
        loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />
    </picture>
    <div className={styles.copy}>
      <h2 className={styles.heading}>
        <span className={styles.offer}>{offer}</span>
        {headingLines.length > 0 && <span className={styles.title}>{headingLines.join("\n")}</span>}
      </h2>
      <p className={styles.description}>{copy.description}</p>
      {copy.note && <div className={styles.note}>
        {promoCode ? <>
          <span className={styles.promoLabel}>Введите промокод при оформлении</span>
          <div className={styles.codeRow}>
            <strong>{promoCode}</strong>
            <CopyButton value={promoCode} label="Промокод" className={styles.copyButton} />
          </div>
        </> : copy.note}
      </div>}
      {banner.href && <Link className={styles.cta} href={banner.href}>{copy.buttonLabel}</Link>}
    </div>
  </div>;
}
