import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function PhoneIcon({ title = "Телефон", ...props }: Props) {
  return (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0033 14.7577L15.7082 10.9549C16.2649 10.3843 16.4046 9.57231 16.0694 8.84806L12.4861 1.09474C12.131 0.328602 11.3488 -0.098341 10.5129 0.0193378L1.9117 1.22442C1.08968 1.34014 0.461247 1.94669 0.315578 2.76467C-2.94648 21.2659 19.7326 43.9446 38.2353 40.6803C39.0534 40.5367 39.6599 39.9082 39.7756 39.0862L40.9807 30.485C41.0984 29.6491 40.6714 28.8649 39.9053 28.5118L32.1499 24.9285C31.4256 24.5953 30.6136 24.733 30.043 25.2896L26.2403 28.9946C25.6936 29.5274 24.9294 29.679 24.2212 29.3937C19.3091 27.4185 13.579 21.6904 11.606 16.7784C11.3186 16.0682 11.4705 15.3044 12.0033 14.7577Z"
        fill="currentColor"
      />
    </svg>
  );
}
