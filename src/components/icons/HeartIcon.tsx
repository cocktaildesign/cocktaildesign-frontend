import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function HeartIcon({ title, ...props }: Props) {
  return (
    <svg
      width="21"
      height="19"
      viewBox="0 0 21 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M15.292 0.750017C16.616 0.750017 17.86 1.26602 18.796 2.20102C19.7242 3.13093 20.2455 4.39113 20.2455 5.70502C20.2455 7.0189 19.7242 8.2791 18.796 9.20902L10.498 17.508L2.199 9.20902C1.27112 8.27914 0.75 7.01915 0.75 5.70552C0.75 4.39188 1.27112 3.13189 2.199 2.20202C2.65804 1.74032 3.20409 1.37425 3.80556 1.12501C4.40702 0.875777 5.05195 0.748319 5.703 0.750017C7.027 0.750017 8.271 1.26602 9.207 2.20102L9.967 2.96102L10.498 3.49202L11.028 2.96102L11.788 2.20102C12.2472 1.73963 12.7933 1.37384 13.3948 1.12478C13.9962 0.87573 14.641 0.748353 15.292 0.750017Z"
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}
