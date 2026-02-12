import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function PersonIcon({ title = "Физическое лицо", ...props }: Props) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <path
        d="M1 18.25V15.25C1 14.2554 1.39509 13.3016 2.09835 12.5983C2.80161 11.8951 3.75544 11.5 4.75 11.5H13.75C14.7446 11.5 15.6984 11.8951 16.4017 12.5983C17.1049 13.3016 17.5 14.2554 17.5 15.25V18.25M13 4.75C13 5.74456 12.6049 6.69839 11.9017 7.40165C11.1984 8.10491 10.2446 8.5 9.25 8.5C8.25544 8.5 7.30161 8.10491 6.59835 7.40165C5.89509 6.69839 5.5 5.74456 5.5 4.75C5.5 3.75544 5.89509 2.80161 6.59835 2.09835C7.30161 1.39509 8.25544 1 9.25 1C10.2446 1 11.1984 1.39509 11.9017 2.09835C12.6049 2.80161 13 3.75544 13 4.75Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
