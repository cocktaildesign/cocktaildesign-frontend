import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function TelegramIcon({ title = "Telegram", ...props }: Props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <g clipPath="url(#clip0_844_1492)">
        <path
          d="M10.6372 21.2743C16.5119 21.2743 21.2743 16.5119 21.2743 10.6372C21.2743 4.76242 16.5119 0 10.6372 0C4.76242 0 0 4.76242 0 10.6372C0 16.5119 4.76242 21.2743 10.6372 21.2743Z"
          fill="#3F91E3"
        />
        <path
          d="M14.6636 7.21071C14.7421 6.68312 14.2593 6.26669 13.8078 6.47265L4.81508 10.5748C4.49129 10.7225 4.51498 11.2321 4.85079 11.3432L6.70529 11.9568C7.05928 12.0739 7.44252 12.0133 7.75163 11.7914L11.9328 8.79023C12.0589 8.69971 12.1963 8.88599 12.0886 9.00134L9.07888 12.2252C8.78693 12.538 8.84486 13.068 9.19608 13.2967L12.5657 15.4922C12.9437 15.7384 13.4299 15.4911 13.5006 15.0165L14.6636 7.21071Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_844_1492">
          <rect width="21.2743" height="21.2743" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
