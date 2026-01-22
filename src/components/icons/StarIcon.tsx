import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function StarIcon({ title = "Звезда", ...props }: Props) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <g clipPath="url(#clip0_838_469)">
        <path
          d="M8.14599 4.42495L6.75017 1.25147C6.65169 1.02751 6.34814 1.02751 6.24967 1.25147L4.85386 4.42495C4.81371 4.51623 4.73123 4.57907 4.63604 4.59091L1.32674 5.00239C1.0932 5.03143 0.999403 5.33416 1.17207 5.5016L3.61872 7.87443C3.68909 7.94268 3.7206 8.04435 3.70192 8.14293L3.05245 11.5708C3.00662 11.8127 3.25217 11.9998 3.45739 11.8793L6.36532 10.1723C6.44895 10.1232 6.55089 10.1232 6.63452 10.1723L9.54246 11.8793C9.74764 11.9998 9.99324 11.8127 9.94736 11.5708L9.2979 8.14293C9.27927 8.04435 9.31074 7.94268 9.3811 7.87443L11.8278 5.5016C12.0004 5.33416 11.9066 5.03143 11.6731 5.00239L8.36379 4.59091C8.26862 4.57907 8.18613 4.51623 8.14599 4.42495Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.8125"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_838_469">
          <rect width="13" height="13" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
