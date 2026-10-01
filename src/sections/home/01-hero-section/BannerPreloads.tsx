import type { HomepageBanner } from "@/lib/api/homepage-banners/model";

// React hoists these to <head>. The media conditions match the two layouts;
// the browser downloads only its visible banners, with the same candidates as <picture>.
export default function BannerPreloads({ banners }: { banners: HomepageBanner[] }) {
  const first = banners[0];
  if (!first) return null;
  return <>
    <link rel="preconnect" href="https://api.cocktaildesign.ru" />
    <link rel="preload" as="image" media="not all and (max-width: 600px)"
      href={first.desktopUrl} imageSrcSet={first.desktopSrcSet} imageSizes="100vw" fetchPriority="high" />
    {banners.slice(0, 2).map(banner => <link key={banner.id} rel="preload" as="image"
      media="(max-width: 600px)" href={banner.mobileUrl}
      imageSrcSet={banner.mobileSrcSet} imageSizes="42vw" fetchPriority="high" />)}
  </>;
}
