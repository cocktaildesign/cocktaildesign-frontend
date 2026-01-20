import type { SVGProps } from "react";

export default function TelegramBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id="tg_grad" x1="12" y1="0" x2="12" y2="24">
          <stop stopColor="#21B4FE" />
          <stop offset="1" stopColor="#007DBB" />
        </linearGradient>
        <clipPath id="tg_clip">
          <rect width="24" height="24" />
        </clipPath>
      </defs>

      <g clipPath="url(#tg_clip)">
        <circle cx="12" cy="12" r="12" fill="url(#tg_grad)" />
        <path
          d="M18.806 7.036c.107-.69-.55-1.235-1.163-.966L5.422 11.31c-.44.193-.408.86.05 1.006l2.52.803c.481.153 1.002.074 1.422-.217l5.68-3.922c.172-.119.359.126.212.277l-4.087 4.215c-.396.409-.318 1.102.158 1.4l4.58 2.87c.514.322 1.175-.002 1.27-.624l1.579-10.082Z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}
