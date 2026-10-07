import { HERO_ART_SIZES } from "@/components/ui/slider/HeroBannerContent";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";

// React hoists these to <head>. The media conditions match the two layouts;
// the browser downloads only its visible banners, with the same candidates as <picture>.
export default function BannerPreloads({ banners }: { banners: HomepageBanner[] }) {
  const first = banners[0];
  if (!first) return null;
  return <>
    <link rel="preconnect" href="https://api.cocktaildesign.ru" />
    <link rel="preload" as="image" media="not all and (max-width: 600px)"
      href={first.desktopUrl} imageSrcSet={first.desktopSrcSet} imageSizes={first.editorial ? HERO_ART_SIZES : "100vw"} fetchPriority="high" />
    <link rel="preload" as="image" media="(max-width: 600px)"
      href={first.mobileUrl} imageSrcSet={first.mobileSrcSet} imageSizes="86vw" fetchPriority="high" />
  </>;
}
