import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

export const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sans",
});

export const hikasamiSans = localFont({
  src: [
    {
      path: "../assets/fonts/hikasami/Hikasami-VF.ttf",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-display",
});
