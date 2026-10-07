import type { HomepageBanner } from "@/lib/api/homepage-banners/model";
import button from "../BannerButton.module.css";
import styles from "./PromoBannerContent.module.css";

export default function PromoBannerContent({banner}: {banner: HomepageBanner}) {
  const copy = banner.editorial!;
  return <div className={styles.banner}>
    <div className={styles.copy}>
      <h2>{copy.heading}</h2>
      <p>{copy.description}</p>
      {banner.href && <span className={button.button}>{copy.buttonLabel}</span>}
      {copy.note && <small>{copy.note}</small>}
    </div>
    <img src={banner.desktopUrl} srcSet={banner.desktopSrcSet} sizes="(max-width:600px) 72vw, (min-width:1440px) 460px, 35vw"
      alt="" width={1000} height={800} loading="lazy" decoding="async" className={styles.art} />
  </div>;
}
