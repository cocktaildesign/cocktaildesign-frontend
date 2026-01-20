import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function InfoIcon({ title = "Информация", ...props }: Props) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <path
        d="M10.49 16.5V15M7.5 8.25C7.50027 7.71339 7.64447 7.18668 7.91756 6.72476C8.19065 6.26284 8.58264 5.88262 9.05266 5.62373C9.52269 5.36485 10.0536 5.23678 10.5899 5.25286C11.1263 5.26895 11.6485 5.4286 12.1022 5.71519C12.5559 6.00177 12.9244 6.4048 13.1693 6.88225C13.4142 7.35971 13.5266 7.89411 13.4947 8.42978C13.4628 8.96544 13.2878 9.48274 12.988 9.92777C12.6882 10.3728 12.2745 10.7293 11.79 10.96C11.01 11.33 10.5 12.12 10.5 12.99V13.5M20.25 10.5C20.25 15.885 15.885 20.25 10.5 20.25C5.115 20.25 0.75 15.885 0.75 10.5C0.75 5.115 5.115 0.75 10.5 0.75C15.885 0.75 20.25 5.115 20.25 10.5Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeMiterlimit={10}
      />
    </svg>
  );
}
