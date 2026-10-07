import Slider from "../Slider";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";
import styles from "./MobileSlider.module.css";
export default function MobileSlider({images}: {images: HomepageBanner[]}) {
  if (!images.length) return null;
  return <div className={styles.slider}><Slider images={images} mobile /></div>;
}
