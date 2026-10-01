import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "./site";
import { canIndex, cleanPageTitle, descriptionText, robotsPolicy } from "./policy";

export const indexingEnabled = canIndex(siteUrl, process.env.SEO_INDEXING_ENABLED);

export const viewport: Viewport = {
  themeColor: "#e0e7ef",
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: `${SITE_NAME} — барное оборудование`,
    template: `%s — ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  alternates: {
    canonical: "/",
  },

  robots: robotsPolicy(indexingEnabled),

  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — барное оборудование`,
    description: SITE_DESCRIPTION,
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — барное оборудование`,
    description: SITE_DESCRIPTION,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export function pageMetadata(input: {
  title: string;
  description?: string;
  canonical: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const description = descriptionText(input.description?.trim() || SITE_DESCRIPTION);
  const title = cleanPageTitle(input.title);

  return {
    title: { absolute: `${title} — ${SITE_NAME}` },
    description,
    alternates: { canonical: input.canonical },
    robots: robotsPolicy(indexingEnabled && !input.noindex),

    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: SITE_NAME,
      url: input.canonical,
      title,
      description,
      images: input.image ? [{ url: input.image, alt: input.title }] : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: input.image ? [input.image] : undefined,
    },
  };
}
