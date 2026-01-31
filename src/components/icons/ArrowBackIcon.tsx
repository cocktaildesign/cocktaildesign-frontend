import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function ArrowBackIcon({ title = "Назад", ...props }: Props) {
  return (
    <svg
      width="9"
      height="15"
      viewBox="0 0 9 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <path
        d="M1.5 8.36395L2.5 8.36395L2.5 6.36395L1.5 6.36395L1.5 7.36395L1.5 8.36395ZM0.292893 6.65685C-0.0976311 7.04737 -0.0976311 7.68053 0.292893 8.07106L6.65685 14.435C7.04738 14.8255 7.68054 14.8255 8.07107 14.435C8.46159 14.0445 8.46159 13.4113 8.07107 13.0208L2.41421 7.36395L8.07107 1.7071C8.46159 1.31657 8.46159 0.68341 8.07107 0.292885C7.68054 -0.097639 7.04738 -0.0976391 6.65685 0.292885L0.292893 6.65685ZM1.5 7.36395L1.5 6.36395L1 6.36395L1 7.36395L1 8.36395L1.5 8.36395L1.5 7.36395Z"
        fill="currentColor"
      />
    </svg>
  );
}
