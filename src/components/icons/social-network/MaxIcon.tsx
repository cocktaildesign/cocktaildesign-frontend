import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function MaxIcon({ title = "Max", ...props }: Props) {
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

      <g clipPath="url(#clip0_839_1158)">
        <g clipPath="url(#clip1_839_1158)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.2441 23.1058C9.99392 23.1058 8.9482 22.7773 7.13052 21.4633C5.98078 22.9415 2.33994 24.0968 2.18116 22.1203C2.18116 20.6366 1.85267 19.3828 1.48037 18.0141C1.0369 16.3278 0.533203 14.4499 0.533203 11.7288C0.533203 5.23007 5.8658 0.340942 12.1839 0.340942C18.5075 0.340942 23.4623 5.47097 23.4623 11.7891C23.4835 18.0095 18.4645 23.0726 12.2441 23.1058ZM12.3372 5.95824C9.26027 5.79947 6.86225 7.92923 6.33118 11.2689C5.89318 14.0338 6.67062 17.4009 7.33309 17.5761C7.65064 17.6527 8.44998 17.0067 8.9482 16.5085C9.77204 17.0776 10.7314 17.4194 11.7295 17.4994C14.9177 17.6528 17.6419 15.2256 17.8559 12.0409C17.9806 8.84948 15.5258 6.14635 12.3372 5.96372L12.3372 5.95824Z"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_839_1158">
          <rect width="24" height="24" fill="white" />
        </clipPath>
        <clipPath id="clip1_839_1158">
          <rect x="-3" y="-3.24414" width="30" height="30" rx="4.05405" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
