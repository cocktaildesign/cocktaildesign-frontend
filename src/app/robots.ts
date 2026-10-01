import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";
import { canIndex } from "@/lib/seo/policy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: canIndex(siteUrl, process.env.SEO_INDEXING_ENABLED)
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
