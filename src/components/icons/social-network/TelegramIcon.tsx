import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function TelegramIcon({ title = "Telegram", ...props }: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <path
        d="M23.5041 2.8407C23.6873 1.61415 22.5614 0.646035 21.5084 1.12486L0.536368 10.6615C-0.218731 11.0049 -0.163494 12.1896 0.619657 12.4479L4.94455 13.8744C5.77009 14.1466 6.66384 14.0058 7.3847 13.49L17.1356 6.5128C17.4297 6.30236 17.7502 6.73543 17.4989 7.00358L10.48 14.4985C9.79912 15.2257 9.93424 16.4577 10.7533 16.9896L18.6117 22.0936C19.4931 22.666 20.627 22.091 20.7918 20.9877L23.5041 2.8407Z"
        fill="currentColor"
      />
    </svg>
  );
}
