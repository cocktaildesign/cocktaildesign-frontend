import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function MenuIcon({ title = "Меню", ...props }: Props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <path
        d="M5 5H8.24999V8.24999H5V5ZM9.54999 5H12.8V8.24999H9.54999V5ZM5 9.54999H8.24999V12.8H5V9.54999ZM9.54999 9.54999H12.8V12.8H9.54999V9.54999Z"
        fill="currentColor"
      />
      <path
        d="M16.2 0H1.8C1.32261 0 0.864773 0.189642 0.527208 0.527208C0.189642 0.864773 0 1.32261 0 1.8V16.2C0 16.6774 0.189642 17.1352 0.527208 17.4728C0.864773 17.8104 1.32261 18 1.8 18H16.2C16.6774 18 17.1352 17.8104 17.4728 17.4728C17.8104 17.1352 18 16.6774 18 16.2V1.8C18 1.32261 17.8104 0.864773 17.4728 0.527208C17.1352 0.189642 16.6774 0 16.2 0ZM16.2 16.2H1.8V1.8H16.2V16.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
