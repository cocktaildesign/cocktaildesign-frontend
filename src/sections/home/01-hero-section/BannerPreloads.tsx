import { HERO_ART_SIZES } from "@/components/ui/slider/HeroBannerContent";
import { STARTUP_ART_SIZES } from "@/components/ui/slider/StartupBannerContent";
import type { HomepageBanner } from "@/lib/api/homepage-banners/model";

// React hoists these to <head>. The media conditions match the two layouts;
// the browser downloads only its visible banners, with the same candidates as <picture>.
export default function BannerPreloads({ banners }: { banners: HomepageBanner[] }) {
  const first = banners[0];
  if (!first) return null;
  const startup = first.editorial?.presentation === "startup";
  return <>
    <link rel="preconnect" href="https://api.cocktaildesign.ru" />
    <link rel="preload" as="image" media="not all and (max-width: 600px)"
      href={first.desktopUrl} imageSrcSet={first.desktopSrcSet} imageSizes={startup ? STARTUP_ART_SIZES : first.editorial ? HERO_ART_SIZES : "100vw"} fetchPriority="high" />
    <link rel="preload" as="image" media="(max-width: 600px)"
      href={first.mobileUrl} imageSrcSet={first.mobileSrcSet} imageSizes={startup ? STARTUP_ART_SIZES : "86vw"} fetchPriority="high" />
  </>;
}
