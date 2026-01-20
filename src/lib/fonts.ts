import { Jura, Manrope } from "next/font/google";

export const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sans",
});

export const jura = Jura({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-display",
});
