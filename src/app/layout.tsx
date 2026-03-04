import type { ReactNode } from "react";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import GridOverlay from "@/components/layout/GridOverlay";
import ScrollToTopInstant from "@/components/layout/ScrollToTopInstant";

export { rootMetadata as metadata } from "@/lib/seo/metadata";
import { hikasamiSans, montserrat } from "@/lib/fonts";

import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${hikasamiSans.variable}`}>
      <body>
        <ScrollToTopInstant />
        <Header />
        {children}
        <Footer />
        <GridOverlay />
      </body>
    </html>
  );
}
