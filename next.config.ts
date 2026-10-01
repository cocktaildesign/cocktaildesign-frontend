import type { NextConfig } from "next";
import legacyRedirects from "./src/lib/seo/legacy-redirects.json";

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(legacyRedirects).map(([source, destination]) => ({
      source, destination, permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      // dev: локальный Strapi
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },

      // prod: Strapi на VM через HTTPS + поддомен
      {
        protocol: "https",
        hostname: "api.cocktaildesign.ru",
        pathname: "/uploads/**",
      },
    ],

    dangerouslyAllowSVG: false,

    // Пока оставляем как есть (у тебя уже работает локально).
    // Позже решим, включать ли оптимизацию на проде.
    unoptimized: true,
  },
};

export default nextConfig;
