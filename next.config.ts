import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
    ],
    // Разрешаем загрузку картинок с локальных адресов
    // Это нужно только для разработки (localhost)
    // На продакшене этой строки не будет
    dangerouslyAllowSVG: false,
    unoptimized: true,
  },
};

export default nextConfig;
