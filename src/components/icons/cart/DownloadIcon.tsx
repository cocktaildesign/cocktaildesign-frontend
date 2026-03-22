import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function DownloadIcon({ title = "Скачать", ...props }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}>
      {!!title && <title>{title}</title>}

      {/* Стрелка вниз */}
      <path
        d="M22.59 39.41C21.81 38.63 21.81 37.36 22.59 36.58C23.37 35.8 24.64 35.8 25.42 36.58L30 41.17V2C30 0.89 30.9 0 32 0C33.1 0 34 0.89 34 2V41.17L38.59 36.58C39.37 35.8 40.64 35.8 41.42 36.58C42.2 37.36 42.2 38.63 41.42 39.41L33.42 47.41C33.02 47.8 32.51 48 32 48C31.49 48 30.98 47.8 30.59 47.41L22.59 39.41Z"
        fill="currentColor"
      />

      {/* Контейнер / рамка */}
      <path
        d="M56 0H48C46.9 0 46 0.89 46 2C46 3.11 46.9 4 48 4H56C58.21 4 60 5.79 60 8V56C60 58.21 58.21 60 56 60H8C5.79 60 4 58.21 4 56V8C4 5.79 5.79 4 8 4H16C17.1 4 18 3.11 18 2C18 0.89 17.1 0 16 0H8C3.59 0 0 3.59 0 8V56C0 60.41 3.59 64 8 64H56C60.41 64 64 60.41 64 56V8C64 3.59 60.41 0 56 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
