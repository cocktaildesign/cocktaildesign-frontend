import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function YandexIcon({ title = "Яндекс", ...props }: Props) {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <g clipPath="url(#clip0_838_492)">
        <path
          d="M29 14.5C29 6.49154 22.5085 0 14.5 0C6.49154 0 0 6.49154 0 14.5C0 22.5085 6.49154 29 14.5 29C22.5085 29 29 22.5085 29 14.5Z"
          fill="#F8604A"
        />
        <path
          d="M19.575 23.2243H16.6504V8.11981H15.177C12.6629 8.11981 11.407 9.37684 11.407 11.2618C11.407 13.3643 12.2525 14.4028 14.1375 15.6598L15.612 16.6993L11.4304 23.1998H8.07202L12.0595 17.3273C9.76294 15.6598 8.50702 14.1853 8.50702 11.4548C8.50702 8.09527 10.8025 5.7998 15.225 5.7998H19.575V23.2243Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_838_492">
          <rect width="29" height="29" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
