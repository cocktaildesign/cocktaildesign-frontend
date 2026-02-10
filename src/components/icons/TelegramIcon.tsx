import type { SVGProps } from "react";

export default function TelegramBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}>
      <defs>
        <clipPath id="tg_clip">
          <rect width="23.2" height="23.2" fill="white" />
        </clipPath>
      </defs>

      <g clipPath="url(#tg_clip)">
        <path
          d="M11.6 23.2C18.0065 23.2 23.2 18.0065 23.2 11.6C23.2 5.1935 18.0065 0 11.6 0C5.1935 0 0 5.1935 0 11.6C0 18.0065 5.1935 23.2 11.6 23.2Z"
          fill="#0F172A"
        />
        <path
          d="M15.9908 7.86343C16.0764 7.28809 15.5499 6.83396 15.0576 7.05857L5.25081 11.532C4.89772 11.6931 4.92355 12.2488 5.28976 12.3699L7.31213 13.0391C7.69816 13.1668 8.11609 13.1007 8.45317 12.8588L13.0128 9.58593C13.1503 9.48721 13.3002 9.69036 13.1827 9.81614L9.90056 13.3319C9.58218 13.6729 9.64536 14.2509 10.0284 14.5004L13.7031 16.8945C14.1152 17.163 14.6454 16.8933 14.7225 16.3758L15.9908 7.86343Z"
          fill="white"
        />
      </g>
    </svg>
  );
}
