import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function ShareIcon({ title = "Поделиться", ...props }: Props) {
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
        fill="currentColor"
        fillRule="nonzero"
        d="M11.996 3.725A2.15 2.15 0 0 0 10 5.87l-.001 2.117-.02.005a9.904 9.904 0 0 0-7.827 10.721c.083.811 1.116 1.103 1.611.455l.187-.237a9.08 9.08 0 0 1 5.836-3.265l.213-.026.001 2.494a2.15 2.15 0 0 0 3.476 1.692l7.824-6.132a2.15 2.15 0 0 0 0-3.384l-7.824-6.132a2.15 2.15 0 0 0-1.326-.458zm.154 1.795a.35.35 0 0 1 .216.075l7.824 6.132a.35.35 0 0 1 0 .55l-7.824 6.133a.35.35 0 0 1-.566-.276l-.001-3.447a.9.9 0 0 0-.915-.9l-.233.004-.342.017a10.9 10.9 0 0 0-6.119 2.365l-.174.144.024-.135a8.1 8.1 0 0 1 6.968-6.537.9.9 0 0 0 .791-.893L11.8 5.87a.35.35 0 0 1 .35-.35"
      />
    </svg>
  );
}
