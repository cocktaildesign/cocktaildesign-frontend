import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "./site";

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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
    // images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — барное оборудование`,
    description: SITE_DESCRIPTION,
    // images: ["/og.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export function pageMetadata(input: { title: string; description?: string; canonical: string }): Metadata {
  return {
    title: input.title,
    description: input.description ?? SITE_DESCRIPTION,
    alternates: { canonical: input.canonical },
  };
}
