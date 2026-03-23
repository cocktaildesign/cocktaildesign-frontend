import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "./site";

export const viewport: Viewport = {
  themeColor: "#ffffff",
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

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

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
}): Metadata {
  const description = input.description ?? SITE_DESCRIPTION;

  return {
    title: input.title,
    description,
    alternates: { canonical: input.canonical },

    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: SITE_NAME,
      url: input.canonical,
      title: input.title,
      description,
      images: input.image ? [{ url: input.image, alt: input.title }] : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: input.image ? [input.image] : undefined,
    },
  };
}
