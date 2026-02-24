import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // локальный Strapi для разработки
        protocol: "http",
        hostname: "localhost",
        port: "1337",

        // pathname не обязателен, но можно добавить:
        // pathname: "/uploads/**",
      },

      {
        // продакшен Strapi на твоей VM
        protocol: "http",
        hostname: "89.108.66.180",

        // важно: разрешаем только uploads (безопаснее)
        pathname: "/uploads/**",
      },
    ],

    // SVG запрещаем (безопасная практика)
    dangerouslyAllowSVG: false,

    // unoptimized=true отключает optimization next/image
    // Это нормально для Strapi, чтобы избежать проблем с proxy и Vercel optimization.
    unoptimized: true,
  },
};

export default nextConfig;
